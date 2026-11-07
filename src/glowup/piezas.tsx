import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, lerp, POP, prog, sp } from "../comun/animacion";

// Piezas de la serie de Toño (docs/glowup.md): cuarto de casa de su mamá, marcador fijo de
// días / billetera / nivel, notificación del celular, billetera vacía con polilla, tarjetas de
// votación, botón seguir y subtítulos. Diseño propio (no el de la referencia): pared verde
// azulado, sudadera roja, verde dinero y amarillo para las claves, letra Lilita One.

export const FUENTE = '"Lilita One", "Arial Black", sans-serif';
export const GTA = '"Pricedown", "Lilita One", Impact, sans-serif';
export const SUBS = '"Montserrat", "Arial Black", sans-serif';
export const COL = {
  pared: "#3E6E73",
  paredRaya: "#44787D",
  zocalo: "#2C5256",
  suelo: "#8A5A3B",
  sueloLinea: "#734A30",
  linea: "#1C1A1A",
  amarillo: "#FFD43B",
  verde: "#3DDC84",
  verdeOscuro: "#1E9E57",
  rojo: "#E5484D",
  azul: "#3B8BEB",
  blanco: "#FFFDF7",
};

let fuentes = false;
export const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Lilita One", url: staticFile("glowup/fuentes/lilita-one-latin-400-normal.woff2") });
  loadFont({ family: "Lilita One", url: staticFile("glowup/fuentes/lilita-one-latin-ext-400-normal.woff2") });
  loadFont({ family: "Pricedown", url: staticFile("glowup/fuentes/pricedown.otf") });
  loadFont({ family: "Montserrat", url: staticFile("glowup/fuentes/montserrat-latin-900-normal.woff2"), weight: "900" });
  loadFont({ family: "Montserrat", url: staticFile("glowup/fuentes/montserrat-latin-ext-900-normal.woff2"), weight: "900" });
};

export type Palabra = { p: string; ini: number; fin: number; clave: boolean; dinero: boolean };
export type Frase = { id: string; texto: string; t: number; fin: number };
export type Episodio = { duracion: number; frases: Frase[]; palabras: Palabra[] };

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Número estable (no Math.random: parpadea al renderizar). */
export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Garaje de la casa de la mamá, donde vive Toño (1080 × 1920): portón de metal, bombillo
 * colgando, sofá viejo de cama, lavadora, estantes con cajas, llanta, aceite y el póster de GTA VI. */
