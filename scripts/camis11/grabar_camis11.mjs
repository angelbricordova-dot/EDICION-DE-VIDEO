// Graba en vista de celular la demostración de camis11.com para el reel:
// portada → edición especial (Japón × Goku) → talla, nombre y número → carrito con el código CAMIS11.
// Los precios y el texto "+1.000 clientes satisfechos" se ocultan (el brief pide no usarlos).
//
// Uso: G=$(npm root -g) node scripts/camis11/grabar_camis11.mjs <carpeta-salida>
// (usa el Playwright global y el Chromium de /opt/pw-browsers)
import { createRequire } from "module";

const require = createRequire(process.env.G + "/");
const { chromium } = require("playwright");
const OUT = process.argv[2];

const CSS = `
  .price, .woocommerce-Price-amount, del, ins, .onsale, .badge-container, .cart_totals, .product-subtotal, .product-price,
  .woocommerce-mini-cart__total, .yith-wapo-totals, #wapo-total-price-table, .cookie-notice-container, #cookie-notice,
  .cmplz-cookiebanner { visibility: hidden !important; }
  html { scroll-behavior: auto !important; }`;
const ocultarTexto = () => {
  for (const el of document.querySelectorAll("p,div,section,span,li,h2,h3")) {
    if (/clientes satisfechos/i.test(el.textContent) && el.textContent.length < 400) el.style.visibility = "hidden";
  }
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
  recordVideo: { dir: OUT, size: { width: 1080, height: 2340 } },
});
await ctx.addInitScript((css) => {
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  });
}, CSS);
const page = await ctx.newPage();
const t0 = Date.now();
const marca = (n) => console.log(`MARCA ${n} ${((Date.now() - t0) / 1000).toFixed(2)}`);
const pausa = (ms) => page.waitForTimeout(ms);
const desliza = async (total, ms) => {
  const pasos = Math.round(ms / 33);
  for (let i = 0; i < pasos; i++) {
    await page.mouse.wheel(0, total / pasos);
    await pausa(33);
  }
};
const ir = async (url) => {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.evaluate(ocultarTexto);
};

// A) Portada y desplazamiento hasta las ediciones especiales.
await ir("https://camis11.com/");
await pausa(1500);
marca("portada");
await pausa(1500);
await desliza(2600, 5000);
await pausa(800);

// B) Producto: talla, nombre y número, al carrito.
await ir("https://camis11.com/product/edicion-especial-camiseta-japon-dbz-goku/");
await pausa(1200);
marca("producto");
await pausa(1200);
await desliza(500, 1200);
await page.selectOption('select[name="attribute_pa_talla"]', "l").catch((e) => console.log("talla", e.message));
await pausa(700);
await page.locator("#yith-wapo-addon-1 .addon-header").click().catch((e) => console.log("abre1", e.message));
await pausa(500);
marca("nombre");
await page.locator("#yith-wapo-1-0").pressSequentially("ONZE", { delay: 160 }).catch((e) => console.log("nombre", e.message));
await pausa(400);
await page.locator("#yith-wapo-addon-2 .addon-header").click().catch((e) => console.log("abre2", e.message));
await pausa(500);
marca("numero");
await page.locator("#yith-wapo-2-0").pressSequentially("11", { delay: 200 }).catch((e) => console.log("numero", e.message));
await pausa(700);
marca("carrito-boton");
await page.locator(".single_add_to_cart_button").click().catch((e) => console.log("carrito", e.message));
await pausa(3000);

// C) Carrito: escribe el código CAMIS11 y lo aplica.
await ir("https://camis11.com/carrito/");
if (!(await page.locator('#coupon_code, input[name="coupon_code"]').count())) await ir("https://camis11.com/cart/");
console.log("URL carrito", page.url());
await pausa(1200);
marca("carrito");
const cupon = page.locator('#coupon_code, input[name="coupon_code"]').first();
await cupon.scrollIntoViewIfNeeded().catch(() => {});
await pausa(600);
await cupon.click().catch((e) => console.log("cupon", e.message));
marca("codigo");
await cupon.pressSequentially("CAMIS11", { delay: 170 }).catch((e) => console.log("codigo", e.message));
await pausa(500);
marca("aplicar");
await page.locator('button[name="apply_coupon"]').click().catch((e) => console.log("aplicar", e.message));
await pausa(3500);
await page.screenshot({ path: `${OUT}/final.png` });
marca("fin");
await ctx.close();
await browser.close();
