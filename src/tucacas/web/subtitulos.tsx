import React from "react";
import { C, clamp01, easeOut, F, lerp, prog, SEGURA } from "../estilo";
import type { Frase } from "../guiones";

// Subtítulos del comercial web: Nunito (redondeada) y cada palabra entra suave
// (sube, se enfoca y aparece) más o menos cuando se dice.

const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ/]/g, "");

/** Bloques de una sola línea de máximo 28 caracteres (nunca pasa a una segunda línea). */
const bloques = (texto: string) => {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (prueba.length > 28 && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.map((l) => [l]);
};

export const SubtitulosWeb: React.FC<{ frases: Frase[]; t: number }> = ({ frases, t }) => {
  const frase = frases.find((f) => t >= f.desde - 0.05 && t < f.hasta + 0.15);
  if (!frase) return null;
  const partes = bloques(frase.texto);
  const pesos = partes.map((b) => b.join(" ").length);
  const total = pesos.reduce((a, b) => a + b, 0);
  const dur = frase.hasta - frase.desde;
  let inicio = frase.desde;
  let idx = 0;
  for (let i = 0; i < partes.length; i++) {
    const d = (dur * pesos[i]) / total;
    if (t < inicio + d || i === partes.length - 1) {
      idx = i;
      break;
    }
    inicio += d;
  }
  const durBloque = (dur * pesos[idx]) / total;
  const bloque = partes[idx];
  const todas = bloque.join(" ").split(" ");
  const largo = bloque.join(" ").length;
  const clave = frase.clave.split(" ").map(normal);
  const resaltada = todas.map((_, pos) => {
    for (let s = Math.max(0, pos - clave.length + 1); s <= pos; s++) {
      if (clave.every((c, k) => normal(todas[s + k] ?? "") === c)) return true;
    }
    return false;
  });
  // Salida corta al terminar la frase.
  const sale = prog(t, frase.hasta + 0.02, frase.hasta + 0.15);

  let pos = 0;
  let car = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: SEGURA.lados,
        right: SEGURA.lados,
        bottom: SEGURA.abajo + 30,
        textAlign: "center",
        fontFamily: F.subs,
        fontWeight: 800,
        fontSize: 58,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        color: C.blanco,
        opacity: 1 - sale,
        translate: `0 ${-sale * 14}px`,
      }}
    >
      {bloque.map((linea, li) => (
        <div key={`${idx}-${li}`}>
          {linea.split(" ").map((w, wi) => {
            const i = pos++;
            // Cada palabra aparece cuando le toca según su posición en el bloque.
            const t0 = inicio + (car / largo) * durBloque * 0.85 - 0.06;
            car += w.length + 1;
            const p = prog(t, t0, t0 + 0.22, easeOut);
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: wi < linea.split(" ").length - 1 ? "0.26em" : 0,
                  color: resaltada[i] ? C.sol : undefined,
                  opacity: clamp01(p * 1.4),
                  translate: `0 ${(1 - p) * 22}px`,
                  scale: String(lerp(0.9, 1, p)),
                  filter: p < 0.95 ? `blur(${((1 - p) * 6).toFixed(1)}px)` : undefined,
                  textShadow: "0 3px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
