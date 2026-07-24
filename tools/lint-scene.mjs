// lint-scene.mjs — controleert scènebestanden tegen docs/scene-schema.md.
// Zonder externe afhankelijkheden: het leest een scènebestand als tekst en
// voert het uit in een vm-context, samen met js/palette.js zodat de
// kleurcontrole tegen het echte 64-kleuren-palet loopt.
//
// Gebruik:
//   node tools/lint-scene.mjs                (alle scènes in js/scenes/)
//   node tools/lint-scene.mjs zolder-west    (één of meer scène-ids)
//
// Exitcode 1 zodra één scène zakt, met een duidelijke melding per fout.
//
// Aangepast uit remake-90s (tools/lint-scene.mjs): dezelfde structuur, maar de
// kleurgrens is nu de paletgrootte (0..63) i.p.v. EGA (0..15), de namespace is
// AL, en de gekende items zijn die van de zolder.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import vm from "node:vm";

const hier = dirname(fileURLToPath(import.meta.url));
const wortel = dirname(hier);
const scenesDir = join(wortel, "js", "scenes");
const paletPad = join(wortel, "js", "palette.js");

// Het speelveld en de gekende namen.
const X_MIN = 0, X_MAX = 319;
const Y_MIN = 8, Y_MAX = 189;
const GEKENDE_ITEMS = ["notitieboek", "pc", "broncode-doos", "doos", "stoel",
  "koffiemok"];

// Laad het palet één keer en lees de grootte, zodat de kleurgrens de bron volgt.
let MAX_KLEUR = 63;
try {
  const paletSandbox = {};
  vm.createContext(paletSandbox);
  vm.runInContext(readFileSync(paletPad, "utf8"), paletSandbox,
    { filename: paletPad });
  if (paletSandbox.AL && paletSandbox.AL.palet) {
    MAX_KLEUR = paletSandbox.AL.palet.aantal - 1;
  }
} catch (_e) { /* val terug op 63 */ }

// Elk op-type met zijn vaste lengte (aantal array-elementen).
const OP_LENGTE = {
  fill: 2, rect: 6, poly: 3, line: 3, dither: 4, ellipse: 6, px: 3,
  gradient: 8, ditherRamp: 5, shadow: 3, noise: 5
};

// ---- Hulp om een scènebestand te laden -----------------------------------

// Voer palette.js + het scènebestand uit in een verse vm-context en geef het
// AL-object terug. De scène hangt zichzelf aan AL.scenes.
function laadScene(pad) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(paletPad, "utf8"), sandbox, { filename: paletPad });
  vm.runInContext(readFileSync(pad, "utf8"), sandbox, { filename: pad });
  return sandbox.AL;
}

function padVoorId(id) {
  return join(scenesDir, "scene-" + id + ".js");
}

function idVanBestand(pad) {
  const naam = basename(pad, ".js");
  return naam.replace(/^scene-/, "");
}

// ---- Controles ------------------------------------------------------------

function isKleur(c) {
  return typeof c === "number" && Number.isInteger(c) && c >= 0 && c <= MAX_KLEUR;
}

function binnenX(x) { return typeof x === "number" && x >= X_MIN && x <= X_MAX; }
function binnenY(y) { return typeof y === "number" && y >= Y_MIN && y <= Y_MAX; }

