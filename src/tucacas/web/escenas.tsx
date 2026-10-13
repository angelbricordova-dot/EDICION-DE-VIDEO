import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { C, clamp01, easeIn, easeInOut, easeOut, F, lerp, POP, prog, sp, W } from "../estilo";

// Escenas de motion graphics del comercial web: fondo playero animado, adornos,
// fotos que salen volando, "lo que incluye" y el mapa de dónde queda.

/** Número pseudoaleatorio estable (no usar Math.random: parpadea al renderizar). */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Interpolación por fotogramas clave: cada movimiento llega a su clave en ~0.42 s y se queda. */
export type Clave = { t: number; escala: number; x: number; y: number; giro?: number; lento?: boolean };
export const DUR_MOVIMIENTO = 0.42;
const SNAP = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const claveEn = (claves: Clave[], t: number): Clave => {
  if (t <= claves[0].t) return claves[0];
  for (let i = 0; i < claves.length - 1; i++) {
    const a = claves[i];
    const b = claves[i + 1];
    if (t < b.t) {
      const dur = b.lento ? b.t - a.t : Math.min(b.t - a.t, DUR_MOVIMIENTO);
      const k = b.lento ? easeInOut(clamp01((t - a.t) / dur)) : SNAP(clamp01((t - (b.t - dur)) / dur));
      return { t, escala: lerp(a.escala, b.escala, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), giro: lerp(a.giro ?? 0, b.giro ?? 0, k) };
    }
  }
  return claves[claves.length - 1];
};

/** Desenfoque de movimiento según la velocidad de la cámara entre dos cuadros. */
export const desenfoqueCamara = (claves: Clave[], t: number, s0: number) => {
  const a = claveEn(claves, t - 1 / 30);
  const b = claveEn(claves, t);
  const vel = Math.hypot((b.x - a.x) * b.escala * s0, (b.y - a.y) * b.escala * s0) + Math.abs(b.escala - a.escala) * 900;
  return Math.min(9, vel * 0.05);
};

// ------------------------------------------------------------- fondo playero

const ola = (t: number, y: number, amp: number, largo: number, vel: number, fase: number) => {
  let d = `M -20 ${y}`;
  for (let x = -20; x <= W + 20; x += 20) {
    d += ` L ${x} ${(y + amp * Math.sin((x / largo) * Math.PI * 2 + t * vel + fase)).toFixed(1)}`;
  }
  return `${d} L ${W + 20} 1940 L -20 1940 Z`;
};

const HOJA = "M0 0 Q 70 -26 190 -4 Q 80 12 0 0 Z";

/** Penca de palma que se mece (silueta en la esquina). */
const Palma: React.FC<{ t: number; x: number; y: number; escala: number; espejo?: boolean; color: string }> = ({ t, x, y, escala, espejo, color }) => {
  const meneo = Math.sin(t * 1.3) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${espejo ? -escala : escala} ${escala}) rotate(${meneo})`}>
      {[-20, 5, 30, 55, 80, 105, 130].map((a, i) => (
        <path key={i} d={HOJA} transform={`rotate(${a + Math.sin(t * 1.7 + i) * 2.5}) scale(${1 - Math.abs(i - 3) * 0.08})`} fill={color} />
      ))}
    </g>
  );
};

/** Fondo de playa en los colores de la marca: mar, sol, olas en movimiento, arena y palmas. */
export const Playa: React.FC<{ t: number; arena?: boolean }> = ({ t, arena = true }) => {
  const sol = 1 + 0.05 * Math.sin(t * 1.4);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(175deg, ${C.mar} 0%, ${C.verde2} 48%, ${C.verdeProfundo} 100%)`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: -240,
          top: -120,
          width: 900,
          height: 900,
          borderRadius: "50%",
          scale: String(sol),
          background: "radial-gradient(circle, rgba(255,226,154,0.75) 0%, rgba(244,182,63,0.32) 35%, rgba(244,182,63,0) 68%)",
        }}
      />
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* Destellos que suben despacio. */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = rnd(i) * W;
          const ciclo = 9 + rnd(i + 50) * 6;
          const y = 1920 - (((t + rnd(i + 99) * ciclo) % ciclo) / ciclo) * 2100;
          const r = 3 + rnd(i + 7) * 6;
          return <circle key={i} cx={x + Math.sin(t + i) * 14} cy={y} r={r} fill="white" opacity={0.08 + rnd(i + 3) * 0.14} />;
        })}
        <path d={ola(t, 1480, 22, 520, 1.1, 0)} fill="rgba(255,255,255,0.07)" />
        <path d={ola(t, 1560, 26, 430, -1.4, 1.5)} fill="rgba(23,163,160,0.35)" />
        <path d={ola(t, 1650, 20, 360, 1.8, 3)} fill="rgba(255,255,255,0.10)" />
        {arena ? (
          <>
            <path d={ola(t, 1760, 16, 600, 1.2, 0.6)} fill="rgba(255,255,255,0.75)" />
            <path d={ola(t, 1780, 14, 600, 1.2, 0.9)} fill={C.solSuave} />
          </>
        ) : null}
        <Palma t={t} x={-30} y={60} escala={1.6} color="rgba(11,58,54,0.35)" />
        <Palma t={t + 1} x={W + 30} y={1300} escala={1.3} espejo color="rgba(11,58,54,0.28)" />
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- adornos del texto

