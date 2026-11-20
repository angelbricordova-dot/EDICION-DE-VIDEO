import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, easeIn, easeOut, FPS, lerp, prog, sp } from "../comun/animacion";
import type { Frase } from "../comun/tipos";
import { B, camara, cargarFuentes, Fondo, IconoWhatsApp, JAKARTA, Marca, Pastilla, Subtitulos, Telefono, Titular, type Contenido } from "./piezas";
import guionJson from "./guion-presentacion.json";

// Video de presentación de TuBodega (encargo PROMPT_VIDEO_PRESENTACION.md, docs/tubodega.md).
// Versiones: A completa vertical · B completa horizontal · C corta (vertical y horizontal).
// La voz y la música las mezcla scripts/tubodega/guion_presentacion.py; aquí van los efectos.

type Guion = { duracion: number; frases: Frase[] };
const G = guionJson as unknown as Guion;
const F = G.frases.map((f) => f.desde);
export const DUR_COMPLETA = G.duracion;
export const DUR_CORTA = 28;

export type PropsPresentacion = { formato: "v" | "h"; version: "completa" | "corta"; audio: string | null; subtitulos?: boolean };

const sfx = (n: string) => staticFile(`tubodega/sfx/${n}.wav`);
const Efecto: React.FC<{ t: number; n: string; v?: number }> = ({ t, n, v = 0.7 }) => (
  <Sequence from={Math.max(0, Math.round(t * FPS))} layout="none">
    <Audio src={sfx(n)} volume={v} />
  </Sequence>
);

/** Tarjetas del problema sobre fondo oscuro (escena 2). */
const Problemas: React.FC<{ t: number; t0: number[]; h: boolean }> = ({ t, t0, h }) => {
  const items = [
    ["📒", "Fiados que se olvidan"],
    ["💵", "Una caja que no cuadra"],
    ["📈", "Una tasa que cambia todos los días"],
  ];
  return (
    <AbsoluteFill style={{ background: "#17201C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: h ? 34 : 46 }}>
      {items.map(([ic, tx], i) => {
        const k = sp(t, t0[i], { damping: 13, stiffness: 210, mass: 0.6 });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, width: h ? 1100 : 900, background: "#fff", borderRadius: 34, padding: "30px 40px", opacity: clamp01(k * 2), translate: `${(1 - k) * -120}px 0`, scale: String(lerp(0.9, 1, k)), boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
            <span style={{ fontSize: 84 }}>{ic}</span>
            <span style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 60, lineHeight: 1.08, color: B.texto, letterSpacing: "-0.02em" }}>{tx}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Logo grande con la frase de marca. */
const Logo: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46 }}>
    <Marca t={t} t0={t0} tam={150} claro />
    <div style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 56, color: "#fff", opacity: prog(t, t0 + 0.5, t0 + 0.9), translate: `0 ${(1 - prog(t, t0 + 0.5, t0 + 0.9, easeOut)) * 30}px` }}>Tu bodega completa en el teléfono</div>
  </AbsoluteFill>
);

/** Tarjeta de precios: $10 al mes, $18 con empleado y sello de 7 días gratis (recto). */
const Precios: React.FC<{ t: number; t0: number; h: boolean }> = ({ t, t0, h }) => {
  const k = sp(t, t0, { damping: 13, stiffness: 190, mass: 0.7 });
  const s2 = prog(t, t0 + 0.9, t0 + 1.3, easeOut);
  const sello = sp(t, t0 + 2.2, { damping: 10, stiffness: 240, mass: 0.6 });
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 56, padding: "70px 110px 64px", textAlign: "center", scale: String(lerp(0.8, 1, k)), opacity: clamp01(k * 2), boxShadow: "0 40px 90px rgba(0,0,0,0.3)", marginTop: h ? 0 : -80 }}>
        <div style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 52, color: B.texto }}>Desde</div>
        <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 240, lineHeight: 1, color: B.verde, letterSpacing: "-0.04em" }}>$10</div>
        <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 64, color: B.texto }}>al mes</div>
        <div style={{ marginTop: 34, fontFamily: JAKARTA, fontWeight: 700, fontSize: 46, color: "#4b5a53", opacity: s2, translate: `0 ${(1 - s2) * 20}px` }}>$18 con empleado (Plan Pro)</div>
        <div style={{ position: "absolute", right: -70, top: -70, width: 230, height: 230, borderRadius: "50%", background: B.morado, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: JAKARTA, fontWeight: 800, lineHeight: 1, scale: String(sello), boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
          <span style={{ fontSize: 86 }}>7</span>
          <span style={{ fontSize: 34 }}>días gratis</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Cierre: logo, prueba gratis, WhatsApp, Instagram y página. */
const Cierre: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
    <Marca t={t} t0={t0} tam={130} claro />
    <Pastilla t={t} t0={t0 + 0.5} texto="Pruébala 7 días gratis" fondo="#fff" color={B.verde} tam={58} />
    <Pastilla t={t} t0={t0 + 0.8} texto="Escríbenos por WhatsApp" fondo="#25D366" tam={48} icono={<IconoWhatsApp tam={56} />} />
    <div style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 40, color: "#fff", textAlign: "center", lineHeight: 1.4, opacity: prog(t, t0 + 1.1, t0 + 1.5) }}>
      @tubodega.app
      <br />
      tubodega-app.vercel.app/conocer
    </div>
  </AbsoluteFill>
);

