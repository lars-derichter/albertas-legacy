// smoke-levels-1-3.mjs — end-to-end rooksmaaktest van de drie echte
// productielevels (WP 7). Opent de ECHTE index.html (?seed=1, GEEN dev-gate) en
// speelt voor elk van level 1, 2 en 3 de volledige lus uit spelontwerp-legacy.md:
//   vind het fragment in de zolder → lees de spread (het boek valt dicht waar je
//   staat) → loop naar de werkhoek → ga aan de pc zitten → los de drie puzzels op
//   met de modeloplossingen → level-af → terug de zolder in.
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

// Blader een geopende spread helemaal door tot de modus weer "zolder" is — sinds
// WP 44 in de kamer waar de speler het blad vond, op de plek waar hij stond.
// Sluit eerst het fragment-venster dat boven de spread opent.
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

// De weg naar de werkhoek, per kamer waar het notitieboek je kan achterlaten.
// Sinds WP 44 legt de spread je neer waar je het blad vond, dus die weg legt de
// speler zelf af — precies wat de '?'-hint en de walkthrough zeggen.
const ROUTE_WERKHOEK = {
  "zolder-west": ["ga oost", "ga oost"],
  "zolder-midden": ["ga oost"],
  "overloop": ["ga zuid", "ga oost"],
  "zolder-oost": []
};

async function naarWerkhoek(page) {
  const van = (await state(page)).sceneId;
  for (const cmd of ROUTE_WERKHOEK[van] || []) await typCommando(page, cmd);
  return van;
}

// Loop te voet naar het westen tot de speler op of voorbij doelX staat. Met de
// pijltoets, niet met een commando: zo staat hij op een plek die géén entry van
// de kamer is, en dat is precies wat de spread-controle nodig heeft.
async function loopWestTot(page, doelX) {
  await sluitVensters(page);
  await page.keyboard.down("ArrowLeft");
  await page.waitForFunction((d) => window.AL.debugState.actorX <= d, doelX,
    { timeout: 10000 }).catch(() => {});
  await page.keyboard.up("ArrowLeft");
  await page.waitForTimeout(90);
}

// Zet de taken vóór `puzzelId` in dat level op "af", zodat de volgorde-poort
// van WP 48b hem doorlaat. Een expliciete testhaak (directe state-manipulatie),
// geen spelpad: de variatie-controle onderaan wil alleen wéten welke
// beschadigde variant een seed toont, en sinds WP 48b staat l2-editor-repair
// achter de Parsons.
async function ontgrendelTot(page, levelId, puzzelId) {
  await ev(page, (arg) => {
    const t = window.AL.debugToestand;
    const defs = window.AL.levels.puzzelDefs(String(arg.n));
    for (const d of defs) {
      if (d.id === arg.id) break;
      t.levels[String(arg.n)].puzzels[d.id].status = "af";
    }
  }, { n: levelId, id: puzzelId });
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
  // Waar staat de speler terwijl het boek openligt? Daar hoort hij te staan als
  // het weer dichtvalt.
  const sBoek = await state(page);

  // 2. Lees de spread → het boek valt dicht waar je staat (WP 44). Vroeger
  //    teleporteerde de laatste bladzijde je naar de werkhoek.
  await doorbladerSpread(page);
  const naSpread = await state(page);
  check("L" + n + ": na de spread sta je waar je het blad vond",
    naSpread.modus === "zolder" && naSpread.sceneId === sBoek.sceneId &&
    Math.abs(naSpread.actorX - sBoek.actorX) <= 2 &&
    Math.abs(naSpread.actorY - sBoek.actorY) <= 2,
    "scene=" + naSpread.sceneId + " (" + naSpread.actorX + "," + naSpread.actorY +
    ") vs " + sBoek.sceneId + " (" + sBoek.actorX + "," + sBoek.actorY + ")");
  if (n === 2) {
    // Hetzelfde, maar expliciet voor een blad uit een DOOS: de speler is naar
    // die doos toe gelópen (zie main), dus hij hoort er ná het boek nog naast te
    // staan — in de doorgang, en niet op een entry van de kamer.
    const doosX = await ev(page, () => window.AL.scenes["zolder-midden"]
      .hotspots.filter((h) => h.item === "doos")[0].x);
    check("L2: het blad uit de doos sluit in de doorgang, bij die doos",
      naSpread.sceneId === "zolder-midden" &&
      naSpread.actorX === sBoek.actorX && naSpread.actorY === sBoek.actorY &&
      Math.abs(naSpread.actorX - doosX) <= 16,
      "x=" + naSpread.actorX + " doos=" + doosX + " scene=" + naSpread.sceneId);
  }

  // 3. Loop zélf naar de werkhoek en ga aan de pc zitten → pc-overlay open op
  //    het juiste level.
  const vanaf = await naarWerkhoek(page);
  check("L" + n + ": te voet van " + vanaf + " naar de werkhoek",
    (await state(page)).sceneId === "zolder-oost",
    "scene=" + (await state(page)).sceneId);
  await typCommando(page, "ga zitten");
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen),
    null, { timeout: 15000 });
  const sPc = await state(page);
  check("L" + n + ": de pc opent op het juiste level",
    sPc.modus === "pc" && sPc.overlayOpen === true && String(sPc.levelActief) === String(n),
    "levelActief=" + sPc.levelActief);

  // 4. Los alle drie de puzzels op.
  const defs = await ev(page, (id) =>
    window.AL.levels.puzzelDefs(id).map((d) => ({ id: d.id, type: d.type })), String(n));
  check("L" + n + ": het menu toont drie puzzels", defs.length === 3, "n=" + defs.length);

  // De volgorde-poort (WP 48b): op een vers hoofdstuk is alleen de eerste taak
  // speelbaar. In level 2 is dat de Parsons — het editor-fragment toont `zoek`
  // ongeschonden en dat zijn precies de stroken.
  const poort = await ev(page, (ids) =>
    ids.map((id) => window.AL.pc.debug.speelbaar(id)), defs.map((d) => d.id));
  check("L" + n + ": alleen de eerste taak is speelbaar, de andere twee wachten",
    poort[0] === true && poort[1] === false && poort[2] === false,
    poort.join(","));
  if (n === 2) {
    check("L2: de Parsons staat vooraan, vóór het fragment dat zijn stroken toont",
      defs[0].id === "l2-parsons", defs.map((d) => d.id).join(","));
  }

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
    executablePath: process.env.AL_CHROMIUM || undefined,
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

  // Level 2: een gemerkte doos in de doorgang. Naar die doos lopen we te voet:
  // dan staat de speler op een plek die geen entry is, en bewijst de controle in
  // speelLevel dat het notitieboek hem daar écht laat staan.
  await speelLevel(page, 2, async (p) => {
    await typCommando(p, "ga west");     // werkhoek → doorgang
    await loopWestTot(p, 240);           // te voet naar de gemerkte doos
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
      await pg.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen), null, { timeout: 15000 });
      await ontgrendelTot(pg, n, "l" + n + "-editor-repair");
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
