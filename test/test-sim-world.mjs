// test-sim-world.mjs — Node-tests voor AL.sim.world: navigatie, voorwerpen,
// de zoeklus, de null-veilige endgame-keten en de vier eindes afzonderlijk.
// DOM-vrij; laadt de sim-modules via require en werkt op de platte toestand.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
require(join(wortel, "js", "sim", "goats-strings.js"));
require(join(wortel, "js", "sim", "goats-world.js"));
require(join(wortel, "js", "sim", "goats-combat.js"));
const W = globalThis.AL.sim.world;

// Voer een reeks commando's uit; geef de laatste {tekst, effecten} en alle
// tekst samen terug.
function draai(t, commandos) {
  let laatste = { tekst: [], effecten: [] };
  const alles = [];
  for (const c of commandos) {
    laatste = W.verwerk(t, c);
    alles.push(...laatste.tekst);
  }
  return { laatste, alles, tekst: alles.join("\n") };
}

test("verse toestand start in het geitenhuisje met volle levenspunten", () => {
  const t = W.nieuw();
  assert.equal(t.kamerId, "geitenhuisje");
  assert.equal(t.speler.lp, 20);
  assert.equal(t.speler.aanval, 2);
  assert.equal(t.geitjes.length, 7);
  assert.equal(t.geitjes[0].gered, true);        // jongste
  assert.equal(t.geitjes[1].schuilplaatsNaam, null);
});

test("navigatie: ga zuid werkt, doodlopende richting weigert", () => {
  const t = W.nieuw();
  let r = W.verwerk(t, "ga zuid");
  assert.equal(t.kamerId, "dorpsplein");
  assert.ok(r.tekst.some((l) => l.includes("== Dorpsplein ==")));
  r = W.verwerk(t, "ga noord");
  assert.equal(t.kamerId, "geitenhuisje");   // terug
  r = W.verwerk(t, "ga noord");
  assert.deepEqual(r.tekst, ["Die kant kan je niet op."]);
});

test("voorwerp oppakken: keukenmes lukt, koek vereist een mandje", () => {
  const t = W.nieuw();
  let r = W.verwerk(t, "pak keukenmes");
  assert.equal(r.tekst[0], "Je neemt keukenmes mee.");
  assert.ok(W.heeft(t, "keukenmes"));
  W.verwerk(t, "ga zuid"); // dorpsplein
  r = W.verwerk(t, "pak koek");
  assert.equal(r.tekst[0], "Je hebt niets om ze in te dragen.");
  // met mandje wel
  W.verwerk(t, "ga noord");
  W.verwerk(t, "pak mandje");
  W.verwerk(t, "ga zuid");
  r = W.verwerk(t, "pak koek");
  assert.equal(r.tekst[0], "Je neemt koek mee.");
  assert.ok(W.heeft(t, "koek"));
});

test("eten klemt de levenspunten binnen 0..max", () => {
  const t = W.nieuw();
  W.verwerk(t, "ga zuid"); W.verwerk(t, "pak koek") ; // geen mandje -> faalt, geen koek
  // Forceer koek in inventaris en zak levenspunten, test +4 en de bovenklem.
  t.speler.inventaris.push({ naam: "koek", kracht: 0 });
  W.zetLp(t, 10);
  let r = W.verwerk(t, "eet koek");
  assert.equal(t.speler.lp, 14);
  assert.equal(r.tekst[0], "Je eet een koek. +4 LP (nu 14).");
  // bovenklem: van 19 met melk (+6) -> 20, niet 25
  t.speler.inventaris.push({ naam: "kruik melk", kracht: 0 });
  W.zetLp(t, 19);
  W.verwerk(t, "eet melk");
  assert.equal(t.speler.lp, 20);
});

test("stats: telWapens en sterksteVoorwerp weerspiegelen de inventaris", () => {
  const t = W.nieuw();
  assert.equal(W.telWapens(t), 0);
  assert.equal(W.sterksteVoorwerp(t), null);
  W.verwerk(t, "pak rode mantel");
  W.verwerk(t, "pak keukenmes");
  assert.equal(W.telWapens(t), 1);              // enkel het mes heeft kracht > 0
  assert.equal(W.sterksteVoorwerp(t).naam, "keukenmes");
  const r = W.verwerk(t, "stats");
  assert.ok(r.tekst.includes("Wapens op zak: 1"));
  assert.ok(r.tekst.some((l) => l.includes("Met het keukenmes deel je 5 schade")));
  assert.ok(r.tekst.some((l) => l.includes("Je sterkste voorwerp: keukenmes (kracht 3).")));
});

