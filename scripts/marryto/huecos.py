"""Huecos de la música (pedido de Angel, 17-nov): el Short se repite en bucle, así que la música no
puede acabar a mitad de frase ni de golpe: el video termina en un "hueco" (pausa entre frases o golpes).

Uso: python3 scripts/marryto/huecos.py public/marryto/audio/m118-121.mp3 [desde] [hasta]
Imprime los momentos (s) con menos energía de voz entre `desde` y `hasta`, de mejor a peor.
"""
import subprocess
import sys

import numpy as np


def huecos(ruta, desde=5.5, hasta=10.5, sr=16000):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
    hop, n = 160, 1024  # 10 ms
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    S = np.abs(np.fft.rfft(fr, axis=1))
    f = np.fft.rfftfreq(n, 1 / sr)
    voz = 20 * np.log10(S[:, (f > 250) & (f < 3500)].sum(1) + 1e-6)
    voz = np.convolve(voz, np.ones(15) / 15, "same")  # 150 ms
    t = np.arange(len(voz)) * hop / sr
    sel = (t >= desde) & (t <= min(hasta, t[-1] - 0.05))
    idx = np.where(sel)[0]
    # mínimos locales en ventanas de 0,4 s
    cands = [i for i in idx if voz[i] == voz[max(0, i - 20):i + 21].min()]
    cands.sort(key=lambda i: voz[i])
    ref = np.percentile(voz, 75)
    return [(round(float(t[i]), 2), round(float(voz[i] - ref), 1)) for i in cands[:6]], round(float(t[-1]), 2)


if __name__ == "__main__":
    r = sys.argv[1]
    a = float(sys.argv[2]) if len(sys.argv) > 2 else 5.5
    b = float(sys.argv[3]) if len(sys.argv) > 3 else 10.5
    c, dur = huecos(r, a, b)
    print(r.split("/")[-1], "dura", dur, "huecos (s, dB bajo la voz):", c)
