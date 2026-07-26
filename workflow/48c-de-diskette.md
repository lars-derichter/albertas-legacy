# 48c — De diskette

## Opdracht

Ingelast door de manager op vraag van de docent, tussen WP 48b en WP 49. Lars
las de endgame en zag een gat in de fictie:

> Ik vind het niet logisch dat de afgewerkte broncode er de hele tijd al was.
> In de plaats daarvan zou de bewaarde, gerepareerde broncode op een floppy
> disk kunnen bewaard worden die je kan meenemen uit de pc. Gezien de tijd
> waarin het gemaakt lijkt te zijn zou dat een 1,44MB diskette moeten zijn.
> Die zou je kunnen tekenen met daarop een etiket en in Alberta's handschrift:
> '7 little goats'. Dit beeld kan verwerkt worden in een eindsequentie.

Hij heeft gelijk, en het gat zat dieper dan één regel proza. Het hele spel
staat op één premisse — haar spel is *niet* af — terwijl de zolder een
dichtgeplakte doos droeg waarin volgens `achtergrond.md` "letterlijk, de echte
Java van `seven-little-goats/`" lag, en de epiloog zei: "De broncode ligt op
zolder — neem ze mee." Dat is dezelfde broncode die de speler net zeven
hoofdstukken lang hersteld heeft. Ze lag er dus al af, in een doos, terwijl hij
zat te werken.

Meegegeven door de manager: teken de diskette als nieuwe kaart, hang de
eindsequentie eraan op, herschrijf het proza dat de doos als prijs opvoert, en
neem als bijvangst de menutitels van de terminalpuzzels mee (WP 48b leverde die
bevinding op: het menu toonde "l6-trace" en "l6-vindfout").

## Aanpak

### Wat het onderzoek eerst vond

De keten stond in `js/engine.js` als `level-af:7` → `bootSim` → `sim` →
`oordeel` → `epiloog` → titel, met de logica DOM-vrij in `js/logic/world.js`
(`bootSim`, `simVoltooid`, `startOordeel`, `startEpiloog`). Twee vondsten die
de aanpak bepaalden:

- **De broncode-doos gaat nergens open.** `world.open(t, "broncode-doos")`
  antwoordt met één string en geeft een lege effectenlijst terug; geen enkel
  pad in de engine of de endgame raakt haar aan. De belofte "deze doos is voor
  het einde" werd dus nooit ingelost — ze was al een dode belofte vóór dit
  pakket.
- **Handschrift is geen picture-op.** De scène-ops kennen geen tekst; het
  handschrift komt uit `gfx.tekenHandschrift` in de renderlaag, zoals de
  spread-inhoud. Het etiket moest daarom in de engine getekend worden, niet in
  de scène.

### De kaart (`js/scenes/scene-diskette.js`)

Eén 3,5"-HD-diskette groot in beeld, front, op een koele donkere achtergrond,
licht van rechts. Ops in het huisregister: `gradient` voor het vlak van het
plastic en van de sluiter, `noise` voor de korrel, `poly` voor de afgeschuinde
hoek en voor het etiket, `ditherRamp` voor de schaduwkant van het papier,
`shadow`/`light` achteraan zodat alles in zijn eigen ramp op- of afgaat. De
lint keurt de scène als elke andere.

Vaste palettoewijzing, ook vastgelegd in `art-stijlgids.md`:

- plastic uit de **nacht-ramp** — 59 romp en de randen die zakken, 60 → 61 als
  verloop over het vlak, 62 voor de rand die het licht vangt (era-diskettes
  waren blauw of zwart; blauw houdt het silhouet leesbaar op donker);
- de sluiter uit de **steen-ramp** — 48 gleuf en duimnok, 49 bed, 51 → 52
  blad, 53 hooglicht rechts;
- het etiket uit de **papier-ramp** — 35 rand, 38 blad, 37/36 als schaduwkant
  links — met de titelregel in inkt 41 en haar nummering eronder in 40;
- de achtergrond koel en neutraal (49 → 48), zodat niets met het blauw
  concurreert.

De maat is 130 × 112 px en dat is met opzet **niet** vierkant: het canvas staat
in de verhouding van mode 13h (320 × 200 op 4:3), dus een pixel is twintig
procent hoger dan breed. De eerste versie was 130 × 130 en las op het scherm
als een te hoge kaart. 90 × 94 mm echt formaat komt uit op 130 × 112 px in de
buffer.

Het etiket ligt drie pixels scheef over honderd. De engine
(`tekenDisketteEtiket`) zet de twee handschriftregels met dezelfde helling mee
via de `versch`-haak die `tekenHandschrift` al had; horizontale regels op een
schuin blad lezen als een sticker, niet als een hand. Twee regels: **"7 little
goats"** zoals de docent vroeg, en eronder **"hfst. 1 — 7"** — haar eigen
nummering uit het notitieboek. Die tweede regel doet werk: ze schreef het
etiket vóórdat het spel af was, en pas nu klopt wat erop staat.

