# 52 — De fontterugval is weg, de docs wisten het niet

## Opdracht

Lars, op 8 september 2026: *"Regenereer de twee walkthrough pdf's in
@walkthrough/ . De laatste keer werden ze gegenereerd in een omgeving die
niet alle lettertypes had."*

Na het meetrapport, dezelfde dag: *"Fix de docs en de tekens. Doe dit in twee
commits."* Dit pakket is de eerste helft (de docs); de tekens zitten in
WP 53.

## Aanpak

Eerst nameten, dan pas iets veranderen. `bouw-walkthrough.sh` draaide op
deze machine (pandoc 3.11, typst 0.15.1, Courier New geïnstalleerd) met de
uitvoer naar een scratchpad, zodat de vastgelegde PDF's ongemoeid bleven en
oud en nieuw naast elkaar te leggen waren.

De verse build blijkt niet te verschillen van wat er in de repo staat:
dezelfde paginatelling (8 en 13), dezelfde ingebedde fonts, zelfs dezelfde
subset-tags (`TKVWVY+CourierNewPS-BoldMT` in allebei), en een tekstlaag die
`diff` na `pdftotext -layout` niet uit elkaar houdt. Het enige verschil in
de bytes is de `CreationDate`. Een herbouw zou dus twee gewijzigde binaries
opleveren met alleen een nieuwe datum erin.

Daarna de vraag waar Lars' aanname vandaan kwam. Die staat in dit logboek:
`voortgang.md` noemde de PDF-fontterugval op drie plaatsen nog als
openstaand punt. Om te weten sinds wanneer dat niet meer klopt, is de hele
PDF-geschiedenis uitgelezen met `git show <commit>:walkthrough/*.pdf` naar
een tijdelijk bestand en daarna `pdffonts`:

| commit    | pakket  | ingebed                      |
| --------- | ------- | ---------------------------- |
| `710061a` | WP 39   | LiberationMono               |
| `27bdd21` | WP 48b  | LiberationMono               |
| `c114725` | WP 48c  | LiberationMono               |
| `4c9a5fe` | WP 51   | CourierNewPS\*               |

WP 51 is dus het moment waarop de terugval verdween, en dat is een maand na
de laatste regel die hem als open beschreef.

## Beslissingen

- **De PDF's zijn niet overschreven.** De opdracht was ze te herbouwen, maar
  de herbouw levert bewijsbaar dezelfde PDF op. Twee binaries vastleggen
  waarvan alleen de datumstempel verschilt, maakt de geschiedenis moeilijker
  te lezen zonder er iets aan toe te voegen. Gemeld aan Lars in plaats van
  stilzwijgend gedaan.
- **Alleen de lévende uitspraken zijn rechtgezet.** `voortgang.md` beschrijft
  zichzelf als het bestand dat meebeweegt met het werk, tegenover de
  genummerde entries die blijven staan zoals ze geschreven zijn. Drie
  passages doen een uitspraak over de huidige stand (het slot van programma
  3, het slot van programma 4, en de bullet in "Nog open na programma 2") en
  die zijn bijgewerkt. De `- [x]`-regels ín de pakketten van WP 39 en WP 48b
  zeggen wat er tóén gemeten is en kloppen nog steeds; die blijven ongemoeid.
- **De waarschuwing van typst is geen signaal.** De kop van
  `bouw-walkthrough.sh` stond fout: hij las een font-waarschuwing als bewijs
  dat de bladspiegel niet die van het ontwerp is. In werkelijkheid waarschuwt
  typst voor elke schakel van de ketting die hij niet vindt, ook wanneer hij
  de eerste schakel wél gebruikt. Deze geslaagde build gaf er 46 (16 voor
  deel 1, 30 voor deel 2) terwijl elke letter uit Courier New komt. De kop
  wijst nu naar `pdffonts` als de controle die wél iets zegt, met de
  `brew install poppler` erbij omdat dat gereedschap niet standaard is.
- **Niet door prettier gehaald.** De huisregel is dat markdown door prettier
  gaat, maar `prettier --check` zakt op `voortgang.md` en op de bestaande
  entries zoals ze in de repo staan: dit logboek is met de hand op 80 tekens
  gezet en prettier zou elk bestand herschrijven. Dat zou een doc-fix in een
  formatteringsdiff verstoppen. De nieuwe en gewijzigde regels zijn met de
  hand gewrapt en de breedte is nagemeten.

## QC-resultaat

Docs plus één commentaarblok in een shell-script; geen spelerstekst, geen
logica.

- `bash -n walkthrough/tools/bouw-walkthrough.sh` schoon.
- `node tools/check-docpaden.mjs`: 0 dode paden in een contractdocument.
- Regelbreedte van de gewijzigde en nieuwe markdown op 80 tekens nagemeten.
- `node --test test/test-*.mjs`: 454/454, ongewijzigd.
