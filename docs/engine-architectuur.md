# Engine-architectuur

Het contract van de browser-engine van _The Legacy of Alberta_. Het legt vast
wat uit de remake-90s-engine wordt overgenomen, wat verandert, hoe de DOM-vrije
logica met de renderlaag praat, welke effect-tags er zijn, hoe de staat oogt,
in welke volgorde `index.html` laadt, en hoe de gesimuleerde pc past binnen de
canvas-aanpak. WP 3 bouwt tegen dit document.

## Uitgangspunten (hard)

Uit `CLAUDE.md`, hier herhaald omdat de engine ze het scherpst raakt:

- **Vanilla JS, geen build-stap.** Geen bundler, transpiler of framework.
- **Draait vanaf `file://`.** Dubbelklikken op `index.html` moet werken. Losse
  `<script>`-tags; geen dev-server verondersteld.
- **Nul runtime-dependencies.**
- **DOM-vrije logica.** Alles in `js/logic/` en `js/sim/` is headless en Node-
  testbaar. Logica-functies geven `{tekst, effecten}` terug; de renderlaag past
  de effecten toe. Logica raakt nooit `document`, `window` of het canvas aan.
- **Platte, serialiseerbare staat.** Eén plat object dat door `JSON.stringify`
  round-trript. Geen klasse-instanties, geen functies, geen cycli.

## Wat we overnemen uit remake-90s

De renderer en de randmodules zijn een aanpassing van
`~/-work/programming/revenge-of-red-riding-hood/remake-90s/`. Overgenomen,
met behoud van hun contract:

| Bestand | Overname | Wijziging |
|---|---|---|
| `js/gfx.js` | palet-geïndexeerde software-renderer (320×200 `Uint8Array`), primitieven, `tekenPicture`/`cacheScene`/`blitScene`, `tekenSprite`, `tekenTekst`, berichtvenster | uitgebreid palet; `debugEga`-guard versoepeld (zie hieronder) |
| `js/font.js` | 8×8-bitmapfont | ongewijzigd |
| `js/input.js` | toetsenbord/parser-invoer, arrow keys | ongewijzigd; parser-verben uitgebreid met zolder-commando's |
| `js/sound.js` | WebAudio-bliepjes, aan/uit-toggle | uitgebreide cue-lijst (zie effect-tags) |
| `js/parser.js` | `parse(ruweInvoer)` → `{commando, werkwoord, rest}`; dispatch op modus | overgenomen als patroon; nieuwe modi en verben |
| engine-lus (`js/engine.js`) | frame-lus, scène-cache-en-blit-patroon, venster-paginering, actor-beweging over walkboxes | referentie; herschreven rond de nieuwe modi (zolder / spread / pc) |
| scène- en sprite-schema | de draw-op- en frame-formaten uit `docs/scene-schema.md` en `docs/sprite-schema.md` | overgenomen; scène-ids zijn nu zolderkamers en spreads |
| `docs/`-schema's, Node `--test`, Playwright | test- en toolopzet | overgenomen |

Adapteren en crediteren; niet heruitvinden.

### Wat verandert aan gfx

- **Uitgebreid palet.** `js/palette.js` levert nu ~64 geïndexeerde kleuren in
  plaats van EGA-16. De renderer blijft index-gebaseerd:
  de backing store is nog altijd één byte per pixel, alleen de opzoektabel is
  groter. Sprites gebruiken hex-indexen `0`–`f` voor de eerste 16 en een
  uitbreiding voor de rest — zie `art-stijlgids.md` voor de sprite-codering
  boven index 15.
- **Versoepelde EGA-guard.** `gfx.debugEga` controleerde of elke pixel 0–15 was.
  De guard wordt `debugPalet`: hij controleert nu of elke pixel een geheel getal
  binnen de paletgrootte is (0 t/m `AL.palet.KLEUREN.length - 1`). Zo blijft de
  betrapping van buiten-palet-kleuren bestaan, aangepast aan het grotere palet.

## De logica-laag

Zelfde vorm als remake-90s. Elke handler geeft overal dezelfde vorm terug:

