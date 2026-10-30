import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { evolvePath } from "@remotion/paths";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, sp } from "../comun/animacion";
import guionJson from "./guion.json";

// Reel Futbol Onze × Camis11 (brief-video-camis11.md): 30 s, 9:16, negro + rojo España + lima.
// Escenas, montaje de la música y efectos en guion.json (scripts/camis11/guion_camis11.py).

type Escena = { id: string; desde: number; hasta: number; foto?: string; titulo?: string; color?: string };
type Guion = { duracion: number; pulso: number; marcas: Record<string, number>; escenas: Escena[] };
export const GUION_CAMIS = guionJson as unknown as Guion;
const M = GUION_CAMIS.marcas;

export const K = { negro: "#0a0a0a", rojo: "#E30613", lima: "#D4FF00", blanco: "#ffffff", oro: "#f5c518" };
const W = 1080;
const H = 1920;

let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Anton", url: staticFile("camis11/fuentes/anton.woff2"), weight: "400" });
  loadFont({ family: "Bebas Neue", url: staticFile("camis11/fuentes/bebas.woff2"), weight: "400" });
};
const ANTON = '"Anton", Impact, sans-serif';
const BEBAS = '"Bebas Neue", Impact, sans-serif';

const recorte = (f: string) => staticFile(`camis11/recortes/${f}`);
const MURO = [
  "edicion-especial-inter-miami-x-capitan-america.png",
  "edicion-especial-camiseta-japon-x-doraemon.png",
  "2-estrellas-edicion-especial-espana-mundial-2026.png",
  "edicion-especial-camiseta-japon-samurai.png",
  "edicion-especial-real-madrid-x-balmain-blanca.png",
  "edicion-especial-camiseta-japon-x-levi-ackerman.png",
  "edicion-especial-japon-x-dragon-ball.png",
  "retro-espana-mundial-sudafrica-2010.png",
  "edicion-especial-japon-x-oliver-y-benji.png",
  "2-estrellas-camiseta-espana-2026-1a-equipacion.png",
  "edicion-especial-camiseta-japon-dbz-goku.png",
  "edicion-especial-real-madrid-x-balmain-negra.png",
];

/** Temblor de cámara que se apaga en `dur` segundos. */
const temblor = (t: number, t0: number, dur = 0.35, amp = 22) => {
  const d = t - t0;
  if (d < 0 || d > dur) return { x: 0, y: 0 };
  const k = (1 - d / dur) ** 2 * amp;
  return { x: Math.sin(d * 97) * k, y: Math.cos(d * 71) * k };
};

// ------------------------------------------------------------- texturas

/** Grano de película que cambia cada 2 cuadros. */
const Grano: React.FC<{ frame: number; opacidad?: number }> = ({ frame, opacidad = 0.12 }) => {
  const s = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("camis11/marca/grano.png")})`,
        backgroundPosition: `${(s * 137) % 512}px ${(s * 251) % 512}px`,
        mixBlendMode: "overlay",
        opacity: opacidad,
        pointerEvents: "none",
      }}
    />
  );
};

/** Franjas diagonales que corren (fondo). Capa más grande que el cuadro y girada: sin costuras. */
const Franjas: React.FC<{ t: number; color: string; opacidad?: number; vel?: number }> = ({ t, color, opacidad = 0.08, vel = 120 }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity: opacidad }}>
    <div
      style={{
        position: "absolute",
        left: -900,
        top: -900,
        width: W + 1800,
        height: H + 1800,
        rotate: "30deg",
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 40px, transparent 40px 120px)`,
        backgroundPosition: `${(t * vel) % 120}px 0`,
      }}
    />
  </AbsoluteFill>
);

const Destello: React.FC<{ t: number; t0: number; color?: string; dur?: number }> = ({ t, t0, color = "#ffffff", dur = 0.16 }) => {
  const k = 1 - prog(t, t0, t0 + dur, (x) => x);
  if (t < t0 || k <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: k * 0.85 }} />;
};

/** Camiseta recortada con sombra; entra con golpe de escala y giro. */
const Camiseta: React.FC<{ foto: string; t: number; t0: number; ancho: number; x?: number; y?: number; giro?: number; desde?: number }> = ({
  foto,
  t,
  t0,
  ancho,
  x = W / 2,
  y = 900,
  giro = -4,
  desde = 1.7,
}) => {
  const p = sp(t, t0, { damping: 13, stiffness: 190, mass: 0.7 });
  const flota = Math.sin((t - t0) * 2.2) * 10;
  return (
    <Img
      src={recorte(foto)}
      style={{
        position: "absolute",
        left: x - ancho / 2,
        top: y - ancho * 0.55 + flota,
        width: ancho,
        height: ancho * 1.1,
        objectFit: "contain",
        scale: String(lerp(desde, 1, p)),
        rotate: `${lerp(giro * 4, giro, p)}deg`,
        opacity: clamp01(p * 3),
        filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))",
      }}
    />
  );
};

