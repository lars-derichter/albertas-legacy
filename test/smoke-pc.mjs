// smoke-pc.mjs — end-to-end rooksmaaktest van de gesimuleerde pc (WP 5). Opent
// de ECHTE index.html met ?seed=42&dev=1 (level 0, de proefdruk), en bewijst dat
// elke puzzelsoort speelbaar is via de DOM-overlay:
//   - het pc-menu toont de level-0-puzzels;
//   - de editor-herstelpuzzel: fout eerst → CHECK_FAIL met vriendelijke tekst,
//     dan het model → CHECK_OK + puzzle-af;
//   - Parsons: foute volgorde → feedback, juiste volgorde (uit de seeded shuffle)
//     → af;
//   - trace: correct antwoord → af;
//   - hints: '?' driemaal → drie gestage hints, de vierde → hint:geen-meer;
//   - concept-behoud: typen in de editor, herladen, draft hersteld;
//   - Escape keert terug naar de zolder.
// Legt twee screenshots vast (editor met puzzel, terminal met CHECK_FAIL).
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.
// Chromium vereist (npx playwright install chromium). Techniek overgenomen uit
// test/smoke-browser.mjs.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");
const indexUrl = pathToFileURL(join(wortel, "index.html")).href + "?seed=42&dev=1";
// Waar de screenshots landen. Stond hier vroeger als een absoluut pad van de
// machine van de auteur, waardoor deze test bij niemand anders liep. Nu een
// map in de repo (test-results/ staat al in .gitignore), te overschrijven met
// de omgevingsvariabele AL_SCRATCH.
const SCRATCH = process.env.AL_SCRATCH || join(wortel, "test-results");
mkdirSync(SCRATCH, { recursive: true });

const rijen = [];
function check(naam, voorwaarde, detail) {
  rijen.push({ naam, ok: !!voorwaarde });
  console.log("  " + (voorwaarde ? "PASS" : "FAIL") + "  " + naam +
    (detail ? "  (" + detail + ")" : ""));
  return !!voorwaarde;
}

