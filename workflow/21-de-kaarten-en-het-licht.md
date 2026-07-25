# 21 — De kaarten, en licht dat eindelijk licht is

Werkpakket E deel 2 van het opwaarderingsprogramma (zie
`workflow/15-opwaardering-kickoff.md`). Het pakket begon als de twee stukken
die in deel 1 zijn blijven liggen — de titelkaart en de eindkaart — en werd
onderweg groter, om een reden die hieronder de kern van deze entry is.

## Opdracht

Uit het goedgekeurde plan, WP E:

> `titelkaart` wordt een echte scène (`js/scenes/scene-titelkaart.js`, nu zeven
> inline ops in `js/engine.js:571`) met een getekend logo-bitmap in plaats van
> de titel in de speelfont.

En uit de checklist voor deel 2:

- `titelkaart` als echte scène in plaats van inline draw-ops
- een getekend logo in plaats van de titel in de speelfont
- `eindkaart` hertekend met dezelfde woordenschat als de kamers
- QC: `lint:scene` schoon, titel en oordeelkop blijven leesbaar — de
  contrastfout uit WP A mag niet terugkomen

## Aanpak

### Het logo

`gfx.tekenLogo(tekst, x, y, opts)` zet de bestaande 8×8-font op schaal met een
omtreklijn en een verticaal verloop over de letterhoogte. Twee dingen zijn
daarbij bewust zo gedaan:

- **De omtreklijn wordt uit een masker gebouwd, niet per letter.** Eerst worden
  alle gezette pixels van de hele regel verzameld; pas daarna krijgt elke buur
  van een gezette pixel die zelf niet gezet is de randkleur. Per letter randen
  zou betekenen dat aangrenzende letters elkaars rand opeten, en bij schaal 3
  staan de letters dicht genoeg op elkaar dat dat zichtbaar is.
- **Het verloop loopt over de regel, niet over de glyph.** Het licht komt van
  boven; dat is één ramp van `boven` naar `onder` over de volle letterhoogte,
  geordend geditherd zodat er geen banden in staan.

De titel staat in twee lagen. "THE LEGACY OF ALBERTA" past op geen enkele
leesbare schaal op één regel: bij schaal 2 is het al 378 px breed op een scherm
van 320. Dus "THE LEGACY OF" klein bovenaan, "ALBERTA" op schaal 3 eronder.

### De titelkaart als kamer

De stijlgids noemt `titelkaart` een bindende scène-id met een eigen mood:
"stille zolder in silhouet, één gouden lichtstraal (34/58), het logo eroverheen;
melancholisch, uitnodigend". Die zolder is er nu: dezelfde gording, dezelfde
dozen, dezelfde kist als in de westhoek, maar als zwarte vormen tegen het licht.
Je ziet waar je straks staat zonder er al iets van te weten.

De eerste versie hiervan was fout, en op een leerzame manier: de plaat waar het
logo op valt was 268 px breed en 78 hoog, en die dekte precies alles af wat de
moeite waard was. Het dakraam werd doormidden gesneden, de straal was volledig
onzichtbaar, en wat overbleef was een bord met een tekening eromheen.

De compositie is daarna opgebouwd *rond* de plaat in plaats van erachter: het
dakraam en de hete kop van de straal staan erboven, de landing op de vloer en de
kist eronder, en de gording loopt er dwars achter door — links het beeld in,
rechts er weer uit. Zo overlapt het logo de kamer, wat een titelkaart doet.

### De eindkaart

Dezelfde compositie als de titelkaart, met opzet: wie het spel uitspeelt, ziet
dezelfde kamer terug — alleen is het er licht geworden. De straal is breder, de
vormen zijn geen zwarte gaten meer maar hout waar licht op valt, en de kist
staat open.

## Beslissingen

### Een op erbij: `light`

Dit is de belangrijkste beslissing van het pakket, en ze wijkt af van het plan.
WP B was gesloten met vier nieuwe ops; hier komt er een vijfde bij.

De aanleiding was een screenshot. De nieuwe titelkaart zag er bij eerste
oplevering uit alsof er een dichte lavendel plaat schuin over de kamer lag. Dat
is geen toeval en het was ook geen slordigheid in die ene scène: **`ditherRamp`
vult élke pixel van zijn veelhoek** met een van twee kleuren. Een straal die
ermee getekend is, ís dus een dekkende plaat. Ze gaat over de kist en de dozen
heen in plaats van erop te vallen, en waar ze over de houten vloer loopt,
verft ze die lavendel.

