# 39 — Walkthrough herbouwd

Werkpakket 39 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). De gids in twee delen liep negen
commits achter op het spel: WP 29 t/m 38 herschreven proza, hints, navigatie,
hoofdstuktitels en de sim-backstory, en de PDF's dateerden nog van WP 10. Dit
pakket haalt de twee Markdown-bronnen bij, bouwt de PDF's opnieuw, en zet er
een lint naast die deze drift voortaan mechanisch vindbaar maakt.

## Opdracht

Uit het goedgekeurde programma, WP 39:

> - deel1/deel2 .md bijwerken (F1 in de editor, commandolijst, nieuwe
>   hoofdstuktitels, gewijzigde citaten, looproutes).
> - pandoc + typst proberen te installeren; lukt dat → PDF's herbouwen met
>   tools/bouw-walkthrough.sh; lukt het niet → expliciet open punt in
>   voortgang.md.
> - QC: scripted vergelijking titels/citaten walkthrough ↔ strings.js;
>   `node --test` blijft groen.

De manager heeft er bij de opdracht aan de worker aan toegevoegd: een
systematische inhoudspas per onderwerp (citaten, navigatie, hintsysteem,
sim-backstory, geluid, de vier eindes), een structuurcontrole dat deel 1 geen
hintstadium 3 lekt, en het padprobleem dat WP 38 als open punt achterliet.

## Aanpak

### De lint eerst, de tekst daarna

De gids citeert het spel op vier manieren: hoofdstuktitels, modeloplossingen in
Java, de commandoscripts van de vier eindes, en losse zinnen en commando's.
Elk van die vier is een kopie, en een kopie veroudert stil — precies wat hier
gebeurd is. De eerste stap was daarom geen tekst maar
`tools/check-walkthrough.mjs`, in dezelfde geest als `check-docpaden.mjs` uit
WP 38: eerst het meetinstrument, dan de reparatie, zodat "hersteld" iets
betekent.

De lint doet vijf keuringen:

1. **Hoofdstuktitels en weken.** Elke `# Level N — …`-kop moet woordelijk
   gelijk zijn aan `AL.strings.lN.naam`; elke "Speelbaar na week N" aan de week
   van het spread.
