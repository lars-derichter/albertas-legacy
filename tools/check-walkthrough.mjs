// check-walkthrough.mjs — bewijst dat de walkthrough zegt wat het spel zegt.
//
// Waarom dit bestaat: `walkthrough/deel1-hints.md` en `deel2-oplossingen.md`
// citeren het spel — commando's, hoofdstuktitels, modeloplossingen, Alberta's
// modelzinnen, de commandoscripts van de vier eindes. Elk van die citaten is
// een kopie, en een kopie veroudert stil: WP 29 t/m 38 herschreven proza,
// hints, titels en de sim-backstory zonder dat de gids meekwam. Deze lint maakt
// die drift mechanisch vindbaar, zoals `check-docpaden.mjs` dat doet voor
// paden.
//
// Vier keuringen:
//
//   1. **Hoofdstuktitels.** Elke `# Level N — …`-kop moet woordelijk gelijk
//      zijn aan `AL.strings.lN.naam`, en de weekregel eronder aan de week van
//      het spread.
//   2. **Java-blokken.** Elk ```java-blok in deel 2 moet, op inspringing en
//      lege regels na, terugkomen in een modeloplossing (`js/levels/levelN.js`)
//      of in de echte broncode (`seven-little-goats/src/*.java`). Deel 2 belooft
//      "letterlijk het fragment uit Alberta's broncode"; deze keuring maakt die
//      belofte hard.
//   3. **Commandoscripts.** Elk kaal ```-blok in deel 2 dat op een reeks
//      sim-commando's lijkt, moet regel voor regel gelijk zijn aan een script
//      in `seven-little-goats/test-scripts/`.
//   4. **Citaten en commando's.** Elk stuk tekst tussen dubbele aanhalings-
//      tekens en elke `code`-span moet voorkomen in de tekstcorpus van het spel
//      (`js/logic/strings.js`, `js/sim/goats-strings.js`, de levelbestanden, de
//      Java-broncode). De corpus is "alles wat het spel kan afdrukken": de
//      sjabloonfuncties van de trace-puzzels worden over hun hele pool
//      uitgerekend, zodat `toon(3)` en `3 20` er echt in staan. Een commando van
//      twee woorden (`pak stenen`, `onderzoek notitieboek`) telt als geldig
//      wanneer het werkwoord in een van de twee `help`-lijsten staat én het
//      zelfstandig naamwoord in de corpus. Wat de gids in zijn eigen stem zegt —
//      een woord dat hij benadrukt, een term die hij zelf verzint — staat in de
//      lijst EIGEN_WOORDEN hieronder, elk met zijn reden. Die lijst is de enige
//      toegestane uitzondering, en ze is kort te houden.
//
// Wat deze lint NIET doet: de hintteksten van deel 1 woordelijk vergelijken met
// `AL.strings.puzzelHints`. Deel 1 herformuleert stadium 1 en 2 bewust in zijn
// eigen opgewekte tijdschriftstem (workflow/11-walkthrough.md); woordelijkheid
// eisen zou die beslissing terugdraaien. Wat wél gekeurd wordt, is het contract
// eromheen: geen stadium 3 in deel 1. Dat is keuring 5.
//
// Gebruik: node tools/check-walkthrough.mjs   (exit 1 bij elke afwijking)

import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");

require(join(wortel, "js", "logic", "strings.js"));
require(join(wortel, "js", "logic", "levels.js"));
require(join(wortel, "js", "logic", "world.js"));
for (const n of [1, 2, 3, 4, 5, 6, 7]) {
  require(join(wortel, "js", "levels", "level" + n + ".js"));
}
require(join(wortel, "js", "sim", "goats-strings.js"));
const AL = globalThis.AL;

// De YAML-kop draagt de titels van de gids zelf (geen spelteksten) en gaat er
// af voor er iets gekeurd wordt.
function zonderKop(s) { return s.replace(/^---\n[\s\S]*?\n---\n/, ""); }
const deel1 = zonderKop(readFileSync(join(wortel, "walkthrough", "deel1-hints.md"), "utf8"));
const deel2 = zonderKop(readFileSync(join(wortel, "walkthrough", "deel2-oplossingen.md"), "utf8"));

const fouten = [];
let gekeurd = 0;
function keur(ok, wat) {
  gekeurd++;
  if (!ok) fouten.push(wat);
}

