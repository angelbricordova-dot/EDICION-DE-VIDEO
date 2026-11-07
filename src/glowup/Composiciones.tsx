import { Composition, Folder, Still } from "remotion";
import { Dia0, DIA0, PropsDia } from "./Dia0";
import { Dia1, DIA1, PropsDia1 } from "./Dia1";
import { Dia2, DIA2, PropsDia2 } from "./Dia2";
import { Dia3, DIA3, PropsDia3 } from "./Dia3";
import { Ficha } from "./Ficha";

// Canal glow-up de Angel: Toño y GTA VI (docs/glowup.md).
export const ComposicionesGlowup: React.FC = () => (
  <Folder name="Glowup">
    <Composition
      id="GlowupDia0"
      component={Dia0}
      durationInFrames={Math.round(DIA0.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "glowup/dia0/mezcla.wav" } satisfies PropsDia}
    />
    <Composition
      id="GlowupDia1"
      component={Dia1}
      durationInFrames={Math.round(DIA1.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "glowup/dia1/mezcla.wav" } satisfies PropsDia1}
    />
    <Composition
      id="GlowupDia2"
      component={Dia2}
      durationInFrames={Math.round(DIA2.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "glowup/dia2/mezcla.wav" } satisfies PropsDia2}
    />
    <Composition
      id="GlowupDia3"
      component={Dia3}
      durationInFrames={Math.round(DIA3.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "glowup/dia3/mezcla.wav", encuesta: null } satisfies PropsDia3}
    />
    <Still id="GlowupFicha" component={Ficha} width={1800} height={1200} />
  </Folder>
);
