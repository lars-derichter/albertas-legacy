// test-world.mjs — de verse staat, de zolder-navigatie en de getypte
// zolder-commando's. Getoetst aan engine-architectuur.md (§"De staat") en
// spelontwerp-legacy.md (§"Commando's").

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadLogica } from "./helpers.mjs";

const AL = laadLogica();
const world = AL.world;
const strings = AL.strings;

test("nieuw(seed): de exacte staat-vorm uit het contract", () => {
  const t = world.nieuw(20260716);
  assert.equal(t.versie, 1);
  assert.equal(t.seed, 20260716);
  assert.equal(t.modus, "zolder");
  assert.equal(t.sceneId, "zolder-west");
  assert.deepEqual(t.speler, { x: 160, y: 150, richting: "zuid" });
  assert.deepEqual(t.bezocht, { "zolder-west": true });
  assert.equal(t.levelActief, 1);
  assert.equal(t.hintsTotaal, 0);
  assert.equal(t.geluid, true);
  assert.equal(t.gestopt, false);
  assert.equal(t.einde, null);
  // Levels 1..7 bestaan; level 1 draagt de placeholder-puzzels.
  for (let n = 1; n <= 7; n++) assert.ok(t.levels[String(n)], "level " + n);
  assert.ok(t.levels["1"].puzzels["l1-editor"]);
  assert.equal(t.levels["1"].ontgrendeld, false);
});

test("nieuw() zonder seed genereert een geheel getal", () => {
  const t = world.nieuw();
  assert.equal(typeof t.seed, "number");
  assert.equal(t.seed | 0, t.seed);
});

test("de staat round-tript door JSON zonder verlies", () => {
  const t = world.nieuw(42);
  const kopie = JSON.parse(JSON.stringify(t));
  assert.deepEqual(kopie, t);
});

test("zolder-kaart: verbindingen in beide richtingen", () => {
  const paren = [
    ["zolder-west", "oost", "zolder-midden", "west"],
    ["zolder-midden", "oost", "zolder-oost", "west"]
  ];
  for (const [a, richting, b, terug] of paren) {
    const ta = world.nieuw(); ta.sceneId = a;
    assert.equal(world.uitgangen(ta)[richting], b, `${a} → ${richting}`);
    const tb = world.nieuw(); tb.sceneId = b;
    assert.equal(world.uitgangen(tb)[terug], a, `${b} → ${terug}`);
  }
});

test("betreed beschrijft bij eerste bezoek, zwijgt bij herbezoek", () => {
  const t = world.nieuw();
  const heen = world.betreed(t, "oost");     // naar zolder-midden
  assert.equal(t.sceneId, "zolder-midden");
  assert.ok(heen.tekst.some((r) => r.includes("doorgang")));
  assert.ok(heen.effecten.includes("scene:zolder-midden"));
  assert.ok(heen.effecten.includes("betreed:oost"));

  world.betreed(t, "west");                   // terug naar west (al bezocht)
  const opnieuw = world.betreed(t, "oost");   // midden opnieuw
  assert.equal(opnieuw.tekst.length, 0);
  assert.ok(opnieuw.effecten.includes("scene:zolder-midden"));
});

test("betreed naar een dichte kant kan niet", () => {
  const t = world.nieuw();
  const r = world.betreed(t, "noord");
  assert.deepEqual(r.tekst, [strings.dieKantKanJeNietOp]);
  assert.equal(t.sceneId, "zolder-west");
});

test("open notitieboek ontgrendelt fragment l1 en opent de spread", () => {
  const t = world.nieuw();
  const r = world.open(t, "notitieboek");
  assert.equal(t.levels["1"].ontgrendeld, true);
  assert.ok(r.effecten.includes("fragment-gevonden:l1"));
  assert.ok(r.effecten.includes("spread:l1"));
  assert.ok(r.effecten.includes("geluid:pagina"));

  // Een tweede keer: al gevonden, geen nieuw fragment.
  const r2 = world.open(t, "boek");
  assert.deepEqual(r2.tekst, [strings.notitieboek.alGevonden]);
  assert.equal(r2.effecten.length, 0);
});

test("ga aan de pc zitten vereist een ontgrendeld fragment", () => {
  const zonder = world.nieuw();
  const r0 = world.gebruikPc(zonder);
  assert.deepEqual(r0.tekst, [strings.pc.geenFragment]);
  assert.notEqual(zonder.modus, "pc");

  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.sceneId = "zolder-oost";
  const r = world.gebruikPc(t);
  assert.equal(t.modus, "pc");
  assert.ok(r.effecten.includes("pc:open"));
  assert.ok(r.effecten.includes("level-start:1"));
});

