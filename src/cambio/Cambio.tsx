import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./estilo";
import { Grano, Vineta } from "./elementos";
import { Pregunta } from "./escenas/Pregunta";
import { NoLoHaces } from "./escenas/NoLoHaces";
import { Anillo } from "./escenas/Anillo";
import { Accion, Curiosidad, Intencion, Paneo } from "./escenas/PalabraClave";
import { Capacidad } from "./escenas/Capacidad";
import { Amor, AmorFinal } from "./escenas/Amor";

export const FPS = 30;

// Línea de tiempo en frames (30 fps), siguiendo los cortes del video original.
const ESCENAS: { desde: number; duracion: number; nombre: string; contenido: React.ReactNode }[] = [
  { desde: 0, duracion: 120, nombre: "¿Cómo comunicas…?", contenido: <Pregunta /> },
  { desde: 120, duracion: 75, nombre: "No lo haces / lo demuestras", contenido: <NoLoHaces /> },
  { desde: 195, duracion: 60, nombre: "Anillo de objetos", contenido: <Anillo acercar /> },
  { desde: 255, duracion: 18, nombre: "Acción", contenido: <Accion /> },
  {
    desde: 273,
    duracion: 27,
    nombre: "Paneo 1",
    contenido: (
      <Paneo
        tam={12}
        objetos={[
          { sprite: "claqueta", x: 380, y: 560, rot: -6 },
          { sprite: "planta", x: 680, y: 540, rot: 0 },
          { sprite: "billetes", x: 960, y: 500, rot: 12 },
          { sprite: "corazon", x: 1240, y: 520, rot: 0 },
        ]}
      />
    ),
  },
  { desde: 300, duracion: 18, nombre: "Intención", contenido: <Intencion /> },
  {
    desde: 318,
    duracion: 12,
    nombre: "Paneo 2",
    contenido: (
      <Paneo
        tam={14}
        objetos={[
          { sprite: "control", x: 330, y: 560, rot: -4 },
          { sprite: "moneda", x: 720, y: 540, rot: 0 },
          { sprite: "gato", x: 1080, y: 540, rot: 0 },
        ]}
      />
    ),
  },
  { desde: 330, duracion: 30, nombre: "Curiosidad", contenido: <Curiosidad /> },
  { desde: 360, duracion: 60, nombre: "Dispersión", contenido: <Anillo dispersar /> },
  { desde: 420, duracion: 60, nombre: "Capacidad", contenido: <Capacidad /> },
  { desde: 480, duracion: 45, nombre: "AMOR", contenido: <Amor /> },
  { desde: 525, duracion: 90, nombre: "AMOR final", contenido: <AmorFinal /> },
];

export const DURACION = ESCENAS[ESCENAS.length - 1].desde + ESCENAS[ESCENAS.length - 1].duracion;

export type PropsCambio = {
  /** Ruta dentro de /public de un audio opcional (voz en off o música). */
  audio: string | null;
};

export const Cambio: React.FC<PropsCambio> = ({ audio }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {ESCENAS.map((e) => (
        <Sequence key={e.nombre} from={e.desde} durationInFrames={e.duracion} name={e.nombre}>
          {e.contenido}
        </Sequence>
      ))}
      <Vineta fuerza={0.18} radio={60} />
      <Grano />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