export const Cuarto: React.FC<{ t: number; limpio?: boolean }> = ({ t, limpio = false }) => {
  const balanceo = Math.sin(t * 1.6) * 3;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="luzBombillo" cx="0.62" cy="0.16" r="0.75">
            <stop offset="0" stopColor="#FFE9B0" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#FFD27A" stopOpacity="0.12" />
            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
          </radialGradient>
          <linearGradient id="rendija" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB36B" />
            <stop offset="1" stopColor="#F2735F" />
          </linearGradient>
        </defs>
        {/* pared de bloques */}
        <rect width={1080} height={1280} fill="#BBA98F" />
        {Array.from({ length: 16 }, (_, f) =>
          Array.from({ length: 6 }, (_, c) => (
            <rect key={`${f}-${c}`} x={c * 200 - (f % 2 ? 100 : 0)} y={f * 80} width={196} height={76} fill={(f + c) % 3 ? "#B5A388" : "#C0AF95"} stroke="#9F8E74" strokeWidth={4} />
          )),
        )}
        {/* portón de metal enrollable (cerrado, con la luz de la tarde por debajo) */}
        <rect x={20} y={300} width={470} height={980} fill="#5F6B75" {...L} />
        {Array.from({ length: 15 }, (_, i) => (
          <g key={i}>
            <rect x={34} y={316 + i * 62} width={442} height={54} fill={i % 2 ? "#8C99A4" : "#95A2AD"} />
            <line x1={34} y1={368 + i * 62} x2={476} y2={368 + i * 62} stroke="#6E7A84" strokeWidth={5} />
          </g>
        ))}
        <rect x={34} y={1250} width={442} height={22} fill="url(#rendija)" />
        <rect x={200} y={1150} width={110} height={30} rx={8} fill="#55606A" {...L} strokeWidth={4} />
        {/* estantes con cajas, pintura y herramientas */}
        <rect x={810} y={140} width={250} height={16} fill="#7A5A3E" {...L} strokeWidth={4} />
        <rect x={830} y={60} width={110} height={80} fill="#C99A5B" {...L} strokeWidth={4} />
        <text x={885} y={110} textAnchor="middle" fontFamily={FUENTE} fontSize={24} fill="#8A3B2E">NAVIDAD</text>
        <rect x={955} y={84} width={56} height={56} rx={6} fill="#4D7BB3" {...L} strokeWidth={4} />
        <rect x={810} y={860} width={250} height={16} fill="#7A5A3E" {...L} strokeWidth={4} />
        <rect x={826} y={786} width={60} height={74} rx={8} fill="#D9D3C4" {...L} strokeWidth={4} />
        <rect x={826} y={806} width={60} height={22} fill="#3E8E5A" />
        <rect x={900} y={770} width={130} height={90} fill="#C99A5B" {...L} strokeWidth={4} />
        <text x={965} y={826} textAnchor="middle" fontFamily={FUENTE} fontSize={24} fill="#5C3B22">FRÁGIL</text>
        {/* lavadora de la mamá con cesto de ropa */}
        <rect x={800} y={1010} width={250} height={270} rx={18} fill="#F2F0EA" {...L} />
        <rect x={800} y={1010} width={250} height={56} rx={14} fill="#E1DED5" {...L} strokeWidth={4} />
        <circle cx={925} cy={1170} r={78} fill="#C9D3DA" {...L} />
        <circle cx={925} cy={1170} r={56} fill={`hsl(200 30% ${55 + Math.sin(t * 5) * 5}%)`} stroke="#8E9AA3" strokeWidth={6} />
        <circle cx={1000} cy={1038} r={12} fill="#9AA3AA" {...L} strokeWidth={3} />
        {/* bombillo colgando del techo */}
        <g transform={`rotate(${balanceo} 640 0)`}>
          <line x1={640} y1={0} x2={640} y2={190} stroke={C2.cable} strokeWidth={5} />
          <rect x={626} y={184} width={28} height={26} rx={4} fill="#5A5A5A" {...L} strokeWidth={3} />
          <circle cx={640} cy={232} r={30} fill="#FFF3C4" {...L} strokeWidth={4} />
        </g>
        {/* suelo de cemento con grietas, mancha de aceite, llanta y basura */}
        <rect y={1270} width={1080} height={650} fill="#8C8781" />
        <rect y={1262} width={1080} height={20} fill="#6E6A65" />
        {limpio ? null : (
          <>
        <path d="M 120 1420 L 210 1470 L 260 1460 M 760 1520 L 840 1560 L 900 1550 L 950 1600" fill="none" stroke="#6F6B66" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={720} cy={1820} rx={190} ry={44} fill="#3C3A39" opacity={0.55} />
        <g transform="translate(110 1640)">
          <ellipse cx={0} cy={60} rx={110} ry={34} fill="#2A2A2A" {...L} />
          <rect x={-110} y={0} width={220} height={60} fill="#2F2F2F" />
          <ellipse cx={0} cy={0} rx={110} ry={34} fill="#3A3A3A" {...L} />
          <ellipse cx={0} cy={0} rx={50} ry={15} fill="#8C8781" {...L} strokeWidth={4} />
        </g>
        <rect x={560} y={1700} width={220} height={36} rx={4} fill="#D9A55B" {...L} />
        <text x={670} y={1727} textAnchor="middle" fontFamily={FUENTE} fontSize={26} fill="#B3412F">PIZZA</text>
        {[[880, 1560, 70], [960, 1770, 10], [420, 1800, 95], [300, 1560, -20]].map(([x, y, g], i) => (
          <g key={i} transform={`rotate(${g} ${x} ${y})`}>
            <rect x={x - 18} y={y - 34} width={36} height={68} rx={6} fill={i % 2 ? "#3DA35D" : "#D94848"} {...L} strokeWidth={4} />
          </g>
        ))}
        <path d="M 860 1660 q 40 -30 80 0 q -20 30 -80 0 Z" fill="#2B2B30" {...L} strokeWidth={4} />
          </>
        )}
        {/* sofá viejo que hace de cama, con cobija y almohada */}
        <rect x={10} y={1110} width={500} height={150} rx={30} fill="#7B5B46" {...L} />
        <rect x={10} y={1220} width={500} height={110} rx={20} fill="#6A4C3A" {...L} />
        <rect x={0} y={1150} width={70} height={190} rx={24} fill="#7B5B46" {...L} />
        <rect x={450} y={1150} width={70} height={190} rx={24} fill="#7B5B46" {...L} />
        <path d="M 90 1200 Q 200 1170 330 1210 L 380 1300 Q 220 1320 100 1296 Z" fill="#5A7BB5" {...L} />
        <path d="M 120 1240 Q 200 1226 300 1250" fill="none" stroke="#45679F" strokeWidth={5} />
        <rect x={84} y={1160} width={120} height={60} rx={24} fill="#EDE7DA" {...L} strokeWidth={5} transform="rotate(-8 144 1190)" />
        {/* luz del bombillo sobre todo */}
        <rect width={1080} height={1920} fill="url(#luzBombillo)" />
      </svg>
      {/* póster oficial de GTA VI pegado con cinta */}
      <div style={{ position: "absolute", left: 726, top: 330, width: 300, height: 424, rotate: "2.5deg", border: `6px solid ${COL.linea}`, boxShadow: "0 10px 20px rgba(0,0,0,0.35)", background: "#222" }}>
        <Img src={staticFile("glowup/gta/poster.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: -18, top: -14, width: 70, height: 26, background: "rgba(240,230,190,0.85)", rotate: "-30deg" }} />
        <div style={{ position: "absolute", right: -18, top: -14, width: 70, height: 26, background: "rgba(240,230,190,0.85)", rotate: "28deg" }} />
        <div style={{ position: "absolute", left: -18, bottom: -12, width: 70, height: 26, background: "rgba(240,230,190,0.85)", rotate: "25deg" }} />
      </div>
    </AbsoluteFill>
  );
};
const C2 = { cable: "#2E2B2A" };

/** Moscas que dan vueltas alrededor de un punto. */
export const Moscas: React.FC<{ t: number; cx: number; cy: number; radio: number; n?: number }> = ({ t, cx, cy, radio, n = 4 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: n }, (_, i) => {
      const a = t * (2.2 + rnd(i) * 1.5) + i * 2.1;
      const x = cx + Math.cos(a) * radio * (0.8 + rnd(i + 9) * 0.4);
      const y = cy + Math.sin(a * 1.3) * radio * 0.45;
      const ala = Math.sin(t * 60 + i) * 0.5 + 0.5;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cx={-10} cy={-10} rx={15} ry={8 + ala * 5} fill="#E8F4FF" opacity={0.85} stroke={COL.linea} strokeWidth={2} />
          <ellipse cx={10} cy={-10} rx={15} ry={8 + ala * 5} fill="#E8F4FF" opacity={0.85} stroke={COL.linea} strokeWidth={2} />
          <ellipse rx={13} ry={11} fill={COL.linea} />
        </g>
      );
    })}
  </svg>
);

