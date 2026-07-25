// scene-zolder-oost.js — Alberta's werkhoek: waar het codewerk gebeurt.
//
// De kamerbeschrijving noemt: een stoel die schuin voor het bureau staat alsof
// ze even is opgestaan, stof dat overal even dik ligt, een pc die het nog doet
// met een beige toren en een bolle monitor die warm oranje nagloeit, en een
// halfvolle mok naast het toetsenbord. Allemaal zichtbaar.
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
    // Een tweede staander rechts. De westhoek en de doorgang hebben er allebei
    // twee; hier stond er één, en dat maakte van de oostelijke helft van de
    // wand één ononderbroken vlak van honderdtwintig bij zeventig pixels.
    ["rect", 24, 276, 8, 12, 118],
    ["shadow", 1, [276, 8, 280, 8, 280, 126, 276, 126]],

    // ---- De rest van de werkhoek (WP 35b) ---------------------------------
    // Het bureau, de stoel, de pc en de mok blijven zoals WP 35 ze heeft
    // gezet — die groep is de kamer. Wat hier bij komt, staat eromheen: tegen
    // de wand links, en in de strook vloer tussen de wandlijn (y126) en de
    // loopstrook (y150). In die strook komt de speler niet, dus geen enkel
    // voorwerp hieronder heeft een blok nodig en er gaat geen loopruimte
    // verloren. Na de schaalpas was deze kamer correct én leeg: een bureau in
    // een lege loods.

    // Een prikbord met papier erop. In een werkhoek hoort dit ding; het is ook
    // het enige vlak op deze wand dat licht is, en dat trekt het oog naar links
    // zonder met de monitor te concurreren — hij staat aan de andere kant.
    ["rect", 23, 44, 68, 40, 28],
    ["rect", 39, 46, 70, 36, 24],
    ["rect", 37, 50, 74, 9, 7],
    ["rect", 36, 62, 73, 8, 10],
    ["rect", 38, 52, 84, 11, 7],
    ["rect", 35, 68, 86, 8, 6],
    ["px", 56, [[54, 74], [65, 73], [57, 84], [71, 86]]],
    ["shadow", 1, [44, 68, 48, 68, 48, 96, 44, 96]],
    // Eén stap over het hele bord: het hangt aan de dónkere kant van de kamer,
    // en op volle papierhelderheid trok het het oog weg bij de monitor — die is
    // de lichtbron hier, en dus hoort hij het lichtste vlak te blijven.
    ["shadow", 1, [44, 68, 84, 68, 84, 96, 44, 96]],
    ["shadow", 2, [44, 96, 84, 96, 84, 101, 44, 101]],

    // Een wandklok die het niet meer doet, tussen het prikbord en de plank. Ze
    // breekt de lege lap wand op ooghoogte; verder doet ze niets.
    ["ellipse", 50, 128, 80, 8, 8],
    ["ellipse", 52, 128, 80, 6, 6],
    ["px", 48, [[128, 76], [128, 77], [128, 78], [128, 79], [129, 80],
      [130, 80], [131, 80]]],
    ["px", 49, [[128, 74], [122, 80], [134, 80], [128, 86]]],
    ["shadow", 1, [120, 80, 124, 76, 124, 84, 120, 84]],
    ["shadow", 2, [120, 88, 136, 88, 136, 92, 120, 92]],

    // Een archiefkastje met drie laden en een tafelventilator erop. Zestien bij
    // vijfentwintig pixels: tachtig centimeter bij een meter vijfentwintig.
    ["rect", 49, 56, 124, 16, 25],
    ["line", 51, [56, 124, 71, 124]],
    ["line", 51, [71, 125, 71, 148]],
    ["line", 48, [57, 132, 70, 132]],
    ["line", 48, [57, 140, 70, 140]],
    ["rect", 51, 61, 129, 6, 2],
    ["rect", 51, 61, 137, 6, 2],
    ["rect", 51, 61, 145, 6, 2],
    ["shadow", 1, [56, 124, 60, 124, 60, 148, 56, 148]],
    ["ellipse", 50, 64, 116, 6, 6],
    ["ellipse", 49, 64, 116, 4, 4],
    ["ellipse", 51, 64, 116, 2, 2],
    ["rect", 49, 63, 120, 3, 3],
    ["ellipse", 50, 64, 123, 4, 1],
    ["shadow", 2, [52, 147, 76, 147, 78, 152, 50, 152]],

    // Een kader met de achterkant naar voren en een opgerold tapijt ernaast.
    ["rect", 22, 84, 128, 15, 19],
    ["rect", 24, 86, 130, 11, 15],
    ["line", 23, [86, 133, 96, 141]],
    ["rect", 23, 102, 124, 6, 23],
    ["ellipse", 24, 104, 124, 3, 2],
    ["line", 25, [107, 125, 107, 146]],
    ["shadow", 2, [80, 145, 112, 145, 116, 151, 76, 151]],

    // Een stapel dozen tegen de wand: dezelfde eenheid van 16 × 13 px als in de
    // andere drie kamers.
    ["rect", 25, 120, 121, 16, 13],
    ["rect", 26, 120, 134, 16, 13],
    ["rect", 25, 136, 134, 16, 13],
    ["shadow", 1, [120, 121, 126, 121, 126, 146, 120, 146]],
    ["line", 27, [120, 121, 135, 121]],
    ["line", 27, [136, 134, 151, 134]],
    ["line", 22, [120, 133, 135, 133]],
    ["line", 22, [120, 146, 151, 146]],
    ["shadow", 2, [116, 145, 156, 145, 160, 151, 112, 151]],

    // ---- Het bureau --------------------------------------------------------
    // Een oude werktafel: een blad met een dikke voorrand, twee poten en een
    // onderplank met papier. Vijftig pixels breed en veertien hoog boven zijn
    // eigen voetlijn — 2,5 bij 0,70 meter op de maatregel van de stijlgids
    // (1 px ≈ 5 cm).
    //
    // Tot de schaalpas van WP 35 stond hier een blad van 148 px breed (7,4 m)
    // met poten tot y174, dus 52 tot 58 px hoog: bijna drie meter. De speler
    // kwam er met zijn kruin niet boven, en de stoel paste er niet onder. Het
    // blad is nu een vlak dat naar achter wegloopt (y142–147), met de voorrand
    // op y148: dát is de hoogte die het oog als bureauhoogte leest, en ze ligt
    // veertien pixels boven de voetlijn op y162.
    ["gradient", 25, 26, 168, 142, 50, 6, "v"],
    ["line", 27, [168, 142, 217, 142]],
    ["rect", 23, 168, 148, 50, 3],
    ["line", 22, [168, 150, 217, 150]],
    // De poten in hout warm en niet in hout mid: op een vloer van dezelfde ramp
    // verdween een donkere poot, en dan hing het blad in de lucht.
    ["rect", 25, 172, 151, 4, 12],
    ["rect", 25, 210, 151, 4, 12],
    ["shadow", 1, [172, 151, 173, 151, 173, 162, 172, 162]],
    ["shadow", 1, [210, 151, 211, 151, 211, 162, 210, 162]],
    // De onderplank met papier erop. Ze ligt laag genoeg om niet met de zitting
    // van de stoel samen te vallen.
    ["rect", 24, 176, 158, 34, 3],
    ["rect", 35, 182, 156, 8, 3],
    ["rect", 36, 191, 157, 6, 2],
    ["shadow", 2, [164, 160, 222, 160, 228, 166, 158, 166]],

    // ---- Het toetsenbord en de mok, op het blad ----------------------------
    // Klein, want ze staan op een bureau van 2,5 m: een toetsenbord van 13 px
    // is 65 cm, een mok van 4 px is 20 cm. De mok stond hier op 14 × 16 px —
    // even breed als de speler en hoger dan het schermvlak van de monitor. Ze
    // mag ruim twee keer haar ware maat zijn, anders is ze niet meer als mok te
    // herkennen; dat is de leesbaarheidsuitzondering uit de stijlgids, en verder
    // gaat ze niet.
    ["rect", 36, 170, 143, 8, 3],
    ["rect", 51, 190, 143, 13, 3],
    ["px", 48, [[191, 143], [194, 143], [197, 143], [200, 143],
      [192, 145], [195, 145], [198, 145], [201, 145]]],
    ["shadow", 1, [190, 146, 203, 146, 203, 147, 190, 147]],
    // De mok: een cilindertje met een oor, en koffie erin. Op vier pixels is een
    // ronde rand een vlek — de rand is dus één rij, de schaduwkant één kolom.
    ["rect", 52, 182, 139, 4, 4],
    ["px", 23, [[183, 139], [184, 139]]],
    ["px", 53, [[185, 140]]],
    ["px", 50, [[182, 140], [182, 141], [182, 142]]],
    ["px", 52, [[186, 140], [186, 141]]],
    ["shadow", 1, [181, 142, 187, 142, 187, 144, 181, 144]],

    // ---- Een plank met mappen boven het bureau -----------------------------
    // Ná het bureau in de opsomming, want ze hangt ervóór in het beeld. Ze valt
    // binnen de gloedkoepels van de monitor (die staan achteraan), dus de
    // mappen krijgen dezelfde amberrand als het blad eronder: zo hoort de plank
    // bij de werkplek in plaats van ergens los aan de wand te hangen.
    ["rect", 24, 162, 112, 60, 3],
    ["line", 27, [162, 112, 221, 112]],
    ["rect", 23, 168, 115, 2, 5],
    ["rect", 23, 214, 115, 2, 5],
    ["shadow", 2, [162, 115, 221, 115, 221, 120, 162, 120]],
    ["rect", 35, 166, 100, 4, 12],
    ["rect", 50, 171, 101, 4, 11],
    ["rect", 31, 176, 99, 5, 13],
    ["rect", 36, 182, 101, 4, 11],
    ["rect", 49, 187, 100, 4, 12],
    ["rect", 39, 192, 102, 3, 10],
    ["px", 41, [[167, 104], [172, 105], [177, 103], [183, 105], [188, 104]]],
    ["rect", 24, 200, 102, 14, 10],
    ["line", 26, [213, 102, 213, 111]],

    // ---- Alberta's andere hoek: het naaitafeltje ---------------------------
    // Rechts van de pc, tegen de wand: een tafeltje van 34 × 16 px (1,70 m bij
    // 0,80 m) met haar naaimachine erop. De machine is een C: voetstuk, zuil,
    // arm. Op twintig pixels breed is dat silhouet alles wat ze is.
    ["gradient", 26, 27, 236, 133, 34, 4, "v"],
    ["rect", 23, 236, 137, 34, 2],
    ["rect", 24, 239, 139, 3, 10],
    ["rect", 24, 265, 139, 3, 10],
    ["rect", 48, 242, 129, 22, 4],
    ["rect", 49, 256, 121, 6, 9],
    ["rect", 49, 244, 121, 14, 4],
    ["rect", 48, 245, 125, 2, 4],
    ["ellipse", 51, 263, 124, 3, 3],
    ["line", 51, [244, 121, 257, 121]],
    ["px", 56, [[248, 131], [252, 131], [256, 131]]],
    ["shadow", 1, [242, 129, 245, 129, 245, 132, 242, 132]],
    ["shadow", 2, [232, 147, 274, 147, 278, 152, 228, 152]],
    // Een plankje met garenklosjes erboven: wat op een naaitafel hoort, hoort
    // er ook boven te hangen.
    ["rect", 24, 240, 104, 36, 3],
    ["line", 27, [240, 104, 275, 104]],
    ["shadow", 2, [240, 107, 275, 107, 275, 111, 240, 111]],
    ["rect", 44, 244, 99, 3, 5],
    ["rect", 31, 249, 99, 3, 5],
    ["rect", 50, 254, 99, 3, 5],
    ["rect", 39, 259, 99, 3, 5],
    ["rect", 35, 264, 98, 4, 6],

    // Nog een stapel in de rechterhoek: de werkhoek loopt door tot tegen de
    // oostwand, en die stond leeg.
    ["rect", 25, 284, 121, 16, 13],
    ["rect", 26, 284, 134, 16, 13],
    ["rect", 25, 300, 134, 16, 13],
    ["shadow", 1, [284, 121, 290, 121, 290, 146, 284, 146]],
    ["line", 27, [284, 121, 299, 121]],
    ["line", 27, [300, 134, 315, 134]],
    ["line", 22, [284, 133, 299, 133]],
    ["line", 22, [284, 146, 315, 146]],
    ["shadow", 2, [280, 145, 319, 145, 319, 151, 276, 151]],

    // ---- Naar het westen ---------------------------------------------------
    ["gradient", 28, 29, 0, 56, 20, 70, "h"],
    ["line", 23, [20, 56, 20, 126]],

    // ---- De laatste veeg dakraamlicht, links -------------------------------
    // Het dakraam zelf zit in de westhoek; hier komt er nog net iets van binnen.
    //
    // Met light, en achteraan in de picture. Als dekkende veelhoek was dit de
    // ergste van de drie: de wig liep over de houten vloer heen en verfde die
    // lavendel, zodat er linksonder een gestippelde rechthoek in de kamer stond
    // die nergens op sloeg. Nu wordt het hout gewoon een tint lichter hout.
    ["light", 2, 0.45, [0, 60, 30, 60, 74, 189, 0, 189]],
    ["light", 1, 0.35, [30, 60, 56, 60, 116, 189, 74, 189]],

    // ---- De gloed van de monitor -------------------------------------------
    // Rond, want licht is rond, en in dalende kracht naar buiten toe. De
    // koepels staan plat op het bureaublad (y143), zodat de gloed niet over het
    // hout uitwaaiert alsof er iets gemorst is.
    //
    // Twee eerdere versies zijn hier gesneuveld en allebei om iets wat het
    // waard is te onthouden. Eerst een ellips in gloed-bruin (54): amber op een
    // paarse wand is geen licht maar een bruin gat — een gloed hoort in de ramp
    // van het oppervlak waar hij op valt, niet in die van de lamp. Daarna
    // ellipsen in de avond-ramp: beter, maar een ellips in een vlakke kleur
    // heeft een rand, en die rand las als een geschilderde koepel. Met light
    // ligt de gloed niet óp de wand maar ín de wand: de wand wordt gewoon
    // lichter waar het scherm hem haalt, en de Bayer-dichtheid laat de rand
    // uitdoven in plaats van ophouden.
    //
    // Ze staan bewust helemaal achteraan, na het bureau: zo baadt het blad met
    // het toetsenbord en de mok er echt in. Daarvóór stond de gloed vóór het
    // bureau in de opsomming en werd hij er dus door overschilderd.
    // Vijf koepels, niet twee: bij twee blijft de buitenste rand een zichtbare
    // boog, want binnen de veelhoek wordt precies dertig procent opgelicht en
    // erbuiten niets. Elke koepel telt op bij de vorige, dus met vijf oplopende
    // dichtheden dooft de gloed vanzelf naar buiten uit en heeft geen enkele
    // rand nog een sprong.
    // De koepels zijn met het scherm meegekrompen (WP 35): een monitor van een
    // halve meter zet geen gloed van tweehonderd pixels breed op de wand. Ze
    // staan nu plat op het bureaublad (y143) en om het schermvlak van de
    // pc-sprite heen, die op x208 staat.
    ["light", 1, 0.12, [158, 143, 162, 126, 174, 110, 190, 98, 208, 94,
      226, 98, 242, 110, 254, 126, 258, 143]],
    ["light", 1, 0.20, [170, 143, 173, 129, 183, 116, 196, 107, 208, 104,
      220, 107, 233, 116, 243, 129, 246, 143]],
    ["light", 1, 0.30, [180, 143, 183, 132, 191, 122, 200, 115, 208, 113,
      216, 115, 225, 122, 233, 132, 236, 143]],
    ["light", 1, 0.42, [190, 143, 192, 135, 198, 128, 204, 124, 208, 123,
      212, 124, 218, 128, 224, 135, 226, 143]],
    ["light", 1, 0.55, [197, 143, 199, 138, 203, 133, 206, 131, 208, 130,
      210, 131, 213, 133, 217, 138, 219, 143]],
    // Wat onder het scherm ligt — het blad, het toetsenbord, de mok, de vloer —
    // krijgt één zachte stap, en niet vijf: anders wordt een beige toetsenbord
    // wit.
    ["light", 1, 0.28, [176, 140, 240, 140, 252, 174, 164, 174]]
  ],

  // De strook loopt tot x0 — dat is de doorgang naar het westen — maar houdt aan
  // de oostkant op bij x311: daar staat een wand, en tegen een wand aan lopen
  // hoort te stoppen en niet een venster te openen.
  walkboxes: [
    [0, 150, 312, 39]
  ],

  exits: [],

  // Het bureau (x168–217, poten tot y162) en de stoel ervoor (sprite-voet y162,
  // met haar poten en contactschaduw tot y166) staan op één stuk vloer; één blok
  // dekt ze allebei. Het loopt tot de bovenrand van de strook, want het bureau
  // is geschilderd en kan de speler dus nooit afdekken.
  //
  // Het blok is vier pixels dieper dan de bureaupoten. Dat is de vloer waar de
  // stoel staat: wie eromheen loopt, loopt er ook echt omheen. Het houdt de
  // speler bovendien ver genoeg voor het bureau om de monitor niet af te dekken.
  blokken: [
    [168, 150, 50, 17]
  ],

  entries: {
    start: [240, 175],
    vanWest: [20, 175]
  },

  // De pc op het bureau (aan), en de stoel ervoor. Allebei worden ze met de
  // diepte mee geschaald, net als de speler (WP 35): de pc staat achteraan op
  // het blad en komt dus als 15 × 13 in beeld, de stoel vooraan als 11 × 17.
  //
  // De stoel staat op de voetlijn van het bureau (y162), maar niet vierkant
  // voor de machine: tien pixels naar links, uit de as van de monitor. Dat is
  // het "schuin voor het bureau" van de kamerbeschrijving, en het houdt het
  // toetsenbord zichtbaar in plaats van achter een rugleuning. Het is
  // ook de plek waar de engine de speler neerzet als hij gaat zitten
  // (`startZitten`), zodat zijn handen op de voorrand van het blad uitkomen.
  hotspots: [
    { item: "pc", sprite: "pc", anim: "aan", x: 208, y: 143 },
    { item: "stoel", sprite: "stoel", x: 186, y: 162 }
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
