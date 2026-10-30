"""Busca y descarga imágenes libres (dominio público / CC0, sin atribución) con la API de Openverse.

Uso:
    python3 scripts/comun/buscar_imagenes.py <carpeta> nombre="consulta en inglés" [nombre2="..."] [--n 4] [--licencias cc0,pdm]
        [--fuentes stocksnap,rawpixel]

Solo fotografías. --fuentes limita a bancos de fotos modernas (StockSnap y rawpixel dan fotos actuales;
sin filtro salen muchas de archivo o museos).

Guarda <carpeta>/<nombre>-<i>.jpg y <carpeta>/<nombre>.json con la licencia, autor y origen de cada
una (para poder citarlas si hiciera falta). Prefiere fotos grandes y horizontales o cuadradas.
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "EdicionVideo/1.0 (montaje de video)"}


def get(url, intentos=4):
    for i in range(intentos):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:  # noqa: BLE001
            if i == intentos - 1:
                print("  fallo", url[:80], e)
                return None
            time.sleep(3 * 2**i)


def buscar(params):
    for _ in range(3):  # Openverse a veces responde vacío o tarda: reintenta
        d = get(f"https://api.openverse.org/v1/images/?{urllib.parse.urlencode(params)}")
        try:
            return json.loads(d)["results"]
        except Exception:  # noqa: BLE001
            time.sleep(5)
    return []


def main():
    args = sys.argv[1:]
    n = int(args[args.index("--n") + 1]) if "--n" in args else 4
    lic = args[args.index("--licencias") + 1] if "--licencias" in args else "cc0,pdm"
    fuentes = args[args.index("--fuentes") + 1] if "--fuentes" in args else None
    pares = [a for a in args[1:] if "=" in a]
    destino = Path(args[0])
    destino.mkdir(parents=True, exist_ok=True)
    for par in pares:
        nombre, consulta = par.split("=", 1)
        base = {"q": consulta, "license": lic, "page_size": 20, "mature": "false", "category": "photograph"}
        if fuentes:
            base["source"] = fuentes
        res = buscar({**base, "size": "large"})
        if len(res) < n:  # si hay pocas grandes, sin el filtro de tamaño
            res = buscar(base) or res
        guardadas = []
        for r in res:
            if len(guardadas) >= n:
                break
            if (r.get("width") or 0) < 700:
                continue
            b = get(r["url"])
            if not b or len(b) < 20000:
                continue
            f = destino / f"{nombre}-{len(guardadas) + 1}.jpg"
            f.write_bytes(b)
            guardadas.append({"archivo": f.name, "titulo": r.get("title"), "autor": r.get("creator"), "licencia": r.get("license"), "origen": r.get("foreign_landing_url"), "ancho": r.get("width"), "alto": r.get("height")})
        (destino / f"{nombre}.json").write_text(json.dumps(guardadas, ensure_ascii=False, indent=1))
        print(nombre, len(guardadas), "imágenes")


if __name__ == "__main__":
    main()
