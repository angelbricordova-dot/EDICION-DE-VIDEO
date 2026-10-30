import { crearReel, CorteReel } from "./Plantilla";
import hook1 from "./g19-hook1.json";
import hook2 from "./g19-hook2.json";

// Reel 19 "pueblos cerca de Madrid por menos de 50.000 €" (guion 19, dinámico). Lista de los tres
// pueblos con la etiqueta de precio que dice, las trampas en píldoras, los tres pasos con las
// agencias y el CTA (GUÍA). No hay fotos de las casas: solo las cifras que dice.

export const G19: Record<"hook1" | "hook2", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel };

export const Reel19 = crearReel({
  video: "inmobiliaria/g19/proxy.mp4",
  cara: { x: 760, y: 1150 },
  versiones: G19,
  titulos: {
    hook1: { blanco: "3 pueblos cerca de Madrid", amarillo: "CASAS POR < 50.000 €", en: "50.000" },
    hook2: { blanco: "Casas a 45 min de Madrid", amarillo: "POR MENOS DE 45.000 €", en: "45.000" },
  },
  lista: { puntos: ["Galapagar", "Alpedrete", "El Escorial"], ancho: 300 },
  eventos: [
    { tipo: "lista", en: "Galapagar", indice: 0 },
    { tipo: "precio", en: "15.000", lugar: "Galapagar", precio: "< 15.000 €", detalle: "A menos de 45 min de Madrid", hasta: "Número" },
    { tipo: "lista", en: "Alpedrete", indice: 1 },
    { tipo: "precio", en: "33.000", lugar: "Alpedrete", precio: "33.000 €", detalle: "A 40 min de Madrid", hasta: "Y" },
    { tipo: "lista", en: "Escorial", indice: 2 },
    { tipo: "precio", en: "30.000", lugar: "El Escorial", precio: "30.000 €", detalle: "A 45 min de Madrid", hasta: "Estas" },
    { tipo: "pildora", en: "subastas", texto: "Subastas y pisos ocupados", icono: "mazo" },
    { tipo: "pildora", en: "ocupa", texto: "Te cuelan un okupa", icono: "ocupado" },
    { tipo: "pildora", en: "deudas", texto: "Muchas deudas", icono: "deuda" },
    { tipo: "pildora", en: "destrozado.", texto: "O destrozada", icono: "aviso" },
    { tipo: "pildora", en: "agencias", texto: "Me llegan por las agencias", icono: "manos" },
    { tipo: "pildora", en: "exactamente", texto: "1 · Qué busco: zona y precio", icono: "lupa" },
    { tipo: "pildora", en: "avísame", texto: "Nunca «avísame si sale algo»", icono: "no" },
    { tipo: "pildora", en: "financiación", texto: "2 · Financiación preaprobada", icono: "euro" },
    { tipo: "pildora", en: "contesto", texto: "3 · Le contesto a todo", icono: "telefono" },
    { tipo: "pildora", en: "parezca", texto: "Cada piso, más a mi medida", icono: "ok" },
    { tipo: "grande", en: "conseguir", texto: "TE LLEGAN", color: "verde", hasta: "Así", tam: 100 },
  ],
  golpes: ["15.000", "33.000", "30.000", "deudas", "financiación", "conseguir"],
  cta: { en: "Así", escribe: "guía", palabra: "GUÍA" },
  amarillas: ["galapagar", "alpedrete", "escorial", "15000", "33000", "30000", "50000", "45000", "subastas", "ocupados", "deudas", "destrozado", "agencias", "financiación", "contesto", "guía"],
  yPildora: 440,
  yPrecio: 440,
  yLista: 345,
});
