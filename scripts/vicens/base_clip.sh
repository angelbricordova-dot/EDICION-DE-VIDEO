#!/bin/bash
# Vicens (docs/vicens.md): arma la base vertical 1080×1920 del clip — formato "gameplay vertical con
# cámara pequeña": su cámara recortada a todo el ancho arriba (1080×740) y el gameplay debajo (1080×1180).
# Cada tramo se procesa aparte (poca memoria) y luego se unen; audio normalizado a −14 LUFS.
# Uso: bash scripts/vicens/base_clip.sh <fuente.mp4> <salida.mp4> "a1-b1 a2-b2 ..."
set -e
SRC=$1; OUT=$2; SEGS=$3
TMP=$(dirname "$OUT")/tramos; mkdir -p "$TMP"; : > "$TMP/lista.txt"
CAM="crop=296:203:26:446,scale=1080:740:flags=lanczos,unsharp=5:5:0.8:3:3:0.3"
GAME="crop=988:1080:466:0,scale=1080:1180:flags=lanczos"
i=0
for s in $SEGS; do
  a=${s%-*}; b=${s#*-}; d=$(python3 -c "print(round($b-$a,3))")
  ffmpeg -v error -y -ss $a -i "$SRC" -t $d -filter_complex "[0:v]split[v][w];[v]$CAM[c];[w]$GAME[g];[c][g]vstack,fps=60[o];[0:a]afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print($d-0.04)"):d=0.04[ao]" -map "[o]" -map "[ao]" -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p -c:a pcm_s16le -ar 48000 "$TMP/t$i.mov"
  echo "file 't$i.mov'" >> "$TMP/lista.txt"; i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/lista.txt" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 "$OUT"