2. **Java-blokken.** Elk ```` ```java ````-blok in deel 2 moet, op inspringing
   en lege regels na, terugkomen in een modeloplossing (`js/levels/levelN.js`)
   of in `seven-little-goats/src/`. Deel 2 belooft "letterlijk het fragment uit
   Alberta's broncode"; dit maakt die belofte hard.
3. **Commandoscripts.** Elk kaal codeblok dat met een sim-commando begint, moet
   regel voor regel gelijk zijn aan een script in
   `seven-little-goats/test-scripts/`. Er moeten er precies vier zijn.
4. **Citaten en commando's.** Elke tekst tussen dubbele aanhalingstekens en elke
   `code`-span moet in de tekstcorpus van het spel staan. De corpus is "alles
   wat het spel kan afdrukken": de sjabloonfuncties van de trace-puzzels worden
   over hun hele pool uitgerekend, zodat `toon(3)` en `3 20` er echt in staan.
   Een commando van twee woorden (`pak stenen`) telt als geldig wanneer het
   werkwoord in een van de twee `help`-lijsten staat en het zelfstandig
   naamwoord in de corpus.
5. **Geen stadium 3 in deel 1.** Zie hieronder.

Wat de lint bewust *niet* doet, is de hintteksten van deel 1 woordelijk
vergelijken met `AL.strings.puzzelHints`. Deel 1 herformuleert stadium 1 en 2 in
zijn eigen opgewekte tijdschriftstem; dat is een beslissing uit WP 10
(`workflow/11-walkthrough.md`) en woordelijkheid eisen zou die terugdraaien.

### Hoe je "lekt stadium 3" meet zonder woordelijkheid

Het contract van deel 1 is: stadium 1 en 2 op papier, stadium 3 nooit. Omdat de
gids herformuleert, kan een tekstvergelijking dat niet keuren. Wat wél meetbaar
is: stadium 3 zegt dingen die stadium 1 en 2 niet zeggen — de vorm, de grens,
het antwoord. De lint neemt van elke stadium-3-hint de inhoudswoorden die niet
al in stadium 1 of 2 staan **en ook niet op het scherm van de speler staan**
(de vraag, de stroken, het beschadigde fragment in de editor — wat de speler al
ziet, is geen lek). Duikt meer dan de helft daarvan, en minstens drie woorden,
op in het blok van diezelfde puzzel in deel 1, dan lekt stadium 3 daar.

Die laatste toevoeging is niet cosmetisch: zonder haar viel `l5-patroonkaart`
door de keuring omdat de gids de vier patroonkaarten opsomt — maar dat doet de
puzzelvraag zelf ook, het zijn de antwoordopties.

De grens is met een negatieve test nagemeten: de verwijderde zin van
`l6-vindfout` teruggezet doet de lint afgaan (4/5 eigen woorden van stadium 3,
exit 1); weggehaald is ze weer schoon. Hetzelfde is gedaan voor de titel-, de
Java- en de scriptkeuring (zie §QC).

### Wat er in deel 1 fout stond

- **Navigatie.** De gids zei "je loopt rond met de pijltjestoetsen" en liet de
  rest aan de verbeelding over. Sinds WP 32 zijn álle vier de richtingen te
  voet te doen (oost/west over de rand, noord/zuid door de trap als
  uitgangszone), en op een aanraakscherm staat er een D-pad. Dat staat er nu,
  inclusief de regel dat een geschilderde muur zwijgend blokkeert — anders leest
  dat als een bug. De getypte commandolijst blijft eronder staan en klopt regel
  voor regel met `AL.strings.help`.
- **De lus per level, stap 5.** De WP 33-melding ontbrak: ga je opnieuw zitten
  terwijl het hoofdstuk al hersteld is, dan blijft de pc dicht en zegt hij waar
  het volgende blad ligt.
- **"Twee of drie hints".** Er staan er altijd twee. De derde staat in het spel,
  en dat legt de alinea erboven al uit.
- **Negen hints gingen verder dan stadium 2.** Bij `l3-vindfout` stond het
  regelnummer erbij — dat ís het antwoord. Bij `l6-vindfout` stond de volledige
  fix (`< 5` versus `<= 5`). De andere zeven (`l2-editor-repair`,
  `l4-editor-repair`, `l4-trace`, `l5-editor-write`, `l5-patroonkaart`,
  `l7-editor-repair`, `l7-trace`) droegen elk een slotzin die woordelijk of
  bijna woordelijk uit stadium 3 kwam. Bij alle negen is die ene zin geschrapt;
  de rest van elke hint is ongemoeid gebleven.
- **De sim-backstory.** De gids zei "Je bent Roodkapje. Je volgt het spoor van
  de jonge wolf … en rekent daar met hem af." Dat prejudgeert de keuze die het
  spel expliciet openlaat, en het is ook niet meer wat de backstory zegt sinds
  WP 29. De alinea vertelt nu wat `goats-strings.js` vertelt: de neef van de
  oude wolf, zes opgeslokte geitjes, het jongste in de klokkast, en "Wat je daar
  met hem doet, bepaal jij."
- **Een commando dat niet bestaat.** De gids raadde `bekijk je voorwerpen` aan.
  De sim kent `bekijk` niet (`js/sim/goats-world.js`, de commando-tabel):
  `inventaris` en `stats` zijn de twee die het wél doen.
- **Het mandje.** "Een `mandje` heb je nodig om iets te kunnen dragen" is te
  breed: het mandje is alleen voor de koeken nodig (`pak` weigert enkel bij
  `koek` zonder mandje).

### Wat er in deel 2 fout stond

- **Drie van de vier oordeel-citaten waren geparafraseerd**, en één had er een
  accent bij dat Alberta niet schrijft ("dan weer dóór" tegen "dan weer door").
  De kolom heet "Alberta zegt (kort)", dus kort mag — maar dan wel woordelijk
  kort. Alle vier zijn nu een letterlijk fragment uit `AL.strings.oordeel`. De
  drempels (0–3 / 4–10 / 11–20 / 21+) kloppen met `js/logic/levels.js`.
- **Het citaat bij de `&&`/`||`-puzzel** was een parafrase ("de wolf verslagen
  ÉN de sleutel"); de opgave zegt "de wolf verslagen is EN je de sleutel hebt".
- **De kaart had een zwevende regel** ("| west" onder het dorpsplein) die geen
  verbinding tekende. De twee zijkamers hangen nu allebei netjes aan het plein,
  en de koeken op de marktkraam staan erbij — die zijn nodig voor de raaf-ruil
  in einde 1.

Wat in deel 2 **niet** fout stond, is minstens even belangrijk om te melden,
want het is het gevoeligste deel van de gids: alle negen Java-blokken komen nog
altijd byte-getrouw uit de modeloplossingen (keuring 2), de vier
commandoscripts zijn regel voor regel identiek aan
`seven-little-goats/test-scripts/` (keuring 3), en de vechtrekenkunde klopt met
`js/sim/goats-world.js`: basiskracht 2, keukenmes +3, wolf 18 LP met
smeekdrempel 5 en patroon 3-5-2-6-4 = 20 tegen 20 speler-LP. De trace-tabellen
kloppen met de pools van de levelbestanden (`[3,5,7]`, `[0,10,5]`,
`Dorpsplein/Bospad/Rivieroever`, `jongste/broer`). De WP 30-herschrijving van de
notities in level 5 en 7 raakte geen enkel citaat in deel 2 — die notities staan
in de stub, en deel 2 citeert de modellen.

### De PDF's: welke versies, en waarom de font het echte probleem was

Op de machine stond pandoc 3.1.3 en typst 0.10.0; het bouwscript is met pandoc
3.10 en typst 0.15.0 getest. De eerste poging brak meteen:
`--syntax-highlighting` bestaat pas vanaf pandoc 3.2. De release-binaries van
GitHub bleken door de proxy te halen, dus zijn pandoc 3.10 en typst 0.15.0
opgehaald naar een scratch-map (niet in de repo) en is het script daarmee
gedraaid: **exit 0**, twee PDF's.

Alleen: typst waarschuwde vijftien keer per document "unknown font family:
courier new". Courier New is een Microsoft-font, stond in WP 10 nog op deze
machine (`fc-list`, gedocumenteerd in de sjabloonkop) en staat er nu niet meer.
Typst viel daardoor terug op zijn eigen serif-font — en dan is de hele
fotokopie-look weg. Dat is precies het geval waarin je het sjabloon niet mag
verbouwen, dus is er niets aan het ontwerp veranderd: `zine.typ` heeft nu één
`#let typemachine`-ketting in plaats van vijftien losse
`font: "Courier New"`-vermeldingen, met Courier New nog altijd vooraan en
Liberation Mono erachter. Liberation Mono is de vrije tegenhanger van Courier
New met dezelfde metrieken, dus de bladspiegel blijft die van het ontwerp. De
gerenderde pagina's zijn nagekeken (kaft, zegelpagina, de kaartpagina, de
oordeel-tabel): typemachine-beeld, kader, wassen zegel en plakband staan er
zoals ze horen.

