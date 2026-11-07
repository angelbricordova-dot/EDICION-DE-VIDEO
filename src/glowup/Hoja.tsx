import React from "react";
import { AbsoluteFill } from "remotion";
import { Nino } from "./Nino";
import { Pose, Tono } from "./Tono";

// Hoja de personajes para revisar poses (solo de trabajo, no se publica).
export const Hoja: React.FC = () => {
  const poses: Pose[] = ["normal", "sostiene", "celebra", "ofrece", "telefono"];
  return (
    <AbsoluteFill style={{ background: "#C9D6DF", flexDirection: "row", alignItems: "flex-end", gap: 40, padding: 60 }}>
      {poses.map((p) => (
        <Tono key={p} pose={p} ancho={420} expresion="feliz" />
      ))}
      <Nino ancho={360} expresion="feliz" pose="normal" />
      <Nino ancho={360} expresion="sorpresa" pose="paga" />
    </AbsoluteFill>
  );
};
