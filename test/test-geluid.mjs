// test-geluid.mjs — de geluidslaag, headless. Er is hier geen AudioContext, en
// dat is precies de eerste eigenschap die getest hoort te worden: het spel moet
// zonder geluid gewoon draaien. Alles daarna keurt de dáta — de cue- en
// bedtabellen — want die is met de hand geschreven en een noot met een negatieve
// duur of een toonhoogte buiten het gehoor valt in een browser niet op.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const sound = require(join(wortel, "js", "sound.js"));

// ---- Zonder AudioContext ---------------------------------------------------

test("zonder AudioContext doet niets iets, en niets crasht", () => {
  // In Node bestaat window niet, dus zorgCtx komt nooit aan een context.
  assert.doesNotThrow(() => sound.unlock());
  assert.doesNotThrow(() => sound.speel("toets"));
  assert.doesNotThrow(() => sound.speel("bestaat-niet"));
  assert.doesNotThrow(() => sound.muziek("ambient-zolder"));
  assert.doesNotThrow(() => sound.muziek("bestaat-niet"));
  assert.doesNotThrow(() => sound.muziek(null));
  assert.doesNotThrow(() => sound.tik());
  assert.doesNotThrow(() => sound.zetAan(false));
  assert.doesNotThrow(() => sound.zetAan(true));
});

test("een bed dat niet gestart kon worden, wordt niet als lopend gemeld", () => {
  // Zonder context kan er geen bed lopen. Zou huidigBed() hier een naam geven,
  // dan zou de engine denken dat de muziek al draait en hem nooit meer starten
  // wanneer er wél geluid is.
  sound.zetAan(true);
  sound.muziek("ambient-zolder");
  assert.equal(sound.huidigBed(), null);
  sound.muziek(null);
});

// ---- geluid uit ------------------------------------------------------------

test("geluid uit vergeet het actieve bed", () => {
  sound.zetAan(true);
  sound.muziek("titel");
  sound.zetAan(false);
  assert.equal(sound.huidigBed(), null,
    "een bed dat blijft staan met het geluid uit, zou bij aanzetten stil blijven");
  assert.equal(sound.isAan(), false);
  sound.zetAan(true);
});

test("met het geluid uit start muziek() geen bed", () => {
  sound.zetAan(false);
  sound.muziek("pc");
  assert.equal(sound.huidigBed(), null);
  sound.zetAan(true);
});

// ---- De cue-tabel ----------------------------------------------------------

function keurNoten(noten, waar) {
  assert.ok(Array.isArray(noten) && noten.length > 0, waar + ": geen noten");
  for (const [i, n] of noten.entries()) {
    const w = waar + " noot " + i;
    assert.ok(Array.isArray(n) && n.length === 3,
      w + ": verwacht [midi, start, duur]");
    const [midi, start, duur] = n;
    // Midi 21 is de laagste toets van een piano, 108 de hoogste. Daarbuiten is
    // het geen muziek meer maar gerommel of gepiep.
    assert.ok(Number.isFinite(midi) && midi >= 21 && midi <= 108,
      w + ": toonhoogte " + midi + " valt buiten midi 21–108");
    assert.ok(Number.isFinite(start) && start >= 0, w + ": start " + start);
    assert.ok(Number.isFinite(duur) && duur > 0, w + ": duur " + duur);
  }
}

test("elke eenmalige cue heeft geldige noten en een bekende stem", () => {
  const stemmen = Object.keys(sound._stemmen);
  for (const naam of Object.keys(sound._cues)) {
    const cue = sound._cues[naam];
    assert.ok(stemmen.includes(cue.stem),
      naam + ": onbekende stem '" + cue.stem + "'");
    keurNoten(cue.noten, naam);
  }
});

test("een eenmalige cue blijft kort", () => {
  // Een cue die langer duurt dan anderhalve seconde is geen cue meer maar
  // muziek, en dan hoort hij een bed te zijn.
  for (const naam of Object.keys(sound._cues)) {
    const cue = sound._cues[naam];
    const eind = Math.max(...cue.noten.map(([, s, d]) => s + d));
    assert.ok(eind <= 1.5, naam + " duurt " + eind.toFixed(2) + " s");
  }
});

test("cues staat gelijk aan de cue-tabel", () => {
  assert.deepEqual(sound.cues.slice().sort(),
    Object.keys(sound._cues).sort());
});

// ---- De muziekbedden -------------------------------------------------------

