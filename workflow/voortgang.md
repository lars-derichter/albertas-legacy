# Voortgang — opwaardering van presentatie en verhaal

Dit is de levende checklist van het tweede programma op deze repo (zie
`workflow/15-opwaardering-kickoff.md` voor de opdracht, de beslissingen en het
volledige plan). Anders dan de genummerde entries, die chronologisch zijn en
blijven staan zoals ze geschreven zijn, verandert dít bestand mee met het werk.

**Werkt een sessie hier na een crash verder?** Lees dan in deze volgorde:

1. Dit bestand — waar staat het programma, wat is het volgende pakket. 2.
`workflow/15-opwaardering-kickoff.md`, §Beslissingen — waarom het zo is. 3.
Dezelfde entry, Bijlage B — het volledige plan met de QC-poort per pakket. 4.
`CLAUDE.md`, §Werkafspraken — hoe er gecommit en gelogd wordt.

Daarna: `node --test test/test-*.mjs` en `git log --oneline -5` om te zien of de
laatste commit compleet is.

## Conventies in dit bestand

- `- [x]` afgewerkt, `- [~]` in uitvoering, `- [ ]` nog niet begonnen.
- De commit-hash van een pakket wordt in de *volgende* commit ingevuld — bij
  het schrijven van dit bestand is de eigen hash nog niet bekend. Staat er
  "(nog in te vullen)" bij het laatst afgewerkte pakket, dan is dat normaal.
- Een pakket is pas `[x]` als zijn QC-poort geslaagd is. Niet eerder.

## Vertrekpunt

Gemeten op `claude/game-polish-improvements-rhlk70`, commit `7333f78`, met Node
v22.22.2:

- `node --test test/test-*.mjs` — 225 tests, **224 groen, 1 rood**
  (`test-sim-cross-check`, codering; wordt in WP A rechtgezet).
- Zes scènes, 173 draw-ops samen. Eén sprite van de zes wordt geblit.
  Nul overgangen. Negen geluidscues, geen muziek.

Entry 12 rapporteerde 229 tests; `node --test` telt subtests over Node-versies
heen anders. Er zijn geen testbestanden verdwenen. Vanaf hier is
**225** het referentiepunt.

## Bindende volgorde

- WP 0 eerst.
- WP A en B zijn fundering: al het tekenwerk erna gebeurt tegen het
  gecorrigeerde beeldkader en met de nieuwe primitieven.
- WP C vóór WP D en E: de tekst gaat vast vóór het beeld, want de QC-poort van
  het scènewerk is "elk zelfstandig naamwoord in de kamerbeschrijving moet
  aanwijsbaar zijn".

De pakketten F t/m J hebben onderling geen harde volgorde.

## De pakketten

### - [x] WP 0 — Logboek, checklist en werkafspraken

Entry: `workflow/15-opwaardering-kickoff.md` · commit: `29d2a2b`

- [x] Kickoff-entry met de prompts van Lars, de aanpak, de beslissingen en het
      bewijsmateriaal
- [x] Het goedgekeurde plan integraal als Bijlage B
- [x] Dit bestand als levende checklist
- [x] Werkafspraken in `CLAUDE.md`, §Working agreements
- [x] QC: markdown op 80 tekens, code onaangeroerd, tests onveranderd 224/225

### - [x] WP A — Fundering en opruiming

Entry: `workflow/16-fundering-en-opruiming.md` · commit: `36c40b9`

- [x] `berekenSchaal()` levert twee gehele factoren (`--schaal-x`,
      `--schaal-y`); beeldverhouding zo dicht bij 4:3 als past
- [x] CRT-overlay (scanlines + vignet), uitschakelbaar met `crt aan|uit`,
      bewaard in de save
- [x] Titelkaart en oordeelkaart leesbaar — bleek een **contrastfout**, geen
      z-orde-fout; opgelost met een donkere plaat en een papieren band
- [x] Spread-inhoud in twee kolommen; bladerhint en paginateller binnen het blad
- [x] Codering van de Java-prijs opgelost via het bouwrecept
      (`-encoding UTF-8` + `-Dstdout.encoding=UTF-8`), **niet** via `Main.java`
      — een `PrintStream` in de bron laat de cursusgrens-grep struikelen én lost
      de compileerkant niet op
- [x] Bouwpuin uit `index.html`, `js/engine.js`, `js/logic/strings.js`,
      `js/logic/world.js`, `js/scenes/scene-spread-template.js`
