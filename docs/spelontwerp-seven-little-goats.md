# Spelontwerp — Seven Little Goats (het Java-spel)

Het volledige ontwerp van _Seven Little Goats_, het Java-tekstspel dat Alberta
plande als vervolg op _Revenge of Red Riding Hood_ en dat de speler in _The
Legacy of Alberta_ herstelt. Dit is de hoofdprijs: de echte, draaibare broncode
in `seven-little-goats/src/`. Het spel is strikt cursusgebonden en volgt het
idioom van de predecessor in `~/-work/programming/revenge-of-red-riding-hood/
src/` (dezelfde klassenstructuur, dezelfde commentaarstijl, dezelfde
Gevecht-mechaniek). WP 2 bouwt tegen dit document; de JS-simulatie in `js/sim/`
(WP 9) spiegelt het één-op-één.

De klassenamen hier zijn identiek aan die in `levels-en-scharnieren.md`
(kolom "herstelt") en `checker-contract.md` (de checker-doelen). Die drie
documenten mogen nooit uiteenlopen.

## Cursusgrenzen (hard)

Alle Java, in de bron én in elk puzzelfragment: geen `switch`, geen streams of
lambda's, geen `enum`, geen `var`, geen ternaire operator, geen overerving of
interfaces, geen collecties buiten `ArrayList<>`. Nederlandstalige klasse- en
veldnamen. `Scanner` voor invoer. Dit is dezelfde gereedschapskist als de
predecessor (zie diens README, §"Binnen de grenzen van de cursus"). WP 2 gate:
`javac -d out src/*.java` schoon en `grep -nE 'switch|enum|->|Stream|\bvar '`
leeg.

## Het verhaal

_Seven Little Goats_ is het vervolg op _Revenge of Red Riding Hood_. De opening
houdt het einde van spel 1 **bewust ambigu**: er wordt naar verwezen zonder vast
te leggen wélk van de vier eindes de speler haalde. Zo blijven alle vier de
eindes van spel 1 canon en werkt het vervolg ongeacht hoe je het eerste spel
uitspeelde.

De aanleiding:

- De wolf uit spel 1 had een neef. Een **jonge wolf**, honger geërfd, wijsheid
  niet. Hij las het oude verhaal als een handleiding.
- Met een klassieke truc bedroog hij de zeven geitjes: hij wreef zijn poot wit
  met **bloem** uit de molen en at **krijt** bij de kruidenier voor een
  zachte stem. De geitjes deden open. Zes werden opgeslokt.
- Het **jongste geitje** verstopte zich in de **klokkast** en overleefde. Het
  ging niet naar de dorpelingen — die vonden alles "te gevaarlijk", zoals altijd
  — maar naar de enige die met wolven ervaring had: **Roodkapje**, intussen de
  weerzinnige dorpsexpert in wolvenzaken.

De speler is Roodkapje. Ze volgt het spoor van de jonge wolf van het geitenhuisje
tot de rivieroever, en rekent daar met hem af — op een van vier manieren, die de
vier eindes van spel 1 spiegelen.

Toon: Vlaams, droog, sprookjesachtig, moreel dubbelzinnig rond wraak en genade —
exact de stem van de predecessor. Alle prose in `js/sim/goats-strings.js`
(browser) en in de `System.out.println`-regels van de Java (bron); die twee
moeten woordelijk overeenkomen zodat de transcript-cross-check van WP 9 slaagt.

## De kaart

Negen kamers, plus de **klokkast** als _schuilplaats_ binnen het geitenhuisje
(geen aparte kamer, maar een `Schuilplaats`, zie hieronder). Het dorpsplein is
de spil, met vertakkingen naar de molen, de kruidenier, het bos en grootmoeders
huisje; het bospad leidt via de oude eik en het wolvenspoor naar de showdown aan
de rivier.

```
[Geitenhuisje]  (klokkast: jongste geitje)
     │ zuid
[Dorpsplein]───oost──[Molen]  (bloem; jachthond bewaakt de kruik melk)
     │              west
     ├───west──[Kruidenier]  (krijt)
     │ zuid
[Bospad]
     │ zuid
[Oude eik]  (raaf: ruil koek → gladde kiezels)
     │ zuid
[Grootmoeders huisje]  (zilveren schaar)
     │ zuid
[Wolvenspoor]  (de bloem- en krijtsporen van de wolf)
     │ zuid
[Rivieroever]  (showdown met de jonge wolf)
```

