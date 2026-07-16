# Seven Little Goats

Een volledig uitgewerkte, speelbare tekstadventure in 80's-stijl: het vervolg
op _Revenge of Red Riding Hood_. Je speelt opnieuw Roodkapje, je typt
commando's, het programma reageert. Met kamers om te verkennen, een inventaris,
statistieken, twee gevechten en vier verschillende eindes.

> Dit is niet de exacte code die je in de les schrijft. Het is een _afgewerkte_
> versie van hetzelfde soort project, gebouwd om van begin tot einde te draaien.
> Ze blijft wel volledig binnen de grenzen van de cursus (zie hieronder): er
> staat niets in dat je nog niet gezien hebt of nog niet mag gebruiken.

## Alberta's prototype

In de meta-game _The Legacy of Alberta_ is dit de hoofdprijs. _Seven Little
Goats_ is het vervolg dat grootmoeder Alberta plande maar nooit afmaakte. Op
zolder ligt de broncode in stukken; doorheen de zeven levels herstel je ze,
scharnier per scharnier, tot dit spel weer draait. Wat je hier voor je hebt, is
dat prototype, heel en werkend — de echte, draaibare Java. Draai ze, lees ze,
en kijk hoe de losse stukken uit de levels één geheel vormen.

## Het verhaal

Je kent het vorige verhaal. Een rode mantel, een wolf, grootmoeders huisje. Hoe
het afliep? Daar zijn de verhalen het niet over eens: de een zweert bij de
schaar en de stenen, de ander bij een kille afrekening, een derde bij genade.
Laat het in het midden. De wolf van toen is weg; dat volstaat.

Maar die wolf had een neef. Een jonge wolf, de honger geërfd, de wijsheid niet.
Hij las het oude verhaal als een handleiding. Gisteren wreef hij zijn poot wit
met bloem uit de molen en at krijt bij de kruidenier, tot zijn stem zo zacht
klonk als die van een moeder. De zeven geitjes deden open. Zes gingen naar
binnen — in de wolf.

Het jongste kroop in de klokkast en overleefde. Het ging niet naar de
dorpelingen (die vonden alles "te gevaarlijk", zoals altijd), maar naar de
enige met verstand van wolven: naar jou. Je volgt het spoor van het
geitenhuisje tot aan de rivier. Wat je daar met de wolf doet, bepaal jij.

## Aan de slag

Je hebt een recente **Temurin JDK** nodig (LTS, bijvoorbeeld 21), dezelfde die
je voor de cursus installeert. Verder niets: geen build-tool, geen dependencies.

### In IntelliJ IDEA (aanbevolen)

1. Open de map `seven-little-goats` als project (niet `src/`, niet een los
   `.java`-bestand). IntelliJ herkent `src/` automatisch als source folder.
2. Klik bij "Trust and Open Project?" op **Trust Project**.
3. Zoek `Main.java`, klik op het groene play-icoon naast `main(...)` en kies
   **Run 'Main.main()'**.

### In de terminal

```sh
# vanuit de projectmap seven-little-goats/
javac -d out src/*.java
java -cp out Main
```

`javac` compileert alle bronbestanden naar de map `out/`, `java` start het spel
via de klasse `Main`.

## Hoe speel je een tekstadventure

Er zijn geen beelden: je typt een commando bij de prompt `>`, en het spel
antwoordt met tekst. Je leest wat er gebeurt, en typt je volgende zet.

- **Begin met `kijk`:** toont de kamer waar je staat opnieuw, met wat er ligt.
- **Beweeg met `ga`:** `ga noord`, `ga oost`, `ga zuid`, `ga west`. Niet elke
  richting heeft een uitgang.
- **Neem voorwerpen mee** met `pak`, bijvoorbeeld `pak keukenmes`. Met
  `inventaris` zie je wat je bij je hebt, met `stats` je levenspunten.
- **Ruil met de raaf** bij de oude eik: `praat`, dan `geef koek`.
- **Vecht** doe je zelf: een tegenstander valt je niet vanzelf aan. Typ `vecht`
  als je klaar bent (zo kan je aan de rivier eerst de stenen oprapen).
- **Vast in een scène?** Typ `?` voor een hint (die mag cryptisch zijn). Met
  `help` krijg je de volledige lijst commando's.
- **Stoppen** doe je met `stop`.

En helemaal als laatste: `opties` toont letterlijk alles wat je in deze kamer
kan doen. Dat is eigenlijk een cheatcode — gebruik hem pas als je écht vastzit.
De bedoeling is: eerst zelf proberen, dan `?`, en enkel in nood `opties`.

## De commando's

| Commando | Wat het doet |
|---|---|
| `kijk` | bekijk de kamer opnieuw |
| `ga noord` / `oost` / `zuid` / `west` | beweeg naar een buurkamer |
| `pak <naam>` | neem een voorwerp mee (koeken alleen met een mandje) |
| `inventaris` | toon wat je bij je hebt |
| `stats` | toon je levenspunten en aanvalskracht |
| `eet koek` | eet een koek (+4 LP) |
| `eet melk` | drink van de kruik melk (+6 LP) |
| `praat` | praat met de raaf of het jongste geitje |
| `geef koek` | ruil bij de raaf: een koek voor gladde kiezels |
| `vecht` | val de tegenstander in deze kamer aan |
| `?` | een hint voor deze plek |
| `help` | de volledige lijst commando's |
| `stop` | stop het spel |
| `opties` | toon alles wat hier kan (cheatcode) |

