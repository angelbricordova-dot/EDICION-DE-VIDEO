# Short de prueba: "El pulpo tiene tres corazones" (10 s, 9:16)

Referencia de estilo: "Orcas are scared of this animal" (personajes de caricatura 3D en el mar
azul, vista de rayos X por dentro, subtítulos de una palabra con borde negro).
Código en `src/pulpo/` (personaje en `Personaje.tsx`, escenas en `Short.tsx`).

- Voz del cliente: `public/pulpo/audio/voz.mp3`. La clave de ElevenLabs no tiene permiso de
  speech-to-text: las palabras se reparten por caracteres entre las pausas medidas
  (`scripts/guion_pulpo.py` → `src/pulpo/guion.json`).
- Música y efectos de ElevenLabs en `public/pulpo/audio/` (ignorado por git).
- Dos versiones: `PulpoFinal` (voz, subtítulos y textos) y `PulpoLimpio` (`limpia: true`:
  sin voz, sin subtítulos y sin textos).

```bash
python3 scripts/guion_pulpo.py
python3 scripts/sonido_pulpo.py public/pulpo/audio/mezcla.wav
python3 scripts/sonido_pulpo.py public/pulpo/audio/mezcla-limpia.wav --limpia
ffmpeg -y -i public/pulpo/audio/mezcla.wav -b:a 192k public/pulpo/audio/mezcla.mp3
ffmpeg -y -i public/pulpo/audio/mezcla-limpia.wav -b:a 192k public/pulpo/audio/mezcla-limpia.mp3
npx remotion render PulpoFinal out/pulpo-final.mp4
npx remotion render PulpoLimpio out/pulpo-limpio.mp4
```
