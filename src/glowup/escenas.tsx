import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, easeOut, lerp, POP, prog, sp } from "../comun/animacion";
import { COL, FUENTE, GTA, plata, rnd, SUBS } from "./piezas";
import { Tono } from "./Tono";

// Escenas y tarjetas reutilizables de la serie de Toño (a partir del Día 1): comentario más
// votado, título del día, currículum con sellos, cocina del restaurante, reloj de "horas
// después", billete que vuela a la billetera, lección del día, chat del primo e íconos de votación.

const L = { stroke: COL.linea, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });

/** Tarjeta "COMENTARIO MÁS VOTADO" con el nombre y el texto del seguidor. */
export const ComentarioVotado: React.FC<{ t: number; t0: number; t1: number; nombre: string; texto: string; likes: number }> = ({ t, t0, t1, nombre, texto, likes }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.3));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 330, scale: String(lerp(0.6, 1, k)), opacity: clamp01(k * 2), background: COL.blanco, borderRadius: 30, border: `7px solid ${COL.linea}`, boxShadow: "0 18px 36px rgba(0,0,0,0.4)", overflow: "hidden" }}>
      <div style={{ background: COL.amarillo, borderBottom: `6px solid ${COL.linea}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, fontFamily: FUENTE, fontSize: 40, color: COL.linea }}>
        <svg width={44} height={44} viewBox="0 0 24 24">
          <path d="M12 2.5 L14.9 8.6 L21.5 9.3 L16.6 13.8 L18 20.4 L12 17 L6 20.4 L7.4 13.8 L2.5 9.3 L9.1 8.6 Z" fill="#fff" stroke={COL.linea} strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
        COMENTARIO MÁS VOTADO
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "20px 26px" }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: "#5B7BD6", border: `5px solid ${COL.linea}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: 56, color: "#fff", flex: "none" }}>{nombre.trim()[0]?.toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SUBS, fontWeight: 900, fontSize: 34, color: "#666" }}>{nombre}</div>
          <div style={{ fontFamily: SUBS, fontWeight: 900, fontSize: 62, color: COL.linea, lineHeight: 1.05 }}>{texto}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: SUBS, fontWeight: 900, fontSize: 34, color: COL.rojo }}>
          <svg width={54} height={54} viewBox="0 0 24 24">
            <path d="M12 21 C 5 15 2 12 2 8 A 5 5 0 0 1 12 6 A 5 5 0 0 1 22 8 C 22 12 19 15 12 21 Z" fill={COL.rojo} />
          </svg>
          {likes}
        </div>
      </div>
    </div>
  );
};

/** Sello estilo GTA que golpea en el centro ("¡A TRABAJAR!"). */
export const SelloGTA: React.FC<{ t: number; t0: number; t1: number; texto: string; color?: string; top?: number; tam?: number }> = ({ t, t0, t1, texto, color = "#F7C948", top = 860, tam = 170 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const k = clamp01((t - t0) / 0.14);
  const sale = 1 - prog(t, t1, t1 + 0.25);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: GTA, fontSize: tam, color, ...contorno(tam * 0.1), textShadow: "0 8px 0 rgba(0,0,0,0.4)", scale: String(lerp(2.4, 1, easeOut(k))), opacity: k * sale }}>{texto}</div>
  );
};

/** Pantalla de título del día: "DÍA 1" gigante y cuántos días faltan para GTA VI. */
export const TituloDia: React.FC<{ t: number; t0: number; t1: number; dia: number; faltan: number }> = ({ t, t0, t1, dia, faltan }) => {
  if (t < t0 - 0.05 || t > t1 + 0.25) return null;
  const k = easeOut(prog(t, t0 - 0.05, t0 + 0.2)) * (1 - prog(t, t1, t1 + 0.25));
  const g = clamp01((t - t0) / 0.15);
  return (
    <AbsoluteFill style={{ background: `rgba(10,10,14,${0.82 * k})`, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: GTA, fontSize: 330, lineHeight: 0.9, color: "#F7C948", ...contorno(26), textShadow: "0 12px 0 rgba(0,0,0,0.5)", scale: String(lerp(2.2, 1, easeOut(g))), opacity: k }}>DÍA {dia}</div>
      <div style={{ fontFamily: GTA, fontSize: 90, color: "#fff", ...contorno(10), opacity: clamp01((t - t0 - 0.25) / 0.15) * k }}>
        FALTAN <span style={{ color: "#72D15E" }}>{faltan}</span> DÍAS PARA GTA VI
      </div>
    </AbsoluteFill>
  );
};

