// test-world-hub.mjs — de uitgebreide zolder-hub (WP 6): de vier-kamer-navigatie,
// de prop-interacties, de fragment-progressie west → midden → overloop, de pc-
// opening, de spread-data (paging + weekregels), en de endgame-sequence (sim →
// Alberta's oordeel → epiloog). Getoetst aan spelontwerp-legacy.md,
// levels-en-scharnieren.md, save-en-hints.md en achtergrond.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadLogica } from "./helpers.mjs";

const AL = laadLogica();
const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
// De spread-renderer + het intro/level-data leven in de scène-laag; laad ze bij.
require(join(wortel, "js", "scenes", "scene-spread-template.js"));

const world = AL.world;
const strings = AL.strings;
const levels = AL.levels;

// ---- Navigatie ------------------------------------------------------------

test("de hub verbindt vier kamers; overloop hangt noord aan de doorgang", () => {
  const paren = [
    ["zolder-west", "oost", "zolder-midden", "west"],
    ["zolder-midden", "oost", "zolder-oost", "west"],
    ["zolder-midden", "noord", "overloop", "zuid"]
  ];
  for (const [a, richting, b, terug] of paren) {
    const ta = world.nieuw(); ta.sceneId = a;
    assert.equal(world.uitgangen(ta)[richting], b, `${a} → ${richting}`);
    const tb = world.nieuw(); tb.sceneId = b;
    assert.equal(world.uitgangen(tb)[terug], a, `${b} → ${terug}`);
  }
});

test("betreed loopt van de doorgang naar de overloop en terug", () => {
  const t = world.nieuw(); t.sceneId = "zolder-midden";
  const omhoog = world.betreed(t, "noord");
  assert.equal(t.sceneId, "overloop");
  assert.ok(omhoog.effecten.includes("scene:overloop"));
  assert.ok(omhoog.tekst.some((r) => r.includes("overloop")));
  const omlaag = world.betreed(t, "zuid");
  assert.equal(t.sceneId, "zolder-midden");
  assert.ok(omlaag.effecten.includes("scene:zolder-midden"));
});

// ---- Prop-interacties -----------------------------------------------------

test("onderzoek geeft per prop een eigen tekst, niet de kamerbeschrijving", () => {
  const t = world.nieuw();
  t.sceneId = "zolder-oost";
  const kamer = strings.scenes["zolder-oost"].beschrijving;
  for (const ding of ["pc", "monitor", "stoel", "bureau", "toetsenbord",
    "koffiemok"]) {
    const r = world.onderzoek(t, ding);
    assert.equal(r.tekst.length, 1, ding + " geeft één alinea");
    assert.ok(r.tekst[0].length > 0, ding + " geeft tekst");
    assert.notEqual(r.tekst[0], kamer,
      "'" + ding + "' geeft de kamerbeschrijving terug in plaats van een detail");
  }
  t.sceneId = "zolder-midden";
  assert.notEqual(world.onderzoek(t, "broncode-doos").tekst[0],
    strings.scenes["zolder-midden"].beschrijving);
  // De gemerkte dozen houden hun eigen tekst: die gaat over de voortgang.
  assert.deepEqual(world.onderzoek(t, "doos").tekst, [strings.dozen.onderzoek]);
});

test("elk zelfstandig naamwoord uit een kamerbeschrijving is te onderzoeken", () => {
  // De QC-poort van het scènewerk luidt "elk zelfstandig naamwoord in de
  // beschrijving moet aanwijsbaar zijn". Dit is de tekstkant daarvan: geen van
  // deze woorden mag "Dat zie je hier niet" opleveren.
  const perKamer = {
    "zolder-west": ["dozen", "balken", "dakraam", "kist", "notitieboek", "pen"],
    "zolder-midden": ["balken", "doos", "tape", "label", "trap"],
    "zolder-oost": ["stoel", "bureau", "pc", "monitor", "toetsenbord", "mok"],
    "overloop": ["trap", "dozen", "wand"]
  };
  const t = world.nieuw();
  for (const [scene, woorden] of Object.entries(perKamer)) {
    t.sceneId = scene;
    for (const woord of woorden) {
      const r = world.onderzoek(t, woord);
      assert.notEqual(r.tekst[0], strings.datZieJeHierNiet,
        scene + ": '" + woord + "' wordt niet herkend");
    }
  }
});

