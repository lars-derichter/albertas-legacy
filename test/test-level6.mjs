// test-level6.mjs — Level 6 (scharnier 6: index & off-by-one; welke lus). Toetst:
// registratie, de verwijderVoorwerp-modeloplossing en beide beschadigde varianten
// (off-by-one en de verkeerde luskeuze), de index-trace (laatste index = size()-1),
// de vind-de-fout op de gevechtslus, en de hint-staging.

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
const level6 = require(join(wortel, "js", "levels", "level6.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;

function puzzel(id) { return level6.puzzels.find((p) => p.id === id); }
function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 6 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("6"));
  const defs = AL.levels.puzzelDefs("6");
  assert.deepEqual(defs.map((d) => d.id), ["l6-editor-repair", "l6-trace", "l6-vindfout"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "trace", "vindfout"]);
});

// ===========================================================================
// Editor-repair — verwijderVoorwerp (off-by-one / luskeuze)
// ===========================================================================

test("repair: het verwijderVoorwerp-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l6-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.ok(r.checks.every((c) => c.ok));
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l6-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null);
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1);
});

test("repair: off-by-one en verkeerde luskeuze falen elk gericht", () => {
  const def = puzzel("l6-editor-repair");
  assert.deepEqual(def.variantMeldingen, ["lusGrenzen.offByOne", "lusVorm.verkeerdeSoort"]);
  def.varianten.forEach((code, i) => {
    const r = editor.evalueer(def, code);
    assert.equal(r.javac.ok, true, `variant ${i} hoort javac-schoon te zijn`);
    assert.equal(r.geslaagd, false);
    assert.equal(r.eersteFout.meldingKey, def.variantMeldingen[i]);
  });
});

test("repair: elke check-uitsleutel resolveert naar een CHECK_OK-label", () => {
  const labels = AL.strings.pcCheckLabels;
  for (const c of puzzel("l6-editor-repair").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Trace — de laatste afgedrukte index (off-by-one-bewustzijn)
// ===========================================================================

test("trace: de laatste index is size() min één", () => {
  const def = puzzel("l6-trace");
  for (const n of def.pool) {
    assert.equal(def.verwacht(n), String(n - 1));
    assert.equal(terminal.checkTrace(def, n, String(n - 1)).ok, true);
    assert.equal(terminal.checkTrace(def, n, String(n)).ok, false, "N is één te ver");
  }
});

// ===========================================================================
// Vind-de-fout — de verkeerde lusgrens in de gevechtsronde
// ===========================================================================

test("vind-de-fout: regel 1 of een grens-sleutelwoord slaagt; de rest faalt", () => {
  const def = puzzel("l6-vindfout");
  assert.equal(terminal.checkVindfout(def, "1").ok, true);
  assert.equal(terminal.checkVindfout(def, "regel 1").ok, true);
  assert.equal(terminal.checkVindfout(def, "<=").ok, true);
  assert.equal(terminal.checkVindfout(def, "de grens gaat een te ver").ok, true);
  assert.equal(terminal.checkVindfout(def, "2").ok, false);
  assert.equal(terminal.checkVindfout(def, "regel 3").ok, false);
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l6-editor-repair", "l6-trace", "l6-vindfout"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "6", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    assert.ok(/plank/i.test(teksten[0]), "stap 1 hergebruikt de plankenbrug-metafoor");
    const h4 = AL.levels.hint(t, "6", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["6"].puzzels[id].hints, 3);
  });
}
