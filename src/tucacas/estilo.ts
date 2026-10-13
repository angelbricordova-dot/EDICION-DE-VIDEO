import { loadFont } from "@remotion/fonts";
import { Easing, spring, SpringConfig, staticFile } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Zonas seguras 9:16 del brief: 250 px arriba, 420 abajo, 60 a los lados.
export const SEGURA = { arriba: 250, abajo: 420, lados: 60 };

// Las fuentes están en public/tucacas (ignorado por git): se cargan solo cuando
// se usa una composición de Tucacas, para no romper el resto de videos.
let fuentesCargadas = false;
export const cargarFuentes = () => {
  if (fuentesCargadas) return;
  fuentesCargadas = true;
  loadFont({ family: "Bricolage Grotesque", url: staticFile("tucacas/fuentes/bricolage.woff2"), weight: "200 800" });
  loadFont({ family: "Onest", url: staticFile("tucacas/fuentes/onest.woff2"), weight: "100 900" });
  loadFont({ family: "Nunito", url: staticFile("tucacas/fuentes/nunito.woff2"), weight: "200 1000" });
};

// Colores exactos del brief (sección 2).
export const C = {
  verde: "#1d7f68",
  verde2: "#14706c",
  verdeProfundo: "#0e4f4a",
  tinta: "#0b3a36",
  mar: "#17a3a0",
  sol: "#f4b63f",
  solSuave: "#fdf1d6",
  coral: "#d8613c",
  arena: "#f4f7f6",
  blanco: "#ffffff",
  texto: "#0f2724",
};

export const DEGRADADO_PORTADA = `linear-gradient(160deg, ${C.verde} 0%, ${C.verde2} 50%, ${C.verdeProfundo} 100%)`;

export const F = {
  titulo: '"Bricolage Grotesque", system-ui, sans-serif',
  texto: "Onest, system-ui, sans-serif",
  /** Subtítulos del comercial web: redondeada. */
  subs: "Nunito, Onest, system-ui, sans-serif",
};

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
