# 30 — Alberta's stem in de Java-broncode

## Opdracht

WP 30 uit het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`, Bijlage B). Uit de prompt van
Lars: *"the code comments in the game that sound like a teacher
explaining something for the first time (students have already learned
these concepts, when they play these levels)"*. De broncode van _Seven
Little Goats_ is in de fictie Alberta's werk uit 1993 — haar commentaar
hoort een werknotitie aan zichzelf te zijn, geen les aan een beginner.
Een Opus 5-worker herschreef; de manager controleerde en committe.

## Aanpak

Alleen commentaar; geen enkele codregel, string of `println` is
aangeraakt (mechanisch geverifieerd: de diff bevat buiten
commentaarregels niets). De maatstaf voor de stem: de bestaande
"// Alberta's notitie"-blokken in `js/levels/` — kort, concreet, over
wat dít spel nodig heeft. Een commentaar mag nog steeds uitleggen
waaróm de code zo is ("nooit onder 0, anders herrijst een dood
geitje"-achtig), maar benoemt nooit het patroon en instrueert nooit de
lezer.

Representatief:

- "Een final constante: de bovengrens van de levenspunten ligt vast op
  20." → "Twintig is het plafond. Genoeg om een paar missers te
  overleven, te weinig om de rivier te halen zonder onderweg iets te
  eten."
- "De tel-patroonkaart: een teller die bij 0 begint en per treffer
  ophoogt." → "Voor de statusregel: hoeveel wapens draagt ze? Alles met
  kracht boven 0, dus het keukenmes wel en het mandje niet."
- "Let op de off-by-one: de lus loopt van 0 tot size() - 1, en na remove
  stoppen we meteen." → een reden uit het spel: wie één koek meeneemt,
  laat de andere op de kraam liggen.
- "Dit is de zoeklus van scharnier 7." (cursusjargon ín de fictie van
  1993, de ergste van de lijst) → "Het geitje met die naam, of null als
  er hier geen zo heet. Voorlopig vraag ik enkel naar het jongste; op
  het einde loop ik ze alle zeven af."

Het klaslokaal-"we" is overal uit het commentaar (Alberta schrijft
alleen; ik-vorm of onpersoonlijk). In `js/levels/` zijn de twee
afgedreven notities hersteld: level 5 is geen opgavebrief met
signatuur-bullets meer maar een kantlijnnotitie ("twee kaarten in de
kantlijn"), en level 7 zet niet langer de lusstappen op een rij die
hintfase 3 hoorde te bewaren — de notitie zit nu op het niveau van
hintfase 1 (het beeld van de speurtocht, niet de stappen).

## Beslissingen

- **Ook de testklassen zijn meegenomen.** "Cursusstijl-test" in de drie
  Test*-headers was cursusjargon buiten de lijst van de verkenning;
  alle drie openen nu in Alberta's stem ("Geen framework, ik lees de
  uitvoer zelf.").
- **"Twee pijlen naar één doos" is uit de Java-comments verdwenen**,
  hoewel het eerder metafoor dan patroonlabel is: in de broncode las
  het als het leerinstrument van level 4, niet als een werknotitie. De
  metafoor blijft bestaan waar hij hoort — in het notitieboek en de
  spread van level 4.
- **level5-notitie behoudt de typewoorden `int` en `Voorwerp`**: de stub
  geeft geen signaturen en de checker eist ze exact; zonder die woorden
  is de puzzel vanuit de notitie niet oplosbaar. Ze staan in proza, niet
  in bullets.
- **Twee waarom-notities blijven staan** hoewel ze mechaniek noemen:
  de double-cast in `Gevecht` (over wat de speler op het scherm ziet)
  en de drempel-0 in `Tegenstander`. Het zijn redenen, geen lessen.
- **Meegefixt door de manager:** `js/sim/goats-world.js:138` droeg
  hetzelfde "scharnier 7"-jargon in een engine-commentaar; nu "Spiegelt
  Spel.zoekGeitje". De `scharnier`-vermeldingen in de
  `js/levels/*.js`-bestandskoppen blijven: dat zijn
  ontwikkelaarscommentaren die het level aan zijn scharnier koppelen,
  onzichtbaar voor de speler en nuttig voor onderhoud.

## QC-resultaat

Door de worker gedraaid en door de manager onafhankelijk herhaald:

- Diff mechanisch gecontroleerd: uitsluitend commentaarregels gewijzigd.
- `javac -encoding UTF-8` schoon (exit 0); verboden-constructies-grep
  leeg.
- Jargon-grep (`scharnier|patroonkaart|klassieke|les [0-9]|cursus`) over
  `seven-little-goats/src/*.java`: leeg. De enige "we"-overlevenden zijn
  dialoog in `println`-literals (de smekende wolf), geen commentaar.
- `node --test test/test-*.mjs` — **328/328 groen**;
  `tools/check-assets.mjs`: "Geen drift: alle 9 editor-modellen komen
  byte-getrouw uit de broncode."