test("een woord dat er niet is, blijft netjes afgewezen", () => {
  const t = world.nieuw();
  t.sceneId = "zolder-west";
  assert.deepEqual(world.onderzoek(t, "olifant").tekst,
    [strings.datZieJeHierNiet]);
});

test("de broncode-doos telt pas op het einde (geen fragment-effect)", () => {
  const t = world.nieuw(); t.sceneId = "zolder-midden";
  const r = world.open(t, "broncode-doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.dozen.broncodeDicht]);
  // De broncode-doos ontgrendelt geen enkel level.
  for (let n = 1; n <= 7; n++) assert.equal(t.levels[String(n)].ontgrendeld, false);
});

// ---- Fragment-progressie --------------------------------------------------

test("volgendFragment loopt strikt oplopend 1..7 en dan null", () => {
  const t = world.nieuw();
  assert.equal(world.volgendFragment(t), 1);
  for (let n = 1; n <= 7; n++) t.levels[String(n)].ontgrendeld = true;
  assert.equal(world.volgendFragment(t), null);
});

// Het hoofdstuk dat nu open staat, herstellen — wat de pc doet als alle drie de
// puzzels af zijn. Sinds de poort van WP 47 is dit de enige manier om aan het
// volgende blad te raken, dus staat het in elke volgorde-test tussen de dozen.
function herstelActief(t) {
  t.levels[String(t.levelActief)].afgerond = true;
}

test("de fragmenten liggen west → midden → overloop, in volgorde", () => {
  const t = world.nieuw();
  // Level 1: het notitieboek in de westhoek.
  let r = world.open(t, "notitieboek");
  assert.ok(r.effecten.includes("fragment-gevonden:l1"));
  assert.ok(r.effecten.includes("spread:l1"));

  // Levels 2–4: de gemerkte dozen in de doorgang. Elk blad komt er pas uit als
  // het vorige hoofdstuk hersteld is.
  t.sceneId = "zolder-midden";
  for (const n of [2, 3, 4]) {
    herstelActief(t);
    r = world.open(t, "doos");
    assert.ok(r.effecten.includes("fragment-gevonden:l" + n), "l" + n);
    assert.equal(t.levels[String(n)].ontgrendeld, true);
  }
  // Het vijfde fragment ligt niet meer hier: de doos wijst naar de overloop.
  herstelActief(t);
  r = world.open(t, "doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.dozen.nietHier["overloop"]]);

  // Levels 5–7: de dozen op de overloop.
  t.sceneId = "overloop";
  for (const n of [5, 6, 7]) {
    if (n > 5) herstelActief(t);
    r = world.open(t, "doos");
    assert.ok(r.effecten.includes("fragment-gevonden:l" + n), "l" + n);
  }
  // Alles gevonden.
  r = world.open(t, "doos");
  assert.deepEqual(r.tekst, [strings.dozen.allesGevonden]);
  // De fragment-progressie telt NIET in hintsTotaal.
  assert.equal(t.hintsTotaal, 0);
});

test("een doos in de verkeerde kamer wijst naar de juiste plek", () => {
  const t = world.nieuw();          // nog niets ontgrendeld: volgende = l1 (west)
  t.sceneId = "zolder-midden";
  const r = world.open(t, "doos");
  assert.deepEqual(r.effecten, []);
  assert.deepEqual(r.tekst, [strings.dozen.nietHier["zolder-west"]]);
});

// ---- De poort aan de doos (WP 47): vinden volgt oplossen -------------------

test("de doos weigert zolang het vorige hoofdstuk niet hersteld is", () => {
  // Het gemelde defect: blad 2 was te vinden vóór hoofdstuk 1 opgelost was, en
  // omdat ontgrendelFragment levelActief meeneemt en het pc-menu geen
  // levelkeuze kent, waren de puzzels van hoofdstuk 1 daarna onbereikbaar.
  const t = world.nieuw();
  world.open(t, "notitieboek");                  // l1 ontgrendeld, niet af
  t.sceneId = "zolder-midden";
  const r = world.open(t, "doos");
  assert.deepEqual(r.tekst, [strings.dozen.nogDicht(1)]);
  assert.deepEqual(r.effecten, [], "een weigering maakt geen geluid");
  assert.equal(t.levels["2"].ontgrendeld, false, "l2 blijft dicht");
  assert.equal(t.levelActief, 1, "levelActief blijft bij het open hoofdstuk");
  assert.equal(t.hintsTotaal, 0);
});

test("de weigering wint van de kamerverwijzing: die zou naar een even dichte doos sturen", () => {
  // Gepoort én in de verkeerde kamer. dozen.nietHier zou hier naar de doorgang
  // wijzen, maar de doos daar is even goed dicht — de echte volgende zet is
  // hoofdstuk 1 herstellen, en dát zegt nogDicht.
  const t = world.nieuw();
  world.open(t, "notitieboek");                  // volgende blad = 2 (doorgang)
  t.sceneId = "overloop";
  const r = world.open(t, "doos");
  assert.deepEqual(r.tekst, [strings.dozen.nogDicht(1)]);
  assert.deepEqual(r.effecten, []);
  // Staat de poort wél open, dan wijst dezelfde doos weer gewoon de weg.
  herstelActief(t);
  assert.deepEqual(world.open(t, "doos").tekst,
    [strings.dozen.nietHier["zolder-midden"]]);
});

test("de doos gaat open zodra het hoofdstuk hersteld is", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.sceneId = "zolder-midden";
  world.open(t, "doos");                         // geweigerd
  t.levels["1"].afgerond = true;
  const r = world.open(t, "doos");
  assert.ok(r.effecten.includes("fragment-gevonden:l2"));
  assert.equal(t.levels["2"].ontgrendeld, true);
  assert.equal(t.levelActief, 2);
});

test("de poort staat voor elk van de zes dozen, en telkens noemt ze het juiste hoofdstuk", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");
  for (let n = 2; n <= 7; n++) {
    t.sceneId = world.FRAGMENT_LOCATIE[n];
    const geweigerd = world.open(t, "doos");
    assert.deepEqual(geweigerd.tekst, [strings.dozen.nogDicht(n - 1)], "l" + n);
    assert.deepEqual(geweigerd.effecten, [], "l" + n);
    t.levels[String(n - 1)].afgerond = true;
    assert.ok(world.open(t, "doos").effecten.includes("fragment-gevonden:l" + n),
      "l" + n);
  }
});

