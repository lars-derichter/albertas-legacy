# 45 — De stem: overdracht van een programmeur

## Opdracht

WP 45 uit de fixronde (zie `workflow/41-fixronde-kickoff.md`, §wortels
item 4 en §Bijlage). Uit Lars' speeltest, verbatim:

> The writing is still too 'meta', the notebook and the comments still
> speak to a reader instead of being Alberta's private notes. For the
> code comments that looks stupid: delete the header: 'Alberta's
> notitie' everywhere.
> For the notebook, either the backstory needs a little more fleshing
> out: Alberta knew something would happen to her and knew she would
> not be able to finish the game, and this should become clear from the
> opening and should color the notes in the notebook, or she did not
> know that she would disappear and then the notes should read as
> private notes to herself. In either case they should read more like
> the notes of a competent programmer and less like the notes of a
> teacher. What do you think?

Lars koos (2026-07-26): **"She knew"** en voor de codenotities **"Terse
note + '— A.'"**. Dit pakket voert dat uit in vier lagen — de
verhaalbijbel, de opening, de veertien notitieboek-bladzijden en de elf
stub-notities — plus de walkthrough die ze citeert.

## Aanpak

### 1. `docs/achtergrond.md` draagt het voorgevoel

- **Nieuw beslissingsblok** onder §De verdwijning, náást (niet in plaats
  van) het oude: Alberta wist dat ze het niet zou afmaken, en het
  notitieboek is daarom een bewuste overdracht aan een opvolger die ze
  niet kende. Het blok maakt het onderscheid expliciet waar een volgende
  sessie op kan afdrijven: *een voorgevoel is een feit zonder uitleg*. Het
  staat in wat ze déed — nummeren, ordenen, opschrijven wat ontbreekt, de
  broncode-doos dichtplakken met "pas op het einde" — nooit in wat ze
  zegt. Geen afscheidsbrief, geen "als je dit leest, ben ik er niet meer",
  geen aanleiding, geen dreiging, geen datum. De drie richtlijnen
  ("nooit een oorzaak noemen" op kop) staan er woord voor woord
  ongewijzigd en gelden onverkort; het voorgevoel is er één bij, geen
  uitzondering erop.
