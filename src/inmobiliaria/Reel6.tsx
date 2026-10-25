import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, INTER, lerp, Palabra, Persona, Pop, prog, sp, Subtitulo, TextoSombra, Texto3D } from "./piezas";
import { Acta, Ayuntamiento, Bolsa, Calendario, Carretera, EtiquetaRebaja, Grifo, Humedad, Luna, MaletaNo, PinCandado, RelojNo, Rayo, Sol } from "./iconos";
import prueba from "./g6-prueba.json";
import hook1 from "./g6-hook1.json";
import hook2 from "./g6-hook2.json";

// Reel 6 "3 cosas que debes revisar al comprar" (guion 6 del documento del cliente).
// Estilo de las referencias 1 y 2: la persona siempre en pantalla, título fijo arriba con la
// lista 1-2-3 que se va llenando, subtítulos blancos con sombra y detalles pequeños que nunca
// pasan por la cara (zona de la cara: y 520–980 en el plano normal).
// Versiones: hook1 (gancho largo), hook2 (gancho corto) y prueba (los primeros 16 s).

type Corte6 = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G6: Record<"prueba" | "hook1" | "hook2", Corte6> = { prueba: prueba as Corte6, hook1: hook1 as Corte6, hook2: hook2 as Corte6 };
export const G6_PRUEBA = G6.prueba;

export type PropsReel6 = { audio: string | null; version: keyof typeof G6 };

const CARA = { x: 930, y: 450 };
const PUNTOS = ["El estado del piso", "La zona", "Las actas"];

const limpio = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;…"]/g, "");