test("het notitieboek heeft geen voorganger en blijft vrij", () => {
  // Fragment 1 hangt aan niets: een verse speler moet er altijd in kunnen.
  const t = world.nieuw();
  const r = world.open(t, "notitieboek");
  assert.ok(r.effecten.includes("fragment-gevonden:l1"));
  assert.equal(t.levels["1"].ontgrendeld, true);
  // En de dozen in de doorgang weigeren vóór dat boek open ging niet met de
  // poort maar met de kamerverwijzing: er is geen hoofdstuk 0.
  const t2 = world.nieuw();
  t2.sceneId = "zolder-midden";
  assert.deepEqual(world.open(t2, "doos").tekst,
    [strings.dozen.nietHier["zolder-west"]]);
});

test("geen enkele bereikbare staat laat levelActief boven een onafgewerkt hoofdstuk staan", () => {
  // De regressietest op het echte defect, en bewust uitputtend in plaats van
  // steekproefsgewijs: een toevallige wandeling raakt zelden voorbij hoofdstuk
  // 1, want vooruitkomen vergt een keten (herstellen → juiste kamer → 'open
  // doos'). Daarom een breedte-eerst doorloop van álle staten die via de
  // publieke API bereikbaar zijn: lopen, het boek en de dozen openen, aan de pc
  // gaan zitten, en het actieve hoofdstuk herstellen — dat laatste is wat de
  // pc-laag doet zodra de drie puzzels af zijn, en het is de enige stap die
  // deze test zelf in de staat schrijft.
  const acties = [];
  for (const r of ["noord", "oost", "zuid", "west"]) {
    acties.push(["ga " + r, (t) => world.betreed(t, r)]);
  }
  for (const d of ["doos", "karton", "notitieboek", "kist", "broncode-doos"]) {
    acties.push(["open " + d, (t) => world.open(t, d)]);
  }
  acties.push(["ga zitten", (t) => world.gebruikPc(t)]);
  acties.push(["hoofdstuk hersteld", (t) => {
    // De pc-laag kan alleen een hoofdstuk afronden dat ze ook kon openen.
    const actief = t.levels[String(t.levelActief)];
    if (actief.ontgrendeld) actief.afgerond = true;
  }]);

  // De sleutel draagt alles waar bovenstaande functies op beslissen.
  const sleutel = (t) => t.sceneId + "|" + t.levelActief + "|" +
    [1, 2, 3, 4, 5, 6, 7].map((n) => (t.levels[String(n)].ontgrendeld ? "1" : "0") +
      (t.levels[String(n)].afgerond ? "1" : "0")).join("");

  const start = world.nieuw(1);
  const gezien = new Set([sleutel(start)]);
  const wachtrij = [[JSON.stringify(start), []]];
  let bezocht = 0;

  while (wachtrij.length) {
    const [rauw, pad] = wachtrij.shift();
    bezocht++;
    for (const [naam, doe] of acties) {
      const t = JSON.parse(rauw);          // de staat round-tript: geen cycli
      doe(t);
      t.modus = "zolder";                  // gebruikPc zet de modus; de engine
      const weg = pad.concat(naam);        // brengt de speler weer terug
      for (let k = 1; k < t.levelActief; k++) {
        assert.equal(t.levels[String(k)].afgerond, true,
          "hoofdstuk " + k + " staat nog open terwijl levelActief " +
          t.levelActief + " is, via: " + weg.join(" → "));
      }
      for (let k = 2; k <= 7; k++) {
        if (t.levels[String(k)].ontgrendeld) {
          assert.equal(t.levels[String(k - 1)].afgerond, true,
            "l" + k + " ontgrendeld terwijl hoofdstuk " + (k - 1) +
            " nog open staat, via: " + weg.join(" → "));
        }
      }
      const s = sleutel(t);
      if (!gezien.has(s)) { gezien.add(s); wachtrij.push([JSON.stringify(t), weg]); }
    }
  }

  // De doorloop moet écht tot het einde geraken, anders bewijst hij niets.
  assert.ok(bezocht > 20, "te weinig staten doorlopen: " + bezocht);
  assert.ok([...gezien].some((s) => s.indexOf("|7|") !== -1 && s.endsWith("11")),
    "de doorloop bereikt hoofdstuk 7 hersteld nooit");
});

