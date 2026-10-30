import React from "react";
import { Img, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, lerp, prog, sp } from "../comun/animacion";

// Piezas de los videos de pronósticos de fútbol (docs/pronosticos.md), copiando la edición de
// las referencias del cliente: todo plano sobre la parte de arriba (sin cajas), tipografía
// condensada en mayúsculas (Bebas Neue), blanco con sombra, etiquetas rojas, puntos G/E/P y
// palabras clave sueltas en amarillo sobre el pecho.

export const ROJO = "#E3262F";
export const VERDE = "#22B35A";
export const AMARILLO = "#FFD60A";
export const FUENTE = '"Bebas Neue", "Bebas Neue Ext", "Anton", Impact, sans-serif';
const SOMBRA = "0 3px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)";

let fuentes = false;
export const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Bebas Neue", url: staticFile("pronosticos/fuentes/bebas-neue-latin-400-normal.woff2") });
  loadFont({ family: "Bebas Neue Ext", url: staticFile("pronosticos/fuentes/bebas-neue-latin-ext-400-normal.woff2") });
  loadFont({ family: "Anton", url: staticFile("pronosticos/fuentes/anton-latin-400-normal.woff2") });
};

export type Palabra = { p: string; ini: number; fin: number };

/** Aparición: sube un poco, crece de 0,85 a 1 y se enfoca; salida rápida. */
export const Aparece: React.FC<{ t: number; t0: number; t1?: number; children: React.ReactNode; desde?: number; dy?: number }> = ({ t, t0, t1 = 1e9, children, desde = 0.85, dy = 14 }) => {
  if (t < t0 - 0.01 || t > t1 + 0.18) return null;
  const k = sp(t, t0, { damping: 13, stiffness: 230, mass: 0.6 });
  const sale = prog(t, t1, t1 + 0.18);
  return (
    <div style={{ opacity: clamp01((t - t0) / 0.08) * (1 - sale), scale: String(lerp(desde, 1, k) - sale * 0.06), translate: `0 ${(1 - k) * dy}px`, filter: t - t0 < 0.1 ? `blur(${(1 - (t - t0) / 0.1) * 4}px)` : undefined }}>
      {children}
    </div>
  );
};

/** Texto blanco condensado con sombra (como las líneas de las referencias). */
export const Texto: React.FC<{ children: React.ReactNode; tam?: number; color?: string; style?: React.CSSProperties }> = ({ children, tam = 46, color = "#fff", style }) => (
  <span style={{ fontFamily: FUENTE, fontSize: tam, lineHeight: 1, letterSpacing: "0.01em", color, textShadow: SOMBRA, whiteSpace: "nowrap", ...style }}>{children}</span>
);

/** Etiqueta roja recta (DEBUTA EN EL DERBI, SUSPENDIDO, MAÑANA…). */
export const Etiqueta: React.FC<{ children: React.ReactNode; tam?: number; color?: string }> = ({ children, tam = 34, color = ROJO }) => (
  <span style={{ display: "inline-block", fontFamily: FUENTE, fontSize: tam, lineHeight: 1, letterSpacing: "0.02em", color: "#fff", background: color, borderRadius: tam * 0.18, padding: `${tam * 0.16}px ${tam * 0.32}px ${tam * 0.1}px`, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{children}</span>
);

export const Escudo: React.FC<{ club: string; tam?: number; style?: React.CSSProperties }> = ({ club, tam = 150, style }) => (
  <Img src={staticFile(`pronosticos/escudos/${club}.png`)} style={{ height: tam, width: "auto", display: "block", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))", ...style }} />
);

/** Escudo misterioso (gris con "?") que gira y se convierte en el escudo real. */
export const EscudoMisterio: React.FC<{ t: number; revela: number; club: string; tam?: number }> = ({ t, revela, club, tam = 170 }) => {
  const giro = prog(t, revela - 0.05, revela + 0.3, easeOut);
  const real = giro > 0.5;
  const sx = Math.abs(Math.cos(giro * Math.PI));
  return (
    <div style={{ height: tam, display: "flex", alignItems: "center", justifyContent: "center", scale: `${Math.max(0.04, sx)} 1` }}>
      {real ? (
        <Escudo club={club} tam={tam} />
      ) : (
        <svg width={tam * 0.8} height={tam} viewBox="0 0 80 100" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))" }}>
          <path d="M40 3 L76 14 V48 C76 72 60 88 40 97 C20 88 4 72 4 48 V14 Z" fill="#3A3F47" stroke="#C9CED6" strokeWidth={3} />
          <text x={40} y={66} textAnchor="middle" fontFamily="Bebas Neue, Anton, Impact" fontSize={52} fill="#fff">?</text>
        </svg>
      )}
    </div>
  );
};

