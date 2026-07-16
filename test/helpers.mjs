// helpers.mjs — kleine testhulpen: het laden van de DOM-vrije logica-modules in
// Node en een neppe storage om de save-laag te testen zonder browser.
//
// De logica-bestanden hangen aan globalThis.AL én exporteren via module.exports
// (het patroon uit remake-90s). require() laadt ze in volgorde; daarna is
// globalThis.AL compleet.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

// Laad de logica in de contractvolgorde: strings → world → levels.
export function laadLogica() {
  require(join(wortel, "js", "logic", "strings.js"));
  require(join(wortel, "js", "logic", "levels.js"));
  require(join(wortel, "js", "logic", "world.js"));
  require(join(wortel, "js", "parser.js"));
  return globalThis.AL;
}

// Laad de checker-modules in de contractvolgorde: tokenizer → asserts →
// javacsim (elke leunt op de vorige via globalThis.AL.checker). Geeft
// globalThis.AL.checker terug.
export function laadChecker() {
  require(join(wortel, "js", "logic", "checker", "tokenizer.js"));
  require(join(wortel, "js", "logic", "checker", "asserts.js"));
  require(join(wortel, "js", "logic", "checker", "javacsim.js"));
  return globalThis.AL.checker;
}

// Een neppe localStorage: een Map met getItem/setItem/removeItem. Zo kan een
// Node-test de save-laag drijven zonder browser.
export function nepStorage(initieel) {
  const kaart = new Map(initieel ? Object.entries(initieel) : []);
  return {
    getItem: (k) => (kaart.has(k) ? kaart.get(k) : null),
    setItem: (k, v) => { kaart.set(k, String(v)); },
    removeItem: (k) => { kaart.delete(k); },
    _kaart: kaart
  };
}