// ---- De woordenschat per kamer: doos, kist, karton -------------------------

test("in de westhoek zijn de dozen en de kist te openen, maar zonder fragment", () => {
  // De westhoek staat vól geschilderde dozen en er ligt een kist onder het
  // notitieboek. "Dat zie je hier niet" was daarop het verkeerde antwoord.
  //
  // Ze klinken wél: een deksel dat opengaat maakt geluid, ook als er niets in
  // zit (WP 37). Dat is de enige effect-tag die deze twee antwoorden dragen.
  const t = world.nieuw();                       // sceneId: zolder-west
  for (const woord of ["doos", "dozen", "karton"]) {
    const r = world.open(t, woord);
    assert.deepEqual(r.tekst, [strings.dozen.westhoek], woord);
    assert.deepEqual(r.effecten, ["geluid:doos"], woord);
  }
  for (const woord of ["kist", "koffer"]) {
    const r = world.open(t, woord);
    assert.deepEqual(r.tekst, [strings.kist.open], woord);
    assert.deepEqual(r.effecten, ["geluid:doos"], woord);
  }
  // Geen van beide ontgrendelt iets: het fragment van hoofdstuk 1 zit in het
  // notitieboek.
  assert.equal(t.levels["1"].ontgrendeld, false);
});

test("in de doorgang en op de overloop is 'kist' geen open-woord meer", () => {
  // Daar staat geen kist getekend; het woord hoorde bij de westhoek.
  for (const scene of ["zolder-midden", "overloop"]) {
    const t = world.nieuw(); t.sceneId = scene;
    const r = world.open(t, "kist");
    assert.deepEqual(r.tekst, [strings.datZieJeHierNiet], scene);
    assert.equal(world.volgendFragment(t), 1, scene + ": niets ontgrendeld");
  }
});

test("'open doos' en 'open karton' blijven de fragment-dozen openen", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");                  // l1 uit de weg
  herstelActief(t);                              // en hersteld: de poort open
  t.sceneId = "zolder-midden";
  assert.ok(world.open(t, "karton").effecten.includes("fragment-gevonden:l2"));
  herstelActief(t);
  assert.ok(world.open(t, "doos").effecten.includes("fragment-gevonden:l3"));
});

// ---- Het geluid van een doos die opengaat ----------------------------------

