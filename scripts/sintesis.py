"""Generadores de sonido y mezcla compartidos por los scripts de sonido del repo.

Todo se sintetiza con numpy (sin samples). Cada generador devuelve un arreglo
mono a 48 kHz; `Mezcla` los coloca en el tiempo y masteriza con ffmpeg.
"""

import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(11)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def filtro_banda(x, f_lo, f_hi):
    """Pasa-banda por FFT."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < f_lo) | (f > f_hi)] = 0
    return np.fft.irfft(X, len(x))


def whoosh(dur, f0, f1, pico=0.5):
    """Aire que barre de f0 a f1; pico (0..1) es donde suena más fuerte."""
    n = int(dur * SR)
    ruido = rng.uniform(-1, 1, n)
    trozos = 12
    salida = np.zeros(n)
    for k in range(trozos):
        a, b = k * n // trozos, (k + 1) * n // trozos
        fc = f0 + (f1 - f0) * (k + 0.5) / trozos
        salida[a:b] = filtro_banda(ruido, fc * 0.6, fc * 1.5)[a:b]
    x = np.linspace(0, 1, n)
    env = np.where(x < pico, x / pico, (1 - x) / (1 - pico)) ** 2
    return salida * env * 3


def blip(f, dur=0.35, tau=0.12):
    """Nota corta: algo que aterriza; mantener f en la tonalidad."""
    t = t_(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / tau) * np.minimum(1, t * 400)


def pulsado(f, dur=0.5, tau=0.18):
    """Nota pulsada cálida (tipo kalimba) para el colchón rítmico."""
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 18)
    return s * np.exp(-t / tau) * np.minimum(1, t * 300)


def pop(f0, f1, dur=0.16):
    """Algo que aparece: tarjeta, botón, etiqueta. Subir el tono en secuencias."""
    t = t_(dur)
    fase = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / dur) ** 0.5) / SR
    return np.sin(fase) * np.exp(-t * 22) * np.minimum(1, t * 600)


def click(f=1800, dur=0.05):
    """Clic de interfaz."""
    t = t_(dur)
    return (np.sin(2 * np.pi * f * t) + 0.4 * rng.uniform(-1, 1, len(t))) * np.exp(-t * 160)


def tecla():
    """Una tecla; cada llamada suena distinta."""
    t = t_(0.045)
    f = rng.uniform(2200, 3400)
    return (np.sin(2 * np.pi * f * t) * 0.4 + filtro_banda(rng.uniform(-1, 1, len(t)), 1500, 7000) * 1.6) * np.exp(-t * 130)


def golpe_papel(dur=0.25):
    """Tarjeta que se apoya sobre la mesa."""
    t = t_(dur)
    grave = np.sin(2 * np.pi * np.cumsum(110 + 90 * np.exp(-t * 40)) / SR) * np.exp(-t * 28)
    roce = filtro_banda(rng.uniform(-1, 1, len(t)), 300, 2500) * np.exp(-t * 45) * 1.5
    return grave + roce


def zumbido_error(dur=0.32):
    """Error suave: dos notas graves y ásperas."""
    t = t_(dur)
    s = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t) for f in (196.0, 207.65))
    return filtro_banda(s, 80, 1800) * np.exp(-t * 7) * np.minimum(1, t * 200) * 0.6


def trazo(dur):
    """Lápiz o marcador sobre papel."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    temblor = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 11 * t))
    return filtro_banda(rng.uniform(-1, 1, n), 2500, 9000) * temblor * np.minimum(1, t * 40) * np.minimum(1, (dur - t) * 40)


def riser(dur):
    """Subida que termina justo en el golpe; una por video."""
    t = t_(dur)
    k = t / dur
    tono = np.sin(2 * np.pi * np.cumsum(260 + 1800 * k**2) / SR) * 0.35
    aire = filtro_banda(rng.uniform(-1, 1, len(t)), 800, 6000) * 2.2
    return (tono + aire * k) * k**2.2


def impacto(dur=1.2):
    """Golpe grave para el momento héroe; uno por video."""
    t = t_(dur)
    sub = np.sin(2 * np.pi * np.cumsum(42 + 70 * np.exp(-t * 14)) / SR) * np.exp(-t * 2.6)
    golpe = filtro_banda(rng.uniform(-1, 1, len(t)), 60, 900) * np.exp(-t * 16) * 3
    return sub + golpe


def chime(fs, dur=1.8, tau=0.7):
    """Acorde de campana: llegada, acierto."""
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 4) for f in fs)
    return s / len(fs) * np.exp(-t / tau) * np.minimum(1, t * 300)


class Mezcla:
    def __init__(self, duracion):
        self.dur = duracion
        self.n = int(duracion * SR)
        self.bus = np.zeros((2, self.n))

    def poner(self, t0, x, gain, pan=0.0):
        i = int(t0 * SR)
        if i >= self.n:
            return
        x = x[: self.n - i]
        a = (pan + 1) * np.pi / 4
        self.bus[0, i : i + len(x)] += x * gain * np.cos(a)
        self.bus[1, i : i + len(x)] += x * gain * np.sin(a)

    def colchon(self, acordes, volumen, gain):
        """Pad estéreo: acordes [(inicio, [hz])], volumen [(t, v)]."""
        t = np.arange(self.n) / SR
        izq, der = np.zeros(self.n), np.zeros(self.n)
        for i, (t0, fs) in enumerate(acordes):
            t1 = acordes[i + 1][0] if i + 1 < len(acordes) else self.dur
            peso = np.clip((t - t0) / 0.35, 0, 1) * np.clip((t1 + 0.35 - t) / 0.35, 0, 1)
            for j, f in enumerate(fs):
                g = 1 / (1 + j * 0.5)
                izq += g * np.sin(2 * np.pi * (f - 0.6) * t) * peso
                der += g * np.sin(2 * np.pi * (f + 0.6) * t) * peso
        vt, vv = zip(*volumen)
        env = np.interp(t, vt, vv) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t))
        self.bus[0] += izq * env * gain
        self.bus[1] += der * env * gain

    def masterizar(self, ruta, lufs_objetivo=-14.0, techo_db=-2.0, fundido=0.25):
        """Satura suave y ajusta la ganancia hasta el LUFS objetivo; escribe WAV."""
        f = int(fundido * SR)
        self.bus[:, -f:] *= np.linspace(1, 0, f)
        mezcla = self.bus / np.max(np.abs(self.bus))
        ruta = Path(ruta)
        ganancia = 1.0
        for _ in range(6):
            x = np.tanh(mezcla * ganancia)
            x *= min(1.0, 10 ** (techo_db / 20) / np.max(np.abs(x)))
            _escribir(ruta, x)
            medido, pico = _lufs(ruta)
            if abs(medido - lufs_objetivo) < 0.3:
                break
            ganancia *= 10 ** ((lufs_objetivo - medido) / 20)
        print(f"{ruta}: {self.dur}s, {medido:.1f} LUFS, pico real {pico:.1f} dBFS")


def _escribir(ruta, x):
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x.T, -1, 1) * 32767).astype("<i2").tobytes())


def _lufs(ruta):
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(ruta), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    resumen = r.stderr[r.stderr.rfind("Summary"):]
    return float(resumen.split("I:")[1].split("LUFS")[0]), float(resumen.split("Peak:")[1].split("dBFS")[0])
