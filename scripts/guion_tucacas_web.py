"""Genera los guiones del comercial web de Tucacas (src/tucacas/web/guion-web-*.json).

Todo se ancla a la voz (voz-<v>.json, tiempos por frase de ElevenLabs) y los cortes
caen en el pulso de la música (pulso.json). Los mismos JSON los leen Remotion
(visuales) y scripts/sonido_tucacas.py (mezcla).

Uso:
    python3 scripts/guion_tucacas_web.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
WEB = RAIZ / "src/tucacas/web"

# Puntos de la pantalla del teléfono (coordenadas de 1080 × 1920).
ENLACE = (470, 742)  # enlace de la bio en el perfil
NAV = 150  # alto de la barra del navegador
DIA_18 = (930, 906 + NAV)
DIA_20 = (279, 1047 + NAV)
MAS = (926, 1480 + NAV)
LEYENDA = (540, 1302 + NAV)
BOTON = (540, 1700)
ENVIAR = (991, 1795)
CENTRO = (540, 960)


def cargar(version):
    voz = json.loads((WEB / f"voz-{version}.json").read_text())
    loc = json.loads((WEB / f"locucion-{version}.json").read_text())
    pulso = json.loads((WEB / "pulso.json").read_text())[version]
    frases = [
        {"desde": l["t"], "hasta": l["fin"], "texto": l["texto"], "clave": f["clave"]}
        for l, f in zip(voz["lineas"], loc["frases"])
    ]
    return frases, pulso


def utilidades(frases, pulso):
    def b(x):
        """Lleva un tiempo al pulso más cercano de la música."""
        k = round((x - pulso["fase"]) / pulso["pulso"])
        return round(pulso["fase"] + k * pulso["pulso"], 3)

    def palabra(i, texto):
        """Estima cuándo se dice `texto` dentro de la frase i (proporción de caracteres)."""
        f = frases[i]
        pos = f["texto"].find(texto)
        assert pos >= 0, (i, texto)
        return round(f["desde"] + (f["hasta"] - f["desde"]) * pos / len(f["texto"]), 3)

    return b, palabra


def cam(t, escala=1.0, punto=CENTRO, giro=0):
    return {"t": round(t, 3), "escala": escala, "x": punto[0], "y": punto[1], "giro": giro}


def guion_60():
    frases, pulso = cargar("60s")
    b, palabra = utilidades(frases, pulso)
    fr = lambda i: frases[i]  # noqa: E731

    # Cortes (en el pulso).
    c_aereo, c_ventana, c_tel = b(1.71), b(2.78), b(4.38)
    tq_enlace = palabra(1, "el enlace") + 0.25
    t_nav = round(tq_enlace + 0.3, 3)
    t_cuando = b(10.26)
    t_cal = b(fr(3)["desde"] - 0.1)
    t_galeria = b(fr(4)["desde"] - 0.2)
    c_sala, c_cuarto, c_tv, c_conjunto = b(19.87), b(20.94), b(22.0), b(23.07)
    c_aire = b(fr(5)["desde"] - 0.3)
    c_wifi = b(palabra(5, "WiFi") - 0.3)
    c_tres = b(palabra(5, "tanque") - 0.35)
    c_muelles = b(fr(6)["desde"] - 0.35)
    c_piscina = b(palabra(6, "y con piscina"))
    c_reserva = b(fr(7)["desde"] - 0.1)
    tq_boton = palabra(7, "WhatsApp") + 0.35
    t_chat = round(tq_boton + 0.35, 3)
    t_envio = round(palabra(7, "con tus fechas") + 0.5, 3)
    c_pagos = b(fr(8)["desde"] - 0.15)
    c_confirma = b(palabra(8, "todo lo confirmas") - 0.1)
    c_noche = b(fr(9)["desde"] - 0.25)
    c_churuata = b(palabra(9, "la churuata") - 0.3)
    c_cierre = b(fr(10)["desde"] + 0.2)

    planos = [
        {"tipo": "video", "desde": 0, "hasta": c_aereo, "archivo": "recorrido.mp4", "inicio": 0.2, "zoom": [1.18, 1.06], "entrada": "nada"},
        {"tipo": "video", "desde": c_aereo, "hasta": c_ventana, "archivo": "aereo.mp4", "inicio": 0.6, "zoom": [1.0, 1.08], "entrada": "flash"},
        {"tipo": "video", "desde": c_ventana, "hasta": c_tel, "archivo": "habitacion-ventana.mp4", "inicio": 1.4, "zoom": [1.1, 1.0]},
        {
            "tipo": "telefono",
            "desde": c_tel,
            "hasta": t_galeria,
            "entrada": "whip",
            "fondo": {"tipo": "video", "archivo": "aereo.mp4", "inicio": 2.0},
            "escenas": [
                {"t": c_tel, "tipo": "perfil", "toque": round(tq_enlace, 3)},
                {
                    "t": t_nav,
                    "tipo": "navegador",
                    "sube": True,
                    "vistas": [
                        {"t": t_nav, "archivo": "01-inicio-recorrido.mp4", "inicio": 0},
                        {"t": t_cuando, "archivo": "01-inicio-recorrido.mp4", "inicio": 4.2},
                        {
                            "t": t_cal,
                            "imagen": "calendario.png",
                            "toques": [
                                {"t": round(palabra(3, "tus fechas") + 0.15, 3), "x": DIA_18[0], "y": DIA_18[1] - NAV},
                                {"t": round(palabra(3, "tus fechas") + 0.75, 3), "x": DIA_20[0], "y": DIA_20[1] - NAV},
                            ],
                        },
                    ],
                },
            ],
            "camara": [
                cam(c_tel, 1.0, CENTRO, 0),
                cam(tq_enlace - 0.9, 1.0),
                cam(tq_enlace - 0.35, 1.7, ENLACE, -2),
                cam(t_nav + 0.1, 1.7, ENLACE, -2),
                cam(t_nav + 0.7, 1.05),
                cam(t_cal, 1.12, (540, 900)),
                cam(palabra(3, "tus fechas") - 0.1, 1.45, ((DIA_18[0] + DIA_20[0]) // 2, (DIA_18[1] + DIA_20[1]) // 2)),
                cam(palabra(3, "personas") - 0.3, 1.45, ((DIA_18[0] + DIA_20[0]) // 2, (DIA_18[1] + DIA_20[1]) // 2)),
                cam(palabra(3, "personas"), 1.3, (640, 1350)),
                cam(palabra(3, "qué está libre") - 0.4, 1.3, (640, 1350)),
                cam(palabra(3, "qué está libre"), 1.3, (540, 1100)),
                cam(t_galeria, 1.2, (540, 1000)),
            ],
        },
        {
            "tipo": "telefono",
            "desde": t_galeria,
            "hasta": c_sala,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [
                {"t": t_galeria, "tipo": "navegador", "vistas": [{"t": t_galeria, "archivo": "02-apartamento-n30.mp4", "inicio": 12.2}]},
            ],
            "camara": [cam(t_galeria, 1.0, CENTRO, 3), cam(c_sala, 1.25, (540, 900), 0)],
        },
        {"tipo": "foto", "desde": c_sala, "hasta": c_cuarto, "encuadre": {"foto": "fotos-nuevas/sala.jpg", "foco": "50% 55%", "zoom": 1.08}, "entrada": "flash"},
        {"tipo": "video", "desde": c_cuarto, "hasta": c_tv, "archivo": "habitacion-ventana.mp4", "inicio": 5.6, "zoom": [1.0, 1.06]},
        {"tipo": "foto", "desde": c_tv, "hasta": c_conjunto, "encuadre": {"foto": "fotos-nuevas/sala-tv.jpg", "foco": "50% 50%", "zoom": 1.08}},
        {"tipo": "video", "desde": c_conjunto, "hasta": c_aire, "archivo": "recorrido.mp4", "inicio": 45.0, "zoom": [1.0, 1.05]},
        {
            "tipo": "iconos",
            "desde": c_aire,
            "hasta": c_wifi,
            "entrada": "whip",
            "fondo": {"tipo": "foto", "encuadre": {"foto": "fotos-nuevas/habitacion-aire.jpg", "foco": "50% 30%", "zoom": 1.08}},
            "iconos": [{"tipo": "aire", "texto": "Aire en todos los ambientes", "t": round(fr(5)["desde"] + 0.1, 3)}],
        },
        {
            "tipo": "iconos",
            "desde": c_wifi,
            "hasta": c_tres,
            "fondo": {"tipo": "foto", "encuadre": {"foto": "fotos-nuevas/sala-tv.jpg", "foco": "50% 40%", "zoom": 1.08, "escala": 1.1}},
            "iconos": [{"tipo": "wifi", "texto": "WiFi de fibra óptica", "t": round(palabra(5, "WiFi"), 3)}],
        },
        {
            "tipo": "iconos",
            "desde": c_tres,
            "hasta": c_muelles,
            "fondo": {"tipo": "marca"},
            "iconos": [
                {"tipo": "aire", "texto": "Aire", "t": c_tres},
                {"tipo": "wifi", "texto": "WiFi de fibra", "t": round(c_tres + 0.15, 3)},
                {"tipo": "agua", "texto": "Tanque de agua propio", "t": round(palabra(5, "tanque"), 3)},
            ],
        },
        {"tipo": "video", "desde": c_muelles, "hasta": c_piscina, "archivo": "aereo.mp4", "inicio": 2.4, "zoom": [1.0, 1.1], "entrada": "whip"},
        {"tipo": "video", "desde": c_piscina, "hasta": c_reserva, "archivo": "recorrido.mp4", "inicio": 2.2, "zoom": [1.12, 1.0], "entrada": "flash"},
        {
            "tipo": "telefono",
            "desde": c_reserva,
            "hasta": c_pagos,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [
                {
                    "t": c_reserva,
                    "tipo": "navegador",
                    "vistas": [{"t": c_reserva, "imagen": "calendario.png", "boton": {"t": round(palabra(7, "Tocas") - 0.1, 3), "toque": round(tq_boton, 3)}}],
                },
                {"t": t_chat, "tipo": "chat", "envio": t_envio},
            ],
            "camara": [
                cam(c_reserva, 1.0),
                cam(tq_boton - 0.8, 1.0),
                cam(tq_boton - 0.25, 1.45, BOTON),
                cam(t_chat + 0.05, 1.45, BOTON),
                cam(t_chat + 0.7, 1.65, (520, 1690)),
                cam(t_envio - 0.3, 1.65, (560, 1690)),
                cam(t_envio + 0.5, 1.3, (540, 1450)),
                cam(c_pagos, 1.0),
            ],
        },
        {"tipo": "video", "desde": c_pagos, "hasta": c_confirma, "archivo": "habitacion-ventana.mp4", "inicio": 0.6, "zoom": [1.0, 1.08], "entrada": "whip"},
        {"tipo": "video", "desde": c_confirma, "hasta": c_noche, "archivo": "recorrido.mp4", "inicio": 46.5, "zoom": [1.0, 1.06]},
        {
            "tipo": "telefono",
            "desde": c_noche,
            "hasta": c_churuata,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [{"t": c_noche, "tipo": "navegador", "vistas": [{"t": c_noche, "archivo": "03-modo-dia-noche.mp4", "inicio": 3.0}]}],
            "camara": [cam(c_noche, 1.0, CENTRO, -2), cam(c_churuata, 1.08, CENTRO, 0)],
        },
        {"tipo": "video", "desde": c_churuata, "hasta": c_cierre, "archivo": "churuata-noche.mp4", "inicio": 0.4, "zoom": [1.0, 1.08], "entrada": "flash"},
        {"tipo": "cierre", "desde": c_cierre, "hasta": 60.0, "icono": True, "entrada": "whip"},
    ]

    textos = [
        {"desde": 0.1, "hasta": c_aereo, "estilo": "grande", "lineas": ["¿Vienes a", "Tucacas?"], "ts": [0.12, b(0.64)], "acento": [1]},
        {"desde": c_ventana, "hasta": c_tel, "estilo": "grande", "lineas": ["Reservar", "es más fácil"], "ts": [c_ventana, palabra(0, "mucho")], "acento": [1]},
        {"desde": round(fr(1)["desde"], 3), "hasta": round(tq_enlace + 0.2, 3), "estilo": "pastilla", "lineas": ["Toca el enlace"], "y": 170, "acento": [0]},
        {"desde": round(palabra(2, "nuestra página"), 3), "hasta": t_cuando, "estilo": "pastilla", "lineas": ["Nuestra página nueva", "tudiaentucacas.netlify.app"], "y": 150, "acento": [0]},
        {"desde": round(palabra(3, "qué está libre"), 3), "hasta": t_galeria, "estilo": "pastilla", "lineas": ["Libre", "Ocupado"], "y": 170, "acento": [0]},
        {"desde": t_galeria + 0.2, "hasta": c_sala, "estilo": "pastilla", "lineas": ["Apartamento N°30"], "y": 170, "acento": [0]},
        {"desde": round(palabra(4, "las fotos"), 3), "hasta": c_aire, "estilo": "pastilla", "lineas": ["Las fotos", "Lo que incluye", "Dónde queda"], "ts": [palabra(4, "las fotos"), palabra(4, "lo que incluye"), palabra(4, "dónde queda")], "y": 300},
        {"desde": c_muelles, "hasta": c_piscina, "estilo": "grande", "lineas": ["5 min", "de los muelles"], "ts": [fr(6)["desde"], palabra(6, "de los muelles")], "acento": [0]},
        {"desde": c_piscina, "hasta": c_reserva, "estilo": "pastilla", "lineas": ["Piscina con tobogán"], "y": 300, "acento": [0]},
        {"desde": round(palabra(7, "Tocas") - 0.1, 3), "hasta": round(tq_boton, 3), "estilo": "pastilla", "lineas": ["Reservar por WhatsApp"], "y": 170, "acento": [0]},
        {"desde": round(palabra(7, "el mensaje"), 3), "hasta": c_pagos, "estilo": "pastilla", "lineas": ["Sale listo con tus fechas"], "y": 170, "acento": [0]},
        {"desde": c_pagos, "hasta": c_confirma, "estilo": "grande", "lineas": ["En la página", "no se cobra nada"], "ts": [c_pagos, palabra(8, "no se cobra")], "acento": [1]},
        {"desde": c_confirma, "hasta": c_noche, "estilo": "pastilla", "lineas": ["Confirmas por WhatsApp", "Rápido y en confianza"], "ts": [c_confirma, palabra(8, "rápido")], "y": 300, "acento": [1]},
        {"desde": c_churuata, "hasta": c_cierre, "estilo": "grande", "lineas": ["La churuata", "te espera"], "ts": [c_churuata, round(c_churuata + 0.5, 3)], "acento": [0]},
    ]

    efectos = [
        {"t": 0.0, "sonido": "olas", "gain": 0.7},
        {"t": 0.3, "sonido": "chapuzon", "gain": 0.5},
        {"t": c_aereo - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_aereo, "sonido": "gaviotas", "gain": 0.6, "pan": 0.3},
        {"t": c_tel - 0.25, "sonido": "whoosh", "gain": 0.9},
        {"t": tq_enlace, "sonido": "clic"},
        {"t": t_nav, "sonido": "whoosh", "gain": 0.5},
        *[{"t": tq["t"], "sonido": "clic", "gain": 0.8} for tq in [
            {"t": round(palabra(3, "tus fechas") + 0.15, 3)},
            {"t": round(palabra(3, "tus fechas") + 0.75, 3)},
        ]],
        {"t": t_galeria - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_sala, "sonido": "llave", "gain": 0.6},
        {"t": c_aire - 0.2, "sonido": "whoosh", "gain": 0.6},
        {"t": fr(5)["desde"], "sonido": "control", "gain": 0.8},
        {"t": c_muelles - 0.2, "sonido": "whoosh", "gain": 0.6},
        {"t": c_muelles, "sonido": "lancha", "gain": 0.5, "pan": -0.3},
        {"t": c_piscina, "sonido": "chapuzon", "gain": 0.8},
        {"t": c_reserva - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": tq_boton, "sonido": "clic"},
        {"t": t_chat, "sonido": "whoosh", "gain": 0.4},
        {"t": t_envio, "sonido": "mensaje", "gain": 1.2},
        {"t": c_pagos - 0.2, "sonido": "whoosh", "gain": 0.6},
        {"t": c_confirma, "sonido": "brisa", "gain": 0.6},
        {"t": c_noche - 0.2, "sonido": "whoosh", "gain": 0.6},
        {"t": c_churuata - 0.4, "sonido": "grillos", "gain": 1.0},
        {"t": c_cierre - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_cierre + 0.5, "sonido": "olas", "gain": 0.8},
        {"t": c_cierre + 1.0, "sonido": "brisa", "gain": 0.5},
    ]
    return {
        "id": "web-60s",
        "duracion": 60.0,
        "planos": planos,
        "textos": textos,
        "frases": frases,
        "efectos": efectos,
        "noche": [round(c_noche + 0.6, 3), c_cierre],
    }


def guion_30():
    frases, pulso = cargar("30s")
    b, palabra = utilidades(frases, pulso)
    fr = lambda i: frases[i]  # noqa: E731

    c_aereo, c_ventana, c_tel = b(1.63), b(2.70), b(3.77)
    tq_enlace = palabra(1, "el enlace") + 0.2
    t_nav = round(tq_enlace + 0.3, 3)
    t_cal = b(fr(2)["desde"] + 0.9)
    c_galeria = b(fr(3)["desde"] - 0.15)
    c_sala, c_cuarto = b(11.78), b(12.85)
    c_iconos = b(fr(4)["desde"] + 0.1)
    c_reserva = b(fr(5)["desde"] - 0.25)
    tq_boton = palabra(5, "WhatsApp") + 0.3
    t_chat = round(tq_boton + 0.35, 3)
    t_envio = round(palabra(5, "con tus fechas") + 0.45, 3)
    c_cierre = b(fr(6)["desde"])

    t18 = round(palabra(2, "tus fechas") + 0.1, 3)
    t20 = round(t18 + 0.55, 3)
    planos = [
        {"tipo": "video", "desde": 0, "hasta": c_aereo, "archivo": "recorrido.mp4", "inicio": 0.2, "zoom": [1.18, 1.06], "entrada": "nada"},
        {"tipo": "video", "desde": c_aereo, "hasta": c_ventana, "archivo": "aereo.mp4", "inicio": 0.6, "zoom": [1.0, 1.08], "entrada": "flash"},
        {"tipo": "video", "desde": c_ventana, "hasta": c_tel, "archivo": "habitacion-ventana.mp4", "inicio": 1.4, "zoom": [1.1, 1.0]},
        {
            "tipo": "telefono",
            "desde": c_tel,
            "hasta": c_galeria,
            "entrada": "whip",
            "fondo": {"tipo": "video", "archivo": "aereo.mp4", "inicio": 2.0},
            "escenas": [
                {"t": c_tel, "tipo": "perfil", "toque": round(tq_enlace, 3)},
                {
                    "t": t_nav,
                    "tipo": "navegador",
                    "sube": True,
                    "vistas": [
                        {"t": t_nav, "archivo": "01-inicio-recorrido.mp4", "inicio": 0},
                        {"t": t_cal, "imagen": "calendario.png", "toques": [{"t": t18, "x": DIA_18[0], "y": DIA_18[1] - NAV}, {"t": t20, "x": DIA_20[0], "y": DIA_20[1] - NAV}]},
                    ],
                },
            ],
            "camara": [
                cam(c_tel, 1.0),
                cam(tq_enlace - 0.75, 1.0),
                cam(tq_enlace - 0.3, 1.7, ENLACE, -2),
                cam(t_nav + 0.1, 1.7, ENLACE, -2),
                cam(t_nav + 0.6, 1.05),
                cam(t_cal, 1.1, (540, 900)),
                cam(t18 - 0.3, 1.45, ((DIA_18[0] + DIA_20[0]) // 2, (DIA_18[1] + DIA_20[1]) // 2)),
                cam(t20 + 0.4, 1.45, ((DIA_18[0] + DIA_20[0]) // 2, (DIA_18[1] + DIA_20[1]) // 2)),
                cam(palabra(2, "qué está libre"), 1.3, LEYENDA),
                cam(c_galeria, 1.2, LEYENDA),
            ],
        },
        {
            "tipo": "telefono",
            "desde": c_galeria,
            "hasta": c_sala,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [{"t": c_galeria, "tipo": "navegador", "vistas": [{"t": c_galeria, "archivo": "02-apartamento-n30.mp4", "inicio": 12.2}]}],
            "camara": [cam(c_galeria, 1.0, CENTRO, 3), cam(c_sala, 1.25, (540, 900), 0)],
        },
        {"tipo": "foto", "desde": c_sala, "hasta": c_cuarto, "encuadre": {"foto": "fotos-nuevas/sala.jpg", "foco": "50% 55%", "zoom": 1.08}, "entrada": "flash"},
        {"tipo": "video", "desde": c_cuarto, "hasta": c_iconos, "archivo": "habitacion-ventana.mp4", "inicio": 5.6, "zoom": [1.0, 1.06]},
        {
            "tipo": "iconos",
            "desde": c_iconos,
            "hasta": c_reserva,
            "entrada": "whip",
            "fondo": {"tipo": "foto", "encuadre": {"foto": "fotos-nuevas/habitacion-aire.jpg", "foco": "50% 30%", "zoom": 1.08}},
            "iconos": [
                {"tipo": "aire", "texto": "Aire", "t": round(fr(4)["desde"] + 0.05, 3)},
                {"tipo": "wifi", "texto": "WiFi de fibra", "t": round(palabra(4, "WiFi"), 3)},
                {"tipo": "agua", "texto": "Tanque de agua propio", "t": round(palabra(4, "tanque"), 3)},
            ],
        },
        {
            "tipo": "telefono",
            "desde": c_reserva,
            "hasta": c_cierre,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [
                {"t": c_reserva, "tipo": "navegador", "vistas": [{"t": c_reserva, "imagen": "calendario.png", "boton": {"t": round(c_reserva + 0.3, 3), "toque": round(tq_boton, 3)}}]},
                {"t": t_chat, "tipo": "chat", "envio": t_envio},
            ],
            "camara": [
                cam(c_reserva, 1.0),
                cam(tq_boton - 0.8, 1.0),
                cam(tq_boton - 0.25, 1.45, BOTON),
                cam(t_chat + 0.05, 1.45, BOTON),
                cam(t_chat + 0.7, 1.65, (520, 1690)),
                cam(t_envio - 0.3, 1.65, (560, 1690)),
                cam(t_envio + 0.5, 1.3, (540, 1450)),
                cam(c_cierre, 1.0),
            ],
        },
        {"tipo": "cierre", "desde": c_cierre, "hasta": 30.0, "icono": True, "entrada": "whip"},
    ]
    textos = [
        {"desde": 0.1, "hasta": c_aereo, "estilo": "grande", "lineas": ["¿Vienes a", "Tucacas?"], "ts": [0.3, b(0.9)], "acento": [1]},
        {"desde": c_ventana, "hasta": c_tel, "estilo": "grande", "lineas": ["Reservas en", "un toque"], "ts": [c_ventana, palabra(0, "un toque")], "acento": [1]},
        {"desde": round(fr(1)["desde"], 3), "hasta": round(tq_enlace + 0.2, 3), "estilo": "pastilla", "lineas": ["Toca el enlace"], "y": 170, "acento": [0]},
        {"desde": round(t_nav + 0.4, 3), "hasta": t_cal, "estilo": "pastilla", "lineas": ["tudiaentucacas.netlify.app"], "y": 150},
        {"desde": round(palabra(2, "qué está libre"), 3), "hasta": c_galeria, "estilo": "pastilla", "lineas": ["Libre", "Ocupado"], "y": 170, "acento": [0]},
        {"desde": c_galeria + 0.2, "hasta": c_sala, "estilo": "pastilla", "lineas": ["Apartamento N°30"], "y": 170, "acento": [0]},
        {"desde": round(c_reserva + 0.2, 3), "hasta": round(tq_boton, 3), "estilo": "pastilla", "lineas": ["Reservar por WhatsApp"], "y": 170, "acento": [0]},
        {"desde": round(palabra(5, "el mensaje"), 3), "hasta": c_cierre, "estilo": "pastilla", "lineas": ["Sale listo con tus fechas"], "y": 170, "acento": [0]},
    ]
    efectos = [
        {"t": 0.0, "sonido": "olas", "gain": 0.7},
        {"t": 0.3, "sonido": "chapuzon", "gain": 0.5},
        {"t": c_aereo - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_aereo, "sonido": "gaviotas", "gain": 0.6, "pan": 0.3},
        {"t": c_tel - 0.25, "sonido": "whoosh", "gain": 0.9},
        {"t": tq_enlace, "sonido": "clic"},
        {"t": t_nav, "sonido": "whoosh", "gain": 0.5},
        {"t": t18, "sonido": "clic", "gain": 0.8},
        {"t": t20, "sonido": "clic", "gain": 0.8},
        {"t": c_galeria - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_sala, "sonido": "llave", "gain": 0.6},
        {"t": c_iconos - 0.2, "sonido": "whoosh", "gain": 0.6},
        {"t": fr(4)["desde"], "sonido": "control", "gain": 0.8},
        {"t": c_reserva - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": tq_boton, "sonido": "clic"},
        {"t": t_chat, "sonido": "whoosh", "gain": 0.4},
        {"t": t_envio, "sonido": "mensaje", "gain": 1.2},
        {"t": c_cierre - 0.2, "sonido": "whoosh", "gain": 0.7},
        {"t": c_cierre + 0.5, "sonido": "olas", "gain": 0.8},
        {"t": c_cierre + 1.0, "sonido": "brisa", "gain": 0.5},
    ]
    return {"id": "web-30s", "duracion": 30.0, "planos": planos, "textos": textos, "frases": frases, "efectos": efectos}


def redondear(x):
    if isinstance(x, float):
        return round(x, 3)
    if isinstance(x, list):
        return [redondear(v) for v in x]
    if isinstance(x, dict):
        return {k: redondear(v) for k, v in x.items()}
    return x


def main():
    for version, g in (("60s", guion_60()), ("30s", guion_30())):
        destino = WEB / f"guion-web-{version}.json"
        destino.write_text(json.dumps(redondear(g), indent=1, ensure_ascii=False) + "\n")
        print(f"{destino.relative_to(RAIZ)}: {len(g['planos'])} planos, {len(g['textos'])} textos, {len(g['efectos'])} efectos")
        for p in g["planos"]:
            print(f"   {p['desde']:6.2f}–{p['hasta']:6.2f}  {p['tipo']:9s} {p.get('archivo', '')}")


if __name__ == "__main__":
    main()
