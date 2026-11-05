"""Prueba para Katia (docs/katia.md): coach de fuerza, reel "¿cuánto peso coger?".

Uso:
    python3 scripts/katia/guion_prueba.py
Lee las tomas ya giradas a vertical (public/katia/cortes/IMG_*.mp4 + .wav) y sus palabras
(public/katia/palabras/IMG_*.json, de scripts/comun/transcribir.py). Recorta cada toma a lo que
se dice, las pone en el orden del guion y escribe src/katia/prueba.json (tramos, palabras, títulos)
y public/katia/mezcla-prueba.wav (voz + música suave + barridos y pops, −14 LUFS).
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from musica import poner_musica  # noqa: E402
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
K = RAIZ / "public/katia"
SFX = RAIZ / "public/comun/sfx/mixkit"
MUSICA = RAIZ / "public/comun/musica/mixkit/feeling-happy.mp3"

# Orden contado: gancho → el problema → pesos de partida (piernas, espalda, hombro/brazo) → por qué
# → la regla real → compartir y comentar RESET.
ORDEN = ["5313", "5316", "5317", "5320", "5323", "5325", "5326", "5327", "5338", "5330", "5321", "5331", "5334", "5336", "5337"]
CLAVES = {"peso", "kilo", "cambios", "cuesta", "tranquilidad", "pesos", "piernas", "espalda", "hombro", "brazo", "regla", "10", "sudar", "reset", "amiga", "comparte", "comenta", "fuertes"}
NUMEROS = {"5", "8", "4", "2", "10", "un", "uno", "dos", "tres"}
# Títulos rosas fijos mientras habla de cada punto: (palabra donde empieza, desde segundo aprox., texto, hasta la palabra)
TITULOS = [
    ("piernas", 0.0, "1. Piernas: 5 – 8 kg", "sentadilla · peso muerto", "espalda"),
    ("espalda", 0.0, "2. Espalda: 4 – 8 kg", "remo", "hombro"),
    ("hombro", 0.0, "3. Brazo: 2 – 4 kg", "hombro · bíceps", "tren"),
    ("regla", 38.0, "La regla real:", "si haces +10 → sube de peso", "comparte"),
]
# Toma con la cámara mirando al suelo: solo se usa su voz; Remotion pone encima un gráfico.
SOLO_VOZ = {"5338"}


def limpio(p):
    return p.strip(".,;:¿?¡!…\"'").lower()


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def main():
    tramos, palabras, voces, t = [], [], [], 0.0
    for n in ORDEN:
        ps = json.loads((K / f"palabras/IMG_{n}.json").read_text())["palabras"]
        a = max(0.0, ps[0]["ini"] - 0.12)
        b = ps[-1]["fin"] + 0.18
        x = leer(K / f"cortes/IMG_{n}.wav")[int(a * SR):int(b * SR)]
        f = int(0.012 * SR)
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
        voces.append(x)
        dur = len(x) / SR
        tramos.append({"clip": n, "src": round(a, 3), "dur": round(dur, 3), "out": round(t, 3), "soloVoz": n in SOLO_VOZ})
        for w in ps:
            p = w["p"]
            palabras.append({"p": p, "ini": round(t + w["ini"] - a, 3), "fin": round(t + w["fin"] - a, 3),
                             "clave": limpio(p) in CLAVES or limpio(p) in NUMEROS and any(c.isdigit() for c in p)})
        t += dur
    dur = round(t + 0.3, 2)

    def palabra(p, desde=0.0):
        return next(w["ini"] for w in palabras if w["ini"] >= desde - 0.01 and limpio(w["p"]) == p)

    titulos = []
    for p, desde, txt, sub, hasta in TITULOS:
        a = palabra(p, desde)
        titulos.append({"t": round(a - 0.05, 3), "fin": round(palabra(hasta, a) - 0.1, 3), "texto": txt, "sub": sub})

    voz = np.concatenate(voces)
    mz = Mezcla(dur)
    mz.poner(0, voz / max(1e-6, np.percentile(np.abs(voz), 99.5)) * 0.5, 1.0)
    poner_musica(mz, voz, palabras, MUSICA, desde=6.0, bajo_voz=-21, huecos=-15, entrada=0.3, salida=0.8)
    for i, tr in enumerate(tramos[1:]):
        if i % 3 == 0:  # barrido suave en uno de cada tres cortes (como la referencia, sin abusar)
            mz.poner(max(0, tr["out"] - 0.12), leer(SFX / f"barrido-{1 + i % 5}.mp3"), 10 ** (-20 / 20))
    for i, ti in enumerate(titulos):
        mz.poner(ti["t"], leer(SFX / f"pop-{1 + i % 4}.mp3"), 10 ** (-14 / 20))
    mz.poner(palabra("reset") - 0.03, leer(SFX / "acierto.mp3"), 10 ** (-14 / 20))
    mz.masterizar(K / "mezcla-prueba.wav")

    (RAIZ / "src/katia/prueba.json").write_text(json.dumps({"duracion": dur, "tramos": tramos, "palabras": palabras, "titulos": titulos}, ensure_ascii=False, indent=1))
    print(f"{dur} s, {len(tramos)} tomas, {len(palabras)} palabras")
    for tr in tramos:
        print(f"  {tr['out']:6.2f}  IMG_{tr['clip']}  ({tr['dur']} s)")


if __name__ == "__main__":
    main()
