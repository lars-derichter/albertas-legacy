// test-loopveld.mjs — de meetkunde van de beloopbare vloer (WP 32): walkboxes
// min blokken, de uitgangszones, en de randen. Alles headless op de
// Node-export van js/loopveld.js, plus de vier échte zolderkamers uit
// js/scenes/: dit is de laag waar een fout onzichtbaar in wegzakt, want een
// verkeerde rechthoek ziet er in het spel uit als "de speler blijft haken".
//
// Wat hier bewaakt wordt, komt rechtstreeks uit de bevindingen A, B en C van
// docs-loze verkenning in workflow/28-kwaliteitsreview-kickoff.md:
//   A  noord/zuid-uitgangen waren te voet onbereikbaar
//   B  de speler liep dwars door elk voorwerp
//   C  elke loopstrook liep tot x0/x319, dus tegen elke geschilderde muur
//      opende een modaal venster

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");

const loopveld = require(join(wortel, "js", "loopveld.js"));
const world = require(join(wortel, "js", "logic", "world.js"));
for (const id of ["zolder-west", "zolder-midden", "zolder-oost", "overloop"]) {
  require(join(wortel, "js", "scenes", "scene-" + id + ".js"));
}
const scenes = globalThis.AL.scenes;
const KAMERS = ["zolder-west", "zolder-midden", "zolder-oost", "overloop"];
const RICHTINGEN = ["noord", "oost", "zuid", "west"];

// ---- De rechthoek-rekenkunde ----------------------------------------------

test("een rechthoek [x,y,b,h] dekt inclusief zijn laatste rij en kolom", () => {
  const r = [10, 20, 4, 3];               // x10..13, y20..22
  assert.equal(loopveld.inRechthoek(r, 10, 20), true);
  assert.equal(loopveld.inRechthoek(r, 13, 22), true);
  assert.equal(loopveld.inRechthoek(r, 14, 22), false);
  assert.equal(loopveld.inRechthoek(r, 13, 23), false);
  assert.equal(loopveld.inRechthoek(r, 9, 20), false);
});

test("beloopbaar = in een walkbox én niet in een blok", () => {
  const scene = {
    walkboxes: [[0, 100, 100, 50]],
    blokken: [[40, 100, 20, 20]]
  };
  assert.equal(loopveld.beloopbaar(scene, 10, 110), true);
  assert.equal(loopveld.beloopbaar(scene, 45, 110), false, "in het blok");
  assert.equal(loopveld.beloopbaar(scene, 45, 125), true, "onder het blok");
  assert.equal(loopveld.beloopbaar(scene, 45, 90), false, "buiten de walkbox");
});

test("een scène zonder blokken of exits blijft geldig", () => {
  const scene = { walkboxes: [[0, 100, 10, 10]] };
  assert.equal(loopveld.beloopbaar(scene, 5, 105), true);
  assert.equal(loopveld.uitgangBij(scene, 5, 105), null);
  assert.deepEqual(loopveld.uitgangRichtingen(scene), []);
});

test("uitgangBij geeft de richting van de zone waar het punt in ligt", () => {
  const scene = {
    walkboxes: [[0, 100, 200, 50]],
    exits: [{ richting: "noord", rect: [50, 100, 20, 8] }]
  };
  assert.equal(loopveld.uitgangBij(scene, 60, 104), "noord");
  assert.equal(loopveld.uitgangBij(scene, 60, 108), null);
  assert.equal(loopveld.uitgangBij(scene, 49, 104), null);
  // De looprichting doet er niet toe: van welke kant je de zone ook binnenkomt,
  // het is dezelfde doorgang.
  assert.equal(loopveld.uitgangBij(scene, 50, 107), "noord");
});

