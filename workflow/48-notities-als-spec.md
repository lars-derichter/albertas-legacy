# 48 — Notities als spec

## Opdracht

WP 48 uit programma 4 (zie `workflow/46-lineariteit-kickoff.md`, §wortels
en §Bijlage). Uit Lars' speeltest van de gemergde build, verbatim:

> Het notitieboek geeft ook nog steeds veel uitleg over de code en geeft
> zo al bijna de oplossing. Studenten moeten dit zelf kunnen. Logischer
> zou bijv zijn om de velden op te sommen die bij geitje horen of om een
> soort klassendiagram te schetsen. Niet om (quasi) uit te leggen hoe
> this werkt. Dat leren studenten in de les en in de cursus.

De beslissing uit de kickoff: **pure spec**. Bladzijde 1 is haar
steno-spec (klasse, velden met hun types, signaturen,
klassendiagram-achtig), bladzijde 2 is wat stuk of onaf is, en er staat
nul conceptuitleg meer op papier. De uitleg blijft in de gefaseerde
hints, die meetellen voor het oordeel — uitleg krijgt zo een prijs. Het
vormanker is de `geitjeStub` in `js/levels/level1.js`: namen, types, wat
ontbreekt.

## Aanpak

### De zeven brieven (`js/logic/strings.js`, `AL.strings.spreads`)

Per hoofdstuk is bladzijde 1 een klassekaart geworden en bladzijde 2 een
schadelijst. Wat eruit ging, met wat ervoor in de plaats kwam:

