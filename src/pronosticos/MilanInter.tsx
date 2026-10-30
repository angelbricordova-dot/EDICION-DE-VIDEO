import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp01, easeOut, FPS, prog } from "../comun/animacion";
import { Aparece, cargarFuentes, Clave, Escudo, EscudoMisterio, Etiqueta, Jugador, Marcador, Palabra, Punto, ROJO, Texto } from "./piezas";
import datos from "./milan-inter.json";

// Pronóstico Milan – Inter (primer video del cliente). Misma edición que sus referencias: la
// persona a cámara de principio a fin (una sola toma) y, arriba, una escena gráfica por frase:
// escudo misterioso → Milan vs Inter → último derbi → derrota con el Bologna → bajas del Milan →
// el Inter → Lautaro y la remontada → "MI LECTURA: INTER NO PIERDE" → CTA. Solo los datos que
// dice el cliente; las bajas del Milan van sin nombres porque no los dice.

export const MILAN_INTER = datos as { duracion: number; palabras: Palabra[] };
export type PropsPronostico = { audio: string | null };

const limpio = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;…]/g, "");

/** Bloque centrado en la zona de arriba (sobre la cabeza). */
const Arriba: React.FC<{ y: number; children: React.ReactNode; gap?: number }> = ({ y, children, gap = 18 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y + 40, display: "flex", flexDirection: "column", alignItems: "center", gap, scale: "1.3", transformOrigin: "50% 0" }}>{children}</div>
);

