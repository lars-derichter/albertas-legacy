# Art-stijlgids

De visuele bijbel van _The Legacy of Alberta_. Alle graphics zijn palet-
geïndexeerd, logisch scherm 320×200, in de stijl van vroege VGA-adventures
(Sierra SCI1 / _Leisure Suit Larry_-tijd): meer kleuren dan EGA, zachtere
overgangen, dithering nog beschikbaar maar niet meer verplicht. Het speelveld
loopt van y = 8 tot y = 189 (statusbalk erboven, invoerbalk eronder), net als de
predecessor-engine. Scène- en sprite-workers (WP 6) bouwen tegen dit document;
de paletindexen hieronder zijn concreet genoeg om meteen mee te tekenen.

## Het palet (`js/palette.js`)

Vierenzestig geïndexeerde kleuren. Indexen 0–15 zijn de EGA-basis (identiek aan
de predecessor, zodat overgenomen scènes blijven kloppen); 16–63 zijn ramps voor
huid, hout, avondlicht, papier, gebladerte, steen, gloed en nacht. De renderer
blijft index-gebaseerd: één byte per pixel, alleen de opzoektabel is groter.

### 0–15 — EGA-basis

| # | Hex | Kleur | Gebruik |
|---|-----|-------|---------|
| 0 | `#000000` | zwart | outlines, schaduw, nacht |
| 1 | `#0000AA` | donkerblauw | avondlucht, diepe schaduw buiten |
| 2 | `#00AA00` | donkergroen | gebladerte donker |
| 3 | `#00AAAA` | cyaan | lucht (dither met 11) |
| 4 | `#AA0000` | donkerrood | baksteen, `rode mantel` in de sim |
| 5 | `#AA00AA` | magenta | spaarzaam: accenten |
| 6 | `#AA5500` | bruin | hout, paden, meubels |
| 7 | `#AAAAAA` | lichtgrijs | steen, stof, rook |
| 8 | `#555555` | donkergrijs | schaduwsteen, wolf |
| 9 | `#5555FF` | helderblauw | water, lucht-accent |
| 10 | `#55FF55` | lichtgroen | gras met zon |
| 11 | `#55FFFF` | lichtcyaan | lucht (dither met 3) |
| 12 | `#FF5555` | helderrood | vuur, `rode mantel` in de sim |
| 13 | `#FF55FF` | lichtmagenta | accent, bloem |
| 14 | `#FFFF55` | geel | licht, koek, kaars |
| 15 | `#FFFFFF` | wit | hooglicht, ogen, papierwit |

### 16–21 — huid-ramp

| # | Hex | Rol |
|---|-----|-----|
| 16 | `#4A2A1E` | huid schaduwdiep |
| 17 | `#7A4230` | huid schaduw |
| 18 | `#A86B4C` | huid mid |
| 19 | `#CC8F68` | huid licht |
| 20 | `#E8B98D` | huid hooglicht |
| 21 | `#F7DCC0` | huid bleek/blos |

### 22–27 — hout-ramp

| # | Hex | Rol |
|---|-----|-----|
| 22 | `#2E1A0D` | hout diepst |
| 23 | `#4D2F16` | hout schaduw |
| 24 | `#6B4423` | hout mid |
| 25 | `#8A5A2B` | hout warm |
| 26 | `#A9743D` | hout licht |
| 27 | `#C99A63` | hout hooglicht |

### 28–34 — avondlicht-ramp (het dakraam)

Het schuine namiddaglicht op de zolder: van paarsblauwe schaduw naar gouden
straal. Dit is de kenmerkende lichtstemming van de hub.

| # | Hex | Rol |
|---|-----|-----|
| 28 | `#241A33` | avond diep (paarsblauw) |
| 29 | `#3D2B4D` | avond schaduw |
| 30 | `#6B4A63` | avond mauve |
| 31 | `#A86A6A` | avond rozerood |
| 32 | `#D98C5F` | avond oranje |
| 33 | `#F0B25C` | avond goud |
| 34 | `#FFE3A0` | avond lichtstraal |

### 35–41 — papier-ramp (het notitieboek)

| # | Hex | Rol |
|---|-----|-----|
| 35 | `#D9C9A3` | papier schaduw |
| 36 | `#E9DCB8` | papier mid |
| 37 | `#F5ECD0` | papier licht |
| 38 | `#FBF6E6` | papier hoogste |
| 39 | `#B09A6A` | vlekrand (koffie/water) |
| 40 | `#8A6F42` | vlek diep |
| 41 | `#3A2F22` | inkt (bruinzwart handschrift) |

### 42–47 — gebladerte-ramp

| # | Hex | Rol |
|---|-----|-----|
| 42 | `#12331A` | groen diepst |
| 43 | `#1F5A2A` | groen schaduw |
| 44 | `#2F8038` | groen mid |
| 45 | `#52A94A` | groen licht |
| 46 | `#86C95F` | groen hooglicht |
| 47 | `#C2E08A` | groen zon |

### 48–53 — steen/koelgrijs-ramp

| # | Hex | Rol |
|---|-----|-----|
| 48 | `#1C2026` | steen diepst |
| 49 | `#33383F` | steen schaduw |
| 50 | `#565D66` | steen mid |
| 51 | `#7C828B` | steen licht |
| 52 | `#A7ADB5` | steen hooglicht |
| 53 | `#D5D9DE` | steen hoogste |