- **L1** — weg: de klasse-versus-instantie-zin en de `this`-uitleg ("Veld
  en parameter heten in die constructor hetzelfde; 'this' is het enige
  wat ze uit elkaar houdt"). Nu: `Voorwerp` en `Geitje` met hun velden,
  types en getters. De aanhef ("Wie dit boek vindt: maak het af…") en de
  ondertekening "— A." staan er ongewijzigd; die zijn WP 45.
  De veldopsomming van `Geitje` verhuisde van briefB naar briefA — daar
  hoort een spec, en briefB houdt alleen nog wat er ontbreekt.
- **L2** — weg: de anatomie van een signatuur en het schaduw-antwoord
  ("In toon() drukt de kale naam de parameter af en this.levenspunten het
  attribuut") — dat laatste is letterlijk het antwoord op `l2-trace`. Nu:
  de velden van `Speler` en de vier koppen als tabel. BriefB, die die
  koppen in proza opsomde, zegt nu alleen nog dat er één verkeerd staat.
- **L3** — weg: het waarom van de validatie (de kruik geitenmelk, het
  negatieve getal in de statusregel) en de knikkerbaan. Nu: de grenzen (0
  en `MAX_LEVENSPUNTEN`), twee losse controles, in de setter, vóór het
  veld.
- **L4** — weg: aliasing ("Verander ik de kamer via de ene verwijzing,
  dan ziet de andere het ook") en null ("waar geen gang is, blijft de
  buur null"). Dat zijn woordelijk de antwoorden op `l4-trace` en
  `l4-verklaar`. Nu: de signatuur, één cascade met vier takken, de vier
  setters, elke verbinding aan twee kanten.
- **L5** — weg: de patroontaxonomie ("tellen, totaliseren, opbouwen,
  filteren, of het uiterste zoeken") — dat is de vraag van
  `l5-patroonkaart`, en ze stond als antwoordsleutel op de bladzijde
  ernaast. Nu: de twee signaturen met hun returntypes, het null-geval, en
  de lusvorm.
- **L6** — weg: de volledige off-by-one-les (de plankenbrug, "eén plank
  te ver en je ligt in het water") én de modeloplossing in proza die in
  briefB stond ("een for-lus van 0 tot size(), strikt kleiner,
  verwijderen op de index en meteen stoppen"), plus het antwoord van
  `l6-vindfout` ("loopt er één ronde te veel"). Nu: wat de methode doet,
  dat ze met een for-lus over de index loopt, en dat er aan allebei de
  lussen iets mankeert.
- **L7** — weg: de uitleg waarom de eerste pijl naar niets kan wijzen
  ("Wie nog in de wolf zit heeft geen schuilplaats") — het antwoord op
  `l7-trace`. Nu: de twee signaturen en de drie schakels van de keten.
  BriefB is ongewijzigd; die zegt al alleen wat ontbreekt.

Twee spoilers in de briefB's zijn geneutraliseerd: L3 zei welke operator
fout was ("in de poortcheck staat een `||` waar `&&` hoort") — dat is het
antwoord van `l3-vindfout`, en het is nu "in de poortcheck zit een fout
in de voorwaarde".

### De stub-notities (`js/levels/level*.js`)

De kantlijnnotitie boven een fragment is de dragende laag, niet de brief:
de speler leest een spread precies één keer (`open doos` een tweede keer
antwoordt "Je hebt dit fragment al", `world.js`). Alles wat `checks[]`
eist en niet uit de getoonde code volgt, hoort dus in de notitie — dat is
de regel die WP 30 al voor `int`/`Voorwerp` in level 5 vastlegde en die
hier voor alle zeven geldt. Wat er per notitie veranderde:

- **level0/level1 `voorwerpNotitie`** — de "verse doos" is weg (uitleg
  over wat een constructor dóét); de drie velden met hun types staan er,
  in de vorm van de `geitjeStub`.
- **level1 `geitjeStub`** — ongewijzigd. Dat is het vormanker.
- **level2 `spelerNotitie`** — "wat eruit komt staat vooraan, wat erin
  gaat tussen de haakjes" is weg; de vier koppen staan er nu als tabel.
- **level3 `klemNotitie`** — de knikker is weg; `MAX_LEVENSPUNTEN`,
  de grens 0, "twee losse controles" en "vóór de waarde het veld in gaat"
  blijven.
- **level4 `verbindNotitie`** — de conceptzin over heen en terug is weg;
  cascade en de vier setters blijven.
- **level5 `lusStub`** — de kaart-woordenschat is weg; de signaturen, het
  null-geval en (nieuw) de lusvorm staan er.
- **level6 `verwijderNotitie`** — de modeloplossing en de plankenbrugles
  zijn weg; wat de methode doet en de lussoort blijven, de grens niet.
- **level7 `zoekStub`** — spec-vorm gekregen, en (nieuw) de lussoort.
- **level7 `ketenNotitie`** — "eerst op null controleren, dan de tweede
  pijl volgen" is weg (dat is het herstel van variant A); de drie
  schakels blijven.

### De schets van level 1 (`js/scenes/spread-schetsen.js`)

De blauwdruk-en-doos is een **klassekaart** geworden: een kader met
"Geitje" in een naamvak bovenaan en `naam`, `schuilplaats`, `gered`
eronder, met een tweede kaart half buiten beeld die de koffiering
aanvreet. Haalbaarheid eerst gemeten, zoals de kickoff vroeg: het
schetskader is 128 × 62 px, de handfont is tien rijen hoog, en de vier
labels meten 24–55 px — er passen vijf regels van 11 px, er staan er
vier. Types staan niet in de tekening; die staan in de spec ernaast.

Een schets is een lijst draw-ops en die kent geen tekst. Er is géén
nieuwe gfx-op bijgekomen: `tekenHandschrift` schrijft rechtstreeks in de
backing store, terwijl `voerOpsUit` op een doelbuffer werkt die het niet
kent, dus een `hand`-op zou de primitieven-laag moeten verbouwen. In de
plaats daarvan draagt een schets-set een veld `labels`
(`[x, y, tekst]`), dat `AL.spreads.tekenInhoud` ná de beschadiging zet —
een koffiering hoort een tekening aan te vreten, niet wat ze erbij
schreef. `tools/lint-scene.mjs` keurt de labels (vorm, en binnen het
schetskader) en `test/test-spreads.mjs` rekent hetzelfde na.

### De hints

De gefaseerde hints blijven staan: dát is nu de enige plaats waar de
uitleg nog leeft, en daar heeft ze een prijs. Twee stadia-1 zijn wél
aangepast, omdat ze het antwoord zelf waren en dat pas opvalt nu de brief
het niet meer zegt:

- `l4-verklaar` stadium 1 zei "null is een pijl die naar géén doos wijst"
  — woordelijk de eerste helft van het model. Nu een vraag: "waar komt
  déze pijl uit als er in die richting geen kamer bestaat?"
- `l4-trace` stadium 1 zei "eerste en tweede wijzen naar dezelfde kamer",
  het hele scharnier van die trace in één zin. Nu: "lees de tweede regel
  nog eens — hoeveel kamers maakt deze code eigenlijk aan?"

`l2-trace` stadium 1 is nagekeken en ongewijzigd gelaten: die was al een
vraag ("Welke doos bedoelt de naam hier?"). Stadium 2 en 3 zijn overal
ongewijzigd — die mógen uitleggen, daarvoor betaalt de speler in het
oordeel.

### Docs en walkthrough

- `docs/levels-en-checkpoints.md` — nieuwe, bindende §"Wat een spread
  draagt" (verdeling bladzijde 1/2, variantneutraliteit, nul
  conceptuitleg, nooit een antwoord van hetzelfde level, en de
  dekkingsplicht die zegt dat de kantlijnnotitie de dragende laag is).
  De metafoortabel zegt nu dat de beelden alleen nog in de hints en de
  schetsen leven, niet meer in de brieven.
- `docs/achtergrond.md` §"Het notitieboek" — "spec, geen les", met de
  spread-inhoud herschreven; §"Toon en register" zegt nu dat de grens ook
  op de inhoud slaat en niet enkel op de toon (één zin kleur per
  hoofdstuk is het maximum).
- `docs/spelontwerp-legacy.md` §"De lus per level", stap 2 — "haar
  puzzelbrief" is "haar spec voor dat stuk" geworden, met de verwijzing
  naar de nieuwe §.
- `docs/art-stijlgids.md` — level 1 als uitzondering op de
  metafoor-schetsen, plus het `labels`-contract.
- `walkthrough/deel1-hints.md` — stap 2 ("Lees de spread") beschrijft de
  spec-vorm en zegt er expliciet bij dat er geen uitleg op die bladen
  staat; de twee gewijzigde hints zijn meegeschreven; level 1 noemt de
  klassekaart. PDF's herbouwd met de WP 39-keten.

## Beslissingen

- **De koppentabel van level 2 staat op twee plaatsen, en dat is opzet.**
  De kickoff vroeg "vermijd duplicatie: briefA = de koppentabel van de
  klasse, briefB = wat ze door elkaar haalde". Dat is gedaan tussen
  briefA en briefB. De stub-notitie draagt de tabel er echter óók, en dat
  is een bewuste afwijking: een spread is één keer te lezen en de editor
  is de plaats waar gewerkt wordt. Beide varianten zijn strikt genomen
  uit de getoonde code af te leiden (`private int levenspunten` plus
  `return levenspunten;` geeft het returntype; `this.levenspunten =
  nieuweWaarde` geeft het parametertype), maar een speler die de
  signatuur van een klasse wil nalezen, hoort niet terug te moeten naar
  een blad dat dicht is.
- **De lussoort blijft in de notities van level 5, 6 en 7 staan; de
  lusgrens niet.** "Ik loop met een for-lus over de index" is spec — het
  is haar ontwerpkeuze, en `lusVorm` eist ze. Ze weglaten maakt variant B
  van level 6 (een `while` waar een `for` hoort) letterlijk onoplosbaar:
  er is dan geen enkel spoor dat er een `for` verwacht wordt. "Strikt
  kleiner dan `size()`" is daarentegen het herstel van variant A, en dat
  staat er dus níét meer. Voor level 7 is de lussoort er in dit pakket
  bijgekomen — dezelfde redenering, en `l7.zoek.lus` eiste ze al.
- **De notitie van level 6 zegt niet meer wat er mis is dan "klopt
  niet".** Variantneutraliteit is hier hard: variant A is een grensfout,
  variant B een verkeerde lussoort. Elke zin die één van de twee benoemt,
  liegt tegen de helft van de spelers. Hetzelfde geldt voor de briefB, die
  nu "En in de gevechtsrondes evenmin" zegt in plaats van het
  rondes-antwoord.
- **De schets van level 1 krijgt labels; de andere zes niet.** De docent
  vroeg om een klassediagram, en dat is level 1's scharnier. De andere
  schetsen zijn metaforen die zonder tekst werken en die de hints nog
  dragen; ze verbouwen zou werk zijn zonder opdracht.
- **Geen nieuwe gfx-op voor tekst in een schets.** Zie hierboven: het
  `labels`-veld is de kleinste ingreep die de renderer, de lint en de
  test alle drie kunnen keuren.
- **`deel2-oplossingen.pdf` is teruggezet, niet vastgelegd** — de bron
  ervan is niet gewijzigd en de herbouw verschilde alleen in `ModDate`,
  `CreationDate` en de document-id. Dezelfde keuze als in WP 44 en 47.
  `deel1-hints.pdf` verandert wél (8 pagina's, ongewijzigd aantal).
- **De weekregels, hoofdstuktitels en bladzijde-2-koppen zijn niet
  aangeraakt.** Die zijn door `test-spreads.mjs` vastgepind en dragen geen
  uitleg.

## Checker-dekking per level

Geverifieerd tegen `checks[]` in `js/levels/levelN.js`. Kolom "waar" is de
plaats waar de speler het kan lezen: **N** = kantlijnnotitie/stub boven het
fragment, **C** = de getoonde code zelf, **A**/**B** = bladzijde 1/2 van
het spread. Een falende check levert bovendien altijd een
`pcMelding`-regel die de VORM benoemt (checker-contract, laag 2) — dat is
de vangnetlaag, nooit de eerste.

**Level 1** — `l1-editor-repair`

- `veldDeclaratie(String naam, private)` — C (staat intact) + N + A
- `constructorToewijzing(naam ← naam)` — N ("de constructor zet die drie
  velden") + C
- `constructorToewijzing(beschrijving)`, `(kracht)` — N + C
- Variantneutraal: "bij één veld klopt de toewijzing niet" dekt zowel de
  weggevallen `this` (A) als de omgekeerde toewijzing (B).

**Level 1** — `l1-editor-write`

- `veldDeclaratie(String naam)`, `(Schuilplaats schuilplaats)` — N (de
  ongewijzigde `geitjeStub`, met types) + A + de schets
- `constructorToewijzing(naam ← naam)`, `(schuilplaats)` — N + A
- `heeftReturn(getNaam → naam)`, `(getSchuilplaats → schuilplaats)` — N + A
- `gered` (niet gecheckt, wel in het model) — N + A + de schets

**Level 2** — `l2-editor-repair`

- `methodeSignatuur(int getLevenspunten())` — N (tabel) + A
- `methodeSignatuur(void setLevenspunten(int))` — N + A
- `methodeSignatuur(Voorwerp zoek(String))` — N + A + C (intact)
- `methodeSignatuur(boolean verwijder(String))` — N + A + C (intact)
- `heeftReturn(zoek)` — C (intact in beide varianten)
- Variantneutraal: briefB zegt "één ervan staat er nog verkeerd", zonder
  te zeggen welke.

**Level 3** — `l3-editor-repair`

- `geenVerbodenConstructies(setLevenspunten)` — cursusgrens, altijd
- `methodeSignatuur(void setLevenspunten(int))` — C (intact in beide
  varianten) + A
- `validatieKlem(onder 0, boven MAX_LEVENSPUNTEN|20)` — N **moet** dit
  dragen: variant B wist het hele bovengrens-blok, dus de constante staat
  dan nergens meer in het fragment. Ze staat in N én in A.
- Variantneutraal: "Aan één van de twee mankeert iets".

**Level 4** — `l4-editor-repair`

- `geenVerbodenConstructies(verbindKamers)` — cursusgrens
- `conditieGebruikt(cascade)` — N ("één if / else if-cascade") + A + C
- `methodeAanroep(setNoord|setZuid|setOost|setWest)` — N somt de vier bij
  naam op; A ook. Zonder die opsomming is de vervangen setter niet te
  vinden, want in de beschadigde code komt hij nergens voor.
- Variantneutraal: "één van de vier setters overal door een andere
  vervangen" — waar is niet gezegd.

**Level 5** — `l5-editor-write`

- `geenVerbodenConstructies` — cursusgrens
- `methodeSignatuur(int telWapens())` — N (`telWapens(): int`) + A
- `methodeSignatuur(Voorwerp sterksteVoorwerp())` — N + A
- `lusVorm(for)` ×2 — N ("allebei een for-lus over inventaris") + A
- `lusGrenzen(< …size)` ×2 — N (`i < inventaris.size()`) + A
- `heeftReturn` ×2 — volgt uit de returntypes in N; hint 3 draagt de vorm
- De stub is leeg (`// hier verder`), dus N is hier de enige codebron:
  vandaar dat de lusvorm er expliciet bij staat.

**Level 6** — `l6-editor-repair`

- `geenVerbodenConstructies(verwijderVoorwerp)` — cursusgrens
- `lusVorm(for)` — N ("Ik loop met een for-lus over de index") + A.
  Verplicht, zie de beslissing hierboven.
- `lusGrenzen(< …size)` — **bewust niet in N of A.** Dat is de reparatie
  van variant A; de speler krijgt hem uit de code (`i <= voorwerpen.size()`
  staat er te lezen), uit hint 2 en 3, en bij een foute inzending uit
  `pcMelding["lusGrenzen.offByOne"]`. Eerlijk gezegd: compileren is
  gratis (`oordeel()` in `js/logic/levels.js` telt alleen hints), dus die
  melding kost niets. Het weglaten verlegt de vindplaats van de grens, het
  maakt ze niet duur. Zie §"Adversariële review".
- `methodeAanroep(remove)` — C: `voorwerpen.remove(i)` staat in beide
  varianten al, en N zegt "gaat uit de lijst".
- Variantneutraal: "Wat er nu staat, klopt niet" en "In verwijderVoorwerp
  klopt de lus niet meer".

**Level 7** — `l7-editor-write`

- `methodeSignatuur(Geitje zoekGeitje(String))` — C (de stub-kop staat er)
  + N + A
- `lusVorm(for)` — N ("Eén for-lus over geitjes"), nieuw in dit pakket
- `lusGrenzen(< …size)` — niet in N; hint 3 en `pcMelding` dragen hem.
  Ongewijzigd t.o.v. vóór dit pakket.
- `heeftReturn(→ null)` — N ("dat geitje geef je terug, anders null") + A

**Level 7** — `l7-editor-repair`

- `aanroepKeten(getSchuilplaats → getKamer → getNaam)` — N noemt de drie
  schakels bij naam + A
- `aanroepKeten.nullVeilig` — N ("Null-veilig.") + B ("ze mist de
  null-controle of een schakel") + `pcMelding`. Dat woord in N is er ná
  de adversariële review bijgekomen: zónder hem is de notitie **volledig
  waar van variant A** (die heeft alle drie de schakels in de juiste
  volgorde en zakt enkel op `nullVeilig`), en dan staat de eis alleen nog
  op een blad dat dicht is. Dat de keten null-veilig moet zijn staat er
  dus; hóe je hem null-veilig maakt niet.
- `lusVorm(for)` — C: de for-lus staat in beide beschadigde varianten
- Variantneutraal: N zegt "aan de keten mankeert iets", B noemt de twee
  mogelijke gebreken naast elkaar zonder te kiezen.

## Adversariële review

De kickoff vroeg een adversariële checker-agent vóór de manager-QC. Die
heeft de drie passen gedraaid (spoilerjacht, oplosbaarheid/dekking,
variantneutraliteit) tegen de `git diff`. Wat ze vond, en wat ermee
gebeurd is:

**Bevestigd weg** — de vijf lekken die dit pakket moest doden zijn
regel voor regel tegen de oude tekst nagelezen en alle vijf verdwenen:
het `toon()`-schaduwantwoord (l2), `||`/`&&` (l3), aliasing én null (l4),
de modeloplossing én "één ronde te veel" (l6), "wijst de eerste pijl naar
niets" (l7). **Variantneutraliteit: geen enkele onware zin** over alle
zes de gedeelde notities/brieven — inclusief het lastige geval l6, waar
"Ik loop met een for-lus over de index" als spec leest en dus geen leugen
is tegenover de `while`-variant.

**Hersteld in dit pakket, naar aanleiding van de review:**

- **De null-eis van l7-repair was uit de notitie verdwenen.** Zie de
  dekkingstabel: de notitie was volledig waar van variant A, dus die
  speler had geen enkel signaal op het scherm. "Null-veilig." staat er nu
  bij — de eis, niet het recept.
- **Vijf van de zeven bladzijde-1-brieven waren hun eerste persoon
  kwijt.** `achtergrond.md` §"Toon en register" eist "eerste persoon over
  haar eigen spel", en l2, l3, l4, l5 en l7 waren typedumps zonder
  spreker geworden. Eén werkwoord per blad hersteld, zonder een woord
  spec in te leveren: "daar hou ik de koppen streng", "Haar levenspunten
  hou ik tussen 0 en MAX_LEVENSPUNTEN", "Vier richtingen leg ik in één
  cascade", "Allebei laat ik een for-lus over inventaris lopen", "per
  geitje volg ik getSchuilplaats()".
- **l3-briefB wees nog naar de conditie.** "In de poortcheck zit een fout
  in de voorwaarde" wijst op regel 1, en dat ís het antwoord van
  `l3-vindfout`. Nu: "En de poortcheck klopt niet."
- **En hetzelfde antwoord stond in de schets ernaast.** Zelf gevonden bij
  het nakijken van de screenshots: de kantlijn van de l3-schets zette
  `&&` (twee streepjes) en `||` (twee palen) naast elkaar met een rode
  doorhaling erachter, en op die schaal leest dat als "niet `||`" — het
  antwoord van `l3-vindfout`, getekend op de bladzijde die de vraag
  stelt. De twee operatoren blijven (dat is het scharnier van hoofdstuk
  3), het kruis is weg. De rode doorhalingen in de schetsen van level 2,
  4 en 7 blijven: die tekenen `void`, `null` en een doodlopend spoor —
  het hoofdstukbeeld, niet het antwoord van een puzzel.

**Erkend en niet opgelost — voor de manager, want ze vallen buiten de
opdracht van dit pakket:**

- **De trace-opgaven drukken de modeloplossing van hun eigen level af, en
  de puzzelvolgorde is vrij.** `l6-trace` toont
  `for (int i = 0; i < voorwerpen.size(); i++)` — teken voor teken de
  herstelde kop van `l6-editor-repair` variant A — en `l7-trace` toont de
  null-veilige keten van `l7-editor-repair` variant A. `kies()` in
  `js/pc/pc.js` poort de volgorde niet, dus een speler kan met de trace
  beginnen. Dit is het zwaarste resterende lek en het is **structureel**,
  niet tekstueel: het vraagt herschreven trace-opgaven of een
  puzzelvolgorde-poort, plus een pas over `check-walkthrough` (dat de
  trace-sjablonen over hun hele pool uitrekent). Bestond al vóór dit
  pakket.
- **Het l2-editorfragment bevat het antwoord van `l2-parsons`.** Beide
  beschadigde varianten dragen de intacte `zoek`-methode, en dat is
  woordelijk `l2-parsons.regels` in de juiste volgorde. Ook structureel,
  ook ouder dan dit pakket.
- **De `termen`-kop van bladzijde 2 draagt nog leerstof.** "Eerste index
  0, laatste size() min 1; welke lus kies ik" (l6) is de plankenbrugles in
  cursustaal en raakt aan het antwoord van `l6-trace`; "Tellen,
  totaliseren, opbouwen, filteren, uiterste" (l5) is de optielijst van
  `l5-patroonkaart`; "Twee variabelen, één object; null" (l4) is de kern
  van `l4-trace` en `l4-verklaar`. Bewust niet aangeraakt: de
  scharniertermen op bladzijde 2 zijn een WP 31-ontwerpbeslissing (ze
  zeggen de speler waar hij in zijn cursus moet zoeken), ze zijn door
  `test-spreads.mjs` vastgepind, en de opdracht van dit pakket zette ze
  expliciet buiten scope. Als de docent ook die wil kaal maken, is dat een
  eigen pakket met een eigen beslissing.
- **`i < inventaris.size()` staat nu in de brief van level 5**, één
  hoofdstuk vóór level 6 dezelfde vorm onbegeleid vraagt. Aanvaard: level
  5 schrijft van nul en heeft de vorm nodig voor zijn eigen dekking.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **432/432 groen** (was 431/431; één
  nieuwe test: "elk schets-label past binnen het schetskader").
- `node tools/lint-scene.mjs` — "Alle scènes in orde." De nieuwe
  label-keuring is aangetoond door ze te laten zakken: een label op
  x 280 gaf "l1.labels[2]: \"schuilplaats\" meet 55 px en loopt voorbij
  de rechterrand van het schetskader", een label op y 158 gaf
  "…valt buiten het schetskader".
- `node tools/check-assets.mjs` — "Geen drift: alle 9 editor-modellen
  komen byte-getrouw uit de broncode."
- `node tools/check-walkthrough.mjs` — "275 citaten en koppen gekeurd; 0
  afwijkingen" (was 278; de drie minder zijn de twee herschreven
  hintcitaten en de weggevallen "puzzelbrief"-formulering).
- `node tools/check-docpaden.mjs` — "980 aangehaalde paden gekeurd; 0
  dood in een contractdocument, 26 in `workflow/` (historisch, geen
  poort)".
- `javac -encoding UTF-8 -d out src/*.java` — schoon; de verboden-grep
  (`switch|enum|->|Stream|\bvar `) geeft niets terug (exit 1). De Java
  is in dit pakket niet aangeraakt.
- Smokes: `smoke-browser` **46/46**, `smoke-levels-1-3` **36/36**,
  `smoke-levels-4-7` **53/53**, `smoke-full-playthrough` **104/104** —
  alle vier ongewijzigd t.o.v. WP 47.
- Bladbudget nagemeten met dezelfde som als `test-spreads.mjs`: geen
  pagina komt boven haar spiegel (p1 max 22/24 op l1, p2 max 13/19 op
  l7) en geen gewrapte regel is breder dan de kolom van 136 px.
- Regelbreedte van de gewijzigde markdown op 80 tekens gecontroleerd.

Screenshots in `test-results/`: `wp48-spread-l1.png` en `-l1-p2.png` (met
de klassekaart), `wp48-spread-l3(-p2).png`, `wp48-spread-l6(-p2).png`,
`wp48-spread-l7(-p2).png`, `wp48-editor-l1.png`, `wp48-editor-l6.png`.
