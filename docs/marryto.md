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

## Hechos
- 6-nov-2026: videos 1–7 (Shorts QBN68drVF-8, aEM2afKl8rs, Vm1K2kO2rjY, H8v8zmf-LFU).

## Pendiente
- Videos 8 y 9: falló la descarga (disco lleno); volver a bajarlos.
- Confirmar con él si el título lo copia del Short o lo escribe distinto, y si quiere audio.
