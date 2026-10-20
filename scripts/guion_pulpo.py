"""Genera src/pulpo/guion.json para el short del pulpo (10 s): palabras con tiempos y efectos.

La clave de ElevenLabs no tiene permiso de speech-to-text, así que las palabras se
reparten por caracteres dentro de cada tramo de voz, con los tramos marcados por las
pausas medidas (silencedetect / envolvente sobre public/pulpo/audio/voz.mp3).

Uso:
    python3 scripts/guion_pulpo.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DURACION = 10.6

# Tramos de voz (inicio, fin, texto), separados por pausas reales.
TRAMOS = [
    (0.08, 2.42, "¿Sabías que el pulpo tiene tres corazones?"),
    (2.48, 4.50, "Dos bombean sangre a las branquias"),
    (4.58, 5.90, "y uno al resto del cuerpo."),
    (6.05, 6.85, "Cuando nada,"),
    (6.90, 8.28, "ese último se detiene…"),
    (8.37, 9.98, "por eso prefiere arrastrarse."),
]


def palabras():
    res = []
    for a, b, texto in TRAMOS:
        ws = texto.split(" ")
        pesos = [len(w.strip("¿?.,…")) + 1.5 for w in ws]
        total = sum(pesos)
        t = a
        for w, p in zip(ws, pesos):
            d = (b - a) * p / total
            res.append({"w": w, "t": round(t, 3), "fin": round(t + d, 3)})
            t += d
    return res


def main():
    pal = palabras()
    cuando = {p["w"].strip("¿?.,…").lower(): p["t"] for p in pal}
    m = {
        "aterriza": 0.55,
        "tres": cuando["tres"],
        "corazones": cuando["corazones"],
        "rayosx": 2.45,
        "dos": cuando["dos"],
        "branquias": cuando["branquias"],
        "uno": cuando["uno"],
        "cuerpo": cuando["cuerpo"],
        "nada": 6.0,
        "detiene": cuando["detiene"],
        "cae": 8.3,
        "suelo": 8.72,
        "arrastra": cuando["arrastrarse"],
    }
    efectos = [
        {"t": 0.3, "sonido": "rebote", "gain": 0.9},
        {"t": m["tres"] - 0.05, "sonido": "latido", "gain": 0.8},
        {"t": m["corazones"], "sonido": "pop", "gain": 0.9},
        {"t": m["rayosx"] - 0.12, "sonido": "zoom", "gain": 0.8},
        {"t": m["dos"] + 0.1, "sonido": "latido", "gain": 0.7},
        {"t": m["branquias"] - 0.3, "sonido": "flujo", "gain": 0.7},
        {"t": m["branquias"], "sonido": "pop", "gain": 0.6},
        {"t": m["uno"] + 0.05, "sonido": "latido", "gain": 0.7},
        {"t": m["cuerpo"] - 0.2, "sonido": "flujo", "gain": 0.6},
        {"t": m["nada"] - 0.12, "sonido": "zoom", "gain": 0.6},
        {"t": m["nada"], "sonido": "burbujas", "gain": 0.9},
        {"t": m["detiene"] - 0.35, "sonido": "detiene", "gain": 1.0},
        {"t": m["suelo"] - 0.05, "sonido": "golpe", "gain": 1.0},
        {"t": m["suelo"] + 0.25, "sonido": "arrastre", "gain": 0.7},
        {"t": 9.55, "sonido": "trombon", "gain": 0.9},
    ]
    guion = {"duracion": DURACION, "tramos": TRAMOS, "palabras": pal, "marcas": m, "efectos": efectos}
    (RAIZ / "src/pulpo/guion.json").write_text(json.dumps(guion, indent=1, ensure_ascii=False) + "\n")
    for p in pal:
        print(f"{p['t']:5.2f}  {p['w']}")
    print(m)


if __name__ == "__main__":
    main()
