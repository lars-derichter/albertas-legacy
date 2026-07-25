# 23 — Het notitieboek

Werkpakket G van het opwaarderingsprogramma (zie
`workflow/15-opwaardering-kickoff.md`). Doel: de spreads doen eindelijk wat het
spelontwerp van ze zegt — "de meeste nieuwe beelden per level dragen".

## Opdracht

Uit het goedgekeurde plan, WP G:

- per level een eigen papierachtergrond met de beschadiging *waar de puzzel
  zit*, in plaats van één gedeelde koffievlek voor alle acht
- Alberta's schetsen per scharnier-metafoor, zoals de stijlgids ze al opsomt:
  blauwdruk-en-doos (1), trechters (2), knikkerbaan (3), twee pijlen één doos
  (4), patroonkaart (5), plankenbrug (6), dubbele pijl (7)
- handschrift met de font uit WP F
- QC: `lint-scene` schoon; elke spread bekeken; `docs/art-stijlgids.md`
  bijgewerkt waar de implementatie afwijkt

## Aanpak

### Zeven schetsen

`js/scenes/spread-schetsen.js` is nieuw en draagt per level een `schets` en een
`schade`. Het is bewust géén scène — vandaar de bestandsnaam zonder
`scene-`-voorvoegsel, want de scène-lint verzamelt alleen `scene-*.js`. Een
schets heeft geen walkbox, geen entries en geen hotspots; het is een blok
draw-ops binnen een vast kader.

Dat kader is `AL.spreads.BLAD.schets`: de onderste helft van de
rechterbladzijde, x 170–298, y 100–162. De tekst van díé kolom stopt erboven;
het linkerblad loopt door tot onderaan.

De schetsen staan op de **tweede** bladzijde van een spread. Dat is niet
willekeurig: dat is de bladzijde waar Alberta de opdracht geeft, en haar tekst
verwijst er ook naar — *"schrijf Geitje helemaal uit volgens de schets
hieronder"*, *"ik heb de kaarten in de kantlijn getekend"*. Die zinnen wezen tot
nu toe naar niets.

Tekenstijl: inkt (41) voor de lijn die telt, 40 voor wat lichter is aangezet —
arcering, hulplijnen, maatstreepjes. Kleur alleen waar de stijlgids het
toestaat: 12 voor een rode doorhaling (null, void), 44 voor een groen vinkje of
een
gevonden-cirkel. Het is een balpen op papier, geen illustratie.

### Het papier

Het sjabloon zette twee lichte rechthoeken bovenaan elke bladzijde, wat als een
plakker leest. Dat zijn nu twee verlopen: elk blad is licht in het midden en
donkerder naar de rug toe, want daar buigt het papier weg van het licht. De
stijlgids vroeg dat al.

Erbij gekomen: korrel, en **liniatuur**. Een notitieboek is gelinieerd, en de
regelafstand van die lijnen is exact `BLAD.regelH`, zodat Alberta's handschrift
erin valt in plaats van erover. Dat ene detail doet meer voor "dit is een
notitieboek" dan alle vlekken samen.

## Beslissingen

### De schetsen gaan door dezelfde lint als de scènes

Zeven schetsen zijn een paar honderd met de hand geplaatste draw-ops. Eén
coördinaat naast het blad of één kleur buiten het palet is met het blote oog pas
te zien als je toevallig díé bladzijde opslaat. `tools/lint-scene.mjs` heeft er
daarom een eigen pas bij gekregen die elke op-lijst door dezelfde `keurOp` haalt
en controleert dat alle zeven levels een schets hébben.

### Beschadiging vreet aan, ze gumt niet uit

De eerste versie stond op een dichtheid van 0,38 tot 0,42 op kleur 39. Op het
scherm was dat zand, geen wasplek — en bij level 3 was de klem onder de vlek
gewoon niet meer te vinden. Een vlek hoort de tekening aan te vreten, niet uit
te gummen: een schets die je niet meer kunt lezen, is geen schets meer.

Alle vlekken staan nu rond 0,20 met een binnenlaag rond 0,10, en level 3 nog
lager omdat de veeg daar dwars over de lijnen valt. Dat is als vuistregel aan de
stijlgids toegevoegd.

### Dezelfde vlek op beide bladzijden

De vlek staat op béide bladzijden op dezelfde plek, de schets alleen op de
tweede. Dat is geen bezuiniging: een vlek trekt door het papier heen, dus wie
doorbladert ziet dezelfde plek terugkomen. Op de brief-bladzijde staat ze
alleen, op de opdracht-bladzijde vreet ze de schets aan.

Wat wél is geschrapt: een tweede, decoratieve vlek op de linkerbladzijde. Die
stond in de eerste versie en botste meteen met de bladwijzer. Ze voegde niets
toe wat de vlek-op-de-puzzel niet al zegt, en elke plek waar ze wél paste was
een plek waar ook tekst kon staan.

### Het chroom verhuist naar het linkerblad

