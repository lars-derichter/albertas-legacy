// scene-zolder-oost.js — Alberta's werkhoek, de oosthoek van de zolder. Mood uit
// art-stijlgids.md: het bureau, de pc met amber-gloeiend scherm (gloed-ramp
// 54–58, halo 34), een lege stoel die net verlaten lijkt, en een halfvolle
// koffiemok naast het toetsenbord — intiem, "net verlaten" (achtergrond.md:
// de afwezigheid voelbaar via objecten). Eén uitgang: west, naar zolder-midden.
//
// Aangepast uit remake-90s (scène-schema en draw-op-formaat); nieuwe scène met
// het 64-kleuren-palet. De pc en de stoel staan als tekening in de picture (net
// als het notitieboek op zolder-west); de sprites in js/sprites/ zijn de
// canonieke prop-definities uit de inventaris.
//
// Placeholder-kwaliteit maar lint-schoon: het leest als een werkhoek met een
// nagloeiende monitor, een lege stoel en een koffiemok.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-oost"] = {
  id: "zolder-oost",

  picture: [
    // Achterwand: zolderschemer, donkerder naar de nok.
    ["fill", 29],
    ["rect", 28, 0, 8, 320, 40],

    // Houten vloer (hout mid) met planklijnen; lichte perspectiefwerking.
    ["rect", 24, 0, 118, 320, 71],
    ["line", 23, [0, 118, 319, 118]],
    ["line", 22, [0, 140, 319, 140]],
    ["line", 22, [0, 162, 319, 162]],
    ["line", 22, [0, 184, 319, 184]],
    ["line", 22, [120, 118, 90, 189]],
    ["line", 22, [210, 118, 240, 189]],

    // Gording en staanders (hout schaduw).
    ["rect", 23, 0, 48, 320, 8],
    ["rect", 23, 30, 8, 10, 110],
    ["rect", 23, 280, 8, 10, 110],

    // Zacht avondlicht van links (het dakraam ligt in de westhoek): een warme
    // wig over de vloer, van west naar de werkhoek toe.
    ["poly", 32, [0, 70, 40, 70, 96, 178, 0, 178]],
    ["dither", 33, 32, [0, 78, 30, 78, 78, 168, 0, 168]],

    // Het bureau, centraal-rechts: houten body met een lichter blad.
    ["rect", 23, 150, 132, 130, 40],
    ["rect", 25, 150, 120, 130, 14],
    ["rect", 26, 150, 120, 130, 5],
    ["line", 22, [150, 133, 279, 133]],
    ["line", 22, [176, 134, 176, 171]],
    ["line", 22, [254, 134, 254, 171]],

    // De pc-toren op het bureau, links: beige kast met schaduw en luchtsleuven.
    ["rect", 50, 156, 92, 26, 28],
    ["rect", 51, 157, 92, 24, 28],
    ["rect", 52, 157, 92, 22, 3],
    ["px", 49, [[161, 104], [161, 108], [161, 112], [176, 100], [176, 104]]],

    // De bolle monitor, rechts: kast (beige), amber-gloeiend scherm met halo.
    ["rect", 34, 196, 78, 66, 46],
    ["rect", 50, 200, 82, 58, 40],
    ["rect", 51, 201, 82, 56, 40],
    ["rect", 55, 206, 86, 46, 30],
    ["rect", 56, 208, 88, 42, 26],
    ["dither", 57, 56, [210, 90, 248, 90, 248, 110, 210, 110]],
    ["px", 58, [[216, 96], [224, 96], [232, 96], [240, 96], [216, 100],
      [228, 100], [240, 100], [216, 104], [232, 104]]],
    ["rect", 50, 214, 124, 30, 6],

    // De lege stoel, links voor het bureau: net verlaten, licht weggedraaid.
    ["rect", 23, 96, 150, 40, 8],
    ["rect", 24, 100, 128, 30, 26],
    ["rect", 50, 102, 130, 26, 8],
    ["rect", 24, 100, 96, 8, 34],
    ["rect", 25, 100, 96, 8, 5],

    // De halfvolle koffiemok op het bureau, naast het toetsenbord.
    ["rect", 51, 262, 108, 12, 14],
    ["rect", 41, 262, 108, 12, 3],
    ["rect", 55, 264, 111, 8, 3],
    ["px", 52, [[274, 112], [275, 113], [276, 114], [275, 116]]]
  ],

  // Beloopbare vloer: één brede box die de westrand raakt (de enige uitgang).
  walkboxes: [
    [0, 150, 320, 39]
  ],

  entries: {
    start: [110, 175],
    vanWest: [20, 175]
  },

  // De pc is het interactiepunt ("ga zitten" → pc:open); de stoel en de mok zijn
  // sfeer-hotspots. De tekening staat in de picture; de sprites zijn canoniek.
  hotspots: [
    { item: "pc", sprite: "pc", x: 220, y: 124 },
    { item: "stoel", sprite: "stoel", x: 115, y: 158 }
  ],

  props: [],
  overlays: []
};
