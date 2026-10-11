import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BORDE, C, clamp01, easeInOut, easeOut, escribiendo, F, FPS, H, lerp, POP, prog, sp, TL, W } from "./estilo";
import {
  Avatar,
  Boton,
  Burbuja,
  CabeceraBanco,
  CabeceraNegra,
  Casilla,
  Cursor,
  Dato,
  En,
  Estado,
  Etiqueta,
  Puntero,
  Resaltado,
  Tarjeta,
} from "./piezas";

export type PropsExplicador = { audio: string | null; subtitulos: boolean };

// Las escenas viven en una "mesa" grande; la cámara viaja de una a otra.
const ESCENAS = [
  { x: 0, y: 0 },
  { x: 2300, y: 0 },
  { x: 2300, y: 1400 },
  { x: 4600, y: 1400 },
  { x: 6900, y: 1400 },
  { x: 6900, y: 2800 },
];
const VIAJE = 0.8;

const camaraEn = (t: number) => {
  let { x, y } = ESCENAS[0];
  TL.camara.forEach((t0, i) => {
    const k = prog(t, t0, t0 + VIAJE, easeInOut);
    x += (ESCENAS[i + 1].x - ESCENAS[i].x) * k;
    y += (ESCENAS[i + 1].y - ESCENAS[i].y) * k;
  });
  return { x, y };
};

/** Escena: un grupo centrado en su punto de la mesa, con un leve acercamiento constante. */
const Escena: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const llega = i === 0 ? 0 : TL.camara[i - 1];
  const sale = TL.camara[i] ?? TL.duration;
  const zoom = 1 + 0.035 * clamp01((t - llega) / (sale + VIAJE - llega));
  return (
    <div style={{ position: "absolute", left: ESCENAS[i].x, top: ESCENAS[i].y, scale: String(zoom) }}>
      {children}
    </div>
  );
};

const Escena1: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e1;
  const p = (t0: number) => sp(t, t0);
  const escribiendoPuntos = t >= e.escribe && t < e.envia;
  const llegaPuntero = prog(t, e.liberar + 0.25, e.liberar + 1.0);
  return (
    <>
      <En x={-800} y={-250} p={p(e.orden)}>
        <Tarjeta ancho={540}>
          <CabeceraNegra texto="ORDEN #31864 · VENTA" />
          <Dato etiqueta="Vendes" valor="100 USDT" tam={48} />
          <Dato etiqueta="Te tiene que pagar" valor="Bs 100.000,00" tam={48} borde />
        </Tarjeta>
      </En>
      <En x={-800} y={170} p={sp(t, e.liberar, POP)} desde="escala" style={{ transformOrigin: "left center" }}>
        <Boton texto="Liberar USDT" tam={36} />
      </En>
      {t > e.liberar + 0.2 ? <Puntero x={lerp(-150, -520, llegaPuntero)} y={lerp(470, 230, llegaPuntero)} /> : null}

      <En x={40} y={-380} p={p(e.chat)} desde="derecha">
        <Tarjeta ancho={720} style={{ height: 760, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderBottom: BORDE }}>
            <Avatar tam={62} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em" }}>María J.</div>
              <div style={{ fontWeight: 500, fontSize: 22, color: C.gris }}>Chat de la orden #31864</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Etiqueta texto="Pagado" color={C.verdeSuave} />
            </div>
          </div>
          <div style={{ flex: 1, padding: 26, display: "flex", flexDirection: "column", gap: 20, background: "#FBF8F2" }}>
            <div
              style={{
                alignSelf: "center",
                fontSize: 22,
                fontWeight: 700,
                color: C.gris,
                background: "#EFE9DE",
                borderRadius: 10,
                padding: "6px 14px",
                opacity: prog(t, e.chat + 0.3, e.chat + 0.7),
              }}
            >
              María J. marcó la orden como pagada
            </div>
            {escribiendoPuntos ? (
              <Burbuja>
                <span style={{ letterSpacing: "0.2em" }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ opacity: 0.35 + 0.65 * ((Math.floor(t * 6) + d) % 3 === 0 ? 1 : 0) }}>
                      •
                    </span>
                  ))}
                </span>
              </Burbuja>
            ) : null}
            {t >= e.envia ? (
              <div style={{ scale: String(sp(t, e.envia, POP)), transformOrigin: "left center", alignSelf: "flex-start" }}>
                <Burbuja tam={44}>Ya te pagué. Libera.</Burbuja>
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 14, padding: 20, borderTop: `2px solid ${C.grisClaro}` }}>
            <div
              style={{
                flex: 1,
                border: `2px solid ${C.grisClaro}`,
                borderRadius: 999,
                padding: "12px 22px",
                fontSize: 24,
                fontWeight: 500,
                color: C.gris,
              }}
            >
              Escribe un mensaje
            </div>
            <div style={{ width: 54, height: 54, borderRadius: "50%", border: `2px solid ${C.grisClaro}` }} />
          </div>
        </Tarjeta>
      </En>
    </>
  );
};

