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

  // Deterministische handschrift-jitter (kleine verticale verschuiving),
  // seed-gestuurd zodat een spread er per playthrough consistent uitziet.
  //
  // Per gróépje van drie tekens, niet per teken. Een hand die schrijft dwaalt
  // van de lijn af en komt er weer op terug; ze springt niet om de letter. Met
  // een sprong per teken viel elk woord uit elkaar in losse letters op eigen
  // hoogte — met de schuinstand erbij las dat als losgeraakte type, niet als
  // schrift.
  // En als een driehoeksgolf, niet als een hash: 0, +1, 0, −1 en weer van voor
  // af aan. Twee opeenvolgende groepjes schelen dus hoogstens één pixel. Met een
  // modulo-hash kon een woord van +1 naar −1 springen, en dat is geen deining
  // meer maar een letter die eraf valt.
  _jitter: function (seed) {
    var golf = [0, 1, 0, -1];
    var s = Math.abs(seed | 0);
    return function (i) {
      return golf[(s + Math.floor(i / 4)) % 4];
    };
  },

  // De bladspiegel. Het sjabloon tekent een rugschaduw op x 157–162, dus tekst
  // die als één brede kolom over de volle breedte loopt, snijdt daar dwars
  // doorheen — en leest dan niet als een opengeslagen boek maar als een fout.
  // Vandaar twee kolommen: eerst de linkerbladzijde vol, dan de rechter.
  BLAD: {
    linksX: 16,
    rechtsX: 166,
    kolomB: 136,      // 17 tekens van 8 px
    topY: 16,
    regelH: 11,
    onderY: 158       // hieronder komen de weekregel, de bladwijzer en de hint
  },

  // Teken de inhoud van pagina p bovenop de al getekende papier-achtergrond.
  // De kop staat in inkt met een onderstreping, de regels als handschrift; de
  // weekregel (voet) komt onderaan de rechterbladzijde (art-stijlgids.md).
  tekenInhoud: function (gfx, data, p, seed) {
    if (!data || !data.paginas || !gfx) return;
    var B = this.BLAD;
    var idx = Math.max(0, Math.min(p | 0, data.paginas.length - 1));
    var pag = data.paginas[idx];
    var jitter = this._jitter(seed);
    var perKolom = Math.floor((B.onderY - B.topY) / B.regelH);
    var i, j, stukken;

    // De hand waarin dit blad geschreven staat. Eén object, want de maat waarmee
    // gewrapt wordt en de maat waarmee getekend wordt moeten dezelfde zijn —
    // anders loopt de tekst net over de kolomrand.
    var hand = { schuin: 0.25, ruimte: 1, seed: (seed | 0) || 1 };
    // De kop is dezelfde hand, maar rechter geschreven en zonder deining: een
    // titel schrijft een mens trager op dan de tekst eronder. Wat het níét mag
    // zijn is de gedrukte prosefont — dan staan er twee schrijvers op één blad.
    var kopHand = { schuin: 0.10, ruimte: 1, seed: (seed | 0) || 1 };
    var meetHand = function (t) { return gfx.handschriftBreedte(t, hand); };
    var meetKop = function (t) { return gfx.handschriftBreedte(t, kopHand); };

    // Alles eerst tot één lijst regels maken, dan pas over de twee bladzijden
    // verdelen — zo loopt een kop die net onderaan links valt netjes door.
    var regels = [];
    if (pag.kop) {
      stukken = gfx._wrap(pag.kop, B.kolomB, meetKop);
      for (i = 0; i < stukken.length; i++) {
        regels.push({ tekst: stukken[i], kop: true });
      }
      regels.push({ streep: true });
    }
    var bron = pag.regels || [];
    for (i = 0; i < bron.length; i++) {
      stukken = gfx._wrap(bron[i], B.kolomB, meetHand);
      for (j = 0; j < stukken.length; j++) {
        regels.push({ tekst: stukken[j], kop: false });
      }
    }

    // Waar breekt de linkerbladzijde af? Past alles op één spread, dan wordt de
    // helft links gezet en de helft rechts — anders staat het linkerblad vol en
    // het rechter met drie regels erop, en dat leest als een fout in plaats van
    // als een opengeslagen boek. Past het níét, dan gaat het linkerblad wél vol,
    // want dan telt elke regel.
    var maxRegels = perKolom * 2;
    var breuk = regels.length <= maxRegels
      ? Math.min(perKolom, Math.ceil(regels.length / 2))
      : perKolom;

    for (i = 0; i < regels.length && i < maxRegels; i++) {
      var rechts = i >= breuk;
      var x = rechts ? B.rechtsX : B.linksX;
      var y = B.topY + (i - (rechts ? breuk : 0)) * B.regelH;
      var r = regels[i];
      if (r.streep) {
        gfx.line(40, [x, y, x + B.kolomB - 8, y]);
      } else if (r.tekst === "") {
        continue;
      } else if (r.kop) {
        gfx.tekenHandschrift(r.tekst, x, y, 41, null, kopHand);
      } else {
        gfx.tekenHandschrift(r.tekst, x, y, 41, jitter, hand);
      }
    }

    // De weekregel onderaan de rechterbladzijde (Alberta's markering).
    if (pag.voet) {
      var voet = gfx._wrap(pag.voet, B.kolomB, meetHand);
      for (i = 0; i < voet.length && i < 2; i++) {
        gfx.tekenHandschrift(voet[i], B.rechtsX, B.onderY + 6 + i * 9, 40,
          jitter, hand);
      }
    }

    // Bladwijzer linksonder, binnen het blad — niet tegen de snit aan.
    gfx.tekenTekst((idx + 1) + "/" + data.paginas.length, B.linksX, 178, 40,
      null);
  }
};

// Node-export voor tooling/tests (aantalPaginas is puur en testbaar).
if (typeof module !== "undefined") {
  module.exports = { scene: AL.scenes["spread-template"], spreads: AL.spreads };
}
