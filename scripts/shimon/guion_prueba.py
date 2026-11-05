"""Prueba de 30 s de Shimon Geek (docs/shimon.md): escenas ancladas a sus palabras + mezcla.

Uso:
    python3 scripts/shimon/guion_prueba.py
Lee public/shimon/prueba-palabras.json (transcripción de su video, scripts/comun/transcribir.py)
y escribe src/shimon/prueba.json (escenas, rótulos y palabras; lo lee Remotion) y
public/shimon/prueba/mezcla.wav (su voz limpia + música de Dragon Ball debajo + efectos, −14 LUFS).
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
MUSICA = RAIZ / "public/shimon/material/musica/musica anime/dbsuper instrumental.mp3"

# Escenas: (id, palabra donde empieza [o segundos], desplazamiento). Cada una dura hasta la siguiente.
ESCENAS = [
    ("titulo", 0.0, 0),
    ("roca", "todo", -0.06),
    ("razones", "por", -0.04),
    ("fans", "primero", -0.06),
    ("contenido", "sobre", -0.08),
    ("reanimar", "y", -0.05, 8.0),  # el "y" de las 8,12 s
    ("feo", "los", -0.06, 10.0),
    ("camara1", "pero", -0.06),
    ("distinto", "se", -0.04, 15.0),
    ("esencia", "y", -0.05, 16.0),
    ("bills", "cosa", -0.08),
    ("comico", "que", -0.05, 20.7),
    ("serio", "y", -0.06, 25.0),
    ("banco", "y", -0.06, 27.8),
    ("arco", "por", -0.05, 29.9),
    ("personalidad", "porque", -0.06),
]
# Rótulos que golpean justo con la palabra: (palabra, desde, texto, color)
ROTULOS = [
    ("dos", 3.9, "2 RAZONES", "amarillo"),
    ("contenido", 7.0, "¡CONTENIDO NUEVO!", "amarillo"),
    ("reanimar", 8.5, "REANIMAR", "blanco"),
    ("desear", 12.9, "DEJARON QUE DESEAR...", "rojo"),
    ("esencia", 17.5, "MÁS ESENCIA", "amarillo"),
    ("cómico", 22.9, "CÓMICO", "amarillo"),
    ("torpe", 23.6, "TORPE", "amarillo"),
    ("holgazán", 24.3, "HOLGAZÁN", "amarillo"),
    ("serio", 27.2, "SERIO", "rojo"),
    ("banco", 28.8, "YO BANCO ESTE CAMBIO", "verde"),
    ("arco", 30.8, "(EN ESTE ARCO)", "blanco"),
    ("cambiar", 33.9, "¿OTRO PERSONAJE?", "rojo"),
]


def limpio(p):
    return p.strip(".,;:¿?¡!…").lower()


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def main():
    palabras = json.loads((RAIZ / "public/shimon/prueba-palabras.json").read_text())["palabras"]

    def palabra(p, desde=0.0):
        return next(w["ini"] for w in palabras if w["ini"] >= desde - 0.01 and limpio(w["p"]) == p)

    escenas = []
    for e in ESCENAS:
        eid, ancla, dt = e[0], e[1], e[2]
        desde = e[3] if len(e) > 3 else 0.0
        t = ancla if isinstance(ancla, float) else palabra(ancla, desde) + dt
        escenas.append({"id": eid, "t": round(max(0.0, t), 3)})
    rotulos = [{"t": round(palabra(p, d) - 0.03, 3), "texto": tx, "color": c} for p, d, tx, c in ROTULOS]
    dur = round(palabras[-1]["fin"] + 0.45, 2)

    # Sonido: su voz (limpia de graves y un poco comprimida), música debajo, efectos en cada corte y rótulo.
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(RAIZ / "public/shimon/material/prueba.mp4"), "-af",
         "highpass=f=80,afftdn=nr=10,acompressor=threshold=-20dB:ratio=3:attack=10:release=150,loudnorm=I=-16",
         "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    voz = np.frombuffer(crudo, dtype=np.float32).astype(float)[: int(dur * SR)]
    mz = Mezcla(dur)
    mz.poner(0, voz, 1.0)
    poner_musica(mz, voz, palabras, MUSICA, desde=0.0, bajo_voz=-20, huecos=-13, entrada=0.2, salida=0.6)
    barridos = ["barrido-1.mp3", "barrido-2.mp3", "barrido-3.mp3", "barrido-4.mp3", "barrido-5.mp3"]
    for i, e in enumerate(escenas[1:]):
        mz.poner(max(0.0, e["t"] - 0.08), leer(SFX / barridos[i % 5]), 10 ** (-17 / 20))
    for i, r in enumerate(rotulos):
        mz.poner(r["t"], leer(SFX / ("golpe-1.mp3" if i % 2 else "golpe-3.mp3")), 10 ** (-15 / 20))
    mz.masterizar(RAIZ / "public/shimon/prueba/mezcla.wav")

    (RAIZ / "src/shimon/prueba.json").write_text(json.dumps({"duracion": dur, "escenas": escenas, "rotulos": rotulos}, ensure_ascii=False, indent=1))
    print(f"{dur} s, {len(escenas)} escenas, {len(rotulos)} rótulos")
    for e in escenas:
        print(f"  {e['t']:6.2f}  {e['id']}")


if __name__ == "__main__":
    main()