/** Currículum de Toño: hoja recta, foto, secciones vacías, "Nivel 100 en Fortnite" resaltado
 * y sellos de RECHAZADO que caen uno a uno. */
export const Curriculum: React.FC<{ t: number; t0: number; tResalta: number; sellos: number[] }> = ({ t, t0, tResalta, sellos }) => {
  const k = sp(t, t0, POP);
  const marca = clamp01((t - tResalta) / 0.35);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #4A7A80 0%, #1F3A3E 80%)" }}>
      <div style={{ position: "absolute", left: 140, top: 330, width: 800, height: 1060, background: "#FBF8F1", borderRadius: 12, boxShadow: "0 26px 50px rgba(0,0,0,0.45)", translate: `0 ${(1 - k) * 900}px`, padding: "50px 56px", fontFamily: SUBS }}>
        <div style={{ fontWeight: 900, fontSize: 72, color: COL.linea, letterSpacing: "0.02em" }}>CURRÍCULUM</div>
        <div style={{ height: 8, background: COL.linea, margin: "14px 0 30px" }} />
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ width: 210, height: 230, border: `6px solid ${COL.linea}`, background: "#D9E6E8", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Tono soloCabeza ancho={210} expresion="aburrido" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 64, color: COL.linea }}>TOÑO</div>
            <div style={{ fontWeight: 900, fontSize: 40, color: "#666" }}>25 años</div>
          </div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 44, color: COL.linea, marginTop: 44 }}>EXPERIENCIA</div>
        {[0, 1].map((i) => (
          <div key={i} style={{ height: 22, width: `${70 - i * 20}%`, background: "#E3DED3", borderRadius: 11, marginTop: 18 }} />
        ))}
        <div style={{ fontWeight: 900, fontSize: 44, color: COL.linea, marginTop: 44 }}>HABILIDADES</div>
        <div style={{ position: "relative", marginTop: 18, display: "inline-block" }}>
          <div style={{ position: "absolute", left: -10, top: 6, height: 66, width: `${marca * 104}%`, background: COL.amarillo, opacity: 0.85, borderRadius: 8 }} />
          <div style={{ position: "relative", fontWeight: 900, fontSize: 58, color: COL.linea }}>Nivel 100 en Fortnite</div>
        </div>
        {sellos.map((ts, i) => {
          if (t < ts) return null;
          const g = clamp01((t - ts) / 0.12);
          const pos = [
            { left: 60, top: 240 },
            { left: 300, top: 520 },
            { left: 110, top: 780 },
          ][i % 3];
          return (
            <div key={i} style={{ position: "absolute", ...pos, scale: String(lerp(2.6, 1, easeOut(g))), opacity: g * 0.92, border: `12px solid ${COL.rojo}`, borderRadius: 18, padding: "6px 30px", fontFamily: GTA, fontSize: 120, color: COL.rojo, background: "rgba(255,255,255,0.15)" }}>RECHAZADO</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Cocina del restaurante: azulejos, estantes, ollas colgando, ventana de pedidos y un fregadero
 * delante (tapa a Toño de la cintura para abajo) con platos y espuma. `oscuro` para el paso del tiempo. */
export const Cocina: React.FC<{ t: number; platos?: number; oscuro?: number; children?: React.ReactNode }> = ({ t, platos = 6, oscuro = 0, children }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill="#E8EEF0" />
      {Array.from({ length: 18 }, (_, f) =>
        Array.from({ length: 10 }, (_, c) => <rect key={`${f}-${c}`} x={c * 110} y={f * 80} width={108} height={78} fill={(f + c) % 2 ? "#DCE6EA" : "#E9F0F2"} stroke="#C5D2D8" strokeWidth={2} />),
      )}
      {/* ventana de pedidos */}
      <rect x={640} y={250} width={380} height={300} fill="#3B3F45" {...L} />
      <rect x={660} y={270} width={340} height={260} fill="#F2C47A" opacity={0.85} />
      <rect x={630} y={540} width={400} height={26} fill="#9AA3AA" {...L} strokeWidth={4} />
      <rect x={700} y={290} width={110} height={70} fill="#fff" {...L} strokeWidth={3} />
      <text x={755} y={335} textAnchor="middle" fontFamily={FUENTE} fontSize={30} fill={COL.rojo}>ORDEN</text>
      {/* estante con ollas colgando */}
      <rect x={40} y={260} width={460} height={18} fill="#8E979E" {...L} strokeWidth={4} />
      {[100, 230, 370].map((x, i) => (
        <g key={i} transform={`rotate(${Math.sin(t * 2 + i) * 3} ${x} 278)`}>
          <line x1={x} y1={278} x2={x} y2={330} stroke={COL.linea} strokeWidth={4} />
          <ellipse cx={x} cy={360 + i * 6} rx={54 - i * 6} ry={34} fill="#B9C0C6" {...L} strokeWidth={4} />
          <rect x={x + 40 - i * 6} y={352} width={60} height={14} rx={6} fill="#5A5F64" />
        </g>
      ))}
      {/* platos sucios apilados y espuma */}
      <rect x={0} y={1150} width={1080} height={770} fill="#B7C0C7" />
      <rect x={0} y={1130} width={1080} height={40} fill="#D3D9DE" {...L} />
      <rect x={250} y={1170} width={580} height={240} rx={20} fill="#8C969E" {...L} />
      {Array.from({ length: platos }, (_, i) => (
        <ellipse key={i} cx={760 + (i % 2) * 8} cy={1120 - i * 26} rx={110} ry={24} fill="#FBFBF8" {...L} strokeWidth={4} />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const y = 1140 - ((t * 60 + i * 37) % 160);
        return <circle key={i} cx={330 + rnd(i) * 420} cy={y} r={10 + rnd(i + 4) * 16} fill="#fff" opacity={0.85} stroke="#C5D2D8" strokeWidth={2} />;
      })}
      <path d="M 560 1130 L 560 1040 Q 560 1000 610 1000 L 640 1000" fill="none" stroke="#9AA3AA" strokeWidth={22} strokeLinecap="round" />
    </svg>
    {children}
    {oscuro > 0 ? <AbsoluteFill style={{ background: `rgba(15,20,40,${oscuro})` }} /> : null}
  </AbsoluteFill>
);

/** Delantal blanco encima de Toño (en la cocina; misma posición que el Toño de 720 px de ancho). */
export const Delantal: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <path d="M 470 820 L 610 820 L 640 900 L 680 1150 L 400 1150 L 440 900 Z" fill="#FAFAF7" {...L} />
    <path d="M 470 820 Q 540 760 610 820" fill="none" stroke="#FAFAF7" strokeWidth={14} />
    <rect x={480} y={980} width={120} height={70} rx={10} fill="none" stroke="#C9C4B8" strokeWidth={5} />
  </svg>
);

/** Plato que Toño lava delante del fregadero (sube, gira y brilla). */
export const PlatoLavando: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${470 + Math.sin(t * 7) * 30} ${1090 + Math.cos(t * 7) * 12}) rotate(${Math.sin(t * 7) * 15})`}>
      <ellipse rx={95} ry={26} fill="#FBFBF8" {...L} strokeWidth={5} />
      <rect x={30} y={-40} width={70} height={40} rx={10} fill="#F5D45A" {...L} strokeWidth={4} />
    </g>
  </svg>
);

/** Reloj que da vueltas rápido + "8 HORAS DESPUÉS..." estilo GTA. */
export const RelojHoras: React.FC<{ t: number; t0: number; t1: number; texto: string }> = ({ t, t0, t1, texto }) => {
  if (t < t0 || t > t1 + 0.2) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.2));
  const giro = (t - t0) * 2400;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2) }}>
      <svg width={360} height={360} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={44} fill="#FBF8F1" stroke={COL.linea} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={50} y1={10} x2={50} y2={16} stroke={COL.linea} strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line x1={50} y1={50} x2={50} y2={26} stroke={COL.linea} strokeWidth={5} strokeLinecap="round" transform={`rotate(${giro / 12} 50 50)`} />
        <line x1={50} y1={50} x2={50} y2={18} stroke={COL.rojo} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${giro} 50 50)`} />
        <circle cx={50} cy={50} r={4} fill={COL.linea} />
      </svg>
      <div style={{ fontFamily: GTA, fontSize: 120, color: "#fff", ...contorno(12), textShadow: "0 8px 0 rgba(0,0,0,0.4)" }}>{texto}</div>
    </div>
  );
};