/** Línea de texto Anton que sube palabra por palabra desde una máscara. */
const Linea: React.FC<{ texto: string; t: number; t0: number; tam: number; color?: string; paso?: number; borde?: boolean; mayus?: boolean }> = ({
  texto,
  t,
  t0,
  tam,
  color = K.blanco,
  paso = 0.07,
  borde,
  mayus = true,
}) => (
  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: tam * 0.22, overflow: "hidden", padding: `${tam * 0.04}px 0 ${tam * 0.1}px` }}>
    {texto.split(" ").map((w, i) => {
      const p = prog(t, t0 + i * paso, t0 + i * paso + 0.32, easeOut);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            fontFamily: ANTON,
            fontSize: tam,
            lineHeight: 1,
            color,
            textTransform: mayus ? "uppercase" : undefined,
            translate: `0 ${(1 - p) * tam * 1.5}px`,
            opacity: p > 0 ? 1 : 0,
            WebkitTextStroke: borde ? `${Math.max(3, tam * 0.025)}px ${K.negro}` : undefined,
            textShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {w}
        </span>
      );
    })}
  </div>
);

const Pastilla: React.FC<{ texto: string; t: number; t0: number; fondo: string; color: string; tam?: number; giro?: number }> = ({
  texto,
  t,
  t0,
  fondo,
  color,
  tam = 64,
  giro = 0,
}) => {
  const p = sp(t, t0, { damping: 10, stiffness: 230, mass: 0.6 });
  return (
    <div
      style={{
        display: "inline-block",
        background: fondo,
        color,
        fontFamily: BEBAS,
        fontSize: tam,
        letterSpacing: "0.06em",
        lineHeight: 1,
        padding: `${tam * 0.22}px ${tam * 0.45}px ${tam * 0.12}px`,
        borderRadius: 10,
        rotate: `${giro}deg`,
        scale: String(lerp(0.3, 1, p)),
        opacity: clamp01(p * 3),
        boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
      }}
    >
      {texto}
    </div>
  );
};

// ------------------------------------------------------------- escenas

/** Muro de camisetas en columnas que corren en sentidos opuestos. */
const Muro: React.FC<{ t: number; brillo: number; giro?: number; vel?: number; tam?: number }> = ({ t, brillo, giro = -12, vel = 260, tam = 300 }) => (
  <AbsoluteFill style={{ rotate: `${giro}deg`, scale: "1.35", filter: `brightness(${brillo}) saturate(1.1)` }}>
    {[0, 1, 2, 3].map((c) => {
      const dir = c % 2 ? 1 : -1;
      const desp = ((t * vel * dir) % (tam * 1.15 * 6)) - tam * 1.15 * 3;
      return (
        <div key={c} style={{ position: "absolute", left: -120 + c * (tam + 20), top: desp, display: "flex", flexDirection: "column", gap: 20 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <Img key={i} src={recorte(MURO[(i * 5 + c * 3) % MURO.length])} style={{ width: tam, height: tam * 1.1, objectFit: "contain" }} />
          ))}
        </div>
      );
    })}
  </AbsoluteFill>
);

