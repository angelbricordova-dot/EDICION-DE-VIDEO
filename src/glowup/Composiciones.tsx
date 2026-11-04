import { Composition, Folder, Still } from "remotion";
import { Dia0, DIA0, PropsDia } from "./Dia0";
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
    <Still id="GlowupFicha" component={Ficha} width={1300} height={1200} />
  </Folder>
);
