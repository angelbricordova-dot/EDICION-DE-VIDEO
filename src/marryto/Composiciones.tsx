import { Composition, Folder } from "remotion";
import { PropsReaccion, Reaccion, tiempo, VIDEOS } from "./Reaccion";

// Marryto Show: shorts de reacción en serie (docs/marryto.md). Una composición por video, a 60 fps;
// se renderiza con --scale=2 para entregar en 4K (2160 × 3840) como pidió.
export const ComposicionesMarryto: React.FC = () => (
  <Folder name="Marryto">
    {Object.entries(VIDEOS).map(([n, v]) => (
      <Composition
        key={n}
        id={`Marryto${n}`}
        component={Reaccion}
        durationInFrames={Math.max(60, Math.round(tiempo(v).dur * 60))}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ n } satisfies PropsReaccion}
      />
    ))}
  </Folder>
);