### 54–58 — gloed-ramp (kaars, monitor, amber)

Voor de CRT-gloed van Alberta's pc en warm kunstlicht.

| # | Hex | Rol |
|---|-----|-----|
| 54 | `#3A1F00` | gloed diep |
| 55 | `#7A4A00` | gloed schaduw |
| 56 | `#C98400` | gloed amber |
| 57 | `#FFBF3A` | gloed licht |
| 58 | `#FFF0B8` | gloed hoogste (warm schermwit) |

### 59–63 — nacht/water-ramp

| # | Hex | Rol |
|---|-----|-----|
| 59 | `#071A2E` | nacht diepst |
| 60 | `#103A5A` | nacht schaduw |
| 61 | `#1F6FA0` | nacht mid (avondlucht door raam) |
| 62 | `#4AA6C9` | water/lucht licht |
| 63 | `#9FD8E6` | water/lucht hooglicht |

### Vaste toewijzingen (samenhang tussen scènes)

- **Zolderlicht:** de avond-ramp (28–34); de lichtstraal uit het dakraam heeft
  geen eigen kleur meer. Ze bestaat uit vijf `light`-plakken die schuin over de
  vloer naar beneden toe breder én zwakker worden (3 stappen bij het raam, 1
  onderaan; dichtheid 0,80 → 0,30), plus één zachte plak waar ze het hout
  haalt. Ze staan achteráán in de picture, zodat alles waar de straal op valt —
  de kist, de dozen, de planken — in zijn éigen ramp lichter wordt. Als
  dekkende veelhoek in 34/58 lag hij vroeger als een oranje plaat ónder de
  meubels door (`js/scenes/scene-zolder-west.js`, §"De lichtstraal").
- **Zoldervloer en balken:** hout-ramp (22–27), planklijnen in 22.
- **Dozen:** karton in 26/25 met schaduw 23; labels als 41-inkt op 36-papier.
- **De pc:** beige kast en monitorrand in 50–52, donker scherm in 49; de
  aan-staat is amber CRT (55 gloedschaduw, 56 amber, 58 schermwit — het enige
  plekje waar de gloed-ramp als échte kleur staat, want dáár zit de lichtbron).
  De halo op de wand is geen kleur maar vijf `light`-koepels die op het
  bureaublad staan en naar buiten toe uitdoven (dichtheid 0,12 → 0,55), met één
  zachte plak van 0,28 over het blad, het toetsenbord en de mok. Zo wordt de
  wand lichter in háár eigen ramp in plaats van er een bruine of paarse vlek op
  te krijgen (`js/scenes/scene-zolder-oost.js`, §"De gloed van de monitor").
- **De speler:** Alberta's kleinkind, alledaags gekleed. Trui uit de
  gebladerte-ramp (42 naad, 43 schaduw, 44 mid, 45 licht), jeans uit de
  nacht-ramp (59 binnenbeen, 60 schaduw, 61 licht), huid 18/19/20, kort haar
  23/24, schoenen 49 met zool 0. Uitdrukkelijk **niet** 4/12: het rood is nu
  alleen nog de `rode mantel` in de sim. De vier trappen per kledingstuk zijn
  er omdat het licht van rechts komt (zie hieronder) — een paar van twee
  volstond voor een mantel, niet voor een mouw naast een romp.
- **Buiten (de sim-scènes, indien getekend):** lucht dither 61/63 avond of
  3/11 dag; gras 44/45 met vlekken 42; boomstammen 24 met schaduw 22, kruinen
  43 met zon 46.
- **De wolf:** koelgrijs-ramp (49/50/51), buik 52, ogen 14.
- **Drapé (een deken over een stapel, een laken over een spiegel):** de
  bovenste rij één stap lichter dan de plooi eronder, in de ramp van de kámer:
  avond (29/30/31) op de zolder beneden, steen (49/50/51) op de overloop, en
  papier (35–38) voor een stoflaken. Zonder dat hoogteverschil leest de stof
  als nog een doos in een andere kleur. Zie WP 35b
  (`workflow/35b-de-zolder-aangekleed.md`).
- **Het overige zoldergoed:** karton 25/26 en hout 23/24 blijven wat ze zijn
  (zie de maatregel hieronder); blik, emmers, gieters en archiefkasten komen
  uit de steen-ramp (48–52), lampenkappen en stoflakens uit de papier-ramp
  (35–38). Een wandplank is 3 px dik en hangt op twee klossen van 2 × 5 px.

## De maatregel: 1 px ≈ 5 cm

Eén pixel is vijf centimeter. De speler is 31 px hoog en dus 1,55 m; alles wat
naast hem in een kamer staat, wordt daaraan gemeten. Deze regel bestaat sinds
WP 35 (`workflow/35-schaalpas.md`) en ze is er gekomen omdat het spel er zonder
maat uitzag zoals het eruitzag: een koffiemok van 14 × 16 px (bijna zo breed als
de speler), een bureau van 148 px (7,4 m) waar diezelfde speler met zijn kruin
niet boven kwam, en geschilderde dozen van twee tot drie keer de doos-sprite die
ernaast stond. Elk van die dingen was op zichzelf goed getekend. Samen klopte er
niets van.

