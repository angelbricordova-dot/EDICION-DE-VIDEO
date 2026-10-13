#!/usr/bin/env bash
# Copia el material del comercial "Tu Día en Tucacas" desde el repo
# angelbricordova-dot/AUTORIZADORA-DE-INGRESO- (rama claude/sweet-darwin-vs9ng7)
# a public/tucacas/, que git ignora: el material es del cliente y pesa mucho.
#
# Uso: scripts/traer_tucacas.sh [ruta-del-repo-del-cliente]
set -euo pipefail

ORIGEN="${1:-/home/user/angelbricordova-dot/autorizadora-de-ingreso-}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DESTINO="$RAIZ/public/tucacas"

if [ ! -d "$ORIGEN/marketing/video" ]; then
  echo "No encuentro $ORIGEN/marketing/video. Clona primero el repo del cliente:" >&2
  echo "  git clone --depth 1 --branch claude/sweet-darwin-vs9ng7 https://github.com/angelbricordova-dot/AUTORIZADORA-DE-INGRESO- $ORIGEN" >&2
  exit 1
fi

mkdir -p "$DESTINO"/{fotos,marca,grabaciones,fuentes}
cp "$ORIGEN"/public/fotos/*.jpg "$DESTINO/fotos/"
cp "$ORIGEN"/marketing/video/marca/*.svg "$DESTINO/marca/"
cp "$ORIGEN"/marketing/video/grabaciones/*.mp4 "$DESTINO/grabaciones/"

# Cuadro fijo del calendario (02-apartamento-n30.mp4 a los 7,5 s), recortado a
# 1080x1920 desde arriba: así quedan fuera la barra con "$90 / noche" y el total
# "$180", que no se muestran hasta que el cliente confirme el precio.
ffmpeg -v error -y -ss 7.5 -i "$DESTINO/grabaciones/02-apartamento-n30.mp4" -frames:v 1 \
  -vf "crop=1080:1920:0:0" "$DESTINO/grabaciones/calendario.png"

# Fuentes de la marca (Google Fonts, OFL), desde los paquetes de fontsource.
FS="$RAIZ/node_modules/@fontsource-variable"
if [ ! -d "$FS/onest" ]; then
  (cd "$RAIZ" && npm install --no-save @fontsource-variable/bricolage-grotesque @fontsource-variable/onest >/dev/null)
fi
cp "$FS/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2" "$DESTINO/fuentes/bricolage.woff2"
cp "$FS/onest/files/onest-latin-wght-normal.woff2" "$DESTINO/fuentes/onest.woff2"

echo "Material listo en $DESTINO"
