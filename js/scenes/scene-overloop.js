// scene-overloop.js — de overloop boven aan de trap, dieper in Alberta's
// archief. Hier liggen de latere fragmenten (levels 5–7).
//
// De kamerbeschrijving noemt: kouder hier, het dakraam is ver en het licht haalt
// de hoeken niet, dozen van later tegen de wand opgestapeld en hoger dan jij, en
// een trap die terugloopt naar beneden.
//
// Mood uit art-stijlgids.md: de steen-ramp (48–53) in plaats van hout, want dit
// is het koudste punt van het spel. Er is hier geen enkele warme kleur behalve
// het karton — en dat is precies waarom de dozen eruit springen.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["overloop"] = {
  id: "overloop",

  picture: [
    // ---- Wand: pleisterwerk, koel en kaal ----------------------------------
    // De korrel blijft één stap van de wand af. Met 48 (de donkerste steen) over
    // een verloop dat naar 50 loopt, stond de spikkel twee stappen lager dan de
    // ondergrond, en met 51 erbij nog een derde stap eroverheen: samen las dat
    // als sneeuw op een tv, niet als pleisterwerk.
    ["gradient", 48, 50, 0, 8, 320, 120, "v"],
    ["noise", 49, 0.10, 41, [0, 8, 319, 8, 319, 128, 0, 128]],
    // Een paar barsten: de wand is oud en niemand heeft hem bijgehouden.
    ["line", 48, [58, 20, 64, 48]],
    ["line", 48, [64, 48, 60, 72]],
    ["line", 48, [252, 34, 246, 62]],

    // ---- Vloer: planken, maar grijzer dan beneden --------------------------
    ["gradient", 49, 50, 0, 128, 320, 61, "v"],
    ["noise", 48, 0.07, 43, [0, 128, 319, 128, 319, 189, 0, 189]],
    ["line", 48, [0, 128, 319, 128]],
    ["line", 48, [128, 128, 52, 189]],
    ["line", 48, [208, 128, 284, 189]],
    ["line", 49, [0, 154, 319, 154]],
    ["line", 49, [0, 176, 319, 176]],

    // ---- Het diepe archief: wat er tegen de wand staat (WP 35b) ------------
    // Alles hieronder staat mét zijn voet in de strook tussen de wandlijn
    // (y128) en de loopstrook (y152). Daar komt de speler niet: geen blok, geen
    // stap loopruimte minder, en de uitgang naar de trap (x148–175) blijft vrij.
    // Het staat vóór de trap in de opsomming, zodat de leuning en de torens er
    // overheen komen — van achter naar voor, zoals de stijlgids vraagt.

    // Opgerolde tapijten tegen de wand, staand: zes pixels dik, veertig hoog —
    // een rol van twee meter. Ze breken de lege lap pleisterwerk boven de
    // linkertorens, die honderd bij negentig pixels in één verloop was.
    ["rect", 23, 62, 100, 8, 29],
    ["rect", 24, 71, 96, 7, 33],
    ["rect", 22, 79, 104, 6, 25],
    ["ellipse", 25, 65, 100, 4, 2],
    ["ellipse", 26, 74, 96, 3, 2],
    ["line", 26, [69, 101, 69, 128]],
    ["line", 25, [77, 97, 77, 128]],
    ["line", 22, [62, 114, 69, 114]],
    ["line", 22, [71, 110, 77, 110]],
    ["shadow", 2, [58, 126, 88, 126, 90, 132, 56, 132]],

    // De wand boven het trapgat blijft leeg, en dat is met opzet: `onderzoek
    // wand` zegt dat er aan deze kant van de zolder nooit iets is opgehangen.
    // Er staat ook niets onder — daar is een gat in de vloer. Het is het enige
    // grote lege vlak dat na dit werkpakket overblijft, en het hoort er te
    // zijn: de overloop is de kale, koude kamer.

    // Nog een toren, een rij naar achter, tussen de linkertorens en de trap,
    // met een koffer bovenop.
    ["rect", 25, 106, 123, 16, 13],
    ["rect", 26, 106, 136, 16, 13],
    ["shadow", 1, [106, 123, 112, 123, 112, 148, 106, 148]],
    ["line", 27, [106, 123, 121, 123]],
    ["line", 22, [106, 135, 121, 135]],
    ["line", 22, [106, 148, 121, 148]],
    ["rect", 23, 107, 114, 15, 9],
    ["rect", 24, 108, 115, 13, 7],
    ["line", 22, [108, 118, 120, 118]],
    ["px", 56, [[111, 118], [117, 118]]],
    ["shadow", 2, [102, 147, 126, 147, 128, 152, 100, 152]],

    // Rechts van de trap: een toren van drie hoog met blikken en boeken erop,
    // en een wasmand ernaast.
    ["rect", 26, 200, 110, 16, 13],
    ["rect", 25, 200, 123, 16, 13],
    ["rect", 26, 200, 136, 16, 13],
    ["shadow", 1, [200, 110, 206, 110, 206, 148, 200, 148]],
    ["line", 27, [200, 110, 215, 110]],
    ["line", 22, [200, 122, 215, 122]],
    ["line", 22, [200, 135, 215, 135]],
    ["line", 22, [200, 148, 215, 148]],
    ["rect", 50, 201, 101, 9, 9],
    ["line", 52, [209, 101, 209, 109]],
    ["rect", 41, 211, 100, 3, 10],
    ["rect", 40, 214, 101, 2, 9],
    // De wasmand in de steen-ramp en niet in hout hooglicht (27), zoals in de
    // westhoek. Op de overloop is het karton de enige warme kleur, en een
    // lichte mand vlak achter de speler las bovendien als een hoed op zijn
    // hoofd — precies op de plek waar de engine hem neerzet (`start`).
    ["rect", 51, 220, 140, 14, 9],
    ["line", 52, [220, 140, 233, 140]],
    ["px", 49, [[222, 142], [226, 142], [230, 142], [224, 144], [228, 144],
      [232, 144], [222, 146], [226, 146], [230, 146]]],
    ["rect", 50, 222, 137, 10, 3],
    ["shadow", 2, [196, 147, 238, 147, 242, 152, 192, 152]],

    // En de rechterhoek, waar het licht helemaal niet meer komt: drie dozen in
    // silhouet. Ze staan er om de kamer smal te doen lijken, niet om gezien te
    // worden — de hoekschaduw achteraan zet ze nog een stap dieper.
    ["rect", 25, 284, 123, 16, 13],
    ["rect", 26, 284, 136, 16, 13],
    ["rect", 25, 300, 136, 16, 13],
    ["shadow", 1, [284, 123, 290, 123, 290, 148, 284, 148]],
    ["line", 27, [284, 123, 299, 123]],
    ["line", 22, [284, 135, 299, 135]],
    ["line", 22, [284, 148, 315, 148]],
    ["shadow", 2, [280, 147, 319, 147, 319, 153, 276, 153]],

    // ---- De trap naar beneden ----------------------------------------------
    // Een gat in de vloer met een leuning ernaast: hij loopt naar beneden weg,
    // dus de treden worden donkerder naarmate ze dieper liggen.
    //
    // Het gat liep tot y188 en de loopstrook begint op y152. Wie via het zuiden
    // binnenkwam, stond dus midden in het gat — en dat is precies hoe het eruit
    // zag. Het gat eindigt nu op de voorrand van de strook: je loopt eromheen,
    // niet erin. De treden zijn navenant korter, want ze verdwijnen ook eerder
    // uit het zicht.
    // Het gat zelf, donker, met de bovenkant het diepst: de trap loopt van de
    // kijker wég naar beneden, dus wat verder weg is ligt lager.
    ["rect", 48, 128, 122, 68, 30],
    ["line", 51, [128, 122, 195, 122]],
    // Drie treden, om en om licht en donker zodat ze als tréden lezen en niet
    // als een verloop. De onderste is het breedst: die is het dichtst bij.
    ["poly", 49, [136, 126, 188, 126, 188, 133, 136, 133]],
    ["line", 51, [136, 126, 187, 126]],
    ["poly", 50, [133, 133, 191, 133, 191, 142, 133, 142]],
    ["line", 52, [133, 133, 190, 133]],
    ["poly", 49, [130, 142, 194, 142, 194, 152, 130, 152]],
    ["line", 51, [130, 142, 193, 142]],
    // De leuning staat op de vóórrand van het gat en dus tussen de speler en de
    // diepte in. Ze stond eerst boven het gat tegen de wand, en las daar als een
    // plank.
    //
    // Ze liep ook van x122 tot x200 in één stuk, en dat was een hek: de trap
    // naar beneden was afgesloten met een balk op heuphoogte. Nu staan er twee
    // stukken leuning met vier stijlen, en tussen x148 en x175 is de opening
    // waar je de trap af gaat. Dat is precies de uitgangszone hieronder — wat de
    // tekening belooft, moet de vloer waarmaken.
    ["rect", 24, 122, 128, 5, 25],
    ["rect", 24, 144, 128, 4, 25],
    ["rect", 24, 176, 128, 4, 25],
    ["rect", 24, 196, 128, 5, 25],
    ["rect", 25, 122, 128, 26, 4],
    ["rect", 25, 176, 128, 25, 4],
    ["line", 27, [122, 128, 147, 128]],
    ["line", 27, [176, 128, 200, 128]],
    ["shadow", 1, [122, 132, 147, 132, 147, 136, 122, 136]],
    ["shadow", 1, [176, 132, 200, 132, 200, 136, 176, 136]],

    // ---- De dozen: hoger dan jij -------------------------------------------
    // Twee torens tegen de wand en een derde rechts. "Hoger dan jij" zit sinds
    // de schaalpas van WP 35 in het áántal dozen, niet in de maat van één doos:
    // elke doos is 16 × 13 px (0,80 × 0,65 m), de maat van `sprite-doos.js` die
    // er hieronder als prop naast staat. De linkertoren is vier dozen hoog en
    // haalt daarmee 52 px, twee keer de speler op deze diepte.
    //
    // Vroeger was de linkertoren één vlak van 62 × 148 px — zeven meter hoog —
    // dat tot voorbij de bovenrand van het speelveld liep. Het silhouet is
    // gebleven (drie massa's op dezelfde plekken), de maateenheid is veranderd.
    ["rect", 25, 10, 104, 16, 13],
    ["rect", 26, 10, 117, 16, 13],
    ["rect", 25, 10, 130, 16, 13],
    ["rect", 26, 10, 143, 16, 13],
    ["rect", 26, 26, 104, 16, 13],
    ["rect", 25, 26, 117, 16, 13],
    ["rect", 26, 26, 130, 16, 13],
    ["rect", 25, 26, 143, 16, 13],
    ["rect", 25, 42, 117, 16, 13],
    ["rect", 26, 42, 130, 16, 13],
    ["rect", 25, 42, 143, 16, 13],
    ["shadow", 1, [10, 104, 16, 104, 16, 156, 10, 156]],
    ["line", 27, [10, 104, 41, 104]],
    ["line", 27, [42, 117, 57, 117]],
    ["line", 22, [10, 116, 41, 116]],
    ["line", 22, [10, 129, 57, 129]],
    ["line", 22, [10, 142, 57, 142]],
    ["line", 22, [10, 155, 57, 155]],
    // Labels op twee van de dozen.
    ["rect", 36, 13, 121, 11, 6],
    ["line", 39, [13, 121, 23, 121]],
    ["px", 41, [[15, 123], [17, 123], [19, 123], [22, 123],
      [15, 125], [18, 125], [21, 125]]],
    ["rect", 36, 29, 147, 11, 6],
    ["line", 39, [29, 147, 39, 147]],
    ["px", 41, [[31, 149], [33, 149], [36, 149],
      [31, 151], [34, 151], [37, 151]]],

    ["rect", 26, 76, 115, 16, 13],
    ["rect", 25, 76, 128, 16, 13],
    ["rect", 26, 76, 141, 16, 13],
    ["rect", 25, 92, 128, 16, 13],
    ["rect", 26, 92, 141, 16, 13],
    ["shadow", 1, [76, 115, 82, 115, 82, 154, 76, 154]],
    ["line", 27, [76, 115, 91, 115]],
    ["line", 27, [92, 128, 107, 128]],
    ["line", 22, [76, 127, 91, 127]],
    ["line", 22, [76, 140, 107, 140]],
    ["line", 22, [76, 153, 107, 153]],
    // Een koffer bovenop deze toren, sluitingen naar voren.
    ["rect", 23, 78, 106, 15, 9],
    ["rect", 24, 79, 107, 13, 7],
    ["line", 22, [79, 110, 91, 110]],
    ["px", 56, [[82, 110], [88, 110]]],
    ["line", 22, [85, 105, 88, 105]],
    ["line", 26, [92, 106, 92, 114]],

    ["rect", 25, 236, 128, 16, 13],
    ["rect", 26, 236, 141, 16, 13],
    ["rect", 25, 252, 141, 16, 13],
    ["shadow", 1, [236, 128, 242, 128, 242, 154, 236, 154]],
    ["line", 27, [236, 128, 251, 128]],
    ["line", 27, [252, 141, 267, 141]],
    ["line", 22, [236, 140, 251, 140]],
    ["line", 22, [236, 153, 267, 153]],
    // Een deken over deze toren. Dezelfde drapé-regel als beneden (bovenste rij
    // een stap lichter), maar in de steen-ramp en niet in de avond-ramp: op de
    // overloop is het karton de énige warme kleur, en dat hoort zo te blijven.
    ["rect", 50, 234, 124, 36, 5],
    ["line", 51, [234, 124, 269, 124]],
    ["rect", 49, 234, 129, 5, 12],
    ["px", 50, [[235, 133], [236, 137], [238, 131]]],
    ["shadow", 1, [234, 124, 240, 124, 240, 140, 234, 140]],

    // Contactschaduwen: de torens staan echt op deze vloer.
    ["shadow", 2, [6, 152, 112, 152, 120, 166, 0, 166]],
    ["shadow", 2, [230, 150, 272, 150, 280, 162, 222, 162]],

    // ---- Het licht haalt de hoeken niet ------------------------------------
    // Eén flauwe veeg van de trap-kant, en verder niets. De hoeken worden
    // expliciet nog een stap donkerder gezet. Met light, zodat de veeg de vloer
    // oplicht in plaats van er een grijze vlek op te leggen — de overloop is
    // steen-ramp, de vloer hout-ramp, en die twee mengden niet.
    ["light", 1, 0.25, [140, 128, 190, 128, 214, 189, 116, 189]],
    ["shadow", 1, [0, 8, 30, 8, 46, 189, 0, 189]],
    ["shadow", 1, [292, 8, 319, 8, 319, 189, 278, 189]]
  ],

  // De overloop heeft maar één uitgang, en die ligt niet aan een zijrand: de
  // strook houdt links en rechts op vóór het beeld, zodat de speler tegen de
  // hoeken aan loopt in plaats van eruit.
  walkboxes: [
    [6, 152, 308, 37]
  ],

  // De trap naar beneden, in de opening tussen de twee stukken leuning. Loop je
  // ertegenaan, dan ga je naar de doorgang — te voet, zoals "ga zuid" dat ook
  // doet.
  exits: [
    { richting: "zuid", rect: [148, 152, 28, 8] }
  ],

  //   torens-links    de twee kartonnen torens met hun contactschaduw (x6–121)
  //   toren-rechts    de derde toren (x236–267, schaduw tot y162)
  //   doos            de voetafdruk van de sprite op x262 y168
  blokken: [
    [6, 152, 116, 15],
    [230, 152, 50, 13],
    [250, 160, 24, 9]
  ],

  entries: {
    start: [230, 174],
    vanZuid: [162, 174]
  },

  // De gemerkte dozen waar de latere fragmenten in zitten.
  hotspots: [
    { item: "doos", sprite: "doos", x: 262, y: 168 }
  ],

  props: [],
  sfeer: [],

  overlays: [
    {
      baselineY: 200,
      ops: [
        ["rect", 48, 0, 8, 320, 10],
        ["shadow", 1, [0, 16, 319, 16, 319, 20, 0, 20]]
      ]
    }
  ]
};
