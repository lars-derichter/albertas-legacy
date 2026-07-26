// level5.js — "Level 5 — Luspatronen: geitje voor geitje" (scharnier 5: de
// lus-romp + patroonkeuze — tellen, totaliseren, opbouwen, filteren, uiterste).
// Herstelt de lus-methoden van Speler. Puzzelvormen uit de leveltabel
// (docs/levels-en-scharnieren.md): schrijf twee lussen uit de notities, orden
// een string-builder (Parsons), en kies de juiste patroonkaart.
//
// Beslissing (level-5-special-case, zie het werkpakket + checker-contract.md
// §"lusRomp"): de kolom "herstelt" vraagt generieke lus-methoden die nog niet
// bestonden. WP 8 voegt daarom twee ECHTE, cursus-gebonden methoden toe aan
// seven-little-goats/src/Speler.java — telWapens() (de tel-kaart) en
// sterksteVoorwerp() (de uiterste-kaart) — die ook echt in het spel gebruikt
// worden (Spel.toonStats). Dit editor-fragment is hun byte-getrouwe modeloplossing
// (tools/check-assets bewaakt de drift). De lus-controle is SAMENGESTELD uit
// bestaande asserties (lusVorm + lusGrenzen + heeftReturn + methodeSignatuur),
// niet uit een nieuwe patroonkaart-classifier — precies zoals het contract vraagt.
//
// De "schrijf 2 lussen"-opgave is één editor-puzzel met beide methoden, zodat de
// mix één editor + twee terminal blijft (docs/levels-en-scharnieren.md,
// §"Tijdsbudget"). De prose leeft in js/logic/strings.js (AL.strings.l5 e.a.).
//
// Draait in de browser (registreert bij AL.levels) en in Node (module.exports).

globalThis.AL = globalThis.AL || {};

