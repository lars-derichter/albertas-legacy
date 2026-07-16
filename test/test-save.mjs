// test-save.mjs — de save-laag: round-trip met een neppe storage, herbegin, en
// de versionering/migratie-garantie uit save-en-hints.md. Alles DOM-vrij; de
// storage wordt geïnjecteerd.

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadLogica, nepStorage } from "./helpers.mjs";

const AL = laadLogica();
const world = AL.world;

test("opslaan → laad geeft exact dezelfde staat terug", () => {
  const st = nepStorage();
  const t = world.nieuw(123);
  t.levels["1"].ontgrendeld = true;
  t.hintsTotaal = 5;
  assert.equal(world.opslaan(st, t), true);
  const terug = world.laad(st, 999);
  assert.deepEqual(terug, t);
  // De seed van de save wint, niet de meegegeven fallback-seed.
  assert.equal(terug.seed, 123);
});

test("laad zonder save start een verse staat met de gegeven seed", () => {
  const st = nepStorage();
  const t = world.laad(st, 20260716);
  assert.equal(t.seed, 20260716);
  assert.equal(t.modus, "zolder");
});

test("corrupte JSON wordt verworpen zonder crash", () => {
  const st = nepStorage({ "albertas-legacy/save": "{niet: geldig json" });
  const t = world.laad(st, 7);
  assert.equal(t.seed, 7);
  assert.equal(t.versie, 1);
});

test("een nieuwere versie dan wij kennen wordt verworpen", () => {
  const toekomst = JSON.stringify({ versie: 99, seed: 5, modus: "zolder" });
  const st = nepStorage({ "albertas-legacy/save": toekomst });
  const t = world.laad(st, 8);
  assert.equal(t.versie, 1);
  assert.equal(t.seed, 8);        // verse staat, niet de kapotte save
});

test("een oudere versie wordt gemigreerd, opgehoogd en teruggeschreven", () => {
  // Simuleer een 'versie 0'-save met een ontbrekend veld (hintsTotaal).
  const oud = {
    versie: 0, seed: 44, modus: "zolder", sceneId: "zolder-midden",
    speler: { x: 100, y: 160, richting: "oost" },
    bezocht: { "zolder-west": true, "zolder-midden": true },
    levelActief: 1, levels: world.nieuw(44).levels,
    geluid: false, gestopt: false, einde: null
    // let op: geen hintsTotaal
  };
  const st = nepStorage({ "albertas-legacy/save": JSON.stringify(oud) });
  const t = world.laad(st, 1);
  assert.equal(t.versie, 1);              // opgehoogd
  assert.equal(t.seed, 44);              // behouden
  assert.equal(t.sceneId, "zolder-midden");
  assert.equal(t.geluid, false);
  assert.equal(t.hintsTotaal, 0);        // default aangevuld
  // Teruggeschreven naar storage met de nieuwe versie.
  const opnieuw = JSON.parse(st.getItem("albertas-legacy/save"));
  assert.equal(opnieuw.versie, 1);
});

test("migreer is additief en verliesvrij voor bekende velden", () => {
  const oud = world.nieuw(3);
  oud.versie = 0;
  oud.hintsTotaal = 12;
  const vers = world.migreer(oud);
  assert.equal(vers.versie, 1);
  assert.equal(vers.hintsTotaal, 12);
  assert.equal(vers.seed, 3);
});

test("herbegin wist de save en geeft een verse staat", () => {
  const st = nepStorage();
  const t = world.nieuw(50);
  t.levels["1"].ontgrendeld = true;
  world.opslaan(st, t);
  assert.ok(st.getItem("albertas-legacy/save"));

  const vers = world.herbegin(st, 50);   // seed behouden (?seed-run)
  assert.equal(st.getItem("albertas-legacy/save"), null);
  assert.equal(vers.seed, 50);
  assert.equal(vers.levels["1"].ontgrendeld, false);
});

test("opslaan crasht niet op een storage die gooit", () => {
  const kapot = {
    getItem: () => { throw new Error("nope"); },
    setItem: () => { throw new Error("nope"); },
    removeItem: () => { throw new Error("nope"); }
  };
  assert.equal(world.opslaan(kapot, world.nieuw(1)), false);
  // laad valt netjes terug op een verse staat.
  const t = world.laad(kapot, 2);
  assert.equal(t.seed, 2);
});
