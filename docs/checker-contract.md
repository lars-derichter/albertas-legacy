# Checker-contract

Het contract van de Java-checker: hoe puzzelcode van de speler wordt beoordeeld
zonder een echte JVM. De checker leeft in `js/logic/checker/` (`tokenizer.js`,
`asserts.js`, `javacsim.js`), is volledig DOM-vrij en Node-testbaar, en is het
zwaarst geteste stuk van het project (WP 4). Dit document legt vast wat de
checker wel en niet doet, welke asserties hij kent, hoe tolerant hij is, en hoe
falen wordt vertaald naar vriendelijke, Nederlandstalige feedback. De
puzzeldefinities (`js/levels/levelN.js`) leunen op deze bouwstenen.

## Wat de checker is — en niet is

- **Geen compiler.** Er draait geen `javac`, geen JVM, geen echte parser. De
  checker herkent structuur, geen semantiek.
- **Geen volledige parser.** Een tokenizer plus per-puzzel asserties,
  meer niet. Hij bouwt geen AST; hij zoekt patronen in de tokenstroom.
- **Structureel, niet uitvoerend.** Hij controleert dat de code de juiste vorm
  heeft (een veld is gedeclareerd, een constructor kent `this.x = x` toe, een
  signatuur klopt, een lus heeft de juiste grenzen), niet dat ze een bepaalde
  uitvoer produceert. Trace- en voorspel-puzzels worden apart afgehandeld (zie
  §"Niet-editor-puzzels").
- **Deterministisch en snel.** Zelfde invoer → zelfde oordeel; draait
  synchroon in de browser en in Node-tests.

Deze afbakening is een bewuste keuze: een echte compiler in de browser zou de
cursusgrenzen en de nul-dependency-regel breken, en zou bovendien onvriendelijke
foutmeldingen geven. Een structurele checker houdt de feedback in de hand.

## De tokenizer

`tokenizer.js` zet Java-broncode om in een tokenlijst, **bewust van strings en
commentaar** zodat trefwoorden binnen een string of commentaar nooit als code
tellen.

Scope:

- **Strings**: `"..."` met escapes (`\"`, `\\`, `\n`). De inhoud is één
  string-token; trefwoorden erin tellen niet.
- **Char-literals**: `'x'`, `'\n'`.
- **Commentaar**: `// tot regeleinde` en `/* ... */`. Wordt overgeslagen,
  nooit als code getokeniseerd en nooit als triviatoken bewaard.
- **Identifiers en trefwoorden**: `[A-Za-z_][A-Za-z0-9_]*`.
- **Getallen**: gehele en decimale literals.
- **Operatoren en interpunctie**: `= == != <= >= && || ! + - * / % ( ) { } [ ]
  ; , .` en de samengestelde die de cursus gebruikt.

Elk token draagt zijn type, zijn tekst en zijn positie (regel/kolom) zodat een
gesimuleerde `javac`-diagnose naar de juiste regel kan wijzen. De tokenizer kent
geen Java-grammatica; hij levert alleen een schone stroom waarop de asserties
patronen matchen.

## Normalisatie

Voor het matchen normaliseert de checker de tokenstroom zodat onbelangrijke
verschillen wegvallen:

- **Whitespace** tussen tokens is betekenisloos (`this.x=x` ≡ `this . x = x`).
- **Regeleinden en inspringing** tellen niet mee voor de match (wel voor de
  positie in een diagnose).
- **Commentaar** telt niet mee.
- **Optionele haakjes** worden niet automatisch weggewerkt: `(a && b)` en
  `a && b` verschillen alleen als een assertie expliciet toleranter is (zie de
  tolerantieregels).
- **Overtollige puntkomma's** en lege statements: `tokenizer.splitStatements`
  kan een tokenstroom in statements knippen en lege statements weglaten, maar de
  asserties gebruiken die splitsing niet — ze zoeken hun patroon in de rauwe
  stroom, waar de `;`-tokens gewoon staan. In de praktijk maakt dat geen
  verschil, want geen enkele assertie eist een leeg statement.

Normalisatie raakt nooit de betekenis: `<` wordt nooit `<=`, `&&` nooit `||`.
Alleen opmaak verdwijnt.

## De assertie-woordenlijst

