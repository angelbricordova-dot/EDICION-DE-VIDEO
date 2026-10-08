import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FUENTE = "Outfit";

loadFont({
  family: FUENTE,
  url: staticFile("fonts/outfit-600.woff2"),
  weight: "600",
});

export const COLORES = {
  papel: "#e2e1de",
  tinta: "#1b1b1b",
  negro: "#0b0b0b",
  rojo: "#e0262b",
  granate: "#2a1313",
  cafe: "#5a2a1a",
  blanco: "#f4f2ee",
};

export const textoBase: React.CSSProperties = {
  fontFamily: FUENTE,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  whiteSpace: "nowrap",
};