/** Rayas verdes de mal olor. */
export const Olor: React.FC<{ t: number; x: number; y: number; escala?: number }> = ({ t, x, y, escala = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {[0, 1, 2].map((i) => {
      const fase = (t * 0.8 + i / 3) % 1;
      const yy = y - fase * 160 * escala;
      return (
        <path
          key={i}
          d={`M ${x + (i - 1) * 60 * escala} ${yy} q ${18 * escala} ${-25 * escala} 0 ${-50 * escala} q ${-18 * escala} ${-25 * escala} 0 ${-50 * escala}`}
          fill="none"
          stroke="#8BCB55"
          strokeWidth={10 * escala}
          strokeLinecap="round"
          opacity={Math.sin(fase * Math.PI) * 0.85}
        />
      );
    })}
  </svg>
);

/** $1.000 (punto de miles, como se escribe en Latinoamérica). */
export const plata = (n: number) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });

/** Estrella de "nivel" como las de búsqueda de GTA (rellena si está ganada). */
const Estrella: React.FC<{ llena: boolean }> = ({ llena }) => (
  <svg width={52} height={52} viewBox="0 0 24 24">
    <path d="M12 2.5 L14.9 8.6 L21.5 9.3 L16.6 13.8 L18 20.4 L12 17 L6 20.4 L7.4 13.8 L2.5 9.3 L9.1 8.6 Z" fill={llena ? "#F5F5F5" : "rgba(0,0,0,0.35)"} stroke={llena ? "#000" : "#F5F5F5"} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

/** HUD estilo GTA: arriba a la derecha el dinero en verde (Pricedown) con la meta y las
 * estrellas de nivel; arriba a la izquierda la barra de días para GTA VI. */
export const Marcador: React.FC<{ t: number; t0: number; dias: number; dinero: number; meta: number; nivel: number }> = ({ t, t0, dias, dinero, meta, nivel }) => {
  if (t < t0) return null;
  const k = sp(t, t0, POP);
  const k2 = sp(t, t0 + 0.12, POP);
  const k3 = sp(t, t0 + 0.24, POP);
  return (
    <>
      <div style={{ position: "absolute", right: 40, top: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <div style={{ translate: `${(1 - k) * 500}px 0`, fontFamily: GTA, fontSize: 132, lineHeight: 0.9, color: dinero > 0 ? "#72D15E" : "#E8473F", ...contorno(14), textShadow: "0 6px 0 rgba(0,0,0,0.35)" }}>{plata(dinero)}</div>
        <div style={{ translate: `${(1 - k2) * 500}px 0`, fontFamily: GTA, fontSize: 58, lineHeight: 1, color: "#FFFFFF", ...contorno(9) }}>
          META <span style={{ color: "#72D15E" }}>{plata(meta)}</span>
        </div>
        <div style={{ translate: `${(1 - k3) * 500}px 0`, display: "flex", gap: 4, alignItems: "center", marginTop: 6 }}>
          <span style={{ fontFamily: GTA, fontSize: 40, color: "#fff", ...contorno(7), marginRight: 8 }}>NIVEL</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <Estrella key={i} llena={i < nivel} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 80, translate: `${(1 - k) * -520}px 0`, width: 460, height: 120, background: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)", display: "flex", alignItems: "center", gap: 18, paddingLeft: 36 }}>
        <div style={{ fontFamily: SUBS, fontWeight: 900, fontSize: 26, lineHeight: 1.05, color: "#E9E9E9", letterSpacing: "0.04em" }}>
          GTA VI
          <br />
          SALE EN
        </div>
        <div style={{ fontFamily: GTA, fontSize: 104, lineHeight: 0.85, color: "#F7C948", ...contorno(10) }}>{dias}</div>
        <div style={{ fontFamily: GTA, fontSize: 48, lineHeight: 1, color: "#fff", ...contorno(7) }}>DÍAS</div>
      </div>
    </>
  );
};

/** "NUEVA MISIÓN" al estilo GTA: franjas de cine, texto Pricedown que golpea y billetes. */
export const Mision: React.FC<{ t: number; t0: number; tDias: number; tMonto: number; t1: number; dias: number; monto: number }> = ({ t, t0, tDias, tMonto, t1, dias, monto }) => {
  if (t < t0 - 0.05 || t > t1 + 0.35) return null;
  const barras = easeOut(prog(t, t0 - 0.05, t0 + 0.25)) * (1 - easeOut(prog(t, t1, t1 + 0.3)));
  const sale = 1 - prog(t, t1, t1 + 0.25);
  const golpe = (t1x: number) => {
    const k = clamp01((t - t1x) / 0.16);
    return { scale: String(lerp(2.6, 1, easeOut(k))), opacity: k * sale };
  };
  const temblor = t > tMonto && t < tMonto + 0.35 ? Math.sin(t * 90) * 10 * (1 - (t - tMonto) / 0.35) : 0;
  const cuenta = Math.round(monto * easeOut(clamp01((t - tMonto) / 0.5)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)", opacity: barras }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 230 * barras, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 230 * barras, background: "#000" }} />
      {/* billetes que salen volando */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }, (_, i) => {
          const v = clamp01((t - tMonto - rnd(i) * 0.15) / 1.3);
          if (v <= 0 || v >= 1) return null;
          const ang = rnd(i + 2) * Math.PI * 2;
          const x = 540 + Math.cos(ang) * v * (500 + rnd(i) * 300);
          const y = 900 + Math.sin(ang) * v * 700 + v * v * 500;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(rnd(i + 5) - 0.5) * 720 * v})`} opacity={(1 - v) * sale}>
              <rect x={-60} y={-30} width={120} height={60} rx={6} fill="#85C46B" stroke="#1E5A2B" strokeWidth={4} />
              <circle r={16} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={3} />
              <text y={8} textAnchor="middle" fontFamily="Arial Black" fontSize={22} fill="#1E5A2B">$</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", translate: `${temblor}px 0` }}>
        <div style={{ fontFamily: GTA, fontSize: 140, color: "#F7C948", ...contorno(14), textShadow: "0 8px 0 rgba(0,0,0,0.4)", ...golpe(t0) }}>NUEVA MISIÓN</div>
        <div style={{ fontFamily: GTA, fontSize: 92, color: "#fff", ...contorno(12), marginTop: 10, ...golpe(tDias) }}>EN {dias} DÍAS</div>
        <div style={{ fontFamily: GTA, fontSize: 230, color: "#72D15E", ...contorno(20), textShadow: "0 10px 0 rgba(0,0,0,0.45)", lineHeight: 1, marginTop: 6, ...golpe(tMonto) }}>{plata(cuenta)}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Notificación del celular (diseño propio, sin logos oficiales). */
export const Notificacion: React.FC<{ t: number; t0: number; t1: number; titulo: string; texto: string }> = ({ t, t0, t1, titulo, texto }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.3));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 250, translate: `0 ${(1 - k) * -300}px`, opacity: clamp01(k * 2), background: "rgba(255,253,247,0.97)", borderRadius: 34, padding: "22px 26px", display: "flex", gap: 22, alignItems: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }}>
      <div style={{ width: 112, height: 112, borderRadius: 26, background: "linear-gradient(160deg, #3A2A6B, #E0569B 70%, #F7A35C)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", overflow: "hidden" }}>
        <Img src={staticFile("glowup/gta/logo.png")} style={{ width: 100, height: "auto" }} />
      </div>
      <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#222" }}>{titulo} <span style={{ fontWeight: 400, color: "#888", fontSize: 32 }}>· ahora</span></div>
        <div style={{ fontSize: 54, fontWeight: 700, color: "#222", marginTop: 6 }}>{texto}</div>
      </div>
    </div>
  );
};

/** Primer plano: billetera que se abre vacía, sale una polilla y un "$0" rojo. */
export const BilleteraVacia: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const k = sp(t, t0, POP);
  const abre = easeOut(prog(t, t0 + 0.25, t0 + 0.6));
  const vuela = clamp01((t - t0 - 0.55) / 1.6);
  const cero = sp(t, t0 + 0.75, POP);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, #4F8A8F 0%, #23464A 75%)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 1000) scale(${lerp(0.5, 1.15, k)})`}>
          {/* mitad derecha (fija) con bolsillos vacíos */}
          <rect x={0} y={-210} width={340} height={420} rx={34} fill="#8A5634" {...L} strokeWidth={8} />
          <rect x={22} y={-188} width={296} height={376} rx={22} fill="none" stroke="#C88B5C" strokeWidth={5} strokeDasharray="18 12" />
          {[-140, -60, 20].map((y, i) => (
            <path key={i} d={`M 40 ${y} H 300 V ${y + 60} H 40 Z`} fill="#6E4127" {...L} strokeWidth={5} />
          ))}
          <path d="M 40 110 H 300 V 180 H 40 Z" fill="#4A2A18" {...L} strokeWidth={5} />
          {/* mitad izquierda: se despliega desde cerrada (encima de la derecha) */}
          <g transform={`scale(${lerp(-1, 1, abre)} 1)`}>
            <rect x={-340} y={-210} width={340} height={420} rx={34} fill="#9A6440" {...L} strokeWidth={8} />
            <rect x={-318} y={-188} width={296} height={376} rx={22} fill="none" stroke="#C88B5C" strokeWidth={5} strokeDasharray="18 12" />
            {abre > 0.5 ? <path d="M -300 -120 H -40 V 150 H -300 Z" fill="#6E4127" {...L} strokeWidth={5} /> : null}
          </g>
          {/* polilla */}
          {vuela > 0 ? (
            <g transform={`translate(${170 + Math.sin(vuela * 9) * 120 * vuela} ${120 - vuela * 760})`} opacity={1 - clamp01((vuela - 0.8) * 5)}>
              <path d={`M 0 0 Q ${-90} ${-70 - Math.sin(t * 40) * 30} ${-110} 10 Q -60 50 0 10 Z`} fill="#B9B2A4" {...L} strokeWidth={5} />
              <path d={`M 0 0 Q ${90} ${-70 - Math.sin(t * 40) * 30} ${110} 10 Q 60 50 0 10 Z`} fill="#B9B2A4" {...L} strokeWidth={5} />
              <ellipse cx={0} cy={6} rx={14} ry={38} fill="#7D7568" {...L} strokeWidth={5} />
              <path d="M -6 -28 Q -20 -60 -34 -64 M 6 -28 Q 20 -60 34 -64" fill="none" {...L} strokeWidth={4} />
            </g>
          ) : null}
          {/* polvo */}
          {Array.from({ length: 12 }, (_, i) => {
            const v = clamp01((t - t0 - 0.5 - rnd(i) * 0.3) / 1.2);
            return v > 0 ? <circle key={i} cx={170 + (rnd(i + 3) - 0.5) * 300} cy={100 - v * 360 * (0.5 + rnd(i + 7))} r={8 + rnd(i) * 8} fill="#D8D0C0" opacity={(1 - v) * 0.8} /> : null;
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: FUENTE, fontSize: 240, color: COL.rojo, WebkitTextStroke: `16px ${COL.linea}`, paintOrder: "stroke fill", scale: String(lerp(0.3, 1, cero)), opacity: clamp01(cero * 2) }}>$0</div>
    </div>
  );
};

/** Brazo de la mamá que entra por la derecha con una moneda, y su grito. */
export const Mama: React.FC<{ t: number; t0: number; t1: number; texto?: string; objeto?: "moneda" | "guantes" | "vaporub" | "chancla" }> = ({ t, t0, t1, texto = "¡TOMA, MIJO!", objeto = "moneda" }) => {
  if (t < t0 || t > t1 + 0.4) return null;
  const k = easeOut(prog(t, t0, t0 + 0.35)) * (1 - easeOut(prog(t, t1, t1 + 0.35)));
  const g = sp(t, t0 + 0.2, POP) * (1 - prog(t, t1, t1 + 0.2));
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${lerp(560, 0, k)} 0)`}>
          <path d="M 1100 980 L 760 1000 Q 730 1004 730 1030 Q 732 1056 760 1058 L 1100 1070 Z" fill="#E77BA2" {...L} />
          {[[860, 1010], [940, 1040], [1020, 1012], [900, 1062], [990, 1060]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={9} fill="#FFE07A" />
          ))}
          <path d="M 735 1004 Q 690 996 676 1016 Q 668 1044 690 1056 Q 716 1066 736 1054 Z" fill="#D9A27A" {...L} />
          {objeto === "moneda" ? (
            <>
              <circle cx={660} cy={1030} r={34} fill="#F2C744" {...L} />
              <text x={660} y={1043} textAnchor="middle" fontFamily={FUENTE} fontSize={38} fill="#9C7A16">$</text>
            </>
          ) : objeto === "chancla" ? (
            <g transform="rotate(-25 650 1030)">
              {/* chancla de goma levantada */}
              <path d="M 560 990 Q 560 960 600 958 L 720 962 Q 760 966 760 1000 Q 760 1034 720 1038 L 600 1042 Q 560 1040 560 1010 Z" fill="#3B8BEB" {...L} />
              <path d="M 620 960 Q 650 1000 690 962" fill="none" stroke="#F2F2F2" strokeWidth={14} strokeLinecap="round" />
            </g>
          ) : objeto === "vaporub" ? (
            <g>
              {/* frasco azul de pomada mentolada */}
              <rect x={600} y={990} width={110} height={90} rx={14} fill="#2B5DB8" {...L} />
              <rect x={592} y={968} width={126} height={34} rx={10} fill="#1C3F86" {...L} strokeWidth={5} />
              <rect x={616} y={1018} width={78} height={34} rx={6} fill="#fff" {...L} strokeWidth={3} />
            </g>
          ) : (
            <g>
              {/* guantes amarillos de goma y una esponja */}
              <path d="M 560 960 L 640 960 L 650 1060 Q 640 1110 600 1110 Q 556 1106 552 1060 Z" fill="#F2CF2E" {...L} />
              <path d="M 552 990 Q 530 990 528 1020 Q 532 1040 554 1036" fill="#F2CF2E" {...L} strokeWidth={5} />
              <path d="M 610 990 L 690 990 L 700 1090 Q 690 1140 650 1140 Q 606 1136 602 1090 Z" fill="#F7D946" {...L} />
              <rect x={540} y={1100} width={130} height={60} rx={14} fill="#7BC96F" {...L} />
              <rect x={540} y={1100} width={130} height={24} rx={10} fill="#F5E27A" {...L} strokeWidth={4} />
            </g>
          )}
        </g>
      </svg>
      <div style={{ position: "absolute", right: 40, top: 330, scale: String(lerp(0.3, 1, g)), opacity: clamp01(g * 2), background: COL.blanco, border: `6px solid ${COL.linea}`, borderRadius: 40, padding: "18px 34px", fontFamily: FUENTE, fontSize: 64, color: COL.linea, rotate: "0deg" }}>
        {texto}
        <div style={{ position: "absolute", left: 60, bottom: -34, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `34px solid ${COL.linea}` }} />
      </div>
    </>
  );
};

const IconoCaja: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <path d="M 18 40 L 50 26 L 82 40 L 82 80 L 50 94 L 18 80 Z" fill="#D9A55B" stroke={COL.linea} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 18 40 L 50 54 L 82 40 M 50 54 L 50 94" fill="none" stroke={COL.linea} strokeWidth={4} />
    <rect x={30} y={10} width={26} height={22} rx={4} fill="#3A3A40" stroke={COL.linea} strokeWidth={3} />
    <circle cx={66} cy={22} r={11} fill="#C58B5A" stroke={COL.linea} strokeWidth={3} />
    <rect x={56} y={58} width={22} height={14} rx={3} fill={COL.verde} stroke={COL.linea} strokeWidth={3} />
    <text x={67} y={69} textAnchor="middle" fontFamily="Arial Black" fontSize={11} fill={COL.linea}>$</text>
  </svg>
);
const IconoMaletin: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <rect x={14} y={34} width={72} height={52} rx={8} fill="#7A4A2C" stroke={COL.linea} strokeWidth={4} />
    <path d="M 38 34 V 24 Q 38 20 42 20 H 58 Q 62 20 62 24 V 34" fill="none" stroke={COL.linea} strokeWidth={5} />
    <path d="M 14 54 H 86" stroke={COL.linea} strokeWidth={4} />
    <rect x={44} y={49} width={12} height={10} rx={2} fill={COL.amarillo} stroke={COL.linea} strokeWidth={3} />
  </svg>
);

/** Tarjetas de votación "A vs B" con íconos dibujados. */
export const Votacion: React.FC<{ t: number; tA: number; tB: number; t1: number; a: string; b: string; iconoA?: React.ReactNode; iconoB?: React.ReactNode; sub?: string }> = ({ t, tA, tB, t1, a, b, iconoA, iconoB, sub = "¿PRIMERO?" }) => {
  if (t < tA - 0.05) return null;
  const sale = 1 - prog(t, t1, t1 + 0.25);
  const ka = sp(t, tA, POP);
  const kb = sp(t, tB, POP);
  const kv = sp(t, tB + 0.15, POP);
  const Tarjeta: React.FC<{ k: number; color: string; texto: string; icono: React.ReactNode }> = ({ k, color, texto, icono }) => (
    <div style={{ width: 400, scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2), background: COL.blanco, borderRadius: 36, border: `7px solid ${COL.linea}`, boxShadow: "0 16px 30px rgba(0,0,0,0.35)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", background: color, display: "flex", justifyContent: "center", padding: "18px 0", borderBottom: `7px solid ${COL.linea}` }}>{icono}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 50, lineHeight: 1, color: COL.linea, textAlign: "center", padding: "20px 16px 8px" }}>{texto}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 30, color: color, paddingBottom: 18 }}>{sub}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: sale }}>
      <Tarjeta k={ka} color={COL.amarillo} texto={a} icono={iconoA ?? <IconoCaja />} />
      <div style={{ position: "absolute", scale: String(lerp(0, 1, kv)), width: 130, height: 130, borderRadius: 65, background: COL.rojo, border: `7px solid ${COL.linea}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: 60, color: "#fff", zIndex: 2 }}>VS</div>
      <Tarjeta k={kb} color={COL.azul} texto={b} icono={iconoB ?? <IconoMaletin />} />
    </div>
  );
};

