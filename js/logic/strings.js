// strings.js — alle speler-gerichte tekst van de zolder-adventure op één plek.
// De logica verwijst naar sleutels, nooit naar letterlijke strings (harde
// projectregel). De renderer doet zelf de word-wrap: teksten staan hier zonder
// handmatige regelafbrekingen, behalve waar een witregel of "\n" betekenis
// heeft.
//
// Toon en register volgen docs/achtergrond.md, §"Toon en register": Vlaams
// Nederlands zonder hollandismen, Alberta's stem droog en warm, de verteller
// rustig en King's-Quest-zuinig.
//
// Let op bij het herschrijven van de spreads: de bladspiegel telt twee kolommen
// van 17 tekens en 12 regels (zie AL.spreads.BLAD in
// js/scenes/scene-spread-template.js). Een pagina die boven de 24 gewrapte
// regels uitkomt, wordt afgekapt.
//
// Aangepast uit remake-90s (js/logic/strings.js): dezelfde vorm (data +
// kleine sjabloonfuncties, Node-export), nieuwe inhoud.
//
// Draait zowel in de browser (AL.strings) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

AL.strings = {

  titel: "THE LEGACY OF ALBERTA",
  // De titelkaart zet de titel in twee lagen: een kleine bovenregel en de naam
  // groot eronder. Eén regel van 21 tekens past op geen enkele leesbare schaal
  // binnen 320 px, en twee lagen is bovendien hoe een titelkaart uit die tijd
  // er meestal uitzag.
  titelBoven: "THE LEGACY OF",
  titelGroot: "ALBERTA",
  ondertitel: "de zolder van grootmoeder",
  drukEnter: "Druk op Enter",
  openingOverslaan: "Esc: overslaan",

  // De intro: een korte reeks berichtvensters die de kernfictie zet. De laatste
  // alinea bevat de cruciale zin uit achtergrond.md (de prototype-fase).
  intro: [
    "Je grootmoeder Alberta maakte spellen, in de tijd dat een spel nog op " +
    "één zolder paste. Ze is er niet meer. Haar werk staat er nog: dozen tot " +
    "tegen de balken, stof op alles, en een pc die het na al die jaren nog " +
    "doet.",

    "Tussen de dozen ligt haar notitieboek. Losse bladen, doorgelopen inkt, " +
    "vlekken waar het vocht bij kon.",

    "Erin staat Seven Little Goats: zes geitjes die de wolf binnengaan, een " +
    "zevende die zich in de klokkast verstopt, en een afrekening aan de " +
    "rivier. Ze heeft het niet afgemaakt.",

    "Alberta bouwde elk spel eerst als tekstversie in de terminal. Zo begon " +
    "ze altijd. Wat jij herstelt is dus geen tekening, maar haar code — stuk " +
    "voor stuk, tot haar spel weer draait.",

    "Typ 'kijk' om rond te kijken, 'help' voor de commando's, '?' als je " +
    "vastzit. Lopen doe je met de pijltjestoetsen."
  ],

  // De zolderscènes: naam, beschrijving (voor 'kijk' en het eerste bezoek) en
  // een plaats-hint (voor '?': waar zit het volgende fragment). De sleutels
  // zijn de scène-ids uit art-stijlgids.md.
  scenes: {
    "zolder-west": {
      naam: "Zolder — westhoek",
      beschrijving: "De westhoek. Dozen tot tegen de balken, dicht op " +
        "elkaar. Door het dakraam valt een schuine streep licht, laag al, " +
        "bijna van de vloer af. Op een kist ligt Alberta's notitieboek, " +
        "opengeslagen, met de pen er nog in. Naar het oosten loopt de zolder " +
        "verder.",
      hint: "Het notitieboek ligt open in het licht. Onderzoek het, of open " +
        "het — daar begint alles."
    },
    "zolder-midden": {
      naam: "Zolder — doorgang",
      beschrijving: "De doorgang, waar de balken samenkomen en het dak laag " +
        "wordt. Hier haalt het licht al minder. Midden op de vloer staat een " +
        "doos die zwaarder oogt dan de andere, dichtgeplakt met tape die geel " +
        "geworden is. Op het label, in haar hand: BRONCODE. Achterin gaat een " +
        "trap naar boven.",
      hint: "De broncode-doos in het midden telt pas op het einde. Ga eerst " +
        "verder waar het licht heen trekt: naar het oosten, naar de pc."
    },
    "zolder-oost": {
      naam: "Zolder — werkhoek",
      beschrijving: "Alberta's werkhoek. De stoel staat schuin van het " +
        "bureau weggeschoven, alsof ze even is opgestaan. Op het stof na, " +
        "dat overal even dik ligt. De pc doet het nog: een beige toren, een " +
        "bolle monitor die warm oranje nagloeit. Naast het toetsenbord staat " +
        "een halfvolle mok.",
      hint: "Ga aan de pc zitten. Daar werk je aan Alberta's code — typ 'ga " +
        "zitten'."
    },
    "overloop": {
      naam: "Zolder — overloop",
      beschrijving: "De overloop, boven aan de trap. Kouder hier, en het " +
        "dakraam is ver: het licht haalt de hoeken niet. Tegen de wand staan " +
        "de dozen van later opgestapeld, hoger dan jij. De trap loopt terug " +
        "naar beneden.",
      hint: "De dozen hierboven dragen de latere hoofdstukken. Open er een als " +
        "je aan het volgende fragment toe bent."
    }
  },

  // Onderzoeks-teksten per scène. Elk zelfstandig naamwoord dat in een
  // kamerbeschrijving voorkomt, hoort hier een eigen antwoord te hebben —
  // anders krijgt de speler die iets van dichtbij bekijkt de kamer opnieuw, en
  // dat leest als onaf. De woordkoppeling (welke synoniemen naar welke sleutel
  // wijzen) staat in js/logic/world.js; dit bestand draagt alleen de tekst.
  onderzoek: {
    "zolder-west": {
      dozen: "Karton dat lang gedragen heeft. De onderste zijn ingezakt " +
        "onder het gewicht van de bovenste, en niemand heeft ze rechtgezet.",
      kist: "Een houten kist met een deksel dat niet meer sluit. Het " +
        "notitieboek ligt erop, niet erin.",
      pen: "Een vulpen, dwars over de bladzijde, dop ernaast. De inkt in de " +
        "punt is allang ingedroogd.",
      dakraam: "Vier ruiten, drie schoon genoeg om door te kijken. De " +
        "lichtstreep die erdoor valt is de enige die er nog is; hij schuift " +
        "traag naar de muur toe.",
      balken: "Ruw hout, ongeschilderd. Er hangt een haak in, waar niets aan " +
        "hangt."
    },
    "zolder-midden": {
      broncode: "De tape is geel en bros, maar hij zit er nog helemaal op. " +
        "Op het label staat BRONCODE, en daaronder, kleiner: pas op het einde. " +
        "Ze heeft die doos dichtgemaakt met de bedoeling dat iemand hem later " +
        "zou openen.",
      trap: "Een smalle trap zonder leuning. Boven is het donkerder dan hier.",
      balken: "Hier komen de balken samen en zakt het dak tot net boven je " +
        "hoofd. Je hoort de wind erlangs gaan.",
      label: "Haar handschrift, in inkt, met de rustige hand van iemand die " +
        "de tijd nam."
    },
    "zolder-oost": {
      pc: "Een beige toren met een bolle monitor erop. Hij staat aan. Wie " +
        "hem heeft aangezet, heeft hem nooit meer uitgezet.",
      monitor: "Amber op zwart, en een cursor die knippert zoals hij al die " +
        "jaren geknipperd heeft.",
      stoel: "Een bureaustoel, schuin weggedraaid, alsof iemand er net is " +
        "uit opgestaan om iets te halen.",
      bureau: "Vol, maar niet rommelig. Alles ligt waar iemand het bij de " +
        "hand wilde hebben.",
      toetsenbord: "De letters op de meest gebruikte toetsen zijn weg " +
        "gesleten. E, A, R, en de spatiebalk.",
      mok: "Halfvol. Er staat geen ring in, geen schimmel, niets dat " +
        "vertelt hoe lang hij er staat. Je laat hem staan."
    },
    "overloop": {
      dozen: "Hoger opgestapeld dan de rest, en dieper in het archief. Wat " +
        "hier staat, wilde ze niet meteen bij de hand hebben.",
      trap: "Naar beneden loopt hij terug naar de doorgang. Naar boven loopt " +
        "hij niet verder; hier houdt het huis op.",
      wand: "Kaal pleisterwerk, koud aan je hand. Aan deze kant van de " +
        "zolder is nooit iets opgehangen."
    }
  },

  // De gemerkte dozen: de latere notitieboek-fragmenten (levels 2–7) zitten in
  // dozen dieper in de zolder (zolder-midden en de overloop), zodat er lichte
  // progressie is (spelontwerp-legacy.md, §"De lus per level", stap 1). De
  // broncode-doos is een aparte prop en telt pas op het einde.
  dozen: {
    onderzoek: "Kartonnen dozen, dichtgeplakt, gemerkt in Alberta's hand. Op " +
      "één staat DIVERSEN, en daaronder kleiner: ook rommel. In een van deze " +
      "dozen zit het volgende blad van haar notitieboek — als je aan dat " +
      "hoofdstuk toe bent.",
    allesGevonden: "Je hebt elk fragment van het notitieboek gevonden. Alles wat " +
      "je nog rest, ligt op de pc — en op het einde, in de broncode-doos.",
    // Waar het eerstvolgende fragment ligt als het niet in deze kamer zit.
    nietHier: {
      "zolder-west": "Het eerstvolgende blad zit niet hier. Het notitieboek zelf " +
        "ligt in de westhoek — begin daar.",
      "zolder-midden": "Het eerstvolgende blad zit niet hier, maar in de doorgang " +
        "in het midden. Zoek daar verder.",
      "overloop": "Het eerstvolgende blad zit dieper in het archief: boven, op " +
        "de overloop. Ga eerst de trap op."
    }
  },

  // Het notitieboek op zolder-west (level 1 se fragment).
  notitieboek: {
    onderzoek: "Het boek ligt open op een dubbele bladzijde. Een schets van " +
      "een kamer met zeven kruisjes erin, waarvan er zes zijn doorgehaald. " +
      "Daarnaast een halve methode, waar het vocht de andere helft van heeft " +
      "weggevreten. Onderaan, in haar hand: 'Dit zou je moeten kunnen na " +
      "week 3.'",
    open: "Je slaat het notitieboek open bij de eerste bladzijde die nog " +
      "heel is. Het eerste hoofdstuk van Alberta's spel ligt voor je — " +
      "beschadigd, maar leesbaar genoeg om te herstellen.",
    alGevonden: "Je hebt dit fragment al. Ga aan de pc zitten om eraan te " +
      "werken."
  },

  // De pc.
  pc: {
    gaZitten: "Je schuift Alberta's stoel bij en legt je handen op het " +
      "toetsenbord. De monitor knippert wakker. Je zit in haar terminal.",
    geenFragment: "Je hebt nog geen fragment om aan te werken. Zoek eerst " +
      "verder op de zolder.",

    // Chrome-labels van de gesimuleerde pc (DOM-overlay). Period-look: een
    // beige editor met regelnummers, een amber terminal. Alle knop- en
    // menutekst leeft hier, nooit inline in js/pc/*.js.
    editTitel: "ALBERTA'S EDIT  v2.3",
    terminalTitel: "ALBERTA'S TERMINAL  —  seven little goats",
    menuTitel: "Alberta's pc",
    menuOnder: "Kies een taak: cijfertoets of klik. Esc — terug naar de zolder.",
    knopCompileer: "compileer & test  [F9]",
    knopTerug: "terug  [menu]",
    knopMenu: "menu",
    statusOpen: "open",
    statusBezig: "bezig",
    statusAf: "af",
    prompt: "> ",
    javacKop: "javac Voorwerp:",
    javacGeenFouten: "javac: geen fouten — de tests draaien…",
    alleChecksOk: "Alle controles groen. Dit stuk van Alberta's spel draait weer.",
    checkOk: "CHECK_OK   ",
    checkFail: "CHECK_FAIL ",
    terugNaarMenu: "— terug naar het menu —",
    typHint: "Typ '?' voor een hint, 'menu' om terug te gaan, Esc voor de zolder.",
    hintKop: "hint",
    // F1, niet '?'. In de editor was '?' nooit een hint: het zette gewoon een
    // vraagteken in de code. Alleen de terminal en de zolder kennen '?'; de
    // editor heeft nu F1, zoals elke Turbo-editor.
    editorGeladen: "geladen. Herstel de code en druk F9 (of 'compileer & test'). " +
      "F1 geeft een hint, Esc keert terug naar de zolder.",

    // De labels op de menubalk en de F-toetsenbalk. Kort, want ze staan op één
    // regel naast elkaar en die regel is 320 logische pixels breed.
    balkCompileer: "Compileer",
    balkHint: "Hint",
    balkMenu: "Menu",
    balkZolder: "Zolder",
    balkKies: "Kies een taak",
    balkNaamplaat: "ALBERTA'S PC"
  },

  // Losse systeemmeldingen (verteller: rustig, zuinig).
  datBegrijpJeNiet: "Dat begrijp je niet.",
  dieKantKanJeNietOp: "Die kant kan je niet op.",
  datZieJeHierNiet: "Dat zie je hier niet.",
  neemNiet: "Laat maar staan. Op deze zolder draag je niets mee; je herstelt " +
    "alleen wat er al ligt.",
  nietsBijzonders: "Niets bijzonders.",

  // Inventaris (in de zolder draag je weinig; het framework laat het toe).
  draagtNiets: "Je hebt niets bij je. Alles wat telt, ligt op de zolder.",
  draagtBijJe: "Je hebt bij je:",

  // Help: de commandolijst voor de zolder-modus.
  helpTitel: "Op de zolder kan je:",
  help: [
    "kijk               kijk de hoek opnieuw rond",
    "ga <richting>      loop noord / oost / zuid / west",
    "onderzoek <ding>   bekijk iets van dichtbij",
    "open <ding>        open een doos of het notitieboek",
    "ga zitten          ga aan de pc werken",
    "inventaris         toon wat je bij je hebt",
    "?                  een hint voor waar je nu vastzit",
    "herbegin           begin het spel opnieuw (vraagt bevestiging)",
    "geluid aan / uit   zet het geluid om",
    "crt aan / uit      zet de beeldbuislijnen om",
    "F3                 haal je vorige commando terug",
    "help               deze lijst"
  ],

  // Herbegin (save-en-hints.md): vraagt bevestiging, want het gooit voortgang
  // weg. De vraag blijft staan terwijl je typt; Escape laat alles zoals het is.
  herbeginVraag: "Herbeginnen wist je voortgang — al je herstelde hoofdstukken " +
    "en concepten. Typ 'herbegin ja' om te bevestigen, Esc om het te laten.",

  // Geluid.
  geluidAan: "Geluid aan.",
  geluidUit: "Geluid uit.",

  // De beeldbuislijnen over het canvas.
  crtAan: "Beeldbuis aan.",
  crtUit: "Beeldbuis uit.",

  // Placeholder-hints per puzzel (drie stadia, oplopend, nooit het antwoord;
  // save-en-hints.md, §"Het hint-contract"). De echte level-hints komen bij de
  // level-WP's; deze horen bij de placeholder-puzzel 'l1-editor' waarmee het
  // framework getest wordt. Stap 1 hergebruikt de scharnier-metafoor, stap 2
  // lokaliseert, stap 3 geeft de structurele vorm met plaatshouders.
  puzzelHints: {
    "l1-editor": [
      "Denk aan de blauwdruk en de doos: de constructor vult de velden van " +
        "een vers object. Wat gaat waarheen?",
      "Kijk naar de toewijzing in de constructor. Eén veld blijft leeg terwijl " +
        "de parameter er klaar voor staat.",
      "De vorm is: this.<veld> = <parameter>; — vul de echte namen zelf in."
    ],

    // Level 0 — de proefdruk (dummy-level; oefent elke puzzelsoort).
    "l0-editor-repair": [
      "Denk aan de blauwdruk en de doos: de constructor vult de velden van " +
        "een vers Voorwerp. Eén veld blijft leeg.",
      "Kijk naar de toewijzingen in de constructor. Bij één ervan mist de " +
        "verwijzing naar het object zelf.",
      "De vorm is: this.<veld> = <parameter>;  — het linkerdeel wijst naar het " +
        "veld, het rechterdeel naar de parameter."
    ],
    "l0-editor-write": [
      "Een klasse is een blauwdruk: eerst de velden (wat een Geitje heeft), " +
        "dan de constructor die ze invult, dan de getters.",
      "Je mist minstens één private veld en de toewijzing ervan in de " +
        "constructor. Vergelijk met wat de notitie vraagt.",
      "Vorm: private <type> <naam>;  en in de constructor this.<naam> = " +
        "<naam>;  en een getter die 'return <naam>;' doet."
    ],
    "l0-parsons": [
      "Een methode begint met haar kop, dan de body van boven naar onder, en " +
        "sluit met een accolade.",
      "Eén strook hoort er niet bij — de methode verdubbelt, ze " +
        "vermenigvuldigt niet met zichzelf.",
      "Volgorde: kop → lokale variabele berekenen → die teruggeven → sluiten."
    ],
    "l0-trace": [
      "De lus telt op: 1, dan 1+2, dan 1+2+3 … tot en met N.",
      "Reken stap voor stap: begin bij totaal 0 en tel er elke ronde i bij.",
      "Het is de som 1 + 2 + … + N. Voor N is dat N × (N + 1) / 2."
    ],
    "l0-vindfout": [
      "Denk aan de plank te ver: waar loopt de lus één stap te lang door?",
      "Kijk naar de grens van de for-lus, niet naar de romp.",
      "Bij een index van 0 tot size() hoort '<', niet '<=': anders lees je " +
        "één plaats voorbij het einde."
    ],
    "l0-verklaar": [
      "Wat betekent 'null' hier: iets, of net niets?",
      "Denk aan wat de aanroeper daarna doet met het resultaat.",
      "null staat voor 'niets gevonden'; de aanroeper controleert erop " +
        "vooraleer hij het object gebruikt."
    ],
    "l0-patroonkaart": [
      "Kijk wat de lus doet zodra ze iets vindt: telt ze, of stopt ze?",
      "De lus geeft meteen iets terug bij een treffer, en anders null.",
      "Een lus die één passend element opzoekt en teruggeeft, is de zoeklus."
    ],

    // Level 1 — De blauwdruk en de doos (scharnier 1).
    "l1-editor-repair": [
      "Denk aan de blauwdruk en de doos: de constructor vult de velden van een " +
        "verse doos. Wat gaat waarheen?",
      "Kijk naar de toewijzingen in de constructor. Bij één veld ontbreekt de " +
        "verwijzing naar de doos zelf, of ze staat omgekeerd.",
      "De vorm is: this.<veld> = <parameter>;  — links het veld van déze doos, " +
        "rechts wat erin gaat."
    ],
    "l1-editor-write": [
      "Een klasse is een blauwdruk: eerst de velden (wat een geitje heeft), dan " +
        "de constructor die de verse doos vult, dan de getters.",
      "Je mist nog een privaat veld, een toewijzing in de constructor, of een " +
        "getter. Vergelijk met wat de notitie opsomt.",
      "Vorm: private <type> <naam>;  in de constructor this.<naam> = <naam>;  " +
        "(gered begint op false)  en een getter met return <naam>;"
    ],
    "l1-verklaar": [
      "Denk aan de blauwdruk en de doos: het ene is het plan, het andere het " +
        "ding dat je ermee bouwt.",
      "Welk woord hoort bij het plan (je tekent het één keer), en welk bij het " +
        "ding (je maakt er vele van)?",
      "Klasse = de blauwdruk (het type); instantie = één doos die je ernaar " +
        "bouwt (het object). Zeg dat verschil in je eigen zin."
    ],

    // Level 2 — Trechters erin, goot eruit (scharnier 2).
    "l2-editor-repair": [
      "Denk aan de machine: trechters erin (parameters), een goot eruit (return) " +
        "of niets eruit (void).",
      "Kijk naar de koppen van de methoden. Eén geeft iets terug maar zegt void, " +
        "of een trechter is verdwenen.",
      "Vorm: <returntype> <naam>(<type> <parameter>) { … }  — een getter geeft " +
        "iets terug, een setter neemt een waarde aan."
    ],
    "l2-parsons": [
      "Trechters erin, goot eruit: de methode begint met haar kop, werkt van " +
        "boven naar onder, en sluit met een accolade.",
      "Eén strook geeft de verkeerde doos terug — de parameter in plaats van het " +
        "gevonden object.",
      "Volgorde: kop → lus over de inventaris → het huidige voorwerp pakken → " +
        "vergelijken → het gevonden voorwerp teruggeven → anders null."
    ],
    "l2-trace": [
      "Drie dozen: attribuut, parameter, lokale variabele. Welke doos bedoelt de " +
        "naam hier?",
      "Zonder 'this' pakt de code de dichtstbijzijnde doos: de parameter. Met " +
        "'this.' de doos van het object.",
      "De eerste regel drukt de parameter af; this.levenspunten drukt het " +
        "attribuut (20) af. Geef beide getallen."
    ],

    // Level 3 — De knikkerbaan (scharnier 3).
    "l3-editor-repair": [
      "Denk aan de knikkerbaan: de waarde moet tussen twee randen blijven, nooit " +
        "onder de ene, nooit boven de andere.",
      "Kijk naar de twee if-controles. Eén rand staat de verkeerde kant op, of " +
        "een rand ontbreekt.",
      "Vorm: if (waarde < ondergrens) { waarde = ondergrens; }  en  " +
        "if (waarde > bovengrens) { waarde = bovengrens; }"
    ],
    "l3-vindfout": [
      "De knikkerbaan stuurt met && (en) / || (of): welke van de twee laat de " +
        "knikker door als béide sporen kloppen?",
      "Lees de notitie: de poort mag maar open als álle voorwaarden waar zijn. " +
        "Kijk naar de operator in de conditie.",
      "'Beide moeten waar zijn' vraagt && (en), niet || (of). || opent al bij één " +
        "van de twee."
    ],
    "l3-trace": [
      "De cascade splitst de baan: de knikker rolt in de eerste tak die klopt, en " +
        "dan niet meer verder.",
      "Let op de randen: <= 0 pakt ook net 0, en < 10 pakt 10 net niet. Waar valt " +
        "deze waarde?",
      "Loop de takken van boven naar onder: de eerste conditie die waar is, wint. " +
        "Typ de tekst die die tak afdrukt."
    ],

    // Level 4 — Twee pijlen, één doos (scharnier 4).
    "l4-editor-repair": [
      "Twee pijlen, één doos: elke verbinding tussen kamers loopt twee kanten " +
        "op. Wat de ene kant legt, moet de andere kant terugleggen.",
      "Kijk naar de takken van verbindKamers: bij één richting is de setter " +
        "verkeerd, zodat de terugweg nooit meer wordt gelegd.",
      "Vorm: eerste.set<Richting>(tweede); en tweede.set<Tegengestelde>(eerste); " +
        "— de vier richtingen in één if / else if-cascade."
    ],
    "l4-trace": [
      "Twee pijlen, één doos: eerste en tweede wijzen naar dezelfde kamer.",
      "Wat je via tweede zet, staat ook in eerste — het blijft dezelfde doos.",
      "eerste.getNoord() geeft precies de kamer terug die je met tweede." +
        "setNoord(...) hebt gezet."
    ],
    "l4-verklaar": [
      "Twee pijlen, één doos: en null is een pijl die naar géén doos wijst.",
      "Denk aan een kamer zonder uitgang in die richting: waar wijst de buur-" +
        "referentie dan heen?",
      "null = geen enkele doos aan het eind van de pijl: in die richting is er " +
        "geen buurkamer, dus geen uitgang. Zeg dat in je eigen zin."
    ],

    // Level 5 — De patroonkaart (scharnier 5).
    "l5-editor-write": [
      "Welke patroonkaart? telWapens telt (een teller die ophoogt); " +
        "sterksteVoorwerp zoekt het uiterste (onthoud de beste tot nog toe).",
      "Begin telWapens met een teller op 0 en hoog op bij een treffer. Begin " +
        "sterksteVoorwerp met null en vervang zodra je iets sterkers ziet.",
      "Vorm: for (int i = 0; i < inventaris.size(); i++) { ... } — in de tel-lus " +
        "'aantal++;' bij een voorwaarde, in de uiterste-lus 'sterkste = huidig;' " +
        "bij een grotere kracht."
    ],
    "l5-parsons": [
      "De opbouw-kaart: je maakt een regel die met elke ronde langer wordt.",
      "Eén strook overschrijft de regel in plaats van eraan toe te voegen — die " +
        "hoort er niet bij.",
      "Volgorde: begin met de aanhef → lus over de voorwerpen → soms een " +
        "scheidingsteken → voeg de naam toe → druk de regel af."
    ],
    "l5-patroonkaart": [
      "Kijk wat de lus met elk element doet: telt ze er één bij, of telt ze de " +
        "waarde zélf op?",
      "Bij 'som = som + schadelog[i]' groeit som met de waarde, niet met één per " +
        "element.",
      "Eén per element = tellen; de waarde optellen = totaliseren. Kies de " +
        "totaliseer-kaart."
    ],

    // Level 6 — De plankenbrug boven het ravijn (scharnier 6).
    "l6-editor-repair": [
      "De plankenbrug boven het ravijn: de eerste plank is 0, de laatste is " +
        "size() min één. Eén plank te ver en je ligt in het water.",
      "Kijk naar de lusgrens, of naar de soort lus: klopt '<' versus '<=', en is " +
        "het wel de lus die hier past?",
      "Vorm: for (int i = 0; i < voorwerpen.size(); i++) { ... } — '<' houdt je " +
        "op de laatste plank."
    ],
    "l6-trace": [
      "De plankenbrug: tel de planken vanaf 0, niet vanaf 1.",
      "De lus stopt zodra i niet meer kleiner is dan size(): de laatste i die " +
        "nog gedrukt wordt, is size() min één.",
      "Bij N voorwerpen loopt i van 0 tot en met N min één; het laatste getal is " +
        "dus N min één."
    ],
    "l6-vindfout": [
      "De plankenbrug: hoe ver loopt de lus, en is dat één plank te ver?",
      "Kijk naar de grens van de for-lus op regel 1, niet naar de romp.",
      "Vijf rondes (0 t/m 4) vraagt 'ronde < 5', niet 'ronde <= 5': dat laatste " +
        "speelt er zes."
    ],

    // Level 7 — De speurtocht en de dubbele pijl (scharnier 7).
    "l7-editor-write": [
      "De speurtocht: een zoeklus loopt de lijst af, geeft het gevonden object " +
        "terug, of null als de tocht doodloopt.",
      "Loop met een for-lus over geitjes, vergelijk elke naam, en geef bij een " +
        "treffer meteen het geitje terug.",
      "Vorm: for (int i = 0; i < geitjes.size(); i++) { ... if (...) return " +
        "huidig; } en daarna return null;"
    ],
    "l7-editor-repair": [
      "De dubbele pijl: geitje.getSchuilplaats().getKamer() — maar een geitje " +
        "zonder schuilplaats heeft geen kamer om naar te wijzen.",
      "Er ontbreekt een null-controle vóór de tweede pijl, of de keten mist een " +
        "schakel.",
      "Vorm: haal eerst getSchuilplaats() op, controleer of ze null is, en volg " +
        "pas dán .getKamer().getNaam()."
    ],
    "l7-trace": [
      "De speurtocht met de dubbele pijl: soms wijst de eerste pijl naar null.",
      "Controleer eerst of s null is: is ze null, dan stopt de keten op 'nog niet " +
        "gevonden'.",
      "Bij een schuilplaats volg je s.getKamer().getNaam() naar de kamernaam; bij " +
        "null wordt het 'nog niet gevonden'."
    ]
  },

  // Feedback per assertie-meldingKey (checker-contract.md §"Falen → feedback",
  // laag 2). Warm, benoemt het probleem en de VORM, nooit het letterlijke
  // antwoord. De checker levert de sleutel; de pc zoekt de tekst hier op. Dekt
  // de volledige assertie-woordenlijst uit js/logic/checker/asserts.js.
  pcMelding: {
    "veldDeclaratie.ontbreekt":
      "Er ontbreekt nog een veld. Verwacht de vorm: private <type> <naam>;",
    "veldDeclaratie.nietPrivate":
      "Het veld is er, maar het hoort private te zijn. Zet 'private' ervoor.",
    "constructorSignatuur.ontbreekt":
      "De constructor ontbreekt. Geef hem dezelfde naam als de klasse.",
    "constructorSignatuur.verkeerdeParams":
      "De constructor heeft niet de gevraagde parameters. Kijk hun types en " +
      "volgorde na.",
    "constructorToewijzing.ontbreekt":
      "De constructor kent een veld nog niet toe. Verwacht: this.<veld> = " +
      "<parameter>;",
    "constructorToewijzing.omgekeerd":
      "De toewijzing staat omgekeerd. Links het veld, rechts de parameter: " +
      "this.<veld> = <parameter>;",
    "methodeSignatuur.ontbreekt":
      "Er ontbreekt een methode met die naam. Kijk de signatuur nog eens na.",
    "methodeSignatuur.verkeerdRetour":
      "Het returntype klopt niet. Geeft de methode iets terug, of net niet " +
      "(void)?",
    "methodeSignatuur.verkeerdeParams":
      "De parameters kloppen niet. Kijk hun types en volgorde na.",
    "methodeSignatuur.verkeerdeZichtbaarheid":
      "De zichtbaarheid klopt niet (public/private). Vergelijk met de notitie.",
    "heeftReturn.ontbreekt":
      "Er ontbreekt een return. Op elk pad hoort de methode iets terug te geven.",
    "heeftReturn.verkeerdeVorm":
      "De return geeft niet de juiste waarde terug. Kijk WAT je teruggeeft.",
    "heeftReturn.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "conditie.operatorOntbreekt":
      "De voorwaarde mist een tak of een operator. Kijk de if/else-cascade na.",
    "conditie.verkeerdeOperator":
      "De logische operator klopt niet: && (en) versus || (of) maakt hier het " +
      "verschil.",
    "conditie.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "validatieKlem.onvolledig":
      "De klem is niet volledig. Er horen twee grenzen te zijn: een onder- en " +
      "een bovengrens.",
    "validatieKlem.verkeerdeRichting":
      "Een grens staat de verkeerde kant op. Onder klemt met <, boven met >.",
    "validatieKlem.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "lusVorm.ontbreekt":
      "Er ontbreekt een lus. Deze taak vraagt er een.",
    "lusVorm.verkeerdeSoort":
      "De soort lus klopt niet. Deze taak vraagt een for-lus.",
    "lusVorm.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "lusGrenzen.ontbreekt":
      "De lusgrens ontbreekt of is onleesbaar. Verwacht: i = 0; i < size(); i++.",
    "lusGrenzen.offByOne":
      "De lusgrens gaat één te ver. Met een index vanaf 0 hoort '<', niet '<='.",
    "lusGrenzen.verkeerdeGrens":
      "De bovengrens klopt niet. Loop tot de grootte van de lijst.",
    "lusGrenzen.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "aanroepKeten.onvolledig":
      "De ketting van aanroepen is niet volledig. Er mist een schakel.",
    "aanroepKeten.nullCheckOntbreekt":
      "Er mist een null-controle vóór de volgende pijl, anders loop je op niets.",
    "aanroepKeten.nietAaneengesloten":
      "De aanroepen horen aaneengesloten: a.getX().getY() … zonder gat.",
    "aanroepKeten.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "methodeAanroep.ontbreekt":
      "Een verwachte aanroep ontbreekt. Kijk welke methode je hier hoort op te " +
      "roepen.",
    "methodeAanroep.methodeOntbreekt":
      "Ik vind die methode niet. Klopt haar naam?",
    "verboden.switch":
      "Een switch valt buiten de cursusstof hier. Los het op met if/else.",
    "verboden.enum":
      "Een enum valt buiten de cursusstof hier.",
    "verboden.lambda":
      "Een lambda (->) valt buiten de cursusstof hier. Gebruik een gewone lus.",
    "verboden.ternary":
      "De ternaire ?: valt buiten de cursusstof hier. Gebruik een if.",
    "verboden.var":
      "'var' valt buiten de cursusstof hier. Schrijf het type voluit.",
    "verboden.stream":
      "Een stream valt buiten de cursusstof hier. Gebruik een gewone lus.",
    // Terugval als een sleutel ooit zou ontbreken.
    onbekend:
      "Er klopt nog iets niet aan de vorm. Lees de notitie er nog eens bij."
  },

  // Labels voor de CHECK_OK-regels van de editor-puzzels (level 0). Per check
  // één korte, positieve regel. De sleutel staat in de puzzeldef (checks[].uit).
  pcCheckLabels: {
    "l0.voorwerp.veldNaam": "veld 'naam' gedeclareerd",
    "l0.voorwerp.vulNaam": "constructor vult 'naam'",
    "l0.voorwerp.vulBeschrijving": "constructor vult 'beschrijving'",
    "l0.voorwerp.vulKracht": "constructor vult 'kracht'",
    "l0.geitje.veldNaam": "veld 'naam' gedeclareerd",
    "l0.geitje.veldSchuilplaats": "veld 'schuilplaats' gedeclareerd",
    "l0.geitje.vulSchuilplaats": "constructor vult 'schuilplaats'",
    "l0.geitje.getterSchuilplaats": "getSchuilplaats geeft 'schuilplaats' terug",

    // Level 1 — Voorwerp + Geitje.
    "l1.voorwerp.veldNaam": "veld 'naam' gedeclareerd",
    "l1.voorwerp.vulNaam": "constructor vult 'naam'",
    "l1.voorwerp.vulBeschrijving": "constructor vult 'beschrijving'",
    "l1.voorwerp.vulKracht": "constructor vult 'kracht'",
    "l1.geitje.veldNaam": "veld 'naam' gedeclareerd",
    "l1.geitje.veldSchuilplaats": "veld 'schuilplaats' gedeclareerd",
    "l1.geitje.vulNaam": "constructor vult 'naam'",
    "l1.geitje.vulSchuilplaats": "constructor vult 'schuilplaats'",
    "l1.geitje.getterNaam": "getNaam geeft 'naam' terug",
    "l1.geitje.getterSchuilplaats": "getSchuilplaats geeft 'schuilplaats' terug",

    // Level 2 — Speler-signaturen.
    "l2.speler.getLevenspunten": "getLevenspunten geeft een int terug",
    "l2.speler.setLevenspunten": "setLevenspunten neemt een int, geeft niets terug",
    "l2.speler.zoek": "zoek geeft een Voorwerp terug",
    "l2.speler.verwijder": "verwijder geeft een boolean terug",
    "l2.speler.zoekReturn": "zoek bevat een return",

    // Level 3 — de klemmende setter.
    "l3.clamp.geenVerboden": "geen buiten-cursus-constructies",
    "l3.clamp.signatuur": "setLevenspunten heeft de juiste signatuur",
    "l3.clamp.klem": "de waarde wordt tussen 0 en het maximum geklemd",

    // Level 4 — de buur-bedrading (verbindKamers).
    "l4.verbind.geenVerboden": "geen buiten-cursus-constructies",
    "l4.verbind.cascade": "de vier richtingen staan in een if/else-cascade",
    "l4.verbind.setNoord": "de noord-verbinding wordt gelegd",
    "l4.verbind.setZuid": "de zuid-verbinding wordt gelegd",
    "l4.verbind.setOost": "de oost-verbinding wordt gelegd",
    "l4.verbind.setWest": "de west-verbinding wordt gelegd",

    // Level 5 — de twee lus-methoden (tellen + uiterste).
    "l5.lus.geenVerboden": "geen buiten-cursus-constructies",
    "l5.lus.telSignatuur": "telWapens geeft een int terug",
    "l5.lus.telLus": "telWapens telt met een for-lus",
    "l5.lus.telGrens": "telWapens loopt netjes tot inventaris.size()",
    "l5.lus.telReturn": "telWapens geeft de teller terug",
    "l5.lus.sterkSignatuur": "sterksteVoorwerp geeft een Voorwerp terug",
    "l5.lus.sterkLus": "sterksteVoorwerp zoekt met een for-lus",
    "l5.lus.sterkGrens": "sterksteVoorwerp loopt netjes tot inventaris.size()",
    "l5.lus.sterkReturn": "sterksteVoorwerp geeft het uiterste terug",

    // Level 6 — de verwijder-lus (off-by-one).
    "l6.verwijder.geenVerboden": "geen buiten-cursus-constructies",
    "l6.verwijder.lus": "verwijderVoorwerp loopt met een for-lus",
    "l6.verwijder.grens": "de lusgrens blijft op de plankenbrug (< size())",
    "l6.verwijder.remove": "het gevonden voorwerp wordt verwijderd",

    // Level 7 — de zoeklus + de null-veilige keten.
    "l7.zoek.lus": "zoekGeitje speurt met een for-lus",
    "l7.zoek.grens": "de zoeklus loopt netjes tot geitjes.size()",
    "l7.zoek.signatuur": "zoekGeitje geeft een Geitje terug",
    "l7.zoek.return": "zoekGeitje geeft null terug als er niets is",
    "l7.keten.keten": "de dubbele pijl is null-veilig gevolgd",
    "l7.keten.lus": "de keten loopt over alle geitjes met een for-lus",

    generiek: "controle geslaagd"
  },

  // Level 0 — de proefdruk: player-facing prose van de dummy-puzzels (de Java-
  // code en modeloplossingen leven in js/levels/level0.js). Bewust gemarkeerd
  // als testinhoud.
  l0: {
    naam: "Level 0 — de proefdruk",
    intro: "Alberta's proefdruk: één testpagina waarop elke soort puzzel " +
      "precies één keer voorkomt. Geen verhaal, wel alle machinerie.",

    repairTitel: "Voorwerp.java — herstel de constructor",
    writeTitel: "Geitje.java — schrijf de klasse",

    trace: {
      vraag: function (n) {
        return [
          "Voorspel de uitvoer van dit fragment:",
          "",
          "    int totaal = 0;",
          "    for (int i = 1; i <= " + n + "; i++) {",
          "        totaal = totaal + i;",
          "    }",
          "    System.out.println(totaal);",
          "",
          "Typ het getal dat verschijnt."
        ];
      },
      ok: "Juist. Dat is precies wat er uit de lus komt.",
      fout: "Nog niet. Tel de getallen 1 t/m N stap voor stap op."
    },

    vindfout: {
      vraag: [
        "Deze lus loopt over een lijst, maar er zit een fout in:",
        "",
        "  1  for (int i = 0; i <= lijst.size(); i++) {",
        "  2      System.out.println(lijst.get(i));",
        "  3  }",
        "",
        "Op welke regel zit de fout? Typ het regelnummer, of kort wat er mis is."
      ],
      ok: "Raak. De lusgrens gaat één te ver: <= wordt <.",
      fout: "Nog niet daar. Kijk naar de grens van de lus (regel 1)."
    },

    verklaar: {
      vraag: [
        "Leg in één zin uit waarom zoek(...) 'null' teruggeeft wanneer er niets " +
        "gevonden wordt.",
        "",
        "Typ je zin en druk Enter (dit beoordeel je daarna zelf)."
      ],
      toon: "Alberta had het zo genoteerd:",
      model: "Omdat er geen passend Voorwerp bestaat en 'null' hier 'niets " +
        "gevonden' betekent — de aanroeper controleert daar dan op.",
      bevestig: "Komt jouw uitleg in de kern overeen? Typ 'juist' of 'anders'.",
      juist: "Mooi. Je hebt de kern te pakken.",
      anders: "Geen probleem — nu je het model gezien hebt, klopt het beeld."
    },

    patroonkaart: {
      vraag: [
        "Welke patroonkaart hoort bij deze lus?",
        "",
        "    for (int i = 0; i < geitjes.size(); i++) {",
        "        Geitje g = geitjes.get(i);",
        "        if (g.getNaam().equals(naam)) {",
        "            return g;",
        "        }",
        "    }",
        "    return null;",
        "",
        "Typ 1, 2, 3 of 4:"
      ],
      opties: [
        "1) de zoeklus — geeft een passend object of null terug",
        "2) de telling — telt hoeveel elementen voldoen",
        "3) de opsomming — drukt elk element af",
        "4) de transformatie — bouwt een nieuwe lijst op"
      ],
      ok: "Juist — dit is de zoeklus.",
      fout: "Nog niet. Kijk wat de lus doet zodra ze een treffer heeft."
    },

    parsons: {
      vraag: [
        "Zet de stroken in de juiste volgorde zodat verdubbel(...) klopt.",
        "Typ de nummers in volgorde, bv. '3 1 4 2'. Let op: één strook hoort " +
        "er NIET bij."
      ],
      ok: "Juist geordend. De methode klopt.",
      fout: function (pos) {
        return "Nog niet. De eerste strook die niet klopt, staat op positie " +
          pos + " van jouw volgorde.";
      },
      foutAantal: "Je gaf niet het juiste aantal stroken op. Eén strook is een " +
        "afleider en hoort er niet bij."
    }
  },

  // Level 1 — De blauwdruk en de doos (scharnier 1: klasse/instantie, velden,
  // constructor, this). De Java-fragmenten leven in js/levels/level1.js.
  l1: {
    naam: "Level 1 — De blauwdruk en de doos",
    repairTitel: "Voorwerp.java — herstel de constructor",
    writeTitel: "Geitje.java — schrijf de klasse",

    verklaar: {
      vraag: [
        "Leg in één zin uit: wat is het verschil tussen een klasse en een " +
        "instantie?",
        "",
        "Typ je zin en druk Enter (dit beoordeel je daarna zelf)."
      ],
      toon: "Alberta had het zo genoteerd:",
      model: "Een klasse is de blauwdruk — het plan dat je één keer tekent; een " +
        "instantie is één doos die je naar dat plan bouwt, met eigen waarden in " +
        "de velden.",
      bevestig: "Komt jouw uitleg in de kern overeen? Typ 'juist' of 'anders'.",
      juist: "Mooi. Blauwdruk en doos — je hebt het vast.",
      anders: "Geen probleem — nu je het model gezien hebt, klopt het beeld: het " +
        "plan tegenover het ding dat je ermee maakt."
    }
  },

  // Level 2 — Trechters erin, goot eruit (scharnier 2: signaturen, attribuut /
  // parameter / lokaal). De Java-fragmenten leven in js/levels/level2.js.
  l2: {
    naam: "Level 2 — Trechters erin, goot eruit",
    repairTitel: "Speler.java — herstel de signaturen",

    parsons: {
      vraag: [
        "Zet de stroken in de juiste volgorde zodat zoek(...) klopt.",
        "Typ de nummers in volgorde, bv. '3 1 4 2'. Let op: één strook hoort " +
        "er NIET bij."
      ],
      ok: "Juist geordend. De zoekmethode klopt.",
      fout: function (pos) {
        return "Nog niet. De eerste strook die niet klopt, staat op positie " +
          pos + " van jouw volgorde.";
      },
      foutAantal: "Je gaf niet het juiste aantal stroken op. Eén strook geeft de " +
        "verkeerde doos terug en hoort er niet bij."
    },

    trace: {
      vraag: function (n) {
        return [
          "Voorspel de uitvoer. In Speler staat een attribuut:",
          "",
          "    private int levenspunten = 20;",
          "",
          "En deze methode:",
          "",
          "    void toon(int levenspunten) {",
          "        System.out.println(levenspunten);",
          "        System.out.println(this.levenspunten);",
          "    }",
          "",
          "Ergens roept de code toon(" + n + ") aan.",
          "Wat verschijnt er? Typ de twee getallen (bv. \"" + n + " 20\")."
        ];
      },
      ok: "Juist. De parameter schaduwt het attribuut: zonder 'this' de trechter, " +
        "met 'this' de doos van het object.",
      fout: "Nog niet. De eerste regel drukt de parameter af, de tweede " +
        "this.levenspunten (het attribuut, 20)."
    }
  },

  // Level 3 — De knikkerbaan (scharnier 3: voorwaarden, validatie, cascade,
  // && / || / !). De Java-fragmenten leven in js/levels/level3.js.
  l3: {
    naam: "Level 3 — De knikkerbaan",
    repairTitel: "Speler.java — herstel de klem",

    vindfout: {
      vraag: [
        "De poort naar het volgende hoofdstuk mag alleen open als de wolf",
        "verslagen is EN je de sleutel hebt. Toch klopt er iets niet:",
        "",
        "  1  if (wolfVerslagen || speler.heeft(\"sleutel\")) {",
        "  2      System.out.println(\"De poort knarst open.\");",
        "  3  } else {",
        "  4      System.out.println(\"De poort blijft dicht.\");",
        "  5  }",
        "",
        "Op welke regel zit de fout? Typ het regelnummer, of kort wat er mis is."
      ],
      ok: "Raak. 'Beide moeten waar zijn' vraagt && (en), niet || (of): met || " +
        "gaat de poort al open bij alleen de sleutel.",
      fout: "Nog niet daar. Kijk naar de logische operator in de conditie op " +
        "regel 1."
    },

    trace: {
      vraag: function (n) {
        return [
          "Voorspel de uitvoer van deze cascade:",
          "",
          "    int lp = " + n + ";",
          "    if (lp <= 0) {",
          "        System.out.println(\"verslagen\");",
          "    } else if (lp < 10) {",
          "        System.out.println(\"gewond\");",
          "    } else {",
          "        System.out.println(\"gezond\");",
          "    }",
          "",
          "Welk woord verschijnt? Typ het."
        ];
      },
      ok: "Juist. De eerste tak die klopt wint, en de randen tellen: <= 0 pakt 0, " +
        "en < 10 laat 10 net vallen naar 'gezond'.",
      fout: "Nog niet. Loop de takken van boven naar onder en let op de " +
        "randwaarden (0 en 10)."
    }
  },

  // Level 4 — Twee pijlen, één doos (scharnier 4: referenties, aliasing, null).
  // De Java-fragmenten leven in js/levels/level4.js.
  l4: {
    naam: "Level 4 — Twee pijlen, één doos",
    repairTitel: "Spel.java — herstel de buur-bedrading",

    trace: {
      vraag: function (naam) {
        return [
          "Voorspel de uitvoer. Twee variabelen wijzen naar dezelfde kamer:",
          "",
          "    Kamer eerste = new Kamer(\"Molen\", \"...\", \"...\");",
          "    Kamer tweede = eerste;",
          "    Kamer doel = new Kamer(\"" + naam + "\", \"...\", \"...\");",
          "    tweede.setNoord(doel);",
          "    System.out.println(eerste.getNoord().getNaam());",
          "",
          "Wat verschijnt er? Typ de naam die wordt afgedrukt."
        ];
      },
      ok: "Juist. eerste en tweede zijn twee pijlen naar één doos: zet je de buur " +
        "via de ene, dan ziet de andere het ook.",
      fout: "Nog niet. eerste en tweede wijzen naar dezelfde kamer, dus " +
        "eerste.getNoord() is precies wat je via tweede hebt gezet."
    },

    verklaar: {
      vraag: [
        "In Kamer is de noord-buur van de laatste kamer null:",
        "",
        "    private Kamer noord;   // blijft null: geen uitgang",
        "",
        "Leg in één zin uit: wat betekent 'null' hier?",
        "",
        "Typ je zin en druk Enter (dit beoordeel je daarna zelf)."
      ],
      toon: "Alberta had het zo genoteerd:",
      model: "null is een pijl die naar geen enkele doos wijst: er is in die " +
        "richting geen buurkamer, dus geen uitgang.",
      bevestig: "Komt jouw uitleg in de kern overeen? Typ 'juist' of 'anders'.",
      juist: "Mooi. Null is geen doos — gewoon een pijl die nergens heen wijst.",
      anders: "Geen probleem — nu je het model gezien hebt, klopt het beeld: null " +
        "wijst naar geen enkele doos."
    }
  },

  // Level 5 — De patroonkaart (scharnier 5: lus-romp + patroonkeuze). De Java-
  // fragmenten leven in js/levels/level5.js; de twee lus-methoden zijn echt aan
  // seven-little-goats/src/Speler.java toegevoegd (zie de Beslissing daar).
  l5: {
    naam: "Level 5 — De patroonkaart",
    writeTitel: "Speler.java — schrijf de twee lus-methoden",

    parsons: {
      vraag: [
        "Zet de stroken in de juiste volgorde zodat de kamer-regel wordt",
        "opgebouwd: 'Je kan hier meenemen: mes, koek'. Dit is de opbouw-kaart.",
        "Typ de nummers in volgorde, bv. '3 1 4 2'. Let op: één strook hoort",
        "er NIET bij."
      ],
      ok: "Juist geordend. De regel bouwt zich stuk voor stuk op.",
      fout: function (pos) {
        return "Nog niet. De eerste strook die niet klopt, staat op positie " +
          pos + " van jouw volgorde.";
      },
      foutAantal: "Je gaf niet het juiste aantal stroken op. Eén strook " +
        "overschrijft de regel in plaats van eraan toe te voegen — die hoort er " +
        "niet bij."
    },

    patroonkaart: {
      vraag: [
        "Welke patroonkaart hoort bij deze lus (uit het schade-overzicht)?",
        "",
        "    int som = 0;",
        "    for (int i = 0; i < aantalRondes; i++) {",
        "        som = som + schadelog[i];",
        "    }",
        "",
        "Typ 1, 2, 3 of 4:"
      ],
      opties: [
        "1) tellen — hoeveel elementen aan een voorwaarde voldoen",
        "2) totaliseren — de som van een waarde over alle elementen",
        "3) opbouwen — een nieuwe string of lijst samenstellen",
        "4) uiterste — het grootste of kleinste element zoeken"
      ],
      ok: "Juist — dit is de totaliseer-kaart: je telt de waarden zelf op, niet " +
        "het aantal.",
      fout: "Nog niet. Kijk wat er bij 'som' wordt opgeteld: de waarde zelf, niet " +
        "één per element."
    }
  },

  // Level 6 — De plankenbrug boven het ravijn (scharnier 6: index, off-by-one,
  // welke lus). De Java-fragmenten leven in js/levels/level6.js.
  l6: {
    naam: "Level 6 — De plankenbrug boven het ravijn",
    repairTitel: "Kamer.java — herstel de off-by-one",

    trace: {
      vraag: function (n) {
        return [
          "Voorspel de uitvoer. Deze lus drukt de indexen af van een lijst met " +
            n + " voorwerpen:",
          "",
          "    for (int i = 0; i < voorwerpen.size(); i++) {",
          "        System.out.println(i);",
          "    }",
          "",
          "Welk getal wordt als LAATSTE afgedrukt? Typ dat getal."
        ];
      },
      ok: "Juist. De eerste plank is 0, de laatste is size() min één: het einde " +
        "van de plankenbrug.",
      fout: "Nog niet. Tel vanaf 0: de laatste index is er één minder dan het " +
        "aantal voorwerpen."
    },

    vindfout: {
      vraag: [
        "Deze gevechtslus hoort precies vijf rondes te spelen (0 tot en met 4):",
        "",
        "  1  for (int ronde = 0; ronde <= 5; ronde++) {",
        "  2      speelRonde(ronde);",
        "  3  }",
        "",
        "Op welke regel zit de fout? Typ het regelnummer, of kort wat er mis is."
      ],
      ok: "Raak. Eén plank te ver: '<= 5' speelt zes rondes (0 t/m 5). Met '< 5' " +
        "blijf je netjes bij vijf.",
      fout: "Nog niet daar. Kijk naar de lusgrens op regel 1: hoeveel rondes " +
        "speelt ze echt?"
    }
  },

  // Level 7 — De speurtocht en de dubbele pijl (scharnier 7: zoeken + de dubbele
  // pijl). De Java-fragmenten leven in js/levels/level7.js.
  l7: {
    naam: "Level 7 — De speurtocht en de dubbele pijl",
    writeTitel: "Spel.java — schrijf de zoeklus",
    repairTitel: "Spel.java — herstel de null-veilige keten",

    trace: {
      vraag: function (wie) {
        return [
          "Voorspel de uitvoer. Twee geitjes:",
          "",
          "    Geitje jongste = new Geitje(\"jongste\", klokkast);  " +
            "// klokkast -> Geitenhuisje",
          "    Geitje broer   = new Geitje(\"broer\", null);        " +
            "// nog opgeslokt",
          "",
          "En deze null-veilige keten, aangeroepen op " + wie + ":",
          "",
          "    Schuilplaats s = " + wie + ".getSchuilplaats();",
          "    if (s == null) {",
          "        System.out.println(\"nog niet gevonden\");",
          "    } else {",
          "        System.out.println(s.getKamer().getNaam());",
          "    }",
          "",
          "Wat verschijnt er? Typ de tekst die wordt afgedrukt."
        ];
      },
      ok: "Juist. Bij een schuilplaats volg je de twee pijlen naar de kamernaam; " +
        "bij null stopt de keten netjes op 'nog niet gevonden'.",
      fout: "Nog niet. Kijk eerst of s null is: is ze null, dan 'nog niet " +
        "gevonden'; anders volg je s.getKamer().getNaam()."
    }
  },

  // Vierde hint: geen nieuwe hint, wel een zachte aanmoediging in Alberta's stem.
  hintGeenMeer: "Meer hints heb ik niet voor je. Lees nog eens rustig wat er " +
    "staat — je bent dichterbij dan je denkt. (De volledige walkthrough ligt " +
    "in walkthrough/deel1-hints.md, als het echt moet.)",
  // Hint in de zolder als er geen plaats-hint is (alles is gevonden).
  geenPlaatsHint: "Je hebt hier alles gevonden wat je nodig hebt. Ga aan de " +
    "pc werken.",

  // Alberta's oordeel — de vier verdict-tiers (save-en-hints.md, §"Alberta's
  // oordeel"). Allemaal positief; het verschil is de knipoog. De drempels
  // leven in levels.js; deze teksten zijn de dragers.
  oordeel: {
    meesterhand: {
      titel: "Alberta's oordeel: de meesterhand",
      tekst: "Je hebt mijn spel afgemaakt met bijna geen spieken. Ik had het " +
        "niet beter gekund, en dat zeg ik niet snel.",
    },
    vakvrouw: {
      titel: "Alberta's oordeel: de vakvrouw",
      tekst: "Nu en dan een blik in de kantlijn, en dan weer door. Zo werk ik " +
        "ook."
    },
    doorzetter: {
      titel: "Alberta's oordeel: de doorzetter",
      tekst: "Je hebt vaak om hulp gevraagd en telkens opnieuw doorgezet. Dat " +
        "is geen zwakte. Zo leer je het."
    },
    "samen-geraakt": {
      titel: "Alberta's oordeel: samen geraakt",
      tekst: "We hebben dit samen gedaan, jij en ik en een hoop hints. Het " +
        "spel draait. Dat is wat telt."
    }
  },

  // De endgame (spelontwerp-legacy.md, §"Endgame"). Level 7 af "voltooit"
  // Alberta's spel; de pc boot Seven Little Goats als speelbare simulatie.
  // Deze teksten dragen de aankondiging en de overgang.
  endgame: {
    compleet: "Het laatste hoofdstuk is hersteld. Op de monitor verschijnt, " +
      "regel na regel, wat je al die tijd aan het herstellen was: Alberta's " +
      "spel, compleet. Het compileert. Het draait.",
    // De zin die de speler klaarzet voor wat er komt: het is geen vriendelijk
    // verhaal, en dat hoort hij te weten voor hij het uitspeelt.
    bootSim: "SEVEN LITTLE GOATS — de tekstversie boot in de terminal. Speel " +
      "het spel dat je grootmoeder niet heeft afgemaakt. Het loopt niet voor " +
      "iedereen goed af; dat hangt van jou af."
  },

  // De epiloog (spelontwerp-legacy.md, §"Endgame", stap 5; achtergrond.md,
  // §"Het einde geeft de prijs"). Wijst naar de echte Java-broncode in
  // seven-little-goats/ en draagt de eenmalige opdracht aan Roberta Williams
  // (roberta-williams.md, §Beslissing) — verbatim.
  epiloog: {
    titel: "Epiloog",
    alineas: [
      "Je hebt het afgemaakt. Zeven hoofdstukken, stuk voor stuk hersteld, tot " +
        "Alberta's spel weer draaide. Zij kreeg het niet af. Jij wel.",
      "Boven blijft de zolder staan zoals hij stond: de dozen, het stof, de " +
        "mok naast het toetsenbord. Alleen het scherm is nu uit.",
      "De broncode ligt op zolder — neem ze mee. Ze staat in " +
        "seven-little-goats/. Open ze in IntelliJ, lees ze, draai ze zelf. " +
        "Wat je in de terminal herstelde, is nu gewoon Java in jouw handen.",
      "Het is ook precies het soort spel dat je zelf leert schrijven. " +
        "Toeval is dat niet.",
      "Voor Roberta Williams, en voor iedereen die de spellen maakte waar dit " +
        "vak vandaan komt."
    ]
  },

  // De notitieboek-spreads (spelontwerp-legacy.md, §"De zolder-hub"; art-
  // stijlgids.md, §"Het notitieboek-spread"). Eén spread per level plus een
  // intro-spread. De inhoud is data (de spread-template-renderer leest ze uit;
  // hij is niet per level hardgecodeerd). De weekregel gebruikt de kolom
  // "Na cursusweek" uit levels-en-scharnieren.md: 1, 2, 2, 3, 4, 5, 6.
  spreads: (function () {
    // Bouw één spread-teaser als een generiek pagina-object dat de renderer
    // dom kan aflopen: elke pagina heeft een kop (inkt-titel), regels
    // (handschrift) en optioneel een voet (de weekregel, rechtsonder).
    function maakSpread(nr, scharnier, titel, week, briefA, briefB) {
      return {
        nr: nr,
        scharnier: scharnier,
        titel: titel,
        week: week,
        paginas: [
          {
            kop: "Hoofdstuk " + nr + " — " + scharnier,
            regels: ["Voor jou die dit later leest:", ""].concat(briefA)
          },
          {
            kop: titel,
            regels: briefB,
            voet: "Dit zou je moeten kunnen na week " + week + " van de cursus."
          }
        ]
      };
    }

    // Er staat hier bewust géén intro-spread meer. De achtergrond werd vroeger
    // op een bladzijde van het notitieboek gezet, en dat klopte op drie
    // manieren niet: je las wat er in het boek stond voor je het boek had, de
    // verteller sprak jou aan op papier dat Alberta's handschrift draagt, en de
    // voet vroeg om het notitieboek te openen dat je aan het lezen was. De
    // openingstekst staat nu in AL.strings.intro, in de stem van de verteller,
    // vóór de zolder. Zie workflow/15-opwaardering-kickoff.md.
    return {
      l1: maakSpread(1, "De blauwdruk en de doos",
        "Klasse, instantie, velden, constructor, this",
        1,
        ["Een klasse is een blauwdruk; een object is de doos die je",
          "ernaar bouwt. De constructor vult de velden van zo'n verse doos.",
          "'this' is gewoon: déze doos."],
        ["Ik heb hier Voorwerp en Geitje geschetst, maar de constructor",
          "is nog maar half ingevuld. Herstel wat de doos hoort te krijgen,",
          "en schrijf Geitje helemaal uit volgens de schets hieronder."]),

      l2: maakSpread(2, "Trechters erin, goot eruit",
        "Signaturen: return vs. void, attribuut / parameter / lokaal",
        2,
        ["Een methode is een machine: trechters erin (de parameters),",
          "een goot eruit (return), of niets eruit (void). En drie soorten",
          "dozen om in te bewaren: attribuut, parameter, lokale variabele."],
        ["De signaturen van Speler kloppen nog niet — ik heb zelf de koppen",
          "door elkaar gehaald. Zet ze recht: wat gaat erin, wat komt eruit?",
          "En let op welke doos je gebruikt — een lokale schaduwt zo een",
          "attribuut."]),

      l3: maakSpread(3, "De knikkerbaan",
        "Voorwaarden: validatie ×3, cascade, && / || / !",
        2,
        ["Denk aan een knikkerbaan. De validatie klemt de knikker tussen",
          "twee randen; de cascade splitst de baan; && / || / ! sturen",
          "welke kant hij op rolt."],
        ["Bij setLevenspunten liep de klem mis en in Gevecht stond een",
          "&& waar een || hoort. Klem de waarde netjes tussen onder- en",
          "bovengrens, en kies de juiste operator."]),

      l4: maakSpread(4, "Twee pijlen, één doos",
        "Referenties: twee pijlen, één doos; null",
        3,
        ["Twee variabelen kunnen naar dezelfde doos wijzen: twee pijlen,",
          "één doos. Verander je de doos via de ene pijl, dan ziet de andere",
          "het ook. En 'null' is een pijl die naar geen enkele doos wijst."],
        ["De bedrading tussen de kamers is losgeraakt. Verbind de buren weer",
          "zodat de pijlen kloppen, en let op waar een kamer nog naar null",
          "wijst voor je erdoorheen loopt."]),

      l5: maakSpread(5, "De patroonkaart",
        "De lus-romp + patroonkeuze (tellen, opbouwen, filteren, uiterste)",
        4,
        ["Elke lus volgt een patroonkaart: tellen, totaliseren, opbouwen,",
          "filteren, of het uiterste zoeken. Kies eerst de kaart, dan schrijf",
          "je de romp bijna vanzelf."],
        ["Twee lus-methoden ontbreken. Ik heb de kaarten in de kantlijn",
          "getekend — schrijf de rompen eronder, en zet de string-builder",
          "in de juiste volgorde."]),

      l6: maakSpread(6, "De plankenbrug boven het ravijn",
        "Index en off-by-one; welke lus kies ik",
        5,
        ["Een lijst is een plankenbrug boven een ravijn. De eerste plank is",
          "nummer 0; de laatste is size() min één. Eén plank te ver en je",
          "ligt in het water."],
        ["In verwijderVoorwerp en de gevechtsrondes loopt een lus één plank",
          "te ver. Zoek de off-by-one en kies de lus die bij de klus past."]),

      // De kop van dit spread droeg de volledige keten mee —
      // "(getCategorie().getNaam())" — en dat is één woord van zesentwintig
      // tekens. Een kolom van 136 px kan dat niet breken, dus liep het over de
      // bladrand. De keten staat in de brief hieronder toch al voluit.
      l7: maakSpread(7, "De speurtocht en de dubbele pijl",
        "Zoeken, en dan de dubbele pijl",
        6,
        ["Een zoeklus is een speurtocht: hij geeft het gevonden object terug,",
          "of null als er niets is. En soms volg je twee pijlen na elkaar:",
          "artikel.getCategorie().getNaam() — een ketting van getters."],
        ["zoekGeitje en de endgame-keten zijn het laatste stuk. Schrijf de",
          "zoeklus die een Geitje of null teruggeeft, en maak de getter-",
          "keten null-veilig voor je de tweede pijl volgt."])
    };
  })(),

  // Het aanraakscherm-D-pad en de mobiele commandobalk (touch.js): op een
  // toestel zonder fysiek toetsenbord verschijnt geen toetsenbord vanzelf
  // boven het canvas, dus krijgt de zolder een eigen, echte invoerbalk.
  touch: {
    plaatshouder: "typ hier je commando…",
    verstuur: "ga",
    pijlNoord: "noord",
    pijlOost: "oost",
    pijlZuid: "zuid",
    pijlWest: "west"
  },

  // Sjabloonhelpers.
  fragmentGevonden: function (levelId) {
    return "Fragment " + levelId + " ontgrendeld. Een hoofdstuk van Alberta's " +
      "spel is leesbaar geworden.";
  }
};

// Node-export voor de headless tests.
if (typeof module !== "undefined") {
  module.exports = AL.strings;
}
