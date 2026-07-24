// test-sim-cross-check.mjs — DE kritische test van WP 9. Voor elk van de vier
// eind-scripts in seven-little-goats/test-scripts/ draait hij hetzelfde script
// door de ECHTE Java (java -cp out Main, gespawnd) én door AL.sim.world, en
// vergelijkt de twee transcripts. Het doel (spelontwerp-seven-little-goats.md)
// is een woordelijke match: kamernamen, voorwerpnamen, schadegetallen,
// eindtekst.
//
// Normalisatie vóór de vergelijking (en enkel dit — geen inhoudelijke
// verschillen worden weggepoetst): Java drukt de prompt "> " zonder newline af,
// zodat hij samensmelt met de eerstvolgende programmauitvoer op dezelfde regel;
// verder staan er lege println's als opmaak. We strippen daarom per regel één
// leidende "> ", knippen trailing whitespace weg en laten lege regels vallen.
// Interne spaties (de kolommen van het schade-overzicht) blijven staan. Wat
// overblijft is de zuivere inhoud; die moet regel voor regel identiek zijn.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync, execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");
const javaWortel = join(wortel, "seven-little-goats");
const srcDir = join(javaWortel, "src");
const outDir = join(javaWortel, "out");
const scriptsDir = join(javaWortel, "test-scripts");

// Laad de sim-modules (ze hangen aan globalThis.AL en exporteren via module.exports).
require(join(wortel, "js", "sim", "goats-strings.js"));
require(join(wortel, "js", "sim", "goats-world.js"));
require(join(wortel, "js", "sim", "goats-combat.js"));
const AL = globalThis.AL;

// Zorg dat de Java gecompileerd is (out/Main.class bestaat, of compileer opnieuw).
function zorgVoorCompilatie() {
  if (existsSync(join(outDir, "Main.class"))) return true;
  try {
    const bronnen = readdirSync(srcDir).filter((f) => f.endsWith(".java"))
      .map((f) => join(srcDir, f));
    execSync(`javac -d ${JSON.stringify(outDir)} ${bronnen.map((b) => JSON.stringify(b)).join(" ")}`,
      { stdio: "pipe" });
    return existsSync(join(outDir, "Main.class"));
  } catch (e) {
    return false;
  }
}

function javaBeschikbaar() {
  const r = spawnSync("java", ["-version"], { stdio: "pipe" });
  return r.status === 0 || (r.stderr && String(r.stderr).length > 0);
}

function draaiJava(scriptTekst) {
  const r = spawnSync("java", ["-cp", outDir, "Main"], {
    input: scriptTekst, encoding: "utf8", timeout: 30000
  });
  return r.stdout || "";
}

// Draai het script door de sim: verzamel de boot-uitvoer en per commando de
// teruggegeven tekst tot één transcript.
function draaiSim(scriptTekst) {
  const t = AL.sim.world.nieuw();
  const regels = [];
  const boot = AL.sim.world.introRegels(t);
  regels.push(...boot.tekst);
  const commandos = scriptTekst.split("\n").map((s) => s.replace(/\r$/, ""))
    .filter((s) => s.trim().length > 0);
  for (const cmd of commandos) {
    if (t.gestopt) break;
    const r = AL.sim.world.verwerk(t, cmd);
    regels.push(...r.tekst);
  }
  return { transcript: regels.join("\n"), toestand: t };
}

// De normalisatie: strip één leidende "> ", trailing whitespace, drop lege regels.
function normaliseer(transcript) {
  return transcript.split("\n")
    .map((r) => r.replace(/^> ?/, "").replace(/\s+$/, ""))
    .filter((r) => r.length > 0);
}

const scripts = existsSync(scriptsDir)
  ? readdirSync(scriptsDir).filter((f) => f.endsWith(".txt")).sort()
  : [];

test("java is beschikbaar en gecompileerd", () => {
  assert.ok(javaBeschikbaar(), "java -version moet werken in deze omgeving");
  assert.ok(zorgVoorCompilatie(), "de Java-broncode moet compileren naar out/");
});

for (const scriptNaam of scripts) {
  test(`cross-check: ${scriptNaam}`, () => {
    const scriptTekst = readFileSync(join(scriptsDir, scriptNaam), "utf8");
    const javaUit = normaliseer(draaiJava(scriptTekst));
    const { transcript } = draaiSim(scriptTekst);
    const simUit = normaliseer(transcript);

    // Regel voor regel vergelijken geeft de eerste afwijking scherp aan.
    const n = Math.max(javaUit.length, simUit.length);
    for (let i = 0; i < n; i++) {
      assert.equal(simUit[i], javaUit[i],
        `regel ${i} verschilt in ${scriptNaam}\n  java: ${JSON.stringify(javaUit[i])}\n  sim:  ${JSON.stringify(simUit[i])}`);
    }
    assert.equal(simUit.length, javaUit.length,
      `verschillend aantal inhoudsregels in ${scriptNaam}`);
  });
}

// Exporteer voor hergebruik.
export { draaiJava, draaiSim, normaliseer, scripts, scriptsDir, zorgVoorCompilatie };

// Standalone rapport: `node test/test-sim-cross-check.mjs` (zonder --test) drukt
// per script PASS/FAIL en een excerpt af. Onder de node:test-runner (--test)
// slaan we dit over zodat de output niet dubbel loopt.
const onderTestRunner = process.execArgv.some((a) => a.includes("--test"));
const directGestart = process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];
if (directGestart && !onderTestRunner) {
  console.log("Cross-check: Java (java -cp out Main) vs. AL.sim.world\n");
  if (!zorgVoorCompilatie()) {
    console.error("KON NIET COMPILEREN — java/javac ontbreekt?");
    process.exit(1);
  }
  let alleGoed = true;
  for (const scriptNaam of scripts) {
    const scriptTekst = readFileSync(join(scriptsDir, scriptNaam), "utf8");
    const javaUit = normaliseer(draaiJava(scriptTekst));
    const simUit = normaliseer(draaiSim(scriptTekst).transcript);
    let ok = javaUit.length === simUit.length;
    let eersteAfwijking = -1;
    for (let i = 0; i < Math.max(javaUit.length, simUit.length); i++) {
      if (javaUit[i] !== simUit[i]) { ok = false; eersteAfwijking = i; break; }
    }
    alleGoed = alleGoed && ok;
    console.log(`${ok ? "PASS" : "FAIL"}  ${scriptNaam}  ` +
      `(${javaUit.length} inhoudsregels, identiek in Java en sim)`);
    if (!ok && eersteAfwijking >= 0) {
      console.log(`      eerste afwijking op regel ${eersteAfwijking}:`);
      console.log(`        java: ${JSON.stringify(javaUit[eersteAfwijking])}`);
      console.log(`        sim:  ${JSON.stringify(simUit[eersteAfwijking])}`);
    }
  }
  // Excerpt: de laatste regels (de eindtekst) van het beste einde.
  const best = "einde-schaar-en-stenen.txt";
  if (scripts.includes(best)) {
    const simUit = normaliseer(draaiSim(readFileSync(join(scriptsDir, best), "utf8")).transcript);
    console.log(`\nExcerpt (${best}), laatste 10 regels — gelijk aan Java:`);
    for (const r of simUit.slice(-10)) console.log("  | " + r);
  }
  process.exit(alleGoed ? 0 : 1);
}
