// palette.js — het vaste 64-kleuren-palet voor The Legacy of Alberta. De
// renderer werkt intern met palet-indexen (één byte per pixel); pas bij het
// presenteren zet hij een index om naar een echte kleur. Indexen 0–15 zijn de
// EGA-basis (identiek aan de predecessor, zodat overgenomen scènes blijven
// kloppen); 16–63 zijn ramps voor huid, hout, avondlicht, papier, gebladerte,
// steen, gloed en nacht. Zie docs/art-stijlgids.md voor de betekenis per index.
//
// Aangepast uit remake-90s (js/palette.js van Revenge of Red Riding Hood): daar
// zestien EGA-kleuren, hier uitgebreid tot vierenzestig. De structuur (KLEUREN
// als [r,g,b], HEX als strings, Node-export) blijft dezelfde.
//
// Draait zowel in de browser (AL.palet) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

// De vierenzestig kleuren als [r, g, b], in palet-indexvolgorde.
var KLEUREN = [
  // 0–15 — EGA-basis
  [0x00, 0x00, 0x00], //  0 zwart
  [0x00, 0x00, 0xAA], //  1 donkerblauw
  [0x00, 0xAA, 0x00], //  2 donkergroen
  [0x00, 0xAA, 0xAA], //  3 cyaan
  [0xAA, 0x00, 0x00], //  4 donkerrood
  [0xAA, 0x00, 0xAA], //  5 magenta
  [0xAA, 0x55, 0x00], //  6 bruin
  [0xAA, 0xAA, 0xAA], //  7 lichtgrijs
  [0x55, 0x55, 0x55], //  8 donkergrijs
  [0x55, 0x55, 0xFF], //  9 helderblauw
  [0x55, 0xFF, 0x55], // 10 lichtgroen
  [0x55, 0xFF, 0xFF], // 11 lichtcyaan
  [0xFF, 0x55, 0x55], // 12 helderrood
  [0xFF, 0x55, 0xFF], // 13 lichtmagenta
  [0xFF, 0xFF, 0x55], // 14 geel
  [0xFF, 0xFF, 0xFF], // 15 wit
  // 16–21 — huid-ramp
  [0x4A, 0x2A, 0x1E], // 16 huid schaduwdiep
  [0x7A, 0x42, 0x30], // 17 huid schaduw
  [0xA8, 0x6B, 0x4C], // 18 huid mid
  [0xCC, 0x8F, 0x68], // 19 huid licht
  [0xE8, 0xB9, 0x8D], // 20 huid hooglicht
  [0xF7, 0xDC, 0xC0], // 21 huid bleek/blos
  // 22–27 — hout-ramp
  [0x2E, 0x1A, 0x0D], // 22 hout diepst
  [0x4D, 0x2F, 0x16], // 23 hout schaduw
  [0x6B, 0x44, 0x23], // 24 hout mid
  [0x8A, 0x5A, 0x2B], // 25 hout warm
  [0xA9, 0x74, 0x3D], // 26 hout licht
  [0xC9, 0x9A, 0x63], // 27 hout hooglicht
  // 28–34 — avondlicht-ramp (het dakraam)
  [0x24, 0x1A, 0x33], // 28 avond diep (paarsblauw)
  [0x3D, 0x2B, 0x4D], // 29 avond schaduw
  [0x6B, 0x4A, 0x63], // 30 avond mauve
  [0xA8, 0x6A, 0x6A], // 31 avond rozerood
  [0xD9, 0x8C, 0x5F], // 32 avond oranje
  [0xF0, 0xB2, 0x5C], // 33 avond goud
  [0xFF, 0xE3, 0xA0], // 34 avond lichtstraal
  // 35–41 — papier-ramp (het notitieboek)
  [0xD9, 0xC9, 0xA3], // 35 papier schaduw
  [0xE9, 0xDC, 0xB8], // 36 papier mid
  [0xF5, 0xEC, 0xD0], // 37 papier licht
  [0xFB, 0xF6, 0xE6], // 38 papier hoogste
  [0xB0, 0x9A, 0x6A], // 39 vlekrand (koffie/water)
  [0x8A, 0x6F, 0x42], // 40 vlek diep
  [0x3A, 0x2F, 0x22], // 41 inkt (bruinzwart handschrift)
  // 42–47 — gebladerte-ramp
  [0x12, 0x33, 0x1A], // 42 groen diepst
  [0x1F, 0x5A, 0x2A], // 43 groen schaduw
  [0x2F, 0x80, 0x38], // 44 groen mid
  [0x52, 0xA9, 0x4A], // 45 groen licht
  [0x86, 0xC9, 0x5F], // 46 groen hooglicht
  [0xC2, 0xE0, 0x8A], // 47 groen zon
  // 48–53 — steen/koelgrijs-ramp
  [0x1C, 0x20, 0x26], // 48 steen diepst
  [0x33, 0x38, 0x3F], // 49 steen schaduw
  [0x56, 0x5D, 0x66], // 50 steen mid
  [0x7C, 0x82, 0x8B], // 51 steen licht
  [0xA7, 0xAD, 0xB5], // 52 steen hooglicht
  [0xD5, 0xD9, 0xDE], // 53 steen hoogste
  // 54–58 — gloed-ramp (kaars, monitor, amber)
  [0x3A, 0x1F, 0x00], // 54 gloed diep
  [0x7A, 0x4A, 0x00], // 55 gloed schaduw
  [0xC9, 0x84, 0x00], // 56 gloed amber
  [0xFF, 0xBF, 0x3A], // 57 gloed licht
  [0xFF, 0xF0, 0xB8], // 58 gloed hoogste (warm schermwit)
  // 59–63 — nacht/water-ramp
  [0x07, 0x1A, 0x2E], // 59 nacht diepst
  [0x10, 0x3A, 0x5A], // 60 nacht schaduw
  [0x1F, 0x6F, 0xA0], // 61 nacht mid (avondlucht door raam)
  [0x4A, 0xA6, 0xC9], // 62 water/lucht licht
  [0x9F, 0xD8, 0xE6]  // 63 water/lucht hooglicht
];

