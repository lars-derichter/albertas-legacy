// test-schaal.mjs — de maatkeuring (WP 35). Ze houdt de scènes en de sprites
// tegen de maatregel uit `docs/art-stijlgids.md`, §De maatregel: 1 px ≈ 5 cm,
// met de speler van 31 px (1,55 m) als ijkpunt.
//
// Waarom een test en niet alleen een afspraak: de schaalfout die dit werkpakket
// herstelde, was nergens fout volgens een lint. Een mok van 14 × 16 px, een
// bureau van 148 px breed en geschilderde dozen van drie keer de doos-sprite
// ernaast kwamen allemaal door `lint-scene.mjs`, want elke coördinaat lag
// keurig binnen het speelveld. Maat is een verhouding tussen twee dingen, en
// die moet je dus tussen twee dingen meten.
//
// De meeste maten worden uit de scènedata zélf gerekend: draw-ops zijn arrays,
// dus een rechthoek in kartonkleur is te vinden en na te meten. Waar dat niet
// kan (welke rechthoek is "het blad"?), staat het getal hier met een verwijzing
// naar de tabel in de stijlgids — dan is deze test de tweede plaats waar het
// staat en valt een eenzijdige wijziging op.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");

const loopveld = require(join(wortel, "js", "loopveld.js"));
const spritesDir = join(wortel, "js", "sprites");
for (const naam of readdirSync(spritesDir)) {
  if (/^sprite-.*\.js$/.test(naam)) require(join(spritesDir, naam));
}
const KAMERS = ["zolder-west", "zolder-midden", "zolder-oost", "overloop"];
for (const id of KAMERS) {
  require(join(wortel, "js", "scenes", "scene-" + id + ".js"));
}
const sprites = globalThis.AL.sprites;
const scenes = globalThis.AL.scenes;

// ---- De maatregel ---------------------------------------------------------

const PX_PER_METER = 20;                       // 1 px ≈ 5 cm
const SPELER_H = 31;                           // 1,55 m — het ijkpunt

function hoogte(naam, anim) {
  return sprites[naam].anims[anim || "idle"].frames[0].length;
}
function breedte(naam, anim) {
  return sprites[naam].anims[anim || "idle"].frames[0][0].length;
}
function meter(px) { return px / PX_PER_METER; }

// Alle rechthoek-ops van een scène, inclusief die van de overlays: de
// voorgrond tekent op hetzelfde veld en telt dus mee.
function rects(id) {
  const scene = scenes[id];
  const uit = [];
  const verzamel = (ops) => {
    for (const op of ops || []) {
      if (op[0] === "rect") {
        uit.push({ kleur: op[1], x: op[2], y: op[3], b: op[4], h: op[5] });
      }
    }
  };
  verzamel(scene.picture);
  for (const ov of scene.overlays || []) verzamel(ov.ops);
  return uit;
}

function gradienten(id) {
  return (scenes[id].picture || [])
    .filter((op) => op[0] === "gradient")
    .map((op) => ({ c1: op[1], c2: op[2], x: op[3], y: op[4], b: op[5],
      h: op[6] }));
}

// ---- De speler is de maatstaf ---------------------------------------------

test("de speler is 31 px hoog: alles hieronder hangt daaraan", () => {
  assert.equal(hoogte("speler", "sta-zuid"), SPELER_H);
  assert.equal(breedte("speler", "sta-zuid"), 15);
  assert.equal(meter(SPELER_H), 1.55);
});

// ---- De mok ---------------------------------------------------------------

test("de mok is een mok en geen emmer", () => {
  // De romp van de mok is de enige rechthoek in 52 (steen hooglicht) op het
  // bureaublad van de werkhoek.
  const mok = rects("zolder-oost").filter((r) => r.kleur === 52);
  assert.equal(mok.length, 1, "verwacht precies één mokromp in kleur 52");
  const m = mok[0];
  assert.ok(m.h + 1 <= SPELER_H / 4,
    "de mok (" + (m.h + 1) + " px met rand) is hoger dan een kwart speler");
  assert.ok(m.b <= 5, "de mok is " + m.b + " px breed, hoogstens 5 toegestaan");
  // En ze staat op het blad, niet ernaast.
  const blad = gradienten("zolder-oost").find((g) => g.c1 === 25 && g.c2 === 26);
  assert.ok(m.x >= blad.x && m.x + m.b <= blad.x + blad.b,
    "de mok staat niet op het bureaublad");
});

