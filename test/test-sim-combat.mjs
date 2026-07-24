// test-sim-combat.mjs — Node-tests voor AL.sim.combat: het vaste aanvalspatroon,
// de smeekdrempel, verdedigen (halve schade, gehele deling), de rode mantel
// (vangt 1 op), max vijf rondes, het schade-overzicht en volledige
// determinisme (geen Math.random). DOM-vrij.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
require(join(wortel, "js", "sim", "goats-strings.js"));
require(join(wortel, "js", "sim", "goats-world.js"));
require(join(wortel, "js", "sim", "goats-combat.js"));
const W = globalThis.AL.sim.world;
const C = globalThis.AL.sim.combat;

const NAAR_RIVIER = ["ga zuid", "ga zuid", "ga zuid", "ga zuid", "ga zuid", "ga zuid"];

function draai(t, commandos) {
  const alles = [];
  let laatste = { tekst: [], effecten: [] };
  for (const c of commandos) { laatste = W.verwerk(t, c); alles.push(...laatste.tekst); }
  return { alles, tekst: alles.join("\n"), laatste };
}

test("javaDouble spiegelt Double.toString: gehele waarden krijgen .0", () => {
  assert.equal(C._javaDouble(5), "5.0");
  assert.equal(C._javaDouble(2), "2.0");
  assert.equal(C._javaDouble(2.5), "2.5");
});

test("schade-overzicht telt, totaliseert, middelt en zoekt het uiterste", () => {
  const overzicht = C._schadeOverzicht([5, 5, 5, 0, 0], 3);
  assert.ok(overzicht.includes("Rondes gevochten: 3"));
  assert.ok(overzicht.includes("Totale schade:    15"));
  assert.ok(overzicht.includes("Gemiddeld:        5.0"));
  assert.ok(overzicht.includes("Grootste klap:    5"));
});

test("de rode mantel vangt telkens 1 schade op", () => {
  // Met mantel + mes: ronde 1 aanval 5, wolf slaat pattern[0]=3, mantel -> 2.
  const t = W.nieuw();
  draai(t, ["pak rode mantel", "pak keukenmes", ...NAAR_RIVIER]);
  const start = C.start(t);
  const r = W.verwerk(t, "val aan");
  assert.ok(r.tekst.some((l) => l.includes("De jonge wolf haalt uit voor 2 schade (jij nu 18 LP).")));

  // Zonder mantel: dezelfde ronde geeft de volle 3 schade.
  const t2 = W.nieuw();
  draai(t2, ["pak keukenmes", ...NAAR_RIVIER]);
  C.start(t2);
  const r2 = W.verwerk(t2, "val aan");
  assert.ok(r2.tekst.some((l) => l.includes("De jonge wolf haalt uit voor 3 schade (jij nu 17 LP).")));
});

test("verdedigen halveert de klap met gehele deling", () => {
  // Ronde 1 verdedigt: pattern[0]=3 -> 3/2 = 1 (gehele deling), geen mantel.
  const t = W.nieuw();
  draai(t, ["pak keukenmes", ...NAAR_RIVIER]);
  C.start(t);
  const r = W.verwerk(t, "verdedig");
  assert.ok(r.tekst.some((l) => l.includes("De jonge wolf haalt uit voor 1 schade")));
});

test("de smeekdrempel: de wolf smeekt bij <= 5 LP, de jachthond nooit", () => {
  // Wolf op 8 LP na twee treffers van 5 -> 8; derde treffer 3 -> onder drempel.
  const t = W.nieuw();
  draai(t, ["pak keukenmes", ...NAAR_RIVIER]);
  C.start(t);
  W.verwerk(t, "val aan"); // 18 -> 13
  W.verwerk(t, "val aan"); // 13 -> 8
  const r = W.verwerk(t, "val aan"); // 8 -> 3 (<= 5), smeekmoment volgt
  assert.equal(t.gevecht.fase, "smeek");
  assert.ok(r.tekst.some((l) => l.includes("heft zijn poten op")));

  // De jachthond (drempel 0) smeekt niet: sla hem gewoon dood.
  const t2 = W.nieuw();
  draai(t2, ["pak keukenmes", "ga zuid", "ga oost"]);
  C.start(t2);
  W.verwerk(t2, "val aan"); // 8 -> 3
  const r2 = W.verwerk(t2, "val aan"); // 3 -> 0 verslagen, nooit een smeekmoment
  assert.equal(t2.gevecht, null);
  assert.ok(r2.tekst.some((l) => l.includes("De jachthond is verslagen.")));
});

test("maximaal vijf rondes: daarna time-out (resultaat 3)", () => {
  const t = W.nieuw();
  const r = draai(t, [...NAAR_RIVIER, "vecht",
    "val aan", "val aan", "val aan", "val aan", "val aan"]);
  // Vijf rondes van 2 schade = 10; wolf houdt 8 over, geen beslissing -> game over.
  assert.equal(t.einde, "gameover");
  assert.ok(r.tekst.includes("Rondes gevochten: 5"));
});

test("determinisme: identieke invoer geeft identieke uitvoer, elke keer", () => {
  const script = ["pak rode mantel", "pak keukenmes", ...NAAR_RIVIER,
    "vecht", "val aan", "val aan", "val aan", "maak af"];
  const a = draai(W.nieuw(), script).tekst;
  const b = draai(W.nieuw(), script).tekst;
  const c = draai(W.nieuw(), script).tekst;
  assert.equal(a, b);
  assert.equal(b, c);
});

test("geen Math.random in de sim-broncode (determinisme-eis)", () => {
  const { readFileSync } = require("node:fs");
  for (const f of ["goats-strings.js", "goats-world.js", "goats-combat.js"]) {
    const bron = readFileSync(join(wortel, "js", "sim", f), "utf8");
    assert.ok(!/Math\.random\s*\(/.test(bron), `${f} bevat een Math.random-aanroep`);
  }
});
