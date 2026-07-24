// test-level4.mjs — Level 4 (scharnier 4: referenties — twee pijlen, één doos,
// null). Toetst: registratie, de verbindKamers-modeloplossing en beide beschadigde
// varianten, de aliasing-trace, de null-verklaar-zelf-check, en de hint-staging.

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
const level4 = require(join(wortel, "js", "levels", "level4.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;

function puzzel(id) { return level4.puzzels.find((p) => p.id === id); }
function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 4 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("4"));
  const defs = AL.levels.puzzelDefs("4");
  assert.deepEqual(defs.map((d) => d.id), ["l4-editor-repair", "l4-trace", "l4-verklaar"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "trace", "verklaar"]);
  assert.equal(level4.week, 3);
});

// ===========================================================================
// Editor-repair — de buur-bedrading
// ===========================================================================

test("repair: het verbindKamers-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l4-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.equal(r.eersteFout, null);
  assert.ok(r.checks.every((c) => c.ok));
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l4-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null);
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1);
});

test("repair: elke beschadigde variant faalt met de bedoelde meldingKey", () => {
  const def = puzzel("l4-editor-repair");
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
  for (const c of puzzel("l4-editor-repair").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Trace — aliasing (twee pijlen, één doos)
// ===========================================================================

test("trace: via de ene pijl gezet is via de andere zichtbaar", () => {
  const def = puzzel("l4-trace");
  for (const naam of def.pool) {
    assert.equal(def.verwacht(naam), naam);
    assert.equal(terminal.checkTrace(def, naam, naam).ok, true);
    assert.equal(terminal.checkTrace(def, naam, "null").ok, false, "aliasing, niet null");
  }
  // De vraag toont de twee-pijlen-opzet.
  const plat = def.vraag(def.pool[0]).join(" ");
  assert.ok(plat.includes("Kamer tweede = eerste;"));
});

// ===========================================================================
// Verklaar — wat betekent null hier (zelf-check)
// ===========================================================================

test("verklaar: de model-uitleg over null is aanwezig en de zelf-check-velden kloppen", () => {
  const def = puzzel("l4-verklaar");
  assert.ok(def.model && def.model.toLowerCase().includes("null"));
  assert.ok(Array.isArray(def.vraag) && def.vraag.length > 0);
  assert.ok(def.toon && def.bevestig && def.juist && def.anders);
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l4-editor-repair", "l4-trace", "l4-verklaar"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "4", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    // Stap 1 hergebruikt de metafoor.
    assert.ok(/pijl/i.test(teksten[0]) || /doos/i.test(teksten[0]));
    const h4 = AL.levels.hint(t, "4", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["4"].puzzels[id].hints, 3);
  });
}
