import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut } from "../comun/animacion";
import { COL, FUENTE, rnd } from "./piezas";
import { Expresion, Tono } from "./Tono";

// Escenas extra para variar los fondos (corrección de Angel al Día 2): cama vista desde arriba,
// vestuario del restaurante con el calendario de la semana, calle bajo la lluvia y farmacia.

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Toño acostado visto desde arriba: solo asoma la cabeza sobre la almohada, la cobija lo tapa
 *  entero. Suena la alarma del teléfono; con la fiebre, termómetro, mejillas rojas, sudor y tos. */
export const Cama: React.FC<{
  t: number;
  tAlarma: number;
  tFin: number; // deja de sonar
  tFiebre: number;
  tTos: number;
  expresion: Expresion;
  parpadeo: number;
}> = ({ t, tAlarma, tFin, tFiebre, tTos, expresion, parpadeo }) => {
  const suena = t >= tAlarma && t < tFin;
  const vibra = suena ? Math.sin(t * 70) * 5 : 0;
  const fiebre = easeOut(clamp01((t - tFiebre) / 0.35));
  const tos = t >= tTos && t < tTos + 0.5 ? Math.sin((t - tTos) * 45) * 4 * (1 - (t - tTos) / 0.5) : 0;
  const respira = Math.sin(t * 2.2);
  // cabeza de 480 px: escala 1,6 sobre la caja 150..450 × 80..410
  const s = 1.6;
  const left = 300;
  const top = 330;
  const px = (x: number) => left + (x - 150) * s;
  const py = (y: number) => top + (y - 80) * s;
  return (
    <AbsoluteFill style={{ background: "#3B2F2A" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {/* suelo de madera */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={0} y={i * 170} width={1080} height={166} fill={i % 2 ? "#8A6346" : "#946C4D"} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`j${i}`} x1={(i * 337) % 1080} y1={i * 170} x2={(i * 337) % 1080} y2={i * 170 + 166} stroke="#6E4E37" strokeWidth={4} />
        ))}
        {/* mesita de noche con el teléfono */}
        <rect x={900} y={360} width={240} height={330} rx={14} fill="#6B4A33" {...L} />
        <rect x={918} y={380} width={204} height={290} rx={10} fill="#7A5740" />
        <g transform={`translate(${985 + vibra} 520) rotate(${8 + vibra * 0.6})`}>
          <rect x={-58} y={-100} width={116} height={200} rx={20} fill="#1F2226" {...L} strokeWidth={5} />
          <rect x={-48} y={-86} width={96} height={172} rx={12} fill={suena ? "#F7C948" : "#2E3440"} />
          <text x={0} y={-18} textAnchor="middle" fontFamily={FUENTE} fontSize={40} fill="#1C1A1A">6:00</text>
          <text x={0} y={22} textAnchor="middle" fontFamily={FUENTE} fontSize={18} fill="#1C1A1A">TRABAJO</text>
          <rect x={-34} y={44} width={68} height={26} rx={13} fill="#E8473F" />
        </g>
        {suena
          ? [0, 1, 2].map((i) => {
              const v = (t * 1.8 + i / 3) % 1;
              return <path key={i} d={`M ${900 - v * 60} ${450 - v * 50} Q ${870 - v * 80} ${520} ${900 - v * 60} ${590 + v * 50}`} fill="none" stroke="#FFF3C4" strokeWidth={8} strokeLinecap="round" opacity={1 - v} />;
            })
          : null}
        {/* colchón con sábana a cuadros */}
        <rect x={90} y={250} width={800} height={1720} rx={40} fill="#E9E4DA" {...L} />
        {Array.from({ length: 22 }, (_, f) => (
          <line key={`f${f}`} x1={96} y1={260 + f * 80} x2={884} y2={260 + f * 80} stroke="#D3CCBE" strokeWidth={10} />
        ))}
        {Array.from({ length: 10 }, (_, c) => (
          <line key={`c${c}`} x1={130 + c * 80} y1={256} x2={130 + c * 80} y2={1960} stroke="#D3CCBE" strokeWidth={10} />
        ))}
        {/* cabecero de madera */}
        <rect x={70} y={200} width={840} height={80} rx={20} fill="#6B4A33" {...L} />
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={150 + i * 136} y1={210} x2={150 + i * 136} y2={270} stroke="#563A27" strokeWidth={8} />)}
        {/* almohada */}
        <rect x={190} y={300} width={600} height={500} rx={110} fill="#F6F2EA" {...L} />
        <path d="M 240 360 Q 490 330 740 360 M 240 740 Q 490 770 740 740" fill="none" stroke="#DDD6C8" strokeWidth={8} />
      </svg>
      {/* cabeza sobre la almohada */}
      <div style={{ position: "absolute", left, top, rotate: `${tos}deg`, transformOrigin: "50% 80%" }}>
        <Tono soloCabeza ancho={480} expresion={expresion} parpadeo={parpadeo} t={t} />
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {/* mejillas rojas y sudor de fiebre */}
        <g opacity={fiebre}>
          <ellipse cx={px(250)} cy={py(326)} rx={42} ry={22} fill="#E5484D" opacity={0.55} />
          <ellipse cx={px(350)} cy={py(326)} rx={42} ry={22} fill="#E5484D" opacity={0.55} />
          {[0, 1].map((i) => {
            const v = (t * 0.9 + i * 0.5) % 1;
            return <path key={i} d={`M ${px(225 + i * 150)} ${py(200) + v * 70} q 12 22 0 34 q -12 -12 0 -34 Z`} fill="#8FD3F5" stroke={COL.linea} strokeWidth={3} opacity={1 - v} />;
          })}
        </g>
        {/* cobija gruesa que lo tapa hasta el cuello (respira) */}
        <path
          d={`M 70 ${875 - respira * 6} Q 300 ${830 - respira * 8} 540 ${845 - respira * 10} Q 780 ${830 - respira * 8} 910 ${875 - respira * 6} L 960 1960 L 30 1960 Z`}
          fill="#5A7BB5"
          {...L}
        />
        <defs>
          <clipPath id="cobija">
            <path d={`M 70 ${875 - respira * 6} Q 300 ${830 - respira * 8} 540 ${845 - respira * 10} Q 780 ${830 - respira * 8} 910 ${875 - respira * 6} L 960 1960 L 30 1960 Z`} />
          </clipPath>
        </defs>
        <g clipPath="url(#cobija)">
          {Array.from({ length: 8 }, (_, i) => <rect key={`v${i}`} x={40 + i * 130} y={800} width={56} height={1200} fill="#4A69A0" opacity={0.7} />)}
          {Array.from({ length: 10 }, (_, i) => <rect key={`h${i}`} x={0} y={960 + i * 130} width={1080} height={56} fill="#4A69A0" opacity={0.5} />)}
          {/* bulto de las rodillas y los pies */}
          <ellipse cx={420} cy={1500} rx={170} ry={120} fill="#fff" opacity={0.08} />
          <ellipse cx={660} cy={1520} rx={170} ry={120} fill="#fff" opacity={0.08} />
          <path d="M 300 1200 Q 360 1500 330 1900 M 760 1200 Q 700 1500 740 1900" fill="none" stroke="#2F4C7E" strokeWidth={10} opacity={0.6} />
        </g>
        {/* borde de la sábana doblada */}
        <path d={`M 80 ${900 - respira * 6} Q 540 ${950 - respira * 8} 900 ${900 - respira * 6}`} fill="none" stroke="#F6F2EA" strokeWidth={34} strokeLinecap="round" />
        <path d={`M 80 ${900 - respira * 6} Q 540 ${950 - respira * 8} 900 ${900 - respira * 6}`} fill="none" stroke="#DDD6C8" strokeWidth={6} strokeDasharray="18 14" />
        {/* manos que asoman agarrando la cobija */}
        <ellipse cx={360} cy={925} rx={46} ry={30} fill="#CB8D60" {...L} strokeWidth={5} />
        <ellipse cx={720} cy={925} rx={46} ry={30} fill="#CB8D60" {...L} strokeWidth={5} />
        {/* termómetro en la boca y la temperatura */}
        <g opacity={fiebre} transform={`rotate(${18 + tos} ${px(300)} ${py(360)})`}>
          <rect x={px(300)} y={py(360) - 12} width={190} height={24} rx={12} fill="#F4F4F4" {...L} strokeWidth={4} />
          <rect x={px(300) + 40} y={py(360) - 6} width={(80 + 60 * fiebre)} height={12} rx={6} fill="#E5484D" />
          <circle cx={px(300) + 186} cy={py(360)} r={16} fill="#E5484D" {...L} strokeWidth={4} />
        </g>
        {fiebre > 0 ? (
          <g transform={`translate(780 ${py(300)}) scale(${fiebre})`}>
            <rect x={-110} y={-48} width={220} height={96} rx={48} fill="#E5484D" {...L} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FUENTE} fontSize={62} fill="#fff">39,8°</text>
          </g>
        ) : null}
        {/* nubecitas de la tos */}
        {t >= tTos && t < tTos + 0.9
          ? [0, 1, 2].map((i) => {
              const v = clamp01((t - tTos - i * 0.08) / 0.8);
              return <circle key={i} cx={px(290) - v * (160 + i * 40)} cy={py(370) - v * (60 + i * 50)} r={22 + v * 30} fill="#F2F2F2" stroke="#C9CED3" strokeWidth={4} opacity={(1 - v) * 0.9} />;
            })
          : null}
      </svg>
      {/* luz fría de la mañana */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0) 30%, rgba(20,25,50,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Vestuario del restaurante: taquillas, banco y el calendario de la semana que se tacha. */
export const Vestuario: React.FC<{ t: number; t0: number; children?: React.ReactNode }> = ({ t, t0, children }) => {
  const dias = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect width={1080} height={1920} fill="#2F5D62" />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={0} y={i * 100} width={1080} height={4} fill="#2A5357" />
        ))}
        {/* taquillas */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 10 + i * 214;
          return (
            <g key={i}>
              <rect x={x} y={600} width={204} height={860} fill={i % 2 ? "#8EA3B5" : "#9AAFC0"} {...L} />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={x + 50} y={640 + k * 26} width={104} height={10} rx={5} fill="#5F7385" />
              ))}
              <rect x={x + 160} y={900} width={16} height={70} rx={6} fill="#5F7385" {...L} strokeWidth={3} />
              <circle cx={x + 100} cy={760} r={16} fill="#E1E6EA" {...L} strokeWidth={3} />
            </g>
          );
        })}
        {/* calendario de la semana pegado arriba */}
        <rect x={140} y={300} width={800} height={250} rx={14} fill="#FBFBF7" {...L} />
        <rect x={140} y={300} width={800} height={70} rx={14} fill={COL.rojo} {...L} />
        <text x={540} y={352} textAnchor="middle" fontFamily={FUENTE} fontSize={46} fill="#fff">ESTA SEMANA</text>
        {dias.map((d, i) => {
          const x = 140 + 800 * ((i + 0.5) / 7);
          const k = easeOut(clamp01((t - t0 - i * 0.12) / 0.15));
          return (
            <g key={d}>
              <text x={x} y={418} textAnchor="middle" fontFamily={FUENTE} fontSize={30} fill={COL.linea}>{d}</text>
              <rect x={x - 44} y={432} width={88} height={92} rx={10} fill="#EDE8DC" stroke="#B9B2A3" strokeWidth={3} />
              {k > 0 ? (
                <path d={`M ${x - 30} ${448} L ${x - 30 + 60 * k} ${448 + 60 * k} M ${x + 30} ${448} L ${x + 30 - 60 * k} ${448 + 60 * k}`} stroke="#E8473F" strokeWidth={12} strokeLinecap="round" />
              ) : null}
            </g>
          );
        })}
      </svg>
      {children}
      {/* banco delante (tapa las piernas) */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect y={1440} width={1080} height={480} fill="#4C4A48" />
        <rect x={-20} y={1360} width={1120} height={70} rx={14} fill="#B98A5B" {...L} />
        <rect x={120} y={1430} width={40} height={300} fill="#5F5C59" {...L} strokeWidth={4} />
        <rect x={920} y={1430} width={40} height={300} fill="#5F5C59" {...L} strokeWidth={4} />
        <rect x={680} y={1300} width={160} height={70} rx={10} fill="#E8E2D2" {...L} strokeWidth={4} />
        <text x={760} y={1346} textAnchor="middle" fontFamily={FUENTE} fontSize={30} fill={COL.linea}>PAGO</text>
      </svg>
    </AbsoluteFill>
  );
};

