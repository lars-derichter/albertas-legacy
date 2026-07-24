# 15 — Opwaardering van presentatie en verhaal (kickoff)

Dit is de kickoff-entry van een tweede programma op deze repo. Waar de
werkpakketten 0 t/m 11 het spel *hebben gebouwd*, gaat dit programma over hoe
het *oogt, klinkt en verteld wordt*. Het loopt over elf werkpakketten (0 en
A t/m J), elk met een eigen entry en een eigen atomaire commit.

De levende stand van zaken staat niet hier maar in `workflow/voortgang.md`.
Deze entry is chronologisch en blijft staan zoals ze geschreven is; de
checklist verandert mee met het werk.

## Opdracht

Lars, na het spel zelf gespeeld te hebben:

> Look critically at this project and the game. At this moment it feels as we
> would say in Dutch 'knullig'.
> It is okay that it has a retro feel like a game of the early 90s and the
> ingredients for the gameplay are very much restricted because of the
> educational context, but I want it to look and feel more like an A-list game
> of the period than this.
> Start by making a priorised list of what could be improved and then make a
> plan for the execution of these improvements.

Op de eerste versie van het plan, dat alleen over presentatie ging:

> I also think that the storytelling could be somewhat improved. The story
> could be a bit more urgent and darker for me. Also it makes no sense that
> the backstory of the game is explained in what looks like the spread
> notebook. The player should know this backstory before searching for or
> finding the notebook.

Bij de goedkeuring:

> Start by documenting the prompt, the plan etc in the workflow documents.
> Commit atomically, keep loggging important decisions, save the plan as a
> checklist so that work can easily be picked up again after a crash etc.
> Add this to the plan and agent instructions and then start immediately with
> the implementation!

## Aanpak

Eerst kijken, dan lezen. Het spel werd in een headless Chromium vanaf
`file://` gedreven met `?seed=42` en `?dev=1`, en van elk scherm werd het
canvas als PNG uitgelezen: titelkaart, beide intropagina's, alle vier de
zolderscènes, het berichtvenster, het pc-menu, de editor, de compileeruitvoer,
de oordeelkaart en de epiloog. Daarna pas de documenten, en daarna de code.

Dat was de juiste volgorde. De schermafbeeldingen lieten dingen zien die uit
de code alleen niet opvallen — een lichtstraal die over de titel heen wordt
getekend, tekst die dwars door de rugschaduw van het notitieboek loopt, een
uitvoerpaneel dat zijn eerste regel afsnijdt.

Elke bevinding werd nagerekend voor ze in de lijst kwam:

- `node --test test/test-*.mjs` gedraaid: 225 tests, 224 groen, 1 rood.
- `java -XshowSettings:properties` gedraaid om de codering te bevestigen als
  oorzaak van die ene rode test.
- `js/logic/world.js` gelezen om te bevestigen dat `onderzoek` inderdaad de
  kamerbeschrijving teruggeeft, in plaats van dat aan te nemen.
- De strings via Node ingeladen om te zien welke intro echt ships en welke
  dode code is.
- Gegrepen naar wie `maakVenster` en `_wrap` aanroept — nul testbestanden, wat
  een van de duurdere werkpakketten aanzienlijk goedkoper maakt.

## Beslissingen

**De diagnose: het is geen ontwerpprobleem.** `docs/art-stijlgids.md`
beschrijft al precies de juiste ambitie — wijkende vloeren, één consequente
lichtbron, stof in de lichtstraal, schetsen in het notitieboek, painter's
order met een voorgrond. En de prose is goed. Wat ontbreekt is de uitvoering:
zes scènes met 173 draw-ops samen, waarvan ruwweg 78 % assen-parallelle
rechthoeken en lijnen. Twee scènebestanden noemen zich in hun eigen
kopcommentaar nog "placeholder-kwaliteit". De art-documenten zijn nooit tegen
de art zelf geaudit; WP 11 controleerde wel de andere contracten.

Daarom is de opzet: eerst de renderer het gereedschap geven waar de stijlgids
al om vraagt, dan pas hertekenen. Niet omgekeerd.

**Volledige overhaul, gefaseerd** — niet één grote commit. Elf pakketten, elk
met een eigen QC-poort. Na elk pakket staat het spel er beter voor en kan er
gestopt worden. Reden: dit raakt bijna elk bestand in `js/`, en een
onomkeerbare grote sprong is in een repo die als didactische showcase dient
het verkeerde signaal.

**Drie bindende afhankelijkheden.** WP 0 (dit) komt eerst, want zonder
logboek is er na een crash geen spoor van waarom iets zo besloten is. WP A en
B zijn fundering. En WP C (de tekst) komt vóór WP D en E (het beeld), omdat de
QC-poort van het scènewerk luidt "elk zelfstandig naamwoord in de
kamerbeschrijving moet aanwijsbaar zijn" — als de beschrijvingen daarna nog
veranderen, klopt de art opnieuw niet.

**Beeldkader op 4:3, met twee gehele schaalfactoren.** Het canvas staat nu als
vierkante-pixel 320×200, dus 16:10; echte VGA mode 13h werd op 4:3 getoond.
Exact 4:3 vraagt de verhouding 5:6, en dus 1600×1200, wat lang niet altijd
past. Daarom kiest het algoritme onder alle passende gehele paren dat paar dat
het venster het best vult en het dichtst bij 4:3 ligt. Twee gehele factoren,
dus geen ongelijke pixelrijen. Dit moet vóór al het tekenwerk landen: een
cirkel in de buffer verschijnt na de rek ongeveer 20 % breder, en de
Sierra-artiesten uit die tijd tekenden mét die rek in het hoofd.

**Typografie: de 8×8-font blijft, maar prose wordt proportioneel gezet.** De
glyphs vullen ~6 van 8 kolommen, wat prose breed en luchtig maakt — het leest
als een debug-font. Statusbalk, invoerbalk en terminal blijven monospace, want
daar is het periodejuist. Het notitieboek krijgt een echte schuine
handschriftfont; de stijlgids noemde die al als polish-ticket.

