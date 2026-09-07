# 28 — Kwaliteitsreview: kickoff en programma

Dit is de kickoff van het derde programma op deze repo: een kritische
kwaliteitsreview van het hele spel, gevolgd door dertien werkpakketten
(WP 28 t/m 40) die de gevonden defecten herstellen. De opdracht kwam van
Lars; de verkenning gebeurde door drie parallelle Explore-agents; de
beslissingen en het goedgekeurde plan staan hieronder integraal.

## Opdracht

De prompt van Lars, verbatim:

> Look critically at this game: the storytelling, the language, the
> graphics, the music and sounds, the gameplay etc.
> Look for inconsistencies, errors, defects, opportunities for improvement
> (e.g. comments in the code of 7 goats that start with Albertas notities,
> why does the player sprite look like red riding hood, the size off the
> coffee cup compared to the computer and the chair (a lot of visual
> scaling feels off), the phrase zes geitjes gingen in de wolf -> de wolf
> slokte 6 geitjes op (or sth else that at least sounds like correct Dutch
> (Flemish), the sides that a player cant walk through (draw a wall
> there), the sounds that do not play or are too quiet, the code comments
> in the game that sound like a teacher explaining something for the first
> time (students have already learned these concepts, when they play these
> levels), a player walking through objects, the handwriting font that is
> just a lazy solution (wobbly letter placement), the crazy names of the
> levels that are taken from the names of the other minigames in the
> course, but that have no relation with the course terminology.
> If you want to check the course behind this game and its contents, you
> can find it here:
> https://github.com/lars-derichter/programming-fundamentals.git (I would
> think that you have access, if not, let me know how to give you access).
> My students should have fun playing this game and at the same time train
> the most important concepts of their course, but it should also, really
> feel and look like playing a game.
> Start by exploring, create a list of defects and opportunities for
> improvement and make a plan to implement these. In this plan you will be
> the manager and you will be in charge of final quality control and
> taking decisions. For the actual work and first checks, you will make
> use of Opus 5 agents. You will make sure to make atomic commits.
> Documentation should be kept up-to-date and the conventions for
> documenting the workflow should also be followed.
> Once I have approved the plan, you should be able to run unsupervised.
> The work should be done in such a way that you can easily pick up where
> you were after a crash or after a reset of a token limit.

## Aanpak van de verkenning

- De cursusrepo is gecloond naar `/workspace/programming-fundamentals`
  (read-only referentie). Daaruit komen de authoritatieve zeven
  scharnieren (`sources/cursusdoorlichting-leidraad.md`, deel 3), de
  namen van de cursus-minigames (`games/README.md`) en de taalstijlgids
  (`docs/style.md`: Vlaams, B2, geen Hollandismen, geen calques).
- Drie Explore-agents hebben parallel het spel doorgelicht: (1) gameplay,
  levels, walkability en parser; (2) graphics, sprites, typografie en
  geluid; (3) proza, verhaal en de Java-inhoud. Elke bevinding hieronder
  is door een agent gereproduceerd met bestand- en regelverwijzing; de
  gecondenseerde maar feitelijk volledige defectenlijst staat in
  Bijlage A.

## Vragen en antwoorden

Drie ontwerpbeslissingen zijn aan Lars voorgelegd (2026-07-25). De kern
van elke vraag en het gekozen antwoord, verbatim:

1. *"The attic player sprite is literally the Red Riding Hood sprite from
   the predecessor (red cloak, long dark hair) […] How should the attic
   sprite be handled?"* — Antwoord: **"New neutral figure"** (redraw als
   neutrale erfgenaam-figuur per `achtergrond.md`, belichting en maat
   meteen goed; Roodkapje blijft aanwezig via de sim).
2. *"The 'handwriting' in the notebook is the regular 8×8 bitmap font
   with a shear and a rigid 4-character wave […] What level of fix do you
   want?"* — Antwoord: **"Real handwriting glyphset"** (een echte
   pixel-handschriftfont voor het notitieboek).
