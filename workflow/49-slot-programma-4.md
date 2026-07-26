# 49 — Slot van programma 4

## Opdracht

Het sluitstuk van programma 4 (zie
`workflow/46-lineariteit-kickoff.md`): alle poorten in één run, verse
screenshots voor Lars, de eindstand in `voortgang.md`, en de schone
draft-PR van `claude/lineariteit-en-notities` naar main. Door de
manager zelf uitgevoerd.

## De poorten, gemeten op deze commit

- `node --test test/test-*.mjs` — **450/450 groen** (425 bij de start
  van dit programma; de 25 nieuwe bewaken de doospoort incl. een
  uitputtende toestandssweep, de puzzelvolgorde, de klassekaart-labels,
  de menutitels en de diskettebeat).
- Acht Chromium-smokes via `file://` — **380/380**: browser 46, walk
  38, geluid 30, pc 44, sim 19, levels-1-3 40, levels-4-7 58,
  full-playthrough 105.
- `javac -encoding UTF-8` schoon; verboden-constructies-grep leeg.
- Alle vier de linten op nul afwijkingen: lint-scene, check-assets,
  check-docpaden (1038 paden), check-walkthrough (277 citaten).

## Wat dit programma opleverde

- **WP 47 — de poort aan de doos:** blad N+1 is pas vindbaar als
  hoofdstuk N hersteld is; de weigering spreekt Alberta's schema uit;
  geen enkel publiek pad kan nog een hoofdstuk overslaan (bewezen met
  een sweep over alle bereikbare toestanden).
- **WP 48 — notities als spec:** de brieven en stub-notities dragen
  velden, types en signaturen — geen conceptles, geen spoilers; de
  l1-schets is een echte klassekaart.
- **WP 48b (ingelast) — puzzelvolgorde:** binnen een level loopt
  Alberta's lijst van boven naar onder; de trace kan de reparatie niet
  meer verklappen; level 2 herschikt; l6-titel geneutraliseerd.
- **WP 48c (ingelast, op vraag van Lars) — de diskette:** de herstelde
  broncode gaat als 1,44MB-diskette mee uit de pc, met de getekende
  kaart ("7 little goats" in haar hand) in de eindsequentie; de
  broncode-doos bevat haar oude werk en blijft dicht; alle
  terminal-puzzels kregen echte menutitels.

## Open punten

- De iPhone-luistertest (belschakelaar in beide standen) en het
  loopgevoel op het toestel — alleen op echt materiaal te beoordelen.
- `smoke-touch` vraagt WebKit; niet aanwezig in deze container.
- De PDF's staan in Liberation Mono tot een machine met Courier New ze
  herbouwt.

## QC-resultaat

Alle poorten hierboven groen op één werkkopie zonder onafgewerkte
wijzigingen; screenshots van de diskettekaart, de nieuwe spreads, het
vergrendelde menu en de epiloog aan Lars bezorgd; draft-PR aangemaakt.