**Verhaal: kouder verteld, en de duisternis komt uit het spel zelf.** Lars wil
donkerder en urgenter. De regel "nooit een oorzaak noemen" uit
`docs/achtergrond.md` blijft echter staan: Alberta's verdwijnen wordt niet
verklaard. Wat verandert is het register, van warme weemoed naar kou en
onbehagen. En de bron van die duisternis is _Seven Little Goats_ zelf — zes
opgegeten geitjes, een wolf die opengelegd wordt, een einde dat "koud en onaf"
heet. Die spanning zit nu volledig opgesloten in de sim; het kader eromheen
laat er niets van blijken. Dat is waar de donkerte vandaan hoort te komen, en
het kost geen enkele nieuwe fictie.

**Urgentie: alleen toon, geen mechaniek.** Geen deadline, geen faalstaat, geen
verliesmechaniek. Reden: dit is vakmateriaal. Een speler die vastloopt of iets
onherstelbaar kwijtraakt is een groter probleem dan een spel dat te zacht
aanvoelt. Het staat-object, het save-formaat en de logica-laag blijven dus
onaangeroerd — wat ook het risico van dit programma flink drukt.

**De opening verhuist van het notitieboek naar het canvas.** Lars' opmerking
klopte, en het bleek scherper dan een volgordeprobleem. De engine stuurt titel
→ `spread:intro` → zolder, dus de openingstekst staat op het papier van
Alberta's notitieboek, met haar koffievlek en haar ezelsoor. Drie dingen
kloppen daar niet. De volgorde: je leest wat er in het boek staat voor je het
boek hebt. De stem: de pagina is haar handschrift, maar de tekst is de
verteller die de speler aanspreekt — "Je grootmoeder Alberta was
game-ontwerpster … Ze verdween." Dat kan Alberta niet in haar eigen boek
schrijven. En de kop van die pagina is de titel van het spel, terwijl de voet
zegt "Sla het notitieboek open. Daar begint het." — het notitieboek dat vraagt
om het notitieboek te openen. Bijkomend bleek `AL.strings.intro` te bestaan
als vier goed geschreven alinea's die door niets worden aangeroepen; wat ships
is een kortere doublure in `AL.strings.spreads.intro`. Die eerste wordt weer
de echte openingstekst.

Dit is dezelfde klasse fout als entry 14 (Alberta's stem die haar eigen schade
niet kan kennen). Toen is deze pagina gemist.

**Bereik van de herschrijving: kader en spreads, de sim ongemoeid.** De
sim-prose is al de donkerste in de repo en dient dus als bron, niet als doel.
Ze aanpassen zou bovendien de Java-broncode én de vier transcript-fixtures
meetrekken die `test-sim-cross-check` byte voor byte vergelijkt.

**Eén rode test wordt in WP A rechtgezet, niet later.**
`test-sim-cross-check` faalt omdat `Main.java` `ë`, `—` en gekrulde
aanhalingstekens via `System.out` schrijft met de platformcodering. In deze
container is `stdout.encoding` ANSI_X3.4-1968 en worden dat vraagtekens; op
een standaard Windows-console (cp850/cp1252) gebeurt hetzelfde. De Java-prijs
waar het hele spel naartoe werkt, print dus mojibake in zijn eigen
openingsverhaal. Dat is geen omgevingsartefact maar een echt
portabiliteitsdefect.

**Over het testaantal.** Entry 12 rapporteerde 229 tests; hier meet
`node --test test/test-*.mjs` er 225 op Node v22.22.2. Er zijn geen
testbestanden verdwenen — `node --test` telt subtests over versies heen
anders. Vanaf hier is 225 het referentiepunt, met 224 groen als vertrekpunt en
225 groen als poort na WP A.

## QC-resultaat

WP 0 raakt geen enkele regel code, dus er is niets te regresseren. Wat wel
gecontroleerd is:

- `node --test test/test-*.mjs` — 225 tests, 224 groen, 1 rood
  (`test-sim-cross-check`, zie hierboven). Dit is het vastgelegde vertrekpunt.
- `git status` schoon op `claude/game-polish-improvements-rhlk70` vóór de
  eerste wijziging.
- `workflow/15-opwaardering-kickoff.md` en `workflow/voortgang.md` bestaan en
  zijn consistent met het goedgekeurde plan.
- `CLAUDE.md` draagt de werkafspraken, zodat ze ook gelden voor een sessie die
  dit plan nooit gezien heeft.
- Markdown afgebroken op 80 tekens, sentence case in de koppen, Vlaams
  Nederlands; de prompts van Lars staan in hun oorspronkelijke Engels, zoals
  `workflow/README.md` vraagt.

## Bijlage A — het bewijsmateriaal

De schermafbeeldingen die de lijst onderbouwen, gemaakt met de echte engine
(headless Chromium, `file://`, `?seed=42`), en wat er op te zien was:

| Scherm | Wat het liet zien |
|---|---|
| titelkaart | de lichtstraal wordt over de titel getekend; "ALBERTA" is onleesbaar |
| intro, pagina 1 | verteller-tekst op notitieboekpapier, vóór het boek gevonden is |
| intro, pagina 2 | tekst loopt dwars door de rugschaduw en over de koffievlek |
| `zolder-west` | de hele kamer is ~15 platte rechthoeken; het raam is een blauw vlak met een zwart kruis |
| `zolder-midden` | de lichtwig is een hardgerande volvlakke oranje veelhoek |
| `zolder-oost` | de tekst belooft mok, stoel, toren en bolle monitor; het beeld toont drie blokken |
| `overloop` | grijze vlakken; een zwarte vierhoek rechtsonder leest als een fout |
| berichtvenster | beige doos, 1 px-kader, ASCII-kop, dekt de scène af |
| pc-menu en editor | het best uitgewerkte scherm, maar afgeronde hoeken en Courier New |
| compileeruitvoer | CHECK_OK en CHECK_FAIL in dezelfde amberkleur; bovenste regel afgesneden |
| oordeelkaart | dezelfde z-orde-fout, op de climax van het spel |
| epiloog | het venster dekt de eindkaart volledig af |

## Bijlage B — het goedgekeurde plan

