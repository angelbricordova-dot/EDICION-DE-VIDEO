import React from "react";
import { AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";
import { GUION_PULPO, Palabra, Rotulo } from "./Short";

// Versión con metraje real (NOAA Ocean Exploration, dominio público) del short del pulpo,
// más cercana a la referencia "Orcas are scared of this animal": tomas reales del fondo
// marino, grado azul, rayos X con los corazones dentro del manto, ventana del corazón que
// se detiene y caída al fondo. Mismos tiempos que la versión animada (src/pulpo/guion.json).

const M = GUION_PULPO.marcas;
const W = 1080;
const H = 1920;

let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Luckiest Guy", url: staticFile("pulpo/fuentes/luckiest.woff2"), weight: "400" });
};

const latido = (t: number, bpm: number, fase = 0) => 1 + 0.14 * Math.pow(Math.max(0, Math.sin((2 * Math.PI * (t * bpm)) / 60 + fase)), 6);

// ------------------------------------------------------------- tomas

type Encuadre = { t: number; x: number; y: number; zoom: number };

const enc = (claves: Encuadre[], t: number) => {
  if (t <= claves[0].t) return claves[0];
  for (let i = 0; i < claves.length - 1; i++) {
    const a = claves[i];
    const b = claves[i + 1];
    if (t < b.t) {
      const k = easeInOut(clamp01((t - a.t) / (b.t - a.t)));
      return { t, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: lerp(a.zoom, b.zoom, k) };
    }
  }
  return claves[claves.length - 1];
};

/**
 * Clip horizontal recortado a 9:16 siguiendo un punto (x, y en 0..1 del cuadro fuente) con zoom.
 * `desde`: cuándo empieza en el video; `inicio`: segundo del clip; `rate`: velocidad.
 */
const Toma: React.FC<{ src: string; ancho: number; alto: number; desde: number; inicio?: number; rate?: number; claves: Encuadre[]; t: number; filtro?: string }> = ({
  src,
  ancho,
  alto,
  desde,
  inicio = 0,
  rate = 1,
  claves,
  t,
  filtro,
}) => {
  const e = enc(claves, t - desde);
  const s = Math.max(W / ancho, H / alto) * e.zoom;
  const w = ancho * s;
  const h = alto * s;
  const left = Math.min(0, Math.max(W - w, W / 2 - e.x * w));
  const top = Math.min(0, Math.max(H - h, H / 2 - e.y * h));
  return (
    <Sequence from={Math.round(desde * FPS)} layout="none">
      <OffthreadVideo
        src={staticFile(`pulpo/clips/${src}`)}
        startFrom={Math.round(inicio * FPS)}
        playbackRate={rate}
        muted
        style={{ position: "absolute", left, top, width: w, height: h, filter: filtro ?? GRADO }}
      />
    </Sequence>
  );
};

// Grado azul de mar profundo (la referencia es azul; el metraje de NOAA es verdoso).
const GRADO = "hue-rotate(-14deg) saturate(1.2) contrast(1.08) brightness(1.06)";
const Azul: React.FC<{ fuerza?: number }> = ({ fuerza = 1 }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1a6fa8 0%, #0a4a7a 60%, #04284a 100%)", mixBlendMode: "soft-light", opacity: 0.6 * fuerza }} />
    <AbsoluteFill style={{ background: "rgba(20,90,150,0.12)", mixBlendMode: "multiply", opacity: fuerza }} />
  </>
);

// ------------------------------------------------------------- piezas sobre el metraje

const CORAZON = staticFile("pulpo/fotos/corazon.png");

const Corazon: React.FC<{ x: number; y: number; alto: number; escala: number; gris?: number; brillo?: string }> = ({ x, y, alto, escala, gris = 0, brillo = "rgba(255,60,80,0.75)" }) => (
  <Img
    src={CORAZON}
    style={{
      position: "absolute",
      left: x - (alto * 0.724) / 2,
      top: y - alto / 2,
      height: alto,
      width: alto * 0.724,
      scale: String(escala),
      filter: `grayscale(${gris}) brightness(${1 + gris * 0.25}) drop-shadow(0 0 ${18 + 10 * (escala - 1) * 10}px ${gris > 0.5 ? "rgba(190,230,255,0.8)" : brillo}) drop-shadow(0 12px 18px rgba(0,0,0,0.5))`,
    }}
  />
);

