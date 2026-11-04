import React from "react";

// Toño (docs/glowup.md), redibujado en SVG a partir de la hoja de Gemini
// (public/glowup/personaje/referencia-nivel0.jpg) para poder animarlo por partes: boca que habla,
// párpados, cejas, lágrimas y expresiones. Caja de 600 × 1300 con los pies en y≈1240.

export type Expresion = "aburrido" | "shock" | "llora" | "feliz";
export type PropsTono = {
  expresion?: Expresion;
  boca?: number; // 0 cerrada … 1 muy abierta (sale del volumen de la voz)
  parpadeo?: number; // 0 abierto … 1 cerrado (parpadeos)
  mirada?: number; // −1 izquierda … 1 derecha
  nivel?: number; // 0 en la ruina … 3 meta cumplida (de momento solo se dibuja el 0)
  t?: number; // segundos, para lágrimas y moscas
  ancho?: number;
  soloCabeza?: boolean;
};

const C = {
  linea: "#1C1A1A",
  piel: "#C98B5F",
  pielSombra: "#AE7149",
  barba: "#8E6446",
  pelo: "#161515",
  ojera: "#7C5B72",
  rojo: "#C8352E",
  rojoSombra: "#A52A26",
  mancha: "#962421",
  gris: "#6D757D",
  grisSombra: "#59616A",
  cordon: "#B9BEC4",
  camiseta: "#E9E6E1",
  cascos: "#555C52",
  cascosClaro: "#7D8673",
  oxido: "#9B5B2E",
  boca: "#5E1B1F",
  lengua: "#D46F74",
  lagrima: "#7CC8F2",
};
const L = { stroke: C.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Ojo: React.FC<{ cx: number; cy: number; abierto: number; pupila: number; mira: number; feliz: boolean; apretado?: boolean; espejo: boolean }> = ({ cx, cy, abierto, pupila, mira, feliz, apretado, espejo }) => {
  if (apretado) {
    // ojo apretado (llorando): arco hacia abajo
    return <path d={`M ${cx - 22} ${cy - 4} Q ${cx} ${cy + 10} ${cx + 22} ${cy - 4}`} fill="none" {...L} strokeWidth={7} />;
  }
  if (feliz) {
    // ojo cerrado de felicidad: arco hacia arriba
    return <path d={`M ${cx - 22} ${cy + 6} Q ${cx} ${cy - 16} ${cx + 22} ${cy + 6}`} fill="none" {...L} strokeWidth={7} />;
  }
  const rx = 25;
  const ry = 18;
  // párpado: tapa desde arriba una fracción (1 − abierto) del ojo
  const tapa = 1 - abierto;
  const yTapa = cy - ry + tapa * 2 * ry;
  const id = `ojo-${cx}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FBF7EF" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + mira * 8 + (espejo ? -2 : 2)} cy={cy + 2} r={pupila} fill={C.linea} />
        {tapa > 0.02 ? <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={yTapa - (cy - ry) + 2} fill={C.piel} /> : null}
        {tapa > 0.02 ? <line x1={cx - rx} y1={yTapa} x2={cx + rx} y2={yTapa} stroke={C.linea} strokeWidth={5} /> : null}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" {...L} strokeWidth={5} />
    </g>
  );
};

export const Cabeza: React.FC<PropsTono> = ({ expresion = "aburrido", boca = 0, parpadeo = 0, mirada = 0, t = 0 }) => {
  const shock = expresion === "shock";
  const feliz = expresion === "feliz";
  const llora = expresion === "llora";
  const base = shock ? 1 : llora ? 0.15 : 0.45; // cuánto abre los ojos según la expresión
  const abierto = Math.max(0, base * (1 - parpadeo));
  const cejaY = shock ? -14 : llora ? -6 : 0;
  const ab = Math.max(boca, shock ? 0.75 : 0);
  return (
    <g>
      {/* orejas */}
      <ellipse cx={212} cy={288} rx={17} ry={27} fill={C.piel} {...L} />
      <ellipse cx={388} cy={288} rx={17} ry={27} fill={C.piel} {...L} />
      {/* cara */}
      <path d="M 216 228 Q 214 172 252 158 Q 300 146 348 158 Q 386 172 384 228 L 381 318 Q 374 376 330 398 Q 300 410 270 398 Q 226 376 219 318 Z" fill={C.piel} {...L} />
      {/* barba de días */}
      <path d="M 222 318 Q 230 372 270 394 Q 300 406 330 394 Q 370 372 378 318 Q 360 352 330 352 Q 300 366 270 352 Q 240 352 222 318 Z" fill={C.barba} opacity={0.55} />
      {Array.from({ length: 34 }, (_, i) => {
        const a = (i * 137.5) % 360;
        const r = 18 + ((i * 53) % 60);
        const x = 300 + Math.cos((a * Math.PI) / 180) * r * 1.3;
        const y = 372 + Math.sin((a * Math.PI) / 180) * r * 0.32;
        return <circle key={i} cx={x} cy={y} r={2} fill={C.linea} opacity={0.55} />;
      })}
      {/* ojeras */}
      {!feliz ? (
        <>
          <path d="M 236 288 Q 262 306 288 288" fill="none" stroke={C.ojera} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          <path d="M 312 288 Q 338 306 364 288" fill="none" stroke={C.ojera} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
        </>
      ) : null}
      {/* ojos */}
      <Ojo cx={262} cy={268} abierto={abierto} pupila={shock ? 5 : 7} mira={mirada} feliz={feliz} apretado={llora} espejo={false} />
      <Ojo cx={338} cy={268} abierto={abierto} pupila={shock ? 5 : 7} mira={mirada} feliz={feliz} apretado={llora} espejo />
      {/* cejas */}
      <g transform={`translate(0 ${cejaY})`}>
        <path d={llora ? "M 232 236 Q 258 236 286 222" : "M 230 240 Q 258 226 288 236"} fill="none" stroke={C.pelo} strokeWidth={12} strokeLinecap="round" />
        <path d={llora ? "M 314 222 Q 342 236 368 236" : "M 312 236 Q 342 226 370 240"} fill="none" stroke={C.pelo} strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* nariz */}
      <path d="M 300 282 Q 290 318 298 326 Q 308 330 316 322" fill="none" {...L} strokeWidth={5} />
      {/* boca */}
      {feliz ? (
        <g>
          <path d="M 264 344 Q 300 352 336 344 Q 332 388 300 390 Q 268 388 264 344 Z" fill={C.boca} {...L} strokeWidth={5} />
          <path d="M 268 347 Q 300 354 332 347 L 330 360 Q 300 366 270 360 Z" fill="#FBF7EF" />
        </g>
      ) : ab > 0.04 ? (
        <g>
          <ellipse cx={300} cy={358 + ab * 8} rx={20 + ab * 6} ry={5 + ab * 20} fill={C.boca} {...L} strokeWidth={5} />
          <ellipse cx={300} cy={362 + ab * 20} rx={11 + ab * 4} ry={3 + ab * 6} fill={C.lengua} />
        </g>
      ) : (
        <path d={llora ? "M 278 366 Q 300 350 322 366" : "M 278 362 Q 300 354 322 364"} fill="none" {...L} strokeWidth={5} />
      )}
      {/* lágrimas */}
      {llora
        ? [262, 338].map((x, i) => (
            <path key={i} d={`M ${x - 8} 282 Q ${x - 14} ${330 + ((t * 120 + i * 40) % 40)} ${x - 6} 392 L ${x + 6} 392 Q ${x + 10} 330 ${x + 8} 282 Z`} fill={C.lagrima} opacity={0.9} />
          ))
        : null}
      {/* pelo */}
      <path
        d="M 196 318 C 188 290 186 262 192 240 L 168 226 L 190 210 C 176 186 186 160 208 150 L 196 120 L 232 132 C 240 110 262 96 282 104 L 296 74 L 312 106 C 334 92 362 100 372 118 L 404 104 L 394 140 C 414 150 424 172 418 196 L 442 214 L 414 226 C 418 254 414 284 404 312 L 392 268 C 390 232 382 210 366 196 L 362 226 L 344 192 L 330 216 L 318 186 L 300 222 L 290 186 L 268 208 L 262 182 C 238 192 222 214 216 250 L 210 292 Z"
        fill={C.pelo}
        {...L}
        strokeWidth={4}
      />
    </g>
  );
};

const Cuerpo: React.FC = () => (
  <g>
    {/* pantalón */}
    <path d="M 192 780 L 408 780 L 420 1182 L 316 1182 L 304 900 L 296 900 L 284 1182 L 178 1182 Z" fill={C.gris} {...L} />
    <path d="M 230 900 Q 236 1040 228 1170 M 372 900 Q 366 1040 374 1170" fill="none" stroke={C.grisSombra} strokeWidth={5} opacity={0.8} />
    <rect x={176} y={1156} width={110} height={30} rx={12} fill={C.grisSombra} {...L} />
    <rect x={314} y={1156} width={110} height={30} rx={12} fill={C.grisSombra} {...L} />
    {/* calcetines y pantuflas rotas */}
    <rect x={200} y={1184} width={64} height={22} fill={C.camiseta} {...L} strokeWidth={4} />
    <rect x={336} y={1184} width={64} height={22} fill={C.camiseta} {...L} strokeWidth={4} />
    <path d="M 160 1236 Q 160 1200 230 1202 Q 290 1204 292 1236 Z" fill="#7E8287" {...L} />
    <path d="M 308 1236 Q 310 1204 372 1202 Q 442 1200 440 1236 Z" fill="#6E5E4A" {...L} />
    <ellipse cx={186} cy={1222} rx={12} ry={7} fill="#8A3C3A" opacity={0.8} />
    <ellipse cx={420} cy={1224} rx={10} ry={6} fill="#8A3C3A" opacity={0.8} />
    {/* sudadera */}
    <path d="M 176 470 Q 190 440 250 432 L 350 432 Q 410 440 424 470 L 440 760 Q 442 798 408 800 L 192 800 Q 158 798 160 760 Z" fill={C.rojo} {...L} />
    <rect x={164} y={770} width={272} height={34} rx={14} fill={C.rojoSombra} {...L} />
    <path d="M 226 652 L 374 652 L 394 736 L 206 736 Z" fill="none" {...L} strokeWidth={5} />
    {[
      [248, 560, 14, 10],
      [356, 600, 11, 8],
      [300, 700, 16, 9],
      [214, 520, 8, 6],
      [380, 520, 9, 7],
    ].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={C.mancha} opacity={0.75} />
    ))}
    {/* brazo izquierdo (colgando) */}
    <path d="M 180 466 Q 140 478 132 560 L 122 746 Q 122 772 150 774 L 180 774 L 190 560 Z" fill={C.rojo} {...L} />
    <rect x={118} y={756} width={66} height={30} rx={12} fill={C.rojoSombra} {...L} />
    <path d="M 128 786 Q 124 830 140 846 Q 160 856 172 840 Q 182 816 178 786 Z" fill={C.piel} {...L} />
    {/* brazo derecho (mano al bolsillo del pantalón) */}
    <path d="M 420 466 Q 462 478 468 560 L 470 700 Q 470 744 436 790 L 404 772 Q 424 720 418 560 Z" fill={C.rojo} {...L} />
    <path d="M 404 772 L 436 790 L 430 812 L 400 800 Z" fill={C.rojoSombra} {...L} strokeWidth={4} />
    {/* cuello de la capucha, camiseta y cuello (la diadema de los audífonos pasa por detrás) */}
    <path d="M 246 430 Q 300 380 354 430" fill="none" stroke={C.cascosClaro} strokeWidth={16} strokeLinecap="round" />
    <rect x={272} y={380} width={56} height={60} fill={C.pielSombra} {...L} />
    <path d="M 282 432 L 300 458 L 318 432 Z" fill={C.camiseta} {...L} strokeWidth={4} />
    <path d="M 226 446 Q 300 492 374 446 Q 372 418 340 410 L 330 432 Q 300 470 270 432 L 260 410 Q 228 418 226 446 Z" fill={C.rojoSombra} {...L} />
    {/* cordones */}
    <path d="M 284 466 L 280 590 M 316 466 L 320 590" stroke={C.cordon} strokeWidth={6} strokeLinecap="round" />
    <circle cx={280} cy={594} r={6} fill={C.cordon} />
    <circle cx={320} cy={594} r={6} fill={C.cordon} />
    {/* audífonos viejos al cuello: cascos apoyados en las clavículas */}
    {[
      [238, 486, -14],
      [362, 486, 14],
    ].map(([x, y, g], i) => (
      <g key={i} transform={`rotate(${g} ${x} ${y})`}>
        <rect x={x - 14} y={y - 70} width={28} height={30} rx={8} fill={C.cascosClaro} {...L} strokeWidth={4} />
        <ellipse cx={x} cy={y} rx={36} ry={46} fill={C.cascos} {...L} />
        <ellipse cx={x} cy={y} rx={22} ry={31} fill={C.cascosClaro} />
        <ellipse cx={x + (i ? -7 : 7)} cy={y + 12} rx={11} ry={14} fill={C.oxido} opacity={0.85} />
        <ellipse cx={x + (i ? 10 : -10)} cy={y - 18} rx={6} ry={8} fill={C.oxido} opacity={0.7} />
      </g>
    ))}
  </g>
);

/** Toño completo (o solo la cabeza). `ancho` en píxeles; la caja es 600 × 1300. */
export const Tono: React.FC<PropsTono> = ({ ancho = 600, soloCabeza, ...p }) =>
  soloCabeza ? (
    <svg width={ancho} height={ancho * (330 / 300)} viewBox="150 80 300 330">
      <Cabeza {...p} />
    </svg>
  ) : (
    <svg width={ancho} height={ancho * (1300 / 600)} viewBox="0 0 600 1300">
      <Cuerpo />
      <Cabeza {...p} />
    </svg>
  );
