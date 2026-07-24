# Achtergrond

De verhaalbijbel van _The Legacy of Alberta_. Alles wat een schrijver of een
artiest nodig heeft om in-game prose te maken die klopt: wie Alberta was, wat
er met haar gebeurde, waarom de zolder eruitziet zoals hij eruitziet, en hoe
het meta-spel de speler positioneert. Elke tekstregel in `js/logic/strings.js`
moet met dit document sporen. Wijk je ervan af, pas dan eerst dit document aan.

## Kern in één alinea

Je grootmoeder Alberta was game-ontwerpster in de vroege jaren negentig. Ze
verdween — nooit opgehelderd — terwijl ze aan een vervolg werkte op haar eigen
_Revenge of Red Riding Hood_. Je erft haar zolder. Tussen de dozen staan haar
oude pc en een beschadigd notitieboek: de aanzet tot dat vervolg, **Seven
Little Goats**, dat ze nooit afmaakte. Jij maakt het af, hoofdstuk per
hoofdstuk, als eerbetoon. Elk stuk dat je herstelt, herstelt een stuk van haar
spel — en scherpt precies de programmeervaardigheid aan die je op dat moment in
**Programming Fundamentals** nodig hebt.

## Wie is Alberta

- **Naam:** Alberta. In-game noemt de speler haar consequent "Alberta" of
  "grootmoeder", nooit bij een achternaam. Geen achternaam vastleggen houdt
  haar half-legendarisch en vermijdt een schijn-biografie.
- **Rol:** een ontwerpster uit de eerste generatie grafische adventures, model
  gestaan naar Roberta Williams (zie `roberta-williams.md`). Ze schreef,
  tekende en programmeerde haar spellen grotendeels zelf.
- **Toon:** warm maar droog. Ze schrijft in de kantlijn zoals ze sprak: korte,
  trefzekere zinnen, af en toe een plagerij tegen haar toekomstige lezer. Haar
  notities richten zich soms rechtstreeks tot "jij die dit later leest".
- **Vakmanschap:** ze bouwde elk spel eerst als tekstversie in de terminal.
  "Zo begon ik altijd," staat ergens in de kantlijn. Pas als het tekstspel
  klopte, tekende ze eroverheen. Die gewoonte is het scharnier van de hele
  fictie (zie _Prototype-fase_ hieronder).
- **Nalatenschap:** de zolder. Dozen, stof, een pc die nog aanslaat, en het
  notitieboek. En, verborgen tussen alles, de echte broncode — de hoofdprijs.

## De verdwijning

Alberta verdween. Het spel legt niet uit hoe of waarheen, en dat is opzet. Ze
is er niet meer; haar werk wel. De speler vult de leegte niet met een
verklaring maar met arbeid: door haar spel af te maken, houdt hij haar dichtbij.

De leegte is wél ongemakkelijk. Ze was eerder omschreven als "zacht en
sprookjesachtig"; dat maakte de zolder een warm archief dat geduldig wachtte, en
daar werd het spel te braaf van. De kamer is halverwege stilgevallen. De stoel
staat weggedraaid alsof ze even is opgestaan, en het stof zegt dat dat niet zo
is. Dat contrast — het lijkt vers, het is het niet — draagt het onbehagen, niet
een verklaring en niet een dreiging.

Richtlijnen voor prose over de verdwijning:

- Nooit een oorzaak noemen (geen ziekte, geen ongeval, geen mysterie-plot).
- Wel de afwezigheid voelbaar maken via objecten: een halfvolle koffiemok, een
  pen die nog in het boek ligt, een stoel die net verlaten lijkt.
- De speler rouwt niet luidop. Hij werkt. Het eerbetoon zit in de daad.

> Beslissing: de verdwijning blijft volledig onverklaard. Geen enkele level-
> spread of eindtekst mag een oorzaak suggereren. Dit houdt de toon licht
> genoeg voor een cursuscontext en vermijdt dat het spel een detectiveplot
> belooft dat het niet waarmaakt.

## De zolder