const Escena2: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e2;
  const burbuja = sp(t, e.burbuja);
  return (
    <>
      <En x={-820} y={-200} p={sp(t, e.banco)}>
        <Tarjeta ancho={640}>
          <CabeceraBanco />
          <Dato
            etiqueta="Recibiste · Pago Móvil"
            valor={
              <Resaltado p={prog(t, e.check, e.check + 0.4)} color={C.verdeSuave}>
                <span style={{ color: C.verde }}>+Bs 100.000,00</span>
              </Resaltado>
            }
            derecha={<Estado tipo="ok" p={sp(t, e.check, POP)} />}
            tam={48}
          />
          <Dato
            etiqueta="Te pagó"
            valor={
              <Resaltado p={prog(t, e.falta, e.falta + 0.4)} color={C.rojoSuave}>
                <span style={{ color: C.gris }}>——</span>
              </Resaltado>
            }
            derecha={<Estado tipo="duda" p={sp(t, e.signo, POP)} />}
            tam={48}
            borde
          />
        </Tarjeta>
      </En>
      <En x={300} y={40} p={sp(t, e.tu, POP)} desde="escala">
        <Avatar tam={190} tu etiqueta="Tú" />
      </En>
      {[
        { x: 360, y: -60, r: 13, d: 0 },
        { x: 330, y: -130, r: 19, d: 0.08 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x - c.r,
            top: c.y - c.r,
            width: c.r * 2,
            height: c.r * 2,
            borderRadius: "50%",
            border: BORDE,
            background: C.blanco,
            scale: String(sp(t, e.burbuja - 0.15 + c.d, POP)),
          }}
        />
      ))}
      <En x={-120} y={-470} p={burbuja} desde="escala" style={{ transformOrigin: "70% 100%" }}>
        <div
          style={{
            width: 900,
            padding: "40px 56px",
            background: C.blanco,
            border: BORDE,
            borderRadius: 999,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 60,
            lineHeight: 1.1,
            textAlign: "center",
            color: C.tinta,
          }}
        >
          Si ya el dinero está,
          <br />
          ¿qué importa quién venga?
        </div>
      </En>
    </>
  );
};

const Escena3: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e3;
  const titulo = prog(t, e.titulo, e.titulo + 0.7);
  return (
    <En x={-330} y={-360} p={sp(t, e.tarjeta)}>
      <div
        style={{
          width: 660,
          height: 640,
          background: C.blanco,
          border: BORDE,
          borderRadius: 30,
          padding: "52px 56px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: C.gris }}>
          LA REGLA
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 98,
            lineHeight: 1,
            color: C.tinta,
            marginTop: 26,
            opacity: titulo,
            translate: `0 ${(1 - titulo) * 24}px`,
          }}
        >
          Antes de liberar,
          <br />
          el nombre.
        </div>
        <div
          style={{
            marginTop: 34,
            height: 5,
            background: C.tinta,
            width: `${prog(t, e.linea, e.linea + 0.6) * 100}%`,
          }}
        />
      </div>
    </En>
  );
};

const NOMBRE_ORDEN = ["María", "José", "Pérez", "Rondón"];
const NOMBRE_BANCO = ["María", "José", "Pérez", "R."];