const Gancho: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const apagon = t > e.hasta - 0.12;
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      {!apagon ? (
        <>
          <Muro t={t} brillo={0.32} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.85) 75%)" }} />
          <div style={{ position: "absolute", left: 50, right: 50, top: 640, textAlign: "center" }}>
            <Linea texto="¿Buscas la camiseta" t={t} t0={M.buscas} tam={120} paso={0.12} />
            <Linea texto="de tu equipo?" t={t} t0={M.buscas + 0.75} tam={170} color={K.lima} paso={0.12} />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Para: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const golpe = sp(t, M.para, { damping: 9, stiffness: 260, mass: 0.6 });
  const sube = prog(t, M.esto - 0.05, M.esto + 0.3, easeInOut);
  const sh = temblor(t, M.para, 0.4, 30);
  return (
    <AbsoluteFill style={{ background: K.negro, translate: `${sh.x}px ${sh.y}px` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, ${K.rojo} 0%, rgba(227,6,19,0.35) 35%, rgba(10,10,10,0) 70%)`, opacity: sube }} />
      <Franjas t={t} color={K.rojo} opacidad={0.12 * sube} />
      {t >= M.esto ? <Camiseta foto="edicion-especial-real-madrid-x-balmain-negra.png" t={t} t0={M.esto} ancho={760} y={880} giro={-5} /> : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lerp(680, 270, sube),
          textAlign: "center",
          fontFamily: ANTON,
          fontSize: lerp(380, 170, sube),
          lineHeight: 1,
          color: K.rojo,
          scale: String(lerp(2.2, 1, golpe)),
          textShadow: "0 10px 40px rgba(0,0,0,0.6)",
          WebkitTextStroke: sube > 0.5 ? `5px ${K.negro}` : undefined,
        }}
      >
        PARA.
      </div>
      {t >= M.esto ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: 1300, textAlign: "center" }}>
          <Linea texto="Esto no es una" t={t} t0={M.esto + 0.05} tam={96} />
          <Linea texto="tienda cualquiera" t={t} t0={M.esto + 0.45} tam={128} color={K.lima} />
        </div>
      ) : null}
      <Destello t={t} t0={e.desde} />
    </AbsoluteFill>
  );
};

const Catalogo: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const n = Math.round(lerp(0, 1200, prog(t, e.desde + 0.05, e.desde + 1.1, easeOut)));
  const panel = sp(t, e.desde, { damping: 14, stiffness: 180 });
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <Muro t={t} brillo={0.7} vel={420} tam={280} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.75) 38%, rgba(10,10,10,0.75) 66%, rgba(10,10,10,0.1) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", scale: String(lerp(0.6, 1, panel)), opacity: clamp01(panel * 2) }}>
        <div style={{ fontFamily: ANTON, fontSize: 300, lineHeight: 1, color: K.lima, textShadow: "0 10px 50px rgba(0,0,0,0.6)" }}>
          +{n >= 1000 ? `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, "0")}` : n}
        </div>
        <Linea texto="camisetas" t={t} t0={e.desde + 0.3} tam={130} />
        <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 30 }}>
          <Pastilla texto="CLUBES" t={t} t0={M.mil + 1.25} fondo={K.rojo} color={K.blanco} tam={76} />
          <Pastilla texto="SELECCIONES" t={t} t0={M.mil + 1.75} fondo={K.blanco} color={K.negro} tam={76} />
        </div>
      </div>
      <Destello t={t} t0={e.desde} color={K.lima} dur={0.12} />
    </AbsoluteFill>
  );
};

// Línea de tiempo de las retro: los años se encienden uno a uno mientras avanza el progreso.
const HITOS = ["’98", "’02", "’08", "’10", "HOY"];

const Retro: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const x0 = 130;
  const x1 = 950;
  const y = 1600;
  const avance = prog(t, e.desde + 0.35, e.desde + 1.55, easeInOut);
  const xs = HITOS.map((_, i) => lerp(x0, x1, i / (HITOS.length - 1)));
  const entra = prog(t, e.desde + 0.2, e.desde + 0.5, easeOut);
  return (
    <AbsoluteFill style={{ background: K.rojo }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.22) 3px, transparent 3.5px)", backgroundSize: "26px 26px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,214,0,0.35) 0%, rgba(227,6,19,0) 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <Linea texto="Retro" t={t} t0={e.desde} tam={300} borde />
      </div>
      <Camiseta foto="retro-espana-mundial-sudafrica-2010.png" t={t} t0={e.desde + 0.1} ancho={680} y={980} giro={4} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: entra }}>
        {/* Riel y progreso. */}
        <line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(0,0,0,0.35)" strokeWidth={14} strokeLinecap="round" />
        <line x1={x0} y1={y} x2={lerp(x0, x1, avance)} y2={y} stroke={K.blanco} strokeWidth={14} strokeLinecap="round" />
        {xs.map((x, i) => {
          const llega = avance >= i / (HITOS.length - 1) - 0.001;
          const k = llega ? sp(t, e.desde + 0.35 + (1.2 * i) / (HITOS.length - 1), { damping: 9, stiffness: 260, mass: 0.5 }) : 0;
          const ultimo = i === HITOS.length - 1;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={26} fill={K.rojo} stroke="rgba(0,0,0,0.35)" strokeWidth={8} />
              <circle r={lerp(0, ultimo ? 30 : 24, k)} fill={ultimo ? K.lima : K.blanco} stroke={K.negro} strokeWidth={ultimo ? 5 : 0} />
            </g>
          );
        })}
      </svg>
      {xs.map((x, i) => {
        const k = prog(t, e.desde + 0.35 + (1.2 * i) / (HITOS.length - 1) - 0.05, e.desde + 0.35 + (1.2 * i) / (HITOS.length - 1) + 0.15, easeOut);
        const ultimo = i === HITOS.length - 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 110,
              width: 220,
              top: y - (ultimo ? 175 : 140),
              textAlign: "center",
              fontFamily: ANTON,
              fontSize: ultimo ? 120 : 84,
              lineHeight: 1,
              color: ultimo ? K.lima : K.blanco,
              WebkitTextStroke: ultimo ? `4px ${K.negro}` : undefined,
              textShadow: "0 6px 20px rgba(0,0,0,0.35)",
              opacity: k,
              translate: `0 ${(1 - k) * 30}px`,
            }}
          >
            {HITOS[i]}
          </div>
        );
      })}
      <Destello t={t} t0={e.desde} />
    </AbsoluteFill>
  );
};

const Especial: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const color = e.color ?? K.lima;
  const g = prog(t, e.desde, e.desde + 0.2, (x) => x);
  const fondo =
    e.titulo === "DRAGON BALL"
      ? `radial-gradient(circle at 50% 45%, #ffb000 0%, #ff5a00 35%, #3a0a00 80%)`
      : e.titulo === "OLIVER Y BENJI"
        ? `radial-gradient(circle at 50% 45%, #2a6bd6 0%, #0b1f4d 70%)`
        : `radial-gradient(circle at 50% 45%, #2a2a2a 0%, ${K.negro} 70%)`;
  return (
    <AbsoluteFill style={{ background: fondo }}>
      {/* Líneas de velocidad tipo manga. */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i / 40) * Math.PI * 2 + t * 0.4;
          return <line key={i} x1={540 + Math.cos(a) * 380} y1={880 + Math.sin(a) * 380} x2={540 + Math.cos(a) * 1600} y2={880 + Math.sin(a) * 1600} stroke="white" strokeWidth={i % 3 ? 4 : 10} />;
        })}
      </svg>
      {/* Separación RGB al entrar. */}
      {g < 1
        ? [-1, 1].map((s) => (
            <Img
              key={s}
              src={recorte(e.foto ?? "")}
              style={{
                position: "absolute",
                left: W / 2 - 400 + s * 40 * (1 - g),
                top: 880 - 440,
                width: 800,
                height: 880,
                objectFit: "contain",
                opacity: 0.5 * (1 - g),
                filter: s < 0 ? "drop-shadow(0 0 0 red) hue-rotate(-40deg)" : "hue-rotate(160deg)",
                mixBlendMode: "screen",
              }}
            />
          ))
        : null}
      <Camiseta foto={e.foto ?? ""} t={t} t0={e.desde} ancho={800} y={880} giro={e.titulo === "OLIVER Y BENJI" ? 4 : -4} desde={1.9} />
      <div style={{ position: "absolute", left: 30, right: 30, top: 1370, textAlign: "center" }}>
        <Pastilla texto="EDICIÓN ESPECIAL" t={t} t0={e.desde + 0.08} fondo={K.lima} color={K.negro} tam={58} />
        <div style={{ height: 18 }} />
        <Linea texto={e.titulo ?? ""} t={t} t0={e.desde + 0.05} tam={e.titulo && e.titulo.length > 14 ? 110 : 150} color={color} paso={0.05} borde />
      </div>
      <Destello t={t} t0={e.desde} dur={0.1} />
    </AbsoluteFill>
  );
};

