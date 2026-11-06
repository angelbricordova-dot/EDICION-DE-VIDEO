import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, FPS, lerp } from "../comun/animacion";
import videos from "./videos.json";

// Shorts de reacción de Marryto (docs/marryto.md), copiando su formato: franja blanca arriba con el
// título del Short original (la parte clave en rojo), debajo la imagen del Short (de su miniatura de
// YouTube, recortada) a todo el ancho, y abajo su reacción con "YO:". Sin sonido (él pone el audio
// al subirlo). Cada video sale de src/marryto/videos.json (scripts/marryto/analizar.py).

export type Video = {
  inicio: number; fin: number; caraX: number; caraY: number; caraAncho: number; short: string; recorte: [number, number, number, number]; titulo: string; rojo: string;
  // "superpuesto": como el Short original (su reacción a pantalla completa, la imagen encima arriba
  // y el texto blanco con borde debajo, sin "YO:"); por defecto, el formato de franjas.
  estilo?: "superpuesto"; imagen?: string;
  // superpuesto: caja de la imagen [izquierda, arriba, ancho] (por defecto casi todo el ancho) y sin texto
  caja?: [number, number, number]; sinTexto?: boolean; textoY?: number; textoTam?: number; cajaAlto?: number; // con cajaAlto la imagen va en una tarjeta blanca de ese alto
};
export const VIDEOS = videos as unknown as Record<string, Video>;
export type PropsReaccion = { n: string };

const FUENTE = '"Montserrat", "Arial", sans-serif';
const TITULO_H = 190;
let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-800-normal.woff2"), weight: "800" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-ext-800-normal.woff2"), weight: "800" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-700-normal.woff2"), weight: "700" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-ext-700-normal.woff2"), weight: "700" });
};

const Titulo: React.FC<{ texto: string; rojo: string }> = ({ texto, rojo }) => {
  const i = rojo ? texto.indexOf(rojo) : -1;
  const largo = texto.length;
  const tam = largo > 34 ? 62 : largo > 22 ? 70 : 84;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TITULO_H, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: tam, lineHeight: 1.12, color: "#1A1A1A", letterSpacing: "-0.01em", textWrap: "balance" }}>
        {i < 0 ? (
          texto
        ) : (
          <>
            {texto.slice(0, i)}
            <span style={{ color: "#E0262E" }}>{rojo}</span>
            {texto.slice(i + rojo.length)}
          </>
        )}
      </div>
    </div>
  );
};

/** Como el Short original: reacción a pantalla completa, imagen arriba y texto blanco con borde. */
const Superpuesto: React.FC<{ n: string; v: Video }> = ({ n, v }) => {
  // su cara un poco por debajo del texto, como las caras en la referencia
  const s = Math.min(1.25, Math.max(1, 360 / v.caraAncho));
  const vw = 1080 * s;
  const vh = 1920 * s;
  const x = Math.min(0, Math.max(1080 - vw, 540 - v.caraX * s));
  const y = Math.min(0, Math.max(1920 - vh, 1080 - v.caraY * s));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(`marryto/proxies/v${n}.mp4`)} startFrom={Math.round(v.inicio * FPS)} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
      {v.imagen ? (
        <div style={{ position: "absolute", left: v.caja?.[0] ?? 90, top: v.caja?.[1] ?? 40, width: v.caja?.[2] ?? 900, height: v.cajaAlto, background: v.cajaAlto ? "#fff" : undefined, display: "flex", alignItems: "center" }}>
          <Img src={staticFile(v.imagen)} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      ) : (
        // sin imagen aparte: se recorta de la miniatura del Short
        <div style={{ position: "absolute", left: v.caja?.[0] ?? 90, top: v.caja?.[1] ?? 40, width: v.caja?.[2] ?? 900, height: ((v.caja?.[2] ?? 900) * v.recorte[3]) / v.recorte[2], overflow: "hidden" }}>
          <Img
            src={staticFile(`marryto/shorts/${v.short}-oardefault.jpg`)}
            style={{ position: "absolute", maxWidth: "none", width: (1080 * (v.caja?.[2] ?? 900)) / v.recorte[2], height: (1920 * (v.caja?.[2] ?? 900)) / v.recorte[2], left: (-v.recorte[0] * (v.caja?.[2] ?? 900)) / v.recorte[2], top: (-v.recorte[1] * (v.caja?.[2] ?? 900)) / v.recorte[2] }}
          />
        </div>
      )}
      {v.sinTexto ? null : (
        <div style={{ position: "absolute", left: 40, right: 40, top: v.textoY ?? 560, textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: v.textoTam ?? 64, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textWrap: "balance" }}>{v.titulo}</div>
      )}
    </AbsoluteFill>
  );
};

export const Reaccion: React.FC<PropsReaccion> = ({ n }) => {
  cargarFuentes();
  const v = VIDEOS[n];
  if (v.estilo === "superpuesto") return <Superpuesto n={n} v={v} />;
  const t = useCurrentFrame() / FPS;
  const [rx, ry, rw, rh] = v.recorte;
  const imgH = Math.round((1080 * rh) / rw);
  const arriba = TITULO_H + imgH; // donde empieza la reacción
  const alto = 1920 - arriba;
  // Reacción: su cara al centro, a un tamaño parecido en todos (y cubriendo siempre la zona)
  const s = Math.max(alto / 1920 + 0.001, 1, Math.min(1.5, 330 / v.caraAncho));
  const vw = 1080 * s;
  const vh = 1920 * s;
  let x = 540 - v.caraX * s;
  let y = alto * 0.4 - v.caraY * s;
  x = Math.min(0, Math.max(1080 - vw, x));
  y = Math.min(0, Math.max(alto - vh, y));
  const yo = easeOut(clamp01(t / 0.25));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: 0, top: arriba, width: 1080, height: alto, overflow: "hidden", background: "#000" }}>
        <OffthreadVideo src={staticFile(`marryto/proxies/v${n}.mp4`)} startFrom={Math.round(v.inicio * FPS)} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
      </div>
      {/* Imagen del Short original (recortada de la miniatura 1080 × 1920) */}
      <div style={{ position: "absolute", left: 0, top: TITULO_H, width: 1080, height: imgH, overflow: "hidden" }}>
        <Img src={staticFile(`marryto/shorts/${v.short}-oardefault.jpg`)} style={{ position: "absolute", width: (1080 * 1080) / rw, height: (1920 * 1080) / rw, left: (-rx * 1080) / rw, top: (-ry * 1080) / rw, maxWidth: "none" }} />
      </div>
      <Titulo texto={v.titulo} rojo={v.rojo} />
      <div style={{ position: "absolute", left: 0, right: 0, top: arriba + 24, display: "flex", justifyContent: "center" }}>
        <span style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 110, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", lineHeight: 1, scale: String(lerp(1.2, 1, yo)), display: "inline-block" }}>YO:</span>
      </div>
    </AbsoluteFill>
  );
};
