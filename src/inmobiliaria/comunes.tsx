import React from "react";
import { AMARILLO, clamp01, INTER, Pop, prog, sp, TextoSombra, Texto3D } from "./piezas";

// Piezas de pantalla comunes a los reels inmobiliarios (estilo aprobado en el reel 6):
// lista numerada bajo el título, píldoras sobre el pecho, pegatinas junto al hombro, texto
// grande sobre el pecho y la caja de comentario del CTA.

export const limpio = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;…"]/g, "");

/** Lista 1-2-3 bajo el título: círculos grises; el punto activo se llena en amarillo y muestra su texto. */
export const Lista: React.FC<{ t: number; puntos: string[]; tiempos: (number | null)[]; aviso?: number | null; hechos?: number | null; ancho?: number }> = ({ t, puntos, tiempos, aviso, hechos, ancho: anchoMax = 420 }) => {
  let activo = -1;
  tiempos.forEach((t0, i) => {
    if (t0 !== null && t >= t0) activo = i;
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
      {puntos.map((texto, i) => {
        const t0 = tiempos[i];
        const empezo = t0 !== null && t >= t0;
        const abierto = i === activo ? clamp01(sp(t, t0 ?? 0, { damping: 13, stiffness: 200, mass: 0.6 })) : 0;
        // El punto anterior se cierra (queda solo el número) cuando empieza el siguiente.
        const tAct = activo >= 0 ? tiempos[activo] : null;
        const cierra = i < activo && tAct !== null ? 1 - prog(t, tAct, tAct + 0.3) : 0;
        const ancho = Math.max(abierto, cierra);
        // "Atento a la tercera": el 3 late antes de que empiece la lista.
        const late = aviso !== null && aviso !== undefined && i === puntos.length - 1 && t >= aviso && activo < 0 ? 1 + 0.12 * Math.abs(Math.sin((t - aviso) * 6)) : 1;
        const tHecho = hechos !== null && hechos !== undefined ? hechos + i * 0.18 : null;
        const hecho = tHecho !== null && t >= tHecho;
        const kHecho = hecho ? sp(t, tHecho!, { damping: 10, stiffness: 260, mass: 0.5 }) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 74, padding: `0 ${ancho > 0.02 ? 22 : 8}px 0 8px`, borderRadius: 40, background: empezo || hecho ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.28)", boxShadow: i === activo || late > 1 ? `0 0 0 3px ${AMARILLO}` : "none", scale: String(late) }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: empezo || late > 1 ? AMARILLO : "radial-gradient(circle at 35% 30%, #EDEDED, #9A9A9A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 38, color: "#1a1a1a" }}>
              {hecho ? (
                <svg width={44} height={44} viewBox="0 0 24 24" style={{ scale: String(kHecho) }}>
                  <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#14301A" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div style={{ overflow: "hidden", maxWidth: anchoMax * ancho }}>
              <TextoSombra texto={texto} tam={38} peso={800} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Píldora blanca con un objeto (detalles sobre el pecho, debajo de la cara). */
export const Pildora: React.FC<{ t: number; t0: number; icono: React.ReactNode; texto: string; flecha?: { k: number; sube: boolean } }> = ({ t, t0, icono, texto, flecha }) => (
  <Pop t={t} t0={t0} desde={0.5}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "6px 20px 6px 8px", boxShadow: "0 12px 26px rgba(0,0,0,0.35)" }}>
      <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 37, color: "#151515", whiteSpace: "nowrap" }}>{texto}</span>
      {flecha ? (
        <svg width={56} height={56} viewBox="0 0 24 24" style={{ opacity: flecha.k, translate: `0 ${(1 - flecha.k) * (flecha.sube ? 16 : -16)}px`, rotate: flecha.sube ? "0deg" : "180deg" }}>
          <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={flecha.sube ? "#22B53A" : "#E3141F"} stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      ) : null}
    </div>
  </Pop>
);

/** Objeto suelto junto al hombro derecho (fuera de la cara). */
export const Pegatina: React.FC<{ t: number; desde: number; hasta: number; x?: number; y?: number; giro?: number; children: React.ReactNode }> = ({ t, desde, hasta, x = 770, y = 1000, giro = 6, children }) => {
  if (t < desde || t > hasta + 0.2) return null;
  const sale = prog(t, hasta, hasta + 0.2);
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${giro}deg`, opacity: 1 - sale, scale: String(1 - sale * 0.3) }}>
      <Pop t={t} t0={desde} desde={0.4}>
        <div style={{ translate: `0 ${Math.sin((t - desde) * 2.6) * 6}px` }}>{children}</div>
      </Pop>
    </div>
  );
};

/** Texto grande sobre el pecho (los subtítulos se ocultan mientras está). */
export const Grande: React.FC<{ t: number; desde: number; hasta: number; texto: string; color?: "verde" | "rojo"; tam?: number; y?: number }> = ({ t, desde, hasta, texto, color = "verde", tam = 118, y = 1130 }) =>
  t >= desde && t < hasta ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <Pop t={t} t0={desde}>
        <Texto3D texto={texto} tam={tam} color={color} />
      </Pop>
    </div>
  ) : null;

/** Caja de comentario que se escribe sola con la palabra del CTA. */
export const Comentario: React.FC<{ t: number; desde: number; escribe: number; palabra: string; y?: number }> = ({ t, desde, escribe, palabra, y = 1040 }) => {
  if (t < desde) return null;
  const dEscribir = 0.09 * palabra.length;
  const letras = Math.floor(clamp01((t - escribe) / dEscribir) * palabra.length);
  const tEnvio = escribe + dEscribir + 0.35;
  const enviado = t > tEnvio;
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y }}>
      <Pop t={t} t0={desde} desde={0.6}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: 112, borderRadius: 56, background: "rgba(22,24,28,0.92)", border: "2px solid rgba(255,255,255,0.18)", padding: "0 16px 0 18px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #FEDA75, #D62976 55%, #4F5BD5)", padding: 4 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#2B2F36", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24">
                <circle cx={12} cy={9} r={4} fill="#9AA3AF" />
                <path d="M4 21 a8 7 0 0 1 16 0 Z" fill="#9AA3AF" />
              </svg>
            </div>
          </div>
          <div style={{ flex: 1, fontFamily: INTER, fontWeight: letras ? 800 : 500, fontSize: 46, color: letras ? "#fff" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            {letras ? palabra.slice(0, letras) : "Añade un comentario…"}
            {letras && !enviado && cursor ? <span style={{ color: AMARILLO }}>|</span> : null}
          </div>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: enviado ? AMARILLO : "#4F5BD5", display: "flex", alignItems: "center", justifyContent: "center", scale: String(enviado ? 1 + 0.15 * Math.max(0, 1 - (t - tEnvio) * 4) : 1) }}>
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M12 19 V5 M5 12 L12 5 L19 12" fill="none" stroke={enviado ? "#111" : "#fff"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Pop>
    </div>
  );
};
