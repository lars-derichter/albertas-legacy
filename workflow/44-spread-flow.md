# 44 — Spread sluit waar je staat

## Opdracht

WP 44 uit de fixronde (zie `workflow/41-fixronde-kickoff.md`, §wortels
item 3 en §Bijlage). Uit Lars' speeltest op iOS, verbatim:

> It is strange that after reading the notebook you are automatically
> transported to the computer.

De verkenning van WP 41 had de wortel al aangewezen en die is hier
opnieuw nagelezen: `spreadVerder()` (`js/engine.js`) zette
`toestand.sceneId` op `"zolder-oost"` en riep `betreedZolder(false)` aan,
die via `wisselNaarScene` de speler op de entry `start` van de werkhoek
neerzette. Twee bijwerkingen in één functie dus: een kamerwissel én een
verplaatsing, allebei zonder dat de speler iets deed behalve een
bladzijde omslaan. Het chroom onderaan het laatste blad belooft al iets
anders — `spreadChroom.bladerLaatste` is sinds WP 33 "spatie: terug".

## Aanpak

- **`herstelStand()`** (nieuw in `js/engine.js`, naast
  `wisselNaarScene`): zet de kamer klaar *rond* de speler. Ze leest
  `toestand.speler.x/y` uit de staat, cachet de scène, herstelt de
  uitgangsgrendel (`AL.loopveld.uitgangBij`, dezelfde regel als in
  `positioneerActor`) en verplaatst niets. Is die stand niet beloopbaar —
  een save van een oudere versie, een hertekende kamer — dan valt ze
  terug op de entry: liever op de drempel dan in een muur.
- **`betreedZolder(beschrijf, houdStand)`** kiest tussen `herstelStand()`
  en `wisselNaarScene(sceneId, "start")`. De rest van die functie
  (modus, overlay verbergen, `spreadLevelId` leegmaken, het zolderbed,
  `bewaar()`, `syncBlokkeer()`) is ongewijzigd en geldt voor beide
  paden — daarmee zijn "invoer weer vrij", "bed loopt weer" en "staat
  bewaard" niet twee keer geïmplementeerd.
- **`spreadVerder()`** is nu één regel: `betreedZolder(false, true)`. Geen
  scène-toewijzing meer.
- **De `spread`-tak van `hervat()`** gebruikt dezelfde `herstelStand()`.
  Hij deed `wisselNaarScene(toestand.sceneId, "start")` en was daarmee
  wél kamer- maar niet standbewarend; wie herlaadt met het boek open en
  het dan dichtdoet, staat nu ook op zijn eigen plek. De save draagt dat
  al (`speler` staat in `overdraagbaar`, `js/logic/world.js`).
- **Chroom nagekeken, geen tekst gewijzigd:** `bladerVerder` ("spatie >")
  en `bladerLaatste` ("spatie: terug") kloppen nu allebei letterlijk;
  `test-spreads.mjs` bewaakt al dat de laatste-pagina-hint de pc niet
  belooft en dat ze naast het paginanummer past. Wél bijgewerkt: het
  commentaar bij `tekenSpread` zei nog dat de spatie je "in de werkhoek
  zet".
- **Docs:** `spelontwerp-legacy.md` (§De lus per level stap 2 en 3 + een
  `Beslissing`-blok, de modustabel, §Spread), `engine-architectuur.md`
  (nieuwe §"De stand bewaren" onder §De vloer, plus de `spread`-tag die
  nu zegt dat er géén sluit-tag is), `save-en-hints.md` (wat de save
  tussen sessies draagt: `modus`, `sceneId` en `speler`, en waarom dat
  sinds dit pakket niet louter cosmetisch is).
- **Walkthrough:** `deel1-hints.md` stap 2 zegt nu wat de spatiebalk doet
  en dat het boek je nergens brengt; stap 3 zegt "loop zelf" en wijst op
  `?`. Beide PDF's opnieuw gebouwd met de WP 39-keten (pandoc 3.10 +
  typst 0.15.0 uit de scratch-map).