# Visuele en zintuiglijke opwaardering van The Legacy of Alberta

## Context

Het spel is functioneel compleet: zeven levels, een Java-checker, een
speelbare simulatie, een walkthrough, groene tests. De *presentatie* loopt
daar ver op achter. Het speelt als een correct prototype, niet als een
A-titel uit 1990.

Belangrijk: dat is geen ontwerpprobleem. `docs/art-stijlgids.md` beschrijft
precies de juiste ambitie — wijkende vloeren, één consequente lichtbron,
stof in de lichtstraal, schetsen in het notitieboek, painter's order met een
voorgrond. Ook de prose is goed ("een lege stoel die net verlaten lijkt",
"een bolle monitor die warm oranje nagloeit"). Wat ontbreekt is de
*uitvoering*: de scènes zijn een eerste doorloop van ~15 tot 30 platte
draw-ops, de renderer mist het gereedschap voor gradiënten en schaduw, en er
is nul beweging, nul overgang en nauwelijks geluid.

Het doel: het beeld en het gevoel op het niveau van Sierra SCI1 /
Legend Entertainment brengen, binnen de harde projectregels (vanilla JS,
`file://`, nul runtime-dependencies, palet-geïndexeerd 320×200).

## Bewijs

Screenshots gemaakt met de echte engine (headless Chromium, `?seed=42`):
titelkaart, intro-spread, alle vier de zolderscènes, het berichtvenster, de
pc-overlay, de oordeel- en epiloogkaart.

## Geprioriteerde lijst van wat beter moet

### P0 — leest als kapot

1. **Z-orde-fout op de titelkaart en de oordeelkaart.** De lichtstraal wordt
   *over* de titeltekst getekend; "THE LEGACY OF ALBERTA" en "Alberta's
   oordeel: …" zijn onleesbaar. (`js/engine.js`, `tekenTitelKaart`,
   `tekenOordeelKaart`)
2. **De notitieboek-spread negeert zijn eigen twee-pagina-indeling.** De
   tekst loopt dwars door de rugschaduw en over de koffievlek heen; koppen
   worden door de rug afgesneden; de bladerhint valt rechts van het scherm;
   de paginateller botst met de weekregel. (`js/scenes/scene-spread-template.js`,
   `js/engine.js` `tekenSpread`)
3. **De lichtwiggen in `zolder-midden` en `zolder-oost`** zijn grote,
   hardgerande, volvlakke oranje veelhoeken. Ze lezen niet als licht maar als
   een onafgewerkte polygoon.
4. **`test-sim-cross-check` staat rood.** Geverifieerd: 224 van 225 tests
   slagen. `Main.java` schrijft `ë`, `—` en gekrulde aanhalingstekens via
   `System.out` met de platform-standaardcodering; met `stdout.encoding`
   ANSI/cp850/cp1252 — de standaard op een Windows-console — worden dat
   vraagtekens. De prijs waar het hele spel naartoe werkt, print mojibake
   in zijn eigen openingsverhaal.
5. **`onderzoek` herhaalt de kamerbeschrijving.** In `js/logic/world.js:168`
   geven `onderzoek pc`, `onderzoek stoel`, `onderzoek koffiemok` én
   `onderzoek broncode-doos` letterlijk de alinea terug die je net gelezen
   hebt. Het hele spel heeft twee unieke onderzoeks-teksten. Wie een detail
   verwacht, krijgt de kamer opnieuw — dat leest als onaf, ook al is de
   prose goed.
6. **De achtergrond wordt verteld op een bladzijde van het notitieboek — vóór
   de speler het notitieboek gevonden heeft.** De engine stuurt titel →
   `spread:intro` → zolder (`js/engine.js:250`), dus de openingstekst wordt
   op het papier van Alberta's notitieboek gezet, met haar koffievlek en haar
   ezelsoor. Twee dingen kloppen daar niet. De volgorde: je leest wat er in
   het boek staat voor je het boek hebt. En de stem: de pagina is Alberta's
   handschrift, maar de tekst is de verteller die jou aanspreekt — "Je
   grootmoeder Alberta was game-ontwerpster … Ze verdween." Dat kan Alberta
   niet in haar eigen boek schrijven. De kop van de pagina is bovendien de
   titel van het spel, en de voet zegt "Sla het notitieboek open. Daar begint
   het." — het notitieboek dat vraagt om het notitieboek te openen.
   Bijkomend: `AL.strings.intro` bestaat als vier goed geschreven alinea's en
   wordt door niets aangeroepen; wat ships is een kortere doublure in
   `AL.strings.spreads.intro`.
7. **Bouwpuin in de bestanden die een speler opent.** `index.html` bevat nog
   "WP 5 vult de editor/terminal/Parsons-inhoud in" en "WP 7 levert level
   1–3"; `js/logic/strings.js` opent met "dit is het skelet"; `js/logic/levels.js`
   registreert nog een placeholder-level 1 dat nergens meer bestaat; vijf
   smoke-tests bevatten een hardgecodeerd macOS-pad
   (`/private/tmp/claude-501/-Users-lars-…`). De repo leest als nooit
   afgewerkt.

### P1 — de rendererkern is te arm voor een VGA-look

4. **Eén dither-patroon.** `ivDither` doet alleen 50 % schaakbord. Er is geen
   gradiënt-primitief. Gevolg: elk groot vlak — wand, vloer, lucht, licht —
   is één platte kleur. Juist die gegradeerde vlakken *zijn* de Sierra-look.
5. **Geen contactschaduwen.** Elke prop en de speler zweven.
6. **Geen perspectief.** Vloeren zijn assen-parallelle rechthoeken; de
   stijlgids vraagt expliciet om wijkende vloeren en een speler die naar
   achter kleiner wordt.
7. **Geen voorgrondlaag.** De stijlgids noemt painter's order met voorgrond;
   geen enkele scène heeft er een.
8. **Props zijn onbelicht.** Niets draagt hooglicht of schaduw van de ene
   genoemde lichtbron.

### P2 — scènedichtheid; het beeld lost de tekst niet in