De verbindingen worden in beide richtingen gelegd, net als in de predecessor
(`Spel.verbindNoordZuid` / `verbindOostWest`). De methode `Spel.verbindKamers`
uit level 4 is de sequel-naam voor dat bedradingswerk (zie
`levels-en-scharnieren.md`).

### Kamers, voorwerpen en rollen

| Kamer | Voorwerpen | Rol |
|---|---|---|
| Geitenhuisje | `rode mantel`, `keukenmes`, `mandje` | start; de klokkast met het jongste geitje; Roodkapjes uitrusting |
| Dorpsplein | `koek`, `koek` | spil-kamer; de markt; koeken (mandje nodig om te dragen) |
| Molen | `bloem`; `kruik melk` (achter de jachthond) | bewijs van de truc; de **jachthond** bewaakt de +6-genezing |
| Kruidenier | `krijt` | bewijs van de truc (de zachte stem) |
| Bospad | — | doorgang, weinig licht |
| Oude eik | — (de raaf) | raaf-cameo: ruil een `koek` voor `gladde kiezels` |
| Grootmoeders huisje | `zilveren schaar` | callback naar spel 1; ontgrendelt het beste einde |
| Wolvenspoor | — | witte pootafdrukken (bloem), krijtstof; de spanning stijgt |
| Rivieroever | `stenen` (los, ter plaatse) | de showdown; stenen voor het beste einde |

De **gladde kiezels** (van de raaf) en de losse **stenen** (aan de oever) zijn
inwisselbaar als "de stenen" voor het beste einde: beide tellen. De raaf-ruil
spiegelt spel 1 exact (een koek voor iets nuttigs), nu voor de kiezels in plaats
van de schaar, want de schaar ligt hier bij grootmoeder.

### Voorwerpen en hun werking

- `rode mantel` — vangt 1 schade op in een gevecht (als in spel 1).
- `keukenmes` — kracht 3, telt mee bij elke aanval (identiek aan spel 1).
- `mandje` — nodig om koeken te dragen (poort-mechaniek, identiek aan spel 1).
- `koek` — +4 levenspunten, of ruilmiddel bij de raaf.
- `kruik melk` — eenmalig +6 levenspunten (de geitenmelk; sequel-naam voor de
  honing uit spel 1).
- `bloem`, `krijt` — bewijsvoorwerpen; hun beschrijving onthult de truc van de
  wolf. Geen gevechtswaarde; ze verankeren het verhaal en geven `pak`/`bekijk`
  betekenis.
- `zilveren schaar` — nog vlijmscherp; ontgrendelt het beste
  einde (samen met de stenen).
- `gladde kiezels` / `stenen` — de stenen voor de buik van de wolf in het beste
  einde.

## De klassen

Eén klasse per bestand, zoals de predecessor. De regelbudgetten zijn ruwe
richtwaarden (het predecessor-equivalent tussen haakjes), niet harde limieten;
ze helpen WP 2 de omvang inschatten en houden de puzzelfragmenten leesbaar.

| Klasse | Verantwoordelijkheid | ~Regels |
|---|---|---|
| `Main` | startpunt: titelbanner, backstory, spellus (`while (!spel.isGestopt())`) | ~60 (55) |
| `Spel` | bouwt de wereld, wiret kamers (`verbindKamers`), verwerkt commando's, start gevechten, handelt de vier eindes af, `zoekGeitje` | ~520 (478) |
| `Speler` | Roodkapje: levenspunten (0..20, klemmende setter), aanvalskracht, inventaris (`ArrayList<Voorwerp>`), `zoek`/`heeft`/`verwijder`/`pak` | ~90 (83) |
| `Kamer` | één plek: naam, beschrijving, hint, voorwerpen, vier buur-referenties (noord/oost/zuid/west, `null` = geen uitgang), tegenstander, `verwijderVoorwerp` | ~120 (117) |
| `Voorwerp` | naam, beschrijving, kracht; twee overloaded constructors (met/zonder kracht); `toString` | ~45 (44) |
| `Tegenstander` | jachthond en wolf: naam, beschrijving, levenspunten, vast `aanvalspatroon` (array), `smeekDrempel`, hint | ~65 (64) |
| `Gevecht` | speelt één gevecht af (max vijf rondes), geeft resultaatcode 0/1/2/3, toont het schade-overzicht | ~240 (234) |
| `Geitje` | één geitje: naam, referentie naar zijn `Schuilplaats` (`null` als nog opgeslokt), `gered`-vlag; getters/setters | ~55 (nieuw) |
| `Schuilplaats` | een verstopplek: naam (bv. "de klokkast") en een referentie naar de `Kamer` waar ze ligt; `getKamer`, `getNaam` | ~45 (nieuw) |
| `TestSpeler` | cursusstijl-test met `main`: klemmende setter, inventaris, `zoek`/`verwijder` | ~40 |
| `TestGeitje` | cursusstijl-test met `main`: de dubbele pijl `geitje.getSchuilplaats().getKamer().getNaam()` en het null-geval | ~45 (nieuw) |
| `TestGevecht` | cursusstijl-test met `main`: gescript gevecht met een `Scanner` over een tekst, resultaat gecontroleerd | ~45 |

