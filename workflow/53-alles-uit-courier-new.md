# 53 — Alles uit Courier New

## Opdracht

Lars, op 8 september 2026, na het meetrapport van WP 52: *"Fix de docs en de
tekens. Doe dit in twee commits."* Dit pakket is de tweede helft: de tekens.
De docs zitten in WP 52.

Aanleiding: WP 52 mat dat de vastgelegde PDF's naast Courier New ook
DejaVu Sans Mono en Libertinus Serif inbedden. Afgesproken doel: elke letter
in de twee gidsen komt uit Courier New.

## Aanpak

Eerst uitzoeken wélke tekens terugvielen, want dat is met het blote oog niet
te zien. Een probe-PDF met één teken per pagina, gezet in Courier New, en dan
`pdffonts -f N -l N` per pagina: staat er iets anders dan CourierNewPS\*, dan
draagt de font dat teken niet. Drie decoratieve tekens uit `zine.typ` zakten:

| teken           | waar                    | viel terug op    |
| --------------- | ----------------------- | ---------------- |
| `∗` U+2217      | `horizontalrule`        | Libertinus Serif |
| `⇒` U+21D2      | prefix van elke H2      | Libertinus Serif |
| `▸` U+25B8      | opsommingsteken         | DejaVu Sans Mono |

Vervangen door `*` (U+002A), `»` (U+00BB) en `•` (U+2022), alle drie nagemeten
in romein, vet én cursief. De asterisk staat als `#"*"` in het sjabloon en
niet als `[*]`, want een kale asterisk in typst-markup opent nadruk.

Daarna bleef DejaVu Sans Mono tóch in beide PDF's zitten. Een tweede probe,
nu over álle honderd verschillende tekens uit de tekstlaag van de twee
gidsen, gaf nul terugvallen — het lag dus niet aan een teken. Wat wél bleek:
elke bladzijde mét een codeblok gebruikte DejaVu, de kaft en de zegelpagina
niet. De oorzaak zit in typst zelf: het `raw`-element draagt zijn eigen
standaardfont (DejaVu Sans Mono), en die wint van een `set text` erbuiten. De
blokregel in `zine.typ` vroeg al netjes `#set text(font: typemachine, ...)`,
maar dat had nooit effect. Eén regel `#show raw: set text(font: typemachine)`
verhelpt het voor blokken én inline code.

## Beslissingen

- **De `raw`-terugval is meegenomen, hoewel ze buiten "de drie tekens" viel.**
  Ze is dezelfde fout (een letter die niet uit Courier New komt) en veruit de
  grootste: het raakte élk Java-fragment en élk commando in beide gidsen, niet
  drie decoratieve tekens. Het is bovendien aantoonbaar een bug en geen keuze,
  want de blokregel vroeg de typemachine-font al. In het rapport aan Lars
  stond eerst dat de DejaVu-inbedding van het opsommingsteken kwam; dat was
  maar een deel van het antwoord.
- **`•` en niet `·` voor het eerste opsommingsniveau.** Het tweede niveau is
  al `sym.dot` (U+00B7); dezelfde punt op beide niveaus zou de nesting
  onleesbaar maken. `•` houdt het contrast van het oorspronkelijke `▸`: een
  gevulde markering die zwaarder weegt dan de punt eronder.
- **De fallback-ketting blijft staan.** Courier New vooraan, Liberation Mono
  erachter: dat is er voor machines die de eerste niet hebben, en daar
  verandert dit pakket niets aan. Wat nu wél klopt, is dat een build óp een
  machine met Courier New ook echt alles uit Courier New haalt.
- **Deel 2 verliest een bladzijde, en dat is aanvaard.** 13 → 12. De
  terugvalfonts hadden andere letterbreedtes dan Courier New, dus de tekst
  herverdeelt zich. De tekstinhoud is woord voor woord dezelfde (nagelezen met
  `pdftotext` na normalisatie van witruimte: het enige verschil zijn de drie
  vervangen tekens). Deel 1 blijft op 8 bladzijden, met dezelfde herverdeling
  binnenin.

## QC-resultaat

- `bash walkthrough/tools/bouw-walkthrough.sh` exit 0. De 46 waarschuwingen
  over Liberation Mono en Nimbus Mono PS blijven komen en horen erbij: dat
  zijn de ongebruikte schakels van de ketting (zie WP 52).
- `pdffonts` op beide PDF's: **alleen** CourierNewPSMT, CourierNewPS-BoldMT en
  CourierNewPS-ItalicMT. Geen DejaVu, geen Libertinus meer.
- Paginatal: deel 1 8 (ongewijzigd), deel 2 12 (was 13, zie de beslissing).
  Bestandsgrootte 170 KB en 205 KB.
- Tekstlaag tegen `HEAD` gelegd na normalisatie van witruimte: alleen de drie
  vervangen tekens verschillen.
- Bladspiegel visueel nagekeken op drie gerenderde bladzijden (kaft,
  zegelpagina, en een bladzijde met codeblok en beide opsommingsniveaus): kader
  sluit, geen overlopende coderegel, één typeface over de hele bladzijde.
- `node tools/check-walkthrough.mjs`: 277 citaten en koppen, 0 afwijkingen.
- `node tools/check-docpaden.mjs`: 0 dode paden in een contractdocument.
- `node --test test/test-*.mjs`: 454/454, ongewijzigd (dit pakket raakt geen
  `js/` en geen `test/`).
