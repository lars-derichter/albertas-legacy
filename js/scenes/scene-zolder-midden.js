// scene-zolder-midden.js — de doorgang, de spil van de zolder-hub.
//
// De kamerbeschrijving noemt: balken die samenkomen en een dak dat laag wordt,
// licht dat hier al minder haalt, een doos die zwaarder oogt dan de andere met
// vergeelde tape en het label BRONCODE, en achterin een trap naar boven. Dat
// moet allemaal zichtbaar zijn.
//
// Verbindt west, oost en — via de trap — de overloop. Dit is de enige kamer met
// drie uitgangen, dus de compositie moet ze alle drie leesbaar maken: links en
// rechts loopt de vloer door, achterin gaat het omhoog.
//
// De broncode-doos en de gemerkte fragment-dozen zijn geblitte sprites, geen
// verf: het zijn de voorwerpen waar de speler mee omgaat.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-midden"] = {
  id: "zolder-midden",

  picture: [
    // ---- Achterwand en een dak dat laag komt -------------------------------
    ["gradient", 28, 30, 0, 8, 320, 116, "v"],
    ["noise", 28, 0.07, 15, [0, 8, 319, 8, 319, 124, 0, 124]],
    // De twee dakschuinten die naar het midden toe samenkomen: het dak zakt.
    ["poly", 23, [0, 8, 96, 8, 40, 60, 0, 60]],
    ["poly", 23, [224, 8, 319, 8, 319, 60, 280, 60]],
    ["shadow", 1, [0, 40, 60, 40, 30, 60, 0, 60]],
    ["shadow", 1, [262, 40, 319, 40, 319, 60, 290, 60]],
    ["noise", 22, 0.10, 17, [0, 8, 96, 8, 40, 60, 0, 60]],
    ["noise", 22, 0.10, 18, [224, 8, 319, 8, 319, 60, 280, 60]],

    // ---- Vloer -------------------------------------------------------------
    ["gradient", 23, 25, 0, 124, 320, 65, "v"],
    ["noise", 22, 0.10, 19, [0, 124, 319, 124, 319, 189, 0, 189]],
    ["line", 22, [0, 124, 319, 124]],
    ["line", 22, [136, 124, 60, 189]],
    ["line", 22, [200, 124, 276, 189]],
    ["line", 23, [0, 150, 319, 150]],
    ["line", 23, [0, 172, 319, 172]],

    // ---- Gording en staanders ---------------------------------------------
    ["rect", 24, 0, 60, 320, 10],
    ["shadow", 1, [0, 68, 319, 68, 319, 72, 0, 72]],
    ["noise", 23, 0.12, 21, [0, 60, 319, 60, 319, 70, 0, 70]],
    ["rect", 24, 44, 70, 12, 54],
    ["shadow", 1, [44, 70, 48, 70, 48, 124, 44, 124]],
    ["rect", 24, 264, 70, 12, 54],
    ["shadow", 1, [264, 70, 268, 70, 268, 124, 264, 124]],

    // ---- De trap naar de overloop -----------------------------------------
    // Een donker gat in de achterwand met treden die naar boven wegvallen. De
    // bovenste treden zijn nauwelijks te zien: daar is het al donker.
    ["rect", 22, 140, 24, 60, 100],
    ["gradient", 28, 22, 144, 28, 52, 92, "v"],
    ["poly", 24, [144, 108, 196, 108, 196, 118, 144, 118]],
    ["line", 22, [144, 118, 195, 118]],
    ["poly", 25, [147, 96, 193, 96, 193, 106, 147, 106]],
    ["line", 22, [147, 106, 192, 106]],
    ["poly", 24, [150, 86, 190, 86, 190, 94, 150, 94]],
    ["line", 22, [150, 94, 189, 94]],
    ["poly", 25, [153, 78, 187, 78, 187, 84, 153, 84]],
    ["line", 22, [153, 84, 186, 84]],
    ["poly", 24, [156, 72, 184, 72, 184, 76, 156, 76]],
    // Kozijn rond de opening.
    ["line", 26, [140, 24, 140, 124]],
    ["line", 26, [199, 24, 199, 124]],
    ["line", 26, [140, 24, 199, 24]],

    // ---- Het licht dat van west naar oost trekt ----------------------------
    // Hier haalt het al minder: geen straal meer maar een veeg die links
    // binnenvalt en halverwege de kamer opgeeft.
    // In plakken met aflopende dichtheid, net als de straal in de westhoek: één
    // vlak met vaste dichtheid leest als een oranje wig, en dat was precies wat
    // er aan de oude tekening mis was.
    ["ditherRamp", 31, 32, 0.34, [0, 76, 32, 76, 44, 110, 0, 110]],
    ["ditherRamp", 30, 31, 0.26, [0, 110, 44, 110, 58, 144, 0, 144]],
    ["ditherRamp", 29, 30, 0.18, [0, 144, 58, 144, 74, 189, 0, 189]],
    ["ditherRamp", 29, 30, 0.10, [32, 76, 60, 76, 116, 189, 74, 189]],
    ["ditherRamp", 24, 25, 0.20, [0, 168, 96, 168, 74, 189, 0, 189]],

    // ---- Wat er níét als sprite staat --------------------------------------
    // Een lage stapel tegen de rechterwand, puur als vulling: de kamer hoort
    // vol te staan, niet leeg met drie voorwerpen erin.
    ["rect", 25, 286, 128, 34, 30],
    ["shadow", 1, [286, 128, 298, 128, 298, 158, 286, 158]],
    ["line", 27, [286, 128, 319, 128]],
    ["line", 22, [286, 158, 319, 158]],
    ["shadow", 2, [282, 156, 319, 156, 319, 166, 276, 166]]
  ],

  // Beloopbare vloer (west↔oost) plus een corridor naar de trap (noord).
  walkboxes: [
    [0, 150, 320, 39],
    [150, 118, 42, 71]
  ],

  entries: {
    start: [80, 175],
    vanWest: [20, 175],
    vanOost: [300, 175],
    vanNoord: [170, 126]
  },

  // De twee doos-props. De broncode-doos staat centraal en vooraan; de gemerkte
  // fragment-dozen rechts ervan, iets naar achter.
  hotspots: [
    { item: "broncode-doos", sprite: "broncode-doos", x: 116, y: 182 },
    { item: "doos", sprite: "doos", x: 236, y: 170 }
  ],

  props: [],

  sfeer: [
    { soort: "stof", x: 8, y: 84, b: 70, h: 96, aantal: 12, kleur: 32,
      seed: 11, snelheid: 0.014 }
  ],

  // Voorgrond: de gording loopt hier vlak voor de kijker langs, en aan de
  // rechterkant staat een stapel in silhouet waar de speler achter verdwijnt.
  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 22, 0, 8, 320, 12],
        ["shadow", 1, [0, 18, 319, 18, 319, 22, 0, 22]],
        ["noise", 23, 0.10, 23, [0, 8, 319, 8, 319, 20, 0, 20]]
      ]
    },
    {
      baselineY: 188,
      ops: [
        ["rect", 22, 296, 130, 24, 59],
        ["shadow", 1, [296, 130, 304, 130, 304, 189, 296, 189]],
        ["line", 23, [296, 130, 319, 130]],
        ["line", 23, [296, 152, 319, 152]]
      ]
    }
  ]
};
