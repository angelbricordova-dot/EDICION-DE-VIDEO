import { Composition, Folder } from "remotion";
import { ClipVicens, DURACION_VICENS } from "./Clip";

// Vicens · GTA 6 (Clipeamos): clips verticales de sus directos (docs/vicens.md).
export const ComposicionesVicens: React.FC = () => (
  <Folder name="Vicens">
    <Composition id="VicensAvion" component={ClipVicens} durationInFrames={Math.round(DURACION_VICENS * 60)} fps={60} width={1080} height={1920} />
  </Folder>
);