3. *"The 7 chapter titles in the notebook are metaphor names borrowed
   from the course's other minigames […] What should the new titles
   be?"* — Antwoord: **"Story + terminology"** (nieuwe titels geworteld
   in de Seven Little Goats-fictie, gepaard met de scharnierterm).

## Beslissingen

- **De staande beslissing "de _Seven Little Goats_-prose blijft
  ongemoeid" wordt teruggedraaid.** Reden: Lars vraagt expliciet de
  wolf-zin en het commentaarregister te herstellen. De technische vrees
  uit die beslissing (fixtures die meetrekken) blijkt bovendien
  onterecht: `test-sim-cross-check` vergelijkt twee líve runs; de
  testscripts zijn commando-invoer, geen golden transcripts.
- **De klacht "Albertas notities" is deels een non-finding.** De puzzels
  gebruiken al correct "// Alberta's notitie — …". Wat wél blijft: het
  doceerregister in `seven-little-goats/src/` (WP 30).
- **Manager commit, workers niet.** Zoals in de vorige programma's: één
  atomaire commit per werkpakket, pas na geslaagde QC-poort, gevolgd
  door een onmiddellijke push. `voortgang.md` gaat mee in hetzelfde
  commit.
- **Workers zijn Opus 5-agents** (op vraag van Lars); zwaardere pakketten
  krijgen een tweede, adversariële checker-agent vóór de eindcontrole
  van de manager.
- **Afwijking van het goedgekeurde plan, hier gelogd:** het plan zegt dat
  de drie verkenningsrapporten "integraal" in deze entry komen. Ze zijn
  hier opgenomen als de gecondenseerde defectenlijst in Bijlage A — elk
  feit, elke vindplaats en elke maat uit de rapporten staat erin, maar de
  verhalende omkadering van de agents is samengevat. Reden: het logboek
  wint aan leesbaarheid en verliest geen enkele controleerbare bewering.

## QC-resultaat

Dit pakket raakt alleen documentatie. Gecontroleerd: markdown op 80
tekens, geen codewijzigingen, `node --test test/test-*.mjs` ongewijzigd
groen vóór en na (baseline 328).

## Bijlage A — de defectenlijst uit de verkenning

### A.1 Gameplay en levels

Navigatiemodel: `walkboxes: [[x,y,b,h]]` per scene, puntentest
`inWalkbox` (js/engine.js:157-167); scènewissel enkel via
schermrand-kruising (engine.js:662-672; VELD_TOP=8, VELD_BOT=189).
Hotspots zijn puur decoratief (geen collisie); interactie loopt via
getypte zelfstandige naamwoorden (js/logic/world.js:54-82).

- **A (kritiek): noord/zuid-uitgangen onbereikbaar te voet.** Geen enkele
  walkbox raakt y<8 of y>189, dus de rand-kruising noord/zuid vuurt
  nooit. zolder-midden ↔ overloop kan alleen door `ga noord` te typen;
  levels 5-7 liggen op de overloop. Contradicteert
  docs/spelontwerp-legacy.md:46-49. De trapcorridor-walkbox
  [150,118,42,71] bewijst dat lopen de bedoeling was.
- **B (kritiek): de speler loopt door alle objecten.** Kist in
  zolder-west (96×30 px, scene-zolder-west.js:100), bureaupoten en stoel
  in zolder-oost (:49-50, :142), dozenstapels in zolder-midden (:73,
  :146) — alles binnen de walk-strip [0,150,320,39]. WP H stelde dit
  expliciet uit (workflow/voortgang.md, slot van WP H).
- **C: walkboxen lopen tot x=0..319 in élke kamer** — de speler loopt
  tegen geschilderde muren en krijgt ongeveer elke seconde een modale
  "Die kant kan je niet op"-dialoog in plaats van een blokkade.
- **D (hoog): `lN.naam` is dode data** — de pc-kop toont enkel "Level 3"
  (js/pc/pc.js:95-98 leest de naam alleen voor testlevel 0). Ook `week`
  wordt nergens gelezen.
- **E: weeknummers spreken elkaar tegen** — de spread-voet zegt week 1
  (level 1), de onderzoektekst van het notitieboek zegt week 3
  (strings.js:185-186).
