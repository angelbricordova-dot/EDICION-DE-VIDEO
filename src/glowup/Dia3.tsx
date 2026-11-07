import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog } from "../comun/animacion";
import { BilleteVuela, CapturaEncuesta, Leccion, SelloGTA, TituloDia } from "./escenas";
import { AnuncioBrayan, Arana, BrayanPresume, Brillos, ChatBrayan, IconoGuru, IconoVideoGratis, Lavanderia, Polvo, Telefono, TonoAsoma, Trastos } from "./escenas3";
import { AnuncioGrande, Bici, BolsilloPrimerPlano, CajaBusca, Camara, ChanclaFuerte, ChaquetaEnManos, GarajeEstantes, Plano, PortonGaraje, TelefonoEnManos } from "./escenas3b";
import { Nino } from "./Nino";
import { cargarFuentes, Cuarto, Episodio, Marcador, Seguir, Subtitulos, Votacion } from "./piezas";
import { Expresion, Pose, Tono } from "./Tono";
import datos from "./dia3.json";

// Día 3 de Toño (v2 con las correcciones de Angel): ganó ORDENAR EL GARAJE (85 %). Muchos planos
// y escenarios dentro del mismo entorno: garaje desordenado → el otro lado del garaje (estantes,
// caja de la que salen cosas, araña en primer plano, caja "TOÑO NIÑO") → muestra la chaqueta a
// cámara y saca los $10 del bolsillo (primer plano) → fotos con flash → anuncios → portón del
// garaje: le da la bici al niño ($35) → chat: le manda la foto de la consola a Brayan ($10) →
// Brayan la revende en $60 → publica la lavadora (anuncio grande) → lavandería: chancla con fuerza
// → garaje limpio $85 → lección → Brayan +$50 → votación CURSO DEL GURÚ vs YOUTUBE GRATIS.

export const DIA3 = datos as Episodio;
export type PropsDia3 = { audio: string | null; encuesta?: string | null };

const parpadeo = (t: number) => {
  const c = (t + 0.7) % 2.9;
  return c < 0.13 ? Math.sin((c / 0.13) * Math.PI) : 0;
};
const FOTO_CONSOLA = "glowup/dia3/consola.jpg";

