// strings.js — alle speler-gerichte tekst van de zolder-adventure op één plek.
// De logica verwijst naar sleutels, nooit naar letterlijke strings (harde
// projectregel). De renderer doet zelf de word-wrap: teksten staan hier zonder
// handmatige regelafbrekingen, behalve waar een witregel of "\n" betekenis
// heeft.
//
// Toon en register volgen docs/achtergrond.md, §"Toon en register": Vlaams
// Nederlands zonder hollandismen, Alberta's stem droog en warm, de verteller
// rustig en King's-Quest-zuinig. De volledige level-prose komt in WP 6; dit is
// het skelet met echte (geen lorem) tekst voor wat nu bestaat: de titel, de
// intro, zolder-west, de placeholder-hints en de systeemmeldingen.
//
// Aangepast uit remake-90s (js/logic/strings.js): dezelfde vorm (data +
// kleine sjabloonfuncties, Node-export), nieuwe inhoud.
//
// Draait zowel in de browser (AL.strings) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

AL.strings = {

  titel: "THE LEGACY OF ALBERTA",
  ondertitel: "de zolder van grootmoeder",
  drukEnter: "Druk op Enter",

  // De intro: een korte reeks berichtvensters die de kernfictie zet. De laatste
  // alinea bevat de cruciale zin uit achtergrond.md (de prototype-fase).
  intro: [
    "Je grootmoeder Alberta was game-ontwerpster, lang geleden, toen een " +
    "spel nog op één zolder werd gemaakt. Ze verdween. Wat ze naliet, staat " +
    "hier: dozen, stof, en een pc die nog aanslaat.",

    "Tussen de dozen ligt haar notitieboek. Beschadigd, bladen los, vlekken " +
    "waar de inkt is doorgelopen. Het is de aanzet tot het spel dat ze nooit " +
    "afmaakte: Seven Little Goats.",

    "Alberta bouwde elk spel eerst als tekstversie in de terminal. Zo begon " +
    "ze altijd. Wat jij herstelt is dus geen tekening, maar haar code — stuk " +
    "voor stuk, tot haar spel weer draait.",

    "Typ 'kijk' om rond te kijken, 'help' voor de commando's, '?' als je " +
    "vastzit. Stap met de pijltjestoetsen."
  ],

  // De zolderscènes: naam, beschrijving (voor 'kijk' en het eerste bezoek) en
  // een plaats-hint (voor '?': waar zit het volgende fragment). De sleutels
  // zijn de scène-ids uit art-stijlgids.md.
  scenes: {
    "zolder-west": {
      naam: "Zolder — westhoek",
      beschrijving: "De westhoek van de zolder. Kartonnen dozen tot aan de " +
        "balken, een schuine streep avondlicht door het dakraam. Op een oude " +
        "kist, precies in het licht, ligt Alberta's notitieboek. Naar het " +
        "oosten loopt de zolder verder.",
      hint: "Het notitieboek ligt open in het licht. Onderzoek het, of open " +
        "het — daar begint alles."
    },
    "zolder-midden": {
      naam: "Zolder — doorgang",
      beschrijving: "Het middenstuk, waar de balken samenkomen. Het licht " +
        "trekt van west naar oost. Centraal staat een dichtgeplakte doos, " +
        "zwaarder dan de rest: 'BRONCODE', in Alberta's hand. Ze blijft nog " +
        "even dicht.",
      hint: "De broncode-doos in het midden telt pas op het einde. Ga eerst " +
        "verder waar het licht heen trekt: naar het oosten, naar de pc."
    },
    "zolder-oost": {
      naam: "Zolder — werkhoek",
      beschrijving: "Alberta's werkhoek. Een bureau, een lege stoel die net " +
        "verlaten lijkt, en de pc: een beige toren met een bolle monitor die " +
        "warm oranje nagloeit. Naast het toetsenbord staat een halfvolle " +
        "koffiemok.",
      hint: "Ga aan de pc zitten. Daar werk je aan Alberta's code — typ 'ga " +
        "zitten'."
    },
    "overloop": {
      naam: "Zolder — overloop",
      beschrijving: "De overloop, boven aan de trap. Kouder hier, en verder " +
        "van het dakraam: het licht haalt de hoeken niet meer. Tegen de wand " +
        "staan de latere dozen opgestapeld, dieper in Alberta's archief. Naar " +
        "beneden loopt de trap terug naar de doorgang.",
      hint: "De dozen hierboven dragen de latere hoofdstukken. Open er een als " +
        "je aan het volgende fragment toe bent."
    }
  },

  // De gemerkte dozen: de latere notitieboek-fragmenten (levels 2–7) zitten in
  // dozen dieper in de zolder (zolder-midden en de overloop), zodat er lichte
  // progressie is (spelontwerp-legacy.md, §"De lus per level", stap 1). De
  // broncode-doos is een aparte prop en telt pas op het einde.
  dozen: {
    onderzoek: "Kartonnen dozen, dichtgeplakt en gemerkt in Alberta's hand. In " +
      "één ervan zit het volgende blad van haar notitieboek — als je aan dat " +
      "hoofdstuk toe bent.",
    leeg: "Deze doos heb je al doorzocht. Het blad dat erin zat, ligt nu in het " +
      "notitieboek.",
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
      "een kamer, een lijstje in de kantlijn, en een halve methode waarvan " +
      "een waterstreep de helft heeft opgevreten. Onderaan, in haar hand: " +
      "'Dit zou je moeten kunnen na week 3.'",
    open: "Je slaat het notitieboek open bij de eerste bruikbare bladzijde. " +
      "Het eerste hoofdstuk van Alberta's spel ligt voor je — beschadigd, " +
      "maar leesbaar genoeg om te herstellen.",
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
    puzzelAlAf: "Deze taak staat al af. Je mag ze gerust nog eens bekijken.",
    terugNaarMenu: "— terug naar het menu —",
    typHint: "Typ '?' voor een hint, 'menu' om terug te gaan, Esc voor de zolder.",
    hintKop: "hint",
    editorGeladen: "geladen. Herstel de code en druk F9 (of 'compileer & test'). " +
      "'?' geeft een hint, Esc keert terug naar de zolder."
  },

  // Losse systeemmeldingen (verteller: rustig, zuinig).
  datBegrijpJeNiet: "Dat begrijp je niet.",
  dieKantKanJeNietOp: "Die kant kan je niet op.",
  datZieJeHierNiet: "Dat zie je hier niet.",
  nietsBijzonders: "Niets bijzonders.",
  hintPrefix: "",

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
    "help               deze lijst"
  ],

  // Herbegin (save-en-hints.md): vraagt bevestiging, want het gooit voortgang
  // weg.
  herbeginVraag: "Herbeginnen wist je voortgang — al je herstelde hoofdstukken " +
    "en concepten. Typ 'herbegin ja' om het te bevestigen.",
  herbeginKlaar: "De zolder ligt er weer bij zoals je hem vond. Alles opnieuw.",

  // Geluid.
  geluidAan: "Geluid aan.",
  geluidUit: "Geluid uit.",

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
        "niet beter gekund — en dat zeg ik niet snel."
    },
    vakvrouw: {
      titel: "Alberta's oordeel: de vakvrouw",
      tekst: "Nu en dan een blik in de kantlijn, en dan weer dóór. Zo werk ik " +
        "ook. Proficiat."
    },
    doorzetter: {
      titel: "Alberta's oordeel: de doorzetter",
      tekst: "Je hebt vaak om hulp gevraagd en telkens weer verder gewerkt. " +
        "Dat is geen zwakte — dat is hoe je het leert."
    },
    "samen-geraakt": {
      titel: "Alberta's oordeel: samen geraakt",
      tekst: "We hebben dit samen gedaan, jij en ik en een hoop hints. En weet " +
        "je? Het spel draait. Dat is wat telt."
    }
  },

  // De endgame (spelontwerp-legacy.md, §"Endgame"). Level 7 af "voltooit"
  // Alberta's spel; de pc boot Seven Little Goats als speelbare simulatie. De
  // echte sim komt in WP 9; deze teksten dragen de aankondiging en de overgang.
  endgame: {
    compleet: "Het laatste hoofdstuk is hersteld. Op de monitor verschijnt, " +
      "regel na regel, wat je al die tijd aan het herstellen was: Alberta's " +
      "spel, compleet. Het compileert. Het draait.",
    bootSim: "SEVEN LITTLE GOATS — de tekstversie boot in de terminal. Speel " +
      "eindelijk het spel dat je grootmoeder nooit afkreeg.",
    naarOordeel: "Je speelt Alberta's spel uit. De terminal wordt stil. En dan, " +
      "in de kantlijn van het laatste scherm, staat er iets in haar hand."
  },

  // De epiloog (spelontwerp-legacy.md, §"Endgame", stap 5; achtergrond.md,
  // §"Het einde geeft de prijs"). Wijst naar de echte Java-broncode in
  // seven-little-goats/ en draagt de eenmalige opdracht aan Roberta Williams
  // (roberta-williams.md, §Beslissing) — verbatim.
  epiloog: {
    titel: "Epiloog",
    alineas: [
      "Je hebt het afgemaakt. Zeven hoofdstukken, stuk voor stuk hersteld, tot " +
        "Alberta's spel weer draaide. Zij kreeg het niet af; jij wel.",
      "De broncode ligt op zolder — neem ze mee. Ze staat in " +
        "seven-little-goats/. Open ze in IntelliJ, lees ze, draai ze zelf. " +
        "Wat je in de terminal herstelde, is nu gewoon Java in jouw handen.",
      "Dit is het soort spel dat je in Programming Fundamentals zelf schrijft. " +
        "Dat is geen toeval. Dat is het punt.",
      "Voor Roberta Williams, en voor iedereen die de spellen maakte waar dit " +
        "vak vandaan komt."
    ]
  },

  // De notitieboek-spreads (spelontwerp-legacy.md, §"De zolder-hub"; art-
  // stijlgids.md, §"Het notitieboek-spread"). Eén spread per level plus een
  // intro-spread. De inhoud is data (de spread-template-renderer leest ze uit;
  // hij is niet per level hardgecodeerd). De puzzelbriefjes zijn hier nog
  // teasers op basis van de scharniertitels uit levels-en-scharnieren.md; de
  // volledige puzzelbriefjes komen in WP 7–8. De weekregel gebruikt de kolom
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

    return {
      // De intro-spread (spelontwerp-legacy.md: titel → spread:intro → zolder).
      // Draagt de kernfictie en — verplicht, verbatim — de prototype-regel uit
      // achtergrond.md, §"Prototype-fase".
      intro: {
        nr: 0,
        scharnier: "de zolder",
        titel: "Zo begon ik altijd",
        week: null,
        paginas: [
          {
            kop: "The Legacy of Alberta",
            regels: [
              "Je grootmoeder Alberta was game-ontwerpster, lang geleden,",
              "toen een spel nog op één zolder werd gemaakt. Ze verdween.",
              "Wat ze naliet staat hier: dozen, stof, en een pc die nog",
              "aanslaat. En, tussen alles, haar beschadigde notitieboek."
            ]
          },
          {
            kop: "Zo begon ik altijd",
            regels: [
              "Alberta bouwde elk spel eerst als tekstversie in de terminal.",
              "Zo begon ze altijd. Pas als het tekstspel klopte, tekende ze",
              "eroverheen. Wat jij herstelt is dus geen tekening, maar haar",
              "code — stuk voor stuk, tot Seven Little Goats weer draait."
            ],
            voet: "Sla het notitieboek open. Daar begint het."
          }
        ]
      },

      l1: maakSpread(1, "De blauwdruk en de doos",
        "Klasse, instantie, velden, constructor, this",
        1,
        ["Een klasse is een blauwdruk; een object is de doos die je",
          "ernaar bouwt. De constructor vult de velden van zo'n verse doos.",
          "'this' is gewoon: déze doos."],
        ["Ik heb hier Voorwerp en Geitje geschetst, maar de waterschade",
          "vrat de constructor half op. Herstel wat de doos hoort te vullen,",
          "en schrijf Geitje uit wat er van mijn notities rest."]),

      l2: maakSpread(2, "Trechters erin, goot eruit",
        "Signaturen: return vs. void, attribuut / parameter / lokaal",
        2,
        ["Een methode is een machine: trechters erin (de parameters),",
          "een goot eruit (return), of niets eruit (void). En drie soorten",
          "dozen om in te bewaren: attribuut, parameter, lokale variabele."],
        ["De signaturen van Speler zijn doorgelopen tot pap. Zet de koppen",
          "recht: wat gaat erin, wat komt eruit? En let op welke doos je",
          "gebruikt — een lokale schaduwt zo een attribuut."]),

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

      l7: maakSpread(7, "De speurtocht en de dubbele pijl",
        "Zoeken + de dubbele pijl (getCategorie().getNaam())",
        6,
        ["Een zoeklus is een speurtocht: hij geeft het gevonden object terug,",
          "of null als er niets is. En soms volg je twee pijlen na elkaar:",
          "artikel.getCategorie().getNaam() — een ketting van getters."],
        ["zoekGeitje en de endgame-keten zijn het laatste stuk. Schrijf de",
          "zoeklus die een Geitje of null teruggeeft, en maak de getter-",
          "keten null-veilig voor je de tweede pijl volgt."])
    };
  })(),

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
