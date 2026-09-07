# 48b — Puzzelvolgorde binnen een level

## Opdracht

Ingelast door de manager ná de adversariële pas van WP 48, tussen WP 48 en
WP 49. De aanleiding staat in `workflow/48-notities-als-spec.md`,
§"Adversariële review", als de eerste van de vier bevindingen die dat pakket
erkende maar niet mocht oplossen:

> **De trace-opgaven drukken de modeloplossing van hun eigen level af, en de
> puzzelvolgorde is vrij.** `l6-trace` toont `for (int i = 0; i <
> voorwerpen.size(); i++)` — teken voor teken de herstelde kop van
> `l6-editor-repair` variant A — en `l7-trace` toont de null-veilige keten van
> `l7-editor-repair` variant A. `kies()` in `js/pc/pc.js` poort de volgorde
> niet, dus een speler kan met de trace beginnen.

De opdracht van de docent die eronder ligt is dezelfde als die van WP 47
(`workflow/46-lineariteit-kickoff.md`): *"Er moet wel gezorgd worden dat het
oplossen van de code puzzels lineair gebeurt."* WP 47 legde de volgorde tussen
de hoofdstukken vast; dit pakket legt ze binnen een hoofdstuk vast.

Beslissing van de manager, meegegeven bij de opdracht: **poort de volgorde
binnen een level** — puzzel k uit `defs[]` is pas speelbaar als 0..k-1 op `af`
staan. Plus: de titel van `l6-editor-repair` ("herstel de off-by-one") noemt de
soort fout en moest neutraal worden.

## Aanpak

### De poort zelf (`js/logic/levels.js`)

Drie functies erbij, alle drie DOM-vrij en headless getest:

- `puzzelSpeelbaar(toestand, levelId, index)` — waar zodra de puzzels 0..k-1
  van dat level op `af` staan. Index 0 is altijd waar; een index buiten
  `defs[]` en een onbekend level zijn onwaar.
- `puzzelIndex(levelId, puzzleId)` — de positie in `defs[]`, of −1.
- `puzzelSpeelbaarId(toestand, levelId, puzzleId)` — dezelfde poort, op id;
  dat is wat de pc kent.

De poort is een **predicaat over de bestaande staat**. Hij leidt alles af uit
`levels[n].puzzels[*].status` en voegt niets aan de save toe — dezelfde vorm
als de doospoort van WP 47, die naar `levels[n-1].afgerond` kijkt. Een save van
vóór dit pakket laadt dus ongewijzigd, en wie halverwege een hoofdstuk hervat,
staat precies op de taak waar hij stopte. `test-levels.mjs` pint dat met een
JSON-rondreis en met een controle dat de puzzelstaat nog exact
`{hints, status}` (+ `draft` bij een editor) draagt.

De poort **kijkt alleen vooruit**: een taak die `af` staat, blijft opnieuw te
openen. Dat is een expliciete keuze. Nakijken of overdoen is geen vooruitlopen,
de checker beoordeelt elke inzending vers (`save-en-hints.md`, §`herbegin`), en
`smoke-pc` leunt er zelfs op — de concept-behoud-test heropent een puzzel die
al af is.

### Het menu consumeert de poort (`js/pc/pc.js`)

`renderMenu` vraagt per regel `AL.levels.puzzelSpeelbaar(t, levelId, idx)`. Een
wachtende taak blijft staan — de speler hoort te zien wat er nog komt — maar
krijgt de klasse `pc-menu-status-wacht` in plaats van haar statusklasse, het
plaatje `wacht` in de badge (`S.pc.statusWacht`) en `aria-disabled="true"`.
In `css/style.css` is dat gedoofd amber op 45 % dekking, zonder klik-cursor en
zonder de oplichtende rand van een levende regel: de uitgegrijsde menuregel van
een Turbo-scherm, in het patroon dat `.pc-menubalk-item[disabled]` er al voor
had.

De poort zélf zit in `kies()`, niet op de knop. Klik, cijfertoets en de
debug-haak lopen alle drie door `kies()`; één controle dekt dus alle drie de
paden, en een echt `disabled`-attribuut zou geen klik meer overlaten om de
speler mee te antwoorden. Wat er wél gebeurt: de onderregel van het menu (de
statusregel, `pc-menu-onder`) vervangt "Kies een taak…" door
`S.pc.menuVergrendeld` — "Die taak wacht nog. Alberta's lijst loopt van boven
naar onder: werk eerst af wat erboven staat." Ze blijft staan tot het menu
opnieuw getekend wordt, zoals een Turbo-scherm zijn melding liet staan.

### De volgorde per level, nagekeken

