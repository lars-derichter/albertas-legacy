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
| `js/font-hand.js` | — | nieuw in WP 36: een eigen 8×10-handschriftglyphset (`AL.fontHand`), niet overgenomen |
| `js/input.js` | toetsenbord/parser-invoer, arrow keys | de invoerlus is ongewijzigd; erbij: de `onEscape`-haak, F3 (het vorige commando terughalen), de audio-ontgrendeling op de eerste aanraking of klik, en de `pijlAan`/`pijlUit`-haken voor `js/touch.js`. De parser-verben zijn uitgebreid met de zolder-commando's |
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
- **Drie zetwijzen naast elkaar.** `tekenTekst` blijft monospace en blijft in
  gebruik waar een raster hóórt: de statusbalk, de invoerbalk, de terminal van
  de gesimuleerde pc en het chroom onder een notitieboek-spread. Daarnaast staat
  `tekenProse`/`proseBreedte`, dat de inktmaat per glyph uit `font.js` gebruikt.
  De glyphdata van de drukfont is niet veranderd; wat erbij kwam is één keer
  uitrekenen waar de inkt van elke glyph begint en hoe breed ze is. En sinds
  WP 36 is er een derde: `tekenHandschrift`/`handschriftBreedte` zetten met een
  éígen glyphset, `js/font-hand.js` (8 × 10, onregelmatige basislijnen per
  glyph), alleen voor het notitieboek. Die drie en niet meer — de regels staan
  in `art-stijlgids.md`, §Typografie.

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

### Niveau en register

De meesterversterking staat op **0,30**. Ze stond op 0,16, en daarmee piekte een
voetstap van honderd milliseconde rond -20 dBFS: op een laptopspeaker geen zacht
geluid maar geen geluid. De stemgains zijn tegelijk herverdeeld — de bedstemmen
omlaag (er klinken er tot drie tegelijk), de foleystemmen omhoog (die klinken
één voor één). Het ergste geval telt op tot 2,75 × 0,30 = 0,825, dus onder de
klipgrens, en dat is dan nog de coherente som van drie bedstemmen plus twee
foley-cues. `test/test-geluid.mjs` rekent dat na en bewaakt het venster
0,25–0,40 voor de meestergain.

Het register heeft een bodem, en om dezelfde reden: een tik op 73 Hz komt uit de
speaker van een laptop niet terug.

- **Cues liggen niet onder midi 48** (131 Hz). Het karakter van de foley zit in
  de niet-harmonische ratio van hun stem, niet in de grondtoon: een kartontik op
  165 Hz klinkt nog altijd als karton.
- **Bedden mogen tot midi 45** (110 Hz), op twee voorwaarden — de noot valt in
  de bas-stem (onder midi 55) en duurt minstens twee seconden. Dat is een drone:
  hij houdt aan en wordt daardoor ook op een kleine speaker gevoeld. Een
  melodienoot mag daar niet komen, want die zou wegvallen en een gat in het bed
  achterlaten.

### Wie vuurt wat af

De cue-tabel als geheugensteun; de grondtonen staan als midi in `js/sound.js`.

| Cue | Stem | Midi | Afgevuurd door |
|---|---|---|---|
| `pagina` | karton | 72, 67 | een spread-bladzijde omslaan (`spreadBlader`), het notitieboek openen, en 0,35 s ná een doos |
| `deur` | hout | 57, 52 | elke kamerwissel (`AL.world.betreed`) |
| `doos` | karton | 60, 55, 52 | een doos of kist die opengaat — met of zonder fragment erin |
| `stap` \| `stap-2` | hout | 50 \| 53 | de steunfases van de loopcyclus, afwisselend |
| `toets` | blip | 93 | de editor/terminal/Parsons laadt, en een hint |
| `compileer` | blip | 69, 69, 76 | "compileer & test" |
| `ok` \| `fout` | blip | 72, 79 \| 69, 64 | een assertie slaagt of faalt, een puzzel of level af |
| `boot` | warm | 48…72 | de pc boot *Seven Little Goats* |

Twee dingen die deze tabel afdwingt. **Eén cue per moment**: het openen van een
fragment speelde vroeger drie keer `pagina` op dezelfde audioklok-tijd (de
effect-tag, de `fragment-gevonden`-tag én het openslaan van de spread), en drie
identieke tikken tegelijk zijn één harde klik. De renderlaag speelt daarom geen
cue meer uit zichzelf bij `fragment-gevonden` of bij het openen van een spread;
de logica zegt in haar effectenlijst wat er te horen is. **Twee foley-cues
vallen niet samen**: een doos die opengaat is karton en dán papier, en dat is
precies waar de vertraging `geluid:pagina@0.35` voor bestaat.

### De ontgrendeling

