"""Música y efectos (provisionales) del comercial "Tu Día en Tucacas".

Sintetiza en numpy lo que pide el BRIEF.md (sección 6.2 y 6.3) mientras no se
generen con ElevenLabs: chill-pop caribeño a 100 BPM en Sol mayor, rasgueo
tipo cuatro, maracas, palmas suaves, bajo cálido y melodía de steel drum.
Lee los tiempos de src/tucacas/guion-<version>.json.

Mezcla del brief: música a −10 dB donde no hay voz y −18 dB debajo de la voz,
efectos a −14 dB y loudness final −14 LUFS.

Uso:
    python3 scripts/sonido_tucacas.py 30s public/tucacas/audio/mezcla-30s.wav
    python3 scripts/sonido_tucacas.py 60s salida.wav --voz voz-60s.mp3
"""

import argparse
import json
import subprocess
from functools import lru_cache
from pathlib import Path

import numpy as np

from sintesis import SR, Mezcla, chime, click, filtro_banda, rng, t_, whoosh

RAIZ = Path(__file__).resolve().parent.parent


def hz(nota):
    return 440.0 * 2 ** ((nota - 69) / 12)


def db(x):
    return 10 ** (x / 20)


def normal(x):
    m = np.max(np.abs(x))
    return x / m if m > 0 else x


# ------------------------------------------------------------------ instrumentos


@lru_cache(maxsize=None)
def cuerda(nota, dur=1.4, brillo=0.5):
    """Cuerda pulsada (Karplus-Strong) calculada por bloques de un período."""
    f = hz(nota)
    n = int(dur * SR)
    p = max(2, int(round(SR / f)))
    y = np.zeros(n + p)
    y[:p] = filtro_banda(rng.uniform(-1, 1, p * 4), 60, 2500 + 6000 * brillo)[:p]
    decaimiento = 0.996
    for i in range(p, n + p, p):
        prev = y[i - p : i]
        siguiente = 0.5 * (prev + np.roll(prev, 1)) * decaimiento
        fin = min(i + p, n + p)
        y[i:fin] = siguiente[: fin - i]
    return y[:n] * np.exp(-np.arange(n) / SR * 1.6)


def rasgueo(notas, arriba=False, fuerza=1.0):
    """Rasgueo de cuatro: cuerdas desfasadas 11 ms (hacia arriba invierte el orden)."""
    orden = list(reversed(notas)) if arriba else list(notas)
    total = np.zeros(int(1.5 * SR))
    for i, nota in enumerate(orden):
        c = cuerda(nota) * (0.75 if arriba else 1.0)
        k = int(i * 0.011 * SR)
        total[k : k + len(c)] += c[: len(total) - k]
    return total * fuerza


def bajo(nota, dur=0.55):
    t = t_(dur)
    f = hz(nota)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * np.exp(-t * 4.5) * np.minimum(1, t * 250)


def maraca(acento=1.0):
    t = t_(0.07)
    return filtro_banda(rng.uniform(-1, 1, len(t)), 4500, 12000) * np.exp(-t * 55) * acento


def palma():
    t = t_(0.18)
    s = np.zeros(len(t))
    for d in (0, 0.009, 0.019):
        k = int(d * SR)
        s[k:] += filtro_banda(rng.uniform(-1, 1, len(t) - k), 900, 3500) * np.exp(-t[: len(t) - k] * 38)
    return s


def steel(nota, dur=0.9):
    """Steel drum: fundamental + octava + quinta superior con caída rápida."""
    t = t_(dur)
    f = hz(nota)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.25 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return s * np.exp(-t * 3.2) * np.minimum(1, t * 500)


def colchon(notas, dur):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * hz(n) * t + j) for j, n in enumerate(notas))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return s / len(notas) * env


# ------------------------------------------------------------------- efectos


