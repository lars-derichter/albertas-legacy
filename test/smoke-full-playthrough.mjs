// smoke-full-playthrough.mjs — DE doorlopende playthrough-test (WP 11). Anders
// dan de deel-smoketests (smoke-levels-1-3, smoke-levels-4-7, smoke-sim), die elk
// een plak dekken en soms een debug-sprong (debugStartPc) gebruiken om tijd te
// sparen, speelt DEZE test het HELE spel in één ononderbroken run, ZONDER enige
// debug-sprong of neptrigger:
//
//   verse start (localStorage gewist, ?seed=1) → titel + intro → zolder →
//   voor level 1..7: vind het fragment via échte bewegingscommando's → lees de
//   spread → ga aan de pc zitten → los de drie puzzels op met de modeloplossingen
//   → level-af → keer terug → volgend fragment → ... → level-af:7 boot de sim
//   ECHT (geen debugSimVoltooid) → speel een winnend script → sim:einde →
//   oordeel → epiloog.
//
// Dit bewijst dat de cumulatieve staat (save, hint-tellers, level-registry,
// seed-variatie) een volledige run overleeft zonder dat één stap op een reset
// leunt. Extra bewijzen:
//   - de save overleeft een reload halverwege (na level 3);
//   - er wordt NOOIT een hint gevraagd, dus hintsTotaal blijft 0 en het oordeel
//     bereikt de beste tier "meesterhand" — wat meteen bewijst dat de
//     hint-telling niet tussen levels lekt.
//
// De navigatie- en oplospatronen zijn hergebruikt uit smoke-levels-1-3.mjs en
// smoke-levels-4-7.mjs; de sim-script uit smoke-sim.mjs (het einde "de les").
// Deze test mag lang duren — hij speelt het hele spel.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium vereist (npx playwright install chromium).

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");
const indexPad = join(wortel, "index.html");
// Waar de screenshots landen. Stond hier vroeger als een absoluut pad van de
// machine van de auteur, waardoor deze test bij niemand anders liep. Nu een
// map in de repo (test-results/ staat al in .gitignore), te overschrijven met
// de omgevingsvariabele AL_SCRATCH.
const SCRATCH = process.env.AL_SCRATCH || join(wortel, "test-results");
mkdirSync(SCRATCH, { recursive: true });
const SEED = 1;

function url() { return pathToFileURL(indexPad).href + "?seed=" + SEED; }

const rijen = [];
function check(naam, voorwaarde, detail) {
  rijen.push({ naam, ok: !!voorwaarde });
  console.log("  " + (voorwaarde ? "PASS" : "FAIL") + "  " + naam +
    (detail ? "  (" + detail + ")" : ""));
  return !!voorwaarde;
}

function ev(page, fn, arg) { return page.evaluate(fn, arg); }
function state(page) { return page.evaluate(() => window.AL.debugState); }

async function sluitVensters(page) {
  for (let i = 0; i < 40; i++) {
    if (!(await state(page)).vensterOpen) return;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(45);
  }
}

// Blader door titel + intro-spread tot je in de zolder staat (geen open venster).
async function naarZolder(page) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.titelActief && st.modus === "zolder" && !st.vensterOpen) return;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(
    () => window.AL.debugState.titelActief === false &&
      window.AL.debugState.modus === "zolder", null, { timeout: 15000 });
}

