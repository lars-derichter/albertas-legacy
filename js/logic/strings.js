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

  // De epiloog (wijst naar de echte broncode; volledige tekst in WP 6/10).
  epiloog: "De broncode ligt op zolder — neem ze mee. Ze staat in " +
    "seven-little-goats/. Open ze in IntelliJ en draai ze zelf.",

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
