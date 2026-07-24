# 10 — Seven Little Goats als browsersimulatie (WP 9)

## Opdracht

Werkpakket 9: de speler ontmoet Alberta's spel een tweede keer — niet als
te herstellen code, maar als speelbaar spel, in de terminal-UI, meteen na
level 7. Bindend: engine-architectuur.md (`sim`-modus, effect-tags
`sim:boot`/`sim:einde`), spelontwerp-legacy.md (de endgame-sequentie), en
vooral de eis uit spelontwerp-seven-little-goats.md dat de simulatie de
Java "één-op-één" spiegelt, bewaakt door een transcript-cross-check tegen
`java -cp out Main`.

## Aanpak

De worker las de volledige, actuele Java-broncode (inclusief de
level-5-toevoegingen uit WP 8) en bouwde drie DOM-vrije modules
(`goats-strings.js`, `goats-world.js`, `goats-combat.js`) die letterlijk
dezelfde route volgen als `Spel.java`/`Kamer.java`/`Gevecht.java`, plus de
terminal-integratie en de echte endgame-bedrading: `level-af:7` start nu
werkelijk de sim, en de sim roept zelf `AL.world.simVoltooid` aan bij een
einde — de neptrigger van WP 6 is vervangen, niet enkel aangevuld.

## Beslissingen

- **Cross-check-normalisatie is minimaal**: enkel het samengevoegde
  `> `-prompt-restje en lege opmaakregels worden gestript vóór
  vergelijking; schadecijfers, kamernamen en eindeteksten worden
  woordelijk vergeleken.
- **Sim-boot met één tick uitgesteld** (`setTimeout(…, 0)`), omdat het
  bestaande puzzel-afrondingspad de handler anders synchroon zou wissen.
- **`smoke-sim.mjs` bereikt level 7 via de debug-hook** (sneller dan de
  volledige zolderlus, die al in smoke-levels-4-7 gedekt is), maar de
  overgang `level-af:7 → sim:boot` zelf loopt via het echte enginepad, niet
  via de oude debug-stub.

## QC-resultaat

Gezien deze worker het spelclimax bouwt, heeft de manager alles zelf
herverifieerd in plaats van enkel het rapport te vertrouwen:

- `node --test test/test-*.mjs` — 229 tests, alles groen (203 vóór WP 9,
  +26 nieuw).
- `node test/test-sim-cross-check.mjs` — **4/4 scripts identiek** aan
  `java -cp out Main` (86–103 inhoudsregels per script); het uittreksel
  van het beste einde (de volledige endgame-keten van alle zeven geitjes)
  is woordelijk gelijk.
- `grep Math.random js/sim/` — leeg: de simulatie is volledig
  deterministisch, zoals vereist voor de cross-check.
- `node test/smoke-sim.mjs` — 13/13: de volledige sequentie
  `level-af:7 → sim:boot → spelen → sim:einde → oordeel:<tier> → epiloog`
  bevestigd als écht bedraad, niet gestubt.
- `node test/smoke-browser.mjs` (19/19), `smoke-pc.mjs` (21/21),
  `smoke-levels-1-3.mjs` (32/32), `smoke-levels-4-7.mjs` (48/48) — geen
  regressies.
- Twee screenshots bekeken: Alberta's oordeel ("de meesterhand") en de
  epiloog met de broncode-verwijzing — beide lezen precies in de
  beoogde toon.

Commit: Seven Little Goats als browsersimulatie, werkpakket 9.
