// test-pc-logic.mjs — de DOM-vrije delen van de gesimuleerde pc (WP 5).
// Toetst de pure puzzel-beoordeling zonder browser: editor-compilatie (javacsim
// + asserties), de tolerante trace-vergelijking, de vind-de-fout-antwoorden, de
// Parsons-ordeverificatie (incl. afleiders), de patroonkaart-keuze, en de
// volledigheid van de meldingKey→strings-vertaling voor élke corpus-meldingKey.
//
// De pc-modules hangen aan globalThis.AL en raken bij require() geen DOM aan
// (de DOM-methodes worden hier niet aangeroepen). Zo blijft de puzzellogica
// Node-testbaar, net als de checker eronder.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadLogica, laadChecker } from "./helpers.mjs";
import { fragmenten } from "./checker-corpus/index.mjs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const AL = laadLogica();
laadChecker();
require(join(wortel, "js", "pc", "editor.js"));
require(join(wortel, "js", "pc", "terminal.js"));
require(join(wortel, "js", "pc", "parsons.js"));
require(join(wortel, "js", "pc", "pc.js"));
const level0 = require(join(wortel, "js", "levels", "level0.js"));

const editor = AL.pc.editor;
const terminal = AL.pc.terminal;
const parsons = AL.pc.parsons;

function puzzel(id) {
  return level0.puzzels.find((p) => p.id === id);
}
const SEED = 42;

// ===========================================================================
// Editor — evalueer(): javacsim + asserties (t/m de eerste falende)
// ===========================================================================

test("editor.evalueer: het Voorwerp-model slaagt (javac schoon, alle checks ok)", () => {
  const def = puzzel("l0-editor-repair");
  const r = editor.evalueer(def, def.model);
  assert.equal(r.javac.ok, true, "javac gaf onterecht diagnoses");
  assert.equal(r.geslaagd, true);
  assert.equal(r.eersteFout, null);
  assert.ok(r.checks.every((c) => c.ok));
});

test("editor.evalueer: beide beschadigde Voorwerp-varianten zakken op een toewijzing", () => {
  const def = puzzel("l0-editor-repair");
  for (const code of def.varianten) {
    const r = editor.evalueer(def, code);
    assert.equal(r.javac.ok, true, "beschadigde variant hoort javac-schoon te zijn");
    assert.equal(r.geslaagd, false);
    assert.equal(r.eersteFout.meldingKey, "constructorToewijzing.ontbreekt");
  }
});

test("editor.evalueer: het Geitje-model slaagt; de stub zakt op een ontbrekend veld", () => {
  const def = puzzel("l0-editor-write");
  const goed = editor.evalueer(def, def.model);
  assert.equal(goed.geslaagd, true);
  const stub = editor.evalueer(def, def.varianten[0]);
  assert.equal(stub.geslaagd, false);
  assert.equal(stub.eersteFout.meldingKey, "veldDeclaratie.ontbreekt");
});

test("editor.evalueer: een ontbrekende puntkomma blokkeert de asserties (laag 1)", () => {
  const def = puzzel("l0-editor-repair");
  const kapot = def.model.replace("this.kracht = 0;", "this.kracht = 0");
  const r = editor.evalueer(def, kapot);
  assert.equal(r.javac.ok, false);
  assert.equal(r.geslaagd, false);
  assert.equal(r.checks.length, 0, "de asserties horen niet te draaien als javac faalt");
});

test("editor: elke check-uitsleutel resolveert naar een CHECK_OK-label", () => {
  const labels = AL.strings.pcCheckLabels;
  for (const id of ["l0-editor-repair", "l0-editor-write"]) {
    for (const c of puzzel(id).checks) {
      assert.ok(labels[c.uit] && labels[c.uit].length > 0,
        `ontbrekend label voor check-uit '${c.uit}'`);
    }
  }
});

// ===========================================================================
// Trace / voorspel-de-output — tolerante vergelijking
// ===========================================================================

