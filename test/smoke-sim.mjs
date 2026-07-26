// smoke-sim.mjs — Playwright-rooksmaaktest van de endgame (WP 9). Opent de ECHTE
// index.html, brengt de speler via debugStartPc(7) snel tot in level 7, lost de
// drie puzzels op met de modeloplossingen zodat level-af:7 valt, en bewijst dan
// de VOLLEDIGE, niet-gestubte endgame-keten in de UI:
//   level-af:7 → sim:boot (de sim boot in het terminalpaneel) → de speler speelt
//   een winnend script → sim:einde → oordeel → diskette → epiloog.
//
// De diskette-beat kwam er in WP 48c bij; deze test dekt hem mee, inclusief een
// reload middenin (de beat begint dan opnieuw en strandt niet).
//
// Beslissing: het bereiken van level 7 via de zolder-lus is al gedekt door
// smoke-levels-4-7.mjs; deze test gebruikt de bestaande debughaak debugStartPc(7)
// om snel tot level-af:7 te komen en focust op de sim-boot en de vervolgketen —
// dat is precies het stuk dat WP 9 toevoegt. De level-af:7 → sim:boot-overgang
// loopt hier langs het ECHTE engine-pad (geen debugSimVoltooid-stub).
//
// Zonder testframework: platte asserties met PASS/FAIL en een exitcode.

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

const rijen = [];
function check(naam, voorwaarde, detail) {
  rijen.push({ naam, ok: !!voorwaarde });
  console.log("  " + (voorwaarde ? "PASS" : "FAIL") + "  " + naam +
    (detail ? "  (" + detail + ")" : ""));
  return !!voorwaarde;
}

function ev(page, fn, arg) { return page.evaluate(fn, arg); }
function state(page) { return page.evaluate(() => window.AL.debugState); }

async function wachtView(page, view) {
  await page.waitForFunction((v) => window.AL.pc.debug.view() === v, view,
    { timeout: 8000 });
}

// Los één level-7-puzzel op met de modeloplossing / het juiste antwoord.
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
    } else if (def.type === "verklaar") {
      await page.fill(".pc-term-invoer", "een zoeklus geeft het gevonden object of null terug");
      await page.press(".pc-term-invoer", "Enter");
      await page.waitForTimeout(80);
      await page.fill(".pc-term-invoer", "juist");
      await page.press(".pc-term-invoer", "Enter");
    } else {
      const antwoord = await ev(page, () => window.AL.pc.debug.verwacht());
      await page.fill(".pc-term-invoer", String(antwoord));
      await page.press(".pc-term-invoer", "Enter");
    }
    await page.waitForTimeout(120);
  }
}