- **Vier rooksmaaktesten** verloren hun teleport-assertie en kregen een
  echte wandeling (zie §Beslissingen).

## Beslissingen

- **De hint draagt de begeleiding, niet de teleport.** De teleport was
  ooit vriendelijk bedoeld: hij zette de speler bij de pc zodat hij niet
  hoefde te zoeken. Dat werk doet sinds WP 33 de progressie-hint (`?`,
  eerste tak: "Het hoofdstuk dat je opensloeg, is nog niet hersteld. Dat
  werk ligt op de pc, in de werkhoek aan de oostkant van de zolder." —
  nagemeten in Node) én `gebruikPc`, die uit zichzelf zegt waar het
  volgende blad ligt. Er valt dus geen begeleiding weg; er valt een
  bijwerking weg.
- **`herstelStand()` naast `wisselNaarScene`, geen vlag ín
  `wisselNaarScene`.** Een derde argument daar (`entryNaam` of "blijf
  staan") zou de betekenis van die functie verwateren: ze *is* de
  kamerwissel. Twee functies met elk één taak, en `betreedZolder` als de
  enige plek die kiest.
- **De pc-overlay houdt zijn entry.** `opADePc(false)` blijft
  `betreedZolder(false)` aanroepen. `startZitten` zet de speler op de
  hotspot van de stoel, en die ligt in een blok; hem daar laten staan zou
  hem in het bureau parkeren. Dat staat zo ook al in het commentaar bij
  `startZitten`, en de nieuwe §"De stand bewaren" noemt de reden expliciet.
- **Vangnet in plaats van vertrouwen.** `herstelStand()` keurt de stand
  eerst met `beloopbaar()`. Vandaag kán die stand niet fout zijn (elke
  schrijver van `speler.x/y` schrijft een beloopbare plek), maar deze
  functie leest uit een *save*, en dat is precies de plek waar aannames
  over de vorm van de wereld verjaren.
- **De smokes lopen echt, ze springen niet.** De vier bewakende
  asserties zijn omgedraaid ("na de spread sta je waar je het blad
  vond": zelfde scène én zelfde coördinaat, ±2 px), en vóór `ga zitten`
  staat nu een route naar de werkhoek in plaats van niets:
  `ROUTE_WERKHOEK` per kamer (west: twee keer oost; doorgang: een keer
  oost; overloop: zuid en dan oost). Elke route wordt afgesloten met een
  controle dát de speler in `zolder-oost` staat, en `ga zitten` bewijst
  daarna dat de pc daar nog opengaat. In `smoke-levels-4-7` kreeg ook
  `ontgrendel()` die route, want de navigatie naar het volgende fragment
  vertrekt daar vanuit de werkhoek.
- **Drie keuringen erbij die verder gaan dan "zelfde scène".** In
  `smoke-levels-1-3` loopt de speler voor level 2 met de pijltoets naar
  de gemerkte doos (x 300 → 240) vóór hij ze opent; de nieuwe controle
  eist dat hij ná het boek nog in de doorgang bij díe doos staat
  (x 240, hotspot 236 — dat is géén entry van de kamer, dus alleen een
  echt standbewarende sluiting haalt dit). In `smoke-browser` gaat de
  eerste stap na het boek te voet over de kamergrens (west → doorgang),
  wat tegelijk bewijst dat de invoerblokkering van de spread-modus echt
  weg is. En omdat de `hervat`-tak meeveranderde, herlaadt diezelfde test
  nu middenin het boek: het boek komt terug op zijn plek (`modus=spread`,
  `zolder-west` (300,175)) en wordt daarna in dezelfde beweging
  dichtgebladerd, zodat ook de sluiting ná een reload gedekt is.
- **`deel2-oplossingen.pdf` is teruggezet, niet vastgelegd.** De bron
  ervan is niet gewijzigd; de herbouw leverde een bestand op dat op 108
  bytes verschilde en die 108 bytes zijn allemaal `ModDate`,
  `CreationDate` en de document-id. Beide PDF's zijn dus wél herbouwd
  (bewijs in de QC), maar alleen deel 1 verandert in de commit.
- **De font-terugval van WP 39 staat er nog.** typst waarschuwt over
  "courier new" en "nimbus mono ps" en zet Liberation Mono; dat is de
  bekende open post uit WP 39 en niet iets dat dit pakket introduceert.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **423/423 groen**, ongewijzigd (dit
  pakket voegt geen headless test toe: de spread-flow zit in de engine en
  die is niet DOM-vrij; de bewijzen staan in de smokes).
- `tools/lint-scene.mjs` — alle scènes in orde.
- `tools/check-walkthrough.mjs` — **278 citaten en koppen gekeurd; 0
  afwijkingen** (was 276; de twee nieuwe zijn "spatie: terug" en `?`).
- `smoke-browser` **44/44** (was 41/41), `smoke-levels-1-3` **36/36**
  (was 32/32), `smoke-levels-4-7` **52/52** (was 48/48),
  `smoke-full-playthrough` **104/104** (was 97/97), `smoke-walk`
  **38/38** ongewijzigd.
- Gemeten standen, niet aangenomen: `smoke-browser` sluit het boek in
  `zolder-west` op (300,175), `smoke-levels-1-3` level 2 in
  `zolder-midden` op (240,175) en `smoke-levels-4-7` de levels 5–7 in
  `overloop` op (162,174) — telkens exact de stand van bij het
  openslaan. De sterkste van die drie is level 2: (240,175) is géén entry
  van de doorgang (die liggen op (20,175), (80,175), (300,175) en
  (170,132)), dus daar kan alleen een standbewarende sluiting uitkomen.
- **Negatieve controle gemeten**, twee keer. Met alleen `spreadVerder()`
  teruggedraaid naar de oude twee regels zakt `smoke-levels-1-3` naar
  **32/36**: de drie standcontroles (level 1 meldt `scene=zolder-oost
  (240,175) vs zolder-west (80,175)`) plus de doos-controle. Met
  `spreadVerder()` én de `hervat`-tak teruggedraaid zakt `smoke-browser`
  naar **41/44**: de reload-in-het-boek landt op de entry (80,175), de
  sluiting op (240,175) in `zolder-oost`, en de voetstap over de
  kamergrens vertrekt al uit de werkhoek. Geen andere keuring beweegt
  mee — de smokes meten dus precies dit gedrag en niet iets ernaast.
- **Het vangnet apart gemeten** met een wegwerpscript in de browser (niet
  in de repo, want het moet de staat kunstmatig kapotmaken): speler te
  voet naar x107 in de westhoek, boek open, dan `speler.x/y` met de hand
  ín het blok van de kist gezet (blok `[10,150,102,23]`, stand (12,172)),
  en het boek dichtgebladerd. Resultaat: `zolder-west` (80,175) — de
  entry `start`, beloopbaar, nul pagina-fouten. Zonder de terugval was dit
  een speler in de kist.
- PDF's: `walkthrough/tools/bouw-walkthrough.sh` exit 0 met pandoc 3.10 en
  typst 0.15.0 — deel 1 **8 pagina's / 150 123 bytes** (was 149 539),
  deel 2 **13 pagina's / 189 915 bytes** (byte-identiek op de tijdstempel
  na, dus teruggezet). Inhoud van deel 1 met `pdftotext` nagelezen: de
  nieuwe alinea over de spatiebalk en "spatie: terug" staat erin.
- Wrap op 80 tekens gecontroleerd (in tekens, niet in bytes) voor elke
  nieuwe doc-regel en voor deze entry; tabelrijen blijven zoals de rest
  van die tabellen.
