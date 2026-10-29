"""Corte sin aire de los reels inmobiliarios: tomas elegidas → lista de cortes + voz montada.

Cada toma es un rango [ini, fin] del bruto (segundos), elegido a mano sobre la transcripción
(`public/tiktok/<reel>/palabras-alineadas.json`, ver scripts/alinear.py). Dentro de cada toma
se acortan las pausas largas: cualquier tramo por debajo de UMBRAL dB más largo que PAUSA_MAX
se recorta dejando MARGEN a cada lado (queda una pausa natural de ~0,2 s, no un corte seco), y
el silencio al principio y al final de la toma se deja en ENTRADA / SALIDA.
Las palabras se trasladan al tiempo de salida para los subtítulos.

Salida:
    src/inmobiliaria/<reel>-<version>.json   {cortes: [{src, dur, out}], palabras, duracion}
    public/tiktok/<reel>/voz-<version>.wav    voz montada (fundidos de 8 ms en cada corte)

Uso:
    python3 scripts/corte_inmo.py g6 prueba
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
UMBRAL = -45.0  # dBFS (el ruido de fondo del bruto está en −55 dB)
PAUSA_MAX = 0.32  # pausas más cortas se dejan como están: así suena natural
MARGEN = 0.10
ENTRADA = 0.08
SALIDA = 0.14  # aire tras cada frase, para que respire antes de la siguiente
FUNDIDO = 0.02

# Cuerpo común del reel 6 (las repeticiones "y tres y tres", "y estamos acabando" y la primera
# toma de la conclusión se quedan fuera).
_CUERPO_G6 = [
    (50.66, 63.40),  # Uno, el estado del piso … es dinero que le puedes bajar al precio.
    (69.30, 86.00),  # Dos. La zona … una carretera … te lo hunde.
    (93.85, 108.55),  # Y tres, la que más dinero cuesta: las actas … el piso ya será tuyo.
    (119.25, 130.25),  # Y es que … para no perder dinero. Si vas a comprar … comenta la palabra guía y te mando…
]

# Reel 3 "5 documentos" (guion 3). Se quedan fuera "Reel número 3 / Hook 1 / Hook 2", la
# primera toma del CTA (se corta en "te mando") y "Dale al botón… ¡Gracias!".
_CUERPO_G3 = [
    (19.15, 33.60),  # Primero, una nota simple … Segundo, la referencia catastral … del inmueble.
    (39.20, 52.80),  # Tercero, la cédula … Cuarto, un certificado de la comunidad … derramas aprobadas.
    (58.80, 75.40),  # Y quinto … la inspección técnica de edificios … demanda de alquiler en esa zona.
    (81.60, 86.85),  # Si un piso no tiene problemas pero no hay inquilinos … muchísimo dinero.
    (96.30, 102.40),  # Si vas a comprar tu primer piso de inversión, comenta la palabra guía … invertir.
]

# Reel 8 "ranking de portales" (guion 8, cámara lateral, bruto vertical 4K). Fuera: "Reel
# número 8 / Hook 1 / Hook 2 / Vale, déjame ver / Empezamos", el primer "Mil anuncio", "Vale",
# "Ahora, dale", "Espérate", "Un segundito", el primer "¿Y el número uno?" y las dos primeras
# tomas del cierre.
_CUERPO_G8 = [
    (21.70, 32.25),  # Idealista, número 4 … pero nunca para comprarlo.
    (37.65, 42.95),  # Milanuncios, número 6 … muy poca oportunidad.
    (44.60, 50.80),  # Pisos.com, número 7 … Yo no lo usaría.
    (54.50, 64.15),  # Fotocasa, número 5 … para comprar barato, no.
    (65.20, 71.95),  # Altamira, número 3 … descuentos de verdad.
    (78.30, 85.35),  # Sareb, número 2 … donde más descuentos he visto.
    (90.45, 98.60),  # y el número uno no es un portal … inversor de confianza.
    (103.95, 111.85),  # Y eso es lo que enseño en El Filtro Inmobiliario … te lleguen a ti el primero.
    (121.45, 129.20),  # Y es que en inversión inmobiliaria … Déjame la palabra filtro … lista de espera.
]

# Reel 9 "llamada de la agencia" (guion 9). Instrucciones del cliente dentro del video: la voz
# de Darío (la agencia) distorsionada para que se entienda pero no se reconozca, pitido sobre la
# calle, el barrio y el nombre "Paco", y fuera el "coño" (se usa la toma repetida).
_AG = {"quien": "agencia"}
_LLAMADA_G9 = [
    (24.10, 32.70, _AG),  # Buenos días, Julio. Mira, te llamo porque me ha entrado un piso interesante …
    (38.50, 44.85),  # ¿Qué tal, señor? ¿Cómo estás? … ¿En qué calle estás exactamente?
    (59.85, 67.50, _AG),  # En calle ***, en el barrio de ***. Y no es la mejor zona, pero el piso no está mal.
    (78.30, 85.95),  # Vale, vale, conozco más o menos esa zona … ¿sabéis el motivo de venta?
    (87.15, 98.40, _AG),  # Es una herencia … precio de salida de unos 98.000 euros.
    (107.40, 115.80),  # Vale, más o menos puede cuadrar. Y ahora, tú que sabes más que yo … en esa zona?
    (116.55, 127.75, _AG),  # Pues en Idealista ahora mismo hay un par de pisos a 550 euros …
    (136.90, 143.40),  # Y entiendo que el tema de las cargas está todo controlado … ¿la nota simple ya?
    (144.25, 147.70, _AG),  # Sí, no te preocupes, te la mando en un rato que voy a otra visita.
    (165.45, 168.45),  # Vale, vale, señor, pues gracias por pensar en mí. (toma sin el "coño")
    (171.45, 179.20, _AG),  # Nada, Julio, a ti siempre, pero tienes que decirme algo rápido en 24 horas …
    (188.60, 193.30),  # Tranquilo, ***, como siempre, te contesto cuanto antes, ¿vale? No tardo, un abrazo.
]
_CIERRE_G9 = [
    (204.90, 211.40),  # ¿Veis? Esto no me interesa … la rentabilidad no supera el 6 % neto.
    (218.50, 225.10),  # Pero fijaos en lo importante … no está todavía en ningún portal.
    (228.90, 233.20),  # Pero claro, que sea una exclusiva no significa que sea una buena oportunidad.
    (238.95, 246.20),  # Y es que, para mí, invertir no es encontrar … es descartar … para no perder tiempo.
    (260.40, 268.90),  # Y bueno, sobre todo, lo más importante, saber crear este tipo de relaciones … (2.ª toma)
    (276.90, 286.40),  # Tengo una clase privada de 45 minutos … si me dejas la palabra guía.
]
# Reel 10 "lo que deberías tener a cada edad" (guion 10, pizarra, bruto vertical 4K). Fuera: "Eso
# ha sido el hook / Estamos en el reel número 10", las dos primeras tomas de "9 a 5" ("te hace
# sentir mal", "no te preocupes"), la charla con el socio, el "ya deberías" repetido y el
# "dinero" repetido.
_CUERPO_G10 = [
    (64.25, 67.90),  # Con 25 años ya deberías de tener tu primer piso de inversión.
    (74.45, 75.50),  # Con 30 años
    (76.70, 79.15),  # ya deberías de tener 3. (sin el primer "ya deberías")
    (84.35, 86.70),  # Con 35, un edificio entero.
    (92.35, 95.55),  # Con 40, 15 pisos y una SL a tu nombre.
    (107.85, 112.25),  # Y con 50 años, si no tienes un barrio entero a tu nombre, algo estás haciendo mal.
    (115.90, 118.45),  # A ver, a ver, espérate, que esto es broma, obviamente.
    (123.95, 129.35),  # Pero, por desgracia, esto es lo que te venden cada día por redes, ¿vale?
    (162.95, 171.70),  # Y si eres de esas personas que trabaja de 9 a 5 … vas tarde a todo. Pero no vas tarde, estate tranquilo.
    (180.50, 183.85),  # El problema de todo esto es que te están enseñando la meta equivocada.
    (190.45, 196.22),  # Yo no te voy a enseñar a que consigas 15 pisos … el dinero que tanto
    (196.57, 197.50),  # te ha costado ahorrar.
    (238.50, 244.65),  # Un piso bien comprado … patrimonio poco a poco.
    (253.25, 259.85),  # Como José Manuel, un alumno con 50 años … 1.950 euros al mes.
    (265.90, 274.90),  # Y es que … no gana el que más pisos acumula, gana el que … puede seguir escalando.
    (296.80, 303.10),  # Así que si quieres empezar por ese primero … si me dejas la palabra guía.
]
# Reel 12 "ranking de bancos para hipotecas" (guion 12, cámara lateral como el 8, con Darío detrás
# de cámara). Fuera: "Listo / Reel número 12 / Hook…", "Vale, un segundito", el primer "BBVA"
# ("te perdés…"), la charla con Darío del "rural", la primera toma de "Número dos, buenos tipos y
# oficina en cual…", los "Espérate / Otros dos / Aquí / Un segundito / Ahora / Y ya sigo yo".
_CUERPO_G12 = [
    (20.60, 26.40),  # Santander, número 4 … no te van a hacer mucho más.
    (27.80, 34.40),  # Trade Republic, número 8 … mejor que cualquier banco normal.
    (41.75, 47.15),  # BBVA, número 7, como Santander pero todavía más difícil sacar la hipoteca.
    (60.55, 61.75),  # Eurocaja Rural,
    (65.90, 71.95),  # número dos. Buenos tipos y oficina en casi cualquier pueblo … te la vas a encontrar.
    (77.50, 83.50),  # ING, número 6 … cuidado con lo que dices.
    (84.90, 90.80),  # Ibercaja, número 3 … tengas mucho dinero o no.
    (95.75, 100.90),  # CaixaBank, número 5 … le cuesta estudiarte.
    (105.50, 106.60),  # ¿Y el número uno?
    (106.85, 112.80),  # Unicaja … puedes tener varias hipotecas a la vez.
    (115.25, 121.65),  # Y es que en inversión inmobiliaria … firmar la segunda hipoteca.
    (127.35, 135.65),  # Para saber cuál te conviene a ti … Comenta la palabra calculadora y te la regalo.
]
PITIDOS = {"g9": [(60.55, 61.25), (63.33, 63.95), (189.28, 189.72)]}

TOMAS = {
    ("g9", "llamada"): [*_LLAMADA_G9, *_CIERRE_G9],
    # Versión 2: mini intro en blanco y negro con las mejores frases y "EN LA LLAMADA…".
    ("g9", "intro"): [
        (26.30, 29.40, {"quien": "agencia", "intro": True}),  # me ha entrado un piso interesante y no lo hemos publicado
        (84.05, 85.95, {"intro": True}),  # ¿sabéis el motivo de venta?
        (173.35, 175.95, {"quien": "agencia", "intro": True}),  # tienes que decirme algo rápido en 24 horas
        *_LLAMADA_G9,
        *_CIERRE_G9,
    ],
    ("g12", "hook1"): [(7.60, 9.85), *_CUERPO_G12],  # HOOK 1: Mejores bancos para sacar una hipoteca
    ("g12", "hook2"): [(11.65, 14.05), *_CUERPO_G12],  # HOOK 2: Ranking de los mejores bancos para hipoteca
    ("g12", "cuerpo"): list(_CUERPO_G12),
    ("g10", "hook1"): [(28.55, 31.45), *_CUERPO_G10],  # HOOK 1: ¿Cuántos pisos deberías de tener según tu edad?
    ("g10", "hook2"): [(48.60, 51.25), *_CUERPO_G10],  # Si no tienes estos pisos según tu edad, vas tarde.
    ("g10", "cuerpo"): list(_CUERPO_G10),  # versión 3: solo el cuerpo
    ("g8", "hook1"): [(8.85, 11.00), *_CUERPO_G8],  # HOOK 1: Mejores sitios para encontrar una casa
    ("g8", "hook2"): [(13.60, 15.95), *_CUERPO_G8],  # HOOK 2: Mejores webs para buscar una casa
    ("g8", "cuerpo"): list(_CUERPO_G8),  # versión 3: empieza directo en el cuerpo
    ("g3", "hook1"): [
        (4.75, 8.40),  # HOOK 1: ¿Vas a comprar una casa? Asegúrate de pedir siempre estas 5 cosas.
        *_CUERPO_G3,
    ],
    ("g3", "hook2"): [
        (10.90, 13.90),  # HOOK 2: Nunca compres una casa sin pedir estas 5 cosas.
        *_CUERPO_G3,
    ],
    ("g6", "prueba"): [
        (41.22, 45.30),  # HOOK 2: Si no revisas estas tres cosas al comprar tu casa, vas a perder dinero.
        (50.66, 63.40),  # Uno, el estado del piso … es dinero que le puedes bajar al precio. (toma seguida)
    ],
    ("g6", "hook1"): [
        (7.30, 15.10),  # HOOK 1: Nunca compres un piso sin saber estas tres cosas … nunca te las van a contar.
        (21.95, 33.95),  # Y atento a la tercera … y sé lo que pasa detrás de lo que no se ve.
        *_CUERPO_G6,
    ],
    ("g6", "hook2"): [
        (41.22, 45.30),  # HOOK 2: Si no revisas estas tres cosas al comprar tu casa, vas a perder dinero.
        *_CUERPO_G6,
    ],
}


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)


def sin_pausas(x, ini, fin):
    """Parte [ini, fin] en tramos con voz, quitando pausas largas."""
    w = int(0.01 * SR)
    a, b = int(ini * SR), int(fin * SR)
    seg = x[a:b]
    n = len(seg) // w
    db = 20 * np.log10(np.sqrt((seg[: n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    bajo = db < UMBRAL
    voz = np.flatnonzero(~bajo)
    if len(voz) == 0:
        return []
    primero, ultimo = voz[0], voz[-1] + 1
    tramos, i, inicio = [], primero, max(0.0, primero * 0.01 - ENTRADA)
    while i < ultimo:
        if bajo[i]:
            j = i
            while j < ultimo and bajo[j]:
                j += 1
            if (j - i) * 0.01 > PAUSA_MAX:
                tramos.append((inicio, i * 0.01 + MARGEN))
                inicio = j * 0.01 - MARGEN
            i = j
        else:
            i += 1
    tramos.append((inicio, min((b - a) / SR, ultimo * 0.01 + SALIDA)))
    # Los trocitos sueltos (clics, respiraciones cortas) no son voz.
    return [(ini + s, ini + e) for s, e in tramos if e - s > 0.12]


def ordenar(palabras):
    """Corrige las pocas palabras que la alineación deja fuera de orden (usa el tiempo de Whisper)."""
    p = [dict(w) for w in palabras]
    for i in range(1, len(p)):
        if p[i]["ini"] < p[i - 1]["ini"]:
            p[i]["ini"] = max(p[i - 1]["ini"] + 0.08, p[i].get("whisper", [p[i]["ini"]])[0])
        elif i + 1 < len(p) and p[i]["ini"] > p[i + 1]["ini"] >= p[i - 1]["ini"]:
            p[i]["ini"] = max(p[i - 1]["ini"] + 0.08, min(p[i].get("whisper", [p[i]["ini"]])[0], p[i + 1]["ini"] - 0.08))
        p[i]["fin"] = max(p[i]["fin"], p[i]["ini"] + 0.06)
    return p


def efecto_telefono(ruta, tono=0.84):
    """Voz "al teléfono" y más grave (pedido de Angel), para que se entienda pero no se reconozca (reel 9)."""
    filtro = f"asetrate={SR}*{tono},aresample={SR},atempo={1 / tono:.6f},highpass=f=330,lowpass=f=3300,acompressor=threshold=-24dB:ratio=3:attack=5:release=80,volume=2.2"
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-af", filtro, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)


def pitido(dur, f=1000.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, np.minimum(t, dur - t) / 0.01)
    # Bajito (≈ −22 dBFS): se nota la censura sin molestar.
    return (0.08 * np.sin(2 * np.pi * f * t) * env).astype(np.float32)


def main():
    reel, version = sys.argv[1], sys.argv[2]
    dir_ = RAIZ / "public/tiktok" / reel
    x = leer(dir_ / "audio48k.wav")
    tel = None
    palabras = ordenar(json.loads((dir_ / "palabras-alineadas.json").read_text())["palabras"])
    # Cada toma es (ini, fin) o (ini, fin, {"quien": "agencia", "intro": True}).
    tomas = [(t[0], t[1], t[2] if len(t) > 2 else {}) for t in TOMAS[(reel, version)]]
    cortes, salida, out = [], [], 0.0
    piezas = []
    f = int(FUNDIDO * SR)
    for ti, (ini, fin, op) in enumerate(tomas):
        mios = []
        for s_, e in sin_pausas(x, ini, fin):
            c = {"src": round(s_, 3), "dur": round(e - s_, 3), "out": round(out, 3), "toma": ti}
            c.update({k: v for k, v in op.items()})
            cortes.append(c)
            mios.append(c)
            out += e - s_
            fuente = x
            if op.get("quien") == "agencia":
                if tel is None:
                    tel = efecto_telefono(dir_ / "audio48k.wav")
                fuente = tel
            pz = fuente[int(s_ * SR) : int(e * SR)].copy()
            # Pitidos sobre lo que no debe oírse (calles, nombres).
            for pa, pb in PITIDOS.get(reel, []):
                a0, b0 = max(pa, s_), min(pb, e)
                if b0 > a0:
                    i0, i1 = int((a0 - s_) * SR), int((b0 - s_) * SR)
                    pz[i0:i1] = pitido((i1 - i0) / SR)[: i1 - i0]
            pz[:f] *= np.linspace(0, 1, f)
            pz[-f:] *= np.linspace(1, 0, f)
            piezas.append(pz)
        # Palabras de esta toma al tiempo de salida (si una cae en una pausa recortada se pega al
        # corte siguiente). Las tapadas con pitido salen como "***".
        for w in palabras:
            m = (w["ini"] + w["fin"]) / 2
            if not (ini <= m <= fin) or not mios:
                continue
            c = next((c for c in mios if m <= c["src"] + c["dur"] + 0.02), mios[-1])
            d = c["out"] - c["src"]
            texto = w["p"]
            if any(pa - 0.05 <= m <= pb + 0.05 for pa, pb in PITIDOS.get(reel, [])):
                texto = "***" + ("," if texto.endswith(",") else "")
            pal = {"p": texto, "ini": round(max(c["out"], w["ini"] + d), 3), "fin": round(min(c["out"] + c["dur"], max(w["fin"] + d, c["out"] + 0.1)), 3)}
            for k in ("quien", "intro"):
                if k in op:
                    pal[k] = op[k]
            salida.append(pal)
    voz = np.concatenate(piezas)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(dir_ / f"voz-{version}.wav")], input=voz.astype(np.float32).tobytes(), check=True)
    destino = RAIZ / "src/inmobiliaria" / f"{reel}-{version}.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps({"duracion": round(out, 3), "cortes": cortes, "palabras": salida}, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(cortes)} cortes, {out:.2f} s (de {sum(b - a for a, b, _ in tomas):.2f} s en tomas) → {destino}")
    print(" ".join(f"{w['p']}[{w['ini']:.2f}]" for w in salida))


if __name__ == "__main__":
    main()
