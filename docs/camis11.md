# Reel Futbol Onze × Camis11

Brief: `brief-video-camis11.md` (subido en la conversación). Código en `src/camis11/`.

## Material (en `public/camis11/`, ignorado por git)

- Fotos de producto descargadas de camis11.com (fichas de cada camiseta) → `productos/`.
  `python3 scripts/recortar_camisetas.py public/camis11/productos public/camis11/recortes` les quita el fondo liso.
- Capturas de la web: `scripts/capturas_camis11.mjs` (vista de celular, oculta precios y "+1.000 clientes").
  La web a veces corta la conexión desde la nube; `marca/web-portada.png` es una captura buena de la portada.
- Logos: `marca/futbolonze-circulo.png`, `marca/logo-camis11-2.png` (blanco).
- Voz: Alejandro (`WWVK6dYMrl0ZHnHT7cRj`, Eleven Multilingual v2, estabilidad 0.45, similitud 0.8, estilo 0.3).
  Lee "Camis Once"; en pantalla sale CAMIS11 (`pantalla` en `src/camis11/locucion.json`).
- Música: ElevenLabs Music (`audio/musica-1.mp3`, 129 BPM). Efectos: `audio/sfx/*.mp3`.

## Pasos

```bash
python3 scripts/guion_camis11.py                         # escenas, montaje de música y efectos → src/camis11/guion.json
python3 scripts/sonido_camis11.py public/camis11/audio/mezcla.wav
ffmpeg -y -i public/camis11/audio/mezcla.wav -b:a 192k public/camis11/audio/mezcla.mp3
npx remotion render Camis11 out/camis11-reel-9x16.mp4
npx remotion still Camis11Portada out/camis11-portada.png
```

## Decisiones

- Sin precio tachado (el "79,99 € → 35,99 €" es un descuento aparente constante: riesgo de publicidad engañosa).
- Sin "+1.000 clientes satisfechos", sin escudos en primer plano como partners, sin jugadores reales.
- Etiqueta "PUBLI" arriba a la derecha (`publi: false` en las props para quitarla).
- La música se monta para que el drop caiga en "Para." y vuelva a caer en el código.
