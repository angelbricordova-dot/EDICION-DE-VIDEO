import { useId } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORES, textoBase } from "./estilo";
import { NombreSprite, SPRITES } from "./sprites";

const usarIdSvg = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");

export const Pixel: React.FC<{
  sprite: NombreSprite;
  tam: number;
  style?: React.CSSProperties;
}> = ({ sprite, tam, style }) => {
  const { ancho, alto, tramos } = SPRITES[sprite];
  return (
    <svg
      width={ancho * tam}
      height={alto * tam}
      viewBox={`0 0 ${ancho} ${alto}`}
      shapeRendering="crispEdges"
      style={{ overflow: "visible", ...style }}
    >
      {tramos.map((t, i) => (
        <rect key={i} x={t.x} y={t.y} width={t.ancho} height={1} fill={t.color} />
      ))}
    </svg>
  );
};

/** Coloca un sprite centrado en (x, y). */
export const PixelEn: React.FC<{
  sprite: NombreSprite;
  tam: number;
  x: number;
  y: number;
  escala?: number;
  rot?: number;
  opacidad?: number;
  filtro?: string;
}> = ({ sprite, tam, x, y, escala = 1, rot = 0, opacidad = 1, filtro }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${escala})`,
      opacity: opacidad,
      filter: filtro,
    }}
  >
    <Pixel sprite={sprite} tam={tam} style={{ display: "block" }} />
  </div>
);

/** Destello de cuatro puntas (la estrella cian/roja del video). */
export const Destello: React.FC<{
  tam: number;
  x: number;
  y: number;
  centro: string;
  borde: string;
  rot?: number;
  opacidad?: number;
}> = ({ tam, x, y, centro, borde, rot = 0, opacidad = 1 }) => {
  const id = usarIdSvg();
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="-100 -100 200 200"
      style={{
        position: "absolute",
        left: x - tam / 2,
        top: y - tam / 2,
        transform: `rotate(${rot}deg)`,
        opacity: opacidad,
        filter: `drop-shadow(0 0 ${tam * 0.03}px ${borde})`,
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={centro} />
          <stop offset="100%" stopColor={borde} />
        </radialGradient>
      </defs>
      <path
        d="M0,-100 Q9,-9 100,0 Q9,9 0,100 Q-9,9 -100,0 Q-9,-9 0,-100Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
};

/** Grano de película animado. */
export const Grano: React.FC<{ opacidad?: number }> = ({ opacidad = 0.08 }) => {
  const frame = useCurrentFrame();
  const id = usarIdSvg();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacidad }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={frame % 9}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vineta: React.FC<{ fuerza?: number; radio?: number; color?: string }> = ({
  fuerza = 0.35,
  radio = 55,
  color = "0,0,0",
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, rgba(${color},0) ${radio}%, rgba(${color},${fuerza}) 100%)`,
    }}
  />
);

export const Papel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORES.papel,
      backgroundImage:
        "radial-gradient(ellipse at 50% 45%, #eeedea 0%, #e2e1de 55%, #cfcdc9 100%)",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Negro: React.FC<{ children?: React.ReactNode; color?: string }> = ({
  children,
  color = COLORES.negro,
}) => <AbsoluteFill style={{ backgroundColor: color }}>{children}</AbsoluteFill>;

/** Cursor de texto que parpadea. */
export const Cursor: React.FC<{ alto: number; color: string }> = ({ alto, color }) => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 8) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: alto * 0.12,
        height: alto,
        backgroundColor: color,
        opacity: visible ? 1 : 0,
        verticalAlign: "middle",
      }}
    />
  );
};

/** Palabra que entra desenfocada y se enfoca. */
export const Palabra: React.FC<{
  texto: string;
  desde: number;
  color: string;
  duracion?: number;
}> = ({ texto, desde, color, duracion = 5 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [desde, desde + duracion], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        color,
        opacity: p,
        filter: `blur(${(1 - p) * 8}px)`,
        display: "inline-block",
        transform: `translateY(${(1 - p) * 6}px)`,
      }}
    >
      {texto}
    </span>
  );
};

/** Frase escrita palabra por palabra. */
export const Frase: React.FC<{
  palabras: string[];
  inicios: number[];
  color: string;
  tam: number;
  style?: React.CSSProperties;
}> = ({ palabras, inicios, color, tam, style }) => (
  <div style={{ ...textoBase, fontSize: tam, position: "absolute", ...style }}>
    {palabras.map((p, i) => (
      <span key={i}>
        <Palabra texto={p} desde={inicios[i]} color={color} />
        {i < palabras.length - 1 ? " " : null}
      </span>
    ))}
  </div>
);

