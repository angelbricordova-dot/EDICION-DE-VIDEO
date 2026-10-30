import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../comun/animacion";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, easeOut, INTER, lerp, Palabra, Persona, Pop, prog, sp, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, Grande, limpio, Pildora } from "./comunes";
import { Edificio } from "./iconos";
import hook1 from "./g10-hook1.json";
import hook2 from "./g10-hook2.json";
import cuerpo from "./g10-cuerpo.json";

// Reel 10 "lo que deberías tener a cada edad" (guion 10, pizarra, bruto vertical 4K). La pizarra
// está quieta a la izquierda y él a la derecha: cada edad se marca en la pizarra con un círculo
// de rotulador rojo (pegado al video, sigue el zoom) y arriba, sobre la pared, un panel con la
// edad y las casas que "deberías" tener. Luego píldoras de una en una, la X roja sobre la meta
// equivocada, la ficha de José Manuel y el CTA con la caja de comentario (GUÍA).

type CorteReel = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G10: Record<"hook1" | "hook2" | "cuerpo", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel, cuerpo: cuerpo as CorteReel };

export type PropsReel10 = { audio: string | null; version: keyof typeof G10 };

// Copia de trabajo 1440 × 2560. El foco del zoom va cerca de él (que está al borde derecho) para
// que al acercar no se salga del cuadro; con zoom 1 se ve el cuadro entero.
const BASE = 1920 / 2560;
const FOCO = { x: 1200, y: 1350 };
const DESTINO = { x: FOCO.x * BASE, y: FOCO.y * BASE };
const ROJO = "#E3141F";

// Valores escritos en la pizarra (coordenadas de la copia de trabajo): centro y ancho.
const VALORES = [
  { x: 880, y: 1212, w: 90 }, // 1
  { x: 876, y: 1288, w: 80 }, // 3
  { x: 893, y: 1392, w: 190 }, // Edificio
  { x: 890, y: 1505, w: 210 }, // 15 + SL
  { x: 885, y: 1612, w: 180 }, // Barrio
];

/** Casa dibujada (tejado rojo, puerta y ventana). */
const Casa: React.FC<{ tam?: number; color?: string }> = ({ tam = 70, color = "#fff" }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d="M4 11 V21 H20 V11" fill={color} stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
    <path d="M2 12 L12 3 L22 12" fill="none" stroke={ROJO} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={10} y={15} width={4} height={6} fill="#8A5A2B" />
    <rect x={6} y={13} width={3} height={3} fill="#7EC8F5" stroke="#111" strokeWidth={0.6} />
    <rect x={15} y={13} width={3} height={3} fill="#7EC8F5" stroke="#111" strokeWidth={0.6} />
  </svg>
);

const Movil: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <rect x={6} y={2} width={12} height={20} rx={2.5} fill="#1d1d1f" />
    <rect x={7.3} y={4} width={9.4} height={15} rx={1} fill="#D62976" />
    <path d="M12 15.5 C9 13.5 8.6 11.6 10 10.6 C11 9.9 11.8 10.4 12 11 C12.2 10.4 13 9.9 14 10.6 C15.4 11.6 15 13.5 12 15.5 Z" fill="#fff" />
  </svg>
);
const Reloj: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={10} fill="#fff" stroke="#111" strokeWidth={1.6} />
    <path d="M12 6 V12 L16 14" fill="none" stroke={ROJO} strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const Cartera: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <rect x={2.5} y={6} width={19} height={14} rx={2.5} fill="#8A5A2B" stroke="#111" strokeWidth={1.2} />
    <rect x={14} y={10.5} width={7.5} height={5} rx={1.5} fill="#C98A4B" stroke="#111" strokeWidth={1} />
    <circle cx={16.5} cy={13} r={1} fill="#111" />
  </svg>
);
const Euro: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={10} fill="#F2C230" stroke="#8A6500" strokeWidth={1.4} />
    <path d="M15.5 8.2 A4.6 4.6 0 1 0 15.5 15.8 M6.5 10.8 H12.5 M6.5 13.2 H12" fill="none" stroke="#5A4000" strokeWidth={1.7} strokeLinecap="round" />
  </svg>
);
const Video: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <rect x={2} y={5} width={20} height={14} rx={3} fill={ROJO} />
    <path d="M10 9 L15.5 12 L10 15 Z" fill="#fff" />
  </svg>
);
const Check: React.FC<{ ok: boolean }> = ({ ok }) => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={ok ? "#22B53A" : ROJO} />
    {ok ? <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);

