// test-spreads.mjs — het bladbudget van het notitieboek-spread en de zeven
// hoofdstuktitels.
//
// Waarom dit gemeten wordt en niet bekeken: een spread-pagina wordt door
// AL.spreads.tekenInhoud stilzwijgend afgekapt zodra ze meer gewrapte regels
// telt dan er op de twee bladzijden passen, en een woord dat breder is dan de
// kolom (136 px) wordt niet gebroken maar over de bladrand geschreven. Allebei
// zijn ze onzichtbaar in de code en pas zichtbaar op het scherm, op één level,
// bij één zin. Deze test rekent dezelfde som als de renderer: hij wrapt met de
// echte handschrift-maten uit js/gfx.js en vergelijkt met de echte bladspiegel
// uit AL.spreads.BLAD.
//
// De titels staan hier ook, want ze staan in het spel op twee plaatsen tegelijk
// (de kop van bladzijde 1 en AL.strings.lN.naam in de kop van de gesimuleerde
// pc) en die twee horen woord voor woord gelijk te zijn.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

require(join(wortel, "js", "palette.js"));
require(join(wortel, "js", "font.js"));
const gfx = require(join(wortel, "js", "gfx.js"));
require(join(wortel, "js", "scenes", "scene-spread-template.js"));
require(join(wortel, "js", "scenes", "spread-schetsen.js"));
const strings = require(join(wortel, "js", "logic", "strings.js"));

const AL = globalThis.AL;
const B = AL.spreads.BLAD;

// Dezelfde twee handen als in scene-spread-template.js: de kop wordt rechter
// geschreven dan de tekst eronder, en dus ook met andere maten gewrapt.
const HAND = { schuin: 0.25, ruimte: 1, seed: 1 };
const KOPHAND = { schuin: 0.10, ruimte: 1, seed: 1 };
const meetHand = (t) => gfx.handschriftBreedte(t, HAND);
const meetKop = (t) => gfx.handschriftBreedte(t, KOPHAND);

// De bladspiegel, precies zoals tekenInhoud hem rekent: de linkerbladzijde
// loopt door tot onderaan, de rechter houdt op waar Alberta's schets begint
// (en die staat alleen op bladzijde 2).
const perLinks = Math.floor((B.onderY - B.topY) / B.regelH);
const perRechtsMetSchets = Math.floor((B.schetsTopY - 4 - B.topY) / B.regelH);

function capaciteit(levelId, pagina) {
  const set = AL.spreadSchetsen ? AL.spreadSchetsen[levelId] : null;
  const heeftSchets = !!(set && set.schets && pagina === AL.spreads.SCHETS_PAGINA);
  return perLinks + (heeftSchets ? perRechtsMetSchets : perLinks);
}

// De regels van één pagina zoals de renderer ze opbouwt: eerst de gewrapte kop,
// dan één streep, dan de gewrapte tekst.
function regelsVan(pag) {
  const uit = [];
  if (pag.kop) {
    for (const s of gfx._wrap(pag.kop, B.kolomB, meetKop)) {
      uit.push({ tekst: s, breedte: meetKop(s), kop: true });
    }
    uit.push({ tekst: "", breedte: 0, streep: true });
  }
  for (const alinea of pag.regels || []) {
    for (const s of gfx._wrap(alinea, B.kolomB, meetHand)) {
      uit.push({ tekst: s, breedte: meetHand(s), kop: false });
    }
  }
  return uit;
}

const NIVEAUS = [1, 2, 3, 4, 5, 6, 7];

// ---- Het bladbudget --------------------------------------------------------

test("de bladspiegel is die van het sjabloon: 12 regels links, 7 naast de schets", () => {
  assert.equal(perLinks, 12);
  assert.equal(perRechtsMetSchets, 7);
  assert.equal(B.kolomB, 136);
});

test("geen enkele spread-pagina loopt over haar bladspiegel", () => {
  for (const n of NIVEAUS) {
    const data = strings.spreads["l" + n];
    data.paginas.forEach((pag, p) => {
      const max = capaciteit("l" + n, p);
      const regels = regelsVan(pag);
      assert.ok(regels.length <= max,
        `l${n} pagina ${p + 1}: ${regels.length} gewrapte regels op een blad ` +
        `van ${max} — de renderer kapt de rest af`);
    });
  }
});

test("geen enkele gewrapte regel is breder dan de kolom", () => {
  // Een woord dat op zichzelf breder is dan 136 px wordt door _wrap niet
  // gebroken; het wordt over de rugschaduw en de andere bladzijde geschreven.
  // Zo liep "artikel.getCategorie().getNaam()" (174 px) vroeger van het blad.
  for (const n of NIVEAUS) {
    const data = strings.spreads["l" + n];
    data.paginas.forEach((pag, p) => {
      for (const r of regelsVan(pag)) {
        assert.ok(r.breedte <= B.kolomB,
          `l${n} pagina ${p + 1}: "${r.tekst}" meet ${r.breedte} px in een ` +
          `kolom van ${B.kolomB} px`);
      }
    });
  }
});

test("elke kop past in ten hoogste drie regels en blijft binnen de kolom", () => {
  // De kop staat in inkt bovenaan de bladzijde. Meer dan drie regels en de kop
  // eet de brief op; breder dan de kolom en hij loopt de rug in.
  for (const n of NIVEAUS) {
    const data = strings.spreads["l" + n];
    data.paginas.forEach((pag, p) => {
      assert.ok(pag.kop, `l${n} pagina ${p + 1} hoort een kop te hebben`);
      const stukken = gfx._wrap(pag.kop, B.kolomB, meetKop);
      assert.ok(stukken.length <= 3,
        `l${n} pagina ${p + 1}: kop wrapt over ${stukken.length} regels`);
      for (const s of stukken) {
        assert.ok(meetKop(s) <= B.kolomB,
          `l${n} pagina ${p + 1}: kopregel "${s}" meet ${meetKop(s)} px`);
      }
    });
  }
});

