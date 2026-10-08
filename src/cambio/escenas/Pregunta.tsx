import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORES, textoBase } from "../estilo";
import { Destello, Frase, Papel, PixelEn, Trazo } from "../elementos";
import { NombreSprite } from "../sprites";

const PALABRAS = ["¿cómo", "comunicas", "que", "estás", "atravesando", "un", "cambio?"];
const INICIOS = [20, 27, 35, 41, 48, 58, 63];

const OBJETOS: { sprite: NombreSprite; x: number; y: number; rot: number }[] = [
  { sprite: "libro", x: 760, y: 360, rot: -18 },
  { sprite: "claqueta", x: 1040, y: 370, rot: 22 },
  { sprite: "moneda", x: 980, y: 690, rot: -8 },
  { sprite: "camara", x: 1110, y: 880, rot: -14 },
];

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Título grande con líneas guía punteadas (primer medio segundo). */
const TituloGrande: React.FC = () => {
  const frame = useCurrentFrame();
  const escala = interpolate(frame, [0, 14], [1.25, 0.9], {
    ...fijo,
    easing: Easing.out(Easing.cubic),
  });
  const salida = interpolate(frame, [11, 15], [1, 0], fijo);
  const linea: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    borderTop: `3px dashed ${COLORES.cafe}`,
  };
  return (
    <AbsoluteFill style={{ opacity: salida }}>
      <AbsoluteFill style={{ transform: `scale(${escala})`, transformOrigin: "30% 50%" }}>
        <div style={{ ...linea, top: 455 }} />
        <div style={{ ...linea, top: 615 }} />
        <div
          style={{
            ...textoBase,
            position: "absolute",
            left: 420,
            top: 400,
            fontSize: 250,
            lineHeight: 1,
            color: COLORES.tinta,
          }}
        >
          ¿cómo <span style={{ color: "#5a5a5a" }}>comunicas</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Guiones que se recogen hacia la línea de texto. */
const Guiones: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [13, 21], [0, 1], { ...fijo, easing: Easing.inOut(Easing.cubic) });
  const opacidad = interpolate(frame, [13, 15, 20, 23], [0, 1, 1, 0], fijo);
  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      {new Array(14).fill(0).map((_, i) => {
        const x0 = i * 110 - 40;
        const x = interpolate(p, [0, 1], [x0, 130 + i * 30]);
        const y = interpolate(p, [0, 1], [i % 2 ? 455 : 615, 540]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: interpolate(p, [0, 1], [40, 14]),
              height: 4,
              backgroundColor: COLORES.cafe,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Pregunta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Empujón de cámara cuando aparece el destello.
  const zoom = interpolate(frame, [56, 74, 120], [1, 1.22, 1.3], {
    ...fijo,
    easing: Easing.out(Easing.cubic),
  });
  const destello = spring({ frame: frame - 56, fps, config: { damping: 14, mass: 0.6 } });
  const flash = interpolate(frame, [56, 58, 64], [0, 0.7, 0], fijo);

  // Cierre: el viñeteado se cierra hasta negro.
  const cierre = interpolate(frame, [84, 116], [150, 0], {
    ...fijo,
    easing: Easing.in(Easing.quad),
  });
  const calido = interpolate(frame, [86, 100, 112], [0, 0.55, 0], fijo);
  const negroFinal = interpolate(frame, [112, 119], [0, 1], fijo);

  return (
    <Papel>
      {frame < 16 ? <TituloGrande /> : null}
      <Guiones />

      {frame >= 56 ? (
        <Destello
          tam={interpolate(destello, [0, 1], [0, 1150])}
          x={-80}
          y={600}
          centro="#9ffcff"
          borde="#1a4dff"
          rot={interpolate(frame, [56, 120], [-8, 6])}
        />
      ) : null}

      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "120px 540px" }}>
        <Trazo
          d="M 20 40 C 10 10, 40 0, 36 26 C 32 46, 14 34, 30 22 C 90 14, 300 18, 560 14 C 590 13, 600 20, 585 24"
          progreso={interpolate(frame, [22, 46], [0, 1], fijo)}
          color={COLORES.cafe}
          grosor={3}
          viewBox="0 0 600 50"
          style={{
            left: 110,
            top: 468,
            width: 600,
            height: 50,
            opacity: interpolate(frame, [52, 58], [1, 0], fijo),
          }}
        />
        <Frase
          palabras={PALABRAS}
          inicios={INICIOS}
          color={COLORES.tinta}
          tam={40}
          style={{ left: 120, top: 515 }}
        />

        {frame >= 56
          ? OBJETOS.map((o, i) => {
              const entrada = spring({
                frame: frame - 58 - i * 2,
                fps,
                config: { damping: 12 },
              });
              return (
                <PixelEn
                  key={o.sprite}
                  sprite={o.sprite}
                  tam={4.5}
                  x={o.x + Math.sin(frame / 14 + i) * 10}
                  y={o.y - (frame - 56) * 0.9}
                  rot={o.rot + Math.sin(frame / 18 + i) * 6}
                  escala={entrada}
                />
              );
            })
          : null}
      </AbsoluteFill>


      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
      {frame >= 84 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 55% 50%, rgba(255,190,170,${calido}) 0%, rgba(0,0,0,0) ${cierre * 0.35}%, rgba(11,11,11,1) ${cierre}%)`,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ backgroundColor: COLORES.negro, opacity: negroFinal }} />
    </Papel>
  );
};
