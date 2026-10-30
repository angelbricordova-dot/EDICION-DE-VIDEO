import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { evolvePath } from "@remotion/paths";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";
import type { Frase } from "../tucacas/guiones";
import { B, camara, cargarFuentes, Fondo, IconoWhatsApp, JAKARTA, Marca, pantalla, Pastilla, PH, PW, Subtitulos, Telefono, Titular, Toque, W } from "./piezas";
import guionJson from "./guion-v1.json";

// V1 · Promo 30 s "Deja el cuaderno" (marketing/GUIONES.md). Tiempos en guion-v1.json
// (scripts/tubodega/guion_tubodega.py), anclados a la voz.

type Guion = { duracion: number; marcas: Record<string, number>; frases: Frase[] };
export const GUION_V1 = guionJson as unknown as Guion;
const M = GUION_V1.marcas;

export type PropsV1 = { audio: string | null; whatsapp: string };

/** Cuaderno de papel con anotaciones a mano que se tacha cuando la voz dice "cuaderno". */
const Cuaderno: React.FC<{ t: number }> = ({ t }) => {
  const entra = sp(t, 0.15, { damping: 12, stiffness: 160 });
  const tacha = prog(t, M.cuaderno + 0.1, M.cuaderno + 0.5, easeOut);
  const sale = prog(t, M.s2 - 0.3, M.s2, easeIn);
  const d = "M 30 40 L 330 380";
  const d2 = "M 330 40 L 30 380";
  const a = evolvePath(Math.max(0.001, tacha), d);
  const b = evolvePath(Math.max(0.001, clamp01(tacha * 1.6 - 0.6)), d2);
  return (
    <div style={{ position: "absolute", left: 30, top: 1010, width: 360, height: 420, rotate: `${lerp(-30, -9, entra) - sale * 20}deg`, translate: `${(1 - entra) * -500 - sale * 600}px ${sale * 200}px` }}>
      <svg width={360} height={420} style={{ overflow: "visible", filter: "drop-shadow(0 20px 30px rgba(23,32,28,0.25))" }}>
        <rect x={0} y={0} width={360} height={420} rx={22} fill="#fffdf4" stroke="#d8d2bd" strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={20} x2={340} y1={70 + i * 38} y2={70 + i * 38} stroke="#bcd3e6" strokeWidth={3} />
        ))}
        <line x1={64} x2={64} y1={0} y2={420} stroke="#f2a1a1" strokeWidth={3} />
        {[["Sra. Carmen", "8,50"], ["José", "3,30"], ["???", "¿?"], ["Luis", "2,—"], ["Pedro", "5"]].map(([n, m], i) => (
          <text key={i} x={78} y={62 + i * 38 * 1.6} fontFamily="'Comic Sans MS', 'Segoe Print', cursive" fontSize={30} fill="#3a4a8a" transform={`rotate(${(i % 2 ? 1.5 : -1.5)} 78 ${62 + i * 61})`}>
            {n} … {m}
          </text>
        ))}
        <path d={d} stroke={B.rojo} strokeWidth={20} strokeLinecap="round" fill="none" strokeDasharray={a.strokeDasharray} strokeDashoffset={a.strokeDashoffset} />
        <path d={d2} stroke={B.rojo} strokeWidth={20} strokeLinecap="round" fill="none" strokeDasharray={b.strokeDasharray} strokeDashoffset={b.strokeDashoffset} />
      </svg>
    </div>
  );
};

