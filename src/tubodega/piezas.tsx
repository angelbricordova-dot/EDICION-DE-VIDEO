import React from "react";
import { AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";
import { Clave, claveEn, desenfoqueCamara } from "../tucacas/web/escenas";
import type { Frase } from "../tucacas/guiones";

// Piezas compartidas de los videos de TuBodega (marketing/VIDEO_BRIEF.md → Marca).

export const B = {
  verde: "#2F9E6E",
  verdeOscuro: "#227F58",
  verdeClaro: "#ECF8F2",
  texto: "#17201C",
  fondo: "#F4F7F5",
  borde: "#E5EBE8",
  morado: "#B62FC9",
  indigo: "#5B4FE0",
  rojo: "#EF4444",
  ambar: "#D97706",
  blanco: "#FFFFFF",
};
export const JAKARTA = '"Plus Jakarta Sans", system-ui, sans-serif';
export const NUNITO = '"Nunito", system-ui, sans-serif';
export const W = 1080;
export const H = 1920;
// Zonas seguras de TikTok/Reels (GUIONES.md): 220 px arriba, 420 abajo, 90 a la derecha.
export const SEG = { arriba: 220, abajo: 420, der: 90, izq: 60 };

let fuentes = false;
export const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Plus Jakarta Sans", url: staticFile("tubodega/fuentes/jakarta.woff2"), weight: "200 800" });
  loadFont({ family: "Nunito", url: staticFile("tubodega/fuentes/nunito.woff2"), weight: "200 1000" });
};

export const pantalla = (n: string) => staticFile(`tubodega/screens/${n}`);
export const PW = 1170; // pantallas a 3× (390 × 844 pt)
export const PH = 2532;

