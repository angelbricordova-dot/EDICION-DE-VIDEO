import { Composition, Folder, Still } from "remotion";
import { GUION_CAMIS, PortadaCamis11, PropsCamis, ReelCamis11 } from "./Reel";

// Futbol Onze × Camis11 (docs/camis11.md).
export const ComposicionesCamis11: React.FC = () => (
  <Folder name="Camis11">
    <Composition
      id="Camis11"
      component={ReelCamis11}
      durationInFrames={GUION_CAMIS.duracion * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "camis11/audio/mezcla.mp3", publi: false } satisfies PropsCamis}
    />
    <Still id="Camis11Portada" component={PortadaCamis11} width={1080} height={1920} />
  </Folder>
);
