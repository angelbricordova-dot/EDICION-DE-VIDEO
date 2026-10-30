import { Easing, spring, SpringConfig } from "remotion";

// Utilidades de animación compartidas por todos los proyectos (no tienen estilo de ningún
// cliente): fps, interpolación, curvas y muelles.

export const FPS = 30;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = easeOut) =>
  ease(clamp01((t - t0) / (t1 - t0)));

export const sp = (t: number, inicio: number, config: Partial<SpringConfig> = {}) => {
  const fr = (t - inicio) * FPS;
  if (fr <= 0) return 0;
  return spring({ frame: fr, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8, ...config } });
};

export const POP: Partial<SpringConfig> = { damping: 11, stiffness: 200, mass: 0.7 };