### De flow (`js/logic/world.js`, `js/engine.js`)

`world.startDiskette(toestand)` komt tussen `startOordeel` en `startEpiloog`:
zet `modus = "diskette"`, geeft de drive-regels + het onderschrift terug en de
effecten `["diskette", "voortgang:opgeslagen"]`. De engine vangt de tag op in
`verwerkEffecten` en toont de kaart in twee beats:

1. **wegschrijven** — een amberband onder het beeld met wat de drive afdrukt,
   in de gedrukte 8×8-font, met een knipperende blokcursor. Kaal DOS, want dat
   is wat een machine uit 1993 zegt: `C:\GOATS> copy *.java a:`, dan
   `12 bestand(en) gekopieerd naar A:`, dan `wegschrijven klaar.  A: 1.44 MB`.
   Twaalf is geen rond getal maar het echte aantal `.java`-bestanden in
   `seven-little-goats/src/`.
2. **de diskette eruit** — hetzelfde beeld met een papieren onderschrift in de
   plaatsing `onder`, zoals de openingsbeelden: "Je klikt de diskette uit de
   drive. Het etiket schreef ze jaren geleden al."

Enter (of een schermtik, want alles loopt via `opAdvance`) gaat van beat 0 naar
beat 1 en van beat 1 naar de epiloog. Geluid: de `compileer`-cue bij het
wegschrijven — de enige machine-cue in huis — en `doos` bij het uitklikken. Er
komt geen bed onder: het eindbed lost bij het oordeel eenmalig op en de stilte
hoort tot de epiloog te duren.

**De beat-teller staat niet in de save.** `disketteStap` is een
engine-variabele; de staat draagt alleen `modus: "diskette"`. Wie middenin
herlaadt, krijgt de beat opnieuw van voren en loopt van daaruit gewoon verder —
precies zoals de sim-substaat het al deed. Zo blijft de staat plat en hoefde de
migratielijst niet aangeraakt te worden.

### Het proza

Drie plaatsen droegen de oude fictie; alle drie herschreven.

**De epiloog** (`strings.epiloog.alineas`). Voor:

> De broncode ligt op zolder — neem ze mee. Ze staat in `seven-little-goats/`.
> Open ze in IntelliJ, lees ze, draai ze zelf. Wat je in de terminal
> herstelde, is nu gewoon Java in jouw handen.

Na:

> De diskette gaat mee. Wat erop staat, staat ook in `seven-little-goats/`.
> Open het in IntelliJ, lees het, draai het zelf. Wat je in de terminal
> herstelde, is nu gewoon Java in jouw handen.

De alinea erboven eindigde op "Alleen het scherm is nu uit" en zegt nu "Het
scherm is nu uit en de drive staat leeg" — het beeld dat je net gezien hebt,
één zin later bevestigd.

**De broncode-doos** (`strings.dozen.broncodeDicht`). Voor:

> De tape zit er nog helemaal op, en dat laat je zo. Deze doos is voor het
> einde, als haar spel weer draait.

Na:

> De tape zit er nog helemaal op, en dat laat je zo. Hierin zit haar werk van
> toen: uitdraaien, schetsen, haar eigen diskettes van de versie die stukging.
> Wat af moet raken, raakt niet af in een doos.

De onderzoek-tekst van dezelfde doos (`strings.scenes["zolder-midden"].
broncode`) verloor haar slotzin "Ze heeft die doos dichtgemaakt met de
bedoeling dat iemand hem later zou openen" en zegt nu "Ze heeft die doos
dichtgemaakt en dichtgelaten". Het label "BRONCODE — pas op het einde" blijft
staan: dat is iets wat ze *deed*, en het leest nu als "spit niet in mijn oude
pogingen tot je klaar bent", wat de lineariteit van WP 47/48b eerder steunt dan
tegenspreekt. En `dozen.allesGevonden` verwees de speler nog "op het einde, in
de broncode-doos"; die halve zin is weg.

### De menutitels (bijvangst)

`js/pc/pc.js` zet in het menu `def.titel || def.id`. Alleen editor-puzzels
droegen een `titel`, dus de terminalpuzzels stonden er met hun interne sleutel
in. Alle vijftien terminalpuzzels (levels 1–7 plus de zeven van de proefdruk
`level0`) hebben er nu een, in `strings.js` naast de bestaande
`repairTitel`/`writeTitel` en met dezelfde vorm: **`<onderwerp> — <wat je
doet>`**, met per soort dezelfde opdracht:

- `parsons` → "leg de stroken op volgorde"
- `trace` → "wat drukt ze af?"
- `vindfout` → "vind de fout"
- `verklaar` → "zeg het in één zin"
- `patroonkaart` → "welke kaart?"

