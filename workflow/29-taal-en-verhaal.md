# 29 — Taal en verhaal (proza)

## Opdracht

WP 29 uit het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`, Bijlage B): de taalfouten en de
verhaal-bug uit de verkenning herstellen, met de wolf-zin voorop. De
opdracht komt rechtstreeks uit de prompt van Lars: *"the phrase zes
geitjes gingen in de wolf -> de wolf slokte 6 geitjes op (or sth else
that at least sounds like correct Dutch (Flemish)"*. Een Opus 5-worker
voerde uit; de manager controleerde en committe.

## Aanpak

De worker las eerst de kickoff-entry (defectenlijst A.3) en werkte de
veertien punten af, met de spiegelregel als harde randvoorwaarde: de
sim-prose (`js/sim/goats-strings.js`) spiegelt de
`System.out.println`-regels van de Java-broncode woordelijk, en de
backstory staat ook in `seven-little-goats/README.md`. Elke wijziging
daar is dus een gesynchroniseerde drie-bestandenwijziging. Terminalregels
zijn voorgewrapt: elke herschreven regel bleef binnen de langste
bestaande backstory-regel (56 tekens).

De kern:

- **De wolf-zin.** "open. Zes gingen naar binnen — in de wolf." werd
  "open. De wolf slokte er zes op." — de geitjes waren al binnen; het was
  de wolf die naar binnen ging, en "gaan in de wolf" is geen Nederlands.
  In `strings.js:47` werd "zes geitjes die de wolf binnengaan" om
  dezelfde reden "zes geitjes die de wolf opslokt".
- **De verhaal-bug.** De backstory beweerde dat het jongste geitje naar
  jou toe kwam, terwijl het in het spel de hele tijd in de klokkast zit.
  Herschreven: het geitje blijft in de klokkast, riep tot iemand het
  hoorde, en het bericht bereikte jou — de enige met verstand van wolven.
- **Register en kleinigheden.** "de een … de ander" → "de ene … de
  andere"; "dit keer" → "deze keer" (was al inconsistent binnen één
  bestand); "wiret" → "verbindt"; "De spanning stijgt." geschrapt (de
  beelden ervoor doen het werk al); "weg gesleten" → "afgesleten"; het
  hint-antecedent benoemt nu de koeken; "(praat)" is in de hintzin
  geïntegreerd; de stop-tekst beweert niet langer dat je een mes neerlegt
  dat je misschien nooit oppakte; commentaar-typo en trailing comma in
  `strings.js`.

## Beslissingen

- **`eet melk` bleef als commando; de prose werd werkwoord-neutraal.**
  Het commandowoord wijzigen is logica (vier dispatch-plekken plus
  testscripts) en valt buiten dit pakket. "Je drinkt…" als antwoord op
  `eet` bleef de mismatch; het antwoord is nu "Je zet de kruik melk aan
  je mond. +6 LP (nu N)." en het help-label "leeg de kruik melk (+6 LP)".
- **Geen em-dash geforceerd in de nieuwe wolf-zin.** "De wolf slokte er
  zes op — …" leest alleen natuurlijk met verzonnen extra materiaal; de
  korte zin is sterker.
- **Extra vondst meegefixt:** `README.md:136` bevatte nóg een "wiret",
  buiten de vier vindplaatsen uit de defectenlijst. Zelfde pakket, zelfde
  fix.
- **Bewust niet aangeraakt:** `nietsOmInTeDragen` ("Je hebt niets om ze
  in te dragen.") heeft dezelfde "ze"-constructie, maar dáár is het
  antecedent gedekt door de context (het vuurt alleen op `pak koek`) en
  de regel wordt door `test-sim-world` geasserteerd.
- **`spelontwerp-seven-little-goats.md` volgt de nieuwe formulering.**
  Het doc zei al correct "Zes werden opgeslokt"; het is gelijkgetrokken
  met de nieuwe zin zodat er geen twee varianten bestaan.
- De walkthrough bleek geen enkele gewijzigde zin te citeren (gegrept op
  alle tien de oude formuleringen); de PDF-herbouw blijft WP 39.

## QC-resultaat

Door de worker gedraaid en door de manager onafhankelijk herhaald:

- `node --test test/test-*.mjs` — **328/328 groen**, inclusief
  `test-sim-cross-check` tegen de échte `java`-run (vier scripts, alle
  vier "identiek in Java en sim").
- Extra levende diff over een route die élke gewijzigde regel raakt
  (hints, help, melk, wolvenspoor, stop): 120 regels java = 120 regels
  sim, nul verschillen.
- `javac -encoding UTF-8` schoon; verboden-constructies-grep leeg.
- Drie-weg-identiteit van de backstory mechanisch bewezen: alle 24
  `backstory`-regels zijn teken voor teken gelijk aan de
  `Main.java`-printlns, en de README-alinea's zijn gelijk aan de
  JS-regels samengevoegd op witruimte.
