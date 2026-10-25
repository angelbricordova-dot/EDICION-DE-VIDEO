"""Mezcla de los reels inmobiliarios: voz montada + efectos en las transiciones y apariciones.

Los momentos salen de las palabras del corte (src/inmobiliaria/<reel>-<version>.json), igual que
en Remotion. Sin música hasta que el cliente pase una pista con licencia. Total −14 LUFS.

Uso:
    python3 scripts/sonido_inmo.py g6 prueba
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
SFX = RAIZ / "public/tubodega/audio/sfx"


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def db(x):
    return 10 ** (x / 20)


def main():
    reel, version = sys.argv[1], sys.argv[2]
    g = json.loads((RAIZ / f"src/inmobiliaria/{reel}-{version}.json").read_text())
    pal = g["palabras"]

    def m(texto, n=1):
        k = 0
        for w in pal:
            if re.sub(r"[¿?¡!.,:;…]", "", w["p"]).lower() == re.sub(r"[¿?¡!.,:;…]", "", texto).lower():
                k += 1
                if k == n:
                    return w["ini"]
        raise SystemExit(f"No encontré {texto} ({n})")

    efectos = {
        ("g6", "prueba"): [
            (m("vas") - 0.02, "pop", -14),
            (m("Uno,") - 0.26, "whoosh", -14),
            (m("tour"), "pop", -16),
            (m("electricidad,") - 0.05, "pop", -16),
            (m("fontanería,") - 0.05, "pop", -16),
            (m("humedades.") - 0.05, "pop", -16),
            (m("lo", 2) - 0.03, "golpe", -16),
            (m("bajar") - 0.05, "pop", -15),
        ],
    }[(reel, version)]

    mz = Mezcla(g["duracion"] + 0.25)
    voz = leer(RAIZ / f"public/tiktok/{reel}/voz-{version}.wav")
    voz = voz / np.max(np.abs(voz))
    mz.bus[:, : len(voz)] += voz[: mz.n]
    for t, nombre, gain in efectos:
        x = leer(SFX / f"{nombre}.mp3")
        mz.poner(max(0, t), x / np.max(np.abs(x)), db(gain))
    mz.masterizar(str(RAIZ / f"public/tiktok/{reel}/mezcla-{version}.wav"), -14.0, fundido=0.05)


if __name__ == "__main__":
    main()