/** Botón "SEGUIR" y etiqueta "DÍA 1 →". */
export const Seguir: React.FC<{ t: number; t0: number; dia: number }> = ({ t, t0, dia }) => {
  if (t < t0) return null;
  const k = sp(t, t0, POP);
  const k2 = sp(t, t0 + 0.25, POP);
  const pulso = 1 + 0.04 * Math.sin((t - t0) * 7);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ scale: String(lerp(0.3, 1, k) * pulso), background: "#0095F6", color: "#fff", fontFamily: FUENTE, fontSize: 76, padding: "18px 70px", borderRadius: 28, border: `7px solid ${COL.linea}`, boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}>SEGUIR</div>
      <div style={{ scale: String(lerp(0.3, 1, k2)), opacity: clamp01(k2 * 2), background: COL.amarillo, color: COL.linea, fontFamily: FUENTE, fontSize: 54, padding: "10px 36px", borderRadius: 999, border: `6px solid ${COL.linea}` }}>DÍA {dia} →</div>
    </div>
  );
};

/** Bloques de una línea: hasta 3 palabras y 18 letras; corta en puntos y comas. */
const bloques = (ps: Palabra[]) => {
  const out: Palabra[][] = [];
  let actual: Palabra[] = [];
  const largo = (b: Palabra[]) => b.map((w) => w.p).join(" ").length;
  for (const w of ps) {
    if (actual.length && (actual.length >= 3 || largo([...actual, w]) > 18 || w.ini - actual[actual.length - 1].fin > 0.4)) {
      out.push(actual);
      actual = [];
    }
    actual.push(w);
    if (/[.,:]$/.test(w.p)) {
      out.push(actual);
      actual = [];
    }
  }
  if (actual.length) out.push(actual);
  return out;
};

