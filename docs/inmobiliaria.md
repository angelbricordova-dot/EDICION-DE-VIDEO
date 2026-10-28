# Reels de inversión inmobiliaria (cliente de Angel)

Videos verticales de un inversor inmobiliario en España que habla a cámara (teleprompter,
pizarra, sofá, "lateral"). Guiones en el Google Doc del cliente (19 guiones con HOOK 1 /
HOOK 2 / CUERPO / CTA "comenta GUÍA / INVERTIR / FILTRO / BANCO / PRECIO / CALCULADORA").
Material en `public/referencias-tiktok/` (ignorado por git).

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
(`scripts/corte_inmo.py`). Tiempos por palabra: Whisper (`scripts/transcribir.py`) +
alineación forzada (`scripts/alinear.py`), porque los tiempos de Whisper se desvían hasta 0,4 s.

## Comandos (reel 6)

```bash
/home/user/tts/venv-asr/bin/python scripts/transcribir.py public/tiktok/g6/audio16k.wav public/tiktok/g6/transcripcion.json --guion public/tiktok/g6/guion.txt
/home/user/tts/venv/bin/python scripts/alinear.py public/tiktok/g6/audio16k.wav public/tiktok/g6/palabras.json public/tiktok/g6/palabras-alineadas.json
python3 scripts/corte_inmo.py g6 hook1 && python3 scripts/sonido_inmo.py g6 hook1
npx remotion render Inmo6Hook1 out/inmo6-hook1.mp4 --browser-executable=...
```

## Reels hechos después (8, 9, 10)

- **Zoom suave y progresivo** (pedido en el reel 9, se usa desde entonces): cada frase arranca
  un acercamiento de ~0,9 s con ease-in-out desde donde iba el anterior, y dentro de la frase
  sigue avanzando muy poco; nada de punch-ins de 4 cuadros.
- **Reel 8** (ranking): logos reales de cada portal en `public/tiktok/logos/` (los manda el
  cliente) que aparecen al nombrarlos y vuelan a su puesto; El Filtro Inmobiliario es la
  comunidad del cliente (logo propio).
- **Reel 10** (pizarra, bruto vertical): con zoom 1 se ve el cuadro entero; el foco del zoom
  va cerca de él para que no se salga. Lo escrito en la pizarra se marca con círculos de
  rotulador pegados al video (las mismas coordenadas que usa `Persona`).
- **Música:** Angel prefiere ponerla él en CapCut; las mezclas van solo con voz y efectos
  (`MUSICA` vacío en `scripts/sonido_inmo.py`).

## Pendiente con Angel

- Música: la pone él en CapCut.
- Objetos 3D (si se quieren más realistas): pack libre con licencia comercial o los del cliente.
