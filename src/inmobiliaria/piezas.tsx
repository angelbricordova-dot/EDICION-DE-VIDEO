import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";

// Piezas de los reels inmobiliarios (docs/inmobiliaria.md): persona recortada a 9:16 con
// cortes y punch-ins, subtítulos de 1–3 palabras, escenas roja y crema, textos 3D y transiciones.

export const W = 1080;
export const H = 1920;
export const INTER = '"Inter", "Helvetica Neue", Arial, sans-serif';

let fuentes = false;
export const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  for (const w of [700, 800, 900]) loadFont({ family: "Inter", url: staticFile(`tiktok/fuentes/inter-${w}.woff2`), weight: String(w) });
};

export type Corte = { src: number; dur: number; out: number };
export type Palabra = { p: string; ini: number; fin: number };

/** Busca la n-ésima aparición de una palabra (sin signos ni mayúsculas) y devuelve su inicio. */
export const marca = (palabras: Palabra[], texto: string, n = 1) => {
  const limpio = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;…"]/g, "");
  let k = 0;
  for (const w of palabras) if (limpio(w.p) === limpio(texto) && ++k === n) return w.ini;
  throw new Error(`No encontré "${texto}" (${n})`);
};

// ------------------------------------------------------------- persona

/** Recorte 9:16 del bruto horizontal. La cara (cx, cy en el bruto) queda en (540, 800). */
export const Persona: React.FC<{
  t: number;
  video: string;
  cortes: Corte[];
  zoom: (t: number, indiceCorte: number) => number;
  cara: { x: number; y: number };
  altoBruto?: number;
}> = ({ t, video, cortes, zoom, cara, altoBruto = 1080 }) => {
  const base = H / altoBruto;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {cortes.map((c, i) => {
        const desde = Math.round(c.out * FPS);
        const hasta = Math.round((c.out + c.dur) * FPS);
        if (hasta <= desde) return null;
        const S = base * zoom(t, i);
        return (
          <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
            <OffthreadVideo
              src={staticFile(video)}
              startFrom={Math.round(c.src * FPS)}
              muted
              style={{ position: "absolute", left: 540 - cara.x * S, top: 800 - cara.y * S, width: 1920 * S, height: altoBruto * S, maxWidth: "none" }}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- subtítulos

/** Bloques de 1–3 palabras (máx. ~16 caracteres), cortando en los signos de puntuación. */
export const bloques = (palabras: Palabra[]) => {
  const out: { texto: string; ini: number; fin: number }[] = [];
  let actual: Palabra[] = [];
  const cerrar = () => {
    if (!actual.length) return;
    out.push({ texto: actual.map((w) => w.p).join(" ").replace(/[.,;:]+$/, ""), ini: actual[0].ini, fin: actual[actual.length - 1].fin });
    actual = [];
  };
  // Un bloque no termina en una palabra de enlace ("del", "que", "la"…): esa pasa al siguiente.
  const enlace = /^(el|la|los|las|un|una|de|del|al|a|en|y|o|que|lo|le|se|es|tu|mi|por|con|sin|para)$/i;
  for (const w of palabras) {
    const largo = [...actual, w].map((x) => x.p).join(" ").length;
    if (actual.length && (actual.length >= 3 || largo > 16)) {
      const ultima = actual[actual.length - 1];
      if (actual.length > 1 && enlace.test(ultima.p)) {
        actual.pop();
        cerrar();
        actual.push(ultima);
      } else cerrar();
    }
    actual.push(w);
    if (/[.,;:?!…]$/.test(w.p)) cerrar();
  }
  cerrar();
  // Cada bloque dura hasta que empieza el siguiente (sin huecos ni solapes).
  let previo = -1;
  for (let i = 0; i < out.length; i++) {
    out[i].ini = Math.max(out[i].ini, previo + 0.05);
    previo = out[i].ini;
    if (i + 1 < out.length) out[i].fin = out[i + 1].ini;
  }
  return out;
};

/** Subtítulo blanco en negrita con contorno y sombra; cambia de golpe, pegado a la voz. */
export const Subtitulo: React.FC<{ t: number; lista: ReturnType<typeof bloques>; y?: number; ocultar?: (t: number) => boolean }> = ({ t, lista, y = 1300, ocultar }) => {
  const b = lista.find((x) => t >= x.ini - 0.03 && t < x.fin);
  if (!b || ocultar?.(t)) return null;
  const estilo: React.CSSProperties = { fontFamily: INTER, fontWeight: 800, fontSize: 64, lineHeight: 1.1, letterSpacing: "-0.01em", whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))" }}>
        <span style={{ ...estilo, position: "absolute", inset: 0, color: "#000", WebkitTextStroke: "10px #000" }}>{b.texto}</span>
        <span style={{ ...estilo, position: "relative", color: "#fff" }}>{b.texto}</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------- textos 3D

const PALETAS = {
  verde: { arriba: "#B6FF6A", abajo: "#25C935", borde: "#0B3D0B" },
  rojo: { arriba: "#FF8A7A", abajo: "#E3141F", borde: "#470006" },
  blanco: { arriba: "#FFFFFF", abajo: "#E9E9E9", borde: "#111" },
};

/** Texto grueso con degradado, contorno oscuro y relieve (como "PRONTO?" de la referencia). */
export const Texto3D: React.FC<{ texto: string; tam: number; color?: keyof typeof PALETAS; peso?: number; mayus?: boolean }> = ({ texto, tam, color = "verde", peso = 900, mayus = true }) => {
  const c = PALETAS[color];
  const base: React.CSSProperties = { fontFamily: INTER, fontWeight: peso, fontSize: tam, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", textTransform: mayus ? "uppercase" : "none" };
  const relieve = Math.round(tam * 0.07);
  return (
    <div style={{ position: "relative", display: "inline-block", filter: `drop-shadow(0 ${tam * 0.12}px ${tam * 0.14}px rgba(0,0,0,0.45))` }}>
      {/* Relieve: el contorno repetido hacia abajo. */}
      {Array.from({ length: relieve }, (_, i) => (
        <span key={i} style={{ ...base, position: "absolute", left: 0, top: i + 1, color: c.borde, WebkitTextStroke: `${tam * 0.12}px ${c.borde}` }}>
          {texto}
        </span>
      ))}
      <span style={{ ...base, position: "absolute", left: 0, top: 0, color: c.borde, WebkitTextStroke: `${tam * 0.12}px ${c.borde}` }}>{texto}</span>
      <span style={{ ...base, position: "relative", background: `linear-gradient(180deg, ${c.arriba} 0%, ${c.abajo} 75%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{texto}</span>
    </div>
  );
};

/** Aparición con rebote (escala 1.35 → 1 y desenfoque breve). */
export const Pop: React.FC<{ t: number; t0: number; children: React.ReactNode; desde?: number }> = ({ t, t0, children, desde = 1.35 }) => {
  if (t < t0) return null;
  const k = sp(t, t0, { damping: 11, stiffness: 260, mass: 0.6 });
  return <div style={{ scale: String(lerp(desde, 1, k)), opacity: clamp01((t - t0) / 0.06), filter: t - t0 < 0.08 ? "blur(3px)" : undefined }}>{children}</div>;
};

/** Tarjeta blanca redondeada con sombra desplazada (la de "3.000€"). */
export const Tarjeta: React.FC<{ children: React.ReactNode; tam?: number; color?: string }> = ({ children, tam = 92, color = "#161616" }) => (
  <div style={{ display: "inline-block", background: "#fff", borderRadius: tam * 0.3, padding: `${tam * 0.18}px ${tam * 0.38}px`, boxShadow: `${tam * 0.16}px ${tam * 0.2}px 0 rgba(0,0,0,0.28), 0 0 0 4px rgba(0,0,0,0.85)`, fontFamily: INTER, fontWeight: 800, fontSize: tam, lineHeight: 1.05, color, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// ------------------------------------------------------------- fondos

/** Fondo rojo con cuadrícula blanca y viñeta en anillos. */
export const FondoRojo: React.FC<{ t: number }> = ({ t }) => {
  const celda = 118;
  const mov = (t * 12) % celda;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 48%, #F0202A 0%, #C80F18 45%, #6E0207 100%)", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -celda,
          translate: `0 ${mov}px`,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.55) 0 6px, transparent 6px), linear-gradient(90deg, rgba(255,255,255,0.55) 0 6px, transparent 6px)`,
          backgroundSize: `${celda}px ${celda}px`,
          WebkitMaskImage: "radial-gradient(ellipse 52% 36% at 50% 47%, #000 55%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 52% 36% at 50% 47%, #000 55%, transparent 100%)",
          filter: "drop-shadow(10px 14px 6px rgba(70,0,0,0.45))",
        }}
      />
      <AbsoluteFill style={{ background: "repeating-radial-gradient(ellipse 80% 60% at 50% 48%, rgba(0,0,0,0) 0 120px, rgba(0,0,0,0.07) 120px 160px)" }} />
    </AbsoluteFill>
  );
};

/** Papel crema con cuadrícula fina y textura. */
export const FondoCrema: React.FC = () => (
  <AbsoluteFill style={{ background: "#F4E2C2", overflow: "hidden" }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <filter id="papel">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.18  0 0 0 0.22 0" />
      </filter>
      <filter id="manchas">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={9} />
        <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0.35 -0.08" />
      </filter>
      <rect width={W} height={H} filter="url(#manchas)" />
      <rect width={W} height={H} filter="url(#papel)" />
    </svg>
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(120,92,52,0.2) 0 2px, transparent 2px), linear-gradient(90deg, rgba(120,92,52,0.2) 0 2px, transparent 2px)", backgroundSize: "54px 54px" }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------- transiciones

/**
 * Capa de gráfico entre t0 y t1. Entra con una tarjeta blanca que crece desde la cara
 * ("tarjeta") o con un óvalo que se cierra sobre la persona ("ovalo"); sale con un óvalo que
 * se abre y deja ver a la persona.
 */
export const Escena: React.FC<{ t: number; t0: number; t1: number; entrada?: "tarjeta" | "ovalo"; children: React.ReactNode }> = ({ t, t0, t1, entrada = "ovalo", children }) => {
  const pre = entrada === "tarjeta" ? 0.22 : 0.3;
  if (t < t0 - pre || t > t1 + 0.32) return null;
  // Salida: agujero ovalado que crece desde el centro.
  const sale = prog(t, t1, t1 + 0.32, easeIn);
  let mascara: string | undefined;
  if (sale > 0) {
    const r = lerp(0, 140, sale);
    mascara = `radial-gradient(ellipse ${r * 0.62}% ${r * 0.42}% at 50% 45%, transparent 98%, #000 100%)`;
  }
  if (entrada === "tarjeta") {
    // La tarjeta blanca nace sobre la cara y, al llegar t0, el fondo se abre desde ella.
    const k = prog(t, t0 - pre, t0, easeOut);
    if (t < t0) {
      return (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 540 - 220, top: 800 - 70, width: 440, height: 140, borderRadius: 34, background: "#fff", scale: String(lerp(0.2, 1, k)), boxShadow: "0 0 40px 10px rgba(255,255,255,0.65)", filter: "blur(2px)" }} />
        </AbsoluteFill>
      );
    }
    const abre = prog(t, t0, t0 + 0.28, easeOut);
    const clip = abre < 1 ? `circle(${lerp(8, 120, abre)}% at 50% 42%)` : undefined;
    return <AbsoluteFill style={{ clipPath: clip, WebkitMaskImage: mascara, maskImage: mascara }}>{children}</AbsoluteFill>;
  }
  // Entrada en óvalo: la persona queda dentro de un óvalo que se cierra.
  const cierra = prog(t, t0 - pre, t0, easeInOut);
  const entra = cierra < 1 ? `radial-gradient(ellipse ${lerp(140, 0, cierra) * 0.62}% ${lerp(140, 0, cierra) * 0.42}% at 50% 45%, transparent 98%, #000 100%)` : undefined;
  const m = mascara ?? entra;
  return <AbsoluteFill style={{ WebkitMaskImage: m, maskImage: m }}>{children}</AbsoluteFill>;
};

export { clamp01, easeIn, easeInOut, easeOut, lerp, prog, sp };