def olas(dur):
    t = t_(dur)
    ruido = filtro_banda(rng.uniform(-1, 1, len(t)), 80, 2200)
    vaiven = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 3.2 - np.pi / 2)) ** 2
    return ruido * vaiven * np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 1.2)


def gaviotas(dur=4.0):
    total = np.zeros(int(dur * SR))
    for k, t0 in enumerate((0.2, 0.75, 2.1, 2.5)):
        n = int(0.32 * SR)
        t = np.arange(n) / SR
        f = 2600 - 900 * (t / 0.32) + 120 * np.sin(2 * np.pi * 22 * t)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.32) ** 1.5 * (0.6 if k % 2 else 1)
        i = int(t0 * SR)
        total[i : i + n] += s
    return total


def brisa(dur):
    t = t_(dur)
    ruido = filtro_banda(rng.uniform(-1, 1, len(t)), 300, 5000)
    return ruido * (0.5 + 0.5 * np.sin(2 * np.pi * t / 2.3) ** 2) * np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 1)


def chapuzon(dur=1.6):
    t = t_(dur)
    golpe = filtro_banda(rng.uniform(-1, 1, len(t)), 150, 6000) * np.exp(-t * 7)
    burbujas = sum(
        np.sin(2 * np.pi * rng.uniform(500, 1400) * (1 + 2 * (t - d).clip(0)) * (t - d).clip(0)) * np.exp(-(t - d).clip(0) * 25) * (t > d)
        for d in rng.uniform(0.15, 0.9, 7)
    )
    return golpe + 0.25 * burbujas


def llave(dur=1.4):
    total = np.zeros(int(dur * SR))
    for d, f in ((0.05, 3200), (0.18, 2600), (0.42, 1800), (0.5, 1500)):
        c = click(f, 0.06) * 0.8
        i = int(d * SR)
        total[i : i + len(c)] += c
    puerta = filtro_banda(rng.uniform(-1, 1, int(0.6 * SR)), 100, 900) * np.exp(-np.arange(int(0.6 * SR)) / SR * 6)
    i = int(0.7 * SR)
    total[i : i + len(puerta)] += puerta * 0.7
    return total


def control_aire():
    t = t_(0.12)
    pitido = np.sin(2 * np.pi * 2100 * t) * np.minimum(1, (0.12 - t) * 80)
    soplido = whoosh(1.4, 200, 900, 0.35) * 0.5
    total = np.zeros(int(1.8 * SR))
    total[: len(pitido)] += pitido * 0.6
    i = int(0.25 * SR)
    total[i : i + len(soplido)] += soplido
    return total


def mensaje():
    total = np.zeros(int(0.5 * SR))
    for d, f in ((0, hz(79)), (0.08, hz(86))):
        t = t_(0.25)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t * 18) * np.minimum(1, t * 500)
        i = int(d * SR)
        total[i : i + len(s)] += s
    return total


def burbuja():
    t = t_(0.25)
    return np.sin(2 * np.pi * np.cumsum(500 + 900 * t / 0.25) / SR) * np.exp(-t * 14)


def lancha(dur=4.0):
    t = t_(dur)
    motor = sum(np.sin(2 * np.pi * f * t) for f in (62, 124, 186)) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t))
    agua = filtro_banda(rng.uniform(-1, 1, len(t)), 300, 3000) * 0.6
    paso = np.sin(np.pi * t / dur) ** 1.5
    return filtro_banda(motor, 40, 600) * paso + agua * paso


def grillos(dur):
    t = t_(dur)
    tono = np.sin(2 * np.pi * 4600 * t)
    pulso = (np.sin(2 * np.pi * 28 * t) > 0.2) * (np.sin(2 * np.pi * 0.9 * t) > -0.2)
    return tono * pulso * 0.5 * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)


