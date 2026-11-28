"""Jay (IamKingJay) · vlog con Landis: copias ligeras de trabajo (960×540, 60 fps) de los clips 4K del transfer, SIN guardar los originales.

El transfer es un .zip de 22,4 GB (sin comprimir, "stored"): cada clip está en un tramo fijo del zip. ffmpeg los
lee directamente por HTTP con el protocolo `subfile` (rangos), así que nunca se guardan los 4K en disco. Escribe
public/jordan/proxies/<clip>.mp4 y public/jordan/indice.json (nombre, inicio y tamaño de cada clip dentro del zip)
para sacar después en 1080p solo los trozos que se usen.

    node scripts/jordan/url_transfer.mjs | grep DESCARGA   (enlace firmado, dura 1 h)
    python3 scripts/jordan/proxies.py [url] [clip ...]   (sin url la saca sola y la renueva cada 35 min)
"""
import json
import struct
import subprocess
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
OUT = RAIZ / "public/jordan"
WL = ["-protocol_whitelist", "subfile,https,http,tls,tcp,crypto,file"]


def rango(url, a, b):
    req = urllib.request.Request(url, headers={"Range": f"bytes={a}-{b}"})
    return urllib.request.urlopen(req, timeout=120).read()


def indice(url):
    p = OUT / "indice.json"
    if p.exists():
        return json.loads(p.read_text())
    cola = rango(url, 24071974400 - 4194304, 24071974399)
    z = cola.rfind(b"PK\x06\x06")
    cd_size = struct.unpack("<Q", cola[z + 40:z + 48])[0]
    cd, q, items = cola[z - cd_size:z], 0, []
    while cd[q:q + 4] == b"PK\x01\x02":
        cs, us = struct.unpack("<II", cd[q + 20:q + 28])
        nl, el, cl = struct.unpack("<HHH", cd[q + 28:q + 34])
        off = struct.unpack("<I", cd[q + 42:q + 46])[0]
        name = cd[q + 46:q + 46 + nl].decode()
        ex, k = cd[q + 46 + nl:q + 46 + nl + el], 0
        while k < len(ex):
            hid, hl = struct.unpack("<HH", ex[k:k + 4])
            if hid == 1:
                vals = list(struct.unpack("<" + "Q" * (hl // 8), ex[k + 4:k + 4 + hl // 8 * 8]))
                if us == 0xFFFFFFFF: us = vals.pop(0)
                if cs == 0xFFFFFFFF: cs = vals.pop(0)
                if off == 0xFFFFFFFF: off = vals.pop(0)
            k += 4 + hl
        items.append({"nombre": name, "off": off, "tam": cs})
        q += 46 + nl + el + cl
    for it in items:  # inicio real de los datos: tras la cabecera local
        h = rango(url, it["off"], it["off"] + 29)
        nl, el = struct.unpack("<HH", h[26:30])
        it["datos"] = it["off"] + 30 + nl + el
    p.write_text(json.dumps(items, ensure_ascii=False, indent=1))
    return items


def url_nueva():
    out = subprocess.run(["node", str(RAIZ / "scripts/jordan/url_transfer.mjs")], capture_output=True, text=True, timeout=200).stdout
    return next(l.split(" ", 1)[1].strip() for l in out.splitlines() if l.startswith("DESCARGA "))


def main():
    import time
    url = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith("http") else url_nueva()
    t_url = time.time()
    items = indice(url)
    # los más pequeños primero; el largo de 10,9 GB al final
    items = sorted(items, key=lambda i: i["tam"])
    pedir = set(a for a in sys.argv[1:] if not a.startswith("http"))
    for it in items:
        if time.time() - t_url > 35 * 60:  # el enlace firmado dura 1 h
            url, t_url = url_nueva(), time.time()
        clip = Path(it["nombre"]).stem
        if pedir and clip not in pedir:
            continue
        dst = OUT / "proxies" / f"{clip}.mp4"
        src = f"subfile,,start,{it['datos']},end,{it['datos'] + it['tam']},,:{url}"
        if it["nombre"].lower().endswith(".wav"):
            dst = OUT / "sfx" / Path(it["nombre"]).name
            dst.parent.mkdir(exist_ok=True)
            subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *WL, "-i", src, "-c", "copy", str(dst)], check=True)
            print("sfx", dst.name)
            continue
        if dst.exists() and dst.stat().st_size > 1000:
            continue
        r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *WL, "-i", src, "-map", "0:v:0", "-map", "0:a:0?",
                            "-vf", "scale=960:-2", "-r", "60", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
                            "-c:a", "aac", "-b:a", "128k", str(dst)], capture_output=True, text=True)
        d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)], capture_output=True, text=True).stdout.strip()
        print(clip, "ok" if r.returncode == 0 else "FALLO " + r.stderr[-200:], d, flush=True)


if __name__ == "__main__":
    main()
