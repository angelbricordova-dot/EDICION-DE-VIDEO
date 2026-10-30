"""Música de fondo debajo de la voz (ducking según las palabras), compartida por los proyectos.

    from musica import poner_musica
    poner_musica(mz, voz, palabras, ruta_pista, desde=0.0, bajo_voz=-18, huecos=-9)

`mz` es una `sintesis.Mezcla`, `voz` la voz en mono ya puesta en el bus y `palabras` la lista
{"ini", "fin"} de la voz. La pista se limpia (sin rumble ni agudos ásperos, picos domados), se
repite si es corta y entra y sale con fundido.
"""

import subprocess

import numpy as np

from sintesis import SR


def db(x):
    return 10 ** (x / 20)


def rms(x):
    return float(np.sqrt(np.mean(x**2))) if x.size else 0.0


def leer_musica(ruta, desde, dur):
    """Estéreo, sin graves de rumble ni agudos ásperos, picos domados."""
    filtro = "highpass=f=35,lowpass=f=14000,volume=-6dB,alimiter=limit=0.6:attack=5:release=80:level=false"
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(desde), "-stream_loop", "-1", "-i", str(ruta), "-t", str(dur),
         "-af", filtro, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float).reshape(-1, 2).T


def poner_musica(mz, voz, palabras, ruta, desde=0.0, bajo_voz=-18.0, huecos=-9.0, entrada=0.6, salida=1.2):
    """Música a `bajo_voz` dB por debajo de la voz mientras habla y a `huecos` dB en las pausas."""
    m = leer_musica(ruta, desde, mz.dur)[:, : mz.n]
    habla = np.zeros(mz.n)
    for w in palabras:
        habla[int(max(0, w["ini"] - 0.06) * SR) : int((w["fin"] + 0.12) * SR)] = 1
    v = voz[: mz.n]
    nivel_voz = rms(v[habla[: len(v)] > 0])
    # (+5 dB: el rms de la voz se mide solo donde habla; así los dB pedidos quedan cerca de lo que se oye)
    objetivo = np.where(habla > 0, db(bajo_voz + 5), db(huecos + 1)) * nivel_voz / max(rms(m), 1e-9)
    k = int(0.15 * SR)
    objetivo = np.convolve(objetivo, np.ones(k) / k, mode="same")[: m.shape[1]]
    t = np.arange(m.shape[1]) / SR
    objetivo *= np.clip(t / entrada, 0, 1) * np.clip((mz.dur - t) / salida, 0, 1)
    mz.bus[:, : m.shape[1]] += m * objetivo
