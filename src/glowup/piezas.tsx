import React from "react";
import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, lerp, POP, prog, sp } from "../comun/animacion";

// Piezas de la serie de Toño (docs/glowup.md): cuarto de casa de su mamá, marcador fijo de
// días / billetera / nivel, notificación del celular, billetera vacía con polilla, tarjetas de
// votación, botón seguir y subtítulos. Diseño propio (no el de la referencia): pared verde
// azulado, sudadera roja, verde dinero y amarillo para las claves, letra Lilita One.

export const FUENTE = '"Lilita One", "Arial Black", sans-serif';
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

/** Cuarto de Toño en casa de su mamá (1080 × 1920). */
export const Cuarto: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <rect width={1080} height={1270} fill={COL.pared} />
    {Array.from({ length: 14 }, (_, i) => (
      <rect key={i} x={i * 80 + 20} y={0} width={34} height={1270} fill={COL.paredRaya} />
    ))}
    {/* ventana con atardecer */}
    <rect x={80} y={250} width={320} height={380} rx={8} fill="#E9DDC6" {...L} />
    <defs>
      <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6B15E" />
        <stop offset="1" stopColor="#EE6F67" />
      </linearGradient>
    </defs>
    <rect x={102} y={272} width={276} height={336} fill="url(#cielo)" />
    <circle cx={300} cy={520} r={46} fill="#FFE29A" opacity={0.9} />
    <path d="M 102 560 L 160 520 L 220 548 L 280 500 L 378 560 L 378 608 L 102 608 Z" fill="#B75A6A" opacity={0.7} />
    <path d="M 240 272 L 240 608 M 102 440 L 378 440" stroke="#E9DDC6" strokeWidth={14} />
    <path d="M 60 230 L 160 230 Q 150 450 120 660 L 60 660 Z" fill="#B84A3F" {...L} />
    {/* póster de un juego inventado */}
    <g transform="rotate(3 830 440)">
      <rect x={700} y={280} width={260} height={340} fill="#2B2350" {...L} />
      <path d="M 830 330 L 850 470 L 830 500 L 810 470 Z" fill="#9FB4C7" {...L} strokeWidth={4} />
      <rect x={800} y={490} width={60} height={14} fill="#C9A34A" {...L} strokeWidth={3} />
      <text x={830} y={575} textAnchor="middle" fontFamily={FUENTE} fontSize={44} fill={COL.amarillo}>PIXEL</text>
      <text x={830} y={608} textAnchor="middle" fontFamily={FUENTE} fontSize={30} fill="#FFFFFF">QUEST</text>
    </g>
    {/* suelo */}
    <rect y={1250} width={1080} height={670} fill={COL.suelo} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={0} y1={1330 + i * 95} x2={1080} y2={1330 + i * 95} stroke={COL.sueloLinea} strokeWidth={5} />
    ))}
    <rect y={1240} width={1080} height={26} fill={COL.zocalo} />
    {/* colchón en el suelo con cobija */}
    <rect x={20} y={1300} width={360} height={110} rx={26} fill="#D9D2C3" {...L} />
    <path d="M 60 1300 Q 160 1270 300 1310 L 340 1404 Q 200 1420 70 1404 Z" fill="#5A7BB5" {...L} />
    {/* mesita con tele vieja y consola */}
    <rect x={720} y={1080} width={300} height={190} fill="#6B4A33" {...L} />
    <rect x={740} y={890} width={260} height={200} rx={22} fill="#3A3A40" {...L} />
    <rect x={765} y={912} width={180} height={150} rx={14} fill={`hsl(${200 + Math.sin(t * 3) * 20} 50% ${22 + Math.sin(t * 7) * 4}%)`} />
    <circle cx={972} cy={950} r={10} fill="#8C8C93" />
    <circle cx={972} cy={990} r={10} fill="#8C8C93" />
    <rect x={760} y={1180} width={150} height={44} rx={10} fill="#D8D8DD" {...L} strokeWidth={4} />
    {/* basura en el suelo */}
    <g>
      <rect x={560} y={1690} width={220} height={36} rx={4} fill="#D9A55B" {...L} />
      <text x={670} y={1717} textAnchor="middle" fontFamily={FUENTE} fontSize={26} fill="#B3412F">PIZZA</text>
      {[[150, 1600, -20], [880, 1520, 70], [960, 1760, 10], [420, 1800, 95]].map(([x, y, g], i) => (
        <g key={i} transform={`rotate(${g} ${x} ${y})`}>
          <rect x={x - 18} y={y - 34} width={36} height={68} rx={6} fill={i % 2 ? "#3DA35D" : "#D94848"} {...L} strokeWidth={4} />
        </g>
      ))}
      <path d="M 250 1730 Q 300 1700 350 1735 Q 330 1770 270 1765 Z" fill="#E7E2D6" {...L} strokeWidth={4} />
      <path d="M 830 1640 L 900 1620 L 930 1660 L 860 1690 Z" fill="#F2C744" {...L} strokeWidth={4} />
    </g>
  </svg>
);

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