- **F: lopen is de facto decoratief** — alle navigatie in de
  referentie-playthrough is getypt (test/smoke-full-playthrough.mjs).
- **G: de zolder-`?`-hint is statisch en misleidend** — de hint van
  zolder-midden stuurt de speler wég van de dozen met fragmenten 2-4
  (world.js:340-344; FRAGMENT_LOCATIE world.js:44-48).
- **H: zachte doodlopende lus** — na een afgerond level kan de speler
  weer plaatsnemen; niets zegt "zoek het volgende fragment"
  (world.js:318-329).
- **I (klein):** spread-bladerhint "spatie: pc >" klopt maar half
  (engine.js:1021); de epiloog saved niet (reload toont hem opnieuw,
  engine.js:342-348 vs :544); `open doos`/`kist`-woordenschat klopt niet
  per kamer (world.js:388-394); dood save-veld `spreadGelezen`; dode
  velden `props` en hotspot-`item`; `GEKENDE_ITEMS` bevat het verweesde
  "koffiemok" (tools/lint-scene.mjs:29-30).
- **Docs ontbreken:** `docs/scene-schema.md` en `docs/sprite-schema.md`
  worden geciteerd (o.a. tools/lint-scene.mjs:1) maar bestaan niet.
- **Levelnamen:** de spread-koppen gebruiken metafoortitels uit de
  cursus-hub ("De knikkerbaan", "De plankenbrug boven het ravijn", "De
  speurtocht…") — docs/levels-en-checkpoints.md:25-36 zegt letterlijk
  dat ze uit `hub-data.js` komen. De scharnierterminologie staat wél
  correct op p2 van elke spread.

### A.2 Graphics, typografie en geluid

- **Sprite:** js/sprites/sprite-speler.js is de Roodkapje-sprite uit
  remake-90s (rode mantel palet 4/12, lang donker haar; de header noemt
  het een "bewuste callback"). docs/achtergrond.md:141-144 eist echter
  "een kleine, neutrale figuur". De sprite is bovendien van links belicht
  terwijl alle props van rechts belicht zijn (dakraam), en de belichting
  flipt bij het spiegelen (west = gespiegeld oost, engine.js:884). Maat
  13×25 waar de stijlgids ±33 px vraagt (art-stijlgids.md:341).
- **Schaal:** koffietas 14×16 px (plus oor: 19 px breed) tegen een speler
  van 13×25 (scene-zolder-oost.js:68-73) — bijna spelerbreedte, hoger dan
  het CRT-schermvlak. De speler (hoofd max y≈126) is kleiner dan het
  bureau (blad y116); hij kan nergens bij en de stoel past niet onder het
  bureau. Geschilderde dozen zijn 2-3,5× zo groot als de doos-sprites
  ernaast (scene-overloop.js:74,92,98 vs sprite-doos.js 22×18).
  Notitieboek-sprite 22×13 op een kist van 96×42. Dieptescaling werkt
  alleen op de speler, nooit op props (engine.js:817 vs :883-886) en
  vergroot de mismatch dus. Geen lint of maatregel bewaakt relatieve
  schaal.
- **Handschrift:** geen echte handschriftfont — dezelfde 8×8-bitmapfont
  met shear 0.25 en een ±1px-driehoeksgolf met periode exact 4 tekens,
  index-gebaseerd en dus identiek op élke regel (verticale banding).
  scene-spread-template.js:110-116, gfx.js:655-681. Stale comment
  "groepje van drie" (:100). Drie typebehandelingen op één
  notitieboekpagina.
- **Geluid:** master gain 0.16 (sound.js:49) — een stap-tik van 100 ms
  piekt rond -20 dBFS. Foley en drones zitten in de sub-bas (stap midi
  38/41 = 73/87 Hz, deur 45/40, ambient 55/65 Hz), onder wat
  laptopspeakers weergeven; noten onder midi 55 gaan bovendien naar de
  bas-stem met de traagste attack (sound.js:255). De `doos`-cue is
  gedefinieerd en gedocumenteerd maar wordt nergens afgevuurd
  (sound.js:102-103; world.js:311 speelt `geluid:pagina`). De
  audio-unlock hangt alleen aan het toetsenbord (input.js:83-85);
  touch/click/D-pad ontgrendelt nooit (touch.js:39, :93, :132) — een
  touchspeler hoort niets en er lekken oscillatornodes. Muziek start
  vóór de eerste gebruikersactie (engine.js:347). Voetstappen tikken op
  3.75 Hz waar de loopcyclus 4.0 Hz loopt (engine.js:683-687).
- **Palet:** code en stijlgids kloppen kleur voor kleur; kleine
  doc-drift: "elf ops" moet twaalf zijn (art-stijlgids.md:170), en de
  34/58-lichtbundelbeschrijving (:134-139) dateert van vóór de
  `light`-op.

### A.3 Proza, verhaal en Java

- **De wolf-zin.** "De zeven geitjes deden open. Zes gingen naar binnen —
  in de wolf." staat op drie plaatsen die woordelijk gelijk moeten
  blijven: js/sim/goats-strings.js:49, seven-little-goats/src/
  Main.java:34, seven-little-goats/README.md:32-33. Dubbel fout: de
  geitjes waren al binnen (de wolf ging naar binnen), en "gaan in de
  wolf" is geen Nederlands. Het ontwerpdoc gebruikt zelf het juiste "Zes
  werden opgeslokt" (spelontwerp-seven-little-goats.md:48). Zelfde fout
  in strings.js:47 ("zes geitjes die de wolf binnengaan").
- **Verhaal-bug.** De backstory zegt dat het jongste geitje naar jou kwam
  (goats-strings.js:51-54, Main.java:36-39), maar in het spel zit het de
  hele tijd in de klokkast (Spel.java:151-154) en het einde bevestigt
  dat.
- **Doceerregister in de Java.** seven-little-goats/src/ leest als een
  leraar die het concept voor het eerst uitlegt: "Dit is de klemmende
  setter" (Speler.java:25-28), "De klassieke zoeklus" (Speler.java:56-57
  én Kamer.java:55-56), "Let op de off-by-one" (Kamer.java:67-69), "de
  tel-patroonkaart" en "de uiterste-patroonkaart" (Speler.java:86-100),
  "Een final constante" (Speler.java:8), overload-metacommentaar
  (Voorwerp.java:12-14), gehele-delingsles (Gevecht.java:138-139),
  lijstpatronen-les (Gevecht.java:183-185), en het ergste: "de zoeklus
  van scharnier 7" (Spel.java:183-184) — cursusjargon ín de fictieve
  broncode uit 1993. Plus klaslokaal-"we" op minstens vijf plaatsen
  (Spel.java:19-20, :420, :574-575, Gevecht.java:67-68,
  TestGeitje.java:27). De js/levels/-notities hebben wél de juiste
  Alberta-stem; twee driften naar opgavebrief-register (level5.js:61-68,
  level7.js:40-44 — die laatste verklapt bijna hintfase 3).