// ---- Het bureau -----------------------------------------------------------

// De opbouw van het bureau in `scene-zolder-oost.js`: het blad is het enige
// verloop van 25 naar 26, de poten zijn de twee smalle hoge rechthoeken in 25 (hout
// warm), en het
// blok is de voetafdruk. De hoogte die het oog leest is die van de vóórrand van
// het blad tot de voet van de poten.
function bureau() {
  const blad = gradienten("zolder-oost").find((g) => g.c1 === 25 && g.c2 === 26);
  const poten = rects("zolder-oost")
    .filter((r) => r.kleur === 25 && r.h >= 8 && r.b <= 8);
  const voetY = Math.max(...poten.map((p) => p.y + p.h - 1));
  return { blad, poten, voetY, voorrandY: blad.y + blad.h };
}

test("het bureaublad ligt op bureauhoogte boven zijn eigen voetlijn", () => {
  const b = bureau();
  const h = b.voetY - b.voorrandY + 1;
  assert.ok(h >= 13 && h <= 18,
    "bureauhoogte " + h + " px (" + meter(h) + " m); de tabel in de stijlgids " +
    "zegt ~15 px = 0,75 m");
  assert.equal(b.poten.length, 2, "een bureau heeft hier twee poten");
});

test("het bureau is een tafel en geen perron", () => {
  const b = bureau();
  assert.ok(b.blad.b <= 56,
    "het blad is " + b.blad.b + " px (" + meter(b.blad.b) + " m) breed");
  assert.ok(b.blad.b >= 32, "een bureau van minder dan 1,6 m is geen werktafel");
  // Hoogstens drie en een halve keer zo breed als hoog: anders leest het als
  // een plank op schragen in plaats van als een bureau.
  const h = b.voetY - b.voorrandY + 1;
  assert.ok(b.blad.b / h <= 3.6, "blad " + b.blad.b + " op hoogte " + h);
});

test("het blok van het bureau sluit aan op de geschilderde voetlijn", () => {
  const b = bureau();
  const blok = scenes["zolder-oost"].blokken[0];
  assert.equal(blok[0], b.blad.x, "blok begint niet op de linkerrand van het blad");
  assert.equal(blok[2], b.blad.b, "blok is niet even breed als het blad");
  const blokOnder = blok[1] + blok[3] - 1;
  assert.ok(blokOnder >= b.voetY,
    "het blok (" + blokOnder + ") houdt op vóór de bureaupoten (" + b.voetY + ")");
  assert.ok(blokOnder - b.voetY <= 8,
    "het blok steekt " + (blokOnder - b.voetY) + " px voorbij het bureau");
});

// ---- De stoel en het zitten -----------------------------------------------

test("de stoel past onder het bureau en draagt de zithouding", () => {
  const zit = hoogte("stoel");
  assert.ok(zit >= 17 && zit <= 21,
    "de stoel is " + zit + " px (" + meter(zit) + " m); de tabel zegt ~19");
  assert.ok(breedte("stoel") <= breedte("speler", "sta-zuid"),
    "de stoel is breder dan de speler");
  // De zitting ligt op negen pixels: de bovenste rij van het zittingvlak, in
  // het lichtste koelgrijs van het sub-palet (teken 5). Dat is dezelfde hoogte
  // als de dij in het laatste zit-frame van de speler, en allebei worden ze met
  // dezelfde diepteschaal geblit.
  const frame = sprites["stoel"].anims["idle"].frames[0];
  const zitRij = frame.findIndex((r) => /5{4,}/.test(r));
  assert.equal(frame.length - 1 - zitRij, 9, "de zitting ligt niet op 9 px");
});