**De verhouding tussen buren telt zwaarder dan de absolute waarheid.** Twee
dozen naast elkaar moeten even groot zijn; of ze nu 0,7 of 0,8 m meten, ziet
niemand.

**Kleine voorwerpen mogen groter dan waar, tot ongeveer anderhalve keer.** Een
mok op ware schaal is twee pixels en dat is geen mok meer. Elke uitzondering
staat hieronder met haar factor erbij; wat er niet bij staat, houdt zich aan de
maat.

| Voorwerp | Maat | In het echt | Opmerking |
|---|---|---|---|
| speler | 31 px hoog | 1,55 m | het ijkpunt |
| bureaublad | 15 px boven de voetlijn | 0,75 m | voorrand, niet achterrand |
| bureau (breedte) | ≤ 52 px | 2,6 m | oude werktafel |
| stoelzitting | 9 px | 0,45 m | gelijk aan de dij in `zit-oost` |
| stoel (totaal) | 19 px | 0,95 m | rugleuning |
| verhuisdoos | 16–22 px breed, 13–18 px hoog | 0,8–1,1 m | de doos-sprite is de eenheid |
| kist | 40 × 19 px | 2,0 × 0,95 m | ~1,4× — het boek moet erop passen |
| notitieboek (open) | 16 × 10 px | 0,8 × 0,5 m | ~2× — het draagt het hele spel |
| CRT-monitor | 14 px breed, 10 px hoog | 0,7 × 0,5 m | ~1,3× — middelpunt van de kamer |
| pc (monitor + kast) | 18 × 16 px, geblit 15 × 13 | 0,75 × 0,65 m | ~1,4× |
| toetsenbord | 13 × 3 px | 0,65 × 0,15 m | |
| koffiemok | 4 × 5 px | 0,2 × 0,25 m | ~2× — de kleinste leesbare mok |
| papier op een blad | 6–8 px breed | 0,3–0,4 m | |
| koffer | 15 × 9 px | 0,75 × 0,45 m | WP 35b |
| opgerold tapijt | 6–8 px dik, 25–40 hoog | 0,3 × 1,3–2,0 m | staand |
| schilderijlijst | 14–15 × 16–19 px | 0,7 × 0,9 m | leunend, rug naar voren |
| schemerlamp | 14 × 30 px | 0,7 × 1,5 m | kap + voet |
| wasmand | 14 × 9 px | 0,7 × 0,45 m | |
| archiefkastje | 16 × 25 px | 0,8 × 1,25 m | drie laden |
| staande spiegel | 14 × 27 px | 0,7 × 1,35 m | onder een laken |
| ladder | 17 px breed, 64 hoog | 0,85 × 3,2 m | bomen 3 px, sporten 1 px |
| naaimachine | 22 × 12 px | 1,1 × 0,6 m | op een tafeltje van 34 × 16 |
| wandplank | 3 px dik | 0,15 m | 36–64 px lang |
| weckpot | 4 × 6 px | 0,2 × 0,3 m | ~1,5× — kleinste leesbare pot |

Een stapel wordt hoger door te stapelen, niet door de doos te vergroten. De
torens op de overloop zijn "hoger dan jij" doordat er vier dozen op elkaar
staan, niet doordat één doos twee meter is.

**Karton is 25/26, hout op de vloer is 23/24.** De hout- en de karton-kleuren
komen uit dezelfde ramp, dus alleen een afspraak houdt ze uit elkaar. Ze is er
niet voor de sfeer maar voor de keuring: `test/test-schaal.mjs` telt élk vlak
van minstens 12 × 10 px in 25 of 26 als een doos en meet het na tegen de
doos-sprite. Een kist die in kartonkleur geschilderd staat, breekt die maat.

## Stijlregels (VGA / SCI1-look)

- **Perspectief:** lichte pseudo-3D zoals de vroege VGA-Sierra's. Vloeren wijken
  naar een horizon of naar de achterwand; de speler wordt kleiner naar achter
  (maar houd het subtiel — geen echte schaal-engine nodig).
- **Dithering optioneel.** Met 64 kleuren zijn veel overgangen direct te leggen.
  Gebruik dithering enkel waar een ramp tekortschiet: luchten, grote lichtvegen,
  zachte schaduwen. Niet meer als standaard zoals in EGA.
- **Geen platte vlakken op groot oppervlak.** Een wand, een vloer of een
  lichtstraal van meer dan pakweg 40×40 px in één kleur leest als onaf. Gebruik
  `gradient` binnen de ramp van dat materiaal, en `noise` voor korrel.
- **Outlines:** 1 px donkere rand (0, of de diepste ramp-kleur) waar een vorm
  anders in de achtergrond wegvalt; binnen vlakken geen outline.
- **Licht:** één dominante lichtbron per scène (op de zolder: het dakraam,
  warm, schuin). Hooglichten aan de lichtkant, schaduw aan de andere; consequent
  volgehouden zodat alle props uit dezelfde hoek belicht lijken.
- **Painter's order:** achtergrond → verte → middenplan → voorgrond → sprites.
- **Geen leesbare achtergrondtekst** behalve waar het verhaal het vraagt
  (doos-labels, het notitieboek). Dooslabels mogen 1–2 px-streepjes zijn die
  handschrift suggereren; echte letters horen in het notitieboek thuis.