// --- de tekstcorpus van het spel --------------------------------------------
// Alle proza uit de strings-objecten, plus de ruwe brontekst van de bestanden
// die tekst dragen. De ruwe tekst is nodig omdat een deel van de zinnen in
// sjabloonfuncties zit (`neemtMee`, `smeek`) en omdat de levelbestanden hun
// modeloplossingen als string-concatenatie dragen.
function vlak(waarde, uit) {
  if (typeof waarde === "string") uit.push(waarde);
  else if (Array.isArray(waarde)) waarde.forEach((v) => vlak(v, uit));
  else if (waarde && typeof waarde === "object") {
    Object.keys(waarde).forEach((k) => vlak(waarde[k], uit));
  }
  return uit;
}

const bronBestanden = [
  join(wortel, "js", "logic", "strings.js"),
  join(wortel, "js", "sim", "goats-strings.js"),
  join(wortel, "js", "sim", "goats-world.js"),
  join(wortel, "js", "sim", "goats-combat.js"),
  join(wortel, "js", "logic", "world.js"),
  join(wortel, "js", "logic", "levels.js"),
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => join(wortel, "js", "levels", "level" + n + ".js")),
  ...readdirSync(join(wortel, "seven-little-goats", "src"))
    .filter((f) => f.endsWith(".java"))
    .map((f) => join(wortel, "seven-little-goats", "src", f))
];

// Normaliseer: witruimte tot één spatie, typografische aanhalingstekens en
// koppeltekens tot hun kale vorm. Zo botst een citaat niet op een regeleinde
// dat de word-wrap van 80 tekens erin heeft gelegd.
function norm(s) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\\"/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Alles wat een puzzel kan afdrukken: de trace-vragen en hun verwachte
// antwoorden zijn sjabloonfuncties over een pool, dus reken ze uit.
function puzzelUitvoer() {
  const uit = [];
  for (const n of ["1", "2", "3", "4", "5", "6", "7"]) {
    for (const pd of AL.levels.puzzelDefs(n) || []) {
      const pool = pd.pool || [null];
      for (const v of pool) {
        for (const veld of ["vraag", "verwacht", "ok", "fout", "toon", "model"]) {
          const w = pd[veld];
          if (typeof w === "function") { try { vlak(w(v), uit); } catch { /* geen pool */ } }
          else if (w !== undefined) vlak(w, uit);
        }
      }
    }
  }
  return uit;
}

const corpus = norm(
  vlak(AL.strings, []).join("\n") + "\n" +
  vlak(AL.sim.strings, []).join("\n") + "\n" +
  puzzelUitvoer().join("\n") + "\n" +
  bronBestanden.map((p) => readFileSync(p, "utf8")).join("\n")
).toLowerCase();

// De werkwoorden die de twee help-lijsten kennen: het eerste woord van elke
// regel. Daarmee is "pak stenen" te keuren zonder de hele woordenlijst van de
// parser hier te herhalen.
const WERKWOORDEN = new Set(
  [...AL.strings.help, ...AL.sim.strings.help]
    .map((r) => r.trim().split(/\s+/)[0].toLowerCase())
    .filter((w) => /^[a-z?]+$/.test(w))
);

// Wat de gids in zijn eigen stem zegt. Elk item met zijn reden; wie er iets aan
// toevoegt, hoort die reden erbij te schrijven.
const EIGEN_WOORDEN = new Map([
  ["hoort", "de gids benadrukt het woord zelf ('welke je \"hoort\" te spelen')"],
  ["de stenen", "de gids vat de losse stenen en de gladde kiezels samen onder één noemer"],
  ["cijfer", "de gids zet het woord tussen aanhalingstekens omdat het spel geen cijfers geeft"]
]);

