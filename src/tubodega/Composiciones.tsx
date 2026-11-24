import { Composition, Folder, Still } from "remotion";
import { GUION_V1, PortadaV1, PromoV1, PropsV1 } from "./V1";
import { DUR_VENTA, PortadaVenta, Venta, PropsVenta } from "./Venta";
import { DUR_COMPLETA, DUR_CORTA, PortadaPresentacion, Presentacion, PropsPresentacion } from "./Presentacion";

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
    {/* Versión A de VENTA (25-nov): la única que se hace ahora */}
    <Composition id="TuBodegaVenta" component={Venta} durationInFrames={Math.round(DUR_VENTA * 30)} fps={30} width={1080} height={1920} defaultProps={{ audio: "tubodega/audio/venta-mezcla.mp3", whatsapp: "+58 426-211-1890" } satisfies PropsVenta} />
    <Still id="TuBodegaVentaPortada" component={PortadaVenta} width={1080} height={1920} />
    {/* Video de presentación (PROMPT_VIDEO_PRESENTACION.md): A vertical, B horizontal, C corta */}
    <Composition id="TuBodegaPresA" component={Presentacion} durationInFrames={Math.round(DUR_COMPLETA * 30)} fps={30} width={1080} height={1920} defaultProps={{ formato: "v", version: "completa", audio: "tubodega/audio/presentacion-mezcla.mp3" } satisfies PropsPresentacion} />
    <Composition id="TuBodegaPresB" component={Presentacion} durationInFrames={Math.round(DUR_COMPLETA * 30)} fps={30} width={1920} height={1080} defaultProps={{ formato: "h", version: "completa", audio: "tubodega/audio/presentacion-mezcla.mp3" } satisfies PropsPresentacion} />
    <Composition id="TuBodegaPresCv" component={Presentacion} durationInFrames={DUR_CORTA * 30} fps={30} width={1080} height={1920} defaultProps={{ formato: "v", version: "corta", audio: "tubodega/audio/presentacion-corta.mp3" } satisfies PropsPresentacion} />
    <Composition id="TuBodegaPresCh" component={Presentacion} durationInFrames={DUR_CORTA * 30} fps={30} width={1920} height={1080} defaultProps={{ formato: "h", version: "corta", audio: "tubodega/audio/presentacion-corta.mp3" } satisfies PropsPresentacion} />
    <Still id="TuBodegaPresPortadaV" component={PortadaPresentacion} width={1080} height={1920} defaultProps={{ formato: "v" as const }} />
    <Still id="TuBodegaPresPortadaH" component={PortadaPresentacion} width={1920} height={1080} defaultProps={{ formato: "h" as const }} />
  </Folder>
);