9. **Kamers bevatten vier tot zes objecten.** Zes scènes, 173 draw-ops
   samen, waarvan ~78 % assen-parallelle rechthoeken en lijnen. De
   beschrijving van `zolder-oost` belooft een bureau, een net verlaten
   stoel, een beige toren, een bolle monitor én een halfvolle koffiemok; de
   tekening toont een grijze doos, een monitor en een blok. Elk zelfstandig
   naamwoord in de kamerbeschrijving hoort zichtbaar te zijn.
10. **Vijf van de zes sprites worden nooit getekend.** `notitieboek`, `doos`,
   `broncode-doos`, `stoel` en `pc` bestaan als volwaardige sprites met
   frames — de `pc` heeft zelfs een `aan`-frame met gloeiend scherm, de
   broncode-doos een `open`-frame — maar `js/engine.js` blit alleen
   `AL.sprites["speler"]`. `scene.hotspots`, `props` en `overlays` worden
   door niets gelezen. Props zitten in plaats daarvan in de gecachete
   achtergrond gebakken, dus geen enkel object in de wereld kan ooit van
   staat veranderen.
10. **Ramen zijn platte blauwe rechthoeken met een zwart kruis** — geen glas,
    geen diepte in het kozijn, geen uitzicht, geen lichtval op de omgeving.
11. **Dooslabels zijn witte vlekken.**
12. **Nergens beweging.** De stijlgids vraagt stof in de lichtstraal; er
    beweegt in het hele spel niets behalve twee loopframes en een cursor.

### P3 — UI-chrome en typografie

13. **Het berichtvenster is een beige doos met een 1 px-kader** en
    ASCII-koppen (`== Zolder — westhoek ==`). Geen slagschaduw, geen
    ornament. Bij de epiloog dekt het het hele scherm af, inclusief de
    eindkaart eronder.
14. **Statusbalk en invoerbalk zijn kale gekleurde stroken.**
15. **De 8×8-font zet elke glyph in ~6 van 8 kolommen**, dus prose oogt breed
    en luchtig — herkenbaar als debug-font, niet als spelfont.
16. **Het beeldkader klopt niet.** Het canvas staat als vierkante-pixel
    320×200 op zwart, dus 16:10. Echte VGA mode 13h werd op 4:3 getoond;
    alles is nu ~17 % te smal tegenover hoe Sierra er werkelijk uitzag. Er is
    ook geen enkele CRT-behandeling.

### P4 — beweging en overgangen

16. **Geen enkele overgang.** Scènewissels, moduswissels, titel → intro: alles
    is een harde cut. De backing store maakt fades, dissolves en irissen
    triviaal.
17. **De speler heeft twee loopframes**, geen idle, geen draai, geen armzwaai.
18. **De parser aanvaardt ~15 exacte strings.** Alleen `ga noord` werkt;
    `noord`, `n`, `ga naar noord`, `neem`, `pak` geven allemaal "Dat begrijp
    je niet." Geen synoniemenlijst, geen lidwoord-stripping, geen
    commandogeschiedenis met pijl-omhoog. De intro nodigt de speler
    uitdrukkelijk uit om te typen; de parser straft dat af.

### P5 — geluid

18. **Negen blokgolf-cues, geen muziek, geen ambience.** Na de graphics is de
    stilte de grootste prototype-tell.

### P6 — de gesimuleerde pc

19. **De overlay is een moderne webpaneel**: afgeronde hoeken, CSS-glow,
    Courier New. De voor de hand liggende referentie — Borland Turbo C++ /
    QBasic — wordt niet gebruikt: geen menubalk, geen dubbellijns
    kaderteken-chrome, geen F-toetsen-statusbalk, geen scanlines.
20. **De editor opent middenin het bestand** in plaats van bovenaan.
21. **CHECK_OK en CHECK_FAIL hebben dezelfde kleur.** De kernfeedbacklus van
    het hele spel — slaagt mijn code of niet — is één amberkleurige muur
    tekst. `engine.js` injecteert al een `--pc-rood`, maar geen enkele
    CSS-regel gebruikt die; `--pc-groen` wordt alleen in het menu gebruikt.
    Bovendien wordt de bovenste regel van het uitvoerpaneel half door de
    rand afgesneden (`.pc-editor-uitvoer`, `css/style.css:233`).

### P4½ — het verhaal zelf

Lars' eigen kritiek, en ze snijdt dieper dan de presentatie: het spel is te
zacht. De zolder is nu een warm archief dat op iemand wachtte; de spanning
die het spel wél in huis heeft, zit volledig opgesloten in _Seven Little
Goats_ — zes opgegeten geitjes, een wolf die opengelegd wordt, een einde dat
"koud en onaf" heet. Het kader eromheen laat daar niets van blijken. Alberta
schreef iets grimmigs en maakte het niet af, en juist dát is nergens
voelbaar. De verteller blijft op melancholie staan waar hij op onbehagen
zou moeten staan.

Zie ook P0-6: de opening zit op de verkeerde drager, in de verkeerde stem,
op het verkeerde moment.

### P7 — inhoud die de docs al beloven maar die ontbreekt

21. **Schetsen in de spreads.** De stijlgids specificeert klasse-als-doos-
    diagrammen, pijlen tussen dozen, een lus als cirkelpijl, per level
    gekoppeld aan de scharnier-metafoor — en de spreads dragen volgens het
    spelontwerp "de meeste nieuwe beelden". Er staat er geen enkele in.
22. **Alle acht spreads delen één papierachtergrond**, met dezelfde
    koffievlek op dezelfde plek en hetzelfde ezelsoor. De stijlgids vraagt
    beschadiging "precies waar de puzzel zit" — de vlek moet de ontbrekende
    code verklaren, en dus per level verschillen.
23. **Handschrift is alleen y-jitter**; de stijlgids vraagt ook schuinstand
    en spatievariatie, en noemt een echte pixel-handschriftfont als
    polish-ticket.
24. **`titelkaart` heeft geen scènebestand.** De stijlgids noemt het een
    bindende scène-id met een mood; het staat als zeven inline draw-ops in
    `js/engine.js:571`. Er is geen logo-artwork: de titel is de speltekst in
    de speelfont.

