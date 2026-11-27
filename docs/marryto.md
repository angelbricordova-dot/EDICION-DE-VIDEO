# Marryto Show (Fernando García): shorts de reacción en serie

Contrato firmado el 5-nov-2026 (renovación mensual): **10–15 videos al día** mientras haya brutos,
**1 $ por video**, pago mensual por PayPal/Wise, entrega en 24–48 h. **Penalización: −2 $ por cada
día de retraso; hora límite de entrega 5:00 a. m. (Venezuela).** Avisar cuando estén subidos.
Confidencialidad 2 años; no editar para nichos que compitan con él.

## Formato (su referencia `public/marryto/referencia/whatsapp.mp4`)
- Franja blanca arriba con el título del Short original (la parte clave en rojo).
- Debajo, la imagen del Short (acertijo, "encuentra las diferencias", etc.) a todo el ancho.
- Abajo, su reacción recortada con **"YO:"** blanco con contorno negro.
- **Sin audio** (él pone el sonido al subirlo).

## Material
- Drive "MARRYTO > SHORTS > <fecha>": carpetas `Video N` con el bruto (.mov 4K vertical) y un Word
  `Instrucciones.docx` que solo trae el enlace del Short de YouTube. Normalmente 2 brutos por Short.
- La imagen del Short sale de su **miniatura vertical** de YouTube:
  `https://i.ytimg.com/vi/<id>/oardefault.jpg` (1080 × 1920; se baja sin problema, el video no).

## Flujo (automático salvo el recorte de la imagen)
1. Bajar la carpeta del día (gdown) → `public/marryto/brutos/`; proxy 1080×1920 h264 →
   `public/marryto/proxies/v<n>.mp4`.
2. `scripts/marryto/analizar.py <n>…` (OpenCV 4 aparte): detecta su cara y recorta el principio
   (acomodando la cámara) y el final; guarda inicio/fin y encuadre en `src/marryto/videos.json`.
3. Bajar la miniatura de cada Short (`public/marryto/shorts/`), mirar dónde está la imagen y anotar
   en `videos.json`: `short`, `recorte` [x, y, ancho, alto] en la miniatura, `titulo`, `rojo`.
4. Render: `npx remotion render Marryto<n> … --muted` → `out/marryto/enviar/marryto-video-<n>.mp4`.

## Recorte del bruto (corrección de Angel, video 1)
- Quitar **2 s al principio** (se acomoda para "actuar") y **2 s al final** (va a apagar la cámara)
  además de lo que detecta `analizar.py` (ya lo aplica: `MARGEN_INICIO`, `MARGEN_FIN`). Revisar
  siempre el primer y el último segundo de cada video antes de entregar.

## Formato "superpuesto" (corrección del video 1, 6-nov)
- Como el Short original (`public/marryto/referencia/ref2.mp4`): su reacción a pantalla completa,
  la imagen del acertijo arriba (la manda Angel; p. ej. la de Navidad en vez de la de Halloween),
  y el mismo texto del Short en blanco con borde negro debajo (Montserrat 700). **Sin "YO:"**.
  En `videos.json`: `"estilo": "superpuesto", "imagen": "marryto/material/<archivo>"`.

- Video 2 (referencia del Short "¿Funcionó?"): imagen **más pequeña, sin ocupar todo el ancho**
  (caja ≈ 683 px de ancho centrada, arriba a 36 px) y **sin texto**. La imagen se recorta de la
  miniatura del Short incluyendo su título. En `videos.json`: `"caja": [x, y, ancho]`, `"sinTexto": true`.
  Cada Short tiene su propio aspecto: copiar las medidas de su referencia.

## Reunión con Fernando (6-nov) — reglas que aplican a TODOS
- **Exportar en 4K 60 fps** (2160×3840): composición a 60 fps y `--scale=2`; él graba 1080 a 30 fps.
  Render `--crf=16 --muted --concurrency=2` y compresión h264 `-crf 20 -maxrate 30M` (≈ 20–25 MB).
  Script: renderizar uno por uno y borrar el intermedio (el disco va justo).
- **Duración 6–7 s** (estándar); 10 s máximo solo en casos muy puntuales. Si el bruto es largo,
  **cámara rápida hasta 1,5×**: `tiempo()` en `Reaccion.tsx` (`OBJETIVO = 6.5`, `MAX_VEL = 1.5`)
  calcula la velocidad y la duración; `Composiciones.tsx` la usa.
