import { Composition, Folder, Still } from "remotion";
import { Comercial, GUIONES, Portada, PropsComercial } from "./Comercial";
import { ComercialWeb, GUIONES_WEB, PortadaWeb, PropsWeb } from "./web/ComercialWeb";

// Tu Día en Tucacas (docs/tucacas.md).
export const ComposicionesTucacas: React.FC = () => (
  <Folder name="Tucacas">
    {(["30s", "60s"] as const).map((version) => (
      <Composition
        key={version}
        id={`Tucacas${version}`}
        component={Comercial}
        durationInFrames={GUIONES[version].duracion * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          { version, audio: `tucacas/audio/mezcla-${version}.mp3`, subtitulos: true } satisfies PropsComercial
        }
      />
    ))}
    <Still id="TucacasPortada" component={Portada} width={1080} height={1920} />
    {(["30s", "60s"] as const).map((version) => (
      <Composition
        key={`web-${version}`}
        id={`TucacasWeb${version}`}
        component={ComercialWeb}
        durationInFrames={GUIONES_WEB[version].duracion * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ version, audio: `tucacas/audio/mezcla-web-${version}.mp3`, subtitulos: true } satisfies PropsWeb}
      />
    ))}
    <Still id="TucacasWebPortada" component={PortadaWeb} width={1080} height={1920} />
  </Folder>
);
