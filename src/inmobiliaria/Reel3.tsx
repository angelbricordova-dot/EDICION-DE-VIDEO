import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS } from "../comun/animacion";
import { AMARILLO, bloques, cargarFuentes, Corte, Destello, lerp, Palabra, Persona, Pop, prog, Subtitulo, TextoSombra } from "./piezas";
import { Comentario, Grande, limpio, Lista, Pegatina, Pildora } from "./comunes";
import { Banco, Cadena, CasaVacia, Demanda, Documento, Edificio, Energia, Mazo, PinCandado, Recibo } from "./iconos";
import hook1 from "./g3-hook1.json";
import hook2 from "./g3-hook2.json";

// Reel 3 "5 documentos que tienes que pedir" (guion 3 del documento del cliente), con el
// estilo aprobado en el reel 6: persona siempre en pantalla, título fijo con el hook, lista
// 1-5 que se va llenando, documentos junto al hombro y píldoras sobre el pecho (nunca en la
// cara), subtítulos blancos con sombra y caja de comentario en el CTA.

type CorteReel = { duracion: number; cortes: Corte[]; palabras: Palabra[] };
export const G3: Record<"hook1" | "hook2", CorteReel> = { hook1: hook1 as CorteReel, hook2: hook2 as CorteReel };

export type PropsReel3 = { audio: string | null; version: keyof typeof G3 };

const CARA = { x: 930, y: 460 };
const PUNTOS = ["Nota simple", "Catastro e IBI", "Habitabilidad", "Cert. comunidad", "ITE"];

/** Las 5 hojas en abanico junto al hombro (gancho). */
const Abanico: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (
  <div style={{ position: "relative", width: 300, height: 260 }}>
    {["NOTA", "IBI", "CÉDULA", "COMUN.", "ITE"].map((n, i) => (
      <div key={n} style={{ position: "absolute", left: 60 + (i - 2) * 26, top: 20 + Math.abs(i - 2) * 10, rotate: `${(i - 2) * 11}deg`, transformOrigin: "50% 100%" }}>
        <Pop t={t} t0={t0 + i * 0.07} desde={0.3}>
          <Documento tam={200} titulo={n} color={["#2A3340", "#E3141F", "#1C86E8", "#8A4FD0", "#159B3C"][i]} />
        </Pop>
      </div>
    ))}
  </div>
);

