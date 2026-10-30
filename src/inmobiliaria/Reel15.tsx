import { crearReel, CorteReel } from "./Plantilla";
import hook1 from "./g15-hook1.json";
import cuerpo from "./g15-cuerpo.json";

// Reel 15 "pisos baratos en subasta en 60 segundos" (guion 15). Cuenta atrás de 60 s arriba a la
// derecha (el cliente lo pidió en la grabación), etiqueta de precio por ciudad con la cifra que
// dice, las trampas en píldoras y el CTA (GUÍA). No hay fotos de los pisos: van solo las cifras.

export const G15: Record<"hook1" | "cuerpo", CorteReel> = { hook1: hook1 as CorteReel, cuerpo: cuerpo as CorteReel };

export const Reel15 = crearReel({
  video: "inmobiliaria/g15/proxy.mp4",
  cara: { x: 720, y: 1150 },
  versiones: G15,
  titulos: {
    hook1: { blanco: "Pisos más baratos en subasta", amarillo: "EN 60 SEGUNDOS", en: "segundos" },
    cuerpo: { blanco: "Pisos en subasta", amarillo: "MÁS BARATOS DE ESPAÑA" },
  },
  eventos: [
    { tipo: "precio", en: "Cuenca,", lugar: "Cuenca", precio: "< 15.000 €", detalle: "Casa en subasta", hasta: "ahora" },
    { tipo: "precio", en: "Alicante", lugar: "Alicante", precio: "< 7.000 €", detalle: "Casa en subasta", hasta: "Madrid," },
    { tipo: "precio", en: "Madrid,", lugar: "Madrid", precio: "53.000 €", detalle: "Piso en subasta", hasta: "Todo" },
    { tipo: "grande", en: "gato", texto: "GATO ENCERRADO", color: "rojo", hasta: "casi", tam: 90 },
    { tipo: "pildora", en: "visitar", texto: "No puedes visitarlo", icono: "no" },
    { tipo: "pildora", en: "ocupados", texto: "Muchos, ocupados", icono: "ocupado" },
    { tipo: "pildora", en: "deudas", texto: "Sus deudas pasan a ti", icono: "deuda" },
    { tipo: "pildora", en: "miles", texto: "Miles lo han visto también", icono: "personas" },
    { tipo: "pildora", en: "agencias", texto: "Agencias: antes de los portales", icono: "manos" },
    { tipo: "pildora", en: "24", texto: "Respondo en 24 horas", icono: "reloj" },
    { tipo: "pildora", en: "financiación", texto: "Financiación aprobada", icono: "euro" },
    { tipo: "pildora", en: "nunca", texto: "No les hago perder el tiempo", icono: "ok" },
    { tipo: "pildora", en: "comisión", texto: "Comisión segura", icono: "manos" },
    { tipo: "grande", en: "manda.", texto: "SE LOS MANDAN", color: "verde", hasta: "Así", tam: 92 },
  ],
  golpes: ["15.000", "7.000", "53.000", "gato", "miles", "24"],
  cta: { en: "Así", escribe: "guía", palabra: "GUÍA" },
  cronometro: { en: ["segundos", "Cuenca,"], hasta: "Así", segundos: 60 },
  amarillas: ["cuenca", "alicante", "madrid", "15000", "7000", "53000", "gato", "visitar", "ocupados", "deudas", "miles", "agencias", "24", "financiación", "comisión", "guía", "subasta"],
  yPildora: 400,
  yPrecio: 345,
});
