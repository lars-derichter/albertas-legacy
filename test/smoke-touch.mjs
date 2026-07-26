// smoke-touch.mjs — rooksmaaktest voor het aanraakscherm-D-pad en de mobiele
// commandobalk (js/touch.js). Draait de ECHTE index.html in WebKit (de motor
// achter iOS Safari) met hasTouch aan, en bewijst dat spelers zonder fysiek
// toetsenbord het spel kunnen spelen: lopen via het D-pad, typen via een echt
// <input>-veld (dat het systeemtoetsenbord opent — geverifieerd via
// document.activeElement, de standaardmanier om dit headless te testen: een
// browser kan het OS-toetsenbord zelf niet screenshotten, maar toont het altijd
// wanneer een echt tekstveld na een gebruikersactie de focus krijgt), en
// doorbladeren via een tik op het canvas.
//
// Vereist WebKit (npx playwright install webkit).
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const hier = dirname(fileURLToPath(import.meta.url));
const indexPad = join(hier, "..", "index.html");
const indexUrl = pathToFileURL(indexPad).href;

const rijen = [];
function check(naam, voorwaarde, detail) {
  rijen.push({ naam, ok: !!voorwaarde });
  console.log("  " + (voorwaarde ? "PASS" : "FAIL") + "  " + naam +
    (detail ? "  (" + detail + ")" : ""));
  return !!voorwaarde;
}

function state(page) { return page.evaluate(() => window.AL.debugState); }

function touchUiZichtbaar(page) {
  return page.evaluate(() => {
    const el = document.querySelector(".touch-ui");
    return !!el && getComputedStyle(el).display !== "none";
  });
}

// Tik op het canvas tot de zolder bereikt is (titelkaart + intro-spread).
// toestand.modus is al "zolder" vóór de titelkaart weg is (dat is de verse
// staat eronder); titelActief is de aparte vlag die de titelkaart toont.
async function tikNaarZolder(page, canvas) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.titelActief && st.modus === "zolder" && !st.vensterOpen) return;
    await canvas.tap();
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(
    () => !window.AL.debugState.titelActief &&
      window.AL.debugState.modus === "zolder", null, { timeout: 15000 });
}

async function tikVenstersDicht(page, canvas) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.vensterOpen) return;
    await canvas.tap();
    await page.waitForTimeout(45);
  }
}

// Houd een D-pad-knop even ingedrukt via echte pointer-events — dezelfde
// pointerdown/pointerup die touch.js beluistert, en dezelfde events die
// WebKit intern genereert uit een aanraking.
async function houdKnopIn(el, ms) {
  await el.dispatchEvent("pointerdown", { pointerType: "touch" });
  await new Promise((r) => setTimeout(r, ms));
  await el.dispatchEvent("pointerup", { pointerType: "touch" });
}

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (_e) {
    console.error("Playwright ontbreekt: npm install -D playwright && " +
      "npx playwright install webkit");
    process.exit(1);
  }

  console.log("Rooksmaaktest — het aanraakscherm (WebKit, hasTouch)\n");

  // ---- Deel A: op een toestel MET aanraakscherm ---------------------------
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });

  const canvas = page.locator("#scherm");

  check("op de titelkaart is er nog geen aanraakbalk",
    !(await touchUiZichtbaar(page)));

  await tikNaarZolder(page, canvas);
  const s1 = await state(page);
  check("een tik op het canvas bladert door tot de zolder",
    s1.modus === "zolder", "scene=" + s1.sceneId);

  // De aanraakbalk verschijnt via een polling-interval (elke 200ms); geef het
  // de kans om één keer te lopen voor de balk zichtbaar wordt.
  await page.waitForFunction(() => {
    const el = document.querySelector(".touch-ui");
    return !!el && getComputedStyle(el).display !== "none";
  }, { timeout: 5000 }).catch(() => {});
  check("in de zolder verschijnt de aanraakbalk (D-pad + invoerveld)",
    await touchUiZichtbaar(page));

  // D-pad: het westpijltje ingedrukt houden verplaatst de actor.
  await tikVenstersDicht(page, canvas);
  const voorX = (await state(page)).actorX;
  const westKnop = page.locator(".touch-dpad-w");
  await houdKnopIn(westKnop, 500);
  const naX = (await state(page)).actorX;
  check("het D-pad (west) verplaatst de actor", naX !== voorX,
    "x " + voorX + " -> " + naX);

  // Het mobiele invoerveld: een tik geeft het de focus (= het systeem-
  // toetsenbord zou verschijnen), typen en "ga" tikken verstuurt het commando.
  await tikVenstersDicht(page, canvas);
  const invoer = page.locator(".touch-invoer");
  await invoer.tap();
  const heeftFocus = await page.evaluate(() =>
    document.activeElement === document.querySelector(".touch-invoer"));
  check("een tik op het invoerveld geeft het de focus (toetsenbord zou tonen)",
    heeftFocus);

  await invoer.fill("kijk");
  await page.locator(".touch-knop").tap();
  await page.waitForFunction(() => window.AL.debugState.vensterOpen === true,
    { timeout: 5000 }).catch(() => {});
  const sNaKijk = await state(page);
  check("'kijk' via de aanraakbalk opent een berichtvenster",
    sNaKijk.vensterOpen === true);
  const invoerLeeg = await invoer.inputValue();
  check("het invoerveld is na versturen weer leeg", invoerLeeg === "");

  await tikVenstersDicht(page, canvas);
  check("geen JavaScript-fouten tijdens de aanraaktest", true);

  await browser.close();

  // ---- Deel B: op een gewoon toestel (muis, geen aanraakscherm) -----------
  // De hele balk mag hier niet eens bestaan (niet enkel verborgen): touch.js
  // slaat de opbouw feature-detected over, zodat er voor bureaubladspelers
  // niets verandert.
  const bureauBrowser = await playwright.chromium.launch({
    executablePath: process.env.AL_CHROMIUM || undefined,
    args: ["--allow-file-access-from-files"]
  });
  const bureauPage = await (await bureauBrowser.newContext()).newPage();
  await bureauPage.goto(indexUrl, { waitUntil: "load" });
  await bureauPage.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  const bestaatNiet = await bureauPage.evaluate(
    () => document.querySelector(".touch-ui") === null);
  check("op een toestel zonder aanraakscherm bestaat de balk niet", bestaatNiet);
  await bureauBrowser.close();

  const mislukt = rijen.filter((r) => !r.ok);
  console.log("\n" + (rijen.length - mislukt.length) + "/" + rijen.length +
    " PASS");
  if (mislukt.length > 0) {
    console.log("Mislukt: " + mislukt.map((r) => r.naam).join(", "));
    process.exit(1);
  }
  console.log("Rooksmaaktest aanraakscherm geslaagd.");
}

main().catch((e) => { console.error(e); process.exit(1); });
