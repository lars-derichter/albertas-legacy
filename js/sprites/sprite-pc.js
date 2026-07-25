// sprite-pc.js — Alberta's pc op zolder-oost: een beige toren met een bolle
// monitor (beige 50–52). 'idle' = donker scherm (steen 49); 'aan' = amber CRT
// (gloed-ramp 55/56, schermwit 58). Anker voeten-midden (art-stijlgids.md,
// §Sprite-specificaties: <=20x18).
//
// Maat, na de schaalpas van WP 35 (de maatregel 1 px ≈ 5 cm): 18 × 16, tien
// rijen monitor op vijf rijen kast. Op het bureau staat hij achteraan in de
// kamer, dus de diepteschaal zet hem als 15 × 13 neer: een monitor van een
// halve meter met een kast eronder. Dat is een kwart groter dan een echte
// 14"-CRT en dat is de leesbaarheidsuitzondering uit de stijlgids — dit is het
// middelpunt van het spel en het moet als monitor lezen. De vorige versie was
// 28 × 26 en dus anderhalve meter breed: breder dan de speler lang is.
//   0->0 outline  1->49 scherm donker  2->50 beige donker  3->51 beige mid
//   4->52 beige hoog  5->55 gloed schaduw  6->56 amber  7->58 schermwit
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["pc"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 49, 50, 51, 52, 55, 56, 58],
  anims: {

    "idle": { fps: 0, frames: [
        [
          "..00000000000000..",
          "..04444444444440..",
          "..02311111111340..",
          "..02311111111340..",
          "..02311211211340..",
          "..02311111111340..",
          "..02311111111340..",
          "..02333333333340..",
          "..02222222222220..",
          "..00000000000000..",
          ".......0220.......",
          "044444444444444440",
          "033333333333333330",
          "033300003333333330",
          "022222222222222220",
          ".0000000000000000."
        ]
    ] },

    "aan": { fps: 0, frames: [
        [
          "..00000000000000..",
          "..04444444444440..",
          "..02366666666340..",
          "..02367777776340..",
          "..02367676776340..",
          "..02367766766340..",
          "..02366666666340..",
          "..02355555555340..",
          "..02222222222220..",
          "..00000000000000..",
          ".......0220.......",
          "044444444444444440",
          "033333333333333330",
          "033300003333333330",
          "022222222222222220",
          ".0000000000000000."
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["pc"];
}
