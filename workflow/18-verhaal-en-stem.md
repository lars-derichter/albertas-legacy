# 18 — Verhaal, stem en de zolder die antwoordt (opwaardering WP C)

Het register wordt kouder, de duisternis van _Seven Little Goats_ wordt in het
kader voelbaar, en de zolder beloont eindelijk wie er rondkijkt. Dit pakket
komt vóór al het tekenwerk: de QC-poort van het scènewerk luidt "elk zelfstandig
naamwoord in de kamerbeschrijving moet aanwijsbaar zijn", dus de tekst moet
eerst vastliggen.

## Opdracht

Uit het plan (§WP C), dat zelf voortkwam uit Lars' tweede opmerking:

> I also think that the storytelling could be somewhat improved. The story
> could be a bit more urgent and darker for me. Also it makes no sense that
> the backstory of the game is explained in what looks like the spread
> notebook. The player should know this backstory before searching for or
> finding the notebook.

Met de gekozen richting: kouder verteld maar Alberta's lot blijft onverklaard,
de duisternis komt uit het spel zelf, urgentie alleen in de toon, en de opening
verhuist naar een drager die klopt.

## Aanpak

Eerst de prose, dan de code die ze ontsluit, dan de tests, dan de documenten.
De volgorde is niet vrijblijvend: de nieuwe onderzoeks-teksten bepalen welke
woorden de parser moet kennen, niet omgekeerd.

## Beslissingen

### Kou zit in het contrast, niet in somberte

De zolder was "een archief dat lang op iemand wachtte" — geduldig en warm. Hij
is nu een werkkamer die halverwege is stilgevallen. Het middel is bewust niet
somberheid maar tegenspraak: de stoel staat weggedraaid alsof ze even is
opgestaan, en het stof zegt dat dat niet zo is. In `zolder-oost` staat dat als
twee zinnen naast elkaar. Dat is onbehaaglijker dan welke sfeerzin ook, en het
respecteert de bestaande toonregel dat de emotie in de terughoudendheid zit.

Om dezelfde reden is de halfvolle mok blijven staan waar het plan hem koud had
kunnen maken (een opgedroogde ring). Halfvol is vreemder: `onderzoek mok` zegt
nu dat er géén ring in staat, geen schimmel, niets dat vertelt hoe lang hij er
staat. Het object weigert de tijd te bevestigen die het stof wel toont.

### Alberta blijft warm; de kamer is koud

Haar oordeelteksten zijn drier gezet — "Proficiat" en "En weet je?" zijn weg —
maar niet kouder. Zij is het enige warme in dit spel, en dat is nu ook als regel
in `docs/achtergrond.md` vastgelegd. Het contrast tussen haar stem en de kamer
is het effect; haar mee laten verkillen zou het juist uitvlakken.

### De duisternis kost geen nieuwe fictie

Het kader mag laten voelen wát ze aan het schrijven was, en dat lag er al: zes
geitjes die de wolf binnengaan, een zevende in de klokkast, een afrekening aan
de rivier, en een einde dat "koud en onaf" heet. Drie plaatsen dragen dat nu:

- de intro noemt de inzet van het verhaal;
- `onderzoek notitieboek` toont "een schets van een kamer met zeven kruisjes
  erin, waarvan er zes zijn doorgehaald";
- de terminal kondigt voor het booten aan dat het niet voor iedereen goed
  afloopt.

Geen woord van de sim-prose zelf is aangeraakt. Dat was ook de afspraak: die
raken zou de Java-broncode én de vier transcript-fixtures meetrekken.

### De opening: drager en stem tegelijk rechtgezet

De achtergrond stond op een bladzijde van het notitieboek. Drie dingen klopten
daar niet, en ze zijn alle drie weg:

- **de volgorde** — je las wat er in het boek stond vóór je het boek had;
- **de stem** — de verteller sprak jou aan op papier dat Alberta's handschrift
  draagt ("Je grootmoeder Alberta was game-ontwerpster … Ze verdween"), iets wat
  zij onmogelijk in haar eigen boek kan schrijven;
- **de zelfverwijzing** — de kop was de titel van het spel, en de voet vroeg om
  het notitieboek te openen dat je op dat moment las.

`AL.strings.intro` bestond al als vier goed geschreven alinea's en werd door
niets aangeroepen; wat ships was een kortere doublure onder `spreads.intro`. De
echte intro is herschreven en weer in gebruik; de doublure is weg.

**Afwijking van het plan:** het plan zette de nieuwe opening volledig in WP D.
De drager is hier al rechtgezet — de achtergrond loopt nu als vensters in de
stem van de verteller over de titelkaart — omdat het de kern van Lars'
opmerking was en omdat het met bestaande middelen kon. WP D vervangt de
titelkaart-achtergrond door de getekende establishing shots; de route en de stem
kloppen dan al.

De `spread`-modus draagt daarmee alleen nog de zeven level-spreads.

### Elk naamwoord een eigen antwoord

`onderzoek pc`, `onderzoek stoel`, `onderzoek koffiemok` en `onderzoek
broncode-doos` gaven alle vier de kamerbeschrijving terug — de alinea die je net
gelezen had. Het hele spel had twee unieke onderzoeks-teksten.

