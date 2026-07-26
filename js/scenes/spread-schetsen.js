// spread-schetsen.js — Alberta's tekeningen in de kantlijn, en de schade op het
// papier. Eén set per level.
//
// Waarom dit bestand bestaat: `docs/spelontwerp-legacy.md` zegt dat de spreads
// "de meeste nieuwe beelden" dragen, en `docs/art-stijlgids.md` somt per level
// een schets op die de scharnier-metafoor spiegelt — blauwdruk-en-doos,
// trechters, knikkerbaan, twee pijlen, patroonkaart, plankenbrug, dubbele pijl.
// Dat is de metafoor-woordenschat van de cursus; sinds WP 31 dragen de
// hoofdstukken zelf een titel met de scharnierterm vooraan. De schetsen tonen
// nog altijd het beeld, want dat is wat Alberta in de kantlijn tekende.
// Er stond er tot nu toe geen enkele in het spel. De zeven spreads deelden ook
// één papierachtergrond, met dezelfde koffievlek op dezelfde plek, terwijl de
// stijlgids beschadiging vraagt "precies waar de puzzel zit" — de vlek hoort de
// ontbrekende code te verklaren, en verschilt dus per level.
//
// Het is bewust géén scène (vandaar de bestandsnaam zonder het voorvoegsel
// `scene-`: de scène-lint verzamelt alleen `scene-*.js`). Een schets heeft geen
// walkbox, geen entries en geen hotspots; het is een blok draw-ops dat de
// spread-renderer binnen een vast kader neerzet. `tools/lint-scene.mjs` keurt ze
// wél mee, in een eigen pas — een paar honderd met de hand geplaatste draw-ops
// wil je niet ongekeurd laten.
//
// Het kader waarbinnen een schets valt is AL.spreads.BLAD.schets: de onderste
// helft van de rechterbladzijde, x 170–298, y 100–162. Alle coördinaten
// hieronder staan absoluut, want een op-lijst kent geen oorsprong.
//
// Tekenstijl: inkt (41) voor de lijn die telt, 40 voor wat lichter is
// aangezet — arcering, hulplijnen, maatstreepjes. Spaarzame kleur volgens de
// stijlgids: 12 voor een rode doorhaling, 44 voor een groen vinkje. Verder
// niets. Het is een balpen op papier, geen illustratie.

globalThis.AL = globalThis.AL || {};

