// level2.js — "Level 2 — Signaturen: wat erin gaat, wat eruit komt" (scharnier
// 2: signaturen — return vs. void, attribuut / parameter / lokale variabele).
// Herstelt Speler. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): herstel de signaturen, orden een echte
// Speler-methode (Parsons), en voorspel de output van een scenario waarin een
// parameter een attribuut schaduwt (trace).
//
// De Java-fragmenten zijn byte-getrouwe uittreksels uit
// seven-little-goats/src/Speler.java (tools/check-assets bewaakt de drift). De
// Speler()-constructor en het aanvalskracht-veld blijven bewust weg: de puzzel
// gaat over de signaturen, en zo blijft elk lid byte-identiek aan de bron. De
// prose leeft in js/logic/strings.js (AL.strings.l2 en AL.strings.puzzelHints).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor — Speler: herstel de signaturen (return vs. void, parametertypes).
  //   Modeloplossing byte-getrouw uit Speler.java. Twee beschadigde varianten:
  //     A) een getter met returntype void   -> methodeSignatuur.verkeerdRetour
  //     B) een setter zonder parameter       -> methodeSignatuur.verkeerdeParams
  //   Beide javac-schoon (de checker herkent structuur, geen semantiek).
  // ===========================================================================
  var spelerModel =
"class Speler {\n" +
"\n" +
"    private final int MAX_LEVENSPUNTEN = 20;\n" +
"    private int levenspunten;\n" +
"    private ArrayList<Voorwerp> inventaris;\n" +
"\n" +
"    int getLevenspunten() {\n" +
"        return levenspunten;\n" +
"    }\n" +
"\n" +
"    void setLevenspunten(int nieuweWaarde) {\n" +
"        if (nieuweWaarde < 0) {\n" +
"            nieuweWaarde = 0;\n" +
"        }\n" +
"        if (nieuweWaarde > MAX_LEVENSPUNTEN) {\n" +
"            nieuweWaarde = MAX_LEVENSPUNTEN;\n" +
"        }\n" +
"        this.levenspunten = nieuweWaarde;\n" +
"    }\n" +
"\n" +
"    Voorwerp zoek(String gezochteNaam) {\n" +
"        for (int i = 0; i < inventaris.size(); i++) {\n" +
"            Voorwerp huidig = inventaris.get(i);\n" +
"            if (huidig.getNaam().equals(gezochteNaam)) {\n" +
"                return huidig;\n" +
"            }\n" +
"        }\n" +
"        return null;\n" +
"    }\n" +
"\n" +
"    boolean verwijder(String teVerwijderenNaam) {\n" +
"        for (int i = 0; i < inventaris.size(); i++) {\n" +
"            if (inventaris.get(i).getNaam().equals(teVerwijderenNaam)) {\n" +
"                inventaris.remove(i);\n" +
"                return true;\n" +
"            }\n" +
"        }\n" +
"        return false;\n" +
"    }\n" +
"}\n";

  // WP 48: de notitie is de koppentabel zelf, niet de anatomie van een
  // signatuur ("wat eruit komt staat vooraan, wat erin gaat tussen de haakjes"
  // — dat stond hier, en dat is de les). De vier koppen staan er wél, want de
  // spread is maar één keer te lezen (world.js zegt bij een tweede keer "Je hebt
  // dit fragment al") en de checker eist ze exact.
  var spelerNotitie =
