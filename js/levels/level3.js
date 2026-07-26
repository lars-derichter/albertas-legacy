// level3.js — "Level 3 — Voorwaarden: de deur op slot" (scharnier 3:
// voorwaarden — validatie, cascade, && / || / !). Herstelt
// Speler.setLevenspunten en raakt aan Gevecht. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): herstel de klemmende validatie, vind de && /
// || -fout in een Gevecht-achtige poortcheck, en voorspel de uitkomst van een
// validatie-cascade op een randwaarde.
//
// Het editor-fragment is een byte-getrouw uittreksel van
// seven-little-goats/src/Speler.java (setLevenspunten; tools/check-assets bewaakt
// de drift). De terminal-puzzels tonen Gevecht-achtige code als illustratie; ze
// lopen niet via de checker (checker-contract.md §"Niet-editor-puzzels"). De
// prose leeft in js/logic/strings.js (AL.strings.l3 en AL.strings.puzzelHints).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor — Speler.setLevenspunten: herstel de klem (twee grenzen).
  //   Modeloplossing byte-getrouw uit Speler.java. Twee beschadigde varianten:
  //     A) de ondergrens staat de verkeerde kant op  -> validatieKlem.verkeerdeRichting
  //     B) de bovengrens ontbreekt                     -> validatieKlem.onvolledig
  // ===========================================================================
  var klemModel =
"void setLevenspunten(int nieuweWaarde) {\n" +
"    if (nieuweWaarde < 0) {\n" +
"        nieuweWaarde = 0;\n" +
"    }\n" +
"    if (nieuweWaarde > MAX_LEVENSPUNTEN) {\n" +
"        nieuweWaarde = MAX_LEVENSPUNTEN;\n" +
"    }\n" +
"    this.levenspunten = nieuweWaarde;\n" +
"}\n";

  // De notitie noemt MAX_LEVENSPUNTEN bij naam. Dat is niet decoratief: in
  // variant B is het hele bovengrens-blok weggevallen, en dan staat de constante
  // nergens meer in het fragment. Zonder haar naam is de klem niet te herstellen
  // (de checker aanvaardt MAX_LEVENSPUNTEN of 20).
  var klemNotitie =
"// De waarde moet tussen twee randen blijven: nooit onder 0, nooit boven\n" +
"// MAX_LEVENSPUNTEN. Twee losse controles die de knikker naar binnen duwen\n" +
"// voor hij wordt opgeslagen. Aan één van de twee randen mankeert iets. — A.\n" +
"\n";

  var klemBovengrensBlok =
"    if (nieuweWaarde > MAX_LEVENSPUNTEN) {\n" +
"        nieuweWaarde = MAX_LEVENSPUNTEN;\n" +
"    }\n";

  var klemBeschadigdA = klemNotitie +
    klemModel.split("if (nieuweWaarde < 0) {").join("if (nieuweWaarde > 0) {");
  var klemBeschadigdB = klemNotitie +
    klemModel.split(klemBovengrensBlok).join("");

  var editorRepair = {
    id: "l3-editor-repair",
    type: "editor",
    bron: "Speler.java",
    titel: S.l3.repairTitel,
    shuffleLabel: "l3-editor-repair",
    varianten: [klemBeschadigdA, klemBeschadigdB],
    variantMeldingen: ["validatieKlem.verkeerdeRichting", "validatieKlem.onvolledig"],
    model: klemModel,
    checks: [
      { fn: "geenVerbodenConstructies", config: { methode: "setLevenspunten" },
        uit: "l3.clamp.geenVerboden" },
      { fn: "methodeSignatuur", config: { retour: "void", naam: "setLevenspunten", params: ["int"] },
        uit: "l3.clamp.signatuur" },
      { fn: "validatieKlem", config: { methode: "setLevenspunten", onder: "0", boven: ["MAX_LEVENSPUNTEN", "20"] },
        uit: "l3.clamp.klem" }
    ]
  };

  // ===========================================================================
  // Vind-de-fout — && versus || in een Gevecht-achtige poortcheck.
  //   De poort mag alleen open als de wolf verslagen is EN je de sleutel hebt;
  //   de code gebruikt || waar && hoort. Regel 1.
  // ===========================================================================
  var vindfout = {
    id: "l3-vindfout",
    type: "vindfout",
    regelnummer: 1,
    aanvaard: ["&&", "||", "en", "of", "allebei", "beide", "twee voorwaarden",
      "logische operator", "operator"],
    vraag: S.l3.vindfout.vraag,
    ok: S.l3.vindfout.ok,
    fout: S.l3.vindfout.fout
  };

  // ===========================================================================
  // Trace / voorspel-de-output — de validatie-cascade op een randwaarde.
  //   if (lp <= 0) verslagen; else if (lp < 10) gewond; else gezond.
  //   De seed kiest de randwaarde (0 en 10 zijn de valstrikken).
  // ===========================================================================
  var trace = {
    id: "l3-trace",
    type: "trace",
    pool: [0, 10, 5],
    label: "l3-trace",
    verwacht: function (n) {
      if (n <= 0) return "verslagen";
      if (n < 10) return "gewond";
      return "gezond";
    },
    vraag: S.l3.trace.vraag,
    ok: S.l3.trace.ok,
    fout: S.l3.trace.fout
  };

  var definitie = {
    naam: S.l3.naam,
    puzzels: [editorRepair, vindfout, trace]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("3", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
