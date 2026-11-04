# Paul: reels con IA (personaje que da remedios caseros)

Cliente nuevo (vía Angel). Quiere 2 reels al día al estilo de su referencia
(`instagram.com/p/DY_umgrMig3`): un personaje 100 % IA, siempre el mismo, en un lugar fijo,
que explica una receta casera. Planos de acción (prepara la receta) + planos hablando a cámara,
subtítulos de 2-3 palabras en mayúsculas blancas con la palabra clave en color, cierre
"comenta X y te envío…" + "sígueme". Presupuesto que ofrece: $250/mes (≈ $4 por reel).

Reglas propias:
- Personaje **original** (no copiar al anciano asiático de la referencia, que es de otra cuenta).
- Sin promesas médicas falsas ("te van a creer operada", "activa el colágeno"): Instagram y TikTok
  las bajan. Mismo gancho y ritmo, con consejos razonables.
- Marcar el contenido como hecho con IA al publicar.

## Flujo de la prueba (gratis)

1. Angel genera el personaje en **Gemini** (Nano Banana) con los prompts de abajo.
2. Angel genera los clips en **Google Flow** (Veo 3.1, 50 créditos gratis al día, vertical 9:16,
   "Frames to Video" con la imagen del personaje). Cada clip ≤ 8 s y dice su frase.
3. Nosotros: unificar la voz de todos los clips con ElevenLabs (speech-to-speech, respeta los
   tiempos y los labios), subtítulos, música, mezcla −14 LUFS, montaje en Remotion
   (`src/paul/`, material en `public/paul/`).

## Guion de prueba: "jengibre para la barriga hinchada" (≈ 33 s, 5 clips)

| Clip | Imagen | Tipo | Frase |
|---|---|---|---|
| 1 | 1 | habla (gancho) | Si después de comer sientes la barriga hinchada, no te tomes nada todavía. Mira esto. |
| 2 | 2 | acción | Tres rodajas de jengibre fresco en una taza de agua caliente. Déjalo reposar cinco minutos. |
| 3 | 2 | acción | Medio limón exprimido y una cucharadita de miel. Se toma tibio, despacio, después de comer. |
| 4 | 1 | habla | El jengibre se usa desde hace siglos para la digestión, y lo tibio ayuda a relajar el estómago. |
| 5 | 1 | habla (cierre) | Comenta JENGIBRE y te paso mis otras dos recetas para después de comer. Y sígueme para no perderlas. |

## Prompts

Personaje: **Don Aurelio**, abuelo latino de unos 75 años, barba blanca corta, camisa de lino
blanca, cocina de campo con hierbas secas y frascos. Los prompts van en inglés (Veo y Nano Banana
responden mejor) con la frase hablada en español entre comillas.

**Imagen 1 (Gemini):**
Photorealistic vertical photo, 9:16. A 75-year-old Latin American grandfather, short neat white beard, kind dark eyes, tanned wrinkled skin, white linen shirt with sleeves rolled up, sitting at a rustic wooden kitchen table, looking directly at the camera with a warm, wise expression. Background: old countryside kitchen with clay pots, glass jars of herbs and bunches of dried herbs hanging from wooden beams, soft morning light from a window. On the table: a fresh ginger root, a lemon, a small jar of honey and a ceramic mug. Shot on a smartphone, natural colors, shallow depth of field, medium shot from the waist up, centered. No text.

**Imagen 2 (Gemini, subiendo la imagen 1):**
Same man, same clothes, same kitchen and lighting as the reference image. Close-up of his hands slicing a fresh ginger root on a wooden cutting board next to a steaming ceramic mug, a lemon and a jar of honey nearby; his smiling face partly visible at the top of the frame. Photorealistic, vertical 9:16. No text.

**Clip 1 (Flow, imagen 1):**
The elderly man picks up the fresh ginger root from the table, holds it up toward the camera and says in Spanish, with a warm, deep, calm Latin American voice: "Si después de comer sientes la barriga hinchada, no te tomes nada todavía. Mira esto." Static smartphone camera with a slight handheld feel. Quiet kitchen ambience. No music, no subtitles, no text on screen.

**Clip 2 (Flow, imagen 2):**
The elderly man slices three thin pieces of ginger and drops them into the steaming mug of hot water, while saying in Spanish, with a warm, deep, calm Latin American voice: "Tres rodajas de jengibre fresco en una taza de agua caliente. Déjalo reposar cinco minutos." Close-up on his hands, slow and careful movements, steam rising. No music, no subtitles, no text on screen.

**Clip 3 (Flow, imagen 2):**
The elderly man squeezes half a lemon into the steaming mug, then adds a teaspoon of honey and stirs slowly, while saying in Spanish, with a warm, deep, calm Latin American voice: "Medio limón exprimido y una cucharadita de miel. Se toma tibio, despacio, después de comer." Close-up on the mug and his hands, honey dripping from the spoon. No music, no subtitles, no text on screen.

**Clip 4 (Flow, imagen 1):**
The elderly man holds the warm mug with both hands, then explains to the camera with a gentle hand gesture, saying in Spanish, with a warm, deep, calm Latin American voice: "El jengibre se usa desde hace siglos para la digestión, y lo tibio ayuda a relajar el estómago." Static smartphone camera, medium shot. No music, no subtitles, no text on screen.

**Clip 5 (Flow, imagen 1):**
The elderly man leans slightly toward the camera, raises his index finger and smiles, saying in Spanish, with a warm, deep, calm Latin American voice: "Comenta JENGIBRE y te paso mis otras dos recetas para después de comer. Y sígueme para no perderlas." Static smartphone camera, medium shot. No music, no subtitles, no text on screen.

## Reel de prueba (hecho)

- `scripts/paul/montar_paul.py` → `src/paul/prueba.json` + `public/paul/mezcla-prueba.wav`;
  composición `PaulPrueba` (`src/paul/Prueba.tsx`), 35,5 s. Enviado: `out/paul/enviar/paul-prueba-jengibre.mp4`.
- Clip 2: desde 5,25 s la IA hace una nube de vapor rara → cuadro congelado con acercamiento a la taza
  y pastilla "5 MIN". Cierre: comentario "JENGIBRE" que se escribe + botón "SEGUIR".
- Subtítulos: Oswald 700 en mayúsculas, contorno negro, clave en celeste #22C8F5 (como la referencia),
  una línea de hasta 3 palabras. Música: Mixkit "Valley Sunset" (guitarra suave) debajo.
- Voces: el cambiador de voz de ElevenLabs no se pudo usar (cuenta gratis sin créditos hasta el
  22-nov-2026 y sin voces de la biblioteca por API); se igualaron con ecualización. Con plan de pago,
  pasar cada clip por speech-to-speech con una sola voz (candidatas: "El Abuelo Charlie"
  `Yb8JGzcZyW5YYzenhRCm`, "Salvatore" `wfTWLJ20rcMqvU8gIiAB`, "Aurelio" `PHNjiQZ95SnMQ7rDQsXz`).

## Pendiente
- Paul: tema y nicho fijos, idioma/país, si tiene producto o enlace de afiliado, redes.
- Medir el costo real por reel antes de cerrar los $250/mes.
