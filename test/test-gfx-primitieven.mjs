// test-gfx-primitieven.mjs — de renderprimitieven die in de opwaardering zijn
// bijgekomen: de ramps in het palet, het verloop, de gedoseerde dither, de
// verduistering, de ruis, de sprite-schaling en de overgangen.
//
// Alles draait headless op de Node-export van js/gfx.js: de renderer werkt op
// een eigen Uint8Array en raakt de DOM niet aan. De guard debugPalet staat aan,
// zodat elke op die buiten het palet kleurt hier meteen omvalt.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const palet = require(join(wortel, "js", "palette.js"));
const gfx = require(join(wortel, "js", "gfx.js"));

const BREEDTE = 320;

// Een testbuffer opzetten zonder canvas: gfx.init verwacht een canvas, dus we
// gebruiken de op-interpreter op een eigen doelbuffer via cacheScene.
function tekenOps(ops) {
  gfx.debugPalet = true;
  return gfx.cacheScene("test-" + Math.abs(hash(JSON.stringify(ops))), ops);
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function pixel(buf, x, y) { return buf[y * BREEDTE + x]; }

// ---- Het palet: ramps ------------------------------------------------------

test("verduister zakt binnen de eigen ramp en klemt op de donkerste", () => {
  // 34 is de lichtste van de avond-ramp (28..34).
  assert.equal(palet.verduister(34, 1), 33);
  assert.equal(palet.verduister(34, 2), 32);
  assert.equal(palet.verduister(28, 1), 28, "klemt op de donkerste");
  assert.equal(palet.verduister(34, 99), 28, "grote stap klemt ook");
});

test("verhelder is het spiegelbeeld en klemt op de lichtste", () => {
  assert.equal(palet.verhelder(28, 1), 29);
  assert.equal(palet.verhelder(34, 1), 34);
});

test("een kleur zonder ramp blijft ongemoeid", () => {
  // 6 (bruin) en 14 (geel) staan bewust in geen enkele ramp.
  assert.equal(palet.rampVan(6), null);
  assert.equal(palet.verduister(6, 2), 6);
  assert.equal(palet.verhelder(14, 2), 14);
});

test("de rode mantel van de speler heeft een schaduwkant", () => {
  assert.equal(palet.verduister(12, 1), 4);
  assert.equal(palet.verhelder(4, 1), 12);
});

test("elke ramp is een geldige, oplopende reeks paletindexen", () => {
  for (const ramp of palet.RAMPEN) {
    assert.ok(ramp.length >= 2, "een ramp heeft minstens twee kleuren");
    for (const i of ramp) {
      assert.ok(Number.isInteger(i) && i >= 0 && i < palet.aantal,
        "index " + i + " buiten het palet");
    }
  }
});

test("geen enkele kleur zit in twee ramps tegelijk", () => {
  const gezien = new Set();
  for (const ramp of palet.RAMPEN) {
    for (const i of ramp) {
      assert.ok(!gezien.has(i), "index " + i + " zit in meer dan één ramp");
      gezien.add(i);
    }
  }
});

// ---- gradient --------------------------------------------------------------

test("gradient loopt over de echte tussenkleuren van een gedeelde ramp", () => {
  // 28 -> 34 is de volledige avond-ramp: zeven stappen.
  const buf = tekenOps([["gradient", 28, 34, 0, 8, 320, 182, "v"]]);
  const boven = pixel(buf, 10, 8);
  const onder = pixel(buf, 10, 189);
  assert.equal(boven, 28, "bovenaan de donkerste ramp-kleur");
  assert.equal(onder, 34, "onderaan de lichtste");

  // Onderweg moeten ook de tussenkleuren voorkomen, niet alleen 28 en 34.
  const gezien = new Set();
  for (let y = 8; y <= 189; y++) gezien.add(pixel(buf, 10, y));
  for (const k of [29, 30, 31, 32, 33]) {
    assert.ok(gezien.has(k), "tussenkleur " + k + " ontbreekt in het verloop");
  }
});

test("gradient tussen twee ramps blijft een menging van die twee", () => {
  // 22 (hout) en 61 (nacht) zitten in verschillende ramps.
  const buf = tekenOps([["gradient", 22, 61, 0, 8, 320, 100, "v"]]);
  const gezien = new Set();
  for (let y = 8; y < 108; y++) for (let x = 0; x < 40; x++) {
    gezien.add(pixel(buf, x, y));
  }
  assert.deepEqual([...gezien].sort((a, b) => a - b), [22, 61]);
});

test("gradient horizontaal verloopt over de breedte, niet de hoogte", () => {
  const buf = tekenOps([["gradient", 28, 34, 0, 8, 320, 100, "h"]]);
  assert.equal(pixel(buf, 0, 50), 28);
  assert.equal(pixel(buf, 319, 50), 34);
  assert.equal(pixel(buf, 0, 20), pixel(buf, 0, 90),
    "op dezelfde x is de kleur gelijk, ongeacht y");
});

// ---- ditherRamp ------------------------------------------------------------

test("ditherRamp op dichtheid 0 en 1 levert zuivere kleuren", () => {
  const vierkant = [10, 20, 60, 20, 60, 60, 10, 60];
  const nul = tekenOps([["ditherRamp", 24, 27, 0, vierkant]]);
  const een = tekenOps([["ditherRamp", 24, 27, 1, vierkant]]);
  assert.equal(pixel(nul, 30, 40), 24);
  assert.equal(pixel(een, 30, 40), 27);
});

test("ditherRamp mengt in de gevraagde verhouding", () => {
  const vierkant = [0, 20, 320, 20, 320, 180, 0, 180];
  for (const d of [0.25, 0.5, 0.75]) {
    const buf = tekenOps([["ditherRamp", 24, 27, d, vierkant]]);
    let licht = 0, totaal = 0;
    for (let y = 24; y < 176; y++) for (let x = 4; x < 316; x++) {
      totaal++;
      if (pixel(buf, x, y) === 27) licht++;
    }
    const aandeel = licht / totaal;
    assert.ok(Math.abs(aandeel - d) < 0.03,
      "dichtheid " + d + " gaf aandeel " + aandeel.toFixed(3));
  }
});

// ---- shadow ----------------------------------------------------------------

test("shadow verduistert wat eronder ligt en respecteert de ramp", () => {
  const vlak = [0, 8, 320, 8, 320, 189, 0, 189];
  const helft = [0, 100, 320, 100, 320, 189, 0, 189];
  const buf = tekenOps([
    ["fill", 26],                 // hout licht
    ["shadow", 2, helft]
  ]);
  assert.equal(pixel(buf, 10, 50), 26, "boven de schaduw ongewijzigd");
  assert.equal(pixel(buf, 10, 150), 24, "twee stappen donkerder in de hout-ramp");
  assert.ok(vlak.length === 8);
});

test("shadow op een kleur zonder ramp laat ze staan", () => {
  const helft = [0, 100, 320, 100, 320, 189, 0, 189];
  const buf = tekenOps([["fill", 6], ["shadow", 2, helft]]);
  assert.equal(pixel(buf, 10, 150), 6);
});

// ---- noise -----------------------------------------------------------------

test("noise is deterministisch: twee keer tekenen geeft hetzelfde beeld", () => {
  const vlak = [0, 20, 320, 20, 320, 180, 0, 180];
  const ops = [["fill", 24], ["noise", 23, 0.3, 7, vlak]];
  const a = tekenOps(ops);
  const b = gfx.cacheScene("noise-herhaling", ops);
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i], b[i], "pixel " + i + " verschilt tussen twee runs");
  }
});

