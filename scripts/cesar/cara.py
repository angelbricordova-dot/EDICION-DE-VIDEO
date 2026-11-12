"""Sigue la cabeza de César en el proxy de la cámara (720 × 1280) para que la ventana de arriba a la
izquierda lo encuadre siempre, moviéndose suave. Los detectores de caras no lo ven (gorra, auriculares,
de lado); como viste de negro contra una pared clara, se sigue la zona oscura: su parte más alta es la
gorra. Escribe src/cesar/cara.json: [[t, cx, arriba], …] cada 0,2 s (t = tiempo del proxy), suavizado 2 s.

Uso:  python3 scripts/cesar/cara.py
"""

import json
import subprocess
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
W, H, FPS = 180, 320, 5  # 1/4 de 720 × 1280


def main():
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(RAIZ / "public/cesar/proxies/cam-40.mp4"), "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    cuadros = np.frombuffer(crudo, np.uint8).reshape(-1, H, W).astype(float)
    pts = []
    for c in cuadros:
        zona = c[:, : int(W * 0.58)]  # a la izquierda (la laptop oscura está a la derecha)
        oscuro = zona < 60
        filas = np.where(oscuro.sum(1) > 6)[0]
        if len(filas) == 0:
            pts.append(None)
            continue
        arriba = filas[0]
        franja = oscuro[arriba: arriba + 40]
        xs = np.where(franja.any(0))[0]
        pts.append((xs.mean() * 4, arriba * 4))
    ult = next(p for p in pts if p)
    llenos = []
    for p in pts:
        ult = p or ult
        llenos.append(ult)
    a = np.array(llenos, dtype=float)
    k = 2 * FPS
    pad = np.pad(a, ((k, k), (0, 0)), mode="edge")
    sm = np.array([pad[i:i + 2 * k + 1].mean(0) for i in range(len(a))])
    out = [[round(i / FPS, 2), round(x), round(y)] for i, (x, y) in enumerate(sm)]
    (RAIZ / "src/cesar/cara.json").write_text(json.dumps(out))
    print(f"{sum(p is not None for p in pts)}/{len(pts)} cuadros; cx {sm[:,0].min():.0f}–{sm[:,0].max():.0f}, arriba {sm[:,1].min():.0f}–{sm[:,1].max():.0f}")


if __name__ == "__main__":
    main()