Twee compatibiliteitsingrepen, allebei in `bouw-walkthrough.sh` gedocumenteerd:
de `--syntax-highlighting=none`/`--no-highlight`-keuze gebeurt nu op basis van
wat de aanwezige pandoc kent (zodat het script óók op 3.1.3 draait), en de
kop waarschuwt dat een font-warning betekent dat de bladspiegel niet meer die
van het ontwerp is.

### Het padprobleem uit WP 38

WP 38 liet open: "`tools/bouw-walkthrough.sh` wordt in het programma aangehaald
met dat pad, maar het script staat in `walkthrough/tools/`". Nagemeten met
`node tools/check-docpaden.mjs`: alle drie de vindplaatsen staan in `workflow/`
(01, 28, 38) en zijn dus historie — geen enkel contractdocument haalde het
script aan, met welk pad dan ook. Er viel dus niets te herstellen; wat ontbrak
was het júíste pad ergens in een contract. Dat staat nu in `README.md`,
§Walkthrough: hoe je de PDF's herbouwt (`bash
walkthrough/tools/bouw-walkthrough.sh`) en hoe je de citaten keurt.

## Beslissingen

- **De lint wordt een blijvend gereedschap in `tools/`,** geen wegwerpscript in
  een scratch-map. Reden: dit defect (gids loopt achter op strings.js) komt
  terug bij élke prozawijziging, en het is niet met het oog te vinden. Hij hangt
  niet aan `node --test` maar staat naast `lint-scene`, `check-assets` en
  `check-docpaden` — dat zijn de linten die de repo op zijn eigen documenten
  loslaat.
- **Uitzonderingen staan in de lint zelf, met hun reden.** Drie stukjes tekst
  zijn van de gids en niet van het spel ("hoort" als benadrukt woord, "de
  stenen" als verzamelnaam, "cijfer"). Ze staan in `EIGEN_WOORDEN` mét
  motivering; wie er iets aan toevoegt, schrijft de reden erbij. Zo blijft
  zichtbaar hoe kort die lijst hoort te zijn.
- **De hint-trims gaan niet verder dan het contract.** Waar deel 1 iets zegt dat
  de speler tóch al op zijn scherm heeft, blijft het staan — bijvoorbeeld "de
  gered-vlag begint op false" bij `l1-editor-write`: dat staat woordelijk in
  Alberta's notitie boven het stub-fragment. Alleen wat meer weggeeft dan
  stadium 2, is weg.
- **De font-ketting in plaats van een font-vervanging.** Courier New blijft de
  eerste keuze en de ontwerpfont; de ketting is er voor machines die hem niet
  hebben. Zo bouwt een machine mét Courier New nog exact het ontwerp van WP 10.

## Afwijkingen van het plan

- Het plan zegt "pandoc + typst proberen te installeren". Ze stónden er al, maar
  te oud. De installatie is dus een download van de exacte versies uit de
  scriptkop geworden, naar een scratch-map buiten de repo — de repo krijgt geen
  binaries.
- Het plan noemt alleen een "scripted vergelijking titels/citaten". Die is
  uitgegroeid tot vijf keuringen, waaronder de stadium-3-poort, omdat de
  inhoudspas twee soorten defecten vond die een titel/citaat-vergelijking niet
  ziet: hints die te veel verklappen en een commando dat niet bestaat.

## QC-resultaat

- `node tools/check-walkthrough.mjs` — **276 citaten en koppen gekeurd; 0
  afwijkingen**, exit 0. Op de ongewijzigde gids meldde hij er zeven: vier
  citaten die niet meer woordelijk in het spel stonden en drie puzzels waar
  stadium 3 lekte. De overige defecten hierboven (het onbestaande `bekijk`, de
  navigatie, de backstory, het mandje, de kaart) komen uit de inhoudspas —
  een lint vindt drift, geen onwaarheid.
- Negatieve tests van vier van de vijf keuringen, elk apart teruggedraaid:
  hoofdstuktitel gewijzigd → FOUT + exit 1; één veldnaam in een Java-blok
  gewijzigd → FOUT; `ga zuid` → `ga noord` in een eindescript → FOUT; de
  geschrapte stadium-3-zin teruggezet → FOUT. Telkens weer schoon na herstel.
- `node --test test/test-*.mjs` — **400/400 groen**, ongewijzigd (dit pakket
  raakt geen speelcode).
- `node tools/check-docpaden.mjs` — 817 paden gekeurd, **0 dood in een
  contractdocument**, 25 historische in `workflow/`.
- `node tools/lint-scene.mjs` en `node tools/check-assets.mjs` — schoon ("Alle
  scènes in orde"; "Geen drift: alle 9 editor-modellen komen byte-getrouw uit de
  broncode").
- `bash walkthrough/tools/bouw-walkthrough.sh` — **exit 0** met pandoc 3.10 en
  typst 0.15.0. `deel1-hints.pdf` 149 539 bytes / **8 pagina's**,
  `deel2-oplossingen.pdf` 189 915 bytes / **13 pagina's** (WP 10 had er 7 en 12;
  de gids is gegroeid). Beide A4. De tekst is met `pdftotext` uitgelezen en de
  nieuwe passages staan erin ("Alle vier de richtingen", "D-pad",
  "dorpsexpert", "opnieuw doorgezet", "EN je de sleutel hebt").
- De ingebedde fonts zijn Liberation Mono (met DejaVu Sans Mono en Libertinus
  Serif voor de tekens die Liberation Mono niet heeft, zoals de lijstdriehoek en
  het dubbele groter-dan in de H2-koppen). Vier pagina's zijn als PNG gerenderd
  en bekeken.

## Open punten

- **Courier New staat niet op deze machine.** De PDF's in de repo zijn nu in
  Liberation Mono gezet — metrisch gelijk, maar niet letterlijk de font van
  WP 10. Wie ze op een machine mét Courier New herbouwt, krijgt het origineel
  terug; het sjabloon vraagt hem nog altijd als eerste.
- **`poppler-utils` is tijdens dit pakket geïnstalleerd** om de PDF's na te
  meten (`pdftotext`, `pdfinfo`, `pdftoppm`). Het is een controlegereedschap,
  geen bouwafhankelijkheid: `bouw-walkthrough.sh` heeft er niets aan.
