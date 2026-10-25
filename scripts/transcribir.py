"""Transcripción local con tiempos por palabra (faster-whisper, sin conexión).

Entorno: /home/user/tts/venv-asr (pip install faster-whisper) y el modelo
large-v3-turbo en /home/user/tts/modelos/whisper-turbo (CTranslate2, MIT).

Uso:
    /home/user/tts/venv-asr/bin/python scripts/transcribir.py audio16k.wav salida.json \
        [--guion guion.txt]

`--guion` pasa el texto esperado como pista de vocabulario (nombres, cifras). Se desactiva
el condicionamiento con el texto previo para que las repeticiones y tomas falsas aparezcan
en la transcripción y se puedan cortar.
"""

import argparse
import json
import os
import subprocess
import time

import numpy as np

os.environ.setdefault("HF_HUB_OFFLINE", "1")

from faster_whisper import WhisperModel  # noqa: E402

MODELO = "/home/user/tts/modelos/whisper-turbo"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("salida")
    ap.add_argument("--guion")
    ap.add_argument("--idioma", default="es")
    a = ap.parse_args()
    pista = open(a.guion, encoding="utf-8").read()[:800] if a.guion else None
    t0 = time.time()
    modelo = WhisperModel(MODELO, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    # El audio se decodifica con ffmpeg (16 kHz mono) para no depender de la versión de PyAV.
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", a.audio, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(crudo, dtype=np.float32)
    segs, info = modelo.transcribe(
        audio,
        language=a.idioma,
        word_timestamps=True,
        condition_on_previous_text=False,
        initial_prompt=pista,
        beam_size=5,
        vad_filter=False,
    )
    palabras, frases = [], []
    for s in segs:
        frases.append({"ini": round(s.start, 3), "fin": round(s.end, 3), "texto": s.text.strip()})
        for w in s.words or []:
            palabras.append({"ini": round(w.start, 3), "fin": round(w.end, 3), "p": w.word.strip(), "prob": round(w.probability, 3)})
        print(f"{s.start:7.2f}–{s.end:7.2f}  {s.text.strip()}", flush=True)
    json.dump({"duracion": info.duration, "frases": frases, "palabras": palabras}, open(a.salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(palabras)} palabras en {time.time() - t0:.0f} s → {a.salida}")


if __name__ == "__main__":
    main()