function ev(page, fn, arg) { return page.evaluate(fn, arg); }

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
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const paginaFouten = [];
  page.on("pageerror", (e) => paginaFouten.push(e.message));

  console.log("Rooksmaaktest — de gesimuleerde pc (level 0)\n");

  // 1. Laden + de pc openen op level 0.
  await page.goto(indexUrl, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  await ev(page, () => window.AL.debugStartPc(0));
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen), null, { timeout: 15000 });
  const st0 = await ev(page, () => window.AL.debugState);
  check("de pc-overlay opent (modus pc)", st0.modus === "pc" && st0.overlayOpen === true);

  // 2. Het menu toont de level-0-puzzels.
  const menuAantal = await ev(page, () => document.querySelectorAll(".pc-menu-item").length);
  const ids = await ev(page, () => window.AL.pc.debug.puzzelIds());
  check("menu toont zeven level-0-puzzels", menuAantal === 7 && ids.length === 7,
    "n=" + menuAantal);
  check("menu bevat de editor-herstelpuzzel", ids.includes("l0-editor-repair"));

  // 3. Editor-herstelpuzzel via een echte menuklik.
  await page.click('.pc-menu-item[data-puzzel-id="l0-editor-repair"]');
  await page.waitForFunction(() => window.AL.pc.debug.view() === "editor", null, { timeout: 5000 });
  check("klikken op het menu opent de editor", await ev(page, () => window.AL.pc.debug.view()) === "editor");
  await page.waitForTimeout(120);
  await page.screenshot({ path: join(SCRATCH, "wp5-editor.png") });
  check("screenshot van de open editor bewaard", true, "wp5-editor.png");

  // 3b. De Turbo-chrome, en de dingen die WP J belooft.
  const chroom = await ev(page, () => {
    const chrome = document.querySelector(".pc-chrome");
    const inv = document.querySelector(".pc-editor-invoer");
    const uit = document.querySelector(".pc-editor-uitvoer");
    const st = getComputedStyle(chrome);
    return {
      menubalk: document.querySelectorAll(".pc-menubalk-item").length,
      fbalk: document.querySelectorAll(".pc-fbalk span").length,
      hoeken: st.borderTopLeftRadius,
      randStijl: st.borderTopStyle,
      schaduw: st.boxShadow,
      scanlines: getComputedStyle(chrome, "::after").backgroundImage,
      schrift: getComputedStyle(inv).fontFamily,
      editorScroll: inv.scrollTop,
      uitHoog: uit.clientHeight,
      uitRegel: parseFloat(getComputedStyle(uit).lineHeight)
    };
  });
  check("de menubalk draagt de levende commando's", chroom.menubalk >= 3,
    "items=" + chroom.menubalk);
  check("de F-toetsenbalk staat onderaan", chroom.fbalk >= 3,
    "vakken=" + chroom.fbalk);
  check("geen afgeronde hoeken", chroom.hoeken === "0px", chroom.hoeken);
  check("dubbellijns kader", chroom.randStijl === "double", chroom.randStijl);
  check("geen gloed rond de kast", chroom.schaduw.indexOf("42px") === -1 &&
    !/\b(2[0-9]|[3-9][0-9])px\s+rgba/.test(chroom.schaduw), chroom.schaduw);
  check("scanlines over het paneel",
    chroom.scanlines.indexOf("repeating-linear-gradient") === 0);
  check("Courier New is uit de schriftstack",
    chroom.schrift.toLowerCase().indexOf("courier") === -1, chroom.schrift);
  check("de editor opent bovenaan het bestand", chroom.editorScroll === 0,
    "scrollTop=" + chroom.editorScroll);
  check("het uitvoerpaneel is hoger dan één regel",
    chroom.uitHoog > chroom.uitRegel * 4,
    "hoog=" + chroom.uitHoog + " regel=" + chroom.uitRegel);

  // 4. Foute (beschadigde) oplossing eerst → CHECK_FAIL met vriendelijke tekst.
  await page.click(".pc-knop-compileer");
  await page.waitForTimeout(120);
  const uitFout = await ev(page, () => window.AL.pc.debug.editorUitvoer());
  check("beschadigde code geeft een CHECK_FAIL", uitFout.includes("CHECK_FAIL"));

  // CHECK_OK en CHECK_FAIL hadden exact dezelfde kleur; dat was de kern van de
  // feedbacklus in één amberkleurige muur tekst.
  const kleuren = await ev(page, () =>
    [...document.querySelectorAll(".pc-editor-uitvoer span")].map((sp) =>
      ({ k: sp.className, c: getComputedStyle(sp).color })));
  const okKleur = (kleuren.find((x) => x.k === "pc-uit-ok") || {}).c;
  const foutKleur = (kleuren.find((x) => x.k === "pc-uit-fout") || {}).c;
  check("CHECK_FAIL is rood", foutKleur === "rgb(255, 85, 85)", "" + foutKleur);
  check("CHECK_OK en CHECK_FAIL hebben niet dezelfde kleur",
    !!okKleur && !!foutKleur && okKleur !== foutKleur,
    "ok=" + okKleur + " fout=" + foutKleur);
  check("CHECK_FAIL draagt vriendelijke, vormgerichte feedback",
    uitFout.includes("this.<veld> = <parameter>"));
  await page.screenshot({ path: join(SCRATCH, "wp5-terminal.png") });
  check("screenshot van de terminal met CHECK_FAIL bewaard", true, "wp5-terminal.png");

  // 5. Modeloplossing → CHECK_OK + puzzle-af.
  const model = await ev(page, () => window.AL.pc.debug.model("l0-editor-repair"));
  await page.fill(".pc-editor-invoer", model);
  await page.click(".pc-knop-compileer");
  await page.waitForTimeout(150);
  const uitOk = await ev(page, () => window.AL.pc.debug.editorUitvoer());
  const statusRepair = await ev(page, () => window.AL.pc.debug.statussen()["l0-editor-repair"]);
  check("het model geeft CHECK_OK", uitOk.includes("CHECK_OK") && !uitOk.includes("CHECK_FAIL"));
  check("de editor-puzzel staat op 'af' (puzzle-af)", statusRepair === "af");

  // 6. Terug naar het menu (echte knop) — status weerspiegeld.
  await page.click(".pc-knop-terug");
  await page.waitForFunction(() => window.AL.pc.debug.view() === "menu", null, { timeout: 5000 });
  const badgeAf = await ev(page, () =>
    document.querySelector('.pc-menu-item[data-puzzel-id="l0-editor-repair"]')
      .classList.contains("pc-menu-status-af"));
  check("het menu markeert de opgeloste puzzel als 'af'", badgeAf === true);

  // 7. Parsons: foute volgorde → feedback; juiste volgorde (uit de shuffle) → af.
  await ev(page, () => window.AL.pc.debug.kies("l0-parsons"));
  await page.waitForFunction(() => window.AL.pc.debug.view() === "terminal", null, { timeout: 5000 });
  const juisteVolgorde = await ev(page, () => window.AL.pc.debug.parsonsVolgorde());
  const fouteVolgorde = juisteVolgorde.split(" ").reverse().join(" ");
  await page.fill(".pc-term-invoer", fouteVolgorde);
  await page.press(".pc-term-invoer", "Enter");
  await page.waitForTimeout(80);
  const naFout = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("Parsons: een foute volgorde geeft gestage feedback",
    naFout.includes("Nog niet"));
  await page.fill(".pc-term-invoer", juisteVolgorde);
  await page.press(".pc-term-invoer", "Enter");
  await page.waitForTimeout(80);
  const statusParsons = await ev(page, () => window.AL.pc.debug.statussen()["l0-parsons"]);
  check("Parsons: de juiste volgorde lost de puzzel op", statusParsons === "af",
    "volgorde=" + juisteVolgorde);

  // 8. Trace: correct antwoord → af.
  await ev(page, () => window.AL.pc.debug.kies("l0-trace"));
  await page.waitForFunction(() => window.AL.pc.debug.view() === "terminal", null, { timeout: 5000 });
  const verwacht = await ev(page, () => window.AL.pc.debug.verwacht());
  await page.fill(".pc-term-invoer", String(verwacht));
  await page.press(".pc-term-invoer", "Enter");
  await page.waitForTimeout(80);
  const statusTrace = await ev(page, () => window.AL.pc.debug.statussen()["l0-trace"]);
  check("trace: het juiste getal lost de puzzel op", statusTrace === "af",
    "verwacht=" + verwacht);

  // 9. Hints: '?' driemaal → drie gestage hints, de vierde → hint:geen-meer.
  await ev(page, () => window.AL.pc.debug.kies("l0-vindfout"));
  await page.waitForFunction(() => window.AL.pc.debug.view() === "terminal", null, { timeout: 5000 });
  for (let i = 0; i < 3; i++) {
    await page.fill(".pc-term-invoer", "?");
    await page.press(".pc-term-invoer", "Enter");
    await page.waitForTimeout(50);
  }
  const naDrie = await ev(page, () => window.AL.pc.debug.laatsteHint());
  const hintTeller = await ev(page, () =>
    window.AL.debugToestand.levels["0"].puzzels["l0-vindfout"].hints);
  const hint1 = await ev(page, () => window.AL.strings.puzzelHints["l0-vindfout"][0]);
  const termTekst = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("drie '?' geven drie gestage hints (hint:3, teller 3)",
    naDrie === "hint:3" && hintTeller === 3);
  check("de eerste hint-tekst verschijnt in de terminal",
    termTekst.includes(hint1.slice(0, 24)));
  await page.fill(".pc-term-invoer", "?");
  await page.press(".pc-term-invoer", "Enter");
  await page.waitForTimeout(50);
  const naVier = await ev(page, () => window.AL.pc.debug.laatsteHint());
  check("een vierde '?' geeft hint:geen-meer", naVier === "hint:geen-meer");

  // 10. Concept-behoud: typen in de editor, herladen, draft hersteld.
  await ev(page, () => window.AL.pc.debug.kies("l0-editor-write"));
  await page.waitForFunction(() => window.AL.pc.debug.view() === "editor", null, { timeout: 5000 });
  const merk = "// DRAFT-MERK-4242";
  await page.fill(".pc-editor-invoer", merk + "\nclass Geitje {}\n");
  await page.waitForTimeout(500);   // wacht de debounce-save af
  const draftVoor = await ev(page, () =>
    window.AL.debugToestand.levels["0"].puzzels["l0-editor-write"].draft);
  check("de editor bewaart het concept in de staat (debounced)",
    typeof draftVoor === "string" && draftVoor.includes("DRAFT-MERK-4242"));

  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen), null, { timeout: 15000 });
  await ev(page, () => window.AL.pc.debug.kies("l0-editor-write"));
  await page.waitForFunction(() => window.AL.pc.debug.view() === "editor", null, { timeout: 5000 });
  const codeNa = await ev(page, () => window.AL.pc.debug.editorCode());
  check("na herladen is het concept hersteld", codeNa.includes("DRAFT-MERK-4242"));

  // 11. Escape keert terug naar de zolder.
  await page.click(".pc-editor-invoer");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.AL.debugState.modus === "zolder", null, { timeout: 5000 });
  const stEind = await ev(page, () => window.AL.debugState);
  check("Escape keert terug naar de zolder (overlay dicht)",
    stEind.modus === "zolder" && stEind.overlayOpen === false);

  check("geen JavaScript-fouten op de pagina", paginaFouten.length === 0,
    paginaFouten.join(" | "));

  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) { console.error(gefaald + " controle(s) gezakt."); process.exit(1); }
  console.log("Rooksmaaktest pc geslaagd. Screenshots: " + SCRATCH + "/wp5-editor.png, " +
    SCRATCH + "/wp5-terminal.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
