// asserts.js — AL.checker.asserts
//
// De structurele assertie-bibliotheek (checker-contract.md §"De assertie-
// woordenlijst"). Elke assertie neemt een tokenreeks (uit
// AL.checker.tokenizer.tokenize(...).tokens) plus config, en geeft een uniforme
// vorm terug:
//
//     { ok: boolean, meldingKey: string|null, regel: number|null }
//
// meldingKey is een STABIELE sleutel, geen prose. De vriendelijke Nederlandse
// feedbacktekst leeft in js/logic/strings.js (contract: nooit inline in de
// checker). De level-WP's mappen meldingKey -> tekst.
//
// De asserties werken op de genormaliseerde tokenstroom: whitespace en
// commentaar zijn er al uit; volgorde en operatoren blijven betekenisvol
// (`<` ≠ `<=`, `&&` ≠ `||`). Waar een assertie op één methode moet werken,
// geeft config `methode: "<naam>"` en snijdt de assertie eerst de body eruit.
//
// Meldingsleutels (overzicht, voor de corpus en de level-WP's):
//   veldDeclaratie.ontbreekt | veldDeclaratie.nietPrivate
//   constructorSignatuur.ontbreekt | constructorSignatuur.verkeerdeParams
//   constructorToewijzing.ontbreekt | constructorToewijzing.omgekeerd
//   methodeSignatuur.ontbreekt | .verkeerdRetour | .verkeerdeParams | .verkeerdeZichtbaarheid
//   heeftReturn.ontbreekt | heeftReturn.verkeerdeVorm | heeftReturn.methodeOntbreekt
//   conditie.operatorOntbreekt | conditie.verkeerdeOperator | conditie.methodeOntbreekt
//   validatieKlem.onvolledig | validatieKlem.verkeerdeRichting | validatieKlem.methodeOntbreekt
//   lusVorm.ontbreekt | lusVorm.verkeerdeSoort | lusVorm.methodeOntbreekt
//   lusGrenzen.ontbreekt | lusGrenzen.offByOne | lusGrenzen.verkeerdeGrens | lusGrenzen.methodeOntbreekt
//   aanroepKeten.onvolledig | aanroepKeten.nullCheckOntbreekt | aanroepKeten.nietAaneengesloten
//   methodeAanroep.ontbreekt | methodeAanroep.methodeOntbreekt
//   verboden.switch | verboden.enum | verboden.lambda | verboden.ternary | verboden.var | verboden.stream
//
// DOM-vrij; browser (AL.checker.asserts) + Node (module.exports).

globalThis.AL = globalThis.AL || {};
globalThis.AL.checker = globalThis.AL.checker || {};