async function typCommando(page, cmd) {
  await sluitVensters(page);
  await page.keyboard.type(cmd, { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(140);
}

async function doorbladerSpread(page) {
  await sluitVensters(page);
  for (let i = 0; i < 12; i++) {
    if ((await state(page)).modus !== "spread") break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(70);
  }
  await sluitVensters(page);
}

async function wachtView(page, view) {
  await page.waitForFunction((v) => window.AL.pc.debug.view() === v, view,
    { timeout: 8000 });
}

// Los één puzzel op met de modeloplossing / het juiste antwoord, per type. De
// juiste antwoorden komen uit de level-definitie zelf (model / verwacht /
// parsonsVolgorde) — hetzelfde mechanisme als in de deel-smoketests; er wordt
// NOOIT '?' getypt, dus er lekt geen hint in hintsTotaal.
async function losPuzzelOp(page, def) {
  await ev(page, (id) => window.AL.pc.debug.kies(id), def.id);
  if (def.type === "editor") {
    await wachtView(page, "editor");
    const model = await ev(page, (id) => window.AL.pc.debug.model(id), def.id);
    await page.fill(".pc-editor-invoer", model);
    await page.click(".pc-knop-compileer");
    await page.waitForTimeout(140);
  } else {
    await wachtView(page, "terminal");
    if (def.type === "parsons") {
      const volgorde = await ev(page, () => window.AL.pc.debug.parsonsVolgorde());
      await page.fill(".pc-term-invoer", volgorde);
      await page.press(".pc-term-invoer", "Enter");
    } else if (def.type === "trace" || def.type === "vindfout" ||
               def.type === "patroonkaart") {
      const antwoord = await ev(page, () => window.AL.pc.debug.verwacht());
      await page.fill(".pc-term-invoer", String(antwoord));
      await page.press(".pc-term-invoer", "Enter");
    } else if (def.type === "verklaar") {
      // Verklaar is een zelf-check: de eerste regel legt je zin vast (inhoud telt
      // niet), de tweede ("juist") bevestigt. Beide zijn niet-bestraffend.
      await page.fill(".pc-term-invoer", "mijn verklaring in eigen woorden");
      await page.press(".pc-term-invoer", "Enter");
      await page.waitForTimeout(80);
      await page.fill(".pc-term-invoer", "juist");
      await page.press(".pc-term-invoer", "Enter");
    }
    await page.waitForTimeout(120);
  }
}

// De volledige levellus: van de zolder (via het fragment + de spread) tot
// level-af. Bij level 7 keert de speler niet terug maar boot de sim.
async function speelLevel(page, n, naarFragment) {
  // 1. Vind het fragment → spread.
  await naarFragment(page);
  await page.waitForFunction(() => window.AL.debugState.modus === "spread",
    null, { timeout: 15000 });
  check("L" + n + ": het fragment opent de spread", (await state(page)).modus === "spread");
  const ontgr = await ev(page, (id) => window.AL.debugToestand.levels[id].ontgrendeld, String(n));
  check("L" + n + ": fragment ontgrendeld", ontgr === true);

  // 2. Lees de spread → sta bij de pc in de werkhoek.
  await doorbladerSpread(page);
  const naSpread = await state(page);
  check("L" + n + ": na de spread sta je bij de pc (werkhoek)",
    naSpread.modus === "zolder" && naSpread.sceneId === "zolder-oost",
    "scene=" + naSpread.sceneId);

  // 3. Ga aan de pc zitten → pc-overlay op het juiste level.
  await typCommando(page, "ga zitten");
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen),
    null, { timeout: 15000 });
  const sPc = await state(page);
  check("L" + n + ": de pc opent op het juiste level",
    sPc.modus === "pc" && sPc.overlayOpen === true && String(sPc.levelActief) === String(n),
    "levelActief=" + sPc.levelActief);

  // 4. Los alle drie de puzzels op met de modeloplossingen.
  const defs = await ev(page, (id) =>
    window.AL.levels.puzzelDefs(id).map((d) => ({ id: d.id, type: d.type })), String(n));
  check("L" + n + ": het menu toont drie puzzels", defs.length === 3, "n=" + defs.length);
  for (const def of defs) {
    await losPuzzelOp(page, def);
    const status = await ev(page, (id) => window.AL.pc.debug.statussen()[id], def.id);
    check("L" + n + ": puzzel " + def.id + " opgelost", status === "af");
  }

  // 5. Level-af én — cruciaal — geen enkele hint gebruikt (de teller lekt niet
  //    tussen levels; hij staat nog altijd op 0).
  const afgerond = await ev(page, (id) => window.AL.debugToestand.levels[id].afgerond, String(n));
  check("L" + n + ": level-af (het hoofdstuk is hersteld)", afgerond === true);
  const hints = (await state(page)).hintsTotaal;
  check("L" + n + ": hintsTotaal nog 0 na dit level (geen hint-lek)", hints === 0,
    "hintsTotaal=" + hints);

  // 6. Level 7 boot de sim; anders keer je terug in de zolder (Esc sluit de pc).
  if (n === 7) {
    await page.waitForFunction(() => window.AL.debugState.modus === "sim",
      null, { timeout: 15000 });
    check("L7: level-af:7 boot de sim ECHT (endgame start, geen stub)",
      (await state(page)).modus === "sim");
    return;
  }
  await page.click(".pc-editor-invoer").catch(() => {});
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.AL.debugState.modus === "zolder",
    null, { timeout: 15000 });
  check("L" + n + ": terug in de zolder na het level",
    (await state(page)).modus === "zolder");
}

// Navigatie naar het volgende fragment vanuit de werkhoek (zolder-oost).
async function naarNotitieboek(page) {   // level 1
  await typCommando(page, "open notitieboek");
}
async function naarDoorgangDoos(page) {  // levels 2–4 (zolder-midden)
  await typCommando(page, "ga west");
  await typCommando(page, "open doos");
}
async function naarOverloopDoos(page) {  // levels 5–7 (overloop)
  await typCommando(page, "ga west");
  await typCommando(page, "ga noord");
  await typCommando(page, "open doos");
}

