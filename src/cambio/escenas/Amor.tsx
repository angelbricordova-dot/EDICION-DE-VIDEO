import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { noise2D } from "@remotion/noise";
import { COLORES, textoBase } from "../estilo";
import { Papel, PixelEn, Trazo } from "../elementos";

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const LETRAS = ["A", "M", "O", "R"];
const POSICIONES_X = [130, 520, 920, 1310];
const APARICION = [0, 14, 22, 30];

/** "A M O R" con un objeto distinto en el centro cada medio segundo. */
export const Amor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fase = frame < 15 ? 0 : frame < 30 ? 1 : 2;
  const inicioFase = fase * 15;
  const pop = spring({ frame: frame - inicioFase, fps, config: { damping: 10 } });

  const fondo =
    fase === 0
      ? "radial-gradient(circle at 50% 50%, #8a8a88 0%, #2a2a2a 30%, #0b0b0b 60%)"
      : fase === 1
        ? COLORES.rojo
        : COLORES.negro;
  const colorLetra = fase === 1 ? "#a9d4ff" : COLORES.blanco;

  return (
    <AbsoluteFill style={{ background: fondo }}>
      {fase === 0 ? (
        <PixelEn sprite="corazon" tam={13} x={720} y={540} escala={0.7 + pop * 0.3 + Math.sin(frame / 2) * 0.03} />
      ) : fase === 1 ? (
        <PixelEn sprite="libro" tam={9} x={720} y={540} rot={-24} escala={pop} />
      ) : (
        <PixelEn sprite="vinilo" tam={11} x={720} y={540} rot={frame * 6} escala={pop} />
      )}
      {LETRAS.map((letra, i) => (
        <div
          key={letra}
          style={{
            ...textoBase,
            position: "absolute",
            left: POSICIONES_X[i],
            top: 510,
            fontSize: 56,
            color: colorLetra,
            transform: "translateX(-50%)",
            opacity: frame >= APARICION[i] ? 1 : 0,
          }}
        >
          {letra}
        </div>
      ))}
    </AbsoluteFill>
  );
};

type Letra = {
  letra: string;
  inicio: [number, number, number];
  final: [number, number, number];
};

// [x, y, rotación] al estar dispersas y al agruparse al final.
const DISPERSAS: Letra[] = [
  { letra: "A", inicio: [560, 420, 160], final: [600, 450, -4] },
  { letra: "·", inicio: [770, 300, 0], final: [730, 470, 0] },
  { letra: "M", inicio: [1250, 330, -20], final: [850, 450, 3] },
  { letra: "O", inicio: [330, 780, 200], final: [660, 660, -6] },
  { letra: "R", inicio: [1080, 900, 30], final: [880, 680, 5] },
];

const PUNTOS = new Array(7).fill(0).map((_, i) => ({
  x: 100 + random(`dx-${i}`) * 1240,
  y: 120 + random(`dy-${i}`) * 840,
}));

/** Pétalo/lazo trazado a mano alrededor de un punto. */
const lazo = (x: number, y: number, angulo: number, largo: number, ancho: number) => {
  const dx = Math.cos(angulo);
  const dy = Math.sin(angulo);
  const px = -dy;
  const py = dx;
  const p = (a: number, b: number) =>
    `${(x + dx * largo * a + px * ancho * b).toFixed(1)} ${(y + dy * largo * a + py * ancho * b).toFixed(1)}`;
  return `M ${p(0, 0)} C ${p(0.25, 1)}, ${p(1.05, 0.8)}, ${p(1, 0)} C ${p(0.95, -0.9)}, ${p(0.3, -1.1)}, ${p(0.05, 0.1)} C ${p(-0.1, 0.4)}, ${p(0.2, 0.7)}, ${p(0.35, 0.3)}`;
};

const LAZOS = [
  { x: 620, y: 470, ang: -2.5, largo: 300, ancho: 70 },
  { x: 740, y: 470, ang: -1.45, largo: 260, ancho: 60 },
  { x: 760, y: 480, ang: -0.6, largo: 330, ancho: 70 },
  { x: 680, y: 650, ang: 1.9, largo: 230, ancho: 90 },
  { x: 880, y: 670, ang: 0.15, largo: 300, ancho: 80 },
  { x: 820, y: 560, ang: 0.9, largo: 180, ancho: 50 },
];

/** Final: letras flotando sobre papel que se juntan rodeadas de lazos rojos. */
export const AmorFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const juntar = spring({ frame: frame - 38, fps, config: { damping: 16, mass: 1.2 } });

  return (
    <Papel>
      {PUNTOS.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x + noise2D("px", i, frame / 60) * 30,
            top: p.y + noise2D("py", i, frame / 60) * 30,
            width: 9,
            height: 9,
            borderRadius: "50%",
            backgroundColor: COLORES.tinta,
            opacity: 1 - juntar * 0.6,
          }}
        />
      ))}

      {DISPERSAS.map((l, i) => {
        const deriva = 1 - juntar;
        const x =
          interpolate(juntar, [0, 1], [l.inicio[0], l.final[0]]) +
          noise2D("lx", i, frame / 50) * 40 * deriva;
        const y =
          interpolate(juntar, [0, 1], [l.inicio[1], l.final[1]]) +
          noise2D("ly", i, frame / 50) * 40 * deriva;
        const rot = interpolate(juntar, [0, 1], [l.inicio[2] + frame * 0.6, l.final[2]]);
        const tam = interpolate(juntar, [0, 1], [42, 110]);
        return (
          <div key={l.letra}>
            {/* Pequeño garabato rojo junto a cada letra mientras flota */}
            {l.letra !== "·" ? (
              <Trazo
                d="M 0 30 C 10 0, 30 -5, 34 14 C 38 30, 18 34, 20 18 C 22 4, 44 2, 50 16"
                progreso={interpolate(frame, [6 + i * 4, 22 + i * 4], [0, 1], fijo)}
                color={COLORES.rojo}
                grosor={2.5}
                viewBox="-5 -10 60 50"
                style={{
                  left: x - 10,
                  top: y - 70,
                  width: 60,
                  height: 50,
                  opacity: 1 - juntar,
                }}
              />
            ) : null}
            <div
              style={{
                ...textoBase,
                position: "absolute",
                left: x,
                top: y,
                fontSize: tam,
                lineHeight: 1,
                color: COLORES.tinta,
                transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              }}
            >
              {l.letra}
            </div>
          </div>
        );
      })}

      {LAZOS.map((z, i) => (
        <Trazo
          key={i}
          d={lazo(z.x, z.y, z.ang, z.largo, z.ancho)}
          progreso={interpolate(frame, [50 + i * 3, 72 + i * 3], [0, 1], fijo)}
          color={COLORES.rojo}
          grosor={2.5}
          viewBox="0 0 1440 1080"
          style={{ left: 0, top: 0, width: 1440, height: 1080 }}
        />
      ))}
    </Papel>
  );
};