De zolder is de hub van het meta-spel. Fysiek klein, dicht bezet, avondlicht
door één dakraam. Sfeer: een werkkamer die halverwege is stilgevallen. Koel,
stil, en net iets te goed bewaard.

Vaste elementen die in de prose en de scènes terugkomen:

- **Het dakraam** met schuin, warm namiddaglicht (zie de dusk-ramp in
  `art-stijlgids.md`).
- **De dozen**, gelabeld in Alberta's handschrift. Sommige labels zijn grapjes.
- **De pc**: een beige toren met een bolle monitor die nog aanslaat. Hierop
  opent de speler de gesimuleerde editor en terminal (zie `spelontwerp-
  legacy.md`).
- **Het notitieboek**: beschadigd, bladen los, vlekken. Elk level ontgrendelt
  één fragment ervan.
- **De broncode-doos**: pas op het einde relevant. Hierin ligt, letterlijk, de
  echte Java van `seven-little-goats/`. "De broncode ligt op zolder — neem ze
  mee."

## Het notitieboek

Het notitieboek is het scharnier tussen de zolder-adventure en het codewerk.
Het is Alberta's werkboek voor _Seven Little Goats_: schetsen, klasseontwerpen,
lijstjes, halve methoden, en in de kantlijn haar losse gedachten. Het is
beschadigd — waterschade, losse bladen, doorgelopen inkt — en dat is de in-
fictie-verklaring waarom de code "hersteld" moet worden: stukken zijn
onleesbaar of ontbreken.

Elk level draait rond één **spread** (dubbele bladzijde) uit dat boek. Een
spread bevat:

- Alberta's schets of diagram voor dat stuk van het spel.
- Haar notitie over wat de code moet doen (dit wordt de puzzelbrief).
- De regel "Dit zou je moeten kunnen na week X van de cursus" — Alberta's eigen
  markering van hoe ver een lezer moet staan.
- De beschadiging zelf: precies dáár waar de puzzel zit.

De spreads zijn ook een goedkope scène-vorm: getekende pagina's in plaats van
volledige kamers (zie `art-stijlgids.md`, notitieboek-visuele taal).

## Prototype-fase (de centrale fictie)

Dit is de belangrijkste zin van de hele backstory, en hij moet expliciet in de
intro staan:

> Alberta bouwde elk spel eerst als tekstversie in de terminal. Zo begon ze
> altijd.

Wat de speler herstelt is dus **geen grafisch spel maar een Java-tekstspel dat
in een terminal draait**. Binnen de fictie is dat de prototype-fase van _Seven
Little Goats_: de grafische versie zou later komen, maar zover raakte Alberta
niet. De speler werkt aan de tekstversie.

Waarom deze fictie belangrijk is — ze doet drie dingen tegelijk:

1. **Ze verklaart de vorm.** Een terminal-tekstspel is klein genoeg om te lezen
   en te herstellen. Geen framework, geen graphics-engine — alleen klassen,
   methoden, lussen. Precies de gereedschapskist van de cursus.
2. **Ze verklaart de moeilijkheidsgraad.** De speler hoeft geen game-engine te
   begrijpen; hij herstelt afgebakende stukjes Java.
3. **Ze maakt het echt.** Het soort spel dat de speler herstelt, is exact het
   soort spel dat hij in Programming Fundamentals zelf schrijft. De predecessor
   _Revenge of Red Riding Hood_ ís zo'n cursusproject. Dat is geen toeval: het
   is het punt.

Let op de laag-in-laag: het **meta-spel** (de zolder, de browser, de graphics)
is modern JavaScript, buiten de cursusgrenzen. Het **spel-in-het-spel** (_Seven
Little Goats_, de Java) blijft strikt binnen de cursusgrenzen. De speler beweegt
grafisch door de zolder maar codeert in tekst. Die grens moet in de prose altijd
helder blijven: als de speler aan de pc zit, zit hij binnen Alberta's terminal-
wereld.

## De speler

De speler is Alberta's kleinkind. Geslacht, naam en leeftijd blijven open zodat
elke student zich de rol kan aanmeten.

