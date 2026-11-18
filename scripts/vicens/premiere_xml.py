"""Exporta un clip de Vicens a Premiere (docs/vicens.md): XML de secuencia (Final Cut Pro 7 / xmeml v4, se
abre con Archivo → Importar y crea la secuencia con sus pistas) + subtítulos .srt.

Pistas: V1 tramos de video (con 2 s de margen a cada lado para recortar), V2 cartel, V3 marca, V4 subtítulos
(PNG transparentes 1080×1920 con el estilo del clip), A1/A2 audio del directo.

Uso: python3 scripts/vicens/premiere_xml.py src/vicens/avion.json out/vicens/premiere/vicens-avion-cazas \
       "C:/Users/Administrador/Downloads/vicens-avion-cazas"
"""

import json
import sys
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

FPS = 60
MARGEN = 2.0  # segundos de más a cada lado de cada tramo


def fr(s):
    return int(round(s * FPS))


def url(base, rel):
    p = f"{base.rstrip('/')}/{rel}"
    if len(p) > 1 and p[1] == ":":  # C:/… → file://localhost/C%3a/…
        p = p[0] + "%3a" + p[2:]
    return "file://localhost/" + quote(p, safe="/%")


def rate():
    return f"<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>"


def archivo(fid, nombre, ruta, dur, audio):
    a = "<audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio>" if audio else ""
    return (f'<file id="{fid}"><name>{escape(nombre)}</name><pathurl>{ruta}</pathurl>{rate()}<duration>{dur}</duration>'
            f"<media><video><samplecharacteristics>{rate()}<width>1080</width><height>1920</height></samplecharacteristics></video>{a}</media></file>")


def main():
    guion, salida, base = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
    g = json.loads(Path(guion).read_text())
    nombre = salida.name
    dur_total = fr(g["duracion"])
    v1, v2, v3, v4, a1, a2 = [], [], [], [], [], []
    vistos = set()
    pos = 0
    for i, (a, b) in enumerate(g["tramos"], 1):
        largo = fr(b - a)
        fid = f"tramo{i}"
        f_dur = fr(b - a + 2 * MARGEN)
        f = archivo(fid, f"tramo{i}.mp4", url(base, f"video/tramo{i}.mp4"), f_dur, True)
        comun = f"{rate()}<start>{pos}</start><end>{pos + largo}</end><in>{fr(MARGEN)}</in><out>{fr(MARGEN) + largo}</out>"
        v1.append(f'<clipitem id="v-{fid}"><name>Tramo {i}</name><duration>{f_dur}</duration>{comun}{f}'
                  f'<link><linkclipref>v-{fid}</linkclipref></link><link><linkclipref>a1-{fid}</linkclipref></link><link><linkclipref>a2-{fid}</linkclipref></link></clipitem>')
        for pista, n in ((a1, 1), (a2, 2)):
            pista.append(f'<clipitem id="a{n}-{fid}"><name>Tramo {i}</name><duration>{f_dur}</duration>{comun}<file id="{fid}"/>'
                         f"<sourcetrack><mediatype>audio</mediatype><trackindex>{n}</trackindex></sourcetrack></clipitem>")
        pos += largo

    def still(pista, cid, nombre_png, ini, fin):
        fid = "f-" + nombre_png
        f = archivo(fid, nombre_png, url(base, f"capas/{nombre_png}"), 18000, False) if fid not in vistos else f'<file id="{fid}"/>'
        vistos.add(fid)
        pista.append(f'<clipitem id="{cid}"><name>{escape(nombre_png)}</name><duration>18000</duration>{rate()}'
                     f"<start>{ini}</start><end>{fin}</end><in>0</in><out>{fin - ini}</out>{f}</clipitem>")

    corte = fr(g["cartelHasta"])
    still(v2, "cartel", "cartel.png", 0, corte)
    still(v3, "marca1", "marca-con-cartel.png", 0, corte)
    still(v3, "marca2", "marca.png", corte, dur_total)
    srt = []
    for i, s in enumerate(g["subs"], 1):
        still(v4, f"sub{i}", f"sub-{i:02d}.png", fr(s["ini"]), fr(s["fin"]))
        t = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)):03d}"
        srt.append(f"{i}\n{t(s['ini'])} --> {t(s['fin'])}\n{s['t']}\n")

    pista = lambda items: "<track>" + "".join(items) + "</track>"
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><sequence id="seq">'
           f"<name>{escape(nombre)}</name><duration>{dur_total}</duration>{rate()}"
           "<media><video><format><samplecharacteristics>" + rate() +
           "<width>1080</width><height>1920</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>"
           + pista(v1) + pista(v2) + pista(v3) + pista(v4) +
           "</video><audio>" + pista(a1) + pista(a2) + "</audio></media></sequence></xmeml>\n")
    (salida / f"{nombre}.xml").write_text(xml, encoding="utf-8")
    (salida / f"{nombre}-subtitulos.srt").write_text("\n".join(srt), encoding="utf-8")
    print("listo", salida / f"{nombre}.xml")


if __name__ == "__main__":
    main()