/** Billete de $20 que vuela desde el centro hasta el dinero del HUD (arriba a la derecha). */
export const BilleteVuela: React.FC<{ t: number; t0: number; monto: number }> = ({ t, t0, monto }) => {
  const v = clamp01((t - t0) / 0.6);
  if (t < t0 || v >= 1) return t >= t0 && t < t0 + 1.4 ? <div style={{ position: "absolute", right: 60, top: 190, fontFamily: GTA, fontSize: 80, color: "#72D15E", ...contorno(9), translate: `0 ${-(t - t0 - 0.6) * 60}px`, opacity: 1 - clamp01((t - t0 - 0.6) / 0.8) }}>+{plata(monto)}</div> : null;
  const e = easeOut(v);
  const x = lerp(540, 900, e);
  const y = lerp(1000, 120, e) - Math.sin(v * Math.PI) * 200;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) rotate(${(1 - v) * 360}) scale(${lerp(1.6, 0.4, e)})`}>
        <rect x={-120} y={-58} width={240} height={116} rx={10} fill="#85C46B" stroke="#1E5A2B" strokeWidth={6} />
        <rect x={-104} y={-44} width={208} height={88} rx={8} fill="none" stroke="#1E5A2B" strokeWidth={3} />
        <circle r={30} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={4} />
        <text y={12} textAnchor="middle" fontFamily="Arial Black" fontSize={36} fill="#1E5A2B">{monto}</text>
      </g>
    </svg>
  );
};

/** Tarjeta "LECCIÓN DEL DÍA" con el texto que se escribe solo. */
export const Leccion: React.FC<{ t: number; t0: number; t1: number; lineas: [string, string]; t2: number }> = ({ t, t0, t1, lineas, t2 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.3));
  const escribe = (txt: string, a: number, dur: number) => txt.slice(0, Math.floor(clamp01((t - a) / dur) * txt.length));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 300, scale: String(lerp(0.6, 1, k)), opacity: clamp01(k * 2), background: "rgba(18,20,28,0.94)", borderRadius: 34, border: `7px solid ${COL.amarillo}`, padding: "30px 40px", boxShadow: "0 20px 40px rgba(0,0,0,0.45)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: GTA, fontSize: 70, color: COL.amarillo }}>
        <svg width={70} height={70} viewBox="0 0 24 24">
          <path d="M12 2 A 7 7 0 0 1 16 14.5 V 17 H 8 V 14.5 A 7 7 0 0 1 12 2 Z" fill={COL.amarillo} stroke="#000" strokeWidth={1.4} />
          <rect x={8.5} y={18} width={7} height={3} rx={1} fill="#ddd" stroke="#000" strokeWidth={1.2} />
        </svg>
        LECCIÓN DEL DÍA
      </div>
      <div style={{ fontFamily: SUBS, fontWeight: 900, fontSize: 60, color: "#fff", lineHeight: 1.15, marginTop: 14, minHeight: 140 }}>
        {escribe(lineas[0], t0 + 0.1, 1.0)}
        <br />
        <span style={{ color: COL.verde }}>{escribe(lineas[1], t2, 0.8)}</span>
      </div>
    </div>
  );
};

/** Celular centrado (sin isla) con el chat del primo Brayan: foto del póster de GTA VI y
 * el sello "RESERVADO". */
export const ChatPrimo: React.FC<{ t: number; t0: number; t1: number; tSello: number }> = ({ t, t0, t1, tSello }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = sp(t, t0, POP) * (1 - prog(t, t1, t1 + 0.3));
  const g = clamp01((t - tSello) / 0.14);
  return (
    <div style={{ position: "absolute", left: 230, top: 300, width: 620, height: 1100, translate: `0 ${(1 - k) * 1200}px`, borderRadius: 70, background: "#16171B", border: `8px solid ${COL.linea}`, padding: 22, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#ECE5DD", overflow: "hidden", fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ background: "#1F8F6B", color: "#fff", padding: "40px 26px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: "#F2B544", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 36, color: "#5A3A00" }}>B</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 38 }}>Primo Brayan</div>
            <div style={{ fontSize: 24, opacity: 0.85 }}>en línea</div>
          </div>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ background: "#fff", borderRadius: 22, padding: 12, width: 470, boxShadow: "0 2px 4px rgba(0,0,0,0.12)", position: "relative" }}>
            <Img src={staticFile("glowup/gta/poster.jpg")} style={{ width: "100%", height: 540, objectFit: "cover", borderRadius: 14 }} />
            {t >= tSello ? (
              <div style={{ position: "absolute", left: 50, top: 230, scale: String(lerp(2.4, 1, easeOut(g))), opacity: g, border: "10px solid #23B356", borderRadius: 16, padding: "4px 22px", fontFamily: GTA, fontSize: 84, color: "#23B356", background: "rgba(255,255,255,0.85)" }}>RESERVADO</div>
            ) : null}
            <div style={{ fontSize: 38, fontWeight: 700, color: "#222", padding: "12px 6px 0" }}>Ya lo reservé jajaja</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Íconos para la votación "AHORRAR vs INVERTIR". */
export const IconoAlcancia: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <ellipse cx={50} cy={58} rx={34} ry={26} fill="#F5A3B5" stroke={COL.linea} strokeWidth={4} />
    <circle cx={22} cy={54} r={9} fill="#F5A3B5" stroke={COL.linea} strokeWidth={4} />
    <path d="M 36 34 L 42 24 L 48 34" fill="#F5A3B5" stroke={COL.linea} strokeWidth={4} strokeLinejoin="round" />
    <rect x={40} y={36} width={20} height={5} rx={2} fill={COL.linea} />
    <circle cx={34} cy={52} r={3} fill={COL.linea} />
    <rect x={36} y={80} width={8} height={10} fill="#F5A3B5" stroke={COL.linea} strokeWidth={3} />
    <rect x={58} y={80} width={8} height={10} fill="#F5A3B5" stroke={COL.linea} strokeWidth={3} />
    <circle cx={50} cy={18} r={9} fill="#F2C744" stroke={COL.linea} strokeWidth={3} />
  </svg>
);
export const IconoReventa: React.FC = () => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <path d="M 16 42 L 84 42 L 78 88 L 22 88 Z" fill="#D9A55B" stroke={COL.linea} strokeWidth={4} strokeLinejoin="round" />
    {[[30, 32, "#E5484D"], [46, 28, "#3DDC84"], [62, 32, "#3B8BEB"], [38, 22, "#F2C744"], [56, 20, "#B06BE8"]].map(([x, y, c], i) => (
      <rect key={i} x={(x as number) - 7} y={y as number} width={14} height={20} rx={3} fill={c as string} stroke={COL.linea} strokeWidth={3} />
    ))}
    <rect x={56} y={56} width={30} height={20} rx={4} fill={COL.verde} stroke={COL.linea} strokeWidth={3} />
    <text x={71} y={71} textAnchor="middle" fontFamily="Arial Black" fontSize={13} fill={COL.linea}>$$</text>
  </svg>
);