export const Reel3: React.FC<PropsReel3> = ({ audio, version }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { cortes, palabras, duracion } = G3[version];

  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  const uno = tras("Primero,");
  const dos = tras("Segundo,", uno);
  const tres = tras("Tercero,", dos);
  const cuatro = tras("Cuarto,", tres);
  const cinco = tras("quinto,", cuatro);
  const M = {
    nota: tras("nota", uno),
    cargas: tras("cargas,", uno),
    embargos: tras("embargos", uno),
    hipotecas: tras("hipotecas.", uno),
    referencia: tras("referencia", dos),
    recibo: tras("recibo", dos),
    ibi: tras("IBI", dos),
    cedula: tras("cédula", tres),
    licencia: tras("licencia", tres),
    certEnergia: tras("certificado", tres),
    energetico: tras("energético.", tres),
    certCom: tras("certificado", cuatro),
    deudas: tras("deudas", cuatro),
    derramas: tras("derramas", cuatro),
    y5: tras("Y", tras("aprobadas.", cuatro)),
    edificio: tras("edificio", cinco),
    inspeccion: tras("inspección", cinco),
    resultado: tras("resultado,", cinco),
    porque: tras("porque", cinco),
    basta: tras("basta", cinco),
    hay: tras("hay", tras("guste,", cinco)),
    condiciones: tras("condiciones.", cinco),
    invertir: tras("invertir,", cinco),
    demanda: tras("demanda", cinco),
    zona: tras("zona.", cinco),
    siPiso: tras("Si", tras("zona.", cinco)),
    inquilinos: tras("inquilinos", cinco),
    muchisimo: tras("muchísimo", cinco),
    dinero: tras("dinero", tras("muchísimo", cinco)),
    cta: tras("Si", tras("dinero", tras("muchísimo", cinco))),
    comenta: tras("comenta", tras("muchísimo", cinco)),
    guia: tras("guía", tras("muchísimo", cinco)),
  };
  const H = version === "hook1" ? { amarillo: tras("pedir"), cinco: tras("5") } : { amarillo: tras("sin"), cinco: tras("5") };

  // Punch-ins: alternancia en cada frase y más cerrado en los golpes (4 cuadros).
  const inicios: number[] = [];
  palabras.forEach((w, i) => {
    if (i === 0 || /[.?!]$/.test(palabras[i - 1].p) || cortes.some((c) => Math.abs(c.out - w.ini) < 0.3)) inicios.push(w.ini);
  });
  const golpes: [number, number][] = [
    [H.cinco, 1.22],
    [M.hipotecas, 1.2],
    [M.ibi, 1.2],
    [M.energetico, 1.18],
    [M.derramas, 1.2],
    [M.resultado, 1.18],
    [M.basta, 1.24],
    [M.demanda, 1.2],
    [M.muchisimo, 1.24],
  ];
  const tramos: [number, number][] = inicios.map((t0, i) => [t0 - 0.02, i % 2 ? 1.1 : 1.0]);
  for (const [g, z] of golpes) tramos.push([g - 0.02, z]);
  tramos.sort((a, b) => a[0] - b[0]);
  const zoom = (tt: number) => {
    let z = 1;
    let previo = 1;
    let desde = 0;
    for (const [t0, v] of tramos)
      if (tt >= t0) {
        previo = z;
        z = v;
        desde = t0;
      }
    return lerp(previo, z, prog(tt, desde, desde + 0.13));
  };

  const subs = bloques(palabras);
  const grandes: [number, number][] = [
    [M.basta, M.hay],
    [M.muchisimo, M.dinero + 0.6],
  ];
  const ocultarSub = (tt: number) => grandes.some(([a, b]) => tt >= a && tt < b);
  const titulo = version === "hook1" ? { blanco: "¿Vas a comprar una casa?", amarillo: "PIDE ESTAS 5 COSAS" } : { blanco: "Nunca compres una casa", amarillo: "SIN PEDIR ESTAS 5 COSAS" };

  // Píldoras a la izquierda cuando hay un documento junto al hombro (no se pisan).
  const izquierda = { position: "absolute" as const, left: 30, right: 330, top: 1060, display: "flex", justifyContent: "center", gap: 10 };
  const centro = { position: "absolute" as const, left: 20, right: 20, top: 1060, display: "flex", justifyContent: "center", gap: 10 };
  const fila = (desde: number, hasta: number, estilo: React.CSSProperties, hijos: React.ReactNode) =>
    t >= desde && t < hasta + 0.2 ? <div style={{ ...estilo, opacity: 1 - prog(t, hasta, hasta + 0.2) }}>{hijos}</div> : null;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Persona t={t} video="inmobiliaria/g3/proxy.mp4" cortes={cortes} zoom={(tt) => zoom(tt)} cara={CARA} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)" }} />

      {/* Título fijo (el hook) y la lista 1-5; se van en el cierre. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - prog(t, M.cta - 0.2, M.cta + 0.1) }}>
        <Pop t={t} t0={0} desde={1.08}>
          <TextoSombra texto={titulo.blanco} tam={58} peso={700} />
        </Pop>
        <div style={{ height: 96 }}>
          <Pop t={t} t0={H.amarillo - 0.02}>
            <TextoSombra texto={titulo.amarillo} tam={titulo.amarillo.length > 20 ? 76 : 86} peso={900} color={AMARILLO} />
          </Pop>
        </div>
        {t >= uno - 0.2 ? (
          <div style={{ marginTop: 18, opacity: prog(t, uno - 0.2, uno + 0.1) }}>
            <Lista t={t} puntos={PUNTOS} tiempos={[uno, dos, tres, cuatro, cinco]} hechos={M.condiciones - 0.4} ancho={360} />
          </div>
        ) : null}
      </div>

      {/* Gancho: las 5 hojas en abanico junto al hombro. */}
      <Pegatina t={t} desde={H.cinco - 0.05} hasta={uno - 0.3} x={720} y={960} giro={0}>
        <Abanico t={t} t0={H.cinco - 0.05} />
      </Pegatina>

      {/* 1. Nota simple: el documento y luego cargas, embargos, hipotecas. */}
      <Pegatina t={t} desde={M.nota} hasta={M.cargas - 0.1}>
        <Documento tam={230} titulo="NOTA SIMPLE" />
      </Pegatina>
      {fila(M.cargas - 0.05, dos - 0.2, centro, (
        <>
          <Pildora t={t} t0={M.cargas - 0.05} icono={<Cadena tam={66} />} texto="Cargas" />
          <Pildora t={t} t0={M.embargos - 0.05} icono={<Mazo tam={66} />} texto="Embargos" />
          <Pildora t={t} t0={M.hipotecas - 0.05} icono={<Banco tam={66} />} texto="Hipotecas" />
        </>
      ))}

      {/* 2. Referencia catastral y recibo del IBI. */}
      <Pegatina t={t} desde={M.referencia} hasta={tres - 0.3}>
        <Documento tam={230} titulo="CATASTRO" color="#E3141F" />
      </Pegatina>
      {fila(M.recibo - 0.05, tres - 0.3, izquierda, <Pildora t={t} t0={M.recibo - 0.05} icono={<Recibo tam={66} />} texto="Último recibo IBI" />)}

      {/* 3. Cédula de habitabilidad / licencia de ocupación y certificado energético. */}
      <Pegatina t={t} desde={M.cedula} hasta={cuatro - 0.3}>
        <Documento tam={230} titulo="CÉDULA" color="#1C86E8" />
      </Pegatina>
      {fila(M.licencia - 0.05, M.certEnergia - 0.15, izquierda, <Pildora t={t} t0={M.licencia - 0.05} icono={<Documento tam={66} titulo="LIC." color="#1C86E8" />} texto="o licencia de ocupación" />)}
      {fila(M.certEnergia - 0.05, cuatro - 0.3, izquierda, <Pildora t={t} t0={M.certEnergia - 0.05} icono={<Energia tam={66} />} texto="Certificado energético" />)}

      {/* 4. Certificado de la comunidad: ¿deudas? ¿derramas? */}
      <Pegatina t={t} desde={M.certCom} hasta={M.y5 - 0.3}>
        <Documento tam={230} titulo="COMUNIDAD" color="#8A4FD0" sello={prog(t, M.deudas + 0.1, M.deudas + 0.28, (x) => x)} textoSello="¿DEUDAS?" colorSello="#E3141F" />
      </Pegatina>
      {fila(M.deudas - 0.05, M.y5 - 0.3, izquierda, (
        <>
          <Pildora t={t} t0={M.deudas - 0.05} icono={<Banco tam={66} />} texto="¿Deudas?" />
          <Pildora t={t} t0={M.derramas - 0.05} icono={<Recibo tam={66} />} texto="¿Derramas?" />
        </>
      ))}

      {/* 5. ITE (si el edificio está obligado) y su resultado. */}
      {fila(M.edificio - 0.05, M.inspeccion - 0.1, izquierda, <Pildora t={t} t0={M.edificio - 0.05} icono={<Edificio tam={66} />} texto="Si el edificio está obligado" />)}
      <Pegatina t={t} desde={M.inspeccion} hasta={M.porque - 0.1}>
        <Documento tam={230} titulo="ITE" color="#159B3C" sello={prog(t, M.resultado, M.resultado + 0.18, (x) => x)} textoSello="RESULTADO" />
      </Pegatina>

      {/* Conclusión: no basta con que te guste. */}
      <Grande t={t} desde={M.basta} hasta={M.hay} texto="no basta" color="rojo" tam={130} />
      {/* Si es para invertir: demanda de alquiler en esa zona. */}
      {fila(M.demanda - 0.05, M.siPiso - 0.2, izquierda, <Pildora t={t} t0={M.demanda - 0.05} icono={<Demanda tam={66} k={prog(t, M.demanda, M.demanda + 0.6, (x) => x)} />} texto="Demanda de alquiler" />)}
      <Pegatina t={t} desde={M.zona - 0.05} hasta={M.siPiso - 0.2}>
        <PinCandado tam={200} />
      </Pegatina>
      {/* Sin inquilinos → muchísimo dinero. */}
      {fila(M.inquilinos - 0.05, M.muchisimo - 0.05, centro, <Pildora t={t} t0={M.inquilinos - 0.05} icono={<CasaVacia tam={66} />} texto="Sin inquilinos" />)}
      <Grande t={t} desde={M.muchisimo} hasta={M.dinero + 0.6} texto="muchísimo dinero" color="rojo" tam={86} />

      {/* Cierre: comenta GUÍA. */}
      <Comentario t={t} desde={M.comenta - 0.1} escribe={M.guia} palabra="GUÍA" />

      <Subtitulo t={t} lista={subs} y={1250} ocultar={ocultarSub} amarillas={["nota", "simple", "cargas", "embargos", "hipotecas", "catastral", "ibi", "cédula", "habitabilidad", "energético", "deudas", "derramas", "inspección", "demanda", "alquiler", "dinero", "guía"]} />

      {/* Destellos de luz en los cortes entre partes y antes del CTA. */}
      <Destello t={t} t0={uno - 0.24} />
      <Destello t={t} t0={tres - 0.22} dur={0.36} />
      <Destello t={t} t0={M.y5 - 0.22} dur={0.36} />
      <Destello t={t} t0={M.siPiso - 0.22} dur={0.36} />
      <Destello t={t} t0={M.cta - 0.3} />

      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.05, duracion + 0.2) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
