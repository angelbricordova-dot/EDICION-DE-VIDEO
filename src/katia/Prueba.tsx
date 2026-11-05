import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, easeOut, FPS, lerp, POP, prog, sp } from "../comun/animacion";
import datos from "./prueba.json";
import p5325 from "./postura/IMG_5325.json";
import p5326 from "./postura/IMG_5326.json";
import p5327 from "./postura/IMG_5327.json";

// Prueba para Katia (docs/katia.md), versión 3 con sus correcciones: video limpio con cortes en
// cada pausa (jump cuts que alternan plano y acercamiento), subtítulo blanco plano de una palabra,
// sin música ni transiciones (las pone Angel en CapCut). Cuando nombra un músculo se resalta en rojo
// sobre su cuerpo con una etiqueta oscura (kg y ejercicios); gráfico de fuerza y contador de
// repeticiones en tarjetas blancas; cierre con tarjetas oscuras de "compártelo" y "comenta RESET".

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

type Punto = [number, number, number] | null;
const POSTURA = { "5325": p5325.puntos, "5326": p5326.puntos, "5327": p5327.puntos } as unknown as Record<string, Record<string, Punto[]>>;
type Grupo = "piernas" | "espalda" | "hombro" | "brazo";

/** Rojo encima de los músculos que nombra, siguiendo su cuerpo cuadro a cuadro (puntos de
 * scripts/katia/postura.py en píxeles de la toma). Va dentro del zoom de la toma. */
const Resaltado: React.FC<{ clip: string; cuadro: number; grupos: { g: Grupo; k: number }[]; t: number }> = ({ clip, cuadro, grupos, t }) => {
  const P = POSTURA[clip];
  if (!P) return null;
  const pt = (n: string) => {
    const v = P[n][Math.max(0, Math.min(P[n].length - 1, cuadro))];
    return v ? { x: v[0], y: v[1] } : null;
  };
  const hi = pt("hombro_i"), hd = pt("hombro_d"), ci = pt("codo_i"), cd = pt("codo_d"), ki = pt("cadera_i"), kd = pt("cadera_d"), ri = pt("rodilla_i"), rd = pt("rodilla_d");
  if (!hi || !hd) return null;
  const ancho = Math.hypot(hi.x - hd.x, hi.y - hd.y);
  const late = 0.82 + 0.18 * Math.sin(t * 7);
  const elipse = (a: { x: number; y: number }, b: { x: number; y: number }, grosor: number, k: number, key: string) => {
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const largo = Math.hypot(b.x - a.x, b.y - a.y) / 2 + grosor * 0.3;
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    return <ellipse key={key} cx={cx} cy={cy} rx={largo} ry={grosor} transform={`rotate(${ang} ${cx} ${cy})`} fill="url(#rojoMusculo)" opacity={k * late} />;
  };
  const formas: React.ReactNode[] = [];
  for (const { g, k } of grupos) {
    if (k <= 0) continue;
    if (g === "piernas") {
      if (ki && ri) formas.push(elipse(ki, ri, ancho * 0.24, k, "pi"));
      if (kd && rd) formas.push(elipse(kd, rd, ancho * 0.24, k, "pd"));
    }
    if (g === "espalda") {
      // dorsales a los lados del tronco y trapecio entre los hombros
      const cuello = { x: (hi.x + hd.x) / 2, y: (hi.y + hd.y) / 2 - ancho * 0.1 };
      if (ki) formas.push(elipse({ x: lerp(hi.x, cuello.x, 0.12), y: hi.y + ancho * 0.08 }, { x: lerp(ki.x, cuello.x, 0.25), y: ki.y - ancho * 0.1 }, ancho * 0.16, k, "di"));
      if (kd) formas.push(elipse({ x: lerp(hd.x, cuello.x, 0.12), y: hd.y + ancho * 0.08 }, { x: lerp(kd.x, cuello.x, 0.25), y: kd.y - ancho * 0.1 }, ancho * 0.16, k, "dd"));
      // trapecio: un trozo a cada lado del cuello, sobre la línea de los hombros
      formas.push(elipse({ x: lerp(hd.x, cuello.x, 0.15), y: hd.y - ancho * 0.02 }, { x: lerp(hd.x, cuello.x, 0.6), y: lerp(hd.y, cuello.y, 0.6) }, ancho * 0.07, k, "td"));
      formas.push(elipse({ x: lerp(hi.x, cuello.x, 0.15), y: hi.y - ancho * 0.02 }, { x: lerp(hi.x, cuello.x, 0.6), y: lerp(hi.y, cuello.y, 0.6) }, ancho * 0.07, k, "ti"));
    }
    if (g === "hombro") {
      formas.push(<circle key="hi" cx={hi.x + (hi.x - hd.x) * 0.04} cy={hi.y + ancho * 0.03} r={ancho * 0.17} fill="url(#rojoMusculo)" opacity={k * late} />);
      formas.push(<circle key="hd" cx={hd.x - (hi.x - hd.x) * 0.04} cy={hd.y + ancho * 0.03} r={ancho * 0.17} fill="url(#rojoMusculo)" opacity={k * late} />);
    }
    if (g === "brazo") {
      if (ci) formas.push(elipse(hi, ci, ancho * 0.12, k, "bi"));
      if (cd) formas.push(elipse(hd, cd, ancho * 0.12, k, "bd"));
    }
  }
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, mixBlendMode: "hard-light", filter: "blur(10px)" }}>
      <defs>
        <radialGradient id="rojoMusculo">
          <stop offset="0" stopColor="#E82434" stopOpacity={0.75} />
          <stop offset="0.6" stopColor="#E82434" stopOpacity={0.45} />
          <stop offset="1" stopColor="#E82434" stopOpacity={0} />
        </radialGradient>
      </defs>
      {formas}
    </svg>
  );
};

