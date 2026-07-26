# 37 — Geluid hoorbaar en volledig

Werkpakket 37 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). Doel: het geluid dat er al was,
komt er ook uit — luid genoeg, hoog genoeg, en bij élke speler.

## Opdracht

Uit het goedgekeurde programma, WP 37:

> Master gain 0.16 → richtwaarde 0.3-0.35 met herbalancering per cue; foley
> en drones minstens een octaaf omhoog uit de sub-bas. De `doos`-cue afvuren
> bij het openen van een fragmentdoos. Unlock bij élke gebruikersactie:
> canvas-click, D-pad-pointerdown, form-submit; guard tegen
> oscillator-opbouw vóór unlock. Voetstapcadans 4.0 Hz. test-geluid:
> asserties op master-volumebereik en minimale cue-pitch;
> docs/engine-architectuur.md:243 bijwerken. De luistertest op speakers
> blijft een expliciet open punt voor Lars.

De klacht van Lars waar het pakket uit voortkomt: *"the sounds that do not
play or are too quiet"*. In deze container is er geen speaker, dus is er niet
geluisterd; wat hieronder staat zijn de mechanische oorzaken, elk apart
nagemeten in de code en in een browser.

Het ontwerp van WP I (`workflow/25-geluid.md`) blijft staan: twee-operator-FM
in OPL2-stijl, zes stemmen, vier bedden, tien cues, de vooruitkijkende
scheduler. Er is hertoonzet en herbalanceerd, niet heropgezet.

## Aanpak

### Het niveau

De meesterversterking ging van 0,16 naar 0,30, en de stemgains zijn tegelijk
herverdeeld — anders is harder zetten alleen maar dichter bij de klipgrens
komen. De bedstemmen gingen omláág (er klinken er tot drie tegelijk), de
foleystemmen omhoog (die klinken één voor één en duren een tiende seconde).

Stemgains oud → nieuw: koud 0,55 → 0,50; bas 0,70 → 0,50; warm 0,50 → 0,45;
blip 0,45 → 0,40; hout 0,60 → 0,70; karton 0,50 → 0,55.

Netto verschil per stem, ten opzichte van het oude niveau (stemgain maal
meestergain, in dB): voetstap +6,8; karton +6,3; bas +2,5; koud +4,6; warm
+4,6; blip +4,4. De foley wint dus het meest, en dat was de klacht.

Het ergste geval, uitgerekend en als test vastgelegd:

    bed     drie tegelijk klinkende noten (de zolder op t≈7,2:
            drone 45 + kwint 52 in de bas-stem, plus 72 koud)    1,50
    foley   één voetstap (hout)                                  0,70
    foley   één kartontik erbovenop (doos openen tijdens lopen)  0,55
                                                                 ----
                                                                 2,75

2,75 × 0,30 = 0,825, dus 1,7 dB onder de klipgrens — en dat is dan nog de
coherente som, waarin álle zes de oscillatoren tegelijk op hun top staan. Bij
ongerelateerde frequenties is dat hooguit een sample lang waar.
Vervalstaarten tellen nauwelijks mee: ze zakken exponentieel en staan na een
derde van hun verval al onder een tiende van hun gain. Het scenario waarin
doos- en pagina-cue op elkaar stapelden, bestaat bovendien niet meer — zie
"De doos" hieronder.

`test-geluid.mjs` rekent deze som nu zelf na uit de tabellen, dus een
toekomstige noot erbij of een gain omhoog laat de test vallen in plaats van
stilletjes te klippen.

### Het register

Alle grondtonen, oud → nieuw (midi, met de frequentie erbij):

    stap        38 → 50    73 →  147 Hz
    stap-2      41 → 53    87 →  175 Hz
    deur     45,40 → 57,52  110,82 → 220,165 Hz
    doos  50,45,43 → 60,55,52  147,110,98 → 262,196,165 Hz
    zolderdrone 33 → 45    55 →  110 Hz   (en de kwint 40 → 52)
    pc-pedaal   36 → 48    65 →  131 Hz

