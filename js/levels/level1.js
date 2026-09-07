// level1.js — "Level 1 — Klasse en instantie: zeven uit één vorm" (checkpoint 1:
// klasse vs. instantie, velden, constructor, this). Herstelt Voorwerp en Geitje
// uit Alberta's beschadigde notitieboek. Puzzelvormen uit de leveltabel
// (docs/levels-en-checkpoints.md): herstel de constructor, schrijf Geitje uit
// de notities, en verklaar het verschil tussen blauwdruk (klasse) en doos
// (instantie).
//
// De Java-fragmenten hieronder zijn byte-getrouwe uittreksels uit
// seven-little-goats/src/Voorwerp.java en Geitje.java (tools/check-assets bewaakt
// de drift). De speler-gerichte prose (prompts, hints, feedback) leeft in
// js/logic/strings.js (AL.strings.l1 en AL.strings.puzzelHints); hier staan de
// code-fragmenten en de structurele checks. Alberta's kantlijnnotitie boven een
// fragment is de uitzondering: die is een Java-commentaar en hoort dus bij de
// code die de editor laadt, niet bij de strings.
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

  // De notitie boven de code is Alberta's kantlijn, niet een opgavebrief: geen
  // kop, geen imperatief uit een klaslokaal, en ze eindigt op "— A." (WP 45;
  // achtergrond.md, §"Toon en register"). Sinds WP 48 is ze bovendien pure spec:
  // de velden met hun types en wat er niet klopt, in de vorm van de geitjeStub
  // hieronder. De metafoor van de "verse doos" is eruit — dat was uitleg over
  // wat een constructor dóét, en dat leren studenten in de les. De vorm
  // this.<veld> = <parameter>; staat twee regels lager in de code zelf, en
  // hintfase 3 draagt hem voor wie hem niet ziet. Ze blijft neutraal over wát er
  // mis is, want de twee varianten verschillen: in A ontbreekt de this-
  // verwijzing, in B staat de toewijzing omgekeerd (this staat er dan wél, aan de
  // verkeerde kant); "de toewijzing klopt niet" dekt allebei.
  var voorwerpNotitie =
"// Een voorwerp heeft een naam (String), een beschrijving (String) en kracht\n" +
"// (int). De constructor zet die drie velden; bij één veld klopt de\n" +
"// toewijzing niet. Nog niet af. — A.\n" +
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
"// Een geitje heeft een naam (String), een schuilplaats (Schuilplaats) en of\n" +
"// het gered is (boolean, begint op false). De private velden, de constructor\n" +
"// die naam en schuilplaats invult en de getters getNaam() en\n" +
"// getSchuilplaats() staan er nog niet. — A.\n" +
"\n" +
"class Geitje {\n" +
"\n" +
"    // hier verder\n" +
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
    titel: S.l1.verklaarTitel,
    vraag: S.l1.verklaar.vraag,
    toon: S.l1.verklaar.toon,
    model: S.l1.verklaar.model,
    bevestig: S.l1.verklaar.bevestig,
    juist: S.l1.verklaar.juist,
    anders: S.l1.verklaar.anders
  };

  var definitie = {
    naam: S.l1.naam,
    puzzels: [editorRepair, editorWrite, verklaar]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("1", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