/** Trazo hecho a mano que se dibuja progresivamente. */
export const Trazo: React.FC<{
  d: string;
  progreso: number;
  color: string;
  grosor: number;
  viewBox: string;
  style?: React.CSSProperties;
}> = ({ d, progreso, color, grosor, viewBox, style }) => {
  const { strokeDasharray, strokeDashoffset } = evolvePath(
    Math.max(0.0001, Math.min(1, progreso)),
    d,
  );
  return (
    <svg viewBox={viewBox} style={{ position: "absolute", overflow: "visible", ...style }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};

export const NotaMusical: React.FC<{ doble?: boolean; tam: number; color: string }> = ({
  doble,
  tam,
  color,
}) =>
  doble ? (
    <svg width={tam} height={tam} viewBox="0 0 100 100">
      <rect x="34" y="22" width="8" height="60" fill={color} />
      <rect x="84" y="10" width="8" height="60" fill={color} />
      <polygon points="34,22 92,10 92,24 34,36" fill={color} />
      <polygon points="34,42 92,30 92,36 34,48" fill={color} />
      <ellipse cx="28" cy="82" rx="16" ry="12" fill={color} transform="rotate(-20 28 82)" />
      <ellipse cx="78" cy="70" rx="16" ry="12" fill={color} transform="rotate(-20 78 70)" />
    </svg>
  ) : (
    <svg width={tam} height={tam} viewBox="0 0 100 100">
      <rect x="56" y="10" width="8" height="70" fill={color} />
      <ellipse cx="50" cy="80" rx="16" ry="12" fill={color} transform="rotate(-20 50 80)" />
    </svg>
  );

/** Silueta de perfil (mirando a la izquierda) en look térmico o en sombra. */
export const Silueta: React.FC<{
  modo: "termico" | "sombra";
  style?: React.CSSProperties;
}> = ({ modo, style }) => {
  const id = usarIdSvg();
  const relleno = modo === "termico" ? `url(#${id})` : "#1c1b1d";
  return (
    <svg viewBox="0 0 1000 1000" style={{ position: "absolute", overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={id} cx="52%" cy="58%" r="60%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="35%" stopColor="#ffab3a" />
          <stop offset="70%" stopColor="#ff6a1c" />
          <stop offset="100%" stopColor="#e3361a" />
        </radialGradient>
      </defs>
      <path
        fill={relleno}
        d="M 362 318
           C 352 268, 380 228, 410 214 C 418 190, 448 176, 470 182
           C 488 160, 525 156, 548 168 C 572 150, 612 160, 628 180
           C 660 178, 690 200, 698 228 C 724 240, 738 270, 732 300
           C 748 330, 744 370, 730 392 C 738 430, 728 480, 712 520
           C 700 560, 690 600, 672 640 C 660 668, 658 700, 676 730
           C 760 760, 880 790, 960 840 C 1000 870, 1010 920, 1010 1000
           L 420 1000 C 432 900, 450 820, 448 760
           C 446 720, 440 690, 438 668 C 410 662, 380 660, 358 648
           C 342 640, 336 626, 340 612 C 330 604, 328 592, 334 584
           C 324 578, 322 566, 330 558 C 322 550, 322 540, 330 532
           C 318 526, 300 518, 292 506 C 288 498, 300 488, 310 476
           C 322 462, 330 450, 334 436 C 338 420, 332 396, 336 372
           C 338 350, 346 334, 362 318 Z"
      />
    </svg>
  );
};

type Punto = [number, number];

const girar = ([x, y]: Punto, [cx, cy]: Punto, grados: number): Punto => {
  const a = (grados * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
};

const DEDOS: { base: Punto; medio: Punto; punta: Punto; grosor: number }[] = [
  { base: [210, 500], medio: [135, 432], punta: [70, 405], grosor: 46 },
  { base: [245, 385], medio: [218, 272], punta: [205, 185], grosor: 40 },
  { base: [295, 365], medio: [302, 240], punta: [312, 140], grosor: 42 },
  { base: [342, 375], medio: [382, 272], punta: [404, 196], grosor: 40 },
  { base: [382, 410], medio: [440, 338], punta: [474, 286], grosor: 34 },
];

/** Mano abierta con look térmico; los dedos se mueven suavemente. */
export const Mano: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const id = usarIdSvg();
  return (
    <svg viewBox="0 0 600 900" style={{ position: "absolute", overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd98a" />
          <stop offset="45%" stopColor="#ffb14a" />
          <stop offset="100%" stopColor="#ff6a1c" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="470" r="120" fill="#c8201a" opacity={0.55} style={{ filter: "blur(30px)" }} />
      <g style={{ filter: "blur(1.5px)" }}>
        <path d="M 300 560 L 300 950" stroke={`url(#${id})`} strokeWidth={150} strokeLinecap="round" />
        <ellipse cx="300" cy="470" rx="108" ry="125" fill={`url(#${id})`} />
        {DEDOS.map((dedo, i) => {
          const angulo = Math.sin(frame / 9 + i * 0.9) * 9;
          const medio = girar(dedo.medio, dedo.base, angulo * 0.4);
          const punta = girar(
            girar(dedo.punta, dedo.base, angulo * 0.4),
            medio,
            angulo,
          );
          return (
            <path
              key={i}
              d={`M ${dedo.base[0]} ${dedo.base[1]} L ${medio[0]} ${medio[1]} L ${punta[0]} ${punta[1]}`}
              fill="none"
              stroke={`url(#${id})`}
              strokeWidth={dedo.grosor}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
    </svg>
  );
};
