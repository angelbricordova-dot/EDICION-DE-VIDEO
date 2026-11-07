import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, easeIn, easeOut, lerp, POP, sp } from "../comun/animacion";
import { COL, FUENTE, GTA, plata, rnd, SUBS } from "./piezas";
import { Mano } from "./Tono";
import { Dibujo } from "./escenas3";

// Día 3 v2 (correcciones de Angel): más planos y escenarios dentro del mismo entorno. Cámara con
// cortes de plano, otro lado del garaje (estantes y banco de trabajo), caja de la que salen cosas,
// chaqueta en sus manos, bolsillo en primer plano, fotos con flash, portón del garaje con el niño,
// anuncio grande de la lavadora y chancla con fuerza.

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* ───────────── cámara: planos con corte seco y un pequeño empuje ───────────── */

export type Plano = { t: number; s: number; x: number; y: number };
/** Encuadra la escena: en cada plano (desde `t`) amplía `s` veces centrando el punto (x, y).
 *  Corte seco entre planos con un empuje rápido (zoom de 6 % que se asienta en 0,35 s). */
export const Camara: React.FC<{ t: number; planos: Plano[]; children: React.ReactNode; temblor?: number }> = ({ t, planos, children, temblor = 0 }) => {
  const p = [...planos].reverse().find((z) => t >= z.t) ?? planos[0];
  const empuje = lerp(1.06, 1, easeOut(clamp01((t - p.t) / 0.35)));
  const s = p.s * empuje;
  // trasladar para que (x, y) quede en el centro y no se vean bordes
  const tx = Math.min(0, Math.max(1080 - 1080 * s, 540 - p.x * s));
  const ty = Math.min(0, Math.max(1920 - 1920 * s, 960 - p.y * s));
  const dx = temblor ? Math.sin(t * 61) * temblor : 0;
  const dy = temblor ? Math.cos(t * 47) * temblor : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx + dx}px, ${ty + dy}px) scale(${s})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── el otro lado del garaje ───────────── */

/** Pared de herramientas del garaje: tablero perforado, estantes metálicos con cajas y pintura,
 *  banco de trabajo y ventanita con luz. La bici vieja cuelga de la pared (si `bici`). */
