import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, cargarFuentes, clamp01, DEGRADADO_PORTADA, easeIn, easeOut, F, FPS, lerp, POP, prog, SEGURA, sp, W } from "../estilo";
import type { Encuadre, Frase, Icono } from "../guiones";
import { Cierre, Foto, Subtitulos, TarjetaIcono } from "../piezas";
import { Chat, Navegador, Perfil, PH, PW, Vista } from "./pantallas";
import { Clave, claveEn, desenfoqueCamara, EventosMapa, GaleriaFotos, IconoReserva, IconoSinCobro, Incluye, Insignia, ItemIncluye, Mapa, Playa, SolDibujado } from "./escenas";
import guion30 from "./guion-web-30s.json";
import guion60 from "./guion-web-60s.json";

// Comercial "Tu Día en Tucacas" enfocado en presentar la página de reservas:
// perfil → toque al enlace → la página → fechas → apartamento → WhatsApp.
// Los tiempos (voz de Juana, cortes al pulso de la música) están en guion-web-*.json,
// que genera scripts/guion_tucacas_web.py y también lee la mezcla de sonido.

type Entrada = "corte" | "whip" | "flash" | "nada";

/** Clave de cámara del teléfono: punto de la pantalla (1080 × 1920) que queda al centro y su zoom. */
export type Camara = Clave;

export type FondoTelefono = { tipo: "marca" } | { tipo: "playa" } | { tipo: "video"; archivo: string; inicio: number };

export type EscenaTelefono =
  | { t: number; tipo: "perfil"; toque: number }
  | { t: number; tipo: "navegador"; vistas: Vista[]; sube?: boolean }
  | { t: number; tipo: "chat"; envio: number };

type Base = { desde: number; hasta: number; entrada?: Entrada };

export type PlanoWeb =
  | (Base & { tipo: "video"; archivo: string; inicio: number; zoom?: [number, number]; foco?: string })
  | (Base & { tipo: "foto"; encuadre: Encuadre })
  | (Base & { tipo: "telefono"; fondo: FondoTelefono; escenas: EscenaTelefono[]; camara: Camara[] })
  | (Base & { tipo: "iconos"; fondo: FondoTelefono | { tipo: "foto"; encuadre: Encuadre }; iconos: Icono[] })
  | (Base & { tipo: "galeria"; fotos: string[] })
  | (Base & { tipo: "incluye"; items: ItemIncluye[] })
  | (Base & { tipo: "mapa"; camara: Clave[]; eventos: EventosMapa; insignia?: { t: number; texto: string; cuenta?: [number, number] } })
  | (Base & { tipo: "cierre"; icono?: boolean });

/** Texto en pantalla: "grande" (líneas cinéticas) o "pastilla" (rótulo). */
export type TextoWeb = {
  desde: number;
  hasta: number;
  estilo: "grande" | "pastilla";
  lineas: string[];
  /** Cuándo entra cada línea (si no, escalonadas cada 0.2 s). */
  ts?: number[];
  /** Índices de las líneas en color sol. */
  acento?: number[];
  /** Posición vertical (borde superior), en px del cuadro. Sin ella, el texto grande va centrado. */
  y?: number;
  /** Gráfico animado que acompaña al texto grande. */
  icono?: "sol" | "reserva" | "sincobro";
};

export type GuionWeb = {
  id: string;
  duracion: number;
  planos: PlanoWeb[];
  textos: TextoWeb[];
  frases: Frase[];
  efectos: { t: number; sonido: string; gain?: number; pan?: number }[];
  noche?: [number, number];
};

export const GUIONES_WEB: Record<"30s" | "60s", GuionWeb> = {
  "30s": guion30 as unknown as GuionWeb,
  "60s": guion60 as unknown as GuionWeb,
};

export type PropsWeb = { version: "30s" | "60s"; audio: string | null; subtitulos: boolean };

const DUR_WHIP = 0.22;

// ------------------------------------------------------------------ video

/**
 * Clip de video que empieza en `inicio` (segundos del archivo) justo cuando arranca
 * el plano (`desde`): la Sequence reinicia el tiempo del video en ese punto.
 */
export const Clip: React.FC<{ src: string; desde: number; inicio: number; style: React.CSSProperties }> = ({ src, desde, inicio, style }) => (
  <Sequence from={Math.round(desde * FPS)} layout="none">
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(inicio * FPS)} muted style={style} />
  </Sequence>
);