const Escena4: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e4;
  const fueraLetras = prog(t, e.palabras - 0.35, e.palabras, easeOut);
  const verLetras = t >= e.letras && t < e.palabras;
  const sacudida = t > e.error && t < e.error + 0.45 ? Math.sin((t - e.error) * 60) * 10 * (1 - (t - e.error) / 0.45) : 0;
  const fila = (letras: string[], inicio: number, y: number, etiqueta: string, color: string) => (
    <div style={{ position: "absolute", left: -620, top: y, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 180 }}>
        <Etiqueta texto={etiqueta} color={color} />
      </div>
      {letras.map((l, i) => {
        const ultima = i === letras.length - 1;
        const estado = t >= e.error ? (ultima ? "error" : "ok") : "normal";
        return (
          <div key={i} style={{ translate: ultima ? `${sacudida}px 0` : undefined }}>
            <Casilla letra={l} p={sp(t, inicio + i * 0.07)} estado={estado} />
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <En x={-860} y={-470} p={sp(t, e.orden)}>
        <Tarjeta ancho={720}>
          <CabeceraNegra texto="DETALLE DE LA ORDEN" />
          <Dato
            etiqueta="Nombre del comprador"
            valor={
              <Resaltado p={prog(t, e.palabras + 0.2, e.palabras + 0.6)} color={C.amarilloSuave}>
                María José Pérez Rondón
              </Resaltado>
            }
            tam={42}
          />
        </Tarjeta>
      </En>
      <En x={140} y={-470} p={sp(t, e.banco)}>
        <Tarjeta ancho={720}>
          <CabeceraBanco />
          <Dato
            etiqueta="Te pagó"
            valor={
              <Resaltado p={prog(t, e.palabras + 0.35, e.palabras + 0.75)} color={C.amarilloSuave}>
                María José Pérez R.
              </Resaltado>
            }
            tam={42}
          />
        </Tarjeta>
      </En>

      {verLetras ? (
        <div style={{ opacity: 1 - fueraLetras }}>
          {fila(["M", "A", "R", "Í", "A"], e.letras, 40, "Binance", C.amarillo)}
          {fila(["M", "A", "R", "I", "O"], e.letras + 0.45, 190, "Tu banco", C.azulGris)}
          <div style={{ position: "absolute", left: 160, top: 160 }}>
            <Estado tipo="no" p={sp(t, e.error + 0.1, POP)} tam={72} />
          </div>
        </div>
      ) : null}

      {t >= e.palabras - 0.1 ? (
        <>
          {[NOMBRE_ORDEN, NOMBRE_BANCO].map((palabras, fila) => (
            <div
              key={fila}
              style={{ position: "absolute", left: -620, top: fila === 0 ? 40 : 230, display: "flex", alignItems: "center", gap: 18 }}
            >
              <div style={{ width: 180 }}>
                <Etiqueta texto={fila === 0 ? "Binance" : "Tu banco"} color={fila === 0 ? C.amarillo : C.azulGris} />
              </div>
              {palabras.map((w, i) => {
                const ok = sp(t, e.palabras + 0.55 + i * 0.22, POP);
                return (
                  <div
                    key={i}
                    style={{
                      width: 200,
                      textAlign: "center",
                      padding: "18px 0",
                      borderRadius: 14,
                      border: `3px solid ${ok > 0.5 ? C.verde : C.tinta}`,
                      background: ok > 0.5 ? C.verdeSuave : C.blanco,
                      fontFamily: F.sans,
                      fontWeight: 700,
                      fontSize: 44,
                      letterSpacing: "-0.02em",
                      opacity: clamp01(sp(t, e.palabras + i * 0.06 + fila * 0.15) * 1.5),
                      translate: `0 ${(1 - sp(t, e.palabras + i * 0.06 + fila * 0.15)) * 24}px`,
                    }}
                  >
                    {w}
                  </div>
                );
              })}
            </div>
          ))}
          {NOMBRE_ORDEN.map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: -620 + 198 + i * 218 + 100 - 2,
                top: 40 + 96,
                width: 4,
                height: 94 * prog(t, e.palabras + 0.55 + i * 0.22, e.palabras + 0.8 + i * 0.22),
                background: C.verde,
              }}
            />
          ))}
          <En x={480} y={130} p={sp(t, e.coincide, POP)} desde="escala">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: C.blanco,
                border: BORDE,
                borderRadius: 18,
                padding: "16px 26px",
                fontFamily: F.sans,
                fontWeight: 700,
                fontSize: 44,
              }}
            >
              <Estado tipo="ok" p={1} tam={58} /> Coincide
            </div>
          </En>
        </>
      ) : null}
    </>
  );
};

const Flecha: React.FC = () => (
  <svg width={110} height={30} viewBox="0 0 110 30">
    <path d="M4 15 H98 M84 4 L100 15 L84 26" fill="none" stroke={C.tinta} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Escena5: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e5;
  const fila = (tipo: "ok" | "no", texto: string, resultado: React.ReactNode, t0: number, y: number) => (
    <En x={-600} y={y} p={sp(t, t0)}>
      <div
        style={{
          width: 1200,
          display: "flex",
          alignItems: "center",
          gap: 34,
          background: C.blanco,
          border: BORDE,
          borderRadius: 24,
          padding: "30px 40px",
          boxSizing: "border-box",
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 58,
          letterSpacing: "-0.025em",
        }}
      >
        <Estado tipo={tipo} p={sp(t, t0 + 0.15, POP)} tam={76} />
        <div style={{ width: 380 }}>{texto}</div>
        <Flecha />
        <div style={{ marginLeft: "auto" }}>{resultado}</div>
      </div>
    </En>
  );
  const tachado = prog(t, e.tachado, e.tachado + 0.35);
  return (
    <>
      {fila(
        "ok",
        "Coincide",
        <div style={{ scale: String(sp(t, e.liberas, POP)) }}>
          <Boton texto="Liberas" tam={44} />
        </div>,
        e.fila1,
        -260,
      )}
      {fila(
        "no",
        "No coincide",
        <div style={{ position: "relative", scale: String(sp(t, e.noLiberes, POP)) }}>
          <Boton texto="No liberes" tam={44} apagado />
          <svg width={330} height={110} viewBox="0 0 330 110" style={{ position: "absolute", left: -6, top: -10, overflow: "visible" }}>
            <path
              d="M10 90 L320 20"
              stroke={C.rojo}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={330}
              strokeDashoffset={330 * (1 - tachado)}
            />
          </svg>
        </div>,
        e.fila2,
        30,
      )}
    </>
  );
};

