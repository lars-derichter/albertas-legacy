// smoke-levels-1-3.mjs — end-to-end rooksmaaktest van de drie echte
// productielevels (WP 7). Opent de ECHTE index.html (?seed=1, GEEN dev-gate) en
// speelt voor elk van level 1, 2 en 3 de volledige lus uit spelontwerp-legacy.md:
//   vind het fragment in de zolder → lees de spread → ga aan de pc zitten →
//   los de drie puzzels op met de modeloplossingen → level-af → terug de zolder in.
// Daarna bewijst hij de variatie tussen runs: met ?seed=1 tegenover ?seed=2 toont
// minstens één herstel-puzzel een ANDERE beschadigde variant.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium vereist (npx playwright install chromium). Techniek uit smoke-browser.mjs.

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
    // Op de titelkaart is toestand.modus al "zolder" terwijl titelActief nog
    // waar is; blader dus door tot de titel én de intro-spread voorbij zijn.
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

// Blader een geopende spread helemaal door tot de modus weer "zolder" is (bij de
// pc in de werkhoek). Sluit eerst het fragment-venster dat boven de spread opent.
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
    } else if (def.type === "trace" || def.type === "vindfout") {
      const antwoord = await ev(page, () => window.AL.pc.debug.verwacht());
      await page.fill(".pc-term-invoer", String(antwoord));
      await page.press(".pc-term-invoer", "Enter");
    } else if (def.type === "verklaar") {
      await page.fill(".pc-term-invoer", "een klasse is de blauwdruk en een instantie is de doos");
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

  // 3. Ga aan de pc zitten → pc-overlay open op het juiste level.
  await typCommando(page, "ga zitten");
  await page.waitForFunction(() => window.AL.debugState.modus === "pc",
    null, { timeout: 15000 });
  const sPc = await state(page);
  check("L" + n + ": de pc opent op het juiste level",
    sPc.modus === "pc" && sPc.overlayOpen === true && String(sPc.levelActief) === String(n),
    "levelActief=" + sPc.levelActief);

  // 4. Los alle drie de puzzels op.
  const defs = await ev(page, (id) =>
    window.AL.levels.puzzelDefs(id).map((d) => ({ id: d.id, type: d.type })), String(n));
  check("L" + n + ": het menu toont drie puzzels", defs.length === 3, "n=" + defs.length);
  for (const def of defs) {
    await losPuzzelOp(page, def);
    const status = await ev(page, (id) => window.AL.pc.debug.statussen()[id], def.id);
    check("L" + n + ": puzzel " + def.id + " opgelost", status === "af");
  }

  // 5. Level-af: alle puzzels af én het level als afgerond gemarkeerd.
  const afgerond = await ev(page, (id) => window.AL.debugToestand.levels[id].afgerond, String(n));
  check("L" + n + ": level-af (het hoofdstuk is hersteld)", afgerond === true);

  // 6. Keer terug naar de zolder (Esc sluit de pc).
  await page.click(".pc-editor-invoer").catch(() => {});
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.AL.debugState.modus === "zolder",
    null, { timeout: 15000 });
  check("L" + n + ": terug in de zolder na het level",
    (await state(page)).modus === "zolder");
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

  console.log("Rooksmaaktest — de levellus van level 1, 2 en 3\n");

  // === De volledige lus per level, met ?seed=1 =============================
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const paginaFouten = [];
  page.on("pageerror", (e) => paginaFouten.push(e.message));

  await page.goto(urlMetSeed(1), { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  await naarZolder(page);

  // Level 1: het notitieboek in de westhoek.
  await speelLevel(page, 1, async (p) => { await typCommando(p, "open notitieboek"); });
  await page.screenshot({ path: join(SCRATCH, "wp7-na-level1.png") });

  // Level 2: een gemerkte doos in de doorgang.
  await speelLevel(page, 2, async (p) => {
    await typCommando(p, "ga west");     // werkhoek → doorgang
    await typCommando(p, "open doos");
  });

  // Level 3: de volgende doos in de doorgang.
  await speelLevel(page, 3, async (p) => {
    await typCommando(p, "ga west");
    await typCommando(p, "open doos");
  });

  check("geen JavaScript-fouten tijdens de drie levels", paginaFouten.length === 0,
    paginaFouten.join(" | "));
  await context.close();

  // === Variatie tussen runs: ?seed=1 vs ?seed=2 ============================
  async function herstelVarianten(seed) {
    const ctx = await browser.newContext();
    const pg = await ctx.newPage();
    await pg.goto(urlMetSeed(seed), { waitUntil: "load" });
    await pg.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
    const uit = {};
    for (const n of [1, 2, 3]) {
      await ev(pg, (k) => window.AL.debugStartPc(k), n);
      await pg.waitForFunction(() => window.AL.debugState.modus === "pc", null, { timeout: 15000 });
      await ev(pg, (id) => window.AL.pc.debug.kies(id), "l" + n + "-editor-repair");
      await wachtView(pg, "editor");
      uit[n] = await ev(pg, () => window.AL.pc.debug.editorCode());
    }
    await ctx.close();
    return uit;
  }

  const seed1 = await herstelVarianten(1);
  const seed2 = await herstelVarianten(2);
  let verschillen = 0;
  for (const n of [1, 2, 3]) {
    if (seed1[n] !== seed2[n]) verschillen++;
  }
  check("variatie: minstens één herstel-puzzel toont een andere beschadigde variant",
    verschillen >= 1, verschillen + "/3 verschillend");

  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) { console.error(gefaald + " controle(s) gezakt."); process.exit(1); }
  console.log("Rooksmaaktest levels 1–3 geslaagd. Screenshot: " + SCRATCH + "/wp7-na-level1.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