"// De koppen van Speler heb ik zelf door elkaar gehaald en nooit rechtgezet.\n" +
"// getLevenspunten(): int. setLevenspunten(int): void. zoek(String):\n" +
"// Voorwerp. verwijder(String): boolean. — A.\n" +
"\n";

  var spelerBeschadigdA = spelerNotitie +
    spelerModel.split("int getLevenspunten() {").join("void getLevenspunten() {");
  var spelerBeschadigdB = spelerNotitie +
    spelerModel.split("void setLevenspunten(int nieuweWaarde) {")
               .join("void setLevenspunten() {");

  var editorRepair = {
    id: "l2-editor-repair",
    type: "editor",
    bron: "Speler.java",
    titel: S.l2.repairTitel,
    shuffleLabel: "l2-editor-repair",
    varianten: [spelerBeschadigdA, spelerBeschadigdB],
    variantMeldingen: ["methodeSignatuur.verkeerdRetour", "methodeSignatuur.verkeerdeParams"],
    model: spelerModel,
    checks: [
      { fn: "methodeSignatuur", config: { retour: "int", naam: "getLevenspunten", params: [] },
        uit: "l2.speler.getLevenspunten" },
      { fn: "methodeSignatuur", config: { retour: "void", naam: "setLevenspunten", params: ["int"] },
        uit: "l2.speler.setLevenspunten" },
      { fn: "methodeSignatuur", config: { retour: "Voorwerp", naam: "zoek", params: ["String"] },
        uit: "l2.speler.zoek" },
      { fn: "methodeSignatuur", config: { retour: "boolean", naam: "verwijder", params: ["String"] },
        uit: "l2.speler.verwijder" },
      { fn: "heeftReturn", config: { methode: "zoek" },
        uit: "l2.speler.zoekReturn" }
    ]
  };

  // ===========================================================================
  // Parsons — de zoeklus-methode van Speler ordenen (met de signatuurregel).
  //   De afleider geeft de PARAMETER terug in plaats van het gevonden object:
  //   een klassieke doos-verwarring van scharnier 2.
  // ===========================================================================
  var parsons = {
    id: "l2-parsons",
    type: "parsons",
    shuffleLabel: "l2-parsons",
    regels: [
      "Voorwerp zoek(String gezochteNaam) {",
      "    for (int i = 0; i < inventaris.size(); i++) {",
      "        Voorwerp huidig = inventaris.get(i);",
      "        if (huidig.getNaam().equals(gezochteNaam)) {",
      "            return huidig;",
      "        }",
      "    }",
      "    return null;",
      "}"
    ],
    distractors: [
      "            return gezochteNaam;"
    ],
    vraag: S.l2.parsons.vraag,
    ok: S.l2.parsons.ok,
    fout: S.l2.parsons.fout,
    foutAantal: S.l2.parsons.foutAantal
  };

  // ===========================================================================
  // Trace / voorspel-de-output — een parameter schaduwt een attribuut.
  //   toon(int levenspunten) drukt eerst de PARAMETER af (de dichtstbijzijnde
  //   doos), dan this.levenspunten (het ATTRIBUUT, vast op 20). De seed kiest de
  //   meegegeven waarde.
  // ===========================================================================
  var trace = {
    id: "l2-trace",
    type: "trace",
    pool: [3, 5, 7],
    label: "l2-trace",
    verwacht: function (n) { return String(n) + " 20"; },
    vraag: S.l2.trace.vraag,
    ok: S.l2.trace.ok,
    fout: S.l2.trace.fout
  };

  // De Parsons staat vóór de editor, en dat is de enige plaats waar hij kan
  // staan (WP 48b). Beide beschadigde varianten van het editor-fragment dragen
  // `zoek` ONGESCHONDEN, en die negen regels zijn — op één inspringniveau na —
  // woordelijk `parsons.regels` in de juiste volgorde. Zolang de editor eerst
  // kwam, kreeg de speler de oplossing van de Parsons cadeau. Andersom lekt er
  // niets: wie de stroken geordend heeft, ziet daarna een `zoek` die hij zelf
  // net gebouwd heeft, en de vier signatuur-checks van de editor gaan over de
  // koppen erboven. De regel staat in docs/levels-en-scharnieren.md,
  // §"Puzzelvolgorde binnen een level": wat de oplossing van een andere puzzel
  // tóónt, komt erná.
  var definitie = {
    naam: S.l2.naam,
    puzzels: [parsons, editorRepair, trace]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("2", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
