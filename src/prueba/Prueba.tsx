import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { measureText } from "@remotion/layout-utils";
import { evolvePath } from "@remotion/paths";
import {
  C,
  easeIn,
  easeInOut,
  easeOut,
  F,
  H,
  lerp,
  MARGEN,
  MUESCA,
  POP,
  prog,
  sp,
  TL,
  FPS,
  useFuentesListas,
  W,
} from "./lib";

const TAM_TITULO = 132;
const PUNTO = 28;
const CENTRO = { x: W / 2, y: H / 2 };

// Bloque de dos líneas centrado en vertical.
const LINEA_1 = H / 2 - TAM_TITULO;
const LINEA_2 = H / 2;

// Pastillas de la escena 2.
const PASTILLAS = ["timing", "sonido", "revisión"];
const PASTILLA_ALTO = 104;
const PASTILLA_TOPS = [380, 510, 640];
const CIRCULO = 40;
const circuloCentro = (i: number) => ({
  x: MARGEN + 26 + CIRCULO / 2,
  y: PASTILLA_TOPS[i] + PASTILLA_ALTO / 2,
});

type Props = { audio: string | null };

/** Palabra que sube desde detrás de una máscara (≈0,8 s) y sale hacia arriba. */
const Palabra: React.FC<{
  texto: string;
  t: number;
  entra: number;
  sale?: number;
  color: string;
}> = ({ texto, t, entra, sale, color }) => {
  const dentro = prog(t, entra, entra + 0.8, easeOut);
  const fuera = sale === undefined ? 0 : prog(t, sale, sale + 0.4, easeIn);
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        paddingBottom: "0.14em",
        marginBottom: "-0.14em",
        verticalAlign: "top",
      }}
    >
      <span
        style={{
          display: "inline-block",
          color,
          translate: `0 ${(1 - dentro) * 130 - fuera * 130}%`,
          rotate: `${(1 - dentro) * 6}deg`,
        }}
      >
        {texto}
      </span>
    </span>
  );
};

const Titulo: React.FC<{
  lineas: { texto: string; entra: number; color: string }[][];
  t: number;
  sale?: number;
}> = ({ lineas, t, sale }) => (
  <>
    {lineas.map((linea, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: MARGEN,
          top: i === 0 ? LINEA_1 : LINEA_2,
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: TAM_TITULO,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          display: "flex",
          gap: "0.24em",
        }}
      >
        {linea.map((p, j) => (
          <Palabra
            key={j}
            texto={p.texto}
            t={t}
            entra={p.entra}
            sale={sale === undefined ? undefined : sale + (i * linea.length + j) * 0.05}
            color={p.color}
          />
        ))}
      </div>
    ))}
  </>
);

/** Etiqueta mono en mayúsculas: decoración, nunca información clave. */
const Etiqueta: React.FC<{ texto: string; x: number; y: number; color: string; p: number }> = ({
  texto,
  x,
  y,
  color,
  p,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 24,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color,
      opacity: p,
      translate: `0 ${(1 - p) * 14}px`,
    }}
  >
    {texto}
  </div>
);