- [x] Vier dode string-sleutels weg (`dozen.leeg`, `pc.puzzelAlAf`,
      `hintPrefix`, `endgame.naarOordeel`)
- [x] Het "placeholder-level" in `levels.js` **blijft**: het is de fixture waar
      de headless tests op draaien; alleen het commentaar was misleidend
- [x] Hardgecodeerd macOS-pad uit de vijf `test/smoke-*.mjs` (nu `AL_SCRATCH`
      of `test-results/`)
- [x] QC: **225/225 groen**, `lint:scene` schoon, `check-assets` driftvrij,
      javac-poort schoon, zes rooksmaaktesten groen via `file://`

Doorgeschoven met adres: de sjabloonvlekken onder de spread-tekst → WP G; de
hardgerande lichtwiggen → WP B/E. `smoke-touch` kon hier niet draaien (geen
WebKit in deze container).

### - [x] WP B — Rendererkern

Entry: `workflow/17-rendererkern.md` · commit: `2ac044f`

- [x] Ramps in `js/palette.js`: `RAMPEN`, `rampVan`, `verduister`, `verhelder`
- [x] `gradient` — loopt over de échte tussenkleuren van een gedeelde ramp, met
      Bayer 4×4 op de overgangen
- [x] `ditherRamp` met vrije dichtheid 0–1
- [x] `shadow` (pixels omlaag in hun eigen ramp) — Engelse opnaam, zoals de
      zeven bestaande ops
- [x] `noise` (deterministische spikkels, seed hoort bij de scène)
- [x] Sprite-schaling via `opts.schaal`; ankerpunt blijft onderaan-midden
- [x] Voorgrondlaag: `overlays` `{ baselineY, ops }` wordt eindelijk getekend,
      vóór of ná de speler naargelang de diepte
- [x] Overgangen: `fade`, `dissolve`, `iris` in `gfx.overgang`; de engine
      gebruikt een **opkomst** bij een kamerwissel (zie entry voor waarom niet
      dicht-en-open)
- [x] `tools/lint-scene.mjs` kent de vier nieuwe ops
- [x] QC: 250/250 groen (25 nieuwe tests), `debugPalet` aan, zes
      rooksmaaktesten groen, `art-stijlgids.md` en `engine-architectuur.md` mee

Nog niet toegepast, met adres: sprite-schaling en de voorgrondlaag zijn
gereedschap zonder gebruiker tot **WP E** de kamers hertekent. Bewegende sfeer
(stof, flikkering) staat ook onder WP E — er is bewust geen slapende code voor
gemaakt.

### - [x] WP C — Verhaal, stem en de zolder die antwoordt

Entry: `workflow/18-verhaal-en-stem.md` · commit: `7d8be60`

- [x] Register kouder: intro, vier kamerbeschrijvingen, oordeel, epiloog,
      endgame. De kou zit in het contrast (de stoel lijkt net verlaten, het stof
      zegt van niet), niet in somberte
- [x] Duisternis met _Seven Little Goats_ als bron: de intro, de opengeslagen
      bladzijde (zeven kruisjes, zes doorgehaald) en de terminal vóór het booten
- [x] Achttien eigen `onderzoek`-teksten over de vier kamers; woordkoppeling in
      `ONDERZOEK_WOORDEN` (`js/logic/world.js`), tekst in `strings.js`
- [x] Parser: kale richtingen en afkortingen, voorzetsels, lidwoord-stripping,
      vier extra werkwoorden, `neem`/`pak` met een echt antwoord
- [x] Commandogeschiedenis op **F3**, niet pijl-omhoog — de pijltjes zijn het
      lopen, en F3 is precies wat de Sierra-parsers ervoor gebruikten
- [x] `AL.strings.intro` weer in gebruik; doublure `spreads.intro` weg; de
      achtergrond loopt nu in de stem van de verteller over de titelkaart
- [x] `docs/achtergrond.md`: verdwijning, zolder en register herschreven
      ("nooit een oorzaak" blijft staan)
- [x] `docs/save-en-hints.md` oordeelteksten gelijkgetrokken, **plus een test
      die die twee voortaan aan elkaar houdt**
- [x] QC: 259/259 groen, zes rooksmaaktesten groen, lint en check-assets schoon

