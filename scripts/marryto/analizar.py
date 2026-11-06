"""Shorts de reacción de Marryto (docs/marryto.md): dónde empieza y acaba la reacción en cada bruto
y dónde está su cara, para recortar el principio (acomodando la cámara) y el final, y encuadrarle.

Uso (OpenCV 4 con CascadeClassifier, instalado aparte):
    PYTHONPATH=<opencv 4> python3 scripts/marryto/analizar.py 1 2 3 4 5 6 7
Lee public/marryto/proxies/v<n>.mp4 (1080 × 1920, 30 fps; ffmpeg desde el .mov del bruto) y añade o
actualiza la entrada de cada video en src/marryto/videos.json: {"inicio", "fin", "caraX", "caraY", "caraAncho"}.
"""

import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
PASO = 0.25  # segundos entre cuadros analizados


def caras(video):
    w, h = 270, 480
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={1 / PASO},scale={w}:{h},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    cuadros = np.frombuffer(crudo, dtype=np.uint8).reshape(-1, h, w)
    det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    out = []
    for c in cuadros:
        r = det.detectMultiScale(c, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        if len(r):
            x, y, fw, fh = max(r, key=lambda b: b[2] * b[3])
            out.append(((x + fw / 2) * 4, (y + fh / 2) * 4, fw * 4))  # en píxeles de 1080 × 1920
        else:
            out.append(None)
    return out


def main():
    ruta = RAIZ / "src/marryto/videos.json"
    datos = json.loads(ruta.read_text()) if ruta.exists() else {}
    for n in sys.argv[1:]:
        cs = caras(RAIZ / f"public/marryto/proxies/v{n}.mp4")
        anchos = [c[2] for c in cs if c]
        med = float(np.median(anchos))
        # válido: hay cara y su tamaño es el normal de la reacción (no pegado a la cámara)
        ok = [bool(c) and 0.6 * med < c[2] < 1.6 * med for c in cs]
        ini = next(i for i in range(len(ok)) if all(ok[i:i + 4]))
        fin = max(i for i in range(len(ok)) if all(ok[max(0, i - 3):i + 1]))
        bueno = [c for c, o in zip(cs[ini:fin + 1], ok[ini:fin + 1]) if o]
        e = datos.get(n, {})
        e.update({"inicio": round(ini * PASO, 2), "fin": round((fin + 1) * PASO, 2),
                  "caraX": round(float(np.median([c[0] for c in bueno]))), "caraY": round(float(np.median([c[1] for c in bueno]))),
                  "caraAncho": round(float(np.median([c[2] for c in bueno])))})
        datos[n] = e
        print(f"Video {n}: reacción {e['inicio']}–{e['fin']} s de {len(cs) * PASO:.1f} s, cara en ({e['caraX']}, {e['caraY']}) ancho {e['caraAncho']}")
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n")


if __name__ == "__main__":
    main()
