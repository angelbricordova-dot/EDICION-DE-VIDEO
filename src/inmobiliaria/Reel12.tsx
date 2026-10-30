import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../comun/animacion";
import { AMARILLO, bloques, cargarFuentes, clamp01, Corte, Destello, easeInOut, INTER, lerp, Palabra, Persona, Pop, prog, sp, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, Grande, limpio, Pildora } from "./comunes";
import { Banco } from "./iconos";
import hook1 from "./g12-hook1.json";
import hook2 from "./g12-hook2.json";
import cuerpo from "./g12-cuerpo.json";

// Reel 12 "ranking de bancos para hipotecas" (guion 12, cámara lateral, bruto vertical 4K). Igual
// que el ranking de portales (reel 8) pero con 8 puestos: cada banco aparece arriba con su logo
// real cuando lo nombra y, al decir "número N", vuela a su puesto. Píldoras con el veredicto y
// CTA con la caja de comentario (CALCULADORA).

type CorteReel = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G12: Record<"hook1" | "hook2" | "cuerpo", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel, cuerpo: cuerpo as CorteReel };

export type PropsReel12 = { audio: string | null; version: keyof typeof G12 };

const CARA = { x: 985, y: 1330 };
const DESTINO = { x: 680, y: 990 };

const COL = { x: 34, y0: 450, paso: 112 };
const REVELA = { x: 650, y: 520 };
const MAX_ANCHO = 330; // en la columna, para no acercarse a la cara

// Logos en public/inmobiliaria/logos/ (Wikimedia Commons y web de ING): logotipos horizontales sobre
// una tarjeta (blanca o del color del banco).
type Marca = { logo: string; ratio: number; tarjeta?: string; escala?: number };
const MARCAS: Record<string, Marca> = {
  santander: { logo: "banco-santander.png", ratio: 1280 / 223 },
  traderepublic: { logo: "banco-traderepublic.png", ratio: 1279 / 110 },
  bbva: { logo: "banco-bbva.png", ratio: 1280 / 384 },
  eurocaja: { logo: "banco-eurocaja.png", ratio: 937 / 374, tarjeta: "#307756", escala: 0.86 },
  ing: { logo: "banco-ing.png", ratio: 1200 / 298 },
  ibercaja: { logo: "banco-ibercaja.png", ratio: 1280 / 238 },
  caixabank: { logo: "banco-caixabank.png", ratio: 1274 / 258 },
  unicaja: { logo: "banco-unicaja.png", ratio: 1273 / 371 },
};

/** Alto y ancho del logo dentro de la tarjeta (alto ≈ 2,2 × tam, ancho limitado). */
const medidas = (m: Marca, tam: number, maxAncho?: number) => {
  const alto = tam * 2.2;
  let h = alto * (m.escala ?? 0.62);
  if (maxAncho) h = Math.min(h, (maxAncho - alto * 0.44) / m.ratio);
  return { alto, h, ancho: h * m.ratio + alto * 0.44 };
};

const Chip: React.FC<{ m: Marca; tam: number; maxAncho?: number }> = ({ m, tam, maxAncho }) => {
  const { alto, h } = medidas(m, tam, maxAncho);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", height: alto, padding: `0 ${alto * 0.22}px`, borderRadius: alto * 0.22, background: m.tarjeta ?? "#fff", boxShadow: `0 ${tam * 0.18}px ${tam * 0.4}px rgba(0,0,0,0.45)` }}>
      <Img src={staticFile(`inmobiliaria/logos/${m.logo}`)} style={{ height: h, display: "block" }} />
    </div>
  );
};

const Check: React.FC<{ ok: boolean }> = ({ ok }) => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={ok ? "#22B53A" : "#E3141F"} />
    {ok ? <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);
