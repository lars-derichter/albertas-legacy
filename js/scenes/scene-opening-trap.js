// scene-opening-trap.js — de trap naar de zolder
//
// Deel van de openingsreeks: het huis, de trap, de monitor. De achtergrond van
// het spel werd vroeger op een bladzijde van Alberta's notitieboek verteld, vóór
// de speler dat boek gevonden had (zie workflow/18-verhaal-en-stem.md). WP C
// zette de stem en de volgorde recht; deze scènes geven er beeld bij. De
// verteller loopt eroverheen in een venster.
//
// De trap naar de zolder, van onderaan gezien: twee wanden die naar het
// lichtgat toe lopen, treden die naar voren breder worden, stof in de kegel.
//
// Geen beloopbare kamer, maar met de verplichte walkbox en entry uit het
// scène-schema (zoals scene-spread-template.js dat ook doet), zodat de lint
// hem als gewone scène kan keuren.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["opening-trap"] = {
  id: "opening-trap",

  picture: [
    ["fill", 48],

    // De twee wanden, naar boven toe naar elkaar toe lopend.
    ["poly", 50, [0, 8, 118, 8, 98, 189, 0, 189]],
    ["poly", 50, [202, 8, 319, 8, 319, 189, 222, 189]],
    ["shadow", 1, [0, 8, 40, 8, 26, 189, 0, 189]],
    ["shadow", 1, [286, 8, 319, 8, 319, 189, 300, 189]],
    ["noise", 49, 0.10, 11, [0, 8, 118, 8, 98, 189, 0, 189]],
    ["noise", 49, 0.10, 12, [202, 8, 319, 8, 319, 189, 222, 189]],

    // Het gat boven aan de trap, met het zolderlicht erachter.
    ["rect", 55, 118, 8, 84, 34],
    ["ditherRamp", 56, 57, 0.55, [122, 8, 198, 8, 194, 38, 126, 38]],
    ["ditherRamp", 55, 58, 0.30, [126, 8, 194, 8, 190, 26, 130, 26]],

    // De treden. Naar voren toe breder en hoger, zodat de trap wegvalt in de
    // diepte. Telkens een vlak en een donkere neus eronder.
    ["poly", 24, [124, 42, 196, 42, 199, 50, 121, 50]],
    ["line", 22, [121, 50, 199, 50]],
    ["poly", 25, [121, 50, 199, 50, 203, 60, 117, 60]],
    ["line", 22, [117, 60, 203, 60]],
    ["poly", 24, [117, 60, 203, 60, 208, 72, 112, 72]],
    ["line", 22, [112, 72, 208, 72]],
    ["poly", 25, [112, 72, 208, 72, 214, 86, 106, 86]],
    ["line", 22, [106, 86, 214, 86]],
    ["poly", 24, [106, 86, 214, 86, 221, 102, 99, 102]],
    ["line", 22, [99, 102, 221, 102]],
    ["poly", 25, [99, 102, 221, 102, 229, 120, 91, 120]],
    ["line", 22, [91, 120, 229, 120]],
    ["poly", 24, [91, 120, 229, 120, 238, 142, 82, 142]],
    ["line", 22, [82, 142, 238, 142]],
    ["poly", 25, [82, 142, 238, 142, 248, 168, 72, 168]],
    ["line", 22, [72, 168, 248, 168]],
    ["poly", 24, [72, 168, 248, 168, 258, 189, 62, 189]],

    // De lichtkegel die van boven over de treden valt, en stof erin.
    ["ditherRamp", 24, 56, 0.16, [124, 42, 196, 42, 252, 189, 68, 189]],
    ["noise", 57, 0.02, 21, [124, 42, 196, 42, 252, 189, 68, 189]],

    // De trap loopt donker weg aan de randen.
    ["shadow", 1, [0, 150, 70, 150, 62, 189, 0, 189]],
    ["shadow", 1, [250, 150, 319, 150, 319, 189, 258, 189]]
  ]
};

AL.scenes["opening-trap"].walkboxes = [[0, 180, 320, 9]];
AL.scenes["opening-trap"].entries = { start: [160, 185] };
AL.scenes["opening-trap"].hotspots = [];
AL.scenes["opening-trap"].overlays = [];

// Node-export voor tooling/tests.
if (typeof module !== "undefined") {
  module.exports = AL.scenes["opening-trap"];
}
