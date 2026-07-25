// test-sprites.mjs — de sprite-keuring. Frames zijn met de hand getypte
// pixel-strings, en één teken te veel of te weinig is met het blote oog niet te
// zien: de renderer leest de breedte uit rij nul, dus een te korte rij daaronder
// verschuift stilletjes de rest van dat frame.
//
// De plaats van deze keuring: `docs/art-stijlgids.md` schrijft "sprite-lint" voor
// bij WP H, en er was geen sprite-lint. Ze staat hier en niet in `tools/`, om
// dezelfde reden als de fontdekking: in de testsuite loopt ze bij elke run mee.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const palet = require(join(wortel, "js", "palette.js"));

// Alle sprites laden zoals de browser dat doet: elk bestand hangt zichzelf aan
// globalThis.AL.
const spritesDir = join(wortel, "js", "sprites");
for (const naam of readdirSync(spritesDir)) {
  if (/^sprite-.*\.js$/.test(naam)) require(join(spritesDir, naam));
}
const sprites = globalThis.AL.sprites;

// De maten uit art-stijlgids.md, §Sprite-specificaties.
const SPEC = {
  speler: { b: 16, h: 32 },
  notitieboek: { b: 24, h: 16 },
  pc: { b: 32, h: 32 },
  doos: { b: 24, h: 20 },
  "broncode-doos": { b: 28, h: 24 },
  stoel: { b: 20, h: 28 }
};

test("elke sprite uit de spec bestaat en heeft een sub-palet", () => {
  for (const naam of Object.keys(SPEC)) {
    const s = sprites[naam];
    assert.ok(s, "sprite '" + naam + "' ontbreekt");
    assert.equal(s.ankerpunt, "voeten-midden",
      naam + ": het anker hoort onderaan-midden (harde regel uit de stijlgids)");
    assert.ok(Array.isArray(s.palet) && s.palet.length > 0,
      naam + ": geen sub-palet");
    assert.ok(s.palet.length <= 16, naam + ": sub-palet groter dan zestien");
    for (const idx of s.palet) {
      assert.ok(Number.isInteger(idx) && idx >= 0 && idx < palet.aantal,
        naam + ": sub-palet verwijst naar " + idx + ", buiten het palet");
    }
  }
});

test("elk frame is rechthoekig: alle rijen even lang", () => {
  for (const naam of Object.keys(sprites)) {
    const s = sprites[naam];
    for (const animNaam of Object.keys(s.anims)) {
      const frames = s.anims[animNaam].frames;
      frames.forEach((frame, f) => {
        const waar = naam + "." + animNaam + "[" + f + "]";
        assert.ok(Array.isArray(frame) && frame.length > 0, waar + ": leeg frame");
        const b = frame[0].length;
        frame.forEach((rij, r) => {
          assert.equal(rij.length, b,
            waar + " rij " + r + " is " + rij.length + " breed, rij 0 is " + b +
            ": " + JSON.stringify(rij));
        });
      });
    }
  }
});

test("elk teken in elk frame wijst in het sub-palet", () => {
  for (const naam of Object.keys(sprites)) {
    const s = sprites[naam];
    const grens = s.palet ? s.palet.length : 16;
    for (const animNaam of Object.keys(s.anims)) {
      s.anims[animNaam].frames.forEach((frame, f) => {
        frame.forEach((rij, r) => {
          for (const ch of rij) {
            if (ch === ".") continue;
            const lokaal = parseInt(ch, 16);
            assert.ok(!Number.isNaN(lokaal) && lokaal < grens,
              naam + "." + animNaam + "[" + f + "] rij " + r +
              ": teken '" + ch + "' valt buiten een sub-palet van " + grens);
          }
        });
      });
    }
  }
});

