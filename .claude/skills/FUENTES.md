# Skills instaladas

Copiadas tal cual desde el commit revisado de cada repo (revisión estática, octubre de 2026:
sin hooks, sin servidores MCP, sin llamadas de red ni código ofuscado).

| Skill | Origen | Commit | Licencia |
| --- | --- | --- | --- |
| `remotion-best-practices` (incluye todas las sub-skills oficiales) | [remotion-dev/skills](https://github.com/remotion-dev/skills) | `32b241b` | la del repo de Remotion |
| `motion-design`, `review-loop`, `sound-design` | [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | `e627941` | MIT (`LICENSE-claude-motion`) |
| `lottie-motion-design` | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | `f9a8a04` | MIT (`LICENSE-lottiefiles`) |

Único cambio: la skill de LottieFiles se llamaba `motion-design` y chocaba con la de
claude-motion, así que se renombró a `lottie-motion-design` (carpeta y `name:`).

## Cómo se aplican las skills de claude-motion en este repo

Esas skills hablan de archivos de su propio repo. Aquí equivalen a:

| En la skill | En este repo |
| --- | --- |
| `timeline.json` | `src/prueba/timeline.json` (un timeline por video) |
| `src/lib.ts` | `src/prueba/lib.ts` |
| `npm run draft` / `sheet` / `wave` | mismos nombres en `package.json`, apuntando a la prueba |
| motor `sfx/` (`python3 -m sfx …`) | copiado en `sfx/` (MIT); la prueba usa `scripts/sonido_prueba.py` |
| `scripts/sheet.mjs`, `scripts/wave.mjs` | copiados en `scripts/` (MIT) |
