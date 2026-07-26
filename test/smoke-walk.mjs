// smoke-walk.mjs — de rooksmaaktest van het lópen (WP 32). Ze opent de echte
// index.html vanaf file:// en legt élke verbinding van de zolderkaart te voet
// af, met niets dan pijltjestoetsen: west ↔ doorgang ↔ werkhoek, en de trap
// doorgang → overloop → doorgang. Daarna loopt ze tegen de kist, het bureau,
// de dozenstapels en een geschilderde muur aan en controleert dat de speler
// gewoon stópt — zonder venster, zonder tekst.
//
// Waarom deze test bestaat: tot WP 32 was de zolder te voet niet af te leggen.
// Noord en zuid konden alleen met "ga noord" (de randkruising vuurt op y<8 en
// y>189, en geen enkele loopstrook komt daar), de speler liep door elk voorwerp
// heen, en elke loopstrook liep van x0 tot x319, zodat je tegen een
// geschilderde muur ongeveer elke seconde een modaal "Die kant kan je niet op"
// kreeg. Een getypte playthrough zag daar niets van — vandaar een aparte smoke
// die alléén loopt.
//
// Sinds WP 42 keurt ze ook de bestúring zelf (§8 en §9): twee pijlen tegelijk,
// een spookrichting na focusverlies, en een vinger die op het D-pad van de ene
// knop naar de andere schuift. Die drie gaan niet over de meetkunde van de
// vloer maar over wie de richting bepaalt, en ze staan hier omdat dit de test
// is die als enige écht loopt.
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium is vereist (npx playwright install chromium); AL_CHROMIUM wijst een
// eigen binary aan.

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

// ---- Lees- en loophelpers --------------------------------------------------

function state(page) { return page.evaluate(() => window.AL.debugState); }

const TOETS = {
  noord: "ArrowUp", zuid: "ArrowDown", oost: "ArrowRight", west: "ArrowLeft"
};

// Klik open vensters weg (een kamerbeschrijving bij het eerste bezoek is er
// zo een; die hoort erbij en is geen weigering).
async function sluitVensters(page) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.vensterOpen || st.vensterVraag) return;
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
}

// Houd een pijltje ingedrukt tot de voorwaarde klopt of de tijd op is. De
// speler loopt 1,5 pixel per tik op 15 Hz — ruim 22 pixels per seconde — dus
// een kamer oversteken duurt seconden, niet milliseconden.
async function loopTot(page, richting, klaar, maxMs) {
  await page.keyboard.down(TOETS[richting]);
  const t0 = Date.now();
  let gelukt = false;
  while (Date.now() - t0 < (maxMs || 20000)) {
    await page.waitForTimeout(80);
    if (await klaar()) { gelukt = true; break; }
  }
  await page.keyboard.up(TOETS[richting]);
  await page.waitForTimeout(80);
  return gelukt;
}

// Loop een vaste tijd in één richting.
async function loop(page, richting, ms) {
  await page.keyboard.down(TOETS[richting]);
  await page.waitForTimeout(ms);
  await page.keyboard.up(TOETS[richting]);
  await page.waitForTimeout(80);
}

// Loop tot de scène wisselt. Geeft de nieuwe scène-id terug (of de oude).
async function loopNaarKamer(page, richting, maxMs) {
  const vanaf = (await state(page)).sceneId;
  await loopTot(page, richting,
    async () => (await state(page)).sceneId !== vanaf, maxMs);
  await sluitVensters(page);
  return (await state(page)).sceneId;
}

// Loop tot x in een venster valt (om onder de trap of naast een doos te komen).
async function loopTotX(page, richting, min, max, maxMs) {
  return loopTot(page, richting, async () => {
    const x = (await state(page)).actorX;
    return x >= min && x <= max;
  }, maxMs);
}

