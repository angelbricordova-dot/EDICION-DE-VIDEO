# Edición de video con Remotion

Proyecto de video programático con [Remotion](https://www.remotion.dev/) (React + TypeScript).

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm install
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Abre Remotion Studio para previsualizar y editar en el navegador |
| `npm run render` | Renderiza el video `Cambio` en `out/cambio.mp4` |
| `npm run render:hello` | Renderiza la composición de ejemplo `HelloWorld` |
| `npm run build` | Genera el bundle de la app |
| `npm run lint` | Verifica los tipos con TypeScript |
| `npm run upgrade` | Actualiza los paquetes de Remotion |

## Video «Cambio» (`src/cambio/`)

Recreación en español de un edit de tipografía cinética con objetos en pixel art
(1440×1080, 30 fps, 20,5 s). Los textos:

| Tiempo | Texto |
| --- | --- |
| 0:00 | ¿cómo comunicas que estás atravesando un cambio? |
| 0:04 | no lo haces. / simplemente lo demuestras. |
| 0:08 | acción. · intención. · curiosidad. |
| 0:14 | a través de tu propia capacidad |
| 0:16 | A M O R |

- `Cambio.tsx`: línea de tiempo con todas las escenas (frames de inicio y duración).
- `escenas/`: una escena por archivo; los textos están escritos directamente ahí.
- `sprites.ts`: los objetos en pixel art como cuadrículas de colores (fáciles de editar).
- `elementos.tsx`: piezas reutilizables (destello, grano, silueta, mano, trazos a mano).

### Agregar audio

Copia tu voz en off o música a `public/` y pásala como prop:

```bash
npx remotion render Cambio out/cambio.mp4 --props='{"audio":"voz.mp3"}'
```

## Estructura

- `src/index.ts`: punto de entrada (`registerRoot`)
- `src/Root.tsx`: aquí se registran las composiciones (duración, fps, resolución)
- `src/HelloWorld.tsx`: composición de ejemplo con animación del título
- `public/`: archivos estáticos (videos, audio, imágenes) accesibles con `staticFile()`
- `remotion.config.ts`: configuración del CLI

## Nota

La primera vez que renderices, Remotion descarga automáticamente Chrome Headless Shell.
Si tu red lo bloquea, usa un Chromium local:

```bash
npx remotion render HelloWorld out/video.mp4 --browser-executable=/ruta/a/chrome
```
