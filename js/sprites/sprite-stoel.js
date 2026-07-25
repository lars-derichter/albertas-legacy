// sprite-stoel.js — Alberta's lege bureaustoel op zolder-oost: sfeer-prop, 'net
// verlaten' (hout-ramp 23/24, zitting in koelgrijs 50/52). Idle. Anker
// voeten-midden (art-stijlgids.md, §Sprite-specificaties: <=14x20).
//
// Maat, na de schaalpas van WP 35: 12 × 19 — een halve meter breed, de zitting
// op negen pixels (0,45 m) en de rugleuning op achttien (0,90 m). Negen is geen
// toevallig getal: dat is precies de hoogte waarop de dij van de speler in het
// derde `zit-oost`-frame ligt (WP 34), en beide worden met dezelfde
// diepteschaal geblit. Zo zit het kind écht op de zitting in plaats van erdoor.
// De vorige versie was 18 × 26 (0,9 × 1,3 m) en paste onder geen enkel bureau.
// De stoel staat op een vloer uit dezelfde hout-ramp. In hout mid (24) viel hij
// er volledig in weg — een donker frame op donker hout leest als een gat. Het
// frame is nu hout warm (25) met een hooglicht (27) aan de raamkant.
//   0->0 outline  1->23 hout schaduw  2->25 hout warm  3->27 hout hooglicht
//   4->50 zitting  5->52 zitting hoog
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["stoel"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 23, 25, 27, 50, 52],
  anims: {

    "idle": { fps: 0, frames: [
        [
          "..00000000..",
          "..01222330..",
          "..01222330..",
          "..01222330..",
          "..01212330..",
          "..01222330..",
          "..01222330..",
          "..00000000..",
          "...0....0...",
          ".0555555550.",
          ".0444444450.",
          ".0111111110.",
          "..01....30..",
          "..01....30..",
          "..01....30..",
          "..01....30..",
          "..01....30..",
          "..01....30..",
          "..00....00.."
        ]
    ] }
  }
};

// Node-export voor tooling/tests (sprite-lint).
if (typeof module !== "undefined") {
  module.exports = AL.sprites["stoel"];
}
