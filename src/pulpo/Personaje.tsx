import React from "react";

// Pulpo de caricatura en vectores (estilo personaje 3D: degradados, brillo y luz de borde).
// Coordenadas locales: el centro de la cabeza está en (0, 0); la cabeza sube hasta y = −300
// y los tentáculos salen de y ≈ 125 hacia abajo.

export type Pose = { quieto: number; nada: number; arrastra: number };
export type Gesto = {
  ojos: number; // 1 abiertos, 0 cerrados
  pupila: [number, number]; // −1..1
  cejas: number; // 0 neutras, 1 preocupadas, −1 enfadadas
  boca: "sonrisa" | "o" | "triste" | "cansado";
  sudor: number;
};
export type Interior = {
  rayosX: number; // 0..1: la cabeza se vuelve translúcida y se ven los órganos
  corazones: [number, number, number]; // aparición de cada corazón (branquial izq., branquial der., sistémico)
  latido: [number, number, number]; // escala de latido de cada corazón
  flujoBranquias: number; // 0..1: sangre de los corazones branquiales a las branquias
  flujoCuerpo: number; // 0..1: sangre del corazón sistémico al cuerpo
  detenido: number; // 0..1: el corazón sistémico se detiene (gris y escarcha)
};

const PIEL = { luz: "#ffb09a", medio: "#f0604f", sombra: "#a8303c", tentaculo: "#e85a4c", tentaculoAtras: "#c4433f", ventosa: "#ffd2c2" };
const SANGRE = "#4fb7ff";

const CABEZA =
  "M 0 -300 C 190 -300 292 -160 282 0 C 274 112 202 150 122 162 L -122 162 C -202 150 -274 112 -282 0 C -292 -160 -190 -300 0 -300 Z";

/** Corazón de caricatura (centrado en 0,0, ~120 px de ancho). */
export const RUTA_CORAZON = "M 0 -22 C -26 -60 -80 -36 -64 10 C -52 42 0 66 0 78 C 0 66 52 42 64 10 C 80 -36 26 -60 0 -22 Z";

export const CorazonDibujo: React.FC<{ id: string; escala: number; gris?: number }> = ({ id, escala, gris = 0 }) => (
  <g transform={`scale(${escala})`}>
    <defs>
      <radialGradient id={`cz-${id}`} cx="38%" cy="30%" r="80%">
        <stop offset="0%" stopColor={gris > 0.5 ? "#dfe9f2" : "#ff9aa8"} />
        <stop offset="55%" stopColor={gris > 0.5 ? "#8aa3b8" : "#e8203f"} />
        <stop offset="100%" stopColor={gris > 0.5 ? "#4b6176" : "#8c0c24"} />
      </radialGradient>
    </defs>
    <path d={RUTA_CORAZON} fill={`url(#cz-${id})`} stroke={gris > 0.5 ? "#2e4255" : "#6e0618"} strokeWidth={4} />
    <ellipse cx={-26} cy={-14} rx={14} ry={9} fill="white" opacity={0.75} transform="rotate(-30 -26 -14)" />
  </g>
);

/** Punta de flecha en (x2, y2) apuntando en la dirección (x1, y1) → (x2, y2). */
const Punta: React.FC<{ x1: number; y1: number; x2: number; y2: number; tam?: number; opacity?: number }> = ({ x1, y1, x2, y2, tam = 26, opacity = 1 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number, g: number) => `${(x2 + Math.cos(a + g) * d).toFixed(1)},${(y2 + Math.sin(a + g) * d).toFixed(1)}`;
  return <polygon points={`${p(tam * 0.6, 0)} ${p(tam, Math.PI * 0.8)} ${p(tam, -Math.PI * 0.8)}`} fill={SANGRE} stroke="#0d4d7a" strokeWidth={3} opacity={opacity} />;
};

