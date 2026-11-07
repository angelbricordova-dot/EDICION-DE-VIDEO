"""Guarda en src/marryto/videos.json la proporción (alto / ancho) de la imagen de cada video
("imgAspecto"), para que la plantilla sepa dónde acaba la imagen y no le tape los ojos.

Uso:
    python3 scripts/marryto/medidas.py 20 21 22
"""

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]


def main():
    ruta = RAIZ / "src/marryto/videos.json"
    d = json.loads(ruta.read_text())
    for n in sys.argv[1:]:
        img = d[n].get("imagen")
        if not img:
            continue
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(RAIZ / "public" / img)], capture_output=True, text=True, check=True).stdout
        w, h = (int(x) for x in r.strip().split(",")[:2])
        d[n]["imgAspecto"] = round(h / w, 4)
        print(f"Video {n}: {img} {w}×{h} → {d[n]['imgAspecto']}")
    ruta.write_text(json.dumps(d, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
