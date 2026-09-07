# 08 — Levels 1, 2 en 3 (WP 7)

## Opdracht

Werkpakket 7: de eerste drie echte, speelbare levels bouwen — scharnier 1
(klasse/instantie/constructor/this), scharnier 2 (signaturen) en scharnier
3 (voorwaarden/validatie/cascade). Bindend: levels-en-checkpoints.md voor
de exacte puzzelvormen en herstelde bestanden, checker-contract.md en de
WP4-corpus voor de verificatie, save-en-hints.md voor de drie hint-stadia
en de geseede variatie.

## Aanpak

De worker volgde het patroon van `level0.js` (WP 5) op de voet: elk level
een editor-herstelpuzzel (twee geseede beschadigde varianten), plus de
per-level voorgeschreven terminalpuzzels (schrijf-van-nul en verklaar voor
level 1; Parsons en trace voor level 2; vind-de-fout en trace voor level
3). De editor-modellen zijn geen nieuwe fictie maar letterlijke fragmenten
uit de bestaande WP4-corpus, die op haar beurt teruggaat op de echte
broncode van Seven Little Goats.

## Beslissingen

- **Geen corpus-uitbreiding nodig.** Alle vier editor-puzzels passen op
  bestaande corpus-fragmenten (s1-voorwerp, s1-geitje, s2-speler,
  s3-clamp); de terminalpuzzels lopen sowieso niet door de
  corpus-harness. Dat houdt de WP4-testtelling (8 fragmenten) intact.
- **`tools/check-assets.mjs`**: driftbewaking per klasse-lid met
  aaneengesloten tokenvergelijking — tolerant voor een puzzel die maar een
  deel van een klasse toont, streng genoeg om elke wijziging in het
  getoonde stuk te vangen.
- **Level 2's model laat `Speler()` en `aanvalskracht` weg** (de
  corpus-constructor is al vereenvoudigd); daardoor blijft elk getoond lid
  byte-getrouw met `Speler.java` in plaats van een gedeeltelijke
  mismatch te riskeren.
- **Level 1 heeft 2 editor- + 1 terminalpuzzel**, niet de 1+2-richtlijn.
  De leveltabel schrijft dit exact zo voor en noemt de 1+2-verdeling
  elders uitdrukkelijk een richtlijn, geen wet.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `node --test test/test-*.mjs` — 157 tests, alles groen (124 vóór WP 7,
  +33 nieuw, geen regressies).
- `node tools/check-assets.mjs` — geen drift: alle vier editor-modellen
  (Voorwerp, Geitje, Speler ×2) byte-getrouw met de broncode.
- `node test/smoke-browser.mjs` (19/19) en `smoke-pc.mjs` (21/21) —
  ongewijzigd groen.
- `node test/smoke-levels-1-3.mjs` — 32/32: de volledige lus (fragment →
  spread → pc → drie puzzels → level-af → terug naar de zolder) voor elk
  van de drie levels, plus een expliciete variatietest: bij `?seed=1` versus
  `?seed=2` tonen alle drie de herstelpuzzels een andere beschadigde
  variant.
- Cursusgrenzen-controle op de ingebedde Java-fragmenten in de drie
  levelbestanden: schoon (geen `switch`/`enum`/`var`/pijl-lambda's/
  ternary — het enige treffertje was een `?` binnen een gewone
  notitietekst, geen Java-code).

Commit: levels 1–3, werkpakket 7.
