import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, lerp } from "../comun/animacion";
import videos from "./videos.json";
import emojisApple from "./emojis.json";

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
  ojosY?: number; frenteY?: number; ojosX?: number; // scripts/marryto/ojos.py: lo más alto que llegan ojos y frente en el tramo
  audio?: string; audioDesde?: number; // audio sincronizado (p. ej. el 36); por defecto los videos van sin sonido
  // Varias tomas seguidas con corte seco (como el Short original, 47 y 52): cada una desde `desde` del
  // bruto durante `dur` s, con su texto. `fundido` (48): a partir de `t` la escena se funde en `dur` s
  // con la habitación vacía (el plano del bruto en `desde`), "para que desaparezca".
  tomas?: { desde: number; dur: number; titulo?: string }[];
  fundido?: { desde: number; t: number; dur: number };
  duracion?: number; // fija la duración (p. ej. la de la canción)
  zoomMax?: number; separacion?: number; // 11-nov: imagen grande como la referencia → su cara más abajo y con más zoom
  proxyHD?: boolean; // con mucho zoom: proxy 1440×2560 (v<n>-hd.mp4) para que no se vea borroso
  // 13-nov (referencia del 43): SIN zoom, el video se DESPLAZA hacia abajo y la imagen va grande a todo
  // el ancho arriba (tapa la parte de arriba del video); su frente queda debajo del texto con separación
  desplazar?: boolean; escalaVideo?: number;
  bajar?: number; // baja imagen y texto juntos (8-nov: "no tan arriba", hacia media altura de las placas de YouTube)
  textos?: { t: number; hasta?: number; x: number; y: number; texto: string; tam?: number; fondo?: string; color?: string; estilo?: "titulo" | "plano"; colores?: Record<string, string> }[]; // textos libres que aparecen en su segundo (centro x, y), p. ej. los años del 115–117
  rsvp?: { texto: string; ppm?: number; y?: number; desde?: number; rotulo?: string }; // rotulo: lo que pone debajo (el Short dice "300PPM" aunque va a ~355) // lectura rápida (168–169): una palabra cada 60/ppm s, letra central en naranja
  outro?: { video?: string; desde: number; dur: number; titulo?: string; audio?: string; audioTodo?: string; fotos?: { src: string; t: number; texto: string; asp?: number; color?: string }[];
    // 189–190 (video de arriba en mala calidad): sus letras rehechas en Cocogoose. `tapar`: zonas del video
    // (x, y, ancho, alto en 1080 × 1920) que se tapan con el propio video muy desenfocado mientras dure [t, hasta).
    tapar?: { t: number; hasta?: number; x: number; y: number; w: number; h: number }[];
    letras?: { t: number; hasta?: number; y: number; x?: number; texto: string; tam?: number; pastilla?: boolean; caja?: [number, number, number, number] }[] }; // x: centro horizontal (por defecto, centrado) // caja [x, y, ancho, alto]: recuadro blanco que tapa la etiqueta del video (191–192) // fotos: pase de fotos (t desde el inicio del outro) con fundido a negro en cada cambio, como el Short 179-181 // audioTodo: una pista para todo el video (su voz + música) // 189–190: tras su reacción, el video del Short a pantalla con su sonido
  intro?: { video: string; dur: number; titulo: string; videoY?: number; videoAlto?: number; partes?: { desde: number; dur: number; titulo: string; imagen: string }[] }; // 159–160: primero el video del Short a pantalla (como la referencia) y después su reacción
  pastillasFondo?: string; pastillasColor?: string; // color de las pastillas (157–158: el de su camiseta)
  coco?: boolean; // 21-nov: letras Cocogoose llamativas, emojis de iPhone y banda negra detrás de la imagen (sin cortes arriba)
  rsvpCuenta?: boolean;
  capa?: string; // PNG transparente 1080 × 1920 encima de todo (textos libres sobre el video, p. ej. 115–117); no mueve nada
  sinImagen?: boolean; // solo texto: ni imagen ni miniatura del Short (p. ej. "💛 ARRYT 💛")
  textoColor?: string; // color del texto (por defecto blanco con borde negro)
  etiqueta?: string; etiquetaY?: number; lista?: [string[], string[]]; listaY?: number; listaTam?: number; listaMargen?: number; // distancia de la lista a los bordes (zona segura de las redes)
  // pastillas amarillas a los dos lados (p. ej. "Dale like sin utilizar: Pies, Codo…"), en zigzag
  pastillas?: [string[], string[]]; pastillasY?: number; pastillasPaso?: number; pastillasMargen?: number;
};
export const VIDEOS = videos as unknown as Record<string, Video>;

