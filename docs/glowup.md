# Canal propio de Angel: serie animada interactiva de "glow-up" (Instagram)

Proyecto de Angel (no de un cliente): una cuenta nueva de Instagram con una serie diaria de reels
animados donde **la audiencia decide en comentarios** cada cambio del protagonista. Inspiración:
`@rober.glowup` (51 mil seguidores con 3 reels). Nombre corto del proyecto en el repo: `glowup`
(cambiarlo cuando Angel elija nombre de la cuenta).

## Cómo está hecho el de referencia (análisis de sus 3 reels)

- **Animación 2D plana tipo vector** (no es video de IA): personaje con estados (sucio, mojado,
  limpio, enamorado, con mal aliento), fondos planos (cuarto, ducha, tienda, calle, baño),
  partículas (moscas, olor verde, brillos, corazones). Se puede hacer en Remotion con SVG, como
  el short del pulpo.
- **Voz en off** de IA (español de España, "vosotros"), frases cortas con pausas, tono de narrador
  de documental gracioso. Música y efectos debajo.
- **Subtítulos** grandes en mayúsculas, condensados, contorno negro, palabra clave en amarillo o rojo.
- **HUD fijo arriba**: contador "DÍAS 30 → 29 → 28" y barra "GLOW-UP 0 % → 6 % → 14 %".
- **Tarjetas de UI**: notificación del grupo de WhatsApp, "COMENTARIO MÁS VOTADO @usuario",
  tarjetas "DUCHA vs HABITACIÓN", "ANTES / DESPUÉS", "A Lucía le ha gustado tu foto".
- **Duración**: 23 s (día 0), 46 s y 55 s. Unos 460 caracteres de voz por episodio.

### Estructura de cada episodio (la fórmula)
1. **Resumen-gancho (0–6 s)**: primer plano asqueroso + "Rober, cero duchas. Quiere conquistar a
   Lucía. Y tú eliges cada cambio." (para los que llegan nuevos).
2. **El comentario más votado (6–8 s)**: tarjeta con el @ del seguidor + "¿Dientes? Día 2."
   → el seguidor se siente parte de la serie y comenta más.
3. **Mini historia con obstáculo y gag absurdo (8–40 s)**: no tiene pasta → lo echan de la tienda
   por el aliento → se come un chicle del suelo → lo consigue.
4. **Resultado**: antes/después, "GLOW-UP +3 %", el contador baja un día.
5. **Giro social (cliffhanger)**: el rival se ríe / la chica le da like.
6. **Votación**: "¿Qué toca mañana? Comenta ROPA o GRANOS. Sígueme para el día 3."

## Nuestra versión (original, misma fórmula)

No copiar personaje, nombres, premisa ni diseño de Rober: misma mecánica, historia propia.

Concepto recomendado (pendiente de que Angel elija):
- **Toño**, 34 años, vive con su mamá, no sale del sofá. Su **ex se casa en 30 días… y lo invitó**.
  Meta: llegar a la boda irreconocible. Rival: el novio, "Brayan el del gym". Personaje cómico
  fijo: la mamá (chancletazos, "¡Antonio!"). Barra "NIVEL DE CAMBIO".
- Alternativas: **Paqui** (chica desastre, la boda de su hermana perfecta) o **Don Ramón**
  (abuelo que quiere ganar el concurso de baile del barrio).

Mercado: latino neutro ("ustedes deciden") para llegar a más países (Rober va a España).

## IDEA GANADORA DE ANGEL (la que vamos a hacer): glow-up de finanzas antes de GTA VI

- GTA VI sale el **19-nov-2026** (15 días desde el 4-nov). El protagonista, un gamer **sin un peso**,
  tiene 15 días para juntar el dinero del juego **y** un colchón para jugarlo tranquilo sin
  preocuparse por trabajar. La audiencia decide cada movimiento de dinero.
- HUD: "DÍAS PARA GTA VI: 15 → 0" y la **billetera** "$0 / $META" (en vez del % de glow-up).
- Cada día una decisión con lección real de finanzas (vender lo que no usa, presupuesto, cortar
  suscripciones, trabajitos, no pedir préstamos, no apostar). Si la audiencia elige la opción
  mala, se ve la consecuencia (pierde dinero) → gracioso y educativo.
