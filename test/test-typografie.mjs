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
const hand = require(join(wortel, "js", "font-hand.js"));
const gfx = require(join(wortel, "js", "gfx.js"));
const strings = require(join(wortel, "js", "logic", "strings.js"));

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

// ---- Dekking: heeft elk teken dat het spel print een glyph? ----------------
//
// Dit is de controle waar de kop van font.js naar verwees maar die er nooit
// was: het bestand noemde een `tools/lint-font.mjs` die niet bestaat. Ze staat
// nu hier, waar ze bij elke run meeloopt.
//
// De aanleiding was een echte fout. De kop van het notitieboek-spread van level
// 3 zegt "validatie ×3", en dat maalteken zat niet in de font — dus stond er
// op de bladzijde "validatie ?3". Zoiets zie je pas als je toevallig díé
// bladzijde opslaat.

// Loop door een willekeurig genest object en verzamel elke string.
function alleStrings(waarde, uit) {
  if (typeof waarde === "string") { uit.push(waarde); return uit; }
  if (Array.isArray(waarde)) {
    for (const v of waarde) alleStrings(v, uit);
    return uit;
  }
  if (waarde && typeof waarde === "object") {
    for (const k of Object.keys(waarde)) alleStrings(waarde[k], uit);
  }
  return uit;
}

function dekking(glyphs, teksten) {
  const ontbreekt = new Map();
  for (const s of teksten) {
    for (const ch of s) {
      if (glyphs[ch] !== undefined) continue;
      // Alleen echte drukbare tekens tellen; een \n is een instructie.
      if (ch === "\n" || ch === "\t") continue;
      if (!ontbreekt.has(ch)) ontbreekt.set(ch, s.slice(0, 60));
    }
  }
  return [...ontbreekt.entries()]
    .map(([ch, ctx]) => JSON.stringify(ch) + " in " + JSON.stringify(ctx));
}

test("elk teken in de spelprose heeft een glyph in de font", () => {
  const strings = require(join(wortel, "js", "logic", "strings.js"));
  const lijst = dekking(font.glyphs, alleStrings(strings, []));
  assert.deepEqual(lijst, [],
    "deze tekens zouden als '?' op het scherm komen:\n  " + lijst.join("\n  "));
});

// ---- De handfont (WP 36) ---------------------------------------------------
//
// Het notitieboek wordt niet meer met de drukfont gezet maar met een eigen
// glyphset, js/font-hand.js. Wat hieronder bewaakt wordt is precies wat die
// font moet zijn: dezelfde dekking als de drukfont (anders staat er een "?" op
// een bladzijde), een cel die in de regelafstand van het spread past, échte
// variatie in inktbreedte, en — het hele punt — basislijnen die per teken
// verschillen. Zolang die drie liggingen bestaan, kan geen enkel patroon in de
// tekst als verticale banding terugkomen.

test("de handfont heeft de vorm die het spread verwacht", () => {
  assert.equal(hand.hoogte, 10);
  assert.equal(hand.breedte, 8);
  assert.equal(hand.xHoogte, 6);
  assert.equal(hand.basisRij, 7);
  assert.equal(hand.lijnRij, 8, "de liniatuur loopt op rij 8 van de cel");
});

test("elke handglyph is tien rijen van acht tekens", () => {
  for (const ch of Object.keys(hand.glyphs)) {
    const g = hand.glyphs[ch];
    assert.equal(g.length, hand.hoogte, "rijen van " + JSON.stringify(ch));
    for (const rij of g) {
      assert.equal(rij.length, hand.breedte, "rij van " + JSON.stringify(ch));
      assert.ok(/^[.1]*$/.test(rij), "vreemd teken in " + JSON.stringify(ch));
    }
  }
});

test("de handfont dekt alles wat de drukfont dekt", () => {
  // Anders kan één prosewijziging elders een "?" op een bladzijde zetten.
  const mist = Object.keys(font.glyphs).filter((c) => hand.glyphs[c] === undefined);
  assert.deepEqual(mist, []);
});

test("elk teken dat in handschrift op een bladzijde komt, heeft een handglyph", () => {
  // Alles wat door tekenHandschrift gaat: de koppen, de regels en de weekregel
  // van de veertien spread-bladzijden.
  const strings = require(join(wortel, "js", "logic", "strings.js"));
  const teksten = [];
  for (const id of Object.keys(strings.spreads)) {
    for (const pag of strings.spreads[id].paginas) {
      if (pag.kop) teksten.push(pag.kop);
      for (const r of pag.regels || []) teksten.push(r);
      if (pag.voet) teksten.push(pag.voet);
    }
  }
  assert.ok(teksten.length > 40, "de veertien bladzijden staan er");
  const lijst = dekking(hand.glyphs, teksten);
  assert.deepEqual(lijst, [],
    "deze tekens zouden als '?' in Alberta's hand komen:\n  " + lijst.join("\n  "));
});

test("de handfont heeft variabele inktbreedtes", () => {
  const breedtes = Object.keys(hand.glyphs).map((c) => hand.maat(c).breedte);
  assert.ok(Math.min(...breedtes) <= 2, "er hoort iets smals in te zitten");
  assert.ok(Math.max(...breedtes) >= 7, "er hoort iets breeds in te zitten");
  assert.ok(hand.maat("i").breedte < hand.maat("m").breedte);
  assert.equal(hand.maat(" ").breedte, 3, "het woordwit van de hand");
});

