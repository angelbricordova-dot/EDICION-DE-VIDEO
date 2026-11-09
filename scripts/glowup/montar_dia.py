"""Tiempos y sonido de un episodio de Toño (docs/glowup.md).

Antes:
  1. voz con pausas: scripts/comun/voz_elevenlabs.py (con permiso de Angel) + scripts/glowup/pausas.py
  2. palabras: /home/user/tts/venv-asr/bin/python scripts/comun/transcribir.py <voz.mp3 a 16 kHz> public/glowup/diaN/palabras.json
     (sobre la voz SIN pausas: aquí se desplazan a la línea de tiempo con pausas)
Uso:
    python3 scripts/glowup/montar_dia.py 0
Escribe src/glowup/diaN.json (frases y palabras en tiempo del reel, lo lee Remotion) y
public/glowup/diaN/mezcla.wav (voz + música debajo + efectos, −14 LUFS).
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from musica import poner_musica  # noqa: E402
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
SFX = RAIZ / "public/comun/sfx/mixkit"
MUSICA = RAIZ / "public/comun/musica/mixkit"

# Por episodio: palabras clave (amarillo), palabras de dinero (verde), cola tras la última
# frase, música y efectos (frase o "@palabra", segundos desde su inicio, sonido, dB).
EPISODIOS = {
    0: {
        "claves": ["toño", "mamá", "gta", "vi", "juego", "primero", "vender", "trabajo", "sígueme", "uno"],
        "dinero": ["cero", "pesos", "mil", "dólares"],
        "cola": 1.2,
        "musica": ("comical.mp3", 0.0),
        "efectos": [
            ("este", -0.15, "mosca.mp3", -16),
            ("edad", -0.05, "barrido-2.mp3", -14),
            ("mama", 0.55, "pop-duro.mp3", -12),
            ("gta", -0.05, "notificacion.mp3", -8),
            ("gta", 0.35, "boing.mp3", -14),
            ("juego", -0.05, "barrido-3.mp3", -14),
            ("juego", 0.35, "trombon-triste.mp3", -12),
            ("@cero", -0.05, "fracaso-grave.mp3", -10),
            ("meta", -0.08, "barrido-1.mp3", -12),
            ("meta", 0.0, "golpe-2.mp3", -8),
            ("@15", -0.03, "golpe-1.mp3", -12),
            ("@mil", -0.03, "golpe-3.mp3", -8),
            ("@mil", 0.05, "../chaching.mp3", -8),
            ("pregunta", 0.0, "pop-2.mp3", -10),
            ("opciones", 0.55, "pop-3.mp3", -10),
            ("opciones", 2.1, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
    1: {
        "claves": ["toño", "votaron", "trabajar", "uno", "currículum", "fortnite", "rechazado", "mamá", "platos", "brayan", "gta", "vi", "apostarlos", "turnos", "sígueme", "dos", "primer", "trabajo", "arranca", "14", "días"],
        "dinero": ["20", "dólares", "0", "pesos", "mil"],
        "cola": 1.2,
        "musica": ("kidding-around.mp3", 0.0),
        "reemplazos": {"brian": "Brayan"},
        "efectos": [
            ("resumen", 0.0, "barrido-5.mp3", -14),
            ("@0", -0.03, "fracaso-grave.mp3", -12),
            ("@14", -0.03, "golpe-1.mp3", -10),
            ("@mil", -0.03, "golpe-3.mp3", -9),
            ("@mil", 0.05, "../chaching.mp3", -12),
            ("votaron", -0.05, "golpe-2.mp3", -8),
            ("@trabajar", -0.03, "acierto.mp3", -14),
            ("dia", -0.05, "barrido-1.mp3", -12),
            ("cv", -0.05, "barrido-2.mp3", -14),
            ("@rechazado", -0.02, "golpe-1.mp3", -9),
            ("@rechazado#2", -0.02, "golpe-3.mp3", -9),
            ("@rechazado#3", -0.02, "golpe-1.mp3", -8),
            ("@rechazado#3", 0.3, "fracaso-grave.mp3", -12),
            ("mama", 0.1, "pop-duro.mp3", -12),
            ("@lavar", -0.08, "barrido-3.mp3", -13),
            ("horas", -0.05, "barrido-4.mp3", -13),
            ("paga", -0.02, "../chaching.mp3", -8),
            ("paga", 0.15, "../monedas.mp3", -14),
            ("leccion", 0.0, "pop-1.mp3", -12),
            ("primo", 0.9, "notificacion.mp3", -8),
            ("@reservó", 0.2, "trombon-triste.mp3", -14),
            ("pregunta", 0.0, "pop-2.mp3", -10),
            ("@apostarlos", -0.03, "pop-3.mp3", -10),
            ("@pedir", -0.03, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
    2: {
        "claves": ["toño", "votaron", "turnos", "dos", "noche", "dieciséis", "16", "lunes", "fiebre", "tos", "estornuda", "farmacia", "disciplina", "horario", "descanso", "factura", "garaje", "ejercicio", "sígueme", "tres", "3", "13", "días"],
        "dinero": ["20", "veinte", "dólares", "40", "60", "sesenta", "30", "treinta", "mil"],
        "cola": 1.2,
        "musica": ("kidding-around.mp3", 20.0),
        "reemplazos": {},
        "efectos": [
            ("resumen", 0.0, "barrido-5.mp3", -14),
            ("@20", -0.03, "golpe-1.mp3", -11),
            ("@13", -0.03, "golpe-1.mp3", -10),
            ("@mil", -0.03, "golpe-3.mp3", -9),
            ("votaron", -0.05, "golpe-2.mp3", -8),
            ("dia", -0.05, "barrido-1.mp3", -12),
            ("turnos", 0.0, "barrido-2.mp3", -14),
            ("horas", -0.05, "barrido-4.mp3", -13),
            ("paga", 0.6, "../chaching.mp3", -8),
            ("paga", 0.8, "../monedas.mp3", -14),
            ("paga", 2.2, "acierto.mp3", -14),
            ("lunes", 0.0, "fracaso-grave.mp3", -10),
            ("fiebre", 1.6, "boing.mp3", -12),
            ("casa", -0.03, "golpe-3.mp3", -10),
            ("farmacia", 0.4, "../impresora.mp3", -16),
            ("baja", 0.3, "trombon-triste.mp3", -12),
            ("disciplina", 0.9, "acierto.mp3", -11),
            ("leccion", 0.0, "pop-1.mp3", -12),
            ("cambiar", 0.0, "pop-2.mp3", -12),
            ("@ordenar", -0.03, "pop-3.mp3", -10),
            ("@hacer", -0.03, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
    3: {
        "claves": ["toño", "votaron", "garaje", "tres", "3", "polvo", "arañas", "chaqueta", "internet", "bici", "consola", "brayan", "lavadora", "error", "mamá", "lección", "precio", "gurú", "millonario", "youtube", "gratis", "sígueme", "cuatro", "4", "12", "días", "gta", "vi"],
        "dinero": ["30", "treinta", "dólares", "10", "40", "35", "60", "85", "50", "mil", "dinero"],
        "cola": 1.2,
        "musica": ("fun-and-games.mp3", 0.0),
        "reemplazos": {"brian": "Brayan"},
        "efectos": [
            ("resumen", 0.0, "barrido-5.mp3", -14),
            ("@30", -0.03, "golpe-1.mp3", -11),
            ("@12", -0.03, "golpe-1.mp3", -10),
            ("@mil", -0.03, "golpe-3.mp3", -9),
            ("@mil", 0.05, "../chaching.mp3", -12),
            ("votaron", -0.05, "golpe-2.mp3", -8),
            ("dia", -0.05, "barrido-1.mp3", -12),
            ("polvo", 0.0, "aire-1.mp3", -12),
            ("@arañas", -0.05, "boing.mp3", -12),
            ("@cajas", -0.05, "barrido-3.mp3", -13),
            ("@encuentra", -0.05, "acierto.mp3", -12),
            ("@40", 0.05, "../chaching.mp3", -9),
            ("@fotos", -0.05, "clic-3.mp3", -8),
            ("@fotos", 0.3, "clic-3.mp3", -9),
            ("@fotos", 0.65, "clic-3.mp3", -9),
            ("@encuentra", -0.3, "aire-2.mp3", -15),
            ("@35", 0.7, "barrido-2.mp3", -13),
            ("@publica", 0.0, "pop-1.mp3", -11),
            ("@publica", 0.35, "pop-2.mp3", -11),
            ("@publica", 0.7, "pop-3.mp3", -11),
            ("@bici", -0.05, "barrido-2.mp3", -14),
            ("@35", -0.05, "../chaching.mp3", -8),
            ("consola", 0.3, "notificacion.mp3", -9),
            ("@10#2", -0.05, "pop-4.mp3", -10),
            ("@60", -0.05, "golpe-3.mp3", -8),
            ("@60", 0.35, "trombon-triste.mp3", -13),
            ("@lavadora", -0.05, "pop-duro.mp3", -11),
            ("@error", -0.03, "fracaso-grave.mp3", -10),
            ("@mamá", -0.34, "barrido-4.mp3", -8),
            ("@mamá", -0.08, "golpe-1.mp3", -5),
            ("@mamá", -0.04, "boing.mp3", -12),
            ("@85", -0.05, "../chaching.mp3", -8),
            ("@85", 0.25, "acierto.mp3", -13),
            ("leccion", 0.0, "pop-1.mp3", -12),
            ("@50", -0.05, "../monedas.mp3", -12),
            ("@gastar", -0.05, "pop-3.mp3", -10),
            ("@aprender", -0.05, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
    4: {
        "claves": ["toño", "votaron", "youtube", "gratis", "cuatro", "4", "lamborghini", "cursos", "página", "5", "sofi", "web", "ia", "vender", "clientes", "barbería", "chucho", "pelo", "espejo", "cambiar", "lección", "oro", "buscarlo", "físico", "chatarra", "pizza", "ejercicio", "sígueme", "11", "días", "gta", "vi"],
        "dinero": ["85", "dólares", "50", "135", "mil", "dinero"],
        "cola": 1.2,
        "musica": ("playful.mp3", 0.0),
        "reemplazos": {},
        "partir": {"ahorrarlo": ["ahorrar", "lo"]},
        "efectos": [
            ("resumen", 0.0, "barrido-5.mp3", -14),
            ("@85", -0.03, "golpe-1.mp3", -11),
            ("@11", -0.03, "golpe-1.mp3", -10),
            ("@mil", -0.03, "golpe-3.mp3", -9),
            ("@mil", 0.05, "../chaching.mp3", -12),
            ("votaron", -0.05, "golpe-2.mp3", -8),
            ("dia", -0.05, "barrido-1.mp3", -12),
            ("gurus", 0.0, "clic-4.mp3", -10),
            ("@lamborghini", -0.05, "barrido-4.mp3", -13),
            ("@cursos", 0.1, "fracaso-grave.mp3", -13),
            ("baja", 0.0, "barrido-2.mp3", -13),
            ("@bajando#2", -0.05, "barrido-3.mp3", -13),
            ("@5", -0.03, "golpe-1.mp3", -10),
            ("@sofi", -0.05, "acierto.mp3", -12),
            ("@ia", -0.05, "aire-2.mp3", -13),
            ("vender", 0.0, "pop-2.mp3", -11),
            ("@clientes", -0.03, "pop-duro.mp3", -11),
            ("noche", 0.0, "teclado.mp3", -16),
            ("@barbería", -0.05, "pop-3.mp3", -11),
            ("chucho", 0.0, "barrido-1.mp3", -13),
            ("@50", -0.03, "../chaching.mp3", -8),
            ("@135", -0.03, "golpe-3.mp3", -10),
            ("@135", 0.05, "../monedas.mp3", -14),
            ("@regalo", -0.05, "pop-4.mp3", -11),
            ("@espejo", -0.1, "aire-1.mp3", -14),
            ("cambiar", 0.0, "golpe-2.mp3", -12),
            ("leccion", 0.0, "pop-1.mp3", -12),
            ("pregunta", 0.0, "barrido-3.mp3", -13),
            ("@dejar", -0.03, "pop-3.mp3", -10),
            ("@hacer", -0.03, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
}


def leer(ruta, mono=True):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"],
                           capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


DECENAS = {"veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"}
UNIDADES = {"uno", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"}


def unir_numeros(ps):
    """'treinta y cinco' → una sola palabra (como la escribe whisper: '35')."""
    out, i = [], 0
    while i < len(ps):
        if i + 3 < len(ps) and limpio(ps[i]) == "ciento" and limpio(ps[i + 1]) in DECENAS and limpio(ps[i + 2]) == "y" and limpio(ps[i + 3]) in UNIDADES:
            out.append(" ".join(ps[i:i + 4]))
            i += 4
        elif i + 2 < len(ps) and limpio(ps[i]) in DECENAS and limpio(ps[i + 1]) == "y" and limpio(ps[i + 2]) in UNIDADES:
            out.append(" ".join(ps[i:i + 3]))
            i += 3
        else:
            out.append(ps[i])
            i += 1
    return out


def limpio(p):
    return p.strip(".,;:¿?¡!…").lower()


def main():
    n = int(sys.argv[1])
    cfg = EPISODIOS[n]
    voz_json = json.loads((RAIZ / f"src/glowup/dia{n}-voz.json").read_text())
    lineas = voz_json["lineas"]
    ids = [f["id"] for f in json.loads((RAIZ / f"src/glowup/dia{n}-guion.json").read_text())["frases"]]
    crudas = json.loads((RAIZ / f"public/glowup/dia{n}/palabras.json").read_text())["palabras"]
    # palabras que whisper junta y el guion separa ("ahorrarlo" → "ahorrar lo"): se parten en el tiempo
    partidas = []
    for w in crudas:
        trozos = cfg.get("partir", {}).get(limpio(w["p"]))
        if not trozos:
            partidas.append(w)
            continue
        paso = (w["fin"] - w["ini"]) / len(trozos)
        for i, t in enumerate(trozos):
            partidas.append({**w, "p": t, "ini": round(w["ini"] + i * paso, 3), "fin": round(w["ini"] + (i + 1) * paso, 3)})
    crudas = partidas

    frases = [{"id": i, "texto": l["texto"], "t": l["t2"], "fin": l["fin2"]} for i, l in zip(ids, lineas)]
    # A qué frase pertenece cada palabra: contando palabras del guion (los números de varias
    # palabras, "treinta y cinco", whisper los escribe en una: "35"). Si no cuadra, por tiempo.
    por_frase = [len(unir_numeros(l["texto"].split())) for l in lineas]
    duenos = [i for i, k in enumerate(por_frase) for _ in range(k)] if sum(por_frase) == len(crudas) else None
    palabras, anterior = [], ""
    for j, w in enumerate(crudas):
        if duenos:
            l = lineas[duenos[j]]
        else:  # la última frase que ya empezó, con 0,2 s de margen (whisper marca algo antes)
            l = max((l for l in lineas if l["t"] - 0.2 <= w["ini"]), key=lambda l: l["t"], default=lineas[0])
        d = l["t2"] - l["t"]
        w = {**w, "ini": max(w["ini"], l["t"]), "fin": max(w["fin"], l["t"] + 0.05)}  # nunca antes de su frase
        p = w["p"].replace("¿", "").replace("¡", "").replace("?", "").replace("!", "")
        rep = cfg.get("reemplazos", {}).get(limpio(p))
        if rep:  # whisper escribe distinto un nombre propio
            p = p.lower().replace(limpio(p), rep)
        if limpio(p) == "6" and anterior == "gta":
            p = "VI" + p[1:]
        palabras.append({"p": p, "ini": round(w["ini"] + d, 3), "fin": round(w["fin"] + d, 3),
                         "clave": limpio(p) in cfg["claves"], "dinero": limpio(p) in cfg["dinero"]})
        anterior = limpio(p)
    dur = round(voz_json["duracion2"] + cfg["cola"], 2)

    voz = leer(RAIZ / f"public/glowup/dia{n}/voz-pausas.wav")
    mz = Mezcla(dur)
    mz.poner(0, voz, 1.0)
    pista, desde = cfg["musica"]
    poner_musica(mz, voz, palabras, MUSICA / pista, desde=desde, bajo_voz=-17, huecos=-10, entrada=0.2, salida=0.8)
    inicio = {f["id"]: f["t"] for f in frases}
    def ancla(fid):
        if fid.startswith("@"):  # una palabra ("@palabra" la primera, "@palabra#2" la segunda…)
            p, _, n = fid[1:].partition("#")
            return [w["ini"] for w in palabras if limpio(w["p"]) == p][int(n or 1) - 1]
        return inicio[fid]

    for fid, dt, sonido, gdb in cfg["efectos"]:
        mz.poner(max(0.0, ancla(fid) + dt), leer(SFX / sonido), 10 ** (gdb / 20))
    mz.masterizar(RAIZ / f"public/glowup/dia{n}/mezcla.wav")

    (RAIZ / f"src/glowup/dia{n}.json").write_text(json.dumps({"duracion": dur, "frases": frases, "palabras": palabras}, ensure_ascii=False, indent=1))
    print(f"Día {n}: {dur} s, {len(frases)} frases, {len(palabras)} palabras → src/glowup/dia{n}.json")


if __name__ == "__main__":
    main()
