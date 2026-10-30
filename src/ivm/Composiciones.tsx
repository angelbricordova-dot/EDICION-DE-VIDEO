import { Composition, Folder } from "remotion";
import { Explicador, PropsExplicador } from "./Explicador";
import timelineIvm from "./timeline.json";

// Explicador IVM (docs/estilo-ivm.md).
export const ComposicionesIvm: React.FC = () => (
  <Folder name="IVM">
    <Composition
      id="IvmExplicador"
      component={Explicador}
      durationInFrames={timelineIvm.duration * timelineIvm.fps}
      fps={timelineIvm.fps}
      width={1920}
      height={1080}
      defaultProps={{ audio: "audio/ivm-explicador.mp3", subtitulos: true } satisfies PropsExplicador}
    />
  </Folder>
);