// ------------------------------------------------------------- fondo

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Fondo verde claro de la marca con burbujas suaves y barras de código que flotan. */
export const Fondo: React.FC<{ t: number; tono?: "claro" | "verde" }> = ({ t, tono = "claro" }) => {
  const verde = tono === "verde";
  return (
    <AbsoluteFill style={{ background: verde ? `linear-gradient(165deg, ${B.verde} 0%, ${B.verdeOscuro} 100%)` : `linear-gradient(170deg, ${B.verdeClaro} 0%, #dff2e8 55%, ${B.fondo} 100%)`, overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 9 }, (_, i) => {
          const r = 120 + rnd(i) * 220;
          const x = rnd(i + 10) * W + Math.sin(t * 0.4 + i) * 40;
          const y = rnd(i + 20) * H + Math.cos(t * 0.3 + i) * 50;
          return <circle key={i} cx={x} cy={y} r={r} fill={verde ? "rgba(255,255,255,0.07)" : "rgba(47,158,110,0.07)"} />;
        })}
        {/* Barras de código de barras que suben despacio. */}
        {Array.from({ length: 6 }, (_, i) => {
          const x = 60 + rnd(i + 40) * (W - 160);
          const ciclo = 14 + rnd(i + 50) * 6;
          const y = H + 100 - (((t + rnd(i + 60) * ciclo) % ciclo) / ciclo) * (H + 400);
          return (
            <g key={`b${i}`} transform={`translate(${x} ${y}) rotate(${-12 + rnd(i) * 24})`} opacity={verde ? 0.12 : 0.1}>
              {[0, 6, 10, 18, 22, 30, 34, 42, 48].map((bx, j) => (
                <rect key={j} x={bx} y={0} width={j % 3 ? 3 : 6} height={56} fill={verde ? "#fff" : B.verde} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- teléfono con cámara

// corte: cambia de pantalla sin deslizar (p. ej. del cuadro congelado al clip del mismo momento).
// congelar: muestra fijo el cuadro `inicio` del clip.
export type Contenido = { t: number; img?: string; clip?: string; inicio?: number; rate?: number; corte?: boolean; congelar?: boolean };

const Pantallazo: React.FC<{ c: Contenido }> = ({ c }) =>
  c.clip && c.congelar ? (
    <Freeze frame={0}>
      <OffthreadVideo src={staticFile(`tubodega/clips/${c.clip}`)} startFrom={Math.round((c.inicio ?? 0) * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH }} />
    </Freeze>
  ) : c.clip ? (
    <Sequence from={Math.round(c.t * FPS)} layout="none">
      <OffthreadVideo src={staticFile(`tubodega/clips/${c.clip}`)} startFrom={Math.round((c.inicio ?? 0) * FPS)} playbackRate={c.rate ?? 1} muted style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH }} />
    </Sequence>
  ) : (
    <Img src={pantalla(c.img ?? "")} style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH }} />
  );

/** Escala base: la pantalla de 1170 px queda de ~432 px de ancho. */
const S0 = 0.37;
const BISEL = 46;

/**
 * Teléfono (maqueta) centrado en (cx, cy). La cámara elige el punto de la pantalla (coordenadas
 * de 1170 × 2532) que queda en el centro y su zoom. Los cambios de pantalla se deslizan hacia arriba.
 */
export const Telefono: React.FC<{
  t: number;
  contenidos: Contenido[];
  camara: Clave[];
  cx?: number;
  cy?: number;
  entra?: number; // 0..1: sube desde abajo
  extra?: React.ReactNode; // capas en coordenadas de la pantalla (toques, círculos)
}> = ({ t, contenidos, camara, cx = W / 2, cy = 900, entra = 1, extra }) => {
  const cam = claveEn(camara, t);
  const S = S0 * cam.escala;
  const blur = desenfoqueCamara(camara, t, S0);
  let idx = 0;
  contenidos.forEach((c, i) => {
    if (t >= c.t) idx = i;
  });
  const c = contenidos[idx];
  const prev = contenidos[idx - 1];
  const des = prev && !c.corte ? prog(t, c.t, c.t + 0.35, easeInOut) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: PW,
        height: PH,
        transformOrigin: "0 0",
        transform: `translate(${cx - cam.x * S}px, ${cy - cam.y * S + (1 - entra) * 1700}px) scale(${S})`,
        filter: blur > 0.4 ? `blur(${(blur / S).toFixed(1)}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${cam.x}px ${cam.y}px`, rotate: `${cam.giro ?? 0}deg` }}>
        <div style={{ position: "absolute", left: -BISEL, top: -BISEL, width: PW + 2 * BISEL, height: PH + 2 * BISEL, borderRadius: 190, background: "#121815", boxShadow: "0 90px 180px rgba(23,32,28,0.35), inset 0 0 0 6px #2b3430" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 150, overflow: "hidden", background: B.fondo }}>
          {prev && des < 1 ? (
            <div style={{ position: "absolute", inset: 0, translate: `0 ${-des * 500}px`, opacity: 1 - des }}>
              <Pantallazo c={prev} />
            </div>
          ) : null}
          <div style={{ position: "absolute", inset: 0, translate: `0 ${(1 - des) * 700}px` }}>
            <Pantallazo c={c} />
          </div>
          {extra}
        </div>
      </div>
    </div>
  );
};

/** Círculo verde que marca dónde tocar (coordenadas de la pantalla). */
export const Toque: React.FC<{ t: number; t0: number; x: number; y: number; r?: number }> = ({ t, t0, x, y, r = 120 }) => {
  const d = t - t0;
  if (d < -0.25 || d > 1.2) return null;
  const k = sp(t, t0 - 0.25, { damping: 12, stiffness: 220, mass: 0.6 });
  const onda = clamp01(d / 0.6);
  const sale = prog(t, t0 + 0.9, t0 + 1.2);
  return (
    <>
      {d > 0 && onda < 1 ? (
        <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `10px solid ${B.verde}`, scale: String(lerp(0.6, 1.6, easeOut(onda))), opacity: 1 - onda }} />
      ) : null}
      <div style={{ position: "absolute", left: x - r * 0.55, top: y - r * 0.55, width: r * 1.1, height: r * 1.1, borderRadius: "50%", background: "rgba(47,158,110,0.28)", border: `8px solid ${B.verde}`, scale: String(k * (d > 0 && d < 0.15 ? 0.85 : 1)), opacity: 1 - sale }} />
    </>
  );
};

// ------------------------------------------------------------- texto

/**
 * Titular centrado: cada palabra sube desde una máscara. `verdes`: palabras en verde.
 * Las líneas que entran después no ocupan espacio hasta su momento: la tarjeta crece con ellas.
 */