const Video: React.FC<{ archivo: string; desde: number; inicio: number; zoom: number; foco?: string; filtro?: string }> = ({
  archivo,
  desde,
  inicio,
  zoom,
  foco,
  filtro,
}) => (
  <AbsoluteFill style={{ background: C.tinta, overflow: "hidden" }}>
    <Clip
      src={`tucacas/videos/${archivo}`}
      desde={desde}
      inicio={inicio}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        scale: String(zoom),
        transformOrigin: foco ?? "50% 50%",
        filter: filtro ?? "saturate(1.08) contrast(1.04)",
      }}
    />
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }}
    />
  </AbsoluteFill>
);

// --------------------------------------------------------------- teléfono

/** Escala base del teléfono: la pantalla de 1080 px queda de 540 px. */
const S0 = 0.5;
/** Centro vertical del teléfono: centrado entre la zona de arriba y los subtítulos. */
const CY = 880;
const BISEL = 44;

const PantallaEscena: React.FC<{ escena: EscenaTelefono; t: number; primera: boolean }> = ({ escena, t, primera }) => {
  switch (escena.tipo) {
    case "perfil":
      return <Perfil t={t} toque={escena.toque} />;
    case "navegador":
      return <Navegador t={t} desde={escena.t} vistas={escena.vistas} sube={escena.sube && !primera} />;
    case "chat":
      return <Chat t={t} desde={escena.t} envio={escena.envio} />;
  }
};

const Fondo: React.FC<{ fondo: FondoTelefono; desde: number; t: number }> = ({ fondo, desde, t }) =>
  fondo.tipo === "playa" ? (
    <Playa t={t} />
  ) : fondo.tipo === "video" ? (
    <AbsoluteFill style={{ overflow: "hidden", background: C.tinta }}>
      <Clip
        src={`tucacas/videos/${fondo.archivo}`}
        desde={desde}
        inicio={fondo.inicio}
        style={{ position: "absolute", inset: -60, width: W + 120, height: 1920 + 120, objectFit: "cover", filter: "blur(28px) brightness(0.62) saturate(1.15)" }}
      />
      <AbsoluteFill style={{ background: "rgba(11,58,54,0.35)" }} />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ background: DEGRADADO_PORTADA }}>
      <div
        style={{
          position: "absolute",
          right: -200,
          top: 60,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,226,154,0.55) 0%, rgba(255,196,106,0.25) 40%, rgba(255,159,74,0) 70%)",
        }}
      />
    </AbsoluteFill>
  );

