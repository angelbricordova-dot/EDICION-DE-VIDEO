"""Genera src/tubodega/guion-v1.json: marcas de la voz, frases (subtítulos) y efectos de la promo V1.

Las marcas salen de las pausas medidas en public/tubodega/voz/v1.mp3
(ffmpeg silencedetect, -36 dB, 0,07 s) sobre cada frase de Richard colocada al inicio de su escena (la 4 se regrabó con pausas).

Uso:
    python3 scripts/guion_tubodega.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR = RAIZ / "src/tubodega"

M = {
    # Voz de Richard (eleven_v3), cada frase colocada al inicio de su escena.
    # Escena 1: ¿Todavía anotas los fiados en un cuaderno?
    "s1": 0.0, "cuaderno": 1.85,
    # Escena 2: Con Tu Bodega vendes desde tu teléfono: escaneas el producto y listo.
    # "escaneo": pitido justo en "escaneas"; el refresco animado entra al teléfono y el clip sigue desde ahí.
    "s2": 2.8, "escaneas": 5.19, "escaneo": 5.15, "listo": 6.42,
    # Escena 3: Todo en dólares y en bolívares, con el vuelto calculado.
    "s3": 7.35, "dolares": 7.8, "bolivares": 8.45, "vuelto": 9.3,
    # Escena 4: Pago Móvil. Punto. Zelle. Efectivo. O fiado. (frase regrabada con pausas)
    "s4": 10.85, "pagomovil": 10.95, "punto": 11.93, "zelle": 12.62, "efectivo": 13.26, "fiado": 14.25,
    # Escena 5: Sabes quién te debe, cuánto vendiste y cuánto ganaste hoy.
    "s5": 14.95, "vendiste": 16.44, "ganaste": 17.45,
    # Escena 6: Imprime tu ticket, y funciona aunque se vaya el internet.
    "s6": 19.1, "funciona": 20.42, "internet": 21.75,
    # Escena 7: Tu Bodega. Prueba siete días gratis. Escríbenos por WhatsApp.
    "s7": 22.9, "gratis": 23.93, "whatsapp": 25.34,
    "golpe": 29.35, "fin": 30.0,
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
        {"t": M["escaneo"], "sonido": "beep", "gain": 1.0},
        {"t": M["listo"], "sonido": "pop", "gain": 0.6},
        {"t": M["s3"] - 0.15, "sonido": "whoosh", "gain": 0.5},
        {"t": M["dolares"], "sonido": "monedas", "gain": 0.5},
        {"t": M["vuelto"], "sonido": "pop", "gain": 0.8},
        {"t": M["pagomovil"] + 0.3, "sonido": "tap", "gain": 0.9},
        {"t": M["fiado"] - 0.05, "sonido": "tap", "gain": 0.9},
        {"t": M["s5"] - 0.15, "sonido": "whoosh", "gain": 0.5},
        {"t": M["ganaste"] + 0.15, "sonido": "chaching", "gain": 1.0},
        {"t": M["s6"] + 0.15, "sonido": "impresora", "gain": 0.9},
        {"t": M["internet"], "sonido": "pop", "gain": 0.7},
        {"t": M["s7"] - 0.15, "sonido": "whoosh", "gain": 0.7},
        {"t": M["gratis"], "sonido": "pop", "gain": 0.6},
        {"t": M["golpe"], "sonido": "golpe", "gain": 1.0},
    ]
    g = {"duracion": M["fin"], "marcas": M, "frases": frases, "efectos": efectos}
    (DIR / "guion-v1.json").write_text(json.dumps(g, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps(M))


if __name__ == "__main__":
    main()
