// test-checker-corpus.mjs — de harde WP 4-gate (checker-contract.md §"De test-
// corpus"). Draait elk corpus-fragment:
//   - MODELOPLOSSING + geldige varianten: nul javac-diagnoses ÉN elke assertie
//     slaagt (vals-negatieven zijn het grootste risico);
//   - studentfouten: falen met de bedoelde melding — ofwel een javac-diagnose
//     van de juiste categorie (laag 1), ofwel de juiste assertie-meldingKey
//     (laag 2, de eerste falende assertie).

import { test } from "node:test";
import assert from "node:assert/strict";
import { laadChecker } from "./helpers.mjs";
import { fragmenten } from "./checker-corpus/index.mjs";

const C = laadChecker();
const { tokenizer, asserts, javacsim } = C;

function tok(code) { return tokenizer.tokenize(code).tokens; }

// Draai de assertie-pijplijn van een fragment; geef de eerste falende terug (of
// null als alles slaagt).
function eersteFalende(fragment, code) {
  const tokens = tok(code);
  for (const c of fragment.checks) {
    const fn = asserts[c.fn];
    assert.ok(typeof fn === "function", `onbekende assertie: ${c.fn}`);
    const r = fn(tokens, c.config);
    if (!r.ok) return r;
  }
  return null;
}

for (const fragment of fragmenten) {
  test(`corpus ${fragment.id}: modeloplossing + varianten slagen`, () => {
    for (const p of fragment.passen) {
      const dg = javacsim.diagnose(p.code, fragment.bron);
      assert.equal(dg.ok, true,
        `[${fragment.id}/${p.naam}] javac gaf onterecht ${dg.aantal} diagnose(s): ` +
        JSON.stringify(dg.diagnostics.map((d) => `${d.categorie}@${d.regel}`)));
      const fout = eersteFalende(fragment, p.code);
      assert.equal(fout, null,
        `[${fragment.id}/${p.naam}] assertie faalde onterecht: ${fout && fout.meldingKey}`);
    }
  });

  test(`corpus ${fragment.id}: studentfouten falen met de bedoelde melding`, () => {
    for (const f of fragment.falen) {
      if (f.verwacht.laag === "javac") {
        const dg = javacsim.diagnose(f.code, fragment.bron);
        assert.equal(dg.ok, false,
          `[${fragment.id}/${f.naam}] javac gaf geen enkele diagnose`);
        const cats = dg.diagnostics.map((d) => d.categorie);
        assert.ok(cats.includes(f.verwacht.categorie),
          `[${fragment.id}/${f.naam}] verwachtte javac-categorie '${f.verwacht.categorie}', kreeg ${JSON.stringify(cats)}`);
      } else {
        // laag 2: de code compileert (javac schoon), maar een assertie faalt.
        const dg = javacsim.diagnose(f.code, fragment.bron);
        assert.equal(dg.ok, true,
          `[${fragment.id}/${f.naam}] assertie-faalcase mag javac-schoon zijn, maar gaf: ` +
          JSON.stringify(dg.diagnostics.map((d) => `${d.categorie}@${d.regel}`)));
        const fout = eersteFalende(fragment, f.code);
        assert.ok(fout !== null,
          `[${fragment.id}/${f.naam}] verwachtte een falende assertie, maar alles slaagde`);
        assert.equal(fout.meldingKey, f.verwacht.meldingKey,
          `[${fragment.id}/${f.naam}] verwachtte meldingKey '${f.verwacht.meldingKey}', kreeg '${fout.meldingKey}'`);
      }
    }
  });
}

test("corpus-statistiek: elk fragment heeft model + >=3 varianten en >=4 fouten", () => {
  for (const fragment of fragmenten) {
    assert.ok(fragment.passen.length >= 4,
      `${fragment.id}: te weinig pass-cases (${fragment.passen.length}); model + >=3 varianten vereist`);
    assert.ok(fragment.falen.length >= 4,
      `${fragment.id}: te weinig faal-cases (${fragment.falen.length}); >=4 vereist`);
    assert.equal(fragment.passen[0].naam, "model", `${fragment.id}: eerste pass-case moet 'model' zijn`);
  }
  assert.equal(fragmenten.length, 8);
});
