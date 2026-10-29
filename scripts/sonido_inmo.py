"""Mezcla de los reels inmobiliarios: voz montada + efectos en las transiciones y apariciones.

Los momentos salen de las palabras del corte (src/inmobiliaria/<reel>-<version>.json), igual que
en Remotion. Música de fondo (si el reel tiene pista en MUSICA) limpiada, nivelada y bajada
debajo de la voz (ducking según las palabras). Total −14 LUFS.

Uso:
    python3 scripts/sonido_inmo.py g6 prueba
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sintesis import SR, Mezcla  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
SFX = RAIZ / "public/tubodega/audio/sfx"


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float)


def db(x):
    return 10 ** (x / 20)


# Pista de fondo por reel: (archivo en public/tiktok/musica, segundo de inicio).
# g8 sin música: el cliente la pone en CapCut (antes: {"g8": ("thank-you-loop.mp3", 0.0)}).
MUSICA = {}


def leer_musica(ruta, desde, dur):
    """Estéreo, sin graves de rumble ni agudos ásperos, picos domados (la pista viene saturada)."""
    filtro = "highpass=f=35,lowpass=f=14000,volume=-6dB,alimiter=limit=0.6:attack=5:release=80:level=false"
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(desde), "-stream_loop", "-1", "-i", str(ruta), "-t", str(dur),
         "-af", filtro, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(crudo, dtype=np.float32).astype(float).reshape(-1, 2).T


def rms(x):
    return float(np.sqrt(np.mean(x**2))) if x.size else 0.0


def poner_musica(mz, voz, pal, archivo, desde):
    """Música debajo de la voz: unos −18 dB bajo la voz mientras habla, −9 dB en los huecos."""
    m = leer_musica(RAIZ / "public/tiktok/musica" / archivo, desde, mz.dur)
    m = m[:, : mz.n]
    habla = np.zeros(mz.n)
    for w in pal:
        habla[int(max(0, w["ini"] - 0.06) * SR) : int((w["fin"] + 0.12) * SR)] = 1
    nivel_voz = rms(voz[habla[: len(voz)] > 0])
    objetivo = np.where(habla > 0, db(-13), db(-8)) * nivel_voz / max(rms(m), 1e-9)
    k = int(0.15 * SR)
    objetivo = np.convolve(objetivo, np.ones(k) / k, mode="same")[: m.shape[1]]
    t = np.arange(m.shape[1]) / SR
    objetivo *= np.clip(t / 0.6, 0, 1) * np.clip((mz.dur - t) / 1.2, 0, 1)
    mz.bus[:, : m.shape[1]] += m * objetivo


def main():
    reel, version = sys.argv[1], sys.argv[2]
    g = json.loads((RAIZ / f"src/inmobiliaria/{reel}-{version}.json").read_text())
    pal = g["palabras"]

    def limpio(w):
        return re.sub(r"[¿?¡!.,:;…]", "", w).lower()

    def tras(texto, desde=0.0):
        for w in pal:
            if w["ini"] >= desde - 0.01 and limpio(w["p"]) == limpio(texto):
                return w["ini"]
        raise SystemExit(f"No encontré {texto} después de {desde}")

    if reel == "g6":
        # Los mismos momentos que usa src/inmobiliaria/Reel6.tsx.
        uno = tras("Uno,")
        ef = [
            (uno - 0.26, "whoosh", -14),
            (tras("tour", uno), "pop", -16),
            (tras("electricidad,", uno) - 0.05, "pop", -16),
            (tras("fontanería,", uno) - 0.05, "pop", -16),
            (tras("humedades.", uno) - 0.05, "pop", -16),
            (tras("lo", tras("firmar,", uno)) - 0.03, "golpe", -16),
            (tras("bajar", uno) - 0.05, "pop", -15),
        ]
        if version == "hook1":
            ef += [(tras("sin") - 0.02, "pop", -14), (tras("99"), "golpe", -15), (tras("12"), "pop", -15), (tras("200"), "pop", -15)]
        else:
            ef += [(tras("vas") - 0.02, "pop", -14)]
        if version != "prueba":
            dos = tras("2.", uno)
            tres = tras("tres", tras("hunde.", dos))
            detalle = tras("detalle", tras("tuyo", tres))
            ef += [
                (dos - 0.22, "whoosh", -15),
                (tras("único", dos), "pop", -16),
                (tras("media", dos), "pop", -16),
                (tras("mañana", dos) - 0.05, "pop", -16),
                (tras("noche.", dos) - 0.05, "pop", -16),
                (tras("ayuntamiento", dos) - 0.05, "pop", -16),
                (tras("centro", dos) - 0.05, "pop", -16),
                (tras("carretera", dos) - 0.05, "pop", -16),
                (tres - 0.22, "whoosh", -15),
                (tras("actas", tres), "pop", -16),
                (tras("aprobó", tres) + 0.12, "golpe", -14),
                (tras("últimos", tres) - 0.15, "pop", -17),
                (tras("derrama", tres), "golpe", -15),
                *[(detalle - 0.3 + i * 0.18, "tap", -17) for i in range(3)],
                (tras("Si", detalle) - 0.3, "whoosh", -15),
                (tras("comenta", detalle) - 0.1, "pop", -15),
                (tras("guía", detalle), "teclas", -14),
            ]

    elif reel == "g3":
        # Los mismos momentos que usa src/inmobiliaria/Reel3.tsx.
        uno = tras("Primero,")
        dos, tres = tras("Segundo,", uno), tras("Tercero,", uno)
        cuatro, cinco = tras("Cuarto,", tres), tras("quinto,", tres)
        mucho = tras("muchísimo", cinco)
        cta = tras("Si", tras("dinero", mucho))
        ef = [
            (tras("5") - 0.05, "pop", -15),
            (uno - 0.26, "whoosh", -14),
            (tras("nota", uno), "pop", -16),
            (tras("cargas,", uno) - 0.05, "pop", -16),
            (tras("embargos", uno) - 0.05, "pop", -16),
            (tras("hipotecas.", uno) - 0.05, "pop", -16),
            (tras("referencia", dos), "pop", -16),
            (tras("recibo", dos) - 0.05, "pop", -17),
            (tres - 0.22, "whoosh", -15),
            (tras("cédula", tres), "pop", -16),
            (tras("certificado", tres) - 0.05, "pop", -17),
            (tras("certificado", cuatro), "pop", -16),
            (tras("deudas", cuatro) + 0.2, "golpe", -16),
            (tras("quinto,", cuatro) - 0.3, "whoosh", -15),
            (tras("inspección", cinco), "pop", -16),
            (tras("resultado,", cinco) + 0.1, "golpe", -15),
            (tras("basta", cinco), "golpe", -16),
            *[(tras("condiciones.", cinco) - 0.4 + i * 0.18, "tap", -17) for i in range(5)],
            (tras("demanda", cinco) - 0.05, "pop", -16),
            (tras("inquilinos", cinco) - 0.05, "pop", -16),
            (mucho, "golpe", -15),
            (cta - 0.3, "whoosh", -15),
            (tras("comenta", mucho) - 0.1, "pop", -15),
            (tras("guía", mucho), "teclas", -14),
        ]
        ef += [(tras("pedir") - 0.02, "pop", -14)] if version == "hook1" else [(tras("sin") - 0.02, "pop", -14)]
    elif reel == "g9":
        # Los mismos momentos que usa src/inmobiliaria/Reel9.tsx (pocos efectos: es una llamada).
        buenos = tras("Buenos")
        abrazo = tras("abrazo", buenos)
        veis = tras("¿veis?", abrazo)
        ef = [
            (max(0.0, buenos - 0.45), "tap", -16),
            (abrazo + 0.7, "beep", -18),
            (abrazo + 0.95, "beep", -18),
            (tras("98", buenos), "pop", -16),
            (tras("550", buenos), "pop", -16),
            (tras("24", buenos), "pop", -16),
            (veis - 0.3, "whoosh", -15),
            (tras("6", veis), "golpe", -16),
            (tras("descartar", veis), "pop", -15),
            (tras("palabra", tras("Tengo", veis)) - 0.4, "pop", -15),
            (tras("guía.", tras("Tengo", veis)), "teclas", -14),
        ]
        if version == "intro":
            ef += [(0.2, "teclas", -16), (buenos - 0.65, "whoosh", -14)]
    elif reel == "g8":
        # Los mismos momentos que usa src/inmobiliaria/Reel8.tsx.
        i_id = tras("Idealista")
        marcas = [i_id]
        for n in ["Milanuncios.", "Pisos.com", "Fotocasa.", "Altamira.", "Sareb."]:
            marcas.append(tras(n, marcas[-1]))
        uno = tras("uno", marcas[-1])
        portal = tras("portal,", uno)
        confianza = tras("confianza.", uno)
        filtro = tras("filtro", confianza)
        primero = tras("primero.", filtro)
        dejame = tras("Déjame", primero)
        ef = [(0.15 + i * 0.07, "tap", -19) for i in range(7)]
        for m_ in marcas:
            ef += [(m_ - 0.05, "pop", -15), (tras("Número", m_) + 0.02, "whoosh", -17), (tras("Número", m_) + 0.35, "tap", -16)]
        ef += [
            (portal - 0.05, "pop", -14),
            (confianza + 0.45, "whoosh", -17),
            (confianza + 0.8, "golpe", -16),
            (filtro - 0.05, "pop", -15),
            (tras("Idealista.", primero) + 0.12, "golpe", -16),
            (tras("Y", primero) - 0.3, "whoosh", -15),
            (dejame - 0.1, "pop", -15),
            (tras("filtro", dejame), "teclas", -14),
        ]
    elif reel == "g10":
        # Los mismos momentos que usa src/inmobiliaria/Reel10.tsx.
        e25 = tras("Con")
        e30 = tras("Con", e25 + 0.5)
        e35 = tras("Con", e30 + 0.5)
        e40 = tras("Con", e35 + 0.5)
        e50 = tras("Y", tras("nombre.", e40))
        valores = [tras("primer", e25), tras("3.", e30), tras("edificio", e35), tras("15", e40), tras("barrio", e50)]
        broma = tras("broma,", e50)
        pero = tras("Pero,", broma)
        meta = tras("meta", pero)
        yo_no = tras("Yo", meta)
        un_piso = tras("Un", yo_no)
        jose = tras("José", un_piso)
        cifra = tras("1.950", jose)
        y_es_que = tras("Y", cifra)
        asi = tras("Así", y_es_que)
        clase = tras("clase", asi)
        ef = [(e25 - 0.1, "whoosh", -18)]
        for e in [e25, e30, e35, e40, e50]:
            ef.append((e - 0.05, "tap", -17))
        for v in valores:
            ef.append((v - 0.05, "pop", -15))
        ef += [
            (broma - 0.05, "golpe", -15),
            (tras("redes,", pero) - 0.05, "pop", -16),
            (tras("9", pero) - 0.05, "pop", -16),
            (tras("final", pero) - 0.05, "pop", -16),
            (tras("tarde", pero) - 0.05, "pop", -16),
            (tras("tranquilo.", pero) - 0.05, "pop", -16),
            (meta + 0.05, "whoosh", -16),
            (meta + 0.3, "golpe", -16),
            (tras("15", yo_no) - 0.05, "pop", -16),
            (tras("trabajar", yo_no) - 0.05, "pop", -16),
            (un_piso - 0.05, "pop", -16),
            (tras("dinero", un_piso) - 0.05, "pop", -16),
            (tras("patrimonio", un_piso) - 0.05, "pop", -16),
            (jose - 0.1, "pop", -15),
            (cifra - 0.05, "chaching", -17),
            (tras("no", y_es_que) - 0.05, "pop", -16),
            (tras("gana", tras("acumula,", y_es_que)) - 0.05, "golpe", -16),
            (asi - 0.3, "whoosh", -15),
            (clase - 0.05, "pop", -16),
            (tras("si", clase) - 0.1, "pop", -15),
            (tras("guía.", asi) - 0.1, "teclas", -14),
        ]
    elif reel == "g12":
        # Los mismos momentos que usa src/inmobiliaria/Reel12.tsx.
        bancos = [tras("Santander")]
        for n in ["Trade", "BBVA,", "Eurocaja", "ING.", "Ibercaja.", "CaixaBank."]:
            bancos.append(tras(n, bancos[-1]))
        uno = tras("¿y", bancos[-1])
        uni = tras("Unicaja,", uno)
        y_es_que = tras("Y", tras("vez.", uni))
        para = tras("Para", y_es_que)
        comenta = tras("Comenta", para)
        ef = [(0.15 + i * 0.06, "tap", -19) for i in range(8)]
        for b in bancos:
            n = tras("número", b)
            ef += [(b - 0.05, "pop", -15), (n + 0.02, "whoosh", -17), (n + 0.35, "tap", -16)]
        ef += [
            (uni - 0.05, "pop", -14),
            (tras("competitivo", uni) + 0.3, "whoosh", -17),
            (tras("competitivo", uni) + 0.65, "golpe", -16),
            (tras("segunda", y_es_que) - 0.05, "golpe", -16),
            (y_es_que - 0.3, "whoosh", -15),
            (tras("calculadora", para) - 0.05, "pop", -15),
            (comenta - 0.1, "pop", -15),
            (tras("calculadora", comenta), "teclas", -14),
        ]
    efectos = ef

    mz = Mezcla(g["duracion"] + 0.25)
    voz = leer(RAIZ / f"public/tiktok/{reel}/voz-{version}.wav")
    voz = voz / np.max(np.abs(voz))
    mz.bus[:, : len(voz)] += voz[: mz.n]
    if reel in MUSICA:
        poner_musica(mz, voz, pal, *MUSICA[reel])
    for t, nombre, gain in efectos:
        x = leer(SFX / f"{nombre}.mp3")
        mz.poner(max(0, t), x / np.max(np.abs(x)), db(gain))
    mz.masterizar(str(RAIZ / f"public/tiktok/{reel}/mezcla-{version}.wav"), -14.0, fundido=0.05)


if __name__ == "__main__":
    main()
