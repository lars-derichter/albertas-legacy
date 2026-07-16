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
      "verder op de zolder."
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
    ]
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
