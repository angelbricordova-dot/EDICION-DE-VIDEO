"""Mezcla del short del pulpo: versión final (voz + música + efectos) y versión limpia (sin voz).

Música a −16 dB bajo la voz y −9 dB donde no hay voz (en la limpia, −9 dB todo el tiempo),
con una bajada en la pausa dramática. Efectos a −12 dB. Total −14 LUFS.

Uso:
    python3 scripts/pulpo/sonido_pulpo.py public/pulpo/audio/mezcla.wav
    python3 scripts/pulpo/sonido_pulpo.py public/pulpo/audio/mezcla-limpia.wav --limpia
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
A = RAIZ / "public/pulpo/audio"


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
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--limpia", action="store_true")
    a = ap.parse_args()
    g = json.loads((RAIZ / "src/pulpo/guion.json").read_text())
    m = Mezcla(g["duracion"])
    t = np.arange(m.n) / SR
    mk = g["marcas"]

    mus = leer(A / "musica.mp3")
    mus = mus / np.max(np.abs(mus))
    mus = np.pad(mus, ((0, 0), (0, max(0, m.n - mus.shape[1]))))[:, : m.n]
    nivel = np.full(m.n, db(-9))
    if not a.limpia:
        for ini, fin, _ in g["tramos"]:
            nivel[(t >= ini - 0.08) & (t <= fin + 0.1)] = db(-16)
    # Pausa dramática cuando el corazón se detiene.
    nivel[(t >= mk["detiene"]) & (t < mk["cae"])] *= db(-8)
    nivel = np.convolve(nivel, np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
    m.bus += mus * nivel

    if not a.limpia:
        voz = leer(A / "voz.mp3", 1)
        voz = voz / np.max(np.abs(voz))
        m.bus[:, : len(voz)] += voz[: m.n]

    for e in g["efectos"]:
        x = leer(A / "sfx" / f"{e['sonido']}.mp3", 1)
        x = x / np.max(np.abs(x))
        m.poner(e["t"], x, db(-12) * e.get("gain", 1), e.get("pan", 0))

    m.masterizar(a.salida, -14.0, fundido=0.25)


if __name__ == "__main__":
    main()
