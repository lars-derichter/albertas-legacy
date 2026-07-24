// scene-opening-pc.js — de monitor die nagloeit
//
// Deel van de openingsreeks: het huis, de trap, de monitor. De achtergrond van
// het spel werd vroeger op een bladzijde van Alberta's notitieboek verteld, vóór
// de speler dat boek gevonden had (zie workflow/18-verhaal-en-stem.md). WP C
// zette de stem en de volgorde recht; deze scènes geven er beeld bij. De
// verteller loopt eroverheen in een venster.
//
// De monitor die nog nagloeit. Het laatste beeld voor de speler zelf de
// zolder op stapt: de pc staat aan, en staat dat al een hele tijd.
//
// Geen beloopbare kamer, maar met de verplichte walkbox en entry uit het
// scène-schema (zoals scene-spread-template.js dat ook doet), zodat de lint
// hem als gewone scène kan keuren.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["opening-pc"] = {
  id: "opening-pc",

  picture: [
    // De zolder bij nacht: alles zwart, op één ding na. De verleiding is om de
    // kamer eromheen in te vullen; dat maakt het beeld juist zwakker. Wat hier
    // telt is dat er in een donker huis nog een scherm aan staat.
    ["fill", 0],

    // De halo als concentrische ellipsen. Eerst met trapezia geprobeerd: die
    // lezen als vórm, niet als licht — je ziet de hoeken. Rond werkt wel. En de
    // stappen blijven aan het donkere eind van de gloed-ramp (54, 55): bij een
    // grote helderheidssprong leest zelfs een lage dichtheid nog als het felle
    // accent, want het oog middelt naar helderheid.
    ["ellipse", 54, 160, 98, 152, 90],
    ["ellipse", 55, 160, 98, 104, 62],
    // Twee ellipsen geven twee zichtbare randen. Een beetje korrel over allebei
    // breekt die randen zonder dat er een derde ring bij hoeft.
    ["noise", 54, 0.20, 41, [4, 16, 315, 16, 315, 150, 4, 150]],
    ["noise", 0, 0.14, 42, [4, 16, 315, 16, 315, 150, 4, 150]],

    // Het bureaublad, in silhouet, met wat korrel op het hout.
    ["rect", 23, 0, 150, 320, 39],
    ["line", 22, [0, 150, 319, 150]],
    ["noise", 22, 0.07, 31, [0, 150, 319, 150, 319, 189, 0, 189]],
    ["shadow", 1, [0, 172, 319, 172, 319, 189, 0, 189]],

    // De kast van de monitor. Beige in daglicht, maar hier ziet niets er beige
    // uit: de enige lichtbron staat erachter.
    ["rect", 49, 108, 60, 104, 90],
    ["rect", 50, 110, 62, 100, 84],
    ["shadow", 1, [108, 60, 122, 60, 122, 150, 108, 150]],
    ["shadow", 1, [108, 140, 212, 140, 212, 150, 108, 150]],

    // Het schermvlak, ingezonken en donker: een scherm in rust gloeit, het
    // schijnt niet.
    ["rect", 22, 120, 70, 80, 58],
    ["rect", 55, 122, 72, 76, 54],
    ["ditherRamp", 55, 56, 0.28, [126, 76, 194, 76, 194, 124, 126, 124]],

    // Tekstregels als streepjes — geen leesbare achtergrondtekst
    // (art-stijlgids.md).
    ["px", 57, [[128, 82], [132, 82], [136, 82], [144, 82], [148, 82],
      [156, 82], [160, 82], [164, 82],
      [128, 90], [132, 90], [140, 90], [144, 90], [152, 90],
      [128, 98], [136, 98], [140, 98], [148, 98], [152, 98], [160, 98],
      [164, 98], [172, 98],
      [128, 106], [132, 106], [136, 106],
      [128, 114], [136, 114], [140, 114], [148, 114]]],

    // De cursor onder de laatste regel: het enige heldere punt in het beeld.
    ["rect", 58, 128, 120, 5, 6],

    // Contactschaduw van de kast op het blad.
    ["shadow", 2, [102, 150, 218, 150, 226, 162, 94, 162]]
  ]
};

AL.scenes["opening-pc"].walkboxes = [[0, 180, 320, 9]];
AL.scenes["opening-pc"].entries = { start: [160, 185] };
AL.scenes["opening-pc"].hotspots = [];
AL.scenes["opening-pc"].props = [];
AL.scenes["opening-pc"].overlays = [];

// Node-export voor tooling/tests.
if (typeof module !== "undefined") {
  module.exports = AL.scenes["opening-pc"];
}
