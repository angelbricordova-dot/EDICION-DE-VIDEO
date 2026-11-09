#!/bin/bash
# Descarga los efectos y la música de Mixkit que usan los proyectos (licencia Mixkit: uso comercial
# gratis, sin atribución) en public/comun/. Ejecutar tras clonar o si el entorno se reinicia:
#   bash scripts/comun/mixkit.sh
set -e
cd "$(dirname "$0")/../.."
D=public/comun/sfx/mixkit
mkdir -p "$D" public/comun/musica/mixkit
get() { curl -sSL -f -o "$2" "https://assets.mixkit.co/active_storage/sfx/$1/$1-preview.mp3"; }
while read -r id nombre; do get "$id" "$D/$nombre.mp3"; done <<'LISTA'
1489 barrido-1
1490 barrido-2
1491 barrido-3
1492 barrido-4
3005 barrido-5
1493 aire-1
2350 aire-2
2358 pop-1
2354 pop-2
2357 pop-3
2356 pop-4
2364 pop-duro
1117 clic-1
1124 clic-2
1133 clic-3
1109 clic-4
2568 clic-5
2894 boing
744 trombon-triste
2876 fracaso-grave
2151 golpe-1
2903 golpe-2
2918 golpe-3
2870 acierto
951 notificacion
2651 mosca
2531 teclado
LISTA
get 1999 public/comun/sfx/chaching.mp3
get 1993 public/comun/sfx/monedas.mp3
for m in "9 kidding-around" "6 fun-and-games" "2 comical" "10 playful" "15 keep-smiling" "5 feeling-happy"; do
  set -- $m; curl -sSL -f -o "public/comun/musica/mixkit/$2.mp3" "https://assets.mixkit.co/music/$1/$1.mp3"
done
echo "Mixkit listo: $(ls $D | wc -l) efectos"
