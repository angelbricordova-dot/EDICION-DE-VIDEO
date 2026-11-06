import { Composition, Folder } from "remotion";
import { PropsReaccion, Reaccion, VIDEOS } from "./Reaccion";

// Marryto Show: shorts de reacción en serie (docs/marryto.md). Una composición por video.
export const ComposicionesMarryto: React.FC = () => (
  <Folder name="Marryto">
    {Object.entries(VIDEOS).map(([n, v]) => (
      <Composition
        key={n}
        id={`Marryto${n}`}
        component={Reaccion}
        durationInFrames={Math.max(30, Math.round((v.fin - v.inicio) * 30))}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ n } satisfies PropsReaccion}
      />
    ))}
  </Folder>
);