De opdracht vroeg de defs-volgorde van alle zeven levels te rapporteren en te
herschikken waar een puzzel de oplossing van een **latere** puzzel toont. Elk
level is nagelopen op wat het op het scherm zet: de beschadigde varianten van
de editor-fragmenten, de vraagsjablonen van de traces (over hun hele pool
uitgerekend), de stroken van de Parsons, de `toon`-modellen van de
verklaar-puzzels.

Per level, de volgorde vóór en na (alleen level 2 herschikt):

- L1: editor-repair, editor-write, verklaar — ongewijzigd. `Voorwerp`
  is een gewerkt voorbeeld naast `Geitje`, geen model ervan.
- L2: was editor-repair, parsons, trace; **nu parsons, editor-repair,
  trace** — het editor-fragment draagt `zoek` ongeschonden, dat zijn
  letterlijk de stroken van `l2-parsons`.
- L3: ongewijzigd. Klem, poortcheck en cascade zijn drie verschillende
  fragmenten.
- L4: ongewijzigd. De trace noemt `setNoord`, maar de notitie somt de
  vier setters al op; geen model.
- L5: ongewijzigd. De Parsons toont een for-lus ná de puzzel die er
  twee laat schrijven — de goede kant op.
- L6: ongewijzigd. `l6-trace` toont de herstelde kop van de repair, en
  staat er al ná.
- L7: ongewijzigd. `l7-trace` toont de null-veilige keten van de
  repair, en staat er al ná.

Zes van de zeven stonden dus al goed; voor level 6 en 7 was de volgorde altijd
al juist en was de vrije keuze in het menu het hele lek. Level 2 is de
uitzondering en de enige herschikking van dit pakket: beide beschadigde
varianten van `l2-editor-repair` dragen `zoek` intact, en die negen regels zijn
— op één inspringniveau na — woordelijk `l2-parsons.regels` in de juiste
volgorde. Andersom lekt er niets: wie de stroken geordend heeft, ziet daarna
een `zoek` die hij zelf net gebouwd heeft, en de vier signatuurchecks van de
editor gaan over de koppen erbóven. `test-level2.mjs` bewijst de dekking (elke
strook komt, getrimd, in beide varianten voor) en pint de volgorde;
`test-level6.mjs` en `test-level7.mjs` pinnen hun trace-na-repair met het
letterlijke fragment dat de trace afdrukt.

### De titel van level 6 (`js/logic/strings.js`)

