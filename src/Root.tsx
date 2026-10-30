import { ComposicionesCamis11 } from "./camis11/Composiciones";
import { ComposicionesInmobiliaria } from "./inmobiliaria/Composiciones";
import { ComposicionesIvm } from "./ivm/Composiciones";
import { ComposicionesPronosticos } from "./pronosticos/Composiciones";
import { ComposicionesPruebas } from "./prueba/Composiciones";
import { ComposicionesPulpo } from "./pulpo/Composiciones";
import { ComposicionesTuBodega } from "./tubodega/Composiciones";
import { ComposicionesTucacas } from "./tucacas/Composiciones";

// Cada cliente o proyecto registra sus composiciones en src/<proyecto>/Composiciones.tsx y
// sale en su propia carpeta de Remotion Studio. Un cliente nuevo: carpeta nueva + una línea aquí.
export const RemotionRoot: React.FC = () => (
  <>
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