const ESTRELLA = "M0 -50 L14 -16 L50 -15 L22 8 L31 44 L0 24 L-31 44 L-22 8 L-50 -15 L-14 -16 Z";

const Estrellas: React.FC<{ t: number; e: Escena }> = ({ t, e }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #ff2a2a 0%, ${K.rojo} 30%, #5a0006 85%)` }}>
    <Franjas t={t} color="#000" opacidad={0.12} vel={60} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
      <Linea texto="La Roja" t={t} t0={e.desde + 0.05} tam={230} borde />
    </div>
    <Camiseta foto="2-estrellas-camiseta-espana-2026-1a-equipacion.png" t={t} t0={e.desde} ancho={720} y={1010} giro={-3} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {[0, 1].map((i) => {
        const p = sp(t, M.estrellas + i * 0.15, { damping: 9, stiffness: 240, mass: 0.6 });
        const brillo = prog(t, M.estrellas + i * 0.15, M.estrellas + i * 0.15 + 0.6);
        return (
          <g key={i} transform={`translate(${470 + i * 140} 560) scale(${lerp(0, 1.5, p)}) rotate(${(1 - p) * 90})`}>
            <circle r={90 * brillo} fill="none" stroke={K.oro} strokeWidth={6 * (1 - brillo)} opacity={1 - brillo} />
            <path d={ESTRELLA} fill={K.oro} stroke="#fff3b0" strokeWidth={3} />
          </g>
        );
      })}
    </svg>
    <div style={{ position: "absolute", left: 30, right: 30, top: 1480, textAlign: "center" }}>
      <Linea texto="Dos estrellas" t={t} t0={M.estrellas} tam={150} color={K.lima} borde />
    </div>
    <Destello t={t} t0={e.desde} />
  </AbsoluteFill>
);

const Envio: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const arco = prog(t, e.desde + 0.1, e.desde + 1.1, easeInOut);
  const d = "M 230 870 C 380 490, 700 490, 850 750";
  const giro = (t - e.desde) * 40;
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <Franjas t={t} color={K.lima} opacidad={0.06} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(540 810)">
          <circle r={330} fill="none" stroke={K.lima} strokeWidth={8} />
          {[-60, -30, 0, 30, 60].map((lat) => (
            <ellipse key={lat} rx={330 * Math.cos((lat * Math.PI) / 180)} ry={22} cy={330 * Math.sin((lat * Math.PI) / 180)} fill="none" stroke={K.lima} strokeWidth={3} opacity={0.5} />
          ))}
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} rx={Math.abs(330 * Math.cos(((giro + k * 45) * Math.PI) / 180))} ry={330} fill="none" stroke={K.lima} strokeWidth={3} opacity={0.5} />
          ))}
        </g>
        <path d={d} stroke={K.blanco} strokeWidth={8} fill="none" strokeDasharray="22 18" opacity={0.9} />
      </svg>
      {(() => {
        const tt = arco;
        // Avión sobre la curva (punto aproximado por Bézier).
        const bx = (u: number) => (1 - u) ** 3 * 230 + 3 * (1 - u) ** 2 * u * 380 + 3 * (1 - u) * u * u * 700 + u ** 3 * 850;
        const by = (u: number) => (1 - u) ** 3 * 870 + 3 * (1 - u) ** 2 * u * 490 + 3 * (1 - u) * u * u * 490 + u ** 3 * 750;
        const ang = (Math.atan2(by(tt + 0.01) - by(tt), bx(tt + 0.01) - bx(tt)) * 180) / Math.PI;
        return (
          <svg width={110} height={110} viewBox="0 0 24 24" style={{ position: "absolute", left: bx(tt) - 55, top: by(tt) - 55, rotate: `${ang + 45}deg` }}>
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill={K.blanco} />
          </svg>
        );
      })()}
      <div style={{ position: "absolute", left: 30, right: 30, top: 1190, textAlign: "center" }}>
        <Linea texto="Envío gratis" t={t} t0={e.desde + 0.05} tam={170} color={K.lima} />
        <Linea texto="a todo el mundo" t={t} t0={e.desde + 0.45} tam={84} />
      </div>
      <Destello t={t} t0={e.desde} color={K.lima} dur={0.1} />
    </AbsoluteFill>
  );
};

