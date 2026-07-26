// scene-titelkaart.js — de titelkaart.
//
// Stond tot nu toe als zeven inline draw-ops in js/engine.js, terwijl
// art-stijlgids.md hem als bindende scène-id noemt met een eigen mood: "stille
// zolder in silhouet, één gouden lichtstraal (34/58), het logo eroverheen;
// melancholisch, uitnodigend".
//
// Die mood is hier uitgevoerd: de zolder is er wél, maar alleen als silhouet —
// de balken, de dozen en de kist zijn zwarte vormen tegen het licht. Je ziet
// waar je straks staat zonder er al iets van te weten.
//
// De compositie is opgebouwd rónd de titelplaat, niet erachter. Het dakraam en
// de hete kop van de straal staan bóven de plaat, de landing op de vloer en de
// kist eronder, en de gording loopt er dwars achter door: links het beeld in,
// rechts er weer uit. Zo overlapt het logo de kamer in plaats van hem af te
// dekken — een titelkaart, geen bord met een tekening eromheen.
//
// Het logo en de ondertitel tekent de engine erop (gfx.tekenLogo), want die
// moeten op de donkere plaat vallen die hieronder al klaarligt.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["titelkaart"] = {
  id: "titelkaart",

  picture: [
    // ---- De zolder in het donker ------------------------------------------
    ["gradient", 28, 29, 0, 8, 320, 126, "v"],
    ["noise", 28, 0.08, 51, [0, 8, 319, 8, 319, 134, 0, 134]],
    ["gradient", 22, 23, 0, 134, 320, 55, "v"],
    ["noise", 22, 0.10, 52, [0, 134, 319, 134, 319, 189, 0, 189]],
    ["line", 22, [0, 134, 319, 134]],

    // ---- Het dakraam, klein en hoog ---------------------------------------
    // Hoog genoeg dat het bóven de titelplaat blijft staan.
    ["rect", 22, 214, 8, 74, 42],
    ["gradient", 31, 33, 217, 11, 68, 36, "v"],
    ["rect", 23, 248, 11, 3, 36],
    ["rect", 23, 217, 26, 68, 3],

    // ---- Silhouetten ------------------------------------------------------
    // Alles wat de speler straks van dichtbij ziet, staat hier al — maar zwart.
    // Ze staan vóór de straal getekend, want de straal is nu doorschijnend en
    // moet erop vallen, niet ervoor.
    // Een gording over de volle breedte; de plaat snijdt hem doormidden.
    ["rect", 22, 0, 56, 320, 12],
    ["shadow", 1, [0, 66, 319, 66, 319, 70, 0, 70]],
    // Dozen links, opgestapeld tot in de balken. De bovenste steekt links van
    // de plaat uit, zodat de stapel niet plots ophoudt.
    ["rect", 22, 8, 92, 62, 60],
    ["rect", 22, 20, 68, 42, 26],
    ["rect", 22, 72, 118, 46, 34],
    // Eén randlijn per vorm, op de kant waar het licht vandaan komt. Zonder die
    // rand smelten de silhouetten samen tot één zwart vlak en is de zolder een
    // donkere wand in plaats van een kamer met dingen erin.
    ["line", 23, [8, 92, 69, 92]],
    ["line", 23, [20, 68, 61, 68]],
    ["line", 23, [72, 118, 117, 118]],
    // De kist rechts van het midden, precies waar de straal de vloer haalt.
    ["rect", 22, 196, 146, 76, 28],
    ["line", 24, [196, 146, 271, 146]],
    ["line", 23, [271, 146, 271, 173]],
    // Staanders die het beeld links en rechts afsluiten.
    ["rect", 22, 0, 8, 12, 148],
    ["rect", 22, 302, 8, 18, 126],

    // ---- De straal over de kamer heen -------------------------------------
    // In plakken, met aflopende kracht: naar beneden toe breder en zwakker. Hij
    // waaiert naar links uit, zodat de hete kop boven de plaat uitkomt en de
    // koude staart eronder weer tevoorschijn komt.
    //
    // light in plaats van ditherRamp: een straal vult niets, hij licht op wat
    // er al staat. De gording, de dozen en de kist blijven dus staan waar hij
    // erover valt — ze krijgen alleen hun eigen hout een paar tinten lichter
    // mee. Met een dekkende veelhoek verdwenen ze eronder en las het licht als
    // een oranje plaat.
    //
    // De kop krijgt drie stappen in plaats van een dekkende vulling: ook vlak
    // onder het raam blijft de wand de wand, hij is er alleen weggebrand. Een
    // dekkende ditherRamp las daar als een lichte plank onder het kozijn.
    ["light", 3, 0.85, [214, 50, 288, 50, 292, 64, 208, 64]],
    ["light", 2, 0.80, [208, 64, 292, 64, 296, 96, 196, 96]],
    ["light", 2, 0.45, [196, 96, 296, 96, 302, 134, 180, 134]],
    ["light", 1, 0.55, [180, 134, 302, 134, 308, 189, 162, 189]],
    // Waar hij de vloer haalt, is het hout een tint warmer.
    ["light", 1, 0.35, [170, 158, 304, 158, 310, 189, 156, 189]],

    // ---- De plaat waar het logo op komt -----------------------------------
    // Zonder plaat verdwijnt de titel waar de straal passeert: de titelkleur is
    // exact de hooglichtkleur van de straal zelf. Dat was de fout die in WP A
    // is rechtgezet, en de plaat is de reden dat ze niet terugkomt. Ze is wel
    // zo krap gehouden als de tekst toelaat — acht pixel marge rondom — zodat
    // ze een band over de kamer is en niet de kamer zelf.
    ["rect", 28, 44, 64, 232, 68],
    ["shadow", 1, [44, 64, 275, 64, 275, 132, 44, 132]],
    ["line", 33, [44, 64, 275, 64]],
    ["line", 33, [44, 131, 275, 131]],
    ["line", 33, [44, 64, 44, 131]],
    ["line", 33, [275, 64, 275, 131]],
    ["line", 30, [47, 67, 272, 67]],
    ["line", 30, [47, 128, 272, 128]]
  ],

  // De titelkaart wordt niet belopen; de walkbox is er voor het scène-schema.
  walkboxes: [
    [0, 180, 320, 9]
  ],
  entries: {
    start: [160, 185]
  },

  hotspots: [],
  sfeer: [
    { soort: "stof", x: 182, y: 52, b: 118, h: 132, aantal: 18, kleur: 34,
      seed: 5, snelheid: 0.012 }
  ],
  overlays: []
};