/**
 * Gancho "¿Vienes a / Tucacas?": la primera línea sube palabra por palabra desde una
 * máscara; detrás de "Tucacas?" se abre una pastilla sol y las letras caen una a una.
 * Debajo aparece la etiqueta de ubicación.
 */
export const Gancho: React.FC<{ t: number; lineas: string[]; ts: number[]; arriba: number; sale: number }> = ({ t, lineas, ts, arriba, sale }) => {
  const [l1, l2] = lineas;
  const palabras = l1.split(" ");
  const marca = prog(t, ts[1] - 0.05, ts[1] + 0.4, easeOut);
  const etiqueta = sp(t, ts[1] + 0.55, POP);
  const vaiven = Math.sin((t - ts[1]) * 2.4) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: arriba,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: 1 - sale,
        scale: String(1 - 0.06 * sale),
      }}
    >
      <div style={{ display: "flex", gap: 28, overflow: "hidden", padding: "6px 10px 14px" }}>
        {palabras.map((w, i) => {
          const p = prog(t, ts[0] + i * 0.09, ts[0] + i * 0.09 + 0.55, easeOut);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: F.titulo,
                fontWeight: 800,
                fontSize: 128,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: C.blanco,
                textShadow: "0 6px 30px rgba(0,0,0,0.45)",
                translate: `0 ${(1 - p) * 150}px`,
                rotate: `${(1 - p) * 8}deg`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ position: "relative", rotate: `${-3 + vaiven}deg` }}>
        <div
          style={{
            position: "absolute",
            inset: "-6px -34px",
            borderRadius: 40,
            background: C.sol,
            boxShadow: "0 22px 50px rgba(0,0,0,0.35)",
            transformOrigin: "0% 50%",
            scale: `${marca} 1`,
          }}
        />
        <div style={{ position: "relative", display: "flex" }}>
          {Array.from(l2).map((ch, i) => {
            const p = sp(t, ts[1] + 0.12 + i * 0.035, { damping: 11, stiffness: 220, mass: 0.6 });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: F.titulo,
                  fontWeight: 800,
                  fontSize: 168,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: C.tinta,
                  opacity: clamp01(p * 2),
                  translate: `0 ${(1 - p) * -90}px`,
                  scale: String(lerp(1.6, 1, p)),
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </div>
      <div
        style={{
          marginTop: 26,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 999,
          padding: "14px 30px 14px 22px",
          fontFamily: F.texto,
          fontWeight: 700,
          fontSize: 40,
          color: C.tinta,
          boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
          scale: String(lerp(0.4, 1, etiqueta)),
          opacity: clamp01(etiqueta * 2),
        }}
      >
        <svg width={42} height={42} viewBox="0 0 24 24">
          <path d="M12 22 C 12 22, 4 14.5, 4 9.5 a8 8 0 0 1 16 0 C 20 14.5, 12 22, 12 22 Z" fill={C.verde} />
          <circle cx={12} cy={9.5} r={3} fill="white" />
        </svg>
        Falcón · Venezuela
      </div>
    </div>
  );
};

const Tarjeta: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => (
  <div
    style={{
      width: 250,
      height: 250,
      borderRadius: 60,
      background: C.blanco,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
      scale: String(lerp(0.3, 1, p)),
      rotate: `${(1 - p) * -18}deg`,
      opacity: clamp01(p * 2),
    }}
  >
    {children}
  </div>
);

/** Calendario con un check que se dibuja: "reservar es más fácil". */
export const IconoReserva: React.FC<{ t: number; desde: number }> = ({ t, desde }) => {
  const p = sp(t, desde, POP);
  const check = prog(t, desde + 0.35, desde + 0.75);
  const dCheck = "M 52 70 L 64 82 L 86 58";
  const c = evolvePath(Math.max(0.001, check), dCheck);
  return (
    <Tarjeta p={p}>
      <svg width={170} height={170} viewBox="0 0 120 120">
        <rect x={14} y={22} width={92} height={84} rx={16} fill="none" stroke={C.verde} strokeWidth={8} />
        <path d="M14 46 H106 M38 12 V30 M82 12 V30" stroke={C.verde} strokeWidth={8} strokeLinecap="round" />
        <circle cx={69} cy={70} r={26 * clamp01(check * 3)} fill={C.sol} />
        <path d={dCheck} fill="none" stroke={C.tinta} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={c.strokeDasharray} strokeDashoffset={c.strokeDashoffset} />
      </svg>
    </Tarjeta>
  );
};

/** Tarjeta de pago tachada: "en la página no se cobra nada". */
export const IconoSinCobro: React.FC<{ t: number; desde: number }> = ({ t, desde }) => {
  const p = sp(t, desde, POP);
  const tacha = prog(t, desde + 0.4, desde + 0.7);
  const d = "M 18 100 L 102 20";
  const e = evolvePath(Math.max(0.001, tacha), d);
  return (
    <Tarjeta p={p}>
      <svg width={170} height={170} viewBox="0 0 120 120">
        <rect x={12} y={30} width={96} height={64} rx={12} fill="none" stroke={C.verde} strokeWidth={8} />
        <path d="M12 50 H108 M26 76 H50" stroke={C.verde} strokeWidth={8} strokeLinecap="round" />
        <path d={d} fill="none" stroke={C.coral} strokeWidth={11} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
      </svg>
    </Tarjeta>
  );
};

// ------------------------------------------------------------- fotos del apartamento

// Posición final de cada foto (centro x, centro y, giro) en el collage.
const COLLAGE = [
  [540, 640, 4],
  [300, 700, -8],
  [790, 660, 7],
  [300, 1080, 6],
  [790, 1060, -6],
  [540, 900, -2],
  [540, 1180, 3],
];

/** Las fotos del apartamento salen del centro y caen en un collage sobre la playa; al final salen volando. */
export const GaleriaFotos: React.FC<{ t: number; desde: number; hasta: number; fotos: string[] }> = ({ t, desde, hasta, fotos }) => {
  const deriva = prog(t, desde, hasta, (x) => x);
  return (
    <AbsoluteFill style={{ scale: String(1 + 0.06 * deriva) }}>
      {fotos.slice(0, COLLAGE.length).map((f, i) => {
        const [cx, cy, giro] = COLLAGE[i];
        const t0 = desde + 0.05 + i * 0.16;
        const p = sp(t, t0, { damping: 13, stiffness: 170, mass: 0.7 });
        const sale = prog(t, hasta - 0.32 + i * 0.025, hasta + i * 0.025, easeIn);
        const desdeX = i % 2 ? -700 : W + 700;
        const x = lerp(i === 0 ? 540 : desdeX - (i % 2 ? 0 : 0), cx, p);
        const y = lerp(1900, cy, p) - sale * 2000;
        const grande = i === COLLAGE.length - 2 ? 1.12 : 1;
        // El último en llegar late una vez (golpe) cuando cae.
        const latido = 1 + 0.06 * Math.sin(clamp01((t - t0 - 0.25) / 0.3) * Math.PI);
        if (t < t0) return null;
        return (
          <div
            key={f}
            style={{
              position: "absolute",
              left: x - 190,
              top: y - 250,
              width: 380,
              height: 500,
              padding: 14,
              paddingBottom: 46,
              background: C.blanco,
              borderRadius: 22,
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
              rotate: `${lerp(giro * 4, giro, p) + sale * (i % 2 ? -30 : 30)}deg`,
              scale: String(lerp(0.4, 1, p) * grande * latido),
            }}
          >
            {/* La foto completa (sin recortar) con su versión desenfocada detrás si no llena la tarjeta. */}
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", background: C.tinta }}>
              <Img src={staticFile(`tucacas/${f}`)} style={{ position: "absolute", inset: -20, width: "calc(100% + 40px)", height: "calc(100% + 40px)", objectFit: "cover", filter: "blur(14px) brightness(0.8)" }} />
              <Img src={staticFile(`tucacas/${f}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- lo que incluye

const ICONOS_INCLUYE: Record<string, string> = {
  personas: "M12 4 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 M4 21 c0 -4.4 3.6 -7 8 -7 s8 2.6 8 7",
  habitaciones: "M6 21 V3 h12 v18 M3 21 h18 M14.5 12 h.5",
  camas: "M3 19 V6 M3 14 h18 v5 M3 14 v-3 h7 a3 3 0 0 1 3 3",
  banos: "M3 12 h18 v2 a6 6 0 0 1 -6 6 H9 a6 6 0 0 1 -6 -6 z M6 12 V5 a2 2 0 0 1 4 0",
  piscina: "M2 17 c2 -2 4 -2 6 0 s4 2 6 0 4 -2 6 0 M2 21 c2 -2 4 -2 6 0 s4 2 6 0 4 -2 6 0 M8 14 V4 M16 14 V4 M8 8 h8",
  estacionamiento: "M5 3 h14 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 z M9 17 V7 h4 a3 3 0 0 1 0 6 H9",
  churuata: "M2 11 L12 4 L22 11 Z M12 11 V21 M8 21 h8",
  seguridad: "M12 3 L20 6 V12 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 Z M9 12 l2 2 4 -4",
  parrilla: "M4 10 h16 a8 8 0 0 1 -16 0 z M8 18 l-2 4 M16 18 l2 4 M9 3 c-1 2 1 3 0 5 M13 3 c-1 2 1 3 0 5",
};

export type ItemIncluye = { icono: string; texto: string };

/** Fichas de "lo que incluye" que entran en cascada, alternando desde los lados. */
export const Incluye: React.FC<{ t: number; desde: number; hasta: number; items: ItemIncluye[] }> = ({ t, desde, hasta, items }) => (
  <AbsoluteFill>
    {items.map((it, i) => {
      const col = i % 2;
      const fila = Math.floor(i / 2);
      const t0 = desde + 0.08 + i * 0.075;
      const p = sp(t, t0, { damping: 14, stiffness: 210, mass: 0.6 });
      const sale = prog(t, hasta - 0.28 + fila * 0.03, hasta + fila * 0.03, easeIn);
      const icono = prog(t, t0 + 0.08, t0 + 0.5);
      const x = col ? 555 : 65;
      const y = 400 + fila * 175;
      return (
        <div
          key={it.texto}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 460,
            height: 140,
            borderRadius: 34,
            background: C.blanco,
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 26px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
            translate: `${(1 - p) * (col ? 600 : -600) + sale * (col ? 700 : -700)}px 0`,
            rotate: `${(1 - p) * (col ? 8 : -8)}deg`,
            opacity: clamp01(p * 2),
          }}
        >
          <div style={{ width: 92, height: 92, borderRadius: 26, background: C.solSuave, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={60} height={60} viewBox="0 0 24 24">
              {(() => {
                const d = ICONOS_INCLUYE[it.icono];
                const e = evolvePath(Math.max(0.001, icono), d);
                return <path d={d} fill="none" stroke={C.verde} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
              })()}
            </svg>
          </div>
          <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: it.texto.length > 14 ? 34 : it.texto.length > 12 ? 38 : 44, color: C.tinta, lineHeight: 1.05 }}>{it.texto}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);

// ------------------------------------------------------------- mapa

// Mapa ilustrado (estilo de las apps de mapas), no a escala: tierra a la izquierda, mar al este.
const MUNDO = { w: 2400, h: 3000 };
/** Margen dibujado alrededor del mundo (tierra, calles) para que no se vea el borde al alejar. */
const MARGEN = 1500;
// La tierra y las calles se extienden más allá del área visible para que el borde no se vea al alejar.
const COSTA =
  "M-1500 -1500 L1260 -1500 L1300 0 C 1380 300, 1560 520, 1520 760 C 1490 960, 1300 1030, 1330 1140 C 1360 1260, 1620 1300, 1720 1460 C 1800 1600, 1560 1740, 1480 1880 C 1400 2050, 1560 2400, 1600 3000 L1650 4500 L-1500 4500 Z";
export const PUNTOS = {
  apto: { x: 1000, y: 1560 },
  muelles: { x: 1340, y: 1200 },
};
const RUTA = "M1000 1560 L1000 1400 C 1000 1340, 1040 1310, 1100 1290 L1250 1240 C 1290 1226, 1320 1212, 1340 1200";
const LANCHA = "M1350 1185 C 1500 1080, 1700 980, 1930 960";
const CAYOS = [
  { x: 1980, y: 930, r: 70, nombre: "Cayo Sal" },
  { x: 2150, y: 640, r: 90, nombre: "Cayo Sombrero" },
  { x: 1860, y: 700, r: 55, nombre: "Playuela" },
];

export type EventosMapa = { pin?: number; ruta?: [number, number]; muelle?: number; lancha?: [number, number] };

/** Centro del mapa en el cuadro (deja libre la zona de subtítulos). */
const MCY = 820;

const Etiqueta: React.FC<{ x: number; y: number; texto: string; tam?: number; color?: string; italica?: boolean }> = ({ x, y, texto, tam = 44, color = "#5b6b67", italica }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontFamily="Onest, system-ui, sans-serif"
    fontWeight={700}
    fontSize={tam}
    fontStyle={italica ? "italic" : undefined}
    fill={color}
    stroke="white"
    strokeWidth={tam * 0.22}
    paintOrder="stroke"
    letterSpacing={tam > 60 ? "0.12em" : undefined}
  >
    {texto}
  </text>
);

export const Mapa: React.FC<{ t: number; camara: Clave[]; eventos: EventosMapa }> = ({ t, camara, eventos }) => {
  const cam = claveEn(camara, t);
  const S = cam.escala;
  const blur = desenfoqueCamara(camara, t, 1);
  const pantalla = (p: { x: number; y: number }) => ({ x: W / 2 + (p.x - cam.x) * S, y: MCY + (p.y - cam.y) * S });

  const calles: string[] = [];
  for (let i = -12; i < 12; i++) calles.push(`M ${150 + i * 110} -1500 L ${100 + i * 120} 4500`);
  for (let j = -12; j < 34; j++) calles.push(`M -1500 ${120 + j * 135} L 1700 ${150 + j * 130}`);

  const ruta = eventos.ruta ? prog(t, eventos.ruta[0], eventos.ruta[1], easeInOut) : 0;
  const rutaP = evolvePath(Math.max(0.0001, ruta), RUTA);
  const largo = getLength(RUTA);
  const carro = getPointAtLength(RUTA, largo * ruta) ?? PUNTOS.apto;
  const lancha = eventos.lancha ? prog(t, eventos.lancha[0], eventos.lancha[1], easeInOut) : 0;
  const lanchaP = evolvePath(Math.max(0.0001, lancha), LANCHA);
  const bote = getPointAtLength(LANCHA, getLength(LANCHA) * lancha) ?? PUNTOS.muelles;

  const pinT = eventos.pin ?? 1e9;
  const caida = sp(t, pinT, { damping: 10, stiffness: 220, mass: 0.7 });
  const pinPos = pantalla(PUNTOS.apto);
  const tarjeta = sp(t, pinT + 0.25, POP);
  const muelle = eventos.muelle !== undefined ? sp(t, eventos.muelle, POP) : 0;
  const muPos = pantalla(PUNTOS.muelles);
  const carroPos = pantalla(carro);

  return (
    <AbsoluteFill style={{ background: "#9fd8e4", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
        <svg
          width={MUNDO.w + 2 * MARGEN}
          height={MUNDO.h + 2 * MARGEN}
          viewBox={`${-MARGEN} ${-MARGEN} ${MUNDO.w + 2 * MARGEN} ${MUNDO.h + 2 * MARGEN}`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${W / 2 - (cam.x + MARGEN) * S}px, ${MCY - (cam.y + MARGEN) * S}px) scale(${S})`,
          }}
        >
          <defs>
            <clipPath id="tierra">
              <path d={COSTA} />
            </clipPath>
          </defs>
          {/* Oleaje suave en el mar. */}
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${1500 + (i % 3) * 260} ${300 + i * 200} q 30 -14 60 0 t 60 0`} stroke="rgba(255,255,255,0.5)" strokeWidth={6} fill="none" transform={`translate(${Math.sin(t * 1.2 + i) * 12} 0)`} />
          ))}
          <path d={COSTA} fill="#f6e7c1" stroke="#f6e7c1" strokeWidth={60} />
          <path d={COSTA} fill="#f2efe6" />
          <g clipPath="url(#tierra)">
            <circle cx={450} cy={700} r={260} fill="#cfe7c3" />
            <circle cx={700} cy={2300} r={320} fill="#cfe7c3" />
            <circle cx={1250} cy={2000} r={140} fill="#cfe7c3" />
            {calles.map((d, i) => (
              <path key={i} d={d} stroke="#ffffff" strokeWidth={22} fill="none" />
            ))}
            <path d="M -300 4500 L 150 3000 C 600 2400, 900 1900, 980 1500 C 1060 1000, 1160 500, 1240 0 L 1290 -1500" stroke="#e8c25a" strokeWidth={46} fill="none" />
            <path d="M -300 4500 L 150 3000 C 600 2400, 900 1900, 980 1500 C 1060 1000, 1160 500, 1240 0 L 1290 -1500" stroke="#ffe08a" strokeWidth={34} fill="none" />
            {/* Conjunto Pescadores I */}
            <rect x={900} y={1500} width={200} height={140} rx={24} fill="#e3ddcf" />
          </g>
          {CAYOS.map((c) => (
            <g key={c.nombre}>
              <circle cx={c.x} cy={c.y} r={c.r + 18} fill="#f6e7c1" />
              <circle cx={c.x} cy={c.y} r={c.r} fill="#cfe7c3" />
              <Etiqueta x={c.x} y={c.y + c.r + 70} texto={c.nombre} tam={44} />
            </g>
          ))}
          <Etiqueta x={720} y={1880} texto="TUCACAS" tam={92} color="#3f524e" />
          <Etiqueta x={2000} y={1900} texto="Mar Caribe" tam={64} color="#3f8a99" italica />
          {/* Ruta al muelle y a los cayos. */}
          <path d={RUTA} stroke="#0e4f4a" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.25} strokeDasharray={rutaP.strokeDasharray} strokeDashoffset={rutaP.strokeDashoffset} />
          <path d={RUTA} stroke={C.verde} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={rutaP.strokeDasharray} strokeDashoffset={rutaP.strokeDashoffset} />
          <g opacity={lancha > 0 ? 1 : 0}>
            <path d={LANCHA} stroke="white" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={lanchaP.strokeDasharray} strokeDashoffset={lanchaP.strokeDashoffset} />
          </g>
        </svg>
      </div>
      {/* Banda suave detrás de los subtítulos: el mapa es claro y el texto es blanco. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,58,54,0) 58%, rgba(11,58,54,0.55) 72%, rgba(11,58,54,0.55) 80%, rgba(11,58,54,0) 92%)" }} />
      {/* Lo que va en la pantalla (tamaño fijo): pines, carro, lancha y tarjetas. */}
      {ruta > 0 && ruta < 1 ? (
        <div style={{ position: "absolute", left: carroPos.x - 34, top: carroPos.y - 34, width: 68, height: 68, borderRadius: "50%", background: C.blanco, border: `10px solid ${C.verde}`, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }} />
      ) : null}
      {lancha > 0 ? (
        <div style={{ position: "absolute", left: pantalla(bote).x - 46, top: pantalla(bote).y - 46, width: 92, height: 92, borderRadius: "50%", background: C.sol, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
          <svg width={56} height={56} viewBox="0 0 24 24">
            <path d="M3 15 h18 l-3 5 H6 z M12 3 v10 M12 4 l6 8 h-6" fill="none" stroke={C.tinta} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      {eventos.muelle !== undefined && muelle > 0 ? (
        <div style={{ position: "absolute", left: muPos.x - 60, top: muPos.y - 60, width: 120, height: 120, borderRadius: "50%", background: C.tinta, border: "8px solid white", display: "flex", alignItems: "center", justifyContent: "center", scale: String(muelle), boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>
          <svg width={64} height={64} viewBox="0 0 24 24">
            <path d="M12 6 a2 2 0 1 1 0 -4 a2 2 0 1 1 0 4 M12 6 v15 M5 12 H3 a9 9 0 0 0 18 0 h-2 M8 9 h8" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      {eventos.muelle !== undefined && muelle > 0 ? (
        <div style={{ position: "absolute", left: muPos.x + 70, top: muPos.y - 40, background: C.blanco, borderRadius: 20, padding: "10px 22px", fontFamily: F.texto, fontWeight: 800, fontSize: 40, color: C.tinta, boxShadow: "0 8px 20px rgba(0,0,0,0.2)", scale: String(muelle), transformOrigin: "0 50%" }}>
          Muelles
        </div>
      ) : null}
      {t >= pinT ? (
        <>
          {[0, 1].map((k) => {
            const r = ((t - pinT - 0.3 + k * 0.6) % 1.2) / 1.2;
            return t - pinT > 0.3 ? (
              <div key={k} style={{ position: "absolute", left: pinPos.x - 120, top: pinPos.y - 60, width: 240, height: 120, borderRadius: "50%", border: `6px solid ${C.verde}`, scale: String(lerp(0.2, 1.4, r)), opacity: 1 - r }} />
            ) : null;
          })}
          <div style={{ position: "absolute", left: pinPos.x - 40, top: pinPos.y - 16, width: 80, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.25)", scale: String(lerp(0.3, 1, caida)) }} />
          <svg width={130} height={170} viewBox="0 0 26 34" style={{ position: "absolute", left: pinPos.x - 65, top: pinPos.y - 165 - (1 - caida) * 500, overflow: "visible" }}>
            <path d="M13 33 C 13 33, 1 20, 1 12.5 a12 12 0 0 1 24 0 C 25 20, 13 33, 13 33 Z" fill={C.verde} stroke="white" strokeWidth={1.6} />
            <circle cx={13} cy={12.5} r={5} fill="white" />
          </svg>
          <div
            style={{
              position: "absolute",
              left: pinPos.x - 260,
              top: pinPos.y - 400,
              width: 520,
              background: C.blanco,
              borderRadius: 30,
              padding: "22px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
              scale: String(tarjeta),
              opacity: clamp01(tarjeta * 2),
              transformOrigin: "50% 100%",
            }}
          >
            <Img src={staticFile("tucacas/marca/icono-app.svg")} style={{ width: 92, height: 92, borderRadius: 22 }} />
            <div style={{ fontFamily: F.texto }}>
              <div style={{ fontWeight: 800, fontSize: 44, color: C.tinta }}>Pescadores I</div>
              <div style={{ fontWeight: 500, fontSize: 32, color: "#5b6b67" }}>Apto 30 · Tucacas, Falcón</div>
            </div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Insignia "5 min" con reloj que cuenta. */
export const Insignia: React.FC<{ t: number; desde: number; texto: string; cuenta?: [number, number] }> = ({ t, desde, texto, cuenta }) => {
  const p = sp(t, desde, POP);
  const n = cuenta ? Math.round(lerp(cuenta[0], cuenta[1], prog(t, desde, desde + 0.7, easeOut))) : null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", scale: String(lerp(0.5, 1, p)), opacity: clamp01(p * 2) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: C.sol, borderRadius: 999, padding: "22px 46px", boxShadow: "0 20px 46px rgba(0,0,0,0.3)" }}>
        <svg width={86} height={86} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={10} fill="none" stroke={C.tinta} strokeWidth={2.2} />
          <path d={`M12 12 L12 6 M12 12 L${12 + 4 * Math.sin((t - desde) * 6)} ${12 - 4 * Math.cos((t - desde) * 6)}`} stroke={C.tinta} strokeWidth={2.2} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: F.titulo, fontWeight: 800, fontSize: 96, color: C.tinta, lineHeight: 1 }}>
          {n !== null ? `${n} min` : null}
          <span style={{ fontSize: 52, fontWeight: 700 }}>{texto}</span>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------- sin cobro y confirmación

/** Panel de vidrio esmerilado que sube con un leve giro en 3D. */
const Vidrio: React.FC<{ t: number; desde: number; hasta: number; top: number; alto: number; children: React.ReactNode }> = ({ t, desde, hasta, top, alto, children }) => {
  const p = sp(t, desde, { damping: 16, stiffness: 120 });
  const sale = prog(t, hasta - 0.3, hasta, easeIn);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, height: alto, perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 56,
          background: "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 100%)",
          border: "2px solid rgba(255,255,255,0.45)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.6)",
          backdropFilter: "blur(18px)",
          transform: `translateY(${(1 - p) * 500 - sale * 120}px) rotateX(${(1 - p) * 24}deg) scale(${1 - sale * 0.06})`,
          opacity: clamp01(p * 2) * (1 - sale),
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** "En la página no se cobra nada": tarjeta de pago que entra y se tacha con un sello. */
export const SinCobro: React.FC<{ t: number; desde: number; hasta: number; sello: number }> = ({ t, desde, hasta, sello }) => {
  const etiqueta = prog(t, desde + 0.15, desde + 0.6, easeOut);
  const tarjeta = sp(t, desde + 0.25, { damping: 13, stiffness: 150 });
  const anillo = prog(t, sello, sello + 0.4, easeOut);
  const golpe = sp(t, sello, { damping: 8, stiffness: 260, mass: 0.6 });
  const temblor = t > sello && t < sello + 0.3 ? Math.sin((t - sello) * 70) * (1 - (t - sello) / 0.3) * 8 : 0;
  const circ = "M 0 -150 A 150 150 0 1 1 -0.1 -150";
  const a = evolvePath(Math.max(0.001, anillo), circ);
  const raya = evolvePath(Math.max(0.001, clamp01(anillo * 1.6 - 0.6)), "M -106 106 L 106 -106");
  const titulo = "No se cobra nada".split(" ");
  return (
    <Vidrio t={t} desde={desde} hasta={hasta} top={300} alto={980}>
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.texto,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.9)",
          opacity: etiqueta,
          translate: `0 ${(1 - etiqueta) * 20}px`,
        }}
      >
        En la página
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, height: 420, display: "flex", alignItems: "center", justifyContent: "center", translate: `${temblor}px 0` }}>
        <div
          style={{
            width: 520,
            height: 320,
            borderRadius: 34,
            background: `linear-gradient(135deg, ${C.verde} 0%, ${C.mar} 100%)`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
            position: "relative",
            translate: `${(1 - tarjeta) * 700}px 0`,
            rotate: `${(1 - tarjeta) * 25 - 4}deg`,
            filter: `saturate(${1 - 0.6 * anillo}) brightness(${1 - 0.15 * anillo})`,
          }}
        >
          <div style={{ position: "absolute", left: 44, top: 70, width: 92, height: 70, borderRadius: 14, background: C.sol }} />
          <div style={{ position: "absolute", left: 44, bottom: 60, fontFamily: F.texto, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.9)", letterSpacing: "0.12em" }}>
            •••• •••• ••••
          </div>
          <div style={{ position: "absolute", right: 40, top: 40, width: 80, height: 80, borderRadius: "50%", border: "8px solid rgba(255,255,255,0.6)" }} />
        </div>
        <svg width={360} height={360} viewBox="-180 -180 360 360" style={{ position: "absolute", overflow: "visible", scale: String(lerp(1.4, 1, golpe)) }}>
          <path d={circ} fill="none" stroke={C.coral} strokeWidth={30} strokeLinecap="round" strokeDasharray={a.strokeDasharray} strokeDashoffset={a.strokeDashoffset} />
          <path d="M -106 106 L 106 -106" fill="none" stroke={C.coral} strokeWidth={30} strokeLinecap="round" strokeDasharray={raya.strokeDasharray} strokeDashoffset={raya.strokeDashoffset} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 680, display: "flex", justifyContent: "center", gap: 26, flexWrap: "wrap", padding: "0 40px" }}>
        {titulo.map((w, i) => {
          const p = prog(t, sello + 0.1 + i * 0.09, sello + 0.65 + i * 0.09, easeOut);
          return (
            <div key={i} style={{ overflow: "hidden", padding: "4px 0 10px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: F.titulo,
                  fontWeight: 800,
                  fontSize: 104,
                  lineHeight: 1,
                  color: i === titulo.length - 1 ? C.sol : C.blanco,
                  translate: `0 ${(1 - p) * 120}px`,
                  textShadow: "0 6px 24px rgba(0,0,0,0.25)",
                }}
              >
                {w}
              </span>
            </div>
          );
        })}
      </div>
    </Vidrio>
  );
};

const Burbuja: React.FC<{ t: number; desde: number; mia?: boolean; children: React.ReactNode }> = ({ t, desde, mia, children }) => {
  const p = sp(t, desde, { damping: 13, stiffness: 190, mass: 0.7 });
  if (p <= 0) return null;
  return (
    <div
      style={{
        alignSelf: mia ? "flex-end" : "flex-start",
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        flexDirection: mia ? "row-reverse" : "row",
        transformOrigin: mia ? "100% 100%" : "0% 100%",
        scale: String(lerp(0.4, 1, p)),
        opacity: clamp01(p * 2),
        translate: `0 ${(1 - p) * 60}px`,
      }}
    >
      {!mia ? <Img src={staticFile("tucacas/marca/icono-app.svg")} style={{ width: 84, height: 84, borderRadius: "50%", boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }} /> : null}
      <div
        style={{
          maxWidth: 700,
          background: mia ? "#d9fdd3" : C.blanco,
          borderRadius: mia ? "36px 36px 10px 36px" : "36px 36px 36px 10px",
          padding: "26px 34px",
          fontFamily: F.texto,
          fontWeight: 500,
          fontSize: 44,
          lineHeight: 1.3,
          color: "#111b21",
          boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Chip: React.FC<{ t: number; desde: number; icono: string; texto: string; color: string }> = ({ t, desde, icono, texto, color }) => {
  const p = sp(t, desde, POP);
  const trazo = prog(t, desde + 0.1, desde + 0.5);
  const e = evolvePath(Math.max(0.001, trazo), icono);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: color,
        borderRadius: 999,
        padding: "22px 38px 22px 26px",
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        scale: String(lerp(0.3, 1, p)),
        rotate: `${(1 - p) * -12}deg`,
        opacity: clamp01(p * 2),
      }}
    >
      <svg width={64} height={64} viewBox="0 0 24 24">
        <path d={icono} fill="none" stroke={C.tinta} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
      </svg>
      <span style={{ fontFamily: F.titulo, fontWeight: 800, fontSize: 64, color: C.tinta }}>{texto}</span>
    </div>
  );
};

/** "Todo lo confirmas con nosotros, rápido y en confianza": conversación que se arma sola. */
export const Confirma: React.FC<{ t: number; desde: number; hasta: number; rapido: number; confianza: number }> = ({ t, desde, hasta, rapido, confianza }) => {
  const escribe = t >= desde + 0.55 && t < desde + 1.25;
  const sale = prog(t, hasta - 0.3, hasta, easeIn);
  return (
    <AbsoluteFill style={{ opacity: 1 - sale, scale: String(1 - 0.05 * sale) }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "flex", flexDirection: "column", gap: 26 }}>
        <Burbuja t={t} desde={desde + 0.05} mia>
          ¿Está disponible para esas fechas?
        </Burbuja>
        {escribe ? (
          <Burbuja t={t} desde={desde + 0.55}>
            <div style={{ display: "flex", gap: 12, padding: "10px 4px" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 18, height: 18, borderRadius: "50%", background: "#8696a0", translate: `0 ${Math.sin((t - desde) * 12 - k * 0.9) * 7}px` }} />
              ))}
            </div>
          </Burbuja>
        ) : (
          <Burbuja t={t} desde={desde + 1.25}>
            ¡Hola! Sí, te confirmamos todo por aquí.
          </Burbuja>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", gap: 30, flexWrap: "wrap" }}>
        <Chip t={t} desde={rapido} color={C.sol} texto="Rápido" icono="M13 2 L4 14 h7 l-1 8 l9 -12 h-7 z" />
        <Chip t={t} desde={confianza} color={C.blanco} texto="En confianza" icono="M12 3 L20 6 V12 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 Z M9 12 l2 2 4 -4" />
      </div>
    </AbsoluteFill>
  );
};
