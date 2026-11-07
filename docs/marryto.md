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
6. Su Drive: cuando marca un video como hecho (✔ en WhatsApp) lo borra; **los que quedan en la
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

- 7-nov-2026: videos 25 y 26 ("tu próximo viaje": etiqueta + lista, sin imagen; el 25 con cámara rápida).

## Drive y descarga
- Carpeta de Drive de los brutos: `https://drive.google.com/drive/folders/1feFk0foB-ljHA8P64MA0SW4Hb9bkhpM9`
  (subcarpeta del día, p. ej. "11 NOVIEMBRE" → `Video N/`). Las instrucciones ahora son **documentos
  de Google**: gdown.download_folder falla con ellos → listar con `_download_and_parse_google_drive_link`
  y exportarlos con `https://docs.google.com/document/d/<id>/export?format=txt`.
- Formato "lista" (Shorts sin imagen): `etiqueta`, `etiquetaY`, `lista` [[col1], [col2]], `listaY`.

## Notas técnicas
- Desde el video 15 los brutos llegan en **4K 60 fps HEVC**: proxy a **1080×1920 y 60 fps** (`-r 60 -crf 17`).
  Un proxy de 1440 px hace que Chrome rechace los cuadros con el disco justo.
- Disco: si un render falla con "Failed to fetch … disk space", liberar cachés (`npm cache clean --force`,
  `uv cache clean`) antes de borrar nada de clientes.

## Pendiente
- Videos 20–22 (proxies y cortes listos): faltan las imágenes. 21 y 22 usan el mismo Short (9zB4fWcv46U).
- Videos 23–40.
