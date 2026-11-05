import { Composition, Folder } from "remotion";
import { Prueba, PRUEBA, PropsPrueba } from "./Prueba";

// Katia (agencia; reels de coach de fuerza, docs/katia.md).
export const ComposicionesKatia: React.FC = () => (
  <Folder name="Katia">
    <Composition
      id="KatiaPrueba"
      component={Prueba}
      durationInFrames={Math.round(PRUEBA.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "katia/mezcla-prueba.wav" } satisfies PropsPrueba}
    />
  </Folder>
);
