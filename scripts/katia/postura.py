"""Puntos del cuerpo (hombros, codos, muñecas, caderas, rodillas) cuadro a cuadro en tomas de Katia.

Uso (mediapipe y su modelo van aparte, fuera del repo):
    PYTHONPATH=<carpeta mediapipe> python3 scripts/katia/postura.py <modelo pose_landmarker.task> 5325 5326 5327
Lee public/katia/cortes/IMG_<n>.mp4 (1080 × 1920, 30 fps) y escribe src/katia/postura/IMG_<n>.json:
{"fps": 30, "puntos": {"hombro_i": [[x, y, visibilidad], … por cuadro], …}} en píxeles de la toma.
Remotion los usa para poner el rojo encima del músculo aunque ella se mueva.
"""

import json
import subprocess
import sys
from pathlib import Path

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

RAIZ = Path(__file__).resolve().parents[2]
PUNTOS = {"hombro_i": 11, "hombro_d": 12, "codo_i": 13, "codo_d": 14, "muneca_i": 15, "muneca_d": 16,
          "cadera_i": 23, "cadera_d": 24, "rodilla_i": 25, "rodilla_d": 26, "nariz": 0}
W, H = 1080, 1920


def main():
    modelo, clips = sys.argv[1], sys.argv[2:]
    opciones = vision.PoseLandmarkerOptions(base_options=BaseOptions(model_asset_path=modelo), running_mode=vision.RunningMode.VIDEO, num_poses=1)
    salida = RAIZ / "src/katia/postura"
    salida.mkdir(parents=True, exist_ok=True)
    for n in clips:
        crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(RAIZ / f"public/katia/cortes/IMG_{n}.mp4"), "-vf", "scale=540:960", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
        cuadros = np.frombuffer(crudo, dtype=np.uint8).reshape(-1, 960, 540, 3)
        res = {k: [] for k in PUNTOS}
        with vision.PoseLandmarker.create_from_options(opciones) as det:
            for i, c in enumerate(cuadros):
                r = det.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(c)), int(i * 1000 / 30))
                for k, idx in PUNTOS.items():
                    if r.pose_landmarks:
                        p = r.pose_landmarks[0][idx]
                        res[k].append([round(p.x * W, 1), round(p.y * H, 1), round(p.visibility or 0, 2)])
                    else:
                        res[k].append(None)
        # Suavizado (media móvil de 5 cuadros) para que el rojo no tiemble
        for k, v in res.items():
            xs = [p for p in v]
            for i in range(len(v)):
                vec = [p for p in xs[max(0, i - 2):i + 3] if p]
                if vec:
                    res[k][i] = [round(float(np.mean([p[0] for p in vec])), 1), round(float(np.mean([p[1] for p in vec])), 1), round(float(np.mean([p[2] for p in vec])), 2)]
        (salida / f"IMG_{n}.json").write_text(json.dumps({"fps": 30, "puntos": res}))
        ok = sum(1 for p in res["hombro_i"] if p)
        print(f"IMG_{n}: {len(cuadros)} cuadros, cuerpo encontrado en {ok}")


if __name__ == "__main__":
    main()
