// test-geluid-synthese.mjs — wát de geluidslaag bouwt, niet alleen dát ze niet
// crasht. Dit bestand zet een nagemaakte AudioContext neer die elke node en elke
// parameterautomatisering opschrijft, en keurt daarna de graaf.
//
// Waarom dat de moeite is: in een browser hoor je wel dát er iets klinkt, maar
// niet of het klopt. Twee oscillatoren naast elkaar klinken ook als geluid,
// terwijl FM juist vereist dat de ene de fréquentie van de andere moduleert.
// En WebAudio heeft één stille voetangel — een exponentiële ramp naar exact nul
// is verboden en gooit in sommige browsers, maar in Chromium niet: dat merk je
// dus nooit tijdens het testen, alleen bij een speler met een andere browser.
//
// Aparte file omdat test-geluid.mjs juist de wéreld zonder AudioContext keurt, en
// die twee kunnen niet in één proces: de module maakt zijn context lui aan en
// houdt hem daarna vast.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

// ---- De nagemaakte AudioContext -------------------------------------------

const log = { nodes: [], automatisering: [] };

class NepParam {
  constructor(eigenaar, naam) {
    this.eigenaar = eigenaar;
    this.naam = naam;
    this.value = 0;
    this.inkomend = [];
  }
  _noteer(soort, waarde, tijd) {
    log.automatisering.push({
      node: this.eigenaar.soort, id: this.eigenaar.id, param: this.naam,
      soort, waarde, tijd
    });
  }
  setValueAtTime(v, t) { this.value = v; this._noteer("set", v, t); }
  exponentialRampToValueAtTime(v, t) { this._noteer("exp", v, t); }
  linearRampToValueAtTime(v, t) { this._noteer("lin", v, t); }
  cancelScheduledValues(t) { this._noteer("cancel", null, t); }
}

let volgendeId = 1;

class NepNode {
  constructor(soort) {
    this.soort = soort;
    this.id = volgendeId++;
    this.uit = [];
    log.nodes.push(this);
  }
  connect(doel) { this.uit.push(doel); if (doel instanceof NepParam) doel.inkomend.push(this); }
  disconnect() { this.uit = []; }
}

class NepOscillator extends NepNode {
  constructor() {
    super("oscillator");
    this.type = "sine";
    this.frequency = new NepParam(this, "frequency");
    this.gestart = null;
    this.gestopt = null;
  }
  start(t) { this.gestart = t; }
  stop(t) { this.gestopt = t; }
}

class NepGain extends NepNode {
  constructor() {
    super("gain");
    this.gain = new NepParam(this, "gain");
  }
}

let deContext = null;

let gemaakteContexten = 0;

class NepContext {
  constructor() {
    this.currentTime = 10;      // niet nul, zodat een fout met absolute tijd opvalt
    // Opgeschort, zoals een echte browser hem geeft vóór de eerste
    // gebruikersactie. Dát is de toestand waarin het lek zat: een opgeschorte
    // context laat zijn klok stilstaan, dus alles wat je erin plant blijft in
    // de graaf hangen tot de eerste resume.
    this.state = "suspended";
    this.destination = new NepNode("destination");
    gemaakteContexten++;
    deContext = this;
  }
  createOscillator() { return new NepOscillator(); }
  createGain() { return new NepGain(); }
  resume() { this.state = "running"; }
}

globalThis.window = { AudioContext: NepContext };
const sound = require(join(wortel, "js", "sound.js"));

function leegLog() { log.nodes.length = 0; log.automatisering.length = 0; }

// ---- Vóór de ontgrendeling -------------------------------------------------
//
// Deze twee tests staan bewust vooraan: ze keuren de wereld zoals hij is vóór
// de eerste gebruikersactie, en die toestand komt in dit proces maar één keer
// voor.

test("vóór de eerste gebruikersactie bouwt niets iets", () => {
  assert.equal(sound.isOntgrendeld(), false);
  leegLog();
  for (const naam of sound.cues) sound.speel(naam);
  sound.muziek("titel");
  for (let i = 0; i < 50; i++) sound.tik();
  assert.equal(log.nodes.length, 0,
    "er zijn " + log.nodes.length + " nodes gebouwd tegen een opgeschorte " +
    "context; die blijven daar hangen tot de eerste resume");
  assert.equal(gemaakteContexten, 0,
    "er is zelfs al een AudioContext gemaakt zonder gebruikersactie");
  assert.equal(sound.huidigBed(), null,
    "een bed dat niet gestart is, mag zich niet als lopend melden");
  assert.equal(sound.debug().nodes, 0);
});

