import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, lerp, POP, sp } from "../comun/animacion";
import { COL, FUENTE, GTA, rnd, SUBS } from "./piezas";

// Día 4 de Toño (aprende gratis en YouTube): teléfono con los vídeos de gurús y el scroll hasta la
// página 5, el canal de Sofi (webs para negocios con IA), la pizarra de "vende más clientes", el
// escritorio de noche con la laptop, la web de la barbería, la barbería de don Chucho (personaje
// nuevo), la capa del corte, el espejo e íconos de la votación (comida chatarra vs ejercicio).

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });

/* ───────────── teléfono con la app de vídeos ───────────── */

const Miniatura: React.FC<{ i: number; guru: boolean }> = ({ i, guru }) => {
  const textos = ["¡MILLONARIO EN 7 DÍAS!", "GANÉ $50.000 DURMIENDO", "MI LAMBO A LOS 19", "CURSO SECRETO 💸", "DEJA TU TRABAJO YA"];
  const fondo = guru ? ["#F7C948", "#E5484D", "#3DDC84", "#3B8BEB", "#B88FB0"][i % 5] : "#CFD8DC";
  return (
    <div style={{ display: "flex", gap: 16, padding: "12px 18px", alignItems: "center" }}>
      <div style={{ width: 300, height: 170, borderRadius: 14, background: fondo, position: "relative", overflow: "hidden", flexShrink: 0, border: `3px solid ${COL.linea}` }}>
        {guru ? (
          <svg width={300} height={170} viewBox="0 0 300 170">
            {/* coche deportivo */}
            <path d="M 20 140 L 40 112 Q 90 96 150 98 L 200 100 Q 240 106 270 126 L 280 140 Z" fill={i % 2 ? "#E5484D" : "#F29E4C"} stroke={COL.linea} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={78} cy={142} r={16} fill="#222" />
            <circle cx={226} cy={142} r={16} fill="#222" />
            {/* gurú con lentes oscuros señalando */}
            <circle cx={150} cy={58} r={30} fill="#E0A77F" stroke={COL.linea} strokeWidth={4} />
            <rect x={128} y={50} width={18} height={10} rx={4} fill="#111" />
            <rect x={154} y={50} width={18} height={10} rx={4} fill="#111" />
            <path d="M 136 72 Q 150 82 164 72" fill="#fff" stroke={COL.linea} strokeWidth={3} />
            {/* fajos de billetes */}
            <rect x={210} y={20} width={60} height={30} rx={4} fill="#85C46B" stroke="#1E5A2B" strokeWidth={3} transform="rotate(-12 240 35)" />
            <rect x={30} y={24} width={60} height={30} rx={4} fill="#85C46B" stroke="#1E5A2B" strokeWidth={3} transform="rotate(10 60 39)" />
          </svg>
        ) : null}
        <div style={{ position: "absolute", left: 8, right: 8, bottom: guru ? 52 : 70, fontFamily: GTA, fontSize: guru ? 30 : 24, lineHeight: 1, color: "#fff", ...contorno(5), textAlign: "center" }}>{guru ? textos[i % 5] : ""}</div>
      </div>
      <div style={{ fontFamily: SUBS, fontWeight: 800, fontSize: 26, color: "#222", lineHeight: 1.15 }}>
        {guru ? textos[i % 5].replace(/[^A-ZÁÉÍÓÚÑ0-9$ .!¡]/gi, "") : ""}
        <div style={{ fontWeight: 600, fontSize: 22, color: "#777", marginTop: 6 }}>{guru ? `${(3 + (i * 7) % 9)},${i % 10} M de vistas` : ""}</div>
      </div>
    </div>
  );
};