## Gekozen richting

Beslist door Lars:

- **Volledige overhaul, gefaseerd.** Elk werkpakket is een eigen commit met
  een eigen `workflow/NN-*.md`-entry, volgens de bestaande repo-conventie.
  Na elk pakket staat het spel er beter voor; er kan na elk pakket gestopt
  worden.
- **Volledige periode-soundtrack.** Procedurele AdLib/OPL-achtige muziek in
  WebAudio — titelthema, zolder-ambience, een warmere laag aan de pc, een
  eindcue — plus echte foley. Geen bestanden, geen dependencies.
- **Typografie:** de 8×8-monospace blijft voor statusbalk, invoerbalk en
  terminal; prose wordt proportioneel gezet uit dezelfde glyph-data; een
  schuine pixel-handschriftfont voor het notitieboek; een echt getekend
  titellogo.
- **Beeldkader:** 4:3 met gescheiden gehele X- en Y-schaalfactoren, plus een
  subtiele, uitschakelbare scanline-/vignet-behandeling.
- **Verhaal — kouder verteld, en de duisternis komt uit het spel zelf.**
  Alberta's verdwijnen blijft onverklaard: de regel "nooit een oorzaak
  noemen" uit `docs/achtergrond.md` blijft staan. Wat verandert is het
  register — van warme weemoed naar kou en onbehagen. En de bron van die
  duisternis is _Seven Little Goats_ zelf: zij was een verhaal aan het
  schrijven over kinderen die opgegeten worden en een wraak die koud kan
  aflopen, en ze heeft het niet afgemaakt. Dat mag in het kader gevoeld
  worden. De sim-prose zelf blijft ongemoeid.
- **Urgentie: alleen toon.** Geen deadline, geen faalstaat, geen
  verliesmechaniek. De logica-laag, het staat-object en het save-formaat
  blijven onaangeroerd — dat scheelt een hoop risico in een vak-context.
- **De opening wordt filmisch, op het canvas.** Een korte reeks getekende
  establishing shots met prose eroverheen, vóór de speler controle krijgt.
  De achtergrond komt dus vóór het notitieboek, in de stem van de verteller.
  Dit herleeft `AL.strings.intro`; de doublure `AL.strings.spreads.intro`
  verdwijnt.
- **Bereik van de herschrijving:** intro, kamerbeschrijvingen,
  onderzoeks-teksten, alle acht spreads, oordeel en epiloog. De
  _Seven Little Goats_-sim blijft ongemoeid — die prose is al de donkerste
  in de repo, en aanpassen zou ook de Java-broncode en de vier
  transcript-fixtures raken die `test-sim-cross-check` byte voor byte
  vergelijkt.

## Werkpakketten

Drie afhankelijkheden zijn bindend:

- **WP 0 komt eerst.** Het logboek, de checklist en de werkafspraken staan er
  voor er code verandert — anders is er na een crash geen spoor van waarom
  iets zo besloten is.
- **A en B zijn fundering.** Al het tekenwerk daarna wordt getekend *tegen*
  het gecorrigeerde beeldkader en *met* de nieuwe primitieven — andersom is
  het dubbel werk.
- **C komt vóór D en E.** De QC-poort van het scènewerk is "elk zelfstandig
  naamwoord in de kamerbeschrijving moet aanwijsbaar zijn". Als de
  kamerbeschrijvingen daarna nog herschreven worden, klopt de art opnieuw
  niet. De tekst gaat dus eerst vast, dan pas het beeld.

### WP 0 — Logboek, checklist en werkafspraken

**Doel:** het programma is opgeschreven vóór er één regel code verandert, en
het werk is op elk moment oppikbaar door een verse sessie.

De repo heeft hier al een conventie voor: `workflow/` draagt één genummerde
entry per werkpakket (opdracht, aanpak, beslissingen, QC-resultaat), en entry
01 hangt de volledige prompt en het goedgekeurde plan als bijlagen aan. Dat
patroon wordt hier hernomen. De bestaande entries lopen tot 14, dus dit
programma begint bij 15.

- **`workflow/15-opwaardering-kickoff.md`** — de kickoff-entry: Lars' prompt
  woordelijk (in het Engels, zoals de conventie vraagt), de vier scoping-
  vragen met de gekozen antwoorden, de terugkoppeling over het verhaal en de
  notitieboek-opening, en het goedgekeurde plan integraal als bijlage.
  Inclusief het bewijsmateriaal: welke screenshots uit de echte engine zijn
  gemaakt en wat erop te zien was.
- **`workflow/voortgang.md`** — de levende checklist. Eén regel per werk-
  pakket en per deeltaak, met een afvinkstatus, en per pakket de
  commit-hash zodra het vast staat. Dit is bewust een apart bestand: de
  genummerde entries zijn chronologisch en blijven staan zoals ze geschreven
  zijn, de checklist verandert mee. Een sessie die na een crash opstart,
  leest dit bestand en weet meteen waar ze staat.
- **`workflow/16-*.md` t/m `25-*.md`** — één entry per werkpakket A t/m J,
  telkens geschreven ná de QC en meegecommit met het werk zelf.
- **`CLAUDE.md`** krijgt de werkafspraken erbij, zodat ze ook gelden voor een
  sessie die dit plan nooit gezien heeft:
  - vóór een meerdelig programma: prompt, beslissingen en plan vastleggen in
    `workflow/`;
  - `workflow/voortgang.md` bijwerken in dezelfde commit als het werk, nooit
    achteraf;
  - één commit per werkpakket, atomair, pas na geslaagde QC;
  - elke niet-triviale beslissing met haar reden in de WP-entry, ook als ze
    afwijkt van wat het plan zei — juist dan.

**QC:** `workflow/15-*.md` en `workflow/voortgang.md` bestaan en zijn
consistent met dit plan; `CLAUDE.md` bevat de werkafspraken; markdown op 80
tekens, Vlaams, sentence case in koppen; de code is nog onaangeroerd, dus de
tests staan onveranderd op 224/225.

### WP A — Fundering en opruiming

**Doel:** het beeldkader klopt, de zichtbare fouten zijn weg, de testsuite is
groen en het bouwpuin is opgeruimd.

