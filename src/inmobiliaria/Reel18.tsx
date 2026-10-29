import { crearReel, CorteReel } from "./Plantilla";
import hook1 from "./g18-hook1.json";
import hook2 from "./g18-hook2.json";

// Reel 18 "3 páginas para comprar pisos a mitad de precio" (guion 18, frontal informal). Lista 1-3;
// resultados reales del portal de subastas del BOE y la web de Oportunalia a pantalla completa
// (el guion pedía grabar la pantalla); el piso de 98.000 € alquilado en 750 €/mes y el CTA (GUÍA).

export const G18: Record<"hook1" | "hook2", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel };

export const Reel18 = crearReel({
  video: "tiktok/g18/proxy.mp4",
  cara: { x: 700, y: 1050 },
  versiones: G18,
  titulos: {
    hook1: { blanco: "3 páginas para comprar pisos", amarillo: "A MITAD DE PRECIO", en: "mitad" },
    hook2: { blanco: "3 sitios donde comprar", amarillo: "PISOS BARATOS", en: "baratos" },
  },
  lista: { puntos: ["Subastas BOE", "Oportunalia", "Inmobiliarias"], ancho: 360 },
  eventos: [
    { tipo: "lista", en: "uno", indice: 0 },
    { tipo: "pantalla", en: "aquí", img: "boe-resultados-completa.png", dominio: "subastas.boe.es", hasta: "Pero", baja: 1100 },
    { tipo: "pildora", en: "ocupado", texto: "No te dicen si está ocupado", icono: "ocupado" },
    { tipo: "grande", en: "chollo.", texto: "NO ES UN CHOLLO", color: "rojo", hasta: "Número", tam: 92 },
    { tipo: "lista", en: "dos,", indice: 1 },
    { tipo: "pantalla", en: "Oportunalia.", img: "oportunalia-completa.png", dominio: "oportunalia.com", hasta: "Pero", baja: 250 },
    { tipo: "pildora", en: "todos", texto: "Todos ven la misma web", icono: "personas" },
    { tipo: "pildora", en: "puja", texto: "Gana el que puja más alto", icono: "mazo" },
    { tipo: "pildora", en: "deudas,", texto: "Deudas", icono: "deuda" },
    { tipo: "pildora", en: "ocupas,", texto: "Okupas", icono: "ocupado" },
    { tipo: "pildora", en: "destrozado.", texto: "Destrozado", icono: "aviso" },
    { tipo: "lista", en: "tres,", indice: 2 },
    { tipo: "pildora", en: "llamen", texto: "Te llaman antes de publicarlo", icono: "telefono" },
    { tipo: "precio", en: "98.000", lugar: "Mi último piso", precio: "98.000 €", detalle: "No estaba en ninguna web", hasta: "Me" },
    { tipo: "precio", en: "750", lugar: "Ya alquilado", precio: "750 €/mes", detalle: "Me llegó por teléfono", hasta: "¿Cómo?" },
    { tipo: "pildora", en: "relaciones", texto: "Relaciones + inversor serio", icono: "manos" },
    { tipo: "pildora", en: "rápido,", texto: "Decides rápido → te llaman primero", icono: "rayo" },
    { tipo: "grande", en: "lleguen", texto: "QUE TE LLEGUE A TI", color: "verde", hasta: "Todo", tam: 86 },
  ],
  golpes: ["chollo.", "puja", "98.000", "750", "lleguen"],
  cta: { en: "Todo", escribe: "guía.", palabra: "GUÍA" },
  amarillas: ["boe", "oportunalia", "subastas", "embargos", "ocupado", "chollo", "deudas", "ocupas", "destrozado", "inmobiliarias", "98000", "750", "serio", "rápido", "guía", "mitad", "precio"],
  yPildora: 470,
  yPrecio: 470,
});
