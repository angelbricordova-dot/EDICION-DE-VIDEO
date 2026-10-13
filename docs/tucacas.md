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
