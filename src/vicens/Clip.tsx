import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import guion from "./avion.json";

// Vicens · GTA 6 (Clipeamos, docs/vicens.md). Formato 2 del brief: "gameplay vertical con cámara pequeña".
// La base (cámara arriba 1080×740 + gameplay 1080×1180, audio a −14 LUFS) la arma scripts/vicens/base_clip.sh.
// Encima: cartel blanco con texto negro centrado en el borde inferior de la cámara (solo al principio),
// subtítulos blancos con trazo negro justo encima del cartel y la marca oficial al 100 % debajo. Al quitar
// el cartel, los subtítulos pasan al borde de la cámara y la marca justo debajo.

type Guion = { duracion: number; cartel: string[]; cartelHasta: number; subs: { ini: number; fin: number; t: string }[] };
const G = guion as Guion;
const BORDE = 740; // borde inferior de la cámara

let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  for (const p of ["800", "900"]) {
    loadFont({ family: "Montserrat", url: staticFile(`vicens/fuentes/montserrat-latin-${p}-normal.woff2`), weight: p });
    loadFont({ family: "Montserrat", url: staticFile(`vicens/fuentes/montserrat-latin-ext-${p}-normal.woff2`), weight: p });
  }
};
const F = '"Montserrat", sans-serif';

export const DURACION_VICENS = G.duracion;

export const ClipVicens: React.FC = () => {
  cargar();
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const conCartel = t < G.cartelHasta;
  const CARTEL_H = 140;
  const sub = G.subs.find((s) => t >= s.ini && t < s.fin);
  const k = sub ? Math.min(1, (t - sub.ini) / 0.08) : 0;
  // con cartel: subtítulo encima del cartel y marca debajo; sin cartel: subtítulo en el borde y marca debajo
  const subY = conCartel ? BORDE - CARTEL_H / 2 - 62 : BORDE;
  const marcaY = conCartel ? BORDE + CARTEL_H / 2 + 22 : BORDE + 62;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: F }}>
      <OffthreadVideo src={staticFile("vicens/material/base.mp4")} />
      {conCartel ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: BORDE, translate: "0 -50%", display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", color: "#000", borderRadius: 18, padding: "16px 28px", fontWeight: 900, fontSize: 46, lineHeight: 1.15, textAlign: "center", whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.35)" }}>
            {G.cartel.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      ) : null}
      {sub ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: subY, translate: `0 calc(-50% + ${(1 - k) * 10}px)`, textAlign: "center", opacity: k, scale: String(0.92 + 0.08 * k) }}>
          <span style={{ fontWeight: 900, fontSize: 66, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", whiteSpace: "nowrap", textShadow: "0 4px 10px rgba(0,0,0,.5)" }}>{sub.t}</span>
        </div>
      ) : null}
      {/* marca oficial de Vicens al 100 % de opacidad */}
      <Img src={staticFile("vicens/material/marca-logo.png")} style={{ position: "absolute", left: (1080 - 560) / 2, top: marcaY, width: 560 }} />
    </AbsoluteFill>
  );
};
