// Imágenes de acertijos hechas desde cero en HD (corrección de Fernando, 9-nov: "la imagen tiene que
// ser hecha desde cero en HD", nunca una captura del Short). Cada una se dibuja en HTML/SVG con otros
// colores que el original y se fotografía con Chromium a 2× → public/marryto/material/<nombre>.png
//   G=$(npm root -g) node scripts/marryto/graficos.mjs [nombre…]
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
import fs from "fs";
// fuentes incrustadas (una página en blanco no puede leer file://)
const F = (p) => "data:font/woff2;base64," + fs.readFileSync(path.join(RAIZ, "node_modules/@fontsource", p)).toString("base64");
const css = `
@font-face{font-family:M;font-weight:800;src:url(${F("montserrat/files/montserrat-latin-800-normal.woff2")})}
@font-face{font-family:M;font-weight:900;src:url(${F("montserrat/files/montserrat-latin-900-normal.woff2")})}
@font-face{font-family:M;font-weight:800;src:url(${F("montserrat/files/montserrat-latin-ext-800-normal.woff2")});unicode-range:U+0100-024F}
@font-face{font-family:C;font-weight:700;src:url(${F("caveat/files/caveat-latin-700-normal.woff2")})}
@font-face{font-family:C;font-weight:700;src:url(${F("caveat/files/caveat-latin-ext-700-normal.woff2")});unicode-range:U+0100-024F}
*{margin:0;box-sizing:border-box} body{width:var(--w);height:var(--h);overflow:hidden;font-family:M,sans-serif}`;

const circulo = (t, fondo, borde, color, tam = 150, fs = 80) =>
  `<div style="width:${tam}px;height:${tam}px;border-radius:50%;background:${fondo};border:8px solid ${borde};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${fs}px;color:${color};box-shadow:inset 0 -10px 0 rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.25)">${t}</div>`;
const hueco = (tam = 150, c = "#fff") => `<div style="width:${tam}px;height:${tam}px;border-radius:50%;border:8px dashed ${c};opacity:.85"></div>`;
const signo = (s, c = "#fff", fs = 90) => `<div style="font-weight:900;font-size:${fs}px;color:${c}">${s}</div>`;

