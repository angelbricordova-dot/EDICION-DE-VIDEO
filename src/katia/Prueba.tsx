import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, easeOut, FPS, lerp, POP, prog, sp } from "../comun/animacion";
import datos from "./prueba.json";

// Prueba para Katia (docs/katia.md), versión 2 con sus correcciones: video limpio con cortes en
// cada pausa (jump cuts que alternan plano y acercamiento), subtítulo blanco plano de una palabra,
// sin música. Animaciones "clean" en tarjetas blancas (Montserrat, rosa #AD3158 y azul #8AD2D1):
// pesos de partida con silueta que marca la zona y los kg que cuentan, gráfico de fuerza, contador
// de repeticiones para la regla, y al final la hoja de compartir y el comentario "RESET" de
// Instagram. Destellos tipo lens flare al cambiar de sección.

type Tramo = { clip: string; src: number; dur: number; out: number; seccion: string; soloVoz: boolean; nuevaToma: boolean };
type Palabra = { p: string; ini: number; fin: number; clip: string };
type Anclas = Record<string, number>;
export const PRUEBA = datos as { duracion: number; tramos: Tramo[]; palabras: Palabra[]; anclas: Anclas; secciones: number[] };
export type PropsPrueba = { audio: string | null };

const ROSA = "#AD3158";
const AZUL = "#8AD2D1";
const TINTA = "#1D1B20";
const GRIS = "#8A8590";
const FUENTE = '"Montserrat", "Arial", sans-serif';
let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  for (const w of ["600", "800"]) {
    loadFont({ family: "Montserrat", url: staticFile(`katia/fuentes/montserrat-latin-${w}-normal.woff2`), weight: w });
    loadFont({ family: "Montserrat", url: staticFile(`katia/fuentes/montserrat-latin-ext-${w}-normal.woff2`), weight: w });
  }
};
const SOMBRA = "0 2px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.5)";
const TARJETA: React.CSSProperties = { background: "rgba(255,255,255,0.96)", borderRadius: 44, boxShadow: "0 24px 60px rgba(0,0,0,0.28)", fontFamily: FUENTE };

/** Entrada y salida de una tarjeta: sube con muelle y se va hacia abajo. */
const entrada = (t: number, t0: number, t1: number) => {
  const k = sp(t, t0, POP);
  const s = easeInOut(prog(t, t1 - 0.25, t1));
  return { k, s, style: { opacity: clamp01(k * 2) * (1 - s), translate: `0 ${(1 - k) * 120 + s * 80}px`, scale: String(lerp(0.92, 1, k)) } as React.CSSProperties };
};

/** Subtítulo de una palabra, blanco plano (sube y se enfoca). */
const Subtitulo: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  const P = PRUEBA.palabras;
  const w = P.find((x, i) => t >= x.ini - 0.03 && (i + 1 >= P.length || t < P[i + 1].ini - 0.03));
  if (!w || t > w.fin + 0.3) return null;
  const k = clamp01((t - (w.ini - 0.03)) / 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 70, color: "#fff", textShadow: SOMBRA, opacity: k, translate: `0 ${(1 - easeOut(k)) * 16}px`, filter: k < 1 ? `blur(${(1 - k) * 5}px)` : undefined, display: "inline-block" }}>
        {w.p.replace(/[.,;:¿?¡!…]/g, "")}
      </span>
    </div>
  );
};