- **Beeldkader 4:3.** `berekenSchaal()` in `js/engine.js:681` levert nu één
  factor; het wordt er twee (`--schaal-x`, `--schaal-y`), met
  `css/style.css:20` mee. Exact 5:6 geeft precies 4:3, maar vraagt 1600×1200
  en past lang niet altijd. Het algoritme kiest daarom onder alle passende
  gehele paren `(sx, sy)` het paar dat het venster het best vult en waarvan
  `1,6·sx/sy` het dichtst bij 4/3 ligt. Uitkomsten: 1600×1200 (exact 4:3) op
  een groot scherm, 1280×1000 (1,28) op 1080p, 960×800 (1,2) in een kleiner
  venster — altijd twee gehele factoren, dus geen ongelijke pixelrijen. Dit
  moet vóór al het tekenwerk landen: een cirkel in de buffer verschijnt na de
  rek ~20 % breder, en Sierra-artiesten tekenden mét die rek in het hoofd.
- **CRT-behandeling.** Een CSS-overlay (scanlines + vignet) boven het canvas,
  uitschakelbaar via het bestaande `geluid aan|uit`-patroon in de parser
  (`crt aan|uit`), bewaard in de save.
- **Z-orde.** In `tekenTitelKaart` en `tekenOordeelKaart`: eerst de
  lichtstraal, dan het kader, dan de tekst.
- **Spread-indeling.** `AL.spreads.tekenInhoud` in
  `js/scenes/scene-spread-template.js:87` krijgt twee kolommen (linkerblad
  x 18–150, rechterblad x 170–300) in plaats van één doorlopende regel van
  272 px; de bladerhint en de paginateller krijgen een eigen plek binnen het
  blad.
- **Java-codering.** `seven-little-goats/src/Main.java` zet `System.out` om
  naar een expliciete UTF-8-`PrintStream` (via `StandardCharsets.UTF_8`, geen
  checked exception, geen cursusverboden constructie), plus een notitie in
  `seven-little-goats/README.md`. Dit maakt `test-sim-cross-check` groen en
  voorkomt vraagtekens op een Windows-console.
- **Opruimen.** Verouderd bouwcommentaar uit `index.html` en
  `js/logic/strings.js`; het placeholder-level in `js/logic/levels.js:258`;
  de vijf dode string-sleutels; het hardgecodeerde macOS-pad in de vijf
  `test/smoke-*.mjs` (afleiden van `process.env` of een tijdelijke map).

**QC:** 225/225 tests groen; `npm run lint:scene` schoon; screenshots van
titelkaart, spread en oordeelkaart tonen leesbare tekst; het spel opent nog
altijd vanaf `file://` met dubbelklik.

### WP B — Rendererkern

**Doel:** `js/gfx.js` krijgt het gereedschap waar de art-stijlgids al om
vraagt maar dat er nooit is gekomen.

Nieuwe draw-ops (en dus ook nieuwe regels in `tools/lint-scene.mjs`, dat elke
op-naam en ariteit valideert):

- `gradient` — verticale/horizontale ramp tussen twee paletindexen binnen een
  ramp, met geordende (Bayer 4×4) dithering op de overgangen. Dit vervangt de
  platte vlakken die nu elke wand, vloer en lichtstraal zijn.
- `ditherRamp` — dithering met dichtheid (25/50/75 %) in plaats van alleen
  het huidige 50 %-schaakbord in `ivDither` (`js/gfx.js:149`).
- `schaduw` — verduistert een gebied door elke pixel één of twee stappen
  omlaag in zijn eigen ramp te mappen. Geeft contactschaduwen zonder een
  tweede palet.
- `ruis` — deterministische speckle voor houtnerf, stof en steen.

Plus, in de engine-laag:

- **Diepte:** `tekenSprite` krijgt een schaalvariant, en de actor schaalt met
  zijn y-positie (de stijlgids vraagt dit expliciet). Voor vier kamers is een
  volledige priority-buffer overkill; een per-hotspot `yDrempel` waarboven de
  sprite achter de prop valt volstaat.
- **Overlaylaag per frame:** scènes worden gecachet en met `blitScene`
  gememcpy'd (`js/gfx.js:250`), dus alles wat beweegt moet ná de blit
  getekend worden. Een `overlays`-pass in `render()` levert stof, monitorflik-
  kering en de flikkering van de lichtstraal.
- **Overgangen:** fade, iris en dissolve als een pixelgewijze pass over de
  backing store vóór `present()` — op een palet-geïndexeerde buffer is dat
  een goedkope ordered-dither-drempel, geen palet-hardware nodig.

**QC:** unit-tests voor elke nieuwe op (headless, via de Node-export van
`gfx.js`); `debugPalet` aan in de tests zodat geen enkele op buiten het palet
kleurt; `lint-scene` kent de nieuwe ops; `docs/art-stijlgids.md` en
`docs/engine-architectuur.md` in dezelfde commit bijgewerkt.

### WP C — Verhaal, stem en de zolder die antwoordt

**Doel:** het register wordt kouder, de duisternis van _Seven Little Goats_
wordt in het kader voelbaar, en de zolder beloont wie er rondkijkt.

- **Register.** Alle kader-prose herschreven van weemoed naar onbehagen:
  intro, de vier kamerbeschrijvingen, de spreads, oordeel en epiloog.
  Alberta's verdwijnen blijft onverklaard — die regel blijft — maar de zolder
  is geen archief dat wachtte, het is een kamer die halverwege stilviel. De
  bestaande toonregels uit `docs/achtergrond.md` (geen decoratieve
  drieslagen, geen uitroeptekens, de emotie zit in de terughoudendheid)
  blijven gelden en helpen hier juist: kou werkt in zuinige zinnen.
- **De duisternis krijgt een bron.** Het kader mag laten voelen wát Alberta
  aan het schrijven was — een verhaal waarin zes kinderen opgegeten worden en
  de wraak koud kan aflopen — en dat ze het niet afmaakte. Zonder de
  sim-prose zelf aan te raken.
