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
    "zolder-midden": { west: "zolder-west", oost: "zolder-oost" },
    "zolder-oost":   { west: "zolder-midden" }
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

    beschrijfScene: function (toestand) {
      var scene = AL.strings.scenes[toestand.sceneId];
      if (!scene) return [AL.strings.nietsBijzonders];
      return ["== " + scene.naam + " ==", scene.beschrijving];
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

    // Onderzoek/bekijk een ding. Voor het framework kent alleen het notitieboek
    // op zolder-west een echte beschrijving; de rest is sfeer.
    onderzoek: function (toestand, ding) {
      ding = (ding || "").toLowerCase();
      if (toestand.sceneId === "zolder-west" && this._isNotitieboek(ding)) {
        return { tekst: [AL.strings.notitieboek.onderzoek], effecten: [] };
      }
      if (toestand.sceneId === "zolder-oost" && this._isPc(ding)) {
        return { tekst: [AL.strings.scenes["zolder-oost"].beschrijving],
          effecten: [] };
      }
      if (toestand.sceneId === "zolder-midden" &&
          (ding.indexOf("doos") !== -1 || ding.indexOf("broncode") !== -1)) {
        return { tekst: [AL.strings.scenes["zolder-midden"].beschrijving],
          effecten: [] };
      }
      return { tekst: [AL.strings.datZieJeHierNiet], effecten: [] };
    },

    // Open een doos of het notitieboek. Het notitieboek op zolder-west
    // ontgrendelt het fragment van level 1 (loop-stap "vind het fragment").
    open: function (toestand, ding) {
      ding = (ding || "").toLowerCase();
      if (toestand.sceneId === "zolder-west" && this._isNotitieboek(ding)) {
        return this.ontgrendelFragment(toestand, 1);
      }
      if (toestand.sceneId === "zolder-midden" &&
          (ding.indexOf("doos") !== -1 || ding.indexOf("broncode") !== -1)) {
        // De broncode-doos telt pas op het einde (endgame, WP later).
        return { tekst: [AL.strings.scenes["zolder-midden"].hint], effecten: [] };
      }
      return { tekst: [AL.strings.datZieJeHierNiet], effecten: [] };
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
        "levelActief", "levels", "hintsTotaal", "geluid", "gestopt", "einde"];
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
