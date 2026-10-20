# TuBodega: videos de lanzamiento

Material: `tubodega-videos.zip` (carpeta `marketing/` del repo `angelbricordova-dot/la-bodega-de-luis`,
rama `claude/sweet-cannon-j86icu`): brief, guiones, indicaciones de ElevenLabs, 27 pantallas y 5 clips
reales de la app. Copiados a `public/tubodega/` (ignorado por git). Código en `src/tubodega/`.

- Marca: verde `#2F9E6E`, tinta `#17201C`, fondo `#F4F7F5`, Plus Jakarta Sans 800/600.
- Zonas seguras: 220 px arriba, 420 abajo, 90 a la derecha.
- Prohibido: "factura", "SENIAT", testimonios o cifras inventadas, nombrar marcas de productos.
- Pendiente antes de exportar finales: número de WhatsApp, tasa BCV del día (recapturar con
  `TASA=… node marketing/capture.mjs` en el repo de la app) y confirmar precios.

## V1 · Promo 30 s

```bash
python3 scripts/voz_elevenlabs.py src/tubodega/locucion-v1.json --voz <id> --modelo eleven_multilingual_v2 \
  --estabilidad 0.4 --similitud 0.8 --estilo 0.25 --salida public/tubodega/voz/v1-<voz>.mp3 --tiempos src/tubodega/voz-v1.json
ffmpeg -y -i public/tubodega/voz/v1-<voz>.mp3 -af atempo=1.06 public/tubodega/voz/v1.mp3   # y dividir tiempos /1.06
python3 scripts/guion_tubodega.py            # marcas de la voz → src/tubodega/guion-v1.json
python3 scripts/sonido_tubodega.py v1 public/tubodega/audio/mezcla-v1.wav
npx remotion render TuBodegaV1 out/tubodega-promo-30s.mp4 --props='{"audio":"tubodega/audio/mezcla-v1.mp3","whatsapp":"0414-…"}'
npx remotion still TuBodegaV1Portada out/tubodega-promo-30s-portada.jpg --image-format=jpeg
```

**Voz aprobada: Richard** `Cpm6N9BNC1M75bYS7kO1` (latino neutro, redes), `eleven_v3`, estabilidad 0.5,
similitud 0.8, estilo 0.25, prefijo `[cercano, sonriendo]`. Habla rápido: cada frase se coloca al inicio de su
escena. Usar la misma en todos los videos.

Datos confirmados: WhatsApp **+58 426-211-1890**, prueba **7 días gratis**, precios del brief OK,
tasa BCV del 20/10/2026 **881,07** (pantallas 01–24 y clips regenerados con `TASA=881.07 node marketing/capture.mjs`;
las originales a 36,50 quedan en `public/tubodega/originales-tasa-36.50/`). Las pantallas 25, 26, 28 y 29
(prueba de 7 días) vienen del repo de la app y muestran la tasa 36,50.

## Ronda 1 de correcciones de la V1

- **Subtítulos (estilo 2):** Nunito Black blanca con contorno oscuro, máx. 22 caracteres; la
  palabra que se dice se pinta verde menta y la clave lleva un marcador verde recto detrás.
- **Voz:** la frase 4 se regrabó aparte ("Pago Móvil. Punto. Sel. Efectivo. O fiado.") y se le
  alargaron las pausas (~0,3 s) para que "punto" se distinga. La toma anterior quedó en
  `public/tubodega/voz/v1-ronda1.mp3`.
- **0:03 refresco:** botella genérica (sin marca) animada sobre el teléfono; el marco de escaneo
  se ajusta y pita en "escaneas", y el clip real muestra "Refresco 2L agregado". Para eso se
  recapturó la app renombrando en la tienda de ejemplo "Coca-Cola 2L" → "Refresco 2L" y usando
  su código para la cámara falsa (solo clip 01 y pantallas 01, 02, 03, 07, 09, 10; los
  originales con la pasta están en `public/tubodega/originales-pasta/`). El cuadro del clip se
  congela en el fotograma 19 (sin código en la cámara) hasta el pitido.
- **0:08:** el titular crece cuando entra cada línea (ya no deja espacio blanco vacío) y salen
  monedas de $ y Bs a los lados que caen en la fila del vuelto.
- **Cierre:** transición en círculo al verde de la marca, confeti en "7 días gratis", WhatsApp
  que late, el teléfono flota y pasa por venta → venta registrada → cuadre, e insignias
  (Escanea, $ y Bs, Fiado, Ticket, Sin internet) cuando termina la voz.