test("een fragmentdoos klinkt als karton, en pas daarna als papier", () => {
  // De doos-cue stond sinds WP I in de tabel en werd nergens afgevuurd — de
  // enige cue in het spel die alleen op papier bestond. Een doos die opengaat
  // hoorde `pagina` te spelen, hetzelfde geluid als het omslaan van een blad.
  const t = world.nieuw();
  world.open(t, "notitieboek");                  // l1 uit de weg
  herstelActief(t);                              // en hersteld: de poort open
  t.sceneId = "zolder-midden";
  const r = world.open(t, "karton");
  assert.ok(r.effecten.includes("geluid:doos"),
    "geen doos-cue bij het openen van een fragmentdoos: " + r.effecten);
  // Het blad komt ná de bonk: twee foley-cues op hetzelfde moment zijn samen
  // één modderige klik.
  const blad = r.effecten.find((e) => e.indexOf("geluid:pagina") === 0);
  assert.equal(blad, "geluid:pagina@0.35");
  assert.ok(r.effecten.indexOf("geluid:doos") < r.effecten.indexOf(blad));
});

test("het notitieboek klinkt als één bladzijde, zonder karton", () => {
  const t = world.nieuw();                       // sceneId: zolder-west
  const r = world.open(t, "notitieboek");
  assert.ok(r.effecten.includes("geluid:pagina"));
  assert.ok(!r.effecten.some((e) => e.indexOf("geluid:doos") === 0),
    "een boek is geen doos: " + r.effecten);
});

// ---- Aan de pc gaan zitten ------------------------------------------------

test("ga zitten opent de pc zodra een fragment ontgrendeld is", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.sceneId = "zolder-oost";
  const r = world.gebruikPc(t);
  assert.equal(t.modus, "pc");
  assert.ok(r.effecten.includes("pc:open"));
  assert.ok(r.effecten.includes("level-start:1"));
});

test("ga zitten met een afgerond hoofdstuk wijst naar het volgende blad", () => {
  // De zachte doodlopende lus: de pc ging opnieuw open op een level waar alles
  // al af was, en niets wees de speler naar het volgende fragment.
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.levels["1"].afgerond = true;
  t.sceneId = "zolder-oost";
  const r = world.gebruikPc(t);
  assert.notEqual(t.modus, "pc", "de pc hoort dicht te blijven");
  assert.deepEqual(r.effecten, []);
  // Twee regels: het hoofdstuk is klaar, én waar het volgende blad ligt.
  assert.deepEqual(r.tekst, [strings.pc.levelAf,
    strings.hints.fragmentGinder["zolder-midden"]]);

  // Staat de speler al in de doorgang, dan zegt dezelfde melding "hier".
  t.sceneId = "zolder-midden";
  assert.deepEqual(world.gebruikPc(t).tekst, [strings.pc.levelAf,
    strings.hints.fragmentHier["zolder-midden"]]);
});

test("met alles ontgrendeld en af gaat de pc gewoon open (endgame-pad)", () => {
  const t = world.nieuw();
  for (let n = 1; n <= 7; n++) {
    t.levels[String(n)].ontgrendeld = true;
    t.levels[String(n)].afgerond = true;
  }
  t.levelActief = 7;
  t.sceneId = "zolder-oost";
  const r = world.gebruikPc(t);
  assert.equal(t.modus, "pc");
  assert.ok(r.effecten.includes("pc:open"));
  assert.ok(r.effecten.includes("level-start:7"));
});

// ---- De '?'-hint: de volledige beslisboom ---------------------------------

// De hint is progress-aware: hij zegt wat er NU te doen staat, niet wat er in
// deze hoek staat. De takken hieronder zijn alle situaties uit world.hint.
test("hint 1: niets ontgrendeld → naar het notitieboek in de westhoek", () => {
  const t = world.nieuw();
  // In de westhoek zelf: hier.
  assert.deepEqual(world.hint(t).tekst,
    [strings.hints.fragmentHier["zolder-west"]]);
  // Elders: ginder, met de weg erbij.
  for (const scene of ["zolder-midden", "zolder-oost", "overloop"]) {
    t.sceneId = scene;
    assert.deepEqual(world.hint(t).tekst,
      [strings.hints.fragmentGinder["zolder-west"]], scene);
  }
});

test("hint 2: een ontgrendeld, onafgewerkt hoofdstuk stuurt naar de pc", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");                  // l1 ontgrendeld, niet af
  t.sceneId = "zolder-oost";
  assert.deepEqual(world.hint(t).tekst, [strings.hints.werkPcHier]);
  for (const scene of ["zolder-west", "zolder-midden", "overloop"]) {
    t.sceneId = scene;
    assert.deepEqual(world.hint(t).tekst, [strings.hints.werkPcElders], scene);
  }
});