De spreads zijn in dit pakket **niet** herschreven: hun tekst is puzzelinhoud en
hoort bij WP G, waar ook de bladzijden zelf hertekend worden. Het bladbudget
blijft daar gelden: hoogstens 24 gewrapte regels per pagina (17 tekens × 12
regels × 2 kolommen); de langste pagina nu is `l4` p1 met 22.

De walkthrough is nagekeken en bewust ongemoeid gelaten: geen enkel citaat erin
is onwaar geworden en alle genoemde commando's werken nog. **Open klusje:** de
nieuwe parser-tolerantie en F3 in `deel1-hints.md` vermelden, zodra `pandoc` en
`typst` beschikbaar zijn om beide PDF's mee te herbouwen — nu niet in deze
container.

### - [x] WP D — De opening

Entry: `workflow/19-de-opening.md` · commit: `f0c5c2d`

- [x] Drie getekende beelden: `opening-huis`, `opening-trap`, `opening-pc`, elk
      met een opkomst uit het zwart
- [x] Vijf beats op die drie beelden, zo gemaat dat geen onderschrift
      pagineert — anders bladert Enter door de tékst in plaats van de reeks
- [x] Onderschrift onderaan in plaats van een luik over het beeld
      (`maakVenster`-optie `plaatsing: "onder"`)
- [x] Overslaanbaar met Escape, met een leesbare hint op eigen plaat
- [x] **Geen extra save-veld nodig:** herladen komt via `hervat()` binnen en
      ziet de titelkaart niet; `herbegin` is een expliciete verse start en
      hoort de opening juist wél opnieuw te tonen
- [x] Route en stem kloppen sinds WP C; de `spread`-modus draagt alleen nog de
      zeven level-spreads
- [x] QC: 259/259, `lint:scene` schoon op negen scènes, `smoke-browser` 21/21
      (twee checks erbij), overige rooksmaaktesten groen

Twee lessen uit dit pakket staan nu in `art-stijlgids.md` en gelden voor WP E:
dither niet over een grote helderheidssprong (een fel accent domineert ook in de
minderheid), en licht is rond (een halo uit trapezia leest als een tunnel).

### - [x] WP E deel 1 — De vier kamers hertekend

Entry: `workflow/20-de-zolder-hertekend.md` · commit: `386d9e3`

- [x] Vier beloopbare kamers hertekend: gegradeerde wanden en vloeren, wijkend
      perspectief, één lichtbron met hooglicht en schaduw, outlines, korrel
- [x] Licht in plakken met aflopende dichtheid — de oude volvlakke wiggen waren
      precies wat als "onafgewerkte polygoon" las
- [x] Props uit de achtergrond naar geblitte sprites; de engine sorteert props
      en speler op voet-y. De pc toont eindelijk zijn `aan`-frame, dat sinds
      WP 6 bestond en nooit te zien is geweest
- [x] Nieuw veld `scene.sfeer`: stof dat écht zakt, deterministisch. De lint
      kent het en controleert grenzen, kleur en aantal
- [x] Elke kamer een voorgrondlaag waar de speler achterlangs loopt
- [x] Het beeld lost de prose in: elk zelfstandig naamwoord uit elke
      kamerbeschrijving is aanwijsbaar
- [x] 325 draw-ops over alle scènes, tegen 173 bij het vertrekpunt
- [x] QC: 259/259, lint schoon, check-assets driftvrij, zes rooksmaaktesten
      groen

Nog open, met adres: de speler wordt niet kleiner naar achter. De
sprite-schaling uit WP B ligt klaar, maar de loopstrook is 39 px hoog — daar
valt geen zinnige diepte op te schalen zonder de walkboxes te herzien. Hoort bij
**WP H**.

### - [x] WP E deel 2 — De kaarten, en licht dat eindelijk licht is

Entry: `workflow/21-de-kaarten-en-het-licht.md` · commit: `cbdbf2b`

Afgesplitst omdat deel 1 al groot was en `CLAUDE.md` vraagt een half pakket te
splitsen in plaats van het half te committen. Een logo is bovendien letterwerk
en geen kamer: ander soort werk.

- [x] `titelkaart` als echte scène (`js/scenes/scene-titelkaart.js`) in plaats
      van zeven inline draw-ops in `js/engine.js`
- [x] Getekend logo: `gfx.tekenLogo` zet de 8×8-font op schaal met een
      omtreklijn uit een masker (niet per letter) en een verloop over de
      letterhoogte
