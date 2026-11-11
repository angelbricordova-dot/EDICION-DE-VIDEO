"""Imágenes y textos del lote 61–99 (docs/marryto.md). Uso: python3 scripts/marryto/lote61.py"""
import json
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
M = "marryto/material/"
SHORT = {61: "MeJHmajqBPA", **{n: "K1lZBfNW-cE" for n in (62, 63)}, **{n: "Jf_1xReE0eo" for n in (64, 65, 66)},
         **{n: "073aklHRtFY" for n in (67, 68, 69)}, **{n: "LAz95_PqDN0" for n in (70, 71, 72)}, **{n: "A9BRfa7C4mk" for n in (73, 74, 75)},
         **{n: "19eD-qIsHZw" for n in (76, 77, 78)}, **{n: "eCDGOWY2OnA" for n in (79, 80, 81)}, 82: "-bCb5LbdNoo",
         **{n: "EW5NA1kblfA" for n in (83, 84)}, **{n: "xHVqZt-sozM" for n in (85, 86, 87)}, **{n: "ecYOpjOO4iM" for n in (88, 89, 90)},
         **{n: "JPpnrLi92nA" for n in (91, 92, 93)}, 94: "CuPK_ZEjr28", **{n: "b5d7NQf5dBI" for n in (95, 96, 97)}, **{n: "yHJyKaMjxA8" for n in (98, 99)}}


def img(nombre, x, ancho, titulo="", tam=64, y=40):
    ruta = RAIZ / "public" / (M + nombre)
    w, h = (int(v) for v in subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(ruta)], capture_output=True, text=True).stdout.strip().split(",")[:2])
    c = {"imagen": M + nombre, "caja": [x, y, ancho], "imgAspecto": round(h / w, 4), "sinTexto": not titulo, "titulo": titulo}
    if titulo:
        c.update({"textoY": round(y + ancho * h / w + 14), "textoTam": tam})
    return c


LISTA = {"listaMargen": 150, "listaY": 1290, "listaTam": 52, "etiquetaY": 330, "sinTexto": True, "titulo": ""}
CFG = {
    62: img("letras-ramo.png", 240, 600), 63: img("letras-cola.png", 240, 600),
    **{n: img("ochos.png", 260, 560, "Cuántos 8 ves? Yo 14", 66) for n in (67, 68, 69)},
    73: img("palabra-perro.png", 130, 820), 74: img("palabra-gato.png", 130, 820), 75: img("palabra-libro.png", 130, 820),
    79: img("palabra-cerdo.png", 130, 820), 80: img("palabra-ciervo.png", 130, 820), 81: img("palabra-canguro.png", 130, 820),
    82: {**LISTA, "etiqueta": "El último número que te salga después de dar like será tu próximo regalo de Navidad 🤫🎄",
         "lista": [["0. Bici", "1. Peluche", "2. Videojuego", "3. Lego", "4. Pijama"], ["5. Tablet", "6. Patines", "7. Cascos", "8. Consola", "9. Carbón"]]},
    **{n: img("alfabeto-error.png", 220, 640) for n in (83, 84)},
    **{n: img("tono-piel.png", 200, 680, "Toca 2 veces en tu tono 👀", 64) for n in (85, 86, 87)},
    **{n: img("nombre-japones.png", 160, 760) for n in (91, 92, 93)},
    94: {**LISTA, "etiqueta": "El número que te salga después de dar like será tu próximo trabajo 😉",
         "lista": [["0. Astronauta", "1. Chef", "2. Piloto", "3. Youtuber", "4. Veterinario"], ["5. Futbolista", "6. Abogado", "7. Bombero", "8. DJ", "9. Payaso"]]},
    **{n: img("pilares.png", 240, 600, "Solo un 10% lo adivina 💀", 64) for n in (95, 96, 97)},
    **{n: img("perrito.png", 280, 520) for n in (98, 99)},
}

ruta = RAIZ / "src/marryto/videos.json"
d = json.loads(ruta.read_text())
for n, sh in SHORT.items():
    v = d.setdefault(str(n), {})
    for k in ("imagen", "caja", "cajaAlto", "cajaFoto", "etiqueta", "lista", "pastillas", "imgAspecto", "textoColor", "sinImagen", "tomas", "duracion", "fundido", "audio", "audioDesde", "textoY", "textoTam"):
        v.pop(k, None)
    v.update({"estilo": "superpuesto", "short": sh, "rojo": "", "recorte": [0, 0, 1080, 1920], "bajar": 160, "titulo": "", "sinTexto": True})
    v.update(CFG.get(n, {}))
ruta.write_text(json.dumps(d, ensure_ascii=False, indent=1))
print("listo", len(SHORT))
