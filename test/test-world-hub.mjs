// test-world-hub.mjs — de uitgebreide zolder-hub (WP 6): de vier-kamer-navigatie,
// de prop-interacties, de fragment-progressie west → midden → overloop, de pc-
// opening, de spread-data (paging + weekregels), en de endgame-sequence (sim →
// Alberta's oordeel → epiloog). Getoetst aan spelontwerp-legacy.md,
// levels-en-scharnieren.md, save-en-hints.md en achtergrond.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadLogica } from "./helpers.mjs";

const AL = laadLogica();
const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
// De spread-renderer + het intro/level-data leven in de scène-laag; laad ze bij.
require(join(wortel, "js", "scenes", "scene-spread-template.js"));

const world = AL.world;
const strings = AL.strings;
const levels = AL.levels;

// ---- Navigatie ------------------------------------------------------------

test("de hub verbindt vier kamers; overloop hangt noord aan de doorgang", () => {
  const paren = [
    ["zolder-west", "oost", "zolder-midden", "west"],
    ["zolder-midden", "oost", "zolder-oost", "west"],
    ["zolder-midden", "noord", "overloop", "zuid"]
  ];
  for (const [a, richting, b, terug] of paren) {
    const ta = world.nieuw(); ta.sceneId = a;
    assert.equal(world.uitgangen(ta)[richting], b, `${a} → ${richting}`);
    const tb = world.nieuw(); tb.sceneId = b;
    assert.equal(world.uitgangen(tb)[terug], a, `${b} → ${terug}`);
  }
});

test("betreed loopt van de doorgang naar de overloop en terug", () => {
  const t = world.nieuw(); t.sceneId = "zolder-midden";
  const omhoog = world.betreed(t, "noord");
  assert.equal(t.sceneId, "overloop");
  assert.ok(omhoog.effecten.includes("scene:overloop"));
  assert.ok(omhoog.tekst.some((r) => r.includes("overloop")));
  const omlaag = world.betreed(t, "zuid");
  assert.equal(t.sceneId, "zolder-midden");
  assert.ok(omlaag.effecten.includes("scene:zolder-midden"));
});

// ---- Prop-interacties -----------------------------------------------------

test("onderzoek beschrijft de props per kamer", () => {
  const t = world.nieuw();
  t.sceneId = "zolder-oost";
  assert.ok(world.onderzoek(t, "pc").tekst[0].includes("pc"));
  assert.ok(world.onderzoek(t, "stoel").tekst[0].length > 0);
  assert.ok(world.onderzoek(t, "koffiemok").tekst[0].length > 0);
  t.sceneId = "zolder-midden";
  assert.deepEqual(world.onderzoek(t, "broncode-doos").tekst,
    [strings.scenes["zolder-midden"].beschrijving]);
  assert.deepEqual(world.onderzoek(t, "doos").tekst, [strings.dozen.onderzoek]);
});

