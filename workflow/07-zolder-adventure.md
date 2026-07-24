# 07 — De zolder-adventure (WP 6)

## Opdracht

Werkpakket 6: de resterende zolderinhoud — de twee verplichte scènes
(`zolder-oost`, `zolder-midden`), de herbruikbare notitieboek-spread, de
eindkaart, de ontbrekende sprites, en alle verhalende tekst: de intro, de
zeven spread-teasers, Alberta's oordeel en de epiloog. Bindend contract:
spelontwerp-legacy.md (scènes, lus per level, commando's, endgame),
achtergrond.md (toon), art-stijlgids.md (mood en visuele taal),
save-en-hints.md (oordeel-tiers).

## Aanpak

De worker las alle contracten en de bestaande WP3-code (`scene-zolder-
west.js`, `world.js`, `strings.js`) om de gevestigde patronen exact te
volgen, en breidde ze uit in plaats van ze te herschrijven: een
vierkamer-zolder (west/midden/oost/overloop), de spread-renderer als
data-gedreven component (`AL.spreads`), en de eindkaart als gedeelde
drager voor zowel het oordeel als de epiloog.

## Beslissingen

- **Overloop toegevoegd** als vierde kamer (optioneel volgens het
  contract) om de fragmenten 5–7 ruimtelijke progressie te geven en de
  volledige navigatiegraaf te oefenen.
- **Intro loopt via `spread:intro`** — de contractueel toegestane vorm —
  en bevat de kernzin over Alberta's tekst-eerst-werkwijze.
- **Eén eindkaart voor oordeel én epiloog**, zoals het contract
  voorschrijft; de engine legt er tier-tekst of epiloog-alinea's overheen.
- **Props in de scène-tekening, sprites als canoniek register** — dezelfde
  aanpak als het notitieboek in `scene-zolder-west` (WP 3): de engine
  blit geen hotspot-sprites, dus de vijf nieuwe sprite-bestanden dienen
  als de bindende sprite-inventaris, niet als geblitte objecten.
- **Lichte, niet-afdwingbare progressie**: fragmenten ontgrendelen door de
  juiste doos in de juiste kamer te openen, geen harde vergrendeling op
  datum of level — conform "zichtbaar, niet verplicht" uit
  save-en-hints.md.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `node --test test/test-*.mjs` — 124 tests, alles groen (109 vóór WP 6,
  +15 nieuw, geen regressies).
- `node tools/lint-scene.mjs` — alle zes scènes schoon.
- `node test/smoke-browser.mjs` — 19/19, inclusief de volledige hub-wandeling
  (west → midden → oost), het doorbladeren van een spread, en `ga zitten`
  die `pc:open` triggert.
- `node test/smoke-pc.mjs` — nog steeds 21/21 (WP 5 niet geraakt).
- Vier screenshots bekeken: de werkhoek en de doorgang lezen meteen als
  zolderkamers; de spread toont de notitieboek-look met "week 1 van de
  cursus" voor level 1; de eindkaart draagt Alberta's oordeel leesbaar
  (titel iets krap in beeld, cosmetisch, geen blokkerend probleem voor
  deze fase van de art).
- Weeknummers rechtstreeks in `strings.js` nagelezen tegen
  `docs/levels-en-scharnieren.md`: 1, 2, 2, 3, 4, 5, 6 voor level 1–7 —
  klopt exact met de eerder gecorrigeerde tabel.

Commit: zolder-adventure, werkpakket 6.
