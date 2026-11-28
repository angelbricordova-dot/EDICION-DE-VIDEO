# Vlog con Landis + 1v1 con Ongu (cliente nuevo, pagado 100 USD, 28-nov-2026)

Entrega: **1080p 60 fps** (horizontal). Material: SwissTransfer `01a21f38-a2ab-7ff7-a727-35123f95307c` (caduca
~5-dic): `vlog landis.zip` de 22,4 GB = 60 clips de iPhone 4K (HEVC, 60 fps casi todos) de la carpeta
"vlog with landis + 1v1 with ongu", 3 efectos (`SFX_ding/boom/whoosh.wav`) y un `IMG_0103.MOV` suelto de 10,9 GB.

## Cómo se trabaja sin bajar los 22 GB
- `scripts/landis/proxies.py`: lee cada clip directamente del zip por HTTP (protocolo `subfile` de ffmpeg, el zip
  no está comprimido) y hace copias ligeras 960×540 60 fps en `public/landis/proxies/`. Guarda en
  `public/landis/indice.json` dónde empieza cada clip dentro del zip.
- `scripts/landis/url_transfer.mjs`: saca el enlace firmado de descarga (dura 1 h); el script lo renueva solo.
- Para el render final se sacan en 1080p solo los trozos usados (mismo `subfile` + `-ss`).
- Los iPhone traen 2 pistas de audio (AAC estéreo + otra de 4 canales que ffmpeg no lee): usar `-map 0:a:0`.

## Referencia (Drive `1hOrHWtiXj6IIeJ2UWPJ6nIgRtC52Tc5z`, 25 min, 854×480)
- Vlog diario estilo "day in my life": selfie hablando a cámara + planos de lo que ve (B-roll), ~280 cortes
  (un plano cada ~5 s), ritmo suelto y natural.
- **Subtítulos pequeños en minúsculas**, blancos, centrados abajo (~92 % de alto), sin cajas ni animaciones.
- Hora en texto fino blanco a media pantalla ("11:02am") al cambiar de lugar; a veces fecha estilo cámara
  (amarilla, "Saturday, July 25, 2026") abajo a la derecha.
- Sin grafismos pesados; cierre con texto pequeño de agradecimiento.