/** Punto de resultado G / E / P. */
export const Punto: React.FC<{ r: "G" | "E" | "P"; tam?: number }> = ({ r, tam = 40 }) => (
  <div style={{ width: tam, height: tam, borderRadius: "50%", background: r === "G" ? VERDE : r === "E" ? "#8E949C" : ROJO, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: tam * 0.62, paddingTop: tam * 0.06, boxShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>{r}</div>
);

/** Marcador: escudo  goles – goles  escudo. */
export const Marcador: React.FC<{ local: string; visita: string; gl: number | string; gv: number | string; tam?: number }> = ({ local, visita, gl, gv, tam = 120 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: tam * 0.28 }}>
    <Escudo club={local} tam={tam} />
    <Texto tam={tam * 0.95}>
      {gl} – {gv}
    </Texto>
    <Escudo club={visita} tam={tam} />
  </div>
);

/** Foto de jugador en círculo (en gris si es baja), con etiqueta y nombre debajo. */
export const Jugador: React.FC<{ foto?: string; nombre?: string; etiqueta?: string; baja?: boolean; tam?: number; duda?: boolean }> = ({ foto, nombre, etiqueta, baja, tam = 170, duda }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <div style={{ width: tam, height: tam, borderRadius: "50%", overflow: "hidden", border: `${Math.max(3, tam * 0.03)}px solid #fff`, background: duda ? "rgba(255,170,0,0.28)" : "rgba(30,34,40,0.55)", boxShadow: "0 6px 16px rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {foto ? (
        <Img src={staticFile(`pronosticos/jugadores/${foto}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: baja ? "grayscale(1) brightness(0.92)" : undefined }} />
      ) : (
        <svg width={tam * 0.78} height={tam * 0.78} viewBox="0 0 24 24">
          <circle cx={12} cy={8.5} r={4.6} fill={duda ? "#FFC23D" : "#B9C0C9"} />
          <path d="M3 24 a9 8 0 0 1 18 0 Z" fill={duda ? "#FFC23D" : "#B9C0C9"} />
          {duda ? <text x={12} y={11.3} textAnchor="middle" fontFamily="Bebas Neue, Anton" fontSize={7.5} fill="#5A3A00">?</text> : null}
        </svg>
      )}
    </div>
    {etiqueta ? (
      <div style={{ position: "relative", zIndex: 2, marginTop: 2 }}>
        <Etiqueta tam={tam * 0.2}>{etiqueta}</Etiqueta>
      </div>
    ) : null}
    {nombre ? <Texto tam={tam * 0.2}>{nombre}</Texto> : null}
  </div>
);

/** Palabra clave suelta en amarillo con contorno (sobre el pecho). */
export const Clave: React.FC<{ t: number; t0: number; t1: number; texto: string; y?: number }> = ({ t, t0, t1, texto, y = 1440 }) =>
  t >= t0 - 0.02 && t < t1 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily: FUENTE, fontSize: 86, lineHeight: 1, color: AMARILLO, WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: "0 5px 12px rgba(0,0,0,0.55)", scale: String(lerp(1.25, 1, easeOut(clamp01((t - t0) / 0.12)))), display: "inline-block" }}>{texto}</span>
    </div>
  ) : null;
