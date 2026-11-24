import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog, sp } from "../comun/animacion";
import { B, camara, cargarFuentes, IconoWhatsApp, Marca, Telefono, Toque, type Contenido } from "./piezas";
import guionJson from "./guion-venta.json";

// TuBodega · versión A de VENTA (vertical, 25-nov-2026, docs/tubodega.md): comercial, limpia y suave.
// Voz de Richard + música: scripts/tubodega/guion_venta.py → guion-venta.json y audio/venta-mezcla.mp3.
// Letra de títulos y subtítulos: Lexend ExtraBold (parecida a la Cocogoose de Marryto, licencia libre).

type Palabra = { p: string; t: number; fin: number };
type FraseV = { desde: number; hasta: number; texto: string; clave: string; palabras: Palabra[] };
const G = guionJson as unknown as { duracion: number; frases: FraseV[] };
const F = G.frases.map((f) => f.desde);
export const DUR_VENTA = G.duracion;

const LEXEND = '"Lexend", system-ui, sans-serif';
const CAVEAT = '"Caveat", cursive';
let fuentesVenta = false;
const cargarVenta = () => {
  cargarFuentes();
  if (fuentesVenta) return;
  fuentesVenta = true;
  loadFont({ family: "Lexend", url: staticFile("tubodega/fuentes/lexend-800.woff2"), weight: "800" });
  loadFont({ family: "Caveat", url: staticFile("tubodega/fuentes/caveat-700.woff2"), weight: "700" });
};

const MENTA = "#9BF5C9";
const OSCURO = "#0E241B";

/** Letra gordita con borde y sombra (como en Marryto): blanca, trazo oscuro, sombra paralela y halo. */
const letra = (tam: number, color = "#fff"): React.CSSProperties => ({
  fontFamily: LEXEND,
  fontWeight: 800,
  fontSize: tam,
  lineHeight: 1.12,
  letterSpacing: "-0.01em",
  color,
  WebkitTextStroke: `${(tam * 0.13).toFixed(1)}px ${OSCURO}`,
  paintOrder: "stroke fill",
  textShadow: `${(tam * 0.06).toFixed(1)}px ${(tam * 0.09).toFixed(1)}px 0 ${OSCURO}, 0 0 ${(tam * 0.3).toFixed(1)}px rgba(0,0,0,0.45), 0 ${(tam * 0.08).toFixed(1)}px ${(tam * 0.5).toFixed(1)}px rgba(0,0,0,0.35)`,
});

const Efecto: React.FC<{ t: number; n: string; v?: number }> = ({ t, n, v = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(t * FPS))} layout="none">
    <Audio src={staticFile(`tubodega/sfx/${n}.wav`)} volume={v} />
  </Sequence>
);

// ------------------------------------------------------------------ fondo

