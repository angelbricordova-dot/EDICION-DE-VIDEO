"""Tiempos y sonido de un episodio de Toño (docs/glowup.md).

Antes:
  1. voz con pausas: scripts/comun/voz_elevenlabs.py (con permiso de Angel) + scripts/glowup/pausas.py
  2. palabras: /home/user/tts/venv-asr/bin/python scripts/comun/transcribir.py <voz.mp3 a 16 kHz> public/glowup/diaN/palabras.json
     (sobre la voz SIN pausas: aquí se desplazan a la línea de tiempo con pausas)
Uso:
    python3 scripts/glowup/montar_dia.py 0
Escribe src/glowup/diaN.json (frases y palabras en tiempo del reel, lo lee Remotion) y
public/glowup/diaN/mezcla.wav (voz + música debajo + efectos, −14 LUFS).
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "comun"))
from musica import poner_musica  # noqa: E402
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
SFX = RAIZ / "public/comun/sfx/mixkit"
MUSICA = RAIZ / "public/comun/musica/mixkit"

# Por episodio: palabras clave (amarillo), palabras de dinero (verde), cola tras la última
# frase, música y efectos (frase, segundos desde su inicio, sonido, dB).
EPISODIOS = {
    0: {
        "claves": ["toño", "mamá", "gta", "vi", "juego", "primero", "vender", "trabajo", "sígueme", "uno"],
        "dinero": ["cero", "pesos", "mil", "dólares"],
        "cola": 1.2,
        "musica": ("comical.mp3", 0.0),
        "efectos": [
            ("este", -0.15, "mosca.mp3", -16),
            ("edad", -0.05, "barrido-2.mp3", -14),
            ("mama", 0.55, "pop-duro.mp3", -12),
            ("gta", -0.05, "notificacion.mp3", -8),
            ("gta", 0.35, "boing.mp3", -14),
            ("juego", -0.05, "barrido-3.mp3", -14),
            ("juego", 0.35, "trombon-triste.mp3", -12),
            ("meta", 0.0, "pop-1.mp3", -10),
            ("meta", 1.2, "acierto.mp3", -14),
            ("pregunta", 0.0, "pop-2.mp3", -10),
            ("opciones", 0.55, "pop-3.mp3", -10),
            ("opciones", 2.1, "pop-4.mp3", -10),
            ("sigueme", 0.1, "clic-2.mp3", -8),
        ],
    },
}


def leer(ruta, mono=True):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"],
                           capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def limpio(p):
    return p.strip(".,;:¿?¡!…").lower()


def main():
    n = int(sys.argv[1])
    cfg = EPISODIOS[n]
    voz_json = json.loads((RAIZ / f"src/glowup/dia{n}-voz.json").read_text())
    lineas = voz_json["lineas"]
    ids = [f["id"] for f in json.loads((RAIZ / f"src/glowup/dia{n}-guion.json").read_text())["frases"]]
    crudas = json.loads((RAIZ / f"public/glowup/dia{n}/palabras.json").read_text())["palabras"]

    frases = [{"id": i, "texto": l["texto"], "t": l["t2"], "fin": l["fin2"]} for i, l in zip(ids, lineas)]
    palabras, anterior = [], ""
    for w in crudas:
        # la frase a la que pertenece (por tiempo en la voz sin pausas) da el desplazamiento
        # (la última que ya empezó, con 0,2 s de margen: whisper marca algo antes que ElevenLabs)
        l = max((l for l in lineas if l["t"] - 0.2 <= w["ini"]), key=lambda l: l["t"], default=lineas[0])
        d = l["t2"] - l["t"]
        p = w["p"].replace("¿", "").replace("¡", "").replace("?", "").replace("!", "")
        if limpio(p) == "6" and anterior == "gta":
            p = "VI" + p[1:]
        palabras.append({"p": p, "ini": round(w["ini"] + d, 3), "fin": round(w["fin"] + d, 3),
                         "clave": limpio(p) in cfg["claves"], "dinero": limpio(p) in cfg["dinero"]})
        anterior = limpio(p)
    dur = round(voz_json["duracion2"] + cfg["cola"], 2)

    voz = leer(RAIZ / f"public/glowup/dia{n}/voz-pausas.wav")
    mz = Mezcla(dur)
    mz.poner(0, voz, 1.0)
    pista, desde = cfg["musica"]
    poner_musica(mz, voz, palabras, MUSICA / pista, desde=desde, bajo_voz=-17, huecos=-10, entrada=0.2, salida=0.8)
    inicio = {f["id"]: f["t"] for f in frases}
    for fid, dt, sonido, gdb in cfg["efectos"]:
        mz.poner(max(0.0, inicio[fid] + dt), leer(SFX / sonido), 10 ** (gdb / 20))
    mz.masterizar(RAIZ / f"public/glowup/dia{n}/mezcla.wav")

    (RAIZ / f"src/glowup/dia{n}.json").write_text(json.dumps({"duracion": dur, "frases": frases, "palabras": palabras}, ensure_ascii=False, indent=1))
    print(f"Día {n}: {dur} s, {len(frases)} frases, {len(palabras)} palabras → src/glowup/dia{n}.json")


if __name__ == "__main__":
    main()