test("kijk beschrijft de huidige hoek; onderzoek notitieboek werkt", () => {
  const t = world.nieuw();
  assert.ok(world.kijk(t).tekst[0].includes("westhoek"));
  assert.deepEqual(world.onderzoek(t, "notitieboek").tekst,
    [strings.notitieboek.onderzoek]);
  assert.deepEqual(world.onderzoek(t, "eenhoorn").tekst,
    [strings.datZieJeHierNiet]);
});

test("de zolder-hint hoort bij de hoek en telt NIET in hintsTotaal", () => {
  const t = world.nieuw();
  const r = world.hint(t);
  assert.deepEqual(r.tekst, [strings.scenes["zolder-west"].hint]);
  assert.ok(r.effecten.includes("hint:1"));
  assert.equal(t.hintsTotaal, 0);
});

test("herbegin vraagt bevestiging en geeft pas dan het effect", () => {
  const t = world.nieuw();
  assert.deepEqual(world.herbeginVraag(t).effecten, []);
  const r = world.herbeginBevestig(t);
  assert.ok(r.effecten.includes("herbegin"));
});

test("help somt de zolder-commando's op", () => {
  const r = world.help();
  assert.equal(r.tekst[0], strings.helpTitel);
  assert.ok(r.tekst.length > 3);
});

test("parser dispatcht de zolder-commando's", () => {
  const t = world.nieuw();
  // "kijk" geeft de kamerbeschrijving terug, en niets anders: de kamernaam
  // stond hier als "== naam ==" boven, maar dat is opmaak, en opmaak hoort niet
  // in de logica-laag. De statusbalk draagt de naam.
  assert.deepEqual(AL.parser.verwerk(t, "kijk").tekst,
    [strings.scenes["zolder-west"].beschrijving]);
  assert.deepEqual(AL.parser.verwerk(t, "geluid uit").effecten, ["geluid:uit"]);
  assert.deepEqual(AL.parser.verwerk(t, "brabbel").tekst,
    [strings.datBegrijpJeNiet]);
  // Buiten de zolder-modus laat de parser het aan de engine/overlays over.
  t.modus = "pc";
  assert.deepEqual(AL.parser.verwerk(t, "kijk").tekst,
    [strings.datBegrijpJeNiet]);
});

test("richtingen mogen kaal, afgekort en met lidwoord", () => {
  // Alle vier moeten dezelfde kant op sturen als "ga oost". zolder-west heeft
  // alleen een uitgang naar het oosten, dus die scène verandert of niet.
  for (const vorm of ["ga oost", "oost", "o", "ga naar het oosten",
    "loop oost", "naar oost"]) {
    const t = world.nieuw();
    const r = AL.parser.verwerk(t, vorm);
    assert.ok(r.effecten.some((e) => e.indexOf("scene:") === 0),
      "'" + vorm + "' bracht de speler niet naar het oosten");
  }
});

test("een richting die er niet is, blijft een nette weigering", () => {
  const t = world.nieuw();      // zolder-west: alleen oost
  const r = AL.parser.verwerk(t, "noord");
  assert.ok(!r.effecten.some((e) => e.indexOf("scene:") === 0));
  assert.ok(r.tekst.length > 0);
  assert.notEqual(r.tekst[0], strings.datBegrijpJeNiet,
    "een geldige richting die hier niet kan, is geen onbegrepen commando");
});

test("onderzoek verdraagt lidwoorden en synoniemen", () => {
  const t = world.nieuw();
  t.sceneId = "zolder-oost";
  const kaal = AL.parser.verwerk(t, "onderzoek stoel").tekst[0];
  for (const vorm of ["onderzoek de stoel", "bekijk de stoel",
    "bestudeer stoel", "kijk naar de stoel"]) {
    assert.equal(AL.parser.verwerk(t, vorm).tekst[0], kaal,
      "'" + vorm + "' gaf iets anders dan 'onderzoek stoel'");
  }
});

test("ga zitten gaat naar de pc, ook al begint het met 'ga '", () => {
  // De richtingherkenning strippt "ga " en mag "zitten" dus niet als richting
  // opvatten. Wat de pc dan antwoordt (hier: nog geen fragment) doet er niet
  // toe — het gaat erom dat het commando bij gebruikPc landt en niet bij
  // betreed.
  const t = world.nieuw();
  t.sceneId = "zolder-oost";
  assert.deepEqual(AL.parser.verwerk(t, "ga zitten"), world.gebruikPc(t));
  assert.deepEqual(AL.parser.verwerk(t, "ga werken"), world.gebruikPc(t));
});

test("neem en pak krijgen een antwoord, geen onbegrip", () => {
  const t = world.nieuw();
  for (const vorm of ["neem notitieboek", "pak de doos", "neem"]) {
    assert.deepEqual(AL.parser.verwerk(t, vorm).tekst, [strings.neemNiet],
      "'" + vorm + "' werd niet begrepen");
  }
});
