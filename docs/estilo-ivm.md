# Guía de estilo: videos de IVM (ivmp2p.com)

Análisis de 4 videos de referencia de @ivm_p2p (octubre de 2026). Todos son horizontales
16:9 a 30 fps, sin cámara: todo es motion graphics con voz en off continua.

## Tres formatos

| Formato | Ejemplos | Duración | Fondo | Uso |
| --- | --- | --- | --- | --- |
| **Explicador ilustrado** | "Vas a vender 100 USDT…", "Te llegó el pago pero tu banco no dice quién te pagó…" | 3–5 min | papel crema `#F0E8E0` | enseñar una regla de P2P |
| **Demo del producto** | "Si haces P2P en Binance desde Venezuela…" | 8 min | gris claro `#E0E0D8` → azul noche `#081018` | mostrar la app IVM funcionando |
| **Anuncio** | "El precio en Binance, los pagos en tu banco…" | 20–25 s | gris claro degradado `#F0F0F0` + negro | promo corta de la marca |

## Lenguaje visual

- **Acento único: amarillo tipo Binance.** Botones ("Vender USDT", "Liberar USDT", "Próximo video"),
  resaltador detrás del texto clave, líneas que conectan iconos.
- Verde = está bien (check, "Coincide", "QUEDA ESCRITO"). Rojo = peligro (tachado, X, "No liberes").
- Explicador: tarjetas blancas con contorno negro de ~2–3 px y esquinas redondeadas, ilustración
  de línea (puertas, tiendas, avatares), lupa, cédula, sellos.
- Tipografía: sans geométrica en negrita y apretada para todo; serif itálica solo para títulos
  de capítulo ("1 / 3 *Orden*", "*Liberar*", "*Términos del anuncio*"); mono para cifras de la app.
- Interfaces simuladas con datos realistas: orden de Binance P2P, movimiento del banco
  ("+Bs 100.000,00 · Pago Móvil"), chat con burbuja amarilla, buscador con la URL escribiéndose.
- Demo: teléfono oscuro al centro con tarjetas flotantes conectadas por líneas finas y un reloj
  arriba a la izquierda que marca el paso del día.
- Anuncio: iconos 3D (Binance, banco, calculadora) unidos por una línea amarilla, frases negras en
  pantalla negra para el problema, teléfono con iconos orbitando para la solución, cierre con logo
  "IVM · Tu P2P, en orden." y la URL.

## Estructura narrativa (explicador)

1. **Gancho**: el problema real en pantalla ("Ya te pagué. Libera.").
2. **Prueba social**: comentario real de un seguidor con sus likes.
3. **Narrador con credibilidad**: "Aarón · Hago P2P" y sus resultados (órdenes, % completadas).
4. **Mapa**: capítulos numerados ("1 / 3 Orden", "2 / 3 Liberar") o una línea de pasos.
5. **Metáfora cotidiana**: los términos del anuncio son el letrero en la puerta de la tienda.
6. **Paso a paso** con la interfaz simulada: cada frase de la voz tiene un visual.
7. **Microvisual del punto clave**: comparar MARIA vs MARIO letra por letra; Coincide → Liberas.
8. **Resumen** en una sola hoja con checklist.
9. **Práctica**: escribir `ivmp2p.com/practica` y hacer la orden de prueba.
10. **Próximo video**: tarjeta amarilla que adelanta el siguiente capítulo.

## Ritmo y sonido

- Explicador corto y anuncio: un cambio visual grande cada 2–3 s.
- Videos largos: escena nueva cada ~11 s, pero siempre hay algo moviéndose (texto que se escribe,
  resaltador, check que aparece). Casi no hay cortes secos: la cámara viaja entre tarjetas con
  desenfoque de movimiento.
- Voz en off continua, sin silencios de más de 0,4 s. Volumen −14 a −16 LUFS, rango corto.

## Relación con Hayden Hillier-Smith

De lo que él ha dicho en público: la historia va primero, y se decide antes de cortar en lugar
de dejar que el material mande. Aquí eso se traduce en una sola regla: cada visual existe para
explicar la frase que está diciendo la voz en ese momento, nada decorativo.

## Plantilla en este repo (`src/ivm/`)

Primera prueba del explicador ilustrado: "Compara el nombre antes de liberar" (28 s).

- `timeline.json`: los tiempos de cada evento **y el guion**. Cuando haya voz grabada, se
  ajustan aquí los segundos para que cada visual caiga sobre su frase.
- `piezas.tsx`: tarjetas, cabeceras (banco / orden), chat, avatar, casillas de letras, botones.
- `Explicador.tsx`: las 6 escenas sobre una "mesa" y la cámara que viaja entre ellas con
  desenfoque de movimiento.
- Sonido: `python3 scripts/sonido_ivm.py ivm.wav` y luego
  `ffmpeg -y -i ivm.wav -b:a 192k public/audio/ivm-explicador.mp3`.
- Render: `npm run render:ivm`. Los subtítulos se quitan con `--props='{"subtitulos":false}'`.

## Voz en off con ElevenLabs

`scripts/voz_elevenlabs.py` convierte el `guion` de un `timeline.json` en voz y guarda en
`voz.json` (junto al timeline) cuándo empieza y termina cada frase, para sincronizar los visuales.

Requisitos del entorno (configuración del entorno en la nube, no en el código):
- **Secreto de red** para `api.elevenlabs.io` con la cabecera `xi-api-key` (sin prefijo).
  La clave nunca entra en la sesión ni en el repo. En local sirve la variable `ELEVENLABS_API_KEY`.
- Opcional: `ELEVENLABS_VOICE_ID` con la voz por defecto.

```bash
python3 scripts/voz_elevenlabs.py --listar-voces
python3 scripts/voz_elevenlabs.py src/ivm/timeline.json --voz <voice_id> --salida public/audio/ivm-voz.mp3
```