- [x] Tweelaags titel: "THE LEGACY OF" klein boven "ALBERTA" op schaal 3 — op
      één regel past de titel op geen enkele leesbare schaal binnen 320 px
- [x] `eindkaart` hertekend: dezelfde kamer als de titelkaart, maar licht
- [x] **Nieuwe op `light`** — de andere helft van `shadow`: pixels omhóóg in hun
      eigen ramp, gedoseerd met Bayer. Wijkt af van het plan (WP B was met vier
      ops gesloten) en de reden staat in de entry: `ditherRamp` vult élke pixel,
      dus élke lichtstraal in de repo was een dekkende plaat. Dat is P0-3 uit de
      geprioriteerde lijst, en het was met het bestaande gereedschap niet op te
      lossen
- [x] Alle vijf de scènes met een lichtbron omgezet naar `light`, en hun licht
      naar achteren in de picture verplaatst: licht valt op een kamer, het ligt
      er niet onder. De kist in de westhoek staat nu écht in de straal
- [x] Monitorgloed als vijf ín elkaar liggende koepels: één ring heeft een rand,
      vijf oplopende ringen doven uit
- [x] Stofdoos in de westhoek stond naast de straal; korrel op de overloopwand
      stond twee stappen onder de ondergrond (las als sneeuw)
- [x] QC: **263/263 groen** (vier nieuwe tests voor `light`), `lint:scene`
      schoon op tien scènes, `check-assets` driftvrij, zes rooksmaaktesten groen
      (229 controles), en de contrastfout uit WP A is op verse screenshots niet
      teruggekomen

Nog open, met adres: het trapgat in `overloop` (y140–189) overlapt de loopstrook
(y152–189), dus wie via het zuiden binnenkomt staat ín het gat. Walkbox-werk,
hoort bij **WP H**, waar de walkboxen toch al herzien worden voor de
dieptescaling.

### - [x] WP F — Typografie en chroom

Entry: `workflow/22-typografie-en-chroom.md` · commit: `799a22b`

- [x] Inktmaat per glyph in `js/font.js`; de glyphdata zelf ongemoeid. Óók de
      linkerruimte wordt weggerekend — anders staat elke regel die met een "i"
      begint twee pixels ingesprongen
- [x] `tekenProse`/`proseBreedte` naast `tekenTekst`: monospace blijft waar een
      raster hóórt (statusbalk, invoerbalk, terminal)
- [x] `_wrap` breekt op pixels, met een meetfunctie; zonder die functie rekent
      hij monospace, dus alles op een raster blijft werken
- [x] `gecentreerdeTekst` en de overslaanhint meten in pixels
- [x] Het venster krimpt naar zijn breedste régel, met `maxTekens × 8` als
      bovengrens en 96 px als bodem
- [x] Venster als blad papier: slagschaduw met de `shadow`-op (dus in de kleur
      van de kamer eronder), korrel, belichting van boven, hoekornament, en één
      pixel extra regelafstand
- [x] Statusbalk en invoerbalk als lijstwerk: verloop in hout, korrel, lichte
      bovenrand, donkere onderrand
- [x] Handschrift met schuinstand, proportionele spatiëring mét variatie, en
      deining per groepje van vier als driehoeksgolf — per teken en als hash
      viel elk woord uit elkaar in losse letters
- [x] De kop van een spread staat in dezélfde hand, alleen rechter en zonder
      deining; de gedrukte prosefont las als twee schrijvers op één blad
- [x] **De ASCII-kop is geschrapt, niet vervangen.** `"== naam =="` kwam uit
      `js/logic/world.js` — opmaak in de laag die presentatievrij hoort te zijn,
      en de statusbalk zei het twee regels hoger al. In de sim-terminal blijft
      zo'n kop wél staan: dat is een tekstspel
- [x] Kolommen van een spread worden verdeeld als alles op één spread past
- [x] QC: **285/285 groen** (22 nieuwe tests), lint en check-assets schoon, zes
      rooksmaaktesten groen (229 controles), en de epiloogkaart wordt niet meer
      volledig afgedekt

Bewust niet: een aparte pixel-handschriftfont (de stijlgids noemt die als
polish-tícket bóven op de benadering, en op 8×8 is de winst marginaal tegenover
honderd nieuwe glyphs). De vlekken die onder de spread-tekst liggen horen bij
**WP G**, waar het papier per level opnieuw getekend wordt.

