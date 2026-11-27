"""Marryto 191–192 ("Lugares abandonados antes VS ahora"): cada foto a la par con su voz (corrección 27-nov).

En el Short original las fotos no van con la voz (unas duran poco y otras mucho). Aquí cada foto dura lo
que dura su frase ("Rosie el tiburón, antes"…), entra justo cuando la voz la nombra, y se quitan los
silencios largos entre frases. La intro (su reacción con el título) baja a 3 s.

Tiempos de la voz (palabras de whisper; el inicio se corrige cuando whisper alarga la primera palabra) y tramos de cada foto en el Short (cortes de escena).
Escribe public/marryto/material/lugares2.mp4, public/marryto/audio/m191-192b.mp3 y las etiquetas en videos.json.

    python3 scripts/marryto/lugares_191.py
"""
import json  # noqa
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SHORT = RAIZ / "public/marryto/shorts200/191-192.mp4"
INTRO = 4.0  # su reacción con el título (la voz del título acaba en 2,6 s)
CORTE = 6.9  # el audio del Short sigue SIN cortes desde aquí (28-nov: que dure como el original)
COLA = 0.45  # tras el final de cada frase, antes de la siguiente foto
# (inicio de la voz, fin de la voz, texto, tramo de la foto en el Short, recuadro de la etiqueta, tamaño)
FRASES = [
    (7.05, 8.84, "Rosie el tiburón antes 🦈", (7.3, 9.767), [60, 428, 960, 180], 62),
    (9.44, 11.26, "Rosie el tiburón ahora 😳", (9.767, 13.2), [60, 428, 960, 180], 62),
    (12.85, 15.52, "Parque acuático Wild Waters\nAntes 🛝", (13.2, 15.533), [48, 402, 984, 222], 50),
    (15.45, 17.82, "Parque acuático Wild Waters\nAhora 😳", (15.533, 18.567), [48, 362, 984, 226], 50),
    (18.36, 20.24, "SS Ayrfield 🛳️\nAntes", (18.567, 21.6), [160, 284, 760, 334], 80),
    (21.42, 23.16, "SS Ayrfield 🛳️\nAhora 😳", (21.6, 25.5), [192, 108, 700, 304], 80),
    (25.3, 27.17, "Estadio Silverdome 🏟️\nAntes", (25.5, 30.333), [48, 276, 984, 286], 66),
    (30.15, 31.89, "Estadio Silverdome 🏟️\nAhora", (30.333, 33.833), [48, 276, 984, 286], 66),
    (33.59, 35.93, "Parque de atracciones 🎢\nJet Star Antes…", (33.833, 35.833), [52, 355, 976, 252], 60),
    (35.98, 37.97, "Parque de atracciones 🎢\nJet Star ahora…", (35.833, 41.28), [52, 296, 976, 252], 60),
]


VOZ = RAIZ / "public/marryto/voz/v191-1.mp3"  # Richard (ElevenLabs, toma 1 de 2, permiso del 28-nov)
MUSICA = RAIZ / "public/marryto/audio/burning-memory.mp3"
FOTO = 3.4  # cada foto al menos 3,4 s; la frase entra 0,35 s después del cambio y acaba antes del siguiente


def main():
    """28-nov: lo rehacemos nosotros: voz propia (Richard) frase a frase sin solaparse y fotos más largas."""
    S = RAIZ / "public/marryto/material"
    vj = json.loads(VOZ.with_suffix(".json").read_text())
    lineas = vj["lineas"]  # 0 = título, 1..10 = fotos
    # pistas de voz colocadas: (t_en_video, desde, hasta) en el mp3 de la voz
    colocar = [(0.15, lineas[0]["t"] - 0.05, lineas[0]["fin"] + 0.1)]
    slots, t = [], INTRO
    for k in range(1, 11):
        a, b = lineas[k]["t"] - 0.05, lineas[k]["fin"] + 0.1
        dur = max(FOTO, (b - a) + 0.8)
        colocar.append((t + 0.35, a, b))
        slots.append((t, dur))
        t += dur
    total = t + 0.3
    # video: cada foto estirada o recortada a su hueco
    filtros = []
    for n, ((_, d), (_, _, _, (f0, f1), _, _)) in enumerate(zip(slots, FRASES)):
        if n == len(slots) - 1:
            d += 0.3
        largo = f1 - f0
        if largo >= d:
            filtros.append(f"[0:v]trim={f0}:{f0 + d},setpts=PTS-STARTPTS,fps=60,setsar=1[v{n}]")
        else:
            filtros.append(f"[0:v]trim={f0}:{f1},setpts={d / largo:.4f}*(PTS-STARTPTS),fps=60,setsar=1[v{n}]")
    filtros.append("".join(f"[v{i}]" for i in range(len(slots))) + f"concat=n={len(slots)}:v=1:a=0,format=yuv420p[v]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(SHORT), "-filter_complex", ";".join(filtros), "-map", "[v]",
                    "-an", "-c:v", "libx264", "-crf", "15", "-preset", "fast", str(S / "lugares3.mp4")], check=True)
    # audio (mezcla con numpy): voz por frases + música baja debajo (más baja cuando habla), −14 LUFS
    import numpy as np
    SR = 44100

    def leer(r):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(r), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

    voz_src, mus = leer(VOZ), leer(MUSICA)
    n = int(total * SR)
    voz = np.zeros((n, 2), np.float32)
    for tv, a, b in colocar:
        seg = voz_src[int(a * SR):int(b * SR)].copy()
        f = int(0.02 * SR)
        seg[:f] *= np.linspace(0, 1, f)[:, None]
        seg[-f:] *= np.linspace(1, 0, f)[:, None]
        i0 = int(tv * SR)
        voz[i0:i0 + len(seg)] += seg[: n - i0]
    mus = np.pad(mus[:n], ((0, max(0, n - len(mus))), (0, 0)))
    hay = np.zeros(n, np.float32)
    for tv, a, b in colocar:
        hay[int((tv - 0.15) * SR):int((tv + b - a + 0.15) * SR)] = 1
    k = int(0.2 * SR)
    hay = np.convolve(hay, np.ones(k) / k, "same")
    mez = voz * 1.6 + mus * (0.85 - 0.45 * hay)[:, None] * 0.84
    tmp = RAIZ / "public/marryto/audio/_tmp191.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(tmp)], input=mez.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "256k",
                    str(RAIZ / "public/marryto/audio/m191-192c.mp3")], check=True)
    tmp.unlink()
    dur = total - INTRO
    letras = []
    for i, ((t0, d), (_, _, tx, _, caja, tam)) in enumerate(zip(slots, FRASES)):
        l = {"t": round(t0 - INTRO, 3), "y": 0, "texto": tx, "tam": tam, "caja": caja}
        if i + 1 < len(slots):
            l["hasta"] = round(t0 - INTRO + d, 3)
        letras.append(l)
    p = RAIZ / "src/marryto/videos.json"
    d = json.loads(p.read_text())
    for n_ in ("191", "192"):
        vv = d[n_]
        vv.update(fin=round(vv["inicio"] + INTRO, 2), duracion=round(total, 2))
        vv.pop("audio", None)
        vv["outro"] = {"desde": INTRO, "dur": round(dur, 2), "video": "marryto/material/lugares3.mp4", "audioTodo": "marryto/audio/m191-192c.mp3", "letras": letras}
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print("intro", INTRO, "· fotos", round(dur, 2), "s · total", round(total, 2), "s")
    for (t0, dd), (tv, a, b) in zip(slots, colocar[1:]):
        print(f"  foto {t0:6.2f}–{t0 + dd:6.2f}  voz {tv:6.2f}–{tv + b - a:6.2f}")


