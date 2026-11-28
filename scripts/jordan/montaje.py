"""Jay (IamKingJay) · vídeo 1: vlog con Landis + 1v1 con Ongu. Montaje v2 (correcciones de Alejandro, 28-nov).

Estructura: gancho (su frase) → preview del día con música, cortes al pulso → el día en orden (docs/jordan.md):
entreno 5:30, 1v1 (dinámico: tiros cortos con zoom que avanza y 2 repeticiones a cámara lenta), curro, bus a
La Roca, compras, piedra-papel-tijera, vuelta y cena dominicana.

Más "smooth": cada plano con un empuje de cámara suave (zoom 1.00→1.05 continuo, alternando sentido), fundido
cruzado de 0,3 s entre escenas (vídeo y audio), micro-fundidos de audio en cada corte, música por secciones
distintas en cada escena (con fundidos), más baja que la voz. Subtítulos sin borde: blancos sobre una caja oscura
semitransparente, a la altura del tercio inferior; textos clave (precios, tiendas…) cuando él los dice.

    python3 scripts/jordan/montaje.py edl | borrador | final

El final lee los 4K del transfer (subfile) y escribe cada plano ya con sus textos (sin copia intermedia grande):
out/jordan/vlog1-final.mp4 (1920×1080, 60 fps).
"""
import json
import re
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
J = RAIZ / "public/jordan"
TR = J / "transcripcion"
SR = 48000
GAP = 0.45
PRE, POST = 0.10, 0.20
XF = 0.30  # fundido cruzado entre escenas
BEAT = 0.7435  # pulso de la canción (80,7 BPM)
GIRADOS = {"IMG_1095", "IMG_1125", "IMG_1136"}  # grabados de lado: transpose=2

# Escenas: (nombre, rótulo de lugar, sección de música (desde, hasta) en vlog1.mp3, planos)
# plano: (clip, segundos de voz | (desde, hasta) sin voz, opciones)
ESCENAS = [
    ("entreno", "5:30am", (0, 20), [
        ("IMG_0938", 28, {}), ("IMG_0939", (0.5, 3.0), {}), ("IMG_1070", 22, {}),
        ("IMG_1071", (20, 24), {}), ("IMG_1072", (40, 44), {}), ("IMG_1073", (10, 13.5), {}), ("IMG_1074", (20, 23.5), {})]),
    ("1v1", "1v1 vs ongu", (70, 115), "1V1"),
    ("curro", "el curro", (20, 70), [
        ("IMG_1078", 24, {}), ("IMG_1079", 22, {"saltar": 5.6}), ("IMG_1086", 5, {})]),
    ("bus", "rumbo a la roca", (0, 20), [("IMG_1088", 28, {}), ("IMG_1090", 8, {})]),
    ("roca", "la roca village", (115, 165), [
        ("IMG_1092", 24, {}), ("IMG_1095", 10, {}), ("IMG_1096", 7, {}), ("IMG_1097", 12, {}),
        ("IMG_1100", 3, {}), ("IMG_1101", 4, {}), ("IMG_1102", 4, {}),
        ("IMG_1103", 10, {}), ("IMG_1104", 14, {}), ("IMG_1105", 12, {}), ("IMG_1107", 12, {}), ("IMG_1110", 15, {})]),
    ("adidas", "adidas", (20, 70), [
        ("IMG_1111", 12, {}), ("IMG_1112", 11, {}), ("IMG_1113", 12, {}), ("IMG_1115", 4, {}),
        ("IMG_1116", 13, {}), ("IMG_1117", 10, {}), ("IMG_1119", 7, {}), ("IMG_1120", 15, {}), ("IMG_1121", 20, {})]),
    ("piedra", None, (115, 165), [("IMG_1122", 20, {}), ("IMG_1123", 5, {}), ("IMG_1124", 14, {}), ("IMG_1125", 3, {})]),
    ("vuelta", "de vuelta a casa", (0, 20), [("IMG_1126", 8, {}), ("IMG_1127", 9, {}), ("IMG_1129", 13, {})]),
    ("cena", "cena dominicana", (165, 180), [
        ("IMG_1130", 6, {}), ("IMG_1131", 7, {}), ("IMG_1132", 9, {}), ("IMG_1133", 20, {}),
        ("IMG_1135", 7, {}), ("IMG_1136", 12, {})]),
]
GANCHO = ("IMG_1079", 0.0, 5.6)  # "mucha gente me llama loco por ver mi rutina…"
# preview del día: planos sin voz al pulso de la música (2 pulsos cada uno)
PREVIEW = [("IMG_0939", 1.0), ("IMG_1072", 41.0), ("IMG_0103", 735.0), ("IMG_0103", 833.5), ("IMG_1078", 8.0),
           ("IMG_1092", 30.0), ("IMG_1104", 30.0), ("IMG_1110", 60.0), ("IMG_1120", 50.0), ("IMG_1122", 3.0),
           ("IMG_1126", 2.0), ("IMG_1133", 6.0)]