## De draw-ops, en wanneer je ze gebruikt

De renderer kent twaalf ops. De eerste zeven zijn de basis uit de
predecessor-engine; de laatste vijf zijn erbij gekomen omdat de stijlregels
hierboven zonder hen niet uitvoerbaar waren — met alleen platte vullingen en
één 50 %-schaakbord kán een vlak niet graderen.

| Op | Vorm | Waarvoor |
|---|---|---|
| `fill` | `["fill", kleur]` | het hele speelveld in één kleur zetten |
| `rect` | `["rect", kleur, x, y, b, h]` | blokken, planken, kaders |
| `poly` | `["poly", kleur, punten]` | schuine vormen, lichtvegen |
| `line` | `["line", kleur, punten]` | plank- en voegnaden, outlines |
| `dither` | `["dither", c1, c2, punten]` | het vaste 50 %-schaakbord (EGA-erfstuk) |
| `ellipse` | `["ellipse", kleur, cx, cy, rx, ry]` | vlekken, ronde vormen |
| `px` | `["px", kleur, lijst]` | losse pixels: stof, korrels, doos-labels |
| `gradient` | `["gradient", c1, c2, x, y, b, h, "h"\|"v"]` | **de werkpaardop.** Verloop over een rechthoek. Zitten c1 en c2 in dezelfde ramp, dan loopt het over de échte tussenkleuren (28→34 geeft zeven stappen); anders blijft het een menging van twee. De overgangen worden geordend geditherd, dus geen zichtbare banden |
| `ditherRamp` | `["ditherRamp", c1, c2, dichtheid, punten]` | menging in een gekozen verhouding (0–1) in plaats van vast 50 %. Voor de zachte rand van een lichtveeg, of een sluier over een vlak |
| `shadow` | `["shadow", stappen, punten]` | verduistert wat er al staat, 1–5 stappen omlaag in de eigen ramp van elke pixel. Dít is de op voor contactschaduwen: de schaduw krijgt de kleur van de ondergrond mee in plaats van er een grijze vlek overheen te leggen |
| `light` | `["light", stappen, dichtheid, punten]` | de andere helft van `shadow`: 1–5 stappen omhóóg in de eigen ramp, maar alleen waar de Bayer-drempel het toelaat. Dít is de op voor licht — een straal, een gloed, een veeg door een deuropening. Ze vult niets: wat eronder ligt blijft staan en wordt alleen lichter |
| `noise` | `["noise", kleur, dichtheid, seed, punten]` | deterministische spikkels: houtnerf, stof op een vloer, korrel op steen. De seed hoort bij de scène, niet bij de speler — hetzelfde beeld bij elke run |

Een paar vuistregels die uit het gebruik volgen:

- **Bouw van achter naar voor.** Eerst een `gradient` voor de wand, dan de
  vloer, dan de props, dan `shadow` onder elke prop, dan de voorgrond.
- **Schaduw ná de prop, niet ervoor.** `shadow` leest de buffer, dus wat er nog
  niet staat kan niet verduisterd worden.
- **Houd `noise` laag.** Boven ongeveer 0,2 wordt korrel ruis. Voor houtnerf zit
  je rond 0,08–0,15, voor gras op afstand rond 0,06.
- **Verduister met de ramp, niet met zwart.** Een prop in schaduw is dezelfde
  kleur, één stap lager — daarom staan de ramps in `js/palette.js` en heeft het
  palet `verduister`/`verhelder`.
- **Dither niet over een grote helderheidssprong.** Amber (56) in donkergrijs
  (49) mengen op 22 % levert geen subtiele gloed maar een oranje vlak: het oog
  middelt naar helderheid, dus een fel accent domineert ook als het in de
  minderheid is. Dit is bij de openingsbeelden fout gegaan en daarna rechtgezet;
  zie `workflow/19-de-opening.md`.
- **Een gloed hoort in de ramp van het oppervlak, niet in die van de lamp.** De
  scherpere versie van de regel hierboven, na dezelfde fout nog eens gemaakt te
  hebben op de wand achter de monitor (`workflow/20-de-zolder-hertekend.md`).
  Amberlicht op een paarse wand teken je niet met de gloed-ramp. De echte felle
  kleur zit alleen daar waar de lichtbron zelf is — in het scherm, in het raam.
- **Teken licht met `light`, niet met een vulling.** De sterkste vorm van
  dezelfde regel, en de reden dat de op bestaat
  (`workflow/21-de-kaarten-en-het-licht.md`). `ditherRamp` vult élke pixel van
  zijn veelhoek, dus een straal die ermee getekend is, is een dekkende plaat: ze
  gaat óver de kist en de dozen heen in plaats van erop te vallen, en waar ze op
  hout ligt verft ze het lavendel. Met `light` blijft de ondergrond staan en
  wordt hij alleen lichter — hout wordt lichter hout, een silhouet krijgt een
  rand mee. Zet de light-ops daarom ook achteráán in de picture: licht valt op
  een kamer, het ligt er niet onder.
