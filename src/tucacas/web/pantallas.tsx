import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { C, clamp01, easeInOut, easeOut, F, FPS, lerp, POP, prog, sp } from "../estilo";

// Todas las pantallas se dibujan a 1080 × 1920 (como las grabaciones) y el
// teléfono las escala. Así las coordenadas de los toques son las de la captura.
export const PW = 1080;
export const PH = 1920;

export type Toque = { t: number; x: number; y: number };

/** Indicador de toque: un punto blanco que se hunde y suelta una onda. */
export const Dedo: React.FC<{ toque: Toque; t: number }> = ({ toque, t }) => {
  const d = t - toque.t;
  if (d < -0.35 || d > 0.7) return null;
  const llega = prog(t, toque.t - 0.35, toque.t - 0.05);
  const hunde = d < 0 ? 1 : d < 0.12 ? lerp(1, 0.82, d / 0.12) : lerp(0.82, 1, clamp01((d - 0.12) / 0.2));
  const sale = prog(t, toque.t + 0.35, toque.t + 0.7);
  const onda = clamp01(d / 0.55);
  return (
    <>
      {d > 0 ? (
        <div
          style={{
            position: "absolute",
            left: toque.x - 90,
            top: toque.y - 90,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `8px solid rgba(255,255,255,0.9)`,
            boxShadow: "0 0 0 4px rgba(11,58,54,0.25)",
            scale: String(lerp(0.4, 1.5, easeOut(onda))),
            opacity: 1 - onda,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: toque.x - 60,
          top: toque.y - 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
          border: "6px solid rgba(11,58,54,0.35)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          scale: String(lerp(1.6, 1, llega) * hunde),
          opacity: llega * (1 - sale),
        }}
      />
    </>
  );
};

const BarraEstado: React.FC<{ oscura?: boolean }> = ({ oscura }) => {
  const col = oscura ? C.blanco : C.texto;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 80px 0 96px",
        fontFamily: F.texto,
        fontWeight: 700,
        fontSize: 46,
        color: col,
      }}
    >
      <span>9:41</span>
      <svg width={190} height={44} viewBox="0 0 190 44">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 16} y={30 - i * 8} width={11} height={12 + i * 8} rx={3} fill={col} />
        ))}
        <path d="M78 18 a30 30 0 0 1 40 0 M86 27 a18 18 0 0 1 24 0" stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={98} cy={36} r={5} fill={col} />
        <rect x={130} y={8} width={52} height={28} rx={8} stroke={col} strokeWidth={4} fill="none" />
        <rect x={136} y={14} width={36} height={16} rx={4} fill={col} />
      </svg>
    </div>
  );
};

const foto = (ruta: string) => staticFile(`tucacas/${ruta}`);

// Publicaciones del perfil: solo fotos reales del apartamento y del conjunto.
const CUADRICULA = [
  "fotos/n30-02-piscina.jpg",
  "fotos-nuevas/sala.jpg",
  "fotos/n30-12-piscina-noche.jpg",
  "fotos-nuevas/habitacion-aire.jpg",
  "fotos/n30-04-cocina.jpg",
  "fotos-nuevas/sala-tv.jpg",
];
const DESTACADAS = [
  ["fotos/n30-02-piscina.jpg", "Piscina"],
  ["fotos-nuevas/sala.jpg", "Apto 30"],
  ["fotos-nuevas/habitacion-aire.jpg", "Cuartos"],
  ["fotos/n30-12-piscina-noche.jpg", "De noche"],
];

/** Dónde está el enlace de la bio (para el zoom y el toque). */
export const ENLACE = { x: 470, y: 742 };

