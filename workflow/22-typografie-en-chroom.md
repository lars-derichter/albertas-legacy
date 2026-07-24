# 22 — Typografie en chroom

Werkpakket F van het opwaarderingsprogramma (zie
`workflow/15-opwaardering-kickoff.md`). Doel: tekst leest als een spel, niet
als een terminal.

## Opdracht

Uit het goedgekeurde plan, WP F:

- proportionele prose; wrap van tellen-in-tekens naar meten-in-pixels, ook
  `gecentreerdeTekst`
- een handschriftfont voor het notitieboek: schuine, onregelmatige glyphs met
  spatievariatie
- berichtvenster: slagschaduw, papiertextuur, een echt kader in plaats van
  `== kop ==`, en het venster mag de eindkaart niet meer volledig afdekken
- statusbalk en invoerbalk krijgen chroom in plaats van een gekleurde strook

## Aanpak

### De glyphdata blijft, er komt een maat bij

De 8×8-font zet elke glyph in ongeveer zes van acht kolommen, dus een
monospace-regel geeft een `i` evenveel ruimte als een `M`. Dat is precies wat
een debugfont van een spelfont onderscheidt.

`js/font.js` rekent nu bij het laden per glyph twee dingen uit: waar de inkt
begint en hoe breed ze is. De glyphdata zelf is niet aangeraakt.

Dat eerste getal is niet overbodig, en dat bleek pas op het scherm. De eerste
versie rekende alleen de rechterkant weg. Resultaat: elke regel die met een `i`
begon stond twee pixels ingesprongen, want die glyph begint op kolom 2 en een
`K` op kolom 0. Met de linkerruimte er ook af staat de linkermarge weer recht.

De spatie kreeg een eigen maat van vier pixels. Met drie — de eerste poging —
plakten woorden aan elkaar: nu de letters dichter op elkaar staan, moet het
woordwit mee omhoog om nog als woordwit te lezen.

### Twee zetwijzen naast elkaar

`tekenTekst` blijft monospace en blijft in gebruik waar een raster hóórt: de
statusbalk, de invoerbalk en de terminal van de gesimuleerde pc. Dat was ook de
afspraak bij de scoping. Ernaast staat `tekenProse`/`proseBreedte` voor alles
wat prose is.

`gfx._wrap` breekt nu op pixels in plaats van op tekens en neemt een
meetfunctie mee. Laat je die weg, dan rekent hij monospace — zo blijft alles wat
op een raster hoort werken zonder aanpassing.

### Het venster krimpt naar zijn inhoud

Proportionele prose komt smaller uit dan het raster waarop ze gewrapt is. Een
venster dat altijd `maxTekens × 8` breed is, houdt dus rechts een handbreed
papier over waar niets op staat. `vensterKader` meet daarom de breedste régel en
maakt de doos zo breed, met `maxTekens × 8` als bovengrens en 96 px als bodem —
onder die bodem leest een venster als een tooltip, en een kamer beschrijf je
niet in een doosje.

Dat lost meteen de laatste QC-eis op: de epiloogkaart wordt niet meer volledig
afgedekt. De straal, de kist en de dozen staan er nu omheen.

### Wat het venster tot papier maakt

Vier dingen die er niet in zaten:

- **een slagschaduw** — met de `shadow`-op, dus in de kleur van de kamer
  eronder. Het blad ligt érop, het is er niet in gestanst;
- **korrel in het papier** — papier is geen egale kleur;
- **belichting** — het licht komt van boven, dus een lichte bovenrand (38) en
  een donkere onderrand (35);
- **hoekjes die de goudlijn onderbreken** — het ornament dat een kader een kader
  maakt in plaats van een selectiekast.

Plus één pixel extra regelafstand: op acht pixels staan de regels van deze font
tegen elkaar aan.

### De balken worden lijstwerk

Statusbalk en invoerbalk waren allebei één platte strook in kleur 28. Nu zijn
het de twee lijsten van het beeldkader: gebeitst hout met een verloop, korrel,
een lichte rand aan de kant waar het licht vandaan komt en een donkere aan de
andere. Daardoor lijkt het speelveld erin te liggen in plaats van erboven te
zweven.

### Het handschrift

De stijlgids vroeg hier drie dingen — schuinstand, onregelmatige ligging en
spatievariatie — en er was er één: een y-sprong per teken op een monospace
raster van acht. Dat las als getypte tekst die stond te wiebelen.

Nu alle drie. De schuinstand schuift elke rij mee met de hoogte, dus de letter
helt in plaats van te verspringen. De spatiëring is proportioneel plus een
deterministische variatie van een pixel.

## Beslissingen

### De deining gaat per groepje, en als golf

Twee keer bijgesteld, allebei na ernaar te hebben gekeken.

De sprong stond per teken. Met de schuinstand erbij viel elk woord uit elkaar in
losse letters op eigen hoogte — "blauwdruk" met de `au` een pixel lager las als
losgeraakte type, niet als schrift. Eerst per groepje van drie gezet; beter,
maar nog steeds kon een woord van +1 naar −1 springen omdat de bron een
modulo-hash was.

De werkende versie is een driehoeksgolf — 0, +1, 0, −1 — per groepje van vier.
Twee opeenvolgende groepjes schelen dus hoogstens één pixel. Een hand dwaalt van
de lijn af en komt er weer op terug; ze springt niet om de letter.

