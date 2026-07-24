// test-level7.mjs — Level 7 (scharnier 7: zoeken + de dubbele pijl). Toetst:
// registratie (twee editor-puzzels + één terminal), de zoeklus-schrijfopdracht
// (model slaagt, stub zakt, gecureerde fouten falen), de null-veilige keten-
// reparatie en beide beschadigde varianten, de geketende-getter-trace inclusief
// het null-geval, en de hint-staging.

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
const level7 = require(join(wortel, "js", "levels", "level7.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;

function puzzel(id) { return level7.puzzels.find((p) => p.id === id); }
function seedVoorIndex(def, idx) {
  for (let s = 0; s < 1000; s++) {
    if (AL.levels.variantIndex(s, def.varianten.length, def.shuffleLabel || def.id) === idx) return s;
  }
  return null;
}

// ===========================================================================
// Registratie
// ===========================================================================

test("level 7 registreert zich met twee editor-puzzels + één terminal", () => {
  assert.ok(AL.levels.isGeregistreerd("7"));
  const defs = AL.levels.puzzelDefs("7");
  assert.deepEqual(defs.map((d) => d.id), ["l7-editor-write", "l7-editor-repair", "l7-trace"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "editor", "trace"]);
  assert.equal(level7.week, 6);
});

// ===========================================================================
// Editor-write — de zoeklus (geeft Geitje of null)
// ===========================================================================

test("write: het zoeklus-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l7-editor-write");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.ok(r.checks.every((c) => c.ok));
  // Samengesteld uit lusVorm + lusGrenzen + methodeSignatuur + heeftReturn.
  const fns = new Set(def.checks.map((c) => c.fn));
  assert.ok(fns.has("lusVorm") && fns.has("lusGrenzen") &&
    fns.has("methodeSignatuur") && fns.has("heeftReturn"));
});

test("write: de stub zakt op de ontbrekende lus", () => {
  const def = puzzel("l7-editor-write");
  const r = editor.evalueer(def, def.varianten[0]);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, false);
  assert.equal(r.eersteFout.meldingKey, "lusVorm.ontbreekt");
});

test("write: gecureerde fouten falen gericht (off-by-one, return null vergeten)", () => {
  const def = puzzel("l7-editor-write");
  const offByOne = def.model.replace("i < geitjes.size()", "i <= geitjes.size()");
  const a = editor.evalueer(def, offByOne);
  assert.equal(a.geslaagd, false);
  assert.equal(a.eersteFout.meldingKey, "lusGrenzen.offByOne");

  const zonderNull = def.model.replace("    }\n    return null;\n}", "    }\n}");
  const b = editor.evalueer(def, zonderNull);
  assert.equal(b.geslaagd, false);
  assert.equal(b.eersteFout.meldingKey, "heeftReturn.verkeerdeVorm");
});

// ===========================================================================
// Editor-repair — de null-veilige getter-keten
// ===========================================================================

test("repair: het keten-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l7-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.ok(r.checks.every((c) => c.ok));
});

test("repair: beide seed-varianten zijn bereikbaar én verschillend", () => {
  const def = puzzel("l7-editor-repair");
  const s0 = seedVoorIndex(def, 0), s1 = seedVoorIndex(def, 1);
  assert.ok(s0 !== null && s1 !== null);
  const v0 = AL.levels.kiesVariant(s0, def.varianten, def.shuffleLabel);
  const v1 = AL.levels.kiesVariant(s1, def.varianten, def.shuffleLabel);
  assert.equal(v0, def.varianten[0]);
  assert.equal(v1, def.varianten[1]);
  assert.notEqual(v0, v1);
});

test("repair: gemiste null-check en onvolledige keten falen elk gericht", () => {
  const def = puzzel("l7-editor-repair");
  assert.deepEqual(def.variantMeldingen,
    ["aanroepKeten.nullCheckOntbreekt", "aanroepKeten.onvolledig"]);
  def.varianten.forEach((code, i) => {
    const r = editor.evalueer(def, code);
    assert.equal(r.javac.ok, true, `variant ${i} hoort javac-schoon te zijn`);
    assert.equal(r.geslaagd, false);
    assert.equal(r.eersteFout.meldingKey, def.variantMeldingen[i]);
  });
});

test("beide editor-puzzels: elke check-uitsleutel resolveert naar een label", () => {
  const labels = AL.strings.pcCheckLabels;
  for (const id of ["l7-editor-write", "l7-editor-repair"]) {
    for (const c of puzzel(id).checks) {
      assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
    }
  }
});

// ===========================================================================
// Trace — de geketende getter, inclusief het null-geval
// ===========================================================================

test("trace: schuilplaats volgt de dubbele pijl; null stopt op 'nog niet gevonden'", () => {
  const def = puzzel("l7-trace");
  assert.equal(def.verwacht("jongste"), "Geitenhuisje");
  assert.equal(def.verwacht("broer"), "nog niet gevonden");
  assert.equal(terminal.checkTrace(def, "jongste", "Geitenhuisje").ok, true);
  assert.equal(terminal.checkTrace(def, "broer", "nog niet gevonden").ok, true);
  assert.equal(terminal.checkTrace(def, "broer", "Geitenhuisje").ok, false);
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l7-editor-write", "l7-editor-repair", "l7-trace"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "7", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    assert.ok(/speurtocht|pijl/i.test(teksten[0]), "stap 1 hergebruikt de scharnier-metafoor");
    const h4 = AL.levels.hint(t, "7", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["7"].puzzels[id].hints, 3);
  });
}
