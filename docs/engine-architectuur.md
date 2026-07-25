# Engine-architectuur

Het contract van de browser-engine van _The Legacy of Alberta_. Het legt vast
wat uit de remake-90s-engine wordt overgenomen, wat verandert, hoe de DOM-vrije
logica met de renderlaag praat, welke effect-tags er zijn, hoe de staat oogt,
in welke volgorde `index.html` laadt, en hoe de gesimuleerde pc past binnen de
canvas-aanpak. WP 3 bouwt tegen dit document.

## Uitgangspunten (hard)

Uit `CLAUDE.md`, hier herhaald omdat de engine ze het scherpst raakt:

- **Vanilla JS, geen build-stap.** Geen bundler, transpiler of framework.
- **Draait vanaf `file://`.** Dubbelklikken op `index.html` moet werken. Losse
  `<script>`-tags; geen dev-server verondersteld.
- **Nul runtime-dependencies.**
- **DOM-vrije logica.** Alles in `js/logic/` en `js/sim/` is headless en Node-
  testbaar. Logica-functies geven `{tekst, effecten}` terug; de renderlaag past
  de effecten toe. Logica raakt nooit `document`, `window` of het canvas aan.
- **Platte, serialiseerbare staat.** Eén plat object dat door `JSON.stringify`
  round-trript. Geen klasse-instanties, geen functies, geen cycli.

## Wat we overnemen uit remake-90s

De renderer en de randmodules zijn een aanpassing van
`~/-work/programming/revenge-of-red-riding-hood/remake-90s/`. Overgenomen,
met behoud van hun contract:

| Bestand | Overname | Wijziging |
|---|---|---|
| `js/gfx.js` | palet-geïndexeerde software-renderer (320×200 `Uint8Array`), primitieven, `tekenPicture`/`cacheScene`/`blitScene`, `tekenSprite`, `tekenTekst`, berichtvenster | uitgebreid palet; `debugEga`-guard versoepeld (zie hieronder) |
| `js/font.js` | 8×8-bitmapfont | glyphdata ongewijzigd; er is een inktmaat per glyph bij gekomen (`AL.font.maat`) voor proportioneel zetten |
| `js/input.js` | toetsenbord/parser-invoer, arrow keys | ongewijzigd; parser-verben uitgebreid met zolder-commando's |
| `js/sound.js` | de vorm: een cue-tabel als data, een aan/uit-toggle, lui aanmaken van de AudioContext | de synthese is FM in plaats van blokgolven, en er zijn muziekbedden bij gekomen (zie §Geluid) |
| `js/parser.js` | `parse(ruweInvoer)` → `{commando, werkwoord, rest}`; dispatch op modus | overgenomen als patroon; nieuwe modi en verben |
| engine-lus (`js/engine.js`) | frame-lus, scène-cache-en-blit-patroon, venster-paginering, actor-beweging over walkboxes | referentie; herschreven rond de nieuwe modi (zolder / spread / pc); de vloermeetkunde staat apart in `js/loopveld.js` (zie §De vloer) |
| scène- en sprite-schema | de draw-op- en frame-formaten uit `docs/scene-schema.md` en `docs/sprite-schema.md` | overgenomen; scène-ids zijn nu zolderkamers en spreads |
| `docs/`-schema's, Node `--test`, Playwright | test- en toolopzet | overgenomen |

Adapteren en crediteren; niet heruitvinden.

### Wat verandert aan gfx

- **Uitgebreid palet.** `js/palette.js` levert nu ~64 geïndexeerde kleuren in
  plaats van EGA-16. De renderer blijft index-gebaseerd:
  de backing store is nog altijd één byte per pixel, alleen de opzoektabel is
  groter. Sprites gebruiken hex-indexen `0`–`f` voor de eerste 16 en een
  uitbreiding voor de rest — zie `art-stijlgids.md` voor de sprite-codering
  boven index 15.