test("de weekregel past in de drie regels die de renderer ervoor tekent", () => {
  for (const n of NIVEAUS) {
    const data = strings.spreads["l" + n];
    for (const pag of data.paginas) {
      if (!pag.voet) continue;
      const voet = gfx._wrap(pag.voet, B.kolomB, meetHand);
      assert.ok(voet.length <= 3, `l${n}: weekregel wrapt over ${voet.length} regels`);
      for (const s of voet) {
        assert.ok(meetHand(s) <= B.kolomB, `l${n}: weekregel "${s}" is te breed`);
      }
    }
  }
});

// De bladerhint deelt de onderrand van het linkerblad met het paginanummer.
// Het paginanummer staat links op B.linksX en telt drie tekens ("1/2") van 8 px
// in de gedrukte font; de hint wordt rechts uitgelijnd tegen de rug
// (B.linksX + B.kolomB, zie js/engine.js, tekenSpread). Wat daar niet meer
// tussen past, schuift over het paginanummer heen — en dat is precies waarom
// de laatste-pagina-hint kort moet blijven.
test("de bladerhint past naast het paginanummer op het linkerblad", () => {
  const PAGINANUMMER = 3 * 8;       // "1/2"
  const ruimte = B.kolomB - PAGINANUMMER - 8;   // 8 px lucht ertussen
  for (const sleutel of ["bladerVerder", "bladerLaatste"]) {
    const tekst = strings.spreadChroom[sleutel];
    assert.ok(typeof tekst === "string" && tekst.length > 0, sleutel);
    assert.ok(tekst.length * 8 <= ruimte,
      `${sleutel}: "${tekst}" is ${tekst.length * 8} px, er is ${ruimte} px`);
  }
  // En ze mag niet beloven dat de pc opengaat: spatie doet het boek dicht en
  // zet je in de werkhoek; de pc opent pas op 'ga zitten'.
  assert.ok(!/\bpc\b/.test(strings.spreadChroom.bladerLaatste),
    "de bladerhint belooft de pc, maar spatie brengt je enkel naar de werkhoek");
});

// ---- De zeven hoofdstuktitels ---------------------------------------------

// De vorm is vast (docs/levels-en-scharnieren.md, §"De zeven hoofdstuktitels"):
// eerst de scharnierterm zoals de cursus die noemt, dan een dubbelpunt, dan een
// beeld uit het verhaal van de zeven geitjes.
const TITELS = {
  l1: "Klasse en instantie: zeven uit één vorm",
  l2: "Signaturen: wat erin gaat, wat eruit komt",
  l3: "Voorwaarden: de deur op slot",
  l4: "Referenties: twee pijlen, één doos",
  l5: "Luspatronen: geitje voor geitje",
  l6: "Index en off-by-one: de laatste plank",
  l7: "Zoeken en de dubbele pijl: waar het jongste zit"
};

test("de zeven hoofdstuktitels staan er, met de scharnierterm vooraan", () => {
  for (const n of NIVEAUS) {
    const sleutel = "l" + n;
    const data = strings.spreads[sleutel];
    assert.equal(data.titel, TITELS[sleutel], "titel van " + sleutel);
    assert.ok(data.titel.indexOf(": ") > 0,
      sleutel + ": de titel hoort 'term: beeld' te zijn");
  }
});

test("de levelnaam in de pc-kop is dezelfde titel als op bladzijde 1", () => {
  // lN.naam was tot WP 31 dode data (de pc toonde enkel "Level 3"). Nu draagt
  // hij de hoofdstuktitel, en dan moet hij die van het spread zijn.
  for (const n of NIVEAUS) {
    const sleutel = "l" + n;
    assert.equal(strings[sleutel].naam,
      "Level " + n + " — " + strings.spreads[sleutel].titel,
      "naam van " + sleutel);
    assert.equal(strings.spreads[sleutel].paginas[0].kop,
      "Hoofdstuk " + n + " — " + strings.spreads[sleutel].titel,
      "kop van bladzijde 1 van " + sleutel);
  }
  // Het testlevel houdt zijn eigen naam; de pc-kop valt er niet op terug.
  assert.ok(strings.l0 && strings.l0.naam, "testlevel 0 heeft ook een naam");
});

test("bladzijde 2 herhaalt de scharnierterm van de titel niet", () => {
  // Bladzijde 1 zegt "Voorwaarden", bladzijde 2 vult aan met "Validatie ×3,
  // cascade, …". Stond de term op allebei, dan las het spread als een echo.
  for (const n of NIVEAUS) {
    const data = strings.spreads["l" + n];
    const term = data.titel.split(":")[0];
    assert.ok(data.termen.indexOf(term) === -1,
      `l${n}: bladzijde 2 ("${data.termen}") herhaalt "${term}"`);
    assert.equal(data.paginas[1].kop, data.termen);
  }
});

// ---- Het weeknummer --------------------------------------------------------

test("het notitieboek op zolder noemt dezelfde week als het spread eronder", () => {
  // Het boek ligt open op het spread van level 1. De onderzoektekst citeerde
  // Alberta's weekregel met week 3, terwijl de voet van dat spread week 1 zegt
  // (docs/levels-en-scharnieren.md, §"Volledige koppeltabel").
  const week = strings.spreads.l1.week;
  assert.equal(week, 1);
  assert.ok(strings.notitieboek.onderzoek.includes("week " + week + "."),
    "de onderzoektekst van het notitieboek noemt week " + week);
});
