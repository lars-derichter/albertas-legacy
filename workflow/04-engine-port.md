# 04 — De engine-port (WP 3)

## Opdracht

Werkpakket 3: de browser-engine van de remake-90s porten naar deze repo en
aanpassen aan het contract in `docs/engine-architectuur.md`: AL-namespace,
64-kleuren-palet uit de art-stijlgids, `debugPalet`-guard, het platte
staatsobject, de effect-tag-woordenlijst, de laadvolgorde, en het
raamwerk voor levels, hints, variatie en save — plus één echte zolderscène
en een speler-sprite als bewijs dat de keten werkt.

## Aanpak

De worker las de contracten en de volledige remake-90s-bron, portte de
renderer en randmodules met bronvermelding in de bestandskoppen, en bouwde
de logica-laag DOM-vrij zodat alles onder Node testbaar is. Playwright
dekt de browserkant: titelkaart, lopen, parser, save-herstel na reload,
alles vanaf `file://`.

## Beslissingen

- Save/load/herbegin leven in `world.js` (de bestandskaart kent geen
  `save.js`), met een geïnjecteerd storage-object zodat tests een
  nep-localStorage kunnen meegeven.
- `herbegin` bevestigt stateless: `herbegin` vraagt, `herbegin ja` doet.
- De zolder-`?` (plaatshint) telt niet mee in `hintsTotaal`; alleen
  puzzelhints in de pc voeden Alberta's oordeel (conform save-en-hints.md).
- Nog niet bestaande scripts (checker, levels-inhoud, pc, sim) staan als
  commentaar op hun plek in de laadvolgorde van `index.html`.
- Het berichtvenster kreeg de warme papierlook uit het palet in plaats van
  het wit/rood van de voorganger.
- Variatie draait op mulberry32, een klein deterministisch PRNG.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `node --test test/test-*.mjs` — 34 tests, alles groen (wereld/navigatie,
  save-roundtrip en migratie, levels-raamwerk en variatie-determinisme,
  oordeel-tiers).
- `node test/smoke-browser.mjs` — 9/9 PASS, inclusief save-herstel na
  reload vanaf `file://`.
- `node tools/lint-scene.mjs` — zolder-west schoon tegen het 64-palet.
- Screenshot bekeken: de scène leest als een zolder (dakraam, lichtbundel,
  dozen, notitieboek op een kist). Placeholder-kwaliteit, zoals afgesproken;
  WP 6 doet de echte art.
- Eén correctie: het npm-testscript gebruikte `node --test test/`, wat op
  Node 24 faalt; nu `node --test test/test-*.mjs`.

Commit: engine-port, werkpakket 3.