const Devoluciones: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const aro = prog(t, e.desde + 0.1, e.desde + 0.9, easeInOut);
  const r = 300;
  const d = `M ${540} ${880 - r} A ${r} ${r} 0 1 1 ${539} ${880 - r}`;
  const p = evolvePath(Math.max(0.001, aro), d);
  const n = sp(t, e.desde, { damping: 10, stiffness: 220, mass: 0.6 });
  return (
    <AbsoluteFill style={{ background: K.rojo }}>
      <Franjas t={t} color="#000" opacidad={0.12} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={d} stroke={K.blanco} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
        <path d="M 500 545 L 545 580 L 500 615" stroke={K.blanco} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={aro > 0.97 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: ANTON, fontSize: 380, lineHeight: 1, color: K.blanco, scale: String(lerp(0.3, 1, n)) }}>
        30
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center" }}>
        <Linea texto="días" t={t} t0={e.desde + 0.15} tam={110} color={K.lima} borde />
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 1330, textAlign: "center" }}>
        <Linea texto="Devoluciones gratis" t={t} t0={e.desde + 0.1} tam={120} borde />
      </div>
      <Destello t={t} t0={e.desde} dur={0.1} />
    </AbsoluteFill>
  );
};

const Personaliza: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const nombre = "TU NOMBRE";
  const letras = Math.floor(clamp01((t - M.nombre) / 0.55) * nombre.length);
  const num = t >= M.nombre + 0.75 ? sp(t, M.nombre + 0.75, { damping: 10, stiffness: 230, mass: 0.6 }) : 0;
  const cursor = Math.floor(t * 3) % 2 === 0 && letras < nombre.length && t >= M.nombre - 0.3;
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(212,255,0,0.18) 0%, rgba(10,10,10,0) 60%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <Linea texto="Personalízala" t={t} t0={e.desde + 0.05} tam={150} color={K.lima} />
      </div>
      <Camiseta foto="espana-2026-espalda.png" t={t} t0={e.desde} ancho={780} y={1020} giro={0} desde={1.3} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 760,
          textAlign: "center",
          fontFamily: ANTON,
          fontSize: 74,
          letterSpacing: "0.06em",
          color: K.oro,
          textShadow: "0 2px 0 rgba(0,0,0,0.35)",
        }}
      >
        {nombre.slice(0, letras)}
        <span style={{ opacity: cursor ? 1 : 0, color: K.blanco }}>|</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 840,
          textAlign: "center",
          fontFamily: ANTON,
          fontSize: 330,
          lineHeight: 1,
          color: K.oro,
          scale: String(lerp(2, 1, num)),
          opacity: clamp01(num * 3),
          textShadow: "0 4px 0 rgba(0,0,0,0.35)",
        }}
      >
        11
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 1500, textAlign: "center" }}>
        <Linea texto="Con tu nombre y tu número" t={t} t0={M.nombre - 0.3} tam={80} />
      </div>
      <Destello t={t} t0={e.desde} dur={0.1} />
    </AbsoluteFill>
  );
};