- **Versoepelde EGA-guard.** `gfx.debugEga` controleerde of elke pixel 0–15 was.
  De guard wordt `debugPalet`: hij controleert nu of elke pixel een geheel getal
  binnen de paletgrootte is (0 t/m `AL.palet.KLEUREN.length - 1`). Zo blijft de
  betrapping van buiten-palet-kleuren bestaan, aangepast aan het grotere palet.
- **Vijf ops erbij: `gradient`, `ditherRamp`, `shadow`, `light`, `noise`.** De
  overgenomen renderer kon alleen platte vullingen en één 50 %-schaakbord, en
  daarmee is de VGA-look uit `art-stijlgids.md` niet te tekenen: elk groot vlak
  blijft dan één kleur. De nieuwe ops staan met hun signatuur en hun
  gebruik in `art-stijlgids.md`, §"De draw-ops". `tools/lint-scene.mjs` kent ze
  en controleert hun ariteit en grenzen mee.

  `light` kwam er een pakket later bij dan de andere vier, en om een reden die
  het onthouden waard is: zonder die op werd elke lichtstraal met `ditherRamp`
  getekend, en die vult élke pixel van zijn veelhoek. Licht was daardoor een
  dekkende plaat over de kamer in plaats van iets dat op de kamer valt — precies
  de klacht waar deze opwaardering mee begon. Zie
  `workflow/21-de-kaarten-en-het-licht.md`.
- **Ramps in het palet.** `js/palette.js` levert nu `RAMPEN`, `rampVan`,
  `verduister` en `verhelder`. Daarmee kan een kleur binnen zijn eigen familie
  een stap zakken, wat `shadow` en `gradient` mogelijk maakt zonder een tweede
  palet. Kleuren buiten elke ramp (6 bruin, 14 geel) blijven ongemoeid.
- **Sprite-schaling.** `tekenSprite` neemt `opts.schaal`; het ankerpunt blijft
  onderaan-midden, zodat een geschaalde figuur op dezelfde vloer blijft staan.
  De factor komt sinds WP 35 voor speler én props uit
  `AL.loopveld.diepteSchaal` (zie §De vloer).
- **Overgangen.** `gfx.overgang(soort, t, kleur)` legt `fade`, `dissolve` of
  `iris` over de backing store. Op een palet-geïndexeerde buffer kan er niet
  gemengd worden, dus een fade is een geordende oplossing, niet een vervaging —
  zoals de hardware van toen het ook deed.
- **Twee zetwijzen naast elkaar.** `tekenTekst` blijft monospace en blijft in
  gebruik waar een raster hóórt: de statusbalk, de invoerbalk en de terminal van
  de gesimuleerde pc. Daarnaast staat `tekenProse`/`proseBreedte`, dat de
  inktmaat per glyph uit `font.js` gebruikt. De glyphdata is niet veranderd; wat
  erbij kwam is één keer uitrekenen waar de inkt van elke glyph begint en hoe
  breed ze is.

  Dat "waar ze begint" is niet overbodig. Verschillende glyphs starten op een
  andere kolom — een `i` op kolom 2, een `K` op kolom 0 — dus zonder de
  linkerruimte weg te rekenen krijgt elke regel die met een `i` begint een
  inspringing van twee pixels die er niet hoort te staan.
- **Wrappen meet, het telt niet meer.** `gfx._wrap(alinea, maxBreedte, meet)`
  breekt op pixels; `meet` weglaten geeft de oude monospace-rekensom terug, en
  alles wat op een raster hoort blijft dus ongemoeid. Het berichtvenster krimpt
  bovendien naar zijn breedste régel in plaats van altijd zijn maximum te
  gebruiken: proportionele prose komt smaller uit dan het raster waarop ze
  gewrapt is, en zonder die stap stond er rechts een handbreed papier waar niets
  op staat. `gfx.vensterKader(venster)` geeft die doos terug zonder te tekenen.

## Geluid

`AL.sound` heeft twee soorten geluid, en het verschil is niet cosmetisch:

- **eenmalige cues** — `speel(naam)`. Kort (de keuring houdt ze onder anderhalve
  seconde), meteen afgevuurd, geen staat.
- **muziekbedden** — `muziek(naam)`, en `muziek(null)` stopt. Een bed loopt rond
  tot iets anders het overneemt; `eenmalig: true` maakt er een die oplost en dan
  ophoudt (de eindkaart).

