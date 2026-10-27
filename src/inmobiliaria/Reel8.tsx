import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, easeInOut, INTER, lerp, Palabra, Persona, Pop, prog, sp, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, limpio, Pildora } from "./comunes";
import { Banco } from "./iconos";
import hook1 from "./g8-hook1.json";
import hook2 from "./g8-hook2.json";
import cuerpo from "./g8-cuerpo.json";

// Reel 8 "ranking de portales" (guion 8, cámara lateral, bruto vertical 4K). Como en la
// referencia del cliente: columna 1-7 a la izquierda; cada portal aparece arriba (sobre la
// pared, nunca en la cara) y, cuando dice "número N", vuela a su puesto. Píldoras con el
// veredicto, subtítulos sobre el pecho y CTA con la caja de comentario (FILTRO).

type CorteReel = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G8: Record<"hook1" | "hook2" | "cuerpo", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel, cuerpo: cuerpo as CorteReel };

export type PropsReel8 = { audio: string | null; version: keyof typeof G8 };

// Bruto vertical 2160 × 3840 → copia de trabajo 1440 × 2560; la cara queda donde está.
const CARA = { x: 907, y: 1320 };
const DESTINO = { x: 680, y: 990 };

// Columna del ranking (izquierda) y punto donde aparece cada portal (arriba, sobre la pared).
const COL = { x: 40, y0: 470, paso: 124 };
const REVELA = { x: 650, y: 520 };

type Marca = { nombre: string; fondo: string; texto: string };
const MARCAS: Record<string, Marca> = {
  idealista: { nombre: "idealista", fondo: "#1E1E1E", texto: "#D9F55A" },
  milanuncios: { nombre: "milanuncios", fondo: "#0FA958", texto: "#FFFFFF" },
  pisos: { nombre: "pisos.com", fondo: "#FF6A13", texto: "#FFFFFF" },
  fotocasa: { nombre: "fotocasa", fondo: "#1E5EFF", texto: "#FFFFFF" },
  altamira: { nombre: "altamira", fondo: "#0F2D69", texto: "#FFFFFF" },
  sareb: { nombre: "sareb", fondo: "#00857C", texto: "#FFFFFF" },
  uno: { nombre: "Fuera de mercado", fondo: "linear-gradient(135deg, #FFE27A, #E0A21B)", texto: "#2A1A00" },
};

/** Etiqueta con el nombre del portal (no es el logo oficial). */
const Chip: React.FC<{ m: Marca; tam: number }> = ({ m, tam }) => (
  <div style={{ display: "inline-flex", alignItems: "center", height: tam * 1.5, padding: `0 ${tam * 0.5}px`, borderRadius: tam * 0.4, background: m.fondo, boxShadow: `0 ${tam * 0.18}px ${tam * 0.4}px rgba(0,0,0,0.45), inset 0 0 0 ${Math.max(2, tam * 0.05)}px rgba(255,255,255,0.18)`, fontFamily: INTER, fontWeight: 900, fontSize: tam, letterSpacing: "-0.03em", color: m.texto, whiteSpace: "nowrap" }}>
    {m.nombre}
  </div>
);

const Check: React.FC<{ ok: boolean }> = ({ ok }) => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={ok ? "#22B53A" : "#E3141F"} />
    {ok ? <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);
const Sube: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M12 2 L21 12 H15.5 V22 H8.5 V12 H3 Z" fill="#E3141F" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);
const Llave: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={8} cy={12} r={5} fill="none" stroke="#C88A00" strokeWidth={3} />
    <path d="M12.5 12 H22 M18 12 V16 M21 12 V15" stroke="#C88A00" strokeWidth={3} strokeLinecap="round" />
  </svg>
);
const Manos: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M2 12 L7 7 L11 9 L14 7 L22 12 L17 17 L13 15 L10 17 Z" fill="#F2C58E" stroke="#8A5A2B" strokeWidth={1.4} strokeLinejoin="round" />
    <path d="M9 12 L12 14 M11 10.5 L14.5 13" stroke="#8A5A2B" strokeWidth={1.3} strokeLinecap="round" />
  </svg>
);