Ongewijzigd, want al hoog genoeg: `pagina` (72, 67), `toets` (93),
`compileer`, `ok`, `fout`, `boot`, en alle melodienoten van de vier bedden
(69 en hoger), plus de basnoten van `titel` en `einde` (45 = 110 Hz, precies
op de nieuwe bodem).

Twee bodems, en het verschil is opzet:

- **cues niet onder midi 48** (131 Hz). Het karakter van de foley zit in de
  niet-harmonische ratio van de stem, niet in de grondtoon: een kartontik op
  165 Hz klinkt nog altijd als karton, en een houttik op 147 Hz nog altijd
  als een plank. Een tik van 73 Hz klinkt op een laptopspeaker niet zacht —
  hij klinkt niet.
- **bedden mogen tot midi 45** (110 Hz), op twee voorwaarden: de noot valt in
  de bas-stem (onder midi 55) en duurt minstens twee seconden. Dat is de
  gedocumenteerde uitzondering uit de opdracht: een drone houdt aan en wordt
  daardoor ook op een kleine speaker gevoeld. Een melodienoot mag daar niet
  komen, want die zou wegvallen en een gat in het bed achterlaten. De test
  controleert beide voorwaarden, niet alleen de toonhoogte.

De muzikale bedoeling overleeft de verhuizing: de zolder houdt dezelfde A met
dezelfde open kwint erboven, de pc dezelfde C onder dezelfde arpeggio. De
registertest (notendichtheid zolder < pc) is onaangeroerd groen — er is geen
noot bij of af gegaan, alleen een octaaf onder vandaan.

Eén bevinding uit de kickoff blijkt bij het nameten niet te kloppen en wordt
hier rechtgezet: *"noten onder midi 55 gaan bovendien naar de bas-stem met de
traagste attack"* geldt alleen voor **bedden**. Die splitsing zit in
`planVooruit` (`sound.js`), niet in `speel`; een cue gebruikt altijd de stem
uit haar eigen tabelregel. De voetstap ging dus nooit door de bas-stem. Het
hoorbaarheidsprobleem van de foley was volledig de grondtoon.

### De doos

De `doos`-cue stond sinds WP I in de tabel en werd nergens afgevuurd — de
enige cue in het spel die alleen op papier bestond. Bij het nazoeken van het
pad bleek er méér mis:

`world.ontgrendelFragment` zette `geluid:pagina` in haar effectenlijst, de
engine speelde bij `fragment-gevonden` nóg eens `pagina`, en `opADeSpread`
speelde hem een derde keer. Drie identieke kartontikken op dezelfde
audioklok-tijd is geen bladzijde maar één harde klik op drie keer de
amplitude.

Nu zegt de logica wat er te horen is, en de renderlaag speelt niets meer uit
zichzelf:

- **notitieboek** (westhoek, hoofdstuk 1) → `geluid:pagina`. Eén blad.
- **fragmentdoos** (hoofdstuk 2 t/m 7) → `geluid:doos`, en 0,35 s later
  `geluid:pagina@0.35`. Karton dat meegeeft, en dán papier.
- **spread doorbladeren** → `pagina` per omgeslagen blad, ongewijzigd in
  `spreadBlader`.

Die vertraging is nieuw gereedschap: `AL.sound.speel(naam, vertraging)` en de
effect-vorm `geluid:<cue>@<seconden>`. Twee foley-cues op hetzelfde moment
zijn samen niet twee geluiden maar één modderige — en de doos vertelt zonder
die pauze niet dat er eerst een deksel opengaat. Vier regels in de
effect-afhandeling; het alternatief (de engine laten weten welke cues elkaar
in de weg zitten) legt die kennis op de verkeerde plaats.

**Beslissing over de niet-fragmentdozen.** De kist en de dozenstapels in de
westhoek (WP 33) leveren niets op, maar ze gáán wel open: de speler tilt een
deksel op. Ze dragen nu dezelfde `geluid:doos` als een fragmentdoos. Dat er
niets in zit staat in de tekst en hoeft niet ook nog eens in het geluid te
staan — een tweede, doffere "lege doos"-cue zou het spel vertellen wat de
prose al zegt.

### De ontgrendeling

