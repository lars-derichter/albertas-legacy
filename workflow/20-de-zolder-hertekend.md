# 20 — De zolder hertekend (opwaardering WP E, deel 1)

De vier beloopbare kamers zijn opnieuw getekend met de primitieven uit WP B, de
props zijn uit de achtergrond gehaald en worden nu als sprite geblit, en er
beweegt voor het eerst iets in een kamer.

**Dit pakket is bewust deel 1.** De titelkaart en de eindkaart stonden ook in
WP E; die zijn hier niet gedaan. Zie §"Wat er niet in zit".

## Opdracht

Uit het plan (§WP E): alle scènes hertekend met gegradeerde wanden en vloeren,
wijkend perspectief, één consequente lichtbron met hooglicht en schaduw per
prop, outlines, een voorgrondlaag; props uit de achtergrond naar geblitte
sprites; het beeld dat de prose inlost; en ambient beweging.

## Aanpak

De kamerbeschrijvingen uit WP C waren letterlijk de opdracht. Ze zijn per kamer
naast de tekening gelegd, zelfstandig naamwoord voor zelfstandig naamwoord — dat
is ook de QC-poort. `zolder-west` is eerst afgemaakt als sjabloon; de andere
drie volgen dezelfde woordenschat en gingen daardoor een stuk sneller.

Elke kamer is kaal gerenderd (zonder venster en zonder sprites) om de tekening
zelf te kunnen beoordelen, en daarna in het spel.

## Beslissingen

### De props zijn eindelijk voorwerpen

`scene.hotspots` droeg al een `sprite`-veld, maar niets las het: de props zaten
in de gecachete achtergrond gebakken. Daardoor kon geen enkel voorwerp ooit van
staat veranderen, en lagen er vijf volwaardige sprites (ruim 280 regels
pixelkunst) ongebruikt in `js/sprites/`.

De engine tekent nu de props én de speler in één lijst, gesorteerd op voet-y.
Dat is de painter's order uit de stijlgids: wie verder naar voren staat, wordt
later getekend. De speler loopt dus echt achter de stoel langs en voor de kist.

Wat naar een sprite verhuisde, is uit de picture gehaald — anders staat het er
dubbel. Het notitieboek (westhoek), de broncode-doos en een fragment-doos
(doorgang), de pc en de stoel (werkhoek), een doos (overloop).

De pc staat op zijn **`aan`-frame**. Dat frame bestond al vanaf WP 6 en is nooit
één keer op het scherm geweest.

### Er beweegt iets

Nieuw veld `scene.sfeer`, per frame getekend na de scène-blit (de scène zelf is
gecachet en wordt als geheel gekopieerd, dus alles wat beweegt moet erna). Eén
soort: `stof`. Elk deeltje heeft een vaste startplek uit de deterministische
ruis van `gfx.ruis`, zakt traag met een eigen snelheid, en drijft een beetje
zijwaarts zodat het niet als regen valt.

De stijlgids vroeg hier al om ("stof in de lichtstraal"). Het waren tot nu toe
acht stilstaande pixels, in de achtergrond gebakken.

Deterministisch, niet willekeurig: een screenshot moet vergelijkbaar blijven.

### Licht in plakken, niet in vlakken

De oude lichtwiggen waren volvlakke veelhoeken met vaste dichtheid, en dat is
precies waarom ze als "onafgewerkte polygoon" lazen — een lichtbundel hoort naar
beneden toe breder én zwakker te worden. Elke straal bestaat nu uit vier of vijf
plakken met aflopende dichtheid, waarbij ook de ramp-kern meezakt van heet naar
koel. Datzelfde recept staat in de westhoek en in de doorgang.

### Twee keer dezelfde fout gemaakt met de monitorgloed

De gloed van de monitor op de wand begon als een ellips in gloed-bruin (54) op
een paarse wand. Resultaat: een bruin gat, geen licht. Precies de les uit WP D,
en toch opnieuw ingelopen.

Tweede poging met 30/31 was beter maar nog steeds een gekleurde vlek. Wat werkt:
blijven binnen de ramp van de **wand** en per ring maar één stap zetten (29, dan
30), met stevige ruis eroverheen om de ovaalrand te breken. De echte amber zit
alleen in het scherm zelf.

De regel is dus scherper dan hij in de stijlgids stond: het gaat niet alleen om
de helderheidssprong, maar om welke ramp je kiest. Een gloed hoort in de ramp
van het oppervlak waarop hij valt, niet in die van de lichtbron.

### De kamers staan vol

De oude kamers hadden vier tot zes objecten. Nu draagt elke kamer stapels,
naden, barsten, beslag, papier — dingen die niets doen maar er wel horen te
staan. `overloop` is het duidelijkst: de linkerdozentoren loopt tot voorbij de
bovenrand van het speelveld, zodat er geen bovenkant te zien is. Dat is wat
"hoger dan jij" uit de kamerbeschrijving moet doen.

Draw-ops over alle scènes: **325**, tegen 173 bij het vertrekpunt. En dat zijn
nu gradiënten, schaduwen en korrel in plaats van vlakke rechthoeken.

### Elke kamer een voorgrond

Elke kamer heeft minstens één `overlay` met een `baselineY` vóór de hele
loopstrook: een balk die vlak langs de kijker loopt. De speler passeert er
altijd achterlangs. Dat is goedkoop en het is wat de kamer diepte geeft. De
doorgang heeft er twee: de balk en een stapel rechts waar de speler achter
verdwijnt.

## Wat er niet in zit

De **titelkaart als echte scène met een getekend logo** en de **eindkaart
hertekend** stonden ook onder WP E. Ze zitten hier niet in.

Reden: dit pakket was al groot, en `CLAUDE.md` zegt dat een half afgewerkt
pakket niet gecommit hoort te worden maar gesplitst. De vier beloopbare kamers
vormen een afgerond geheel met een eigen QC-poort; de twee kaarten zijn een
apart stuk werk met een eigen soort probleem (een logo is letterwerk, geen
kamer). Ze staan als deel 2 in `workflow/voortgang.md`.

Ook nog open: de speler wordt niet kleiner naar achter. De sprite-schaling uit
WP B ligt klaar, maar de loopstrook is 39 px hoog — daar valt geen zinnige
diepte op te schalen zonder de walkboxes te herzien, en dat hoort bij het
sprite-werk van WP H.

## QC-resultaat

- `node --test test/test-*.mjs` — **259 tests, 259 groen**.
- `npm run lint:scene` — alle negen scènes in orde, inclusief het nieuwe
  `sfeer`-veld (de lint kent het nu en controleert grenzen, kleur en aantal).
- `node tools/check-assets.mjs` — geen drift.
- Rooksmaaktesten via `file://`: `smoke-browser` 21/21, `smoke-pc` 21/21,
  `smoke-sim` 13/13, `smoke-levels-1-3` 32/32, `smoke-levels-4-7` 48/48,
  `smoke-full-playthrough` 94/94.
- Elke kamer kaal én in het spel bekeken, en naast zijn eigen
  `AL.strings.scenes[...].beschrijving` gelegd. Alle genoemde zelfstandige
  naamwoorden zijn aanwijsbaar: dozen, balken, dakraam, lichtstreep, kist,
  notitieboek en pen (west); balken, laag dak, broncode-doos met tape en label,
  trap (doorgang); stoel, bureau, stof, pc, monitor, toetsenbord en mok
  (werkhoek); trap, dozen hoger dan jij, wand (overloop).
- Geen prop staat dubbel: wat sprite werd, is uit de picture verdwijderd.

`smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.