EFECTOS = {
    "olas": lambda: olas(6.0),
    "gaviotas": gaviotas,
    "brisa": lambda: brisa(5.0),
    "chapuzon": chapuzon,
    "llave": llave,
    "control": control_aire,
    "whoosh": lambda: whoosh(0.8, 400, 2400, 0.6),
    "clic": lambda: click(1900, 0.06),
    "mensaje": mensaje,
    "burbuja": burbuja,
    "lancha": lambda: lancha(4.0),
    "grillos": lambda: grillos(5.0),
}

# --------------------------------------------------------------------- música

# Sol mayor: G · D · Em · C (voces del cuatro y bajo)
ACORDES = [
    ([55, 59, 62, 67], 43),
    ([54, 57, 62, 66], 38),
    ([55, 59, 64, 67], 40),
    ([55, 60, 64, 67], 36),
]
MELODIA = [79, 76, 74, 76, 79, 81, 79, 76, 74, 71, 74, 76, 74, None, 71, 74]


def musica(dur, secciones, final):
    """secciones: lista de (inicio, fin, nombre) con nombre en intro/lleno/calma/subida."""
    negra = 60 / 100
    compas = negra * 4
    desfase = final % compas  # para que el acorde final caiga en tiempo 1
    n = int(dur * SR)
    bus = np.zeros(n)

    def poner(t0, x, g):
        i = int(t0 * SR)
        if 0 <= i < n:
            x = x[: n - i]
            bus[i : i + len(x)] += x * g

    def seccion(t):
        for a, b, nombre in secciones:
            if a <= t < b:
                return nombre
        return "lleno"

    PATRON = [(0, False, 1.0), (0.75, True, 0.55), (1.5, False, 0.8), (2.0, True, 0.6), (2.5, False, 0.85), (3.0, True, 0.55), (3.5, False, 0.7)]
    c = 0
    t0 = desfase - compas if desfase > 0.2 else desfase
    while t0 < final - 1e-6:
        notas, raiz = ACORDES[c % 4]
        modo = seccion(max(t0, 0))
        for b, arriba, g in PATRON:
            tb = t0 + b * negra
            if tb < 0 or tb >= final:
                continue
            if modo == "calma" and b not in (0, 2):
                continue
            poner(tb, rasgueo(notas, arriba), 0.16 * g * (0.6 if modo in ("intro", "calma") else 1))
        if modo in ("lleno", "subida"):
            for b in (0, 1.5, 2.0, 3.0):
                if t0 + b * negra >= 0:
                    poner(t0 + b * negra, bajo(raiz if b != 3.0 else raiz + 7), 0.34 if b == 0 else 0.22)
            for k in range(8):
                tb = t0 + k * negra / 2
                if tb >= 0:
                    poner(tb, maraca(1 if k % 2 else 0.55), 0.12)
            for b in (1, 3):
                poner(t0 + b * negra, palma(), 0.09 if modo == "lleno" else 0.13)
            densidad = 1 if modo == "subida" else 2
            for k in range(0, 8, densidad):
                nota = MELODIA[(c * 4 + k // 2) % len(MELODIA)]
                if nota is not None and (modo == "subida" or k % 4 == 0):
                    poner(t0 + k * negra / 2, steel(nota + (12 if modo == "subida" and k % 4 == 2 else 0)), 0.07)
        if modo == "calma":
            poner(max(t0, 0), colchon([n - 12 for n in notas], compas + 0.4), 0.05)
        c += 1
        t0 += compas
    # Acorde final limpio, sin fundido.
    notas, raiz = ACORDES[0]
    poner(final, rasgueo(notas + [71, 74], False, 1.2), 0.2)
    poner(final, bajo(raiz, 1.4), 0.4)
    poner(final, steel(79, 1.6), 0.1)
    poner(final + 0.02, chime([hz(79), hz(83), hz(86)], 1.4), 0.06)
    return bus


ESTRUCTURA = {
    "30s": {"secciones": [(0, 3, "intro"), (3, 20, "lleno"), (20, 26, "subida"), (26, 29, "lleno")], "final": 29.0},
    "60s": {
        "secciones": [(0, 4, "intro"), (4, 42, "lleno"), (42, 47, "calma"), (47, 54, "subida"), (54, 59, "lleno")],
        "final": 59.0,
    },
}


def leer_audio(ruta, n):
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(crudo, dtype=np.float32).astype(float)
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def leer_estereo(ruta, n):
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(crudo, dtype=np.float32).astype(float).reshape(-1, 2).T
    return np.pad(x, ((0, 0), (0, max(0, n - x.shape[1]))))[:, :n]


# Nombre del efecto en el guion -> archivo generado con ElevenLabs (sección 6.3 del brief).
ARCHIVOS_EFECTOS = {
    "olas": "sfx-olas",
    "gaviotas": "sfx-gaviotas",
    "brisa": "sfx-brisa-palmeras",
    "chapuzon": "sfx-chapuzon",
    "llave": "sfx-llave",
    "control": "sfx-control-aire",
    "whoosh": "sfx-whoosh",
    "clic": "sfx-clic-ui",
    "mensaje": "sfx-mensaje",
    "lancha": "sfx-lancha",
    "grillos": "sfx-grillos",
}


def efecto(nombre, carpeta):
    """El efecto de ElevenLabs si existe en `carpeta`; si no, el sintetizado."""
    if carpeta and nombre in ARCHIVOS_EFECTOS:
        ruta = Path(carpeta) / f"{ARCHIVOS_EFECTOS[nombre]}.mp3"
        if ruta.exists():
            crudo = subprocess.run(
                ["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                capture_output=True,
                check=True,
            ).stdout
            return np.frombuffer(crudo, dtype=np.float32).astype(float)
    return EFECTOS[nombre]()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("version", choices=["30s", "60s"])
    ap.add_argument("salida")
    ap.add_argument("--voz", help="locución (mp3/wav); si se pasa, la música se agacha debajo de la voz")
    ap.add_argument("--musica", help="pista de música generada (mp3); si no, se sintetiza")
    ap.add_argument("--efectos", help="carpeta con los sfx-*.mp3 generados; los que falten se sintetizan")
    ap.add_argument("--guion", help="otro guion JSON (p. ej. src/tucacas/web/guion-web-60s.json)")
    a = ap.parse_args()

    ruta_guion = Path(a.guion) if a.guion else RAIZ / f"src/tucacas/guion-{a.version}.json"
    guion = json.loads(ruta_guion.read_text())
    dur = guion["duracion"]
    est = ESTRUCTURA[a.version]
    m = Mezcla(dur)

    # Música: −10 dB donde no hay voz; −18 dB mientras se habla (si hay voz).
    if a.musica:
        mus = leer_estereo(a.musica, m.n)
        mus = mus / np.max(np.abs(mus))
    else:
        mus = np.tile(normal(musica(dur, est["secciones"], est["final"])), (2, 1))
    t = np.arange(m.n) / SR
    nivel = np.full(m.n, db(-10))
    if a.voz:
        for f in guion["frases"]:
            dentro = (t >= f["desde"] - 0.15) & (t <= f["hasta"] + 0.25)
            nivel[dentro] = db(-18)
    # De noche la música baja 6 dB más y quedan los grillos.
    if guion.get("noche"):
        a0, b0 = guion["noche"]
        nivel[(t >= a0) & (t < b0)] *= db(-6)
    nivel = np.convolve(nivel, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
    if a.voz:
        m.bus += normal(leer_audio(a.voz, m.n))
    m.bus += mus * nivel

    # Efectos a −14 dB.
    for e in guion["efectos"]:
        x = normal(efecto(e["sonido"], a.efectos))
        m.poner(e["t"], x, db(-14) * e.get("gain", 1), e.get("pan", 0))

    Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
    m.masterizar(a.salida, -14.0, fundido=0.05)


if __name__ == "__main__":
    main()
