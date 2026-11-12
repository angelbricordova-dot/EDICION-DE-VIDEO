import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import guion from "./prueba.json";
import cara from "./cara.json";

// Prueba de 3 min de César (docs/cesar.md): reacciona a un video. Pantalla completa con el video y su
// cámara arriba a la izquierda, sincronizados (la cámara va 0,2 s detrás). Cortes solo en silencios
// (a la vez en las dos fuentes). Zooms suaves: la pantalla se acerca despacio mientras habla el video
// y la ventana de su cámara crece cuando él habla largo. Subtítulos sencillos solo en sus monólogos.

type Guion = { desfase: number; inicioProxy: number; duracion: number; tramos: [number, number][]; subs: { p: string; ini: number; fin: number }[]; habla_video: number[] };
const G = guion as Guion;
const FUENTE = '"Montserrat", sans-serif';
let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Montserrat", url: staticFile("cesar/fuentes/montserrat-latin-700-normal.woff2"), weight: "700" });
  loadFont({ family: "Montserrat", url: staticFile("cesar/fuentes/montserrat-latin-ext-700-normal.woff2"), weight: "700" });
};

// intervalos: agrupa instantes/palabras separados por menos de `hueco` segundos
const agrupar = (pts: { ini: number; fin: number }[], hueco: number) => {
  const out: { ini: number; fin: number }[] = [];
  for (const p of pts) {
    const u = out[out.length - 1];
    if (u && p.ini - u.fin < hueco) u.fin = Math.max(u.fin, p.fin);
    else out.push({ ini: p.ini, fin: p.fin });
  }
  return out;
};
const MONOLOGOS = agrupar(G.subs, 0.9).filter((m) => m.fin - m.ini >= 3);
const NARRACION = agrupar(G.habla_video.map((t) => ({ ini: t, fin: t + 0.4 })), 1.2).filter((m) => m.fin - m.ini >= 2);

// subtítulos: frases de una línea (≤ 30 caracteres) dentro de los monólogos
const FRASES = (() => {
  const out: { texto: string; ini: number; fin: number }[] = [];
  let cur: { texto: string; ini: number; fin: number } | null = null;
  for (const w of G.subs) {
    if (!MONOLOGOS.some((m) => w.ini >= m.ini - 0.01 && w.ini <= m.fin)) continue;
    const p = w.p.trim();
    if (cur && (cur.texto.length + p.length + 1 > 30 || w.ini - cur.fin > 0.6)) {
      out.push(cur);
      cur = null;
    }
    if (!cur) cur = { texto: p, ini: w.ini, fin: w.fin };
    else {
      cur.texto += " " + p;
      cur.fin = w.fin;
    }
    if (/[.?!]$/.test(p)) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  const PROPIOS = ["Bitcoin", "Bitcoins", "César", "FBI", "Ferrari", "Lamborghini", "Binance", "Gemini", "Tesla", "Apple"];
  const limpio = (x: string) => {
    const w = x.split(" ").map((p) => (PROPIOS.some((n) => p.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ]/g, "") === n) ? p : p.toLowerCase()));
    const y = w.join(" ").replace(/[.,]+$/, "");
    return y.charAt(0).toUpperCase() + y.slice(1);
  };
  return out.map((f, i) => ({ ...f, texto: limpio(f.texto), fin: Math.min(f.fin + 0.35, out[i + 1]?.ini ?? f.fin + 0.35) }));
})();

