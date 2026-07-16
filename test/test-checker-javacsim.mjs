// test-checker-javacsim.mjs — AL.checker.javacsim: de gesimuleerde javac. Toetst
// het javac-stijl-formaat, elke diagnose-categorie, de ordening, en — het
// KRITIEKE punt (contract) — dat GEEN ENKELE modeloplossing een vals-positieve
// diagnose krijgt. Elk echt Java-bestand uit seven-little-goats/src/ moet
// javac-schoon door de simulator komen.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadChecker } from "./helpers.mjs";

const { javacsim } = laadChecker();
const hier = dirname(fileURLToPath(import.meta.url));
const srcDir = join(hier, "..", "seven-little-goats", "src");

test("schone code geeft nul diagnoses en lege uitvoer", () => {
  const r = javacsim.diagnose("class A { int x() { return 1; } }", "A.java");
  assert.equal(r.ok, true);
  assert.equal(r.aantal, 0);
  assert.deepEqual(r.tekst, []);
});

test("ontbrekende puntkomma: javac-stijl met bestand:regel, caret en uitleg", () => {
  const bron = "class G {\n    G() {\n        this.naam = naam\n    }\n}";
  const r = javacsim.diagnose(bron, "G.java");
  assert.equal(r.ok, false);
  const d = r.diagnostics.find((x) => x.categorie === "puntkomma");
  assert.ok(d);
  assert.equal(d.regel, 3);
  // regel 1 van de uitvoer heeft de authentieke vorm
  assert.equal(r.tekst[0], "G.java:3: fout: ';' verwacht");
  // caretregel bestaat en bevat het dakje
  assert.ok(r.tekst.some((l) => l.trim() === "^"));
  // vriendelijke Nederlandse uitleg
  assert.ok(r.tekst.some((l) => l.startsWith("→")));
  // afsluitende telling
  assert.equal(r.tekst[r.tekst.length - 1], "1 fout");
});

test("meervoud in de slotregel: 'N fouten'", () => {
  const bron = "class G {\n    G() {\n        this.a = a\n        this.b = b\n        return\n    }\n}";
  const r = javacsim.diagnose(bron, "G.java");
  assert.ok(r.aantal >= 2);
  assert.equal(r.tekst[r.tekst.length - 1], r.aantal + " fouten");
});

test("niet-gesloten accolade wordt gemeld", () => {
  const r = javacsim.diagnose("class A { int x() { return 1; }", "A.java");
  assert.ok(r.diagnostics.some((d) => d.categorie === "accolade"));
});

test("niet-afgesloten string en commentaar worden gemeld", () => {
  assert.ok(javacsim.diagnose('class A { String s = "open; }', "A.java")
    .diagnostics.some((d) => d.categorie === "string-open"));
  assert.ok(javacsim.diagnose("class A { /* open", "A.java")
    .diagnostics.some((d) => d.categorie === "commentaar-open"));
});

test("ontbrekend returntype: kleine-letter-methode zonder type ervoor", () => {
  const r = javacsim.diagnose("class A {\n    getNaam() {\n        return naam;\n    }\n}", "A.java");
  assert.ok(r.diagnostics.some((d) => d.categorie === "returntype"));
});

test("constructor (hoofdletter) wordt NIET als ontbrekend returntype gemeld", () => {
  const r = javacsim.diagnose("class Voorwerp {\n    Voorwerp(String naam) {\n        this.naam = naam;\n    }\n}", "Voorwerp.java");
  assert.ok(!r.diagnostics.some((d) => d.categorie === "returntype"));
});

test("trefwoord-typefout wordt herkend met suggestie", () => {
  const r = javacsim.diagnose("class A {\n    pubic int x() { return 1; }\n}", "A.java");
  const d = r.diagnostics.find((x) => x.categorie === "typefout");
  assert.ok(d);
  assert.ok(d.uitleg.includes("public"));
});

test("diagnoses zijn geordend op positie (regel, dan kolom)", () => {
  const bron = "class A {\n    voi a() {}\n    getX() {}\n}"; // typefout op r2, returntype op r3
  const r = javacsim.diagnose(bron, "A.java");
  for (let i = 1; i < r.diagnostics.length; i++) {
    const a = r.diagnostics[i - 1], b = r.diagnostics[i];
    assert.ok(a.regel < b.regel || (a.regel === b.regel && a.kolom <= b.kolom));
  }
});

// ---- De harde gate: geen enkele vals-positieve op echte code ---------------
const bestanden = readdirSync(srcDir).filter((f) => f.endsWith(".java"));

test("KRITIEK: elk echt Java-bestand komt javac-schoon door de simulator", () => {
  for (const f of bestanden) {
    const bron = readFileSync(join(srcDir, f), "utf8");
    const r = javacsim.diagnose(bron, f);
    assert.equal(r.ok, true,
      `${f} gaf een onterechte diagnose: ` +
      JSON.stringify(r.diagnostics.map((d) => `${d.categorie}@${d.regel}:${d.kolom}`)));
  }
});