De Test-klassen volgen de predecessor-stijl: een gewone `main` die zichzelf
speelt met een `Scanner` over een string en de uitkomst afdrukt (zie
`TestGevecht.java` in de predecessor). Geen test-framework — dat valt buiten de
cursus.

### Waarom Geitje en Schuilplaats bestaan

Deze twee klassen bestaan om **scharnier 7** (zoeken + de dubbele pijl) een
verhaal-gedragen anker te geven. De cursus vat scharnier 7 samen als de ketting
`artikel.getCategorie().getNaam()`. In _Seven Little Goats_ is dat:

```java
geitje.getSchuilplaats().getKamer().getNaam()
```

- Een `Geitje` heeft een `Schuilplaats` (of `null` zolang het in de wolf zit).
- Een `Schuilplaats` heeft een `Kamer`.
- Dus vraagt "waar verstopt dit geitje zich?" om twee pijlen te volgen — en om
  null-veiligheid, want een nog-opgeslokt geitje heeft geen schuilplaats.

Het jongste geitje overleefde in **de klokkast**: zijn `Schuilplaats` wijst naar
de geitenhuisje-kamer. De zes opgeslokte geitjes hebben `schuilplaats == null`
tot ze aan de rivier bevrijd worden. Na de bevrijding vertelt het jongste geitje
waar elk broertje voortaan zal schuilen; die opsomming is de endgame-keten die
level 7 herstelt.

`Spel.zoekGeitje(String naam)` is de zoeklus van scharnier 7: doorloop de
`ArrayList<Geitje>`, geef het `Geitje` met die naam terug, of `null` als het er
niet is. Level 7 laat de speler die lus schrijven, de null-veilige getter-keten
herstellen, en de keten tracen (zie `levels-en-scharnieren.md`).

## Gevecht

Overgenomen uit de predecessor, mechaniek identiek (`Gevecht.java`):

- Maximaal **vijf rondes**. De rondeteller loopt alleen door bij een geldige
  actie; `?`, `opties`, onzin en een mislukte `eet` kosten geen ronde en lokken
  geen tegenaanval uit.
- Elke ronde kiest de speler: `val aan` / `verdedig` / `eet koek` / `eet melk`.
  Aanval = basiskracht 2, +3 met het keukenmes. Verdedigen halveert de inkomende
  klap (gehele deling: `5 / 2` = `2`). De rode mantel vangt daarna nog 1 op;
  klemmen op 0.
- De tegenstander slaat terug volgens zijn **vaste aanvalspatroon** (een array,
  één waarde per ronde) — deterministisch, geen toeval, zoals de predecessor.
- **Smeekdrempel**: zakt de tegenstander naar `lp <= smeekDrempel`, dan smeekt
  hij (`spaar` → resultaat 2; `maak af` → resultaat 1). Een smeekmoment kost
  geen ronde. De jachthond heeft drempel 0 (smeekt nooit); de wolf smeekt bij 5.
- Resultaatcodes: `0` speler verslagen, `1` tegenstander verslagen, `2`
  tegenstander gespaard, `3` time-out na vijf rondes.
