"""Mezcla de un video de pronósticos: la voz de la toma + efectos suaves en cada escena.

Sin música (el cliente la pone en CapCut si quiere). Total −14 LUFS.

Uso:
    python3 scripts/pronosticos/sonido_pronosticos.py milan-inter
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
SFX = RAIZ / "public/comun/sfx"

# Efectos de cada video: (palabra, efecto, ganancia dB, desfase s), buscadas en orden.
EFECTOS = {
    "milan-inter": [
        ("7", "pop", -17, -0.05), ("ganó", "tap", -17, 0.1), ("5", "pop", -16, -0.05), ("4", "pop", -17, -0.05),
        ("Milan,", "whoosh", -17, -0.1), ("Inter.", "golpe", -17, -0.05),
        ("El", "whoosh", -18, -0.1), ("1-0,", "pop", -16, -0.05), ("remató", "pop", -17, -0.05),
        ("Çalhanoğlu", "pop", -16, -0.05), ("Milan", "whoosh", -18, -0.1), ("2-4", "golpe", -17, -0.05),
        ("Aparte", "whoosh", -18, -0.1), ("5", "tap", -17, -0.05), ("3", "tap", -17, -0.05),
        ("Inter", "whoosh", -18, -0.1), ("invicto", "pop", -16, -0.05), ("ganó", "pop", -17, -0.05),
        ("titulares", "pop", -17, -0.05), ("Lautaro,", "pop", -16, -0.05), ("remontaron", "pop", -17, -0.05),
        ("lectura", "whoosh", -17, -0.1), ("pierde.", "golpe", -15, -0.05), ("¿Tú", "whoosh", -17, -0.1),
        ("leo", "pop", -17, -0.05), ("Si", "whoosh", -16, -0.1),
    ],
}


def leer(ruta, canales=1):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", str(canales), "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def main():
    video = sys.argv[1]
    g = json.loads((RAIZ / f"src/pronosticos/{video}.json").read_text())
    pal = g["palabras"]

    def limpio(w):
        return re.sub(r"[¿?¡!.,:;…]", "", w).lower()

    mz = Mezcla(g["duracion"])
    voz = leer(RAIZ / "public/pronosticos/audio48k.wav")
    voz = voz / np.max(np.abs(voz))
    mz.bus[:, : len(voz)] += voz[: mz.n]
    cursor = 0.0
    for palabra, nombre, gain, desfase in EFECTOS[video]:
        t = next((w["ini"] for w in pal if w["ini"] >= cursor - 0.01 and limpio(w["p"]) == limpio(palabra)), None)
        if t is None:
            raise SystemExit(f"No encontré {palabra} después de {cursor}")
        cursor = t
        x = leer(SFX / f"{nombre}.mp3")
        mz.poner(max(0, t + desfase), x / np.max(np.abs(x)), 10 ** (gain / 20))
    mz.masterizar(str(RAIZ / f"public/pronosticos/mezcla-{video}.wav"), -14.0, fundido=0.15)


if __name__ == "__main__":
    main()
