// sprite-stoel.js — Alberta's lege bureaustoel op zolder-oost: sfeer-prop, 'net
// verlaten' (hout-ramp 23/24, zitting in koelgrijs 50/52). Idle. Anker
// voeten-midden (art-stijlgids.md, §Sprite-specificaties: <=20x28).
//   0->0 outline  1->23 hout schaduw  2->24 hout mid  3->50 zitting  4->52 zitting hoog
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["stoel"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 23, 24, 50, 52],
  anims: {

    "idle": { fps: 0, frames: [
        [
          "....0000000000....",
          "...011111111110...",
          "...011111111110...",
          "...022222222220...",
          "...022221222220...",
          "...022222222220...",
          "...022221222220...",
          "...022222222220...",
          "...022221222220...",
          "...022222222220...",
          "...022222222220...",
          "...000000000000...",
          "..04444444444440..",
          "..03333333333330..",
          "..03333333333330..",
          "..01111111111110..",
          "...022000000220...",
          "...0220....0220...",
          "...0220....0220...",
          "...0220....0220...",
          "...0220....0220...",
          "...0220....0220...",
          "...0220....0220...",
          "...0110....0110...",
          "....00......00....",
          ".................."
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["stoel"];
}