test("hint 3: hoofdstuk af → het volgende blad, in deze kamer of ginder", () => {
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.levels["1"].afgerond = true;                 // volgend fragment: l2, doorgang
  t.sceneId = "zolder-midden";
  assert.deepEqual(world.hint(t).tekst,
    [strings.hints.fragmentHier["zolder-midden"]]);
  t.sceneId = "zolder-oost";
  assert.deepEqual(world.hint(t).tekst,
    [strings.hints.fragmentGinder["zolder-midden"]]);
});

test("hint 4: de doorgang stuurt NIET meer weg van de dozen met 2, 3 en 4", () => {
  // Het oorspronkelijke defect: de vaste hint van zolder-midden zei "ga naar
  // het oosten, naar de pc" terwijl de fragmenten 2–4 in de dozen van die
  // kamer zaten.
  const t = world.nieuw();
  t.sceneId = "zolder-midden";
  for (const n of [2, 3, 4]) {
    // Alles tot en met n-1 ontgrendeld én afgerond: het volgende blad is n.
    for (let k = 1; k < n; k++) {
      t.levels[String(k)].ontgrendeld = true;
      t.levels[String(k)].afgerond = true;
    }
    t.levelActief = n - 1;
    assert.equal(world.volgendFragment(t), n);
    assert.deepEqual(world.hint(t).tekst,
      [strings.hints.fragmentHier["zolder-midden"]], "fragment " + n);
  }
});

test("hint 5: de latere fragmenten wijzen naar de overloop", () => {
  const t = world.nieuw();
  for (let k = 1; k <= 4; k++) {
    t.levels[String(k)].ontgrendeld = true;
    t.levels[String(k)].afgerond = true;
  }
  t.levelActief = 4;
  assert.equal(world.volgendFragment(t), 5);
  t.sceneId = "zolder-midden";
  assert.deepEqual(world.hint(t).tekst,
    [strings.hints.fragmentGinder["overloop"]]);
  t.sceneId = "overloop";
  assert.deepEqual(world.hint(t).tekst,
    [strings.hints.fragmentHier["overloop"]]);
});

test("hint 6: alles gevonden en hersteld → er ligt hier niets meer", () => {
  const t = world.nieuw();
  for (let n = 1; n <= 7; n++) {
    t.levels[String(n)].ontgrendeld = true;
    t.levels[String(n)].afgerond = true;
  }
  t.levelActief = 7;
  for (const scene of ["zolder-west", "zolder-midden", "zolder-oost", "overloop"]) {
    t.sceneId = scene;
    assert.deepEqual(world.hint(t).tekst, [strings.hints.allesAf], scene);
  }
});

test("de zolder-hint blijft gratis: hij telt nooit in hintsTotaal", () => {
  const t = world.nieuw();
  for (const scene of ["zolder-west", "zolder-midden", "zolder-oost", "overloop"]) {
    t.sceneId = scene;
    const r = world.hint(t);
    assert.deepEqual(r.effecten, ["hint:1"], scene);
    assert.equal(r.tekst.length, 1, scene);
  }
  assert.equal(t.hintsTotaal, 0);
});

test("de hint en de pc spreken elkaar niet tegen", () => {
  // Beide hangen aan levelActief en volgendFragment; als de pc zegt "zoek het
  // volgende blad", zegt '?' precies waar dat ligt.
  const t = world.nieuw();
  world.open(t, "notitieboek");
  t.levels["1"].afgerond = true;
  for (const scene of ["zolder-west", "zolder-midden", "zolder-oost", "overloop"]) {
    t.sceneId = scene;
    const pc = world.gebruikPc(t);
    assert.equal(pc.tekst[1], world.hint(t).tekst[0], scene);
  }
});

test("de vaste scene-hints zijn weg: geen dode tekst die de spelstand negeert", () => {
  for (const id of ["zolder-west", "zolder-midden", "zolder-oost", "overloop"]) {
    assert.equal(strings.scenes[id].hint, undefined, id);
  }
  assert.equal(strings.geenPlaatsHint, undefined);
});

// ---- Spread-data (paging + weekregels) ------------------------------------