export const Titular: React.FC<{ t: number; lineas: { texto: string; t0: number; verdes?: string[] }[]; y: number; tam?: number; hasta?: number; color?: string }> = ({
  t,
  lineas,
  y,
  tam = 92,
  hasta,
  color = B.texto,
}) => {
  const sale = hasta !== undefined ? prog(t, hasta - 0.2, hasta) : 0;
  const t0 = Math.min(...lineas.map((l) => l.t0));
  const carta = sp(t, t0 - 0.05, { damping: 14, stiffness: 220, mass: 0.6 });
  if (t < t0 - 0.05) return null;
  return (
    <div style={{ position: "absolute", left: SEG.izq, right: SEG.der, top: y, display: "flex", justifyContent: "center", opacity: 1 - sale, translate: `0 ${-sale * 30}px` }}>
      {/* Tarjeta blanca detrás: el titular se lee aunque el teléfono pase por detrás. */}
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 40, padding: `${tam * 0.22}px ${tam * 0.42}px ${tam * 0.12}px`, boxShadow: "0 20px 50px rgba(23,32,28,0.16)", scale: String(lerp(0.85, 1, carta)), textAlign: "center" }}>
      {lineas.map((l, li) => {
        const crece = l.t0 <= t0 + 0.01 ? 1 : easeOut(prog(t, l.t0 - 0.1, l.t0 + 0.2));
        return (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: tam * 0.26, overflow: "hidden", padding: `${tam * 0.05 * crece}px 0 ${tam * 0.12 * crece}px`, maxHeight: crece >= 1 ? undefined : tam * 1.04 * crece }}>
          {l.texto.split(" ").map((w, i) => {
            const p = prog(t, l.t0 + i * 0.06, l.t0 + i * 0.06 + 0.4, easeOut);
            const verde = l.verdes?.some((v) => w.replace(/[¿?.,…]/g, "").toLowerCase() === v.toLowerCase());
            return (
              <span key={i} style={{ display: "inline-block", fontFamily: JAKARTA, fontWeight: 800, fontSize: tam, lineHeight: 1.04, letterSpacing: "-0.02em", color: verde ? B.verde : color, translate: `0 ${(1 - p) * tam * 1.3}px`, opacity: p > 0 ? 1 : 0 }}>
                {w}
              </span>
            );
          })}
        </div>
        );
      })}
      </div>
    </div>
  );
};

export const Pastilla: React.FC<{ t: number; t0: number; texto: string; fondo?: string; color?: string; tam?: number; icono?: React.ReactNode }> = ({ t, t0, texto, fondo = B.verde, color = B.blanco, tam = 50, icono }) => {
  const k = sp(t, t0, { damping: 11, stiffness: 230, mass: 0.6 });
  if (k <= 0) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: tam * 0.3, background: fondo, color, fontFamily: JAKARTA, fontWeight: 800, fontSize: tam, lineHeight: 1, padding: `${tam * 0.36}px ${tam * 0.55}px`, borderRadius: 999, boxShadow: "0 14px 34px rgba(23,32,28,0.18)", scale: String(lerp(0.4, 1, k)), opacity: clamp01(k * 2) }}>
      {icono}
      {texto}
    </div>
  );
};

/**
 * Subtítulos quemados (estilo 2): una línea de máx. 22 caracteres en Nunito Black blanca con
 * contorno oscuro. Cada palabra salta al entrar (escala + desenfoque → nítida), la que se está
 * diciendo se pinta verde menta y la palabra clave lleva un marcador verde recto detrás.
 */
