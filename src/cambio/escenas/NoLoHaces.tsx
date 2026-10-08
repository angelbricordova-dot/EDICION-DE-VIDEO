import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { COLORES } from "../estilo";
import { Frase, Silueta } from "../elementos";

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const POSICION_SILUETA: React.CSSProperties = {
  left: 560,
  top: 120,
  width: 980,
  height: 980,
};

export const NoLoHaces: React.FC = () => {
  const frame = useCurrentFrame();

  const fondo = interpolateColors(
    frame,
    [0, 40, 46, 50, 56],
    [COLORES.negro, COLORES.negro, COLORES.granate, COLORES.granate, "#d6d2ce"],
  );

  // La silueta térmica entra desenfocada y violeta, y se enfoca.
  const enfoque = interpolate(frame, [0, 14], [45, 0], fijo);
  const tono = interpolate(frame, [0, 14], [-60, 0], fijo);
  const anillo = interpolate(frame, [0, 4, 16], [0, 1, 0], fijo);
  // A partir del cambio de fondo pasa a ser una sombra a contraluz.
  const sombra = interpolate(frame, [50, 56], [0, 1], fijo);

  const colorTexto = interpolateColors(frame, [50, 56], ["#f4f2ee", "#3a3533"]);

  return (
    <AbsoluteFill style={{ backgroundColor: fondo }}>
      {/* Luz de ventana detrás de la sombra */}
      <AbsoluteFill
        style={{
          opacity: sombra,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.95) 53%, rgba(200,196,192,0) 62%)",
          filter: "blur(18px)",
        }}
      />
      <Silueta
        modo="termico"
        style={{
          ...POSICION_SILUETA,
          opacity: 1 - sombra,
          filter: `blur(${enfoque}px) hue-rotate(${tono}deg) drop-shadow(0 0 30px rgba(255,120,30,0.35))`,
        }}
      />
      <Silueta
        modo="sombra"
        style={{ ...POSICION_SILUETA, opacity: sombra, filter: "blur(2px)" }}
      />

      {/* Anillo de luz naranja que gira alrededor de la cabeza al inicio */}
      <svg
        viewBox="0 0 400 200"
        style={{
          position: "absolute",
          left: 560,
          top: 340,
          width: 520,
          height: 260,
          opacity: anillo,
          filter: "blur(6px)",
          transform: `rotate(${-12 + frame * 2}deg)`,
        }}
      >
        <ellipse cx="200" cy="100" rx="180" ry="55" fill="none" stroke="#ffb02e" strokeWidth={22} />
      </svg>

      {frame < 40 ? (
        <Frase
          palabras={["no", "lo", "haces."]}
          inicios={[4, 6, 8]}
          color="#f4f2ee"
          tam={40}
          style={{ left: 190, top: 515, filter: `blur(${enfoque * 0.3}px)` }}
        />
      ) : (
        <Frase
          palabras={["simplemente", "lo", "demuestras."]}
          inicios={[40, 46, 54]}
          color={colorTexto}
          tam={40}
          style={{ left: 190, top: 515 }}
        />
      )}
    </AbsoluteFill>
  );
};
