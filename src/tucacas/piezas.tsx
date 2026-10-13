import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C, clamp01, DEGRADADO_PORTADA, easeIn, F, FPS, H, lerp, POP, prog, SEGURA, sp, W } from "./estilo";
import type { Encuadre, Frase, Icono, Rotulo } from "./guiones";

// "sala.jpg" está en tucacas/fotos; "fotos-nuevas/sala.jpg" se toma tal cual dentro de tucacas/.
const foto = (archivo: string) => staticFile(archivo.includes("/") ? `tucacas/${archivo}` : `tucacas/fotos/${archivo}`);

/** Interpola dos posiciones "x% y%" (para paneos). */
const interpolarFoco = (a: string, b: string, p: number) => {
  const [ax, ay] = a.split(" ").map(parseFloat);
  const [bx, by] = b.split(" ").map(parseFloat);
  return `${lerp(ax, bx, p)}% ${lerp(ay, by, p)}%`;
};

/** Corrección de color suave: un poco más de calidez y saturación (máx. +10). */
const GRADO = "saturate(1.08) contrast(1.03)";

/**
 * Foto vertical a todo el ancho con su versión desenfocada detrás (las fotos son
 * de 960 px: así no se agranda de más). Ken Burns de 100 % a `zoom` (máx. 108 %).
 */
export const Foto: React.FC<{ encuadre: Encuadre; p: number }> = ({ encuadre, p }) => {
  const zoom = lerp(1, Math.min(encuadre.zoom ?? 1.05, 1.08), p) * (encuadre.escala ?? 1);
  const alto = encuadre.ancha ? 1000 : 1440;
  const foco = encuadre.focoFin ? interpolarFoco(encuadre.foco ?? "50% 50%", encuadre.focoFin, p) : encuadre.foco ?? "50% 50%";
  return (
    <AbsoluteFill style={{ background: C.tinta }}>
      <Img
        src={foto(encuadre.foto)}
        style={{
          position: "absolute",
          inset: -80,
          width: W + 160,
          height: H + 160,
          objectFit: "cover",
          filter: `blur(46px) brightness(0.72) ${GRADO}`,
        }}
      />
      <div style={{ position: "absolute", left: 0, top: (H - alto) / 2, width: W, height: alto, overflow: "hidden" }}>
        <Img
          src={foto(encuadre.foto)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: foco,
            scale: String(zoom),
            transformOrigin: foco,
            filter: GRADO,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: "rgba(255,170,90,0.07)", mixBlendMode: "overlay" }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Grabación de la página a pantalla completa (recortada a 9:16 desde arriba). */
export const Grabacion: React.FC<{ archivo: string; inicio: number; desde: number }> = ({ archivo, inicio, desde }) => (
  <AbsoluteFill style={{ background: C.arena, overflow: "hidden" }}>
    {/* La Sequence hace que la grabación empiece en `inicio` cuando arranca el plano. */}
    <Sequence from={Math.round(desde * FPS)} layout="none">
      <OffthreadVideo
        src={staticFile(`tucacas/grabaciones/${archivo}`)}
        startFrom={Math.round(inicio * FPS)}
        muted
        style={{ position: "absolute", left: 0, top: 0, width: W, height: (W * 2338) / 1080 }}
      />
    </Sequence>
  </AbsoluteFill>
);

/** Rótulo: cada parte es una pastilla blanca con texto tinta (Bricolage ExtraBold). */
export const Rotulos: React.FC<{ rotulo: Rotulo; t: number }> = ({ rotulo, t }) => {
  const salida = prog(t, rotulo.hasta - 0.22, rotulo.hasta, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        top: SEGURA.arriba + 30,
        left: SEGURA.lados,
        right: SEGURA.lados,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 16,
        opacity: 1 - salida,
        translate: `0 ${-salida * 20}px`,
      }}
    >
      {rotulo.partes.map((parte, i) => {
        const p = sp(t, rotulo.desde + i * 0.22, POP);
        const tam = Math.min(96, Math.floor(880 / (parte.length * 0.56)));
        return (
          <div
            key={i}
            style={{
              background: C.blanco,
              color: C.tinta,
              borderRadius: 28,
              padding: `${tam * 0.2}px ${tam * 0.36}px`,
              fontFamily: F.titulo,
              fontWeight: 800,
              fontSize: tam,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              scale: String(lerp(0.7, 1, p)),
              opacity: clamp01(p * 1.6),
              translate: `0 ${(1 - p) * 30}px`,
            }}
          >
            {parte}
          </div>
        );
      })}
    </div>
  );
};

