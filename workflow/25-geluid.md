# 25 — Geluid

Werkpakket I van het opwaarderingsprogramma (zie
`workflow/15-opwaardering-kickoff.md`). Doel: de stilte weg.

## Opdracht

Uit het goedgekeurde plan, WP I:

> Een kleine procedurele muzieklaag in WebAudio, in OPL-stijl (FM-achtige
> twee-operator-stemmen, geen samples): een titelthema, een trage
> zolder-ambience-loop, een warmere laag aan de pc, een eindcue. Plus foley:
> voetstappen op hout, een bladzijde, een doos die opengaat, toetsaanslagen.
> `ambient-zolder` bestaat al als cue maar wordt nergens afgevuurd — dat wordt
> rechtgezet.

En de toon: *"mineur, traag, veel stilte tussen de frasen. De zolder hoort niet
gezellig te klinken. Het contrast dat overblijft is de pc — het enige warme ding
in huis."*

## Aanpak

### FM, en waarom precies twee operatoren

Er stonden negen cues in, allemaal blokgolf-bliepjes: één oscillator, één
envelope. Dat is de PC-speaker van 1985, niet de geluidskaart van 1990. De
periode die dit spel naspeelt klonk uit een AdLib of een Sound Blaster, en die
deden FM — een OPL2 had twee operatoren per stem.

Dat is in WebAudio exact na te maken, en met dezelfde drie knoppen als toen:
`ratio` (heel getal is harmonisch en dus orgel of bas; niet-heel is klok, bel of
tik), `index` (hoe diep de modulator de carrier verbuigt) en een eigen envelope
op die index — een klank die begint als een bel en eindigt als een fluit, is één
envelope op de modulatiediepte.

Zes operatoren zou kunnen en is níet gedaan: dat klinkt als een DX7, en dus als
1983 of als 1995, niet als de periode ertussen.

De niet-harmonische ratio's doen het meeste werk voor de foley. Een voetstap is
geen toon; met ratio 1,41 (ongeveer wortel twee) op een driehoeksgolf en een
verval van vijftig milliseconde is het een tik op een plank. Karton is dezelfde
truc op 1,73, lager en doffer.

### Zes stemmen, vier bedden, tien cues

Stemmen: `koud` (hol, orgelachtig, voor de zolder en de titel), `bas` (de
grondtoon, ratio 0,5), `warm` (de pc), `blip` (bevestigingen), `hout` en
`karton` (foley).

Bedden: `titel`, `ambient-zolder`, `pc`, `einde`. Cues: `pagina`, `deur`,
`toets`, `stap`, `stap-2`, `doos`, `compileer`, `ok`, `fout`, `boot`.

De noten staan als midi-getallen in de data, niet als hertz. Een toonhoogte
opschrijven als 69 is te lezen; 440 is dat alleen voor wie het uit zijn hoofd
kent.

### De scheduler

Noten worden vooruit geplaatst op de audioklok, niet afgevuurd op de beeldklok:
WebAudio timet exact, een `requestAnimationFrame`-lus niet. De engine tikt
`AL.sound.tik()` aan in zijn bestaande logische tik van 15 Hz; die kijkt of de
volgende noten binnen het vooruitkijkvenster van 0,35 s vallen en plaatst ze
dan.

## Beslissingen

### `ambient-zolder` wordt gepromoveerd, niet afgevuurd

De opdracht zegt "bestaat al als cue maar wordt nergens afgevuurd — dat wordt
rechtgezet". Letterlijk uitvoeren zou betekenen: op de juiste plek
`speel("ambient-zolder")` aanroepen. Maar die cue was één blokgolf van vier
tiende seconde op 110 Hz. Dat is een blip, geen sfeer, en afvuren zou het gat
niet dichten — het zou er een pieptoon in leggen.

De naam is dus gebleven en de inhoud is vervangen: `ambient-zolder` is nu het
zolderbed van 19,2 seconden — een lage drone met een open kwint, en vier losse
noten erboven. De effect-tag `geluid:ambient-zolder` werkt nog, en de engine
start het bed nu ook rechtstreeks bij het betreden van de zolder.

De tag-woordenlijst in `engine-architectuur.md` is mee bijgewerkt, en er staat
een test op die de doc en de code aan elkaar houdt — dezelfde soort test die de
vier oordeelteksten aan `save-en-hints.md` houdt.

### De meestergain bestaat vanwege het vooruitkijken

"Geluid uit maakt het volledig stil" is de QC-eis, en met een vooruitkijkende
scheduler is die niet te halen door gewoon te stoppen met plannen: op het moment
dat de speler het typt, staan er al noten in de toekomst gepland. Die kun je
niet intrekken — je kunt ze alleen naar nul versterken.

Vandaar één GainNode waar álles op uitkomt. `zetAan(false)` zet die op nul én
vergeet het actieve bed, zodat er niets blijft doorlopen waar niemand naar
luistert.

### Eén plek beslist welk bed erbij hoort

Dat leverde meteen een echte fout op. "Geluid uit" vergeet het bed — dat moet —
maar "geluid aan" zette alleen de meestergain terug. Op de zolder bleef het
daarna dus stil tot je van kamer wisselde.

`startBedVoorStand()` in de engine beslist nu op één plek welk bed bij de
huidige stand hoort, en wordt aangeroepen op de drie momenten waarop dat
antwoord nodig is: bij een moduswissel, na een reload, en als het geluid weer
aangaat. De rooksmaaktest controleert dat laatste expliciet.