// Reuniones con Marryto: videos de 6–7 s (máx. 10 en casos puntuales) que empiezan ya actuando.
// Cámara rápida (hasta 1,5x) SOLO en los marcados con "rapido" (~20 % de los videos, 7-nov); los
// demás a velocidad normal y se corta el final.
export const OBJETIVO = 6.5;
export const OBJETIVO_NORMAL = 7;
export const MAX_VEL = 1.5;
export const tiempo = (v: Video) => {
  if (v.tomas) return { vel: 1, usado: 0, dur: v.duracion ?? v.tomas.reduce((a, b) => a + b.dur, 0) };
  if (v.duracion) return { vel: 1, usado: v.duracion, dur: v.duracion };
  const bruto = v.fin - v.inicio;
  const vel = v.rapido ? Math.min(MAX_VEL, Math.max(1, bruto / OBJETIVO)) : 1;
  const usado = Math.min(bruto, (v.rapido ? OBJETIVO : OBJETIVO_NORMAL) * vel);
  return { vel, usado, dur: usado / vel };
};

/** Dónde acaba lo de arriba (imagen y texto), en píxeles de 1080 × 1920. */
/** Pase de fotos "Niños: / Padres:" (179-181): cada foto a todo lo ancho, su etiqueta encima y un
 * fundido rápido a negro en cada cambio, como el Short original (los cambios caen en el golpe de la música). */
