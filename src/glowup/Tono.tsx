import React, { useId } from "react";

// Toño (docs/glowup.md), redibujado en SVG a partir de la hoja de Gemini
// (public/glowup/personaje/referencia-nivel0.jpg) para animarlo por partes: boca, párpados,
// cejas, mirada, lágrimas, expresiones y poses. Caja de 600 × 1300 con los pies en y≈1240.
// Estilo plano con sombras de dos tonos (cel), contorno oscuro y detalles (pliegues, brillos,
// barba recortada a la cara, manos con dedos).

export type Expresion = "aburrido" | "shock" | "llora" | "feliz";
export type Pose = "normal" | "bolsillos" | "sostiene" | "celebra" | "ofrece" | "telefono";
export type Ropa = "sudadera" | "lavaplatos";
export type PropsTono = {
  expresion?: Expresion;
  pose?: Pose;
  ropa?: Ropa; // "lavaplatos": uniforme del restaurante (camisa blanca, delantal, gorro y guantes)
  boca?: number; // 0 cerrada … 1 muy abierta
  parpadeo?: number; // 0 abierto … 1 cerrado
  mirada?: number; // −1 izquierda … 1 derecha
  nivel?: number; // 0 en la ruina … 3 meta cumplida (de momento solo se dibuja el 0)
  t?: number; // segundos (lágrimas, bolsillos que se mecen)
  ancho?: number;
  soloCabeza?: boolean;
};

const C = {
  linea: "#1E1A19",
  piel: "#CB8D60",
  pielSombra: "#B0744B",
  pielLuz: "#DCA27A",
  barba: "#5E4433",
  pelo: "#171515",
  peloLuz: "#3A3533",
  ojera: "#7C5B72",
  iris: "#4A2E20",
  rojo: "#C9352E",
  rojoSombra: "#A3291F",
  rojoLuz: "#DB4B41",
  mancha: "#8E2420",
  gris: "#6E767E",
  grisSombra: "#575F68",
  grisLuz: "#828A92",
  cordon: "#C2C6CB",
  camiseta: "#ECE8E1",
  cascos: "#525A50",
  cascosClaro: "#7E8873",
  oxido: "#9B5B2E",
  boca: "#5A1A1E",
  lengua: "#D46F74",
  dientes: "#EFE6C8",
  lagrima: "#7CC8F2",
  pantuflaGris: "#7E8287",
  pantuflaCafe: "#6C5B47",
};
const L = { stroke: C.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const CARA = "M 216 228 Q 214 172 252 158 Q 300 146 348 158 Q 386 172 384 228 L 381 318 Q 374 376 330 398 Q 300 410 270 398 Q 226 376 219 318 Z";

const Ojo: React.FC<{ id: string; cx: number; cy: number; abierto: number; mira: number; shock: boolean; feliz: boolean; apretado: boolean }> = ({ id, cx, cy, abierto, mira, shock, feliz, apretado }) => {
  if (apretado) return <path d={`M ${cx - 22} ${cy - 4} Q ${cx} ${cy + 10} ${cx + 22} ${cy - 4}`} fill="none" {...L} strokeWidth={7} />;
  if (feliz) return <path d={`M ${cx - 22} ${cy + 6} Q ${cx} ${cy - 16} ${cx + 22} ${cy + 6}`} fill="none" {...L} strokeWidth={7} />;
  const rx = 25;
  const ry = 18;
  const tapa = 1 - abierto;
  const yTapa = cy - ry + tapa * 2 * ry;
  const px = cx + mira * 9;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FBF6EC" />
      <g clipPath={`url(#${id})`}>
        <path d={`M ${cx - rx} ${cy + 8} Q ${cx} ${cy + 22} ${cx + rx} ${cy + 8} L ${cx + rx} ${cy + ry} L ${cx - rx} ${cy + ry} Z`} fill="#E3D8C8" />
        <circle cx={px} cy={cy + 2} r={shock ? 7 : 10} fill={C.iris} />
        <circle cx={px} cy={cy + 2} r={shock ? 3.5 : 5} fill={C.linea} />
        <circle cx={px + 3} cy={cy - 2} r={2.6} fill="#fff" />
        {tapa > 0.02 ? <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={yTapa - (cy - ry) + 2} fill={C.piel} /> : null}
        {tapa > 0.02 ? <path d={`M ${cx - rx} ${yTapa} L ${cx + rx} ${yTapa}`} stroke={C.linea} strokeWidth={6} /> : null}
        {tapa > 0.02 ? <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={Math.max(0, yTapa - (cy - ry) - 4)} fill={C.pielSombra} opacity={0.35} /> : null}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" {...L} strokeWidth={5} />
      {/* pestañas en la esquina de afuera */}
      <path d={cx < 300 ? `M ${cx - rx + 2} ${cy - 4} l -8 -6` : `M ${cx + rx - 2} ${cy - 4} l 8 -6`} {...L} strokeWidth={4} />
    </g>
  );
};

