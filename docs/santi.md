# Santi (marca DTC de suplementos): anuncio animado estilo Pixar — PRUEBA

Cliente nuevo (18-nov-2026), vía X @DailyEcomGrit: busca editores que dominen IA de video, marca de
suplementos para el mercado hispano. **Prueba:** replicar su anuncio de referencia (león + cebra en una
cantina, producto UVOLA Tart Cherry) cambiando **león → JAGUAR** y **cebra → LOBO gris/blanco**, mismo
estilo Pixar y mismo estilo de voces, limpio y pulido. Producto nuevo: **Purge Uric Acid de VitalUrge**.
Además **5 hooks visuales** distintos (libertad creativa).

## Análisis de la referencia (`ad-facebook_1881054006237595-media.mp4`)
- 720 × 1280, 30 fps, **3:42**, −14 LUFS. **87 planos, 2,6 s de media** (mediana 2,2 s): corta muy seguido.
- Quién es quién: el que se levanta y le duelen las articulaciones = **león → JAGUAR**; el que sabe y
  recomienda = **cebra → LOBO**.
- Escenario principal: cantina mexicana de noche (luces cálidas, bandera, Virgen de Guadalupe, botellas,
  mesa redonda de madera, cervezas ámbar, totopos). Ropa: camisa de franela/mezclilla, jeans gastados,
  botas de trabajo (son trabajadores de la construcción).
- Insertos: cama (amanece tieso, brillo rojo en rodilla), trabajando de rodillas en el suelo, bajando de
  la troca, manos que no agarran la herramienta, círculo de rayos X de la rodilla inflamada, celular con
  cerezas, celular con la web del producto, frasco y cápsula, obra/troca/hijo cargando cosas, carne asada
  con la familia, frascos + oferta.
- Subtítulos: MAYÚSCULAS, blancas, negrita, 2–3 palabras, palabra clave en **amarillo**, a ~65 % de alto.
- Duración del guion nuevo ≈ igual (≈ 3:40).

## Herramientas GRATIS (para que la prueba no cueste)
| Paso | Herramienta | Nota |
|---|---|---|
| Personajes e imágenes de cada plano | **Gemini (Nano Banana)** o **Google AI Studio** | gratis con límite diario; acepta imágenes de referencia → personajes iguales en todos los planos |
| Video con diálogo y boca sincronizada | **Google Flow / Veo 3.1 Fast** con la **prueba gratis de 1 mes de Google AI Pro** | ~1000 créditos ≈ 50 clips de 8 s; cancelar antes de que cobre |
| Video extra (sin voz) | **Kling** (créditos diarios gratis), **Hailuo**, **Grok Imagine**, **Meta AI** | para insertos: cama, obra, troca, carne asada |
| Voces iguales en todo el video | **ElevenLabs** (cambiador de voz sobre el audio de Veo) | el guion entero cabe en la cuenta gratis (10 000 créditos/mes); con la de Angel, pedir permiso antes |
| Montaje, subtítulos, rayos X, oferta, música, mezcla | **Remotion aquí** (yo) | gratis |

## Flujo
1. Fichas de personaje (JAGUAR, LOBO) y de la cantina en Gemini → elegir las mejores.
2. Imagen de cada plano en Gemini usando esas fichas como referencia (mismo personaje siempre).
3. Cada imagen → Veo 3.1 Fast (Flow, "frames to video"), con la frase en el prompt para que la diga
   moviendo la boca. 8 s por clip; un clip puede cubrir 2–3 frases.
4. Unificar voces: el audio de cada clip por el cambiador de voz de ElevenLabs con UNA voz por personaje
   (así la boca sigue sincronizada y las voces no cambian entre clips).
5. Yo monto: cortes cada ~2,5 s alternando planos, subtítulos estilo original, círculos de rayos X,
   insertos del celular y del producto, oferta, música de fondo y mezcla a −14 LUFS. Luego los 5 hooks.

## Prompts (copiar y pegar)
Pegar SIEMPRE las fichas al principio de cada prompt para que no cambien los personajes.

