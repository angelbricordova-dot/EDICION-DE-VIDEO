// Objetos en pixel art. Cada letra de la cuadrícula es un color de la paleta;
// "." es transparente. El contorno oscuro se genera automáticamente.

type Definicion = { paleta: Record<string, string>; filas: string[] };

const DEFINICIONES = {
  corazon: {
    paleta: { R: "#e0242a", o: "#f07a4a", d: "#a8141c" },
    filas: [
      ".RRRR...RRRR.",
      "RooRRR.RRRRRR",
      "RoRRRRRRRRRRR",
      "RoRRRRRRRRRRR",
      "RRRRRRRRRRRRR",
      "RRRRRRRRRRRRd",
      ".RRRRRRRRRRd.",
      "..RRRRRRRRd..",
      "...RRRRRRd...",
      "....RRRRd....",
      ".....RRd.....",
      "......d......",
    ],
  },
  moneda: {
    paleta: { Y: "#f2c21b", y: "#c98e0c", w: "#fff6c8" },
    filas: [
      "...YYYYYY...",
      "..YyyyyyyY..",
      ".YyyYYYYyyY.",
      ".YyYYwwYYyY.",
      "YyYYYwwYYYyY",
      "YyYYYwwYYYyY",
      "YyYYYwwYYYyY",
      "YyYYYwwYYYyY",
      "YyYYYwwYYYyY",
      "YyYYYwwYYYyY",
      ".YyYYwwYYyY.",
      ".YyyYYYYyyY.",
      "..YyyyyyyY..",
      "...YYYYYY...",
    ],
  },
  control: {
    paleta: {
      W: "#f4f4f0",
      s: "#c9c9c2",
      k: "#1a1a1a",
      b: "#2f6fe0",
      g: "#3cb44b",
      r: "#e02424",
      y: "#f2c21b",
    },
    filas: [
      "..WWWWWWWWWWWW..",
      ".WWWWWWWWWWWWWW.",
      "WWWkWWWWWWWWbWWW",
      "WkkkkkWkkWWgWrWW",
      "WWWkWWWWWWWWyWWW",
      "WWWWWWWWWWWWWWWW",
      "sWWWWW....WWWWWs",
      ".sWWs......sWWs.",
      "..ss........ss..",
    ],
  },
  vinilo: {
    paleta: { K: "#2b3242", g: "#7c7896", R: "#e0303c", w: "#ffffff" },
    filas: [
      "....KKKKKK....",
      "..KKKKKKKKKK..",
      ".KggKKKKKKKKK.",
      ".KgggKKKKKKKK.",
      "KKKggKKKKKKKKK",
      "KKKKKRRRRKKKKK",
      "KKKKRRRwRRKKKK",
      "KKKKRRwRRRKKKK",
      "KKKKKRRRRKKKKK",
      "KKKKKKKKKggKKK",
      ".KKKKKKKKgggK.",
      ".KKKKKKKKKggK.",
      "..KKKKKKKKKK..",
      "....KKKKKK....",
    ],
  },
  camara: {
    paleta: {
      G: "#b9bcc2",
      S: "#3a3a3e",
      k: "#111111",
      l: "#4a5a78",
      w: "#ffffff",
      s: "#888888",
      r: "#e02424",
    },
    filas: [
      "...kk.......ss..",
      ".GGGGGGGGGGGGGG.",
      "GGGGGGkkkkGGGGGG",
      "GsGGGkkllkkGGrGG",
      "GGGGkkllllkkGGGG",
      "SSSSkllwllkkSSSS",
      "SSSSkllllllkSSSS",
      "SSSSkkllllkkSSSS",
      "SSSSSkkllkkSSSSS",
      "SSSSSSkkkkSSSSSS",
      ".SSSSSSSSSSSSSS.",
    ],
  },
  libro: {
    paleta: { R: "#a8232f", g: "#7fa05a", p: "#f3e8d2", d: "#6e1420", t: "#d39a5a" },
    filas: [
      ".RRRRRRRRRRRRR..",
      "RRRRRRRRRRRRRRR.",
      "RRRggggggRRRRRpd",
      "RRgggggggRRRRRpd",
      "RRggggggRRRRRRpd",
      "RRRRRRRRRRRRRRpd",
      "RRRRRRRRRRRRRRpd",
      "RRRRRRRRRRRRRRpd",
      "ttRRRRRRRRRRRRpd",
      "dttRRRRRRRRRRRpd",
      ".ddddddddddddddd",
    ],
  },
  planta: {
    paleta: { g: "#3f9a3a", G: "#2a6b2a", B: "#cfd8ea", b: "#8d9bbf" },
    filas: [
      ".....g...g....",
      "..g..gg.gg..g.",
      "..gg.gGgGg.gg.",
      "...gggGgGggg..",
      ".gg.gGGgGGg.gg",
      "..gggGgggGggg.",
      "...ggGgGgGgg..",
      "....gggggggg..",
      "..BBBBBBBBBB..",
      "..bBBBBBBBBb..",
      "...bBBBBBBb...",
      "...bBBBBBBb...",
      "....bbbbbb....",
    ],
  },
  billetes: {
    paleta: { G: "#5cbf4a", g: "#8ddc6a", S: "#2e7d2a", T: "#d9c79a" },
    filas: [
      "GGGGGGGGGGGGGGGG",
      "GgggggTTggggggGG",
      "GggSggTTggSgggGG",
      "GgSSggTTgSSgggGG",
      "GggSggTTggSgggGG",
      "GgggggTTggggggGG",
      "GGGGGGTTGGGGGGGG",
      "SSSSSSSSSSSSSSS.",
    ],
  },
  gato: {
    paleta: { k: "#151515", w: "#f2c21b" },
    filas: [
      ".k.......k....",
      ".kk.....kk....",
      ".kkkkkkkkk....",
      ".kwkkkkwkk....",
      ".kkkkkkkkk...k",
      "..kkkkkkk....k",
      "..kkkkkkkk..kk",
      ".kkkkkkkkkkkk.",
      ".kkkkkkkkkkk..",
      ".kkkkkkkkkkk..",
      ".kk.kk.kk.kk..",
    ],
  },
  claqueta: {
    paleta: { B: "#3b3fa0", W: "#f0f0ff", N: "#2a2d78", n: "#4a50c0" },
    filas: [
      ".WWBBWWBBWWBBWW.",
      "WWBBWWBBWWBBWWB.",
      "................",
      "BBWWBBWWBBWWBBWW",
      "WBBWWBBWWBBWWBBW",
      "NNNNNNNNNNNNNNNN",
      "NnnnnnnnnnnnnnnN",
      "NnNNNNNNNNNNNNnN",
      "NnnnnnnnnnnnnnnN",
      "NnNNNNNNNNnnnnnN",
      "NnnnnnnnnnnnnnnN",
      "NNNNNNNNNNNNNNNN",
    ],
  },
  gorra: {
    paleta: { W: "#f4f2ea", s: "#cfcbbd", r: "#e02424" },
    filas: [
      "......rr..........",
      "....WWWWWW........",
      "..WWWWWWWWWW......",
      ".WWWWWWWWWWWW.....",
      ".WWWsWWWWWWWW.....",
      "WWWWsWWWWWWWWW....",
      "WWWWWWWWWWWWWWWWW.",
      "sssssssssssssssssW",
      "...........ssssss.",
    ],
  },
  patineta: {
    paleta: { k: "#1e1e1e", K: "#444444", g: "#999999", r: "#e02424" },
    filas: [
      "..kkkkkkkkkkkkkk..",
      ".kKkkkkkkkkkkkkKk.",
      "kkkkkkkkkkkkkkkkkk",
      ".kkkkkkkkkkkkkkkk.",
      "...gg........gg...",
      "..rrrr......rrrr..",
      "...rr........rr...",
    ],
  },
} satisfies Record<string, Definicion>;

