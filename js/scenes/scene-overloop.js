// scene-overloop.js — de optionele vierde scène (spelontwerp-legacy.md,
// §Beslissing: overloop mag WP 6 toevoegen voor ademruimte). Mood uit
// art-stijlgids.md: trap/berging, koeler (steen-ramp 49–52), minder avondlicht;
// ademruimte. Hier staan de latere fragment-dozen (levels 5–7), dieper in
// Alberta's archief. Eén uitgang: zuid, de trap terug naar zolder-midden.
//
// Aangepast uit remake-90s (scène-schema en draw-op-formaat); nieuwe scène met
// het 64-kleuren-palet.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["overloop"] = {
  id: "overloop",

  picture: [
    // Achterwand en plafond: koeler, steen-schemer.
    ["fill", 49],
    ["rect", 48, 0, 8, 320, 44],

    // Een klein zolderraampje links, koel nachtlicht (nacht-ramp), geen warme
    // straal meer.
    ["rect", 24, 24, 24, 52, 44],
    ["rect", 60, 28, 28, 44, 36],
    ["dither", 61, 60, [28, 28, 72, 28, 72, 46, 28, 46]],
    ["line", 23, [50, 28, 50, 64]],
    ["line", 23, [28, 46, 72, 46]],

    // Koele steenvloer met voegen.
    ["rect", 50, 0, 120, 320, 69],
    ["line", 49, [0, 120, 319, 120]],
    ["line", 49, [0, 144, 319, 144]],
    ["line", 49, [0, 168, 319, 168]],
    ["line", 49, [80, 120, 60, 189]],
    ["line", 49, [180, 120, 200, 189]],
    ["line", 49, [280, 120, 300, 189]],

    // Het trapgat naar beneden (zuid), rechts-voor: een donkere opening met een
    // houten leuning.
    ["rect", 22, 224, 150, 88, 39],
    ["rect", 48, 228, 154, 80, 35],
    ["line", 24, [228, 158, 307, 172]],
    ["line", 24, [228, 170, 307, 184]],

    // Balk over de breedte.
    ["rect", 49, 0, 52, 320, 8],

    // De latere fragment-dozen (levels 5–7), links opgestapeld tegen de wand:
    // karton met schaduw, kleine labels, dieper in het archief.
    ["rect", 23, 30, 118, 66, 66],
    ["rect", 26, 32, 120, 62, 62],
    ["rect", 25, 32, 120, 62, 6],
    ["line", 22, [32, 150, 93, 150]],
    ["line", 22, [63, 120, 63, 182]],
    ["rect", 36, 40, 128, 28, 10],
    ["px", 41, [[43, 132], [47, 132], [51, 132], [57, 132], [61, 132],
      [45, 135], [51, 135], [59, 135]]],
    // Een tweede, kleinere doos ervoor.
    ["rect", 23, 104, 140, 46, 44],
    ["rect", 26, 106, 142, 42, 40],
    ["rect", 25, 106, 142, 42, 5],
    ["line", 22, [106, 162, 147, 162]]
  ],

  // Beloopbare vloer: één brede box. De trap naar beneden (zuid) ligt aan de
  // onderrand; de speler steekt over door naar zuiden te lopen.
  walkboxes: [
    [0, 150, 320, 39]
  ],

  entries: {
    start: [160, 175],
    vanZuid: [260, 178]
  },

  hotspots: [
    { item: "doos", sprite: "doos", x: 63, y: 184 }
  ],

  props: [],
  overlays: []
};