export const GarajeEstantes: React.FC<{ t: number; bici?: boolean }> = ({ t, bici = true }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="luzVentana" cx="0.75" cy="0.12" r="0.8">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1300} fill="#9C8A72" />
      {Array.from({ length: 17 }, (_, f) => (
        <rect key={f} x={0} y={f * 78} width={1080} height={4} fill="#8C7B64" />
      ))}
      {/* ventanita con luz */}
      <rect x={720} y={120} width={260} height={180} fill="#BFE3F5" {...L} />
      <path d="M 850 120 L 850 300 M 720 210 L 980 210" stroke={COL.linea} strokeWidth={6} />
      <path d="M 740 140 L 800 140 L 760 190 Z" fill="#fff" opacity={0.6} />
      {/* tablero perforado con herramientas */}
      <rect x={60} y={140} width={560} height={420} fill="#C9A673" {...L} />
      {Array.from({ length: 9 }, (_, f) => Array.from({ length: 13 }, (_, c) => <circle key={`${f}-${c}`} cx={90 + c * 42} cy={170 + f * 44} r={4} fill="#A88655" />))}
      <g transform="rotate(-20 160 300)">
        <rect x={150} y={220} width={22} height={150} rx={8} fill="#B5523B" {...L} strokeWidth={4} />
        <rect x={120} y={200} width={80} height={40} rx={6} fill="#8C8781" {...L} strokeWidth={4} />
      </g>
      <path d="M 260 210 L 260 380 M 240 210 L 280 210" stroke="#55606A" strokeWidth={14} strokeLinecap="round" />
      <path d="M 340 220 Q 330 300 360 380 L 380 380 Q 352 300 362 220 Z" fill="#E5484D" {...L} strokeWidth={4} />
      <circle cx={470} cy={290} r={60} fill="none" stroke="#F7C948" strokeWidth={18} />
      <circle cx={470} cy={290} r={60} fill="none" stroke={COL.linea} strokeWidth={4} />
      <rect x={530} y={420} width={60} height={110} rx={8} fill="#3B8BEB" {...L} strokeWidth={4} />
      {/* estante metálico con cajas y botes de pintura */}
      <rect x={60} y={640} width={560} height={14} fill="#7E8892" {...L} strokeWidth={4} />
      <rect x={60} y={860} width={560} height={14} fill="#7E8892" {...L} strokeWidth={4} />
      <rect x={60} y={560} width={14} height={600} fill="#7E8892" {...L} strokeWidth={4} />
      <rect x={606} y={560} width={14} height={600} fill="#7E8892" {...L} strokeWidth={4} />
      {[[90, 740, 130, 120, "#C99A5B", "XBOX?"], [240, 770, 110, 90, "#D9B26F", "CABLES"], [370, 720, 150, 140, "#B58548", "TOÑO NIÑO"]].map(([x, y, w, h, c, txt], i) => (
        <g key={i}>
          <rect x={Number(x)} y={Number(y) - Number(h) + 120} width={Number(w)} height={Number(h)} fill={String(c)} {...L} />
          <text x={Number(x) + Number(w) / 2} y={Number(y) + 70} textAnchor="middle" fontFamily={FUENTE} fontSize={22} fill="#7A4A2A">{txt}</text>
        </g>
      ))}
      {[100, 190, 280, 420, 520].map((x, i) => (
        <g key={i}>
          <rect x={x} y={950} width={70} height={90} rx={8} fill="#D9D3C4" {...L} strokeWidth={4} />
          <rect x={x} y={975} width={70} height={30} fill={["#E5484D", "#3B8BEB", "#3DDC84", "#F7C948", "#B88FB0"][i]} />
          <path d={`M ${x + 5} 950 Q ${x + 35} 930 ${x + 65} 950`} fill="none" stroke={COL.linea} strokeWidth={4} />
        </g>
      ))}
      {/* bici vieja colgada de la pared */}
      {bici ? (
        <g transform="translate(830 640) scale(2.6)">
          <Bici />
        </g>
      ) : null}
      {/* suelo y banco de trabajo */}
      <rect y={1290} width={1080} height={630} fill="#8C8781" />
      <rect y={1282} width={1080} height={20} fill="#6E6A65" />
      <rect x={640} y={1090} width={440} height={36} fill="#8A5A3B" {...L} />
      <rect x={670} y={1126} width={30} height={200} fill="#6E4E37" {...L} strokeWidth={4} />
      <rect x={1020} y={1126} width={30} height={200} fill="#6E4E37" {...L} strokeWidth={4} />
      <rect width={1080} height={1920} fill="url(#luzVentana)" />
      {/* motas de polvo en la luz */}
      {Array.from({ length: 24 }, (_, i) => {
        const v = (t * 0.08 + rnd(i)) % 1;
        return <circle key={`m${i}`} cx={600 + rnd(i + 3) * 460 + Math.sin(t + i) * 20} cy={200 + v * 900} r={3 + rnd(i + 6) * 4} fill="#FFF3C4" opacity={0.6 * Math.sin(v * Math.PI)} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Bici vieja de lado (caja ≈ −100..100 × −60..60), sin ciclista. */
export const Bici: React.FC<{ giro?: number }> = ({ giro = 0 }) => (
  <g>
    {[-60, 60].map((cx) => (
      <g key={cx} transform={`translate(${cx} 30) rotate(${giro})`}>
        <circle r={42} fill="none" stroke={COL.linea} strokeWidth={8} />
        <circle r={42} fill="none" stroke="#3A3A3A" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-38} y1={0} x2={38} y2={0} stroke="#9AA3AA" strokeWidth={2} transform={`rotate(${i * 45})`} />)}
        <circle r={6} fill="#9AA3AA" stroke={COL.linea} strokeWidth={2} />
      </g>
    ))}
    <path d="M -60 30 L -18 -26 L 40 -26 L 60 30 M -18 -26 L 4 30 L 40 -26 M 4 30 L -60 30" fill="none" stroke={COL.linea} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M -60 30 L -18 -26 L 40 -26 L 60 30 M -18 -26 L 4 30 L 40 -26 M 4 30 L -60 30" fill="none" stroke="#E5484D" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M -24 -38 L -2 -38" stroke={COL.linea} strokeWidth={9} strokeLinecap="round" />
    <path d="M 40 -26 L 34 -50 L 52 -54" fill="none" stroke={COL.linea} strokeWidth={6} strokeLinecap="round" />
    <circle cx={10} cy={18} r={4} fill="#C26A3E" />
    <circle cx={-40} cy={10} r={3} fill="#C26A3E" />
  </g>
);

