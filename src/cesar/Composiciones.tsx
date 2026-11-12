import { Composition, Folder } from "remotion";
import { DURACION_CESAR, PruebaCesar } from "./Prueba";

// César: reacciones con su cámara arriba a la izquierda (docs/cesar.md).
export const ComposicionesCesar: React.FC = () => (
  <Folder name="Cesar">
    <Composition id="CesarPrueba" component={PruebaCesar} durationInFrames={Math.round(DURACION_CESAR * 60)} fps={60} width={1920} height={1080} />
  </Folder>
);
