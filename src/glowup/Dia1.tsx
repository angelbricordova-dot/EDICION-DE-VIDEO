import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, ChatPrimo, Cocina, ComentarioVotado, Curriculums, IconoAlcancia, IconoReventa, Leccion, PlatoLavando, RelojHoras, SelloGTA, TituloDia } from "./escenas";
import { cargarFuentes, Cuarto, Episodio, Mama, Marcador, Moscas, Olor, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia1.json";

// Día 1 de Toño: ganó "buscar trabajo" (73 % en la encuesta). Empieza con el conflicto en el primer
// segundo (en el Día 0 el 39 % pasaba de largo al principio): "¡Ustedes votaron… a trabajar!" con el
// comentario más votado, DÍA 1, currículum rechazado, la mamá le consigue lavar platos, 8 horas → $20,
// lección del día, el primo Brayan ya reservó GTA VI y votación AHORRAR vs INVERTIR.

export const DIA1 = datos as Episodio;
export type PropsDia1 = { audio: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};

export const Dia1: React.FC<PropsDia1> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const f = (id: string) => {
    const x = DIA1.frases.find((z) => z.id === id);
    if (!x) throw new Error(`Falta la frase ${id}`);
    return x;
  };
  const ws = (p: string) => DIA1.palabras.filter((z) => z.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "") === p).map((z) => z.ini);
  const w = (p: string, desde = 0) => ws(p).find((x) => x >= desde - 0.01) ?? desde;

  const votaron = f("votaron");
  const dia = f("dia");
  const cv = f("cv");
  const mama = f("mama");
  const horas = f("horas");
  const paga = f("paga");
  const leccion = f("leccion");
  const primo = f("primo");
  const pregunta = f("pregunta");
  const sigue = f("sigueme").t;
  const tTrabajar = w("trabajar");
  const tLavar = w("lavar", mama.t) - 0.08;
  const sellos = ws("rechazado");
  const tFoto = w("foto", primo.t);
  const tReservo = w("reservó", primo.t);
  const tA = w("ahorrar", pregunta.t) - 0.1;
  const tB = w("invertir", pregunta.t) - 0.1;
  const tSoñado = w("es", leccion.t + 1.5);

  // Dinero: $0 hasta que cobra; cuenta hasta $20 cuando el billete llega al marcador.
  const dinero = Math.round(20 * easeOut(clamp01((t - paga.t - 0.55) / 0.35)));
  const dias = t < dia.t + 0.25 ? 15 : 14;

  const enCocina = t >= tLavar && t < leccion.fin + 0.2;
  const enCv = t >= cv.t - 0.05 && t < mama.t;
  let expresion: Expresion = "aburrido";
  if (t < tTrabajar + 0.6) expresion = "shock";
  if (t >= mama.t + 0.4 && t < tLavar) expresion = "feliz";
  if (t >= paga.t && t < primo.t + 1.2) expresion = "feliz";
  if (t >= tReservo && t < pregunta.t) expresion = "llora";
  if (t >= sigue) expresion = "feliz";
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  // Toño baja mientras están arriba el comentario más votado (gancho) y la votación del final
  const baja = Math.max(t >= votaron.t - 0.2 ? 330 * (1 - easeInOut(prog(t, dia.t - 0.2, dia.t + 0.1, (x) => x))) : 0, 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x)));
  // Golpe de cámara al cambiar de escena
  const cambios = [0, tLavar, leccion.fin + 0.2, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const empuje = lerp(1.08, 1, easeOut(clamp01((t - desde) / 0.45)));
  const sudor = t >= horas.t && t < paga.t;
  // Platos limpios: se van apilando mientras lava; en "8 horas después" la pila se dispara.
  const limpios = Math.floor(lerp(0, 6, clamp01((t - tLavar) / (horas.t - tLavar))) + lerp(0, 26, easeOut(clamp01((t - horas.t) / (paga.t - horas.t)))));
  // Resumen del gancho (si la voz lo tiene): bolsillos vacíos, $0, 14 días y $1.000.
  const resumen = DIA1.frases.find((z) => z.id === "resumen");
  const pose: Pose = resumen && t < resumen.fin ? "bolsillos" : "normal";

  const TonoAqui = (
    <div style={{ position: "absolute", left: 180, top: 292 + (enCocina ? 0 : baja), transformOrigin: "50% 100%", scale: `1 ${respira}` }}>
      <Tono ancho={720} expresion={expresion} pose={pose} ropa={enCocina ? "lavaplatos" : "sudadera"} parpadeo={expresion === "aburrido" ? parpadeo(t) : 0} mirada={mirada} t={t} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {enCv ? (
        <Curriculums
          t={t}
          t0={cv.t}
          tResalta={w("nivel", cv.t)}
          sellos={sellos}
          destinos={[
            { para: "PIZZERÍA DON LUIGI", color: "#D9483B" },
            { para: "CINE ESTRELLA", color: "#3B6FD9" },
            { para: "TIENDA DE CELULARES", color: "#2E9E6E" },
          ]}
        />
      ) : enCocina ? (
        <AbsoluteFill style={{ scale: String(empuje) }}>
          <Cocina t={t} platos={t < paga.t ? 6 : 1} limpios={limpios} oscuro={sudor ? 0.2 : 0}>
            {TonoAqui}
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <rect x={0} y={1130} width={1080} height={790} fill="#B7C0C7" />
              <rect x={0} y={1110} width={1080} height={40} fill="#D3D9DE" stroke="#1C1A1A" strokeWidth={6} />
              <rect x={250} y={1150} width={580} height={240} rx={20} fill="#8C969E" stroke="#1C1A1A" strokeWidth={6} />
            </svg>
            <PlatoLavando t={t} />
            {sudor
              ? [0, 1, 2].map((i) => {
                  const v = ((t * 1.4 + i / 3) % 1);
                  return <div key={i} style={{ position: "absolute", left: 400 + i * 130, top: 520 + v * 180, width: 22, height: 32, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#8FD3F5", border: "3px solid #1C1A1A", opacity: 1 - v }} />;
                })
              : null}
          </Cocina>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 45%" }}>
          <Cuarto t={t} />
          {TonoAqui}
          <Olor t={t} x={540} y={470 + baja} escala={1.2} />
          <Moscas t={t} cx={540} cy={600 + baja} radio={280} n={4} />
          <Mama t={t} t0={mama.t - 0.05} t1={tLavar - 0.1} texto="¡TE CONSEGUÍ TRABAJO, MIJO!" objeto="guantes" />
        </AbsoluteFill>
      )}

      <Marcador t={t} t0={-1} dias={dias} dinero={dinero} meta={1000} nivel={0} />
      {resumen ? (
        <>
          <SelloGTA t={t} t0={w("cero", resumen.t) - 0.03} t1={w("14", resumen.t) - 0.05} texto="$0" color="#E8473F" top={330} tam={260} />
          <SelloGTA t={t} t0={w("14", resumen.t) - 0.03} t1={w("mil", resumen.t) - 0.05} texto="14 DÍAS" color="#FFFFFF" top={330} tam={220} />
          <SelloGTA t={t} t0={w("mil", resumen.t) - 0.03} t1={resumen.fin + 0.1} texto="$1.000" color="#72D15E" top={330} tam={260} />
        </>
      ) : null}
      <CapturaEncuesta t={t} t0={votaron.t + 0.05} t1={votaron.t + 1.35} src="glowup/dia1/encuesta.png" />
      <ComentarioVotado t={t} t0={votaron.t + 1.35} t1={dia.t - 0.1} nombre="A ¿?" texto="trabajoooo" likes={4} />
      <SelloGTA t={t} t0={tTrabajar - 0.03} t1={dia.t - 0.1} texto="¡A TRABAJAR!" top={900} />
      <TituloDia t={t} t0={dia.t} t1={cv.t - 0.1} dia={1} faltan={14} />
      <RelojHoras t={t} t0={horas.t} t1={paga.t - 0.05} texto="8 HORAS DESPUÉS..." />
      <BilleteVuela t={t} t0={paga.t - 0.05} monto={20} />
      <Leccion t={t} t0={leccion.t} t1={leccion.fin + 0.15} lineas={["El primer trabajo no es el soñado…", "…es el que te arranca."]} t2={tSoñado} />
      <ChatPrimo t={t} t0={tFoto - 0.3} t1={pregunta.t - 0.15} tSello={tReservo} />
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="AHORRAR" b="INVERTIR" iconoA={<IconoAlcancia />} iconoB={<IconoReventa />} sub="¿QUÉ HACE?" />
      <Seguir t={t} t0={sigue} dia={2} />
      {!enCv && !(t >= dia.t && t < cv.t) ? <Subtitulos t={t} palabras={DIA1.palabras} y={1440} /> : null}
      {enCv ? <Subtitulos t={t} palabras={DIA1.palabras} y={1560} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA1.duracion - 0.25, DIA1.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
