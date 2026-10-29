// Capturas de las webs de pisos baratos que nombra el cliente (reels 13, 17 y 18) en vista de
// celular, para animarlas en Remotion (la grabación de video vía proxy sale en blanco).
// Cierra o esconde los avisos de cookies. No se salta protecciones anti-robots: si una web
// responde con un desafío, se anota y se piden las capturas al cliente.
//
// Uso: G=$(npm root -g) node scripts/capturas_webs_inmo.mjs <carpeta-salida> [nombre=url ...]
import { createRequire } from "module";

const require = createRequire(process.env.G + "/");
const { chromium } = require("playwright");
const [OUT, ...pares] = process.argv.slice(2);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 432, height: 936 },
  deviceScaleFactor: 2.5,
  isMobile: true,
  hasTouch: true,
  locale: "es-ES",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const aceptar = async () => {
  for (const txt of ["Aceptar todas", "Aceptar todo", "Aceptar", "ACEPTAR", "Acepto", "Permitir todas", "Aceptar cookies", "Entendido"]) {
    const b = page.getByRole("button", { name: txt, exact: false }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
      return;
    }
  }
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],#onetrust-banner-sdk,.didomi-popup-container'))
      el.style.display = "none";
  });
};
for (const par of pares) {
  const i = par.indexOf("=");
  const nombre = par.slice(0, i);
  const url = par.slice(i + 1);
  const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 }).catch((e) => console.log(nombre, "goto", e.message));
  await page.waitForLoadState("load", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await aceptar();
  await page.waitForTimeout(1200);
  const titulo = await page.title().catch(() => "");
  console.log(nombre, r?.status(), JSON.stringify(titulo), page.url());
  await page.screenshot({ path: `${OUT}/${nombre}.png` });
  await page.screenshot({ path: `${OUT}/${nombre}-completa.png`, fullPage: true }).catch(() => {});
}
await browser.close();