export const Cabeza: React.FC<PropsTono & { uid: string; gorro?: boolean }> = ({ uid, gorro = false, expresion = "aburrido", boca = 0, parpadeo = 0, mirada = 0, t = 0 }) => {
  const shock = expresion === "shock";
  const feliz = expresion === "feliz";
  const llora = expresion === "llora";
  const base = shock ? 1 : llora ? 0.15 : 0.45;
  const abierto = Math.max(0, base * (1 - parpadeo));
  const cejaY = shock ? -14 : llora ? -6 : 0;
  const ab = Math.max(boca, shock ? 0.75 : 0);
  const cara = `cara-${uid}`;
  return (
    <g>
      <defs>
        <clipPath id={cara}>
          <path d={CARA} />
        </clipPath>
      </defs>
      {/* orejas */}
      {[212, 388].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={288} rx={17} ry={27} fill={C.piel} {...L} />
          <path d={i ? `M ${x - 2} 272 Q ${x + 8} 288 ${x - 2} 304` : `M ${x + 2} 272 Q ${x - 8} 288 ${x + 2} 304`} fill="none" stroke={C.pielSombra} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* cuello (sombra bajo la barbilla) */}
      <path d="M 272 384 L 272 440 L 328 440 L 328 384 Z" fill={C.pielSombra} {...L} />
      <path d="M 272 392 Q 300 420 328 392 L 328 384 L 272 384 Z" fill="#94603C" />
      {/* cara */}
      <path d={CARA} fill={C.piel} />
      <g clipPath={`url(#${cara})`}>
        {/* sombra del lado derecho y de la frente bajo el pelo */}
        <path d="M 352 150 Q 392 200 386 300 Q 380 380 330 404 L 420 420 L 420 140 Z" fill={C.pielSombra} opacity={0.55} />
        <path d="M 200 150 L 400 150 L 400 214 Q 360 196 330 214 Q 300 196 270 214 Q 240 196 200 220 Z" fill={C.pielSombra} opacity={0.5} />
        {/* luz en el pómulo izquierdo */}
        <ellipse cx={246} cy={318} rx={20} ry={12} fill={C.pielLuz} opacity={0.6} />
        {/* barba de días: mancha + pelitos, todo dentro de la cara */}
        <path d="M 214 300 Q 226 372 270 396 Q 300 410 330 396 Q 374 372 386 300 Q 362 350 330 348 Q 300 362 270 348 Q 238 350 214 300 Z" fill={C.barba} opacity={0.45} />
        <path d="M 270 338 Q 300 328 330 338 L 326 346 Q 300 338 274 346 Z" fill={C.barba} opacity={0.5} />
        {Array.from({ length: 56 }, (_, i) => {
          const u = (i * 0.618) % 1;
          const v = (i * 0.414) % 1;
          const x = 228 + u * 144;
          const y = 336 + v * 66 - Math.abs(x - 300) * 0.25;
          return <circle key={i} cx={x} cy={y} r={1.7 + ((i * 7) % 3) * 0.4} fill={C.linea} opacity={0.45} />;
        })}
      </g>
      <path d={CARA} fill="none" {...L} />
      {/* ojeras con arruguitas */}
      {!feliz ? (
        <>
          <path d="M 236 288 Q 262 308 288 288" fill="none" stroke={C.ojera} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          <path d="M 312 288 Q 338 308 364 288" fill="none" stroke={C.ojera} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          <path d="M 244 302 Q 262 312 280 302 M 320 302 Q 338 312 356 302" fill="none" stroke="#5E4253" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        </>
      ) : null}
      {/* ojos */}
      <Ojo id={`oi-${uid}`} cx={262} cy={268} abierto={abierto} mira={mirada} shock={shock} feliz={feliz} apretado={llora} />
      <Ojo id={`od-${uid}`} cx={338} cy={268} abierto={abierto} mira={mirada} shock={shock} feliz={feliz} apretado={llora} />
      {/* cejas pobladas */}
      <g transform={`translate(0 ${cejaY})`}>
        <path d={llora ? "M 230 238 Q 258 238 288 222" : "M 228 242 Q 258 226 290 236"} fill="none" stroke={C.pelo} strokeWidth={14} strokeLinecap="round" />
        <path d={llora ? "M 312 222 Q 342 238 370 238" : "M 310 236 Q 342 226 372 242"} fill="none" stroke={C.pelo} strokeWidth={14} strokeLinecap="round" />
        <path d="M 236 234 l 6 -8 M 250 230 l 6 -9 M 264 228 l 6 -8 M 330 228 l -6 -8 M 344 230 l -6 -9 M 358 234 l -6 -8" stroke={C.pelo} strokeWidth={3} strokeLinecap="round" />
      </g>
      {/* arrugas de la frente en shock */}
      {shock ? <path d="M 262 196 Q 300 186 338 196 M 270 210 Q 300 202 330 210" fill="none" stroke={C.pielSombra} strokeWidth={4} strokeLinecap="round" /> : null}
      {/* nariz */}
      <path d="M 302 280 Q 292 316 296 324" fill="none" stroke={C.pielSombra} strokeWidth={6} strokeLinecap="round" />
      <path d="M 286 324 Q 290 334 302 332 Q 314 334 318 322" fill="none" {...L} strokeWidth={5} />
      <circle cx={292} cy={326} r={2.6} fill={C.linea} />
      <circle cx={311} cy={326} r={2.6} fill={C.linea} />
      {/* boca */}
      {feliz ? (
        <g>
          <path d="M 262 344 Q 300 354 338 344 Q 334 390 300 392 Q 266 390 262 344 Z" fill={C.boca} {...L} strokeWidth={5} />
          <path d="M 268 348 Q 300 356 332 348 L 330 362 Q 300 368 270 362 Z" fill={C.dientes} />
          <path d="M 286 352 L 286 364 M 300 354 L 300 366 M 314 352 L 314 364" stroke="#C9B98E" strokeWidth={2} />
          <path d="M 280 380 Q 300 388 320 380" fill="none" stroke={C.lengua} strokeWidth={8} strokeLinecap="round" />
        </g>
      ) : ab > 0.04 ? (
        <g>
          <ellipse cx={300} cy={358 + ab * 8} rx={20 + ab * 6} ry={5 + ab * 20} fill={C.boca} {...L} strokeWidth={5} />
          {ab > 0.4 ? <path d={`M ${286 - ab * 4} ${348 + ab * 2} H ${314 + ab * 4} V ${354 + ab * 2} H ${286 - ab * 4} Z`} fill={C.dientes} /> : null}
          <ellipse cx={300} cy={362 + ab * 20} rx={11 + ab * 4} ry={3 + ab * 6} fill={C.lengua} />
        </g>
      ) : (
        <g>
          <path d={llora ? "M 276 368 Q 300 350 324 368" : "M 278 362 Q 300 354 322 364"} fill="none" {...L} strokeWidth={5} />
          <path d={llora ? "M 286 376 Q 300 372 314 376" : "M 288 372 Q 300 376 312 372"} fill="none" stroke={C.pielSombra} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {/* lágrimas */}
      {llora
        ? [262, 338].map((x, i) => (
            <g key={i}>
              <path d={`M ${x - 8} 280 Q ${x - 14} 334 ${x - 6} 394 L ${x + 6} 394 Q ${x + 10} 334 ${x + 8} 280 Z`} fill={C.lagrima} opacity={0.9} />
              <circle cx={x - 2} cy={300 + ((t * 160 + i * 50) % 90)} r={5} fill="#E6F6FF" />
            </g>
          ))
        : null}
      {gorro ? (
        <>
          {/* con el gorro de cocina el pelo queda tapado: solo asoman las patillas */}
          <path d="M 206 236 Q 200 270 210 300 L 222 296 Q 216 266 222 240 Z M 394 236 Q 400 270 390 300 L 378 296 Q 384 266 378 240 Z" fill={C.pelo} {...L} strokeWidth={3} />
          <Gorro />
        </>
      ) : (
        <>
      {/* pelo: masa, brillos y mechones sueltos */}
          <path
            d="M 196 318 C 188 290 186 262 192 240 L 168 226 L 190 210 C 176 186 186 160 208 150 L 196 120 L 232 132 C 240 110 262 96 282 104 L 296 74 L 312 106 C 334 92 362 100 372 118 L 404 104 L 394 140 C 414 150 424 172 418 196 L 442 214 L 414 226 C 418 254 414 284 404 312 L 392 268 C 390 232 382 210 366 196 L 362 226 L 344 192 L 330 216 L 318 186 L 300 222 L 290 186 L 268 208 L 262 182 C 238 192 222 214 216 250 L 210 292 Z"
            fill={C.pelo}
            {...L}
            strokeWidth={4}
          />
          <path d="M 236 140 Q 262 122 290 126 M 318 118 Q 346 116 366 132 M 214 178 Q 226 160 246 152 M 384 166 Q 398 178 402 196" fill="none" stroke={C.peloLuz} strokeWidth={7} strokeLinecap="round" />
          <path d="M 200 280 Q 196 300 204 318 M 404 286 Q 410 300 402 318 M 296 74 Q 292 60 300 52 M 404 104 Q 416 96 424 98" fill="none" stroke={C.pelo} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

/** Mano con dedos (cx, cy = centro de la palma). */
export const Mano: React.FC<{ x: number; y: number; giro?: number; espejo?: boolean }> = ({ x, y, giro = 0, espejo }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${espejo ? -1 : 1} 1)`}>
    <path d="M -22 -24 Q -28 10 -20 30 Q -16 44 -6 46 L 0 46 Q 4 50 10 46 Q 16 48 20 40 Q 26 38 26 28 L 24 -24 Z" fill={C.piel} {...L} strokeWidth={5} />
    <path d="M -4 20 L -4 40 M 8 20 L 9 40 M 18 16 L 20 32" stroke={C.pielSombra} strokeWidth={3} strokeLinecap="round" />
    <path d="M -22 -6 Q -36 0 -32 16 Q -28 22 -20 16" fill={C.piel} {...L} strokeWidth={5} />
  </g>
);

/** Brazo con manga de la sudadera articulado: hombro → codo → mano (puño elástico y mano con dedos). */
const Brazo: React.FC<{ h: [number, number]; c: [number, number]; m: [number, number]; giro?: number; espejo?: boolean }> = ({ h, c, m, giro = 0, espejo }) => {
  const d = `M ${h[0]} ${h[1]} L ${c[0]} ${c[1]} L ${m[0]} ${m[1]}`;
  const ang = (Math.atan2(m[1] - c[1], m[0] - c[0]) * 180) / Math.PI;
  return (
    <g>
      <path d={d} fill="none" stroke={C.linea} strokeWidth={76} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.rojo} strokeWidth={64} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${h[0]} ${h[1] + 16} L ${c[0] + 8} ${c[1]}`} fill="none" stroke={C.rojoLuz} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
      <g transform={`translate(${m[0]} ${m[1]}) rotate(${ang - 90})`}>
        <rect x={-34} y={-30} width={68} height={30} rx={12} fill={C.rojoSombra} {...L} />
      </g>
      <Mano x={m[0] + Math.cos((ang * Math.PI) / 180) * 30} y={m[1] + Math.sin((ang * Math.PI) / 180) * 30} giro={ang - 90 + giro} espejo={espejo} />
    </g>
  );
};

/** Posición de los brazos por pose: [hombro, codo, mano] izquierdo y derecho (caja 600 × 1300). */
const BRAZOS: Partial<Record<Pose, [[number, number], [number, number], [number, number]][]>> = {
  sostiene: [[[182, 480], [128, 650], [214, 560]], [[418, 480], [472, 650], [386, 560]]],
  celebra: [[[182, 480], [92, 380], [110, 220]], [[418, 480], [508, 380], [490, 220]]],
  ofrece: [[[182, 480], [140, 620], [150, 760]], [[418, 480], [520, 640], [630, 740]]],
  telefono: [[[182, 480], [140, 660], [248, 620]], [[418, 480], [460, 660], [352, 620]]],
};

/** Uniforme de lavaplatos: camisa blanca de manga corta, delantal azul con su nombre y guantes
 * amarillos de goma (sin sudadera ni audífonos). Las piernas y pantuflas son las mismas. */
const Uniforme: React.FC = () => (
  <g>
    {/* brazos: antebrazo con piel y guante amarillo */}
    {[
      [150, 1],
      [450, -1],
    ].map(([x, d], i) => (
      <g key={i}>
        <path d={`M ${x + d * 34} 540 L ${x - d * 4} 560 L ${x - d * 10} 720 L ${x + d * 40} 724 L ${x + d * 44} 560 Z`} fill={C.piel} {...L} />
        <path d={`M ${x - d * 14} 700 L ${x + d * 44} 700 L ${x + d * 48} 760 Q ${x + d * 40} 812 ${x + d * 14} 812 Q ${x - d * 18} 808 ${x - d * 18} 770 Z`} fill="#F2CF2E" {...L} />
        <path d={`M ${x - d * 14} 704 L ${x + d * 44} 704`} stroke="#C9A615" strokeWidth={8} />
      </g>
    ))}
    {/* camisa blanca */}
    <path d="M 176 470 Q 190 440 250 432 L 350 432 Q 410 440 424 470 L 440 760 Q 442 798 408 800 L 192 800 Q 158 798 160 760 Z" fill="#F6F5F0" {...L} />
    <path d="M 380 450 Q 420 460 424 480 L 440 760 Q 442 798 408 800 L 384 800 Q 402 640 380 450 Z" fill="#DCDAD2" />
    <path d="M 176 470 Q 140 482 128 560 L 186 572 Z M 424 470 Q 460 482 472 560 L 414 572 Z" fill="#F6F5F0" {...L} />
    <path d="M 268 434 L 300 476 L 332 434" fill="none" {...L} strokeWidth={5} />
    {/* delantal azul con su nombre */}
    <path d="M 236 470 L 364 470 L 380 560 L 410 800 L 190 800 L 220 560 Z" fill="#6FB2E0" {...L} />
    <path d="M 236 470 Q 300 430 364 470" fill="none" stroke="#6FB2E0" strokeWidth={14} />
    <path d="M 220 560 Q 160 560 150 580 M 380 560 Q 440 560 450 580" fill="none" stroke="#6FB2E0" strokeWidth={10} strokeLinecap="round" />
    <rect x={254} y={640} width={92} height={70} rx={10} fill="none" stroke="#4A8EBF" strokeWidth={6} />
    <rect x={250} y={500} width={100} height={40} rx={8} fill="#fff" {...L} strokeWidth={4} />
    <text x={300} y={531} textAnchor="middle" fontFamily={`"Lilita One", "Arial Black", sans-serif`} fontSize={30} fill={C.linea}>TOÑO</text>
    {[[240, 700, 12], [360, 740, 9], [300, 770, 7]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.8} stroke="#9CC9E8" strokeWidth={2} />
    ))}
    {/* cuello */}
    <rect x={272} y={384} width={56} height={56} fill={C.pielSombra} {...L} />
  </g>
);

/** Gorro de papel de cocina (va encima del pelo). */
const Gorro: React.FC = () => (
  <g>
    <path d="M 206 222 Q 196 104 300 92 Q 404 104 394 222 Z" fill="#FBFBF8" {...L} />
    <path d="M 198 206 L 402 206 L 400 246 L 200 246 Z" fill="#ECEBE5" {...L} strokeWidth={5} />
    <path d="M 246 140 Q 260 122 278 136 M 318 128 Q 334 112 352 130" fill="none" stroke="#D5D3CB" strokeWidth={4} strokeLinecap="round" />
  </g>
);

const Cuerpo: React.FC<{ pose: Pose; t: number; ropa: Ropa }> = ({ pose, t, ropa }) => {
  const bolsillos = pose === "bolsillos";
  const mece = Math.sin(t * 9) * 6;
  if (ropa === "lavaplatos") {
    return (
      <g>
        <path d="M 192 780 L 408 780 L 420 1182 L 316 1182 L 304 900 L 296 900 L 284 1182 L 178 1182 Z" fill={C.gris} {...L} />
        <path d="M 160 1238 Q 160 1200 230 1202 Q 290 1204 292 1238 Z" fill={C.pantuflaGris} {...L} />
        <path d="M 308 1238 Q 310 1204 372 1202 Q 442 1200 440 1238 Z" fill={C.pantuflaCafe} {...L} />
        <Uniforme />
      </g>
    );
  }
  return (
    <g>
      {/* pantalón con pliegues y sombra entre las piernas */}
      <path d="M 192 780 L 408 780 L 420 1182 L 316 1182 L 304 900 L 296 900 L 284 1182 L 178 1182 Z" fill={C.gris} {...L} />
      <path d="M 296 900 L 304 900 L 316 1182 L 290 1182 Z M 380 800 L 408 790 L 420 1182 L 396 1182 Z" fill={C.grisSombra} />
      <path d="M 200 800 L 214 1180" stroke={C.grisLuz} strokeWidth={10} opacity={0.6} />
      <path d="M 232 900 Q 240 1040 228 1170 M 372 900 Q 362 1040 374 1170 M 204 980 Q 230 990 262 976 M 336 1030 Q 364 1040 396 1026 M 196 1090 Q 222 1100 260 1088" fill="none" stroke={C.grisSombra} strokeWidth={5} strokeLinecap="round" />
      <path d="M 300 790 L 300 860" stroke={C.grisSombra} strokeWidth={5} />
      <rect x={176} y={1156} width={110} height={30} rx={12} fill={C.grisSombra} {...L} />
      <rect x={314} y={1156} width={110} height={30} rx={12} fill={C.grisSombra} {...L} />
      <path d="M 196 1164 L 196 1180 M 216 1164 L 216 1180 M 236 1164 L 236 1180 M 256 1164 L 256 1180 M 334 1164 L 334 1180 M 354 1164 L 354 1180 M 374 1164 L 374 1180 M 394 1164 L 394 1180" stroke={C.gris} strokeWidth={3} />
      {/* calcetines (uno con hueco) y pantuflas rotas */}
      <rect x={200} y={1184} width={64} height={24} fill={C.camiseta} {...L} strokeWidth={4} />
      <rect x={336} y={1184} width={64} height={24} fill={C.camiseta} {...L} strokeWidth={4} />
      <ellipse cx={228} cy={1198} rx={8} ry={5} fill={C.piel} stroke={C.linea} strokeWidth={2} />
      <path d="M 160 1238 Q 160 1200 230 1202 Q 290 1204 292 1238 Z" fill={C.pantuflaGris} {...L} />
      <path d="M 160 1238 L 292 1238 L 290 1246 L 162 1246 Z" fill="#5C5F63" {...L} strokeWidth={4} />
      <path d="M 308 1238 Q 310 1204 372 1202 Q 442 1200 440 1238 Z" fill={C.pantuflaCafe} {...L} />
      <path d="M 308 1238 L 440 1238 L 438 1246 L 310 1246 Z" fill="#4E4234" {...L} strokeWidth={4} />
      <path d="M 170 1226 Q 182 1214 196 1222 Q 186 1236 170 1226 Z" fill={C.piel} {...L} strokeWidth={3} />
      <ellipse cx={420} cy={1224} rx={10} ry={6} fill="#8A3C3A" opacity={0.8} />
      <path d="M 200 1214 L 214 1222 M 360 1214 L 372 1224 M 396 1212 L 404 1222" stroke="#3E3F42" strokeWidth={3} />

      {/* sudadera: base, sombras laterales, costuras y manchas */}
      <path d="M 176 470 Q 190 440 250 432 L 350 432 Q 410 440 424 470 L 440 760 Q 442 798 408 800 L 192 800 Q 158 798 160 760 Z" fill={C.rojo} {...L} />
      <path d="M 380 450 Q 420 460 424 480 L 440 760 Q 442 798 408 800 L 384 800 Q 402 640 380 450 Z" fill={C.rojoSombra} />
      <path d="M 214 470 Q 200 600 206 770" stroke={C.rojoLuz} strokeWidth={12} strokeLinecap="round" opacity={0.6} />
      <path d="M 250 520 Q 270 540 268 580 M 340 600 Q 330 640 342 680 M 230 620 Q 246 640 238 670" fill="none" stroke={C.rojoSombra} strokeWidth={4} strokeLinecap="round" />
      <rect x={164} y={770} width={272} height={34} rx={14} fill={C.rojoSombra} {...L} />
      <path d="M 186 776 L 186 798 M 206 776 L 206 798 M 226 776 L 226 798 M 246 776 L 246 798 M 266 776 L 266 798 M 286 776 L 286 798 M 306 776 L 306 798 M 326 776 L 326 798 M 346 776 L 346 798 M 366 776 L 366 798 M 386 776 L 386 798 M 406 776 L 406 798" stroke="#8D231B" strokeWidth={3} />
      <path d="M 226 652 L 374 652 L 394 736 L 206 736 Z" fill={C.rojoSombra} opacity={0.35} />
      <path d="M 226 652 L 374 652 L 394 736 L 206 736 Z" fill="none" {...L} strokeWidth={5} />
      <path d="M 232 662 L 368 662" stroke={C.rojoLuz} strokeWidth={4} opacity={0.7} />
      {[
        [248, 560, 14, 10],
        [356, 600, 11, 8],
        [300, 700, 16, 9],
        [214, 520, 8, 6],
        [380, 520, 9, 7],
        [262, 720, 7, 5],
      ].map(([x, y, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.mancha} opacity={0.8} />
          <ellipse cx={x + rx * 0.9} cy={y + ry * 0.6} rx={rx * 0.3} ry={ry * 0.3} fill={C.mancha} opacity={0.8} />
        </g>
      ))}

      {BRAZOS[pose] ? (
        <g>
          {BRAZOS[pose]!.map(([h, c, m], i) => (
            <Brazo key={i} h={h} c={c} m={m} espejo={i === 1} />
          ))}
        </g>
      ) : bolsillos ? (
        <g>
          {/* brazos abiertos hacia afuera, sacando los bolsillos del pantalón */}
          <path d="M 180 466 Q 132 482 118 560 L 104 700 Q 100 740 128 748 L 158 752 L 182 600 Z" fill={C.rojo} {...L} />
          <path d="M 420 466 Q 468 482 482 560 L 496 700 Q 500 740 472 748 L 442 752 L 418 600 Z" fill={C.rojo} {...L} />
          <path d="M 470 520 Q 486 600 492 700 L 472 748 L 450 750 Q 470 640 448 520 Z" fill={C.rojoSombra} />
          <rect x={98} y={732} width={66} height={30} rx={12} fill={C.rojoSombra} {...L} transform="rotate(6 131 747)" />
          <rect x={436} y={732} width={66} height={30} rx={12} fill={C.rojoSombra} {...L} transform="rotate(-6 469 747)" />
          {/* forros blancos de los bolsillos, vacíos, que se mecen */}
          <path d={`M 200 790 Q 116 796 100 ${880 + mece} Q 150 ${930 + mece} 218 ${858 + mece * 0.5} Z`} fill="#F1EDE4" {...L} strokeWidth={6} />
          <path d={`M 400 790 Q 484 796 500 ${880 - mece} Q 450 ${930 - mece} 382 ${858 - mece * 0.5} Z`} fill="#F1EDE4" {...L} strokeWidth={6} />
          <path d={`M 120 ${884 + mece} Q 150 ${900 + mece} 182 ${880 + mece} M 418 ${880 - mece} Q 450 ${900 - mece} 480 ${884 - mece}`} fill="none" stroke="#C9C2B4" strokeWidth={4} />
          <Mano x={122} y={806} giro={14} />
          <Mano x={478} y={806} giro={-14} espejo />
        </g>
      ) : (
        <g>
          {/* brazo izquierdo colgando */}
          <path d="M 180 466 Q 140 478 132 560 L 122 746 Q 122 772 150 774 L 180 774 L 190 560 Z" fill={C.rojo} {...L} />
          <path d="M 150 520 Q 140 640 142 760" stroke={C.rojoLuz} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
          <path d="M 150 600 Q 166 610 182 604 M 146 680 Q 162 690 180 684" fill="none" stroke={C.rojoSombra} strokeWidth={4} strokeLinecap="round" />
          <rect x={118} y={756} width={66} height={30} rx={12} fill={C.rojoSombra} {...L} />
          <Mano x={152} y={808} />
          {/* brazo derecho con la mano en el bolsillo del pantalón */}
          <path d="M 420 466 Q 462 478 468 560 L 470 700 Q 470 744 436 790 L 404 772 Q 424 720 418 560 Z" fill={C.rojo} {...L} />
          <path d="M 446 500 Q 464 560 464 690 L 446 760 L 430 768 Q 450 680 432 520 Z" fill={C.rojoSombra} />
          <path d="M 404 772 L 436 790 L 430 812 L 400 800 Z" fill={C.rojoSombra} {...L} strokeWidth={4} />
        </g>
      )}

      {/* capucha, camiseta y diadema de los audífonos (pasa por detrás del cuello) */}
      <path d="M 246 430 Q 300 380 354 430" fill="none" stroke={C.cascosClaro} strokeWidth={16} strokeLinecap="round" />
      <path d="M 282 432 L 300 458 L 318 432 Z" fill={C.camiseta} {...L} strokeWidth={4} />
      <path d="M 226 446 Q 300 492 374 446 Q 372 418 340 410 L 330 432 Q 300 470 270 432 L 260 410 Q 228 418 226 446 Z" fill={C.rojoSombra} {...L} />
      <path d="M 240 442 Q 300 474 360 442" fill="none" stroke="#8D231B" strokeWidth={4} />
      {/* cordones con puntas */}
      <path d="M 284 466 Q 278 530 280 590 M 316 466 Q 322 530 320 590" fill="none" stroke={C.cordon} strokeWidth={7} strokeLinecap="round" />
      <rect x={274} y={588} width={12} height={20} rx={3} fill="#8E949A" {...L} strokeWidth={3} />
      <rect x={314} y={588} width={12} height={20} rx={3} fill="#8E949A" {...L} strokeWidth={3} />
      {/* audífonos viejos: cascos sobre las clavículas, almohadillas rotas, óxido y cable */}
      <path d="M 372 520 Q 400 600 380 660 Q 372 690 392 720" fill="none" stroke="#3B3F3A" strokeWidth={5} strokeLinecap="round" />
      {[
        [238, 486, -14],
        [362, 486, 14],
      ].map(([x, y, g], i) => (
        <g key={i} transform={`rotate(${g} ${x} ${y})`}>
          <rect x={x - 14} y={y - 70} width={28} height={30} rx={8} fill={C.cascosClaro} {...L} strokeWidth={4} />
          <ellipse cx={x} cy={y} rx={36} ry={46} fill={C.cascos} {...L} />
          <ellipse cx={x} cy={y} rx={24} ry={33} fill={C.cascosClaro} stroke="#454B43" strokeWidth={3} />
          <ellipse cx={x - 8} cy={y - 14} rx={6} ry={10} fill="#9AA48E" opacity={0.8} />
          <ellipse cx={x + (i ? -7 : 7)} cy={y + 12} rx={11} ry={14} fill={C.oxido} opacity={0.85} />
          <ellipse cx={x + (i ? 10 : -10)} cy={y - 18} rx={6} ry={8} fill={C.oxido} opacity={0.7} />
          <path d={`M ${x - 20} ${y + 30} l 8 -6 l 4 8`} fill="none" stroke="#D9D2C0" strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

/** Toño completo (o solo la cabeza). `ancho` en píxeles; la caja es 600 × 1300. */
export const Tono: React.FC<PropsTono> = ({ ancho = 600, soloCabeza, pose = "normal", ropa = "sudadera", ...p }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return soloCabeza ? (
    <svg width={ancho} height={ancho * (330 / 300)} viewBox="150 80 300 330">
      <Cabeza uid={uid} {...p} />
    </svg>
  ) : (
    <svg width={ancho} height={ancho * (1300 / 600)} viewBox="0 0 600 1300" style={{ overflow: "visible" }}>
      <Cuerpo pose={pose} t={p.t ?? 0} ropa={ropa} />
      <Cabeza uid={uid} gorro={ropa === "lavaplatos"} {...p} />
    </svg>
  );
};