/** Subtítulos (Montserrat Black, como los escribe la voz), palabra por palabra: suben y se
 * enfocan; claves en amarillo y dinero en verde. Una sola línea. */
export const Subtitulos: React.FC<{ t: number; palabras: Palabra[]; y?: number }> = ({ t, palabras, y = 1440 }) => {
  const bs = bloques(palabras);
  const i = bs.findIndex((b, j) => t >= b[0].ini - 0.05 && (j + 1 >= bs.length || t < bs[j + 1][0].ini - 0.05));
  if (i < 0) return null;
  const b = bs[i];
  if (t > b[b.length - 1].fin + 0.7) return null;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, display: "flex", justifyContent: "center", gap: 22 }}>
      {b.map((w, j) => {
        const k = clamp01((t - (w.ini - 0.05)) / 0.16);
        return (
          <span
            key={j}
            style={{
              fontFamily: SUBS, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-0.01em",
              color: w.dinero ? COL.verde : w.clave ? COL.amarillo : "#fff",
              WebkitTextStroke: "12px #11131C", paintOrder: "stroke fill", textShadow: "0 6px 14px rgba(0,0,0,0.45)",
              display: "inline-block", opacity: k, translate: `0 ${(1 - easeOut(k)) * 28}px`,
              filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined, whiteSpace: "nowrap",
            }}
          >
            {w.p.replace(/[,:]/g, "")}
          </span>
        );
      })}
    </div>
  );
};
