"""Genera src/camis11/guion.json: escenas, montaje de la música y efectos del reel Futbol Onze × Camis11.

Todo se ancla a la voz de Alejandro (src/camis11/voz.json + pausas medidas) y al pulso
de la música (129,2 BPM). La misma lista la leen Remotion (visuales) y
scripts/camis11/sonido_camis11.py (mezcla).

Uso:
    python3 scripts/camis11/guion_camis11.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DIR = RAIZ / "src/camis11"
DURACION = 30.0

# Música (public/camis11/audio/musica-1.mp3): pulso 0,4644 s; el primer gran drop está en 6,88 s.
PULSO = 0.4644
DROP = 6.88

# Marcas medidas en la voz (pausas con silencedetect sobre alejandro.mp3).
M = {
    "buscas": 0.28, "para": 2.34, "esto": 2.91, "mil": 4.32, "retro": 7.14,
    "dragon": 9.10, "oliver": 9.97, "balmain": 11.02, "roja": 12.54, "estrellas": 13.9,
    "envio": 14.92, "devoluciones": 16.38, "personaliza": 17.95, "nombre": 18.9,
    "codigo": 20.15, "diez": 21.75, "entra": 23.63, "web": 24.3, "lema": 25.25, "fin_voz": 27.06,
}


def main():
    voz = json.loads((DIR / "voz.json").read_text())
    loc = json.loads((DIR / "locucion.json").read_text())
    frases = [
        {"desde": l["t"], "hasta": l["fin"], "texto": f.get("pantalla", f["texto"]), "clave": f["clave"]}
        for l, f in zip(voz["lineas"], loc["frases"])
    ]

    # Montaje de la música: [inicio en el video, inicio en la pista, duración].
    # El drop cae justo en "Para." y vuelve a caer en el código; antes de cada uno, un corte seco.
    corte1 = M["para"] - 0.02
    corte2 = M["codigo"] - 0.02
    musica = [
        [0.0, DROP - corte1, corte1 - 0.12],  # tensión (la pista antes del drop)
        [corte1, DROP, corte2 - 0.2 - corte1],  # drop 1 hasta el código
        [corte2, DROP, M["fin_voz"] + 0.2 - corte2],  # drop 2 desde el código
    ]

    escenas = [
        {"id": "gancho", "desde": 0.0, "hasta": corte1},
        {"id": "para", "desde": corte1, "hasta": M["mil"]},
        {"id": "catalogo", "desde": M["mil"], "hasta": M["retro"]},
        {"id": "retro", "desde": M["retro"], "hasta": M["dragon"]},
        {"id": "especial", "desde": M["dragon"], "hasta": M["oliver"], "foto": "edicion-especial-japon-x-dragon-ball.png", "titulo": "DRAGON BALL", "color": "#ff7a00"},
        {"id": "especial", "desde": M["oliver"], "hasta": M["balmain"], "foto": "edicion-especial-camiseta-japon-x-oliver-y-benji.png", "titulo": "OLIVER Y BENJI", "color": "#ffffff"},
        {"id": "especial", "desde": M["balmain"], "hasta": M["roja"], "foto": "edicion-especial-real-madrid-x-balmain-negra.png", "titulo": "REAL MADRID × BALMAIN", "color": "#D4FF00"},
        {"id": "estrellas", "desde": M["roja"], "hasta": M["envio"]},
        {"id": "envio", "desde": M["envio"], "hasta": M["devoluciones"]},
        {"id": "devoluciones", "desde": M["devoluciones"], "hasta": M["personaliza"]},
        {"id": "personaliza", "desde": M["personaliza"], "hasta": corte2},
        {"id": "codigo", "desde": corte2, "hasta": M["entra"]},
        {"id": "web", "desde": M["entra"], "hasta": M["lema"]},
        {"id": "lema", "desde": M["lema"], "hasta": M["fin_voz"] + 0.15},
        {"id": "cierre", "desde": M["fin_voz"] + 0.15, "hasta": DURACION},
    ]

    w = lambda t, g=0.8: {"t": round(t - 0.18, 3), "sonido": "whoosh", "gain": g}  # noqa: E731
    efectos = [
        {"t": 0.05, "sonido": "riser", "gain": 0.6},
        {"t": corte1 - 0.12, "sonido": "stop", "gain": 0.7},
        {"t": corte1, "sonido": "impacto", "gain": 1.0},
        {"t": corte1, "sonido": "silbato", "gain": 0.5},
        w(M["mil"]),
        {"t": M["mil"] + 0.1, "sonido": "flash", "gain": 0.6},
        w(M["retro"]),
        {"t": M["retro"] + 0.05, "sonido": "impacto-corto", "gain": 0.7},
        {"t": M["dragon"], "sonido": "impacto-corto", "gain": 0.8},
        {"t": M["oliver"], "sonido": "impacto-corto", "gain": 0.8},
        {"t": M["balmain"], "sonido": "impacto-corto", "gain": 0.8},
        w(M["roja"]),
        {"t": M["estrellas"], "sonido": "flash", "gain": 0.7},
        {"t": M["envio"], "sonido": "avion", "gain": 0.6},
        w(M["devoluciones"], 0.6),
        w(M["personaliza"], 0.6),
        {"t": M["nombre"] - 0.1, "sonido": "teclado", "gain": 0.7},
        {"t": corte2 - 0.95, "sonido": "riser", "gain": 0.8},
        {"t": corte2, "sonido": "impacto", "gain": 1.0},
        {"t": corte2 + 0.35, "sonido": "teclado", "gain": 0.6},
        {"t": M["diez"] - 0.55, "sonido": "patada", "gain": 0.9},
        {"t": M["diez"] - 0.02, "sonido": "balonazo", "gain": 1.0},
        {"t": M["diez"] + 0.25, "sonido": "exito", "gain": 0.7},
        {"t": M["diez"] + 0.05, "sonido": "estadio", "gain": 0.5},
        w(M["entra"]),
        w(M["lema"], 0.6),
        {"t": M["fin_voz"] + 0.15, "sonido": "impacto", "gain": 0.9},
        {"t": M["fin_voz"] + 0.2, "sonido": "estadio", "gain": 0.6},
    ]

    guion = {"duracion": DURACION, "pulso": PULSO, "marcas": M, "frases": frases, "musica": musica, "escenas": escenas, "efectos": efectos}
    (DIR / "guion.json").write_text(json.dumps(guion, indent=1, ensure_ascii=False) + "\n")
    for e in escenas:
        print(f"{e['desde']:6.2f}–{e['hasta']:6.2f}  {e['id']} {e.get('titulo', '')}")


if __name__ == "__main__":
    main()