Dat is exact de klacht waar dit hele programma mee begon — P0-3 in de
geprioriteerde lijst: *"De lichtwiggen in `zolder-midden` en `zolder-oost` zijn
grote, hardgerande, volvlakke oranje veelhoeken. Ze lezen niet als licht maar
als een onafgewerkte polygoon."* In WP E deel 1 is die klacht verzácht — de
wiggen werden plakken met aflopende dichtheid — maar niet opgelost, want het
onderliggende gereedschap kon niet anders.

`shadow` had al de juiste vorm: verduister elke pixel binnen een veelhoek een
paar stappen in zijn *eigen* ramp, zodat een contactschaduw de kleur van de
ondergrond meekrijgt. De andere helft ontbrak gewoon.

```js
["light", stappen, dichtheid, punten]
```

Elke pixel binnen de veelhoek klimt `stappen` omhoog in zijn eigen ramp, maar
alleen waar `bayer(x, y) < dichtheid`. Hout wordt lichter hout, de wand lichtere
wand, een silhouet krijgt een rand mee in plaats van te verdwijnen. Eén
lichtbron, en alles wat hij raakt antwoordt in zijn eigen kleurfamilie.

Waarom dit hier landt en niet als los pakket: een op toevoegen die het bestaande
tekenwerk beter maakt en dat tekenwerk dan níét bijwerken, laat de repo in een
staat waarin twee manieren van licht tekenen naast elkaar staan en de verkeerde
de meerderheid heeft. Alle vijf de scènes met een lichtbron zijn dus mee
omgezet. Dat is één samenhangende commit: *licht wordt licht.*

### Licht staat achteraan in de picture, niet vooraan

Met `ditherRamp` maakte de volgorde weinig uit — een dekkende straal moest wel
vóór de props staan, anders was hij niet te zien. Met `light` is het omgekeerd:
de straal hóórt achteraan, want licht valt op een kamer en ligt er niet onder.

In `zolder-west` is dat meteen zichtbaar. De kamerbeschrijving belooft een kist
in het licht; die kist stond tot nu toe over de straal heen getekend en werd dus
door niets belicht. Nu valt de straal erop.

In `zolder-oost` gold hetzelfde voor de monitorgloed. Het commentaar in die
scène beweerde dat de gloed vóór het bureau stond "zodat het bureau erin
baadt", maar vóór in de opsomming betekent er juist *onder*: het bureau werd er
overheen geschilderd. Nu baadt het blad met het toetsenbord en de mok er echt
in.

### Een gloed heeft geen rand

Twee eerdere versies van de monitorgloed zijn gesneuveld, allebei om iets wat de
moeite van het onthouden waard is.

De eerste was een ellips in gloed-bruin (54) op een paarse wand: amber in het
donker mengen leest gewoon als een bruin gat. Die les stond al in de stijlgids —
*een gloed hoort in de ramp van het oppervlak, niet in die van de lamp.*

De tweede was diezelfde ellips, nu netjes in de avond-ramp. Beter, maar nog
steeds fout: **een ellips in een vlakke kleur heeft een rand.** Binnen de vorm
wordt een vaste fractie opgelicht en erbuiten niets, en die sprong is een
zichtbare boog. Op de screenshot stond een geschilderde koepel tegen de wand.

De werkende versie is vijf ín elkaar liggende koepels van één stap met oplopende
dichtheid (0,12 → 0,55). Ze tellen op: een pixel diep in het midden passeert
alle vijf de drempels en klimt vijf stappen, een pixel aan de buitenrand haalt
er één of geen. De gloed wordt dus vanzelf feller naar binnen en dooft naar
buiten uit — zonder dat er ergens een grens is. Dezelfde truc, maar dan met
wiggen in plaats van koepels, doet de lichtveeg in `zolder-midden`.

Dat is als nieuwe vuistregel aan `art-stijlgids.md` toegevoegd.

### De koepels stoppen op de bureaurand

De eerste werkende gloed liep door tot de vloer, en toen werd het toetsenbord
wit: het staat in de steen-ramp, kreeg vijf stappen mee en klemde op 53 — een
kleur die vrijwel wit is. De koepels staan nu plat op de bovenrand van het blad,
en wat eronder ligt krijgt één zachte stap in plaats van vijf.

