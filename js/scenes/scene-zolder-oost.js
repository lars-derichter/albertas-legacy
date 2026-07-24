// scene-zolder-oost.js — Alberta's werkhoek: waar het codewerk gebeurt.
//
// De kamerbeschrijving noemt: een stoel die schuin van het bureau is
// weggeschoven alsof ze even is opgestaan, stof dat overal even dik ligt, een
// pc die het nog doet met een beige toren en een bolle monitor die warm oranje
// nagloeit, en een halfvolle mok naast het toetsenbord. Allemaal zichtbaar.
//
// Dit is de warmste kamer van de vier, en dat is de bedoeling: de monitor is de
// enige lichtbron die niet uit het dakraam komt. Het contrast met de kou van de
// rest van de zolder is waar de scène op draait.
//
// De pc en de stoel zijn geblitte sprites. De pc staat op zijn 'aan'-frame —
// dat frame bestond al maar was tot nu toe nooit te zien, omdat props in de
// gecachete achtergrond gebakken zaten.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-oost"] = {
  id: "zolder-oost",

  picture: [
    // ---- Achterwand --------------------------------------------------------
    ["gradient", 28, 29, 0, 8, 320, 118, "v"],
    ["noise", 28, 0.08, 31, [0, 8, 319, 8, 319, 126, 0, 126]],

    // ---- Vloer -------------------------------------------------------------
    ["gradient", 23, 24, 0, 126, 320, 63, "v"],
    ["noise", 22, 0.11, 33, [0, 126, 319, 126, 319, 189, 0, 189]],
    ["line", 22, [0, 126, 319, 126]],
    ["line", 22, [120, 126, 40, 189]],
    ["line", 22, [216, 126, 296, 189]],
    ["line", 23, [0, 152, 319, 152]],
    ["line", 23, [0, 174, 319, 174]],

    // ---- Balken ------------------------------------------------------------
    ["rect", 24, 0, 46, 320, 10],
    ["shadow", 1, [0, 54, 319, 54, 319, 58, 0, 58]],
    ["noise", 23, 0.12, 35, [0, 46, 319, 46, 319, 56, 0, 56]],
    ["rect", 24, 20, 8, 12, 118],
    ["shadow", 1, [20, 8, 24, 8, 24, 126, 20, 126]],

    // ---- De laatste veeg dakraamlicht, links -------------------------------
    // Het dakraam zelf zit in de westhoek; hier komt er nog net iets van binnen.
    ["ditherRamp", 29, 31, 0.24, [0, 60, 30, 60, 74, 189, 0, 189]],
    ["ditherRamp", 29, 30, 0.14, [30, 60, 56, 60, 116, 189, 74, 189]],

    // ---- De gloed van de monitor -------------------------------------------
    // Rond, want licht is rond; en binnen de gloed-ramp, want amber in het
    // donker mengen leest gewoon als amber (art-stijlgids.md, §De draw-ops).
    // Staat vóór het bureau in de opsomming, zodat het bureau erin baadt in
    // plaats van eronder te verdwijnen.
    // Blijf binnen de ramp van de wánd, niet van de lamp: een ellips in
    // gloed-bruin (54) op een paarse wand is geen licht maar een bruin gat. Het
    // licht van de monitor maakt de wand warmer en iets lichter — 30 en dan 31
    // uit de avond-ramp — en de echte amber zit alleen in het scherm zelf.
    // Eén stap per ring, niet twee: de wand staat op 28/29, dus 29 en 30 zijn
    // genoeg om "hier is het warmer" te zeggen. Grotere stappen maken er een
    // gekleurde vlek van in plaats van licht. De ruis erna breekt de ovaalrand.
    ["ellipse", 29, 196, 96, 100, 56],
    ["ellipse", 30, 196, 96, 52, 28],
    ["noise", 28, 0.30, 37, [88, 34, 305, 34, 305, 158, 88, 158]],
    ["noise", 29, 0.16, 38, [88, 34, 305, 34, 305, 158, 88, 158]],

    // ---- Het bureau --------------------------------------------------------
    // Een blad met een dikke rand, twee poten, en een onderplank vol papier.
    ["rect", 23, 104, 118, 148, 8],
    ["gradient", 25, 26, 104, 116, 148, 6, "v"],
    ["line", 27, [104, 116, 251, 116]],
    ["line", 22, [104, 126, 251, 126]],
    ["rect", 24, 112, 126, 10, 42],
    ["rect", 24, 234, 126, 12, 48],
    ["shadow", 1, [112, 126, 116, 126, 116, 168, 112, 168]],
    ["shadow", 1, [234, 126, 238, 126, 238, 174, 234, 174]],
    ["rect", 23, 116, 150, 126, 5],
    ["rect", 35, 130, 140, 26, 8],
    ["rect", 36, 128, 142, 26, 8],
    ["rect", 36, 186, 143, 22, 7],
    ["shadow", 1, [116, 155, 242, 155, 242, 160, 116, 160]],

    // ---- Het toetsenbord en de mok, op het blad ----------------------------
    // Klein en plat: ze horen bij het bureau, niet bij de sprites.
    ["rect", 51, 132, 106, 46, 10],
    ["shadow", 1, [132, 112, 178, 112, 178, 116, 132, 116]],
    ["px", 48, [[136, 109], [141, 109], [146, 109], [151, 109], [156, 109],
      [161, 109], [166, 109], [171, 109],
      [138, 112], [143, 112], [148, 112], [153, 112], [158, 112], [163, 112],
      [168, 112]]],
    // De mok: een cilinder met een oor, en koffie erin.
    ["rect", 52, 110, 100, 14, 16],
    ["shadow", 1, [110, 100, 114, 100, 114, 116, 110, 116]],
    ["ellipse", 53, 117, 100, 7, 3],
    ["ellipse", 23, 117, 100, 5, 2],
    ["line", 52, [124, 104, 128, 106]],
    ["line", 52, [128, 106, 124, 110]],
    ["shadow", 1, [108, 114, 126, 114, 128, 118, 106, 118]],

    // ---- Naar het westen ---------------------------------------------------
    ["gradient", 28, 29, 0, 56, 20, 70, "h"],
    ["line", 23, [20, 56, 20, 126]]
  ],

  walkboxes: [
    [0, 150, 320, 39]
  ],

  entries: {
    start: [240, 175],
    vanWest: [20, 175]
  },

  // De pc op het bureau (aan), en de lege stoel ervoor. De stoel staat vóór het
  // bureau, dus de speler die naar de pc loopt, gaat er netjes omheen.
  hotspots: [
    { item: "pc", sprite: "pc", anim: "aan", x: 196, y: 118 },
    { item: "stoel", sprite: "stoel", x: 150, y: 172 }
  ],

  props: [],

  // Geen stof hier: het dakraam is ver. Wat er gloeit, gloeit uit het scherm.
  sfeer: [],

  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 22, 0, 8, 320, 12],
        ["shadow", 1, [0, 18, 319, 18, 319, 22, 0, 22]],
        ["noise", 23, 0.10, 39, [0, 8, 319, 8, 319, 20, 0, 20]]
      ]
    }
  ]
};