/** Fondo: trama de puntos que deriva despacio, viñeta y grano (nada queda quieto). */
const Fondo: React.FC<{ frame: number }> = ({ frame }) => {
  const deriva = (frame / FPS) * 6;
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.linea} 1.6px, transparent 1.8px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: `${deriva}px ${deriva * 0.5}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </>
  );
};

const Grano: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ opacity: 0.09, pointerEvents: "none" }}>
    <svg width="100%" height="100%">
      <filter id="grano-prueba">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 12} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grano-prueba)" />
    </svg>
  </AbsoluteFill>
);

/** Pastilla con círculo de check que se rellena cuando llega el punto. */
const Pastilla: React.FC<{ i: number; t: number; frame: number }> = ({ i, t, frame }) => {
  const entra = sp(frame, TL.s2.chips[i], POP);
  const sale = prog(t, TL.s2.exit + i * 0.06, TL.s2.exit + i * 0.06 + 0.3, easeIn);
  const marcado = sp(frame, TL.s2.ticks[i], MUESCA);
  const check = "M 11 21 L 17.5 27.5 L 29 14";
  const { strokeDasharray, strokeDashoffset } = evolvePath(
    Math.max(0.0001, prog(t, TL.s2.ticks[i], TL.s2.ticks[i] + 0.3, easeOut)),
    check,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN,
        top: PASTILLA_TOPS[i],
        height: PASTILLA_ALTO,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 40px 0 26px",
        borderRadius: PASTILLA_ALTO / 2,
        border: `2px solid ${C.linea}`,
        background: "rgba(240,238,230,0.04)",
        transformOrigin: "left center",
        scale: String(lerp(0.6, 1, entra)),
        translate: `${(1 - entra) * -20 - sale * 60}px 0`,
        opacity: Math.min(1, entra * 1.5) * (1 - sale),
      }}
    >
      <svg width={CIRCULO} height={CIRCULO} viewBox="0 0 40 40" style={{ overflow: "visible" }}>
        <circle cx="20" cy="20" r="18" fill="none" stroke={C.apagado} strokeWidth={2} />
        <circle cx="20" cy="20" r={20 * marcado} fill={C.acento} />
        <path
          d={check}
          fill="none"
          stroke={C.crema}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 60,
          letterSpacing: "-0.01em",
          color: C.crema,
        }}
      >
        {PASTILLAS[i]}
      </span>
    </div>
  );
};

/** Posición del punto (el objeto que recorre todo el video). */
const posicionPunto = (t: number, final: { x: number; y: number }) => {
  const inicio = { x: W - MARGEN - 80, y: H / 2 };
  const { s1, s2 } = TL;
  const tramos: { desde: number; hasta: number; a: { x: number; y: number }; arco?: number }[] = [
    { desde: s1.dotDock - 0.6, hasta: s1.dotDock, a: final },
    { desde: s2.ticks[0] - 0.45, hasta: s2.ticks[0], a: circuloCentro(0), arco: 170 },
    { desde: s2.ticks[1] - 0.25, hasta: s2.ticks[1], a: circuloCentro(1) },
    { desde: s2.ticks[2] - 0.25, hasta: s2.ticks[2], a: circuloCentro(2) },
    // Sale de la última pastilla cuando esta ya se está yendo, para no cruzar su texto.
    { desde: s2.dotCenter - 0.25, hasta: s2.dotCenter, a: CENTRO, arco: 90 },
  ];
  let p = inicio;
  for (const tramo of tramos) {
    const k = prog(t, tramo.desde, tramo.hasta, easeInOut);
    if (k <= 0) break;
    p = {
      x: lerp(p.x, tramo.a.x, k),
      y: lerp(p.y, tramo.a.y, k) - Math.sin(Math.PI * k) * (tramo.arco ?? 0),
    };
  }
  return p;
};

export const Prueba: React.FC<Props> = ({ audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const listas = useFuentesListas();
  const { s1, s2, s3 } = TL;

  // El punto aterriza como el punto final de "intención".
  const anchoIntencion = listas
    ? measureText({
        text: "intención",
        fontFamily: "Outfit",
        fontSize: TAM_TITULO,
        fontWeight: "600",
        letterSpacing: "-0.02em",
      }).width
    : 600;
  const destinoPunto = {
    x: MARGEN + anchoIntencion + 10 + PUNTO / 2,
    y: LINEA_2 + TAM_TITULO * 0.74,
  };
  const punto = posicionPunto(t, destinoPunto);
  const aterriza = sp(frame, s1.dotDock, POP);
  const respira = 1 + Math.sin(t * 2 * Math.PI * 0.6) * 0.06 * (1 - prog(t, s1.dotDock - 0.6, s1.dotDock));

  // Momento héroe: anticipación y el punto se abre como iris.
  const anticipa = prog(t, s3.iris - 0.12, s3.iris, easeIn);
  const iris = prog(t, s3.iris, s3.iris + 0.5, easeInOut);
  const escalaPunto =
    respira * (1 + 0.25 * Math.sin(Math.PI * aterriza)) * (1 - 0.25 * anticipa * (1 - iris)) +
    iris * ((Math.hypot(W, H) + 40) / PUNTO);
  const fondoAcento = t >= s3.iris + 0.5;

  const colorEtiqueta = t < s3.iris + 0.3 ? C.apagado : C.tintaTenue;

  return (
    <AbsoluteFill style={{ backgroundColor: fondoAcento ? C.acento : C.fondo }}>
      {!fondoAcento ? <Fondo frame={frame} /> : null}

      <Etiqueta texto="Prueba · 8 s" x={MARGEN} y={MARGEN - 10} color={colorEtiqueta} p={1} />

      {t < s1.exit + 0.6 ? (
        <Titulo
          t={t}
          sale={s1.exit}
          lineas={[
            [
              { texto: "Animar", entra: s1.words[0], color: C.crema },
              { texto: "con", entra: s1.words[1], color: C.crema },
            ],
            [{ texto: "intención", entra: s1.words[2], color: C.acento }],
          ]}
        />
      ) : null}

      {t >= s2.label - 0.2 && t < s3.iris + 0.5 ? (
        <>
          <Etiqueta
            texto="3 skills · instaladas"
            x={MARGEN}
            y={320}
            color={C.apagado}
            p={prog(t, s2.label, s2.label + 0.6, easeOut) * (1 - prog(t, s2.exit, s2.exit + 0.3, easeIn))}
          />
          {PASTILLAS.map((_, i) => (
            <Pastilla key={i} i={i} t={t} frame={frame} />
          ))}
        </>
      ) : null}

      {/* El punto: persistente desde el frame 0 hasta convertirse en el iris */}
      {!fondoAcento ? (
        <div
          style={{
            position: "absolute",
            left: punto.x - PUNTO / 2,
            top: punto.y - PUNTO / 2,
            width: PUNTO,
            height: PUNTO,
            borderRadius: "50%",
            backgroundColor: C.acento,
            scale: String(escalaPunto),
            boxShadow: iris > 0 ? undefined : `0 0 ${18 * respira}px rgba(224,38,43,0.55)`,
          }}
        />
      ) : null}

      {t >= s3.iris ? (
        <>
          <Titulo
            t={t}
            lineas={[
              [{ texto: "Hecho", entra: s3.words[0], color: C.tinta }],
              [
                { texto: "en", entra: s3.words[1], color: C.tinta },
                { texto: "código.", entra: s3.words[2], color: C.crema },
              ],
            ]}
          />
          <Etiqueta
            texto="remotion · claude-motion · lottiefiles"
            x={MARGEN}
            y={H - MARGEN - 20}
            color={C.tintaTenue}
            p={prog(t, s3.label, s3.label + 0.6, easeOut)}
          />
        </>
      ) : null}

      <Grano frame={frame} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
