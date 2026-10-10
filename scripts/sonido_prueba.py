"""Sonido de la prueba de 8 s (src/prueba), sincronizado con su timeline.json.

Sigue las reglas de la skill sound-design: todo en Do mayor, jerarquía de
ganancia (golpe héroe 0.25–0.35, apoyos 0.08–0.2, colchón ~0.03), paneo según
la posición en pantalla, una sola subida que termina en el golpe, un solo
impacto y masterizado a -14 LUFS.

Uso:
    python3 scripts/sonido_prueba.py public/audio/prueba.wav
"""

import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
RAIZ = Path(__file__).resolve().parent.parent
TL = json.loads((RAIZ / "src/prueba/timeline.json").read_text())
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(11)

# Do mayor (Hz)
F2, A2, C3, E3, G3 = 87.31, 110.00, 130.81, 164.81, 196.00
C4, E4, A4 = 261.63, 329.63, 440.00
C5, E5, G5, C6 = 523.25, 659.25, 783.99, 1046.50

bus = np.zeros((2, N))


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def poner(t0, x, gain, pan=0.0):
    i = int(t0 * SR)
    x = x[: max(0, N - i)]
    a = (pan + 1) * np.pi / 4
    bus[0, i : i + len(x)] += x * gain * np.cos(a)
    bus[1, i : i + len(x)] += x * gain * np.sin(a)


