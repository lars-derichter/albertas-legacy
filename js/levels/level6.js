// level6.js — "Level 6 — Index en off-by-one: de laatste plank" (scharnier 6:
// index en off-by-one; welke lus kies ik). Herstelt Kamer.verwijderVoorwerp en
// raakt aan de Gevecht-rondes. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): herstel de off-by-one, voorspel de laatste
// afgedrukte index, en vind de fout in een verkeerde luskeuze.
//
// Het editor-fragment is een byte-getrouw uittreksel van
// seven-little-goats/src/Kamer.java (verwijderVoorwerp; tools/check-assets bewaakt
// de drift). De terminal-puzzels lopen niet via de checker (checker-contract.md
// §"Niet-editor-puzzels"). De prose leeft in js/logic/strings.js (AL.strings.l6
// en AL.strings.puzzelHints).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor — Kamer.verwijderVoorwerp: herstel de off-by-one / de luskeuze.
  //   Modeloplossing byte-getrouw uit Kamer.java. Twee beschadigde varianten,
  //   beide javac-schoon:
  //     A) de lusgrens gaat één plank te ver (<= i.p.v. <) -> lusGrenzen.offByOne
  //     B) een while waar een for hoort (welke lus kies ik) -> lusVorm.verkeerdeSoort
  // ===========================================================================
  var verwijderModel =
"void verwijderVoorwerp(String teVerwijderenNaam) {\n" +
"    for (int i = 0; i < voorwerpen.size(); i++) {\n" +
"        if (voorwerpen.get(i).getNaam().equals(teVerwijderenNaam)) {\n" +
"            voorwerpen.remove(i);\n" +
"            return;\n" +
"        }\n" +
"    }\n" +
"}\n";

  // Neutraal over wat er mis is: variant A loopt één plank te ver, variant B is
  // de verkeerde soort lus. Een notitie die "hier loopt ze te ver" zegt, liegt
  // dus bij de helft van de spelers.
  var verwijderNotitie =
"// De eerste plank is 0, de laatste size() min één. Een for-lus van 0 tot\n" +
"// size(), strikt kleiner; verwijder op de index en stop meteen. Eén plank te\n" +
"// ver en je ligt in het water. Wat er nu staat, klopt niet. — A.\n" +
"\n";

  var verwijderBeschadigdA = verwijderNotitie +
    verwijderModel.split("i < voorwerpen.size()").join("i <= voorwerpen.size()");
  var verwijderBeschadigdB = verwijderNotitie +
"void verwijderVoorwerp(String teVerwijderenNaam) {\n" +
"    int i = 0;\n" +
"    while (i < voorwerpen.size()) {\n" +
"        if (voorwerpen.get(i).getNaam().equals(teVerwijderenNaam)) {\n" +
"            voorwerpen.remove(i);\n" +
"            return;\n" +
"        }\n" +
"        i++;\n" +
"    }\n" +
"}\n";

  var editorRepair = {
    id: "l6-editor-repair",
    type: "editor",
    bron: "Kamer.java",
    titel: S.l6.repairTitel,
    shuffleLabel: "l6-editor-repair",
    varianten: [verwijderBeschadigdA, verwijderBeschadigdB],
    variantMeldingen: ["lusGrenzen.offByOne", "lusVorm.verkeerdeSoort"],
    model: verwijderModel,
    checks: [
      { fn: "geenVerbodenConstructies", config: { methode: "verwijderVoorwerp" },
        uit: "l6.verwijder.geenVerboden" },
      { fn: "lusVorm", config: { methode: "verwijderVoorwerp", soort: "for" },
        uit: "l6.verwijder.lus" },
      { fn: "lusGrenzen", config: { methode: "verwijderVoorwerp", vergelijk: "<", grensBevat: "size" },
        uit: "l6.verwijder.grens" },
      { fn: "methodeAanroep", config: { methode: "verwijderVoorwerp", naam: "remove" },
        uit: "l6.verwijder.remove" }
    ]
  };

  // ===========================================================================
  // Trace / voorspel-de-output — de laatste afgedrukte index (off-by-one).
  //   for (int i = 0; i < size(); i++) print(i): de laatste i is size() min één.
  //   De seed kiest het aantal voorwerpen.
  // ===========================================================================
  var trace = {
    id: "l6-trace",
    type: "trace",
    pool: [3, 5, 7],
    label: "l6-trace",
    verwacht: function (n) { return String(n - 1); },
    vraag: S.l6.trace.vraag,
    ok: S.l6.trace.ok,
    fout: S.l6.trace.fout
  };

  // ===========================================================================
  // Vind-de-fout — een Gevecht-achtige rondelus met de verkeerde grens.
  //   'ronde <= 5' speelt zes rondes waar er vijf horen: één plank te ver. Regel 1.
  // ===========================================================================
  var vindfout = {
    id: "l6-vindfout",
    type: "vindfout",
    regelnummer: 1,
    aanvaard: ["<=", "<", "off-by-one", "off by one", "een te ver", "één te ver",
      "te ver", "grens", "lusgrens", "zes rondes", "6 rondes", "vijf"],
    vraag: S.l6.vindfout.vraag,
    ok: S.l6.vindfout.ok,
    fout: S.l6.vindfout.fout
  };

  var definitie = {
    naam: S.l6.naam,
    puzzels: [editorRepair, trace, vindfout]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("6", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
