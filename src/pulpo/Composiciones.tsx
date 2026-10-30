import { Composition, Folder } from "remotion";
import { GUION_PULPO, PropsPulpo, ShortPulpo } from "./Short";
import { PropsPulpoReal, ShortPulpoReal } from "./ShortReal";

// Short del pulpo (docs/pulpo.md).
export const ComposicionesPulpo: React.FC = () => (
  <Folder name="Pulpo">
    <Composition
      id="PulpoFinal"
      component={ShortPulpo}
      durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ limpia: false, audio: "pulpo/audio/mezcla.mp3" } satisfies PropsPulpo}
    />
    <Composition
      id="PulpoLimpio"
      component={ShortPulpo}
      durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ limpia: true, audio: "pulpo/audio/mezcla-limpia.mp3" } satisfies PropsPulpo}
    />
    {([false, true] as const).map((limpia) => (
      <Composition
        key={`real-${limpia}`}
        id={limpia ? "PulpoRealLimpio" : "PulpoRealFinal"}
        component={ShortPulpoReal}
        durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ limpia, audio: limpia ? "pulpo/audio/mezcla-limpia.mp3" : "pulpo/audio/mezcla.mp3" } satisfies PropsPulpoReal}
      />
    ))}
  </Folder>
);
