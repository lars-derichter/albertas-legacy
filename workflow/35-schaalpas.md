# 35 — Schaalpas over de scènes

Werkpakket 35 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). Doel: alles in de vier kamers
staat op één maat, en die maat staat opgeschreven.

## Opdracht

Uit het goedgekeurde programma, WP 35:

> Vaste maatregel in de stijlgids: 1 px ≈ 5 cm (speler ~31 px ≈ 1,55 m);
> props herijken: koffietas naar ~5×6 px, bureau/stoel/pc kloppend (de
> speler moet aan het bureau kunnen zitten), geschilderde dozen vs
> doos-sprites gelijkgetrokken, notitieboek/kist, overloop-stapels.
> Dieptescaling: één regime — hotspot-sprites schalen mee met de actor, of
> de actor-scaling gaat eruit. Scale-lint: test die sprite- en
> geschilderde objectmaten tegen de maatregel houdt (minstens de bekende
> gevallen).

De klacht van Lars waar het pakket uit voortkomt, letterlijk: *"the size
off the coffee cup compared to the computer and the chair (a lot of visual
scaling feels off)"*. De verkenning (bijlage A.2 van de kickoff) mat het na:
een mok van 14 × 16 px tegen een speler van 13 × 25, een bureaublad op y116
waar het hoofd van de speler niet bij kwam, geschilderde dozen van twee tot
drie en een half keer de doos-sprite ernaast, en een diepteschaal die alleen
op de speler werkte.

## Aanpak

### Eerst de maat, dan de kamers

`docs/art-stijlgids.md` heeft een nieuwe paragraaf §De maatregel met de regel
(1 px ≈ 5 cm), de tabel met de referentiematen en twee vuistregels: de
verhouding tussen buren telt zwaarder dan de absolute waarheid, en kleine
voorwerpen mogen tot ongeveer anderhalve keer hun ware maat. Elke uitzondering
staat mét haar factor in de tabel. Daarna is elke kamer tegen díé tabel
hertekend, niet tegen het gevoel.

Wat er per kamer veranderd is, oud → nieuw:

**Werkhoek (`zolder-oost`)**

- Mok 14 × 16 px + oor (x110–128) → 4 × 5 px met oor op x186. Van bijna
  spelerbreedte naar twintig centimeter.
- Bureau: blad x104–251 (148 px ≈ 7,4 m), blad op y116, poten tot y168/174
  → blad x168–217 (50 px ≈ 2,5 m), bladvlak y142–147, voorrand y148, poten
  tot y162. Bureauhoogte 14 px boven de eigen voetlijn (0,70 m).
- Toetsenbord 46 × 10 → 13 × 3. Papier op het blad 26 × 8 → 8 × 3.
  Onderplank 126 × 5 → 34 × 3, en lager gelegd zodat ze niet met de
  stoelzitting samenvalt.
- `sprite-pc.js` 28 × 26 → 18 × 16 (op diepte geblit als 15 × 13). Monitor,
  hals en kast opnieuw getekend; scherm 8 × 6 px, ruim genoeg voor de
  amber-gloed en de tekstregels.
- `sprite-stoel.js` 18 × 26 → 12 × 19, zitting op negen pixels, frame in
  hout warm in plaats van hout mid.
- Monitorgloed: vijf koepels van x80–312 op basis y116 → vijf koepels van
  x158–258 op basis y143, om het nieuwe schermvlak heen.
- Blok `[104,150,148,24]` → `[168,150,50,17]`.

**Westhoek (`zolder-west`)**

- Drie geschilderde dozenmassa's van 62 × 64, 58 × 44 en 46 × 34 px → elf
  losse dozen van 16 × 13 tot 18 × 15 px in dezelfde drie stapels, op
  dezelfde plekken. De achterste stapel kreeg een contactschaduw op de
  wand-vloerlijn, anders hing ze aan de muur.
- Kist 96 × 42 px (x146–241) → 40 × 19 px (x176–215).
- `sprite-notitieboek.js` 22 × 13 → 16 × 10, op de kist geblit als 14 × 9.
- Blokken `[10,150,104,20]` en `[146,150,96,28]` → `[10,150,102,23]` en
  `[176,150,40,28]`.

**Doorgang (`zolder-midden`)**

- Geschilderde stapel rechts 34 × 30 → drie dozen van 17 × 13.
- De voorgrondstapel (silhouet, x296–319) hield haar maat — ze staat vooraan
  op schaal 1 en 24 px is daar de doosmaat — maar kreeg naden om de zestien
  pixels in plaats van één naad, zodat ze als vier dozen leest.
