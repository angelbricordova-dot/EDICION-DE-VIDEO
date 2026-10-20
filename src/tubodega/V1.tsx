import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { evolvePath } from "@remotion/paths";
import { clamp01, easeIn, easeOut, FPS, lerp, prog, sp } from "../tucacas/estilo";
import type { Frase } from "../tucacas/guiones";
import { B, camara, cargarFuentes, Fondo, H, IconoWhatsApp, JAKARTA, Marca, pantalla, Pastilla, PH, PW, Subtitulos, Telefono, Titular, Toque, W } from "./piezas";
import guionJson from "./guion-v1.json";

// V1 · Promo 30 s "Deja el cuaderno" (marketing/GUIONES.md). Tiempos en guion-v1.json
// (scripts/guion_tubodega.py), anclados a la voz.

type Guion = { duracion: number; marcas: Record<string, number>; frases: Frase[] };
export const GUION_V1 = guionJson as unknown as Guion;
const M = GUION_V1.marcas;

export type PropsV1 = { audio: string | null; whatsapp: string };

/** Cuaderno de papel con anotaciones a mano que se tacha cuando la voz dice "cuaderno". */
const Cuaderno: React.FC<{ t: number }> = ({ t }) => {
  const entra = sp(t, 0.15, { damping: 12, stiffness: 160 });
  const tacha = prog(t, M.cuaderno + 0.1, M.cuaderno + 0.5, easeOut);
  const sale = prog(t, M.s2 - 0.3, M.s2, easeIn);
  const d = "M 30 40 L 330 380";
  const d2 = "M 330 40 L 30 380";
  const a = evolvePath(Math.max(0.001, tacha), d);
  const b = evolvePath(Math.max(0.001, clamp01(tacha * 1.6 - 0.6)), d2);
  return (
    <div style={{ position: "absolute", left: 30, top: 1010, width: 360, height: 420, rotate: `${lerp(-30, -9, entra) - sale * 20}deg`, translate: `${(1 - entra) * -500 - sale * 600}px ${sale * 200}px` }}>
      <svg width={360} height={420} style={{ overflow: "visible", filter: "drop-shadow(0 20px 30px rgba(23,32,28,0.25))" }}>
        <rect x={0} y={0} width={360} height={420} rx={22} fill="#fffdf4" stroke="#d8d2bd" strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={20} x2={340} y1={70 + i * 38} y2={70 + i * 38} stroke="#bcd3e6" strokeWidth={3} />
        ))}
        <line x1={64} x2={64} y1={0} y2={420} stroke="#f2a1a1" strokeWidth={3} />
        {[["Sra. Carmen", "8,50"], ["José", "3,30"], ["???", "¿?"], ["Luis", "2,—"], ["Pedro", "5"]].map(([n, m], i) => (
          <text key={i} x={78} y={62 + i * 38 * 1.6} fontFamily="'Comic Sans MS', 'Segoe Print', cursive" fontSize={30} fill="#3a4a8a" transform={`rotate(${(i % 2 ? 1.5 : -1.5)} 78 ${62 + i * 61})`}>
            {n} … {m}
          </text>
        ))}
        <path d={d} stroke={B.rojo} strokeWidth={20} strokeLinecap="round" fill="none" strokeDasharray={a.strokeDasharray} strokeDashoffset={a.strokeDashoffset} />
        <path d={d2} stroke={B.rojo} strokeWidth={20} strokeLinecap="round" fill="none" strokeDasharray={b.strokeDasharray} strokeDashoffset={b.strokeDashoffset} />
      </svg>
    </div>
  );
};

