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
    tamaño normal (`zoomMax` por defecto 1). La imagen y el texto se encogen lo justo para caber
    encima de su frente con separación. **Siempre un título** bajo la imagen ("Toca 2 veces para saber
    el resultado", "Yo:", …), variando entre videos del mismo Short.
12. Su Drive: cuando marca un video como hecho (✔ en WhatsApp) lo borra; **los que quedan en la
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

## Hechos
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
- 61, 64–66, 70–72, 76–78: esperar imágenes de Angel.