// Dezelfde kleuren als hex-strings, handig voor CSS-variabelen (de pc-overlay)
// en debug-overlays/tooling.
function naarHex(rgb) {
  function twee(n) { var s = n.toString(16); return s.length === 1 ? "0" + s : s; }
  return "#" + twee(rgb[0]) + twee(rgb[1]) + twee(rgb[2]);
}
var HEX = KLEUREN.map(naarHex);

// De ramps uit art-stijlgids.md, elk geordend van donker naar licht. Ze zijn
// wat een verduistering mogelijk maakt zónder een tweede palet: een kleur zakt
// gewoon een of twee stappen binnen zijn eigen familie. Dat is de basis voor
// contactschaduwen en voor props die van één lichtbron belicht lijken.
//
// Niet elke index zit in een ramp: 6 (bruin) en 14 (geel) staan op zichzelf, en
// verduisteren laat die dus ongemoeid. De EGA-paren zijn wél opgenomen, zodat
// ook een vlak in een EGA-kleur een schaduwkant kan krijgen.
var RAMPEN = [
  [0, 8, 7, 15],                     // grijs
  [1, 9],                            // blauw
  [2, 10],                           // groen (EGA)
  [3, 11],                           // cyaan
  [4, 12],                           // rood — baksteen, vuur, `rode mantel` (sim)
  [5, 13],                           // magenta
  [16, 17, 18, 19, 20, 21],          // huid
  [22, 23, 24, 25, 26, 27],          // hout
  [28, 29, 30, 31, 32, 33, 34],      // avondlicht
  [35, 36, 37, 38],                  // papier
  [41, 40, 39],                      // inkt naar vlekrand
  [42, 43, 44, 45, 46, 47],          // gebladerte
  [48, 49, 50, 51, 52, 53],          // steen
  [54, 55, 56, 57, 58],              // gloed
  [59, 60, 61, 62, 63]               // nacht en water
];

// index -> { ramp, pos }, één keer opgebouwd.
var RAMP_VAN = {};
(function () {
  for (var r = 0; r < RAMPEN.length; r++) {
    for (var p = 0; p < RAMPEN[r].length; p++) {
      RAMP_VAN[RAMPEN[r][p]] = { ramp: RAMPEN[r], pos: p };
    }
  }
})();

AL.palet = {
  KLEUREN: KLEUREN,
  HEX: HEX,
  RAMPEN: RAMPEN,

  // In welke ramp zit deze kleur, en waar? null als ze in geen enkele ramp zit.
  rampVan: function (index) {
    return RAMP_VAN[index] || null;
  },

  // Zak n stappen donkerder binnen de eigen ramp; klemt op de donkerste kleur
  // van die ramp. Een kleur zonder ramp blijft ongewijzigd.
  verduister: function (index, n) {
    var r = RAMP_VAN[index];
    if (!r) return index;
    var p = r.pos - (n === undefined ? 1 : n | 0);
    if (p < 0) p = 0;
    if (p >= r.ramp.length) p = r.ramp.length - 1;
    return r.ramp[p];
  },

  // Idem, maar lichter.
  verhelder: function (index, n) {
    var r = RAMP_VAN[index];
    if (!r) return index;
    var p = r.pos + (n === undefined ? 1 : n | 0);
    if (p < 0) p = 0;
    if (p >= r.ramp.length) p = r.ramp.length - 1;
    return r.ramp[p];
  },

  // Aantal geldige indexen (voor de debugPalet-guard in gfx.js).
  aantal: KLEUREN.length,

  // Sprite-sub-palet-codering (art-stijlgids.md, sprite-beslissing): een sprite
  // declareert een lokaal sub-palet van tot 16 echte paletindexen; de
  // frame-tekens 0–f verwijzen naar dat sub-palet. Deze helper vertaalt één
  // frameteken naar de echte paletindex, of geeft -1 voor transparant (".") of
  // een ongeldig teken. Zo kan een compacte pixel-string toch uit de volle 64
  // kleuren putten.
  subIndex: function (subPalet, teken) {
    if (teken === "." || teken === undefined) return -1;
    var lokaal = parseInt(teken, 16);
    if (isNaN(lokaal)) return -1;
    if (!subPalet) return lokaal;                 // geen sub-palet: teken = index
    if (lokaal < 0 || lokaal >= subPalet.length) return -1;
    return subPalet[lokaal];
  }
};

// Node-export voor de headless tools (lint, screenshot, tests).
if (typeof module !== "undefined") {
  module.exports = AL.palet;
}
