# 12 — Slotcontrole (WP 11)

## Opdracht

Het laatste werkpakket: de README op punt zetten, docs/ nalezen tegen de
uitgeleverde code, een échte ononderbroken playthrough bouwen (geen
debug-sneltoetsen), een tijdsinschatting en een test vanaf een schone
kloon. Dit is de eindcontrole vóór oplevering.

## Aanpak

De worker verwijderde de verouderde "in aanbouw"-melding uit de README
(die beweerde dat `index.html` nog niet bestond), werkte de
projectstructuur-boom bij, en las alle negen documenten in `docs/` tegen
de effectief uitgeleverde code. Vervolgens bouwde hij
`test/smoke-full-playthrough.mjs`: één Playwright-run die het hele spel
speelt zonder één debug-sneltoets — van de titelkaart tot de epiloog.

## Bevindingen (docs-drift, gecorrigeerd)

- `spelontwerp-legacy.md`: een spookrij `pc-chrome` in de scène-
  inventaris verwijderd (dat is een DOM/CSS-overlay, nooit een scène-
  bestand).
- `checker-contract.md`: de assertie-tabel gebruikte namen die nergens in
  de code bestaan (`exacteSignatuur`, `returnAanwezig`, …); vervangen door
  de twaalf echte functienamen uit `asserts.js` met hun werkelijke
  configuratie.
- `engine-architectuur.md`: `js/pc/pc.js` en `js/pc/sim-terminal.js`
  (allebei echte, eerder gebouwde bestanden) ontbraken in de bestandskaart
  en de laadvolgorde; toegevoegd.
- `levels-en-checkpoints.md` en `save-en-hints.md`: gecontroleerd tegen de
  code, geen drift gevonden.

## QC-resultaat

Omdat dit de laatste controle vóór oplevering is, heeft de manager alles
onafhankelijk herhaald in plaats van op het rapport te vertrouwen:

- `node --test test/test-*.mjs` — 229 tests, alles groen, geen regressie.
- **`node test/smoke-full-playthrough.mjs` — 94/94 groen**, zelf gedraaid:
  één ononderbroken run door alle zeven levels (21 puzzels), de sim tot
  een einde, Alberta's oordeel (`meesterhand`, 0 hints — bewijst dat
  hint-tellers niet lekken tussen levels) en de epiloog. De save
  overleeft een herlaad halverwege (na level 3): seed en voortgang intact.
- Alle bestaande Playwright-smoketests opnieuw zelf gedraaid:
  smoke-browser (19/19), smoke-pc (21/21), smoke-levels-1-3 (32/32),
  smoke-levels-4-7 (48/48), smoke-sim (13/13) — geen regressies.
- `node tools/check-assets.mjs` en `node tools/lint-scene.mjs` — schoon.
- **Kloontest onafhankelijk herhaald**: `git archive HEAD` naar een schone
  map (enkel vastgelegde bestanden, precies wat een echte kloon zou
  bevatten), daar `javac -d out src/*.java` en
  `java -cp out Main < test-scripts/einde-les.txt` gedraaid — bereikt
  "Einde: de les." Bevestigt dat de Java-hoofdprijs volledig
  zelfstandig is vanuit een schone kloon.
- README-wijzigingen nagelezen: de "in aanbouw"-melding is weg, de
  walkthrough-sectie verwijst naar beide PDF's, de projectstructuur klopt.

Geen verdere correcties nodig. Dit sluit het plan af: alle twaalf
werkpakketten (0–11) zijn opgeleverd, gecontroleerd en gepusht.

Commit: slotcontrole, werkpakket 11.