const Telefono: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M6.6 3 L9.6 3 L11 7.5 L8.8 9 C9.8 11.3 12.7 14.2 15 15.2 L16.5 13 L21 14.4 L21 17.4 C21 19 19.7 20.5 18 20.4 C10.5 19.8 4.2 13.5 3.6 6 C3.5 4.3 5 3 6.6 3 Z" fill="#2B7DE9" stroke="#111" strokeWidth={1} />
  </svg>
);
const Aviso: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M12 2.5 L22.5 20.5 H1.5 Z" fill="#FFC21A" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M12 9 V14" stroke="#111" strokeWidth={2.4} strokeLinecap="round" />
    <circle cx={12} cy={17.2} r={1.3} fill="#111" />
  </svg>
);
const Pin: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M12 22 C12 22 4.5 13.8 4.5 9 A7.5 7.5 0 0 1 19.5 9 C19.5 13.8 12 22 12 22 Z" fill="#307756" stroke="#111" strokeWidth={1} />
    <circle cx={12} cy={9} r={2.8} fill="#fff" />
  </svg>
);
const Hucha: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <ellipse cx={11.5} cy={13} rx={8.5} ry={6.5} fill="#F59FB4" stroke="#111" strokeWidth={1} />
    <rect x={8.5} y={5.6} width={5} height={1.6} rx={0.8} fill="#111" />
    <circle cx={15.5} cy={11.5} r={0.9} fill="#111" />
    <path d="M7 18.5 V21 M15.5 18.5 V21" stroke="#111" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);
const Calculadora: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <rect x={4.5} y={2} width={15} height={20} rx={2.5} fill="#2A3340" />
    <rect x={6.5} y={4} width={11} height={4.5} rx={1} fill="#B6FF6A" />
    {[0, 1, 2].flatMap((f) => [0, 1, 2].map((c) => <rect key={`${f}${c}`} x={6.5 + c * 4} y={10.5 + f * 3.6} width={3} height={2.6} rx={0.6} fill={f === 2 && c === 2 ? AMARILLO : "#fff"} />))}
  </svg>
);