test("noise raakt ongeveer de gevraagde fractie en laat de rest staan", () => {
  const vlak = [0, 20, 320, 20, 320, 180, 0, 180];
  const buf = tekenOps([["fill", 24], ["noise", 23, 0.3, 7, vlak]]);
  let geraakt = 0, totaal = 0;
  for (let y = 24; y < 176; y++) for (let x = 4; x < 316; x++) {
    totaal++;
    const p = pixel(buf, x, y);
    assert.ok(p === 24 || p === 23, "noise kleurde buiten de twee kleuren");
    if (p === 23) geraakt++;
  }
  const aandeel = geraakt / totaal;
  assert.ok(Math.abs(aandeel - 0.3) < 0.03, "aandeel was " + aandeel.toFixed(3));
});

test("een andere seed geeft een ander spikkelpatroon", () => {
  const vlak = [0, 20, 320, 20, 320, 180, 0, 180];
  const a = gfx.cacheScene("seed-a", [["fill", 24], ["noise", 23, 0.3, 1, vlak]]);
  const b = gfx.cacheScene("seed-b", [["fill", 24], ["noise", 23, 0.3, 2, vlak]]);
  let verschillen = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) verschillen++;
  assert.ok(verschillen > 1000, "seeds gaven te weinig verschil: " + verschillen);
});

// ---- De guard --------------------------------------------------------------

test("debugPalet betrapt een nieuwe op die buiten het palet kleurt", () => {
  gfx.debugPalet = true;
  assert.throws(() => gfx.cacheScene("buiten-1",
    [["gradient", 28, 99, 0, 8, 10, 10, "v"]]), /buiten palet/);
  assert.throws(() => gfx.cacheScene("buiten-2",
    [["noise", 99, 0.5, 1, [0, 20, 40, 20, 40, 60, 0, 60]]]), /buiten palet/);
  assert.throws(() => gfx.cacheScene("buiten-3",
    [["ditherRamp", 0, 99, 0.5, [0, 20, 40, 20, 40, 60, 0, 60]]]),
  /buiten palet/);
});

test("een onbekende op blijft een harde fout", () => {
  assert.throws(() => gfx.cacheScene("onbekend", [["glitter", 1]]),
    /onbekende op/);
});

