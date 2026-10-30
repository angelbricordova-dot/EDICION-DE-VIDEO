"""Busca y descarga fotos libres de Wikimedia Commons (API pública), filtrando por licencia.

Uso:
    python3 scripts/comun/buscar_commons.py <carpeta> nombre="consulta en inglés" [...] [--n 4] [--todas]

Por defecto solo dominio público / CC0 (sin atribución). Con --todas acepta también CC BY y CC BY-SA
(entonces hay que dar el crédito: queda en <carpeta>/<nombre>.json con autor, licencia y origen).
Baja miniaturas de 1600 px de ancho (Commons limita la descarga de originales) y va despacio.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "EdicionVideo/1.0 (montaje de video)"}
API = "https://commons.wikimedia.org/w/api.php"


def get(url, intentos=4):
    for i in range(intentos):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:  # noqa: BLE001
            if i == intentos - 1:
                print("  fallo", url[:90], e)
                return None
            time.sleep(4 * 2**i)


def libre(lic, todas):
    lic = (lic or "").lower()
    if "cc0" in lic or "public domain" in lic or lic.startswith("pd"):
        return True
    return todas and bool(re.match(r"cc[- ]by(-sa)?[- ]\d", lic))


def main():
    args = sys.argv[1:]
    n = int(args[args.index("--n") + 1]) if "--n" in args else 4
    todas = "--todas" in args
    destino = Path(args[0])
    destino.mkdir(parents=True, exist_ok=True)
    for par in [a for a in args[1:] if "=" in a]:
        nombre, consulta = par.split("=", 1)
        q = urllib.parse.urlencode({
            "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrlimit": 40,
            "gsrsearch": f"{consulta} filetype:bitmap", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1600,
        })
        d = get(f"{API}?{q}")
        paginas = sorted(json.loads(d).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99)) if d else []
        guardadas = []
        for p in paginas:
            if len(guardadas) >= n:
                break
            ii = (p.get("imageinfo") or [{}])[0]
            meta = ii.get("extmetadata", {})
            lic = meta.get("LicenseShortName", {}).get("value", "")
            if ii.get("width", 0) < 1000 or not libre(lic, todas) or not ii.get("thumburl"):
                continue
            time.sleep(1.5)
            b = get(ii["thumburl"])
            if not b or len(b) < 30000:
                continue
            f = destino / f"{nombre}-{len(guardadas) + 1}.jpg"
            f.write_bytes(b)
            autor = re.sub("<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip()
            guardadas.append({"archivo": f.name, "titulo": p["title"], "autor": autor, "licencia": lic, "origen": ii.get("descriptionurl"), "ancho": ii.get("width"), "alto": ii.get("height")})
        (destino / f"{nombre}.json").write_text(json.dumps(guardadas, ensure_ascii=False, indent=1))
        print(nombre, len(guardadas), "imágenes", flush=True)
        time.sleep(2)


if __name__ == "__main__":
    main()