`asserts.js` levert een bibliotheek van structurele asserties. Een puzzel is een
geordende lijst asserties tegen de genormaliseerde tokenstroom van
de speler. Elke assertie geeft `{ ok, meldingKey, regel }`; `meldingKey`
verwijst naar een feedbacksleutel en `regel` naar het regelnummer waar het
misging (zie §"Falen → feedback"). De kern-asserties:

De namen hieronder zijn de **echte functienamen** uit `asserts.js` (het
`asserts`-register onderaan het bestand); de level-definities in
`js/levels/levelN.js` roepen ze aan via `fn: "<naam>"` met een `config`-object.

| Assertie | Controleert |
|---|---|
| `veldDeclaratie({type, naam, privaat?})` | een veld `<type> <naam>;` is gedeclareerd; bij `privaat` moet `private` erbij staan (overige modifiers tolerant) |
| `constructorSignatuur({naam, params[]})` | de constructor heeft exact deze parametertypes en -volgorde |
| `constructorToewijzing({veld, param?, klasse?})` | in de constructor staat `this.<veld> = <param>;`; herkent de omgekeerde fout `<param> = this.<veld>` |
| `methodeSignatuur({retour, naam, params[], zichtbaarheid?})` | een methode met exact dit returntype, deze naam en deze parametertypes/-volgorde; met `zichtbaarheid` ook `public`/`private` |
| `heeftReturn({methode, retourVorm?})` | de methode bevat minstens één `return`; optioneel in een bepaalde vorm (bv. `return <veld>;` of `return null;`) |
| `conditieGebruikt({methode, operator, structuur?})` | een `if`-conditie gebruikt de gevraagde operator (`&&`, `\|\|`, `!`); `structuur: "cascade"` eist bovendien een `else if` |
| `validatieKlem({methode, onder, boven})` | de validatie-clamp: `if (x < onder) x = onder;` en `if (x > boven) x = boven;` (checkpoint 3; level 3 zet er twee beschadigde varianten tegenover) |
| `lusVorm({methode, soort})` | de lus is van de juiste soort: `for` / `foreach` / `while` (checkpoint 5–6) |
| `lusGrenzen({methode, vergelijk?, grensBevat?})` | de `for`-grens klopt; `<` vs `<=` telt (off-by-one van checkpoint 6), en `grensBevat` eist een term in de conditie (bv. `size`) |
| `aanroepKeten({methode?, stappen[], nullVeilig?, contigue?})` | een ketting `a.getX().getY()...` met de juiste opeenvolgende getters, eventueel null-veilig gesplitst (checkpoint 7) |
| `methodeAanroep({methode, naam})` | binnen `<methode>` wordt `<naam>` aangeroepen (bv. `setNoord` binnen `verbindKamers`, of `remove`; checkpoint 4/6) |
| `geenVerbodenConstructies({methode?})` | geen buiten-cursus-constructie: `switch`, `enum`, `var`, lambda (`->`), ternary (`?`) of `.stream(` |

Elke assertie is opzettelijk lokaal: ze zoekt één patroon, niet een hele
programmabetekenis. Een puzzel stapelt er enkele zodat samen de bedoelde vorm
wordt afgedwongen zonder de speler in een keurslijf te dwingen. De patroonkaart-
romp van checkpoint 5 (`lusRomp`) en de zoeklus van checkpoint 7 (`zoeklus`) zijn
géén losse asserties: ze worden **samengesteld** uit `lusVorm` + `lusGrenzen`
+ `heeftReturn` (+ `methodeSignatuur`), zoals de noot hieronder toelicht.

> Noot bij de implementatie (WP 4): de gezaghebbende namenlijst van de
> asserties staat onderaan `js/logic/checker/asserts.js`, in het
> `asserts`-register (o.a. `veldDeclaratie`, `methodeSignatuur`,
> `constructorToewijzing`, `validatieKlem`). Bovenaan hetzelfde bestand staat
> een andere lijst: de meldingsleutels. Een losstaande patroonkaart-classifier
> (`lusRomp`) is bewust niet gebouwd: een fuzzy classifier draagt een hoog
> risico op vals-negatieven, de ergste faalmodus. Het level-5-werkpakket
> stelt de lus-controle samen uit de bestaande lus-asserties en breidt de
> corpus dan mee uit.

## Tolerantieregels