const PENTAGONO = (r: number) =>
  Array.from({ length: 5 }, (_, k) => {
    const a = ((-90 + k * 72) * Math.PI) / 180;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

/** Balón clásico de parches (blanco y negro). */
const Balon: React.FC<{ r: number; giro: number }> = ({ r, giro }) => (
  <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={{ overflow: "visible" }}>
    <defs>
      <clipPath id="balon">
        <circle r={98} />
      </clipPath>
      <radialGradient id="luz" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#e8e8e8" />
        <stop offset="100%" stopColor="#9a9a9a" />
      </radialGradient>
    </defs>
    <circle r={98} fill="url(#luz)" />
    <g clipPath="url(#balon)" transform={`rotate(${giro})`}>
      <polygon points={PENTAGONO(30)} fill="#111" />
      {[0, 1, 2, 3, 4].map((k) => {
        const a = ((-90 + k * 72) * Math.PI) / 180;
        return (
          <g key={k}>
            <line x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 66} y2={Math.sin(a) * 66} stroke="#111" strokeWidth={5} />
            <polygon points={PENTAGONO(28)} fill="#111" transform={`translate(${Math.cos(a) * 92} ${Math.sin(a) * 92}) rotate(${k * 72 + 36})`} />
          </g>
        );
      })}
    </g>
    <circle r={98} fill="none" stroke="#222" strokeWidth={4} />
  </svg>
);

/** Grietas que salen del punto del impacto, como si el balón rompiera la pantalla. */
const Grietas: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const k = prog(t, t0, t0 + 0.12, easeOut);
  const se = 1 - 0.5 * prog(t, t0 + 0.6, t0 + 1.6);
  const rayos = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + (i % 2 ? 0.17 : -0.11);
    const largo = 420 + ((i * 137) % 5) * 130;
    let d = `M ${x} ${y}`;
    for (let s = 1; s <= 5; s++) {
      const r = (largo * s) / 5;
      const desvio = (s % 2 ? 1 : -1) * (14 + ((i * 31 + s * 17) % 23));
      d += ` L ${x + Math.cos(a) * r - Math.sin(a) * desvio} ${y + Math.sin(a) * r + Math.cos(a) * desvio}`;
    }
    return d;
  });
  const aro = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const r = 150 + ((i * 53) % 4) * 18;
    return `${x + Math.cos(a) * r},${y + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: se }}>
      {rayos.map((d, i) => {
        const p = evolvePath(Math.max(0.001, k), d);
        return (
          <g key={i}>
            <path d={d} stroke="rgba(0,0,0,0.55)" strokeWidth={9} fill="none" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
            <path d={d} stroke="rgba(255,255,255,0.95)" strokeWidth={3.5} fill="none" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
          </g>
        );
      })}
      <polygon points={aro} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.9)" strokeWidth={3} opacity={k} />
    </svg>
  );
};

const Codigo: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const codigo = "CAMIS11";
  const letras = Math.floor(clamp01((t - (e.desde + 0.35)) / 0.75) * codigo.length);
  const ticket = sp(t, e.desde + 0.05, { damping: 12, stiffness: 200, mass: 0.7 });
  // El balón sale de abajo, viene hacia la cámara y golpea la pantalla en M.diez.
  const impacto = M.diez;
  const patada = impacto - 0.5;
  const vuelo = clamp01((t - patada) / (impacto - patada));
  const bx = lerp(860, 540, easeOut(vuelo));
  const by = lerp(1780, 1150, easeOut(vuelo)) - Math.sin(vuelo * Math.PI) * 220;
  const br = lerp(28, 260, Math.pow(vuelo, 2.2));
  const golpe = sp(t, impacto, { damping: 8, stiffness: 260, mass: 0.6 });
  const sh = temblor(t, impacto, 0.45, 34);
  const sh0 = temblor(t, e.desde, 0.3, 30);
  return (
    <AbsoluteFill style={{ background: K.lima, translate: `${sh.x + sh0.x}px ${sh.y + sh0.y}px` }}>
      <Franjas t={t} color="#000" opacidad={0.1} vel={260} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: BEBAS, fontSize: 110, letterSpacing: "0.2em", color: K.negro }}>
        CÓDIGO
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 560,
          height: 330,
          background: K.negro,
          borderRadius: 40,
          border: `8px dashed ${K.lima}`,
          outline: `8px solid ${K.negro}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(lerp(0.4, 1, ticket)),
          rotate: `${(1 - ticket) * -10}deg`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontFamily: ANTON, fontSize: 210, lineHeight: 1, color: K.lima, letterSpacing: "0.02em" }}>
          {codigo.slice(0, letras)}
          <span style={{ opacity: letras < codigo.length && Math.floor(t * 4) % 2 === 0 ? 1 : 0, color: K.blanco }}>|</span>
        </span>
      </div>
      {t >= impacto ? <Grietas t={t} t0={impacto} x={540} y={1150} /> : null}
      {t >= impacto ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: K.rojo,
              color: K.blanco,
              fontFamily: ANTON,
              fontSize: 200,
              lineHeight: 1,
              padding: "20px 50px 30px",
              borderRadius: 24,
              scale: String(lerp(0.15, 1, golpe)),
              opacity: clamp01(golpe * 4),
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            }}
          >
            -10% EXTRA
          </div>
        </div>
      ) : null}
      {t >= patada && t < impacto ? (
        <div style={{ position: "absolute", left: bx - br, top: by - br, filter: `drop-shadow(0 ${br * 0.3}px ${br * 0.3}px rgba(0,0,0,0.4)) blur(${(vuelo * 2).toFixed(1)}px)` }}>
          <Balon r={br} giro={vuelo * 720} />
        </div>
      ) : null}
      {/* Confeti que sale del impacto. */}
      {t >= impacto ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 60 }, (_, i) => {
            const d = t - impacto;
            const ang = (i / 60) * Math.PI * 2 + i;
            const v = 900 + (i % 7) * 160;
            const x = 540 + Math.cos(ang) * v * d;
            const y = 1150 + Math.sin(ang) * v * d + 1400 * d * d;
            const c = [K.rojo, K.negro, K.blanco][i % 3];
            return <rect key={i} x={x} y={y} width={22} height={12} fill={c} transform={`rotate(${d * 600 + i * 40} ${x} ${y})`} opacity={clamp01(1.6 - d)} />;
          })}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1380, textAlign: "center" }}>
        <Linea texto="Solo para la comunidad" t={t} t0={impacto + 0.6} tam={70} color={K.negro} />
        <Linea texto="Futbol Onze" t={t} t0={impacto + 0.9} tam={110} color={K.negro} />
      </div>
      <Destello t={t} t0={impacto} dur={0.14} />
      <Destello t={t} t0={e.desde} dur={0.14} />
    </AbsoluteFill>
  );
};