/** El ticket real (pantalla 24) sale hacia arriba de una impresora térmica. */
const Impresora: React.FC<{ t: number }> = ({ t }) => {
  const entra = sp(t, M.s6, { damping: 14, stiffness: 150 });
  const sale = prog(t, M.s7 - 0.3, M.s7, easeIn);
  const imprime = prog(t, M.s6 + 0.25, M.s6 + 1.9, (x) => x);
  const altoTicket = 1460; // parte de la pantalla 24 con el ticket
  const ancho = 560;
  const s = ancho / PW;
  const visible = altoTicket * s * imprime;
  const ranuraY = 1290;
  const vib = imprime > 0 && imprime < 1 ? Math.sin(t * 90) * 2 : 0;
  return (
    <AbsoluteFill style={{ translate: `0 ${(1 - entra) * 1200 + sale * 1400}px` }}>
      {/* Ticket saliendo por la ranura. */}
      <div style={{ position: "absolute", left: W / 2 - ancho / 2, top: ranuraY - visible, width: ancho, height: visible, overflow: "hidden", boxShadow: "0 20px 40px rgba(23,32,28,0.18)" }}>
        <Img src={pantalla("24-ticket-impreso.png")} style={{ position: "absolute", left: 0, top: 0, width: ancho, height: PH * s }} />
      </div>
      {/* Impresora. */}
      <div style={{ position: "absolute", left: W / 2 - 360, top: ranuraY - 20 + vib, width: 720, height: 330, borderRadius: 60, background: "linear-gradient(180deg, #2c3531 0%, #151b18 100%)", boxShadow: "0 40px 80px rgba(23,32,28,0.35), inset 0 3px 0 rgba(255,255,255,0.12)" }}>
        <div style={{ position: "absolute", left: 70, right: 70, top: 26, height: 16, borderRadius: 8, background: "#0b0f0d" }} />
        <div style={{ position: "absolute", left: 60, bottom: 50, width: 30, height: 30, borderRadius: "50%", background: imprime > 0 && imprime < 1 ? "#55e39c" : "#2f6e50", boxShadow: imprime > 0 && imprime < 1 ? "0 0 20px #55e39c" : "none" }} />
        <div style={{ position: "absolute", right: 60, bottom: 46, fontFamily: JAKARTA, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em" }}>58 mm</div>
      </div>
    </AbsoluteFill>
  );
};

const SinWifi: React.FC<{ t: number }> = ({ t }) => {
  const k = sp(t, M.internet, { damping: 10, stiffness: 230, mass: 0.6 });
  if (k <= 0) return null;
  const sale = prog(t, M.s7 - 0.3, M.s7, easeIn);
  return (
    <div style={{ position: "absolute", left: 50, top: 640, width: 190, height: 190, borderRadius: 60, background: B.blanco, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 50px rgba(23,32,28,0.2)", scale: String(k * (1 - sale)), rotate: `${(1 - k) * 25}deg` }}>
      <svg width={120} height={120} viewBox="0 0 24 24">
        <path d="M2 8.5a15 15 0 0 1 20 0 M5 12a10 10 0 0 1 14 0 M8.5 15.5a5 5 0 0 1 7 0" fill="none" stroke={B.verde} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={12} cy={19} r={1.4} fill={B.verde} />
        <line x1={4} y1={3} x2={20} y2={21} stroke={B.rojo} strokeWidth={2.4} strokeLinecap="round" />
      </svg>
    </div>
  );
};

const METODOS: [string, string][] = [
  ["Pago Móvil", "pagomovil"],
  ["Punto", "punto"],
  ["Zelle", "zelle"],
  ["Efectivo", "efectivo"],
  ["Fiado", "fiado"],
];

const Cierre: React.FC<{ t: number; whatsapp: string }> = ({ t, whatsapp }) => {
  const tel = sp(t, M.s7 + 0.35, { damping: 15, stiffness: 120 });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
        <Marca t={t} t0={M.s7} tam={130} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Pastilla t={t} t0={M.gratis} texto="Prueba 15 días gratis" tam={62} />
        <Pastilla t={t} t0={M.whatsapp} texto={`WhatsApp ${whatsapp}`} fondo={B.texto} tam={50} icono={<IconoWhatsApp tam={56} />} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 230, top: 920, width: 460, height: 996, translate: `0 ${(1 - tel) * 900}px`, rotate: `${(1 - tel) * 6}deg` }}>
        <div style={{ position: "absolute", inset: -18, borderRadius: 80, background: "#121815", boxShadow: "0 60px 120px rgba(23,32,28,0.35)" }} />
        <Img src={pantalla("01-venta-inicio.png")} style={{ position: "absolute", inset: 0, width: 460, height: 996, borderRadius: 64 }} />
      </div>
    </AbsoluteFill>
  );
};

export const PromoV1: React.FC<PropsV1> = ({ audio, whatsapp }) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // El teléfono está desde el inicio hasta la escena 6 (no vuelve a entrar entre escenas).
  const telEntra = sp(t, 0.1, { damping: 14, stiffness: 130 });
  const telSale = prog(t, M.s6 - 0.2, M.s6 + 0.25, easeIn);
  const contenidos = [
    { t: 0, img: "12-cuaderno-fiados.png" },
    { t: M.s2, clip: "01-escanear-y-cobrar.mp4", inicio: 0 },
    { t: M.s3, img: "09-vuelto-efectivo.png" },
    { t: M.s4, img: "08-pago-movil.png" },
    { t: M.fiado - 0.3, img: "11-credito-fiado.png" },
    { t: M.s5, img: "12-cuaderno-fiados.png" },
    { t: M.vendiste + 0.4, img: "17-cuadre-del-dia.png" },
  ];
  const cam = [
    camara(0, 585, 1266, 1.0),
    camara(0.75, 585, 1266, 1.0),
    camara(1.15, 470, 560, 1.5, -2),
    camara(M.s2 - 0.05, 470, 560, 1.5, -2),
    camara(M.s2 + 0.3, 585, 1266, 1.0),
    camara(M.s2 + 0.45, 585, 1266, 1.0),
    camara(M.s2 + 0.85, 585, 470, 1.55, 2),
    camara(M.s2 + 2.6, 585, 470, 1.55, 2),
    camara(M.s2 + 3.0, 585, 1150, 1.25, 0),
    camara(M.s3 - 0.05, 585, 1150, 1.25),
    camara(M.s3 + 0.3, 585, 1266, 1.0),
    camara(M.vuelto - 0.4, 585, 1266, 1.0),
    camara(M.vuelto, 585, 1760, 2.0, -2),
    camara(M.s4 - 0.05, 585, 1760, 2.0, -2),
    camara(M.s4 + 0.3, 420, 600, 1.45, 0),
    camara(M.punto, 420, 600, 1.45),
    camara(M.punto + 0.35, 585, 1540, 1.6, 2),
    camara(M.fiado - 0.35, 585, 1540, 1.6, 2),
    camara(M.fiado, 585, 1520, 1.75, 0),
    camara(M.s5 - 0.05, 585, 1520, 1.75),
    camara(M.s5 + 0.3, 585, 1300, 1.6, -2),
    camara(M.vendiste + 0.35, 585, 1300, 1.6, -2),
    camara(M.vendiste + 0.75, 585, 640, 1.75, 0),
    camara(M.ganaste - 0.1, 585, 640, 1.75),
    camara(M.ganaste + 0.3, 700, 760, 1.9, 2),
  ];
  const toques = (
    <>
      <Toque t={t} t0={M.pagomovil + 0.3} x={290} y={380} />
      <Toque t={t} t0={M.fiado - 0.05} x={585} y={1525} r={140} />
    </>
  );

  return (
    <AbsoluteFill style={{ background: B.fondo, overflow: "hidden" }}>
      <Fondo t={t} tono={t >= M.s7 ? "claro" : "claro"} />
      {t < M.s6 + 0.3 ? <Telefono t={t} contenidos={contenidos} camara={cam} cy={960} entra={telEntra * (1 - telSale)} extra={toques} /> : null}
      {t < M.s2 ? <Cuaderno t={t} /> : null}
      {t >= M.s6 - 0.1 && t < M.s7 + 0.1 ? <Impresora t={t} /> : null}
      {t >= M.s6 ? <SinWifi t={t} /> : null}
      {t >= M.s7 - 0.05 ? <Cierre t={t} whatsapp={whatsapp} /> : null}

      {/* Titulares (texto en pantalla) en la zona alta, dentro de la zona segura. */}
      <Titular t={t} y={240} tam={80} hasta={M.s2} lineas={[{ texto: "¿Todavía anotas", t0: 0.05 }, { texto: "los fiados en", t0: 0.45, verdes: ["fiados"] }, { texto: "un cuaderno?", t0: 1.0, verdes: ["cuaderno"] }]} />
      <Titular t={t} y={240} tam={96} hasta={M.s3} lineas={[{ texto: "Escaneas… y listo", t0: M.escaneas, verdes: ["listo"] }]} />
      <Titular t={t} y={240} tam={80} hasta={M.s4} lineas={[{ texto: "Dólares y bolívares.", t0: M.s3 + 0.05, verdes: ["dólares", "bolívares"] }, { texto: "El vuelto, calculado.", t0: M.vuelto - 0.1, verdes: ["calculado"] }]} />
      {t >= M.s4 && t < M.s5 ? (
        <div style={{ position: "absolute", left: 60, right: 90, top: 250, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, opacity: 1 - prog(t, M.s5 - 0.2, M.s5) }}>
          {METODOS.map(([n, k]) => (
            <Pastilla key={n} t={t} t0={M[k]} texto={n} tam={52} fondo={n === "Fiado" ? B.morado : B.verde} />
          ))}
        </div>
      ) : null}
      <Titular t={t} y={240} tam={80} hasta={M.s6} lineas={[{ texto: "Sabes quién te debe", t0: M.s5 + 0.05, verdes: ["debe"] }, { texto: "y cuánto ganaste hoy", t0: M.ganaste - 0.15, verdes: ["ganaste"] }]} />
      <Titular t={t} y={240} tam={80} hasta={M.s7} lineas={[{ texto: "Imprime tu ticket.", t0: M.s6 + 0.05, verdes: ["ticket"] }, { texto: "Funciona sin internet.", t0: M.internet, verdes: ["internet"] }]} />

      {t < M.s7 ? <Subtitulos frases={GUION_V1.frases} t={t} y={1440} /> : null}
      {t >= M.fin - 0.12 ? <AbsoluteFill style={{ background: B.fondo }} /> : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Portada: el titular grande sobre el fondo de marca con el teléfono. */
export const PortadaV1: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill style={{ background: B.fondo }}>
      <Fondo t={3} />
      <Titular t={10} y={260} tam={110} lineas={[{ texto: "Deja el", t0: 0 }, { texto: "cuaderno", t0: 0, verdes: ["cuaderno"] }]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640 }}>
        <Marca t={10} t0={0} tam={78} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 250, top: 860, width: 500, height: 1082 }}>
        <div style={{ position: "absolute", inset: -20, borderRadius: 86, background: "#121815", boxShadow: "0 60px 120px rgba(23,32,28,0.35)" }} />
        <Img src={pantalla("12-cuaderno-fiados.png")} style={{ position: "absolute", inset: 0, width: 500, height: 1082, borderRadius: 68 }} />
      </div>
    </AbsoluteFill>
  );
};
