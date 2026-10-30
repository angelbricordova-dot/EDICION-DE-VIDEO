"""Mezcla del reel Futbol Onze × Camis11: voz + música montada (drops en "Para." y en el código) + efectos.

Lee src/camis11/guion.json. Música a −13 dB debajo de la voz y −7 dB donde no hay voz,
efectos a −12 dB, total −14 LUFS (Instagram).

Uso:
    python3 scripts/camis11/sonido_camis11.py public/camis11/audio/mezcla.wav
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
A = RAIZ / "public/camis11/audio"


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
    salida = sys.argv[1]
    g = json.loads((RAIZ / "src/camis11/guion.json").read_text())
    m = Mezcla(g["duracion"])
    t = np.arange(m.n) / SR

    # Música montada por tramos, con fundidos de 15 ms en cada unión.
    pista = leer(A / "musica-1.mp3")
    pista = pista / np.max(np.abs(pista))
    mus = np.zeros((2, m.n))
    f = int(0.015 * SR)
    for i, (v0, p0, dur) in enumerate(g["musica"]):
        a, b = int(p0 * SR), int((p0 + dur) * SR)
        trozo = pista[:, a:b].copy()
        trozo[:, :f] *= np.linspace(0, 1, f)
        if i == len(g["musica"]) - 1:
            # El último tramo se apaga en 0,7 s bajo el golpe final.
            k = int(0.7 * SR)
            trozo[:, -k:] *= np.linspace(1, 0, k) ** 2
        else:
            trozo[:, -f:] *= np.linspace(1, 0, f)
        i0 = int(v0 * SR)
        mus[:, i0 : i0 + trozo.shape[1]] += trozo[:, : m.n - i0]

    nivel = np.full(m.n, db(-7))
    for fr in g["frases"]:
        nivel[(t >= fr["desde"] - 0.1) & (t <= fr["hasta"] + 0.15)] = db(-13)
    nivel = np.convolve(nivel, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
    m.bus += mus * nivel

    voz = leer(RAIZ / "public/camis11/voz/alejandro.mp3", 1)
    voz = voz / np.max(np.abs(voz))
    m.bus[:, : len(voz)] += voz[: m.n]

    for e in g["efectos"]:
        x = leer(A / "sfx" / f"{e['sonido']}.mp3", 1)
        x = x / np.max(np.abs(x))
        m.poner(e["t"], x, db(-12) * e.get("gain", 1), e.get("pan", 0))

    m.masterizar(salida, -14.0, fundido=0.3)


if __name__ == "__main__":
    main()
