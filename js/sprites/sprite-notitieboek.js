// sprite-notitieboek.js — het beschadigde notitieboek op zolder-west, open op
// een dubbele bladzijde (papier-ramp 35–38, inkt 41, rug in vlekbruin 40). Idle.
// Anker voeten-midden. Aangepast uit remake-90s naar het sub-palet-formaat en de
// AL-namespace (art-stijlgids.md, §Sprite-specificaties: <=20x12).
//
// Maat, na de schaalpas van WP 35: 16 × 10, op de kist geblit als 14 × 9. Een
// opengeslagen A4-schrift is in werkelijkheid 8 × 6 px; dit is dus bijna twee
// keer te groot, en dat is bewust. Het notitieboek is het voorwerp waar het
// hele spel om draait: op ware schaal is het een beige veeg van acht pixels
// waarop geen bladzijde meer te zien is. De uitzondering staat in de stijlgids.
//   0->0 outline  1->40 rug/vlek  2->35 papier schaduw  3->37 papier licht
//   4->38 papier hoog  5->41 inkt
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["notitieboek"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 40, 35, 37, 38, 41],
  anims: {

    "idle": { fps: 0, frames: [
        [
          "..000000000000..",
          ".04444411444440.",
          ".03555311355530.",
          ".03333311333330.",
          ".03555311355530.",
          ".03333311333330.",
          ".03555311355530.",
          ".02222222222220.",
          "..000000000000..",
          "................"
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["notitieboek"];
}
