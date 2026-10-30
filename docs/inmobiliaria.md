# Reels de inversión inmobiliaria (cliente de Angel)

Videos verticales de un inversor inmobiliario en España que habla a cámara (teleprompter,
pizarra, sofá, "lateral"). Guiones en el Google Doc del cliente (19 guiones con HOOK 1 /
HOOK 2 / CUERPO / CTA "comenta GUÍA / INVERTIR / FILTRO / BANCO / PRECIO / CALCULADORA").
Material en `public/inmobiliaria/referencias/` (ignorado por git).

## Referencias analizadas

| Archivo | Qué es |
|---|---|
| `ref1.mp4` (Reel 1 - Inmobiliaria, 1:04) | Pizarra "¿Qué tienen en común estas 4 horas?" |
| `ref2.mp4` (Reel 2 - Inmobiliaria2, 1:34) | Mesa, "¿Quieres tener libertad financiera?", lista 1-2-3 |
| `hook1.mp4` / `hook2.mp4` (1:36) | Mismo Reel 2 con dos hooks y **edición completa con motion graphics** (la referencia más fuerte) |

## Estilo medido

**Formato:** 1080×1920, 60 fps, −20 LUFS aprox.

**Cortes:** casi sin aire. En ref1 quedan 0,6 s de silencio en 64 s (ninguna pausa > 0,25 s).
Se cortan respiraciones, muletillas y repeticiones (tomas de teleprompter). Cambio de plano
cada 3–4 s: los saltos se tapan alternando plano normal y plano cerrado (~1,2×) y con las
escenas de gráficos.

**Subtítulos:**
- 1–3 palabras, centrados a ~65–70 % de la altura (pecho), sin animación de entrada (cambio
  seco pegado a la voz).
