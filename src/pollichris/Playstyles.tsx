import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, lerp, prog, sp } from "../comun/animacion";
import guionJson from "./guion.json";

// Pollichris (FC27) · video de prueba "playstyles" (docs/pollichris.md).
// Mezcla de sus Reels (juego arriba, él abajo, subtítulos amarillos en la unión, iconos y flechas
// sobre el juego) y el ejemplo que mandó (insignias de playstyle, medallas, cartas de jugadores, barra
// de progreso). Voz: su toma con cortes en las pausas (scripts/pollichris/guion.py).

type Palabra = { p: string; t: number; fin: number };
type Tramo = { desde: number; hasta: number; t: number };
const G = guionJson as unknown as { duracion: number; tramos: Tramo[]; palabras: Palabra[]; marcas: Record<string, number> };
const M = G.marcas;
export const DUR_PLAYSTYLES = G.duracion;

const ANTON = '"Anton", "Impact", sans-serif';
const MONT = '"MontserratX", sans-serif';
let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Anton", url: staticFile("pollichris/anton.woff2"), weight: "400" });
  loadFont({ family: "MontserratX", url: staticFile("pollichris/montserrat-800.woff2"), weight: "800" });
};

const AMARILLO = "#FFE81A";
const NARANJA = "#FF9F1A";
const ROJO = "#FF2D2D";
const ARRIBA = 1120; // alto del juego; debajo va su cámara

/** Primera vez que dice una palabra a partir de `desde` (para sincronizar con la voz). */
const cuando = (p: string, desde = 0) => G.palabras.find((w) => w.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "").startsWith(p) && w.t >= desde)?.t ?? desde;

const letra = (tam: number, color = AMARILLO): React.CSSProperties => ({
  fontFamily: ANTON,
  fontSize: tam,
  lineHeight: 1.02,
  color,
  textTransform: "uppercase",
  letterSpacing: "0.01em",
  WebkitTextStroke: `${(tam * 0.11).toFixed(1)}px #000`,
  paintOrder: "stroke fill",
  textShadow: `${(tam * 0.05).toFixed(1)}px ${(tam * 0.08).toFixed(1)}px 0 #000, 0 0 ${(tam * 0.25).toFixed(1)}px rgba(0,0,0,0.6)`,
});

// ---------------------------------------------------------------- juego (arriba)

/** Trozos de las grabaciones del juego, en orden, cada uno con su encuadre (x de la ventana a 1,25×). */
type Clip = { f: "empeine" | "trivela"; desde: number; hasta: number; ox?: number; oy?: number; vel?: number };
const plan = (inicio: number, clips: Clip[]) => {
  let t = inicio;
  return clips.map((c) => {
    const r = { ...c, t };
    t += (c.hasta - c.desde) / (c.vel ?? 1);
    return r;
  });
};
const tEmpeine = G.tramos[2].t;
const CLIPS = [
  ...plan(0, [{ f: "trivela", desde: 2.4, hasta: 2.4 + M.primero }]),
  ...plan(M.primero, [{ f: "empeine", desde: 3.29 - (tEmpeine - M.primero), hasta: 3.29 }]),
  ...plan(tEmpeine, [
    { f: "empeine", desde: 3.4, hasta: 8.8 },
    { f: "empeine", desde: 9.4, hasta: 14.4 },
    { f: "empeine", desde: 14.6, hasta: 19.4 },
    { f: "empeine", desde: 20.6, hasta: 25.0 },
    { f: "empeine", desde: 27.95, hasta: 27.95 + (M.segundo - tEmpeine - 19.6) },
  ]),
  ...plan(M.segundo, [
    { f: "trivela", desde: 7.6, hasta: 11.35 },
    { f: "trivela", desde: 11.45, hasta: 16.15 },
    { f: "trivela", desde: 19.3, hasta: 22.3 },
    { f: "trivela", desde: 23.65, hasta: 28.55 },
    { f: "trivela", desde: 28.7, hasta: 31.85 },
    { f: "trivela", desde: 2.0, hasta: 7.4 }, // fondo del cierre (desenfocado)
  ]),
];
const S_JUEGO = 1.5; // la cámara del juego deja el balón cerca del centro: ventana centrada en (900, 560)

