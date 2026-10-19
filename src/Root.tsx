import { Composition, Still } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Cambio, DURACION, FPS, PropsCambio } from "./cambio/Cambio";
import { Prueba } from "./prueba/Prueba";
import timelinePrueba from "./prueba/timeline.json";
import { Explicador, PropsExplicador } from "./ivm/Explicador";
import timelineIvm from "./ivm/timeline.json";
import { Comercial, GUIONES, Portada, PropsComercial } from "./tucacas/Comercial";
import { ComercialWeb, GUIONES_WEB, PortadaWeb, PropsWeb } from "./tucacas/web/ComercialWeb";
import { GUION_CAMIS, PortadaCamis11, PropsCamis, ReelCamis11 } from "./camis11/Reel";

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
        id="IvmExplicador"
        component={Explicador}
        durationInFrames={timelineIvm.duration * timelineIvm.fps}
        fps={timelineIvm.fps}
        width={1920}
        height={1080}
        defaultProps={{ audio: "audio/ivm-explicador.mp3", subtitulos: true } satisfies PropsExplicador}
      />
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
      <Composition
        id="Camis11"
        component={ReelCamis11}
        durationInFrames={GUION_CAMIS.duracion * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "camis11/audio/mezcla.mp3", publi: true } satisfies PropsCamis}
      />
      <Still id="Camis11Portada" component={PortadaCamis11} width={1080} height={1920} />
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