/** Teléfono grande con la app de vídeos: búsqueda arriba, resultados de gurús y scroll hasta la página 5. */
export const TelefonoVideos: React.FC<{ t: number; t0: number; tScroll: number; tPagina5: number; busqueda: string }> = ({ t, t0, tScroll, tPagina5, busqueda }) => {
  const k = sp(t, t0, POP);
  const escrito = busqueda.slice(0, Math.floor(clamp01((t - t0) / 0.6) * busqueda.length));
  const scroll = t < tScroll ? 0 : (t - tScroll) * 2600;
  const pagina = t < tScroll ? 1 : Math.min(5, 1 + Math.floor(((t - tScroll) / (tPagina5 - tScroll)) * 4.999));
  const borroso = t >= tScroll && t < tPagina5 ? 6 : 0;
  return (
    <div style={{ position: "absolute", left: 150, top: 230, width: 780, height: 1200, borderRadius: 86, background: "#16171B", border: `8px solid ${COL.linea}`, padding: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", scale: String(lerp(0.85, 1, k)) }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 60, background: "#fff", overflow: "hidden", fontFamily: SUBS, position: "relative" }}>
        <div style={{ background: "#fff", padding: "44px 24px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: "3px solid #eee", position: "relative", zIndex: 2 }}>
          <svg width={64} height={46} viewBox="0 0 64 46">
            <rect width={64} height={46} rx={12} fill="#E5484D" />
            <path d="M 26 14 L 44 23 L 26 32 Z" fill="#fff" />
          </svg>
          <div style={{ flex: 1, background: "#F1F3F4", borderRadius: 30, padding: "12px 22px", fontSize: 30, fontWeight: 700, color: "#333" }}>
            🔍 {escrito}
            <span style={{ opacity: Math.sin(t * 12) > 0 ? 1 : 0 }}>|</span>
          </div>
        </div>
        <div style={{ translate: `0 ${-(scroll % 1400)}px`, filter: `blur(${borroso}px)` }}>
          {Array.from({ length: 12 }, (_, i) => (
            <Miniatura key={i} i={i + pagina * 3} guru />
          ))}
        </div>
        <div style={{ position: "absolute", right: 24, bottom: 30, background: COL.linea, color: "#fff", fontFamily: FUENTE, fontSize: 52, padding: "10px 26px", borderRadius: 20, scale: String(t >= tScroll ? 1 + 0.15 * Math.max(0, Math.sin((t - tScroll) * 10)) : 0) }}>PÁGINA {pagina}</div>
      </div>
    </div>
  );
};

/* ───────────── Sofi (canal pequeño) ───────────── */

/** Sofi: chica sencilla con lentes redondos, coleta y sudadera verde, hablando a cámara (busto, caja 400 × 420). */
export const Sofi: React.FC<{ ancho?: number; t: number; habla?: boolean }> = ({ ancho = 400, t, habla = true }) => {
  const boca = habla ? 0.3 + 0.7 * Math.abs(Math.sin(t * 13)) : 0;
  const parp = (t + 0.4) % 3.1 < 0.12;
  return (
    <svg width={ancho} height={ancho * 1.05} viewBox="0 0 400 420">
      <path d="M 40 420 Q 50 320 200 300 Q 350 320 360 420 Z" fill="#3E9E6E" {...L} />
      <path d="M 160 300 Q 200 340 240 300" fill="none" stroke="#2F7A55" strokeWidth={10} />
      <rect x={172} y={250} width={56} height={60} fill="#C98B62" {...L} />
      {/* coleta detrás */}
      <path d="M 290 120 Q 360 150 340 260 Q 320 230 300 200 Z" fill="#4A2E20" {...L} />
      <path d="M 110 160 Q 100 60 200 52 Q 300 60 290 160 L 286 230 Q 270 290 200 296 Q 130 290 114 230 Z" fill="#E3A57C" {...L} />
      <path d="M 104 170 Q 96 70 200 56 Q 304 66 296 170 Q 270 110 210 106 Q 150 112 104 170 Z" fill="#4A2E20" {...L} />
      {/* lentes redondos */}
      {[160, 240].map((x) => (
        <g key={x}>
          <circle cx={x} cy={186} r={30} fill="#fff" fillOpacity={0.35} stroke={COL.linea} strokeWidth={6} />
          {parp ? <path d={`M ${x - 14} 188 L ${x + 14} 188`} stroke={COL.linea} strokeWidth={5} /> : <circle cx={x + 2} cy={188} r={9} fill="#3A2416" />}
        </g>
      ))}
      <path d="M 190 186 L 210 186" stroke={COL.linea} strokeWidth={6} />
      <path d="M 196 214 Q 202 230 194 234" fill="none" stroke="#B8774E" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={200} cy={258} rx={22} ry={4 + boca * 14} fill="#6B1F24" {...L} strokeWidth={4} />
      <ellipse cx={140} cy={232} rx={18} ry={10} fill="#F08A8A" opacity={0.5} />
      <ellipse cx={260} cy={232} rx={18} ry={10} fill="#F08A8A" opacity={0.5} />
    </svg>
  );
};

/** Pantalla de una web que se arma sola por bloques (lo que la IA genera). */
export const WebArmandose: React.FC<{ t: number; t0: number; titulo: string; color: string; ancho: number; alto: number }> = ({ t, t0, titulo, color, ancho, alto }) => {
  const b = (i: number) => easeOut(clamp01((t - t0 - i * 0.25) / 0.3));
  return (
    <div style={{ width: ancho, height: alto, background: "#fff", borderRadius: 16, overflow: "hidden", border: `5px solid ${COL.linea}`, fontFamily: SUBS, position: "relative" }}>
      <div style={{ height: 34, background: "#E6E8EB", display: "flex", gap: 8, alignItems: "center", padding: "0 12px" }}>
        {["#E5484D", "#F7C948", "#3DDC84"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      </div>
      <div style={{ opacity: b(0), translate: `0 ${(1 - b(0)) * 30}px`, background: color, color: "#fff", padding: "18px 20px", fontWeight: 900, fontSize: ancho * 0.07, lineHeight: 1 }}>{titulo}</div>
      <div style={{ display: "flex", gap: 12, padding: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: alto * 0.28, borderRadius: 10, background: ["#FCE7A2", "#CFE6E0", "#F8D0D8"][i - 1], opacity: b(i), scale: String(lerp(0.6, 1, b(i))) }} />
        ))}
      </div>
      <div style={{ margin: "0 16px", height: 14, borderRadius: 7, background: "#E6E8EB", opacity: b(4) }} />
      <div style={{ margin: "10px 16px", width: "70%", height: 14, borderRadius: 7, background: "#E6E8EB", opacity: b(4) }} />
      <div style={{ position: "absolute", left: "50%", bottom: 20, translate: "-50% 0", background: "#25D366", color: "#fff", fontWeight: 900, fontSize: ancho * 0.05, padding: "12px 26px", borderRadius: 40, opacity: b(5), scale: String(lerp(0.5, 1, b(5))), whiteSpace: "nowrap" }}>RESERVAR POR WHATSAPP</div>
    </div>
  );
};

/** Vídeo del canal de Sofi a pantalla completa en el teléfono: ella a la izquierda, la web armándose a la derecha. */
export const CanalSofi: React.FC<{ t: number; t0: number; tWeb: number }> = ({ t, t0, tWeb }) => {
  const k = sp(t, t0, POP);
  return (
    <div style={{ position: "absolute", left: 60, top: 300, width: 960, scale: String(lerp(0.85, 1, k)), opacity: clamp01(k * 2) }}>
      <div style={{ background: "#16171B", borderRadius: 40, padding: 18, border: `8px solid ${COL.linea}`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ background: "#EEF3F1", borderRadius: 24, height: 560, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
          <div style={{ position: "absolute", left: 10, bottom: 0 }}>
            <Sofi ancho={430} t={t} />
          </div>
          <div style={{ position: "absolute", right: 24, top: 40 }}>
            <WebArmandose t={t} t0={tWeb} titulo="Tu negocio, online" color="#3B8BEB" ancho={440} alto={420} />
          </div>
          <div style={{ position: "absolute", left: 20, top: 16, background: "#E5484D", color: "#fff", fontFamily: SUBS, fontWeight: 900, fontSize: 26, padding: "6px 14px", borderRadius: 8 }}>GRATIS</div>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 26, padding: "16px 24px", border: `5px solid ${COL.linea}`, fontFamily: SUBS }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, overflow: "hidden", border: `4px solid ${COL.linea}`, background: "#EEF3F1", flexShrink: 0 }}>
          <Sofi ancho={80} t={t} habla={false} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 34, color: "#222" }}>Webs para negocios con IA (paso a paso)</div>
          <div style={{ fontWeight: 700, fontSize: 28, color: "#777" }}>Sofi Crea · 2 mil suscriptores</div>
        </div>
      </div>
    </div>
  );
};