const Juego: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CLIPS.map((c, i) => {
        const dur = (c.hasta - c.desde) / (c.vel ?? 1);
        const ox = c.ox ?? 810;
        const oy = c.oy ?? 280;
        // empuje de cámara suave dentro de cada trozo (nunca quieto) y entrada con golpe de zoom
        const k = clamp01((t - c.t) / dur);
        const z = 1 + 0.05 * k + 0.06 * (1 - prog(t, c.t, c.t + 0.35));
        return (
          <Sequence key={i} from={Math.round(c.t * fps)} durationInFrames={Math.round(dur * fps) + 1} layout="none">
            <AbsoluteFill style={{ overflow: "hidden", height: ARRIBA }}>
              <div style={{ position: "absolute", left: -ox, top: -oy, width: 1920 * S_JUEGO, height: 1080 * S_JUEGO, transformOrigin: `${ox + 540}px ${oy + 560}px`, scale: String(z) }}>
                <OffthreadVideo src={staticFile(`pollichris/juego/${c.f}.mp4`)} startFrom={Math.round(c.desde * fps)} playbackRate={c.vel ?? 1} muted style={{ width: "100%", height: "100%" }} />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- su cámara (abajo)

const Camara: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ top: ARRIBA, height: 1920 - ARRIBA, overflow: "hidden" }}>
      {G.tramos.map((tr, i) => {
        const dur = tr.hasta - tr.desde;
        // en cada corte alterna plano normal y plano más cerrado (los cortes se sienten intencionados)
        const s = i % 2 ? 1.08 : 0.9;
        const cx = 830 * s;
        const cy = 420 * s;
        const golpe = 1 + 0.04 * (1 - prog(t, tr.t, tr.t + 0.25));
        return (
          <Sequence key={i} from={Math.round(tr.t * fps)} durationInFrames={Math.round(dur * fps) + 1} layout="none">
            <div style={{ position: "absolute", left: 540 - cx, top: 400 - cy, width: 1920 * s, height: 1080 * s, transformOrigin: `${cx}px ${cy}px`, scale: String(golpe) }}>
              <OffthreadVideo src={staticFile("pollichris/juego/camara.mp4")} startFrom={Math.round(tr.desde * fps)} muted style={{ width: "100%", height: "100%" }} />
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- gráficos

/** Insignia de playstyle (diseño propio): rombo dorado con su icono y la etiqueta debajo. */
const Insignia: React.FC<{ t: number; t0: number; hasta: number; icono: "tiro" | "empeine" | "revolucion"; texto: string; x?: number; y?: number; tam?: number }> = ({ t, t0, hasta, icono, texto, x = 540, y = 470, tam = 400 }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 11, stiffness: 190, mass: 0.7 });
  const sale = prog(t, hasta - 0.25, hasta, easeInOut);
  const brillo = prog(t, t0 + 0.2, t0 + 0.9, easeInOut);
  const e = tam / 300;
  return (
    <div style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, width: tam, height: tam, scale: String(k * (1 - sale * 0.4)), opacity: 1 - sale }}>
      <svg width={tam} height={tam} viewBox="0 0 300 300" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))" }}>
        <defs>
          <linearGradient id={`oro-${icono}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF1A8" />
            <stop offset="0.45" stopColor="#F6C445" />
            <stop offset="1" stopColor="#B7791F" />
          </linearGradient>
          <clipPath id={`rombo-${icono}`}>
            <path d="M150 12 L288 150 L150 288 L12 150 Z" />
          </clipPath>
        </defs>
        <path d="M150 12 L288 150 L150 288 L12 150 Z" fill={`url(#oro-${icono})`} stroke="#3B2A06" strokeWidth={10} strokeLinejoin="round" />
        <path d="M150 42 L258 150 L150 258 L42 150 Z" fill="#2A1C04" opacity={0.92} />
        <g clipPath={`url(#rombo-${icono})`}>
          <rect x={-120 + brillo * 420} y={-20} width={50} height={340} fill="rgba(255,255,255,0.35)" transform="rotate(25 150 150)" />
        </g>
        {icono === "tiro" ? (
          <g fill="none" stroke="#F6C445" strokeWidth={14} strokeLinecap="round">
            <path d="M92 196 Q150 70 214 116" />
            <circle cx={92} cy={196} r={16} fill="#F6C445" stroke="none" />
            <path d="M196 98 L218 116 L194 132" />
          </g>
        ) : icono === "empeine" ? (
          <g fill="none" stroke="#F6C445" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
            <path d="M80 182 L214 120" />
            <path d="M190 104 L218 118 L200 146" />
            <path d="M84 136 L126 116 M96 216 L150 190" opacity={0.7} />
          </g>
        ) : (
          <g fill="none" stroke="#F6C445" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
            <path d="M86 200 Q110 92 214 106" />
            <circle cx={86} cy={200} r={16} fill="#F6C445" stroke="none" />
            <path d="M190 88 L216 106 L192 126" />
            <path d="M128 212 L148 176 L132 176 L152 138" strokeWidth={10} />
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", left: "50%", top: tam + 8 * e, translate: "-50% 0", whiteSpace: "nowrap", background: "#111", border: `${4 * e}px solid ${AMARILLO}`, borderRadius: 14 * e, padding: `${6 * e}px ${22 * e}px`, ...letra(52 * e, "#fff"), WebkitTextStroke: "0", textShadow: "none" }}>{texto}</div>
    </div>
  );
};

/** Cruz roja que se dibuja encima (dos trazos) con golpe. */
const Cruz: React.FC<{ t: number; t0: number; hasta: number; x?: number; y?: number; tam?: number }> = ({ t, t0, hasta, x = 540, y = 470, tam = 480 }) => {
  if (t < t0 || t > hasta) return null;
  const a = prog(t, t0, t0 + 0.12);
  const b = prog(t, t0 + 0.1, t0 + 0.22);
  const sale = prog(t, hasta - 0.25, hasta);
  const L = tam * 1.42;
  return (
    <svg width={tam} height={tam} style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, opacity: 1 - sale, filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.6))" }}>
      <line x1={20} y1={20} x2={tam - 20} y2={tam - 20} stroke={ROJO} strokeWidth={tam * 0.11} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - a)} />
      <line x1={tam - 20} y1={20} x2={20} y2={tam - 20} stroke={ROJO} strokeWidth={tam * 0.11} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - b)} />
    </svg>
  );
};