### Wat níét is gebeurd

- **De trap in `overloop` overlapt de loopstrook.** Het trapgat loopt van y140
  tot y189, de walkbox van y152 tot y189; wie via het zuiden binnenkomt, staat
  dus in het gat. Dat is echt en het ziet er verkeerd uit, maar het is een
  walkbox-probleem, en de walkboxen worden in **WP H** herzien (daar staat de
  dieptescaling al op te wachten om dezelfde reden). Hier bijwerken zou de
  geometrie van een scène veranderen zonder de laag die haar gebruikt.
- **De sim, de logica en het save-formaat zijn niet aangeraakt.** Dit pakket is
  volledig renderlaag.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/gfx.js` | `ivLight` + dispatch + publieke `light` |
| `js/scenes/scene-titelkaart.js` | nieuw: de zolder in silhouet, opgebouwd rond de logoplaat |
| `js/scenes/scene-eindkaart.js` | hertekend; straal met `light`; beslag in messing |
| `js/scenes/scene-zolder-west.js` | straal naar achteren + `light`; beslag in messing; stofdoos in de straal gezet |
| `js/scenes/scene-zolder-midden.js` | veeg naar achteren + vijf ín elkaar liggende wiggen |
| `js/scenes/scene-zolder-oost.js` | veeg naar achteren + `light`; monitorgloed als vijf koepels |
| `js/scenes/scene-overloop.js` | veeg met `light`; korrel op de wand teruggebracht |
| `js/engine.js` | titelkaart blit de scène + tweelaags logo; "druk op Enter" met omtreklijn |
| `js/logic/strings.js` | `titelBoven`, `titelGroot` |
| `index.html` | `scene-titelkaart.js` geladen |
| `tools/lint-scene.mjs` | kent `light` (ariteit 4, stappen 1–5, dichtheid 0–1) |
| `test/test-gfx-primitieven.mjs` | vier tests voor `light` |
| `docs/art-stijlgids.md` | `light` in de op-tabel; twee nieuwe vuistregels |
| `docs/engine-architectuur.md` | vijf ops in plaats van vier, met de reden |

## Twee dingen die onderweg nog fout stonden

- **De stofdoos in `zolder-west` stond naast de straal.** Ze liep van x110 tot
  x206, terwijl de straal bovenaan pas bij x198 begint. De helft van het stof
  viel dus op de donkere wand en las daar als vuil op het scherm. Nu staat de
  doos binnen de bundel.
- **De wand in `overloop` was sneeuw.** De korrel stond op kleur 48 — de
  donkerste steen — over een verloop dat naar 50 loopt, dus twee stappen onder
  de ondergrond, met daarbovenop een tweede laag op 51, een stap erboven. Samen
  is dat salt-and-pepper. Eén laag op 49 (één stap) leest als pleisterwerk.

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **263 tests, 263 groen** (259 bij aanvang van dit pakket; vier
  nieuwe voor `light`).
- `node tools/lint-scene.mjs` — schoon op alle tien de scènes.
- `node tools/check-assets.mjs` — geen drift, negen editor-modellen zijn
  byte-getrouw.
- De zes rooksmaaktesten via `file://`: `smoke-browser` 21/21,
  `smoke-full-playthrough` 94/94, `smoke-levels-1-3` 32/32, `smoke-levels-4-7`
  48/48, `smoke-pc` 21/21, `smoke-sim` 13/13. Samen 229 controles, alle groen,
  geen JavaScript-fouten op de pagina.
- **De contrastfout uit WP A is niet teruggekomen.** Bekeken op de verse
  screenshots: "Alberta's oordeel: de vakvrouw" en "Epiloog" staan leesbaar op
  hun papieren band, en de titel staat leesbaar op zijn donkere plaat. Die plaat
  is er precies om die reden; het commentaar in de scène zegt dat er ook bij.
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.

## Volgende

**WP F — Typografie en UI-chrome.** Proportionele prose, een handschriftfont,
een berichtvenster met echt kader, en chrome op de status- en invoerbalk. Het
berichtvenster dekt de eindkaart nu nog volledig af; dat staat expliciet in de
QC-poort van dat pakket.