/** Marcador fijo de arriba: días para GTA VI, billetera con barra y nivel. */
export const Marcador: React.FC<{ t: number; t0: number; dias: number; dinero: number; meta: number; nivel: number }> = ({ t, t0, dias, dinero, meta, nivel }) => {
  if (t < t0) return null;
  const k = sp(t, t0, POP);
  const k2 = sp(t, t0 + 0.15, POP);
  const frac = clamp01(dinero / meta);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 70, display: "flex", gap: 18, alignItems: "stretch" }}>
      <div style={{ translate: `0 ${(1 - k) * -160}px`, background: COL.blanco, borderRadius: 26, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 10px 24px rgba(0,0,0,0.35)", border: `5px solid ${COL.linea}` }}>
        <svg width={58} height={58} viewBox="0 0 24 24">
          <rect x={2} y={4} width={20} height={18} rx={3} fill={COL.blanco} stroke={COL.linea} strokeWidth={2} />
          <rect x={2} y={4} width={20} height={6} rx={2} fill={COL.rojo} stroke={COL.linea} strokeWidth={2} />
          <path d="M7 2 V6 M17 2 V6" stroke={COL.linea} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: FUENTE, lineHeight: 0.9 }}>
          <div style={{ fontSize: 26, color: "#6B6B6B" }}>DÍAS PARA GTA VI</div>
          <div style={{ fontSize: 64, color: COL.linea }}>{dias}</div>
        </div>
      </div>
      <div style={{ flex: 1, translate: `0 ${(1 - k2) * -160}px`, background: COL.blanco, borderRadius: 26, padding: "12px 20px", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", border: `5px solid ${COL.linea}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: FUENTE }}>
          <span style={{ fontSize: 28, color: "#6B6B6B" }}>BILLETERA</span>
          <span style={{ fontSize: 40, color: COL.linea }}>
            <span style={{ color: dinero > 0 ? COL.verdeOscuro : COL.rojo }}>{plata(dinero)}</span> / {plata(meta)}
          </span>
        </div>
        <div style={{ height: 30, borderRadius: 15, background: "#E3DED3", border: `4px solid ${COL.linea}`, overflow: "hidden" }}>
          <div style={{ width: `${Math.max(frac, 0.015) * 100}%`, height: "100%", background: COL.verde }} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, top: 150, translate: `0 ${(1 - k2) * -260}px`, background: "#7B4DD6", color: "#fff", fontFamily: FUENTE, fontSize: 34, padding: "6px 22px", borderRadius: 999, border: `5px solid ${COL.linea}` }}>NIVEL {nivel}</div>
    </div>
  );
};

