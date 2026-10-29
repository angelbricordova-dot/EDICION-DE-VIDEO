import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, easeInOut, easeOut, INTER, lerp, Palabra, Persona, Pop, prog, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, Grande, limpio, Lista, Pildora } from "./comunes";
import { Banco, Calendario, Edificio, Mazo } from "./iconos";

// Plantilla de los reels "persona a cámara + elementos" (reels 13, 15, 17, 18, 19): el mismo
// estilo aprobado (título = hook, subtítulos Inter, zoom suave y progresivo), y todo lo demás
// sale de una lista de eventos anclados a palabras de la voz:
//   - lista numerada bajo el título que se va llenando,
//   - píldoras con objeto (una a la vez),
//   - texto grande 3D,
//   - tarjeta de web: un móvil con la captura de la página que se desliza (las capturas están en
//     public/tiktok/webs/, hechas con scripts/capturas_webs_inmo.mjs),
//   - etiqueta de precio (sitio + precio),
//   - pasos 1 → 2 → 3,
//   - CTA con la caja de comentario.
// Cada evento se busca a partir del anterior (en el orden de la lista), así que una palabra
// repetida se encuentra en el sitio correcto.

export type CorteReel = { duracion: number; cortes: Corte[]; palabras: Palabra[] };

const ROJO = "#E3141F";
const VERDE = "#22B53A";

const ICONOS: Record<string, React.ReactNode> = {
  ok: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={11} fill={VERDE} />
      <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  no: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={11} fill={ROJO} />
      <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  aviso: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M12 2.5 L22.5 20.5 H1.5 Z" fill="#FFC21A" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M12 9 V14" stroke="#111" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={12} cy={17.2} r={1.3} fill="#111" />
    </svg>
  ),
  telefono: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <rect x={6} y={2} width={12} height={20} rx={2.5} fill="#1d1d1f" />
      <rect x={7.3} y={4} width={9.4} height={15} rx={1} fill="#2B7DE9" />
      <circle cx={12} cy={20.3} r={0.8} fill="#888" />
    </svg>
  ),
  personas: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      {[
        [6, 9],
        [18, 9],
        [12, 8],
      ].map(([x, y], i) => (
        <g key={i} opacity={i === 2 ? 1 : 0.75}>
          <circle cx={x} cy={y} r={3.2} fill={i === 2 ? "#2A3340" : "#7A8594"} />
          <path d={`M${x - 5} ${y + 11} a5 5 0 0 1 10 0 Z`} fill={i === 2 ? "#2A3340" : "#7A8594"} />
        </g>
      ))}
    </svg>
  ),
  basura: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M5 7 H19 L17.6 21 H6.4 Z" fill="#7A8594" stroke="#111" strokeWidth={1} />
      <rect x={3.5} y={4.5} width={17} height={2.6} rx={1} fill="#2A3340" />
      <path d="M9.5 10 V18 M12 10 V18 M14.5 10 V18" stroke="#2A3340" strokeWidth={1.3} />
    </svg>
  ),
  ocupado: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M3 11 L12 3 L21 11 V21 H3 Z" fill="#fff" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
      <circle cx={12} cy={12} r={2.4} fill="#2A3340" />
      <path d="M8 21 a4 4.5 0 0 1 8 0 Z" fill="#2A3340" />
    </svg>
  ),
  llave: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={8} cy={12} r={5} fill="none" stroke="#C88A00" strokeWidth={3} />
      <path d="M12.5 12 H22 M18 12 V16 M21 12 V15" stroke="#C88A00" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  euro: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10} fill="#F2C230" stroke="#8A6500" strokeWidth={1.4} />
      <path d="M15.5 8.2 A4.6 4.6 0 1 0 15.5 15.8 M6.5 10.8 H12.5 M6.5 13.2 H12" fill="none" stroke="#5A4000" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  ),
  deuda: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <rect x={4} y={2.5} width={16} height={19} rx={2} fill="#fff" stroke="#111" strokeWidth={1.1} />
      <path d="M7.5 7 H16.5 M7.5 10.5 H16.5 M7.5 14 H12" stroke="#9AA3AF" strokeWidth={1.4} strokeLinecap="round" />
      <text x={16} y={19.5} fontSize={8} fontWeight={900} fill={ROJO} fontFamily="Inter" textAnchor="middle">−€</text>
    </svg>
  ),
  rayo: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M13.5 2 L5 13.5 H11 L9.5 22 L19 10 H13 Z" fill="#FFC21A" stroke="#111" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  ),
  lupa: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={10} cy={10} r={6.5} fill="#DDF1FF" stroke="#2A3340" strokeWidth={2.2} />
      <path d="M15 15 L21 21" stroke="#2A3340" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  mapa: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M12 22 C12 22 4.5 13.8 4.5 9 A7.5 7.5 0 0 1 19.5 9 C19.5 13.8 12 22 12 22 Z" fill={ROJO} stroke="#111" strokeWidth={1} />
      <circle cx={12} cy={9} r={2.8} fill="#fff" />
    </svg>
  ),
  reloj: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10} fill="#fff" stroke="#111" strokeWidth={1.6} />
      <path d="M12 6 V12 L16 14" fill="none" stroke={ROJO} strokeWidth={2} strokeLinecap="round" />
    </svg>
  ),
  manos: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M2 12 L7 7 L11 9 L14 7 L22 12 L17 17 L13 15 L10 17 Z" fill="#F2C58E" stroke="#8A5A2B" strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M9 12 L12 14 M11 10.5 L14.5 13" stroke="#8A5A2B" strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  ),
  video: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <rect x={2} y={5} width={20} height={14} rx={3} fill={ROJO} />
      <path d="M10 9 L15.5 12 L10 15 Z" fill="#fff" />
    </svg>
  ),
  casa: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <path d="M4 11 V21 H20 V11" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M2 12 L12 3 L22 12" fill="none" stroke={ROJO} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={10} y={15} width={4} height={6} fill="#8A5A2B" />
    </svg>
  ),
  porcentaje: (
    <svg width={60} height={60} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10.5} fill={ROJO} />
      <path d="M8 16 L16 8" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={8.5} cy={8.5} r={1.9} fill="#fff" />
      <circle cx={15.5} cy={15.5} r={1.9} fill="#fff" />
    </svg>
  ),
  banco: <Banco tam={60} />,
  edificio: <Edificio tam={60} />,
  mazo: <Mazo tam={60} />,
  calendario: <Calendario tam={60} />,
};
export type IconoK = keyof typeof ICONOS | string;