const Diapos: React.FC<{ fotos: { src: string; t: number; texto: string; asp?: number; color?: string }[]; coco: boolean }> = ({ fotos, coco }) => {
  // 24-nov: cada cambio cae JUSTO en el golpe de la música: la foto nueva entra de golpe en el tiempo
  // marcado (con un pequeño "punch" de zoom) y la anterior se apaga a negro en los 0,12 s de antes.
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  let i = 0;
  for (let k = 0; k < fotos.length; k++) if (t >= fotos[k].t) i = k;
  const f = fotos[i];
  const sig = fotos[i + 1]?.t ?? 1e9;
  const op = Math.min(1, (sig - t) / 0.12);
  const p = clamp01((t - f.t) / Math.max(0.5, sig - f.t));
  const golpe = easeOut(clamp01((t - f.t) / 0.3));
  const h = Math.round(1080 * (f.asp ?? 0.7467));
  const top = Math.round(963 - h / 2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: clamp01(op) }}>
        <div style={{ position: "absolute", left: 0, width: 1080, top, height: h, overflow: "hidden" }}>
          <Img src={staticFile(f.src)} style={{ width: 1080, height: h, objectFit: "cover", scale: String(1.07 - 0.07 * golpe + 0.03 * p) }} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: top - 150, textAlign: "center", scale: String(1.12 - 0.12 * golpe), ...(coco ? estiloCoco(96, f.color) : { color: f.color }) }}>{f.texto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Letras rehechas encima de un video ajeno (189–190): tapa las originales con el video desenfocado y
 * pone las nuevas en Cocogoose con borde y sombra (la "pastilla" en recuadro blanco y letra negra). */
const LetrasEncima: React.FC<{ outro: NonNullable<Video["outro"]> }> = ({ outro }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const activa = (x: { t: number; hasta?: number }) => t >= x.t && (x.hasta === undefined || t < x.hasta);
  const zonas = (outro.tapar ?? []).filter(activa);
  return (
    <AbsoluteFill>
      {outro.video
        ? zonas.map((z, i) => {
            // bordes difuminados (40 px) para que la zona tapada se funda con el video
            const m = "linear-gradient(to right, transparent, #000 40px, #000 calc(100% - 40px), transparent), linear-gradient(to bottom, transparent, #000 34px, #000 calc(100% - 34px), transparent)";
            return (
              <div key={i} style={{ position: "absolute", left: z.x - 30, top: z.y - 24, width: z.w + 60, height: z.h + 48, overflow: "hidden", maskImage: m, WebkitMaskImage: m, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}>
                <OffthreadVideo src={staticFile(outro.video!)} muted style={{ position: "absolute", left: -(z.x - 30), top: -(z.y - 24), width: 1080, height: 1920, filter: "blur(34px) brightness(0.93)" }} />
              </div>
            );
          })
        : null}
      {(outro.letras ?? []).filter(activa).map((l, i) => {
        const tam = l.tam ?? 60;
        if (l.caja)
          // etiqueta del video tapada por la nuestra: recuadro blanco del mismo sitio y letra Cocogoose negra
          return (
            <div key={i} style={{ position: "absolute", left: l.caja[0], top: l.caja[1], width: l.caja[2], height: l.caja[3], background: "#fff", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", whiteSpace: "pre-line", fontFamily: COCO, fontSize: tam, lineHeight: 1.15, color: "#111", padding: "0 20px", boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
              <div>{rico(l.texto, tam)}</div>
            </div>
          );
        const p = clamp01((t - l.t) / 0.15);
        return (
          <div key={i} style={{ position: "absolute", left: l.x !== undefined ? l.x - 500 : 50, width: l.x !== undefined ? 1000 : undefined, right: l.x !== undefined ? undefined : 50, top: l.y, translate: "0 -50%", display: "flex", justifyContent: "center", textAlign: "center", whiteSpace: "pre-line", opacity: p, scale: String(0.9 + 0.1 * p) }}>
            {l.pastilla ? (
              <div style={{ background: "#fff", borderRadius: tam * 0.25, padding: `${tam * 0.12}px ${tam * 0.4}px ${tam * 0.16}px`, fontFamily: COCO, fontSize: tam, lineHeight: 1.15, color: "#111", boxShadow: "0 6px 18px rgba(0,0,0,0.45)" }}>{rico(l.texto, tam)}</div>
            ) : (
              <div style={estiloCoco(tam)}>{rico(l.texto, tam)}</div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const finEncima = (v: Video) => finEncimaBruto(v) + (v.bajar ?? 0);
const finEncimaBruto = (v: Video) => {
  const ancho = v.caja?.[2] ?? 900;
  const arriba = v.caja?.[1] ?? 40;
  const img = v.imagen ? arriba + (v.cajaAlto ?? (v.imgAspecto ? ancho * v.imgAspecto : 0)) : 0;
  const lineas = v.sinTexto ? 0 : (v.titulo.match(/\n/g)?.length ?? 0) + 1;
  const texto = v.sinTexto ? 0 : (v.textoY ?? 560) + lineas * (v.textoTam ?? 64) * 1.12 + 8;
  const etiqueta = v.etiqueta ? (v.etiquetaY ?? 300) + 2 * 58 * 1.15 + 40 : 0;
  return Math.max(img, texto, etiqueta);
};
export type PropsReaccion = { n: string };

/** "La respuesta es *D*": lo que va entre asteriscos sale en amarillo (como en las referencias). */
const conAcento = (x: string) => x.split(/\*([^*]+)\*/).map((p, i) => (i % 2 ? <span key={i} style={{ color: "#FFD43B" }}>{p}</span> : p));
const FUENTE = '"Montserrat", "Arial", sans-serif';
const COCO = '"Cocogoose", "CocoNum", sans-serif';

// Emojis de iPhone (corrección de Fernando, 21-nov): cada emoji se pinta con el PNG de Apple (public/marryto/emoji)
const HAY = new Set(emojisApple as string[]);
const RE_EMOJI = /(\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic}\uFE0F?)*|[\u{1F1E6}-\u{1F1FF}]{2})/gu;
const nombreEmoji = (e: string) => {
  const cps = [...e].map((c) => c.codePointAt(0)!.toString(16));
  const con = cps.join("-");
  if (HAY.has(con)) return con;
  const sin = cps.filter((c) => c !== "fe0f").join("-");
  return HAY.has(sin) ? sin : null;
};
const conEmojis = (x: React.ReactNode, tam: number): React.ReactNode => {
  if (typeof x !== "string") return x;
  return x.split(RE_EMOJI).map((p, i) => {
    if (i % 2 === 0) return p;
    const n = nombreEmoji(p);
    return n ? <Img key={i} src={staticFile(`marryto/emoji/${n}.png`)} style={{ width: tam * 1.05, height: tam * 1.05, verticalAlign: "-0.18em", margin: "0 0.04em", filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.8))" }} /> : p;
  });
};
/** Texto con emojis de iPhone y acentos de color (*palabra*). */
const rico = (x: string, tam: number) => conAcento(x).map((p, i) => <React.Fragment key={i}>{conEmojis(p, tam)}</React.Fragment>);
/** Estilo de letra llamativo (Cocogoose gordita, trazo negro, sombra dura y halo) para los videos con `coco`. */
const estiloCoco = (tam: number, color = "#fff"): React.CSSProperties => ({
  fontFamily: COCO,
  fontWeight: 400,
  fontSize: tam,
  lineHeight: 1.18,
  color,
  letterSpacing: "0.01em",
  WebkitTextStroke: `${(tam * 0.15).toFixed(1)}px #000`,
  paintOrder: "stroke fill",
  // 23-nov (Fernando, "5ª vez"): sombra que SE VEA: sombra paralela abajo-derecha más allá del trazo + halo oscuro difuso
  textShadow: [
    `${(tam * 0.09).toFixed(1)}px ${(tam * 0.13).toFixed(1)}px 0 rgba(0,0,0,0.95)`,
    `${(tam * 0.12).toFixed(1)}px ${(tam * 0.18).toFixed(1)}px ${(tam * 0.1).toFixed(1)}px rgba(0,0,0,0.8)`,
    `0 0 ${(tam * 0.22).toFixed(1)}px rgba(0,0,0,1)`,
    `0 0 ${(tam * 0.22).toFixed(1)}px rgba(0,0,0,1)`,
    `0 ${(tam * 0.06).toFixed(1)}px ${(tam * 0.45).toFixed(1)}px rgba(0,0,0,0.9)`,
    `0 ${(tam * 0.06).toFixed(1)}px ${(tam * 0.45).toFixed(1)}px rgba(0,0,0,0.9)`,
    `0 ${(tam * 0.1).toFixed(1)}px ${(tam * 0.8).toFixed(1)}px rgba(0,0,0,0.7)`,
  ].join(", "),
});
const TITULO_H = 190;
let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  // la versión de prueba de Cocogoose no trae números ni %: esos caracteres salen de Montserrat ExtraBold
  loadFont({ family: "Cocogoose", url: staticFile("marryto/fuentes/cocogoose.ttf"), weight: "400", unicodeRange: "U+0000-0024, U+0026-002F, U+003A-FFFF" });
  loadFont({ family: "CocoNum", url: staticFile("marryto/fuentes/montserrat-latin-800-normal.woff2"), weight: "400" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-800-normal.woff2"), weight: "800" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-ext-800-normal.woff2"), weight: "800" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-700-normal.woff2"), weight: "700" });
  loadFont({ family: "Montserrat", url: staticFile("marryto/fuentes/montserrat-latin-600-normal.woff2"), weight: "600" }); // textos tipo TikTok (115–117)
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
  const t = useCurrentFrame() / fps;
  let tituloAhora = v.titulo;
  if (v.tomas) {
    let acum = 0;
    for (const tm of v.tomas) {
      if (t >= acum && tm.titulo !== undefined) tituloAhora = tm.titulo;
      acum += tm.dur;
    }
  }
  // su cara un poco por debajo del texto, como las caras en la referencia; y SIEMPRE con los ojos
  // libres (reunión 7-nov: el texto o la imagen pueden tapar el pelo, nunca los ojos). Los ojos
  // quedan ~0,12 del ancho de la cara por encima de su centro (detector de caras de analizar.py).
  let s = Math.min(1.25, Math.max(1, 360 / v.caraAncho));
  let k = 1; // escala de lo de arriba (imagen + texto) si no cabe con la separación
  let x: number;
  let y: number;
  const bajar = v.bajar ?? 0;
  if (v.desplazar && v.frenteY) {
    s = v.escalaVideo ?? 1; // < 1 aleja el video (cuando en el bruto está muy pegado a la cámara)
    const ancho = v.caja?.[2] ?? 1080;
    const finImg = (v.caja?.[1] ?? 0) + ancho * (v.imgAspecto ?? 0);
    const finTodo = finEncimaBruto(v);
    const SEP = v.separacion ?? 40;
    // bajar lo justo para que la frente quede bajo el texto, sin dejar hueco negro entre imagen y video
    y = Math.min(finImg, Math.max(0, finTodo + SEP - v.frenteY * s));
    if (s < 1) y = Math.max(y, 1920 - 1920 * s); // pegado abajo: nunca queda hueco debajo
    x = (1080 - 1080 * s) / 2;
  } else if (v.frenteY) {
    // 9-nov: nunca tapar ojos y SEPARACIÓN con la frente, medido cuadro a cuadro (lo más alto que llega)
    const SEP = v.separacion ?? 60;
    // 13-nov: SIN zoom ("queda raro, se ve demasiado cerca"): por defecto el video a tamaño normal y
    // la imagen se encoge lo necesario para caber encima de su frente
    const SMAX = v.zoomMax ?? 1;
    s = Math.min(s, SMAX);
    const bruto = finEncimaBruto(v);
    const limite = v.frenteY * SMAX - SEP; // lo más abajo que puede acabar lo de arriba
    k = Math.max(0.5, Math.min(1, (limite - bajar) / bruto));
    const fin = bajar + k * bruto;
    s = Math.min(SMAX, Math.max(s, (fin + SEP) / v.frenteY));
    const vh0 = 1920 * s;
    const yCara = 1080 - v.caraY * s; // su cara hacia el centro, como en la referencia
    const yMin = fin + SEP - v.frenteY * s; // la frente por debajo de lo de arriba
    y = Math.min(0, Math.max(1920 - vh0, Math.max(yCara, yMin)));
    x = Math.min(0, Math.max(1080 - 1080 * s, 540 - (v.ojosX ?? v.caraX) * s));
  } else {
    const centro = Math.max(1080, finEncima(v) + 90 + 0.12 * v.caraAncho * s);
    s = Math.max(s, centro / v.caraY); // si hay que bajarle, se amplía para que no quede hueco arriba
    x = Math.min(0, Math.max(1080 - 1080 * s, 540 - v.caraX * s));
    y = Math.min(0, Math.max(1920 - 1920 * s, centro - v.caraY * s));
  }
  const vw = 1080 * s;
  const vh = 1920 * s;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {v.desplazar && !v.coco && (y > 0 || s < 1) ? (
        // la imagen no llega a los bordes: lo que queda arriba del video bajado se rellena con el mismo
        // video ampliado y desenfocado (no se ve una franja negra)
        <AbsoluteFill style={{ filter: "blur(28px) brightness(0.92)", transform: "scale(1.25)", transformOrigin: "50% 0%" }}>
          <OffthreadVideo src={staticFile(`marryto/proxies/v${n}.mp4`)} startFrom={Math.round((v.tomas?.[0]?.desde ?? v.inicio) * fps)} playbackRate={vel} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      ) : null}
      {v.tomas ? (
        v.tomas.map((tm, i) => {
          const desde = v.tomas!.slice(0, i).reduce((a, b) => a + b.dur, 0);
          return (
            <Sequence key={i} from={Math.round(desde * fps)} durationInFrames={Math.round(tm.dur * fps)} layout="none">
              <OffthreadVideo src={staticFile(`marryto/proxies/v${n}${v.proxyHD ? "-hd" : ""}.mp4`)} startFrom={Math.round(tm.desde * fps)} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
            </Sequence>
          );
        })
      ) : (
        <OffthreadVideo src={staticFile(`marryto/proxies/v${n}${v.proxyHD ? "-hd" : ""}.mp4`)} startFrom={Math.round(v.inicio * fps)} playbackRate={vel} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
      )}
      {v.fundido ? (
        <Sequence from={Math.round(v.fundido.t * fps)} layout="none">
          <AbsoluteFill style={{ opacity: Math.min(1, Math.max(0, (t - v.fundido.t) / v.fundido.dur)) }}>
            <OffthreadVideo src={staticFile(`marryto/proxies/v${n}${v.proxyHD ? "-hd" : ""}.mp4`)} startFrom={Math.round(v.fundido.desde * fps)} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
          </AbsoluteFill>
        </Sequence>
      ) : null}
      {v.audio ? <Audio src={staticFile(v.audio)} trimBefore={Math.round((v.audioDesde ?? 0) * fps)} volume={1} /* 18-nov: sin fundido al final; el Short se repite en bucle y la música sigue hasta el último cuadro */ /> : null}
      {v.coco && v.imagen && ((v.caja?.[1] ?? 40) > 0 || (v.caja?.[2] ?? 900) < 1080) ? (
        // banda negra de arriba hasta el final de la imagen: no se ve el video cortado por encima ni a los lados
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: bajar + k * ((v.caja?.[1] ?? 40) + (v.cajaAlto ?? (v.caja?.[2] ?? 900) * (v.imgAspecto ?? 0))), background: "#000" }} />
      ) : null}
      <AbsoluteFill style={{ translate: `0 ${bajar}px`, scale: String(k), transformOrigin: "50% 0" }}>
      {v.imagen ? (
        <div style={{ position: "absolute", left: v.caja?.[0] ?? 90, top: v.caja?.[1] ?? 40, width: v.caja?.[2] ?? 900, height: v.cajaAlto, background: v.cajaAlto && !v.cajaFoto ? "#fff" : undefined, overflow: "hidden", display: "flex", alignItems: "center" }}>
          {v.imagen.endsWith(".mp4") ? (
            // el Short de referencia trae un video arriba (p. ej. 104–107): se reproduce, no es una foto
            <OffthreadVideo src={staticFile(v.imagen)} muted style={{ width: "100%", height: "auto", display: "block" }} />
          ) : (
            <Img src={staticFile(v.imagen)} style={{ width: "100%", height: v.cajaFoto ? "100%" : "auto", objectFit: v.cajaFoto ? "cover" : undefined, display: "block" }} />
          )}
        </div>
      ) : v.etiqueta || v.pastillas || v.sinImagen ? null : (
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
      {v.pastillas
        ? v.pastillas.map((col, i) =>
            col.map((x, k) => (
              <div
                key={`${i}-${k}`}
                style={{
                  position: "absolute",
                  top: (v.pastillasY ?? 480) + k * (v.pastillasPaso ?? 170) + (i === 1 ? (v.pastillasPaso ?? 170) * 0.35 : 0),
                  left: i === 0 ? (v.pastillasMargen ?? 140) + (k % 2) * 30 : undefined,
                  right: i === 1 ? (v.pastillasMargen ?? 140) + ((k + 1) % 2) * 30 : undefined,
                  background: v.pastillasFondo ?? "#FCE7A2",
                  color: v.pastillasColor ?? "#B9771A",
                  fontFamily: FUENTE,
                  fontWeight: 700,
                  fontSize: 56,
                  padding: "8px 26px",
                  borderRadius: 16,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                }}
              >
                {x}
              </div>
            )),
          )
        : null}
      {v.sinTexto ? null : (
        v.coco ? (
          <div style={{ position: "absolute", left: 40, right: 40, top: v.textoY ?? 560, textAlign: "center", whiteSpace: "pre-line", ...estiloCoco(v.textoTam ?? 64, v.textoColor ?? "#fff") }}>{rico(tituloAhora, v.textoTam ?? 64)}</div>
        ) : (
        <div style={{ position: "absolute", left: 40, right: 40, top: v.textoY ?? 560, textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: v.textoTam ?? 64, lineHeight: 1.12, color: v.textoColor ?? "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textWrap: "balance", whiteSpace: "pre-line" }}>{conAcento(tituloAhora)}</div>
        )
      )}
      </AbsoluteFill>
      {(v.textos ?? []).map((x, i) => {
        if (t < x.t || (x.hasta !== undefined && t >= x.hasta)) return null;
        if (x.estilo === "plano")
          // texto blanco con borde negro, sin fondo (pista del 187–188, días del 170–172)
          return (
            v.coco ? (
              <div key={i} style={{ position: "absolute", left: 40, right: 40, top: x.y, translate: "0 -50%", textAlign: "center", whiteSpace: "pre-line", ...estiloCoco(x.tam ?? 64, x.color ?? "#fff") }}>{rico(x.texto, x.tam ?? 64)}</div>
            ) : (
            <div key={i} style={{ position: "absolute", left: 40, right: 40, top: x.y, translate: "0 -50%", textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: x.tam ?? 64, lineHeight: 1.12, color: x.color ?? "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill", whiteSpace: "pre-line" }}>{x.texto}</div>
            )
          );
        if (x.estilo === "titulo")
          // título estilo "Adivina el personaje" (reunión 18-nov): cada línea en su recuadro blanco, pegadas
          // (sin hueco entre líneas), letra blanca con borde negro
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: x.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
              {x.texto.split("\n").map((l, k) => (
                <div key={k} style={{ background: "#fff", padding: "0.02em 0.32em 0.08em", borderRadius: "0.2em", marginTop: k ? "-0.06em" : 0, fontFamily: FUENTE, fontWeight: 700, fontSize: x.tam ?? 64, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "0.13em #000", paintOrder: "stroke fill", whiteSpace: "pre" }}>
                  {/* colores: palabra → color (25-nov: "niños" azul y "padres" rojo en el título del 179–181) */}
                  {x.colores
                    ? l.split(/(\s+)/).map((w, j) => {
                        const c = x.colores![w.toLowerCase().replace(/[^a-záéíóúñü]/g, "")];
                        return c ? <span key={j} style={{ color: c }}>{w}</span> : <React.Fragment key={j}>{w}</React.Fragment>;
                      })
                    : l}
                </div>
              ))}
            </div>
          );
        // pastilla como "Dale like a este vídeo sin usar": rectángulo redondeado del color de su camiseta
        return (
          <div key={i} style={{ position: "absolute", left: x.x, top: x.y, translate: "-50% -50%", background: x.fondo ?? "#8BE9F3", color: x.color ?? "#111", borderRadius: "0.22em", padding: "0.1em 0.42em 0.12em", fontFamily: FUENTE, fontWeight: 700, fontSize: x.tam ?? 64, lineHeight: 1.1, whiteSpace: "pre", boxShadow: "0 3px 10px rgba(0,0,0,.25)" }}>{x.texto}</div>
        );
      })}
      {v.rsvp ? (() => {
        const palabras = v.rsvp.texto.split(/\s+/);
        const ppm = v.rsvp.ppm ?? 300;
        const k = Math.floor(Math.max(0, t - (v.rsvp.desde ?? 0)) * ppm / 60);
        const w = palabras[Math.min(palabras.length - 1, k)];
        const limpio = w.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, "");
        const piv = Math.max(0, Math.min(w.length - 1, w.indexOf(limpio[0] ?? "") + Math.floor((limpio.length - 1) / 3)));
        const Y = v.rsvp.y ?? 620;
        const d0 = v.rsvp.desde ?? 0;
        if (v.coco && t < d0)
          // cuenta atrás como el Short: "¡Empezamos en..." 3, 2, 1
          return (
            <div style={{ position: "absolute", left: 40, right: 40, top: Y - 10, textAlign: "center" }}>
              <div style={estiloCoco(70)}>¡Empezamos en...</div>
              <div style={{ ...estiloCoco(150, "#FFD43B"), marginTop: 10 }}>{Math.max(1, 3 - Math.floor(t / (d0 / 3)))}</div>
            </div>
          );
        return (
          <>
            <div style={{ position: "absolute", left: 60, right: 60, top: Y, height: 150, background: "#0B0B0D", borderTop: "4px solid #fff", borderBottom: "4px solid #fff" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, width: 4, height: 18, background: "#fff" }} />
              <div style={{ position: "absolute", left: "50%", bottom: 0, width: 4, height: 18, background: "#fff" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "pre", ...(v.coco ? { fontFamily: COCO, fontSize: 80, color: "#fff" } : { fontFamily: FUENTE, fontWeight: 700, fontSize: 78, color: "#fff" }) }}>
                {w.slice(0, piv)}<span style={{ color: "#FF7A1A" }}>{w[piv]}</span>{w.slice(piv + 1)}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: Y + 170, textAlign: "center", ...(v.coco ? estiloCoco(70, "#FF8A1F") : { fontFamily: FUENTE, fontWeight: 800, fontSize: 66, color: "#FF7A1A", WebkitTextStroke: "3px #7A2E00", paintOrder: "stroke fill" }) }}>{v.rsvp.rotulo ?? `${ppm}PPM`}</div>
          </>
        );
      })() : null}
      {v.capa ? <Img src={staticFile(v.capa)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} /> : null}
    </AbsoluteFill>
  );
};

export const Reaccion: React.FC<PropsReaccion> = ({ n }) => {
  cargarFuentes();
  const v = VIDEOS[n];
  if (v.estilo === "superpuesto" && v.intro) {
    // como el Short original: primero el video de arriba solo, con su texto; luego la reacción (la música sigue)
    const { fps } = useVideoConfig();
    const ini = Math.round(v.intro.dur * fps);
    const sinAudio = { ...v, audio: undefined };
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Sequence durationInFrames={ini}>
          <AbsoluteFill style={{ background: "#000" }}>
            <OffthreadVideo src={staticFile(v.intro.video)} muted style={{ position: "absolute", left: 0, top: v.intro.videoY ?? 380, width: 1080, height: v.intro.videoAlto ?? 990 }} />
            <div style={{ position: "absolute", left: 40, right: 40, top: (v.intro.videoY ?? 380) - 150, textAlign: "center", whiteSpace: "pre-line", ...(v.coco ? estiloCoco(64) : { fontFamily: FUENTE, fontWeight: 700, fontSize: 64, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }) }}>{v.coco ? rico(v.intro.titulo, 64) : v.intro.titulo}</div>
          </AbsoluteFill>
        </Sequence>
        {v.intro.partes ? (
          // después del video: la reacción por partes, cada una con su foto y su texto (como el Short)
          v.intro.partes.map((pt, i) => {
            const desde = ini + Math.round(v.intro!.partes!.slice(0, i).reduce((a, b) => a + b.dur, 0) * fps);
            const vp: Video = { ...sinAudio, tomas: undefined, inicio: pt.desde, fin: pt.desde + pt.dur, duracion: pt.dur, titulo: pt.titulo, imagen: pt.imagen, sinImagen: false, desplazar: true };
            return (
              <Sequence key={i} from={desde} durationInFrames={Math.round(pt.dur * fps)}>
                <Superpuesto n={n} v={vp} />
              </Sequence>
            );
          })
        ) : (
          <Sequence from={ini}>
            <Superpuesto n={n} v={sinAudio} />
          </Sequence>
        )}
        {v.audio ? <Audio src={staticFile(v.audio)} trimBefore={Math.round((v.audioDesde ?? 0) * fps)} volume={1} /> : null}
      </AbsoluteFill>
    );
  }
  if (v.estilo === "superpuesto" && v.outro) {
    const { fps } = useVideoConfig();
    const ini = Math.round(v.outro.desde * fps);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        {ini > 0 ? (
          <Sequence durationInFrames={ini}>
            <Superpuesto n={n} v={v.outro.audioTodo ? { ...v, audio: undefined } : v} />
          </Sequence>
        ) : null}
        {v.outro.audioTodo ? <Audio src={staticFile(v.outro.audioTodo)} volume={1} /> : null}
        <Sequence from={ini} durationInFrames={Math.round(v.outro.dur * fps)}>
          <AbsoluteFill>
            {v.outro.fotos ? <Diapos fotos={v.outro.fotos} coco={!!v.coco} /> : <OffthreadVideo src={staticFile(v.outro.video!)} muted style={{ width: 1080, height: 1920 }} />}
            {v.outro.tapar || v.outro.letras ? <LetrasEncima outro={v.outro} /> : null}
            {v.outro.titulo ? (
              <div style={{ position: "absolute", left: 60, right: 60, top: 250, textAlign: "center", whiteSpace: "pre-line", ...(v.coco ? estiloCoco(62) : { fontFamily: FUENTE, fontWeight: 700, fontSize: 62, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }) }}>{v.coco ? rico(v.outro.titulo, 62) : v.outro.titulo}</div>
            ) : null}
          </AbsoluteFill>
          {v.outro.audio ? <Audio src={staticFile(v.outro.audio)} volume={1} /> : null}
        </Sequence>
      </AbsoluteFill>
    );
  }
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
        <OffthreadVideo src={staticFile(`marryto/proxies/v${n}${v.proxyHD ? "-hd" : ""}.mp4`)} startFrom={Math.round(v.inicio * fps)} playbackRate={vel} muted style={{ position: "absolute", left: x, top: y, width: vw, height: vh }} />
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
