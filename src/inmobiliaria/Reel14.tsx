import { crearSofa, CorteSofaReel } from "./Sofa";
import sofa from "./g14-sofa.json";

// Reel 14 "casa para vivir vs casa para alquilar" (formato sofá, ver Sofa.tsx): a la izquierda
// el de camiseta blanca ("para alquilar"), a la derecha el de camiseta negra ("para vivir").

export const G14: Record<"sofa", CorteSofaReel> = { sofa: sofa as unknown as CorteSofaReel };

const AZUL = "#4FA8FF";
// Fotos de referencia (libres: CC0 / dominio público de StockSnap y rawpixel vía Openverse,
// scripts/comun/buscar_imagenes.py; licencias en public/inmobiliaria/imagenes/g14*/).
const F = (nombre: string) => `inmobiliaria/imagenes/reel14/${nombre}.jpg`;
const VERDE = "#22B53A";

export const Reel14 = crearSofa({
  video: "inmobiliaria/g14/proxy.mp4",
  versiones: G14,
  titulo: { linea1: "Casa para vivir", linea2: "vs casa para alquilar", en2: "alquilar" },
  etiquetas: { izq: { texto: "PARA ALQUILAR", color: VERDE, en: "alquilar" }, der: { texto: "PARA VIVIR", color: AZUL } },
  items: [
    { cat: "SUELO", en: "suelo", der: { texto: "Parqué de madera", en: "vivir", img: F("parquet") }, izq: { texto: "Vinílico imitación madera", en: "alquilar", img: F("vinilico"), extras: [["aguanta", "Aguanta agua, arañazos y 5 mudanzas"]] } },
    { cat: "PAREDES", en: "paredes", der: { texto: "El color que más te guste", en: "vivir", img: F("pared-color") }, izq: { texto: "Blanco roto, misma referencia", en: "alquilar", img: F("blanco-roto"), extras: [["retocas", "Retocas, no pintas entero"]] } },
    { cat: "GRIFOS", en: "grifos", der: { texto: "El de diseño", en: "vivir", img: F("grifo-diseno") }, izq: { texto: "Monomando de marca normal", en: "alquilar", img: F("monomando"), extras: [["negros", "Toques en negro, mismo precio"], ["ferretería", "Si falla: recambio de ferretería"]] } },
    { cat: "ELECTRODOMÉSTICOS", en: "electrodomésticos", der: { texto: "Integrados", en: "vivir", img: F("integrados") }, izq: { texto: "De libre instalación", en: "alquilar", img: F("libre-instalacion"), extras: [["lavadora", "Se rompe la lavadora → no desmontas la cocina"]] } },
    { cat: "AZULEJOS", en: "azulejos", der: { texto: "Quitas y alicatas", en: "quitas", img: F("alicatado") }, izq: { texto: "Pintura especial de azulejo", en: "alquilar", img: F("pintura-azulejo") } },
    { cat: "POMOS", en: "pomos", der: { texto: "En negro", en: "negro", img: F("pomo-negro") }, izq: { texto: "¡Aquí te doy la razón!", en: "razón", extras: [["euros", "Unos 10 € por puerta"]] } },
  ],
  finItems: ["máximo", "y"],
  pildoras: [
    { en: "habitable", texto: "Perfecto y habitable", ok: true },
    { en: "loco", texto: "No como si fuera para ti", ok: false, y: 560 },
  ],
  cta: { en: "Así", escribe: "guía", palabra: "GUÍA" },
  amarillas: ["vivir", "alquilar", "vinílico", "parqué", "parque", "blanco", "roto", "diseño", "monomando", "integrados", "instalación", "azulejo", "negro", "guía", "suelo", "paredes", "grifos", "electrodomésticos", "azulejos", "pomos"],
});
