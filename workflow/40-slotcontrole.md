# 40 — Slotcontrole

## Opdracht

Het sluitstuk van het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`): alle poorten in één run,
verse screenshots van elk hoofdscherm voor Lars, de eindstand in
`voortgang.md`, en de PR-beschrijving bij. Dit pakket is door de manager
zelf uitgevoerd.

## De poorten, gemeten op deze commit

- `node --test test/test-*.mjs` — **400/400 groen**. Vertrekpunt van het
  programma was 328; de 72 nieuwe tests bewaken spreads en bladspiegel,
  loopveld en collisie, hint-boom, schaalverhoudingen, handschriftfont
  en geluidsniveaus.
- Acht Chromium-smokes via `file://` — **305/305**: smoke-browser 41,
  smoke-walk 25, smoke-geluid 17, smoke-pc 32, smoke-sim 13,
  smoke-levels-1-3 32, smoke-levels-4-7 48, smoke-full-playthrough 97.
- `javac -encoding UTF-8` — schoon; verboden-constructies-grep — leeg.
- `tools/lint-scene.mjs` — alle elf scènes in orde;
  `tools/check-assets.mjs` — geen drift; `tools/check-docpaden.mjs` —
  842 paden, 0 dood in een contractdocument;
  `tools/check-walkthrough.mjs` — 276 citaten, 0 afwijkingen.

## Screenshots

Vers gerenderd op deze stand en aan Lars bezorgd (test-results/ staat in
.gitignore; de bestanden reizen niet mee in de repo): titelkaart, de
vier kamers, spread van hoofdstuk 1 in de nieuwe hand, de pc-editor, de
draaiende sim en de oordeel- en epiloogkaart.

## Wat het programma opleverde

Dertien pakketten (28 t/m 39, plus het ingelaste 35b), elk atomair
gecommit na zijn eigen poort:

- **Taal:** de wolf-zin klopt ("De wolf slokte er zes op."), het jongste
  geitje blijft in de klokkast, Hollandismen en anglicismen eruit.
- **Alberta's stem:** de Java-broncode leest als haar werknotities, niet
  als een les; het cursusjargon is uit de fictie.
- **Levelnamen:** scharnierterm vooraan, verhaal erachter, en de pc-kop
  toont de naam eindelijk.
- **Gameplay:** elke kamer te voet bereikbaar, objecten blokkeren, muren
  zijn stil, de hint weet waar je bent in het spel, en een hersteld
  hoofdstuk stuurt je naar het volgende blad.
- **Beeld:** een neutrale erfgenaam-sprite van rechts belicht, één
  maatregel (1 px = 5 cm) over alle kamers, een zolder die weer vol
  staat, en een echt handschrift in het notitieboek.
- **Geluid:** hoorbare mix, unlock op elk gebaar, de doos-cue vuurt.
- **Docs en walkthrough:** contractdocumenten gelijk met de code, twee
  nieuwe schema-documenten, walkthrough zin voor zin gelijk met het
  spel en de PDF's herbouwd.

## Open punten na dit programma

- **De luistertest.** De mechanische oorzaken zijn weg, maar of 0,30 op
  een laptopspeaker goed klinkt, hoort een oor te beslissen — deze
  container heeft geen geluidsuitgang.
- **`smoke-touch`** vraagt WebKit en dat ontbreekt hier; de
  aanraak-unlock is wel via smoke-geluid (Chromium met touch) gedekt.
- **De PDF's staan in Liberation Mono** (metrisch gelijk aan Courier
  New); een machine mét Courier New herbouwt het origineel.

## QC-resultaat

Alle poorten hierboven groen op één en dezelfde werkkopie, zonder
onafgewerkte wijzigingen. De checklist in `voortgang.md` draagt de
eindstand; dit is het laatste pakket van programma 3.
