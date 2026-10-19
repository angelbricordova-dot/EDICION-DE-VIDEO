// Capturas de camis11.com en vista de celular (alta resolución) para animar la demo en Remotion:
// portada completa, ficha de producto con talla/nombre/número y carrito con el código.
// Oculta precios, insignias de oferta y "+1.000 clientes satisfechos" (el brief pide no usarlos).
//
// Uso: G=$(npm root -g) node scripts/capturas_camis11.mjs <carpeta-salida>
import { createRequire } from "module";

const require = createRequire(process.env.G + "/");
const { chromium } = require("playwright");
const OUT = process.argv[2];

const CSS = `
  .price, .woocommerce-Price-amount, del, ins, .onsale, .badge-container, .cart_totals, .product-subtotal,
  .product-price, .woocommerce-mini-cart__total, .yith-wapo-totals, #wapo-total-price-table { visibility: hidden !important; }`;
const limpiar = async (page) => {
  await page.addStyleTag({ content: CSS }).catch(() => {});
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("p,div,section,span,li,h2,h3")) {
      if (/clientes satisfechos/i.test(el.textContent) && el.textContent.length < 400) el.style.visibility = "hidden";
    }
    // Avisos de cookies o ventanas emergentes.
    for (const el of document.querySelectorAll('[id*="cookie"],[class*="cookie"],[class*="popup"],[id*="popup"]')) el.style.display = "none";
  });
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 432, height: 936 },
  deviceScaleFactor: 2.5,
  isMobile: true,
  hasTouch: true,
  locale: "es-ES",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const ir = async (url) => {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 }).catch((e) => console.log("goto", e.message));
  await page.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await limpiar(page);
};
const foto = async (nombre, opciones = {}) => {
  await page.screenshot({ path: `${OUT}/${nombre}.png`, ...opciones });
  console.log("captura", nombre);
};

await ir("https://camis11.com/");
await foto("portada");
await foto("portada-completa", { fullPage: true });

await ir("https://camis11.com/product/edicion-especial-camiseta-japon-dbz-goku/");
await foto("producto");
await foto("producto-completo", { fullPage: true });
// Talla
const talla = page.locator('select[name="attribute_pa_talla"]');
console.log("selector talla visible:", await talla.isVisible().catch(() => false));
await talla.selectOption("l", { force: true }).catch((e) => console.log("talla", e.message));
await page.evaluate(() => {
  const s = document.querySelector('select[name="attribute_pa_talla"]');
  if (s) { s.value = "l"; s.dispatchEvent(new Event("change", { bubbles: true })); }
});
await page.waitForTimeout(800);
// Personalización
for (const [addon, campo, texto] of [["1", "#yith-wapo-1-0", "ONZE"], ["2", "#yith-wapo-2-0", "11"]]) {
  await page.locator(`#yith-wapo-addon-${addon} .addon-header`).click({ timeout: 8000 }).catch((e) => console.log("abre", addon, e.message));
  await page.waitForTimeout(500);
  await page.locator(campo).fill(texto, { timeout: 8000 }).catch((e) => console.log("campo", addon, e.message));
}
await page.locator("#yith-wapo-container").scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(600);
await limpiar(page);
await foto("personalizar");
await foto("personalizar-completo", { fullPage: true });
const boton = page.locator(".single_add_to_cart_button");
console.log("botón carrito:", await boton.count(), await boton.isEnabled().catch(() => "?"));
await boton.click({ timeout: 10000 }).catch((e) => console.log("carrito", e.message));
await page.waitForTimeout(4000);
console.log("tras añadir:", page.url());

await ir("https://camis11.com/cart/");
console.log("carrito:", page.url(), "cupón:", await page.locator('input[name="coupon_code"]').count());
await foto("carrito");
const cupon = page.locator('input[name="coupon_code"]').first();
await cupon.scrollIntoViewIfNeeded().catch(() => {});
await cupon.fill("CAMIS11", { timeout: 8000 }).catch((e) => console.log("cupon", e.message));
await page.waitForTimeout(500);
await foto("carrito-codigo");
await page.locator('button[name="apply_coupon"]').click({ timeout: 8000 }).catch((e) => console.log("aplicar", e.message));
await page.waitForTimeout(4000);
await limpiar(page);
await foto("carrito-aplicado");
await browser.close();