/** Perfil social genérico de @aribnb.tucacas con el enlace a la página en la bio. */
export const Perfil: React.FC<{ t: number; toque: number }> = ({ t, toque }) => {
  const marcado = t >= toque && t < toque + 0.6;
  return (
    <AbsoluteFill style={{ background: C.blanco, fontFamily: F.texto, color: C.texto }}>
      <BarraEstado />
      <div style={{ position: "absolute", top: 130, left: 50, right: 50, display: "flex", alignItems: "center", gap: 26 }}>
        <svg width={44} height={44} viewBox="0 0 24 24">
          <path d="M15 4 L7 12 L15 20" stroke={C.texto} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontWeight: 800, fontSize: 54 }}>aribnb.tucacas</div>
        <div style={{ flex: 1 }} />
        <svg width={54} height={54} viewBox="0 0 24 24">
          {[6, 12, 18].map((x) => (
            <circle key={x} cx={x} cy={12} r={1.9} fill={C.texto} />
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", top: 260, left: 50, display: "flex", alignItems: "center", gap: 46 }}>
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: "50%",
            padding: 9,
            background: `conic-gradient(${C.sol}, ${C.coral}, ${C.verde}, ${C.mar}, ${C.sol})`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.blanco, padding: 8 }}>
            <Img src={foto("marca/icono-app.svg")} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          </div>
        </div>
        <div>
          <div style={{ fontFamily: F.titulo, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }}>Tu Día en Tucacas</div>
          <div style={{ fontSize: 42, color: "#5f6f6c", marginTop: 10 }}>Alquiler vacacional</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 56, right: 56, fontSize: 42, lineHeight: 1.4 }}>
        <div>Apartamento para 7 personas en Pescadores I</div>
        <div>A 5 min de los muelles · Tucacas, Falcón</div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginTop: 6,
            marginLeft: -12,
            padding: "4px 12px",
            borderRadius: 14,
            color: "#0d5fa6",
            fontWeight: 700,
            background: marcado ? "rgba(13,95,166,0.14)" : "transparent",
          }}
        >
          <svg width={42} height={42} viewBox="0 0 24 24">
            <path
              d="M10 14 a4 4 0 0 0 5.6 0 l3-3 a4 4 0 0 0 -5.6 -5.6 l-1 1 M14 10 a4 4 0 0 0 -5.6 0 l-3 3 a4 4 0 0 0 5.6 5.6 l1 -1"
              stroke="#0d5fa6"
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          tudiaentucacas.netlify.app
        </div>
      </div>
      <div style={{ position: "absolute", top: 840, left: 50, right: 50, display: "flex", gap: 20 }}>
        {["Seguir", "Mensaje"].map((b, i) => (
          <div
            key={b}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "24px 0",
              borderRadius: 22,
              fontWeight: 700,
              fontSize: 42,
              background: i === 0 ? C.verde : "#eef1f0",
              color: i === 0 ? C.blanco : C.texto,
            }}
          >
            {b}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 990, left: 50, display: "flex", gap: 52 }}>
        {DESTACADAS.map(([f, nombre]) => (
          <div key={nombre} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 168, height: 168, borderRadius: "50%", border: "4px solid #d6dcdb", padding: 6 }}>
              <Img src={foto(f)} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 34 }}>{nombre}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, height: 4, background: "#eef1f0" }} />
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: 0,
          right: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {CUADRICULA.map((f) => (
          <Img key={f} src={foto(f)} style={{ width: "100%", height: 470, objectFit: "cover" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Una vista dentro del navegador: grabación de la página o captura fija. */
export type Vista = {
  t: number;
  archivo?: string;
  inicio?: number;
  imagen?: string;
  toques?: Toque[];
  /** Hoja inferior con el botón "Reservar por WhatsApp" (y cuándo se toca). */
  boton?: { t: number; toque: number };
};

export const BARRA_NAVEGADOR = 150;

const ContenidoVista: React.FC<{ vista: Vista }> = ({ vista }) =>
  vista.archivo ? (
    // La Sequence hace que la grabación empiece en `inicio` justo cuando aparece la vista.
    <Sequence from={Math.round(vista.t * FPS)} layout="none">
      <OffthreadVideo
        src={staticFile(`tucacas/grabaciones/${vista.archivo}`)}
        startFrom={Math.round((vista.inicio ?? 0) * FPS)}
        muted
        style={{ position: "absolute", left: 0, top: 0, width: PW, height: (PW * 2338) / 1080 }}
      />
    </Sequence>
  ) : (
    <Img src={staticFile(`tucacas/grabaciones/${vista.imagen}`)} style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH }} />
  );

/** Botón de la página para reservar (se dibuja igual que el de la web, sin precio). */
export const BotonWhatsApp: React.FC<{ escala?: number; presionado?: number }> = ({ escala = 1, presionado = 0 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 22 * escala,
      background: C.verde,
      color: C.blanco,
      borderRadius: 28 * escala,
      padding: `${34 * escala}px ${50 * escala}px`,
      fontFamily: F.texto,
      fontWeight: 700,
      fontSize: 52 * escala,
      boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
      scale: String(1 - 0.06 * presionado),
      filter: presionado > 0 ? `brightness(${1 - 0.15 * presionado})` : undefined,
    }}
  >
    <svg width={56 * escala} height={56 * escala} viewBox="0 0 24 24">
      <path d="M22 2 L11 13 M22 2 L15 22 L11 13 L2 9 Z" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    Reservar por WhatsApp
  </div>
);

/**
 * Navegador del teléfono: sube como hoja desde abajo (al tocar el enlace) y
 * muestra la página. Cada cambio de vista se ve como un desplazamiento hacia arriba.
 */
export const Navegador: React.FC<{ t: number; desde: number; vistas: Vista[]; sube?: boolean }> = ({ t, desde, vistas, sube }) => {
  const entra = sube ? prog(t, desde, desde + 0.45, easeOut) : 1;
  let idx = 0;
  vistas.forEach((v, i) => {
    if (t >= v.t) idx = i;
  });
  const vista = vistas[idx];
  const anterior = vistas[idx - 1];
  const desliza = anterior ? prog(t, vista.t, vista.t + 0.4, easeInOut) : 1;
  const altoVista = PH - BARRA_NAVEGADOR;
  const boton = vista.boton;
  const hoja = boton ? sp(t, boton.t, { damping: 15 }) : 0;
  const presion = boton ? clamp01(1 - Math.abs(t - boton.toque - 0.06) / 0.14) : 0;
  return (
    <AbsoluteFill style={{ translate: `0 ${(1 - entra) * PH}px` }}>
      <AbsoluteFill style={{ background: C.arena }} />
      <div style={{ position: "absolute", left: 0, top: BARRA_NAVEGADOR, width: PW, height: altoVista, overflow: "hidden" }}>
        {anterior && desliza < 1 ? (
          <AbsoluteFill style={{ translate: `0 ${-desliza * altoVista}px` }}>
            <ContenidoVista vista={anterior} />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{ translate: `0 ${(1 - desliza) * altoVista}px` }}>
          <ContenidoVista vista={vista} />
          {(vista.toques ?? []).map((tq, i) => (
            <Dedo key={i} toque={tq} t={t} />
          ))}
        </AbsoluteFill>
      </div>
      {boton ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "44px 60px 90px",
            background: C.blanco,
            borderRadius: "48px 48px 0 0",
            boxShadow: "0 -16px 40px rgba(0,0,0,0.16)",
            translate: `0 ${(1 - hoja) * 420}px`,
          }}
        >
          <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: 40, color: C.verde, marginBottom: 26, textAlign: "center" }}>
            Libre en esas fechas · Dom 18 → Mar 20 Oct
          </div>
          <BotonWhatsApp presionado={presion} />
          <Dedo toque={{ t: boton.toque, x: 480, y: 120 }} t={t} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: BARRA_NAVEGADOR,
          background: "#fbfcfc",
          borderBottom: "3px solid #e3e8e7",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 22,
          gap: 14,
          fontFamily: F.texto,
          fontWeight: 600,
          fontSize: 38,
          color: C.texto,
        }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" style={{ marginBottom: 4 }}>
          <rect x={5} y={11} width={14} height={10} rx={2} fill={C.texto} />
          <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" stroke={C.texto} strokeWidth={2.4} fill="none" />
        </svg>
        tudiaentucacas.netlify.app
      </div>
    </AbsoluteFill>
  );
};