// Op welke rij eindigt de inkt van dit teken?
function onderste(ch) {
  const g = hand.glyphs[ch];
  for (let r = g.length - 1; r >= 0; r--) if (g[r].indexOf("1") !== -1) return r;
  return -1;
}
function bovenste(ch) {
  const g = hand.glyphs[ch];
  for (let r = 0; r < g.length; r++) if (g[r].indexOf("1") !== -1) return r;
  return -1;
}

test("de basislijn is per teken onregelmatig, gebakken in de glyphs", () => {
  // Kleine letters zonder staart. Hun onderste inktrij hoort niet voor alle
  // tekens dezelfde te zijn — dat is wat de oude driehoeksgolf moest doen en
  // wat nu in de data zit.
  const zonderStaart = "abcdefhiklmnorstuvwxz".split("");
  const liggingen = new Set(zonderStaart.map(onderste));
  assert.ok(liggingen.has(hand.basisRij - 1), "er staan letters boven de lijn");
  assert.ok(liggingen.has(hand.basisRij), "er staan letters op de lijn");
  assert.ok(liggingen.has(hand.basisRij + 1), "er staan letters op de lijn zelf");
  assert.equal(liggingen.size, 3, "meer dan één pixel afwijking is geen hand meer");
  // En de afwijking hangt aan het teken, niet aan een golf: "n" ligt anders dan
  // "e", zodat geen twee regels dezelfde deining krijgen.
  assert.notEqual(onderste("n"), onderste("e"));
});

test("stokken en staarten steken buiten de x-hoogte", () => {
  for (const ch of "bdfhkl".split("")) {
    assert.ok(bovenste(ch) <= 1, "stok van " + ch + " begint op rij " + bovenste(ch));
  }
  for (const ch of "gjpqy".split("")) {
    assert.ok(onderste(ch) >= hand.lijnRij,
      "staart van " + ch + " eindigt op rij " + onderste(ch));
  }
  // Niets steekt buiten de cel: de renderer tekent precies hoogte rijen.
  for (const ch of Object.keys(hand.glyphs)) {
    const o = onderste(ch);
    assert.ok(o < hand.hoogte, ch);
  }
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

test("handschrift meet met de handfont, niet met de drukfont", () => {
  // Sinds WP 36 heeft de hand haar eigen glyphset, en die is smaller dan de
  // drukfont. Wat hier telt is dat méten en zétten dezelfde font gebruiken:
  // handschriftBreedte moet exact de som van de handmaten zijn.
  const zin = "Een klasse is een blauwdruk";
  const verwacht = [...zin].reduce((b, ch) => b + hand.maat(ch).breedte + 1, 0) - 1;
  const gemeten = gfx.handschriftBreedte(zin, { seed: 1, variatie: false });
  assert.equal(gemeten, verwacht);
  assert.ok(gemeten < gfx.proseBreedte(zin),
    "de hand is smaller dan de druk; anders klopt het bladbudget niet meer");
});

test("de spatievariatie maakt de regel breder, en is uit te zetten", () => {
  const zin = "Een klasse is een blauwdruk";
  assert.ok(gfx.handschriftBreedte(zin, { seed: 1 }) >
    gfx.handschriftBreedte(zin, { seed: 1, variatie: false }));
});

test("meer schuinstand geeft meer overhang", () => {
  // De shear staat op 0 voor de handfont (de helling zit in de glyphs), maar de
  // optie blijft bestaan en het meten moet haar blijven kennen — anders zou een
  // aanroeper die haar wél zet over de kolomrand schrijven.
  const zin = "constructor";
  assert.ok(gfx.handschriftBreedte(zin, { seed: 1, schuin: 0.5 }) >
    gfx.handschriftBreedte(zin, { seed: 1, schuin: 0.1 }));
  assert.equal(gfx.handschriftBreedte(zin, { seed: 1, schuin: 0 }),
    gfx.handschriftBreedte(zin, { seed: 1 }), "0 is de standaard");
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

test("een venster is standaard geen vraag", () => {
  assert.equal(venster(["Kort."]).vraag, false);
});

test("vraag: true merkt het venster als vraagvenster", () => {
  assert.equal(venster(["Wil je dat echt?"], { vraag: true }).vraag, true);
});

// Een vraagvenster laat de invoerbalk vrij, dus Enter en spatie typen mee in
// plaats van door te bladeren. Past de vraag niet op één pagina, dan is de
// tweede pagina onbereikbaar. Ze moet dus passen.
test("de herbegin-vraag past op één pagina", () => {
  const v = venster([strings.herbeginVraag], { vraag: true });
  assert.equal(v.paginas.length, 1,
    "een vraagvenster kan niet gebladerd worden, dus het mag niet pagineren");
});

// De vijf openingsbeats staan als onderschrift onder het beeld, met de maten
// uit js/engine.js (toonOpeningStap: maxTekens 38, maxRegels 6). Pagineert er
// één, dan bladert Enter door de tekst in plaats van door de reeks en voelt de
// opening als vastgelopen (workflow/19-de-opening.md). Tot WP 45 werd dat met
// de hand nagerekend; nu meet de test het, want de intro is herschreven.
test("geen enkel onderschrift van de opening pagineert", () => {
  strings.intro.forEach((alinea, i) => {
    const v = venster([alinea], { plaatsing: "onder", maxTekens: 38, maxRegels: 6 });
    assert.equal(v.paginas.length, 1,
      "beat " + (i + 1) + " pagineert: " + v.paginas.length + " pagina's");
  });
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
