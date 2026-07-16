// test-checker-asserts.mjs — AL.checker.asserts: elke structurele assertie in
// zijn slaag- en faalvorm, plus de tolerantieregels (whitespace, lokale namen)
// en de methode-extractie-hulp. De volledige puzzelbrede dekking zit in
// test-checker-corpus.mjs; dit bestand toetst de asserties geïsoleerd.

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadChecker } from "./helpers.mjs";

const { tokenizer, asserts } = laadChecker();
const T = (s) => tokenizer.tokenize(s).tokens;

test("veldDeclaratie: herkent een private veld; privaat-eis wordt afgedwongen", () => {
  assert.ok(asserts.veldDeclaratie(T("private String naam;"), { type: "String", naam: "naam", privaat: true }).ok);
  const r = asserts.veldDeclaratie(T("String naam;"), { type: "String", naam: "naam", privaat: true });
  assert.equal(r.meldingKey, "veldDeclaratie.nietPrivate");
  assert.equal(asserts.veldDeclaratie(T("private int x;"), { type: "String", naam: "naam" }).meldingKey,
    "veldDeclaratie.ontbreekt");
});

test("veldDeclaratie: generiek type (ArrayList<Voorwerp>) matcht", () => {
  assert.ok(asserts.veldDeclaratie(T("private ArrayList<Voorwerp> inventaris;"),
    { type: "ArrayList<Voorwerp>", naam: "inventaris" }).ok);
});

test("constructorToewijzing: correct, omgekeerd en ontbrekend", () => {
  assert.ok(asserts.constructorToewijzing(T("C(){ this.x = x; }"), { veld: "x", param: "x" }).ok);
  assert.equal(asserts.constructorToewijzing(T("C(){ x = this.x; }"), { veld: "x" }).meldingKey,
    "constructorToewijzing.omgekeerd");
  assert.equal(asserts.constructorToewijzing(T("C(){ y = 1; }"), { veld: "x" }).meldingKey,
    "constructorToewijzing.ontbreekt");
});

test("constructorToewijzing: tolerant voor afwijkende parameternaam", () => {
  // this.naam = n; met parameternaam n is geldig (lokale naam is vrij)
  assert.ok(asserts.constructorToewijzing(T("C(String n){ this.naam = n; }"), { veld: "naam", param: "naam" }).ok);
});

test("constructorSignatuur: kiest de juiste overload op parametertypes", () => {
  const src = "C(String a){} C(String a, int b){}";
  assert.ok(asserts.constructorSignatuur(T(src), { naam: "C", params: ["String", "int"] }).ok);
  assert.equal(asserts.constructorSignatuur(T(src), { naam: "C", params: ["int", "int"] }).meldingKey,
    "constructorSignatuur.verkeerdeParams");
});

test("methodeSignatuur: exact retourtype, naam en parametertypes", () => {
  const src = "int getX() { return x; } void setX(int x){ this.x = x; }";
  assert.ok(asserts.methodeSignatuur(T(src), { retour: "int", naam: "getX", params: [] }).ok);
  assert.equal(asserts.methodeSignatuur(T(src), { retour: "String", naam: "getX", params: [] }).meldingKey,
    "methodeSignatuur.verkeerdRetour");
  assert.equal(asserts.methodeSignatuur(T(src), { retour: "void", naam: "setX", params: [] }).meldingKey,
    "methodeSignatuur.verkeerdeParams");
  assert.equal(asserts.methodeSignatuur(T(src), { retour: "int", naam: "getY", params: [] }).meldingKey,
    "methodeSignatuur.ontbreekt");
});

test("heeftReturn: aanwezigheid en de gevraagde returnvorm", () => {
  assert.ok(asserts.heeftReturn(T("Voorwerp m(){ return null; }"), { methode: "m" }).ok);
  assert.ok(asserts.heeftReturn(T("Voorwerp m(){ return null; }"), { methode: "m", retourVorm: "null" }).ok);
  assert.equal(asserts.heeftReturn(T("void m(){ x(); }"), { methode: "m" }).meldingKey, "heeftReturn.ontbreekt");
  assert.equal(asserts.heeftReturn(T("Voorwerp m(){ return x; }"), { methode: "m", retourVorm: "null" }).meldingKey,
    "heeftReturn.verkeerdeVorm");
});

test("conditieGebruikt: operator-aanwezigheid en de && vs || verwarring", () => {
  assert.ok(asserts.conditieGebruikt(T("void m(){ if (a && b) {} }"), { methode: "m", operator: "&&" }).ok);
  assert.equal(asserts.conditieGebruikt(T("void m(){ if (a || b) {} }"), { methode: "m", operator: "&&" }).meldingKey,
    "conditie.verkeerdeOperator");
  assert.equal(asserts.conditieGebruikt(T("void m(){ if (a) {} }"), { methode: "m", operator: "&&" }).meldingKey,
    "conditie.operatorOntbreekt");
});

test("conditieGebruikt: cascade (else if) vereist", () => {
  assert.ok(asserts.conditieGebruikt(T("void m(){ if (a) {} else if (b) {} }"), { methode: "m", structuur: "cascade" }).ok);
  assert.equal(asserts.conditieGebruikt(T("void m(){ if (a) {} }"), { methode: "m", structuur: "cascade" }).meldingKey,
    "conditie.operatorOntbreekt");
});

