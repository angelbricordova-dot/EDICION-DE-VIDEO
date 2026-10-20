import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";
import { CorazonDibujo, Gesto, Interior, Pose, Pulpo } from "./Personaje";
import guionJson from "./guion.json";

// Short "el pulpo tiene tres corazones" (10 s, 9:16). Estilo de la referencia
// "Orcas are scared of this animal": personaje de caricatura 3D en el fondo del mar azul,
// vista de rayos X por dentro y subtítulos de una palabra con borde negro.
// `limpia`: sin voz, sin subtítulos y sin textos (solo animación, música y efectos).

type Guion = { duracion: number; palabras: { w: string; t: number; fin: number }[]; marcas: Record<string, number> };
export const GUION_PULPO = guionJson as unknown as Guion;
const M = GUION_PULPO.marcas;
const W = 1080;
const H = 1920;

let fuentes = false;
const cargar = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Luckiest Guy", url: staticFile("pulpo/fuentes/luckiest.woff2"), weight: "400" });
};
const LETRA = '"Luckiest Guy", Impact, sans-serif';

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const latido = (t: number, bpm: number, fase = 0) => 1 + 0.16 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * (t * bpm) / 60 + fase)), 6);

// ------------------------------------------------------------- cámara

type Clave = { t: number; s: number; x: number; y: number };
const camara: Clave[] = [
  { t: 0, s: 1, x: 540, y: 960 },
  { t: M.rayosx - 0.05, s: 1, x: 540, y: 960 },
  { t: M.rayosx + 0.35, s: 1.75, x: 540, y: 880 },
  { t: M.uno - 0.1, s: 1.75, x: 540, y: 880 },
  { t: M.uno + 0.35, s: 1.45, x: 540, y: 960 },
  { t: M.nada - 0.1, s: 1.45, x: 540, y: 960 },
  { t: M.nada + 0.35, s: 1, x: 560, y: 900 },
  { t: 7.6, s: 1.0, x: 600, y: 900 },
  { t: M.cae, s: 1.0, x: 600, y: 900 },
  { t: M.suelo + 0.1, s: 1, x: 540, y: 960 },
];
const SNAP = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const camEn = (t: number): Clave => {
  if (t <= camara[0].t) return camara[0];
  for (let i = 0; i < camara.length - 1; i++) {
    const a = camara[i];
    const b = camara[i + 1];
    if (t < b.t) {
      const k = SNAP(clamp01((t - a.t) / (b.t - a.t)));
      return { t, s: lerp(a.s, b.s, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
    }
  }
  return camara[camara.length - 1];
};

// ------------------------------------------------------------- movimiento del pulpo

const SUELO = 1480; // y del fondo arenoso (mundo)

const estado = (t: number) => {
  // Entrada desde abajo con rebote.
  const entra = sp(t, 0, { damping: 9, stiffness: 120, mass: 0.9 });
  let x = 540;
  let y = lerp(2500, 1000, entra);
  let giro = 0;
  let pose: Pose = { quieto: 1, nada: 0, arrastra: 0 };
  // Aplastar y estirar en el rebote.
  const v = (lerp(2500, 1000, sp(t, 0, { damping: 9, stiffness: 120, mass: 0.9 })) - lerp(2500, 1000, sp(t - 1 / FPS, 0, { damping: 9, stiffness: 120, mass: 0.9 }))) * FPS;
  let estira: [number, number] = [1 - clamp01(Math.abs(v) / 9000) * 0.12, 1 + clamp01(Math.abs(v) / 9000) * 0.16];
  if (t > 0.45 && t < 0.9) {
    const k = Math.sin(((t - 0.45) / 0.45) * Math.PI);
    estira = [1 + 0.1 * k, 1 - 0.1 * k];
  }
  // Nada a chorro hacia arriba a la derecha, con impulsos.
  if (t >= M.nada) {
    const u = clamp01((t - M.nada) / (7.6 - M.nada));
    const impulsos = u + 0.06 * Math.sin(u * Math.PI * 2 * 3);
    x = lerp(540, 740, easeInOut(clamp01(impulsos)));
    y = lerp(1000, 760, easeInOut(clamp01(impulsos)));
    giro = lerp(0, 32, prog(t, M.nada, M.nada + 0.3, easeOut));
    const n = prog(t, M.nada, M.nada + 0.25, easeOut);
    pose = { quieto: 1 - n, nada: n, arrastra: 0 };
    const pulso = Math.max(0, Math.sin(u * Math.PI * 2 * 3));
    estira = [1 - 0.08 * pulso, 1 + 0.1 * pulso];
  }
  // Pausa: el corazón se detiene y se queda flotando.
  if (t >= 7.6) {
    const k = prog(t, 7.6, 8.0, easeOut);
    x = 740;
    y = 760 + 25 * k;
    giro = lerp(32, 8, k);
    pose = { quieto: k, nada: 1 - k, arrastra: 0 };
    estira = [1, 1];
  }
  // Cae al fondo.
  if (t >= M.cae) {
    const k = prog(t, M.cae, M.suelo, easeIn);
    y = lerp(785, SUELO - 520, k);
    giro = 8 + Math.sin((t - M.cae) * 18) * 6 * (1 - k);
    pose = { quieto: 1, nada: 0, arrastra: 0 };
  }
  // Aterriza y se arrastra cansado.
  if (t >= M.suelo) {
    const golpe = Math.sin(clamp01((t - M.suelo) / 0.3) * Math.PI) * (t - M.suelo < 0.3 ? 1 : 0);
    const k = prog(t, M.suelo, M.suelo + 0.35, easeOut);
    const avance = clamp01((t - M.suelo - 0.2) / 1.7);
    x = lerp(740, 520, avance) + Math.sin(t * 5) * 4;
    y = SUELO - 520 + Math.abs(Math.sin(t * 5)) * -10 * k;
    giro = lerp(8, -4, k);
    pose = { quieto: 1 - k, nada: 0, arrastra: k };
    estira = [1 + 0.16 * golpe, 1 - 0.16 * golpe];
  }
  return { x, y, giro, pose, estira };
};

const gestoEn = (t: number): Gesto => {
  const parpadeo = [1.3, 3.6, 5.2].some((b) => t > b && t < b + 0.12) ? 0.05 : 1;
  if (t >= M.suelo) {
    return { ojos: 0.42, pupila: [-0.3, 0.4], cejas: 1, boca: "cansado", sudor: prog(t, M.suelo + 0.3, M.suelo + 0.6) };
  }
  if (t >= M.detiene - 0.1) return { ojos: 1, pupila: [0, -0.2], cejas: 1, boca: "o", sudor: 0 };
  if (t >= M.nada) return { ojos: 0.85, pupila: [0.6, -0.5], cejas: -0.6, boca: "sonrisa", sudor: 0 };
  if (t >= M.rayosx) return { ojos: parpadeo, pupila: [0, 0.2], cejas: 0, boca: "sonrisa", sudor: 0 };
  return { ojos: parpadeo, pupila: [0, 0.1], cejas: 0, boca: "sonrisa", sudor: 0 };
};

const interiorEn = (t: number): Interior => {
  const rx = prog(t, M.rayosx, M.rayosx + 0.35, easeOut) * (1 - prog(t, M.nada - 0.05, M.nada + 0.2, easeIn));
  const c = (t0: number) => sp(t, t0, { damping: 10, stiffness: 220, mass: 0.6 });
  const dos = M.dos + 0.25;
  return {
    rayosX: rx,
    corazones: [c(dos), c(dos + 0.12), c(M.uno)],
    latido: [latido(t, 110), latido(t, 110, 0.6), latido(t, 90, 1.2)],
    flujoBranquias: prog(t, M.dos + 0.6, M.dos + 1.1),
    flujoCuerpo: prog(t, M.uno + 0.25, M.uno + 0.7),
    detenido: 0,
  };
};

// ------------------------------------------------------------- fondo marino

const Mar: React.FC<{ t: number; cam: Clave }> = ({ t, cam }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f5a73 0%, #0a3f55 35%, #062a3b 70%, #031822 100%)", overflow: "hidden" }}>
    {/* Rayos de luz desde la superficie. */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id="rayo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(190,240,255,0.32)" />
          <stop offset="100%" stopColor="rgba(190,240,255,0)" />
        </linearGradient>
      </defs>
      {Array.from({ length: 7 }, (_, i) => {
        const x = 80 + i * 160 + Math.sin(t * 0.6 + i) * 40 - (cam.x - 540) * 0.2;
        const a = 60 + rnd(i) * 70;
        return <path key={i} d={`M ${x - a / 2} -20 L ${x + a / 2} -20 L ${x + a * 2.2 + 120} ${H} L ${x - a * 2.2 + 120} ${H} Z`} fill="url(#rayo)" opacity={0.35 + 0.35 * Math.sin(t * 1.3 + i * 2)} />;
      })}
    </svg>
    {/* Nieve marina que flota. */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 60 }, (_, i) => {
        const z = 0.4 + rnd(i + 9) * 0.8;
        const x = (rnd(i) * W - (cam.x - 540) * z * 0.6 + 2000) % W;
        const y = (((rnd(i + 3) * H + t * 22 * z - (cam.y - 960) * z * 0.6) % H) + H) % H;
        return <circle key={i} cx={x} cy={y} r={1.5 + z * 2.5} fill="#d8f6ff" opacity={0.15 + z * 0.25} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Fondo arenoso con algas y piedras (aparece cuando el pulpo cae). */
const Fondo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="arena" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a98c5e" />
        <stop offset="100%" stopColor="#5b4a30" />
      </linearGradient>
    </defs>
    {[-1, 1, 3].map((k) => (
      <g key={k} transform={`translate(${200 + k * 180} ${SUELO + 10})`}>
        {Array.from({ length: 4 }, (_, j) => (
          <path
            key={j}
            d={`M ${j * 18} 0 C ${j * 18 + 30 * Math.sin(t * 1.4 + j)} -120 ${j * 18 - 30 * Math.sin(t * 1.2 + j)} -220 ${j * 18 + 20 * Math.sin(t + j)} -${300 + j * 40}`}
            stroke="#2f7d52"
            strokeWidth={16 - j * 2}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      </g>
    ))}
    <path d={`M -200 ${SUELO} C 200 ${SUELO - 40} 500 ${SUELO + 30} 1300 ${SUELO - 20} L 1300 2600 L -200 2600 Z`} fill="url(#arena)" />
    <ellipse cx={180} cy={SUELO + 40} rx={110} ry={50} fill="#3d3a3a" />
    <ellipse cx={930} cy={SUELO + 60} rx={150} ry={64} fill="#35302e" />
    <ellipse cx={930} cy={SUELO + 40} rx={110} ry={34} fill="#4a4441" />
    <rect x={-200} y={SUELO - 60} width={1500} height={1200} fill="rgba(6,42,59,0.35)" />
  </g>
);

// ------------------------------------------------------------- textos

const Palabra: React.FC<{ t: number }> = ({ t }) => {
  const ps = GUION_PULPO.palabras;
  const i = ps.findIndex((p, j) => t >= p.t - 0.03 && t < (ps[j + 1]?.t ?? p.fin + 0.3) - 0.03);
  if (i < 0) return null;
  const p = ps[i];
  const k = sp(t, p.t - 0.03, { damping: 10, stiffness: 300, mass: 0.5 });
  const texto = p.w.replace(/[¿?.,…]/g, "").toUpperCase();
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 1480,
        textAlign: "center",
        fontFamily: LETRA,
        fontSize: 118,
        lineHeight: 1,
        color: "#ffffff",
        WebkitTextStroke: "12px #000",
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 #000, 0 10px 24px rgba(0,0,0,0.5)",
        scale: String(lerp(1.35, 1, k)),
        rotate: `${(1 - k) * -4}deg`,
      }}
    >
      {texto}
    </div>
  );
};

const Rotulo: React.FC<{ t: number; t0: number; t1: number; texto: string; x: number; y: number; tam?: number; color?: string }> = ({ t, t0, t1, texto, x, y, tam = 120, color = "#ffffff" }) => {
  if (t < t0 || t > t1) return null;
  const k = sp(t, t0, { damping: 9, stiffness: 260, mass: 0.6 });
  const sale = prog(t, t1 - 0.15, t1, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 500,
        width: 1000,
        top: y,
        textAlign: "center",
        fontFamily: LETRA,
        fontSize: tam,
        lineHeight: 1,
        color,
        WebkitTextStroke: `${Math.round(tam * 0.1)}px #000`,
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 #000, 0 12px 30px rgba(0,0,0,0.5)",
        scale: String(lerp(0.2, 1, k) * (1 - sale * 0.4)),
        opacity: 1 - sale,
      }}
    >
      {texto}
    </div>
  );
};

/** Ventana circular con el corazón principal y su electro: late y luego se detiene. */
const VentanaCorazon: React.FC<{ t: number }> = ({ t }) => {
  const t0 = M.detiene - 0.9;
  if (t < t0 || t > M.cae + 0.25) return null;
  const k = sp(t, t0, { damping: 12, stiffness: 200 });
  const sale = prog(t, M.cae, M.cae + 0.25, easeIn);
  const para = prog(t, M.detiene, M.detiene + 0.35, easeOut);
  const esc = lerp(latido(t, 130, 0.5), 1, para);
  // Electro: picos que se van apagando hasta la línea plana.
  let d = "M -170 0";
  for (let x = -170; x <= 170; x += 4) {
    const fase = (x + 170) / 340;
    const tt = t - (1 - fase) * 0.6;
    const activo = tt < M.detiene ? 1 : 0;
    const pico = activo * Math.pow(Math.max(0, Math.sin(2 * Math.PI * tt * 2.2)), 18) * -70;
    d += ` L ${x} ${pico.toFixed(1)}`;
  }
  return (
    <div style={{ position: "absolute", left: 50, top: 300, width: 460, height: 460, scale: String(0.85 * k * (1 - sale)), opacity: 1 - sale }}>
      <svg width={460} height={460} viewBox="-230 -230 460 460" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="ventana" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1d6f8a" />
            <stop offset="100%" stopColor="#06293a" />
          </radialGradient>
        </defs>
        <circle r={220} fill="url(#ventana)" stroke="#ffffff" strokeWidth={12} />
        <circle r={220} fill="none" stroke="#000" strokeWidth={4} opacity={0.4} />
        <g transform="translate(0 -40)">
          <CorazonDibujo id="ventana" escala={1.45 * esc} gris={para} />
          {/* Escarcha cuando se detiene. */}
          {para > 0
            ? Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <path key={i} d={`M ${Math.cos(a) * 60} ${Math.sin(a) * 60} l ${Math.cos(a) * 34 * para} ${Math.sin(a) * 34 * para} m ${-Math.cos(a + 0.6) * 12} ${-Math.sin(a + 0.6) * 12} l ${Math.cos(a + 0.6) * 24} ${Math.sin(a + 0.6) * 24}`} stroke="#e8fbff" strokeWidth={5} strokeLinecap="round" opacity={para} />;
              })
            : null}
        </g>
        <g transform="translate(0 130)">
          <path d={d} stroke={para > 0.5 ? "#ff5a5a" : "#7dffb0"} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

// ------------------------------------------------------------- composición

export type PropsPulpo = { limpia: boolean; audio: string | null };

export const ShortPulpo: React.FC<PropsPulpo> = ({ limpia, audio }) => {
  cargar();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camEn(t);
  const e = estado(t);
  const gesto = gestoEn(t);
  const interior = interiorEn(t);
  // Corazones que laten encima del pulpo en el gancho.
  const arriba = (i: number) => sp(t, M.tres + i * 0.13, { damping: 9, stiffness: 240, mass: 0.6 }) * (1 - prog(t, M.rayosx - 0.1, M.rayosx + 0.15, easeIn));
  // El suelo sube cuando cae (la cámara "baja" con él).
  const sueloY = lerp(700, 0, prog(t, M.cae - 0.1, M.suelo, easeOut));
  // Pausa dramática: un poco de oscuridad y velocidad lenta del mundo.
  const drama = prog(t, M.detiene, M.detiene + 0.2) * (1 - prog(t, M.cae, M.cae + 0.2));
  const burbujas = Array.from({ length: 26 }, (_, k) => {
    const tb = t - k * 0.06;
    if (tb < M.nada || tb > 7.6) return null;
    const p = estado(tb);
    const ang = ((p.giro + 90) * Math.PI) / 180;
    const sube = (t - tb) * 260;
    return { x: p.x + Math.cos(ang) * 260 + (rnd(k + Math.floor(tb * 30)) - 0.5) * 80, y: p.y + Math.sin(ang) * 260 - sube, r: 8 + rnd(k * 7) * 18, o: 1 - k / 26 };
  }).filter(Boolean) as { x: number; y: number; r: number; o: number }[];

  return (
    <AbsoluteFill style={{ background: "#031822", overflow: "hidden" }}>
      <Mar t={t} cam={cam} />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})` }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <g transform={`translate(0 ${sueloY})`}>{t > M.cae - 0.2 ? <Fondo t={t} /> : null}</g>
          {burbujas.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="rgba(210,245,255,0.18)" stroke="rgba(230,250,255,0.7)" strokeWidth={3} opacity={b.o} />
          ))}
          <Pulpo t={t} x={e.x} y={e.y} escala={0.92} giro={e.giro} estira={e.estira} pose={e.pose} gesto={gesto} interior={interior} />
          {/* Tres corazones que laten sobre el pulpo (gancho). */}
          {[0, 1, 2].map((i) =>
            arriba(i) > 0.01 ? (
              <g key={i} transform={`translate(${380 + i * 160} ${640 - (i === 1 ? 40 : 0)})`}>
                <CorazonDibujo id={`arriba${i}`} escala={0.9 * arriba(i) * latido(t, 120, i * 0.8)} />
              </g>
            ) : null,
          )}
          {/* Polvo de arena al aterrizar. */}
          {t > M.suelo && t < M.suelo + 0.9
            ? Array.from({ length: 16 }, (_, i) => {
                const d = t - M.suelo;
                const lado = i % 2 ? 1 : -1;
                return <circle key={i} cx={e.x + lado * (120 + d * (200 + i * 30))} cy={SUELO - 30 - d * (80 + (i % 5) * 30) + d * d * 120} r={18 + i * 2 + d * 30} fill="#c9b08a" opacity={0.5 * (1 - d / 0.9)} />;
              })
            : null}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,10,20,0.45)", opacity: drama }} />
      <VentanaCorazon t={t} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,8,14,0.6) 100%)" }} />
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