/** Medalla con el número de la lista (como en el ejemplo), cuelga desde arriba. */
const Medalla: React.FC<{ t: number; t0: number; hasta: number; n: number }> = ({ t, t0, hasta, n }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 9, stiffness: 160, mass: 0.8 });
  const sale = prog(t, hasta - 0.25, hasta);
  const balanceo = Math.sin((t - t0) * 6) * 6 * Math.exp(-(t - t0) * 2.5);
  return (
    <div style={{ position: "absolute", left: 40, top: -330 + 360 * k - sale * 400, width: 200, height: 330, transformOrigin: "100px 0", rotate: `${balanceo}deg`, scale: "1.3" }}>
      <svg width={200} height={330} viewBox="0 0 200 330" style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.5))" }}>
        <path d="M60 0 L100 120 L140 0 Z" fill="#1E40AF" />
        <path d="M78 0 L100 66 L122 0 Z" fill="#fff" />
        <circle cx={100} cy={210} r={92} fill="#F6C445" stroke="#8A5A00" strokeWidth={10} />
        <circle cx={100} cy={210} r={70} fill="none" stroke="#FFF1A8" strokeWidth={6} opacity={0.7} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 145, textAlign: "center", ...letra(120, "#fff") }}>{n}</div>
    </div>
  );
};

/** Carta de jugador (diseño propio, sin valoraciones inventadas): nombre, puesto y su playstyle. */
const Carta: React.FC<{ t: number; t0: number; hasta: number; nombre: string; i: number }> = ({ t, t0, hasta, nombre, i }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 13, stiffness: 180, mass: 0.7 });
  const sale = prog(t, hasta - 0.3, hasta);
  const x = 60 + i * 330;
  return (
    <div style={{ position: "absolute", left: x, top: 250 + (1 - k) * 700, width: 300, height: 420, opacity: clamp01(k * 2) * (1 - sale), scale: String(lerp(0.8, 1, k)) }}>
      <svg width={300} height={420} viewBox="0 0 300 420" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55))" }}>
        <defs>
          <linearGradient id={`c${i}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#FFF4BF" />
            <stop offset="0.5" stopColor="#EBC35A" />
            <stop offset="1" stopColor="#A9761C" />
          </linearGradient>
        </defs>
        <path d="M150 6 L282 40 L282 330 Q150 414 18 330 L18 40 Z" fill={`url(#c${i})`} stroke="#5B3D05" strokeWidth={8} strokeLinejoin="round" />
        <path d="M150 30 L258 58 L258 318 Q150 386 42 318 L42 58 Z" fill="none" stroke="#FFF7D6" strokeWidth={3} opacity={0.7} />
        <circle cx={150} cy={140} r={70} fill="#5B3D05" opacity={0.18} />
        <path d="M100 205 Q100 150 150 150 Q200 150 200 205 Z M150 140 a34 34 0 1 1 0.1 0" fill="#5B3D05" opacity={0.35} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontFamily: ANTON, fontSize: 54, color: "#2A1C04", textTransform: "uppercase" }}>{nombre}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 304, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 24, color: "#5B3D05" }}>PASE DE EMPEINE+</div>
    </div>
  );
};