De checker moet valide oplossingen die anders ogen aanvaarden en falen op
wat er echt toe doet. Vals-negatieven (een correcte oplossing afwijzen) zijn het
grootste risico (zie de risico's in het plan) en worden actief bestreden.

Toleranties:

- **Whitespace en opmaak**: volledig genegeerd (zie normalisatie).
- **Lokale-variabelenamen**: waar een assertie een lokale variabele of lus-index
  niet bij naam hoeft te kennen, is elke geldige naam goed. `for (int i …)` en
  `for (int teller …)` slagen beide, tenzij de puzzel de naam expliciet vraagt.
- **Haakjes rond condities**: `(a && b)` ≡ `a && b` waar dat de betekenis niet
  raakt.
- **Commentaar**: altijd genegeerd; de speler mag Alberta's notities laten staan
  of wissen.

Twee tolerantieschakelaars die dit document ooit beloofde, bestaan **niet**:
de volgorde van commutatieve operanden (`a && b` ≡ `b && a`) en de keuze tussen
`this.x` en `getX()`. Er is geen enkele assertie met zo'n vlag, en geen enkele
level-definitie die er een zet: een `config` draagt alleen de velden die in de
tabel hierboven staan. Wie zo'n tolerantie nodig heeft, bouwt ze in de assertie
zelf en zet ze hier in de tabel — een puzzel kan ze niet aanzetten.

Wat **nooit** getolereerd wordt, want het is precies de leerstof:

- `<` versus `<=` in een lusgrens (off-by-one, checkpoint 6).
- `&&` versus `||` versus `!` in een conditie (checkpoint 3).
- return vs. `void`, of een ontbrekende `return` (checkpoint 2).
- `this.veld = parameter` versus omgekeerd of ontbrekend (checkpoint 1).
- Een gemiste `null`-controle in een getter-keten (checkpoint 7).

De grens is eenvoudig: opmaak en irrelevante naamgeving zijn vrij; de checkpoint-
inhoud is strikt. De tolerantie zit in de asserties zelf, niet in een instelling
per puzzel; wat een level kiest, is wélke asserties het stapelt en met welke
`config`. De checker-corpus (`test/checker-corpus/`) legt per checkpoint vast wat
er moet slagen en wat moet zakken.

## Falen → feedback (twee lagen)

De speler zit in een gesimuleerde editor/terminal (zie `spelontwerp-legacy.md`).
Falen komt in twee vormen, gescheiden naar oorzaak, allebei Nederlandstalig,
gestage en vriendelijk.

### Laag 1 — gesimuleerde javac-diagnostiek (`javacsim.js`)

Voor fouten die een échte compiler zou vangen vóór er getest wordt. De
simulatie is bewust eng en kent er precies vijf: een niet-afgesloten string,
char of blokcommentaar; haakjes of accolades die niet in balans zijn; een
methodekop zonder returntype; een ontbrekende puntkomma; en een tikfout uit een
vaste lijst (`TYPOS` in `javacsim.js`). Er is géén naamresolutie en géén
typecontrole — een onbekende naam of een verkeerd type komt dus pas als
CHECK_FAIL uit laag 2. `javacsim.js` produceert een
diagnose in `javac`-stijl, met bestandsnaam, regelnummer en een pijltje naar de
kolom, maar in het Nederlands en zonder JVM-jargon:

```
Geitje.java:12: fout: ';' verwacht
        this.naam = naam
                        ^
  → Elke opdracht in Java eindigt op een puntkomma.
1 fout
```

De diagnose leunt op de positie-informatie uit de tokenizer. Ze is bewust
herkenbaar als "compilerfout" (dat is de fictie: Alberta's pc compileert), maar
mild geformuleerd. Effect-tag: `javac:fout:<puzzleId>` (zie
`engine-architectuur.md`).

### Laag 2 — CHECK_FAIL-feedback (de asserties)

Compileert de code (in de fictie), dan draaien de puzzel-asserties als een reeks
"tests". Elke geslaagde assertie levert een `CHECK_OK`-regel; bij de eerste die
faalt stopt de reeks met één `CHECK_FAIL` en komt er niets meer achter (zie de
regel "één `CHECK_FAIL` per keer" hieronder). Die `CHECK_FAIL` verwijst naar een
feedbacksleutel met een gestage, opbouwende boodschap die zegt wát er mis is
zonder het antwoord te geven:

```
CHECK_OK   veld 'naam' gedeclareerd
CHECK_OK   veld 'schuilplaats' gedeclareerd
CHECK_FAIL de constructor kent 'naam' nog niet toe aan het veld.
           Verwacht de vorm: this.<veld> = <parameter>;
```

Effect-tags: `check:ok:<puzzleId>` en `check:fout:<puzzleId>`. De feedbacktekst
leeft in `js/logic/strings.js` (nooit inline in de checker), verwijst waar
nuttig naar de checkpoint-metafoor (blauwdruk/doos, twee pijlen, patroonkaart …),
en escaleert nooit tot het letterlijke antwoord — dat is de taak van de
hint-stadia (zie `save-en-hints.md`), niet van de checker.

Feedback-toon:

- Benoem het probleem concreet en op de juiste plek ("de lusgrens gaat één te
  ver").
- Verwijs naar de vorm, niet de oplossing ("verwacht `this.<veld> =
  <parameter>;`").
- Blijf warm en niet-bestraffend; falen is een tussenstap, geen oordeel.
- Eén `CHECK_FAIL` per keer waar mogelijk: toon de eerste die faalt, niet een
  muur van rood.

## Niet-editor-puzzels

De terminal-puzzels (trace, vind-de-fout, verklaar-in-één-zin, Parsons,
welke-patroonkaart) lopen niet altijd via de tokenizer. Het zijn er twee per
level, behalve in de levels 1 en 7: die dragen twee editor-puzzels en dus maar
één terminal-puzzel (zie `levels-en-checkpoints.md`, §Tijdsbudget per level).

- **Trace / voorspel-de-output**: de speler geeft een waarde of een reeks
  waarden; de checker vergelijkt met de verwachte uitkomst (exacte string- of
  getalmatch, met dezelfde tolerantie voor whitespace).
- **Vind-de-fout**: de speler duidt de foute regel of kiest de juiste reparatie
  uit opties; de checker vergelijkt de keuze.
- **Verklaar-in-één-zin**: een **zelf-check**, geen beoordeling. De speler
  typt zijn zin, de terminal legt Alberta's modelzin ernaast en vraagt of ze
  hetzelfde zeggen; elk antwoord zet de puzzel op af, alleen de slotregel
  verschilt (`juist` of `anders`). Dat is een bewuste keuze: vrije tekst
  beoordelen kan een deterministische checker niet, en een keuzelijst maakt van
  "verklaar het in je eigen woorden" een meerkeuzevraag. De velden staan per
  level in `js/levels/levelN.js` (`toon`, `model`, `bevestig`, `juist`,
  `anders`), de afhandeling in `js/pc/terminal.js`.
- **Parsons**: de speler ordent stroken; de checker vergelijkt de volgorde met
  de ene juiste volgorde, strook voor strook. Alternatieve volgordes bestaan
  niet: waar er meer dan één goede volgorde zou zijn, hoort de puzzel
  herschreven te worden, niet de checker verruimd.
- **Welke-patroonkaart**: keuze uit **vier** genummerde opties, exacte
  keuze-match. In level 5 zijn dat de vier patroonkaarten zelf (tellen,
  totaliseren, opbouwen, het uiterste); de proefdruk (level 0) gebruikt
  dezelfde vorm met vier andere lussoorten.

Deze puzzels hebben geen `javac`-laag; ze geven direct `check:ok`/`check:fout`
met dezelfde vriendelijke, gestage feedback.

## De test-corpus (WP 4-gate)

De checker is pas klaar als een unit-test-corpus (`test/`, `node --test`) twee
dingen bewijst voor elke puzzel:

1. **Elke modeloplossing slaagt.** De pristine Java-fragmenten uit
   `seven-little-goats/src/` (en de bedoelde schrijf-van-nul-oplossingen) halen
   alle asserties, in meerdere geldige opmaak- en naamgevingsvarianten.
2. **Elke gecureerde typische studentfout faalt met de bedoelde melding.** Per
   puzzel een lijstje realistische fouten (verkeerde clamp-richting, `||` in
   plaats van `&&`, off-by-one, `this.x = x` vergeten, gemiste null-check) die
   elk de juiste feedbacksleutel triggeren.

Deze corpus groeit tijdens de level-WP's (7–9): elke nieuw ontdekte vals-
negatief of gemiste fout wordt een testcase. Zo wordt het risico van
checker-vals-negatieven systematisch afgebouwd in plaats van gehoopt weg te
blijven. De corpus is de harde WP 4-gate: `node --test` groen, inclusief zowel
de modeloplossingen als de foutenlijst.