export type Evento =
  | { tipo: "pildora"; en: string; texto: string; icono: IconoK; hasta?: string }
  | { tipo: "grande"; en: string; texto: string; color?: "verde" | "rojo"; hasta: string; tam?: number }
  | { tipo: "web"; en: string; img: string; dominio: string; hasta: string; baja?: number }
  | { tipo: "precio"; en: string; lugar: string; precio: string; detalle?: string; hasta: string; img?: string }
  | { tipo: "pasos"; en: string[]; textos: string[]; hasta: string }
  | { tipo: "lista"; en: string; indice: number };

export type ConfigPlantilla = {
  video: string;
  cara: { x: number; y: number };
  versiones: Record<string, CorteReel>;
  titulos: Record<string, { blanco: string; amarillo: string; en?: string }>;
  lista?: { puntos: string[]; ancho?: number };
  eventos: Evento[];
  golpes?: string[];
  cta: { en: string; escribe: string; palabra: string };
  amarillas: string[];
  // Zonas en pantalla (1080 × 1920): arriba (título, lista, píldoras) y subtítulos.
  yTitulo?: number;
  yLista?: number;
  yPildora?: number;
  ySub?: number;
  web?: { x: number; y: number };
  yPrecio?: number;
  // Cuenta atrás arriba a la derecha (p. ej. "en menos de 60 segundos"): empieza en la primera
  // palabra de "en" que exista en la versión y se va en "hasta".
  cronometro?: { en: string[]; hasta: string; segundos: number };
};

export type PropsPlantilla = { audio: string | null; version: string };

