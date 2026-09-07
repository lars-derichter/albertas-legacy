# 01 — Kickoff en repo-init

## Opdracht

Lars leverde de volledige projectbrief in één prompt: een spel in King's
Quest-stijl over grootmoeder Alberta (eerbetoon aan Roberta Williams) die
verdween terwijl ze aan een vervolg op _Revenge of Red Riding Hood_ werkte.
De speler herstelt haar spel level per level, gekoppeld aan de zeven
scharnieren van Programming Fundamentals. Verder in de brief: een
hintmechanisme, save state, variatie tussen runs, een walkthrough-pdf in
90's-stijl, documentatie en deze workflow-map als genAI-showcase.

De manager-sessie (Claude, Fable 5) verkende eerst twee bronnen met
Explore-agents: de remake-90s van _Revenge of Red Riding Hood_ (de
herbruikbare browser-engine) en de cursus Programming Fundamentals (de
zeven scharnieren, het tempo, de oefenvormen). Daarna volgde een
plan-agent en een vragenronde met Lars.

## Aanpak

Het plan werd in twee iteraties gemaakt. De eerste versie ging uit van een
Java-terminalspel; Lars stuurde bij: het spel draait volledig in de
browser, de editor en terminal worden gesimuleerd, en de echte Java-code
van het vervolgspel is de hoofdprijs in een aparte map. De tweede versie
werd goedgekeurd.

Werkpakket 0 (deze entry): een Opus-worker maakte de README, CLAUDE.md,
.gitignore, de mappenstructuur en workflow/README.md aan.

## Beslissingen

- **Alles in de browser, vanilla JS, geen build-stap** — dubbelklikken op
  `index.html` moet volstaan, zoals bij de remake-90s.
- **Structurele JS-checks** voor de Java-puzzels (tokenizer + asserts,
  getoond als gesimuleerde javac-output). Geen echte JVM in de browser.
- **Titel van het vervolg: "Seven Little Goats"** — Engelse titel, Vlaamse
  speltekst, zoals bij de voorganger. Verhaal: een jonge wolf slokt zes
  geitjes op; Roodkapje, intussen wolvenexpert tegen wil en dank, gaat
  achter hem aan. Vier eindes die de vier eindes van deel één spiegelen.
- **VGA-achtig uitgebreid palet** op de bestaande palette-indexed renderer,
  voor de vroege-jaren-90-look (Leisure Suit Larry, zonder de sleaze).
- **Erewoord-systeem** voor spoilers: alles in één publieke repo, deel 2
  van de walkthrough achter een verzegelde pagina.
- **Managermodel**: één sessie stuurt per werkpakket een Opus-worker aan,
  controleert de kwaliteit en commit pas daarna — atomair, één commit per
  werkpakket.

## QC-resultaat

- Alle bestanden aanwezig; mappenstructuur volgt het plan.
- 80-tekens-controle op tekenniveau: geslaagd (een eerdere vlag bleek een
  byte-telling op multibyte-tekens).
- De extra Java-beperkingen die de worker in CLAUDE.md opnam (geen ternary,
  geen inheritance, geen collecties buiten `ArrayList`) gecontroleerd tegen
  de broncode van de voorganger: die bevat inderdaad geen van alle.
