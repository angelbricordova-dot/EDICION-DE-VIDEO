"""Reel de prueba de Paul: une los clips de Flow, iguala las voces y hace la mezcla (docs/paul.md).

Antes, transcribir cada clip (palabras con tiempos):
    for i in 1 2 3 4 5; do
      ffmpeg -i public/paul/clips/clip$i.mp4 -ac 1 -ar 16000 /tmp/c$i.wav
      /home/user/tts/venv-asr/bin/python scripts/comun/transcribir.py /tmp/c$i.wav public/paul/clips/clip$i.json
    done
Uso:
    python3 scripts/paul/montar_paul.py
Escribe src/paul/prueba.json (tramos y palabras en tiempo del reel, lo lee Remotion) y
public/paul/mezcla-prueba.wav (voz igualada + música debajo, −14 LUFS).

Cada clip de Veo trae una voz algo distinta. Sin créditos de ElevenLabs para el cambiador de voz,
se igualan con ecualización: el espectro medio de cada clip se lleva al promedio de todos
(±6 dB como mucho, suavizado por tercios de octava) y el volumen de la voz a un mismo nivel.
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
CLIPS = RAIZ / "public/paul/clips"
MUSICA = RAIZ / "public/comun/musica/mixkit/valley-sunset.mp3"

# (clip, desde, hasta) en segundos del clip. Cortes justo después de la última palabra.
TRAMOS = [(1, 0.0, 6.95), (2, 0.0, 6.75), (3, 0.0, 6.55), (4, 0.0, 7.80), (5, 0.0, 7.45)]
# Clip 2: desde 5,25 s la IA pone una nube de vapor rara junto a la mano → Remotion congela el
# cuadro (public/paul/clips/clip2-congelado.jpg, sale de aquí) y se acerca a la taza ("5 MIN").
CONGELAR = {2: 5.25}
CLAVES = ["barriga", "hinchada", "jengibre", "caliente", "cinco", "minutos", "limón", "miel", "tibio",
          "siglos", "digestión", "estómago", "comenta", "sígueme"]


def leer_audio(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                           capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def espectro(x):
    """Espectro medio (magnitud) por ventanas de 2048 donde hay voz."""
    n = 2048
    v = [x[i:i + n] * np.hanning(n) for i in range(0, len(x) - n, n // 2)]
    v = [w for w in v if np.sqrt(np.mean(w**2)) > 0.01]
    return np.mean([np.abs(np.fft.rfft(w)) for w in v], axis=0)


def suavizar_octavas(g, frec, ancho=1 / 3):
    out = np.empty_like(g)
    for i, f in enumerate(frec):
        f = max(f, 40)
        m = (frec >= f * 2 ** (-ancho / 2)) & (frec <= f * 2 ** (ancho / 2))
        out[i] = np.mean(g[m]) if m.any() else g[i]
    return out


def ecualizar(x, ganancia_db, frec):
    """Filtro de fase cero con la curva de ganancia (sobre toda la señal, con relleno)."""
    n = 1 << int(np.ceil(np.log2(len(x) + SR)))
    X = np.fft.rfft(x, n)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = 10 ** (np.interp(f, frec, ganancia_db) / 20)
    return np.fft.irfft(X * g, n)[: len(x)]


def main():
    tramos, palabras, voces, t = [], [], [], 0.0
    for clip, a, b in TRAMOS:
        x = leer_audio(CLIPS / f"clip{clip}.mp4")[int(a * SR):int(b * SR)]
        voces.append(x)
        tramos.append({"clip": clip, "src": a, "dur": round(b - a, 3), "out": round(t, 3), "congelar": CONGELAR.get(clip)})
        for w in json.loads((CLIPS / f"clip{clip}.json").read_text())["palabras"]:
            if a - 0.05 <= w["ini"] < b:
                p = w["p"]
                limpia = p.strip(".,¿?¡!").lower()
                palabras.append({"p": p, "ini": round(t + w["ini"] - a, 3), "fin": round(t + min(w["fin"], b) - a, 3),
                                 "clave": limpia in CLAVES})
        t += b - a
    dur = round(t, 3)

    # Igualar timbre: cada clip hacia el espectro promedio.
    frec = np.fft.rfftfreq(2048, 1 / SR)
    esp = [espectro(x) for x in voces]
    objetivo = np.exp(np.mean([np.log(e + 1e-9) for e in esp], axis=0))
    salida = []
    for x, e in zip(voces, esp):
        g = 20 * np.log10(suavizar_octavas(objetivo / (e + 1e-9), frec))
        g = np.clip(np.where((frec > 80) & (frec < 12000), g, 0), -6, 6)
        y = ecualizar(x, g, frec)
        habla = np.abs(y) > 0.02
        y *= 0.1 / max(np.sqrt(np.mean(y[habla] ** 2)), 1e-6)  # mismo nivel de voz en todos
        salida.append(y)
    # Unión con fundidos de 15 ms para que los cortes no hagan clic.
    f = int(0.015 * SR)
    for y in salida:
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
    voz = np.concatenate(salida)

    mz = Mezcla(dur)
    mz.poner(0, voz, 1.0)
    poner_musica(mz, voz, palabras, MUSICA, desde=0.0, bajo_voz=-19, huecos=-12, entrada=0.3, salida=1.0)
    mz.masterizar(RAIZ / "public/paul/mezcla-prueba.wav")

    for clip, t_cong in CONGELAR.items():  # el cuadro que se queda quieto (Remotion lo acerca)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t_cong - 0.05), "-i", str(CLIPS / f"clip{clip}.mp4"),
                        "-frames:v", "1", "-q:v", "2", str(CLIPS / f"clip{clip}-congelado.jpg")], check=True)
    (RAIZ / "src/paul/prueba.json").write_text(json.dumps({"duracion": dur, "tramos": tramos, "palabras": palabras}, ensure_ascii=False, indent=1))
    print(f"{len(tramos)} tramos, {len(palabras)} palabras, {dur} s → src/paul/prueba.json")


if __name__ == "__main__":
    main()
