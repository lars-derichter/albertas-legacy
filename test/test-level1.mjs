// test-level1.mjs — Level 1 (checkpoint 1: klasse/instantie, constructor, this).
// Toetst: registratie, beide seed-varianten bereikbaar én verschillend, de
// modeloplossingen slagen door hun eigen checker-pijplijn met nul diagnostiek,
// elke gecureerde studentfout faalt met de bedoelde meldingKey, de verklaar-
// zelf-check, en de hint-staging (drie distincte, niet-verklappende stadia →
// hint:geen-meer).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadLogica, laadChecker } from "./helpers.mjs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const AL = laadLogica();
laadChecker();
require(join(wortel, "js", "pc", "editor.js"));
require(join(wortel, "js", "pc", "terminal.js"));
const level1 = require(join(wortel, "js", "levels", "level1.js"));

const editor = AL.pc.editor;

function puzzel(id) { return level1.puzzels.find((p) => p.id === id); }

function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 1 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("1"));
  const defs = AL.levels.puzzelDefs("1");
  assert.deepEqual(defs.map((d) => d.id),
    ["l1-editor-repair", "l1-editor-write", "l1-verklaar"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "editor", "verklaar"]);
});

// ===========================================================================
// Editor-repair — Voorwerp-constructor
// ===========================================================================

test("repair: het Voorwerp-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l1-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.equal(r.eersteFout, null);
  assert.ok(r.checks.every((c) => c.ok));
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l1-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null, "geen seed gevonden voor een variant-index");
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1, "de twee beschadigde varianten horen te verschillen");
});

test("repair: elke beschadigde variant faalt met de bedoelde meldingKey", () => {
  const def = puzzel("l1-editor-repair");
  assert.equal(def.varianten.length, def.variantMeldingen.length);
  def.varianten.forEach((code, i) => {
    const r = editor.evalueer(def, code);
    assert.equal(r.javac.ok, true, `variant ${i} hoort javac-schoon te zijn`);
    assert.equal(r.geslaagd, false);
    assert.equal(r.eersteFout.meldingKey, def.variantMeldingen[i]);
  });
});

test("repair: elke check-uitsleutel resolveert naar een CHECK_OK-label", () => {
  const labels = AL.strings.pcCheckLabels;
  for (const c of puzzel("l1-editor-repair").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Editor-write — Geitje van nul
// ===========================================================================

test("write: het Geitje-model slaagt; de stub zakt op een ontbrekend veld", () => {
  const def = puzzel("l1-editor-write");
  const goed = editor.evalueer(def, def.model);
  assert.equal(goed.geslaagd, true);
  assert.ok(goed.checks.every((c) => c.ok));
  const stub = editor.evalueer(def, def.varianten[0]);
  assert.equal(stub.geslaagd, false);
  assert.equal(stub.eersteFout.meldingKey, "veldDeclaratie.ontbreekt");
});

test("write: een typische fout (schuilplaats zonder this) faalt gericht", () => {
  const def = puzzel("l1-editor-write");
  const kapot = def.model.replace("this.schuilplaats = schuilplaats;", "schuilplaats = schuilplaats;");
  const r = editor.evalueer(def, kapot);
  assert.equal(r.geslaagd, false);
  assert.equal(r.eersteFout.meldingKey, "constructorToewijzing.ontbreekt");
});

// ===========================================================================
// Verklaar-in-één-zin — zelf-check
// ===========================================================================

test("verklaar: de model-uitleg is aanwezig en de zelf-check-velden kloppen", () => {
  const def = puzzel("l1-verklaar");
  assert.ok(def.model && def.model.length > 0);
  assert.ok(Array.isArray(def.vraag) && def.vraag.length > 0);
  assert.ok(def.toon && def.bevestig && def.juist && def.anders);
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l1-editor-repair", "l1-editor-write", "l1-verklaar"]) {
  test(`hints ${id}: drie distincte niet-verklappende stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "1", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    // Drie verschillende stadia.
    assert.equal(new Set(teksten).size, 3);
    // Niet het letterlijke antwoord: geen ingevulde this.<veld>=<param> met echte namen.
    for (const tk of teksten) {
      assert.ok(!/this\.naam\s*=\s*naam/.test(tk), "hint verklapt het letterlijke antwoord");
    }
    // Vierde aanvraag: geen nieuwe hint.
    const h4 = AL.levels.hint(t, "1", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["1"].puzzels[id].hints, 3);
  });
}