test("elke level-spread telt meerdere pagina's", () => {
  for (let n = 1; n <= 7; n++) {
    const data = strings.spreads["l" + n];
    assert.ok(data, "spread l" + n);
    assert.ok(AL.spreads.aantalPaginas(data) >= 2, "l" + n + " pagina's");
  }
  // De intro is bewust géén spread meer: de achtergrond hoort niet op een
  // bladzijde van het notitieboek te staan vóór de speler dat boek gevonden
  // heeft. Ze staat nu in AL.strings.intro (zie de test hieronder).
  assert.equal(strings.spreads.intro, undefined,
    "de intro hoort geen notitieboek-spread meer te zijn");
});

test("de weekregels gebruiken de echte cursusweken 1,2,2,3,4,5,6", () => {
  const verwacht = [1, 2, 2, 3, 4, 5, 6];
  for (let n = 1; n <= 7; n++) {
    const data = strings.spreads["l" + n];
    assert.equal(data.week, verwacht[n - 1], "week van l" + n);
    // De weekregel staat als voet op een pagina, met de juiste week.
    const voeten = data.paginas.map((p) => p.voet).filter(Boolean);
    assert.ok(voeten.some((v) => v.toLowerCase().includes("week " + verwacht[n - 1])),
      "weekregel l" + n);
  }
});

test("de intro draagt de prototype-regel verbatim", () => {
  // De kernfictie uit achtergrond.md, §"Prototype-fase". Ze mag van drager
  // veranderen maar niet van bewoording.
  const plat = JSON.stringify(strings.intro);
  assert.ok(plat.includes(
    "Alberta bouwde elk spel eerst als tekstversie in de terminal."));
});

test("de intro noemt waar het spel over gaat, maar niet waarom Alberta weg is", () => {
  const plat = JSON.stringify(strings.intro).toLowerCase();
  // De duisternis komt uit Seven Little Goats zelf.
  assert.ok(plat.includes("geitjes"), "de intro benoemt de inzet van het spel");
  // En de verdwijning blijft onverklaard (achtergrond.md: nooit een oorzaak).
  for (const oorzaak of ["ziek", "ongeval", "gestorven", "overleden", "dood",
    "vermoord", "verdronken"]) {
    assert.ok(!plat.includes(oorzaak),
      "de intro suggereert een oorzaak: '" + oorzaak + "'");
  }
});

// ---- Endgame: sim → oordeel → epiloog -------------------------------------

test("startOordeel kiest de tier uit hintsTotaal en zet de modus", () => {
  const gevallen = [
    [0, "meesterhand"], [3, "meesterhand"], [4, "vakvrouw"], [10, "vakvrouw"],
    [11, "doorzetter"], [20, "doorzetter"], [21, "samen-geraakt"], [99, "samen-geraakt"]
  ];
  for (const [h, tier] of gevallen) {
    const t = world.nieuw(); t.hintsTotaal = h;
    const r = world.startOordeel(t);
    assert.equal(t.modus, "oordeel");
    assert.equal(t.einde, tier, "h=" + h);
    assert.ok(r.effecten.includes("oordeel:" + tier));
    // De getoonde tier heeft een titel + tekst.
    assert.ok(strings.oordeel[tier].titel.length > 0);
    assert.equal(levels.oordeel(h), tier);
  }
});

test("simVoltooid leidt van de sim naar Alberta's oordeel", () => {
  const t = world.nieuw(); t.hintsTotaal = 15;
  const r = world.simVoltooid(t, "wraak");
  assert.ok(r.effecten.includes("sim:einde:wraak"));
  assert.ok(r.effecten.includes("oordeel:doorzetter"));
  assert.equal(t.modus, "oordeel");
});

test("bootSim kondigt de endgame aan", () => {
  const t = world.nieuw();
  const r = world.bootSim(t);
  assert.ok(r.effecten.includes("sim:boot"));
  assert.ok(r.effecten.includes("geluid:boot"));
});

test("de epiloog is bereikbaar en wijst naar de broncode + Roberta", () => {
  const t = world.nieuw();
  world.startOordeel(t);
  const r = world.startEpiloog(t);
  assert.equal(t.modus, "epiloog");
  assert.ok(r.effecten.includes("epiloog"));
  const tekst = r.tekst.join(" ");
  assert.ok(tekst.includes("seven-little-goats/"), "wijst naar de broncode");
  assert.ok(tekst.includes(
    "Voor Roberta Williams, en voor iedereen die de spellen maakte waar dit " +
    "vak vandaan komt"), "de Roberta-opdracht, verbatim");
});