// Loop tegen iets aan en kijk of de speler stopt: dezelfde plek na een tweede
// duw, en geen venster. Geeft { gestopt, venster, x, y }.
async function botsTegen(page, richting, ms) {
  await sluitVensters(page);
  await loop(page, richting, ms);
  const a = await state(page);
  await loop(page, richting, 700);
  const b = await state(page);
  return {
    gestopt: a.actorX === b.actorX && a.actorY === b.actorY,
    venster: b.vensterOpen,
    x: b.actorX, y: b.actorY
  };
}

// De besturingstoestand in één blik: welke kant de speler op kijkt, waar hij
// staat, en of hij loopt. `speler.richting` staat in de wereldstaat en niet in
// debugState — vandaar de tweede haak.
async function besturing(page) {
  return page.evaluate(() => ({
    richting: window.AL.debugToestand.speler.richting,
    x: window.AL.debugState.actorX,
    y: window.AL.debugState.actorY,
    loopt: window.AL.debugState.loopt
  }));
}

// Staat de speler écht stil? Twee metingen met een tik of tien ertussen: één
// meting kan een pauze in een animatie zijn.
async function staatStil(page) {
  const a = await besturing(page);
  await page.waitForTimeout(700);
  const b = await besturing(page);
  return { stil: a.x === b.x && a.y === b.y && !b.loopt, x: b.x, y: b.y };
}

