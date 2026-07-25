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

    // ---- Dozen, links tot tegen de balken ---------------------------------
    // Drie stapels van afnemende hoogte, zodat het als een hoek vol leest en
    // niet als twee blokken. Elk met een lichtkant rechts (naar het raam toe)
    // en een schaduwkant links.
    //
    // Sinds de schaalpas van WP 35 is elke doos een eigen rechthoek van
    // ongeveer 16 × 13 tot 18 × 15 px — de maat van `sprite-doos.js` (22 × 18),
    // want die staat twee kamers verderop op dezelfde vloer. Daarvóór was de
    // achterste stapel één vlak van 62 × 64 px: drie meter hoog, en dus twee tot
    // drie keer de doos-sprite ernaast. Een stapel is nu hóger doordat er meer
    // dozen op elkaar staan, niet doordat de doos groter is. De dozen achteraan
    // zijn een tikje kleiner dan die vooraan: de vloer wijkt.
    ["rect", 25, 8, 87, 16, 13],
    ["rect", 26, 8, 100, 16, 13],
    ["rect", 25, 8, 113, 16, 13],
    ["rect", 26, 24, 100, 16, 13],
    ["rect", 25, 24, 113, 16, 13],
    ["shadow", 1, [8, 87, 14, 87, 14, 126, 8, 126]],
    ["line", 27, [8, 87, 23, 87]],
    ["line", 27, [24, 100, 39, 100]],
    ["line", 22, [8, 99, 23, 99]],
    ["line", 22, [8, 112, 39, 112]],
    ["line", 22, [8, 125, 39, 125]],
    ["rect", 26, 12, 91, 9, 4],
    // De achterste stapel staat tegen de wand, dus haar contactschaduw ligt op
    // de wand-vloerlijn. Zonder die schaduw hing ze aan de muur.
    ["shadow", 2, [4, 124, 44, 124, 48, 131, 0, 131]],

    ["rect", 26, 14, 132, 17, 14],
    ["rect", 25, 14, 146, 17, 14],
    ["rect", 26, 31, 146, 17, 14],
    ["shadow", 1, [14, 132, 20, 132, 20, 160, 14, 160]],
    ["line", 27, [14, 132, 30, 132]],
    ["line", 27, [31, 146, 47, 146]],
    ["line", 22, [14, 145, 30, 145]],
    ["line", 22, [14, 159, 47, 159]],
    // Label: streepjes die handschrift suggereren, geen leesbare tekst.
    ["rect", 36, 17, 150, 11, 6],
    ["line", 39, [17, 150, 27, 150]],
    ["px", 41, [[19, 152], [21, 152], [23, 152], [26, 152],
      [19, 154], [22, 154], [25, 154]]],

    ["rect", 25, 66, 151, 18, 15],
    ["rect", 26, 84, 151, 18, 15],
    ["shadow", 1, [66, 151, 72, 151, 72, 166, 66, 166]],
    ["line", 27, [66, 151, 101, 151]],
    ["line", 22, [66, 165, 101, 165]],
    ["line", 22, [84, 151, 84, 165]],

    // Contactschaduwen van de stapels op de vloer.
    ["shadow", 2, [10, 158, 50, 158, 56, 168, 4, 168]],
    ["shadow", 2, [62, 164, 104, 164, 112, 172, 56, 172]],

    // ---- De kist, in het licht --------------------------------------------
    // Het notitieboek en de pen liggen erop als sprite, niet als verf.
    //
    // Veertig bij negentien pixels: twee meter breed en een kleine meter hoog.
    // Dat is nog altijd een grote linnenkist en het bovenste eind van wat de
    // maatregel toelaat, maar het notitieboek moet er leesbaar op kunnen liggen.
    // Ze was 96 × 42 px — vijf meter breed, met een boek van 22 px erop dat
    // daardoor als een postzegel las.
    // Het voorvlak blijft hout mid (24) en wordt niet in karton-warm (25)
    // gezet, hoe veel losser de kist daarmee ook van de vloer zou komen: 25 en
    // 26 zijn in de vier kamers de kleuren van het karton, en de maatkeuring
    // (`test/test-schaal.mjs`) telt elk vlak in die twee kleuren als een doos.
    // Een kist die als doos meetelt, breekt de dozenmaat. Het contrast komt
    // hier van het lichte deksel en de lichtstraal die erop valt.
    ["rect", 23, 176, 158, 40, 15],
    ["gradient", 25, 27, 178, 154, 36, 5, "v"],
    ["rect", 24, 178, 159, 36, 12],
    ["line", 27, [178, 154, 213, 154]],
    ["line", 22, [176, 158, 215, 158]],
    ["line", 22, [176, 172, 215, 172]],
    // Beslag: twee banden en een slotplaat.
    ["rect", 23, 184, 159, 3, 12],
    ["rect", 23, 205, 159, 3, 12],
    ["rect", 55, 193, 162, 5, 4],
    ["rect", 57, 194, 163, 3, 2],
    ["px", 22, [[195, 164]]],
    ["shadow", 2, [170, 171, 222, 171, 228, 177, 164, 177]],

    // ---- Naar het oosten ---------------------------------------------------
    // Geen deur maar een doorgang: de wand houdt op, en daarachter is het
    // donkerder. Zo is te zien dat de zolder verder loopt.
    ["gradient", 29, 28, 288, 54, 32, 72, "h"],
    ["line", 23, [288, 54, 288, 126]],
    ["shadow", 1, [292, 54, 319, 54, 319, 126, 292, 126]],

    // ---- De lichtstraal ---------------------------------------------------
    // In plakken, niet in één veelhoek. Eén vlak met vaste dichtheid leest als
    // een schuine plank: licht hoort naar beneden toe breder én zwakker te
    // worden. Vijf plakken met aflopende kracht geven die uitdoving.
    //
    // Twee dingen zijn hier veranderd tegenover de eerste doorloop. De straal
    // staat nu áchteraan in de picture in plaats van vooraan, en hij is met
    // light getekend in plaats van met ditherRamp. Daarvóór werd hij als
    // dekkende veelhoek onder de kist en de dozen door geschoven: hij lag dus
    // achter de kamer in plaats van erop, en waar hij wél zichtbaar was, was
    // hij een oranje plaat. Nu valt hij op de kist — precies wat de
    // kamerbeschrijving belooft.
    ["light", 3, 0.80, [198, 78, 272, 78, 278, 100, 190, 100]],
    ["light", 3, 0.55, [190, 100, 278, 100, 286, 124, 178, 124]],
    ["light", 2, 0.60, [178, 124, 286, 124, 292, 146, 166, 146]],
    ["light", 2, 0.40, [166, 146, 292, 146, 300, 168, 152, 168]],
    ["light", 1, 0.55, [152, 168, 300, 168, 308, 189, 138, 189]],

    // Waar de straal de vloer haalt, is het hout warmer — maar laag gehouden:
    // de streep staat al bijna van de vloer af (zie de kamerbeschrijving).
    ["light", 1, 0.30, [150, 168, 300, 168, 308, 189, 136, 189]]
  ],

  // Beloopbare vloer. De strook loopt door tot de oostrand: dát is de uitgang,
  // en de speler steekt hem te voet over. Aan de westkant houdt ze op bij x6,
  // want daar staat geen doorgang maar een wand: zonder die marge liep de speler
  // het beeld uit en kreeg hij "Die kant kan je niet op" in een modaal venster,
  // ongeveer elke seconde. Een muur hoort te stoppen, niet te praten.
  walkboxes: [
    [6, 150, 314, 39]
  ],

  // Geen uitgangszones: de enige uitgang is de oostrand, en die doet de engine
  // met de randkruising (zie docs/scene-schema.md, §Uitgangen).
  exits: [],

  // De voetafdrukken van wat er op deze vloer staat. Niet de geschilderde
  // hoogte — de speler ís zijn voeten — maar het stuk vloer dat bezet is.
  //   dozen    de twee voorste stapels links, met hun contactschaduw (x10–111);
  //            de achterste stapel staat tegen de wand, vóór de loopstrook
  //   kist     de kist in het licht: geschilderd x176–215, y154–172, met haar
  //            contactschaduw tot y177
  // Ze lopen tot aan de bovenrand van de loopstrook, zodat de speler er ook niet
  // achterlangs kan: de kist en de dozen zitten in de gecachete achtergrond en
  // zouden hem dus nooit afdekken.
  blokken: [
    [10, 150, 102, 23],
    [176, 150, 40, 28]
  ],

  entries: {
    start: [80, 175],
    vanOost: [300, 175]
  },

  // Het notitieboek is nu een echte prop: een geblitte sprite op de kist, met
  // de pen ernaast. De engine sorteert props en speler op voet-y, dus de speler
  // loopt er netjes achter en voor langs.
  hotspots: [
    { item: "notitieboek", sprite: "notitieboek", x: 196, y: 157 }
  ],

  props: [],

  // Stof in de lichtstraal — de stijlgids vraagt er al om. Het waren tot nu toe
  // acht stilstaande pixels in de gecachete achtergrond; nu zakken ze echt.
  sfeer: [
    // De doos moet binnen de straal blijven. Ze stond te ver naar links: het
    // stof viel voor de helft op de donkere wand en las daar als vuil op het
    // scherm in plaats van als stof in het licht.
    { soort: "stof", x: 174, y: 82, b: 104, h: 104, aantal: 22, kleur: 34,
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