/** Móvil con la captura de una web que se desliza hacia abajo poco a poco. */
const Web: React.FC<{ t: number; t0: number; t1: number; img: string; dominio: string; baja: number }> = ({ t, t0, t1, img, dominio, baja }) => {
  const entra = easeOut(prog(t, t0 - 0.1, t0 + 0.3));
  const sale = prog(t, t1 - 0.25, t1);
  const scroll = easeInOut(prog(t, t0 + 0.6, t1 - 0.2)) * baja;
  return (
    <div style={{ width: 400, height: 820, borderRadius: 54, background: "#111", padding: 12, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", translate: `${(1 - entra) * -520 + sale * -520}px 0`, rotate: `${(1 - entra) * -6}deg` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: "#fff", position: "relative" }}>
        <div style={{ height: 56, background: "#F2F3F5", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 14, padding: "6px 16px", fontFamily: INTER, fontWeight: 700, fontSize: 22, color: "#333" }}>
            <svg width={16} height={16} viewBox="0 0 24 24">
              <rect x={5} y={10} width={14} height={11} rx={2} fill="#555" />
              <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#555" strokeWidth={2.4} />
            </svg>
            {dominio}
          </div>
        </div>
        <Img src={staticFile(`tiktok/webs/${img}`)} style={{ width: "100%", display: "block", translate: `0 ${-scroll}px` }} />
      </div>
    </div>
  );
};

/** Etiqueta de precio: con foto, en columna; sin foto, compacta en una fila (no tapa la cara). */
const Precio: React.FC<{ t: number; t0: number; lugar: string; precio: string; detalle?: string; img?: string }> = ({ t, t0, lugar, precio, detalle, img }) =>
  img ? (
    <Pop t={t} t0={t0} desde={0.5}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", borderRadius: 34, padding: 14, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
        <Img src={staticFile(img)} style={{ width: 520, height: 320, objectFit: "cover", borderRadius: 24, display: "block", marginBottom: 10 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {ICONOS.mapa}
          <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 42, color: "#151515", whiteSpace: "nowrap" }}>{lugar}</span>
        </div>
        <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 96, color: VERDE, letterSpacing: "-0.03em", lineHeight: 1.05, whiteSpace: "nowrap" }}>{precio}</span>
        {detalle ? <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: "#666" }}>{detalle}</span> : null}
      </div>
    </Pop>
  ) : (
    <Pop t={t} t0={t0} desde={0.5}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 30, padding: "10px 26px 10px 14px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
        {ICONOS.mapa}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 38, color: "#151515", whiteSpace: "nowrap", lineHeight: 1.05 }}>{lugar}</span>
          {detalle ? <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, color: "#666", whiteSpace: "nowrap" }}>{detalle}</span> : null}
        </div>
        <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 72, color: VERDE, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{precio}</span>
      </div>
    </Pop>
  );

