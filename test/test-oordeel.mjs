// test-oordeel.mjs — Alberta's oordeel-tiers op basis van hintsTotaal
// (save-en-hints.md, §"Alberta's oordeel"). De vier tiers, de drempels, en de
// koppeling naar de oordeel-teksten in strings.js.

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadLogica } from "./helpers.mjs";

const AL = laadLogica();
const levels = AL.levels;
const strings = AL.strings;

test("de vier tiers op hun drempels", () => {
  assert.equal(levels.oordeel(0), "meesterhand");
  assert.equal(levels.oordeel(3), "meesterhand");
  assert.equal(levels.oordeel(4), "vakvrouw");
  assert.equal(levels.oordeel(10), "vakvrouw");
  assert.equal(levels.oordeel(11), "doorzetter");
  assert.equal(levels.oordeel(20), "doorzetter");
  assert.equal(levels.oordeel(21), "samen-geraakt");
  assert.equal(levels.oordeel(999), "samen-geraakt");
});

test("elke tier heeft een titel en tekst in Alberta's stem", () => {
  for (const tier of ["meesterhand", "vakvrouw", "doorzetter", "samen-geraakt"]) {
    const o = strings.oordeel[tier];
    assert.ok(o, "oordeel-tekst voor " + tier);
    assert.ok(o.titel.length > 0);
    assert.ok(o.tekst.length > 0);
  }
});

test("de tier die de engine toont, mapt op een bestaande tekst", () => {
  for (const h of [0, 4, 11, 21]) {
    const tier = levels.oordeel(h);
    assert.ok(strings.oordeel[tier], "geen tekst voor tier bij hints=" + h);
  }
});
