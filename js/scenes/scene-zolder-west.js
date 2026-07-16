// scene-zolder-west.js — Alberta's zolder, de westhoek: de starthoek van het
// meta-spel. Mood uit art-stijlgids.md: kartonnen dozen (26/23), een schuine
// streep avondlicht door het dakraam (avond-ramp 28–34, kern 58), stof in het
// licht (losse 34-pixels), en het notitieboek op een kist, precies in de straal
// (papier-ramp 35–38, inkt 41). Eén uitgang: oost, naar zolder-midden.
//
// Aangepast uit remake-90s (scène-schema en draw-op-formaat uit
// docs/scene-schema.md); nieuwe scène met het 64-kleuren-palet.
//
// Placeholder-kwaliteit maar lint-schoon: het leest als een zolder met een
// dakraam-lichtstraal en een notitieboek in het licht.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-west"] = {
  id: "zolder-west",

  picture: [
    // Achterwand: zolderschemer (avond schaduw), donkerder naar de nok.
    ["fill", 29],
    ["rect", 28, 0, 8, 320, 42],

    // Houten vloer (hout mid) met planklijnen en lichte perspectiefwerking.
    ["rect", 24, 0, 120, 320, 70],
    ["line", 23, [0, 120, 319, 120]],
    ["line", 22, [0, 141, 319, 141]],
    ["line", 22, [0, 163, 319, 163]],
    ["line", 22, [0, 183, 319, 183]],
    ["line", 22, [150, 120, 120, 189]],
    ["line", 22, [210, 120, 250, 189]],

    // Balken: één horizontale gording en twee staanders (hout schaduw).
    ["rect", 23, 0, 50, 320, 8],
    ["rect", 23, 40, 8, 10, 112],
    ["rect", 23, 250, 8, 10, 112],

    // Dakraam rechtsboven: houten kader, avondlucht erdoor (nacht-ramp), gloed.
    ["rect", 24, 196, 18, 78, 62],
    ["rect", 60, 202, 24, 66, 50],
    ["dither", 61, 62, [202, 24, 268, 24, 268, 48, 202, 48]],
    ["line", 23, [235, 24, 235, 74]],
    ["line", 23, [202, 49, 268, 49]],

    // De lichtstraal uit het dakraam, schuin over de vloer (avond goud), met
    // een helderder kern (dither goud/lichtstraal).
    ["poly", 33, [212, 74, 250, 74, 210, 168, 150, 168]],
    ["dither", 34, 33, [216, 78, 246, 78, 208, 152, 168, 152]],

    // Stof in de lichtstraal (losse lichtstraal-pixels).
    ["px", 34, [[200, 100], [218, 122], [190, 136], [176, 150], [224, 96],
      [205, 140], [232, 110], [186, 118]]],

    // Dozen, links opgestapeld: karton (26) met schaduw (23), tape in 22.
    ["rect", 23, 20, 96, 70, 60],
    ["rect", 26, 24, 100, 64, 54],
    ["rect", 25, 24, 100, 64, 6],
    ["line", 22, [24, 127, 88, 127]],
    ["line", 22, [56, 100, 56, 154]],
    // Doos-label: streepjes die handschrift suggereren (inkt op papier).
    ["rect", 36, 34, 112, 40, 12],
    ["px", 41, [[38, 116], [42, 116], [46, 116], [52, 116], [58, 116],
      [64, 116], [40, 120], [46, 120], [54, 120], [60, 120]]],
    // Een tweede, kleinere doos ervoor.
    ["rect", 23, 92, 128, 46, 30],
    ["rect", 26, 95, 131, 40, 24],
    ["line", 22, [95, 141, 135, 141]],

    // De kist, centraal in het licht: houten body (hout warm), lichter deksel.
    ["rect", 22, 150, 150, 90, 32],
    ["rect", 25, 152, 138, 86, 26],
    ["rect", 26, 152, 138, 86, 6],
    ["line", 22, [152, 151, 238, 151]],
    ["px", 27, [[160, 143], [200, 143], [228, 143]]],

    // Het notitieboek op de kist, open, in de straal: papier-ramp + inktregels.
    ["rect", 40, 168, 128, 56, 15],
    ["rect", 37, 170, 126, 52, 14],
    ["rect", 38, 172, 127, 22, 12],
    ["rect", 38, 198, 127, 22, 12],
    ["line", 39, [196, 126, 196, 140]],
    ["px", 41, [[175, 130], [179, 130], [183, 130], [187, 130], [191, 130],
      [175, 133], [181, 133], [187, 133], [175, 136], [183, 136]]],
    ["px", 41, [[201, 130], [205, 130], [209, 130], [213, 130], [201, 133],
      [207, 133], [213, 133], [201, 136], [205, 136], [211, 136]]]
  ],

  // Beloopbare vloer: één brede box die de oostrand raakt (de enige uitgang).
  walkboxes: [
    [0, 150, 320, 39]
  ],

  entries: {
    start: [80, 175],
    vanOost: [300, 175]
  },

  // Het notitieboek als hotspot (interactiepunt); de tekening staat al in de
  // picture, dus de engine hoeft er geen sprite voor te blitten.
  hotspots: [
    { item: "notitieboek", sprite: "notitieboek", x: 196, y: 148 }
  ],

  props: [],
  overlays: []
};
