"""Voz en off con ElevenLabs a partir del guion de un timeline.json.

Genera el guion completo en una sola llamada (entonación más natural) y pide a
ElevenLabs los tiempos de cada carácter. Con eso calcula cuándo empieza y
termina cada frase y los guarda en `voz.json` junto al timeline, para que los
visuales se sincronicen con la voz.

La clave NUNCA va en el código: se lee de la variable de entorno
ELEVENLABS_API_KEY (configurada como secreto del entorno).

Uso:
    python3 scripts/voz_elevenlabs.py --listar-voces
    python3 scripts/voz_elevenlabs.py src/ivm/timeline.json --voz <voice_id> \\
        --salida public/audio/ivm-voz.mp3
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
MODELO = "eleven_multilingual_v2"


def clave():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        sys.exit("Falta la variable de entorno ELEVENLABS_API_KEY (configúrala como secreto del entorno).")
    return k


def pedir(metodo, ruta, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(
        f"{API}{ruta}",
        data=datos,
        method=metodo,
        headers={"xi-api-key": clave(), "Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs respondió {e.code}: {e.read().decode(errors='replace')[:500]}")
    except urllib.error.URLError as e:
        sys.exit(f"No se pudo conectar con ElevenLabs ({e.reason}). ¿Está api.elevenlabs.io permitido en la red?")


def listar_voces():
    for v in pedir("GET", "/voices").get("voices", []):
        etiquetas = ", ".join(f"{k}: {val}" for k, val in (v.get("labels") or {}).items())
        print(f"{v['voice_id']}  {v['name']}  ({etiquetas})")


def generar(timeline, voz, salida, estabilidad, similitud, estilo):
    tl = json.loads(Path(timeline).read_text())
    lineas = [g["texto"] for g in tl["guion"]]
    # Un espacio entre frases; la puntuación de cada una marca las pausas.
    texto = " ".join(lineas)
    r = pedir(
        "POST",
        f"/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128",
        {
            "text": texto,
            "model_id": MODELO,
            "voice_settings": {
                "stability": estabilidad,
                "similarity_boost": similitud,
                "style": estilo,
                "use_speaker_boost": True,
            },
        },
    )
    Path(salida).parent.mkdir(parents=True, exist_ok=True)
    Path(salida).write_bytes(base64.b64decode(r["audio_base64"]))

    al = r.get("alignment") or r.get("normalized_alignment")
    inicios, fines = al["character_start_times_seconds"], al["character_end_times_seconds"]
    resultado, pos = [], 0
    for linea in lineas:
        a, b = pos, pos + len(linea) - 1
        resultado.append({"texto": linea, "t": round(inicios[a], 3), "fin": round(fines[b], 3)})
        pos += len(linea) + 1
    destino = Path(timeline).with_name("voz.json")
    destino.write_text(
        json.dumps({"audio": str(salida), "duracion": round(fines[-1], 3), "lineas": resultado}, indent=2, ensure_ascii=False)
        + "\n"
    )
    print(f"Voz: {salida} ({fines[-1]:.1f} s). Tiempos por frase en {destino}:")
    for l in resultado:
        print(f"  {l['t']:6.2f}–{l['fin']:6.2f}  {l['texto']}")


def main():
    ap = argparse.ArgumentParser(description="Voz en off con ElevenLabs desde el guion de un timeline.json")
    ap.add_argument("timeline", nargs="?", help="timeline.json con la lista 'guion'")
    ap.add_argument("--listar-voces", action="store_true", help="muestra las voces disponibles y sale")
    ap.add_argument("--voz", help="voice_id de ElevenLabs (o variable ELEVENLABS_VOICE_ID)")
    ap.add_argument("--salida", help="MP3 de salida, p. ej. public/audio/ivm-voz.mp3")
    ap.add_argument("--estabilidad", type=float, default=0.45)
    ap.add_argument("--similitud", type=float, default=0.8)
    ap.add_argument("--estilo", type=float, default=0.25)
    a = ap.parse_args()
    if a.listar_voces:
        return listar_voces()
    voz = a.voz or os.environ.get("ELEVENLABS_VOICE_ID")
    if not (a.timeline and voz and a.salida):
        ap.error("hacen falta timeline, --voz (o ELEVENLABS_VOICE_ID) y --salida")
    generar(a.timeline, voz, a.salida, a.estabilidad, a.similitud, a.estilo)


if __name__ == "__main__":
    main()
