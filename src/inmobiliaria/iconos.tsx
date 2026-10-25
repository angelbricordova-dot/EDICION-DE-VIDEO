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

const sombraP = "drop-shadow(8px 14px 10px rgba(0,0,0,0.45))";

/** Pin de mapa con candado ("lo único que nunca vas a poder cambiar"). */
export const PinCandado: React.FC<{ tam?: number }> = ({ tam = 220 }) => (
  <svg width={tam} height={tam} viewBox="0 0 220 220" style={{ filter: sombraP, overflow: "visible" }}>
    <defs>
      <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FF6B6B" />
        <stop offset="1" stopColor="#C40E1A" />
      </linearGradient>
      <linearGradient id="oro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE58A" />
        <stop offset="1" stopColor="#D9A21B" />
      </linearGradient>
    </defs>
    <path d="M100 206 C60 150 30 118 30 80 a70 70 0 0 1 140 0 C170 118 140 150 100 206 Z" fill="url(#pin)" stroke="#6E0610" strokeWidth={6} />
    <circle cx={100} cy={80} r={34} fill="#fff" />
    <path d="M150 120 v-16 a22 22 0 0 1 44 0 v16" fill="none" stroke="#5B4A1A" strokeWidth={9} />
    <rect x={140} y={118} width={64} height={54} rx={10} fill="url(#oro)" stroke="#5B4A1A" strokeWidth={5} />
    <circle cx={172} cy={142} r={7} fill="#5B4A1A" />
  </svg>
);

/** Reloj con "30 min" tachado ("no vale con media hora de visita"). */
export const RelojNo: React.FC<{ tam?: number; k?: number }> = ({ tam = 210, k = 1 }) => (
  <svg width={tam} height={tam} viewBox="0 0 220 220" style={{ filter: sombraP, overflow: "visible" }}>
    <defs>
      <radialGradient id="esfera" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#DADDE2" />
      </radialGradient>
    </defs>
    <circle cx={110} cy={110} r={92} fill="url(#esfera)" stroke="#20262E" strokeWidth={12} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={110 + Math.sin(a) * 70} y1={110 - Math.cos(a) * 70} x2={110 + Math.sin(a) * 80} y2={110 - Math.cos(a) * 80} stroke="#20262E" strokeWidth={i % 3 ? 4 : 8} strokeLinecap="round" />;
    })}
    <path d="M110 110 L110 40 A70 70 0 0 1 110 180 Z" fill="rgba(255,193,7,0.55)" />
    <line x1={110} y1={110} x2={110} y2={48} stroke="#20262E" strokeWidth={8} strokeLinecap="round" />
    <line x1={110} y1={110} x2={110} y2={168} stroke="#E3141F" strokeWidth={6} strokeLinecap="round" />
    <circle cx={110} cy={110} r={9} fill="#20262E" />
    <g opacity={k}>
      <path d="M30 30 L190 190" stroke="#fff" strokeWidth={28} strokeLinecap="round" />
      <path d="M30 30 L190 190" stroke="#E3141F" strokeWidth={16} strokeLinecap="round" />
    </g>
  </svg>
);

export const Sol: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="sol" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FFF59A" />
        <stop offset="1" stopColor="#FFA000" />
      </radialGradient>
    </defs>
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={46} y={2} width={8} height={18} rx={4} fill="#FFB300" transform={`rotate(${i * 36} 50 50)`} />
    ))}
    <circle cx={50} cy={50} r={27} fill="url(#sol)" stroke="#E08A00" strokeWidth={3} />
  </svg>
);

export const Luna: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="luna" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF6C9" />
        <stop offset="1" stopColor="#C9B45A" />
      </linearGradient>
    </defs>
    <path d="M62 10 a42 42 0 1 0 28 66 a34 34 0 1 1 -28 -66 Z" fill="url(#luna)" stroke="#8C7A2A" strokeWidth={3} />
    <circle cx={22} cy={22} r={4} fill="#FFE98A" />
    <circle cx={84} cy={30} r={3} fill="#FFE98A" />
  </svg>
);