test("de broncode-doos telt pas op het einde (geen fragment-effect)", () => {
  const t = world.nieuw(); t.sceneId = "zolder-midden";
  const r = world.open(t, "broncode-doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.scenes["zolder-midden"].hint]);
  // De broncode-doos ontgrendelt geen enkel level.
  for (let n = 1; n <= 7; n++) assert.equal(t.levels[String(n)].ontgrendeld, false);
});

// ---- Fragment-progressie --------------------------------------------------

test("volgendFragment loopt strikt oplopend 1..7 en dan null", () => {
  const t = world.nieuw();
  assert.equal(world.volgendFragment(t), 1);
  for (let n = 1; n <= 7; n++) t.levels[String(n)].ontgrendeld = true;
  assert.equal(world.volgendFragment(t), null);
});

test("de fragmenten liggen west → midden → overloop, in volgorde", () => {
  const t = world.nieuw();
  // Level 1: het notitieboek in de westhoek.
  let r = world.open(t, "notitieboek");
  assert.ok(r.effecten.includes("fragment-gevonden:l1"));
  assert.ok(r.effecten.includes("spread:l1"));

  // Levels 2–4: de gemerkte dozen in de doorgang.
  t.sceneId = "zolder-midden";
  for (const n of [2, 3, 4]) {
    r = world.open(t, "doos");
    assert.ok(r.effecten.includes("fragment-gevonden:l" + n), "l" + n);
    assert.equal(t.levels[String(n)].ontgrendeld, true);
  }
  // Het vijfde fragment ligt niet meer hier: de doos wijst naar de overloop.
  r = world.open(t, "doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.dozen.nietHier["overloop"]]);

  // Levels 5–7: de dozen op de overloop.
  t.sceneId = "overloop";
  for (const n of [5, 6, 7]) {
    r = world.open(t, "doos");
    assert.ok(r.effecten.includes("fragment-gevonden:l" + n), "l" + n);
  }
  // Alles gevonden.
  r = world.open(t, "doos");
  assert.deepEqual(r.tekst, [strings.dozen.allesGevonden]);
  // De fragment-progressie telt NIET in hintsTotaal.
  assert.equal(t.hintsTotaal, 0);
});

test("een doos in de verkeerde kamer wijst naar de juiste plek", () => {
  const t = world.nieuw();          // nog niets ontgrendeld: volgende = l1 (west)
  t.sceneId = "zolder-midden";
  const r = world.open(t, "doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.dozen.nietHier["zolder-west"]]);
});

// ---- Aan de pc gaan zitten ------------------------------------------------

test("ga zitten opent de pc zodra een fragment ontgrendeld is", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.sceneId = "zolder-oost";
  const r = world.gebruikPc(t);
  assert.equal(t.modus, "pc");
  assert.ok(r.effecten.includes("pc:open"));
  assert.ok(r.effecten.includes("level-start:1"));
});

// ---- Spread-data (paging + weekregels) ------------------------------------

test("elke level-spread telt meerdere pagina's", () => {
  for (let n = 1; n <= 7; n++) {
    const data = strings.spreads["l" + n];
    assert.ok(data, "spread l" + n);
    assert.ok(AL.spreads.aantalPaginas(data) >= 2, "l" + n + " pagina's");
  }
  assert.ok(AL.spreads.aantalPaginas(strings.spreads.intro) >= 2);
});

test("de weekregels gebruiken de echte cursusweken 1,2,2,3,4,5,6", () => {
  const verwacht = [1, 2, 2, 3, 4, 5, 6];
  for (let n = 1; n <= 7; n++) {
    const data = strings.spreads["l" + n];
    assert.equal(data.week, verwacht[n - 1], "week van l" + n);
    // De weekregel staat als voet op een pagina, met de juiste week.
    const voeten = data.paginas.map((p) => p.voet).filter(Boolean);
    assert.ok(voeten.some((v) => v.includes("week " + verwacht[n - 1] + " ")),
      "weekregel l" + n);
  }
});

test("de intro-spread draagt de prototype-regel verbatim", () => {
  const plat = JSON.stringify(strings.spreads.intro);
  assert.ok(plat.includes(
    "Alberta bouwde elk spel eerst als tekstversie in de terminal."));
});

// ---- Endgame: sim → oordeel → epiloog -------------------------------------

test("startOordeel kiest de tier uit hintsTotaal en zet de modus", () => {
  const gevallen = [
    [0, "meesterhand"], [3, "meesterhand"], [4, "vakvrouw"], [10, "vakvrouw"],
    [11, "doorzetter"], [20, "doorzetter"], [21, "samen-geraakt"], [99, "samen-geraakt"]
  ];
  for (const [h, tier] of gevallen) {
    const t = world.nieuw(); t.hintsTotaal = h;
    const r = world.startOordeel(t);
    assert.equal(t.modus, "oordeel");
    assert.equal(t.einde, tier, "h=" + h);
    assert.ok(r.effecten.includes("oordeel:" + tier));
    // De getoonde tier heeft een titel + tekst.
    assert.ok(strings.oordeel[tier].titel.length > 0);
    assert.equal(levels.oordeel(h), tier);
  }
});

test("simVoltooid leidt van de sim naar Alberta's oordeel", () => {
  const t = world.nieuw(); t.hintsTotaal = 15;
  const r = world.simVoltooid(t, "wraak");
  assert.ok(r.effecten.includes("sim:einde:wraak"));
  assert.ok(r.effecten.includes("oordeel:doorzetter"));
  assert.equal(t.modus, "oordeel");
});

test("bootSim kondigt de endgame aan", () => {
  const t = world.nieuw();
  const r = world.bootSim(t);
  assert.ok(r.effecten.includes("sim:boot"));
  assert.ok(r.effecten.includes("geluid:boot"));
});

test("de epiloog is bereikbaar en wijst naar de broncode + Roberta", () => {
  const t = world.nieuw();
  world.startOordeel(t);
  const r = world.startEpiloog(t);
  assert.equal(t.modus, "epiloog");
  assert.ok(r.effecten.includes("epiloog"));
  const tekst = r.tekst.join(" ");
  assert.ok(tekst.includes("seven-little-goats/"), "wijst naar de broncode");
  assert.ok(tekst.includes(
    "Voor Roberta Williams, en voor iedereen die de spellen maakte waar dit " +
    "vak vandaan komt"), "de Roberta-opdracht, verbatim");
});