- Sans negrita tipo SF Pro / Helvetica Neue → **Inter Bold** como equivalente libre.
- ref1 amarillo (#FFE600) con sombra negra suave; ref2 blanco con sombra; hook1/2 blanco,
  más pequeño, con contorno negro fino.

**Hook (primeros 1–1,5 s):** texto grande centrado sobre la persona: línea 1 blanca
("¿Quieres jubilarte" / "¿Quieres tener") y línea 2 **verde chillón con contorno oscuro y
relieve** ("PRONTO?", "LA LIBERTAD FINANCIERA?"). En ref2 el hook queda fijo arriba
(blanco + amarillo) durante el cuerpo.

**Escenas de motion graphics (hook1/2, ~40 % del tiempo):**
- **Fondo rojo** con cuadrícula blanca y viñeta oscura: tarjeta blanca redondeada con
  sombra y la cifra ("3.000€"), operación debajo ("X200", "X0,35") en blanco con contorno,
  calculadora 3D. La cifra cambia de color según el resultado (naranja 110.000€, verde 120.000€).
- **Fondo papel crema** con cuadrícula fina y textura: cifras grandes **verdes 3D con
  contorno** ("400.000€", "125.000€", "6% AL AÑO", "750€/MES"), operación pequeña encima
  en dorado, objetos 3D (sala isométrica, contrato con bolígrafo).
- **Fondo lila** con viñeta: manos con billetes, lupa.
- Subtítulos siguen encima de los gráficos.

**Overlays sobre la persona:** horas ("8:00 AM", "10:00 PM") grandes en blanco con borde
oscuro sobre la pizarra; cifras clave verdes grandes con punch-in ("100.000€"); lista 1-2-3
en círculos grises que se rellena con las cuentas y los resultados en amarillo.

**Transiciones:** iris ovalado (sale la persona dentro de un óvalo), la tarjeta blanca que
crece desde la cara y se convierte en la escena roja, destello de luz/película quemada antes
del CTA (ref1 0:57).

**CTA final:** caja de comentario / barra de mensaje que se escribe sola ("Guía", "invertir").

## Estilo aprobado (reel 6, ronda 2)

Angel pidió algo **más sencillo, siguiendo las referencias 1 y 2** (no la 3ª), con un poco de
libertad creativa, sin fondos rojos repetidos y **sin tapar los ojos** con las animaciones.

- La persona siempre en pantalla (recorte 9:16 del bruto horizontal, cara del bruto en
  x 930 / y 450 → pantalla 540 / 800). Punch-ins de 4 cuadros al empezar cada frase
  (1.0 ↔ 1.1) y más cerrados en los golpes (1.2–1.24).
- Título fijo arriba = el hook (blanco + amarillo #FFE14D) y lista 1-2-3 debajo que se llena
  al decir cada punto; en la conclusión los tres puntos se marcan con ✓.
- Subtítulos Inter 800 blancos con sombra suave, 1–3 palabras, palabras clave en amarillo.
- Detalles **solo fuera de la cara** (zona prohibida y 520–980): píldoras blancas con objeto
  sobre el pecho (y 1060), pegatinas junto al hombro derecho (x ~770), texto grande 3D sobre
  el pecho (y 1130, rojo para lo negativo) que oculta el subtítulo mientras está.
- Destello de luz cálida tenue para tapar los cortes entre partes y antes del CTA.
- "Por la noche": la imagen se oscurece y enfría un segundo.
- CTA: caja de comentario que escribe la palabra (GUÍA) y se envía.

**Cortes naturales:** las tomas que él dijo seguidas no se parten. Solo se quitan tomas
falsas y repeticiones, y las pausas > 0,32 s se acortan dejando ~0,2 s
(`scripts/inmobiliaria/corte_inmo.py`). Tiempos por palabra: Whisper (`scripts/comun/transcribir.py`) +
alineación forzada (`scripts/comun/alinear.py`), porque los tiempos de Whisper se desvían hasta 0,4 s.

## Comandos (reel 6)

```bash
/home/user/tts/venv-asr/bin/python scripts/comun/transcribir.py public/inmobiliaria/g6/audio16k.wav public/inmobiliaria/g6/transcripcion.json --guion public/inmobiliaria/g6/guion.txt
/home/user/tts/venv/bin/python scripts/comun/alinear.py public/inmobiliaria/g6/audio16k.wav public/inmobiliaria/g6/palabras.json public/inmobiliaria/g6/palabras-alineadas.json
python3 scripts/inmobiliaria/corte_inmo.py g6 hook1 && python3 scripts/inmobiliaria/sonido_inmo.py g6 hook1
npx remotion render Inmo6Hook1 out/inmo6-hook1.mp4 --browser-executable=...
```

## Reels hechos después (8, 9, 10)

- **Zoom suave y progresivo** (pedido en el reel 9, se usa desde entonces): cada frase arranca
  un acercamiento de ~0,9 s con ease-in-out desde donde iba el anterior, y dentro de la frase
  sigue avanzando muy poco; nada de punch-ins de 4 cuadros.
- **Reel 8** (ranking): logos reales de cada portal en `public/inmobiliaria/logos/` (los manda el
  cliente) que aparecen al nombrarlos y vuelan a su puesto; El Filtro Inmobiliario es la
  comunidad del cliente (logo propio).
- **Reel 10** (pizarra, bruto vertical): con zoom 1 se ve el cuadro entero; el foco del zoom
  va cerca de él para que no se salga. Lo escrito en la pizarra se marca con círculos de
  rotulador pegados al video (las mismas coordenadas que usa `Persona`).
- **Música:** Angel prefiere ponerla él en CapCut; las mezclas van solo con voz y efectos
  (`MUSICA` vacío en `scripts/inmobiliaria/sonido_inmo.py`).

## Reels 12–19 (lote del 29/10)

- **Bajada en lote**: un script por reel baja el bruto de Drive, saca el audio y la copia de
  trabajo (1440 × 2560, crf 18) y **borra el bruto** (son de 1–2 GB y el disco es justo). Si un
  reel trae dos archivos, se unen en uno (audio y copia).
- **Ranking (12)**: como el 8, con 8 puestos. Logos de bancos de Wikimedia Commons y de la web del
  banco (ING); `public/inmobiliaria/logos/banco-*.png`.
- **Plantilla** (`src/inmobiliaria/Plantilla.tsx`, reels 13, 15, 17, 18, 19): título = hook, lista
  numerada, y eventos anclados a palabras: píldora, texto grande, web en un móvil, web a pantalla
  completa (voz en off), etiqueta de precio (compacta, en una fila, para no tapar la cara), pasos,
  imagen (logo) y cuenta atrás. Los efectos de sonido de estos reels están en `SECUENCIAS`
  (`scripts/inmobiliaria/sonido_inmo.py`).
- **Sofá** (`src/inmobiliaria/Sofa.tsx`, reels 14 y 16): las dos mitades se grabaron por separado
  con la cámara quieta (camiseta blanca a la izquierda, negra a la derecha). Se unen en un plano con
  una costura suave en el centro; mientras uno habla, la otra mitad pone un tramo de esa persona en
  silencio (`rellenos_sofa` en `scripts/inmobiliaria/corte_inmo.py`). El zoom va despacio hacia el que habla.
  - Corrección de Julio: el que escucha "hacía cosas raras". Los rellenos se eligen solo donde esa
    persona está callada (±0,35 s de cualquier palabra), con poco movimiento y sin mirar a cámara
    (`scripts/inmobiliaria/movimiento_sofa.py` mide movimiento y cara de frente con OpenCV →
    `public/inmobiliaria/<reel>/movimiento.json`). OpenCV 5 ya no trae `CascadeClassifier`: se usa
    `opencv-python-headless==4.10` instalado aparte (`pip install --target <carpeta>` + `PYTHONPATH`).
  - Corrección de Julio: "que no sea solo texto". Cada tarjeta lleva una foto de referencia (`img`);
    con fotos, al entrar el primer item el título se encoge y todo sube para no tapar las caras.
- **Fotos de referencia**: `scripts/comun/buscar_imagenes.py ... --fuentes stocksnap,rawpixel` (Openverse,
  CC0 / dominio público, sin atribución; las de StockSnap y rawpixel son fotos actuales, sin ese filtro
  salen fotos de archivo). Wikimedia Commons (`buscar_commons.py`) da poco y limita con 429; Pexels,
  Unsplash, Pixabay y Freepik están bloqueados. Canva genera imágenes pero solo deja bajar miniaturas.
  Elegidas en `public/inmobiliaria/imagenes/reel14/` y `reel16/`.
- **Capturas de webs** (`scripts/inmobiliaria/capturas_webs_inmo.mjs` y búsquedas ordenadas por precio):
  Solvia, Servihabitat (Murcia, "Precio Menor"), Aliseda (Jaén), resultados del portal de subastas
  del BOE (Madrid), Seguridad Social, Escrapalia, Oportunalia, Anticipa → `public/inmobiliaria/webs/`.
  No se saltan protecciones anti-robots (Eurocaja Rural la tiene: su logo salió de Commons).
- Compresión para enviar: `-crf 22 -maxrate 2.7M` (con 3M los reels de más de 75 s pasaban de 29 MB).

## Pendiente con Angel

- Música: la pone él en CapCut.
- Objetos 3D (si se quieren más realistas): pack libre con licencia comercial o los del cliente.
