import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, Leccion, SelloGTA, TituloDia } from "./escenas";
import { AnuncioBrayan, Arana, BrayanPresume, Brillos, ChanclaVuela, ChatBrayan, Chaqueta, IconoGuru, IconoVideoGratis, Lavanderia, Polvo, Porche, Telefono, TonoAsoma, Trastos } from "./escenas3";
import { cargarFuentes, Cuarto, Episodio, Mama, Marcador, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia3.json";

// Día 3 de Toño: ganó ORDENAR EL GARAJE. Limpia (polvo, araña, cajas), encuentra $10 en una
// chaqueta, publica todo, vende la bici ($35) y la consola a Brayan por $10… que la revende en $60.
// Publica la lavadora: era de su mamá (chancla). Termina con $85, su mejor día. Lección: lo que no
// usas vale dinero, pero averigua el precio. Votación: CURSO DEL GURÚ vs YOUTUBE GRATIS.
// Un fondo distinto por cada momento (regla de Angel, docs/glowup.md).

export const DIA3 = datos as Episodio;
export type PropsDia3 = { audio: string | null; encuesta?: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};

export const Dia3: React.FC<PropsDia3> = ({ audio, encuesta = null }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const f = (id: string) => {
    const x = DIA3.frases.find((z) => z.id === id);
    if (!x) throw new Error(`Falta la frase ${id}`);
    return x;
  };
  const ws = (p: string) => DIA3.palabras.filter((z) => z.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "") === p).map((z) => z.ini);
  const w = (p: string, desde = 0) => ws(p).find((x) => x >= desde - 0.01) ?? desde;

  const resumen = f("resumen");
  const votaron = f("votaron");
  const dia = f("dia");
  const polvo = f("polvo");
  const chaqueta = f("chaqueta");
  const publica = f("publica");
  const bici = f("bici");
  const consola = f("consola");
  const brayan = f("brayan");
  const lavadora = f("lavadora");
  const mama = f("mama");
  const total = f("total");
  const leccion = f("leccion");
  const pregunta = f("pregunta");
  const opciones = f("opciones");
  const sigue = f("sigueme").t;
  const tArana = w("arañas", polvo.t);
  const tCajas = w("cajas", polvo.t);
  const t40 = w("40", chaqueta.t);
  const t35 = w("35", bici.t);
  const t10 = w("10", consola.t);
  const t60 = w("60", brayan.t);
  const tChancla = w("mamá", mama.t) - 0.25;
  const t85 = w("85", total.t);
  const tA = w("gastar", opciones.t) - 0.1;
  const tB = w("aprender", opciones.t) - 0.1;

  // Dinero: $30 → $40 (chaqueta) → $75 (bici) → $85 (consola)
  const paso = (t0: number) => easeOut(clamp01((t - t0) / 0.4));
  const dinero = Math.round(30 + 10 * paso(t40 - 0.4) + 35 * paso(t35) + 10 * paso(t10 + 0.3));
  const nivel = t >= total.t ? 1 : 0;

  type Escena = "garaje" | "chaqueta" | "telefono" | "porche" | "chat" | "anuncio" | "lavadora" | "lavanderia" | "limpio" | "brayan";
  const escena: Escena =
    t < chaqueta.t ? "garaje"
    : t < publica.t ? "chaqueta"
    : t < bici.t ? "telefono"
    : t < consola.t ? "porche"
    : t < brayan.t ? "chat"
    : t < lavadora.t ? "anuncio"
    : t < mama.t ? "lavadora"
    : t < total.t ? "lavanderia"
    : t < pregunta.t ? "limpio"
    : t < opciones.t ? "brayan"
    : "limpio";

  let expresion: Expresion = "aburrido";
  if (t >= votaron.t && t < dia.t) expresion = "shock";
  if (t >= tArana - 0.1 && t < tCajas) expresion = "shock";
  if (t >= tCajas && t < chaqueta.t) expresion = "aburrido";
  if (escena === "chaqueta" || escena === "telefono" || escena === "porche" || escena === "lavadora") expresion = "feliz";
  if (escena === "anuncio") expresion = t >= t60 ? "shock" : "aburrido";
  if (escena === "lavanderia") expresion = t >= tChancla + 0.35 ? "llora" : "shock";
  if (escena === "limpio") expresion = "feliz";
  if (escena === "brayan") expresion = "llora";
  if (t >= tA && t < sigue) expresion = "aburrido";
  if (t >= sigue) expresion = "feliz";
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const pose: Pose = t < resumen.fin ? "bolsillos" : "normal";
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const bajaVoto = Math.max(t >= votaron.t - 0.2 && t < dia.t + 0.1 ? 330 * (1 - easeInOut(prog(t, dia.t - 0.2, dia.t + 0.1, (x) => x))) : 0, 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x)));
  const cambios = [0, chaqueta.t, publica.t, bici.t, consola.t, brayan.t, lavadora.t, mama.t, total.t, pregunta.t, opciones.t, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const empuje = lerp(1.08, 1, easeOut(clamp01((t - desde) / 0.45)));
  // al sacudir: se mueve de lado a lado; al recibir el chanclazo, se tambalea
  const sacude = t >= polvo.t && t < tArana - 0.1 ? Math.sin(t * 14) * 4 : 0;
  const tambalea = t >= tChancla + 0.35 && t < tChancla + 0.9 ? Math.sin((t - tChancla) * 40) * 4 : 0;

  const TonoAqui = (props: { left?: number; top?: number; ancho?: number }) => (
    <div style={{ position: "absolute", left: props.left ?? 180, top: (props.top ?? 292) + (escena === "garaje" || escena === "limpio" ? bajaVoto : 0), transformOrigin: "50% 100%", scale: `1 ${respira}`, rotate: `${sacude + tambalea}deg` }}>
      <Tono ancho={props.ancho ?? 720} expresion={expresion} pose={pose} parpadeo={expresion === "aburrido" ? parpadeo(t) : 0} mirada={mirada} t={t} />
    </div>
  );
  const fondoGaraje = (
    <AbsoluteFill style={{ filter: "blur(10px) brightness(0.75)", scale: "1.06" }}>
      <Cuarto t={t} />
      <Trastos t={t} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 45%" }}>
        {escena === "garaje" ? (
          <>
            <Cuarto t={t} />
            {TonoAqui({})}
            <Trastos t={t} tVuelan={tCajas} />
            <Polvo t={t} t0={polvo.t} t1={chaqueta.t - 0.2} />
            <Arana t={t} t0={tArana - 0.45} t1={chaqueta.t} x={600} y={500} />
          </>
        ) : escena === "chaqueta" ? (
          <>
            <Chaqueta t={t} tBillete={w("encuentra", chaqueta.t)} />
            <TonoAsoma t={t} t0={w("encuentra", chaqueta.t) - 0.2} expresion="feliz" x={40} />
          </>
        ) : escena === "telefono" ? (
          <>
            {fondoGaraje}
            <Telefono
              t={t}
              anuncios={[
                { que: "bici", nombre: "Bici vieja", precio: 35, t0: w("publica", publica.t) },
                { que: "consola", nombre: "Consola vieja", precio: 10, t0: w("publica", publica.t) + 0.35 },
                { que: "patineta", nombre: "Patineta", precio: 8, t0: w("publica", publica.t) + 0.7 },
                { que: "lampara", nombre: "Lámpara", precio: 6, t0: w("publica", publica.t) + 1.0 },
              ]}
            />
          </>
        ) : escena === "porche" ? (
          <Porche t={t} t0={bici.t} tPaga={t35}>
            {TonoAqui({ left: 250, top: 560, ancho: 560 })}
          </Porche>
        ) : escena === "chat" ? (
          <>
            {fondoGaraje}
            <ChatBrayan
              t={t}
              mensajes={[
                { de: "brayan", texto: "Primo, ¿y esa consola vieja? 👀", t0: consola.t + 0.2 },
                { de: "brayan", texto: "Te doy 10 😎", t0: w("primo", consola.t) },
                { de: "tono", texto: "¡Trato! 🤝", t0: t10 - 0.1 },
              ]}
              sello={{ texto: "VENDIDA", t0: t10 + 0.25 }}
            />
          </>
        ) : escena === "anuncio" ? (
          <>
            <AnuncioBrayan t={t} t0={brayan.t} tPrecio={t60} />
            <TonoAsoma t={t} t0={t60 - 0.1} expresion={expresion} x={680} ancho={340} />
          </>
        ) : escena === "lavadora" ? (
          <>
            {fondoGaraje}
            <Telefono t={t} titulo="Nuevo anuncio" anuncios={[{ que: "lavadora", nombre: "Lavadora (funciona)", precio: 80, t0: w("publica", lavadora.t) }]} />
            <TonoAsoma t={t} t0={lavadora.t + 0.1} expresion="feliz" x={40} />
          </>
        ) : escena === "lavanderia" ? (
          <Lavanderia t={t}>
            {TonoAqui({ left: 40, top: 292 })}
            <Mama t={t} t0={mama.t - 0.05} t1={total.t - 0.1} texto="¡¿MI LAVADORA?!" objeto="chancla" />
            <ChanclaVuela t={t} t0={tChancla} x={420} y={520} />
          </Lavanderia>
        ) : escena === "brayan" ? (
          <BrayanPresume t={t} t0={pregunta.t}>
            <TonoAsoma t={t} t0={w("toño", pregunta.t) - 0.1} expresion="llora" x={40} ancho={340} />
          </BrayanPresume>
        ) : (
          <>
            <Cuarto t={t} limpio />
            {TonoAqui({})}
            {t < leccion.t ? <Brillos t={t} t0={total.t} /> : null}
          </>
        )}
      </AbsoluteFill>

      <Marcador t={t} t0={-1} dias={12} dinero={dinero} meta={1000} nivel={nivel} />
      <SelloGTA t={t} t0={w("30") - 0.03} t1={w("12") - 0.05} texto="$30" color="#72D15E" top={330} tam={260} />
      <SelloGTA t={t} t0={w("12") - 0.03} t1={w("mil") - 0.05} texto="12 DÍAS" color="#FFFFFF" top={330} tam={220} />
      <SelloGTA t={t} t0={w("mil") - 0.03} t1={resumen.fin + 0.1} texto="$1.000" color="#72D15E" top={330} tam={260} />
      {encuesta ? (
        <CapturaEncuesta t={t} t0={votaron.t + 0.05} t1={dia.t - 0.1} src={encuesta} />
      ) : (
        <SelloGTA t={t} t0={w("garaje", votaron.t) - 0.05} t1={dia.t - 0.1} texto="¡GANÓ EL GARAJE!" color="#F7C948" top={380} tam={110} />
      )}
      <TituloDia t={t} t0={dia.t} t1={polvo.t - 0.05} dia={3} faltan={12} />
      <BilleteVuela t={t} t0={t40 - 0.9} monto={10} />
      <BilleteVuela t={t} t0={t35 + 0.05} monto={35} />
      <BilleteVuela t={t} t0={t10 + 0.3} monto={10} />
      <SelloGTA t={t} t0={t85 - 0.03} t1={leccion.t - 0.1} texto="$85" color="#72D15E" top={330} tam={260} />
      <SelloGTA t={t} t0={w("mejor", total.t) - 0.03} t1={leccion.t - 0.1} texto="¡MEJOR DÍA!" color="#F7C948" top={620} tam={110} />
      <Leccion t={t} t0={leccion.t} t1={leccion.fin + 0.15} lineas={["Lo que no usas vale dinero…", "…pero averigua el precio antes de vender."]} t2={w("pero", leccion.t + 0.5)} />
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="CURSO DEL GURÚ" b="YOUTUBE GRATIS" iconoA={<IconoGuru />} iconoB={<IconoVideoGratis />} sub="¿QUÉ HACE?" />
      <Seguir t={t} t0={sigue} dia={4} />
      {!(t >= dia.t && t < polvo.t) ? <Subtitulos t={t} palabras={DIA3.palabras} y={1440} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA3.duracion - 0.25, DIA3.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
