import { ComposicionesCamis11 } from "./camis11/Composiciones";
import { ComposicionesGlowup } from "./glowup/Composiciones";
import { ComposicionesInmobiliaria } from "./inmobiliaria/Composiciones";
import { ComposicionesKatia } from "./katia/Composiciones";
import { ComposicionesMarryto } from "./marryto/Composiciones";
import { ComposicionesIvm } from "./ivm/Composiciones";
import { ComposicionesPaul } from "./paul/Composiciones";
import { ComposicionesPronosticos } from "./pronosticos/Composiciones";
import { ComposicionesPruebas } from "./prueba/Composiciones";
import { ComposicionesShimon } from "./shimon/Composiciones";
import { ComposicionesPulpo } from "./pulpo/Composiciones";
import { ComposicionesTuBodega } from "./tubodega/Composiciones";
import { ComposicionesTucacas } from "./tucacas/Composiciones";

// Cada cliente o proyecto registra sus composiciones en src/<proyecto>/Composiciones.tsx y
// sale en su propia carpeta de Remotion Studio. Un cliente nuevo: carpeta nueva + una línea aquí.
export const RemotionRoot: React.FC = () => (
  <>
    <ComposicionesMarryto />
    <ComposicionesKatia />
    <ComposicionesShimon />
    <ComposicionesGlowup />
    <ComposicionesPaul />
    <ComposicionesPronosticos />
    <ComposicionesInmobiliaria />
    <ComposicionesTuBodega />
    <ComposicionesCamis11 />
    <ComposicionesTucacas />
    <ComposicionesPulpo />
    <ComposicionesIvm />
    <ComposicionesPruebas />
  </>
);