export const Presentacion: React.FC<PropsPresentacion> = ({ formato, version, audio, subtitulos = true }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { width } = useVideoConfig();
  const h = formato === "h";
  const corta = version === "corta";

  // tiempos de escena
  const T = corta
    ? { gancho: 0, problemas: -1, logo: -1, app: 0, cobrar: 0, vuelto: 2, peso: -1, fiado: 7, inventario: 12, caja: 17, sinInternet: 22, precios: 22, cierre: 25, fin: DUR_CORTA }
    : { gancho: 0, problemas: F[1] - 0.15, logo: F[2] - 0.2, app: F[3] - 0.25, cobrar: F[3] - 0.25, vuelto: F[4] - 0.25, peso: F[5] - 0.25, fiado: F[6] - 0.25, inventario: F[7] - 0.25, caja: F[8] - 0.25, sinInternet: F[9] - 0.25, precios: F[10] - 0.25, cierre: F[11] - 0.4, fin: G.duracion };

  // teléfono: dónde está y qué muestra
  const contenidos: Contenido[] = corta
    ? [
        { t: 0, clip: "01-escanear-y-cobrar.mp4", inicio: 0.2 },
        { t: T.vuelto, clip: "01-escanear-y-cobrar.mp4", inicio: 6 },
        { t: T.fiado, clip: "03-fiado-y-abono.mp4", inicio: 3.5, rate: 2 },
        { t: T.inventario, clip: "04-inventario-y-etiquetas.mp4", inicio: 0, rate: 2 },
        { t: T.caja, clip: "05-cuadre-y-cierre-de-caja.mp4", inicio: 0.3, rate: 1.6 },
      ]
    : [
        { t: T.cobrar, clip: "01-escanear-y-cobrar.mp4", inicio: 0 },
        { t: T.vuelto, clip: "01-escanear-y-cobrar.mp4", inicio: 6, rate: 1.2 },
        { t: T.peso, clip: "02-catalogo-peso-y-pago-movil.mp4", inicio: 4, rate: 2.2 },
        { t: T.fiado, clip: "03-fiado-y-abono.mp4", inicio: 3.5, rate: 2 },
        { t: T.inventario, clip: "04-inventario-y-etiquetas.mp4", inicio: 0, rate: 2 },
        { t: T.caja, clip: "05-cuadre-y-cierre-de-caja.mp4", inicio: 0.3, rate: 1.6 },
        { t: T.sinInternet, img: "17-cuadre-del-dia.png" },
      ];
  const finTel = corta ? T.sinInternet : T.precios;
  const conTel = t >= T.app && t < finTel + 0.35;
  const entra = corta ? 1 : sp(t, T.app, { damping: 15, stiffness: 120, mass: 0.9 });
  const sale = prog(t, finTel - 0.05, finTel + 0.3, easeIn);
  const esc = h ? 0.93 : 1;
  const cam = corta
    ? [camara(0, 585, 600, 1.9 * esc), camara(1.6, 585, 600, 1.9 * esc), camara(2.0, 585, 1266, esc), camara(30, 585, 1266, esc)]
    : [camara(0, 585, 1266, esc), camara(T.sinInternet, 585, 1266, esc, 0, true), camara(T.precios, 585, 1100, esc * 1.18, 0, true)];
  const telX = h ? width - 0.2 * width - 40 : width / 2;
  const telY = h ? 510 : 1000;

  // títulos de cada escena
  const titulos: { t0: number; hasta: number; lineas: { texto: string; verdes?: string[]; d?: number }[] }[] = corta
    ? [
        { t0: 0.1, hasta: T.vuelto, lineas: [{ texto: "¿Así de rápido cobras tú?", verdes: ["rápido"] }] },
        { t0: T.vuelto, hasta: T.fiado, lineas: [{ texto: "Vuelto en $ y Bs", verdes: ["vuelto"] }] },
        { t0: T.fiado, hasta: T.inventario, lineas: [{ texto: "El fiado, anotado", verdes: ["fiado,"] }] },
        { t0: T.inventario, hasta: T.caja, lineas: [{ texto: "Inventario y etiquetas", verdes: ["etiquetas"] }] },
        { t0: T.caja, hasta: T.sinInternet, lineas: [{ texto: "La caja cuadra sola", verdes: ["sola"] }] },
      ]
    : [
        { t0: T.cobrar + 0.3, hasta: T.vuelto, lineas: [{ texto: "Cobra con la cámara", verdes: ["cámara"] }] },
        { t0: T.vuelto + 0.1, hasta: T.peso, lineas: [{ texto: "Vuelto en $ y Bs", verdes: ["vuelto"] }] },
        { t0: T.peso + 0.1, hasta: T.fiado, lineas: [{ texto: "Por peso, por cartón", verdes: [] }, { texto: "y por Pago Móvil", verdes: ["pago", "móvil"], d: 1.6 }] },
        { t0: T.fiado + 0.1, hasta: T.inventario, lineas: [{ texto: "El cuaderno de fiados,", verdes: ["fiados"] }, { texto: "en tu teléfono", d: 1.2 }] },
        { t0: T.inventario + 0.1, hasta: T.caja, lineas: [{ texto: "Inventario y etiquetas", verdes: ["etiquetas"] }] },
        { t0: T.caja + 0.1, hasta: T.sinInternet, lineas: [{ texto: "La caja cuadra sola", verdes: ["sola"] }] },
        { t0: T.sinInternet + 0.1, hasta: T.precios, lineas: [{ texto: "Funciona sin internet", verdes: ["internet"] }, { texto: "Plan Pro: tu empleado vende", verdes: ["pro:"], d: 1.7 }, { texto: "y tú lo ves desde tu casa", d: 2.6 }] },
      ];
  const tit = titulos.find((x) => t >= x.t0 - 0.05 && t < x.hasta);

  const fondoVerde = t < (corta ? 0 : T.problemas) || (t >= T.logo && t < T.app) || t >= (corta ? T.sinInternet : T.precios);
  const enProblemas = !corta && t >= T.problemas && t < T.logo;

  return (
    <AbsoluteFill style={{ background: B.verde, overflow: "hidden" }}>
      {enProblemas ? <Problemas t={t} t0={[F[1] - 0.05, F[1] + 1.45, F[1] + 2.75]} h={h} /> : <Fondo t={t} tono={fondoVerde || h ? "verde" : "claro"} />}

      {/* gancho */}
      {!corta && t < T.problemas ? (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: h ? "0 240px" : "0 70px" }}>
          <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: h ? 104 : 110, lineHeight: 1.06, color: "#fff", textAlign: "center", letterSpacing: "-0.03em" }}>
            {(() => {
              const tx = "¿Todavía llevas tu bodega en un cuaderno?";
              const n = Math.floor(clamp01((t - 0.05) / 1.5) * tx.length);
              return (
                <>
                  {tx.slice(0, n)}
                  <span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0.15 }}>|</span>
                </>
              );
            })()}
          </div>
        </AbsoluteFill>
      ) : null}

      {!corta && t >= T.logo && t < T.app ? <Logo t={t} t0={T.logo + 0.1} /> : null}

      {conTel ? (
        <div style={{ position: "absolute", inset: 0, translate: `0 ${sale * 1500}px` }}>
          <Telefono t={t} contenidos={contenidos} camara={cam} cx={telX} cy={telY} entra={entra} />
        </div>
      ) : null}

      {tit ? (
        h ? (
          <div style={{ position: "absolute", left: 50, top: 0, width: 1220, height: 1080 }}>
            <Titular t={t} lineas={tit.lineas.map((l) => ({ texto: l.texto, verdes: l.verdes, t0: tit.t0 + (l.d ?? 0) }))} y={tit.lineas.length > 2 ? 300 : 360} tam={tit.lineas.length > 2 ? 64 : 80} hasta={tit.hasta} />
          </div>
        ) : (
          <Titular t={t} lineas={tit.lineas.map((l) => ({ texto: l.texto, verdes: l.verdes, t0: tit.t0 + (l.d ?? 0) }))} y={255} tam={tit.lineas.length > 2 ? 56 : tit.lineas.length > 1 ? 68 : 76} hasta={tit.hasta} />
        )
      ) : null}

      {corta && t >= T.sinInternet && t < T.cierre ? (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <Pastilla t={t} t0={T.sinInternet + 0.1} texto="Funciona sin internet" fondo="#fff" color={B.verde} tam={72} />
          <Pastilla t={t} t0={T.sinInternet + 0.8} texto="Desde $10 al mes" fondo={B.texto} tam={72} />
        </AbsoluteFill>
      ) : null}

      {!corta && t >= T.precios && t < T.cierre ? <Precios t={t} t0={T.precios + 0.1} h={h} /> : null}
      {t >= T.cierre ? <Cierre t={t} t0={T.cierre + 0.1} /> : null}

      {subtitulos && !corta ? (
        h ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
              <Subtitulos frases={G.frases} t={t} y={960} />
            </div>
          </div>
        ) : (
          <Subtitulos frases={G.frases} t={t} y={1480} />
        )
      ) : null}

      {/* efectos */}
      {corta ? (
        <>
          <Efecto t={0.15} n="escaner" />
          <Efecto t={T.vuelto} n="whoosh" v={0.4} />
          <Efecto t={T.vuelto + 4.8} n="caja" v={0.55} />
          <Efecto t={T.fiado} n="whoosh" v={0.4} />
          <Efecto t={T.fiado + 4} n="monedas" v={0.6} />
          <Efecto t={T.inventario} n="whoosh" v={0.4} />
          <Efecto t={T.caja} n="whoosh" v={0.4} />
          <Efecto t={T.sinInternet + 0.1} n="golpe-suave" />
          <Efecto t={T.sinInternet + 0.8} n="golpe-suave" />
          <Efecto t={T.cierre + 0.1} n="golpe-final" v={0.6} />
        </>
      ) : (
        <>
          <Efecto t={0.05} n="tecleo" v={0.5} />
          <Efecto t={0.6} n="tecleo" v={0.5} />
          <Efecto t={F[1] - 0.05} n="golpe-suave" />
          <Efecto t={F[1] + 1.45} n="golpe-suave" />
          <Efecto t={F[1] + 2.75} n="golpe-suave" />
          <Efecto t={T.logo} n="whoosh" v={0.45} />
          <Efecto t={T.logo + 0.15} n="golpe-final" v={0.45} />
          <Efecto t={T.cobrar + 0.6} n="escaner" />
          <Efecto t={T.cobrar + 2.2} n="pop" v={0.5} />
          <Efecto t={T.vuelto + (10.8 - 6) / 1.2} n="caja" v={0.5} />
          <Efecto t={T.peso} n="whoosh" v={0.35} />
          <Efecto t={T.fiado} n="whoosh" v={0.35} />
          <Efecto t={T.fiado + 4} n="monedas" v={0.55} />
          <Efecto t={T.inventario} n="whoosh" v={0.35} />
          <Efecto t={T.caja} n="whoosh" v={0.35} />
          <Efecto t={T.precios + 0.1} n="golpe-suave" />
          <Efecto t={T.precios + 2.2} n="pop" v={0.5} />
          <Efecto t={T.cierre + 0.1} n="golpe-final" v={0.6} />
        </>
      )}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Portada: fondo verde, logo, frase y el teléfono con la pantalla de venta. */
export const PortadaPresentacion: React.FC<{ formato: "v" | "h" }> = ({ formato }) => {
  cargarFuentes();
  const h = formato === "h";
  return (
    <AbsoluteFill style={{ background: B.verde }}>
      <Fondo t={2} tono="verde" />
      <div style={{ position: "absolute", left: h ? 110 : 0, right: h ? 860 : 0, top: h ? 300 : 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Marca t={5} t0={0} tam={h ? 110 : 120} claro />
        <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: h ? 76 : 80, lineHeight: 1.08, color: "#fff", textAlign: "center", letterSpacing: "-0.02em" }}>Tu bodega completa en el teléfono</div>
      </div>
      <Telefono t={5} contenidos={[{ t: 0, img: "02-venta-escaneado.png" }]} camara={[camara(0, 585, 1266, h ? 0.93 : 1)]} cx={h ? 1536 - 40 : 540} cy={h ? 510 : 1180} />
      <Img src={staticFile("tubodega/brand/icon.svg")} style={{ display: "none" }} />
    </AbsoluteFill>
  );
};