/** Destello tipo lens flare: halo cálido que cruza la imagen con anillos y una raya de luz. */
const Destello: React.FC<{ t: number; t0: number; i: number }> = ({ t, t0, i }) => {
  const v = (t - (t0 - 0.22)) / 0.6;
  if (v <= 0 || v >= 1) return null;
  const x = lerp(i % 2 ? 1250 : -170, i % 2 ? -170 : 1250, easeInOut(v));
  const y = 520 + (i % 3) * 220;
  const a = Math.sin(v * Math.PI);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,214,170,${0.95 * a}) 0px, rgba(255,150,120,${0.55 * a}) 140px, rgba(173,49,88,${0.35 * a}) 360px, rgba(0,0,0,0) 760px)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${i % 2 ? 100 : 80}deg, rgba(0,0,0,0) ${lerp(10, 60, v)}%, rgba(255,240,220,${0.5 * a}) ${lerp(20, 70, v)}%, rgba(0,0,0,0) ${lerp(30, 80, v)}%)` }} />
      {[0.3, 0.55, 0.8].map((f, j) => (
        <div key={j} style={{ position: "absolute", left: lerp(x, 540, f) - (40 + j * 30), top: lerp(y, 960, f) - (40 + j * 30), width: 80 + j * 60, height: 80 + j * 60, borderRadius: "50%", border: `3px solid rgba(138,210,209,${0.45 * a})`, background: `rgba(255,220,200,${0.08 * a})` }} />
      ))}
      <AbsoluteFill style={{ background: `rgba(255,248,240,${0.35 * Math.max(0, 1 - Math.abs(v - 0.45) / 0.12)})` }} />
    </AbsoluteFill>
  );
};

/** Silueta de cuerpo con la zona que trabaja resaltada en rosa (se rellena al entrar). */
const Silueta: React.FC<{ zona: "piernas" | "espalda" | "brazos"; k: number }> = ({ zona, k }) => {
  const base = "#E7E2EA";
  const on = (z: string) => (z === zona ? ROSA : base);
  const op = (z: string) => (z === zona ? 0.35 + 0.65 * k : 1);
  return (
    <svg width={170} height={300} viewBox="0 0 170 300">
      <circle cx={85} cy={34} r={26} fill={base} />
      <rect x={52} y={66} width={66} height={104} rx={24} fill={on("espalda")} opacity={op("espalda")} />
      <rect x={20} y={70} width={26} height={104} rx={13} fill={on("brazos")} opacity={op("brazos")} transform="rotate(8 33 70)" />
      <rect x={124} y={70} width={26} height={104} rx={13} fill={on("brazos")} opacity={op("brazos")} transform="rotate(-8 137 70)" />
      <rect x={54} y={168} width={28} height={124} rx={14} fill={on("piernas")} opacity={op("piernas")} />
      <rect x={88} y={168} width={28} height={124} rx={14} fill={on("piernas")} opacity={op("piernas")} />
    </svg>
  );
};

const Mancuerna: React.FC<{ tam?: number; color?: string }> = ({ tam = 54, color = ROSA }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <rect x={2} y={8} width={3} height={8} rx={1} fill={color} />
    <rect x={5} y={6} width={3} height={12} rx={1} fill={color} />
    <rect x={8} y={11} width={8} height={2} fill={color} />
    <rect x={16} y={6} width={3} height={12} rx={1} fill={color} />
    <rect x={19} y={8} width={3} height={8} rx={1} fill={color} />
  </svg>
);

/** Tarjeta de un peso de partida: silueta, zona, kg que cuentan, ejercicios y paso 1/3. */
const TarjetaPeso: React.FC<{ t: number; t0: number; t1: number; paso: number; zona: "piernas" | "espalda" | "brazos"; titulo: string; kg: [number, number]; tKg: number; ejercicios: [string, number][] }> = ({ t, t0, t1, paso, zona, titulo, kg, tKg, ejercicios }) => {
  if (t < t0 - 0.02 || t > t1 + 0.05) return null;
  const { k, style } = entrada(t, t0, t1);
  const c = easeOut(clamp01((t - tKg) / 0.45));
  const lo = Math.round(lerp(0, kg[0], c));
  const hi = Math.round(lerp(0, kg[1], c));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1290, ...TARJETA, padding: "30px 36px", display: "flex", gap: 30, alignItems: "center", ...style }}>
      <Silueta zona={zona} k={clamp01((t - t0 - 0.15) / 0.4)} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", color: GRIS }}>PASO {paso}/3</div>
          <div style={{ flex: 1, height: 8, background: "#EEE9F0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${((paso - 1 + easeOut(k)) / 3) * 100}%`, height: "100%", background: AZUL }} />
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 64, color: TINTA, marginTop: 8 }}>{titulo}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
          <Mancuerna tam={62} />
          <div style={{ fontWeight: 800, fontSize: 100, color: ROSA, lineHeight: 1, opacity: t >= tKg - 0.05 ? 1 : 0.25 }}>
            {t >= tKg - 0.05 ? `${lo}–${hi}` : "–"}
            <span style={{ fontSize: 50, marginLeft: 8 }}>kg</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          {ejercicios.map(([e, te], i) => {
            const ke = sp(t, te, POP);
            return t >= te - 0.02 ? (
              <div key={i} style={{ fontWeight: 600, fontSize: 32, color: TINTA, background: "#E9F7F6", border: `3px solid ${AZUL}`, borderRadius: 999, padding: "6px 20px", scale: String(lerp(0.6, 1, ke)), opacity: clamp01(ke * 2) }}>{e}</div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

/** Pastilla de sección, arriba (p. ej. "PESOS DE PARTIDA"). */
const Pastilla: React.FC<{ t: number; t0: number; t1: number; texto: string; icono?: React.ReactNode }> = ({ t, t0, t1, texto, icono }) => {
  if (t < t0 - 0.02 || t > t1 + 0.05) return null;
  const { style } = entrada(t, t0, t1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center", ...style, translate: undefined }}>
      <div style={{ ...TARJETA, borderRadius: 999, padding: "16px 36px", display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 44, color: TINTA, letterSpacing: "0.04em" }}>
        {icono}
        {texto}
      </div>
    </div>
  );
};

/** Gráfico de fuerza (sobre la toma desenfocada): barras que crecen por zona. */
const Fuerza: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const { style } = entrada(t, t0, t1);
  const filas: [string, number, string][] = [
    ["Piernas", 1, ROSA],
    ["Espalda", 0.82, ROSA],
    ["Brazos", 0.32, AZUL],
  ];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 520, ...TARJETA, padding: "44px 44px 50px", ...style }}>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", color: GRIS }}>¿CUÁNTA FUERZA TIENES?</div>
      <div style={{ fontWeight: 800, fontSize: 60, color: TINTA, lineHeight: 1.1, marginTop: 8 }}>
        No uses el mismo peso para <span style={{ color: ROSA }}>todo</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 36 }}>
        {filas.map(([nombre, v, c], i) => {
          const kb = easeOut(prog(t, t0 + 0.3 + i * 0.4, t0 + 1.1 + i * 0.4));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 210, fontWeight: 800, fontSize: 44, color: TINTA }}>{nombre}</div>
              <div style={{ flex: 1, height: 56, background: "#F1EDF3", borderRadius: 28, overflow: "hidden" }}>
                <div style={{ width: `${v * kb * 100}%`, height: "100%", background: c, borderRadius: 28 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Contador de repeticiones: se llenan hasta 10 con la voz; al pasar de 10 → "sube de peso".
 * En la segunda parte las 2-3 últimas laten en rosa (las que te hacen sudar). */
const Repeticiones: React.FC<{ t: number; t0: number; tDiez: number; tSubas: number; tSudar: number; tUltimas: number; t1: number }> = ({ t, t0, tDiez, tSubas, tSudar, tUltimas, t1 }) => {
  if (t < t0 - 0.02 || t > t1 + 0.05) return null;
  const { style } = entrada(t, t0, t1);
  const llenas = t < tDiez ? Math.floor(lerp(0, 10, clamp01((t - t0 - 0.1) / Math.max(0.3, tDiez - t0 - 0.1)))) : t < tSubas ? 10 : 12;
  const segunda = t >= tSudar - 0.1;
  const kSube = sp(t, tSubas, POP);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1290, ...TARJETA, padding: "32px 36px", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", color: GRIS }}>{segunda ? "EL PESO BUENO" : "LA REGLA REAL"}</div>
        <div style={{ fontWeight: 800, fontSize: 56, color: TINTA }}>
          {segunda ? "10" : Math.min(llenas, 12)}
          <span style={{ fontSize: 30, color: GRIS }}> reps</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {Array.from({ length: segunda ? 10 : 12 }, (_, i) => {
          const llena = segunda ? true : i < llenas;
          const ultima = segunda && i >= 7 && t >= tUltimas - 0.1;
          const extra = !segunda && i >= 10;
          const late = ultima ? 1 + 0.08 * Math.sin((t - tUltimas) * 12 + i) : 1;
          return (
            <div key={i} style={{ flex: 1, height: 70, borderRadius: 16, background: !llena ? "#F1EDF3" : ultima ? ROSA : extra ? ROSA : AZUL, scale: String(late), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: llena ? "#fff" : "#C9C2CE" }}>
              {i + 1}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {segunda ? (
          t >= tUltimas - 0.1 ? (
            <div style={{ fontWeight: 800, fontSize: 46, color: ROSA, opacity: clamp01((t - tUltimas + 0.1) / 0.2) }}>Las 2–3 últimas te cuestan</div>
          ) : (
            <div style={{ fontWeight: 600, fontSize: 40, color: GRIS }}>…el que te hace sudar</div>
          )
        ) : t >= tSubas - 0.02 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: ROSA, color: "#fff", borderRadius: 999, padding: "10px 32px", fontWeight: 800, fontSize: 44, scale: String(lerp(0.5, 1, kSube)), opacity: clamp01(kSube * 2) }}>
            <svg width={40} height={40} viewBox="0 0 24 24">
              <path d="M12 3 L20 12 H15 V21 H9 V12 H4 Z" fill="#fff" />
            </svg>
            +10 reps → SUBE DE PESO
          </div>
        ) : (
          <div style={{ fontWeight: 600, fontSize: 40, color: GRIS }}>¿Puedes hacer más de 10?</div>
        )}
      </div>
    </div>
  );
};

const Avatar: React.FC<{ letra: string; color: string; tam?: number; marcado?: boolean; k?: number }> = ({ letra, color, tam = 110, marcado, k = 1 }) => (
  <div style={{ position: "relative", width: tam, height: tam, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: tam * 0.42, color: "#fff", boxShadow: marcado ? `0 0 0 6px #fff, 0 0 0 10px #0095F6` : undefined }}>
    {letra}
    {marcado ? (
      <div style={{ position: "absolute", right: -6, bottom: -6, width: 44, height: 44, borderRadius: 22, background: "#0095F6", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", scale: String(k) }}>
        <svg width={24} height={24} viewBox="0 0 24 24">
          <path d="M5 12.5 L10 17 L19 7" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ) : null}
  </div>
);

/** Hoja "Compartir" de Instagram: sube, se marca "tu amiga" y se pulsa Enviar. */
const Compartir: React.FC<{ t: number; t0: number; tAmiga: number; t1: number }> = ({ t, t0, tAmiga, t1 }) => {
  if (t < t0 - 0.02 || t > t1 + 0.05) return null;
  const k = easeOut(prog(t, t0, t0 + 0.4));
  const s = easeInOut(prog(t, t1 - 0.3, t1));
  const marca = sp(t, tAmiga, POP);
  const envio = prog(t, tAmiga + 0.9, tAmiga + 1.1);
  const amigas: [string, string, string][] = [
    ["L", "#E6A0B8", "Laura"],
    ["M", "#9EC9E9", "Marta"],
    ["A", "#B9A0E6", "Tu amiga"],
    ["S", "#F2C38F", "Sara"],
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 640, translate: `0 ${(1 - k + s) * 660}px`, background: "#fff", borderRadius: "44px 44px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", fontFamily: FUENTE, padding: "22px 50px" }}>
      <div style={{ width: 90, height: 10, borderRadius: 5, background: "#DDD", margin: "0 auto 26px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 44, color: TINTA }}>
        <svg width={48} height={48} viewBox="0 0 24 24">
          <path d="M22 3 L2 10.5 L10 13 L13 21 Z M10 13 L22 3" fill="none" stroke={TINTA} strokeWidth={2} strokeLinejoin="round" />
        </svg>
        Compartir
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
        {amigas.map(([l, c, n], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 200 }}>
            <Avatar letra={l} color={c} tam={130} marcado={i === 2 && t >= tAmiga} k={marca} />
            <div style={{ fontWeight: i === 2 ? 800 : 600, fontSize: 32, color: i === 2 ? TINTA : GRIS }}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 50, height: 100, borderRadius: 24, background: t >= tAmiga ? "#0095F6" : "#B9DCF9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 42, color: "#fff", scale: String(1 - 0.05 * Math.sin(envio * Math.PI)) }}>
        {envio >= 1 ? "Enviado ✓" : "Enviar"}
      </div>
    </div>
  );
};

/** Comentarios de Instagram: se escribe "RESET" en la caja, se publica y aparece arriba con su ♥. */
const Comentario: React.FC<{ t: number; t0: number; tReset: number; t1: number }> = ({ t, t0, tReset, t1 }) => {
  if (t < t0 - 0.02) return null;
  const k = easeOut(prog(t, t0, t0 + 0.4));
  const letras = Math.floor(clamp01((t - (tReset - 0.25)) / 0.5) * 5);
  const tPub = tReset + 0.75;
  const publicado = t >= tPub;
  const kc = sp(t, tPub, POP);
  const kCor = sp(t, tPub + 0.45, POP);
  const cursor = Math.floor(t * 3) % 2 === 0;
  const otros: [string, string, string][] = [
    ["C", "#E6A0B8", "RESET 🙋🏻‍♀️"],
    ["P", "#9EC9E9", "RESET"],
  ];
  const Fila: React.FC<{ letra: string; color: string; nombre: string; texto: string; cor?: number; nuevo?: boolean }> = ({ letra, color, nombre, texto, cor = 0, nuevo }) => (
    <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "16px 0", background: nuevo ? `rgba(138,210,209,${0.18 * (1 - prog(t, tPub + 1, tPub + 2))})` : undefined, borderRadius: 20 }}>
      <Avatar letra={letra} color={color} tam={84} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 30, color: TINTA }}>
          {nombre} <span style={{ fontWeight: 600, color: GRIS }}>· ahora</span>
        </div>
        <div style={{ fontWeight: nuevo ? 800 : 600, fontSize: 42, color: TINTA }}>{texto}</div>
      </div>
      <svg width={52} height={52} viewBox="0 0 24 24" style={{ scale: String(1 + 0.3 * Math.sin(clamp01(cor) * Math.PI)) }}>
        <path d="M12 21 C 5 15 2 12 2 8 A 5 5 0 0 1 12 6 A 5 5 0 0 1 22 8 C 22 12 19 15 12 21 Z" fill={cor > 0.5 ? "#FF3040" : "none"} stroke={cor > 0.5 ? "#FF3040" : GRIS} strokeWidth={1.8} />
      </svg>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, translate: `0 ${(1 - k) * 780}px`, background: "#fff", borderRadius: "44px 44px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", fontFamily: FUENTE, padding: "22px 50px", opacity: 1 - prog(t, t1 - 0.1, t1) }}>
      <div style={{ width: 90, height: 10, borderRadius: 5, background: "#DDD", margin: "0 auto 18px" }} />
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 40, color: TINTA, marginBottom: 10 }}>Comentarios</div>
      <div style={{ height: 420, overflow: "hidden" }}>
        {publicado ? (
          <div style={{ opacity: clamp01(kc * 2), translate: `0 ${(1 - kc) * -40}px` }}>
            <Fila letra="T" color={ROSA} nombre="tú" texto="RESET" cor={kCor} nuevo />
          </div>
        ) : null}
        <div>
          {otros.map(([l, c, x], i) => (
            <Fila key={i} letra={l} color={c} nombre={i ? "paula.fit" : "carmen_50"} texto={x} cor={1} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 50, display: "flex", alignItems: "center", gap: 20 }}>
        <Avatar letra="T" color={ROSA} tam={84} />
        <div style={{ flex: 1, height: 96, borderRadius: 48, border: "3px solid #E2DEE6", display: "flex", alignItems: "center", padding: "0 32px", fontSize: 40, fontWeight: letras ? 800 : 600, color: letras ? TINTA : "#B4AEB9" }}>
          {publicado ? <span style={{ color: "#B4AEB9", fontWeight: 600 }}>Añade un comentario…</span> : letras ? "RESET".slice(0, letras) : "Añade un comentario…"}
          {!publicado && letras > 0 && cursor ? <span style={{ color: "#0095F6" }}>|</span> : null}
        </div>
        <div style={{ fontWeight: 800, fontSize: 38, color: letras >= 5 ? "#0095F6" : "#B9DCF9", scale: String(t >= tPub - 0.12 && t < tPub + 0.1 ? 0.9 : 1) }}>Publicar</div>
      </div>
    </div>
  );
};

