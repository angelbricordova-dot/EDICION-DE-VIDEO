import { Composition, Folder } from "remotion";
import { DUR_PLAYSTYLES, Playstyles, PropsPlaystyles } from "./Playstyles";

// Pollichris (FC27), docs/pollichris.md.
export const ComposicionesPollichris: React.FC = () => (
  <Folder name="Pollichris">
    <Composition id="PollichrisPlaystyles" component={Playstyles} durationInFrames={Math.round(DUR_PLAYSTYLES * 60)} fps={60} width={1080} height={1920} defaultProps={{ audio: null } satisfies PropsPlaystyles} />
  </Folder>
);
