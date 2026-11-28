# Jordan (Jeremiah) / Jay, canal IamKingJay: edición de vídeos de YouTube

El cliente se llama **Jay** y su canal **IamKingJay** (@iamkingjayy); en el chat de The Fezz aparece como Jordan.

Cliente de vídeos largos de YouTube (deporte/vlog; referencias: youtu.be/930sDFlynwU, 5885Xu1GSOk,
AVbd76zq9og, U1JG_rR9NsY). Estilo: cortes, zooms, subtítulos y sfx buscando retención.

## Condiciones (chat del 19-nov-2026)
- Mínimo 4 vídeos largos al mes (1 por semana); a veces uno será un directo de Twitch con edición rápida.
- 100 USD/mes para empezar; él se compromete a subir el pago según crezca el canal.
- Canal: IamKingJay (@iamkingjayy), 27,6 K suscriptores y 420 vídeos (19-nov). Pago 100 % por adelantado; precio revisado cada mes con hitos (35K/50K/75K/100K subs, +25 % visualizaciones, vídeo > 100K, patrocinio).
- Pagos por Wise, PayPal o Binance. Alejandro pidió acuerdo por escrito; Jordan lo revisa con su manager.
- Acuerdo: `scripts/jordan/acuerdo.html` → `node scripts/jordan/pdf.mjs` → `out/jordan/enviar/Acuerdo-edicion-video.pdf`.
  Propuestas mías a confirmar: 50 % al inicio / 50 % tras el 2.º vídeo, revisión de precio periódica,
  rondas de correcciones, plazos y preaviso (quedan en blanco para rellenar).

## Vídeo 1 (nov-2026): vlog con Landis + 1v1 con Ongu (primer mes pagado: 100 USD)

Entrega: **1080p 60 fps** (horizontal), **12–15 min**, en **español** (Jay habla español). Del 1v1 (`IMG_0103`, 27 min) solo los mejores momentos. Título: lo decide Jay. Material: SwissTransfer `01a21f38-a2ab-7ff7-a727-35123f95307c` (caduca
~5-dic): `vlog landis.zip` de 22,4 GB = 60 clips de iPhone 4K (HEVC, 60 fps casi todos) de la carpeta
"vlog with landis + 1v1 with ongu", 3 efectos (`SFX_ding/boom/whoosh.wav`) y un `IMG_0103.MOV` suelto de 10,9 GB.

## Cómo se trabaja sin bajar los 22 GB
- `scripts/jordan/proxies.py`: lee cada clip directamente del zip por HTTP (protocolo `subfile` de ffmpeg, el zip
  no está comprimido) y hace copias ligeras 960×540 60 fps en `public/jordan/proxies/`. Guarda en
  `public/jordan/indice.json` dónde empieza cada clip dentro del zip.
- `scripts/jordan/url_transfer.mjs`: saca el enlace firmado de descarga (dura 1 h); el script lo renueva solo.
- Para el render final se sacan en 1080p solo los trozos usados (mismo `subfile` + `-ss`).
- Los iPhone traen 2 pistas de audio (AAC estéreo + otra de 4 canales que ffmpeg no lee): usar `-map 0:a:0`.

## Referencia (Drive `1hOrHWtiXj6IIeJ2UWPJ6nIgRtC52Tc5z`, 25 min, 854×480)
- Vlog diario estilo "day in my life": selfie hablando a cámara + planos de lo que ve (B-roll), ~280 cortes
  (un plano cada ~5 s), ritmo suelto y natural.
- **Subtítulos pequeños en minúsculas**, blancos, centrados abajo (~92 % de alto), sin cajas ni animaciones.
- Hora en texto fino blanco a media pantalla ("11:02am") al cambiar de lugar; a veces fecha estilo cámara
  (amarilla, "Saturday, July 25, 2026") abajo a la derecha.
- Sin grafismos pesados; cierre con texto pequeño de agradecimiento.

### Historia del día (transcripción de los 61 clips, `public/jordan/transcripcion/`)
1. Entreno a las 5:30 de la mañana, pabellón vacío ("no tenemos competencia"): IMG_0938–0939, IMG_1070–1076
   (sparring con Ongu, "este domingo en Barcelona").
2. **1v1 con Ongu**: IMG_0103 (27 min, plano fijo lateral y lejano, 4K → se puede ampliar ×2 en 1080p sin perder calidad).
3. Trabajo de repartidor ("para ser viernes tenemos poco trabajo… estoy cansado del entreno"; "mucha gente me llama
   loco por mi rutina… hago este trabajo por el baloncesto"): IMG_1078–1079, fin de turno IMG_1086.
4. Con Landis en bus a La Roca Village: IMG_1088–1092.
5. Compras: Dr. Martens (90 €), Adidas "mi tienda favorita", Superstar, prueba tallas, paga 79 €, piedra-papel-tijera
   con Landis ("Dios está conmigo, yo gané"): IMG_1093–1125.
6. Vuelta a casa en bus: IMG_1126–1129. 7. Cena dominicana (salami, queso frito, huevo, plátano; "soy de Villa Mella"):
   IMG_1130–1136.
