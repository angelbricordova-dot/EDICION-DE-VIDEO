import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Cambio, DURACION, FPS, PropsCambio } from "./cambio/Cambio";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Cambio"
        component={Cambio}
        durationInFrames={DURACION}
        fps={FPS}
        width={1440}
        height={1080}
        defaultProps={{ audio: null } satisfies PropsCambio}
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
    </>
  );
};