> Beslissing: de speler krijgt geen naam, geen geslacht en geen sprite-gezicht
> in close-up. De zolder-sprite is een kleine, neutrale figuur van achteren en
> opzij (zie `art-stijlgids.md`, sprite-specificaties). In-game prose spreekt
> de speler aan met "je/jij", nooit met een eigennaam.

De motivatie van de speler is eerbetoon, niet erfenis-in-geld of mysterie-
oplossen. Hij maakt af wat Alberta niet afkreeg. Dat motief draagt elke
level-intro en elke overwinningstekst.

## Hoe het meta-spel de speler kadert

De frame-logica die elk stukje prose moet respecteren:

- **De zolder is nu.** De speler is er vandaag, erft, ruimt op, ontdekt.
- **Het notitieboek is Alberta's verleden.** Haar handschrift, haar stem, haar
  onafgemaakte werk.
- **De pc is de brug.** Ga je zitten, dan stap je Alberta's terminal-wereld in
  en werk je aan haar code.
- **Elk hersteld hoofdstuk is dubbel winst.** Het herstelt een stuk van _Seven
  Little Goats_ én markeert dat de speler een scharnier van de cursus beheerst.
- **Het einde geeft de prijs.** Level 7 af = Alberta's spel draait. De pc boot
  _Seven Little Goats_ als speelbare simulatie. De epiloog wijst naar de echte
  Java-broncode in `seven-little-goats/`: neem ze mee van zolder, open ze in
  IntelliJ, draai ze zelf.

## Toon en register (voor alle in-game tekst)

- **Vlaams Nederlands**, geen hollandismen (zie de projectrichtlijnen). Tech-
  termen blijven Engels (parser, editor, compiler) en krijgen Nederlandse
  lidwoorden.
- **Alberta's stem** (kantlijnnotities, puzzelbriefjes, het oordeel): droog,
  warm, kort, af en toe een knipoog naar de lezer-in-de-toekomst. Zij is het
  enige warme in dit spel, en dat blijft zo — de kou zit in de kamer, niet in
  haar. Dat contrast is het punt.
- **De verteller** (zolderbeschrijvingen, systeemtekst): rustig, observerend,
  King's Quest-achtig zuinig, en koel. Hij oordeelt niet en hij troost niet; hij
  noemt wat er staat. Lopen herbeschrijft niet; `kijk` wel (zie
  `engine-architectuur.md`).
- **Geen AI-tells**, geen decoratieve drieslagen, geen uitroeptekens-
  enthousiasme. De emotie zit in de terughoudendheid. Bij een koeler register
  telt dat dubbel: één droge zin doet meer dan drie sfeerzinnen.
- **De duisternis komt uit _Seven Little Goats_ zelf.** Alberta schreef een
  verhaal waarin zes kinderen worden opgegeten, een wolf wordt opengelegd en één
  van de vier eindes "koud en onaf" heet — en ze heeft het niet afgemaakt. Het
  kader mag dat laten voelen: in wat er op de opengeslagen bladzijde staat, in
  wat de intro aankondigt, in wat de terminal belooft voor ze boot. Er hoeft
  geen greintje nieuwe fictie bij; de donkerte ligt er al, ze werd tot nu toe
  alleen nergens gebruikt.

## Verhouding tot _Revenge of Red Riding Hood_

_Seven Little Goats_ is het vervolg dat Alberta plande op haar eigen eerste
spel, _Revenge of Red Riding Hood_ (de echte predecessor-repo). De sprookjes-
logica loopt door: dezelfde wereld, dezelfde wolf-mythologie, dezelfde
morele ambiguïteit rond wraak en genade. Details van _Seven Little Goats_ zelf
staan in `spelontwerp-seven-little-goats.md`; de link met het eerste spel
(de vier eindes die elkaar spiegelen, de jonge wolf als neef van de oude) hoort
daar thuis. Voor de backstory volstaat: Alberta maakte spel één af; spel twee
bleef liggen; jij maakt het af.
