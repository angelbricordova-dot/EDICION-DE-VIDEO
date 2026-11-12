# César: reacciones a videos (cliente nuevo, prueba del 12-nov-2026)

## Pedido de la prueba
- 3 minutos de edición. Él reacciona a un video: **su cámara arriba a la izquierda**, **sincronizada**
  con lo que está viendo. Subtítulos **muy sencillos de vez en cuando**. **Zooms suaves**, todo muy
  smooth, limpio y profesional. Música de fondo y efectos: Angel los descarga y los pasa.

## Material (Drive, 9-nov)
- `2026-11-09 14-08-25.mkv`: grabación de pantalla 1920×1080 60 fps (YouTube a pantalla completa,
  a ratos el navegador y Gemini). Audio: el del video que ve.
- `IMG_4869.MOV`: su cámara (iPhone) 4K 120 fps HEVC, **grabada de lado** → girar 90° (`transpose=1`).
  8,8 GB: decodificarla entera es lentísimo; convertir solo el tramo que se usa (`-ss` antes de `-i`).
  Audio: su voz + el altavoz de fondo.

## Cómo está hecha (`src/cesar/Prueba.tsx`, composición `CesarPrueba`, 1920×1080 60 fps)
1. **Sincronía**: la cámara va **0,2 s detrás** de la pantalla (la canción del principio suena en los
   dos audios; confirmado con las palabras de la letra en whisper). El envolvente de audio daba
   desfases falsos (4,1 s) por el ritmo de la canción: comprobar siempre con palabras.
2. **Corte** (`scripts/cesar/guion_prueba.py` → `src/cesar/prueba.json`): tramo 0:44–3:51 del original
   (del "18.270 bitcoins robados" a "no vean mi historial de Gemini… ya lo van a ver"); se quitan solo
   los silencios de > 1,8 s en los que no habla nadie, cortando pantalla y cámara a la vez.
3. **Cámara**: ventana redondeada con borde blanco y sombra; 340 px mientras habla el video y crece
   suave a 560 px en sus monólogos. El recorte sigue su cabeza (`scripts/cesar/cara.py`: la zona oscura
   más alta = la gorra; los detectores de caras no lo ven con gorra y auriculares).
4. **Zoom de la pantalla**: hasta +7 % muy lento mientras habla el narrador, hacia la derecha-abajo
   (para no meter el contenido bajo la ventana).
5. **Subtítulos**: solo en sus monólogos (≥ 3 s), una línea, Montserrat 700 blanco en pastilla oscura,
   **debajo de su ventana** (abajo al centro chocaban con los subtítulos del propio video).
6. **Sonido** (`scripts/cesar/mezcla_prueba.py`): audio del video + su micro con puerta (solo se abre
   cuando habla él, para no duplicar el altavoz con eco); −14 LUFS. Música en `public/cesar/musica.mp3`
   si existe (a −24 dB bajo todo).

## Pendiente
- Que Angel elija música y efectos; feedback del cliente.