# 1v1: tiros al aro (movimiento de la red) · 3,5 s antes y 1,2 después; zoom que avanza; repeticiones lentas
TIROS = [166.65, 296.95, 383.8, 504.15, 567.15, 739.55, 837.05, 1038.0, 1091.65, 1297.7, 1568.0, 1609.15]
REPETIR = {739.55, 837.05}
ARO = (490, 275)
# textos clave: (clip, palabra que lo dispara, texto)
CLAVES = [("IMG_0938", r"competencia", "sin competencia"), ("IMG_1079", r"baloncesto|baguncesto", "todo por el baloncesto"),
          ("IMG_1104", r"marten", "dr. martens · 90 €"), ("IMG_1111", r"adidas", "mi tienda favorita"),
          ("IMG_1112", r"80", "mochila · 80 €"), ("IMG_1113", r"superstar", "superstar · 84 €"),
          ("IMG_1121", r"79", "79 €"), ("IMG_1122", r"gané", "yo gané"),
          ("IMG_1133", r"salami", "salami · queso frito · huevo · plátano"), ("IMG_1133", r"villamella|villa", "villa mella")]


def palabras(clip):
    d = json.loads((TR / f"{clip}.json").read_text())
    return [(w.strip(), a, b) for s in d["segs"] for w, a, b in s["w"] if w.strip()]


def frases(clip, presupuesto, saltar=0.0):
    ws = [w for w in palabras(clip) if w[1] >= saltar]
    if not ws:
        return []
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

    def add(**c):
        c.setdefault("pal", []); c.setdefault("zoom", None); c.setdefault("vel", 1.0); c.setdefault("escena", None)
        c.setdefault("voz", True); c.setdefault("rotulo", None); c.setdefault("musica", None); c.setdefault("sfx", None)
        cortes.append(c)

    ws = palabras(GANCHO[0])
    add(clip=GANCHO[0], a=GANCHO[1], b=GANCHO[2], pal=[w for w in ws if w[2] <= GANCHO[2]], escena="gancho", musica=None)
    for k, (clip, t0) in enumerate(PREVIEW):
        add(clip=clip, a=t0, b=t0 + 2 * BEAT, escena="preview", voz=False, musica=(70, 115),
            zoom=(ARO[0], ARO[1], 1.7) if clip == "IMG_0103" else None,
            rotulo="un día conmigo" if k == 0 else None, sfx="whoosh" if k == 0 else None)
    for nombre, rotulo, mus, planos in ESCENAS:
        primero = True
        if planos == "1V1":
            for k, t in enumerate(TIROS):
                add(clip="IMG_0103", a=t - 3.5, b=t + 1.2, escena=nombre, musica=mus, voz=True,
                    zoom=(ARO[0], ARO[1], 1.55, 1.85), rotulo=rotulo if k == 0 else None)
                if t in REPETIR:
                    add(clip="IMG_0103", a=t - 1.2, b=t + 0.6, vel=0.5, escena=nombre, musica=mus, voz=False,
                        zoom=(ARO[0], ARO[1] - 10, 2.1, 2.3), sfx="boom")
            continue
        for clip, p, op in planos:
            if isinstance(p, tuple):
                add(clip=clip, a=p[0], b=p[1], escena=nombre, musica=mus, voz=False, rotulo=rotulo if primero else None)
                primero = False
                continue
            for i, (a, b, pal) in enumerate(frases(clip, p, op.get("saltar", 0.0))):
                add(clip=clip, a=round(a, 3), b=round(b, 3), pal=pal, escena=nombre, musica=mus,
                    rotulo=rotulo if primero else None)
                primero = False
    # empuje de cámara suave en todo (alternando acercar/alejar); fundido cruzado al cambiar de escena
    t = 0.0
    for i, c in enumerate(cortes):
        if c["zoom"] is None:
            c["zoom"] = (480, 270, 1.0, 1.05) if i % 2 == 0 else (480, 270, 1.05, 1.0)
        elif len(c["zoom"]) == 3:
            c["zoom"] = (*c["zoom"], c["zoom"][2] + 0.08)
        c["xf"] = i > 0 and c["escena"] != cortes[i - 1]["escena"] and c["escena"] != "preview"
        if c["xf"]:
            t -= XF  # 18 fotogramas
        # duraciones exactas en fotogramas de 60 fps (si no, 200 planos se desfasan segundos)
        nf = max(30, round((c["b"] - c["a"]) / c["vel"] * 60))
        c["dur"] = round(nf / 60, 5)
        c["b"] = round(c["a"] + c["dur"] * c["vel"], 5)
        c["t"] = round(t, 5)
        t += c["dur"]
    return cortes, t