const rnd = (i: number) => {
  const x = Math.sin(i * 91.17 + 12.3) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Refresco genérico (sin marca) sobre el teléfono: el marco de escaneo lo busca, se ajusta al
 * código y pita justo cuando la voz dice "escaneas" y la botella entra al teléfono, donde el clip real
 * muestra "Refresco 2L agregado".
 */
const Botella: React.FC<{ t: number }> = ({ t }) => {
  const entra = sp(t, M.s2 - 0.05, { damping: 13, stiffness: 140 });
  const va = easeIn(prog(t, M.escaneo + 0.12, M.escaneo + 0.42));
  if (entra <= 0 || va >= 1) return null;
  const busca = easeOut(prog(t, M.s2 + 0.5, M.s2 + 0.9));
  const fija = easeInOut(prog(t, M.escaneo - 0.6, M.escaneo - 0.1));
  const laser = prog(t, M.escaneo - 0.35, M.escaneo);
  const ok = prog(t, M.escaneo, M.escaneo + 0.3);
  const bob = Math.sin(t * 2.4) * 8 * (1 - va);
  const x = 540;
  const y = lerp(400, 900, va) + bob - (1 - entra) * 700;
  const giro = lerp(-28, -6, entra) * (1 - va) + Math.sin(t * 1.7) * 1.5;
  // Marco de escaneo alrededor del código de barras (coordenadas de la botella).
  const mx = 215;
  const my = 101;
  const me = lerp(1.7, 1, fija) * (1 + 0.05 * Math.sin(t * 9) * (1 - fija));
  const esquina = (sx: number, sy: number) => {
    const cx = mx + sx * 70 * me;
    const cy = my + sy * 52 * me;
    return <path key={`${sx}${sy}`} d={`M ${cx} ${cy - sy * 24} L ${cx} ${cy} L ${cx - sx * 24} ${cy}`} fill="none" stroke={ok > 0 ? "#34d399" : B.verde} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const tri = (v: number) => 1 - Math.abs(((v * 2.5) % 2) - 1);
  const barras = [3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2];
  let bx = 160;
  return (
    <div style={{ position: "absolute", left: x - 250, top: y - 95, width: 500, height: 190, rotate: `${giro}deg`, scale: String(lerp(1, 0.15, va)), opacity: 1 - va * 0.5, filter: "drop-shadow(0 26px 34px rgba(23,32,28,0.28))" }}>
      <svg width={500} height={190} viewBox="0 0 500 190" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="liquido" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FDBA74" />
            <stop offset="0.45" stopColor="#F97316" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <clipPath id="cuerpo">
            <path d="M 40 15 H 300 C 340 15 350 60 390 62 H 430 V 128 H 390 C 350 130 340 175 300 175 H 40 C 18 175 8 160 8 140 V 50 C 8 30 18 15 40 15 Z" />
          </clipPath>
        </defs>
        <path d="M 40 15 H 300 C 340 15 350 60 390 62 H 430 V 128 H 390 C 350 130 340 175 300 175 H 40 C 18 175 8 160 8 140 V 50 C 8 30 18 15 40 15 Z" fill="url(#liquido)" />
        <g clipPath="url(#cuerpo)">
          {Array.from({ length: 16 }, (_, i) => {
            const zona = i % 2 ? [14, 60] : [290, 400];
            const bxx = zona[0] + rnd(i) * (zona[1] - zona[0]);
            const by = 172 - (((t * (40 + rnd(i + 5) * 40) + rnd(i + 9) * 160) % 160));
            return <circle key={i} cx={bxx + Math.sin(t * 3 + i) * 3} cy={by} r={2.5 + rnd(i + 3) * 4} fill="rgba(255,255,255,0.55)" />;
          })}
          {/* Etiqueta blanca con franja verde y código de barras. */}
          <rect x={70} y={10} width={220} height={170} fill="#ffffff" />
          <rect x={70} y={10} width={220} height={30} fill={B.verde} />
          <text x={180} y={33} textAnchor="middle" fontFamily={JAKARTA} fontWeight={800} fontSize={20} letterSpacing="0.12em" fill="#ffffff">REFRESCO</text>
          <text x={110} y={128} textAnchor="middle" fontFamily={JAKARTA} fontWeight={800} fontSize={40} fill="#F97316">2L</text>
          <rect x={20} y={26} width={360} height={10} rx={5} fill="rgba(255,255,255,0.35)" />
        </g>
        {barras.map((w, i) => {
          const el = <rect key={i} x={bx} y={62} width={w * 2.4} height={68} fill={B.texto} />;
          bx += w * 2.4 + 2.6;
          return el;
        })}
        <text x={215} y={146} textAnchor="middle" fontFamily="monospace" fontSize={13} fill={B.texto}>2 055000 791906</text>
        <rect x={426} y={58} width={10} height={74} rx={3} fill="#e7ece9" />
        <rect x={434} y={52} width={48} height={86} rx={12} fill={B.verde} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={446 + i * 9} x2={446 + i * 9} y1={60} y2={130} stroke={B.verdeOscuro} strokeWidth={3} />
        ))}
        <g opacity={busca * (1 - va)}>
          {esquina(-1, -1)}
          {esquina(1, -1)}
          {esquina(-1, 1)}
          {esquina(1, 1)}
        </g>
        {laser > 0 && ok < 1 ? (
          <line x1={140} x2={290} y1={lerp(56, 146, tri(laser))} y2={lerp(56, 146, tri(laser))} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #ef4444)" }} opacity={1 - ok} />
        ) : null}
        {ok > 0 ? <rect x={140} y={50} width={150} height={104} rx={10} fill="#ffffff" opacity={(1 - ok) * 0.85} /> : null}
      </svg>
    </div>
  );
};

