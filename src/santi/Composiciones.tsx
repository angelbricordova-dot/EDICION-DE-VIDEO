import { Composition, Folder } from "remotion";
import { DURACION_OFERTA, OfertaSanti } from "./Oferta";

// Santi: anuncio DTC estilo Pixar, prueba (docs/santi.md).
export const ComposicionesSanti: React.FC = () => (
  <Folder name="Santi">
    <Composition id="SantiOferta" component={OfertaSanti} durationInFrames={Math.round(DURACION_OFERTA * 30)} fps={30} width={1080} height={1920} />
  </Folder>
);
