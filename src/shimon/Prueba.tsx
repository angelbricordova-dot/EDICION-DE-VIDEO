import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, FPS, lerp, POP, prog, sp } from "../comun/animacion";
import datos from "./prueba.json";

// Prueba de 30 s para Shimon Geek (docs/shimon.md): "¿Qué opino de Dragon Ball Super: Beerus?".
// Su estilo: cortes cada ~1-2 s, poca cámara, escenas del anime, memes, su avatar Itadori
// reaccionando y rótulos que golpean con la palabra. Lo antiguo (2015) va en un televisor viejo
// (además disimula la baja resolución) y el remake (2026) a pantalla completa o al lado.
// Escenas y rótulos anclados a sus palabras (scripts/shimon/guion_prueba.py → prueba.json).

type Escena = { id: string; t: number };
type Rotulo = { t: number; texto: string; color: "amarillo" | "rojo" | "verde" | "blanco" };
export const PRUEBA = datos as { duracion: number; escenas: Escena[]; rotulos: Rotulo[] };
export type PropsPrueba = { audio: string | null };

const W = 1920;
const H = 1080;
const FUENTE = '"Bangers", "Impact", sans-serif';
const COLOR = { amarillo: "#FFD21F", rojo: "#FF3B3B", verde: "#3BE37A", blanco: "#FFFFFF" };
const M = (n: string) => staticFile(`shimon/prueba/${n}`);

let fuentes = false;
const cargarFuentes = () => {
  if (fuentes) return;
  fuentes = true;
  loadFont({ family: "Bangers", url: staticFile("shimon/fuentes/bangers-latin-400-normal.woff2") });
  loadFont({ family: "Bangers", url: staticFile("shimon/fuentes/bangers-latin-ext-400-normal.woff2") });
};

/** Clip que arranca en su segundo `desde` cuando empieza la escena (dentro de un Sequence).
 * Los del remake ("r_…") traen subtítulos quemados abajo: se recorta esa franja. */
const Clip: React.FC<{ src: string; desde?: number; style?: React.CSSProperties; velocidad?: number }> = ({ src, desde = 0, style, velocidad = 1 }) => {
  const sinSubs = src.startsWith("r_");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <OffthreadVideo
        src={M(src)}
        startFrom={Math.round(desde * FPS)}
        playbackRate={velocidad}
        muted
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: sinSubs ? "118%" : "100%", objectFit: "cover", objectPosition: sinSubs ? "50% 0%" : "50% 50%", ...style }}
      />
    </div>
  );
};

/** Televisor viejo con etiqueta de año (para el Dragon Ball Super de 2015). */
const Tele: React.FC<{ children: React.ReactNode; anio: string; color?: string; ancho?: number; t: number }> = ({ children, anio, color = "#FF3B3B", ancho = 1180, t }) => (
  <div style={{ position: "relative", width: ancho, height: ancho * 0.5625, borderRadius: 34, background: "#1A1A1A", padding: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", border: "8px solid #000" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 18, overflow: "hidden", position: "relative", filter: "saturate(0.9) contrast(1.05)" }}>
      {children}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 5px)", opacity: 0.6 + 0.1 * Math.sin(t * 40) }} />
    </div>
    <div style={{ position: "absolute", left: -20, top: -30, background: color, color: "#fff", fontFamily: FUENTE, fontSize: 64, padding: "2px 26px", borderRadius: 14, border: "6px solid #000", letterSpacing: "0.04em" }}>{anio}</div>
  </div>
);

/** Rótulo que golpea (entra grande y se asienta, con un pequeño temblor). */
const Golpe: React.FC<{ t: number; t0: number; texto: string; color: string; tam?: number; style?: React.CSSProperties }> = ({ t, t0, texto, color, tam = 150, style }) => {
  if (t < t0) return null;
  const k = clamp01((t - t0) / 0.14);
  const tiembla = t - t0 < 0.25 ? Math.sin((t - t0) * 120) * 8 * (1 - (t - t0) / 0.25) : 0;
  return (
    <div style={{ fontFamily: FUENTE, fontSize: tam, lineHeight: 1, color, letterSpacing: "0.03em", WebkitTextStroke: `${tam * 0.1}px #000`, paintOrder: "stroke fill", textShadow: `0 ${tam * 0.06}px 0 #000`, scale: String(lerp(2.2, 1, easeOut(k))), opacity: k, translate: `${tiembla}px 0`, whiteSpace: "nowrap", ...style }}>
      {texto}
    </div>
  );
};

/** Su avatar (Itadori con lentes) que entra deslizándose desde un lado. */
const Avatar: React.FC<{ t: number; t0: number; img: string; lado: "izq" | "der"; alto?: number; abajo?: number }> = ({ t, t0, img, lado, alto = 760, abajo = -40 }) => {
  const k = sp(t, t0, POP);
  const vaiven = Math.sin(t * 3) * 6;
  return (
    <Img
      src={M(img)}
      style={{ position: "absolute", bottom: abajo + vaiven, [lado === "izq" ? "left" : "right"]: lerp(-alto * 0.8, 30, k), height: alto, width: "auto", filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55))", scale: lado === "izq" ? "1 1" : "-1 1" } as React.CSSProperties}
    />
  );
};

/** Barrido de transición: desenfoque y destello blanco en los cortes. */
const Corte: React.FC<{ t: number; cortes: number[] }> = ({ t, cortes }) => {
  const d = Math.min(...cortes.map((c) => Math.abs(t - c)));
  const k = clamp01(1 - d / 0.08);
  return k > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: k * 0.35, pointerEvents: "none" }} /> : null;
};