- **Licht is rond, en het houdt niet op.** Een lichtkegel of halo als trapezium
  leest als een vórm — je ziet de hoeken. Maar ook een ronde gloed van één of
  twee ringen leest als een geschilderde koepel, want binnen de ring wordt een
  vaste fractie opgelicht en erbuiten niets: die sprong is een rand. Bouw een
  gloed uit vier of vijf ín elkaar liggende `light`-ringen van één stap met
  oplopende dichtheid (0,12 → 0,55). Ze tellen op, dus het midden wordt vanzelf
  het helderst en de buitenrand dooft uit in plaats van op te houden. Een
  lichtstraal uit een raam mag wél rechte randen hebben — die heeft hij in het
  echt ook — maar die bouw je in plakken ónder elkaar, met aflopende kracht naar
  beneden toe.

- **Een lichtbundel gaat in plakken.** Eén veelhoek met een vaste dichtheid
  leest als een schuine plank: licht wordt naar beneden toe breder én zwakker.
  Vier of vijf plakken met aflopende dichtheid, waarbij ook de ramp-kern
  meezakt van heet naar koel, geven die uitdoving. Zie de straal in
  `scene-zolder-west.js`.

## Beweging: de sfeerlaag

Een scène wordt één keer geïnterpreteerd en daarna als geheel gekopieerd
(`cacheScene`/`blitScene`). Alles wat beweegt, moet dus ná die kopie getekend
worden. Daarvoor is `scene.sfeer`:

```js
sfeer: [
  { soort: "stof", x, y, b, h, aantal, kleur, seed, snelheid }
]
```

Eén soort voorlopig: `stof`. Elk deeltje krijgt zijn startplek uit dezelfde
deterministische ruis als de `noise`-op, zakt traag met een eigen snelheid en
drijft licht zijwaarts. Deterministisch, want een screenshot moet vergelijkbaar
blijven.

Houd het klein. Stof hoort te suggereren dat er lucht in de kamer staat, niet de
aandacht te trekken: twintig deeltjes in de lichtstraal is genoeg, en in kamers
zonder lichtbron hoort er niets te bewegen.

## Diepte en voorgrond

- **`overlays`** in een scène is de voorgrondlaag: een lijst
  `{ baselineY, ops }`. De voet van het voorwerp staat op `baselineY`. Staat de
  speler verder naar achter dan die voet, dan tekent de engine het voorwerp ná
  de speler — dan loopt hij er echt achterlangs. Dit is de painter's order uit
  de stijlregels, en het geeft een kamer diepte zonder priority-buffer.
