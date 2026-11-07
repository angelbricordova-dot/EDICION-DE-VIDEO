import React from "react";

// El niño que le compra la bici a Toño (Día 3). Mismo estilo que Toño: contorno oscuro, sombras
// de dos tonos, detalles (pecas, curita, gorra al revés, tenis con cordones). Caja 500 × 1000 con
// los pies en y≈985. Poses: "normal" (brazos abajo) y "paga" (estira el brazo con el billete hacia
// la izquierda de la pantalla).

export type ExpresionNino = "feliz" | "sorpresa";
export type PoseNino = "normal" | "paga";

const C = {
  linea: "#1E1A19",
  piel: "#E8B48A",
  pielSombra: "#CF9468",
  pielLuz: "#F3C9A4",
  pelo: "#6B4226",
  peloLuz: "#8A5A36",
  gorra: "#2F6FD1",
  gorraSombra: "#2357A8",
  camiseta: "#F7C948",
  camisetaSombra: "#D9A92C",
  raya: "#2F9E6E",
  short: "#4D74A8",
  shortSombra: "#3B5D8C",
  tenis: "#E5484D",
  tenisSombra: "#B8363A",
  iris: "#5A3A22",
  boca: "#5A1A1E",
  lengua: "#D46F74",
  dientes: "#FFF8E6",
  rubor: "#F08A8A",
};
const L = { stroke: C.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Ojo: React.FC<{ cx: number; cy: number; sorpresa: boolean }> = ({ cx, cy, sorpresa }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={26} ry={sorpresa ? 34 : 30} fill="#FFFDF7" {...L} strokeWidth={5} />
    <circle cx={cx + 2} cy={cy + 4} r={sorpresa ? 12 : 16} fill={C.iris} />
    <circle cx={cx + 2} cy={cy + 4} r={sorpresa ? 6 : 8} fill={C.linea} />
    <circle cx={cx + 8} cy={cy - 4} r={5} fill="#fff" />
    <circle cx={cx - 4} cy={cy + 10} r={2.5} fill="#fff" />
  </g>
);

/** Brazo corto del niño: manga amarilla, brazo de piel y mano en puño (con o sin billete). */
const Brazo: React.FC<{ h: [number, number]; c: [number, number]; m: [number, number]; billete?: boolean }> = ({ h, c, m, billete }) => {
  const ang = Math.atan2(m[1] - c[1], m[0] - c[0]);
  return (
    <g>
      <path d={`M ${h[0]} ${h[1]} L ${c[0]} ${c[1]} L ${m[0]} ${m[1]}`} fill="none" stroke={C.linea} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${h[0]} ${h[1]} L ${c[0]} ${c[1]} L ${m[0]} ${m[1]}`} fill="none" stroke={C.piel} strokeWidth={39} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${h[0] + 6} ${h[1] + 10} L ${c[0] + 6} ${c[1]}`} fill="none" stroke={C.pielSombra} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      {/* manga corta */}
      <path d={`M ${h[0]} ${h[1]} L ${lerp(h[0], c[0], 0.5)} ${lerp(h[1], c[1], 0.5)}`} fill="none" stroke={C.linea} strokeWidth={70} strokeLinecap="butt" />
      <path d={`M ${h[0]} ${h[1]} L ${lerp(h[0], c[0], 0.5) - Math.cos(Math.atan2(c[1] - h[1], c[0] - h[0])) * 6} ${lerp(h[1], c[1], 0.5) - Math.sin(Math.atan2(c[1] - h[1], c[0] - h[0])) * 6}`} fill="none" stroke={C.camiseta} strokeWidth={58} strokeLinecap="butt" />
      {billete ? (
        <g transform={`translate(${m[0] + Math.cos(ang) * 22} ${m[1] + Math.sin(ang) * 22 - 26}) rotate(-12)`}>
          <rect x={-70} y={-34} width={140} height={68} rx={8} fill="#85C46B" stroke="#1E5A2B" strokeWidth={5} />
          <circle r={18} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={3} />
          <text y={8} textAnchor="middle" fontFamily="Arial Black" fontSize={22} fill="#1E5A2B">35</text>
        </g>
      ) : null}
      <circle cx={m[0] + Math.cos(ang) * 18} cy={m[1] + Math.sin(ang) * 18} r={27} fill={C.piel} {...L} strokeWidth={5} />
      <path d={`M ${m[0] + Math.cos(ang) * 18 - 14} ${m[1] + Math.sin(ang) * 18 - 4} q 10 -6 20 0`} fill="none" stroke={C.pielSombra} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const Nino: React.FC<{ ancho?: number; expresion?: ExpresionNino; pose?: PoseNino; t?: number }> = ({ ancho = 400, expresion = "feliz", pose = "normal", t = 0 }) => {
  const sorpresa = expresion === "sorpresa";
  const balanceo = Math.sin(t * 5) * 3;
  return (
    <svg width={ancho} height={ancho * 2} viewBox="0 0 500 1000" style={{ overflow: "visible" }}>
      {/* piernas, calcetines y tenis */}
      {[200, 300].map((x, i) => (
        <g key={x}>
          <rect x={x - 25} y={740} width={50} height={170} fill={C.piel} {...L} />
          <rect x={x - 25 + (i ? 30 : 0)} y={750} width={14} height={150} fill={C.pielSombra} opacity={0.5} />
          <rect x={x - 27} y={880} width={54} height={50} fill="#FFFDF7" {...L} strokeWidth={5} />
          <path d={`M ${x - 27} 896 L ${x + 27} 896 M ${x - 27} 910 L ${x + 27} 910`} stroke={C.tenis} strokeWidth={6} />
          <path d={`M ${x - 46 + (i ? 10 : -10)} 985 Q ${x - 50 + (i ? 10 : -10)} 930 ${x - 6} 926 L ${x + 20} 926 Q ${x + 52 + (i ? 10 : -10)} 940 ${x + 50 + (i ? 10 : -10)} 985 Z`} fill={C.tenis} {...L} />
          <path d={`M ${x - 48 + (i ? 10 : -10)} 972 L ${x + 52 + (i ? 10 : -10)} 972 L ${x + 50 + (i ? 10 : -10)} 988 L ${x - 46 + (i ? 10 : -10)} 988 Z`} fill="#FFFDF7" {...L} strokeWidth={4} />
          <path d={`M ${x - 10} 940 l 18 6 M ${x - 12} 952 l 20 6`} stroke="#FFFDF7" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* curita en la rodilla */}
      <rect x={180} y={810} width={40} height={20} rx={8} fill="#F3D2A2" stroke={C.linea} strokeWidth={3} transform="rotate(-20 200 820)" />
      {/* short de mezclilla con dobladillo */}
      <path d="M 156 610 L 344 610 L 356 770 L 264 770 L 250 690 L 236 770 L 144 770 Z" fill={C.short} {...L} />
      <path d="M 300 620 L 344 616 L 356 770 L 320 770 Z" fill={C.shortSombra} />
      <path d="M 144 750 L 236 750 M 264 750 L 356 750" stroke={C.shortSombra} strokeWidth={8} />
      <path d="M 250 616 L 250 690" stroke={C.shortSombra} strokeWidth={5} />
      <path d="M 170 626 Q 190 660 214 630 M 286 630 Q 310 660 330 626" fill="none" stroke={C.shortSombra} strokeWidth={5} strokeLinecap="round" />
      {/* brazos */}
      {pose === "paga" ? (
        <>
          <Brazo h={[178, 420]} c={[96, 500]} m={[10, 470]} billete />
          <Brazo h={[322, 420]} c={[360, 530]} m={[352, 620]} />
        </>
      ) : (
        <>
          <Brazo h={[178, 420]} c={[140, 520]} m={[136, 610]} />
          <Brazo h={[322, 420]} c={[360, 520]} m={[364, 610]} />
        </>
      )}
      {/* camiseta amarilla con raya verde y estrella */}
      <path d="M 168 400 Q 250 378 332 400 L 352 630 Q 250 646 148 630 Z" fill={C.camiseta} {...L} />
      <path d="M 310 404 Q 334 410 334 430 L 352 630 Q 330 634 316 634 Q 330 520 310 404 Z" fill={C.camisetaSombra} />
      <path d="M 222 392 Q 250 420 278 392" fill="none" stroke={C.camisetaSombra} strokeWidth={10} strokeLinecap="round" />
      <path d="M 190 580 Q 205 600 196 620 M 310 560 Q 300 590 312 616" fill="none" stroke={C.camisetaSombra} strokeWidth={4} strokeLinecap="round" />
      <path d="M 158 470 Q 250 482 342 470 L 345 506 Q 250 518 155 506 Z" fill={C.raya} {...L} strokeWidth={5} />
      <path d="M 250 540 l 12 26 l 28 3 l -21 19 l 6 28 l -25 -14 l -25 14 l 6 -28 l -21 -19 l 28 -3 Z" fill="#FFFDF7" {...L} strokeWidth={4} />
      {/* cuello */}
      <rect x={226} y={360} width={48} height={44} fill={C.pielSombra} {...L} />
      {/* cabeza */}
      <g transform={`rotate(${balanceo} 250 360)`}>
        {/* orejas */}
        <ellipse cx={136} cy={262} rx={22} ry={30} fill={C.piel} {...L} />
        <ellipse cx={364} cy={262} rx={22} ry={30} fill={C.piel} {...L} />
        <path d="M 136 250 q 8 12 0 24 M 364 250 q -8 12 0 24" fill="none" stroke={C.pielSombra} strokeWidth={4} />
        {/* pelo que asoma a los lados */}
        <path d="M 140 200 Q 128 250 146 280 L 160 230 Z M 360 200 Q 372 250 354 280 L 340 230 Z" fill={C.pelo} {...L} strokeWidth={5} />
        {/* cara */}
        <path d="M 142 230 Q 140 140 250 132 Q 360 140 358 230 L 354 300 Q 346 372 250 380 Q 154 372 146 300 Z" fill={C.piel} {...L} />
        <path d="M 330 160 Q 360 200 354 300 Q 346 360 300 374 Q 340 300 330 160 Z" fill={C.pielSombra} opacity={0.55} />
        {/* gorra al revés: copa azul, cierre trasero con mechón y visera asomando detrás */}
        <path d="M 120 168 Q 120 150 160 146 L 120 150 Q 92 156 96 176 Z" fill={C.gorraSombra} {...L} strokeWidth={5} />
        <path d="M 136 200 Q 132 82 250 74 Q 368 82 364 200 Q 250 176 136 200 Z" fill={C.gorra} {...L} />
        <path d="M 312 90 Q 352 120 360 196 Q 340 190 322 188 Q 330 130 312 90 Z" fill={C.gorraSombra} />
        <path d="M 250 76 L 250 180" stroke={C.gorraSombra} strokeWidth={4} />
        <circle cx={250} cy={78} r={8} fill={C.gorraSombra} {...L} strokeWidth={4} />
        <path d="M 206 196 Q 206 150 250 148 Q 294 150 294 196 Z" fill={C.pelo} {...L} strokeWidth={5} />
        <path d="M 218 196 q 10 -26 22 -2 q 10 -26 22 -2 q 10 -26 22 2" fill={C.pelo} {...L} strokeWidth={4} />
        <path d="M 214 172 L 286 172" stroke="#FFFDF7" strokeWidth={8} strokeLinecap="round" />
        {/* cejas */}
        <path d={`M 178 ${sorpresa ? 206 : 216} Q 205 ${sorpresa ? 192 : 204} 230 ${sorpresa ? 208 : 216}`} fill="none" stroke={C.pelo} strokeWidth={9} strokeLinecap="round" />
        <path d={`M 270 ${sorpresa ? 208 : 216} Q 295 ${sorpresa ? 192 : 204} 322 ${sorpresa ? 206 : 216}`} fill="none" stroke={C.pelo} strokeWidth={9} strokeLinecap="round" />
        <Ojo cx={205} cy={258} sorpresa={sorpresa} />
        <Ojo cx={295} cy={258} sorpresa={sorpresa} />
        {/* rubor y pecas */}
        <ellipse cx={180} cy={312} rx={24} ry={13} fill={C.rubor} opacity={0.5} />
        <ellipse cx={320} cy={312} rx={24} ry={13} fill={C.rubor} opacity={0.5} />
        {[[170, 300], [184, 308], [176, 318], [316, 300], [330, 308], [322, 318]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.2} fill="#B8744A" />
        ))}
        {/* nariz */}
        <path d="M 246 284 Q 256 304 242 308" fill="none" stroke={C.pielSombra} strokeWidth={5} strokeLinecap="round" />
        {/* boca */}
        {sorpresa ? (
          <ellipse cx={250} cy={344} rx={18} ry={22} fill={C.boca} {...L} strokeWidth={5} />
        ) : (
          <g>
            <path d="M 204 326 Q 250 336 296 326 Q 290 372 250 374 Q 210 372 204 326 Z" fill={C.boca} {...L} strokeWidth={5} />
            <path d="M 210 330 Q 250 340 290 330 L 288 342 Q 250 350 212 342 Z" fill={C.dientes} />
            <path d="M 228 362 Q 250 350 272 362 Q 262 372 250 372 Q 238 372 228 362 Z" fill={C.lengua} />
          </g>
        )}
      </g>
    </svg>
  );
};