- Na afloop het **schade-overzicht** over de echt gevochten rondes (rondes /
  totaal / gemiddelde als `double` met `.0` / grootste klap; 0 rondes → "geen
  klap"). Dit zijn precies de lijstpatronen op een array — het materiaal voor de
  `Gevecht`-rondes-puzzel van level 6.

### De twee gevechten

- **De jachthond** (molen, optioneel): de weggelopen, uitgehongerde hond van de
  verdwenen jager. Bewaakt de kruik melk. Lage levenspunten, drempel 0. Bij een
  time-out duwt hij Roodkapje terug naar het dorpsplein (spiegelt het zwijn uit
  spel 1). Optioneel: je kan de wolf verslaan zonder eerst de hond te doen; de
  melk is een bonus-genezing, geen verplichting.

  Bv. `new Tegenstander("jachthond", "…", 8, new int[]{2,3,2,3,2}, 0, "…")`.

- **De jonge wolf** (rivieroever, de boss): groot, grijs, en dit keer geen
  vermomming meer. Hoge levenspunten, smeekt bij 5. Zijn resultaat kiest samen
  met wat de speler bij zich heeft welk van de vier eindes valt.

  Voorstel: `new Tegenstander("jonge wolf", "…", 18, new int[]{3,5,2,6,4}, 5,
  "…")`. Exact het patroon van de wolf uit spel 1, zodat `TestGevecht` uit de
  predecessor als sjabloon dient.

## De vier eindes

De afhandeling in `Spel.startGevecht` spiegelt de predecessor: het resultaat van
het wolf-gevecht plus de inventaris bepaalt het einde. Elk einde spiegelt één
einde van spel 1.

| Einde | Voorwaarde | Spiegelt spel 1 |
|---|---|---|
| **De schaar en de stenen** (best) | wolf verslagen (res. 1) **én** `zilveren schaar` **én** stenen (`gladde kiezels`/`stenen`) | _de redding_ (schaar + stenen in de buik) |
| **De afrekening** (kille wraak) | wolf verslagen (res. 1) **zonder** de schaar of zonder de stenen | _kille wraak_ |
| **De les** (genade) | wolf gespaard (res. 2) | _genade_ |
| **Game over** | speler verslagen (res. 0) of time-out (res. 3) | _game over_ |

Inhoud per einde (kern; de exacte tekst leeft in `goats-strings.js` en in de
Java):

- **De schaar en de stenen.** Roodkapje knipt de wolf open langs de naad met
  grootmoeders zilveren schaar. De zes geitjes klimmen eruit; samen vullen ze de
  buik met stenen en naaien hem dicht. De wolf, log en zwaar, zakt in de rivier.
  Het jongste geitje komt uit de klokkast; de familie is heel. Hier valt de
  endgame-keten: het jongste geitje vertelt waar elk broertje voortaan schuilt
  (`geitje.getSchuilplaats().getKamer().getNaam()`), null-veilig voor wie nog
  niet gevonden is.
- **De afrekening.** De wolf is dood, maar zonder iets scherps genoeg om
  hem netjes open te leggen, blijven de zes geitjes waar ze zijn — vanbinnen, in
  het donker. Iemand zal ze er later uit moeten halen. Koud en onaf.
- **De les.** Roodkapje laat haar mes zakken. De wolf hoest, kokhalst, en spuwt
  de zes geitjes in één keer weer uit. Zonder één woord glipt hij het bos in,
  deze keer voorgoed. Genade, en misschien wel de enige les die aankomt.
- **Game over.** De wolf grijnst. Alwéér iemand die dacht dat het verhaal een
  handleiding was.

De ambiguïteit van spel 1 blijft dus productief: welk einde je daar haalde,
verandert niets aan hoe _Seven Little Goats_ opent of eindigt; beide spellen
laten de wolf-lijn open.

## Verhouding tot de meta-game

De speler ontmoet dit spel twee keer: hij **herstelt** de bron ervan, stuk per
stuk, doorheen de zeven levels (de puzzelfragmenten zijn echte stukken van deze
klassen), en hij **speelt** het uit als de pc het na level 7 boot als simulatie
(`js/sim/`, WP 9). De simulatie moet exact deze kamers, voorwerpen, gevechten en
eindes reproduceren; WP 9 bewaakt dat met een transcript-cross-check tussen
`java Main` en de browsersimulatie op identieke commando-scripts (alle vier de
eindes). De epiloog wijst de speler naar `seven-little-goats/` voor de echte
broncode: "De broncode ligt op zolder — neem ze mee."