const Escena6: React.FC<{ t: number }> = ({ t }) => {
  const e = TL.e6;
  const url = escribiendo(t, "ivmp2p.com/practica", e.escribe, e.enter - 0.2);
  const pulso = t > e.enter ? 1 - 0.03 * Math.sin(clamp01((t - e.enter) / 0.25) * Math.PI) : 1;
  return (
    <>
      <En x={-560} y={-230} p={sp(t, e.buscador)}>
        <div
          style={{
            width: 1120,
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: C.blanco,
            border: BORDE,
            borderRadius: 999,
            padding: "26px 40px",
            boxSizing: "border-box",
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "-0.02em",
            scale: String(pulso),
          }}
        >
          <svg width={52} height={52} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke={C.tinta} strokeWidth={2} />
            <path d="M2 12 H22 M12 2 C 6 8, 6 16, 12 22 M12 2 C 18 8, 18 16, 12 22" fill="none" stroke={C.tinta} strokeWidth={2} />
          </svg>
          <span>{url}</span>
          {t < e.enter + 0.1 ? <Cursor t={t} alto={58} /> : null}
        </div>
      </En>
      <En x={-560} y={0} p={sp(t, e.proximo, POP)} desde="escala" style={{ transformOrigin: "left center" }}>
        <Boton
          texto="Próximo video"
          tam={34}
          icono={
            <svg width={26} height={26} viewBox="0 0 24 24">
              <path d="M6 3 L21 12 L6 21 Z" fill={C.tinta} />
            </svg>
          }
        />
      </En>
      <En x={-560} y={120} p={sp(t, e.proximo + 0.2)}>
        <div
          style={{
            width: 1120,
            background: C.blanco,
            border: BORDE,
            borderRadius: 24,
            padding: "34px 44px",
            boxSizing: "border-box",
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 66,
            color: C.tinta,
          }}
        >
          ¿Y si te paga otra persona?
        </div>
      </En>
    </>
  );
};

const Subtitulo: React.FC<{ t: number }> = ({ t }) => {
  const actual = [...TL.guion].reverse().find((g) => g.t <= t);
  if (!actual) return null;
  const p = prog(t, actual.t, actual.t + 0.2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: "-0.01em",
          color: C.tinta,
          background: "rgba(255,255,255,0.92)",
          border: `2px solid ${C.tinta}`,
          borderRadius: 14,
          padding: "12px 26px",
          opacity: p,
          translate: `0 ${(1 - p) * 10}px`,
        }}
      >
        {actual.texto}
      </div>
    </div>
  );
};

export const Explicador: React.FC<PropsExplicador> = ({ audio, subtitulos }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camaraEn(t);
  const antes = camaraEn(t - 1 / FPS);
  // Desenfoque de movimiento según la velocidad real de la cámara.
  const bx = Math.min(30, Math.abs(cam.x - antes.x) * 0.09);
  const by = Math.min(30, Math.abs(cam.y - antes.y) * 0.09);
  const moviendo = bx + by > 0.4;
  const escenas = [Escena1, Escena2, Escena3, Escena4, Escena5, Escena6];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="desenfoque-camara" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: W / 2 - cam.x,
          top: H / 2 - cam.y,
          filter: moviendo ? "url(#desenfoque-camara)" : undefined,
        }}
      >
        {escenas.map((Comp, i) => {
          // Solo se dibujan la escena actual y sus vecinas.
          const cerca = Math.abs(ESCENAS[i].x - cam.x) < 2600 && Math.abs(ESCENAS[i].y - cam.y) < 1600;
          return cerca ? (
            <Escena key={i} i={i} t={t}>
              <Comp t={t} />
            </Escena>
          ) : null;
        })}
      </div>
      {subtitulos ? <Subtitulo t={t} /> : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