- Blok ongewijzigd: het houdt de speler ook uit de voorgrondstapel, waar zijn
  hoofd anders boven het silhouet uit komt (zie `workflow/34`).

**Overloop**

- Drie torens van 62 × 148, 46 × 92 en 52 × 58 px → negentien dozen van
  16 × 13 px in dezelfde drie massa's. De linkertoren is vier dozen hoog
  (52 px) tegen een speler van 26 px op die diepte: "hoger dan jij" komt nu
  uit het stapelen.
- Labels 34 × 11 → 11 × 6.
- Blokken `[6,152,120,17]` en `[222,152,80,13]` → `[6,152,116,15]` en
  `[230,152,50,13]`.

### Eén diepteregime

De schaalberekening staat niet langer in `engine.js` maar in
`js/loopveld.js` als `diepteSchaal(scene, y)` — dezelfde module die ook
bepaalt waar de voeten mogen komen, en al DOM-vrij en Node-testbaar.
`tekenActor` en `tekenPropsEnActor` gebruiken haar allebei, met dezelfde
`y` waarop de painter's order al sorteerde. Het anker is voeten-midden, dus
een geschaalde prop blijft op zijn eigen vloerpunt staan; dat is nagemeten
en niet aangenomen. Props die hóger staan dan de loopstrook (de pc op het
blad) klemmen op de achterste schaal, en dat is precies de schaal van de
plek waar ze staan.

Geschilderde geometrie schaalt niet mee — die wordt getekend op de maat die
bij haar diepte hoort. Daarom zijn de dozen achteraan in de westhoek een
pixel of twee kleiner getekend dan die vooraan. Voorgrond-`overlays` zijn
ook verf en blijven ongemoeid.

### De maatkeuring

`test/test-schaal.mjs` (veertien keuringen) meet verhóudingen, want dat is
wat er fout was. Waar het kan, rekent ze uit de scènedata zelf: draw-ops
zijn arrays, dus het bureaublad is het enige verloop van 25 naar 26, de
poten zijn de twee smalle hoge rechthoeken in 25, en elk vlak van minstens
12 × 10 px in kartonkleur is een doos die tegen `sprite-doos` gemeten wordt.
Wat ze bewaakt: de mok onder een kwart spelerhoogte, de bureauhoogte tussen
13 en 18 px, het blok dat op de geschilderde voetlijn aansluit, de
stoelzitting op negen pixels, de handen van de zithouding op de voorrand van
het blad, de pc onder anderhalve ware maat, elke geschilderde doos binnen
0,7–1,5 × de doos-sprite, de torens hoger dan de speler op hun eigen diepte,
de kist onder anderhalve spelerhoogte, het notitieboek hoogstens half zo
breed als de kist, en de diepteschaal zelf (1 vooraan, 0,84 achteraan,
klemmend, monotoon).

## Beslissingen

### De zit-reeks speelt op de stoel, niet waar je stond

