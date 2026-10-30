"""Mezcla de un video de pronósticos: la voz de la toma + efectos variados en cada escena.

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
SFX = RAIZ / "public/comun/sfx/mixkit"

# Efectos de cada video: (palabra, efecto, ganancia dB, desfase s[, duración máx. s]), buscadas en
# orden. Los efectos son de Mixkit (public/comun/sfx/mixkit/, licencia libre): barridos de aire,
# pops y clics distintos que se van turnando para que no suene repetitivo, golpes solo en lo
# importante, el silbato en el penalti fallado y la grada en "el Inter no pierde". El desfase se
# mide desde el pico del efecto (el barrido culmina cuando entra el gráfico).
EFECTOS = {
    "milan-inter": [
        ("7", "pop-3", -20, -0.03),
        ("ganó", "clic-4", -19, 0.12), ("ganó", "clic-4", -19, 0.24), ("ganó", "clic-4", -19, 0.36),
        ("5", "pop-4", -19, -0.03),
        ("4", "pop-1", -21, -0.03),
        ("Milan,", "golpe-1", -19, 0.12),
        ("Inter.", "barrido-2", -20, -0.02),
        ("El", "barrido-1", -21, -0.05),
        ("1-0,", "pop-2", -20, -0.08),
        ("remató", "clic-2", -21, -0.03),
        ("falló", "silbato", -21, 0.05, 0.6),
        ("Milan", "barrido-4", -21, -0.05),
        ("2-4", "golpe-2", -17, -0.06),
        ("Aparte", "barrido-5", -20, -0.05),
        ("5", "clic-3", -20, -0.03), ("3", "clic-5", -20, -0.03),
        ("Inter", "barrido-3", -18, -0.05),
        ("invicto", "pop-4", -20, -0.03),
        ("ganó", "pop-3", -21, -0.03),
        ("titulares", "pop-1", -21, -0.03),
        ("Lautaro,", "pop-2", -20, -0.03),
        ("remontaron", "clic-1", -21, -0.03),
        ("lectura", "aire-1", -21, -0.05),
        ("pierde.", "estadio-3", -23, 0.0, 2.4),
        ("¿Tú", "barrido-1", -21, -0.05),
        ("leo", "pop-4", -21, -0.03),
        ("Si", "aire-2", -19, -0.05),
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
    for e in EFECTOS[video]:
        palabra, nombre, gain, desfase = e[:4]
        t = next((w["ini"] for w in pal if w["ini"] >= cursor - 0.01 and limpio(w["p"]) == limpio(palabra)), None)
        if t is None:
            raise SystemExit(f"No encontré {palabra} después de {cursor}")
        cursor = t
        x = leer(SFX / f"{nombre}.mp3")
        if len(e) > 4:  # recorte con fundido (la grada y el silbato no se alargan)
            n = int(e[4] * SR)
            x = x[:n].copy()
            f = min(len(x), int(0.4 * SR))
            x[-f:] *= np.linspace(1, 0, f)
        pico = int(np.argmax(np.abs(x)))
        mz.poner(max(0, t + desfase - pico / SR), x / np.max(np.abs(x)), 10 ** (gain / 20))
    mz.masterizar(str(RAIZ / f"public/pronosticos/mezcla-{video}.wav"), -14.0, fundido=0.15)


if __name__ == "__main__":
    main()
