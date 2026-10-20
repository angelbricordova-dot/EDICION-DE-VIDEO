"""Genera src/tubodega/guion-v1.json: marcas de la voz, frases (subtítulos) y efectos de la promo V1.

Las marcas salen de las pausas medidas en public/tubodega/voz/v1.mp3
(ffmpeg silencedetect, -36 dB, 0,07 s) sobre la voz acelerada 1,06×.

Uso:
    python3 scripts/guion_tubodega.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR = RAIZ / "src/tubodega"

M = {
    # Escena 1: ¿Todavía anotas los fiados en un cuaderno?
    "s1": 0.0, "cuaderno": 1.75,
    # Escena 2: Con Tu Bodega vendes desde tu teléfono: escaneas el producto y listo.
    "s2": 2.72, "escaneas": 5.89, "listo": 6.84,
    # Escena 3: Todo en dólares y en bolívares, con el vuelto calculado.
    "s3": 7.76, "vuelto": 9.35,
    # Escena 4: Pago Móvil, punto, Zelle, efectivo… o fiado.
    "s4": 10.92, "pagomovil": 10.98, "punto": 12.04, "zelle": 13.13, "efectivo": 13.53, "fiado": 14.44,
    # Escena 5: Sabes quién te debe, cuánto vendiste y cuánto ganaste hoy.
    "s5": 15.75, "vendiste": 17.34, "ganaste": 18.96,
    # Escena 6: Imprime tu ticket, y funciona aunque se vaya el internet.
    "s6": 20.3, "internet": 22.3,
    # Escena 7: Tu Bodega. Prueba quince días gratis. Escríbenos por WhatsApp.
    "s7": 23.62, "gratis": 24.49, "whatsapp": 26.21,
    "fin": 30.0,
}


def main():
    voz = json.loads((DIR / "voz-v1.json").read_text())
    loc = json.loads((DIR / "locucion-v1.json").read_text())
    frases = [
        {"desde": l["t"], "hasta": l["fin"], "texto": f.get("pantalla", f["texto"]), "clave": f["clave"]}
        for l, f in zip(voz["lineas"], loc["frases"])
    ]
    efectos = [
        {"t": 0.05, "sonido": "whoosh", "gain": 0.8},
        {"t": M["cuaderno"] + 0.25, "sonido": "pop", "gain": 0.7},
        {"t": M["s2"] - 0.15, "sonido": "whoosh", "gain": 0.6},
        {"t": M["s2"] + 0.6, "sonido": "beep", "gain": 1.0},
        {"t": M["s2"] + 3.9, "sonido": "pop", "gain": 0.6},
        {"t": M["s3"] - 0.15, "sonido": "whoosh", "gain": 0.5},
        {"t": M["vuelto"], "sonido": "pop", "gain": 0.8},
        {"t": M["pagomovil"] + 0.3, "sonido": "tap", "gain": 0.9},
        {"t": M["fiado"] - 0.05, "sonido": "tap", "gain": 0.9},
        {"t": M["s5"] - 0.15, "sonido": "whoosh", "gain": 0.5},
        {"t": M["ganaste"] + 0.15, "sonido": "chaching", "gain": 1.0},
        {"t": M["s6"] + 0.15, "sonido": "impresora", "gain": 0.9},
        {"t": M["internet"], "sonido": "pop", "gain": 0.7},
        {"t": M["s7"] - 0.15, "sonido": "whoosh", "gain": 0.7},
        {"t": M["gratis"], "sonido": "pop", "gain": 0.6},
        {"t": 29.35, "sonido": "golpe", "gain": 1.0},
    ]
    g = {"duracion": M["fin"], "marcas": M, "frases": frases, "efectos": efectos}
    (DIR / "guion-v1.json").write_text(json.dumps(g, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps(M))


if __name__ == "__main__":
    main()