De unlock hing aan `keydown` en aan niets anders. Wie met de muis begon
hoorde niets tot hij toevallig iets typte; wie op een telefoon speelde hoorde
de hele sessie niets, want die typt in een `<input>` dat vroeger niet eens
aan de keydown-handler toekwam.

Vier oppervlakken nu, en de eerste twee dekken alles wat een browser kent:

- `keydown` op het venster (`js/input.js`), bewust vóór de
  tekstveld-uitzondering: het eerste teken dat een telefoonspeler in de
  commandobalk typt, is net zo goed zijn eerste gebruikersactie;
- `pointerdown` op het venster, plus `touchstart`, in de capture-fase
  (`js/input.js`) — muis, aanraking en pen;
- het D-pad (`pointerdown`) en de commandobalk (`submit`) van `js/touch.js`;
- een tik of klik op het canvas (`js/touch.js`).

De laatste twee zijn strikt genomen dubbelop, en staan er toch: die handlers
roepen `preventDefault` aan, en een webview zonder `pointerdown` valt anders
op niets terug. `unlock()` is idempotent, dus de tweede aanroep kost niets.

**Belangrijk:** `js/touch.js` keert meteen terug op een toestel zónder
aanraakscherm. De click-handler op het canvas bestaat op een desktop dus
helemaal niet — de muisklik van een desktopspeler kwam nergens aan. Dat is
precies waarom de vensterbrede `pointerdown` in `input.js` moest, en niet een
extra klikhandler in `touch.js`.

### Het lek vóór de ontgrendeling

Vóór de eerste gebruikersactie deed de laag wél iets, en dat was het
probleem. `startTitel` vraagt bij het opstarten om het titelbed; dat werd
tegen een opgeschorte context gepland. Een opgeschorte context laat zijn klok
stilstaan, dus die oscillatoren blijven in de graaf hangen tot de eerste
`resume` en barsten dan in één keer los.

Nu doen `speel()` en `muziek()` vóór de ontgrendeling niets: er wordt geen
`AudioContext` gemaakt en geen oscillator gebouwd. `muziek()` onthoudt de
naam ook niet, zodat `huidigBed()` null blijft en de engine het bed na de
ontgrendeling gewoon opnieuw aanbiedt.

Wélk bed dat is, weet de geluidslaag niet. De engine hangt er daarom een haak
aan — `AL.sound.opOntgrendeld(startBedVoorStand)`, de functie die er sinds
WP I al is en die het antwoord op precies deze vraag op één plek houdt. De
titelmuziek bij het opstarten is dus een lege aanroep, en het bed begint bij
de eerste toets, klik of tik. Op de titelkaart staat al "druk Enter", dus de
speler krijgt zijn aanwijzing; wie klikt in plaats van typt, hoort het nu
evengoed.

`debug()` kreeg er twee getallen bij: `ontgrendeld` en `nodes` (hoeveel
oscillatoren er ooit gebouwd zijn). Zonder dat laatste is "er groeit niets
vóór de ontgrendeling" in een browser niet te controleren.

### De voetstap

De oude regel telde logische tikken: elke vierde van de vijftien per seconde,
dus 3,75 stappen per seconde tegen een loopanimatie die er 4,0 laat zien (8
fps, vier frames, twee steunfases). Een kwart stap verschil per seconde — na
vier seconden lopen valt het geluid op de doorzwaai in plaats van op de voet.

De stap hangt nu aan het animatieframe zelf, dezelfde teller waarmee
`tekenActor` het frame kiest: bij een nieuw frame met een even nummer (frame
0 en 2 zijn de steunfases, "beide voeten op de vloer") klinkt er een stap.
Dat is per constructie in de pas, ook als de loopsnelheid of de tikfrequentie
ooit verandert. De fps komt uit de sprite-definitie, niet uit een tweede 8 in
de engine.

De browsertest leest bij elke stap `debugState.loopFrame` uit en eist dat het
even is. Gemeten over twee seconden lopen: acht stappen, nul op een
doorzwaaiframe, en de twee varianten netjes om en om.

## Beslissingen

- **Geen per-cue gain-veld.** De opdracht noemde "per-voice/cue
  rebalancing"; het is bij de stemmen gebleven. Het enige argument voor een
  cue-gain was `toets`, en die cue vuurt bij het laden van een puzzel en bij
  een hint — niet per toetsaanslag, zoals de naam suggereert. Een extra veld
  in het schema zonder gebruiker is dood gewicht.