test("geen sprite komt buiten zijn maat uit de stijlgids", () => {
  for (const naam of Object.keys(SPEC)) {
    const s = sprites[naam];
    for (const animNaam of Object.keys(s.anims)) {
      s.anims[animNaam].frames.forEach((frame, f) => {
        const waar = naam + "." + animNaam + "[" + f + "]";
        assert.ok(frame[0].length <= SPEC[naam].b,
          waar + " is " + frame[0].length + " breed, spec zegt " + SPEC[naam].b);
        assert.ok(frame.length <= SPEC[naam].h,
          waar + " is " + frame.length + " hoog, spec zegt " + SPEC[naam].h);
      });
    }
  }
});

test("frames binnen één anim schelen hoogstens één rij in hoogte", () => {
  // Eén rij verschil is de deining: de doorzwaaiframes zijn een pixel hoger,
  // en omdat het anker onderaan zit, komt de romp omhoog terwijl de voeten
  // blijven staan. Méér dan één rij is geen deining meer maar een sprite die
  // zit te stuiteren — behalve waar dat de bedoeling is (zitten).
  const uitzondering = { speler: ["zit-oost"] };
  for (const naam of Object.keys(sprites)) {
    const s = sprites[naam];
    for (const animNaam of Object.keys(s.anims)) {
      if ((uitzondering[naam] || []).includes(animNaam)) continue;
      const hoogtes = s.anims[animNaam].frames.map((f) => f.length);
      const spreiding = Math.max(...hoogtes) - Math.min(...hoogtes);
      assert.ok(spreiding <= 1,
        naam + "." + animNaam + ": hoogtes " + hoogtes.join(",") +
        " schelen " + spreiding + " rijen");
    }
  }
});

test("frames binnen één anim zijn even breed", () => {
  // De breedte mag níet variëren: het anker is horizontaal gecentreerd, dus een
  // frame dat een pixel breder is, schuift de hele figuur een halve pixel op.
  for (const naam of Object.keys(sprites)) {
    const s = sprites[naam];
    for (const animNaam of Object.keys(s.anims)) {
      const breedtes = s.anims[animNaam].frames.map((f) => f[0].length);
      assert.equal(new Set(breedtes).size, 1,
        naam + "." + animNaam + ": breedtes " + breedtes.join(","));
    }
  }
});

test("de speler heeft de anims die de engine opvraagt", () => {
  const s = sprites.speler;
  for (const naam of ["sta-noord", "sta-oost", "sta-zuid",
    "loop-noord", "loop-oost", "loop-zuid", "draai", "zit-oost"]) {
    assert.ok(s.anims[naam], "speler mist anim '" + naam + "'");
  }
  // Geen -west: de engine spiegelt oost (harde regel uit de stijlgids).
  for (const naam of Object.keys(s.anims)) {
    assert.ok(!/-west$/.test(naam),
      "west hoort gespiegeld oost te zijn, niet een eigen anim: " + naam);
  }
});

test("de loopcycli hebben vier frames en een deining", () => {
  const s = sprites.speler;
  for (const richting of ["noord", "oost", "zuid"]) {
    const anim = s.anims["loop-" + richting];
    assert.equal(anim.frames.length, 4,
      "loop-" + richting + " hoort vier frames te hebben");
    const hoogtes = anim.frames.map((f) => f.length);
    assert.ok(Math.max(...hoogtes) > Math.min(...hoogtes),
      "loop-" + richting + " heeft geen deining: alle frames even hoog");
  }
});

test("de sta-anims ademen: twee frames en een tempo", () => {
  const s = sprites.speler;
  for (const richting of ["noord", "oost", "zuid"]) {
    const anim = s.anims["sta-" + richting];
    assert.equal(anim.frames.length, 2, "sta-" + richting + " ademt niet");
    assert.ok(anim.fps > 0, "sta-" + richting + " heeft geen tempo");
  }
});

test("een eenmalige anim staat stil: fps 0", () => {
  // draai en zit-oost worden door de engine frame voor frame gezet, niet door
  // de klok. Een fps erop zou ze dubbel laten lopen.
  const s = sprites.speler;
  assert.equal(s.anims["draai"].fps, 0);
  assert.equal(s.anims["zit-oost"].fps, 0);
});