/** Monedas de dólar y bolívar a los lados del teléfono; al decir "vuelto" caen en la fila del vuelto. */
const Moneda: React.FC<{ t: number; t0: number; x: number; y: number; texto: string; color: string; borde: string }> = ({ t, t0, x, y, texto, color, borde }) => {
  const k = sp(t, t0, { damping: 12, stiffness: 170 });
  const va = easeIn(prog(t, M.vuelto - 0.45, M.vuelto - 0.1));
  if (k <= 0 || va >= 1) return null;
  const giro = (1 - clamp01(k)) * 540 + Math.sin((t - t0) * 2.2) * 14;
  const px = lerp(x, 540, va);
  const py = lerp(y + Math.sin(t * 2.2 + x) * 10, 1200, va);
  return (
    <div style={{ position: "absolute", left: px - 95, top: py - 95, width: 190, height: 190, transform: `perspective(900px) rotateY(${giro}deg) scale(${lerp(0.3, 1, k) * lerp(1, 0.25, va)})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.45) 0%, ${color} 46%, ${borde} 100%)`, border: `9px solid ${borde}`, boxShadow: "0 26px 44px rgba(23,32,28,0.28)" }} />
      <div style={{ position: "absolute", inset: 22, borderRadius: "50%", border: "4px dashed rgba(255,255,255,0.45)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: JAKARTA, fontWeight: 800, fontSize: texto.length > 1 ? 70 : 92, color: B.blanco, letterSpacing: "-0.03em", textShadow: "0 4px 0 rgba(0,0,0,0.15)" }}>{texto}</div>
    </div>
  );
};

/** El ticket real (pantalla 24) sale hacia arriba de una impresora térmica. */
const Impresora: React.FC<{ t: number }> = ({ t }) => {
  const entra = sp(t, M.s6, { damping: 14, stiffness: 150 });
  const sale = prog(t, M.s7 - 0.3, M.s7, easeIn);
  const imprime = prog(t, M.s6 + 0.25, M.s6 + 1.9, (x) => x);
  const altoTicket = 1460; // parte de la pantalla 24 con el ticket
  const ancho = 560;
  const s = ancho / PW;
  const visible = altoTicket * s * imprime;
  const ranuraY = 1290;
  const vib = imprime > 0 && imprime < 1 ? Math.sin(t * 90) * 2 : 0;
  return (
    <AbsoluteFill style={{ translate: `0 ${(1 - entra) * 1200 + sale * 1400}px` }}>
      {/* Ticket saliendo por la ranura. */}
      <div style={{ position: "absolute", left: W / 2 - ancho / 2, top: ranuraY - visible, width: ancho, height: visible, overflow: "hidden", boxShadow: "0 20px 40px rgba(23,32,28,0.18)" }}>
        <Img src={pantalla("24-ticket-impreso.png")} style={{ position: "absolute", left: 0, top: 0, width: ancho, height: PH * s }} />
      </div>
      {/* Impresora. */}
      <div style={{ position: "absolute", left: W / 2 - 360, top: ranuraY - 20 + vib, width: 720, height: 330, borderRadius: 60, background: "linear-gradient(180deg, #2c3531 0%, #151b18 100%)", boxShadow: "0 40px 80px rgba(23,32,28,0.35), inset 0 3px 0 rgba(255,255,255,0.12)" }}>
        <div style={{ position: "absolute", left: 70, right: 70, top: 26, height: 16, borderRadius: 8, background: "#0b0f0d" }} />
        <div style={{ position: "absolute", left: 60, bottom: 50, width: 30, height: 30, borderRadius: "50%", background: imprime > 0 && imprime < 1 ? "#55e39c" : "#2f6e50", boxShadow: imprime > 0 && imprime < 1 ? "0 0 20px #55e39c" : "none" }} />
        <div style={{ position: "absolute", right: 60, bottom: 46, fontFamily: JAKARTA, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em" }}>58 mm</div>
      </div>
    </AbsoluteFill>
  );
};

const SinWifi: React.FC<{ t: number }> = ({ t }) => {
  const k = sp(t, M.internet, { damping: 10, stiffness: 230, mass: 0.6 });
  if (k <= 0) return null;
  const sale = prog(t, M.s7 - 0.3, M.s7, easeIn);
  return (
    <div style={{ position: "absolute", left: 50, top: 640, width: 190, height: 190, borderRadius: 60, background: B.blanco, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 50px rgba(23,32,28,0.2)", scale: String(k * (1 - sale)), rotate: `${(1 - k) * 25}deg` }}>
      <svg width={120} height={120} viewBox="0 0 24 24">
        <path d="M2 8.5a15 15 0 0 1 20 0 M5 12a10 10 0 0 1 14 0 M8.5 15.5a5 5 0 0 1 7 0" fill="none" stroke={B.verde} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={12} cy={19} r={1.4} fill={B.verde} />
        <line x1={4} y1={3} x2={20} y2={21} stroke={B.rojo} strokeWidth={2.4} strokeLinecap="round" />
      </svg>
    </div>
  );
};

const METODOS: [string, string][] = [
  ["Pago Móvil", "pagomovil"],
  ["Punto", "punto"],
  ["Zelle", "zelle"],
  ["Efectivo", "efectivo"],
  ["Fiado", "fiado"],
];

/** Confeti que sale de la pastilla "7 días gratis". */
const Confeti: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const d = t - t0;
  if (d < 0 || d > 1.8) return null;
  const colores = ["#ffffff", "#bff0d8", B.morado, "#FDE68A", "#86F3C4"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 30 }, (_, i) => {
        const ang = (-90 + (rnd(i) - 0.5) * 150) * (Math.PI / 180);
        const v = 700 + rnd(i + 30) * 700;
        const px = x + Math.cos(ang) * v * d;
        const py = y + Math.sin(ang) * v * d + 1600 * d * d;
        const op = 1 - prog(d, 1.2, 1.8);
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: i % 3 ? 14 : 18, height: i % 3 ? 26 : 18, borderRadius: i % 3 ? 4 : 9, background: colores[i % colores.length], rotate: `${d * (300 + rnd(i + 60) * 500)}deg`, opacity: op }} />;
      })}
    </AbsoluteFill>
  );
};