test("raaktRand ziet welke schermrand een walkbox haalt", () => {
  const scene = { walkboxes: [[0, 150, 320, 39]] };
  assert.equal(loopveld.raaktRand(scene, "west", 8, 189), true);
  assert.equal(loopveld.raaktRand(scene, "oost", 8, 189), true);
  assert.equal(loopveld.raaktRand(scene, "noord", 8, 189), false);
  assert.equal(loopveld.raaktRand(scene, "zuid", 8, 189), false);
  const smal = { walkboxes: [[6, 152, 308, 37]] };
  for (const r of RICHTINGEN) {
    assert.equal(loopveld.raaktRand(smal, r, 8, 189), false, r);
  }
});

// ---- De vier echte kamers --------------------------------------------------

test("elke uitgang op de zolderkaart is te voet te bereiken", () => {
  for (const id of KAMERS) {
    const scene = scenes[id];
    const buren = world.uitgangen({ sceneId: id });
    for (const richting of RICHTINGEN) {
      if (buren[richting] === null) continue;
      const zone = loopveld.uitgangRichtingen(scene).includes(richting);
      const rand = loopveld.raaktRand(scene, richting, 8, 189);
      assert.ok(zone || rand,
        id + " → " + richting + " (" + buren[richting] + ") is onbereikbaar");
    }
  }
});

test("noord en zuid lopen via een zone, want geen strook haalt y8 of y189", () => {
  // Dit is bevinding A: de randkruising kán noord/zuid niet doen.
  for (const id of KAMERS) {
    const scene = scenes[id];
    assert.equal(loopveld.raaktRand(scene, "noord", 8, 189), false, id);
    assert.equal(loopveld.raaktRand(scene, "zuid", 8, 189), false, id);
  }
  assert.deepEqual(loopveld.uitgangRichtingen(scenes["zolder-midden"]),
    ["noord"]);
  assert.deepEqual(loopveld.uitgangRichtingen(scenes["overloop"]), ["zuid"]);
});

test("geen enkele strook raakt een rand waar geen kamer achter ligt", () => {
  // Dit is bevinding C: daar kwam de modale weigering elke seconde vandaan.
  for (const id of KAMERS) {
    const scene = scenes[id];
    const buren = world.uitgangen({ sceneId: id });
    for (const richting of RICHTINGEN) {
      if (buren[richting] !== null) continue;
      assert.equal(loopveld.raaktRand(scene, richting, 8, 189), false,
        id + " raakt de " + richting + "rand zonder buur");
    }
  }
});

test("elke entry is beloopbaar en ligt buiten elke uitgangszone", () => {
  for (const id of KAMERS) {
    const scene = scenes[id];
    for (const sleutel of Object.keys(scene.entries)) {
      const [x, y] = scene.entries[sleutel];
      assert.ok(loopveld.beloopbaar(scene, x, y),
        id + " entry " + sleutel + " is niet beloopbaar");
      assert.equal(loopveld.uitgangBij(scene, x, y), null,
        id + " entry " + sleutel + " staat in een uitgangszone");
    }
  }
});

test("elke uitgangszone heeft een beloopbare pixel", () => {
  for (const id of KAMERS) {
    const scene = scenes[id];
    for (const e of scene.exits || []) {
      let raak = false;
      for (let y = e.rect[1]; y < e.rect[1] + e.rect[3] && !raak; y++) {
        for (let x = e.rect[0]; x < e.rect[0] + e.rect[2]; x++) {
          if (loopveld.beloopbaar(scene, x, y)) { raak = true; break; }
        }
      }
      assert.ok(raak, id + " zone " + e.richting + " is onbereikbaar");
    }
  }
});

// ---- Bevinding B: de voorwerpen houden de speler tegen -------------------

test("de kist in de westhoek is niet te belopen, ervoor langs wel", () => {
  const scene = scenes["zolder-west"];
  assert.equal(loopveld.beloopbaar(scene, 190, 165), false, "midden in de kist");
  assert.equal(loopveld.beloopbaar(scene, 190, 155), false, "achter de kist");
  assert.equal(loopveld.beloopbaar(scene, 190, 182), true, "ervoor langs");
  assert.equal(loopveld.beloopbaar(scene, 130, 165), true, "ernaast");
});

