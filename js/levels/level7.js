// level7.js — "Level 7 — De speurtocht en de dubbele pijl" (scharnier 7: zoeken +
// de dubbele pijl). Herstelt Spel.zoekGeitje en de endgame-keten
// (Spel.toonSchuilplaatsen). Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): schrijf de zoeklus die een Geitje of null
// teruggeeft, herstel de null-veilige getter-keten, en voorspel de uitkomst van
// een geketende getter (inclusief het null-geval).
//
// Level 7 telt twee editor-puzzels + één terminal-puzzel, de exacte vormenlijst
// uit de leveltabel volgend (net als level 1 die de 1+2-richtlijn overstijgt).
// Beide editor-fragmenten zijn byte-getrouwe uittreksels van
// seven-little-goats/src/Spel.java (tools/check-assets bewaakt de drift). De
// zoeklus-controle is SAMENGESTELD uit lusVorm + lusGrenzen + methodeSignatuur +
// heeftReturn (checker-contract.md §"zoeklus"). De prose leeft in
// js/logic/strings.js (AL.strings.l7 en AL.strings.puzzelHints).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor 1 — Spel.zoekGeitje: schrijf de zoeklus (geeft Geitje of null).
  //   Modeloplossing byte-getrouw uit Spel.java.
  // ===========================================================================
  var zoekModel =
"Geitje zoekGeitje(String gezochteNaam) {\n" +
"    for (int i = 0; i < geitjes.size(); i++) {\n" +
"        Geitje huidig = geitjes.get(i);\n" +
"        if (huidig.getNaam().equals(gezochteNaam)) {\n" +
"            return huidig;\n" +
"        }\n" +
"    }\n" +
"    return null;\n" +
"}\n";

  var zoekStub =
"// Alberta's notitie — zoekGeitje (de speurtocht):\n" +
"//   Ze roept een naam in het huisje en luistert de rij af tot er één\n" +
"//   antwoordt. Dat geitje geef je terug. Antwoordt er niemand, dan liep de\n" +
"//   speurtocht dood: null.\n" +
"\n" +
"Geitje zoekGeitje(String gezochteNaam) {\n" +
"    // schrijf hier je zoeklus\n" +
"}\n";

  var editorWrite = {
    id: "l7-editor-write",
    type: "editor",
    bron: "Spel.java",
    titel: S.l7.writeTitel,
    varianten: [zoekStub],
    model: zoekModel,
    checks: [
      { fn: "lusVorm", config: { methode: "zoekGeitje", soort: "for" },
        uit: "l7.zoek.lus" },
      { fn: "lusGrenzen", config: { methode: "zoekGeitje", vergelijk: "<", grensBevat: "size" },
        uit: "l7.zoek.grens" },
      { fn: "methodeSignatuur", config: { retour: "Geitje", naam: "zoekGeitje", params: ["String"] },
        uit: "l7.zoek.signatuur" },
      { fn: "heeftReturn", config: { methode: "zoekGeitje", retourVorm: "null" },
        uit: "l7.zoek.return" }
    ]
  };

  // ===========================================================================
  // Editor 2 — Spel.toonSchuilplaatsen: herstel de null-veilige getter-keten.
  //   Modeloplossing byte-getrouw uit Spel.java. Twee beschadigde varianten,
  //   beide javac-schoon:
  //     A) de null-controle vóór de tweede pijl ontbreekt -> aanroepKeten.nullCheckOntbreekt
  //     B) de keten mist een schakel (getKamer)           -> aanroepKeten.onvolledig
  // ===========================================================================
  var ketenModel =
"private void toonSchuilplaatsen() {\n" +
"    System.out.println(\"Het jongste geitje vertelt waar elk voortaan schuilt:\");\n" +
"    for (int i = 0; i < geitjes.size(); i++) {\n" +
"        Geitje geitje = geitjes.get(i);\n" +
"        Schuilplaats schuilplaats = geitje.getSchuilplaats();\n" +
"        if (schuilplaats == null) {\n" +
"            System.out.println(\"- \" + geitje.getNaam() + \": nog niet gevonden\");\n" +
"        } else {\n" +
"            System.out.println(\"- \" + geitje.getNaam() + \": \" + schuilplaats.getNaam()\n" +
"                    + \" (\" + schuilplaats.getKamer().getNaam() + \")\");\n" +
"        }\n" +
"    }\n" +
"}\n";

  var ketenNotitie =
"// Alberta's notitie — toonSchuilplaatsen (de dubbele pijl):\n" +
"//   Voor elk geitje volg je twee pijlen naar de kamernaam:\n" +
"//   schuilplaats.getKamer().getNaam(). Maar een geitje zonder schuilplaats\n" +
"//   heeft geen kamer om naar te wijzen: controleer eerst op null voor je de\n" +
"//   tweede pijl volgt.\n" +
"\n";

  var ketenBeschadigdA = ketenNotitie +
"private void toonSchuilplaatsen() {\n" +
"    for (int i = 0; i < geitjes.size(); i++) {\n" +
"        Geitje geitje = geitjes.get(i);\n" +
"        System.out.println(geitje.getSchuilplaats().getKamer().getNaam());\n" +
"    }\n" +
"}\n";
  var ketenBeschadigdB = ketenNotitie +
"private void toonSchuilplaatsen() {\n" +
"    for (int i = 0; i < geitjes.size(); i++) {\n" +
"        Geitje geitje = geitjes.get(i);\n" +
"        Schuilplaats schuilplaats = geitje.getSchuilplaats();\n" +
"        if (schuilplaats == null) { continue; }\n" +
"        System.out.println(schuilplaats.getNaam());\n" +
"    }\n" +
"}\n";

  var editorRepair = {
    id: "l7-editor-repair",
    type: "editor",
    bron: "Spel.java",
    titel: S.l7.repairTitel,
    shuffleLabel: "l7-editor-repair",
    varianten: [ketenBeschadigdA, ketenBeschadigdB],
    variantMeldingen: ["aanroepKeten.nullCheckOntbreekt", "aanroepKeten.onvolledig"],
    model: ketenModel,
    checks: [
      { fn: "aanroepKeten", config: { methode: "toonSchuilplaatsen",
          stappen: ["getSchuilplaats", "getKamer", "getNaam"], nullVeilig: true },
        uit: "l7.keten.keten" },
      { fn: "lusVorm", config: { methode: "toonSchuilplaatsen", soort: "for" },
        uit: "l7.keten.lus" }
    ]
  };

  // ===========================================================================
  // Trace / voorspel-de-output — de geketende getter, met het null-geval.
  //   Bij een geitje met schuilplaats volg je de dubbele pijl naar de kamernaam;
  //   bij een null-schuilplaats stopt de null-veilige keten op "nog niet
  //   gevonden". De seed kiest welk geitje aangeroepen wordt.
  // ===========================================================================
  var trace = {
    id: "l7-trace",
    type: "trace",
    pool: ["jongste", "broer"],
    label: "l7-trace",
    verwacht: function (wie) {
      return wie === "jongste" ? "Geitenhuisje" : "nog niet gevonden";
    },
    vraag: S.l7.trace.vraag,
    ok: S.l7.trace.ok,
    fout: S.l7.trace.fout
  };

  var definitie = {
    week: 6,
    naam: S.l7.naam,
    puzzels: [editorWrite, editorRepair, trace]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("7", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
