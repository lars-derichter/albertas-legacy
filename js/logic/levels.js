// levels.js — de level/puzzel-toestandsmachine (het FRAMEWORK). De echte
// puzzeldefinities, beschadigde code en modeloplossingen komen in de level-WP's
// (js/levels/level1.js … level7.js); die registreren zich hier, net zoals
// scènebestanden zich aan AL.scenes hangen. Dit bestand levert:
//
//  - een level-registry (registreer / verseLevels);
//  - de puzzel-levenscyclus (open → bezig → af);
//  - de hint-service (drie stadia, telt in de staat, hint:geen-meer);
//  - de variatie-service (seed-gestuurde PRNG: variant, shuffle, poolPick);
//  - voortgang (puzzel af, level af, alles af);
//  - de oordeel-tier-berekening (save-en-hints.md).
//
// Alles is DOM-vrij en Node-testbaar. Handlers die de speler iets tonen, geven
// { tekst, effecten } terug; de zuivere query-/reken-functies geven data terug.
//
// Aangepast uit remake-90s: het "registreer je zelf"-patroon komt van de
// scène-/sprite-bestanden daar; de rest is nieuw voor The Legacy of Alberta.
//
// Draait zowel in de browser (AL.levels) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  // De hint-drempels en de oordeel-tiers (save-en-hints.md). De level-workers
  // mogen de oordeel-drempels bijstellen als het puzzelaantal wijzigt, mits de
  // vier tiers en de toon behouden blijven.
  var HINT_STADIA = 3;
  var OORDEEL = [
    { tier: "meesterhand",   max: 3 },
    { tier: "vakvrouw",      max: 10 },
    { tier: "doorzetter",    max: 20 },
    { tier: "samen-geraakt", max: Infinity }
  ];

  // De registry: levelId ("1".."7") -> { puzzels: [ { id, type, ... } ] }.
  var registry = {};

  // ---- Deterministische PRNG (mulberry32) ---------------------------------

  // Klein, snel, deterministisch: dezelfde seed geeft exact dezelfde reeks.
  // Geport als een standaard mulberry32 (publiek domein), zoals het plan vraagt.
  function mulberry32(a) {
    a = a | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Meng een seed met een label, zodat verschillende beslissingen binnen één
  // playthrough onafhankelijk variëren maar wél deterministisch blijven per
  // seed. (Een simpele string-hash op het label, XOR met de seed.)
  function mengSeed(seed, label) {
    var h = 2166136261;
    var s = String(label === undefined ? "" : label);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((seed | 0) ^ (h | 0)) | 0;
  }

  var levels = {

    HINT_STADIA: HINT_STADIA,

    // ---- Registry ----------------------------------------------------------

    // Een level registreert zichzelf (aangeroepen door js/levels/levelN.js).
    // def.puzzels is een lijst puzzeldefinities met minstens een id.
    registreer: function (levelId, def) {
      registry[String(levelId)] = def || { puzzels: [] };
      return this;
    },

    // Is een level geregistreerd?
    isGeregistreerd: function (levelId) {
      return Object.prototype.hasOwnProperty.call(registry, String(levelId));
    },

    // De puzzeldefinities van een level (of een lege lijst).
    puzzelDefs: function (levelId) {
      var def = registry[String(levelId)];
      return def && def.puzzels ? def.puzzels : [];
    },

    // Bouw de verse levels-structuur voor een nieuwe staat (aangeroepen door
    // AL.world.nieuw). Levels 1..7 bestaan altijd; hun puzzels komen uit de
    // registry (of blijven leeg tot hun WP ze registreert).
    verseLevels: function () {
      var lv = {};
      // De vaste levels 1..7 plus eventueel geregistreerde dev-levels (bv. "0",
      // de proefdruk uit js/levels/level0.js). Zo krijgt een dev-level ook een
      // eigen puzzelstaat (status/hints/draft) zonder de save-vorm te breken;
      // aantalAfgerond/alAf tellen enkel 1..7, dus level 0 telt niet mee.
      var sleutels = {};
      for (var n = 1; n <= 7; n++) sleutels[String(n)] = true;
      var extra = Object.keys(registry);
      for (var e = 0; e < extra.length; e++) sleutels[extra[e]] = true;

      Object.keys(sleutels).forEach(function (sleutel) {
        var puzzels = {};
        var defs = levels.puzzelDefs(sleutel);
        for (var i = 0; i < defs.length; i++) {
          var d = defs[i];
          var p = { status: "open", hints: 0 };
          if (d.type === "editor") p.draft = "";   // concept-behoud
          puzzels[d.id] = p;
        }
        lv[sleutel] = {
          ontgrendeld: false,
          spreadGelezen: false,
          puzzels: puzzels,
          afgerond: false
        };
      });
      return lv;
    },

    // ---- Puzzel-levenscyclus (open → bezig → af) ---------------------------

    puzzel: function (toestand, levelId, puzzleId) {
      var level = toestand.levels[String(levelId)];
      if (!level) return null;
      return level.puzzels[puzzleId] || null;
    },

    markeerBezig: function (toestand, levelId, puzzleId) {
      var p = this.puzzel(toestand, levelId, puzzleId);
      if (p && p.status === "open") p.status = "bezig";
      return p;
    },

    // Voltooi een puzzel. Zet de status op "af", geeft puzzle-af terug, en als
    // daarmee alle puzzels van het level af zijn ook level-af.
    voltooiPuzzel: function (toestand, levelId, puzzleId) {
      var p = this.puzzel(toestand, levelId, puzzleId);
      if (!p) return { tekst: [], effecten: [] };
      var alAf = p.status === "af";
      p.status = "af";
      var effecten = alAf ? [] : ["puzzle-af:" + puzzleId];
      if (this.allePuzzelsAf(toestand, levelId)) {
        var level = toestand.levels[String(levelId)];
        if (!level.afgerond) {
          level.afgerond = true;
          effecten.push("level-af:" + levelId);
          effecten.push("voortgang:opgeslagen");
        }
      }
      return { tekst: [], effecten: effecten };
    },

    allePuzzelsAf: function (toestand, levelId) {
      var level = toestand.levels[String(levelId)];
      if (!level) return false;
      var ids = Object.keys(level.puzzels);
      if (ids.length === 0) return false;
      for (var i = 0; i < ids.length; i++) {
        if (level.puzzels[ids[i]].status !== "af") return false;
      }
      return true;
    },

    // ---- Hint-service (drie stadia) ----------------------------------------

    // Vraag een hint voor een puzzel. De teller puzzels[*].hints bepaalt het
    // stadium (0→1, 1→2, 2→3); een vierde aanvraag geeft geen nieuwe hint maar
    // hint:geen-meer. Elke echte hint telt in puzzels[*].hints én in
    // hintsTotaal (voedt Alberta's oordeel). De teksten komen uit
    // AL.strings.puzzelHints[puzzleId]; ontbreken ze, dan een nette terugval.
    hint: function (toestand, levelId, puzzleId) {
      var p = this.puzzel(toestand, levelId, puzzleId);
      if (!p) {
        return { tekst: [AL.strings.hintGeenMeer], effecten: ["hint:geen-meer"] };
      }
      if (p.hints >= HINT_STADIA) {
        return { tekst: [AL.strings.hintGeenMeer], effecten: ["hint:geen-meer"] };
      }
      var stap = p.hints + 1;               // 1..3
      p.hints = stap;
      toestand.hintsTotaal = (toestand.hintsTotaal || 0) + 1;
      var bron = (AL.strings.puzzelHints && AL.strings.puzzelHints[puzzleId]) || null;
      var tekst = bron && bron[stap - 1] ? bron[stap - 1]
        : "Hint " + stap + " voor " + puzzleId + ".";
      return { tekst: [tekst], effecten: ["hint:" + stap] };
    },

    // ---- Variatie-service (seed-gestuurd) ----------------------------------

    // Een verse PRNG voor deze seed (optioneel gemengd met een label, zodat
    // aparte beslissingen onafhankelijk maar deterministisch variëren).
    prng: function (seed, label) {
      return mulberry32(mengSeed(seed | 0, label));
    },

    // Kies deterministisch een index in [0, aantal).
    variantIndex: function (seed, aantal, label) {
      if (aantal <= 0) return 0;
      return Math.floor(this.prng(seed, label)() * aantal) % aantal;
    },

    // Kies deterministisch één element uit een lijst (bv. de beschadigde
    // variant van een herstel-puzzel).
    kiesVariant: function (seed, opties, label) {
      if (!opties || opties.length === 0) return undefined;
      return opties[this.variantIndex(seed, opties.length, label)];
    },

    // Trek deterministisch één element uit een pool (bv. de trace-waarden).
    poolPick: function (seed, pool, label) {
      return this.kiesVariant(seed, pool, label);
    },

    // Deterministische Fisher-Yates-shuffle (bv. de Parsons-stroken). Muteert de
    // invoer niet: geeft een nieuwe, geschudde array terug.
    shuffle: function (seed, lijst, label) {
      var rng = this.prng(seed, label);
      var uit = lijst.slice();
      for (var i = uit.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var t = uit[i]; uit[i] = uit[j]; uit[j] = t;
      }
      return uit;
    },

    // ---- Voortgang & oordeel -----------------------------------------------

    // Hoeveel levels volledig afgerond zijn.
    aantalAfgerond: function (toestand) {
      var n = 0;
      for (var i = 1; i <= 7; i++) {
        if (toestand.levels[String(i)] && toestand.levels[String(i)].afgerond) n++;
      }
      return n;
    },

    // Is het hele spel uit (alle zeven levels af)?
    alAf: function (toestand) {
      return this.aantalAfgerond(toestand) >= 7;
    },

    // De oordeel-tier voor een totaal hint-aantal (save-en-hints.md). Alle vier
    // de tiers zijn positief; het verschil is de knipoog.
    oordeel: function (hintsTotaal) {
      var h = hintsTotaal | 0;
      for (var i = 0; i < OORDEEL.length; i++) {
        if (h <= OORDEEL[i].max) return OORDEEL[i].tier;
      }
      return OORDEEL[OORDEEL.length - 1].tier;
    }
  };

  AL.levels = levels;

  // ---- Placeholder-level (framework-zaad) ---------------------------------

  // Registreer een placeholder-level 1 met de drie puzzels uit de staat-vorm,
  // zodat het framework en de tests iets hebben om tegen te draaien vóór de
  // level-WP's echte definities leveren. WP van level 1 vervangt dit.
  levels.registreer("1", {
    week: 3,
    puzzels: [
      { id: "l1-editor",   type: "editor" },
      { id: "l1-trace",    type: "trace" },
      { id: "l1-verklaar", type: "verklaar" }
    ]
  });

  // Node-export voor de headless tests.
  if (typeof module !== "undefined") {
    module.exports = levels;
  }

})();
