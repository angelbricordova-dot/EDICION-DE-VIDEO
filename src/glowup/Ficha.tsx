import React from "react";
import { AbsoluteFill } from "remotion";
import { Tono } from "./Tono";

/** Hoja del personaje para revisar el dibujo: cuerpo completo y las 4 expresiones. */
export const Ficha: React.FC = () => (
  <AbsoluteFill style={{ background: "#F4F1EA", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 40 }}>
    <Tono ancho={520} />
    <Tono ancho={520} ropa="lavaplatos" expresion="feliz" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Tono soloCabeza ancho={260} expresion="aburrido" />
      <Tono soloCabeza ancho={260} expresion="shock" />
      <Tono soloCabeza ancho={260} expresion="llora" t={0.3} />
      <Tono soloCabeza ancho={260} expresion="feliz" />
      <Tono soloCabeza ancho={260} expresion="aburrido" boca={0.6} />
      <Tono soloCabeza ancho={260} expresion="aburrido" parpadeo={1} />
    </div>
  </AbsoluteFill>
);
