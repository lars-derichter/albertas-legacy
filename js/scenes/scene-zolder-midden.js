// scene-zolder-midden.js — de doorgang, de spil van de zolder-hub. Mood uit
// art-stijlgids.md: balken (hout-ramp 22–27), de broncode-doos centraal, licht
// dat van west naar oost trekt; spil, iets plechtigs. Verbindt west, oost en —
// via een trap in de achterwand — de overloop (noord). Naast de broncode-doos
// staan de gemerkte fragment-dozen (levels 2–4).
//
// Aangepast uit remake-90s (scène-schema en draw-op-formaat); nieuwe scène met
// het 64-kleuren-palet. De props staan als tekening in de picture; de sprites
// in js/sprites/ zijn de canonieke prop-definities uit de inventaris.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-midden"] = {
  id: "zolder-midden",

  picture: [
    // Achterwand: zolderschemer.
    ["fill", 29],
    ["rect", 28, 0, 8, 320, 42],

    // De trap-opening naar de overloop, centraal in de achterwand: een donker
    // gat met een paar treden die naar boven wijzen (nacht-ramp diep).
    ["rect", 22, 148, 20, 48, 100],
    ["rect", 28, 152, 24, 40, 92],
    ["line", 24, [152, 40, 191, 40]],
    ["line", 24, [154, 56, 189, 56]],
    ["line", 24, [156, 72, 187, 72]],
    ["line", 24, [158, 88, 185, 88]],
    ["line", 24, [160, 104, 183, 104]],

    // Houten vloer met planklijnen.
    ["rect", 24, 0, 120, 320, 69],
    ["line", 23, [0, 120, 319, 120]],
    ["line", 22, [0, 142, 319, 142]],
    ["line", 22, [0, 164, 319, 164]],
    ["line", 22, [0, 186, 319, 186]],

    // Gording en staanders.
    ["rect", 23, 0, 50, 148, 8],
    ["rect", 23, 196, 50, 124, 8],
    ["rect", 23, 40, 58, 10, 62],
    ["rect", 23, 270, 58, 10, 62],

    // Licht dat van west naar oost trekt: twee zachte wiggen, links warm.
    ["poly", 32, [0, 66, 34, 66, 70, 150, 0, 150]],
    ["dither", 33, 32, [0, 74, 26, 74, 56, 142, 0, 142]],

    // De broncode-doos, centraal-voor: zwaarder dan de rest, dichtgeplakt,
    // gemerkt "BRONCODE" in Alberta's hand. Blijft dicht tot het einde.
    ["rect", 22, 130, 150, 76, 38],
    ["rect", 25, 132, 130, 72, 30],
    ["rect", 26, 132, 130, 72, 8],
    ["line", 23, [132, 150, 203, 150]],
    ["line", 23, [168, 130, 168, 188]],
    ["rect", 23, 150, 128, 36, 6],
    // Label-vlak (papier) met inkt-streepjes die "BRONCODE" suggereren.
    ["rect", 36, 140, 140, 56, 12],
    ["px", 41, [[144, 144], [148, 144], [152, 144], [158, 144], [162, 144],
      [168, 144], [172, 144], [178, 144], [182, 144], [188, 144],
      [144, 148], [150, 148], [156, 148], [164, 148], [170, 148], [180, 148]]],

    // De gemerkte fragment-dozen (levels 2–4), rechts opgestapeld: karton met
    // schaduw, kleine labels.
    ["rect", 23, 236, 128, 60, 58],
    ["rect", 26, 238, 130, 56, 54],
    ["rect", 25, 238, 130, 56, 6],
    ["line", 22, [238, 157, 293, 157]],
    ["line", 22, [266, 130, 266, 184]],
    ["rect", 36, 246, 138, 26, 10],
    ["px", 41, [[249, 142], [253, 142], [257, 142], [263, 142], [267, 142],
      [251, 145], [257, 145], [265, 145]]]
  ],

  // Beloopbare vloer (west↔oost) plus een verticale trap-corridor naar de
  // overloop (noord): de corridor reikt tot de bovenrand zodat de speler kan
  // oversteken.
  walkboxes: [
    [0, 150, 320, 39],
    [150, 8, 42, 181]
  ],

  entries: {
    start: [80, 175],
    vanWest: [20, 175],
    vanOost: [300, 175],
    vanNoord: [170, 26]
  },

  // De broncode-doos (prijs) en de gemerkte fragment-dozen zijn de
  // interactiepunten. De tekening staat in de picture; de sprites zijn canoniek.
  hotspots: [
    { item: "broncode-doos", sprite: "broncode-doos", x: 168, y: 188 },
    { item: "doos", sprite: "doos", x: 266, y: 184 }
  ],

  props: [],
  overlays: []
};