- El Día 15 (19-nov) es el gran final: ¿llega o no? Después: temporada 2 con otra meta para no
  perder a los seguidores (la cuenta no puede depender solo de GTA).
- **Marca registrada**: se puede nombrar "GTA VI", pero **no** usar el logo, la portada, capturas,
  música ni la tipografía de Rockstar, ni nada que parezca oficial. Nuestro diseño propio.
- **Finanzas honestas**: nada de "hazte rico rápido", apuestas, cripto ni inversiones concretas
  presentadas como consejo. Montos realistas.

## Monetización (objetivo de Angel a largo plazo)

Seguidores → comunidad → embudo → infoproducto digital. Fases:
1. **Crecer (temporada 1, días 0–15)**: no vender nada; solo serie diaria y comentarios.
2. **Captar (desde ~día 5, cuando haya tracción)**: imán gratis por palabra clave con respuesta
   automática por DM (ManyChat): "Comenta PLANTILLA y te mando la plantilla de ahorro de Toño"
   → la persona deja su correo o entra al canal de WhatsApp/Telegram.
3. **Comunidad (después del 19-nov)**: canal gratis (WhatsApp/Telegram) con el reto, votaciones
   y tips; ahí se calienta la venta.
4. **Vender**: infoproducto de entrada (≈ $7–27: guía + plantillas "Reto: de $0 a tus primeros
   $1.000"), luego comunidad de pago mensual o curso. Más adelante, marcas y afiliados (apps de
   ahorro, bancos digitales), siempre avisando que es publicidad.
- **Sin promesas de ganancias** ("hazte millonario seguro"): la historia de Toño es ficción y
  comedia; el producto enseña ahorro, presupuesto e ingresos extra, sin garantizar resultados.

## Arco largo de Toño
- Temporada 1 (15 días): meta **$1.000** (juego + mes tranquilo). Final abierto el 19-nov.
- Temporada 2 en adelante: "de $X al millón": la billetera sigue, las decisiones de la gente lo
  pueden llevar a la **bancarrota o a millonario**. Eventos sorpresa (multas, regalos, estafas)
  para mantener el drama. Cada episodio deja una lección de dinero real.

## Producción (cómo lo hacemos)

1. **Personaje**: Gemini hace la hoja de referencia (estilo plano, colores) → yo lo redibujo en
   SVG por partes (boca para sincronizar con la voz, ojos, sudor, moscas, estados) para animarlo.
2. **Fondos**: Gemini (estilo plano, 9:16, sin personajes) o SVG propios.
3. **Voz**: ElevenLabs. **Pedir permiso a Angel antes de generar** (regla del CLAUDE.md).
4. **Música y efectos**: Mixkit (gratis, uso comercial) para no gastar créditos.
5. **Montaje**: Remotion, con HUD, tarjetas y subtítulos reutilizables; cada episodio es un guion
   JSON nuevo. El primero cuesta más (construir todo); los siguientes, mucho menos.

## Créditos de ElevenLabs (plan Starter, 40.000 al mes)

- Un episodio ≈ 450–650 caracteres de voz ≈ 450–650 créditos (Eleven v3 / Multilingual: 1 crédito
  por carácter; Flash: 0,5).
- Con repeticiones y muestras: ≈ 800 por episodio → **unos 45–50 episodios al mes**.
  Solo la toma buena: hasta ~80. Con voz Flash: el doble.
- Música y efectos de ElevenLabs gastan mucho más: usar Mixkit.

## Lanzamiento de la cuenta

- Antes de abrir: logo/foto de perfil, bio, 3 reels listos (Día 0 tráiler, Día 1, Día 2).
- Fijar 3 publicaciones: Día 0, el último episodio y uno de los más vistos.
- Publicar **todos los días a la misma hora** (de noche en LatAm, 19–21 h). La serie depende de
  la constancia.
- Descripción de cada reel: "DÍA N + emoji, resumen en 2 líneas, pregunta, comenta X o Y",
  más la **encuesta** de Instagram con las dos opciones.
- Etiqueta "Contenido generado con IA" activada.
- Responder y fijar comentarios; el más votado sale con su @ en el siguiente episodio.

