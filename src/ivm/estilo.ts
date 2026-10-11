import { loadFont } from "@remotion/fonts";
import { Easing, spring, SpringConfig, staticFile } from "remotion";
import timeline from "./timeline.json";

export const TL = timeline;
export const FPS = TL.fps;
export const W = 1920;
export const H = 1080;

loadFont({ family: "Inter Tight", url: staticFile("fonts/inter-tight-500.woff2"), weight: "500" });
loadFont({ family: "Inter Tight", url: staticFile("fonts/inter-tight-700.woff2"), weight: "700" });
loadFont({
  family: "Instrument Serif",
  url: staticFile("fonts/instrument-serif-italic.woff2"),
  weight: "400",
  style: "italic",
});

// Paleta medida en los videos de referencia de IVM.
export const C = {
  papel: "#F1EADF",
  blanco: "#FFFFFF",
  tinta: "#161616",
  gris: "#6E6A63",
  grisClaro: "#C9C2B6",
  amarillo: "#F0B90B",
  amarilloSuave: "#F7DE90",
  verde: "#1E9E5A",
  verdeSuave: "#D9F0E1",
  rojo: "#E5484D",
  rojoSuave: "#FBE0E0",
  azulGris: "#DCE3EE",
};

export const F = {
  sans: '"Inter Tight", system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
};

export const BORDE = `3px solid ${C.tinta}`;
export const RADIO = 22;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Progreso 0..1 entre t0 y t1 (segundos). */
export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = easeOut) =>
  ease(clamp01((t - t0) / (t1 - t0)));

/** Spring que arranca en el segundo `inicio`. */
export const sp = (t: number, inicio: number, config: Partial<SpringConfig> = {}) => {
  const fr = (t - inicio) * FPS;
  if (fr <= 0) return 0;
  return spring({ frame: fr, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8, ...config } });
};

export const POP: Partial<SpringConfig> = { damping: 10, stiffness: 220, mass: 0.7 };

/** Texto que se escribe: devuelve la parte visible. */
export const escribiendo = (t: number, texto: string, t0: number, t1: number) =>
  texto.slice(0, Math.floor(clamp01((t - t0) / (t1 - t0)) * texto.length));
