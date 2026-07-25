# 26 — De gesimuleerde pc

Werkpakket J van het opwaarderingsprogramma, en het laatste (zie
`workflow/15-opwaardering-kickoff.md`). Doel: het scherm waar de speler de
meeste tijd doorbrengt, verlaat de esthetiek niet.

## Opdracht

Uit het goedgekeurde plan, WP J:

> Borland/Turbo-look: een menubalk, dubbellijns kaderchrome, een
> F-toetsen-statusbalk onderaan, scanlines over het paneel, en de
> 8×8-bitmapfont in plaats van Courier New. `CHECK_OK` groen en `CHECK_FAIL`
> rood — de `--pc-rood`-variabele wordt al geïnjecteerd maar door geen enkele
> CSS-regel gebruikt. De afgeronde hoeken en de CSS-glow gaan eruit. De editor
> scrollt naar boven bij het openen, en het uitvoerpaneel snijdt zijn eerste
> regel niet meer af.

## Aanpak

### De twee balken

Turbo Vision had twee regels die het scherm herkenbaar maakten: een menubalk
bovenaan in inverse video, en een statusbalk onderaan met de levende
functietoetsen. Beide staan er nu.

Ze zijn geen decoratie, en dat was een expliciete keuze. Een menubalk met
`Bestand  Bewerken  Zoeken  Help` zou er periode-correct uitzien en niets doen —
en een knop die niets doet, is erger dan geen knop. De menubalk draagt daarom de
commando's die écht bestaan, per paneel verschillend: in de editor `Compileer
[F9]`, `Hint [F1]`, `Menu [Esc]`; in het menu alleen `Zolder [Esc]`.

De statusbalk onderaan is bovendien de enige plek waar een speler kan *lezen*
dat F9 compileert. Dat stond tot nu toe in een melding die na één compilatie weg
was.

### De rest van de chrome

Dubbellijns kaders (`border-style: double` — geen box-drawing-tekens nodig),
afgeronde hoeken op nul, de `0 0 42px` gloed rond de kast weg, en de
`text-shadow` op het schermvlak weg. Wat erbij komt zijn scanlines over het
paneel, met dezelfde `data-crt`-schakelaar als het canvas: wie `crt uit` typt,
zet ze allebei uit. Eén schakelaar, want een beeldbuis kent geen uitzonderingen.

## Beslissingen

### De 8×8-bitmapfont komt er niet in

Dit is de enige plan-eis van het hele programma die niet is uitgevoerd, en de
reden staat al in `engine-architectuur.md` — als geboekte beslissing, ouder dan
dit plan.

De editor is een echte `<textarea>`. Dat is er zo gebouwd om drie redenen die er
in een vak-context toe doen: een echte cursor met invoegen en verwijderen,
selectie en klembord (studenten kopiëren code), en toegankelijkheid
(schermlezers, browser-zoom, toetsenbordnavigatie). Een textarea zet zijn tekst
met een échte font — niet met een glyphtabel die de renderer per pixel uitleest.

De font wél gebruiken zou betekenen: de tekst zelf op een canvas tekenen en een
onzichtbare textarea erbovenop leggen voor de invoer, met de cursorpositie en de
selectie handmatig gespiegeld. Dat is precies het "veel werk en fragiel" waar de
geboekte beslissing over gaat. `CLAUDE.md` zegt dat code en doc in hetzelfde
pakket in de pas moeten; hier weken het *plan* en de *doc* van elkaar af, en de
doc heeft het betere argument.

Wat er wél is gebeurd: **Courier New is uit de stack.** Dat is een
schrijfmachineletter met schreven en dunne stokken; een DOS-terminal had een
rasterletter met vlakke einden. De stack begint nu bij wat het systeem als
terminalletter aanbiedt (`ui-monospace`, dan Cascadia Mono, Consolas, DejaVu
Sans Mono). De rooksmaaktest controleert dat Courier er niet meer in staat.

### CHECK_OK en CHECK_FAIL

`--pc-rood` werd door `engine.js` geïnjecteerd en door geen enkele CSS-regel
gebruikt. De uitvoer was één `textContent`, dus per regel kleuren kon niet.

Nu wordt elke regel als `<span>` met een klasse toegevoegd, gescheiden door
echte regeleindes — zodat `textContent` nog steeds de volledige tekst met
newlines teruggeeft, want daar hangen de rooksmaaktesten aan. `CHECK_OK` groen
(45 uit de gebladerte-ramp), `CHECK_FAIL` rood (12), de javac-regel in
schermwit. De test controleert de rgb-waarden, niet het bestaan van een klasse:
"hebben ze niet dezelfde kleur" was de klacht, en dat is wat gemeten wordt.

### F1 is de hint, en dat was een echte fout

De melding bij het laden van een puzzel zei: *"'?' geeft een hint."* In de
editor was dat nooit waar. `?` zette gewoon een vraagteken in de code; alleen de
terminal en de zolder kennen dat commando. Er was dus geen enkele manier om in
de editor een hint te vragen, terwijl het spel beweerde dat er een was.

F1 is nu de hint, in de editor én in de terminal — Borland-correct, en het staat
op de statusbalk waar je het kunt lezen. De melding is meeveranderd.

### Het uitvoerpaneel: twee fouten, niet één

De plan-eis was "snijdt zijn eerste regel niet meer af". Dat kwam van
`border-top` plus 8 px padding: samen minder dan één regelhoogte, dus de eerste
regel begon ín de lijn. Nu een echt omkaderd paneel met ruimte binnen het kader.

Bij het nakijken bleek er een tweede: `flex: 0 1 34%` liet het paneel krimpen
zodra de editor ruimte vroeg, en dan viel de láátste regel weg — de CHECK_FAIL,
het enige dat de speler op dat moment wil lezen. Het paneel heeft nu een
ondergrens in régels (10 em) in plaats van een percentage: het gaat om hoeveel
tekst erin past.

En de scrollpositie is voorwaardelijk geworden. Past de uitslag volledig, dan
lezen we van boven naar onder — eerst javac, dan de controles op volgorde. Past
ze niet, dan naar het eind, want dan is de laatste regel het antwoord. De test
meet dat het in het echte geval volledig past (176 px nodig, 176 px
beschikbaar).

### De editor opende middenin het bestand

Een textarea die net gevuld is, scrollt naar de cursor, en die staat na het
zetten van `.value` aan het eind. Level 1 opende dus op regel 16, met Alberta's
notitie en de klassekop buiten beeld — precies de twee dingen die de opdracht
uitleggen. Cursor en scroll gaan nu naar nul.

### Wat níét is gebeurd

- **De editor blijft een `<textarea>`.** Zie hierboven; het is de QC-eis van dit
  pakket en de reden dat de bitmapfont eruit blijft.
- **Geen valse menu-items.** Alleen commando's die bestaan.
- **De knoppen onder de editor blijven staan.** Ze doubleren met de menubalk,
  maar op een aanraakscherm is een knop van veertig pixels bruikbaar en een
  menubalkregel niet. Ze zijn wel in Turbo-stijl gezet (dubbele lijn, geen
  afgeronde hoeken).

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `css/style.css` | menubalk, F-toetsenbalk, dubbellijns kaders, scanlines aan de `crt`-schakelaar, hoeken en gloed eruit, uitvoerpaneel op regelhoogte, `--pc-rood`/`--pc-groen` in gebruik, Courier New uit de stack |
| `js/pc/pc.js` | de twee balken in de chrome; `renderBalken()` en `balkItems()` per paneel |
| `js/pc/editor.js` | F1 = hint; bovenaan openen; uitvoer per regel gekleurd; voorwaardelijke scrollpositie |
| `js/pc/terminal.js` | F1 = hint (niet in de sim-modus) |
| `js/logic/strings.js` | balklabels; de geladen-melding noemt F1 in plaats van `?` |
| `docs/engine-architectuur.md` | §Turbo Vision, en waarom de bitmapfont er niet in komt |
| `docs/art-stijlgids.md` | `pc-chrome` in de scène-inventaris uitgeschreven |
| `test/smoke-pc.mjs` | elf controles erbij op de chrome en de kleuren |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **322 tests, 322 groen** (onveranderd: dit pakket is renderlaag).
- `node tools/lint-scene.mjs` — schoon; `node tools/check-assets.mjs` driftvrij.
- De zes rooksmaaktesten via `file://`: `smoke-pc` **32/32** (was 21),
  `smoke-browser` 28/28, `smoke-full-playthrough` 94/94, `smoke-levels-1-3`
  32/32, `smoke-levels-4-7` 48/48, `smoke-sim` 13/13. Samen 247 controles, geen
  JavaScript-fouten op de pagina.
