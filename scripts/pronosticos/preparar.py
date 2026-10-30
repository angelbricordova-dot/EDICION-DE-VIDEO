"""Palabras con tiempos de un video de pronósticos → src/pronosticos/<video>.json.

El video es una sola toma (sin cortes): se usan las palabras alineadas (scripts/comun/alinear.py)
con las correcciones de nombres y marcadores.

Uso:
    python3 scripts/pronosticos/preparar.py milan-inter
"""

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]

# Lo que Whisper escribe mal → como debe salir en pantalla.
CORRECCIONES = {"Calanoglio": "Çalhanoğlu", "derbys": "derbis", "derby": "derbi"}


def main():
    video = sys.argv[1]
    d = RAIZ / "public/pronosticos"
    pal = json.loads((d / "palabras-alineadas.json").read_text())["palabras"]
    out = []
    for w in pal:
        p = w["p"]
        # "1 -0," → "1-0,"
        if p.startswith("-") and p[1:2].isdigit() and out and out[-1]["p"].isdigit():
            out[-1]["p"] += p
            out[-1]["fin"] = w["fin"]
            continue
        base = p.rstrip(".,?")
        if base in CORRECCIONES:
            p = CORRECCIONES[base] + p[len(base):]
        out.append({"p": p, "ini": round(w["ini"], 3), "fin": round(w["fin"], 3)})
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(d / "bruto.mp4")], capture_output=True, text=True).stdout)
    destino = RAIZ / f"src/pronosticos/{video}.json"
    destino.write_text(json.dumps({"duracion": round(dur, 3), "palabras": out}, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(out)} palabras, {dur:.2f} s → {destino}")
    print(" ".join(f"{w['p']}[{w['ini']:.2f}]" for w in out))


if __name__ == "__main__":
    main()
