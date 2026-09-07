# 51 — Scharnieren heten checkpoints

## Opdracht

Lars, op 7 september 2026, na dezelfde hernoeming in de cursusrepo: *"Er is
een lokale clone van de alberta game normaal in ~/-work/programming voer de
verandering naar checkpoint daarin door en commit."* De cursus noemt de zeven
mastery-momenten sinds vandaag _checkpoints_ (het checkpoint, de checkpoints),
repo-breed, met als reden: binnen een jaar weet niemand nog waarom het ooit
scharnieren heette, dus geen twee namen naast elkaar. Dit spel gebruikte de
oude naam in zijn docs, README, commentaar, tests en de walkthrough.

## Aanpak

Eén geordende perl over alle getrackte tekstbestanden, behalve de genummerde
entries in `workflow/`: eerst het onregelmatige meervoud (scharnieren →
checkpoints, scharnierpunten → checkpoints), dan de stam (scharnier →
checkpoint), zodat ook samenstellingen meegaan (scharnierterm →
checkpointterm, scharnier-metafoor → checkpoint-metafoor). Het
contractdocument `docs/levels-en-scharnieren.md` heet nu
`docs/levels-en-checkpoints.md`; elke verwijzing ernaar, ook in de genummerde
entries, wijst naar de nieuwe naam.

Spelersgericht veranderde alleen de walkthrough: de cursieve regel onder elke
hoofdstuktitel in deel 1 ("*Checkpoint: klasse en instantie, …*"). Beide PDF's
zijn herbouwd met `bouw-walkthrough.sh`. In `js/` en `test/` raakte de
hernoeming uitsluitend commentaar en de veldnaam `checkpoint` in de
checker-corpus; geen spelerstekst in `strings.js`, geen hoofdstuktitel, geen
hint droeg het woord.

## Beslissingen

- **De genummerde workflow-entries blijven staan zoals ze geschreven zijn**,
  op de bestandsnaam van het hernoemde document na. Ze zijn het chronologische
  logboek (`workflow/README.md`, `voortgang.md`, §Conventies); deze entry is de
  plek die de hernoeming vastlegt. Wie in een oude entry "scharnier" leest,
  weet via deze entry wat het geworden is.
- **Grammatica onveranderd.** "Het scharnier" en "het checkpoint" zijn allebei
  onzijdig, dus geen lidwoord of verbuiging hoefde mee.
- **Bijvangst, geen wijziging in de repo:** de sim-cross-check compileert de
  Java alleen als `seven-little-goats/out/Main.class` ontbreekt. Op deze machine
  stond daar een verouderde build van vóór WP 29 ("de een zweert"), waardoor
  vier cross-checks zakten die niets met de hernoeming te maken hadden. Eén
  `javac -encoding UTF-8 -d out src/*.java` verhielp het. De map is gitignored.

## QC-resultaat

Gemeten na de hernoeming en de hercompilatie: `node --test` 454/454 groen,
`check-docpaden` 0 dode paden in een contractdocument (27 historische in
`workflow/`, geen poort), `check-walkthrough` 277 citaten en koppen, 0
afwijkingen, `lint-scene` en `check-assets` schoon, `npm run smoke` geslaagd
(een eerste run zakte op één timinggevoelige controle, de herhaling niet).
`git grep -i scharnier` vindt buiten de genummerde entries niets meer.
