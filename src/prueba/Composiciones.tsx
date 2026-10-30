import { Composition, Folder } from "remotion";
import { HelloWorld } from "../HelloWorld";
import { Cambio, DURACION, FPS, PropsCambio } from "../cambio/Cambio";
import { Prueba } from "./Prueba";
import timelinePrueba from "./timeline.json";

// Pruebas y la recreación "Cambio" (no son de clientes).
export const ComposicionesPruebas: React.FC = () => (
  <Folder name="Pruebas">
    <Composition
      id="Cambio"
      component={Cambio}
      durationInFrames={DURACION}
      fps={FPS}
      width={1440}
      height={1080}
      defaultProps={{ audio: "audio/banda-sonora.mp3" } satisfies PropsCambio}
    />
    <Composition
      id="Prueba"
      component={Prueba}
      durationInFrames={timelinePrueba.duration * timelinePrueba.fps}
      fps={timelinePrueba.fps}
      width={1080}
      height={1080}
      defaultProps={{ audio: "audio/prueba.mp3" as string | null }}
    />
    <Composition
      id="HelloWorld"
      component={HelloWorld}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ titulo: "Edición de video con Remotion" }}
    />
  </Folder>
);