/** Flecha curva naranja que se dibuja sobre el juego (como las de sus videos). */
const Flecha: React.FC<{ t: number; t0: number; hasta: number; d: string; largo?: number }> = ({ t, t0, hasta, d, largo = 900 }) => {
  if (t < t0 || t > hasta) return null;
  const a = prog(t, t0, t0 + 0.5);
  const sale = prog(t, hasta - 0.2, hasta);
  return (
    <svg width={1080} height={ARRIBA} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - sale, filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.55))" }}>
      <path d={d} fill="none" stroke={NARANJA} strokeWidth={16} strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - a)} />
    </svg>
  );
};

/** Medidor de potencia que se llena (en "potente"). */
const Potencia: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 14, stiffness: 200, mass: 0.6 });
  const lleno = prog(t, t0 + 0.15, t0 + 0.8);
  const sale = prog(t, hasta - 0.25, hasta);
  return (
    <div style={{ position: "absolute", right: 70, top: 300, width: 120, height: 520, scale: String(k), opacity: 1 - sale, background: "rgba(0,0,0,0.6)", border: "6px solid #fff", borderRadius: 24, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lleno * 100}%`, background: `linear-gradient(to top, #2BD45A, ${AMARILLO} 55%, ${ROJO})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", ...letra(40, "#fff") }}>MAX</div>
    </div>
  );
};

/** Contador de goles que sube (en "muchos más goles"). */
const Goles: React.FC<{ t: number; t0: number; hasta: number }> = ({ t, t0, hasta }) => {
  if (t < t0 || t > hasta) return null;
  const k = sp(t, t0, { damping: 10, stiffness: 220, mass: 0.6 });
  const n = Math.round(lerp(1, 9, prog(t, t0 + 0.1, t0 + 0.9)));
  const sale = prog(t, hasta - 0.2, hasta);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, scale: String(k), opacity: 1 - sale }}>
      <span style={{ fontSize: 150 }}>⚽</span>
      <span style={letra(190, AMARILLO)}>+{n}</span>
    </div>
  );
};

/** Etiqueta fija de la sección (arriba a la izquierda), recta. */
const Etiqueta: React.FC<{ t: number; t0: number; hasta: number; texto: string }> = ({ t, t0, hasta, texto }) => {
  if (t < t0 || t > hasta) return null;
  const k = prog(t, t0, t0 + 0.35);
  const sale = prog(t, hasta - 0.2, hasta);
  return (
    <div style={{ position: "absolute", left: 40, top: 60, translate: `${(1 - k) * -600 - sale * 600}px 0`, background: AMARILLO, borderRadius: 12, padding: "8px 24px", fontFamily: ANTON, fontSize: 56, color: "#111", textTransform: "uppercase", boxShadow: "0 6px 0 #000" }}>{texto}</div>
  );
};

/** Subtítulos: 1–3 palabras en mayúsculas amarillas en la unión juego/cámara (como sus Reels). */
const Subtitulos: React.FC<{ t: number; ocultar: (t: number) => boolean }> = ({ t, ocultar }) => {
  if (ocultar(t)) return null;
  const ws = G.palabras;
  const bloques: Palabra[][] = [];
  let act: Palabra[] = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    const largo = act.map((x) => x.p).join(" ").length + w.p.length;
    const pausa = act.length && w.t - act[act.length - 1].fin > 0.25;
    if (act.length && (act.length >= 3 || largo > 15 || pausa || /[.,?]$/.test(act[act.length - 1].p))) {
      bloques.push(act);
      act = [];
    }
    act.push(w);
  }
  if (act.length) bloques.push(act);
  const b = bloques.find((bl, i) => t >= bl[0].t - 0.05 && t < (bloques[i + 1]?.[0].t ?? bl[bl.length - 1].fin + 0.4) - 0.05);
  if (!b || t > b[b.length - 1].fin + 0.5) return null;
  const k = sp(t, b[0].t - 0.05, { damping: 12, stiffness: 320, mass: 0.5 });
  const texto = b.map((w) => w.p.replace(/[.,]$/, "")).join(" ");
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: ARRIBA - 70, textAlign: "center", ...letra(96), scale: String(lerp(1.25, 1, k)), opacity: clamp01(k * 3) }}>{texto}</div>
  );
};