const Icono: React.FC<{ tipo: string }> = ({ tipo }) => {
  const st = { fill: "none", stroke: B.verde, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={70} height={70} viewBox="0 0 24 24">
      {tipo === "codigo" ? (
        <>
          <path d="M3 7V4h3 M18 4h3v3 M21 17v3h-3 M6 20H3v-3" {...st} />
          <path d="M7 8v8 M10 8v8 M12.5 8v8 M15 8v8 M17 8v8" {...st} strokeWidth={1.8} />
        </>
      ) : tipo === "moneda" ? (
        <>
          <circle cx={9} cy={12} r={6} {...st} />
          <circle cx={15} cy={12} r={6} {...st} stroke={B.ambar} />
        </>
      ) : tipo === "fiado" ? (
        <>
          <rect x={5} y={3} width={14} height={18} rx={2} {...st} />
          <path d="M9 8h6 M9 12h6 M9 16h3" {...st} />
        </>
      ) : tipo === "ticket" ? (
        <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21Z M9 8h6 M9 12h6" {...st} />
      ) : (
        <>
          <path d="M2 8.5a15 15 0 0 1 20 0 M5 12a10 10 0 0 1 14 0 M8.5 15.5a5 5 0 0 1 7 0" {...st} />
          <circle cx={12} cy={19} r={1.4} fill={B.verde} />
          <line x1={4} y1={3} x2={20} y2={21} stroke={B.rojo} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

// Insignias que repasan lo que hace la app cuando termina la voz (rectas, a los lados del teléfono).
const INSIGNIAS = [
  { texto: "Escanea", tipo: "codigo", x: 165, y: 1030 },
  { texto: "$ y Bs", tipo: "moneda", x: 880, y: 970 },
  { texto: "Fiado", tipo: "fiado", x: 165, y: 1300 },
  { texto: "Ticket", tipo: "ticket", x: 880, y: 1190 },
  { texto: "Sin internet", tipo: "wifi", x: 880, y: 1410 },
];

const Cierre: React.FC<{ t: number; whatsapp: string }> = ({ t, whatsapp }) => {
  // Transición en círculo hacia el fondo verde de la marca.
  const r = easeInOut(prog(t, M.s7 - 0.15, M.s7 + 0.45)) * 1500;
  const tel = sp(t, M.s7 + 0.35, { damping: 15, stiffness: 120 });
  const d = t - M.s7;
  const flota = Math.sin(d * 2.2) * 12;
  const golpe = t >= M.golpe ? 0.045 * Math.exp(-(t - M.golpe) * 7) : 0;
  const late = t > M.whatsapp + 0.5 ? Math.max(0, Math.sin((t - M.whatsapp - 0.5) * Math.PI * 1.4)) ** 8 * 0.06 : 0;
  const inicio = M.whatsapp + 1.25; // cuando termina la voz
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 540px 1100px)`, scale: String(1 + golpe) }}>
      <Fondo t={t} tono="verde" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
        <Marca t={t} t0={M.s7} tam={130} claro />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Pastilla t={t} t0={M.gratis} texto="Prueba 7 días gratis" fondo={B.blanco} color={B.verdeOscuro} tam={62} />
        <div style={{ scale: String(1 + late) }}>
          <Pastilla t={t} t0={M.whatsapp} texto={`WhatsApp ${whatsapp}`} fondo={B.texto} tam={50} icono={<IconoWhatsApp tam={56} />} />
        </div>
      </div>
      <Confeti t={t} t0={M.gratis + 0.05} x={540} y={620} />
      <AbsoluteFill style={{ translate: `0 ${flota}px` }}>
        <Telefono
          t={t}
          contenidos={[
            { t: 0, img: "01-venta-inicio.png" },
            { t: inicio - 0.2, img: "10-venta-registrada.png" },
            { t: inicio + 1.4, img: "17-cuadre-del-dia.png" },
          ]}
          camara={[camara(0, 585, 1266, 1.063), camara(40, 585, 1266, 1.063)]}
          cy={1418}
          entra={tel}
        />
      </AbsoluteFill>
      {INSIGNIAS.map((n, i) => {
        const k = sp(t, inicio + i * 0.18, { damping: 11, stiffness: 220, mass: 0.6 });
        if (k <= 0) return null;
        return (
          <div key={n.texto} style={{ position: "absolute", left: n.x - 110, top: n.y - 78 + Math.sin(t * 2.4 + i) * 8, width: 220, height: 156, borderRadius: 34, background: B.blanco, boxShadow: "0 22px 44px rgba(23,32,28,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, scale: String(lerp(0.3, 1, k)), opacity: clamp01(k * 2) }}>
            <Icono tipo={n.tipo} />
            <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 30, color: B.texto, letterSpacing: "-0.01em" }}>{n.texto}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const PromoV1: React.FC<PropsV1> = ({ audio, whatsapp }) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // El teléfono está desde el inicio hasta la escena 6 (no vuelve a entrar entre escenas).
  const telEntra = sp(t, 0.1, { damping: 14, stiffness: 130 });
  const telSale = prog(t, M.s6 - 0.2, M.s6 + 0.25, easeIn);
  const contenidos = [
    { t: 0, img: "12-cuaderno-fiados.png" },
    // Cámara lista (cuadro fijo del clip) hasta el pitido; ahí sigue el clip y aparece el refresco.
    { t: M.s2, clip: "01-escanear-y-cobrar.mp4", inicio: 0.64, congelar: true },
    { t: M.escaneo, clip: "01-escanear-y-cobrar.mp4", inicio: 0.64, corte: true },
    { t: M.s3, img: "09-vuelto-efectivo.png" },
    { t: M.s4, img: "08-pago-movil.png" },
    { t: M.fiado - 0.3, img: "11-credito-fiado.png" },
    { t: M.s5, img: "12-cuaderno-fiados.png" },
    { t: M.vendiste + 0.4, img: "17-cuadre-del-dia.png" },
  ];
  const cam = [
    camara(0, 585, 1266, 1.0),
    camara(0.75, 585, 1266, 1.0),
    camara(1.15, 470, 560, 1.5, -2),
    camara(M.s2 - 0.05, 470, 560, 1.5, -2),
    camara(M.s2 + 0.3, 585, 1266, 1.0),
    camara(M.escaneo + 0.35, 585, 1266, 1.0),
    camara(M.escaneo + 0.7, 585, 520, 1.55, 2),
    camara(M.s3 - 0.05, 585, 520, 1.55, 2),
    camara(M.s3 + 0.3, 585, 1266, 1.0),
    camara(M.vuelto - 0.4, 585, 1266, 1.0),
    camara(M.vuelto, 585, 1760, 2.0, -2),
    camara(M.s4 - 0.05, 585, 1760, 2.0, -2),
    camara(M.s4 + 0.3, 420, 600, 1.45, 0),
    camara(M.punto, 420, 600, 1.45),
    camara(M.punto + 0.35, 585, 1540, 1.6, 2),
    camara(M.fiado - 0.35, 585, 1540, 1.6, 2),
    camara(M.fiado, 585, 1520, 1.75, 0),
    camara(M.s5 - 0.05, 585, 1520, 1.75),
    camara(M.s5 + 0.3, 585, 1300, 1.6, -2),
    camara(M.vendiste + 0.35, 585, 1300, 1.6, -2),
    camara(M.vendiste + 0.75, 585, 640, 1.75, 0),
    camara(M.ganaste - 0.1, 585, 640, 1.75),
    camara(M.ganaste + 0.3, 700, 760, 1.9, 2),
  ];
  const toques = (
    <>
      <Toque t={t} t0={M.pagomovil + 0.3} x={290} y={380} />
      <Toque t={t} t0={M.fiado - 0.05} x={585} y={1525} r={140} />
    </>
  );

  return (
    <AbsoluteFill style={{ background: B.fondo, overflow: "hidden" }}>
      <Fondo t={t} tono={t >= M.s7 ? "claro" : "claro"} />
      {t < M.s6 + 0.3 ? <Telefono t={t} contenidos={contenidos} camara={cam} cy={960} entra={telEntra * (1 - telSale)} extra={toques} /> : null}
      {t < M.s2 ? <Cuaderno t={t} /> : null}
      {t >= M.s2 - 0.1 && t < M.s3 ? <Botella t={t} /> : null}
      {t >= M.s3 && t < M.s4 ? (
        <>
          <Moneda t={t} t0={M.dolares} x={170} y={820} texto="$" color={B.verde} borde={B.verdeOscuro} />
          <Moneda t={t} t0={M.bolivares} x={895} y={820} texto="Bs" color={B.ambar} borde="#B45309" />
        </>
      ) : null}
      {t >= M.s6 - 0.1 && t < M.s7 + 0.1 ? <Impresora t={t} /> : null}
      {t >= M.s6 ? <SinWifi t={t} /> : null}
      {t >= M.s7 - 0.15 ? <Cierre t={t} whatsapp={whatsapp} /> : null}

      {/* Titulares (texto en pantalla) en la zona alta, dentro de la zona segura. */}
      <Titular t={t} y={240} tam={80} hasta={M.s2} lineas={[{ texto: "¿Todavía anotas", t0: 0.05 }, { texto: "los fiados en", t0: 0.45, verdes: ["fiados"] }, { texto: "un cuaderno?", t0: 1.0, verdes: ["cuaderno"] }]} />
      <Titular t={t} y={240} tam={96} hasta={M.s3} lineas={[{ texto: "Escaneas… y listo", t0: M.escaneas, verdes: ["listo"] }]} />
      <Titular t={t} y={240} tam={80} hasta={M.s4} lineas={[{ texto: "Dólares y bolívares.", t0: M.s3 + 0.05, verdes: ["dólares", "bolívares"] }, { texto: "El vuelto, calculado.", t0: M.vuelto - 0.1, verdes: ["calculado"] }]} />
      {t >= M.s4 && t < M.s5 ? (
        <div style={{ position: "absolute", left: 60, right: 90, top: 250, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, opacity: 1 - prog(t, M.s5 - 0.2, M.s5) }}>
          {METODOS.map(([n, k]) => (
            <Pastilla key={n} t={t} t0={M[k]} texto={n} tam={52} fondo={n === "Fiado" ? B.morado : B.verde} />
          ))}
        </div>
      ) : null}
      <Titular t={t} y={240} tam={80} hasta={M.s6} lineas={[{ texto: "Sabes quién te debe", t0: M.s5 + 0.05, verdes: ["debe"] }, { texto: "y cuánto ganaste hoy", t0: M.ganaste - 0.15, verdes: ["ganaste"] }]} />
      <Titular t={t} y={240} tam={80} hasta={M.s7} lineas={[{ texto: "Imprime tu ticket.", t0: M.s6 + 0.05, verdes: ["ticket"] }, { texto: "Funciona sin internet.", t0: M.funciona, verdes: ["internet"] }]} />

      {t < M.s7 ? <Subtitulos frases={GUION_V1.frases} t={t} y={1440} /> : null}
      {t >= M.fin - 0.12 ? <AbsoluteFill style={{ background: B.verdeOscuro }} /> : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Portada: el titular grande sobre el fondo de marca con el teléfono. */
export const PortadaV1: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill style={{ background: B.fondo }}>
      <Fondo t={3} />
      <Titular t={10} y={260} tam={110} lineas={[{ texto: "Deja el", t0: 0 }, { texto: "cuaderno", t0: 0, verdes: ["cuaderno"] }]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640 }}>
        <Marca t={10} t0={0} tam={78} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 250, top: 860, width: 500, height: 1082 }}>
        <div style={{ position: "absolute", inset: -20, borderRadius: 86, background: "#121815", boxShadow: "0 60px 120px rgba(23,32,28,0.35)" }} />
        <Img src={pantalla("12-cuaderno-fiados.png")} style={{ position: "absolute", inset: 0, width: 500, height: 1082, borderRadius: 68 }} />
      </div>
    </AbsoluteFill>
  );
};
