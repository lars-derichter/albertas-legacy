# Voortgang

Dit is de levende checklist van deze repo. Het actieve programma staat
bovenaan; afgeronde programma's blijven eronder staan als geschiedenis.
Anders dan de genummerde entries, die chronologisch zijn en blijven staan
zoals ze geschreven zijn, verandert dít bestand mee met het werk.

**Werkt een sessie hier na een crash verder?** Lees dan in deze volgorde:

1. Dit bestand — waar staat het programma, wat is het volgende pakket. 2.
`workflow/28-kwaliteitsreview-kickoff.md`, §Beslissingen en Bijlage B — het
volledige plan met de QC-poort per pakket. 3. `CLAUDE.md`, §Working
agreements — hoe er gecommit en gelogd wordt.

Daarna: `node --test test/test-*.mjs` en `git log --oneline -5` om te zien of de
laatste commit compleet is. Branch van het actieve programma:
`claude/game-quality-review-ynqfkq`; na elk commit volgt onmiddellijk een push.

## Conventies in dit bestand

- `- [x]` afgewerkt, `- [~]` in uitvoering, `- [ ]` nog niet begonnen.
- De commit-hash van een pakket wordt in de *volgende* commit ingevuld — bij
  het schrijven van dit bestand is de eigen hash nog niet bekend. Staat er
  "(nog in te vullen)" bij het laatst afgewerkte pakket, dan is dat normaal.
- Een pakket is pas `[x]` als zijn QC-poort geslaagd is. Niet eerder.

# Programma 3 — kwaliteitsreview (actief)

Kickoff en volledige defectenlijst: `workflow/28-kwaliteitsreview-kickoff.md`.
Manager reviewt en commit; Opus 5-workers voeren uit. Vertrekpunt: 328
headless tests groen, zes rooksmaaktesten (255 controles), lint en
check-assets schoon, op `main` commit `689634b`.

Volgorde: 29 en 30 (taal) eerst, dan 31 (namen), dan het zichtbare werk
32-36, dan 37 (geluid), 38-39 (docs en walkthrough), 40 (slot). Binnen
die blokken is de volgorde bindend zoals genummerd.

### - [x] WP 28 — Kickoff en programma

Entry: `workflow/28-kwaliteitsreview-kickoff.md` · commit: `c2d0919`

- [x] Kickoff-entry met prompt, verkenning, Q&A, beslissingen en het
      goedgekeurde plan als Bijlage B
- [x] Dit bestand herschikt: programma 3 bovenaan als levende checklist
- [x] QC: markdown op 80 tekens (in tekens gemeten, geen enkele regel
      erover), geen codewijzigingen, tests ongewijzigd groen (328/328)

### - [x] WP 29 — Taal en verhaal (proza)

Entry: `workflow/29-taal-en-verhaal.md` · commit: `e84b723`

- [x] Wolf-zin herformuleerd op de drie gespiegelde plaatsen +
      strings.js:47 ("De wolf slokte er zes op.")
- [x] Verhaal-bug jongste geitje opgelost: het blijft in de klokkast,
      het bericht bereikt jou (drie plaatsen gelijk)
- [x] "weg gesleten", "de een/de ander", "dit keer", "wiret", "De
      spanning stijgt.", hint-antecedent, mes-zin, eet/drink,
      "(praat)", commentaar-typo, trailing comma
- [x] Docs mee: spelontwerp-seven-little-goats.md; walkthrough citeert
      geen enkele gewijzigde zin (gegrept)
- [x] QC: 328/328 groen incl. sim-cross-check met live `java` én een
      extra levende diff over alle gewijzigde regels (0 verschillen);
      javac-poort schoon; verboden-grep leeg

### - [x] WP 30 — Alberta's stem in de Java-broncode

Entry: `workflow/30-albertas-stem-in-de-java.md` · commit: `14987a8`