export const Dia3: React.FC<PropsDia3> = ({ audio, encuesta = "glowup/dia3/encuesta.png" }) => {
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
  const tBolsillo = w("encuentra", chaqueta.t) - 0.3;
  const tYaTiene = w("ya", chaqueta.t) - 0.05;
  const t40 = w("40", chaqueta.t);
  const tFotos = w("fotos", publica.t);
  const tPublica = w("publica", publica.t) - 0.05;
  const t35 = w("35", bici.t);
  const t10 = w("10", consola.t);
  const t60 = w("60", brayan.t);
  const tPublicaLav = w("publica", lavadora.t) - 0.05;
  const tChancla = w("mamá", mama.t) - 0.3;
  const t85 = w("85", total.t);
  const tA = w("gastar", opciones.t) - 0.1;
  const tB = w("aprender", opciones.t) - 0.1;

  // Dinero: $30 → $40 (chaqueta) → $75 (bici) → $85 (consola)
  const paso = (t0: number) => easeOut(clamp01((t - t0) / 0.4));
  const dinero = Math.round(30 + 10 * paso(t40 + 0.1) + 35 * paso(t35 + 0.3) + 10 * paso(t10 + 0.3));
  const nivel = t >= total.t ? 1 : 0;

  type Escena = "garaje" | "busca" | "cajaNino" | "chaqueta" | "bolsillo" | "billete" | "fotos" | "anuncios" | "porton" | "chat" | "anuncioBrayan" | "emociona" | "lavadora" | "lavanderia" | "limpio" | "brayan";
  const escena: Escena =
    t < polvo.t ? "garaje"
    : t < tCajas ? "busca"
    : t < chaqueta.t ? "cajaNino"
    : t < tBolsillo ? "chaqueta"
    : t < tYaTiene ? "bolsillo"
    : t < publica.t ? "billete"
    : t < tPublica ? "fotos"
    : t < bici.t ? "anuncios"
    : t < consola.t ? "porton"
    : t < brayan.t ? "chat"
    : t < lavadora.t ? "anuncioBrayan"
    : t < tPublicaLav ? "emociona"
    : t < mama.t ? "lavadora"
    : t < total.t ? "lavanderia"
    : t < pregunta.t ? "limpio"
    : t < opciones.t ? "brayan"
    : "limpio";

  let expresion: Expresion = "aburrido";
  if (t >= votaron.t && t < dia.t) expresion = "shock";
  if (escena === "busca") expresion = t >= tArana - 0.1 ? "shock" : "aburrido";
  if (escena === "cajaNino" || escena === "billete" || escena === "fotos" || escena === "porton" || escena === "emociona") expresion = "feliz";
  if (escena === "chaqueta") expresion = "aburrido";
  if (escena === "lavanderia") expresion = t >= tChancla + 0.22 ? "llora" : "shock";
  if (escena === "limpio") expresion = "feliz";
  if (t >= tA && t < sigue) expresion = "aburrido";
  if (t >= sigue) expresion = "feliz";
  const mirada = t >= tA && t < tB ? -1 : t >= tB && t < sigue ? 1 : 0;
  const respira = 1 + 0.008 * Math.sin(t * 2.4);
  const bajaVoto = 430 * easeInOut(prog(t, tA - 0.3, tA + 0.2, (x) => x));
  const tambalea = escena === "lavanderia" && t >= tChancla + 0.22 && t < tChancla + 0.9 ? Math.sin((t - tChancla) * 40) * 5 : 0;
  const busca = escena === "busca" && t < tArana - 0.2 ? Math.sin(t * 9) * 26 : 0; // cabeza que baja y sube dentro de la caja

  const ToNo = (props: { left?: number; top?: number; ancho?: number; pose?: Pose; expr?: Expresion }) => (
    <div style={{ position: "absolute", left: props.left ?? 180, top: (props.top ?? 292) + busca, transformOrigin: "50% 100%", scale: `1 ${respira}`, rotate: `${tambalea}deg` }}>
      <Tono ancho={props.ancho ?? 720} expresion={props.expr ?? expresion} pose={props.pose ?? "normal"} parpadeo={(props.expr ?? expresion) === "aburrido" ? parpadeo(t) : 0} mirada={mirada} t={t} />
    </div>
  );
  const borroso = (hijo: React.ReactNode) => <AbsoluteFill style={{ filter: "blur(12px) brightness(0.7)", scale: "1.08" }}>{hijo}</AbsoluteFill>;

  // planos (cámara) de cada escena
  const P = (t0: number, s: number, x: number, y: number): Plano => ({ t: t0, s, x, y });
  let escenaVista: React.ReactNode = null;
  let temblor = 0;
  let planos: Plano[] = [P(0, 1, 540, 960)];

  if (escena === "garaje") {
    planos = [P(0, 1, 540, 960), P(w("30") - 0.05, 1.9, 540, 640), P(w("12") - 0.05, 1.35, 540, 820), P(w("mil") - 0.05, 1, 540, 960), P(votaron.t, 1.6, 540, 660)];
    escenaVista = (
      <>
        <Cuarto t={t} />
        <Trastos t={t} />
        {ToNo({ pose: t < resumen.fin ? "bolsillos" : "normal" })}
      </>
    );
  } else if (escena === "busca") {
    planos = [P(polvo.t, 1, 540, 960), P(tArana - 0.45, 2.1, 560, 700)];
    temblor = t >= tArana && t < tArana + 0.4 ? 10 : 0;
    escenaVista = (
      <>
        <GarajeEstantes t={t} />
        {ToNo({ top: 400 })}
        <CajaBusca t={t} t0={polvo.t + 0.15} y={1230} />
        <Polvo t={t} t0={polvo.t} t1={tCajas} />
        <Arana t={t} t0={tArana - 0.45} t1={tCajas} x={600} y={610} />
      </>
    );
  } else if (escena === "cajaNino") {
    planos = [P(tCajas, 1.25, 540, 860)];
    escenaVista = (
      <>
        <GarajeEstantes t={t} />
        {ToNo({ pose: "sostiene" })}
        {/* la caja "TOÑO NIÑO" en sus manos, abierta, con luz que sale */}
        <svg width={720} height={1560} viewBox="0 0 600 1300" style={{ position: "absolute", left: 180, top: 292, overflow: "visible" }}>
          <g opacity={0.5 + 0.3 * Math.sin(t * 6)}>
            {Array.from({ length: 7 }, (_, i) => <path key={i} d="M 300 560 L 230 300 L 370 300 Z" fill="#FFE9A8" transform={`rotate(${(i - 3) * 16} 300 560)`} />)}
          </g>
          <rect x={170} y={560} width={260} height={190} fill="#B58548" stroke="#1C1A1A" strokeWidth={6} />
          <path d="M 170 560 L 120 500 L 250 520 Z M 430 560 L 480 500 L 350 520 Z" fill="#C99A5B" stroke="#1C1A1A" strokeWidth={6} strokeLinejoin="round" />
          <text x={300} y={680} textAnchor="middle" fontFamily='"Lilita One", sans-serif' fontSize={40} fill="#7A4A2A">TOÑO NIÑO</text>
        </svg>
        <Polvo t={t} t0={tCajas} t1={chaqueta.t} />
      </>
    );
  } else if (escena === "chaqueta") {
    planos = [P(chaqueta.t, 1.1, 540, 900)];
    escenaVista = (
      <>
        <GarajeEstantes t={t} />
        {ToNo({ pose: "sostiene", expr: "aburrido" })}
        <ChaquetaEnManos left={180} top={292} ancho={720} t={t} />
      </>
    );
  } else if (escena === "bolsillo") {
    escenaVista = <BolsilloPrimerPlano t={t} t0={tBolsillo} />;
  } else if (escena === "billete") {
    planos = [P(tYaTiene, 1.5, 540, 700)];
    escenaVista = (
      <>
        <GarajeEstantes t={t} />
        {ToNo({ pose: "sostiene", expr: "feliz" })}
        {t < t40 - 0.45 ? (
          <svg width={720} height={1560} viewBox="0 0 600 1300" style={{ position: "absolute", left: 180, top: 292, overflow: "visible" }}>
            <g transform="translate(300 540) rotate(-6)">
              <rect x={-110} y={-52} width={220} height={104} rx={10} fill="#85C46B" stroke="#1E5A2B" strokeWidth={6} />
              <circle r={28} fill="#B9E3A4" stroke="#1E5A2B" strokeWidth={4} />
              <text y={13} textAnchor="middle" fontFamily="Arial Black" fontSize={36} fill="#1E5A2B">10</text>
            </g>
          </svg>
        ) : null}
      </>
    );
  } else if (escena === "fotos") {
    planos = [P(publica.t, 1.2, 540, 820)];
    escenaVista = (
      <>
        <GarajeEstantes t={t} />
        {ToNo({ pose: "telefono" })}
        <TelefonoEnManos left={180} top={292} ancho={720} t={t} flashes={[tFotos, tFotos + 0.35, tFotos + 0.7]} />
      </>
    );
  } else if (escena === "anuncios") {
    escenaVista = (
      <>
        {borroso(<GarajeEstantes t={t} />)}
        <Telefono
          t={t}
          anuncios={[
            { que: "bici", nombre: "Bici vieja", precio: 35, t0: tPublica + 0.1 },
            { que: "consola", nombre: "Consola vieja", precio: 10, t0: tPublica + 0.45 },
            { que: "patineta", nombre: "Patineta", precio: 8, t0: tPublica + 0.8 },
            { que: "lampara", nombre: "Lámpara", precio: 6, t0: tPublica + 1.1 },
          ]}
        />
      </>
    );
  } else if (escena === "porton") {
    // el niño llega, paga y se va con la bici
    const llega = easeOut(clamp01((t - bici.t) / 0.6));
    const vaSe = easeIn(clamp01((t - t35 - 0.7) / 0.7));
    const xNino = lerp(1150, 690, llega) + vaSe * 600;
    const xBici = 470 + vaSe * 600;
    planos = [P(bici.t, 1, 540, 960), P(t35 - 0.2, 1.5, 640, 1150), P(t35 + 0.7, 1, 540, 960)];
    escenaVista = (
      <PortonGaraje t={t}>
        {ToNo({ left: 40, top: 560, ancho: 540, pose: vaSe > 0 ? "normal" : "ofrece" })}
        <div style={{ position: "absolute", left: xNino, top: 990 + Math.abs(Math.sin(t * 8)) * (llega < 1 ? -14 : 0) }}>
          <Nino ancho={360} t={t} expresion={t >= t35 - 0.3 ? "feliz" : "sorpresa"} pose={t >= t35 - 0.35 && t < t35 + 0.6 ? "paga" : "normal"} />
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${xBici} 1450) scale(3.2)`}>
            <Bici giro={vaSe * 720} />
          </g>
        </svg>
      </PortonGaraje>
    );
  } else if (escena === "chat") {
    planos = [P(consola.t, 1, 540, 960), P(t10 - 0.1, 1.25, 540, 900)];
    escenaVista = (
      <>
        {borroso(<GarajeEstantes t={t} bici={false} />)}
        <ChatBrayan
          t={t}
          mensajes={[
            { de: "tono", texto: "¿La quieres? 👀", t0: consola.t + 0.15, foto: FOTO_CONSOLA },
            { de: "brayan", texto: "Te doy 10 😎", t0: w("primo", consola.t) },
            { de: "tono", texto: "¡Trato! 🤝", t0: t10 - 0.1 },
          ]}
          sello={{ texto: "VENDIDA", t0: t10 + 0.25 }}
        />
      </>
    );
  } else if (escena === "anuncioBrayan") {
    planos = [P(brayan.t, 1, 540, 960), P(t60 - 0.05, 1.2, 540, 1000)];
    escenaVista = (
      <>
        <AnuncioBrayan t={t} t0={brayan.t} tPrecio={t60} foto={FOTO_CONSOLA} />
        <TonoAsoma t={t} t0={t60 - 0.1} expresion={t >= t60 ? "shock" : "aburrido"} x={680} ancho={340} />
      </>
    );
  } else if (escena === "emociona") {
    planos = [P(lavadora.t, 1.35, 540, 760)];
    escenaVista = (
      <>
        <GarajeEstantes t={t} bici={false} />
        {ToNo({ pose: "celebra", expr: "feliz" })}
      </>
    );
  } else if (escena === "lavadora") {
    escenaVista = (
      <>
        {borroso(<Lavanderia t={t} />)}
        <AnuncioGrande t={t} t0={tPublicaLav + 0.05} que="lavadora" nombre="Lavadora (funciona)" precio={80} />
      </>
    );
  } else if (escena === "lavanderia") {
    planos = [P(mama.t, 1.35, 520, 820), P(tChancla + 0.22, 1.6, 420, 700)];
    temblor = t >= tChancla + 0.22 && t < tChancla + 0.6 ? 18 : 0;
    escenaVista = (
      <Lavanderia t={t}>
        {ToNo({ left: 60, top: 292 })}
        <ChanclaFuerte t={t} t0={tChancla} x={420} y={560} />
      </Lavanderia>
    );
  } else if (escena === "brayan") {
    escenaVista = (
      <BrayanPresume t={t} t0={pregunta.t}>
        <TonoAsoma t={t} t0={w("toño", pregunta.t) - 0.1} expresion="llora" x={40} ancho={340} />
      </BrayanPresume>
    );
  } else {
    // garaje limpio: celebra $85 (planos), lección y votación
    planos = [
      P(total.t, 1, 540, 960), P(t85 - 0.05, 1.6, 540, 640), P(w("mejor", total.t) - 0.05, 1, 540, 960),
      P(leccion.t, 1.25, 540, 900), P(w("pero", leccion.t + 0.5) - 0.05, 1.45, 560, 760),
      P(opciones.t, 1, 540, 960), P(tA, 1.2, 380, 1100), P(w("millonario", opciones.t) - 0.05, 1.45, 540, 1250), P(tB, 1.2, 700, 1100), P(sigue, 1, 540, 960),
    ];
    const celebra = t < leccion.t;
    escenaVista = (
      <>
        <Cuarto t={t} limpio />
        <div style={{ position: "absolute", inset: 0, translate: `0 ${t >= opciones.t ? bajaVoto : 0}px` }}>{ToNo({ pose: celebra ? "celebra" : "normal" })}</div>
        {celebra ? <Brillos t={t} t0={total.t} /> : null}
      </>
    );
  }

  const cambios = [0, polvo.t, tCajas, chaqueta.t, tBolsillo, tYaTiene, publica.t, tPublica, bici.t, consola.t, brayan.t, lavadora.t, tPublicaLav, mama.t, total.t, pregunta.t, opciones.t, sigue];
  const desde = Math.max(...cambios.filter((c) => c <= t));
  const flashCorte = 1 - clamp01((t - desde) / 0.08);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Camara t={t} planos={planos} temblor={temblor}>
        {escenaVista}
      </Camara>
      {flashCorte > 0 && desde > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flashCorte * 0.35 }} /> : null}

      <Marcador t={t} t0={-1} dias={12} dinero={dinero} meta={1000} nivel={nivel} />
      <SelloGTA t={t} t0={w("30") - 0.03} t1={w("12") - 0.05} texto="$30" color="#72D15E" top={330} tam={260} />
      <SelloGTA t={t} t0={w("12") - 0.03} t1={w("mil") - 0.05} texto="12 DÍAS" color="#FFFFFF" top={330} tam={220} />
      <SelloGTA t={t} t0={w("mil") - 0.03} t1={resumen.fin + 0.1} texto="$1.000" color="#72D15E" top={330} tam={260} />
      {encuesta ? <CapturaEncuesta t={t} t0={votaron.t + 0.05} t1={dia.t - 0.1} src={encuesta} marca={{ left: "9%", right: "5%", top: "47%", height: "23%" }} /> : null}
      <TituloDia t={t} t0={dia.t} t1={polvo.t - 0.05} dia={3} faltan={12} />
      <BilleteVuela t={t} t0={t40 - 0.45} monto={10} />
      <BilleteVuela t={t} t0={t35 + 0.3} monto={35} />
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