test("elk bed heeft een lengte, een stem en geldige noten", () => {
  const stemmen = Object.keys(sound._stemmen);
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    assert.ok(Number.isFinite(bed.lengte) && bed.lengte > 1,
      naam + ": onzinnige lengte " + bed.lengte);
    assert.ok(stemmen.includes(bed.stem),
      naam + ": onbekende stem '" + bed.stem + "'");
    keurNoten(bed.noten, naam);
  }
});

test("geen noot begint na het einde van zijn omloop", () => {
  // Een noot die ná de omloop begint, wordt nooit geplaatst: de scheduler zet de
  // teller terug op nul zodra de omloop om is. Stille dode data dus.
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    for (const [i, n] of bed.noten.entries()) {
      assert.ok(n[1] < bed.lengte,
        naam + " noot " + i + " begint op " + n[1] + " maar de omloop is " +
        bed.lengte + " s");
    }
  }
});

test("een lopend bed heeft stilte aan het eind van zijn omloop", () => {
  // Anders plakt de laatste noot tegen de eerste van de volgende omloop aan en
  // hoor je de naad. Het register vraagt bovendien om stilte tussen de frasen.
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    if (bed.eenmalig) continue;
    const eind = Math.max(...bed.noten.map(([, s, d]) => s + d));
    assert.ok(bed.lengte - eind >= 0.2,
      naam + ": laatste noot eindigt op " + eind.toFixed(2) + " van " +
      bed.lengte + " — geen naad-stilte");
  }
});

test("de zolder is trager en leger dan de pc", () => {
  // Het register uit WP C, als test: de zolder hoort niet gezellig te klinken.
  // Notendichtheid als maat — noten per seconde.
  const zolder = sound._bedden["ambient-zolder"];
  const pc = sound._bedden.pc;
  const dichtheid = (b) => b.noten.length / b.lengte;
  assert.ok(dichtheid(zolder) < dichtheid(pc),
    "de zolder (" + dichtheid(zolder).toFixed(3) + "/s) hoort leger te zijn " +
    "dan de pc (" + dichtheid(pc).toFixed(3) + "/s)");
});

test("bedden staat gelijk aan de bedtabel", () => {
  assert.deepEqual(sound.bedden.slice().sort(),
    Object.keys(sound._bedden).sort());
});

// ---- De stemmen ------------------------------------------------------------

test("elke stem heeft een volledige FM-definitie", () => {
  const golven = ["sine", "square", "triangle", "sawtooth"];
  for (const naam of Object.keys(sound._stemmen)) {
    const s = sound._stemmen[naam];
    assert.ok(golven.includes(s.golf), naam + ": onbekende golfvorm " + s.golf);
    assert.ok(s.ratio > 0, naam + ": ratio moet positief zijn");
    assert.ok(s.index >= 0, naam + ": index mag niet negatief zijn");
    assert.ok(s.aanzet > 0, naam + ": aanzet moet positief zijn (exponentiële " +
      "envelopes mogen niet op nul beginnen)");
    assert.ok(s.verval > 0, naam + ": verval moet positief zijn");
    assert.ok(s.gain > 0 && s.gain <= 1, naam + ": gain buiten 0–1");
  }
});

// ---- Doc en code in de pas -------------------------------------------------

test("de cue-woordenlijst in engine-architectuur.md klopt met de code", () => {
  // Dezelfde soort test als die de vier oordeelteksten aan save-en-hints.md
  // houdt: een woordenlijst in een doc die niemand naleest, drijft weg.
  const doc = readFileSync(join(wortel, "docs", "engine-architectuur.md"), "utf8");
  const regel = doc.split("\n").find((l) => l.includes("`geluid:<cue>`"));
  assert.ok(regel, "de geluid-tag staat niet in de effect-tabel");
  const genoemd = [...regel.matchAll(/`([a-z-]+(?:-\d)?)`/g)]
    .map((m) => m[1])
    .filter((n) => n !== "geluid:<cue>" && n !== "aan" && n !== "uit");
  const bekend = new Set([...sound.cues, ...sound.bedden]);
  for (const naam of genoemd) {
    if (naam.startsWith("geluid")) continue;
    assert.ok(bekend.has(naam),
      "de doc noemt cue '" + naam + "' die de code niet kent");
  }
  for (const naam of sound.cues) {
    assert.ok(regel.includes("`" + naam + "`"),
      "de code kent cue '" + naam + "' die de doc niet noemt");
  }
  for (const naam of sound.bedden) {
    assert.ok(regel.includes("`" + naam + "`"),
      "de code kent bed '" + naam + "' dat de doc niet noemt");
  }
});
