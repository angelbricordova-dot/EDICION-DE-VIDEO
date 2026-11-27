# Pollichris (FC27): video de prueba "playstyles" (cliente nuevo, 27-nov-2026)

Creador de contenido de EA FC (Instagram @pollichris; YouTube, TikTok, X y Twitch). Pidió una **prueba**:
"BUSCO CREATIVIDAD para MEJORAR mi CONTENIDO". El estilo tiene que ser **una mezcla** de sus Reels y de un
ejemplo que mandó (Reel de otro creador, Team Liquid, en inglés).

## Material (`public/pollichris/`, ignorado por git)
- `juego/camara.mp4` (1920×1080 60 fps, 61,7 s): él a cámara diciendo el guion entero.
- `juego/empeine.mp4` (36,4 s) y `juego/trivela.mp4` (31,9 s): jugadas con su cámara pequeña abajo a la
  derecha (x 1414–1910, y 620–900) y el mando arriba a la derecha. Sin sonido. Son varios trozos seguidos
  (cortes del empeine ≈ 3,3 9,3 14,5 ~17,7 20,5 27,9 32,6; trivela ≈ 7,5 11,4 16,2 18,4 19,2 22,3 23,6 28,6).
- Ejemplos (scratchpad): r1 = el de referencia (Team Liquid), r2 y r3 = Reels suyos.

## Guion (lo que dice, whisper)
"Si piensas que el tiro de calidad es el mejor playstyle del juego estás totalmente equivocado. Primero, el
pase de empeine… Bruno, Pedri, Stanway… Segundo, revolución. Es la mejor forma de definir en FC27… Si me
sigues, mejoras." (Dice "revolución", comprobado aparte.)

## Estilo (mezcla de ambos)
- **Suyo:** vertical, juego arriba (1120 px) y él abajo (800 px), subtítulos **amarillos en mayúsculas** con
  sombra negra en la unión, iconos/flechas/cruces sobre el juego, cierre "POLLICHRIS EN:" con sus redes y el
  botón "Suscrito".
- **Del ejemplo:** insignias de playstyle grandes, medalla con el número, cartas de jugadores, letra
  condensada (Anton) y barra de progreso naranja en la unión.
- Cortes en las pausas de su voz (53,5 s) alternando plano normal y cerrado. Sin datos inventados: las cartas
  no llevan valoración. Diseño propio de insignias y cartas (no las de EA).

## Cómo se hace
```bash
python3 scripts/pollichris/guion.py          # voz cortada y limpia (−16 LUFS) + src/pollichris/guion.json
npx remotion render PollichrisPlaystyles out/pollichris/x.mp4 --props='{"audio":"pollichris/mezcla.mp3"}'
```
Composición `PollichrisPlaystyles` (1080×1920, 60 fps) en `src/pollichris/Playstyles.tsx`.

## Pendiente
- Música (ElevenLabs, con permiso) y mezcla final a −14 LUFS.
