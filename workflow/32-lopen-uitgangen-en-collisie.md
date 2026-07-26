# 32 — Lopen: uitgangen, muren en collisie

## Opdracht

WP 32 uit het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`, Bijlage B). Uit de prompt van
Lars: *"the sides that a player cant walk through (draw a wall there)"*
en *"a player walking through objects"*. De verkenning maakte er drie
defecten van: de noord/zuid-uitgangen waren te voet onbereikbaar (alleen
`ga noord` werkte, en levels 5-7 liggen op de overloop), de speler liep
dwars door kist, bureau en dozenstapels, en tegen een geschilderde muur
lopen opende elke seconde een modaal venster. Een Opus 5-worker voerde
uit; de manager controleerde en committe.

## Aanpak

- **Nieuwe DOM-vrije module `js/loopveld.js`** (`AL.loopveld`): walkbox-,
  blok- en uitgangszone-meetkunde, Node-testbaar, gedeeld door engine en
  lint. `world.betreed` bleef onaangeraakt.
- **`exits` per scène:** een rechthoek die bij binnenstappen dezelfde
  kamerwissel triggert als de randkruising — de trap in zolder-midden
  (noord) en het trapgat op de overloop (zuid) zijn nu gewoon beloopbaar,
  zonder venster of extra toets. Oost/west blijven randkruisingen.
- **`blokken` per scène:** rechthoeken die van de walkbox worden
  afgetrokken. Geblokkeerd zijn de voetzones van kist en dozenstapels
  (west), bureau met stoel (oost), geschilderde stapel en beide
  doos-sprites (midden), kartontorens en doos (overloop). Regel:
  geschilderde objecten (in de achtergrond gebakken) blokkeren tot de
  bovenrand van de loopstrook; sprite-props alleen hun onderste band,
  zodat erachter lopen blijft werken.
- **Stille muren:** de weigering is uit het loop-pad; tegen een muur of
  blok lopen klemt de speler gewoon vast. Het modale "Die kant kan je
  niet op" blijft bestaan voor getypte commando's zonder bestemming. De
  weigerings-cooldown werd daarmee dode code en is verwijderd.
- **Lint uitgebreid:** blokken/exits-vormen en -grenzen; elke
  `KAMERS`-uitgang moet een bereikbaar mechanisme hebben; geen entry in
  een blok of uitgangszone; en een walkbox mag geen rand raken waar de
  kaart geen kamer heeft — dat laatste voorkomt structureel dat defect C
  terugkeert. "koffiemok" is uit `GEKENDE_ITEMS`.
- **`docs/scene-schema.md` en `docs/sprite-schema.md` geschreven** — ze
  werden op vier plaatsen geciteerd maar bestonden niet.
  `engine-architectuur.md` en `spelontwerp-legacy.md` beschrijven de
  nieuwe vloer-mechaniek.
- **Nieuwe tests:** `test/test-loopveld.mjs` (16 checks, incl. een
  flood-fill die bewijst dat elke uitgang vanaf elke entry bereikbaar
  is) en `test/smoke-walk.mjs` (25 Playwright-checks, alleen
  pijltjestoetsen: elke kamerovergang te voet, elke blokkade stil, en
  het getypte pad blijft werken).

## Beslissingen

- **`js/loopveld.js` staat naast `js/parser.js`, niet in `js/logic/`**:
  het is scène-meetkunde voor de engine-laag (booleans, geen
  `{tekst, effecten}`); `parser.js` is het precedent.
- **De voorgrond-silhouet in zolder-midden blokkeert níet**, tegen het
  plan in: hij overspant de hele oostrand en zou de oost-uitgang
  verzegelen. Het is een expliciete achterlangs-laag; de geschilderde
  stapel erachter blokkeert wél.
- **Geen aparte stoel-blok:** de stoel valt volledig binnen de
  bureau-voetzone; `ga zitten` is positie-onafhankelijk en blijft
  bereikbaar.
- **Kunstingreep op de overloop:** de leuning liep als een gesloten hek
  van x122 tot x200 over het trapgat. Ze is nu twee stukken met vier
  posten en een opening (x148-175) die samenvalt met de zuid-zone —
  anders sprak het schilderwerk de nieuwe uitgang tegen. Op 5× en in de
  buffer gecontroleerd.
- **`entries.vanNoord` van zolder-midden verschoof van y126 naar y132:**
  het oude punt lag ín de nieuwe uitgangszone en zou de speler meteen
  terugkaatsen. De lint verbiedt die klasse van fouten voortaan.
- **`tools/screenshot.mjs` kreeg `--kamer <id>`** om de vier kamers te
  kunnen vastleggen.
- Vlak vóór dit pakket committe de manager de losse tooling-fix
  `3958fa2` (AL_CHROMIUM-override), zodat de Chromium-smokes in deze
  container draaien — de QC-poort van dit pakket hing ervan af.

## QC-resultaat

Door de worker gedraaid en door de manager onafhankelijk herhaald:

- `node --test test/test-*.mjs` — **353/353 groen** (337 + 16
  loopveld-tests).
- `tools/lint-scene.mjs` — alle elf scènes in orde (met de nieuwe
  regels); `tools/check-assets.mjs` — geen drift.
- `smoke-walk.mjs` — **25/25**: elke kamerovergang te voet, kist,
  dozen, bureau en muren stoppen stil, en "ga oost" op de overloop
  weigert nog wél met een venster.
- `smoke-browser` 36/36, `smoke-full-playthrough` 94/94, `smoke-pc`
  32/32 — het getypte pad is ongewijzigd.
- Verse screenshots van de vier kamers (test-results/wp32-*.png) door de
  manager bekeken: overgangen en leuning-opening kloppen; de bekende
  schaal- en sprite-kwesties blijven staan voor WP 34/35.
- `smoke-touch` kon opnieuw niet draaien (geen WebKit in de container);
  het D-pad voedt dezelfde `loopStap`, dus het blijft een open punt op
  de lijst van na programma 2.
