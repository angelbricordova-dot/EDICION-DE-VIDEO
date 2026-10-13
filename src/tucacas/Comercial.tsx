import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, cargarFuentes, clamp01, easeOut, F, FPS, prog } from "./estilo";
import { GUION_30, GUION_60, Guion, Plano } from "./guiones";
import { Cierre, Foto, Grabacion, LogoDibujado, Rotulos, Subtitulos, TarjetaIcono, Telefono } from "./piezas";

export type PropsComercial = { version: "30s" | "60s"; audio: string | null; subtitulos: boolean };

export const GUIONES: Record<PropsComercial["version"], Guion> = { "30s": GUION_30, "60s": GUION_60 };

const DUR_WHIP = 0.24;

const ContenidoPlano: React.FC<{ plano: Plano; t: number }> = ({ plano, t }) => {
  const p = clamp01((t - plano.desde) / (plano.hasta - plano.desde));
  switch (plano.tipo) {
    case "foto":
      return <Foto encuadre={plano.encuadre} p={p} />;
    case "grabacion":
      return <Grabacion archivo={plano.archivo} inicio={plano.inicio} desde={plano.desde} />;
    case "telefono":
      return <Telefono t={t} desde={plano.desde} diaNoche={plano.diaNoche} />;
    case "cierre":
      return <Cierre t={t} desde={plano.desde} icono={plano.icono} />;
    case "iconos":
      return (
        <AbsoluteFill>
          {plano.fondo === "foto" && plano.encuadre ? (
            <>
              <Foto encuadre={plano.encuadre} p={p} />
              <AbsoluteFill style={{ background: "rgba(11,58,54,0.35)" }} />
            </>
          ) : (
            <AbsoluteFill
              style={{ background: `linear-gradient(160deg, ${C.verde} 0%, ${C.verde2} 50%, ${C.verdeProfundo} 100%)` }}
            />
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: plano.fondo === "foto" ? 1000 : 720,
              display: "flex",
              justifyContent: "center",
              gap: 30,
            }}
          >
            {plano.iconos.map((icono) => (
              <TarjetaIcono key={icono.tipo} icono={icono} t={t} tam={plano.iconos.length > 2 ? 290 : 400} />
            ))}
          </div>
        </AbsoluteFill>
      );
  }
};

export const Comercial: React.FC<PropsComercial> = ({ version, audio, subtitulos }) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const guion = GUIONES[version];

  return (
    <AbsoluteFill style={{ background: C.tinta }}>
      {guion.planos.map((plano, i) => {
        const anterior = guion.planos[i - 1];
        // El plano anterior sigue visible mientras entra uno con "whip".
        const sigue = guion.planos[i + 1];
        const visibleHasta = sigue && "whip" in sigue && sigue.whip ? plano.hasta + DUR_WHIP : plano.hasta;
        if (t < plano.desde || t >= visibleHasta) return null;
        const whip = "whip" in plano && plano.whip && anterior;
        const k = whip ? prog(t, plano.desde, plano.desde + DUR_WHIP, easeOut) : 1;
        const desenfoque = whip ? (1 - k) * 40 : 0;
        return (
          <AbsoluteFill
            key={i}
            style={{
              translate: `${(1 - k) * 1080}px 0`,
              filter: desenfoque > 0.5 ? `blur(${desenfoque.toFixed(1)}px)` : undefined,
              zIndex: i,
            }}
          >
            <ContenidoPlano plano={plano} t={t} />
          </AbsoluteFill>
        );
      })}
      {/* Rótulos y subtítulos siempre por encima de los planos. */}
      <AbsoluteFill style={{ zIndex: 100 }}>
        {guion.rotulos
          .filter((r) => t >= r.desde && t < r.hasta)
          .map((r, i) => (
            <Rotulos key={i} rotulo={r} t={t} />
          ))}
        {/* En el cierre el lema ya está en pantalla: no se repite como subtítulo. */}
        {subtitulos && !guion.planos.some((pl) => pl.tipo === "cierre" && t >= pl.desde) ? (
          <Subtitulos frases={guion.frases} t={t} />
        ) : null}
      </AbsoluteFill>
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Portada (miniatura): la piscina con el lema y el logo. */
export const Portada: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill>
      <Foto encuadre={{ foto: "n30-02-piscina.jpg", ancha: true, foco: "45% 60%" }} p={0} />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(14,79,74,0.85) 0%, rgba(14,79,74,0) 45%, rgba(14,79,74,0) 60%, rgba(14,79,74,0.9) 100%)" }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <LogoDibujado t={10} desde={0} ancho={420} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1320,
          textAlign: "center",
          fontFamily: F.titulo,
          fontWeight: 800,
          fontSize: 112,
          lineHeight: 1.02,
          letterSpacing: "-0.01em",
          textShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ color: C.blanco }}>Tu día en Tucacas</div>
        <div style={{ color: C.sol }}>empieza aquí</div>
      </div>
    </AbsoluteFill>
  );
};
