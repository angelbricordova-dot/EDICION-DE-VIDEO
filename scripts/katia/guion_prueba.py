"""Prueba para Katia (docs/katia.md): coach de fuerza, reel "¿cuánto peso coger?" (versión 2).

Uso:
    python3 scripts/katia/guion_prueba.py
Lee las tomas ya giradas a vertical (public/katia/cortes/IMG_*.mp4 + .wav) y sus palabras
(public/katia/palabras/IMG_*.json, de scripts/comun/transcribir.py). Para cada toma: quita el ruido
del gimnasio (noisereduce, no estacionario y a medias para que la voz no suene robótica), recorta a
lo que se dice y quita las pausas de dentro (jump cuts). Escribe src/katia/prueba.json (tramos,
palabras, secciones y anclas de las animaciones) y public/katia/mezcla-prueba.wav (solo voz y
efectos suaves, sin música, −14 LUFS).
noisereduce va instalado aparte: pip install --target <carpeta> noisereduce y PYTHONPATH=<carpeta>.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import noisereduce as nr
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
K = RAIZ / "public/katia"
SFX = RAIZ / "public/comun/sfx"

# Orden contado y secciones (cada sección nueva entra con un destello).
ORDEN = [
    ("5313", "gancho"), ("5316", "problema"), ("5317", "problema"),
    ("5320", "pesos"), ("5323", "pesos"), ("5325", "pesos"), ("5326", "pesos"), ("5327", "pesos"),
    ("5338", "fuerza"), ("5330", "regla"), ("5321", "regla"), ("5331", "regla"), ("5334", "regla"),
    ("5336", "compartir"), ("5337", "comentar"),
]
SOLO_VOZ = {"5338"}  # cámara mirando al suelo: solo su voz, encima el gráfico de fuerza
REDUCCION = 0.8  # cuánto ruido se quita (1 = todo; más alto suena robótico)
PAUSA_MIN = 0.2  # pausas de dentro más largas que esto se acortan…
MARGEN = 0.06  # …dejando este margen a cada lado


def limpio(p):
    return re.sub(r"[^\wáéíóúñü]", "", p.lower())


def leer(ruta, af="highpass=f=90,lowpass=f=12000"):
    cmd = ["ffmpeg", "-v", "error", "-i", str(ruta)] + (["-af", af] if af else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(float)


def silencios(x, umbral_db=-40.0, dur_min=PAUSA_MIN):
    """Tramos (ini, fin) en segundos por debajo del umbral, de al menos dur_min."""
    w = int(0.02 * SR)
    n = len(x) // w
    rms = np.sqrt(np.mean(x[: n * w].reshape(n, w) ** 2, axis=1))
    bajo = 20 * np.log10(rms + 1e-9) < umbral_db
    out, i = [], 0
    while i < n:
        if bajo[i]:
            j = i
            while j < n and bajo[j]:
                j += 1
            if (j - i) * 0.02 >= dur_min:
                out.append((i * 0.02, j * 0.02))
            i = j
        else:
            i += 1
    return out


def main():
    tramos, palabras, voces, t = [], [], [], 0.0
    for n, seccion in ORDEN:
        ps = json.loads((K / f"palabras/IMG_{n}.json").read_text())["palabras"]
        x = leer(K / f"cortes/IMG_{n}.wav")
        x = nr.reduce_noise(y=x, sr=SR, stationary=False, prop_decrease=REDUCCION, n_fft=2048, time_mask_smooth_ms=60, freq_mask_smooth_hz=400)
        sil = silencios(x)
        # Inicio real: después del silencio del principio (whisper a veces pone la 1.ª palabra en 0).
        ini = ps[0]["ini"]
        for s0, s1 in sil:
            if s0 <= ini + 0.05 < s1:
                ini = s1
        a = max(0.0, ini - 0.08)
        b = min(len(x) / SR, ps[-1]["fin"] + 0.14)
        # Partes con voz: [a, b] menos las pausas de dentro.
        partes, cur = [], a
        for s0, s1 in sil:
            if s0 > a + 0.1 and s1 < b - 0.1 and s1 - s0 >= PAUSA_MIN:
                partes.append((cur, s0 + MARGEN))
                cur = s1 - MARGEN
        partes.append((cur, b))
        inicio_toma = t
        salidas = []
        for k, (p0, p1) in enumerate(partes):
            y = x[int(p0 * SR):int(p1 * SR)].copy()
            f = int(0.01 * SR)
            y[:f] *= np.linspace(0, 1, f)
            y[-f:] *= np.linspace(1, 0, f)
            voces.append(y)
            tramos.append({"clip": n, "src": round(p0, 3), "dur": round(p1 - p0, 3), "out": round(t, 3), "seccion": seccion,
                           "soloVoz": n in SOLO_VOZ, "nuevaToma": k == 0})
            salidas.append(t)
            t += p1 - p0

        def mapa(s_):  # segundo de la toma → segundo del reel (lo que cae en una pausa quitada va al siguiente trozo)
            for (p0, p1), o in zip(partes, salidas):
                if s_ < p1:
                    return o + max(0.0, s_ - p0)
            return t

        for w in ps:
            if w["fin"] <= a or w["ini"] >= b:
                continue
            palabras.append({"p": w["p"], "ini": round(mapa(max(w["ini"], a)), 3), "fin": round(mapa(min(w["fin"], b - 0.001)), 3), "clip": n})
        assert inicio_toma <= palabras[-1]["ini"] <= t
    dur = round(t + 0.6, 2)

    def palabra(p, clip):
        return next(w["ini"] for w in palabras if w["clip"] == clip and limpio(w["p"]) == p)

    # Anclas de las animaciones (segundos del reel)
    anclas = {
        "pesosIntro": palabra("prueba", "5323"),
        "piernas": palabra("piernas", "5325"), "sentadillas": palabra("sentadillas", "5325"), "muerto": palabra("muerto", "5325"), "kgPiernas": palabra("5", "5325"),
        "espalda": palabra("espalda", "5326"), "remo": palabra("remo", "5326"), "kgEspalda": palabra("4", "5326"),
        "hombro": palabra("hombro", "5327"), "brazo": palabra("brazo", "5327"), "kgBrazo": palabra("2", "5327"),
        "fuerzaFin": next(tr["out"] + tr["dur"] for tr in tramos if tr["clip"] == "5338" and tr is [z for z in tramos if z["clip"] == "5338"][-1]),
        "regla": palabra("regla", "5321"),
        "hacer": palabra("hacer", "5331"), "diez": palabra("10", "5331"), "subas": palabra("subas", "5331"),
        "sudar": palabra("sudar", "5334"), "ultimas": palabra("últimas", "5334"),
        "comparte": palabra("comparte", "5336"), "amiga": palabra("amiga", "5336"),
        "comenta": palabra("comenta", "5337"), "reset": palabra("reset", "5337"),
    }
    secciones = [tr["out"] for i, tr in enumerate(tramos) if i > 0 and tr["seccion"] != tramos[i - 1]["seccion"]]

    voz = np.concatenate(voces)
    mz = Mezcla(dur)
    mz.poner(0, voz / max(1e-6, np.percentile(np.abs(voz), 99.5)) * 0.5, 1.0)

    def sfx(nombre, t0, db):
        mz.poner(max(0.0, t0), leer(SFX / nombre, None), 10 ** (db / 20))

    for k in ("piernas", "espalda", "hombro"):
        sfx("mixkit/pop-1.mp3", anclas[k] - 0.05, -17)
    for k in ("kgPiernas", "kgEspalda", "kgBrazo"):
        sfx("mixkit/clic-2.mp3", anclas[k], -18)
    sfx("mixkit/pop-2.mp3", anclas["hacer"] - 0.1, -18)
    sfx("mixkit/acierto.mp3", anclas["subas"] - 0.05, -18)
    sfx("mixkit/barrido-2.mp3", anclas["amiga"] - 0.05, -20)
    sfx("teclas.mp3", anclas["reset"] - 0.25, -16)
    sfx("mixkit/pop-3.mp3", anclas["reset"] + 0.75, -15)
    mz.masterizar(K / "mezcla-prueba.wav")

    (RAIZ / "src/katia/prueba.json").write_text(json.dumps({"duracion": dur, "tramos": tramos, "palabras": palabras, "anclas": anclas, "secciones": secciones}, ensure_ascii=False, indent=1))
    quitado = sum(json.loads((K / f"palabras/IMG_{n}.json").read_text())["palabras"][-1]["fin"] for n, _ in ORDEN) - t
    print(f"{dur} s, {len(tramos)} tramos ({len(ORDEN)} tomas), {len(palabras)} palabras; ~{quitado:.1f} s de pausas fuera")


if __name__ == "__main__":
    main()
