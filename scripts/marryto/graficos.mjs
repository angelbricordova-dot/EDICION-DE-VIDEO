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
@font-face{font-family:M;font-weight:700;src:url(${F("montserrat/files/montserrat-latin-700-normal.woff2")})}
@font-face{font-family:L;src:url(${F("lilita-one/files/lilita-one-latin-400-normal.woff2")})}
@font-face{font-family:B;src:url(${F("bebas-neue/files/bebas-neue-latin-400-normal.woff2")})}
@font-face{font-family:C;font-weight:700;src:url(${F("caveat/files/caveat-latin-ext-700-normal.woff2")});unicode-range:U+0100-024F}
*{margin:0;box-sizing:border-box} body{width:var(--w);height:var(--h);overflow:hidden;font-family:M,"Noto Color Emoji",sans-serif}`;

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
    w: 1000, h: 900,
    html: `<div style="width:1000px;height:900px;background:#E9ECEF;display:flex;align-items:center;justify-content:center">
      <div style="width:900px;height:800px;background:#FFE877;rotate:-2deg;box-shadow:0 30px 40px rgba(0,0,0,.25);padding:70px 80px;font-family:C;font-weight:700;color:#1A2B6B;position:relative">
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
  // ── lote 61–99 ──
  ...(() => {
    const out = {};
    // 62–63: "DESCUBRE 2 PALABRAS" (63: otras letras, instrucciones)
    const letras = (ls, fondo, titulo, acento) => ({
      w: 1000, h: 1000,
      html: `<div style="width:1000px;height:1000px;background:${fondo};position:relative;font-family:L">
        <div style="position:absolute;left:0;right:0;top:60px;text-align:center;font-size:110px;color:${titulo};line-height:1">DESCUBRE</div>
        <div style="position:absolute;left:0;right:0;top:180px;text-align:center;font-size:80px;color:#1C1A1A"><span style="color:${acento}">2</span> PALABRAS</div>
        ${ls.map((l, i) => `<div style="position:absolute;${i % 2 ? "right" : "left"}:110px;top:${i < 2 ? 390 : 730}px;font-family:'Noto Serif',Georgia,serif;font-weight:900;font-size:190px;color:#1C1A1A;line-height:1;transform:scaleX(1.35)">${l}</div>`).join("")}
      </div>`,
    });
    out["letras-ramo"] = letras(["R", "A", "M", "O"], "#FFF8E7", "#1F6FEB", "#1F6FEB");
    out["letras-cola"] = letras(["C", "O", "L", "A"], "#EAF7EF", "#2B8A3E", "#E8590C");
    // 67–69: 13 ochos pequeños formando un 8 grande (con el grande, 14)
    {
      const pts = [];
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * Math.PI * 2;
        pts.push([500 + Math.sin(a) * 230, 500 - Math.sin(2 * a) * -0 + Math.cos(a) * 0]);
      }
      // 13 ochos pequeños formando un 8 grande: 5 en la vuelta de arriba, 1 en la cintura y 7 abajo (con el grande, 14)
      const ocho = [[500, 452]];
      for (const g of [-90, -30, 30, 150, 210]) { const u = (g * Math.PI) / 180; ocho.push([500 + Math.cos(u) * 180, 255 + Math.sin(u) * 180]); }
      for (let k = 0; k < 8; k++) { if (k === 4) continue; const u = ((90 + k * 45) * Math.PI) / 180; ocho.push([500 + Math.cos(u) * 210, 665 + Math.sin(u) * 210]); }
      out["ochos"] = {
        w: 1000, h: 1000,
        html: `<div style="width:1000px;height:1000px;background:radial-gradient(circle at 50% 40%,#1E3A8A,#0B1533);position:relative;font-family:M">
          ${ocho.map(([x, y], i) => `<div style="position:absolute;left:${x - 50}px;top:${y - 70}px;width:100px;text-align:center;font-weight:900;font-size:120px;line-height:140px;color:${["#FFD43B", "#FF8787", "#69DB7C", "#74C0FC"][i % 4]};text-shadow:0 6px 0 rgba(0,0,0,.35)">8</div>`).join("")}
        </div>`,
      };
      // 68 y 69: otras versiones (distinta cantidad y colores; Fernando: nunca la misma imagen)
      const variante = (arriba, abajo, fondo, colores) => {
        // `arriba` ochos en la vuelta de arriba, `abajo` en la de abajo y 1 en la cintura, repartidos por igual
        const pts = [[500, 452]];
        for (let k = 1; k <= arriba; k++) { const u = ((90 + (k * 360) / (arriba + 1)) * Math.PI) / 180; pts.push([500 + Math.cos(u) * 180, 255 + Math.sin(u) * 180]); }
        for (let k = 1; k <= abajo; k++) { const u = ((-90 + (k * 360) / (abajo + 1)) * Math.PI) / 180; pts.push([500 + Math.cos(u) * 210, 665 + Math.sin(u) * 210]); }
        return {
          n: pts.length,
          img: {
            w: 1000, h: 1000,
            html: `<div style="width:1000px;height:1000px;background:${fondo};position:relative;font-family:M">
              ${pts.map(([x, y], i) => `<div style="position:absolute;left:${x - 50}px;top:${y - 70}px;width:100px;text-align:center;font-weight:900;font-size:120px;line-height:140px;color:${colores[i % colores.length]};text-shadow:0 6px 0 rgba(0,0,0,.25)">8</div>`).join("")}
            </div>`,
          },
        };
      };
      const vb = variante(6, 8, "radial-gradient(circle at 50% 40%,#FFF4E6,#FFD8A8)", ["#C2255C", "#5F3DC4", "#087F5B", "#E8590C"]);
      const vc = variante(4, 6, "radial-gradient(circle at 50% 40%,#2B8A3E,#0B3D1A)", ["#FFFFFF", "#FFE066", "#FFC9C9"]);
      out["ochos-b"] = vb.img;
      out["ochos-c"] = vc.img;
      console.error("ochos-b:", vb.n, "ochos-c:", vc.n);
    }
    // 73–75 y 79–81: "La mía es: …  SI REPITES, PIERDES · ¿Qué palabra puedes formar?"
    const palabra = (pal, emoji, huecos, fondo, marco, acento) => ({
      w: 1200, h: 820,
      html: `<div style="width:1200px;height:820px;background:${fondo};padding:40px;font-family:L">
        <div style="width:100%;height:100%;border-radius:50px;background:#fff;border:12px solid ${marco};position:relative;display:flex;align-items:center;gap:30px;padding:0 50px">
          <div style="font-size:300px;line-height:1">${emoji}</div>
          <div style="flex:1;text-align:center">
            <div style="font-size:70px;color:#1C1A1A">La mía es:</div>
            <div style="font-size:${pal.length > 6 ? 130 : 160}px;line-height:1;color:${acento};-webkit-text-stroke:8px #1C1A1A;paint-order:stroke fill">${pal}</div>
            <div style="font-family:M;font-weight:900;font-size:44px;color:#1C1A1A;margin-top:10px">SI REPITES, PIERDES</div>
            <div style="font-family:M;font-weight:800;font-size:38px;color:#555;margin-top:8px">¿Qué palabra puedes formar?</div>
            <div style="display:flex;gap:14px;justify-content:center;margin-top:24px">${huecos.split("").map((c) => `<div style="width:${huecos.length > 6 ? 80 : 96}px;height:110px;border-radius:14px;border:7px solid #1C1A1A;background:${c === "_" ? "#F1F3F5" : "#FFF3BF"};font-size:84px;line-height:96px;text-align:center;color:#1C1A1A">${c === "_" ? "" : c}</div>`).join("")}</div>
          </div>
        </div></div>`,
    });
    out["palabra-perro"] = palabra("PERRO", "🐶", "P___O", "#FFE8CC", "#F76707", "#FFA94D");
    out["palabra-gato"] = palabra("GATO", "🐱", "G__O", "#E5DBFF", "#7048E8", "#B197FC");
    out["palabra-libro"] = palabra("LIBRO", "📚", "L___O", "#D3F9D8", "#2B8A3E", "#69DB7C");
    out["palabra-cerdo"] = palabra("CERDO", "🐷", "C___O", "#FFDEEB", "#D6336C", "#F783AC");
    out["palabra-ciervo"] = palabra("CIERVO", "🦌", "C____O", "#FFF3BF", "#E67700", "#FFD43B");
    out["palabra-canguro"] = palabra("CANGURO", "🦘", "C_____O", "#D0EBFF", "#1971C2", "#74C0FC");
    // 83–84: "¿Qué está mal?" (falta la Q)
    out["alfabeto-error"] = {
      w: 1000, h: 900,
      html: `<div style="width:1000px;height:900px;background:#FFF9DB;background-image:linear-gradient(transparent 78px,#C5D9F2 78px,#C5D9F2 81px,transparent 81px);background-size:100% 82px;padding:50px 60px;border-left:16px solid #FF8787;text-align:center">
        <div style="font-family:L;font-size:100px;color:#E03131;line-height:1.1">¿Qué está mal?</div>
        <div style="font-family:M;font-weight:800;font-size:82px;letter-spacing:10px;color:#1C1A1A;line-height:1.35;margin-top:30px">ABCDEFGHIJ<br>KLMNÑOPRST<br>UVWXYZ</div>
        <div style="font-family:C;font-weight:700;font-size:64px;color:#364FC7;line-height:1.15;margin-top:40px">Mientras más tranquilo estás, más fácil es encontrar el error.</div>
      </div>`,
    };
    // 85–87: "¿Cuál es tu tono de piel?"
    {
      const tonos = [["🏻", ["#F8DCC8", "#F2CDB4", "#EBC0A4"]], ["🏼", ["#E8BE98", "#DFAE86", "#D49F74"]], ["🏽", ["#C68E62", "#B97F54", "#AA7046"]], ["🏾", ["#8D5A36", "#7E4D2D", "#6E4125"]], ["🏿", ["#5A3A24", "#4B2F1C", "#3C2415"]]];
      out["tono-piel"] = {
        w: 1100, h: 1000,
        html: `<div style="width:1100px;height:1000px;background:linear-gradient(#F8F9FA,#E9ECEF);padding:40px;text-align:center">
          <div style="font-family:L;font-size:88px;color:#1C1A1A">¿Cuál es tu tono de piel?</div>
          <div style="display:flex;justify-content:space-around;margin-top:40px">${tonos.map(([m, cs]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:14px"><div style="font-size:150px;line-height:1">✊${m}</div>${cs.map((c) => `<div style="width:150px;height:110px;border-radius:24px;background:${c};border:5px solid rgba(0,0,0,.15)"></div>`).join("")}</div>`).join("")}</div>
        </div>`,
      };
    }
    // 91–93: "¿Cómo sería tu nombre japonés?"
    {
      const m = "A=ka B=tu C=mi D=te E=ku F=lu G=ji H=ri I=ki J=zu K=me L=ta M=rin N=to O=mo P=no Q=ke R=shi S=ari T=chi U=do V=ru W=mei X=na Y=fu Z=zi".split(" ");
      out["nombre-japones"] = {
        w: 1100, h: 900,
        html: `<div style="width:1100px;height:900px;background:#FFF5F5;padding:40px;position:relative;overflow:hidden">
          <div style="position:absolute;right:-120px;top:-120px;width:420px;height:420px;border-radius:50%;background:#E03131;opacity:.18"></div>
          <div style="font-family:L;font-size:62px;color:#C92A2A;text-align:center;margin-bottom:22px">¿Cómo sería tu nombre japonés? 🇯🇵</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px 16px;font-family:M;font-weight:800;font-size:40px;color:#1C1A1A">${m.map((x) => { const [l, r] = x.split("="); return `<div style="background:#fff;border:4px solid #FFC9C9;border-radius:18px;padding:5px 12px"><span style="color:#C92A2A">${l}</span> = ${r}</div>`; }).join("")}</div>
        </div>`,
      };
    }
    // 95–97: pilares imposibles (arriba 4, abajo 3)
    {
      const xs = Array.from({ length: 8 }, (_, i) => 180 + i * 92);
      const arriba = [[0, 1], [2, 3], [4, 5], [6, 7]].map(([a, b]) => `<rect x="${xs[a]}" y="230" width="${xs[b] - xs[a]}" height="260" fill="url(#g1)"/><rect x="${xs[a] - 12}" y="200" width="${xs[b] - xs[a] + 24}" height="34" rx="6" fill="#DEE2E6" stroke="#212529" stroke-width="6"/>`).join("");
      const abajo = [[1, 2], [3, 4], [5, 6]].map(([a, b]) => `<rect x="${xs[a]}" y="560" width="${xs[b] - xs[a]}" height="240" fill="url(#g2)"/><rect x="${xs[a] - 14}" y="796" width="${xs[b] - xs[a] + 28}" height="38" rx="6" fill="#DEE2E6" stroke="#212529" stroke-width="6"/>`).join("");
      out["pilares"] = {
        w: 1000, h: 1000,
        html: `<div style="width:1000px;height:1000px;background:#F1F3F5;text-align:center;padding-top:40px">
          <div style="font-family:L;font-size:90px;color:#1971C2;background:#fff;display:inline-block;padding:4px 30px;border-radius:20px;border:6px solid #1971C2">¿Cuántos pilares hay?</div>
          <svg width="1000" height="860" viewBox="0 0 1000 860" style="display:block;margin-top:-60px">
            <defs>
              <linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#ADB5BD"/><stop offset=".5" stop-color="#F8F9FA"/><stop offset="1" stop-color="#ADB5BD"/></linearGradient>
              <linearGradient id="g2" x1="0" x2="1"><stop offset="0" stop-color="#868E96"/><stop offset=".5" stop-color="#E9ECEF"/><stop offset="1" stop-color="#868E96"/></linearGradient>
            </defs>
            ${arriba}${abajo}
            ${xs.map((x) => `<line x1="${x}" y1="230" x2="${x}" y2="800" stroke="#212529" stroke-width="7"/>`).join("")}
          </svg></div>`,
      };
    }
    // 98–99: "¿De dónde está amarrado el perrito?" (correa enredada, la buena va al poste 2)
    {
      const postes = [250, 500, 750];
      const correa = (x, d) => `<path d="${d}" fill="none" stroke="#C92A2A" stroke-width="12" stroke-linecap="round"/>`;
      out["perrito"] = {
        w: 1000, h: 1200,
        html: `<div style="width:1000px;height:1200px;background:#FFF9F0;text-align:center;padding-top:40px;position:relative">
          <div style="font-family:L;font-size:78px;color:#1C1A1A;line-height:1.05">¿De dónde está amarrado<br>el perrito?</div>
          <div style="position:absolute;left:0;right:0;top:215px;font-size:260px;line-height:1;text-align:center">🐕</div>
          <svg width="1000" height="1200" viewBox="0 0 1000 1200" style="position:absolute;left:0;top:0">
            ${correa(0, "M 470 420 C 300 470 760 560 620 640 S 200 700 330 800 S 760 840 640 920 S 470 960 500 1010")}
            ${correa(0, "M 250 1010 C 230 900 520 880 440 780 S 760 700 700 600 S 380 560 430 480")}
            ${correa(0, "M 750 1010 C 800 900 330 900 380 820 S 160 700 300 620 S 640 520 560 470")}
            ${postes.map((x, i) => `<rect x="${x - 26}" y="1000" width="52" height="110" rx="10" fill="#8B5A2B" stroke="#1C1A1A" stroke-width="6"/><circle cx="${x}" cy="1010" r="16" fill="#ADB5BD" stroke="#1C1A1A" stroke-width="5"/><circle cx="${x}" cy="1160" r="34" fill="#E03131"/><text x="${x}" y="1174" text-anchor="middle" font-family="L" font-size="42" fill="#fff">${i + 1}</text>`).join("")}
          </svg></div>`,
      };
    }
    return out;
  })(),
  // ── correcciones del 11-nov: imágenes grandes (ancho completo, como las referencias) y distintas en cada video ──
  ...(() => {
    const out = {};
    // 41–43: cubo 3×3 con la esquina que falta; opciones A, B, C enteras (nada cortado); colores distintos al original
    const cubo = (top, izq, der, correcta, fondo, cabecera) => {
      const s = 105, cx = 500, cy = 330;
      const P = (x, y, z) => [cx + (x - y) * s * 0.866, cy + (x + y) * s * 0.5 - z * s];
      const poly = (pts, fill, extra = "") => `<polygon points="${pts.map((q) => q.join(",")).join(" ")}" fill="${fill}" stroke="#111" stroke-width="7" stroke-linejoin="round" ${extra}/>`;
      let g = "";
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        if (!(i === 2 && j === 2)) g += poly([P(i, j, 3), P(i + 1, j, 3), P(i + 1, j + 1, 3), P(i, j + 1, 3)], top); // arriba
        if (!(i === 2 && j === 0)) g += poly([P(3, i, 3 - j), P(3, i + 1, 3 - j), P(3, i + 1, 2 - j), P(3, i, 2 - j)], der); // derecha (x=3)
        if (!(i === 2 && j === 0)) g += poly([P(i, 3, 3 - j), P(i + 1, 3, 3 - j), P(i + 1, 3, 2 - j), P(i, 3, 2 - j)], izq); // izquierda (y=3)
      }
      // hueco de la esquina: suelo y dos paredes interiores
      g += poly([P(2, 2, 2), P(3, 2, 2), P(3, 3, 2), P(2, 3, 2)], "#E9ECEF");
      g += poly([P(2, 2, 3), P(2, 3, 3), P(2, 3, 2), P(2, 2, 2)], "#CED4DA");
      g += poly([P(2, 2, 3), P(3, 2, 3), P(3, 2, 2), P(2, 2, 2)], "#ADB5BD");
      const pieza = (t, l, r, x) => {
        const q = 78, Q = (a, b, c) => [x + (a - b) * q * 0.866, 870 + (a + b) * q * 0.5 - c * q];
        const pp = (pts, f) => `<polygon points="${pts.map((v) => v.join(",")).join(" ")}" fill="${f}" stroke="#111" stroke-width="6" stroke-linejoin="round"/>`;
        return pp([Q(0, 0, 1), Q(1, 0, 1), Q(1, 1, 1), Q(0, 1, 1)], t) + pp([Q(1, 0, 1), Q(1, 1, 1), Q(1, 1, 0), Q(1, 0, 0)], r) + pp([Q(0, 1, 1), Q(1, 1, 1), Q(1, 1, 0), Q(0, 1, 0)], l);
      };
      const ops = { A: [izq, top, der], B: [top, der, izq], C: [der, izq, top] };
      ops[correcta] = [top, izq, der];
      const xs = { A: 230, B: 500, C: 770 };
      const piezas = Object.entries(ops).map(([k, [t, l, r]]) => `<text x="${xs[k]}" y="745" text-anchor="middle" font-family="L" font-size="80" fill="#111">${k}</text>` + pieza(t, l, r, xs[k])).join("");
      return {
        w: 1000, h: 1110,
        html: `<div style="width:1000px;height:1110px;background:${fondo};position:relative">
          <div style="height:150px;background:${cabecera};display:flex;align-items:center;justify-content:center;text-align:center;font-family:L;font-size:62px;line-height:1.05;color:#fff;padding:0 30px">¿QUÉ PIEZA ENCAJA<br>CORRECTAMENTE?</div>
          <svg width="1000" height="1110" viewBox="0 -150 1000 1110" style="position:absolute;left:0;top:0;overflow:visible">${g}${piezas}</svg>
        </div>`,
      };
    };
    out["cubo-a"] = cubo("#FFD43B", "#7048E8", "#F76707", "B", "#FFF9DB", "#5F3DC4");
    out["cubo-b"] = cubo("#F8F9FA", "#E64980", "#12B886", "C", "#E6FCF5", "#C2255C");
    out["cubo-c"] = cubo("#FF922B", "#1C7ED6", "#FAB005", "A", "#E7F5FF", "#1864AB");
    // 44–46: "Mueve tres números…" con distinto resultado, números y colores
    const numeros = (obj, nums, fondo1, fondo2, borde, acento, bolas) => ({
      w: 1000, h: 940,
      html: `<div style="width:1000px;height:940px;background:linear-gradient(160deg,${fondo1},${fondo2});padding:34px 40px;display:flex;flex-direction:column;align-items:center;gap:30px">
        <div style="font-weight:900;font-size:60px;line-height:1.08;color:#fff;text-align:center">Mueve tres números para que el resultado sea <span style="color:${acento}">${obj}</span></div>
        <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.08);border:6px solid ${borde};border-radius:40px;padding:22px 30px">
          ${hueco(130, borde)}${signo("+", borde)}${hueco(130, borde)}${signo("+", borde)}${hueco(130, borde)}${signo("=", borde)}${circulo(String(obj), acento, "#1C1A1A", "#1C1A1A", 150, 72)}
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,170px);gap:30px;background:rgba(0,0,0,.25);border-radius:44px;padding:34px 44px;border:6px solid ${borde}">
          ${nums.map((n, i) => circulo(String(n), bolas[i % bolas.length], "#1C1A1A", "#1C1A1A", 170, String(n).length > 1 ? 72 : 86)).join("")}
        </div></div>`,
    });
    out["numeros-16"] = numeros(16, [7, 3, 10, 6, 4, 9, 5, 8], "#5B2A86", "#2E1A5C", "#8EF0C8", "#FFD43B", ["#FF6B6B", "#4DABF7", "#FFD43B", "#69DB7C"]);
    out["numeros-20"] = numeros(20, [11, 2, 9, 5, 14, 1, 6, 12], "#0B7285", "#0B3D4A", "#FFC9C9", "#FF8787", ["#FFD8A8", "#B2F2BB", "#FFF3BF", "#D0BFFF"]);
    out["numeros-18"] = numeros(18, [4, 13, 7, 2, 15, 8, 3, 10], "#C92A2A", "#5C0F0F", "#FFE066", "#FFE066", ["#A5D8FF", "#FFFFFF", "#FFC078", "#96F2D7"]);
    // 49–51: "El 99% falla este cálculo" con distinto resultado, números y color de bolas
    const calculo = (obj, nums, c1, c2, c3, fondo) => {
      const bola = (n) => `<div style="width:230px;height:230px;border-radius:50%;background:radial-gradient(circle at 35% 30%,${c1} 0%,${c2} 45%,${c3} 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:125px;color:#fff;text-shadow:0 6px 0 rgba(0,0,0,.3);box-shadow:0 18px 24px rgba(0,0,0,.25)">${n}</div>`;
      return {
        w: 1000, h: 880,
        html: `<div style="width:1000px;height:880px;background:${fondo};display:flex;flex-direction:column;align-items:center;padding-top:34px;gap:34px">
          <div style="font-weight:900;font-size:72px;color:#1C1A1A">El 99% falla este cálculo:</div>
          <div style="display:flex;align-items:center;gap:18px">${hueco(140, "#1C1A1A")}${signo("+", "#1C1A1A", 100)}${hueco(140, "#1C1A1A")}${signo("+", "#1C1A1A", 100)}${hueco(140, "#1C1A1A")}${signo("= " + obj, "#1C1A1A", 96)}</div>
          <div style="display:grid;grid-template-columns:repeat(3,230px);gap:34px 80px">${nums.map(bola).join("")}</div>
        </div>`,
      };
    };
    out["calculo-17"] = calculo(17, [3, 4, 9, 8, 7, 2], "#9BD4FF", "#1971C2", "#0B3D75", "linear-gradient(#F4F7FB,#DCE6F2)");
    out["calculo-20"] = calculo(20, [5, 11, 6, 3, 14, 8], "#B2F2BB", "#2B8A3E", "#0B4A1E", "linear-gradient(#F4FCE3,#D8F5A2)");
    out["calculo-13"] = calculo(13, [2, 7, 1, 9, 4, 6], "#FFD8A8", "#E8590C", "#7A2A04", "linear-gradient(#FFF4E6,#FFE8CC)");
    return out;
  })(),

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
