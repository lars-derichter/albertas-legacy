// sprite-notitieboek.js — het beschadigde notitieboek op zolder-west, open op
// een dubbele bladzijde (papier-ramp 35–38, inkt 41, rug in vlekbruin 40). Idle.
// Anker voeten-midden. Aangepast uit remake-90s naar het sub-palet-formaat en de
// AL-namespace (art-stijlgids.md, §Sprite-specificaties: <=24x16).
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
          "..000000000000000000..",
          ".04444444411444444440.",
          ".04444444411444444440.",
          ".03555553311355555330.",
          ".03333333311333333330.",
          ".03555533311355533330.",
          ".03333333311333333330.",
          ".03555553311355553330.",
          ".03333333311333333330.",
          ".02222222222222222220.",
          ".02222222222222222220.",
          "..000000000000000000..",
          "......................"
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["notitieboek"];
}