// Een verse pagina in een eigen context: de besturingsproeven hieronder mogen
// de lange looproute hierboven niet verstoren (en de aanraakproef heeft een
// context met `hasTouch` nodig).
async function versePagina(browser, opties) {
  const context = await browser.newContext(opties || {});
  const page = await context.newPage();
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(120);
  await page.keyboard.press("Escape");          // de openingsreeks overslaan
  await page.waitForTimeout(150);
  await naarZolder(page);
  await sluitVensters(page);
  return { context, page };
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
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Rooksmaaktest lopen — The Legacy of Alberta\n");

  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(120);
  await page.keyboard.press("Escape");          // de openingsreeks overslaan
  await page.waitForTimeout(150);
  await naarZolder(page);
  const s0 = await state(page);
  check("de speler staat in de westhoek", s0.sceneId === "zolder-west",
    "scene=" + s0.sceneId);

  // ---- 1. De kist houdt de speler tegen (bevinding B) ---------------------
  //
  // Vanaf de start (x80, y175) ligt de kist recht in het pad naar het oosten:
  // geschilderd van x176 tot x215 sinds de schaalpas van WP 35 (daarvóór
  // x146–241). Wie er tegenaan loopt, hoort te stoppen.
  // Zesduizend milliseconde en niet vier: de kist begint sinds WP 35 zeventig
  // pixels verder naar rechts, en met vier seconden was de speler nog onderweg
  // in plaats van tegengehouden.
  const kist = await botsTegen(page, "oost", 6000);
  check("de kist stopt de speler in plaats van hem door te laten",
    kist.gestopt && kist.x < 176, "x=" + kist.x + " y=" + kist.y);
  check("tegen de kist lopen opent geen venster", kist.venster === false);

  // De dozenstapels links. Hun voetafdruk ligt achteraan in de strook (tot
  // y172), dus eerst naar achter lopen en dan pas naar het westen: vóór de
  // stapels langs is de vloer vrij, en dat hoort ook zo.
  await loop(page, "noord", 2500);
  const dozen = await botsTegen(page, "west", 3000);
  check("de dozenstapels stoppen de speler", dozen.gestopt && dozen.x > 100,
    "x=" + dozen.x + " y=" + dozen.y);
  check("tegen de dozen lopen opent geen venster", dozen.venster === false);
  await loop(page, "zuid", 2500);

  // ---- 2. Westhoek → doorgang → werkhoek, te voet ------------------------
  await loop(page, "zuid", 1200);               // vóór de kist langs
  let kamer = await loopNaarKamer(page, "oost", 25000);
  check("westhoek → doorgang te voet (oostrand)", kamer === "zolder-midden",
    "scene=" + kamer);

  await loop(page, "zuid", 1200);
  kamer = await loopNaarKamer(page, "oost", 25000);
  check("doorgang → werkhoek te voet (oostrand)", kamer === "zolder-oost",
    "scene=" + kamer);

  // ---- 3. Het bureau en de oostmuur in de werkhoek -----------------------
  const muur = await botsTegen(page, "oost", 16000);
  check("de geschilderde oostmuur stopt de speler", muur.gestopt && muur.x < 319,
    "x=" + muur.x);
  check("tegen de muur lopen opent geen venster (geen modale weigering)",
    muur.venster === false);

  // Vóór het bureau gaan staan (het staat op x168–217 sinds WP 35, met de stoel
  // ervoor) en er dan tegenaan. Het blok loopt tot y166.
  const voorBureau = await loopTotX(page, "west", 176, 212, 15000);
  check("de speler kan zich vóór het bureau opstellen", voorBureau,
    "x=" + (await state(page)).actorX);
  const bureau = await botsTegen(page, "noord", 2000);
  check("het bureau met de stoel stopt de speler", bureau.gestopt &&
    bureau.y > 166, "y=" + bureau.y);
  check("tegen het bureau lopen opent geen venster", bureau.venster === false);

  // ---- 4. Terug naar de doorgang en de trap op --------------------------
  await loop(page, "zuid", 1500);
  kamer = await loopNaarKamer(page, "west", 25000);
  check("werkhoek → doorgang te voet (westrand)", kamer === "zolder-midden",
    "scene=" + kamer);

  // De trapcorridor ligt tussen x150 en x191; de uitgangszone zit boven aan de
  // corridor. Eerst eronder gaan staan, dan noord.
  const opPositie = await loopTotX(page, "west", 158, 184, 20000);
  check("de speler kan zich onder de trap opstellen", opPositie,
    "x=" + (await state(page)).actorX);
  kamer = await loopNaarKamer(page, "noord", 20000);
  check("doorgang → overloop te voet (uitgangszone noord)", kamer === "overloop",
    "scene=" + kamer);

  // ---- 5. De overloop: dozen, hoeken en de trap terug -------------------
  //
  // Eerst opzij en naar achter: de uitgangszone ligt op x148–175 vóór het
  // trapgat, en wie daar naar het westen door loopt, gaat gewoon de trap af.
  // De torens staan achteraan (voetafdruk tot y166 sinds WP 35), dus daar wordt
  // gebotst.
  await loop(page, "oost", 2000);
  await loopTot(page, "noord", async () => (await state(page)).actorY <= 166,
    8000);
  const toren = await botsTegen(page, "west", 8000);
  check("de kartonnen torens op de overloop stoppen de speler",
    toren.gestopt && toren.x > 118, "x=" + toren.x + " y=" + toren.y);
  check("tegen de torens lopen opent geen venster", toren.venster === false);

  const hoek = await botsTegen(page, "zuid", 3000);
  check("de voorrand van de overloop stopt de speler", hoek.gestopt,
    "y=" + hoek.y);
  check("de voorrand opent geen venster", hoek.venster === false);

  const terug = await loopTotX(page, "oost", 152, 172, 20000);
  check("de speler kan zich voor het trapgat opstellen", terug,
    "x=" + (await state(page)).actorX);
  kamer = await loopNaarKamer(page, "noord", 20000);
  check("overloop → doorgang te voet (uitgangszone zuid)",
    kamer === "zolder-midden", "scene=" + kamer);

  // ---- 6. Doorgang → westhoek sluit de ronde ----------------------------
  await loop(page, "zuid", 2500);
  kamer = await loopNaarKamer(page, "west", 25000);
  check("doorgang → westhoek te voet (westrand)", kamer === "zolder-west",
    "scene=" + kamer);

  // ---- 7. Getypte navigatie blijft werken zoals ze werkte ---------------
  await sluitVensters(page);
  await page.keyboard.type("ga oost", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(220);
  check("'ga oost' brengt de speler nog altijd naar de doorgang",
    (await state(page)).sceneId === "zolder-midden");
  await sluitVensters(page);
  await page.keyboard.type("ga noord", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(220);
  check("'ga noord' brengt de speler nog altijd naar de overloop",
    (await state(page)).sceneId === "overloop");

  // En de weigering blijft bestaan waar ze een antwoord is: op een getypte
  // richting die nergens heen gaat.
  await sluitVensters(page);
  await page.keyboard.type("ga oost", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(220);
  const weiger = await state(page);
  check("'ga oost' op de overloop weigert nog wél met een venster",
    weiger.vensterOpen === true && weiger.sceneId === "overloop",
    "venster=" + weiger.vensterOpen + " scene=" + weiger.sceneId);

  // ---- 8. De besturing: geen spookrichtingen (WP 42) ---------------------
  //
  // Lars' klacht van de iOS-speeltest: "als je de pijltjes ingedrukt houdt,
  // blijft het personage die kant op lopen, ook nadat je een andere pijl
  // indrukt". Twee mechanismen, twee proeven — beide in een verse pagina, want
  // de speler moet hier op een vrij stuk vloer staan (de westhoek is bij y175
  // beloopbaar van x6 tot de kist op x176).
  const bes = await versePagina(browser);
  {
    const p = bes.page;

    // (a) Twee pijlen tegelijk: de laatst ingedrukte wint, en het loslaten
    // daarvan valt terug op de pijl die nog steeds ingedrukt is.
    await p.keyboard.down("ArrowRight");
    await p.waitForTimeout(600);
    const oost1 = await besturing(p);
    check("één pijl: de speler loopt naar het oosten",
      oost1.richting === "oost" && oost1.loopt && oost1.x > 80,
      "richting=" + oost1.richting + " x=" + oost1.x);

    await p.keyboard.down("ArrowLeft");           // rechts blijft ingedrukt
    await p.waitForTimeout(600);
    const west1 = await besturing(p);
    check("de tweede pijl wint terwijl de eerste ingedrukt blijft",
      west1.richting === "west" && west1.x < oost1.x,
      "richting=" + west1.richting + " x=" + west1.x + " (was " + oost1.x + ")");

    await p.keyboard.up("ArrowLeft");             // rechts nóg steeds ingedrukt
    await p.waitForTimeout(600);
    const oost2 = await besturing(p);
    check("de eerste pijl geldt weer zodra de tweede losgelaten wordt",
      oost2.richting === "oost" && oost2.x > west1.x,
      "richting=" + oost2.richting + " x=" + oost2.x + " (was " + west1.x + ")");

    await p.keyboard.up("ArrowRight");
    await p.waitForTimeout(200);
    const naLos = await staatStil(p);
    check("met beide pijlen los staat de speler stil", naLos.stil,
      "x=" + naLos.x + " y=" + naLos.y);

    // (b) Het spook: een keydown zonder keyup. `blur` is precies wat er op een
    // telefoon gebeurt als de app naar de achtergrond gaat — de pijl blijft in
    // de stack staan en de speler loopt door. De toets wordt hier bewust níét
    // losgelaten vóór de meting.
    await p.keyboard.down("ArrowLeft");
    await p.waitForTimeout(600);
    const loopt = await besturing(p);
    check("de speler loopt naar het westen met de pijl ingedrukt",
      loopt.loopt && loopt.richting === "west", "richting=" + loopt.richting);

    await p.evaluate(() => window.dispatchEvent(new Event("blur")));
    await p.waitForTimeout(300);
    const naBlur = await staatStil(p);
    check("focusverlies stopt de speler, ook zonder keyup", naBlur.stil,
      "x=" + naBlur.x + " y=" + naBlur.y);

    // En het spook is écht weg: een andere pijl indrukken en loslaten valt
    // niet terug op de richting die nooit een keyup kreeg.
    await p.keyboard.down("ArrowRight");
    await p.waitForTimeout(500);
    const naSpook = await besturing(p);
    check("na het focusverlies stuurt de volgende pijl gewoon weer",
      naSpook.loopt && naSpook.richting === "oost",
      "richting=" + naSpook.richting);
    await p.keyboard.up("ArrowRight");
    await p.waitForTimeout(200);
    const stilNaSpook = await staatStil(p);
    check("en loslaten valt niet terug op het spook", stilNaSpook.stil,
      "x=" + stilNaSpook.x + " y=" + stilNaSpook.y);
    await p.keyboard.up("ArrowLeft");             // de spooktoets alsnog los
    await p.waitForTimeout(200);
    const naLate = await staatStil(p);
    check("een late keyup van de spooktoets zet niets meer in beweging",
      naLate.stil, "x=" + naLate.x + " y=" + naLate.y);
  }
  await bes.context.close();

  // ---- 9. Het D-pad: een vinger die van de ene knop naar de andere schuift -
  //
  // Dit is de aanraakkant van dezelfde klacht, en het is het geval dat Lars op
  // iOS raakte. Een aanraking krijgt impliciete pointer capture: alle events
  // van die vinger gaan naar de knop van de pointerdown, ook als de vinger
  // allang boven een andere knop hangt. Zonder de capture los te laten krijgt
  // ▶ nooit een pointerdown en ◀ nooit een pointerleave.
  //
  // Playwright's aanraak-API kent alleen `tap()`, dus het schuiven gaat via
  // CDP (`Input.dispatchTouchEvent`). Dat levert échte aanraakevents met échte
  // capture — synthetische PointerEvents uit `page.evaluate` zouden juist het
  // gedrag missen dat hier bewezen moet worden.
  const tik = await versePagina(browser, { hasTouch: true });
  {
    const p = tik.page;
    const zichtbaar = await p.evaluate(() => {
      const el = document.querySelector(".touch-ui");
      return !!el && getComputedStyle(el).display !== "none";
    });
    check("op een aanraakscherm staat de D-pad-balk in beeld", zichtbaar);

    const kaderW = await p.locator(".touch-dpad-w").boundingBox();
    const kaderO = await p.locator(".touch-dpad-o").boundingBox();
    const midden = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    const cdp = await tik.context.newCDPSession(p);

    await cdp.send("Input.dispatchTouchEvent",
      { type: "touchStart", touchPoints: [midden(kaderW)] });
    await p.waitForTimeout(600);
    const opWest = await besturing(p);
    check("een vinger op ◀ laat de speler naar het westen lopen",
      opWest.loopt && opWest.richting === "west" && opWest.x < 80,
      "richting=" + opWest.richting + " x=" + opWest.x);

    await cdp.send("Input.dispatchTouchEvent",
      { type: "touchMove", touchPoints: [midden(kaderO)] });
    await p.waitForTimeout(600);
    const opOost = await besturing(p);
    check("de vinger naar ▶ schuiven draait de richting mee",
      opOost.richting === "oost" && opOost.x > opWest.x,
      "richting=" + opOost.richting + " x=" + opOost.x +
      " (was " + opWest.x + ")");

    await cdp.send("Input.dispatchTouchEvent",
      { type: "touchEnd", touchPoints: [] });
    await p.waitForTimeout(300);
    const opgetild = await staatStil(p);
    check("de vinger optillen stopt de speler", opgetild.stil,
      "x=" + opgetild.x + " y=" + opgetild.y);
  }
  await tik.context.close();

  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) {
    console.error(gefaald + " controle(s) gezakt.");
    process.exit(1);
  }
  console.log("Rooksmaaktest lopen geslaagd.");
}

main().catch((e) => { console.error(e); process.exit(1); });