export type NombreSprite = keyof typeof DEFINICIONES;

export const ANILLO: NombreSprite[] = [
  "vinilo",
  "libro",
  "camara",
  "gato",
  "moneda",
  "control",
  "gorra",
  "corazon",
  "billetes",
  "planta",
  "claqueta",
  "patineta",
];

export type Tramo = { x: number; y: number; ancho: number; color: string };
export type SpritePreparado = { ancho: number; alto: number; tramos: Tramo[] };

const CONTORNO = "#141414";

const preparar = ({ paleta, filas }: Definicion): SpritePreparado => {
  const anchoBase = Math.max(...filas.map((f) => f.length));
  // Margen de 1 pixel para el contorno.
  const ancho = anchoBase + 2;
  const alto = filas.length + 2;
  const celda = (x: number, y: number): string | null => {
    const c = filas[y - 1]?.[x - 1];
    return c && c !== "." ? paleta[c] : null;
  };

  const colores: (string | null)[][] = [];
  for (let y = 0; y < alto; y++) {
    const fila: (string | null)[] = [];
    for (let x = 0; x < ancho; x++) {
      const propio = celda(x, y);
      if (propio) {
        fila.push(propio);
        continue;
      }
      const vecino =
        celda(x - 1, y) || celda(x + 1, y) || celda(x, y - 1) || celda(x, y + 1);
      fila.push(vecino ? CONTORNO : null);
    }
    colores.push(fila);
  }

  // Une pixeles consecutivos del mismo color para dibujar menos rectángulos.
  const tramos: Tramo[] = [];
  colores.forEach((fila, y) => {
    let x = 0;
    while (x < ancho) {
      const color = fila[x];
      if (!color) {
        x++;
        continue;
      }
      let fin = x + 1;
      while (fin < ancho && fila[fin] === color) fin++;
      tramos.push({ x, y, ancho: fin - x, color });
      x = fin;
    }
  });

  return { ancho, alto, tramos };
};

export const SPRITES = Object.fromEntries(
  Object.entries(DEFINICIONES).map(([nombre, def]) => [nombre, preparar(def)]),
) as Record<NombreSprite, SpritePreparado>;