- **Een eigen `onderzoek`-tekst voor elk zelfstandig naamwoord** dat in een
  kamerbeschrijving staat. Nu geven de pc, de stoel, de koffiemok én de
  broncode-doos allemaal de kamerbeschrijving terug (`js/logic/world.js:168`);
  het hele spel heeft twee unieke onderzoeks-teksten. Dit is de goedkoopste
  grote winst in de lijst.
- **Parser-tolerantie:** kale richtingen (`noord`, `n`), lidwoord-stripping,
  `neem`/`pak` met een net antwoord in plaats van "Dat begrijp je niet.", en
  commandogeschiedenis met pijl-omhoog in `js/input.js`. De intro nodigt
  uitdrukkelijk uit om te typen; de parser hoort dat niet af te straffen.
- **`AL.strings.intro` wordt weer de echte openingstekst**; de doublure
  `AL.strings.spreads.intro` verdwijnt, samen met de vijf dode
  string-sleutels.

**Docs die mee moeten in dezelfde commit** — dit is de grootste fan-out van
alle pakketten:

- `docs/achtergrond.md`: de register-sectie herschreven (de
  "nooit-een-oorzaak"-regel blijft).
- `docs/save-en-hints.md:138–141`: de vier oordeelteksten staan daar
  woordelijk in en lopen anders uit de pas.
- `walkthrough/deel1-hints.md` en `deel2-oplossingen.md` citeren spelprose en
  scènenamen; beide PDF's opnieuw bouwen met
  `walkthrough/tools/bouw-walkthrough.sh`.

**QC:** alle 225 tests groen; nieuwe tests in `test/test-world.mjs` voor elke
nieuwe onderzoeks-tekst en elk synoniem; geen enkele `onderzoek` geeft nog
een kamerbeschrijving terug; prose op 80 tekens, Vlaams, geen hollandismen,
geen AI-tells; de vier oordeelteksten identiek in `strings.js` en
`save-en-hints.md`.

### WP D — De opening

**Doel:** de speler kent de achtergrond vóór hij het notitieboek vindt, in de
juiste stem, op de juiste drager.

Een filmische openingsreeks op het canvas: een handvol getekende
establishing shots met de verteller eroverheen — het huis, de zoldertrap, het
stof, de pc die nog nagloeit — met de overgangen uit WP B ertussen, vóór de
speler controle krijgt. Overslaan met Enter/Escape moet kunnen; wie herbegint
wil dit niet vier keer zien.

`js/engine.js:250` routeert nu titel → `spread:intro` → zolder; dat wordt
titel → openingsreeks → zolder. De `spread`-modus blijft bestaan voor de
zeven level-spreads, maar draagt de intro niet meer.

**QC:** de openingsreeks is overslaanbaar en de save onthoudt dat hij gezien
is; `smoke-browser` en `smoke-full-playthrough` aangepast en groen (die
drukken nu Enter tot ze in de zolder staan); geen notitieboek-papier meer te
zien vóór de speler het boek gevonden heeft.

### WP E — De zolder hertekend

**Doel:** van 173 draw-ops naar echte VGA-kamers, en het beeld lost eindelijk
in wat de tekst belooft.

- Alle zes scènes hertekend met de nieuwe primitieven: gegradeerde wanden en
  vloeren, wijkend perspectief, één consequente lichtbron met hooglicht en
  schaduw per prop, 1 px-outlines waar een vorm wegvalt, een voorgrondlaag
  (een balk, een stapel dozen in silhouet) zodat er diepte is.
- **Props uit de achtergrond, naar de sprites.** `scene.hotspots` wordt
  eindelijk gerenderd; de vijf bestaande sprites (`notitieboek`, `doos`,
  `broncode-doos`, `stoel`, `pc`) worden geblit in plaats van in de
  achtergrond gebakken. Daardoor kan de pc eindelijk zijn `aan`-frame tonen
  en de broncode-doos zijn `open`-frame. Wat naar een sprite verhuist, moet
  uit de scène-picture verdwijnen — anders staat het er dubbel.
- **Het beeld volgt de prose:** de koffiemok, de net verlaten stoel, de pen
  in het boek, dozen tot aan de balken.
- **Ambient beweging:** stof dat door de lichtstraal zakt, een monitor die
  onregelmatig oplicht, licht dat langzaam verschuift.
- **`titelkaart` wordt een echte scène** (`js/scenes/scene-titelkaart.js`,
  nu zeven inline ops in `js/engine.js:571`) met een getekend logo-bitmap in
  plaats van de titel in de speelfont.

**QC:** `lint-scene` schoon op alle scènes; screenshots van alle zes de
schermen naast de bijhorende `AL.strings.scenes[...].beschrijving` gelegd —
elk zelfstandig naamwoord in de tekst moet aanwijsbaar zijn; geen prop staat
dubbel (sprite én achtergrond); alle bestaande tests groen.

### WP F — Typografie en UI-chrome

**Doel:** tekst leest als een spel, niet als een terminal.

- **Proportionele prose.** De glyph-data blijft; er komt een breedtetabel
  (ink-breedte per glyph + 1 px spatiëring), en `gfx._wrap`/`maakVenster`
  gaan van tellen-in-tekens naar meten-in-pixels. Gecontroleerd: `maakVenster`
  en `_wrap` worden door geen enkele test aangeroepen — de DOM-vrije tests
  werken op de ongewrapte `tekst`-arrays uit de logica, het wrappen zit
  volledig in de renderlaag. De omslag is dus veel goedkoper dan hij eruitziet;
  de enige echte beperking is visueel. `gecentreerdeTekst` in `js/engine.js:632`
  rekent ook met `tekst.length × 8` en moet mee.
- **Handschriftfont** voor het notitieboek: schuine, onregelmatige glyphs met
  spatievariatie — de stijlgids noemt dit al als polish-ticket.
- **Berichtvenster:** slagschaduw, papiertextuur, een echt kader in plaats van
  `== kop ==`, en het venster mag de eindkaart niet meer volledig afdekken.
- **Statusbalk en invoerbalk** krijgen chrome in plaats van een gekleurde
  strook.

