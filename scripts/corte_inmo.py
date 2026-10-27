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

TOMAS = {
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


def main():
    reel, version = sys.argv[1], sys.argv[2]
    dir_ = RAIZ / "public/tiktok" / reel
    x = leer(dir_ / "audio48k.wav")
    palabras = ordenar(json.loads((dir_ / "palabras-alineadas.json").read_text())["palabras"])
    cortes, out = [], 0.0
    for ini, fin in TOMAS[(reel, version)]:
        for s, e in sin_pausas(x, ini, fin):
            cortes.append({"src": round(s, 3), "dur": round(e - s, 3), "out": round(out, 3)})
            out += e - s
    # Voz montada con fundidos cortos para que no haya clics en los cortes.
    piezas = []
    f = int(FUNDIDO * SR)
    for c in cortes:
        p = x[int(c["src"] * SR) : int((c["src"] + c["dur"]) * SR)].copy()
        p[:f] *= np.linspace(0, 1, f)
        p[-f:] *= np.linspace(1, 0, f)
        piezas.append(p)
    voz = np.concatenate(piezas)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(dir_ / f"voz-{version}.wav")], input=voz.astype(np.float32).tobytes(), check=True)
    # Palabras al tiempo de salida: solo las que están dentro de una toma elegida; si una cae en
    # una pausa recortada se pega al corte siguiente.
    salida = []
    tomas = TOMAS[(reel, version)]
    for w in palabras:
        m = (w["ini"] + w["fin"]) / 2
        if not any(i <= m <= f for i, f in tomas):
            continue
        c = next((c for c in cortes if m <= c["src"] + c["dur"] + 0.02), cortes[-1])
        d = c["out"] - c["src"]
        salida.append({"p": w["p"], "ini": round(max(c["out"], w["ini"] + d), 3), "fin": round(min(c["out"] + c["dur"], max(w["fin"] + d, c["out"] + 0.1)), 3)})
    destino = RAIZ / "src/inmobiliaria" / f"{reel}-{version}.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps({"duracion": round(out, 3), "cortes": cortes, "palabras": salida}, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(cortes)} cortes, {out:.2f} s (de {sum(f - i for i, f in TOMAS[(reel, version)]):.2f} s en tomas) → {destino}")
    print(" ".join(f"{w['p']}[{w['ini']:.2f}]" for w in salida))


if __name__ == "__main__":
    main()