/** Círculo de rotulador que se dibuja (dos vueltas un poco torcidas, como a mano). */
const Circulo: React.FC<{ w: number; h: number; k: number }> = ({ w, h, k }) => {
  const rx = w / 2 + 18;
  const ry = h / 2 + 14;
  // Elipse con un pequeño solape al final, como cuando se rodea algo con rotulador.
  const pasos = 64;
  const puntos = Array.from({ length: pasos + 1 }, (_, i) => {
    const a = -2.3 + (i / pasos) * Math.PI * 2.25;
    const r = 1 + 0.05 * Math.sin(i * 0.7);
    return `${rx + 10 + Math.cos(a) * rx * r},${ry + 10 + Math.sin(a) * ry * r}`;
  });
  const largo = Math.PI * (rx + ry) * 1.15;
  return (
    <svg width={rx * 2 + 20} height={ry * 2 + 20} style={{ position: "absolute", translate: "-50% -50%", overflow: "visible" }}>
      <polyline points={puntos.join(" ")} fill="none" stroke={ROJO} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - k)} opacity={0.92} />
    </svg>
  );
};

export const Reel10: React.FC<PropsReel10> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G10[version];

  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  // Las cinco edades: cuándo empieza la frase ("Con 25") y cuándo dice lo que "deberías" tener.
  const e25 = tras("Con");
  const e30 = tras("Con", e25 + 0.5);
  const e35 = tras("Con", e30 + 0.5);
  const e40 = tras("Con", e35 + 0.5);
  const e50 = tras("Y", tras("nombre.", e40));
  const edades = [
    { edad: 25, t0: e25, valor: tras("primer", e25), fin: e30 },
    { edad: 30, t0: e30, valor: tras("3.", e30), fin: e35 },
    { edad: 35, t0: e35, valor: tras("edificio", e35), fin: e40 },
    { edad: 40, t0: e40, valor: tras("15", e40), fin: e50 },
    { edad: 50, t0: e50, valor: tras("barrio", e50), fin: 1e9 },
  ];
  const broma = tras("broma,", e50);
  const pero = tras("Pero,", broma);
  const meta = tras("meta", pero);
  const yoNo = tras("Yo", meta);
  const unPiso = tras("Un", yoNo);
  const jose = tras("José", unPiso);
  const cifra = tras("1.950", jose);
  const yEsQue = tras("Y", cifra);
  const asi = tras("Así", yEsQue);
  const finEdades = pero - 0.1;

  const pildoras: { desde: number; icono: React.ReactNode; texto: string; flecha?: boolean }[] = [
    { desde: tras("redes,", pero), icono: <Movil />, texto: "Lo que te venden en redes" },
    { desde: tras("9", pero), icono: <Reloj />, texto: "Trabajas de 9 a 5" },
    { desde: tras("final", pero), icono: <Cartera />, texto: "Justo a final de mes" },
    { desde: tras("tarde", pero), icono: <Check ok={false} />, texto: "Vas tarde a todo" },
    { desde: tras("tranquilo.", pero), icono: <Check ok />, texto: "No vas tarde" },
    { desde: tras("15", yoNo), icono: <Check ok={false} />, texto: "Conseguir 15 pisos" },
    { desde: tras("trabajar", yoNo), icono: <Euro />, texto: "Tu dinero, trabajando" },
    { desde: unPiso, icono: <Casa tam={60} />, texto: "Un piso bien comprado" },
    { desde: tras("dinero", unPiso), icono: <Euro />, texto: "Un extra cada mes" },
    { desde: tras("patrimonio", unPiso), icono: <Edificio tam={60} />, texto: "Patrimonio poco a poco", flecha: true },
    { desde: tras("no", yEsQue), icono: <Check ok={false} />, texto: "El que más pisos acumula" },
    { desde: tras("clase", asi), icono: <Video />, texto: "Clase privada de 45 min" },
  ];
  // Cada píldora dura hasta la siguiente o hasta que entra otro elemento grande.
  const grandes = [meta - 0.05, jose - 0.1, tras("gana", tras("acumula,", yEsQue)) - 0.05, tras("si", tras("clase", asi)) - 0.1];
  const finPildora = (i: number) => {
    const d = pildoras[i].desde;
    const sig = [...pildoras.map((p) => p.desde), ...grandes].filter((x) => x > d + 0.05);
    return Math.min(d + 3.2, ...sig);
  };

  // Zoom progresivo y suave como en los reels 8 y 9, pero corto: la pizarra siempre se ve.
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number, number][] = [
    [edades[3].valor, 1.12],
    [edades[4].valor, 1.14],
    [broma, 1.16],
    [meta, 1.0],
    [cifra, 1.15],
    [tras("primero", yEsQue), 1.12],
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
      const fin = k + 1 < tramos.length ? Math.min(tt, tramos[k + 1][0]) : tt;
      v = lerp(v, z, suave((fin - t0) / DUR));
      desde = t0;
    }
    return v * (1 + Math.min(0.03, (tt - desde) * 0.008));
  };
  const z = zoom(t);
  // De la copia de trabajo a la pantalla (lo mismo que hace Persona con el video).
  const aPantalla = (x: number, y: number) => ({ x: DESTINO.x + (x - FOCO.x) * BASE * z, y: DESTINO.y + (y - FOCO.y) * BASE * z });

  const subs = bloques(palabras);
  const titulo =
    version === "hook1"
      ? { blanco: "¿Cuántos pisos deberías tener", amarillo: "SEGÚN TU EDAD?", t0: tras("según") }
      : version === "hook2"
        ? { blanco: "Si no tienes estos pisos", amarillo: "VAS TARDE", t0: tras("vas") }
        : { blanco: "Lo que deberías tener", amarillo: "A CADA EDAD", t0: 0.1 };
  const finTitulo = pero;

  // Panel de edades (arriba a la izquierda, sobre la pared; la cara queda a la derecha).
  const actual = [...edades].reverse().find((e) => t >= e.t0 - 0.05);
  const panelK = sp(t, e25 - 0.1, { damping: 14, stiffness: 200, mass: 0.7 });
  const panelSale = prog(t, finEdades - 0.2, finEdades + 0.1);

  const casas = (n: number, tam: number, por: number, t0: number, paso: number) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${por}, ${tam}px)`, gap: 6 }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ width: tam, height: tam }}>
          <Pop t={t} t0={t0 + i * paso} desde={0.2}>
            <Casa tam={tam} />
          </Pop>
        </div>
      ))}
    </div>
  );

  const contenido = (e: (typeof edades)[number]) => {
    if (e.edad === 25) return casas(1, 120, 1, e.valor, 0);
    if (e.edad === 30) return casas(3, 104, 3, e.valor - 0.1, 0.09);
    if (e.edad === 35)
      return (
        <Pop t={t} t0={e.valor - 0.05} desde={0.3}>
          <Edificio tam={150} />
        </Pop>
      );
    if (e.edad === 40)
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {casas(15, 46, 5, e.valor - 0.05, 0.035)}
          <Pop t={t} t0={tras("SL", e.t0) - 0.05} desde={0.4}>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, color: "#151515", background: AMARILLO, borderRadius: 16, padding: "4px 14px", boxShadow: "0 6px 14px rgba(0,0,0,0.4)" }}>SL</div>
          </Pop>
        </div>
      );
    return casas(24, 36, 8, e.valor - 0.1, 0.02);
  };

  // Ficha de José Manuel: aparece con su nombre; la cifra cuenta hasta 1.950 €.
  const finJose = tras("Y", cifra) - 0.1;
  const cuenta = Math.round(1950 * easeOut(prog(t, cifra - 0.05, cifra + 0.9)));

  // X roja sobre la lista de la pizarra en "la meta equivocada".
  const x1 = aPantalla(470, 1150);
  const x2 = aPantalla(1010, 1680);
  const kx1 = easeOut(prog(t, meta + 0.05, meta + 0.3));
  const kx2 = easeOut(prog(t, meta + 0.3, meta + 0.55));
  const finX = yoNo - 0.1;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="inmobiliaria/g10/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={FOCO} destino={DESTINO} altoBruto={2560} anchoBruto={1440} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 28%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3) 100%)" }} />

      {/* Círculos de rotulador sobre lo escrito en la pizarra, cuando lo dice. */}
      {edades.map((e, i) => {
        if (t < e.valor - 0.05 || t > finEdades + 0.2) return null;
        const v = VALORES[i];
        const p = aPantalla(v.x, v.y);
        const k = easeOut(prog(t, e.valor - 0.05, e.valor + 0.35));
        return (
          <div key={e.edad} style={{ position: "absolute", left: p.x, top: p.y, scale: String(z), opacity: 1 - prog(t, finEdades - 0.1, finEdades + 0.2) }}>
            <Circulo w={v.w * BASE} h={60 * BASE} k={k} />
          </div>
        );
      })}

      {/* La meta equivocada: X roja sobre toda la lista. */}
      {t >= meta && t < finX + 0.2 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - prog(t, finX, finX + 0.2) }}>
          <line x1={x1.x} y1={x1.y} x2={lerp(x1.x, x2.x, kx1)} y2={lerp(x1.y, x2.y, kx1)} stroke={ROJO} strokeWidth={22} strokeLinecap="round" />
          {kx2 > 0 ? <line x1={x2.x} y1={x1.y} x2={lerp(x2.x, x1.x, kx2)} y2={lerp(x1.y, x2.y, kx2)} stroke={ROJO} strokeWidth={22} strokeLinecap="round" /> : null}
        </svg>
      ) : null}

      {/* Título fijo (el hook) hasta que acaba la parte de las edades. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 1 - prog(t, finTitulo - 0.2, finTitulo + 0.1) }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto={titulo.blanco} tam={titulo.blanco.length > 24 ? 52 : 58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={titulo.t0 - 0.02}>
            <TextoSombra texto={titulo.amarillo} tam={90} peso={900} color={AMARILLO} />
          </Pop>
        </div>
      </div>

      {/* Panel de edades. */}
      {actual && t < finEdades + 0.1 ? (
        <div style={{ position: "absolute", left: 40, top: 380, width: 640, height: 260, translate: `${(1 - panelK) * -120}px 0`, opacity: clamp01(panelK * 2) * (1 - panelSale) }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(16,18,22,0.72)", border: "2px solid rgba(255,255,255,0.16)", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }} />
          <div key={actual.edad} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 26px", gap: 26, opacity: 1 - 0.75 * prog(t, broma - 0.05, broma + 0.1) }}>
            <Pop t={t} t0={actual.t0 - 0.05} desde={0.6}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 150 }}>
                <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 112, lineHeight: 1, color: AMARILLO, letterSpacing: "-0.04em" }}>{actual.edad}</span>
                <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, color: "#fff" }}>años</span>
              </div>
            </Pop>
            <div style={{ width: 3, height: 180, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>{contenido(actual)}</div>
          </div>
          {/* "Es broma": sello recto encima del panel. */}
          {t >= broma - 0.05 ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pop t={t} t0={broma - 0.05} desde={1.6}>
                <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 84, color: "#fff", background: ROJO, borderRadius: 22, padding: "8px 34px", border: "5px solid #fff", boxShadow: "0 14px 30px rgba(0,0,0,0.5)", letterSpacing: "-0.02em" }}>ES BROMA</div>
              </Pop>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Píldoras: una a la vez, arriba a la izquierda (la cara queda libre). */}
      {pildoras.map((p, i) => {
        const fin = finPildora(i);
        if (t < p.desde - 0.05 || t > fin) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 30, width: 700, top: 440, display: "flex", justifyContent: "center", opacity: 1 - prog(t, fin - 0.15, fin) }}>
            <Pildora t={t} t0={p.desde - 0.05} icono={p.icono} texto={p.texto} flecha={p.flecha ? { k: easeOut(prog(t, p.desde + 0.2, p.desde + 0.5)), sube: true } : undefined} />
          </div>
        );
      })}

      <Grande t={t} desde={meta - 0.05} hasta={yoNo - 0.1} texto="META EQUIVOCADA" color="rojo" tam={92} y={410} />
      <Grande t={t} desde={tras("gana", tras("acumula,", yEsQue)) - 0.05} hasta={asi - 0.1} texto="COMPRA BIEN EL 1.º" color="verde" tam={86} y={410} />

      {/* José Manuel: alumno, 50 años, un piso → 1.950 €/mes. */}
      {t >= jose - 0.1 && t < finJose + 0.2 ? (
        <div style={{ position: "absolute", left: 40, width: 640, top: 360, opacity: 1 - prog(t, finJose, finJose + 0.2) }}>
          <Pop t={t} t0={jose - 0.1} desde={0.6}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 26px", borderRadius: 34, background: "rgba(255,255,255,0.97)", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 92, height: 92, borderRadius: "50%", background: "linear-gradient(135deg, #2F9E6E, #1F5A36)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 40, color: "#fff" }}>JM</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 48, color: "#151515" }}>José Manuel</span>
                  <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: "#555" }}>
                    {t >= tras("50", jose) - 0.05 ? "Alumno · 50 años" : "Alumno"}
                    {t >= tras("piso", jose) - 0.05 ? " · 1 piso" : ""}
                  </span>
                </div>
              </div>
              {t >= cifra - 0.05 ? (
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, borderRadius: 22, background: "#E8F8EC", padding: "8px 0" }}>
                  <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 92, color: "#1E9E45", letterSpacing: "-0.03em" }}>+{cuenta >= 1000 ? `${Math.floor(cuenta / 1000)}.${String(cuenta % 1000).padStart(3, "0")}` : cuenta} €</span>
                  <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: "#1E9E45" }}>/mes</span>
                </div>
              ) : null}
            </div>
          </Pop>
        </div>
      ) : null}

      {/* Cierre: comenta GUÍA. */}
      <Comentario t={t} desde={tras("si", tras("clase", asi)) - 0.1} escribe={tras("guía.", asi) - 0.1} palabra="GUÍA" y={440} />

      <Subtitulo t={t} lista={subs} y={1420} amarillas={["pisos", "edificio", "barrio", "broma", "redes", "tarde", "equivocada", "trabajar", "patrimonio", "1950", "primero", "guía", "sl"]} />

      <Destello t={t} t0={asi - 0.3} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.45, duracion + 0.1) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