**QC:** alle bestaande venster-tests groen; een visuele diff van de intro,
een kamerbeschrijving en de epiloog.

### WP G — Het notitieboek

**Doel:** de spreads dragen volgens het spelontwerp "de meeste nieuwe
beelden"; dat moeten ze dan ook doen.

- Per level een eigen papierachtergrond met de beschadiging *waar de puzzel
  zit*, in plaats van één gedeelde koffievlek voor alle acht.
- Alberta's schetsen per scharnier-metafoor, zoals de stijlgids ze al
  opsomt: blauwdruk-en-doos (level 1), trechters (2), knikkerbaan (3), twee
  pijlen één doos (4), patroonkaart (5), plankenbrug (6), dubbele pijl (7).
- Handschrift met de nieuwe font uit WP D.

**QC:** `lint-scene` schoon; elke spread bekeken; `docs/art-stijlgids.md`
bijgewerkt waar de implementatie afwijkt.

### WP H — Sprites en animatie

**Doel:** de speler leeft.

Ademende idle, een loopcyclus van vier tot zes frames met armzwaai, een
draaiframe, en een "gaat aan de pc zitten"-animatie. Dieptescaling toegepast.
De stijlgids staat ≤ 16×32 toe; de huidige sprite is 13×25 en gebruikt die
ruimte niet.

**QC:** sprite-lint; frames visueel doorlopen; geen asymmetrie die gespiegeld
fout oogt (west = gespiegeld oost, harde regel uit de stijlgids).

### WP I — Geluid

**Doel:** de stilte weg.

Een kleine procedurele muzieklaag in WebAudio, in OPL-stijl (FM-achtige
twee-operator-stemmen, geen samples): een titelthema, een trage
zolder-ambience-loop, een warmere laag aan de pc, een eindcue. Plus foley:
voetstappen op hout, een bladzijde, een doos die opengaat, toetsaanslagen.
`ambient-zolder` bestaat al als cue maar wordt nergens afgevuurd — dat wordt
rechtgezet. Alles blijft respecteren dat `geluid uit` echt alles stilzet.

De muziek volgt het koudere register uit WP C: mineur, traag, veel stilte
tussen de frasen. De zolder hoort niet gezellig te klinken. Het contrast dat
overblijft is de pc — het enige warme ding in huis.

**QC:** geen bestanden, geen dependencies; headless tests crashen niet zonder
`AudioContext`; `geluid uit` maakt het volledig stil; de cue-lijst in
`docs/engine-architectuur.md` bijgewerkt.

### WP J — De gesimuleerde pc

**Doel:** het scherm waar de speler de meeste tijd doorbrengt, verlaat de
esthetiek niet.

Borland/Turbo-look: een menubalk, dubbellijns kaderchrome, een
F-toetsen-statusbalk onderaan, scanlines over het paneel, en de 8×8-bitmapfont
in plaats van Courier New. `CHECK_OK` groen en `CHECK_FAIL` rood — de
`--pc-rood`-variabele wordt al geïnjecteerd maar door geen enkele CSS-regel
gebruikt. De afgeronde hoeken en de CSS-glow gaan eruit. De editor scrollt
naar boven bij het openen, en het uitvoerpaneel snijdt zijn eerste regel niet
meer af.

**QC:** `smoke-pc` groen; de editor blijft een echte `<textarea>` (selectie,
plakken, schermlezer — een geboekte beslissing in
`docs/engine-architectuur.md`); toetsenbord op mobiel werkt nog.

## Verificatie, over de hele lijn

- `node --test test/` moet na elk werkpakket groen zijn — dat is de primaire
  poort. Vandaag is dat 224/225; na WP A hoort dat 225/225 te zijn.
- `npm run lint:scene` en `node tools/check-assets.mjs` na elk pakket dat art
  raakt.
- `node tools/screenshot.mjs` per scherm, en de screenshots naast de vorige
  gelegd. De smoke-tests moeten eerst van hun hardgecodeerde macOS-pad af
  (WP A), anders is dit voor niemand anders reproduceerbaar.
- `javac -d out src/*.java` schoon plus de verbods-grep leeg, voor elk pakket
  dat Java raakt (WP A).
- Dubbelklikken op `index.html` blijft werken — na elk pakket handmatig
  gecontroleerd, want dat is de harde projectregel die het makkelijkst
  ongemerkt sneuvelt.
- Docs en code blijven in sync binnen hetzelfde pakket, zoals `CLAUDE.md`
  vraagt: `art-stijlgids.md` bij WP B/E/G/H, `engine-architectuur.md` bij
  WP A/B/D/I/J, `achtergrond.md` en `save-en-hints.md` bij WP C.
- De walkthrough loopt mee met WP C: `deel1-hints.md` en
  `deel2-oplossingen.md` citeren spelprose en scènenamen, dus beide PDF's
  opnieuw bouwen met `walkthrough/tools/bouw-walkthrough.sh` en het verzegelde
  deel 2 opnieuw controleren.
- Eén `workflow/NN-*.md`-entry per pakket (opdracht, aanpak, beslissingen,
  QC-resultaat), en pas committen als de QC slaagt.
- `workflow/voortgang.md` wordt bijgewerkt in dezelfde commit als het werk.
  Eén commit per werkpakket, atomair. Zo is na elke commit precies één
  waarheid over waar het programma staat, en kan een verse sessie na een
  crash verder zonder deze conversatie gezien te hebben.

## Wat bewust níét gebeurt

- **Alberta's lot wordt niet verklaard.** De regel "nooit een oorzaak noemen"
  blijft. Kouder vertellen is niet hetzelfde als uitleggen.
- **Geen faalstaat, geen deadline, geen verliesmechaniek.** De urgentie zit
  volledig in de toon. Het staat-object, het save-formaat en de logica-laag
  blijven zoals ze zijn — in een vak-context is een speler die vastloopt of
  iets kwijtraakt een groter probleem dan een spel dat te zacht aanvoelt.
- **De _Seven Little Goats_-prose blijft ongemoeid.** Ze is al donker genoeg
  om als bron te dienen, en aanpassen zou de Java-broncode én de vier
  transcript-fixtures meetrekken.
