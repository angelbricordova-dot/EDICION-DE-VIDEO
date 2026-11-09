import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, IconoEjercicio, Leccion, SelloGTA, TituloDia } from "./escenas";
import { Brillos, TonoAsoma } from "./escenas3";
import { Camara, Plano } from "./escenas3b";
import { Barberia, CanalSofi, Capa, DonChucho, EscritorioNoche, IconoChatarra, PeloCae, Pizarra, Sillon, TelefonoVideos, WebArmandose } from "./escenas4";
import { cargarFuentes, Cuarto, Episodio, Marcador, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia4.json";

// Día 4 de Toño: ganó YOUTUBE GRATIS (84 %). Los primeros resultados son gurús en Lamborghini; baja
// hasta la página 5 y encuentra a Sofi (webs para negocios con IA, gratis) y un canal de ventas
// ("no vendas una web, vende más clientes"). Hace de noche la web de la barbería de don Chucho, que
// le paga $50 ($135) y le corta el pelo. En el espejo se ve de verdad (ojeras, sudadera, barriga) y
// quiere cambiar. Lección: hay muchísimo contenido gratis que vale oro, hay que tomarse el tiempo de
// buscarlo. Votación: DEJAR LA COMIDA CHATARRA vs EJERCICIO CADA MAÑANA.

export const DIA4 = datos as Episodio;
export type PropsDia4 = { audio: string | null; encuesta?: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};

export const Dia4: React.FC<PropsDia4> = ({ audio, encuesta = "glowup/dia4/encuesta.png" }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const f = (id: string) => {
    const x = DIA4.frases.find((z) => z.id === id);
    if (!x) throw new Error(`Falta la frase ${id}`);
    return x;
  };
  const ws = (p: string) => DIA4.palabras.filter((z) => z.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "") === p).map((z) => z.ini);
  const w = (p: string, desde = 0) => ws(p).find((x) => x >= desde - 0.01) ?? desde;

  const resumen = f("resumen");
  const votaron = f("votaron");
  const dia = f("dia");
  const gurus = f("gurus");
  const baja = f("baja");
  const sofi = f("sofi");
  const vender = f("vender");
  const noche = f("noche");
  const chucho = f("chucho");
  const paga = f("paga");
  const corte = f("corte");
  const espejo = f("espejo");
  const cambiar = f("cambiar");
  const leccion = f("leccion");
  const pregunta = f("pregunta");
  const opciones = f("opciones");
  const sigue = f("sigueme").t;
  const t50 = w("50", paga.t);
  const t135 = w("135", paga.t);
  const tWebNoche = w("primera", noche.t) - 0.1;
  const tCortado = corte.fin - 0.15;
  const tA = w("dejar", opciones.t) - 0.1;
  const tB = w("hacer", opciones.t) - 0.1;

  const dinero = Math.round(lerp(85, 135, easeOut(clamp01((t - t50 - 0.4) / 0.4))));
  const nivel = t >= t50 && t < espejo.t ? 1 : 0;
  const cortado = t >= tCortado;

  type Escena = "garaje" | "telefono" | "sofi" | "pizarra" | "noche" | "webNoche" | "barberia" | "corte" | "espejo" | "cuerpo" | "final";
  const escena: Escena =
    t < gurus.t ? "garaje"
    : t < sofi.t ? "telefono"
    : t < vender.t ? "sofi"
    : t < noche.t ? "pizarra"
    : t < tWebNoche ? "noche"
    : t < chucho.t ? "webNoche"
    : t < corte.t ? "barberia"
    : t < espejo.t ? "corte"
    : t < cambiar.t ? "espejo"
    : t < leccion.t ? "cuerpo"
    : "final";

  let expresion: Expresion = "aburrido";
  if (t >= votaron.t && t < dia.t) expresion = "shock";
  if (escena === "noche" || escena === "barberia" || escena === "corte") expresion = "feliz";
  if (escena === "espejo") expresion = "shock";
  if (escena === "cuerpo") expresion = t >= w("quiere", cambiar.t) - 0.1 ? "aburrido" : "llora";
  if (t >= tA && t < sigue) expresion = "aburrido";
  if (t >= sigue) expresion = "feliz";
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const bajaVoto = 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x));

  const ToNo = (props: { left?: number; top?: number; ancho?: number; pose?: Pose; expr?: Expresion; barriga?: boolean }) => (
    <div style={{ position: "absolute", left: props.left ?? 180, top: props.top ?? 292, transformOrigin: "50% 100%", scale: `1 ${respira}` }}>
      <Tono ancho={props.ancho ?? 720} expresion={props.expr ?? expresion} pose={props.pose ?? "normal"} parpadeo={(props.expr ?? expresion) === "aburrido" && escena !== "cuerpo" ? parpadeo(t) : 0} mirada={mirada} t={t} corte={cortado} barriga={props.barriga} />
    </div>
  );
  const borroso = (hijo: React.ReactNode) => <AbsoluteFill style={{ filter: "blur(12px) brightness(0.7)", scale: "1.08" }}>{hijo}</AbsoluteFill>;
  const P = (t0: number, s: number, x: number, y: number): Plano => ({ t: t0, s, x, y });

  let vista: React.ReactNode = null;
  let planos: Plano[] = [P(0, 1, 540, 960)];
  let temblor = 0;

  if (escena === "garaje") {
    planos = [P(0, 1, 540, 960), P(w("85") - 0.05, 1.8, 540, 640), P(w("11") - 0.05, 1.3, 540, 820), P(w("mil") - 0.05, 1, 540, 960), P(votaron.t, 1.5, 540, 680)];
    vista = (
      <>
        <Cuarto t={t} limpio />
        {ToNo({})}
      </>
    );
  } else if (escena === "telefono") {
    planos = [P(gurus.t, 1, 540, 960), P(w("lamborghini", gurus.t) - 0.1, 1.35, 540, 760), P(baja.t, 1, 540, 960), P(w("5", baja.t) - 0.05, 1.3, 760, 1300)];
    temblor = t >= w("5", baja.t) - 0.05 && t < w("5", baja.t) + 0.3 ? 8 : 0;
    vista = (
      <>
        {borroso(<Cuarto t={t} limpio />)}
        <TelefonoVideos t={t} t0={gurus.t} tScroll={baja.t + 0.1} tPagina5={w("5", baja.t)} busqueda="cómo ganar dinero" />
        {t < baja.t ? <TonoAsoma t={t} t0={w("cursos", gurus.t) - 0.2} expresion="aburrido" x={620} ancho={360} /> : null}
      </>
    );
  } else if (escena === "sofi") {
    planos = [P(sofi.t, 1, 540, 960), P(w("hacer", sofi.t) - 0.1, 1.25, 700, 760)];
    vista = (
      <>
        {borroso(<Cuarto t={t} limpio />)}
        <CanalSofi t={t} t0={sofi.t} tWeb={w("hacer", sofi.t)} />
        <TonoAsoma t={t} t0={w("gratis", sofi.t) - 0.1} expresion="feliz" x={60} ancho={340} />
      </>
    );
  } else if (escena === "pizarra") {
    planos = [P(vender.t, 1, 540, 960), P(w("vende", vender.t) - 0.1, 1.2, 540, 820)];
    vista = <Pizarra t={t} t0={vender.t} tTacha={w("web", vender.t) - 0.05} tSubraya={w("clientes", vender.t)} />;
  } else if (escena === "noche") {
    planos = [P(noche.t, 1, 540, 960), P(noche.t + 0.9, 1.5, 540, 760)];
    vista = <EscritorioNoche t={t} t0={noche.t}>{ToNo({ top: 380, expr: "feliz" })}</EscritorioNoche>;
  } else if (escena === "webNoche") {
    planos = [P(tWebNoche, 1, 540, 960)];
    vista = (
      <AbsoluteFill style={{ background: "#0E1428", justifyContent: "center", alignItems: "center" }}>
        <div style={{ rotate: "-2deg" }}>
          <WebArmandose t={t} t0={tWebNoche + 0.05} titulo="BARBERÍA DON CHUCHO" color="#C9352E" ancho={900} alto={1000} />
        </div>
      </AbsoluteFill>
    );
  } else if (escena === "barberia") {
    // chucho: general; paga: primer plano de don Chucho mirando el teléfono → sonríe → paga
    planos = [P(chucho.t, 1, 540, 960), P(w("chucho", chucho.t) - 0.1, 1.4, 760, 820), P(paga.t, 2.0, 790, 740), P(t50 - 0.35, 1.6, 790, 760), P(t135 - 0.1, 1.1, 540, 900)];
    const chuchoFeliz = t >= t50 - 0.35;
    vista = (
      <Barberia t={t}>
        {ToNo({ left: -20, top: 520, ancho: 620, expr: t >= paga.t && !chuchoFeliz ? "aburrido" : "feliz" })}
        <div style={{ position: "absolute", left: 560, top: 560 }}>
          <DonChucho ancho={460} t={t} cara={chuchoFeliz ? "feliz" : "serio"} telefono={!chuchoFeliz} />
        </div>
      </Barberia>
    );
  } else if (escena === "corte") {
    planos = [P(corte.t, 1.15, 540, 900), P(w("pelo", corte.t) - 0.2, 1.7, 540, 640)];
    vista = (
      <Barberia t={t}>
        {ToNo({ top: 400, expr: "feliz" })}
        <Capa />
        <Sillon />
        <div style={{ position: "absolute", left: 640, top: 380 }}>
          <DonChucho ancho={420} t={t} cara="feliz" tijeras />
        </div>
        <PeloCae t={t} t0={corte.t} t1={corte.fin} />
        {cortado ? <Brillos t={t} t0={tCortado} /> : null}
      </Barberia>
    );
  } else if (escena === "espejo") {
    // el espejo de la barbería: su reflejo (ya peinado, pero con la sudadera y la barriga)
    planos = [P(espejo.t, 1, 540, 960), P(w("espejo", espejo.t) + 0.2, 1.8, 540, 560)];
    vista = (
      <Barberia
        t={t}
        espejo={
          <AbsoluteFill style={{ background: "#9FB9C4" }}>
            <div style={{ position: "absolute", left: 104, top: 30, scale: "-1 1" }}>
              <Tono ancho={360} expresion="shock" t={t} corte barriga />
            </div>
            <AbsoluteFill style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%)" }} />
          </AbsoluteFill>
        }
      />
    );
  } else if (escena === "cuerpo") {
    // primeros planos rápidos: ojeras → sudadera manchada → barriga → mirada decidida
    planos = [
      P(cambiar.t, 2.8, 540, 650),
      P(w("sudadera", cambiar.t) - 0.1, 2.2, 470, 960),
      P(w("barriga", cambiar.t) - 0.1, 1.9, 540, 1160),
      P(w("quiere", cambiar.t) - 0.15, 2.4, 540, 640),
    ];
    vista = (
      <>
        <AbsoluteFill style={{ background: "#1C2230" }} />
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(120,140,170,0.45) 0%, rgba(0,0,0,0) 60%)" }} />
        {ToNo({ barriga: true })}
      </>
    );
  } else {
    planos = [
      P(leccion.t, 1, 540, 960),
      P(w("contenido", leccion.t) - 0.1, 1.3, 540, 820),
      P(w("solo", leccion.t + 0.5) - 0.1, 1.15, 600, 900),
      P(pregunta.t, 1.35, 540, 700),
      P(w("empieza", pregunta.t) - 0.1, 1.7, 540, 640),
      P(opciones.t, 1, 540, 960),
      P(tA, 1.2, 380, 1100),
      P(tB, 1.2, 700, 1100),
      P(sigue, 1, 540, 960),
    ];
    vista = (
      <>
        <Cuarto t={t} limpio />
        <div style={{ position: "absolute", inset: 0, translate: `0 ${t >= opciones.t ? bajaVoto : 0}px` }}>{ToNo({ barriga: true })}</div>
      </>
    );
  }

  const cambios = [0, gurus.t, sofi.t, vender.t, noche.t, tWebNoche, chucho.t, corte.t, espejo.t, cambiar.t, leccion.t, opciones.t, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const flash = 1 - clamp01((t - desde) / 0.08);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Camara t={t} planos={planos} temblor={temblor}>
        {vista}
      </Camara>
      {flash > 0 && desde > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.35 }} /> : null}
      {escena === "espejo" || escena === "cuerpo" ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} /> : null}

      <Marcador t={t} t0={-1} dias={11} dinero={dinero} meta={1000} nivel={nivel} />
      <SelloGTA t={t} t0={w("85") - 0.03} t1={w("11") - 0.05} texto="$85" color="#72D15E" top={330} tam={260} />
      <SelloGTA t={t} t0={w("11") - 0.03} t1={w("mil") - 0.05} texto="11 DÍAS" color="#FFFFFF" top={330} tam={220} />
      <SelloGTA t={t} t0={w("mil") - 0.03} t1={resumen.fin + 0.1} texto="$1.000" color="#72D15E" top={330} tam={260} />
      {encuesta ? <CapturaEncuesta t={t} t0={votaron.t + 0.05} t1={dia.t - 0.1} src={encuesta} /> : null}
      <TituloDia t={t} t0={dia.t} t1={gurus.t - 0.05} dia={4} faltan={11} />
      <SelloGTA t={t} t0={w("cursos", gurus.t) - 0.03} t1={baja.t - 0.1} texto="HUMO 💨" color="#E8473F" top={1180} tam={130} />
      <BilleteVuela t={t} t0={t50 - 0.4} monto={50} />
      <SelloGTA t={t} t0={t135 - 0.03} t1={corte.t - 0.1} texto="$135" color="#72D15E" top={330} tam={260} />
      <Leccion t={t} t0={leccion.t} t1={leccion.fin + 0.15} lineas={["Hay muchísimo contenido gratis que vale oro…", "…solo hay que tomarse el tiempo de buscarlo."]} t2={w("solo", leccion.t + 0.5)} />
      <SelloGTA t={t} t0={w("empieza", pregunta.t) - 0.4} t1={tA - 0.15} texto="¿POR DÓNDE EMPIEZA?" color="#F7C948" top={380} tam={96} />
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="DEJAR LA CHATARRA" b="EJERCICIO CADA MAÑANA" iconoA={<IconoChatarra />} iconoB={<IconoEjercicio />} sub="¿QUÉ PRIMERO?" />
      <Seguir t={t} t0={sigue} dia={5} />
      {!(t >= dia.t && t < gurus.t) ? <Subtitulos t={t} palabras={DIA4.palabras} y={1440} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA4.duracion - 0.25, DIA4.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
