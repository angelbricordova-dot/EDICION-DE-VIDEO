"""TuBodega · versión A de VENTA (vertical, 25-nov-2026).

Toma la locución de Richard (public/tubodega/voz/venta-1.mp3 y sus tiempos por frase y por palabra en
public/tubodega/voz/venta-1.json), deja una pausa entre frases para que cada escena respire, monta la voz,
la mezcla con la música (bajo la voz −16 dB, sube en el cierre, a −14 LUFS) y escribe
src/tubodega/guion-venta.json, que lee Remotion (frases y palabras con su tiempo, para los subtítulos).

La música (public/tubodega/musica/presentacion.mp3, 60 s) se recorta por el principio para que su final
("button") caiga justo en el final del video.

    python3 scripts/tubodega/guion_venta.py [toma]   (toma = 1 por defecto)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
SR = 44100
PAUSA = 0.34
EXTRA = {1: 0.45, 2: 0.2, 9: 0.15, 10: 0.25, 11: 0.2}  # pausa extra DESPUÉS de esa frase (índice desde 0)
COLA = 2.4  # música sola al final
# palabra clave de cada frase (se pinta en verde en el subtítulo)
CLAVES = ["ganaste", "culpa", "teléfono", "segundos", "vuelto", "anotado", "acabando", "cuadra", "internet", "casa", "$10", "gratis", "WhatsApp"]


CONSUME = {"10": 2}  # "$10" se dice "diez dólares"


def norm(w):
    return re.sub(r"[^a-z0-9áéíóúñü]", "", w.lower())


def leer(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def escribir(x, ruta):
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", str(ruta)], input=x.astype(np.float32).tobytes())
    assert p.returncode == 0


def lufs_de(x):
    p = subprocess.run(["ffmpeg", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float([l for l in p.stderr.decode().splitlines() if l.strip().startswith("I:")][-1].split()[1])


def media_movil(x, k):
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    return np.pad(y, (k // 2, len(x) - len(y) - k // 2), mode="edge")


def main():
    toma = sys.argv[1] if len(sys.argv) > 1 else "1"
    vj = json.loads((RAIZ / f"public/tubodega/voz/venta-{toma}.json").read_text())
    loc = json.loads((RAIZ / "src/tubodega/locucion-venta.json").read_text())["frases"]
    voz = leer(RAIZ / f"public/tubodega/voz/venta-{toma}.mp3")
    frases, pistas, t = [], [], 0.3
    for i, l in enumerate(vj["lineas"]):
        a, b = max(0, l["t"] - 0.05), l["fin"] + 0.1
        seg = voz[int(a * SR):int(b * SR)]
        pistas.append((t, seg))
        dt = t - a  # desplazamiento de esta frase en el video
        dichas = [w for w in vj["palabras"] if l["t"] - 0.02 <= w["t"] <= l["fin"] + 0.02]
        pantalla = loc[i].get("pantalla", loc[i]["texto"]).split()
        palabras, j = [], 0
        for p in pantalla:
            # cuántas palabras dichas ocupa esta palabra escrita ("$10" = "diez dólares", "TuBodega" = "Tu Bodega")
            k = CONSUME.get(norm(p), 1)
            if k == 1 and j + 1 < len(dichas) and norm(dichas[j]["p"]) + norm(dichas[j + 1]["p"]) == norm(p):
                k = 2
            a_, b_ = dichas[min(j, len(dichas) - 1)], dichas[min(j + k - 1, len(dichas) - 1)]
            palabras.append({"p": p, "t": round(a_["t"] + dt, 3), "fin": round(b_["fin"] + dt, 3)})
            j += k
        assert j == len(dichas), (i, j, len(dichas), [w["p"] for w in dichas])
        frases.append({"desde": round(l["t"] + dt, 3), "hasta": round(l["fin"] + dt, 3), "texto": " ".join(pantalla), "clave": CLAVES[i], "palabras": palabras})
        t += (b - a) + PAUSA + EXTRA.get(i, 0)
    dur = round(t - PAUSA + COLA, 2)
    n = int(dur * SR)
    v = np.zeros((n, 2), np.float32)
    for t0, seg in pistas:
        i0 = int(t0 * SR)
        v[i0:i0 + len(seg)] += seg[: n - i0]
    mus = leer(RAIZ / "public/tubodega/musica/presentacion.mp3")
    mus = mus[max(0, len(mus) - n):]
    mus = np.pad(mus, ((n - len(mus), 0), (0, 0)))
    mus[: int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]
    # ducking: la música baja 16 dB con voz y sube al terminar la voz
    env = media_movil(np.abs(v).mean(1), int(0.25 * SR))
    hay = media_movil(np.clip(env / 0.01, 0, 1), int(0.3 * SR))
    tt = np.arange(n) / SR
    g = 10 ** ((-16 * hay) / 20)
    g = np.where(tt > frases[-1]["hasta"] + 0.15, 1.0, g)
    v *= 10 ** ((-15 - lufs_de(v)) / 20)
    mus *= 10 ** ((-15 - lufs_de(mus)) / 20)
    mezcla = v + mus * g[:, None]
    mezcla *= 10 ** ((-14 - lufs_de(mezcla)) / 20)
    mezcla /= max(1.0, np.abs(mezcla).max() / 0.95)
    escribir(mezcla, RAIZ / "public/tubodega/audio/venta-mezcla.mp3")
    (RAIZ / "src/tubodega/guion-venta.json").write_text(json.dumps({"duracion": dur, "frases": frases}, ensure_ascii=False, indent=1))
    print("duración", dur, "· mezcla", round(lufs_de(mezcla), 1), "LUFS")
    for f in frases:
        print(f"{f['desde']:6.2f}–{f['hasta']:6.2f} {f['texto']}")


if __name__ == "__main__":
    main()
