import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteraVacia, cargarFuentes, Cuarto, Episodio, Mama, Marcador, Mision, Moscas, Notificacion, Olor, rnd, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia0.json";

// Día 0 (tráiler) de la serie de Toño: presentación, GTA VI en 15 días, billetera vacía, meta de
// $1.000 y primera votación (vender sus cosas o buscar trabajo). Escenas ancladas a las frases de
// la voz (src/glowup/dia0.json, de scripts/glowup/montar_dia.py).

export const DIA0 = datos as Episodio;
export type PropsDia = { audio: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};

export const Dia0: React.FC<PropsDia> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const f = (id: string) => {
    const x = DIA0.frases.find((z) => z.id === id);
    if (!x) throw new Error(`Falta la frase ${id}`);
    return x;
  };
  const w = (p: string, desde = 0) => DIA0.palabras.find((z) => z.ini >= desde && z.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "") === p)?.ini ?? desde;

  const edad = f("edad").t;
  const mama = f("mama");
  const gta = f("gta");
  const juego = f("juego").t;
  const meta = f("meta");
  const pregunta = f("pregunta").t;
  const sigue = f("sigueme").t;
  const tA = w("vender", pregunta) - 0.1;
  const tB = w("buscar", pregunta) - 0.1;
  const tMil = w("mil", meta.t);
  const tQuince = w("15", meta.t);
  const tCero = w("cero", edad);
  const finMision = meta.fin + 0.35;
  // "cero pesos": se saca los bolsillos vacíos
  const pose: Pose = t >= tCero - 0.08 && t < mama.t - 0.05 ? "bolsillos" : "normal";
  const saltoPose = pose === "bolsillos" ? 1 + 0.04 * Math.exp(-(t - tCero) * 10) : 1;

  // Expresión según el momento
  let expresion: Expresion = "aburrido";
  if (t >= mama.t + 0.6 && t < gta.t) expresion = "feliz";
  if (t >= gta.t && t < juego) expresion = "shock";
  if (t >= tMil && t < pregunta) expresion = "shock";
  if (pose === "bolsillos") expresion = "shock";
  if (t >= sigue) expresion = "feliz";
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;

  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const enCuarto = t >= edad && (t < juego || t >= meta.t);
  const desdeEscena = t >= meta.t ? t - meta.t : t - edad;
  const empuje = lerp(1.07, 1, easeOut(clamp01(desdeEscena / 0.5)));
  // Toño baja cuando salen las tarjetas de votación y el botón de seguir
  const baja = 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x));

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* 1. Primer plano: "Este es Toño." */}
      {t < edad ? (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #5A8F94 0%, #2C5256 80%)", scale: String(lerp(1.0, 1.08, t / edad)) }}>
          <div style={{ position: "absolute", left: 50, top: 330 }}>
            <Tono soloCabeza ancho={980} expresion="aburrido" parpadeo={parpadeo(t)} t={t} />
          </div>
          <Olor t={t} x={540} y={520} escala={1.6} />
          <Moscas t={t} cx={540} cy={760} radio={430} n={5} />
        </AbsoluteFill>
      ) : null}

      {/* 2. El cuarto */}
      {enCuarto ? (
        <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 45%" }}>
          <Cuarto t={t} />
          <div style={{ position: "absolute", left: 180, top: 292 + baja, transformOrigin: "50% 100%", scale: `${saltoPose} ${respira * saltoPose}` }}>
            <Tono ancho={720} expresion={expresion} pose={pose} parpadeo={expresion === "aburrido" ? parpadeo(t) : 0} mirada={mirada} t={t} />
          </div>
          {/* polvito que sale de los bolsillos vacíos */}
          {pose === "bolsillos" ? (
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 16 }, (_, i) => {
                const v = clamp01((t - tCero - rnd(i) * 0.4) / 0.9);
                if (v <= 0 || v >= 1) return null;
                const x0 = i % 2 ? 180 + 116 * 1.2 : 180 + 484 * 1.2;
                return <circle key={i} cx={x0 + (rnd(i + 3) - 0.5) * 160 * v} cy={292 + 900 * 1.2 + v * 120} r={(6 + rnd(i) * 10) * (1 - v * 0.5)} fill="#D8D0C0" opacity={(1 - v) * 0.85} />;
              })}
            </svg>
          ) : null}
          <Olor t={t} x={540} y={470 + baja} escala={1.2} />
          <Moscas t={t} cx={540} cy={600 + baja} radio={280} n={4} />
          <Mama t={t} t0={mama.t - 0.05} t1={gta.t - 0.15} />
        </AbsoluteFill>
      ) : null}

      {/* 3. "…y no tiene ni para el juego." */}
      {t >= juego && t < meta.t ? (
        <AbsoluteFill>
          <BilleteraVacia t={t} t0={juego} />
          {t > juego + 1.0 ? (
            <div style={{ position: "absolute", left: 300, top: 1250, translate: `0 ${(1 - easeOut(clamp01((t - juego - 1.0) / 0.3))) * 500}px` }}>
              <Tono soloCabeza ancho={480} expresion="llora" t={t} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      <Notificacion t={t} t0={gta.t - 0.05} t1={juego - 0.1} titulo="Recordatorio" texto="GTA VI sale en 15 días" />
      <Mision t={t} t0={meta.t} tDias={tQuince} tMonto={tMil} t1={meta.fin + 0.1} dias={15} monto={1000} />
      <Marcador t={t} t0={finMision} dias={15} dinero={0} meta={1000} nivel={0} />
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="VENDER SUS COSAS" b="BUSCAR TRABAJO" />
      <Seguir t={t} t0={sigue} dia={1} />
      {t < meta.t - 0.05 || t > finMision ? <Subtitulos t={t} palabras={DIA0.palabras} y={t >= juego && t < meta.t ? 1120 : 1440} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA0.duracion - 0.25, DIA0.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
