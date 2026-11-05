# Shimon Geek (YouTube, anime) — cliente de Angel

Canal de YouTube de anime/opinión (`youtube.com/watch?v=-rfvO3u6I8k` es su último video). Quiere
subir mucho contenido los próximos 3 meses: **1–2 videos al mes, de 8 a 10 minutos, horizontales
16:9**. Presupuesto que dio: **$30–35 por video**. Él manda el video ya recortado y casi todo el
material. Primero, una **prueba de 30 s** (`public/shimon/material/prueba.mp4`, 36 s, 1920×1080 60 fps).

## Sus indicaciones
- Siempre que se pueda, **escenas del anime o imágenes** para ejemplificar lo que dice (no hace
  falta siempre).
- Su cámara se ve mal: **mostrar lo menos posible el video en crudo**.
- "Dale tu impronta".

## Material que mandó (`public/shimon/material/`, ignorado por git)
- `emotes/`: su avatar (Itadori con lentes) en 5 poses + globo de diálogo.
- `material/`: fondos animados (papel arrugado blanco y negro, cuadros rojo y negro, red de líneas
  sobre negro, fondos de stock en 4K).
- `memes para rellenar/`: roca, "Argumenta", caballo, Ibai explicando…
- `musica/`: casual (lo-fi, Pokémon, Undertale, Animal Crossing…), anime (JJK, Blue Lock, Dragon
  Ball, Dandadan, Black Clover, JoJo) y juegos. Algunas no se pudieron bajar (Drive las bloquea).

## Prueba de 30 s: "¿Qué opino de Dragon Ball Super: Beerus?"
Habla del remake animado del arco de Bills (Beerus): por qué salió, que reanima los primeros
capítulos y que Bills ahora es más serio (antes cómico, torpe, holgazán); él "banca" el cambio.

## Su estilo (referencia: su video de Black Clover "Magna vs Dante", 8 min, 640×360)
- **Muy rápido: ~395 cortes en 8 min (un corte cada ~1,2 s).**
- Cámara a cara solo ~30 %; el resto, **escenas del anime a pantalla completa** (a veces con los
  subtítulos originales), **memes** (La Roca, Ibai, Breaking Bad, rostros de reacción, barras de
  color de TV), carteles (p. ej. el título de "Invincible").
- Su **avatar Itadori** aparece encima (esquinas o al lado) señalando, de brazos cruzados o riéndose,
  y también sobre los fondos (papel arrugado, red de líneas negra) con un clip del anime en recuadro.
- Gancho directo a cámara, intro corta ("preparen el like y vamos al video"), chistes y desvíos
  cortados con memes; cierre con meme (gato bailando).

## Prueba de 30 s (hecha)
- `scripts/shimon/guion_prueba.py` → `src/shimon/prueba.json` (16 escenas y 12 rótulos anclados a
  sus palabras) + `public/shimon/prueba/mezcla.wav` (su voz limpia, música "dbsuper instrumental"
  debajo, barridos en los cortes y golpes en los rótulos). Composición `ShimonPrueba` (1920×1080).
- Clips cortados en `public/shimon/prueba/` desde: remake ep. 1 (Facebook, 720p, con subtítulos
  quemados → se recorta la franja de abajo), DBS original ep. 1 y cap. 5 (Facebook, ~400 px → van
  dentro de un televisor viejo con etiqueta "2015") y la crítica de animación del cap. 5.
- Misma cena de Bills en las dos versiones: original 5:39–6:12 / remake 10:34–10:48.
- **Facebook sí se puede bajar desde aquí** (yt-dlp sin sesión); YouTube no (pide iniciar sesión).
- Letra de rótulos: Bangers (`public/shimon/fuentes/`).

## Pendiente
- Referencia bajada: `public/shimon/referencia/referencia.mp4`.
- Escenas del anime (Bills clásico vs remake): YouTube y webs de streaming no se pueden bajar desde
  aquí; pedirlas al cliente o usar imágenes.
- No necesita ElevenLabs (habla él). Si alguna vez hace falta, **pedir permiso a Angel**.