### - [x] WP G — Het notitieboek

Entry: `workflow/23-het-notitieboek.md` · commit: `76f6ebb`

- [x] Zeven schetsen, één per scharnier-metafoor, in
      `js/scenes/spread-schetsen.js` — blauwdruk-en-doos, trechters-en-goot,
      knikkerbaan met klem en splitsing, twee-pijlen-één-doos, patroonkaart met
      turfjes, plankenbrug met genummerde planken, zoekspoor en dubbele pijl
- [x] Ze staan op de twéede bladzijde: dat is waar Alberta de opdracht geeft, en
      waar haar tekst naar verwijst ("volgens de schets hieronder"). Die zinnen
      wezen tot nu toe naar niets
- [x] Beschadiging per level in plaats van één gedeelde vlek, en op de plek
      waar de puzzel zit
- [x] Dezelfde vlek op béide bladzijden, de schets alleen op de tweede — een
      vlek trekt door het papier heen
- [x] Papier met verlopen naar de rug, korrel en **liniatuur** op exact
      `BLAD.regelH`, zodat het handschrift ín de lijn valt
- [x] Bladerhint naar het linkerblad; de onderrand van het rechterblad is van de
      weekregel, die sinds het proportionele handschrift drie regels nodig heeft
- [x] `tools/lint-scene.mjs` keurt de schetsen mee in een eigen pas
- [x] Glyphs `×` en `→` toegevoegd, plus een test die elk teken in de spelprose
      tegen de font houdt — "validatie ×3" stond als "validatie ?3" op de
      bladzijde, en `js/font.js` verwees naar een lint-tool die nooit bestaan
      heeft
- [x] Kop van spread 7 ingekort: "(getCategorie().getNaam())" is één woord van
      26 tekens en liep over de bladrand
- [x] `AL.debugSpread` als testhaak — zonder die haak kost het zeven
      uitgespeelde levels om alle veertien bladzijden te zien
- [x] QC: **286/286 groen**, lint schoon (tien scènes + schetsenset),
      check-assets driftvrij, zes rooksmaaktesten groen (229 controles), alle
      veertien bladzijden bekeken

Bewust niet: de spread-tekst zelf herschrijven (die is puzzelinhoud en doet wat
ze moet doen), een papiersjabloon per level (zeven keer dezelfde liniatuur), en
de weekregel inkorten — die zin staat woordelijk in `achtergrond.md`,
`spelontwerp-legacy.md` en `deel1-hints.md`, en de walkthrough-PDF's kunnen hier
niet herbouwd worden.

### - [x] WP H — Sprites en animatie

Entry: `workflow/24-sprites-en-animatie.md` · commit: `6e3f0c8`

- [x] Ademende idle: twee frames op 1 Hz, hoofd één pixel lager
- [x] Loopcyclus van vier frames met **deining** — de doorzwaaiframes zijn één
      rij hóger, en omdat het anker onderaan ligt komt de romp omhoog terwijl de
      voeten staan. Dat ene pixel doet meer dan de voetstanden samen
- [x] Armzwaai, alleen in het zijaanzicht: van voren zit een arm ín het silhouet
- [x] Draaiframe bij een aswissel (noord-zuid ↔ oost-west), twee tikken, zonder
      de beweging te blokkeren
- [x] Zit-animatie van drie frames; de overlay wacht erop, de **modus niet** —
      daar hangen de invoerblokkering en de save aan
- [x] Dieptescaling over de loopstrook van de scène zelf: 1,0 vooraan, 0,84
      achteraan
- [x] Trapgat in `overloop` naar achter (eindigt nu op de voorrand van de
      loopstrook); treden om en om licht/donker; leuning van boven het gat naar
      de voorrand, waar ze tussen speler en diepte in staat
- [x] `test/test-sprites.mjs`: tien keuringen (rechthoekigheid, breedte binnen
      een anim, hoogteverschil ≤ 1, maten uit de stijlgids, sub-palet, anker,
      aanwezige anims, geen `-west`). Vond meteen dat `loop-oost` geen deining
      had
- [x] Negen rooksmaaktesten wachtten op `modus === "pc"` en beweerden dan
      `overlayOpen` — dat werkte alleen omdat die twee hetzelfde moment waren.
      Ze wachten nu op de overlay zelf
- [x] QC: **296/296 groen** (tien nieuwe), lint schoon, check-assets driftvrij,
      zes rooksmaaktesten groen (229 controles), animatie frame voor frame
      bekeken

