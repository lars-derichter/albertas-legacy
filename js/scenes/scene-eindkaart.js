// scene-eindkaart.js — de drager voor Alberta's oordeel én de epiloog
// (spelontwerp-legacy.md: één scène, twee teksten). De engine legt de tier-tekst
// of de epiloog-alinea's erop.
//
// Mood uit art-stijlgids.md: "de lichtstraal wint terrein, warmer dan de
// titelkaart". Dat is hier het hele idee. De titelkaart toont dezelfde zolder in
// silhouet met één smalle straal; hier is de straal breed geworden en staan de
// vormen er niet meer als zwarte gaten in maar als hout waar licht op valt.
//
// Zelfde compositie als de titelkaart, met opzet: wie het spel uitspeelt, ziet
// dezelfde kamer terug — alleen is het er licht geworden.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["eindkaart"] = {
  id: "eindkaart",

  picture: [
    // ---- De wand, warmer dan op de titelkaart ------------------------------
    ["gradient", 29, 31, 0, 8, 320, 130, "v"],
    ["noise", 30, 0.08, 61, [0, 8, 319, 8, 319, 138, 0, 138]],

    // ---- De vloer, nu echt hout in plaats van silhouet ---------------------
    ["gradient", 24, 26, 0, 138, 320, 51, "v"],
    ["noise", 23, 0.09, 62, [0, 138, 319, 138, 319, 189, 0, 189]],
    ["line", 23, [0, 138, 319, 138]],
    ["line", 23, [0, 162, 319, 162]],
    ["line", 23, [148, 138, 96, 189]],
    ["line", 23, [196, 138, 250, 189]],

    // ---- Het dakraam: groter, en het licht komt er nu recht doorheen -------
    ["rect", 23, 196, 12, 84, 60],
    ["gradient", 33, 34, 200, 16, 76, 52, "v"],
    ["ditherRamp", 34, 58, 0.45, [200, 16, 275, 16, 275, 42, 200, 42]],
    ["rect", 24, 234, 16, 4, 52],
    ["rect", 24, 200, 40, 76, 4],
    ["line", 27, [196, 70, 279, 70]],

    // ---- Dezelfde vormen als op de titelkaart, nu belicht ------------------
    // De vormen staan vóór de straal, want de straal valt erop (zie de light-
    // ops onderaan). Op de titelkaart zijn dit zwarte silhouetten; hier is het
    // hout waar licht op valt.
    ["rect", 24, 0, 60, 320, 12],
    ["line", 26, [0, 60, 319, 60]],
    ["shadow", 1, [0, 70, 319, 70, 319, 74, 0, 74]],
    ["noise", 23, 0.10, 63, [0, 60, 319, 60, 319, 72, 0, 72]],

    ["rect", 25, 14, 96, 58, 56],
    ["shadow", 1, [14, 96, 32, 96, 32, 152, 14, 152]],
    ["line", 27, [14, 96, 71, 96]],
    ["line", 22, [14, 124, 71, 124]],
    ["rect", 25, 24, 74, 40, 24],
    ["shadow", 1, [24, 74, 36, 74, 36, 98, 24, 98]],
    ["line", 27, [24, 74, 63, 74]],
    ["shadow", 2, [8, 150, 80, 150, 90, 164, 0, 164]],

    // ---- De kist, open, in het volle licht ---------------------------------
    // Op de titelkaart is dit een zwarte vorm. Hier ligt het deksel open en is
    // te zien dat er iets uit is gehaald.
    ["rect", 23, 190, 152, 84, 28],
    ["gradient", 25, 27, 192, 152, 80, 26, "v"],
    ["line", 27, [192, 152, 271, 152]],
    ["line", 22, [190, 180, 275, 180]],
    // Het openstaande deksel, achterover geklapt.
    ["poly", 24, [190, 152, 274, 152, 268, 132, 196, 132]],
    ["shadow", 1, [190, 144, 274, 144, 274, 152, 190, 152]],
    ["line", 27, [196, 132, 268, 132]],
    // Beslag. Messing, niet staal: in de gloed-ramp, want het staat vol in het
    // licht. Kleur 52 (steen hooglicht) las hier als een blauwe sticker.
    ["rect", 55, 225, 157, 11, 10],
    ["rect", 57, 227, 159, 7, 6],
    ["line", 54, [225, 166, 235, 166]],
    ["shadow", 2, [182, 178, 282, 178, 292, 188, 172, 188]],

    // ---- De straal die terrein wint ---------------------------------------
    // Breder dan op de titelkaart en met een hetere kern: hij haalt nu de hele
    // vloer. Nog steeds in plakken, want ook een brede bundel dooft uit — en
    // nog steeds met light, niet met ditherRamp: hij moet de kist en de dozen
    // oplichten, niet overschilderen. Meer stappen dan op de titelkaart, want
    // dit is dezelfde kamer op het uur dat ze wél licht is.
    ["light", 3, 0.90, [198, 72, 278, 72, 292, 104, 184, 104]],
    ["light", 3, 0.60, [184, 104, 292, 104, 306, 138, 168, 138]],
    ["light", 2, 0.60, [168, 138, 306, 138, 319, 168, 150, 168]],
    ["light", 2, 0.35, [150, 168, 319, 168, 319, 189, 132, 189]],
    // Waar hij de vloer haalt, wordt het hout warm.
    ["light", 1, 0.40, [140, 162, 319, 162, 319, 189, 120, 189]]
  ],

  walkboxes: [
    [0, 180, 320, 9]
  ],
  entries: {
    start: [160, 185]
  },

  hotspots: [],
  sfeer: [
    { soort: "stof", x: 160, y: 74, b: 140, h: 112, aantal: 22, kleur: 58,
      seed: 7, snelheid: 0.015 }
  ],
  overlays: []
};
