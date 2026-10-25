import React from "react";

// Objetos con volumen (degradados, brillo y sombra) para las escenas de gráficos, a falta de
// un pack 3D. Todos en una caja de 260 × 260 (escalable con `tam`).

const sombra = "drop-shadow(14px 22px 14px rgba(60,35,10,0.35))";

export const Rayo: React.FC<{ tam?: number }> = ({ tam = 260 }) => (
  <svg width={tam} height={tam} viewBox="0 0 260 260" style={{ filter: sombra, overflow: "visible" }}>
    <defs>
      <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF27A" />
        <stop offset="0.5" stopColor="#FFC21A" />
        <stop offset="1" stopColor="#E48A00" />
      </linearGradient>
    </defs>
    <path d="M150 10 L58 148 L118 148 L96 250 L204 100 L140 100 L170 10 Z" fill="#8A4A00" transform="translate(8 10)" />
    <path d="M150 10 L58 148 L118 148 L96 250 L204 100 L140 100 L170 10 Z" fill="url(#ray)" stroke="#9A5600" strokeWidth={6} strokeLinejoin="round" />
    <path d="M148 26 L84 132 L104 132" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Grifo: React.FC<{ tam?: number }> = ({ tam = 260 }) => (
  <svg width={tam} height={tam} viewBox="0 0 260 260" style={{ filter: sombra, overflow: "visible" }}>
    <defs>
      <linearGradient id="cromo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.45" stopColor="#B9C3CC" />
        <stop offset="0.55" stopColor="#8995A1" />
        <stop offset="1" stopColor="#D6DDE3" />
      </linearGradient>
      <linearGradient id="gota" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9BE7FF" />
        <stop offset="1" stopColor="#1C86E8" />
      </linearGradient>
    </defs>
    <rect x={30} y={70} width={150} height={52} rx={18} fill="url(#cromo)" stroke="#5E6873" strokeWidth={5} />
    <path d="M150 70 h46 a34 34 0 0 1 34 34 v40 h-46 v-30 h-34 Z" fill="url(#cromo)" stroke="#5E6873" strokeWidth={5} strokeLinejoin="round" />
    <rect x={70} y={34} width={70} height={30} rx={10} fill="url(#cromo)" stroke="#5E6873" strokeWidth={5} />
    <rect x={95} y={56} width={20} height={18} fill="#7C8792" />
    <rect x={10} y={66} width={26} height={60} rx={8} fill="#7C8792" stroke="#4E5761" strokeWidth={4} />
    <path d="M207 160 C207 160 186 190 186 204 a21 21 0 0 0 42 0 C228 190 207 160 207 160 Z" fill="url(#gota)" stroke="#0E5FAE" strokeWidth={4} />
    <ellipse cx={199} cy={200} rx={5} ry={9} fill="rgba(255,255,255,0.8)" />
  </svg>
);

export const Humedad: React.FC<{ tam?: number }> = ({ tam = 260 }) => (
  <svg width={tam} height={tam} viewBox="0 0 260 260" style={{ filter: sombra, overflow: "visible" }}>
    <defs>
      <linearGradient id="pared" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFDF8" />
        <stop offset="1" stopColor="#E7DFD1" />
      </linearGradient>
      <radialGradient id="mancha" cx="0.45" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#4C5A3A" stopOpacity={0.9} />
        <stop offset="0.6" stopColor="#6F7A4E" stopOpacity={0.65} />
        <stop offset="1" stopColor="#8C8A5E" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="gota2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9BE7FF" />
        <stop offset="1" stopColor="#1C86E8" />
      </linearGradient>
    </defs>
    {/* Trozo de pared en perspectiva. */}
    <path d="M30 40 L210 20 L230 200 L50 230 Z" fill="url(#pared)" stroke="#B9AE9B" strokeWidth={5} strokeLinejoin="round" />
    <path d="M210 20 L232 34 L250 210 L230 200 Z" fill="#CFC5B3" stroke="#B9AE9B" strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={120} cy={120} rx={78} ry={66} fill="url(#mancha)" />
    <ellipse cx={150} cy={170} rx={40} ry={26} fill="url(#mancha)" />
    {[[96, 98, 6], [140, 110, 4], [118, 150, 5], [80, 140, 3]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#3E4A30" opacity={0.8} />
    ))}
    <path d="M196 120 C196 120 178 146 178 158 a18 18 0 0 0 36 0 C214 146 196 120 196 120 Z" fill="url(#gota2)" stroke="#0E5FAE" strokeWidth={4} />
    <ellipse cx={189} cy={154} rx={4} ry={8} fill="rgba(255,255,255,0.8)" />
  </svg>
);

