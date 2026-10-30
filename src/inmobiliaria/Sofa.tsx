import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../comun/animacion";
import { AMARILLO, bloques, cargarFuentes, Corte, Destello, easeOut, INTER, lerp, Palabra, Pop, prog, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, limpio, Pildora } from "./comunes";

// Formato sofá (reels 14 y 16). Las dos mitades se grabaron por separado con la cámara quieta:
// a la izquierda el de camiseta blanca y a la derecha el de camiseta negra. Cada mitad pone su
// toma cuando habla y, cuando escucha, un tramo suyo en silencio (scripts/inmobiliaria/corte_inmo.py →
// "relleno"). La costura del centro es un degradado suave. Arriba: el título, la etiqueta de
// cada lado, la categoría y la tarjeta con lo que dice cada uno. El zoom se acerca despacio hacia
// el que habla.

export type Lado = "izq" | "der";
type CorteSofa = Corte & { lado?: Lado; toma?: number };
type Relleno = { lado: Lado; src: number; dur: number; out: number };
export type CorteSofaReel = { duracion: number; cortes: CorteSofa[]; palabras: Palabra[]; relleno: Relleno[] };

type Tarjeta = { texto: string; en?: string; extras?: [string, string][] };
export type ItemSofa = { cat: string; en: string; izq?: Tarjeta; der?: Tarjeta };
export type ConfigSofa = {
  video: string;
  versiones: Record<string, CorteSofaReel>;
  titulo: { linea1: string; linea2: string; en2: string; color2?: string };
  etiquetas: Record<Lado, { texto: string; color: string; en?: string }>;
  items: ItemSofa[];
  finItems: string[]; // palabras en cadena (tras el último item): donde se van categoría y tarjetas
  pildoras?: { en: string; texto: string; ok: boolean; y?: number }[];
  cta: { en: string; escribe: string; palabra: string };
  amarillas: string[];
};
export type PropsSofa = { audio: string | null; version: string };

const VERDE = "#22B53A";
const CENTRO = { izq: 290, der: 800 };
const Y_CARAS = 860;

const Signo: React.FC<{ ok: boolean }> = ({ ok }) => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={ok ? VERDE : "#E3141F"} />
    {ok ? <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);