/** Ráfaga de "pop" cuando aparece algo. */
const Estallido: React.FC<{ t: number; t0: number; x: number; y: number; color?: string }> = ({ t, t0, x, y, color = "#ffffff" }) => {
  const d = t - t0;
  if (d < 0 || d > 0.45) return null;
  const k = d / 0.45;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r0 = 60 + k * 90;
        const r1 = r0 + 40 * (1 - k);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={9 * (1 - k)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Flujo de sangre: trazo azul brillante con guiones que corren y punta de flecha. */
const Flujo: React.FC<{ d: string; t: number; o: number; fin: [number, number]; dir: [number, number] }> = ({ d, t, o, fin, dir }) => {
  if (o <= 0) return null;
  const a = Math.atan2(fin[1] - dir[1], fin[0] - dir[0]);
  const p = (r: number, g: number) => `${(fin[0] + Math.cos(a + g) * r).toFixed(1)},${(fin[1] + Math.sin(a + g) * r).toFixed(1)}`;
  return (
    <g opacity={o}>
      <path d={d} stroke="rgba(80,190,255,0.35)" strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#5fd0ff" strokeWidth={13} fill="none" strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-t * 170} />
      <polygon points={`${p(18, 0)} ${p(34, Math.PI * 0.8)} ${p(34, -Math.PI * 0.8)}`} fill="#5fd0ff" stroke="#0d4d7a" strokeWidth={3} />
    </g>
  );
};

// Manto del pulpo en la toma de rayos X (coordenadas de pantalla, encuadre fijo x = 0.22).
const MANTO = { cx: 410, cy: 1000, rx: 470, ry: 600 };
const POS = {
  sistemico: { x: 420, y: 860 },
  branqIzq: { x: 215, y: 1150 },
  branqDer: { x: 640, y: 1160 },
  branquiaIzq: { x: 70, y: 1330 },
  branquiaDer: { x: 820, y: 1340 },
};

const RayosX: React.FC<{ t: number }> = ({ t }) => {
  const on = prog(t, M.rayosx, M.rayosx + 0.35, easeOut) * (1 - prog(t, M.nada - 0.12, M.nada, easeIn));
  if (on <= 0.001) return null;
  const c = (t0: number) => sp(t, t0, { damping: 9, stiffness: 230, mass: 0.6 });
  const dos = M.dos + 0.25;
  const cI = c(dos);
  const cD = c(dos + 0.12);
  const cS = c(M.uno);
  const fB = prog(t, M.dos + 0.6, M.dos + 1.1);
  const fC = prog(t, M.uno + 0.25, M.uno + 0.7);
  const barrido = ((t - M.rayosx) * 0.9) % 1;
  return (
    <AbsoluteFill style={{ opacity: on }}>
      {/* El resto del cuadro se oscurece; el manto se ilumina como una radiografía. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${MANTO.rx}px ${MANTO.ry}px at ${MANTO.cx}px ${MANTO.cy}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,12,30,0.62) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${MANTO.rx}px ${MANTO.ry}px at ${MANTO.cx}px ${MANTO.cy}px, rgba(150,235,255,0.55) 0%, rgba(80,190,255,0.32) 55%, rgba(80,190,255,0) 78%)`,
          mixBlendMode: "screen",
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="manto">
            <ellipse cx={MANTO.cx} cy={MANTO.cy} rx={MANTO.rx * 0.8} ry={MANTO.ry * 0.8} />
          </clipPath>
        </defs>
        <ellipse cx={MANTO.cx} cy={MANTO.cy} rx={MANTO.rx * 0.8} ry={MANTO.ry * 0.8} fill="none" stroke="rgba(200,245,255,0.75)" strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={t * 40} />
        {/* Línea de escaneo que recorre el manto. */}
        <g clipPath="url(#manto)">
          <rect x={0} y={MANTO.cy - MANTO.ry + barrido * MANTO.ry * 2 - 30} width={W} height={60} fill="url(#scan)" />
          <defs>
            <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(190,245,255,0)" />
              <stop offset="50%" stopColor="rgba(190,245,255,0.55)" />
              <stop offset="100%" stopColor="rgba(190,245,255,0)" />
            </linearGradient>
          </defs>
        </g>
        {/* Branquias: abanicos plumosos rosados que respiran. */}
        {[POS.branquiaIzq, POS.branquiaDer].map((b, i) => (
          <g key={i} opacity={0.85 * clamp01(fB * 1.5 + (cI > 0.5 ? 0.5 : 0))} transform={`translate(${b.x} ${b.y}) rotate(${i ? -24 : 24}) scale(${1 + 0.05 * Math.sin(t * 5)})`}>
            {Array.from({ length: 11 }, (_, j) => {
              const a = ((-60 + j * 12) * Math.PI) / 180;
              const L = 120 - Math.abs(j - 5) * 8;
              const ex = Math.sin(a) * L * (i ? -1 : 1);
              const ey = -Math.cos(a) * L;
              return <path key={j} d={`M 0 40 Q ${ex * 0.4} ${ey * 0.5} ${ex} ${ey}`} stroke="rgba(255,150,205,0.9)" strokeWidth={14} fill="none" strokeLinecap="round" />;
            })}
            <ellipse cx={0} cy={40} rx={26} ry={16} fill="#ff8fc8" />
          </g>
        ))}
        <Flujo t={t} o={fB} d={`M ${POS.branqIzq.x - 40} ${POS.branqIzq.y + 40} Q ${POS.branqIzq.x - 110} ${POS.branqIzq.y + 80} ${POS.branquiaIzq.x + 40} ${POS.branquiaIzq.y - 30}`} fin={[POS.branquiaIzq.x + 40, POS.branquiaIzq.y - 30]} dir={[POS.branqIzq.x - 110, POS.branqIzq.y + 80]} />
        <Flujo t={t} o={fB} d={`M ${POS.branqDer.x + 40} ${POS.branqDer.y + 40} Q ${POS.branqDer.x + 110} ${POS.branqDer.y + 80} ${POS.branquiaDer.x - 40} ${POS.branquiaDer.y - 30}`} fin={[POS.branquiaDer.x - 40, POS.branquiaDer.y - 30]} dir={[POS.branqDer.x + 110, POS.branqDer.y + 80]} />
        <Flujo t={t} o={fC} d={`M ${POS.sistemico.x} ${POS.sistemico.y - 140} L ${POS.sistemico.x + 10} ${POS.sistemico.y - 420}`} fin={[POS.sistemico.x + 10, POS.sistemico.y - 420]} dir={[POS.sistemico.x, POS.sistemico.y - 140]} />
        <Flujo t={t} o={fC} d={`M ${POS.sistemico.x + 120} ${POS.sistemico.y + 40} C 820 980 920 1300 990 1560`} fin={[990, 1560]} dir={[920, 1300]} />
        <Flujo t={t} o={fC} d={`M ${POS.sistemico.x + 40} ${POS.sistemico.y + 140} C 520 1300 620 1500 700 1700`} fin={[700, 1700]} dir={[620, 1500]} />
        <Flujo t={t} o={fC} d={`M ${POS.sistemico.x - 110} ${POS.sistemico.y + 60} C 160 1060 120 1300 230 1620`} fin={[230, 1620]} dir={[120, 1300]} />
      </svg>
      {cI > 0 ? <Corazon x={POS.branqIzq.x} y={POS.branqIzq.y} alto={190 * cI} escala={latido(t, 110)} /> : null}
      {cD > 0 ? <Corazon x={POS.branqDer.x} y={POS.branqDer.y} alto={190 * cD} escala={latido(t, 110, 0.6)} /> : null}
      {cS > 0 ? <Corazon x={POS.sistemico.x} y={POS.sistemico.y} alto={300 * cS} escala={latido(t, 90, 1.2)} /> : null}
      <Estallido t={t} t0={dos} x={POS.branqIzq.x} y={POS.branqIzq.y} color="#bff3ff" />
      <Estallido t={t} t0={dos + 0.12} x={POS.branqDer.x} y={POS.branqDer.y} color="#bff3ff" />
      <Estallido t={t} t0={M.uno} x={POS.sistemico.x} y={POS.sistemico.y} color="#bff3ff" />
    </AbsoluteFill>
  );
};

/** Gancho: tres corazones que saltan y laten delante del pulpo. */
const TresCorazones: React.FC<{ t: number }> = ({ t }) => {
  const sale = prog(t, M.rayosx - 0.15, M.rayosx + 0.05, easeIn);
  if (t < M.tres - 0.05 || sale >= 1) return null;
  return (
    <AbsoluteFill style={{ opacity: 1 - sale }}>
      {[0, 1, 2].map((i) => {
        const k = sp(t, M.tres + i * 0.13, { damping: 9, stiffness: 240, mass: 0.6 });
        const x = 270 + i * 270;
        const y = 760 - (i === 1 ? 70 : 0) + Math.sin(t * 3 + i) * 10;
        return (
          <React.Fragment key={i}>
            {k > 0 ? <Corazon x={x} y={y} alto={250 * k} escala={latido(t, 120, i * 0.8)} /> : null}
            <Estallido t={t} t0={M.tres + i * 0.13} x={x} y={y} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Ventana circular con el corazón principal y su electro: late y se detiene (gris y escarcha). */
const VentanaCorazon: React.FC<{ t: number }> = ({ t }) => {
  const t0 = M.detiene - 0.9;
  if (t < t0 || t > M.cae + 0.25) return null;
  const k = sp(t, t0, { damping: 12, stiffness: 200 });
  const sale = prog(t, M.cae, M.cae + 0.25, easeIn);
  const para = prog(t, M.detiene, M.detiene + 0.35, easeOut);
  const esc = lerp(latido(t, 130, 0.5), 1, para);
  let d = "M -170 0";
  for (let x = -170; x <= 170; x += 4) {
    const fase = (x + 170) / 340;
    const tt = t - (1 - fase) * 0.6;
    const pico = (tt < M.detiene ? 1 : 0) * Math.pow(Math.max(0, Math.sin(2 * Math.PI * tt * 2.2)), 18) * -70;
    d += ` L ${x} ${pico.toFixed(1)}`;
  }
  return (
    <div style={{ position: "absolute", left: 60, top: 300, width: 460, height: 460, scale: String(0.9 * k * (1 - sale)), opacity: 1 - sale }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 50% 42%, #1a5f86 0%, #06233a 75%)", border: "12px solid #ffffff", boxShadow: "0 18px 50px rgba(0,0,0,0.55)", overflow: "hidden" }}>
        <Corazon x={218} y={180} alto={270} escala={esc} gris={para} />
        {para > 0 ? (
          <svg width={436} height={436} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const cx = 218 + Math.cos(a) * 95;
              const cy = 180 + Math.sin(a) * 110;
              return <path key={i} d={`M ${cx} ${cy} l ${Math.cos(a) * 40 * para} ${Math.sin(a) * 40 * para} m ${-Math.cos(a + 0.6) * 14} ${-Math.sin(a + 0.6) * 14} l ${Math.cos(a + 0.6) * 28} ${Math.sin(a + 0.6) * 28}`} stroke="#eefcff" strokeWidth={5} strokeLinecap="round" opacity={para} />;
            })}
          </svg>
        ) : null}
        <svg width={436} height={436} viewBox="-218 -218 436 436" style={{ position: "absolute", inset: 0 }}>
          <path d={d} transform="translate(0 130)" stroke={para > 0.5 ? "#ff5a5a" : "#7dffb0"} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

/** Nube de arena al aterrizar. */
const Polvo: React.FC<{ t: number }> = ({ t }) => {
  const d = t - M.suelo;
  if (d < 0 || d > 1.1) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="nube">
          <stop offset="0%" stopColor="rgba(205,190,150,0.55)" />
          <stop offset="100%" stopColor="rgba(205,190,150,0)" />
        </radialGradient>
      </defs>
      {Array.from({ length: 30 }, (_, i) => {
        const lado = i % 2 ? 1 : -1;
        const x = 540 + lado * (40 + d * (220 + (i % 7) * 85));
        const y = 1560 - d * (90 + (i % 5) * 70) + d * d * 140 + (i % 3) * 40;
        return <circle key={i} cx={x} cy={y} r={60 + (i % 4) * 25 + d * 120} fill="url(#nube)" opacity={1 - d / 1.1} />;
      })}
    </svg>
  );
};

const Gota: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const k = sp(t, M.suelo + 0.45, { damping: 10, stiffness: 200 });
  if (k <= 0) return null;
  const cae = ((t - M.suelo - 0.45) % 1.2) / 1.2;
  return (
    <svg width={120} height={200} viewBox="-60 -100 120 200" style={{ position: "absolute", left: x - 60, top: y - 100, overflow: "visible", scale: String(1.6 * k) }}>
      <path d="M 0 -60 C -26 -18 -30 14 0 26 C 30 14 26 -18 0 -60 Z" fill="#a9e8ff" stroke="#2a8fc4" strokeWidth={5} transform={`translate(0 ${cae * 40})`} opacity={1 - cae * 0.6} />
      <ellipse cx={-8} cy={-6 + cae * 40} rx={6} ry={10} fill="white" opacity={0.85 * (1 - cae * 0.6)} />
    </svg>
  );
};

// ------------------------------------------------------------- composición

export type PropsPulpoReal = { limpia: boolean; audio: string | null };

const temblor = (t: number, t0: number, dur: number, amp: number) => {
  const d = t - t0;
  if (d < 0 || d > dur) return { x: 0, y: 0 };
  const k = (1 - d / dur) ** 2 * amp;
  return { x: Math.sin(d * 90) * k, y: Math.cos(d * 70) * k };
};

export const ShortPulpoReal: React.FC<PropsPulpoReal> = ({ limpia, audio }) => {
  cargar();
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Entrada con rebote (golpe de zoom con resorte) y temblores en los golpes.
  const rebote = sp(t, 0.05, { damping: 7, stiffness: 160, mass: 0.7 });
  const escalaEntrada = lerp(1.22, 1, rebote);
  const sh = [temblor(t, 0.35, 0.35, 16), temblor(t, M.suelo, 0.45, 30)].reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });
  const golpeCorte = (t0: number) => 1 + 0.07 * (1 - prog(t, t0, t0 + 0.28, easeOut)) * (t >= t0 ? 1 : 0);

  const tNado = M.nada;
  const tCongela = M.detiene;
  const caida = prog(t, M.cae, M.suelo, easeIn);
  const drama = prog(t, M.detiene, M.detiene + 0.25) * (1 - prog(t, M.cae, M.cae + 0.15));

  return (
    <AbsoluteFill style={{ background: "#021626", overflow: "hidden" }}>
      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        {/* 1) Gancho: el pulpo avanza hacia la cámara. */}
        {t < M.rayosx ? (
          <AbsoluteFill style={{ scale: String(escalaEntrada) }}>
            <Toma src="gancho.mp4" ancho={1920} alto={1080} desde={0} t={t} claves={[{ t: 0, x: 0.61, y: 0.5, zoom: 1 }, { t: 2.5, x: 0.63, y: 0.5, zoom: 1.08 }]} />
          </AbsoluteFill>
        ) : null}
        {/* 2) Rayos X: primer plano del manto. */}
        {t >= M.rayosx && t < tNado ? (
          <AbsoluteFill style={{ scale: String(golpeCorte(M.rayosx) * lerp(1, 1.05, prog(t, M.rayosx, tNado, (x) => x))), transformOrigin: `${MANTO.cx}px ${MANTO.cy}px` }}>
            <Toma src="rayos.mp4" ancho={1280} alto={720} desde={M.rayosx} inicio={0.5} t={t} claves={[{ t: 0, x: 0.22, y: 0.5, zoom: 1 }]} />
            <Azul />
            <RayosX t={t} />
          </AbsoluteFill>
        ) : null}
        {/* 3) Nada a chorro; 4) se congela cuando el corazón se detiene; 5) cae. */}
        {t >= tNado && t < M.suelo ? (
          <AbsoluteFill
            style={{
              scale: String(golpeCorte(tNado)),
              translate: `0 ${-caida * 1700}px`,
              rotate: `${caida * 8}deg`,
              filter: `saturate(${1 - 0.75 * drama}) ${caida > 0.05 ? `blur(${(caida * 22).toFixed(1)}px)` : ""}`,
            }}
          >
            {t < tCongela ? (
              <Toma src="nado.mp4" ancho={1920} alto={1080} desde={tNado} inicio={0.3} t={t} claves={[{ t: 0, x: 0.68, y: 0.38, zoom: 1.5 }, { t: 0.6, x: 0.64, y: 0.42, zoom: 1.75 }, { t: 1.8, x: 0.66, y: 0.4, zoom: 1.85 }]} />
            ) : (
              <Freeze frame={Math.round(tCongela * FPS)}>
                <Toma src="nado.mp4" ancho={1920} alto={1080} desde={tNado} inicio={0.3} t={tCongela} claves={[{ t: 0, x: 0.68, y: 0.38, zoom: 1.5 }, { t: 0.6, x: 0.64, y: 0.42, zoom: 1.75 }, { t: 1.8, x: 0.66, y: 0.4, zoom: 1.85 }]} />
              </Freeze>
            )}
            <Azul />
          </AbsoluteFill>
        ) : null}
        {/* 6) Aterriza en el fondo y se arrastra cansado (cámara lenta). */}
        {t >= M.cae ? (
          <AbsoluteFill style={{ translate: `0 ${(1 - caida) * 1920}px`, filter: `saturate(0.85) ${caida < 0.95 ? `blur(${((1 - caida) * 16).toFixed(1)}px)` : ""}` }}>
            <AbsoluteFill style={{ scale: String(lerp(1, 1.12, prog(t, M.suelo, 10.6, easeInOut))), transformOrigin: "540px 500px" }}>
              <Toma src="camina.mp4" ancho={1920} alto={1080} desde={M.cae} inicio={0.4} rate={0.75} t={t} claves={[{ t: 0, x: 0.52, y: 0.3, zoom: 1.12 }, { t: 2.3, x: 0.58, y: 0.3, zoom: 1.12 }]} />
              <Azul />
              <Gota t={t} x={lerp(690, 740, prog(t, M.suelo, 10.6))} y={430} />
            </AbsoluteFill>
            <Polvo t={t} />
          </AbsoluteFill>
        ) : null}
        {t < M.rayosx ? <Azul /> : null}
        <TresCorazones t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,10,22,0.5)", opacity: drama }} />
      <VentanaCorazon t={t} />
      {/* Destellos de corte (como la referencia) y viñeta. */}
      {[M.rayosx, M.nada, M.suelo].map((c) => (t >= c && t < c + 0.1 ? <AbsoluteFill key={c} style={{ background: "#dff6ff", opacity: 0.32 * (1 - (t - c) / 0.1) }} /> : null))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,8,18,0.6) 100%)" }} />
      {!limpia ? (
        <>
          <Rotulo t={t} t0={M.corazones} t1={M.rayosx} texto="3 CORAZONES" x={540} y={290} tam={150} color="#ffd23f" />
          <Rotulo t={t} t0={M.branquias} t1={M.uno - 0.05} texto="BRANQUIAS" x={540} y={250} tam={104} color="#ff9ad5" />
          <Rotulo t={t} t0={M.cuerpo - 0.1} t1={M.nada - 0.05} texto="AL CUERPO" x={540} y={250} tam={104} color="#7fd4ff" />
          <Palabra t={t} />
        </>
      ) : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
