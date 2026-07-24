// test-typografie.mjs — de proportionele zetlaag uit WP F: de inktmaten per
// glyph, het meten en tekenen van prose, het wrappen op pixels in plaats van op
// tekens, het handschrift, en de doos van het berichtvenster.
//
// Waarom dit getest wordt en het oude wrappen niet: zolang er in tekens geteld
// werd, was "past het?" een eigenschap van de string. Nu is het een eigenschap
// van de font, en een fout in één glyphmaat is met het blote oog pas te zien op
// de regel die net te lang wordt. Vandaar dat elke test hieronder meet in
// plaats van kijkt: de renderer mag geen pixel buiten de gemeten breedte zetten,
// en geen gewrapte regel mag breder uitkomen dan waarop gewrapt is.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

require(join(wortel, "js", "palette.js"));
const font = require(join(wortel, "js", "font.js"));
const gfx = require(join(wortel, "js", "gfx.js"));

const BREEDTE = 320;

let teller = 0;

// ---- De inktmaten ----------------------------------------------------------

test("elke glyph heeft een maat, en die past binnen de cel", () => {
  const namen = Object.keys(font.glyphs);
  assert.ok(namen.length > 90, "de font dekt meer dan negentig tekens");
  for (const ch of namen) {
    const m = font.maat(ch);
    assert.ok(m.links >= 0 && m.links < font.breedte, "links buiten de cel: " + ch);
    assert.ok(m.breedte >= 0, "negatieve breedte: " + ch);
    assert.ok(m.links + m.breedte <= font.breedte, "steekt uit de cel: " + ch);
  }
});

test("de maat is de échte inkt, dus smalle letters zijn smaller", () => {
  assert.ok(font.maat("i").breedte < font.maat("M").breedte,
    "een i hoort smaller te zijn dan een M");
  assert.ok(font.maat(".").breedte < font.maat("w").breedte);
});

test("de spatie heeft een eigen maat, anders plakken woorden aan elkaar", () => {
  assert.equal(font.maat(" ").breedte, 4);
  assert.ok(gfx.proseBreedte("a b") > gfx.proseBreedte("ab"));
});

test("de linkerruimte wordt weggerekend, dus geen valse inspringing", () => {
  // Een "i" begint niet op kolom 0. Zonder de linkerruimte weg te rekenen zou
  // elke regel die met een i begint een paar pixels ingesprongen staan.
  assert.ok(font.maat("i").links > 0, "de testaanname klopt: i begint niet op 0");
  const gezet = gezettePixels("i");
  assert.equal(gezet.minX, 0, "de inkt hoort op de opgegeven x te beginnen");
});

test("een onbekend teken valt terug op de maat van ?", () => {
  assert.deepEqual(font.maat("☃"), font.maat("?"));
});

// ---- Meten en tekenen ------------------------------------------------------

// Waar zet deze regel inkt neer als hij op x = 0 begint?
//
// De publieke tekenroutine schrijft naar de interne backing store, en die
// bestaat zonder canvas niet. Daarom loopt deze helper zelf over de glyphdata,
// met exact dezelfde maten als tekenProse. Wat hier bewaakt wordt is dus de
// verhouding tussen méten en zétten: proseBreedte mag nooit smaller uitkomen
// dan waar de inkt werkelijk staat. Het tekenen zelf zit in de
// browser-rooksmaaktesten.
function gezettePixels(tekst) {
  gfx.debugPalet = true;
  const buf = gfx.cacheScene("typo-" + (teller++) + "-" + tekst, [["fill", 0]]);
  let cx = 0, minX = Infinity, maxX = -1;
  for (const ch of tekst) {
    const glyph = font.glyphs[ch] || font.glyphs["?"];
    const m = font.maat(ch);
    for (let row = 0; row < font.hoogte; row++) {
      for (let col = 0; col < m.breedte; col++) {
        if (glyph[row].charAt(m.links + col) !== "1") continue;
        const x = cx + col;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        buf[row * BREEDTE + x] = 15;
      }
    }
    cx += m.breedte + font.spatiering;
  }
  return { minX: minX === Infinity ? 0 : minX, maxX: maxX, eind: cx };
}

test("proseBreedte telt de spatiëring tussen de tekens, niet erachter", () => {
  const b = gfx.proseBreedte("ab");
  const verwacht = font.maat("a").breedte + font.spatiering + font.maat("b").breedte;
  assert.equal(b, verwacht);
});

test("proseBreedte van een lege string is nul", () => {
  assert.equal(gfx.proseBreedte(""), 0);
});

test("geen enkele pixel valt buiten de gemeten breedte", () => {
  for (const zin of ["Alberta", "iii", "MMM", "De westhoek.", "zo'n vlek —"]) {
    const g = gezettePixels(zin);
    assert.ok(g.maxX < gfx.proseBreedte(zin),
      "'" + zin + "' zet inkt op " + g.maxX + " maar meet " +
      gfx.proseBreedte(zin));
  }
});

test("prose is smaller dan hetzelfde in monospace", () => {
  const zin = "Op een kist ligt Alberta's notitieboek.";
  assert.ok(gfx.proseBreedte(zin) < zin.length * font.breedte,
    "anders was de hele omslag zinloos");
});

