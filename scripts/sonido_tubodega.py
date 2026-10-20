"""Mezcla de los videos de TuBodega: voz + música con ducking (−18 dB bajo la voz) + efectos.

La música sube en el cierre (desde la marca s7) y termina en seco. Efectos de −6 a −10 dB
por debajo de la voz. Total −14 LUFS.

Uso:
    python3 scripts/sonido_tubodega.py v1 public/tubodega/audio/mezcla-v1.wav
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
A = RAIZ / "public/tubodega/audio"
MUSICA = {"v1": "musica-promo.mp3"}


def db(x):
    return 10 ** (x / 20)


def leer(ruta, canales=2):
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", str(canales), "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(crudo, dtype=np.float32).astype(float)
    return x.reshape(-1, canales).T if canales == 2 else x


def main():
    video, salida = sys.argv[1], sys.argv[2]
    g = json.loads((RAIZ / f"src/tubodega/guion-{video}.json").read_text())
    m = Mezcla(g["duracion"])
    t = np.arange(m.n) / SR

    mus = leer(A / MUSICA[video])
    mus = mus / np.max(np.abs(mus))
    mus = np.pad(mus, ((0, 0), (0, max(0, m.n - mus.shape[1]))))[:, : m.n]
    nivel = np.full(m.n, db(-6))
    for f in g["frases"]:
        nivel[(t >= f["desde"] - 0.12) & (t <= f["hasta"] + 0.2)] = db(-18)
    # En el cierre la música sube un poco aunque haya voz.
    s7 = g["marcas"].get("s7")
    if s7 is not None:
        nivel[(t >= s7) & (nivel < db(-12))] = db(-12)
    nivel = np.convolve(nivel, np.ones(int(0.1 * SR)) / int(0.1 * SR), mode="same")
    m.bus += mus * nivel

    voz = leer(RAIZ / f"public/tubodega/voz/{video}.mp3", 1)
    voz = voz / np.max(np.abs(voz))
    m.bus[:, : len(voz)] += voz[: m.n]

    for e in g["efectos"]:
        x = leer(A / "sfx" / f"{e['sonido']}.mp3", 1)
        x = x / np.max(np.abs(x))
        m.poner(e["t"], x, db(-9) * e.get("gain", 1), e.get("pan", 0))

    m.masterizar(salida, -14.0, fundido=0.04)


if __name__ == "__main__":
    main()