function keurOp(op, i, fouten) {
  const waar = "picture[" + i + "]";
  if (!Array.isArray(op) || op.length === 0) {
    fouten.push(waar + ": geen geldige op");
    return;
  }
  const naam = op[0];
  if (!(naam in OP_LENGTE)) {
    fouten.push(waar + ": onbekende op '" + naam + "'");
    return;
  }
  if (op.length !== OP_LENGTE[naam]) {
    fouten.push(waar + " (" + naam + "): verwacht " + OP_LENGTE[naam] +
      " elementen, kreeg " + op.length);
    return;
  }

  if (naam === "fill") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);

  } else if (naam === "rect") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    const [, , x, y, b, h] = op;
    if (!binnenX(x) || !binnenX(x + b - 1)) fouten.push(waar + ": x buiten veld");
    if (!binnenY(y) || !binnenY(y + h - 1)) fouten.push(waar + ": y buiten veld");

  } else if (naam === "poly" || naam === "line") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    const pts = op[2];
    if (!Array.isArray(pts) || pts.length % 2 !== 0) {
      fouten.push(waar + ": puntenlijst ongeldig");
    } else {
      const aantal = pts.length / 2;
      const minimum = naam === "poly" ? 3 : 2;
      if (aantal < minimum) {
        fouten.push(waar + " (" + naam + "): minstens " + minimum + " punten");
      }
      keurPunten(pts, waar, fouten);
    }

  } else if (naam === "dither") {
    if (!isKleur(op[1]) || !isKleur(op[2])) {
      fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    }
    const pts = op[3];
    if (!Array.isArray(pts) || pts.length % 2 !== 0 || pts.length / 2 < 3) {
      fouten.push(waar + ": dither vraagt minstens 3 punten");
    } else {
      keurPunten(pts, waar, fouten);
    }

  } else if (naam === "gradient") {
    if (!isKleur(op[1]) || !isKleur(op[2])) {
      fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    }
    const [, , , x, y, b, h, richting] = op;
    if (!binnenX(x) || !binnenX(x + b - 1)) fouten.push(waar + ": x buiten veld");
    if (!binnenY(y) || !binnenY(y + h - 1)) fouten.push(waar + ": y buiten veld");
    if (richting !== "h" && richting !== "v") {
      fouten.push(waar + ": richting moet 'h' of 'v' zijn");
    }

  } else if (naam === "ditherRamp") {
    if (!isKleur(op[1]) || !isKleur(op[2])) {
      fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    }
    if (typeof op[3] !== "number" || op[3] < 0 || op[3] > 1) {
      fouten.push(waar + ": dichtheid moet tussen 0 en 1 liggen");
    }
    const pts = op[4];
    if (!Array.isArray(pts) || pts.length % 2 !== 0 || pts.length / 2 < 3) {
      fouten.push(waar + ": ditherRamp vraagt minstens 3 punten");
    } else {
      keurPunten(pts, waar, fouten);
    }

  } else if (naam === "shadow") {
    if (!Number.isInteger(op[1]) || op[1] < 1 || op[1] > 5) {
      fouten.push(waar + ": stappen moet een geheel getal 1–5 zijn");
    }
    const pts = op[2];
    if (!Array.isArray(pts) || pts.length % 2 !== 0 || pts.length / 2 < 3) {
      fouten.push(waar + ": shadow vraagt minstens 3 punten");
    } else {
      keurPunten(pts, waar, fouten);
    }

  } else if (naam === "noise") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    if (typeof op[2] !== "number" || op[2] < 0 || op[2] > 1) {
      fouten.push(waar + ": dichtheid moet tussen 0 en 1 liggen");
    }
    if (!Number.isInteger(op[3])) {
      fouten.push(waar + ": seed moet een geheel getal zijn");
    }
    const pts = op[4];
    if (!Array.isArray(pts) || pts.length % 2 !== 0 || pts.length / 2 < 3) {
      fouten.push(waar + ": noise vraagt minstens 3 punten");
    } else {
      keurPunten(pts, waar, fouten);
    }

  } else if (naam === "ellipse") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    const [, , cx, cy, rx, ry] = op;
    if (!binnenX(cx - rx) || !binnenX(cx + rx)) {
      fouten.push(waar + ": ellips buiten veld in x");
    }
    if (!binnenY(cy - ry) || !binnenY(cy + ry)) {
      fouten.push(waar + ": ellips buiten veld in y");
    }

  } else if (naam === "px") {
    if (!isKleur(op[1])) fouten.push(waar + ": kleur niet 0–" + MAX_KLEUR);
    const lijst = op[2];
    if (!Array.isArray(lijst)) {
      fouten.push(waar + ": px vraagt een lijst punten");
    } else {
      for (const p of lijst) {
        if (!Array.isArray(p) || p.length !== 2 ||
            !binnenX(p[0]) || !binnenY(p[1])) {
          fouten.push(waar + ": pixel " + JSON.stringify(p) + " buiten veld");
        }
      }
    }
  }
}

function keurPunten(pts, waar, fouten) {
  for (let k = 0; k < pts.length; k += 2) {
    if (!binnenX(pts[k]) || !binnenY(pts[k + 1])) {
      fouten.push(waar + ": punt (" + pts[k] + "," + pts[k + 1] +
        ") buiten veld");
    }
  }
}

function inWalkbox(x, y, walkboxes) {
  for (const [wx, wy, wb, wh] of walkboxes) {
    if (x >= wx && x <= wx + wb - 1 && y >= wy && y <= wy + wh - 1) return true;
  }
  return false;
}

