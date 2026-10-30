import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, INTER, Palabra, Persona, Pop, prog, Subtitulo, lerp } from "./piezas";
import { Comentario, Grande, limpio, Pildora } from "./comunes";
import { Documento } from "./iconos";
import llamada from "./g9-llamada.json";
import intro from "./g9-intro.json";

// Reel 9 "llamada de la agencia" (guion 9, cámara lateral, bruto vertical 4K). Julio habla por
// teléfono con la agencia (voz de Darío con efecto de teléfono, como pidió el cliente) y luego
// cierra a cámara. Cápsula de llamada arriba, subtítulos de la agencia en azul, pitidos (***)
// en la calle, el barrio y el nombre. Versión "intro": las 3 mejores frases en blanco y negro
// con "EN LA LLAMADA…" antes de la llamada completa.

type PalabraQ = Palabra & { quien?: string; intro?: boolean };
type Corte9 = Corte & { quien?: string; intro?: boolean };
type CorteReel = { duracion: number; cortes: Corte9[]; palabras: PalabraQ[] };
export const G9: Record<"llamada" | "intro", CorteReel> = { llamada: llamada as CorteReel, intro: intro as CorteReel };

export type PropsReel9 = { audio: string | null; version: keyof typeof G9 };

const CARA = { x: 893, y: 1296 };
const DESTINO = { x: 670, y: 972 };
const AZUL = "#9EDCFF";
const ARRIBA = 450; // fila de píldoras y textos grandes, encima de la cabeza

/** Subtítulos por tramos de un mismo hablante (la agencia en azul). */
const tramosSub = (palabras: PalabraQ[]) => {
  // Los pitidos seguidos ("La Huerta") se muestran como un solo "***".
  const ps: PalabraQ[] = [];
  for (const w of palabras) {
    if (w.p.startsWith("***") && ps.length && ps[ps.length - 1].p.startsWith("***")) {
      ps[ps.length - 1] = { ...ps[ps.length - 1], p: w.p, fin: w.fin };
      continue;
    }
    ps.push(w);
  }
  const grupos: { quien: string; ws: PalabraQ[] }[] = [];
  for (const w of ps) {
    const q = w.quien ?? "julio";
    if (!grupos.length || grupos[grupos.length - 1].quien !== q) grupos.push({ quien: q, ws: [] });
    grupos[grupos.length - 1].ws.push(w);
  }
  return grupos.map((g) => ({ quien: g.quien, lista: bloques(g.ws) }));
};

/** Cápsula de llamada en curso (arriba): tiempo, nombre y onda cuando habla la agencia. */
const Capsula: React.FC<{ t: number; desde: number; hasta: number; habla: boolean }> = ({ t, desde, hasta, habla }) => {
  if (t < desde - 0.3 || t > hasta + 1.6) return null;
  const k = prog(t, desde - 0.3, desde);
  const colgada = t >= hasta;
  const sale = prog(t, hasta + 1.1, hasta + 1.6);
  const seg = Math.max(0, Math.floor(Math.min(t, hasta) - desde));
  const reloj = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center", opacity: 1 - sale, translate: `0 ${(1 - k) * -80 - sale * 60}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 132, padding: "0 30px 0 18px", borderRadius: 66, background: colgada ? "rgba(140,16,22,0.92)" : "rgba(18,20,24,0.88)", border: "2px solid rgba(255,255,255,0.14)", boxShadow: "0 18px 44px rgba(0,0,0,0.45)", minWidth: 700 }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: colgada ? "#E3141F" : "linear-gradient(135deg, #4F8DF7, #1F4FB8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={54} height={54} viewBox="0 0 24 24" style={{ rotate: colgada ? "135deg" : "0deg" }}>
            <path d="M6.6 10.8 a15 15 0 0 0 6.6 6.6 l2.2-2.2 a1 1 0 0 1 1-.25 a11.4 11.4 0 0 0 3.6.57 a1 1 0 0 1 1 1 V20 a1 1 0 0 1-1 1 A17 17 0 0 1 3 4 a1 1 0 0 1 1-1 h3.5 a1 1 0 0 1 1 1 c0 1.25.2 2.45.57 3.57 a1 1 0 0 1-.25 1 Z" fill="#fff" />
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 42, color: "#fff", whiteSpace: "nowrap" }}>Agencia inmobiliaria</span>
          <span style={{ fontFamily: INTER, fontWeight: 600, fontSize: 32, color: colgada ? "#FFB3B3" : "#7CE38B" }}>{colgada ? "Llamada finalizada" : `En llamada · ${reloj}`}</span>
        </div>
        {/* Onda: se mueve cuando habla la agencia. */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, height: 70 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = habla && !colgada ? 0.35 + 0.65 * Math.abs(Math.sin(t * (9 + i * 1.7) + i * 1.3)) : 0.18;
            return <div key={i} style={{ width: 9, height: 70 * a, borderRadius: 5, background: AZUL }} />;
          })}
        </div>
      </div>
    </div>
  );
};

