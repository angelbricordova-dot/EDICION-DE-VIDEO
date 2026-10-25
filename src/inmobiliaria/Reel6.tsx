import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../tucacas/estilo";
import { bloques, cargarFuentes, Corte, Escena, FondoCrema, FondoRojo, INTER, lerp, marca, Palabra, Persona, Pop, prog, Subtitulo, Tarjeta, Texto3D } from "./piezas";
import { EtiquetaRebaja, Grifo, Humedad, Rayo } from "./iconos";
import prueba from "./g6-prueba.json";

// Reel 6 "3 cosas que debes revisar al comprar" (guion 6 del documento del cliente).
// Corte y palabras en g6-<version>.json (scripts/corte_inmo.py + scripts/alinear.py).

type Corte6 = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G6_PRUEBA = prueba as Corte6;

export type PropsReel6 = { audio: string | null };

const CARA = { x: 930, y: 450 };

export const Reel6: React.FC<PropsReel6> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras } = G6_PRUEBA;
  const m = (p: string, n = 1) => marca(palabras, p, n);

  const M = {
    vas: m("vas"),
    uno: m("Uno,"),
    estado: m("estado"),
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

  // Plano normal / cerrado alternando en cada corte, y punch-ins en los golpes.
  const zoom = (tt: number, i: number) => {
    if (tt >= M.vas - 0.02 && tt < M.uno) return 1.32;
    if (tt >= M.tour - 0.02 && tt < M.hay) return 1.22;
    if (tt >= M.lo - 0.02 && tt < M.si3) return 1.3;
    return i % 2 ? 1.14 : 1.0;
  };

  const subs = bloques(palabras);
  const textoGrande = (tt: number) => tt < M.uno || (tt >= M.lo - 0.03 && tt < M.si3);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="tiktok/g6/proxy.mp4" cortes={cortes} zoom={zoom} cara={CARA} />

      {/* Hook: línea blanca y luego VAS A PERDER DINERO en verde con relieve. */}
      {t < M.uno ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Pop t={t} t0={0} desde={1.1}>
            <Texto3D texto="Si no revisas estas 3 cosas" tam={62} color="blanco" peso={800} mayus={false} />
          </Pop>
          <Pop t={t} t0={M.vas}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Texto3D texto="vas a perder" tam={118} />
              <Texto3D texto="dinero" tam={150} />
            </div>
          </Pop>
        </div>
      ) : null}

      {/* "Lo pagas tú" en rojo, con punch-in. */}
      {t >= M.lo - 0.03 && t < M.si3 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center" }}>
          <Pop t={t} t0={M.lo - 0.03}>
            <Texto3D texto="lo pagas tú" tam={130} color="rojo" />
          </Pop>
        </div>
      ) : null}

      {/* 1. El estado del piso (escena roja, entra con la tarjeta desde la cara). */}
      <Escena t={t} t0={M.uno} t1={M.la - 0.05} entrada="tarjeta">
        <FondoRojo t={t} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
          <Pop t={t} t0={M.uno}>
            <div style={{ width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #F2F2F2, #9C9C9C)", border: "8px solid #E0A23A", boxShadow: "12px 16px 0 rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 130, color: "#1a1a1a" }}>1</div>
          </Pop>
          <Pop t={t} t0={M.estado - 0.05}>
            <Tarjeta tam={84}>El estado del piso</Tarjeta>
          </Pop>
        </div>
      </Escena>

      {/* Electricidad, fontanería, humedades (escena crema, un objeto por palabra). */}
      <Escena t={t} t0={M.hay} t1={M.si2 - 0.05}>
        <FondoCrema />
        {[
          { t0: M.elec, y: 330, el: <Rayo tam={300} />, txt: "Electricidad" },
          { t0: M.font, y: 640, el: <Grifo tam={300} />, txt: "Fontanería" },
          { t0: M.hum, y: 950, el: <Humedad tam={300} />, txt: "Humedades" },
        ].map((o, i) => (
          <div key={o.txt} style={{ position: "absolute", left: i === 1 ? 120 : 70, right: 60, top: o.y, display: "flex", flexDirection: i === 1 ? "row-reverse" : "row", alignItems: "center", justifyContent: "flex-start", gap: 26 }}>
            <Pop t={t} t0={o.t0 - 0.05} desde={0.3}>
              <div style={{ translate: `0 ${Math.sin((t - o.t0) * 3) * 6}px` }}>{o.el}</div>
            </Pop>
            <Pop t={t} t0={o.t0 + 0.05}>
              <Texto3D texto={o.txt} tam={70} />
            </Pop>
          </div>
        ))}
      </Escena>

      {/* Si lo descubres antes, le bajas al precio (escena roja con la etiqueta). */}
      <Escena t={t} t0={M.si3} t1={M.fin + 1} entrada="tarjeta">
        <FondoRojo t={t} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <Pop t={t} t0={M.si3}>
            <Tarjeta tam={84}>Antes de firmar</Tarjeta>
          </Pop>
          <Pop t={t} t0={M.antes + 0.3} desde={0.4}>
            <EtiquetaRebaja k={prog(t, M.bajar - 0.1, M.bajar + 0.25)} tam={460} />
          </Pop>
          {t >= M.bajar ? (
            <Pop t={t} t0={M.bajar}>
              <Texto3D texto="baja el precio" tam={92} />
            </Pop>
          ) : null}
        </div>
      </Escena>

      <Subtitulo t={t} lista={subs} y={1300} ocultar={textoGrande} />

      {/* Fundido a negro muy corto al final de la prueba. */}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(0, 1, prog(t, M.fin - 0.05, M.fin + 0.15)) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
