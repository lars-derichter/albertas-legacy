// smoke-geluid.mjs — de geluidslaag in een echte browser. Wat hier gekeurd
// wordt, is precies wat een headless test niet kan horen en een unittest niet
// kan zien: krijgt de browser zijn gebruikersactie, en wat staat er in de
// audiograaf vóór die actie?
//
// Er is in deze container geen speaker, en die zou ook niets bewijzen: de vraag
// "klinkt het goed" blijft een luistertest voor Lars. De vraag "klinkt het
// überhaupt" is wél machinaal te beantwoorden, en dat is wat hier gebeurt.
//
// Vier dingen:
//   1. Vóór de eerste gebruikersactie is er geen AudioContext en groeit er
//      niets. Dat wás een lek: de titelmuziek werd tegen een opgeschorte
//      context gepland, en die noten bleven in de graaf hangen.
//   2. Een muisklik op het canvas — zonder ooit een toets aan te raken —
//      ontgrendelt het geluid en start het bed van de huidige stand. Dat pad
//      bestond niet: de unlock hing alleen aan keydown.
//   3. Hetzelfde met een tik op een aanraakscherm (een context met hasTouch,
//      dus mét de D-pad-balk van js/touch.js).
//   4. De voetstap valt op de steunfase van de loopcyclus, niet ernaast.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode, zoals
// de andere rooksmaaktesten. Chromium is vereist.

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

function geluid(page) { return page.evaluate(() => window.AL.sound.debug()); }
function state(page) { return page.evaluate(() => window.AL.debugState); }

async function versePagina(browser, opties) {
  const context = await browser.newContext(opties || {});
  const page = await context.newPage();
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  return { context, page };
}

// Klik het venster weg tot de speler echt in de zolder staat. Alleen te
// gebruiken ná de ontgrendeling — daarvóór is elke toets een gebruikersactie.
async function naarZolder(page) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.titelActief && st.modus === "zolder" && !st.vensterOpen) return;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(60);
  }
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
    executablePath: process.env.AL_CHROMIUM || undefined,
    args: ["--allow-file-access-from-files"]
  });

  console.log("Rooksmaaktest geluid — The Legacy of Alberta\n");

  // ---- 1. Vóór de eerste gebruikersactie ----------------------------------

  const muis = await versePagina(browser);
  const voor = await geluid(muis.page);
  check("vóór de eerste gebruikersactie is er geen AudioContext",
    voor.context === false, "context=" + voor.context);
  check("vóór de eerste gebruikersactie is de laag vergrendeld",
    voor.ontgrendeld === false);
  check("de titelmuziek meldt zich niet als lopend zolang ze niet klinkt",
    voor.bed === null, "bed=" + voor.bed);
  check("er is nog geen enkele oscillator gebouwd", voor.nodes === 0,
    "nodes=" + voor.nodes);

  // Laat het spel anderhalve seconde draaien — ruim twintig logische tikken,
  // en bij het oude gedrag genoeg om een halve titelloop vooruit te plannen.
  await muis.page.waitForTimeout(1500);
  const nogSteeds = await geluid(muis.page);
  check("de graaf groeit niet terwijl het spel vergrendeld doortikt",
    nogSteeds.nodes === 0 && nogSteeds.context === false,
    "nodes=" + nogSteeds.nodes + " context=" + nogSteeds.context);

  // ---- 2. Een muisklik ontgrendelt ----------------------------------------

  // Geen enkele toetsaanslag tot hier: dit is precies de speler die met de muis
  // begint. Vroeger hoorde die niets tot hij toevallig iets typte.
  await muis.page.click("#scherm");
  await muis.page.waitForTimeout(300);
  const naKlik = await geluid(muis.page);
  check("een muisklik op het canvas ontgrendelt het geluid",
    naKlik.ontgrendeld === true && naKlik.context === true,
    "ontgrendeld=" + naKlik.ontgrendeld + " context=" + naKlik.context);
  check("de AudioContext staat na de klik op 'running'",
    naKlik.staat === "running", "staat=" + naKlik.staat);
  check("de klik start het bed van de huidige stand (de titelkaart)",
    naKlik.bed === "titel", "bed=" + naKlik.bed);
  check("er worden nu wél oscillatoren gebouwd", naKlik.nodes > 0,
    "nodes=" + naKlik.nodes);

  // ---- 4. De voetstap valt op de steunfase --------------------------------

  await naarZolder(muis.page);
  const opZolder = await state(muis.page);
  check("de speler staat in de westhoek", opZolder.sceneId === "zolder-west",
    "scene=" + opZolder.sceneId);

  // Tel de voetstappen en lees bij elke stap het frame van de loopcyclus. De
  // loopanimatie draait op 8 fps met vier frames; frame 0 en 2 zijn de
  // steunfases. Een stap op een oneven frame is een stap in de lucht.
  await muis.page.evaluate(() => {
    window.__stappen = [];
    const echt = window.AL.sound.speel;
    window.AL.sound.speel = function (naam, vertraging) {
      if (naam === "stap" || naam === "stap-2") {
        window.__stappen.push({ naam, frame: window.AL.debugState.loopFrame });
      }
      return echt.call(window.AL.sound, naam, vertraging);
    };
  });
  // Naar het oosten is de vloer vanaf de startpositie ruim vier seconden vrij
  // (de kist begint op x176), dus twee seconden lopen botst nergens tegenaan en
  // wisselt van kamer noch scène.
  await muis.page.keyboard.down("ArrowRight");
  await muis.page.waitForTimeout(2000);
  await muis.page.keyboard.up("ArrowRight");
  const stappen = await muis.page.evaluate(() => window.__stappen);
  const oneven = stappen.filter((s) => s.frame % 2 !== 0);
  check("elke voetstap valt op een steunfase van de loopcyclus",
    stappen.length > 0 && oneven.length === 0,
    stappen.length + " stappen, " + oneven.length + " op een doorzwaaiframe");
  check("de cadans ligt op vier stappen per seconde",
    stappen.length >= 7 && stappen.length <= 9,
    stappen.length + " stappen in 2,0 s");
  const wissel = stappen.filter((s, i) => i > 0 && s.naam === stappen[i - 1].naam);
  check("de twee stapvarianten wisselen af (geen metronoom)",
    wissel.length === 0, wissel.length + " herhalingen");

  await muis.context.close();

  // ---- 3. Een tik op een aanraakscherm ------------------------------------

  const tik = await versePagina(browser, { hasTouch: true, isMobile: false });
  const voorTik = await geluid(tik.page);
  check("ook op een aanraakscherm blijft de laag vergrendeld tot de tik",
    voorTik.ontgrendeld === false && voorTik.nodes === 0,
    "ontgrendeld=" + voorTik.ontgrendeld + " nodes=" + voorTik.nodes);

  await tik.page.tap("#scherm");
  await tik.page.waitForTimeout(300);
  const naTik = await geluid(tik.page);
  check("een tik op het canvas ontgrendelt het geluid",
    naTik.ontgrendeld === true, "ontgrendeld=" + naTik.ontgrendeld);
  check("de AudioContext staat na de tik op 'running'",
    naTik.staat === "running", "staat=" + naTik.staat);
  check("de tik start het bed van de huidige stand", naTik.bed === "titel",
    "bed=" + naTik.bed);

  await tik.context.close();
  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) {
    console.error(gefaald + " controle(s) gezakt.");
    process.exit(1);
  }
  console.log("Rooksmaaktest geluid geslaagd.");
}

main().catch((e) => { console.error(e); process.exit(1); });