/** Caja grande abierta delante de Toño (lo tapa del pecho para abajo) de la que salen cosas volando. */
export const CajaBusca: React.FC<{ t: number; t0: number; x?: number; y?: number; etiqueta?: string }> = ({ t, t0, x = 540, y = 1180, etiqueta = "COSAS VIEJAS" }) => {
  const objetos = ["🧸", "📼", "🔌", "🧦", "🎮", "📻", "🦆", "🧩"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {objetos.map((o, i) => {
        const ciclo = 0.55;
        const k = (t - t0 - i * 0.28) / ciclo;
        if (k < 0 || k > 1.6) return null;
        const v = clamp01(k / 1.6);
        const lado = i % 2 ? 1 : -1;
        const ox = x + lado * (60 + v * (260 + rnd(i) * 160));
        const oy = y - 40 - Math.sin(v * Math.PI) * (420 + rnd(i + 3) * 200) + v * 380;
        return (
          <text key={i} x={ox} y={oy} fontSize={110} textAnchor="middle" transform={`rotate(${v * lado * 360} ${ox} ${oy})`}>
            {o}
          </text>
        );
      })}
      <g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 18) * (t > t0 ? 1.2 : 0)})`}>
        <path d="M -330 -60 L -420 -170 L -230 -150 Z" fill="#B58548" {...L} />
        <path d="M 330 -60 L 420 -170 L 230 -150 Z" fill="#B58548" {...L} />
        <rect x={-330} y={-60} width={660} height={520} fill="#C99A5B" {...L} />
        <rect x={-330} y={-60} width={660} height={40} fill="#B58548" {...L} strokeWidth={5} />
        <rect x={-120} y={-20} width={240} height={60} fill="#D9B26F" stroke="#9B7A45" strokeWidth={4} />
        <text x={0} y={140} textAnchor="middle" fontFamily={FUENTE} fontSize={60} fill="#7A4A2A">{etiqueta}</text>
        <path d="M -300 260 L 300 260" stroke="#B58548" strokeWidth={6} />
      </g>
    </svg>
  );
};

/* ───────────── chaqueta en las manos y bolsillo ───────────── */

/** Chaqueta de mezclilla sostenida por los hombros delante de Toño (mismas coordenadas que el
 *  Toño de la pose "sostiene": caja 600 × 1300). Va encima de él y dibuja sus manos encima. */
export const ChaquetaEnManos: React.FC<{ left: number; top: number; ancho: number; t: number }> = ({ left, top, ancho, t }) => {
  const mece = Math.sin(t * 3) * 4;
  return (
    <svg width={ancho} height={ancho * (1300 / 600)} viewBox="0 0 600 1300" style={{ position: "absolute", left, top, overflow: "visible" }}>
      <g transform={`rotate(${mece * 0.3} 300 560)`}>
        <path d="M 200 560 L 270 548 L 300 600 L 330 548 L 400 560 L 470 760 L 420 780 L 404 700 L 410 1060 L 190 1060 L 196 700 L 180 780 L 130 760 Z" fill="#4D74A8" {...L} />
        <path d="M 270 548 L 300 600 L 330 548 L 326 600 L 300 660 L 274 600 Z" fill="#3B5D8C" {...L} strokeWidth={5} />
        <line x1={300} y1={660} x2={300} y2={1060} stroke={COL.linea} strokeWidth={5} />
        {[720, 800, 880, 960].map((y) => <circle key={y} cx={316} cy={y} r={8} fill="#C9A35B" {...L} strokeWidth={3} />)}
        <path d="M 330 780 L 400 780 L 400 850 Q 365 870 330 850 Z" fill="#4D74A8" {...L} strokeWidth={5} />
        <path d="M 200 780 L 270 780 L 270 850 Q 235 870 200 850 Z" fill="#4D74A8" {...L} strokeWidth={5} />
        <path d="M 196 1020 L 404 1020" stroke="#3B5D8C" strokeWidth={8} />
        <path d="M 220 700 Q 230 760 222 820 M 380 700 Q 372 760 380 820" fill="none" stroke="#3B5D8C" strokeWidth={4} />
        {/* parches de viejo */}
        <rect x={210} y={900} width={50} height={40} fill="#6E8FBD" {...L} strokeWidth={3} transform="rotate(-8 235 920)" />
      </g>
      <Mano x={214} y={566} giro={150} />
      <Mano x={386} y={566} giro={-150} espejo />
    </svg>
  );
};

/** Primer plano del bolsillo: la mano de Toño mete los dedos y saca el billete de $10. */
export const BolsilloPrimerPlano: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const baja = easeOut(clamp01((t - t0) / 0.3));
  const sube = easeOut(clamp01((t - t0 - 0.5) / 0.5));
  const manoY = lerp(-400, 640, baja) - sube * 520;
  const billeteY = manoY + 230;
  return (
    <AbsoluteFill style={{ background: "#3F6290" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 60 }, (_, i) => <line key={i} x1={-200 + i * 40} y1={0} x2={i * 40 + 400} y2={1920} stroke="#47699A" strokeWidth={10} />)}
        {/* billete y mano (detrás del frente del bolsillo mientras están dentro) */}
        <g transform={`translate(560 ${billeteY}) rotate(${-6 + sube * 10})`} opacity={sube > 0 ? 1 : 0}>
          <rect x={-190} y={-90} width={380} height={180} rx={14} fill="#85C46B" stroke="#1E5A2B" strokeWidth={8} />
          <rect x={-164} y={-66} width={328} height={132} rx={10} fill="none" stroke="#1E5A2B" strokeWidth={4} />
          <circle r={50} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily="Arial Black" fontSize={64} fill="#1E5A2B">10</text>
        </g>
        <g transform={`translate(580 ${manoY}) scale(4.2)`}>
          <Mano x={0} y={0} />
        </g>
        {/* frente del bolsillo con costuras doradas */}
        <path d="M 120 820 L 960 820 L 960 1520 Q 540 1640 120 1520 Z" fill="#4D74A8" {...L} strokeWidth={10} />
        <path d="M 120 830 L 960 830" stroke="#2F4C7E" strokeWidth={14} />
        <path d="M 150 860 L 930 860 M 150 1490 Q 540 1600 930 1490" fill="none" stroke="#C9A35B" strokeWidth={6} strokeDasharray="22 16" />
        <path d="M 200 1000 Q 300 1040 280 1180 M 820 980 Q 760 1080 800 1220" fill="none" stroke="#3B5D8C" strokeWidth={6} />
        {sube > 0.4
          ? [0, 1, 2, 3, 4].map((i) => {
              const v = ((t - t0) * 1.4 + i / 5) % 1;
              return <path key={i} d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#FFF7B0" transform={`translate(${220 + i * 160} ${250 + (i % 2) * 260}) scale(${Math.sin(v * Math.PI) * 1.4})`} />;
            })
          : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────── fotos con el teléfono ───────────── */

/** Teléfono en las manos de Toño (pose "telefono") visto por detrás, con el flash. */
export const TelefonoEnManos: React.FC<{ left: number; top: number; ancho: number; t: number; flashes: number[] }> = ({ left, top, ancho, t, flashes }) => {
  const flash = flashes.some((f) => t >= f && t < f + 0.12);
  return (
    <>
      <svg width={ancho} height={ancho * (1300 / 600)} viewBox="0 0 600 1300" style={{ position: "absolute", left, top, overflow: "visible" }}>
        <rect x={236} y={520} width={128} height={230} rx={20} fill="#2E3440" {...L} />
        <rect x={252} y={536} width={50} height={50} rx={12} fill="#1C1F26" stroke="#555" strokeWidth={3} />
        <circle cx={277} cy={561} r={14} fill="#4D6A8C" stroke="#222" strokeWidth={3} />
        <circle cx={330} cy={552} r={7} fill={flash ? "#FFFFFF" : "#F7E7A8"} />
        <Mano x={248} y={640} giro={-30} />
        <Mano x={352} y={640} giro={30} espejo />
      </svg>
      {flash ? <AbsoluteFill style={{ background: "rgba(255,255,255,0.85)" }} /> : null}
    </>
  );
};

/* ───────────── portón del garaje: el niño compra la bici ───────────── */

/** Fachada con el portón del garaje subido (se ve el garaje por dentro), entrada de cemento,
 *  arbusto y cielo. Los personajes y la bici van como hijos. */
export const PortonGaraje: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#8FCBF0" />
      {[[160, 180], [700, 120]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x + Math.sin(t * 0.3 + i) * 30} ${y})`} fill="#fff">
          <ellipse cx={0} cy={0} rx={90} ry={40} />
          <ellipse cx={60} cy={-20} rx={70} ry={45} />
          <ellipse cx={120} cy={5} rx={70} ry={35} />
        </g>
      ))}
      {/* fachada de la casa: bloques pintados, techo y canaleta */}
      <path d="M -40 470 L 540 290 L 1120 470 Z" fill="#8E3B2E" {...L} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 140} y1={470 - (i < 5 ? i : 8 - i) * 45} x2={-40 + i * 140} y2={470} stroke="#7A3226" strokeWidth={4} />)}
      <rect x={0} y={460} width={1080} height={940} fill="#E9D3A7" {...L} />
      <rect x={0} y={460} width={1080} height={26} fill="#C9B184" {...L} strokeWidth={4} />
      {Array.from({ length: 11 }, (_, f) => Array.from({ length: 6 }, (_, c) => (
        <rect key={`${f}-${c}`} x={c * 200 - (f % 2 ? 100 : 0)} y={490 + f * 84} width={196} height={80} fill="none" stroke="#DCC394" strokeWidth={3} />
      )))}
      {/* portón subido y el garaje por dentro, en penumbra */}
      <rect x={80} y={640} width={920} height={760} fill="#4A443E" {...L} />
      <rect x={100} y={660} width={880} height={740} fill="#5C554D" />
      <rect x={130} y={760} width={300} height={14} fill="#7E8892" />
      <rect x={150} y={690} width={90} height={70} fill="#C99A5B" {...L} strokeWidth={4} />
      <rect x={250} y={700} width={70} height={60} fill="#B58548" {...L} strokeWidth={4} />
      <rect x={730} y={720} width={200} height={260} fill="#6E6A65" {...L} strokeWidth={4} />
      <circle cx={830} cy={860} r={60} fill="#8C969E" {...L} strokeWidth={4} />
      <rect x={80} y={600} width={920} height={70} fill="#9AA6B0" {...L} />
      {Array.from({ length: 3 }, (_, i) => <line key={i} x1={90} y1={615 + i * 20} x2={990} y2={615 + i * 20} stroke="#7E8892" strokeWidth={4} />)}
      <rect x={100} y={660} width={880} height={740} fill="url(#sombraPorton)" />
      <defs>
        <linearGradient id="sombraPorton" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* lámpara y número de la casa */}
      <rect x={1010} y={700} width={40} height={60} rx={8} fill="#F7E7A8" {...L} strokeWidth={4} />
      <rect x={20} y={560} width={56} height={44} rx={6} fill="#fff" {...L} strokeWidth={4} />
      <text x={48} y={592} textAnchor="middle" fontFamily={FUENTE} fontSize={28} fill={COL.linea}>15</text>
      {/* entrada de cemento con juntas y arbustos */}
      <path d="M 80 1400 L 1000 1400 L 1080 1920 L 0 1920 Z" fill="#B9B4AC" />
      <path d="M 40 1660 L 1040 1660 M 540 1400 L 540 1920" stroke="#A29C93" strokeWidth={5} />
      <rect y={1392} width={1080} height={16} fill="#9C968D" />
      {[[30, 1400], [1050, 1400]].map(([x, y], i) => (
        <g key={i}>
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + (k - 1.5) * 40} cy={y - 40 - (k % 2) * 30} r={60} fill={k % 2 ? "#3E8E5A" : "#2F7A4A"} {...L} strokeWidth={4} />)}
        </g>
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);

