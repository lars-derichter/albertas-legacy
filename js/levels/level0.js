// level0.js — "Level 0 — de proefdruk": TESTINHOUD, geen echt spellevel. Het
// oefent elke puzzelsoort van de gesimuleerde pc precies één keer, met de
// echte checker-integratie (de fragmenten komen uit de WP 4-corpus, zodat het
// oordeel écht door AL.checker loopt). Zo kan WP 5 de editor, terminal en
// Parsons-UI end-to-end aantonen zonder op de level-WP's (7–9) te wachten.
//
// NIET in productie geladen: index.html hangt dit bestand alleen in bij de
// dev-parameter ?dev=1 (zie de dev-gate onderaan). In Node (de tests) registreert
// het zich altijd, zodat test/test-pc-logic.mjs de DOM-vrije puzzellogica kan
// drijven.
//
// De speler-gerichte prose (vragen, opties, feedback, hints) leeft in
// js/logic/strings.js (AL.strings.l0 en AL.strings.puzzelHints); hier staan de
// Java-fragmenten (beschadigde code + modeloplossingen) en de structurele
// checks — precies wat de bestandskaart aan js/levels/ toewijst.
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;   // prose; in Node al geladen via helpers

  // ===========================================================================
  // Editor 1 — Voorwerp: herstel de constructor (this.<veld> = <parameter>;)
  //   Modeloplossing verbatim uit seven-little-goats/src/ (via de WP 4-corpus).
  //   Twee beschadigde varianten (seed-gestuurde keuze), beide javac-schoon maar
  //   met een ontbrekende this-toewijzing.
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

  // Beschadigde varianten: Alberta's notities als commentaar boven de code, met
  // één weggevallen this-verwijzing (waterschade op het notitieboek). Beide
  // compileren (javac-schoon) maar zakken op een constructorToewijzing-check.
  var voorwerpNotitie =