export const MilanInter: React.FC<PropsPronostico> = ({ audio }) => {
  cargarFuentes();
  const t = useCurrentFrame() / FPS;
  const { palabras, duracion } = MILAN_INTER;
  const tras = (p: string, desde = 0) => {
    for (const w of palabras) if (w.ini >= desde - 0.01 && limpio(w.p) === limpio(p)) return w.ini;
    throw new Error(`No encontré "${p}" después de ${desde}`);
  };

  // Escenas (cada una empieza en la primera palabra de su frase).
  const eEs = tras("Es");
  const eUltimo = tras("El", eEs + 1);
  const ePerdio = tras("Milan", eUltimo + 2);
  const eAparte = tras("Aparte");
  const eCambio = tras("En", eAparte);
  const eLautaro = tras("No", eCambio);
  const eParaMi = tras("Para", eLautaro);
  const eTu = tras("¿Tú");
  const eSi = tras("Si", eTu);
  const fin = duracion;
  const en = (a: number, b: number) => t >= a - 0.05 && t < b + 0.2;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile("pronosticos/bruto.mp4")} muted style={{ width: 1080, height: 1920 }} />
      {/* Oscurece la parte de arriba (pared y cuadro) para que se lean los gráficos. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.12) 36%, rgba(0,0,0,0) 44%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3) 100%)" }} />

      {/* 1. Gancho: "Este equipo…" con escudo misterioso que se revela en "Es el Milan". */}
      {en(0, eUltimo) ? (
        <Arriba y={190}>
          <div style={{ display: "flex", alignItems: "center", gap: 44, opacity: 1 - prog(t, eUltimo - 0.15, eUltimo + 0.05) }}>
            <Aparece t={t} t0={0.05}>
              <EscudoMisterio t={t} revela={tras("Milan,")} club="milan" tam={190} />
            </Aparece>
            {t >= tras("Inter.") - 0.05 ? (
              <>
                <Aparece t={t} t0={tras("Inter.") - 0.05}>
                  <Texto tam={70}>VS</Texto>
                </Aparece>
                <Aparece t={t} t0={tras("Inter.") - 0.05} desde={0.6}>
                  <Escudo club="inter" tam={170} />
                </Aparece>
              </>
            ) : null}
          </div>
          <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 1 - prog(t, eUltimo - 0.15, eUltimo + 0.05) }}>
            {t < tras("ganó") - 0.05 ? (
              <Aparece t={t} t0={tras("7") - 0.05}>
                <Texto tam={58}>
                  <span style={{ color: "#FFD60A" }}>7</span> DERBIS SIN PERDER
                </Texto>
              </Aparece>
            ) : t < tras("5") - 0.05 ? (
              <Aparece t={t} t0={tras("ganó") - 0.05}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Texto tam={52}>ÚLTIMOS 3</Texto>
                  {[0, 1, 2].map((i) => (
                    <Aparece key={i} t={t} t0={tras("ganó") + 0.1 + i * 0.12} desde={0.4}>
                      <Punto r="G" tam={46} />
                    </Aparece>
                  ))}
                </div>
              </Aparece>
            ) : t < eEs - 0.05 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <Aparece t={t} t0={tras("5") - 0.05}>
                  <Etiqueta tam={46}>LLEGA CON 5 BAJAS</Etiqueta>
                </Aparece>
                {t >= tras("4") - 0.05 ? (
                  <Aparece t={t} t0={tras("4") - 0.05}>
                    <Texto tam={50}>LE METIERON 4 EN CASA</Texto>
                  </Aparece>
                ) : null}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Aparece t={t} t0={tras("Milan,")}>
                  <Texto tam={58}>{t >= tras("Inter.") - 0.05 ? "MILAN VS INTER" : "MILAN"}</Texto>
                </Aparece>
                {t >= tras("mañana", eEs) - 0.05 ? (
                  <Aparece t={t} t0={tras("mañana", eEs) - 0.05}>
                    <Etiqueta tam={38}>MAÑANA · DERBI DE MILÁN</Etiqueta>
                  </Aparece>
                ) : null}
              </div>
            )}
          </div>
        </Arriba>
      ) : null}

      {/* 2. Último derbi: 1-0, remates 7 vs 20 y el penalti fallado de Çalhanoğlu. */}
      {en(eUltimo, ePerdio) ? (
        <Arriba y={200} gap={22}>
          <Aparece t={t} t0={eUltimo} t1={ePerdio - 0.15}>
            <Etiqueta tam={38}>ÚLTIMO DERBI</Etiqueta>
          </Aparece>
          <Aparece t={t} t0={tras("1-0,") - 0.1} t1={ePerdio - 0.15}>
            <Marcador local="milan" visita="inter" gl={1} gv={0} tam={130} />
          </Aparece>
          <div style={{ height: 210 }}>
            {t < tras("Çalhanoğlu") - 0.05 ? (
              <Aparece t={t} t0={tras("remató") - 0.05} t1={tras("Çalhanoğlu") - 0.1}>
                {(() => {
                  const k = easeOut(prog(t, tras("20") - 0.1, tras("7", tras("20")) + 0.4));
                  return (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 680 }}>
                      <Texto tam={44}>REMATES</Texto>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
                        <Texto tam={60} style={{ width: 70, textAlign: "right" }}>
                          {Math.round(7 * k)}
                        </Texto>
                        <div style={{ flex: 1, height: 26, display: "flex", borderRadius: 13, overflow: "hidden", background: "rgba(255,255,255,0.18)" }}>
                          <div style={{ width: `${(7 / 27) * 100 * k}%`, background: "#E0262C" }} />
                          <div style={{ flex: 1 }} />
                          <div style={{ width: `${(20 / 27) * 100 * k}%`, background: "#1E5BD8" }} />
                        </div>
                        <Texto tam={60} style={{ width: 70 }}>
                          {Math.round(20 * k)}
                        </Texto>
                      </div>
                    </div>
                  );
                })()}
              </Aparece>
            ) : (
              <Aparece t={t} t0={tras("Çalhanoğlu") - 0.05} t1={ePerdio - 0.15}>
                <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                  <Jugador foto="calhanoglu.png" tam={140} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                    <Texto tam={54}>ÇALHANOĞLU</Texto>
                    {t >= tras("falló") - 0.05 ? (
                      <Aparece t={t} t0={tras("falló") - 0.05}>
                        <Etiqueta tam={40}>FALLÓ UN PENALTI</Etiqueta>
                      </Aparece>
                    ) : null}
                  </div>
                </div>
              </Aparece>
            )}
          </div>
        </Arriba>
      ) : null}

      {/* 3. El miércoles: Milan 2-4 Bologna, primera derrota en liga. */}
      {en(ePerdio, eAparte) ? (
        <Arriba y={210} gap={22}>
          <Aparece t={t} t0={tras("miércoles") - 0.05} t1={eAparte - 0.15}>
            <Texto tam={42}>MIÉRCOLES · SERIE A</Texto>
          </Aparece>
          <Aparece t={t} t0={tras("2-4") - 0.1} t1={eAparte - 0.15}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <Marcador local="milan" visita="bologna" gl={2} gv={4} tam={130} />
              <Punto r="P" tam={50} />
            </div>
          </Aparece>
          {t >= tras("primera") - 0.05 ? (
            <Aparece t={t} t0={tras("primera") - 0.05} t1={eAparte - 0.15}>
              <Etiqueta tam={44}>1.ª DERROTA EN LIGA</Etiqueta>
            </Aparece>
          ) : null}
        </Arriba>
      ) : null}

      {/* 4. Bajas del Milan: 5 fuera y 3 en duda (sin nombres: no los dice). */}
      {en(eAparte, eCambio) ? (
        <Arriba y={190} gap={16}>
          <Aparece t={t} t0={eAparte} t1={eCambio - 0.15}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Escudo club="milan" tam={100} />
              <Texto tam={70} color={ROJO}>
                BAJAS
              </Texto>
            </div>
          </Aparece>
          <div style={{ display: "flex", gap: 14 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Aparece key={i} t={t} t0={tras("5", eAparte) - 0.05 + i * 0.1} t1={eCambio - 0.15} desde={0.4}>
                <Jugador tam={112} />
              </Aparece>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <Aparece key={i} t={t} t0={tras("3", eAparte) - 0.05 + i * 0.1} t1={eCambio - 0.15} desde={0.4}>
                <Jugador tam={92} duda />
              </Aparece>
            ))}
            {t >= tras("duda.") - 0.05 ? (
              <Aparece t={t} t0={tras("duda.") - 0.05} t1={eCambio - 0.15}>
                <Etiqueta tam={36} color="#E08A00">
                  EN DUDA
                </Etiqueta>
              </Aparece>
            ) : null}
          </div>
        </Arriba>
      ) : null}

      {/* 5. El Inter: invicto, 4 remontadas y titulares descansados. */}
      {en(eCambio, eLautaro) ? (
        <Arriba y={190} gap={16}>
          <Aparece t={t} t0={tras("Inter", eCambio) - 0.05} t1={eLautaro - 0.15}>
            <Escudo club="inter" tam={150} />
          </Aparece>
          {[
            ["invicto", "INVICTO EN LIGA", true],
            ["ganó", "4 VICTORIAS REMONTANDO", false],
            ["titulares", "TITULARES DESCANSADOS", false],
          ].map(([p, texto, rojo]) =>
            t >= tras(p as string, eCambio) - 0.05 ? (
              <Aparece key={p as string} t={t} t0={tras(p as string, eCambio) - 0.05} t1={eLautaro - 0.15}>
                {rojo ? <Etiqueta tam={46}>{texto}</Etiqueta> : <Texto tam={52}>{texto}</Texto>}
              </Aparece>
            ) : null,
          )}
        </Arriba>
      ) : null}

      {/* 6. Sin Lautaro remontaron en Bolonia 1-3. */}
      {en(eLautaro, eParaMi) ? (
        <Arriba y={200} gap={20}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Aparece t={t} t0={tras("Lautaro,") - 0.05} t1={eParaMi - 0.15}>
              <Jugador foto="lautaro.png" baja etiqueta="BAJA" nombre="LAUTARO" tam={180} />
            </Aparece>
            {t >= tras("remontaron") - 0.05 ? (
              <Aparece t={t} t0={tras("remontaron") - 0.05} t1={eParaMi - 0.15}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <Texto tam={40}>SIN ÉL, EN BOLONIA</Texto>
                  <Marcador local="bologna" visita="inter" gl={1} gv={3} tam={92} />
                  <Etiqueta tam={34}>REMONTADA</Etiqueta>
                </div>
              </Aparece>
            ) : null}
          </div>
        </Arriba>
      ) : null}

      {/* 7. Mi lectura: el Inter no pierde (aparece palabra por palabra, como "MI OPCIÓN"). */}
      {en(eParaMi, eTu) ? (
        <Arriba y={250} gap={10}>
          {t >= tras("lectura") - 0.1 ? (
            <Aparece t={t} t0={tras("lectura") - 0.1} t1={eTu - 0.15}>
              <Texto tam={50} color={ROJO}>
                MI LECTURA
              </Texto>
            </Aparece>
          ) : (
            <Aparece t={t} t0={tras("roto") - 0.1} t1={tras("lectura") - 0.15}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Escudo club="milan" tam={110} style={{ filter: "grayscale(0.7) drop-shadow(0 6px 12px rgba(0,0,0,0.45))" }} />
                <Texto tam={64}>NUNCA TAN ROTO</Texto>
              </div>
            </Aparece>
          )}
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            {[
              ["Inter", "INTER"],
              ["no", "NO"],
              ["pierde.", "PIERDE"],
            ].map(([p, texto]) =>
              t >= tras(p, eParaMi + 2) - 0.05 ? (
                <Aparece key={p} t={t} t0={tras(p, eParaMi + 2) - 0.05} t1={eTu - 0.15} desde={1.3}>
                  <Texto tam={104}>{texto}</Texto>
                </Aparece>
              ) : null,
            )}
          </div>
        </Arriba>
      ) : null}

      {/* 8. CTA: "¿Tú qué ves?" → comentarios → "te espero en mi perfil" con flecha. */}
      {en(eTu, fin) ? (
        <>
          <Arriba y={260} gap={12}>
            {t < eSi - 0.05 ? (
              <>
                <Aparece t={t} t0={eTu - 0.05} t1={eSi - 0.15}>
                  <Texto tam={96}>¿TÚ QUÉ VES?</Texto>
                </Aparece>
                {t >= tras("leo") - 0.05 ? (
                  <Aparece t={t} t0={tras("leo") - 0.05} t1={eSi - 0.15}>
                    <Etiqueta tam={44}>TE LEO EN LOS COMENTARIOS</Etiqueta>
                  </Aparece>
                ) : null}
              </>
            ) : (
              <Aparece t={t} t0={eSi - 0.05} desde={1.25}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.92 }}>
                  <Texto tam={110}>JUGADAS A FONDO</Texto>
                  <Texto tam={110} color={ROJO}>
                    EN MI PERFIL
                  </Texto>
                </div>
              </Aparece>
            )}
          </Arriba>
          {t >= tras("espero") - 0.05 ? (
            <div style={{ position: "absolute", left: 70, top: 1520, rotate: "40deg", opacity: clamp01((t - tras("espero")) / 0.1), translate: `${Math.sin((t - tras("espero")) * 9) * 8}px ${Math.sin((t - tras("espero")) * 9) * 8}px` }}>
              <svg width={150} height={70} viewBox="0 0 150 70">
                <path d="M0 35 H110" stroke={ROJO} strokeWidth={16} strokeLinecap="round" />
                <path d="M100 8 L142 35 L100 62 Z" fill={ROJO} />
              </svg>
            </div>
          ) : null}
        </>
      ) : null}

      {/* Palabras clave sueltas sobre el pecho (como "PENDERS ENTRA" o "NO TIENE"). */}
      <Clave t={t} t0={tras("sin")} t1={tras("y")} texto="SIN PERDER" />
      <Clave t={t} t0={tras("Es")} t1={tras("mañana", eEs)} texto="ES EL MILAN" />
      <Clave t={t} t0={tras("falló")} t1={tras("penalti.") + 0.5} texto="FALLÓ" />
      <Clave t={t} t0={tras("primera")} t1={tras("liga.") + 0.3} texto="PRIMERA DERROTA" />
      <Clave t={t} t0={tras("invicto")} t1={tras("Liga,") + 0.35} texto="INVICTO" />
      <Clave t={t} t0={tras("tan")} t1={tras("derbi,", eParaMi) + 0.2} texto="TAN ROTO" />

      <AbsoluteFill style={{ background: "#000", opacity: prog(t, duracion - 0.2, duracion) }} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
