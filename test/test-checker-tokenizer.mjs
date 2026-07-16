// test-checker-tokenizer.mjs — AL.checker.tokenizer: tokensoorten, positie-
// behoud (regel/kolom), strings/char/commentaar-bewustzijn, operatoren, de
// balanscontrole en de statement-splitter.

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadChecker } from "./helpers.mjs";

const { tokenizer } = laadChecker();
const T = (s) => tokenizer.tokenize(s);

test("tokensoorten: trefwoord vs identifier vs getal vs operator vs leesteken", () => {
  const t = T("int x = 3 + y;").tokens;
  assert.deepEqual(t.map((k) => k.soort),
    ["trefwoord", "identifier", "operator", "getal", "operator", "identifier", "leesteken"]);
  assert.deepEqual(t.map((k) => k.tekst),
    ["int", "x", "=", "3", "+", "y", ";"]);
});

test("regelnummers blijven op elk token behouden", () => {
  const bron = "class A {\n  int x;\n  int y;\n}";
  const t = T(bron).tokens;
  const x = t.find((k) => k.tekst === "x");
  const y = t.find((k) => k.tekst === "y");
  assert.equal(x.regel, 2);
  assert.equal(y.regel, 3);
  assert.equal(t[0].regel, 1); // class
});

test("kolommen wijzen naar het begin van het token", () => {
  const t = T("  this.naam = naam;").tokens;
  assert.equal(t[0].tekst, "this");
  assert.equal(t[0].kolom, 3); // twee spaties ervoor
});

test("commentaar wordt gestript (// en /* */), code erna telt weer", () => {
  const bron = "int a; // int b in commentaar\n/* int c */ int d;";
  const t = T(bron).tokens;
  const namen = t.filter((k) => k.soort === "identifier").map((k) => k.tekst);
  assert.deepEqual(namen, ["a", "d"]);
});

test("trefwoorden binnen een string tellen niet als code", () => {
  const t = T('String s = "class if for while";').tokens;
  const str = t.find((k) => k.soort === "string");
  assert.equal(str.tekst, "class if for while");
  assert.ok(!t.some((k) => k.soort === "trefwoord" && k.tekst === "class"));
});

test("string-escapes breken de string niet af", () => {
  const t = T('String s = "zeg \\"hoi\\" en \\n";').tokens;
  const strings = t.filter((k) => k.soort === "string");
  assert.equal(strings.length, 1); // één string-token, niet drie
});

test("char-literals worden herkend, ook met escape", () => {
  const t = T("char c = '\\n';").tokens;
  assert.ok(t.some((k) => k.soort === "char"));
});

test("samengestelde operatoren blijven één token (<=, ==, &&, ++, +=)", () => {
  const t = T("a <= b == c && d ++ += --").tokens;
  const ops = t.filter((k) => k.soort === "operator").map((k) => k.tekst);
  assert.deepEqual(ops, ["<=", "==", "&&", "++", "+=", "--"]);
});

test("< en <= zijn verschillende tokens (off-by-one blijft zichtbaar)", () => {
  assert.equal(T("i < n").tokens[1].tekst, "<");
  assert.equal(T("i <= n").tokens[1].tekst, "<=");
});

test("niet-afgesloten string geeft een lexicale fout", () => {
  const r = T('String s = "open maar niet dicht;');
  assert.ok(r.fouten.some((f) => f.soort === "string-open"));
});

test("niet-afgesloten commentaarblok geeft een lexicale fout", () => {
  const r = T("int a; /* nooit gesloten");
  assert.ok(r.fouten.some((f) => f.soort === "commentaar-open"));
});

test("balans: correcte code is in evenwicht", () => {
  const r = tokenizer.balans(T("void m() { if (x) { y(); } }").tokens);
  assert.equal(r.ok, true);
  assert.equal(r.fouten.length, 0);
});

test("balans: ontbrekende sluitaccolade wordt gemeld", () => {
  const r = tokenizer.balans(T("void m() { if (x) { y(); }").tokens);
  assert.equal(r.ok, false);
  assert.ok(r.fouten.some((f) => f.soort === "accolade" && f.type === "niet-gesloten"));
});

test("balans: verkeerd sluitteken wordt gemeld met verwacht/gekregen", () => {
  const r = tokenizer.balans(T("m( ]").tokens);
  const f = r.fouten.find((x) => x.type === "verkeerd-gesloten" || x.type === "niet-geopend");
  assert.ok(f);
});

test("splitStatements: splitst op top-niveau ; en negeert lege statements", () => {
  const stmts = tokenizer.splitStatements(T("a = 1; b = 2;; for (int i=0;i<n;i++) {}").tokens);
  // a=1 | b=2 | for(...) {}   -> de ; binnen de for-kop splitst niet
  assert.equal(stmts.length, 3);
  assert.equal(tokenizer.tekstVan(stmts[0]), "a = 1");
});
