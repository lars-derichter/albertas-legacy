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
- **Commentaar**: `// tot regeleinde` en `/* ... */`. Wordt overgeslagen (of als
  triviatoken bewaard), nooit als code getokeniseerd.
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
- **Overtollige puntkomma's** en lege statements worden genegeerd.

Normalisatie raakt nooit de betekenis: `<` wordt nooit `<=`, `&&` nooit `||`.
Alleen opmaak verdwijnt.

## De assertie-woordenlijst

`asserts.js` levert een bibliotheek van structurele asserties. Een puzzel is een
geordende lijst asserties tegen de genormaliseerde tokenstroom van
de speler. Elke assertie geeft `{ ok, diagnose }`; `diagnose` verwijst naar
een feedbacksleutel (zie §"Falen → feedback"). De kern-asserties:

| Assertie | Controleert |
|---|---|
| `velddeclaratie(type, naam, mods?)` | een veld `private <type> <naam>;` is gedeclareerd (modifiers optioneel/tolerant) |
| `constructorToewijzing(veld, param)` | in de constructor staat `this.<veld> = <param>;` |
| `exacteSignatuur(retour, naam, params[])` | een methode met exact dit returntype, deze naam en deze parametertypes/-volgorde |
| `returnAanwezig(inMethode)` | de methode bevat minstens één `return`; bij een returntype ≠ `void` op elk pad (zie tolerantie) |
| `returnVorm(inMethode, expr)` | de `return` geeft een bepaalde vorm terug (bv. `return <veld>;` of `return null;`) |
| `conditieStructuur(vorm)` | een `if`-conditie heeft de gevraagde vorm: `&&`, `\|\|`, `!`, een vergelijking, of een cascade `if/else if/else` |
| `klemStructuur(veld, onder, boven)` | de validatie-clamp: `if (x < onder) x = onder;` en `if (x > boven) x = boven;` (de drie validatievarianten van scharnier 3) |
| `lusKop(soort, variabele, start, grens, richting)` | een `for`/`while`-kop met de juiste grenzen; `<` vs `<=` telt (off-by-one van scharnier 6) |
| `lusRomp(patroon)` | de romp volgt een patroonkaart: tellen, totaliseren, opbouwen, filteren, of het uiterste zoeken (scharnier 5) |
| `zoeklus(retourType)` | een lus die door een `ArrayList` gaat, matcht op een voorwaarde, en het element of `null` teruggeeft (scharnier 7) |
| `getterKeten(stappen[])` | een ketting `a.getX().getY()...` met het juiste aantal pijlen, eventueel null-veilig gewikkeld (scharnier 7) |
| `roeptAan(methode)` | een bepaalde methode wordt aangeroepen (bv. `verbindKamers(...)`, scharnier 4) |
| `bevatNiet(patroon)` | een verboden constructie ontbreekt (bv. geen `switch`, geen buiten-cursus-constructie) |

Elke assertie is opzettelijk lokaal: ze zoekt één patroon, niet een hele
programmabetekenis. Een puzzel stapelt er enkele zodat samen de bedoelde vorm
wordt afgedwongen zonder de speler in een keurslijf te dwingen.

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
- **Volgorde van commutatieve operanden**: waar didactisch onschadelijk, geldt
  `a && b` ≡ `b && a` (per assertie in te schakelen; standaard **uit** voor
  vergelijkingen waar de leesrichting ertoe doet).
- **Getter-namen vs. veldtoegang**: waar de cursus beide toestaat, mag een
  assertie zowel `this.x` als `getX()` accepteren (per puzzel te kiezen).
- **Commentaar**: altijd genegeerd; de speler mag Alberta's notities laten staan
  of wissen.

Wat **nooit** getolereerd wordt, want het is precies de leerstof:

- `<` versus `<=` in een lusgrens (off-by-one, scharnier 6).
- `&&` versus `||` versus `!` in een conditie (scharnier 3).
- return vs. `void`, of een ontbrekende `return` (scharnier 2).
- `this.veld = parameter` versus omgekeerd of ontbrekend (scharnier 1).
- Een gemiste `null`-controle in een getter-keten (scharnier 7).

De grens is eenvoudig: opmaak en irrelevante naamgeving zijn vrij; de scharnier-
inhoud is strikt. Elke tolerantie-keuze staat per puzzel expliciet in
`js/levels/levelN.js`, zodat een level-worker ze bewust zet en de test-corpus ze
dekt.

## Falen → feedback (twee lagen)

De speler zit in een gesimuleerde editor/terminal (zie `spelontwerp-legacy.md`).
Falen komt in twee vormen, gescheiden naar oorzaak, allebei Nederlandstalig,
gestage en vriendelijk.

### Laag 1 — gesimuleerde javac-diagnostiek (`javacsim.js`)

Voor fouten die een échte compiler zou vangen vóór er getest wordt: een
ontbrekende puntkomma, een niet-gesloten accolade, een onbekende naam, een
verkeerd type op een voor de hand liggende plek. `javacsim.js` produceert een
diagnose in `javac`-stijl, met bestandsnaam, regelnummer en een pijltje naar de
kolom, maar in het Nederlands en zonder JVM-jargon:

```
Geitje.java:12: fout: ';' verwacht
        this.naam = naam
                        ^
1 fout
```

De diagnose leunt op de positie-informatie uit de tokenizer. Ze is bewust
herkenbaar als "compilerfout" (dat is de fictie: Alberta's pc compileert), maar
mild geformuleerd. Effect-tag: `javac:fout:<puzzleId>` (zie
`engine-architectuur.md`).

### Laag 2 — CHECK_FAIL-feedback (de asserties)

Compileert de code (in de fictie), dan draaien de puzzel-asserties als een reeks
"tests". Elke assertie levert een `CHECK_OK`- of `CHECK_FAIL`-regel. Een
`CHECK_FAIL` verwijst naar een feedbacksleutel met een gestage, opbouwende
boodschap die zegt wát er mis is zonder het antwoord te geven:

```
CHECK_OK   veld 'naam' gedeclareerd
CHECK_OK   veld 'schuilplaats' gedeclareerd
CHECK_FAIL de constructor kent 'naam' nog niet toe aan het veld.
           Verwacht de vorm: this.<veld> = <parameter>;
```

Effect-tags: `check:ok:<puzzleId>` en `check:fout:<puzzleId>`. De feedbacktekst
leeft in `js/logic/strings.js` (nooit inline in de checker), verwijst waar
nuttig naar de scharnier-metafoor (blauwdruk/doos, twee pijlen, patroonkaart …),
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

De twee terminal-puzzels per level (trace, vind-de-fout, verklaar-in-één-zin,
Parsons, welke-patroonkaart) lopen niet altijd via de tokenizer:

- **Trace / voorspel-de-output**: de speler geeft een waarde of een reeks
  waarden; de checker vergelijkt met de verwachte uitkomst (exacte string- of
  getalmatch, met dezelfde tolerantie voor whitespace).
- **Vind-de-fout**: de speler duidt de foute regel of kiest de juiste reparatie
  uit opties; de checker vergelijkt de keuze.
- **Verklaar-in-één-zin**: keuze uit gegeven formuleringen (geen vrije-
  tekstbeoordeling — dat valt buiten een deterministische checker), of een
  sleutelwoord-match tegen een korte lijst aanvaarde termen.
- **Parsons**: de speler ordent stroken; de checker vergelijkt de volgorde
  (met, waar zinvol, meerdere aanvaarde volgordes).
- **Welke-patroonkaart**: keuze uit de vijf luspatronen; exacte keuze-match.

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