test("unlock is idempotent en start het bed van de huidige stand", () => {
  let haakGeroepen = 0;
  sound.opOntgrendeld(() => { haakGeroepen++; sound.muziek("titel"); });

  sound.unlock();
  assert.equal(sound.isOntgrendeld(), true);
  assert.equal(gemaakteContexten, 1);
  assert.equal(deContext.state, "running", "de context is niet hervat");
  assert.equal(haakGeroepen, 1);
  assert.equal(sound.huidigBed(), "titel", "de haak heeft het bed niet gestart");

  // Nog vier keer: geen tweede context, geen tweede haak, geen herstart van het
  // bed. Elke klik en elke toets van de rest van het spel komt hier langs.
  leegLog();
  for (let i = 0; i < 4; i++) sound.unlock();
  assert.equal(gemaakteContexten, 1, "er is een tweede AudioContext gemaakt");
  assert.equal(haakGeroepen, 1, "de haak is meer dan één keer geroepen");
  assert.equal(log.nodes.length, 0, "een tweede unlock plaatst noten");

  sound.opOntgrendeld(null);
  sound.muziek(null);
});

// ---- De FM-topologie -------------------------------------------------------

test("een noot bouwt twee operatoren, en de eerste moduleert de tweede", () => {
  sound.zetAan(true);
  leegLog();
  sound.speel("toets");   // één noot

  const oscs = log.nodes.filter((n) => n.soort === "oscillator");
  assert.equal(oscs.length, 2,
    "een FM-stem heeft precies twee operatoren: een modulator en een carrier");

  // De modulator moet via een gain op de frequentie van de carrier uitkomen.
  // Dát is FM. Zonder die verbinding zijn het gewoon twee tonen naast elkaar.
  const naarFrequentie = log.nodes.filter((n) =>
    n.uit.some((d) => d instanceof NepParam && d.naam === "frequency"));
  assert.equal(naarFrequentie.length, 1,
    "er hoort precies één node op een frequency-param uit te komen");
  assert.equal(naarFrequentie[0].soort, "gain",
    "de modulatiediepte hoort een gain te zijn, niet de oscillator zelf");

  const diepte = naarFrequentie[0];
  const modulator = log.nodes.find((n) => n.uit.includes(diepte));
  assert.ok(modulator, "de diepte-gain heeft geen bron");
  assert.equal(modulator.soort, "oscillator", "de bron hoort een oscillator te zijn");
  assert.notEqual(modulator, oscs.find((o) =>
    o.uit.some((d) => d.soort === "gain" && d !== diepte)),
  "modulator en carrier mogen niet dezelfde node zijn");
});

test("de modulatiefrequentie volgt de ratio van de stem", () => {
  leegLog();
  // midi 93 = A6 = 1760 Hz; de blip-stem heeft ratio 3.
  sound.speel("toets");
  const oscs = log.nodes.filter((n) => n.soort === "oscillator");
  const frequenties = oscs.map((o) => o.frequency.value).sort((a, b) => a - b);
  const verhouding = frequenties[1] / frequenties[0];
  assert.ok(Math.abs(verhouding - sound._stemmen.blip.ratio) < 1e-6,
    "verhouding " + verhouding + " hoort " + sound._stemmen.blip.ratio + " te zijn");
});

// ---- De voetangel ----------------------------------------------------------

test("geen enkele exponentiële ramp gaat naar exact nul", () => {
  // Een exponentiële ramp naar 0 is per specificatie ongeldig. Chromium slikt
  // het; andere engines gooien. Dit is dus precies het soort fout dat je in een
  // headless Chromium-test nooit ziet.
  leegLog();
  sound.muziek(null);
  for (const naam of sound.cues) sound.speel(naam);
  sound.muziek("ambient-zolder");
  sound.tik();
  const fout = log.automatisering.filter((a) => a.soort === "exp" && a.waarde === 0);
  assert.deepEqual(fout, [], "exponentiële ramps naar nul: " + JSON.stringify(fout));
});

test("elke noot begint in de toekomst, niet op de audioklok van nu", () => {
  // Een oscillator die op currentTime start, mist zijn eigen envelope-begin.
  leegLog();
  sound.speel("boot");
  const oscs = log.nodes.filter((n) => n.soort === "oscillator");
  assert.ok(oscs.length > 0);
  for (const o of oscs) {
    assert.ok(o.gestart > 10, "start op " + o.gestart + ", currentTime is 10");
    assert.ok(o.gestopt > o.gestart, "stopt niet ná zijn start");
  }
});

test("elke oscillator wordt ook gestopt", () => {
  // Een oscillator zonder stop() blijft in de graaf hangen. Bij een bed dat
  // negentien seconden per omloop draait, is dat een lek dat pas na een half uur
  // spelen hoorbaar wordt.
  leegLog();
  sound.speel("doos");
  for (const o of log.nodes.filter((n) => n.soort === "oscillator")) {
    assert.ok(o.gestopt !== null, "oscillator " + o.id + " wordt nooit gestopt");
  }
});

// ---- Bedden en de scheduler -----------------------------------------------

