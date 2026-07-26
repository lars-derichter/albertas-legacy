// scene-diskette.js — de diskette, van dichtbij (WP 48c)
//
// De drager van de diskette-beat in de endgame: tussen Alberta's oordeel en de
// epiloog schrijft de pc de herstelde build weg naar A:\ en klik je de diskette
// uit de drive. Dit is dat beeld — geen kamer, maar een close-up-inzet, zoals
// de openingsbeelden dat zijn.
//
// Waarom een 3,5"-diskette en waarom zo groot in beeld: op vraag van de docent
// (workflow/48c-de-diskette.md). De broncode "lag" tot dan de hele tijd al op
// zolder; nu wordt ze pas op het einde geschreven, op het enige medium dat in
// deze fictie klopt — een HD-diskette van 1,44 MB. Ze vult het kader omdat ze
// het onderwerp ís: één voorwerp, in de hand, met haar handschrift erop.
//
// Wat de engine hier bovenop legt: de twee etiketregels in Alberta's hand
// (gfx.tekenHandschrift, uit AL.strings.endgame.diskette). Handschrift is geen
// picture-op — het staat in de renderlaag, net als de spread-inhoud.
//
// Palet (docs/art-stijlgids.md, §"Vaste toewijzingen"): het plastic komt uit de
// nacht-ramp (59 romp/schaduw, 60 face donker, 61 face licht, 62 rand rechts),
// de metalen sluiter uit de steen-ramp (48 gleuf, 49 bed, 51/52 blad, 53
// hooglicht), het etiket uit de papier-ramp (35 rand, 37/38 blad) met inkt 41.
// De achtergrond is koel en neutraal (48/49) zodat niets met het blauw van de
// diskette concurreert.
//
// Geen beloopbare kamer, maar met de verplichte walkbox en entry uit het
// scène-schema (zoals scene-eindkaart.js en de openingsbeelden), zodat de lint
// hem als gewone scène kan keuren.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["diskette"] = {
  id: "diskette",

  picture: [
    // ---- De achtergrond: donker, koel, en verder niets ---------------------
    // Een close-up-inzet mag geen kamer suggereren. Steen-ramp, van iets lichter
    // boven naar donker onder, met korrel zodat het geen egaal vlak is.
    ["gradient", 49, 48, 0, 8, 320, 182, "v"],
    ["noise", 48, 0.12, 81, [0, 8, 319, 8, 319, 189, 0, 189]],

    // ---- De diskette: de romp -----------------------------------------------
    // 130 × 112 px. Breder dan hoog, en dat is geen slordigheid: het canvas
    // staat in de verhouding van mode 13h (320 × 200 op 4:3), dus een pixel is
    // twintig procent hoger dan breed. Een diskette van 90 × 94 mm komt daarmee
    // uit op 130 × 112 px — vierkant op het scherm, niet vierkant in de buffer.
    // Op de maatregel van de stijlgids (1 px ≈ 5 cm) klopt de maat voor niets,
    // en dat is het punt: dit is geen kamer op schaal maar een voorwerp dat je
    // vasthoudt, zoals een inzetkader in een strip. De onderste vijftig pixels
    // van het beeld blijven vrij: daar komt de amberband van het wegschrijven,
    // en daarna het onderschrift.
    ["rect", 59, 95, 14, 130, 112],
    ["gradient", 60, 61, 97, 16, 126, 108, "h"],
    ["noise", 59, 0.06, 82, [97, 16, 222, 16, 222, 123, 97, 123]],
    // De afgeschuinde hoek rechtsboven — het detail waaraan je een 3,5"-diskette
    // herkent, ook als je er nooit een in handen had. Dertien breed op elf hoog,
    // om diezelfde pixelverhouding.
    ["poly", 49, [207, 14, 224, 14, 224, 29]],
    ["line", 61, [207, 14, 224, 29]],
    // De randen: licht van rechts, dus daar de rand die vangt, links en onder de
    // rand die zakt.
    ["line", 62, [223, 29, 223, 125]],
    ["line", 59, [95, 14, 95, 125]],
    ["line", 59, [95, 125, 224, 125]],

    // ---- De sluiter: het metalen schuifje, dicht ----------------------------
    // Naar rechts geschoven, zoals op een echte diskette met het etiket naar je
    // toe: de sluiter zit niet in het midden.
    ["rect", 49, 126, 14, 79, 40],
    ["gradient", 51, 52, 128, 14, 75, 37, "h"],
    // Het gestanste venster in het blad: waar de kop bij zou kunnen als de
    // sluiter openschuift. Dicht is het een ondiepe indruk, geen gat.
    ["rect", 50, 141, 20, 34, 22],
    ["shadow", 1, [141, 20, 174, 20, 174, 41, 141, 41]],
    ["line", 48, [141, 20, 174, 20]],
    // Het duimnokje links op het blad, en de randen van het blad zelf.
    ["rect", 48, 131, 18, 5, 26],
    ["line", 53, [202, 14, 202, 50]],
    ["line", 48, [128, 50, 202, 50]],
    ["line", 48, [126, 14, 126, 51]],

    // ---- De twee gaten onderaan --------------------------------------------
    // Links het schuifje van de schrijfbeveiliging (dicht: er mag geschreven
    // worden), rechts het vaste HD-gat dat de drive vertelt dat er 1,44 MB in
    // zit. Ze horen bij het silhouet net zo hard als de sluiter.
    ["rect", 48, 103, 110, 14, 12],
    ["rect", 51, 105, 112, 10, 6],
    ["line", 52, [105, 112, 114, 112]],
    ["rect", 48, 203, 110, 14, 12],
    ["line", 50, [216, 110, 216, 121]],
    // De greep tussen de twee gaten: twee ondiepe ribbels in het plastic.
    ["line", 59, [126, 115, 194, 115]],
    ["line", 61, [126, 116, 194, 116]],

    // ---- Het etiket: papier, en het ligt er scheef op -----------------------
    // Drie pixels verval over honderd pixels breedte. Meer leest als slordig
    // geplakt, minder ziet niemand — en het is precies genoeg dat het etiket op
    // het plastic lígt in plaats van erin gedrukt te zijn. De engine zet de twee
    // handschriftregels mee scheef (tekenDisketteEtiket in js/engine.js).
    ["poly", 35, [106, 56, 206, 59, 206, 106, 106, 103]],
    ["poly", 38, [108, 58, 204, 61, 204, 104, 108, 101]],
    ["noise", 37, 0.14, 83, [108, 58, 204, 61, 204, 104, 108, 101]],
    // Licht van rechts: de linkerhelft van het blad zakt een stap in de
    // papier-ramp.
    ["ditherRamp", 38, 37, 0.40, [108, 58, 150, 59, 150, 103, 108, 101]],
    ["ditherRamp", 37, 36, 0.30, [108, 58, 128, 59, 128, 102, 108, 101]],
    // De onderrand van het papier vangt schaduw op het plastic.
    ["shadow", 2, [108, 104, 205, 107, 205, 110, 108, 107]],

    // ---- Licht en schaduw, achteraan ---------------------------------------
    // Licht van rechts (de stijlgids-regel voor elke scène). Twee plakken over
    // de rechterhelft van het beeld, plus de slagschaduw die de diskette naar
    // links werpt. Ze staan achteraan, zodat alles waar het licht op valt in
    // zijn éigen ramp lichter wordt — het plastic blauwer, het papier witter.
    ["shadow", 2, [82, 126, 220, 126, 210, 141, 68, 141]],
    ["light", 2, 0.40, [214, 8, 319, 8, 319, 189, 176, 189]],
    ["light", 1, 0.25, [160, 8, 319, 8, 319, 189, 120, 189]],
    // En de randen van het beeld zakken weg in het donker: een inzet heeft geen
    // vier gelijk belichte hoeken nodig. Smal genoeg om als afdonkering te lezen
    // en niet als een tweede voorwerp in de hoek.
    ["shadow", 1, [0, 8, 26, 8, 18, 189, 0, 189]],
    ["shadow", 2, [0, 8, 14, 8, 8, 189, 0, 189]],
    ["shadow", 1, [0, 150, 319, 150, 319, 189, 0, 189]],
    ["shadow", 1, [0, 172, 319, 172, 319, 189, 0, 189]]
  ],

  walkboxes: [
    [0, 180, 320, 9]
  ],
  entries: {
    start: [160, 185]
  },

  hotspots: [],
  overlays: []
};

// Node-export voor tooling/tests.
if (typeof module !== "undefined") {
  module.exports = AL.scenes["diskette"];
}