**[JAGUAR]** `A Pixar-style anthropomorphic jaguar man in his late 40s, golden-orange fur with black rosettes, tired kind amber eyes, slightly grey muzzle, wearing a worn red-and-navy plaid flannel shirt over a grey t-shirt, faded paint-stained jeans and brown work boots, construction worker build, slightly hunched posture`

**[LOBO]** `A Pixar-style anthropomorphic grey-white wolf man in his early 50s, thick silver-grey fur with white muzzle and chest, warm confident blue-grey eyes, wearing an open light-blue denim work shirt with paint stains over a white t-shirt, jeans and boots, calm wise big-brother attitude`

**[CANTINA]** `inside a cozy traditional Mexican cantina at night, warm amber string lights, Mexican flag and Virgin of Guadalupe painting on the walls, shelves of bottles behind the bar, round wooden table with amber beer bottles and a basket of tortilla chips, shallow depth of field, cinematic 3D animation, Pixar / Disney quality, 9:16 vertical`

Video (Veo), añadir al final de cada prompt: `Dialogue in Mexican Spanish, natural casual tone, realistic lip sync. No music, no subtitles, no text.`
Voces: JAGUAR `deep raspy tired voice of a Mexican working man around 50`; LOBO `warm, firm, slightly gravelly voice of a Mexican man around 50, big-brother tone`.

| # | Plano (imagen) | Lo que dice (video) |
|---|---|---|
| 1 | [CANTINA], plano medio: [JAGUAR] se levanta de la silla apoyando las dos manos en la mesa, cara de dolor; [LOBO] sentado a su lado lo mira | LOBO: "¿A dónde vas?" · JAGUAR: "Por otra chela." |
| 2 | Primer plano de [LOBO] por encima del hombro del jaguar, levanta la mano | LOBO: "Siéntate, cabrón, yo voy." |
| 3 | Primer plano de [JAGUAR], ofendido, sonrisa de lado | JAGUAR: "No mames, puedo caminar." |
| 4 | Plano medio: [LOBO] le pone la mano en el hombro y lo sienta | LOBO: "Ya sé, güey, siéntate." |
| 5 | Plano general: [LOBO] camina a la barra y vuelve con dos cervezas | (sin diálogo) |
| 6 | Primer plano de [LOBO] sentándose, serio | LOBO: "¿Hace cuánto te duelen las articulaciones?" |
| 7 | Primer plano de [JAGUAR] que quita importancia con la mano | JAGUAR: "Ya déjalo, güey, no pasa nada, es la chamba." |
| 8 | [LOBO] inclinado hacia delante | LOBO: "No, pero neta, ¿hace cuánto?" |
| 9 | [JAGUAR] se mira las manos, abre y cierra los dedos tiesos | JAGUAR: "No sé, las rodillas ya tienen rato, las manos también amanecen medio tiesas." |
| 10 | [LOBO] lo mira de reojo | LOBO: "¿Y las caderas después de estar sentado?" |
| 11 | [JAGUAR] sorprendido, ceño fruncido | JAGUAR: "¿Y tú qué chingados sabes de mis caderas?" |
| 12 | [LOBO] sonríe con nostalgia | LOBO: "Porque a mí me pasaba exactamente lo mismo." |
| 13 | [JAGUAR] incrédulo | JAGUAR: "¿A ti?" |
| 14 | [LOBO] mientras cuenta (clip largo) | LOBO: "Sí, cabrón, me levantaba en la mañana y los primeros pasos parecían de viejito." |
| 15 | Inserto: [LOBO] en pijama sentándose al borde de la cama al amanecer, se toca la rodilla | (sin diálogo) |
| 16 | Inserto: [LOBO] trabajando de rodillas en el suelo de una casa en obra, se apoya en una pared para pararse | (sin diálogo) |
| 17 | Inserto: [LOBO] bajando de una pickup blanca, rígido, mano en la espalda | (sin diálogo) |
| 18 | Inserto: manos de [LOBO] que no pueden cerrar bien sobre un martillo | (sin diálogo) |
| 19 | [JAGUAR] encogiéndose de hombros | JAGUAR: "Pues sí, ¿pero qué quieres que haga? Tengo que trabajar." |
| 20 | [LOBO] asiente | LOBO: "Eso mismo decía yo." · JAGUAR (fuera): "Son los años, güey." |
| 21–24 | [LOBO] explicando (2 clips de 8 s, ángulos distintos) + insertos 15–18 reutilizados con los círculos de rayos X que hago yo | LOBO: "Eso pensaba… la parte más cabrona." |
| 25 | [JAGUAR] interesado | JAGUAR: "Bueno, ¿y qué haces?" |
| 26 | [LOBO] saca el celular | LOBO: "Ahí fue donde descubrí algo que yo ni sabía que existía. Las antocianinas." |
| 27 | [JAGUAR] confundido | JAGUAR: "¿Anto qué?" |
| 28 | Mano de [LOBO] con el celular mostrando cerezas ácidas rojo oscuro (la pantalla la pongo yo) | LOBO: "Antocianinas, güey. Son unos compuestos naturales…" |
| 29 | [JAGUAR] riéndose | JAGUAR: "Espera, ¿me estás diciendo que coma cerezas?" |
| 30 | [LOBO] niega con la mano | LOBO: "No, cabrón. Escucha. Yo encontré una opción más natural…" |
| 31–33 | [LOBO] enseña el celular con la web del producto (pantalla mía) / el frasco en la mesa | LOBO: "Primero, cereza ácida… hasta un 90% más." |
| 34 | [JAGUAR] | JAGUAR: "¿Todo eso junto?" · LOBO: "Todo junto. Dos cápsulas al día…" |
| 35 | [JAGUAR] | JAGUAR: "¿Y tú sí sentiste diferencia?" |
| 36 | [LOBO] riéndose | LOBO: "Güey, mi esposa fue la primera que se dio cuenta." · JAGUAR: "No mames." |
| 37–39 | [LOBO] serio y cercano, la mano en el hombro del jaguar | LOBO: "Por eso te pregunté… para seguir." |
| 40 | Inserto: [JAGUAR] en la obra al atardecer cargando madera, lento | (sin diálogo) |
| 41 | Inserto: hijo adolescente (jaguar joven) se adelanta a cargar las cosas de la troca | (sin diálogo) |
| 42 | Inserto: carne asada en un patio, familia de jaguares, nietos, risas | (sin diálogo) |
| 43 | Inserto: [JAGUAR] sentado aparte mirando a todos | (sin diálogo) |
| 44 | [JAGUAR] en su cocina por la mañana tomando dos cápsulas con un vaso de agua, el frasco en la mesa | JAGUAR: "Y eso fue lo que empecé a tomar yo…" |
| 45 | Frascos de VitalUrge (fotos reales del cliente) + oferta 3×2 y garantía 90 días (gráfico mío) | JAGUAR: "Y ahorita tienen una oferta especial…" |
| 46 | [JAGUAR] mirando a cámara en la carne asada, sonriendo | JAGUAR: "Has aguantado un chingo en esta vida… Haz clic antes de que termine la oferta." |

