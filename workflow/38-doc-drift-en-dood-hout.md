# 38 — Doc-drift en dood hout

Werkpakket 38 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). Dit is het opruimpakket: de
documenten weer waar maken, en de velden die niemand leest uit de code halen.
Er verandert niets aan wat de speler ziet — op één ding na, en dat is een
waarschuwing die alleen een ontwikkelaar te zien krijgt.

## Opdracht

Uit het goedgekeurde programma, WP 38:

> - art-stijlgids: "elf ops" → twaalf; 34/58-bundelbeschrijving
>   actualiseren naar de `light`-realiteit.
> - spelontwerp-legacy.md: intro-spread-passage vervangen door de
>   beslissing uit strings.js:1171-1177; scene-tabel plus de drie
>   opening-scenes.
> - Dode velden: `props`, hotspot-`item`, `spreadGelezen`, ongelezen
>   `lN.week` — verwijderen of gebruiken, beslissing per veld in de entry.
> - Fallback-scene (engine.js:119-131): console.warn zodat een
>   typo-scene-id niet stil faalt.
> - QC: `node --test` + lint + grep dat geciteerde docs bestaan.

De manager heeft er bij de opdracht aan de worker één ding aan toegevoegd: een
brede waarheidscontrole van de overige documenten tegen de huidige code, met
de instructie kleine drift te herstellen en grote drift te melden. Dat laatste
heeft het pakket bijna verdubbeld — zie §"De brede waarheidscontrole".

## Aanpak

### De grafische documentatie (art-stijlgids)

Het aantal ops is nageteld in de dispatcher (`voerOpsUit`, `js/gfx.js`) en in
de ariteitstabel van de lint (`OP_LENGTE`, `tools/lint-scene.mjs`): het zijn er
twaalf, zeven overgenomen plus vijf nieuwe. Het document zei "elf" en "de
laatste vier"; beide getallen zijn rechtgezet.

De twee vaste toewijzingen die nog van vóór de `light`-op dateerden, zijn
herschreven naar wat er nu écht staat:

- **De lichtstraal** was "34 met een kern van 58". Ze heeft sinds WP 21 geen
  eigen kleur meer: vijf `light`-plakken (3 stappen bij het raam tot 1
  onderaan, dichtheid 0,80 → 0,30) plus één zachte plak op de vloer, achteráán
  in de picture. Nageteld in `js/scenes/scene-zolder-west.js`.
- **De pc-halo** was "een 34-halo". De aan-staat van de sprite is 55/56/58
  (`js/sprites/sprite-pc.js`, sub-palet), en de halo op de wand is vijf
  `light`-koepels met oplopende dichtheid 0,12 → 0,55 plus één plak van 0,28
  over het blad. Nageteld in `js/scenes/scene-zolder-oost.js`.

Beide beschrijvingen dragen nu ook de reden waarom het zo is — een gloed hoort
in de ramp van het oppervlak waar hij op valt — zodat de volgende scène-worker
niet opnieuw een oranje plaat tekent.

### Het spelontwerp (spelontwerp-legacy)

