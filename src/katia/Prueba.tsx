import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, FPS, lerp, POP, prog, sp } from "../comun/animacion";
import datos from "./prueba.json";

// Prueba para Katia (docs/katia.md): reel de la coach (estilo @claudiabruna.coach). Cortes en cada
// frase con un acercamiento alterno, subtítulo de UNA palabra fino y blanco (las claves y los números
// en rosa y más grandes), títulos rosas fijos para cada punto de la lista, gancho centrado al inicio
// y "RESET" al final. Marca: rosa #AD3158, azul #8AD2D1, Montserrat.

type Tramo = { clip: string; src: number; dur: number; out: number; soloVoz?: boolean };
type Palabra = { p: string; ini: number; fin: number; clave: boolean };
type Titulo = { t: number; fin: number; texto: string; sub: string };
export const PRUEBA = datos as { duracion: number; tramos: Tramo[]; palabras: Palabra[]; titulos: Titulo[] };
export type PropsPrueba = { audio: string | null };

const ROSA = "#AD3158";
const AZUL = "#8AD2D1";
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

/** Subtítulo de una palabra (como la referencia): fino y blanco; claves y números en rosa y grandes. */
const Subtitulo: React.FC<{ t: number }> = ({ t }) => {
  const w = PRUEBA.palabras.find((x, i) => t >= x.ini - 0.03 && (i + 1 >= PRUEBA.palabras.length || t < PRUEBA.palabras[i + 1].ini - 0.03));
  if (!w || t > w.fin + 0.35) return null;
  const k = clamp01((t - (w.ini - 0.03)) / 0.1);
  const txt = w.p.replace(/[.,;:¿?¡!…]/g, "");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center" }}>
      <span
        style={{
          fontFamily: FUENTE, fontWeight: w.clave ? 800 : 600, fontSize: w.clave ? 96 : 66, color: w.clave ? ROSA : "#fff",
          textShadow: w.clave ? undefined : SOMBRA, WebkitTextStroke: w.clave ? "3px #fff" : undefined, paintOrder: "stroke fill",
          opacity: k, scale: String(lerp(w.clave ? 1.25 : 1.08, 1, easeOut(k))), display: "inline-block",
        }}
      >
        {/reset/i.test(txt) ? `"${txt.toUpperCase()}"` : txt}
      </span>
    </div>
  );
};

/** Título rosa fijo del punto de la lista, con la segunda línea subrayada en azul. */
const TituloPunto: React.FC<{ t: number; ti: Titulo }> = ({ t, ti }) => {
  if (t < ti.t || t > ti.fin + 0.25) return null;
  const k = sp(t, ti.t, POP) * (1 - prog(t, ti.fin, ti.fin + 0.25));
  const raya = easeOut(prog(t, ti.t + 0.25, ti.t + 0.7));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: clamp01(k * 2), translate: `0 ${(1 - k) * 30}px` }}>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 78, color: ROSA, textAlign: "center", lineHeight: 1.05, WebkitTextStroke: "4px #fff", paintOrder: "stroke fill", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" }}>{ti.texto}</div>
      <div style={{ position: "relative", fontFamily: FUENTE, fontWeight: 800, fontSize: 52, color: "#fff", textShadow: SOMBRA }}>
        {ti.sub}
        <div style={{ position: "absolute", left: 0, bottom: -10, height: 10, width: `${raya * 100}%`, background: AZUL, borderRadius: 5 }} />
      </div>
    </div>
  );
};