/** Cierre como sus Reels: "POLLICHRIS EN:" con sus redes y el botón de suscribirse que se pulsa. */
const Redes: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null;
  const k = sp(t, t0, { damping: 13, stiffness: 180, mass: 0.7 });
  const clic = t0 + 1.4;
  const pulsado = t >= clic;
  const cursor = prog(t, t0 + 0.6, clic - 0.05, easeInOut);
  const iconos = [
    { c: "#FF0000", d: <path d="M10 7 L17 12 L10 17 Z" fill="#fff" /> },
    { c: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)", d: <><rect x={6} y={6} width={12} height={12} rx={4} fill="none" stroke="#fff" strokeWidth={1.8} /><circle cx={12} cy={12} r={3} fill="none" stroke="#fff" strokeWidth={1.8} /></> },
    { c: "#000", d: <path d="M13 5 v9 a3 3 0 1 1 -3 -3 M13 5 q1 3 4 3" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" /> },
    { c: "#000", d: <path d="M6 6 L18 18 M18 6 L6 18" stroke="#fff" strokeWidth={2} strokeLinecap="round" /> },
    { c: "#9146FF", d: <path d="M7 5 h11 v8 l-4 4 h-3 l-2 2 v-2 H7 Z M12 9 v3 M15 9 v3" fill="none" stroke="#fff" strokeWidth={1.6} /> },
  ];
  return (
    <AbsoluteFill style={{ height: ARRIBA }}>
      <AbsoluteFill style={{ background: "rgba(10,14,12,0.55)", backdropFilter: "blur(18px)", opacity: clamp01(k * 2) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", scale: String(k) }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 96, color: "#fff", letterSpacing: "0.01em" }}>POLLICHRIS EN:</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 34, marginTop: 40 }}>
          {iconos.map((ic, i) => {
            const p = sp(t, t0 + 0.15 + i * 0.08, { damping: 10, stiffness: 240, mass: 0.5 });
            return (
              <div key={i} style={{ width: 110, height: 110, borderRadius: 28, background: ic.c, display: "flex", alignItems: "center", justifyContent: "center", scale: String(p), boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }}>
                <svg width={78} height={78} viewBox="0 0 24 24">{ic.d}</svg>
              </div>
            );
          })}
        </div>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 14, marginTop: 60, background: pulsado ? "#3A3A3A" : "#fff", color: pulsado ? "#fff" : "#000", borderRadius: 999, padding: "18px 44px", fontFamily: MONT, fontWeight: 800, fontSize: 46, scale: String(pulsado ? 1 + 0.08 * (1 - prog(t, clic, clic + 0.25)) : 1) }}>
          🔔 {pulsado ? "Suscrito" : "Suscribirse"}
          <svg width={70} height={70} viewBox="0 0 24 24" style={{ position: "absolute", left: lerp(520, 210, cursor), top: lerp(260, 40, cursor), scale: String(pulsado && t < clic + 0.15 ? 0.85 : 1) }}>
            <path d="M5 3 L5 19 L9 15 L12 21 L14.5 20 L11.5 14 L17 14 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Efecto: React.FC<{ t: number; n: string; v?: number }> = ({ t, n, v = 0.5 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.max(0, Math.round(t * fps))} layout="none">
      <Audio src={staticFile(`pollichris/${n}.mp3`)} volume={v} />
    </Sequence>
  );
};

// ---------------------------------------------------------------- video

export type PropsPlaystyles = { audio: string | null };

