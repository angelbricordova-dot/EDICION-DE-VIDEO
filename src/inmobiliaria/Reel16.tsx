import { crearSofa, CorteSofaReel } from "./Sofa";
import sofa from "./g16-sofa.json";

// Reel 16 "rico vs pobre" (formato sofá, ver Sofa.tsx): a la izquierda el rico (camiseta blanca), a
// la derecha el pobre (camiseta negra). Cada cifra sale en el centro y cada uno su tarjeta.

export const G16: Record<"sofa", CorteSofaReel> = { sofa: sofa as unknown as CorteSofaReel };

export const Reel16 = crearSofa({
  video: "tiktok/g16/proxy.mp4",
  versiones: G16,
  titulo: { linea1: "Rico vs pobre", linea2: "¿Qué haces con tu dinero?", en2: "euro." },
  etiquetas: { izq: { texto: "RICO", color: "#22B53A", en: "botella" }, der: { texto: "POBRE", color: "#E3141F" } },
  items: [
    { cat: "1 €", en: "euro.", der: { texto: "Un Monster", en: "Monster" }, izq: { texto: "Botella de agua", en: "botella" } },
    { cat: "20 €", en: "20", der: { texto: "Unas copas", en: "copas" }, izq: { texto: "Un libro", en: "libro" } },
    { cat: "500 €", en: "500", der: { texto: "Finde de fiesta", en: "finde", extras: [["tirar", "«Eso es tirar el dinero»"]] }, izq: { texto: "Una formación", en: "formación" } },
    { cat: "3.000 €", en: "3000", der: { texto: "Finde en Ibiza", en: "Ibiza" }, izq: { texto: "Reservo un piso", en: "Reservo", extras: [["Idealista", "El que me pasan antes de Idealista"]] } },
    { cat: "10.000 €", en: "10000", der: { texto: "Entrada de un coche", en: "entrada" }, izq: { texto: "Doy las arras", en: "arras", extras: [["otro", "Para que no se lo quede otro"]] } },
    { cat: "30.000 €", en: "30000", der: { texto: "El coche de mis sueños", en: "coche" }, izq: { texto: "Mi primer piso para alquilar", en: "primer", extras: [["banco", "Banco 80 % · yo entrada y gastos"], ["inquilino", "El resto lo paga el inquilino"]] } },
  ],
  finItems: ["alumno"],
  pildoras: [
    { en: "alumno", texto: "Alumno: entró con < 40.000 €", ok: true },
    { en: "1.200", texto: "Hoy: +1.200 € al mes", ok: true, y: 560 },
  ],
  cta: { en: "Pues", escribe: "guía", palabra: "GUÍA" },
  amarillas: ["monster", "agua", "libro", "formación", "piso", "arras", "alquilar", "inquilino", "guía", "euro", "euros", "idealista"],
});