export const Reel8: React.FC<PropsReel8> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G8[version];

  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  // Cada portal: cuándo aparece (dice su nombre), cuándo vuela a su puesto ("número N") y su puesto.
  const iId = tras("Idealista");
  const iMil = tras("Milanuncios.", iId);
  const iPis = tras("Pisos.com", iMil);
  const iFot = tras("Fotocasa.", iPis);
  const iAlt = tras("Altamira.", iFot);
  const iSar = tras("Sareb.", iAlt);
  const iUno = tras("uno", iSar);
  const portal = tras("portal,", iUno);
  const confianza = tras("confianza.", iUno);
  const filtro = tras("filtro", confianza);
  const primero = tras("primero.", filtro);
  const ultIdealista = tras("Idealista.", primero);
  const dejame = tras("Déjame", primero);
  const ranking: { k: string; puesto: number; aparece: number; vuela: number; hasta: number }[] = [
    { k: "idealista", puesto: 4, aparece: iId, vuela: tras("Número", iId), hasta: iMil },
    { k: "milanuncios", puesto: 6, aparece: iMil, vuela: tras("Número", iMil), hasta: iPis },
    { k: "pisos", puesto: 7, aparece: iPis, vuela: tras("Número", iPis), hasta: iFot },
    { k: "fotocasa", puesto: 5, aparece: iFot, vuela: tras("Número", iFot), hasta: iAlt },
    { k: "altamira", puesto: 3, aparece: iAlt, vuela: tras("Número", iAlt), hasta: iSar },
    { k: "sareb", puesto: 2, aparece: iSar, vuela: tras("Número", iSar), hasta: iUno },
    { k: "uno", puesto: 1, aparece: portal, vuela: confianza + 0.45, hasta: filtro },
  ];

  // Veredictos de cada portal (píldoras arriba, una a la vez).
  const pildoras: { desde: number; icono: React.ReactNode; texto: string }[] = [
    { desde: tras("inflado", iId), icono: <Sube />, texto: "Precio inflado" },
    { desde: tras("saber", iId), icono: <Check ok />, texto: "Para ver lo que vale" },
    { desde: tras("nunca", iId), icono: <Check ok={false} />, texto: "Para comprar" },
    { desde: tras("Mucho", iMil), icono: <Check ok={false} />, texto: "Poca oportunidad" },
    { desde: tras("poca", iPis), icono: <Check ok={false} />, texto: "Muy poca gente" },
    { desde: tras("Igual", iFot), icono: <Sube />, texto: "Igual que idealista" },
    { desde: tras("vender", iFot), icono: <Check ok />, texto: "Para vender" },
    { desde: tras("comprar", iFot), icono: <Check ok={false} />, texto: "Para comprar barato" },
    { desde: tras("bancos.", iAlt), icono: <Banco tam={60} />, texto: "Pisos de bancos" },
    { desde: tras("descuentos", iAlt), icono: <Check ok />, texto: "Descuentos de verdad" },
    { desde: tras("burbuja.", iSar), icono: <Banco tam={60} />, texto: "Tras la burbuja" },
    { desde: tras("descuentos", iSar), icono: <Check ok />, texto: "El mayor descuento" },
    { desde: tras("antes", portal), icono: <Llave />, texto: "Antes de publicarse" },
    { desde: tras("inversor", portal), icono: <Manos />, texto: "Inversor de confianza" },
    { desde: tras("relaciones", filtro), icono: <Manos />, texto: "Relaciones con inmobiliarias" },
  ];
  const finPildoras = [...pildoras.map((p) => p.desde).slice(1), primero + 0.6];
  // Una píldora no se queda encima de un portal nuevo.
  const cortesPildora = ranking.map((r) => r.aparece);

  // Punch-ins (4 cuadros): alternancia en cada frase y golpes en los veredictos.
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number, number][] = [
    [tras("nunca", iId), 1.18],
    [tras("poca", iMil), 1.16],
    [tras("Yo", iPis), 1.18],
    [tras("barato,", iFot), 1.18],
    [tras("descuentos", iAlt), 1.16],
    [tras("descuentos", iSar), 1.18],
    [portal, 1.16],
    [tras("nunca", primero), 1.2],
  ];
  const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.02, i % 2 ? 1.08 : 1.0]);
  for (const [g, z] of golpes) tramos.push([g - 0.02, z]);
  tramos.sort((a, b) => a[0] - b[0]);
  const zoom = (tt: number) => {
    let z = 1;
    let previo = 1;
    let desde = 0;
    for (const [t0, v] of tramos)
      if (tt >= t0) {
        previo = z;
        z = v;
        desde = t0;
      }
    return lerp(previo, z, prog(tt, desde, desde + 0.13));
  };

  const subs = bloques(palabras);
  const titulo =
    version === "hook1" ? { blanco: "Mejores sitios para", amarillo: "ENCONTRAR CASA", t0: tras("encontrar") } : version === "hook2" ? { blanco: "Mejores webs para", amarillo: "BUSCAR CASA", t0: tras("buscar") } : { blanco: "Ranking de", amarillo: "PORTALES INMOBILIARIOS", t0: 0.1 };
  const cta = tras("Y", primero);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="tiktok/g8/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} destino={DESTINO} altoBruto={2560} anchoBruto={1440} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.35) 100%)" }} />

      {/* Título fijo (el hook); se va en el cierre. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 1 - prog(t, cta - 0.2, cta + 0.1) }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto={titulo.blanco} tam={58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={titulo.t0 - 0.02}>
            <TextoSombra texto={titulo.amarillo} tam={titulo.amarillo.length > 16 ? 74 : 90} peso={900} color={AMARILLO} />
          </Pop>
        </div>
      </div>

      {/* Columna del ranking: los puestos caen uno a uno al empezar y se llenan con cada portal. */}
      <div style={{ opacity: 1 - prog(t, cta - 0.2, cta + 0.1) }}>
        {Array.from({ length: 7 }, (_, i) => {
          const puesto = i + 1;
          const y = COL.y0 + i * COL.paso;
          const k = sp(t, 0.15 + i * 0.07, { damping: 12, stiffness: 220, mass: 0.6 });
          const r = ranking.find((x) => x.puesto === puesto)!;
          const lleno = t >= r.vuela + 0.35;
          const destello = lleno ? 1 - clamp01((t - r.vuela - 0.35) / 0.5) : 0;
          // "¿Y el número uno?": el 1 late hasta que se revela.
          const late = puesto === 1 && t >= iUno && t < r.vuela + 0.35 ? 1 + 0.12 * Math.abs(Math.sin((t - iUno) * 6)) : 1;
          return (
            <div key={puesto} style={{ position: "absolute", left: COL.x, top: y, height: 96, display: "flex", alignItems: "center", translate: `${(1 - k) * -160}px 0`, opacity: clamp01(k * 2) }}>
              {lleno ? (
                <div style={{ scale: String(1 + destello * 0.15), filter: destello > 0 ? `drop-shadow(0 0 ${18 * destello}px ${AMARILLO})` : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 62, height: 62, borderRadius: "50%", background: AMARILLO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 38, color: "#1a1a1a", boxShadow: "0 6px 14px rgba(0,0,0,0.4)" }}>{puesto}</div>
                    <Chip m={MARCAS[r.k]} tam={r.k === "uno" ? 26 : 32} />
                  </div>
                </div>
              ) : (
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: `5px solid ${late > 1 ? AMARILLO : "rgba(255,225,77,0.85)"}`, boxShadow: `0 0 ${late > 1 ? 26 : 14}px rgba(255,225,77,0.55)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 46, color: AMARILLO, scale: String(late), textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{puesto}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cada portal aparece arriba y vuela a su puesto. */}
      {ranking.map((r) => {
        if (t < r.aparece - 0.05 || t >= r.vuela + 0.35) return null;
        const vuelo = easeInOut(prog(t, r.vuela, r.vuela + 0.35));
        const yPuesto = COL.y0 + (r.puesto - 1) * COL.paso + 48;
        const x = lerp(REVELA.x, COL.x + 72 + 120, vuelo);
        const y = lerp(REVELA.y, yPuesto, vuelo);
        return (
          <div key={r.k} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(lerp(1, 0.42, vuelo)) }}>
            <Pop t={t} t0={r.aparece - 0.05} desde={0.4}>
              <Chip m={MARCAS[r.k]} tam={r.k === "uno" ? 62 : 78} />
            </Pop>
          </div>
        );
      })}

      {/* Veredictos: una píldora a la vez, arriba a la derecha de la columna. */}
      {pildoras.map((p, i) => {
        const fin = Math.min(finPildoras[i], ...cortesPildora.filter((c) => c > p.desde + 0.05));
        if (t < p.desde - 0.05 || t > fin) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 250, right: 30, top: 610, display: "flex", justifyContent: "center", opacity: 1 - prog(t, fin - 0.15, fin) }}>
            <Pildora t={t} t0={p.desde - 0.05} icono={p.icono} texto={p.texto} />
          </div>
        );
      })}

      {/* El Filtro Inmobiliario: insignia dorada. */}
      {t >= filtro - 0.05 && t < tras("relaciones", filtro) - 0.1 ? (
        <div style={{ position: "absolute", left: 250, right: 30, top: 560, display: "flex", justifyContent: "center" }}>
          <Pop t={t} t0={filtro - 0.05}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 34px", borderRadius: 30, background: "linear-gradient(135deg, #FFE27A, #E0A21B)", boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 0 0 3px rgba(255,255,255,0.35)" }}>
              <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 52, color: "#2A1A00", whiteSpace: "nowrap" }}>El Filtro Inmobiliario</span>
              <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: "#5A3A00" }}>mi comunidad</span>
            </div>
          </Pop>
        </div>
      ) : null}

      {/* "Los mejores pisos nunca llegan a idealista": idealista tachado. */}
      {t >= ultIdealista - 0.05 && t < dejame - 0.1 ? (
        <div style={{ position: "absolute", left: 250, right: 30, top: 560, display: "flex", justifyContent: "center" }}>
          <Pop t={t} t0={ultIdealista - 0.05}>
            <div style={{ position: "relative" }}>
              <Chip m={MARCAS.idealista} tam={78} />
              <svg width={420} height={140} viewBox="0 0 420 140" style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", overflow: "visible" }}>
                <path d={`M20 120 L${20 + 380 * prog(t, ultIdealista + 0.1, ultIdealista + 0.35)} ${120 - 100 * prog(t, ultIdealista + 0.1, ultIdealista + 0.35)}`} stroke="#E3141F" strokeWidth={16} strokeLinecap="round" />
              </svg>
            </div>
          </Pop>
        </div>
      ) : null}

      {/* Cierre: comenta FILTRO. */}
      <Comentario t={t} desde={dejame - 0.1} escribe={tras("filtro", dejame)} palabra="FILTRO" y={560} />

      <div style={{ position: "absolute", left: 230, right: 0, top: 0, bottom: 0 }}>
        <Subtitulo t={t} lista={subs} y={1420} amarillas={["idealista", "milanuncios", "pisos", "fotocasa", "altamira", "sareb", "descuentos", "inflado", "filtro", "confianza", "barato"]} />
      </div>

      <Destello t={t} t0={cta - 0.3} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
