// scene-eindkaart.js — de eindkaart: de drager voor Alberta's oordeel én de
// epiloog (spelontwerp-legacy.md, §Scène-inventaris: "eindkaart" is de enige
// drager voor beide). Beslissing: één scène, twee teksten — de engine legt de
// tier-tekst (modus "oordeel") of de epiloog-alinea's (modus "epiloog") erop.
//
// Mood uit art-stijlgids.md: warmer dan de titelkaart, de lichtstraal wint
// terrein (avond-goud 33/34, kern 58). De tekst tekent de engine eroverheen; de
// picture is de achtergrond.
//
// Aangepast uit remake-90s (scène-schema en draw-op-formaat); nieuwe scène met
// het 64-kleuren-palet.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["eindkaart"] = {
  id: "eindkaart",

  picture: [
    // Warme avondschemer, minder blauw dan de titelkaart.
    ["fill", 30],
    ["rect", 29, 0, 8, 320, 30],
    // De vloer in warme schaduw.
    ["poly", 28, [0, 150, 319, 150, 319, 189, 0, 189]],

    // De brede lichtstraal die terrein wint: van het dakraam schuin over het
    // hele veld, met een helderder kern (goud → lichtstraal → schermwit).
    ["poly", 33, [120, 8, 220, 8, 268, 189, 72, 189]],
    ["dither", 34, 33, [134, 10, 206, 10, 250, 180, 92, 180]],
    ["poly", 34, [156, 8, 190, 8, 214, 189, 130, 189]],
    ["dither", 58, 34, [166, 12, 182, 12, 200, 176, 148, 176]],

    // Stof in de straal (losse lichtstraal-pixels).
    ["px", 58, [[150, 60], [168, 90], [190, 120], [176, 150], [204, 76],
      [160, 132], [196, 104], [184, 168]]],

    // Een lage silhouetvorm in het licht: de kist met het notitieboek, geaard in
    // hout-diep, als warm ankerbeeld onderaan.
    ["rect", 22, 132, 168, 60, 21],
    ["rect", 23, 134, 162, 56, 8],
    ["px", 33, [[140, 164], [152, 164], [168, 164], [180, 164]]]
  ],

  // Dummy-walkbox + entry: de eindkaart wordt niet belopen, maar het scène-schema
  // (en de lint) vragen er een.
  walkboxes: [
    [0, 180, 320, 9]
  ],
  entries: {
    start: [160, 185]
  },

  hotspots: [],
  props: [],
  overlays: []
};