- **Sprite-schaling.** `tekenSprite` neemt `opts.schaal`. De voeten blijven
  staan waar ze staan, dus een figuur die naar achter kleiner wordt, blijft op
  dezelfde vloer. De stijlgids vraagt dit expliciet ("de speler wordt kleiner
  naar achter"); houd het subtiel, rond 0,8 achteraan.
- **Eén diepteregime voor iedereen.** De schaal komt uit
  `AL.loopveld.diepteSchaal(scene, y)` en geldt voor de speler én voor elke
  sprite uit `hotspots`. Tot WP 35 schaalde alleen de speler mee, en dat máákte
  de schaalfout: hij kromp naar achter toe terwijl het bureau en de dozen even
  groot bleven, dus juist waar de verhouding het meest opviel klopte ze het
  minst. Geschilderde geometrie schaalt niet — die teken je op de maat die bij
  haar diepte hoort, en dozen achteraan zijn dus een tikje kleiner getekend dan
  dozen vooraan. Voorgrond-`overlays` zijn ook verf en blijven ongemoeid.

## Scène-inventaris met mood-notities

De scène-ids zijn bindend en identiek aan `spelontwerp-legacy.md`.

| Scène-id | Mood |
|---|---|
| `titelkaart` | stille zolder in silhouet, één gouden lichtstraal (34/58), het logo eroverheen; melancholisch, uitnodigend |
| `opening-huis` | het huis van buiten bij avondval, schemerlucht uit de avond-ramp (28→32), één verlicht dakraam; je komt aan, je bent er nog niet binnen |
| `opening-trap` | de trap naar de zolder van onderaan, wanden die naar het lichtgat toe lopen, treden die naar voren breder worden; opgaan naar iets |
| `opening-pc` | een zwarte zolder met één ding aan: de monitor, halo als concentrische ellipsen uit de gloed-ramp; het staat hier al een hele tijd te branden |
| `zolder-west` | starthoek: dozen (26/23), het notitieboek op een kist in het licht (papier-ramp), stof in de lichtstraal (losse 34-pixels); warm, wachtend |
| `zolder-oost` | Alberta's werkhoek: het bureau, de pc met amber-gloeiend scherm (56–58), een lege stoel; intiem, "net verlaten" |
| `zolder-midden` | doorgang: balken (22–27), de broncode-doos centraal, licht dat van west naar oost trekt; spil, iets plechtigs |
| `overloop` (optioneel) | trap/berging, koeler (steen-ramp 49–52), minder avondlicht; ademruimte |
| `spread-template` | full-screen notitieboek-spread (zie hieronder); herkleed per level |
| `pc-chrome` | de VGA-styling rond editor/terminal — DOM-overlay, geen canvas (zie `engine-architectuur.md`). Turbo Vision als referentie: menubalk boven in inverse video, dubbellijns kaders, F-toetsenstatusbalk onder, scanlines aan dezelfde `crt`-schakelaar als het canvas. Geen afgeronde hoeken en geen gloed — dat is een filter uit 2015, geen monitor uit 1990. `CHECK_OK` in de gebladerte-ramp (44), `CHECK_FAIL` in helderrood (12) |
| `eindkaart` | drager voor Alberta's oordeel en de epiloog; de lichtstraal wint terrein, warmer dan de titelkaart |

De sim-kamers van _Seven Little Goats_ (geitenhuisje, molen, rivieroever …)
worden in de terminal-simulatie als **tekst** gespeeld, niet als getekende
scènes (het is Alberta's prototype-fase, zie `achtergrond.md`); ze hebben dus
geen scène-tekening nodig. Wil een latere polish-ticket toch één sfeerbeeld voor
de rivieroever-showdown, dan volgt dat deze stijlgids, maar het is geen
MVP-vereiste.

## Sprite-specificaties

Sprites volgen het frame-formaat van `sprite-schema.md` (array van strings, één
teken per pixel, `.` transparant), met één uitbreiding voor het grotere palet.

> Beslissing: sprites blijven één-teken-per-pixel, maar krijgen elk een eigen
> **sub-palet**. Een sprite declareert `palet: [i0, i1, … i15]` (tot 16 indexen
> uit het 64-kleuren-palet); de frame-tekens `0`–`f` verwijzen naar dat lokale
> sub-palet, `.` blijft transparant. Zo blijft de compacte pixel-string bestaan
> én kan een sprite uit de volle 64 kleuren putten. De renderer vertaalt het
> sub-palet naar echte paletindexen bij het blitten.

Specs:

De maten zijn bovengrenzen en volgen de maatregel hierboven. Ze zijn in WP 35
aangehaald tot vlak boven de werkelijke maat van elke sprite: een bovengrens van
32 × 32 voor een monitor van een halve meter bewaakt niets.

| Sprite | Anims | Maat (richtlijn) | Anker |
|---|---|---|---|
| `speler` | sta-noord/oost/zuid, loop-noord/oost/zuid, draai, zit-oost | ≤ 16×32 | voeten-midden |
| `notitieboek` | idle | ≤ 20×12 | voeten-midden |
| `pc` | idle, aan | ≤ 20×18 | voeten-midden |
| `doos` | idle | ≤ 24×20 | voeten-midden |
| `broncode-doos` | idle, open | ≤ 28×24 | voeten-midden |
| `stoel` | idle | ≤ 14×20 | voeten-midden |

`doos` en `broncode-doos` houden hun maat: zíj zijn de eenheid waar het
geschilderde karton zich sinds WP 35 aan meet.

Regels:

- Anker altijd onderkant-midden (bij even breedte links van het midden), zoals
  de predecessor.
- **West = gespiegeld oost**: lever geen `-west`-anims; de engine spiegelt.
  Vermijd asymmetrie die gespiegeld fout oogt.
- **Alle frames van één anim zijn even breed.** Het anker is horizontaal
  gecentreerd, dus een frame dat een pixel breder is, schuift de hele figuur een
  halve pixel op — en dat leest als trillen.
- **De deining zit in de hoogte, niet in een verschuiving.** Een doorzwaaiframe
  mag één rij hóger zijn dan een steunframe. Omdat het anker onderaan ligt,
  blijven de voeten dan staan en komt de romp omhoog: precies wat er gebeurt als
  je over je steunbeen heen rolt. Dat ene pixel doet meer voor "dit is lopen"
  dan de voetstanden samen. Méér dan één rij is geen deining meer maar
  stuiteren.
- **Ademen: twee frames op 1 Hz.** Op het tweede zakt het hoofd één pixel en
  wordt de romp één rij korter. Een sprite die volledig stilstaat leest als een
  standbeeld, ook in een spel waarin niets beweegt.
- **Armzwaai alleen in het zijaanzicht.** Van voren en van achteren zitten de
  armen ín het silhouet; daar leest een naad van één pixel in de diepste trap
  van de ramp beter dan een uitstekende arm. Opzij is er breedte voor een mouw
  van twee pixels die vóór de romp uitkomt.
- **Een eenmalige anim staat op `fps: 0`.** De engine zet die frame voor frame,
  dus een tempo erop zou hem dubbel laten lopen.
- De speler is klein op het scherm (Sierra-verhouding, ± 1/6 van de
  schermhoogte); geen close-upsprites, geen gezichtsdetail (zie de speler-
  beslissing in `achtergrond.md`). Concreet: 15 × 31, met 32 rijen voor de
  doorzwaaiframes. Het gezicht is een vlak stuk huid met een lichtkant — geen
  ogen, geen mond.
- **Sprites zijn van rechts belicht**, net als de props: het dakraam staat in
  elke kamer rechts. De donkerste trap van een ramp hoort links, de lichtste
  rechts. Eén uitzondering met open vizier: `spiegel` keert de belichting mee
  om, dus een naar het westen lopende speler is een paar tellen van links
  belicht. Dat is de prijs voor het halveren van het aantal frames; wie dat niet
  wil, tekent aparte `-west`-anims, en dat mag hier niet.
- 1 px donkere outline waar de sprite anders in de achtergrond verdwijnt.

## Het notitieboek-spread — visuele taal

De spreads dragen de meeste "nieuwe" beelden per level en zijn een goedkope
scène-vorm (één herkleed sjabloon in plaats van nieuwe kamers).

- **Papier:** het vlak is de papier-ramp (35–38), met een lichte gradiënt van
  38 in het midden naar 35 in de bocht van de rug. Een verticale rugschaduw
  (39/40) in het midden verdeelt de twee bladzijden. Er hoort **korrel** in —
  een blad van 320 bij 200 in één egale kleur leest als een gekleurd vlak —
  maar zuinig: 0,04 op één kleur is genoeg, op het dubbele wordt het jute. En
  **liniatuur**: een notitieboek is gelinieerd, met de regelafstand van
  `BLAD.regelH`, zodat het handschrift ín de lijn valt en niet erover.
- **Beschadiging:** waterschade en koffievlekken als grillige 39/40-vlekken,
  precies waar de puzzel zit — de beschadiging "verklaart" de ontbrekende code.
  Een gescheurde hoek, een ezelsoor, doorgelopen inkt (41 dat uitwaaiert naar
  40) mogen als sfeer.
  - **Per level, niet gedeeld.** Ze staan in `js/scenes/spread-schetsen.js` en
    niet in het sjabloon: één vlek op een vaste plek is dezelfde vlek op alle
    zeven de spreads, en dan verklaart ze niets.
  - **Ze vreet de schets aan, ze gumt hem niet uit.** Een dichtheid rond 0,20
    op 39 met een binnenlaag rond 0,10 op 40 leest als een wasplek; boven
    0,35 leest ze als zand en verdwijnt de tekening eronder. Een schets die je
    niet meer kunt lezen, is geen schets meer.
  - **Dezelfde vlek op beide bladzijden.** Een vlek trekt door het papier heen.
    De schets staat alleen op de tweede bladzijde, de vlek op allebei — dus wie
    doorbladert ziet dezelfde plek terugkomen.
- **Handschrift:** Alberta's notities in inkt (41) op de papierkleur, gezet met
  haar eigen glyphset — zie §"Typografie" hieronder voor de ontwerpregels van
  die font. Op deze bladzijde telt vooral dat de **liniatuur en de font
  dezelfde maat delen**: de lijnen staan op `BLAD.regelH` en de basislijn van de
  font ligt er één pixel boven, dus Alberta schrijft óp de lijn.
  - De **kop staat in dezelfde hand en dezelfde maat**, alleen zonder de
    spatievariatie: een titel schrijft een mens trager en gelijkmatiger op.
    Verder is hij herkenbaar aan de streep eronder — een tweede lettergrootte
    hoeft er niet bij. Wat een kop níét mag zijn is de gedrukte prosefont, want
    dan staan er twee schrijvers op één blad.
- **Schetsen:** Alberta's diagrammen in inkt met spaarzame kleuraccenten (12
  voor een doorhaling, 44 voor een groen vinkje). Verder niets: het is een
  balpen op papier, geen illustratie. Inkt (41) voor de lijn die telt, 40 voor
  wat lichter is aangezet — arcering, hulplijnen, maatstreepjes.
  - Ze staan in `js/scenes/spread-schetsen.js` en vallen binnen
    `AL.spreads.BLAD.schets`: de onderste helft van de rechterbladzijde. De
    tekst van díé kolom stopt daarboven; het linkerblad loopt door tot onderaan.
  - Ze staan op de **tweede** bladzijde van een spread. Dat is de bladzijde waar
    Alberta zegt wat er nog niet af is, en de schets hoort bij díe stand van
    zaken: wie leest dat twee lus-methoden ontbreken (level 5), ziet eronder de
    kaarten waar ze het over heeft. De eerste bladzijde is de brief.
  - De schetsstijl spiegelt de scharnier-metaforen (zie de
    metafoor-woordenschat in `levels-en-scharnieren.md`): de klassekaart (1),
    trechters-en-goot (2), knikkerbaan met klem en splitsing (3),
    twee-pijlen-één-doos (4), de patroonkaart met turfjes (5), de plankenbrug
    met genummerde planken (6), het zoekspoor en de dubbele pijl (7).
  - **Level 1 is de uitzondering, en met opzet (WP 48).** Daar stond de
    blauwdruk-en-doos: een gestippeld plan, een pijl, een driekwart doos. Die
    tekening lééft de metafoor uit, en dat is uitleg — precies wat de docent uit
    het notitieboek weg wilde ("Logischer zou bijv zijn om de velden op te
    sommen die bij geitje horen of om een soort klassendiagram te schetsen").
    Level 1 draagt nu een klassekaart: een kader met een naamvak bovenaan en de
    velden eronder, met een tweede kaart half buiten beeld.
  - **Labels in een schets** mogen, sinds diezelfde kaart. Ze staan in het veld
    `labels` van een set — `[x, y, tekst]` — en de spread-renderer zet ze in
    Alberta's hand (kleur 41, zonder spatievariatie) ná de beschadiging: een
    koffiering vreet een tekening aan, niet wat ze erbij schreef. Types horen er
    niet in; die staan in de spec op bladzijde 1. `tools/lint-scene.mjs` en
    `test/test-spreads.mjs` rekenen na dat een label in het schetskader valt.
- **De weekregel:** onderaan de rechterbladzijde, in Alberta's hand: "Week X in
  mijn schema." Sinds WP 45 is dat één regel (de oude, langere zin nam er twee).
  De renderer houdt er nog altijd ruimte voor drie: proportioneel handschrift is
  breder dan het raster waarop zulke zinnen ooit pasten, en die marge is wat een
  langere voet behoedt voor stil afkappen.
- **Chroom hoort op het linkerblad.** Bladwijzer links, bladerhint ertegenaan.
  De onderrand van het rechterblad is van de weekregel; stond de hint daar ook,
  dan schreven ze door elkaar heen.

Zo blijft één spread-sjabloon herkenbaar terwijl de schets, de notitie en de
beschadiging per level verschillen — de goedkope, verhaal-trouwe scène-vorm die
het plan vraagt.

## Typografie

Er staan drie letterbehandelingen in het spel, en méér mogen het er niet
worden. Elke behandeling heeft één stem en één plaats.

1. **De druk** — `js/font.js`, de 8×8-bitmapfont in de stijl van de
   IBM-PC-BIOS-font, proportioneel gezet met de inktmaat per glyph
   (`gfx.tekenProse`). Dit is de stem van de verteller: kamerbeschrijvingen,
   berichtvensters, de opening, de eindkaart.
2. **De hand** — `js/font-hand.js`, Alberta's handschrift. Alleen het
   notitieboek-spread: de kop, de regels en de weekregel.
3. **Het monospace chroom** — dezelfde drukfont, maar op het raster van acht
   pixels (`gfx.tekenTekst`). De status- en invoerbalk, de gesimuleerde pc, en
   op het spread: het paginanummer en de bladerhint.

### De hand: ontwerpregels van de handschriftfont

De hand is een **échte glyphset**, geen bewerking van de drukfont. Tot WP 36
was ze dat wel: de drukfont met een shear van 0,25 en een verticale
driehoeksgolf van ±1 px met periode vier tekens. Die golf was index-gebaseerd,
dus elke regel deinde identiek, en op een blad met twaalf regels leest dat als
verticale banding. Die benadering is teruggedraaid; wat een hand moet maken,
zit nu in de glyphdata.

- **De cel is 8×10.** Rij 0–1 is de stokzone en de accentzone, rij 2–7 de
  x-hoogte (zes pixels), rij 7 de nominale basislijn, rij 8 de rij waar de
  liniatuur loopt, rij 9 de staartzone. De cel moet binnen `BLAD.regelH` (11)
  blijven, anders loopt de staart van een "g" door de kop van de regel eronder.
- **Onregelmatige basislijn, gebakken per glyph.** Elk teken heeft zijn eigen
  ligging: een pixel boven de lijn, op de lijn, of op de lijn zelf. Dat is de
  hele deining — er zit geen formule meer in de renderer. Omdat de afwijking
  aan het teken hangt en niet aan de positie in de regel, kan ze per definitie
  geen patroon vormen dat over de regels heen als banding leest.
  - **Nooit meer dan één pixel.** Twee is geen dwalende hand meer maar een
    letter die eraf valt.
  - **Alleen zakken bij letters waarvan de kleine en de grote vorm gelijk zijn**
    (c o s u v w x z). Zo'n letter een pixel optillen laat haar als een kleine
    hoofdletter lezen: "vult de velden" werd "Vult de Velden".
- **Variabele inktbreedte**, van 2 px (de "i") tot 7 px (de "m" en de "w"). Het
  woordwit is 3 px, één minder dan in de druk: de handletters zijn smaller, dus
  een breder wit zou de woorden uit elkaar trekken.
- **De schuinstand zit in de glyphs**, niet in een shear: de stokken van b d f
  h k l t staan bovenaan één kolom rechts van hun voet, de staarten van g j p q
  y buigen naar links. Een shear kantelt het hele raster en zet ook punten en
  streepjes scheef; een pen doet dat niet. `gfx.tekenHandschrift` kent nog een
  `schuin`-optie, maar ze staat op 0.
- **Één hand per blad.** De renderer varieert nog precies één ding: de
  spatiëring, met één pixel per teken, deterministisch uit de save-seed. De kop
  zet diezelfde hand met die variatie uit.
- **Dekking is een testeis, geen inschatting.** De handfont dekt alles wat de
  drukfont dekt; `test/test-typografie.mjs` houdt elk teken dat in handschrift
  op een bladzijde komt tegen de glyphset. Eén ontbrekend teken is een "?" op
  een bladzijde die je pas ziet als je toevallig dié bladzijde opslaat.

### Waarom het boek-chroom monospace blijft

Het paginanummer en de bladerhint onderaan het spread staan bewust in de
monospace drukfont, niet in Alberta's hand. Ze zijn geen deel van wat zij
opschreef: ze horen bij het bláderen, zoals de statusbalk bij het lopen hoort.
In haar hand zouden ze meeliegen dat zij "1/2" en "spatie >" op het papier
heeft gezet. Het formaatverschil is precies het punt — de speler leest ze als
apparatuur en niet als tekst, en kijkt eroverheen zodra hij verder wil.
