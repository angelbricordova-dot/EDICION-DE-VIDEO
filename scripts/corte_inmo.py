"""Corte sin aire de los reels inmobiliarios: tomas elegidas → lista de cortes + voz montada.

Cada toma es un rango [ini, fin] del bruto (segundos), elegido a mano sobre la transcripción
(`public/tiktok/<reel>/palabras-alineadas.json`, ver scripts/alinear.py). Dentro de cada toma
se acortan las pausas largas: cualquier tramo por debajo de UMBRAL dB más largo que PAUSA_MAX
se recorta dejando MARGEN a cada lado (queda una pausa natural de ~0,2 s, no un corte seco), y
el silencio al principio y al final de la toma se deja en ENTRADA / SALIDA.
Las palabras se trasladan al tiempo de salida para los subtítulos.

Salida:
    src/inmobiliaria/<reel>-<version>.json   {cortes: [{src, dur, out}], palabras, duracion}
    public/tiktok/<reel>/voz-<version>.wav    voz montada (fundidos de 8 ms en cada corte)

Uso:
    python3 scripts/corte_inmo.py g6 prueba
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
UMBRAL = -45.0  # dBFS (el ruido de fondo del bruto está en −55 dB)
PAUSA_MAX = 0.32  # pausas más cortas se dejan como están: así suena natural
MARGEN = 0.10
ENTRADA = 0.08
SALIDA = 0.14  # aire tras cada frase, para que respire antes de la siguiente
FUNDIDO = 0.02

# Cuerpo común del reel 6 (las repeticiones "y tres y tres", "y estamos acabando" y la primera
# toma de la conclusión se quedan fuera).
_CUERPO_G6 = [
    (50.66, 63.40),  # Uno, el estado del piso … es dinero que le puedes bajar al precio.
    (69.30, 86.00),  # Dos. La zona … una carretera … te lo hunde.
    (93.85, 108.55),  # Y tres, la que más dinero cuesta: las actas … el piso ya será tuyo.
    (119.25, 130.25),  # Y es que … para no perder dinero. Si vas a comprar … comenta la palabra guía y te mando…
]

# Reel 3 "5 documentos" (guion 3). Se quedan fuera "Reel número 3 / Hook 1 / Hook 2", la
# primera toma del CTA (se corta en "te mando") y "Dale al botón… ¡Gracias!".
_CUERPO_G3 = [
    (19.15, 33.60),  # Primero, una nota simple … Segundo, la referencia catastral … del inmueble.
    (39.20, 52.80),  # Tercero, la cédula … Cuarto, un certificado de la comunidad … derramas aprobadas.
    (58.80, 75.40),  # Y quinto … la inspección técnica de edificios … demanda de alquiler en esa zona.
    (81.60, 86.85),  # Si un piso no tiene problemas pero no hay inquilinos … muchísimo dinero.
    (96.30, 102.40),  # Si vas a comprar tu primer piso de inversión, comenta la palabra guía … invertir.
]

# Reel 8 "ranking de portales" (guion 8, cámara lateral, bruto vertical 4K). Fuera: "Reel
# número 8 / Hook 1 / Hook 2 / Vale, déjame ver / Empezamos", el primer "Mil anuncio", "Vale",
# "Ahora, dale", "Espérate", "Un segundito", el primer "¿Y el número uno?" y las dos primeras
# tomas del cierre.
_CUERPO_G8 = [
    (21.70, 32.25),  # Idealista, número 4 … pero nunca para comprarlo.
    (37.65, 42.95),  # Milanuncios, número 6 … muy poca oportunidad.
    (44.60, 50.80),  # Pisos.com, número 7 … Yo no lo usaría.
    (54.50, 64.15),  # Fotocasa, número 5 … para comprar barato, no.
    (65.20, 71.95),  # Altamira, número 3 … descuentos de verdad.
    (78.30, 85.35),  # Sareb, número 2 … donde más descuentos he visto.
    (90.45, 98.60),  # y el número uno no es un portal … inversor de confianza.
    (103.95, 111.85),  # Y eso es lo que enseño en El Filtro Inmobiliario … te lleguen a ti el primero.
    (121.45, 129.20),  # Y es que en inversión inmobiliaria … Déjame la palabra filtro … lista de espera.
]

# Reel 9 "llamada de la agencia" (guion 9). Instrucciones del cliente dentro del video: la voz
# de Darío (la agencia) distorsionada para que se entienda pero no se reconozca, pitido sobre la
# calle, el barrio y el nombre "Paco", y fuera el "coño" (se usa la toma repetida).
_AG = {"quien": "agencia"}
_LLAMADA_G9 = [
    (24.10, 32.70, _AG),  # Buenos días, Julio. Mira, te llamo porque me ha entrado un piso interesante …
    (38.50, 44.85),  # ¿Qué tal, señor? ¿Cómo estás? … ¿En qué calle estás exactamente?
    (59.85, 67.50, _AG),  # En calle ***, en el barrio de ***. Y no es la mejor zona, pero el piso no está mal.
    (78.30, 85.95),  # Vale, vale, conozco más o menos esa zona … ¿sabéis el motivo de venta?
    (87.15, 98.40, _AG),  # Es una herencia … precio de salida de unos 98.000 euros.
    (107.40, 115.80),  # Vale, más o menos puede cuadrar. Y ahora, tú que sabes más que yo … en esa zona?
    (116.55, 127.75, _AG),  # Pues en Idealista ahora mismo hay un par de pisos a 550 euros …
    (136.90, 143.40),  # Y entiendo que el tema de las cargas está todo controlado … ¿la nota simple ya?
    (144.25, 147.70, _AG),  # Sí, no te preocupes, te la mando en un rato que voy a otra visita.
    (165.45, 168.45),  # Vale, vale, señor, pues gracias por pensar en mí. (toma sin el "coño")
    (171.45, 179.20, _AG),  # Nada, Julio, a ti siempre, pero tienes que decirme algo rápido en 24 horas …
    (188.60, 193.30),  # Tranquilo, ***, como siempre, te contesto cuanto antes, ¿vale? No tardo, un abrazo.
]
_CIERRE_G9 = [
    (204.90, 211.40),  # ¿Veis? Esto no me interesa … la rentabilidad no supera el 6 % neto.
    (218.50, 225.10),  # Pero fijaos en lo importante … no está todavía en ningún portal.
    (228.90, 233.20),  # Pero claro, que sea una exclusiva no significa que sea una buena oportunidad.
    (238.95, 246.20),  # Y es que, para mí, invertir no es encontrar … es descartar … para no perder tiempo.
    (260.40, 268.90),  # Y bueno, sobre todo, lo más importante, saber crear este tipo de relaciones … (2.ª toma)
    (276.90, 286.40),  # Tengo una clase privada de 45 minutos … si me dejas la palabra guía.
]
# Reel 10 "lo que deberías tener a cada edad" (guion 10, pizarra, bruto vertical 4K). Fuera: "Eso
# ha sido el hook / Estamos en el reel número 10", las dos primeras tomas de "9 a 5" ("te hace
# sentir mal", "no te preocupes"), la charla con el socio, el "ya deberías" repetido y el
# "dinero" repetido.
_CUERPO_G10 = [
    (64.25, 67.90),  # Con 25 años ya deberías de tener tu primer piso de inversión.
    (74.45, 75.50),  # Con 30 años
    (76.70, 79.15),  # ya deberías de tener 3. (sin el primer "ya deberías")
    (84.35, 86.70),  # Con 35, un edificio entero.
    (92.35, 95.55),  # Con 40, 15 pisos y una SL a tu nombre.
    (107.85, 112.25),  # Y con 50 años, si no tienes un barrio entero a tu nombre, algo estás haciendo mal.
    (115.90, 118.45),  # A ver, a ver, espérate, que esto es broma, obviamente.
    (123.95, 129.35),  # Pero, por desgracia, esto es lo que te venden cada día por redes, ¿vale?
    (162.95, 171.70),  # Y si eres de esas personas que trabaja de 9 a 5 … vas tarde a todo. Pero no vas tarde, estate tranquilo.
    (180.50, 183.85),  # El problema de todo esto es que te están enseñando la meta equivocada.
    (190.45, 196.22),  # Yo no te voy a enseñar a que consigas 15 pisos … el dinero que tanto
    (196.57, 197.50),  # te ha costado ahorrar.
    (238.50, 244.65),  # Un piso bien comprado … patrimonio poco a poco.
    (253.25, 259.85),  # Como José Manuel, un alumno con 50 años … 1.950 euros al mes.
    (265.90, 274.90),  # Y es que … no gana el que más pisos acumula, gana el que … puede seguir escalando.
    (296.80, 303.10),  # Así que si quieres empezar por ese primero … si me dejas la palabra guía.
]
# Reel 12 "ranking de bancos para hipotecas" (guion 12, cámara lateral como el 8, con Darío detrás
# de cámara). Fuera: "Listo / Reel número 12 / Hook…", "Vale, un segundito", el primer "BBVA"
# ("te perdés…"), la charla con Darío del "rural", la primera toma de "Número dos, buenos tipos y
# oficina en cual…", los "Espérate / Otros dos / Aquí / Un segundito / Ahora / Y ya sigo yo".
_CUERPO_G12 = [
    (20.60, 26.40),  # Santander, número 4 … no te van a hacer mucho más.
    (27.80, 34.40),  # Trade Republic, número 8 … mejor que cualquier banco normal.
    (41.75, 47.15),  # BBVA, número 7, como Santander pero todavía más difícil sacar la hipoteca.
    (60.55, 61.75),  # Eurocaja Rural,
    (65.90, 71.95),  # número dos. Buenos tipos y oficina en casi cualquier pueblo … te la vas a encontrar.
    (77.50, 83.50),  # ING, número 6 … cuidado con lo que dices.
    (84.90, 90.80),  # Ibercaja, número 3 … tengas mucho dinero o no.
    (95.75, 100.90),  # CaixaBank, número 5 … le cuesta estudiarte.
    (105.50, 106.60),  # ¿Y el número uno?
    (106.85, 112.80),  # Unicaja … puedes tener varias hipotecas a la vez.
    (115.25, 121.65),  # Y es que en inversión inmobiliaria … firmar la segunda hipoteca.
    (127.35, 135.65),  # Para saber cuál te conviene a ti … Comenta la palabra calculadora y te la regalo.
]
# Reel 13 "4 webs de pisos baratos" (guion 13, informal con iPad). Fuera: "¿Vale?", la charla de
# los pedidos, las tomas falsas de "Y cuatro, comercial…", "Es que son palabras", "Y hablo así" y
# la charla del dibujito.
_G13 = [
    (8.05, 11.25),  # HOOK: Cuatro webs para encontrar pisos en España baratos, como estos.
    (18.50, 24.15),  # Uno, el portal de subastas del BOE. Embargos, pisos ocupados, derramas y todo.
    (35.80, 37.75),  # Dos. El de la Seguridad Social.
    (46.75, 51.55),  # Pisos embargados por deudas de cotizaciones … muy bajo.
    (59.60, 69.30),  # Tres, Escrapalia … ya lo conoce todo el mundo.
    (101.10, 105.65),  # Y cuatro, las webs de los bancos. Ahí aparecen todos los pisos que se quedaron ellos.
    (119.55, 120.25),  # Pero claro,
    (121.75, 125.00),  # la mayoría de pisos que vas a ver ahí son totalmente basura.
    (130.30, 132.20),  # Y yo los descarto en menos de un minuto.
    (139.00, 145.25),  # Siempre abro la ficha del piso y miro tres cosas antes del precio.
    (147.75, 150.80),  # Si está ocupado, si se puede visitar.
    (158.40, 160.05),  # ¿Y qué deudas tiene?
    (163.45, 167.20),  # Si una de las tres no me cuadra, cierro la pestaña y paso a la siguiente.
    (173.10, 175.95),  # Por eso yo siempre uso el mismo método de trabajo,
    (187.10, 188.70),  # descarto toda la basura,
    (191.85, 194.30),  # luego valido lo que realmente sea interesante
    (198.50, 199.95),  # solamente al final pujo.
    (202.50, 206.85),  # Porque el precio que te ponen nunca te va a contar todos los problemas que tiene detrás.
    (212.30, 216.40),  # Y aún así, en estas cuatro webs vas a competir con miles de personas.
    (220.95, 227.30),  # Por eso, yo además trabajo con inmobiliarias locales … antes que a nadie.
    (233.85, 236.75),  # Y es que en inversión inmobiliaria no gana el que más pisos ve,
    (242.90, 248.85),  # gana el que más rápido puede descartar toda la basura … antes que a nadie.
    (319.85, 325.75),  # Así que, si quieres aprender a invertir desde cero, déjame la palabra guía …
]
# Reel 14 "casa para vivir vs casa para alquilar" (formato sofá). El cliente grabó las dos mitades
# por separado con la cámara quieta: primero el de camiseta blanca (izquierda, "para alquilar") y
# luego, cambiado, el de camiseta negra (derecha, "para vivir"). En Remotion cada mitad muestra su
# toma; mientras habla uno, la otra mitad pone un tramo en silencio de esa persona escuchando
# (ver rellenos_sofa). Fuera: las indicaciones a Darío, las tomas falsas y la charla del cambio.
_IZ = {"lado": "izq"}
_DE = {"lado": "der"}
_G14 = [
    (451.40, 453.60, _DE),  # Diferencia entre una casa para vivir…
    (80.20, 82.10, _IZ),  # …y una casa para alquilar.
    (461.10, 463.80, _DE),  # En suelo, para vivir, parqué de madera.
    (98.80, 102.20, _IZ),  # Para alquilar, vinílico imitación a madera.
    (105.80, 109.80, _IZ),  # Esto aguanta arañazos, agua y hasta cinco mudanzas.
    (496.70, 499.90, _DE),  # En las paredes, para vivir el color que más te guste.
    (118.00, 122.10, _IZ),  # Para alquilar, blanco roto y la misma referencia en todo el piso.
    (127.50, 131.50, _IZ),  # Porque entre un inquilino y otro retocas, pero no te toca pintarlo entero.
    (506.80, 509.60, _DE),  # En grifos, para vivir el de diseño.
    (138.10, 141.20, _IZ),  # Para alquilar, un monomando de marca normal.
    (144.50, 148.10, _IZ),  # Los toques negros quedan espectaculares y cuestan lo mismo.
    (153.80, 158.00, _IZ),  # Y si falla, lo puedes solucionar súper rápido con algún recambio de ferretería.
    (516.20, 519.40, _DE),  # En electrodomésticos, para vivir, integrados.
    (164.60, 167.00, _IZ),  # Para alquilar, de libre instalación.
    (171.20, 174.80, _IZ),  # Porque si se rompe solo la lavadora, no desmontas la cocina entera.
    (528.20, 533.30, _DE),  # En azulejos para la cocina, obviamente, quitas lo que haya y alicatas entero.
    (180.60, 184.10, _IZ),  # Para alquilar, pintura de azulejo especial y se acabó.
    (541.80, 544.90, _DE),  # Los pomos de las puertas, obviamente en negro.
    (195.90, 201.90, _IZ),  # Pues aquí sí te doy toda la razón … unos 10 euros por puerta y queda espectacular.
    (206.50, 212.00, _IZ),  # Porque cada euro que metes en una reforma tiene que ser para aumentar el valor máximo.
    (250.80, 261.30, _IZ),  # Y es que cuando compras un piso para alquilar … como si fuese para ti.
    (264.60, 270.90, _IZ),  # Así que si quieres empezar a invertir con cabeza, déjame la palabra guía …
]
# Tramos donde cada uno está callado y en su sitio (para la mitad que escucha).
SOFA = {"g14": {"izq": (84.0, 272.0), "der": (455.0, 548.0)}, "g16": {"izq": (14.0, 118.0), "der": (124.0, 215.0)}}
# Reel 15 "pisos baratos en subasta en 60 segundos" (dos archivos: el cuerpo y, al final, el hook
# grabado de pie). Fuera: la búsqueda en el portátil, "¿Sigo?", "Ahora, por ejemplo…", "Así,
# así…" y las dos primeras tomas del CTA.
_CUERPO_G15 = [
    (9.85, 12.95),  # Cuenca, esta casa que veis aquí, por menos de 15.000 euros.
    (13.30, 15.60),  # Y seguro que me dices, oye, Cuenca es demasiado fácil.
    (36.25, 42.60),  # Y ahora nos vamos a Alicante … menos de 7.000 euros, pero claro … interesante
    (63.00, 67.90),  # Y en Madrid, ojo, 53.000 euros. Ahora la cosa sí que se pone realmente interesante.
    (74.30, 76.95),  # Todo pinta increíble, pero aquí hay gato encerrado.
    (84.80, 87.75),  # Y es que casi ninguno lo puedes visitar antes de pujar.
    (96.95, 100.75),  # Muchos están ocupados, incluso tienen deudas que si lo compras te llegan a ti.
    (116.60, 122.40),  # Pero el problema es otro … miles de personas en España que lo han podido hacer igual.
    (130.05, 132.25),  # Por eso yo hago justo lo contrario.
    (140.45, 144.70),  # Tengo agencias inmobiliarias que me mandan los pisos antes de que los publiquen …
    (153.25, 154.60),  # ¿Y por qué a mí y no a otro?
    (163.70, 169.95),  # Porque yo soy el inversor que responde en 24 horas … perder el tiempo.
    (175.40, 178.90),  # Los agentes quieren su comisión y saben que conmigo eso es algo seguro.
    (191.20, 194.80),  # Y es que en inversión inmobiliaria no gana el que más rápido busca los chollos.
    (206.35, 208.05),  # Aquí gana al que se los manda.
    (250.35, 258.30),  # Así que, ya lo sabes … déjame la palabra guía y te mando una clase privada de 45 minutos.
]
# Reel 16 "rico vs pobre" (formato sofá como el 14): a la izquierda el rico (camiseta blanca, primer
# archivo), a la derecha el pobre (camiseta negra, segundo archivo, que dice también las cifras).
_G16 = [
    (129.60, 130.30, _DE),  # Un euro.
    (131.20, 132.20, _DE),  # ¿Me compro un Monster?
    (16.30, 17.70, _IZ),  # Me compro una botella de agua.
    (133.40, 134.80, _DE),  # 20 euros.
    (137.50, 138.30, _DE),  # Unas copas.
    (22.40, 23.45, _IZ),  # Me compro un libro.
    (139.85, 141.40, _DE),  # 500 euros.
    (142.30, 143.30, _DE),  # Un finde de fiesta.
    (28.70, 30.30, _IZ),  # ¿Me pago una formación?
    (151.50, 153.20, _DE),  # Tío, eso es tirar el dinero.
    (160.70, 161.65, _DE),  # 3.000 euros.
    (162.20, 164.45, _DE),  # Un fin de semana en Ibiza de puta madre.
    (34.05, 35.15, _IZ),  # ¿Reservo un piso?
    (169.85, 171.75, _DE),  # ¿Un piso? ¿Con 3.000 euros?
    (45.95, 51.00, _IZ),  # Pues sí, el que me han pasado antes de que salga en Idealista.
    (175.60, 176.75, _DE),  # 10.000 euros.
    (177.25, 179.40, _DE),  # La entrada para un coche, todo guapo.
    (54.85, 55.80, _IZ),  # Doy las arras.
    (183.60, 184.30, _DE),  # ¿Las qué?
    (59.75, 62.35, _IZ),  # Eso es lo que pagas para que el piso no se lo quede otro.
    (187.50, 188.70, _DE),  # 30.000 euros.
    (189.00, 190.80, _DE),  # El coche de mis sueños.
    (65.35, 67.25, _IZ),  # Compro mi primer piso para alquilar.
    (194.90, 197.40, _DE),  # Venga ya, anda. ¿Un piso con 30.000 euros?
    (72.65, 78.80, _IZ),  # El banco pone el 80 %, yo pongo la entrada y los gastos … el inquilino.
    (201.65, 206.50, _DE),  # O sea, ¿me estás diciendo que con lo que yo me compro un coche …?
    (87.35, 93.80, _IZ),  # Un alumno mío compró en Madrid con menos de 40.000 euros … 1.200 euros al mes.
    (211.10, 212.50, _DE),  # ¿Y yo puedo aprender a hacer eso?
    (107.20, 115.85, _IZ),  # Pues sí, tengo una clase de 45 minutos … deja la palabra guía y te la mando.
]
# Reel 17 "3 formas de comprar pisos por debajo de 100k" (guion 17). Las webs van a pantalla completa
# (lo pidió en la grabación); "la segunda, las subastas online" es el plano andando por el pasillo y
# la frase de las subastas va en off sobre la web. Fuera: todas las indicaciones a Darío.
_G17 = [
    (4.40, 7.55),  # HOOK: Tres formas de comprar pisos por debajo de 100.000 euros en España.
    (27.65, 29.40),  # La primera, los pisos de banco.
    (30.35, 37.40),  # Mis tres páginas favoritas son Solvia … Servihabitat, con estos otros, y Aliseda, con estos.
    (108.30, 110.15),  # La segunda, las subastas online. (andando por el pasillo)
    (142.00, 148.25),  # No tienes que ir a ningún sitio … Oportunidades que jamás verás en Idealista. (en off)
    (167.55, 170.50),  # Pero si es tu primera inversión, no te recomiendo ninguna de las dos.
    (177.60, 182.65),  # Pisos ocupados, cargas, pisos destrozados, te la pueden colar en menos de un segundo.
    (189.95, 192.90),  # Y ahora viene la tercera y la que para mí es la mejor.
    (213.90, 218.70),  # Crear tu propia red de contactos … antes de que lleguen a los portales.
    (222.60, 227.45),  # Pisos que puedes visitar, revisar y negociar sin tener que pelearte con media España.
    (233.80, 239.90),  # Y es que en inversión inmobiliaria el piso más barato … te llega a ti antes que a nadie.
    (302.40, 307.20),  # Y si quieres aprender a crear esa red … mi comunidad, el Filtro Inmobiliario.
    (319.10, 322.85),  # Si te quieres apuntar a la lista de espera, deja la palabra filtro y te la envío.
]
# Reel 18 "3 páginas para comprar pisos a mitad de precio" (guion 18, frontal informal). Fuera: "Este
# es el hook…", "sigo con el hook", la indicación del Word y la primera toma del CTA.
_CUERPO_G18 = [
    (41.05, 43.30),  # Número uno, portal de subastas del BOE.
    (53.85, 58.30),  # Aquí vas a poder encontrar los pisos de embargos y de subastas súper baratos.
    (71.45, 75.30),  # Pero ojo, que quien subasta no está obligado a decirte si el piso está ocupado o no.
    (79.05, 81.95),  # Un piso barato con alguien dentro no es un chollo.
    (84.45, 86.30),  # Número dos, Oportunalia.
    (90.15, 95.20),  # Pisos de fondos, de bancos, pero con una web súper intuitiva, mucho más que la del BOE.
    (106.75, 110.40),  # Pero cuando todos ven la misma web, el piso se lo queda el que puja más alto.
    (116.30, 121.95),  # Y además, el precio bajo siempre tiene un motivo. O deudas, o okupas, o … destrozado.
    (125.85, 128.45),  # Y la número tres, que es la mejor, no es una página.
    (132.25, 137.45),  # Es conseguir que las inmobiliarias de tu zona te llamen a ti antes de publicar el piso …
    (141.40, 145.35),  # El último piso que compré por 98.000 euros no estaba publicado en ninguna web.
    (150.00, 154.35),  # Me llegó una mañana a través del teléfono y ya está alquilado en 750 euros.
    (159.65, 164.90),  # ¿Cómo? Muy sencillo, creando relaciones con ellos … soy un inversor serio.
    (169.50, 173.35),  # Cuando una agencia sabe que tú puedes decidir rápido, te llama a ti primero.
    (178.30, 185.25),  # Y es que en inversión inmobiliaria un verdadero chollo no se encuentra en ninguna web …
    (225.40, 229.65),  # Todo esto está explicado en una clase privada que te envío si me dejas la palabra guía.
]
PITIDOS = {"g9": [(60.55, 61.25), (63.33, 63.95), (189.28, 189.72)]}

TOMAS = {
    ("g9", "llamada"): [*_LLAMADA_G9, *_CIERRE_G9],
    # Versión 2: mini intro en blanco y negro con las mejores frases y "EN LA LLAMADA…".
    ("g9", "intro"): [
        (26.30, 29.40, {"quien": "agencia", "intro": True}),  # me ha entrado un piso interesante y no lo hemos publicado
        (84.05, 85.95, {"intro": True}),  # ¿sabéis el motivo de venta?
        (173.35, 175.95, {"quien": "agencia", "intro": True}),  # tienes que decirme algo rápido en 24 horas
        *_LLAMADA_G9,
        *_CIERRE_G9,
    ],
    ("g13", "hook"): list(_G13),
    ("g18", "hook1"): [(5.40, 9.15), (13.20, 18.50), *_CUERPO_G18],  # Tres páginas … a mitad de precio, y si te quedas hasta el final, la última es la mejor.
    ("g18", "hook2"): [(27.05, 29.55), (33.25, 36.95), *_CUERPO_G18],  # Tres sitios … y si te quedas hasta el final, el último es el que he usado para comprar mi último piso.
    ("g17", "hook"): list(_G17),
    ("g15", "hook1"): [(268.35, 272.00), *_CUERPO_G15],  # Los pisos más baratos de España que están en subasta en menos de 60 segundos
    ("g15", "cuerpo"): list(_CUERPO_G15),
    ("g14", "sofa"): list(_G14),
    ("g16", "sofa"): list(_G16),
    ("g12", "hook1"): [(7.60, 9.85), *_CUERPO_G12],  # HOOK 1: Mejores bancos para sacar una hipoteca
    ("g12", "hook2"): [(11.65, 14.05), *_CUERPO_G12],  # HOOK 2: Ranking de los mejores bancos para hipoteca
    ("g12", "cuerpo"): list(_CUERPO_G12),
    ("g10", "hook1"): [(28.55, 31.45), *_CUERPO_G10],  # HOOK 1: ¿Cuántos pisos deberías de tener según tu edad?
    ("g10", "hook2"): [(48.60, 51.25), *_CUERPO_G10],  # Si no tienes estos pisos según tu edad, vas tarde.
    ("g10", "cuerpo"): list(_CUERPO_G10),  # versión 3: solo el cuerpo
    ("g8", "hook1"): [(8.85, 11.00), *_CUERPO_G8],  # HOOK 1: Mejores sitios para encontrar una casa
    ("g8", "hook2"): [(13.60, 15.95), *_CUERPO_G8],  # HOOK 2: Mejores webs para buscar una casa
    ("g8", "cuerpo"): list(_CUERPO_G8),  # versión 3: empieza directo en el cuerpo
    ("g3", "hook1"): [
        (4.75, 8.40),  # HOOK 1: ¿Vas a comprar una casa? Asegúrate de pedir siempre estas 5 cosas.
        *_CUERPO_G3,
    ],
    ("g3", "hook2"): [
        (10.90, 13.90),  # HOOK 2: Nunca compres una casa sin pedir estas 5 cosas.
        *_CUERPO_G3,
    ],
    ("g6", "prueba"): [
        (41.22, 45.30),  # HOOK 2: Si no revisas estas tres cosas al comprar tu casa, vas a perder dinero.
        (50.66, 63.40),  # Uno, el estado del piso … es dinero que le puedes bajar al precio. (toma seguida)
    ],
    ("g6", "hook1"): [
        (7.30, 15.10),  # HOOK 1: Nunca compres un piso sin saber estas tres cosas … nunca te las van a contar.
        (21.95, 33.95),  # Y atento a la tercera … y sé lo que pasa detrás de lo que no se ve.
        *_CUERPO_G6,
    ],
    ("g6", "hook2"): [
        (41.22, 45.30),  # HOOK 2: Si no revisas estas tres cosas al comprar tu casa, vas a perder dinero.
        *_CUERPO_G6,
    ],
}


def leer(ruta):
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)


def sin_pausas(x, ini, fin):
    """Parte [ini, fin] en tramos con voz, quitando pausas largas."""
    w = int(0.01 * SR)
    a, b = int(ini * SR), int(fin * SR)
    seg = x[a:b]
    n = len(seg) // w
    db = 20 * np.log10(np.sqrt((seg[: n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    bajo = db < UMBRAL
    voz = np.flatnonzero(~bajo)
    if len(voz) == 0:
        return []
    primero, ultimo = voz[0], voz[-1] + 1
    tramos, i, inicio = [], primero, max(0.0, primero * 0.01 - ENTRADA)
    while i < ultimo:
        if bajo[i]:
            j = i
            while j < ultimo and bajo[j]:
                j += 1
            if (j - i) * 0.01 > PAUSA_MAX:
                tramos.append((inicio, i * 0.01 + MARGEN))
                inicio = j * 0.01 - MARGEN
            i = j
        else:
            i += 1
    tramos.append((inicio, min((b - a) / SR, ultimo * 0.01 + SALIDA)))
    # Los trocitos sueltos (clics, respiraciones cortas) no son voz.
    return [(ini + s, ini + e) for s, e in tramos if e - s > 0.12]


def ordenar(palabras):
    """Corrige las pocas palabras que la alineación deja fuera de orden (usa el tiempo de Whisper)."""
    p = [dict(w) for w in palabras]
    for i in range(1, len(p)):
        if p[i]["ini"] < p[i - 1]["ini"]:
            p[i]["ini"] = max(p[i - 1]["ini"] + 0.08, p[i].get("whisper", [p[i]["ini"]])[0])
        elif i + 1 < len(p) and p[i]["ini"] > p[i + 1]["ini"] >= p[i - 1]["ini"]:
            p[i]["ini"] = max(p[i - 1]["ini"] + 0.08, min(p[i].get("whisper", [p[i]["ini"]])[0], p[i + 1]["ini"] - 0.08))
        p[i]["fin"] = max(p[i]["fin"], p[i]["ini"] + 0.06)
    return p


def efecto_telefono(ruta, tono=0.84):
    """Voz "al teléfono" y más grave (pedido de Angel), para que se entienda pero no se reconozca (reel 9)."""
    filtro = f"asetrate={SR}*{tono},aresample={SR},atempo={1 / tono:.6f},highpass=f=330,lowpass=f=3300,acompressor=threshold=-24dB:ratio=3:attack=5:release=80,volume=2.2"
    crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-af", filtro, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)


def pitido(dur, f=1000.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, np.minimum(t, dur - t) / 0.01)
    # Bajito (≈ −22 dBFS): se nota la censura sin molestar.
    return (0.08 * np.sin(2 * np.pi * f * t) * env).astype(np.float32)


def rellenos_sofa(reel, tomas, cortes, palabras):
    """Para cada toma de un lado, un tramo en silencio del otro lado (escuchando), sin repetir."""
    zonas = SOFA[reel]
    usados = {lado: [] for lado in zonas}
    huecos = {}
    for lado, (a, b) in zonas.items():
        ws = sorted((w for w in palabras if a <= w["ini"] <= b), key=lambda w: w["ini"])
        h, prev = [], a
        for w in ws:
            if w["ini"] - prev > 1.0:
                h.append([prev + 0.15, w["ini"] - 0.15])
            prev = max(prev, w["fin"])
        if b - prev > 1.0:
            h.append([prev + 0.15, b])
        huecos[lado] = h
    originales = {lado: [tuple(x) for x in h] for lado, h in huecos.items()}
    out = []
    for ti, (_, _, op) in enumerate(tomas):
        mios = [c for c in cortes if c["toma"] == ti]
        if not mios:
            continue
        otro = "der" if op.get("lado") == "izq" else "izq"
        t_out, falta = mios[0]["out"], sum(c["dur"] for c in mios)
        # El hueco más largo libre; si no alcanza, se encadenan.
        while falta > 0.01:
            h = max(huecos[otro], key=lambda x: x[1] - x[0])
            if h[1] - h[0] < 0.5:  # sin huecos libres: se reutilizan desde el principio
                for x, (a, b) in zip(huecos[otro], originales[otro]):
                    x[0], x[1] = a, b
                h = max(huecos[otro], key=lambda x: x[1] - x[0])
            dur = min(falta, h[1] - h[0])
            out.append({"lado": otro, "src": round(h[0], 3), "dur": round(dur, 3), "out": round(t_out, 3)})
            h[0] += dur + 0.5
            t_out += dur
            falta -= dur
    return out


def main():
    reel, version = sys.argv[1], sys.argv[2]
    dir_ = RAIZ / "public/tiktok" / reel
    x = leer(dir_ / "audio48k.wav")
    tel = None
    palabras = ordenar(json.loads((dir_ / "palabras-alineadas.json").read_text())["palabras"])
    # Cada toma es (ini, fin) o (ini, fin, {"quien": "agencia", "intro": True}).
    tomas = [(t[0], t[1], t[2] if len(t) > 2 else {}) for t in TOMAS[(reel, version)]]
    cortes, salida, out = [], [], 0.0
    piezas = []
    f = int(FUNDIDO * SR)
    for ti, (ini, fin, op) in enumerate(tomas):
        mios = []
        for s_, e in sin_pausas(x, ini, fin):
            c = {"src": round(s_, 3), "dur": round(e - s_, 3), "out": round(out, 3), "toma": ti}
            c.update({k: v for k, v in op.items()})
            cortes.append(c)
            mios.append(c)
            out += e - s_
            fuente = x
            if op.get("quien") == "agencia":
                if tel is None:
                    tel = efecto_telefono(dir_ / "audio48k.wav")
                fuente = tel
            pz = fuente[int(s_ * SR) : int(e * SR)].copy()
            # Pitidos sobre lo que no debe oírse (calles, nombres).
            for pa, pb in PITIDOS.get(reel, []):
                a0, b0 = max(pa, s_), min(pb, e)
                if b0 > a0:
                    i0, i1 = int((a0 - s_) * SR), int((b0 - s_) * SR)
                    pz[i0:i1] = pitido((i1 - i0) / SR)[: i1 - i0]
            pz[:f] *= np.linspace(0, 1, f)
            pz[-f:] *= np.linspace(1, 0, f)
            piezas.append(pz)
        # Palabras de esta toma al tiempo de salida (si una cae en una pausa recortada se pega al
        # corte siguiente). Las tapadas con pitido salen como "***".
        for w in palabras:
            m = (w["ini"] + w["fin"]) / 2
            if not (ini <= m <= fin) or not mios:
                continue
            c = next((c for c in mios if m <= c["src"] + c["dur"] + 0.02), mios[-1])
            d = c["out"] - c["src"]
            texto = w["p"]
            if any(pa - 0.05 <= m <= pb + 0.05 for pa, pb in PITIDOS.get(reel, [])):
                texto = "***" + ("," if texto.endswith(",") else "")
            pal = {"p": texto, "ini": round(max(c["out"], w["ini"] + d), 3), "fin": round(min(c["out"] + c["dur"], max(w["fin"] + d, c["out"] + 0.1)), 3)}
            for k in ("quien", "intro"):
                if k in op:
                    pal[k] = op[k]
            salida.append(pal)
    voz = np.concatenate(piezas)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(dir_ / f"voz-{version}.wav")], input=voz.astype(np.float32).tobytes(), check=True)
    destino = RAIZ / "src/inmobiliaria" / f"{reel}-{version}.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    datos = {"duracion": round(out, 3), "cortes": cortes, "palabras": salida}
    if reel in SOFA:
        datos["relleno"] = rellenos_sofa(reel, tomas, cortes, palabras)
    destino.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(cortes)} cortes, {out:.2f} s (de {sum(b - a for a, b, _ in tomas):.2f} s en tomas) → {destino}")
    print(" ".join(f"{w['p']}[{w['ini']:.2f}]" for w in salida))


if __name__ == "__main__":
    main()
