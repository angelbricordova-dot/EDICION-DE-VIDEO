import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, Cocina, DiaNoche, Estornudo, IconoEjercicio, IconoGaraje, Leccion, Logro, PlatoLavando, RelojHoras, SelloGTA, TicketFarmacia, TituloDia } from "./escenas";
import { cargarFuentes, Cuarto, Episodio, Mama, Marcador, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia2.json";

// Día 2 de Toño: ganó "más turnos" (62 %). Giro: dobla turnos 16 h, cobra $40 ($60)… y se enferma;
// estornuda sobre los platos, lo mandan a casa, la farmacia le cobra $30 → vuelve a $30. Pero gana
// DISCIPLINA (logro desbloqueado). Lección: sin descanso te pasa factura. Votación para empezar a
// cuidarse: ORDENAR EL GARAJE (y vender lo que no usa) vs EJERCICIO CADA MAÑANA.

export const DIA2 = datos as Episodio;
export type PropsDia2 = { audio: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};

export const Dia2: React.FC<PropsDia2> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const f = (id: string) => {
    const x = DIA2.frases.find((z) => z.id === id);
    if (!x) throw new Error(`Falta la frase ${id}`);
    return x;
  };
  const ws = (p: string) => DIA2.palabras.filter((z) => z.p.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "") === p).map((z) => z.ini);
  const w = (p: string, desde = 0) => ws(p).find((x) => x >= desde - 0.01) ?? desde;

  const resumen = f("resumen");
  const votaron = f("votaron");
  const dia = f("dia");
  const turnos = f("turnos");
  const horas = f("horas");
  const paga = f("paga");
  const lunes = f("lunes");
  const fiebre = f("fiebre");
  const casa = f("casa");
  const farmacia = f("farmacia");
  const baja = f("baja");
  const disciplina = f("disciplina");
  const leccion = f("leccion");
  const cambiar = f("cambiar");
  const opciones = f("opciones");
  const sigue = f("sigueme").t;
  const tEstornudo = w("estornuda", fiebre.t);
  const t60 = w("60", paga.t);
  const t30 = w("30", baja.t);
  const tA = w("ordenar", opciones.t) - 0.1;
  const tB = w("hacer", opciones.t) - 0.1;

  // Dinero: $20 → $60 al cobrar → $30 tras la farmacia
  const sube = easeOut(clamp01((t - (t60 - 0.4)) / 0.4));
  const bajaK = easeOut(clamp01((t - (t30 - 0.3)) / 0.5));
  const dinero = Math.round(lerp(lerp(20, 60, sube), 30, bajaK));
  const nivel = t >= t60 && t < t30 - 0.1 ? 1 : 0;

  // Escenas
  const enCocina = (t >= turnos.t && t < lunes.t) || (t >= fiebre.t && t < farmacia.t);
  const enfermo = t >= lunes.t && t < disciplina.t;
  const oscuroGaraje = t >= lunes.t && t < fiebre.t ? 0.55 : enfermo ? 0.25 : 0;
  let expresion: Expresion = "aburrido";
  if (t < votaron.t) expresion = "aburrido";
  if (t >= votaron.t && t < dia.t) expresion = "shock";
  if (t >= horas.t && t < paga.t) expresion = "aburrido";
  if (t >= paga.t && t < lunes.t) expresion = "feliz";
  if (t >= lunes.t && t < tEstornudo - 0.3) expresion = "llora";
  if (t >= tEstornudo - 0.3 && t < tEstornudo + 0.6) expresion = "shock";
  if (t >= farmacia.t && t < disciplina.t) expresion = "llora";
  if (t >= disciplina.t + 0.8) expresion = "feliz";
  if (t >= tA && t < sigue) expresion = "aburrido";
  if (t >= sigue) expresion = "feliz";
  const cansado = t >= horas.t && t < paga.t ? 0.55 + 0.35 * Math.max(0, Math.sin(t * 2.2)) : 0;
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const pose: Pose = t < resumen.fin ? "bolsillos" : "normal";
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const bajaVoto = Math.max(t >= votaron.t - 0.2 && t < dia.t + 0.1 ? 330 * (1 - easeInOut(prog(t, dia.t - 0.2, dia.t + 0.1, (x) => x))) : 0, 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x)));
  // los platos limpios crecen con los turnos; tras el estornudo, a 0
  const limpios = t < fiebre.t ? Math.floor(lerp(0, 8, clamp01((t - turnos.t) / 2)) + lerp(0, 28, easeOut(clamp01((t - horas.t) / (paga.t - horas.t))))) : 26;
  const cambios = [0, turnos.t, lunes.t, fiebre.t, farmacia.t, disciplina.t, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const empuje = lerp(1.08, 1, easeOut(clamp01((t - desde) / 0.45)));
  const sudor = t >= horas.t && t < paga.t;

  const TonoAqui = (
    <div style={{ position: "absolute", left: 180, top: 292 + (enCocina ? 0 : bajaVoto), transformOrigin: "50% 100%", scale: `1 ${respira}`, rotate: t >= tEstornudo - 0.05 && t < tEstornudo + 0.25 ? `${Math.sin((t - tEstornudo) * 40) * 3}deg` : undefined }}>
      <Tono ancho={720} expresion={expresion} pose={pose} ropa={enCocina ? "lavaplatos" : "sudadera"} parpadeo={cansado || (expresion === "aburrido" ? parpadeo(t) : 0)} mirada={mirada} t={t} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {enCocina ? (
        <AbsoluteFill style={{ scale: String(empuje) }}>
          <Cocina t={t} platos={6} limpios={limpios} oscuro={sudor ? 0.25 * Math.max(0, Math.sin(t * 1.5)) + 0.1 : 0}>
            {TonoAqui}
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <rect x={0} y={1130} width={1080} height={790} fill="#B7C0C7" />
              <rect x={0} y={1110} width={1080} height={40} fill="#D3D9DE" stroke="#1C1A1A" strokeWidth={6} />
              <rect x={250} y={1150} width={580} height={240} rx={20} fill="#8C969E" stroke="#1C1A1A" strokeWidth={6} />
            </svg>
            {t < fiebre.t ? <PlatoLavando t={t} /> : null}
            {sudor
              ? [0, 1, 2].map((i) => {
                  const v = (t * 1.4 + i / 3) % 1;
                  return <div key={i} style={{ position: "absolute", left: 400 + i * 130, top: 520 + v * 180, width: 22, height: 32, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#8FD3F5", border: "3px solid #1C1A1A", opacity: 1 - v }} />;
                })
              : null}
            <Estornudo t={t} t0={tEstornudo - 0.05} />
            {t >= tEstornudo + 0.6 && t < casa.t ? (
              <div style={{ position: "absolute", right: 50, top: 600, background: "#fff", border: "6px solid #1C1A1A", borderRadius: 36, padding: "14px 28px", fontFamily: '"Lilita One", sans-serif', fontSize: 60, color: "#1C1A1A", scale: String(easeOut(clamp01((t - tEstornudo - 0.6) / 0.2))) }}>¡QUÉ ASCO! 🤢</div>
            ) : null}
          </Cocina>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 45%" }}>
          <Cuarto t={t} />
          {TonoAqui}
          {enfermo ? (
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              {/* cobija hecha burrito, mejillas rojas de fiebre y termómetro */}
              <path d="M 250 840 Q 540 770 830 840 L 900 1300 Q 540 1360 180 1300 Z" fill="#5A7BB5" stroke="#1C1A1A" strokeWidth={7} />
              <path d="M 250 840 Q 540 900 830 840" fill="none" stroke="#45679F" strokeWidth={10} />
              <path d="M 240 1000 Q 540 940 850 1000 M 220 1160 Q 540 1100 870 1160" fill="none" stroke="#45679F" strokeWidth={8} />
              <ellipse cx={470} cy={690} rx={28} ry={15} fill="#E5484D" opacity={0.55} />
              <ellipse cx={610} cy={690} rx={28} ry={15} fill="#E5484D" opacity={0.55} />
              <g transform="rotate(-20 560 735)">
                <rect x={560} y={725} width={150} height={20} rx={10} fill="#F1F1F1" stroke="#1C1A1A" strokeWidth={4} />
                <rect x={600} y={729} width={100} height={12} rx={6} fill="#E5484D" />
              </g>
            </svg>
          ) : null}
          {oscuroGaraje ? <AbsoluteFill style={{ background: `rgba(10,14,30,${oscuroGaraje})` }} /> : null}
          <Mama t={t} t0={farmacia.t + 0.9} t1={baja.fin} texto="¡VAPORUB, MIJO!" objeto="vaporub" />
        </AbsoluteFill>
      )}

      <Marcador t={t} t0={-1} dias={13} dinero={dinero} meta={1000} nivel={nivel} />
      <SelloGTA t={t} t0={w("20") - 0.03} t1={w("13") - 0.05} texto="$20" color="#72D15E" top={330} tam={260} />
      <SelloGTA t={t} t0={w("13") - 0.03} t1={w("mil") - 0.05} texto="13 DÍAS" color="#FFFFFF" top={330} tam={220} />
      <SelloGTA t={t} t0={w("mil") - 0.03} t1={resumen.fin + 0.1} texto="$1.000" color="#72D15E" top={330} tam={260} />
      <CapturaEncuesta t={t} t0={votaron.t + 0.05} t1={dia.t - 0.1} src="glowup/dia2/encuesta.png" />
      <TituloDia t={t} t0={dia.t} t1={turnos.t - 0.1} dia={2} faltan={13} />
      <DiaNoche t={t} t0={turnos.t + 0.1} t1={horas.fin} noche={prog(t, w("noche", turnos.t) - 0.3, w("noche", turnos.t) + 0.3) + (t > horas.t ? Math.max(0, Math.sin((t - horas.t) * 4)) : 0)} />
      <RelojHoras t={t} t0={horas.t} t1={paga.t - 0.05} texto="16 HORAS SEGUIDAS" />
      <BilleteVuela t={t} t0={t60 - 1.0} monto={40} />
      <SelloGTA t={t} t0={lunes.t + 0.1} t1={fiebre.t - 0.1} texto="EL LUNES..." color="#FFFFFF" top={1210} tam={150} />
      <SelloGTA t={t} t0={casa.t - 0.03} t1={farmacia.t - 0.1} texto="DESPEDIDO... POR HOY" color="#E8473F" top={420} tam={120} />
      <TicketFarmacia t={t} t0={farmacia.t + 0.1} t1={baja.fin} total={30} />
      <Logro t={t} t0={w("disciplina", disciplina.t) - 0.05} t1={leccion.t - 0.1} titulo="LOGRO DESBLOQUEADO" texto="DISCIPLINA" />
      <Leccion t={t} t0={leccion.t} t1={leccion.fin + 0.15} lineas={["Trabajar duro sirve…", "…pero sin descanso, te pasa factura."]} t2={w("pero", leccion.t + 0.5)} />
      {t >= cambiar.t && t < tA - 0.1 ? <SelloGTA t={t} t0={cambiar.t} t1={tA - 0.15} texto="¿POR DÓNDE EMPIEZA?" color="#F7C948" top={380} tam={96} /> : null}
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="ORDENAR EL GARAJE" b="EJERCICIO CADA MAÑANA" iconoA={<IconoGaraje />} iconoB={<IconoEjercicio />} sub="¿QUÉ PRIMERO?" />
      <Seguir t={t} t0={sigue} dia={3} />
      {!(t >= dia.t && t < turnos.t) && !(t >= farmacia.t && t < baja.fin) ? <Subtitulos t={t} palabras={DIA2.palabras} y={1440} /> : null}
      {t >= farmacia.t && t < baja.fin ? <Subtitulos t={t} palabras={DIA2.palabras} y={1520} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA2.duracion - 0.25, DIA2.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