### Een gemiste noot wordt niet ingehaald

Dit is de fout die de test vond, niet ik. De keuring "een eenmalig bed houdt op
en herhaalt niet" schoof de nagemaakte audioklok voorbij het einde van de omloop
en tikte één keer — en zag dat het hele bed in één klap geplaatst werd.

Dat is niet theoretisch. Schakelt de speler naar een ander tabblad, dan bevriest
de beeldklok en dus de tik, terwijl de audioklok doorloopt. Zonder
tegenmaatregel worden bij terugkomst alle gemiste noten in één keer geplaatst,
op een tijd in het verleden — wat WebAudio uitlegt als "nu". Dat is een cluster,
geen muziek.

Een noot waarvan het moment voorbij is, wordt nu overgeslagen.

### De nagemaakte AudioContext

`test/test-geluid-synthese.mjs` zet een AudioContext neer die elke node en elke
parameterautomatisering opschrijft. Dat is meer werk dan een browsertest, en het
levert drie dingen op die een browser niet kan geven:

- **Is het écht FM?** Twee oscillatoren naast elkaar klinken ook als geluid. De
  test controleert dat er precies één node op een `frequency`-param uitkomt, dat
  die node een gain is (de modulatiediepte) en dat de bron daarvan een
  oscillator is.
- **De exponentiële voetangel.** Een `exponentialRampToValueAtTime` naar exact
  nul is per specificatie ongeldig. Chromium slikt het; andere engines gooien.
  Dat is dus precies het soort fout die je in een headless Chromium-test nooit
  ziet — en die alleen een speler met een andere browser tegenkomt.
- **Lekken.** Elke oscillator moet ook gestopt worden. Bij een bed dat elke
  negentien seconden rondloopt is een vergeten `stop()` een lek dat pas na een
  half uur spelen hoorbaar wordt.

### Het register staat als test in de suite

"De zolder hoort niet gezellig te klinken" is een toonafspraak, en die kun je
meten: notendichtheid in noten per seconde. De test eist dat de zolder leger is
dan de pc. Zodra iemand het zolderbed vol gaat schrijven, valt die test om.

### Wat níét is gebeurd

- **Geen samples, geen bestanden, geen dependencies.** Harde projectregel, en de
  FM-synthese heeft ze ook niet nodig.
- **Geen muziek onder de epiloog.** Het eindbed is eenmalig: het lost op en
  houdt op. Daarna is het stil, en dat is het punt.
- **De pc-overlay heeft geen eigen foley.** Toetsaanslagen zitten al op de
  `toets`-cue via de effect-tags; de rest van het pc-geluid hoort bij **WP J**,
  waar het paneel zelf wordt aangepakt.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/sound.js` | herschreven: FM-stemmen, cue- en bedtabellen, vooruitkijkende scheduler, meestergain, `muziek()`/`tik()`/`huidigBed()`/`debug()` |
| `js/engine.js` | `startBedVoorStand()`; bedden op titel, zolder, pc en eindkaart; `AL.sound.tik()` in de tik; voetstappen op de tel van de loopcyclus |
| `docs/engine-architectuur.md` | §Geluid erbij; cue-woordenlijst bijgewerkt; de overname-tabel klopt weer |
| `test/test-geluid.mjs` | nieuw, veertien keuringen op de data en op "uit is uit" |
| `test/test-geluid-synthese.mjs` | nieuw, twaalf keuringen op de audiograaf via een nagemaakte AudioContext |
| `test/smoke-browser.mjs` | zeven controles erbij: draait het bed, staat de gain open, en zet "geluid uit" hem echt op nul |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **322 tests, 322 groen** (296 bij aanvang; zesentwintig nieuwe).
- `node tools/lint-scene.mjs` — schoon op tien scènes plus de schetsenset.
- `node tools/check-assets.mjs` — geen drift.
- De zes rooksmaaktesten via `file://`: `smoke-browser` **28/28** (zeven
  geluidscontroles erbij), `smoke-full-playthrough` 94/94, `smoke-levels-1-3`
  32/32, `smoke-levels-4-7` 48/48, `smoke-pc` 21/21, `smoke-sim` 13/13. Samen
  236 controles, geen JavaScript-fouten op de pagina.
- **Geen bestanden, geen dependencies:** `js/sound.js` is één bestand van
  ongeveer driehonderd regels en `package.json` is onaangeroerd.
- **Headless zonder `AudioContext` crasht niet:** eerste test in
  `test-geluid.mjs`, en de hele Node-suite draait in die staat.
- **"Geluid uit" maakt het volledig stil:** in de browser gecontroleerd aan de
  meestergain, die exact nul moet zijn en niet "bijna nul".
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.

Eén ding is *niet* geverifieerd en dat hoort hier te staan: hoe het klínkt. Er
is in deze container geen geluidsuitgang, dus wat gecontroleerd is, is de graaf
en de data — niet het oordeel van een oor. De toonhoogtes, de duren en de
dichtheden zijn met opzet gekozen en getest, maar de mix hoort door iemand met
speakers nagelopen te worden.

## Volgende

**WP J — de gesimuleerde pc.** Borland/Turbo-chrome, de bitmapfont in plaats van
Courier New, `CHECK_OK` groen en `CHECK_FAIL` rood, en de editor die naar boven
scrollt bij het openen.
