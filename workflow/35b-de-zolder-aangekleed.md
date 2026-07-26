# 35b — De zolder aangekleed

Ingelast werkpakket, door de manager toegevoegd na de QC van WP 35 (zie
`workflow/35-schaalpas.md`). Het is een afwijking van het goedgekeurde
programma van `workflow/28-kwaliteitsreview-kickoff.md`, en dit is de plek
waar die afwijking staat.

## Opdracht

De schaalpas heeft gedaan wat ze beloofde: elk voorwerp in de vier kamers
staat nu op één maat, gemeten aan een speler van 31 px. Wat ze en passant
óók deed, is de kamers leeghalen. Een geschilderde stapel die vroeger
62 × 148 px besloeg, is nu vier dozen van 16 × 13 — kloppend, en veel
kleiner. Op de screenshots van WP 35 stond daardoor in elke kamer een
grote lap kale wand en een brede leeg gepoetste vloer.

De opdracht: de zolder weer vol laten staan met wat een grootmoeder
opbergt, zonder de maatregel, de composities of de lichttaal te breken.
Aankleden op de juiste schaal, geen herontwerp.

## Aanpak

### De vondst: de strook vloer waar de speler niet komt

De goedkoopste plek om een kamer te vullen, is de strook tussen de
wandlijn en de voorrand van de loopstrook. In de westhoek is dat y126–150,
in de doorgang y124–150, in de werkhoek y126–150, op de overloop
y128–152 — vierentwintig pixels diep, over de volle breedte, en volledig
onbereikbaar voor de speler. Wat daar staat, heeft géén blok nodig: het
ligt al buiten elke walkbox. En omdat de speler dichterbij staat, dekt hij
het netjes af zodra hij ervoor langs loopt.

Het gevolg voor dit werkpakket is groot: er is in de vier kamers samen
geen enkel nieuw blok bij gekomen. De loopruimte, de corridors naar elke
uitgang en de routes van `smoke-walk.mjs` zijn onaangeroerd gebleven,
terwijl het aantal voorwerpen ruim verdubbeld is. Alles wat nieuw is,
staat met zijn voet boven de loopstrook of op iets anders.

### Per kamer

**Westhoek (`zolder-west`) — het archief**

De lichtbundel uit het dakraam is de compositie van deze kamer, dus de
aankleding staat volledig in de dónkere helft: links van x176, tussen de
staander op x36 en het raam op x194. De straal, de kist, het notitieboek
en het stof zijn niet aangeraakt.

- De achterste stapel is een doos per kolom hoger: vier links (top y74),
  drie rechts, met een koffer van 15 × 9 px bovenop op y65. "Dozen tot
  tegen de balken" staat in de kamerbeschrijving; met een top op y87
  haalde de stapel de gording op y44 niet in de buurt.
- Een wandplank van 64 × 3 px op y100 met vier weckpotten (4 × 6) en een
  blikken trommel, en een tweede, kortere plank op y76 met boeken en twee
  blikken.
- Een kapstok van 46 × 3 px op y60 met twee winterjassen (49/51 en
  43/45), elk met een schouderknik. De eerste versie was een rechthoek
  per jas en las als twee planken tegen de muur.
- Twee koffers op elkaar en een gieter onder de plank, voet op de
  wandlijn y126.
- Drie opgerolde tapijten staand tegen de wand (x122–141, voet y133) en
  twee schilderijlijsten met de rug naar voren (x146–174, voet y133).
- Een schemerlamp van 14 × 30 px (kap in papier-ramp, voet y141) en een
  wasmand van 14 × 9 px met linnen erin (voet y145).
- Een deken over de voorste stapel: de bovenste rij één stap lichter dan
  de plooi eronder.

**Doorgang (`zolder-midden`)**

De trapopening (x140–199) en de corridor eronder zijn niet aangeraakt: dat
is de doorgang, en de kamer moet haar drie uitgangen leesbaar houden. De
aankleding staat er strikt naast.

- Links van de trap: een stapel van vier plus twee dozen met label
  (x60–91, voet y136), een houten ladder van 17 × 64 px tegen de wand
  (x102–118) en een emmer.
- In de hoek links, in de lichtveeg: twee dozen (x8–39, voet y146), met
  een omtrek van één pixel omdat het licht daar het hardst binnenvalt en
  het karton anders in de opgelichte vloer overloopt.