const MENSAJE = [
  "Hola, quiero reservar Tu Día en Tucacas · Apartamento N°30.",
  "Entrada: dom 18 oct · Salida: mar 20 oct (2 noches)",
  "Personas: 2",
  "¿Está disponible?",
];

/** Dónde está el botón de enviar del chat. */
export const ENVIAR = { x: 991, y: 1795 };

/**
 * Chat de WhatsApp (dibujado genérico): el mensaje llega escrito desde la página,
 * se resaltan las fechas y al tocar enviar sale la burbuja.
 */
export const Chat: React.FC<{ t: number; desde: number; envio: number }> = ({ t, desde, envio }) => {
  const entra = prog(t, desde, desde + 0.4, easeOut);
  const enviado = t >= envio;
  const burbuja = sp(t, envio, POP);
  const presion = clamp01(1 - Math.abs(t - envio + 0.05) / 0.14);
  const linea = (i: number) => prog(t, desde + 0.5 + i * 0.35, desde + 0.75 + i * 0.35);
  const fuente = { fontFamily: F.texto, fontSize: 44, lineHeight: 1.36, color: "#111b21" };
  return (
    <AbsoluteFill style={{ translate: `${(1 - entra) * PW}px 0`, background: "#efe7dd" }}>
      {/* Fondo del chat con un patrón suave. */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(11,58,54,0.07) 3px, transparent 3px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 290, background: C.tinta }}>
        <BarraEstado oscura />
        <div style={{ position: "absolute", left: 40, right: 40, top: 140, display: "flex", alignItems: "center", gap: 24 }}>
          <svg width={44} height={44} viewBox="0 0 24 24">
            <path d="M15 4 L7 12 L15 20" stroke="white" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Img src={foto("marca/icono-app.svg")} style={{ width: 110, height: 110, borderRadius: "50%" }} />
          <div style={{ color: C.blanco, fontFamily: F.texto }}>
            <div style={{ fontWeight: 700, fontSize: 48 }}>Tu Día en Tucacas</div>
            <div style={{ fontSize: 34, opacity: 0.8 }}>+58 424-270-3482</div>
          </div>
        </div>
      </div>
      {/* Burbuja enviada. */}
      {enviado ? (
        <div
          style={{
            position: "absolute",
            right: 36,
            bottom: 260,
            maxWidth: 860,
            background: "#d9fdd3",
            borderRadius: "34px 34px 8px 34px",
            padding: "30px 36px 20px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
            transformOrigin: "100% 100%",
            scale: String(lerp(0.5, 1, burbuja)),
            opacity: clamp01(burbuja * 1.5),
            translate: `0 ${(1 - burbuja) * 80}px`,
            ...fuente,
          }}
        >
          {MENSAJE.map((l) => (
            <div key={l}>{l}</div>
          ))}
          <div style={{ textAlign: "right", fontSize: 32, color: "#667781", marginTop: 6 }}>
            9:41{" "}
            <svg width={44} height={26} viewBox="0 0 44 26" style={{ verticalAlign: "middle" }}>
              <path d="M2 14 L9 21 L24 4 M16 19 L18 21 L33 4" stroke="#53bdeb" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : null}
      {/* Caja de texto con el mensaje que preparó la página. */}
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 60, display: "flex", alignItems: "flex-end", gap: 18 }}>
        <div
          style={{
            flex: 1,
            background: C.blanco,
            borderRadius: 50,
            padding: enviado ? "34px 44px" : "30px 40px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            ...fuente,
            fontSize: 40,
          }}
        >
          {enviado ? (
            <span style={{ color: "#8696a0" }}>Mensaje</span>
          ) : (
            MENSAJE.map((l, i) => (
              <div key={l} style={{ opacity: lerp(0.25, 1, linea(i)) }}>
                {i === 1 || i === 2 ? (
                  <span
                    style={{
                      background: `rgba(244,182,63,${0.45 * linea(i)})`,
                      borderRadius: 8,
                      padding: "0 6px",
                    }}
                  >
                    {l}
                  </span>
                ) : (
                  l
                )}
              </div>
            ))
          )}
        </div>
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: C.verde,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            scale: String(1 - 0.1 * presion),
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          }}
        >
          <svg width={64} height={64} viewBox="0 0 24 24">
            <path d="M3 20 L21 12 L3 4 L5.5 12 Z M5.5 12 L12 12" fill="white" stroke="white" strokeWidth={1.2} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <Dedo toque={{ t: envio, x: ENVIAR.x, y: ENVIAR.y }} t={t} />
    </AbsoluteFill>
  );
};
