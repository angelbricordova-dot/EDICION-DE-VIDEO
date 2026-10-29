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
import { GUION_PULPO, PropsPulpo, ShortPulpo } from "./pulpo/Short";
import { PropsPulpoReal, ShortPulpoReal } from "./pulpo/ShortReal";
import { GUION_V1, PortadaV1, PromoV1, PropsV1 } from "./tubodega/V1";
import { G6, PropsReel6, Reel6 } from "./inmobiliaria/Reel6";
import { G3, PropsReel3, Reel3 } from "./inmobiliaria/Reel3";
import { G8, PropsReel8, Reel8 } from "./inmobiliaria/Reel8";
import { G10, PropsReel10, Reel10 } from "./inmobiliaria/Reel10";
import { G12, PropsReel12, Reel12 } from "./inmobiliaria/Reel12";
import { G13, Reel13 } from "./inmobiliaria/Reel13";
import { G14, Reel14 } from "./inmobiliaria/Reel14";
import { G15, Reel15 } from "./inmobiliaria/Reel15";
import { G16, Reel16 } from "./inmobiliaria/Reel16";
import { G17, Reel17 } from "./inmobiliaria/Reel17";
import { G18, Reel18 } from "./inmobiliaria/Reel18";
import { G9, PropsReel9, Reel9 } from "./inmobiliaria/Reel9";

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
        defaultProps={{ audio: "camis11/audio/mezcla.mp3", publi: false } satisfies PropsCamis}
      />
      <Still id="Camis11Portada" component={PortadaCamis11} width={1080} height={1920} />
      <Composition
        id="PulpoFinal"
        component={ShortPulpo}
        durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ limpia: false, audio: "pulpo/audio/mezcla.mp3" } satisfies PropsPulpo}
      />
      <Composition
        id="PulpoLimpio"
        component={ShortPulpo}
        durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ limpia: true, audio: "pulpo/audio/mezcla-limpia.mp3" } satisfies PropsPulpo}
      />
      {([false, true] as const).map((limpia) => (
        <Composition
          key={`real-${limpia}`}
          id={limpia ? "PulpoRealLimpio" : "PulpoRealFinal"}
          component={ShortPulpoReal}
          durationInFrames={Math.round(GUION_PULPO.duracion * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ limpia, audio: limpia ? "pulpo/audio/mezcla-limpia.mp3" : "pulpo/audio/mezcla.mp3" } satisfies PropsPulpoReal}
        />
      ))}
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
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ titulo: "Edición de video con Remotion" }}
      />
      {(["prueba", "hook1", "hook2"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo6${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel6}
          durationInFrames={Math.ceil((G6[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g6/mezcla-${v}.wav`, version: v } satisfies PropsReel6}
        />
      ))}
      {(["hook1", "hook2"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo3${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel3}
          durationInFrames={Math.ceil((G3[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g3/mezcla-${v}.wav`, version: v } satisfies PropsReel3}
        />
      ))}
      {(["hook1", "hook2", "cuerpo"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo8${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel8}
          durationInFrames={Math.ceil((G8[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g8/mezcla-${v}.wav`, version: v } satisfies PropsReel8}
        />
      ))}
      {(["llamada", "intro"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo9${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel9}
          durationInFrames={Math.ceil((G9[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g9/mezcla-${v}.wav`, version: v } satisfies PropsReel9}
        />
      ))}
      {(["hook1", "hook2", "cuerpo"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo10${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel10}
          durationInFrames={Math.ceil((G10[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g10/mezcla-${v}.wav`, version: v } satisfies PropsReel10}
        />
      ))}
      {(["hook1", "hook2", "cuerpo"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo12${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel12}
          durationInFrames={Math.ceil((G12[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g12/mezcla-${v}.wav`, version: v } satisfies PropsReel12}
        />
      ))}
      <Composition
        id="Inmo13Hook"
        component={Reel13}
        durationInFrames={Math.ceil((G13.hook.duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "tiktok/g13/mezcla-hook.wav", version: "hook" }}
      />
      <Composition
        id="Inmo14Sofa"
        component={Reel14}
        durationInFrames={Math.ceil((G14.sofa.duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "tiktok/g14/mezcla-sofa.wav", version: "sofa" }}
      />
      {(["hook1", "cuerpo"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo15${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel15}
          durationInFrames={Math.ceil((G15[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g15/mezcla-${v}.wav`, version: v }}
        />
      ))}
      <Composition
        id="Inmo16Sofa"
        component={Reel16}
        durationInFrames={Math.ceil((G16.sofa.duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "tiktok/g16/mezcla-sofa.wav", version: "sofa" }}
      />
      <Composition
        id="Inmo17Hook"
        component={Reel17}
        durationInFrames={Math.ceil((G17.hook.duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "tiktok/g17/mezcla-hook.wav", version: "hook" }}
      />
      {(["hook1", "hook2"] as const).map((v) => (
        <Composition
          key={v}
          id={`Inmo18${v[0].toUpperCase()}${v.slice(1)}`}
          component={Reel18}
          durationInFrames={Math.ceil((G18[v].duracion + 0.2) * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ audio: `tiktok/g18/mezcla-${v}.wav`, version: v }}
        />
      ))}
    </>
  );
};
