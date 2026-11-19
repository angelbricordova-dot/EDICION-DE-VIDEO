// Genera el PDF del acuerdo con Jordan (docs/jordan.md): node scripts/jordan/pdf.mjs
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const F = (p) => "data:font/woff2;base64," + fs.readFileSync(path.join(RAIZ, "node_modules/@fontsource", p)).toString("base64");
const fuentes = `<style>
@font-face{font-family:"Source Serif 4";font-weight:400;src:url(${F("source-serif-4/files/source-serif-4-latin-400-normal.woff2")})}
@font-face{font-family:"Source Serif 4";font-weight:700;src:url(${F("source-serif-4/files/source-serif-4-latin-700-normal.woff2")})}
@font-face{font-family:"Inter";font-weight:600;src:url(${F("inter/files/inter-latin-600-normal.woff2")})}
@font-face{font-family:"Inter";font-weight:700;src:url(${F("inter/files/inter-latin-700-normal.woff2")})}
</style>`;
const html = fs.readFileSync(path.join(RAIZ, "scripts/jordan/acuerdo.html"), "utf8").replace("</head>", fuentes + "</head>");
const nav = await chromium.launch();
const pag = await nav.newPage();
await pag.setContent(html);
await pag.evaluate(() => document.fonts.ready);
await pag.pdf({ path: path.join(RAIZ, "out/jordan/enviar/Acuerdo-edicion-video.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
await nav.close();
console.log("listo");