- **Overige taalfouten.** "weg gesleten" → één woord (strings.js:143-144,
  verborgen door +-concatenatie); "de een … de ander" → "de ene … de
  andere" (goats-strings.js:37-38 + Main.java:22-23 + README.md:25-26);
  "dit keer" vs "deze keer" inconsistent binnen één bestand
  (goats-strings.js:170 vs :352, gespiegeld in Spel.java:133/:557); het
  anglicisme "wiret" (Kamer.java:31-32, Spel.java:5, :48,
  spelontwerp-seven-little-goats.md:138); "De spanning stijgt." vertelt
  in plaats van toont (goats-strings.js:130-131); hint zonder antecedent
  "ze" (goats-strings.js:83); "Je legt het mes neer." ook zonder mes
  (:235); commando `eet melk` → antwoord "Je drinkt…" (:205 vs :247);
  "(praat)" rauw in een hintzin (:74); commentaar-typo strings.js:180;
  trailing comma strings.js:1088.
- **Doc-drift.** spelontwerp-legacy.md beschrijft nog de bewust
  verwijderde intro-spread (:36-40 vs strings.js:1171-1177), mist de
  drie opening-scenes (:56-64), heeft een verouderde commandolijst
  (:137-147) en zegt `?` waar de pc-editor F1 gebruikt (:161);
  save-en-hints.md:94 ("? werkt overal") is stale; walkthrough
  deel1-hints.md:20-21 is onwaar geworden over `?` in de editor, en de
  PDF's staan acht commits achter op strings.js.
