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

Entry: `workflow/17-rendererkern.md` · commit: (nog in te vullen)

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

### - [ ] WP C — Verhaal, stem en de zolder die antwoordt

Entry: `workflow/18-*.md` · commit: —

- [ ] Register kouder: intro, vier kamerbeschrijvingen, spreads, oordeel,
      epiloog. **Let op het bladbudget:** een spread-pagina telt hoogstens 24
      gewrapte regels (17 tekens × 12 regels × 2 kolommen). De langste pagina nu
      is `l4` p1 met 22. Wat eroverheen gaat, wordt afgekapt.
- [ ] Duisternis met _Seven Little Goats_ als bron, zonder de sim aan te raken
- [ ] Eigen `onderzoek`-tekst voor elk zelfstandig naamwoord in elke kamer
- [ ] Parser: kale richtingen, lidwoord-stripping, `neem`/`pak`
- [ ] Commandogeschiedenis met pijl-omhoog in `js/input.js`
- [ ] `AL.strings.intro` weer in gebruik; doublure `spreads.intro` weg
- [ ] `docs/achtergrond.md` register-sectie herschreven ("nooit een oorzaak"
      blijft)
- [ ] `docs/save-en-hints.md:138–141` oordeelteksten gelijkgetrokken
- [ ] Walkthrough deel 1 en 2 bijgewerkt, beide PDF's opnieuw gebouwd
- [ ] QC: 225/225; nieuwe tests per onderzoek-tekst en per synoniem; geen
      enkele `onderzoek` geeft nog een kamerbeschrijving

### - [ ] WP D — De opening

Entry: `workflow/19-*.md` · commit: —

- [ ] Openingsreeks op het canvas met establishing shots en overgangen
- [ ] Overslaanbaar; de save onthoudt dat ze gezien is
- [ ] Route wordt titel → openingsreeks → zolder; `spread`-modus houdt alleen
      de zeven level-spreads
- [ ] QC: `smoke-browser` en `smoke-full-playthrough` aangepast en groen; geen
      notitieboekpapier meer vóór het boek gevonden is

### - [ ] WP E — De zolder hertekend

Entry: `workflow/20-*.md` · commit: —

- [ ] Zes scènes hertekend: gradiënten, perspectief, één lichtbron, outlines,
      voorgrondlaag
- [ ] Props uit de achtergrond naar geblitte hotspot-sprites (pc `aan`,
      broncode-doos `open`)
- [ ] Het beeld dekt de prose: mok, stoel, pen, dozen tot aan de balken
- [ ] Ambient beweging: stof, monitorflikkering, schuivend licht
- [ ] `titelkaart` als echte scène met een getekend logo-bitmap
- [ ] QC: `lint-scene` schoon; elk naamwoord uit de beschrijving aanwijsbaar;
      geen prop dubbel

### - [ ] WP F — Typografie en UI-chrome

Entry: `workflow/21-*.md` · commit: —

- [ ] Proportionele prose; wrap van tekens naar pixels (ook
      `gecentreerdeTekst`)
- [ ] Handschriftfont voor het notitieboek
- [ ] Berichtvenster: slagschaduw, papiertextuur, echt kader, dekt de eindkaart
      niet meer af
- [ ] Chrome op statusbalk en invoerbalk
- [ ] QC: alle venster-tests groen; visuele diff van intro, kamer en epiloog

### - [ ] WP G — Het notitieboek

Entry: `workflow/22-*.md` · commit: —

- [ ] Per level een eigen papierachtergrond, beschadiging waar de puzzel zit
- [ ] Schetsen per scharnier-metafoor (blauwdruk, trechters, knikkerbaan, twee
      pijlen, patroonkaart, plankenbrug, dubbele pijl)
- [ ] Handschrift met de font uit WP F
- [ ] QC: `lint-scene` schoon; elke spread bekeken; `art-stijlgids.md` mee

### - [ ] WP H — Sprites en animatie

Entry: `workflow/23-*.md` · commit: —

- [ ] Ademende idle
- [ ] Loopcyclus 4–6 frames met armzwaai; draaiframe
- [ ] "Gaat aan de pc zitten"-animatie
- [ ] Dieptescaling toegepast
- [ ] QC: sprite-lint; west blijft gespiegeld oost zonder foute asymmetrie

### - [ ] WP I — Geluid

Entry: `workflow/24-*.md` · commit: —

- [ ] OPL-achtige stemmen in WebAudio, geen samples
- [ ] Titelthema, zolder-ambience-loop, pc-laag, eindcue — koud register
- [ ] Foley: voetstappen, bladzijde, doos, toetsen
- [ ] `ambient-zolder` wordt eindelijk afgevuurd
- [ ] QC: geen bestanden, geen deps; headless zonder `AudioContext` crasht
      niet; `geluid uit` maakt het volledig stil; cue-lijst in
      `engine-architectuur.md`

### - [ ] WP J — De gesimuleerde pc

Entry: `workflow/25-*.md` · commit: —

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
