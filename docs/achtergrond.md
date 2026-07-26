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
- **Toon:** warm maar droog, en op papier overheerst het droge. Ze schrijft in
  de kantlijn zoals een vakvrouw haar eigen werk annoteert: korte, trefzekere
  zinnen, en eerst wat er ontbreekt. Haar onbekende opvolger spreekt ze één keer
  aan — in hoofdstuk 1 — en daarna werkt ze door.
- **Vakmanschap:** ze bouwde elk spel eerst als tekstversie in de terminal.
  "Zo begon ik altijd," staat ergens in de kantlijn. Pas als het tekstspel
  klopte, tekende ze eroverheen. Die gewoonte is het scharnier van de hele
  fictie (zie _Prototype-fase_ hieronder).
- **Nalatenschap:** de zolder. Dozen, stof, een pc die nog aanslaat, en het
  notitieboek. De echte broncode is de hoofdprijs, maar ze ligt er niet: ze
  bestaat pas als de speler haar afmaakt (zie de beslissing bij _De
  broncode-doos_ hieronder).

## De verdwijning

Alberta verdween. Het spel legt niet uit hoe of waarheen, en dat is opzet. Ze
is er niet meer; haar werk wel. De speler vult de leegte niet met een
verklaring maar met arbeid: door haar spel af te maken, houdt hij haar dichtbij.

Wat ze wél wist: dat ze dit niet zou afmaken. Het notitieboek is daar het bewijs
van. Zeven hoofdstukken, genummerd, in de volgorde waarin ze gebouwd wilden
worden, elk met een week uit haar eigen schema, en bij elk staat wat er nog aan
ontbreekt. Wie enkel voor zichzelf schrijft, nummert niet en adresseert niet.
Hóe ze het wist staat nergens, en dat blijft zo.

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

> Beslissing (WP 45): **Alberta wist dat ze het niet zou afmaken**, en het
> notitieboek is daarom een bewuste overdracht aan een opvolger die ze niet
> kende. Dat gegeven verklaart niets, en de twee horen strikt uit elkaar te
> blijven: een voorgevoel is een feit zónder uitleg. Het staat in wat ze déed —
> nummeren, ordenen, opschrijven wat ontbreekt, de broncode-doos dichtplakken
> met "pas op het einde" — nooit in wat ze zegt. Dus geen afscheidsbrief, geen
> "als je dit leest, ben ik er niet meer", geen aanleiding, geen dreiging, geen
> datum waar iets op uitloopt. De drie richtlijnen hierboven blijven onverkort
> gelden: het voorgevoel is er één bij, geen uitzondering erop. Zodra prose het
> voorgevoel gaat motiveren, belooft het spel een detectiveplot en is deze
> beslissing gebroken.

## De zolder

De zolder is de hub van het meta-spel. Fysiek klein, dicht bezet, avondlicht
door één dakraam. Sfeer: een werkkamer die halverwege is stilgevallen. Koel,
stil, en net iets te goed bewaard.

Vaste elementen die in de prose en de scènes terugkomen:

- **Het dakraam** met schuin, warm avondlicht (zie de avondlicht-ramp 28–34 in
  `art-stijlgids.md`). Laag al: de streep staat bijna van de vloer af.
- **De dozen**, gelabeld in Alberta's handschrift. Sommige labels zijn grapjes.
- **De pc**: een beige toren met een bolle monitor die nog aanslaat. Hierop
  opent de speler de gesimuleerde editor en terminal
  (zie `spelontwerp-legacy.md`).
- **Het notitieboek**: beschadigd, bladen los, vlekken. Elk level ontgrendelt
  één fragment ervan.
- **De broncode-doos**: dichtgeplakt, gemerkt BRONCODE, en daaronder kleiner
  "pas op het einde". Wat erin zit is háár materiaal van toen — uitdraaien,
  schetsen, haar eigen diskettes van de versie die stukging. De doos gaat
  nooit open; ze is er om te tonen dat ze wist wat ze achterliet, niet om iets
  uit te delen.
- **De diskette**: in de drive van de pc zit een HD-diskette van 1,44 MB met
  een etiket in haar hand: "7 little goats", en daaronder haar nummering. Ze
  heeft dat etiket geschreven voor een spel dat toen nog niet af was. Op het
  einde schrijft de pc de herstelde broncode ernaartoe en neemt de speler de
  diskette mee van zolder. Dát is de prijs, en ze bestaat pas als hij hem
  verdiend heeft.

> Beslissing (WP 48c, op vraag van de docent): tot dit pakket lag de afgewerkte
> broncode "de hele tijd al" in een doos op zolder, en dat klopte niet — het
> spel is nét niet af, dat is de hele premisse. Lars stelde de diskette voor:
> _"Ik vind het niet logisch dat de afgewerkte broncode er de hele tijd al was.
> In de plaats daarvan zou de bewaarde, gerepareerde broncode op een floppy disk
> kunnen bewaard worden die je kan meenemen uit de pc."_ De prijs verhuist
> daarmee van een doos naar een medium dat pas op het einde beschreven wordt.
> De oude regel "De broncode ligt op zolder — neem ze mee", die dit document
> voorschreef, vervalt; wat blijft is dat de speler met echte, draaibare Java
> naar huis gaat.

## Het notitieboek