/* ───────────── pizarra del otro canal ───────────── */

export const Pizarra: React.FC<{ t: number; t0: number; tTacha: number; tSubraya: number }> = ({ t, t0, tTacha, tSubraya }) => {
  const k = sp(t, t0, POP);
  const tacha = easeOut(clamp01((t - tTacha) / 0.3));
  const sub = easeOut(clamp01((t - tSubraya) / 0.35));
  return (
    <AbsoluteFill style={{ background: "#2E4A3E" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={0} width={1080} height={1920} fill="#5B4636" />
        <rect x={60} y={260} width={960} height={900} rx={14} fill="#F7F7F2" stroke="#8C8781" strokeWidth={22} />
        <rect x={60} y={1150} width={960} height={30} fill="#8C8781" />
        {[["#E5484D", 300], ["#3B8BEB", 380], ["#1E9E57", 460]].map(([c, x]) => <rect key={String(c)} x={Number(x)} y={1140} width={60} height={14} rx={6} fill={String(c)} />)}
      </svg>
      <div style={{ position: "absolute", left: 110, right: 110, top: 360, fontFamily: '"Lilita One", sans-serif', color: "#2A2A2A", textAlign: "center", scale: String(lerp(0.9, 1, k)) }}>
        <div style={{ fontSize: 90, position: "relative", display: "inline-block" }}>
          NO VENDAS UNA WEB
          <div style={{ position: "absolute", left: -10, top: "50%", height: 14, width: `${tacha * 104}%`, background: "#E5484D", borderRadius: 7, rotate: "-3deg" }} />
        </div>
        <div style={{ fontSize: 120, color: "#1E9E57", marginTop: 90, position: "relative", display: "inline-block" }}>
          VENDE MÁS CLIENTES
          <div style={{ position: "absolute", left: 0, bottom: -12, height: 16, width: `${sub * 100}%`, background: "#F7C948", borderRadius: 8 }} />
        </div>
        <div style={{ fontSize: 52, color: "#555", marginTop: 70 }}>"Con esta web te van a reservar por WhatsApp"</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── escritorio de noche ───────────── */

/** Habitación a oscuras: escritorio con una laptop vieja (con cinta), latas, reloj de pared y la luz azul de la pantalla. */
export const EscritorioNoche: React.FC<{ t: number; t0: number; children?: React.ReactNode }> = ({ t, t0, children }) => {
  const horas = Math.min(4, Math.floor((t - t0) * 1.6));
  const ang = (t - t0) * 400;
  return (
    <AbsoluteFill style={{ background: "#141A2E" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect width={1080} height={1300} fill="#1B2440" />
        {/* ventana con luna */}
        <rect x={680} y={160} width={300} height={360} fill="#0E1428" {...L} />
        <circle cx={850} cy={270} r={50} fill="#F6EFC8" />
        <circle cx={872} cy={256} r={46} fill="#0E1428" />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={700 + rnd(i) * 260} cy={190 + rnd(i + 3) * 300} r={3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
        <path d="M 830 160 L 830 520 M 680 340 L 980 340" stroke={COL.linea} strokeWidth={8} />
        {/* reloj de pared que corre */}
        <circle cx={220} cy={300} r={110} fill="#E8E2D2" {...L} />
        <line x1={220} y1={300} x2={220 + Math.cos((ang / 12 - 90) * Math.PI / 180) * 55} y2={300 + Math.sin((ang / 12 - 90) * Math.PI / 180) * 55} stroke={COL.linea} strokeWidth={10} strokeLinecap="round" />
        <line x1={220} y1={300} x2={220 + Math.cos((ang - 90) * Math.PI / 180) * 85} y2={300 + Math.sin((ang - 90) * Math.PI / 180) * 85} stroke={COL.linea} strokeWidth={6} strokeLinecap="round" />
        <text x={220} y={460} textAnchor="middle" fontFamily={FUENTE} fontSize={48} fill="#F7C948">{`${11 + horas > 12 ? 11 + horas - 12 : 11 + horas}:00 ${11 + horas >= 12 ? "AM" : "PM"}`}</text>
        {/* mesa */}
        <rect y={1180} width={1080} height={740} fill="#3A2B22" />
        <rect y={1160} width={1080} height={40} fill="#5A4030" {...L} />
      </svg>
      {children}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* laptop vieja vista de espaldas, con cinta en la esquina */}
        <path d="M 300 1160 L 330 860 L 750 860 L 780 1160 Z" fill="#5E6670" {...L} />
        <path d="M 300 1160 L 780 1160 L 820 1200 L 260 1200 Z" fill="#7E8892" {...L} />
        <rect x={500} y={980} width={80} height={60} rx={12} fill="#9AA6B0" opacity={0.6} />
        <rect x={700} y={870} width={70} height={26} fill="#E8D9A8" transform="rotate(30 735 883)" opacity={0.9} />
        {/* latas de refresco */}
        {[[120, 1100], [190, 1110], [900, 1090]].map(([x, y], i) => (
          <g key={i} transform={`rotate(${i === 1 ? 70 : 0} ${x} ${y})`}>
            <rect x={x - 26} y={y - 60} width={52} height={90} rx={10} fill={i % 2 ? "#3B8BEB" : "#E5484D"} {...L} strokeWidth={4} />
            <rect x={x - 26} y={y - 30} width={52} height={20} fill="#fff" opacity={0.7} />
          </g>
        ))}
      </svg>
      {/* luz azul de la pantalla en la cara */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(120,170,255,0.28) 0%, rgba(0,0,0,0) 45%)" }} />
    </AbsoluteFill>
  );
};

/* ───────────── barbería y don Chucho ───────────── */

/** Interior de la barbería: azulejos, espejo grande, poste de rayas, sillón rojo, repisa con productos. */
export const Barberia: React.FC<{ t: number; children?: React.ReactNode; espejo?: React.ReactNode }> = ({ t, children, espejo }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#E9E1D2" />
      {Array.from({ length: 10 }, (_, f) => Array.from({ length: 9 }, (_, c) => <rect key={`${f}-${c}`} x={c * 124} y={900 + f * 110} width={120} height={106} fill={(f + c) % 2 ? "#1C1A1A" : "#F2F0EA"} />))}
      <rect y={860} width={1080} height={44} fill="#8A5A3B" {...L} />
      {/* poste de barbero que gira */}
      <rect x={60} y={150} width={90} height={520} rx={40} fill="#fff" {...L} />
      <clipPath id="poste">
        <rect x={60} y={150} width={90} height={520} rx={40} />
      </clipPath>
      <g clipPath="url(#poste)">
        {Array.from({ length: 14 }, (_, i) => {
          const y = 120 + ((i * 80 + t * 120) % 1120) - 60;
          return <path key={i} d={`M 40 ${y} L 170 ${y - 90} L 170 ${y - 50} L 40 ${y + 40} Z`} fill={i % 2 ? "#E5484D" : "#3B8BEB"} />;
        })}
      </g>
      <rect x={60} y={150} width={90} height={520} rx={40} fill="none" {...L} />
      {/* letrero */}
      <rect x={250} y={90} width={580} height={110} rx={18} fill="#1C1A1A" {...L} />
      <text x={540} y={168} textAnchor="middle" fontFamily={FUENTE} fontSize={66} fill="#F7C948">BARBERÍA DON CHUCHO</text>
      {/* marco del espejo grande */}
      <rect x={230} y={250} width={620} height={560} rx={20} fill="#C9A35B" {...L} />
      <rect x={256} y={276} width={568} height={508} rx={10} fill="#BFD7E0" />
      <path d="M 300 320 L 420 320 L 330 420 Z" fill="#fff" opacity={0.35} />
      {/* repisa con productos */}
      <rect x={880} y={560} width={180} height={18} fill="#8A5A3B" {...L} strokeWidth={4} />
      {[[900, "#3B8BEB"], [950, "#E5484D"], [1000, "#3DDC84"]].map(([x, c]) => <rect key={String(x)} x={Number(x)} y={480} width={40} height={80} rx={8} fill={String(c)} {...L} strokeWidth={4} />)}
    </svg>
    {espejo ? (
      <div style={{ position: "absolute", left: 256, top: 276, width: 568, height: 508, overflow: "hidden", borderRadius: 10 }}>{espejo}</div>
    ) : null}
    {children}
  </AbsoluteFill>
);

/** Sillón de barbero rojo (va delante de Toño cuando está sentado). */
export const Sillon: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <path d="M 250 1230 L 830 1230 L 860 1420 L 220 1420 Z" fill="#C9352E" {...L} />
    <rect x={180} y={1170} width={120} height={300} rx={40} fill="#A3291F" {...L} />
    <rect x={780} y={1170} width={120} height={300} rx={40} fill="#A3291F" {...L} />
    <rect x={500} y={1420} width={80} height={260} fill="#9AA3AA" {...L} />
    <ellipse cx={540} cy={1700} rx={240} ry={40} fill="#7E8892" {...L} />
  </svg>
);

/** Don Chucho: barbero mayor, bigote canoso, calvo con pelo a los lados, bata blanca y peine en el bolsillo.
 *  Caja 500 × 900 (busto y cintura). `cara`: "serio" o "feliz". Con `telefono`, lo sostiene mirándolo. */
export const DonChucho: React.FC<{ ancho?: number; t: number; cara?: "serio" | "feliz"; telefono?: boolean; tijeras?: boolean }> = ({ ancho = 500, t, cara = "serio", telefono, tijeras }) => {
  const feliz = cara === "feliz";
  const corte = tijeras ? Math.sin(t * 22) * 10 : 0;
  return (
    <svg width={ancho} height={ancho * 1.8} viewBox="0 0 500 900" style={{ overflow: "visible" }}>
      {/* bata blanca */}
      <path d="M 70 900 L 90 520 Q 110 440 250 430 Q 390 440 410 520 L 430 900 Z" fill="#F6F5F0" {...L} />
      <path d="M 360 470 Q 400 500 404 560 L 430 900 L 380 900 Q 400 700 360 470 Z" fill="#DCDAD2" />
      <path d="M 250 440 L 250 900" stroke="#C9C4B8" strokeWidth={5} />
      {[560, 640, 720, 800].map((y) => <circle key={y} cx={266} cy={y} r={9} fill="#C9C4B8" {...L} strokeWidth={3} />)}
      <rect x={300} y={560} width={70} height={60} rx={6} fill="none" stroke="#C9C4B8" strokeWidth={5} />
      <rect x={316} y={530} width={12} height={60} rx={4} fill="#1C1A1A" />
      {/* camisa y corbatín */}
      <path d="M 210 440 L 250 500 L 290 440 Z" fill="#7FB3D5" {...L} strokeWidth={4} />
      <path d="M 226 470 L 250 486 L 274 470 L 274 496 L 250 486 L 226 496 Z" fill="#C9352E" {...L} strokeWidth={4} />
      {/* brazos */}
      {telefono ? (
        <g>
          <path d="M 120 520 Q 80 640 200 640" fill="none" stroke={COL.linea} strokeWidth={72} strokeLinecap="round" />
          <path d="M 120 520 Q 80 640 200 640" fill="none" stroke="#F6F5F0" strokeWidth={60} strokeLinecap="round" />
          <rect x={180} y={540} width={110} height={180} rx={16} fill="#1F2226" {...L} transform="rotate(-10 235 630)" />
          <rect x={192} y={556} width={86} height={146} rx={8} fill="#3B8BEB" transform="rotate(-10 235 630)" />
          <circle cx={226} cy={680} r={30} fill="#D9A27A" {...L} strokeWidth={4} />
        </g>
      ) : (
        <g>
          <path d="M 110 520 Q 70 640 100 760" fill="none" stroke={COL.linea} strokeWidth={72} strokeLinecap="round" />
          <path d="M 110 520 Q 70 640 100 760" fill="none" stroke="#F6F5F0" strokeWidth={60} strokeLinecap="round" />
          <circle cx={104} cy={790} r={30} fill="#D9A27A" {...L} strokeWidth={4} />
        </g>
      )}
      <path d="M 390 520 Q 450 600 400 700" fill="none" stroke={COL.linea} strokeWidth={72} strokeLinecap="round" />
      <path d="M 390 520 Q 450 600 400 700" fill="none" stroke="#F6F5F0" strokeWidth={60} strokeLinecap="round" />
      <circle cx={394} cy={724} r={30} fill="#D9A27A" {...L} strokeWidth={4} />
      {tijeras ? (
        <g transform={`translate(394 700) rotate(-40)`}>
          <path d={`M 0 0 L 90 ${-8 - corte}`} stroke="#9AA3AA" strokeWidth={10} strokeLinecap="round" />
          <path d={`M 0 0 L 90 ${8 + corte}`} stroke="#B9C0C6" strokeWidth={10} strokeLinecap="round" />
          <circle cx={-14} cy={-12} r={12} fill="none" stroke="#1C1A1A" strokeWidth={6} />
          <circle cx={-14} cy={12} r={12} fill="none" stroke="#1C1A1A" strokeWidth={6} />
        </g>
      ) : null}
      {/* cuello y cabeza */}
      <rect x={220} y={380} width={60} height={60} fill="#C08A63" {...L} />
      <ellipse cx={142} cy={290} rx={20} ry={30} fill="#D9A27A" {...L} />
      <ellipse cx={358} cy={290} rx={20} ry={30} fill="#D9A27A" {...L} />
      <path d="M 150 250 Q 140 140 250 130 Q 360 140 350 250 L 346 320 Q 330 410 250 414 Q 170 410 154 320 Z" fill="#D9A27A" {...L} />
      <path d="M 320 170 Q 356 230 344 330 Q 330 390 290 404 Q 332 320 320 170 Z" fill="#C08A63" opacity={0.6} />
      {/* calva brillante y pelo canoso a los lados */}
      <ellipse cx={220} cy={170} rx={36} ry={16} fill="#EBC2A0" />
      <path d="M 148 270 Q 140 210 168 190 L 178 250 Z M 352 270 Q 360 210 332 190 L 322 250 Z" fill="#D6D6D6" {...L} strokeWidth={4} />
      {/* cejas pobladas y ojos */}
      <path d={feliz ? "M 180 236 Q 205 220 228 234" : "M 180 228 L 230 240"} stroke="#BDBDBD" strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d={feliz ? "M 272 234 Q 295 220 320 236" : "M 270 240 L 320 228"} stroke="#BDBDBD" strokeWidth={14} strokeLinecap="round" fill="none" />
      {feliz ? (
        <>
          <path d="M 188 266 Q 206 252 224 266" fill="none" {...L} strokeWidth={6} />
          <path d="M 276 266 Q 294 252 312 266" fill="none" {...L} strokeWidth={6} />
        </>
      ) : (
        <>
          <ellipse cx={206} cy={266} rx={14} ry={10} fill="#fff" {...L} strokeWidth={4} />
          <ellipse cx={294} cy={266} rx={14} ry={10} fill="#fff" {...L} strokeWidth={4} />
          <circle cx={208} cy={268} r={6} fill="#3A2416" />
          <circle cx={296} cy={268} r={6} fill="#3A2416" />
        </>
      )}
      {/* lentes en la punta de la nariz */}
      <path d="M 232 300 Q 250 330 236 338" fill="none" stroke="#B57A52" strokeWidth={6} strokeLinecap="round" />
      <rect x={176} y={282} width={56} height={34} rx={10} fill="#fff" fillOpacity={0.25} stroke={COL.linea} strokeWidth={5} />
      <rect x={268} y={282} width={56} height={34} rx={10} fill="#fff" fillOpacity={0.25} stroke={COL.linea} strokeWidth={5} />
      <path d="M 232 296 L 268 296" stroke={COL.linea} strokeWidth={5} />
      {/* bigote canoso y boca */}
      <path d="M 192 352 Q 220 330 250 344 Q 280 330 308 352 Q 290 368 250 358 Q 210 368 192 352 Z" fill="#D6D6D6" {...L} strokeWidth={4} />
      {feliz ? (
        <path d="M 216 372 Q 250 404 284 372 Q 250 384 216 372 Z" fill="#6B1F24" {...L} strokeWidth={4} />
      ) : (
        <path d="M 224 378 L 276 378" stroke={COL.linea} strokeWidth={6} strokeLinecap="round" />
      )}
      {/* peine detrás de la oreja */}
      <rect x={350} y={210} width={16} height={70} rx={4} fill="#1C1A1A" transform="rotate(20 358 245)" />
    </svg>
  );
};

/** Capa de barbero que tapa el cuerpo de Toño sentado (caja 1080 × 1920, Toño de 720 px). */
export const Capa: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <path d="M 430 780 Q 540 830 650 780 L 900 1260 L 180 1260 Z" fill="#2C3E66" {...L} />
    <path d="M 430 780 Q 540 830 650 780" fill="none" stroke="#fff" strokeWidth={14} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={300 + rnd(i) * 480} cy={900 + rnd(i + 2) * 300} r={6} fill="#5A73A8" />)}
  </svg>
);

/** Mechones de pelo que caen. */
export const PeloCae: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 22 }, (_, i) => {
        const nace = t0 + rnd(i) * (t1 - t0);
        const v = clamp01((t - nace) / 1.1);
        if (t < nace || v >= 1) return null;
        const x = 420 + rnd(i + 5) * 260 + Math.sin(v * 6 + i) * 30;
        const y = 560 + v * 700;
        return <path key={i} d={`M ${x} ${y} q 12 -16 24 0 q 10 14 22 2`} fill="none" stroke="#171515" strokeWidth={6} strokeLinecap="round" transform={`rotate(${v * 200 + i * 20} ${x} ${y})`} opacity={1 - v * 0.3} />;
      })}
    </svg>
  );
};

/* ───────────── votación ───────────── */

export const IconoChatarra: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    {/* porción de pizza y refresco tachados */}
    <path d="M 14 30 L 56 22 L 34 78 Z" fill="#F7C948" stroke={COL.linea} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 14 30 L 56 22" stroke="#C26A3E" strokeWidth={6} strokeLinecap="round" />
    {[[28, 36], [40, 34], [34, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#E5484D" />)}
    <rect x={62} y={34} width={22} height={44} rx={5} fill="#E5484D" stroke={COL.linea} strokeWidth={3} />
    <rect x={62} y={46} width={22} height={10} fill="#fff" />
    <path d="M 74 34 L 78 18" stroke="#fff" strokeWidth={3} />
    <path d="M 10 90 L 90 10" stroke={COL.linea} strokeWidth={12} strokeLinecap="round" />
    <path d="M 10 90 L 90 10" stroke="#E5484D" strokeWidth={7} strokeLinecap="round" />
  </svg>
);
