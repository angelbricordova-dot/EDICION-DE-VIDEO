# Katia (agencia en España): reels de coach de fuerza

Katia busca editores que cobren desde España (Bizum o factura; Angel prefiere Wise/Revolut/Kraken).
Ritmo de trabajo: **12 videos cada 15 días**. Primero una **prueba gratuita**; si gusta, el resto
es remunerado. Chat de WhatsApp exportado (5-nov-2026) con las condiciones.

## Marca y referencia
- Colores: **rosa #AD3158** y **azul #8AD2D1**. Tipografía: **Montserrat**.
- Referencia: cuenta de Instagram **@claudiabruna.coach** (13 reels en `public/katia/referencias/`,
  carpeta de Drive del cliente). Es la misma coach que graba la prueba.
- Estilo de la referencia: reels de 30–60 s, la coach a cámara en varios sitios (gimnasio, casa,
  jardín), un corte por frase (~15 en 35 s), subtítulo de **una palabra** fina y blanca al centro,
  claves y números en rosa, títulos rosas fijos para cada punto de la lista ("1. Entrena fuerza 2-3
  veces por semana"), gancho fuerte, cierre "comparte con esa amiga… comenta RESET".
  Sonido: voz delante, sin música fuerte ni efectos llamativos.

## Prueba (hecha): "¿Cuánto peso coger en tus entrenos?"
- 15 tomas en 4K vertical (iPhone, `rotate=-90`) en `public/katia/prueba/`; giradas y a 1080×1920
  en `public/katia/cortes/`; palabras en `public/katia/palabras/`.
- `scripts/katia/guion_prueba.py` → `src/katia/prueba.json` + `public/katia/mezcla-prueba.wav`
  (orden del guion, títulos 1-2-3 y la regla, música Mixkit "Feeling Happy" muy baja, barrido suave
  en 1 de cada 3 cortes, pop en cada título). Composición `KatiaPrueba`.
- La toma IMG_5338 es la cámara mirando al suelo: solo su voz; encima, gráfico de barras de fuerza
  (piernas y espalda > brazos) sobre la toma de las mancuernas desenfocada.

## Correcciones de la prueba (v2, hecha)
- Subtítulo blanco plano (sin rosa), una palabra. Sin música. Ruido del gimnasio quitado con
  `noisereduce` (no estacionario, `prop_decrease=0.8`: −12 dB de fondo sin sonar robótico).
- Sin espacios muertos: se quitan las pausas de dentro de cada toma (jump cuts que alternan plano y
  acercamiento): 55,6 s → 48,9 s.
- Pesos con tarjetas blancas "clean": pastilla "PESOS DE PARTIDA", tarjeta por zona con silueta que
  marca piernas/espalda/brazos, kg que cuentan al decirlos, ejercicios en pastillas azules y PASO 1/3.
- Regla: contador de repeticiones (se llena hasta 10 con la voz → "+10 reps → SUBE DE PESO"; luego
  las 2–3 últimas laten en rosa).
- Cierre: hoja de "Compartir" de Instagram (se marca "Tu amiga" y Enviar) y hoja de "Comentarios"
  donde se escribe RESET, se publica y aparece arriba con su ♥.
- Destellos tipo lens flare hechos en código (no hacen falta archivos) en cada cambio de sección.

## Correcciones de la prueba (v3, hecha)
- Sin lens flare (las transiciones las pone Angel en CapCut), sin "PESOS DE PARTIDA" ni "LA REGLA
  QUE CASI NADIE SABE".
- Pesos: cuando nombra un músculo **se resalta en rojo sobre su cuerpo** siguiéndola cuadro a cuadro
  (`scripts/katia/postura.py` con MediaPipe Pose → `src/katia/postura/IMG_*.json`; mediapipe y su
  modelo `pose_landmarker_full.task` van aparte, fuera del repo; necesita `apt-get install libegl1
  libgles2`). Piernas: cadera→rodilla; espalda: dorsales a los lados y trapecio a cada lado del
  cuello; hombro: deltoides; brazo: hombro→codo. Etiqueta oscura con nombre, kg y ejercicios.
- Compartir y comentar: tarjetas **oscuras** y simples (no la interfaz de Instagram): avión de papel
  que sale volando → "tu amiga ✓"; caja donde se escribe RESET, se envía y aparece con un ♥ rosa.

## Pendiente
- Que Katia vea la prueba.