Hetzelfde bed opnieuw starten doet niets. Dat is wat een kamerwissel toelaat
zonder de zolder-loop van voren af aan te laten beginnen.

### FM, niet blokgolven

Er stonden negen cues in, allemaal blokgolf-bliepjes: één oscillator, één
envelope. Dat is de PC-speaker van 1985, niet de geluidskaart van 1990. De
periode die dit spel naspeelt klonk uit een AdLib of een Sound Blaster, en die
deden FM — een OPL2 had twee operatoren per stem.

Elke noot is dus twee oscillatoren: een modulator die via een gain op de
`frequency` van een carrier uitkomt. Drie knoppen per stem, dezelfde als toen:
`ratio` (heel getal = harmonisch, niet-heel = klok of tik), `index` (hoe diep de
modulator verbuigt) en een eigen envelope op die index. Meer dan twee operatoren
is er niet, en dat is opzet: zes-operator-FM klinkt als een DX7 en dus als 1983
of 1995, niet als de periode ertussen.

### De scheduler

Noten worden vooruit geplaatst op de audioklok, niet afgevuurd op de beeldklok:
WebAudio timet exact, een `requestAnimationFrame`-lus niet. De engine roept
`AL.sound.tik()` aan in zijn logische tik; die kijkt of de volgende noten binnen
het vooruitkijkvenster van 0,35 s vallen en plaatst ze dan.

Twee gevolgen die het onthouden waard zijn:

- **Er is een meestergain nodig.** Op het moment dat de speler "geluid uit"
  typt, staan er al noten in de toekomst gepland. Die kun je niet intrekken —
  alleen naar nul versterken. `zetAan(false)` zet daarom de meestergain op nul
  én vergeet het actieve bed.
- **Een gemiste noot wordt niet ingehaald.** Schakelt de speler naar een ander
  tabblad, dan bevriest de beeldklok en dus de tik, terwijl de audioklok
  doorloopt. Zonder die regel worden bij terugkomst alle gemiste noten in één
  keer geplaatst, op een tijd in het verleden — wat WebAudio uitlegt als "nu".
  Dat is een cluster, geen muziek.

### Welk bed hoort bij welke stand

Eén functie in de engine beslist dat (`startBedVoorStand`), want het antwoord is
op drie momenten nodig: bij een moduswissel, na een reload, en als de speler het
geluid weer aanzet. Dat laatste was een echte fout — "geluid uit" vergeet het
bed en "geluid aan" zette alleen de gain terug, dus op de zolder bleef het
daarna stil tot je van kamer wisselde.

### Het register

De muziek volgt de koudere toon uit WP C: mineur, traag, veel stilte tussen de
frasen. De zolder hoort niet gezellig te klinken. Het contrast dat overblijft is
de pc — het enige warme ding in huis, en het enige bed in een majeur-kleur. Dat
staat ook als test in `test/test-geluid.mjs`: de notendichtheid van de zolder
moet lager zijn dan die van de pc.

## De logica-laag

Zelfde vorm als remake-90s. Elke handler geeft overal dezelfde vorm terug:

```js
{ tekst: [strings], effecten: [strings] }
```

- `tekst` — alinea's voor het berichtvenster (mag leeg zijn). De renderer doet
  de word-wrap; `\n` waar een regelafbreking betekenis heeft. **Geen opmaak.**
  De kamerbeschrijving droeg hier ooit een kop mee als `"== Zolder — westhoek
  =="`, en dat was twee keer fout: opmaak hoort niet in een laag die
  presentatievrij moet zijn, en de statusbalk zei twee regels hoger al precies
  hetzelfde. In de terminal van _Seven Little Goats_ staat zo'n kop er nog wel —
  dat is een tekstspel, daar ís de tekst de presentatie.
- `effecten` — machineleesbare tags voor de engine (scènewissels, pc, geluid,
  voortgang). Woordenlijst hieronder.

