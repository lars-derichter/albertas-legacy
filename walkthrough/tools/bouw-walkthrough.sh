#!/usr/bin/env bash
# bouw-walkthrough.sh — bouwt de twee walkthrough-PDF's van The Legacy of
# Alberta in de gefotokopieerde jaren-'90-zine-stijl (walkthrough/stijl/zine.typ).
#
# Aanpak en waarom: we laten pandoc rechtstreeks naar PDF renderen met de
# Typst-engine (--pdf-engine=typst) en ons eigen, VOLLEDIGE Typst-sjabloon
# (--template). Dat sjabloon vervangt de standaard, definieert de pandoc-Typst-
# hulpstukken die de gegenereerde body nodig heeft (horizontalrule, terms.item,
# tabel-/figuurregels) en zet daarbovenop de zine-opmaak. Geen tussenstap met
# een los .typ-bestand nodig: één pandoc-aanroep per document. De kop rechts en
# de zegelpagina worden gestuurd door metadata (deel / zegel) in de YAML-kop van
# elke Markdown. Syntax highlighting staat uit (--syntax-highlighting=none) voor
# de monochrome fotokopie-look en om de highlight-definities uit het sjabloon te
# kunnen weglaten.
#
# Idempotent: elke run overschrijft de PDF's; geen tussenbestanden blijven staan.
# Vereist pandoc (getest met 3.10 en 3.1.3) en typst (0.15.0) op PATH.
#
# Twee compatibiliteitsnoten, allebei gemeten in WP 39:
#
#   - `--syntax-highlighting=none` bestaat pas vanaf pandoc 3.2. Oudere pandoc
#     kent dezelfde schakelaar als `--no-highlight`; het script kiest zelf. De
#     bedoeling blijft dezelfde: geen highlight-definities, want het sjabloon
#     draagt ze niet en de gids is monochroom.
#   - De typemachine-font is Courier New, en die staat niet op elke machine.
#     `stijl/zine.typ` draagt daarom een fallback-ketting (Liberation Mono
#     heeft dezelfde metrieken). LET OP bij het lezen van de uitvoer: typst
#     waarschuwt over elke schakel van die ketting die hij niet vindt, ook als
#     hij de eerste schakel wél gevonden heeft. Op een machine mét Courier New
#     geeft een geslaagde build dus tientallen regels "unknown font family:
#     liberation mono / nimbus mono ps". Die waarschuwingen zeggen niets over
#     de bladspiegel; ze zijn geen reden om iets te installeren.
#   - Wil je vóór het vastleggen weten welke font er echt in de PDF zit, kijk
#     dan naar het ingebedde font, niet naar de waarschuwingen:
#     `pdffonts deel1-hints.pdf` hoort alleen CourierNewPS* te tonen (poppler,
#     `brew install poppler`). Staat er LiberationMono, dan is de PDF op een
#     machine zonder Courier New gebouwd: metrisch gelijk, maar niet de font
#     van het ontwerp.

set -euo pipefail

# Altijd vanuit de walkthrough-map werken, ongeacht van waar het script start.
HIER="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HIER"

SJABLOON="stijl/zine.typ"

# Controleer het gereedschap.
for tool in pandoc typst; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "FOUT: '$tool' staat niet op PATH." >&2
    exit 1
  fi
done

echo "pandoc: $(pandoc --version | head -1)"
echo "typst:  $(typst --version)"
echo

# Welke schakelaar kent deze pandoc om highlighting uit te zetten?
if pandoc --help 2>&1 | grep -q -- "--syntax-highlighting"; then
  GEEN_KLEUR="--syntax-highlighting=none"
else
  GEEN_KLEUR="--no-highlight"
fi

bouw() {
  local bron="$1" doel="$2"
  echo "  $bron  ->  $doel"
  pandoc "$bron" \
    --pdf-engine=typst \
    --template="$SJABLOON" \
    "$GEEN_KLEUR" \
    -o "$doel"
}

echo "Bouw de walkthrough-PDF's:"
bouw "deel1-hints.md"        "deel1-hints.pdf"
bouw "deel2-oplossingen.md"  "deel2-oplossingen.pdf"

echo
echo "Klaar. Twee PDF's staan in $(pwd):"
ls -la deel1-hints.pdf deel2-oplossingen.pdf