- Ritmo muy dopamínico: que aparezca **ya señalando o mostrando**, sin arranque muerto.
- **Sin marca de agua.**
- La imagen de arriba debe ser **distinta a la del Short original y de mayor calidad**: la manda
  Angel (generadas con Gemini) → `public/marryto/material/`.

## Reunión con Fernando (7-nov) — aplicar desde el video 20 (los 1–19 los dio por buenos)
1. **Empezar YA actuando** ("tenlo a fuego en la cabeza"): nada de cuadros en los que todavía se
   prepara o no ha levantado las manos (le pasó al video 2). Revisar cuadro a cuadro el arranque.
2. **Nunca taparle los ojos** con el texto o la imagen (le pasó al 15: "Dale 2 veces…" sobre los ojos).
   El pelo sí se puede tapar. La plantilla ya lo calcula: `finEncima()` + baja/amplía el video
   (`imgAspecto` con `scripts/marryto/medidas.py <n…>` al añadir la imagen).
3. **Cámara rápida solo de vez en cuando** (~20 % de los videos, cuando toque): `"rapido": true` en
   `videos.json`. Los demás a velocidad normal y 6–7 s (se corta el final).
4. **Imágenes con IA de él** (diferencias): que no sean iguales entre videos: **otra pose, otra
   camiseta (p. ej. rosa), otro estadio/lugar, otro todo**. Avisar a Angel al pedirlas.
5. Cambiar siempre la imagen del Short (en el 10 quedó la captura original; lo aceptó esta vez).
6. **Zona segura de las redes** (corrección del 25–26, 8-nov): nada de texto pegado a los bordes
   izquierdo/derecho (al subirlo se recorta un poco). Dejar ≥ 150 px a cada lado; puede tocar
   cuello y cuerpo, nunca los ojos. Lista: `listaMargen: 150`, `listaY` a la altura del cuello.
7. **Imagen y texto NO tan arriba** (audio del 8-nov sobre el video 33, "anótalo para los siguientes"):
   bajarlos hasta más o menos la mitad de las placas de YouTube (pueden taparlas), nunca taparle los
   ojos. `"bajar": 160` en `videos.json` (mueve imagen + texto juntos; la cara se recoloca sola).
   Aplicado desde el 34.
8. **Correcciones del 9-nov (molesto por repetirlas: revisar SIEMPRE antes de entregar):**
   - **Ojos nunca tapados y con SEPARACIÓN de la frente** en TODO el video, no solo en el primer
     cuadro: él levanta la cabeza y se acerca. `scripts/marryto/ojos.py` (MediaPipe) mide cuadro a
     cuadro lo más alto que llegan ojos y frente (`ojosY`, `frenteY`, `ojosX`); la plantilla deja 60 px
     de separación, zoom máx. 1,35 y, si no cabe, encoge un poco lo de arriba. Revisar 3 cuadros por video.
   - **Imágenes hechas desde cero en HD**: nunca una captura del Short (las sandías del 40 eran captura
     y se veía mal). Si la imagen que llega es una captura o se ve borrosa → pedir a Angel que la rehaga.
   - **Arranque**: empezar cuando está a punto de apuntar arriba o de hacer una acción (el 38 tardaba).
   - Si las instrucciones traen **audio** (el 36: "What would yours look like"), va sincronizado con el
     sonido que suena en el bruto (correlación con el audio del .mov) y el video empieza cuando arranca
     el sonido. `"audio"` en `videos.json` y se exporta sin `--muted`.