export const Playstyles: React.FC<PropsPlaystyles> = ({ audio }) => {
  cargar();
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const equivocado = cuando("equivocado");
  const fin = M.sigues;
  // temblor corto cuando cae la cruz
  const temblor = t > equivocado && t < equivocado + 0.3 ? Math.sin(t * 90) * 10 * (1 - (t - equivocado) / 0.3) : 0;
  const rapida = cuando("rápida", M.primero);
  const curva = cuando("curva", M.segundo);
  const orientarte = M.orientarte;
  const potente = M.potente;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ translate: `${temblor}px 0` }}>
        <Juego t={t} />
        {/* oscurece el juego detrás de los gráficos grandes */}
        <AbsoluteFill style={{ height: ARRIBA, background: "rgba(0,0,0,0.45)", opacity: (t < M.primero + 2.1 ? 1 : 0) + (t > M.segundo && t < M.segundo + 2 ? 1 : 0) }} />
        {/* gancho: el tiro de calidad, tachado en "equivocado" */}
        <Insignia t={t} t0={0} hasta={M.primero} icono="tiro" texto="Tiro de calidad" y={460} />
        <Cruz t={t} t0={equivocado} hasta={M.primero} y={460} />
        {/* número 1: pase de empeine */}
        <Medalla t={t} t0={M.primero} hasta={M.primero + 2.1} n={1} />
        <Insignia t={t} t0={cuando("empeine", M.primero) - 0.05} hasta={M.primero + 2.1} icono="empeine" texto="Pase de empeine" y={470} />
        <Etiqueta t={t} t0={M.primero + 2.1} hasta={M.segundo} texto="#1 Pase de empeine" />
        {/* "construcción mucho más rápida": flecha de pase que cruza el campo */}
        <Flecha t={t} t0={rapida - 0.4} hasta={rapida + 1.1} d="M180 820 Q540 520 900 330" largo={900} />
        <Flecha t={t} t0={cuando("líneas", M.primero) - 0.3} hasta={cuando("líneas", M.primero) + 1.2} d="M200 760 Q520 640 880 520" largo={760} />
        <Flecha t={t} t0={cuando("primeras", M.primero) - 0.2} hasta={cuando("primeras", M.primero) + 1.2} d="M250 840 L560 600 L860 420" largo={720} />
        {/* cartas: Bruno, Pedri, Stanway */}
        <Carta t={t} t0={M.bruno} hasta={M.segundo - 0.15} nombre="Bruno" i={0} />
        <Carta t={t} t0={M.pedri} hasta={M.segundo - 0.15} nombre="Pedri" i={1} />
        <Carta t={t} t0={M.stanway} hasta={M.segundo - 0.15} nombre="Stanway" i={2} />
        {/* número 2: revolución */}
        <Medalla t={t} t0={M.segundo} hasta={M.segundo + 2} n={2} />
        <Insignia t={t} t0={cuando("revolución", M.segundo) - 0.05} hasta={M.segundo + 2} icono="revolucion" texto="Revolución" y={470} />
        <Etiqueta t={t} t0={M.segundo + 2} hasta={fin} texto="#2 Revolución" />
        <Flecha t={t} t0={curva - 0.2} hasta={curva + 1.3} d="M240 860 Q300 360 860 330" largo={1000} />
        <Potencia t={t} t0={potente - 0.1} hasta={potente + 1.6} />
        <Flecha t={t} t0={orientarte} hasta={orientarte + 1.5} d="M540 900 L540 360" largo={560} />
        <Goles t={t} t0={cuando("muchos", M.orientarte) - 0.1} hasta={fin} />
        <Redes t={t} t0={fin} />
      </AbsoluteFill>
      <Camara t={t} />
      {/* barra de progreso en la unión (del ejemplo) */}
      <div style={{ position: "absolute", left: 0, top: ARRIBA - 9, height: 18, width: `${(t / G.duracion) * 100}%`, background: NARANJA, boxShadow: "0 0 12px rgba(255,159,26,0.7)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ARRIBA - 9, height: 18, background: "rgba(0,0,0,0.35)", zIndex: -1 }} />
      <Subtitulos t={t} ocultar={(x) => x >= fin + 0.2} />
      {/* sonido: su voz limpia, música (si hay) y pocos efectos que se entienden con lo que se ve */}
      <Audio src={staticFile(audio ?? "pollichris/voz.wav")} />
      <Efecto t={0.05} n="pop-2" v={0.45} />
      <Efecto t={equivocado} n="golpe-2" v={0.6} />
      <Efecto t={M.primero - 0.1} n="barrido-2" v={0.4} />
      <Efecto t={M.bruno} n="pop-duro" v={0.35} />
      <Efecto t={M.pedri} n="pop-duro" v={0.35} />
      <Efecto t={M.stanway} n="pop-duro" v={0.35} />
      <Efecto t={M.segundo - 0.1} n="barrido-2" v={0.4} />
      <Efecto t={cuando("muchos", M.orientarte) - 0.1} n="acierto" v={0.4} />
      <Efecto t={fin + 1.4} n="clic-2" v={0.6} />
    </AbsoluteFill>
  );
};