WP 34 liet uitdrukkelijk staan dat de speler gaat zitten waar hij toevallig
staat. Met een bureau op ware maat kan dat niet meer: er is precies één plek
waar de handen van het derde `zit-oost`-frame op de voorrand van het blad
uitkomen, en dat is de zitting. `engine.startZitten` zoekt daarom de hotspot
met `item: "stoel"` op en zet de speler daar neer. De prose zei het al ("Je
schuift Alberta's stoel bíj"); alleen de engine deed het niet.

Dat de zitplek in het blok van het bureau ligt, kan geen kwaad: de speler
wordt er neergezet en loopt er niet naartoe, en na het sluiten van de
pc-overlay zet `betreedZolder` hem terug op de entry van de kamer. Bijvangst:
`hotspot.item` was een dood veld (het stond op de lijst van WP 38) en heeft
nu een lezer.

### De sprites zijn verkleind, de zit-frames niet

De verleiding was om de arm van het zit-frame omhoog te zetten tot
bureauhoogte. Dat is niet gebeurd: de hand ligt op elf pixels boven de
voeten, en met de stoel op de voetlijn van het bureau en de diepteschaal
erop komt ze op y150 uit, één pixel onder de voorrand van het blad op y148.
De meetkunde is opgelost door het meubilair op één vloerlijn te zetten, niet
door de figuur een houding te geven die hij nergens anders kan gebruiken.

### Karton is 25/26, hout op de vloer is 23/24

De hout- en de kartonkleuren komen uit dezelfde ramp, dus alleen een afspraak
houdt ze uit elkaar — en de maatkeuring hángt van die afspraak af: ze telt
élk vlak in 25 of 26 als een doos. Halverwege dit pakket kreeg de kist een
voorvlak in karton-warm omdat ze zo losser van de vloer kwam; de keuring
zakte er meteen op, en terecht. Het voorvlak is weer hout mid, het contrast
komt van het lichte deksel, en de regel staat nu in de stijlgids.

### De kamers zijn leger geworden, en dat is de prijs

Dit is het eerlijke gevolg van de maatregel en het hoort hier te staan: waar
vroeger een dozenmassa van zeven meter hoog tot voorbij de bovenrand van het
speelveld liep, staat nu een stapel van vier dozen met kale wand erboven.
Hetzelfde geldt voor het bureau: 50 px in een beeld van 320 px is klein. De
verhouding klopt, de vulling niet meer overal. `test-results/wp35-voor-na-*`
legt beide toestanden onder elkaar; het oordeel of er ergens iets bíj moet
(een plank, een tweede stapel, een raamnis) is aan de manager en is bewust
niet in dit pakket genomen — dat zou hertekenen zijn en geen schaalpas.

### Wat er niet is aangeraakt

- `sprite-doos.js` (22 × 18) en `sprite-broncode-doos.js` (26 × 22) houden
  hun maat: zíj zijn de eenheid waar het geschilderde karton zich aan meet.
  Ze zijn met 1,1 m aan de ruime kant van een verhuisdoos, maar ze
  verkleinen zou elke geschilderde doos in vier kamers meeslepen zonder dat
  er iets aan de verhouding verbetert.
- De sim, de spreads en de openingsbeelden. Daar staat geen speler naast
  iets anders; er is niets te vergelijken en dus niets te herijken.

### Bijvangst in de prose

`js/logic/strings.js`, kamerbeschrijving van de werkhoek: "De stoel staat
schuin van het bureau weggeschoven" → "De stoel staat schuin voor het
bureau". Met een bureau op ware maat staat de stoel eraan, niet ervandaan;
"weggeschoven" beschreef een kamer die er niet meer is. De rest van de
onderzoek-teksten is nagelopen op maatuitspraken en klopt: de mok is
halfvol en niet groot, de dozen zijn ingezakt onder het gewicht van de
bovenste (er stáán er nu meer op elkaar), de torens op de overloop zijn
hoger opgestapeld dan de rest, en het bureau is "vol, maar niet rommelig".

## QC-resultaat

- `node --test test/test-*.mjs` — **382/382 groen** (was 368; veertien
  nieuwe keuringen in `test/test-schaal.mjs`).
- `node tools/lint-scene.mjs` — alle elf scènes in orde.
- `node tools/check-assets.mjs` — geen drift, 9 editor-modellen byte-getrouw.
- `smoke-browser` **38/38**, `smoke-walk` **25/25**, `smoke-pc` **32/32**,
  `smoke-full-playthrough` **97/97** (Chromium via `AL_CHROMIUM`).
- Bijgewerkte testverwachtingen, allemaal geometrie die met de kamers
  meeverhuisde: `test-loopveld.mjs` (bureau- en stoelpunten), `smoke-walk`
  (kist op x176 in plaats van x146, bureau tot y166, torens tot x121, en de
  eerste botsing tegen de kist duurt zes seconden in plaats van vier omdat
  de kist zeventig pixels verder naar rechts staat), `test-sprites.mjs`
  (de maatbudgetten van pc, stoel en notitieboek aangehaald tot vlak boven
  hun nieuwe maat). Geen enkele semantische controle is versoepeld.
- Nagemeten in de browser: de speler stopt vóór het bureau op y168 (blok tot
  y166), de zit-reeks zet hem op x186 y162 en zijn hand komt op y150 uit,
  één pixel onder de voorrand van het blad.
- Screenshots in `test-results/`, ter beoordeling door de manager:
  `wp35-{zolder-west,zolder-midden,zolder-oost,overloop}.png` (de vier
  kamers), `wp35-zit-bureau.png` (de zithouding aan het bureau, vastgelegd
  tijdens het derde zit-frame), `wp35-voor-{kamer}.png` (dezelfde vier
  kamers op commit `9c5d4a2`, gerenderd uit een tijdelijke worktree) en
  `wp35-voor-na-{kamer}.png` (voor en na onder elkaar).
