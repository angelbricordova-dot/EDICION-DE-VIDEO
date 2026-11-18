# Vicens · GTA 6 (campaña de Clipeamos)

Clips verticales de los directos de Twitch de Vicens jugando a GTA 6 (desde nov-2026), para publicar solo en
TikTok y YouTube Shorts. Brief: `Brief_Vicens_Streams_Material_Directo.pdf` (Clipeamos).

## Material
- Directos partidos en tramos de 30 min en Clipdiario: `https://directos.clipdiario.com/d/vicens-twitch/<fecha>`
  (cada parte trae un PDF de "MOMENTOS" con los mejores minutos). Las partes son de 1,8 GB: **no bajarlas
  enteras**, recortar el tramo directo de la URL (`ffmpeg -ss <s> -i "<url>?descargar" -t <dur> -c copy`).
- VOD de respaldo en Twitch (si Clipdiario se ve borroso). Marca de agua oficial (PNG 1080×1920) del Drive
  del brief → `public/vicens/material/marca.png`; recorte del logo en `marca-logo.png`.
- Fuente 1920×1080 60 fps; su cámara está abajo a la izquierda del marco (interior ≈ x 26–322, y 398–696).

## Reglas del brief
- Vicens protagonista: su cara y el gameplay siempre visibles. Nada de reacciones a vídeos de otros creadores.
- Cartel blanco con texto negro, **2 líneas**, fiel al momento, desde el primer cuadro (se puede quitar a
  los 2–3 s). Subtítulos blancos con trazo negro. Marca oficial al 100 % de opacidad.
- Rechazan: borroso/pixelado, barras negras, imagen estirada, subtítulos ilegibles, otras marcas de agua,
  cortes que saquen sus palabras de contexto, copias de su TikTok.
- Descripción empezando por «Vicens…».
- **No elegir el primer momento de la lista** (lo cogen todos los clippers).

## Formato usado: 2 · gameplay vertical con cámara pequeña
- Cámara recortada a todo el ancho arriba (1080×740, lanczos + enfoque suave) y gameplay debajo
  (1080×1180, recorte central 988×1080 que no incluye su cámara). `scripts/vicens/base_clip.sh` arma la base
  por tramos (poca memoria) y normaliza el audio.
- `src/vicens/Clip.tsx` + JSON del clip (`avion.json`): cartel centrado en el borde de la cámara, subtítulo
  justo encima y marca debajo; al quitar el cartel (2,6 s) el subtítulo baja al borde y la marca justo debajo.
- Entrega < 30 MB: `-crf 21 -maxrate 4.3M` y `loudnorm` a −14 LUFS.

## Hechos
- 18-nov-2026: «Vicens huye en avión con 4 estrellas en GTA 6 y le mandan los cazas» (parte 09, 11:55–13:55;
  52 s en 4 tramos: despegue, «4 estrellas, pero ¿a qué costo?», «tengo los cazas» + derribo, «te quedas pelado»).
