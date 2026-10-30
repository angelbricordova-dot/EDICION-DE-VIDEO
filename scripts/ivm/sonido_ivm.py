"""Sonido del explicador de IVM (src/ivm), sincronizado con su timeline.json.

Música de fondo suave en Fa mayor (acordes + pulso tipo kalimba a 96 BPM) y
efectos de interfaz en cada evento. Va bajo para dejar sitio a la voz en off.

Uso:
    python3 scripts/ivm/sonido_ivm.py public/audio/ivm-explicador.wav
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import (
    Mezcla,
    blip,
    chime,
    click,
    golpe_papel,
    pop,
    pulsado,
    tecla,
    trazo,
    whoosh,
    zumbido_error,
)

RAIZ = Path(__file__).resolve().parents[2]
TL = json.loads((RAIZ / "src/ivm/timeline.json").read_text())


def hz(nota):
    return 440.0 * 2 ** ((nota - 69) / 12)


# Fa mayor: Fmaj7 · Dm7 · Sib maj7 · Do
ACORDES = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 55, 60, 64]]
C5, D5, E5, F5, G5, A5, C6 = (hz(n) for n in (72, 74, 76, 77, 79, 81, 84))

m = Mezcla(TL["duration"])
e1, e2, e3, e4, e5, e6 = (TL[k] for k in ("e1", "e2", "e3", "e4", "e5", "e6"))

# --- Música -------------------------------------------------------------------
COMPAS = 3.5
acordes = [(i * COMPAS, [hz(n) for n in ACORDES[i % 4]]) for i in range(int(m.dur / COMPAS) + 1)]
m.colchon(acordes, [(0, 0), (0.5, 1), (m.dur, 1)], 0.022)

# Pulso en corcheas; respira (se calla) en la tarjeta de capítulo.
CORCHEA = 60 / 96 / 2
k = 0
t = 0.0
while t < m.dur - 0.5:
    silencio = e3["tarjeta"] - 0.3 < t < e3["linea"] + 0.9
    if not silencio:
        acorde = ACORDES[int(t / COMPAS) % 4]
        nota = acorde[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
        m.poner(t, pulsado(hz(nota)), 0.05 if k % 2 == 0 else 0.032, -0.35 if k % 2 else 0.35)
    k += 1
    t += CORCHEA

# --- Cámara entre escenas --------------------------------------------------------
for i, t0 in enumerate(TL["camara"]):
    m.poner(t0 - 0.05, whoosh(0.9, 300, 2600, 0.55), 0.10, 0.3 if i % 2 == 0 else -0.3)

# --- Escena 1: la orden y el chat ------------------------------------------------
m.poner(e1["orden"], golpe_papel(), 0.16, -0.5)
m.poner(e1["chat"], whoosh(0.4, 600, 2200, 0.4), 0.08, 0.5)
m.poner(e1["chat"] + 0.15, golpe_papel(), 0.12, 0.5)
m.poner(e1["chat"] + 0.3, click(2400), 0.05, 0.4)
for i in range(3):
    m.poner(e1["escribe"] + 0.15 + i * 0.25, blip(C6, 0.12, 0.04), 0.025, 0.4)
m.poner(e1["envia"], pop(800, 1300), 0.18, 0.4)
m.poner(e1["envia"] + 0.05, blip(A5), 0.07, 0.4)
m.poner(e1["liberar"], pop(600, 1000), 0.14, -0.5)
m.poner(e1["liberar"] + 0.3, whoosh(0.6, 1200, 400, 0.4), 0.04, -0.3)

# --- Escena 2: el banco no dice quién pagó ---------------------------------------
m.poner(e2["banco"], golpe_papel(), 0.15, -0.5)
m.poner(e2["check"], blip(C6, 0.4), 0.11, -0.3)
m.poner(e2["check"] + 0.07, blip(hz(88), 0.5), 0.08, -0.3)
m.poner(e2["falta"], trazo(0.3), 0.05, -0.3)
m.poner(e2["signo"], pop(700, 500), 0.15, -0.3)
m.poner(e2["tu"], pop(500, 900), 0.15, 0.3)
m.poner(e2["burbuja"] - 0.15, pop(1200, 1500, 0.1), 0.06, 0.3)
m.poner(e2["burbuja"], pop(700, 1100), 0.12, 0.1)

# --- Escena 3: tarjeta de capítulo ------------------------------------------------
m.poner(e3["tarjeta"], golpe_papel(0.35), 0.18)
m.poner(e3["titulo"], whoosh(0.5, 500, 1800, 0.5), 0.06)
m.poner(e3["linea"], trazo(0.6), 0.07)
m.poner(e3["linea"] + 0.6, chime([F5, A5, C6]), 0.06)

# --- Escena 4: comparar el nombre -------------------------------------------------
m.poner(e4["orden"], golpe_papel(), 0.14, -0.4)
m.poner(e4["banco"], golpe_papel(), 0.14, 0.4)
for fila, inicio in enumerate((e4["letras"], e4["letras"] + 0.45)):
    for i in range(5):
        m.poner(inicio + i * 0.07, click(1500 + i * 120 + fila * 60), 0.07, -0.5 + i * 0.12)
m.poner(e4["error"], zumbido_error(), 0.16, 0.2)
for i in range(4):
    m.poner(e4["palabras"] + i * 0.06, click(1300 + i * 100), 0.05, -0.4 + i * 0.2)
    m.poner(e4["palabras"] + 0.55 + i * 0.22, blip([C5, E5, G5, C6][i]), 0.08, -0.4 + i * 0.25)
m.poner(e4["coincide"], chime([F5, A5, C6]), 0.13, 0.3)

# --- Escena 5: la regla -----------------------------------------------------------
m.poner(e5["fila1"], golpe_papel(), 0.13)
m.poner(e5["fila1"] + 0.15, blip(C6, 0.3), 0.08, -0.4)
m.poner(e5["liberas"], pop(800, 1300), 0.15, 0.4)
m.poner(e5["fila2"], golpe_papel(), 0.13)
m.poner(e5["fila2"] + 0.15, zumbido_error(0.25), 0.09, -0.4)
m.poner(e5["noLiberes"], pop(600, 900), 0.13, 0.4)
m.poner(e5["tachado"], trazo(0.35), 0.08, 0.4)

# --- Escena 6: practicar en la web ------------------------------------------------
url = "ivmp2p.com/practica"
m.poner(e6["buscador"], golpe_papel(), 0.12)
fin = e6["enter"] - 0.2
for i in range(len(url)):
    m.poner(e6["escribe"] + (fin - e6["escribe"]) * i / len(url), tecla(), 0.11, -0.2 + 0.4 * i / len(url))
m.poner(e6["enter"], click(1100, 0.08), 0.16)
m.poner(e6["proximo"], pop(700, 1200), 0.15, -0.3)
m.poner(e6["proximo"] + 0.25, chime([F5, A5, C6, F5 * 2]), 0.12)

m.masterizar(sys.argv[1] if len(sys.argv) > 1 else "ivm-explicador.wav", -15.0)