/** Lista 1-2-3 bajo el título: círculos grises; el punto activo se llena en amarillo y muestra su texto. */
const Lista: React.FC<{ t: number; tiempos: (number | null)[]; aviso?: number | null; hechos?: number | null }> = ({ t, tiempos, aviso, hechos }) => {
  let activo = -1;
  tiempos.forEach((t0, i) => {
    if (t0 !== null && t >= t0) activo = i;
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
      {PUNTOS.map((texto, i) => {
        const t0 = tiempos[i];
        const empezo = t0 !== null && t >= t0;
        const abierto = i === activo ? clamp01(sp(t, t0 ?? 0, { damping: 13, stiffness: 200, mass: 0.6 })) : 0;
        // El punto anterior se cierra (queda solo el número) cuando empieza el siguiente.
        const tAct = activo >= 0 ? tiempos[activo] : null;
        const cierra = i < activo && tAct !== null ? 1 - prog(t, tAct, tAct + 0.3) : 0;
        const ancho = Math.max(abierto, cierra);
        // "Atento a la tercera": el 3 late antes de que empiece la lista.
        const late = aviso !== null && aviso !== undefined && i === 2 && t >= aviso && activo < 0 ? 1 + 0.12 * Math.abs(Math.sin((t - aviso) * 6)) : 1;
        const tHecho = hechos !== null && hechos !== undefined ? hechos + i * 0.18 : null;
        const hecho = tHecho !== null && t >= tHecho;
        const kHecho = hecho ? sp(t, tHecho!, { damping: 10, stiffness: 260, mass: 0.5 }) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 74, padding: `0 ${ancho > 0.02 ? 22 : 8}px 0 8px`, borderRadius: 40, background: empezo || hecho ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.28)", boxShadow: i === activo || late > 1 ? `0 0 0 3px ${AMARILLO}` : "none", scale: String(late) }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: empezo || late > 1 ? AMARILLO : "radial-gradient(circle at 35% 30%, #EDEDED, #9A9A9A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 38, color: "#1a1a1a" }}>
              {hecho ? (
                <svg width={44} height={44} viewBox="0 0 24 24" style={{ scale: String(kHecho) }}>
                  <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#14301A" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div style={{ overflow: "hidden", maxWidth: 420 * ancho }}>
              <TextoSombra texto={texto} tam={38} peso={800} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Píldora blanca con un objeto (detalles sobre el pecho, debajo de la cara). */
const Pildora: React.FC<{ t: number; t0: number; icono: React.ReactNode; texto: string; flecha?: { k: number; sube: boolean } }> = ({ t, t0, icono, texto, flecha }) => (
  <Pop t={t} t0={t0} desde={0.5}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "6px 20px 6px 8px", boxShadow: "0 12px 26px rgba(0,0,0,0.35)" }}>
      <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 37, color: "#151515", whiteSpace: "nowrap" }}>{texto}</span>
      {flecha ? (
        <svg width={56} height={56} viewBox="0 0 24 24" style={{ opacity: flecha.k, translate: `0 ${(1 - flecha.k) * (flecha.sube ? 16 : -16)}px`, rotate: flecha.sube ? "0deg" : "180deg" }}>
          <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={flecha.sube ? "#22B53A" : "#E3141F"} stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      ) : null}
    </div>
  </Pop>
);

/** Objeto suelto junto al hombro derecho (fuera de la cara). */
const Pegatina: React.FC<{ t: number; desde: number; hasta: number; x?: number; y?: number; giro?: number; children: React.ReactNode }> = ({ t, desde, hasta, x = 770, y = 1000, giro = 6, children }) => {
  if (t < desde || t > hasta + 0.2) return null;
  const sale = prog(t, hasta, hasta + 0.2);
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${giro}deg`, opacity: 1 - sale, scale: String(1 - sale * 0.3) }}>
      <Pop t={t} t0={desde} desde={0.4}>
        <div style={{ translate: `0 ${Math.sin((t - desde) * 2.6) * 6}px` }}>{children}</div>
      </Pop>
    </div>
  );
};

/** Texto grande sobre el pecho (los subtítulos se ocultan mientras está). */
const Grande: React.FC<{ t: number; desde: number; hasta: number; texto: string; color?: "verde" | "rojo"; tam?: number }> = ({ t, desde, hasta, texto, color = "verde", tam = 118 }) =>
  t >= desde && t < hasta ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center" }}>
      <Pop t={t} t0={desde}>
        <Texto3D texto={texto} tam={tam} color={color} />
      </Pop>
    </div>
  ) : null;

/** Caja de comentario que se escribe sola con la palabra del CTA. */
const Comentario: React.FC<{ t: number; desde: number; escribe: number; palabra: string }> = ({ t, desde, escribe, palabra }) => {
  if (t < desde) return null;
  const dEscribir = 0.09 * palabra.length;
  const letras = Math.floor(clamp01((t - escribe) / dEscribir) * palabra.length);
  const tEnvio = escribe + dEscribir + 0.35;
  const enviado = t > tEnvio;
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1040 }}>
      <Pop t={t} t0={desde} desde={0.6}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: 112, borderRadius: 56, background: "rgba(22,24,28,0.92)", border: "2px solid rgba(255,255,255,0.18)", padding: "0 16px 0 18px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #FEDA75, #D62976 55%, #4F5BD5)", padding: 4 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#2B2F36", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24">
                <circle cx={12} cy={9} r={4} fill="#9AA3AF" />
                <path d="M4 21 a8 7 0 0 1 16 0 Z" fill="#9AA3AF" />
              </svg>
            </div>
          </div>
          <div style={{ flex: 1, fontFamily: INTER, fontWeight: letras ? 800 : 500, fontSize: 46, color: letras ? "#fff" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            {letras ? palabra.slice(0, letras) : "Añade un comentario…"}
            {letras && !enviado && cursor ? <span style={{ color: AMARILLO }}>|</span> : null}
          </div>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: enviado ? AMARILLO : "#4F5BD5", display: "flex", alignItems: "center", justifyContent: "center", scale: String(enviado ? 1 + 0.15 * Math.max(0, 1 - (t - tEnvio) * 4) : 1) }}>
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M12 19 V5 M5 12 L12 5 L19 12" fill="none" stroke={enviado ? "#111" : "#fff"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Pop>
    </div>
  );
};

export const Reel6: React.FC<PropsReel6> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G6[version];

  // Primera aparición de una palabra a partir de un momento.
  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  const uno = tras("Uno,");
  const B = {
    tour: tras("tour", uno),
    hay: tras("Hay", uno),
    elec: tras("electricidad,", uno),
    font: tras("fontanería,", uno),
    hum: tras("humedades.", uno),
    si2: tras("Si", tras("humedades.", uno)),
    lo: tras("lo", tras("firmar,", uno)),
    si3: tras("Si", tras("tú.", uno)),
    antes: tras("antes,", uno),
    bajar: tras("bajar", uno),
  };
  const C =
    version === "prueba"
      ? null
      : (() => {
          const dos = tras("2.", uno);
          const tres = tras("tres", tras("hunde.", dos));
          const tuyo = tras("tuyo", tres);
          const detalle = tras("detalle", tuyo);
          return {
            dos,
            unico: tras("único", dos),
            cambiar: tras("cambiar.", dos),
            media: tras("media", dos),
            tienes: tras("Tienes", dos),
            manana: tras("mañana", dos),
            noche: tras("noche.", dos),
            pregunta: tras("pregunta", dos),
            ayto: tras("ayuntamiento", dos),
            centro: tras("centro", dos),
            sube: tras("sube", dos),
            carretera: tras("carretera", dos),
            hunde: tras("hunde.", dos),
            tres,
            actas: tras("actas", tres),
            ultimos: tras("últimos", tres),
            porque: tras("porque", tres),
            aprobo: tras("aprobó", tres),
            decidido: tras("decidido", tres),
            nadie: tras("nadie", tres),
            derrama: tras("derrama", tres),
            tuyo,
            detalle,
            perder: tras("perder", detalle),
            cta: tras("Si", detalle),
            comenta: tras("comenta", detalle),
            guia: tras("guía", detalle),
          };
        })();
  const H1 =
    version === "hook1"
      ? {
          sin: tras("sin"),
          n99: tras("99"),
          agentes: tras("agentes"),
          atento: tras("atento"),
          n12: tras("12"),
          mas: tras("más", tras("inmobiliario,")),
          n200: tras("200"),
          ysé: tras("y", tras("operaciones")),
        }
      : null;
  const vas = H1 ? null : tras("vas");

  // Punch-ins: al empezar cada frase se alterna plano normal / un poco más cerrado, y en los
  // golpes se cierra más. La transición dura 4 cuadros (empujón de cámara, no salto).
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number | null, number][] = [
    [vas, 1.22],
    [H1?.n99 ?? null, 1.2],
    [H1?.n200 ?? null, 1.2],
    [B.tour, 1.2],
    [B.lo, 1.24],
    [C?.cambiar ?? null, 1.2],
    [C?.noche ?? null, 1.2],
    [C?.hunde ?? null, 1.24],
    [C?.decidido ?? null, 1.2],
    [C?.derrama ?? null, 1.24],
    [C?.perder ?? null, 1.2],
  ];
  const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.02, i % 2 ? 1.1 : 1.0]);
  for (const [g, z] of golpes) if (g !== null) tramos.push([g - 0.02, z]);
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
  // Tramos con texto grande sobre el pecho (sin subtítulo debajo).
  const grandes: [number, number][] = [[B.lo - 0.03, B.si3]];
  if (H1) grandes.push([H1.n99, H1.agentes], [H1.n12, H1.mas], [H1.n200, H1.ysé]);
  if (C) grandes.push([C.derrama, C.tuyo - 0.05]);
  const ocultarSub = (tt: number) => grandes.some(([a, b]) => tt >= a && tt < b);

  const titulo = H1 ? { blanco: "Nunca compres un piso", amarillo: "SIN SABER ESTAS 3 COSAS", t0: H1.sin - 0.02 } : { blanco: "Si no revisas estas 3 cosas", amarillo: "VAS A PERDER DINERO", t0: vas! - 0.02 };
  const listaDesde = H1 ? H1.atento - 0.2 : uno - 0.2;
  const finP1 = C ? C.dos : duracion + 1;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="tiktok/g6/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} />
      {/* Viñeta suave arriba y abajo para que el título y los subtítulos se lean. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)" }} />
      {/* "Por la noche": la imagen se oscurece y se enfría un momento. */}
      {C ? <AbsoluteFill style={{ background: "#0A1A4A", mixBlendMode: "multiply", opacity: 0.55 * prog(t, C.noche - 0.05, C.noche + 0.15) * (1 - prog(t, C.noche + 0.75, C.noche + 1.05)) }} /> : null}

      {/* Título fijo (es el hook) y la lista 1-2-3; se van en el cierre. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: C ? 1 - prog(t, C.cta - 0.2, C.cta + 0.1) : 1 }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto={titulo.blanco} tam={58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={titulo.t0}>
            <TextoSombra texto={titulo.amarillo} tam={titulo.amarillo.length > 20 ? 76 : 86} peso={900} color={AMARILLO} />
          </Pop>
        </div>
        {t >= listaDesde ? (
          <div style={{ marginTop: 18, opacity: prog(t, listaDesde, listaDesde + 0.3) }}>
            <Lista t={t} tiempos={[uno, C?.dos ?? null, C?.tres ?? null]} aviso={H1 ? H1.atento + 0.2 : null} hechos={C ? C.detalle - 0.3 : null} />
          </div>
        ) : null}
      </div>

      {/* ---------- Hook 1: 99 %, 12 años, +200 operaciones ---------- */}
      {H1 ? (
        <>
          <Grande t={t} desde={H1.n99} hasta={H1.agentes} texto="99%" tam={190} />
          <Grande t={t} desde={H1.n12} hasta={H1.mas} texto="12 años" tam={140} />
          <Grande t={t} desde={H1.n200} hasta={H1.ysé} texto="+200 operaciones" tam={96} />
        </>
      ) : null}

      {/* ---------- 1. El estado del piso ---------- */}
      <Pegatina t={t} desde={B.tour} hasta={B.hay - 0.1}>
        <MaletaNo tam={210} k={prog(t, B.tour + 0.25, B.tour + 0.45)} />
      </Pegatina>
      {t >= B.elec - 0.05 && t < B.si2 + 0.2 ? (
        <div style={{ position: "absolute", left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", gap: 10, opacity: 1 - prog(t, B.si2, B.si2 + 0.2) }}>
          <Pildora t={t} t0={B.elec - 0.05} icono={<Rayo tam={74} />} texto="Electricidad" />
          <Pildora t={t} t0={B.font - 0.05} icono={<Grifo tam={74} />} texto="Fontanería" />
          <Pildora t={t} t0={B.hum - 0.05} icono={<Humedad tam={74} />} texto="Humedades" />
        </div>
      ) : null}
      <Grande t={t} desde={B.lo - 0.03} hasta={B.si3} texto="lo pagas tú" color="rojo" />
      <Pegatina t={t} desde={B.antes + 0.2} hasta={finP1 - 0.25} x={740} y={980} giro={-4}>
        <EtiquetaRebaja tam={260} k={prog(t, B.bajar - 0.1, B.bajar + 0.25)} />
      </Pegatina>

      {C ? (
        <>
          {/* ---------- 2. La zona ---------- */}
          <Pegatina t={t} desde={C.unico} hasta={C.media - 0.1}>
            <PinCandado tam={220} />
          </Pegatina>
          <Pegatina t={t} desde={C.media} hasta={C.tienes - 0.05}>
            <RelojNo tam={210} k={prog(t, C.media + 0.35, C.media + 0.55)} />
          </Pegatina>
          {t >= C.manana - 0.05 && t < C.pregunta + 0.2 ? (
            <div style={{ position: "absolute", left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", gap: 16, opacity: 1 - prog(t, C.pregunta, C.pregunta + 0.2) }}>
              <Pildora t={t} t0={C.manana - 0.05} icono={<Sol tam={70} />} texto="Mañana" />
              <Pildora t={t} t0={C.noche - 0.05} icono={<Luna tam={70} />} texto="Noche" />
            </div>
          ) : null}
          {t >= C.ayto - 0.05 && t < C.centro - 0.1 ? (
            <div style={{ position: "absolute", left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", opacity: 1 - prog(t, C.centro - 0.3, C.centro - 0.1) }}>
              <Pildora t={t} t0={C.ayto - 0.05} icono={<Ayuntamiento tam={70} />} texto="¿Qué se va a construir?" />
            </div>
          ) : null}
          {t >= C.centro - 0.05 && t < C.tres - 0.3 ? (
            <div style={{ position: "absolute", left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", gap: 12, opacity: 1 - prog(t, C.tres - 0.5, C.tres - 0.3) }}>
              <Pildora t={t} t0={C.centro - 0.05} icono={<Bolsa tam={70} />} texto="C. comercial" flecha={{ k: prog(t, C.sube - 0.05, C.sube + 0.25), sube: true }} />
              <Pildora t={t} t0={C.carretera - 0.05} icono={<Carretera tam={70} />} texto="Carretera" flecha={{ k: prog(t, C.hunde - 0.05, C.hunde + 0.25), sube: false }} />
            </div>
          ) : null}

          {/* ---------- 3. Las actas de la comunidad ---------- */}
          <Pegatina t={t} desde={C.actas} hasta={C.nadie - 0.1} x={750} y={960}>
            <Acta tam={240} sello={prog(t, C.aprobo, C.aprobo + 0.18, (x) => x)} />
          </Pegatina>
          {t >= C.ultimos - 0.15 && t < C.porque + 0.2 ? (
            <div style={{ position: "absolute", left: 20, right: 320, top: 1060, display: "flex", justifyContent: "center", opacity: 1 - prog(t, C.porque, C.porque + 0.2) }}>
              <Pildora t={t} t0={C.ultimos - 0.15} icono={<Calendario tam={70} />} texto="Últimos 2 años" />
            </div>
          ) : null}
          <Grande t={t} desde={C.derrama} hasta={C.tuyo - 0.05} texto="la derrama" color="rojo" />

          {/* ---------- Cierre: comenta GUÍA ---------- */}
          <Comentario t={t} desde={C.comenta - 0.1} escribe={C.guia} palabra="GUÍA" />
          <Destello t={t} t0={C.cta - 0.3} />
          {/* Destellos cortos que tapan los cortes entre las partes. */}
          <Destello t={t} t0={C.dos - 0.22} dur={0.36} />
          <Destello t={t} t0={C.tres - 0.22} dur={0.36} />
        </>
      ) : null}

      <Subtitulo t={t} lista={subs} y={1250} ocultar={ocultarSub} amarillas={["electricidad", "fontanería", "humedades", "precio", "dinero", "mañana", "noche", "actas", "derrama", "guía", "detalle"]} />

      {/* Destello que tapa el corte entre el hook y el cuerpo. */}
      <Destello t={t} t0={uno - 0.24} />

      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
