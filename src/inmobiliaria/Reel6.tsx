import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, INTER, lerp, marca, Palabra, Persona, Pop, prog, sp, Subtitulo, TextoSombra, Texto3D } from "./piezas";
import { EtiquetaRebaja, Grifo, Humedad, MaletaNo, Rayo } from "./iconos";
import prueba from "./g6-prueba.json";

// Reel 6 "3 cosas que debes revisar al comprar" (guion 6 del documento del cliente).
// Estilo de las referencias 1 y 2: la persona siempre en pantalla, título fijo arriba con la
// lista 1-2-3 que se va llenando, subtítulos blancos con sombra y detalles pequeños que nunca
// pasan por la cara (zona de la cara: y 520–980 en el plano normal).

type Corte6 = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G6_PRUEBA = prueba as Corte6;

export type PropsReel6 = { audio: string | null };

const CARA = { x: 930, y: 450 };
const PUNTOS = ["El estado del piso", "La zona", "Las actas"];

/** Lista 1-2-3 bajo el título: círculos grises; el punto activo se llena en amarillo. */
const Lista: React.FC<{ t: number; tiempos: (number | null)[] }> = ({ t, tiempos }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
    {PUNTOS.map((texto, i) => {
      const t0 = tiempos[i];
      const k = t0 === null ? 0 : sp(t, t0, { damping: 12, stiffness: 220, mass: 0.6 });
      const activo = t0 !== null && t >= t0;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 74, padding: "0 20px 0 8px", borderRadius: 40, background: activo ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.28)", boxShadow: activo ? `0 0 0 3px ${AMARILLO}` : "none", scale: String(lerp(1, 1.06, clamp01(k) * (1 - clamp01((t - (t0 ?? 0) - 0.4) / 0.3)))) }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", background: activo ? AMARILLO : "radial-gradient(circle at 35% 30%, #EDEDED, #9A9A9A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 38, color: "#1a1a1a" }}>{i + 1}</div>
          <div style={{ overflow: "hidden", maxWidth: activo ? 420 * clamp01(k) : 0 }}>
            <TextoSombra texto={texto} tam={38} peso={800} />
          </div>
        </div>
      );
    })}
  </div>
);

/** Píldora blanca con un objeto (detalles sobre el pecho, debajo de la cara). */
const Pildora: React.FC<{ t: number; t0: number; icono: React.ReactNode; texto: string }> = ({ t, t0, icono, texto }) => (
  <Pop t={t} t0={t0} desde={0.5}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "6px 20px 6px 8px", boxShadow: "0 12px 26px rgba(0,0,0,0.35)" }}>
      <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 37, color: "#151515" }}>{texto}</span>
    </div>
  </Pop>
);

export const Reel6: React.FC<PropsReel6> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras } = G6_PRUEBA;
  const m = (p: string, n = 1) => marca(palabras, p, n);

  const M = {
    vas: m("vas"),
    uno: m("Uno,"),
    la: m("La"),
    tour: m("tour"),
    hay: m("Hay"),
    elec: m("electricidad,"),
    font: m("fontanería,"),
    hum: m("humedades."),
    si2: m("Si", 2),
    lo: m("lo", 2),
    si3: m("Si", 3),
    antes: m("antes,"),
    bajar: m("bajar"),
    fin: G6_PRUEBA.duracion,
  };

  // Punch-ins al empezar cada frase (cada 2–3 s), suaves y rápidos.
  const tramos: [number, number][] = [
    [0, 1.0],
    [M.vas - 0.02, 1.22],
    [M.uno - 0.02, 1.0],
    [M.la - 0.02, 1.12],
    [M.hay - 0.02, 1.0],
    [M.si2 - 0.02, 1.1],
    [M.lo - 0.02, 1.24],
    [M.si3 - 0.02, 1.0],
    [M.bajar - 0.02, 1.12],
  ];
  const zoom = (tt: number) => {
    let z = 1;
    let previo = 1;
    let desde = 0;
    for (const [t0, v] of tramos) if (tt >= t0) { previo = z; z = v; desde = t0; }
    // Transición de 4 cuadros con ease-out: se siente como un empujón de cámara, no un salto.
    return lerp(previo, z, prog(tt, desde, desde + 0.13));
  };

  const subs = bloques(palabras);
  const ocultarSub = (tt: number) => tt >= M.lo - 0.03 && tt < M.si3;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="tiktok/g6/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} />
      {/* Viñeta suave arriba para que el título se lea sobre la pared. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)" }} />

      {/* Título fijo (es el hook): blanco y, cuando lo dice, VAS A PERDER DINERO en amarillo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto="Si no revisas estas 3 cosas" tam={58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={M.vas - 0.02}>
            <TextoSombra texto="VAS A PERDER DINERO" tam={86} peso={900} color={AMARILLO} />
          </Pop>
        </div>
        {t >= M.uno - 0.2 ? (
          <div style={{ marginTop: 18, opacity: prog(t, M.uno - 0.2, M.uno + 0.1) }}>
            <Lista t={t} tiempos={[M.uno, null, null]} />
          </div>
        ) : null}
      </div>

      {/* "No es un tour de vacaciones": maleta tachada junto al hombro. */}
      {t >= M.tour && t < M.hay ? (
        <div style={{ position: "absolute", left: 770, top: 1010, rotate: "8deg" }}>
          <Pop t={t} t0={M.tour} desde={0.4}>
            <MaletaNo tam={210} k={prog(t, M.tour + 0.25, M.tour + 0.45)} />
          </Pop>
        </div>
      ) : null}

      {/* Electricidad, fontanería, humedades: una píldora por palabra sobre el pecho. */}
      {t >= M.elec - 0.05 && t < M.si2 + 0.2 ? (
        <div style={{ position: "absolute", left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", gap: 10, opacity: 1 - prog(t, M.si2, M.si2 + 0.2) }}>
          <Pildora t={t} t0={M.elec - 0.05} icono={<Rayo tam={74} />} texto="Electricidad" />
          <Pildora t={t} t0={M.font - 0.05} icono={<Grifo tam={74} />} texto="Fontanería" />
          <Pildora t={t} t0={M.hum - 0.05} icono={<Humedad tam={74} />} texto="Humedades" />
        </div>
      ) : null}

      {/* "Lo pagas tú" en rojo sobre el pecho, con el punch-in. */}
      {t >= M.lo - 0.03 && t < M.si3 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center" }}>
          <Pop t={t} t0={M.lo - 0.03}>
            <Texto3D texto="lo pagas tú" tam={118} color="rojo" />
          </Pop>
        </div>
      ) : null}

      {/* "Le puedes bajar al precio": etiqueta con flecha verde junto al hombro. */}
      {t >= M.antes + 0.2 ? (
        <div style={{ position: "absolute", left: 740, top: 980, rotate: "-4deg" }}>
          <Pop t={t} t0={M.antes + 0.2} desde={0.4}>
            <EtiquetaRebaja tam={260} k={prog(t, M.bajar - 0.1, M.bajar + 0.25)} />
          </Pop>
        </div>
      ) : null}

      <Subtitulo t={t} lista={subs} y={1250} ocultar={ocultarSub} amarillas={["electricidad", "fontanería", "humedades", "precio", "dinero"]} />

      {/* Destello de luz que tapa el corte entre el hook y el cuerpo. */}
      <Destello t={t} t0={M.uno - 0.24} />

      <AbsoluteFill style={{ background: "#000", opacity: prog(t, M.fin - 0.05, M.fin + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
