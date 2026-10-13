# Comercial "Tu Día en Tucacas"

Brief: `marketing/video/BRIEF.md` del repo `angelbricordova-dot/AUTORIZADORA-DE-INGRESO-`
(rama `claude/sweet-darwin-vs9ng7`). Código en `src/tucacas/`.

## Pasos

```bash
scripts/traer_tucacas.sh                 # copia fotos, logo y grabaciones a public/tucacas (ignorado por git)
python3 scripts/sonido_tucacas.py 30s public/tucacas/audio/mezcla-30s.wav
ffmpeg -y -i public/tucacas/audio/mezcla-30s.wav -b:a 192k public/tucacas/audio/mezcla-30s.mp3
npx remotion render Tucacas30s out/tudia-30s-vertical.mp4
npx remotion still TucacasPortada out/tudia-portada.png
```

Igual para `60s`. Los tiempos de cada plano, rótulo, frase y efecto están en
`src/tucacas/guion-30s.json` y `guion-60s.json`; el video y el sonido leen los mismos.

## Decisiones

- **Precio:** no aparece. Las grabaciones muestran "$90 / noche" y "$180"; el calendario
  usa un cuadro recortado a 1080×1920 que deja ambos fuera, y el botón de WhatsApp es un
  rótulo propio.
- **TikTok:** no aparece (pendiente en el brief).
- **Audio:** música (ElevenLabs Music con un plan de secciones) y los 11 efectos del brief,
  generados en `public/tucacas/audio/el/` (ignorado por git). Mezcla:
  `python3 scripts/sonido_tucacas.py 30s salida.wav --musica public/tucacas/audio/el/musica-plan-30s.mp3 --efectos public/tucacas/audio/el --voz voz-30s.mp3`
  agacha la música a −18 dB debajo de la voz (−10 dB donde no hay voz), efectos a −14 dB,
  total −14 LUFS. Sin `--musica`/`--efectos` usa los sintetizados.
- **Voces candidatas** (Voice Library, acento venezolano, Eleven v3): Andrea
  `O5hbneAmtjLMgfg5UFIm`, Juana `5inFyqqaiwLzjXSTojIq`, Jania `xXmLO8kXWeHzmuDv00gw`,
  Maggie `bfzeMrk4OVi07v1gHaGo`.

## Versión "presenta la página" (`TucacasWeb30s` / `TucacasWeb60s`)

Enfoque pedido: mostrar la página nueva de reservas. Perfil de @aribnb.tucacas → toque al
enlace de la bio → la página se abre → fechas en el calendario → el apartamento por dentro
→ "Reservar por WhatsApp" → el mensaje sale listo en el chat → cierre de marca.

- **Voz:** Juana (`5inFyqqaiwLzjXSTojIq`, Eleven v3, prefijo `[cálida, sonriendo]`). Textos en
  `src/tucacas/web/locucion-*.json`; tiempos por frase en `voz-*.json`.
- **Música:** `public/tucacas/audio/el/musica-web-*.mp3` (tropical house, 112 BPM). El pulso
  (`web/pulso.json`) se usa para que los cortes caigan en el tiempo.
- **Guion:** `python3 scripts/guion_tucacas_web.py` genera `web/guion-web-*.json` (planos,
  cámara del teléfono, toques, textos y efectos) anclado a la voz y al pulso.
- **Pantallas del teléfono** (`web/pantallas.tsx`): perfil social genérico, navegador con las
  grabaciones de la página y chat de WhatsApp dibujado. El mensaje usa el mismo formato que
  `bookingMessage` de la página, sin la línea de precio.
- **Material nuevo del cliente** en `public/tucacas/fotos-nuevas/` (sala, habitación con el aire,
  sala de TV) y `public/tucacas/videos/` (los .MOV pasados a H.264 1080×1920 a 30 fps):
  `ffmpeg -i IN.MOV -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920" -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 -an OUT.mp4`
  (el recorrido de 464×848 lleva además `unsharp=5:5:0.8`).

```bash
python3 scripts/guion_tucacas_web.py
cd scripts && python3 sonido_tucacas.py 60s ../public/tucacas/audio/mezcla-web-60s.wav \
  --guion ../src/tucacas/web/guion-web-60s.json --voz ../public/tucacas/voz/juana-60s.mp3 \
  --musica ../public/tucacas/audio/el/musica-web-60s.mp3 --efectos ../public/tucacas/audio/el
ffmpeg -y -i public/tucacas/audio/mezcla-web-60s.wav -b:a 192k public/tucacas/audio/mezcla-web-60s.mp3
npm run render:tucacasweb60
```

Ojo con los clips: `OffthreadVideo` cuenta el tiempo desde el inicio de la composición. Cada
clip va dentro de una `Sequence` que empieza con su plano (`Clip` en `ComercialWeb.tsx`).
