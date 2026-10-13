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
- **Audio provisional:** música y efectos sintetizados con `scripts/sonido_tucacas.py`
  hasta generarlos con ElevenLabs. Al tener la voz: `--voz voz-30s.mp3` agacha la música a
  −18 dB debajo de la voz (−10 dB donde no hay voz), efectos a −14 dB, total −14 LUFS.
