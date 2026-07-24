// check-assets.mjs — de drift-wachter (WP 7-acceptatiecriterium). Bewijst dat de
// modeloplossing van elke editor-puzzel (herstel én schrijf-van-nul) uit
// js/levels/level1..3.js byte-getrouw overeenkomt met het echte Java-bestand in
// seven-little-goats/src/. Zo kan een puzzelfragment nooit ongemerkt afwijken van
// de broncode die het spel op het einde als prijs uitdeelt.
//
// Normalisatie (gedocumenteerd, bewuste keuze):
//   - We tokeniseren met de checker-tokenizer (AL.checker.tokenizer). Whitespace,
//     inspringing en commentaar vallen weg; operatoren en identifiers blijven
//     betekenisvol (net als de checker).
//   - Een puzzelmodel is meestal een GECUREERD UITTREKSEL van de bron (niet elk
//     lid van de klasse staat erin). Daarom matchen we PER LID: elk veld en elke
//     methode/constructor in het model moet als een aaneengesloten tokenreeks
//     letterlijk in de bron voorkomen. Zo tolereren we een subset, maar betrappen
//     we élke wijziging aan de code die de puzzel wél toont (signatuur, romp,
//     grens, operator).
//
// Draait headless: `node tools/check-assets.mjs`. Exitcode 0 = geen drift.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

// Laad de strings, de level-registry en de tokenizer (in die volgorde: de
// level-bestanden lezen AL.strings bij evaluatie en registreren bij AL.levels).
require(join(wortel, "js", "logic", "strings.js"));
require(join(wortel, "js", "logic", "levels.js"));
require(join(wortel, "js", "logic", "checker", "tokenizer.js"));

const level1 = require(join(wortel, "js", "levels", "level1.js"));
const level2 = require(join(wortel, "js", "levels", "level2.js"));
const level3 = require(join(wortel, "js", "levels", "level3.js"));
const level4 = require(join(wortel, "js", "levels", "level4.js"));
const level5 = require(join(wortel, "js", "levels", "level5.js"));
const level6 = require(join(wortel, "js", "levels", "level6.js"));
const level7 = require(join(wortel, "js", "levels", "level7.js"));

const tokenizer = globalThis.AL.checker.tokenizer;

// ---- Tokenhulp -------------------------------------------------------------

function tekstTokens(bron) {
  return tokenizer.tokenize(bron).tokens.map((t) => t.tekst);
}

// De volledige tokenlijst (met soort/positie), voor het opsplitsen in leden.
function tokens(bron) {
  return tokenizer.tokenize(bron).tokens;
}

// Snijd de romp van de eerste top-level klasse uit; is er geen klasse (een kaal
// methode-fragment, zoals de clamp), dan geldt de hele tokenstroom als scope.
function scopeVan(ts) {
  let ci = ts.findIndex((t) => t.tekst === "class");
  if (ci === -1) return ts;
  let bi = ci;
  while (bi < ts.length && ts[bi].tekst !== "{") bi++;
  if (bi >= ts.length) return ts;
  let d = 0, j = bi;
  for (; j < ts.length; j++) {
    if (ts[j].tekst === "{") d++;
    else if (ts[j].tekst === "}") { d--; if (d === 0) break; }
  }
  return ts.slice(bi + 1, j);
}

// Splits een scope op diepte 0 in leden: een veld eindigt op `;`, een methode of
// constructor op de sluitende `}`.
function leden(scope) {
  const res = [];
  let cur = [], d = 0;
  for (let i = 0; i < scope.length; i++) {
    const t = scope[i];
    cur.push(t);
    if (t.tekst === "{" || t.tekst === "(" || t.tekst === "[") d++;
    else if (t.tekst === "}" || t.tekst === ")" || t.tekst === "]") d--;
    if (d === 0 && (t.tekst === ";" || t.tekst === "}")) {
      res.push(cur);
      cur = [];
    }
  }
  if (cur.length) res.push(cur);
  return res;
}

function isAaneengeslotenDeel(naald, hooiberg) {
  if (naald.length === 0) return true;
  for (let i = 0; i + naald.length <= hooiberg.length; i++) {
    let ok = true;
    for (let j = 0; j < naald.length; j++) {
      if (hooiberg[i + j] !== naald[j]) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

// Een korte, leesbare naam voor een lid (voor de rapportregel).
function ledLabel(lid) {
  const namen = lid.filter((t) => t.soort === "identifier" || t.soort === "trefwoord");
  const eersteHaak = lid.findIndex((t) => t.tekst === "(");
  if (eersteHaak > 0) {
    // methode/constructor: naam vlak vóór de haak
    return lid[eersteHaak - 1].tekst + "(...)";
  }
  // veld: laatste identifier vóór ';' of '='
  const stop = lid.findIndex((t) => t.tekst === ";" || t.tekst === "=");
  const kop = stop === -1 ? lid : lid.slice(0, stop);
  const ids = kop.filter((t) => t.soort === "identifier" || t.soort === "trefwoord");
  return (ids.length ? ids[ids.length - 1].tekst : (namen[0] ? namen[0].tekst : "?")) + " (veld)";
}

// ---- De controle -----------------------------------------------------------

function editorPuzzels(def) {
  return (def.puzzels || []).filter((p) => p.type === "editor" && p.model && p.bron);
}

const bronCache = {};
function bronTokens(bron) {
  if (!bronCache[bron]) {
    const pad = join(wortel, "seven-little-goats", "src", bron);
    bronCache[bron] = tekstTokens(readFileSync(pad, "utf8"));
  }
  return bronCache[bron];
}

function controleerPuzzel(p) {
  const bron = bronTokens(p.bron);
  const modelLeden = leden(scopeVan(tokens(p.model)));
  const missers = [];
  for (const lid of modelLeden) {
    const naald = lid.map((t) => t.tekst);
    if (!isAaneengeslotenDeel(naald, bron)) {
      missers.push(ledLabel(lid));
    }
  }
  return { id: p.id, bron: p.bron, leden: modelLeden.length, missers };
}

function main() {
  const defs = [level1, level2, level3, level4, level5, level6, level7];
  const rijen = [];
  for (const def of defs) {
    for (const p of editorPuzzels(def)) {
      rijen.push(controleerPuzzel(p));
    }
  }

  console.log("check-assets — driftcontrole editor-modellen ↔ seven-little-goats/src/\n");
  let drift = 0;
  for (const r of rijen) {
    if (r.missers.length === 0) {
      console.log(`  OK    ${r.id.padEnd(20)} ${r.bron.padEnd(14)} ${r.leden} leden byte-getrouw`);
    } else {
      drift++;
      console.log(`  DRIFT ${r.id.padEnd(20)} ${r.bron.padEnd(14)} afwijkend: ${r.missers.join(", ")}`);
    }
  }
  console.log("");
  if (drift > 0) {
    console.error(`${drift} puzzel(s) wijken af van de bron. Los de drift op.`);
    process.exit(1);
  }
  console.log(`Geen drift: alle ${rijen.length} editor-modellen komen byte-getrouw uit de broncode.`);
}

main();
