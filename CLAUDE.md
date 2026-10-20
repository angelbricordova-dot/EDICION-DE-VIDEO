# Edición de video con Remotion: contexto, gustos del cliente y forma de trabajar

Este archivo resume todo lo aprendido editando con Angel (Venezuela, escribe en español
informal). Claude Code lo lee solo al abrir un chat en este repo. Si se abre otro repo,
copiar este archivo y la carpeta `.claude/skills/` allá.

## 1. Cómo trabaja Angel

- Manda un brief (o un guion, fotos, videos y enlaces) y luego corrige **por segundo**
  ("en el 0:21…", "0:38 baja un poquito el celular"). Responder punto por punto, con
  el mismo orden y en español sencillo.
- Le gusta: dinamismo, motion graphics con "material" (elementos, texturas, íconos que
  se dibujan), transiciones suaves y profesionales, que todo esté **sincronizado con la voz**.
- Revisa en el teléfono: entregar siempre la versión vertical y un archivo de menos de
  30 MB (ver §6). Explicar qué cambió y qué quedó pendiente.
- Antes de generar algo que dependa de material que falta, pedirlo (fotos, logos,
  enlaces). Si hay decisiones de él (precio, etiquetas legales, textos), preguntarlas
  una vez y proponer una opción por defecto.

## 2. Reglas de estilo que pidió (aplican a todos los videos salvo que diga otra cosa)

**Texto**
- Textos grandes **centrados**; nunca dejar el centro vacío al inicio: el gancho lleva
  un gráfico animado o el texto al centro.
- **Pastillas, etiquetas y códigos rectos**, no torcidos.
- El texto en pantalla aparece **justo cuando la voz lo dice** (medir pausas con
  `silencedetect`, ver §5); nunca después.
- Las palabras que entran desde una máscara no deben asomarse antes de tiempo
  (opacidad 0 hasta su momento).

**Subtítulos** (cuando se usan)
- **Una sola línea**, nunca dos; máximo ~28 caracteres por bloque.
- Aparecen palabra por palabra, suave (sube + desenfoque → nítido), con la palabra clave
  resaltada en el color de acento.
- Tipografía un poco redondeada (Nunito 800 fue la aprobada en Tucacas).

**Fotos y video**
- Las fotos **llenan toda la pantalla** (sin franjas desenfocadas arriba/abajo). Si la
  foto es más ancha que 9:16, se recorre con un paneo lento para verla completa.
- En collages/tarjetas, la foto va completa (sin recortar), con el marco en su proporción.
- Las fotos de producto con fondo liso se recortan (`scripts/recortar_camisetas.py`) para
  que floten con sombra.
- Usar las imágenes en alta resolución (si una se ve pixelada, buscar otra).

**Teléfono / demos de páginas web**
- Teléfono **centrado**, sin isla dinámica, sin rótulos encima mientras se muestra.
- Si el teléfono ya está en pantalla, no vuelve a entrar desde abajo en el plano siguiente.
- Zooms de cámara rápidos y con desenfoque de movimiento, no lentos.
- Toques: anillo/punto sutil; en Camis11 pidió quitar el círculo verde del toque.

**Fondos y transiciones**
- Fondos de marca animados (olas, sol, palmas, franjas, estrellas). Sin costuras: los
  patrones que se desplazan van en una capa más grande y girada.
- Para frases abstractas ("no se cobra nada", "confirmas con nosotros") hacer motion
  graphics sofisticados (panel de vidrio, chat que se arma, fichas con íconos).
- Ubicación → mapa animado estilo Google/Apple Maps con pin, ruta y tiempo.
- Le gustaron: transición en círculo, el fondo que anochece (luna y estrellas) cuando la
  voz dice "cae la noche", el balón que golpea y agrieta la pantalla, la bandera ondeando.
- Evitar divisiones planas tipo "mitad rojo, mitad negro": buscar algo más original.

**Sonido**
- Voz siempre clara; música debajo (ducking) y −14 LUFS final.
- Solo efectos que se entiendan con lo que se ve. Pidió quitar: el pitido "robótico" del
  aire acondicionado, brisa rara, grillos, gaviotas fuera de lugar, chapuzón, lancha.
  Ante la duda, menos efectos.
- Drops/golpes de la música en los momentos clave (gancho, código, cierre).

**Legal / marca**
- No inventar datos; usar solo lo del brief. No mostrar precios sin confirmación; nada de
  precio tachado engañoso ni "clientes satisfechos" sin verificar.
- Sin etiqueta "PUBLI" (la quitó en Camis11).
- Logos: usar la versión que contraste con el fondo (blanco sobre oscuro).

## 3. Proyectos hechos (cada uno tiene su guía en `docs/`)

