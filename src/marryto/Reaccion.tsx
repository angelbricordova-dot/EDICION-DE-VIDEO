import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, lerp } from "../comun/animacion";
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
  cajaFoto?: boolean; // con cajaAlto: la imagen llena la caja (recortada), sin tarjeta blanca
  imgAspecto?: number; // alto / ancho de la imagen (scripts/marryto/medidas.py): para saber dónde acaba
  rapido?: boolean; // cámara rápida (solo ~20 % de los videos, cuando toque: reunión del 7-nov)
  // Shorts sin imagen (p. ej. "tu próximo viaje"): etiqueta blanca redondeada arriba y una lista en
  // dos columnas a los lados del cuerpo (por debajo de la cara, nunca sobre los ojos)
  textoColor?: string; // color del texto (por defecto blanco con borde negro)
  etiqueta?: string; etiquetaY?: number; lista?: [string[], string[]]; listaY?: number; listaTam?: number; listaMargen?: number; // distancia de la lista a los bordes (zona segura de las redes)
};
export const VIDEOS = videos as unknown as Record<string, Video>;

// Reuniones con Marryto: videos de 6–7 s (máx. 10 en casos puntuales) que empiezan ya actuando.
// Cámara rápida (hasta 1,5x) SOLO en los marcados con "rapido" (~20 % de los videos, 7-nov); los
// demás a velocidad normal y se corta el final.
export const OBJETIVO = 6.5;
export const OBJETIVO_NORMAL = 7;
export const MAX_VEL = 1.5;
export const tiempo = (v: Video) => {
  const bruto = v.fin - v.inicio;
  const vel = v.rapido ? Math.min(MAX_VEL, Math.max(1, bruto / OBJETIVO)) : 1;
  const usado = Math.min(bruto, (v.rapido ? OBJETIVO : OBJETIVO_NORMAL) * vel);
  return { vel, usado, dur: usado / vel };
};

/** Dónde acaba lo de arriba (imagen y texto), en píxeles de 1080 × 1920. */
export const finEncima = (v: Video) => {
  const ancho = v.caja?.[2] ?? 900;
  const arriba = v.caja?.[1] ?? 40;
  const img = v.imagen ? arriba + (v.cajaAlto ?? (v.imgAspecto ? ancho * v.imgAspecto : 0)) : 0;
  const lineas = v.sinTexto ? 0 : (v.titulo.match(/\n/g)?.length ?? 0) + 1;
  const texto = v.sinTexto ? 0 : (v.textoY ?? 560) + lineas * (v.textoTam ?? 64) * 1.12 + 8;
  const etiqueta = v.etiqueta ? (v.etiquetaY ?? 300) + 2 * 58 * 1.15 + 40 : 0;
  return Math.max(img, texto, etiqueta);
};
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
  const { fps } = useVideoConfig();
  const { vel } = tiempo(v);
  // su cara un poco por debajo del texto, como las caras en la referencia; y SIEMPRE con los ojos
  // libres (reunión 7-nov: el texto o la imagen pueden tapar el pelo, nunca los ojos). Los ojos
  // quedan ~0,12 del ancho de la cara por encima de su centro (detector de caras de analizar.py).
  let s = Math.min(1.25, Math.max(1, 360 / v.caraAncho));
  const centro = Math.max(1080, finEncima(v) + 90 + 0.12 * v.caraAncho * s);
  s = Math.max(s, centro / v.caraY); // si hay que bajarle, se amplía para que no quede hueco arriba
  const vw = 1080 * s;
  const vh = 1920 * s;
  const x = Math.min(0, Math.max(1080 - vw, 540 - v.caraX * s));
  const y = Math.min(0, Math.max(1920 - vh, centro - v.caraY * s));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(`marryto/proxies/v${n}.mp4`)} startFrom={Math.round(v.inicio * fps)} playbackRate={vel} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
      {v.imagen ? (
        <div style={{ position: "absolute", left: v.caja?.[0] ?? 90, top: v.caja?.[1] ?? 40, width: v.caja?.[2] ?? 900, height: v.cajaAlto, background: v.cajaAlto && !v.cajaFoto ? "#fff" : undefined, overflow: "hidden", display: "flex", alignItems: "center" }}>
          <Img src={staticFile(v.imagen)} style={{ width: "100%", height: v.cajaFoto ? "100%" : "auto", objectFit: v.cajaFoto ? "cover" : undefined, display: "block" }} />
        </div>
      ) : v.etiqueta ? null : (
        // sin imagen aparte: se recorta de la miniatura del Short
        <div style={{ position: "absolute", left: v.caja?.[0] ?? 90, top: v.caja?.[1] ?? 40, width: v.caja?.[2] ?? 900, height: ((v.caja?.[2] ?? 900) * v.recorte[3]) / v.recorte[2], overflow: "hidden" }}>
          <Img
            src={staticFile(`marryto/shorts/${v.short}-oardefault.jpg`)}
            style={{ position: "absolute", maxWidth: "none", width: (1080 * (v.caja?.[2] ?? 900)) / v.recorte[2], height: (1920 * (v.caja?.[2] ?? 900)) / v.recorte[2], left: (-v.recorte[0] * (v.caja?.[2] ?? 900)) / v.recorte[2], top: (-v.recorte[1] * (v.caja?.[2] ?? 900)) / v.recorte[2] }}
          />
        </div>
      )}
      {v.etiqueta ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: v.etiquetaY ?? 300, display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: 880, background: "#fff", borderRadius: 26, padding: "16px 30px", textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: "#111", textWrap: "balance" }}>{v.etiqueta}</div>
        </div>
      ) : null}
      {v.lista
        ? v.lista.map((col, i) => (
            <div key={i} style={{ position: "absolute", top: v.listaY ?? 1180, left: i === 0 ? (v.listaMargen ?? 40) : undefined, right: i === 1 ? (v.listaMargen ?? 40) : undefined, fontFamily: FUENTE, fontWeight: 700, fontSize: v.listaTam ?? 60, lineHeight: 1.22, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textAlign: "left" }}>
              {col.map((x) => (
                <div key={x}>{x}</div>
              ))}
            </div>
          ))
        : null}
      {v.sinTexto ? null : (
        <div style={{ position: "absolute", left: 40, right: 40, top: v.textoY ?? 560, textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: v.textoTam ?? 64, lineHeight: 1.12, color: v.textoColor ?? "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textWrap: "balance", whiteSpace: "pre-line" }}>{v.titulo}</div>
      )}
    </AbsoluteFill>
  );
};

export const Reaccion: React.FC<PropsReaccion> = ({ n }) => {
  cargarFuentes();
  const v = VIDEOS[n];
  if (v.estilo === "superpuesto") return <Superpuesto n={n} v={v} />;
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const { vel } = tiempo(v);
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
        <OffthreadVideo src={staticFile(`marryto/proxies/v${n}.mp4`)} startFrom={Math.round(v.inicio * fps)} playbackRate={vel} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
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