const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ/]/g, "");

/** Parte una frase en bloques de máximo 2 líneas de 32 caracteres. */
const bloques = (texto: string) => {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (prueba.length > 32 && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  const res: string[][] = [];
  for (let i = 0; i < lineas.length; i += 2) res.push(lineas.slice(i, i + 2));
  return res;
};

/** Subtítulos quemados: Onest SemiBold 54, blanco; la palabra clave en sol. */
export const Subtitulos: React.FC<{ frases: Frase[]; t: number }> = ({ frases, t }) => {
  const frase = frases.find((f) => t >= f.desde && t < f.hasta);
  if (!frase) return null;
  const partes = bloques(frase.texto);
  const pesos = partes.map((b) => b.join(" ").length);
  const total = pesos.reduce((a, b) => a + b, 0);
  let inicio = frase.desde;
  let idx = 0;
  for (let i = 0; i < partes.length; i++) {
    const dur = ((frase.hasta - frase.desde) * pesos[i]) / total;
    if (t < inicio + dur || i === partes.length - 1) {
      idx = i;
      break;
    }
    inicio += dur;
  }
  const clave = frase.clave.split(" ").map(normal);
  const p = prog(t, inicio, inicio + 0.18);
  return (
    <div
      style={{
        position: "absolute",
        left: SEGURA.lados,
        right: SEGURA.lados,
        bottom: SEGURA.abajo + 30,
        textAlign: "center",
        fontFamily: F.texto,
        fontWeight: 600,
        fontSize: 54,
        lineHeight: 1.22,
        color: C.blanco,
        textShadow: "0 2px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.35)",
        opacity: p,
        translate: `0 ${(1 - p) * 12}px`,
      }}
    >
      {partes[idx].map((linea, li) => {
        const palabras = linea.split(" ");
        return (
          <div key={li}>
            {palabras.map((w, wi) => {
              // Resalta la secuencia de la palabra clave dentro del bloque.
              const todas = partes[idx].join(" ").split(" ");
              const pos = partes[idx].slice(0, li).join(" ").split(" ").filter(Boolean).length + wi;
              let resaltar = false;
              for (let s = Math.max(0, pos - clave.length + 1); s <= pos; s++) {
                if (clave.every((c, k) => normal(todas[s + k] ?? "") === c)) resaltar = true;
              }
              return (
                <span key={wi} style={{ color: resaltar ? C.sol : undefined }}>
                  {w}
                  {wi < palabras.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const RUTAS_ICONO: Record<Icono["tipo"], string[]> = {
  aire: [
    "M50 8 L50 92",
    "M13.6 29 L86.4 71",
    "M13.6 71 L86.4 29",
    "M38 14 L50 24 L62 14",
    "M38 86 L50 76 L62 86",
    "M16 44 L28 37 L22 23",
    "M84 56 L72 63 L78 77",
    "M16 56 L28 63 L22 77",
    "M84 44 L72 37 L78 23",
  ],
  wifi: [
    "M10 38 C 33 14, 67 14, 90 38",
    "M23 52 C 39 36, 61 36, 77 52",
    "M36 66 C 45 58, 55 58, 64 66",
    "M50 80 L50 80.5",
  ],
  agua: ["M50 8 C 50 8, 20 44, 20 62 C 20 80, 34 92, 50 92 C 66 92, 80 80, 80 62 C 80 44, 50 8, 50 8 Z", "M34 64 C 34 74, 40 80, 48 81"],
};

/** Ícono de línea (trazo redondeado) que se dibuja, dentro de una tarjeta blanca. */
export const TarjetaIcono: React.FC<{ icono: Icono; t: number; tam: number }> = ({ icono, t, tam }) => {
  const p = sp(t, icono.t, POP);
  const trazo = prog(t, icono.t + 0.05, icono.t + 0.75);
  return (
    <div
      style={{
        width: tam,
        padding: `${tam * 0.12}px 0 ${tam * 0.1}px`,
        background: C.blanco,
        borderRadius: 36,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tam * 0.06,
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
        scale: String(lerp(0.6, 1, p)),
        opacity: clamp01(p * 1.6),
      }}
    >
      <svg width={tam * 0.5} height={tam * 0.5} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
        {RUTAS_ICONO[icono.tipo].map((d, i) => {
          const { strokeDasharray, strokeDashoffset } = evolvePath(Math.max(0.001, trazo), d);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={C.verde}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
      <div
        style={{
          fontFamily: F.texto,
          fontWeight: 600,
          fontSize: tam * 0.13,
          color: C.tinta,
          textAlign: "center",
          lineHeight: 1.1,
          padding: "0 12px",
        }}
      >
        {icono.texto}
      </div>
    </div>
  );
};

// Pantalla del teléfono: 9:16 como las grabaciones recortadas.
const PANTALLA = { ancho: 460, alto: (460 * 1920) / 1080 };
const MARCO = 20;

/** Toques sobre el calendario (coordenadas del cuadro de 1080 px de ancho). */
const TOQUES = [
  { x: 930, y: 906, dt: 1.2 },
  { x: 279, y: 1047, dt: 1.9 },
];

/** Teléfono sobre fondo de marca: calendario, toques, botón de WhatsApp y, si se pide, el cambio día/noche. */
export const Telefono: React.FC<{ t: number; desde: number; diaNoche?: [number, number] }> = ({ t, desde, diaNoche }) => {
  const local = t - desde;
  const entra = sp(t, desde, { damping: 16 });
  const escala = PANTALLA.ancho / 1080;
  const enDiaNoche = diaNoche && t >= diaNoche[0];
  const boton = sp(t, desde + 2.8, POP);
  return (
    <AbsoluteFill style={{ background: DEGRADADO_PORTADA }}>
      <div
        style={{
          position: "absolute",
          right: -160,
          top: 120,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,226,154,0.55) 0%, rgba(255,196,106,0.25) 40%, rgba(255,159,74,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (W - PANTALLA.ancho) / 2 - MARCO,
          top: 420,
          padding: MARCO,
          background: "#0c1716",
          borderRadius: 48 + MARCO,
          boxShadow: "0 40px 90px rgba(0,0,0,0.38)",
          translate: `0 ${(1 - entra) * 160}px`,
          opacity: clamp01(entra * 1.5),
          scale: String(1 + 0.025 * clamp01(local / 7)),
        }}
      >
        <div
          style={{
            width: PANTALLA.ancho,
            height: PANTALLA.alto,
            borderRadius: 48,
            overflow: "hidden",
            position: "relative",
            background: C.arena,
          }}
        >
          {enDiaNoche ? (
            <Sequence from={Math.round(diaNoche[0] * FPS)} layout="none">
              <OffthreadVideo
                src={staticFile("tucacas/grabaciones/03-modo-dia-noche.mp4")}
                startFrom={Math.round(diaNoche[1] * FPS)}
                muted
                style={{ position: "absolute", left: 0, top: 0, width: PANTALLA.ancho, height: (PANTALLA.ancho * 2338) / 1080 }}
              />
            </Sequence>
          ) : (
            <>
              <Img
                src={staticFile("tucacas/grabaciones/calendario.png")}
                style={{ position: "absolute", left: 0, top: 0, width: PANTALLA.ancho, height: PANTALLA.alto }}
              />
              {TOQUES.map((toque, i) => {
                const k = clamp01((local - toque.dt) / 0.6);
                if (k <= 0 || k >= 1) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: toque.x * escala - 40,
                      top: toque.y * escala - 40,
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(29,127,104,0.35)",
                      border: `3px solid ${C.verde}`,
                      scale: String(lerp(0.4, 1.4, k)),
                      opacity: 1 - k,
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
      {!enDiaNoche ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1170,
            display: "flex",
            justifyContent: "center",
            scale: String(lerp(0.6, 1, boton)),
            opacity: clamp01(boton * 1.6),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: C.verde,
              color: C.blanco,
              borderRadius: 999,
              padding: "26px 46px",
              fontFamily: F.texto,
              fontWeight: 700,
              fontSize: 46,
              boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
              border: "3px solid rgba(255,255,255,0.85)",
            }}
          >
            <svg width={48} height={48} viewBox="0 0 24 24">
              <path
                d="M22 2 L11 13 M22 2 L15 22 L11 13 L2 9 Z"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reservar por WhatsApp
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Trazado del logo leído del SVG de la marca. */
const useRutaLogo = () => {
  const [ruta, setRuta] = useState<string | null>(null);
  const [handle] = useState(() => delayRender("Cargando el logo"));
  useEffect(() => {
    fetch(staticFile("tucacas/marca/logo-blanco.svg"))
      .then((r) => r.text())
      .then((svg) => {
        setRuta(svg.match(/ d="([^"]+)"/)?.[1] ?? "");
        continueRender(handle);
      });
  }, [handle]);
  return ruta;
};

/** Logo que se dibuja trazo a trazo y luego se rellena, como en la página. */
export const LogoDibujado: React.FC<{ t: number; desde: number; ancho: number }> = ({ t, desde, ancho }) => {
  const ruta = useRutaLogo();
  if (!ruta) return null;
  const trazo = prog(t, desde, desde + 1.5);
  const relleno = prog(t, desde + 1.2, desde + 1.9);
  return (
    <svg width={ancho} height={(ancho * 783) / 1056} viewBox="0 0 1056 783" style={{ overflow: "visible" }}>
      <path
        d={ruta}
        fillRule="evenodd"
        pathLength={1}
        fill={`rgba(255,255,255,${relleno})`}
        stroke="white"
        strokeWidth={4}
        strokeDasharray={1}
        strokeDashoffset={1 - trazo}
      />
    </svg>
  );
};

/** Cierre de marca: degradado de portada, logo, lema y datos de contacto. */
export const Cierre: React.FC<{ t: number; desde: number; icono?: boolean }> = ({ t, desde, icono }) => {
  const lema1 = sp(t, desde + 1.4);
  const lema2 = sp(t, desde + 1.8);
  const datos = prog(t, desde + 2.3, desde + 2.9);
  const sol = 1 + 0.04 * Math.sin((t - desde) * 1.2);
  return (
    <AbsoluteFill style={{ background: DEGRADADO_PORTADA }}>
      <div
        style={{
          position: "absolute",
          right: -220,
          top: 80,
          width: 760,
          height: 760,
          borderRadius: "50%",
          scale: String(sol),
          background: "radial-gradient(circle, rgba(255,226,154,0.7) 0%, rgba(255,196,106,0.35) 38%, rgba(255,159,74,0) 70%)",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
        <LogoDibujado t={t} desde={desde + 0.1} ancho={620} />
      </div>
      <div
        style={{
          position: "absolute",
          left: SEGURA.lados,
          right: SEGURA.lados,
          top: 880,
          textAlign: "center",
          fontFamily: F.titulo,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.02,
          letterSpacing: "-0.01em",
        }}
      >
        <div style={{ color: C.blanco, opacity: clamp01(lema1 * 1.5), translate: `0 ${(1 - lema1) * 30}px` }}>
          Tu día en Tucacas
        </div>
        <div style={{ color: C.sol, opacity: clamp01(lema2 * 1.5), translate: `0 ${(1 - lema2) * 30}px` }}>
          empieza aquí
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: SEGURA.lados,
          right: SEGURA.lados,
          top: icono ? 1180 : 1150,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: datos,
          translate: `0 ${(1 - datos) * 16}px`,
          fontFamily: F.texto,
          fontWeight: 500,
          fontSize: 40,
          color: "#e6f1ee",
        }}
      >
        {icono ? (
          <Img
            src={staticFile("tucacas/marca/icono-app.svg")}
            style={{ width: 112, height: 112, borderRadius: 26, marginBottom: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
          />
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 46, color: C.blanco }}>WhatsApp +58 424-270-3482</div>
        <div>@aribnb.tucacas · tudiaentucacas.netlify.app</div>
      </div>
    </AbsoluteFill>
  );
};