const IMAGENES = {
  // 44–46: "Mueve tres números para que el resultado sea 16" (original azul con madera → morado y menta)
  "numeros-16": {
    w: 1000, h: 1000,
    html: `<div style="width:1000px;height:1000px;background:linear-gradient(160deg,#5B2A86,#2E1A5C);padding:46px;display:flex;flex-direction:column;align-items:center;gap:40px">
      <div style="font-weight:900;font-size:58px;line-height:1.1;color:#fff;text-align:center">Mueve tres números para que el resultado sea <span style="color:#FFD43B">16</span></div>
      <div style="display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.08);border:6px solid #8EF0C8;border-radius:40px;padding:26px 34px">
        ${hueco(140, "#8EF0C8")}${signo("+", "#8EF0C8")}${hueco(140, "#8EF0C8")}${signo("+", "#8EF0C8")}${hueco(140, "#8EF0C8")}${signo("=", "#8EF0C8")}${circulo("16", "#FFD43B", "#1C1A1A", "#1C1A1A", 160, 76)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,170px);gap:34px;background:#1E1240;border-radius:44px;padding:40px 46px;border:6px solid #8EF0C8">
        ${[["7", "#FF6B6B"], ["3", "#4DABF7"], ["10", "#FFD43B"], ["6", "#69DB7C"], ["4", "#69DB7C"], ["9", "#FF6B6B"], ["5", "#DA77F2"], ["8", "#4DABF7"]].map(([n, c]) => circulo(n, c, "#1C1A1A", "#1C1A1A", 170, n.length > 1 ? 72 : 86)).join("")}
      </div></div>`,
  },
  // 47: "¿Cuántos triángulos hay?" — misma imagen pero en AMARILLO (instrucciones)
  "triangulos-amarillo": {
    w: 1000, h: 1000,
    html: (() => {
      const tri = (n, x, y, lado) => {
        let s = "";
        const h = (lado * Math.sqrt(3)) / 2;
        s += `<polygon points="${x},${y} ${x - lado / 2},${y + h} ${x + lado / 2},${y + h}" fill="#FFD43B" stroke="#7A5200" stroke-width="10" stroke-linejoin="round"/>`;
        for (let i = 1; i < n; i++) {
          const yy = y + (h * i) / n;
          const half = (lado / 2) * (i / n);
          s += `<line x1="${x - half}" y1="${yy}" x2="${x + half}" y2="${yy}" stroke="#7A5200" stroke-width="8"/>`;
          // diagonales
          s += `<line x1="${x - lado / 2 + (lado * i) / n}" y1="${y + h}" x2="${x - lado / 2 + (lado * i) / n / 2}" y2="${y + h - (h * i) / n}" stroke="#7A5200" stroke-width="8"/>`;
          s += `<line x1="${x + lado / 2 - (lado * i) / n}" y1="${y + h}" x2="${x + lado / 2 - (lado * i) / n / 2}" y2="${y + h - (h * i) / n}" stroke="#7A5200" stroke-width="8"/>`;
        }
        return s;
      };
      return `<div style="width:1000px;height:1000px;background:#FFFBEA;display:flex;flex-direction:column;align-items:center;padding-top:40px">
        <div style="font-weight:900;font-size:74px;color:#1C1A1A">¿Cuántos triángulos hay?</div>
        <svg width="1000" height="860" viewBox="0 0 1000 860">
          ${tri(1, 330, 40, 200)}<text x="520" y="185" font-family="M" font-weight="900" font-size="110" fill="#1C1A1A">=1</text>
          ${tri(2, 330, 290, 230)}<text x="520" y="460" font-family="M" font-weight="900" font-size="110" fill="#1C1A1A">=5</text>
          ${tri(3, 330, 560, 280)}<text x="540" y="770" font-family="M" font-weight="900" font-size="110" fill="#E8590C">=?</text>
        </svg></div>`;
    })(),
  },
  // 48: "Cómo sería tu nombre sin estas letras?" — teclado en modo oscuro (original claro)
  "teclado-nombre": {
    w: 1000, h: 720,
    html: (() => {
      const tachadas = new Set(["E", "R", "T", "Y", "U", "I", "A", "S", "K", "L", "B", "N", "M"]);
      const fila = (ls, pad = 0) =>
        `<div style="display:flex;gap:12px;justify-content:center;padding-left:${pad}px">${ls
          .map((l) => {
            const ancho = l.length > 1 ? 130 : 78;
            const t = tachadas.has(l);
            return `<div style="position:relative;width:${ancho}px;height:104px;border-radius:14px;background:${l.length > 1 ? "#4A4F5C" : "#6B7180"};color:#fff;font-weight:800;font-size:${l.length > 1 ? 40 : 50}px;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 0 #23262D">${l}${t ? `<div style="position:absolute;left:6px;right:6px;top:47px;height:9px;border-radius:5px;background:#FF4D6D;rotate:-14deg"></div>` : ""}</div>`;
          })
          .join("")}</div>`;
      return `<div style="width:1000px;height:720px;background:#16181D;padding:40px 30px;display:flex;flex-direction:column;gap:22px">
        <div style="font-weight:900;font-size:52px;color:#fff;text-align:center;margin-bottom:18px">¿Cómo sería tu nombre sin estas letras? 🤔</div>
        <div style="background:#2B2E36;border-radius:28px;padding:28px 16px;display:flex;flex-direction:column;gap:18px">
          ${fila(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"])}
          ${fila(["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"])}
          ${fila(["⇧", "Z", "X", "C", "V", "B", "N", "M", "⌫"])}
        </div></div>`;
    })(),
  },
  // 49–51: "El 99% falla este cálculo: ◯+◯+◯ = 17" (original bolas rojas → bolas azules con brillo)
  "calculo-17": {
    w: 1000, h: 1000,
    html: (() => {
      const bola = (n) =>
        `<div style="width:220px;height:220px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9BD4FF 0%,#1971C2 45%,#0B3D75 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:120px;color:#fff;text-shadow:0 6px 0 rgba(0,0,0,.3);box-shadow:0 18px 24px rgba(0,0,0,.25)">${n}</div>`;
      return `<div style="width:1000px;height:1000px;background:linear-gradient(#F4F7FB,#DCE6F2);display:flex;flex-direction:column;align-items:center;padding-top:50px;gap:46px">
        <div style="font-weight:900;font-size:70px;color:#1C1A1A">El 99% falla este cálculo:</div>
        <div style="display:flex;align-items:center;gap:20px">${hueco(150, "#1C1A1A")}${signo("+", "#1C1A1A", 100)}${hueco(150, "#1C1A1A")}${signo("+", "#1C1A1A", 100)}${hueco(150, "#1C1A1A")}${signo("= 17", "#1C1A1A", 96)}</div>
        <div style="display:grid;grid-template-columns:repeat(3,220px);gap:50px 70px">${["3", "4", "9", "8", "7", "2"].map(bola).join("")}</div>
      </div>`;
    })(),
  },
  // 52: "¿Cuál tiene dos cero y dos seis?" (original libreta blanca → nota adhesiva amarilla)
  "dos-ceros": {
    w: 1000, h: 1000,
    html: `<div style="width:1000px;height:1000px;background:#E9ECEF;display:flex;align-items:center;justify-content:center">
      <div style="width:820px;height:860px;background:#FFE877;rotate:-2deg;box-shadow:0 30px 40px rgba(0,0,0,.25);padding:70px 80px;font-family:C;font-weight:700;color:#1A2B6B;position:relative">
        <div style="position:absolute;left:330px;top:-30px;width:170px;height:60px;background:rgba(255,255,255,.6);rotate:3deg"></div>
        <div style="font-size:92px;line-height:1.05">¿CUÁL TIENE DOS CEROS Y DOS SEIS?</div>
        <div style="font-size:92px;line-height:1.22;margin-top:30px;padding-left:30px">A.) 2026<br>B.) 2066<br>C.) 0026<br>D.) 0066</div>
      </div></div>`,
  },
  // 53–55: "Un libro tiene 96 páginas…" (original hoja blanca → hoja de cuaderno con cuadrícula)
  "libro-edad": {
    w: 1000, h: 660,
    html: `<div style="width:1000px;height:660px;background:#F8F9FA;background-image:linear-gradient(#D0E3F5 2px,transparent 2px),linear-gradient(90deg,#D0E3F5 2px,transparent 2px);background-size:50px 50px;padding:60px 70px;font-family:C;font-weight:700;color:#1C1A1A;border-left:14px solid #FF8787">
      <div style="font-size:92px;line-height:1.22">Un libro tiene <span style="color:#D6336C">96</span> páginas, resta tu edad a este número y suma <span style="color:#D6336C">1930</span>.<br>Encontrarás el año en que naciste. 📖</div>
    </div>`,
  },
};

const nombres = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(IMAGENES);
const nav = await chromium.launch();
for (const n of nombres) {
  const im = IMAGENES[n];
  const pag = await nav.newPage({ viewport: { width: im.w, height: im.h }, deviceScaleFactor: 2 });
  await pag.setContent(`<html><head><style>${css}</style></head><body style="--w:${im.w}px;--h:${im.h}px">${im.html}</body></html>`);
  await pag.evaluate(() => document.fonts.ready);
  await pag.waitForTimeout(300);
  const salida = path.join(RAIZ, "public/marryto/material", `${n}.png`);
  await pag.screenshot({ path: salida });
  console.log(salida);
  await pag.close();
}
await nav.close();