- Rechts van de trap: een wandplank op y92 met potten en een blik, een
  staande spiegel van 14 × 27 px onder een stoflaken (voet y136), twee
  koffers met een tafelventilator erop (korf van drie ringen), en nog een
  stapel van twee dozen tegen de staander.

**Werkhoek (`zolder-oost`)**

Het bureau, de stoel, de pc, het toetsenbord en de mok zijn onaangeroerd —
die groep ís de kamer, en WP 35 heeft haar net rechtgezet. De rest van de
werkhoek is eromheen gebouwd.

- Een plank met mappen boven het bureau (x162–222, y112). Ze valt binnen
  de gloedkoepels van de monitor, die achteraan in de picture staan, dus
  de mappen krijgen dezelfde amberrand als het blad eronder. Zo hoort de
  plank bij de werkplek.
- Een prikbord van 40 × 28 px met papiertjes, en een wandklok van 16 px
  die stilstaat. Het bord kreeg één shadow-stap over het hele vlak: op
  volle papierhelderheid trok het het oog weg bij de monitor, en die is
  hier de lichtbron.
- Een archiefkastje van 16 × 25 px met drie laden (voet y148), met een
  tafelventilator erop.
- Een naaitafeltje van 34 × 16 px met Alberta's naaimachine erop (22 × 12,
  als C-silhouet: voetstuk, zuil, arm), en een plankje met garenklosjes
  erboven. Ze deed hier meer dan programmeren.
- Een kader, een opgerold tapijt en twee dozenstapels tegen de wand.
- Een tweede staander op x276. De westhoek en de doorgang hebben er
  allebei twee; hier stond er één, en dat maakte van de oostelijke helft
  van de wand één ononderbroken vlak van 120 × 70 px.

**Overloop (`overloop`)**

Dichter en smaller, zonder de uitgang te knijpen: het trapgat, de leuning
en de uitgangszone op x148–175 zijn onaangeroerd.

- Een vierde toren tussen de linkertorens en de trap (x106–121, voet
  y148) met een koffer erop, een toren van drie rechts van de trap
  (x200–215) met blikken en boeken erop, en een derde in de rechterhoek
  (x284–315), waar de hoekschaduw hem nog een stap dieper zet.
- Drie opgerolde tapijten staand tegen de wand (x62–84), met een
  touwband over elke rol.
- Een wasmand naast de rechtertoren, een koffer op de middelste toren, en
  een deken over de rechtertoren — in de steen-ramp en niet in de
  avond-ramp, want op de overloop is het karton de énige warme kleur en
  dat hoort zo te blijven.

## Beslissingen

**De wand boven het trapgat blijft leeg.** Er stond een plank met blikken
en boeken op y96, en ze vulde precies het grootste kale vlak van de vier
kamers. Ze is er weer uit gehaald: `onderzoek wand` op de overloop zegt
letterlijk *"Aan deze kant van de zolder is nooit iets opgehangen."* Een
plank op klossen is opgehangen. De keuze was de prose aanpassen of de
plank schrappen, en de prose had gelijk — er is daar ook geen vloer om
iets op te zetten, want er zit een gat in. De blikken en de boeken staan
nu op de toren rechts van de trap. Het is het enige grote lege vlak dat na
dit werkpakket overblijft, en het hoort er te zijn: de overloop is de
kale, koude kamer.

**Geen enkel nieuw blok.** Zie hierboven: alles staat in de strook vloer
die buiten de walkboxes valt. Dat is geen toeval maar de gekozen
ontwerpruimte, precies omdat de loopbaarheid van WP 32 en de smoke-routes
niet ter discussie stonden.

**De drapé-regel is nieuw en staat nu in de stijlgids.** Een deken over
een stapel of een laken over een spiegel krijgt zijn bovenste rij één stap
lichter dan de plooi eronder, in de ramp van de kámer: avond beneden,
steen op de overloop, papier voor een stoflaken. Zonder dat verschil leest
de stof als nog een doos in een andere kleur — de eerste versie van de
deken in de westhoek deed precies dat.

**De maatkeuring stuurde de kleurkeuze.** `test/test-schaal.mjs` telt élk
vlak van minstens 12 × 10 px in 25 of 26 als een doos, telt de rechthoeken
in 52 op het bureaublad (de mok) en de smalle hoge rechthoeken in 25 (de
bureaupoten). Drie nieuwe voorwerpen zijn daarom van kleur veranderd
vóór ze getekend werden: de wasmanden staan in hout hooglicht (27) in
plaats van karton, de mappen op de plank in de papier- en steen-ramp in
plaats van in hout warm, en de emmers en gieters in de steen-ramp. De
keuring was hier geen hindernis maar een ontwerpaanwijzing: ze houdt de
karton-kleuren voorbehouden aan karton.

