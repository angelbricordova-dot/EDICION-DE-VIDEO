import React from "react";
import { BORDE, C, clamp01, F, lerp, RADIO } from "./estilo";

/** Cualquier cosa posicionada respecto al centro de su escena, con entrada suave. */
export const En: React.FC<{
  x: number;
  y: number;
  p: number;
  desde?: "abajo" | "derecha" | "escala";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, p, desde = "abajo", children, style }) => {
  const dx = desde === "derecha" ? (1 - p) * 60 : 0;
  const dy = desde === "abajo" ? (1 - p) * 40 : 0;
  const s = desde === "escala" ? lerp(0.6, 1, p) : lerp(0.97, 1, p);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: clamp01(p * 1.6),
        translate: `${dx}px ${dy}px`,
        scale: String(s),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Tarjeta: React.FC<{
  ancho: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ ancho, children, style }) => (
  <div
    style={{
      width: ancho,
      background: C.blanco,
      border: BORDE,
      borderRadius: RADIO,
      overflow: "hidden",
      fontFamily: F.sans,
      color: C.tinta,
      ...style,
    }}
  >
    {children}
  </div>
);

const IconoBanco: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path d="M12 2 L22 7 L22 9 L2 9 L2 7 Z" fill={C.tinta} />
    {[4, 8.5, 13, 17.5].map((x) => (
      <rect key={x} x={x} y={10.5} width={2.6} height={8} fill={C.tinta} />
    ))}
    <rect x={2} y={19.5} width={20} height={2.5} fill={C.tinta} />
  </svg>
);

export const CabeceraBanco: React.FC = () => (
  <div
    style={{
      background: C.azulGris,
      borderBottom: BORDE,
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: "-0.02em",
    }}
  >
    <IconoBanco tam={32} /> Tu banco
  </div>
);

export const CabeceraNegra: React.FC<{ texto: string }> = ({ texto }) => (
  <div
    style={{
      background: C.tinta,
      color: C.blanco,
      padding: "16px 24px",
      textAlign: "center",
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "0.18em",
    }}
  >
    {texto}
  </div>
);