def ass(cortes, ruta, W=1920, H=1080):
    def ts(x):
        x = max(0.0, x)
        return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
    cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter Medium,42,&H00FFFFFF,&H00FFFFFF,&H8C000000,&H00000000,0,0,0,0,100,100,0.5,0,3,9,0,2,200,200,215,1
Style: Lugar,Inter Medium,60,&H00FFFFFF,&H00FFFFFF,&H78000000,&H00000000,0,0,0,0,100,100,2,0,3,18,0,5,100,100,0,1
Style: Clave,Inter Medium,58,&H00FFFFFF,&H00FFFFFF,&H8C000000,&H00000000,0,0,0,0,100,100,1,0,3,14,0,8,200,200,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev, subs = [], []
    hechas = set()
    for c in cortes:
        fin_c = c["t"] + c["dur"]
        if c.get("rotulo"):
            ev.append(f"Dialogue: 2,{ts(c['t'] + 0.2)},{ts(min(fin_c, c['t'] + 2.6))},Lugar,,0,0,0,,{{\\fad(250,300)\\pos(960,330)}}{c['rotulo']}")
        bloque = []
        for w, a, b in c["pal"]:
            ta, tb = c["t"] + (a - c["a"]), c["t"] + (b - c["a"])
            if ta < c["t"] - 0.01 or tb > fin_c + 0.05:
                continue
            for k, (clip, patron, texto) in enumerate(CLAVES):
                if k not in hechas and clip == c["clip"] and re.search(patron, w.lower()):
                    hechas.add(k)
                    ev.append(f"Dialogue: 3,{ts(ta)},{ts(ta + 1.9)},Clave,,0,0,0,,{{\\fad(150,250)\\move(960,175,960,150,0,250)}}{texto}")
            bloque.append((w, ta, tb))
            texto = " ".join(x[0] for x in bloque)
            if len(texto) > 30 or w.endswith((".", "?", "!", ",")):
                subs.append((bloque[0][1], bloque[-1][2], texto))
                bloque = []
        if bloque:
            subs.append((bloque[0][1], bloque[-1][2], " ".join(x[0] for x in bloque)))
    subs.sort()
    for i, (a, b, tx) in enumerate(subs):
        fin = min(b + 0.3, subs[i + 1][0]) if i + 1 < len(subs) else b + 0.3
        tx = tx.lower().replace("{", "(").replace("}", ")")
        ev.append(f"Dialogue: 1,{ts(a)},{ts(fin)},Sub,,0,0,0,,{{\\fad(80,80)}}{tx}")
    ruta.write_text(cab + "\n".join(ev) + "\n")
    return len(subs), len(hechas)


def vf_plano(c, W, H, off=0.0):
    """Filtros de vídeo de un plano: girar si hace falta, zoom continuo con curva suave (escala a 2× por fotograma,
    recorte fijo centrado en el punto de interés, vuelta a W×H: medio píxel por paso, sin tirones), velocidad.
    `off`: segundos de origen ya pasados del plano (para la cola que entra en un fundido)."""
    f = ["setpts=PTS-STARTPTS"]
    if c["clip"] in GIRADOS:
        f.append("transpose=2")
    cx, cy, z0, z1 = c["zoom"]
    src = c["b"] - c["a"]
    z = f"({z0}+({z1 - z0:.4f})*(0.5-0.5*cos(PI*min((t+{off:.3f})/{src:.3f},1))))"
    f.append(f"scale=w='2*trunc({W}*{z})':h='2*trunc({H}*{z})':eval=frame:flags=bicubic")
    f.append(f"crop={2 * W}:{2 * H}:'min(max({cx / 960:.4f}*iw-{W},0),iw-{2 * W})':'min(max({cy / 540:.4f}*ih-{H},0),ih-{2 * H})'")
    f.append(f"scale={W}:{H}:flags=lanczos")
    if c["vel"] != 1.0:
        f.append(f"setpts=PTS/{c['vel']},minterpolate=fps=60:mi_mode=blend")
    f += ["fps=60", "setsar=1", "format=yuv420p"]
    return f


