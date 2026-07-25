# 17 — Rendererkern (opwaardering WP B)

De renderer krijgt het gereedschap waar `art-stijlgids.md` al om vroeg maar dat
er nooit is gekomen. Zonder dit pakket is het scènewerk in WP E niet uit te
voeren: met alleen platte vullingen en één 50 %-schaakbord kán een wand niet
graderen.

## Opdracht

Uit het plan (`workflow/15-opwaardering-kickoff.md`, Bijlage B, §WP B): vier
nieuwe draw-ops (verloop, gedoseerde dither, verduistering, ruis),
sprite-schaling met diepte-occlusie, een voorgrondlaag per frame, en overgangen
tussen kamers. Plus de lint die de nieuwe ops kent, unit-tests per op, en de
documenten mee in dezelfde commit.

## Aanpak

Eerst het palet, dan de ops, dan de tests, dan pas de engine. De ops zijn puur
en headless testbaar; door ze eerst af te maken en te testen, stond er een
vangnet klaar vóór er iets aan de engine veranderde.

De vier ops zijn ook visueel vergeleken: dezelfde muur, vloer, lichtstraal en
doos, links met de oude middelen en rechts met de nieuwe, naast elkaar in één
beeld. Dat liet meteen zien dat `noise` op 0,18 te grof is voor houtnerf — een
notitie die nu in de stijlgids staat, zodat WP E er niet in trapt.

## Beslissingen

### Ramps horen in het palet, niet in de renderer

`shadow` moet een pixel donkerder maken zonder er een grijze vlek overheen te
leggen; dat kan alleen als de renderer weet in welke kleurfamilie een index zit.
Die kennis stond tot nu toe alleen in `art-stijlgids.md`, als proza. Ze is nu
ook code: `js/palette.js` levert `RAMPEN`, `rampVan`, `verduister` en
`verhelder`.

Twee keuzes daarbinnen. De EGA-paren zijn wél opgenomen (4/12 rood, 2/10 groen,
enzovoort), zodat ook de rode mantel van de speler een schaduwkant heeft. En 6
(bruin) en 14 (geel) staan bewust in geen enkele ramp: er is geen tweede kleur
die er natuurlijk bij hoort. `verduister` laat ze dus ongemoeid, en een test
legt dat vast.

### `gradient` loopt over de échte tussenkleuren

De op had een simpele twee-kleuren-menging kunnen zijn. Hij kijkt in plaats
daarvan of beide kleuren in dezelfde ramp zitten: zo ja, dan loopt het verloop
over alle tussenstappen van die ramp — 28 naar 34 geeft zeven echte kleuren, niet
twee gemengde. Alleen de overgangen tussen die stappen worden geditherd, met een
4×4-Bayer-matrix in plaats van het 2×2-schaakbord.

Dát is het verschil tussen een gestreepte gradiënt en een zachte. Zitten de twee
kleuren niet in dezelfde ramp, dan valt hij terug op de menging van twee, en een
test bewaakt dat allebei.

### Ops in het Engels, zoals de zeven die er al waren

Het plan noemde de nieuwe ops `schaduw` en `ruis`. De zeven bestaande ops heten
`fill`, `rect`, `poly`, `line`, `dither`, `ellipse` en `px` — allemaal Engels, en
`CLAUDE.md` zegt dat technische termen Engels blijven. Het zijn `gradient`,
`ditherRamp`, `shadow` en `noise` geworden. Het commentaar eromheen blijft
Vlaams.

### `overlays` betekende al iets — dat is gerespecteerd

Het plan sprak over een "overlay-pass" voor stof en flikkering.
`tools/lint-scene.mjs` valideerde `overlays` echter al als `{ baselineY, ops }`:
een **statische voorgrondlaag** met een voet-y, bedoeld voor painter's order.
Dat contract stond er dus al, ongebruikt.

De engine implementeert nu dát: een overlay met een `baselineY` vóór de speler
wordt ná de speler getekend, zodat hij er echt achterlangs loopt. Bewegende sfeer
(stof in de lichtstraal, een flikkerende monitor) is níét toegevoegd — die staat
in het plan onder WP E, waar de scènes ze ook echt krijgen. Er is dus geen
slapende code bijgekomen voor iets wat nog niemand gebruikt.

