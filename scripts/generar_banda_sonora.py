"""Genera la banda sonora original del video «Cambio».

Todo se sintetiza desde cero (sin samples): música lo-fi con toques chiptune
y efectos de sonido sincronizados con las escenas de src/cambio/Cambio.tsx.

Uso:
    python3 scripts/generar_banda_sonora.py public/audio/banda-sonora.wav
"""

import sys
import wave

import numpy as np

SR = 44100
FPS = 30
DURACION = 615 / FPS  # mismo largo que la composición
N = int(SR * DURACION)

rng = np.random.default_rng(7)

musica = np.zeros((2, N))
efectos = np.zeros((2, N))
reverb_envio = np.zeros((2, N))


def f(frames: float) -> float:
    """Frames de la composición a segundos."""
    return frames / FPS


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def tiempo(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def sumar(bus: np.ndarray, señal: np.ndarray, inicio: float, vol: float = 1.0,
          pan: float = 0.0, reverb: float = 0.0) -> None:
    """Suma una señal mono al bus estéreo en el segundo `inicio`."""
    i = int(inicio * SR)
    if i >= N:
        return
    señal = señal[: N - i]
    izq = vol * np.cos((pan + 1) * np.pi / 4)
    der = vol * np.sin((pan + 1) * np.pi / 4)
    bus[0, i : i + len(señal)] += señal * izq
    bus[1, i : i + len(señal)] += señal * der
    if reverb:
        reverb_envio[0, i : i + len(señal)] += señal * izq * reverb
        reverb_envio[1, i : i + len(señal)] += señal * der * reverb


def envolvente(n: int, ataque: float, liberacion: float) -> np.ndarray:
    env = np.ones(n)
    a = min(n, int(ataque * SR))
    r = min(n - a, int(liberacion * SR))
    if a:
        env[:a] = np.linspace(0, 1, a)
    if r:
        env[n - r :] = np.linspace(1, 0, r) ** 2
    return env


def paso_bajo(x: np.ndarray, ancho: int) -> np.ndarray:
    if ancho <= 1:
        return x
    return np.convolve(x, np.ones(ancho) / ancho, mode="same")


def ruido(dur: float) -> np.ndarray:
    return rng.uniform(-1, 1, int(dur * SR))


# ---------------------------------------------------------------- instrumentos

def pad(notas: list[int], dur: float) -> np.ndarray:
    t = tiempo(dur)
    s = np.zeros_like(t)
    for nota in notas:
        for desafinado in (-0.08, 0.08):
            fr = hz(nota + desafinado)
            s += np.sin(2 * np.pi * fr * t) + 0.3 * np.sin(4 * np.pi * fr * t) + 0.1 * np.sin(6 * np.pi * fr * t)
    s *= 1 + 0.15 * np.sin(2 * np.pi * 0.3 * t)
    return s / (len(notas) * 3) * envolvente(len(t), 0.6, 0.8)


def piano_electrico(nota: int, dur: float = 1.6) -> np.ndarray:
    t = tiempo(dur)
    fr = hz(nota)
    s = np.sin(2 * np.pi * fr * t) + 0.35 * np.sin(2 * np.pi * fr * 2 * t) * np.exp(-t * 6)
    s *= np.exp(-t * 2.2) * (1 + 0.1 * np.sin(2 * np.pi * 5 * t))
    return s * envolvente(len(t), 0.005, 0.2)


def chip(nota: int, dur: float = 0.11) -> np.ndarray:
    """Onda cuadrada suave (pocas armónicas) estilo consola de 8 bits."""
    t = tiempo(dur)
    fr = hz(nota)
    s = sum(np.sin(2 * np.pi * fr * k * t) / k for k in (1, 3, 5, 7))
    return s * 0.7 * envolvente(len(t), 0.003, dur * 0.6)


def campana(nota: int, dur: float = 2.5) -> np.ndarray:
    t = tiempo(dur)
    fr = hz(nota)
    s = (np.sin(2 * np.pi * fr * t) + 0.5 * np.sin(2 * np.pi * fr * 2.76 * t) * np.exp(-t * 3)
         + 0.25 * np.sin(2 * np.pi * fr * 5.4 * t) * np.exp(-t * 6))
    return s * np.exp(-t * 1.8) * envolvente(len(t), 0.002, 0.3)


def bajo(nota: int, dur: float = 0.45) -> np.ndarray:
    t = tiempo(dur)
    fr = hz(nota)
    s = np.sin(2 * np.pi * fr * t) + 0.25 * np.sin(4 * np.pi * fr * t)
    return s * np.exp(-t * 3) * envolvente(len(t), 0.004, 0.08)


def bombo(dur: float = 0.45, grave: float = 45) -> np.ndarray:
    t = tiempo(dur)
    frecuencia = grave + 90 * np.exp(-t * 30)
    fase = 2 * np.pi * np.cumsum(frecuencia) / SR
    return np.sin(fase) * np.exp(-t * 7)


def caja(dur: float = 0.25) -> np.ndarray:
    t = tiempo(dur)
    r = np.diff(ruido(dur), prepend=0) * 0.6
    tono = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25)
    return (r * np.exp(-t * 16) + 0.5 * tono) * 0.8


