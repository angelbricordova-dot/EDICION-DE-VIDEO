import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, easeOut, FPS, lerp, POP, sp } from "../comun/animacion";
import datos from "./prueba.json";

// Reel de prueba de Paul (docs/paul.md): 5 clips de Veo (Google Flow) con Don Aurelio, cortes
// secos como la referencia, un leve acercamiento en cada plano, subtítulos de 2-3 palabras en
// mayúsculas (Oswald 700, contorno negro) con la palabra clave en celeste, etiqueta "5 MIN",
// y al cierre el comentario "JENGIBRE" que se escribe y el botón "Seguir".

type Tramo = { clip: number; src: number; dur: number; out: number; congelar: number | null };
type Palabra = { p: string; ini: number; fin: number; clave: boolean };
export type PropsPrueba = { audio: string | null };
export const PRUEBA = datos as { duracion: number; tramos: Tramo[]; palabras: Palabra[] };

const CELESTE = "#22C8F5";
const FUENTE = '"Oswald", "Anton", Impact, sans-serif';
let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Oswald", url: staticFile("paul/fuentes/oswald-latin-700-normal.woff2"), weight: "700" });
};

// Dónde está la taza en el cuadro congelado del clip 2 (fracción del cuadro).
const TAZA = { x: 0.73, y: 0.81 };

const Plano: React.FC<{ tr: Tramo; i: number }> = ({ tr, i }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // Acercamiento suave alterno (entra un poco más cerca y se abre, o al revés).
  const k = easeInOut(clamp01(t / tr.dur));
  const zoom = i % 2 ? lerp(1.08, 1.0, k) : lerp(1.0, 1.07, k);
  const congela = tr.congelar !== null && tr.src + t >= tr.congelar;
  const estilo: React.CSSProperties = { position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" };
  if (congela) {
    const t0 = (tr.congelar as number) - tr.src;
    const kz = easeOut(clamp01((t - t0) / 1.6));
    return (
      <AbsoluteFill style={{ scale: String(zoom * lerp(1, 1.45, kz)), transformOrigin: `${TAZA.x * 100}% ${TAZA.y * 100}%` }}>
        <Img src={staticFile(`paul/clips/clip${tr.clip}-congelado.jpg`)} style={estilo} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ scale: String(zoom), transformOrigin: "50% 45%" }}>
      <OffthreadVideo src={staticFile(`paul/clips/clip${tr.clip}.mp4`)} startFrom={Math.round(tr.src * FPS)} muted style={estilo} />
    </AbsoluteFill>
  );
};

/** Bloques de una línea: hasta 3 palabras y 16 letras; corta en los puntos y comas. */
const bloques = (ps: Palabra[]) => {
  const out: Palabra[][] = [];
  let actual: Palabra[] = [];
  const largo = (b: Palabra[]) => b.map((w) => w.p).join(" ").length;
  for (const w of ps) {
    if (actual.length && (actual.length >= 3 || largo([...actual, w]) > 16 || w.ini - actual[actual.length - 1].fin > 0.35)) {
      out.push(actual);
      actual = [];
    }
    actual.push(w);
    if (/[.,?!]$/.test(w.p)) {
      out.push(actual);
      actual = [];
    }
  }
  if (actual.length) out.push(actual);
  return out;
};

const Subtitulos: React.FC<{ t: number }> = ({ t }) => {
  const bs = bloques(PRUEBA.palabras);
  const i = bs.findIndex((b, j) => t >= b[0].ini - 0.05 && (j + 1 >= bs.length || t < bs[j + 1][0].ini - 0.05));
  if (i < 0) return null;
  const b = bs[i];
  if (t > b[b.length - 1].fin + 0.6) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1210, display: "flex", justifyContent: "center", gap: 22 }}>
      {b.map((w, j) => {
        const k = clamp01((t - (w.ini - 0.04)) / 0.14);
        return (
          <span
            key={j}
            style={{
              fontFamily: FUENTE, fontWeight: 700, fontSize: 104, lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.01em",
              color: w.clave ? CELESTE : "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
              textShadow: "0 6px 14px rgba(0,0,0,0.45)", opacity: k, translate: `0 ${(1 - easeOut(k)) * 26}px`,
              filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined, whiteSpace: "nowrap",
            }}
          >
            {w.p.replace(/[.,]/g, "")}
          </span>
        );
      })}
    </div>
  );
};

