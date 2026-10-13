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
BOTON_CAM = (540, 1600)  # la cámara apunta un poco más arriba para que el teléfono quede más centrado
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


# Fotos del apartamento para el collage (las del conjunto van en otros planos).
FOTOS_APTO = [
    "fotos/n30-01-sala-comedor.jpg",
    "fotos-nuevas/habitacion-aire.jpg",
    "fotos-nuevas/sala-tv.jpg",
    "fotos/n30-04-cocina.jpg",
    "fotos/n30-06-literas.jpg",
    "fotos-nuevas/sala.jpg",
    "fotos/n30-07-sala-sofa.jpg",
]

# Lo que incluye (BRIEF.md, sección 1: capacidad y "del conjunto").
INCLUYE = [
    {"icono": "personas", "texto": "Hasta 7 personas"},
    {"icono": "habitaciones", "texto": "2 habitaciones"},
    {"icono": "camas", "texto": "5 camas"},
    {"icono": "banos", "texto": "2 baños"},
    {"icono": "piscina", "texto": "Piscina con tobogán"},
    {"icono": "churuata", "texto": "Churuata"},
    {"icono": "estacionamiento", "texto": "Estacionamiento"},
    {"icono": "seguridad", "texto": "Seguridad"},
]

PERSONAS = (540, 1470 + NAV)  # fila "Personas" del calendario
APTO = (1000, 1560)  # Pescadores I en el mapa ilustrado (src/tucacas/web/escenas.tsx)

# Marcas medidas en la voz de 60 s (pausas con silencedetect sobre juana-60s.mp3).
M60 = {
    "vienes": 0.25, "enlace": 6.13, "fechas": 11.84, "personas": 13.56, "libre": 15.32,
    "conoces": 17.94, "fotos": 20.50, "incluye": 21.47, "donde": 22.45,
    "aire": 23.98, "wifi": 26.08, "tanque": 27.34, "cinco": 29.43, "piscina": 31.53,
    "tocas": 35.66, "mensaje": 37.36, "fechas2": 39.2, "gratis": 40.72, "no_se_cobra": 41.5,
    "confirmas": 43.21, "rapido": 45.36, "confianza": 46.12, "noche": 47.92, "churuata": 50.34, "parrilla": 50.9,
}


