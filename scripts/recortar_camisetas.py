"""Quita el fondo liso (blanco o negro) de las fotos de catálogo de Camis11.

Toma el color del borde de cada foto, marca como fondo la zona de ese color que toca
el borde (relleno por regiones conectadas) y guarda un PNG con transparencia,
recortado a la camiseta. Las perchas y etiquetas que no son del color del fondo
se quedan; para esas fotos conviene revisar el resultado.

Uso:
    python3 scripts/recortar_camisetas.py public/camis11/productos public/camis11/recortes
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def recortar(ruta, salida, tolerancia=34):
    img = Image.open(ruta).convert("RGB")
    a = np.asarray(img).astype(np.int16)
    h, w, _ = a.shape
    borde = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    fondo = np.median(borde, axis=0)
    dist = np.sqrt(((a - fondo) ** 2).sum(axis=2))
    parecido = dist < tolerancia
    etiquetas, _ = ndimage.label(parecido)
    tocan = np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]]))
    tocan = tocan[tocan > 0]
    es_fondo = np.isin(etiquetas, tocan)
    # Cierra agujeros pequeños dentro de la camiseta y suaviza el borde.
    cuerpo = ndimage.binary_fill_holes(~es_fondo)
    cuerpo = ndimage.binary_opening(cuerpo, iterations=2)
    etiquetas2, n = ndimage.label(cuerpo)
    if n > 1:
        tam = ndimage.sum(cuerpo, etiquetas2, range(1, n + 1))
        cuerpo = etiquetas2 == (np.argmax(tam) + 1)
    alfa = Image.fromarray((cuerpo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = img.copy()
    rgba.putalpha(alfa)
    ys, xs = np.where(cuerpo)
    m = 8
    caja = (max(0, xs.min() - m), max(0, ys.min() - m), min(w, xs.max() + m), min(h, ys.max() + m))
    rgba.crop(caja).save(salida)
    oscuro = fondo.mean() < 80
    print(f"{Path(ruta).name}: fondo {'oscuro' if oscuro else 'claro'} {fondo.astype(int).tolist()}, {cuerpo.mean() * 100:.0f}% camiseta")


def main():
    origen, destino = Path(sys.argv[1]), Path(sys.argv[2])
    destino.mkdir(parents=True, exist_ok=True)
    for ruta in sorted(origen.glob("*-1.*")):
        recortar(ruta, destino / (ruta.stem.removesuffix("-1") + ".png"))


if __name__ == "__main__":
    main()