/** Degradado de marca con dos luces suaves que se mueven despacio (sin patrones ni ruido). */
const Fondo: React.FC<{ t: number; oscuro: number }> = ({ t, oscuro }) => (
  <AbsoluteFill style={{ background: `linear-gradient(170deg, ${B.verde} 0%, #1D6548 100%)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 540 - 700 + Math.sin(t * 0.25) * 160, top: 200 + Math.cos(t * 0.2) * 120, width: 1400, height: 1400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 62%)" }} />
    <div style={{ position: "absolute", left: -300 + Math.cos(t * 0.18) * 140, top: 1100 + Math.sin(t * 0.22) * 120, width: 1300, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,245,201,0.14) 0%, rgba(155,245,201,0) 60%)" }} />
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 40%, #173B2C 0%, ${OSCURO} 100%)`, opacity: oscuro }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ textos

/** Titular de arriba: palabras que suben desde una máscara con desenfoque; sale hacia arriba. */
const Titular: React.FC<{ t: number; t0: number; hasta: number; texto: string; verde?: string; tam?: number; y?: number }> = ({ t, t0, hasta, texto, verde, tam = 84, y = 255 }) => {
  if (t < t0 - 0.1 || t > hasta + 0.1) return null;
  const sale = prog(t, hasta - 0.35, hasta, easeInOut);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: tam * 0.28, opacity: 1 - sale, translate: `0 ${-sale * 40}px`, filter: sale > 0.02 ? `blur(${(sale * 10).toFixed(1)}px)` : undefined }}>
      {texto.split(" ").map((w, i) => {
        const p = prog(t, t0 + i * 0.07, t0 + i * 0.07 + 0.55, easeOut);
        const es = verde && w.replace(/[¿?.,!¡]/g, "") === verde;
        return (
          <span key={i} style={{ display: "inline-block", ...letra(tam, es ? MENTA : "#fff"), opacity: clamp01(p * 1.6), translate: `0 ${(1 - p) * 60}px`, filter: p < 0.98 ? `blur(${((1 - p) * 12).toFixed(1)}px)` : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Subtítulos de una línea (máx. 22 caracteres) con el tiempo real de cada palabra: entran suaves
 * (suben + desenfoque → nítidas) y la palabra clave va en verde menta.
 */
const Subtitulos: React.FC<{ t: number; ocultar: number[] }> = ({ t, ocultar }) => {
  const fi = G.frases.findIndex((x) => t >= x.desde - 0.08 && t < x.hasta + 0.25);
  if (fi < 0 || ocultar.includes(fi)) return null;
  const f = G.frases[fi];
  const bloques: Palabra[][] = [];
  let act: Palabra[] = [];
  for (const w of f.palabras) {
    const largo = act.map((x) => x.p).join(" ").length + w.p.length + 1;
    if (act.length && largo > 22) {
      bloques.push(act);
      act = [];
    }
    act.push(w);
  }
  if (act.length) bloques.push(act);
  let bi = 0;
  for (let i = 0; i < bloques.length; i++) if (t >= bloques[i][0].t - 0.08) bi = i;
  const bl = bloques[bi];
  const clave = f.clave.toLowerCase();
  const TAM = 68;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1478, display: "flex", justifyContent: "center", columnGap: TAM * 0.3, whiteSpace: "nowrap" }}>
      {bl.map((w, i) => {
        const p = prog(t, w.t - 0.08, w.t + 0.22, easeOut);
        const es = w.p.toLowerCase().replace(/[¿?.,!¡:"]/g, "") === clave.replace(/[¿?.,!¡:"]/g, "");
        return (
          <span key={`${bi}-${i}`} style={{ display: "inline-block", ...letra(TAM, es ? MENTA : "#fff"), opacity: clamp01(p * 1.8), translate: `0 ${(1 - p) * 26}px`, scale: String(lerp(0.92, 1, p)), filter: p < 0.97 ? `blur(${((1 - p) * 7).toFixed(1)}px)` : undefined }}>
            {w.p}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ escenas

/** Gancho: "¿Cuánto ganaste hoy?" enorme y debajo un contador de $ que gira sin parar (nadie lo sabe). */
const Gancho: React.FC<{ t: number; hasta: number }> = ({ t, hasta }) => {
  const ws = G.frases[0].palabras;
  const sale = prog(t, hasta - 0.5, hasta, easeInOut);
  const sube = prog(t, F[1] - 0.1, F[1] + 0.6, easeInOut);
  const cuenta = prog(t, 0.6, 1.2, easeOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - sale, scale: String(1 - sale * 0.08), filter: sale > 0.02 ? `blur(${(sale * 14).toFixed(1)}px)` : undefined }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: lerp(560, 300, sube), display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 34, scale: String(lerp(1, 0.78, sube)) }}>
        {ws.map((w, i) => {
          const p = prog(t, w.t - 0.12, w.t + 0.35, easeOut);
          return (
            <span key={i} style={{ display: "inline-block", ...letra(128, w.p.startsWith("ganaste") ? MENTA : "#fff"), opacity: clamp01(p * 1.6), translate: `0 ${(1 - p) * 70}px`, filter: p < 0.98 ? `blur(${((1 - p) * 14).toFixed(1)}px)` : undefined }}>
              {w.p}
            </span>
          );
        })}
      </div>
      {/* contador que no se detiene */}
      <div style={{ position: "absolute", left: 0, right: 0, top: lerp(1010, 610, sube), display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: cuenta * (1 - sube), scale: String(lerp(0.85, 1, cuenta)) }}>
        <span style={letra(170, MENTA)}>$</span>
        {[0, 1, 2].map((i) => {
          const v = t * (9 + i * 4) + i * 3.3;
          const d = Math.floor(v) % 10;
          const fr = v - Math.floor(v);
          return (
            <div key={i} style={{ position: "relative", width: 112, height: 200, overflow: "hidden" }}>
              {[d, (d + 1) % 10].map((n, k) => (
                <div key={k} style={{ position: "absolute", left: 0, right: 0, top: (k - fr) * 200, textAlign: "center", ...letra(170), filter: "blur(3px)" }}>
                  {n}
                </div>
              ))}
            </div>
          );
        })}
        <span style={{ ...letra(170, MENTA), opacity: prog(t, 1.4, 1.8) }}>?</span>
      </div>
      <Cuaderno t={t} t0={F[1]} />
    </AbsoluteFill>
  );
};

/** Cuaderno de la bodega (recto): apuntes a mano que se tachan y un total que nadie sabe. */
const Cuaderno: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0 - 0.2) return null;
  const k = sp(t, t0 - 0.1, { damping: 16, stiffness: 120, mass: 0.9 });
  const filas = [
    ["Sra. Carmen", "3 $"],
    ["Pan x 2", "1,40"],
    ["José (fiado)", "¿?"],
    ["Refresco", "2,10"],
    ["Vuelto Bs", "???"],
  ];
  const dice = G.frases[1].palabras.find((w) => w.p.startsWith("cuaderno"))?.t ?? t0 + 2;
  return (
    <div style={{ position: "absolute", left: 540 - 330, top: lerp(1500, 690, k), width: 660, height: 720, opacity: clamp01(k * 1.5), background: "#FFFDF6", borderRadius: 28, boxShadow: "0 50px 100px rgba(0,0,0,0.45)", overflow: "hidden" }}>
      {Array.from({ length: 11 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 110 + i * 56, height: 2, background: "#BFD7F2" }} />
      ))}
      <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 3, background: "#F2A2A2" }} />
      <div style={{ position: "absolute", left: 120, top: 34, fontFamily: CAVEAT, fontWeight: 700, fontSize: 54, color: "#33415C" }}>Ventas de hoy</div>
      {filas.map(([a, b], i) => {
        const ap = prog(t, t0 + 0.25 + i * 0.22, t0 + 0.5 + i * 0.22);
        const tacha = prog(t, dice - 0.3 + i * 0.12, dice - 0.05 + i * 0.12, easeInOut);
        return (
          <div key={i} style={{ position: "absolute", left: 120, right: 50, top: 118 + i * 84, display: "flex", justifyContent: "space-between", fontFamily: CAVEAT, fontWeight: 700, fontSize: 50, color: "#2B3550", opacity: ap }}>
            <span>{a}</span>
            <span>{b}</span>
            <div style={{ position: "absolute", left: -8, right: -8, top: "52%", height: 6, borderRadius: 3, background: "#C0392B", transformOrigin: "0 50%", scale: `${tacha} 1` }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 120, right: 50, top: 560, borderTop: "4px solid #2B3550", paddingTop: 10, display: "flex", justifyContent: "space-between", fontFamily: CAVEAT, fontWeight: 700, fontSize: 64, color: "#2B3550", opacity: prog(t, dice, dice + 0.3) }}>
        <span>Total:</span>
        <span style={{ color: "#C0392B", scale: String(1 + 0.08 * Math.sin(t * 9)) }}>¿¿??</span>
      </div>
    </div>
  );
};

/** Ícono de wifi tachado que entra con un globo "Sin internet". */
const SinInternet: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 13, stiffness: 180, mass: 0.7 });
  const raya = prog(t, t0 + 0.35, t0 + 0.7, easeInOut);
  const sale = prog(t, hasta - 0.3, hasta);
  const ok = sp(t, t0 + 1.1, { damping: 12, stiffness: 200, mass: 0.6 });
  return (
    <div style={{ position: "absolute", left: 760, top: 470, width: 230, height: 230, borderRadius: 60, background: "#fff", boxShadow: "0 30px 70px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", scale: String(k * (1 - sale)), opacity: 1 - sale }}>
      <svg width={150} height={150} viewBox="0 0 24 24">
        <path d="M2 8.8a15 15 0 0 1 20 0M5.3 12.3a10 10 0 0 1 13.4 0M8.6 15.7a5 5 0 0 1 6.8 0" fill="none" stroke="#5B6B64" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={12} cy={19.3} r={1.4} fill="#5B6B64" />
        <line x1={3} y1={3} x2={3 + 18 * raya} y2={3 + 18 * raya} stroke={B.rojo} strokeWidth={2.6} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", right: -26, bottom: -26, width: 96, height: 96, borderRadius: "50%", background: B.verde, border: "8px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", scale: String(ok) }}>
        <svg width={50} height={50} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
};

/** Tarjeta "Nueva venta" que viaja del teléfono del empleado al tuyo. */
const VentaViaja: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 || t > hasta) return null;
  const k = prog(t, t0 + 0.3, t0 + 1.4, easeInOut);
  const ap = sp(t, t0, { damping: 13, stiffness: 200, mass: 0.6 });
  const sale = prog(t, hasta - 0.35, hasta);
  const x = lerp(290, 790, k);
  const y = lerp(820, 820, k) - Math.sin(k * Math.PI) * 220;
  return (
    <div style={{ position: "absolute", left: x - 170, top: y - 60, width: 340, height: 120, borderRadius: 30, background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 16, padding: "0 22px", scale: String(ap * (1 - sale * 0.3)), opacity: 1 - sale }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: B.verde, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={40} height={40} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 800, color: B.texto, lineHeight: 1.1 }}>
        <div style={{ fontSize: 30 }}>Nueva venta</div>
        <div style={{ fontSize: 40, color: B.verde }}>$2.90</div>
      </div>
    </div>
  );
};