def guion_60():
    frases, pulso = cargar("60s")
    b, _ = utilidades(frases, pulso)
    m = M60

    c_aereo, c_foto, c_tel = b(1.71), b(2.78), b(4.38)
    tq_enlace = 6.75
    t_nav = 7.05
    t_cuando, t_cal = b(10.26), b(11.33)
    t18, t20 = 12.2, 12.75
    c_galeria_tel = b(17.73)
    c_fotos, c_incluye, c_mapa = b(19.87), b(21.47), b(22.54)
    c_aire, c_wifi, c_tanque = b(24.14), b(26.28), b(27.35)
    c_mapa2, c_piscina, c_piscina2 = b(28.95), b(31.62), b(32.69)
    c_reserva = b(33.75)
    tq_boton, t_chat, t_envio = 37.0, 37.35, 39.55
    c_gratis, c_confirma = b(40.70), b(43.37)
    c_noche, c_churuata, c_parrilla, c_cierre = b(47.64), b(50.31), b(51.38), b(52.98)

    planos = [
        {"tipo": "video", "desde": 0, "hasta": c_aereo, "archivo": "recorrido.mp4", "inicio": 0.2, "zoom": [1.18, 1.06], "entrada": "nada"},
        {"tipo": "video", "desde": c_aereo, "hasta": c_foto, "archivo": "aereo.mp4", "inicio": 0.6, "zoom": [1.0, 1.1], "entrada": "flash"},
        {"tipo": "foto", "desde": c_foto, "hasta": c_tel, "encuadre": {"foto": "fotos-nuevas/piscina-palmera.jpg", "foco": "40% 55%", "zoom": 1.08}},
        {
            "tipo": "telefono",
            "desde": c_tel,
            "hasta": c_galeria_tel,
            "entrada": "whip",
            "fondo": {"tipo": "playa"},
            "escenas": [
                {"t": c_tel, "tipo": "perfil", "toque": tq_enlace},
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
                            "toques": [{"t": t18, "x": DIA_18[0], "y": DIA_18[1] - NAV}, {"t": t20, "x": DIA_20[0], "y": DIA_20[1] - NAV}],
                            "resaltes": [
                                {"t": m["personas"] + 0.1, "x": 60, "y": 1400, "w": 960, "h": 150},
                                {"t": m["libre"] + 0.2, "x": 190, "y": 1265, "w": 700, "h": 80},
                            ],
                        },
                    ],
                },
            ],
            "camara": [
                cam(c_tel, 1.0),
                cam(5.9, 1.0),
                cam(6.3, 1.75, ENLACE, -2),
                cam(t_nav + 0.1, 1.75, ENLACE, -2),
                cam(t_nav + 0.5, 1.0),
                cam(8.9, 1.3, (540, 640), 2),
                cam(t_cuando, 1.3, (540, 640), 2),
                cam(t_cuando + 0.4, 1.05, (540, 1000), 0),
                cam(t_cal + 0.35, 1.15, (540, 1000)),
                cam(m["fechas"] + 0.2, 1.9, DIA_18, -3),
                cam(t20 - 0.1, 1.9, DIA_20, 2),
                cam(13.1, 1.9, DIA_20, 2),
                cam(m["personas"], 1.6, PERSONAS, 0),
                cam(m["libre"] - 0.2, 1.6, PERSONAS, 0),
                cam(m["libre"] + 0.15, 1.5, LEYENDA, -2),
                cam(17.2, 1.5, LEYENDA, -2),
                cam(c_galeria_tel, 1.0, CENTRO, 0),
            ],
        },
        {
            "tipo": "telefono",
            "desde": c_galeria_tel,
            "hasta": c_fotos,
            "entrada": "nada",
            "continua": True,
            "fondo": {"tipo": "playa"},
            "escenas": [{"t": c_galeria_tel, "tipo": "navegador", "vistas": [{"t": c_galeria_tel, "archivo": "02-apartamento-n30.mp4", "inicio": 12.2}]}],
            "camara": [cam(c_galeria_tel, 1.0, CENTRO, 0), {**cam(c_fotos - 0.35, 1.3, (540, 900), 3), "lento": True}, cam(c_fotos, 2.4, (540, 900), 0)],
        },
        {"tipo": "galeria", "desde": c_fotos, "hasta": c_incluye, "fotos": FOTOS_APTO, "entrada": "flash"},
        {"tipo": "incluye", "desde": c_incluye, "hasta": c_mapa, "items": INCLUYE, "entrada": "nada"},
        {
            "tipo": "mapa",
            "desde": c_mapa,
            "hasta": c_aire,
            "entrada": "whip",
            "camara": [cam(c_mapa, 0.42, (1300, 1500)), cam(c_mapa + 0.5, 1.0, APTO)],
            "eventos": {"pin": round(c_mapa + 0.35, 3)},
        },
        {
            "tipo": "iconos",
            "desde": c_aire,
            "hasta": c_wifi,
            "entrada": "whip",
            "fondo": {"tipo": "foto", "encuadre": {"foto": "fotos-nuevas/habitacion-aire.jpg", "foco": "50% 30%", "zoom": 1.08}},
            "iconos": [{"tipo": "aire", "texto": "Aire en todos los ambientes", "t": m["aire"]}],
        },
        {
            "tipo": "iconos",
            "desde": c_wifi,
            "hasta": c_tanque,
            "fondo": {"tipo": "foto", "encuadre": {"foto": "fotos-nuevas/sala-tv.jpg", "foco": "50% 40%", "zoom": 1.08, "escala": 1.1}},
            "iconos": [{"tipo": "wifi", "texto": "WiFi de fibra óptica", "t": m["wifi"] + 0.1}],
        },
        {
            "tipo": "iconos",
            "desde": c_tanque,
            "hasta": c_mapa2,
            "fondo": {"tipo": "playa"},
            "iconos": [
                {"tipo": "aire", "texto": "Aire", "t": c_tanque},
                {"tipo": "wifi", "texto": "WiFi de fibra", "t": round(c_tanque + 0.12, 3)},
                {"tipo": "agua", "texto": "Tanque de agua propio", "t": m["tanque"] + 0.05},
            ],
        },
        {
            "tipo": "mapa",
            "desde": c_mapa2,
            "hasta": c_piscina,
            "entrada": "whip",
            "camara": [cam(c_mapa2, 1.0, APTO), cam(29.55, 0.62, (1170, 1380)), cam(30.55, 0.62, (1170, 1380)), cam(30.95, 0.5, (1560, 1180))],
            "eventos": {"pin": round(c_mapa2 - 1, 3), "ruta": [29.45, 30.35], "muelle": 30.3, "lancha": [30.75, 31.55]},
            "insignia": {"t": m["cinco"], "texto": " de los muelles", "cuenta": [1, 5]},
        },
        {"tipo": "video", "desde": c_piscina, "hasta": c_piscina2, "archivo": "recorrido.mp4", "inicio": 2.2, "zoom": [1.12, 1.0], "entrada": "flash"},
        {"tipo": "foto", "desde": c_piscina2, "hasta": c_reserva, "encuadre": {"foto": "fotos-nuevas/piscina-casas.jpg", "foco": "50% 60%", "zoom": 1.08}},
        {
            "tipo": "telefono",
            "desde": c_reserva,
            "hasta": c_gratis,
            "entrada": "whip",
            "fondo": {"tipo": "playa"},
            "escenas": [
                {"t": c_reserva, "tipo": "navegador", "vistas": [{"t": c_reserva, "imagen": "calendario.png", "boton": {"t": 34.3, "toque": tq_boton}}]},
                {"t": t_chat, "tipo": "chat", "envio": t_envio},
            ],
            "camara": [
                cam(c_reserva, 1.0),
                cam(m["tocas"] - 0.2, 1.0),
                cam(m["tocas"] + 0.3, 1.6, BOTON_CAM, -2),
                cam(t_chat + 0.1, 1.6, BOTON_CAM, -2),
                cam(t_chat + 0.5, 1.7, (520, 1560), 0),
                cam(t_envio - 0.25, 1.7, (560, 1560), 0),
                cam(t_envio + 0.35, 1.25, (540, 1300), 2),
                cam(c_gratis, 1.0, CENTRO, 0),
            ],
        },
        {"tipo": "sincobro", "desde": c_gratis, "hasta": c_confirma, "sello": m["no_se_cobra"], "entrada": "whip"},
        {"tipo": "confirma", "desde": c_confirma, "hasta": c_noche, "rapido": m["rapido"], "confianza": m["confianza"], "entrada": "nada"},
        {
            "tipo": "telefono",
            "desde": c_noche,
            "hasta": c_churuata,
            "entrada": "whip",
            "fondo": {"tipo": "marca"},
            "escenas": [{"t": c_noche, "tipo": "navegador", "vistas": [{"t": c_noche, "archivo": "03-modo-dia-noche.mp4", "inicio": 3.0}]}],
            "camara": [cam(c_noche, 1.0, CENTRO, -2), cam(48.5, 1.12, CENTRO, 0)],
        },
        {"tipo": "video", "desde": c_churuata, "hasta": c_parrilla, "archivo": "churuata-noche.mp4", "inicio": 0.4, "zoom": [1.0, 1.08], "entrada": "flash"},
        {"tipo": "foto", "desde": c_parrilla, "hasta": c_cierre, "encuadre": {"foto": "fotos-nuevas/parrilla-noche.jpg", "ancha": True, "foco": "50% 55%", "zoom": 1.08}},
        {"tipo": "cierre", "desde": c_cierre, "hasta": 60.0, "icono": True, "entrada": "whip"},
    ]

    textos = [
        {"desde": 0.0, "hasta": c_aereo, "estilo": "gancho", "lineas": ["¿Vienes a", "Tucacas?"], "ts": [0.12, 0.62]},
        {"desde": 2.2, "hasta": c_tel, "estilo": "grande", "lineas": ["Reservar", "es más fácil"], "ts": [2.25, 3.3], "acento": [1], "icono": "reserva"},
        {"desde": m["fotos"] - 0.1, "hasta": c_incluye, "estilo": "pastilla", "lineas": ["Las fotos"], "y": 250, "acento": [0]},
        {"desde": c_incluye, "hasta": c_mapa, "estilo": "pastilla", "lineas": ["Lo que incluye"], "y": 250, "acento": [0]},
        {"desde": c_mapa + 0.1, "hasta": c_aire, "estilo": "pastilla", "lineas": ["Dónde queda"], "y": 250, "acento": [0]},
        {"desde": c_churuata, "hasta": c_parrilla, "estilo": "grande", "lineas": ["La churuata"], "ts": [m["churuata"]], "acento": [0]},
        {"desde": c_parrilla, "hasta": c_cierre, "estilo": "grande", "lineas": ["Área de", "parrilla"], "ts": [c_parrilla, c_parrilla + 0.2], "acento": [1]},
    ]

    w = lambda t, g=0.7: {"t": round(t - 0.2, 3), "sonido": "whoosh", "gain": g}  # noqa: E731
    efectos = [
        {"t": 0.0, "sonido": "olas", "gain": 0.7},
        {"t": 0.3, "sonido": "chapuzon", "gain": 0.5},
        w(c_aereo),
        {"t": c_aereo, "sonido": "gaviotas", "gain": 0.6, "pan": 0.3},
        w(c_tel, 0.9),
        {"t": tq_enlace, "sonido": "clic"},
        w(t_nav + 0.2, 0.5),
        {"t": t18, "sonido": "clic", "gain": 0.8},
        {"t": t20, "sonido": "clic", "gain": 0.8},
        w(c_fotos, 0.8),
        w(c_incluye, 0.5),
        w(c_mapa, 0.7),
        {"t": c_mapa + 0.45, "sonido": "clic", "gain": 0.9},
        w(c_aire, 0.6),
        w(c_wifi, 0.4),
        w(c_tanque, 0.4),
        w(c_mapa2, 0.6),
        {"t": 30.75, "sonido": "lancha", "gain": 0.5, "pan": 0.3},
        w(c_reserva, 0.7),
        {"t": tq_boton, "sonido": "clic"},
        w(t_chat + 0.2, 0.4),
        {"t": t_envio, "sonido": "mensaje", "gain": 1.2},
        w(c_gratis, 0.6),
        w(c_noche, 0.6),
        w(c_churuata, 0.5),
        w(c_cierre, 0.7),
        {"t": c_cierre + 0.5, "sonido": "olas", "gain": 0.8},
    ]
    return {
        "id": "web-60s",
        "duracion": 60.0,
        "planos": planos,
        "textos": textos,
        "frases": frases,
        "efectos": efectos,
        "noche": [round(c_noche + 0.8, 3), c_cierre],
    }