/** Calle de vuelta a casa: edificios que pasan, nube de lluvia encima de Toño. */
export const Calle: React.FC<{ t: number; t0: number; children?: React.ReactNode }> = ({ t, t0, children }) => {
  const d = (t - t0) * 260;
  const colores = ["#C97B5A", "#D9B26F", "#7FA1B8", "#B88FB0", "#8DB58A"];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect width={1080} height={1920} fill="#8E9AA6" />
        {Array.from({ length: 8 }, (_, i) => {
          const ancho = 300;
          const x = ((i * ancho - d) % (ancho * 6) + ancho * 6) % (ancho * 6) - ancho;
          const alto = 700 + rnd(i) * 400;
          return (
            <g key={i}>
              <rect x={x} y={1300 - alto} width={ancho - 10} height={alto} fill={colores[i % 5]} {...L} />
              {Array.from({ length: Math.floor(alto / 170) }, (_, f) =>
                [0, 1].map((c) => <rect key={`${f}-${c}`} x={x + 40 + c * 120} y={1300 - alto + 50 + f * 170} width={90} height={110} fill="#4E5F70" stroke={COL.linea} strokeWidth={4} />),
              )}
            </g>
          );
        })}
        {/* acera y calle */}
        <rect y={1300} width={1080} height={620} fill="#A9A49D" />
        {Array.from({ length: 8 }, (_, i) => {
          const x = ((i * 200 - d) % 1600 + 1600) % 1600 - 200;
          return <line key={i} x1={x} y1={1300} x2={x - 60} y2={1660} stroke="#8F8A83" strokeWidth={5} />;
        })}
        <rect y={1660} width={1080} height={260} fill="#4A4C50" />
        <rect y={1650} width={1080} height={20} fill="#D1CCC4" />
        {/* lluvia general fina */}
        {Array.from({ length: 50 }, (_, i) => {
          const v = (t * 1.6 + rnd(i)) % 1;
          const x = rnd(i + 3) * 1100;
          return <line key={i} x1={x} y1={v * 1950 - 60} x2={x - 10} y2={v * 1950} stroke="#DCE6EE" strokeWidth={3} opacity={0.5} />;
        })}
      </svg>
      {children}
      {/* nube oscura justo encima de él */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${540 + Math.sin(t * 3) * 10} 250)`}>
          {Array.from({ length: 14 }, (_, i) => {
            const v = (t * 2.4 + rnd(i + 20)) % 1;
            const x = -170 + rnd(i + 9) * 340;
            return <line key={i} x1={x} y1={60 + v * 480} x2={x - 8} y2={100 + v * 480} stroke="#7CC8F2" strokeWidth={8} strokeLinecap="round" />;
          })}
          <circle cx={-120} cy={30} r={80} fill="#4E5560" {...L} />
          <circle cx={0} cy={-10} r={110} fill="#4E5560" {...L} />
          <circle cx={130} cy={30} r={85} fill="#4E5560" {...L} />
          <rect x={-200} y={30} width={410} height={80} fill="#4E5560" />
          <path d="M -200 110 L 210 110" stroke={COL.linea} strokeWidth={6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Farmacia: letrero de cruz verde, estantes de medicinas y mostrador con caja registradora. */
export const Farmacia: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => {
  const cajas = ["#E8473F", "#4D7BB3", "#F7C948", "#72D15E", "#B88FB0", "#F29E4C"];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect width={1080} height={1920} fill="#DDEFE6" />
        {/* estantes */}
        {[0, 1, 2, 3].map((f) => (
          <g key={f}>
            {Array.from({ length: 9 }, (_, i) => {
              const alto = 70 + rnd(f * 9 + i) * 50;
              return <rect key={i} x={30 + i * 115} y={560 + f * 170 - alto} width={96} height={alto} rx={6} fill={cajas[(f * 3 + i) % 6]} {...L} strokeWidth={4} />;
            })}
            <rect x={0} y={560 + f * 170} width={1080} height={22} fill="#A9C7B8" {...L} strokeWidth={4} />
          </g>
        ))}
        {/* letrero con la cruz verde que parpadea */}
        <rect x={40} y={250} width={470} height={150} rx={20} fill="#1F3A2E" {...L} />
        <g transform="translate(120 325)" opacity={0.75 + 0.25 * Math.sin(t * 9)}>
          <rect x={-18} y={-50} width={36} height={100} fill="#4BE38A" />
          <rect x={-50} y={-18} width={100} height={36} fill="#4BE38A" />
        </g>
        <text x={330} y={348} textAnchor="middle" fontFamily={FUENTE} fontSize={58} fill="#4BE38A">FARMACIA</text>
      </svg>
      {children}
      {/* mostrador delante (tapa de la cintura para abajo) y caja registradora */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <rect x={-10} y={1150} width={1100} height={60} fill="#F4F4F0" {...L} />
        <rect x={-10} y={1210} width={1100} height={720} fill="#3F8F6A" {...L} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={40 + i * 345} y={1260} width={310} height={150} rx={12} fill="#4AA078" {...L} strokeWidth={4} />
            <rect x={155 + i * 345} y={1320} width={80} height={18} rx={9} fill="#2F6E50" />
            <rect x={40 + i * 345} y={1640} width={310} height={230} rx={12} fill="#4AA078" {...L} strokeWidth={4} />
          </g>
        ))}
        <g transform="translate(540 1755)">
          <rect x={-18} y={-56} width={36} height={112} fill="#FFFFFF" />
          <rect x={-56} y={-18} width={112} height={36} fill="#FFFFFF" />
        </g>
        {/* cestita con medicinas sobre el mostrador */}
        <path d="M 520 1150 L 540 1060 L 720 1060 L 740 1150 Z" fill="#E9D9B5" {...L} strokeWidth={5} />
        <rect x={560} y={1020} width={50} height={60} rx={6} fill="#E8473F" {...L} strokeWidth={4} />
        <rect x={620} y={1000} width={40} height={80} rx={8} fill="#F7C948" {...L} strokeWidth={4} />
        <rect x={668} y={1030} width={50} height={50} rx={6} fill="#4D7BB3" {...L} strokeWidth={4} />
        <path d="M 760 1150 L 790 1010 L 1010 1010 L 1040 1150 Z" fill="#5A5F66" {...L} />
        <rect x={810} y={1030} width={180} height={60} rx={8} fill="#9BE3B5" {...L} strokeWidth={4} />
        <text x={900} y={1074} textAnchor="middle" fontFamily={FUENTE} fontSize={40} fill="#1C3A2A">$30</text>
      </svg>
    </AbsoluteFill>
  );
};