def af_plano(c):
    af = ["aresample=48000", "aformat=channel_layouts=stereo"]
    if c["vel"] != 1.0:
        af.append(f"atempo={c['vel']}")
    if not c["voz"]:
        af.append("volume=0")
    return af


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "borrador"
    cortes, dur = edl()
    (RAIZ / "src/jordan").mkdir(exist_ok=True)
    (RAIZ / "src/jordan/edl.json").write_text(json.dumps({"duracion": round(dur, 2), "cortes": cortes}, ensure_ascii=False, indent=1))
    n_subs, n_claves = ass(cortes, J / "subs.ass")
    print(f"{len(cortes)} cortes · {dur / 60:.2f} min · {n_subs} subtítulos · {n_claves} textos clave", flush=True)
    if modo == "edl":
        return
    final = modo == "final"
    W, H = (1920, 1080) if final else (960, 540)
    seg_dir = J / f"seg_{modo}"
    seg_dir.mkdir(exist_ok=True)
    estado = {"url": None, "t": 0.0}
    indice = None
    if final:
        sys.path.insert(0, str(Path(__file__).parent))
        from proxies import url_nueva
        indice = {Path(i["nombre"]).stem: i for i in json.loads((J / "indice.json").read_text())}

    def entrada(clip, a, durac):
        if final:
            if time.time() - estado["t"] > 35 * 60:
                estado["url"], estado["t"] = url_nueva(), time.time()
            it = indice[clip]
            return ["-protocol_whitelist", "subfile,https,http,tls,tcp,crypto,file", "-ss", f"{a:.3f}", "-t", f"{durac:.3f}",
                    "-i", f"subfile,,start,{it['datos']},end,{it['datos'] + it['tam']},,:{estado['url']}"]
        return ["-ss", f"{a:.3f}", "-t", f"{durac:.3f}", "-i", str(J / "proxies" / f"{clip}.mp4")]

    subs = str(J / "subs.ass").replace(":", "\\:")
    fuentes = str(J / "fuentes")
    cod = ["-c:v", "libx264", "-preset", "medium" if final else "veryfast", "-crf", "21" if final else "24",
           "-maxrate", "4800k" if final else "3M", "-bufsize", "9600k" if final else "6M", "-pix_fmt", "yuv420p",
           "-g", "120", "-bf", "2", "-f", "mpegts"]
    lista = []
    for i, c in enumerate(cortes):
        out = seg_dir / f"{i:04d}.ts"
        wav = out.with_suffix(".wav")
        lista.append(out)
        if out.exists() and out.stat().st_size > 1000 and wav.exists():
            continue
        sig_xf = i + 1 < len(cortes) and cortes[i + 1]["xf"]
        # este plano se corta XF antes si el siguiente entra con fundido (esa cola va en el segmento del siguiente)
        b = c["b"] - (XF * c["vel"] if sig_xf else 0.0)
        cc = dict(c)
        L = round(c["dur"] - (XF if sig_xf else 0.0), 5)
        exacto = [f"tpad=stop_mode=clone:stop_duration=0.2", f"trim=duration={L}"]
        aexacto = f"apad=whole_dur={L},atrim=duration={L}"
        sub = [*exacto, f"setpts=PTS-STARTPTS+{c['t']:.4f}/TB", f"subtitles={subs}:fontsdir={fuentes}", "setpts=PTS-STARTPTS"]
        if c["xf"]:
            p = cortes[i - 1]
            cola = XF * p["vel"]
            ent = entrada(p["clip"], p["b"] - cola, cola) + entrada(c["clip"], c["a"], b - c["a"])
            fc = (f"[0:v]{','.join(vf_plano(p, W, H, off=p['b'] - p['a'] - cola))}[pv];"
                  f"[1:v]{','.join(vf_plano(cc, W, H))}[nv];"
                  f"[pv][nv]xfade=transition=fade:duration={XF}:offset=0,{','.join(sub)}[v];"
                  f"[0:a]{','.join(af_plano(p))}[pa];[1:a]{','.join(af_plano(c))}[na];"
                  f"[pa][na]acrossfade=d={XF - 0.01}:c1=qsin:c2=qsin,{aexacto},afade=t=out:st={L - 0.03:.4f}:d=0.03[a]")
        else:
            ent = entrada(c["clip"], c["a"], b - c["a"])
            fc = (f"[0:v]{','.join(vf_plano(cc, W, H) + sub)}[v];"
                  f"[0:a]{','.join(af_plano(c))},afade=t=in:d=0.015,{aexacto},afade=t=out:st={L - 0.03:.4f}:d=0.03[a]")
        r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ent, "-filter_complex", fc, "-map", "[v]", *cod, str(out),
                            "-map", "[a]", "-c:a", "pcm_s16le", "-ar", str(SR), "-ac", "2", str(wav)], capture_output=True, text=True)
        if r.returncode:
            print("FALLO", i, c["clip"], r.stderr[-600:], flush=True)
            out.unlink(missing_ok=True)
        else:
            print(i, c["clip"], round(c["dur"], 2), flush=True)
    # audio de todos los planos → mezcla; luego vídeo unido sin recodificar + mezcla
    cat = J / f"_cat_{modo}.txt"
    cat.write_text("".join(f"file '{p}'\n" for p in lista))
    voz = J / "_voz.wav"
    import wave
    with wave.open(str(voz), "wb") as o:  # audio exacto: muestras seguidas, sin huecos
        o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
        for p in lista:
            with wave.open(str(p.with_suffix(".wav"))) as w_:
                o.writeframes(w_.readframes(w_.getnframes()))
    for p in lista:  # ya no hacen falta (disco justo)
        p.with_suffix(".wav").unlink()
    mezcla(voz, cortes, dur, J / "mezcla.wav")
    voz.unlink(missing_ok=True)
    destino = RAIZ / "out/jordan" / ("borrador.mp4" if not final else "vlog1-final.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(cat), "-i", str(J / "mezcla.wav"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
                    str(destino)], check=True)
    cat.unlink()
    print("listo", destino, round(dur, 2))