export const crearReel = (C: ConfigPlantilla) => {
  const Reel: React.FC<PropsPlantilla> = ({ audio, version }) => {
    cargarFuentes();
    const t = useCurrentFrame() / FPS;
    const { cortes, palabras, duracion } = C.versiones[version];

    const tras = (p: string, desde = 0) => {
      for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
      throw new Error(`No encontré "${p}" después de ${desde.toFixed(2)} (${version})`);
    };
    // El primer evento del cuerpo se busca después del hook (los hooks repiten palabras).
    const titulo = C.titulos[version];
    const tTitulo = titulo.en ? tras(titulo.en) : 0.1;
    let cursor = titulo.en ? tTitulo : 0;
    const resueltos = C.eventos.map((e) => {
      if (e.tipo === "pasos") {
        const ts = e.en.map((p) => (cursor = tras(p, cursor)));
        return { e, t0: ts[0], ts, t1: tras(e.hasta, cursor) };
      }
      const t0 = (cursor = tras(e.en, cursor));
      const hasta = "hasta" in e && e.hasta ? tras(e.hasta, t0 + 0.05) : null;
      return { e, t0, ts: [t0], t1: hasta };
    });
    const tCta = tras(C.cta.en, cursor);
    const tEscribe = tras(C.cta.escribe, tCta);

    // Píldoras: hasta su "hasta", la siguiente píldora o el siguiente elemento grande.
    const grandes = resueltos.filter((r) => r.e.tipo !== "pildora" && r.e.tipo !== "lista").map((r) => r.t0);
    const pildoras = resueltos.filter((r) => r.e.tipo === "pildora");
    const finPildora = (r: (typeof resueltos)[number]) => {
      const sig = [...pildoras.map((p) => p.t0), ...grandes, tCta].filter((x) => x > r.t0 + 0.05);
      return Math.min(r.t1 ?? r.t0 + 3.5, ...sig);
    };

    // Lista: cuándo se activa cada punto.
    const tiemposLista = (C.lista?.puntos ?? []).map((_, i) => {
      const r = resueltos.find((x) => x.e.tipo === "lista" && x.e.indice === i);
      return r ? r.t0 : null;
    });

    // Zoom suave y progresivo.
    const inicios: number[] = [];
    palabras.forEach((w, i) => {
      if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
    });
    const golpes: [number, number][] = [];
    let cg = titulo.en ? tTitulo : 0;
    for (const g of C.golpes ?? []) {
      try {
        cg = tras(g, cg);
        golpes.push([cg, 1.12]);
      } catch {
        // palabra que no está en esta versión
      }
    }
    const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.3, i % 2 ? 1.06 : 1.0]);
    for (const [g, z] of golpes) tramos.push([g - 0.45, z]);
    tramos.sort((a, b) => a[0] - b[0]);
    const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    const zoom = (tt: number) => {
      let v = 1;
      let desde = 0;
      for (let k = 0; k < tramos.length; k++) {
        const [t0, z] = tramos[k];
        if (tt < t0) break;
        const fin = k + 1 < tramos.length ? Math.min(tt, tramos[k + 1][0]) : tt;
        v = lerp(v, z, suave((fin - t0) / 0.9));
        desde = t0;
      }
      return v * (1 + Math.min(0.03, (tt - desde) * 0.008));
    };

    const subs = bloques(palabras);
    const yT = C.yTitulo ?? 190;
    const cierre = tCta;
    const web = C.web ?? { x: 30, y: 430 };
    const destino = { x: C.cara.x * 0.75, y: C.cara.y * 0.75 };

    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Persona t={t} video={C.video} cortes={cortes} zoom={(tt) => zoom(tt)} cara={C.cara} destino={destino} altoBruto={2560} anchoBruto={1440} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.35) 100%)" }} />

        {/* Título fijo (el hook) y lista; se van en el CTA. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: yT, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 1 - prog(t, cierre - 0.2, cierre + 0.1) }}>
          <Pop t={t} t0={0} desde={1.08}>
            <TextoSombra texto={titulo.blanco} tam={titulo.blanco.length > 26 ? 50 : 58} peso={700} />
          </Pop>
          <div style={{ height: 96 }}>
            <Pop t={t} t0={tTitulo - 0.02}>
              <TextoSombra texto={titulo.amarillo} tam={titulo.amarillo.length > 18 ? 70 : 88} peso={900} color={AMARILLO} />
            </Pop>
          </div>
        </div>
        {C.lista ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: C.yLista ?? yT + 175, opacity: (1 - prog(t, cierre - 0.2, cierre + 0.1)) * clamp01((t - (tiemposLista.find((x) => x !== null) ?? 0) + 0.4) / 0.3) }}>
            <Lista t={t} puntos={C.lista.puntos} tiempos={tiemposLista} ancho={C.lista.ancho ?? 440} />
          </div>
        ) : null}

        {resueltos.map((r, i) => {
          const e = r.e;
          if (e.tipo === "pildora") {
            const fin = finPildora(r);
            if (t < r.t0 - 0.05 || t > fin) return null;
            return (
              <div key={i} style={{ position: "absolute", left: 20, right: 20, top: C.yPildora ?? 470, display: "flex", justifyContent: "center", opacity: 1 - prog(t, fin - 0.15, fin) }}>
                <Pildora t={t} t0={r.t0 - 0.05} icono={ICONOS[e.icono] ?? null} texto={e.texto} />
              </div>
            );
          }
          if (e.tipo === "grande") return <Grande key={i} t={t} desde={r.t0 - 0.05} hasta={r.t1! - 0.1} texto={e.texto} color={e.color ?? "verde"} tam={e.tam ?? 100} y={C.yPildora ?? 470} />;
          if (e.tipo === "web") {
            if (t < r.t0 - 0.15 || t > r.t1!) return null;
            return (
              <div key={i} style={{ position: "absolute", left: web.x, top: web.y }}>
                <Web t={t} t0={r.t0} t1={r.t1!} img={e.img} dominio={e.dominio} baja={e.baja ?? 900} />
              </div>
            );
          }
          if (e.tipo === "precio") {
            if (t < r.t0 - 0.05 || t > r.t1!) return null;
            return (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: C.yPrecio ?? C.yPildora ?? 470, display: "flex", justifyContent: "center", opacity: 1 - prog(t, r.t1! - 0.15, r.t1!) }}>
                <Precio t={t} t0={r.t0 - 0.05} lugar={e.lugar} precio={e.precio} detalle={e.detalle} img={e.img} />
              </div>
            );
          }
          if (e.tipo === "pasos") {
            if (t < r.t0 - 0.05 || t > r.t1!) return null;
            return (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: C.yPildora ?? 470, display: "flex", justifyContent: "center", gap: 12, opacity: 1 - prog(t, r.t1! - 0.15, r.t1!) }}>
                {e.textos.map((tx, k) => (
                  <React.Fragment key={k}>
                    {k > 0 ? (
                      <div style={{ alignSelf: "center", opacity: clamp01((t - r.ts[k] + 0.1) / 0.15) }}>
                        <svg width={34} height={34} viewBox="0 0 24 24">
                          <path d="M4 12 H19 M13 6 L19 12 L13 18" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : null}
                    <Pop t={t} t0={r.ts[k] - 0.05} desde={0.5}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: k === e.textos.length - 1 ? AMARILLO : "rgba(255,255,255,0.96)", borderRadius: 24, padding: "10px 18px 10px 10px", boxShadow: "0 12px 26px rgba(0,0,0,0.35)" }}>
                        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#151515", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 28 }}>{k + 1}</div>
                        <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, color: "#151515", whiteSpace: "nowrap" }}>{tx}</span>
                      </div>
                    </Pop>
                  </React.Fragment>
                ))}
              </div>
            );
          }
          return null;
        })}

        {C.cronometro
          ? (() => {
              const cr = C.cronometro;
              let t0 = -1;
              for (const p of cr.en) {
                try {
                  t0 = tras(p);
                  break;
                } catch {
                  // no está en esta versión
                }
              }
              const t1 = tras(cr.hasta, t0);
              if (t0 < 0 || t < t0 - 0.1 || t > t1) return null;
              const resto = Math.max(0, cr.segundos - (t - t0));
              const k = easeOut(prog(t, t0 - 0.1, t0 + 0.25));
              const urgente = resto < 15;
              return (
                <div style={{ position: "absolute", right: 34, top: 60, opacity: k * (1 - prog(t, t1 - 0.2, t1)), scale: String(0.6 + 0.4 * k) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,18,22,0.82)", borderRadius: 999, padding: "8px 20px 8px 10px", border: `3px solid ${urgente ? ROJO : AMARILLO}` }}>
                    <svg width={44} height={44} viewBox="0 0 24 24">
                      <circle cx={12} cy={13} r={9} fill="#fff" />
                      <path d={`M12 13 L${12 + 7 * Math.sin(((cr.segundos - resto) / cr.segundos) * Math.PI * 2)} ${13 - 7 * Math.cos(((cr.segundos - resto) / cr.segundos) * Math.PI * 2)}`} stroke={ROJO} strokeWidth={2.4} strokeLinecap="round" />
                      <rect x={10} y={1.5} width={4} height={2.5} rx={1} fill="#fff" />
                    </svg>
                    <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, color: urgente ? "#FF6B6B" : "#fff", fontVariantNumeric: "tabular-nums" }}>0:{String(Math.ceil(resto)).padStart(2, "0")}</span>
                  </div>
                </div>
              );
            })()
          : null}

        <Comentario t={t} desde={tEscribe - 0.9} escribe={tEscribe} palabra={C.cta.palabra} y={C.yPildora ?? 470} />

        <Subtitulo t={t} lista={subs} y={C.ySub ?? 1400} amarillas={C.amarillas} />

        <Destello t={t} t0={cierre - 0.3} />
        <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
        {audio ? <Audio src={staticFile(audio)} /> : null}
      </AbsoluteFill>
    );
  };
  return Reel;
};
