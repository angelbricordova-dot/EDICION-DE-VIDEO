import { crearReel, CorteReel } from "./Plantilla";
import hook from "./g17-hook.json";

// Reel 17 "3 formas de comprar pisos por debajo de 100.000 €" (guion 17). Lista 1-3 bajo el título;
// Solvia, Servihabitat y Aliseda a pantalla completa con pisos baratos reales (capturas de sus webs,
// ordenadas por precio); la frase de las subastas en off sobre resultados reales del portal de subastas del BOE; el logo de El Filtro
// Inmobiliario y el CTA (FILTRO).

export const G17: Record<"hook", CorteReel> = { hook: hook as CorteReel };

export const Reel17 = crearReel({
  video: "inmobiliaria/g17/proxy.mp4",
  cara: { x: 720, y: 1000 },
  versiones: G17,
  titulos: { hook: { blanco: "3 formas de comprar pisos", amarillo: "POR MENOS DE 100.000 €", en: "100.000" } },
  lista: { puntos: ["Pisos de banco", "Subastas online", "Tu red de contactos"], ancho: 400 },
  eventos: [
    { tipo: "lista", en: "primera,", indice: 0 },
    { tipo: "pantalla", en: "Solvia,", img: "solvia-baratos-completa.png", dominio: "solvia.es", hasta: "Servihabitat,", baja: 700 },
    { tipo: "pantalla", en: "Servihabitat,", img: "servihabitat-baratos-completa.png", dominio: "servihabitat.com", hasta: "Aliseda,", baja: 500 },
    { tipo: "pantalla", en: "Aliseda,", img: "aliseda-baratos-completa.png", dominio: "alisedainmobiliaria.com", hasta: "segunda,", baja: 700 },
    { tipo: "lista", en: "segunda,", indice: 1 },
    { tipo: "pantalla", en: "No", img: "boe-resultados-completa.png", dominio: "subastas.boe.es", hasta: "Pero", baja: 1300 },
    { tipo: "pildora", en: "recomiendo", texto: "No para tu primera inversión", icono: "no" },
    { tipo: "pildora", en: "ocupados,", texto: "Ocupados", icono: "ocupado" },
    { tipo: "pildora", en: "cargas,", texto: "Cargas", icono: "deuda" },
    { tipo: "pildora", en: "destrozados,", texto: "Destrozados", icono: "aviso" },
    { tipo: "lista", en: "tercera", indice: 2 },
    { tipo: "pildora", en: "avisen", texto: "Te avisan antes de los portales", icono: "rayo" },
    { tipo: "pildora", en: "visitar,", texto: "Visitar, revisar y negociar", icono: "llave" },
    { tipo: "pildora", en: "pelearte", texto: "Sin pelearte con media España", icono: "personas" },
    { tipo: "grande", en: "llega", texto: "TE LLEGA A TI", color: "verde", hasta: "Y", tam: 96 },
    { tipo: "imagen", en: "Filtro", img: "inmobiliaria/logos/filtro.png", hasta: "Si", ancho: 520, etiqueta: "mi comunidad" },
  ],
  golpes: ["Solvia,", "ocupados,", "tercera", "llega"],
  cta: { en: "Si", escribe: "filtro", palabra: "FILTRO" },
  amarillas: ["solvia", "servihabitat", "aliseda", "subastas", "online", "idealista", "ocupados", "cargas", "destrozados", "red", "contactos", "filtro", "inmobiliario", "100000"],
  yPildora: 470,
});
