import { Composition, Folder } from "remotion";
import { G6, PropsReel6, Reel6 } from "./Reel6";
import { G3, PropsReel3, Reel3 } from "./Reel3";
import { G8, PropsReel8, Reel8 } from "./Reel8";
import { G10, PropsReel10, Reel10 } from "./Reel10";
import { G12, PropsReel12, Reel12 } from "./Reel12";
import { G13, Reel13 } from "./Reel13";
import { G14, Reel14 } from "./Reel14";
import { G15, Reel15 } from "./Reel15";
import { G16, Reel16 } from "./Reel16";
import { G17, Reel17 } from "./Reel17";
import { G18, Reel18 } from "./Reel18";
import { G19, Reel19 } from "./Reel19";
import { G9, PropsReel9, Reel9 } from "./Reel9";

// Reels inmobiliarios (docs/inmobiliaria.md): una composición por reel y versión (InmoN<Versión>).
export const ComposicionesInmobiliaria: React.FC = () => (
  <Folder name="Inmobiliaria">
    {(["prueba", "hook1", "hook2"] as const).map((v) => (
      <Composition
        key={v}
        id={`Inmo6${v[0].toUpperCase()}${v.slice(1)}`}
        component={Reel6}
        durationInFrames={Math.ceil((G6[v].duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: `inmobiliaria/g6/mezcla-${v}.wav`, version: v } satisfies PropsReel6}
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
        defaultProps={{ audio: `inmobiliaria/g3/mezcla-${v}.wav`, version: v } satisfies PropsReel3}
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
        defaultProps={{ audio: `inmobiliaria/g8/mezcla-${v}.wav`, version: v } satisfies PropsReel8}
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
        defaultProps={{ audio: `inmobiliaria/g9/mezcla-${v}.wav`, version: v } satisfies PropsReel9}
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
        defaultProps={{ audio: `inmobiliaria/g10/mezcla-${v}.wav`, version: v } satisfies PropsReel10}
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
        defaultProps={{ audio: `inmobiliaria/g12/mezcla-${v}.wav`, version: v } satisfies PropsReel12}
      />
    ))}
    <Composition
      id="Inmo13Hook"
      component={Reel13}
      durationInFrames={Math.ceil((G13.hook.duracion + 0.2) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "inmobiliaria/g13/mezcla-hook.wav", version: "hook" }}
    />
    <Composition
      id="Inmo14Sofa"
      component={Reel14}
      durationInFrames={Math.ceil((G14.sofa.duracion + 0.2) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "inmobiliaria/g14/mezcla-sofa.wav", version: "sofa" }}
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
        defaultProps={{ audio: `inmobiliaria/g15/mezcla-${v}.wav`, version: v }}
      />
    ))}
    <Composition
      id="Inmo16Sofa"
      component={Reel16}
      durationInFrames={Math.ceil((G16.sofa.duracion + 0.2) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "inmobiliaria/g16/mezcla-sofa.wav", version: "sofa" }}
    />
    <Composition
      id="Inmo17Hook"
      component={Reel17}
      durationInFrames={Math.ceil((G17.hook.duracion + 0.2) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "inmobiliaria/g17/mezcla-hook.wav", version: "hook" }}
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
        defaultProps={{ audio: `inmobiliaria/g18/mezcla-${v}.wav`, version: v }}
      />
    ))}
    {(["hook1", "hook2"] as const).map((v) => (
      <Composition
        key={v}
        id={`Inmo19${v[0].toUpperCase()}${v.slice(1)}`}
        component={Reel19}
        durationInFrames={Math.ceil((G19[v].duracion + 0.2) * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: `inmobiliaria/g19/mezcla-${v}.wav`, version: v }}
      />
    ))}
  </Folder>
);