const tentaculo = (i: number, t: number, pose: Pose) => {
  const k = (i - 3.5) / 3.5; // −1 (izq.) .. 1 (der.)
  const base = { x: k * 195, y: 128 };
  const L = 430 * (0.82 + 0.18 * (1 - Math.abs(k)));
  const { quieto: q, nada: n, arrastra: a } = pose;
  const tot = q + n + a || 1;
  const ang0 = (q * (90 - k * 58) + n * (90 - k * 12) + a * (90 - k * 78)) / tot;
  const curl = (q * -k * 150 + n * -k * 25 + a * k * 50) / tot;
  const amp = (q * 16 + n * 7 + a * 5) / tot;
  const freq = (q * 1.1 + n * 3.2 + a * 1.6) / tot;
  // Al arrastrarse, cada tentáculo se levanta por turnos (como pasos).
  const paso = a * 14 * Math.max(0, Math.sin(t * 5 + i * 1.3));
  const N = 26;
  const pts: { x: number; y: number; w: number; nx: number; ny: number }[] = [];
  let x = base.x;
  let y = base.y;
  for (let j = 0; j <= N; j++) {
    const s = j / N;
    const ang = ((ang0 - paso * (1 - s) + curl * Math.pow(s, 1.6) + amp * Math.sin(2 * Math.PI * freq * t - s * 3 + i * 0.7) * s) * Math.PI) / 180;
    const w = 44 * Math.pow(1 - s, 0.85) + 5;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    pts.push({ x, y, w, nx: -dy, ny: dx });
    x += dx * (L / N);
    y += dy * (L / N);
  }
  const izq = pts.map((p) => `${(p.x + p.nx * p.w).toFixed(1)},${(p.y + p.ny * p.w).toFixed(1)}`);
  const der = pts.map((p) => `${(p.x - p.nx * p.w).toFixed(1)},${(p.y - p.ny * p.w).toFixed(1)}`).reverse();
  const ventosas = pts
    .filter((_, j) => j > 3 && j < N - 2 && j % 2 === 0)
    .map((p) => ({ x: p.x - p.nx * p.w * 0.55 * (k < 0 ? -1 : 1), y: p.y - p.ny * p.w * 0.55 * (k < 0 ? -1 : 1), r: p.w * 0.32 }));
  return { poligono: [...izq, ...der].join(" "), ventosas, punta: pts[N] };
};

const Ojo: React.FC<{ x: number; gesto: Gesto; lado: number }> = ({ x, gesto, lado }) => {
  const rx = 64;
  const ry = 74;
  const cy = 30;
  const [px, py] = gesto.pupila;
  const cierre = 1 - gesto.ojos;
  return (
    <g transform={`translate(${x} ${cy})`}>
      <defs>
        <clipPath id={`ojo${lado}`}>
          <ellipse rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse rx={rx + 6} ry={ry + 6} fill={PIEL.sombra} opacity={0.35} />
      <ellipse rx={rx} ry={ry} fill="#fdfdfd" />
      <g clipPath={`url(#ojo${lado})`}>
        <ellipse rx={rx} ry={ry} fill="url(#esclera)" />
        <circle cx={px * 20} cy={py * 22 + 8} r={36} fill="#1a1020" />
        <circle cx={px * 20 - 12} cy={py * 22 - 6} r={12} fill="white" />
        <circle cx={px * 20 + 10} cy={py * 22 + 18} r={5} fill="white" opacity={0.8} />
        {/* Párpado superior que baja para parpadear o verse cansado. */}
        <rect x={-rx - 4} y={-ry - 4} width={2 * rx + 8} height={(2 * ry + 8) * cierre} fill="url(#piel)" />
        {cierre > 0.02 ? <line x1={-rx} x2={rx} y1={-ry - 4 + (2 * ry + 8) * cierre} y2={-ry - 4 + (2 * ry + 8) * cierre} stroke={PIEL.sombra} strokeWidth={6} strokeLinecap="round" /> : null}
      </g>
      {/* Ceja */}
      <path
        d={`M ${-rx * 0.8} ${-ry - 26} Q 0 ${-ry - 44} ${rx * 0.8} ${-ry - 26}`}
        stroke="#7a1f2c"
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
        transform={`rotate(${gesto.cejas * 16 * lado} 0 ${-ry - 30}) translate(0 ${gesto.cejas > 0 ? -6 : gesto.cejas < 0 ? 6 : 0})`}
      />
    </g>
  );
};

