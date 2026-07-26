// test-puzzeltitels.mjs — elke puzzel draagt een titel in het pc-menu (WP 48c).
//
// Waarom dit bestaat: `js/pc/pc.js` zet in het menu `def.titel || def.id`. Tot
// WP 48c hadden alleen de editor-puzzels een titel, dus de terminalpuzzels
// stonden er met hun rauwe id in ("l6-trace", "l6-vindfout") — een interne
// sleutel in het gezicht van de speler. De titels leven nu in `strings.js` en
// deze test bewaakt dat een nieuwe puzzel er niet zonder kan.
//
// Wat er gekeurd wordt:
//   1. elke geregistreerde puzzel van de levels 0..7 heeft een niet-lege titel;
//   2. de titels van één level zijn onderling verschillend (anders staat er twee
//      keer hetzelfde in het menu);
//   3. de vorm klopt: "<onderwerp> — <wat je doet>", met per soort dezelfde
//      opdracht, zodat het menu leest als één lijst en niet als zeven;
//   4. de titel past in de menuregel (de breedste editor-titel is de maat).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { laadLogica } from "./helpers.mjs";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const AL = laadLogica();
for (const n of [0, 1, 2, 3, 4, 5, 6, 7]) {
  require(join(wortel, "js", "levels", "level" + n + ".js"));
}
const levels = AL.levels;
const LEVELS = ["0", "1", "2", "3", "4", "5", "6", "7"];

// De vaste opdracht per soort (het schema uit workflow/48c-de-diskette.md).
const OPDRACHT = {
  parsons: "leg de stroken op volgorde",
  trace: "wat drukt ze af?",
  vindfout: "vind de fout",
  verklaar: "zeg het in één zin",
  patroonkaart: "welke kaart?"
};

test("elke puzzel van elk level draagt een titel", () => {
  for (const id of LEVELS) {
    for (const def of levels.puzzelDefs(id)) {
      assert.equal(typeof def.titel, "string", def.id + " heeft geen titel");
      assert.ok(def.titel.length > 0, def.id + " heeft een lege titel");
      assert.notEqual(def.titel, def.id,
        def.id + " toont zijn eigen id in het menu");
    }
  }
});

test("binnen één level is elke titel uniek", () => {
  for (const id of LEVELS) {
    const titels = levels.puzzelDefs(id).map((d) => d.titel);
    assert.equal(new Set(titels).size, titels.length,
      "level " + id + " heeft twee gelijke menutitels: " + titels.join(" | "));
  }
});

test("elke titel heeft de vorm '<onderwerp> — <wat je doet>'", () => {
  for (const id of LEVELS) {
    for (const def of levels.puzzelDefs(id)) {
      const delen = def.titel.split(" — ");
      assert.equal(delen.length, 2,
        def.id + ": geen gedachtestreepje in '" + def.titel + "'");
      assert.ok(delen[0].length > 0 && delen[1].length > 0, def.id);
      // De terminalsoorten dragen per soort dezelfde opdracht.
      if (OPDRACHT[def.type]) {
        assert.equal(delen[1], OPDRACHT[def.type],
          def.id + ": '" + delen[1] + "' hoort '" + OPDRACHT[def.type] +
          "' te zijn voor een " + def.type + "-puzzel");
      }
    }
  }
});

test("geen titel is breder dan de menuregel aankan", () => {
  // De maat is empirisch en ruim: de langste editor-titel die er al stond, plus
  // wat lucht. Wordt een titel langer, dan botst hij in de smalle overlay met
  // het statusplaatje rechts.
  for (const id of LEVELS) {
    for (const def of levels.puzzelDefs(id)) {
      assert.ok(def.titel.length <= 46,
        def.id + ": titel van " + def.titel.length + " tekens is te lang");
    }
  }
});