- **Cursusgrens: schoon.** Alleen `ArrayList`, geen verboden
  constructies; de while-variant in level 6 is een opzettelijke
  fout-optie.
- **Structuurnotities voor de fixes.** strings.js is één plat object met
  +-concatenaties (geen mechanische find/replace); spread-pagina's zijn
  hard 17 tekens × 12 regels × 2 kolommen, maximaal 24 gewrapte regels
  (l4 p1 staat op 22); goats-strings.js spiegelt de Java woordelijk
  (elke wijziging = drie bestanden); het schade-overzicht heeft vaste
  kolomspaties.

## Bijlage B — het goedgekeurde plan

Het plan zoals goedgekeurd door Lars op 2026-07-25, integraal. De
werkpakketten staan als levende checklist in `voortgang.md`; bij
tegenspraak wint dit document over de vorm van het plan en `voortgang.md`
over de actuele stand.

### Beslissingen van de gebruiker

1. Spelersprite: nieuwe neutrale erfgenaam-figuur (per achtergrond.md),
   correcte belichting (rechts), groter (richting ~31-33 px). Roodkapje
   blijft alleen in de sim-fictie.
2. Handschrift: échte pixel-handschriftglyphset voor het notitieboek
   (onregelmatige baselines in de glyphs gebakken).
3. Levelnamen: verhaal + scharnierterminologie, bv. "Hoofdstuk 3 —
   Voorwaarden: de deur op slot".
4. De staande beslissing "Seven Little Goats-prose blijft ongemoeid"
   wordt teruggedraaid; motivering hierboven.

### WP 28 — Kickoff en programma

Deze entry plus de nieuwe checklist in `voortgang.md`. QC: documentatie,
tests ongewijzigd groen.

### WP 29 — Taal en verhaal (proza)

- Wolf-regel herformuleren (richting "De zeven geitjes deden open. De
  wolf slokte er zes op." of gelijkwaardig, consistent met
  spelontwerp-seven-little-goats.md:48) op de drie gespiegelde plaatsen
  plus strings.js:47.
- Verhaal-bug jongste geitje: backstory herformuleren zodat het geitje
  in de klokkast blijft; sim + Java + README gelijk.
- "weg gesleten" → "afgesleten"; "de een … de ander" → "de ene … de
  andere"; "dit keer" → "deze keer"; "wiret" → "verbindt"; "De spanning
  stijgt." schrappen; hint-antecedent koeken benoemen; "Je legt het mes
  neer" conditioneel of neutraal; `eet melk`-antwoord gelijktrekken;
  "(praat)" integreren; commentaar-typo en trailing comma.
- Docs mee waar geciteerd proza wijzigt.
- QC: `node --test test/` groen (incl. test-sim-cross-check met live
  `java`), `javac -encoding UTF-8` schoon, verboden-constructies-grep
  leeg.

### WP 30 — Alberta's stem in de Java-broncode