const Icono: React.FC<{ tipo: "ok" | "no" | "reloj" | "euro" | "llave" | "manos" | "lista" }> = ({ tipo }) => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    {tipo === "ok" || tipo === "no" ? (
      <>
        <circle cx={12} cy={12} r={11} fill={tipo === "ok" ? "#22B53A" : "#E3141F"} />
        {tipo === "ok" ? <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
      </>
    ) : tipo === "reloj" ? (
      <>
        <circle cx={12} cy={12} r={10} fill="#fff" stroke="#E3141F" strokeWidth={2.5} />
        <path d="M12 6.5 V12 L15.5 14" stroke="#111" strokeWidth={2.2} strokeLinecap="round" />
      </>
    ) : tipo === "euro" ? (
      <>
        <circle cx={12} cy={12} r={11} fill="#FFC21A" stroke="#B57800" strokeWidth={1.5} />
        <text x={12} y={17} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={14} fill="#5A3A00">€</text>
      </>
    ) : tipo === "llave" ? (
      <>
        <circle cx={8} cy={12} r={5} fill="none" stroke="#C88A00" strokeWidth={3} />
        <path d="M12.5 12 H22 M18 12 V16 M21 12 V15" stroke="#C88A00" strokeWidth={3} strokeLinecap="round" />
      </>
    ) : tipo === "manos" ? (
      <>
        <path d="M2 12 L7 7 L11 9 L14 7 L22 12 L17 17 L13 15 L10 17 Z" fill="#F2C58E" stroke="#8A5A2B" strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M9 12 L12 14 M11 10.5 L14.5 13" stroke="#8A5A2B" strokeWidth={1.3} strokeLinecap="round" />
      </>
    ) : (
      <>
        <rect x={4} y={3} width={16} height={18} rx={2} fill="#fff" stroke="#2A3340" strokeWidth={2} />
        <path d="M8 8 H16 M8 12 H16 M8 16 H13" stroke="#9AA6B5" strokeWidth={2} strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const Reel9: React.FC<PropsReel9> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G9[version];

  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  // Intro (solo en esa versión) y llamada.
  const cortesIntro = cortes.filter((c) => c.intro);
  const finIntro = cortesIntro.length ? cortesIntro[cortesIntro.length - 1].out + cortesIntro[cortesIntro.length - 1].dur : 0;
  const ws = palabras.filter((w) => w.ini >= finIntro - 0.01);
  const llamaDesde = ws[0].ini - 0.4;
  const buenos = tras("Buenos", finIntro);
  const abrazo = tras("abrazo", buenos);
  const colgar = abrazo + 0.7;
  const veis = tras("¿veis?", abrazo);
  const habla = cortes.some((c) => c.quien === "agencia" && !c.intro && t >= c.out && t < c.out + c.dur);

  const M = {
    publicado: tras("publicado.", buenos),
    rapido: tras("rápido", buenos),
    mejor: tras("mejor", buenos),
    motivo: tras("motivo", buenos),
    herencia: tras("herencia", buenos),
    privado: tras("privado", buenos),
    n98: tras("98", buenos),
    alquilar: tras("alquilar,", buenos),
    n550: tras("550", buenos),
    n500: tras("500", buenos),
    nota: tras("nota", buenos),
    visita: tras("visita", buenos),
    h24: tras("24", buenos),
    interesa: tras("interesa", veis),
    seis: tras("6", veis),
    neto: tras("neto.", veis),
    fijaos: tras("fijaos", veis),
    portal: tras("portal.", veis),
    exclusiva: tras("exclusiva", veis),
    oportunidad: tras("oportunidad.", tras("exclusiva", veis)),
    descartar: tras("descartar", veis),
    tiempo: tras("tiempo.", veis),
    relaciones: tras("relaciones", tras("tiempo.", veis)),
    nadie: tras("nadie.", tras("tiempo.", veis)),
    tengo: tras("Tengo", veis),
    palabra: tras("palabra", tras("Tengo", veis)),
    guia: tras("guía.", tras("Tengo", veis)),
  };

  // Píldoras (una a la vez, encima de la cabeza).
  const pildoras: { desde: number; hasta: number; icono: React.ReactNode; texto: string }[] = [
    { desde: M.publicado - 0.05, hasta: M.rapido + 0.8, icono: <Icono tipo="llave" />, texto: "Aún no está publicado" },
    { desde: M.mejor - 0.05, hasta: M.mejor + 2.0, icono: <Icono tipo="no" />, texto: "No es la mejor zona" },
    { desde: M.motivo - 0.05, hasta: M.herencia - 0.1, icono: <Icono tipo="lista" />, texto: "¿Motivo de venta?" },
    { desde: M.herencia - 0.05, hasta: M.privado + 0.9, icono: <Icono tipo="lista" />, texto: "Herencia · venta en privado" },
    { desde: M.alquilar - 0.05, hasta: M.n550 - 0.15, icono: <Icono tipo="euro" />, texto: "¿Alquiler real?" },
    { desde: M.n500 - 0.05, hasta: M.n500 + 1.6, icono: <Icono tipo="euro" />, texto: "500 – 600 € al mes" },
    { desde: M.h24 - 0.05, hasta: M.h24 + 2.2, icono: <Icono tipo="reloj" />, texto: "Respuesta en 24 horas" },
    { desde: M.interesa - 0.05, hasta: M.seis - 0.1, icono: <Icono tipo="no" />, texto: "No me interesa" },
    { desde: M.portal - 0.05, hasta: M.exclusiva - 0.1, icono: <Icono tipo="ok" />, texto: "Fuera de portales" },
    { desde: M.exclusiva - 0.05, hasta: M.oportunidad + 0.9, icono: <Icono tipo="no" />, texto: "Exclusiva ≠ buena oportunidad" },
    { desde: M.relaciones - 0.05, hasta: M.nadie + 0.7, icono: <Icono tipo="manos" />, texto: "Relaciones con inmobiliarias" },
  ];
  const grandes: { desde: number; hasta: number; texto: string; color: "verde" | "rojo"; tam: number }[] = [
    { desde: M.n98, hasta: M.n98 + 1.6, texto: "98.000 €", color: "verde", tam: 120 },
    { desde: M.n550, hasta: M.n550 + 1.5, texto: "550 €", color: "verde", tam: 130 },
    { desde: M.seis, hasta: M.neto + 0.9, texto: "< 6 % neto", color: "rojo", tam: 120 },
    { desde: M.descartar, hasta: M.tiempo + 0.6, texto: "descartar rápido", color: "verde", tam: 96 },
  ];

  // Zooms progresivos y suaves (lo pidió Angel en el reel 9): cada frase empieza un acercamiento
  // lento de ~0,9 s con ease-in-out que parte de donde iba el anterior (sin saltos), y dentro de
  // la frase la cámara sigue avanzando muy poco a poco.
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number, number][] = [
    [M.n98, 1.12],
    [M.h24, 1.12],
    [M.interesa, 1.12],
    [M.seis, 1.14],
    [M.exclusiva, 1.12],
    [M.descartar, 1.14],
  ];
  const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.3, i % 2 ? 1.06 : 1.0]);
  for (const [g, z] of golpes) tramos.push([g - 0.45, z]);
  tramos.sort((a, b) => a[0] - b[0]);
  const DUR = 0.9;
  const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const zoom = (tt: number) => {
    let v = 1;
    let desde = 0;
    for (let k = 0; k < tramos.length; k++) {
      const [t0, z] = tramos[k];
      if (tt < t0) break;
      // Valor en el instante t0 (donde iba la cámara) → hacia el nuevo objetivo.
      const inicio = v;
      const fin = k + 1 < tramos.length ? Math.min(tt, tramos[k + 1][0]) : tt;
      v = lerp(inicio, z, suave((fin - t0) / DUR));
      desde = t0;
    }
    // Avance lento dentro de la frase (máx. +3 %).
    return v * (1 + Math.min(0.03, (tt - desde) * 0.008));
  };

  const subs = tramosSub(palabras);
  const enIntro = t < finIntro;
  const letrasIntro = "EN LA LLAMADA…";
  const nLetras = Math.floor(clamp01((t - 0.2) / 1.1) * letrasIntro.length);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: enIntro ? "grayscale(1) contrast(1.15) brightness(0.92)" : undefined }}>
        <Persona t={t} video="inmobiliaria/g9/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} destino={DESTINO} altoBruto={2560} anchoBruto={1440} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.35) 100%)" }} />

      {/* Intro en blanco y negro: viñeta, grano y "EN LA LLAMADA…" a máquina. */}
      {enIntro ? (
        <>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)" }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.18, mixBlendMode: "overlay" }}>
            <filter id="grano">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(t * FPS) % 50} />
            </filter>
            <rect width={1080} height={1920} filter="url(#grano)" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
            <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 92, letterSpacing: "0.04em", color: "#fff", textShadow: "0 0 18px rgba(0,0,0,0.9)" }}>
              {letrasIntro.slice(0, nLetras)}
              <span style={{ opacity: Math.floor(t * 3) % 2 ? 0 : 1, color: AMARILLO }}>|</span>
            </span>
          </div>
        </>
      ) : null}

      <Capsula t={t} desde={llamaDesde} hasta={colgar} habla={habla} />

      {/* Nota simple: la hoja junto a la cabeza mientras hablan de ella. */}
      {t >= M.nota - 0.05 && t < M.visita + 0.6 ? (
        <div style={{ position: "absolute", left: 60, top: 520 }}>
          <Pop t={t} t0={M.nota - 0.05} desde={0.4}>
            <Documento tam={210} titulo="NOTA SIMPLE" />
          </Pop>
        </div>
      ) : null}

      {pildoras.map((p, i) =>
        t >= p.desde && t < p.hasta + 0.2 ? (
          <div key={i} style={{ position: "absolute", left: 30, right: 30, top: ARRIBA, display: "flex", justifyContent: "center", opacity: 1 - prog(t, p.hasta, p.hasta + 0.2) }}>
            <Pildora t={t} t0={p.desde} icono={p.icono} texto={p.texto} />
          </div>
        ) : null,
      )}
      {grandes.map((g, i) => (
        <Grande key={i} t={t} desde={g.desde} hasta={g.hasta} texto={g.texto} color={g.color} tam={g.tam} y={ARRIBA - 10} />
      ))}

      {/* Cierre: comenta GUÍA. */}
      <Comentario t={t} desde={M.palabra - 0.4} escribe={M.guia} palabra="GUÍA" y={ARRIBA} />

      {subs.map((g, i) => (
        <Subtitulo key={i} t={t} lista={g.lista} y={1420} color={g.quien === "agencia" ? AZUL : "#fff"} amarillas={["98.000", "550", "500", "600", "24", "6", "%", "guía.", "portal.", "exclusiva"]} />
      ))}

      {/* Paso de la intro a la llamada y del final de la llamada al cierre. */}
      {finIntro > 0 ? <Destello t={t} t0={finIntro - 0.25} /> : null}
      <Destello t={t} t0={veis - 0.3} />

      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