Twee dingen bewust níet: de sprite is niet naar de toegestane 16×32 vergroot (de
ruimte die de animatie nodig had zat in de hoogte, en de figuur wérkt), en de
walkboxen van de vier kamers zijn niet herzien — de 39-pixelstrook bleek genoeg
voor zichtbare diepte, en een hogere strook zou de speler dwars door de in de
achtergrond gebakken dozen en kist laten lopen.

### - [x] WP I — Geluid

Entry: `workflow/25-geluid.md` · commit: `60ac285`

- [x] Echte twee-operator-FM: een modulator die via een gain op de `frequency`
      van een carrier uitkomt. Drie knoppen per stem, dezelfde als op een OPL2:
      ratio, index, en een eigen envelope op die index. Niet méér dan twee
      operatoren — zes klinkt als een DX7 en dus als de verkeerde periode
- [x] Zes stemmen: `koud`, `bas`, `warm`, `blip`, `hout`, `karton`. De
      niet-harmonische ratio's (1,41 en 1,73) doen de foley: dat is geen toon
      meer maar een tik op een plank
- [x] Vier bedden: `titel`, `ambient-zolder`, `pc`, `einde` (eenmalig)
- [x] Foley erbij: `stap`, `stap-2`, `doos`. Voetstappen op de tel van de
      loopcyclus, met twee afwisselende varianten
- [x] **`ambient-zolder` is gepromoveerd, niet afgevuurd.** Die cue was één
      blokgolf van 0,4 s op 110 Hz; afvuren zou geen sfeer opleveren maar een
      pieptoon. De naam bleef, de inhoud is een bed van 19,2 s geworden
- [x] Vooruitkijkende scheduler op de audioklok, getikt vanuit de logische tik
      van de engine — WebAudio timet exact, een rAF-lus niet
- [x] Meestergain, want met vooruitkijken is "uit" niet te halen door te
      stoppen met plannen: er staan al noten in de toekomst, en die kun je
      alleen naar nul versterken
- [x] **Een gemiste noot wordt niet ingehaald** — gevonden door de test, niet
      door mij. Bij een bevroren tabblad werden bij terugkomst alle gemiste
      noten in één klap geplaatst op een tijd in het verleden, wat WebAudio
      uitlegt als "nu"
- [x] `startBedVoorStand()`: één plek beslist welk bed bij de stand hoort.
      "Geluid aan" zette alleen de gain terug, dus op de zolder bleef het daarna
      stil tot je van kamer wisselde
- [x] Nagemaakte AudioContext in de tests: controleert dát het FM is, dat geen
      exponentiële ramp naar exact nul gaat (ongeldig per spec, Chromium slikt
      het, andere engines gooien), en dat elke oscillator ook gestopt wordt
- [x] Het register als test: de notendichtheid van de zolder moet lager zijn dan
      die van de pc
- [x] QC: **322/322 groen** (26 nieuwe), lint schoon, check-assets driftvrij,
      `smoke-browser` van 21 naar **28** controles, geen bestanden en geen deps,
      headless zonder `AudioContext` crasht niet, en "geluid uit" zet de
      meestergain in de browser gemeten op exact nul

Wat níet geverifieerd is en dat hoort hier te staan: **hoe het klinkt.** Er is
in deze container geen geluidsuitgang. Wat gecontroleerd is, is de graaf en de
data, niet het oordeel van een oor — de mix hoort door iemand met speakers
nagelopen te worden.

### - [x] WP J — De gesimuleerde pc

Entry: `workflow/26-de-gesimuleerde-pc.md` · commit: (nog in te vullen)

- [x] Menubalk boven in inverse video, met de commando's die **écht bestaan** en
      per paneel verschillend. Geen `Bestand Bewerken Zoeken Help` dat niets
      doet: een knop die niets doet is erger dan geen knop
- [x] F-toetsenstatusbalk onderaan — en dat is de enige plek waar een speler kan
      lézen dat F9 compileert
- [x] Dubbellijns kaders, afgeronde hoeken op nul, de gloed rond de kast en de
      text-shadow op het schermvlak eruit
- [x] Scanlines over het paneel, aan dezelfde `data-crt`-schakelaar als het
      canvas: `crt uit` zet ze allebei uit
