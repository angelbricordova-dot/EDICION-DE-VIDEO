# Pronósticos de fútbol (cliente nuevo, octubre 2026)

Videos de pronóstico a cámara (selfie vertical, una sola toma) con la edición de las dos
referencias que mandó el cliente (`public/pronosticos/referencias/`, de la cuenta lasfijas.latam).

## Estilo copiado de las referencias

- La persona a cámara todo el video, sin cortes ni zooms.
- Arriba, sobre la cabeza, una escena gráfica por frase, **sin cajas**: escudos, marcadores
  `escudo  1 – 0  escudo`, tablas, fotos de jugadores en círculo (en gris si es baja), puntos G/E/P
  y etiquetas rojas rectas (`DEBUTA EN EL DERBI`, `SUSPENDIDO`, `MAÑANA`). Aparecen con un pop
  corto y se van con la frase.
- Tipografía condensada en mayúsculas: Bebas Neue (con latin-ext para Ç/Ğ), blanco con sombra.
- Palabras clave sueltas en amarillo con contorno negro sobre el pecho (`PENDERS ENTRA`, `NO
  TIENE`), pocas.
- Cierre: `MI OPCIÓN / GANA …` palabra por palabra y CTA grande blanco + rojo con flecha roja
  abajo a la izquierda.
- Como el fondo del cliente es cargado (cuadro "LUDOPATA", estantes), la parte de arriba lleva un
  degradado oscuro para que se lean los gráficos.
- Solo los datos que dice el cliente. Si no da nombres (p. ej. las bajas del Milan), van siluetas.

## Material

- Escudos de Wikimedia Commons → `public/pronosticos/escudos/<club>.png`.
- Fotos de jugadores → `public/pronosticos/jugadores/` (Commons limita los tamaños grandes; si el
  cliente manda fotos mejores, se cambian).

## Sonido

- Sin música (el cliente la pone después).
- Efectos de **Mixkit** (`public/comun/sfx/mixkit/`, licencia libre de Mixkit: uso comercial sin
  atribución). Pixabay y Freesound bloquean las descargas automáticas; de YouTube no se bajan por
  derechos. Angel pidió efectos menos "robóticos" y no repetitivos: barridos de aire, pops y clics
  distintos que se turnan, golpes solo en lo importante, silbato en el penalti fallado y grada
  cuando dice el pronóstico. Se colocan por su pico (`sonido_pronosticos.py`).

## Correcciones de Angel

- v2: la etiqueta "BAJA" de la foto del jugador va debajo del círculo (se tapaba); efectos nuevos.

## Comandos

```bash
/home/user/tts/venv-asr/bin/python scripts/comun/transcribir.py public/pronosticos/audio16k.wav public/pronosticos/audio16k-trans.json
/home/user/tts/venv/bin/python scripts/comun/alinear.py public/pronosticos/audio16k.wav public/pronosticos/palabras.json public/pronosticos/palabras-alineadas.json
python3 scripts/pronosticos/preparar.py milan-inter      # → src/pronosticos/milan-inter.json
python3 scripts/pronosticos/sonido_pronosticos.py milan-inter
npx remotion render PronoMilanInter out/pronosticos/milan-inter.mp4 --browser-executable=...
```

## Videos

| Video | Composición | Estado |
|---|---|---|
| Milan – Inter (derbi) | `PronoMilanInter` | v2 enviada (correcciones de BAJA y efectos) |