## Decisiones tomadas
- Personaje: **Toño**, latino neutro. Referencia de Gemini: `public/glowup/personaje/referencia-nivel0.jpg`
  (sudadera roja manchada, pantalón gris, pantuflas rotas, audífonos viejos al cuello, ojeras, barba
  sin arreglar). Se redibuja en SVG por partes para animarlo.
- Niveles visuales según la billetera: 0 ($0) → 1 (~$250) → 2 (~$600) → 3 ($1.000) → temporada 2.
- **Voz: Fernando Martínez** (`dlGxemPxFMTY7iXagmOj`, biblioteca de ElevenLabs, latino, rápido),
  Eleven v3, estabilidad 0.5, similitud 0.8, estilo 0.3. Costo medido: 42 créditos por 113
  caracteres (≈ 0,37 por carácter) → un episodio ≈ 150–250 créditos.
  Ojo: en la muestra dijo "¿Lo lograrás?" en vez de "¿Lo logrará?": revisar cada toma.

## Día 0 (hecho, v2 con correcciones de Angel)
- `src/glowup/Dia0.tsx` + `src/glowup/piezas.tsx` + `src/glowup/Tono.tsx`; tiempos y mezcla con
  `scripts/glowup/montar_dia.py 0` (efectos anclados a frases o a "@palabra"). Voz sin regenerar.
- Correcciones de Angel: subtítulos en Montserrat Black (minúsculas, como su foto de ejemplo);
  barba dentro de la cara y personaje con más detalle; cuarto muy distinto al de Rober → **garaje
  de la casa de la mamá**; póster oficial de GTA VI en la pared y logo de GTA VI en la notificación
  (material que mandó Angel, `public/glowup/gta/`); "cero pesos" → se saca los bolsillos vacíos;
  "15 días para juntar mil dólares" → pantalla de **NUEVA MISIÓN** estilo GTA (franjas de cine,
  Pricedown, $1.000 que cuenta, billetes y golpes); HUD estilo GTA (dinero verde/rojo, META,
  estrellas de NIVEL, barra "GTA VI sale en 15 días").
- Letra **Pricedown** (Typodermic, gratis; su licencia permite usarla en videos comerciales como
  arte fijo): `public/glowup/fuentes/pricedown.otf`.

## Resultados del Día 0 (7 h después)
- Instagram: 3.613 reproducciones, 2.623 cuentas, 99,4 % no seguidores (86 % desde Reels), 82 me
  gusta, 10 comentarios, 33 compartidos, 5 guardados. Tiempo medio 10,5 s de 20 y 39 % de omisión
  al principio → los episodios arrancan con el conflicto en el primer segundo.
- TikTok (`@lamont.creativo`, cambiar a `@mision.tono`): 1.548 vistas, 80 me gusta, 21 seguidores.
- Encuesta: 101 votos, BUSCAR TRABAJO 73 %.

## Día 1 (hecho): "Toño busca trabajo" (DÍAS 14, $0 → $20)
- Voz 190 créditos. `src/glowup/Dia1.tsx` + `src/glowup/escenas.tsx` (comentario más votado
  "trabajajoooo" de "A ¿?" en TikTok, DÍA 1, currículum con sellos RECHAZADO, cocina del
  restaurante con delantal, 8 HORAS DESPUÉS, billete al HUD, LECCIÓN DEL DÍA, chat del primo
  Brayan con el póster y RESERVADO, votación AHORRAR vs INVERTIR).
- `montar_dia.py`: efectos en la n-ésima palabra ("@rechazado#2") y reemplazos de nombres que
  whisper escribe mal ("Brian" → "Brayan").

## Día 2 (hecho): "Más turnos… y Toño se enferma" (13 días, $20 → $60 → $30)
- Ganó MÁS TURNOS (62 %). Giro pedido por Angel: trabaja 16 h, cobra $40 y se enferma; estornuda
  sobre los platos, lo mandan a casa, farmacia $30. Gana el logro DISCIPLINA (el trabajo le dio
  disciplina). Lección: sin descanso te pasa factura. Desde aquí Toño mejora sus hábitos paso a paso.
- Voz 319 créditos. Votación: ORDENAR EL GARAJE (y vender lo que no usa) vs EJERCICIO CADA MAÑANA.

## Pendiente
- Angel: elegir concepto, mercado (latino o España) y nombre de la cuenta.
- Muestras de voz (con permiso), personaje en Gemini, Día 0.
