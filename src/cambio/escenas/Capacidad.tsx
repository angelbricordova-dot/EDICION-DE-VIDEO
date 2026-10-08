import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORES, textoBase } from "../estilo";
import { Mano, Palabra } from "../elementos";

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Capacidad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const subida = spring({ frame, fps, config: { damping: 15, mass: 0.8 } });
  const fondo = interpolateColors(frame, [42, 52], [COLORES.negro, COLORES.granate]);
  // Al final la mano se disuelve en humo.
  const humo = interpolate(frame, [44, 60], [0, 1], fijo);

  const texto: React.CSSProperties = {
    ...textoBase,
    position: "absolute",
    top: 515,
    fontSize: 40,
    opacity: 1 - humo * 0.5,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: fondo }}>
      <Mano
        style={{
          left: 440,
          top: interpolate(subida, [0, 1], [900, 260]),
          width: 560,
          height: 840,
          filter: `blur(${humo * 14}px)`,
          opacity: 1 - humo * 0.6,
          transform: `rotate(${Math.sin(frame / 20) * 3}deg)`,
        }}
      />

      {/* Partículas blancas que suben */}
      {new Array(10).fill(0).map((_, i) => {
        const x = 560 + random(`px-${i}`) * 340;
        const y0 = 520 + random(`py-${i}`) * 140;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y0 - frame * (1 + random(`pv-${i}`) * 2),
              width: 4,
              height: 10,
              borderRadius: 4,
              backgroundColor: "white",
              opacity: interpolate(frame, [6 + i, 12 + i, 50], [0, 0.85, 0], fijo),
            }}
          />
        );
      })}

      <div style={{ ...texto, right: 1440 - 545, textAlign: "right" }}>
        <Palabra texto="a través de tu" desde={6} color={COLORES.blanco} duracion={7} />
      </div>
      <div style={{ ...texto, left: 935 }}>
        <Palabra texto="propia" desde={18} color={COLORES.blanco} />{" "}
        <Palabra texto="capacidad" desde={25} color={COLORES.blanco} />
      </div>
    </AbsoluteFill>
  );
};