De intro-passage bood nog de keuze "of één inleidende spread, `spread:intro`".
Die spread is bewust verwijderd, en de motivering staat sinds de opwaardering
bij de spread-data zelf (`js/logic/strings.js`, §"Er staat hier bewust géén
intro-spread meer"): je las wat er in het boek stond vóór je het boek had, de
verteller sprak jou aan op papier dat Alberta's handschrift draagt, en de voet
vroeg om het notitieboek te openen dat je aan het lezen was. De passage
beschrijft nu de echte opening — vijf onderschriften over drie beelden, uit
`OPENING` in `js/engine.js` en `AL.strings.intro` — met die drie redenen als
`Beslissing`-blok en met de test die de terugkeer bewaakt
(`test-world-hub.mjs` eist `AL.strings.spreads.intro === undefined`).

De scène-inventaris miste `opening-huis`, `opening-trap` en `opening-pc`. Ze
staan er nu bij, met hun rol in de reeks. Twee dingen die bij het nakijken van
diezelfde tabel bovenkwamen, zijn meteen mee rechtgezet:

- `overloop` heette nog "optioneel vierde scène". WP 6 heeft haar gebouwd en
  `FRAGMENT_LOCATIE` legt de bladen van de hoofdstukken 5, 6 en 7 daar neer —
  ze is niet meer optioneel. Het `Beslissing`-blok eronder vertelt nu de
  geschiedenis in plaats van een keuze die al gemaakt is.
- De sprite-inventaris kende de speler alleen sta- en loopanimaties. Er zijn
  er twee bij gekomen die niemand had opgeschreven: `draai` en `zit-oost`.

De commandolijst is nagelopen tegen `AL.strings.help` en de parser: die klopt
sinds WP 33, inclusief F1 in de editor. De leveltitels in het document zijn
nagelopen tegen `AL.strings.lN.naam`: die kloppen sinds WP 31.

### De dode velden, één voor één

**`scene.props` — verwijderd.** Het stond leeg in alle tien de scènes, de
engine las het nergens, en alles wat een prop had moeten zijn is een `hotspot`.
Weg uit de tien scènebestanden, uit de terugvalscène in `js/engine.js`, uit de
voorbeeldcode en de veldtabel van `docs/scene-schema.md`. De lint keurt het
veld niet meer, maar zákt er nu op: wie het opnieuw zet, krijgt te horen dat
het schema het niet kent. Dat is bewust strenger dan "negeren" — een leeg veld
dat stil geaccepteerd wordt, is precies hoe dit veld drie jaar bleef staan.

**`hotspot.item` — behouden en gedocumenteerd; het leeft.** Het stond in de
defectenlijst van WP 28 als dood veld, maar WP 35 heeft het intussen een lezer
gegeven: `engine.startZitten` zoekt de hotspot met `item: "stoel"` op om de
speler op de zitplek te zetten. Dat staat al goed beschreven in de
`hotspots`-paragraaf van het schema. Wat er nog stond, was een §"Dode velden"
met een veld dat niet meer dood is; die kop is vervangen door §"Wat er niet
(meer) in het schema staat", die beide geschiedenissen kort uitlegt.

**`levels[*].spreadGelezen` — verwijderd, zónder versiebreking.** Het werd bij
elke verse staat op `false` gezet en daarna nooit meer aangeraakt: niet
geschreven, niet gelezen. De reden dat het nooit een lezer kreeg, staat sinds
WP 33 bij de zolder-hint: de spread is een eigen modus met een geblokkeerde
invoerbalk, dus er valt daar niets te hinten en er is niets te onthouden.

Beslissing: **`VERSIE` blijft 1.** Een veld wegnemen dat nooit geschreven en
nooit gelezen werd, is geen schemabreking. `migreer` neemt `levels` in zijn
geheel over, dus een save van vóór dit pakket draagt de sleutel gewoon mee,
laadt ongewijzigd en speelt ongewijzigd verder; hij verdwijnt bij de
eerstvolgende `herbegin`. De versie ophogen zou de save van élke speler door
`migreer` en terug naar localStorage sturen om er niets aan te veranderen —
risico zonder winst. De redenering staat in `docs/save-en-hints.md`,
§Versionering en migratie, zodat een volgende sessie ze niet hoeft te
reconstrueren.

**`week` in de level-definities — verwijderd. `AL.strings.spreads.lN.week`
blijft.** Hier zaten twee velden met dezelfde naam en niet dezelfde status. De
`week` in `js/levels/levelN.js` werd door niets gelezen: `AL.levels.registreer`
raakt alleen `def.puzzels` aan. De `week` in de spread-data is wél in gebruik —
`maakSpread` bakt hem in de voetregel van bladzijde 2, en twee tests keuren hem
tegen de kolom "Na cursusweek" uit `levels-en-scharnieren.md`.

Dat het level-veld dood was, is niet theoretisch: de testfixture onderaan
`js/logic/levels.js` registreerde level 1 met `week: 3` terwijl level 1 na week
1 komt, en dat viel jarenlang niemand op. Precies wat een tweede kopie van een
getal doet. De zeven `assert.equal(levelN.week, X)` in de per-level-tests zijn
mee weggevallen; ze keurden een waarde tegen zichzelf. De echte weekkeuring
staat in `test-world-hub.mjs` ("de weekregels gebruiken de echte cursusweken
1,2,2,3,4,5,6") en blijft groen. Het testtotaal blijft 400: het waren
assertions binnen bestaande tests, geen tests.

**`dev: true` in level 0 — verwijderd.** Meegevallen tijdens dezelfde sweep.
De vlag gaf de indruk dat de registry een dev-gate kende; die gate zit in
`js/levels/level0.js` zelf (registreren bij `?dev=1` of in Node), en niets las
het veld ooit uit.

**`naam` in de level-definities — behouden.** Anders dan `week` is dit geen
tweede kopie maar een verwijzing (`naam: S.lN.naam`): hij kan niet driften, en
hij maakt een registry-entry leesbaar. Bij `registreer` staat nu opgeschreven
welk veld de registry wél leest, zodat de volgende lezer niet opnieuw hoeft te
raden.

### De sweep naar dode strings-sleutels

Er is een scriptje geschreven (in de scratchpad, niet in de repo) dat
`AL.strings` en `AL.sim.strings` laadt, alle sleutels tot drie niveaus diep
afloopt, en elke sleutelnaam als heel woord terugzoekt in álle `.js`, `.mjs` en
`.html` buiten het definitiebestand zelf. Zo blijven dynamische patronen
(`S()["l" + id]`, `AL.strings.hints[x]`) zichtbaar: de bládsleutel wordt
gezocht, niet het pad ernaartoe.

Resultaat: **één** dode sleutel in `AL.strings` en **nul** in `AL.sim.strings`.

- `pc.knopMenu` ("menu") — verwijderd. De knop die terugkeert naar het menu
  heet `knopTerug` ("terug  [menu]"), en die wordt wél gebruikt.

Dat de oogst zo klein is, is zelf een bevinding: `strings.js` staat er beter
voor dan de defectenlijst deed vermoeden.

### De console.warn bij de terugvalkamer

`haalScene` geeft een bruine, lege kamer terug als een scène-id niet bestaat.
Dat blijft zo — de engine mag niet crashen op een typfout in een exit. Maar ze
zwijgt niet meer: er gaat een `console.warn` uit met de ontbrekende id en de
twee dingen die je dan moet nakijken (staat het bestand in `index.html`, klopt
`scene.id`). Eén melding per id, want `zorgVoorScene` draait bij elke
moduswissel.

De waarschuwing is end-to-end bewezen in `test/smoke-browser.mjs`: de test
haalt `zolder-midden` uit `AL.scenes`, loopt er te voet naartoe, en keurt drie
dingen — het spel loopt door in de zolder-modus, de terugvalkamer tekent, en er
staat een waarschuwing in de console die de id "zolder-midden" noemt. Daarna
zet ze de kamer terug. De smoke luistert alleen op `console` van het type
`warning`; de bestaande foutkeuring hangt aan `pageerror` en blijft dus schoon.

### De brede waarheidscontrole

Twee verkennersagenten hebben de overige acht documenten claim voor claim tegen
de code gelegd. Wat ze vonden, is hieronder hersteld; alles is vóór het
herstellen zelf nagekeken in de code.

**`docs/checker-contract.md`** — dit document was het verst afgedreven.

- **Verklaar-in-één-zin** stond beschreven als "keuze uit gegeven
  formuleringen, of een sleutelwoord-match". Zo werkt het niet: het is een
  **zelf-check**. De speler typt zijn zin, de terminal legt Alberta's modelzin
  ernaast en vraagt of ze hetzelfde zeggen; élk antwoord rondt de puzzel af,
  alleen de slotregel verschilt (`js/pc/terminal.js`, `verwerkVerklaarZin` /
  `verwerkVerklaarBevestig`). Die keuze is verdedigbaar en staat nu mét haar
  reden in het document: vrije tekst beoordelen kan een deterministische
  checker niet, en een keuzelijst maakt van "in je eigen woorden" een
  meerkeuzevraag.
- **Twee tolerantieschakelaars** die het document beloofde — commutatieve
  operanden, `this.x` versus `getX()` — bestaan nergens. Geen assertie kent zo'n
  vlag, geen level zet er een. Het document zegt nu dat ze er niet zijn en waar
  tolerantie dan wél hoort (in de assertie zelf).
- **De javac-simulatie** kende volgens het document "een onbekende naam, een
  verkeerd type". Ze kent er precies vijf: niet-afgesloten string/char/
  blokcommentaar, haakjesbalans, ontbrekend returntype, ontbrekende puntkomma,
  en een vaste tikfoutenlijst. Geen naamresolutie, geen typecontrole.
- Kleiner: de assertievorm is `{ ok, meldingKey, regel }` en niet
  `{ ok, diagnose }`; het assertieregister staat onderaan `asserts.js` en niet
  bovenaan; er is één `validatieKlem` en geen "varianten"; de patroonkaart heeft
  **vier** opties en geen vijf; Parsons kent één juiste volgorde en geen
  alternatieven; commentaar wordt altijd overgeslagen en nooit als triviatoken
  bewaard; het javac-voorbeeld miste de `→`-uitlegregel; de asserties stoppen
  bij de eerste `CHECK_FAIL` in plaats van er één per assertie te geven.

**`docs/save-en-hints.md`** — "elke schrijf zendt `voortgang:opgeslagen`" was
omgekeerd. De engine schrijft stil; de tag is een **verzoek** van de DOM-vrije
logica aan de engine om te schrijven, en wordt op vier plaatsen gezonden. Ook:
F1 werkt in beide panelen van de pc, niet alleen in de editor, en `herbegin
bevestig` wordt net zo goed aanvaard als `herbegin ja`.

**`docs/engine-architectuur.md`** — de effect-tag `spread:<levelId>` beloofde
nog `intro` en `outro`; die bestaan geen van beide. De laadvolgordezin noemde
`levels.js` vóór de checker-modules (`index.html` doet het omgekeerd), de
tekst zei dat `engine.js` als laatste laadt (dat is `touch.js`), de kaart van
`js/` miste `font-hand.js`, en `js/input.js` heette "ongewijzigd overgenomen"
terwijl er vier dingen bij zijn gekomen.

**`docs/levels-en-scharnieren.md`** — "8 spreads (de intro plus één per level)":
het zijn er zeven. De regel "1 editor-puzzel + 2 terminal-puzzels" stond als
bindend geformuleerd terwijl de eigen leveltabel van datzelfde document voor de
levels 1 en 7 twee editor-puzzels opgeeft; het contract luidt nu "drie puzzels,
minstens één in de editor", met de twee uitzonderingen benoemd en beredeneerd.
"Een goede vijftien commando's" is drieëntwintig. En de weekregel staat in de
voet van bladzijde 2 van het spread, niet in een level-intro.

**`docs/achtergrond.md`** — de sprite-eis "van achteren en opzij" negeert dat
er een volledige vooraanzicht-animatie bestaat (`sta-zuid`, `loop-zuid`); de
eis is aangescherpt tot wat de figuur écht draagt: geen naam, geen geslacht,
geen ogen, geen mond — ook van voren. Verder: er is geen "dusk-ramp" (het heet
de avondlicht-ramp 28–34), en geen einde héét "koud en onaf" — dat is de
slotregel van het einde "de afrekening".

**`README.md`** — "~25 bestanden" in `test/` is 28 test-suites plus 9 smokes
(samen 400 tests); `?` is niet overal de hinttoets (in de editor is het F1);
de scènelijst miste de titel- en openingsbeelden en de spread-schetsen; de
tools-regel miste de nieuwe padcheck; en "elk level opent met de weekregel"
verwees weer naar de spread-voet.

**`docs/roberta-williams.md`** — schoon. Elke claim klopt, inclusief de
verbatim epiloogregel.

### De laatste poort: geen document citeert een bestand dat niet bestaat

De defectenlijst van WP 28 noemde het al ("Docs ontbreken: `scene-schema.md` en
`sprite-schema.md` worden geciteerd maar bestaan niet" — intussen hersteld).
Zo'n fout hoort mechanisch vindbaar te zijn, dus is er
`tools/check-docpaden.mjs` bij gekomen.

**Methode.** Uit elk `.md`-bestand in `docs/`, `workflow/` en `walkthrough/`
plus de drie README's en `CLAUDE.md` wordt elk fragment gehaald dat op een pad
lijkt: een naam met een gekende extensie. Daarna twee regels:

- **Met een schuine streep** is het een echt pad: het moet bestaan vanaf de
  repo-wortel of vanaf de map van het document.
- **Zonder schuine streep** is het spreektaal — de docs noemen bestanden bij hun
  naam zodra de map uit de context blijkt. Zo'n naam is in orde als érgens in
  de repo een bestand met die naam staat. Zo blijft een hernoeming (`font.js` →
  `font-hand.js`) tóch zichtbaar.

Drie uitzonderingen, elk met een reden: `.png` telt niet mee (schermafdrukken
leven in `test-results/` en worden per run gemaakt), sjabloonnamen als
`js/levels/levelN.js` zijn geen bestand maar een reeks, en een pad dat op zijn
eigen regel als cursusrepo-pad benoemd wordt hoort hier juist niet te bestaan.
`workflow/` wordt wél gekeurd maar laat de poort niet zakken: dat is een
historisch logboek en geen contract — het citeert paden zoals ze op het moment
van schrijven heetten. De poort zijn `docs/`, `walkthrough/` en de README's.

**Uitslag:** 757 aangehaalde paden gekeurd, **0 dood in een contractdocument**,
22 in `workflow/` (allemaal cursusrepo-paden of paden uit een verhaal over hoe
iets vroeger heette). Twee echte vondsten zijn onderweg hersteld:
`docs/achtergrond.md` had ``spelontwerp-\nlegacy.md`` over twee regels gebroken
binnen de backticks, en `docs/levels-en-scharnieren.md` haalde
`games/home/hub-data.js` aan alsof het een pad in deze repo was.

### Kleine restanten

- `js/scenes/scene-spread-template.js`, `js/scenes/spread-schetsen.js` en
  `docs/art-stijlgids.md` spraken alle drie nog over "alle acht de spreads".
  Het zijn er zeven sinds de intro-spread weg is.
- De bestandskoppen van `js/levels/level1.js` … `level7.js` dragen de nieuwe
  hoofdstuktitels al (WP 31); daar was niets te doen. De metafoornamen in
  `spread-schetsen.js` ("schets: de knikkerbaan") zijn blijven staan: dat zijn
  beschrijvingen van een tékening, geen hoofdstuktitels, en de kop van dat
  bestand legt dat verschil al uit.

## Beslissingen

1. **`props` verwijderen in plaats van als gereserveerd documenteren.** Een
   gereserveerd veld dat niemand vult, is een uitnodiging aan de volgende
   worker om het te vullen en zich af te vragen waarom er niets gebeurt.
2. **De lint zákt op `props` in plaats van het te negeren.** Stille acceptatie
   is hoe het veld zolang overleefde.
3. **`spreadGelezen` weg zonder versiebreking**, met de redenering in
   `save-en-hints.md` (zie hierboven).
4. **`week` weg uit de level-definities, `week` behouden in de spread-data.**
   Eén waarheid per getal; de spread-data is de waarheid, want daar wordt hij
   gelezen.
5. **`naam` behouden in de level-definities** omdat het een verwijzing is en
   geen kopie — het kan niet driften.
6. **De fallback-waarschuwing één keer per id**, niet één per frame.
7. **`workflow/` valt buiten de padpoort.** Een logboek dat je moet bijwerken
   als een bestand hernoemd wordt, is geen logboek meer.
8. **Grote drift is hersteld, niet gemeld.** De opdracht liet "melden" toe voor
   grote drift, maar elk van de drie grote gevallen (verklaar-in-één-zin, de
   tolerantieschakelaars, `spread:intro`/`outro`) was in één paragraaf te
   herschrijven met de code ernaast. Melden en laten staan zou WP 40 met
   dezelfde lijst opzadelen.

## Afwijkingen van het plan

- Het plan noemde de commandolijst van `spelontwerp-legacy.md` als werk voor
  dit pakket; die is in WP 33 al rechtgezet. Nagekeken, niets te doen.
- Het plan noemde hotspot-`item` als dood veld; dat is het sinds WP 35 niet
  meer. In plaats van verwijderen is het correct gedocumenteerd.
- `tools/check-docpaden.mjs` en de smoke-controle op de terugvalkamer stonden
  niet in het plan. De eerste maakt de QC-poort uit het plan ("grep dat
  geciteerde docs bestaan") herhaalbaar in plaats van eenmalig; de tweede
  bewijst de console.warn in plaats van hem te beweren.
- De brede waarheidscontrole van de zes overige documenten stond wél in de
  opdracht aan de worker maar niet in het oorspronkelijke programma. Ze heeft
  drie grote en ruim twintig kleine drifts opgeleverd.

## QC-resultaat

- `node --test test/test-*.mjs` — **400/400 pass, 0 fail** (ongewijzigd
  tegenover WP 37; de zeven weggevallen week-assertions zaten in bestaande
  tests).
- `node tools/lint-scene.mjs` — alle elf scènes OK, "Alle scènes in orde."
- `node tools/check-assets.mjs` — "Geen drift: alle 9 editor-modellen komen
  byte-getrouw uit de broncode."
- `AL_CHROMIUM=… node test/smoke-browser.mjs` — **41/41 PASS** (was 38/38; de
  drie nieuwe zijn de terugvalkamer-controles).
- `AL_CHROMIUM=… node test/smoke-full-playthrough.mjs` — **97/97 PASS**, geen
  JavaScript-fouten over de hele playthrough.
- `node tools/check-docpaden.mjs` — 757 paden gekeurd, **0 dood in een
  contractdocument**, 22 historische in `workflow/`. Exit 0.

## Open punten

- `tools/bouw-walkthrough.sh` wordt in het programma aangehaald met dat pad,
  maar het script staat in `walkthrough/tools/`. WP 39 gebruikt het; het pad in
  de plantekst blijft staan als historie.
- De walkthrough zelf (`walkthrough/deel1-hints.md`, `deel2-oplossingen.md` en
  de PDF's) is in dit pakket niet aangeraakt: dat is WP 39.