def platillo(dur: float = 0.06) -> np.ndarray:
    t = tiempo(dur)
    r = np.diff(np.diff(ruido(dur), prepend=0), prepend=0) * 0.35
    return r * np.exp(-t * 60)


def tecla(dur: float = 0.035) -> np.ndarray:
    """Clic de máquina de escribir / teclado."""
    t = tiempo(dur)
    r = np.diff(ruido(dur), prepend=0)
    return (r * 0.6 + 0.4 * np.sin(2 * np.pi * 2400 * t)) * np.exp(-t * 140)


def pop(nota: int = 72) -> np.ndarray:
    t = tiempo(0.09)
    frecuencia = hz(nota) * (0.6 + 0.4 * (1 - np.exp(-t * 60)))
    fase = 2 * np.pi * np.cumsum(frecuencia) / SR
    return np.sin(fase) * np.exp(-t * 38)


def whoosh(dur: float, brillante: bool = False) -> np.ndarray:
    t = tiempo(dur)
    r = ruido(dur)
    oscuro = paso_bajo(r, 40)
    claro = paso_bajo(np.diff(paso_bajo(r, 3), prepend=0), 6) * 2
    barrido = t / dur
    s = oscuro * (1 - barrido) * 2.5 + claro * barrido * (0.8 if brillante else 0.45)
    return s * np.sin(np.pi * barrido) ** 2


def subida(dur: float) -> np.ndarray:
    """Riser: ruido que crece y se abre hacia el corte."""
    t = tiempo(dur)
    r = ruido(dur)
    barrido = t / dur
    s = paso_bajo(r, 30) * (1 - barrido) * 1.5 + paso_bajo(np.diff(r, prepend=0), 8) * barrido * 0.8
    tono = np.sin(2 * np.pi * np.cumsum(200 + 600 * barrido ** 2) / SR) * 0.15
    return (s + tono) * barrido ** 2.5


def impacto(dur: float = 1.8) -> np.ndarray:
    t = tiempo(dur)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 12)) / SR) * np.exp(-t * 2.2)
    golpe = paso_bajo(ruido(dur), 12) * np.exp(-t * 18) * 1.5
    return sub + golpe


def destello(dur: float = 1.6) -> np.ndarray:
    t = tiempo(dur)
    s = np.zeros_like(t)
    for nota, retraso in ((93, 0.0), (100, 0.04), (97, 0.08), (105, 0.12), (88, 0.02)):
        k = int(retraso * SR)
        tt = t[: len(t) - k]
        s[k:] += np.sin(2 * np.pi * hz(nota) * tt) * np.exp(-tt * 3.5) * 0.25
    brillo = paso_bajo(np.diff(ruido(dur), prepend=0), 3) * np.exp(-t * 6) * 0.15
    return s + brillo


def rasguño_vinilo(dur: float = 0.5) -> np.ndarray:
    t = tiempo(dur)
    velocidad = np.sin(2 * np.pi * 3 * t)
    fase = 2 * np.pi * np.cumsum(300 + 700 * velocidad) / SR
    tono = np.sin(fase) * 0.3
    r = paso_bajo(ruido(dur), 6) * (0.6 + 0.4 * np.abs(velocidad))
    return (tono + r) * envolvente(len(t), 0.01, 0.15)


def latido() -> np.ndarray:
    a = bombo(0.35, grave=38) * 0.9
    b = bombo(0.35, grave=34) * 0.6
    s = np.zeros(int(0.6 * SR))
    s[: len(a)] += a
    k = int(0.17 * SR)
    s[k : k + len(b)] += b
    return paso_bajo(s, 8)


def lapiz(dur: float) -> np.ndarray:
    """Roce de lápiz/bolígrafo sobre papel."""
    t = tiempo(dur)
    r = paso_bajo(np.diff(paso_bajo(ruido(dur), 3), prepend=0), 3)
    temblor = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t + rng.uniform(0, 3)))
    return r * temblor * envolvente(len(t), 0.03, 0.08) * 0.8


def aire(dur: float) -> np.ndarray:
    t = tiempo(dur)
    return paso_bajo(ruido(dur), 60) * 3 * np.sin(np.pi * t / dur) ** 2


# ---------------------------------------------------------------------- música

