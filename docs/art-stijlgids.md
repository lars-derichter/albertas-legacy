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
| 4 | `#AA0000` | donkerrood | mantel-schaduw, baksteen |
| 5 | `#AA00AA` | magenta | spaarzaam: accenten |
| 6 | `#AA5500` | bruin | hout, paden, meubels |
| 7 | `#AAAAAA` | lichtgrijs | steen, stof, rook |
| 8 | `#555555` | donkergrijs | schaduwsteen, wolf |
| 9 | `#5555FF` | helderblauw | water, lucht-accent |
| 10 | `#55FF55` | lichtgroen | gras met zon |
| 11 | `#55FFFF` | lichtcyaan | lucht (dither met 3) |
| 12 | `#FF5555` | helderrood | mantel-licht, vuur |
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

- **Zolderlicht:** de avond-ramp (28–34); de lichtstraal uit het dakraam is
  34 met een kern van 58, schuin over de vloer.
- **Zoldervloer en balken:** hout-ramp (22–27), planklijnen in 22.
- **Dozen:** karton in 26/25 met schaduw 23; labels als 41-inkt op 36-papier.
- **De pc:** beige kast in 51/52, scherm-gloed 56→58 (amber CRT), aan-staat met
  een 34-halo.
- **Roodkapje / de speler:** mantel 12 met schaduw 4 (callback naar de
  predecessor), huid uit de huid-ramp, haar 41 of 23.
- **Buiten (de sim-scènes, indien getekend):** lucht dither 61/63 avond of
  3/11 dag; gras 44/45 met vlekken 42; boomstammen 24 met schaduw 22, kruinen
  43 met zon 46.
- **De wolf:** koelgrijs-ramp (49/50/51), buik 52, ogen 14.

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

De renderer kent elf ops. De eerste zeven zijn de basis uit de
predecessor-engine; de laatste vier zijn erbij gekomen omdat de stijlregels
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
| `noise` | `["noise", kleur, dichtheid, seed, punten]` | deterministische spikkels: houtnerf, stof op een vloer, korrel op steen. De seed hoort bij de scène, niet bij de speler — hetzelfde beeld bij elke run |

Een paar vuistregels die uit het gebruik volgen:

- **Bouw van achter naar voor.** Eerst een `gradient` voor de wand, dan de
  vloer, dan de props, dan `shadow` onder elke prop, dan de voorgrond.
- **Schaduw ná de prop, niet ervoor.** `shadow` leest de buffer, dus wat er nog
  niet staat kan niet verduisterd worden.
- **Houd `noise` laag.** Boven ongeveer 0,2 wordt korrel ruis. Voor houtnerf zit
  je rond 0,08–0,15.
- **Verduister met de ramp, niet met zwart.** Een prop in schaduw is dezelfde
  kleur, één stap lager — daarom staan de ramps in `js/palette.js` en heeft het
  palet `verduister`/`verhelder`.

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

## Scène-inventaris met mood-notities

De scène-ids zijn bindend en identiek aan `spelontwerp-legacy.md`.

| Scène-id | Mood |
|---|---|
| `titelkaart` | stille zolder in silhouet, één gouden lichtstraal (34/58), het logo eroverheen; melancholisch, uitnodigend |
| `zolder-west` | starthoek: dozen (26/23), het notitieboek op een kist in het licht (papier-ramp), stof in de lichtstraal (losse 34-pixels); warm, wachtend |
| `zolder-oost` | Alberta's werkhoek: het bureau, de pc met amber-gloeiend scherm (56–58), een lege stoel; intiem, "net verlaten" |
| `zolder-midden` | doorgang: balken (22–27), de broncode-doos centraal, licht dat van west naar oost trekt; spil, iets plechtigs |
| `overloop` (optioneel) | trap/berging, koeler (steen-ramp 49–52), minder avondlicht; ademruimte |
| `spread-template` | full-screen notitieboek-spread (zie hieronder); herkleed per level |
| `pc-chrome` | de VGA-styling rond editor/terminal — DOM-overlay, geen canvas (zie `engine-architectuur.md`) |
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

| Sprite | Anims | Maat (richtlijn) | Anker |
|---|---|---|---|
| `speler` | sta-noord/oost/zuid, loop-noord/oost/zuid | ≤ 16×32 | voeten-midden |
| `notitieboek` | idle | ≤ 24×16 | voeten-midden |
| `pc` | idle, aan | ≤ 32×32 | voeten-midden |
| `doos` | idle | ≤ 24×20 | voeten-midden |
| `broncode-doos` | idle, open | ≤ 28×24 | voeten-midden |
| `stoel` | idle | ≤ 20×28 | voeten-midden |

Regels:

- Anker altijd onderkant-midden (bij even breedte links van het midden), zoals
  de predecessor.
- **West = gespiegeld oost**: lever geen `-west`-anims; de engine spiegelt.
  Vermijd asymmetrie die gespiegeld fout oogt.
- De speler is klein op het scherm (Sierra-verhouding, ± 1/6 van de
  schermhoogte); geen close-upsprites, geen gezichtsdetail (zie de speler-
  beslissing in `achtergrond.md`).
- 1 px donkere outline waar de sprite anders in de achtergrond verdwijnt.

## Het notitieboek-spread — visuele taal

De spreads dragen de meeste "nieuwe" beelden per level en zijn een goedkope
scène-vorm (één herkleed sjabloon in plaats van nieuwe kamers).

- **Papier:** het vlak is de papier-ramp (35–38), met een lichte gradiënt van
  38 in het midden naar 35 in de bocht van de rug. Een verticale rugschaduw
  (39/40) in het midden verdeelt de twee bladzijden.
- **Beschadiging:** waterschade en koffievlekken als grillige 39/40-vlekken,
  precies waar de puzzel zit — de beschadiging "verklaart" de ontbrekende code.
  Een gescheurde hoek, een ezelsoor, doorgelopen inkt (41 dat uitwaaiert naar
  40) mogen als sfeer.
- **Handschrift:** Alberta's notities in inkt (41) op de papierkleur. De
  handschriftbenadering is de 8×8-bitmapfont van de engine, maar **schuin en
  onregelmatig gezet** (kleine y-jitter per teken, lichte spatie-variatie) zodat
  het als handschrift leest zonder een handschriftfont nodig te hebben. Een
  polish-ticket mag later een echte pixel-handschriftfont toevoegen; de jitter-
  benadering is de MVP.
- **Schetsen:** Alberta's diagrammen (een klasse als doos met velden, pijlen
  tussen dozen voor referenties, een lus als cirkelpijl) in inkt met spaarzame
  kleuraccenten (12 voor nadruk, 44 voor een groen vinkje). De schetsstijl
  spiegelt de scharnier-metaforen: de blauwdruk-en-doos-tekening voor level 1,
  twee-pijlen-één-doos voor level 4, de plankenbrug voor level 6, enzovoort (zie
  de metafoor-woordenschat in `levels-en-scharnieren.md`).
- **De weekregel:** onderaan de rechterbladzijde, in Alberta's hand: "Dit zou je
  moeten kunnen na week X van de cursus."

Zo blijft één spread-sjabloon herkenbaar terwijl de schets, de notitie en de
beschadiging per level verschillen — de goedkope, verhaal-trouwe scène-vorm die
het plan vraagt.
