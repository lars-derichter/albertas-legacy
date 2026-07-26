// smoke-geluid.mjs — de geluidslaag in een echte browser. Wat hier gekeurd
// wordt, is precies wat een headless test niet kan horen en een unittest niet
// kan zien: krijgt de browser zijn gebruikersactie, en wat staat er in de
// audiograaf vóór die actie?
//
// Er is in deze container geen speaker, en die zou ook niets bewijzen: de vraag
// "klinkt het goed" blijft een luistertest voor Lars. De vraag "klinkt het
// überhaupt" is wél machinaal te beantwoorden, en dat is wat hier gebeurt.
//
// Vijf dingen:
//   1. Vóór de eerste gebruikersactie is er geen AudioContext en groeit er
//      niets. Dat wás een lek: de titelmuziek werd tegen een opgeschorte
//      context gepland, en die noten bleven in de graaf hangen.
//   2. Een muisklik op het canvas — zonder ooit een toets aan te raken —
//      ontgrendelt het geluid en start het bed van de huidige stand. Dat pad
//      bestond niet: de unlock hing alleen aan keydown.
//   3. Hetzelfde met een tik op een aanraakscherm (een context met hasTouch,
//      dus mét de D-pad-balk van js/touch.js).
//   4. De voetstap valt op de steunfase van de loopcyclus, niet ernaast.
//   5. De iOS-ketting van WP 43: touchend ontgrendelt, het stille element
//      tegen de belschakelaar bestaat pas ná een gebaar en speelt dan echt,
//      "geluid uit" pauzeert het en "geluid aan" hervat het, en een tabblad
//      dat weggaat en terugkomt pauzeert en hervat mee.
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

  // ---- 5. De iOS-ketting (WP 43) ------------------------------------------
  //
  // Wat hier bewezen kan worden, is de wíring. De vraag of een iPhone er ook
  // geluid van maakt — en met het belschakelaartje in beide standen — is een
  // luistertest op echt toestel en blijft bij Lars.

  // 5a. touchend als enige gebeurtenis. Een synthetisch event is niet
  // vertrouwd, dus Chromium geeft er geen gebruikersactivatie voor en de
  // context mag opgeschort blijven staan; wat het wél bewijst is dat er een
  // luisteraar op touchend hangt die bij unlock() uitkomt. Dat was precies wat
  // ontbrak: iOS rekent voor audio op het einde van de aanraking.
  const tend = await versePagina(browser, { hasTouch: true });
  check("vóór elk gebaar staat er geen stil audio-element in de DOM",
    await tend.page.evaluate(() => !document.getElementById("al-stil-audio")));
  await tend.page.evaluate(() => window.dispatchEvent(new Event("touchend")));
  await tend.page.waitForTimeout(200);
  const naTouchend = await geluid(tend.page);
  check("een touchend alléén ontgrendelt het geluid",
    naTouchend.ontgrendeld === true && naTouchend.context === true,
    "ontgrendeld=" + naTouchend.ontgrendeld + " context=" + naTouchend.context);
  check("de stille primer-buffer is in dat gebaar gespeeld",
    naTouchend.primers >= 1, "primers=" + naTouchend.primers);
  await tend.context.close();

  // 5b. Het stille element: een echte tik, en dan moet het er zijn én spelen.
  const bel = await versePagina(browser, { hasTouch: true });
  check("het stille element bestaat niet vóór het eerste gebaar",
    (await geluid(bel.page)).stil === null);

  await bel.page.tap("#scherm");
  await bel.page.waitForTimeout(400);
  const elInfo = await bel.page.evaluate(() => {
    const el = document.getElementById("al-stil-audio");
    if (!el) return null;
    return {
      paused: el.paused, loop: el.loop, muted: el.muted, volume: el.volume,
      playsinline: el.hasAttribute("playsinline"),
      wav: /^data:audio\/wav;base64,/.test(el.getAttribute("src") || ""),
      tijd: el.currentTime, fout: el.error ? el.error.code : null
    };
  });
  check("na het gebaar staat het stille element in de DOM", !!elInfo);
  check("het speelt (niet gepauzeerd, en zonder mediafout)",
    elInfo && elInfo.paused === false && elInfo.fout === null,
    elInfo ? "paused=" + elInfo.paused + " fout=" + elInfo.fout : "geen element");
  check("het loopt rond en blijft in de pagina (loop + playsinline)",
    elInfo && elInfo.loop === true && elInfo.playsinline === true);
  check("het is niet gedempt en staat op volle sterkte (anders geen mediakanaal)",
    elInfo && elInfo.muted === false && elInfo.volume === 1,
    elInfo ? "muted=" + elInfo.muted + " volume=" + elInfo.volume : "geen element");
  check("de bron is een WAV-data-URI, en die WAV speelt écht af",
    elInfo && elInfo.wav === true && elInfo.tijd > 0,
    elInfo ? "currentTime=" + (elInfo.tijd || 0).toFixed(3) : "geen element");

  // 5c. "geluid uit" geeft het mediakanaal terug, "geluid aan" claimt het weer.
  await naarZolder(bel.page);
  await bel.page.keyboard.type("geluid uit", { delay: 6 });
  await bel.page.keyboard.press("Enter");
  await bel.page.waitForTimeout(250);
  check("'geluid uit' pauzeert het stille element",
    (await geluid(bel.page)).stil === "gepauzeerd",
    "stil=" + (await geluid(bel.page)).stil);

  await naarZolder(bel.page);
  await bel.page.keyboard.type("geluid aan", { delay: 6 });
  await bel.page.keyboard.press("Enter");
  await bel.page.waitForTimeout(250);
  check("'geluid aan' laat het weer spelen",
    (await geluid(bel.page)).stil === "speelt",
    "stil=" + (await geluid(bel.page)).stil);

  // 5d. Het tabblad gaat weg en komt terug. `document.hidden` is niet te
  // zetten met een echte tabwissel in Playwright, dus de vlag wordt overschreven
  // en het event zelf afgevuurd — de handler leest precies die vlag.
  await bel.page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true,
      get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await bel.page.waitForTimeout(200);
  check("een tabblad dat weggaat, pauzeert het stille element",
    (await geluid(bel.page)).stil === "gepauzeerd",
    "stil=" + (await geluid(bel.page)).stil);

  await bel.page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true,
      get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await bel.page.waitForTimeout(250);
  const naTerugkeer = await geluid(bel.page);
  check("terugkomen hervat het element en houdt de context lopend",
    naTerugkeer.stil === "speelt" && naTerugkeer.staat === "running",
    "stil=" + naTerugkeer.stil + " staat=" + naTerugkeer.staat);

  await bel.context.close();
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
