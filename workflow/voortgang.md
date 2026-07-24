# Voortgang — opwaardering van presentatie en verhaal

Dit is de levende checklist van het tweede programma op deze repo (zie
`workflow/15-opwaardering-kickoff.md` voor de opdracht, de beslissingen en het
volledige plan). Anders dan de genummerde entries, die chronologisch zijn en
blijven staan zoals ze geschreven zijn, verandert dít bestand mee met het werk.

**Werkt een sessie hier na een crash verder?** Lees dan in deze volgorde:

1. Dit bestand — waar staat het programma, wat is het volgende pakket.
2. `workflow/15-opwaardering-kickoff.md`, §Beslissingen — waarom het zo is.
3. Dezelfde entry, Bijlage B — het volledige plan met de QC-poort per pakket.
4. `CLAUDE.md`, §Werkafspraken — hoe er gecommit en gelogd wordt.

Daarna: `node --test test/test-*.mjs` en `git log --oneline -5` om te zien of
de laatste commit compleet is.

## Conventies in dit bestand

- `- [x]` afgewerkt, `- [~]` in uitvoering, `- [ ]` nog niet begonnen.
- De commit-hash van een pakket wordt in de *volgende* commit ingevuld — bij
  het schrijven van dit bestand is de eigen hash nog niet bekend. Staat er
  "(nog in te vullen)" bij het laatst afgewerkte pakket, dan is dat normaal.
- Een pakket is pas `[x]` als zijn QC-poort geslaagd is. Niet eerder.

## Vertrekpunt

Gemeten op `claude/game-polish-improvements-rhlk70`, commit `7333f78`, met
Node v22.22.2:

- `node --test test/test-*.mjs` — 225 tests, **224 groen, 1 rood**
  (`test-sim-cross-check`, codering; wordt in WP A rechtgezet).
- Zes scènes, 173 draw-ops samen. Eén sprite van de zes wordt geblit.
  Nul overgangen. Negen geluidscues, geen muziek.

Entry 12 rapporteerde 229 tests; `node --test` telt subtests over
Node-versies heen anders. Er zijn geen testbestanden verdwenen. Vanaf hier is
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
valt geen zinnige diepte op te schalen zonder de walkboxes te herzien. Hoort
bij **WP H**.

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

Entry: `workflow/22-typografie-en-chroom.md` · commit: (nog in te vullen)

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

### - [ ] WP G — Het notitieboek

Entry: `workflow/23-*.md` · commit: —

- [ ] Per level een eigen papierachtergrond, beschadiging waar de puzzel zit
- [ ] Schetsen per scharnier-metafoor (blauwdruk, trechters, knikkerbaan, twee
      pijlen, patroonkaart, plankenbrug, dubbele pijl)
- [ ] Handschrift met de font uit WP F
- [ ] QC: `lint-scene` schoon; elke spread bekeken; `art-stijlgids.md` mee

### - [ ] WP H — Sprites en animatie

Entry: `workflow/24-*.md` · commit: —

- [ ] Ademende idle
- [ ] Loopcyclus 4–6 frames met armzwaai; draaiframe
- [ ] "Gaat aan de pc zitten"-animatie
- [ ] Dieptescaling toegepast
- [ ] QC: sprite-lint; west blijft gespiegeld oost zonder foute asymmetrie

### - [ ] WP I — Geluid

Entry: `workflow/25-*.md` · commit: —

- [ ] OPL-achtige stemmen in WebAudio, geen samples
- [ ] Titelthema, zolder-ambience-loop, pc-laag, eindcue — koud register
- [ ] Foley: voetstappen, bladzijde, doos, toetsen
- [ ] `ambient-zolder` wordt eindelijk afgevuurd
- [ ] QC: geen bestanden, geen deps; headless zonder `AudioContext` crasht
      niet; `geluid uit` maakt het volledig stil; cue-lijst in
      `engine-architectuur.md`

### - [ ] WP J — De gesimuleerde pc

Entry: `workflow/26-*.md` · commit: —

- [ ] Borland/Turbo-chrome: menubalk, dubbellijns kader, F-toetsen-statusbalk
- [ ] Scanlines over het paneel; afgeronde hoeken en CSS-glow eruit
- [ ] Bitmapfont in plaats van Courier New
- [ ] `CHECK_OK` groen, `CHECK_FAIL` rood (`--pc-rood` wordt al geïnjecteerd)
- [ ] Editor scrollt naar boven; uitvoerpaneel snijdt zijn eerste regel niet af
- [ ] QC: `smoke-pc` groen; de editor blijft een echte `<textarea>`; mobiel
      toetsenbord werkt nog

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