// --- 1. hoofdstuktitels en weken ---------------------------------------------
for (const tekst of [deel1, deel2]) {
  const koppen = [...tekst.matchAll(/^# (Level (\d) — .+)$/gm)];
  keur(koppen.length === 7, "verwacht zeven levelkoppen, gevonden " + koppen.length);
  for (const k of koppen) {
    const naam = AL.strings["l" + k[2]].naam;
    keur(k[1] === naam, "hoofdstuktitel wijkt af:\n    gids: " + k[1] + "\n    spel: " + naam);
  }
}
const weekRegels = [...deel1.matchAll(/Speelbaar na\s+week (\d)/g)];
keur(weekRegels.length === 7,
  "verwacht zeven weekregels in deel 1, gevonden " + weekRegels.length);
for (const m of weekRegels) {
  // De laatste levelkop vóór deze regel zegt over welk level het gaat.
  const nr = [...deel1.slice(0, m.index).matchAll(/# Level (\d) —/g)].pop()[1];
  keur(String(AL.strings.spreads["l" + nr].week) === m[1],
    "week van level " + nr + ": gids zegt " + m[1] + ", spread zegt " +
    AL.strings.spreads["l" + nr].week);
}

// --- 2. Java-blokken ----------------------------------------------------------
const javaCorpus = norm(
  bronBestanden.map((p) => readFileSync(p, "utf8")).join("\n")
    // De modellen in js/levels/ staan als "…\n" + "…\n"; plak ze aaneen zodat
    // een blok van meerdere regels als één stuk terugvindbaar is.
    .replace(/\\n"\s*\+\s*\n\s*"/g, " ")
    .replace(/\\n";/g, " ")
    .replace(/\\"/g, '"')
);
// Lees de blokken regel-geankerd: een sluitend hek is zelf ook "```\n", dus een
// gulzige zoektocht naar "```…```" leest de prose ertussen als een blok.
function blokkenVan(tekst) {
  return [...tekst.matchAll(/^```([a-z]*)\n([\s\S]*?)^```/gm)]
    .map((m) => ({ taal: m[1], inhoud: m[2] }));
}
const deel2Blokken = blokkenVan(deel2);
keur(deel2Blokken.length >= 15,
  "verwacht minstens vijftien codeblokken in deel 2, gevonden " + deel2Blokken.length);

for (const b of deel2Blokken.filter((b) => b.taal === "java")) {
  const blok = norm(b.inhoud);
  keur(javaCorpus.includes(blok),
    "Java-blok staat niet in een modeloplossing of in de broncode:\n    " +
    blok.slice(0, 90) + "…");
}

// --- 3. commandoscripts van de vier eindes ------------------------------------
const scriptMap = join(wortel, "seven-little-goats", "test-scripts");
const scripts = readdirSync(scriptMap).filter((f) => f.endsWith(".txt"))
  .map((f) => ({ naam: f, regels: readFileSync(join(scriptMap, f), "utf8").trim() }));
let scriptBlokken = 0;
for (const b of deel2Blokken.filter((b) => b.taal === "")) {
  const blok = b.inhoud.trim();
  if (!/^(pak|ga|vecht|val aan)/.test(blok)) continue;   // de kaart is geen script
  scriptBlokken++;
  keur(scripts.some((s) => s.regels === blok),
    "commandoscript komt met geen enkel test-script overeen:\n    " +
    blok.split("\n").slice(0, 3).join(" / ") + "…");
}
keur(scriptBlokken === 4,
  "verwacht vier eindescripts in deel 2, gevonden " + scriptBlokken);

// --- 4. citaten en commando's -------------------------------------------------
function keurFragmenten(tekst, bestand) {
  const zonderCode = tekst.replace(/```[\s\S]*?```/g, "");
  const stukken = [
    ...[...zonderCode.matchAll(/"([^"\n]{3,})"/g)].map((m) => m[1]),
    ...[...zonderCode.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])
  ];
  for (const ruw of stukken) {
    let s = norm(ruw).replace(/[.,;:!?]+$/, "");
    if (EIGEN_WOORDEN.has(s)) { gekeurd++; continue; }
    if (s.includes("/") && !s.includes(" ")) { gekeurd++; continue; }  // een pad; check-docpaden keurt die
    s = s.toLowerCase();
    // "week X" is het sjabloon van de spread-voet; het spel vult er een cijfer in.
    const kandidaten = s.includes("week x")
      ? [1, 2, 3, 4, 5, 6, 7].map((n) => s.replace("week x", "week " + n))
      : [s];
    if (kandidaten.some((k) => corpus.includes(k))) { gekeurd++; continue; }
    // Een commando van meerdere woorden: werkwoord uit een help-lijst, de rest
    // in de corpus.
    const woorden = s.split(" ");
    if (woorden.length > 1 && WERKWOORDEN.has(woorden[0]) &&
        corpus.includes(woorden.slice(1).join(" "))) { gekeurd++; continue; }
    keur(false, bestand + ": citaat staat nergens in de spelteksten: «" + ruw + "»");
  }
}
keurFragmenten(deel1, "deel1");
keurFragmenten(deel2, "deel2");

// --- 5. deel 1 lekt geen stadium 3 -------------------------------------------
// Deel 1 herformuleert stadium 1 en 2 in zijn eigen stem, dus een woordelijke
// vergelijking zegt niets. Wat wél meetbaar is: stadium 3 zegt dingen die
// stadium 1 en 2 níét zeggen — de vorm, de grens, het antwoord. Van elke
// stadium-3-hint nemen we de inhoudswoorden die niet al in stadium 1 of 2
// staan; duikt meer dan de helft daarvan (en minstens drie) op in het blok van
// diezelfde puzzel in deel 1, dan is stadium 3 daar aan het lekken.
const STOPWOORDEN = new Set(["de", "het", "een", "en", "of", "in", "op", "je",
  "dat", "die", "van", "te", "is", "met", "voor", "naar", "als", "er", "niet",
  "wat", "waar", "bij", "aan", "dan", "zo", "ook", "nog", "hier", "uit", "om",
  "maar", "geen", "kijk", "eerst", "ze", "hij", "wordt", "worden", "zijn"]);
function inhoud(s) {
  return new Set(norm(s).toLowerCase()
    .replace(/[^a-z0-9<>().+=/'-]+/g, " ")
    .split(" ")
    .map((w) => w.replace(/^[('"-]+/, "").replace(/[.,;:')"-]+$/, ""))
    .filter((w) => w.length > 1 && !STOPWOORDEN.has(w)));
}

// Welk blok van deel 1 hoort bij welke puzzel? De levelkop geeft het level, de
// vetgedrukte "Puzzel k"-regels geven de volgorde, en die volgorde is dezelfde
// als in AL.levels.puzzelDefs.
const blokken = [];
for (const m of deel1.matchAll(/^# Level (\d) —[\s\S]*?(?=^# )/gm)) {
  const defs = AL.levels.puzzelDefs(m[1]) || [];
  const stukken = m[0].split(/^\*\*Puzzel \d/m).slice(1);
  stukken.forEach((s, i) => { if (defs[i]) blokken.push([defs[i].id, s]); });
}
keur(blokken.length === 21, "verwacht 21 puzzelblokken in deel 1, gevonden " + blokken.length);

// Wat de speler sowieso op zijn scherm heeft staan — de vraag, de stroken, het
// beschadigde fragment in de editor — is geen lek als de gids het herhaalt.
function zichtbaar(pd) {
  const uit = [];
  for (const v of pd.pool || [null]) {
    for (const veld of ["vraag", "toon", "varianten", "stroken", "opties"]) {
      const w = pd[veld];
      if (typeof w === "function") { try { vlak(w(v), uit); } catch { /* geen pool */ } }
      else if (w !== undefined) vlak(w, uit);
    }
  }
  return uit.join(" ");
}
const puzzelDef = new Map();
for (const n of ["1", "2", "3", "4", "5", "6", "7"]) {
  for (const pd of AL.levels.puzzelDefs(n) || []) puzzelDef.set(pd.id, pd);
}

for (const [id, blok] of blokken) {
  const stadia = AL.strings.puzzelHints[id];
  if (!stadia) { keur(false, "geen hints geregistreerd voor " + id); continue; }
  const eerder = inhoud(stadia[0] + " " + stadia[1] + " " + zichtbaar(puzzelDef.get(id)));
  const nieuw = [...inhoud(stadia[2])].filter((w) => !eerder.has(w));
  const blokWoorden = inhoud(blok);
  const gelekt = nieuw.filter((w) => blokWoorden.has(w));
  keur(!(gelekt.length >= 3 && gelekt.length > nieuw.length / 2),
    "deel1 lekt stadium 3 van " + id + " (" + gelekt.length + "/" + nieuw.length +
    " eigen woorden van stadium 3): " + gelekt.join(", "));
}

// --- verslag ------------------------------------------------------------------
for (const f of fouten) console.log("FOUT  " + f);
console.log("\n" + gekeurd + " citaten en koppen gekeurd; " + fouten.length +
  " afwijking" + (fouten.length === 1 ? "" : "en") + ".");
process.exit(fouten.length === 0 ? 0 : 1);