function keurScene(scene, verwachteId) {
  const fouten = [];

  if (!scene || typeof scene !== "object") {
    return ["geen scène-object toegekend aan AL.scenes[\"" + verwachteId +
      "\"]"];
  }
  if (scene.id !== verwachteId) {
    fouten.push("id '" + scene.id + "' komt niet overeen met bestandsnaam '" +
      verwachteId + "'");
  }

  if (!Array.isArray(scene.picture)) {
    fouten.push("picture ontbreekt of is geen array");
  } else {
    scene.picture.forEach((op, i) => keurOp(op, i, fouten));
  }

  const walkboxes = scene.walkboxes;
  if (!Array.isArray(walkboxes) || walkboxes.length === 0) {
    fouten.push("walkboxes ontbreken");
  } else {
    walkboxes.forEach((w, i) => {
      if (!Array.isArray(w) || w.length !== 4) {
        fouten.push("walkbox[" + i + "]: verwacht [x,y,breedte,hoogte]");
        return;
      }
      const [x, y, b, h] = w;
      if (!binnenX(x) || !binnenX(x + b - 1) || !binnenY(y) ||
          !binnenY(y + h - 1)) {
        fouten.push("walkbox[" + i + "] valt buiten het speelveld");
      }
    });
  }

  if (!scene.entries || typeof scene.entries !== "object") {
    fouten.push("entries ontbreken");
  } else if (Array.isArray(walkboxes)) {
    for (const sleutel of Object.keys(scene.entries)) {
      const p = scene.entries[sleutel];
      if (!Array.isArray(p) || p.length !== 2) {
        fouten.push("entry '" + sleutel + "': verwacht [x,y]");
      } else if (!inWalkbox(p[0], p[1], walkboxes)) {
        fouten.push("entry '" + sleutel + "' ligt niet in een walkbox");
      }
    }
  }

  if (scene.hotspots !== undefined) {
    if (!Array.isArray(scene.hotspots)) {
      fouten.push("hotspots is geen array");
    } else {
      scene.hotspots.forEach((h, i) => {
        if (!GEKENDE_ITEMS.includes(h.item)) {
          fouten.push("hotspot[" + i + "]: onbekend item '" + h.item + "'");
        }
        if (typeof h.sprite !== "string" || h.sprite.length === 0) {
          fouten.push("hotspot[" + i + "]: sprite-naam leeg");
        }
        if (!binnenX(h.x) || !binnenY(h.y)) {
          fouten.push("hotspot[" + i + "]: anker buiten veld");
        }
      });
    }
  }

  if (scene.props !== undefined) {
    if (!Array.isArray(scene.props)) {
      fouten.push("props is geen array");
    } else {
      scene.props.forEach((p, i) => {
        if (typeof p.sprite !== "string" || p.sprite.length === 0) {
          fouten.push("prop[" + i + "]: sprite-naam leeg");
        }
        if (!binnenX(p.x) || !binnenY(p.y)) {
          fouten.push("prop[" + i + "]: anker buiten veld");
        }
      });
    }
  }

  if (scene.overlays !== undefined) {
    if (!Array.isArray(scene.overlays)) {
      fouten.push("overlays is geen array");
    } else {
      scene.overlays.forEach((o, i) => {
        if (typeof o.baselineY !== "number" || !Array.isArray(o.ops)) {
          fouten.push("overlay[" + i + "]: verwacht { baselineY, ops }");
        } else {
          o.ops.forEach((op, j) => keurOp(op, "overlay" + i + ".ops[" + j + "]",
            fouten));
        }
      });
    }
  }

  return fouten;
}

// ---- Hoofdprogramma -------------------------------------------------------

function verzamelDoelen(args) {
  if (args.length > 0) return args.map(padVoorId);
  const doelen = [];
  if (existsSync(scenesDir)) {
    for (const naam of readdirSync(scenesDir)) {
      if (/^scene-.*\.js$/.test(naam)) doelen.push(join(scenesDir, naam));
    }
  }
  return doelen;
}

const doelen = verzamelDoelen(process.argv.slice(2));
let gezakt = 0;

for (const pad of doelen) {
  if (!existsSync(pad)) {
    console.error("FOUT: bestand niet gevonden: " + pad);
    gezakt++;
    continue;
  }
  const id = idVanBestand(pad);
  let al;
  try {
    al = laadScene(pad);
  } catch (e) {
    console.error("FOUT: " + basename(pad) + " kon niet uitgevoerd worden: " +
      e.message);
    gezakt++;
    continue;
  }
  const scene = al && al.scenes ? al.scenes[id] : undefined;
  const fouten = keurScene(scene, id);
  if (fouten.length === 0) {
    console.log("OK   " + basename(pad));
  } else {
    gezakt++;
    console.error("ZAKT " + basename(pad));
    for (const f of fouten) console.error("     - " + f);
  }
}

if (gezakt > 0) {
  console.error("\n" + gezakt + " scène(s) gezakt.");
  process.exit(1);
} else {
  console.log("\nAlle scènes in orde.");
}
