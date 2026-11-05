import { Composition, Folder } from "remotion";
import { Prueba, PRUEBA, PropsPrueba } from "./Prueba";

// Shimon Geek, YouTube de anime (docs/shimon.md).
export const ComposicionesShimon: React.FC = () => (
  <Folder name="Shimon">
    <Composition
      id="ShimonPrueba"
      component={Prueba}
      durationInFrames={Math.round(PRUEBA.duracion * 30)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ audio: "shimon/prueba/mezcla.wav" } satisfies PropsPrueba}
    />
  </Folder>
);
