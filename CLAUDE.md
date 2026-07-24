# CLAUDE.md — The Legacy of Alberta

An educational browser game for the Java course Programming Fundamentals
(Thomas More). You inherit grandmother Alberta's attic and finish her
unfinished Java text-game sequel "Seven Little Goats"; each of 7 levels
drills one scharnier of the course by repairing or writing course-bounded
Java. The repo doubles as a genAI-workflow showcase.

## Hard constraints

- **Vanilla JS, no build step.** No bundler, no transpiler, no framework.
- **Must run from `file://`.** Double-clicking `index.html` has to work. Use
  plain `<script>` tags or native ES modules that load over `file://`; never
  assume a dev server.
- **Zero runtime dependencies.** Nothing from npm ships to the browser. Dev
  tooling (Node test runner, Playwright) is allowed but never required to
  play.
- **All game prose in Flemish Dutch.** No Hollandisms. Tech terms stay
  English (parser, selector, deploy). Prose lives centralized in strings
  files, never inline in logic.
- **All Java strictly course-bounded.** No `switch`, no streams, no `enum`,
  no `var`, no lambdas, no ternary, no inheritance/interfaces, no collections
  beyond `ArrayList<>`. Dutch class and field names (Voorwerp, Geitje,
  levenspunten). This applies to the `seven-little-goats/` source AND to
  every Java fragment inside puzzles.

## Architecture contract

- **DOM-free logic.** Everything in `js/logic/` (world, levels, checker) is
  headless and Node-testable. Logic functions return `{tekst, effecten}`;
  the render/engine layer applies effecten to the DOM. Logic never touches
  `document`, `window`, or the canvas.
- **Flat, serializable state.** Game state is a plain object that
  round-trips through `JSON.stringify` for localStorage saves. No class
  instances, no functions, no cycles in state.
- **Prose centralized.** All player-facing strings live in the strings files
  (`js/logic/strings.js`, `js/sim/goats-strings.js`). Logic references keys,
  not literals.
- **Reuse the remake-90s engine.** The renderer, font, input, sound, and
  parser are adapted from
  `~/-work/programming/revenge-of-red-riding-hood/remake-90s/`. Preserve its
  contracts (palette-indexed renderer, `?` hint command, headless logic).
  Adapt and credit; do not reinvent.

## Tests

- `node --test test/` — DOM-free logic, checker corpus, level model
  solutions. This is the primary gate; keep it green.
- Playwright smoke and scripted playthroughs come later (browser side). Not
  required to run the game.
- WP 2 gate for the Java prize: `javac -d out src/*.java` clean and
  `grep -nE 'switch|enum|->|Stream|\bvar '` empty.

## Design contracts

The authoritative design lives in `docs/` (backstory, roberta-williams,
both spelontwerpen, levels-en-scharnieren, engine-architectuur,
checker-contract, art-stijlgids, save-en-hints). Code must honor these
documents; when code and a doc diverge, fix one of them in the same work
package. Keep them in sync — the docs are the contract, not commentary.

## Conventions

- Markdown documents wrapped at 80 characters; sentence case in headings,
  never title case.
- The `workflow/` narrative log gets one numbered entry per work package
  (opdracht, aanpak, beslissingen, QC-resultaat).
- Commits are atomic: one per work package, only after QC passes. Worker
  agents create files; the manager commits.

## Working agreements

These bind every session, including one that has never seen the plan it is
executing. The point is that the repo itself carries enough state to resume
after a crash, a context reset, or a handover.

- **Write the programme down before touching code.** A multi-package effort
  starts with a kickoff entry in `workflow/` that records the prompt verbatim
  (in its original language), the questions asked and the answers given, the
  decisions with their reasons, and the approved plan in full as an appendix.
  `workflow/15-opwaardering-kickoff.md` is the worked example.
- **Keep a live checklist.** `workflow/voortgang.md` carries the current state:
  one line per work package and per subtask, with the QC gate spelled out. It
  is updated in the *same* commit as the work it describes, never afterwards.
  A resuming session reads it first.
- **One commit per work package, atomic, only after its QC gate passes.** Never
  commit a package that is half done — split it into two packages instead.
- **Log the decisions, especially the ones that deviate.** Every non-trivial
  choice goes in the work package's entry with its reason. When the
  implementation departs from what the plan said, that departure and its cause
  are the most important thing in the entry.
- **Verify before you claim.** Findings go in an entry only after they have
  been reproduced — run the test, read the file, capture the screenshot. Report
  what was measured, and say plainly when a gate did not pass.
- **Docs move with the code that contradicts them**, in the same package (see
  Design contracts above). That includes `walkthrough/` when game prose or
  scene names change: both parts get rebuilt.
