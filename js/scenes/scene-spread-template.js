// scene-spread-template.js — het herbruikbare notitieboek-spread. Twee delen:
//
//  1. AL.scenes["spread-template"] — de getekende papier-achtergrond (papier-ramp
//     35–38, rugschaduw 39/40, koffie-/watervlekken, een omgevouwen hoek). Dit is
//     de redressbare visuele "frame" die per level identiek blijft; lint-schoon
//     als gewone scène (met een dummy-walkbox, want een spread wordt niet belopen).
//
//  2. AL.spreads — de renderer die de handschrift-INHOUD van één pagina bovenop
//     die achtergrond zet. Hij is generiek: hij leest zijn inhoud uit een
//     data-object (AL.strings.spreads[levelId]), niet per level hardgecodeerd.
//     WP 7–8 leveren de echte puzzelbriefjes; voor WP 6 draagt de data de
//     scharniertitels/teasers uit levels-en-scharnieren.md.
//
// Visuele taal uit art-stijlgids.md, §"Het notitieboek-spread": papier met een
// rugschaduw in het midden, beschadiging als grillige vlekken, handschrift als
// de 8×8-font met kleine y-jitter, en de weekregel onderaan de rechterbladzijde.

globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["spread-template"] = {
  id: "spread-template",

  picture: [
    // Het papiervlak (papier licht), met donkerder randen bij de rug en de snit.
    ["fill", 37],
    ["rect", 35, 0, 8, 13, 181],
    ["rect", 35, 307, 8, 13, 181],
    ["rect", 38, 20, 12, 130, 30],
    ["rect", 38, 170, 12, 130, 30],

    // De rugschaduw in het midden verdeelt de twee bladzijden.
    ["rect", 40, 157, 8, 2, 181],
    ["rect", 39, 159, 8, 3, 181],

    // Beschadiging: een koffievlek linksonder en waterschade rechtsboven, precies
    // waar de puzzel zit — de beschadiging "verklaart" de ontbrekende code.
    ["ellipse", 39, 62, 150, 24, 11],
    ["ellipse", 40, 62, 150, 13, 6],
    ["ellipse", 39, 250, 66, 20, 9],
    ["ellipse", 40, 250, 66, 9, 4],

    // Doorgelopen inkt die naar de vlek uitwaaiert (sfeer).
    ["px", 41, [[52, 140], [58, 138], [66, 141], [72, 144], [78, 146],
      [244, 58], [250, 56], [256, 59]]],

    // Een omgevouwen hoek (ezelsoor) rechtsonder.
    ["poly", 35, [290, 178, 308, 178, 308, 188, 296, 188]],
    ["line", 40, [290, 178, 296, 188]]
  ],

  // Dummy-walkbox + entry: een spread wordt niet belopen, maar het scène-schema
  // (en de lint) vragen er een; de engine gebruikt ze niet in spread-modus.
  walkboxes: [
    [0, 180, 320, 9]
  ],
  entries: {
    start: [160, 185]
  },

  hotspots: [],
  props: [],
  overlays: []
};

// De generieke spread-renderer. Redresst zich per level uit het data-object; hij
// tekent alleen de inhoud (kop, handschrift, weekregel) — de engine tekent eerst
// de papier-achtergrond hierboven. DOM-vrij: hij werkt op een gfx-object dat hem
// wordt meegegeven (geen document/window/canvas).
AL.spreads = {

  // Hoeveel pagina's dit spread telt (voor de paging-state-machine in de engine).
  aantalPaginas: function (data) {
    return (data && data.paginas && data.paginas.length) ? data.paginas.length : 1;
  },

  // Deterministische handschrift-jitter (kleine verticale verschuiving per teken),
  // seed-gestuurd zodat een spread er per playthrough consistent uitziet.
  _jitter: function (seed) {
    var s = Math.abs(seed | 0);
    return function (i) { return ((s + i * 7) % 3) - 1; };
  },

  // Teken de inhoud van pagina p bovenop de al getekende papier-achtergrond.
  // Wrapt elke regel op de bladbreedte en zet ze als handschrift; de weekregel
  // (voet) komt onderaan de rechterbladzijde (art-stijlgids.md).
  tekenInhoud: function (gfx, data, p, seed) {
    if (!data || !data.paginas || !gfx) return;
    var idx = Math.max(0, Math.min(p | 0, data.paginas.length - 1));
    var pag = data.paginas[idx];
    var jitter = this._jitter(seed);
    var x = 18, y = 16, i;

    // De kop in inkt (gewrapt op de bladbreedte), met een onderstreping.
    if (pag.kop) {
      var kopregels = gfx._wrap(pag.kop, 36);
      for (i = 0; i < kopregels.length; i++) {
        gfx.tekenTekst(kopregels[i], x, y, 41, null);
        y += 11;
      }
      var laatste = kopregels[kopregels.length - 1] || "";
      gfx.line(40, [x, y, x + Math.min(laatste.length * 8, 284), y]);
      y += 10;
    }

    // De regels als handschrift, gewrapt op de bladbreedte (~34 tekens).
    var regels = pag.regels || [];
    for (var r = 0; r < regels.length; r++) {
      var stukken = gfx._wrap(regels[r], 34);
      for (var s = 0; s < stukken.length; s++) {
        if (stukken[s] !== "") gfx.tekenHandschrift(stukken[s], x, y, 41, jitter);
        y += 11;
      }
    }

    // De weekregel onderaan de bladzijde (Alberta's markering), gewrapt zodat ze
    // binnen het blad past.
    if (pag.voet) {
      var voetregels = gfx._wrap(pag.voet, 30);
      var vy = 189 - voetregels.length * 11;
      for (i = 0; i < voetregels.length; i++) {
        gfx.tekenTekst(voetregels[i], 18, vy, 40, null);
        vy += 11;
      }
    }

    // Bladwijzer: welke pagina van hoeveel.
    var totaal = data.paginas.length;
    gfx.tekenTekst((idx + 1) + "/" + totaal, 296, 168, 40, null);
  }
};

// Node-export voor tooling/tests (aantalPaginas is puur en testbaar).
if (typeof module !== "undefined") {
  module.exports = { scene: AL.scenes["spread-template"], spreads: AL.spreads };
}