De bladerhint stond rechtsonder, en dat botste met Alberta's weekregel zodra die
over twee regels ging — wat sinds WP F altijd zo is, want proportioneel
handschrift is breder dan het monospace raster waarop die zin ooit paste.

De onderrand van het rechterblad is nu van haar (drie regels op acht pixels in
plaats van twee op negen, want anders viel "van de cursus" er gewoon af). Het
linkerblad draagt de chroom: bladwijzer links, hint ertegenaan.

### Twee ontbrekende glyphs, en een test die de rest vangt

De kop van het spread van level 3 zegt "validatie ×3". Dat maalteken zat niet in
de font, dus er stond op de bladzijde: "validatie ?3". Zoiets zie je pas als je
toevallig díé bladzijde opslaat.

De kop van `js/font.js` verwees naar een `tools/lint-font.mjs` "die de dekking
kan controleren" — dat bestand heeft nooit bestaan. De controle staat nu in
`test/test-typografie.mjs`, waar ze bij elke run meeloopt: hij loopt door alle
strings in `AL.strings` en meldt elk teken zonder glyph, mét de zin waarin het
staat.

Die test vond er meteen een tweede: `→` in een Parsons-aanwijzing. Beide glyphs
zijn toegevoegd.

### Eén spread-kop ingekort

De kop van level 7 was `"Zoeken + de dubbele pijl (getCategorie().getNaam())"`.
Dat laatste stuk is één woord van zesentwintig tekens; een kolom van 136 px kan
dat niet breken, dus liep het over de bladrand. De keten staat in de brief
eronder toch al voluit, dus de kop is nu `"Zoeken, en dan de dubbele pijl"`.

### Wat níét is gebeurd

- **De spread-tekst zelf is niet herschreven.** Dat is puzzelinhoud, en ze is
  in WP C bewust ongemoeid gelaten met dit pakket als adres — maar dat adres
  sloeg op de bládzijden, niet op de tekst. De brieven doen wat ze moeten doen.
- **Geen sjabloon per level.** Het papier blijft één scène; alleen de schets en
  de schade verschillen. Zeven papierbestanden zou zeven keer dezelfde liniatuur
  zijn.
- **De weekregel is niet ingekort.** Dat lag voor de hand toen ze niet paste,
  maar die zin staat woordelijk in `docs/achtergrond.md`,
  `docs/spelontwerp-legacy.md` en `walkthrough/deel1-hints.md`, en de
  walkthrough-PDF's kunnen in deze container niet herbouwd worden (geen
  `pandoc`, geen `typst` — hetzelfde beletsel als in WP C). Drie regels ruimte
  geven kostte één getal en raakt niets buiten de renderlaag.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/scenes/spread-schetsen.js` | nieuw: zeven schetsen en zeven beschadigingen |
| `js/scenes/scene-spread-template.js` | papier met verlopen, korrel en liniatuur; vaste vlekken eruit; schets- en schadelaag; weekregel op drie regels; kolomverdeling houdt rekening met de schets |
| `js/engine.js` | `levelId` naar de spread-renderer; bladerhint naar het linkerblad; `AL.debugSpread` als testhaak |
| `js/font.js` | glyphs `×` en `→`; de kopnotitie verwees naar een tool die niet bestaat |
| `js/logic/strings.js` | kop van spread 7 ingekort |
| `index.html` | `spread-schetsen.js` geladen vóór het sjabloon |
| `tools/lint-scene.mjs` | eigen pas voor `AL.spreadSchetsen` |
| `test/test-typografie.mjs` | dekkingstest: elk teken in de spelprose heeft een glyph |
| `docs/art-stijlgids.md` | notitieboek-sectie herschreven |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **286 tests, 286 groen** (285 bij aanvang; één nieuwe).
- `node tools/lint-scene.mjs` — schoon op tien scènes plus de schetsenset.
- `node tools/check-assets.mjs` — geen drift.
- De zes rooksmaaktesten via `file://`: `smoke-browser` 21/21,
  `smoke-full-playthrough` 94/94, `smoke-levels-1-3` 32/32, `smoke-levels-4-7`
  48/48, `smoke-pc` 21/21, `smoke-sim` 13/13. Samen 229 controles, geen
  JavaScript-fouten op de pagina.
- **Alle veertien bladzijden bekeken** — zeven levels × twee bladzijden, via de
  nieuwe `AL.debugSpread`-haak. Zonder die haak kost het zeven uitgespeelde
  levels om ze te zien, en dan kijkt niemand ze allemaal na.
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.

## Volgende

**WP H — sprites en animatie.** Een ademende idle, een loopcyclus met armzwaai,
een draaiframe en een "gaat aan de pc zitten"-animatie. Daar hoort ook het
walkbox-werk bij dat sinds WP E deel 1 en deel 2 openstaat: de dieptescaling
heeft een hogere loopstrook nodig, en het trapgat in de overloop overlapt die
strook.
