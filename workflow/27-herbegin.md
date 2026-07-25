# 27 — Herbegin

Geen werkpakket uit het opwaarderingsprogramma maar een foutmelding erna, van
Lars: *"The herbegin command doesn't work."*

## Opdracht

Het commando `herbegin` werkte niet. Meer stond er niet bij, dus het eerste werk
was uitzoeken wát er niet werkte.

## Wat er kapot was

Drie dingen, en het eerste is de eigenlijke fout.

### De bevestiging was onmogelijk te typen

`herbegin` opent een venster met de vraag: *"Typ 'herbegin ja' om het te
bevestigen."* Elk venster in dit spel zet `AL.input.blokkeer` op waar — een open
venster slikt alle tekens op en laat alleen Enter en spatie door om weg te
klikken. Dat is juist voor een mededeling en fataal voor een vraag.

Wie deed wat het venster vroeg, kreeg dit:

| Aanslag | Wat er gebeurde |
|---|---|
| `h e r b e g i n` | geslikt door de blokkade |
| spatie | **klikte het venster weg** |
| `j a` | belandde in de invoerbalk |
| Enter | `ja` verstuurd → "Dat begrijp je niet." |

De spatie ín het antwoord was de moordenaar. Het spel vroeg om iets te typen op
het enige moment dat typen onmogelijk was, en at de vraag zelf op halverwege het
antwoord. Nagemeten in Chromium over `file://`, vóór de fix: de invoerregel
stond na `page.keyboard.type("herbegin ja")` op `"ja"`.

Er wás een uitweg — eerst wegklikken met Enter, dán `herbegin ja` typen — maar
niets in het spel wees erop, en de vraag stond op dat moment niet meer op het
scherm.

### De herbegin was niet te zien

Wie de uitweg toevallig vond, kwam terecht in dezelfde hoek waar hij stond, met
één regel tekst: *"De zolder ligt er weer bij zoals je hem vond."* Zelfde kamer,
zelfde sprite, zelfde muziek. Er is geen zichtbaar verschil tussen een zolder
die net gereset is en een zolder die dat niet is — de voortgang zit in het
notitieboek, niet in het beeld. Dus ook op het pad dát werkte, zag het eruit
alsof het commando niets deed.

### En de doc zei al wat het had moeten doen

`workflow/19-de-opening.md` schreef bij WP D op waarom er geen save-veld nodig
was voor "opening gezien":

> wie `herbegin` doet, kiest expliciet voor opnieuw beginnen en krijgt dan ook
> de opening opnieuw — wat juist klopt.

Dat is nooit geïmplementeerd: `voerHerbeginUit()` riep `betreedZolder(true)`
rechtstreeks aan en sloeg de reeks over. `CLAUDE.md` vraagt dat code en doc in
hetzelfde pakket in de pas gaan; hier had de doc gelijk en de code niet.

## Aanpak

### Een venster dat op een antwoord wacht

De invoerblokkade is een eigenschap van *het venster* geworden in plaats van
van *het hebben van* een venster. `AL.gfx.maakVenster` kent nu `vraag: true`, en
`syncBlokkeer` laat de invoerbalk vrij zolang dat vlaggetje staat.

De logica-laag zegt zelf wanneer haar tekst een vraag is: `herbeginVraag` geeft
`effecten: ["vraag"]` terug. Dat houdt de beslissing DOM-vrij en Node-testbaar,
net als de rest van de laag, en het maakt van de vraagvorm een gewone effect-tag
in plaats van iets dat de renderer uit de tekst moet raden.

Wat er verder aan hangt:

- **Elk commando beantwoordt de vraag.** `opCommando` sluit het vraagvenster
  voor het parst, ook als het antwoord `kijk` is. De vraag blijft dus nooit
  boven een antwoord hangen.
- **Escape trekt de vraag in** en laat alles staan. Een vraag hoort een uitweg
  te hebben die niets doet, en Enter en spatie zijn dat niet meer: die typen nu
  mee in het antwoord.
- **Een vraagvenster mag niet pagineren.** Bladeren gaat via Enter en spatie, en
  die zijn hier bezet. Een test meet dat de herbegin-vraag op één pagina past.

### De herbegin toont de openingsreeks

`voerHerbeginUit()` zet de speler nu in de openingsreeks in plaats van in de
zolder. Dat is wat `19-de-opening.md` al beschreef, en het is meteen het
antwoord op "ik zie niet dat er iets gebeurd is": het huis van buiten, de
schemerlucht, de eerste alinea van de verteller. Dat kan geen zolder zijn die
toevallig al gereset was. Escape slaat de reeks in één toets over, dus wie voor
de vijfde keer herbegint betaalt er niets voor.

