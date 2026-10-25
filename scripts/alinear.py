"""Alineación forzada palabra por palabra sobre la transcripción de Whisper.

Whisper acierta el texto pero sus tiempos por palabra pueden desviarse 0,3–0,4 s. Este script
vuelve a ubicar cada palabra en el audio con un modelo CTC de español
(jonatasgrosman/wav2vec2-large-xlsr-53-spanish, Apache-2.0, en /home/user/tts/modelos/w2v-es)
y `torchaudio.functional.forced_align`, por bloques separados por pausas.

Entorno: /home/user/tts/venv (torch + torchaudio 2.7 + transformers).

Uso:
    /home/user/tts/venv/bin/python scripts/alinear.py audio16k.wav palabras.json salida.json
"""

import json
import os
import re
import subprocess
import sys
import unicodedata

os.environ.setdefault("HF_HUB_OFFLINE", "1")

import numpy as np  # noqa: E402
import torch  # noqa: E402
import torchaudio.functional as AF  # noqa: E402
from transformers import Wav2Vec2ForCTC  # noqa: E402

SR = 16000
MODELO = "/home/user/tts/modelos/w2v-es"

UNI = "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciseis diecisiete dieciocho diecinueve".split()
DEC = "_ _ veinte treinta cuarenta cincuenta sesenta setenta ochenta noventa".split()
CEN = "_ ciento doscientos trescientos cuatrocientos quinientos seiscientos setecientos ochocientos novecientos".split()


def numero(n):
    """Número entero a palabras (lo justo para cifras habladas en los reels)."""
    if n < 20:
        return UNI[n]
    if n < 30:
        return "veinte" if n == 20 else "veinti" + UNI[n - 20]
    if n < 100:
        d, u = divmod(n, 10)
        return DEC[d] + ("" if u == 0 else " y " + UNI[u])
    if n < 1000:
        c, r = divmod(n, 100)
        if n == 100:
            return "cien"
        return CEN[c] + ("" if r == 0 else " " + numero(r))
    if n < 1_000_000:
        m, r = divmod(n, 1000)
        return ("mil" if m == 1 else numero(m) + " mil") + ("" if r == 0 else " " + numero(r))
    return "millones"


def a_texto(p, vocab):
    p = p.lower().replace("%", " por ciento")
    p = re.sub(r"\d[\d.]*", lambda m: " " + numero(int(m.group(0).replace(".", ""))) + " ", p)
    p = unicodedata.normalize("NFC", p)
    p = "".join(c if (c in vocab and c not in "|-") or c == " " else " " for c in p)
    return [w for w in p.split() if w]


def main():
    audio_ruta, entrada, salida = sys.argv[1:4]
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", audio_ruta, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(crudo, dtype=np.float32).copy()
    palabras = json.loads(open(entrada, encoding="utf-8").read())["palabras"]
    vocab = json.load(open(f"{MODELO}/vocab.json", encoding="utf-8"))
    modelo = Wav2Vec2ForCTC.from_pretrained(MODELO).eval()
    bloques, actual = [], [0]
    for i in range(1, len(palabras)):
        if palabras[i]["ini"] - palabras[i - 1]["fin"] > 0.6 or len(actual) > 35:
            bloques.append(actual)
            actual = []
        actual.append(i)
    bloques.append(actual)
    nuevas = [dict(w, whisper=[w["ini"], w["fin"]]) for w in palabras]
    for b in bloques:
        a0 = max(0.0, palabras[b[0]]["ini"] - 0.5)
        a1 = min(len(x) / SR, palabras[b[-1]]["fin"] + 0.5)
        tramo = x[int(a0 * SR) : int(a1 * SR)]
        tramo = (tramo - tramo.mean()) / (tramo.std() + 1e-7)
        with torch.inference_mode():
            logits = modelo(torch.from_numpy(tramo).unsqueeze(0)).logits
        emision = torch.log_softmax(logits, dim=-1)
        # Objetivo: letras de cada palabra separadas por "|"; se recuerda a qué palabra va cada letra.
        ids, duena = [], []
        for k, i in enumerate(b):
            for w in a_texto(palabras[i]["p"], vocab) or ["e"]:
                if ids:
                    ids.append(vocab["|"])
                    duena.append(-1)
                for c in w:
                    ids.append(vocab[c])
                    duena.append(k)
        alineado, puntos = AF.forced_align(emision, torch.tensor([ids], dtype=torch.int32), blank=0)
        spans = AF.merge_tokens(alineado[0], puntos[0].exp())
        paso = len(tramo) / emision.shape[1] / SR
        ini, fin = {}, {}
        for sp, d in zip(spans, duena):
            if d < 0:
                continue
            ini.setdefault(d, sp.start)
            fin[d] = sp.end
        for k, i in enumerate(b):
            if k in ini:
                nuevas[i]["ini"] = round(a0 + ini[k] * paso, 3)
                nuevas[i]["fin"] = round(a0 + fin[k] * paso, 3)
    json.dump({"palabras": nuevas}, open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    d = [abs(n["ini"] - n["whisper"][0]) for n in nuevas]
    print(f"{len(nuevas)} palabras alineadas; desvío frente a Whisper: medio {np.mean(d):.2f} s, máx {np.max(d):.2f} s")


if __name__ == "__main__":
    main()
