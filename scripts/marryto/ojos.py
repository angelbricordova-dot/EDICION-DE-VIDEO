"""Sigue los ojos y la frente de Marryto en cada cuadro del tramo que se usa de cada video, para que
la imagen y el texto de arriba NUNCA le tapen los ojos ni queden pegados a la frente (reunión 7-nov
y correcciones del 9-nov: "que haya una separación").

Guarda en src/marryto/videos.json, en píxeles del proxy 1080 × 1920:
  "frenteY": el punto más alto que alcanza su frente en el tramo (percentil 3, ignora fallos sueltos)
  "ojosY":   el punto más alto que alcanzan sus ojos
  "ojosX":   el centro horizontal medio de los ojos

Uso (MediaPipe aparte, modelo face_landmarker.task):
    PYTHONPATH=<mediapipe> python3 scripts/marryto/ojos.py <modelo.task> 34 37 40
"""

import json
import subprocess
import sys
from pathlib import Path

import mediapipe as mp
import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
W, H = 540, 960
FPS = 10
OJOS = [33, 133, 159, 145, 362, 263, 386, 374]  # contornos de los dos ojos
FRENTE = 10  # punto alto de la frente


def tramo(v):
    bruto = v["fin"] - v["inicio"]
    vel = min(1.5, max(1, bruto / 6.5)) if v.get("rapido") else 1
    usado = min(bruto, (6.5 if v.get("rapido") else 7) * vel)
    return v["inicio"], usado


def main():
    modelo, *nums = sys.argv[1:]
    ruta = RAIZ / "src/marryto/videos.json"
    d = json.loads(ruta.read_text())
    opts = mp.tasks.vision.FaceLandmarkerOptions(base_options=mp.tasks.BaseOptions(model_asset_path=modelo), num_faces=1)
    det = mp.tasks.vision.FaceLandmarker.create_from_options(opts)
    for n in nums:
        v = d[n]
        t0, dur = tramo(v)
        crudo = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(dur), "-i", str(RAIZ / f"public/marryto/proxies/v{n}.mp4"),
                                "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
        cuadros = np.frombuffer(crudo, np.uint8).reshape(-1, H, W, 3)
        ojos, frentes, xs = [], [], []
        for c in cuadros:
            r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(c)))
            if not r.face_landmarks:
                continue
            lm = r.face_landmarks[0]
            ojos.append(min(lm[i].y for i in OJOS) * 1920)
            frentes.append(lm[FRENTE].y * 1920)
            xs.append(np.mean([lm[i].x for i in OJOS]) * 1080)
        if not ojos:
            print(f"Video {n}: sin cara detectada")
            continue
        v["ojosY"] = round(float(np.percentile(ojos, 3)))
        v["frenteY"] = round(float(np.percentile(frentes, 3)))
        v["ojosX"] = round(float(np.median(xs)))
        print(f"Video {n}: {len(ojos)}/{len(cuadros)} cuadros con cara · ojos más altos y={v['ojosY']} · frente y={v['frenteY']} · x={v['ojosX']}")
    ruta.write_text(json.dumps(d, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