AM7 = [57, 60, 64, 67]
FMAJ7 = [53, 57, 60, 64]
C = [55, 60, 64, 67]
EM7 = [55, 59, 62, 64]
G = [55, 59, 62, 67]
RAIZ = {id(AM7): 45, id(FMAJ7): 41, id(C): 48, id(EM7): 40, id(G): 43}

# Intro (0–4 s): pad suave y piano.
sumar(musica, pad(AM7, 2.3), 0.0, 0.32, reverb=0.4)
sumar(musica, pad(FMAJ7, 2.2), 2.0, 0.32, reverb=0.4)
for t0, nota in ((0.0, 69), (0.75, 72), (1.5, 76), (2.0, 65), (2.75, 69), (3.25, 72)):
    sumar(musica, piano_electrico(nota), t0, 0.18, pan=0.2, reverb=0.5)

# «no lo haces» (4–6.5 s): dron oscuro y una nota grave.
t = tiempo(2.6)
dron = (np.sin(2 * np.pi * hz(33) * t) + 0.5 * np.sin(2 * np.pi * hz(40) * t)) * envolvente(len(t), 0.05, 0.5)
sumar(musica, dron, 4.0, 0.35)
sumar(musica, piano_electrico(57, 2.0), 4.05, 0.22, reverb=0.6)
sumar(musica, piano_electrico(64, 1.5), 5.5, 0.18, reverb=0.6)
sumar(efectos, subida(1.0), 5.5, 0.35)

