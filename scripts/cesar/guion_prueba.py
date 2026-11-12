"""Prueba de 3 min de César (docs/cesar.md): reacción a un video, con su cámara arriba a la izquierda.

Lee los audios de la grabación de pantalla y de la cámara (16 kHz mono) y sus transcripciones
(scripts/comun/transcribir.py), elige el tramo, quita los silencios largos en los que no habla nadie
(corte seco a la vez en pantalla y cámara, así nunca se desincronizan) y escribe src/cesar/prueba.json:
tramos del original, subtítulos de su voz y tiempos de zoom.

Uso:
    python3 scripts/cesar/guion_prueba.py <pan.wav> <cam.wav> <pan.json> <cam.json>
"""

import json
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
DESFASE = 0.2  # la cámara va 0,2 s detrás de la pantalla (canción del inicio + palabras de la letra)
INICIO, FIN = 44.4, 231.0  # tramo del original (tiempo de la pantalla): del "18.270 bitcoins" a "ya lo van a ver"
OBJETIVO = 999.0
SILENCIO_MIN, MARGEN = 1.8, 0.4  # huecos de más de 1,8 s se quedan en 2 × 0,4 s (en los gestos no se corta)


def energia(wav, r=50):
    x = np.fromfile(wav, dtype=np.int16, offset=44).astype(float)
    k = 16000 // r
    e = np.sqrt((x[: len(x) // k * k].reshape(-1, k) ** 2).mean(1))
    return 20 * np.log10(e + 1)


def main():
    pan_wav, cam_wav, pan_json, cam_json = sys.argv[1:]
    R = 50
    ep, ec = energia(pan_wav), energia(cam_wav)
    # voz: por encima del ruido de fondo de cada pista
    vp = ep > np.percentile(ep, 35) + 9
    vc = ec > np.percentile(ec, 35) + 9
    n = min(len(vp), len(vc) - int(DESFASE * R))
    activo = vp[:n] | vc[int(DESFASE * R): int(DESFASE * R) + n]
    # tramos: desde INICIO, cortando huecos largos, hasta llegar a OBJETIVO
    tramos, t, acum = [], INICIO, 0.0
    i0 = int(INICIO * R)
    i = i0
    inicio_tramo = INICIO
    n = min(n, int(FIN * R))
    while acum < OBJETIVO and i < n:
        if not activo[i]:
            j = i
            while j < n and not activo[j]:
                j += 1
            hueco = (j - i) / R
            if hueco > SILENCIO_MIN:
                fin = i / R + MARGEN
                acum += fin - inicio_tramo
                tramos.append([round(inicio_tramo, 2), round(fin, 2)])
                inicio_tramo = j / R - MARGEN
            i = j
        else:
            i += 1
        if i >= n:
            tramos.append([round(inicio_tramo, 2), round(n / R, 2)])
            acum += n / R - inicio_tramo
            break
        if acum + (i / R - inicio_tramo) >= OBJETIVO:
            fin = inicio_tramo + (OBJETIVO - acum)
            tramos.append([round(inicio_tramo, 2), round(fin, 2)])
            acum = OBJETIVO
            break
    # mapear tiempo del original → tiempo de salida
    def a_salida(p):
        s = 0.0
        for a, b in tramos:
            if a <= p <= b:
                return s + (p - a)
            s += b - a
        return None

    # subtítulos: su voz (cámara), en bloques cortos de una línea
    palabras = json.loads(Path(cam_json).read_text())["palabras"]
    subs = []
    for w in palabras:
        p = w["ini"] - DESFASE
        s = a_salida(p)
        if s is None:
            continue
        subs.append({"p": w["p"], "ini": round(s, 2), "fin": round(s + (w["fin"] - w["ini"]), 2)})
    # zoom suave a la pantalla cuando habla el narrador del video (más interés en el gráfico)
    narr = json.loads(Path(pan_json).read_text())["palabras"]
    habla_video = [round(a_salida(w["ini"]), 2) for w in narr if a_salida(w["ini"]) is not None]
    salida = {"desfase": DESFASE, "inicioProxy": 40.0, "duracion": round(acum, 2), "tramos": tramos, "subs": subs, "habla_video": habla_video}
    (RAIZ / "src/cesar/prueba.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1))
    print(f"{len(tramos)} tramos, {acum:.1f} s; original {tramos[0][0]}–{tramos[-1][1]} s; {len(subs)} palabras de César")
    for a, b in tramos:
        print(f"  {a:7.2f}–{b:7.2f}  ({b - a:5.2f} s)")


if __name__ == "__main__":
    main()
