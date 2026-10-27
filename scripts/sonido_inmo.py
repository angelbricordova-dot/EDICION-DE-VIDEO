"""Mezcla de los reels inmobiliarios: voz montada + efectos en las transiciones y apariciones.

Los momentos salen de las palabras del corte (src/inmobiliaria/<reel>-<version>.json), igual que
en Remotion. Sin música hasta que el cliente pase una pista con licencia. Total −14 LUFS.

Uso:
    python3 scripts/sonido_inmo.py g6 prueba
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
SFX = RAIZ / "public/tubodega/audio/sfx"


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def db(x):
    return 10 ** (x / 20)


def main():
    reel, version = sys.argv[1], sys.argv[2]
    g = json.loads((RAIZ / f"src/inmobiliaria/{reel}-{version}.json").read_text())
    pal = g["palabras"]

    def limpio(w):
        return re.sub(r"[¿?¡!.,:;…]", "", w).lower()

    def tras(texto, desde=0.0):
        for w in pal:
            if w["ini"] >= desde - 0.01 and limpio(w["p"]) == limpio(texto):
                return w["ini"]
        raise SystemExit(f"No encontré {texto} después de {desde}")

    if reel == "g6":
        # Los mismos momentos que usa src/inmobiliaria/Reel6.tsx.
        uno = tras("Uno,")
        ef = [
            (uno - 0.26, "whoosh", -14),
            (tras("tour", uno), "pop", -16),
            (tras("electricidad,", uno) - 0.05, "pop", -16),
            (tras("fontanería,", uno) - 0.05, "pop", -16),
            (tras("humedades.", uno) - 0.05, "pop", -16),
            (tras("lo", tras("firmar,", uno)) - 0.03, "golpe", -16),
            (tras("bajar", uno) - 0.05, "pop", -15),
        ]
        if version == "hook1":
            ef += [(tras("sin") - 0.02, "pop", -14), (tras("99"), "golpe", -15), (tras("12"), "pop", -15), (tras("200"), "pop", -15)]
        else:
            ef += [(tras("vas") - 0.02, "pop", -14)]
        if version != "prueba":
            dos = tras("2.", uno)
            tres = tras("tres", tras("hunde.", dos))
            detalle = tras("detalle", tras("tuyo", tres))
            ef += [
                (dos - 0.22, "whoosh", -15),
                (tras("único", dos), "pop", -16),
                (tras("media", dos), "pop", -16),
                (tras("mañana", dos) - 0.05, "pop", -16),
                (tras("noche.", dos) - 0.05, "pop", -16),
                (tras("ayuntamiento", dos) - 0.05, "pop", -16),
                (tras("centro", dos) - 0.05, "pop", -16),
                (tras("carretera", dos) - 0.05, "pop", -16),
                (tres - 0.22, "whoosh", -15),
                (tras("actas", tres), "pop", -16),
                (tras("aprobó", tres) + 0.12, "golpe", -14),
                (tras("últimos", tres) - 0.15, "pop", -17),
                (tras("derrama", tres), "golpe", -15),
                *[(detalle - 0.3 + i * 0.18, "tap", -17) for i in range(3)],
                (tras("Si", detalle) - 0.3, "whoosh", -15),
                (tras("comenta", detalle) - 0.1, "pop", -15),
                (tras("guía", detalle), "teclas", -14),
            ]

    elif reel == "g3":
        # Los mismos momentos que usa src/inmobiliaria/Reel3.tsx.
        uno = tras("Primero,")
        dos, tres = tras("Segundo,", uno), tras("Tercero,", uno)
        cuatro, cinco = tras("Cuarto,", tres), tras("quinto,", tres)
        mucho = tras("muchísimo", cinco)
        cta = tras("Si", tras("dinero", mucho))
        ef = [
            (tras("5") - 0.05, "pop", -15),
            (uno - 0.26, "whoosh", -14),
            (tras("nota", uno), "pop", -16),
            (tras("cargas,", uno) - 0.05, "pop", -16),
            (tras("embargos", uno) - 0.05, "pop", -16),
            (tras("hipotecas.", uno) - 0.05, "pop", -16),
            (tras("referencia", dos), "pop", -16),
            (tras("recibo", dos) - 0.05, "pop", -17),
            (tres - 0.22, "whoosh", -15),
            (tras("cédula", tres), "pop", -16),
            (tras("certificado", tres) - 0.05, "pop", -17),
            (tras("certificado", cuatro), "pop", -16),
            (tras("deudas", cuatro) + 0.2, "golpe", -16),
            (tras("quinto,", cuatro) - 0.3, "whoosh", -15),
            (tras("inspección", cinco), "pop", -16),
            (tras("resultado,", cinco) + 0.1, "golpe", -15),
            (tras("basta", cinco), "golpe", -16),
            *[(tras("condiciones.", cinco) - 0.4 + i * 0.18, "tap", -17) for i in range(5)],
            (tras("demanda", cinco) - 0.05, "pop", -16),
            (tras("inquilinos", cinco) - 0.05, "pop", -16),
            (mucho, "golpe", -15),
            (cta - 0.3, "whoosh", -15),
            (tras("comenta", mucho) - 0.1, "pop", -15),
            (tras("guía", mucho), "teclas", -14),
        ]
        ef += [(tras("pedir") - 0.02, "pop", -14)] if version == "hook1" else [(tras("sin") - 0.02, "pop", -14)]
    efectos = ef

    mz = Mezcla(g["duracion"] + 0.25)
    voz = leer(RAIZ / f"public/tiktok/{reel}/voz-{version}.wav")
    voz = voz / np.max(np.abs(voz))
    mz.bus[:, : len(voz)] += voz[: mz.n]
    for t, nombre, gain in efectos:
        x = leer(SFX / f"{nombre}.mp3")
        mz.poner(max(0, t), x / np.max(np.abs(x)), db(gain))
    mz.masterizar(str(RAIZ / f"public/tiktok/{reel}/mezcla-{version}.wav"), -14.0, fundido=0.05)


if __name__ == "__main__":
    main()
