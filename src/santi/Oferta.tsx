import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, FPS, POP, prog, sp } from "../comun/animacion";

// Santi / VitalUrge (docs/santi.md): tarjeta final de la oferta del guion
// "Compra 2 frascos y llévate otro completamente gratis: 3 meses de tratamiento por el precio de 2.
//  Garantía de devolución de dinero de 90 días." Colores del frasco (amarillo mostaza + blanco) sobre el
// ambiente cálido de la cantina. Encima de los planos de IA irá con el fondo desenfocado de la escena.

let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  for (const p of ["800", "900"]) {
    loadFont({ family: "Montserrat", url: staticFile(`santi/fuentes/montserrat-latin-${p}-normal.woff2`), weight: p });
    loadFont({ family: "Montserrat", url: staticFile(`santi/fuentes/montserrat-latin-ext-${p}-normal.woff2`), weight: p });
  }
};
const F = '"Montserrat", sans-serif';
const AMARILLO = "#E8B21A";
const MOSTAZA = "#C8920E";

export const DURACION_OFERTA = 7;

export const OfertaSanti: React.FC<{ fondo?: string }> = ({ fondo }) => {
  cargar();
  const t = useCurrentFrame() / FPS;
  const frascos = [0, 1, 2].map((i) => sp(t, 0.15 + i * 0.18, POP));
  const gratis = sp(t, 1.1, POP);
  const titulo = prog(t, 0.5, 1.0);
  const sub = prog(t, 1.6, 2.1);
  const sello = sp(t, 2.3, { damping: 9, stiffness: 160 });
  const boton = prog(t, 2.9, 3.4);
  const latido = 1 + 0.045 * Math.max(0, Math.sin((t - 3.4) * Math.PI * 2 * 0.9)) * clamp01(t - 3.4);
  const flecha = Math.sin(t * Math.PI * 2 * 1.2) * 10;
  return (
    <AbsoluteFill style={{ background: "#2A1406", fontFamily: F, overflow: "hidden" }}>
      {fondo ? (
        <Img src={staticFile(fondo)} style={{ position: "absolute", inset: -40, width: 1160, height: 2000, objectFit: "cover", filter: "blur(22px) brightness(0.55) saturate(1.2)" }} />
      ) : (
        // sin plano todavía: luces cálidas desenfocadas como las de la cantina
        <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 15%, #A2561A 0, transparent 38%), radial-gradient(circle at 85% 30%, #7A3A10 0, transparent 35%), radial-gradient(circle at 50% 95%, #5A2A0A 0, transparent 45%), linear-gradient(#3B1C08, #1B0C03)" }} />
      )}
      {/* titular */}
      <div style={{ position: "absolute", top: 230, left: 60, right: 60, textAlign: "center", opacity: titulo, translate: `0 ${(1 - titulo) * 40}px` }}>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: "#fff", textShadow: "0 6px 24px rgba(0,0,0,.5)" }}>
          COMPRA 2 Y LLÉVATE <span style={{ color: AMARILLO }}>1 GRATIS</span>
        </div>
      </div>
      {/* tres frascos: el tercero con la etiqueta GRATIS */}
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 760 }}>
        {frascos.map((k, i) => {
          const x = [250, 540, 830][i];
          const s = i === 1 ? 1.08 : 0.92;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: i === 1 ? 0 : 60, translate: "-50% 0", scale: String(s * (0.6 + 0.4 * k)), opacity: clamp01(k * 1.5), transformOrigin: "50% 100%", zIndex: i === 1 ? 2 : 1 }}>
              <Img src={staticFile("santi/producto/frasco.png")} style={{ width: 330, filter: "drop-shadow(0 24px 30px rgba(0,0,0,.55))" }} />
              {i === 2 ? (
                <div style={{ position: "absolute", top: -26, right: -40, rotate: `${-12 + (1 - gratis) * 30}deg`, scale: String(gratis), background: "#E3262E", color: "#fff", fontWeight: 900, fontSize: 52, padding: "8px 24px", borderRadius: 14, boxShadow: "0 8px 18px rgba(0,0,0,.4)" }}>GRATIS</div>
              ) : null}
            </div>
          );
        })}
      </div>
      {/* 3 meses por el precio de 2 */}
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: sub, scale: String(0.9 + 0.1 * sub) }}>
        <div style={{ background: "#fff", borderRadius: 22, padding: "14px 34px", fontWeight: 800, fontSize: 50, color: "#2A1406", textAlign: "center", lineHeight: 1.1 }}>
          3 meses de tratamiento<br />
          <span style={{ color: MOSTAZA }}>por el precio de 2</span>
        </div>
      </div>
      {/* sello de 90 días (del cliente) */}
      <Img src={staticFile("santi/producto/sello-90.png")} style={{ position: "absolute", top: 470, left: 30, width: 230, scale: String(sello), rotate: `${(1 - sello) * -40 - 8}deg`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,.5))" }} />
      {/* botón */}
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: boton }}>
        <div style={{ background: AMARILLO, color: "#2A1406", fontWeight: 900, fontSize: 58, padding: "22px 60px", borderRadius: 999, scale: String(latido), boxShadow: "0 10px 30px rgba(232,178,26,.45)" }}>HAZ CLIC ABAJO</div>
        <svg width="70" height="70" viewBox="0 0 70 70" style={{ marginTop: 18, translate: `0 ${flecha}px` }}>
          <path d="M35 8 V56 M14 36 L35 58 L56 36" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontWeight: 800, fontSize: 30, color: "rgba(255,255,255,.75)", opacity: prog(t, 3.2, 3.8, easeOut) }}>Garantía de devolución de dinero de 90 días</div>
    </AbsoluteFill>
  );
};
