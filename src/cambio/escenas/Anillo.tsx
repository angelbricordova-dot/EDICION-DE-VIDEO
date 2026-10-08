import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Papel, PixelEn } from "../elementos";
import { ANILLO } from "../sprites";

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CENTRO = { x: 720, y: 560 };

/** Mancha de tinta negra difuminada. */
const Mancha: React.FC<{ x: number; y: number; tam: number; opacidad?: number }> = ({
  x,
  y,
  tam,
  opacidad = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - tam / 2,
      top: y - tam / 2,
      width: tam,
      height: tam,
      borderRadius: "50%",
      background: "radial-gradient(circle, #111 0%, #111 45%, rgba(17,17,17,0) 72%)",
      opacity: opacidad,
    }}
  />
);

/**
 * Anillo de objetos que gira. Con `dispersar`, los objetos salen volando por
 * la pantalla y la escena se cierra a negro.
 */
export const Anillo: React.FC<{ dispersar?: boolean; acercar?: boolean }> = ({
  dispersar = false,
  acercar = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const giro = frame * 0.014 + (dispersar ? 1.2 : 0);
  const zoom = acercar
    ? interpolate(frame, [36, durationInFrames], [1, 1.9], {
        ...fijo,
        easing: Easing.in(Easing.cubic),
      })
    : 1;
  const salida = dispersar
    ? spring({ frame: frame - 18, fps, config: { damping: 18, mass: 0.9 } })
    : 0;
  const cierre = dispersar
    ? interpolate(frame, [46, durationInFrames], [150, 0], {
        ...fijo,
        easing: Easing.in(Easing.quad),
      })
    : 150;

  return (
    <Papel>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) rotate(${acercar ? frame * 0.08 : 0}deg)`,
          transformOrigin: `${CENTRO.x}px ${CENTRO.y}px`,
        }}
      >
        <Mancha
          x={CENTRO.x + 30}
          y={CENTRO.y - 40}
          tam={interpolate(frame, [0, 60], [50, 90], fijo)}
          opacidad={1 - salida}
        />

        {ANILLO.map((sprite, i) => {
          const angulo = (i / ANILLO.length) * Math.PI * 2 + giro;
          const xAnillo = CENTRO.x + Math.cos(angulo) * 440;
          const yAnillo = CENTRO.y + Math.sin(angulo) * 300;
          const xLibre = 120 + random(`x-${i}`) * 1200;
          const yLibre = 140 + random(`y-${i}`) * 820;
          const entrada = dispersar
            ? 1
            : spring({ frame: frame - i * 1.5, fps, config: { damping: 11 } });
          return (
            <PixelEn
              key={sprite}
              sprite={sprite}
              tam={9}
              x={interpolate(salida, [0, 1], [xAnillo, xLibre])}
              y={interpolate(salida, [0, 1], [yAnillo, yLibre]) + Math.sin(frame / 10 + i) * 6}
              escala={entrada * interpolate(salida, [0, 1], [1, 0.45])}
              rot={salida * (random(`r-${i}`) - 0.5) * 90 + Math.sin(frame / 13 + i) * 4}
            />
          );
        })}

        {dispersar
          ? new Array(5).fill(0).map((_, i) => (
              <Mancha
                key={i}
                x={150 + random(`mx-${i}`) * 1140}
                y={150 + random(`my-${i}`) * 780}
                tam={30 + random(`mt-${i}`) * 50}
                opacidad={interpolate(frame, [20 + i * 4, 26 + i * 4], [0, 1], fijo)}
              />
            ))
          : null}
      </AbsoluteFill>

      {dispersar ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, rgba(11,11,11,0) ${cierre * 0.55}%, rgba(11,11,11,1) ${cierre}%)`,
          }}
        />
      ) : null}
    </Papel>
  );
};