/** Etiqueta recta sobre cada teléfono (Empleado / Tú, en casa). */
const Etiqueta: React.FC<{ t: number; t0: number; x: number; y: number; texto: string; casa?: boolean; hasta: number }> = ({ t, t0, x, y, texto, casa, hasta }) => {
  const k = sp(t, t0, { damping: 13, stiffness: 200, mass: 0.6 });
  const sale = prog(t, hasta - 0.3, hasta);
  if (t < t0 || t > hasta) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% 0", display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 999, padding: "14px 30px", fontFamily: LEXEND, fontWeight: 800, fontSize: 38, color: B.texto, boxShadow: "0 16px 40px rgba(0,0,0,0.25)", scale: String(k * (1 - sale)), opacity: 1 - sale, whiteSpace: "nowrap" }}>
      {casa ? (
        <svg width={40} height={40} viewBox="0 0 24 24"><path d="M3 11.2 12 4l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill={B.verde} /></svg>
      ) : null}
      {texto}
    </div>
  );
};

/** Precio: "$10 al mes" enorme que cuenta desde 0 y la malta (botella genérica, sin marca). */
const Precio: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 - 0.1 || t > hasta + 0.1) return null;
  const k = sp(t, t0, { damping: 15, stiffness: 150, mass: 0.8 });
  const n = Math.round(10 * prog(t, t0 + 0.1, t0 + 0.9, easeOut));
  const malta = G.frases[10].palabras.find((w) => w.p.startsWith("Menos"))?.t ?? t0 + 1.5;
  const m = sp(t, malta - 0.1, { damping: 14, stiffness: 170, mass: 0.7 });
  const sale = prog(t, hasta - 0.4, hasta, easeInOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - sale, scale: String(1 + sale * 0.06), filter: sale > 0.02 ? `blur(${(sale * 12).toFixed(1)}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: lerp(700, 470, m), textAlign: "center", scale: String(lerp(0.6, 1, k) * lerp(1, 0.82, m)), opacity: clamp01(k * 2) }}>
        <div style={letra(110)}>Todo por</div>
        <div style={{ ...letra(330, MENTA), lineHeight: 1 }}>${n}</div>
        <div style={letra(100)}>al mes</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", alignItems: "center", gap: 36, opacity: clamp01(m * 1.5), translate: `0 ${(1 - m) * 80}px` }}>
        <svg width={110} height={260} viewBox="0 0 40 100">
          <path d="M16 2h8v16c0 4 8 8 8 18v58a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V36c0-10 8-14 8-18z" fill="#3B2314" stroke={OSCURO} strokeWidth={2} />
          <rect x={8} y={50} width={24} height={26} fill="#E8C66A" />
          <rect x={15.5} y={0} width={9} height={6} rx={1} fill="#C9A23F" />
        </svg>
        <div style={{ ...letra(64), textAlign: "left", lineHeight: 1.15 }}>
          Menos que
          <br />
          una malta al día
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "7 días gratis" y "Te la instalo" con el sello. */
const Prueba: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 - 0.1 || t > hasta + 0.1) return null;
  const k = sp(t, t0, { damping: 11, stiffness: 170, mass: 0.7 });
  const inst = G.frases[11].palabras.find((w) => w.p.startsWith("Yo"))?.t ?? t0 + 1.6;
  const i2 = sp(t, inst - 0.05, { damping: 13, stiffness: 190, mass: 0.6 });
  const sale = prog(t, hasta - 0.4, hasta, easeInOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - sale, scale: String(1 - sale * 0.05), filter: sale > 0.02 ? `blur(${(sale * 12).toFixed(1)}px)` : undefined }}>
      <div style={{ position: "absolute", left: 540 - 300, top: 520, width: 600, height: 600, borderRadius: "50%", background: "#fff", boxShadow: "0 50px 110px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", scale: String(k), rotate: "0deg" }}>
        <div style={{ fontFamily: LEXEND, fontWeight: 800, fontSize: 300, lineHeight: 0.9, color: B.verde }}>7</div>
        <div style={{ fontFamily: LEXEND, fontWeight: 800, fontSize: 86, lineHeight: 1, color: B.texto }}>días gratis</div>
      </div>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const d = prog(t, t0 + 0.1, t0 + 1.1, easeOut);
        const r = 330 + d * 260 + (i % 3) * 30;
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 12, top: 820 + Math.sin(a) * r - 12, width: 24, height: 24, borderRadius: i % 2 ? 6 : "50%", background: [MENTA, "#fff", "#FFD54A"][i % 3], opacity: (1 - prog(t, t0 + 0.8, t0 + 1.6)) * clamp01(d * 4) }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, display: "flex", justifyContent: "center", opacity: clamp01(i2 * 1.5), translate: `0 ${(1 - i2) * 60}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,0.14)", border: "3px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: "18px 40px" }}>
          <svg width={54} height={54} viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a1.4 1.4 0 0 0 2 2l6-6a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" fill="#fff" /></svg>
          <span style={{ fontFamily: LEXEND, fontWeight: 800, fontSize: 56, color: "#fff" }}>Te la instalamos</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Cierre: logo, prueba gratis y botón de WhatsApp que late. */