## 5 hooks visuales (los primeros ~5 s; el resto igual)
1. **Réplica:** la escena original con el jaguar y el lobo.
2. **Rayos X:** primer plano de las rodillas del jaguar al levantarse; la imagen pasa a rayos X con la
   articulación brillando en rojo (gráfico mío) y suena el crujido → "¿A dónde vas?".
3. **La botella:** el jaguar se levanta, la mano tiesa no agarra la botella, cae en cámara lenta y el lobo
   la atrapa en el aire → "Siéntate, cabrón, yo voy".
4. **Desde la mesa:** plano a ras de mesa entre las cervezas; la mano del jaguar tiembla al apoyarse,
   zoom hacia atrás rápido con desenfoque de movimiento.
5. **Antes y ahora:** dos segundos del jaguar joven corriendo en la obra, rápido y cálido → corte seco a
   hoy: se levanta de la silla a cámara lenta como un viejito.

## Pendiente / lo que falta del cliente
- Fotos del frasco de **VitalUrge Purge Uric Acid** (frente, alta resolución) y logo. No se inventa el
  empaque.
- Confirmar oferta (compra 2 y llévate 1 gratis, 3 meses por el precio de 2; garantía de 90 días) y si
  quiere el anuncio entero (3:40) o un tramo para la prueba.
- Voces: pedir permiso a Angel antes de usar ElevenLabs.