- Eén formulering rechtgezet in workflow/README.md ("geregeld op 80
  tekens" → "regels afgebroken op 80 tekens").

Commit: repo-init, werkpakket 0.

## Bijlage A — de oorspronkelijke prompt

Integraal geciteerd in de oorspronkelijke taal, zoals de conventie het
voorschrijft.

```text
Initialise this repository for use with Claude and then start making a
plan. This is all the information I have on this project at this time:

- The legacy of Alberta: game in the 90s Kings Quest style (visually more
  like a contemporary game of the early 90s, think leisure suit Larry
  without the sleaziness) (check how
  /Users/lars/-work/programming/revenge-of-red-riding-hood/remake-90s was
  built and freely reuse its parts and components)
- It is a bit of a meta-game: your grandmother, Alberta (character based
  on Roberta Wiliams) disappeared years ago. While cleaning up her attic
  you find a badly damaged notebook. Apparently she was working on a
  sequel to the Revenge of Red Riding Hood (think of a nice fairytale
  theme/name) when she disappeared.
- As a tribute to her legacy you want to finally build that game.
- The legacy of Alberta consists of a number of levels (tied closely to
  the scharnierpunten of the programming fundamentals course:
  /Users/lars/-work/thomas-more/teaching/programming-fundamentals ) in
  which you have to fix code blocks or supply them based on Alberta's
  notes. It should be hard enough and long enough that a full go would
  take around 2hrs.
- Have a hint mechanism that gives helpful hints (but that do not lead
  directly to the solution.)
- At the end it should be possible to play the sequel to revenge of red
  riding hood as a game inside the game.
- It should be clear from the beginning that this is only the prototype
  phase in which a terminal based text game is built.
- Add documentation explaining the backstory (as well as explaining who
  Roberta Williams is and her influence). Document the link with the
  scharnierpunten. The game should have some kind of save state. Each
  level should contain an intro that notifies the student of when they
  should be able to finish this level.
- If possible make it so that there is some variation between runs.
- The full (and well documented) source code of the sequel game should be
  reachable in a clearly named subfolder for students to run and study.
  It should have its own README.
- Write a walkthrough guide of the game in the style of your typical 90s
  walkthrough guides. Render this as a pdf in that same typical style.
  These walkthroughs mostly had two sections: walkthrough without
  solutions but with copious hints and a full walkthrough with all the
  solutions as a second part. (Sometimes there was some sticky tape or
  seal holding this section closed., Cutting it open was proof that you
  did not solve the game on your own.)
- Also: there is a possibility that this project maybe used as a showcase
  of howto use genAI in productive ways. For this purpose add a folder
  `workflow` where you keep a narrative log of the work we have done
  together (…).
- You make a plan now. In this plan there should be one agent who manages
  the tea and does quality control. This manage invokes agents (Opus) to
  do the actual work. The manager always checks the quality before
  comitting. Each step is commited and pushed atomically.

  If you have any questions before you can make this plan, please ask.
  Then create the plan.
```

Tijdens de planfase stuurde Lars twee keer bij: (1) het spel moet volledig
in de browser draaien — editor en terminal worden gesimuleerd, het echte
Java-spel is de hoofdprijs in een submap, en het spel-in-het-spel is een
simulatie; (2) antwoorden op de keuzevragen: full graphical (met
notitieboek-spreads als scènes), structurele JS-checks, titel "Seven
Little Goats", VGA-achtig palet.

## Bijlage B — het goedgekeurde plan

Integraal, zoals goedgekeurd op 16 juli 2026.

````markdown
# Plan: The Legacy of Alberta (browser game)

## Context

New educational game for the Java course Programming Fundamentals (Thomas
More). Story: grandmother Alberta (homage to Roberta Williams) disappeared
while building a sequel to "Revenge of Red Riding Hood"; cleaning her attic
you find her damaged notebook and finish the game as a tribute. Each of the
7 levels drills one scharnier of the course by repairing/writing Java code.
The fiction makes clear the sequel is in its prototype phase: a terminal
Java text game. Repo doubles as a genAI-workflow showcase.

**Alberta's Legacy runs entirely in the browser** (vanilla JS, no build
step, runs from file://, reusing the remake-90s engine). The "editor" and
"terminal" where students work on Java code are simulated inside the game
(Alberta's old PC). The **real, runnable Java sequel source lives in a repo
folder — that is the prize**; the playable game-in-game at the end is a JS
simulation of that Java text game.

## Decisions (confirmed with Lars)

- Full graphical adventure in the browser, early-90s look; some "scenes"
  are notebook spreads rather than rooms (cheaper, fits fiction).
- VGA-ish extended palette (~64–256 colors) on the remake-90s
  palette-indexed renderer, for the contemporary-early-90s/LSL look.
- Java verification via structural JS checks: tokenizer/normalizer +
  per-puzzle assertions, failures rendered as simulated javac output. No
  real JVM, no external dependencies.
- Sequel title: **"Seven Little Goats"** (game prose in Flemish Dutch,
  English title, like its predecessor). Folder: `seven-little-goats/`.
  Story: a young wolf (nephew) swallows six goat kids; Roodkapje, reluctant
  village wolf-expert, tracks him. Four endings mirroring game 1's.
- Puzzle formats, mixed — all inside the simulated PC: (a) repair damaged
  Java in the simulated editor, (b) write a small class / whole method from
  scratch from Alberta's notes, (c) Parsons puzzles, (d) exam-format items:
  voorspel-de-output, vind-de-fout, verklaar-in-één-zin.
- Spoilers: honor system, one public repo; walkthrough part 2 "sealed"
  90s-style (readable md on GitHub; PDF is the sealed artifact).
- Sequel Java + all puzzle Java strictly within course bounds: no switch,
  streams, enum, var, lambdas; Dutch class/field names.
- 7 levels ↔ 7 scharnieren; full playthrough ≈ 2 h (adventure connective
  tissue ~25 min, code puzzles ~90 min).

## Key references (reuse, don't reinvent)

- `~/-work/programming/revenge-of-red-riding-hood/remake-90s/` — the engine
  to reuse: `js/gfx.js` (palette-indexed software renderer, dithering,
  sprites, message windows), `js/font.js`, `js/input.js`, `js/sound.js`,
  `js/parser.js` (pattern), engine loop (`js/engine.js`, reference), scene/
  sprite data formats + `docs/` schemas, Node `--test` + Playwright test
  setup, `tools/` linters/screenshot. Architecture contract to preserve:
  DOM-free logic returning `{tekst, effecten}`, flat serializable state,
  all prose in one strings file, `?` hint command.
- `~/-work/programming/revenge-of-red-riding-hood/src/` — predecessor Java
  text adventure (Main, Spel, Speler, Kamer, Voorwerp, Gevecht,
  Tegenstander, Test*): idiom + endings model for the Java sequel.
- `revenge-of-red-riding-hood/workflow/` — narrative-log style to
  replicate.
- Course: `~/-work/thomas-more/teaching/programming-fundamentals`
  (`sources/cursusdoorlichting-leidraad.md` ~lines 385–437: scharnieren +
  item formats; `games/home/hub-data.js`: metaphor vocabulary per
  scharnier; `lib/games/validate.js` + `games/` for answer-checking
  precedents in the browser).

## Repo layout

```
albertas-legacy/
├── index.html  css/style.css        # the game; open and play, no server
├── README.md  CLAUDE.md  .gitignore
├── js/
│   ├── palette.js                   # NEW extended VGA-ish palette
│   ├── font.js  gfx.js  input.js  sound.js   # adapted from remake-90s
│   ├── engine.js  parser.js         # game loop, verbs (patterns reused)
│   ├── logic/                       # DOM-free, Node-testable
│   │   ├── world.js  strings.js     # attic rooms, state, ALL prose
│   │   ├── levels.js                # level/puzzle state machine
│   │   └── checker/                 # Java tokenizer, normalizer,
│   │       ├── tokenizer.js         #   assertion lib, simulated javac
│   │       ├── asserts.js  javacsim.js
│   ├── pc/                          # simulated PC: editor + terminal UI
│   │   ├── editor.js  terminal.js  parsons.js
│   ├── levels/level1.js … level7.js # puzzle defs, variants, hints,
│   │                                #   damaged code, model solutions
│   ├── sim/                         # Seven Little Goats browser sim
│   │   ├── goats-world.js  goats-strings.js  goats-combat.js
│   ├── scenes/                      # attic rooms + notebook spreads
│   └── sprites/
├── seven-little-goats/              # THE PRIZE: real Java game, own
│   └── src/                         #   README; Main, Spel, Speler,
│                                    #   Kamer, Voorwerp, Tegenstander,
│                                    #   Gevecht, Geitje, Schuilplaats,
│                                    #   TestSpeler, TestGeitje,
│                                    #   TestGevecht
├── docs/   achtergrond.md  roberta-williams.md  levels-en-checkpoints.md
│           engine-architectuur.md  checker-contract.md  art-stijlgids.md
│           spelontwerp-legacy.md  spelontwerp-seven-little-goats.md
│           save-en-hints.md
├── walkthrough/  deel1-hints.md  deel2-oplossingen.md  stijl/zine.typ
│                 tools/bouw-walkthrough.sh
├── test/         Node --test suites + Playwright smoke/playthrough
├── tools/        lint-scene, screenshot, check-assets (Node)
└── workflow/     README.md  01-…    # narrative build log per work package
```

## Game design

**Shape.** Full graphical adventure: walkable attic/house rooms (arrow keys
+ typed parser, remake-90s style) interleaved with notebook-spread scenes
(full-screen drawn pages of Alberta's notebook: sketches, notes, the level
brief). Per level: find/unlock the next notebook fragment in the adventure,
read the spread, then sit at Alberta's old PC — a full-screen simulated DOS
editor/terminal — to repair or write the Java code. Title screen + intro
make the prototype framing explicit ("een tekstversie eerst — zo begon
Alberta elk spel"). Each level intro states "Dit zou je moeten kunnen na
week X van de cursus."

**Simulated PC.** `pc/editor.js`: a period-styled code editor (line
numbers, block cursor) preloaded with damaged Java or an empty stub +
Alberta's notes as comments. A "compileer & test" action runs the checker;
output appears in `pc/terminal.js` as simulated javac diagnostics and
CHECK_OK/CHECK_FAIL-style test lines (Dutch, friendly). Parsons and trace/
vind-de-fout/verklaar items run in the terminal UI.

**Checker.** `logic/checker/`: tokenize Java (strings/comments-aware),
normalize whitespace, then per-puzzle structural assertions (field
declared, constructor assigns `this.x = x`, signature exact, return
present, condition uses `&&`, loop bounds correct…). Tolerant of
formatting and (where sensible) local-variable naming. Wrong answers map
to simulated compile errors or failed checks with staged feedback. Unit
tests: every model solution passes; a curated list of typical student
mistakes fails with the intended message.

**Hints.** `?` anywhere; 3 stages per puzzle: course-metaphor nudge →
localization → structural shape (`this.veld = parameter;`), never the
literal answer. Hint use saved; playful non-punitive "Alberta's oordeel"
at the end.

**Save + variation.** localStorage: seed, level/puzzle progress, hint
counts, editor drafts. In-game `herbegin` command + `?seed=N` URL param
for deterministic QA runs. Seeded variation picks damaged-code variant
(2 per repair puzzle), Parsons shuffle, trace values from pools.

**Endgame.** Finishing level 7 "completes" Alberta's game: the PC boots
**Seven Little Goats** — a JS simulation of the Java text game running in
the terminal UI (same rooms, items, combat, 4 endings). Epilogue points
students to `seven-little-goats/` for the real Java source to run in
IntelliJ ("de broncode ligt op zolder — neem ze mee").

## Levels (each: notebook spread + ~3 puzzles; 1 editor-based + 2 terminal)

| L | Scharnier (na week) | Restores (Java files) | Formats |
|---|---------------------|-----------------------|---------|
| 1 | klasse/instantie, velden, constructor, this (1) | Voorwerp, Geitje | repair constructor; write Geitje from notes; verklaar blauwdruk/doos |
| 2 | signaturen: return vs void, param/lokaal (2) | Speler | repair signatures; Parsons method; trace shadowing |
| 3 | voorwaarden: validatie ×3, cascade, &&/\|\|/! (2) | Speler.setLevenspunten, Gevecht | repair clamp; vind-de-fout && vs \|\|; trace cascade |
| 4 | referenties: twee pijlen één doos, null (3) | Kamer, Spel.verbindKamers | repair neighbor wiring; trace aliasing; verklaar null |
| 5 | lus-romp + patroonkeuze (4) | loop methods (tel/opbouw/filter/uiterste) | write 2 loops from notes; Parsons string-builder; welke patroonkaart |
| 6 | index & off-by-one, welke lus (5) | Kamer.verwijderVoorwerp, Gevecht rounds | repair off-by-one; trace indices; vind-de-fout loop choice |
| 7 | zoeken + dubbele pijl (6) | Spel.zoekGeitje, endgame chain | write search loop returning Geitje/null; repair null-safe getter chain; trace chain |

Levels 1–3 before toets 1, 4–6 before toets 2, 7 before eindtoets; table
lives in `docs/levels-en-checkpoints.md`. All puzzle Java = fragments of
the real `seven-little-goats/src` files; a Node tool (`tools/check-assets`)
verifies model-repaired puzzle code ≡ the pristine Java fragment.

## Seven Little Goats (the Java prize)

Opening keeps game 1's ending deliberately ambiguous (all four endings stay
canon). ~10 kamers: geitenhuisje (klokkast, jongste geitje) → dorpsplein →
molen (bloem) → kruidenier (krijt) → bospad → oude eik (raaf cameo) →
grootmoeders huisje (zilveren schaar callback) → wolvenspoor → rivieroever
(showdown). `Geitje` + `Schuilplaats` exist to serve scharnier 7's double
arrow (`geitje.getSchuilplaats().getKamer().getNaam()`). Endings: *De
schaar en de stenen* (best), *De afrekening*, *De les* (mercy), game over.
Fully documented, course-bounded, own README ("run and study me"), Test*
classes in the predecessor's plain-main style. The JS sim mirrors it; QC
compares transcripts of identical command scripts between `java Main` and
the browser sim.

## Art

New extended VGA-ish palette (`js/palette.js`, ~64–256 indexed colors);
renderer stays index-based so gfx.js needs only palette swap + relaxed
EGA guards. `docs/art-stijlgids.md` defines the palette and LSL/SCI1-ish
style. Scene inventory kept small: title card, ~3–4 attic/house rooms,
1 notebook-spread template (re-dressed per level), PC screen chrome,
ending card. Sprites: player character (4 directions), a few props.

## Walkthrough pipeline

Markdown → `pandoc --pdf-engine=typst` with custom `zine.typ` (Courier
body, photocopied-zine furniture, full-page "VERBREEK HET ZEGEL" before
deel 2). Covers adventure part + all puzzles: deel 1 copious hints, deel 2
full solutions. pandoc + typst verified present.

## Execution model

Main session (me) is **manager/QC**: spawns one **Opus worker agent** per
work package (Agent tool, model "opus"), reviews output against acceptance
criteria, runs the checks, writes the `workflow/NN-*.md` entry, then
commits + pushes atomically. No commit without passing QC.

## Work packages (each = one worker, one atomic commit + push)

| WP | Content | Manager QC before commit |
|----|---------|--------------------------|
| 0 | Repo init: README, CLAUDE.md, .gitignore, skeleton, workflow/README | files exist; git clean |
| 1 | docs/: all design contracts (backstory, roberta-williams, both spelontwerpen, levels-en-scharnieren, engine-architectuur, checker-contract, art-stijlgids, save-en-hints) | level table & class lists match this plan; Dutch; 80-col; consistent |
| 2 | seven-little-goats/: complete Java game + README + Test classes + piped-input ending scripts | `javac -d out src/*.java` clean; `grep -nE 'switch|enum|->|Stream|\bvar '` empty; scripts reach all 4 endings; Test* all-OK |
| 3 | Engine port: palette (VGA), gfx/font/input/sound adaptation, engine loop, parser, world/strings for attic, save (localStorage), variation, hint service; 1 attic room + placeholder art; Node tests + Playwright smoke | opens from file://; walk + parser works; save survives reload; `node --test` green |
| 4 | Checker: tokenizer, asserts, javacsim + unit test corpus (model solutions + typical mistakes) | `node --test` green incl. corpus; docs/checker-contract.md honored |
| 5 | Simulated PC: editor, terminal, parsons UI + dummy level exercising every puzzle type end-to-end | Playwright scripted dummy-level run passes; hints staged; drafts persist |
| 6 | Attic adventure content: remaining scenes, notebook-spread template, sprites, story intro/outro prose | scenes lint clean; playable hub flow L-intro → PC → return |
| 7 | Levels 1–3 (damaged variants ×2, model solutions, hints, spreads) | Playwright model-solution run passes per level + both variants; check-assets ≡ pristine Java |
| 8 | Levels 4–7 (same shape) | same criteria per level |
| 9 | Seven Little Goats JS sim + endgame integration + finale prose | transcript cross-check JS sim vs `java Main` on scripted command sets (all 4 endings); full seeded L1→L7→sim Playwright run |
| 10 | Walkthrough deel 1 + deel 2 + zine.typ + build script | both PDFs render; solutions spot-checked against real level data; seal page present |
| 11 | Polish: README final, docs sync, timed ~2 h dry run, fresh-clone test | open index.html from fresh clone → plays; README instructions literally followed; timing plausible |

## Verification (end-to-end)

- Node `--test` for logic/checker/levels (DOM-free, remake-90s pattern);
  Playwright for browser smoke + seeded scripted playthroughs.
- WP 2: four Java endings via piped scripts; course-bounds grep.
- WP 7–9: check-assets guards puzzle↔Java drift; both variants of every
  repair puzzle solved by model solutions; sim-vs-Java transcript diff.
- WP 11: full timed manual playthrough; fresh-clone file:// smoke test.

## Risks

- Checker false negatives on valid student Java → tolerance rules in
  checker-contract.md + mistake corpus grown during level WPs; hints free.
- JS sim drifting from the Java game → transcript cross-check in QC.
- 2 h calibration is a guess → timed dry run in WP 11.
- VGA art effort → small scene inventory; notebook spreads re-dress one
  template; dithering available where the palette falls short.
````
