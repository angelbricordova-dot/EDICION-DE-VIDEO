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

Voces probadas (Voice Library, venezolanas): David `Aoh8oiCIlPke1wFxeNuK` (usada en la muestra),
Joseph `SIpDYvpsUzCaJ0WmnSA8`, Valeria `iyvXhCAqzDxKnq3FDjZl`, María `C96EBIpeVkPIxiJ0E16Y`.
