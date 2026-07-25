// screenshot.mjs — opent de ECHTE index.html via file:// in een headless
// Chromium (Playwright), drijft het spel tot in de zolder, en bewaart een PNG
// van het canvas. Bedoeld om een scène-/spelbeeld voor review vast te leggen.
//
// Gebruik:
//   node tools/screenshot.mjs                        (-> tools/screenshots/zolder.png)
//   node tools/screenshot.mjs --out /pad/naar.png    (eigen uitvoerpad)
//   node tools/screenshot.mjs --seed 20260716        (deterministische run)
//   node tools/screenshot.mjs --venster              (laat het openingsvenster staan)
//   node tools/screenshot.mjs --kamer overloop       (een bepaalde zolderkamer)
//
// Aangepast uit remake-90s (tools/screenshot.mjs): daar per scène via een
// preview.html; hier via de echte engine (er is nog geen preview-harnas). De
// techniek — file://-URL, canvas.toDataURL uitlezen, PNG wegschrijven — is
// dezelfde.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const hier = dirname(fileURLToPath(import.meta.url));
const wortel = dirname(hier);
const indexPad = join(wortel, "index.html");
const uitDir = join(hier, "screenshots");

const args = process.argv.slice(2);
function argWaarde(naam) {
  const i = args.indexOf(naam);
  return (i !== -1 && i + 1 < args.length) ? args[i + 1] : null;
}
const houdVenster = args.includes("--venster");
const seed = argWaarde("--seed");
const kamer = argWaarde("--kamer");
const uitPad = argWaarde("--out") || join(uitDir, "zolder.png");

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (_e) {
    console.error(
      "Playwright ontbreekt. Installeer het eenmalig met:\n" +
      "  npm install -D playwright && npx playwright install chromium");
    process.exit(1);
  }

  const dir = dirname(uitPad);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const browser = await playwright.chromium.launch({
    executablePath: process.env.AL_CHROMIUM || undefined
  });
  const page = await browser.newPage();

  let url = pathToFileURL(indexPad).href;
  if (seed !== null) url += "?seed=" + encodeURIComponent(seed);

  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });

  // Titel → intro → zolder. Druk Enter tot we in de zolder staan en, tenzij
  // gevraagd, klik ook het openingsvenster weg.
  await page.keyboard.press("Enter");                 // titel → intro
  for (let i = 0; i < 30; i++) {
    const st = await page.evaluate(() => window.AL.debugState);
    if (st.modus === "zolder" && (!st.vensterOpen || houdVenster)) break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(60);
  }
  // Een bepaalde kamer: zet de scène en laat de engine er opnieuw in stappen.
  // De kamerbeschrijving die daarbij hoort, klikken we weg — tenzij het venster
  // juist gevraagd is.
  if (kamer) {
    await page.evaluate((id) => {
      window.AL.debugToestand.sceneId = id;
      window.AL.debugStartZolder();
    }, kamer);
    await page.waitForTimeout(200);
    for (let i = 0; i < 10 && !houdVenster; i++) {
      const st = await page.evaluate(() => window.AL.debugState);
      if (!st.vensterOpen) break;
      await page.keyboard.press("Enter");
      await page.waitForTimeout(60);
    }
    const st = await page.evaluate(() => window.AL.debugState);
    if (st.sceneId !== kamer) {
      console.error("FOUT: kamer '" + kamer + "' niet bereikt (scene=" +
        st.sceneId + ").");
      await browser.close();
      process.exit(1);
    }
  }

  await page.waitForTimeout(400);

  const dataUrl = await page.evaluate(() => {
    const c = document.getElementById("scherm");
    return c ? c.toDataURL("image/png") : null;
  });
  await browser.close();

  if (!dataUrl) {
    console.error("FOUT: geen canvas gevonden.");
    process.exit(1);
  }
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  writeFileSync(uitPad, Buffer.from(base64, "base64"));
  console.log("OK   -> " + uitPad);
}

main();
