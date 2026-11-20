"""TuBodega · video de presentación (encargo PROMPT_VIDEO_PRESENTACION.md).

Reparte la locución de Richard (public/tubodega/voz/presentacion.mp3, tiempos en
src/tubodega/voz-presentacion.json) con una pausa entre frases para que cada escena respire,
arma la voz nueva y la mezcla con la música (ducking −18 dB bajo la voz y subida en el cierre)
y escribe src/tubodega/guion-presentacion.json, que lee Remotion.

    python3 scripts/tubodega/guion_presentacion.py
"""
import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "scripts/comun"))
import numpy as np  # noqa: E402

SR = 44100
PAUSA = 0.38
COLA = 2.2  # música sola al final
CLAVES = ["cuaderno", "tasa", "Tu Bodega", "cámara", "vuelto", "Pago Móvil", "fiados", "código de barras", "cuadra la caja", "sin internet", "siete días gratis", "Escríbenos"]


def leer(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def escribir(x, ruta):
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", str(ruta)], input=x.astype(np.float32).tobytes())
    assert p.returncode == 0


def lufs(ruta):
    out = subprocess.run(["ffmpeg", "-i", str(ruta), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float([l for l in out.splitlines() if l.strip().startswith("I:")][-1].split()[1])


def media_movil(x, k):
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    return np.pad(y, (k // 2, len(x) - len(y) - k // 2), mode="edge")


def main():
    voz_json = json.loads((RAIZ / "src/tubodega/voz-presentacion.json").read_text())
    loc = json.loads((RAIZ / "src/tubodega/locucion-presentacion.json").read_text())["frases"]
    voz = leer(RAIZ / voz_json["audio"])
    frases, t = [], 0.25
    pistas = []
    for i, l in enumerate(voz_json["lineas"]):
        a, b = max(0, l["t"] - 0.06), l["fin"] + 0.08
        seg = voz[int(a * SR):int(b * SR)]
        pistas.append((t, seg))
        frases.append({"desde": round(t + 0.06, 3), "hasta": round(t + (b - a) - 0.08, 3), "texto": loc[i].get("pantalla", loc[i]["texto"]), "clave": CLAVES[i]})
        t += (b - a) + PAUSA + (0.35 if i in (2, 10) else 0)
    dur = round(t - PAUSA + COLA, 2)
    n = int(dur * SR)
    v = np.zeros((n, 2), np.float32)
    for t0, seg in pistas:
        i0 = int(t0 * SR)
        v[i0:i0 + len(seg)] += seg[: n - i0]
    musica = leer(RAIZ / "public/tubodega/musica/presentacion.mp3")[:n]
    musica = np.pad(musica, ((0, n - len(musica)), (0, 0)))
    # ducking: envolvente de la voz suavizada; la música baja ~18 dB con voz y sube en el cierre
    env = np.abs(v).mean(1)
    k = int(0.25 * SR)
    env = media_movil(env, k)
    hay = np.clip(env / 0.01, 0, 1)
    hay = media_movil(hay, k)
    g_mus = 10 ** ((-18 * hay) / 20)
    fin_voz = frases[-1]["hasta"]
    tt = np.arange(n) / SR
    g_mus = np.where(tt > fin_voz + 0.2, 1.0, g_mus)
    escribir(v, RAIZ / "public/tubodega/voz/presentacion-montada.mp3")
    rv = lufs(RAIZ / "public/tubodega/voz/presentacion-montada.mp3")
    v *= 10 ** ((-14 - rv) / 20)
    escribir(musica, RAIZ / "public/tubodega/musica/tmp.mp3")
    rm = lufs(RAIZ / "public/tubodega/musica/tmp.mp3")
    musica *= 10 ** ((-14 - rm) / 20)
    mezcla = v + musica * g_mus[:, None]
    solo = musica.copy()
    for nombre, x in (("presentacion-mezcla", mezcla), ("presentacion-solo-musica", solo)):
        x = x / max(1.0, np.abs(x).max() / 0.95)
        escribir(x, RAIZ / f"public/tubodega/audio/{nombre}.mp3")
    (RAIZ / "public/tubodega/musica/tmp.mp3").unlink()
    guion = {"duracion": dur, "frases": frases}
    (RAIZ / "src/tubodega/guion-presentacion.json").write_text(json.dumps(guion, ensure_ascii=False, indent=1))
    print("duración", dur)
    for f in frases:
        print(f"{f['desde']:6.2f}–{f['hasta']:6.2f} {f['texto'][:50]}")


if __name__ == "__main__":
    main()