export const Prueba: React.FC<PropsPrueba> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const T = PRUEBA.tramos;
  const A = PRUEBA.anclas;
  const fin = (clip: string) => {
    const ts = T.filter((x) => x.clip === clip);
    return ts[ts.length - 1].out + ts[ts.length - 1].dur;
  };
  const ini = (clip: string) => T.find((x) => x.clip === clip)!.out;
  // Dónde va el subtítulo: sube cuando hay tarjetas o hojas abajo
  const tarjetaAbajo = (t >= A.piernas - 0.05 && t < fin("5327")) || (t >= A.hacer - 0.12 && t < fin("5334")) || t >= A.comparte - 0.05;
  const enFuerza = t >= ini("5338") && t < fin("5338");

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {T.map((tr, i) => {
        const a = Math.round(tr.out * FPS);
        const b = Math.round((tr.out + tr.dur) * FPS);
        // Jump cut: cada trozo alterna plano normal y acercamiento; dentro, un empuje muy lento.
        const cerca = i % 2 === 1;
        const dentro = clamp01((t - tr.out) / Math.max(tr.dur, 0.1));
        const z = (cerca ? 1.15 : 1.0) + 0.035 * dentro;
        if (tr.soloVoz) {
          return (
            <Sequence key={i} from={a} durationInFrames={b - a}>
              <AbsoluteFill style={{ scale: String(1.12 + 0.04 * dentro), filter: "blur(14px) brightness(0.6) saturate(1.1)" }}>
                <OffthreadVideo src={staticFile("katia/cortes/IMG_5325.mp4")} startFrom={0} muted style={{ width: 1080, height: 1920 }} />
              </AbsoluteFill>
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={a} durationInFrames={b - a}>
            <AbsoluteFill style={{ scale: String(z), transformOrigin: "50% 32%" }}>
              <OffthreadVideo src={staticFile(`katia/cortes/IMG_${tr.clip}.mp4`)} startFrom={Math.round(tr.src * FPS)} muted style={{ width: 1080, height: 1920 }} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Pesos de partida */}
      <Pastilla t={t} t0={A.pesosIntro - 0.05} t1={fin("5327")} texto="PESOS DE PARTIDA" icono={<Mancuerna tam={48} />} />
      <TarjetaPeso t={t} t0={A.piernas - 0.05} t1={A.espalda - 0.08} paso={1} zona="piernas" titulo="Piernas" kg={[5, 8]} tKg={A.kgPiernas} ejercicios={[["Sentadilla", A.sentadillas], ["Peso muerto", A.muerto]]} />
      <TarjetaPeso t={t} t0={A.espalda - 0.05} t1={A.hombro - 0.08} paso={2} zona="espalda" titulo="Espalda" kg={[4, 8]} tKg={A.kgEspalda} ejercicios={[["Remo", A.remo]]} />
      <TarjetaPeso t={t} t0={A.hombro - 0.05} t1={fin("5327")} paso={3} zona="brazos" titulo="Hombro y brazo" kg={[2, 4]} tKg={A.kgBrazo} ejercicios={[["Hombro", A.hombro + 0.1], ["Bíceps", A.brazo]]} />

      {/* Fuerza (toma con la cámara al suelo) */}
      {enFuerza ? <Fuerza t={t} t0={ini("5338") + 0.05} t1={fin("5338")} /> : null}

      {/* La regla */}
      <Pastilla t={t} t0={A.regla - 0.05} t1={fin("5334")} texto="LA REGLA QUE CASI NADIE SABE" />
      <Repeticiones t={t} t0={A.hacer - 0.12} tDiez={A.diez} tSubas={A.subas} tSudar={ini("5334")} tUltimas={A.ultimas} t1={fin("5334")} />

      {/* Cierre: compartir y comentar */}
      <Compartir t={t} t0={A.comparte - 0.05} tAmiga={A.amiga} t1={fin("5336")} />
      <Comentario t={t} t0={A.comenta - 0.15} tReset={A.reset} t1={PRUEBA.duracion} />

      {enFuerza ? null : <Subtitulo t={t} top={t >= A.comenta - 0.15 ? 1000 : t >= A.comparte - 0.05 ? 1120 : tarjetaAbajo ? 1130 : 1180} />}
      {PRUEBA.secciones.map((s, i) => (
        <Destello key={i} t={t} t0={s} i={i} />
      ))}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, PRUEBA.duracion - 0.2, PRUEBA.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