`l6.repairTitel` was "Kamer.java — herstel de off-by-one". Die titel staat in
het menu en boven de editor, dus vóór de speler één regel code ziet, en hij is
op twee manieren fout: hij verklapt de reparatie van variant A, en hij is
onwaar voor variant B (daar is de lus van de verkeerde soort, niet één plank te
ver). Hij heet nu **"Kamer.java — herstel de verwijder-lus"**: wát er hersteld
wordt, niet wát er mis is. Dat is precies de vorm van de andere zes titels
("herstel de constructor", "herstel de signaturen", "herstel de klem", "herstel
de buur-bedrading", "herstel de null-veilige keten"). Geen enkele test pinde de
oude tekst; de walkthrough noemde hem twee keer (deel 1 en deel 2) en die twee
koppen zijn meegeschreven.

### Tests

- **Headless** (`test/test-levels.mjs`, zes nieuwe tests): de waarheidstabel
  van de poort (eerste altijd open; `bezig` is niet genoeg, alleen `af` opent
  de volgende; één stap per keer), heropenen van afgewerkt werk, de
  randgevallen (index −1, index voorbij `defs[]`, onbekend level), de
  id-variant, en het persistentiebewijs (JSON-rondreis + geen nieuw veld).
- **Volgorde-pins**: `test-level2.mjs` (Parsons vóór het fragment dat zijn
  stroken toont, mét de dekkingscontrole), `test-level6.mjs` en
  `test-level7.mjs` (trace ná de repair, mét het letterlijke fragment).
- **`smoke-pc`**: het vergrendelde menu op een vers level (eerste open, zes
  wachtend), het `wacht`-plaatje, de cijfertoets die niets opent, de klik die
  niets opent, en de statusregel die zegt waarom; daarna dat de opgeloste taak
  **precies** de volgende ontgrendelt (de derde blijft wachten). En ná het
  herladen halverwege het hoofdstuk: vier taken af, de vijfde aan de beurt, de
  zesde wachtend, en de tweede (al af) gewoon weer te openen — het
  hervat-bewijs in de browser, naast de JSON-rondreis in de headless test.
- **`smoke-levels-1-3` en `-4-7`**: per hoofdstuk de assertie dat op een vers
  level alleen de eerste taak speelbaar is, plus voor level 2 dat de Parsons
  vooraan staat.

Wat er aan bestaande smokes veranderde, en waarom:

- **`smoke-pc` sprong over `l0-editor-write` heen.** De test loste
  `l0-editor-repair` op (index 0) en koos dan meteen `l0-parsons` (index 2);
  `l0-editor-write` (index 1) kwam pas op het einde aan de beurt, en alleen om
  het concept-behoud te tonen — hij werd nooit opgelost. Onder de poort is dat
  geen speelbaar pad meer. De test lost die schrijf-puzzel nu op met haar model
  (nieuwe stap 6b) en gaat dan verder; de concept-behoud-stap op het einde
  heropent hem, wat meteen aantoont dat een afgewerkte taak weer open gaat.
- **De klik op een wachtende regel heeft `force: true` nodig.** Playwright
  weigert een knop met `aria-disabled="true"` aan te klikken. Een echte muis
  doet dat wél — `aria-disabled` is een signaal, geen slot — en juist dat pad
  hoort de poort in `kies()` te vangen, dus de test forceert de klik en
  controleert dat er niets gebeurt.
- **De variatie-controles kozen rechtstreeks een editor-repair.**
  `herstelVarianten` in `smoke-levels-1-3` (levels 1–3) en `variantCode` in
  `smoke-levels-4-7` (levels 4, 6, 7) openen `lN-editor-repair` op een verse
  staat om te zien welke beschadigde variant een seed toont. Voor level 2 (nu
  index 1) en level 7 (index 1) gaat dat niet meer via het menu. Ze krijgen een
  expliciete testhaak `ontgrendelTot(page, levelId, puzzelId)` die de taken
  erbóven rechtstreeks in `window.AL.debugToestand` op `af` zet — dezelfde
  soort haak, en dezelfde motivering, als `zetVoortgangKlaar` uit WP 47: geen
  spelpad, en de test doet niet alsof.
- **`smoke-full-playthrough` en `smoke-browser` zijn niet aangeraakt.** De
  playthrough lost de puzzels al in `defs[]`-volgorde op (`for (const def of
  defs)`), dus de poort raakt hem niet; hij bewijst nu bovendien dat de zeven
  hoofdstukken volledig speelbaar blijven mét de poort.

### Docs en walkthrough

- `docs/levels-en-checkpoints.md` — nieuwe, bindende §"Puzzelvolgorde binnen
  een level" (de defs-volgorde ís de speelvolgorde; de poort kijkt vooruit; ze
  staat in de staat en niet naast de staat; wat de oplossing van een andere
  puzzel toont komt erná; een titel verklapt de fout niet). De leveltabel zegt
  voor level 2 nu "Parsons-methode; herstel signaturen; trace shadowing" en
  voor level 6 "herstel de verwijder-lus (grens óf luskeuze)".
- `docs/spelontwerp-legacy.md` — §"De gesimuleerde pc" beschrijft het menu (dat
  er tot nu toe niet in stond) en draagt het beslissingsblok WP 48b; stap 4 van
  "de lus per level" heet nu "Los de puzzels op, op volgorde".
- `docs/save-en-hints.md` — §localStorage-save: de save draagt géén
  poortvelden; allebei de lineariteitspoorten worden uitgerekend uit de staat
  die er al was.
- `walkthrough/deel1-hints.md` — stap 4 van de grote lijn beschrijft de poort
  (gedoofd met "wacht", klik en cijfertoets doen niets, een afgewerkte taak mag
  je wél heropenen); level 2 heeft zijn twee puzzelblokken omgewisseld en
  hernummerd; de kop van level 6 heet nu "herstel de verwijder-lus".
- `walkthrough/deel2-oplossingen.md` — dezelfde omwisseling en hernummering
  voor level 2, dezelfde kop voor level 6.

## Beslissingen

- **De poort staat in de logica, het menu consumeert hem.** `puzzelSpeelbaar`
  hoort bij `AL.levels`, naast `allePuzzelsAf` en `voltooiPuzzel`: het is een
  uitspraak over de staat, geen renderdetail. Zo is hij headless te toetsen
  (architectuurcontract) en zou een tweede ingang — een save-editor, een
  toekomstig levelmenu — dezelfde regel erven.
- **De poort in `kies()`, niet op de knop.** Eén controle voor klik,
  cijfertoets en debug-haak. Een `disabled`-knop zou de klik opeten en de
  speler zonder antwoord laten; nu zegt de statusregel wat er aan de hand is.