### De overgang is alleen een opkomst, en dat was een correctie onderweg

Eerst gebouwd zoals het voor de hand ligt: scherm dicht, kamer wisselen in het
donker, scherm open. Dat werkte visueel en zakte functioneel.

De wissel moet dan namelijk uitgesteld worden tot het dieptepunt, en in dat
halve seconde-venster loopt het wereldmodel achter op de speler. De
rooksmaaktest legde het bloot: twee keer achter elkaar "ga oost" typen bracht je
niet in de werkhoek maar liet je in de doorgang staan. Het tweede commando
rekende nog met de oude kamer.

Twee tussenoplossingen zijn geprobeerd en allebei verworpen. Invoer blokkeren
tijdens de overgang slikt aanslagen op: wie tijdens het wegdraaien al zijn
volgende commando intypt, is dat commando kwijt. En de duur terugschroeven tot
hij onder de wachttijd van de test past, is het spel naar de test buigen.

Wat er staat: de kamer wisselt meteen, en het nieuwe beeld komt op uit het
zwart. Dat haalt de hele klasse fouten weg — het model loopt nooit achter —
kost niets aan sfeer, en is precies wat de adventures van toen bij het betreden
van een kamer deden. De beweging bevriest wel tijdens de opkomst, zodat de
speler niet blind doorloopt; typen blijft gewoon werken.

Een tussenstand van die zoektocht is bijna ongemerkt blijven staan: een
`sed`-vervanging over een regelbereik raakte ook de `AL.gfx.present()` bínnen de
nieuwe `toonBeeld()`, waardoor die zichzelf aanriep. Het beeld werd zwart en de
invoer bevroor. De browser-rooksmaaktest gaf het meteen aan met een
stack-overflow; de headless tests merkten er niets van, want die raken de
renderlus niet aan. Reden te meer om de rooksmaaktesten in de poort te houden.

### Sprite-schaling zet de voeten vast

`opts.schaal` schaalt doelgestuurd (nearest-neighbour), zodat er geen gaten
vallen, en het ankerpunt blijft onderaan-midden. Een figuur die naar achter
kleiner wordt, blijft dus op dezelfde vloer staan in plaats van te zweven. Een
test legt dat vast voor schaal 1, 0,75 en 0,5. Bij schaal 1 is de uitkomst pixel
voor pixel identiek aan de blitter die er stond.

Toegepast is de schaling nog nergens: de walkboxes zijn nu een strook van 39 px
en er is geen diepte om op te schalen. Dat komt in WP E, samen met de kamers.

## QC-resultaat

- `node --test test/test-*.mjs` — **250 tests, 250 groen** (was 225; het nieuwe
  `test/test-gfx-primitieven.mjs` voegt er 25 toe).
- `npm run lint:scene` — alle scènes in orde, met de vier nieuwe ops in de
  ariteits- en grenscontrole.
- `node tools/check-assets.mjs` — geen drift.
- Rooksmaaktesten, allemaal via `file://`: `smoke-browser` 19/19, `smoke-pc`
  21/21, `smoke-sim` 13/13, `smoke-levels-1-3` 32/32, `smoke-levels-4-7` 48/48,
  `smoke-full-playthrough` 94/94.
- Visuele controle: een oud-naast-nieuw-beeld met dezelfde muur, vloer,
  lichtstraal en doos. De nieuwe helft toont een gegradeerde wand, houtnerf op
  de vloer, een lichtveeg met een zachte kern en een buitenband, en een
  contactschaduw die de kleur van de vloer meekrijgt.

De tests dekken per op: de ramp-logica en het klemmen, verloop binnen en buiten
een gedeelde ramp, de gemeten mengverhouding van `ditherRamp` (0,25 / 0,5 /
0,75 binnen 3 % van de vraag), determinisme van `noise` over twee runs en het
verschil tussen twee seeds, `shadow` op zowel een kleur mét als zonder ramp, de
drie overgangssoorten, en de sprite-schaling. De `debugPalet`-guard staat aan in
de hele suite, en drie tests controleren dat elk van de nieuwe ops er ook echt
door betrapt wordt als hij buiten het palet kleurt.

`smoke-touch` kon opnieuw niet draaien: deze container heeft geen WebKit. Dat
bestand is in dit pakket niet aangeraakt.
