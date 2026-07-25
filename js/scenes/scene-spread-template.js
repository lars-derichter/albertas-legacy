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
    // Het papiervlak. Twee verlopen in plaats van vlakke rechthoeken: elk blad
    // is licht in het midden en donkerder naar de rug toe, want daar buigt het
    // papier weg van het licht. De stijlgids vroeg dat al ("een lichte gradiënt
    // van 38 in het midden naar 35 in de bocht van de rug"); er stonden twee
    // lichte rechthoeken bovenaan de bladzijde, wat er als een plakker uitzag.
    ["fill", 37],
    ["gradient", 38, 35, 13, 8, 144, 181, "h"],
    ["gradient", 35, 38, 162, 8, 145, 181, "h"],
    ["rect", 35, 0, 8, 13, 181],
    ["rect", 35, 307, 8, 13, 181],

    // Korrel: papier is geen egale kleur, en zonder korrel leest een blad van
    // 320 bij 200 als een gekleurd vlak. Wel zuinig — de eerste versie stond op
    // 0,10 plus een tweede laag, en dat maakte er jute van. Op een blad dat het
    // hele scherm vult telt elke procent dubbel.
    ["noise", 36, 0.04, 51, [0, 8, 319, 8, 319, 189, 0, 189]],

    // De rugschaduw in het midden verdeelt de twee bladzijden.
    ["rect", 40, 157, 8, 2, 181],
    ["rect", 39, 159, 8, 3, 181],

    // De liniatuur. Een notitieboek is gelinieerd, en Alberta schrijft op de
    // lijn; de regelafstand hieronder is exact BLAD.regelH, dus het handschrift
    // valt erin in plaats van erover. Nauwelijks zichtbaar (36 op 37), maar het
    // is het verschil tussen papier en een beige vlak.
    ["line", 36, [16, 24, 152, 24]], ["line", 36, [166, 24, 302, 24]],
    ["line", 36, [16, 35, 152, 35]], ["line", 36, [166, 35, 302, 35]],
    ["line", 36, [16, 46, 152, 46]], ["line", 36, [166, 46, 302, 46]],
    ["line", 36, [16, 57, 152, 57]], ["line", 36, [166, 57, 302, 57]],
    ["line", 36, [16, 68, 152, 68]], ["line", 36, [166, 68, 302, 68]],
    ["line", 36, [16, 79, 152, 79]], ["line", 36, [166, 79, 302, 79]],
    ["line", 36, [16, 90, 152, 90]], ["line", 36, [166, 90, 302, 90]],
    ["line", 36, [16, 101, 152, 101]], ["line", 36, [166, 101, 302, 101]],
    ["line", 36, [16, 112, 152, 112]], ["line", 36, [166, 112, 302, 112]],
    ["line", 36, [16, 123, 152, 123]], ["line", 36, [166, 123, 302, 123]],
    ["line", 36, [16, 134, 152, 134]], ["line", 36, [166, 134, 302, 134]],
    ["line", 36, [16, 145, 152, 145]], ["line", 36, [166, 145, 302, 145]],
    ["line", 36, [16, 156, 152, 156]], ["line", 36, [166, 156, 302, 156]],

    // Een omgevouwen hoek (ezelsoor) rechtsonder.
    ["poly", 35, [290, 178, 308, 178, 308, 188, 296, 188]],
    ["line", 40, [290, 178, 296, 188]]

    // Beschadiging staat hier bewust níét meer. Ze zat als één koffievlek en één
    // waterplek op vaste plekken in dit sjabloon, en dus op alle acht de spreads
    // op dezelfde plek — terwijl de stijlgids beschadiging vraagt "precies waar
    // de puzzel zit". Ze staat nu per level in js/scenes/spread-schetsen.js en
    // wordt door AL.spreads.tekenInhoud gelegd, ná de schets en vóór de tekst.
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
    onderY: 158,      // hieronder komen de weekregel, de bladwijzer en de hint

    // Waar Alberta's schets staat: de onderste helft van de rechterbladzijde.
    // De tekst van díé kolom stopt dus hoger; de linkerbladzijde loopt door tot
    // onderaan. Elke coördinaat in js/scenes/spread-schetsen.js staat binnen dit
    // kader.
    schets: { x: 170, y: 100, b: 128, h: 62 },
    schetsTopY: 100
  },

  // Op welke pagina van een spread staat de schets? Op de tweede: dat is de
  // bladzijde waar Alberta de opdracht geeft, en haar tekst verwijst er ook
  // naar ("schrijf Geitje helemaal uit volgens de schets hieronder", "ik heb de
  // kaarten in de kantlijn getekend"). De eerste bladzijde is de brief.
  SCHETS_PAGINA: 1,

  // Teken de inhoud van pagina p bovenop de al getekende papier-achtergrond.
  // De kop staat in inkt met een onderstreping, de regels als handschrift; de
  // weekregel (voet) komt onderaan de rechterbladzijde (art-stijlgids.md).
  tekenInhoud: function (gfx, data, p, seed, levelId) {
    if (!data || !data.paginas || !gfx) return;
    var B = this.BLAD;
    var idx = Math.max(0, Math.min(p | 0, data.paginas.length - 1));
    var pag = data.paginas[idx];
    var jitter = this._jitter(seed);
    var i, j, stukken;

    // De schets en de beschadiging staan eerst, want de tekst hoort erover te
    // vallen en niet eronder te verdwijnen. De vlek staat wél ná de schets: ze
    // moet die aanvreten. Dat is het hele idee — de beschadiging verklaart
    // waarom de code eronder ontbreekt.
    // De vlek staat op béíde bladzijden op dezelfde plek, de schets alleen op de
    // tweede. Dat is geen bezuiniging maar een detail: een vlek trekt door het
    // papier heen, dus wie doorbladert ziet dezelfde plek terugkomen. Op de
    // brief-bladzijde staat ze alleen; op de opdracht-bladzijde vreet ze de
    // schets aan.
    var set = levelId && AL.spreadSchetsen ? AL.spreadSchetsen[levelId] : null;
    var heeftSchets = !!(set && set.schets && idx === this.SCHETS_PAGINA);
    if (set) {
      if (heeftSchets) gfx.tekenPicture(set.schets);
      if (set.schade) gfx.tekenPicture(set.schade);
    }

    // De rechterkolom houdt op waar de schets begint; de linker loopt door.
    var perLinks = Math.floor((B.onderY - B.topY) / B.regelH);
    var perRechts = heeftSchets
      ? Math.floor((B.schetsTopY - 4 - B.topY) / B.regelH)
      : perLinks;

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
    // want dan telt elke regel. Staat er een schets, dan mag de rechterkolom
    // sowieso niet meer dan perRechts regels krijgen.
    var maxRegels = perLinks + perRechts;
    var breuk = regels.length <= maxRegels
      ? Math.min(perLinks,
        Math.max(Math.ceil(regels.length / 2), regels.length - perRechts))
      : perLinks;

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

    // De weekregel onderaan de rechterbladzijde (Alberta's markering). Drie
    // regels ruimte op acht pixels in plaats van twee op negen: proportioneel
    // handschrift is bréder dan het monospace raster waarop deze regel ooit
    // paste, en met twee regels viel "van de cursus" er gewoon af. Dichter op
    // elkaar mag: het is een aantekening in de marge, geen lopende tekst.
    if (pag.voet) {
      var voet = gfx._wrap(pag.voet, B.kolomB, meetHand);
      for (i = 0; i < voet.length && i < 3; i++) {
        gfx.tekenHandschrift(voet[i], B.rechtsX, B.onderY + 5 + i * 8, 40,
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