/** Etiqueta de precio con flecha hacia abajo (rebaja). */
export const EtiquetaRebaja: React.FC<{ k: number; tam?: number }> = ({ k, tam = 300 }) => (
  <svg width={tam} height={tam} viewBox="0 0 300 300" style={{ filter: "drop-shadow(14px 22px 14px rgba(60,0,0,0.45))", overflow: "visible" }}>
    <defs>
      <linearGradient id="eti" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E3E3E3" />
      </linearGradient>
      <linearGradient id="fle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B6FF6A" />
        <stop offset="1" stopColor="#25C935" />
      </linearGradient>
    </defs>
    <g transform="rotate(-12 150 150)">
      <path d="M60 70 H190 L250 150 L190 230 H60 a20 20 0 0 1 -20 -20 V90 a20 20 0 0 1 20 -20 Z" fill="url(#eti)" stroke="#111" strokeWidth={8} strokeLinejoin="round" />
      <circle cx={196} cy={150} r={16} fill="#C80F18" stroke="#111" strokeWidth={6} />
      <text x={115} y={172} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={70} fill="#111">€</text>
    </g>
    <g transform={`translate(0 ${(1 - k) * -60})`} opacity={k}>
      <path d="M210 150 h50 v70 h34 l-59 62 l-59 -62 h34 Z" fill="url(#fle)" stroke="#0B3D0B" strokeWidth={8} strokeLinejoin="round" />
    </g>
  </svg>
);

/** Maleta de viaje tachada ("no es un tour de vacaciones"). */
export const MaletaNo: React.FC<{ tam?: number; k?: number }> = ({ tam = 220, k = 1 }) => (
  <svg width={tam} height={tam} viewBox="0 0 220 220" style={{ filter: "drop-shadow(8px 14px 10px rgba(0,0,0,0.45))", overflow: "visible" }}>
    <defs>
      <linearGradient id="maleta" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5EC8FF" />
        <stop offset="1" stopColor="#1676D2" />
      </linearGradient>
    </defs>
    <rect x={78} y={22} width={64} height={34} rx={12} fill="none" stroke="#1B2B3A" strokeWidth={10} />
    <rect x={34} y={50} width={152} height={140} rx={24} fill="url(#maleta)" stroke="#0E3A66" strokeWidth={7} />
    <rect x={34} y={96} width={152} height={18} fill="#0E3A66" opacity={0.55} />
    <rect x={56} y={66} width={20} height={110} rx={8} fill="rgba(255,255,255,0.35)" />
    <circle cx={70} cy={196} r={9} fill="#1B2B3A" />
    <circle cx={150} cy={196} r={9} fill="#1B2B3A" />
    <g opacity={k} transform={`translate(110 110) scale(${0.6 + 0.4 * k}) translate(-110 -110)`}>
      <path d="M24 24 L196 196 M196 24 L24 196" stroke="#fff" strokeWidth={30} strokeLinecap="round" />
      <path d="M24 24 L196 196 M196 24 L24 196" stroke="#E3141F" strokeWidth={18} strokeLinecap="round" />
    </g>
  </svg>
);
