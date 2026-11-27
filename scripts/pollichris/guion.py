"""Pollichris (FC27) · video de prueba "playstyles": voz con cortes en las pausas y guion de tiempos.

Lee la transcripción palabra a palabra de su toma (public/pollichris/camara-transcripcion.json, whisper),
quita las pausas largas (cortes secos de cámara, como en sus videos), arma la voz limpia y escribe
src/pollichris/guion.json, que lee Remotion: tramos de la toma (desde/hasta en la toma y t en el video),
palabras con su tiempo nuevo y las marcas de cada sección.

    python3 scripts/pollichris/guion.py
"""
import json
import subprocess
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
SR = 48000
UNIR = 0.38  # dos palabras con menos hueco que esto quedan en el mismo tramo
ANTES, DESPUES = 0.09, 0.14
# Correcciones de whisper (lo que dice de verdad) y marcas manuales
CAMBIOS = {"FC27": "FC27"}
# El final: dice "Si…", se calla, apunta arriba y sigue "me sigues, mejoras". Se deja el gesto de apuntar.
INICIO_FORZADO = {"me": 58.35}


def leer(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def main():
    tr = json.loads((RAIZ / "public/pollichris/camara-transcripcion.json").read_text())
    ws = [{"p": w.strip(), "t": a, "fin": b} for s in tr for w, a, b in s["w"]]
    tramos, actual = [], None
    for i, w in enumerate(ws):
        forz = INICIO_FORZADO.get(w["p"]) if i and ws[i - 1]["p"] == "Si" and w["t"] - ws[i - 1]["fin"] > 1 else None
        if actual and w["t"] - actual["hasta"] < UNIR and not forz:
            actual["hasta"] = w["fin"]
            actual["ws"].append(w)
        else:
            actual = {"desde": forz if forz else w["t"], "hasta": w["fin"], "ws": [w]}
            tramos.append(actual)
    voz = leer(RAIZ / "public/pollichris/juego/camara.mp4")
    salida, t = [], 0.0
    out_tramos, palabras = [], []
    for tr_ in tramos:
        a = max(0.0, tr_["desde"] - ANTES)
        b = tr_["hasta"] + DESPUES
        seg = voz[int(a * SR):int(b * SR)].copy()
        f = int(0.008 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        salida.append(seg)
        out_tramos.append({"desde": round(a, 3), "hasta": round(b, 3), "t": round(t, 3)})
        for w in tr_["ws"]:
            palabras.append({"p": CAMBIOS.get(w["p"], w["p"]), "t": round(t + w["t"] - a, 3), "fin": round(t + w["fin"] - a, 3)})
        t += b - a
    x = np.concatenate(salida)
    crudo = RAIZ / "public/pollichris/voz-cortada.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(crudo)], input=x.astype(np.float32).tobytes(), check=True)
    # limpieza: graves fuera, presencia, compresión suave y −16 LUFS (la música irá debajo)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(crudo), "-af",
                    "highpass=f=85,afftdn=nf=-30,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=4,loudnorm=I=-16:TP=-1.5:LRA=8",
                    "-ar", str(SR), str(RAIZ / "public/pollichris/voz.wav")], check=True)
    def marca(palabra, desde=0):
        return next(w["t"] for w in palabras if w["p"].lower().startswith(palabra) and w["t"] >= desde)
    secciones = {
        "gancho": 0.0,
        "primero": marca("primero"),
        "cartas": marca("cartas"),
        "bruno": marca("bruno"), "pedri": marca("pedri"), "stanway": marca("stanway"),
        "segundo": marca("segundo"),
        "potente": marca("potente"),
        "orientarte": marca("orientarte"),
        "goles": marca("goles"),
        "sigues": marca("si", marca("goles")),
    }
    # sin cola: la cámara acaba con el último tramo
    guion = {"duracion": round(t - 0.02, 2), "tramos": out_tramos, "palabras": palabras, "marcas": secciones}
    (RAIZ / "src/pollichris/guion.json").write_text(json.dumps(guion, ensure_ascii=False, indent=1))
    print("duración", guion["duracion"], "· tramos", len(out_tramos))
    for k, v in secciones.items():
        print(f"  {k:10s} {v:6.2f}")


if __name__ == "__main__":
    main()
