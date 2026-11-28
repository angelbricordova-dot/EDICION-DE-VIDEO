"""Marryto 209–230: correcciones de Alejandro (28-nov) sobre arranques, finales y duración.

- 209 acaba antes (deja de actuar y va a apagar la cámara); 210 título "MAYO:" y empieza tras su indicación
  ("…voy a poner que nazco en mayo… me voy a poner como triste"), ya actuando de triste.
- 221 empieza tocándose la barbilla y acaba antes de acercarse a la cámara; 222 y 224 empiezan apuntando arriba.
- Duración mínima ~6–7 s (alguna excepción): 223, 224, 228, 229 y 230 más largos.

El audio de cada Short dura lo que el Short (5–6 s) y el Short se repite en bucle. Para que el video dure otra cosa
sin que la música "vuelva a empezar" ni se corte a mitad de frase, se empalma la propia canción consigo misma en el
punto donde suena casi igual (espectro y fase de la onda): y = x[:i] + x[j:], con i − j = duración nueva − original
(repite un trozo si alarga, lo quita si acorta). El final sigue siendo el final del Short, así que el bucle queda
igual que el original. Fundido de 40 ms en el empalme.

    python3 scripts/marryto/correcciones_209_230.py   (escribe public/marryto/audio/mNNN-ext.mp3 y videos.json)
"""
import json
import subprocess
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
P = RAIZ / "public/marryto"
SR = 44100
# n: (audio del Short, inicio en el bruto, fin en el bruto, cambios extra)
CORTES = {
    "209": ("m209-210", 1.8, 7.3, {}),
    "210": ("m209-210", 18.6, 26.5, {"titulo": "MAYO:"}),
    "221": ("m221-222", 0.85, 7.9, {}),
    "222": ("m221-222", 12.4, 20.33, {}),
    "223": ("m223-224", 1.2, 8.9, {}),
    "224": ("m223-224", 12.95, 19.4, {}),
    "228": ("m227-228", 19.5, 26.4, {}),
    "229": ("m229-230", 3.0, 10.0, {}),
    "230": ("m229-230", 16.0, 23.0, {}),
}


def leer(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def espectro(x, hop=441, n=2048):
    m = x.mean(1)
    fr = np.lib.stride_tricks.sliding_window_view(np.pad(m, (n // 2, n // 2)), n)[::hop] * np.hanning(n)
    S = np.log1p(np.abs(np.fft.rfft(fr, axis=1))[:, :400])
    return S / (np.linalg.norm(S, axis=1, keepdims=True) + 1e-9)


def empalmar(x, dur):
    """x[:i] + x[j:] con i − j ≈ dur − len(x): el punto (i, j) donde la canción suena más parecida ±0,4 s alrededor
    (así el empalme cae a compás). La duración puede moverse entre −0,3 y +0,1 s para encontrar ese punto."""
    N = len(x)
    S = espectro(x)
    hop = 441
    margen, win = int(0.45 * SR), 40  # ±400 ms de contexto espectral
    mejor = None
    base = int(round(dur * SR)) - N
    for dE in range(-30, 11):
        E = base + dE * hop
        if abs(E) < hop:
            continue
        for i in range(margen, N - margen, hop):
            j = i - E
            if j < margen or j > N - margen:
                continue
            a, b = i // hop, j // hop
            if a + win >= len(S) or b + win >= len(S):
                continue
            c = 1 - (S[a - win:a + win] * S[b - win:b + win]).sum(1).mean()
            if mejor is None or c < mejor[0]:
                mejor = (c, i, j)
    _, i, j = mejor
    E = i - j
    # afinar a la muestra: máxima correlación de la onda en ±10 ms
    w, k = int(0.03 * SR), int(0.01 * SR)
    ref = x[i - w:i].mean(1)
    cs = [(float(np.dot(ref, x[j + d - w:j + d].mean(1))), d) for d in range(-k, k + 1)]
    j += max(cs)[1]
    i = j + E
    f = int(0.04 * SR)
    ramp = np.linspace(0, 1, f)[:, None]
    union = x[i - f:i] * (1 - ramp) + x[j - f:j] * ramp
    y = np.concatenate([x[:i - f], union, x[j:]])
    return y, (round(i / SR, 3), round(j / SR, 3), round(float(mejor[0]), 4))


def main():
    d = json.loads((RAIZ / "src/marryto/videos.json").read_text())
    for n, (pista, ini, fin, extra) in CORTES.items():
        dur = round(fin - ini, 2)
        x = leer(P / f"audio/{pista}.mp3")
        y, info = empalmar(x, dur)
        dur = round(len(y) / SR, 3)
        fin = round(ini + dur, 3)
        sal = P / f"audio/m{n}-ext.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", "192k", str(sal)], input=y.astype(np.float32).tobytes(), check=True)
        v = d[n]
        v.update(inicio=ini, fin=fin, duracion=dur, audio=f"marryto/audio/m{n}-ext.mp3", audioDesde=0, **extra)
        print(n, f"{ini}–{fin} s ({dur} s) · canción {len(x) / SR:.2f} → {len(y) / SR:.2f} s · empalme (i, j, coste) {info}")
    (RAIZ / "src/marryto/videos.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