// Captura real de camis11.com (vista de celular, 1075 × 2330). Se tapan la franja con
// "+1.000 clientes satisfechos" y los precios (el brief pide no usarlos).
const Web: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const tel = sp(t, e.desde, { damping: 15, stiffness: 140 });
  const ancho = 600;
  const s = ancho / 1075;
  const alto = 2330 * s;
  const url = "camis11.com";
  const escritas = Math.floor(clamp01((t - M.web) / 0.45) * url.length);
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <Franjas t={t} color={K.rojo} opacidad={0.1} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center", opacity: clamp01(tel * 2) }}>
        <div style={{ background: K.blanco, borderRadius: 999, padding: "18px 44px", fontFamily: BEBAS, fontSize: 80, letterSpacing: "0.04em", color: K.negro, minWidth: 520, textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
          {url.slice(0, escritas) || " "}
          <span style={{ opacity: escritas < url.length && Math.floor(t * 4) % 2 === 0 ? 1 : 0 }}>|</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: W / 2 - ancho / 2 - 18,
          top: 380,
          width: ancho + 36,
          height: 1180,
          borderRadius: 70,
          background: "#111",
          padding: 18,
          boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 3px #333",
          translate: `0 ${(1 - tel) * 1400}px`,
          rotate: `${(1 - tel) * 8}deg`,
        }}
      >
        <div style={{ position: "relative", width: ancho, height: 1144, borderRadius: 54, overflow: "hidden", background: "#1b1b1b" }}>
          <div style={{ position: "absolute", left: 0, top: -prog(t, e.desde + 0.3, e.hasta, easeInOut) * 120, width: ancho, height: alto }}>
            <Img src={staticFile("camis11/marca/web-portada.png")} style={{ width: ancho, height: alto }} />
            {/* Tapa "+1.000 clientes satisfechos" con los datos que sí se pueden decir. */}
            <div style={{ position: "absolute", left: 0, top: 880 * s, width: ancho, height: 240 * s, background: "#1b1b1b", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: BEBAS, fontSize: 40, color: K.blanco, letterSpacing: "0.03em" }}>
              ENVÍO GRATIS · DEVOLUCIONES 30 DÍAS
            </div>
            {/* Tapa los precios. */}
            <div style={{ position: "absolute", left: 0, top: 2070 * s, width: ancho, height: 70 * s, background: "#1b1b1b" }} />
          </div>
        </div>
      </div>
      <Destello t={t} t0={e.desde} dur={0.1} />
    </AbsoluteFill>
  );
};

