# 06 — De gesimuleerde pc (WP 5)

## Opdracht

Werkpakket 5: Alberta's pc als DOM-overlay — editor, terminal en
Parsons-UI — plus een proefdruklevel ("level 0") dat elke puzzelsoort één
keer echt doorloopt, met de echte checker uit WP 4. Bindende contracten:
engine-architectuur.md (§"De gesimuleerde pc", de effect-tags),
spelontwerp-legacy.md (commando's per modus), checker-contract.md (de
twee feedbacklagen), save-en-hints.md (concept-behoud, hint-stadia).

## Aanpak

Deze worker liep tijdens de eerste poging tegen een sessielimiet aan,
midden in het schrijven van de pc-CSS. Niets was toen gecommit; de
manager hervatte dezelfde agent (met volledige transcript-context) met
een concrete opsomming van wat nog openstond. De worker rondde de CSS af,
verbond de effect-dispatch in `engine.js`, en schreef de twee resterende
testbestanden.

## Beslissingen

- **`js/pc/pc.js` als vierde pc-module.** De bestandskaart noemt alleen
  editor/terminal/parsons, maar staat een coördinator toe "als nuttig".
  Drie zusterpanelen hebben een neutrale eigenaar nodig voor menu,
  modus-navigatie en open/sluiten.
- **Level 0 is dev-gated.** `index.html` laadt `level0.js` alleen bij
  `?dev=1`; in Node registreert het altijd, zodat de logicatests het
  kunnen aansturen. Het telt niet mee in `aantalAfgerond`/`alAf`, dus niet
  in voortgang of oordeel.
- **Escape = pc:sluit** overal binnen de pc; "terug"/`menu` gaat naar het
  pc-menu. Consistent met het effect-tag-contract.
- **`input.js` bailt op echte invoervelden** (textarea/input/
  contenteditable) in plaats van globaal te blokkeren, zodat typen,
  selecteren en plakken in de editor gewoon werken.
- **Verklaar-in-één-zin is niet-bestraffend**: zowel "juist" als "anders"
  ronden de puzzel af, zoals de zelfscorende cursusvorm.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `node --test test/test-*.mjs` — 109 tests, alles groen (was 93 vóór
  WP 5, +16 nieuw, geen regressies).
- `node test/smoke-browser.mjs` — 9/9 nog steeds groen.
- `node test/smoke-pc.mjs` — 21/21 groen: menu, editor-herstel (fout dan
  correct), Parsons (foute en juiste volgorde), trace, drie gestage hints
  + `hint:geen-meer` op de vierde, concept-behoud over een reload, Escape.
- Screenshots bekeken: de editor toont authentieke amber-VGA-chrome
  ("ALBERTA'S EDIT V2.3", regelnummers, blok-cursor); de terminal toont
  `javac: geen fouten` gevolgd door een CHECK_OK- en een CHECK_FAIL-regel
  met structurele (niet letterlijke) feedback — in lijn met het
  hint-contract, dat pas bij de losse hint-vraag stapsgewijs dichter bij
  de oplossing komt.
- Gecontroleerd: `logic/checker` en `js/levels/level0.js` blijven DOM-vrij;
  alleen `engine.js` en `js/pc/*` raken de DOM aan.
- Gecontroleerd: de meldingKey→strings-vertaling is getest tegen zowel de
  effectief gebruikte corpus-sleutels als de volledige
  assertie-woordenlijst — geen gaten.

Commit: gesimuleerde pc, werkpakket 5.
