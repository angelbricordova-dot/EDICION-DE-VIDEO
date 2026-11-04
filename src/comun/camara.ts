import { clamp01, easeInOut, lerp } from "./animacion";

// Cámara por fotogramas clave, compartida por los proyectos (antes vivía en tucacas/web/escenas y
// TuBodega la tomaba de ahí): cada movimiento llega a su clave en ~0,42 s y se queda; `lento`
// reparte el movimiento por todo el tramo.

export type Clave = { t: number; escala: number; x: number; y: number; giro?: number; lento?: boolean };
export const DUR_MOVIMIENTO = 0.42;
const SNAP = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const claveEn = (claves: Clave[], t: number): Clave => {
  if (t <= claves[0].t) return claves[0];
  for (let i = 0; i < claves.length - 1; i++) {
    const a = claves[i];
    const b = claves[i + 1];
    if (t < b.t) {
      const dur = b.lento ? b.t - a.t : Math.min(b.t - a.t, DUR_MOVIMIENTO);
      const k = b.lento ? easeInOut(clamp01((t - a.t) / dur)) : SNAP(clamp01((t - (b.t - dur)) / dur));
      return { t, escala: lerp(a.escala, b.escala, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), giro: lerp(a.giro ?? 0, b.giro ?? 0, k) };
    }
  }
  return claves[claves.length - 1];
};

/** Desenfoque de movimiento según la velocidad de la cámara entre dos cuadros. */
export const desenfoqueCamara = (claves: Clave[], t: number, s0: number) => {
  const a = claveEn(claves, t - 1 / 30);
  const b = claveEn(claves, t);
  const vel = Math.hypot((b.x - a.x) * b.escala * s0, (b.y - a.y) * b.escala * s0) + Math.abs(b.escala - a.escala) * 900;
  return Math.min(9, vel * 0.05);
};
