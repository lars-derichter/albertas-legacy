// test-level5.mjs — Level 5 (checkpoint 5: de lus-romp + patroonkeuze). Toetst:
// registratie, de twee-lus-schrijfopdracht (model slaagt, stub zakt, gecureerde
// fouten falen gericht), de string-builder-Parsons (opbouw-kaart, de overschrijf-
// afleider), de welke-patroonkaart-keuze (totaliseren), en de hint-staging.
//
// Beslissing: level 5 heeft geen herstel-varianten (de editor-puzzel is schrijf-
// van-nul), dus geen twee-varianten-test; de seed-variatie zit in de Parsons-
// shuffle en de patroonkaart-keuze is vast.

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
const level5 = require(join(wortel, "js", "levels", "level5.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;
const parsons = AL.pc.parsons;
const SEED = 11;

function puzzel(id) { return level5.puzzels.find((p) => p.id === id); }

// ===========================================================================
// Registratie
// ===========================================================================

test("level 5 registreert zich met drie puzzels in de juiste vormen", () => {
  assert.ok(AL.levels.isGeregistreerd("5"));
  const defs = AL.levels.puzzelDefs("5");
  assert.deepEqual(defs.map((d) => d.id), ["l5-editor-write", "l5-parsons", "l5-patroonkaart"]);
  assert.deepEqual(defs.map((d) => d.type), ["editor", "parsons", "patroonkaart"]);
});

// ===========================================================================
// Editor-write — de twee lus-methoden (tellen + uiterste)
// ===========================================================================

test("write: het twee-lus-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l5-editor-write");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, true);
  assert.ok(r.checks.every((c) => c.ok));
  // De checks zijn samengesteld uit bestaande lus-asserties (geen classifier).
  const fns = new Set(def.checks.map((c) => c.fn));
  assert.ok(fns.has("lusVorm") && fns.has("lusGrenzen") &&
    fns.has("heeftReturn") && fns.has("methodeSignatuur"));
});

test("write: de lege stub zakt op de eerste ontbrekende methode", () => {
  const def = puzzel("l5-editor-write");
  const r = editor.evalueer(def, def.varianten[0]);
  assert.equal(r.javac.ok, true);
  assert.equal(r.geslaagd, false);
  assert.equal(r.eersteFout.meldingKey, "methodeSignatuur.ontbreekt");
});

test("write: gecureerde fouten falen gericht (off-by-one, return vergeten)", () => {
  const def = puzzel("l5-editor-write");
  const offByOne = def.model.replace("i < inventaris.size()", "i <= inventaris.size()");
  const a = editor.evalueer(def, offByOne);
  assert.equal(a.geslaagd, false);
  assert.equal(a.eersteFout.meldingKey, "lusGrenzen.offByOne");

  const zonderReturn = def.model.replace("        return sterkste;\n", "");
  const b = editor.evalueer(def, zonderReturn);
  assert.equal(b.geslaagd, false);
  assert.equal(b.eersteFout.meldingKey, "heeftReturn.ontbreekt");
});

test("write: elke check-uitsleutel resolveert naar een CHECK_OK-label", () => {
  const labels = AL.strings.pcCheckLabels;
  for (const c of puzzel("l5-editor-write").checks) {
    assert.ok(labels[c.uit] && labels[c.uit].length > 0, `label ontbreekt: ${c.uit}`);
  }
});

// ===========================================================================
// Parsons — de string-builder (opbouw-kaart)
// ===========================================================================

test("parsons: de juiste volgorde (uit de seeded shuffle) slaagt", () => {
  const def = puzzel("l5-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  assert.equal(correct.length, def.regels.length);
  assert.equal(parsons.verifieerVolgorde(def, SEED, correct.join(" ")).ok, true);
});

test("parsons: een verkeerde volgorde wijst de eerste mis-positie aan", () => {
  const def = puzzel("l5-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  const fout = correct.slice();
  [fout[0], fout[1]] = [fout[1], fout[0]];
  const r = parsons.verifieerVolgorde(def, SEED, fout.join(" "));
  assert.equal(r.ok, false);
  assert.equal(r.reden, "volgorde");
});

test("parsons: de overschrijf-afleider valt buiten het aantal", () => {
  const def = puzzel("l5-parsons");
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
// Welke-patroonkaart — totaliseren
// ===========================================================================

test("patroonkaart: enkel de totaliseer-kaart (2) slaagt", () => {
  const def = puzzel("l5-patroonkaart");
  assert.equal(def.antwoord, 2);
  assert.equal(terminal.checkPatroonkaart(def, "2").ok, true);
  assert.equal(terminal.checkPatroonkaart(def, "1").ok, false);
  assert.equal(terminal.checkPatroonkaart(def, "4").ok, false);
  assert.equal(def.opties.length, 4);
});

// ===========================================================================
// Hint-staging
// ===========================================================================

for (const id of ["l5-editor-write", "l5-parsons", "l5-patroonkaart"]) {
  test(`hints ${id}: drie distincte stadia, dan geen-meer`, () => {
    const t = AL.world.nieuw(1);
    const teksten = [];
    for (let i = 1; i <= 3; i++) {
      const h = AL.levels.hint(t, "5", id);
      assert.deepEqual(h.effecten, ["hint:" + i]);
      teksten.push(h.tekst[0]);
    }
    assert.equal(new Set(teksten).size, 3);
    const h4 = AL.levels.hint(t, "5", id);
    assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
    assert.equal(t.levels["5"].puzzels[id].hints, 3);
  });
}
