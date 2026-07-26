// check-docpaden.mjs — bewijst dat geen enkel document een bestand aanhaalt dat
// niet bestaat.
//
// Waarom dit bestaat: de docs zijn hier het contract, niet het commentaar (zie
// CLAUDE.md). Een contract dat naar `docs/scene-schema.md` verwijst terwijl dat
// bestand er niet is, is geen contract meer — en precies dát stond in de
// defectenlijst van WP 28 ("Docs ontbreken: scene-schema.md en sprite-schema.md
// worden geciteerd maar bestaan niet"). Deze lint maakt die klasse fouten
// mechanisch vindbaar in plaats van toevallig.
//
// Methode: haal uit elk .md-bestand in docs/, workflow/ en walkthrough/ plus de
// README's elk fragment dat op een pad lijkt: een naam met een gekende
// bestandsextensie. Twee soorten, met een eigen regel:
//
//   - **Met een schuine streep** (`docs/scene-schema.md`, `js/logic/world.js`)
//     is het een echt pad. Het moet bestaan vanaf de repo-wortel of vanaf de map
//     van het document zelf.
//   - **Zonder schuine streep** (`world.js`, `art-stijlgids.md`) is het
//     spreektaal: de docs noemen bestanden bij hun naam zodra de map uit de
//     context blijkt. Zo'n naam is in orde als érgens in de repo een bestand met
//     die naam staat. Zo blijft een hernoeming ("font.js" → "font-hand.js") toch
//     zichtbaar.
//
// `.png` telt niet mee: schermafdrukken leven in `test-results/`, worden per run
// gemaakt en staan niet in de repo.
//
// Twee dingen zijn bewust géén fout:
//
//   - **Sjabloonnamen** als `js/levels/levelN.js`: de N staat voor 1..7 en het
//     document bedoelt de hele reeks.
//   - **De cursusrepo.** `workflow/` is een historisch logboek, geen contract:
//     die entries halen paden aan uit de cursusrepo en paden zoals ze op het
//     moment van schrijven heetten. Ze worden wél gekeurd en gerapporteerd, maar
//     ze laten de poort niet zakken. De poort zijn `docs/`, `walkthrough/`,
//     `README.md` en `CLAUDE.md` — dát zijn de contracten.
//
// Gebruik: node tools/check-docpaden.mjs   (exit 1 bij een dood pad in een
// contractdocument)

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const wortel = dirname(hier);

// Welke extensies we als "een pad" herkennen. Bewust eindig: zonder deze lijst
// leest elke zin met een punt erin als een bestandsnaam.
const EXT = "js|mjs|md|html|css|java|json|sh|pdf|typ|txt|yml|yaml";

// Een pad: minstens één segment, dan een naam met een gekende extensie. Mag
// backticks of haakjes om zich heen hebben; die knippen we af.
const PAD_RE = new RegExp(
  "(?:[A-Za-z0-9_.~-]+/)*[A-Za-z0-9_.~-]+\\.(?:" + EXT + ")\\b", "g");

// Wat we overslaan: URL's, npm-pakketten en de losse bestandsnamen zonder map
// die als naam in een zin staan ("javac -encoding") vangen we niet, want die
// hebben geen extensie.
const SJABLONEN = ["js/levels/levelN.js", "levelN.js", "sceneN.js"];

function overslaan(p) {
  return p.startsWith("http") || p.startsWith("www.") ||
    p.includes("@") || p.startsWith("node_modules/") || SJABLONEN.includes(p);
}

function mdBestanden(map) {
  const uit = [];
  if (!existsSync(map)) return uit;
  for (const naam of readdirSync(map)) {
    const p = join(map, naam);
    if (statSync(p).isDirectory()) uit.push(...mdBestanden(p));
    else if (naam.endsWith(".md")) uit.push(p);
  }
  return uit;
}

// Alle bestandsnamen in de repo, voor de spreektaal-regel hierboven.
function alleNamen(map, uit) {
  for (const naam of readdirSync(map)) {
    if (naam === "node_modules" || naam === ".git" || naam === "test-results" ||
        naam === "out") continue;
    const p = join(map, naam);
    if (statSync(p).isDirectory()) alleNamen(p, uit);
    else uit.add(naam);
  }
  return uit;
}
const NAMEN = alleNamen(wortel, new Set());

const docs = [
  ...mdBestanden(join(wortel, "docs")),
  ...mdBestanden(join(wortel, "workflow")),
  ...mdBestanden(join(wortel, "walkthrough")),
  join(wortel, "README.md"),
  join(wortel, "CLAUDE.md"),
  join(wortel, "seven-little-goats", "README.md")
].filter((p) => existsSync(p));

// Wat de poort is, en wat alleen gerapporteerd wordt.
function isContract(pad) {
  return !pad.startsWith(join(wortel, "workflow"));
}

let dood = 0, historisch = 0, gekeurd = 0;
for (const doc of docs) {
  const tekst = readFileSync(doc, "utf8");
  const gezien = new Set();
  for (const treffer of tekst.match(PAD_RE) || []) {
    const p = treffer.replace(/[.,;:)]+$/, "");
    if (overslaan(p) || gezien.has(p)) continue;
    gezien.add(p);
    // Een pad dat op zijn eigen regel als cursusrepo-pad benoemd wordt, hoort
    // hier niet te bestaan: dat is precies wat de zin zegt.
    const eigenRegel = tekst.split("\n").find((r) => r.includes(p)) || "";
    if (/cursusrepo|programming-fundamentals/.test(eigenRegel)) continue;
    gekeurd++;
    const ok = p.includes("/")
      ? [resolve(wortel, p), resolve(dirname(doc), p)].some((k) => existsSync(k))
      : NAMEN.has(p);
    if (!ok) {
      // Eén regelnummer volstaat: de eerste plek waar het pad staat.
      const regel = tekst.split("\n").findIndex((r) => r.includes(p)) + 1;
      const poort = isContract(doc);
      console.log((poort ? "DOOD  " : "oud   ") +
        doc.replace(wortel + "/", "") + ":" + regel + "  →  " + p);
      if (poort) dood++; else historisch++;
    }
  }
}

console.log("\n" + gekeurd + " aangehaalde paden gekeurd; " + dood +
  " dood in een contractdocument, " + historisch +
  " in workflow/ (historisch, geen poort).");
process.exit(dood === 0 ? 0 : 1);