export const Ayuntamiento: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <path d="M50 8 L92 30 H8 Z" fill="#C9A26A" stroke="#6B4E22" strokeWidth={3} strokeLinejoin="round" />
    <rect x={12} y={30} width={76} height={8} fill="#E2C48F" stroke="#6B4E22" strokeWidth={3} />
    {[20, 38, 56, 74].map((x) => (
      <rect key={x} x={x - 4} y={40} width={10} height={40} fill="#F3E2BF" stroke="#6B4E22" strokeWidth={2.5} />
    ))}
    <rect x={8} y={80} width={84} height={10} fill="#C9A26A" stroke="#6B4E22" strokeWidth={3} />
    <circle cx={50} cy={22} r={5} fill="#fff" stroke="#6B4E22" strokeWidth={2} />
  </svg>
);

export const Bolsa: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <path d="M36 34 v-8 a14 14 0 0 1 28 0 v8" fill="none" stroke="#5A2A82" strokeWidth={6} />
    <path d="M18 32 H82 L76 90 H24 Z" fill="#B46BE8" stroke="#5A2A82" strokeWidth={4} strokeLinejoin="round" />
    <path d="M28 40 H44 L42 82 H30 Z" fill="rgba(255,255,255,0.3)" />
  </svg>
);

export const Carretera: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <path d="M36 6 H64 L94 94 H6 Z" fill="#3B4048" stroke="#1C1F24" strokeWidth={4} strokeLinejoin="round" />
    {[14, 38, 64].map((y, i) => (
      <rect key={y} x={48 - i} y={y} width={4 + i * 2} height={14 + i * 4} fill="#FFD54A" />
    ))}
  </svg>
);

/** Acta de la comunidad con sello "APROBADA" que cae encima (k: 0 → 1). */
export const Acta: React.FC<{ tam?: number; sello?: number }> = ({ tam = 230, sello = 0 }) => (
  <svg width={tam} height={tam} viewBox="0 0 230 230" style={{ filter: sombraP, overflow: "visible" }}>
    <defs>
      <linearGradient id="hoja" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E9EDF2" />
      </linearGradient>
    </defs>
    <path d="M40 10 H150 L190 50 V220 H40 Z" fill="url(#hoja)" stroke="#2A3340" strokeWidth={6} strokeLinejoin="round" />
    <path d="M150 10 V50 H190" fill="#D3DAE3" stroke="#2A3340" strokeWidth={5} strokeLinejoin="round" />
    <text x={62} y={44} fontFamily="Inter, Arial" fontWeight={900} fontSize={24} fill="#2A3340">ACTA</text>
    {[72, 96, 120, 144, 168, 192].map((y, i) => (
      <rect key={y} x={60} y={y} width={i % 2 ? 90 : 110} height={9} rx={4} fill="#9AA6B5" />
    ))}
    {sello > 0 ? (
      <g transform={`translate(115 140) rotate(-14) scale(${1 + (1 - sello) * 1.4})`} opacity={Math.min(1, sello * 2)}>
        <rect x={-76} y={-26} width={152} height={52} rx={10} fill="rgba(227,20,31,0.08)" stroke="#E3141F" strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={29} fill="#E3141F" letterSpacing="1">APROBADA</text>
      </g>
    ) : null}
  </svg>
);

export const Calendario: React.FC<{ tam?: number }> = ({ tam = 70 }) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100">
    <rect x={10} y={16} width={80} height={76} rx={12} fill="#fff" stroke="#2A3340" strokeWidth={5} />
    <rect x={10} y={16} width={80} height={22} rx={10} fill="#E3141F" />
    <rect x={26} y={6} width={8} height={20} rx={4} fill="#2A3340" />
    <rect x={66} y={6} width={8} height={20} rx={4} fill="#2A3340" />
    <text x={50} y={80} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={38} fill="#2A3340">2</text>
  </svg>
);
