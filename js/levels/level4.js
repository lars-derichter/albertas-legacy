// level4.js — "Level 4 — Referenties: twee pijlen, één doos" (scharnier 4:
// referenties — twee pijlen één doos, null). Herstelt Kamer +
// Spel.verbindKamers. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): herstel de buur-bedrading, voorspel een
// aliasing-scenario (twee referenties naar één object), en verklaar wat null
// betekent.
//
// Het editor-fragment is een byte-getrouw uittreksel van
// seven-little-goats/src/Spel.java (verbindKamers; tools/check-assets bewaakt de
// drift). De terminal-puzzels lopen niet via de checker (checker-contract.md
// §"Niet-editor-puzzels"). De prose leeft in js/logic/strings.js (AL.strings.l4
// en AL.strings.puzzelHints).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor — Spel.verbindKamers: herstel de buur-bedrading (twee pijlen).
  //   Modeloplossing byte-getrouw uit Spel.java. Twee beschadigde varianten,
  //   beide javac-schoon: een setter die overal verkeerd staat, zodat één
  //   richting nooit meer wordt gelegd (de terugweg klopt niet):
  //     A) setZuid overal setNoord  -> methodeAanroep.ontbreekt (setZuid mist)
  //     B) setWest overal setOost   -> methodeAanroep.ontbreekt (setWest mist)
  // ===========================================================================
  var verbindModel =
"private void verbindKamers(Kamer eerste, String richting, Kamer tweede) {\n" +
"    if (richting.equals(\"noord\")) {\n" +
"        eerste.setNoord(tweede);\n" +
"        tweede.setZuid(eerste);\n" +
"    } else if (richting.equals(\"oost\")) {\n" +
"        eerste.setOost(tweede);\n" +
"        tweede.setWest(eerste);\n" +
"    } else if (richting.equals(\"zuid\")) {\n" +
"        eerste.setZuid(tweede);\n" +
"        tweede.setNoord(eerste);\n" +
"    } else if (richting.equals(\"west\")) {\n" +
"        eerste.setWest(tweede);\n" +
"        tweede.setOost(eerste);\n" +
"    }\n" +
"}\n";

  // Neutraal over wat er mis is: in variant A staat setNoord waar setZuid hoort,
  // in variant B setOost waar setWest hoort — telkens overal, dus die ene
  // richting wordt in geen enkele tak meer gelegd.
  //
  // WP 48: de conceptzin ("Elke verbinding loopt twee kanten op: leg ik de
  // noord-buur, dan legt de andere kamer zuid terug") stond hier én was het
  // antwoord op l4-trace en l4-verklaar. Wat blijft is de spec: vier setters,
  // één cascade, beide kanten.
  var verbindNotitie =
"// verbindKamers: vier richtingen in één if / else if-cascade, met setNoord,\n" +
"// setZuid, setOost en setWest, elke richting aan twee kanten. Hier is één van\n" +
"// de vier setters overal door een andere vervangen; die richting wordt\n" +
"// nergens meer gelegd. — A.\n" +
"\n";

  var verbindBeschadigdA = verbindNotitie +
    verbindModel.split("setZuid").join("setNoord");
  var verbindBeschadigdB = verbindNotitie +
    verbindModel.split("setWest").join("setOost");

  var editorRepair = {
    id: "l4-editor-repair",
    type: "editor",
    bron: "Spel.java",
    titel: S.l4.repairTitel,
    shuffleLabel: "l4-editor-repair",
    varianten: [verbindBeschadigdA, verbindBeschadigdB],
    variantMeldingen: ["methodeAanroep.ontbreekt", "methodeAanroep.ontbreekt"],
    model: verbindModel,
    checks: [
      { fn: "geenVerbodenConstructies", config: { methode: "verbindKamers" },
        uit: "l4.verbind.geenVerboden" },
      { fn: "conditieGebruikt", config: { methode: "verbindKamers", structuur: "cascade" },
        uit: "l4.verbind.cascade" },
      { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setNoord" },
        uit: "l4.verbind.setNoord" },
      { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setZuid" },
        uit: "l4.verbind.setZuid" },
      { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setOost" },
        uit: "l4.verbind.setOost" },
      { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setWest" },
        uit: "l4.verbind.setWest" }
    ]
  };

  // ===========================================================================
  // Trace / voorspel-de-output — aliasing (twee pijlen, één doos).
  //   eerste en tweede wijzen naar dezelfde Kamer; je zet de noord-buur via
  //   tweede en leest ze via eerste. De seed kiest de naam van de doel-kamer.
  // ===========================================================================
  var trace = {
    id: "l4-trace",
    type: "trace",
    titel: S.l4.traceTitel,
    pool: ["Dorpsplein", "Bospad", "Rivieroever"],
    label: "l4-trace",
    verwacht: function (naam) { return naam; },
    vraag: S.l4.trace.vraag,
    ok: S.l4.trace.ok,
    fout: S.l4.trace.fout
  };

  // ===========================================================================
  // Verklaar-in-één-zin — wat betekent null hier?
  //   Zelf-check: model tonen, dan bevestigen (juist/anders), cursus-idioom.
  // ===========================================================================
  var verklaar = {
    id: "l4-verklaar",
    type: "verklaar",
    titel: S.l4.verklaarTitel,
    vraag: S.l4.verklaar.vraag,
    toon: S.l4.verklaar.toon,
    model: S.l4.verklaar.model,
    bevestig: S.l4.verklaar.bevestig,
    juist: S.l4.verklaar.juist,
    anders: S.l4.verklaar.anders
  };

  var definitie = {
    naam: S.l4.naam,
    puzzels: [editorRepair, trace, verklaar]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("4", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