# Ritmo (6.5–14 s): lo-fi con arpegio chiptune. Negra = 0.5 s (120 BPM).
INICIO_RITMO, FIN_RITMO, NEGRA = 6.5, 14.0, 0.5
ACORDES = [AM7, FMAJ7, C, EM7]
pulso = 0
t0 = INICIO_RITMO
while t0 < FIN_RITMO - 1e-6:
    acorde = ACORDES[(pulso // 4) % 4]
    tiempo_compas = pulso % 4
    if tiempo_compas in (0, 2):
        sumar(musica, bombo(), t0, 0.75)
    if tiempo_compas in (1, 3):
        sumar(musica, caja(), t0, 0.35, reverb=0.25)
    for sub in (0, NEGRA / 2):
        sumar(musica, platillo(), t0 + sub, 0.22, pan=0.3)
    if tiempo_compas == 0:
        sumar(musica, pad(acorde, 2.1), t0, 0.22, reverb=0.3)
        sumar(musica, bajo(RAIZ[id(acorde)]), t0, 0.5)
    if tiempo_compas == 2:
        sumar(musica, bajo(RAIZ[id(acorde)], 0.3), t0 + 0.25, 0.4)
    # Arpegio en semicorcheas una octava arriba.
    for k in range(4):
        nota = acorde[(tiempo_compas * 4 + k) % len(acorde)] + 12
        sumar(musica, chip(nota), t0 + k * NEGRA / 4, 0.07, pan=-0.3 + 0.2 * k, reverb=0.2)
    pulso += 1
    t0 += NEGRA

# Corte a negro antes de la mano.
sumar(efectos, subida(0.9), f(392), 0.3)

# Mano (14–16 s): sin batería, pad cálido que sube.
sumar(musica, pad(FMAJ7, 1.1), 14.0, 0.35, reverb=0.5)
sumar(musica, pad(G, 1.2), 15.0, 0.35, reverb=0.5)
sumar(musica, bajo(41, 1.0), 14.0, 0.35)
sumar(musica, bajo(43, 1.0), 15.0, 0.35)

# AMOR y final (16–20.5 s): resolución en Do mayor con caja de música.
sumar(musica, pad(C, 1.6), 16.0, 0.3, reverb=0.5)
sumar(musica, pad(FMAJ7, 2.1), 17.5, 0.28, reverb=0.5)
sumar(musica, pad([60, 64, 67, 71, 74], 1.5), 19.5, 0.3, reverb=0.6)
for t0, nota in ((17.5, 84), (17.9, 79), (18.3, 81), (18.7, 76), (19.1, 79), (19.5, 84), (19.75, 88)):
    sumar(musica, campana(nota, 1.6), t0, 0.12, pan=0.25, reverb=0.6)

# --------------------------------------------------------------------- efectos

# Escena 1: título, guiones, palabras escritas, destello y cierre.
sumar(efectos, impacto(1.2), 0.0, 0.5)
sumar(efectos, whoosh(0.35, brillante=True), f(12), 0.35)
for frame in (20, 27, 35, 41, 48, 58, 63):
    sumar(efectos, tecla(), f(frame), 0.35, pan=0.1)
sumar(efectos, destello(), f(56), 0.5, pan=-0.5, reverb=0.6)
sumar(efectos, whoosh(0.6), f(54), 0.4, pan=-0.6)
for i in range(4):
    sumar(efectos, pop(76 + i * 3), f(58 + i * 2), 0.25, pan=0.4)
sumar(efectos, subida(1.1), f(86), 0.4)

# Escena 2: golpe al entrar en negro y cambio de luz.
sumar(efectos, impacto(), f(120), 0.75)
sumar(efectos, aire(1.2), f(120), 0.4)
sumar(efectos, whoosh(0.4, brillante=True), f(162), 0.35)

# Anillo de objetos: un «pop» por objeto en escala pentatónica.
PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]
for i, nota in enumerate(PENTA):
    sumar(efectos, pop(nota), f(195 + i * 1.5), 0.22, pan=np.cos(i / 12 * 2 * np.pi) * 0.6)
sumar(efectos, subida(0.65), f(236), 0.4)

# Palabras clave: golpe + teclas.
def escribir(frame_inicio: int, texto: str) -> None:
    for k in range(len(texto)):
        sumar(efectos, tecla(), f(frame_inicio + k / 1.4), 0.3, pan=0.3)

sumar(efectos, impacto(0.8), f(255), 0.45)
escribir(255, "acción.")
sumar(efectos, whoosh(0.45, brillante=True), f(271), 0.45, pan=0.5)
sumar(efectos, impacto(0.8), f(300), 0.45)
sumar(efectos, whoosh(0.3), f(300), 0.35, pan=-0.5)
escribir(300, "intención.")
sumar(efectos, whoosh(0.35, brillante=True), f(316), 0.45, pan=0.5)
sumar(efectos, rasguño_vinilo(), f(330), 0.45)
escribir(330, "curiosidad.")
for frame, nota in ((332, 88), (338, 84), (344, 91), (348, 86)):
    sumar(efectos, chip(nota, 0.14), f(frame), 0.12, reverb=0.4)

# Dispersión.
for i in range(12):
    sumar(efectos, pop(96 - i * 2), f(361 + i), 0.12, pan=np.sin(i) * 0.6)
sumar(efectos, whoosh(0.7), f(374), 0.5)
for i in range(5):
    sumar(efectos, bombo(0.2, grave=70) * 0.6, f(380 + i * 4), 0.3, pan=rng.uniform(-0.6, 0.6))

# Mano: golpe, partículas brillantes y humo.
sumar(efectos, impacto(1.4), f(420), 0.55)
for i in range(10):
    sumar(efectos, campana(96 + (i * 5) % 12, 0.8), f(426 + i * 2), 0.04, pan=rng.uniform(-0.7, 0.7), reverb=0.6)
sumar(efectos, aire(0.8), f(456), 0.5)

# AMOR: latidos y una campana por letra.
sumar(efectos, latido(), f(480), 0.8)
sumar(efectos, latido(), f(500), 0.5)
for frame, nota in ((480, 72), (494, 76), (502, 79), (510, 84)):
    sumar(efectos, campana(nota, 1.4), f(frame), 0.22, reverb=0.5)
sumar(efectos, whoosh(0.3, brillante=True), f(493), 0.3)
sumar(efectos, rasguño_vinilo(0.35), f(510), 0.25)

# Final: garabatos a lápiz, letras que se juntan y lazos rojos.
for i in range(4):
    sumar(efectos, lapiz(f(16)), f(531 + i * 4), 0.2, pan=rng.uniform(-0.5, 0.5))
sumar(efectos, whoosh(0.8), f(558), 0.4)
for i in range(6):
    sumar(efectos, lapiz(f(22)), f(575 + i * 3), 0.14, pan=rng.uniform(-0.6, 0.6))

# ------------------------------------------------------------------ mezcla final

def reverb(x: np.ndarray, dur: float = 1.8) -> np.ndarray:
    t = tiempo(dur)
    ir = rng.normal(size=len(t)) * np.exp(-t * 3.2)
    ir = paso_bajo(ir, 3)
    ir /= np.sqrt(np.sum(ir**2))
    tam = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    y = np.fft.irfft(np.fft.rfft(x, tam) * np.fft.rfft(ir, tam), tam)
    return y[: len(x)]


mezcla = musica + efectos
mezcla[0] += reverb(reverb_envio[0]) * 0.5
mezcla[1] += reverb(reverb_envio[1]) * 0.5

# Fundido de salida en los últimos 0.6 s.
fundido = int(0.6 * SR)
mezcla[:, -fundido:] *= np.linspace(1, 0, fundido)

mezcla = np.tanh(mezcla * 1.1)
mezcla *= 0.89 / np.max(np.abs(mezcla))

salida = sys.argv[1] if len(sys.argv) > 1 else "banda-sonora.wav"
with wave.open(salida, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mezcla.T * 32767).astype("<i2").tobytes())
print(f"Banda sonora escrita en {salida} ({DURACION:.2f} s)")
