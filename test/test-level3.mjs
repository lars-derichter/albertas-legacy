// test-level3.mjs — Level 3 (scharnier 3: voorwaarden — validatie, cascade,
// && / || / !). Toetst: registratie, de clamp-modeloplossing en beide
// beschadigde varianten, de && / || -vind-de-fout, de cascade-trace op de
// randwaarden (0 en 10 als valstrikken), en de hint-staging.

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
const level3 = require(join(wortel, "js", "levels", "level3.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;

function puzzel(id) { return level3.puzzels.find((p) => p.id === id); }
function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 3 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("3"));
  const defs = AL.levels.puzzelDefs("3");
  assert.deepEqual(defs.map((d) => d.id), ["l3-editor-repair", "l3-vindfout", "l3-trace"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "vindfout", "trace"]);
  assert.equal(level3.week, 2);
});

// ===========================================================================
// Editor-repair — de klemmende setter
// ===========================================================================

test("repair: het clamp-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l3-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.equal(r.eersteFout, null);
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l3-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null);
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1);
});

test("repair: elke beschadigde variant faalt met de bedoelde meldingKey", () => {
  const def = puzzel("l3-editor-repair");
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
  for (const c of puzzel("l3-editor-repair").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Vind-de-fout — && versus ||
// ===========================================================================

test("vind-de-fout: regel 1 of een operator-sleutelwoord slaagt; de rest faalt", () => {
  const def = puzzel("l3-vindfout");
  assert.equal(terminal.checkVindfout(def, "1").ok, true);
  assert.equal(terminal.checkVindfout(def, "regel 1").ok, true);
  assert.equal(terminal.checkVindfout(def, "&&").ok, true);
  assert.equal(terminal.checkVindfout(def, "moet allebei waar zijn").ok, true);
  assert.equal(terminal.checkVindfout(def, "2").ok, false);
  assert.equal(terminal.checkVindfout(def, "regel 4").ok, false);
});

// ===========================================================================
// Trace — de validatie-cascade op randwaarden
// ===========================================================================

test("trace: de cascade-uitkomst per randwaarde (0 en 10 als valstrikken)", () => {
  const def = puzzel("l3-trace");
  const verwacht = { 0: "verslagen", 5: "gewond", 10: "gezond" };
  for (const n of def.pool) {
    assert.equal(def.verwacht(n), verwacht[n], `randwaarde ${n}`);
    assert.equal(terminal.checkTrace(def, n, verwacht[n]).ok, true);
    assert.equal(terminal.checkTrace(def, n, "gezond").ok, n === 10);
  }
  // De grenzen expliciet: 0 is verslagen (<= 0), 10 is gezond (< 10 pakt 10 niet).
  assert.equal(def.verwacht(0), "verslagen");
  assert.equal(def.verwacht(10), "gezond");
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l3-editor-repair", "l3-vindfout", "l3-trace"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "3", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    const h4 = AL.levels.hint(t, "3", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["3"].puzzels[id].hints, 3);
  });
}
