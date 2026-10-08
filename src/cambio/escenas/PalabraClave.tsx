import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, textoBase } from "../estilo";
import { Cursor, Destello, Negro, NotaMusical, PixelEn, Trazo } from "../elementos";

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Texto que se escribe letra por letra con cursor, a la derecha de la pantalla. */
const Escribir: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const letras = Math.min(texto.length, Math.floor(frame * 1.4) + 1);
  return (
    <div
      style={{
        ...textoBase,
        position: "absolute",
        left: 790,
        top: 510,
        fontSize: 54,
        color: COLORES.blanco,
        display: "flex",
        alignItems: "center",
        gap: 40,
      }}
    >
      <span>{texto.slice(0, letras)}</span>
      <Cursor alto={56} color={COLORES.blanco} />
    </div>
  );
};

export const Accion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  const estrella = spring({ frame: frame - 2, fps, config: { damping: 9 } });
  return (
    <Negro>
      <Destello
        tam={interpolate(estrella, [0, 1], [0, 300])}
        x={500}
        y={330}
        centro="#ff5a4a"
        borde={COLORES.rojo}
        rot={14}
      />
      <PixelEn
        sprite="camara"
        tam={15}
        x={420}
        y={560}
        rot={interpolate(entrada, [0, 1], [-40, -72])}
        escala={interpolate(entrada, [0, 1], [0.6, 1])}
      />
      <Escribir texto="acción." />
    </Negro>
  );
};

export const Intencion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Negro>
      <Trazo
        d="M -40 900 C 120 760, 220 720, 300 560 C 340 480, 420 420, 560 330"
        progreso={interpolate(frame, [0, 10], [0, 1], fijo)}
        color={COLORES.rojo}
        grosor={70}
        viewBox="0 0 1440 1080"
        style={{ left: 0, top: 0, width: 1440, height: 1080, filter: "drop-shadow(0 0 8px rgba(224,38,43,0.6))" }}
      />
      <PixelEn
        sprite="libro"
        tam={15}
        x={420}
        y={530}
        rot={interpolate(entrada, [0, 1], [-30, 14])}
        escala={interpolate(entrada, [0, 1], [0.6, 1])}
      />
      <Escribir texto="intención." />
    </Negro>
  );
};

const NOTAS = [
  { x: 640, y: 120, doble: true, tam: 170, desde: 2 },
  { x: 700, y: 640, doble: false, tam: 130, desde: 8 },
  { x: 280, y: 760, doble: false, tam: 110, desde: 14 },
  { x: 1180, y: 680, doble: true, tam: 120, desde: 18 },
];

export const Curiosidad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Negro>
      <Trazo
        d="M 760 110 C 840 60, 940 80, 960 200"
        progreso={interpolate(frame, [4, 16], [0, 1], fijo)}
        color={COLORES.blanco}
        grosor={4}
        viewBox="0 0 1440 1080"
        style={{ left: 0, top: 0, width: 1440, height: 1080 }}
      />
      <PixelEn
        sprite="vinilo"
        tam={17}
        x={400}
        y={540}
        rot={frame * 5}
        escala={interpolate(entrada, [0, 1], [0.6, 1])}
      />
      {NOTAS.map((n, i) => {
        const p = spring({ frame: frame - n.desde, fps, config: { damping: 10 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y - (frame - n.desde) * 1.5,
              transform: `scale(${p}) rotate(${Math.sin(frame / 6 + i) * 10}deg)`,
            }}
          >
            <NotaMusical doble={n.doble} tam={n.tam} color={COLORES.rojo} />
          </div>
        );
      })}
      <Escribir texto="curiosidad." />
    </Negro>
  );
};

/** Paneo rápido de objetos de un lado a otro, con estelas de movimiento. */
export const Paneo: React.FC<{
  objetos: { sprite: Parameters<typeof PixelEn>[0]["sprite"]; x: number; y: number; rot: number }[];
  tam: number;
}> = ({ objetos, tam }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dx = interpolate(frame, [0, durationInFrames], [260, -260]);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORES.papel,
        backgroundImage: "radial-gradient(ellipse at 50% 45%, #eeedea 0%, #e2e1de 55%, #cfcdc9 100%)",
      }}
    >
      {objetos.map((o, i) => (
        <PixelEn
          key={i}
          sprite={o.sprite}
          tam={tam}
          x={o.x + dx * (1 + (i % 3) * 0.15)}
          y={o.y}
          rot={o.rot}
          filtro="blur(0.6px)"
        />
      ))}
      {[260, 520, 760].map((y, i) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 1300 - ((frame * 70 + i * 400) % 1700),
            top: y,
            width: 70,
            height: 5,
            backgroundColor: COLORES.rojo,
            opacity: 0.8,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