test("de zithouding zet de handen op de voorrand van het blad", () => {
  const scene = scenes["zolder-oost"];
  const stoel = scene.hotspots.find((h) => h.item === "stoel");
  const b = bureau();
  // De engine zet de speler op de stoel als hij gaat zitten (`startZitten`),
  // dus de stoel moet vóór het bureau staan en op zijn voetlijn.
  assert.ok(Math.abs(stoel.y - b.voetY) <= 2,
    "de stoel (y" + stoel.y + ") staat niet op de voetlijn van het bureau (y" +
    b.voetY + ")");
  assert.ok(loopveld.inBlok(scene, stoel.x, stoel.y),
    "de zitplek hoort in het blok van het bureau te liggen");

  // De hand in het laatste zit-frame ligt op dertien rijen boven de voeten;
  // met de diepteschaal van de stoel komt ze op de voorrand van het blad uit.
  const zitFrames = sprites["speler"].anims["zit-oost"].frames;
  const laatste = zitFrames[zitFrames.length - 1];
  const handRij = laatste.findIndex((r) => /aa/.test(r.slice(10)));
  const handHoog = laatste.length - 1 - handRij;
  const schaal = loopveld.diepteSchaal(scene, stoel.y);
  const handY = Math.round(stoel.y - handHoog * schaal);
  assert.ok(Math.abs(handY - b.voorrandY) <= 3,
    "de handen komen op y" + handY + " uit, de voorrand van het blad ligt op y" +
    b.voorrandY);
});

// ---- De pc ----------------------------------------------------------------

test("de pc is leesbaar groot maar blijft binnen anderhalve ware maat", () => {
  const scene = scenes["zolder-oost"];
  const pc = scene.hotspots.find((h) => h.item === "pc");
  const schaal = loopveld.diepteSchaal(scene, pc.y);
  const h = Math.round(hoogte("pc", "aan") * schaal);
  const b = Math.round(breedte("pc", "aan") * schaal);
  // Een 14"-CRT met kast eronder is 0,55 m; anderhalf keer dat is 0,83 m.
  assert.ok(meter(h) <= 0.85,
    "de pc komt als " + h + " px (" + meter(h) + " m) in beeld");
  assert.ok(h >= 11 && b >= 13,
    "de pc is met " + b + " × " + h + " px niet meer als monitor te herkennen");
  // En hij staat op het bureaublad, niet erdoorheen.
  const blad = gradienten("zolder-oost").find((g) => g.c1 === 25 && g.c2 === 26);
  assert.ok(pc.y >= blad.y && pc.y <= blad.y + blad.h,
    "de pc staat niet op het blad");
});

// ---- Het karton -----------------------------------------------------------

// De doos-sprite is de maateenheid: ze staat als prop in dezelfde kamers als
// het geschilderde karton, dus dáár moet het tegen kloppen. Een geschilderde
// doos telt mee als de rechthoek in kartonkleur (25/26) groot genoeg is om als
// doos te lezen; smallere strookjes zijn tape, labels en leuningen.
test("elke geschilderde doos is even groot als de doos-sprite", () => {
  const db = breedte("doos"), dh = hoogte("doos");
  let geteld = 0;
  for (const id of KAMERS) {
    for (const r of rects(id)) {
      if (r.kleur !== 25 && r.kleur !== 26) continue;
      if (r.b < 12 || r.h < 10) continue;              // tape, label, leuning
      geteld++;
      const waar = id + " doos op x" + r.x + " y" + r.y;
      assert.ok(r.b >= db * 0.7 && r.b <= db * 1.5,
        waar + " is " + r.b + " px breed, sprite " + db);
      assert.ok(r.h >= dh * 0.7 && r.h <= dh * 1.5,
        waar + " is " + r.h + " px hoog, sprite " + dh);
    }
  }
  assert.ok(geteld >= 15, "verwacht een stuk of twintig geschilderde dozen, " +
    "geteld: " + geteld);
});

test("de torens op de overloop zijn hoger dan de speler, per doos gestapeld", () => {
  const scene = scenes["overloop"];
  const dozen = rects("overloop")
    .filter((r) => (r.kleur === 25 || r.kleur === 26) && r.b >= 12 && r.h >= 10);
  const links = dozen.filter((r) => r.x < 60);
  const top = Math.min(...links.map((r) => r.y));
  const voet = Math.max(...links.map((r) => r.y + r.h - 1));
  const spelerHier = SPELER_H * loopveld.diepteSchaal(scene, voet + 1);
  assert.ok(voet - top + 1 > spelerHier,
    "de linkertoren (" + (voet - top + 1) + " px) is niet hoger dan de speler " +
    "(" + Math.round(spelerHier) + " px) — dat belooft de kamerbeschrijving wel");
  assert.ok(links.length >= 4, "een toren van minder dan vier dozen is een doos");
});

