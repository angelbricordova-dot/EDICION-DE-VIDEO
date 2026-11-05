"""Rehace la voz de un episodio cambiando o añadiendo frases sueltas, sin regenerar el resto.

Uso:
    python3 scripts/glowup/empalmar.py 1
Lee src/glowup/diaN-guion.json (el orden de las frases) y, para cada frase, toma el audio de
public/glowup/diaN/nuevas/<id>.mp3 si existe (generado aparte con voz_elevenlabs.py), o si no del
tramo correspondiente de la voz original (public/glowup/diaN/voz-base.mp3 + src/glowup/diaN-voz-base.json).
Escribe public/glowup/diaN/voz.mp3 y src/glowup/diaN-voz.json (frases seguidas con 0,08 s entre
ellas; las pausas se ponen después con pausas.py). La primera vez guarda la voz original como "base".
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
SR = 44100


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).copy()


def main():
    n = int(sys.argv[1])
    d = RAIZ / f"public/glowup/dia{n}"
    voz, tiempos = d / "voz.mp3", RAIZ / f"src/glowup/dia{n}-voz.json"
    base_mp3, base_json = d / "voz-base.mp3", RAIZ / f"src/glowup/dia{n}-voz-base.json"
    if not base_mp3.exists():
        shutil.copy(voz, base_mp3)
        shutil.copy(tiempos, base_json)
    base = leer(base_mp3)
    base_lineas = json.loads(base_json.read_text())["lineas"]
    frases = json.loads((RAIZ / f"src/glowup/dia{n}-guion.json").read_text())["frases"]
    ids_base = [f["id"] for f in json.loads((RAIZ / f"src/glowup/dia{n}-guion-base.json").read_text())["frases"]] if (RAIZ / f"src/glowup/dia{n}-guion-base.json").exists() else [f["id"] for f in frases]
    por_id = dict(zip(ids_base, base_lineas))

    trozos, lineas, t = [], [], 0.0
    hueco = np.zeros(int(0.08 * SR), np.float32)
    for f in frases:
        nueva = d / "nuevas" / f"{f['id']}.mp3"
        if nueva.exists():
            x = leer(nueva)
            dur = json.loads((d / "nuevas" / f"{f['id']}.json").read_text())["duracion"]
            x = x[: int((dur + 0.06) * SR)]
            ini_rel, fin_rel = 0.0, dur
        else:
            b = por_id[f["id"]]
            a0, a1 = max(0.0, b["t"] - 0.03), b["fin"] + 0.06
            x = base[int(a0 * SR):int(a1 * SR)]
            ini_rel, fin_rel = b["t"] - a0, b["fin"] - a0
        k = min(int(0.008 * SR), len(x) // 4)
        x = x.copy()
        x[:k] *= np.linspace(0, 1, k)
        x[-k:] *= np.linspace(1, 0, k)
        lineas.append({"texto": f["texto"], "t": round(t + ini_rel, 3), "fin": round(t + fin_rel, 3)})
        trozos += [x, hueco]
        t += (len(x) + len(hueco)) / SR
    y = np.concatenate(trozos[:-1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-b:a", "192k", str(voz)], input=y.tobytes(), check=True)
    tiempos.write_text(json.dumps({"audio": str(voz.relative_to(RAIZ)), "duracion": round(len(y) / SR, 3), "lineas": lineas}, indent=2, ensure_ascii=False) + "\n")
    print(f"{voz}: {len(y) / SR:.1f} s")
    for f, l in zip(frases, lineas):
        print(f"  {l['t']:6.2f}–{l['fin']:6.2f}  {f['id']:10s} {l['texto']}")


if __name__ == "__main__":
    main()