export const Prueba: React.FC<PropsPrueba> = ({ audio }) => {
  cargarFuentes();
  const f = useCurrentFrame();
  const t = f / FPS;
  const E = PRUEBA.escenas;
  const ini = (id: string) => E.find((e) => e.id === id)!.t;
  const fin = (id: string) => {
    const i = E.findIndex((e) => e.id === id);
    return i + 1 < E.length ? E[i + 1].t : PRUEBA.duracion;
  };
  const R = (txt: string) => PRUEBA.rotulos.find((r) => r.texto === txt)!;
  const seq = (id: string, hijo: React.ReactNode) => {
    const a = Math.round(ini(id) * FPS);
    const b = Math.round(fin(id) * FPS);
    return (
      <Sequence key={id} from={a} durationInFrames={b - a}>
        {hijo}
      </Sequence>
    );
  };
  const empuje = (id: string, desde = 1.12, hasta = 1.0) => lerp(desde, hasta, easeOut(clamp01((t - ini(id)) / 0.35)));
  const rot = (txt: string, extra?: React.CSSProperties, tam?: number) => {
    const r = R(txt);
    return <Golpe t={t} t0={r.t} texto={r.texto} color={COLOR[r.color]} tam={tam} style={extra} />;
  };
  const centro: React.CSSProperties = { position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center" };

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* 1. Título sobre la acción del remake */}
      {seq(
        "titulo",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(lerp(1.05, 1.18, t / 1.5)), filter: "brightness(0.55) saturate(1.2)" }}>
            <Clip src="r_rayo.mp4" desde={1} />
          </AbsoluteFill>
          <div style={{ ...centro, top: 300, flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Golpe t={t} t0={0.02} texto="¿QUÉ OPINO DE" color="#FFFFFF" tam={120} />
            <Golpe t={t} t0={0.5} texto="DRAGON BALL SUPER: BEERUS?" color={COLOR.amarillo} tam={150} />
          </div>
          <Avatar t={t} t0={0.25} img="senalando.png" lado="der" alto={700} />
        </AbsoluteFill>,
      )}

      {/* 2. "Todo el mundo sabe…" → La Roca */}
      {seq(
        "roca",
        <AbsoluteFill>
          <Clip src="cuadros.mp4" style={{ filter: "brightness(0.45)" }} />
          <div style={{ ...centro, top: 120 }}>
            <div style={{ width: 620, height: 668, borderRadius: 26, overflow: "hidden", border: "10px solid #000", boxShadow: "0 30px 60px rgba(0,0,0,0.6)", scale: String(empuje("roca", 0.8, 1)) }}>
              <Clip src="roca.mp4" style={{ objectPosition: "50% 70%" }} />
            </div>
          </div>
          <div style={{ ...centro, top: 830 }}>
            <Golpe t={t} t0={ini("roca") + 0.05} texto="TODO EL MUNDO SABE..." color="#fff" tam={110} />
          </div>
        </AbsoluteFill>,
      )}

      {/* 3. "por dos razones" */}
      {seq(
        "razones",
        <AbsoluteFill>
          <Clip src="cuadros.mp4" desde={2} />
          <div style={{ position: "absolute", left: 140, top: 380 }}>{rot("2 RAZONES", undefined, 230)}</div>
          <Avatar t={t} t0={ini("razones")} img="emote_3.png" lado="der" alto={820} />
        </AbsoluteFill>,
      )}

      {/* 4. "Primero, para que los fans… dejemos de chillar" */}
      {seq(
        "fans",
        <AbsoluteFill>
          <Clip src="papel.mp4" />
          <div style={{ position: "absolute", left: 120, top: 150, width: 170, height: 170, borderRadius: 85, background: COLOR.amarillo, border: "10px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: 130, scale: String(sp(t, ini("fans"), POP)) }}>1</div>
          <div style={{ position: "absolute", left: 340, top: 190, display: "flex", flexDirection: "column", gap: 10 }}>
            <Golpe t={t} t0={ini("fans") + 0.45} texto="QUE LOS FANS" color="#111" tam={120} style={{ WebkitTextStroke: "0px", textShadow: "none" }} />
            <Golpe t={t} t0={ini("fans") + 1.4} texto="DEJEMOS DE CHILLAR" color={COLOR.rojo} tam={130} />
          </div>
          <Avatar t={t} t0={ini("fans") + 0.2} img="naoya.png" lado="der" alto={620} />
        </AbsoluteFill>,
      )}

      {/* 5. "…sobre contenido nuevo" → acción del remake */}
      {seq(
        "contenido",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(empuje("contenido")) }}>
            <Clip src="r_rojo.mp4" desde={2} />
          </AbsoluteFill>
          <div style={{ ...centro, top: 760 }}>{rot("¡CONTENIDO NUEVO!", undefined, 150)}</div>
        </AbsoluteFill>,
      )}

      {/* 6. "Y también para reanimar…" → misma escena 2015 vs 2026 */}
      {seq(
        "reanimar",
        <AbsoluteFill>
          <Clip src="negro.mp4" />
          <div style={{ position: "absolute", left: 50, top: 300, scale: String(empuje("reanimar", 0.9, 1)) }}>
            <Tele anio="2015" ancho={880} t={t}>
              <Clip src="o_cena.mp4" />
            </Tele>
          </div>
          <div style={{ position: "absolute", right: 50, top: 300, scale: String(empuje("reanimar", 0.9, 1)) }}>
            <Tele anio="2026" color="#2E9BFF" ancho={880} t={t}>
              <Clip src="r_trono.mp4" />
            </Tele>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", zIndex: 3 }}>{rot("REANIMAR", undefined, 170)}</div>
          <div style={{ position: "absolute", left: 912, top: 520, fontFamily: FUENTE, fontSize: 90, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>VS</div>
        </AbsoluteFill>,
      )}

      {/* 7. "los primeros capítulos que… dejaron bastante que desear" → animación mala del cap. 5 */}
      {seq(
        "feo",
        <AbsoluteFill>
          <Clip src="cuadros.mp4" desde={4} style={{ filter: "brightness(0.35)" }} />
          <div style={{ ...centro, top: 90, scale: String(lerp(1, 1.08, prog(t, ini("feo"), fin("feo")))) }}>
            <Tele anio="CAP. 5 · 2015" ancho={1320} t={t}>
              <Clip src={t < ini("feo") + 1.9 ? "k_feo.mp4" : "k_feo2.mp4"} desde={t < ini("feo") + 1.9 ? 0.5 : 0.8} />
            </Tele>
          </div>
          <div style={{ ...centro, top: 860 }}>{rot("DEJARON QUE DESEAR...", undefined, 130)}</div>
          {t > R("DEJARON QUE DESEAR...").t ? <Avatar t={t} t0={R("DEJARON QUE DESEAR...").t} img="emote_1.png" lado="der" alto={560} abajo={-120} /> : null}
        </AbsoluteFill>,
      )}

      {/* 8. Cámara: "Pero además de reanimar los capítulos" */}
      {seq(
        "camara1",
        <AbsoluteFill style={{ scale: String(empuje("camara1", 1.35, 1.22)), transformOrigin: "52% 38%" }}>
          <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("camara1") * FPS)} muted style={{ width: W, height: H }} />
        </AbsoluteFill>,
      )}

      {/* 9. "se hicieron algo distinto" */}
      {seq(
        "distinto",
        <AbsoluteFill style={{ scale: String(empuje("distinto")) }}>
          <Clip src="r_serio.mp4" desde={6.5} />
        </AbsoluteFill>,
      )}

      {/* 10. "Y es darle mucha más esencia" */}
      {seq(
        "esencia",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(lerp(1.0, 1.12, prog(t, ini("esencia"), fin("esencia")))) }}>
            <Clip src="r_destruccion.mp4" />
          </AbsoluteFill>
          <div style={{ ...centro, top: 380 }}>{rot("MÁS ESENCIA", undefined, 220)}</div>
        </AbsoluteFill>,
      )}

      {/* 11. "Cosa que se nota principalmente con Bills" */}
      {seq(
        "bills",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(lerp(1.0, 1.1, prog(t, ini("bills"), fin("bills")))) }}>
            <Clip src="r_serio.mp4" />
          </AbsoluteFill>
          {t > ini("bills") + 1.5 ? (
            <div style={{ position: "absolute", left: 80, bottom: 90, scale: String(sp(t, ini("bills") + 1.5, POP)), transformOrigin: "0 100%", background: "#7B3FD1", border: "8px solid #000", borderRadius: 20, padding: "10px 34px", fontFamily: FUENTE, fontSize: 96, color: "#fff", letterSpacing: "0.04em" }}>
              BILLS <span style={{ color: COLOR.amarillo }}>(BEERUS)</span>
            </div>
          ) : null}
        </AbsoluteFill>,
      )}

      {/* 12. "…en los primeros capítulos… cómico, torpe y holgazán" (2015) */}
      {seq(
        "comico",
        <AbsoluteFill>
          <Clip src="papel.mp4" desde={3} />
          <div style={{ position: "absolute", left: 90, top: 150 }}>
            <Tele anio="2015" ancho={1100} t={t}>
              <Clip src={t < R("TORPE").t ? "c5_lengua.mp4" : t < R("HOLGAZÁN").t ? "o_mano.mp4" : "c5_cara.mp4"} />
            </Tele>
          </div>
          <div style={{ position: "absolute", right: 70, top: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 40 }}>
            {rot("CÓMICO", undefined, 140)}
            {rot("TORPE", undefined, 140)}
            {rot("HOLGAZÁN", undefined, 140)}
          </div>
        </AbsoluteFill>,
      )}

      {/* 13. "…en esta otra versión… muchísimo más serio" (2026) */}
      {seq(
        "serio",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(lerp(1.05, 1.2, prog(t, ini("serio"), fin("serio")))), filter: `brightness(${lerp(1, 0.75, prog(t, R("SERIO").t - 0.2, R("SERIO").t))})` }}>
            <Clip src="r_serio2.mp4" />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }} />
          <div style={{ position: "absolute", left: 70, top: 60, background: "#2E9BFF", border: "6px solid #000", borderRadius: 14, padding: "2px 26px", fontFamily: FUENTE, fontSize: 64, color: "#fff" }}>2026</div>
          <div style={{ ...centro, top: 760 }}>{rot("SERIO", undefined, 230)}</div>
        </AbsoluteFill>,
      )}

      {/* 14. Cámara: "Y sinceramente yo banco este cambio" */}
      {seq(
        "banco",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(empuje("banco", 1.3, 1.18)), transformOrigin: "40% 38%" }}>
            <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("banco") * FPS)} muted style={{ width: W, height: H }} />
          </AbsoluteFill>
          <Avatar t={t} t0={ini("banco") + 0.3} img="emote_2.png" lado="der" alto={760} />
          <div style={{ position: "absolute", left: 60, top: 820 }}>{rot("YO BANCO ESTE CAMBIO", undefined, 120)}</div>
        </AbsoluteFill>,
      )}

      {/* 15. Cámara: "Por lo menos en este arco" */}
      {seq(
        "arco",
        <AbsoluteFill>
          <AbsoluteFill style={{ scale: String(empuje("arco", 1.45, 1.35)), transformOrigin: "52% 36%" }}>
            <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("arco") * FPS)} muted style={{ width: W, height: H }} />
          </AbsoluteFill>
          <div style={{ ...centro, top: 860 }}>{rot("(EN ESTE ARCO)", undefined, 110)}</div>
        </AbsoluteFill>,
      )}

      {/* 16. "…presentar al personaje de otra manera, sino cambiar totalmente su personalidad" */}
      {seq(
        "personalidad",
        <AbsoluteFill>
          <Clip src="negro.mp4" desde={5} />
          <div style={{ position: "absolute", left: 50, top: 290 }}>
            <Tele anio="2015" ancho={880} t={t}>
              <Clip src="c5_lengua.mp4" desde={2} />
            </Tele>
          </div>
          <div style={{ position: "absolute", right: 50, top: 290 }}>
            <Tele anio="2026" color="#2E9BFF" ancho={880} t={t}>
              <Clip src="r_serio.mp4" desde={1.5} />
            </Tele>
          </div>
          <div style={{ position: "absolute", left: 912, top: 510, fontFamily: FUENTE, fontSize: 90, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>VS</div>
          <div style={{ ...centro, top: 60, zIndex: 3 }}>{rot("¿OTRO PERSONAJE?", undefined, 160)}</div>
        </AbsoluteFill>,
      )}

      <Corte t={t} cortes={E.slice(1).map((e) => e.t)} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, PRUEBA.duracion - 0.25, PRUEBA.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
