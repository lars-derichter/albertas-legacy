// javacsim.js — AL.checker.javacsim
//
// Laag 1 van de feedback (checker-contract.md §"Falen → feedback"): een
// gesimuleerde javac. Voor fouten die een échte compiler vóór het testen zou
// vangen (ontbrekende puntkomma, niet-gesloten accolade/haakje, niet-afgesloten
// string of commentaar, ontbrekend returntype, voor de hand liggende
// trefwoord-typefouten) produceert het een diagnose in authentieke javac-stijl,
// maar Nederlandstalig en mild:
//
//     Geitje.java:12: fout: ';' verwacht
//             this.naam = naam
//                             ^
//     → Elke opdracht sluit af met een puntkomma.
//     1 fout
//
// KRITIEK (contract §"De test-corpus"): javacsim mag NOOIT vals-positief zijn op
// een modeloplossing. De corpus-runner draait elke modeloplossing hierdoor en
// eist nul diagnoses. De heuristieken zijn daarom bewust conservatief.
//
// DOM-vrij; browser (AL.checker.javacsim) + Node (module.exports). Leunt op
// AL.checker.tokenizer.

globalThis.AL = globalThis.AL || {};
globalThis.AL.checker = globalThis.AL.checker || {};

(function () {

  // Curatie van veelgemaakte trefwoord-typefouten (Beslissing: het contract
  // noemt er geen; deze lijst is bewust klein en onwaarschijnlijk-als-identifier).
  var TYPOS = {
    "pubic": "public", "publi": "public", "privaat": "private",
    "statc": "static", "sttaic": "static",
    "vodi": "void", "viod": "void",
    "retrun": "return", "reutrn": "return", "retun": "return",
    "clas": "class", "calss": "class",
    "boolen": "boolean", "booleaan": "boolean",
    "sting": "String", "Strig": "String",
    "improt": "import", "imprt": "import",
    "whlie": "while", "wihle": "while",
    "flase": "false", "ture": "true",
    "itn": "int"
  };

  var MODIFIERS = { "public": 1, "private": 1, "protected": 1, "static": 1,
                    "final": 1, "abstract": 1, "synchronized": 1 };

  var STATEMENT_START = { "}": 1, "return": 1, "this": 1, "if": 1, "for": 1, "while": 1 };

  function isWaardeEinde(t) {
    if (!t) return false;
    if (t.soort === "identifier" || t.soort === "getal" ||
        t.soort === "string" || t.soort === "char") return true;
    if (t.tekst === ")" || t.tekst === "]") return true;
    if (t.soort === "trefwoord" &&
        (t.tekst === "true" || t.tekst === "false" || t.tekst === "null")) return true;
    return false;
  }

  // diagnose(bron, bestandsnaam) -> { diagnostics, tekst, aantal, ok }
  //   diagnostics: [ { regel, kolom, categorie, bericht, uitleg } ]
  //     categorie ∈ "string-open" | "commentaar-open" | "char-open"
  //               | "accolade" | "haakje" | "blok" | "puntkomma"
  //               | "returntype" | "typefout"
  //   tekst: de gerenderde javac-uitvoer als regels (voor de pc-terminal).
  function diagnose(bron, bestandsnaam) {
    bestandsnaam = bestandsnaam || "Onbekend.java";
    var tk = globalThis.AL.checker.tokenizer;
    var lex = tk.tokenize(bron);
    var tokens = lex.tokens;
    var diags = [];

    // 1) Lexicale fouten (niet-afgesloten string/char/commentaar).
    for (var a = 0; a < lex.fouten.length; a++) {
      var f = lex.fouten[a];
      if (f.soort === "string-open") {
        diags.push(mk(f.regel, f.kolom, "string-open", "niet-afgesloten string-literal",
          "Een tekst tussen \"\" moet op dezelfde regel sluiten."));
      } else if (f.soort === "char-open") {
        diags.push(mk(f.regel, f.kolom, "char-open", "niet-afgesloten char-literal",
          "Een teken tussen '' moet je meteen sluiten, bv. 'a'."));
      } else if (f.soort === "commentaar-open") {
        diags.push(mk(f.regel, f.kolom, "commentaar-open", "niet-afgesloten commentaarblok",
          "Een /* ... */-commentaar moet je met */ afsluiten."));
      }
    }

    // 2) Balans van () {} [].
    var bal = tk.balans(tokens);
    for (var b = 0; b < bal.fouten.length; b++) {
      var bf = bal.fouten[b];
      var teken = bf.verwacht || bf.gekregen;
      var bericht, uitleg;
      if (bf.type === "niet-gesloten") {
        bericht = "'" + bf.verwacht + "' verwacht";
        uitleg = uitlegBalans(bf.soort);
      } else if (bf.type === "niet-geopend") {
        bericht = "'" + bf.gekregen + "' zonder bijpassende opening";
        uitleg = uitlegBalans(bf.soort);
      } else {
        bericht = "'" + bf.verwacht + "' verwacht, maar '" + bf.gekregen + "' gevonden";
        uitleg = uitlegBalans(bf.soort);
      }
      diags.push(mk(bf.regel, bf.kolom, bf.soort, bericht, uitleg));
    }

    // 3) Ontbrekend returntype (conservatief: methode = kleine-letter-naam,
    //    geen enkele modifier/type ervoor; constructors (Hoofdletter) uitgesloten).
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.soort !== "identifier") continue;
      if (!tokens[i + 1] || tokens[i + 1].tekst !== "(") continue;
      // matchend )
      var j = i + 1, d = 0;
      for (; j < tokens.length; j++) {
        if (tokens[j].tekst === "(") d++;
        else if (tokens[j].tekst === ")") { d--; if (d === 0) break; }
      }
      if (j >= tokens.length) continue;
      if (!tokens[j + 1] || tokens[j + 1].tekst !== "{") continue; // geen decl
      // boundary -> naam
      var start = i;
      while (start > 0) {
        var pt = tokens[start - 1];
        if (pt.tekst === ";" || pt.tekst === "{" || pt.tekst === "}") break;
        start--;
      }
      var voor = tokens.slice(start, i);
      var eersteLetter = t.tekst[0];
      var isKlein = eersteLetter === eersteLetter.toLowerCase() && eersteLetter !== eersteLetter.toUpperCase();
      if (voor.length === 0 && isKlein) {
        diags.push(mk(t.regel, t.kolom, "returntype", "returntype vereist",
          "Een methode heeft een returntype nodig (bv. void, int, String)."));
      }
    }

    // 4) Ontbrekende puntkomma (conservatief): een waarde-einde direct gevolgd
    //    door een statement-start op een latere regel, zonder ; { } ertussen.
    for (var p = 1; p < tokens.length; p++) {
      var vorige = tokens[p - 1];
      var huidig = tokens[p];
      if (!isWaardeEinde(vorige)) continue;
      if (!STATEMENT_START[huidig.tekst]) continue;
      if (huidig.soort === "identifier") continue; // "return"/"this" zijn trefwoord/leesteken
      if (vorige.regel === huidig.regel) continue;  // alleen bij regeleinde
      diags.push(mk(vorige.regel, kolomNa(vorige), "puntkomma", "';' verwacht",
        "Elke opdracht sluit af met een puntkomma."));
    }

    // 5) Trefwoord-typefouten.
    for (var q = 0; q < tokens.length; q++) {
      var tt = tokens[q];
      if (tt.soort !== "identifier") continue;
      var sug = TYPOS[tt.tekst];
      if (sug) {
        diags.push(mk(tt.regel, tt.kolom, "typefout", "onbekend symbool: '" + tt.tekst + "'",
          "Bedoelde je '" + sug + "'?"));
      }
    }

    // Ordenen op positie en ontdubbelen.
    diags.sort(function (x, y) { return x.regel - y.regel || x.kolom - y.kolom; });
    diags = ontdubbel(diags);

    return {
      diagnostics: diags,
      tekst: render(diags, bron, bestandsnaam),
      aantal: diags.length,
      ok: diags.length === 0
    };
  }

  function mk(regel, kolom, categorie, bericht, uitleg) {
    return { regel: regel, kolom: kolom, categorie: categorie, bericht: bericht, uitleg: uitleg };
  }
  function kolomNa(token) {
    return token.kolom + String(token.tekst).length; // caret net na de waarde
  }
  function uitlegBalans(soort) {
    if (soort === "accolade") return "Elke '{' hoort een '}' te krijgen.";
    if (soort === "haakje") return "Elke '(' hoort een ')' te krijgen.";
    return "Elke '[' hoort een ']' te krijgen.";
  }
  function ontdubbel(diags) {
    var uit = [], zien = {};
    for (var i = 0; i < diags.length; i++) {
      var sleutel = diags[i].regel + ":" + diags[i].kolom + ":" + diags[i].categorie + ":" + diags[i].bericht;
      if (zien[sleutel]) continue;
      zien[sleutel] = 1;
      uit.push(diags[i]);
    }
    return uit;
  }

  // render: bouw de javac-stijl-uitvoer als regels.
  function render(diags, bron, bestandsnaam) {
    if (diags.length === 0) return [];
    var bronRegels = bron.split("\n");
    var uit = [];
    for (var i = 0; i < diags.length; i++) {
      var d = diags[i];
      uit.push(bestandsnaam + ":" + d.regel + ": fout: " + d.bericht);
      var regelTekst = bronRegels[d.regel - 1] !== undefined ? bronRegels[d.regel - 1] : "";
      uit.push(regelTekst);
      uit.push(caretRegel(regelTekst, d.kolom));
      if (d.uitleg) uit.push("→ " + d.uitleg);
    }
    uit.push(diags.length === 1 ? "1 fout" : diags.length + " fouten");
    return uit;
  }
  function caretRegel(regelTekst, kolom) {
    var voor = "";
    for (var i = 0; i < kolom - 1; i++) {
      voor += (regelTekst[i] === "\t") ? "\t" : " ";
    }
    return voor + "^";
  }

  var javacsim = { diagnose: diagnose, TYPOS: TYPOS };
  globalThis.AL.checker.javacsim = javacsim;
  if (typeof module !== "undefined") { module.exports = javacsim; }

})();
