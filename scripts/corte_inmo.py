"""Corte sin aire de los reels inmobiliarios: tomas elegidas → lista de cortes + voz montada.

Cada toma es un rango [ini, fin] del bruto (segundos), elegido a mano sobre la transcripción
(`public/tiktok/<reel>/palabras-alineadas.json`, ver scripts/alinear.py). Dentro de cada toma
se quitan las pausas: cualquier tramo por debajo de UMBRAL dB más largo que PAUSA_MAX se
recorta dejando MARGEN a cada lado, y también el silencio al principio y al final de la toma.
Las palabras se trasladan al tiempo de salida para los subtítulos.

Salida:
    src/inmobiliaria/<reel>-<version>.json   {cortes: [{src, dur, out}], palabras, duracion}
    public/tiktok/<reel>/voz-<version>.wav    voz montada (fundidos de 8 ms en cada corte)

Uso:
    python3 scripts/corte_inmo.py g6 prueba
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
UMBRAL = -42.0  # dBFS (el ruido de fondo del bruto está en −55 dB)
PAUSA_MAX = 0.16
MARGEN = 0.05
FUNDIDO = 0.008

TOMAS = {
    ("g6", "prueba"): [
        (41.22, 45.30),  # Si no revisas estas tres cosas al comprar tu casa, vas a perder dinero.
        (50.66, 52.30),  # Uno, el estado del piso.
        (52.42, 54.62),  # La visita no es un tour de vacaciones.
        (54.84, 57.48),  # Hay que mirar electricidad, fontanería, humedades.
        (57.54, 60.10),  # Si lo descubres después de firmar, lo pagas tú.
        (60.18, 63.40),  # Si lo descubres antes, es dinero que le puedes bajar al precio.
    ],
}


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)


def sin_pausas(x, ini, fin):
    """Parte [ini, fin] en tramos con voz, quitando pausas largas."""
    w = int(0.01 * SR)
    a, b = int(ini * SR), int(fin * SR)
    seg = x[a:b]
    n = len(seg) // w
    db = 20 * np.log10(np.sqrt((seg[: n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    bajo = db < UMBRAL
    voz = np.flatnonzero(~bajo)
    if len(voz) == 0:
        return []
    primero, ultimo = voz[0], voz[-1] + 1
    tramos, i, inicio = [], primero, max(0.0, primero * 0.01 - MARGEN)
    while i < ultimo:
        if bajo[i]:
            j = i
            while j < ultimo and bajo[j]:
                j += 1
            if (j - i) * 0.01 > PAUSA_MAX:
                tramos.append((inicio, i * 0.01 + MARGEN))
                inicio = j * 0.01 - MARGEN
            i = j
        else:
            i += 1
    tramos.append((inicio, min((b - a) / SR, ultimo * 0.01 + MARGEN)))
    # Los trocitos sueltos (clics, respiraciones cortas) no son voz.
    return [(ini + s, ini + e) for s, e in tramos if e - s > 0.12]


def main():
    reel, version = sys.argv[1], sys.argv[2]
    dir_ = RAIZ / "public/tiktok" / reel
    x = leer(dir_ / "audio48k.wav")
    palabras = json.loads((dir_ / "palabras-alineadas.json").read_text())["palabras"]
    cortes, out = [], 0.0
    for ini, fin in TOMAS[(reel, version)]:
        for s, e in sin_pausas(x, ini, fin):
            cortes.append({"src": round(s, 3), "dur": round(e - s, 3), "out": round(out, 3)})
            out += e - s
    # Voz montada con fundidos cortos para que no haya clics en los cortes.
    piezas = []
    f = int(FUNDIDO * SR)
    for c in cortes:
        p = x[int(c["src"] * SR) : int((c["src"] + c["dur"]) * SR)].copy()
        p[:f] *= np.linspace(0, 1, f)
        p[-f:] *= np.linspace(1, 0, f)
        piezas.append(p)
    voz = np.concatenate(piezas)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(dir_ / f"voz-{version}.wav")], input=voz.astype(np.float32).tobytes(), check=True)
    # Palabras al tiempo de salida: solo las que están dentro de una toma elegida; si una cae en
    # una pausa recortada se pega al corte siguiente.
    salida = []
    tomas = TOMAS[(reel, version)]
    for w in palabras:
        m = (w["ini"] + w["fin"]) / 2
        if not any(i <= m <= f for i, f in tomas):
            continue
        c = next((c for c in cortes if m <= c["src"] + c["dur"] + 0.02), cortes[-1])
        d = c["out"] - c["src"]
        salida.append({"p": w["p"], "ini": round(max(c["out"], w["ini"] + d), 3), "fin": round(min(c["out"] + c["dur"], max(w["fin"] + d, c["out"] + 0.1)), 3)})
    destino = RAIZ / "src/inmobiliaria" / f"{reel}-{version}.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps({"duracion": round(out, 3), "cortes": cortes, "palabras": salida}, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(cortes)} cortes, {out:.2f} s (de {sum(f - i for i, f in TOMAS[(reel, version)]):.2f} s en tomas) → {destino}")
    print(" ".join(f"{w['p']}[{w['ini']:.2f}]" for w in salida))


if __name__ == "__main__":
    main()