test("een bed plaatst zijn eerste noten en meldt zich als lopend", () => {
  sound.muziek(null);
  leegLog();
  sound.muziek("titel");
  assert.equal(sound.huidigBed(), "titel");
  assert.ok(log.nodes.filter((n) => n.soort === "oscillator").length > 0,
    "er is geen enkele noot geplaatst");
  assert.ok(sound.debug().geplaatst > 0);
});

test("hetzelfde bed opnieuw starten plaatst niets nieuws", () => {
  sound.muziek("titel");
  leegLog();
  sound.muziek("titel");
  assert.equal(log.nodes.length, 0,
    "een kamerwissel mag de lopende loop niet herstarten");
});

test("de lage noten van een bed gaan naar de bas-stem", () => {
  // De data schrijft alleen toonhoogtes op; welke stem een noot krijgt, beslist
  // de scheduler op de toonhoogte. Zonder die splitsing zou de drone dezelfde
  // klank hebben als de melodie erboven.
  sound.muziek(null);
  leegLog();
  sound.muziek("ambient-zolder");
  const oscs = log.nodes.filter((n) => n.soort === "oscillator");
  const laagste = Math.min(...oscs.map((o) => o.frequency.value));
  // De laagste noot van het bed staat op midi 45 (110 Hz). De bas-stem heeft
  // ratio 0,5, dus haar modulator zit op de helft daarvan; de koude stem van
  // het bed heeft ratio 2 en zou er het dubbele van maken. Die 55 Hz kan dus
  // alleen uit de bas-stem komen.
  const laagsteMidi = Math.min(...sound._bedden["ambient-zolder"].noten
    .map(([m]) => m));
  const grondtoon = 440 * Math.pow(2, (laagsteMidi - 69) / 12);
  assert.ok(Math.abs(laagste - grondtoon * sound._stemmen.bas.ratio) < 0.5,
    "laagste modulatorfrequentie is " + laagste.toFixed(1) + " Hz; de bas-stem " +
    "hoort er " + (grondtoon * sound._stemmen.bas.ratio).toFixed(1) +
    " van te maken");
});

test("geluid uit zet de meestergain naar nul en vergeet het bed", () => {
  sound.muziek("pc");
  leegLog();
  sound.zetAan(false);
  const nul = log.automatisering.filter((a) =>
    a.param === "gain" && a.soort === "set" && a.waarde === 0);
  assert.ok(nul.length > 0, "de meestergain is niet op nul gezet");
  assert.equal(sound.huidigBed(), null);
  sound.zetAan(true);
});

test("met het geluid uit plaatst tik() geen noten", () => {
  sound.muziek("ambient-zolder");
  sound.zetAan(false);
  leegLog();
  for (let i = 0; i < 20; i++) sound.tik();
  assert.equal(log.nodes.length, 0, "er wordt gepland terwijl het geluid uit is");
  sound.zetAan(true);
});

test("een eenmalig bed houdt op en herhaalt niet", () => {
  sound.muziek(null);
  sound.muziek("einde");
  assert.equal(sound.huidigBed(), "einde");
  assert.ok(sound._bedden.einde.eenmalig, "het eindbed hoort eenmalig te zijn");

  // Schuif de nagemaakte klok voorbij het einde van de omloop en tik. Een
  // lopend bed zou hier opnieuw beginnen; een eenmalig bed hoort te vervallen.
  //
  // Dat er ook níets meer geplaatst wordt, is een tweede eigenschap: de noten
  // van dit bed liggen nu allemaal in het verleden, en een gemiste noot wordt
  // overgeslagen in plaats van ingehaald. Zonder die regel plaatste deze ene tik
  // het hele eindbed in één klap.
  deContext.currentTime += sound._bedden.einde.lengte + 1;
  leegLog();
  sound.tik();
  assert.equal(sound.huidigBed(), null, "het eindbed is niet vervallen");
  assert.equal(log.nodes.length, 0, "er is opnieuw geplaatst");
});

test("een lopend bed begint na zijn omloop wél opnieuw", () => {
  sound.muziek(null);
  sound.muziek("ambient-zolder");
  const lengte = sound._bedden["ambient-zolder"].lengte;
  // Tik de hele omloop door in stappen die kleiner zijn dan het
  // vooruitkijkvenster, zoals de engine dat ook doet.
  let geplaatst = 0;
  for (let i = 0; i < 200; i++) {
    deContext.currentTime += 0.2;
    leegLog();
    sound.tik();
    geplaatst += log.nodes.filter((n) => n.soort === "oscillator").length;
    if (deContext.currentTime > 10 + lengte * 1.5) break;
  }
  assert.equal(sound.huidigBed(), "ambient-zolder", "het bed is gestopt");
  assert.ok(geplaatst >= sound._bedden["ambient-zolder"].noten.length,
    "na anderhalve omloop zijn er " + geplaatst + " oscillatoren geplaatst; " +
    "dat is minder dan één volledige omloop aan noten");
  sound.muziek(null);
});