Er zijn er nu achttien, verdeeld over de vier kamers, in
`AL.strings.onderzoek[sceneId]`. De woordkoppeling staat apart in
`js/logic/world.js` (`ONDERZOEK_WOORDEN`), want dat is taalherkenning en geen
prose. Volgorde telt daar: "broncode" staat vóór "doos", "dakraam" vóór "raam".

Het notitieboek en de gemerkte dozen houden hun eigen tekst — die vertellen over
de voortgang, niet over het voorwerp.

### De parser straft typen niet langer af

Kale richtingen (`noord`, `n`, `oosten`), voorzetsels (`ga naar het noorden`,
`loop west`), lidwoorden (`onderzoek de stoel`), meer werkwoorden (`bekijk`,
`bestudeer`, `inspecteer`, `kijk naar`) en `neem`/`pak` met een echt antwoord in
plaats van "Dat begrijp je niet" — de intro nodigt uitdrukkelijk uit om te
typen, en dan hoort de parser mee te werken.

Eén valstrik: `ga zitten` begint ook met `ga `. De pc-check staat daarom vóór de
richtingherkenning, en een test legt dat vast.

**Afwijking van het plan:** het plan vroeg commandogeschiedenis op pijl-omhoog.
Dat kan niet — de pijltjestoetsen zijn hier het lopen. Het is **F3** geworden,
wat toevallig ook precies de toets is die de Sierra-parsers van toen gebruikten
om het laatste commando te herhalen. De beperking leverde dus de meer
periodejuiste oplossing op.

### De walkthrough hoefde niet mee — nagekeken, niet aangenomen

Het plan ging ervan uit dat `deel1-hints.md` en `deel2-oplossingen.md` mee
moesten omdat ze spelprose citeren. Nagekeken: het enige oordeel-citaat is "We
hebben dit samen gedaan", en die zin is ongewijzigd. Alle commando's die de gids
noemt (`kijk`, `ga oost`, `onderzoek notitieboek`, `open doos`, `ga zitten`,
`help`) zijn gecontroleerd en werken nog.

Er is dus niets onwaar geworden, en de walkthrough is bewust ongemoeid gelaten.
Dat is ook de veiligste keuze: `pandoc` en `typst` staan niet in deze container,
dus de PDF's zijn hier niet te herbouwen. Een gids aanpassen zonder de PDF te
kunnen bijwerken zou de twee uit elkaar laten lopen. De nieuwe parser-tolerantie
en F3 vermelden is winst voor een speler, maar dat hoort in een pakket waar de
PDF's ook echt opnieuw gebouwd kunnen worden.

### Een drift-guard voor de oordeelteksten

`docs/save-en-hints.md` citeert de vier oordeelteksten woordelijk. Bij deze
herschrijving liepen die meteen uit de pas — precies het soort stille drift dat
WP 11 elders al eens moest rechtzetten. Er staat nu een test die de vier teksten
in `strings.js` vergelijkt met wat het document citeert. Dat kan niet meer
ongemerkt verschuiven.

## QC-resultaat

- `node --test test/test-*.mjs` — **259 tests, 259 groen** (was 250; zes nieuwe
  tests, en drie bestaande herschreven omdat ze het oude gedrag vastlegden).
- `npm run lint:scene` schoon, `node tools/check-assets.mjs` driftvrij.
- Rooksmaaktesten via `file://`: `smoke-browser` **20/20** (één check erbij),
  `smoke-pc` 21/21, `smoke-sim` 13/13, `smoke-levels-1-3` 32/32,
  `smoke-levels-4-7` 48/48, `smoke-full-playthrough` 94/94.
- Visueel gecontroleerd: de achtergrond staat op de titelkaart in de stem van de
  verteller, zonder notitieboekpapier; `onderzoek de mok` geeft een echt detail
  en het lidwoord wordt netjes gestript.

De drie herschreven tests, met wat ze nu bewaken:

- "onderzoek geeft per prop een eigen tekst" — asserteert nu expliciet dat het
  antwoord **niet** de kamerbeschrijving is.
- "elke level-spread telt meerdere pagina's" — asserteert nu dat
  `spreads.intro` er níét meer is.
- "de intro draagt de prototype-regel verbatim" — kijkt nu naar
  `strings.intro`. De kernfictie mag van drager veranderen, niet van bewoording.

Nieuw erbij: elk naamwoord uit elke kamerbeschrijving is onderzoekbaar; een
onbekend woord blijft netjes afgewezen; de intro noemt de inzet van het spel
maar suggereert geen oorzaak voor Alberta's verdwijnen (getest op zeven
woorden); richtingen in zes vormen; `ga zitten` landt bij de pc en niet bij
`betreed`; `neem`/`pak` krijgen een antwoord; en de oordeel-drift-guard.

Open, met adres: de walkthrough kan de nieuwe commando's vermelden zodra
`pandoc` en `typst` beschikbaar zijn om de PDF's mee te herbouwen. Staat in
`workflow/voortgang.md`.
