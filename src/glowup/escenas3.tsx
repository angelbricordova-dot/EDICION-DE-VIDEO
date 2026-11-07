import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, easeIn, easeOut, lerp, POP, prog, sp } from "../comun/animacion";
import { COL, FUENTE, GTA, plata, rnd, SUBS } from "./piezas";
import { Expresion, Tono } from "./Tono";

// Día 3 de Toño (limpia el garaje y vende): polvo y araña, chaqueta con billete, teléfono con
// los anuncios, el comprador que se lleva la bici, chat y anuncio de Brayan, lavandería con la
// mamá, Brayan presumiendo e íconos de la votación (curso del gurú vs aprender gratis).

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });

/* ───────────── objetos dibujados (caja 100 × 100) ───────────── */
export type Objeto = "bici" | "consola" | "navidad" | "patineta" | "lampara" | "lavadora";
export const Dibujo: React.FC<{ que: Objeto; tam?: number }> = ({ que, tam = 100 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    {que === "bici" ? (
      <g fill="none" stroke={COL.linea} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={24} cy={66} r={17} fill="#fff" />
        <circle cx={76} cy={66} r={17} fill="#fff" />
        <path d="M 24 66 L 42 40 L 66 40 L 76 66 M 42 40 L 52 66 L 66 40 M 52 66 L 24 66" stroke="#E5484D" strokeWidth={5} />
        <path d="M 38 32 L 48 32 M 66 40 L 62 28 L 72 26" />
      </g>
    ) : que === "consola" ? (
      <g stroke={COL.linea} strokeWidth={4} strokeLinejoin="round">
        <rect x={10} y={30} width={80} height={38} rx={8} fill="#3A3F4A" />
        <rect x={18} y={38} width={40} height={6} rx={3} fill="#22262D" />
        <circle cx={76} cy={50} r={6} fill="#3DDC84" />
        <path d="M 22 78 Q 18 70 26 68 L 44 68 Q 52 70 48 78 Q 44 88 35 84 Q 26 88 22 78 Z" fill="#55555D" />
      </g>
    ) : que === "navidad" ? (
      <g stroke={COL.linea} strokeWidth={4} strokeLinejoin="round">
        <rect x={14} y={34} width={72} height={52} fill="#C99A5B" />
        <rect x={14} y={34} width={72} height={14} fill="#B58548" />
        <path d="M 30 30 L 38 14 L 46 30 Z" fill="#3E8E5A" />
        <circle cx={60} cy={22} r={7} fill="#E5484D" />
        <text x={50} y={74} textAnchor="middle" fontFamily="Arial Black" fontSize={11} fill="#8A3B2E" stroke="none">NAVIDAD</text>
      </g>
    ) : que === "patineta" ? (
      <g stroke={COL.linea} strokeWidth={4} strokeLinejoin="round">
        <path d="M 10 52 Q 10 42 22 42 L 78 42 Q 90 42 90 52 Q 90 58 80 58 L 20 58 Q 10 58 10 52 Z" fill="#F29E4C" />
        <circle cx={28} cy={68} r={8} fill="#F7C948" />
        <circle cx={72} cy={68} r={8} fill="#F7C948" />
      </g>
    ) : que === "lampara" ? (
      <g stroke={COL.linea} strokeWidth={4} strokeLinejoin="round">
        <path d="M 30 18 L 70 18 L 80 50 L 20 50 Z" fill="#F7C948" />
        <rect x={46} y={50} width={8} height={30} fill="#8C8781" />
        <rect x={30} y={80} width={40} height={10} rx={4} fill="#55555D" />
      </g>
    ) : (
      <g stroke={COL.linea} strokeWidth={4} strokeLinejoin="round">
        <rect x={18} y={10} width={64} height={82} rx={8} fill="#F2F0EA" />
        <rect x={18} y={10} width={64} height={18} rx={6} fill="#E1DED5" />
        <circle cx={50} cy={60} r={22} fill="#C9D3DA" />
        <circle cx={50} cy={60} r={14} fill="#8FB6CF" />
      </g>
    )}
  </svg>
);

/* ───────────── garaje: cajas, polvo, araña y brillos ───────────── */

/** Montañas de cajas y trastos en el garaje (antes de limpiar). Sale volando cuando limpia. */
export const Trastos: React.FC<{ t: number; tVuelan?: number }> = ({ t, tVuelan = 1e9 }) => {
  const cajas: [number, number, number, number, string][] = [
    [40, 1180, 170, 130, "#C99A5B"], [70, 1060, 140, 120, "#B58548"], [210, 1220, 150, 120, "#D9B26F"],
    [830, 1210, 190, 140, "#C99A5B"], [860, 1080, 150, 130, "#B58548"], [700, 1290, 140, 110, "#D9B26F"],
    [80, 950, 110, 110, "#C99A5B"], [890, 960, 120, 120, "#D9B26F"],
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {cajas.map(([x, y, w, h, c], i) => {
        const v = clamp01((t - tVuelan - i * 0.18) / 0.7);
        const lado = x < 540 ? -1 : 1;
        const dx = lado * easeIn(v) * 700;
        const dy = -Math.sin(v * Math.PI) * 300;
        return v >= 1 ? null : (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${v * lado * 200} ${x + w / 2} ${y + h / 2})`}>
            <rect x={x} y={y} width={w} height={h} fill={c} {...L} />
            <path d={`M ${x} ${y + 26} L ${x + w} ${y + 26} M ${x + w / 2 - 18} ${y} L ${x + w / 2 - 18} ${y + 26} M ${x + w / 2 + 18} ${y} L ${x + w / 2 + 18} ${y + 26}`} stroke={COL.linea} strokeWidth={4} />
            <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fontFamily={FUENTE} fontSize={22} fill="#7A4A2A">{["JUGUETES", "CABLES", "VARIOS", "COSAS", "ROPA", "???", "DVDs", "VIEJO"][i]}</text>
          </g>
        );
      })}
      {/* telarañas en las esquinas */}
      {[[0, 0, 1], [1080, 0, -1]].map(([x, y, s], i) => (
        <g key={`w${i}`} transform={`translate(${x} ${y + 260}) scale(${s} 1)`} stroke="#E8E8E8" strokeWidth={3} fill="none" opacity={0.8}>
          <path d="M 0 0 L 150 0 M 0 0 L 0 150 M 0 0 L 110 110 M 0 0 L 140 60 M 0 0 L 60 140" />
          <path d="M 50 0 Q 40 30 0 50 M 100 0 Q 85 60 0 100 M 140 0 Q 120 90 0 140" />
        </g>
      ))}
    </svg>
  );
};

/** Nubes de polvo que salen al sacudir y barrer. */
export const Polvo: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.6) return null;
  const sale = 1 - prog(t, t1, t1 + 0.6);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: sale }}>
      {Array.from({ length: 16 }, (_, i) => {
        const v = ((t - t0) * (0.5 + rnd(i) * 0.4) + rnd(i + 5)) % 1;
        const x = 120 + rnd(i + 9) * 840 + Math.sin(t * 2 + i) * 40;
        const y = 1350 - v * 700;
        const r = 40 + v * 90;
        return <circle key={i} cx={x} cy={y} r={r} fill="#C9BFAF" opacity={(1 - v) * 0.75} />;
      })}
    </svg>
  );
};

/** Araña que baja colgando de su hilo y aterriza en el pelo de Toño. */
export const Arana: React.FC<{ t: number; t0: number; t1: number; x?: number; y?: number }> = ({ t, t0, t1, x = 560, y = 430 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const baja = easeOut(clamp01((t - t0) / 0.5));
  const yy = lerp(-60, y, baja) + Math.sin(t * 9) * 6 * baja;
  const sale = 1 - prog(t, t1, t1 + 0.3);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: sale }}>
      <line x1={x} y1={0} x2={x} y2={yy} stroke="#EDEDED" strokeWidth={3} />
      <g transform={`translate(${x} ${yy}) scale(1.6)`}>
        {[-1, 1].map((s) =>
          [0, 1, 2, 3].map((i) => (
            <path key={`${s}${i}`} d={`M 0 0 Q ${s * 40} ${-20 + i * 14} ${s * 56} ${-4 + i * 18}`} fill="none" stroke={COL.linea} strokeWidth={6} strokeLinecap="round" transform={`rotate(${Math.sin(t * 20 + i) * 6})`} />
          )),
        )}
        <ellipse rx={30} ry={26} fill="#6B3FA0" {...L} strokeWidth={4} />
        <path d="M -6 8 L 6 8 L -6 18 L 6 18 Z" fill="#E5484D" />
        <circle cx={-9} cy={-4} r={7} fill="#fff" />
        <circle cx={9} cy={-4} r={7} fill="#fff" />
        <circle cx={-8} cy={-3} r={3} fill={COL.linea} />
        <circle cx={10} cy={-3} r={3} fill={COL.linea} />
      </g>
    </svg>
  );
};

/** Destellos de limpio sobre el garaje ordenado. */
export const Brillos: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const v = ((t - t0) * 1.2 + rnd(i)) % 1;
        const x = 80 + rnd(i + 3) * 920;
        const y = 300 + rnd(i + 8) * 1250;
        const s = Math.sin(v * Math.PI) * (0.6 + rnd(i + 1) * 0.8);
        return <path key={i} d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#FFF7B0" stroke="#F7C948" strokeWidth={3} transform={`translate(${x} ${y}) scale(${s})`} />;
      })}
    </svg>
  );
};

/* ───────────── chaqueta con el billete ───────────── */

/** Primer plano: chaqueta vieja colgada; del bolsillo sale un billete que brilla. */
export const Chaqueta: React.FC<{ t: number; tBillete: number }> = ({ t, tBillete }) => {
  const sale = easeOut(clamp01((t - tBillete) / 0.5));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #6B5A48 0%, #2E2620 85%)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {/* rayos de luz detrás */}
        <g transform="translate(540 760)" opacity={0.25 + 0.25 * sale}>
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d="M 0 0 L -60 -900 L 60 -900 Z" fill="#FFE9A8" transform={`rotate(${i * (360 / 14) + t * 10})`} />
          ))}
        </g>
        {/* percha */}
        <path d="M 540 280 Q 540 240 570 240 Q 600 244 596 270 M 540 300 L 300 420 L 780 420 Z" fill="none" stroke="#8C8781" strokeWidth={12} strokeLinejoin="round" />
        {/* chaqueta de mezclilla */}
        <path d="M 330 410 L 470 380 L 540 470 L 610 380 L 750 410 L 880 760 L 790 790 L 760 640 L 770 1260 L 310 1260 L 320 640 L 290 790 L 200 760 Z" fill="#4D74A8" {...L} />
        <path d="M 470 380 L 540 470 L 610 380 L 600 470 L 540 600 L 480 470 Z" fill="#3B5D8C" {...L} strokeWidth={5} />
        <line x1={540} y1={600} x2={540} y2={1260} stroke={COL.linea} strokeWidth={6} />
        {[700, 820, 940, 1060, 1180].map((y) => <circle key={y} cx={570} cy={y} r={12} fill="#C9A35B" {...L} strokeWidth={4} />)}
        <path d="M 330 1180 L 750 1180" stroke="#3B5D8C" strokeWidth={10} />
        {/* bolsillo con el billete */}
        <g transform={`translate(${690 - sale * 150} ${790 - sale * 300}) rotate(${-8 + sale * 8}) scale(${1 + sale * 0.9})`}>
          <rect x={-110} y={-52} width={220} height={104} rx={10} fill="#85C46B" stroke="#1E5A2B" strokeWidth={6} />
          <rect x={-94} y={-38} width={188} height={76} rx={8} fill="none" stroke="#1E5A2B" strokeWidth={3} />
          <circle r={28} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily="Arial Black" fontSize={36} fill="#1E5A2B">10</text>
        </g>
        <path d="M 600 760 L 780 760 L 780 900 Q 690 940 600 900 Z" fill="#4D74A8" {...L} />
        <path d="M 600 760 L 780 760 L 770 800 L 610 800 Z" fill="#3B5D8C" {...L} strokeWidth={5} />
        <path d="M 330 760 L 480 760 L 480 900 Q 405 940 330 900 Z" fill="#4D74A8" {...L} />
        {/* destellos del billete */}
        {sale > 0.5
          ? [0, 1, 2, 3].map((i) => {
              const v = ((t - tBillete) * 1.5 + i / 4) % 1;
              const s = Math.sin(v * Math.PI);
              return <path key={i} d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="#FFF7B0" transform={`translate(${400 + i * 90} ${400 + (i % 2) * 180}) scale(${s * 1.6})`} />;
            })
          : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────── teléfono con los anuncios ───────────── */

export type Anuncio = { que: Objeto; nombre: string; precio: number; t0: number; vendido?: number };
/** Teléfono grande con la app de compraventa (diseño propio, "MERCADITO"): los anuncios entran
 *  uno a uno; un sello VENDIDO cuando toca. */
export const Telefono: React.FC<{ t: number; anuncios: Anuncio[]; titulo?: string }> = ({ t, anuncios, titulo = "Mis anuncios" }) => (
  <div style={{ position: "absolute", left: 190, top: 270, width: 700, height: 1110, borderRadius: 80, background: "#16171B", border: `8px solid ${COL.linea}`, padding: 24, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 56, background: "#F3F4F6", overflow: "hidden", fontFamily: SUBS }}>
      <div style={{ background: "#F7C948", padding: "46px 30px 22px", display: "flex", alignItems: "center", gap: 14, borderBottom: `5px solid ${COL.linea}` }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: COL.linea, color: "#F7C948", fontFamily: FUENTE, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>M</div>
        <div>
          <div style={{ fontFamily: FUENTE, fontSize: 40, color: COL.linea, lineHeight: 1 }}>MERCADITO</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#5A4A1A" }}>{titulo}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, padding: 20 }}>
        {anuncios.map((a, i) => {
          const k = sp(t, a.t0, POP);
          const v = a.vendido !== undefined ? clamp01((t - a.vendido) / 0.14) : 0;
          return t < a.t0 - 0.05 ? null : (
            <div key={i} style={{ width: 276, background: "#fff", borderRadius: 22, border: `4px solid ${COL.linea}`, overflow: "hidden", scale: String(lerp(0.3, 1, k)), opacity: clamp01(k * 2), position: "relative" }}>
              <div style={{ height: 180, background: "#E7ECEF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dibujo que={a.que} tam={160} />
              </div>
              <div style={{ padding: "10px 14px 14px" }}>
                <div style={{ fontWeight: 900, fontSize: 38, color: "#1E9E57" }}>{plata(a.precio)}</div>
                <div style={{ fontWeight: 700, fontSize: 24, color: "#333" }}>{a.nombre}</div>
              </div>
              {v > 0 ? (
                <div style={{ position: "absolute", left: 30, top: 70, rotate: "-14deg", scale: String(lerp(2.2, 1, easeOut(v))), opacity: v, border: "8px solid #E5484D", borderRadius: 12, padding: "0 14px", fontFamily: GTA, fontSize: 64, color: "#E5484D", background: "rgba(255,255,255,0.85)" }}>VENDIDO</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ───────────── puerta de la casa: el comprador se lleva la bici ───────────── */

/** Fachada de la casa de día; un comprador llega, paga y se va pedaleando con la bici. */
export const Porche: React.FC<{ t: number; t0: number; tPaga: number; children?: React.ReactNode }> = ({ t, t0, tPaga, children }) => {
  const llega = easeOut(clamp01((t - t0) / 0.6));
  const vaSe = easeIn(clamp01((t - tPaga - 0.3) / 1.0));
  const x = lerp(1250, 800, llega) + vaSe * 700;
  const rueda = (t - t0) * 400 * (vaSe > 0 ? 1 : 0.3);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect width={1080} height={1920} fill="#9FD3F5" />
        <circle cx={900} cy={180} r={70} fill="#FFE07A" />
        {/* fachada */}
        <rect x={0} y={420} width={1080} height={940} fill="#F0D9A8" {...L} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={480 + i * 76} x2={1080} y2={480 + i * 76} stroke="#E3C88F" strokeWidth={4} />)}
        <path d="M -20 430 L 540 250 L 1100 430 Z" fill="#B5523B" {...L} />
        {/* puerta abierta y ventana */}
        <rect x={360} y={700} width={360} height={660} fill="#3A2A20" {...L} />
        <path d="M 360 700 L 280 740 L 280 1340 L 360 1360 Z" fill="#8A5A3B" {...L} />
        <rect x={60} y={640} width={220} height={220} fill="#BFE3F5" {...L} />
        <path d="M 170 640 L 170 860 M 60 750 L 280 750" stroke={COL.linea} strokeWidth={6} />
        {/* maceta */}
        <path d="M 820 1250 L 960 1250 L 940 1360 L 840 1360 Z" fill="#C26A3E" {...L} />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={850 + i * 22} cy={1210 - (i % 2) * 40} rx={30} ry={60} fill="#3E8E5A" {...L} strokeWidth={4} transform={`rotate(${(i - 2) * 18} ${850 + i * 22} 1250)`} />)}
        {/* acera */}
        <rect y={1360} width={1080} height={560} fill="#B9B4AC" />
        <rect y={1350} width={1080} height={20} fill="#D1CCC4" />
      </svg>
      {children}
      {/* comprador en la bici */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${x} 1150)`}>
          {[-130, 130].map((cx) => (
            <g key={cx} transform={`translate(${cx} 230) rotate(${rueda})`}>
              <circle r={95} fill="none" stroke={COL.linea} strokeWidth={14} />
              {[0, 1, 2, 3].map((i) => <line key={i} x1={-90} y1={0} x2={90} y2={0} stroke="#8C8781" strokeWidth={4} transform={`rotate(${i * 45})`} />)}
            </g>
          ))}
          <path d="M -130 230 L -40 100 L 90 100 L 130 230 M -40 100 L 10 230 L 90 100 M 10 230 L -130 230" fill="none" stroke="#E5484D" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
          {/* ciclista: gorra, camiseta verde */}
          <path d="M -50 60 L 0 -150 L 60 -150 L 40 40 Z" fill="#3DA35D" {...L} />
          <circle cx={30} cy={-210} r={60} fill="#B98060" {...L} />
          <path d="M -30 -230 Q 30 -300 90 -230 L 130 -224 L 90 -210 Z" fill="#3B8BEB" {...L} />
          <circle cx={50} cy={-210} r={7} fill={COL.linea} />
          <path d="M 40 -180 Q 60 -168 76 -184" fill="none" {...L} strokeWidth={5} />
          <path d="M 40 -120 L 120 -40 L 100 90" fill="none" stroke="#B98060" strokeWidth={22} strokeLinecap="round" />
          <path d="M 0 40 L 10 230" stroke="#3A4A6A" strokeWidth={30} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────── chat con Brayan ───────────── */

export type Mensaje = { de: "brayan" | "tono"; texto: string; t0: number; foto?: string };
/** Chat con el primo Brayan; los mensajes entran uno a uno. */
export const ChatBrayan: React.FC<{ t: number; mensajes: Mensaje[]; sello?: { texto: string; t0: number } }> = ({ t, mensajes, sello }) => {
  const g = sello ? clamp01((t - sello.t0) / 0.14) : 0;
  return (
    <div style={{ position: "absolute", left: 190, top: 270, width: 700, height: 1110, borderRadius: 80, background: "#16171B", border: `8px solid ${COL.linea}`, padding: 24, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 56, background: "#ECE5DD", overflow: "hidden", fontFamily: '"Helvetica Neue", Arial, sans-serif', position: "relative" }}>
        <div style={{ background: "#1F8F6B", color: "#fff", padding: "46px 26px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile("glowup/dia1/brayan.png")} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover", border: "3px solid #fff", background: "#fff" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 40 }}>Primo Brayan</div>
            <div style={{ fontSize: 24, opacity: 0.85 }}>en línea</div>
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {mensajes.map((m, i) => {
            const k = sp(t, m.t0, POP);
            const yo = m.de === "tono";
            return t < m.t0 - 0.05 ? null : (
              <div key={i} style={{ alignSelf: yo ? "flex-end" : "flex-start", maxWidth: 480, background: yo ? "#D9FDD3" : "#fff", borderRadius: 24, padding: "16px 22px", fontSize: 40, fontWeight: 700, color: "#222", boxShadow: "0 2px 4px rgba(0,0,0,0.12)", scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2), transformOrigin: yo ? "100% 50%" : "0% 50%" }}>
                {m.foto ? <Img src={staticFile(m.foto)} style={{ width: 400, height: 440, objectFit: "cover", borderRadius: 16, display: "block", marginBottom: m.texto ? 10 : 0 }} /> : null}
                {m.texto}
              </div>
            );
          })}
        </div>
        {sello && t >= sello.t0 ? (
          <div style={{ position: "absolute", left: 90, top: 700, rotate: "-12deg", scale: String(lerp(2.4, 1, easeOut(g))), opacity: g, border: "10px solid #E5484D", borderRadius: 16, padding: "4px 22px", fontFamily: GTA, fontSize: 92, color: "#E5484D", background: "rgba(255,255,255,0.85)" }}>{sello.texto}</div>
        ) : null}
      </div>
    </div>
  );
};

/* ───────────── anuncio de Brayan ───────────── */

/** El anuncio de Brayan revendiendo la consola en $60, con el precio que golpea. */
export const AnuncioBrayan: React.FC<{ t: number; t0: number; tPrecio: number; foto?: string }> = ({ t, t0, tPrecio, foto }) => {
  const k = sp(t, t0, POP);
  const p = sp(t, tPrecio, POP);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #7A4BC2 0%, #2B1A4F 90%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 18 }, (_, i) => {
          const v = (t * 0.4 + rnd(i)) % 1;
          return <text key={i} x={rnd(i + 4) * 1080} y={v * 2000 - 40} fontFamily={GTA} fontSize={70} fill="#72D15E" opacity={0.35}>$</text>;
        })}
      </svg>
      <div style={{ position: "absolute", left: 140, top: 300, width: 800, scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2), background: "#fff", borderRadius: 40, border: `8px solid ${COL.linea}`, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", fontFamily: SUBS }}>
        <div style={{ background: "#F7C948", padding: "18px 30px", fontFamily: FUENTE, fontSize: 40, color: COL.linea, borderBottom: `5px solid ${COL.linea}`, display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("glowup/dia1/brayan.png")} style={{ width: 70, height: 70, borderRadius: 35, objectFit: "cover", border: `3px solid ${COL.linea}`, background: "#fff" }} />
          Brayan vende
        </div>
        <div style={{ height: 400, background: "#E7ECEF", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {foto ? <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Dibujo que="consola" tam={360} />}
          <div style={{ position: "absolute", right: 24, top: 24, background: "#E5484D", color: "#fff", fontWeight: 900, fontSize: 30, padding: "8px 18px", borderRadius: 14, border: `4px solid ${COL.linea}` }}>RETRO ✨</div>
        </div>
        <div style={{ padding: "18px 30px 26px" }}>
          <div style={{ fontWeight: 900, fontSize: 42, color: "#222" }}>Consola retro de colección</div>
          <div style={{ fontWeight: 600, fontSize: 30, color: "#666" }}>Joya, como nueva. Envío hoy.</div>
          <div style={{ fontFamily: GTA, fontSize: 170, lineHeight: 1, color: "#1E9E57", scale: String(lerp(0.2, 1, p)), opacity: clamp01(p * 2), transformOrigin: "0% 50%", ...contorno(8) }}>$60</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── lavandería con la lavadora de la mamá ───────────── */

export const Lavanderia: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#CFE6E0" />
      {Array.from({ length: 14 }, (_, f) =>
        Array.from({ length: 9 }, (_, c) => <rect key={`${f}-${c}`} x={c * 124} y={f * 100} width={122} height={98} fill={(f + c) % 2 ? "#C3DED7" : "#D6EBE5"} />),
      )}
      {/* tendedero con ropa que se mece */}
      <line x1={0} y1={380} x2={1080} y2={420} stroke="#6E767E" strokeWidth={5} />
      {[["#E5484D", 120], ["#F7C948", 330], ["#3B8BEB", 760], ["#E77BA2", 930]].map(([c, x], i) => (
        <g key={i} transform={`rotate(${Math.sin(t * 2 + i) * 4} ${x} 400)`}>
          <path d={`M ${Number(x) - 60} 400 L ${Number(x) + 60} 404 L ${Number(x) + 50} 560 L ${Number(x) - 50} 556 Z`} fill={String(c)} {...L} strokeWidth={5} />
        </g>
      ))}
      {/* la lavadora de la mamá, grande, a la derecha */}
      <rect x={700} y={900} width={340} height={420} rx={24} fill="#F2F0EA" {...L} />
      <rect x={700} y={900} width={340} height={80} rx={20} fill="#E1DED5" {...L} strokeWidth={5} />
      <circle cx={870} cy={1150} r={110} fill="#C9D3DA" {...L} />
      <circle cx={870} cy={1150} r={80} fill={`hsl(200 35% ${58 + Math.sin(t * 6) * 6}%)`} stroke="#8E9AA3" strokeWidth={8} />
      <circle cx={980} cy={940} r={16} fill="#9AA3AA" {...L} strokeWidth={4} />
      <rect x={730} y={920} width={150} height={40} rx={10} fill="#fff" {...L} strokeWidth={3} />
      <text x={805} y={950} textAnchor="middle" fontFamily={FUENTE} fontSize={26} fill={COL.rojo}>DE MAMÁ ♥</text>
      {/* suelo */}
      <rect y={1320} width={1080} height={600} fill="#9FB7B0" />
      <rect y={1310} width={1080} height={20} fill="#7E9891" />
      <rect x={60} y={1230} width={200} height={110} rx={16} fill="#E9D9B5" {...L} />
    </svg>
    {children}
  </AbsoluteFill>
);

/** La chancla que vuela y le da a Toño en la cabeza (golpe + estrellitas). */
export const ChanclaVuela: React.FC<{ t: number; t0: number; x?: number; y?: number }> = ({ t, t0, x = 540, y = 560 }) => {
  const v = clamp01((t - t0) / 0.35);
  if (t < t0 || t > t0 + 1.4) return null;
  const cx = lerp(1150, x, v);
  const cy = lerp(700, y, v) - Math.sin(v * Math.PI) * 160;
  const golpe = t >= t0 + 0.35;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${golpe ? x + 40 : cx} ${golpe ? y + (t - t0 - 0.35) * 600 : cy}) rotate(${v * 720})`}>
        <path d="M -90 -10 Q -90 -40 -50 -42 L 70 -38 Q 110 -34 110 0 Q 110 34 70 38 L -50 42 Q -90 40 -90 10 Z" fill="#3B8BEB" {...L} />
        <path d="M -30 -40 Q 0 0 40 -38" fill="none" stroke="#F2F2F2" strokeWidth={14} strokeLinecap="round" />
      </g>
      {golpe
        ? [0, 1, 2].map((i) => {
            const a = (t - t0) * 6 + (i * Math.PI * 2) / 3;
            return <text key={i} x={x + Math.cos(a) * 120} y={y - 80 + Math.sin(a) * 30} textAnchor="middle" fontSize={56}>⭐</text>;
          })
        : null}
    </svg>
  );
};

/* ───────────── Brayan presumiendo ───────────── */

export const BrayanPresume: React.FC<{ t: number; t0: number; children?: React.ReactNode }> = ({ t, t0, children }) => {
  const k = sp(t, t0, POP);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #2F9E6E 0%, #123D2C 90%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }, (_, i) => {
          const v = ((t - t0) * (0.35 + rnd(i) * 0.3) + rnd(i + 2)) % 1;
          const x = rnd(i + 7) * 1080;
          return (
            <g key={i} transform={`translate(${x + Math.sin(t * 2 + i) * 40} ${v * 2000 - 80}) rotate(${Math.sin(t * 3 + i) * 40})`}>
              <rect x={-60} y={-30} width={120} height={60} rx={6} fill="#85C46B" stroke="#1E5A2B" strokeWidth={4} />
              <circle r={16} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={3} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 240, top: 330, width: 600, height: 600, borderRadius: 300, overflow: "hidden", border: `12px solid ${COL.linea}`, background: "#fff", scale: String(lerp(0.3, 1, k)), boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile("glowup/dia1/brayan.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: GTA, fontSize: 170, color: "#72D15E", ...contorno(10), scale: String(lerp(0.2, 1, sp(t, t0 + 0.4, POP))) }}>+$50</div>
      {children}
    </AbsoluteFill>
  );
};

/* ───────────── íconos de la votación ───────────── */

/** Gurú: lentes oscuros, sonrisa y fajo de billetes. */
export const IconoGuru: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <circle cx={50} cy={42} r={26} fill="#E0A77F" stroke={COL.linea} strokeWidth={4} />
    <path d="M 24 36 Q 50 6 76 36 Q 62 24 50 26 Q 38 24 24 36 Z" fill="#2A2426" stroke={COL.linea} strokeWidth={3} />
    <rect x={28} y={36} width={19} height={11} rx={4} fill="#1C1A1A" />
    <rect x={53} y={36} width={19} height={11} rx={4} fill="#1C1A1A" />
    <line x1={47} y1={40} x2={53} y2={40} stroke={COL.linea} strokeWidth={3} />
    <path d="M 38 56 Q 50 66 62 56" fill="#fff" stroke={COL.linea} strokeWidth={3} />
    <path d="M 22 96 Q 24 72 50 70 Q 76 72 78 96 Z" fill="#1C1A1A" />
    <rect x={56} y={74} width={34} height={18} rx={3} fill="#85C46B" stroke="#1E5A2B" strokeWidth={3} transform="rotate(-15 73 83)" />
    <rect x={10} y={76} width={34} height={18} rx={3} fill="#85C46B" stroke="#1E5A2B" strokeWidth={3} transform="rotate(12 27 85)" />
  </svg>
);
/** Aprender gratis: botón de reproducir genérico y un birrete. */
export const IconoVideoGratis: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <rect x={10} y={30} width={80} height={56} rx={16} fill="#E5484D" stroke={COL.linea} strokeWidth={4} />
    <path d="M 42 44 L 64 58 L 42 72 Z" fill="#fff" stroke={COL.linea} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 50 6 L 86 18 L 50 30 L 14 18 Z" fill="#1C1A1A" stroke={COL.linea} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 80 20 L 80 32" stroke="#F7C948" strokeWidth={4} strokeLinecap="round" />
  </svg>
);

/** Cabeza de Toño asomando por abajo para reaccionar sobre otra escena. */
export const TonoAsoma: React.FC<{ t: number; t0: number; expresion: Expresion; x?: number; ancho?: number; mirada?: number }> = ({ t, t0, expresion, x = 60, ancho = 360, mirada = 0 }) => {
  const k = sp(t, t0, POP);
  return (
    <div style={{ position: "absolute", left: x, top: 1920 - ancho * 1.1 * k + 40, rotate: `${Math.sin(t * 3) * 3}deg` }}>
      <Tono soloCabeza ancho={ancho} expresion={expresion} mirada={mirada} t={t} />
    </div>
  );
};