/** Notificación del celular (diseño propio, sin logos oficiales). */
export const Notificacion: React.FC<{ t: number; t0: number; t1: number; titulo: string; texto: string }> = ({ t, t0, t1, titulo, texto }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.3));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 250, translate: `0 ${(1 - k) * -300}px`, opacity: clamp01(k * 2), background: "rgba(255,253,247,0.97)", borderRadius: 34, padding: "22px 26px", display: "flex", gap: 22, alignItems: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }}>
      <div style={{ width: 96, height: 96, borderRadius: 24, background: "linear-gradient(135deg, #FF5DA2, #7B4DD6)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width={64} height={64} viewBox="0 0 24 24">
          <path d="M6 8 H18 A4 4 0 0 1 22 12 V15 A3 3 0 0 1 16.6 16.6 L15 15 H9 L7.4 16.6 A3 3 0 0 1 2 15 V12 A4 4 0 0 1 6 8 Z" fill="#fff" />
          <path d="M7 10.5 V13.5 M5.5 12 H8.5" stroke="#7B4DD6" strokeWidth={1.6} strokeLinecap="round" />
          <circle cx={16} cy={11} r={1} fill="#7B4DD6" />
          <circle cx={18} cy={13} r={1} fill="#7B4DD6" />
        </svg>
      </div>
      <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#222" }}>{titulo} <span style={{ fontWeight: 400, color: "#888", fontSize: 30 }}>· ahora</span></div>
        <div style={{ fontSize: 46, fontWeight: 600, color: "#222", marginTop: 6 }}>{texto}</div>
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
export const Mama: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
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
          <circle cx={660} cy={1030} r={34} fill="#F2C744" {...L} />
          <text x={660} y={1043} textAnchor="middle" fontFamily={FUENTE} fontSize={38} fill="#9C7A16">$</text>
        </g>
      </svg>
      <div style={{ position: "absolute", right: 40, top: 330, scale: String(lerp(0.3, 1, g)), opacity: clamp01(g * 2), background: COL.blanco, border: `6px solid ${COL.linea}`, borderRadius: 40, padding: "18px 34px", fontFamily: FUENTE, fontSize: 64, color: COL.linea, rotate: "0deg" }}>
        ¡TOMA, MIJO!
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
export const Votacion: React.FC<{ t: number; tA: number; tB: number; t1: number; a: string; b: string }> = ({ t, tA, tB, t1, a, b }) => {
  if (t < tA - 0.05) return null;
  const sale = 1 - prog(t, t1, t1 + 0.25);
  const ka = sp(t, tA, POP);
  const kb = sp(t, tB, POP);
  const kv = sp(t, tB + 0.15, POP);
  const Tarjeta: React.FC<{ k: number; color: string; texto: string; icono: React.ReactNode }> = ({ k, color, texto, icono }) => (
    <div style={{ width: 400, scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2), background: COL.blanco, borderRadius: 36, border: `7px solid ${COL.linea}`, boxShadow: "0 16px 30px rgba(0,0,0,0.35)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", background: color, display: "flex", justifyContent: "center", padding: "18px 0", borderBottom: `7px solid ${COL.linea}` }}>{icono}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 50, lineHeight: 1, color: COL.linea, textAlign: "center", padding: "20px 16px 8px" }}>{texto}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 30, color: color, paddingBottom: 18 }}>¿PRIMERO?</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: sale }}>
      <Tarjeta k={ka} color={COL.amarillo} texto={a} icono={<IconoCaja />} />
      <div style={{ position: "absolute", scale: String(lerp(0, 1, kv)), width: 130, height: 130, borderRadius: 65, background: COL.rojo, border: `7px solid ${COL.linea}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: 60, color: "#fff", zIndex: 2 }}>VS</div>
      <Tarjeta k={kb} color={COL.azul} texto={b} icono={<IconoMaletin />} />
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

/** Subtítulos grandes en mayúsculas, palabra por palabra; claves en amarillo y dinero en verde. */
export const Subtitulos: React.FC<{ t: number; palabras: Palabra[]; y?: number }> = ({ t, palabras, y = 1440 }) => {
  const bs = bloques(palabras);
  const i = bs.findIndex((b, j) => t >= b[0].ini - 0.05 && (j + 1 >= bs.length || t < bs[j + 1][0].ini - 0.05));
  if (i < 0) return null;
  const b = bs[i];
  if (t > b[b.length - 1].fin + 0.7) return null;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, display: "flex", justifyContent: "center", gap: 20 }}>
      {b.map((w, j) => {
        const k = clamp01((t - (w.ini - 0.04)) / 0.12);
        if (k <= 0) return <span key={j} style={{ opacity: 0, fontFamily: FUENTE, fontSize: 108 }}>{w.p}</span>;
        return (
          <span
            key={j}
            style={{
              fontFamily: FUENTE, fontSize: 108, lineHeight: 1, textTransform: "uppercase",
              color: w.dinero ? COL.verde : w.clave ? COL.amarillo : "#fff",
              WebkitTextStroke: `16px ${COL.linea}`, paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,0.35)",
              display: "inline-block", scale: String(lerp(1.35, 1, easeOut(k))), opacity: k, whiteSpace: "nowrap",
            }}
          >
            {w.p.replace(/[,:]/g, "")}
          </span>
        );
      })}
    </div>
  );
};