def main_antiguo():
    S = RAIZ / "public/marryto/material"
    # tramos de audio del Short: [voz_i, min(voz_{i+1}, fin_i + COLA)]
    # 28-nov: tramos seguidos (sin quitar silencios): cada foto va de su voz a la voz siguiente
    tramos = []
    for i, (a, fin, *_rest) in enumerate(FRASES):
        ini = CORTE if i == 0 else a
        sig = FRASES[i + 1][0] if i + 1 < len(FRASES) else 41.28
        tramos.append((ini, sig))
    # video: cada foto estirada o recortada a su tramo
    filtros, entradas, n = [], [], 0
    for (a, b), (_, _, _, (f0, f1), _, _) in zip(tramos, FRASES):
        d = b - a
        largo = f1 - f0
        if largo >= d:
            filtros.append(f"[0:v]trim={f0}:{f0 + d},setpts=PTS-STARTPTS,fps=60,setsar=1[v{n}]")
        else:
            k = d / largo
            filtros.append(f"[0:v]trim={f0}:{f1},setpts={k:.4f}*(PTS-STARTPTS),fps=60,setsar=1[v{n}]")
        n += 1
    filtros.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,format=yuv420p[v]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(SHORT), "-filter_complex", ";".join(filtros), "-map", "[v]",
                    "-an", "-c:v", "libx264", "-crf", "15", "-preset", "fast", str(S / "lugares2.mp4")], check=True)
    # audio: intro (título) + cada tramo, con fundidos de 25 ms en cada unión
    fa, m = [f"[0:a]atrim=0:{INTRO},asetpts=PTS-STARTPTS,afade=t=out:st={INTRO - 0.03}:d=0.03[a0]"], 1
    for a, b in tramos:
        fa.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.025,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[a{m}]")
        m += 1
    v = subprocess.run(["ffmpeg", "-i", str(SHORT), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    media = float(v.split("mean_volume:")[1].split("dB")[0])
    fa.append("".join(f"[a{i}]" for i in range(m)) + f"concat=n={m}:v=0:a=1,volume={-12.3 - media:.1f}dB,alimiter=limit=0.95[a]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(SHORT), "-filter_complex", ";".join(fa), "-map", "[a]",
                    "-ac", "2", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "256k", str(RAIZ / "public/marryto/audio/m191-192b.mp3")], check=True)
    dur = sum(b - a for a, b in tramos)
    letras, t = [], 0.0
    for i, ((a, b), (_, _, tx, _, caja, tam)) in enumerate(zip(tramos, FRASES)):
        l = {"t": round(t, 3), "y": 0, "texto": tx, "tam": tam, "caja": caja}
        t += b - a
        if i + 1 < len(FRASES):
            l["hasta"] = round(t, 3)
        letras.append(l)
    p = RAIZ / "src/marryto/videos.json"
    d = json.loads(p.read_text())
    for n_ in ("191", "192"):
        vv = d[n_]
        vv.update(fin=round(vv["inicio"] + INTRO, 2), duracion=round(INTRO + dur, 2))
        vv["outro"] = {"desde": INTRO, "dur": round(dur, 2), "video": "marryto/material/lugares2.mp4", "audioTodo": "marryto/audio/m191-192b.mp3", "letras": letras}
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print("intro", INTRO, "· fotos", round(dur, 2), "s · total", round(INTRO + dur, 2), "s")
    for l in letras:
        print(f"  {l['t']:6.2f}  {l['texto'].splitlines()[0]}")


if __name__ == "__main__":
    main()