const suave = Easing.bezier(0.45, 0, 0.25, 1);
// 0 → 1 dentro de un intervalo, con rampas de `r` segundos
const dentro = (t: number, xs: { ini: number; fin: number }[], r: number) => {
  let v = 0;
  for (const m of xs) {
    const a = interpolate(t, [m.ini - r, m.ini], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
    const b = interpolate(t, [m.fin, m.fin + r], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
    v = Math.max(v, Math.min(a, b));
  }
  return v;
};

// recorte de la cámara (proxy vertical 720 × 1280): 600 × 675 que sigue su cabeza (scripts/cesar/cara.py)
const REC = { w: 600, h: 675 };
const CARA = cara as [number, number, number][];
const encuadre = (tp: number) => {
  const i = Math.max(0, Math.min(CARA.length - 2, Math.floor(tp * 5)));
  const f = Math.max(0, Math.min(1, tp * 5 - i));
  const cx = CARA[i][1] + (CARA[i + 1][1] - CARA[i][1]) * f;
  const arriba = CARA[i][2] + (CARA[i + 1][2] - CARA[i][2]) * f;
  return { x: Math.max(0, Math.min(720 - REC.w, cx - REC.w / 2)), y: Math.max(0, Math.min(1280 - REC.h, arriba - 90)) };
};

export const PruebaCesar: React.FC = () => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // zoom de la pantalla: se acerca despacio mientras habla el video (hasta 7 %), hacia el centro-arriba
  const zPan = 1 + 0.07 * dentro(t, NARRACION, 1.2) * interpolate(t % 9, [0, 9], [0.85, 1]);
  // ventana de la cámara: 340 px de ancho mientras habla el video; crece a 560 px en sus monólogos
  const k = dentro(t, MONOLOGOS, 0.6);
  const ancho = interpolate(k, [0, 1], [340, 560]);
  const alto = (ancho * REC.h) / REC.w;
  const esc = ancho / REC.w;
  const zCam = 1 + 0.04 * k; // un empujón muy leve dentro de la ventana

  let salida = 0;
  let enc = { x: 0, y: 380 };
  const escenas = G.tramos.map(([a, b], i) => {
    const desde = salida;
    salida += b - a;
    if (t >= desde && t < salida) enc = encuadre(a + G.desfase - G.inicioProxy + (t - desde));
    return (
      <Sequence key={i} from={Math.round(desde * fps)} durationInFrames={Math.round((b - a) * fps)}>
        <AbsoluteFill style={{ transform: `scale(${zPan})`, transformOrigin: "62% 58%" }}>
          <OffthreadVideo src={staticFile("cesar/proxies/pan-40.mp4")} startFrom={Math.round((a - G.inicioProxy) * fps)} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 40,
            width: ancho,
            height: alto,
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.9)",
            background: "#111",
          }}
        >
          <div style={{ position: "absolute", inset: 0, transform: `scale(${zCam})`, transformOrigin: "50% 35%" }}>
            <OffthreadVideo
              src={staticFile("cesar/proxies/cam-40.mp4")}
              startFrom={Math.round((a + G.desfase - G.inicioProxy) * fps)}
              muted
              style={{ position: "absolute", left: -enc.x * esc, top: -enc.y * esc, width: 720 * esc, height: 1280 * esc, maxWidth: "none" }}
            />
          </div>
        </div>
      </Sequence>
    );
  });

  const frase = FRASES.find((f) => t >= f.ini && t < f.fin);
  const op = frase ? Math.min(interpolate(t, [frase.ini, frase.ini + 0.15], [0, 1], { extrapolateRight: "clamp" }), interpolate(t, [frase.fin - 0.15, frase.fin], [1, 0], { extrapolateLeft: "clamp" })) : 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {escenas}
      {frase ? (
        <div style={{ position: "absolute", left: 40, top: 40 + alto + 18, opacity: op, translate: `0 ${(1 - op) * 8}px` }}>
          <div style={{ display: "inline-block", maxWidth: 900, background: "rgba(10,10,12,0.78)", borderRadius: 14, padding: "8px 20px", fontFamily: FUENTE, fontWeight: 700, fontSize: 40, color: "#fff", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{frase.texto}</div>
        </div>
      ) : null}
      <Audio src={staticFile("cesar/mezcla.wav")} />
    </AbsoluteFill>
  );
};

export const DURACION_CESAR = G.duracion;