- **§De verdwijning** krijgt een alinea die het gegeven brengt zoals de
  prose het hoort te brengen: via het boek, niet via een verklaring
  ("Wie enkel voor zichzelf schrijft, nummert niet en adresseert niet.
  Hóe ze het wist staat nergens, en dat blijft zo.").
- **§Het notitieboek** zegt nu dat het een werkboek was dat ze tot een
  overdracht heeft omgebouwd, met een tweede alinea over de hand: die van
  een programmeur, niet van een lesgeefster; haar beelden (blauwdruk en
  doos, de plankenbrug, de speurtocht) zijn haar eigen steno en geen
  didactisch materiaal; de aanhef aan de onbekende lezer staat één keer in
  het boek — hoofdstuk 1 — en daarna zegt ze per hoofdstuk wat er nog niet
  af is.
- **De weekregel-bullet** (§Het notitieboek) is haar eigen planning
  geworden en benoemt de dubbele boekhouding: buiten de fictie is het de
  cursusweek uit `levels-en-checkpoints.md`, in haar hand is het de week
  waarin zíj dat stuk wilde bouwen. Op papier van 1993 staat het woord
  "cursus" niet meer.
- **§Toon en register** (Alberta's stem) en de toon-bullet in §Wie is
  Alberta: droog en competent, eerste persoon over haar eigen klassen, en
  wat er ontbreekt vóór wat het betekent. Met de grens erbij: nooit een
  imperatief die naar een klaslokaal ruikt ("Schrijf de private
  velden…"), wel de stand van zaken ("de bedrading tussen de kamers ligt
  los"). Warm blijft ze in het oordeel, niet in elke regel.

### 2. De opening (vijf beats, `AL.strings.intro`)

De reeks staat nog op drie beelden (huis, trap, pc) en telt nog vijf
beats; de herverdeling zit binnen beat 2 en 3.

- Beat 1 (het huis) is ongewijzigd.
- Beat 2 neemt de beschadiging én de inhoud van het spel samen (het
  notitieboek + de zes opgeslokte geitjes, de klokkast, de afrekening).
- Beat 3 is nieuw en draagt het voorgevoel: "Zeven hoofdstukken,
  genummerd, elk met een week erbij. Bij elk staat wat er nog aan
  ontbreekt. Het eerste is gericht aan wie het boek zou vinden — iemand
  die ze niet kende." Het woord "voorgevoel" valt niet, er staat geen
  oorzaak, en er staat ook niet dát ze het wist: er staat wat ze gedaan
  heeft. De som maakt de speler zelf. "Ze heeft het niet afgemaakt" staat
  in beat 2, bij het spel waar het over gaat.
- Beat 4 draagt de gemandateerde zin verbatim ("Alberta bouwde elk spel
  eerst als tekstversie in de terminal. Zo begon ze altijd.") en is
  ongewijzigd; beat 5 blijft de tutorial in systeemstem.

### 3. De veertien notitieboek-bladzijden

- **`maakSpread` verliest twee sjabloonzinnen.** "Voor jou die dit later
  leest:" stond op alle zeven eerste bladzijden — een aanhef die zeven
  keer opnieuw begint, leest als een formulier. Ze staat nu één keer, in
  haar eigen woorden, als de eerste twee regels van hoofdstuk 1: "Wie dit
  boek vindt: maak het af. Ik kom er niet meer aan toe, dus staat bij elk
  hoofdstuk wat er nog aan ontbreekt."
- **De voet** "Dit zou je moeten kunnen na week N van de cursus." is
  "Week N in mijn schema." geworden — korter (één gewrapte regel in plaats
  van twee) en zonder onze cursus in haar handschrift.
- **De zeven briefA's** zijn van definitie naar ontwerpnotitie gegaan.
  Ze gaan over haar eigen spel en niet over de leerstof in het algemeen:
  `Voorwerp` en `Geitje` die ze "één keer tekent" en waaruit ze er zeven
  giet; `Speler` als "de klasse waar alles langs komt"; de kruik
  geitenmelk van +6 die niet over `MAX_LEVENSPUNTEN` mag; de noord-buur
  van de molen die zuid terugkrijgt; de statusregel van `toonStats` die
  twee dingen wil weten; de plankenbrug waarop een lus die één stap te
  ver loopt "er precies goed uitziet"; en in hoofdstuk 7 het afroepen van
  de zeven. Waar een definitie stond, staat nu de valkuil: niet "een
  klasse is een blauwdruk" maar "veld en parameter heten in die
  constructor hetzelfde; 'this' is het enige wat ze uit elkaar houdt".
- **De zeven briefB's** zijn overdrachtstaken in de stand-van-zaken-vorm,
  zonder imperatief: "In verbindKamers is één van de vier setters overal
  door een andere vervangen; die richting wordt nergens meer gelegd", "In
  verwijderVoorwerp klopt de lus niet meer. De vorm die er hoort te
  staan: …". Hoofdstuk 1 en 7 ondertekenen: "— A." en "Hier stop ik. — A."
- **Titels, `termen` en de weeknummers zijn niet aangeraakt**;
  `test-spreads.mjs` pint ze en de pc-kop hangt eraan.

### 4. De elf stub-notities in `js/levels/`

De kop `// Alberta's notitie — X:` is overal weg, met de inspringing van
`//   ` die erbij hoorde. Elke notitie is nu een blok kantlijn-regels dat
op `— A.` eindigt en dat zegt wat er ontbreekt in plaats van wat de
speler moet doen. Representatief:

- level 1, `Geitje`: "Schrijf de private velden, de constructor die naam
  en schuilplaats invult …, en de getters getNaam() en getSchuilplaats()."
  → "De private velden, de constructor die naam en schuilplaats invult en
  de getters getNaam() en getSchuilplaats() staan er nog niet. — A."
- level 2, `Speler`: "Zet de koppen recht: wat geeft de methode terug, en
  wat gaat erin?" → "De koppen van Speler heb ik zelf door elkaar gehaald
  en nooit rechtgezet. — A."
- level 4, `verbindKamers`: "Er raakte bedrading los — herstel ze." →
  "Hier is bedrading losgeraakt: één richting legt de terugweg niet
  meer. — A."

De ingespoten plaatshouder `// schrijf hier je code` (en zijn twee
varianten `// schrijf hier je twee lus-methoden` en `// schrijf hier je
zoeklus`) is `// hier verder` geworden, in de vier write-stubs
(level 0 en 1 `Geitje`, level 5 `Speler`, level 7 `zoekGeitje`).

### 5. Wat de notities nog moeten dragen

Per level nagelezen tegen `checks[]` in `js/levels/levelN.js`, want een
notitie die stopt met instrueren mag niet stoppen met informeren:

- level 1/0 `Geitje`: de vier veldtypes en de twee getternamen staan er
  nog, in proza (`veldDeclaratie`, `constructorToewijzing`, `heeftReturn`).
- level 3: de notitie noemt `MAX_LEVENSPUNTEN` nu bij naam. Dat is geen
  decoratie — in variant B is het hele bovengrens-blok weggevallen en
  staat de constante nergens meer in het fragment.
- level 5: `int` en `Voorwerp` blijven staan, precies zoals WP 30 besliste
  (de stub geeft geen signaturen, de checker eist ze exact).
- level 7: `zoekGeitje`, `Geitje`, `null` en de keten
  `schuilplaats.getKamer().getNaam()` staan er nog.

### 6. Verwijzingen, walkthrough en PDF's

- Verse grep op `Alberta's notitie` en `notitie —`: buiten `workflow/`
  (historisch) blijft alleen "Alberta's notities als comment" in
  `js/pc/editor.js`, `docs/spelontwerp-legacy.md`,
  `docs/checker-contract.md` en `docs/art-stijlgids.md` over. Die vier
  zeggen dat de editor Alberta's notities als commentaar toont, en dat
  klopt nog; ze noemen de kop niet. Ze zijn dus niet aangeraakt.
- Twee hintteksten die wél zouden liegen zijn wel bijgewerkt:
  `l0-editor-write` fase 2 zei "Vergelijk met wat de notitie *vraagt*" (de
  notitie vraagt niets meer, ze somt op) en `l3-vindfout` fase 2 zei "Lees
  de notitie" bij een terminal-puzzel die geen editor en dus geen notitie
  toont — dat is nu "Lees de vraag nog eens".
- `js/logic/strings.js`, `notitieboek.onderzoek` citeert de voet van het
  spread dat op de kist openligt; dat citaat is meegegaan naar "Week 1 in
  mijn schema."
- De bestandskop van `js/levels/level1.js` beweerde dat "Alberta's
  notities" in `strings.js` leven. Dat was nooit waar en het is nu de
  plaats waar iemand ze zou gaan zoeken: de kop zegt dat de kantlijn-
  notitie een Java-commentaar is en dus bij de code hoort die de editor
  laadt. De maximale commentaarregel in de elf stubs is met de
  herschrijving van 81 naar 79 tekens gegaan, dus de editor toont ze nog
  even ruim als vroeger.
- `walkthrough/deel1-hints.md`, stap 2 van "de grote lijn": het citaat van
  de weekregel is bijgewerkt en er staat één zin bij over voor wie ze die
  bladen schreef. `deel1-hints.pdf` herbouwd met pandoc 3.10 en typst
  0.15.0 uit de scratch-map; `deel2-oplossingen.pdf` ook herbouwd maar
  teruggezet (identiek op 108 tijdstempel-bytes na — de WP 44-precedent).

## Beslissingen

- **Eén signatuur per stub, en die staat in de notitie.** Lars' label was
  "terse note + '— A.'", en de plaatshouder ín de klasse hoort bij die
  notitie. `// hier verder — A.` eronder zou dezelfde hand twee keer laten
  ondertekenen op negen regels. De notitie ondertekent; de plaatshouder is
  kaal ("// hier verder") en blijft daarmee kort genoeg om een
  plaatshouder te zijn.
- **De aanhef staat één keer, en niet in de eerste persoon meervoud.**
  Hoofdstuk 1 opent met "Wie dit boek vindt: maak het af." Hoofdstuk 2 t/m
  6 spreken de lezer niet meer aan; hoofdstuk 7 sluit met "Hier stop ik. —
  A.". Dat is de boog die de kickoff vroeg (expliciet één keer, daarna
  impliciet), en het spaart bladbudget waar de briefA's het nodig hebben.
- **Twee fouten in de spread van hoofdstuk 3 meegefixt.** Er stond "in
  Gevecht stond een && waar een || hoort", terwijl de puzzel het
  omgekeerde is: "beide moeten waar zijn" vraagt `&&`, en de code gebruikt
  `||` (zie `l3-vindfout` en zijn hints). De brief stuurde de speler dus
  de verkeerde kant op. En de plaats klopte niet: `Gevecht.java` heeft geen
  poortcheck (zijn enige `&&` is de rondegrens); de conditie uit de puzzel
  is de poort naar het volgende hoofdstuk. Nu: "in de poortcheck staat een
  || waar && hoort: hij ging bij mij al open op één van de twee".
- **Elke notitie of brief die door twee varianten gedeeld wordt, blijft
  neutraal over wat er mis is.** Level 1 kan de `this`-verwijzing missen
  (A) of de toewijzing omgekeerd hebben (B, met `this` er wél maar aan de
  verkeerde kant): "bij één veld krijgt het veld nooit wat de parameter
  ervoor klaarzet" dekt beide. Level 4 vervangt in A `setZuid` en in B
  `setWest` overal door een andere setter: "één van de vier setters is
  overal door een andere vervangen; die richting wordt nergens meer
  gelegd." Level 6 loopt in A één plank te ver en is in B de verkeerde
  soort lus, met correcte grenzen: "de lus klopt niet meer" plus de vorm
  die er hoort te staan. Level 7 mist in A de null-controle en in B een
  schakel: "aan de keten mankeert iets — ze mist de null-controle of een
  schakel."
- **De vorm `this.<veld> = <parameter>;` is uit de notities van level 0 en
  1 verdwenen.** Ze stond er als sjabloon-instructie, en dat is precies
  het lesgeefster-register. Ze is niet nodig: in het beschadigde fragment
  staan de twee gave toewijzingen erboven en eronder, en hintfase 3 draagt
  de vorm voor wie ze niet ziet.
- **`artikel.getCategorie()` uit de brief van hoofdstuk 7 vervangen door
  haar eigen keten, volledig.** Een voorbeeld met artikelen en categorieën
  komt uit een cursusoefening, niet uit een spel over geitjes. Er staat nu
  `getSchuilplaats()`, en op wat dat teruggeeft `getKamer()` en dan
  `getNaam()` — alle drie de schakels die `aanroepKeten` eist, zodat de
  brief niet suggereert dat de `Kamer` zelf het doel is. De keten blijft in
  stukken geknipt, om de reden die er al stond: één woord van meer dan een
  twintigtal tekens is breder dan de kolom van 136 px en wordt niet
  gebroken.
- **Drie tests bijgewerkt in plaats van de tekst eraan aangepast.** Twee
  keuringen pinden de oude voetzin: `test-world-hub.mjs` zocht
  `"week N "` met een kleine letter en een spatie erachter, en
  `test-spreads.mjs` zocht `"week N."` in de onderzoektekst van het
  notitieboek. Beide meten nu de bedoeling in plaats van de bewoording:
  het weeknummer ongeacht kapitaal, en "de onderzoektekst citeert de voet
  van dat spread woord voor woord". Er is één keuring bij: de voet mag het
  woord "cursus" niet meer dragen en moet in de eerste persoon staan.
- **De opening krijgt eindelijk een meting.** "Geen enkel onderschrift van
  de opening pagineert" was sinds WP 19 een regel die met de hand
  nagerekend werd; nu staat ze als test in `test-typografie.mjs`, met de
  echte maten uit `js/engine.js` (38 tekens, 6 regels). De vijf beats
  meten 5, 5, 4, 4 en 2 regels.
- **De Java-broncode is niet aangeraakt.** Nagelezen
  (`seven-little-goats/src/Speler.java` en de grep van WP 30): die
  commentaren zijn al werknotities in de eerste persoon ("Kortschrift; ik
  vraag dit overal", "ik wil dat ze vóór de rivier ziet wat ze in handen
  heeft") en niets erin spreekt een lezer aan
  of veronderstelt dat ze het spel zou afmaken. Ze dragen het voorgevoel
  niet en spreken het niet tegen, en dat is juist: het zijn werkbladen,
  geen overdracht.
- **`workflow/28-kwaliteitsreview-kickoff.md` blijft staan zoals het
  staat**, inclusief de regel «De kopvorm "// Alberta's notitie — X:"
  blijft». Het narratieve logboek is een verslag van wat er toen besloten
  is, geen contract; deze entry is de plek waar die beslissing wordt
  teruggedraaid.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **425/425 groen** (was 423; de twee
  nieuwe zijn de opening-paginering en de weekregel-keuring).
- `tools/lint-scene.mjs` — "Alle scènes in orde."
- `tools/check-assets.mjs` — "Geen drift: alle 9 editor-modellen komen
  byte-getrouw uit de broncode." De notities staan buiten de modellen, dus
  deze poort bewijst tegelijk dat er geen code in de varianten geschoven
  is.
- `tools/check-walkthrough.mjs` — **278 citaten en koppen gekeurd; 0
  afwijkingen**. Onderweg wél één afwijking gemeten, precies de bedoelde:
  «deel1: citaat staat nergens in de spelteksten: "Dit zou je moeten
  kunnen na week X van de cursus"» — de lint vond de drift in de gids
  vóór hij bijgewerkt was.
- `tools/check-docpaden.mjs` — "934 aangehaalde paden gekeurd; 0 dood in
  een contractdocument, 26 in workflow/ (historisch, geen poort)."
- Java-poort ongewijzigd en toch bewezen: `javac -encoding UTF-8 -d out
  src/*.java` exit 0, `grep -nE 'switch|enum|->|Stream|\bvar '` over
  `src/*.java` leeg.
- Smokes: `smoke-browser` **44/44**, `smoke-levels-1-3` **36/36**,
  `smoke-full-playthrough` **104/104** — alle drie gelijk aan WP 44.
- Bladbudget nagemeten met de echte `handschriftBreedte` (naast de test,
  met een wegwerpscript dat elke gewrapte regel afdrukt): bladzijde 1
  gebruikt 14–22 van de 24 regels, bladzijde 2 11–14 van de 19, en de
  breedste gewrapte regel meet 136 px van de 136 beschikbare. Geen
  bladzijde kapt af.
- PDF's: `bouw-walkthrough.sh` exit 0 met pandoc 3.10 en typst 0.15.0 —
  deel 1 **8 pagina's / 150 244 bytes** (was 150 123), met `pdftotext`
  nagelezen op de nieuwe weekregel; deel 2 teruggezet (108
  tijdstempel-bytes). De font-waarschuwingen over "courier new" en
  "nimbus mono ps" zijn de bekende open post van WP 39.
- Screenshots in `test-results/`: `wp45-opening-2.png` en
  `wp45-opening-3.png` (het notitieboek en het bewijs),
  `wp45-spread-l{1,3,6,7}.png` en `-p2.png` (de acht herschreven
  bladzijden, met de nieuwe voet en de "— A."-ondertekening) en
  `wp45-editor-l1.png` (de editor met de kopvrije stub-notitie en
  `// hier verder`).
- Wrap op 80 tekens gecontroleerd (in tekens, niet in bytes) voor elke
  gewijzigde doc-regel, voor `deel1-hints.md` en voor deze entry.

## Tegencontrole

Een tweede agent las het pakket adversarieel na vóór de commit en vond
vijftien punten: twee blokkers, zeven should-fixes, vijf nitpicks en één
punt dat de manager afwees. Alles wat bleef staan is in dezelfde werkboom
rechtgezet, op één punt na (de laatste bullet hieronder); de rest van deze
entry beschrijft de eindtoestand. Wat de ronde opleverde:

- **Feitelijk fout, hoofdstuk 3.** De brief zei dat de klem voorkomt dat
  "een dood geitje weer opstaat". `setLevenspunten` zit op `Speler`
  (Roodkapje); een `Geitje` heeft geen levenspunten. De echte redenen
  staan in `Speler.java` zelf: de kruik geitenmelk geeft +6 en mag niet
  over `MAX_LEVENSPUNTEN`, en onder 0 komt er een negatief getal in de
  statusregel terwijl ze al dood is. Dat staat er nu.
- **Vijf verouderde citaten in contractdocumenten.** De oude voetzin stond
  nog letterlijk in `levels-en-checkpoints.md`, `spelontwerp-legacy.md`,
  `art-stijlgids.md` en `README.md`; `art-stijlgids.md` motiveerde de
  drie-regels-ruimte met díe lange zin en verwees bovendien naar een
  brieffragment dat dit pakket had geschrapt ("volgens de schets
  hieronder"). Alle vijf bijgewerkt — de weekregel-passages met de nieuwe
  voet en met wie de week toebehoort, en de schets-motivering staat nu op
  eigen benen (de schets hoort bij de stand van zaken; level 5 als
  voorbeeld).
- **Mijn eigen nieuwe regel drie keer overtreden.** `achtergrond.md` zegt
  sinds dit pakket "nooit een imperatief die naar een klaslokaal ruikt", en
  de brieven van 4, 6 en 7 zeiden nog "Let op waar…", "Zoek de
  off-by-one… en kies de lus" en "Schrijf de zoeklus…". Alle drie zijn
  stand-van-zaken geworden, zoals de andere vier.
- **Restanten definitie-register.** Hoofdstuk 2 gaf nog de trechter/goot-
  glossering plus de driedeling attribuut/parameter/lokaal als taxonomie
  (en `js/levels/level2.js` dezelfde zin), hoofdstuk 4 definieerde `null`
  en hoofdstuk 1 sloot met "this is déze doos". Alle vier vervangen door de
  valkuil in plaats van de definitie: `toon()` die de kale naam en
  `this.levenspunten` verschillend afdrukt, "waar geen gang is, blijft de
  buur null", en veld en parameter die dezelfde naam dragen.
- **Twee onwaarheden over de tweede variant** (level 1 en level 6) en twee
  keer een verkeerde afzender: hoofdstuk 5 schreef `sterksteVoorwerp` aan
  "het gevecht" toe terwijl beide lus-methoden de statusregel van
  `toonStats` voeden (`Spel.java`), en hoofdstuk 3 legde de poortcheck in
  `Gevecht`. Rechtgezet, met de bron erbij in het commentaar.
- **De ketting van hoofdstuk 7 stopte op `getKamer()`** terwijl
  `aanroepKeten` drie schakels eist; de brief suggereerde daarmee dat de
  `Kamer` het doel is. Nu staat `getNaam()` erbij.
- **De opening zei het nog te veel.** "Ze heeft het niet afgemaakt; dat
  wist ze toen ze het schreef" vertelde precies de som die het bewijs al
  maakt, en "aanhef" is een meta-woord over een tekst. Beat 3 eindigt nu op
  de feiten (genummerd, een week per hoofdstuk, wat er ontbreekt, gericht
  aan wie het zou vinden); "Ze heeft het niet afgemaakt" staat in beat 2.
- **Afgewezen door de manager (geen wijziging):** dat de kop van bladzijde
  2 (`termen`) in cursustaal staat. Die koppeling is precies wat WP 31
  moest leveren en wat Lars vroeg — de brug tussen hoofdstuk en scharnier.
  De meta-lekkage zat in de voet ("van de cursus"), niet in de termenlijst.
  Dit is dus een bewuste uitzondering op "geen cursustaal in haar hand".
- **Open, buiten het mandaat van deze worker:** `CLAUDE.md` documenteert de
  poort als `node --test test/`, en dat commando werkt niet op Node 22
  (`Error: Cannot find module '/home/user/albertas-legacy/test'`, exit 1) —
  het moet `node --test test/test-*.mjs` zijn, wat elk pakket ook echt
  draait. Een worker-agent past `CLAUDE.md` niet aan op vraag van een
  andere agent; dit ligt bij de manager of bij Lars.
