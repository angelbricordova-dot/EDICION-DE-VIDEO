"""Jay (IamKingJay) · vídeo 1: vlog con Landis + 1v1 con Ongu. Lista de cortes (EDL), subtítulos y mezcla.

Monta el día en orden (docs/jordan.md): de cada clip toma las frases de su transcripción (whisper, en
public/jordan/transcripcion/) hasta llenar su presupuesto de segundos, quitando silencios; los clips sin voz van
como planos cortos; del 1v1 (IMG_0103) toma los tiros al aro detectados por el movimiento de la red.

    python3 scripts/jordan/montaje.py borrador     # 960×540 desde los proxies → out/jordan/borrador.mp4
    python3 scripts/jordan/montaje.py final        # 1920×1080 60 fps leyendo los 4K del transfer

Salidas: src/jordan/edl.json, public/jordan/subs.ass, public/jordan/mezcla.wav y el vídeo.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
J = RAIZ / "public/jordan"
TR = J / "transcripcion"
SR = 48000
GAP = 0.45  # silencio que se corta
PRE, POST = 0.12, 0.22

# (clip, segundos de voz a usar | None = plano sin voz (desde, hasta), rótulo de lugar)
PLAN = [
    ("IMG_0938", 24, "5:30am"),
    ("IMG_0939", (0.5, 3.5), None),
    ("IMG_1070", 20, None),
    ("IMG_1071", (20, 26), None), ("IMG_1072", (40, 46), None), ("IMG_1073", (10, 16), None), ("IMG_1074", (20, 25), None),
    ("1V1", None, "1v1 vs ongu"),
    ("IMG_1078", 20, "el curro"),
    ("IMG_1079", 24, None),
    ("IMG_1086", 6, None),
    ("IMG_1088", 28, "rumbo a la roca"),
    ("IMG_1090", 10, None),
    ("IMG_1092", 24, "la roca village"),
    ("IMG_1095", 12, None), ("IMG_1096", 8, None), ("IMG_1097", 14, None),
    ("IMG_1100", 3, None), ("IMG_1101", 5, None), ("IMG_1102", 5, None),
    ("IMG_1103", 12, None), ("IMG_1104", 16, None), ("IMG_1105", 14, None), ("IMG_1107", 14, None),
    ("IMG_1110", 18, None),
    ("IMG_1111", 14, "adidas"), ("IMG_1112", 12, None), ("IMG_1113", 14, None), ("IMG_1115", 5, None),
    ("IMG_1116", 16, None), ("IMG_1117", 12, None), ("IMG_1119", 8, None), ("IMG_1120", 18, None), ("IMG_1121", 22, None),
    ("IMG_1122", 22, None), ("IMG_1123", 5, None), ("IMG_1124", 16, None), ("IMG_1125", 3, None),
    ("IMG_1126", 8, "de vuelta a casa"), ("IMG_1127", 10, None), ("IMG_1129", 15, None),
    ("IMG_1130", 7, "cena dominicana"), ("IMG_1131", 7, None), ("IMG_1132", 10, None), ("IMG_1133", 16, None),
    ("IMG_1135", 8, None), ("IMG_1136", 14, None),
]
# tiros al aro del 1v1 (movimiento de la red, revisados a ojo): 6 s antes y 2,5 después
TIROS = [166.65, 296.95, 383.8, 504.15, 567.15, 739.55, 837.05, 1038.0, 1091.65, 1297.7, 1568.0, 1609.15]
# ventana del 1v1 (en el proxy 960×540): zoom ×1,6 alrededor del aro
ZOOM_1V1 = (490, 275, 1.6)


def frases(clip, presupuesto):
    """Tramos de voz [a, b] (en el clip) hasta llenar el presupuesto, cortando silencios > GAP."""
    d = json.loads((TR / f"{clip}.json").read_text())
    ws = [(w.strip(), a, b) for s in d["segs"] for w, a, b in s["w"] if w.strip()]
    if not ws:
        return [], []
    tramos = [[ws[0][1], ws[0][2], [ws[0]]]]
    for w in ws[1:]:
        if w[1] - tramos[-1][1] < GAP:
            tramos[-1][1] = w[2]
            tramos[-1][2].append(w)
        else:
            tramos.append([w[1], w[2], [w]])
    out, usado = [], 0.0
    for a, b, pal in tramos:
        if usado >= presupuesto:
            break
        out.append((max(0.0, a - PRE), b + POST, pal))
        usado += b - a
    return out


def edl():
    cortes = []
    for clip, p, rotulo in PLAN:
        if clip == "1V1":
            for k, t in enumerate(TIROS):
                cortes.append({"clip": "IMG_0103", "a": t - 6.0, "b": t + 2.5, "pal": [], "zoom": ZOOM_1V1, "musica": True,
                               "rotulo": rotulo if k == 0 else None})
            continue
        if isinstance(p, tuple):
            cortes.append({"clip": clip, "a": p[0], "b": p[1], "pal": [], "zoom": None, "rotulo": rotulo})
            continue
        for i, (a, b, pal) in enumerate(frases(clip, p)):
            # cada dos cortes del mismo clip, un acercamiento suave (como un segundo plano)
            cortes.append({"clip": clip, "a": round(a, 3), "b": round(b, 3), "pal": pal,
                           "zoom": (480, 250, 1.18) if i % 2 == 1 else None, "rotulo": rotulo if i == 0 else None})
    t = 0.0
    for c in cortes:
        c["t"] = round(t, 3)
        t += c["b"] - c["a"]
    return cortes, t


def ass(cortes, ruta):
    """Subtítulos pequeños en minúsculas, blancos, abajo (como la referencia) y rótulos de lugar al centro."""
    def ts(x):
        h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
        return f"{h}:{m:02d}:{s:05.2f}"
    cab = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter Medium,38,&H00FFFFFF,&H00FFFFFF,&H64000000,&H00000000,0,0,0,0,100,100,0,0,1,1.2,1.5,2,200,200,78,1
Style: Lugar,Inter Light,58,&H00FFFFFF,&H00FFFFFF,&H50000000,&H00000000,0,0,0,0,100,100,1,0,1,0.8,1.5,5,100,100,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lineas = []
    for c in cortes:
        if c.get("rotulo"):
            lineas.append(f"Dialogue: 0,{ts(c['t'] + 0.15)},{ts(c['t'] + 2.4)},Lugar,,0,0,0,,{{\\fad(150,250)}}{c['rotulo']}")
        bloque = []
        for w, a, b in c["pal"]:
            ta = c["t"] + (a - c["a"])
            tb = c["t"] + (b - c["a"])
            if ta < c["t"] or tb > c["t"] + (c["b"] - c["a"]) + 0.05:
                continue
            bloque.append((w, ta, tb))
            texto = " ".join(x[0] for x in bloque)
            if len(texto) > 34 or w.endswith((".", "?", "!", ",")):
                lineas.append((bloque[0][1], bloque[-1][2], texto))
                bloque = []
        if bloque:
            lineas.append((bloque[0][1], bloque[-1][2], " ".join(x[0] for x in bloque)))
    eventos = [l for l in lineas if isinstance(l, str)]
    subs = sorted([l for l in lineas if not isinstance(l, str)])
    for i, (a, b, tx) in enumerate(subs):
        fin = min(b + 0.25, subs[i + 1][0]) if i + 1 < len(subs) else b + 0.25
        tx = tx.lower().replace("{", "(").replace("}", ")")
        eventos.append(f"Dialogue: 1,{ts(a)},{ts(fin)},Sub,,0,0,0,,{tx}")
    ruta.write_text(cab + "\n".join(eventos) + "\n")
    return len(subs)


def mezcla(voz_wav, cortes, dur, ruta):
    """Voz de los clips (ya concatenada) + música baja debajo (más alta en el 1v1 y en planos sin voz), −14 LUFS."""
    def leer(r, canales=2):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(r), "-ac", str(canales), "-ar", str(SR), "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        return np.frombuffer(raw, np.float32).reshape(-1, canales).copy()
    voz = leer(voz_wav)
    n = int(dur * SR)
    voz = np.pad(voz[:n], ((0, max(0, n - len(voz))), (0, 0)))
    mus = leer(J / "musica/vlog1.mp3")
    reps = int(np.ceil(n / len(mus))) + 1
    mus = np.concatenate([mus] * reps)[:n]
    g = np.full(n, 10 ** (-20 / 20))  # bajo la voz
    for c in cortes:
        i0, i1 = int(c["t"] * SR), int((c["t"] + c["b"] - c["a"]) * SR)
        if not c["pal"]:
            g[i0:i1] = 10 ** ((-9 if c.get("musica") else -12) / 20)
    k = int(0.3 * SR)
    g = np.convolve(g, np.ones(k) / k, "same")
    voz_g = 10 ** ((-1 if True else 0) / 20)
    x = voz * voz_g + mus * g[:, None] * 0.6
    tmp = J / "_mezcla_tmp.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(tmp)], input=x.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(ruta)], check=True)
    tmp.unlink()


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "borrador"
    cortes, dur = edl()
    (RAIZ / "src/jordan").mkdir(exist_ok=True)
    (RAIZ / "src/jordan/edl.json").write_text(json.dumps({"duracion": round(dur, 2), "cortes": cortes}, ensure_ascii=False, indent=1))
    n_subs = ass(cortes, J / "subs.ass")
    print(f"{len(cortes)} cortes · {dur / 60:.1f} min · {n_subs} subtítulos")
    if modo == "edl":
        return
    W, H = (960, 540) if modo == "borrador" else (1920, 1080)
    seg_dir = J / f"seg_{modo}"
    seg_dir.mkdir(exist_ok=True)
    lista = []
    url = None
    if modo == "final":
        sys.path.insert(0, str(Path(__file__).parent))
        from proxies import url_nueva
        url, indice = url_nueva(), {Path(i["nombre"]).stem: i for i in json.loads((J / "indice.json").read_text())}
    for i, c in enumerate(cortes):
        out = seg_dir / f"{i:04d}.ts"
        lista.append(out)
        if out.exists() and out.stat().st_size > 1000:
            continue
        if modo == "final":
            it = indice[c["clip"]]
            src = ["-protocol_whitelist", "subfile,https,http,tls,tcp,crypto,file", "-ss", str(c["a"]),
                   "-i", f"subfile,,start,{it['datos']},end,{it['datos'] + it['tam']},,:{url}"]
            esc = 4  # 4K → coordenadas del proxy ×4
        else:
            src = ["-ss", str(c["a"]), "-i", str(J / "proxies" / f"{c['clip']}.mp4")]
            esc = 1
        vf = []
        if c["zoom"]:
            cx, cy, z = c["zoom"]
            pw, ph = (3840, 2160) if modo == "final" else (960, 540)
            cw, ch = int(pw / z) // 2 * 2, int(ph / z) // 2 * 2
            x0 = int(min(max(cx * pw / 960 - cw / 2, 0), pw - cw))
            y0 = int(min(max(cy * ph / 540 - ch / 2, 0), ph - ch))
            vf.append(f"crop={cw}:{ch}:{x0}:{y0}")
        vf += [f"scale={W}:{H}:flags=lanczos", "fps=60", "setsar=1"]
        r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *src, "-t", str(c["b"] - c["a"]), "-map", "0:v:0", "-map", "0:a:0?",
                            "-vf", ",".join(vf), "-c:v", "libx264", "-preset", "veryfast" if modo == "borrador" else "medium",
                            "-crf", "24" if modo == "borrador" else "18", "-pix_fmt", "yuv420p",
                            "-c:a", "aac", "-ar", str(SR), "-ac", "2", "-b:a", "192k", "-f", "mpegts", str(out)], capture_output=True, text=True)
        if r.returncode:
            print("FALLO", i, c["clip"], r.stderr[-300:])
        print(i, c["clip"], round(c["b"] - c["a"], 2), flush=True)
    cat = J / f"_cat_{modo}.txt"
    cat.write_text("".join(f"file '{p}'\n" for p in lista))
    unido = J / f"_unido_{modo}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(cat), "-c", "copy", str(unido)], check=True)
    voz = J / "_voz.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(unido), "-vn", "-ac", "2", "-ar", str(SR), str(voz)], check=True)
    mezcla(voz, cortes, dur, J / "mezcla.wav")
    destino = RAIZ / "out/jordan" / ("borrador.mp4" if modo == "borrador" else "vlog1-final.mp4")
    fuentes = J / "fuentes"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(unido), "-i", str(J / "mezcla.wav"), "-map", "0:v", "-map", "1:a",
                    "-vf", f"subtitles={J / 'subs.ass'}:fontsdir={fuentes}",
                    "-c:v", "libx264", "-preset", "medium" if modo == "borrador" else "slow", "-crf", "26" if modo == "borrador" else "19",
                    "-pix_fmt", "yuv420p", "-r", "60", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(destino)], check=True)
    for p in (unido, voz, cat):
        p.unlink()
    print("listo", destino)


if __name__ == "__main__":
    main()
