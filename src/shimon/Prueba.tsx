import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { clamp01, easeOut, FPS, lerp, POP, prog, sp } from "../comun/animacion";
import datos from "./prueba.json";

// Prueba de 30 s para Shimon Geek (docs/shimon.md): "¿Qué opino de Dragon Ball Super: Beerus?".
// Su estilo: cortes cada ~1-2 s, poca cámara, escenas del anime, memes, su avatar Itadori
// reaccionando y rótulos que golpean con la palabra (v2: sin meme de la Roca, más cortes dentro
// de cada frase, clips sin repetir, avatar y televisores más grandes, salto de zoom en cada rótulo). Lo antiguo (2015) va en un televisor viejo
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

/** Su avatar (Itadori con lentes), recortado a lo visible (`*_r.png`). Todos están cortados por
 * abajo; "señalando" además por la derecha: va pegado al borde derecho sin espejo (así el corte
 * no se ve y señala hacia el centro). `espejo` solo para los que no tienen corte lateral. */
const Avatar: React.FC<{ t: number; t0: number; img: string; lado: "izq" | "der"; alto?: number; espejo?: boolean; margen?: number }> = ({ t, t0, img, lado, alto = 900, espejo = false, margen = 20 }) => {
  if (t < t0 - 0.01) return null;
  const k = sp(t, t0, POP);
  const vaiven = Math.sin((t - t0) * 3) * 5;
  const pegado = img.startsWith("senalando");
  const fuera = -alto * 0.7;
  return (
    <Img
      src={M(img)}
      style={{
        position: "absolute", bottom: -12 + vaiven, height: alto, width: "auto",
        [lado === "izq" ? "left" : "right"]: lerp(fuera, pegado ? 0 : margen, k),
        filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55))", scale: espejo ? "-1 1" : "1 1",
      } as React.CSSProperties}
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

  // Golpe de zoom en cada rótulo (todo el cuadro "salta" un poco): más dinámico.
  const salto = PRUEBA.rotulos.reduce((acc, r) => acc + 0.045 * Math.exp(-Math.max(0, t - r.t) * 9) * (t >= r.t ? 1 : 0), 0);
  const C = (txt: string) => R(txt).t;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(1 + salto) }}>
        {/* 1. Título sobre la acción del remake (dos planos) */}
        {seq(
          "titulo",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(lerp(1.05, 1.2, t / 1.5)), filter: "brightness(0.55) saturate(1.2)" }}>
              {t < 0.75 ? <Clip src="r_rayo.mp4" desde={1} /> : <Clip src="r_mano.mp4" desde={0.4} />}
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 60, top: 230, display: "flex", flexDirection: "column", gap: 6 }}>
              <Golpe t={t} t0={0.02} texto="¿QUÉ OPINO DE" color="#FFFFFF" tam={140} />
              <Golpe t={t} t0={0.5} texto="DRAGON BALL SUPER:" color={COLOR.amarillo} tam={170} />
              <Golpe t={t} t0={0.75} texto="BEERUS?" color={COLOR.amarillo} tam={230} />
            </div>
            <Avatar t={t} t0={0.2} img="senalando_r.png" lado="der" alto={1000} />
          </AbsoluteFill>,
        )}

        {/* 2. "Todo el mundo sabe que este producto salió…" → él a cámara, con zoom al decir "producto" */}
        {seq(
          "roca",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(t < 3.1 ? empuje("roca", 1.3, 1.18) : lerp(1.42, 1.32, easeOut(clamp01((t - 3.1) / 0.3)))), transformOrigin: "52% 36%" }}>
              <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("roca") * FPS)} muted style={{ width: W, height: H }} />
            </AbsoluteFill>
            <div style={{ ...centro, top: 860 }}>
              <Golpe t={t} t0={ini("roca") + 0.05} texto="TODO EL MUNDO SABE..." color="#fff" tam={120} />
            </div>
          </AbsoluteFill>,
        )}

        {/* 3. "por dos razones" */}
        {seq(
          "razones",
          <AbsoluteFill>
            <Clip src="fondo_ondas.mp4" />
            <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,210,31,0.25), rgba(0,0,0,0) 60%)" }} />
            <div style={{ position: "absolute", left: 90, top: 330 }}>{rot("2 RAZONES", undefined, 280)}</div>
            <Avatar t={t} t0={ini("razones")} img="emote_3_r.png" lado="der" alto={1060} margen={60} />
          </AbsoluteFill>,
        )}

        {/* 4. "Primero, para que los fans de Dragon Ball… dejemos de chillar" → Goku SS3 gritando */}
        {seq(
          "fans",
          <AbsoluteFill>
            {t < 6.12 ? (
              <AbsoluteFill>
                <Clip src="papel.mp4" />
                <div style={{ position: "absolute", left: 90, top: 140, width: 220, height: 220, borderRadius: 110, background: COLOR.amarillo, border: "12px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE, fontSize: 170, scale: String(sp(t, ini("fans"), POP)) }}>1</div>
                <div style={{ position: "absolute", left: 360, top: 170 }}>
                  <Golpe t={t} t0={ini("fans") + 0.45} texto="QUE LOS FANS" color="#fff" tam={170} />
                </div>
                <div style={{ position: "absolute", left: 360, top: 360 }}>
                  <Golpe t={t} t0={5.7} texto="DE DRAGON BALL" color={COLOR.amarillo} tam={150} />
                </div>
                <Avatar t={t} t0={ini("fans") + 0.15} img="naoya_r.png" lado="der" alto={600} margen={40} />
              </AbsoluteFill>
            ) : (
              <AbsoluteFill>
                <AbsoluteFill style={{ scale: String(lerp(1.15, 1.3, prog(t, 6.12, 7.0))) }}>
                  <Clip src="k_grito.mp4" desde={1.0} />
                </AbsoluteFill>
                <div style={{ ...centro, top: 800 }}>
                  <Golpe t={t} t0={6.14} texto="¡DEJEMOS DE CHILLAR!" color={COLOR.rojo} tam={170} />
                </div>
              </AbsoluteFill>
            )}
          </AbsoluteFill>,
        )}

        {/* 5. "…sobre contenido nuevo" → Goku y Bills con la animación nueva */}
        {seq(
          "contenido",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(empuje("contenido")) }}>
              {t < 7.62 ? <Clip src="r_goku.mp4" desde={1.0} /> : <Clip src="r_rojo.mp4" desde={4.2} />}
            </AbsoluteFill>
            <div style={{ ...centro, top: 760 }}>{rot("¡CONTENIDO NUEVO!", undefined, 170)}</div>
          </AbsoluteFill>,
        )}

        {/* 6. "Y también para reanimar…" → la misma cena, 2015 vs 2026 */}
        {seq(
          "reanimar",
          <AbsoluteFill>
            <Clip src="fondo_red.mp4" />
            <div style={{ position: "absolute", left: 30, top: 250, scale: String(empuje("reanimar", 0.85, 1)) }}>
              <Tele anio="2015" ancho={920} t={t}>
                {t < 9.1 ? <Clip src="o_cena.mp4" /> : <Clip src="o_whis.mp4" />}
              </Tele>
            </div>
            <div style={{ position: "absolute", right: 30, top: 250, scale: String(empuje("reanimar", 0.85, 1)) }}>
              <Tele anio="2026" color="#2E9BFF" ancho={920} t={t}>
                <Clip src="r_trono.mp4" />
              </Tele>
            </div>
            <div style={{ ...centro, top: 50, zIndex: 3 }}>{rot("REANIMAR", undefined, 190)}</div>
            <div style={{ position: "absolute", left: 900, top: 470, fontFamily: FUENTE, fontSize: 120, color: COLOR.amarillo, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", scale: String(sp(t, ini("reanimar") + 0.2, POP)) }}>VS</div>
          </AbsoluteFill>,
        )}

        {/* 7. "los primeros capítulos… dejaron bastante que desear" → animación mala del cap. 5 */}
        {seq(
          "feo",
          <AbsoluteFill>
            <Clip src="fondo_lineas.mp4" />
            <div style={{ position: "absolute", left: 50, top: 60, scale: String(lerp(1, 1.06, prog(t, ini("feo"), fin("feo")))), transformOrigin: "0 0" }}>
              <Tele anio="CAP. 5 · 2015" ancho={1380} t={t}>
                {t < 11.3 ? <Clip src="k_feo.mp4" desde={0.5} /> : t < 12.5 ? <Clip src="k_feo2.mp4" desde={0.8} /> : <Clip src="k_feo.mp4" desde={4.0} />}
              </Tele>
            </div>
            <div style={{ position: "absolute", left: 80, top: 880 }}>{rot("DEJARON QUE DESEAR...", undefined, 140)}</div>
            <Avatar t={t} t0={C("DEJARON QUE DESEAR...") - 0.3} img="emote_1_r.png" lado="der" alto={1000} margen={0} />
          </AbsoluteFill>,
        )}

        {/* 8. Cámara: "Pero además de reanimar los capítulos" */}
        {seq(
          "camara1",
          <AbsoluteFill style={{ scale: String(t < 14.4 ? empuje("camara1", 1.35, 1.22) : lerp(1.45, 1.36, easeOut(clamp01((t - 14.4) / 0.3)))), transformOrigin: "52% 38%" }}>
            <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("camara1") * FPS)} muted style={{ width: W, height: H }} />
          </AbsoluteFill>,
        )}

        {/* 9. "se hicieron algo distinto" → planeta que explota con Bills y Whis mirando */}
        {seq(
          "distinto",
          <AbsoluteFill style={{ scale: String(empuje("distinto")) }}>
            <Clip src="r_planeta.mp4" desde={0.3} />
          </AbsoluteFill>,
        )}

        {/* 10. "Y es darle mucha más esencia" */}
        {seq(
          "esencia",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(lerp(1.0, 1.12, prog(t, ini("esencia"), fin("esencia")))) }}>
              {t < C("MÁS ESENCIA") - 0.05 ? <Clip src="r_destruccion.mp4" /> : <Clip src="r_rojo.mp4" desde={3.6} />}
            </AbsoluteFill>
            <div style={{ ...centro, top: 330 }}>{rot("MÁS ESENCIA", undefined, 260)}</div>
          </AbsoluteFill>,
        )}

        {/* 11. "Cosa que se nota principalmente con Bills" */}
        {seq(
          "bills",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(lerp(1.0, 1.12, prog(t, ini("bills"), fin("bills")))) }}>
              <Clip src="r_serio.mp4" />
            </AbsoluteFill>
            {t > 20.35 ? (
              <div style={{ position: "absolute", left: 70, bottom: 80, scale: String(sp(t, 20.35, POP)), transformOrigin: "0 100%", background: "#7B3FD1", border: "10px solid #000", borderRadius: 24, padding: "12px 40px", fontFamily: FUENTE, fontSize: 130, color: "#fff", letterSpacing: "0.04em" }}>
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
            <div style={{ position: "absolute", left: 40, top: 110 }}>
              <Tele anio="2015" ancho={1240} t={t}>
                {t < C("CÓMICO") ? <Clip src="c5_whis.mp4" /> : t < C("TORPE") ? <Clip src="c5_lengua.mp4" /> : t < C("HOLGAZÁN") ? <Clip src="o_mano.mp4" /> : <Clip src="c5_cara.mp4" />}
              </Tele>
            </div>
            <div style={{ position: "absolute", right: 50, top: 150, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 60 }}>
              {rot("CÓMICO", undefined, 170)}
              {rot("TORPE", undefined, 170)}
              {rot("HOLGAZÁN", undefined, 170)}
            </div>
          </AbsoluteFill>,
        )}

        {/* 13. "…en esta otra versión… muchísimo más serio" (2026) */}
        {seq(
          "serio",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(lerp(1.05, 1.2, prog(t, ini("serio"), fin("serio")))), filter: `brightness(${lerp(1, 0.75, prog(t, C("SERIO") - 0.2, C("SERIO")))})` }}>
              <Clip src="r_serio2.mp4" />
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }} />
            <div style={{ position: "absolute", left: 70, top: 60, background: "#2E9BFF", border: "8px solid #000", borderRadius: 16, padding: "4px 30px", fontFamily: FUENTE, fontSize: 80, color: "#fff" }}>2026</div>
            <div style={{ ...centro, top: 700 }}>{rot("SERIO", undefined, 300)}</div>
          </AbsoluteFill>,
        )}

        {/* 14. Cámara: "Y sinceramente yo banco este cambio" */}
        {seq(
          "banco",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(empuje("banco", 1.3, 1.18)), transformOrigin: "40% 38%" }}>
              <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("banco") * FPS)} muted style={{ width: W, height: H }} />
            </AbsoluteFill>
            <Avatar t={t} t0={ini("banco") + 0.25} img="emote_2_r.png" lado="der" alto={1000} margen={60} />
            <div style={{ position: "absolute", left: 50, top: 830 }}>{rot("YO BANCO ESTE CAMBIO", undefined, 140)}</div>
          </AbsoluteFill>,
        )}

        {/* 15. Cámara: "Por lo menos en este arco" */}
        {seq(
          "arco",
          <AbsoluteFill>
            <AbsoluteFill style={{ scale: String(empuje("arco", 1.5, 1.36)), transformOrigin: "52% 36%" }}>
              <OffthreadVideo src={M("camara.mp4")} startFrom={Math.round(ini("arco") * FPS)} muted style={{ width: W, height: H }} />
            </AbsoluteFill>
            <div style={{ ...centro, top: 860 }}>{rot("(EN ESTE ARCO)", undefined, 130)}</div>
          </AbsoluteFill>,
        )}

        {/* 16. "…presentar al personaje de otra manera, sino cambiar totalmente su personalidad" */}
        {seq(
          "personalidad",
          <AbsoluteFill>
            <Clip src="fondo_ondas.mp4" desde={4} />
            {(() => {
              const k = prog(t, C("¿OTRO PERSONAJE?") - 0.1, C("¿OTRO PERSONAJE?") + 0.3);
              return (
                <>
                  <div style={{ position: "absolute", left: 30, top: 300, scale: String(lerp(1, 1.04, k)), rotate: `${-2 * k}deg` }}>
                    <Tele anio="2015" ancho={920} t={t}>
                      {t < 33.0 ? <Clip src="o_ojo.mp4" /> : <Clip src="c5_cara.mp4" desde={3} />}
                    </Tele>
                  </div>
                  <div style={{ position: "absolute", right: 30, top: 300, scale: String(lerp(1, 1.04, k)), rotate: `${2 * k}deg` }}>
                    <Tele anio="2026" color="#2E9BFF" ancho={920} t={t}>
                      {t < 33.0 ? <Clip src="r_final.mp4" desde={1.9} /> : <Clip src="r_final.mp4" desde={4.5} />}
                    </Tele>
                  </div>
                </>
              );
            })()}
            <div style={{ position: "absolute", left: 900, top: 520, fontFamily: FUENTE, fontSize: 120, color: COLOR.amarillo, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>VS</div>
            <div style={{ ...centro, top: 70, zIndex: 3 }}>{rot("¿OTRO PERSONAJE?", undefined, 200)}</div>
          </AbsoluteFill>,
        )}
      </AbsoluteFill>

      <Corte t={t} cortes={E.slice(1).map((e) => e.t)} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, PRUEBA.duracion - 0.25, PRUEBA.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
