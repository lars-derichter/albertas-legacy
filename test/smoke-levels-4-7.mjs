// smoke-levels-4-7.mjs — end-to-end rooksmaaktest van de vier laatste
// productielevels (WP 8). Opent de ECHTE index.html (?seed=1, GEEN dev-gate),
// ontgrendelt eerst levels 1–3 (zonder ze op te lossen) zodat de latere fragmenten
// bereikbaar zijn, en speelt dan voor elk van level 4, 5, 6 en 7 de volledige lus
// uit spelontwerp-legacy.md: vind het fragment → lees de spread → ga aan de pc
// zitten → los alle puzzels op met de modeloplossingen → level-af → terug de
// zolder in. Daarna bewijst hij de seed-variatie: met ?seed=1 tegenover ?seed=2
// toont elke herstel-puzzel met varianten (levels 4, 6, 7) een ANDERE beschadiging.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium vereist (npx playwright install chromium). Techniek uit smoke-levels-1-3.mjs.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");
const indexPad = join(wortel, "index.html");

// Node-side kopie van de level-registry, enkel om per level een seed te vinden
// die variant 0 respectievelijk 1 kiest (deterministisch, save-en-hints.md).
require(join(wortel, "js", "logic", "strings.js"));
require(join(wortel, "js", "logic", "levels.js"));
const AL_NODE = globalThis.AL;
function seedVoorVariant(label, idx) {
  for (let s = 1; s < 500; s++) {
    if (AL_NODE.levels.variantIndex(s, 2, label) === idx) return s;
  }
  return null;
}
// Waar de screenshots landen. Stond hier vroeger als een absoluut pad van de
// machine van de auteur, waardoor deze test bij niemand anders liep. Nu een
// map in de repo (test-results/ staat al in .gitignore), te overschrijven met
// de omgevingsvariabele AL_SCRATCH.
const SCRATCH = process.env.AL_SCRATCH || join(wortel, "test-results");
mkdirSync(SCRATCH, { recursive: true });

function urlMetSeed(seed) {
  return pathToFileURL(indexPad).href + "?seed=" + seed;
}

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

// Ontgrendel een fragment zonder het op te lossen: open het en blader de spread
// door (dat brengt de speler naar de pc-werkhoek in het oosten).
async function ontgrendel(page, naarFragment) {
  await naarFragment(page);
  await page.waitForFunction(() => window.AL.debugState.modus === "spread",
    null, { timeout: 15000 });
  await doorbladerSpread(page);
}

// Los één puzzel op met de modeloplossing / het juiste antwoord, per type.
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
    } else if (def.type === "trace" || def.type === "vindfout" || def.type === "patroonkaart") {
      const antwoord = await ev(page, () => window.AL.pc.debug.verwacht());
      await page.fill(".pc-term-invoer", String(antwoord));
      await page.press(".pc-term-invoer", "Enter");
    } else if (def.type === "verklaar") {
      await page.fill(".pc-term-invoer", "null wijst naar geen enkele doos");
      await page.press(".pc-term-invoer", "Enter");
      await page.waitForTimeout(80);
      await page.fill(".pc-term-invoer", "juist");
      await page.press(".pc-term-invoer", "Enter");
    }
    await page.waitForTimeout(120);
  }
}