test("validatieKlem: twee clamps ok; verkeerde richting; onvolledig", () => {
  const goed = "void s(int w){ if (w < 0) w = 0; if (w > 20) w = 20; }";
  assert.ok(asserts.validatieKlem(T(goed), { methode: "s", onder: "0", boven: "20" }).ok);
  const fout = "void s(int w){ if (w > 0) w = 0; if (w > 20) w = 20; }";
  assert.equal(asserts.validatieKlem(T(fout), { methode: "s", onder: "0", boven: "20" }).meldingKey,
    "validatieKlem.verkeerdeRichting");
  const half = "void s(int w){ if (w < 0) w = 0; }";
  assert.equal(asserts.validatieKlem(T(half), { methode: "s", onder: "0", boven: "20" }).meldingKey,
    "validatieKlem.onvolledig");
});

test("lusVorm: for / foreach / while onderscheiden", () => {
  assert.ok(asserts.lusVorm(T("void m(){ for (int i=0;i<n;i++){} }"), { methode: "m", soort: "for" }).ok);
  assert.ok(asserts.lusVorm(T("void m(){ for (Voorwerp v : lijst){} }"), { methode: "m", soort: "foreach" }).ok);
  assert.ok(asserts.lusVorm(T("void m(){ while (x){} }"), { methode: "m", soort: "while" }).ok);
  assert.equal(asserts.lusVorm(T("void m(){ while (x){} }"), { methode: "m", soort: "for" }).meldingKey,
    "lusVorm.verkeerdeSoort");
});

test("lusGrenzen: < vs <= is de off-by-one en wordt nooit getolereerd", () => {
  assert.ok(asserts.lusGrenzen(T("void m(){ for (int i=0;i<lijst.size();i++){} }"),
    { methode: "m", vergelijk: "<", grensBevat: "size" }).ok);
  assert.equal(asserts.lusGrenzen(T("void m(){ for (int i=0;i<=lijst.size();i++){} }"),
    { methode: "m", vergelijk: "<", grensBevat: "size" }).meldingKey, "lusGrenzen.offByOne");
});

test("aanroepKeten: keten in volgorde; null-veiligheid afgedwongen", () => {
  const veilig = "void m(){ X s = g.getA(); if (s == null) return; s.getB().getC(); }";
  assert.ok(asserts.aanroepKeten(T(veilig), { methode: "m", stappen: ["getA", "getB", "getC"], nullVeilig: true }).ok);
  const onveilig = "void m(){ g.getA().getB().getC(); }";
  assert.equal(asserts.aanroepKeten(T(onveilig), { methode: "m", stappen: ["getA", "getB", "getC"], nullVeilig: true }).meldingKey,
    "aanroepKeten.nullCheckOntbreekt");
  const kort = "void m(){ if (x==null){} g.getA().getC(); }";
  assert.equal(asserts.aanroepKeten(T(kort), { methode: "m", stappen: ["getA", "getB", "getC"], nullVeilig: true }).meldingKey,
    "aanroepKeten.onvolledig");
});

test("methodeAanroep: aanwezigheid van een aanroep binnen een methode", () => {
  assert.ok(asserts.methodeAanroep(T("void m(){ lijst.remove(i); }"), { methode: "m", naam: "remove" }).ok);
  assert.equal(asserts.methodeAanroep(T("void m(){ lijst.get(i); }"), { methode: "m", naam: "remove" }).meldingKey,
    "methodeAanroep.ontbreekt");
});

test("geenVerbodenConstructies: switch, lambda, ternary, var, stream, enum", () => {
  assert.equal(asserts.geenVerbodenConstructies(T("void m(){ switch (x) {} }")).meldingKey, "verboden.switch");
  assert.equal(asserts.geenVerbodenConstructies(T("void m(){ f(x -> x); }")).meldingKey, "verboden.lambda");
  assert.equal(asserts.geenVerbodenConstructies(T("void m(){ int y = a ? b : c; }")).meldingKey, "verboden.ternary");
  assert.equal(asserts.geenVerbodenConstructies(T("void m(){ var y = 3; }")).meldingKey, "verboden.var");
  assert.equal(asserts.geenVerbodenConstructies(T("void m(){ lijst.stream().count(); }")).meldingKey, "verboden.stream");
  assert.ok(asserts.geenVerbodenConstructies(T("void m(){ for (int i=0;i<n;i++){} }")).ok);
});

test("tolerantie: whitespace en lokale-variabelenaam veranderen het oordeel niet", () => {
  const a = asserts.constructorToewijzing(T("C(){this.x=x;}"), { veld: "x", param: "x" });
  const b = asserts.constructorToewijzing(T("C(){\n    this . x   =   x ;\n}"), { veld: "x", param: "x" });
  assert.deepEqual(a, b);
  // andere index-naam in de lus verandert lusGrenzen niet
  assert.ok(asserts.lusGrenzen(T("void m(){ for (int teller=0; teller<n.size(); teller++){} }"),
    { methode: "m", vergelijk: "<", grensBevat: "size" }).ok);
});

test("hulp: vindMethode extraheert de body; ontbrekende methode -> null", () => {
  const m = asserts._hulp.vindMethode(T("int getX(){ return x; }"), "getX");
  assert.ok(m);
  assert.equal(tokenizer.tekstVan(m.body), "return x ;");
  assert.equal(asserts._hulp.vindMethode(T("int getX(){ return x; }"), "getY"), null);
});