### De kop staat in dezelfde hand

Eerst stond de kop van een spread in de gedrukte prosefont. Dat leest als twee
schrijvers op één blad: een gedrukte titel boven een handgeschreven notitie. De
kop is nu hetzelfde handschrift, alleen rechter (schuin 0,10 tegen 0,25) en
zonder deining — een titel schrijft een mens trager op dan de tekst eronder.

### De ASCII-kop is niet vervangen maar geschrapt

Het plan vroeg "een echt kader in plaats van `== kop ==`". Bij het uitvoeren
bleek de kop uit `js/logic/world.js` te komen:

```js
return ["== " + scene.naam + " ==", scene.beschrijving];
```

Dat is opmaak in de logica-laag, die volgens de architectuurafspraak DOM-vrij én
presentatievrij hoort te zijn. En de statusbalk zegt twee regels hoger al
precies hetzelfde: "Zolder — westhoek".

Er is dus geen kader voor in de plaats gekomen — de kop is weg. De kamernaam
stáát al in het chroom; dat ís de titelbalk. Dat is ook hoe Sierra het deed.

In `js/sim/goats-world.js` blijft dezelfde `== naam ==` gewoon staan. Dat is de
terminal van _Seven Little Goats_, een tekstspel: daar ís de tekst de
presentatie, en de sim-prose is bovendien buiten bereik van dit programma.

De test die hierop stond (`test-world.mjs`, "parser dispatcht de
zolder-commando's") controleerde letterlijk op `"=="`. Die is meegegaan en
controleert nu dat `kijk` de beschrijving teruggeeft en niets anders.

### De kolommen van een spread worden verdeeld

Niet gevraagd, wel nodig geworden door de omslag: nu er meer tekst per regel
past, kwamen er minder regels uit, en die vulden het linkerblad terwijl er
rechts drie regels overbleven. Dat leest als een fout, niet als een opengeslagen
boek. Past alles op één spread, dan gaat de helft links en de helft rechts; past
het níét, dan gaat het linkerblad wél vol, want dan telt elke regel.

### Wat níét is gebeurd

- **Geen aparte pixel-handschriftfont.** De stijlgids noemt die als
  polish-ticket boven op de benadering, niet in plaats ervan. Met schuinstand,
  proportionele spatiëring en de golfdeining doet de bestaande font wat er van
  een handschrift gevraagd wordt; een tweede glyphset is honderd glyphs werk
  voor winst die op 8×8 marginaal is.
- **De vlekken op het spread liggen nog onder de tekst.** Dat is het
  doorgeschoven punt uit WP A en het hoort bij **WP G**, waar de papieren
  achtergrond per level opnieuw getekend wordt met de beschadiging precies waar
  de puzzel zit.
- **De terminal van de gesimuleerde pc is niet aangeraakt.** Die staat in
  **WP J**, en hij hoort monospace te blijven.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/font.js` | inktmaat per glyph (`maat`, `voortgang`, `spatiering`); glyphdata ongemoeid |
| `js/gfx.js` | `tekenProse`, `proseBreedte`; `_wrap` op pixels met meetfunctie; `handschriftBreedte`; `tekenHandschrift` met schuinstand en spatievariatie; `vensterKader`; venster met schaduw, korrel, belichting en hoekornament |
| `js/engine.js` | `gecentreerdeTekst` en de overslaanhint meten in pixels; status- en invoerbalk als lijstwerk |
| `js/logic/world.js` | `beschrijfScene` geeft alleen de beschrijving terug |
| `js/scenes/scene-spread-template.js` | kop en voet in handschrift; wrappen met de handschriftmaat; golfdeining; verdeelde kolommen |
| `test/test-typografie.mjs` | nieuw, 22 tests |
| `test/test-world.mjs` | de `==`-assertie vervangen |
| `docs/art-stijlgids.md` | handschriftsectie herschreven |
| `docs/engine-architectuur.md` | twee zetwijzen, wrappen op pixels, en de regel dat `tekst` geen opmaak draagt |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **285 tests, 285 groen** (263 bij aanvang; 22 nieuwe).
- `node tools/lint-scene.mjs` — schoon op alle tien de scènes.
- `node tools/check-assets.mjs` — geen drift.
- De zes rooksmaaktesten via `file://`: `smoke-browser` 21/21,
  `smoke-full-playthrough` 94/94, `smoke-levels-1-3` 32/32, `smoke-levels-4-7`
  48/48, `smoke-pc` 21/21, `smoke-sim` 13/13. Samen 229 controles, geen
  JavaScript-fouten op de pagina.
- Visueel bekeken op verse screenshots: de opening, een kamerbeschrijving, een
  onderzoeksantwoord, de zolder zonder venster, een spread en de epiloogkaart.
  De epiloogkaart is niet meer volledig afgedekt.
- Eén eigenschap is als test vastgelegd in plaats van bekeken: proportioneel
  zetten kost nooit méér regels dan monospace. Daar hangt de WP D-eis aan dat
  geen enkel onderschrift van de openingsreeks pagineert — anders bladert Enter
  door de tékst in plaats van door de reeks.
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.

## Volgende

**WP G — het notitieboek.** Per level een eigen papierachtergrond met de
beschadiging waar de puzzel zit, en Alberta's schetsen per scharnier-metafoor.
Het handschrift ligt er nu voor klaar.