/** Etiqueta oscura del músculo que nombra: nombre, kg (al decirlos) y ejercicios. */
const Musculo: React.FC<{ t: number; t0: number; t1: number; nombre: string; kg: string; tKg: number; ejercicios: [string, number][]; yEtiqueta: number }> = ({ t, t0, t1, nombre, kg, tKg, ejercicios, yEtiqueta }) => {
  if (t < t0 - 0.02 || t > t1 + 0.2) return null;
  const sale = 1 - prog(t, t1 - 0.05, t1 + 0.2);
  const ke = sp(t, t0 + 0.1, POP) * sale;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: yEtiqueta, display: "flex", justifyContent: "center", opacity: clamp01(ke * 2), translate: `0 ${(1 - ke) * 20}px` }}>
        <div style={{ background: "rgba(18,16,20,0.86)", borderRadius: 28, padding: "18px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: FUENTE, boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#E82434", boxShadow: "0 0 16px #E82434" }} />
            <span style={{ fontWeight: 800, fontSize: 54, color: "#fff" }}>{nombre}</span>
            {t >= tKg - 0.05 ? (
              <span style={{ fontWeight: 800, fontSize: 54, color: AZUL, scale: String(lerp(1.4, 1, easeOut(clamp01((t - tKg) / 0.2)))), display: "inline-block" }}>· {kg}</span>
            ) : null}
          </div>
          {ejercicios.some(([, te]) => t >= te - 0.02) ? (
            <div style={{ fontWeight: 600, fontSize: 34, color: "#CFC9D3" }}>
              {ejercicios.filter(([, te]) => t >= te - 0.02).map(([e]) => e).join(" · ")}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VIDRIO: React.CSSProperties = { background: "rgba(18,16,20,0.86)", borderRadius: 36, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", fontFamily: FUENTE, border: "1.5px solid rgba(255,255,255,0.08)" };

/** "Compártelo con esa amiga": tarjeta oscura; al decir "amiga" el avión de papel sale volando y queda "Enviado". */
const Compartir: React.FC<{ t: number; t0: number; tAmiga: number; t1: number }> = ({ t, t0, tAmiga, t1 }) => {
  if (t < t0 - 0.02 || t > t1 + 0.05) return null;
  const { style } = entrada(t, t0, t1);
  const vuela = easeInOut(clamp01((t - tAmiga) / 0.6));
  const kEnv = sp(t, tAmiga + 0.45, POP);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1290, ...VIDRIO, padding: "30px 36px", display: "flex", alignItems: "center", gap: 28, ...style }}>
      <div style={{ position: "relative", width: 110, height: 110, borderRadius: 55, background: ROSA, flex: "none" }}>
        <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", left: 21, top: 23, translate: `${vuela * 260}px ${-vuela * 160}px`, rotate: `${-vuela * 20}deg`, opacity: 1 - prog(t, tAmiga + 0.35, tAmiga + 0.6) }}>
          <path d="M22 3 L2 10.5 L10 13 L13 21 Z" fill="#fff" />
          <path d="M10 13 L22 3" stroke={ROSA} strokeWidth={1.6} />
        </svg>
        {t >= tAmiga + 0.45 ? (
          <svg width={60} height={60} viewBox="0 0 24 24" style={{ position: "absolute", left: 25, top: 25, scale: String(kEnv) }}>
            <path d="M5 12.5 L10 17 L19 7" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 50, color: "#fff", lineHeight: 1.1 }}>Compártelo con</div>
        <div style={{ fontWeight: 800, fontSize: 50, color: AZUL, lineHeight: 1.1 }}>{t >= tAmiga + 0.45 ? "tu amiga ✓" : "esa amiga"}</div>
      </div>
    </div>
  );
};