(function () {

  var S = globalThis.AL.strings;

  // ===========================================================================
  // Editor — Speler: schrijf de twee lus-methoden (van nul).
  //   telWapens()        — de tel-kaart (teller die ophoogt bij een treffer).
  //   sterksteVoorwerp() — de uiterste-kaart (onthoud de beste tot nog toe).
  //   Modeloplossing byte-getrouw uit Speler.java.
  // ===========================================================================
  var lusModel =
"class Speler {\n" +
"\n" +
"    int telWapens() {\n" +
"        int aantal = 0;\n" +
"        for (int i = 0; i < inventaris.size(); i++) {\n" +
"            if (inventaris.get(i).getKracht() > 0) {\n" +
"                aantal++;\n" +
"            }\n" +
"        }\n" +
"        return aantal;\n" +
"    }\n" +
"\n" +
"    Voorwerp sterksteVoorwerp() {\n" +
"        Voorwerp sterkste = null;\n" +
"        for (int i = 0; i < inventaris.size(); i++) {\n" +
"            Voorwerp huidig = inventaris.get(i);\n" +
"            if (sterkste == null || huidig.getKracht() > sterkste.getKracht()) {\n" +
"                sterkste = huidig;\n" +
"            }\n" +
"        }\n" +
"        return sterkste;\n" +
"    }\n" +
"}\n";

  // De typewoorden `int` en `Voorwerp` blijven in de notitie staan (beslissing
  // van WP 30): de stub geeft geen signaturen en de checker eist ze exact, dus
  // zonder die twee woorden is de puzzel vanuit de notitie niet oplosbaar.
  //
  // WP 48 haalt de kaart-woordenschat eruit ("zoekt het uiterste", "andere
  // kaart erop"): de patroontaxonomie is precies wat de derde puzzel van dit
  // level vraagt, en ze in de kantlijn zetten is het antwoord voorzeggen. De
  // lusvorm (for over inventaris) staat er nu wél bij — dat is spec, geen les,
  // en de checker eist hem (lusVorm + lusGrenzen).
  var lusStub =
"// Twee methoden erbij, rompen nog leeg. telWapens(): int — hoeveel voorwerpen\n" +
"// in de inventaris kracht boven 0 hebben. sterksteVoorwerp(): Voorwerp — het\n" +
"// voorwerp met de grootste kracht, of null bij een lege inventaris. Allebei\n" +
"// een for-lus over inventaris, i < inventaris.size(). — A.\n" +
"\n" +
"class Speler {\n" +
"\n" +
"    // hier verder\n" +
"\n" +
"}\n";

  var editorWrite = {
    id: "l5-editor-write",
    type: "editor",
    bron: "Speler.java",
    titel: S.l5.writeTitel,
    varianten: [lusStub],
    model: lusModel,
    checks: [
      { fn: "geenVerbodenConstructies", config: {},
        uit: "l5.lus.geenVerboden" },
      { fn: "methodeSignatuur", config: { retour: "int", naam: "telWapens", params: [] },
        uit: "l5.lus.telSignatuur" },
      { fn: "lusVorm", config: { methode: "telWapens", soort: "for" },
        uit: "l5.lus.telLus" },
      { fn: "lusGrenzen", config: { methode: "telWapens", vergelijk: "<", grensBevat: "size" },
        uit: "l5.lus.telGrens" },
      { fn: "heeftReturn", config: { methode: "telWapens" },
        uit: "l5.lus.telReturn" },
      { fn: "methodeSignatuur", config: { retour: "Voorwerp", naam: "sterksteVoorwerp", params: [] },
        uit: "l5.lus.sterkSignatuur" },
      { fn: "lusVorm", config: { methode: "sterksteVoorwerp", soort: "for" },
        uit: "l5.lus.sterkLus" },
      { fn: "lusGrenzen", config: { methode: "sterksteVoorwerp", vergelijk: "<", grensBevat: "size" },
        uit: "l5.lus.sterkGrens" },
      { fn: "heeftReturn", config: { methode: "sterksteVoorwerp" },
        uit: "l5.lus.sterkReturn" }
    ]
  };

  // ===========================================================================
  // Parsons — de string-builder (de opbouw-kaart). Byte-echt uit Spel.java
  //   (toonVoorwerpenInKamer): bouw de kamer-regel stuk voor stuk op. De afleider
  //   OVERSCHRIJFT de regel in plaats van eraan toe te voegen — de klassieke
  //   opbouw-fout (toewijzing i.p.v. accumulatie).
  // ===========================================================================
  var parsons = {
    id: "l5-parsons",
    type: "parsons",
    shuffleLabel: "l5-parsons",
    regels: [
      "String regel = \"Je kan hier meenemen: \";",
      "for (int i = 0; i < hier.size(); i++) {",
      "    if (i > 0) {",
      "        regel = regel + \", \";",
      "    }",
      "    regel = regel + hier.get(i).getNaam();",
      "}",
      "System.out.println(regel);"
    ],
    distractors: [
      "    regel = hier.get(i).getNaam();"
    ],
    vraag: S.l5.parsons.vraag,
    ok: S.l5.parsons.ok,
    fout: S.l5.parsons.fout,
    foutAantal: S.l5.parsons.foutAantal
  };

  // ===========================================================================
  // Welke-patroonkaart — de totaliseer-lus uit het schade-overzicht (Gevecht).
  //   De valstrik is 'tellen': de lus telt de WAARDE op, niet één per element.
  // ===========================================================================
  var patroonkaart = {
    id: "l5-patroonkaart",
    type: "patroonkaart",
    antwoord: 2,
    vraag: S.l5.patroonkaart.vraag,
    opties: S.l5.patroonkaart.opties,
    ok: S.l5.patroonkaart.ok,
    fout: S.l5.patroonkaart.fout
  };

  var definitie = {
    naam: S.l5.naam,
    puzzels: [editorWrite, parsons, patroonkaart]
  };

  var isNode = (typeof module !== "undefined" && module.exports);
  if (globalThis.AL.levels) {
    globalThis.AL.levels.registreer("5", definitie);
  }
  if (isNode) { module.exports = definitie; }

})();
