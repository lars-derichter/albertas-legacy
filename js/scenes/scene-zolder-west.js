// scene-zolder-west.js — Alberta's zolder, de westhoek: waar het spel begint.
//
// De kamerbeschrijving in js/logic/strings.js is de opdracht voor deze tekening.
// Ze noemt: dozen tot tegen de balken, een dakraam met een schuine streep licht
// die al laag staat, een kist met het opengeslagen notitieboek en de pen er nog
// in, en een doorgang naar het oosten. Elk van die dingen hoort hier zichtbaar
// te zijn — dat is de QC-poort van dit werkpakket.
//
// Mood uit art-stijlgids.md: avond-ramp (28–34) voor het licht, hout-ramp
// (22–27) voor vloer en balken, karton in 25/26 met schaduw 23, papier-ramp voor
// het boek. Eén lichtbron: het dakraam rechtsboven. Alles wat schaduw werpt,
// werpt ze dus naar links-onder.
//
// Het notitieboek staat niet meer in deze tekening: het is een geblitte sprite
// uit hotspots, zodat het een voorwerp is en geen verf.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-west"] = {
  id: "zolder-west",

  picture: [
    // ---- Achterwand ------------------------------------------------------
    // Een verloop over de avond-ramp in plaats van twee vlakke rechthoeken:
    // donker onder de nok, iets lichter waar het raamlicht de wand haalt.
    ["gradient", 28, 30, 0, 8, 320, 118, "v"],
    ["noise", 28, 0.07, 5, [0, 8, 319, 8, 319, 126, 0, 126]],

    // ---- Vloer -----------------------------------------------------------
    // Wijkend: de planklijnen lopen naar een punt achteraan, en het hout wordt
    // lichter naar voren toe (dichter bij de kijker, meer licht).
    ["gradient", 23, 25, 0, 126, 320, 63, "v"],
    ["noise", 22, 0.10, 7, [0, 126, 319, 126, 319, 189, 0, 189]],
    ["line", 22, [0, 126, 319, 126]],
    ["line", 22, [150, 126, 92, 189]],
    ["line", 22, [186, 126, 244, 189]],
    ["line", 22, [122, 126, 0, 172]],
    ["line", 22, [214, 126, 319, 166]],
    ["line", 23, [0, 148, 319, 148]],
    ["line", 23, [0, 168, 319, 168]],

    // ---- Balken ----------------------------------------------------------
    ["rect", 24, 0, 44, 320, 10],
    ["shadow", 1, [0, 52, 319, 52, 319, 56, 0, 56]],
    ["noise", 23, 0.12, 9, [0, 44, 319, 44, 319, 54, 0, 54]],
    ["rect", 24, 36, 8, 12, 118],
    ["shadow", 1, [36, 8, 40, 8, 40, 126, 36, 126]],
    ["rect", 24, 268, 8, 12, 118],
    ["shadow", 1, [268, 8, 272, 8, 272, 126, 268, 126]],

    // ---- Het dakraam ------------------------------------------------------
    // Kozijn met diepte: een donkere dagkant, dan het glas, dan een lichte
    // binnenrand aan de kant waar het licht vandaan komt.
    ["rect", 22, 194, 16, 82, 66],
    ["rect", 24, 197, 19, 76, 60],
    ["gradient", 31, 33, 200, 22, 70, 54, "v"],
    ["ditherRamp", 33, 34, 0.35, [200, 22, 269, 22, 269, 44, 200, 44]],
    // Roeden.
    ["rect", 23, 232, 22, 4, 54],
    ["rect", 23, 200, 46, 70, 4],
    // Binnenrand: het licht valt op de onderdorpel.
    ["line", 27, [197, 78, 272, 78]],
    ["line", 26, [197, 19, 197, 78]],

    // ---- De lichtstraal ---------------------------------------------------
    // In plakken, niet in één veelhoek. Eén vlak met vaste dichtheid leest als
    // een schuine plank: licht hoort naar beneden toe breder én zwakker te
    // worden. Vijf plakken met aflopende dichtheid geven die uitdoving; de
    // ramp-kern loopt mee van heet bovenaan naar mauve onderaan.
    ["ditherRamp", 33, 34, 0.55, [198, 78, 272, 78, 278, 100, 190, 100]],
    ["ditherRamp", 32, 33, 0.45, [190, 100, 278, 100, 286, 124, 178, 124]],
    ["ditherRamp", 31, 32, 0.34, [178, 124, 286, 124, 292, 146, 166, 146]],
    ["ditherRamp", 30, 31, 0.24, [166, 146, 292, 146, 300, 168, 152, 168]],
    ["ditherRamp", 29, 30, 0.16, [152, 168, 300, 168, 308, 189, 138, 189]],

    // Waar de straal de vloer haalt, is het hout warmer — maar laag gehouden:
    // de streep staat al bijna van de vloer af (zie de kamerbeschrijving).
    ["ditherRamp", 25, 26, 0.30, [150, 168, 300, 168, 308, 189, 136, 189]],

    // ---- Dozen, links tot tegen de balken ---------------------------------
    // Drie stapels van afnemende hoogte, zodat het als een hoek vol leest en
    // niet als twee blokken. Elk met een lichtkant rechts (naar het raam toe)
    // en een schaduwkant links.
    ["rect", 25, 8, 62, 62, 64],
    ["shadow", 1, [8, 62, 30, 62, 30, 126, 8, 126]],
    ["line", 27, [8, 62, 69, 62]],
    ["line", 22, [8, 126, 69, 126]],
    ["line", 22, [8, 94, 69, 94]],
    ["rect", 26, 12, 66, 20, 5],

    ["rect", 26, 14, 116, 58, 44],
    ["shadow", 1, [14, 116, 34, 116, 34, 160, 14, 160]],
    ["line", 27, [14, 116, 71, 116]],
    ["line", 22, [14, 138, 71, 138]],
    ["line", 22, [14, 160, 71, 160]],
    // Label: streepjes die handschrift suggereren, geen leesbare tekst.
    ["rect", 36, 24, 124, 34, 11],
    ["line", 39, [24, 124, 57, 124]],
    ["px", 41, [[27, 128], [31, 128], [35, 128], [41, 128], [47, 128],
      [51, 128], [29, 132], [35, 132], [43, 132], [49, 132]]],

    ["rect", 25, 66, 132, 46, 34],
    ["shadow", 1, [66, 132, 82, 132, 82, 166, 66, 166]],
    ["line", 27, [66, 132, 111, 132]],
    ["line", 22, [66, 166, 111, 166]],
    ["line", 22, [88, 132, 88, 166]],

    // Contactschaduwen van de stapels op de vloer.
    ["shadow", 2, [6, 158, 76, 158, 88, 172, 0, 172]],
    ["shadow", 2, [62, 164, 116, 164, 126, 176, 54, 176]],

    // ---- De kist, in het licht --------------------------------------------
    // Het notitieboek en de pen liggen erop als sprite, niet als verf.
    ["rect", 23, 146, 148, 96, 30],
    ["gradient", 25, 27, 148, 136, 92, 14, "v"],
    ["rect", 24, 148, 150, 92, 26],
    ["line", 27, [148, 136, 239, 136]],
    ["line", 22, [146, 148, 241, 148]],
    ["line", 22, [146, 178, 241, 178]],
    // Beslag: twee banden en een slotplaat.
    ["rect", 23, 162, 150, 5, 26],
    ["rect", 23, 220, 150, 5, 26],
    ["rect", 52, 190, 156, 8, 7],
    ["px", 22, [[193, 159], [194, 159]]],
    ["shadow", 2, [140, 176, 248, 176, 258, 186, 130, 186]],

    // ---- Naar het oosten ---------------------------------------------------
    // Geen deur maar een doorgang: de wand houdt op, en daarachter is het
    // donkerder. Zo is te zien dat de zolder verder loopt.
    ["gradient", 29, 28, 288, 54, 32, 72, "h"],
    ["line", 23, [288, 54, 288, 126]],
    ["shadow", 1, [292, 54, 319, 54, 319, 126, 292, 126]]
  ],

  // Beloopbare vloer. De strook loopt door tot de oostrand: dat is de uitgang.
  walkboxes: [
    [0, 150, 320, 39]
  ],

  entries: {
    start: [80, 175],
    vanOost: [300, 175]
  },

  // Het notitieboek is nu een echte prop: een geblitte sprite op de kist, met
  // de pen ernaast. De engine sorteert props en speler op voet-y, dus de speler
  // loopt er netjes achter en voor langs.
  hotspots: [
    { item: "notitieboek", sprite: "notitieboek", x: 196, y: 140 }
  ],

  props: [],

  // Stof in de lichtstraal — de stijlgids vraagt er al om. Het waren tot nu toe
  // acht stilstaande pixels in de gecachete achtergrond; nu zakken ze echt.
  sfeer: [
    { soort: "stof", x: 110, y: 80, b: 96, h: 108, aantal: 22, kleur: 34,
      seed: 3, snelheid: 0.018 }
  ],

  // Voorgrond: een balk die vlak voor de kijker langs loopt. Zijn voet ligt
  // vóór de hele loopstrook, dus de speler passeert er altijd achterlangs — dat
  // is wat de kamer diepte geeft.
  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 22, 0, 8, 320, 14],
        ["shadow", 1, [0, 20, 319, 20, 319, 24, 0, 24]],
        ["noise", 23, 0.10, 13, [0, 8, 319, 8, 319, 22, 0, 22]]
      ]
    }
  ]
};