## Beslissingen

### De bevestigingsmelding is geschrapt

`herbeginBevestig` gaf tekst terug (*"De zolder ligt er weer bij zoals je hem
vond. Alles opnieuw."*) en `AL.strings.herbeginKlaar` is nu weg.

Dat is geen bezuiniging maar een volgorde-probleem. `verwerkResultaat` past
eerst de effecten toe en toont dán de tekst — dus het venster met die melding
kwam bovenop de eerste beat van de openingsreeks te staan en overschreef haar,
`naVenster` en al. Het alternatief was de melding uitstellen tot na het venster,
maar dan lees je "de zolder ligt er weer bij" en sta je vervolgens buiten voor
het huis: de mededeling loopt vooruit op een reeks die je nog naar die zolder
toe moet brengen.

De openingsreeks zegt hetzelfde beter. Een systeemregel die bevestigt wat het
beeld al laat zien, is een regel te veel.

### Waarom niet gewoon een J/N-prompt

De voor de hand liggende oplossing was de bevestiging op één toets zetten. Dat
lost de blokkade op door de vraag te vermijden.

Het is niet gedaan omdat het de bevestiging uit de logica-laag naar de engine
verhuist, en `js/parser.js` boekt uitdrukkelijk het tegenovergestelde:

> Bewuste conventie: de bevestiging is stateless en dus Node-testbaar.

Een J/N-prompt vraagt een engine-variabele die onthoudt welke vraag openstaat —
precies de staat die er niet mocht zijn. Bovendien botst J/N met de dismiss-
toetsen: Enter is dan tegelijk "wegklikken" en "ja", en dat is een reset op een
verkeerde aanslag. Het vlaggetje op het venster is kleiner én houdt de geboekte
conventie overeind.

### Het loopt niet tijdens een vraag

Typen en lopen mag in dit spel tegelijk (King's-Quest-stijl), maar `tik()` zet
de speler stil zolang er een venster staat, en dat geldt ook voor een
vraagvenster. Bewust zo gelaten: wie een vraag beantwoordt, wandelt niet
tegelijk de kamer uit — en de vraag hoort bij de kamer waar ze gesteld is.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/gfx.js` | `maakVenster` kent `vraag` |
| `js/logic/world.js` | `herbeginVraag` draagt de tag `vraag`; `herbeginBevestig` laat het beeld aan de openingsreeks |
| `js/logic/strings.js` | de vraag noemt Esc; `herbeginKlaar` weg |
| `js/engine.js` | `verwerkResultaat` geeft de tag door; `syncBlokkeer` en `opCommando` laten een vraag door; Escape trekt ze in; `startOpening()` afgesplitst; `voerHerbeginUit` start de reeks; `vensterVraag` in `debugState` |
| `docs/save-en-hints.md` | wat `herbegin` toont, en waarom de bevestiging getypt wordt |
| `docs/engine-architectuur.md` | `vraag` in de effect-woordenlijst |
| `test/test-world.mjs` | vier controles op de vraag, de bevestiging en beide parservormen |
| `test/test-typografie.mjs` | drie controles op het vraagvenster, waaronder dat het niet pagineert |
| `test/smoke-browser.mjs` | acht controles op de echte toetsenreeks |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **328 tests, 328 groen** (was 322).
- De zes rooksmaaktesten via `file://`: `smoke-browser` **36/36** (was 28),
  `smoke-pc` 32/32, `smoke-full-playthrough` 94/94, `smoke-levels-1-3` 32/32,
  `smoke-levels-4-7` 48/48, `smoke-sim` 13/13. Samen 255 controles.
- `node tools/lint-scene.mjs` schoon; `node tools/check-assets.mjs` driftvrij.
- De regressie meet de fout zoals ze gemeld is: `herbegin` typen, Enter, en dan
  `herbegin ja` typen **zonder tussendoor weg te klikken**. De invoerregel staat
  daarna op `"herbegin ja"` — vóór de fix stond ze op `"ja"`.
- Visueel bekeken: de vraag staat op het scherm terwijl `> herbegin ja` in de
  invoerbalk meegroeit, en Enter zet je in de eerste opening-beat met "Esc:
  overslaan" rechtsboven.
- Ook gecontroleerd: `herbegin` wist de voortgang echt (fragment 1 weer op
  slot), de seed verandert, en Escape op de openstaande vraag laat de seed
  ongemoeid.

`smoke-touch` draaide opnieuw niet — geen WebKit in deze container. Op een
aanraakscherm hangt het antwoorden aan hetzelfde toetsenbordpad, dus dat deel is
niet apart nagekeken.
