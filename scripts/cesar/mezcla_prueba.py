"""Sonido de la prueba de César (docs/cesar.md): el audio del video (grabación de pantalla) y su voz
(cámara) siguiendo los mismos tramos que src/cesar/prueba.json. La cámara también oye los altavoces,
así que su micro solo se abre cuando habla él (puerta con fundidos), para que no haya eco.
Música y efectos: los pone Angel (ver la guía); aquí van si existen en public/cesar/musica.mp3.

Uso:
    python3 scripts/cesar/mezcla_prueba.py
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]


def leer(ruta, desde=0.0, mapa=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(desde), "-i", str(ruta)]
    if mapa:
        cmd += ["-map", mapa]
    cmd += ["-vn", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(float)


def main():
    g = json.loads((RAIZ / "src/cesar/prueba.json").read_text())
    p0 = g["inicioProxy"]
    pan = leer(RAIZ / "public/cesar/proxies/pan-40.mp4")  # tiempo del original - 40
    cam = leer(RAIZ / "public/cesar/brutos/2026_11_09_14_08_27_IMG_4869.MOV", p0, "0:a:0")  # tiempo de la cámara - 40
    # puerta del micro: abierta cuando habla él (energía alta en la cámara y por encima del altavoz)
    k = SR // 100
    e = np.sqrt((cam[: len(cam) // k * k].reshape(-1, k) ** 2).mean(1))
    db = 20 * np.log10(e + 1e-6)
    abierta = (db > np.percentile(db, 40) + 8).astype(float)
    abierta = np.convolve(abierta, np.ones(40) / 40, "same") > 0.15  # mantener 0,2 s alrededor
    env = np.repeat(np.convolve(abierta.astype(float), np.ones(12) / 12, "same"), k)[: len(cam)]
    cam = cam[: len(env)] * env

    mz = Mezcla(g["duracion"] + 0.5)
    t = 0.0
    for a, b in g["tramos"]:
        i0, i1 = int((a - p0) * SR), int((b - p0) * SR)
        j0 = int((a + g["desfase"] - p0) * SR)
        f = int(0.012 * SR)
        for x, gain in ((pan[i0:i1].copy(), 1.0), (cam[j0:j0 + (i1 - i0)].copy(), 1.25)):
            x[:f] *= np.linspace(0, 1, f)
            x[-f:] *= np.linspace(1, 0, f)
            mz.poner(t, x, gain)
        t += b - a
    musica = RAIZ / "public/cesar/musica.mp3"
    if musica.exists():
        m = leer(musica)[: int(t * SR)]
        mz.poner(0, m, 10 ** (-24 / 20))
    mz.masterizar(RAIZ / "public/cesar/mezcla.wav")


if __name__ == "__main__":
    main()
