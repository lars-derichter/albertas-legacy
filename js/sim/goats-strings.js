// goats-strings.js — AL.sim.strings: ALLE speler-zichtbare tekst van de
// Seven Little Goats-simulatie. De verwoording spiegelt de System.out.println-
// regels van de Java-broncode (seven-little-goats/src/*.java) woordelijk, zodat
// de transcript-cross-check van WP 9 slaagt (spelontwerp-seven-little-goats.md:
// "moeten woordelijk overeenkomen"). Geen prose staat hardgecodeerd in
// goats-world.js of goats-combat.js; alles komt hiervandaan.
//
// De meerregelige beschrijvingen staan als arrays van regels, exact zoals de
// Java ze via één println met \n of via losse println's afdrukt. De regels met
// getallen (schade, levenspunten) zijn sjabloonfuncties.
//
// Draait in de browser (AL.sim.strings) én in Node (module.exports).

globalThis.AL = globalThis.AL || {};
globalThis.AL.sim = globalThis.AL.sim || {};

(function () {

  var strings = {

    // De prompt die de terminal toont (Java: System.out.print("> ")).
    prompt: "> ",
    terminalTitel: "SEVEN LITTLE GOATS",

    // De titelbanner (Main.java, 80's-stijl).
    banner: [
      "========================================",
      "        SEVEN LITTLE GOATS",
      "========================================"
    ],

    // De backstory, integraal getoond voor het spel begint (Main.java). Blanks
    // ("") reproduceren de lege println's tussen de alinea's.
    backstory: [
      "Je kent het vorige verhaal. Een rode mantel, een wolf,",
      "grootmoeders huisje. Hoe het afliep? Daar zijn de",
      "verhalen het niet over eens: de een zweert bij de schaar",
      "en de stenen, de ander bij een kille afrekening, een",
      "derde bij genade. Laat het in het midden. De wolf van",
      "toen is weg; dat volstaat.",
      "",
      "Maar die wolf had een neef. Een jonge wolf, de honger",
      "geërfd, de wijsheid niet. Hij las het oude verhaal als",
      "een handleiding.",
      "",
      "Gisteren wreef hij zijn poot wit met bloem uit de molen",
      "en at krijt bij de kruidenier, tot zijn stem zo zacht",
      "klonk als die van een moeder. De zeven geitjes deden",
      "open. Zes gingen naar binnen — in de wolf.",
      "",
      "Het jongste kroop in de klokkast en overleefde. Het ging",
      "niet naar de dorpelingen (die vonden alles \"te",
      "gevaarlijk\", zoals altijd), maar naar de enige met",
      "verstand van wolven: naar jou.",
      "",
      "Je bent Roodkapje, intussen de dorpsexpert die je nooit",
      "wilde zijn. Je volgt het spoor van het geitenhuisje tot",
      "aan de rivier. Wat je daar met de wolf doet, bepaal jij."
    ],

    startHint: "Typ 'kijk' om rond te kijken, '?' voor een hint, " +
      "'help' voor de commando's.",

    // ---- Kamers (naam, beschrijving als regels, hint) -----------------------
    kamers: {
      geitenhuisje: {
        naam: "Geitenhuisje",
        beschrijving: [
          "Het huisje van de zeven geitjes. Stoelen omver, een omgestoten",
          "kruk, deuren wagenwijd. In de hoek tikt de oude staande klok.",
          "Op een haak hangt een rode mantel; op tafel liggen een",
          "keukenmes en een mandje."
        ],
        hint: "Kijk in de klokkast (praat) en neem iets scherps en iets warms mee."
      },
      dorpsplein: {
        naam: "Dorpsplein",
        beschrijving: [
          "Het plein is de spil van het dorp. Naar het oosten de molen,",
          "naar het westen de kruidenier, naar het zuiden het bospad.",
          "Op een marktkraam koelen twee koeken af."
        ],
        hint: "Neem iets mee om te ruilen. En neem iets om ze in te dragen."
      },
      molen: {
        naam: "Molen",
        beschrijving: [
          "Meelstof hangt in het licht. Tegen de zakken ligt bloem gemorst.",
          "Achteraan, bij een kruik melk, gromt een magere jachthond —",
          "de weggelopen hond van de verdwenen jager."
        ],
        hint: "De hond bewaakt de melk. Vechten hoeft niet; het is een omweg."
      },
      kruidenier: {
        naam: "Kruidenier",
        beschrijving: [
          "Een kleine winkel met lege rekken. Op de toonbank ligt een stuk",
          "krijt, waarvan een hoek is afgebeten."
        ],
        hint: "Het krijt vertelt hoe de stem zo zacht werd."
      },
      bospad: {
        naam: "Bospad",
        beschrijving: [
          "Hoge bomen, weinig licht. Het pad loopt recht naar het zuiden,",
          "dieper het bos in."
        ],
        hint: "Volg het spoor naar het zuiden."
      },
      oudeEik: {
        naam: "Oude eik",
        beschrijving: [
          "Een knoestige oude eik. Op een lage tak zit een raaf je aan te",
          "kijken alsof hij iets weet. (Hij weet iets.)"
        ],
        hint: "Wie iets lekkers geeft, krijgt soms iets blinkends terug."
      },
      grootmoederHuisje: {
        naam: "Grootmoeders huisje",
        beschrijving: [
          "Grootmoeders huisje, stil en opgeruimd. In het naaimandje op de",
          "vensterbank ligt een zilveren schaar, nog vlijmscherp."
        ],
        hint: "Neem de schaar mee. Ze opent later meer dan stof."
      },
      wolvenspoor: {
        naam: "Wolvenspoor",
        beschrijving: [
          "Witte pootafdrukken, één voor één, het pad af. Bloem en krijtstof.",
          "Ergens vooruit klinkt water. De spanning stijgt."
        ],
        hint: "Bijna. Ga zuid naar de rivier."
      },
      rivieroever: {
        naam: "Rivieroever",
        beschrijving: [
          "De oever van de rivier. Daar staat hij: de jonge wolf, groot en",
          "grijs en dik van de maaltijd. Aan je voeten liggen losse stenen.",
          "\"Nog een die het verhaal gelezen heeft,\" grijnst hij."
        ],
        hint: "Raap de stenen op voor je vecht. Typ vecht als je klaar bent."
      }
    },

    // ---- Voorwerpen (beschrijving; kracht staat in goats-world.js) ----------
    voorwerpen: {
      "rode mantel": "een warme rode mantel; vangt in een gevecht 1 schade op",
      "keukenmes": "vlijmscherp; telt mee bij elke aanval",
      "mandje": "een rieten mandje om iets in te dragen",
      "koek": "versgebakken",
      "bloem": "meel van de molen; hiermee wreef de wolf zijn poot wit",
      "kruik melk": "geitenmelk; eenmalig +6 levenspunten",
      "krijt": "een stuk krijt; hiervan at de wolf voor een zachte stem",
      "zilveren schaar":
        "grootmoeders schaar, nog vlijmscherp; ontgrendelt het beste einde",
      "stenen": "losse, zware stenen van de oever; voor de buik van de wolf",
      "gladde kiezels":
        "een handvol gladde kiezels; even goed als de stenen aan de oever"
    },

    // ---- Tegenstanders (naam, beschrijving, hint) ---------------------------
    tegenstanders: {
      "jachthond": {
        naam: "jachthond",
        beschrijving: "Mager, kwaad en uitgehongerd. Hij bewaakt de kruik melk.",
        hint: "Twee, drie flinke halen volstaan."
      },
      "jonge wolf": {
        naam: "jonge wolf",
        beschrijving: "Groot, grijs, en dit keer geen vermomming meer.",
        hint: "Vijf rondes. Wie rekent, wint."
      }
    },

    // ---- Commando-antwoorden (Spel.java) ------------------------------------
    voorwerpenInKamerVoorvoegsel: "Je kan hier meenemen: ",
    dieKantKanJeNietOp: "Die kant kan je niet op.",
    niemandOmTegenTeVechten: "Er is hier niemand om tegen te vechten.",
    datLigtHierNiet: "Dat ligt hier niet.",
    nietsOmInTeDragen: "Je hebt niets om ze in te dragen.",
    neemtMee: function (naam) { return "Je neemt " + naam + " mee."; },
    draagtNiets: "Je draagt niets bij je.",
    draagtBijJe: "Je draagt bij je:",
    inventarisRegel: function (naam, beschrijving) {
      return "- " + naam + " (" + beschrijving + ")";
    },

    // stats (Spel.toonStats)
    statsLevenspunten: function (lp, max) {
      return "Levenspunten: " + lp + "/" + max;
    },
    statsAanvalskracht: function (a) { return "Aanvalskracht: " + a; },
    statsMes: function (totaal) {
      return "Met het keukenmes deel je " + totaal + " schade uit per aanval.";
    },
    statsWapens: function (n) { return "Wapens op zak: " + n; },
    statsSterkste: function (naam, kracht) {
      return "Je sterkste voorwerp: " + naam + " (kracht " + kracht + ").";
    },

    geenKoek: "Je hebt geen koek.",
    eetKoek: function (lp) { return "Je eet een koek. +4 LP (nu " + lp + ")."; },
    geenMelk: "Je hebt geen kruik melk.",
    eetMelk: function (lp) {
      return "Je drinkt van de kruik melk. +6 LP (nu " + lp + ").";
    },

    // praat (Spel.praat)
    raafAlGeruild: "\"We hebben al zaken gedaan,\" krast de raaf.",
    raafAanbod: [
      "De raaf tikt met zijn snavel. \"Een koek. Geef mij een koek",
      "en ik geef jou iets gladds voor de buik van een wolf.",
      "Zeg maar: geef koek.\""
    ],
    jongsteGeitje: function (schuilplaatsNaam) {
      return [
        "Uit " + schuilplaatsNaam + " klinkt een dun stemmetje. \"Hij wreef zijn poot",
        "wit met bloem en at krijt voor een zachte stem. Mijn",
        "zes broertjes zitten in zijn buik. Volg het spoor naar",
        "het zuiden, tot aan de rivier.\""
      ];
    },
    niemandOmMeeTePraten: "Er is hier niemand om mee te praten.",

    // geef koek (Spel.geefKoek)
    niemandDieDaaropWacht: "Er is hier niemand die daarop wacht.",
    raafEenVolstaat: "\"Eén volstaat. Ik let op mijn lijn.\"",
    geenKoekOmTeGeven: "Je hebt geen koek om te geven.",
    raafGeeftKiezels: [
      "\"Gevonden bij de beek. Lang verhaal.\" De raaf laat",
      "een handvol gladde kiezels in je hand vallen."
    ],

    hintVoorvoegsel: function (hint) { return "Hint: " + hint; },
    stop: "Je legt het mes neer. Tot de volgende keer.",
    datBegrijpJeNiet: "Dat begrijp je niet.",

    // help (Spel.toonHelp)
    help: [
      "Commando's:",
      "  kijk            bekijk de kamer opnieuw",
      "  ga <richting>   ga noord / oost / zuid / west",
      "  pak <naam>      neem een voorwerp mee",
      "  inventaris      toon wat je bij je hebt",
      "  stats           toon je levenspunten en aanvalskracht",
      "  eet koek        eet een koek (+4 LP)",
      "  eet melk        drink van de kruik melk (+6 LP)",
      "  praat           praat met wie hier is",
      "  geef koek       geef een koek weg",
      "  vecht           val de tegenstander hier aan",
      "  ?               een hint voor deze plek",
      "  help            deze lijst",
      "  stop            stop het spel",
      "  opties          toon alles wat hier kan (cheatcode)"
    ],

    // opties (Spel.toonOpties) — dynamisch opgebouwd; hier de vaste stukken.
    optiesKop: "Je kan hier:",
    optiesGa: function (richting, kamerNaam) {
      return "- ga " + richting + " (" + kamerNaam + ")";
    },
    optiesPak: function (naam) { return "- pak " + naam; },
    optiesPraat: "- praat",
    optiesGeefKoek: "- geef koek",
    optiesVecht: "- vecht",
    optiesEetKoek: "- eet koek",
    optiesEetMelk: "- eet melk",
    optiesAltijd: "Altijd: kijk, inventaris, stats, ?, help, stop.",
    optiesCheat: "(opties is een cheatcode — je gebruikt hem nu.)",

    // ---- Gevecht (Gevecht.java) ---------------------------------------------
    gevechtKop: function (naam) { return "== Gevecht: " + naam + " =="; },
    smeek: function (naam) {
      return [
        "De " + naam + " heft zijn poten op. \"Wacht! Genade... we",
        "kunnen hier toch over praten?\" Zijn stem klinkt",
        "nog vaag naar bloem en krijt.",
        "Kies: spaar / maak af"
      ];
    },
    rondeKop: function (nr) { return "-- Ronde " + nr + " --"; },
    lpRegel: function (spelerLp, naam, tegenLp) {
      return "Jij: " + spelerLp + " LP     " + naam + ": " + tegenLp + " LP";
    },
    kiesActie: "Kies: val aan / verdedig / eet koek / eet melk",
    valAan: function (schade) { return "Je haalt uit voor " + schade + " schade."; },
    verdedig: "Je gaat in verdediging.",
    tegenstanderVerslagen: function (naam) {
      return "De " + naam + " is verslagen.";
    },
    tegenstanderSlaat: function (naam, schade, spelerLp) {
      return "De " + naam + " haalt uit voor " + schade + " schade (jij nu " +
        spelerLp + " LP).";
    },

    // schade-overzicht (Gevecht.toonSchadelog) — let op de vaste kolomspaties.
    schadeKop: "-- Schade-overzicht --",
    geenKlap: "Je hebt geen enkele klap uitgedeeld.",
    schadeRondes: function (n) { return "Rondes gevochten: " + n; },
    schadeTotaal: function (som) { return "Totale schade:    " + som; },
    schadeGemiddeld: function (gem) { return "Gemiddeld:        " + gem; },
    schadeMax: function (max) { return "Grootste klap:    " + max; },

    // gevecht-opties (cheatcode)
    gevechtOptiesKop: "Je kan hier: val aan, verdedig",
    gevechtOptiesKoek: "             eet koek",
    gevechtOptiesMelk: "             eet melk",
    gevechtOptiesHint: "             ? (hint)",
    gevechtOptiesCheat: "             opties (cheatcode)",
    smeekOptiesKop: "Je kan hier: spaar, maak af",

    // ---- Na het gevecht (Spel.startGevecht) ---------------------------------
    jachthondVerslagen: [
      "De jachthond zakt in elkaar en sleept zich weg.",
      "De kruik melk staat nu vrij."
    ],
    jachthondDuwtTerug: [
      "De jachthond heeft betere dingen te doen. Hij",
      "duwt je terug naar het dorpsplein."
    ],

    // ---- De vier eindes (Spel.java) -----------------------------------------
    eindeSchaarEnStenen: [
      "Je zet grootmoeders zilveren schaar in de naad van de",
      "buik en knipt de wolf open, netjes en snel. Eén voor één",
      "klimmen de zes geitjes eruit, verkreukeld maar heel.",
      "Samen vullen jullie de buik met stenen en naaien hem",
      "dicht. Log en zwaar zakt de wolf in de rivier.",
      "Uit de klokkast komt het jongste geitje. De familie is",
      "weer heel."
    ],
    eindeSchaarEnStenenSlot: "Einde: de schaar en de stenen.",
    schuilplaatsenKop: "Het jongste geitje vertelt waar elk voortaan schuilt:",
    schuilplaatsRegel: function (geitjeNaam, schuilplaatsNaam, kamerNaam) {
      return "- " + geitjeNaam + ": " + schuilplaatsNaam + " (" + kamerNaam + ")";
    },
    schuilplaatsNietGevonden: function (geitjeNaam) {
      return "- " + geitjeNaam + ": nog niet gevonden";
    },

    eindeAfrekening: [
      "Je maakt de wolf af. Grondig. Maar zonder iets scherps",
      "genoeg om hem netjes open te leggen, blijven de zes",
      "geitjes waar ze zijn — vanbinnen, in het donker. Iemand",
      "zal ze er later uit moeten halen. Koud en onaf."
    ],
    eindeAfrekeningSlot: "Einde: de afrekening.",

    eindeLes: [
      "Je laat je mes zakken. De wolf hoest, kokhalst, en spuwt",
      "de zes geitjes in één keer weer uit op de oever. Zonder",
      "één woord glipt hij het bos in, en deze keer voorgoed.",
      "Genade, en misschien wel de enige les die aankomt."
    ],
    eindeLesSlot: "Einde: de les.",

    gameOver: [
      "De wolf grijnst. Alwéér iemand die dacht dat het verhaal",
      "een handleiding was."
    ],
    gameOverSlot: "Game over."
  };

  AL.sim.strings = strings;

  if (typeof module !== "undefined") { module.exports = strings; }

})();