- **`geluid:<cue>@<seconden>` erbij in plaats van een tweede afvuurmoment.**
  Zie "De doos". De vertraging is data in de effectenlijst, waar de rest van
  de beslissing ook staat.
- **De cue-vertraging is één keer in gebruik.** Bewust: hij bestaat voor het
  geval "twee foley-cues op hetzelfde moment", en dat geval is er precies
  één.
- **De bodem voor bedden ligt op 45, niet op 48.** Met de gedocumenteerde
  voorwaarden (bas-stem, minstens twee seconden). Een drone op 110 Hz is op
  een laptopspeaker nog te vólgen, en de drie bedden die daar staan (`titel`,
  `ambient-zolder`, `einde`) zouden hun grondtoon anders in het middenregister
  moeten leggen, waar hij de melodie in de weg zit.
- **De niet-fragmentdozen klinken hetzelfde.** Zie hierboven.
- **`smoke-browser` klikt na de reload op het canvas.** Dat moest: een
  herladen tabblad is voor de browser een verse pagina zonder
  gebruikersactie, dus het bed start pas na een gebaar. Dat het een múisklik
  is en geen toets, maakt de regel meteen tot een regressietest voor het
  hoofdgebrek.

## QC

Alles gedraaid, alles groen.

- `node --test test/test-*.mjs` — **400/400** (was 391; negen nieuwe tests,
  twee herschreven)
- `node tools/lint-scene.mjs` — alle scènes in orde
- `node tools/check-assets.mjs` — geen drift, negen editor-modellen
  byte-getrouw
- `test/smoke-browser.mjs` — **38/38**
- `test/smoke-full-playthrough.mjs` — **97/97**
- `test/smoke-walk.mjs` — **25/25**
- `test/smoke-geluid.mjs` (nieuw) — **17/17**

De nieuwe headless tests: het volumevenster (0,25–0,40), de klipsom uit de
tabellen, de cue-bodem van midi 48, de beddenbodem van 45 mét haar twee
voorwaarden, de doos-cue op het fragmentdoos-pad (en géén doos-cue op het
notitieboek-pad), de kist en de dozenstapels die nu `geluid:doos` dragen, en
in `test-geluid-synthese.mjs`: niets gebouwd vóór de ontgrendeling, en een
idempotente `unlock` die de haak precies één keer roept.

De nagemaakte AudioContext van `test-geluid-synthese.mjs` start nu
`suspended` in plaats van `running` — dat is wat een browser geeft, en zonder
die verandering was de hele vergrendelde toestand niet te testen. De
bestaande tests in dat bestand draaien daarom ná een expliciete `unlock()`.
De regels van WP I die zij bewaken — geen exponentiële ramp naar nul, elke
oscillator gestopt, een gemiste noot wordt niet ingehaald — zijn onaangeroerd
groen.

`test/smoke-geluid.mjs` is nieuw en staat apart van `smoke-browser`, om één
reden: hij moet een pagina keuren waarop nog géén toets is aangeraakt, en
`smoke-browser` drukt in zijn tweede stap al Enter.

## Wat open blijft

**Hoe het geluid klínkt, is nog altijd niet beoordeeld.** In deze container
is er geen geluidsuitgang. Alles hierboven is nagemeten in de code en in een
browser: niveaus zijn uitgerekend, toonhoogtes zijn data, de ontgrendeling is
een contextstaat, de cadans is een frame-nummer. Of 0,30 op een laptopspeaker
het juiste niveau is en of de zolderdrone op 110 Hz nog steeds koud klinkt,
is een luistertest, en die blijft voor Lars.

`smoke-touch` blijft ongedraaid: die test vraagt WebKit, en dat ontbreekt
hier. De aanraakschermkant van dit pakket is wél gedekt — `smoke-geluid`
draait zijn tweede helft in een Chromium-context met `hasTouch`, dus de
D-pad-balk van `js/touch.js` is aanwezig en de tik op het canvas is een echte
touch-gebeurtenis.