(function () {

  var MODIFIERS = { "public": 1, "private": 1, "protected": 1, "static": 1,
                    "final": 1, "abstract": 1, "synchronized": 1, "native": 1,
                    "transient": 1, "volatile": 1, "strictfp": 1, "default": 1 };

  // ---- uniforme resultaten -------------------------------------------------
  function ok() { return { ok: true, meldingKey: null, regel: null }; }
  function fout(key, regel) {
    return { ok: false, meldingKey: key, regel: (regel === undefined ? null : regel) };
  }

  // ---- tokenreeks-hulp -----------------------------------------------------
  function norm(s) { return String(s).replace(/\s+/g, ""); }

  function tekstReeks(tokens) {
    return tokens.map(function (t) { return t.tekst; }).join("");
  }

  // matchElement: patroon-element vs token.
  //   "@id"    -> elke identifier
  //   "@ident" -> identifier of trefwoord
  //   "@any"   -> elk token
  //   anders   -> letterlijke tekstmatch
  function matchElement(token, el) {
    if (el === "@id") return token.soort === "identifier";
    if (el === "@ident") return token.soort === "identifier" || token.soort === "trefwoord";
    if (el === "@any") return true;
    return token.tekst === el;
  }

  // zoekReeks: eerste aaneengesloten match van patroon vanaf `van`.
  function zoekReeks(tokens, patroon, van) {
    van = van || 0;
    for (var i = van; i + patroon.length <= tokens.length; i++) {
      var okMatch = true, caps = [];
      for (var j = 0; j < patroon.length; j++) {
        if (!matchElement(tokens[i + j], patroon[j])) { okMatch = false; break; }
        if (typeof patroon[j] === "string" && patroon[j][0] === "@") caps.push(tokens[i + j]);
      }
      if (okMatch) return { index: i, eind: i + patroon.length, caps: caps, regel: tokens[i].regel };
    }
    return null;
  }
  function bevat(tokens, patroon) { return zoekReeks(tokens, patroon) !== null; }

  // splitOp: splits een tokenreeks op top-niveau `sep` (tekst).
  function splitOp(tokens, sep) {
    var parts = [], cur = [], d = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if ("({[".indexOf(t.tekst) >= 0 && t.soort === "leesteken") d++;
      else if (")}]".indexOf(t.tekst) >= 0 && t.soort === "leesteken") d--;
      if (t.tekst === sep && d === 0) { parts.push(cur); cur = []; continue; }
      cur.push(t);
    }
    parts.push(cur);
    return parts;
  }

  // ---- methode/constructor lokaliseren -------------------------------------
  // Zoekt ALLE methode-/constructordeclaraties met naam `naam`: een identifier/
  // trefwoord `naam` gevolgd door `( ... )` en dan `{`. Geeft body (tussen { }),
  // params (tussen ( )), en `voor` (modifiers + returntype ervoor).
  function vindAlle(tokens, naam) {
    var res = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if ((t.soort === "identifier" || t.soort === "trefwoord") && t.tekst === naam &&
          tokens[i + 1] && tokens[i + 1].tekst === "(") {
        // matchend )
        var j = i + 1, d = 0;
        for (; j < tokens.length; j++) {
          if (tokens[j].tekst === "(") d++;
          else if (tokens[j].tekst === ")") { d--; if (d === 0) break; }
        }
        if (j >= tokens.length) continue;
        var params = tokens.slice(i + 2, j);
        var k = j + 1;
        if (!tokens[k] || tokens[k].tekst !== "{") continue; // aanroep, geen declaratie
        var bd = 0, m = k;
        for (; m < tokens.length; m++) {
          if (tokens[m].tekst === "{") bd++;
          else if (tokens[m].tekst === "}") { bd--; if (bd === 0) break; }
        }
        var body = tokens.slice(k + 1, m);
        // voor: van vorige grens (; { }) tot naam
        var start = i;
        while (start > 0) {
          var pt = tokens[start - 1];
          if (pt.tekst === ";" || pt.tekst === "{" || pt.tekst === "}") break;
          start--;
        }
        var voor = tokens.slice(start, i);
        res.push({ naamToken: t, params: params, body: body, voor: voor, regel: t.regel });
      }
    }
    return res;
  }
  function vindMethode(tokens, naam) {
    var alle = vindAlle(tokens, naam);
    return alle.length ? alle[0] : null;
  }

  // De body waarop een assertie werkt: één methode of de hele reeks.
  function bodyVan(tokens, methode) {
    if (!methode) return tokens;
    var m = vindMethode(tokens, methode);
    return m ? m.body : null;
  }

  // paramTypes: types van een parameterlijst (tokens tussen de haakjes).
  //   "String naam, int kracht" -> ["String", "int"]
  //   "ArrayList<Voorwerp> lijst" -> ["ArrayList<Voorwerp>"]
  function paramTypes(paramsTokens) {
    if (paramsTokens.length === 0) return [];
    var delen = splitOp(paramsTokens, ",");
    var types = [];
    for (var i = 0; i < delen.length; i++) {
      var d = delen[i];
      if (d.length === 0) continue;
      // laatste token is de parameternaam; ervoor staat het type (kan generiek)
      var typeTokens = d.slice(0, d.length - 1);
      types.push(norm(tekstReeks(typeTokens)));
    }
    return types;
  }

  // retourType: uit de `voor`-tokens (modifiers weg).
  function retourType(voorTokens) {
    var rest = voorTokens.filter(function (t) { return !MODIFIERS[t.tekst]; });
    return norm(tekstReeks(rest));
  }
  function zichtbaarheidVan(voorTokens) {
    for (var i = 0; i < voorTokens.length; i++) {
      var x = voorTokens[i].tekst;
      if (x === "public" || x === "private" || x === "protected") return x;
    }
    return "package"; // package-private (geen modifier)
  }

  // parseIfs: alle if-statements binnen een body (conditie + romp).
  function parseIfs(tokens) {
    var res = [];
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].soort === "trefwoord" && tokens[i].tekst === "if" &&
          tokens[i + 1] && tokens[i + 1].tekst === "(") {
        var j = i + 1, d = 0;
        for (; j < tokens.length; j++) {
          if (tokens[j].tekst === "(") d++;
          else if (tokens[j].tekst === ")") { d--; if (d === 0) break; }
        }
        var cond = tokens.slice(i + 2, j);
        var k = j + 1, romp = [];
        if (tokens[k] && tokens[k].tekst === "{") {
          var bd = 0, m = k;
          for (; m < tokens.length; m++) {
            if (tokens[m].tekst === "{") bd++;
            else if (tokens[m].tekst === "}") { bd--; if (bd === 0) break; }
          }
          romp = tokens.slice(k + 1, m);
        } else {
          var m2 = k;
          while (m2 < tokens.length && tokens[m2].tekst !== ";") m2++;
          romp = tokens.slice(k, m2);
        }
        res.push({ conditie: cond, romp: romp, regel: tokens[i].regel });
      }
    }
    return res;
  }

  function vergelijkOp(cond) {
    for (var i = 0; i < cond.length; i++) {
      var x = cond[i].tekst;
      if (x === "<" || x === "<=" || x === ">" || x === ">=") return { op: x, idx: i };
    }
    return null;
  }
  function toewijzingRHS(romp) {
    for (var i = 0; i < romp.length; i++) {
      if (romp[i].tekst === "=" && romp[i].soort === "operator") {
        var rhs = [];
        for (var j = i + 1; j < romp.length && romp[j].tekst !== ";"; j++) rhs.push(romp[j].tekst);
        return rhs.join("");
      }
    }
    return null;
  }
  function bevatWaarde(cfgWaarde, tekst) {
    var lijst = Array.isArray(cfgWaarde) ? cfgWaarde : [cfgWaarde];
    return lijst.some(function (w) { return norm(w) === norm(tekst); });
  }

  // === De asserties =========================================================

  // veldDeclaratie({ type, naam, privaat? })
  //   Zoekt `[modifiers] <type> <naam> ;` (of `= ...`). private optioneel/
  //   tolerant, tenzij privaat===true.
  function veldDeclaratie(tokens, cfg) {
    var typeTokens = require_tokenize(cfg.type);
    // patroon: type... naam ( ; | = )
    for (var i = 0; i < tokens.length; i++) {
      // match type-tokens
      var okType = true;
      for (var j = 0; j < typeTokens.length; j++) {
        if (!tokens[i + j] || tokens[i + j].tekst !== typeTokens[j]) { okType = false; break; }
      }
      if (!okType) continue;
      var na = i + typeTokens.length;
      if (!tokens[na] || tokens[na].tekst !== cfg.naam) continue;
      var na2 = tokens[na + 1];
      if (!na2 || (na2.tekst !== ";" && na2.tekst !== "=")) continue;
      // gevonden — check private indien vereist
      if (cfg.privaat) {
        var start = i;
        while (start > 0) {
          var pt = tokens[start - 1];
          if (pt.tekst === ";" || pt.tekst === "{" || pt.tekst === "}") break;
          start--;
        }
        var mods = tokens.slice(start, i).map(function (t) { return t.tekst; });
        if (mods.indexOf("private") < 0) return fout("veldDeclaratie.nietPrivate", tokens[i].regel);
      }
      return ok();
    }
    return fout("veldDeclaratie.ontbreekt", null);
  }

  // constructorSignatuur({ naam, params:[types] })
  function constructorSignatuur(tokens, cfg) {
    var alle = vindAlle(tokens, cfg.naam);
    if (alle.length === 0) return fout("constructorSignatuur.ontbreekt", null);
    var wens = (cfg.params || []).map(norm);
    for (var i = 0; i < alle.length; i++) {
      var got = paramTypes(alle[i].params);
      if (got.length === wens.length && got.every(function (t, k) { return t === wens[k]; })) {
        return ok();
      }
    }
    return fout("constructorSignatuur.verkeerdeParams", alle[0].regel);
  }

  // constructorToewijzing({ veld, param?, klasse? })
  //   Verwacht `this.<veld> = <param>;` (param tolerant als niet opgegeven).
  //   Herkent de omgekeerde fout `<param> = this.<veld>`.
  function constructorToewijzing(tokens, cfg) {
    var scope = tokens;
    if (cfg.klasse) {
      var c = vindMethode(tokens, cfg.klasse);
      if (c) scope = c.body;
    }
    // correcte richting
    var patroon = ["this", ".", cfg.veld, "="];
    var m = zoekReeks(scope, patroon);
    if (m) {
      // RHS = eerstvolgende token
      var rhs = scope[m.eind];
      if (!cfg.param || (rhs && rhs.tekst === cfg.param)) return ok();
      // this.veld = <iets anders>: als param verplicht en niet gematcht, tolerant
      // aanvaarden zolang het een identifier is (lokale naam mag afwijken)?
      // Contract: this.veld = parameter; naam van de parameter is los tenzij
      // expliciet gevraagd. Standaard tolerant:
      if (rhs && rhs.soort === "identifier") return ok();
      return fout("constructorToewijzing.ontbreekt", m.regel);
    }
    // omgekeerde fout: = this . veld
    var omg = zoekReeks(scope, ["=", "this", ".", cfg.veld]);
    if (omg) return fout("constructorToewijzing.omgekeerd", omg.regel);
    return fout("constructorToewijzing.ontbreekt", null);
  }

  // methodeSignatuur({ zichtbaarheid?, retour, naam, params:[types] })
  function methodeSignatuur(tokens, cfg) {
    var alle = vindAlle(tokens, cfg.naam);
    if (alle.length === 0) return fout("methodeSignatuur.ontbreekt", null);
    var wens = (cfg.params || []).map(norm);
    var beste = null;
    for (var i = 0; i < alle.length; i++) {
      var m = alle[i];
      var got = paramTypes(m.params);
      var paramsOk = got.length === wens.length && got.every(function (t, k) { return t === wens[k]; });
      if (!paramsOk) { if (!beste) beste = { m: m, reden: "verkeerdeParams" }; continue; }
      if (cfg.retour !== undefined && retourType(m.voor) !== norm(cfg.retour)) {
        if (!beste || beste.reden === "verkeerdeParams") beste = { m: m, reden: "verkeerdRetour" };
        continue;
      }
      if (cfg.zichtbaarheid !== undefined && zichtbaarheidVan(m.voor) !== cfg.zichtbaarheid) {
        beste = { m: m, reden: "verkeerdeZichtbaarheid" };
        continue;
      }
      return ok();
    }
    return fout("methodeSignatuur." + beste.reden, beste.m.regel);
  }

  // heeftReturn({ methode, retourVorm? })
  //   retourVorm: bv "null" of "@id" of een concrete identifier -> `return <x> ;`
  function heeftReturn(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("heeftReturn.methodeOntbreekt", null);
    var heeft = zoekReeks(body, ["return"]);
    if (!heeft) return fout("heeftReturn.ontbreekt", null);
    if (cfg.retourVorm !== undefined) {
      var patroon = ["return"].concat(String(cfg.retourVorm).split(" ")).concat([";"]);
      if (!bevat(body, patroon)) return fout("heeftReturn.verkeerdeVorm", heeft.regel);
    }
    return ok();
  }

  // conditieGebruikt({ methode, operator, structuur? })
  //   operator ∈ "&&" | "||" | "!" ; structuur "cascade" => >=1 `else if`
  function conditieGebruikt(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("conditie.methodeOntbreekt", null);
    var teksten = body.map(function (t) { return t.tekst; });
    if (cfg.operator) {
      var heeft = teksten.indexOf(cfg.operator) >= 0;
      if (heeft) {
        if (cfg.structuur === "cascade" && !bevat(body, ["else", "if"])) {
          return fout("conditie.operatorOntbreekt", body.length ? body[0].regel : null);
        }
        return ok();
      }
      // verwarde operator? (&& <-> ||)
      var zusters = { "&&": "||", "||": "&&" };
      var z = zusters[cfg.operator];
      if (z && teksten.indexOf(z) >= 0) return fout("conditie.verkeerdeOperator", body.length ? body[0].regel : null);
      return fout("conditie.operatorOntbreekt", null);
    }
    if (cfg.structuur === "cascade") {
      if (bevat(body, ["else", "if"])) return ok();
      return fout("conditie.operatorOntbreekt", null);
    }
    return ok();
  }

  // validatieKlem({ methode, onder, boven })
  function validatieKlem(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("validatieKlem.methodeOntbreekt", null);
    var ifs = parseIfs(body);
    var okLower = false, okUpper = false, verkeerd = false, verkeerdRegel = null;
    for (var i = 0; i < ifs.length; i++) {
      var f = ifs[i];
      var v = vergelijkOp(f.conditie);
      if (!v) continue;
      var rhs = toewijzingRHS(f.romp);
      if (rhs === null) continue;
      if (bevatWaarde(cfg.onder, rhs)) {
        if (v.op === "<" || v.op === "<=") okLower = true;
        else { verkeerd = true; verkeerdRegel = f.regel; }
      } else if (bevatWaarde(cfg.boven, rhs)) {
        if (v.op === ">" || v.op === ">=") okUpper = true;
        else { verkeerd = true; verkeerdRegel = f.regel; }
      }
    }
    if (okLower && okUpper) return ok();
    if (verkeerd) return fout("validatieKlem.verkeerdeRichting", verkeerdRegel);
    return fout("validatieKlem.onvolledig", body.length ? body[0].regel : null);
  }

  // lusVorm({ methode, soort })  soort ∈ "for" | "foreach" | "while"
  function lusVorm(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("lusVorm.methodeOntbreekt", null);
    var forInfo = vindFor(body);
    var heeftWhile = false, whileRegel = null;
    for (var i = 0; i < body.length; i++) {
      if (body[i].soort === "trefwoord" && body[i].tekst === "while") { heeftWhile = true; whileRegel = body[i].regel; break; }
    }
    if (cfg.soort === "while") {
      return heeftWhile ? ok() : (forInfo ? fout("lusVorm.verkeerdeSoort", forInfo.regel) : fout("lusVorm.ontbreekt", null));
    }
    // for / foreach
    if (!forInfo) return heeftWhile ? fout("lusVorm.verkeerdeSoort", whileRegel) : fout("lusVorm.ontbreekt", null);
    var isForeach = splitOp(forInfo.kop, ":").length > 1;
    if (cfg.soort === "foreach") return isForeach ? ok() : fout("lusVorm.verkeerdeSoort", forInfo.regel);
    // "for" (geteld): niet-foreach
    return isForeach ? fout("lusVorm.verkeerdeSoort", forInfo.regel) : ok();
  }

  function vindFor(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].soort === "trefwoord" && tokens[i].tekst === "for" &&
          tokens[i + 1] && tokens[i + 1].tekst === "(") {
        var j = i + 1, d = 0;
        for (; j < tokens.length; j++) {
          if (tokens[j].tekst === "(") d++;
          else if (tokens[j].tekst === ")") { d--; if (d === 0) break; }
        }
        return { kop: tokens.slice(i + 2, j), regel: tokens[i].regel };
      }
    }
    return null;
  }

  // lusGrenzen({ methode, vergelijk, grensBevat? })
  //   vergelijk: verwachte vergelijkingsoperator van de for-conditie ("<"/"<=").
  //   grensBevat: tekst die in de grens-expressie moet staan (bv "size").
  function lusGrenzen(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("lusGrenzen.methodeOntbreekt", null);
    var forInfo = vindFor(body);
    if (!forInfo) return fout("lusGrenzen.ontbreekt", null);
    var clauses = splitOp(forInfo.kop, ";");
    if (clauses.length < 2) return fout("lusGrenzen.ontbreekt", forInfo.regel);
    var cond = clauses[1];
    var v = vergelijkOp(cond);
    if (!v) return fout("lusGrenzen.ontbreekt", forInfo.regel);
    if (cfg.grensBevat) {
      var condTekst = tekstReeks(cond);
      if (condTekst.indexOf(cfg.grensBevat) < 0) return fout("lusGrenzen.verkeerdeGrens", forInfo.regel);
    }
    if (cfg.vergelijk !== undefined && v.op !== cfg.vergelijk) {
      return fout("lusGrenzen.offByOne", forInfo.regel);
    }
    return ok();
  }

  // aanroepKeten({ methode?, stappen:[naam], nullVeilig?, contigue? })
  //   stappen: opeenvolgende getters, bv ["getSchuilplaats","getKamer","getNaam"].
  //   Standaard: de stappen komen in volgorde voor (gaten toegestaan — de
  //   modeloplossing splitst de keten rond een null-check). contigue===true eist
  //   `.s1().s2()....` aaneengesloten.
  function aanroepKeten(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("aanroepKeten.methodeOntbreekt", null);
    var stappen = cfg.stappen || [];
    if (cfg.contigue) {
      var patroon = [];
      for (var s = 0; s < stappen.length; s++) {
        patroon.push(".", stappen[s], "(", ")");
      }
      if (!bevat(body, patroon)) {
        // deelketen aanwezig maar niet aaneengesloten?
        if (stappenInVolgorde(body, stappen) !== null) return fout("aanroepKeten.nietAaneengesloten", null);
        return fout("aanroepKeten.onvolledig", null);
      }
    } else {
      var regel = stappenInVolgorde(body, stappen);
      if (regel === null) return fout("aanroepKeten.onvolledig", null);
    }
    if (cfg.nullVeilig) {
      var heeftGuard = bevat(body, ["==", "null"]) || bevat(body, ["!=", "null"]);
      if (!heeftGuard) return fout("aanroepKeten.nullCheckOntbreekt", null);
    }
    return ok();
  }
  // Elke stap als `. <naam> ( )` in stijgende volgorde; geeft de regel van de
  // laatste stap terug, of null als niet alle stappen (in volgorde) voorkomen.
  function stappenInVolgorde(body, stappen) {
    var van = 0, laatsteRegel = null;
    for (var s = 0; s < stappen.length; s++) {
      var m = zoekReeks(body, [".", stappen[s], "(", ")"], van);
      if (!m) return null;
      van = m.eind;
      laatsteRegel = m.regel;
    }
    return laatsteRegel;
  }

  // methodeAanroep({ methode?, naam })  — <naam>( komt voor als aanroep.
  function methodeAanroep(tokens, cfg) {
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) return fout("methodeAanroep.methodeOntbreekt", null);
    var m = zoekReeks(body, [cfg.naam, "("]);
    return m ? ok() : fout("methodeAanroep.ontbreekt", null);
  }

  // geenVerbodenConstructies({ methode? })  — globale pre-check.
  function geenVerbodenConstructies(tokens, cfg) {
    cfg = cfg || {};
    var body = bodyVan(tokens, cfg.methode);
    if (body === null) body = tokens;
    for (var i = 0; i < body.length; i++) {
      var t = body[i];
      if (t.soort === "trefwoord" && t.tekst === "switch") return fout("verboden.switch", t.regel);
      if (t.soort === "trefwoord" && t.tekst === "enum") return fout("verboden.enum", t.regel);
      if (t.soort === "trefwoord" && t.tekst === "var") return fout("verboden.var", t.regel);
      if (t.soort === "operator" && t.tekst === "->") return fout("verboden.lambda", t.regel);
      if (t.soort === "operator" && t.tekst === "?") return fout("verboden.ternary", t.regel);
      if (t.soort === "identifier" && t.tekst === "stream" &&
          body[i - 1] && body[i - 1].tekst === "." &&
          body[i + 1] && body[i + 1].tekst === "(") return fout("verboden.stream", t.regel);
    }
    return ok();
  }

  // Kleine ingebouwde tokenizer-hulp voor config-typestrings (bv "ArrayList<Voorwerp>"):
  // splits in tokentekst zoals de echte tokenizer, maar we hebben alleen de
  // tekst-vergelijking nodig, dus we leunen op AL.checker.tokenizer.
  function require_tokenize(bron) {
    var tk = globalThis.AL.checker.tokenizer;
    return tk.tokenize(bron).tokens.map(function (t) { return t.tekst; });
  }

  var asserts = {
    veldDeclaratie: veldDeclaratie,
    constructorSignatuur: constructorSignatuur,
    constructorToewijzing: constructorToewijzing,
    methodeSignatuur: methodeSignatuur,
    heeftReturn: heeftReturn,
    conditieGebruikt: conditieGebruikt,
    validatieKlem: validatieKlem,
    lusVorm: lusVorm,
    lusGrenzen: lusGrenzen,
    aanroepKeten: aanroepKeten,
    methodeAanroep: methodeAanroep,
    geenVerbodenConstructies: geenVerbodenConstructies,
    // hulpfuncties (voor de level-WP's en tests)
    _hulp: {
      vindMethode: vindMethode, vindAlle: vindAlle, bodyVan: bodyVan,
      paramTypes: paramTypes, retourType: retourType, parseIfs: parseIfs,
      zoekReeks: zoekReeks, splitOp: splitOp, vindFor: vindFor
    }
  };

  globalThis.AL.checker.asserts = asserts;
  if (typeof module !== "undefined") { module.exports = asserts; }

})();
