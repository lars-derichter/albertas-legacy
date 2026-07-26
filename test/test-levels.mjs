// test-levels.mjs — het level/puzzel-framework: registratie, puzzel-
// levenscyclus, hint-staging (drie stadia + geen-meer), de seed-gestuurde
// variatie-determinisme, en de voortgang. Getoetst aan save-en-hints.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadLogica } from "./helpers.mjs";

const AL = laadLogica();
const levels = AL.levels;
const world = AL.world;

test("registratie: het placeholder-level 1 is geregistreerd met drie puzzels", () => {
  assert.ok(levels.isGeregistreerd("1"));
  const defs = levels.puzzelDefs("1");
  assert.equal(defs.length, 3);
  assert.deepEqual(defs.map((d) => d.id).sort(),
    ["l1-editor", "l1-trace", "l1-verklaar"]);
});

test("registreer voegt een level toe; verseLevels bouwt de puzzelstaat", () => {
  levels.registreer("test", { puzzels: [{ id: "t-1", type: "editor" }] });
  assert.ok(levels.isGeregistreerd("test"));
  const lv = levels.verseLevels();
  // De editor-puzzel van level 1 krijgt een draft-veld (concept-behoud).
  assert.equal(lv["1"].puzzels["l1-editor"].draft, "");
  assert.equal(lv["1"].puzzels["l1-trace"].draft, undefined);
  assert.equal(lv["1"].puzzels["l1-editor"].status, "open");
  assert.equal(lv["1"].puzzels["l1-editor"].hints, 0);
});

test("puzzel-levenscyclus: open → bezig → af, en level-af bij de laatste", () => {
  const t = world.nieuw(1);
  assert.equal(levels.markeerBezig(t, "1", "l1-editor").status, "bezig");

  let r = levels.voltooiPuzzel(t, "1", "l1-editor");
  assert.ok(r.effecten.includes("puzzle-af:l1-editor"));
  assert.ok(!r.effecten.includes("level-af:1"));
  assert.equal(t.levels["1"].puzzels["l1-editor"].status, "af");

  levels.voltooiPuzzel(t, "1", "l1-trace");
  r = levels.voltooiPuzzel(t, "1", "l1-verklaar");   // de laatste
  assert.ok(r.effecten.includes("puzzle-af:l1-verklaar"));
  assert.ok(r.effecten.includes("level-af:1"));
  assert.equal(t.levels["1"].afgerond, true);
});

test("hint-staging: drie oplopende stadia, dan hint:geen-meer", () => {
  const t = world.nieuw(1);
  const h1 = levels.hint(t, "1", "l1-editor");
  assert.deepEqual(h1.effecten, ["hint:1"]);
  assert.equal(h1.tekst[0], AL.strings.puzzelHints["l1-editor"][0]);

  const h2 = levels.hint(t, "1", "l1-editor");
  assert.deepEqual(h2.effecten, ["hint:2"]);
  const h3 = levels.hint(t, "1", "l1-editor");
  assert.deepEqual(h3.effecten, ["hint:3"]);

  // Vierde aanvraag: geen nieuwe hint.
  const h4 = levels.hint(t, "1", "l1-editor");
  assert.deepEqual(h4.effecten, ["hint:geen-meer"]);
  assert.deepEqual(h4.tekst, [AL.strings.hintGeenMeer]);

  // De teller staat op 3; hintsTotaal telt de drie echte hints (niet de vierde).
  assert.equal(t.levels["1"].puzzels["l1-editor"].hints, 3);
  assert.equal(t.hintsTotaal, 3);
});

test("hints tellen per puzzel op in hintsTotaal", () => {
  const t = world.nieuw(1);
  levels.hint(t, "1", "l1-editor");
  levels.hint(t, "1", "l1-trace");
  assert.equal(t.hintsTotaal, 2);
  assert.equal(t.levels["1"].puzzels["l1-editor"].hints, 1);
  assert.equal(t.levels["1"].puzzels["l1-trace"].hints, 1);
});

// ===========================================================================
// De volgorde-poort binnen een level (WP 48b)
// ===========================================================================

test("poort: de eerste puzzel is altijd speelbaar, de rest wacht", () => {
  const t = world.nieuw(1);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 0), true);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 1), false);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 2), false);
});

test("poort: puzzel k opent zodra 0..k-1 af zijn, één stap per keer", () => {
  const t = world.nieuw(1);
  // "bezig" is niet genoeg — alleen "af" opent de volgende.
  levels.markeerBezig(t, "1", "l1-editor");
  assert.equal(levels.puzzelSpeelbaar(t, "1", 1), false);

  levels.voltooiPuzzel(t, "1", "l1-editor");
  assert.equal(levels.puzzelSpeelbaar(t, "1", 1), true);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 2), false);   // nog één te gaan

  levels.voltooiPuzzel(t, "1", "l1-trace");
  assert.equal(levels.puzzelSpeelbaar(t, "1", 2), true);
});