export const Reel12: React.FC<PropsReel12> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G12[version];

  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  const iSan = tras("Santander");
  const iTra = tras("Trade", iSan);
  const iBbv = tras("BBVA,", iTra);
  const iEur = tras("Eurocaja", iBbv);
  const iIng = tras("ING.", iEur);
  const iIbe = tras("Ibercaja.", iIng);
  const iCai = tras("CaixaBank.", iIbe);
  const iUno = tras("¿y", iCai);
  const iUni = tras("Unicaja,", iUno);
  const yEsQue = tras("Y", tras("vez.", iUni));
  const para = tras("Para", yEsQue);
  const ranking: { k: string; puesto: number; aparece: number; vuela: number; hasta: number }[] = [
    { k: "santander", puesto: 4, aparece: iSan, vuela: tras("Número", iSan), hasta: iTra },
    { k: "traderepublic", puesto: 8, aparece: iTra, vuela: tras("número", iTra), hasta: iBbv },
    { k: "bbva", puesto: 7, aparece: iBbv, vuela: tras("número", iBbv), hasta: iEur },
    { k: "eurocaja", puesto: 2, aparece: iEur, vuela: tras("Número", iEur), hasta: iIng },
    { k: "ing", puesto: 6, aparece: iIng, vuela: tras("Número", iIng), hasta: iIbe },
    { k: "ibercaja", puesto: 3, aparece: iIbe, vuela: tras("Número", iIbe), hasta: iCai },
    { k: "caixabank", puesto: 5, aparece: iCai, vuela: tras("Número", iCai), hasta: iUno },
    { k: "unicaja", puesto: 1, aparece: iUni, vuela: tras("competitivo", iUni) + 0.3, hasta: yEsQue },
  ];

  const pildoras: { desde: number; icono: React.ReactNode; texto: string }[] = [
    { desde: tras("grandes,", iSan), icono: <Banco tam={60} />, texto: "De los grandes" },
    { desde: tras("No", iSan), icono: <Check ok={false} />, texto: "Poco dinero, poco caso" },
    { desde: tras("hipotecas", iTra), icono: <Check ok={false} />, texto: "Para hipotecas" },
    { desde: tras("remunerada", iTra), icono: <Hucha />, texto: "Cuenta remunerada" },
    { desde: tras("difícil", iBbv), icono: <Check ok={false} />, texto: "Aún más difícil" },
    { desde: tras("Buenos", iEur), icono: <Check ok />, texto: "Buenos tipos" },
    { desde: tras("pueblo", iEur), icono: <Pin />, texto: "Oficina en cada pueblo" },
    { desde: tras("teléfono,", iIng), icono: <Telefono />, texto: "Todo por teléfono" },
    { desde: tras("cuidado", iIng), icono: <Aviso />, texto: "Cuidado con lo que dices" },
    { desde: tras("Buenos", iIbe), icono: <Check ok />, texto: "Buenos tipos" },
    { desde: tras("estudian", iIbe), icono: <Check ok />, texto: "Te estudian bien" },
    { desde: tras("grande,", iCai), icono: <Banco tam={60} />, texto: "Es grande" },
    { desde: tras("pequeña", iCai), icono: <Check ok={false} />, texto: "Hipoteca pequeña" },
    { desde: tras("buenos", iUni), icono: <Check ok />, texto: "Buenos tipos" },
    { desde: tras("fijo", iUni), icono: <Check ok />, texto: "Fijo competitivo" },
    { desde: tras("varias", iUni), icono: <Check ok />, texto: "Varias hipotecas a la vez" },
    { desde: tras("calculadora", para), icono: <Calculadora />, texto: "Calculadora de hipotecas" },
  ];
  const segunda = tras("segunda", yEsQue);
  const comenta = tras("Comenta", para);
  const finPildoras = [...pildoras.map((p) => p.desde).slice(1), comenta - 0.1];
  const cortesPildora = [...ranking.map((r) => r.aparece), yEsQue - 0.1, comenta - 0.1];

  // Zoom suave y progresivo (como en los reels 8, 9 y 10).
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number, number][] = [
    [tras("No", iSan), 1.1],
    [tras("hipotecas", iTra), 1.12],
    [tras("difícil", iBbv), 1.12],
    [tras("cuidado", iIng), 1.12],
    [tras("pequeña", iCai), 1.1],
    [iUno, 1.14],
    [segunda, 1.14],
  ];
  const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.3, i % 2 ? 1.06 : 1.0]);
  for (const [g, z] of golpes) tramos.push([g - 0.45, z]);
  tramos.sort((a, b) => a[0] - b[0]);
  const DUR = 0.9;
  const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const zoom = (tt: number) => {
    let v = 1;
    let desde = 0;
    for (let k = 0; k < tramos.length; k++) {
      const [t0, z] = tramos[k];
      if (tt < t0) break;
      const fin = k + 1 < tramos.length ? Math.min(tt, tramos[k + 1][0]) : tt;
      v = lerp(v, z, suave((fin - t0) / DUR));
      desde = t0;
    }
    return v * (1 + Math.min(0.03, (tt - desde) * 0.008));
  };

  const subs = bloques(palabras);
  const titulo =
    version === "hook1"
      ? { blanco: "Mejores bancos para sacar", amarillo: "UNA HIPOTECA", t0: tras("hipoteca") }
      : version === "hook2"
        ? { blanco: "Ranking de bancos", amarillo: "PARA HIPOTECAS", t0: tras("hipoteca") }
        : { blanco: "Ranking de bancos", amarillo: "PARA HIPOTECAS", t0: 0.1 };
  const cierre = yEsQue;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="inmobiliaria/g12/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} destino={DESTINO} altoBruto={2560} anchoBruto={1440} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.35) 100%)" }} />

      {/* Título fijo (el hook); se va en el cierre. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 1 - prog(t, cierre - 0.2, cierre + 0.1) }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto={titulo.blanco} tam={58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={titulo.t0 - 0.02}>
            <TextoSombra texto={titulo.amarillo} tam={86} peso={900} color={AMARILLO} />
          </Pop>
        </div>
      </div>

      {/* Columna del ranking 1–8. */}
      <div style={{ opacity: 1 - prog(t, cierre - 0.2, cierre + 0.1) }}>
        {Array.from({ length: 8 }, (_, i) => {
          const puesto = i + 1;
          const y = COL.y0 + i * COL.paso;
          const k = sp(t, 0.15 + i * 0.06, { damping: 12, stiffness: 220, mass: 0.6 });
          const r = ranking.find((x) => x.puesto === puesto)!;
          const lleno = t >= r.vuela + 0.35;
          const destello = lleno ? 1 - clamp01((t - r.vuela - 0.35) / 0.5) : 0;
          const late = puesto === 1 && t >= iUno && t < r.vuela + 0.35 ? 1 + 0.12 * Math.abs(Math.sin((t - iUno) * 6)) : 1;
          return (
            <div key={puesto} style={{ position: "absolute", left: COL.x, top: y, height: 90, display: "flex", alignItems: "center", translate: `${(1 - k) * -160}px 0`, opacity: clamp01(k * 2) }}>
              {lleno ? (
                <div style={{ scale: String(1 + destello * 0.15), filter: destello > 0 ? `drop-shadow(0 0 ${18 * destello}px ${AMARILLO})` : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 58, height: 58, borderRadius: "50%", background: AMARILLO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 36, color: "#1a1a1a", boxShadow: "0 6px 14px rgba(0,0,0,0.4)" }}>{puesto}</div>
                    <Chip m={MARCAS[r.k]} tam={34} maxAncho={MAX_ANCHO} />
                  </div>
                </div>
              ) : (
                <div style={{ width: 78, height: 78, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: `5px solid ${late > 1 ? AMARILLO : "rgba(255,225,77,0.85)"}`, boxShadow: `0 0 ${late > 1 ? 26 : 14}px rgba(255,225,77,0.55)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 42, color: AMARILLO, scale: String(late), textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{puesto}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cada banco aparece arriba con su logo y vuela a su puesto. */}
      {ranking.map((r) => {
        if (t < r.aparece - 0.05 || t >= r.vuela + 0.35) return null;
        const vuelo = easeInOut(prog(t, r.vuela, r.vuela + 0.35));
        const m = MARCAS[r.k];
        const grande = medidas(m, 80, 680);
        const chico = medidas(m, 34, MAX_ANCHO);
        const yPuesto = COL.y0 + (r.puesto - 1) * COL.paso + 45;
        const x = lerp(REVELA.x, COL.x + 68 + chico.ancho / 2, vuelo);
        const y = lerp(REVELA.y, yPuesto, vuelo);
        return (
          <div key={r.k} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(lerp(1, chico.alto / grande.alto, vuelo)) }}>
            <Pop t={t} t0={r.aparece - 0.05} desde={0.4}>
              <Chip m={m} tam={80} maxAncho={680} />
            </Pop>
          </div>
        );
      })}

      {/* Veredictos: una píldora a la vez, arriba a la derecha de la columna. */}
      {pildoras.map((p, i) => {
        const fin = Math.min(finPildoras[i], ...cortesPildora.filter((c) => c > p.desde + 0.05));
        if (t < p.desde - 0.05 || t > fin) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 300, right: 20, top: 640, display: "flex", justifyContent: "center", opacity: 1 - prog(t, fin - 0.15, fin) }}>
            <Pildora t={t} t0={p.desde - 0.05} icono={p.icono} texto={p.texto} />
          </div>
        );
      })}

      {/* "Es el que te deja firmar la segunda hipoteca". */}
      <Grande t={t} desde={segunda - 0.05} hasta={para - 0.1} texto="LA 2.ª HIPOTECA" color="verde" tam={100} y={440} />

      {/* Cierre: comenta CALCULADORA. */}
      <Comentario t={t} desde={comenta - 0.1} escribe={tras("calculadora", comenta)} palabra="CALCULADORA" y={560} />

      <div style={{ position: "absolute", left: 200, right: 0, top: 0, bottom: 0 }}>
        <Subtitulo t={t} lista={subs} y={1450} amarillas={["santander", "trade", "republic", "bbva", "eurocaja", "rural", "ing", "ibercaja", "caixabank", "unicaja", "hipoteca", "hipotecas", "calculadora", "segunda"]} />
      </div>

      <Destello t={t} t0={cierre - 0.3} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