test("de zoeklus: praten met het jongste geitje noemt de klokkast", () => {
  const t = W.nieuw();
  assert.equal(W.zoekGeitje(t, "jongste geitje").schuilplaatsNaam, "de klokkast");
  assert.equal(W.zoekGeitje(t, "onbekend geitje"), null);
  const r = W.verwerk(t, "praat");
  assert.ok(r.tekst[0].includes("Uit de klokkast klinkt een dun stemmetje"));
});

test("de ruil met de raaf gebeurt precies één keer", () => {
  const t = W.nieuw();
  W.verwerk(t, "pak mandje");
  W.verwerk(t, "ga zuid"); W.verwerk(t, "pak koek");
  W.verwerk(t, "ga zuid"); W.verwerk(t, "ga zuid"); // bospad, oude eik
  let r = W.verwerk(t, "geef koek");
  assert.ok(r.tekst[0].includes("Gevonden bij de beek"));
  assert.ok(W.heeft(t, "gladde kiezels"));
  r = W.verwerk(t, "geef koek");
  assert.equal(r.tekst[0], "\"Eén volstaat. Ik let op mijn lijn.\"");
});

// De reis naar de rivier (zonder gevechtscommando's).
const NAAR_RIVIER = ["ga zuid", "ga zuid", "ga zuid", "ga zuid", "ga zuid", "ga zuid"];

test("einde: schaar én stenen -> het beste einde met de schuilplaatsen-keten", () => {
  const t = W.nieuw();
  draai(t, ["pak rode mantel", "pak keukenmes", "pak mandje", "ga zuid",
    "pak koek", "pak koek", "ga zuid", "ga zuid", "geef koek", "ga zuid",
    "pak zilveren schaar", "ga zuid", "ga zuid",
    "vecht", "val aan", "val aan", "val aan", "maak af"]);
  assert.equal(t.einde, "schaar-en-stenen");
  assert.equal(t.gestopt, true);
  // De null-veilige keten: alle zeven geitjes hebben nu een schuilplaats + kamer.
  assert.ok(t.geitjes.every((g) => g.schuilplaatsNaam !== null && g.gered));
  assert.equal(t.geitjes[6].schuilplaatsNaam, "tussen het riet");
  assert.equal(t.geitjes[6].kamerId, "rivieroever");
});

test("einde: afrekening -> maak af zonder schaar", () => {
  const t = W.nieuw();
  const r = draai(t, ["pak rode mantel", "pak keukenmes", ...NAAR_RIVIER,
    "vecht", "val aan", "val aan", "val aan", "maak af"]);
  assert.equal(t.einde, "afrekening");
  assert.ok(r.laatste.effecten.includes("sim:einde:afrekening"));
  assert.ok(r.tekst.includes("Einde: de afrekening."));
});

test("einde: de les -> spaar op het smeekmoment", () => {
  const t = W.nieuw();
  const r = draai(t, ["pak rode mantel", "pak keukenmes", ...NAAR_RIVIER,
    "vecht", "val aan", "val aan", "val aan", "spaar"]);
  assert.equal(t.einde, "les");
  assert.ok(r.laatste.effecten.includes("sim:einde:les"));
});

test("einde: game over -> vijf rondes zonder wapen (time-out)", () => {
  const t = W.nieuw();
  const r = draai(t, [...NAAR_RIVIER,
    "vecht", "val aan", "val aan", "val aan", "val aan", "val aan"]);
  assert.equal(t.einde, "gameover");
  assert.ok(r.laatste.effecten.includes("sim:einde:gameover"));
  assert.ok(r.tekst.includes("Game over."));
});

test("de jachthond is een optioneel gevecht dat het spel niet beëindigt", () => {
  const t = W.nieuw();
  draai(t, ["pak keukenmes", "ga zuid", "ga oost"]); // molen
  assert.equal(t.kamerId, "molen");
  const r = draai(t, ["vecht", "val aan", "val aan"]); // 5+5 = 10 >= 8 LP
  assert.equal(t.gestopt, false);
  assert.equal(t.einde, null);
  assert.equal(t.tegenstanderWeg.molen, true);
  assert.ok(r.tekst.includes("De jachthond zakt in elkaar en sleept zich weg."));
  // Nogmaals vechten kan niet meer.
  const r2 = W.verwerk(t, "vecht");
  assert.equal(r2.tekst[0], "Er is hier niemand om tegen te vechten.");
});

test("onbekende invoer geeft de vaste foutmelding", () => {
  const t = W.nieuw();
  assert.deepEqual(W.verwerk(t, "dans").tekst, ["Dat begrijp je niet."]);
});