/** Bandera rojigualda que ondea (franjas con borde en onda y pliegues de luz y sombra). */
const Bandera: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const entra = prog(t, t0, t0 + 0.35, easeOut);
  const borde = (y0: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= W + 40; x += 20) pts.push(`${x} ${(y0 + 34 * Math.sin(x / 170 - t * 3.2)).toFixed(1)}`);
    return pts;
  };
  const sup = borde(480);
  const inf = borde(1440).reverse();
  const franja = `M ${sup.join(" L ")} L ${inf.join(" L ")} Z`;
  return (
    <AbsoluteFill style={{ background: K.rojo, translate: `0 ${(1 - entra) * 200}px`, opacity: entra }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={franja} fill="#FFC400" />
      </svg>
      {/* Pliegues: bandas de luz y sombra que corren con la onda. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0) 180px, rgba(255,255,255,0.14) 300px, rgba(0,0,0,0) 420px, rgba(0,0,0,0.22) 534px)",
          backgroundPosition: `${(t * 170 * 3.2) % 534}px 0`,
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

const Lema: React.FC<{ t: number; e: Escena }> = ({ t, e }) => (
  <AbsoluteFill style={{ background: K.negro }}>
    <Bandera t={t} t0={e.desde} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 590, textAlign: "center" }}>
      <Linea texto="En Camis11" t={t} t0={e.desde + 0.1} tam={150} color={K.negro} />
      <Linea texto="vivimos el fútbol" t={t} t0={e.desde + 0.5} tam={130} color={K.negro} />
      <Linea texto="como tú" t={t} t0={e.desde + 1.05} tam={240} color={K.rojo} />
    </div>
    <Destello t={t} t0={e.desde} dur={0.1} />
  </AbsoluteFill>
);

const Cierre: React.FC<{ t: number; e: Escena }> = ({ t, e }) => {
  const a = sp(t, e.desde, { damping: 12, stiffness: 180 });
  const b = sp(t, e.desde + 0.2, { damping: 12, stiffness: 180 });
  const x = sp(t, e.desde + 0.1, { damping: 9, stiffness: 240, mass: 0.6 });
  const rayos = (t - e.desde) * 10;
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        {Array.from({ length: 18 }, (_, i) => {
          const ang = ((i * 20 + rayos) * Math.PI) / 180;
          return <path key={i} d={`M 540 760 L ${540 + Math.cos(ang) * 1500} ${760 + Math.sin(ang) * 1500} L ${540 + Math.cos(ang + 0.08) * 1500} ${760 + Math.sin(ang + 0.08) * 1500} Z`} fill={K.lima} />;
        })}
      </svg>
      <Img
        src={staticFile("camis11/marca/futbolonze-circulo.png")}
        style={{ position: "absolute", left: 90, top: 560, width: 380, height: 380, scale: String(lerp(0.2, 1, a)), rotate: `${(1 - a) * -90}deg` }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: ANTON, fontSize: 150, color: K.blanco, lineHeight: 1, scale: String(lerp(0, 1, x)) }}>
        ×
      </div>
      <Img
        src={staticFile("camis11/marca/logo-camis11-2.png")}
        style={{ position: "absolute", right: 50, top: 630, width: 440, height: 243, objectFit: "contain", scale: String(lerp(0.2, 1, b)), opacity: clamp01(b * 2) }}
      />
      <div style={{ position: "absolute", left: 40, right: 40, top: 1060, textAlign: "center" }}>
        <Pastilla texto="CÓDIGO CAMIS11 PARA UN 10%" t={t} t0={e.desde + 0.45} fondo={K.lima} color={K.negro} tam={80} />
        <div style={{ height: 40 }} />
        <Linea texto="camis11.com" t={t} t0={e.desde + 0.7} tam={120} mayus={false} />
      </div>
      <Destello t={t} t0={e.desde} />
    </AbsoluteFill>
  );
};

const ESCENAS: Record<string, React.FC<{ t: number; e: Escena }>> = {
  gancho: Gancho,
  para: Para,
  catalogo: Catalogo,
  retro: Retro,
  especial: Especial,
  estrellas: Estrellas,
  envio: Envio,
  devoluciones: Devoluciones,
  personaliza: Personaliza,
  codigo: Codigo,
  web: Web,
  lema: Lema,
  cierre: Cierre,
};

export type PropsCamis = { audio: string | null; publi: boolean };

export const ReelCamis11: React.FC<PropsCamis> = ({ audio, publi }) => {
  cargar();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const e = GUION_CAMIS.escenas.find((x) => t >= x.desde && t < x.hasta) ?? GUION_CAMIS.escenas[GUION_CAMIS.escenas.length - 1];
  const Comp = ESCENAS[e.id];
  // Golpe de zoom en cada corte.
  const golpe = 1 + 0.08 * (1 - prog(t, e.desde, e.desde + 0.25, easeOut));
  const salida = prog(t, GUION_CAMIS.duracion - 0.4, GUION_CAMIS.duracion, easeIn);
  return (
    <AbsoluteFill style={{ background: K.negro, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(golpe) }}>
        <Comp t={t} e={e} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <Grano frame={frame} />
      {publi ? (
        <div
          style={{
            position: "absolute",
            right: 50,
            top: 70,
            fontFamily: BEBAS,
            fontSize: 38,
            letterSpacing: "0.12em",
            color: K.blanco,
            background: "rgba(0,0,0,0.45)",
            border: "2px solid rgba(255,255,255,0.5)",
            borderRadius: 10,
            padding: "8px 16px 4px",
          }}
        >
          PUBLI
        </div>
      ) : null}
      <AbsoluteFill style={{ background: K.negro, opacity: salida }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Miniatura: "ESTO NO ES UNA CAMISETA NORMAL" con la Balmain y el código. */
export const PortadaCamis11: React.FC = () => {
  cargar();
  return (
    <AbsoluteFill style={{ background: K.negro }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${K.rojo} 0%, rgba(227,6,19,0.3) 40%, rgba(10,10,10,0) 72%)` }} />
      <Franjas t={0} color={K.rojo} opacidad={0.12} />
      <Img src={recorte("edicion-especial-real-madrid-x-balmain-negra.png")} style={{ position: "absolute", left: 160, top: 560, width: 760, height: 836, objectFit: "contain", rotate: "-5deg", filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))" }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", fontFamily: ANTON, lineHeight: 1, textTransform: "uppercase" }}>
        <div style={{ fontSize: 150, color: K.blanco }}>Esto no es una</div>
        <div style={{ fontSize: 190, color: K.lima, WebkitTextStroke: `5px ${K.negro}` }}>camiseta normal</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, display: "flex", justifyContent: "center" }}>
        <div style={{ background: K.lima, color: K.negro, fontFamily: ANTON, fontSize: 110, padding: "16px 44px 24px", borderRadius: 18, rotate: "-4deg" }}>CAMIS11 · -10%</div>
      </div>
      <Img src={staticFile("camis11/marca/futbolonze-circulo.png")} style={{ position: "absolute", left: 60, top: 1640, width: 200, height: 200 }} />
    </AbsoluteFill>
  );
};