const Telefono: React.FC<{ plano: Extract<PlanoWeb, { tipo: "telefono" }>; t: number }> = ({ plano, t }) => {
  const entra = sp(t, plano.desde, { damping: 15, stiffness: 120 });
  const cam = claveEn(plano.camara, t);
  const S = S0 * cam.escala;
  const blur = desenfoqueCamara(plano.camara, t, S0);
  let idx = 0;
  plano.escenas.forEach((e, i) => {
    if (t >= e.t) idx = i;
  });
  // La escena anterior sigue debajo mientras entra la nueva (hoja o deslizamiento).
  const visibles = plano.escenas.slice(Math.max(0, idx - 1), idx + 1).filter((e, i, arr) => i === arr.length - 1 || t < arr[arr.length - 1].t + 0.6);
  return (
    <AbsoluteFill>
      <Fondo fondo={plano.fondo} desde={plano.desde} t={t} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: PW,
          height: PH,
          transformOrigin: "0 0",
          transform: `translate(${W / 2 - cam.x * S}px, ${CY - cam.y * S + (1 - entra) * 1500}px) scale(${S})`,
          filter: blur > 0.4 ? `blur(${(blur / S).toFixed(1)}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${cam.x}px ${cam.y}px`,
            rotate: `${(cam.giro ?? 0) + (1 - entra) * -10}deg`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -BISEL,
              top: -BISEL,
              width: PW + 2 * BISEL,
              height: PH + 2 * BISEL,
              borderRadius: 150,
              background: "#0c1716",
              boxShadow: "0 80px 160px rgba(0,0,0,0.45), inset 0 0 0 6px #2a3634",
            }}
          />
          <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, borderRadius: 108, overflow: "hidden", background: C.blanco }}>
            {visibles.map((e) => (
              <AbsoluteFill key={e.t}>
                <PantallaEscena escena={e} t={t} primera={e === plano.escenas[0]} />
              </AbsoluteFill>
            ))}
            <div
              style={{ position: "absolute", left: PW / 2 - 150, top: 26, width: 300, height: 84, borderRadius: 42, background: "#05090a" }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ textos

const Textos: React.FC<{ texto: TextoWeb; t: number }> = ({ texto, t }) => {
  const sale = prog(t, texto.hasta - 0.18, texto.hasta, easeIn);
  if (texto.estilo === "grande") {
    const centrado = texto.y === undefined;
    const conTarjeta = texto.icono === "reserva" || texto.icono === "sincobro";
    // Centrado entre la zona de arriba (250 px) y los subtítulos (~1330 px).
    const alto = texto.lineas.length * 150 + (conTarjeta ? 300 : 0);
    const arriba = centrado ? 790 - alto / 2 : (texto.y as number);
    const t0 = texto.ts?.[0] ?? texto.desde;
    return (
      <>
        {texto.icono === "sol" ? (
          <div style={{ position: "absolute", left: 0, top: arriba + texto.lineas.length * 75, width: W, height: 0, opacity: 1 - sale }}>
            <SolDibujado t={t} desde={t0} />
          </div>
        ) : null}
        {conTarjeta ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: arriba, display: "flex", justifyContent: "center", opacity: 1 - sale }}>
            {texto.icono === "reserva" ? <IconoReserva t={t} desde={t0} /> : <IconoSinCobro t={t} desde={t0} />}
          </div>
        ) : null}
      <div
        style={{
          position: "absolute",
          left: SEGURA.lados,
          right: SEGURA.lados,
          top: arriba + (conTarjeta ? 300 : 0),
          textAlign: "center",
          fontFamily: F.titulo,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          opacity: 1 - sale,
          scale: String(1 - 0.08 * sale),
        }}
      >
        {/* Sombra suave detrás para que el texto se lea sobre cielo o paredes claras. */}
        <div
          style={{
            position: "absolute",
            inset: "-140px -80px",
            background: "radial-gradient(ellipse at center, rgba(8,40,37,0.55) 0%, rgba(8,40,37,0.3) 45%, rgba(8,40,37,0) 72%)",
            opacity: clamp01(sp(t, texto.ts?.[0] ?? texto.desde) * 1.5),
          }}
        />
        {texto.lineas.map((l, i) => {
          const t0 = texto.ts?.[i] ?? texto.desde + i * 0.2;
          const p = sp(t, t0, POP);
          const tam = Math.min(150, Math.floor(1700 / Math.max(6, l.length)));
          return (
            <div
              key={i}
              style={{
                position: "relative",
                fontSize: tam,
                color: texto.acento?.includes(i) ? C.sol : C.blanco,
                textShadow: "0 6px 30px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
                opacity: clamp01(p * 2),
                scale: String(lerp(1.5, 1, p)),
                filter: p < 0.6 ? `blur(${((0.6 - p) * 20).toFixed(1)}px)` : undefined,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
      </>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        top: texto.y ?? SEGURA.arriba + 20,
        left: SEGURA.lados,
        right: SEGURA.lados,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 18,
        opacity: 1 - sale,
        translate: `0 ${-sale * 20}px`,
      }}
    >
      {texto.lineas.map((parte, i) => {
        const p = sp(t, texto.ts?.[i] ?? texto.desde + i * 0.22, POP);
        const tam = Math.min(84, Math.floor(880 / (parte.length * 0.56)));
        const acento = texto.acento?.includes(i);
        return (
          <div
            key={i}
            style={{
              background: acento ? C.sol : C.blanco,
              color: C.tinta,
              borderRadius: 26,
              padding: `${tam * 0.22}px ${tam * 0.4}px`,
              fontFamily: F.titulo,
              fontWeight: 800,
              fontSize: tam,
              lineHeight: 1.05,
              boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
              scale: String(lerp(0.6, 1, p)),
              opacity: clamp01(p * 1.6),
              rotate: `${(1 - p) * (i % 2 ? 6 : -6)}deg`,
            }}
          >
            {parte}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ planos

const ContenidoPlano: React.FC<{ plano: PlanoWeb; t: number }> = ({ plano, t }) => {
  const p = clamp01((t - plano.desde) / (plano.hasta - plano.desde));
  switch (plano.tipo) {
    case "video": {
      const [a, b] = plano.zoom ?? [1.0, 1.06];
      return <Video archivo={plano.archivo} desde={plano.desde} inicio={plano.inicio} zoom={lerp(a, b, p)} foco={plano.foco} />;
    }
    case "foto":
      return <Foto encuadre={plano.encuadre} p={p} />;
    case "telefono":
      return <Telefono plano={plano} t={t} />;
    case "cierre":
      return <Cierre t={t} desde={plano.desde} icono={plano.icono} />;
    case "galeria":
      return (
        <AbsoluteFill>
          <Playa t={t} />
          <GaleriaFotos t={t} desde={plano.desde} hasta={plano.hasta} fotos={plano.fotos} />
        </AbsoluteFill>
      );
    case "incluye":
      return (
        <AbsoluteFill>
          <Playa t={t} />
          <Incluye t={t} desde={plano.desde} hasta={plano.hasta} items={plano.items} />
        </AbsoluteFill>
      );
    case "mapa":
      return (
        <AbsoluteFill>
          <Mapa t={t} camara={plano.camara} eventos={plano.eventos} />
          {plano.insignia ? <Insignia t={t} desde={plano.insignia.t} texto={plano.insignia.texto} cuenta={plano.insignia.cuenta} /> : null}
        </AbsoluteFill>
      );
    case "iconos": {
      const f = plano.fondo;
      return (
        <AbsoluteFill>
          {f.tipo === "foto" ? (
            <Foto encuadre={f.encuadre} p={p} />
          ) : f.tipo === "video" ? (
            <Video archivo={f.archivo} desde={plano.desde} inicio={f.inicio} zoom={lerp(1.0, 1.06, p)} />
          ) : (
            <Fondo fondo={f} desde={plano.desde} t={t} />
          )}
          {f.tipo === "foto" || f.tipo === "video" ? <AbsoluteFill style={{ background: "rgba(11,58,54,0.38)" }} /> : null}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: plano.iconos.length > 1 ? 760 : 820,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 30,
            }}
          >
            {plano.iconos.map((icono) => (
              <TarjetaIcono key={icono.tipo} icono={icono} t={t} tam={plano.iconos.length > 2 ? 300 : 400} />
            ))}
          </div>
        </AbsoluteFill>
      );
    }
  }
};

export const ComercialWeb: React.FC<PropsWeb> = ({ version, audio, subtitulos }) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const guion = GUIONES_WEB[version];
  const enCierre = guion.planos.some((pl) => pl.tipo === "cierre" && t >= pl.desde);

  return (
    <AbsoluteFill style={{ background: C.tinta }}>
      {guion.planos.map((plano, i) => {
        const anterior = guion.planos[i - 1];
        const sigue = guion.planos[i + 1];
        const visibleHasta = sigue?.entrada === "whip" ? plano.hasta + DUR_WHIP : plano.hasta;
        if (t < plano.desde || t >= visibleHasta) return null;
        const entrada = plano.entrada ?? "corte";
        let estilo: React.CSSProperties = { zIndex: i };
        if (entrada === "whip" && anterior) {
          const k = prog(t, plano.desde, plano.desde + DUR_WHIP, easeOut);
          const desenfoque = (1 - k) * 40;
          estilo = { ...estilo, translate: `${(1 - k) * W}px 0`, filter: desenfoque > 0.5 ? `blur(${desenfoque.toFixed(1)}px)` : undefined };
        } else if ((entrada === "corte" || entrada === "flash") && anterior) {
          // Golpe de zoom en cada corte: entra un poco más cerca y se asienta.
          const k = prog(t, plano.desde, plano.desde + 0.32, easeOut);
          estilo = { ...estilo, scale: String(1 + 0.1 * (1 - k)) };
        }
        const flash = entrada === "flash" ? 1 - prog(t, plano.desde, plano.desde + 0.22) : 0;
        return (
          <AbsoluteFill key={i} style={estilo}>
            <ContenidoPlano plano={plano} t={t} />
            {flash > 0.01 ? <AbsoluteFill style={{ background: `rgba(255,248,230,${(0.7 * flash).toFixed(3)})` }} /> : null}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ zIndex: 100 }}>
        {guion.textos
          .filter((x) => t >= x.desde && t < x.hasta)
          .map((x, i) => (
            <Textos key={i} texto={x} t={t} />
          ))}
        {subtitulos && !enCierre ? <Subtitulos frases={guion.frases} t={t} /> : null}
      </AbsoluteFill>
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** Miniatura del comercial web: el teléfono con el perfil y el lema. */
export const PortadaWeb: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill>
      <Foto encuadre={{ foto: "n30-02-piscina.jpg", ancha: true, foco: "45% 60%" }} p={0} />
      <AbsoluteFill style={{ background: "rgba(11,58,54,0.45)" }} />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 300,
          textAlign: "center",
          fontFamily: F.titulo,
          fontWeight: 800,
          fontSize: 120,
          lineHeight: 1.0,
          textShadow: "0 4px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ color: C.blanco }}>Reserva en</div>
        <div style={{ color: C.sol }}>un toque</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 540, height: 960, borderRadius: 60, overflow: "hidden", border: "22px solid #0c1716", boxShadow: "0 40px 90px rgba(0,0,0,0.45)" }}>
          <div style={{ position: "relative", width: PW, height: PH, scale: "0.5", transformOrigin: "0 0" }}>
            <Perfil t={0} toque={99} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