- De elf nieuwe controles meten precies de plan-eisen: menubalk gevuld,
  F-toetsenbalk aanwezig, `border-radius` nul, `border-style` double, geen gloed
  in de `box-shadow`, scanlines als `repeating-linear-gradient`, geen "courier"
  in de schriftstack, `scrollTop` nul na laden, uitvoerpaneel hoger dan vier
  regels, `CHECK_FAIL` exact `rgb(255, 85, 85)`, en `CHECK_OK` ≠ `CHECK_FAIL`.
- **De editor is nog een echte `<textarea>`:** `page.fill(".pc-editor-invoer")`
  in de rooksmaaktest werkt, en dat werkt alleen op een echt formulierveld.
- Visueel bekeken: het menu, de editor bij het openen, de editor met een
  CHECK_FAIL, en de terminal.
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container, dus het
  mobiele toetsenbord is niet geautomatiseerd nagekeken. De overlay is niet
  aangeraakt op het punt dat `js/touch.js` gebruikt.

## Hiermee is het programma rond

Elf pakketten: 0, A t/m J. De stand tegenover het vertrekpunt:

| | Vertrek | Nu |
|---|---|---|
| Headless tests | 224 groen van 225 | **322 groen van 322** |
| Rooksmaakcontroles | 227 | **247** |
| Draw-ops in scènes | 173 | ruim 700 |
| Scènes | 6 | 10, plus zeven schetsensets |
| Geblitte sprites | 1 van 6 | alle zes |
| Overgangen | 0 | opkomst per kamerwissel |
| Geluid | 9 blokgolf-cues, geen muziek | FM-synthese, 4 muziekbedden, 10 cues |

Wat er open blijft staat in `workflow/voortgang.md`, §"Nog open na het
programma": de walkthrough-PDF's (geen `pandoc`/`typst` in deze container) en
`smoke-touch` (geen WebKit).