// ---- Wrappen op pixels -----------------------------------------------------

test("wrappen zonder meetfunctie blijft monospace rekenen", () => {
  // De terminal en alles wat op een raster hoort, mag hier niet door veranderen.
  const regels = gfx._wrap("een twee drie vier vijf", 10 * font.breedte);
  for (const r of regels) {
    assert.ok(r.length <= 10, "'" + r + "' is langer dan tien cellen");
  }
});

test("wrappen met een meetfunctie houdt elke regel binnen de breedte", () => {
  const meet = (t) => gfx.proseBreedte(t);
  const alinea = "De westhoek. Dozen tot tegen de balken, dicht op elkaar. " +
    "Door het dakraam valt een schuine streep licht, laag al.";
  const breed = 136;
  const regels = gfx._wrap(alinea, breed, meet);
  assert.ok(regels.length > 1, "de testtekst hoort te moeten breken");
  for (const r of regels) {
    assert.ok(meet(r) <= breed, "'" + r + "' meet " + meet(r) + " > " + breed);
  }
});

test("een harde regelafbreking blijft een regelafbreking", () => {
  const regels = gfx._wrap("een\ntwee", 320, (t) => gfx.proseBreedte(t));
  assert.deepEqual(regels, ["een", "twee"]);
});

test("een woord dat op zichzelf te breed is, komt alleen op zijn regel", () => {
  const meet = (t) => gfx.proseBreedte(t);
  const regels = gfx._wrap("ja onverantwoordelijkheidsverzekering nee", 60, meet);
  assert.ok(regels.indexOf("onverantwoordelijkheidsverzekering") !== -1,
    "het lange woord mag niet stilletjes verdwijnen");
});

// ---- Handschrift -----------------------------------------------------------

test("handschriftBreedte is deterministisch bij dezelfde seed", () => {
  const a = gfx.handschriftBreedte("Voor jou die dit later leest", { seed: 3 });
  const b = gfx.handschriftBreedte("Voor jou die dit later leest", { seed: 3 });
  assert.equal(a, b);
});

test("handschrift is breder dan prose: spatievariatie en schuinstand", () => {
  const zin = "Een klasse is een blauwdruk";
  assert.ok(gfx.handschriftBreedte(zin, { seed: 1 }) > gfx.proseBreedte(zin));
});

test("meer schuinstand geeft meer overhang", () => {
  const zin = "constructor";
  assert.ok(gfx.handschriftBreedte(zin, { seed: 1, schuin: 0.5 }) >
    gfx.handschriftBreedte(zin, { seed: 1, schuin: 0.1 }));
});

// ---- Het berichtvenster ----------------------------------------------------

function venster(alineas, opties) {
  return gfx.maakVenster(alineas, opties || {});
}

test("het venster krimpt naar zijn breedste regel", () => {
  const smal = gfx.vensterKader(venster(["Ja."]));
  const breed = gfx.vensterKader(venster([
    "Dozen tot tegen de balken, dicht op elkaar, en niemand die ze ooit nog " +
    "rechtzet of opruimt."]));
  assert.ok(smal.b < breed.b, "een kort antwoord hoort een kleine doos te zijn");
});

test("het venster wordt nooit breder dan zijn maximum", () => {
  const v = venster(["woord ".repeat(60)], { maxTekens: 30 });
  const k = gfx.vensterKader(v);
  assert.ok(k.b <= 30 * font.breedte + 14, "breder dan maxTekens toelaat");
  assert.ok(k.x >= 0 && k.x + k.b <= BREEDTE, "steekt buiten het scherm");
});

test("het venster heeft een bodembreedte, ook voor één woord", () => {
  const k = gfx.vensterKader(venster(["Nee."]));
  assert.ok(k.b >= 96, "een venster van vijftig pixels leest als een tooltip");
});

test("krimp: false houdt de volle hoogte aan", () => {
  const los = gfx.vensterKader(venster(["Kort."], { maxRegels: 8 }));
  const vast = gfx.vensterKader(venster(["Kort."], { maxRegels: 8, krimp: false }));
  assert.ok(vast.h > los.h);
});

test("plaatsing onder zet het venster onderaan het speelveld", () => {
  const midden = gfx.vensterKader(venster(["Een regel."]));
  const onder = gfx.vensterKader(venster(["Een regel."], { plaatsing: "onder" }));
  assert.ok(onder.y > midden.y);
  assert.ok(onder.y + onder.h <= 189, "mag niet in de invoerbalk lopen");
});

test("proportioneel zetten kost minder regels dan monospace", () => {
  // De opening rekent erop dat geen onderschrift pagineert; dat werd bij de
  // omslag alleen maar ruimer, en deze test houdt dat vast.
  const alinea = "Je grootmoeder Alberta maakte spellen, in de tijd dat een " +
    "spel nog op één zolder paste. Ze is er niet meer.";
  const prop = gfx._wrap(alinea, 34 * font.breedte, (t) => gfx.proseBreedte(t));
  const mono = gfx._wrap(alinea, 34 * font.breedte);
  assert.ok(prop.length <= mono.length);
});