def mezcla(voz_wav, cortes, dur, ruta):
    """Voz + sfx + música por secciones (cada escena su parte de la canción, con fundidos), siempre por debajo
    de la voz: −27 dB bajo la voz, −20 en pausas, −14 en planos sin voz, −12 en la preview. −14 LUFS."""
    def leer(r, canales=2):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(r), "-ac", str(canales), "-ar", str(SR), "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        return np.frombuffer(raw, np.float32).reshape(-1, canales).copy()
    n = int(dur * SR) + SR
    voz = leer(voz_wav)
    Path(voz_wav).unlink()
    voz = np.pad(voz[:n], ((0, max(0, n - len(voz))), (0, 0)))
    pista = leer(J / "musica/vlog1.mp3")
    mus = np.zeros((n, 2), np.float32)
    gan = np.full(n, 10 ** (-20 / 20), np.float32)
    # tramos de música: escena a escena
    bloques, ini = [], 0
    for i, c in enumerate(cortes):
        fin = c["t"] + c["dur"]
        if i + 1 == len(cortes) or cortes[i + 1]["musica"] != c["musica"]:
            bloques.append((cortes[ini]["t"], fin, c["musica"]))
            ini = i + 1
    for t0, t1, sec in bloques:
        if sec is None:
            continue
        a, b = int(sec[0] * SR), int(sec[1] * SR)
        trozo = pista[a:b]
        i0, i1 = int(t0 * SR), min(n, int((t1 + 0.6) * SR))
        largo = i1 - i0
        rep = np.concatenate([trozo] * (largo // len(trozo) + 1))[:largo].copy()
        f = int(0.6 * SR)
        rep[:f] *= np.linspace(0, 1, f)[:, None]
        rep[-f:] *= np.linspace(1, 0, f)[:, None]
        mus[i0:i1] += rep
    for c in cortes:
        i0, i1 = int(c["t"] * SR), int((c["t"] + c["dur"]) * SR)
        if c["escena"] == "preview":
            gan[i0:i1] = 10 ** (-12 / 20)
        elif not c["voz"] or not c["pal"]:
            gan[i0:i1] = 10 ** (-14 / 20)
        for w, a, b in c["pal"]:
            j0, j1 = int((c["t"] + (a - c["a"]) - 0.15) * SR), int((c["t"] + (b - c["a"]) + 0.25) * SR)
            gan[max(0, j0):j1] = 10 ** (-27 / 20)
    k = int(0.35 * SR)
    gan = np.convolve(gan, np.ones(k) / k, "same").astype(np.float32)
    x = voz + mus * gan[:, None]
    for c in cortes:
        if c.get("sfx"):
            s = leer(J / "sfx" / f"SFX_{c['sfx']}.wav")
            i0 = int(c["t"] * SR)
            x[i0:i0 + len(s)] += s[: n - i0] * 0.35
    tmp = J / "_mezcla_tmp.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(tmp)], input=x.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(ruta)], check=True)
    tmp.unlink()


if __name__ == "__main__":
    main()
