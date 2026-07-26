# 50 — De ide kent geen zolder

## Opdracht

Gemeld door Lars op PR #5: *"Click escape - Terug naar de zolder moet
Click escape to exit zijn. De ide heeft geen weet van een zolder."* De
pc-chrome is in de fictie een programma uit 1993 — Alberta's Edit weet
niet dat de machine op een zolder staat. Vier teksten braken dat.

## Aanpak

Gegrept op alle zolder-vermeldingen in de pc-laag en de vier
spelersgerichte chrome-teksten vervangen door programmataal:

- `pc.menuOnder`: "Esc — terug naar de zolder." → "Esc — afsluiten."
- `pc.typHint` (terminal): "Esc voor de zolder." → "Esc sluit af."
- `pc.editorGeladen`: "Esc keert terug naar de zolder." → "Esc sluit
  af."
- `pc.balkZolder: "Zolder"` (menubalk en F-toetsenbalk) → hernoemd naar
  `balkAfsluiten: "Afsluiten"`; in `js/pc/pc.js` gingen de verwijzingen
  en de functienaam (`sluitNaarZolder` → `sluitAf`) mee.

Wat bleef: beschrijvingen van het gedrág ("Escape keert terug naar de
zolder") in testcommentaar, docs en walkthrough — dat is de
buitenwereld die over het spel praat, en het klopt: Esc brengt je wél
terug naar de zolder. Alleen het programma zelf mag het niet weten.

## Beslissingen

- "Afsluiten" boven het Engelse "Exit": de rest van de chrome is
  Nederlands ("Compileer", "Hint", "Menu") en een Vlaamse dev in 1993
  schreef haar menubalk in haar eigen taal.

## QC-resultaat

Geen enkele test pinde de oude teksten. `node --test` 450/450 groen,
`check-walkthrough` 0 afwijkingen, `smoke-pc` 44/44 groen.