- **Een wachtende taak blijft zichtbaar.** Weglaten zou het menu laten
  krimpen en groeien en de speler het overzicht van het hoofdstuk ontnemen. Ze
  staat er, gedoofd, met "wacht".
- **Afgewerkt werk blijft heropenbaar.** De poort is een volgorde-poort, geen
  slot op wat je al kan. Zie hierboven; het staat ook zo in
  `save-en-hints.md`.
- **Alleen level 2 herschikt.** De opdracht was expliciet: herschik alleen waar
  een puzzel de oplossing van een latere toont. Dat is precies één geval. Level
  6 en 7 stonden al goed en hadden alleen de poort nodig — dat is meteen het
  bewijs dat de poort en niet de volgorde het echte gat was.
- **`geitjeStub`-achtige gevallen zijn geen lek.** Level 1 toont in
  `l1-editor-repair` een complete, correcte `Voorwerp` naast de opdracht om
  `Geitje` te schrijven. Dat is een gewerkt voorbeeld van een ándere klasse en
  precies het scharnier van hoofdstuk 1 (twee dozen uit één blauwdruk-idee);
  het is geen model van het gevraagde. Niet aangeraakt.
- **De l6-titel noemt de methode, niet de fout.** Zie hierboven. Alternatief
  "herstel `verwijderVoorwerp`" was even neutraal, maar de andere zes titels
  gebruiken allemaal een lidwoord + zelfstandig naamwoord ("de klem", "de
  buur-bedrading"), dus "de verwijder-lus".
- **De PDF's zijn allebei herbouwd — met een afwijking.** Beide bronnen
  wijzigden, dus beide PDF's moesten mee. `deel1-hints.pdf` gedraagt zich zoals
  in WP 44/47/48 (150 KB, 8 pagina's, verschil met de vorige alleen in de
  datums). `deel2-oplossingen.pdf` dateerde nog van WP 39 en groeit van 190 KB
  naar 214 KB bij gelijkblijvend paginatal (13). Nagemeten: dat is de
  **toolchain, niet de inhoud** — de bron van WP 39 opnieuw bouwen in deze
  omgeving geeft 214 KB. Courier New staat hier niet geïnstalleerd, dus typst
  valt terug op Liberation Mono, de tweede schakel van de fallback-ketting in
  `walkthrough/stijl/zine.typ` en metrisch gelijk; de bladspiegel blijft
  daardoor die van het ontwerp, alleen het ingebedde font verschilt.
- **De ruwe puzzel-id's in het menu blijven staan.** Op de screenshot van
  level 6 lezen de twee wachtende regels "l6-trace" en "l6-vindfout": alleen
  editor-puzzels dragen een `titel`, de terminal-puzzels niet. Dat is ouder dan
  dit pakket en raakt geen spoiler; de poort maakt het wel zichtbaarder, want
  die regels staan er nu langer. Doorgegeven aan de manager, niet stilletjes
  meegenomen.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **441/441 groen** (was 432/432; negen
  nieuwe: zes poort-tests in `test-levels.mjs` en drie volgorde-pins in
  `test-level2/6/7.mjs`).
- `node tools/lint-scene.mjs` — "Alle scènes in orde."
- `node tools/check-assets.mjs` — "Geen drift: alle 9 editor-modellen komen
  byte-getrouw uit de broncode."
- `node tools/check-walkthrough.mjs` — "276 citaten en koppen gekeurd; 0
  afwijkingen" (was 275; het nieuwe citaat is "wacht").
- `node tools/check-docpaden.mjs` — "1017 aangehaalde paden gekeurd; 0 dood in
  een contractdocument, 27 in `workflow/`" (de 29 erbij en de ene dode extra
  komen uit deze entry zelf: `workflow/` is historie, geen poort).
- Smokes: `smoke-pc` **42/42** (was 32/32; tien nieuwe asserties),
  `smoke-browser` **46/46**, `smoke-levels-1-3` **40/40** (was 36/36),
  `smoke-levels-4-7` **58/58** (was 53/53), `smoke-full-playthrough`
  **104/104** — ongewijzigd.
- `bash walkthrough/tools/bouw-walkthrough.sh` — exit 0; deel 1 151 KB /
  8 pagina's, deel 2 214 KB / 13 pagina's (zie de beslissing over de font).
- Regelbreedte van de gewijzigde markdown op 80 tekens gecontroleerd (alleen
  de twee tabelrijen van de leveltabel zijn langer, zoals de rest van die
  tabel).

Screenshots in `test-results/`: `wp48b-menu-vergrendeld.png` (level 6, met de
hernoemde titel bovenaan en twee wachtende taken) en
`wp48b-menu-vergrendeld-l0.png` (de proefdruk, zeven taken, één open).
