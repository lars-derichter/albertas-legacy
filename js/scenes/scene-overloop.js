// scene-overloop.js — de overloop boven aan de trap, dieper in Alberta's
// archief. Hier liggen de latere fragmenten (levels 5–7).
//
// De kamerbeschrijving noemt: kouder hier, het dakraam is ver en het licht haalt
// de hoeken niet, dozen van later tegen de wand opgestapeld en hoger dan jij, en
// een trap die terugloopt naar beneden.
//
// Mood uit art-stijlgids.md: de steen-ramp (48–53) in plaats van hout, want dit
// is het koudste punt van het spel. Er is hier geen enkele warme kleur behalve
// het karton — en dat is precies waarom de dozen eruit springen.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["overloop"] = {
  id: "overloop",

  picture: [
    // ---- Wand: pleisterwerk, koel en kaal ----------------------------------
    ["gradient", 48, 50, 0, 8, 320, 120, "v"],
    ["noise", 48, 0.12, 41, [0, 8, 319, 8, 319, 128, 0, 128]],
    ["noise", 51, 0.05, 42, [0, 8, 319, 8, 319, 128, 0, 128]],
    // Een paar barsten: de wand is oud en niemand heeft hem bijgehouden.
    ["line", 48, [58, 20, 64, 48]],
    ["line", 48, [64, 48, 60, 72]],
    ["line", 48, [252, 34, 246, 62]],

    // ---- Vloer: planken, maar grijzer dan beneden --------------------------
    ["gradient", 49, 50, 0, 128, 320, 61, "v"],
    ["noise", 48, 0.12, 43, [0, 128, 319, 128, 319, 189, 0, 189]],
    ["line", 48, [0, 128, 319, 128]],
    ["line", 48, [128, 128, 52, 189]],
    ["line", 48, [208, 128, 284, 189]],
    ["line", 49, [0, 154, 319, 154]],
    ["line", 49, [0, 176, 319, 176]],

    // ---- De trap naar beneden ----------------------------------------------
    // Een gat in de vloer met een leuning ernaast: hij loopt naar beneden weg,
    // dus de treden worden donkerder naarmate ze dieper liggen.
    ["rect", 48, 128, 140, 68, 49],
    ["gradient", 49, 48, 132, 144, 60, 45, "v"],
    ["poly", 50, [132, 144, 192, 144, 192, 152, 132, 152]],
    ["line", 48, [132, 152, 191, 152]],
    ["poly", 49, [135, 152, 189, 152, 189, 162, 135, 162]],
    ["line", 48, [135, 162, 188, 162]],
    ["poly", 50, [138, 162, 186, 162, 186, 174, 138, 174]],
    ["line", 48, [138, 174, 185, 174]],
    ["line", 51, [128, 140, 196, 140]],
    // De leuning: twee stijlen en een regel.
    ["rect", 24, 122, 108, 5, 34],
    ["rect", 24, 196, 108, 5, 34],
    ["rect", 25, 122, 108, 79, 4],
    ["shadow", 1, [122, 112, 200, 112, 200, 116, 122, 116]],

    // ---- De dozen: hoger dan jij -------------------------------------------
    // Twee torens tegen de wand, de linker tot voorbij de bovenrand van het
    // speelveld, zodat er geen bovenkant te zien is. Dat is wat "hoger dan jij"
    // moet doen.
    ["rect", 25, 10, 8, 62, 148],
    ["shadow", 1, [10, 8, 30, 8, 30, 156, 10, 156]],
    ["line", 22, [10, 56, 71, 56]],
    ["line", 22, [10, 104, 71, 104]],
    ["line", 22, [10, 156, 71, 156]],
    ["line", 27, [10, 8, 71, 8]],
    ["line", 27, [10, 58, 71, 58]],
    ["line", 27, [10, 106, 71, 106]],
    // Labels op twee van de dozen.
    ["rect", 36, 22, 68, 34, 11],
    ["line", 39, [22, 68, 55, 68]],
    ["px", 41, [[25, 72], [29, 72], [33, 72], [39, 72], [45, 72], [49, 72],
      [27, 76], [33, 76], [41, 76], [47, 76]]],
    ["rect", 36, 22, 118, 34, 11],
    ["line", 39, [22, 118, 55, 118]],
    ["px", 41, [[25, 122], [31, 122], [35, 122], [43, 122], [47, 122],
      [27, 126], [35, 126], [43, 126]]],

    ["rect", 26, 76, 62, 46, 92],
    ["shadow", 1, [76, 62, 90, 62, 90, 154, 76, 154]],
    ["line", 22, [76, 108, 121, 108]],
    ["line", 22, [76, 154, 121, 154]],
    ["line", 27, [76, 62, 121, 62]],

    ["rect", 25, 236, 96, 52, 58],
    ["shadow", 1, [236, 96, 250, 96, 250, 154, 236, 154]],
    ["line", 22, [236, 124, 287, 124]],
    ["line", 22, [236, 154, 287, 154]],
    ["line", 27, [236, 96, 287, 96]],

    // Contactschaduwen: de torens staan echt op deze vloer.
    ["shadow", 2, [6, 152, 128, 152, 138, 168, 0, 168]],
    ["shadow", 2, [230, 150, 294, 150, 302, 164, 222, 164]],

    // ---- Het licht haalt de hoeken niet ------------------------------------
    // Eén flauwe veeg van de trap-kant, en verder niets. De hoeken worden
    // expliciet nog een stap donkerder gezet.
    ["ditherRamp", 50, 51, 0.12, [140, 128, 190, 128, 214, 189, 116, 189]],
    ["shadow", 1, [0, 8, 30, 8, 46, 189, 0, 189]],
    ["shadow", 1, [292, 8, 319, 8, 319, 189, 278, 189]]
  ],

  walkboxes: [
    [0, 152, 320, 37]
  ],

  entries: {
    start: [230, 174],
    vanZuid: [162, 174]
  },

  // De gemerkte dozen waar de latere fragmenten in zitten.
  hotspots: [
    { item: "doos", sprite: "doos", x: 262, y: 168 }
  ],

  props: [],
  sfeer: [],

  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 48, 0, 8, 320, 10],
        ["shadow", 1, [0, 16, 319, 16, 319, 20, 0, 20]]
      ]
    }
  ]
};
