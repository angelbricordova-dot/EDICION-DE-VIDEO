"""Sonido de la prueba de 8 s (src/prueba), sincronizado con su timeline.json.

Sigue las reglas de la skill sound-design: todo en Do mayor, jerarquía de
ganancia (golpe héroe 0.25–0.35, apoyos 0.08–0.2, colchón ~0.03), paneo según
la posición en pantalla, una sola subida que termina en el golpe, un solo
impacto y masterizado a -14 LUFS.

Uso:
    python3 scripts/prueba/sonido_prueba.py public/audio/prueba.wav
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import Mezcla, blip, chime, click, impacto, pop, riser, whoosh

RAIZ = Path(__file__).resolve().parents[2]
TL = json.loads((RAIZ / "src/prueba/timeline.json").read_text())

# Do mayor (Hz)
F2, A2, C3, E3, G3 = 87.31, 110.00, 130.81, 164.81, 196.00
C4, E4, A4 = 261.63, 329.63, 440.00
C5, E5, G5, C6 = 523.25, 659.25, 783.99, 1046.50

s1, s2, s3 = TL["s1"], TL["s2"], TL["s3"]
m = Mezcla(TL["duration"])

# Colchón: se apaga bajo el iris y resuelve en Do mayor.
m.colchon(
    [(0, [C3, G3, E4]), (s2["label"], [A2, E3, C4]), (s2["ticks"][2], [F2, C3, A4]), (s3["iris"], [C3, G3, E4, C5])],
    [(0, 0), (0.4, 1), (s3["iris"] - 0.25, 1), (s3["iris"], 0.35), (s3["iris"] + 0.6, 1), (m.dur, 1)],
    0.03,
)

# Escena 1: palabras (izquierda) y el punto que aterriza (derecha → centro).
for i, t in enumerate(s1["words"]):
    m.poner(t, whoosh(0.35, 500, 2400, 0.45), 0.10, -0.5 + i * 0.3)
    m.poner(t + 0.32, blip([C5, E5, G5][i]), 0.09, -0.5 + i * 0.3)
m.poner(s1["dotDock"] - 0.6, whoosh(0.6, 1800, 600, 0.6), 0.08, 0.5)
m.poner(s1["dotDock"], pop(700, 1300), 0.20, 0.2)
for i in range(3):
    m.poner(s1["exit"] + i * 0.05, whoosh(0.3, 900, 2600, 0.3), 0.07, -0.4)

# Escena 2: pastillas a la izquierda, tono que sube; checks en la tonalidad.
m.poner(s2["label"], click(2600), 0.06, -0.6)
for i, t in enumerate(s2["chips"]):
    m.poner(t, pop(900 + i * 150, 1400 + i * 150), 0.20, -0.6)
for i, t in enumerate(s2["ticks"]):
    m.poner(t, click(1800), 0.12, -0.6)
    m.poner(t + 0.01, blip([E5, G5, C6][i]), 0.13, -0.6)
m.poner(s2["exit"], whoosh(0.4, 2400, 700, 0.3), 0.10, -0.6)

# Momento héroe: una subida que termina justo en el iris y un solo impacto.
m.poner(s2["ticks"][2], riser(s3["iris"] - s2["ticks"][2]), 0.18)
m.poner(s3["iris"] - 0.12, whoosh(0.5, 300, 3000, 0.25), 0.22)
m.poner(s3["iris"], impacto(), 0.32)

# Escena 3: titular y acorde de llegada.
for i, t in enumerate(s3["words"]):
    m.poner(t, whoosh(0.35, 500, 2400, 0.45), 0.08, -0.5 + i * 0.3)
m.poner(s3["words"][2] + 0.32, blip(C6), 0.10, 0.2)
m.poner(s3["label"], chime([C5, E5, G5, C6]), 0.18)

m.masterizar(sys.argv[1] if len(sys.argv) > 1 else "prueba.wav", -14.0)
