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
    // De korrel blijft één stap van de wand af. Met 48 (de donkerste steen) over
    // een verloop dat naar 50 loopt, stond de spikkel twee stappen lager dan de
    // ondergrond, en met 51 erbij nog een derde stap eroverheen: samen las dat
    // als sneeuw op een tv, niet als pleisterwerk.
    ["gradient", 48, 50, 0, 8, 320, 120, "v"],
    ["noise", 49, 0.10, 41, [0, 8, 319, 8, 319, 128, 0, 128]],
    // Een paar barsten: de wand is oud en niemand heeft hem bijgehouden.
    ["line", 48, [58, 20, 64, 48]],
    ["line", 48, [64, 48, 60, 72]],
    ["line", 48, [252, 34, 246, 62]],

    // ---- Vloer: planken, maar grijzer dan beneden --------------------------
    ["gradient", 49, 50, 0, 128, 320, 61, "v"],
    ["noise", 48, 0.07, 43, [0, 128, 319, 128, 319, 189, 0, 189]],
    ["line", 48, [0, 128, 319, 128]],
    ["line", 48, [128, 128, 52, 189]],
    ["line", 48, [208, 128, 284, 189]],
    ["line", 49, [0, 154, 319, 154]],
    ["line", 49, [0, 176, 319, 176]],

    // ---- De trap naar beneden ----------------------------------------------
    // Een gat in de vloer met een leuning ernaast: hij loopt naar beneden weg,
    // dus de treden worden donkerder naarmate ze dieper liggen.
    //
    // Het gat liep tot y188 en de loopstrook begint op y152. Wie via het zuiden
    // binnenkwam, stond dus midden in het gat — en dat is precies hoe het eruit
    // zag. Het gat eindigt nu op de voorrand van de strook: je loopt eromheen,
    // niet erin. De treden zijn navenant korter, want ze verdwijnen ook eerder
    // uit het zicht.
    // Het gat zelf, donker, met de bovenkant het diepst: de trap loopt van de
    // kijker wég naar beneden, dus wat verder weg is ligt lager.
    ["rect", 48, 128, 122, 68, 30],
    ["line", 51, [128, 122, 195, 122]],
    // Drie treden, om en om licht en donker zodat ze als tréden lezen en niet
    // als een verloop. De onderste is het breedst: die is het dichtst bij.
    ["poly", 49, [136, 126, 188, 126, 188, 133, 136, 133]],
    ["line", 51, [136, 126, 187, 126]],
    ["poly", 50, [133, 133, 191, 133, 191, 142, 133, 142]],
    ["line", 52, [133, 133, 190, 133]],
    ["poly", 49, [130, 142, 194, 142, 194, 152, 130, 152]],
    ["line", 51, [130, 142, 193, 142]],
    // De leuning staat op de vóórrand van het gat en dus tussen de speler en de
    // diepte in. Ze stond eerst boven het gat tegen de wand, en las daar als een
    // plank.
    ["rect", 24, 122, 128, 5, 25],
    ["rect", 24, 196, 128, 5, 25],
    ["rect", 25, 122, 128, 79, 4],
    ["line", 27, [122, 128, 200, 128]],
    ["shadow", 1, [122, 132, 200, 132, 200, 136, 122, 136]],

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
    // expliciet nog een stap donkerder gezet. Met light, zodat de veeg de vloer
    // oplicht in plaats van er een grijze vlek op te leggen — de overloop is
    // steen-ramp, de vloer hout-ramp, en die twee mengden niet.
    ["light", 1, 0.25, [140, 128, 190, 128, 214, 189, 116, 189]],
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
