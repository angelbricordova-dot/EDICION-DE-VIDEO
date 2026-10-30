"""Cuánto se mueve cada persona del sofá, cada 0,1 s (para elegir tramos en los que escucha quieto).

Lee la copia de trabajo, recorta la mitad de cada lado (de los hombros a las rodillas), la pasa a
gris y pequeña, y guarda la diferencia media entre cuadros seguidos, y si mira a cámara (cara de
frente, OpenCV) en public/inmobiliaria/<reel>/movimiento.json →
{"izq": [[t, mov], …], "izq_frente": [[t, 0|1], …], "der": …}.

Uso:
    python3 scripts/inmobiliaria/movimiento_sofa.py g14 izq=84:272 der=455:548
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
FPS = 10
W, H = 72, 128  # cuadro reducido (1440×2560 / 20)


def movimiento(video, lado, a, b):
    x0 = 0 if lado == "izq" else W // 2
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", str(video), "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
        capture_output=True, check=True,
    ).stdout
    fr = np.frombuffer(crudo, dtype=np.uint8).reshape(-1, H, W).astype(float)
    zona = fr[:, int(H * 0.28) : int(H * 0.72), x0 : x0 + W // 2]
    dif = np.abs(np.diff(zona, axis=0)).mean(axis=(1, 2))
    return [[round(a + (i + 1) / FPS, 2), round(float(m), 3)] for i, m in enumerate(dif)]


def mirada_a_camara(video, lado, a, b):
    """1 donde se le ve la cara de frente (mira a cámara, raro si está escuchando), cada 0,2 s."""
    import cv2

    cara = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    ancho, alto = 360, 640  # media copia (720 × 1280) a la mitad
    x = "0" if lado == "izq" else "720"
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", str(video), "-vf", f"fps=5,crop=720:1280:{x}:500,scale={ancho}:{alto},format=gray", "-f", "rawvideo", "-"],
        capture_output=True, check=True,
    ).stdout
    fr = np.frombuffer(crudo, dtype=np.uint8).reshape(-1, alto, ancho)
    out = []
    for i, f in enumerate(fr):
        caras = cara.detectMultiScale(f, scaleFactor=1.1, minNeighbors=6, minSize=(40, 40))
        out.append([round(a + i / 5, 2), 1 if len(caras) else 0])
    return out


def main():
    reel = sys.argv[1]
    video = RAIZ / f"public/inmobiliaria/{reel}/proxy.mp4"
    out = {}
    for arg in sys.argv[2:]:
        lado, rango = arg.split("=")
        a, b = map(float, rango.split(":"))
        out[lado] = movimiento(video, lado, a, b)
        out[lado + "_frente"] = mirada_a_camara(video, lado, a, b)
        print(lado, "mira a cámara en", sum(v for _, v in out[lado + "_frente"]), "de", len(out[lado + "_frente"]), "cuadros")
        m = np.array([v for _, v in out[lado]])
        print(lado, len(m), "medidas; movimiento medio", round(m.mean(), 2), "quieto (p20)", round(np.percentile(m, 20), 2))
    (RAIZ / f"public/inmobiliaria/{reel}/movimiento.json").write_text(json.dumps(out))


if __name__ == "__main__":
    main()
