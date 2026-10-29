import { crearSofa, CorteSofaReel } from "./Sofa";
import sofa from "./g14-sofa.json";

// Reel 14 "casa para vivir vs casa para alquilar" (formato sofá, ver Sofa.tsx): a la izquierda
// el de camiseta blanca ("para alquilar"), a la derecha el de camiseta negra ("para vivir").

export const G14: Record<"sofa", CorteSofaReel> = { sofa: sofa as unknown as CorteSofaReel };

const AZUL = "#4FA8FF";
const VERDE = "#22B53A";

export const Reel14 = crearSofa({
  video: "tiktok/g14/proxy.mp4",
  versiones: G14,
  titulo: { linea1: "Casa para vivir", linea2: "vs casa para alquilar", en2: "alquilar" },
  etiquetas: { izq: { texto: "PARA ALQUILAR", color: VERDE, en: "alquilar" }, der: { texto: "PARA VIVIR", color: AZUL } },
  items: [
    { cat: "SUELO", en: "suelo", der: { texto: "Parqué de madera", en: "vivir" }, izq: { texto: "Vinílico imitación madera", en: "alquilar", extras: [["aguanta", "Aguanta agua, arañazos y 5 mudanzas"]] } },
    { cat: "PAREDES", en: "paredes", der: { texto: "El color que más te guste", en: "vivir" }, izq: { texto: "Blanco roto, misma referencia", en: "alquilar", extras: [["retocas", "Retocas, no pintas entero"]] } },
    { cat: "GRIFOS", en: "grifos", der: { texto: "El de diseño", en: "vivir" }, izq: { texto: "Monomando de marca normal", en: "alquilar", extras: [["negros", "Toques en negro, mismo precio"], ["ferretería", "Si falla: recambio de ferretería"]] } },
    { cat: "ELECTRODOMÉSTICOS", en: "electrodomésticos", der: { texto: "Integrados", en: "vivir" }, izq: { texto: "De libre instalación", en: "alquilar", extras: [["lavadora", "Se rompe la lavadora → no desmontas la cocina"]] } },
    { cat: "AZULEJOS", en: "azulejos", der: { texto: "Quitas y alicatas", en: "quitas" }, izq: { texto: "Pintura especial de azulejo", en: "alquilar" } },
    { cat: "POMOS", en: "pomos", der: { texto: "En negro", en: "negro" }, izq: { texto: "¡Aquí te doy la razón!", en: "razón", extras: [["euros", "Unos 10 € por puerta"]] } },
  ],
  finItems: ["máximo", "y"],
  pildoras: [
    { en: "habitable", texto: "Perfecto y habitable", ok: true },
    { en: "loco", texto: "No como si fuera para ti", ok: false, y: 560 },
  ],
  cta: { en: "Así", escribe: "guía", palabra: "GUÍA" },
  amarillas: ["vivir", "alquilar", "vinílico", "parqué", "parque", "blanco", "roto", "diseño", "monomando", "integrados", "instalación", "azulejo", "negro", "guía", "suelo", "paredes", "grifos", "electrodomésticos", "azulejos", "pomos"],
});
