// smoke-browser.mjs — een end-to-end rooksmaaktest die de ECHTE index.html in
// een browser opent (file://) en bewijst dat het meta-spel speelbaar is: de
// titelkaart tekent, Enter brengt je in de zolder, lopen werkt, een getypt
// commando opent een berichtvenster, en een reload herstelt de save.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium is vereist (npx playwright install chromium).
//
// Aangepast uit remake-90s (test/smoke-browser.mjs): dezelfde techniek —
// file://-URL, echte keydown-events, uitlezen van window.AL.debugState /
// AL.debugToestand — rond de zolder-flow van The Legacy of Alberta.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const hier = dirname(fileURLToPath(import.meta.url));
const indexPad = join(hier, "..", "index.html");
const indexUrl = pathToFileURL(indexPad).href;

// ---- Resultatenboekhouding -------------------------------------------------

const rijen = [];
function check(naam, voorwaarde, detail) {
  rijen.push({ naam, ok: !!voorwaarde });
  console.log("  " + (voorwaarde ? "PASS" : "FAIL") + "  " + naam +
    (detail ? "  (" + detail + ")" : ""));
  return !!voorwaarde;
}

// ---- Lees- en wachthelpers -------------------------------------------------

function state(page) { return page.evaluate(() => window.AL.debugState); }

function wachtVenster(page, open) {
  return page.waitForFunction(
    (o) => window.AL.debugState.vensterOpen === o, open, { timeout: 15000 });
}

// Is er meer dan één kleur op het canvas (dus: er is iets getekend)?
function canvasNietLeeg(page) {
  return page.evaluate(() => {
    const c = document.getElementById("scherm");
    const ctx = c.getContext("2d");
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const eerste = [d[0], d[1], d[2]];
    for (let i = 4; i < d.length; i += 4) {
      if (d[i] !== eerste[0] || d[i + 1] !== eerste[1] || d[i + 2] !== eerste[2]) {
        return true;
      }
    }
    return false;
  });
}

async function sluitVensters(page) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.vensterOpen) return;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(45);
  }
}

// Naar de zolder: Enter (titel → intro), dan de intro-vensters wegklikken.
async function naarZolder(page) {
  await page.keyboard.press("Enter");
  await page.waitForTimeout(60);
  await sluitVensters(page);
  await page.waitForFunction(
    () => window.AL.debugState.modus === "zolder", null, { timeout: 15000 });
}

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (_e) {
    console.error("Playwright ontbreekt: npm install -D playwright && " +
      "npx playwright install chromium");
    process.exit(1);
  }

  const browser = await playwright.chromium.launch({
    args: ["--allow-file-access-from-files"]
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Rooksmaaktest — The Legacy of Alberta\n");

  // 1. Titelkaart tekent en is niet leeg.
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  const s0 = await state(page);
  check("titelkaart actief bij de start", s0.titelActief === true);
  check("canvas is niet leeg op de titelkaart", await canvasNietLeeg(page));

  // 2. Enter → intro → zolder.
  await naarZolder(page);
  const s1 = await state(page);
  check("Enter brengt de speler in de zolder", s1.modus === "zolder",
    "scene=" + s1.sceneId);
  check("zolder-scène tekent (canvas niet leeg)", await canvasNietLeeg(page));

  // 3. Lopen met de pijltjes: de actor verplaatst.
  await sluitVensters(page);
  const voorX = (await state(page)).actorX;
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(500);
  await page.keyboard.up("ArrowLeft");
  const naX = (await state(page)).actorX;
  check("lopen verplaatst de actor", naX !== voorX,
    "x " + voorX + " -> " + naX);

  // 4. Een getypt commando opent een berichtvenster.
  await sluitVensters(page);
  await page.keyboard.type("kijk", { delay: 8 });
  await page.keyboard.press("Enter");
  await wachtVenster(page, true);
  check("'kijk' opent een berichtvenster", (await state(page)).vensterOpen);

  // 5. Voortgang: open het notitieboek → fragment ontgrendeld en opgeslagen.
  await sluitVensters(page);
  await page.keyboard.type("open notitieboek", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  const ontgrendeld = await page.evaluate(() =>
    window.AL.debugToestand.levels["1"].ontgrendeld);
  check("open notitieboek ontgrendelt fragment 1", ontgrendeld === true);

  // 6. Reload: de save wordt hersteld (geen titelkaart, fragment nog gevonden).
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  await page.waitForTimeout(150);
  const sr = await state(page);
  const nogOntgrendeld = await page.evaluate(() =>
    window.AL.debugToestand.levels["1"].ontgrendeld);
  check("na reload: geen titelkaart (save hervat)", sr.titelActief === false);
  check("na reload: fragment 1 nog ontgrendeld (save hersteld)",
    nogOntgrendeld === true);

  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) {
    console.error(gefaald + " controle(s) gezakt.");
    process.exit(1);
  }
  console.log("Rooksmaaktest geslaagd.");
}

main().catch((e) => { console.error(e); process.exit(1); });
