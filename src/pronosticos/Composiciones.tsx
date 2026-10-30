import { Composition, Folder } from "remotion";
import { MILAN_INTER, MilanInter, PropsPronostico } from "./MilanInter";

// Pronósticos de fútbol (docs/pronosticos.md).
export const ComposicionesPronosticos: React.FC = () => (
  <Folder name="Pronosticos">
    <Composition
      id="PronoMilanInter"
      component={MilanInter}
      durationInFrames={Math.round(MILAN_INTER.duracion * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ audio: "pronosticos/mezcla-milan-inter.wav" } satisfies PropsPronostico}
    />
  </Folder>
);