const Boca: React.FC<{ tipo: Gesto["boca"] }> = ({ tipo }) => {
  const y = 118;
  if (tipo === "o") return <ellipse cx={0} cy={y} rx={22} ry={28} fill="#5a0f1e" stroke="#3a0612" strokeWidth={4} />;
  if (tipo === "triste") return <path d={`M -40 ${y + 14} Q 0 ${y - 16} 40 ${y + 14}`} stroke="#5a0f1e" strokeWidth={10} fill="none" strokeLinecap="round" />;
  if (tipo === "cansado")
    return <path d={`M -42 ${y + 4} q 14 -10 28 0 t 28 0 t 28 0`} stroke="#5a0f1e" strokeWidth={9} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <path d={`M -48 ${y - 6} Q 0 ${y + 44} 48 ${y - 6} Q 0 ${y + 18} -48 ${y - 6} Z`} fill="#5a0f1e" />
      <path d={`M -22 ${y + 16} Q 0 ${y + 30} 22 ${y + 16}`} stroke="#ff7b8a" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Pulpo: React.FC<{
  t: number;
  x: number;
  y: number;
  escala: number;
  giro: number;
  estira: [number, number];
  pose: Pose;
  gesto: Gesto;
  interior: Interior;
}> = ({ t, x, y, escala, giro, estira, pose, gesto, interior }) => {
  const tents = Array.from({ length: 8 }, (_, i) => ({ i, ...tentaculo(i, t, pose) }));
  // Primero los de los lados (más atrás), luego los del centro.
  const orden = [...tents].sort((a, b) => Math.abs(b.i - 3.5) - Math.abs(a.i - 3.5));
  const rx = interior.rayosX;
  const ox = (i: number) => (i === 0 ? -112 : i === 1 ? 112 : 0);
  const oy = (i: number) => (i === 2 ? -222 : -132);
  const tamCorazon = (i: number) => (i === 2 ? 0.95 : 0.6);
  const vaiven = Math.sin(t * 2.1) * 6 * pose.quieto;
  return (
    <g transform={`translate(${x} ${y + vaiven}) rotate(${giro}) scale(${escala * estira[0]} ${escala * estira[1]})`}>
      <defs>
        <radialGradient id="piel" cx="38%" cy="22%" r="85%">
          <stop offset="0%" stopColor={PIEL.luz} />
          <stop offset="48%" stopColor={PIEL.medio} />
          <stop offset="100%" stopColor={PIEL.sombra} />
        </radialGradient>
        <radialGradient id="esclera" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d9dfe8" />
        </radialGradient>
        <linearGradient id="tent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PIEL.medio} />
          <stop offset="100%" stopColor={PIEL.sombra} />
        </linearGradient>
        <radialGradient id="xray" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="rgba(190,245,255,0.55)" />
          <stop offset="100%" stopColor="rgba(60,170,230,0.75)" />
        </radialGradient>
      </defs>
      {/* Sombra suave debajo */}
      <ellipse cx={0} cy={560} rx={260} ry={34} fill="rgba(0,0,0,0.18)" />
      {orden.map(({ i, poligono, ventosas }) => (
        <g key={i}>
          <polygon points={poligono} fill={Math.abs(i - 3.5) > 2 ? PIEL.tentaculoAtras : "url(#tent)"} stroke={PIEL.sombra} strokeWidth={3} strokeLinejoin="round" />
          {ventosas.map((v, j) => (
            <circle key={j} cx={v.x} cy={v.y} r={v.r} fill={PIEL.ventosa} stroke="#c9706a" strokeWidth={2} />
          ))}
          {interior.flujoCuerpo > 0.4 ? <polygon points={poligono} fill={SANGRE} opacity={0.25 * (interior.flujoCuerpo - 0.4) / 0.6 * (0.6 + 0.4 * Math.sin(t * 8 + i))} /> : null}
        </g>
      ))}
      {/* Cabeza */}
      <path d={CABEZA} fill="url(#piel)" stroke={PIEL.sombra} strokeWidth={5} />
      {[[-120, -170, 30], [80, -210, 22], [150, -90, 26], [-170, -60, 18], [10, -250, 15]].map(([cx, cy, r], j) => (
        <circle key={j} cx={cx} cy={cy} r={r} fill={PIEL.luz} opacity={0.35} />
      ))}
      <ellipse cx={-110} cy={-200} rx={70} ry={40} fill="white" opacity={0.28} transform="rotate(-30 -110 -200)" />
      <path d="M 250 -60 C 262 20 230 100 160 140" stroke="#ffd7c7" strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
      {/* Rayos X: la cabeza se vuelve translúcida y se ven corazones, branquias y la sangre. */}
      {rx > 0.01 ? (
        <g opacity={rx}>
          <path d={CABEZA} fill="url(#xray)" stroke="#bff3ff" strokeWidth={6} />
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 205} -100)`}>
              {Array.from({ length: 7 }, (_, j) => (
                <path key={j} d={`M 0 ${-46 + j * 14} q ${s * 34} -6 ${s * 52} 4`} stroke="#c45a9a" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />
              ))}
              <path d="M 0 -50 L 0 50" stroke="#8a2f6d" strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          {/* Sangre (azul) de los corazones branquiales a las branquias y del sistémico al cuerpo. */}
          {interior.flujoBranquias > 0
            ? [-1, 1].map((s) => {
                const o = Math.min(1, interior.flujoBranquias * 2);
                return (
                  <g key={s} opacity={o}>
                    <path d={`M ${s * 150} -134 L ${s * 172} -122`} stroke={SANGRE} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="10 8" strokeDashoffset={-t * 60} />
                    <Punta x1={s * 150} y1={-134} x2={s * 190} y2={-114} />
                  </g>
                );
              })
            : null}
          {interior.flujoCuerpo > 0
            ? (
                [
                  ["M 0 -250 L 0 -278", 0, -250, 0, -290],
                  ["M -40 -212 C -170 -200 -250 -40 -215 140", -228, 90, -215, 150],
                  ["M 40 -212 C 170 -200 250 -40 215 140", 228, 90, 215, 150],
                  ["M 0 -180 C 0 -80 0 40 0 140", 0, 100, 0, 152],
                ] as [string, number, number, number, number][]
              ).map(([d, x1, y1, x2, y2], j) => {
                const o = Math.min(1, interior.flujoCuerpo * 2);
                return (
                  <g key={j} opacity={o}>
                    <path d={d} stroke={SANGRE} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="18 16" strokeDashoffset={-t * 140} />
                    <Punta x1={x1} y1={y1} x2={x2} y2={y2} />
                  </g>
                );
              })
            : null}
          {[0, 1, 2].map((i) =>
            interior.corazones[i] > 0 ? (
              <g key={i} transform={`translate(${ox(i)} ${oy(i)})`}>
                <CorazonDibujo id={`int${i}`} escala={tamCorazon(i) * interior.corazones[i] * interior.latido[i]} gris={i === 2 ? interior.detenido : 0} />
              </g>
            ) : null,
          )}
        </g>
      ) : null}
      <Ojo x={-98} gesto={gesto} lado={-1} />
      <Ojo x={98} gesto={gesto} lado={1} />
      <Boca tipo={gesto.boca} />
      {gesto.sudor > 0 ? (
        <path d="M 230 -150 C 214 -118 214 -96 230 -90 C 246 -96 246 -118 230 -150 Z" fill="#9fe3ff" stroke="#4aa7d8" strokeWidth={4} opacity={gesto.sudor} transform={`translate(0 ${(1 - gesto.sudor) * -20})`} />
      ) : null}
    </g>
  );
};
