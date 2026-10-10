// Utilidades de timing adaptadas de whaleyxbt/claude-motion (src/lib.ts, licencia MIT).
import { useEffect, useState } from "react";
import { continueRender, delayRender, Easing, spring, SpringConfig, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import timeline from "./timeline.json";

export const TL = timeline;
export const FPS = TL.fps;
export const W = 1080;
export const H = 1080;
export const MARGEN = 90;

export const C = {
  fondo: "#141413",
  crema: "#F0EEE6",
  cremaTenue: "rgba(240,238,230,0.64)",
  apagado: "rgba(240,238,230,0.38)",
  linea: "rgba(240,238,230,0.14)",
  acento: "#E0262B",
  tinta: "#141413",
  tintaTenue: "rgba(20,20,19,0.62)",
};

export const F = {
  display: "Outfit, system-ui, sans-serif",
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

const fuentes = Promise.all([
  loadFont({ family: "Outfit", url: staticFile("fonts/outfit-600.woff2"), weight: "600" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/jetbrains-mono-500.woff2"), weight: "500" }),
]);

/** true cuando las fuentes están listas; mide texto solo después de esto. */
export const useFuentesListas = () => {
  const [listas, setListas] = useState(false);
  const [handle] = useState(() => delayRender("Cargando fuentes de la prueba"));
  useEffect(() => {
    fuentes.then(() => {
      setListas(true);
      continueRender(handle);
    });
  }, [handle]);
  return listas;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);

/** Progreso 0..1 entre t0 y t1 (segundos) con easing. */
export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = easeInOut) =>
  ease(clamp01((t - t0) / (t1 - t0)));

/** Spring que arranca en startSec. */
export const sp = (frame: number, startSec: number, config: Partial<SpringConfig> = {}) => {
  const fr = frame - startSec * FPS;
  if (fr <= 0) return 0;
  return spring({ frame: fr, fps: FPS, config: { damping: 14, mass: 0.8, stiffness: 140, ...config } });
};

export const POP: Partial<SpringConfig> = { damping: 10, stiffness: 215, mass: 0.7 };
export const MUESCA: Partial<SpringConfig> = { damping: 12, stiffness: 190, mass: 0.75 };

/** Pseudoaleatorio determinista en [0,1). */
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
