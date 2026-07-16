// tokenizer.js — AL.checker.tokenizer
//
// Zet Java-broncode om in een schone tokenstroom, bewust van strings en
// commentaar (zie checker-contract.md §"De tokenizer"). Trefwoorden binnen een
// string of commentaar tellen nooit als code. Elk token draagt zijn soort, zijn
// tekst en zijn positie (regel + kolom, 1-gebaseerd) zodat een gesimuleerde
// javac-diagnose naar de juiste plek kan wijzen.
//
// Levert daarnaast:
//   - balans(tokens): een accolade/haakje/blok-balanscontrole die per
//     onevenwicht een structurele fout teruggeeft (javacsim.js maakt er een
//     javac-stijl-melding van);
//   - splitStatements(tokens): een statement-splitter die een tokenreeks op
//     top-niveau `;` opdeelt (nuttig voor de asserties), lege statements en
//     overtollige puntkomma's negerend.
//
// DOM-vrij en Node-testbaar. Draait in de browser (AL.checker.tokenizer) en in
// Node (module.exports). Geen Java-grammatica: alleen een lexer plus balans.

globalThis.AL = globalThis.AL || {};
globalThis.AL.checker = globalThis.AL.checker || {};

(function () {

  // De trefwoorden die de cursus gebruikt. Een identifier die hierin staat,
  // krijgt soort "trefwoord"; de asserties leunen hierop (bv. `this`, `return`,
  // `if`, `for`, `new`, `null`).
  var TREFWOORDEN = {
    "abstract": 1, "assert": 1, "boolean": 1, "break": 1, "byte": 1,
    "case": 1, "catch": 1, "char": 1, "class": 1, "const": 1, "continue": 1,
    "default": 1, "do": 1, "double": 1, "else": 1, "enum": 1, "extends": 1,
    "final": 1, "finally": 1, "float": 1, "for": 1, "goto": 1, "if": 1,
    "implements": 1, "import": 1, "instanceof": 1, "int": 1, "interface": 1,
    "long": 1, "native": 1, "new": 1, "package": 1, "private": 1,
    "protected": 1, "public": 1, "return": 1, "short": 1, "static": 1,
    "strictfp": 1, "super": 1, "switch": 1, "synchronized": 1, "this": 1,
    "throw": 1, "throws": 1, "transient": 1, "try": 1, "void": 1,
    "volatile": 1, "while": 1,
    // Java-9+-contextueel, maar de cursus verbiedt ze: als trefwoord herkennen
    // zodat bevatNiet / geenVerbodenConstructies erop kan matchen.
    "var": 1,
    // Literals met trefwoord-status voor het matchen.
    "true": 1, "false": 1, "null": 1
  };

  // De leestekens (interpunctie). Alles wat hier niet in staat en geen letter/
  // cijfer/quote is, wordt als operator getokeniseerd.
  var LEESTEKENS = { "(": 1, ")": 1, "{": 1, "}": 1, "[": 1, "]": 1,
                     ";": 1, ",": 1, ".": 1 };

  // Meerkarakter-operatoren, langste eerst zodat `<=` niet als `<` + `=` breekt.
  var OPERATOREN_MULTI = [
    "->", "==", "!=", "<=", ">=", "&&", "||",
    "++", "--", "+=", "-=", "*=", "/=", "%="
  ];
  var OPERATOREN_ENKEL = {
    "=": 1, "+": 1, "-": 1, "*": 1, "/": 1, "%": 1, "!": 1,
    "<": 1, ">": 1, "&": 1, "|": 1, "?": 1, ":": 1
  };

  function isLetter(ch) {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") ||
           ch === "_" || ch === "$";
  }
  function isCijfer(ch) { return ch >= "0" && ch <= "9"; }
  function isIdStart(ch) { return isLetter(ch); }
  function isIdVervolg(ch) { return isLetter(ch) || isCijfer(ch); }

  // tokenize(bron) -> { tokens, fouten }
  //   tokens: [ { soort, tekst, regel, kolom } ]
  //     soort ∈ "trefwoord" | "identifier" | "getal" | "string" | "char"
  //            | "operator" | "leesteken"
  //   fouten: lexicale fouten (niet-gesloten string of commentaar):
  //     [ { soort: "string-open"|"char-open"|"commentaar-open", regel, kolom } ]
  function tokenize(bron) {
    var tokens = [];
    var fouten = [];
    var i = 0;
    var n = bron.length;
    var regel = 1;
    var kolom = 1;

    function vooruit() {
      var ch = bron[i];
      i++;
      if (ch === "\n") { regel++; kolom = 1; } else { kolom++; }
      return ch;
    }

    while (i < n) {
      var ch = bron[i];

      // Whitespace overslaan (posities bijhouden).
      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
        vooruit();
        continue;
      }

      // Commentaar.
      if (ch === "/" && bron[i + 1] === "/") {
        // Regelcommentaar tot regeleinde.
        while (i < n && bron[i] !== "\n") { vooruit(); }
        continue;
      }
      if (ch === "/" && bron[i + 1] === "*") {
        var cRegel = regel, cKolom = kolom;
        vooruit(); vooruit(); // consumeer /*
        var gesloten = false;
        while (i < n) {
          if (bron[i] === "*" && bron[i + 1] === "/") {
            vooruit(); vooruit();
            gesloten = true;
            break;
          }
          vooruit();
        }
        if (!gesloten) {
          fouten.push({ soort: "commentaar-open", regel: cRegel, kolom: cKolom });
        }
        continue;
      }

      // String-literal.
      if (ch === "\"") {
        var sRegel = regel, sKolom = kolom;
        var sTekst = "";
        vooruit(); // openende "
        var sGesloten = false;
        while (i < n) {
          var c = bron[i];
          if (c === "\\") {
            sTekst += vooruit();      // backslash
            if (i < n) sTekst += vooruit(); // ontsnapte teken
            continue;
          }
          if (c === "\"") { vooruit(); sGesloten = true; break; }
          if (c === "\n") { break; } // strings lopen niet over regels heen
          sTekst += vooruit();
        }
        if (!sGesloten) {
          fouten.push({ soort: "string-open", regel: sRegel, kolom: sKolom });
        }
        tokens.push({ soort: "string", tekst: sTekst, regel: sRegel, kolom: sKolom });
        continue;
      }

      // Char-literal.
      if (ch === "'") {
        var chRegel = regel, chKolom = kolom;
        var chTekst = "";
        vooruit(); // openende '
        var chGesloten = false;
        while (i < n) {
          var cc = bron[i];
          if (cc === "\\") {
            chTekst += vooruit();
            if (i < n) chTekst += vooruit();
            continue;
          }
          if (cc === "'") { vooruit(); chGesloten = true; break; }
          if (cc === "\n") { break; }
          chTekst += vooruit();
        }
        if (!chGesloten) {
          fouten.push({ soort: "char-open", regel: chRegel, kolom: chKolom });
        }
        tokens.push({ soort: "char", tekst: chTekst, regel: chRegel, kolom: chKolom });
        continue;
      }

      // Getal (geheel of decimaal, met optioneel achtervoegsel f/d/L).
      if (isCijfer(ch) || (ch === "." && isCijfer(bron[i + 1]))) {
        var gRegel = regel, gKolom = kolom;
        var gTekst = "";
        while (i < n && (isCijfer(bron[i]) || bron[i] === ".")) { gTekst += vooruit(); }
        // achtervoegsel
        if (i < n && "fFdDlL".indexOf(bron[i]) >= 0) { gTekst += vooruit(); }
        tokens.push({ soort: "getal", tekst: gTekst, regel: gRegel, kolom: gKolom });
        continue;
      }

      // Identifier of trefwoord.
      if (isIdStart(ch)) {
        var iRegel = regel, iKolom = kolom;
        var iTekst = "";
        while (i < n && isIdVervolg(bron[i])) { iTekst += vooruit(); }
        tokens.push({
          soort: TREFWOORDEN[iTekst] ? "trefwoord" : "identifier",
          tekst: iTekst, regel: iRegel, kolom: iKolom
        });
        continue;
      }

      // Leesteken.
      if (LEESTEKENS[ch]) {
        tokens.push({ soort: "leesteken", tekst: ch, regel: regel, kolom: kolom });
        vooruit();
        continue;
      }

      // Meerkarakter-operator?
      var tweeg = bron.substr(i, 2);
      var gevonden = null;
      for (var k = 0; k < OPERATOREN_MULTI.length; k++) {
        if (OPERATOREN_MULTI[k] === tweeg) { gevonden = tweeg; break; }
      }
      if (gevonden) {
        tokens.push({ soort: "operator", tekst: gevonden, regel: regel, kolom: kolom });
        vooruit(); vooruit();
        continue;
      }

      // Enkelvoudige operator.
      if (OPERATOREN_ENKEL[ch]) {
        tokens.push({ soort: "operator", tekst: ch, regel: regel, kolom: kolom });
        vooruit();
        continue;
      }

      // Onbekend teken: sla over (robuust blijven), maar noteer geen fout —
      // de checker herkent structuur, geen exotische invoer.
      vooruit();
    }

    return { tokens: tokens, fouten: fouten };
  }

  // balans(tokens) -> { ok, fouten }
  //   Controleert dat (), {}, [] netjes gepaard en genest zijn.
  //   fouten: [ { soort: "haakje"|"accolade"|"blok",
  //              type: "niet-gesloten"|"niet-geopend"|"verkeerd-gesloten",
  //              verwacht, gekregen, regel, kolom } ]
  function balans(tokens) {
    var paren = { "(": ")", "{": "}", "[": "]" };
    var soortVan = { "(": "haakje", ")": "haakje",
                     "{": "accolade", "}": "accolade",
                     "[": "blok", "]": "blok" };
    var stapel = [];
    var fouten = [];

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.soort !== "leesteken") continue;
      if (t.tekst === "(" || t.tekst === "{" || t.tekst === "[") {
        stapel.push(t);
      } else if (t.tekst === ")" || t.tekst === "}" || t.tekst === "]") {
        if (stapel.length === 0) {
          fouten.push({
            soort: soortVan[t.tekst], type: "niet-geopend",
            verwacht: null, gekregen: t.tekst, regel: t.regel, kolom: t.kolom
          });
          continue;
        }
        var open = stapel.pop();
        if (paren[open.tekst] !== t.tekst) {
          fouten.push({
            soort: soortVan[t.tekst], type: "verkeerd-gesloten",
            verwacht: paren[open.tekst], gekregen: t.tekst,
            regel: t.regel, kolom: t.kolom
          });
        }
      }
    }
    // Wat open bleef staan.
    for (var j = stapel.length - 1; j >= 0; j--) {
      var o = stapel[j];
      fouten.push({
        soort: soortVan[o.tekst], type: "niet-gesloten",
        verwacht: paren[o.tekst], gekregen: null,
        regel: o.regel, kolom: o.kolom
      });
    }
    return { ok: fouten.length === 0, fouten: fouten };
  }

  // splitStatements(tokens) -> [ [tokens], ... ]
  //   Deelt een tokenreeks op in statements op de `;` op diepte 0 (buiten
  //   haakjes/accolades). Lege statements en overtollige puntkomma's vallen weg.
  //   Een blok `{ ... }` op diepte 0 blijft als één "statement" bewaard (de
  //   asserties splitsen desgewenst zelf verder).
  function splitStatements(tokens) {
    var uit = [];
    var huidig = [];
    var diepte = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.soort === "leesteken" && (t.tekst === "(" || t.tekst === "{" || t.tekst === "[")) {
        diepte++;
        huidig.push(t);
        continue;
      }
      if (t.soort === "leesteken" && (t.tekst === ")" || t.tekst === "}" || t.tekst === "]")) {
        diepte--;
        huidig.push(t);
        continue;
      }
      if (t.soort === "leesteken" && t.tekst === ";" && diepte === 0) {
        if (huidig.length > 0) uit.push(huidig);
        huidig = [];
        continue;
      }
      huidig.push(t);
    }
    if (huidig.length > 0) uit.push(huidig);
    return uit;
  }

  // Kleine hulp: platte tekst van een tokenreeks (voor debug/diagnose).
  function tekstVan(tokens) {
    return tokens.map(function (t) { return t.tekst; }).join(" ");
  }

  var tokenizer = {
    tokenize: tokenize,
    balans: balans,
    splitStatements: splitStatements,
    tekstVan: tekstVan,
    TREFWOORDEN: TREFWOORDEN
  };

  globalThis.AL.checker.tokenizer = tokenizer;
  if (typeof module !== "undefined") { module.exports = tokenizer; }

})();
