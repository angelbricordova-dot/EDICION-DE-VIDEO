import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, Cocina, DiaNoche, Estornudo, IconoEjercicio, IconoGaraje, Leccion, Logro, PlatoLavando, RelojHoras, SelloGTA, TicketFarmacia, TituloDia } from "./escenas";
import { cargarFuentes, Cuarto, Episodio, Marcador, Seguir, Subtitulos, Votacion } from "./piezas";
import { Calle, Cama, Farmacia, Vestuario } from "./escenas2";
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

  // Escenas (corrección de Angel: más variedad de fondos)
  // garaje → cocina (turnos) → vestuario (paga) → cama (lunes, fiebre) → cocina (estornudo)
  // → calle (lo mandan a casa) → farmacia (la cuenta) → garaje (disciplina y votación)
  const tY = w("y", fiebre.t) - 0.08; // "…tos | y estornuda"
  const tFarm = w("y", casa.fin) - 0.05; // "| y la farmacia…"
  type Escena = "garaje" | "cocina" | "vestuario" | "cama" | "calle" | "farmacia";
  const escena: Escena =
    t >= turnos.t && t < paga.t ? "cocina"
    : t >= paga.t && t < lunes.t ? "vestuario"
    : t >= lunes.t && t < tY ? "cama"
    : t >= tY && t < casa.t ? "cocina"
    : t >= casa.t && t < tFarm ? "calle"
    : t >= tFarm && t < disciplina.t ? "farmacia"
    : "garaje";
  let expresion: Expresion = "aburrido";
  if (t < votaron.t) expresion = "aburrido";
  if (t >= votaron.t && t < dia.t) expresion = "shock";
  if (t >= horas.t && t < paga.t) expresion = "aburrido";
  if (t >= paga.t && t < lunes.t) expresion = "feliz";
  if (t >= lunes.t && t < tEstornudo - 0.3) expresion = "llora";
  if (t >= tEstornudo - 0.3 && t < tEstornudo + 0.6) expresion = "shock";
  if (t >= tEstornudo + 0.6 && t < tFarm) expresion = "llora";
  if (t >= tFarm && t < w("30", tFarm) - 0.1) expresion = "aburrido";
  if (t >= w("30", tFarm) - 0.1 && t < w("mal", tFarm)) expresion = "shock";
  if (t >= w("mal", tFarm) && t < disciplina.t) expresion = "llora";
  if (t >= disciplina.t + 0.8) expresion = "feliz";
  if (t >= tA && t < sigue) expresion = "aburrido";
  if (t >= sigue) expresion = "feliz";
  const cansado = t >= horas.t && t < paga.t ? 0.55 + 0.35 * Math.max(0, Math.sin(t * 2.2)) : 0;
  const mirada = escena === "farmacia" ? 1 : t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const pose: Pose = t < resumen.fin ? "bolsillos" : "normal";
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const bajaVoto = Math.max(t >= votaron.t - 0.2 && t < dia.t + 0.1 ? 330 * (1 - easeInOut(prog(t, dia.t - 0.2, dia.t + 0.1, (x) => x))) : 0, 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x)));
  // los platos limpios crecen con los turnos (y ahí siguen cuando estornuda encima)
  const limpios = t < tY ? Math.floor(lerp(0, 8, clamp01((t - turnos.t) / 2)) + lerp(0, 28, easeOut(clamp01((t - horas.t) / (paga.t - horas.t))))) : 26;
  const cambios = [0, turnos.t, paga.t, lunes.t, tY, casa.t, tFarm, disciplina.t, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const empuje = lerp(1.08, 1, easeOut(clamp01((t - desde) / 0.45)));
  const sudor = t >= horas.t && t < paga.t;
  const enfermoCocina = t >= tY && t < casa.t;
  const camina = escena === "calle" ? Math.abs(Math.sin(t * 7)) * -14 : 0;

  const TonoAqui = (props: { left?: number; top?: number; ancho?: number; ropa: "sudadera" | "lavaplatos" }) => (
    <div style={{ position: "absolute", left: props.left ?? 180, top: (props.top ?? 292) + (escena === "garaje" ? bajaVoto : 0) + camina, transformOrigin: "50% 100%", scale: `1 ${respira}`, rotate: t >= tEstornudo - 0.05 && t < tEstornudo + 0.25 ? `${Math.sin((t - tEstornudo) * 40) * 3}deg` : escena === "calle" ? `${Math.sin(t * 3.5) * 2}deg` : undefined }}>
      <Tono ancho={props.ancho ?? 720} expresion={expresion} pose={pose} ropa={props.ropa} parpadeo={cansado || (expresion === "aburrido" ? parpadeo(t) : 0)} mirada={mirada} t={t} />
    </div>
  );
  const mejillas = (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <ellipse cx={470} cy={690} rx={30} ry={16} fill="#E5484D" opacity={0.55} />
      <ellipse cx={610} cy={690} rx={30} ry={16} fill="#E5484D" opacity={0.55} />
    </svg>
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(empuje), transformOrigin: "50% 45%" }}>
        {escena === "cocina" ? (
          <Cocina t={t} platos={6} limpios={limpios} oscuro={sudor ? 0.25 * Math.max(0, Math.sin(t * 1.5)) + 0.1 : 0}>
            {TonoAqui({ ropa: "lavaplatos" })}
            {enfermoCocina ? mejillas : null}
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <rect x={0} y={1130} width={1080} height={790} fill="#B7C0C7" />
              <rect x={0} y={1110} width={1080} height={40} fill="#D3D9DE" stroke="#1C1A1A" strokeWidth={6} />
              <rect x={250} y={1150} width={580} height={240} rx={20} fill="#8C969E" stroke="#1C1A1A" strokeWidth={6} />
            </svg>
            {!enfermoCocina ? <PlatoLavando t={t} /> : null}
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
        ) : escena === "vestuario" ? (
          <Vestuario t={t} t0={paga.t + 0.15}>{TonoAqui({ top: 420, ropa: "lavaplatos" })}</Vestuario>
        ) : escena === "cama" ? (
          <Cama t={t} tAlarma={lunes.t} tFin={w("levanta", lunes.t) + 0.6} tFiebre={fiebre.t} tTos={w("tos", fiebre.t)} expresion={expresion} parpadeo={t < w("no", lunes.t) ? 1 : 0.35} />
        ) : escena === "calle" ? (
          <Calle t={t} t0={casa.t}>
            {TonoAqui({ top: 420, ropa: "sudadera" })}
            {mejillas}
          </Calle>
        ) : escena === "farmacia" ? (
          <Farmacia t={t}>
            {TonoAqui({ left: -60, top: 330, ancho: 640, ropa: "sudadera" })}
          </Farmacia>
        ) : (
          <>
            <Cuarto t={t} />
            {TonoAqui({ ropa: "sudadera" })}
          </>
        )}
      </AbsoluteFill>

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
      <SelloGTA t={t} t0={casa.t - 0.03} t1={tFarm - 0.05} texto="DESPEDIDO... POR HOY" color="#E8473F" top={1180} tam={110} />
      <TicketFarmacia t={t} t0={f("farmacia").t + 0.35} t1={baja.fin} total={30} caja={{ left: 520, right: 30, top: 270, padding: "20px 22px", fontSize: 26 }} alto={760} />
      <Logro t={t} t0={w("disciplina", disciplina.t) - 0.05} t1={leccion.t - 0.1} titulo="LOGRO DESBLOQUEADO" texto="DISCIPLINA" />
      <Leccion t={t} t0={leccion.t} t1={leccion.fin + 0.15} lineas={["Trabajar duro sirve…", "…pero sin descanso, te pasa factura."]} t2={w("pero", leccion.t + 0.5)} />
      {t >= cambiar.t && t < tA - 0.1 ? <SelloGTA t={t} t0={cambiar.t} t1={tA - 0.15} texto="¿POR DÓNDE EMPIEZA?" color="#F7C948" top={380} tam={96} /> : null}
      <Votacion t={t} tA={tA} tB={tB} t1={sigue - 0.15} a="ORDENAR EL GARAJE" b="EJERCICIO CADA MAÑANA" iconoA={<IconoGaraje />} iconoB={<IconoEjercicio />} sub="¿QUÉ PRIMERO?" />
      <Seguir t={t} t0={sigue} dia={3} />
      {!(t >= dia.t && t < turnos.t) ? <Subtitulos t={t} palabras={DIA2.palabras} y={escena === "farmacia" ? 1520 : 1440} /> : null}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, DIA2.duracion - 0.25, DIA2.duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