/* ───────────── anuncio grande de la lavadora ───────────── */

/** Teléfono con UN anuncio que ocupa toda la pantalla (foco en el producto y el precio). */
export const AnuncioGrande: React.FC<{ t: number; t0: number; que: "lavadora"; nombre: string; precio: number }> = ({ t, t0, que, nombre, precio }) => {
  const k = sp(t, t0, POP);
  const p = sp(t, t0 + 0.35, POP);
  return (
    <div style={{ position: "absolute", left: 140, top: 250, width: 800, height: 1150, borderRadius: 86, background: "#16171B", border: `8px solid ${COL.linea}`, padding: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", scale: String(lerp(0.85, 1, k)) }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 60, background: "#fff", overflow: "hidden", fontFamily: SUBS, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#F7C948", padding: "40px 30px 18px", display: "flex", alignItems: "center", gap: 14, borderBottom: `5px solid ${COL.linea}` }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: COL.linea, color: "#F7C948", fontFamily: FUENTE, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>M</div>
          <div style={{ fontFamily: FUENTE, fontSize: 40, color: COL.linea }}>MERCADITO</div>
          <div style={{ marginLeft: "auto", background: COL.rojo, color: "#fff", fontWeight: 900, fontSize: 26, padding: "6px 16px", borderRadius: 12, border: `3px solid ${COL.linea}` }}>NUEVO</div>
        </div>
        <div style={{ flex: 1, background: "linear-gradient(#EAF2F6, #D5E3EA)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ scale: String(lerp(0.5, 1, k)) }}>
            <Dibujo que={que} tam={560} />
          </div>
        </div>
        <div style={{ padding: "18px 34px 30px", borderTop: `4px solid #E3E6EA` }}>
          <div style={{ fontFamily: GTA, fontSize: 150, lineHeight: 1, color: "#1E9E57", scale: String(lerp(0.3, 1, p)), opacity: clamp01(p * 2), transformOrigin: "0% 50%", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>{plata(precio)}</div>
          <div style={{ fontWeight: 900, fontSize: 46, color: "#222" }}>{nombre}</div>
          <div style={{ fontWeight: 600, fontSize: 30, color: "#888" }}>Publicado hace 1 min · Toño</div>
        </div>
      </div>
    </div>
  );
};

/* ───────────── chancla con fuerza ───────────── */

/** La chancla entra desde fuera de cuadro a toda velocidad (estela y líneas de velocidad), golpea
 *  la cabeza (destello, POW y estrellitas) y rebota. Sin la mamá en cuadro. */
export const ChanclaFuerte: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const vuelo = 0.22;
  if (t < t0 - 0.05 || t > t0 + 1.6) return null;
  const v = clamp01((t - t0) / vuelo);
  const golpe = t >= t0 + vuelo;
  const tg = t - t0 - vuelo;
  const cx = golpe ? x + 60 + tg * 500 : lerp(1300, x + 40, easeIn(v));
  const cy = golpe ? y - 120 * Math.sin(Math.min(1, tg / 0.5) * Math.PI) + Math.max(0, tg - 0.5) * 900 : lerp(380, y, easeIn(v));
  const giro = golpe ? 30 + tg * 900 : -20;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {!golpe
        ? Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={cx + 90 + i * 30} y1={cy - 60 + i * 20} x2={cx + 400 + i * 60} y2={cy - 140 + i * 16} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          ))
        : null}
      {!golpe ? <path d={`M ${cx + 60} ${cy} L 1200 ${380 + (cy - 380) * 0.4}`} stroke="#3B8BEB" strokeWidth={60} strokeLinecap="round" opacity={0.25} /> : null}
      <g transform={`translate(${cx} ${cy}) rotate(${giro}) scale(1.5)`}>
        <path d="M -90 -10 Q -90 -40 -50 -42 L 70 -38 Q 110 -34 110 0 Q 110 34 70 38 L -50 42 Q -90 40 -90 10 Z" fill="#3B8BEB" {...L} />
        <path d="M -82 -6 Q -82 -30 -50 -32 L 66 -28 Q 100 -26 100 0" fill="none" stroke="#6FB2F0" strokeWidth={6} />
        <path d="M -30 -40 Q 0 0 40 -38" fill="none" stroke="#F2F2F2" strokeWidth={14} strokeLinecap="round" />
      </g>
      {golpe && tg < 0.18 ? <circle cx={x} cy={y} r={60 + tg * 900} fill="#FFFDE0" opacity={1 - tg / 0.18} /> : null}
      {golpe && tg < 0.7 ? (
        <g transform={`translate(${x + 230} ${y - 170}) rotate(-12) scale(${easeOut(clamp01(tg / 0.12))})`}>
          <path d="M 0 -110 L 30 -40 L 110 -60 L 60 0 L 120 60 L 40 50 L 20 120 L -20 50 L -100 80 L -60 10 L -120 -50 L -40 -40 Z" fill="#F7C948" {...L} />
          <text x={0} y={22} textAnchor="middle" fontFamily={GTA} fontSize={70} fill="#E5484D" stroke={COL.linea} strokeWidth={3}>¡PUM!</text>
        </g>
      ) : null}
      {golpe
        ? [0, 1, 2, 3].map((i) => {
            const a = tg * 7 + (i * Math.PI) / 2;
            return <text key={i} x={x + Math.cos(a) * 150} y={y - 60 + Math.sin(a) * 40} textAnchor="middle" fontSize={64}>⭐</text>;
          })
        : null}
    </svg>
  );
};

/* ───────────── chat con foto ───────────── */

/** Foto que Toño manda por el chat (la consola). */
export const FotoChat: React.FC<{ src: string }> = ({ src }) => (
  <div style={{ background: "#D9FDD3", borderRadius: 24, padding: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.12)" }}>
    <Img src={staticFile(src)} style={{ width: 380, height: 430, objectFit: "cover", borderRadius: 16, display: "block" }} />
  </div>
);
