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

## Versión con metraje real (`PulpoRealLimpio` / `PulpoRealFinal`)

Tomas de **NOAA Ocean Exploration** (dominio público), descargadas con la API de WordPress
del sitio (`https://oceanexplorer.noaa.gov/wp-json/wp/v2/media?search=octopus&media_type=video`)
a `public/pulpo/noaa/` y recortadas a `public/pulpo/clips/`:

| Clip | Fuente | Desde | Uso |
|---|---|---|---|
| `gancho.mp4` | ex2301-dive04-octopus-3-1920x1080-1.mp4 | 7,5 s | el pulpo camina hacia la cámara + 3 corazones |
| `rayos.mp4` | octopus-friday-on-saturday-1920x1080-1.mp4 | 18 s | primer plano del manto con rayos X |
| `nado.mp4` | ex2301-dive04-octopus-2-1920x1080-1.mp4 | 23,6 s | despega y nada a chorro; se congela |
| `camina.mp4` | ex1404-octopus1.mp4 | 14 s | se arrastra por el fondo (0,75×) |

Wikimedia Commons bloquea las descargas desde la nube (429); NOAA funciona.
El corazón es la foto del cliente recortada (`public/pulpo/fotos/corazon.png`).