- [x] `CHECK_OK` groen, `CHECK_FAIL` rood. `--pc-rood` werd geïnjecteerd en
      door geen enkele regel gebruikt; de uitvoer was één `textContent`, dus per
      regel kleuren kón niet. Nu een span per regel, met echte newlines ertussen
      zodat `textContent` blijft werken voor de tests
- [x] Editor opent bovenaan. Een textarea scrollt na het zetten van `.value`
      naar de cursor, en die staat aan het eind — level 1 opende op regel 16,
      met Alberta's notitie en de klassekop buiten beeld
- [x] Uitvoerpaneel: **twee** fouten. De eerste regel liep door de bovenrand
      (border plus padding is minder dan één regelhoogte), en `flex: 0 1 34%`
      liet het paneel krimpen zodat de láátste regel wegviel — de CHECK_FAIL,
      het enige dat de speler op dat moment wil lezen. Nu een ondergrens in
      regels, en de scrollpositie is voorwaardelijk: past het, dan van boven;
      past het niet, dan naar het eind
- [x] **F1 is de hint.** De geladen-melding beweerde dat `?` een hint gaf, maar
      in de editor zette dat gewoon een vraagteken in de code. Er was dus geen
      enkele manier om in de editor een hint te vragen
- [x] Courier New uit de schriftstack: een schrijfmachineletter met schreven,
      waar een DOS-terminal een rasterletter met vlakke einden had
- [x] QC: `smoke-pc` van 21 naar **32** controles, 322/322 headless groen, lint
      en check-assets schoon, en de editor is nog een echte `<textarea>`
      (`page.fill` werkt, en dat werkt alleen op een echt formulierveld)

**De 8×8-bitmapfont komt er niet in**, en dat is de enige plan-eis van het hele
programma die niet is uitgevoerd. De editor is een echte `<textarea>` — een
geboekte beslissing in `engine-architectuur.md`, ouder dan dit plan, om
selectie, klembord en schermlezers te houden — en een textarea zet zijn tekst
met een échte font. De font wél gebruiken vraagt de tekst op een canvas te
tekenen met een onzichtbare textarea erbovenop, en dat is precies het "veel werk
en fragiel" waar die beslissing over gaat. Plan en doc weken hier van elkaar af;
de doc heeft het betere argument. Zie de entry.

`smoke-touch` kon opnieuw niet draaien (geen WebKit), dus het mobiele
toetsenbord is niet geautomatiseerd nagekeken. De overlay is niet aangeraakt op
het punt dat `js/touch.js` gebruikt.

## Nog open na het programma

Elf pakketten zijn af (0, A t/m J). Dit blijft staan, met de reden:

- **De walkthrough-PDF's zijn niet herbouwd.** `walkthrough/deel1-hints.md` mag
  de nieuwe parser-tolerantie en F3 vermelden, en beide PDF's horen dan opnieuw
  gebouwd te worden met `walkthrough/tools/bouw-walkthrough.sh`. Die build
  vraagt `pandoc` en `typst`, en die staan niet in deze container. Geen enkel
  citaat in de walkthrough is onwaar geworden; het gaat om een aanvulling, niet
  om een correctie.
- **`smoke-touch` is nooit gedraaid.** Die test vraagt WebKit, en dat ontbreekt
  hier. `js/touch.js` is in dit hele programma niet aangeraakt.
- **Hoe het geluid klínkt is niet beoordeeld.** Deze container heeft geen
  geluidsuitgang; wat gecontroleerd is, is de audiograaf en de data.
- **De sprite gebruikt zijn toegestane maat niet.** 13×25 binnen een budget van
  16×32. De animatie had de hoogte nodig, niet de breedte; breder maken betekent
  de figuur opnieuw tekenen.

## Wat bewust niet gebeurt

Zodat een verse sessie deze discussies niet heropent:

- **Alberta's lot wordt niet verklaard.** Kouder vertellen is niet hetzelfde
  als uitleggen; de regel "nooit een oorzaak noemen" blijft.
- **Geen faalstaat, geen deadline, geen verliesmechaniek.** De urgentie zit
  volledig in de toon. Staat, save-formaat en logica-laag blijven zoals ze zijn.
- **De _Seven Little Goats_-prose blijft ongemoeid.** Ze dient als bron voor de
  donkerte van het kader. Aanpassen zou de Java-broncode én de vier
  transcript-fixtures meetrekken die `test-sim-cross-check` byte voor byte
  vergelijkt.