test("trace: seed-keuze is deterministisch en het verwachte antwoord klopt", () => {
  const def = puzzel("l0-trace");
  const n1 = AL.levels.poolPick(SEED, def.pool, def.label);
  const n2 = AL.levels.poolPick(SEED, def.pool, def.label);
  assert.equal(n1, n2, "poolPick moet deterministisch zijn per seed");
  assert.equal(def.verwacht(4), "10");   // 1+2+3+4
  assert.equal(def.verwacht(n1), String((n1 * (n1 + 1)) / 2));
});

test("trace: tolerante vergelijking (whitespace, numeriek), fout blijft fout", () => {
  const def = puzzel("l0-trace");
  assert.equal(terminal.checkTrace(def, 4, "10").ok, true);
  assert.equal(terminal.checkTrace(def, 4, "  10 ").ok, true);
  assert.equal(terminal.checkTrace(def, 4, "totaal = 10").ok, true);
  assert.equal(terminal.checkTrace(def, 4, "9").ok, false);
  assert.equal(terminal.checkTrace(def, 5, "15").ok, true);   // 1+2+3+4+5
});

// ===========================================================================
// Vind-de-fout — aanvaarde antwoorden
// ===========================================================================

test("vind-de-fout: regelnummer of aanvaard sleutelwoord slaagt; de rest faalt", () => {
  const def = puzzel("l0-vindfout");
  assert.equal(terminal.checkVindfout(def, "1").ok, true);
  assert.equal(terminal.checkVindfout(def, "regel 1").ok, true);
  assert.equal(terminal.checkVindfout(def, "<=").ok, true);
  assert.equal(terminal.checkVindfout(def, "de lusgrens gaat te ver").ok, true);
  assert.equal(terminal.checkVindfout(def, "2").ok, false);
  assert.equal(terminal.checkVindfout(def, "regel 3").ok, false);
});

// ===========================================================================
// Welke-patroonkaart — exacte keuze
// ===========================================================================

test("patroonkaart: enkel de juiste keuze (1) slaagt", () => {
  const def = puzzel("l0-patroonkaart");
  assert.equal(terminal.checkPatroonkaart(def, "1").ok, true);
  assert.equal(terminal.checkPatroonkaart(def, "kaart 1").ok, true);
  assert.equal(terminal.checkPatroonkaart(def, "2").ok, false);
  assert.equal(terminal.checkPatroonkaart(def, "4").ok, false);
});

// ===========================================================================
// Parsons — ordeverificatie incl. afleiders
// ===========================================================================

test("parsons: shuffle is deterministisch per seed", () => {
  const def = puzzel("l0-parsons");
  const a = parsons.geschud(def, SEED);
  const b = parsons.geschud(def, SEED);
  assert.deepEqual(a, b);
  assert.equal(a.length, def.regels.length + def.distractors.length);
});

