import guion30 from "./guion-30s.json";
import guion60 from "./guion-60s.json";

// Guiones del comercial "Tu Día en Tucacas" (BRIEF.md, secciones 4 y 5).
// Los tiempos salen de las tablas del brief. Cuando exista la voz de ElevenLabs,
// los tiempos de cada frase se reemplazan con los de voz.json.

export type Encuadre = {
  /** Archivo en public/tucacas/fotos. */
  foto: string;
  /** Punto de interés (object-position) y zoom final del Ken Burns (máx. 1.08). */
  foco?: string;
  zoom?: number;
  /** Fotos horizontales: escala base mayor para llenar más alto. */
  ancha?: boolean;
  /** Encuadre más cerrado (detalle), aparte del Ken Burns. */
  escala?: number;
  /** Paneo: el punto de interés se desplaza hasta aquí durante el plano. */
  focoFin?: string;
};

export type Plano =
  | { tipo: "foto"; desde: number; hasta: number; encuadre: Encuadre; whip?: boolean; noche?: boolean }
  | { tipo: "iconos"; desde: number; hasta: number; fondo: "foto" | "verde"; encuadre?: Encuadre; iconos: Icono[] }
  | { tipo: "telefono"; desde: number; hasta: number; diaNoche?: [number, number]; whip?: boolean }
  | { tipo: "grabacion"; desde: number; hasta: number; archivo: string; inicio: number }
  | { tipo: "cierre"; desde: number; hasta: number; icono?: boolean };

export type Icono = { tipo: "aire" | "wifi" | "agua"; texto: string; t: number };

/** Texto en pantalla: cada parte separada por " · " sale como una pastilla. */
export type Rotulo = { desde: number; hasta: number; partes: string[] };

/** Frase de la locución: también es el subtítulo. `clave` va en color sol. */
export type Frase = { desde: number; hasta: number; texto: string; clave: string };

export type Efecto = { t: number; sonido: string; gain?: number; pan?: number };

export type Guion = {
  id: string;
  duracion: number;
  planos: Plano[];
  rotulos: Rotulo[];
  frases: Frase[];
  efectos: Efecto[];
};

// Los datos viven en JSON para que el script de sonido (Python) lea los mismos tiempos.
export const GUION_30 = guion30 as unknown as Guion;
export const GUION_60 = guion60 as unknown as Guion;