```js
{ tekst: [strings], effecten: [strings] }
```

- `tekst` — alinea's voor het berichtvenster (mag leeg zijn). De renderer doet
  de word-wrap; `\n` waar een regelafbreking betekenis heeft.
- `effecten` — machineleesbare tags voor de engine (scènewissels, pc, geluid,
  voortgang). Woordenlijst hieronder.

Modules hangen aan `globalThis.AL` (browser, `file://`) en exporteren via
`module.exports` (Node, tests). Namespace-prefix: **`AL`** (Alberta's Legacy),
tegenover `RRH` in de predecessor.

Laadvolgorde binnen de logica (elke leest wat de vorige nodig heeft):
`strings.js` → `world.js` → `levels.js` → checker-modules → `sim/*`.

## Effect-tag-woordenlijst

Dit is de volledige, gezaghebbende lijst. `spelontwerp-legacy.md` mag geen
engine-actie beschrijven die hier geen tag heeft; elke UI-overgang die het spel
nodig heeft, staat hieronder. De renderlaag is het enige dat op deze tags
reageert; de logica produceert ze alleen.

### Scène en navigatie

| Tag | Wanneer |
|---|---|
| `scene:<id>` | wissel naar een zolder-/huisscène (scène-id uit `art-stijlgids.md`) |
| `spread:<levelId>` | open een notitieboek-spread; levelId is `l1` … `l7`, plus `intro` en `outro` (dus `spread:l1`, `spread:intro`) |
| `titel` | toon de titelkaart |
| `betreed:<richting>` | de speler stak een schermrand over (`noord`/`oost`/`zuid`/`west`); engine-hint voor de camera |
| `fragment-gevonden:<levelId>` | het notitieboek-fragment voor dit level is ontgrendeld in de adventure |

### Gesimuleerde pc

| Tag | Wanneer |
|---|---|
| `pc:open` | de speler gaat aan Alberta's pc zitten; engine schakelt naar de pc-overlay |
| `pc:sluit` | terug naar de zolder |
| `editor:laad:<puzzleId>` | laad een editor-puzzel (beschadigde of lege Java + notities) |
| `terminal:start:<puzzleId>` | start een terminal-puzzel (trace/vind-de-fout/verklaar/parsons/kaart) |
| `parsons:laad:<puzzleId>` | laad een Parsons-puzzel in de terminal-UI (stroken) |
| `compileer` | de speler koos "compileer & test"; engine speelt de compileer-cue |
| `javac:fout:<puzzleId>` | de checker gaf een gesimuleerde `javac`-diagnose terug (tekst zit in `tekst`) |
| `check:ok:<puzzleId>` | een puzzel-assertie slaagde (CHECK_OK-regel) |
| `check:fout:<puzzleId>` | een puzzel-assertie faalde (CHECK_FAIL-regel; feedback in `tekst`) |

### Voortgang en level

| Tag | Wanneer |
|---|---|
| `level-start:<n>` | een level begint (na het lezen van de spread) |
| `puzzle-af:<puzzleId>` | een puzzel is volledig opgelost |
| `level-af:<n>` | alle puzzels van level `n` zijn opgelost; het spelstuk is hersteld |
| `voortgang:opgeslagen` | de staat is naar localStorage geschreven |
| `oordeel:<tier>` | toon Alberta's oordeel-eindscherm met verdict-tier (zie `save-en-hints.md`) |

### Hint

| Tag | Wanneer |
|---|---|
| `hint:<stap>` | een hint van stap 1/2/3 is getoond (engine kan een zachte cue spelen) |
| `hint:geen-meer` | de speler vroeg een vierde hint; er is er geen |

### Endgame en sim

| Tag | Wanneer |
|---|---|
| `sim:boot` | de pc boot _Seven Little Goats_ als speelbare simulatie |
| `sim:einde:<naam>` | de sim bereikte een van de vier eindes (zie `spelontwerp-seven-little-goats.md`) |
| `epiloog` | toon de epiloog die naar `seven-little-goats/` wijst |

### Systeem

| Tag | Wanneer |
|---|---|
| `geluid:<cue>` | speel een geluidscue; vaste cues: `pagina`, `deur`, `toets`, `compileer`, `ok`, `fout`, `boot`, `ambient-zolder` |
| `geluid:aan` \| `geluid:uit` | geluid globaal aan/uit |
| `herbegin` | het spel is teruggezet naar de begintoestand (zie `save-en-hints.md`) |
| `gestopt` | het spel is beëindigd (einde bereikt of expliciet gestopt) |

`spelontwerp-legacy.md` §"Commando's en effecten" verwijst één-op-één naar deze
tabel; elke daar genoemde overgang bestaat hierboven.

## De staat

Eén plat, serialiseerbaar object. `AL.world.nieuw(seed)` geeft een verse staat.
Velden (bindend voor de save in `save-en-hints.md`):

```js
{
  versie: 1,               // save-schemaversie (migraties)
  seed: 20260716,          // RNG-seed voor variatie (?seed=N of gegenereerd)
  modus: "zolder",         // "titel" | "zolder" | "spread" | "pc" | "sim"
                           //   | "oordeel" | "epiloog"
  sceneId: "zolder-west",  // huidige zolder-/huisscène
  speler: { x: 160, y: 150, richting: "zuid" }, // positie op de scène
  bezocht: { "zolder-west": true },             // welke scènes beschreven zijn

  levelActief: 1,          // welk level nu loopt (1..7), of 0 tussen levels
  levels: {                // per level de voortgang
    "1": {
      ontgrendeld: true,   // fragment gevonden, spread leesbaar
      spreadGelezen: false,
      puzzels: {           // per puzzel-id de staat
        "l1-editor": { status: "open", hints: 0, draft: "" },
        "l1-trace":  { status: "open", hints: 0 },
        "l1-verklaar": { status: "open", hints: 0 }
      },
      afgerond: false
    }
    // "2".."7" analoog
  },

  hintsTotaal: 0,          // som van alle hint-aanvragen (voor het oordeel)
  geluid: true,            // geluid aan/uit
  gestopt: false,          // spel beëindigd
  einde: null              // null | verdict-tier uit save-en-hints.md
}
```

- `modus` stuurt de dispatch, zoals `modus` in de predecessor het gevecht
  stuurde. Elke modus heeft een eigen commandoset (zie `spelontwerp-legacy.md`).
- `puzzels[*].draft` bewaart de editor-inhoud tussen sessies (concept-behoud).
- `puzzels[*].status`: `"open"` | `"bezig"` | `"af"`.
- Geen object-referenties in de staat: puzzels, levels en scènes worden op
  **id** aangesproken, niet op instantie. Dat houdt de save cyclusvrij.

De sim (_Seven Little Goats_ in de browser) heeft een eigen sub-staat in
`js/sim/`, die pas bestaat wanneer `modus === "sim"`. Die sub-staat is
eveneens plat en serialiseerbaar en wordt niet mee opgeslagen tussen sessies
(de sim is een eindstuk, geen doorlopende voortgang).

## Laadvolgorde in index.html

Losse `<script>`-tags, in deze volgorde (elke module verwacht de vorige):

```
1.  js/palette.js          // AL.palet: de kleurtabel
2.  js/font.js             // AL.font
3.  js/gfx.js              // AL.gfx (init na palet + font)
4.  js/input.js            // AL.input
5.  js/sound.js            // AL.sound
6.  js/parser.js           // AL.parser
7.  js/logic/strings.js    // AL.strings  (alle prose)
8.  js/logic/world.js      // AL.world    (zolder, staat, navigatie)
9.  js/logic/checker/tokenizer.js
10. js/logic/checker/asserts.js
11. js/logic/checker/javacsim.js
12. js/logic/levels.js     // AL.levels   (level/puzzel-machine)
13. js/levels/level1.js … level7.js       // puzzeldefinities
14. js/pc/editor.js  js/pc/terminal.js  js/pc/parsons.js
15. js/scenes/*.js         // zolderscènes + spreads
16. js/sprites/*.js        // sprites
17. js/sim/goats-strings.js  goats-world.js  goats-combat.js
18. js/engine.js           // AL.engine: init, frame-lus, effect-dispatch
```

`js/engine.js` laadt als laatste en is het enige dat het canvas, `document` en
de pc-overlays aanraakt. Het roept `AL.gfx.init(canvas)`, leest de save (of
maakt een verse staat), en start de frame-lus.

## De gesimuleerde pc: DOM-overlay, geen canvas-tekst

De editor en de terminal worden **als DOM-overlays** gerenderd, gestyled om bij
de VGA-look te passen, en **niet** als canvas-getekende tekst.

> Beslissing: de gesimuleerde pc is een full-screen modus binnen dezelfde
> pagina, maar zijn inhoud (editor, terminal, Parsons-stroken) leeft in een
> DOM-overlay bovenop het canvas, niet in de palet-geïndexeerde backing store.

Waarom DOM en niet canvas:

- **Tekstinvoer.** De editor heeft een echte cursor, meerregelige invoer,
  invoegen en verwijderen. Dat namaken op een 8×8-bitmapfont-canvas is veel werk
  en fragiel; een `<textarea>` of contenteditable met een monospace-font doet
  het gratis.
- **Selectie en klembord.** Studenten willen code kunnen selecteren, kopiëren
  en plakken. Canvas-tekst kan dat niet zonder een eigen selectie-engine.
- **Toegankelijkheid.** Een DOM-editor werkt met screenreaders, browser-zoom en
  toetsenbordnavigatie; canvas-tekst is voor die technologie onzichtbaar.

De overlay wordt visueel ingepast: een CSS-styled kader in de VGA-stijl (zie de
pc-chrome in `art-stijlgids.md`), een monospace-font, blok-cursor, dezelfde
kleuren als het palet (als CSS-variabelen afgeleid van `js/palette.js`). De
zolder eronder blijft op het canvas staan; de overlay dekt hem af zolang
`modus === "pc"`. De engine schakelt de overlay in bij `pc:open` en uit bij
`pc:sluit`.

De pc-modules (`js/pc/editor.js`, `terminal.js`, `parsons.js`) mogen — als enige
naast `engine.js` — de DOM aanraken, want zij zíjn de renderlaag van de pc. Ze
sturen de spelerinvoer door naar de checker (`js/logic/checker/`) en tonen de
`{tekst, effecten}` die terugkomt. De checker zelf blijft DOM-vrij en Node-
testbaar.

## Bestandskaart van js/

```
js/
├── palette.js                 // AL.palet: ~64-kleuren VGA-ish tabel
├── font.js  gfx.js            // renderer (overgenomen, palet-aangepast)
├── input.js  sound.js         // invoer + geluid (overgenomen, uitgebreid)
├── parser.js                  // parse + dispatchpatroon (overgenomen)
├── engine.js                  // frame-lus + effect-dispatch (raakt de DOM)
├── logic/                     // DOM-vrij, Node-testbaar
│   ├── strings.js             // ALLE zolder-/level-prose
│   ├── world.js               // zolderscènes, staat, navigatie
│   ├── levels.js              // level/puzzel-toestandsmachine
│   └── checker/
│       ├── tokenizer.js       // Java-tokenizer (strings/commentaar-bewust)
│       ├── asserts.js         // structurele assertie-bibliotheek
│       └── javacsim.js        // gesimuleerde javac-diagnostiek
├── pc/                        // gesimuleerde pc (DOM-overlay)
│   ├── editor.js  terminal.js  parsons.js
├── levels/                    // level1.js … level7.js: puzzeldefs, varianten,
│                              //   hints, beschadigde code, modeloplossingen
├── sim/                       // Seven Little Goats browsersimulatie (DOM-vrij)
│   ├── goats-world.js  goats-strings.js  goats-combat.js
├── scenes/                    // zolderkamers + notitieboek-spreads
└── sprites/                   // sprites als pixel-strings
```

De DOM-vrije grens loopt scherp: `logic/`, `levels/` en `sim/` raken nooit de
DOM; `engine.js` en `pc/` mogen dat wel. De checker in `logic/checker/` is het
zwaarst geteste stuk (WP 4) en blijft daarom strikt headless.
