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

// Klik open vensters weg. Een vraagvenster blijft staan: dat blokkeert de
// invoer niet en Enter typt er juist in mee, dus wegklikken is er niet bij én
// niet nodig.
async function sluitVensters(page) {
  for (let i = 0; i < 40; i++) {
    const st = await state(page);
    if (!st.vensterOpen || st.vensterVraag) return;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(45);
  }
}

// Naar de zolder: Enter bladert door de titelkaart, de achtergrondvensters en
// het openingsvenster tot de speler echt in de zolder staat. De titelcheck moet
// erbij: op de titelkaart staat de modus al op "zolder" en is er nog geen
// venster, dus zonder die check keert dit meteen terug zonder één toets.
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

// Typ een zolder-commando en wacht kort; sluit eventuele vensters eerst.
async function typCommando(page, cmd) {
  await sluitVensters(page);
  await page.keyboard.type(cmd, { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(140);
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

  // Alles wat de pagina als waarschuwing logt. De laatste controle hieronder
  // leest deze lijst; de rest van de test raakt hem niet aan.
  const waarschuwingen = [];
  page.on("console", (m) => {
    if (m.type() === "warning") waarschuwingen.push(m.text());
  });

  console.log("Rooksmaaktest — The Legacy of Alberta\n");

  // 1. Titelkaart tekent en is niet leeg.
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState,
    { timeout: 15000 });
  const s0 = await state(page);
  check("titelkaart actief bij de start", s0.titelActief === true);
  check("canvas is niet leeg op de titelkaart", await canvasNietLeeg(page));

  // 2. Enter → de achtergrond → zolder. De achtergrond staat in de stem van de
  // verteller op de titelkaart, niet meer op een bladzijde van het notitieboek:
  // de speler hoort te weten waar dit over gaat vóór hij het boek vindt.
  await page.keyboard.press("Enter");
  await page.waitForTimeout(90);
  const sIntro = await state(page);
  check("Enter start de openingsreeks met een onderschrift",
    sIntro.openingActief === true && sIntro.vensterOpen === true,
    "opening=" + sIntro.openingActief + " venster=" + sIntro.vensterOpen);
  check("de achtergrond loopt niet via een notitieboek-spread",
    sIntro.modus !== "spread" && sIntro.spreadLevelId === null,
    "modus=" + sIntro.modus + " spread=" + sIntro.spreadLevelId);
  check("de openingsreeks tekent (canvas niet leeg)",
    await canvasNietLeeg(page));

  // Escape slaat de reeks over: wie herbegint wil dit niet vier keer zien.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  const sSkip = await state(page);
  check("Escape slaat de openingsreeks over",
    sSkip.openingActief === false && sSkip.titelActief === false,
    "opening=" + sSkip.openingActief + " titel=" + sSkip.titelActief);

  await naarZolder(page);
  const s1 = await state(page);
  check("na de achtergrond sta je in de zolder", s1.modus === "zolder",
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

  // 5. De hub-wandeling: zolder-west → zolder-midden → zolder-oost.
  await typCommando(page, "ga oost");
  check("west → doorgang (over de rand naar zolder-midden)",
    (await state(page)).sceneId === "zolder-midden",
    "scene=" + (await state(page)).sceneId);
  await typCommando(page, "ga oost");
  check("doorgang → werkhoek (over de rand naar zolder-oost)",
    (await state(page)).sceneId === "zolder-oost",
    "scene=" + (await state(page)).sceneId);

  // 5b. De '?'-hint volgt de voortgang, niet de kamer. In de werkhoek, met nog
  //     niets ontgrendeld, hoort hij naar het notitieboek in de westhoek te
  //     wijzen — de oude vaste hint van deze hoek zei hier "ga aan de pc zitten".
  await typCommando(page, "?");
  const sHint = await state(page);
  const hintTekst = sHint.vensterRegels.join(" ");
  const verwachtGinder = await page.evaluate(
    () => window.AL.strings.hints.fragmentGinder["zolder-west"].slice(0, 24));
  check("'?' in de werkhoek wijst naar het nog niet gevonden notitieboek",
    hintTekst.includes(verwachtGinder), hintTekst);
  check("de zolder-hint telt niet in hintsTotaal", sHint.hintsTotaal === 0,
    "hintsTotaal=" + sHint.hintsTotaal);

  // 6. Terug naar de westhoek en het notitieboek openen → fragment + spread.
  await typCommando(page, "ga west");
  await typCommando(page, "ga west");
  check("terug in de westhoek", (await state(page)).sceneId === "zolder-west");
  await typCommando(page, "open notitieboek");
  await page.waitForFunction(() => window.AL.debugState.modus === "spread",
    null, { timeout: 15000 });
  const ontgrendeld = await page.evaluate(() =>
    window.AL.debugToestand.levels["1"].ontgrendeld);
  check("open notitieboek ontgrendelt fragment 1 en opent de spread",
    ontgrendeld === true && (await state(page)).modus === "spread");

  // 7. De spread doorbladeren; de laatste pagina leidt naar de pc (werkhoek).
  await sluitVensters(page);      // sluit het fragment-venster boven de spread
  const paginas = await page.evaluate(() =>
    window.AL.spreads.aantalPaginas(window.AL.strings.spreads["l1"]));
  check("de l1-spread telt meerdere pagina's", paginas >= 2, "n=" + paginas);
  const p0 = (await state(page)).spreadPagina;
  await page.keyboard.press("Enter");
  await page.waitForTimeout(80);
  const p1 = (await state(page)).spreadPagina;
  check("spatie/Enter bladert de spread een pagina verder", p1 === p0 + 1,
    p0 + " -> " + p1);
  for (let i = 0; i < paginas + 2; i++) {
    if ((await state(page)).modus !== "spread") break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(80);
  }
  await sluitVensters(page);
  const naSpread = await state(page);
  check("na de laatste spread-pagina sta je bij de pc (werkhoek)",
    naSpread.modus === "zolder" && naSpread.sceneId === "zolder-oost",
    "scene=" + naSpread.sceneId);

  // 8. Aan de pc gaan zitten → pc:open; Escape keert terug naar de zolder.
  await typCommando(page, "ga zitten");
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen),
    null, { timeout: 15000 });
  const sPc = await state(page);
  check("ga zitten aan de pc opent de overlay (pc:open)",
    sPc.modus === "pc" && sPc.overlayOpen === true);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.AL.debugState.modus === "zolder",
    null, { timeout: 15000 });
  check("Escape sluit de pc en keert terug naar de zolder",
    (await state(page)).modus === "zolder");

  // 9. Reload: de save wordt hersteld (geen titelkaart, fragment nog gevonden).
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

  // 10. Geluid. Het zolderbed hoort te draaien, en "geluid uit" hoort écht stil
  //     te maken. Dat laatste is zonder speaker alleen te controleren aan de
  //     meestergain — en die moet nul zijn, niet "bijna nul": er staan op dat
  //     moment noten in de toekomst gepland die niet meer in te trekken zijn.
  //
  //     De klik hieronder is niet decoratief. Sinds WP 37 start de geluidslaag
  //     pas bij een gebruikersactie, en de reload van punt 9 heeft er nog geen
  //     gehad — een herladen tabblad is voor de browser een verse pagina. Dat
  //     dit een múisklik is en geen toets, is meteen de regressie: vóór WP 37
  //     ontgrendelde alleen het toetsenbord. Op deze desktopcontext (geen
  //     aanraakscherm) registreert js/touch.js geen click-handler, dus de klik
  //     raakt het spel verder niet aan.
  await page.click("#scherm");
  await page.waitForFunction(
    () => window.AL.sound.huidigBed() === "ambient-zolder",
    null, { timeout: 15000 });
  const gAan = await page.evaluate(() => window.AL.sound.debug());
  check("het zolderbed draait op de zolder", gAan.bed === "ambient-zolder",
    "bed=" + gAan.bed);
  check("er staan noten vooruit gepland", gAan.geplaatst > 0,
    "geplaatst=" + gAan.geplaatst);
  check("de meestergain staat open", gAan.meesterGain > 0,
    "gain=" + gAan.meesterGain);

  await typCommando(page, "geluid uit");
  const gUit = await page.evaluate(() => window.AL.sound.debug());
  check("geluid uit zet de meestergain op nul", gUit.meesterGain === 0,
    "gain=" + gUit.meesterGain);
  check("geluid uit vergeet het bed", gUit.bed === null, "bed=" + gUit.bed);

  await typCommando(page, "geluid aan");
  const gWeer = await page.evaluate(() => window.AL.sound.debug());
  check("geluid aan zet de meestergain weer open", gWeer.meesterGain > 0,
    "gain=" + gWeer.meesterGain);
  check("geluid aan start het bed van de huidige stand weer",
    gWeer.bed === "ambient-zolder", "bed=" + gWeer.bed);

  // 11. Herbegin. Dit is de regressie: de vraag noemt zelf het antwoord dat je
  //     moet typen, dus dat antwoord moet ook getypt kúnnen worden. Blokkeerde
  //     het venster de invoer — zoals elk ander venster doet — dan slikte het
  //     "herbegin", klikte de spatie het venster weg, en belandde "ja" als
  //     onbegrepen commando in de balk. Geen enkele toetsaanslag hieronder mag
  //     dus tussendoor een venster wegklikken.
  await sluitVensters(page);
  const seedVoor = (await state(page)).seed;
  await page.keyboard.type("herbegin", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(140);
  const sVraag = await state(page);
  check("herbegin opent de bevestigingsvraag",
    sVraag.vensterOpen === true && sVraag.vensterVraag === true,
    "venster=" + sVraag.vensterOpen + " vraag=" + sVraag.vensterVraag);
  check("de vraag laat de invoerbalk vrij",
    (await page.evaluate(() => window.AL.input.blokkeer)) === false);

  // Precies typen wat de vraag zegt, zonder het venster eerst weg te klikken.
  await page.keyboard.type("herbegin ja", { delay: 6 });
  const regel = await page.evaluate(() => window.AL.input.regel);
  check("de spatie in 'herbegin ja' klikt het venster niet weg",
    regel === "herbegin ja", "regel=" + JSON.stringify(regel));

  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const sNa = await state(page);
  check("herbegin ja start de openingsreeks opnieuw",
    sNa.openingActief === true, "opening=" + sNa.openingActief);
  check("herbegin ja geeft een verse staat", sNa.seed !== seedVoor,
    "voor=" + seedVoor + " na=" + sNa.seed);
  const gewist = await page.evaluate(() =>
    window.AL.debugToestand.levels["1"].ontgrendeld);
  check("herbegin wist de voortgang (fragment 1 weer op slot)",
    gewist === false, "ontgrendeld=" + gewist);

  // Escape slaat de herhaalde opening over en zet je in de verse zolder.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  await sluitVensters(page);
  const sVers = await state(page);
  check("Escape brengt je na een herbegin in de verse zolder",
    sVers.openingActief === false && sVers.modus === "zolder" &&
    sVers.sceneId === "zolder-west", "scene=" + sVers.sceneId);

  // Escape trekt een openstaande vraag in en laat alles staan.
  await page.keyboard.type("herbegin", { delay: 6 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(140);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(140);
  const sAf = await state(page);
  check("Escape trekt de herbegin-vraag in zonder iets te wissen",
    sAf.vensterOpen === false && sAf.openingActief === false &&
    sAf.seed === sVers.seed, "venster=" + sAf.vensterOpen +
    " seed=" + sAf.seed);

  // ---- De terugvalkamer klaagt hoorbaar (WP 38) --------------------------
  // Een scène-id die nergens bestaat — een typfout in een exit, een bestand dat
  // niet in index.html staat — gaf vroeger een lege bruine kamer en verder
  // niets: geen fout, geen spoor, alleen een speler die zich afvraagt waar hij
  // is. De engine mag daar niet op crashen (dat blijft zo), maar ze hoort het
  // wél te zeggen. Hier halen we een échte kamer weg en lopen we er naartoe.
  await page.evaluate(() => {
    window.__alScene = window.AL.scenes["zolder-midden"];
    delete window.AL.scenes["zolder-midden"];
  });
  const warnVoor = waarschuwingen.length;
  await typCommando(page, "ga oost");
  await page.waitForTimeout(120);
  const sVal = await state(page);
  const warnNa = waarschuwingen.slice(warnVoor);
  check("een ontbrekende scène laat het spel niet crashen",
    sVal.modus === "zolder" && sVal.sceneId === "zolder-midden",
    "modus=" + sVal.modus + " scene=" + sVal.sceneId);
  check("de terugvalkamer tekent (canvas niet leeg)",
    await canvasNietLeeg(page));
  check("een ontbrekende scène meldt zich met haar id in de console",
    warnNa.some((w) => w.includes("zolder-midden") && w.includes("scène")),
    "waarschuwingen=" + JSON.stringify(warnNa));

  // De kamer terugzetten, zodat een latere uitbreiding van deze test niet in
  // een half gesloopte zolder begint.
  await page.evaluate(() => {
    window.AL.scenes["zolder-midden"] = window.__alScene;
  });

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