test("parsons: de juiste volgorde (uit de seeded shuffle) slaagt", () => {
  const def = puzzel("l0-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  assert.equal(correct.length, def.regels.length);
  const r = parsons.verifieerVolgorde(def, SEED, correct.join(" "));
  assert.equal(r.ok, true);
});

test("parsons: verkeerde volgorde wijst de eerste mis-positie aan", () => {
  const def = puzzel("l0-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  // Verwissel de eerste twee posities.
  const fout = correct.slice();
  [fout[0], fout[1]] = [fout[1], fout[0]];
  const r = parsons.verifieerVolgorde(def, SEED, fout.join(" "));
  assert.equal(r.ok, false);
  assert.equal(r.reden, "volgorde");
  assert.equal(r.positie, 1);
});

test("parsons: een afleider meenemen geeft het verkeerde aantal stroken", () => {
  const def = puzzel("l0-parsons");
  const correct = parsons.correcteVolgorde(def, SEED);
  const alle = parsons.geschud(def, SEED);
  // Voeg de positie van een strook toe die niet in de correcte volgorde zit.
  let afleiderPos = null;
  for (let i = 1; i <= alle.length; i++) {
    if (correct.indexOf(i) === -1) { afleiderPos = i; break; }
  }
  assert.ok(afleiderPos !== null);
  const metAfleider = correct.concat([afleiderPos]);
  const r = parsons.verifieerVolgorde(def, SEED, metAfleider.join(" "));
  assert.equal(r.ok, false);
  assert.equal(r.reden, "aantal");
});

// ===========================================================================
// meldingKey → strings: volledigheid voor élke corpus-meldingKey
// ===========================================================================

test("pcMelding dekt elke assert-meldingKey uit de checker-corpus", () => {
  const gebruikt = new Set();
  for (const fragment of fragmenten) {
    for (const f of fragment.falen) {
      if (f.verwacht.laag === "assert") gebruikt.add(f.verwacht.meldingKey);
    }
  }
  assert.ok(gebruikt.size > 0, "geen enkele assert-meldingKey gevonden");
  for (const key of gebruikt) {
    const tekst = AL.strings.pcMelding[key];
    assert.ok(typeof tekst === "string" && tekst.length > 0,
      `pcMelding mist een vertaling voor '${key}'`);
  }
});

test("pcMelding dekt ook de volledige assertie-woordenlijst (geen gaten)", () => {
  const vocab = [
    "veldDeclaratie.ontbreekt", "veldDeclaratie.nietPrivate",
    "constructorSignatuur.ontbreekt", "constructorSignatuur.verkeerdeParams",
    "constructorToewijzing.ontbreekt", "constructorToewijzing.omgekeerd",
    "methodeSignatuur.ontbreekt", "methodeSignatuur.verkeerdRetour",
    "methodeSignatuur.verkeerdeParams", "methodeSignatuur.verkeerdeZichtbaarheid",
    "heeftReturn.ontbreekt", "heeftReturn.verkeerdeVorm", "heeftReturn.methodeOntbreekt",
    "conditie.operatorOntbreekt", "conditie.verkeerdeOperator", "conditie.methodeOntbreekt",
    "validatieKlem.onvolledig", "validatieKlem.verkeerdeRichting", "validatieKlem.methodeOntbreekt",
    "lusVorm.ontbreekt", "lusVorm.verkeerdeSoort", "lusVorm.methodeOntbreekt",
    "lusGrenzen.ontbreekt", "lusGrenzen.offByOne", "lusGrenzen.verkeerdeGrens", "lusGrenzen.methodeOntbreekt",
    "aanroepKeten.onvolledig", "aanroepKeten.nullCheckOntbreekt",
    "aanroepKeten.nietAaneengesloten", "aanroepKeten.methodeOntbreekt",
    "methodeAanroep.ontbreekt", "methodeAanroep.methodeOntbreekt",
    "verboden.switch", "verboden.enum", "verboden.lambda",
    "verboden.ternary", "verboden.var", "verboden.stream"
  ];
  for (const key of vocab) {
    assert.ok((AL.strings.pcMelding[key] || "").length > 0,
      `pcMelding mist '${key}'`);
  }
});

// ===========================================================================
// Level 0 — registratie + verse puzzelstaat (dev-level "0")
// ===========================================================================

test("level 0 registreert zich in Node en krijgt een verse puzzelstaat", () => {
  assert.ok(AL.levels.isGeregistreerd("0"));
  const t = AL.world.nieuw(SEED);
  assert.ok(t.levels["0"], "verse staat mist level 0");
  // De editor-puzzels dragen een draft-veld (concept-behoud).
  assert.equal(t.levels["0"].puzzels["l0-editor-repair"].draft, "");
  assert.equal(t.levels["0"].puzzels["l0-trace"].draft, undefined);
  // Level 0 telt niet mee voor de voortgang (alleen 1..7).
  t.levels["0"].afgerond = true;
  assert.equal(AL.levels.aantalAfgerond(t), 0);
});