def filtro_banda(x, f_lo, f_hi):
    """Pasa-banda por FFT (sin dependencias)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < f_lo) | (f > f_hi)] = 0
    return np.fft.irfft(X, len(x))


def whoosh(dur, f0, f1, pico=0.5):
    """Aire que barre de f0 a f1; pico (0..1) es donde suena más fuerte."""
    n = int(dur * SR)
    ruido = rng.uniform(-1, 1, n)
    trozos = 12
    salida = np.zeros(n)
    for k in range(trozos):
        a, b = k * n // trozos, (k + 1) * n // trozos
        fc = f0 + (f1 - f0) * (k + 0.5) / trozos
        salida[a:b] = filtro_banda(ruido, fc * 0.6, fc * 1.5)[a:b]
    x = np.linspace(0, 1, n)
    env = np.where(x < pico, x / pico, (1 - x) / (1 - pico)) ** 2
    return salida * env * 3


def blip(f, dur=0.35, tau=0.12):
    t = t_(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / tau) * np.minimum(1, t * 400)


def pop(f0, f1, dur=0.16):
    t = t_(dur)
    fase = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / dur) ** 0.5) / SR
    return np.sin(fase) * np.exp(-t * 22) * np.minimum(1, t * 600)


def click(f=1800, dur=0.05):
    t = t_(dur)
    return (np.sin(2 * np.pi * f * t) + 0.4 * rng.uniform(-1, 1, len(t))) * np.exp(-t * 160)


def riser(dur):
    t = t_(dur)
    k = t / dur
    tono = np.sin(2 * np.pi * np.cumsum(260 + 1800 * k**2) / SR) * 0.35
    aire = filtro_banda(rng.uniform(-1, 1, len(t)), 800, 6000) * 2.2
    return (tono + aire * k) * k**2.2


def impacto(dur=1.2):
    t = t_(dur)
    sub = np.sin(2 * np.pi * np.cumsum(42 + 70 * np.exp(-t * 14)) / SR) * np.exp(-t * 2.6)
    golpe = filtro_banda(rng.uniform(-1, 1, len(t)), 60, 900) * np.exp(-t * 16) * 3
    return sub + golpe


def chime(fs, dur=1.8, tau=0.7):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 4) for f in fs)
    return s / len(fs) * np.exp(-t / tau) * np.minimum(1, t * 300)


def colchon(acordes, volumen):
    """Pad estéreo con acordes [(inicio, [hz])] y curva de volumen [(t, v)]."""
    t = np.arange(N) / SR
    izq, der = np.zeros(N), np.zeros(N)
    for i, (t0, fs) in enumerate(acordes):
        t1 = acordes[i + 1][0] if i + 1 < len(acordes) else DUR
        peso = np.clip((t - t0) / 0.35, 0, 1) * np.clip((t1 + 0.35 - t) / 0.35, 0, 1)
        for j, f in enumerate(fs):
            g = 1 / (1 + j * 0.5)
            izq += g * np.sin(2 * np.pi * (f - 0.6) * t) * peso
            der += g * np.sin(2 * np.pi * (f + 0.6) * t) * peso
    vt, vv = zip(*volumen)
    env = np.interp(t, vt, vv) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t))
    return izq * env, der * env


s1, s2, s3 = TL["s1"], TL["s2"], TL["s3"]

# Colchón: se apaga bajo el iris y resuelve en Do mayor.
izq, der = colchon(
    [(0, [C3, G3, E4]), (s2["label"], [A2, E3, C4]), (s2["ticks"][2], [F2, C3, A4]), (s3["iris"], [C3, G3, E4, C5])],
    [(0, 0), (0.4, 1), (s3["iris"] - 0.25, 1), (s3["iris"], 0.35), (s3["iris"] + 0.6, 1), (DUR, 1)],
)
bus[0] += izq * 0.03
bus[1] += der * 0.03

# Escena 1: palabras (izquierda) y el punto que aterriza (derecha → centro).
for i, t in enumerate(s1["words"]):
    poner(t, whoosh(0.35, 500, 2400, 0.45), 0.10, -0.5 + i * 0.3)
    poner(t + 0.32, blip([C5, E5, G5][i]), 0.09, -0.5 + i * 0.3)
poner(s1["dotDock"] - 0.6, whoosh(0.6, 1800, 600, 0.6), 0.08, 0.5)
poner(s1["dotDock"], pop(700, 1300), 0.20, 0.2)
for i in range(3):
    poner(s1["exit"] + i * 0.05, whoosh(0.3, 900, 2600, 0.3), 0.07, -0.4)

# Escena 2: pastillas a la izquierda, tono que sube; checks en la tonalidad.
poner(s2["label"], click(2600), 0.06, -0.6)
for i, t in enumerate(s2["chips"]):
    poner(t, pop(900 + i * 150, 1400 + i * 150), 0.20, -0.6)
for i, t in enumerate(s2["ticks"]):
    poner(t, click(1800), 0.12, -0.6)
    poner(t + 0.01, blip([E5, G5, C6][i]), 0.13, -0.6)
poner(s2["exit"], whoosh(0.4, 2400, 700, 0.3), 0.10, -0.6)

# Momento héroe: una subida que termina justo en el iris y un solo impacto.
poner(s2["ticks"][2], riser(s3["iris"] - s2["ticks"][2]), 0.18)
poner(s3["iris"] - 0.12, whoosh(0.5, 300, 3000, 0.25), 0.22)
poner(s3["iris"], impacto(), 0.32)

# Escena 3: titular y acorde de llegada.
for i, t in enumerate(s3["words"]):
    poner(t, whoosh(0.35, 500, 2400, 0.45), 0.08, -0.5 + i * 0.3)
poner(s3["words"][2] + 0.32, blip(C6), 0.10, 0.2)
poner(s3["label"], chime([C5, E5, G5, C6]), 0.18)

# Fundido final de 0.25 s.
f = int(0.25 * SR)
bus[:, -f:] *= np.linspace(1, 0, f)


def escribir(ruta, x):
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x.T, -1, 1) * 32767).astype("<i2").tobytes())


def lufs(ruta):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(ruta), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    resumen = r.stderr[r.stderr.rfind("Summary"):]
    i = float(resumen.split("I:")[1].split("LUFS")[0])
    pico = float(resumen.split("Peak:")[1].split("dBFS")[0])
    return i, pico


# Masterizado: ganancia hacia -14 LUFS con saturación suave y techo de -2 dBFS.
salida = Path(sys.argv[1] if len(sys.argv) > 1 else "prueba.wav")
mezcla = bus / np.max(np.abs(bus))
ganancia = 1.0
for _ in range(6):
    x = np.tanh(mezcla * ganancia)
    x *= min(1.0, 10 ** (-2 / 20) / np.max(np.abs(x)))
    escribir(salida, x)
    medido, pico = lufs(salida)
    if abs(medido + 14) < 0.3:
        break
    ganancia *= 10 ** ((-14 - medido) / 20)
print(f"{salida}: {DUR}s, {medido:.1f} LUFS, pico real {pico:.1f} dBFS")
