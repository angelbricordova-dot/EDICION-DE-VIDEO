"""Marryto 179–181 ("Lo que ven los niños vs lo que ven los padres"): pase de fotos con cada cambio
JUSTO en el golpe de la música (corrección de Fernando, 24-nov).

La canción (public/marryto/audio/m179-181.mp3) es el audio del Short, a 116,8 BPM, en compases de 2,055 s:
el bombo y la palmada juntos marcan el inicio de cada compás en 2,14 4,19 6,25 8,30 10,36 12,41 14,47 16,52 s
(luego un corte suave hasta el golpe grande de 19,59). 25-nov: TODOS los cambios en el inicio de un compás
(antes 3 caían a mitad de compás y Fernando lo notó). Cada video: su reacción hasta el primer compás y luego
las 6 fotos, una por compás; la última aguanta el corte y el video acaba justo antes del golpe de 19,59.
En 180 y 181 habla él: su voz de la toma encima y la música más baja mientras habla.
Etiquetas: "Niños:" en azul y "Padres:" en rojo (pedido de Fernando).

Uso: python3 scripts/marryto/ninos_179_181.py   (escribe los mp3 y actualiza src/marryto/videos.json)
"""
import json
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
P = RAIZ / "public/marryto"
MUSICA = P / "audio/m179-181.mp3"
GOLPES = [6.25, 8.30, 10.36, 12.41, 14.47, 16.52]  # inicio de compás, en tiempo de la canción
FIN_MUSICA = 19.55  # justo antes del golpe grande de 19,6 s (el Short se repite en bucle)

N, PA = "Niños:", "Padres:"
AZUL, ROJO = "#3AA0FF", "#FF3B3B"
VIDEOS = {
    # n: (inicio de su toma, segundos de reacción, ¿su voz?, fotos)
    "179": (2.5, 4.20, False, [("f08", N), ("f00", PA), ("f05", N), ("f11", PA), ("f03", N), ("f09", PA)]),
    "180": (10.7, 3.5, True, [(f"o{i}", N if i % 2 == 0 else PA) for i in range(6)]),  # las del Short original
    "181": (18.95, 3.4, True, [("f01", N), ("f10", PA), ("f06", N), ("f07", PA), ("f04", N), ("f02", PA)]),
}
ASP = {"o0": 0.6676, "o1": 0.5648, "o2": 0.8741, "o3": 1.0407, "o4": 0.7519, "o5": 0.7509, "f10": 0.69}


def main():
    d = json.loads((RAIZ / "src/marryto/videos.json").read_text())
    for n, (ini, reac, voz, fotos) in VIDEOS.items():
        off = round(GOLPES[0] - reac, 3)  # la canción va `off` s por delante del video
        dur = round(FIN_MUSICA - off, 2)
        sal = P / f"audio/m{n}-golpes.mp3"
        if voz:
            filtro = (
                f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo,"
                f"volume='if(lt(t,{reac - 0.2}),0.35,if(lt(t,{reac}),0.35+0.65*(t-{reac - 0.2})/0.2,1))':eval=frame[m];"
                f"[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=2.0,afade=t=out:st={reac - 0.05}:d=0.15[v];"
                f"[m][v]amix=inputs=2:normalize=0:duration=first,atrim=0:{dur + 0.5},alimiter=limit=0.89:level=false[o]"
            )
            cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(off), "-i", str(MUSICA),
                   "-ss", str(ini), "-t", str(reac + 0.2), "-i", str(P / f"proxies/v{n}.mp4"),
                   "-filter_complex", filtro, "-map", "[o]"]
        else:
            cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(off), "-i", str(MUSICA), "-t", str(dur + 0.5)]
        subprocess.run(cmd + ["-c:a", "libmp3lame", "-b:a", "192k", str(sal)], check=True)
        v = d[n]
        v.update(inicio=ini, fin=round(ini + reac, 2), duracion=dur, audio="marryto/audio/m179-181.mp3", audioDesde=0)
        v["outro"] = {
            "desde": reac, "dur": round(dur - reac, 2), "audioTodo": f"marryto/audio/m{n}-golpes.mp3",
            "fotos": [{"src": f"marryto/material/ninos/{f}.jpg", "t": round(g - GOLPES[0], 2), "texto": tx,
                       "color": AZUL if tx == N else ROJO,
                       **({"asp": ASP[f]} if f in ASP else {})} for g, (f, tx) in zip(GOLPES, fotos)],
        }
        print(n, "reacción", reac, "s · canción +", off, "s · dura", dur, "s · cambios en",
              [round(reac + g - GOLPES[0], 2) for g in GOLPES])
    (RAIZ / "src/marryto/videos.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
