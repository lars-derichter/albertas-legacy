// scene-opening-huis.js — het huis van buiten
//
// Deel van de openingsreeks: het huis, de trap, de monitor. De achtergrond van
// het spel werd vroeger op een bladzijde van Alberta's notitieboek verteld, vóór
// de speler dat boek gevonden had (zie workflow/18-verhaal-en-stem.md). WP C
// zette de stem en de volgorde recht; deze scènes geven er beeld bij. De
// verteller loopt eroverheen in een venster.
//
// Het huis van buiten, bij avond. Eén raam brandt, boven in het dak.
// Het huis staat in silhouet: de speler komt aan, hij is er nog niet binnen.
//
// Geen beloopbare kamer, maar met de verplichte walkbox en entry uit het
// scène-schema (zoals scene-spread-template.js dat ook doet), zodat de lint
// hem als gewone scène kan keuren.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["opening-huis"] = {
  id: "opening-huis",

  picture: [
    // Avondlucht. Bewust de avond-ramp (28–34) en niet de nacht-ramp: die
    // laatste heeft maar drie stappen, en over negentig pixels wordt dat een
    // grof schaakbord in plaats van een verloop. De avond-ramp telt er zeven,
    // dus de overgangen vallen fijn genoeg om als lucht te lezen — en het is
    // bovendien de ramp die de stijlgids voor dit licht aanwijst.
    ["gradient", 28, 32, 0, 8, 320, 94, "v"],
    ["ditherRamp", 32, 33, 0.30, [0, 96, 319, 96, 319, 112, 0, 112]],

    // Een verre bomenrij in silhouet, net onder de horizon.
    ["poly", 42, [0, 110, 26, 100, 52, 110, 78, 96, 104, 110, 132, 102,
      158, 110, 186, 98, 212, 110, 240, 102, 268, 110, 296, 104, 319, 110,
      319, 122, 0, 122]],

    // De grond loopt naar de kijker toe en wordt donkerder; korrel erover.
    // Laag gehouden (0,06): boven ongeveer 0,2 wordt korrel ruis, en gras op
    // afstand hoort een toon te zijn, geen textuur.
    ["gradient", 43, 42, 0, 122, 320, 67, "v"],
    ["noise", 42, 0.06, 3, [0, 122, 319, 122, 319, 189, 0, 189]],

    // Het huis. Eerst de hele massa, dan de linkerhelft een stap donkerder:
    // één lichtbron, en die staat rechtsboven in het dak.
    // Het dak apart van de romp, anders leest het niet als een dak.
    ["poly", 50, [92, 100, 160, 56, 228, 100]],
    ["shadow", 1, [92, 100, 160, 56, 160, 100]],
    ["rect", 49, 104, 100, 112, 50],
    ["shadow", 1, [104, 100, 160, 100, 160, 150, 104, 150]],
    ["line", 48, [92, 100, 228, 100]],
    ["line", 48, [104, 150, 216, 150]],

    // De gloed die het raam op het dak werpt. Binnen de eigen ramp blijven
    // (50 → 52) in plaats van amber in grijs te mengen: een fel accent in een
    // donker vlak leest ook bij een lage dichtheid nog als dat felle accent,
    // want het oog middelt naar helderheid. Vandaar hier een lichtere steen,
    // en de echte amber alleen ín het raam.
    ["ditherRamp", 50, 52, 0.30, [138, 70, 184, 70, 196, 100, 126, 100]],

    // Het dakraam zelf: het enige licht in huis.
    ["rect", 55, 148, 74, 26, 24],
    ["rect", 57, 150, 76, 22, 20],
    ["ditherRamp", 57, 58, 0.45, [151, 77, 171, 77, 171, 95, 151, 95]],
    ["line", 22, [161, 76, 161, 96]],
    ["line", 22, [150, 86, 172, 86]],

    // Donkere ramen beneden, en een deur die dicht is.
    ["rect", 48, 112, 112, 16, 20],
    ["rect", 48, 192, 112, 16, 20],
    ["rect", 22, 150, 118, 20, 32],
    ["line", 48, [150, 118, 150, 150]],

    // Contactschaduw van het huis op de grond.
    ["shadow", 2, [86, 150, 234, 150, 250, 170, 70, 170]]
  ]
};

AL.scenes["opening-huis"].walkboxes = [[0, 180, 320, 9]];
AL.scenes["opening-huis"].entries = { start: [160, 185] };
AL.scenes["opening-huis"].hotspots = [];
AL.scenes["opening-huis"].overlays = [];

// Node-export voor tooling/tests.
if (typeof module !== "undefined") {
  module.exports = AL.scenes["opening-huis"];
}