async function main() {
  let playwright;
  try { playwright = await import("playwright"); }
  catch (_e) {
    console.error("Playwright ontbreekt: npm install -D playwright && npx playwright install chromium");
    process.exit(1);
  }

  const browser = await playwright.chromium.launch({
    args: ["--allow-file-access-from-files"]
  });

  console.log("Doorlopende playthrough — het HELE spel in één run\n");

  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const paginaFouten = [];
  page.on("pageerror", (e) => paginaFouten.push(e.message));

  // === Verse start: wis localStorage, dan met ?seed=1 herladen ==============
  await page.goto(url(), { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL, { timeout: 15000 });
  await ev(page, () => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });

  const startSt = await state(page);
  check("verse start: geen save, dus de titelkaart staat er", startSt.titelActief === true,
    "titelActief=" + startSt.titelActief);
  check("verse start: de seed is de vaste QA-seed", startSt.seed === SEED, "seed=" + startSt.seed);

  await naarZolder(page);
  const inZolder = await state(page);
  check("intro doorlopen: je staat in de westhoek van de zolder",
    inZolder.modus === "zolder" && inZolder.sceneId === "zolder-west",
    "scene=" + inZolder.sceneId);
  check("verse start: hintsTotaal begint op 0", inZolder.hintsTotaal === 0);

  // === Levels 1–3 continu ===================================================
  await speelLevel(page, 1, naarNotitieboek);
  await speelLevel(page, 2, naarDoorgangDoos);
  await speelLevel(page, 3, naarDoorgangDoos);

  // === Save overleeft een reload halverwege (na level 3) ====================
  const voorReload = await state(page);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  const naReload = await state(page);
  check("reload na L3: geen titelkaart, de save hervat direct",
    naReload.titelActief === false && naReload.modus === "zolder",
    "modus=" + naReload.modus);
  check("reload na L3: de seed overleeft de reload", naReload.seed === SEED, "seed=" + naReload.seed);
  const afgerond123 = await ev(page, () => [1, 2, 3].map(
    (n) => window.AL.debugToestand.levels[String(n)].afgerond));
  check("reload na L3: levels 1–3 nog afgerond (save hersteld)",
    afgerond123.every(Boolean), afgerond123.join(","));
  check("reload na L3: hintsTotaal nog 0 na de reload", naReload.hintsTotaal === 0);

  // === Levels 4–7 continu (7 boot de sim) ===================================
  await speelLevel(page, 4, naarDoorgangDoos);
  await speelLevel(page, 5, naarOverloopDoos);
  await speelLevel(page, 6, naarOverloopDoos);
  await speelLevel(page, 7, naarOverloopDoos);
  await page.screenshot({ path: join(SCRATCH, "wp11-full-na-level7-sim.png") });

  // === De sim: openingskamer, dan een winnend script naar het einde "de les" =
  const termNaBoot = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("sim: de openingskamer verschijnt (== Geitenhuisje ==)",
    termNaBoot.includes("== Geitenhuisje =="));
  check("sim: de titelbanner verschijnt (SEVEN LITTLE GOATS)",
    termNaBoot.includes("SEVEN LITTLE GOATS"));

  const simScript = ["pak rode mantel", "pak keukenmes", "ga zuid", "ga zuid",
    "ga zuid", "ga zuid", "ga zuid", "ga zuid", "vecht", "val aan", "val aan",
    "val aan", "spaar"];
  for (const cmd of simScript) {
    await page.fill(".pc-term-invoer", cmd);
    await page.press(".pc-term-invoer", "Enter");
    await page.waitForTimeout(45);
  }
  const termNaEinde = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("sim: het einde 'de les' is bereikt (sim:einde)",
    termNaEinde.includes("Einde: de les."));

  // === sim:einde → oordeel → epiloog (de echte keten) =======================
  await page.waitForFunction(() => window.AL.debugState.modus === "oordeel",
    null, { timeout: 8000 }).catch(() => {});
  const sOordeel = await state(page);
  check("sim:einde → oordeel: Alberta's oordeelkaart verschijnt",
    sOordeel.modus === "oordeel", "modus=" + sOordeel.modus);
  check("oordeel: de sim-overlay is gesloten voor de kaart", sOordeel.overlayOpen === false);
  // 21 puzzels opgelost, 0 hints gevraagd → de beste tier. Dit bewijst óók dat
  // de hint-telling niet tussen levels lekte.
  check("oordeel: de beste tier 'meesterhand' is bereikt (0 hints, geen lek)",
    sOordeel.einde === "meesterhand", "einde=" + sOordeel.einde + " hints=" + sOordeel.hintsTotaal);

  await page.screenshot({ path: join(SCRATCH, "wp11-full-oordeel.png") });

  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.AL.debugState.modus === "epiloog",
    null, { timeout: 8000 }).catch(() => {});
  const sEpiloog = await state(page);
  check("oordeel → epiloog: de slottekst (naar de broncode) verschijnt",
    sEpiloog.modus === "epiloog", "modus=" + sEpiloog.modus);
  check("einde: hintsTotaal over de HELE run is 0", sEpiloog.hintsTotaal === 0,
    "hintsTotaal=" + sEpiloog.hintsTotaal);
  await page.screenshot({ path: join(SCRATCH, "wp11-full-epiloog.png") });

  check("geen JavaScript-fouten tijdens de hele playthrough", paginaFouten.length === 0,
    paginaFouten.join(" | "));

  await context.close();
  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) { console.error(gefaald + " controle(s) gezakt."); process.exit(1); }
  console.log("Doorlopende playthrough geslaagd. Screenshots: " + SCRATCH + "/wp11-full-*.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