"// Alberta's notitie — Voorwerp:\n" +
"//   Een voorwerp heeft een naam, een beschrijving en een kracht.\n" +
"//   De constructor vult de velden van een vers object.\n" +
"//   Ergens heeft een waterstreep een verwijzing naar het object zelf\n" +
"//   opgevreten. Herstel de vorm:  this.<veld> = <parameter>;\n" +
"\n";

  var voorwerpBeschadigdA = voorwerpNotitie +
    voorwerpModel.split("this.naam = naam;").join("naam = naam;");
  var voorwerpBeschadigdB = voorwerpNotitie +
    voorwerpModel.split("this.beschrijving = beschrijving;")
                 .join("beschrijving = beschrijving;");

  var editorRepair = {
    id: "l0-editor-repair",
    type: "editor",
    bron: "Voorwerp.java",
    titel: S.l0.repairTitel,
    shuffleLabel: "l0-editor-repair",
    varianten: [voorwerpBeschadigdA, voorwerpBeschadigdB],
    model: voorwerpModel,
    checks: [
      { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true },
        uit: "l0.voorwerp.veldNaam" },
      { fn: "constructorToewijzing", config: { veld: "naam", param: "naam" },
        uit: "l0.voorwerp.vulNaam" },
      { fn: "constructorToewijzing", config: { veld: "beschrijving" },
        uit: "l0.voorwerp.vulBeschrijving" },
      { fn: "constructorToewijzing", config: { veld: "kracht" },
        uit: "l0.voorwerp.vulKracht" }
    ]
  };

  // ===========================================================================
  // Editor 2 — Geitje: schrijf de klasse uit de notitie (van nul).
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
"//   invult, en de getters getNaam() en getSchuilplaats().\n" +
"\n" +
"class Geitje {\n" +
"\n" +
"    // schrijf hier je code\n" +
"\n" +
"}\n";

  var editorWrite = {
    id: "l0-editor-write",
    type: "editor",
    bron: "Geitje.java",
    titel: S.l0.writeTitel,
    varianten: [geitjeStub],
    model: geitjeModel,
    checks: [
      { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true },
        uit: "l0.geitje.veldNaam" },
      { fn: "veldDeclaratie", config: { type: "Schuilplaats", naam: "schuilplaats", privaat: true },
        uit: "l0.geitje.veldSchuilplaats" },
      { fn: "constructorToewijzing", config: { veld: "schuilplaats" },
        uit: "l0.geitje.vulSchuilplaats" },
      { fn: "heeftReturn", config: { methode: "getSchuilplaats", retourVorm: "schuilplaats" },
        uit: "l0.geitje.getterSchuilplaats" }
    ]
  };

  // ===========================================================================
  // Parsons — verdubbel(int): kop → berekenen → teruggeven → sluiten, met één
  //   afleider die de methode zou breken (getal * getal i.p.v. * 2).
  // ===========================================================================
  var parsons = {
    id: "l0-parsons",
    type: "parsons",
    shuffleLabel: "l0-parsons",
    regels: [
      "int verdubbel(int getal) {",
      "    int resultaat = getal * 2;",
      "    return resultaat;",
      "}"
    ],
    distractors: [
      "    return getal * getal;"
    ],
    vraag: S.l0.parsons.vraag,
    ok: S.l0.parsons.ok,
    fout: S.l0.parsons.fout,
    foutAantal: S.l0.parsons.foutAantal
  };

  // ===========================================================================
  // Trace / voorspel-de-output — de driehoekssom 1..N (seed kiest N).
  // ===========================================================================
  var trace = {
    id: "l0-trace",
    type: "trace",
    pool: [3, 4, 5],
    label: "l0-trace",
    verwacht: function (n) { return String((n * (n + 1)) / 2); },
    vraag: S.l0.trace.vraag,
    ok: S.l0.trace.ok,
    fout: S.l0.trace.fout
  };

  // ===========================================================================
  // Vind-de-fout — off-by-one in een lusgrens (regel 1).
  // ===========================================================================
  var vindfout = {
    id: "l0-vindfout",
    type: "vindfout",
    regelnummer: 1,
    aanvaard: ["<=", "kleiner of gelijk", "kleiner dan of gelijk", "lusgrens",
      "grens", "off-by-one", "off by one", "een te ver", "te ver"],
    vraag: S.l0.vindfout.vraag,
    ok: S.l0.vindfout.ok,
    fout: S.l0.vindfout.fout
  };

  // ===========================================================================
  // Verklaar-in-één-zin — zelf-check (model tonen, dan juist/anders).
  // ===========================================================================
  var verklaar = {
    id: "l0-verklaar",
    type: "verklaar",
    vraag: S.l0.verklaar.vraag,
    toon: S.l0.verklaar.toon,
    model: S.l0.verklaar.model,
    bevestig: S.l0.verklaar.bevestig,
    juist: S.l0.verklaar.juist,
    anders: S.l0.verklaar.anders
  };

  // ===========================================================================
  // Welke-patroonkaart — de zoeklus herkennen (keuze 1-4).
  // ===========================================================================
  var patroonkaart = {
    id: "l0-patroonkaart",
    type: "patroonkaart",
    antwoord: 1,
    vraag: S.l0.patroonkaart.vraag,
    opties: S.l0.patroonkaart.opties,
    ok: S.l0.patroonkaart.ok,
    fout: S.l0.patroonkaart.fout
  };

  var definitie = {
    week: 0,
    dev: true,
    naam: S.l0.naam,
    puzzels: [
      editorRepair, editorWrite, parsons, trace, vindfout, verklaar, patroonkaart
    ]
  };

  // Dev-gate (Beslissing, zie het rapport): dit is testinhoud en hoort niet in
  // een gewone playthrough. In de browser registreren we level 0 alleen bij
  // ?dev=1; in Node registreren we altijd zodat de tests het framework kunnen
  // drijven. De verse-staat-bouw (AL.levels.verseLevels) neemt geregistreerde
  // levels buiten 1..7 mee, zodat level 0 een eigen puzzelstaat krijgt.
  var isNode = (typeof module !== "undefined" && module.exports);
  var devAan = false;
  try { devAan = /[?&]dev=1\b/.test((globalThis.location && globalThis.location.search) || ""); }
  catch (e) { devAan = false; }

  if (globalThis.AL.levels && (isNode || devAan)) {
    globalThis.AL.levels.registreer("0", definitie);
  }

  if (isNode) { module.exports = definitie; }

})();