/** "Comenta RESET": tarjeta oscura donde se escribe RESET, se publica y salta un corazón rosa. */
const Comentario: React.FC<{ t: number; t0: number; tReset: number; t1: number }> = ({ t, t0, tReset, t1 }) => {
  if (t < t0 - 0.02) return null;
  const { style } = entrada(t, t0, t1 + 10);
  const letras = Math.floor(clamp01((t - (tReset - 0.25)) / 0.5) * 5);
  const tPub = tReset + 0.75;
  const kPub = sp(t, tPub, POP);
  const cursor = Math.floor(t * 3) % 2 === 0;
  const corazon = sp(t, tPub + 0.25, POP);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1270, display: "flex", flexDirection: "column", gap: 20, ...style }}>
      <div style={{ ...VIDRIO, padding: "26px 34px", display: "flex", alignItems: "center", gap: 24 }}>
        <svg width={64} height={64} viewBox="0 0 24 24" style={{ flex: "none" }}>
          <path d="M4 5 H20 A2 2 0 0 1 22 7 V15 A2 2 0 0 1 20 17 H10 L5 21 V17 H4 A2 2 0 0 1 2 15 V7 A2 2 0 0 1 4 5 Z" fill={ROSA} />
        </svg>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 40, color: "#9C95A1" }}>
          {t < tPub ? (
            letras ? (
              <span style={{ fontWeight: 800, fontSize: 64, color: "#fff", letterSpacing: "0.04em" }}>
                {"RESET".slice(0, letras)}
                <span style={{ color: ROSA, opacity: cursor ? 1 : 0 }}>|</span>
              </span>
            ) : (
              "Comenta la palabra…"
            )
          ) : (
            "Comenta la palabra…"
          )}
        </div>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: letras >= 5 ? ROSA : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", scale: String(t >= tPub - 0.12 && t < tPub + 0.08 ? 0.86 : 1) }}>
          <svg width={40} height={40} viewBox="0 0 24 24">
            <path d="M12 19 V5 M5 12 L12 5 L19 12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {t >= tPub ? (
        <div style={{ ...VIDRIO, alignSelf: "flex-start", padding: "20px 34px", display: "flex", alignItems: "center", gap: 22, scale: String(lerp(0.6, 1, kPub)), opacity: clamp01(kPub * 2), transformOrigin: "0 50%" }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: AZUL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 34, color: TINTA }}>T</div>
          <div style={{ fontWeight: 800, fontSize: 70, color: "#fff", letterSpacing: "0.04em" }}>RESET</div>
          <svg width={60} height={60} viewBox="0 0 24 24" style={{ scale: String(lerp(0.3, 1, corazon)) }}>
            <path d="M12 21 C 5 15 2 12 2 8 A 5 5 0 0 1 12 6 A 5 5 0 0 1 22 8 C 22 12 19 15 12 21 Z" fill={ROSA} />
          </svg>
        </div>
      ) : null}
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
  const enPesos = t >= A.piernas - 0.05 && t < fin("5327");
  // Qué músculos están en rojo y con qué fuerza (entran al nombrarlos, salen al cambiar de zona)
  const on = (a: number, b: number) => easeOut(prog(t, a - 0.05, a + 0.3)) * (1 - prog(t, b - 0.1, b + 0.15));
  const grupos: { g: Grupo; k: number }[] = [
    { g: "piernas", k: on(A.piernas, A.espalda) },
    { g: "espalda", k: on(A.espalda, A.hombro) },
    { g: "hombro", k: on(A.hombro, fin("5327")) },
    { g: "brazo", k: on(A.brazo, fin("5327")) },
  ];
  const tarjetaAbajo = (t >= A.hacer - 0.12 && t < fin("5334")) || t >= A.comparte - 0.05;
  const enFuerza = t >= ini("5338") && t < fin("5338");

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {T.map((tr, i) => {
        const a = Math.round(tr.out * FPS);
        // la última toma sigue hasta el final (debajo de la tarjeta de RESET), sin negro
        const b = i === T.length - 1 ? Math.round(PRUEBA.duracion * FPS) : Math.round((tr.out + tr.dur) * FPS);
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
              {POSTURA[tr.clip] ? <Resaltado clip={tr.clip} cuadro={Math.round((tr.src + t - tr.out) * FPS)} grupos={grupos} t={t} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Pesos de partida: el músculo que nombra se resalta en rojo sobre su cuerpo */}
      <Musculo t={t} t0={A.piernas - 0.05} t1={A.espalda - 0.08} nombre="Piernas" kg="5–8 kg" tKg={A.kgPiernas} ejercicios={[["Sentadilla", A.sentadillas], ["Peso muerto", A.muerto]]} yEtiqueta={1400} />
      <Musculo t={t} t0={A.espalda - 0.05} t1={A.hombro - 0.08} nombre="Espalda" kg="4–8 kg" tKg={A.kgEspalda} ejercicios={[["Remo", A.remo]]} yEtiqueta={1250} />
      <Musculo t={t} t0={A.hombro - 0.05} t1={fin("5327")} nombre="Hombro y brazo" kg="2–4 kg" tKg={A.kgBrazo} ejercicios={[["Hombro", A.hombro + 0.1], ["Bíceps", A.brazo]]} yEtiqueta={1300} />

      {/* Fuerza (toma con la cámara al suelo) */}
      {enFuerza ? <Fuerza t={t} t0={ini("5338") + 0.05} t1={fin("5338")} /> : null}

      {/* La regla */}
      <Repeticiones t={t} t0={A.hacer - 0.12} tDiez={A.diez} tSubas={A.subas} tSudar={ini("5334")} tUltimas={A.ultimas} t1={fin("5334")} />

      {/* Cierre: compartir y comentar */}
      <Compartir t={t} t0={A.comparte - 0.05} tAmiga={A.amiga} t1={fin("5336")} />
      <Comentario t={t} t0={A.comenta - 0.15} tReset={A.reset} t1={PRUEBA.duracion} />

      {enFuerza ? null : <Subtitulo t={t} top={enPesos ? 1620 : t >= A.comparte - 0.05 ? 1130 : tarjetaAbajo ? 1130 : 1180} />}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, PRUEBA.duracion - 0.2, PRUEBA.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