// ---- Sprite-schaling en overgangen ----------------------------------------
//
// Deze twee werken op de backing store en vragen dus gfx.init(). Een canvas is
// er in Node niet, maar init gebruikt er maar twee dingen van; een stub volstaat
// en houdt de renderer headless testbaar.

function stubCanvas() {
  return {
    getContext: () => ({
      imageSmoothingEnabled: true,
      createImageData: (w, h) => ({
        data: new Uint8ClampedArray(w * h * 4), width: w, height: h
      }),
      putImageData: () => {}
    })
  };
}

// Een blokje van 4×4 in sub-palet-kleur 0 (= paletindex 26).
const BLOKJE = {
  ankerpunt: "voeten-midden",
  palet: [26],
  anims: { idle: { fps: 0, frames: [["0000", "0000", "0000", "0000"]] } }
};

function versBuffer() {
  gfx.init(stubCanvas());
  gfx.debugPalet = true;
  return gfx.getBuffer();
}

test("tekenSprite verankert onderaan-midden en schaal 1 verandert niets", () => {
  const buf = versBuffer();
  gfx.tekenSprite(BLOKJE, "idle", 0, 100, 100, {});
  // 4 breed, anker onderaan-midden: linksX = 100 - 2 = 98, bovenY = 100 - 3 = 97.
  assert.equal(pixel(buf, 98, 97), 26, "linkerbovenhoek");
  assert.equal(pixel(buf, 101, 100), 26, "rechteronderhoek");
  assert.equal(pixel(buf, 97, 97), 0, "niets links ernaast");
  assert.equal(pixel(buf, 102, 100), 0, "niets rechts ernaast");
});

test("tekenSprite met schaal 0.5 zet de sprite half zo groot neer", () => {
  const buf = versBuffer();
  gfx.tekenSprite(BLOKJE, "idle", 0, 100, 100, { schaal: 0.5 });
  // 4 -> 2 breed en hoog: linksX = 100 - 1 = 99, bovenY = 100 - 1 = 99.
  assert.equal(pixel(buf, 99, 99), 26);
  assert.equal(pixel(buf, 100, 100), 26);
  assert.equal(pixel(buf, 98, 99), 0, "smaller dan op schaal 1");
  assert.equal(pixel(buf, 99, 98), 0, "lager dan op schaal 1");
});

test("tekenSprite laat de voeten staan waar ze stonden bij het schalen", () => {
  // Dieptewerking mag een figuur kleiner maken, maar hij moet wel op dezelfde
  // vloer blijven staan: de onderrand hoort niet te verschuiven.
  for (const schaal of [1, 0.75, 0.5]) {
    const buf = versBuffer();
    gfx.tekenSprite(BLOKJE, "idle", 0, 100, 120, { schaal });
    assert.equal(pixel(buf, 100, 120), 26,
      "onderrand verschoof bij schaal " + schaal);
  }
});

test("overgang: t=0 laat het beeld staan, t=1 maakt alles de doelkleur", () => {
  const buf = versBuffer();
  gfx.wisSpeelveld(26);
  gfx.overgang("fade", 0, 0);
  assert.equal(pixel(buf, 100, 100), 26);
  gfx.overgang("fade", 1, 0);
  assert.equal(pixel(buf, 100, 100), 0);
  assert.equal(pixel(buf, 0, 0), 0, "ook de status- en invoerbalk gaan mee");
});

test("overgang fade dekt ongeveer de gevraagde fractie", () => {
  for (const t of [0.25, 0.5, 0.75]) {
    const buf = versBuffer();
    gfx.wisSpeelveld(26);
    gfx.overgang("fade", t, 0);
    let zwart = 0, totaal = 0;
    for (let y = 8; y <= 189; y++) for (let x = 0; x < 320; x++) {
      totaal++;
      if (pixel(buf, x, y) === 0) zwart++;
    }
    const aandeel = zwart / totaal;
    assert.ok(Math.abs(aandeel - t) < 0.03,
      "t=" + t + " gaf " + aandeel.toFixed(3));
  }
});

test("overgang iris sluit van de randen naar het midden", () => {
  const buf = versBuffer();
  gfx.wisSpeelveld(26);
  gfx.overgang("iris", 0.25, 0);
  assert.equal(pixel(buf, 160, 100), 26, "het midden staat er nog");
  assert.equal(pixel(buf, 2, 10), 0, "de hoek is al dicht");
});

test("overgang dissolve is deterministisch", () => {
  const eerste = [];
  for (let ronde = 0; ronde < 2; ronde++) {
    const buf = versBuffer();
    gfx.wisSpeelveld(26);
    gfx.overgang("dissolve", 0.5, 0);
    const kopie = Uint8Array.from(buf);
    if (ronde === 0) eerste.push(kopie);
    else assert.deepEqual(kopie, eerste[0], "twee runs verschillen");
  }
});