## De vier eindes

Wat er aan de rivier gebeurt, hangt af van hoe je het wolf-gevecht afsluit en
wat je bij je draagt. Elk einde spiegelt één einde van het eerste spel.

| Einde | Voorwaarde |
|---|---|
| De schaar en de stenen | de wolf verslagen **met** de zilveren schaar **en** stenen (gladde kiezels of losse stenen) |
| De afrekening | de wolf verslagen, maar zonder de schaar of zonder stenen |
| De les | de wolf gespaard bij zijn smeekmoment |
| Game over | zelf verslagen (of vijf rondes zonder beslissing) |

De zilveren schaar ligt bij grootmoeder; stenen krijg je van de raaf (gladde
kiezels) of raap je op aan de oever. Zonder keukenmes haal je de wolf niet
neer binnen vijf rondes — reken dus voor je vertrekt.

## De klassen

Eén klasse per bestand, net als in de voorganger.

| Klasse | Verantwoordelijkheid |
|---|---|
| `Main` | startpunt: titelbanner, backstory en de spellus |
| `Spel` | bouwt de wereld, wiret de kamers, verwerkt commando's, start de gevechten en handelt de vier eindes af |
| `Speler` | Roodkapje: levenspunten (0–20, klemmende setter), aanvalskracht, inventaris |
| `Kamer` | één plek: naam, beschrijving, hint, voorwerpen, vier buur-referenties en een tegenstander |
| `Voorwerp` | naam, beschrijving, kracht; twee overloaded constructors |
| `Tegenstander` | jachthond en wolf: levenspunten, vast aanvalspatroon, smeekdrempel |
| `Gevecht` | speelt één gevecht af (max vijf rondes) en toont het schade-overzicht |
| `Geitje` | één van de zeven geitjes: naam, schuilplaats (of null), gered-vlag |
| `Schuilplaats` | een verstopplek: een naam en de kamer waar ze ligt |
| `TestSpeler` | cursusstijl-test: klemmende setter en inventaris |
| `TestGeitje` | cursusstijl-test: de dubbele pijl en het null-geval |
| `TestGevecht` | cursusstijl-test: een gescript gevecht met een `Scanner` over een tekst |

De `Test`-klassen hebben elk een gewone `main` die zichzelf speelt en de
uitkomst afdrukt — geen test-framework, dat valt buiten de cursus. Draai ze met
bijvoorbeeld `java -cp out TestGeitje`.

De map [`test-scripts/`](test-scripts/) bevat commando-scripts die elk van de
vier eindes bereiken; zie de README daar.

## Binnen de grenzen van de cursus

Het belangrijkste ontwerpprincipe: **de code gebruikt geen enkele constructie
die buiten de cursus valt.** Meer complexiteit dan een losse oefening mag, maar
geen nieuwe taalconstructies. Alles wat hier staat, kan je lezen met wat je in
de eerste lessen leert.

**Wel gebruikt** (de volledige gereedschapskist van de cursus):

- Variabelen, primitieve types (`int`, `double`, `boolean`, `char`), `String`,
  `final` constanten, casting.
- `if`, `if-else`, geneste `if`; relationele, gelijkheids- en logische
  operatoren.
- `for`- en `while`-lussen.
- Methoden met en zonder parameters en returnwaarde, getters en setters,
  validatie in methoden.
- Klassen en objecten, `private` velden met publieke methoden, constructors
  (ook overloaded), `this`, `toString()`.
- `ArrayList<>` met `add`, `get`, `remove`, `size`, doorlopen met een gewone en
  een enhanced `for`-lus, filteren en tellen op een voorwaarde.
- Een eenvoudige eendimensionale array (het aanvalspatroon, de schadelog).
- Object-relaties (één-op-één en één-op-veel), objectreferenties en `null`.
- `Scanner` om de input van de speler te lezen.

**Bewust vermeden** (dat komt pas later): `switch`, overerving en interfaces,
generieke types buiten `ArrayList<>` (dus ook geen `HashMap` of `HashSet`),
streams en lambda's, exception handling als ontwerpmiddel, `enum`, wrapper
classes en de ternaire operator (`?:`).

## Studeer de bron

Elke klasse is voorzien van Nederlandstalige commentaar die uitlegt wat en
waarom. Lees ze in deze volgorde als je het spel als voorbeeld wil gebruiken:
`Voorwerp` en `Geitje` (klasse, velden, constructor), dan `Speler` en `Kamer`
(methoden, referenties, `null`), dan `Gevecht` (lussen en arrays) en ten slotte
`Spel` (hoe alles samenkomt) en `Main` (de spellus). Draai het spel, lees mee,
en probeer een eigen kamer of voorwerp toe te voegen.
