// level1.js — "Level 1 — De blauwdruk en de doos" (scharnier 1: klasse vs.
// instantie, velden, constructor, this). Herstelt Voorwerp en Geitje uit
// Alberta's beschadigde notitieboek. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): herstel de constructor, schrijf Geitje uit de
// notities, en verklaar het verschil tussen blauwdruk (klasse) en doos
// (instantie).
//
// De Java-fragmenten hieronder zijn byte-getrouwe uittreksels uit
// seven-little-goats/src/Voorwerp.java en Geitje.java (tools/check-assets bewaakt
// de drift). De speler-gerichte prose (prompts, Alberta's notities, hints,
// feedback) leeft in js/logic/strings.js (AL.strings.l1 en AL.strings.puzzelHints);
// hier staan alleen de code-fragmenten en de structurele checks.
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor 1 — Voorwerp: herstel de constructor (this.<veld> = <parameter>;).
  //   Modeloplossing byte-getrouw uit Voorwerp.java. Twee beschadigde varianten
  //   (seed-gestuurde keuze), beide javac-schoon:
  //     A) een weggevallen this-verwijzing (naam)   -> constructorToewijzing.ontbreekt
  //     B) een omgekeerde toewijzing (beschrijving)  -> constructorToewijzing.omgekeerd
  // ===========================================================================
  var voorwerpModel =
"class Voorwerp {\n" +
"\n" +
"    private String naam;\n" +
"    private String beschrijving;\n" +
"    private int kracht;\n" +
"\n" +
"    Voorwerp(String naam, String beschrijving) {\n" +
"        this.naam = naam;\n" +
"        this.beschrijving = beschrijving;\n" +
"        this.kracht = 0;\n" +
"    }\n" +
"\n" +
"    Voorwerp(String naam, String beschrijving, int kracht) {\n" +
"        this.naam = naam;\n" +
"        this.beschrijving = beschrijving;\n" +
"        this.kracht = kracht;\n" +
"    }\n" +
"\n" +
"    String getNaam() {\n" +
"        return naam;\n" +
"    }\n" +
"\n" +
"    int getKracht() {\n" +
"        return kracht;\n" +
"    }\n" +
"}\n";

  var voorwerpNotitie =
"// Alberta's notitie — Voorwerp:\n" +
"//   Een voorwerp heeft een naam, een beschrijving en een kracht.\n" +
"//   De constructor vult de velden van een verse doos: this.<veld> = <parameter>;\n" +
"//   Deze is nog niet af — ergens ontbreekt een verwijzing naar de doos\n" +
"//   zelf. Maak hem af.\n" +
"\n";

  var voorwerpBeschadigdA = voorwerpNotitie +
    voorwerpModel.split("this.naam = naam;").join("naam = naam;");
  var voorwerpBeschadigdB = voorwerpNotitie +
    voorwerpModel.split("this.beschrijving = beschrijving;")
                 .join("beschrijving = this.beschrijving;");

  var editorRepair = {
    id: "l1-editor-repair",
    type: "editor",
    bron: "Voorwerp.java",
    titel: S.l1.repairTitel,
    shuffleLabel: "l1-editor-repair",
    varianten: [voorwerpBeschadigdA, voorwerpBeschadigdB],
    // Metadata voor de tests (renderers negeren dit): de verwachte eerste
    // meldingKey per variant, op index uitgelijnd met varianten.
    variantMeldingen: ["constructorToewijzing.ontbreekt", "constructorToewijzing.omgekeerd"],
    model: voorwerpModel,
    checks: [
      { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true },
        uit: "l1.voorwerp.veldNaam" },
      { fn: "constructorToewijzing", config: { veld: "naam", param: "naam" },
        uit: "l1.voorwerp.vulNaam" },
      { fn: "constructorToewijzing", config: { veld: "beschrijving" },
        uit: "l1.voorwerp.vulBeschrijving" },
      { fn: "constructorToewijzing", config: { veld: "kracht" },
        uit: "l1.voorwerp.vulKracht" }
    ]
  };

  // ===========================================================================
  // Editor 2 — Geitje: schrijf de klasse uit de notitie (van nul).
  //   Modeloplossing byte-getrouw uit Geitje.java.
  // ===========================================================================
  var geitjeModel =
"class Geitje {\n" +
"\n" +
"    private String naam;\n" +
"    private Schuilplaats schuilplaats;\n" +
"    private boolean gered;\n" +
"\n" +
"    Geitje(String naam, Schuilplaats schuilplaats) {\n" +
"        this.naam = naam;\n" +
"        this.schuilplaats = schuilplaats;\n" +
"        this.gered = false;\n" +
"    }\n" +
"\n" +
"    String getNaam() {\n" +
"        return naam;\n" +
"    }\n" +
"\n" +
"    Schuilplaats getSchuilplaats() {\n" +
"        return schuilplaats;\n" +
"    }\n" +
"}\n";

  var geitjeStub =
"// Alberta's notitie — Geitje:\n" +
"//   Een geitje heeft een naam (String), een schuilplaats (Schuilplaats)\n" +
"//   en of het gered is (boolean, begint op false).\n" +
"//   Schrijf de private velden, de constructor die naam en schuilplaats\n" +
"//   invult (de gered-vlag begint op false), en de getters getNaam() en\n" +
"//   getSchuilplaats().\n" +
"\n" +
"class Geitje {\n" +
"\n" +
"    // schrijf hier je code\n" +
"\n" +
"}\n";

  var editorWrite = {
    id: "l1-editor-write",
    type: "editor",
    bron: "Geitje.java",
    titel: S.l1.writeTitel,
    varianten: [geitjeStub],
    model: geitjeModel,
    checks: [
      { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true },
        uit: "l1.geitje.veldNaam" },
      { fn: "veldDeclaratie", config: { type: "Schuilplaats", naam: "schuilplaats", privaat: true },
        uit: "l1.geitje.veldSchuilplaats" },
      { fn: "constructorToewijzing", config: { veld: "naam", param: "naam" },
        uit: "l1.geitje.vulNaam" },
      { fn: "constructorToewijzing", config: { veld: "schuilplaats" },
        uit: "l1.geitje.vulSchuilplaats" },
      { fn: "heeftReturn", config: { methode: "getNaam", retourVorm: "naam" },
        uit: "l1.geitje.getterNaam" },
      { fn: "heeftReturn", config: { methode: "getSchuilplaats", retourVorm: "schuilplaats" },
        uit: "l1.geitje.getterSchuilplaats" }
    ]
  };

  // ===========================================================================
  // Verklaar-in-één-zin — klasse (blauwdruk) versus instantie (doos).
  //   Zelf-check: model tonen, dan bevestigen (juist/anders), cursus-idioom.
  // ===========================================================================
  var verklaar = {
    id: "l1-verklaar",
    type: "verklaar",
    vraag: S.l1.verklaar.vraag,
    toon: S.l1.verklaar.toon,
    model: S.l1.verklaar.model,
    bevestig: S.l1.verklaar.bevestig,
    juist: S.l1.verklaar.juist,
    anders: S.l1.verklaar.anders
  };

  var definitie = {
    week: 1,
    naam: S.l1.naam,
    puzzels: [editorRepair, editorWrite, verklaar]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("1", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