- Al het doceercommentaar in seven-little-goats/src/*.java herschrijven
  naar Alberta's notitieboekstem (metafoor-eerst, geen doceerregister,
  geen klaslokaal-"we", geen cursusjargon zoals "scharnier 7").
- js/levels/level5.js en level7.js: notitie-register terug naar
  marge-notitie (level7 mag hintfase 3 niet verklappen).
- De kopvorm "// Alberta's notitie — X:" blijft.
- QC: javac + grep-gate, `node --test` (check-assets bewaakt de
  fragment-afleiding), cross-check-test groen.

### WP 31 — Levelnamen en spreads

- Nieuwe hoofdstuktitels (verhaal + scharnier), definitieve formulering
  binnen het bladbudget; werkvoorstel:
  1. Klasse en instantie: zeven uit één vorm
  2. Signaturen: wat erin gaat, wat eruit komt
  3. Voorwaarden: de deur op slot
  4. Referenties: twee pijlen, één doos (staat al in scharniertaal)
  5. Luspatronen: geitje voor geitje
  6. Index en off-by-one: de laatste plank
  7. Zoeken en de dubbele pijl: waar het jongste zit
- Doorvoeren in strings.js (spreads-IIFE en lN.naam),
  docs/levels-en-checkpoints.md, walkthrough deel2-titels.
- js/pc/pc.js:95-98: de levelnaam echt tonen.
- Week-clash strings.js:185-186 vs spread-voet gelijktrekken.
- Spread-lengtebewaking: pagina's ≤ 24 gewrapte regels; test toevoegen
  als die ontbreekt.
- QC: `node --test` groen incl. spread-lengtetest.

### WP 32 — Lopen: uitgangen, muren en collisie

- Noord/zuid-uitgangen te voet bereikbaar: per scene expliciete
  exit-zones (`exits: [{richting, rect}]`) die `betreed:<richting>`
  triggeren; oost/west-randkruising blijft.
- Objectcollisie: `blokken: [[x,y,b,h]]` per scene, afgetrokken in
  `inWalkbox`: kist, bureaupoten, stoel, dozenstapels, doos-sprites.
- Walkboxen versmallen waar een muur geschilderd is, zodat "Die kant kan
  je niet op" alleen bij echte doorgangen vuurt.
- tools/lint-scene.mjs: elke KAMERS-uitgang moet een bereikbare
  exit-zone hebben; walkbox∩blokken checken; "koffiemok" eruit.
- docs/scene-schema.md en docs/sprite-schema.md (her)schrijven.
- QC: `node --test` + lint-scene schoon + Playwright-smoke die élke
  kamerovergang te voet aflegt en tegen elk blok aanloopt.

### WP 33 — Flow en hints op de zolder

- `?`-hint progress-aware (branch op volgendFragment +
  FRAGMENT_LOCATIE).
- Bij `ga zitten` met alles af: melding "zoek het volgende fragment".
- `open doos`/`kist`-woordenschat per kamer kloppend.
- Spread-bladerhint laten kloppen met wat er gebeurt.
- Epiloog: save bij terugkeer naar titel.
- Docs mee: spelontwerp-legacy.md commandolijst en `?`/F1,
  save-en-hints.md:94, walkthrough deel1-hints.md:20-21 en :34-37.
- QC: `node --test` (nieuwe hint-tests) + smoke-playthrough groen.

### WP 34 — Nieuwe spelersprite

- Neutrale erfgenaam-figuur, geen mantel of lang haar, ~31 px hoog
  (binnen 16×32), licht van rechts; alle anims (sta/loop × 3 richtingen,
  draai, zit-oost).
- art-stijlgids.md:140-141 (Roodkapje-callback) herschrijven;
  sprite-schema.md aanvullen; achtergrond.md blijft de norm.
- QC: `node --test` (test-sprites incl. deining-lint),
  Playwright-screenshots van alle vier de kamers ter beoordeling door de
  manager.

### WP 35 — Schaalpas over de scènes

- Vaste maatregel in de stijlgids: 1 px ≈ 5 cm (speler ~31 px ≈ 1,55 m);
  props herijken: koffietas naar ~5×6 px, bureau/stoel/pc kloppend
  (de speler moet aan het bureau kunnen zitten), geschilderde dozen vs
  doos-sprites gelijkgetrokken, notitieboek/kist, overloop-stapels.
- Dieptescaling: één regime — hotspot-sprites schalen mee met de actor,
  of de actor-scaling gaat eruit.
- Scale-lint: test die sprite- en geschilderde objectmaten tegen de
  maatregel houdt (minstens de bekende gevallen).
- QC: `node --test` + screenshots van de vier kamers ter beoordeling.

### WP 36 — Handschriftfont

- Echte pixel-handschriftglyphset (kleine letters, beperkte hoofdletters,
  cijfers, leestekens; onregelmatige baseline en hoogte in de glyphs),
  als tweede fontdef naast font.js; tekenHandschrift gebruikt de nieuwe
  glyphs, de seed-variatie blijft voor de spatiëring.
- Spread-typografie: één handbehandeling per pagina; het boek-chroom
  (paginanummer, bladwijzer) bewust monospace, gemotiveerd in de
  stijlgids; stale comment "groepje van drie" fixen.
- De entry documenteert het terugdraaien van de WP F-beslissing ("geen
  glyphset").
- QC: `node --test` + screenshot van een spread ter beoordeling.

### WP 37 — Geluid hoorbaar en volledig

- Master gain 0.16 → richtwaarde 0.3-0.35 met herbalancering per cue;
  foley en drones minstens een octaaf omhoog uit de sub-bas.
- De `doos`-cue afvuren bij het openen van een fragmentdoos.
- Unlock bij élke gebruikersactie: canvas-click, D-pad-pointerdown,
  form-submit; guard tegen oscillator-opbouw vóór unlock.
- Voetstapcadans 4.0 Hz.
- test-geluid: asserties op master-volumebereik en minimale cue-pitch;
  docs/engine-architectuur.md:243 bijwerken. De luistertest op speakers
  blijft een expliciet open punt voor Lars.
- QC: `node --test`; Playwright-check dat de AudioContext na click/touch
  `running` is.

### WP 38 — Doc-drift en dood hout

- art-stijlgids: "elf ops" → twaalf; 34/58-bundelbeschrijving
  actualiseren naar de `light`-realiteit.
- spelontwerp-legacy.md: intro-spread-passage vervangen door de
  beslissing uit strings.js:1171-1177; scene-tabel plus de drie
  opening-scenes.
- Dode velden: `props`, hotspot-`item`, `spreadGelezen`, ongelezen
  `lN.week` — verwijderen of gebruiken, beslissing per veld in de entry.
- Fallback-scene (engine.js:119-131): console.warn zodat een
  typo-scene-id niet stil faalt.
- QC: `node --test` + lint + grep dat geciteerde docs bestaan.

### WP 39 — Walkthrough herbouwd

- deel1/deel2 .md bijwerken (F1 in de editor, commandolijst, nieuwe
  hoofdstuktitels, gewijzigde citaten, looproutes).
- pandoc + typst proberen te installeren; lukt dat → PDF's herbouwen met
  tools/bouw-walkthrough.sh; lukt het niet → expliciet open punt in
  voortgang.md.
- QC: scripted vergelijking titels/citaten walkthrough ↔ strings.js;
  `node --test` blijft groen.

### WP 40 — Slotcontrole

- Volledige poorten: `node --test test/`, alle Playwright-smokes
  (file://), javac + grep, lint-scene, check-assets; screenshots van
  titel, vier kamers, spread, pc, sim en eindkaart naar Lars.
- Slotentry + voortgang.md-eindstand; PR-beschrijving bijwerken.

### Uitvoeringsmodel

- Manager (deze sessie): beslist, reviewt elke oplevering tegen de
  QC-poort, commit en pusht; workers committen nooit; voortgang.md gaat
  mee in hetzelfde commit als het werk.
- Workers: Opus 5-agents, één per pakket; WP 32/34/35/36 mogen een
  tweede, adversariële checker-agent krijgen.
- Crash-bestendig: deze entry bevat het plan integraal; voortgang.md is
  de levende checklist; na elk commit onmiddellijk
  `git push -u origin claude/game-quality-review-ynqfkq`; draft-PR na de
  eerste push.
- Cursusrepo-referentie: /workspace/programming-fundamentals (read-only).

### Verificatie van het geheel

1. `node --test test/` — alles groen (baseline 328, groeit).
2. Playwright-smokes over file:// incl. nieuwe voet-navigatietest.
3. `javac -encoding UTF-8 -d out src/*.java` schoon + verboden-grep leeg.
4. `tools/lint-scene.mjs` en `tools/check-assets.mjs` schoon.
5. Screenshots ter visuele beoordeling.
6. Handmatige luistertest van de mix = expliciet open punt voor Lars.