AL.spreadSchetsen = {

  // ---- Level 1 — schets: de blauwdruk en de doos ------------------------
  // Links het plan (gestippeld, want het is een tekening van iets), rechts het
  // ding zelf (doorgetrokken, met een deksel en twee ingevulde velden). De pijl
  // ertussen is het hele scharnier: van klasse naar object.
  l1: {
    schets: [
      // De blauwdruk: een gestippeld kader.
      ["px", 41, [[172, 104], [176, 104], [180, 104], [184, 104], [188, 104],
        [192, 104], [196, 104], [200, 104], [204, 104], [208, 104], [212, 104],
        [172, 146], [176, 146], [180, 146], [184, 146], [188, 146], [192, 146],
        [196, 146], [200, 146], [204, 146], [208, 146], [212, 146],
        [172, 108], [172, 112], [172, 116], [172, 120], [172, 124], [172, 128],
        [172, 132], [172, 136], [172, 140], [172, 144],
        [212, 108], [212, 112], [212, 116], [212, 120], [212, 124], [212, 128],
        [212, 132], [212, 136], [212, 140], [212, 144]]],
      // De tekening óp de blauwdruk: dezelfde doos, maar in dunne lijn.
      ["line", 40, [180, 120, 204, 120]],
      ["line", 40, [180, 120, 180, 138]],
      ["line", 40, [204, 120, 204, 138]],
      ["line", 40, [180, 138, 204, 138]],
      ["line", 40, [180, 126, 204, 126]],
      ["line", 40, [180, 132, 204, 132]],
      // Maatstreepjes, zoals op een echte blauwdruk.
      ["line", 40, [176, 116, 176, 142]],
      ["line", 40, [174, 116, 178, 116]],
      ["line", 40, [174, 142, 178, 142]],
      // De pijl: bouw dit.
      ["line", 41, [218, 126, 234, 126]],
      ["line", 41, [230, 122, 234, 126]],
      ["line", 41, [230, 130, 234, 126]],
      // De doos zelf, in driekwart. Het bovenvlak in papierkleur, zodat het
      // deksel als een vlak leest en niet als nog een lijnenkluwen.
      ["poly", 38, [244, 116, 284, 116, 292, 108, 252, 108]],
      ["line", 41, [244, 116, 284, 116]],
      ["line", 41, [244, 116, 252, 108]],
      ["line", 41, [252, 108, 292, 108]],
      ["line", 41, [284, 116, 292, 108]],
      ["line", 41, [244, 116, 244, 148]],
      ["line", 41, [284, 116, 284, 148]],
      ["line", 41, [244, 148, 284, 148]],
      ["line", 41, [292, 108, 292, 140]],
      ["line", 41, [284, 148, 292, 140]],
      // De velden, ingevuld: dat is wat de constructor doet. In 39 en niet in
      // 40, want de vlek die er straks overheen komt is óók 40 — twee dingen in
      // dezelfde kleur op dezelfde plek worden samen één modderige veeg.
      ["rect", 39, 250, 124, 28, 3],
      ["rect", 39, 250, 132, 20, 3]
    ],
    // De koffiering staat op de doos, niet ernaast: de constructor is half
    // ingevuld, en dít is waarom.
    schade: [
      ["noise", 39, 0.20, 101, [252, 122, 288, 118, 296, 134, 288, 150,
        264, 152, 250, 142]],
      ["noise", 40, 0.10, 102, [256, 126, 284, 124, 290, 136, 282, 146,
        266, 147, 254, 140]],
      ["px", 40, [[252, 130], [253, 124], [262, 119], [276, 118], [288, 124],
        [294, 136], [286, 149], [270, 152], [256, 148]]]
    ]
  },

  // ---- Level 2 — schets: trechters erin, goot eruit ----------------------
  // Een machine met twee trechters bovenop (de parameters) en één goot opzij
  // (de return). Ernaast, kleiner, dezelfde machine zónder goot: void.
  l2: {
    schets: [
      // Twee trechters.
      ["line", 41, [200, 102, 222, 102]],
      ["line", 41, [200, 102, 208, 116]],
      ["line", 41, [222, 102, 214, 116]],
      ["line", 41, [208, 116, 214, 116]],
      ["line", 41, [228, 102, 250, 102]],
      ["line", 41, [228, 102, 236, 116]],
      ["line", 41, [250, 102, 242, 116]],
      ["line", 41, [236, 116, 242, 116]],
      // De machine.
      ["line", 41, [192, 116, 260, 116]],
      ["line", 41, [192, 116, 192, 146]],
      ["line", 41, [260, 116, 260, 146]],
      ["line", 41, [192, 146, 260, 146]],
      ["noise", 40, 0.09, 104, [194, 118, 258, 118, 258, 144, 194, 144]],
      // Een tandwiel binnenin, want een machine hoort te draaien.
      ["ellipse", 41, 226, 131, 10, 9],
      ["ellipse", 38, 226, 131, 6, 5],
      ["ellipse", 41, 226, 131, 2, 2],
      ["px", 41, [[226, 121], [226, 141], [216, 131], [236, 131],
        [219, 124], [233, 138], [233, 124], [219, 138]]],
      // De goot, met een druppel eraf.
      ["line", 41, [260, 128, 288, 137]],
      ["line", 41, [260, 137, 285, 145]],
      ["line", 41, [285, 145, 288, 137]],
      ["px", 41, [[288, 150], [287, 152], [288, 154], [289, 152]]],
      // En de void-variant: hetzelfde blok, geen goot, doorgestreept.
      ["line", 40, [172, 152, 196, 152]],
      ["line", 40, [172, 152, 172, 162]],
      ["line", 40, [196, 152, 196, 162]],
      ["line", 40, [172, 162, 196, 162]],
      ["line", 12, [198, 152, 208, 162]],
      ["line", 12, [208, 152, 198, 162]]
    ],
    // Waterschade rechtsboven: de goot is aangevreten, en dat is precies de
    // helft van de signatuur die de speler moet terugzetten.
    schade: [
      ["noise", 39, 0.20, 105, [252, 100, 292, 102, 298, 118, 288, 132,
        266, 130, 250, 116]],
      ["noise", 40, 0.09, 106, [258, 104, 288, 106, 292, 118, 284, 126,
        268, 125, 256, 114]],
      ["px", 40, [[250, 110], [254, 101], [268, 99], [284, 101], [295, 112],
        [290, 128], [272, 132], [256, 126]]]
    ]
  },

  // ---- Level 3 — schets: de knikkerbaan ----------------------------------
  // Een goot met twee klemmen erin (de validatie), en verderop een splitsing
  // (de cascade). De knikker ligt tegen de onderste klem.
  l3: {
    schets: [
      // De baan: twee randen.
      ["line", 41, [170, 104, 234, 130]],
      ["line", 40, [170, 110, 234, 136]],
      // De klem: onder- en bovengrens.
      ["line", 41, [190, 108, 190, 122]],
      ["line", 41, [188, 108, 192, 108]],
      ["line", 41, [210, 116, 210, 130]],
      ["line", 41, [208, 116, 212, 116]],
      // De knikker, met een hooglicht.
      ["ellipse", 41, 200, 119, 5, 5],
      ["ellipse", 38, 200, 119, 3, 3],
      ["px", 41, [[199, 121], [201, 121], [200, 122]]],
      // De splitsing.
      ["ellipse", 41, 236, 133, 2, 2],
      ["line", 41, [236, 131, 276, 112]],
      ["line", 40, [236, 136, 272, 118]],
      ["line", 41, [236, 136, 278, 154]],
      ["line", 40, [234, 141, 274, 158]],
      // Twee uitkomsten, als streepjes gemerkt — dit is een schets, geen tekst.
      ["px", 40, [[280, 108], [284, 108], [288, 108],
        [282, 158], [286, 158], [290, 158], [294, 158]]],
      // De operatoren in de kantlijn: && als twee streepjes, || als twee palen.
      ["px", 41, [[174, 148], [174, 150], [174, 152], [174, 154],
        [178, 148], [178, 150], [178, 152], [178, 154]]],
      ["line", 41, [186, 148, 186, 154]],
      ["line", 41, [190, 148, 190, 154]],
      ["line", 12, [198, 148, 206, 156]],
      ["line", 12, [206, 148, 198, 156]]
    ],
    // Een lange veeg dwars over de klem: de plek waar de grenzen stonden.
    schade: [
      ["noise", 39, 0.13, 108, [178, 100, 200, 104, 226, 132, 232, 150,
        222, 156, 206, 138, 182, 114]],
      ["noise", 40, 0.06, 109, [184, 104, 198, 108, 220, 132, 224, 146,
        216, 148, 200, 132, 186, 114]]
    ]
  },

  // ---- Level 4 — schets: twee pijlen, één doos ---------------------------
  // Twee variabelen die naar hetzelfde object wijzen, en eronder een derde die
  // nergens heen wijst. Het rode kruis is de enige kleur op de bladzijde.
  l4: {
    schets: [
      ["line", 41, [172, 104, 190, 104]],
      ["line", 41, [172, 104, 172, 116]],
      ["line", 41, [190, 104, 190, 116]],
      ["line", 41, [172, 116, 190, 116]],
      ["line", 41, [172, 124, 190, 124]],
      ["line", 41, [172, 124, 172, 136]],
      ["line", 41, [190, 124, 190, 136]],
      ["line", 41, [172, 136, 190, 136]],
      // De twee pijlen, naar dezelfde doos.
      ["line", 41, [192, 110, 226, 116]],
      ["line", 41, [220, 112, 226, 116]],
      ["line", 41, [221, 119, 226, 116]],
      ["line", 41, [192, 130, 226, 122]],
      ["line", 41, [220, 118, 226, 122]],
      ["line", 41, [221, 125, 226, 122]],
      // De doos waar ze allebei naar wijzen.
      ["line", 41, [228, 104, 272, 104]],
      ["line", 41, [228, 104, 228, 136]],
      ["line", 41, [272, 104, 272, 136]],
      ["line", 41, [228, 136, 272, 136]],
      ["line", 40, [234, 114, 266, 114]],
      ["line", 40, [234, 122, 258, 122]],
      ["line", 40, [234, 130, 262, 130]],
      // En null: een pijl die op niets uitkomt.
      ["line", 41, [172, 146, 190, 146]],
      ["line", 41, [172, 146, 172, 158]],
      ["line", 41, [190, 146, 190, 158]],
      ["line", 41, [172, 158, 190, 158]],
      ["line", 41, [192, 152, 212, 152]],
      ["line", 12, [216, 147, 226, 157]],
      ["line", 12, [226, 147, 216, 157]]
    ],
    // Een inktvlek over de pijlen: de bedrading is niet meer te lezen.
    schade: [
      ["noise", 40, 0.18, 111, [194, 108, 216, 104, 230, 116, 226, 130,
        208, 134, 194, 124]],
      ["noise", 41, 0.07, 112, [200, 112, 216, 110, 224, 118, 220, 128,
        208, 130, 199, 122]],
      ["px", 41, [[192, 136], [196, 139], [190, 141], [198, 143]]]
    ]
  },

  // ---- Level 5 — schets: de patroonkaart ---------------------------------
  // Een stapeltje kaarten met de bovenste opgeslagen: turfjes, want "tellen" is
  // de eerste kaart van de vijf.
  l5: {
    schets: [
      // Twee kaarten die onder de bovenste uitsteken.
      ["line", 40, [186, 102, 258, 102]],
      ["line", 40, [258, 102, 258, 142]],
      ["line", 40, [182, 108, 254, 108]],
      ["line", 40, [254, 108, 254, 148]],
      // De bovenste kaart, met een eigen papiervlak zodat ze bovenop ligt.
      ["rect", 38, 176, 114, 76, 40],
      ["line", 41, [176, 114, 252, 114]],
      ["line", 41, [176, 114, 176, 154]],
      ["line", 41, [252, 114, 252, 154]],
      ["line", 41, [176, 154, 252, 154]],
      ["line", 40, [176, 122, 252, 122]],
      // Turfjes: vier palen en een schuine streep erdoor.
      ["line", 41, [184, 130, 184, 142]],
      ["line", 41, [190, 130, 190, 142]],
      ["line", 41, [196, 130, 196, 142]],
      ["line", 41, [202, 130, 202, 142]],
      ["line", 41, [181, 142, 205, 130]],
      // Een tweede groepje, nog niet af.
      ["line", 41, [218, 130, 218, 142]],
      ["line", 41, [224, 130, 224, 142]],
      // Het groene vinkje: deze kaart is gekozen.
      ["line", 44, [262, 130, 268, 138]],
      ["line", 44, [268, 138, 280, 120]]
    ],
    // De scheur loopt door de onderste turfjes: de romp die eronder stond, is
    // weg. Dat is precies de puzzel.
    schade: [
      ["noise", 39, 0.20, 114, [178, 140, 214, 136, 232, 148, 226, 162,
        196, 162, 178, 154]],
      ["noise", 40, 0.09, 115, [184, 144, 210, 141, 224, 150, 218, 158,
        198, 158, 184, 152]],
      ["line", 40, [176, 150, 190, 145]],
      ["line", 40, [190, 145, 206, 152]],
      ["line", 40, [206, 152, 224, 146]]
    ]
  },

  // ---- Level 6 — schets: de plankenbrug boven het ravijn -----------------
  // Vijf planken tussen twee rotswanden, genummerd met stipjes vanaf nul. Er
  // ligt er één in het ravijn: die is er één te ver gegaan.
  l6: {
    schets: [
      // De twee rotswanden.
      ["poly", 40, [170, 130, 190, 130, 190, 162, 170, 162]],
      ["line", 41, [170, 130, 190, 130]],
      ["line", 41, [190, 130, 190, 162]],
      ["poly", 40, [278, 130, 298, 130, 298, 162, 278, 162]],
      ["line", 41, [278, 130, 298, 130]],
      ["line", 41, [278, 130, 278, 162]],
      // Het ravijn: arcering, want daar is niets.
      ["noise", 40, 0.13, 117, [190, 138, 278, 138, 278, 162, 190, 162]],
      // De planken.
      ["rect", 41, 192, 126, 14, 3],
      ["rect", 41, 210, 126, 14, 3],
      ["rect", 41, 228, 126, 14, 3],
      ["rect", 41, 246, 126, 14, 3],
      ["rect", 41, 264, 126, 14, 3],
      // De nummering: nul stipjes, één, twee, drie, vier.
      ["px", 40, [[216, 134],
        [232, 134], [236, 134],
        [250, 134], [254, 134], [258, 134],
        [267, 134], [271, 134], [275, 134], [279, 134]]],
      // De plank die er één te ver ging.
      ["poly", 41, [244, 148, 258, 154, 256, 157, 242, 151]],
      ["px", 40, [[240, 143], [246, 145], [252, 143]]],
      // De eerste plank is nummer nul: een nul in de kantlijn, als cirkeltje.
      ["ellipse", 41, 198, 118, 4, 3],
      ["ellipse", 38, 198, 118, 2, 1]
    ],
    // Een brede waterschade over de rechterhelft van de brug: waar de laatste
    // planken genummerd stonden, staat nu niets meer.
    schade: [
      ["noise", 39, 0.19, 118, [238, 112, 284, 108, 298, 126, 292, 146,
        260, 150, 236, 134]],
      ["noise", 40, 0.09, 119, [246, 116, 280, 113, 292, 127, 286, 142,
        262, 145, 244, 132]],
      ["px", 40, [[236, 122], [242, 111], [262, 107], [284, 110],
        [297, 128], [289, 148], [262, 152], [238, 140]]]
    ]
  },

  // ---- Level 7 — schets: de speurtocht en de dubbele pijl ----------------
  // Boven: een stippelspoor langs drie dozen, met de gevonden doos omcirkeld.
  // Onder: de keten, twee pijlen achter elkaar.
  l7: {
    schets: [
      // Het groene rondje eerst, zodat de doos er straks bovenop staat.
      ["ellipse", 44, 240, 109, 13, 10],
      ["ellipse", 38, 240, 109, 11, 8],
      // Drie dozen op het spoor.
      ["rect", 38, 172, 104, 16, 11],
      ["line", 41, [172, 104, 188, 104]],
      ["line", 41, [172, 104, 172, 115]],
      ["line", 41, [188, 104, 188, 115]],
      ["line", 41, [172, 115, 188, 115]],
      ["rect", 38, 204, 104, 16, 11],
      ["line", 41, [204, 104, 220, 104]],
      ["line", 41, [204, 104, 204, 115]],
      ["line", 41, [220, 104, 220, 115]],
      ["line", 41, [204, 115, 220, 115]],
      ["rect", 38, 232, 104, 16, 11],
      ["line", 41, [232, 104, 248, 104]],
      ["line", 41, [232, 104, 232, 115]],
      ["line", 41, [248, 104, 248, 115]],
      ["line", 41, [232, 115, 248, 115]],
      // Het spoor ertussen: stipjes, want zoeken gaat met stappen.
      ["px", 40, [[191, 110], [194, 110], [197, 110], [200, 110],
        [223, 110], [226, 110], [229, 110]]],
      // En de tak die op niets uitkomt: null.
      ["px", 40, [[254, 110], [257, 110], [260, 110], [263, 110]]],
      ["line", 12, [266, 105, 276, 115]],
      ["line", 12, [276, 105, 266, 115]],

      // De keten: doos, pijl, doos, pijl, en dan pas de naam.
      ["line", 41, [174, 132, 198, 132]],
      ["line", 41, [174, 132, 174, 148]],
      ["line", 41, [198, 132, 198, 148]],
      ["line", 41, [174, 148, 198, 148]],
      ["line", 41, [200, 140, 216, 140]],
      ["line", 41, [212, 137, 216, 140]],
      ["line", 41, [212, 143, 216, 140]],
      ["line", 41, [218, 132, 248, 132]],
      ["line", 41, [218, 132, 218, 148]],
      ["line", 41, [248, 132, 248, 148]],
      ["line", 41, [218, 148, 248, 148]],
      ["line", 41, [250, 140, 266, 140]],
      ["line", 41, [262, 137, 266, 140]],
      ["line", 41, [262, 143, 266, 140]],
      // De naam aan het eind, als twee schrijfstreepjes.
      ["line", 40, [270, 137, 294, 137]],
      ["line", 40, [270, 142, 288, 142]]
    ],
    // Een ring met drupsporen over het tweede lid van de keten: de tweede pijl
    // is niet meer te lezen, en dat is waar de speler null-veilig moet worden.
    schade: [
      ["noise", 39, 0.20, 121, [214, 126, 252, 124, 262, 140, 254, 156,
        228, 158, 212, 142]],
      ["noise", 40, 0.10, 122, [220, 130, 248, 128, 256, 140, 249, 151,
        230, 152, 218, 141]],
      ["px", 40, [[212, 134], [218, 125], [236, 123], [252, 126],
        [261, 141], [252, 156], [232, 159], [214, 149],
        [206, 160], [204, 164], [208, 166]]]
    ]
  }
};

// Node-export, zodat tools/lint-scene.mjs en de tests erbij kunnen.
if (typeof module !== "undefined") {
  module.exports = AL.spreadSchetsen;
}
