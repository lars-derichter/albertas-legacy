// scene-zolder-midden.js — de doorgang, de spil van de zolder-hub.
//
// De kamerbeschrijving noemt: balken die samenkomen en een dak dat laag wordt,
// licht dat hier al minder haalt, een doos die zwaarder oogt dan de andere met
// vergeelde tape en het label BRONCODE, en achterin een trap naar boven. Dat
// moet allemaal zichtbaar zijn.
//
// Verbindt west, oost en — via de trap — de overloop. Dit is de enige kamer met
// drie uitgangen, dus de compositie moet ze alle drie leesbaar maken: links en
// rechts loopt de vloer door, achterin gaat het omhoog.
//
// De broncode-doos en de gemerkte fragment-dozen zijn geblitte sprites, geen
// verf: het zijn de voorwerpen waar de speler mee omgaat.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-midden"] = {
  id: "zolder-midden",

  picture: [
    // ---- Achterwand en een dak dat laag komt -------------------------------
    ["gradient", 28, 30, 0, 8, 320, 116, "v"],
    ["noise", 28, 0.07, 15, [0, 8, 319, 8, 319, 124, 0, 124]],
    // De twee dakschuinten die naar het midden toe samenkomen: het dak zakt.
    ["poly", 23, [0, 8, 96, 8, 40, 60, 0, 60]],
    ["poly", 23, [224, 8, 319, 8, 319, 60, 280, 60]],
    ["shadow", 1, [0, 40, 60, 40, 30, 60, 0, 60]],
    ["shadow", 1, [262, 40, 319, 40, 319, 60, 290, 60]],
    ["noise", 22, 0.10, 17, [0, 8, 96, 8, 40, 60, 0, 60]],
    ["noise", 22, 0.10, 18, [224, 8, 319, 8, 319, 60, 280, 60]],

    // ---- Vloer -------------------------------------------------------------
    ["gradient", 23, 25, 0, 124, 320, 65, "v"],
    ["noise", 22, 0.10, 19, [0, 124, 319, 124, 319, 189, 0, 189]],
    ["line", 22, [0, 124, 319, 124]],
    ["line", 22, [136, 124, 60, 189]],
    ["line", 22, [200, 124, 276, 189]],
    ["line", 23, [0, 150, 319, 150]],
    ["line", 23, [0, 172, 319, 172]],

    // ---- Gording en staanders ---------------------------------------------
    ["rect", 24, 0, 60, 320, 10],
    ["shadow", 1, [0, 68, 319, 68, 319, 72, 0, 72]],
    ["noise", 23, 0.12, 21, [0, 60, 319, 60, 319, 70, 0, 70]],
    ["rect", 24, 44, 70, 12, 54],
    ["shadow", 1, [44, 70, 48, 70, 48, 124, 44, 124]],
    ["rect", 24, 264, 70, 12, 54],
    ["shadow", 1, [264, 70, 268, 70, 268, 124, 264, 124]],

    // ---- De trap naar de overloop -----------------------------------------
    // Een donker gat in de achterwand met treden die naar boven wegvallen. De
    // bovenste treden zijn nauwelijks te zien: daar is het al donker.
    ["rect", 22, 140, 24, 60, 100],
    ["gradient", 28, 22, 144, 28, 52, 92, "v"],
    ["poly", 24, [144, 108, 196, 108, 196, 118, 144, 118]],
    ["line", 22, [144, 118, 195, 118]],
    ["poly", 25, [147, 96, 193, 96, 193, 106, 147, 106]],
    ["line", 22, [147, 106, 192, 106]],
    ["poly", 24, [150, 86, 190, 86, 190, 94, 150, 94]],
    ["line", 22, [150, 94, 189, 94]],
    ["poly", 25, [153, 78, 187, 78, 187, 84, 153, 84]],
    ["line", 22, [153, 84, 186, 84]],
    ["poly", 24, [156, 72, 184, 72, 184, 76, 156, 76]],
    // Kozijn rond de opening.
    ["line", 26, [140, 24, 140, 124]],
    ["line", 26, [199, 24, 199, 124]],
    ["line", 26, [140, 24, 199, 24]],

    // ---- De hoek links, waar het licht binnenvalt --------------------------
    // Twee dozen in de veeg. Hun voet ligt op y147, drie pixels boven de
    // loopstrook: de speler loopt er vóór langs en dekt ze af, want hij staat
    // dichterbij.
    ["rect", 25, 8, 121, 16, 13],
    ["rect", 26, 8, 134, 16, 13],
    ["rect", 25, 24, 134, 16, 13],
    ["shadow", 1, [8, 121, 14, 121, 14, 147, 8, 147]],
    ["line", 27, [8, 121, 23, 121]],
    ["line", 27, [24, 134, 39, 134]],
    ["line", 22, [8, 133, 23, 133]],
    ["line", 22, [8, 146, 39, 146]],
    // Een omtrek van één pixel, want hier valt de lichtveeg het hardst binnen
    // en zonder rand loopt het karton in de opgelichte vloer over.
    ["line", 22, [8, 121, 8, 147]],
    ["line", 22, [23, 121, 23, 133]],
    ["line", 22, [39, 134, 39, 147]],
    ["shadow", 2, [4, 145, 42, 145, 46, 151, 0, 151]],

    // ---- Links van de trap: het gewone zoldergoed --------------------------
    // De trapopening (x140–199) en de corridor eronder blijven onaangeroerd:
    // dat is de doorgang, en een doorgang die je niet meteen ziet, is er geen.
    // Alles wat hier bij komt, staat ernáást, met zijn voet in de strook vloer
    // tussen de wandlijn (y124) en de loopstrook (y150). Daar komt de speler
    // niet, dus er hoort geen blok bij en er gaat geen stap loopruimte
    // verloren — dat is de goedkoopste manier om een kamer te vullen.
    ["rect", 26, 60, 85, 16, 13],
    ["rect", 25, 60, 98, 16, 13],
    ["rect", 26, 60, 111, 16, 13],
    ["rect", 25, 60, 124, 16, 13],
    ["rect", 25, 76, 111, 16, 13],
    ["rect", 26, 76, 124, 16, 13],
    ["shadow", 1, [60, 85, 66, 85, 66, 137, 60, 137]],
    ["line", 27, [60, 85, 75, 85]],
    ["line", 27, [76, 111, 91, 111]],
    ["line", 22, [60, 97, 75, 97]],
    ["line", 22, [60, 110, 75, 110]],
    ["line", 22, [60, 123, 91, 123]],
    ["line", 22, [60, 136, 91, 136]],
    ["rect", 36, 63, 102, 11, 6],
    ["line", 39, [63, 102, 73, 102]],
    ["px", 41, [[65, 104], [67, 104], [69, 104], [72, 104],
      [65, 106], [68, 106], [71, 106]]],

    // Een houten ladder tegen de wand: twee bomen van drie pixels en zes
    // sporten van één. Het goedkoopste voorwerp van de hele zolder, en meteen
    // het best herkenbare — een ladder is enkel nog maar zijn silhouet.
    ["rect", 23, 102, 72, 3, 64],
    ["rect", 24, 116, 72, 3, 64],
    ["line", 26, [118, 73, 118, 134]],
    ["line", 24, [105, 82, 115, 82]],
    ["line", 24, [105, 92, 115, 92]],
    ["line", 24, [105, 102, 115, 102]],
    ["line", 24, [105, 112, 115, 112]],
    ["line", 24, [105, 122, 115, 122]],
    ["line", 24, [105, 132, 115, 132]],

    // Een emmer ernaast, tien centimeter smaller aan de voet dan aan de rand.
    ["poly", 50, [124, 127, 133, 127, 132, 137, 125, 137]],
    ["line", 52, [132, 128, 132, 136]],
    ["line", 51, [124, 127, 133, 127]],
    ["shadow", 2, [56, 135, 138, 135, 142, 143, 52, 143]],

    // ---- Rechts van de trap: een plank, een spiegel, twee koffers ----------
    ["rect", 24, 204, 92, 52, 3],
    ["line", 27, [204, 92, 255, 92]],
    ["rect", 23, 210, 95, 2, 5],
    ["rect", 23, 248, 95, 2, 5],
    ["shadow", 2, [204, 95, 255, 95, 255, 100, 204, 100]],
    ["rect", 50, 208, 86, 4, 6],
    ["rect", 51, 214, 86, 4, 6],
    ["px", 52, [[208, 85], [209, 85], [210, 85], [211, 85],
      [214, 85], [215, 85], [216, 85], [217, 85]]],
    ["rect", 24, 226, 83, 12, 9],
    ["line", 26, [237, 83, 237, 91]],

    // Een staande spiegel onder een stoflaken. De drapé-regel uit de
    // stijlgids: de bovenrand één stap lichter dan de plooien eronder.
    ["rect", 23, 204, 110, 14, 27],
    ["poly", 36, [204, 110, 218, 110, 218, 128, 214, 132, 208, 130,
      204, 133]],
    ["line", 38, [204, 110, 217, 110]],
    ["px", 35, [[206, 116], [206, 121], [211, 118], [215, 123], [209, 126]]],
    ["shadow", 1, [204, 110, 208, 110, 208, 136, 204, 136]],

    // Twee koffers op elkaar met een tafelventilator erop. De korf is drie
    // ringen; op veertien pixels zijn bladen niet te tekenen en een ring wel.
    ["rect", 23, 226, 126, 20, 11],
    ["rect", 24, 227, 127, 18, 9],
    ["line", 22, [227, 131, 244, 131]],
    ["px", 56, [[232, 131], [240, 131]]],
    ["rect", 22, 229, 116, 17, 10],
    ["rect", 23, 230, 117, 15, 8],
    ["line", 22, [230, 120, 244, 120]],
    ["line", 26, [246, 126, 246, 136]],
    ["ellipse", 50, 238, 107, 7, 7],
    ["ellipse", 49, 238, 107, 5, 5],
    ["ellipse", 51, 238, 107, 2, 2],
    ["rect", 49, 237, 112, 3, 4],
    ["ellipse", 50, 238, 115, 5, 1],

    ["rect", 25, 250, 110, 16, 13],
    ["rect", 26, 250, 123, 16, 13],
    ["shadow", 1, [250, 110, 256, 110, 256, 136, 250, 136]],
    ["line", 27, [250, 110, 265, 110]],
    ["line", 22, [250, 122, 265, 122]],
    ["line", 22, [250, 135, 265, 135]],
    ["shadow", 2, [200, 135, 270, 135, 274, 143, 196, 143]],

    // ---- Wat er níét als sprite staat --------------------------------------
    // Een lage stapel tegen de rechterwand, puur als vulling: de kamer hoort
    // vol te staan, niet leeg met drie voorwerpen erin. Drie dozen van 17 × 13,
    // op de maat van de doos-sprite die er twee meter naast staat (WP 35);
    // vroeger één vlak van 34 × 30.
    ["rect", 25, 286, 131, 17, 13],
    ["rect", 26, 286, 144, 17, 13],
    ["rect", 25, 303, 144, 17, 13],
    ["shadow", 1, [286, 131, 292, 131, 292, 157, 286, 157]],
    ["line", 27, [286, 131, 302, 131]],
    ["line", 27, [303, 144, 319, 144]],
    ["line", 22, [286, 143, 302, 143]],
    ["line", 22, [286, 156, 319, 156]],
    ["shadow", 2, [282, 155, 319, 155, 319, 165, 276, 165]],

    // ---- Het licht dat van west naar oost trekt ----------------------------
    // Hier haalt het al minder: geen straal meer maar een veeg die links
    // binnenvalt en halverwege de kamer opgeeft.
    //
    // Met light, en achteraan in de picture, zodat de veeg over de vloer valt in
    // plaats van eronder te verdwijnen. Een dekkende veelhoek leest hier als een
    // oranje wig, en dat was precies wat er aan de oude tekening mis was.
    //
    // Anders opgebouwd dan de straal in de westhoek: dáár liggen de plakken
    // ónder elkaar, want een bundel wordt naar beneden toe zwakker. Hier liggen
    // ze ín elkaar, want een veeg wordt naar bínnen toe zwakker. Vijf wiggen van
    // één stap die elkaar overlappen: helemaal links tellen ze allemaal mee, naar
    // rechts vallen ze een voor een weg, en de veeg dooft dus uit in plaats van
    // op te houden. Met twee brede wiggen van drie stappen stond hier een
    // lichtgevende rechthoek tegen de wand.
    // De buitenste wig loopt bewust tot voorbij de staander op x44: bleef ze
    // ervoor staan, dan hield het licht precies op de staander op en las het als
    // een verlicht paneel tegen de wand in plaats van als licht dat naar binnen
    // valt.
    ["light", 1, 0.10, [0, 62, 110, 62, 168, 189, 0, 189]],
    ["light", 1, 0.16, [0, 66, 88, 66, 132, 189, 0, 189]],
    ["light", 1, 0.22, [0, 70, 66, 70, 100, 189, 0, 189]],
    ["light", 1, 0.30, [0, 74, 46, 74, 72, 189, 0, 189]],
    ["light", 1, 0.40, [0, 78, 28, 78, 46, 189, 0, 189]]
  ],

  // Beloopbare vloer (west↔oost) plus een corridor naar de trap (noord). Beide
  // zijranden zijn hier écht een uitgang, dus de strook loopt van x0 tot x319.
  walkboxes: [
    [0, 150, 320, 39],
    [150, 118, 42, 71]
  ],

  // De trap. Noord is met een schermrand niet te doen — een kamer die tot y8
  // beloopbaar is, heeft geen achterwand meer — dus de uitgang is een zone in de
  // vloer, boven aan de corridor en op de onderste trede. Wie erin stapt, gaat
  // naar boven: geen venster, geen tweede toets. De corridor-walkbox stond hier
  // al vanaf het begin; ze wees op een uitgang die nooit bestond.
  exits: [
    { richting: "noord", rect: [150, 118, 42, 8] }
  ],

  //   stapel-rechts   de geschilderde stapel tegen de rechterwand (x286–319,
  //                   voet y157, contactschaduw tot y165). Het blok loopt bewust
  //                   iets breder dan de stapel: het houdt de speler ook uit de
  //                   voorgrondstapel op x296–319, waar zijn hoofd anders boven
  //                   het silhouet uit zou komen (zie workflow/34)
  //   broncode-doos   de voetafdruk van de sprite op x116 y182
  //   doos            de voetafdruk van de sprite op x236 y170
  // De sprite-blokken dekken alleen de onderkant: props worden op voet-y
  // gesorteerd, dus áchter een doos lopen klopt vanzelf en mag gewoon.
  blokken: [
    [284, 150, 36, 18],
    [102, 174, 28, 9],
    [224, 162, 24, 9]
  ],

  entries: {
    start: [80, 175],
    vanWest: [20, 175],
    vanOost: [300, 175],
    // Twee treden onder de uitgangszone: wie van boven komt, mag niet meteen
    // weer in de zone staan, anders stuitert hij terug naar de overloop.
    vanNoord: [170, 132]
  },

  // De twee doos-props. De broncode-doos staat centraal en vooraan; de gemerkte
  // fragment-dozen rechts ervan, iets naar achter.
  hotspots: [
    { item: "broncode-doos", sprite: "broncode-doos", x: 116, y: 182 },
    { item: "doos", sprite: "doos", x: 236, y: 170 }
  ],


  sfeer: [
    { soort: "stof", x: 8, y: 84, b: 70, h: 96, aantal: 12, kleur: 32,
      seed: 11, snelheid: 0.014 }
  ],

  // Voorgrond: de gording loopt hier vlak voor de kijker langs, en aan de
  // rechterkant staat een stapel in silhouet waar de speler achter verdwijnt.
  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 22, 0, 8, 320, 12],
        ["shadow", 1, [0, 18, 319, 18, 319, 22, 0, 22]],
        ["noise", 23, 0.10, 23, [0, 8, 319, 8, 319, 20, 0, 20]]
      ]
    },
    {
      baselineY: 188,
      ops: [
        // Vier dozen op elkaar in silhouet, 24 px breed en om de zestien pixels
        // een naad: vooraan staat de speler op schaal 1, dus dit is de doosmaat
        // van de stijlgids op ware grootte. Met één naad op y152 las de stapel
        // als twee blokken van een halve meter.
        ["rect", 22, 296, 130, 24, 59],
        ["shadow", 1, [296, 130, 304, 130, 304, 189, 296, 189]],
        ["line", 23, [296, 130, 319, 130]],
        ["line", 23, [296, 146, 319, 146]],
        ["line", 23, [296, 162, 319, 162]],
        ["line", 23, [296, 178, 319, 178]]
      ]
    }
  ]
};