// ---- De kist en het notitieboek -------------------------------------------

test("de kist blijft onder anderhalve spelerhoogte in de breedte", () => {
  // De romp van de kist is de brede rechthoek in 23 (hout schaduw) op de vloer
  // van de westhoek; de beslagbanden zijn dezelfde kleur maar 3 px breed, en de
  // roede van het dakraam staat hoog tegen de wand.
  const kist = rects("zolder-west")
    .filter((r) => r.kleur === 23 && r.b >= 20 && r.y > 126);
  assert.equal(kist.length, 1, "verwacht precies één kistromp");
  const k = kist[0];
  assert.ok(k.b <= SPELER_H * 1.5,
    "de kist is " + k.b + " px breed (" + meter(k.b) + " m)");
  assert.ok(k.h <= 20, "de kist is " + k.h + " px hoog");
});

test("het notitieboek ligt leesbaar op de kist en overwoekert ze niet", () => {
  const boek = breedte("notitieboek");
  const kist = rects("zolder-west")
    .filter((r) => r.kleur === 23 && r.b >= 20 && r.y > 126)[0];
  assert.ok(boek <= kist.b / 2,
    "het boek (" + boek + " px) beslaat meer dan de halve kist (" + kist.b + ")");
  assert.ok(boek >= 12, "onder de twaalf pixels is het geen opengeslagen boek meer");
  // Het ligt op het deksel: de hotspot-voet valt binnen het dekselvlak.
  const scene = scenes["zolder-west"];
  const hs = scene.hotspots.find((h) => h.item === "notitieboek");
  const deksel = gradienten("zolder-west").find((g) => g.c1 === 25 && g.c2 === 27);
  assert.ok(hs.y >= deksel.y && hs.y <= deksel.y + deksel.h + 1,
    "het notitieboek zweeft: voet y" + hs.y + ", deksel y" + deksel.y);
});

// ---- Eén diepteregime -----------------------------------------------------

test("de diepteschaal loopt van 1 vooraan naar 0,84 achteraan", () => {
  const scene = scenes["zolder-oost"];
  const box = scene.walkboxes[0];
  const voor = box[1] + box[3] - 1, achter = box[1];
  assert.equal(loopveld.diepteSchaal(scene, voor), 1);
  assert.ok(Math.abs(loopveld.diepteSchaal(scene, achter) - 0.84) < 1e-9);
  // Klemt buiten de strook, zodat een prop op een bureaublad niet groeit.
  assert.equal(loopveld.diepteSchaal(scene, achter - 40),
    loopveld.diepteSchaal(scene, achter));
  assert.equal(loopveld.diepteSchaal(scene, voor + 40), 1);
  // Monotoon: verder naar achter (kleinere y) is nooit groter.
  let vorige = 0;
  for (let y = box[1]; y <= voor; y++) {
    const s = loopveld.diepteSchaal(scene, y);
    assert.ok(s >= vorige - 1e-9, "de schaal loopt niet monotoon op naar voren");
    vorige = s;
  }
  assert.equal(loopveld.diepteSchaal({ walkboxes: [] }, 100), 1);
});

test("elke prop staat op een vloerhoogte waar de diepteschaal iets doet", () => {
  // Als een prop buiten de strook zou staan en dus altijd op 0,84 klemt, is er
  // in die kamer geen diepteregime maar een vaste factor. Minstens één prop per
  // kamer hoort binnen de strook te staan.
  for (const id of KAMERS) {
    const scene = scenes[id];
    const binnen = (scene.hotspots || []).filter((h) =>
      loopveld.inWalkbox(scene, h.x, h.y) ||
      loopveld.diepteSchaal(scene, h.y) > loopveld.SCHAAL_ACHTERAAN);
    assert.ok(binnen.length >= 1, id + ": geen enkele prop staat op de vloer");
  }
});
