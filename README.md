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
| `npm run render` | Renderiza la composición `HelloWorld` en `out/video.mp4` |
| `npm run build` | Genera el bundle de la app |
| `npm run lint` | Verifica los tipos con TypeScript |
| `npm run upgrade` | Actualiza los paquetes de Remotion |

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