const Cierre: React.FC<{ t: number; t0: number; whatsapp: string }> = ({ t, t0, whatsapp }) => {
  if (t < t0 - 0.1) return null;
  const b = sp(t, t0 + 0.6, { damping: 12, stiffness: 180, mass: 0.7 });
  const late = 1 + 0.035 * Math.max(0, Math.sin((t - t0 - 1.2) * 5));
  const c = prog(t, t0 + 1.1, t0 + 1.6);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 140 }}>
      <Marca t={t} t0={t0} tam={140} claro />
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "#25D366", borderRadius: 999, padding: "30px 52px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", scale: String(b * late) }}>
        <IconoWhatsApp tam={70} />
        <span style={{ fontFamily: LEXEND, fontWeight: 800, fontSize: 58, color: "#fff" }}>{whatsapp}</span>
      </div>
      <div style={{ ...letra(62), opacity: c, translate: `0 ${(1 - c) * 30}px` }}>Pruébala 7 días gratis</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ video

export type PropsVenta = { audio: string | null; whatsapp: string };

export const Venta: React.FC<PropsVenta> = ({ audio, whatsapp }) => {
  cargarVenta();
  const t = useCurrentFrame() / FPS;

  // inicio de cada escena (un poco antes de su frase)
  const T = {
    revela: F[2] - 0.45,
    cobrar: F[3] - 0.3,
    vuelto: F[4] - 0.3,
    fiado: F[5] - 0.3,
    avisos: F[6] - 0.3,
    caja: F[7] - 0.3,
    internet: F[8] - 0.3,
    empleado: F[9] - 0.3,
    precio: F[10] - 0.35,
    prueba: F[11] - 0.35,
    cierre: F[12] - 0.3,
  };
  const pagado = G.frases[5].palabras.find((w) => w.p.startsWith("ahí"))?.t ?? T.fiado + 3;
  const ganaste = G.frases[7].palabras.find((w) => w.p.startsWith("ganaste"))?.t ?? T.caja + 2.5;

  // teléfono principal (pantallas a 3×: 1170 × 2532)
  const contenidos: Contenido[] = [
    { t: 0, img: "02-venta-escaneado.png" },
    { t: T.cobrar, clip: "01-escanear-y-cobrar.mp4", inicio: 0.35, corte: true },
    { t: T.vuelto, clip: "01-escanear-y-cobrar.mp4", inicio: 8.4 },
    { t: T.fiado, img: "12-cuaderno-fiados.png" },
    { t: pagado - 0.35, img: "13-registrar-abono.png" },
    { t: T.avisos, img: "18-avisos.png" },
    { t: T.caja, img: "17-cuadre-del-dia.png" },
    { t: T.internet, img: "10-venta-registrada.png" },
  ];
  const E = 1.12; // escala base: teléfono grande
  const cam = [
    camara(0, 585, 1266, E),
    camara(T.revela + 0.6, 585, 1266, E),
    camara(T.cobrar, 585, 1266, E),
    camara(T.cobrar + 0.8, 585, 700, 1.75, 0, true), // acerca al escáner
    camara(T.cobrar + 1.9, 585, 700, 1.82, 0, true),
    camara(T.vuelto - 0.4, 585, 1150, 1.25, 0, true), // aleja al carrito
    camara(T.vuelto + 0.5, 585, 1700, 1.6, 0, true), // billetes y vuelto
    camara(T.fiado - 0.2, 585, 1700, 1.6, 0, true),
    camara(T.fiado + 0.5, 585, 760, 1.55, 0, true), // tarjeta del cuaderno de fiados
    camara(pagado - 0.4, 585, 900, 1.45, 0, true),
    camara(pagado + 0.35, 585, 1800, 1.5, 0, true), // abono
    camara(T.avisos - 0.1, 585, 1800, 1.5, 0, true),
    camara(T.avisos + 0.5, 585, 1750, 1.55, 0, true), // avisos
    camara(T.caja - 0.1, 585, 1700, 1.45, 0, true),
    camara(T.caja + 0.5, 585, 640, 1.6, 0, true), // venta del día
    camara(ganaste - 0.2, 585, 700, 1.6, 0, true),
    camara(ganaste + 0.45, 760, 850, 1.85, 0, true), // ganancia
    camara(T.internet - 0.1, 760, 850, 1.85, 0, true),
    camara(T.internet + 0.6, 585, 1266, E, 0, true), // teléfono entero
    camara(T.empleado, 585, 1266, E),
    camara(T.empleado + 0.7, 585, 1266, 0.9, 0, true),
  ];
  // posición del teléfono: entra en la revelación, se va a la izquierda para el empleado y baja al precio
  const entra = prog(t, T.revela + 0.05, T.revela + 1.0, easeOut);
  const izq = prog(t, T.empleado, T.empleado + 0.7, easeInOut);
  const baja = prog(t, T.precio - 0.15, T.precio + 0.45, easeInOut);
  const cx = lerp(540, 290, izq);
  const cy = lerp(990, 1030, izq);
  const segundo = prog(t, T.empleado + 0.15, T.empleado + 0.85, easeInOut);

  // fondo: oscuro en el gancho; se abre en círculo verde al revelar la app
  const circulo = prog(t, T.revela - 0.1, T.revela + 0.75, easeInOut);

  return (
    <AbsoluteFill style={{ background: OSCURO }}>
      <Fondo t={t} oscuro={0} />
      {circulo < 1 ? (
        <AbsoluteFill style={{ maskImage: `radial-gradient(circle at 50% 52%, transparent ${circulo * 1250}px, #000 ${circulo * 1250 + 3}px)`, WebkitMaskImage: `radial-gradient(circle at 50% 52%, transparent ${circulo * 1250}px, #000 ${circulo * 1250 + 3}px)` }}>
          <Fondo t={t} oscuro={1} />
          <Gancho t={t} hasta={T.revela + 0.6} />
        </AbsoluteFill>
      ) : null}

      {/* marca al revelar */}
      {t > T.revela && t < T.cobrar + 0.2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, opacity: 1 - prog(t, T.cobrar - 0.3, T.cobrar), translate: `0 ${-prog(t, T.cobrar - 0.3, T.cobrar) * 40}px` }}>
          <Marca t={t} t0={F[2] + 0.2} tam={100} claro />
        </div>
      ) : null}

      {/* teléfono(s) */}
      {t > T.revela && t < T.precio + 0.6 ? (
        <AbsoluteFill style={{ maskImage: t > T.cobrar - 0.2 ? "linear-gradient(to bottom, transparent 330px, #000 480px)" : undefined, WebkitMaskImage: t > T.cobrar - 0.2 ? "linear-gradient(to bottom, transparent 330px, #000 480px)" : undefined }}>
          <Telefono t={t} contenidos={contenidos} camara={cam} cx={cx} cy={cy} entra={entra * (1 - baja)} extra={
            <>
              <Toque t={t} t0={T.vuelto + 1.05} x={170} y={1615} />
              <Toque t={t} t0={pagado + 0.7} x={585} y={2400} />
            </>
          } />
          {segundo > 0 ? (
            <Telefono t={t} contenidos={[{ t: 0, img: "17-cuadre-del-dia.png" }]} camara={[camara(0, 585, 1266, 0.9)]} cx={lerp(1500, 790, segundo)} cy={1030} entra={1 - baja} />
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* titulares (beneficio en pocas palabras) */}
      <Titular t={t} t0={T.cobrar + 0.1} hasta={T.vuelto} texto="Cobra en segundos" verde="segundos" />
      <Titular t={t} t0={T.vuelto + 0.1} hasta={T.fiado} texto="Vuelto en $ y Bs" verde="Vuelto" />
      <Titular t={t} t0={T.fiado + 0.1} hasta={T.avisos} texto="Cada fiado, anotado" verde="anotado" />
      <Titular t={t} t0={T.avisos + 0.1} hasta={T.caja} texto="Sabes qué se acaba" verde="acaba" />
      <Titular t={t} t0={T.caja + 0.1} hasta={T.internet} texto="La caja te cuadra" verde="cuadra" />
      <Titular t={t} t0={T.internet + 0.1} hasta={T.empleado} texto="Funciona sin internet" verde="internet" />
      <Titular t={t} t0={T.empleado + 0.1} hasta={T.precio} texto="Todo desde tu casa" verde="casa" />

      <SinInternet t={t} t0={T.internet + 0.35} hasta={T.empleado + 0.1} />
      <Etiqueta t={t} t0={T.empleado + 0.7} x={290} y={455} texto="Empleado" hasta={T.precio} />
      <Etiqueta t={t} t0={T.empleado + 0.9} x={790} y={455} texto="Tú, en casa" casa hasta={T.precio} />
      <VentaViaja t={t} t0={T.empleado + 1.1} hasta={T.precio} />

      <Precio t={t} t0={T.precio + 0.05} hasta={T.prueba + 0.25} />
      <Prueba t={t} t0={T.prueba - 0.05} hasta={T.cierre + 0.3} />
      <Cierre t={t} t0={T.cierre - 0.05} whatsapp={whatsapp} />

      <Subtitulos t={t} ocultar={[0]} />

      {/* efectos: pocos y que se entiendan con lo que se ve */}
      <Efecto t={T.revela - 0.05} n="whoosh" v={0.45} />
      <Efecto t={T.cobrar + 0.55} n="escaner" v={0.45} />
      <Efecto t={T.vuelto + 1.05} n="toque" v={0.4} />
      <Efecto t={T.vuelto + 2.3} n="caja" v={0.4} />
      <Efecto t={pagado + 0.7} n="monedas" v={0.4} />
      <Efecto t={T.empleado + 2.4} n="pop" v={0.4} />
      <Efecto t={T.precio + 0.05} n="golpe-suave" v={0.5} />
      <Efecto t={T.prueba - 0.05} n="golpe-suave" v={0.5} />
      <Efecto t={T.cierre - 0.05} n="golpe-final" v={0.45} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Portada: logo, frase y el teléfono con la venta. */
export const PortadaVenta: React.FC = () => {
  cargarVenta();
  return (
    <AbsoluteFill>
      <Fondo t={0} oscuro={0} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230 }}>
        <Marca t={5} t0={0} tam={110} claro />
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, textAlign: "center", ...letra(92) }}>
        ¿Cuánto <span style={{ color: MENTA }}>ganaste</span> hoy?
      </div>
      <Telefono t={5} contenidos={[{ t: 0, img: "17-cuadre-del-dia.png" }]} camara={[camara(0, 585, 1266, 0.95)]} cy={1250} />
    </AbsoluteFill>
  );
};

