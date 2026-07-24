// sprite-doos.js — de herbruikbare doos-prop (karton 25/26, schaduw 23, tape 22,
// label als inkt 41 op papier 36). Idle. Labels horen als overlay-tekst; de
// sprite suggereert ze met streepjes (art-stijlgids.md, §Sprite-specificaties:
// <=24x20).
//   0->0 outline  1->23 karton schaduw  2->26 karton warm  3->27 karton licht
//   4->41 inkt  5->36 papier
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["doos"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 23, 26, 27, 41, 36],
  anims: {

    "idle": { fps: 0, frames: [
        [
          "......................",
          "..000000000000000000..",
          ".03333333311333333330.",
          ".03333333311333333330.",
          ".02255555555222222220.",
          ".02254454545222222220.",
          ".02254545455222222220.",
          ".02222222211222222220.",
          ".01111111111111111110.",
          ".02222222211222222220.",
          ".02222222211222222220.",
          ".02222222211222222220.",
          ".02222222211222222220.",
          ".02222222211222222220.",
          ".01111111111111111110.",
          ".01111111111111111110.",
          ".01111111111111111110.",
          "..000000000000000000.."
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["doos"];
}