const busca = (p: string, desde = 0) => {
  const w = PRUEBA.palabras.find((x) => x.ini >= desde && x.p.toLowerCase().replace(/[^a-záéíóúñ]/g, "") === p);
  if (!w) throw new Error(`No encontré "${p}"`);
  return w.ini;
};

const Reloj: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <circle cx={12} cy={13} r={8.5} fill="none" stroke="#151515" strokeWidth={2.4} />
    <path d="M12 8.5 V13 L15 15" fill="none" stroke={CELESTE} strokeWidth={2.4} strokeLinecap="round" />
    <path d="M9.5 2.5 H14.5" stroke="#151515" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);

/** Pastilla recta "5 MIN" cuando dice "cinco minutos". */
const CincoMin: React.FC<{ t: number }> = ({ t }) => {
  const t0 = busca("cinco") - 0.05;
  const t1 = PRUEBA.tramos[1].out + PRUEBA.tramos[1].dur;
  if (t < t0 || t > t1) return null;
  const k = sp(t, t0, POP);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center" }}>
      <div style={{ scale: String(lerp(0.5, 1, k)), opacity: clamp01(k * 2), display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 999, padding: "14px 36px 14px 24px", boxShadow: "0 14px 32px rgba(0,0,0,0.35)" }}>
        <Reloj tam={64} />
        <span style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 64, color: "#151515", lineHeight: 1 }}>5 MIN</span>
      </div>
    </div>
  );
};

/** Cierre: comentario "JENGIBRE" que se escribe y botón "Seguir" al decir "sígueme". */
const Cierre: React.FC<{ t: number }> = ({ t }) => {
  const t0 = busca("comenta") - 0.1;
  if (t < t0) return null;
  const k = sp(t, t0, POP);
  const palabra = "JENGIBRE";
  const letras = Math.floor(clamp01((t - t0 - 0.35) / 0.7) * palabra.length);
  const ts = busca("sígueme") - 0.1;
  const ks = sp(t, ts, POP);
  const pulso = t > ts + 0.6 ? 1 + 0.04 * Math.sin((t - ts) * 6) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ scale: String(lerp(0.6, 1, k)), opacity: clamp01(k * 2), display: "flex", alignItems: "center", gap: 18, background: "rgba(20,22,26,0.88)", borderRadius: 30, padding: "18px 30px", boxShadow: "0 14px 32px rgba(0,0,0,0.4)" }}>
        <svg width={58} height={58} viewBox="0 0 24 24">
          <path d="M4 5 H20 A2 2 0 0 1 22 7 V15 A2 2 0 0 1 20 17 H10 L5 21 V17 H4 A2 2 0 0 1 2 15 V7 A2 2 0 0 1 4 5 Z" fill={CELESTE} />
        </svg>
        <span style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 64, color: "#fff", lineHeight: 1, minWidth: 300 }}>
          {palabra.slice(0, letras)}
          <span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: CELESTE }}>|</span>
        </span>
      </div>
      {t >= ts ? (
        <div style={{ scale: String(lerp(0.5, 1, ks) * pulso), opacity: clamp01(ks * 2), background: "#0095F6", borderRadius: 18, padding: "16px 54px", boxShadow: "0 12px 28px rgba(0,0,0,0.35)" }}>
          <span style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 56, color: "#fff", lineHeight: 1 }}>SEGUIR</span>
        </div>
      ) : null}
    </div>
  );
};

export const Prueba: React.FC<PropsPrueba> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {PRUEBA.tramos.map((tr, i) => (
        <Sequence key={i} from={Math.round(tr.out * FPS)} durationInFrames={Math.round((tr.out + tr.dur) * FPS) - Math.round(tr.out * FPS)}>
          <Plano tr={tr} i={i} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />
      <CincoMin t={t} />
      <Cierre t={t} />
      <Subtitulos t={t} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

