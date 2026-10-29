import { crearReel, CorteReel } from "./Plantilla";
import hook from "./g13-hook.json";

// Reel 13 "4 webs de pisos baratos" (guion 13, formato informal con el iPad en la mano). Lista
// 1-4 bajo el título y, al nombrar cada web, un móvil con su captura real (public/tiktok/webs/)
// que se desliza; luego las tres comprobaciones, el método en tres pasos y el CTA (GUÍA).

export const G13: Record<"hook", CorteReel> = { hook: hook as CorteReel };

export const Reel13 = crearReel({
  video: "tiktok/g13/proxy.mp4",
  cara: { x: 930, y: 1140 },
  versiones: G13,
  titulos: { hook: { blanco: "4 webs para encontrar", amarillo: "PISOS BARATOS", en: "baratos," } },
  lista: { puntos: ["Subastas BOE", "Seguridad Social", "Escrapalia", "Webs de bancos"], ancho: 380 },
  eventos: [
    { tipo: "web", en: "como", img: "solvia-baratos-completa.png", dominio: "solvia.es", hasta: "Uno,", baja: 1400 },
    { tipo: "lista", en: "Uno,", indice: 0 },
    { tipo: "web", en: "portal", img: "boe-completa.png", dominio: "subastas.boe.es", hasta: "Dos.", baja: 200 },
    { tipo: "lista", en: "Dos.", indice: 1 },
    { tipo: "web", en: "Seguridad", img: "segsocial-completa.png", dominio: "seg-social.es", hasta: "Tres,", baja: 900 },
    { tipo: "lista", en: "Tres,", indice: 2 },
    { tipo: "web", en: "Escrapalia.", img: "escrapalia-completa.png", dominio: "escrapalia.com", hasta: "problema", baja: 1200 },
    { tipo: "pildora", en: "conoce", texto: "Ya la conoce todo el mundo", icono: "personas" },
    { tipo: "lista", en: "cuatro,", indice: 3 },
    { tipo: "web", en: "bancos.", img: "aliseda-baratos-completa.png", dominio: "alisedainmobiliaria.com", hasta: "Pero", baja: 1300 },
    { tipo: "grande", en: "basura.", texto: "BASURA", color: "rojo", hasta: "descarto" },
    { tipo: "pildora", en: "descarto", texto: "Descartada en menos de 1 minuto", icono: "reloj" },
    { tipo: "pildora", en: "tres", texto: "3 cosas antes del precio", icono: "lupa" },
    { tipo: "pildora", en: "ocupado,", texto: "¿Está ocupado?", icono: "ocupado" },
    { tipo: "pildora", en: "visitar.", texto: "¿Se puede visitar?", icono: "llave" },
    { tipo: "pildora", en: "deudas", texto: "¿Qué deudas tiene?", icono: "deuda" },
    { tipo: "pildora", en: "cuadra,", texto: "Una falla → siguiente", icono: "no" },
    { tipo: "pasos", en: ["descarto", "valido", "pujo."], textos: ["Descarto", "Valido", "Pujo"], hasta: "Porque" },
    { tipo: "pildora", en: "problemas", texto: "El precio no cuenta los problemas", icono: "aviso" },
    { tipo: "pildora", en: "miles", texto: "Compites con miles", icono: "personas" },
    { tipo: "pildora", en: "inmobiliarias", texto: "Inmobiliarias de la zona", icono: "manos" },
    { tipo: "pildora", en: "antes", texto: "Te llegan antes que a nadie", icono: "rayo" },
    { tipo: "grande", en: "rápido", texto: "DESCARTA RÁPIDO", color: "verde", hasta: "nadie", tam: 92 },
  ],
  golpes: ["basura.", "deudas", "pujo.", "miles", "rápido"],
  cta: { en: "Así", escribe: "guía", palabra: "GUÍA" },
  amarillas: ["boe", "seguridad", "social", "escrapalia", "bancos", "basura", "ocupado", "visitar", "deudas", "pujo", "miles", "inmobiliarias", "rápido", "guía", "baratos"],
  web: { x: 26, y: 560 },
  yPildora: 560,
});
