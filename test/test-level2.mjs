// test-level2.mjs — Level 2 (scharnier 2: signaturen, return vs. void,
// attribuut / parameter / lokaal). Toetst: registratie, de signatuur-
// modeloplossing en beide beschadigde varianten, de Parsons-methode (juiste
// volgorde slaagt, de afleider valt buiten het aantal), de shadowing-trace, en
// de hint-staging.

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
require(join(wortel, "js", "pc", "parsons.js"));
const level2 = require(join(wortel, "js", "levels", "level2.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;
const parsons = AL.pc.parsons;
const SEED = 7;

function puzzel(id) { return level2.puzzels.find((p) => p.id === id); }
function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 2 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("2"));
  const defs = AL.levels.puzzelDefs("2");
  assert.deepEqual(defs.map((d) => d.id), ["l2-parsons", "l2-editor-repair", "l2-trace"]);
  assert.deepEqual(defs.map((d) => d.type), ["parsons", "editor", "trace"]);
});

// De volgorde is sinds WP 48b een eis, geen smaak: de defs-volgorde is de
// speelvolgorde (AL.levels.puzzelSpeelbaar), en het editor-fragment toont
// `zoek` ongeschonden — precies de stroken van de Parsons. Wie de editor eerst
// mag openen, krijgt die oplossing cadeau.
test("volgorde: de Parsons komt vóór het editor-fragment dat zijn stroken toont", () => {
  const defs = AL.levels.puzzelDefs("2");
  const iParsons = defs.findIndex((d) => d.id === "l2-parsons");
  const iEditor = defs.findIndex((d) => d.id === "l2-editor-repair");
  assert.ok(iParsons < iEditor, "de Parsons hoort vóór de editor te staan");
  // Het bewijs dat het om dezelfde regels gaat: elke strook staat, op
  // inspringing na, in beide beschadigde varianten van de editor.
  const parsons = puzzel("l2-parsons");
  const editorDef = puzzel("l2-editor-repair");
  for (const variant of editorDef.varianten) {
    const regels = variant.split("\n").map((r) => r.trim());
    for (const strook of parsons.regels) {
      assert.ok(regels.includes(strook.trim()),
        "strook staat niet in de variant: " + strook);
    }
  }
});

// ===========================================================================
// Editor-repair — Speler-signaturen
// ===========================================================================

test("repair: het Speler-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l2-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.equal(r.eersteFout, null);
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l2-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null);
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1);
});

test("repair: elke beschadigde variant faalt met de bedoelde meldingKey", () => {
  const def = puzzel("l2-editor-repair");
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
  for (const c of puzzel("l2-editor-repair").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Parsons — de zoeklus-methode ordenen
// ===========================================================================

test("parsons: de juiste volgorde (uit de seeded shuffle) slaagt", () => {
  const def = puzzel("l2-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  assert.equal(correct.length, def.regels.length);
  const r = parsons.verifieerVolgorde(def, SEED, correct.join(" "));
  assert.equal(r.ok, true);
});

test("parsons: een verkeerde volgorde wijst de eerste mis-positie aan", () => {
  const def = puzzel("l2-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  const fout = correct.slice();
  [fout[0], fout[1]] = [fout[1], fout[0]];
  const r = parsons.verifieerVolgorde(def, SEED, fout.join(" "));
  assert.equal(r.ok, false);
  assert.equal(r.reden, "volgorde");
});

test("parsons: de afleider (return-de-parameter) valt buiten het aantal", () => {
  const def = puzzel("l2-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  const alle = parsons.geschud(def, SEED);
  let afleiderPos = null;
  for (let i = 1; i <= alle.length; i++) if (correct.indexOf(i) === -1) { afleiderPos = i; break; }
  assert.ok(afleiderPos !== null);
  const r = parsons.verifieerVolgorde(def, SEED, correct.concat([afleiderPos]).join(" "));
  assert.equal(r.ok, false);
  assert.equal(r.reden, "aantal");
});

// ===========================================================================
// Trace — parameter schaduwt attribuut
// ===========================================================================

test("trace: de shadowing-uitkomst is param dan attribuut (20)", () => {
  const def = puzzel("l2-trace");
  for (const n of def.pool) {
    assert.equal(def.verwacht(n), String(n) + " 20");
    assert.equal(terminal.checkTrace(def, n, String(n) + " 20").ok, true);
    assert.equal(terminal.checkTrace(def, n, "20 " + n).ok, false, "volgorde telt");
    assert.equal(terminal.checkTrace(def, n, String(n)).ok, false, "beide getallen vereist");
  }
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l2-editor-repair", "l2-parsons", "l2-trace"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "2", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    const h4 = AL.levels.hint(t, "2", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["2"].puzzels[id].hints, 3);
  });
}