// Voer één sim-commando in via het terminalpaneel (rauwe modus).
async function simCommando(page, cmd) {
  await ev(page, (c) => window.AL.pc.terminal._submit(c), cmd);
  await page.waitForTimeout(40);
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
  console.log("Rooksmaaktest — de endgame: level-af:7 → sim → oordeel → diskette → epiloog\n");

  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const paginaFouten = [];
  page.on("pageerror", (e) => paginaFouten.push(e.message));

  await page.goto(pathToFileURL(indexPad).href + "?seed=1", { waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });

  // Snel tot in level 7 (bestaande debughaak), dan de drie puzzels oplossen.
  await ev(page, () => window.AL.debugStartPc(7));
  await page.waitForFunction(() => (window.AL.debugState.modus === "pc" && window.AL.debugState.overlayOpen), null, { timeout: 15000 });
  const sPc = await state(page);
  check("level 7 opent in de pc", sPc.modus === "pc" && String(sPc.levelActief) === "7",
    "levelActief=" + sPc.levelActief);

  const defs = await ev(page, () =>
    window.AL.levels.puzzelDefs("7").map((d) => ({ id: d.id, type: d.type })));
  check("level 7 toont drie puzzels", defs.length === 3, "n=" + defs.length);
  for (const def of defs) await losPuzzelOp(page, def);

  const afgerond = await ev(page, () => window.AL.debugToestand.levels["7"].afgerond);
  check("level 7 is afgerond (level-af:7)", afgerond === true);

  // level-af:7 moet — via het echte engine-pad — de sim geboot hebben.
  await page.waitForFunction(() => window.AL.debugState.modus === "sim",
    null, { timeout: 8000 }).catch(() => {});
  const sSim = await state(page);
  check("sim:boot: de engine schakelt naar modus 'sim'", sSim.modus === "sim",
    "modus=" + sSim.modus);

  const termNaBoot = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("de sim toont de openingskamer (== Geitenhuisje ==)",
    termNaBoot.includes("== Geitenhuisje =="));
  check("de sim toont de titelbanner", termNaBoot.includes("SEVEN LITTLE GOATS"));
  const simKamer = await ev(page, () => window.AL.sim.terminal._toestand().kamerId);
  check("de sim-substaat start in het geitenhuisje", simKamer === "geitenhuisje");

  // Speel een kort winnend script naar het einde 'de les' (spaar op het smeekmoment).
  const script = ["pak rode mantel", "pak keukenmes", "ga zuid", "ga zuid", "ga zuid",
    "ga zuid", "ga zuid", "ga zuid", "vecht", "val aan", "val aan", "val aan", "spaar"];
  for (const cmd of script) await simCommando(page, cmd);

  const termNaEinde = await ev(page, () => window.AL.pc.debug.terminalTekst());
  check("de sim bereikt het einde 'de les'", termNaEinde.includes("Einde: de les."));

  // sim:einde → oordeel (de overlay wijkt voor de oordeelkaart op het canvas).
  await page.waitForFunction(() => window.AL.debugState.modus === "oordeel",
    null, { timeout: 8000 }).catch(() => {});
  const sOordeel = await state(page);
  check("sim:einde → oordeel: de engine toont Alberta's oordeel",
    sOordeel.modus === "oordeel", "modus=" + sOordeel.modus);
  check("de sim-overlay is gesloten voor de oordeelkaart", sOordeel.overlayOpen === false);
  check("een oordeel-tier is bepaald", !!sOordeel.einde, "einde=" + sOordeel.einde);

  await page.screenshot({ path: join(SCRATCH, "wp9-oordeel.png") });

  // oordeel → diskette (WP 48c). Twee beats op één kaart: eerst schrijft de
  // drive weg, dan ligt de diskette in je hand. Pas daarna komt de epiloog.
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.AL.debugState.modus === "diskette",
    null, { timeout: 8000 }).catch(() => {});
  const sDisk = await state(page);
  check("oordeel → diskette: de diskettekaart verschijnt",
    sDisk.modus === "diskette", "modus=" + sDisk.modus);
  check("de diskette begint bij het wegschrijven (beat 0)",
    sDisk.disketteStap === 0, "stap=" + sDisk.disketteStap);

  // Wordt de kaart écht getekend? Twee pixels: het etiket is papier (licht), de
  // achtergrond is koel en donker. Een modus zonder beeld zou dat niet halen.
  // Eerst een frame afwachten: de modus wisselt in de effect-dispatch, het
  // canvas pas in de volgende render — zonder deze pauze leest de test nog de
  // oordeelkaart die er nog op staat.
  await page.waitForTimeout(200);
  const pix = await ev(page, () => {
    const c = document.getElementById("scherm");
    const g = c.getContext("2d");
    const p1 = g.getImageData(196, 80, 1, 1).data;   // midden van het etiket
    const p2 = g.getImageData(20, 20, 1, 1).data;    // de donkere achtergrond
    return { etiket: [p1[0], p1[1], p1[2]], achter: [p2[0], p2[1], p2[2]] };
  });
  check("de diskettekaart is getekend: papier op het etiket, donker eromheen",
    pix.etiket[0] > 180 && pix.etiket[2] > 150 && pix.achter[0] < 90,
    "etiket=" + pix.etiket.join(",") + " achter=" + pix.achter.join(","));

  await page.screenshot({ path: join(SCRATCH, "wp48c-diskette.png") });

  // Een reload middenin de beat mag de speler niet stranden: de save staat op
  // modus "diskette", de beat begint opnieuw bij het wegschrijven, en Enter
  // brengt hem van daaruit gewoon verder.
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.AL && !!window.AL.debugState, { timeout: 15000 });
  const naReload = await state(page);
  check("reload tijdens de diskette-beat: de kaart staat er weer",
    naReload.modus === "diskette" && naReload.disketteStap === 0,
    "modus=" + naReload.modus + " stap=" + naReload.disketteStap);

  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.AL.debugState.disketteStap === 1,
    null, { timeout: 8000 }).catch(() => {});
  const sDisk2 = await state(page);
  check("Enter: de diskette komt uit de drive (beat 1)",
    sDisk2.modus === "diskette" && sDisk2.disketteStap === 1,
    "modus=" + sDisk2.modus + " stap=" + sDisk2.disketteStap);

  // diskette → epiloog (Enter bladert door).
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.AL.debugState.modus === "epiloog",
    null, { timeout: 8000 }).catch(() => {});
  const sEpiloog = await state(page);
  check("diskette → epiloog: de slottekst verschijnt", sEpiloog.modus === "epiloog",
    "modus=" + sEpiloog.modus);
  const epiloogTekst = await ev(page, () => window.AL.strings.epiloog.alineas.join(" "));
  check("de epiloog draagt de diskette, niet een doos op zolder",
    epiloogTekst.includes("diskette") && !epiloogTekst.includes("ligt op zolder"));
  await page.screenshot({ path: join(SCRATCH, "wp48c-epiloog.png") });
  await page.screenshot({ path: join(SCRATCH, "wp9-epiloog.png") });

  check("geen JavaScript-fouten tijdens de endgame", paginaFouten.length === 0,
    paginaFouten.join(" | "));

  await context.close();
  await browser.close();

  const gefaald = rijen.filter((r) => !r.ok).length;
  console.log("\n" + (rijen.length - gefaald) + "/" + rijen.length + " PASS");
  if (gefaald > 0) { console.error(gefaald + " controle(s) gezakt."); process.exit(1); }
  console.log("Rooksmaaktest endgame geslaagd. Screenshots: " + SCRATCH + "/wp9-*.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
