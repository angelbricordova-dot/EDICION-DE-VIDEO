import { Folder, Still } from "remotion";
import { Ficha } from "./Ficha";

// Canal glow-up de Angel: Toño y GTA VI (docs/glowup.md).
export const ComposicionesGlowup: React.FC = () => (
  <Folder name="Glowup">
    <Still id="GlowupFicha" component={Ficha} width={1300} height={1200} />
  </Folder>
);