Het notitieboek is het scharnier tussen de zolder-adventure en het codewerk.
Het was Alberta's werkboek voor _Seven Little Goats_: schetsen, klasseontwerpen,
lijstjes, halve methoden, en in de kantlijn haar losse gedachten. Ze heeft het
tot een overdracht omgebouwd — zeven genummerde hoofdstukken in bouwvolgorde,
elk met een week uit haar schema, en bij elk staat wat er nog aan ontbreekt. Het
is beschadigd — waterschade, losse bladen, doorgelopen inkt — en dat is de in-
fictie-verklaring waarom de code "hersteld" moet worden: stukken zijn
onleesbaar of ontbreken.

De hand is die van een programmeur, niet die van een lesgeefster. Ze schrijft op
wat haar spel nodig heeft, niet wat een klasse is. Sinds WP 48 is dat scherper
gesteld dan "niet didactisch": haar bladen zijn **spec**. Ze noemt klassen,
velden met hun types en signaturen — een klassekaart, zoals een programmeur er
een op papier zet vóór ze typt — en daarna wat er stuk of onaf is. Ze legt
níéts uit: niet wat `this` doet, niet wat aliasing is, niet waarom een index bij
0 begint. Dat leren studenten in de les en in de cursus, en in het spel staat
het in de gefaseerde hints, die meetellen voor het oordeel. Haar oudere beelden
(blauwdruk en doos, de plankenbrug, de speurtocht) leven daar verder, niet meer
op papier. De aanhef aan de onbekende lezer staat één keer in het boek —
hoofdstuk 1 — en daarna doet ze wat een programmeur in een overdracht doet:
zeggen wat er nog niet af is.

Elk level draait rond één **spread** (dubbele bladzijde) uit dat boek. Een
spread bevat:

- Alberta's schets of diagram voor dat stuk van het spel — voor hoofdstuk 1 is
  dat letterlijk een klassekaart met de velden van `Geitje` erop.
- Haar spec voor dat stuk: bladzijde 1 wat het moet zijn, bladzijde 2 wat er
  stuk of onaf is. De bindende vorm staat in `levels-en-scharnieren.md`,
  §"Wat een spread draagt".
- De regel "Week X in mijn schema" — haar eigen planning voor dat hoofdstuk.
  Buiten de fictie is het de cursusweek uit `levels-en-scharnieren.md`; in haar
  hand is het niets van onze cursus, alleen de week waarin zij dat stuk wilde
  bouwen. Het spel zegt nergens "van de cursus" op papier van 1993.
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

> Beslissing: de speler krijgt geen naam, geen geslacht en geen gezicht. De
> zolder-sprite is een kleine, neutrale figuur van achteren, opzij én van voren
> (zie `art-stijlgids.md`, sprite-specificaties): een adventure van boven-opzij
> heeft een naar de speler toe lopende houding nodig, en die is er dus ook —
> maar zonder ogen en zonder mond, ook in `sta-zuid`. In-game prose spreekt de
> speler aan met "je/jij", nooit met een eigennaam.

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
  _Seven Little Goats_ als speelbare simulatie. Daarna schrijft hij de herstelde
  broncode weg naar de diskette in de drive; de speler klikt ze eruit en neemt
  ze mee. De epiloog hangt aan dat beeld: wat op de diskette staat, staat ook in
  `seven-little-goats/` — open het in IntelliJ, draai het zelf.

## Toon en register (voor alle in-game tekst)

- **Vlaams Nederlands**, geen hollandismen (zie de projectrichtlijnen). Tech-
  termen blijven Engels (parser, editor, compiler) en krijgen Nederlandse
  lidwoorden.
- **Alberta's stem** (kantlijnnotities, notitieboek-spec, het oordeel): droog,
  competent, kort. Ze draagt werk over in plaats van les te geven: eerste
  persoon over haar eigen spel, concreet over haar eigen klassen, en wat er
  ontbreekt vóór wat het betekent. Nooit een imperatief die naar een klaslokaal
  ruikt ("Schrijf de private velden…"); wel de stand van zaken ("de bedrading
  tussen de kamers ligt los"). Sinds WP 48 is dat ook een grens op de inhoud en
  niet enkel op de toon: op papier specificeert ze, ze legt niet uit. Eén zin
  kleur per hoofdstuk is het maximum ("Meer heeft het huisje niet nodig.").
  Warm is ze in het oordeel en in de enkele knipoog, niet in elke regel — zij
  is het enige warme in dit spel, en dat blijft zo: de kou zit in de kamer,
  niet in haar. Dat contrast is het punt.
- **De verteller** (zolderbeschrijvingen, systeemtekst): rustig, observerend,
  King's Quest-achtig zuinig, en koel. Hij oordeelt niet en hij troost niet; hij
  noemt wat er staat. Lopen herbeschrijft niet; `kijk` wel (zie
  `engine-architectuur.md`).
- **Geen AI-tells**, geen decoratieve drieslagen, geen uitroeptekens-
  enthousiasme. De emotie zit in de terughoudendheid. Bij een koeler register
  telt dat dubbel: één droge zin doet meer dan drie sfeerzinnen.
- **De duisternis komt uit _Seven Little Goats_ zelf.** Alberta schreef een
  verhaal waarin zes kinderen worden opgegeten, een wolf wordt opengelegd en één
  van de vier eindes ("de afrekening") eindigt op de regel "Koud en onaf." — en
  ze heeft het niet afgemaakt. Het
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
