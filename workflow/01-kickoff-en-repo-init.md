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
