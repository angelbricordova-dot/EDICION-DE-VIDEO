"""Mete pausas entre las frases de una voz de ElevenLabs (Fernando habla sin respirar).

Uso:
    python3 scripts/glowup/pausas.py src/glowup/dia0-voz.json public/glowup/dia0/voz.mp3 \\
        public/glowup/dia0/voz-pausas.wav 0.5 0.35 0.5 0.45 0.6 0.5 0.3 0.5
Las pausas van después de cada frase (una por frase menos la última). Corta en el punto medio
entre frases y reescribe los tiempos de cada frase en el mismo JSON (campos t2/fin2).
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 44100


def main():
    tiempos, entrada, salida, *pausas = sys.argv[1:]
    pausas = [float(p) for p in pausas]
    d = json.loads(Path(tiempos).read_text())
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", entrada, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(crudo, dtype=np.float32)
    lineas = d["lineas"]
    cortes = [0.0] + [(a["fin"] + b["t"]) / 2 for a, b in zip(lineas, lineas[1:])] + [len(x) / SR]
    trozos, desplaz = [], 0.0
    for i, l in enumerate(lineas):
        a, b = cortes[i], cortes[i + 1]
        tr = x[int(a * SR):int(b * SR)].copy()
        f = int(0.01 * SR)
        tr[:f] *= np.linspace(0, 1, f)
        tr[-f:] *= np.linspace(1, 0, f)
        trozos.append(tr)
        l["t2"], l["fin2"] = round(l["t"] + desplaz, 3), round(l["fin"] + desplaz, 3)
        if i < len(pausas):
            trozos.append(np.zeros(int(pausas[i] * SR), np.float32))
            desplaz += pausas[i]
    y = np.concatenate(trozos)
    d["audio_pausas"], d["duracion2"] = salida, round(len(y) / SR, 3)
    Path(tiempos).write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", salida], input=y.tobytes(), check=True)
    print(f"{salida}: {len(y) / SR:.1f} s")
    for l in lineas:
        print(f"  {l['t2']:6.2f}–{l['fin2']:6.2f}  {l['texto']}")


if __name__ == "__main__":
    main()