export const Subtitulos: React.FC<{ frases: Frase[]; t: number; y?: number }> = ({ frases, t, y = 1500 - 60 }) => {
  const f = frases.find((x) => t >= x.desde - 0.05 && t < x.hasta + 0.12);
  if (!f) return null;
  const bloques: string[] = [];
  let actual = "";
  for (const w of f.texto.split(" ")) {
    const p = actual ? `${actual} ${w}` : w;
    if (p.length > 22 && actual) {
      bloques.push(actual);
      actual = w;
    } else actual = p;
  }
  if (actual) bloques.push(actual);
  const total = bloques.reduce((a, b) => a + b.length, 0);
  const dur = f.hasta - f.desde;
  let ini = f.desde;
  let idx = 0;
  for (let i = 0; i < bloques.length; i++) {
    const d = (dur * bloques[i].length) / total;
    if (t < ini + d || i === bloques.length - 1) {
      idx = i;
      break;
    }
    ini += d;
  }
  const dBloque = (dur * bloques[idx].length) / total;
  const clave = f.clave.toLowerCase().split(" ");
  const ws = bloques[idx].split(" ");
  const inicios: number[] = [];
  let car = 0;
  for (const w of ws) {
    inicios.push(ini + (car / bloques[idx].length) * dBloque * 0.85 - 0.05);
    car += w.length + 1;
  }
  const TAM = 70;
  return (
    <div style={{ position: "absolute", left: SEG.izq, right: SEG.der, top: y, display: "flex", justifyContent: "center", gap: 30, whiteSpace: "nowrap", filter: "drop-shadow(0 10px 18px rgba(23,32,28,0.28))" }}>
      {ws.map((w, i) => {
        const t0 = inicios[i];
        const k = sp(t, t0, { damping: 10, stiffness: 260, mass: 0.5 });
        if (t < t0) return <span key={`${idx}-${i}`} style={{ fontFamily: NUNITO, fontWeight: 900, fontSize: TAM, opacity: 0 }}>{w}</span>;
        const fin = i + 1 < ws.length ? inicios[i + 1] : ini + dBloque;
        const activo = t < fin + 0.05;
        const limpio = w.replace(/[¿?.,…:]/g, "").toLowerCase();
        const esClave = clave.includes(limpio);
        const marcador = easeOut(prog(t, t0 + 0.05, t0 + 0.3));
        const letra = { fontFamily: NUNITO, fontWeight: 900, fontSize: TAM, lineHeight: 1.1 } as const;
        return (
          <span
            key={`${idx}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              opacity: clamp01(k * 2),
              scale: String(lerp(0.55, 1, k) * (activo ? 1.08 : 1)),
              translate: `0 ${(1 - k) * 34 - (activo ? 4 : 0)}px`,
              filter: k < 0.95 ? `blur(${((1 - clamp01(k)) * 8).toFixed(1)}px)` : undefined,
            }}
          >
            {esClave ? <span style={{ position: "absolute", left: -12, right: -12, top: "14%", bottom: "4%", borderRadius: 16, background: B.verde, transformOrigin: "0 50%", scale: `${marcador} 1` }} /> : null}
            <span style={{ ...letra, position: "absolute", left: 0, top: 0, color: B.texto, WebkitTextStroke: `14px ${B.texto}` }}>{w}</span>
            <span style={{ ...letra, position: "relative", color: activo && !esClave ? "#86F3C4" : B.blanco }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Marca TuBodega: ícono + "Tu" en tinta y "Bodega" en verde. */
export const Marca: React.FC<{ t: number; t0: number; tam?: number; claro?: boolean }> = ({ t, t0, tam = 120, claro }) => {
  const a = sp(t, t0, { damping: 11, stiffness: 200, mass: 0.7 });
  const b = prog(t, t0 + 0.15, t0 + 0.55, easeOut);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tam * 0.25 }}>
      <Img src={staticFile("tubodega/brand/icon.svg")} style={{ width: tam * 1.35, height: tam * 1.35, scale: String(a), rotate: `${(1 - a) * -20}deg`, filter: "drop-shadow(0 18px 30px rgba(23,32,28,0.25))" }} />
      <div style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: tam, letterSpacing: "-0.03em", lineHeight: 1, overflow: "hidden", padding: "0 0 0.12em" }}>
        <span style={{ display: "inline-block", color: claro ? B.blanco : B.texto, translate: `0 ${(1 - b) * tam * 1.2}px` }}>Tu</span>
        <span style={{ display: "inline-block", color: claro ? "#bff0d8" : B.verde, translate: `0 ${(1 - b) * tam * 1.2}px` }}>Bodega</span>
      </div>
    </div>
  );
};

export const IconoWhatsApp: React.FC<{ tam: number; color?: string }> = ({ tam, color = "#ffffff" }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2Z" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <path d="M8.6 7.4c.3-.6.6-.6.9-.6h.6c.2 0 .4.1.5.4l.8 1.9c.1.2 0 .5-.1.6l-.6.7c-.1.2-.2.4 0 .6.6 1.1 1.5 2 2.6 2.6.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.5 0 .6-.3 1.3-.8 1.6-.6.4-1.5.6-2.5.2-2.6-1-4.6-3-5.6-5.6-.4-1-.2-1.9.1-2.8Z" fill={color} />
  </svg>
);

export { Clave };
export const camara = (t: number, x: number, y: number, escala: number, giro = 0, lento = false): Clave => ({ t, x, y, escala, giro, lento });
export { easeInOut };