**De staander van de schemerlamp staat in 22 en niet in 23.** Onder y126
staat hij op de vloer, en die vloer ís hout 23. Een paal in de kleur van
zijn ondergrond bestaat niet. Dezelfde regel als de bureaupoten in WP 35,
en dezelfde fout, één werkpakket later opnieuw gemaakt en meteen
rechtgezet.

## Prose

Veertien nieuwe `onderzoek`-teksten in `js/logic/strings.js`, met hun
woordkoppeling in `js/logic/world.js`. Geen enkele kamerbeschrijving is
veranderd: er is geen zin onwaar geworden, alleen maar wáárder — "dozen
tot tegen de balken" klopt nu beter dan voor dit werkpakket.

- westhoek: `plank`, `jassen`, `tapijten`, `kaders`, `lamp`
- doorgang: `ladder`, `spiegel`, `ventilator`, `koffers`
- werkhoek: `prikbord`, `archiefkast`, `klok`, `naaimachine`, `mappen`
- overloop: `tapijten`, `wasmand`

Twee koppelingen vroegen om zorg, want de woordherkenning werkt op
deelstrings en de eerste treffer wint. `kap` staat niet bij de lamp, want
het zit in `kapstok`. En `naaimachine` staat vóór `pc`, want `pc`
aanvaardt `machine`; wie kortweg "machine" typt, krijgt nog altijd de pc,
en dat is de machine die deze kamer draagt.

De koffer in de westhoek heeft géén eigen sleutel gekregen. `koffer` wijst
daar al naar de kist, in `onderzoek` én in `open`, en dat splitsen zou een
bestaande keuring (`in de westhoek zijn de dozen en de kist te openen`)
tegenspreken voor een prop op de bovenste doos van een stapel. In de
doorgang, waar geen kist staat, wijst `koffer` wel naar de koffers.

## Op-tellingen

Per scène, picture + overlays, vóór → na:

- `zolder-west` 82 → 171
- `zolder-midden` 59 → 135
- `zolder-oost` 49 → 142
- `overloop` 80 → 137
- vier kamers samen 270 → 585; alle scènes samen 455 → 770

De werkhoek is bijna verdrievoudigd en dat is bewust binnen de perken
gebleven: een picture wordt één keer geïnterpreteerd en daarna als geheel
geblit (`cacheScene`/`blitScene`), dus deze ops kosten laadtijd en geen
beeldtijd. Wat élk frame getekend wordt, zijn de overlays, en die zijn
onveranderd gebleven op respectievelijk 3, 9, 3 en 2 ops.

## QC

- `node --test test/test-*.mjs` — **382/382 groen**, 0 rood. Geen nieuwe
  test: dit pakket voegt geen mechaniek toe, en de maten worden al bewaakt
  door `test-schaal.mjs`, dat over álle geschilderde dozen loopt en dus
  ook over de nieuwe.
- `node tools/lint-scene.mjs` — alle elf scènes OK.
- `node tools/check-assets.mjs` — geen drift, negen editor-modellen
  byte-getrouw.
- `node test/smoke-browser.mjs` — 38/38 PASS.
- `node test/smoke-walk.mjs` — 25/25 PASS. Alle botsproeven geven dezelfde
  coördinaten als voor dit pakket (kist x175, dozen x112, muur x311,
  bureau y168, torens x122, voorrand y188): het bewijs dat er geen
  loopruimte verdwenen is.
- `node test/smoke-full-playthrough.mjs` — 97/97 PASS.

Screenshots in `test-results/`: `wp35b-zolder-west.png`,
`wp35b-zolder-midden.png`, `wp35b-zolder-oost.png`, `wp35b-overloop.png`,
en vier voor-na-stroken op dubbele grootte
(`wp35b-voor-na-<kamer>.png`, links de render van HEAD, rechts deze).

## Docs mee

`docs/art-stijlgids.md`: de drapé-regel en de kleurafspraak voor het
overige zoldergoed bij de vaste toewijzingen, en twaalf rijen bij de
maattabel (koffer, opgerold tapijt, schilderijlijst, schemerlamp,
wasmand, archiefkastje, staande spiegel, ladder, naaimachine, wandplank,
weckpot).