const Mitad: React.FC<{ video: string; tramos: { src: number; dur: number; out: number }[]; lado: Lado }> = ({ video, tramos, lado }) => (
  <AbsoluteFill
    style={{
      WebkitMaskImage: lado === "izq" ? "linear-gradient(90deg, #000 0%, #000 47%, transparent 53%)" : undefined,
      maskImage: lado === "izq" ? "linear-gradient(90deg, #000 0%, #000 47%, transparent 53%)" : undefined,
    }}
  >
    {tramos.map((c, i) => {
      const desde = Math.round(c.out * FPS);
      const hasta = Math.round((c.out + c.dur) * FPS);
      if (hasta <= desde) return null;
      return (
        <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
          <OffthreadVideo src={staticFile(video)} startFrom={Math.round(c.src * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

/** Tarjeta de lo que dice cada uno (con líneas extra que aparecen con la voz). */
const Eleccion: React.FC<{ t: number; t0: number; color: string; texto: string; extras: { t0: number; texto: string }[] }> = ({ t, t0, color, texto, extras }) => (
  <Pop t={t} t0={t0} desde={0.6}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", width: 440 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "12px 18px", boxShadow: `0 12px 28px rgba(0,0,0,0.35), inset 0 -6px 0 ${color}`, fontFamily: INTER, fontWeight: 900, fontSize: 38, lineHeight: 1.1, color: "#151515", textAlign: "center" }}>{texto}</div>
      {extras.map((x, i) =>
        t >= x.t0 - 0.05 ? (
          <Pop key={i} t={t} t0={x.t0 - 0.05} desde={0.6}>
            <div style={{ background: "rgba(16,18,22,0.78)", borderRadius: 20, padding: "8px 14px", fontFamily: INTER, fontWeight: 800, fontSize: 29, lineHeight: 1.15, color: "#fff", textAlign: "center" }}>{x.texto}</div>
          </Pop>
        ) : null,
      )}
    </div>
  </Pop>
);

export const crearSofa = (C: ConfigSofa) => {
  const Reel: React.FC<PropsSofa> = ({ audio, version }) => {
    cargarFuentes();
    const t = useCurrentFrame() / FPS;
    const { cortes, palabras, duracion, relleno } = C.versiones[version];

    const tras = (p: string, desde = 0) => {
      for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p).startsWith(limpio(p))) return w.ini;
      throw new Error(`No encontré "${p}" después de ${desde.toFixed(2)}`);
    };
    const quizas = (p: string | undefined, desde: number, hasta: number, porDefecto: number) => {
      if (!p) return porDefecto;
      try {
        const v = tras(p, desde);
        return v <= hasta ? v : porDefecto;
      } catch {
        return porDefecto;
      }
    };

    const tramos = (lado: Lado) => [...cortes.filter((c) => c.lado === lado), ...relleno.filter((r) => r.lado === lado)];
    const hablando = (tt: number): Lado => {
      const c = cortes.find((c) => tt >= c.out && tt < c.out + c.dur) ?? [...cortes].reverse().find((c) => c.out <= tt) ?? cortes[0];
      return (c.lado ?? "izq") as Lado;
    };

    // Zoom suave: cada cambio de quien habla empieza un acercamiento de 0,9 s hacia esa persona.
    const cambios: { t0: number; lado: Lado }[] = [];
    cortes.forEach((c, i) => {
      if (i === 0 || c.lado !== cortes[i - 1].lado) cambios.push({ t0: c.out, lado: c.lado as Lado });
    });
    const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    let fx = CENTRO[cambios[0].lado];
    let z = 1.0;
    for (const [k, cb] of cambios.entries()) {
      if (t < cb.t0 - 0.2) break;
      const fin = k + 1 < cambios.length ? Math.min(t, cambios[k + 1].t0 - 0.2) : t;
      const p = suave((fin - (cb.t0 - 0.2)) / 0.9);
      fx = lerp(fx, CENTRO[cb.lado], p);
      z = lerp(z, k % 2 ? 1.1 : 1.07, p);
    }

    const t2 = tras(C.titulo.en2);
    const cats: number[] = [];
    let cursor = 0;
    for (const it of C.items) cats.push((cursor = tras(it.en, cursor)));
    let cierre = cursor;
    for (const p of C.finItems) cierre = tras(p, cierre + 0.01);
    const cta = tras(C.cta.en, cierre);
    const subs = bloques(palabras);
    const itemActual = cats.reduce((acc, c, i) => (t >= c - 0.1 ? i : acc), -1);

    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ transformOrigin: `${fx}px ${Y_CARAS}px`, scale: String(z) }}>
          <Mitad video={C.video} tramos={tramos("der")} lado="der" />
          <Mitad video={C.video} tramos={tramos("izq")} lado="izq" />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.4) 100%)" }} />

        {/* Título (el hook). */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - prog(t, cta - 0.2, cta + 0.1) }}>
          <Pop t={t} t0={0} desde={1.08}>
            <TextoSombra texto={C.titulo.linea1} tam={64} peso={900} color="#fff" />
          </Pop>
          <div style={{ height: 80 }}>
            <Pop t={t} t0={t2 - 0.05}>
              <TextoSombra texto={C.titulo.linea2} tam={60} peso={900} color={C.titulo.color2 ?? AMARILLO} />
            </Pop>
          </div>
        </div>

        {/* Etiqueta de cada lado. */}
        {(["izq", "der"] as Lado[]).map((lado) => {
          const e = C.etiquetas[lado];
          const t0 = e.en ? tras(e.en) : 0.2;
          const k = easeOut(prog(t, t0, t0 + 0.35));
          const activo = hablando(t) === lado;
          return (
            <div key={lado} style={{ position: "absolute", left: CENTRO[lado] - 200, width: 400, top: 392, display: "flex", justifyContent: "center", opacity: k * (1 - prog(t, cierre - 0.2, cierre + 0.1)), translate: `0 ${(1 - k) * -20}px` }}>
              <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 34, letterSpacing: "0.04em", color: "#fff", background: e.color, borderRadius: 999, padding: "8px 22px", boxShadow: activo ? `0 0 0 4px ${AMARILLO}, 0 10px 24px rgba(0,0,0,0.4)` : "0 10px 24px rgba(0,0,0,0.4)", scale: String(activo ? 1.06 : 1) }}>{e.texto}</div>
            </div>
          );
        })}

        {/* Categoría y tarjetas. */}
        {itemActual >= 0 && t < cierre ? (
          <>
            <div key={`cat${itemActual}`} style={{ position: "absolute", left: 0, right: 0, top: 318, display: "flex", justifyContent: "center", opacity: 1 - prog(t, cierre - 0.2, cierre) }}>
              <Pop t={t} t0={cats[itemActual] - 0.1}>
                <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 40, color: "#151515", background: AMARILLO, borderRadius: 16, padding: "4px 20px", letterSpacing: "0.03em" }}>{C.items[itemActual].cat}</div>
              </Pop>
            </div>
            <div key={`it${itemActual}`} style={{ opacity: 1 - prog(t, cierre - 0.2, cierre) }}>
              {(["izq", "der"] as Lado[]).map((lado) => {
                const it = C.items[itemActual];
                const tj = it[lado];
                if (!tj) return null;
                const c0 = cats[itemActual];
                const sig = itemActual + 1 < cats.length ? cats[itemActual + 1] : cierre;
                const t0 = quizas(tj.en, c0 - 0.5, sig, c0 + 0.6);
                const extras = (tj.extras ?? []).map(([p, texto]) => ({ t0: quizas(p, t0, sig, sig + 99), texto }));
                if (t < t0 - 0.05) return null;
                return (
                  <div key={lado} style={{ position: "absolute", left: Math.max(20, CENTRO[lado] - 220), top: 470 }}>
                    <Eleccion t={t} t0={t0 - 0.05} color={C.etiquetas[lado].color} texto={tj.texto} extras={extras} />
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Píldoras del cierre. */}
        {(C.pildoras ?? []).map((p, i) => {
          const t0 = quizas(p.en, cierre - 0.5, cta, -1);
          if (t0 < 0 || t < t0 - 0.05 || t > cta - 0.1) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: p.y ?? 440 + i * 120, display: "flex", justifyContent: "center", opacity: 1 - prog(t, cta - 0.25, cta - 0.1) }}>
              <Pildora t={t} t0={t0 - 0.05} icono={<Signo ok={p.ok} />} texto={p.texto} />
            </div>
          );
        })}

        <Comentario t={t} desde={tras(C.cta.escribe, cta) - 0.9} escribe={tras(C.cta.escribe, cta)} palabra={C.cta.palabra} y={460} />

        <Subtitulo t={t} lista={subs} y={1500} amarillas={C.amarillas} />

        <Destello t={t} t0={cta - 0.3} />
        <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
        {audio ? <Audio src={staticFile(audio)} /> : null}
      </AbsoluteFill>
    );
  };
  return Reel;
};
