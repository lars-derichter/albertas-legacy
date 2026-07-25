// world.js — de headless wereldlogica van The Legacy of Alberta: de verse
// staat, de zolder-navigatie, de getypte zolder-commando's, en de save/load-
// laag. Alles is pure, serialiseerbare data plus functies die op een
// toestand-object werken; niets raakt de DOM, het canvas of window aan.
//
// Alle speltekst komt uit AL.strings; hier staat geen prose hardgecodeerd.
// De staat-vorm is bindend (engine-architectuur.md, §"De staat"). Handlers
// geven overal { tekst: [...], effecten: [...] } terug.
//
// Save-beslissing: de bestandskaart in engine-architectuur.md kent GEEN
// js/logic/save.js; de save-laag hoort dus in de logica die de engine aanroept.
// Daarom leven opslaan/laad/herbegin/migreer hier, DOM-vrij en Node-testbaar:
// ze krijgen een storage-achtig object (getItem/setItem/removeItem) mee, zodat
// een test een neppe storage kan injecteren en de browser localStorage geeft.
//
// Aangepast uit remake-90s (js/logic/world.js): dezelfde vorm (data + functies,
// {tekst,effecten}, Node-export). De inhoud is nieuw: zolder in plaats van bos.
//
// Draait zowel in de browser (AL.world) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  // De save-sleutel en de schemaversie (save-en-hints.md).
  var SAVE_SLEUTEL = "albertas-legacy/save";
  var VERSIE = 1;

  // De zolderkaart. Elke verbinding staat in beide richtingen, net als de
  // wereldkaart van de predecessor. De sleutels zijn de scène-ids uit
  // art-stijlgids.md.
  var KAMERS = {
    "zolder-west":   { oost: "zolder-midden" },
    "zolder-midden": { west: "zolder-west", oost: "zolder-oost", noord: "overloop" },
    "zolder-oost":   { west: "zolder-midden" },
    "overloop":      { zuid: "zolder-midden" }
  };

  // Waar het fragment van elk level ligt (spelontwerp-legacy.md, §"De lus per
  // level", stap 1: "latere fragmenten zitten verder in de zolder"). Level 1 is
  // het notitieboek in de westhoek; 2–4 zitten in dozen in de doorgang; 5–7
  // dieper in het archief, op de overloop. Zo is er lichte, ruimtelijke
  // progressie zonder harde sloten (save-en-hints.md: "zichtbaar, niet verplicht").
  var FRAGMENT_LOCATIE = {
    1: "zolder-west",
    2: "zolder-midden", 3: "zolder-midden", 4: "zolder-midden",
    5: "overloop", 6: "overloop", 7: "overloop"
  };

  // Welke woorden naar welke onderzoeks-sleutel wijzen, per scène. De tekst
  // zelf staat in AL.strings.onderzoek — hier staat alleen de koppeling, want
  // dat is taalherkenning en geen prose. Volgorde telt: de eerste treffer wint,
  // dus "broncode" staat vóór "doos" en "dakraam" vóór "raam".
  var ONDERZOEK_WOORDEN = {
    "zolder-west": [
      { sleutel: "pen", woorden: ["pen"] },
      { sleutel: "kist", woorden: ["kist", "koffer"] },
      { sleutel: "dakraam", woorden: ["dakraam", "raam", "licht", "streep",
        "zon"] },
      { sleutel: "balken", woorden: ["balk", "dak", "plafond", "haak"] },
      { sleutel: "dozen", woorden: ["doos", "dozen", "karton"] }
    ],
    "zolder-midden": [
      { sleutel: "broncode", woorden: ["broncode"] },
      { sleutel: "label", woorden: ["label", "etiket", "handschrift", "tape"] },
      { sleutel: "trap", woorden: ["trap", "treden", "opening"] },
      { sleutel: "balken", woorden: ["balk", "dak", "plafond"] }
    ],
    "zolder-oost": [
      { sleutel: "monitor", woorden: ["monitor", "scherm", "beeldbuis"] },
      { sleutel: "toetsenbord", woorden: ["toetsenbord", "toetsen", "klavier"] },
      { sleutel: "mok", woorden: ["mok", "koffie", "tas", "beker"] },
      { sleutel: "stoel", woorden: ["stoel", "zetel"] },
      { sleutel: "bureau", woorden: ["bureau", "tafel", "werkblad"] },
      { sleutel: "pc", woorden: ["pc", "computer", "toren", "kast", "machine"] }
    ],
    "overloop": [
      { sleutel: "trap", woorden: ["trap", "treden"] },
      { sleutel: "wand", woorden: ["wand", "muur", "pleister"] },
      { sleutel: "dozen", woorden: ["doos", "dozen", "karton", "stapel"] }
    ]
  };

  // Van een looprichting naar de entry aan de overkant.
  var TEGENGESTELD = {
    noord: "vanZuid", zuid: "vanNoord", oost: "vanWest", west: "vanOost"
  };

  // Genereer een seed als er geen expliciete is (save-en-hints.md: uit een
  // tijdbron, zodat een gewone speler ook een consistente wereld in zijn save
  // heeft).
  function genereerSeed() {
    var t = (typeof Date !== "undefined") ? Date.now() : 20260716;
    // Houd het een positief geheel getal binnen 32 bit.
    return (t >>> 0) || 20260716;
  }

  // Bouw de verse levels-structuur. Levels registreren hun puzzels via
  // AL.levels (dat na world.js laadt maar bij runtime-aanroep bestaat); zonder
  // levels.js valt world terug op een minimale structuur met de placeholder-
  // puzzels van level 1, zodat world standalone testbaar blijft.
  function verseLevels() {
    if (AL.levels && typeof AL.levels.verseLevels === "function") {
      return AL.levels.verseLevels();
    }
    var lv = {};
    for (var n = 1; n <= 7; n++) {
      lv[String(n)] = {
        ontgrendeld: false, spreadGelezen: false, puzzels: {}, afgerond: false
      };
    }
    lv["1"].puzzels = {
      "l1-editor": { status: "open", hints: 0, draft: "" },
      "l1-trace":  { status: "open", hints: 0 },
      "l1-verklaar": { status: "open", hints: 0 }
    };
    return lv;
  }

  var world = {

    SAVE_SLEUTEL: SAVE_SLEUTEL,
    VERSIE: VERSIE,
    KAMERS: KAMERS,
    FRAGMENT_LOCATIE: FRAGMENT_LOCATIE,
    genereerSeed: genereerSeed,
    verseLevels: verseLevels,

    // Een verse begintoestand (engine-architectuur.md, §"De staat"). Alles is
    // gewone JSON-data, zodat de engine ze kan opslaan en terugladen.
    nieuw: function (seed) {
      if (seed === undefined || seed === null || isNaN(seed)) {
        seed = genereerSeed();
      }
      return {
        versie: VERSIE,
        seed: seed | 0,
        modus: "zolder",
        sceneId: "zolder-west",
        speler: { x: 160, y: 150, richting: "zuid" },
        bezocht: { "zolder-west": true },
        levelActief: 1,
        levels: verseLevels(),
        hintsTotaal: 0,
        geluid: true,
        crt: true,
        gestopt: false,
        einde: null
      };
    },

    // --- Query-helpers ---------------------------------------------------------

    uitgangen: function (toestand) {
      var buren = KAMERS[toestand.sceneId] || {};
      return {
        noord: buren.noord || null,
        oost: buren.oost || null,
        zuid: buren.zuid || null,
        west: buren.west || null
      };
    },

    // --- Kamerbeschrijving -----------------------------------------------------

    // Geeft alleen de beschrijving terug, zonder kop. De kamernaam stond hier
    // als "== Zolder — westhoek ==" boven de tekst, en dat was twee keer fout:
    // het is opmaak in de logica-laag (die hoort DOM-vrij én presentatievrij te
    // zijn), en de statusbalk zegt precies hetzelfde al, twee regels hoger. Waar
    // een kop wél hoort, zoals in de terminal van Seven Little Goats, staat hij
    // er nog steeds — dat is een tekstspel, daar ís de tekst de presentatie.
    beschrijfScene: function (toestand) {
      var scene = AL.strings.scenes[toestand.sceneId];
      if (!scene) return [AL.strings.nietsBijzonders];
      return [scene.beschrijving];
    },

    // --- Navigatie -------------------------------------------------------------

    // De scènewissel, gebruikt door "ga <richting>" en door de engine als de
    // speler een schermrand oversteekt. Bij een eerste bezoek volgt de
    // beschrijving; bij een herbezoek niet (King's-Quest-stijl: lopen
    // herbeschrijft niet, "kijk" wel).
    betreed: function (toestand, richting) {
      var doel = this.uitgangen(toestand)[richting];
      if (doel === null) {
        return { tekst: [AL.strings.dieKantKanJeNietOp], effecten: [] };
      }
      var eersteBezoek = !toestand.bezocht[doel];
      toestand.sceneId = doel;
      toestand.bezocht[doel] = true;
      toestand.speler.richting = richting;

      var tekst = eersteBezoek ? this.beschrijfScene(toestand) : [];
      return {
        tekst: tekst,
        effecten: ["scene:" + doel, "betreed:" + richting, "geluid:deur"]
      };
    },

    // --- Commando's ------------------------------------------------------------

    kijk: function (toestand) {
      return { tekst: this.beschrijfScene(toestand), effecten: [] };
    },

    // Onderzoek/bekijk een ding. De verteller beschrijft; alleen 'open' verandert
    // de staat.
    //
    // Vroeger gaven de pc, de stoel, de koffiemok en de broncode-doos alle vier
    // de kamerbeschrijving terug — de alinea die de speler net gelezen had. Wie
    // een detail zocht, kreeg de kamer opnieuw. Elk zelfstandig naamwoord uit
    // een kamerbeschrijving heeft nu een eigen antwoord in
    // AL.strings.onderzoek[sceneId]; de woordkoppeling staat hieronder in
    // ONDERZOEK_WOORDEN.
    onderzoek: function (toestand, ding) {
      ding = (ding || "").toLowerCase();

      // Het notitieboek en de fragment-dozen houden hun eigen tekst: die
      // vertellen over de voortgang, niet over het voorwerp.
      if (toestand.sceneId === "zolder-west" && this._isNotitieboek(ding)) {
        return { tekst: [AL.strings.notitieboek.onderzoek], effecten: [] };
      }
      if (this._isFragmentDoos(toestand, ding)) {
        return { tekst: [AL.strings.dozen.onderzoek], effecten: [] };
      }

      var sleutel = this._onderzoekSleutel(toestand.sceneId, ding);
      if (sleutel) {
        var perScene = (AL.strings.onderzoek || {})[toestand.sceneId] || {};
        if (perScene[sleutel]) {
          return { tekst: [perScene[sleutel]], effecten: [] };
        }
      }
      return { tekst: [AL.strings.datZieJeHierNiet], effecten: [] };
    },

    // Welke onderzoeks-sleutel hoort bij dit woord, in deze scène? De eerste
    // treffer wint, dus specifieke woorden staan vóór algemene.
    _onderzoekSleutel: function (sceneId, ding) {
      var lijst = ONDERZOEK_WOORDEN[sceneId] || [];
      for (var i = 0; i < lijst.length; i++) {
        var woorden = lijst[i].woorden;
        for (var w = 0; w < woorden.length; w++) {
          if (ding.indexOf(woorden[w]) !== -1) return lijst[i].sleutel;
        }
      }
      return null;
    },

    // Open een doos of het notitieboek. Het notitieboek op zolder-west
    // ontgrendelt het fragment van level 1; de gemerkte dozen dieper in de
    // zolder ontgrendelen de latere fragmenten (loop-stap "vind het fragment").
    open: function (toestand, ding) {
      ding = (ding || "").toLowerCase();
      if (toestand.sceneId === "zolder-west" && this._isNotitieboek(ding)) {
        return this.ontgrendelFragment(toestand, 1);
      }
      if (this._isBroncodeDoos(toestand, ding)) {
        // De broncode-doos telt pas op het einde (endgame, WP 9/10).
        return { tekst: [AL.strings.scenes["zolder-midden"].hint], effecten: [] };
      }
      if (this._isFragmentDoos(toestand, ding)) {
        return this._openFragmentDoos(toestand);
      }
      return { tekst: [AL.strings.datZieJeHierNiet], effecten: [] };
    },

    // Het eerstvolgende nog niet ontgrendelde level (1..7), of null als alles
    // gevonden is. Bepaalt welk fragment een gemerkte doos onthult.
    volgendFragment: function (toestand) {
      for (var n = 1; n <= 7; n++) {
        var lvl = toestand.levels[String(n)];
        if (lvl && !lvl.ontgrendeld) return n;
      }
      return null;
    },

    // Open een gemerkte doos: onthult het eerstvolgende fragment als dat in deze
    // kamer thuishoort, anders wijst het je naar de juiste plek (lichte
    // ruimtelijke progressie, geen harde sloten).
    _openFragmentDoos: function (toestand) {
      var n = this.volgendFragment(toestand);
      if (n === null) {
        return { tekst: [AL.strings.dozen.allesGevonden], effecten: [] };
      }
      var loc = FRAGMENT_LOCATIE[n];
      if (loc === toestand.sceneId) {
        return this.ontgrendelFragment(toestand, n);
      }
      var wijs = AL.strings.dozen.nietHier[loc] || AL.strings.dozen.onderzoek;
      return { tekst: [wijs], effecten: [] };
    },

    // Ontgrendel het fragment van level n: markeer het level en open de spread.
    ontgrendelFragment: function (toestand, n) {
      var sleutel = String(n);
      var level = toestand.levels[sleutel];
      if (!level) return { tekst: [AL.strings.datZieJeHierNiet], effecten: [] };
      if (level.ontgrendeld) {
        return { tekst: [AL.strings.notitieboek.alGevonden], effecten: [] };
      }
      level.ontgrendeld = true;
      toestand.levelActief = n;
      var levelId = "l" + n;
      return {
        tekst: [AL.strings.notitieboek.open, AL.strings.fragmentGevonden(levelId)],
        effecten: [
          "fragment-gevonden:" + levelId,
          "spread:" + levelId,
          "geluid:pagina"
        ]
      };
    },

    // Ga aan de pc zitten (loop-stap "ga aan de pc zitten"). Vereist dat er een
    // fragment ontgrendeld is; anders stuurt Alberta je terug de zolder in.
    gebruikPc: function (toestand) {
      var n = toestand.levelActief;
      var level = toestand.levels[String(n)];
      if (!level || !level.ontgrendeld) {
        return { tekst: [AL.strings.pc.geenFragment], effecten: [] };
      }
      toestand.modus = "pc";
      return {
        tekst: [AL.strings.pc.gaZitten],
        effecten: ["pc:open", "level-start:" + n, "geluid:toets"]
      };
    },

    inventaris: function (toestand) {
      // In de zolder draag je (nog) niets; het framework laat de plaats.
      return { tekst: [AL.strings.draagtNiets], effecten: [] };
    },

    // De plaats-hint van de huidige hoek (het commando "?" in de zolder). Deze
    // navigatie-nudge telt NIET in hintsTotaal — dat is voor de puzzel-hints in
    // de pc (save-en-hints.md). Beslissing: zolder-hints zijn gratis en
    // ongeteld.
    hint: function (toestand) {
      var scene = AL.strings.scenes[toestand.sceneId];
      var tekst = scene ? scene.hint : AL.strings.geenPlaatsHint;
      return { tekst: [tekst], effecten: ["hint:1"] };
    },

    help: function () {
      var tekst = [AL.strings.helpTitel];
      for (var i = 0; i < AL.strings.help.length; i++) {
        tekst.push("  " + AL.strings.help[i]);
      }
      return { tekst: tekst, effecten: [] };
    },

    // Herbegin met bevestiging (save-en-hints.md). "herbegin" vraagt; het
    // effect "herbegin" volgt pas na bevestiging, waar de engine de save wist en
    // een verse staat maakt.
    herbeginVraag: function () {
      return { tekst: [AL.strings.herbeginVraag], effecten: [] };
    },
    herbeginBevestig: function () {
      return { tekst: [AL.strings.herbeginKlaar], effecten: ["herbegin"] };
    },

    // --- Kleine herkenners -----------------------------------------------------

    _isNotitieboek: function (ding) {
      return ding.indexOf("notitieboek") !== -1 || ding.indexOf("boek") !== -1 ||
        ding.indexOf("notitie") !== -1;
    },
    _isPc: function (ding) {
      return ding.indexOf("pc") !== -1 || ding.indexOf("computer") !== -1 ||
        ding.indexOf("monitor") !== -1 || ding.indexOf("scherm") !== -1;
    },
    // De broncode-doos: de prijs-doos op zolder-midden (aparte prop).
    _isBroncodeDoos: function (toestand, ding) {
      return toestand.sceneId === "zolder-midden" &&
        ding.indexOf("broncode") !== -1;
    },
    // Een gemerkte fragment-doos: alleen op zolder-midden en de overloop, en
    // enkel als het woord "broncode" er niet in staat (dat is de prijs-doos).
    _isFragmentDoos: function (toestand, ding) {
      if (toestand.sceneId !== "zolder-midden" &&
          toestand.sceneId !== "overloop") return false;
      if (ding.indexOf("broncode") !== -1) return false;
      return ding.indexOf("doos") !== -1 || ding.indexOf("dozen") !== -1 ||
        ding.indexOf("kist") !== -1;
    },

    // --- Endgame: sim → Alberta's oordeel → epiloog ---------------------------
    //
    // De sim zelf (Seven Little Goats speelbaar in de terminal) leeft in
    // js/sim/; hier staat de SEQUENCE eromheen, die na level-af:7 loopt. Ze is
    // los van de sim testbaar via simVoltooid (spelontwerp-legacy.md,
    // §"Endgame").

    // Level 7 af: de pc kondigt aan dat het spel compleet is en boot de sim.
    bootSim: function (toestand) {
      return {
        tekst: [AL.strings.endgame.compleet, AL.strings.endgame.bootSim],
        effecten: ["sim:boot", "geluid:boot"]
      };
    },

    // De sim bereikte een van de vier eindes → door naar Alberta's oordeel.
    // Wordt aangeroepen door js/pc/sim-terminal.js, en rechtstreeks door de
    // tests.
    simVoltooid: function (toestand, eindeNaam) {
      var r = this.startOordeel(toestand);
      r.effecten.unshift("sim:einde:" + (eindeNaam || "onbekend"));
      return r;
    },

    // Toon Alberta's oordeel: de tier volgt uit hintsTotaal (save-en-hints.md,
    // §"Alberta's oordeel"). Zet de modus en bewaart de tier in einde.
    startOordeel: function (toestand) {
      var tier = (AL.levels && typeof AL.levels.oordeel === "function")
        ? AL.levels.oordeel(toestand.hintsTotaal)
        : "vakvrouw";
      toestand.modus = "oordeel";
      toestand.einde = tier;
      var o = AL.strings.oordeel[tier] || AL.strings.oordeel.vakvrouw;
      return {
        tekst: [o.titel, o.tekst],
        effecten: ["oordeel:" + tier, "voortgang:opgeslagen"]
      };
    },

    // Van het oordeel naar de epiloog (wijst naar de echte broncode; sluit af).
    startEpiloog: function (toestand) {
      toestand.modus = "epiloog";
      return {
        tekst: AL.strings.epiloog.alineas.slice(),
        effecten: ["epiloog", "voortgang:opgeslagen"]
      };
    },

    // --- Save / load / herbegin (DOM-vrij; storage geïnjecteerd) --------------

    // Schrijf de staat naar storage. Geeft true bij succes, false als storage
    // faalt (bv. private mode). Crasht nooit.
    opslaan: function (storage, toestand) {
      if (!storage) return false;
      try {
        storage.setItem(SAVE_SLEUTEL, JSON.stringify(toestand));
        return true;
      } catch (e) {
        return false;
      }
    },

    // Lees de staat uit storage. Ontbreekt ze, is ze corrupt, of draagt ze een
    // onbekende hogere versie, dan start een verse staat via nieuw(seed) — nooit
    // een crash (save-en-hints.md, §"Versionering en migratie"). Een oudere
    // versie wordt gemigreerd en teruggeschreven.
    laad: function (storage, seed) {
      var ruw = null;
      try { ruw = storage ? storage.getItem(SAVE_SLEUTEL) : null; }
      catch (e) { ruw = null; }
      if (!ruw) return this.nieuw(seed);

      var opgeslagen;
      try { opgeslagen = JSON.parse(ruw); }
      catch (e) { return this.nieuw(seed); }

      if (!opgeslagen || typeof opgeslagen !== "object" ||
          typeof opgeslagen.versie !== "number") {
        return this.nieuw(seed);
      }
      if (opgeslagen.versie > VERSIE) {
        // Nieuwer schema dan wij kennen: verwerpen, verse staat.
        return this.nieuw(seed);
      }
      if (opgeslagen.versie < VERSIE) {
        var gemigreerd = this.migreer(opgeslagen);
        this.opslaan(storage, gemigreerd);
        return gemigreerd;
      }
      return opgeslagen;
    },

    // Til een oudere staat op naar het huidige schema. Additief en verliesvrij:
    // ontbrekende velden krijgen verstandige defaults, de versie wordt
    // opgehoogd. Nu nog een identiteit-plus-vulling omdat VERSIE 1 de eerste is;
    // toekomstige brekingen breiden dit uit.
    migreer: function (oud) {
      var vers = this.nieuw(oud.seed);
      // Neem bekende, nog geldige velden over waar ze bestaan.
      var overdraagbaar = ["seed", "modus", "sceneId", "speler", "bezocht",
        "levelActief", "levels", "hintsTotaal", "geluid", "crt", "gestopt",
        "einde"];
      for (var i = 0; i < overdraagbaar.length; i++) {
        var k = overdraagbaar[i];
        if (oud[k] !== undefined && oud[k] !== null) vers[k] = oud[k];
      }
      vers.versie = VERSIE;
      return vers;
    },

    // Zet het spel terug (het effect "herbegin"). Wist de save-sleutel en geeft
    // een verse staat. De seed blijft behouden als hij expliciet meegegeven is
    // (bv. een ?seed=N-run); anders wordt er een nieuwe gegenereerd.
    herbegin: function (storage, seed) {
      try { if (storage) storage.removeItem(SAVE_SLEUTEL); }
      catch (e) { /* niets */ }
      return this.nieuw(seed);
    }
  };

  AL.world = world;

  // Node-export voor de headless tests.
  if (typeof module !== "undefined") {
    module.exports = world;
  }

})();