Het onderwerp is wat er op het scherm staat, nooit het antwoord: "de poort —
vind de fout", "de gevechtslus — vind de fout", "de cascade — wat drukt ze
af?". Voor `l5-patroonkaart` werd "de somlus" geschrapt en "de schadelus"
gekozen: "som" ís daar het antwoord (de totaliseer-kaart). Langste titel is 43
tekens, tegen 42 voor de langste editor-titel die er al stond.

## Beslissingen

- **De doos blijft dicht, voorgoed.** Ze gaat in geen enkel pad open, dus het
  alternatief (haar op het einde laten opengaan met de diskette erin) zou een
  nieuw interactiepad vragen voor een voorwerp dat niets meer te geven heeft.
  Ze staat er nu als wat ze is: haar materiaal van toen, dichtgeplakt door
  iemand die wist dat ze het niet zou afmaken. Dat versterkt WP 45.
- **De diskette lag al in de drive, geëtiketteerd.** Alternatief was een blanco
  diskette die de speler zelf beschrijft, maar de docent vroeg expliciet om
  haar handschrift. Dat kan alleen als zij het etiket schreef — vooruit, voor
  een spel dat toen nog niet bestond. Dat is hetzelfde gebaar als de
  genummerde hoofdstukken en de dichtgeplakte doos, en het verklaart niets.
- **Twee beats op één beeld, niet twee beelden.** Het wegschrijven hoort bij de
  machine en de diskette bij de hand; ze in twee scènes splitsen zou een tweede
  tekening vragen voor drie seconden beeld. De band en het onderschrift staan
  allebei onderaan, dus de kaart springt niet tussen de beats.
- **Geen nieuwe geluidscue.** `compileer` en `doos` dragen de twee momenten;
  het geluidsregister uitbreiden voor twee seconden beeld is niet in verhouding
  (zie het register in `engine-architectuur.md`).
- **`disketteStap` blijft uit de save.** Zie hierboven: platte staat, geen
  migratie, en een reload die opnieuw begint is hier de juiste uitkomst.
- **Deel 1 van de walkthrough verklapt het beeld niet.** Wat er wél moest
  gebeuren: de zin "De grote doos in het midden met "BRONCODE" erop telt
  trouwens pas op het einde; laat die nog even dicht" was fout geworden en
  belooft nu niets meer. De diskette zelf staat alleen in deel 2, achter het
  zegel, in een eigen sectie — deel 1 houdt zijn spoilervrije stem.
- **De maat van de kaart volgt de pixelverhouding, niet de rekensom van de
  stijlgids.** 1 px ≈ 5 cm geldt voor de kamers; een inzetkader staat daar
  buiten. Dat staat nu ook zo in de scène en in de stijlgids.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` → **450/450** groen (441 vóór dit pakket; negen
  nieuwe: vijf in `test-world-hub.mjs` over de diskette-keten, de drive-regels,
  het etiket, de epiloog en de doos, en vier in het nieuwe
  `test-puzzeltitels.mjs`).
- `node tools/lint-scene.mjs` → alle scènes in orde, inclusief `scene-diskette`.
- `node tools/check-assets.mjs` → geen drift, 9 editor-modellen byte-getrouw.
- `node tools/check-walkthrough.mjs` → 277 citaten en koppen, 0 afwijkingen.
- `node tools/check-docpaden.mjs` → 0 dood in een contractdocument.
- Smokes: `smoke-sim` **19/19** (was 13 — zes controles erbij voor de beat, de
  pixelproef en de reload), `smoke-pc` **44/44** (was 42 — twee erbij voor de
  menutitels), `smoke-browser` **46/46** ongewijzigd, `smoke-full-playthrough`
  **105/105** met de twee extra Enters in de eindketen. `smoke-touch` draait in
  deze omgeving niet: de WebKit-build van Playwright staat er niet.

De twee PDF's zijn herbouwd (pandoc 3.10, typst 0.15.0, Liberation Mono als
tweede schakel van de fallback-ketting): `deel1-hints.pdf` 150 889 bytes op 8
pagina's, `deel2-oplossingen.pdf` 190 735 bytes op 13 pagina's. Beide bronnen
wijzigden inhoudelijk, dus geen van beide is een datum-only herbouw. Deel 2
krimpt van 214 KB naar 190 KB bij gelijk paginatal; nagemeten aan de
ingebedde fonts is dat een verschil in font-subsetting van de bouwomgeving
(dezelfde typst-versie, dezelfde Liberation Mono, andere subset-hashes voor de
cursieve snede), niet in de bladspiegel.

Screenshots in `test-results/`: `wp48c-diskette.png` (de kaart, beat 0),
`wp48c-epiloog.png`, `wp48c-menu-titels.png` (het pc-menu met de nieuwe
terminaltitels), plus `wp48c-full-diskette.png` uit de doorlopende playthrough.