/** Fila de dato: etiqueta gris pequeña y valor grande. */
export const Dato: React.FC<{
  etiqueta: string;
  valor: React.ReactNode;
  derecha?: React.ReactNode;
  borde?: boolean;
  tam?: number;
}> = ({ etiqueta, valor, derecha, borde = false, tam = 40 }) => (
  <div
    style={{
      padding: "18px 24px 20px",
      borderTop: borde ? `2px solid ${C.grisClaro}` : undefined,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div style={{ fontSize: 22, fontWeight: 500, color: C.gris, marginBottom: 6 }}>{etiqueta}</div>
      <div style={{ fontSize: tam, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{valor}</div>
    </div>
    {derecha}
  </div>
);

/** Resaltador detrás de un texto (crece de izquierda a derecha). */
export const Resaltado: React.FC<{ p: number; color: string; children: React.ReactNode }> = ({
  p,
  color,
  children,
}) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 6px", margin: "0 -6px" }}>
    <span
      style={{
        position: "absolute",
        inset: "8% 0 4% 0",
        background: color,
        borderRadius: 6,
        transformOrigin: "left center",
        scale: `${clamp01(p)} 1`,
      }}
    />
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

/** Círculo de estado: check verde, ? amarillo o X roja. */
export const Estado: React.FC<{ tipo: "ok" | "duda" | "no"; p: number; tam?: number }> = ({
  tipo,
  p,
  tam = 56,
}) => {
  const fondo = tipo === "ok" ? C.verde : tipo === "duda" ? C.amarillo : C.rojo;
  return (
    <div
      style={{
        width: tam,
        height: tam,
        borderRadius: "50%",
        background: fondo,
        border: tipo === "duda" ? BORDE : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: String(p),
        flexShrink: 0,
      }}
    >
      <svg width={tam * 0.55} height={tam * 0.55} viewBox="0 0 24 24">
        {tipo === "ok" ? (
          <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="white" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
        ) : tipo === "no" ? (
          <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="white" strokeWidth={3.6} strokeLinecap="round" />
        ) : (
          <text x="12" y="19" textAnchor="middle" fontFamily={F.sans} fontWeight={700} fontSize={19} fill={C.tinta}>
            ?
          </text>
        )}
      </svg>
    </div>
  );
};

/** Avatar de línea (amarillo para "Tú", blanco para los demás). */
export const Avatar: React.FC<{ tam: number; tu?: boolean; etiqueta?: string }> = ({ tam, tu, etiqueta }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <svg width={tam} height={tam} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={tu ? "av-tu" : "av-otro"}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill={tu ? C.amarillo : C.blanco} stroke={C.tinta} strokeWidth={3} />
      <g clipPath={`url(#${tu ? "av-tu" : "av-otro"})`}>
        <circle cx="50" cy="40" r="17" fill={tu ? C.blanco : "none"} stroke={C.tinta} strokeWidth={3} />
        <ellipse cx="50" cy="96" rx="34" ry="30" fill={tu ? C.blanco : "none"} stroke={C.tinta} strokeWidth={3} />
      </g>
    </svg>
    {etiqueta ? (
      <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.tinta }}>{etiqueta}</div>
    ) : null}
  </div>
);

/** Burbuja de chat. `mia` = amarilla a la derecha. */
export const Burbuja: React.FC<{ mia?: boolean; children: React.ReactNode; tam?: number }> = ({
  mia,
  children,
  tam = 30,
}) => (
  <div
    style={{
      alignSelf: mia ? "flex-end" : "flex-start",
      background: mia ? C.amarilloSuave : C.blanco,
      border: BORDE,
      borderRadius: 18,
      padding: "14px 20px",
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: tam,
      letterSpacing: "-0.02em",
      lineHeight: 1.25,
      maxWidth: "82%",
    }}
  >
    {children}
  </div>
);

export const Cursor: React.FC<{ t: number; alto: number }> = ({ t, alto }) => (
  <span
    style={{
      display: "inline-block",
      width: 3,
      height: alto,
      background: C.tinta,
      marginLeft: 3,
      verticalAlign: "middle",
      opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0,
    }}
  />
);

/** Botón amarillo tipo Binance. */
export const Boton: React.FC<{ texto: string; tam?: number; apagado?: boolean; icono?: React.ReactNode }> = ({
  texto,
  tam = 32,
  apagado,
  icono,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      background: apagado ? "#E7E2D9" : C.amarillo,
      color: apagado ? C.gris : C.tinta,
      border: BORDE,
      borderRadius: 999,
      padding: `${tam * 0.42}px ${tam * 0.9}px`,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: tam,
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap",
    }}
  >
    {icono}
    {texto}
  </div>
);

/** Flecha del ratón. */
export const Puntero: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={46} height={46} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y }}>
    <path
      d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14.5 20 L11.5 13.8 L17.5 13.5 Z"
      fill="white"
      stroke={C.tinta}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

/** Casilla con una letra, para comparar nombres letra por letra. */
export const Casilla: React.FC<{ letra: string; p: number; estado?: "normal" | "ok" | "error" }> = ({
  letra,
  p,
  estado = "normal",
}) => (
  <div
    style={{
      width: 92,
      height: 104,
      borderRadius: 14,
      border: `3px solid ${estado === "error" ? C.rojo : estado === "ok" ? C.verde : C.tinta}`,
      background: estado === "error" ? C.rojoSuave : estado === "ok" ? C.verdeSuave : C.blanco,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 58,
      color: C.tinta,
      opacity: clamp01(p * 1.5),
      translate: `0 ${(1 - p) * 26}px`,
    }}
  >
    {letra}
  </div>
);

export const Etiqueta: React.FC<{ texto: string; color?: string }> = ({ texto, color = C.blanco }) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      border: `2px solid ${C.tinta}`,
      borderRadius: 999,
      padding: "6px 16px",
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 22,
      color: C.tinta,
    }}
  >
    {texto}
  </div>
);
