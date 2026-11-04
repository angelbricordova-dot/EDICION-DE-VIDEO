import { Composition, Folder } from "remotion";
import { Prueba, PRUEBA, PropsPrueba } from "./Prueba";

// Paul: reels con IA (docs/paul.md).
export const ComposicionesPaul: React.FC = () => (
  <Folder name="Paul">
    <Composition
      id="PaulPrueba"
      component={Prueba}
      durationInFrames={Math.round(PRUEBA.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "paul/mezcla-prueba.wav" } satisfies PropsPrueba}
    />
  </Folder>
);