Modules hangen aan `globalThis.AL` (browser, `file://`) en exporteren via
`module.exports` (Node, tests). Namespace-prefix: **`AL`** (Alberta's Legacy),
tegenover `RRH` in de predecessor.

Laadvolgorde binnen de logica (elke leest wat de vorige nodig heeft):
`strings.js` → `world.js` → `levels.js` → checker-modules → `sim/*`.

## De vloer: walkboxes, blokken en uitgangszones

De meetkunde van een kamer zit niet in de engine maar in `js/loopveld.js`. Dat
is een DOM-vrije module op hetzelfde niveau als `js/parser.js`: geen
wereldlogica (ze geeft geen `{tekst, effecten}` terug, alleen booleans en een
richting), maar wél iets wat zonder browser te testen hoort te zijn. De engine
stelt haar per loopstap twee vragen, en `tools/lint-scene.mjs` stelt dezelfde
twee aan elke scène.

```js
AL.loopveld.beloopbaar(scene, x, y)  // in een walkbox én in geen blok
AL.loopveld.uitgangBij(scene, x, y)  // "noord"|"oost"|"zuid"|"west", of null
AL.loopveld.diepteSchaal(scene, y)   // 1 vooraan tot 0,84 achteraan
```

`diepteSchaal` staat hier en niet in de engine omdat ze over dezelfde meetkunde
gaat als de rest van deze module: de loopstrook van de kamer. Sinds WP 35 is ze
bovendien het énige diepteregime. `tekenActor` gebruikt haar voor de speler en
`tekenPropsEnActor` voor élke sprite uit `hotspots`, met dezelfde `y`-waarde
waarop ook de painter's order sorteert. Daarvóór schaalde alleen de speler mee
en bleven de props even groot, wat de schaalmismatch tussen figuur en meubilair
juist vergrootte naarmate hij verder naar achter liep. Geschilderde geometrie
(`picture`, `overlays`) schaalt niet: die staat al op de maat die bij haar
diepte hoort.

Het volledige veldformaat staat in `scene-schema.md`; wat de engine ermee doet:

- **Blokken houden de speler tegen zonder iets te zeggen.** De walkbox min de
  blokken is de vloer; loopt de speler ergens tegenaan, dan klemt de beweging en
  gebeurt er verder niets. Er is geen botsingsvenster, geen tekst, geen cue.
- **Uitgangszones vervangen de randkruising voor noord en zuid.** Een
  randkruising vuurt als de doelpositie voorbij `VELD_TOP` (8) of `VELD_BOT`
  (189) gaat, en geen enkele loopstrook komt daar — een kamer die tot bovenaan
  het beeld beloopbaar is, heeft geen achterwand meer. De trap is daarom een
  rechthoek in de vloer. De zone vuurt op het moment dat de speler hem
  binnenkomt (een grendel in de engine houdt bij of hij er al in stond) en roept
  precies hetzelfde aan als de rand: `AL.world.betreed`.
- **Een mislukte oversteek te voet zwijgt.** `AL.world.betreed` geeft bij een
  richting zonder buur `dieKantKanJeNietOp` terug; loopt de speler, dan laat de
  engine dat vallen. Op het getypte `ga <richting>` blijft het venster staan,
  want daar is het een antwoord op een vraag. De lint bewaakt bovendien dat een
  loopstrook geen rand raakt waar geen kamer achter ligt, zodat dit pad de
  vangrail is en niet de dagelijkse gang van zaken.

`AL.world.betreed` is bij dit alles niet veranderd: de logica kent alleen de
zolderkaart en de richting, niet de rechthoeken.

## Effect-tag-woordenlijst

Dit is de volledige, gezaghebbende lijst. `spelontwerp-legacy.md` mag geen
engine-actie beschrijven die hier geen tag heeft; elke UI-overgang die het spel
nodig heeft, staat hieronder. De renderlaag is het enige dat op deze tags
reageert; de logica produceert ze alleen.

### Scène en navigatie

| Tag | Wanneer |
|---|---|
| `scene:<id>` | wissel naar een zolder-/huisscène (scène-id uit `art-stijlgids.md`) |
| `spread:<levelId>` | open een notitieboek-spread; levelId is `l1` … `l7`, plus `intro` en `outro` (dus `spread:l1`, `spread:intro`) |
| `titel` | toon de titelkaart |
| `betreed:<richting>` | de speler ging te voet naar de buurkamer (`noord`/`oost`/`zuid`/`west`): over de oost-/westrand of door een uitgangszone; engine-hint voor de camera |
| `fragment-gevonden:<levelId>` | het notitieboek-fragment voor dit level is ontgrendeld in de adventure |

### Gesimuleerde pc

| Tag | Wanneer |
|---|---|
| `pc:open` | de speler gaat aan Alberta's pc zitten; engine schakelt naar de pc-overlay |
| `pc:sluit` | terug naar de zolder |
| `editor:laad:<puzzleId>` | laad een editor-puzzel (beschadigde of lege Java + notities) |
| `terminal:start:<puzzleId>` | start een terminal-puzzel (trace/vind-de-fout/verklaar/parsons/kaart) |
| `parsons:laad:<puzzleId>` | laad een Parsons-puzzel in de terminal-UI (stroken) |
| `compileer` | de speler koos "compileer & test"; engine speelt de compileer-cue |
| `javac:fout:<puzzleId>` | de checker gaf een gesimuleerde `javac`-diagnose terug (tekst zit in `tekst`) |
| `check:ok:<puzzleId>` | een puzzel-assertie slaagde (CHECK_OK-regel) |
| `check:fout:<puzzleId>` | een puzzel-assertie faalde (CHECK_FAIL-regel; feedback in `tekst`) |

### Voortgang en level

| Tag | Wanneer |
|---|---|
| `level-start:<n>` | een level begint (na het lezen van de spread) |
| `puzzle-af:<puzzleId>` | een puzzel is volledig opgelost |
| `level-af:<n>` | alle puzzels van level `n` zijn opgelost; het spelstuk is hersteld |
| `voortgang:opgeslagen` | de staat is naar localStorage geschreven |
| `oordeel:<tier>` | toon Alberta's oordeel-eindscherm met verdict-tier (zie `save-en-hints.md`) |

### Hint

| Tag | Wanneer |
|---|---|
| `hint:<stap>` | een hint van stap 1/2/3 is getoond (engine kan een zachte cue spelen) |
| `hint:geen-meer` | de speler vroeg een vierde hint; er is er geen |

### Endgame en sim

| Tag | Wanneer |
|---|---|
| `sim:boot` | de pc boot _Seven Little Goats_ als speelbare simulatie |
| `sim:einde:<naam>` | de sim bereikte een van de vier eindes (zie `spelontwerp-seven-little-goats.md`) |
| `epiloog` | toon de epiloog die naar `seven-little-goats/` wijst |

### Systeem

| Tag | Wanneer |
|---|---|
| `geluid:<cue>` | speel een eenmalige cue: `pagina`, `deur`, `toets`, `stap`, `stap-2`, `doos`, `compileer`, `ok`, `fout`, `boot`. Is de naam een muziekbed (`titel`, `ambient-zolder`, `pc`, `einde`), dan start de engine dat bed via `AL.sound.muziek` in plaats van een eenmalige cue |
| `geluid:aan` \| `geluid:uit` | geluid globaal aan/uit |
| `crt:aan` \| `crt:uit` | de beeldbuislijnen en het vignet over het canvas aan/uit |
| `vraag` | de begeleidende tekst is een vraag: het venster laat de invoerbalk vrij, zodat de speler het antwoord kan typen. Escape trekt de vraag in |
| `herbegin` | het spel is teruggezet naar de begintoestand (zie `save-en-hints.md`) |
| `gestopt` | het spel is beëindigd (einde bereikt of expliciet gestopt) |

`spelontwerp-legacy.md` §"Commando's en effecten" verwijst één-op-één naar deze
tabel; elke daar genoemde overgang bestaat hierboven.

## De staat

Eén plat, serialiseerbaar object. `AL.world.nieuw(seed)` geeft een verse staat.
Velden (bindend voor de save in `save-en-hints.md`):

```js
{
  versie: 1,               // save-schemaversie (migraties)
  seed: 20260716,          // RNG-seed voor variatie (?seed=N of gegenereerd)
  modus: "zolder",         // "titel" | "zolder" | "spread" | "pc" | "sim"
                           //   | "oordeel" | "epiloog"
  sceneId: "zolder-west",  // huidige zolder-/huisscène
  speler: { x: 160, y: 150, richting: "zuid" }, // positie op de scène
  bezocht: { "zolder-west": true },             // welke scènes beschreven zijn

  levelActief: 1,          // welk level nu loopt (1..7), of 0 tussen levels
  levels: {                // per level de voortgang
    "1": {
      ontgrendeld: true,   // fragment gevonden, spread leesbaar
      spreadGelezen: false,
      puzzels: {           // per puzzel-id de staat
        "l1-editor": { status: "open", hints: 0, draft: "" },
        "l1-trace":  { status: "open", hints: 0 },
        "l1-verklaar": { status: "open", hints: 0 }
      },
      afgerond: false
    }
    // "2".."7" analoog
  },

  hintsTotaal: 0,          // som van alle hint-aanvragen (voor het oordeel)
  geluid: true,            // geluid aan/uit
  crt: true,               // beeldbuislijnen en vignet aan/uit
  gestopt: false,          // spel beëindigd
  einde: null              // null | verdict-tier uit save-en-hints.md
}
```

- `modus` stuurt de dispatch, zoals `modus` in de predecessor het gevecht
  stuurde. Elke modus heeft een eigen commandoset (zie `spelontwerp-legacy.md`).
- `modus: "titel"` staat in de save vanaf het moment dat de speler de epiloog
  wegklikt: de epiloog slaat zichzelf op, dus zonder die stand kreeg wie na de
  aftiteling herlaadde de eindkaart opnieuw voor zijn neus. Bij het hervatten
  toont die stand de titelkaart; de voortgang eronder blijft ongemoeid.
- `puzzels[*].draft` bewaart de editor-inhoud tussen sessies (concept-behoud).
- `puzzels[*].status`: `"open"` | `"bezig"` | `"af"`.
- Geen object-referenties in de staat: puzzels, levels en scènes worden op
  **id** aangesproken, niet op instantie. Dat houdt de save cyclusvrij.

De sim (_Seven Little Goats_ in de browser) heeft een eigen sub-staat in
`js/sim/`, die pas bestaat wanneer `modus === "sim"`. Die sub-staat is
eveneens plat en serialiseerbaar en wordt niet mee opgeslagen tussen sessies
(de sim is een eindstuk, geen doorlopende voortgang).

## Laadvolgorde in index.html

Losse `<script>`-tags, in deze volgorde (elke module verwacht de vorige):

```
1.  js/palette.js          // AL.palet: de kleurtabel
2.  js/font.js             // AL.font
3.  js/gfx.js              // AL.gfx (init na palet + font)
4.  js/input.js            // AL.input
5.  js/sound.js            // AL.sound
6.  js/parser.js           // AL.parser
7.  js/loopveld.js         // AL.loopveld (walkboxes, blokken, uitgangszones)
8.  js/logic/strings.js    // AL.strings  (alle prose)
9.  js/logic/world.js      // AL.world    (zolder, staat, navigatie)
10. js/logic/checker/tokenizer.js
11. js/logic/checker/asserts.js
12. js/logic/checker/javacsim.js
13. js/logic/levels.js     // AL.levels   (level/puzzel-machine)
14. js/levels/level1.js … level7.js       // puzzeldefinities (plus level0: proefdruk)
15. js/pc/editor.js  terminal.js  parsons.js  pc.js   // de drie panelen + coördinator
16. js/scenes/*.js         // zolderscènes + spreads
17. js/sprites/*.js        // sprites
18. js/sim/goats-strings.js  goats-world.js  goats-combat.js
19. js/pc/sim-terminal.js  // de sim-controller (leent het terminalpaneel bij sim:boot)
20. js/engine.js           // AL.engine: init, frame-lus, effect-dispatch
21. js/touch.js            // het aanraakscherm-D-pad + mobiele commandobalk
```

`js/engine.js` laadt als laatste en is het enige dat het canvas, `document` en
de pc-overlays aanraakt. Het roept `AL.gfx.init(canvas)`, leest de save (of
maakt een verse staat), en start de frame-lus.

## De gesimuleerde pc: DOM-overlay, geen canvas-tekst

De editor en de terminal worden **als DOM-overlays** gerenderd, gestyled om bij
de VGA-look te passen, en **niet** als canvas-getekende tekst.

> Beslissing: de gesimuleerde pc is een full-screen modus binnen dezelfde
> pagina, maar zijn inhoud (editor, terminal, Parsons-stroken) leeft in een
> DOM-overlay bovenop het canvas, niet in de palet-geïndexeerde backing store.

Waarom DOM en niet canvas:

- **Tekstinvoer.** De editor heeft een echte cursor, meerregelige invoer,
  invoegen en verwijderen. Dat namaken op een 8×8-bitmapfont-canvas is veel werk
  en fragiel; een `<textarea>` of contenteditable met een monospace-font doet
  het gratis.
- **Selectie en klembord.** Studenten willen code kunnen selecteren, kopiëren
  en plakken. Canvas-tekst kan dat niet zonder een eigen selectie-engine.
- **Toegankelijkheid.** Een DOM-editor werkt met screenreaders, browser-zoom en
  toetsenbordnavigatie; canvas-tekst is voor die technologie onzichtbaar.

De overlay wordt visueel ingepast: een CSS-styled kader in de VGA-stijl (zie de
pc-chrome in `art-stijlgids.md`), een monospace-font, blok-cursor, dezelfde
kleuren als het palet (als CSS-variabelen afgeleid van `js/palette.js`). De
zolder eronder blijft op het canvas staan; de overlay dekt hem af zolang
`modus === "pc"`. De engine schakelt de overlay in bij `pc:open` en uit bij
`pc:sluit`.

### Turbo Vision, en waar de 8×8-font níet komt

De chrome is die van een Borland-toepassing, omdat dat de referentie is die een
speler van 1990 herkent: een **menubalk** op de bovenste regel in inverse video,
**dubbellijns kaders** om de panelen, en een **F-toetsenstatusbalk** op de
onderste regel. Die twee balken zijn geen versiering — ze dragen de commando's
die werkelijk bestaan, en de statusbalk is de enige plek waar een speler kan
lézen dat F9 compileert en F1 een hint geeft.

Er komen **geen scanlines uit een aparte schakelaar**: de laag hangt aan
dezelfde `data-crt`-attribuut als het canvas, dus `crt uit` zet ze allebei uit.

Wat er níet is, en dat is een bewuste uitzondering op het plan van WP J: **de
8×8-bitmapfont van het spel staat niet in de overlay.** Die kan er niet in. De
editor is een echte `<textarea>` — de beslissing hierboven, om selectie, plakken
en schermlezers te houden — en een textarea zet zijn tekst met een échte font,
niet met een glyphtabel die de renderer per pixel uitleest. De font wél
gebruiken zou betekenen: de tekst zelf op een canvas tekenen met een onzichtbare
textarea erbovenop voor de invoer, en dan is precies dat "veel werk en fragiel"
weer terug.

Courier New is er wél uit. Dat is een schrijfmachineletter met schreven en dunne
stokken; een DOS-terminal had een rasterletter met vlakke einden. De stack
begint nu bij wat het systeem als terminalletter aanbiedt.

De pc-modules (`js/pc/editor.js`, `terminal.js`, `parsons.js`, hun coördinator
`pc.js` en de sim-controller `sim-terminal.js`) mogen — als enige naast
`engine.js` — de DOM aanraken, want zij zíjn de renderlaag van de pc. Ze
sturen de spelerinvoer door naar de checker (`js/logic/checker/`) en tonen de
`{tekst, effecten}` die terugkomt. De checker zelf blijft DOM-vrij en Node-
testbaar.

## Het aanraakscherm: waarom de zolder een eigen invoerbalk nodig had

De pc (`js/pc/`) gebruikt al een echte `<textarea>`/`<input>` (zie hierboven),
dus een tik daarop opent het systeemtoetsenbord vanzelf — dat is gratis DOM-
gedrag, niets extra's nodig. De zolder heeft dat probleem wél: de getypte
parser-commandoregel wordt volledig door `input.js` opgebouwd uit fysieke
`keydown`-events op `window` (zie de invoerbalk-tekening in `engine.js`,
`"> " + AL.input.regel`). Zonder een écht focusbaar tekstveld heeft een
toestel zonder fysiek toetsenbord (telefoon, tablet) niets om op te tikken,
en verschijnt er dus nooit een toetsenbord — de zolder was op zo'n toestel
onspeelbaar, net als lopen zonder pijltjestoetsen.

`js/touch.js` lost dit op met een kleine, feature-detected aanvulling:

- Een echt `<input>`-veld (de mobiele commandobalk) dat bij een tik het
  systeemtoetsenbord opent zoals elk ander webformulier, en de getypte tekst
  bij Enter/"ga" doorstuurt naar dezelfde `AL.input.onSubmit`/`onAdvance` die
  het fysieke toetsenbord ook gebruikt.
- Vier D-pad-knoppen die via `AL.input.pijlAan`/`pijlUit` dezelfde pijl-stack
  sturen als de fysieke pijltjestoetsen (`input.js`).
- Een tik op het canvas die `AL.engine.advance()` aanroept, zodat berichten,
  de titelkaart, spreads en het oordeel ook zonder toetsenbord doorbladeren.

Enkel aangemaakt op een toestel met een aanraakscherm (`ontouchstart` in
`window` of `navigator.maxTouchPoints > 0`); op een toestel met muis en
toetsenbord verandert er niets. Zichtbaar enkel in `modus === "zolder"` — de
pc heeft zijn eigen, altijd al werkende invoer.

## Bestandskaart van js/

```
js/
├── palette.js                 // AL.palet: ~64-kleuren VGA-ish tabel
├── font.js  gfx.js            // renderer (overgenomen, palet-aangepast)
├── input.js  sound.js         // invoer + geluid (overgenomen, uitgebreid)
├── parser.js                  // parse + dispatchpatroon (overgenomen)
├── loopveld.js                // DOM-vrij: walkboxes, blokken, uitgangszones
├── engine.js                  // frame-lus + effect-dispatch (raakt de DOM)
├── touch.js                   // aanraakscherm-D-pad + mobiele commandobalk
│                              //   (raakt de DOM; enkel actief bij hasTouch)
├── logic/                     // DOM-vrij, Node-testbaar
│   ├── strings.js             // ALLE zolder-/level-prose
│   ├── world.js               // zolderscènes, staat, navigatie
│   ├── levels.js              // level/puzzel-toestandsmachine
│   └── checker/
│       ├── tokenizer.js       // Java-tokenizer (strings/commentaar-bewust)
│       ├── asserts.js         // structurele assertie-bibliotheek
│       └── javacsim.js        // gesimuleerde javac-diagnostiek
├── pc/                        // gesimuleerde pc (DOM-overlay)
│   ├── editor.js  terminal.js  parsons.js   // de drie panelen
│   ├── pc.js                  // coördinator over de panelen (menu, open/sluit)
│   └── sim-terminal.js        // de sim-controller: draait Seven Little Goats (endgame)
├── levels/                    // level1.js … level7.js: puzzeldefs, varianten,
│                              //   hints, beschadigde code, modeloplossingen
├── sim/                       // Seven Little Goats browsersimulatie (DOM-vrij)
│   ├── goats-world.js  goats-strings.js  goats-combat.js
├── scenes/                    // zolderkamers + notitieboek-spreads
└── sprites/                   // sprites als pixel-strings
```

De DOM-vrije grens loopt scherp: `logic/`, `levels/` en `sim/` raken nooit de
DOM; `engine.js` en `pc/` mogen dat wel. De checker in `logic/checker/` is het
zwaarst geteste stuk (WP 4) en blijft daarom strikt headless.