// De hele levellus: van de zolder (via het fragment + de spread) tot level-af.
async function speelLevel(page, n, naarFragment) {
  await naarFragment(page);
  await page.waitForFunction(() => window.AL.debugState.modus === "spread",
    null, { timeout: 15000 });
  check("L" + n + ": het fragment opent de spread", (await state(page)).modus === "spread");
  const ontgr = await ev(page, (id) => window.AL.debugToestand.levels[id].ontgrendeld, String(n));
  check("L" + n + ": fragment ontgrendeld", ontgr === true);

  await doorbladerSpread(page);
  const naSpread = await state(page);
  check("L" + n + ": na de spread sta je bij de pc (werkhoek)",
    naSpread.modus === "zolder" && naSpread.sceneId === "zolder-oost",
    "scene=" + naSpread.sceneId);

  await typCommando(page, "ga zitten");
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen),
    null, { timeout: 15000 });
  const sPc = await state(page);
  check("L" + n + ": de pc opent op het juiste level",
    sPc.modus === "pc" && sPc.overlayOpen === true && String(sPc.levelActief) === String(n),
    "levelActief=" + sPc.levelActief);

  const defs = await ev(page, (id) =>
    window.AL.levels.puzzelDefs(id).map((d) => ({ id: d.id, type: d.type })), String(n));
  check("L" + n + ": het menu toont drie puzzels", defs.length === 3, "n=" + defs.length);
  for (const def of defs) {
    await losPuzzelOp(page, def);
    const status = await ev(page, (id) => window.AL.pc.debug.statussen()[id], def.id);
    check("L" + n + ": puzzel " + def.id + " opgelost", status === "af");
  }

  const afgerond = await ev(page, (id) => window.AL.debugToestand.levels[id].afgerond, String(n));
  check("L" + n + ": level-af (het hoofdstuk is hersteld)", afgerond === true);

  // Level 7 afronden "voltooit" Alberta's spel en start de endgame (WP 9):
  // level-af:7 → sim:boot. Je keert dus NIET terug in de zolder maar belandt in
  // de speelbare sim. De volledige endgame-keten wordt in smoke-sim.mjs getest.
  if (n === 7) {
    await page.waitForFunction(() => window.AL.debugState.modus === "sim",
      null, { timeout: 15000 });
    check("L7: level-af:7 boot de sim (endgame start)",
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
async function naarDoorgangDoos(page) {   // levels 2–4
  await typCommando(page, "ga west");
  await typCommando(page, "open doos");
}
async function naarOverloopDoos(page) {   // levels 5–7
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

  console.log("Rooksmaaktest — de levellus van level 4, 5, 6 en 7\n");

  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const paginaFouten = [];
  page.on("pageerror", (e) => paginaFouten.push(e.message));

  await page.goto(urlMetSeed(1), { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  await naarZolder(page);

  // Ontgrendel levels 1–3 (zonder oplossen) zodat de fragmenten 4–7 bereikbaar zijn.
  await ontgrendel(page, async (p) => { await typCommando(p, "open notitieboek"); });
  await ontgrendel(page, naarDoorgangDoos);
  await ontgrendel(page, naarDoorgangDoos);
  const na123 = await ev(page, () => [1, 2, 3].map(
    (n) => window.AL.debugToestand.levels[String(n)].ontgrendeld));
  check("setup: levels 1–3 ontgrendeld (fragmenten 4–7 nu bereikbaar)",
    na123.every(Boolean), na123.join(","));

  // De volledige lus voor level 4 (doorgang) en 5–7 (overloop).
  await speelLevel(page, 4, naarDoorgangDoos);
  await speelLevel(page, 5, naarOverloopDoos);
  await speelLevel(page, 6, naarOverloopDoos);
  await speelLevel(page, 7, naarOverloopDoos);
  await page.screenshot({ path: join(SCRATCH, "wp8-na-level7.png") });

  check("geen JavaScript-fouten tijdens de vier levels", paginaFouten.length === 0,
    paginaFouten.join(" | "));
  await context.close();

  // === Seed-variatie: elke herstel-puzzel met varianten (levels 4, 6, 7) toont
  //     bij een andere seed een andere beschadiging. Per level kiezen we een seed
  //     voor variant 0 en een voor variant 1 en vergelijken de editor-inhoud.
  async function variantCode(seed, n) {
    const ctx = await browser.newContext();
    const pg = await ctx.newPage();
    await pg.goto(urlMetSeed(seed), { waitUntil: "load" });
    await pg.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
    await ev(pg, (k) => window.AL.debugStartPc(k), n);
    await pg.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen), null, { timeout: 15000 });
    await ev(pg, (id) => window.AL.pc.debug.kies(id), "l" + n + "-editor-repair");
    await wachtView(pg, "editor");
    const code = await ev(pg, () => window.AL.pc.debug.editorCode());
    await ctx.close();
    return code;
  }

  for (const n of [4, 6, 7]) {
    const label = "l" + n + "-editor-repair";
    const sA = seedVoorVariant(label, 0), sB = seedVoorVariant(label, 1);
    const okSeeds = check("L" + n + " variatie: twee seeds voor variant 0 en 1 bestaan",
      sA !== null && sB !== null, "sA=" + sA + " sB=" + sB);
    if (okSeeds) {
      const codeA = await variantCode(sA, n);
      const codeB = await variantCode(sB, n);
      check("L" + n + " variatie: de twee seeds tonen een andere beschadigde variant",
        codeA !== codeB);
    }
  }

  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) { console.error(gefaald + " controle(s) gezakt."); process.exit(1); }
  console.log("Rooksmaaktest levels 4–7 geslaagd. Screenshot: " + SCRATCH + "/wp8-na-level7.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