9. **Cambios de escena como el Short original** (correcciones del 10-nov, 47 y 52): cuando él graba
   dos tomas (cambia de camiseta), el video corta de una a otra en el MISMO segundo que el original
   (medirlo en la referencia) y cada toma lleva su texto ("Es 20" → "No, es 21"). `"tomas"` en
   `videos.json` + `"duracion"` = la de la canción. Audio de la referencia sincronizado.
   Si en su grabación DICE lo que hay que hacer (48: "pon el audio… y ahí haces la transición para que
   desaparezca"), hacerlo como la referencia (`"fundido"`: se funde con la habitación vacía).
   Transcribir siempre el audio del bruto: a veces trae instrucciones.
10. **Correcciones del 11-nov (audio de Fernando: "fíjate en los ejemplos")**:
   - **Exportar en 1080×1920 a 60 fps** (ya no 4K): `render1080.sh` (`--scale=1`).
   - **Tamaño de la imagen = el de la referencia.** Si en el Short la imagen ocupa media pantalla desde
     arriba, igual (`caja: [0, 0, 1080]`, `bajar: 0`); si es pequeña, pequeña. Medirlo en la miniatura
     antes de montar. Para que la cara quepa: `zoomMax` (hasta ~1,75), `separacion` y `proxyHD`
     (proxy 1440×2560 `v<n>-hd.mp4`, para que el zoom no se vea borroso). Nada cortado (piezas A/B/C).
   - **Nunca la misma imagen en los videos de un mismo Short** (3.ª vez que lo pide): en las de cálculo
     o "mueve tres números", cambiar el resultado, los números y los colores en cada video.
   - **Conteos: SIEMPRE uno MÁS de los que hay** ("si hay 5, pon que yo veo 6") para provocar comentarios.
   - **Copiar los textos de la referencia** (48: llevaba "Santi:"; ponerlo). Mínimo 6 s (47 quedó en 5).
   - Antes de seguir con videos nuevos, terminar sus correcciones.
11. **Sin zoom en el video** (13-nov: "queda raro, se ve demasiado cerca"): el video de él siempre a
    tamaño normal. Para que la imagen se vea GRANDE como en la referencia, **el video se desplaza hacia
    abajo** (`"desplazar": true`, `caja: [0, 0, 1080]`): la imagen va a todo el ancho arriba, tapa la
    parte de arriba del video, y su frente queda bajo el título con separación. Nunca encoger la imagen.
    No tocar los videos que ya tienen ✅ (41 y 42 se quedan como estaban). **Siempre un título** bajo la imagen ("Toca 2 veces para saber
    el resultado", "Yo:", …), variando entre videos del mismo Short.
12. **Revisar SIEMPRE el último segundo** (13-nov, video 70): el final se corta justo antes de que se
    incline o se acerque a la cámara para apagarla. Mirar el último segundo a 10 fps en cada video.
13. **Cambios del 16-nov**:
    - Las carpetas nuevas traen **un bruto con 3–4 tomas** del mismo Short, cada una con otra camiseta
      (p. ej. "Video 100-103"). Se separan por el cambio de color de la camiseta y cada toma es un video;
      el proxy se enlaza como `v100.mp4 … v103.mp4` (`ln`, mismo archivo).
    - **Imágenes más grandes** en general (media pantalla si hace falta).
    - **Todos los videos llevan la música del Short de referencia** (`"audio"` en `videos.json`;
      `render1080.sh` exporta con sonido si lo tiene). YouTube bloquea la descarga desde aquí ("Sign in to
      confirm you're not a bot"): Angel pasa los mp3 de cada Short.
14. **Zona segura arriba** (16-nov): TikTok/IG/YouTube tapan ~150 px de arriba → la imagen empieza en
    `caja[1] ≥ 150` y sin huecos vacíos dentro de la imagen (recortarla al contenido).
    **Música**: buscar el tramo del Short en la canción completa (palabras de whisper en inglés/español);
    si el Short va "slowed", medir la velocidad con dos palabras (p. ej. 100–103: ×0,909 con `atempo`)
    y nivelar el volumen (~ −12,5 dB de media).
15. Su Drive: cuando marca un video como hecho (✔ en WhatsApp) lo borra; **los que quedan en la
   carpeta son los únicos pendientes**.

## Imágenes y textos por video (lote del 6-nov)
| Video | Imagen | Texto |
|---|---|---|
| 1 | navidad-v1.webp | Toca 2 veces para encontrar el 4º objeto |
| 2, 3 | funciono-hd.jpg | — |
| 4 | sandias.jpg | Yo veo 16 sandías... y tú? |
| 5 | bananas.jpg | Yo veo 16 bananas... y tú? |
| 6 | estadio-rojo.jpg (Marryto en estadio, diferencias) | Encuentra las 3 diferencias |
| 7 | estadio-verde.jpg | Encuentra las 3 diferencias |
| 8, 9 | ojos-80.png | Toca 2 veces y cierra los ojos al 80% |
| 10, 11 | senal-bateria.png | Cuál eres tú ahora mismo? |
| 12 | sopa-balon.jpg (sopa de letras "balón") | — |
| 13 | sopa-perro.jpg ("perro") | — |
| 14 | gatos.webp | Toca 2 veces y cierra los ojos al 80% |
| 15 | senas.jpg (abecedario de señas) | Dale 2 veces en la 1ra letra de tu nombre |
| 16 | numeros-20.jpg (mueve tres números = 20) | — |
| 17 | cuarto-objeto.jpg (encuentra el 4º objeto) | Toca 2 veces para "ver" el cuarto objeto |
| 18 | error-dias.jpg (¿puedes encontrar el error?), pequeña arriba | — |
| 19 | yate-diferencias.jpg (Marryto con IA en un puerto, 3 diferencias) | Encuentra las 3 diferencias |



## Reglas de Fernando (21-nov-2026) — OBLIGATORIAS, avisó que no las repetirá
- **Calidad antes que cantidad:** máximo **10 videos al día** (contrato 10–15), revisados uno por uno. Prefiere 10
  bien que 30 con 28 mal.
- **Letras:** nada de letra simple. Fuente **Cocogoose** (la de sus retos/entrevistas), gordita, con **trazo
  (borde) + sombra + resplandor**, muy llamativa y legible (son para niños). Referencia: "ESPERA A VER ESTO".
  En su Premiere: trazo, sombra paralela, resplandor, sombra blanca, temblor de entrada y desfase rojo/azul.
- **Emojis de iPhone** (Apple), nunca los de Google/Noto.
- **Nada de cortes feos arriba:** prohibido ver su fondo/la imagen encima y arriba la franja del video. Si la
  imagen no llega arriba: imagen completa a todo lo ancho **pegada arriba (y=0)** y abajo su cara SIN cortes.
  **Corrección 23-nov: tampoco franja negra arriba** (162–167, 170): `caja=[0,0,1080]`,
  `textoY = 1080·imgAspecto + 14`, `bajar=0`. Igualar o mejorar la referencia, nunca peor.
- **Duración (23-nov):** los de imagen + reacción, **6–7 s**. 168 empieza cuando apunta arriba con el dedo
  (≈23,5 s); 169: el texto rápido del medio termina en "perderse." 
- **Duración y ritmo como el ejemplo** (168–169 duran lo del Short; 161 al ritmo de la música; 179–181 las
  transiciones al beat).
- **Leer bien las instrucciones** (p. ej. cámara lenta en 187–188).
- Si el video de arriba es de mala calidad, rehacer sus letras por encima (189–190).

## Correcciones de Fernando (23-nov, tarde) — "HAZLO IGUAL QUE EL EJEMPLO"
- **Sombra que se vea** (lo pidió 5 veces): `estiloCoco` lleva sombra paralela abajo-derecha más allá del trazo
  + halo oscuro difuso doble (como el ejemplo del 161). Comprobar a tamaño real que se note.
- **Copiar el ejemplo tal cual:** mismos textos (también el de arriba de la imagen, con su ortografía),
  misma composición. 162–164: franja negra arriba CON el título "SON 1 O 2 IMAGENES??", imagen a todo lo
  ancho y "TOCA 2 VECES Y DESCUBRELO" abajo. 170–172: franja negra arriba (la imagen no llega arriba).
  Esto manda sobre la regla del 23-nov de quitar la franja: la franja negra vale si el ejemplo la tiene.
- **168–169:** duración del ejemplo (58,9 s) y **el mismo texto** (`scripts/marryto/texto_168.txt`, 321
  palabras sacadas cuadro a cuadro del Short). El Short pone "300PPM" pero va a ~356 ppm: se copia igual
  (cuenta atrás 3-2-1 hasta 4,53 s). Su bruto son **2 videos en uno**: **168 = camiseta roja** (28,2–58,2 s
  del bruto; 24-nov: desde 30,05, cuando ya apunta arriba) y **169 = amarilla** (1,95–26,9 s, ya apuntando), cada uno **en cámara lenta** hasta durar 58,9 s (proxies
  `v168.mp4`/`v169.mp4` hechos con `setpts` + `framerate` a 60 fps; ya no son enlaces al bruto).
- **179–181: cada cambio de foto en el INICIO DE COMPÁS** (`scripts/marryto/ninos_179_181.py`): compases de
  2,055 s (bombo + palmada) en 6,25 8,30 10,36 12,41 14,47 16,52 s de la canción; la foto entra de golpe con un
  "punch" de zoom. (25-nov: a mitad de compás no vale, Fernando lo nota.) "Niños:" en **azul**, "Padres:" en **rojo**.
  26-nov: la canción **desde el principio** como en la versión anterior (gustaba más) y cambios en 4,19 6,25 8,30
  10,36 12,41 14,47; el título de arriba también con "niños" azul y "padres" rojo (`textos[].colores`).
  180 usa las mismas fotos del Short original (recortadas, etiquetas en Cocogoose).
- **161:** la canción es el audio del Short (8,06 s): el video no puede pasar de ahí o vuelve a empezar.

## Reglas nuevas (17-nov)
- **Música en bucle:** el Short se repite al terminar, así que la música **no puede acabar a mitad de
  frase ni de golpe**: el video termina en un **hueco** de la canción (pausa entre frases). Buscar los
  huecos con `python3 scripts/marryto/huecos.py <música> 5.5 10.5` (y la letra con whisper) y fijar
  `duracion` para que el corte caiga ahí, sin pasar del momento en que se acerca a la cámara.
- **Sin fundido final (18-nov):** la música suena hasta el último cuadro (el Short se repite en bucle);
  la pista siempre más larga que el video.
- **Textos (corrección de Fernando, 18-nov):** el título como "Adivina el personaje": recuadro blanco por línea,
  **pegadas sin hueco**, letra blanca con borde negro. Los números/opciones en pastillas como "Dale like a
  este vídeo sin usar", **del color de su ropa** (camiseta roja → pastilla roja y letra blanca; amarilla →
  amarilla y letra negra; verde → verde). Que se vea muy llamativo y jugar con esto en cada video sin que lo pidan.
- **Si la referencia muestra primero un video y después la reacción (159–160), copiar esa estructura** (`intro`:
  video del Short a pantalla con su texto, luego la reacción con sus textos por toma; la música sigue).
- **Inicio:** empezar en el gesto clave (apuntando arriba, acercándose a la cámara, tocándose la barba),
  no cuando se acomoda el pelo o se prepara.
- **Títulos que piden interacción:** siempre del tipo "Toca 2 veces para verlo", "Dale 2 toques y
  compártelo", "Dale like si…" (engagement), nunca solo una pregunta.
- Si la referencia lleva un **video** arriba, todos los videos de esa carpeta llevan video (variantes:
  espejo, otro encuadre, color), nunca una foto fija.
- Duración: la de la referencia si su coreografía es más larga (115–117 ≈ 10 s, incluye el "esperen"
  y el señalar abajo).

## Hechos
- 20-nov-2026: lote 161–190 (menos 181). Música sacada de cada Short (Jingle Bell Rock, Jumper, wrap slowed,
  Run it back, audio propio). `outro` (Reaccion.tsx): tras su reacción, el video del Short a pantalla con su
  audio (189–190 rayo, 179–180 slideshow niños/padres). No voltear imágenes con texto o logos (Tangled).
  Pendiente: 181 con otras fotos niños/padres.
- 19-nov-2026: lote 136–160 (25 videos). Imágenes de Angel (Gemini) + propias (tenedor, lápices, personas,
  días, ¿Funcionó? c/d). 157–158 pastillas del color de la camiseta (`pastillasFondo`/`pastillasColor`).
  159–160 video de los pisos arriba (solo los primeros 6,8 s del Short; después sale la reacción del otro).
  Música: 136–138 y 141–143 con Farruko a falta de sus Shorts (confirmar). Sin fundido final, corte en hueco.
- 16-nov-2026: lote 104–135 (carpetas "Video 104-107" … "Video 134-135", una toma por camiseta).
  - Tomas separadas por color de camiseta; inicio = cuando ya actúa (revisado a 5 fps los 2 primeros
    segundos), final antes de acercarse a la cámara (ancho de la cara con MediaPipe). Si arranca quieto,
    Angel lo corrige: 105 "ya con el teléfono", 106 "ya acercándose con el dedo", 107 "teléfono en la mano sorprendido".
  - 104–107: arriba va el **video** del Short (no una foto): `imagen` puede ser un `.mp4` (se reproduce
    sin sonido). 104 original, 105 espejo, 106–107 foto de calle de Angel. Música = audio del propio Short.
  - 115–117: sin imagen, textos libres encima del video con `capa` (PNG transparente 1080 × 1920, no
    mueve nada); años alternando edades de niños (2016/2017, 2015/2018, 2014/2019).
  - Imágenes hechas aquí (`graficos.mjs`): piel11-a/b/c, dos-seis, examen-a/b/c, ok-a…d, funciono-a/b,
    borroso-a/b/c, anios-115…117. De Angel (Gemini): obj-garaje/jardin/cocina (+ tienda de repuesto),
    obj-gatos (+ b/c/d espejo y encuadre), obj-dona (135), obj-spiderman (134).
  - Música: Angel manda los Shorts bajados (savetube) y se empareja el audio con las canciones completas
    por correlación espectral (`scratchpad`, probando atempo 0.909/1/1.1): wrap slowed (atempo 0.909,
    desde 130.65 s) → 108–114; "Dame hombro" desde 10.08 s → 115–117, 122–124, 127–130, 134–135;
    "Celular do vovô" desde 16.81 s → 118–121, 125–126, 131–133. Volumen medio −12 dB.
  - 111 trae 2 tomas (amarilla y morada) para un solo video: se usó la morada.
- 6-nov-2026: videos 1–14 entregados; rehechos el mismo día en 4K 60 fps, 6,5 s, con las imágenes nuevas.

- 7-nov-2026: videos 15–19.

- 11-nov-2026: lote 61–99 (carpeta "11 NOVIEMBRE"). Entregados 62, 63, 67–69, 73–75, 79–99. Imágenes
  dibujadas por Claude (`scripts/marryto/graficos.mjs`, `scripts/marryto/lote61.py`): letras RAMO/COLA
  (63: "otras letras"), ochos (14), palabras PERRO/GATO/LIBRO (74–75: "no PERRO") y CERDO/CIERVO/
  CANGURO (79–81: "no COCO"), alfabeto sin Q, tono de piel, nombre japonés, pilares, perrito; listas de
  Navidad (82) y trabajos (94). Vacas (88–90) de Angel. Arranques afinados a 10 fps.
  Pendientes por imagen: 61 (supermercado), 64–66 (camiones), 70–72 (loros + número), 76–78 (túnel).
  Las imágenes pegadas en el chat no llegan como archivo: pedirlas en .rar/Drive o una por mensaje.
- 10-nov-2026: 34 y 40 rehechos con imágenes HD nuevas (gallinas-hd, sandias-hd). Videos 41–60:
  41–43 cubo-pieza.jpg ("Toca 2 veces para descubrirlo:"), 44–46 numeros-16.png, 47 triangulos-amarillo.png
  + canción (`audio/v47.mp3`, desde el primer cuadro; su grabación no tiene sonido), 48 teclado-nombre.png,
  49–51 calculo-17.png, 52 dos-ceros.png ("La respuesta es D"), 53–55 libro-edad.png, 56 árbol de
  hámsters / 57 perros / 58 gatos (Angel: "distintas imágenes y cambia el texto según la imagen"; el
  número = animales que se ven), 59 sala-objeto.png (llegó dañada en el .rar: reparada, cojín más
  pequeño), 60 cocina-objeto.jpg. Cámara rápida: 48, 52, 58.
- **Gráficos sencillos dibujados por Claude** desde cero en HD: `scripts/marryto/graficos.mjs`
  (HTML → Chromium 2×, fuentes incrustadas en base64, otros colores que el original).
- 9-nov-2026: videos 34 (gallinas.jpg, "Cuántas 🐔 ves? Yo 9"), 35 (lupita.jpg), 36 (solo texto
  "💛 ARRYT 💛", `sinImagen`), 37 (ciudad.jpg, cámara rápida), 38 (senales-redes.jpg, "Cuál es el tuyo?"),
  39 (papel.jpg, "Cuántos 🧻 ves? Yo 11"), 40 (sandias-40.jpg, "Cuántas 🍉 ves? Yo 10").
- 8-nov-2026: videos 27 (japones-amarillo.jpg), 28 (cuarto-objeto-sala.jpg, "Toca 2 veces para encontrar
  el 4° objeto"), 29–30 (pastillas "Dale like a este video sin utilizar:"), 31–32 (iq-test.jpg; el 32 con
  cámara rápida), 33 (sopa-manzana.jpg). Instrucciones del 27 y 33: "igual pero con otro color".
- 8-nov-2026: videos 20 (moais.jpg, "Cuántos 🗿 ves? Yo 11"), 21–22 (princess-hd.jpg, texto amarillo
  "*Yo luego de darme cuenta:💀*", `textoColor`), 23–24 (barcos-hd.jpg, "Toca 2 veces y cierra los ojos al 80%").
- 7-nov-2026: videos 25 y 26 ("tu próximo viaje": etiqueta + lista, sin imagen; el 25 con cámara rápida).

## Drive y descarga
- Carpeta de Drive de los brutos: `https://drive.google.com/drive/folders/1feFk0foB-ljHA8P64MA0SW4Hb9bkhpM9`
  (subcarpeta del día, p. ej. "11 NOVIEMBRE" → `Video N/`). Las instrucciones ahora son **documentos
  de Google**: gdown.download_folder falla con ellos → listar con `_download_and_parse_google_drive_link`
  y exportarlos con `https://docs.google.com/document/d/<id>/export?format=txt`.
- Formato "pastillas" (p. ej. "Dale like a este video sin utilizar:"): `pastillas` [[izq], [der]],
  `pastillasY`, `pastillasPaso`, `pastillasMargen` (≥ 140, zona segura). Sin imagen ni miniatura de fondo.
- Formato "lista" (Shorts sin imagen): `etiqueta`, `etiquetaY`, `lista` [[col1], [col2]], `listaY`.

## Notas técnicas
- Desde el video 15 los brutos llegan en **4K 60 fps HEVC**: proxy a **1080×1920 y 60 fps** (`-r 60 -crf 17`).
  Un proxy de 1440 px hace que Chrome rechace los cuadros con el disco justo.
- Disco: si un render falla con "Failed to fetch … disk space", liberar cachés (`npm cache clean --force`,
  `uv cache clean`) antes de borrar nada de clientes.

## Pendiente
- Siguiente carpeta: "Video 161" en adelante (hasta 205-206 en el Drive).

## Tercera tanda 182–190 (26-nov) — copiadas del ejemplo
- 182–184: imagen a todo lo ancho pegada arriba y el mismo texto del ejemplo en los tres ("Toca dos veces y
  "encuentra" el 4 objeto"). 185–186: tarjeta ¿FUNCIONÓ? arriba y "Toca 2 veces y prueba". 26-nov: imagen más baja (820 px) para que se le vea más; el fondo de la tarjeta se alarga a los lados (`funciono-c-ancho.png`) para no dejar negro.
- 187–188: Tangled arriba a todo lo ancho, el texto del ejemplo (😭) y "Pista: Fíjense en el cabello." sin fondo;
  **todo en cámara lenta ×1,66** como el ejemplo (9,98 s, termina en el hueco de 9,99 s de la música). Proxies
  `v187.mp4` (amarilla, 1,1–7,1 s del bruto) y `v188.mp4` (roja, 12,2–18,2 s).
- 189–190: el video del rayo con sus letras rehechas en Cocogoose (`outro.letras`); las originales se tapan con
  el propio video desenfocado y bordes difuminados (`outro.tapar`). Tiempos de cada subtítulo sacados cuadro a cuadro.

## 191–200 (26-nov) — copiados del ejemplo
- Instrucciones de los Docs revisadas enteras (texto, imágenes, formato): solo el enlace, y en 195 el título
  "Espera a ver el final 😯". Máximo 10 por día: 191–200 primero; 201–205 después (faltan sus Shorts de ejemplo).
- 191–192: su reacción con el título 7,3 s y luego el pase de fotos del ejemplo (`material/lugares.mp4`) con sus
  etiquetas tapadas por las nuestras en Cocogoose (`outro.letras[].caja`). 193–194: reacción con el título entre
  comillas. 195: él arriba (1080 px, sigue su cara al acercarse) y el bebé abajo (`m195-comp.mp4`), título pedido.
  196–197: reacción + Moana del ejemplo a pantalla completa. 198: niños ahora (ejemplo) → su primer plano con el
  azúcar → él comiendo (ojos abiertos) → el salto del ejemplo, con las etiquetas en Cocogoose (`m198-comp.mp4`).
  199–200: franja negra con el título, los bailarines del ejemplo ampliados y su reacción debajo (`m199-comp.mp4`).
- La música de cada uno es la del Short de ejemplo, en el mismo tiempo (`audio/m<grupo>.mp3`, −12,3 dB).

## 201–205 (26-nov) — copiados del ejemplo (Shorts que mandó Alejandro en un .rar)
- **Corregido 27-nov (me equivoqué de ejemplo):** 201–202 = el tuit de la silla con "Yo después de darme cuenta:" (toma roja 6,9 s / azul 21,8 s, se agarra la cabeza) y 205–206 = la ilusión con "Cuál se está moviendo?". Comprobar SIEMPRE el ejemplo de cada carpeta con el enlace del Doc, no adivinar por el contenido.
- (antes) 201–202: ilusión arriba (del ejemplo) y su reacción abajo con "Cuál se está moviendo?". 203: su reacción a
  pantalla completa con el recuadro de las manos y "Solo el 0.1% de la gente puede hacer esto:". 204: cartel
  leetspeak arriba y abajo en dos mitades "Gamer" (toma azul, tranquilo) y "No Gamer" (amarilla, frustrado).
  205 (azul) –206 (roja): el tuit de la silla arriba y "Yo después de darme cuenta:" con su reacción.
- `outro.letras[].x` para textos no centrados (Gamer / No Gamer). Composiciones en `material/m20X-comp.mp4`.

### Correcciones 191–200 (26-nov)
- **Salieron sin sonido:** `render1080.sh` solo miraba `audio`; ahora también `outro.audioTodo`.
- 192 empieza ya apuntando arriba (12,7 s). 196 empieza cuando él ya habla (1,8 s), con SU voz y la canción
  "A1 – It's just a burning memory" (`audio/burning-memory.mp3`, desde el inicio como el ejemplo) por debajo.
  197: la misma canción + una voz de IA al principio ("Éramos demasiado jóvenes para darnos cuenta", como el
  ejemplo) — voz Richard (eleven_v3, `[sorprendido]`, toma 1 de 2, ~100 créditos con permiso del 26-nov): `voz/v197-1.mp3`. 198: el audio original del ejemplo al principio.
  199–200: recorte limpio de los bailarines (y 81–253 del Short a 360 px: sin restos del título ni del texto de
  abajo); 200 empieza con la cara de confundido (18,3 s).

### Correcciones 27-nov (191–204)
- **Letras sin desvanecimiento** (rompe el bucle): `outro.letras` aparecen de golpe.
- 191–192: intro de 3 s y **cada foto a la par con su voz** (`scripts/marryto/lugares_191.py`: cada foto dura su
  frase, entra cuando la voz la nombra). 28-nov: el audio del Short sigue sin cortes (38,4 s, como el original); intro 4 s.
- 195: su reacción cuando el bol **cae al suelo** (28-nov: el video del bebé a 1,1× para que caiga a 10,6 s; toma desde 6,45 s; dura 12,7 s como el Short, la canción NO se repite).
  final y el audio sigue con el inicio del Short, como el bucle).
- 198: sin dejar la cuchara de vuelta (azúcar 3,8–6,25 s) y luego el azúcar que se le cae al comer (14,3–15,82 s).
- 201–202: la reacción empieza cuando aparece la chica sentada (1,6 s): roja desde 5,66 s, azul desde 18,1 s
  (sonríe y luego se da cuenta, como el ejemplo).
- 204: amarilla más centrada y las dos caras un poco más abajo (más margen bajo "Gamer / No Gamer").
- **191–192 rehechos (28-nov, a petición de Alejandro):** voz propia de Richard (ElevenLabs, `scripts/marryto/locucion_191.json`,
  toma 1 de 2, ~700 créditos con permiso) frase a frase, cada foto ≥ 3,4 s con su frase dentro (entra 0,35 s tras el
  cambio y acaba antes del siguiente), música "It's just a burning memory" debajo, mezcla con numpy a −14 LUFS; 40,2 s.

## 206–230 (28-nov)
- Ejemplos emparejados por el **título real del enlace del Doc** (oEmbed de YouTube), nunca adivinando.
- Imágenes de arriba rehechas en alta (los Shorts vienen a 360 px): 209–210 lista de meses (Montserrat 900 + emoji 👶 de
  iPhone, `material/meses.png`), 211–212 ajedrez con el título rehecho (`ajedrez-titulo.png`), 213–214 uniformes a todo lo
  ancho **sin espacio en blanco** (pedido del Doc), 215–216 cabeza + "TOCA DOS VECES Y GIRA TU TELÉFONO" (`cabeza-texto.png`).
- 207–208: pide imágenes de IA "en otro contexto" (Marryto en GTA 6 con Lucía y vestido de Superman): prompts para Gemini.
- 207–208 (28-nov): imágenes de Gemini de Alejandro (GTA 6 con Lucía / Superman), A a la izquierda y B a la derecha
  (`material/dif-gta.jpg`, `dif-superman.jpg`). Gemini solo aplicó 2 diferencias de 3: la tercera la puse yo (cartel
  pequeño de VICE CITY a verde / zapatilla de abajo a verde) para que "Encuentra las 3 diferencias" sea verdad.