Een browser start geen audio zonder gebruikersactie. `AL.sound.unlock()` is wat
die actie vertaalt, en hij hangt aan álle vier de oppervlakken waar een speler
kan beginnen:

- **toets** — `keydown` in `js/input.js`, vóór de tekstveld-uitzondering (het
  eerste teken dat een telefoonspeler in de commandobalk typt, telt mee);
- **muis, aanraking, pen** — `pointerdown` (plus `touchstart` voor oudere
  webviews) op het venster in `js/input.js`, in de capture-fase;
- **het D-pad en de commandobalk** van `js/touch.js` — pointerdown op een
  richtingsknop en submit van het formulier;
- **een tik op het canvas** in `js/touch.js` (tik-om-door-te-bladeren).

Tot dat moment doet de geluidslaag **niets**: `speel()` en `muziek()` keren
meteen terug, er wordt geen `AudioContext` gemaakt en er wordt geen oscillator
gebouwd. Dat is geen zuinigheid maar een lek dat gedicht is — een opgeschorte
context laat zijn klok stilstaan, dus alles wat je ertegen plant blijft in de
graaf hangen tot de eerste `resume`, en barst dan in één keer los.

Omdat de geluidslaag niet weet wélk bed bij de stand hoort, hangt de engine er
een haak aan: `AL.sound.opOntgrendeld(startBedVoorStand)`. De titelmuziek die
bij het opstarten gevraagd wordt, is dus een lege aanroep; het bed begint bij de
eerste toets, klik of tik. `unlock()` is idempotent — hij wordt in een sessie
honderden keren geroepen.

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
`strings.js` → `world.js` → checker-modules → `levels.js` → `sim/*`. De volle
laadvolgorde van álle bestanden staat onderaan dit document.

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
| `spread:<levelId>` | open een notitieboek-spread; levelId is `l1` … `l7` en niets anders (dus `spread:l1`). Er is géén `spread:intro` en géén `spread:outro`: de opening is een reeks van drie beelden met onderschriften (`OPENING` in `js/engine.js`), niet een bladzijde van het boek — zie `spelontwerp-legacy.md` |
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
| `geluid:<cue>` | speel een eenmalige cue: `pagina`, `deur`, `toets`, `stap`, `stap-2`, `doos`, `compileer`, `ok`, `fout`, `boot`. Is de naam een muziekbed (`titel`, `ambient-zolder`, `pc`, `einde`), dan start de engine dat bed via `AL.sound.muziek` in plaats van een eenmalige cue. Een cue mag een vertraging meedragen — `geluid:pagina@0.35` speelt haar 0,35 s later; zie §Geluid, "Wie vuurt wat af" |
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
2.  js/font.js             // AL.font     (de druk)
3.  js/font-hand.js        // AL.fontHand (Alberta's hand, het notitieboek)
4.  js/gfx.js              // AL.gfx (init na palet + beide fonts)
5.  js/input.js            // AL.input
6.  js/sound.js            // AL.sound
7.  js/parser.js           // AL.parser
8.  js/loopveld.js         // AL.loopveld (walkboxes, blokken, uitgangszones)
9.  js/logic/strings.js    // AL.strings  (alle prose)
10. js/logic/world.js      // AL.world    (zolder, staat, navigatie)
11. js/logic/checker/tokenizer.js
12. js/logic/checker/asserts.js
13. js/logic/checker/javacsim.js
14. js/logic/levels.js     // AL.levels   (level/puzzel-machine)
15. js/levels/level1.js … level7.js       // puzzeldefinities
    (js/levels/level0.js — de proefdruk — wordt er alleen bij ?dev=1 vóór
     geschreven; een gewone playthrough laadt hem nooit)
16. js/pc/editor.js  terminal.js  parsons.js  pc.js   // de drie panelen + coördinator
17. js/scenes/*.js         // zolderscènes + spreads
18. js/sprites/*.js        // sprites
19. js/sim/goats-strings.js  goats-world.js  goats-combat.js
20. js/pc/sim-terminal.js  // de sim-controller (leent het terminalpaneel bij sim:boot)
21. js/engine.js           // AL.engine: init, frame-lus, effect-dispatch
22. js/touch.js            // het aanraakscherm-D-pad + mobiele commandobalk
```

`js/engine.js` laadt als voorlaatste (alleen `js/touch.js` komt erna, want dat
hangt zijn D-pad aan een engine die er al is) en is samen met `js/touch.js` het
enige dat het canvas, `document` en de pc-overlays aanraakt. Het roept
`AL.gfx.init(canvas)`, leest de save (of maakt een verse staat), en start de
frame-lus.

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
├── font-hand.js               // Alberta's hand (8×10), enkel het notitieboek
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