test("poort: een afgewerkte puzzel blijft opnieuw te openen", () => {
  const t = world.nieuw(1);
  levels.voltooiPuzzel(t, "1", "l1-editor");
  levels.voltooiPuzzel(t, "1", "l1-trace");
  // De poort kijkt alleen vooruit: alle drie blijven bereikbaar, ook de twee
  // die al "af" staan.
  assert.equal(levels.puzzelSpeelbaar(t, "1", 0), true);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 1), true);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 2), true);
});

test("poort: onbekende indexen en levels zijn niet speelbaar", () => {
  const t = world.nieuw(1);
  assert.equal(levels.puzzelSpeelbaar(t, "1", -1), false);
  assert.equal(levels.puzzelSpeelbaar(t, "1", 3), false);
  assert.equal(levels.puzzelSpeelbaar(t, "geen-level", 0), false);
});

test("poort: op id — puzzelIndex en puzzelSpeelbaarId", () => {
  const t = world.nieuw(1);
  assert.equal(levels.puzzelIndex("1", "l1-trace"), 1);
  assert.equal(levels.puzzelIndex("1", "bestaat-niet"), -1);
  assert.equal(levels.puzzelSpeelbaarId(t, "1", "l1-editor"), true);
  assert.equal(levels.puzzelSpeelbaarId(t, "1", "l1-trace"), false);
  assert.equal(levels.puzzelSpeelbaarId(t, "1", "bestaat-niet"), false);
  levels.voltooiPuzzel(t, "1", "l1-editor");
  assert.equal(levels.puzzelSpeelbaarId(t, "1", "l1-trace"), true);
});

test("poort: hij leest de save en voegt er niets aan toe (hervatten werkt)", () => {
  const t = world.nieuw(1);
  levels.voltooiPuzzel(t, "1", "l1-editor");
  // Rondreis door JSON, zoals de save doet: de poort staat daarna gelijk.
  const herladen = JSON.parse(JSON.stringify(t));
  assert.equal(levels.puzzelSpeelbaar(herladen, "1", 1), true);
  assert.equal(levels.puzzelSpeelbaar(herladen, "1", 2), false);
  // Geen nieuw veld in de puzzelstaat.
  assert.deepEqual(Object.keys(herladen.levels["1"].puzzels["l1-trace"]).sort(),
    ["hints", "status"]);
});

test("variatie: dezelfde seed geeft dezelfde picks", () => {
  const opties = ["a", "b", "c", "d"];
  assert.equal(levels.kiesVariant(777, opties, "variant"),
    levels.kiesVariant(777, opties, "variant"));
  assert.deepEqual(levels.shuffle(777, opties, "shuffle"),
    levels.shuffle(777, opties, "shuffle"));
  assert.equal(levels.poolPick(777, [10, 20, 30], "trace"),
    levels.poolPick(777, [10, 20, 30], "trace"));
});

test("variatie: verschillende seeds verschillen ergens", () => {
  const opties = ["a", "b", "c", "d", "e", "f", "g", "h"];
  // Over een reeks seeds moet minstens één beslissing verschillen.
  let verschil = false;
  for (let s = 1; s <= 20 && !verschil; s++) {
    if (levels.kiesVariant(s, opties, "v") !== levels.kiesVariant(s + 100, opties, "v")) {
      verschil = true;
    }
    const a = levels.shuffle(s, opties, "s");
    const b = levels.shuffle(s + 100, opties, "s");
    if (JSON.stringify(a) !== JSON.stringify(b)) verschil = true;
  }
  assert.ok(verschil, "verschillende seeds gaven overal exact dezelfde uitkomst");
});

test("variatie: shuffle muteert de invoer niet en behoudt de elementen", () => {
  const bron = [1, 2, 3, 4, 5];
  const kopie = bron.slice();
  const uit = levels.shuffle(5, bron, "s");
  assert.deepEqual(bron, kopie);                 // niet gemuteerd
  assert.deepEqual(uit.slice().sort(), bron.slice().sort());  // zelfde multiset
});

test("variatie: labels maken beslissingen onafhankelijk", () => {
  // Zelfde seed, ander label → doorgaans een andere pick.
  const opties = ["a", "b", "c", "d", "e", "f"];
  let ongelijk = 0;
  for (let s = 1; s <= 30; s++) {
    if (levels.kiesVariant(s, opties, "A") !== levels.kiesVariant(s, opties, "B")) {
      ongelijk++;
    }
  }
  assert.ok(ongelijk > 0, "labels gaven overal exact dezelfde pick");
});

test("voortgang: aantalAfgerond en alAf", () => {
  const t = world.nieuw(1);
  assert.equal(levels.aantalAfgerond(t), 0);
  assert.equal(levels.alAf(t), false);
  t.levels["1"].afgerond = true;
  assert.equal(levels.aantalAfgerond(t), 1);
  for (let n = 2; n <= 7; n++) t.levels[String(n)].afgerond = true;
  assert.equal(levels.alAf(t), true);
});
