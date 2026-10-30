import { Composition, Folder, Still } from "remotion";
import { GUION_V1, PortadaV1, PromoV1, PropsV1 } from "./V1";

// TuBodega (docs/tubodega.md).
export const ComposicionesTuBodega: React.FC = () => (
  <Folder name="TuBodega">
    <Composition
      id="TuBodegaV1"
      component={PromoV1}
      durationInFrames={Math.round(GUION_V1.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "tubodega/audio/mezcla-v1.mp3", whatsapp: "+58 426-211-1890" } satisfies PropsV1}
    />
    <Still id="TuBodegaV1Portada" component={PortadaV1} width={1080} height={1920} />
  </Folder>
);