def guion_30():
    frases, pulso = cargar("30s")
    b, palabra = utilidades(frases, pulso)
    fr = lambda i: frases[i]  # noqa: E731

    c_aereo, c_foto, c_tel = b(1.63), b(2.70), b(3.77)
    tq_enlace = palabra(1, "el enlace") + 0.2
    t_nav = round(tq_enlace + 0.3, 3)
    t_cal = b(fr(2)["desde"] + 0.9)
    t18 = round(palabra(2, "tus fechas") + 0.1, 3)
    t20 = round(t18 + 0.55, 3)
    t_libre = palabra(2, "qué está libre")
    c_fotos = b(fr(3)["desde"] - 0.15)
    c_cuarto = b(12.85)
    c_iconos = b(fr(4)["desde"] + 0.1)
    c_reserva = b(fr(5)["desde"] - 0.25)
    tq_boton = palabra(5, "WhatsApp") + 0.3
    t_chat = round(tq_boton + 0.35, 3)
    t_envio = round(palabra(5, "con tus fechas") + 0.45, 3)
    c_cierre = b(fr(6)["desde"])

    planos = [
        {"tipo": "video", "desde": 0, "hasta": c_aereo, "archivo": "recorrido.mp4", "inicio": 0.2, "zoom": [1.18, 1.06], "entrada": "nada"},
        {"tipo": "video", "desde": c_aereo, "hasta": c_foto, "archivo": "aereo.mp4", "inicio": 0.6, "zoom": [1.0, 1.1], "entrada": "flash"},
        {"tipo": "foto", "desde": c_foto, "hasta": c_tel, "encuadre": {"foto": "fotos-nuevas/piscina-palmera.jpg", "foco": "40% 55%", "zoom": 1.08}},
        {
            "tipo": "telefono",
            "desde": c_tel,
            "hasta": c_fotos,
            "entrada": "whip",
            "fondo": {"tipo": "playa"},
            "escenas": [
                {"t": c_tel, "tipo": "perfil", "toque": round(tq_enlace, 3)},
                {
                    "t": t_nav,
                    "tipo": "navegador",
                    "sube": True,
                    "vistas": [
                        {"t": t_nav, "archivo": "01-inicio-recorrido.mp4", "inicio": 0},
                        {
                            "t": t_cal,
                            "imagen": "calendario.png",
                            "toques": [{"t": t18, "x": DIA_18[0], "y": DIA_18[1] - NAV}, {"t": t20, "x": DIA_20[0], "y": DIA_20[1] - NAV}],
                            "resaltes": [{"t": round(t_libre + 0.1, 3), "x": 190, "y": 1265, "w": 700, "h": 80}],
                        },
                    ],
                },
            ],
            "camara": [
                cam(c_tel, 1.0),
                cam(tq_enlace - 0.75, 1.0),
                cam(tq_enlace - 0.3, 1.75, ENLACE, -2),
                cam(t_nav + 0.1, 1.75, ENLACE, -2),
                cam(t_nav + 0.5, 1.0),
                cam(t_cal - 0.3, 1.25, (540, 640), 2),
                cam(t_cal + 0.3, 1.15, (540, 1000), 0),
                cam(t18 - 0.15, 1.9, DIA_18, -3),
                cam(t20 - 0.1, 1.9, DIA_20, 2),
                cam(t20 + 0.5, 1.9, DIA_20, 2),
                cam(t_libre, 1.5, LEYENDA, -2),
                cam(c_fotos - 0.1, 1.5, LEYENDA, -2),
                cam(c_fotos, 2.4, LEYENDA, 0),
            ],
        },
        {"tipo": "galeria", "desde": c_fotos, "hasta": c_cuarto, "fotos": FOTOS_APTO, "entrada": "flash"},
        {"tipo": "video", "desde": c_cuarto, "hasta": c_iconos, "archivo": "habitacion-ventana.mp4", "inicio": 5.6, "zoom": [1.0, 1.06]},
        {
            "tipo": "iconos",
            "desde": c_iconos,
            "hasta": c_reserva,
            "entrada": "whip",
            "fondo": {"tipo": "playa"},
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
            "fondo": {"tipo": "playa"},
            "escenas": [
                {"t": c_reserva, "tipo": "navegador", "vistas": [{"t": c_reserva, "imagen": "calendario.png", "boton": {"t": round(c_reserva + 0.3, 3), "toque": round(tq_boton, 3)}}]},
                {"t": t_chat, "tipo": "chat", "envio": t_envio},
            ],
            "camara": [
                cam(c_reserva, 1.0),
                cam(tq_boton - 0.7, 1.0),
                cam(tq_boton - 0.25, 1.6, BOTON_CAM, -2),
                cam(t_chat + 0.1, 1.6, BOTON_CAM, -2),
                cam(t_chat + 0.5, 1.7, (520, 1560), 0),
                cam(t_envio - 0.25, 1.7, (560, 1560), 0),
                cam(t_envio + 0.35, 1.25, (540, 1300), 2),
                cam(c_cierre, 1.0, CENTRO, 0),
            ],
        },
        {"tipo": "cierre", "desde": c_cierre, "hasta": 30.0, "icono": True, "entrada": "whip"},
    ]
    textos = [
        {"desde": 0.0, "hasta": c_aereo, "estilo": "gancho", "lineas": ["¿Vienes a", "Tucacas?"], "ts": [0.15, 0.7]},
        {"desde": 1.95, "hasta": c_tel, "estilo": "grande", "lineas": ["Reservas en", "un toque"], "ts": [2.0, palabra(0, "un toque")], "acento": [1], "icono": "reserva"},
        {"desde": c_fotos + 0.1, "hasta": c_cuarto, "estilo": "pastilla", "lineas": ["Por dentro"], "y": 250, "acento": [0]},
    ]
    w = lambda t, g=0.7: {"t": round(t - 0.2, 3), "sonido": "whoosh", "gain": g}  # noqa: E731
    efectos = [
        {"t": 0.0, "sonido": "olas", "gain": 0.7},
        {"t": 0.3, "sonido": "chapuzon", "gain": 0.5},
        w(c_aereo),
        {"t": c_aereo, "sonido": "gaviotas", "gain": 0.6, "pan": 0.3},
        w(c_tel, 0.9),
        {"t": tq_enlace, "sonido": "clic"},
        w(t_nav + 0.2, 0.5),
        {"t": t18, "sonido": "clic", "gain": 0.8},
        {"t": t20, "sonido": "clic", "gain": 0.8},
        w(c_fotos, 0.8),
        w(c_iconos, 0.6),
        w(c_reserva, 0.7),
        {"t": tq_boton, "sonido": "clic"},
        w(t_chat + 0.2, 0.4),
        {"t": t_envio, "sonido": "mensaje", "gain": 1.2},
        w(c_cierre, 0.7),
        {"t": c_cierre + 0.5, "sonido": "olas", "gain": 0.8},
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