| Proyecto | Código | Guía | Estilo |
|---|---|---|---|
| Cambio (recreación en español) | `src/cambio/` | — | motion graphics de texto |
| Prueba 8 s | `src/prueba/` | — | prueba de skills |
| IVM explicador | `src/ivm/` | `docs/estilo-ivm.md` | explicador ilustrado 16:9, papel crema, acento amarillo |
| Tu Día en Tucacas (alquiler vacacional) | `src/tucacas/` (web en `src/tucacas/web/`) | `docs/tucacas.md` | verde/mar/sol, playa animada, demo de la página en teléfono, voz Juana |
| Futbol Onze × Camis11 (camisetas) | `src/camis11/` | `docs/camis11.md` | negro + rojo #E30613 + lima #D4FF00, Anton/Bebas, cortes al beat, voz Alejandro |
| Short pulpo (prueba de animación) | `src/pulpo/` | `docs/pulpo.md` | personaje de caricatura en vectores, mar azul, rayos X, subtítulo de una palabra (Luckiest Guy) |

Cada estilo vive en su carpeta: un video nuevo de otro tipo va en su propia carpeta
`src/<proyecto>/` con su paleta y fuentes, sin mezclar con los anteriores.

## 4. Flujo de trabajo (el que funcionó)

1. Leer el brief; listar lo que falta y preguntar. Decidir gancho/estructura.
2. **Voz** con ElevenLabs (§5): 3–4 muestras → Angel elige → locución completa con tiempos.
3. **Guion de tiempos** en JSON generado por un script Python (`scripts/guion_*.py`):
   escenas ancladas a las marcas de la voz y cortes al pulso de la música. Remotion y la
   mezcla leen el mismo JSON.
4. **Música** (ElevenLabs Music con `composition_plan`) → medir BPM/fase y energía; si los
   drops no caen donde deben, montar la pista por tramos en la mezcla.
5. Construir escenas en Remotion; renderizar borrador a escala 0.5 y revisar **hojas de
   contacto** (ffmpeg `tile`) y cuadros sueltos antes de entregar (skill `review-loop`).
6. **Mezcla** con numpy (`scripts/sintesis.py` → `Mezcla`, `masterizar` a −14 LUFS).
7. Render final, copia comprimida < 30 MB, enviar, commit del código (no de los medios).

## 5. Notas técnicas del entorno

- Render: `npx remotion render <Composición> out/x.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  (la descarga de Chrome de Remotion está bloqueada). Borrador: `--scale=0.5 --crf=26`.
- `OffthreadVideo` cuenta el tiempo desde el inicio de la composición: **cada clip va en
  una `<Sequence from={desde}>`** o arranca en el segundo equivocado.
- Material de clientes y medios generados en `public/<proyecto>/` (ignorado por git).
- Fuentes: `npm install --no-save @fontsource/...` y copiar el `.woff2` a
  `public/<proyecto>/fuentes/`; cargarlas con `@remotion/fonts` solo en esa composición.
- **ElevenLabs**: la clave va como *secreto de red* del entorno (cabecera `xi-api-key`
  para `api.elevenlabs.io`), nunca en el código. Endpoints usados:
  - TTS con tiempos: `scripts/voz_elevenlabs.py` (`--voz`, `--modelo eleven_v3|eleven_multilingual_v2`,
    `--prefijo "[cálida, sonriendo]"` para v3, `--tiempos`). Campo `pantalla` en la
    locución para escribir distinto de lo que se pronuncia (p. ej. "Camis Once" → CAMIS11).
  - Voces compartidas: `/v1/shared-voices?gender=…&language=es&accent=…` (sirven directo en TTS).
  - Música: `/v1/music` con `composition_plan` (secciones ≥ 3000 ms, `music_v1`).
  - Efectos: `/v1/sound-generation` (`duration_seconds`, `prompt_influence`).
- Ajustar duración de la voz: `ffmpeg -af atempo=1.045` y dividir los tiempos entre 1.045.
- Marcas de palabras: `ffmpeg -af silencedetect=noise=-36dB:d=0.07` sobre la voz.
- Pulso de la música: flujo espectral + autocorrelación (ver `scripts/` / guía del proyecto).
- Capturas web: Playwright global (`G=$(npm root -g) node scripts/capturas_camis11.mjs`),
  vista de celular 432×936 ×2.5; ocultar precios con CSS. La grabación de video vía proxy
  sale en blanco: mejor capturas y animarlas en Remotion.
- Enviar archivos: límite 30 MB →
  `ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 22 -maxrate 6M -bufsize 12M -c:a copy out.mp4`.

## 6. Voces aprobadas

- **Juana** (femenina, venezolana, cálida): `5inFyqqaiwLzjXSTojIq`, Eleven v3, estabilidad 0.5,
  similitud 0.8, estilo 0.2, prefijo `[cálida, sonriendo]`.
- **Alejandro** (masculina, España, segura): `WWVK6dYMrl0ZHnHT7cRj`, Multilingual v2,
  estabilidad 0.45, similitud 0.8, estilo 0.3.

## 7. Skills instaladas (`.claude/skills/`)

`remotion-best-practices` (oficial de Remotion), `motion-design`, `review-loop` y
`sound-design` (claude-motion, MIT), `lottie-motion-design` (LottieFiles, MIT).
Fuentes y licencias en `.claude/skills/FUENTES.md`.