- [x] Doceercommentaar in seven-little-goats/src/*.java (incl. de drie
      Test*-klassen) herschreven naar Alberta's notitieboekstem;
      klaslokaal-"we" en "checkpoint 7" weg; diff bevat uitsluitend
      commentaarregels
- [x] js/levels/level5.js en level7.js notitie-register hersteld (level 7
      verklapt hintfase 3 niet meer)
- [x] Manager-extra: zelfde jargon uit js/sim/goats-world.js:138
- [x] QC: javac exit 0 + verboden- en jargon-grep leeg, 328/328 groen,
      check-assets driftvrij

### - [x] WP 31 — Levelnamen en spreads

Entry: `workflow/31-levelnamen-en-spreads.md` · commit: `54f61d3`

- [x] Zeven nieuwe hoofdstuktitels (checkpointterm vooraan, dan het beeld
      uit het verhaal) in strings.js (spread-titel + `lN.naam` +
      bestandskoppen), js/levels/level*.js, docs/levels-en-checkpoints.md,
      walkthrough deel1 én deel2
- [x] Bladzijde 2 draagt de losse cursustermen, zonder de term van de
      titel te herhalen
- [x] pc.js toont de levelnaam echt (`S().lN.naam`, voor elk level);
      .pc-header kapt af met een beletselteken in plaats van om te breken
- [x] Week-clash opgelost: het notitieboek zegt week 1, zoals de voet van
      het level-1-spread en de koppeltabel
- [x] Spread-lengtetest: `test/test-spreads.mjs` rekent de bladspiegel na
      (24 regels op bladzijde 1, 19 naast de schets) én bewaakt dat geen
      regel breder wordt dan de kolom van 136 px
- [x] Bijvangst: `artikel.getCategorie().getNaam()` (174 px) liep van het
      blad in de brief van level 7 — in twee stukken gezet
- [x] QC: 337/337 groen incl. de nieuwe test, lint-scene en check-assets
      schoon

### - [x] WP 32 — Lopen: uitgangen, muren en collisie

Entry: `workflow/32-lopen-uitgangen-en-collisie.md` · commit: `399906a`

- [x] Nieuwe DOM-vrije module `js/loopveld.js` (`AL.loopveld`): walkboxes min
      blokken, uitgangszones, randdetectie. Niet in `js/logic/` — het is
      scène-meetkunde en geen wereldlogica, en ze geeft geen
      `{tekst, effecten}` terug; `js/parser.js` is het precedent
- [x] `exits: [{richting, rect}]` per scène: `zolder-midden` noord boven aan de
      trapcorridor, `overloop` zuid in het trapgat. De zone vuurt bij het
      binnenkomen en roept dezelfde `AL.world.betreed` aan als een randkruising
      — de logica is onveranderd
- [x] `blokken: [[x,y,b,h]]` per scène: kist en dozenstapels (west), bureau +
      stoel (oost), stapel en de twee doos-sprites (doorgang), de drie torens en
      de doos-sprite (overloop). Geschilderd blokkeert tot achteraan (de
      achtergrond kan de speler niet afdekken), een sprite alleen zijn onderkant
- [x] Walkboxen versmald waar een muur geschilderd staat: `zolder-west` x6–319,
      `zolder-oost` x0–311, `overloop` x6–313. Daarmee vuurt de randkruising
      alleen nog waar écht een kamer ligt
- [x] Lopen tegen een muur of een voorwerp is stil: de modale weigering "Die
      kant kan je niet op" blijft alleen op het getypte `ga <richting>`. De
      cooldown-machinerie eromheen (`KANT_COOLDOWN`) kon weg
- [x] `entries.vanNoord` van de doorgang naar y132 (twee treden onder de zone),
      anders stuitert wie van boven komt meteen terug
- [x] De leuning op de overloop liep als één balk over het hele trapgat — een
      hek voor de uitgang. Nu twee stukken met vier stijlen en een opening van
      x148 tot x175, precies de uitgangszone
- [x] `tools/lint-scene.mjs`: blokken/exits keuren (ariteit, grenzen), elke
      verbinding op de zolderkaart moet een mechanisme hebben, geen strook tegen
      een rand zonder kamer, geen entry in een blok of in een zone, elke zone
      moet een beloopbare pixel hebben. "koffiemok" uit `GEKENDE_ITEMS`
- [x] `docs/scene-schema.md` en `docs/sprite-schema.md` geschreven (allebei
      sinds WP A geciteerd en nooit bestaand); `engine-architectuur.md` §De
      vloer + laadvolgorde + bestandskaart + `betreed`-tag, en
      `spelontwerp-legacy.md` §De zolder-hub bijgewerkt
- [x] `test/test-loopveld.mjs` (16 keuringen, incl. een vloedvulling die van
      elke entry naar elke uitgang loopt) en `test/smoke-walk.mjs` (25
      controles: élke kamerovergang te voet met alleen pijltjes, botsen tegen
      kist, dozen, bureau, torens en muur, en de getypte navigatie ongewijzigd)
- [x] Hiermee is de open post uit WP H gesloten: de walkboxen zijn herzien en de
      speler loopt niet meer door de in de achtergrond gebakken kist en dozen
- [x] QC: **353/353 groen** (16 nieuw), `lint-scene` en `check-assets` schoon,
      smoke-browser 36/36, smoke-walk 25/25, smoke-full-playthrough 94/94,
      smoke-pc 32/32; verse screenshots van de vier kamers in `test-results/`
      (`wp32-*.png`)

### - [x] WP 33 — Flow en hints op de zolder

Entry: `workflow/33-flow-en-hints.md` · commit: `01329de`

- [x] `?`-hint progress-aware: `world.hint` vertakt op `levelActief` +
      `volgendFragment` + `FRAGMENT_LOCATIE` — eerst het hoofdstuk dat open
      ligt afwerken, dan het volgende blad (in deze kamer of ginder), dan
      "alles af". Geen nieuw staat-veld; alle teksten als sleutels in
      `AL.strings.hints`
- [x] De vier vaste `scenes.*.hint`-sleutels en `geenPlaatsHint` verwijderd —
      ze wáren het defect; een test bewaakt dat ze weg blijven
- [x] Afgerond-level-melding bij `ga zitten`: `gebruikPc` houdt de pc dicht als
      het actieve hoofdstuk al hersteld is en er nog een fragment op de zolder
      ligt, en zegt in twee regels wat klaar is en waar dat blad ligt (zelfde
      helper als de hint, dus geen tegenspraak). Alles ontgrendeld → de pc gaat
      gewoon open: het endgame-pad blijft ongemoeid
- [x] Woordenschat per kamer: in de westhoek antwoorden `open kist` en
      `open doos`/`karton` zinnig; in doorgang en overloop is "kist" geen
      open-woord meer (daar staat er geen). `open broncode-doos` kreeg een
      eigen sleutel in plaats van de verdwenen kamerhint
- [x] Spread-bladerhint klopt: "spatie: pc >" → "spatie: terug" (spatie doet
      het boek dicht en zet je in de werkhoek; de pc opent pas op `ga zitten`),
      en de twee regels staan nu in `AL.strings.spreadChroom` in plaats van
      inline in `engine.js`. Grens van dertien tekens (naast het paginanummer)
      bewaakt door `test-spreads.mjs`
- [x] Epiloog saved: `naarTitelNaEpiloog` zet `modus: "titel"` en bewaart;
      `hervat()` toont die stand als titelkaart. Een reload na de aftiteling
      geeft de titel, niet opnieuw de eindkaart
- [x] `AL.debugState.vensterRegels` toegevoegd, zodat een smoke kan nalezen wát
      de verteller antwoordt
- [x] Docs mee: `save-en-hints.md` (§Het hint-contract herschreven — `?` in
      zolder en terminal, F1 in de editor — plus de nieuwe §De zolder-hint),
      `spelontwerp-legacy.md` (§Commando's: `crt aan/uit`, F3, de volledige
      `ga zitten`-lijst, `?`-gedrag, spread-modus zonder `?`; §De lus per level
      stap 5), `engine-architectuur.md` (`modus: "titel"`),
      `walkthrough/deel1-hints.md` (`?` vs F1, commandolijst, de zolder-alinea
      over de nieuwe hint). Geen PDF's — die zijn voor WP 39
- [x] QC: **368/368 groen** (15 nieuw), `lint-scene` en `check-assets` schoon,
      smoke-browser 38/38, smoke-full-playthrough 97/97, smoke-walk 25/25

### - [x] WP 34 — Nieuwe spelersprite

Entry: `workflow/34-nieuwe-spelersprite.md` · commit: `9c5d4a2`

- [x] Neutrale erfgenaam-figuur 15 × 31 (doorzwaai 32), licht van rechts, alle
      anims: sta/loop × noord-oost-zuid, `draai`, `zit-oost`. Trui uit de
      gebladerte-ramp, jeans uit de nacht-ramp, kort haar 23/24, geen ogen en
      geen mond — de norm uit `achtergrond.md` staat nu ook in de pixels
- [x] De rode mantel (palet 4/12) is weg; Roodkapje leeft alleen nog in de sim
- [x] `art-stijlgids.md` (paletrollen 4/12, de vaste toewijzing voor de speler,
      armzwaai, spelermaat, een expliciete regel dat sprites van rechts belicht
      zijn), `sprite-schema.md` (voorbeeldlegenda + de spiegel-afweging),
      `js/palette.js` (twee commentaarregels over de mantel)
- [x] QC: **368/368 groen**, `lint-scene` en `check-assets` schoon,
      smoke-browser 38/38, smoke-walk 25/25, smoke-full-playthrough 97/97,
      screenshots van de vier kamers + spritesheet in `test-results/wp34-*.png`

### - [x] WP 35 — Schaalpas over de scènes

Entry: `workflow/35-schaalpas.md` · commit: `8b27572`

- [x] Maatregel 1 px ≈ 5 cm in `art-stijlgids.md`, met referentietabel, de
      regel dat buren belangrijker zijn dan waarheid, en elke
      leesbaarheidsuitzondering (mok ~2×, notitieboek ~2×, pc ~1,4×) mét haar
      factor
- [x] Werkhoek: mok 14 × 16 → 4 × 5, bureau 148 px breed → 50 px met een blad
      op 14 px boven zijn voetlijn, toetsenbord 46 × 10 → 13 × 3,
      monitorgloed met het scherm mee gekrompen
- [x] `sprite-pc.js` 28 × 26 → 18 × 16, `sprite-stoel.js` 18 × 26 → 12 × 19
      (zitting op 9 px), `sprite-notitieboek.js` 22 × 13 → 16 × 10;
      `doos` en `broncode-doos` blijven de maateenheid
- [x] Geschilderd karton in alle vier de kamers uit losse dozen van 16 × 13
      tot 18 × 15 px: westhoek 11, doorgang 3, overloop 19. Een stapel wordt
      hoger door te stapelen. Kist 96 × 42 → 40 × 19
- [x] Eén diepteregime: `AL.loopveld.diepteSchaal(scene, y)` voor de speler
      én elke hotspot-sprite; `engine.actorSchaal` is nu een doorgeefluik
- [x] Zit-reeks op de stoel: `startZitten` zet de speler op de hotspot met
      `item: "stoel"` — de enige plek waar zijn handen op de voorrand van het
      blad uitkomen. `hotspot.item` is daarmee geen dood veld meer
- [x] Blokken, entries en de smoke-coördinaten volgen de nieuwe voetafdrukken
- [x] `test/test-schaal.mjs`: veertien keuringen die de verhoudingen uit de
      scènedata narekenen (mok, bureau, stoel, zithouding, pc, karton,
      torens, kist, notitieboek, diepteschaal)
- [x] Docs mee: `art-stijlgids.md` (§De maatregel, §Diepte en voorgrond,
      sprite-maten), `scene-schema.md` (hotspots schalen mee, de stoel is de
      zitplek, `item` niet meer dood), `engine-architectuur.md`
      (`diepteSchaal` in §De vloer), `sprite-schema.md` (`opts.schaal` voor
      props, verwijzing naar de maatkeuring); prose: "schuin van het bureau
      weggeschoven" → "schuin voor het bureau"
- [x] QC: **382/382 groen** (14 nieuw), `lint-scene` en `check-assets`
      schoon, smoke-browser 38/38, smoke-walk 25/25, smoke-pc 32/32,
      smoke-full-playthrough 97/97, screenshots van de vier kamers, de
      zithouding en vier voor-na-stroken in `test-results/wp35-*.png`

### - [x] WP 35b — De zolder aangekleed (ingelast)

Ingelast door de manager na de QC van WP 35: de maatregel maakte de
kamers correct maar leeg — een zolder hoort vol te staan. Afwijking van
het goedgekeurde plan, gelogd hier en in de entry van WP 35.

Entry: `workflow/35b-de-zolder-aangekleed.md` · commit: `3084045`

- [x] Vier kamers aangekleed met rommel op de juiste schaal (stapels,
      koffers, zolderspullen), zonder de composities en lichttaal te
      breken. Straal en kist in de westhoek, trapopening en corridor in
      de doorgang, de bureaugroep in de werkhoek en het trapgat op de
      overloop zijn onaangeroerd
- [x] Alles staat in de strook vloer tussen de wandlijn en de
      loopstrook, waar de speler niet komt: **geen enkel nieuw blok**,
      geen stap loopruimte minder, smoke-walk-coördinaten ongewijzigd
- [x] Nieuw in de kamers: hogere dozenstapels met koffers erop,
      wandplanken met weckpotten en blikken, een kapstok met twee
      jassen, opgerolde tapijten, schilderijlijsten met de rug naar
      voren, een schemerlamp, wasmanden, een ladder, een emmer, twee
      staande spiegels onder een laken, twee tafelventilatoren, een
      prikbord, een stilstaande wandklok, een archiefkastje, een
      naaimachine op een tafeltje met garenklosjes erboven, een plank
      met mappen boven het bureau, en dekens over drie stapels
- [x] Veertien nieuwe `onderzoek`-teksten met hun woordkoppeling; geen
      kamerbeschrijving gewijzigd, elk zelfstandig naamwoord blijft
      aanwijsbaar. De wand boven het trapgat blijft leeg omdat
      `onderzoek wand` zegt dat daar nooit iets is opgehangen
- [x] `art-stijlgids.md` mee: de drapé-regel (bovenste rij één stap
      lichter, in de ramp van de kamer), de kleurafspraak voor het
      overige zoldergoed, en twaalf rijen bij de maattabel
- [x] Op-tellingen picture + overlays: west 82 → 171, doorgang
      59 → 135, werkhoek 49 → 142, overloop 80 → 137; alle scènes
      455 → 770. De overlays — het enige dat élk frame getekend wordt —
      zijn onveranderd
- [x] QC: **382/382 groen**, `lint-scene` en `check-assets` schoon,
      smoke-browser 38/38, smoke-walk 25/25, smoke-full-playthrough
      97/97, vier kamerscreenshots en vier voor-na-stroken in
      `test-results/wp35b-*.png`

### - [x] WP 36 — Handschriftfont

Commit: (nog in te vullen) — entry: `workflow/36-handschriftfont.md`

- [x] `js/font-hand.js`: 114 glyphs van 8 × 10, x-hoogte 6, basislijn op
      rij 7 en de liniatuur op rij 8, staarten op 8–9. De onregelmatige
      ligging (±1 px) zit per glyph in de data: omhoog `a m r K V 7`,
      omlaag `c i n u z D G S 3`. Dekking gelijk aan de drukfont
- [x] `tekenHandschrift`/`handschriftBreedte` zetten en meten met
      `AL.fontHand`; shear standaard 0 (de helling zit in de glyphs);
      de index-driehoeksgolf `_jitter` verwijderd, niet vervangen; het
      stale commentaar "groepje van drie" ermee weg
- [x] Eén hand per blad: kop en tekst dezelfde font en maat, de kop
      zonder spatievariatie plus de streep eronder. Het boek-chroom
      (paginanummer, bladerhint) blijft bewust monospace, gemotiveerd in
      `art-stijlgids.md` §Typografie
- [x] Bladbudget nagerekend: geen enkele van de veertien bladzijden loopt
      over, twaalf werden korter (l7 p1 18 → 15 van 24; l1 p1 16 → 12);
      breedste regel 136 px in een kolom van 136. De weekregel gaat van
      drie naar twee regels; geen prose aangeraakt
- [x] De WP 22-beslissing "geen aparte glyphset" is formeel teruggedraaid
      op keuze van de gebruiker; gemotiveerd in de entry
- [x] Docs: `art-stijlgids.md` (nieuwe §Typografie met de drie zetwijzen
      en de ontwerpregels; handschriftparagraaf van het spread vervangen),
      `engine-architectuur.md` (drie zetwijzen, laadvolgorde)
- [x] QC: **391/391 groen** (382 bij aanvang; negen nieuwe tests, twee
      herschreven), `lint-scene` en `check-assets` schoon, smoke-browser
      38/38, smoke-full-playthrough 97/97, screenshots
      `test-results/wp36-alfabet.png`, `wp36-spread-l1.png`,
      `wp36-spread-l4.png`

### - [x] WP 37 — Geluid hoorbaar en volledig

Commit: (nog in te vullen) — entry: `workflow/37-geluid-hoorbaar.md`

- [x] Meestergain 0,16 → 0,30 met de stemgains herverdeeld (bedstemmen
      omlaag, foley omhoog): voetstap +6,8 dB, karton +6,3 dB. Ergste
      geval uitgerekend en als test vastgelegd — 2,75 × 0,30 = 0,825, dus
      1,7 dB onder de klipgrens
- [x] Foley en drones uit de sub-bas: stap 38/41 → 50/53, deur 45/40 →
      57/52, doos 50/45/43 → 60/55/52, zolderdrone 33 → 45 (kwint 40 →
      52), pc-pedaal 36 → 48. Bodem midi 48 voor cues, 45 voor bedden mét
      voorwaarden (bas-stem én minstens twee seconden = drone, geen
      melodie). Het register (zolder leger dan pc) onaangeroerd groen
- [x] Bevinding uit de kickoff rechtgezet: de bas-stem-routing onder midi
      55 geldt alleen voor bedden (`planVooruit`), niet voor cues — de
      voetstap ging nooit door de trage bas-attack
- [x] `doos`-cue afgevuurd bij het openen van een fragmentdoos, met de
      bladzijde 0,35 s erná (`geluid:pagina@0.35`, nieuwe vertragingsvorm).
      Daarbij een drievoudige `pagina` op dezelfde audioklok-tijd
      opgeruimd: de renderlaag speelt niets meer uit zichzelf bij
      `fragment-gevonden` of bij het openen van een spread
- [x] De kist en de dozenstapels in de westhoek dragen nu ook
      `geluid:doos` (beslissing gelogd in de entry)
- [x] Unlock op vier oppervlakken: keydown (vóór de tekstveld-uitzondering),
      vensterbrede `pointerdown`/`touchstart` in de capture-fase, D-pad en
      commandobalk, en de tik/klik op het canvas. De vensterbrede
      pointerdown was nodig omdat `js/touch.js` op een desktop helemaal
      niet laadt
- [x] Geen oscillator-opbouw meer vóór de ontgrendeling: `speel`/`muziek`
      maken geen context en bouwen geen node; `AL.sound.opOntgrendeld`
      start bij de eerste gebruikersactie het bed van de huidige stand
      (`startBedVoorStand`). `unlock()` is idempotent; `debug()` meldt
      `ontgrendeld` en `nodes`
- [x] Voetstapcadans 3,75 → 4,0 Hz door de stap aan het animatieframe te
      hangen in plaats van aan een modulo van tikken; gemeten in de
      browser: acht stappen in twee seconden, nul op een doorzwaaiframe
- [x] Docs: `engine-architectuur.md` §Geluid met drie nieuwe paragrafen
      (niveau en register, wie vuurt wat af met de cue-tabel, de
      ontgrendeling) en de effect-tag met de vertragingsvorm.
      `save-en-hints.md` nagekeken: die noemt geluid alleen als
      save-trigger en hoefde niet mee
- [x] QC: **400/400** headless (was 391), `lint-scene` en `check-assets`
      schoon, smoke-browser 38/38, smoke-full-playthrough 97/97,
      smoke-walk 25/25, en de nieuwe `test/smoke-geluid.mjs` 17/17 (geen
      context vóór de eerste actie, muisklik én touch-tik ontgrendelen,
      geen nodegroei vóór de ontgrendeling, de stap op de steunfase)

### - [x] WP 38 — Doc-drift en dood hout

Commit: (nog in te vullen) — entry: `workflow/38-doc-drift-en-dood-hout.md`

- [x] art-stijlgids: elf → **twaalf** ops (zeven overgenomen + vijf nieuwe,
      nageteld in `voerOpsUit` en in `OP_LENGTE`); de lichtstraal (vijf
      `light`-plakken, 0,80 → 0,30) en de pc-halo (vijf koepels 0,12 →
      0,55, sprite-aan-staat 55/56/58) beschreven zoals ze getekend zijn
- [x] spelontwerp-legacy.md: de intro-spread-passage vervangen door de
      echte opening (vijf onderschriften over drie beelden) mét het
      `Beslissing`-blok en de test die de terugkeer bewaakt; de drie
      opening-scenes in de scène-tabel; `overloop` niet meer "optioneel";
      `draai` en `zit-oost` in de sprite-tabel. Commandolijst nagekeken —
      klopt sinds WP 33, niets te doen
- [x] Dode velden beslist (elke beslissing met reden in de entry):
      `scene.props` **weg** uit tien scènes, de terugvalscène, het schema
      én de lint (die zakt er nu op); `hotspot.item` **leeft** sinds WP 35
      (`startZitten` zoekt er de stoel mee) en is als gewoon veld
      gedocumenteerd; `spreadGelezen` **weg**, `VERSIE` blijft 1 met de
      migratieredenering in `save-en-hints.md`; `week` **weg** uit de
      level-definities (de fixture stond al op week 3 voor level 1) en
      behouden in `AL.strings.spreads.lN.week`, waar hij gelezen wordt;
      `dev: true` **weg**; `naam` behouden (verwijzing, geen kopie)
- [x] Sweep naar dode strings-sleutels met een scriptje over `AL.strings`
      en `AL.sim.strings` (bladsleutels, dus dynamische toegang blijft
      zichtbaar): één vondst, `pc.knopMenu`, verwijderd. Nul in de sim
- [x] console.warn bij de terugvalkamer, mét de ontbrekende id en de twee
      dingen die je dan nakijkt; één melding per id. End-to-end bewezen in
      `smoke-browser` (kamer uit `AL.scenes` halen, ernaartoe lopen, geen
      crash + terugvalkamer tekent + waarschuwing noemt de id)
- [x] Brede waarheidscontrole van de overige docs: `checker-contract.md`
      (verklaar-in-één-zin is een zelf-check, de twee tolerantieschakelaars
      bestaan niet, javacsim kent vijf controles, plus acht kleinere),
      `save-en-hints.md` (`voortgang:opgeslagen` is een verzoek, geen
      verslag; F1 werkt in beide pc-panelen), `engine-architectuur.md`
      (`spread:intro`/`outro` bestaan niet, laadvolgorde, `font-hand.js`,
      `input.js`), `levels-en-checkpoints.md` (7 spreads geen 8; de
      1+2-mix is niet bindend voor de levels 1 en 7; 23 commando's),
      `achtergrond.md` (de sprite heeft wél een vooraanzicht; geen
      "dusk-ramp"; geen einde héét "koud en onaf"), `README.md` (28+9
      testbestanden, 400 tests; F1 in de editor; scènelijst),
      `roberta-williams.md` schoon
- [x] `tools/check-docpaden.mjs`: elk pad dat een document aanhaalt moet
      bestaan. `docs/`, `walkthrough/` en de README's zijn de poort;
      `workflow/` wordt gerapporteerd maar is historie
- [x] QC: **400/400** headless, `lint-scene` en `check-assets` schoon,
      smoke-browser **41/41** (was 38/38), smoke-full-playthrough **97/97**,
      `check-docpaden` 757 paden — 0 dood in een contractdocument

### - [x] WP 39 — Walkthrough herbouwd

Commit: (nog in te vullen) — entry: `workflow/39-walkthrough-herbouwd.md`

- [x] `tools/check-walkthrough.mjs`: vijf keuringen die de gids tegen het
      spel houden — hoofdstuktitels + weken tegen `AL.strings.lN`, elk
      Java-blok tegen de modeloplossingen, de vier eindescripts tegen
      `seven-little-goats/test-scripts/`, elk citaat en commando tegen de
      tekstcorpus (mét de trace-sjablonen over hun hele pool uitgerekend),
      en een poort die bewijst dat deel 1 geen hintstadium 3 lekt. Elke
      keuring is met een negatieve test nagemeten
- [x] Deel 1: navigatie herschreven (alle vier de richtingen te voet sinds
      WP 32, D-pad op een aanraakscherm, zwijgende muren), de WP 33-melding
      bij stap 5, "twee of drie hints" → twee, en het onbestaande commando
      `bekijk` vervangen door `inventaris` / `stats`
- [x] Deel 1: negen hints gingen verder dan stadium 2 — bij `l3-vindfout`
      en `l6-vindfout` stond het antwoord er zelfs bij. Bij alle negen is
      die ene slotzin geschrapt, de rest van de hint blijft
- [x] Deel 1: de sim-alinea vertelt weer wat `goats-strings.js` vertelt (de
      neef van de oude wolf, zes opgeslokte geitjes, het jongste in de
      klokkast, de keuze aan de rivier is van de speler); het mandje is
      alleen voor de koeken nodig
- [x] Deel 2: de vier oordeel-citaten woordelijk uit `AL.strings.oordeel`
      (één had er zelfs een accent bij dat Alberta niet schrijft), het
      opgave-citaat bij `&&`/`||` verbeterd, en de kaart heeft geen
      zwevende "west"-regel meer. De negen Java-blokken, de vier
      eindescripts, de vechtrekenkunde en de trace-tabellen bleken
      ongeschonden — dat is nu ook mechanisch bewezen
- [x] PDF's herbouwd: pandoc 3.10 + typst 0.15.0 van GitHub gehaald (de
      machine had 3.1.3 en 0.10.0), script exit 0, 8 en 13 pagina's.
      `bouw-walkthrough.sh` kiest zelf tussen `--syntax-highlighting=none`
      en het oudere `--no-highlight`; `zine.typ` heeft een font-ketting
      (Courier New vooraan, Liberation Mono erachter) omdat Courier New
      hier niet meer geïnstalleerd staat
- [x] `README.md`: hoe je de PDF's herbouwt en de citaten keurt — daarmee
      staat het júíste pad (`walkthrough/tools/bouw-walkthrough.sh`) in een
      contractdocument. De oude vermeldingen zonder `walkthrough/` staan
      alleen in `workflow/` en blijven historie
- [x] QC: `check-walkthrough` **276 gekeurd, 0 afwijkingen**; **400/400**
      headless ongewijzigd; `check-docpaden` 817 paden — 0 dood in een
      contractdocument; `lint-scene` en `check-assets` schoon;
      `bouw-walkthrough.sh` exit 0 (deel 1 149 KB / 8 p., deel 2 190 KB /
      13 p., inhoud met `pdftotext` nagelezen)

# Programma 4 — lineariteit en spec-notities (afgerond)

Kickoff: `workflow/46-lineariteit-kickoff.md`. Branch:
`claude/lineariteit-en-notities` (vanaf main fb70ed7); schone PR aan het
einde. Twee beslissingen: de poort zit aan de doos (blad N+1 pas
vindbaar als hoofdstuk N hersteld is) en de notities worden pure spec.

### - [x] WP 46 — Kickoff programma 4

Entry: `workflow/46-lineariteit-kickoff.md` · commit: `e9b77a7`

- [x] Feedback verbatim, Q&A, wortels en plan vastgelegd; branch staat
- [x] QC: docs only, wrap 80, tests ongewijzigd 425/425

### - [x] WP 47 — De poort aan de doos

Entry: `workflow/47-poort-aan-de-doos.md` · commit: `f5bb77d`

- [x] Voortgangspoort in _openFragmentDoos (n alleen als n-1 afgerond);
      notitieboek blijft vrij; de poort staat vóór de kamercheck en wint
      van dozen.nietHier — afwijking van de kickoff, gemotiveerd in de
      entry (een gepoorte speler naar een andere kamer sturen klopt niet)
- [x] Weigering-string dozen.nogDicht(n) in Alberta-register, geen effect
- [x] Comments "geen harde sloten" + docs (spelontwerp-legacy,
      save-en-hints) + walkthrough deel 1 mee (PDF's herbouwd; alleen
      deel 1 wijzigt, deel 2 verschilde enkel in datums)
- [x] Tests: drie volgorde-tests met afronding-tussenstappen, zes nieuwe
      poort-tests (weigering, kamer-precedentie, doorgang, alle zes de
      dozen, notitieboek vrij, uitputtende regressie), smoke-assert in
      smoke-browser; smoke-levels-4-7-sneltoets is een expliciete
      testhaak (zetVoortgangKlaar, geen nieuwe haak in engine.js)
- [x] QC: 431/431 headless, lint-scene/check-assets/check-walkthrough/
      check-docpaden schoon, smokes 46/36/53/104/38 groen

### - [x] WP 48 — Notities als spec

Entry: `workflow/48-notities-als-spec.md` · commit: `3585163`

- [x] Zeven briefA's naar steno-spec (klassekaart op bladzijde 1,
      schadelijst op bladzijde 2); spoilers uit briefB's (l3 `||`/`&&`,
      l6 modeloplossing + rondes) en uit acht stub-notities;
      MAX_LEVENSPUNTEN (l3), int/Voorwerp (l5) en variantneutraliteit
      bewaard
- [x] l1-schets is een klassekaart geworden (haalbaarheid eerst gemeten:
      kader 128×62, labels 25–55 px, vier van de vijf regels gebruikt);
      nieuw `labels`-veld in een schets-set, gekeurd door lint-scene én
      een nieuwe test in test-spreads
- [x] Checker-dekking per level geverifieerd — tabel in de entry. Twee
      bewuste gaten, allebei gemotiveerd: de lusgrens van l6 (dat is de
      reparatie van variant A) en die van l7-write (ongewijzigd)
- [x] Hints nagekeken: stadium 1 van l4-verklaar en l4-trace was het
      antwoord zelf en is een vraag geworden; l2-trace was al een vraag
- [x] Docs mee (levels-en-checkpoints §"Wat een spread draagt",
      achtergrond §"Het notitieboek", art-stijlgids) + walkthrough deel 1
      (PDF herbouwd; deel 2 verschilde enkel in datums, teruggezet)
- [x] Adversariële checker-agent gedraaid (drie passen). Bevestigd: de
      vijf lekken weg, variantneutraliteit overal in orde. Drie
      bevindingen hersteld (null-eis terug in de l7-notitie, eerste
      persoon terug in vijf brieven, l3-briefB wees nog naar de
      conditie); vier erkend en doorgeschoven naar de manager (de
      trace-opgaven tonen de modeloplossing van hun eigen level en de
      puzzelvolgorde is vrij; het l2-fragment bevat het parsons-antwoord;
      de termen-kop van bladzijde 2 draagt nog leerstof) — zie de entry
- [x] QC: 432/432 headless, lint-scene/check-assets/check-walkthrough/
      check-docpaden schoon, javac + verboden-grep schoon, smokes
      46/36/53/104 groen, screenshots wp48-* in test-results/

### - [x] WP 48b — Puzzelvolgorde binnen een level

Entry: `workflow/48b-puzzelvolgorde.md` · commit: `27bdd21`

Ingelast door de manager ná de adversariële pas van WP 48: die pas vond
dat `l6-trace` en `l7-trace` de modeloplossing van hun eigen hoofdstuk
afdrukken terwijl `kies()` de volgorde niet poortte. Zelfde vraag van de
docent als WP 47, één niveau lager.

- [x] Poort in de logica: `puzzelSpeelbaar(toestand, levelId, index)` +
      `puzzelIndex` + `puzzelSpeelbaarId` in `js/logic/levels.js`.
      Predicaat over de bestaande staat — geen veld erbij in de save, dus
      een oude save hervat gewoon; ze kijkt alleen vooruit (afgewerkte
      taken blijven heropenbaar)
- [x] Het pc-menu consumeert de poort: wachtende taak gedoofd met het
      plaatje `wacht` + `aria-disabled`, nieuwe strings `pc.statusWacht`
      en `pc.menuVergrendeld`, CSS `.pc-menu-status-wacht` in het
      bestaande `pc-menu-status-*`-patroon. De poort zit in `kies()`
      (klik, cijfertoets en debug-haak lopen daar alle drie door); de
      statusregel onder het menu zegt waarom er niets gebeurt
- [x] Volgorde per level nagekeken (tabel in de entry). Zes van de zeven
      stonden al goed; alleen **level 2** herschikt naar `parsons,
      editor-repair, trace` — het editor-fragment toont `zoek`
      ongeschonden en dat zijn woordelijk de stroken van `l2-parsons`
- [x] `l6.repairTitel` "herstel de off-by-one" → "herstel de
      verwijder-lus": de oude titel verklapte variant A en loog tegen
      variant B, en stond in het menu vóór de eerste regel code
- [x] Tests: zes poort-tests in test-levels (waarheidstabel,
      heropenen, randgevallen, JSON-rondreis), volgorde-pins in
      test-level2/6/7 mét het letterlijke fragment; smoke-pc kreeg het
      vergrendelde menu, de dode cijfertoets, de dode klik en het
      één-voor-één ontgrendelen, plus het hervatten mid-hoofdstuk na een
      herlaad. smoke-pc sprong over `l0-editor-write`
      heen en lost hem nu op; de twee variatie-controles
      (`herstelVarianten`, `variantCode`) krijgen de testhaak
      `ontgrendelTot` (directe state-manipulatie, geen spelpad, zoals
      `zetVoortgangKlaar` in WP 47); full-playthrough en smoke-browser
      ongewijzigd
- [x] Docs mee: levels-en-checkpoints §"Puzzelvolgorde binnen een level"
      + leveltabel (rij 2 en 6), spelontwerp-legacy §"De gesimuleerde pc"
      (het menu stond er niet in) + stap 4, save-en-hints (de save draagt
      geen poortvelden); walkthrough deel 1 én deel 2 (level 2 omgewisseld
      en hernummerd, l6-kop hernoemd, stap 4 beschrijft de poort). Beide
      PDF's herbouwd — deel 2 groeit van 190 naar 214 KB bij gelijk
      paginatal, gemeten toolchain-effect (Courier New ontbreekt hier,
      Liberation Mono is de metrisch gelijke terugval), geen inhoud
- [x] QC: **441/441** headless, lint-scene/check-assets/check-walkthrough
      (276)/check-docpaden schoon, smokes 42/46/40/58/104 groen,
      screenshots `wp48b-menu-vergrendeld(-l0).png` in test-results/

### - [x] WP 48c — De diskette

Entry: `workflow/48c-de-diskette.md` · commit: `c114725`

Ingelast door de manager op vraag van de docent, tussen WP 48b en WP 49.
Lars: de afgewerkte broncode kon er niet "de hele tijd al" geweest zijn;
ze hoort op een diskette van 1,44 MB die je uit de pc meeneemt, met een
etiket in Alberta's handschrift.

- [x] Nieuwe kaart `js/scenes/scene-diskette.js`: een 3,5"-HD-diskette
      groot in beeld (130 × 112 px — breder dan hoog, want mode 13h heeft
      pixels die 20 % hoger zijn dan breed), sluiter, twee gaten, scheef
      etiket; plastic uit de nacht-ramp, sluiter uit de steen-ramp,
      etiket uit de papier-ramp, licht van rechts. In `index.html`
      geregistreerd; `lint-scene` keurt haar mee
- [x] Het etiket is handschrift uit de renderlaag
      (`tekenDisketteEtiket`), niet uit de picture: "7 little goats" in
      inkt 41 en "hfst. 1 — 7" eronder in 40, allebei met dezelfde
      helling als het blad
- [x] Flow: `world.startDiskette` tussen oordeel en epiloog, effect
      `diskette`, modus `"diskette"` met twee beats — de amberband waarin
      de drive wegschrijft (kaal DOS, `C:\GOATS> copy *.java a:`), dan
      het onderschrift onder de kaart. Enter/spatie/schermtik per beat.
      De beat-teller staat níét in de save: een reload begint de beat
      opnieuw en strandt niet
- [x] Proza: de epiloog hangt aan de diskette in plaats van aan "de
      broncode ligt op zolder"; `dozen.broncodeDicht` en de
      onderzoek-tekst van de doos beloven niets meer wat erin zou liggen
      (haar materiaal van toen; de doos gaat nooit open, en dat blijft
      zo); `dozen.allesGevonden` verwijst niet meer naar het einde in de
      doos
- [x] Bijvangst uit WP 48b: alle vijftien terminalpuzzels (+ de proefdruk)
      krijgen een menutitel in de vorm `<onderwerp> — <wat je doet>`, met
      een vaste opdracht per soort; geen enkele verklapt zijn antwoord
- [x] Docs mee: achtergrond (mandaat vervangen, beslissingsblok met Lars'
      redenering), spelontwerp-legacy (modustabel, scènetabel, endgame
      stap 5–6 + beslissing), art-stijlgids (paletregel + scène-rij),
      engine-architectuur (effect-tag, modus-enum), save-en-hints
      (de beat staat niet in de save), scene-schema, spelontwerp-seven-
      little-goats. Walkthrough deel 1 (de doos-belofte) en deel 2 (nieuwe
      sectie "En dan de diskette"); beide PDF's herbouwd
- [x] Tests: vijf nieuwe in `test-world-hub` (keten, drive-regels,
      etiket, epiloog, doos), nieuw `test-puzzeltitels.mjs` (elke puzzel
      een titel, uniek per level, vaste vorm, breedte); smoke-sim dekt de
      beat inclusief pixelcontrole en een reload middenin;
      full-playthrough en smoke-pc mee
- [x] QC: **450/450** headless, lint-scene/check-assets/check-walkthrough
      (277)/check-docpaden schoon, smokes groen — sim 19/19, pc 44/44,
      browser 46/46, full-playthrough 105/105 (smoke-touch draait hier
      niet: geen WebKit-build) — screenshots `wp48c-diskette.png`,
      `wp48c-epiloog.png`, `wp48c-menu-titels.png`

### - [x] WP 49 — Slot en PR

Entry: `workflow/49-slot-programma-4.md` · commit: `31a1451`

- [x] Alle poorten in één run: 450/450 headless, 380/380 over acht
      smokes, javac + grep schoon, vier linten op nul
- [x] Screenshots naar Lars; draft-PR aangemaakt

**Programma 4 is hiermee af.** Open blijven: de iPhone-luistertest en
smoke-touch (geen WebKit). De PDF-fontterugval is niet meer open: de herbouw
in WP 51 liep op een machine mét Courier New, en sindsdien dragen beide
vastgelegde PDF's die font (nagemeten met `pdffonts` in WP 52).

### - [x] Na het programma: de ide kent geen zolder

Entry: `workflow/50-esc-zonder-zolder.md` · commit: `fa1173b`

- [x] Vier chrome-teksten van de pc spreken programmataal ("Esc —
      afsluiten", balk "Afsluiten") — het programma weet niet dat het
      op een zolder staat
- [x] QC: 450/450 groen, check-walkthrough 0, smoke-pc 44/44

### - [x] Na het programma: scharnieren heten checkpoints

Entry: `workflow/51-checkpoints.md` · commit: `4c9a5fe`

- [x] De cursusterm "scharnier" is overal "checkpoint": docs (het
      koppelingsdocument heet nu `docs/levels-en-checkpoints.md`), README,
      CLAUDE.md, commentaar in js/ en test/, de checker-corpus, de
      walkthrough (beide PDF's herbouwd). Genummerde entries blijven
      geschiedenis.
- [x] QC: 454/454 groen, check-docpaden 0 in contracten, check-walkthrough
      277/0, lint-scene en check-assets schoon, smoke geslaagd

### - [x] Na het programma: de docs over de PDF-fontterugval

Entry: `workflow/52-fontterugval-en-de-docs.md` · commit: (nog in te vullen)

- [x] Lars vroeg de twee walkthrough-PDF's te herbouwen omdat ze "in een
      omgeving zonder alle lettertypes" gemaakt zouden zijn. Nagemeten: dat
      klopt niet meer sinds WP 51. Een verse build geeft dezelfde 8 en 13
      pagina's, dezelfde ingebedde fonts, dezelfde subset-tags en een
      identieke tekstlaag (`pdftotext -layout`); alleen de `CreationDate`
      verschilt. De PDF's zijn daarom níét overschreven
- [x] Drie levende uitspraken in dit bestand rechtgezet (slot programma 3,
      slot programma 4, "Nog open na programma 2"). De historische
      `- [x]`-regels van WP 39 en WP 48b blijven staan: die meten correct
      wat er tóén gebouwd is
- [x] `walkthrough/tools/bouw-walkthrough.sh`: de kop beweerde dat een
      font-waarschuwing betekent dat de bladspiegel niet die van het ontwerp
      is. Dat is onwaar: typst waarschuwt over elke ontbrekende schakel van
      de ketting, ook als de eerste schakel gevonden is. De kop wijst nu naar
      `pdffonts` als de echte controle
- [x] QC: docs en één shell-commentaar, geen inhoudelijke wijziging;
      `bash -n` op het script schoon, `check-docpaden` 0 dode paden in een
      contractdocument, wrap 80 gemeten, tests ongewijzigd 454/454

## Fixronde na de speeltest (afgerond)

Kickoff: `workflow/41-fixronde-kickoff.md`. Lars speelde op iOS; vier
problemen, twee beslissingen (Alberta wist het; notitiekop weg, "— A.").

Eindstand (gemeten na WP 45, één run): 425/425 headless, 349/349 over
acht Chromium-smokes, javac + verboden-grep schoon, alle vier de linten
op nul afwijkingen. Open voor Lars: de iPhone-luistertest (belschakelaar
in beide standen) en het loopgevoel op het echte toestel.

### - [x] WP 41 — Kickoff fixronde

Entry: `workflow/41-fixronde-kickoff.md` · commit: `cd6513e`

- [x] Feedback verbatim, Q&A, wortels en plan vastgelegd
- [x] QC: docs only, wrap 80, tests ongewijzigd 400/400

### - [x] WP 42 — Besturing: geen spookrichtingen

Entry: `workflow/42-besturing.md` · commit: `2f9b075`

- [x] `AL.input.reset()` leegt de pijl-stack; gekoppeld aan `blur` en aan
      `visibilitychange` zodra `document.hidden` waar is — de enige twee
      momenten waarop een verloren keyup nog op te ruimen valt
- [x] `stopBesturing()` in `js/engine.js` roept die reset aan bij elke
      moduswissel weg van de vrije zolder (`startTitel`, `opADeSpread`,
      `opADePc`, `startSim`, `toonOordeel`, `toonEpiloog`). Bewust níét
      aan `input.blokkeer` gehangen: een kamerbeschrijving is óók een
      venster, en dan zou binnenwandelen met de pijl ingedrukt stilvallen
- [x] `drukPijl` verplaatst een al aanwezige richting naar de top, zodat
      de speler ook van een spook wint dat er nog wél staat
- [x] D-pad: `releasePointerCapture` in een `try` plus `pointerenter` met
      `buttons > 0` — schuiven van ◀ naar ▶ draait de richting mee; de
      zichtbaarheidspoll laat alles los op de flank waarop de balk weggaat
- [x] `test/test-input.mjs` (nieuw, 14 keuringen, met window-stub voor de
      zekering) en `test/smoke-walk.mjs` §8–§9 (13 keuringen erbij:
      twee-pijlen-arbitrage, spook-na-blur, D-pad-schuif via CDP-aanraking)
- [x] `docs/engine-architectuur.md`: §"De besturing: de pijl-stack en de
      spookrichting", met verwijzingen uit de overname-tabel en de
      aanraakschermparagraaf
- [x] QC: **414/414** headless (was 400), `lint-scene` schoon, smoke-walk
      **38/38** (was 25/25), smoke-browser 41/41, smoke-geluid 17/17,
      smoke-full-playthrough 97/97, smoke-pc 32/32, smoke-sim 13/13.
      Negatieve controle gemeten: zonder de fixes zakken exact de vier
      bewakende keuringen, en met het oude `touch.js` loopt de speler na
      de schuif door naar het westen. `smoke-touch` (WebKit) kon opnieuw
      niet draaien; de échte iPhone-test blijft bij Lars

### - [x] WP 43 — iOS-audio

Entry: `workflow/43-ios-audio.md` · commit: `c75efa8`

- [x] Unlock op zes oppervlakken: `pointerdown`, `pointerup`,
      `touchstart`, `touchend` en `click` op het venster (capture) plus de
      `keydown` in de handler. De oude helft (alleen de begin-events) is
      precies wat Safari voor audio niet meerekent
- [x] De ketting in `unlock()` op orde en opgeschreven: context → resume
      → stille primer (`createBuffer(1, 1, 22050)` naar `destination`) →
      stil element → vlag en haak. De resume blijft vóór de
      `ontgrendeld`-uitstap, zodat een later gebaar een opnieuw
      opgeschorte context wekt; de primer speelt bij het eerste gebaar en
      bij elk gebaar dat een opgeschorte context aantreft
- [x] Stil `<audio playsinline loop>` (`#al-stil-audio`) tegen de
      belschakelaar: WAV-data-URI van 0,1 s stilte, in de code gezet uit
      een RIFF-kop en 800 samples van 128 — niet gedempt en op volume 1,
      want anders claimt het het mediakanaal niet. Aangemaakt in het
      eerste gebaar, gepauzeerd door "geluid uit" en hervat door "geluid
      aan"
- [x] `visibilitychange` + `focus`: verborgen pauzeert het element,
      zichtbaar hervat het en `resume()`t een opgeschorte context — alleen
      als er al ontgrendeld is, want buiten een gebaar wordt hier nooit
      een context gemaakt
- [x] `debug()` meldt `primers` en `stil`; DOM in `js/sound.js`
      verantwoord (renderlaag, niet `js/logic/`) met dezelfde
      headless-zekering als de AudioContext-guards
- [x] Docs: `engine-architectuur.md` §De ontgrendeling (zes oppervlakken)
      en de nieuwe §De iOS-ketting (vijf stappen, de
      belschakelaar-redenering, de drie niet-cosmetische
      elementeigenschappen, de DOM-afweging)
- [x] QC: **423/423** headless (was 414), `smoke-geluid` **30/30** (was
      17/17), smoke-browser 41/41, smoke-walk 38/38,
      smoke-full-playthrough 97/97, lint-scene en check-docpaden schoon.
      Negatieve controle gemeten: zonder de fixes zakken tien van de
      dertien nieuwe controles. De luistertest op een échte iPhone blijft
      bij Lars, met de belschakelaar in **beide** standen

### - [x] WP 44 — Spread sluit waar je staat

Entry: `workflow/44-spread-flow.md` · commit: `464bf28`

- [x] `spreadVerder()` zonder teleport: één regel, `betreedZolder(false,
      true)`. De scène-toewijzing naar `zolder-oost` is weg
- [x] Nieuwe `herstelStand()` naast `wisselNaarScene`: zet de kamer klaar
      rond de speler uit `toestand.speler.x/y`, met de uitgangsgrendel en
      een terugval op de entry als die stand niet beloopbaar is.
      `betreedZolder(beschrijf, houdStand)` kiest tussen de twee; de rest
      van die functie (invoer vrij, bed, save) geldt voor beide paden
- [x] De `spread`-tak van `hervat()` gebruikt dezelfde helper: herladen
      mét het boek open en dan sluiten laat je nu ook staan waar je stond.
      De pc-overlay houdt bewust zijn entry (de stoel ligt in een blok)
- [x] Chroom nagekeken: "spatie >" en "spatie: terug" kloppen nu allebei
      letterlijk; geen stringwijziging nodig
- [x] Docs mee: `spelontwerp-legacy.md` (§De lus per level stap 2–3 met
      `Beslissing`-blok, modustabel, §Spread), `engine-architectuur.md`
      (nieuwe §"De stand bewaren"; de `spread`-tag zegt dat er geen
      sluit-tag is), `save-en-hints.md` (de save draagt `modus`,
      `sceneId` en `speler`, en waarom dat nu meetelt)
- [x] Walkthrough: `deel1-hints.md` stap 2 (wat de spatiebalk doet, het
      boek brengt je nergens) en stap 3 ("loop zelf", `?` wijst de weg);
      `deel1-hints.pdf` herbouwd met pandoc 3.10 + typst 0.15.0.
      `deel2-oplossingen.pdf` ook herbouwd maar teruggezet: identiek op
      108 tijdstempel-bytes na
- [x] Vier smokes: de teleport-assertie werd "na de spread sta je waar je
      het blad vond" (zelfde scène én coördinaat, ±2 px) en er staat nu
      een echte route naar de werkhoek vóór `ga zitten` (`ROUTE_WERKHOEK`
      per kamer; in `smoke-levels-4-7` ook in `ontgrendel()`). Drie
      keuringen erbij: het blad uit de doos in de doorgang sluit bij díe
      doos (te voet naar x240, hotspot 236 — geen entry), na het boek
      loopt de speler in `smoke-browser` te voet de kamergrens over, en
      een reload middenin het boek hervat het op zijn plek
- [x] QC: **423/423** headless ongewijzigd, `lint-scene` schoon,
      `check-walkthrough` **278 gekeurd, 0 afwijkingen** (was 276),
      smoke-browser **44/44**, smoke-levels-1-3 **36/36**,
      smoke-levels-4-7 **52/52**, smoke-full-playthrough **104/104**,
      smoke-walk 38/38. Negatieve controle gemeten: met `spreadVerder()`
      teruggedraaid zakt smoke-levels-1-3 naar 32/36, met de `hervat`-tak
      erbij smoke-browser naar 41/44 — exact de bewakende keuringen

### - [x] WP 45 — De stem: overdracht van een programmeur

Entry: `workflow/45-de-stem.md` · commit: `b57bd2d`

- [x] `achtergrond.md`: nieuw beslissingsblok — Alberta wist dat ze het
      niet zou afmaken, het notitieboek is een bewuste overdracht, en een
      voorgevoel is een feit *zonder* uitleg (het staat in wat ze déed).
      De drie richtlijnen met "nooit een oorzaak noemen" staan er
      woordelijk ongewijzigd en gelden onverkort. §De verdwijning, §Het
      notitieboek (twee alinea's + de weekregel-bullet) en §Toon en
      register mee
- [x] Opening: beat 2 neemt boek én inhoud samen, beat 3 draagt het
      voorgevoel ("Ze heeft het niet afgemaakt; dat wist ze toen ze het
      schreef."), beat 4 houdt de prototype-zin verbatim. Vijf beats van
      5, 5, 5, 4 en 2 regels — geen onderschrift pagineert, en dat is nu
      een test in plaats van handwerk
- [x] `maakSpread` zonder sjabloonzinnen: "Voor jou die dit later leest:"
      is weg (staat één keer, in haar woorden, in hoofdstuk 1) en de voet
      is "Week N in mijn schema." Zeven briefA's van definitie naar
      ontwerpnotitie over haar eigen klassen; zeven briefB's als
      stand-van-zaken; "— A." in hoofdstuk 1 en 7. Titels, `termen` en
      weeknummers onaangeraakt
- [x] Elf stub-notities: kop `// Alberta's notitie — X:` overal weg, elk
      blok eindigt op "— A.", geen schoolimperatieven meer; de
      plaatshouder `// schrijf hier je code` is `// hier verder`. Per
      level nagelezen tegen `checks[]` dat de notitie nog draagt wat de
      checker eist (level 3 noemt `MAX_LEVENSPUNTEN` nu bij naam, want in
      variant B staat die constante nergens anders)
- [x] Verwijzingen: verse grep laat buiten `workflow/` alleen "Alberta's
      notities als commentaar" over (vier plekken, nog waar). Twee
      hintteksten die wél logen zijn bijgewerkt ("de notitie *vraagt*" →
      "somt op"; "Lees de notitie" bij een puzzel zonder editor → "Lees de
      vraag"). `deel1-hints.md` stap 2 + `deel1-hints.pdf` herbouwd;
      `deel2-oplossingen.pdf` herbouwd en teruggezet (108
      tijdstempel-bytes)
- [x] Tegencontrole (tweede agent, vóór de commit): 15 punten, alle
      overgenomen behalve één afgewezen door de manager (de cursustermen
      in de kop van bladzijde 2 blijven — dat is de brug van WP 31). Recht
      gezet: de klem van hoofdstuk 3 gaat over háár levenspunten en de
      kruik melk (+6), niet over een geitje; vijf verouderde
      voet-citaten in `levels-en-checkpoints.md`,
      `spelontwerp-legacy.md`, `art-stijlgids.md` (twee) en `README.md`;
      drie klaslokaal-imperatieven in de brieven van 4, 6 en 7; vier
      restanten definitie-register (1, 2, 4 + `level2.js`); twee
      variant-onwaarheden (1, 6) en twee verkeerde afzenders (`toonStats`
      in plaats van "het gevecht", poortcheck in plaats van `Gevecht`); de
      keten van 7 draagt nu ook `getNaam()`; beat 3 van de opening verliest
      de vertelde slotzin en het woord "aanhef". **Open, niet door een
      worker aan te passen:** `CLAUDE.md` documenteert `node --test test/`,
      wat op Node 22 faalt (module-not-found) — het moet
      `node --test test/test-*.mjs` zijn
- [x] QC: **425/425** headless (was 423), `lint-scene` schoon,
      `check-assets` geen drift, `check-walkthrough` **278 gekeurd, 0
      afwijkingen** (mét de drift onderweg gemeten), `check-docpaden` 0
      dood, javac exit 0 + verboden-grep leeg, smoke-browser **44/44**,
      smoke-levels-1-3 **36/36**, smoke-full-playthrough **104/104**.
      Elf screenshots in `test-results/wp45-*.png`

### - [x] WP 40 — Slotcontrole

Entry: `workflow/40-slotcontrole.md` · commit: `b3bf55d`

- [x] Alle poorten in één run op één werkkopie: 400/400 headless,
      305/305 over acht Chromium-smokes, javac + verboden-grep schoon,
      lint-scene, check-assets, check-docpaden (842 paden) en
      check-walkthrough (276 citaten) schoon
- [x] Verse screenshots van titelkaart, vier kamers, spread, pc-editor,
      sim, oordeel en epiloog aan Lars bezorgd
- [x] Slotentry geschreven; PR-beschrijving bijgewerkt

**Programma 3 is hiermee af.** Open blijven: de luistertest op speakers en
smoke-touch (WebKit ontbreekt). De PDF-fontterugval stond hier ook, en is
intussen weg: WP 51 bouwde de PDF's op een machine met Courier New.

# Programma 2 — opwaardering van presentatie en verhaal (afgerond)

Zie `workflow/15-opwaardering-kickoff.md` voor de opdracht, de beslissingen
en het volledige plan van dit afgeronde programma.

## Vertrekpunt

Gemeten op `claude/game-polish-improvements-rhlk70`, commit `7333f78`, met Node
v22.22.2:

- `node --test test/test-*.mjs` — 225 tests, **224 groen, 1 rood**
  (`test-sim-cross-check`, codering; wordt in WP A rechtgezet).
- Zes scènes, 173 draw-ops samen. Eén sprite van de zes wordt geblit.
  Nul overgangen. Negen geluidscues, geen muziek.

Entry 12 rapporteerde 229 tests; `node --test` telt subtests over Node-versies
heen anders. Er zijn geen testbestanden verdwenen. Vanaf hier is
**225** het referentiepunt.

## Bindende volgorde

- WP 0 eerst.
- WP A en B zijn fundering: al het tekenwerk erna gebeurt tegen het
  gecorrigeerde beeldkader en met de nieuwe primitieven.
- WP C vóór WP D en E: de tekst gaat vast vóór het beeld, want de QC-poort van
  het scènewerk is "elk zelfstandig naamwoord in de kamerbeschrijving moet
  aanwijsbaar zijn".

De pakketten F t/m J hebben onderling geen harde volgorde.

## De pakketten

### - [x] WP 0 — Logboek, checklist en werkafspraken

Entry: `workflow/15-opwaardering-kickoff.md` · commit: `29d2a2b`

- [x] Kickoff-entry met de prompts van Lars, de aanpak, de beslissingen en het
      bewijsmateriaal
- [x] Het goedgekeurde plan integraal als Bijlage B
- [x] Dit bestand als levende checklist
- [x] Werkafspraken in `CLAUDE.md`, §Working agreements
- [x] QC: markdown op 80 tekens, code onaangeroerd, tests onveranderd 224/225

### - [x] WP A — Fundering en opruiming

Entry: `workflow/16-fundering-en-opruiming.md` · commit: `36c40b9`

- [x] `berekenSchaal()` levert twee gehele factoren (`--schaal-x`,
      `--schaal-y`); beeldverhouding zo dicht bij 4:3 als past
- [x] CRT-overlay (scanlines + vignet), uitschakelbaar met `crt aan|uit`,
      bewaard in de save
- [x] Titelkaart en oordeelkaart leesbaar — bleek een **contrastfout**, geen
      z-orde-fout; opgelost met een donkere plaat en een papieren band
- [x] Spread-inhoud in twee kolommen; bladerhint en paginateller binnen het blad
- [x] Codering van de Java-prijs opgelost via het bouwrecept
      (`-encoding UTF-8` + `-Dstdout.encoding=UTF-8`), **niet** via `Main.java`
      — een `PrintStream` in de bron laat de cursusgrens-grep struikelen én lost
      de compileerkant niet op
- [x] Bouwpuin uit `index.html`, `js/engine.js`, `js/logic/strings.js`,
      `js/logic/world.js`, `js/scenes/scene-spread-template.js`
- [x] Vier dode string-sleutels weg (`dozen.leeg`, `pc.puzzelAlAf`,
      `hintPrefix`, `endgame.naarOordeel`)
- [x] Het "placeholder-level" in `levels.js` **blijft**: het is de fixture waar
      de headless tests op draaien; alleen het commentaar was misleidend
- [x] Hardgecodeerd macOS-pad uit de vijf `test/smoke-*.mjs` (nu `AL_SCRATCH`
      of `test-results/`)
- [x] QC: **225/225 groen**, `lint:scene` schoon, `check-assets` driftvrij,
      javac-poort schoon, zes rooksmaaktesten groen via `file://`

Doorgeschoven met adres: de sjabloonvlekken onder de spread-tekst → WP G; de
hardgerande lichtwiggen → WP B/E. `smoke-touch` kon hier niet draaien (geen
WebKit in deze container).

### - [x] WP B — Rendererkern

Entry: `workflow/17-rendererkern.md` · commit: `2ac044f`

- [x] Ramps in `js/palette.js`: `RAMPEN`, `rampVan`, `verduister`, `verhelder`
- [x] `gradient` — loopt over de échte tussenkleuren van een gedeelde ramp, met
      Bayer 4×4 op de overgangen
- [x] `ditherRamp` met vrije dichtheid 0–1
- [x] `shadow` (pixels omlaag in hun eigen ramp) — Engelse opnaam, zoals de
      zeven bestaande ops
- [x] `noise` (deterministische spikkels, seed hoort bij de scène)
- [x] Sprite-schaling via `opts.schaal`; ankerpunt blijft onderaan-midden
- [x] Voorgrondlaag: `overlays` `{ baselineY, ops }` wordt eindelijk getekend,
      vóór of ná de speler naargelang de diepte
- [x] Overgangen: `fade`, `dissolve`, `iris` in `gfx.overgang`; de engine
      gebruikt een **opkomst** bij een kamerwissel (zie entry voor waarom niet
      dicht-en-open)
- [x] `tools/lint-scene.mjs` kent de vier nieuwe ops
- [x] QC: 250/250 groen (25 nieuwe tests), `debugPalet` aan, zes
      rooksmaaktesten groen, `art-stijlgids.md` en `engine-architectuur.md` mee

Nog niet toegepast, met adres: sprite-schaling en de voorgrondlaag zijn
gereedschap zonder gebruiker tot **WP E** de kamers hertekent. Bewegende sfeer
(stof, flikkering) staat ook onder WP E — er is bewust geen slapende code voor
gemaakt.

### - [x] WP C — Verhaal, stem en de zolder die antwoordt

Entry: `workflow/18-verhaal-en-stem.md` · commit: `7d8be60`

- [x] Register kouder: intro, vier kamerbeschrijvingen, oordeel, epiloog,
      endgame. De kou zit in het contrast (de stoel lijkt net verlaten, het stof
      zegt van niet), niet in somberte
- [x] Duisternis met _Seven Little Goats_ als bron: de intro, de opengeslagen
      bladzijde (zeven kruisjes, zes doorgehaald) en de terminal vóór het booten
- [x] Achttien eigen `onderzoek`-teksten over de vier kamers; woordkoppeling in
      `ONDERZOEK_WOORDEN` (`js/logic/world.js`), tekst in `strings.js`
- [x] Parser: kale richtingen en afkortingen, voorzetsels, lidwoord-stripping,
      vier extra werkwoorden, `neem`/`pak` met een echt antwoord
- [x] Commandogeschiedenis op **F3**, niet pijl-omhoog — de pijltjes zijn het
      lopen, en F3 is precies wat de Sierra-parsers ervoor gebruikten
- [x] `AL.strings.intro` weer in gebruik; doublure `spreads.intro` weg; de
      achtergrond loopt nu in de stem van de verteller over de titelkaart
- [x] `docs/achtergrond.md`: verdwijning, zolder en register herschreven
      ("nooit een oorzaak" blijft staan)
- [x] `docs/save-en-hints.md` oordeelteksten gelijkgetrokken, **plus een test
      die die twee voortaan aan elkaar houdt**
- [x] QC: 259/259 groen, zes rooksmaaktesten groen, lint en check-assets schoon

De spreads zijn in dit pakket **niet** herschreven: hun tekst is puzzelinhoud en
hoort bij WP G, waar ook de bladzijden zelf hertekend worden. Het bladbudget
blijft daar gelden: hoogstens 24 gewrapte regels per pagina (17 tekens × 12
regels × 2 kolommen); de langste pagina nu is `l4` p1 met 22.

De walkthrough is nagekeken en bewust ongemoeid gelaten: geen enkel citaat erin
is onwaar geworden en alle genoemde commando's werken nog. **Open klusje:** de
nieuwe parser-tolerantie en F3 in `deel1-hints.md` vermelden, zodra `pandoc` en
`typst` beschikbaar zijn om beide PDF's mee te herbouwen — nu niet in deze
container.

### - [x] WP D — De opening

Entry: `workflow/19-de-opening.md` · commit: `f0c5c2d`

- [x] Drie getekende beelden: `opening-huis`, `opening-trap`, `opening-pc`, elk
      met een opkomst uit het zwart
- [x] Vijf beats op die drie beelden, zo gemaat dat geen onderschrift
      pagineert — anders bladert Enter door de tékst in plaats van de reeks
- [x] Onderschrift onderaan in plaats van een luik over het beeld
      (`maakVenster`-optie `plaatsing: "onder"`)
- [x] Overslaanbaar met Escape, met een leesbare hint op eigen plaat
- [x] **Geen extra save-veld nodig:** herladen komt via `hervat()` binnen en
      ziet de titelkaart niet; `herbegin` is een expliciete verse start en
      hoort de opening juist wél opnieuw te tonen
- [x] Route en stem kloppen sinds WP C; de `spread`-modus draagt alleen nog de
      zeven level-spreads
- [x] QC: 259/259, `lint:scene` schoon op negen scènes, `smoke-browser` 21/21
      (twee checks erbij), overige rooksmaaktesten groen

Twee lessen uit dit pakket staan nu in `art-stijlgids.md` en gelden voor WP E:
dither niet over een grote helderheidssprong (een fel accent domineert ook in de
minderheid), en licht is rond (een halo uit trapezia leest als een tunnel).

### - [x] WP E deel 1 — De vier kamers hertekend

Entry: `workflow/20-de-zolder-hertekend.md` · commit: `386d9e3`

- [x] Vier beloopbare kamers hertekend: gegradeerde wanden en vloeren, wijkend
      perspectief, één lichtbron met hooglicht en schaduw, outlines, korrel
- [x] Licht in plakken met aflopende dichtheid — de oude volvlakke wiggen waren
      precies wat als "onafgewerkte polygoon" las
- [x] Props uit de achtergrond naar geblitte sprites; de engine sorteert props
      en speler op voet-y. De pc toont eindelijk zijn `aan`-frame, dat sinds
      WP 6 bestond en nooit te zien is geweest
- [x] Nieuw veld `scene.sfeer`: stof dat écht zakt, deterministisch. De lint
      kent het en controleert grenzen, kleur en aantal
- [x] Elke kamer een voorgrondlaag waar de speler achterlangs loopt
- [x] Het beeld lost de prose in: elk zelfstandig naamwoord uit elke
      kamerbeschrijving is aanwijsbaar
- [x] 325 draw-ops over alle scènes, tegen 173 bij het vertrekpunt
- [x] QC: 259/259, lint schoon, check-assets driftvrij, zes rooksmaaktesten
      groen

Nog open, met adres: de speler wordt niet kleiner naar achter. De
sprite-schaling uit WP B ligt klaar, maar de loopstrook is 39 px hoog — daar
valt geen zinnige diepte op te schalen zonder de walkboxes te herzien. Hoort bij
**WP H**.

### - [x] WP E deel 2 — De kaarten, en licht dat eindelijk licht is

Entry: `workflow/21-de-kaarten-en-het-licht.md` · commit: `cbdbf2b`

Afgesplitst omdat deel 1 al groot was en `CLAUDE.md` vraagt een half pakket te
splitsen in plaats van het half te committen. Een logo is bovendien letterwerk
en geen kamer: ander soort werk.

- [x] `titelkaart` als echte scène (`js/scenes/scene-titelkaart.js`) in plaats
      van zeven inline draw-ops in `js/engine.js`
- [x] Getekend logo: `gfx.tekenLogo` zet de 8×8-font op schaal met een
      omtreklijn uit een masker (niet per letter) en een verloop over de
      letterhoogte
- [x] Tweelaags titel: "THE LEGACY OF" klein boven "ALBERTA" op schaal 3 — op
      één regel past de titel op geen enkele leesbare schaal binnen 320 px
- [x] `eindkaart` hertekend: dezelfde kamer als de titelkaart, maar licht
- [x] **Nieuwe op `light`** — de andere helft van `shadow`: pixels omhóóg in hun
      eigen ramp, gedoseerd met Bayer. Wijkt af van het plan (WP B was met vier
      ops gesloten) en de reden staat in de entry: `ditherRamp` vult élke pixel,
      dus élke lichtstraal in de repo was een dekkende plaat. Dat is P0-3 uit de
      geprioriteerde lijst, en het was met het bestaande gereedschap niet op te
      lossen
- [x] Alle vijf de scènes met een lichtbron omgezet naar `light`, en hun licht
      naar achteren in de picture verplaatst: licht valt op een kamer, het ligt
      er niet onder. De kist in de westhoek staat nu écht in de straal
- [x] Monitorgloed als vijf ín elkaar liggende koepels: één ring heeft een rand,
      vijf oplopende ringen doven uit
- [x] Stofdoos in de westhoek stond naast de straal; korrel op de overloopwand
      stond twee stappen onder de ondergrond (las als sneeuw)
- [x] QC: **263/263 groen** (vier nieuwe tests voor `light`), `lint:scene`
      schoon op tien scènes, `check-assets` driftvrij, zes rooksmaaktesten groen
      (229 controles), en de contrastfout uit WP A is op verse screenshots niet
      teruggekomen

Nog open, met adres: het trapgat in `overloop` (y140–189) overlapt de loopstrook
(y152–189), dus wie via het zuiden binnenkomt staat ín het gat. Walkbox-werk,
hoort bij **WP H**, waar de walkboxen toch al herzien worden voor de
dieptescaling.

### - [x] WP F — Typografie en chroom

Entry: `workflow/22-typografie-en-chroom.md` · commit: `799a22b`

- [x] Inktmaat per glyph in `js/font.js`; de glyphdata zelf ongemoeid. Óók de
      linkerruimte wordt weggerekend — anders staat elke regel die met een "i"
      begint twee pixels ingesprongen
- [x] `tekenProse`/`proseBreedte` naast `tekenTekst`: monospace blijft waar een
      raster hóórt (statusbalk, invoerbalk, terminal)
- [x] `_wrap` breekt op pixels, met een meetfunctie; zonder die functie rekent
      hij monospace, dus alles op een raster blijft werken
- [x] `gecentreerdeTekst` en de overslaanhint meten in pixels
- [x] Het venster krimpt naar zijn breedste régel, met `maxTekens × 8` als
      bovengrens en 96 px als bodem
- [x] Venster als blad papier: slagschaduw met de `shadow`-op (dus in de kleur
      van de kamer eronder), korrel, belichting van boven, hoekornament, en één
      pixel extra regelafstand
- [x] Statusbalk en invoerbalk als lijstwerk: verloop in hout, korrel, lichte
      bovenrand, donkere onderrand
- [x] Handschrift met schuinstand, proportionele spatiëring mét variatie, en
      deining per groepje van vier als driehoeksgolf — per teken en als hash
      viel elk woord uit elkaar in losse letters
- [x] De kop van een spread staat in dezélfde hand, alleen rechter en zonder
      deining; de gedrukte prosefont las als twee schrijvers op één blad
- [x] **De ASCII-kop is geschrapt, niet vervangen.** `"== naam =="` kwam uit
      `js/logic/world.js` — opmaak in de laag die presentatievrij hoort te zijn,
      en de statusbalk zei het twee regels hoger al. In de sim-terminal blijft
      zo'n kop wél staan: dat is een tekstspel
- [x] Kolommen van een spread worden verdeeld als alles op één spread past
- [x] QC: **285/285 groen** (22 nieuwe tests), lint en check-assets schoon, zes
      rooksmaaktesten groen (229 controles), en de epiloogkaart wordt niet meer
      volledig afgedekt

Bewust niet: een aparte pixel-handschriftfont (de stijlgids noemt die als
polish-tícket bóven op de benadering, en op 8×8 is de winst marginaal tegenover
honderd nieuwe glyphs). De vlekken die onder de spread-tekst liggen horen bij
**WP G**, waar het papier per level opnieuw getekend wordt.

### - [x] WP G — Het notitieboek

Entry: `workflow/23-het-notitieboek.md` · commit: `76f6ebb`

- [x] Zeven schetsen, één per checkpoint-metafoor, in
      `js/scenes/spread-schetsen.js` — blauwdruk-en-doos, trechters-en-goot,
      knikkerbaan met klem en splitsing, twee-pijlen-één-doos, patroonkaart met
      turfjes, plankenbrug met genummerde planken, zoekspoor en dubbele pijl
- [x] Ze staan op de twéede bladzijde: dat is waar Alberta de opdracht geeft, en
      waar haar tekst naar verwijst ("volgens de schets hieronder"). Die zinnen
      wezen tot nu toe naar niets
- [x] Beschadiging per level in plaats van één gedeelde vlek, en op de plek
      waar de puzzel zit
- [x] Dezelfde vlek op béide bladzijden, de schets alleen op de tweede — een
      vlek trekt door het papier heen
- [x] Papier met verlopen naar de rug, korrel en **liniatuur** op exact
      `BLAD.regelH`, zodat het handschrift ín de lijn valt
- [x] Bladerhint naar het linkerblad; de onderrand van het rechterblad is van de
      weekregel, die sinds het proportionele handschrift drie regels nodig heeft
- [x] `tools/lint-scene.mjs` keurt de schetsen mee in een eigen pas
- [x] Glyphs `×` en `→` toegevoegd, plus een test die elk teken in de spelprose
      tegen de font houdt — "validatie ×3" stond als "validatie ?3" op de
      bladzijde, en `js/font.js` verwees naar een lint-tool die nooit bestaan
      heeft
- [x] Kop van spread 7 ingekort: "(getCategorie().getNaam())" is één woord van
      26 tekens en liep over de bladrand
- [x] `AL.debugSpread` als testhaak — zonder die haak kost het zeven
      uitgespeelde levels om alle veertien bladzijden te zien
- [x] QC: **286/286 groen**, lint schoon (tien scènes + schetsenset),
      check-assets driftvrij, zes rooksmaaktesten groen (229 controles), alle
      veertien bladzijden bekeken

Bewust niet: de spread-tekst zelf herschrijven (die is puzzelinhoud en doet wat
ze moet doen), een papiersjabloon per level (zeven keer dezelfde liniatuur), en
de weekregel inkorten — die zin staat woordelijk in `achtergrond.md`,
`spelontwerp-legacy.md` en `deel1-hints.md`, en de walkthrough-PDF's kunnen hier
niet herbouwd worden.

### - [x] WP H — Sprites en animatie

Entry: `workflow/24-sprites-en-animatie.md` · commit: `6e3f0c8`

- [x] Ademende idle: twee frames op 1 Hz, hoofd één pixel lager
- [x] Loopcyclus van vier frames met **deining** — de doorzwaaiframes zijn één
      rij hóger, en omdat het anker onderaan ligt komt de romp omhoog terwijl de
      voeten staan. Dat ene pixel doet meer dan de voetstanden samen
- [x] Armzwaai, alleen in het zijaanzicht: van voren zit een arm ín het silhouet
- [x] Draaiframe bij een aswissel (noord-zuid ↔ oost-west), twee tikken, zonder
      de beweging te blokkeren
- [x] Zit-animatie van drie frames; de overlay wacht erop, de **modus niet** —
      daar hangen de invoerblokkering en de save aan
- [x] Dieptescaling over de loopstrook van de scène zelf: 1,0 vooraan, 0,84
      achteraan
- [x] Trapgat in `overloop` naar achter (eindigt nu op de voorrand van de
      loopstrook); treden om en om licht/donker; leuning van boven het gat naar
      de voorrand, waar ze tussen speler en diepte in staat
- [x] `test/test-sprites.mjs`: tien keuringen (rechthoekigheid, breedte binnen
      een anim, hoogteverschil ≤ 1, maten uit de stijlgids, sub-palet, anker,
      aanwezige anims, geen `-west`). Vond meteen dat `loop-oost` geen deining
      had
- [x] Negen rooksmaaktesten wachtten op `modus === "pc"` en beweerden dan
      `overlayOpen` — dat werkte alleen omdat die twee hetzelfde moment waren.
      Ze wachten nu op de overlay zelf
- [x] QC: **296/296 groen** (tien nieuwe), lint schoon, check-assets driftvrij,
      zes rooksmaaktesten groen (229 controles), animatie frame voor frame
      bekeken

Twee dingen bewust níet: de sprite is niet naar de toegestane 16×32 vergroot (de
ruimte die de animatie nodig had zat in de hoogte, en de figuur wérkt), en de
walkboxen van de vier kamers zijn niet herzien — de 39-pixelstrook bleek genoeg
voor zichtbare diepte, en een hogere strook zou de speler dwars door de in de
achtergrond gebakken dozen en kist laten lopen.

### - [x] WP I — Geluid

Entry: `workflow/25-geluid.md` · commit: `60ac285`

- [x] Echte twee-operator-FM: een modulator die via een gain op de `frequency`
      van een carrier uitkomt. Drie knoppen per stem, dezelfde als op een OPL2:
      ratio, index, en een eigen envelope op die index. Niet méér dan twee
      operatoren — zes klinkt als een DX7 en dus als de verkeerde periode
- [x] Zes stemmen: `koud`, `bas`, `warm`, `blip`, `hout`, `karton`. De
      niet-harmonische ratio's (1,41 en 1,73) doen de foley: dat is geen toon
      meer maar een tik op een plank
- [x] Vier bedden: `titel`, `ambient-zolder`, `pc`, `einde` (eenmalig)
- [x] Foley erbij: `stap`, `stap-2`, `doos`. Voetstappen op de tel van de
      loopcyclus, met twee afwisselende varianten
- [x] **`ambient-zolder` is gepromoveerd, niet afgevuurd.** Die cue was één
      blokgolf van 0,4 s op 110 Hz; afvuren zou geen sfeer opleveren maar een
      pieptoon. De naam bleef, de inhoud is een bed van 19,2 s geworden
- [x] Vooruitkijkende scheduler op de audioklok, getikt vanuit de logische tik
      van de engine — WebAudio timet exact, een rAF-lus niet
- [x] Meestergain, want met vooruitkijken is "uit" niet te halen door te
      stoppen met plannen: er staan al noten in de toekomst, en die kun je
      alleen naar nul versterken
- [x] **Een gemiste noot wordt niet ingehaald** — gevonden door de test, niet
      door mij. Bij een bevroren tabblad werden bij terugkomst alle gemiste
      noten in één klap geplaatst op een tijd in het verleden, wat WebAudio
      uitlegt als "nu"
- [x] `startBedVoorStand()`: één plek beslist welk bed bij de stand hoort.
      "Geluid aan" zette alleen de gain terug, dus op de zolder bleef het daarna
      stil tot je van kamer wisselde
- [x] Nagemaakte AudioContext in de tests: controleert dát het FM is, dat geen
      exponentiële ramp naar exact nul gaat (ongeldig per spec, Chromium slikt
      het, andere engines gooien), en dat elke oscillator ook gestopt wordt
- [x] Het register als test: de notendichtheid van de zolder moet lager zijn dan
      die van de pc
- [x] QC: **322/322 groen** (26 nieuwe), lint schoon, check-assets driftvrij,
      `smoke-browser` van 21 naar **28** controles, geen bestanden en geen deps,
      headless zonder `AudioContext` crasht niet, en "geluid uit" zet de
      meestergain in de browser gemeten op exact nul

Wat níet geverifieerd is en dat hoort hier te staan: **hoe het klinkt.** Er is
in deze container geen geluidsuitgang. Wat gecontroleerd is, is de graaf en de
data, niet het oordeel van een oor — de mix hoort door iemand met speakers
nagelopen te worden.

### - [x] WP J — De gesimuleerde pc

Entry: `workflow/26-de-gesimuleerde-pc.md` · commit: (nog in te vullen)

- [x] Menubalk boven in inverse video, met de commando's die **écht bestaan** en
      per paneel verschillend. Geen `Bestand Bewerken Zoeken Help` dat niets
      doet: een knop die niets doet is erger dan geen knop
- [x] F-toetsenstatusbalk onderaan — en dat is de enige plek waar een speler kan
      lézen dat F9 compileert
- [x] Dubbellijns kaders, afgeronde hoeken op nul, de gloed rond de kast en de
      text-shadow op het schermvlak eruit
- [x] Scanlines over het paneel, aan dezelfde `data-crt`-schakelaar als het
      canvas: `crt uit` zet ze allebei uit
- [x] `CHECK_OK` groen, `CHECK_FAIL` rood. `--pc-rood` werd geïnjecteerd en
      door geen enkele regel gebruikt; de uitvoer was één `textContent`, dus per
      regel kleuren kón niet. Nu een span per regel, met echte newlines ertussen
      zodat `textContent` blijft werken voor de tests
- [x] Editor opent bovenaan. Een textarea scrollt na het zetten van `.value`
      naar de cursor, en die staat aan het eind — level 1 opende op regel 16,
      met Alberta's notitie en de klassekop buiten beeld
- [x] Uitvoerpaneel: **twee** fouten. De eerste regel liep door de bovenrand
      (border plus padding is minder dan één regelhoogte), en `flex: 0 1 34%`
      liet het paneel krimpen zodat de láátste regel wegviel — de CHECK_FAIL,
      het enige dat de speler op dat moment wil lezen. Nu een ondergrens in
      regels, en de scrollpositie is voorwaardelijk: past het, dan van boven;
      past het niet, dan naar het eind
- [x] **F1 is de hint.** De geladen-melding beweerde dat `?` een hint gaf, maar
      in de editor zette dat gewoon een vraagteken in de code. Er was dus geen
      enkele manier om in de editor een hint te vragen
- [x] Courier New uit de schriftstack: een schrijfmachineletter met schreven,
      waar een DOS-terminal een rasterletter met vlakke einden had
- [x] QC: `smoke-pc` van 21 naar **32** controles, 322/322 headless groen, lint
      en check-assets schoon, en de editor is nog een echte `<textarea>`
      (`page.fill` werkt, en dat werkt alleen op een echt formulierveld)

**De 8×8-bitmapfont komt er niet in**, en dat is de enige plan-eis van het hele
programma die niet is uitgevoerd. De editor is een echte `<textarea>` — een
geboekte beslissing in `engine-architectuur.md`, ouder dan dit plan, om
selectie, klembord en schermlezers te houden — en een textarea zet zijn tekst
met een échte font. De font wél gebruiken vraagt de tekst op een canvas te
tekenen met een onzichtbare textarea erbovenop, en dat is precies het "veel werk
en fragiel" waar die beslissing over gaat. Plan en doc weken hier van elkaar af;
de doc heeft het betere argument. Zie de entry.

`smoke-touch` kon opnieuw niet draaien (geen WebKit), dus het mobiele
toetsenbord is niet geautomatiseerd nagekeken. De overlay is niet aangeraakt op
het punt dat `js/touch.js` gebruikt.

## Na het programma

Fouten die ná de elf pakketten gemeld zijn. Geen werkpakketten, wel dezelfde
poort: reproduceren, herstellen, regressietest, entry, commit.

### Herbegin — `workflow/27-herbegin.md`, commit (nog in te vullen)

Gemeld door Lars: *"The herbegin command doesn't work."* Drie fouten, waarvan
de eerste de gemelde is.

- [x] **De bevestiging was onmogelijk te typen.** `herbegin` vroeg om `herbegin
      ja` te typen, maar elk venster blokkeert de invoer: de letters werden
      geslikt, de spatie ín het antwoord klikte het venster weg, en `ja` bleef
      als onbegrepen commando in de balk staan. Nagemeten vóór de fix: de
      invoerregel stond op `"ja"`
- [x] Opgelost met een vraagvenster — `maakVenster` kent `vraag: true`,
      `syncBlokkeer` laat de balk dan vrij, en de logica-laag zegt zelf dat haar
      tekst een vraag is via de effect-tag `vraag` (DOM-vrij en Node-testbaar,
      zoals de rest van de laag)
- [x] Escape trekt een openstaande vraag in; elk ander commando beantwoordt
      haar. Enter en spatie bladeren niet meer — die typen mee
- [x] **De herbegin was niet te zien.** Je kwam terug in dezelfde hoek met één
      regel tekst; een geresette zolder ziet er niet anders uit dan een niet-
      geresette. Nu start de openingsreeks opnieuw, precies zoals
      `workflow/19-de-opening.md` bij WP D al beschreef maar de code nooit deed
- [x] `AL.strings.herbeginKlaar` geschrapt: `verwerkResultaat` toont tekst ná de
      effecten, dus die melding overschreef de eerste beat van de opening. De
      reeks zegt hetzelfde beter
- [x] QC: **328/328** headless groen (was 322), `smoke-browser` van 28 naar
      **36** controles, de overige vijf rooksmaaktesten onveranderd groen (255
      samen), lint en check-assets schoon

## Nog open na programma 2

Elf pakketten zijn af (0, A t/m J). Wat toen open bleef, heeft nu een adres
in programma 3:

- ~~De walkthrough-PDF's zijn niet herbouwd.~~ **Opgelost in WP 39**: pandoc
  3.10 en typst 0.15.0 opgehaald, beide PDF's herbouwd uit de bijgewerkte
  Markdown (8 en 13 pagina's). Die build zette ze in Liberation Mono, want
  Courier New stond toen niet op de bouwmachine. Metrisch identiek, en het
  sjabloon vroeg Courier New nog altijd als eerste. ~~Terugval nog open.~~
  **Weg sinds WP 51** (`4c9a5fe`): die herbouw liep wél op een machine met
  Courier New. Nagemeten in WP 52 over de hele PDF-geschiedenis: 710061a,
  27bdd21 en c114725 dragen LiberationMono, 4c9a5fe draagt CourierNewPS*.
- **`smoke-touch` is nooit gedraaid.** Die test vraagt WebKit, en dat
  ontbreekt hier. `js/touch.js` is in WP 37 aangeraakt (unlock op D-pad,
  commandobalk en canvas-tik); die kant is gedekt door `smoke-geluid`, dat
  zijn tweede helft in een Chromium-context met `hasTouch` draait. De
  WebKit-smoke zelf blijft afhankelijk van WebKit-beschikbaarheid.
- **Hoe het geluid klínkt is nog altijd niet beoordeeld.** De mechanische
  oorzaken zijn in WP 37 hersteld en nagemeten: meestergain 0,16 → 0,30 met
  een uitgerekende klipmarge, foley en drones een octaaf omhoog uit de
  sub-bas, de `doos`-cue afgevuurd, de unlock op elke gebruikersactie, de
  voetstap op 4,0 Hz. Wat níét kon, is luisteren — deze container heeft geen
  geluidsuitgang. Of 0,30 op een laptopspeaker het juiste niveau is en of de
  zolder op 110 Hz nog koud klinkt, blijft een luistertest voor Lars.
- ~~De sprite gebruikt zijn toegestane maat niet.~~ **Opgelost in WP 34**: de
  speler is 15 × 31 (doorzwaai 32) binnen de 16 × 32 van de stijlgids, en is
  meteen ook de neutrale erfgenaam-figuur geworden in plaats van de Roodkapje
  uit de predecessor.

## Wat bewust niet gebeurt

Zodat een verse sessie deze discussies niet heropent:

- **Alberta's lot wordt niet verklaard.** Kouder vertellen is niet hetzelfde
  als uitleggen; de regel "nooit een oorzaak noemen" blijft.
- **Geen faalstaat, geen deadline, geen verliesmechaniek.** De urgentie zit
  volledig in de toon. Staat, save-formaat en logica-laag blijven zoals ze zijn.
- ~~De _Seven Little Goats_-prose blijft ongemoeid.~~ **Teruggedraaid in
  programma 3** (zie `workflow/28-kwaliteitsreview-kickoff.md`,
  §Beslissingen): Lars vraagt expliciet de wolf-zin en het
  commentaarregister te herstellen, en de technische vrees bleek
  onterecht — `test-sim-cross-check` vergelijkt twee live runs, de
  testscripts zijn invoer, geen golden transcripts.