test("de dozenstapels in de westhoek houden de speler tegen", () => {
  const scene = scenes["zolder-west"];
  assert.equal(loopveld.beloopbaar(scene, 60, 160), false);
  assert.equal(loopveld.beloopbaar(scene, 60, 175), true);
});

test("het bureau en de stoel in de werkhoek zijn massief", () => {
  const scene = scenes["zolder-oost"];
  assert.equal(loopveld.beloopbaar(scene, 116, 160), false, "linkerpoot");
  assert.equal(loopveld.beloopbaar(scene, 240, 160), false, "rechterpoot");
  assert.equal(loopveld.beloopbaar(scene, 150, 165), false, "de stoel");
  assert.equal(loopveld.beloopbaar(scene, 150, 180), true, "ervoor langs");
});

test("de dozen in de doorgang en op de overloop houden de speler tegen", () => {
  const midden = scenes["zolder-midden"];
  assert.equal(loopveld.beloopbaar(midden, 116, 178), false, "broncode-doos");
  assert.equal(loopveld.beloopbaar(midden, 236, 166), false, "doos");
  assert.equal(loopveld.beloopbaar(midden, 300, 158), false, "stapel rechts");
  const overloop = scenes["overloop"];
  assert.equal(loopveld.beloopbaar(overloop, 60, 160), false, "torens links");
  assert.equal(loopveld.beloopbaar(overloop, 262, 163), false, "toren rechts");
  assert.equal(loopveld.beloopbaar(overloop, 262, 180), true, "ervoor langs");
});

// ---- De routes die het spel nodig heeft -----------------------------------

// Een vloedvulling over de beloopbare pixels: van een startpunt uit, in vier
// richtingen, met stappen van één pixel. Wat hij niet raakt, is voor de speler
// niet te bereiken — en een fragment in een onbereikbare hoek is een spel dat
// vastloopt.
function bereikbaar(scene, start) {
  const gezien = new Set();
  const stapel = [start];
  const sleutel = (x, y) => x + "," + y;
  while (stapel.length > 0) {
    const [x, y] = stapel.pop();
    if (gezien.has(sleutel(x, y))) continue;
    if (!loopveld.beloopbaar(scene, x, y)) continue;
    gezien.add(sleutel(x, y));
    stapel.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return gezien;
}

test("vanaf elke entry is elke uitgang van de kamer te belopen", () => {
  for (const id of KAMERS) {
    const scene = scenes[id];
    const buren = world.uitgangen({ sceneId: id });
    for (const sleutel of Object.keys(scene.entries)) {
      const bereik = bereikbaar(scene, scene.entries[sleutel]);
      // De zones.
      for (const e of scene.exits || []) {
        let raak = false;
        for (let y = e.rect[1]; y < e.rect[1] + e.rect[3] && !raak; y++) {
          for (let x = e.rect[0]; x < e.rect[0] + e.rect[2]; x++) {
            if (bereik.has(x + "," + y)) { raak = true; break; }
          }
        }
        assert.ok(raak, id + ": zone " + e.richting + " niet te belopen vanaf " +
          sleutel);
      }
      // De randen.
      for (const richting of ["oost", "west"]) {
        if (buren[richting] === null) continue;
        const rand = richting === "west" ? 0 : 319;
        let raak = false;
        for (let y = 8; y <= 189 && !raak; y++) {
          if (bereik.has(rand + "," + y)) raak = true;
        }
        assert.ok(raak, id + ": " + richting + "rand niet te belopen vanaf " +
          sleutel);
      }
    }
  }
});

test("de trapcorridor verbindt de vloer met de noord-zone", () => {
  const scene = scenes["zolder-midden"];
  const bereik = bereikbaar(scene, scene.entries.vanWest);
  assert.ok(bereik.has("170,120"), "boven aan de trap");
  assert.ok(bereik.has("170,150"), "onder aan de trap");
});