/** Gráfico de fuerza: barras que crecen (piernas y espalda largas, brazos corta) y el mensaje. */
const Fuerza: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const filas: [string, number, string][] = [
    ["Piernas", 1, ROSA],
    ["Espalda", 0.82, ROSA],
    ["Brazos", 0.32, AZUL],
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 74, color: "#fff", textAlign: "center", lineHeight: 1.1, opacity: clamp01((t - t0) / 0.3), textShadow: SOMBRA }}>
        No uses el mismo
        <br />
        peso para <span style={{ color: ROSA, WebkitTextStroke: "3px #fff", paintOrder: "stroke fill" }}>todo</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: 860 }}>
        {filas.map(([nombre, v, c], i) => {
          const k = easeOut(prog(t, t0 + 0.4 + i * 0.35, t0 + 1.2 + i * 0.35));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 250, fontFamily: FUENTE, fontWeight: 800, fontSize: 52, color: "#fff", textAlign: "right", textShadow: SOMBRA }}>{nombre}</div>
              <div style={{ flex: 1, height: 70, background: "rgba(255,255,255,0.18)", borderRadius: 35, overflow: "hidden", border: "3px solid rgba(255,255,255,0.6)" }}>
                <div style={{ width: `${v * k * 100}%`, height: "100%", background: c, borderRadius: 35 }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Prueba: React.FC<PropsPrueba> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const T = PRUEBA.tramos;
  const reset = PRUEBA.palabras.find((w) => /reset/i.test(w.p));
  // Destello suave en los cortes con barrido (uno de cada tres)
  const cortesFlash = T.slice(1).filter((_, i) => i % 3 === 0).map((tr) => tr.out);
  const dFlash = Math.min(...cortesFlash.map((c) => Math.abs(t - c)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {T.map((tr, i) => {
        const a = Math.round(tr.out * FPS);
        const b = Math.round((tr.out + tr.dur) * FPS);
        const cerca = i % 2 === 1; // tomas alternas más cerca, para que cada corte se note
        const dentro = clamp01((t - tr.out) / tr.dur);
        const z = (cerca ? 1.14 : 1.0) + 0.04 * dentro;
        if (tr.soloVoz) {
          // La cámara mira al suelo en esta toma: se ve la de las mancuernas, desenfocada, con un
          // gráfico de fuerza (piernas y espalda mucho más fuertes que los brazos).
          return (
            <Sequence key={i} from={a} durationInFrames={b - a}>
              <AbsoluteFill style={{ scale: String(1.1 + 0.05 * dentro), filter: "blur(10px) brightness(0.55)" }}>
                <OffthreadVideo src={staticFile("katia/cortes/IMG_5325.mp4")} startFrom={0} muted style={{ width: 1080, height: 1920 }} />
              </AbsoluteFill>
              <Fuerza t={t} t0={tr.out} />
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={a} durationInFrames={b - a}>
            <AbsoluteFill style={{ scale: String(z), transformOrigin: "50% 35%" }}>
              <OffthreadVideo src={staticFile(`katia/cortes/IMG_${tr.clip}.mp4`)} startFrom={Math.round(tr.src * FPS)} muted style={{ width: 1080, height: 1920 }} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Gancho centrado al inicio */}
      {t < T[1].out ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - prog(t, T[1].out - 0.25, T[1].out) }}>
          {[
            ["¿Cuánto", "#fff"],
            ["PESO", ROSA],
            ["coger en tus entrenos?", "#fff"],
          ].map(([txt, c], i) => {
            const k = sp(t, 0.1 + i * 0.25, POP);
            return (
              <div key={i} style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: i === 1 ? 150 : 74, lineHeight: 1, color: c, textShadow: c === "#fff" ? SOMBRA : undefined, WebkitTextStroke: c === ROSA ? "5px #fff" : undefined, paintOrder: "stroke fill", scale: String(lerp(0.6, 1, k)), opacity: clamp01(k * 2), textAlign: "center" }}>
                {txt}
              </div>
            );
          })}
          <div style={{ width: `${easeOut(prog(t, 0.8, 1.3)) * 520}px`, height: 12, background: AZUL, borderRadius: 6, marginTop: 6 }} />
        </div>
      ) : null}

      {PRUEBA.titulos.map((ti, i) => (
        <TituloPunto key={i} t={t} ti={ti} />
      ))}

      {/* "RESET" grande al final */}
      {reset && t >= reset.ini - 0.03 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 56, color: "#fff", textShadow: SOMBRA, opacity: clamp01((t - reset.ini) / 0.2) }}>comenta la palabra</div>
          <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 170, color: ROSA, WebkitTextStroke: "6px #fff", paintOrder: "stroke fill", scale: String(lerp(1.6, 1, easeOut(clamp01((t - reset.ini) / 0.18)))), filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" }}>"RESET"</div>
          <div style={{ width: `${easeOut(prog(t, reset.ini + 0.2, reset.ini + 0.6)) * 600}px`, height: 14, background: AZUL, borderRadius: 7 }} />
        </div>
      ) : null}

      {T.some((tr) => tr.soloVoz && t >= tr.out && t < tr.out + tr.dur) ? null : <Subtitulo t={t} />}
      <AbsoluteFill style={{ background: "#fff", opacity: clamp01(1 - dFlash / 0.09) * 0.45, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, PRUEBA.duracion - 0.25, PRUEBA.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
