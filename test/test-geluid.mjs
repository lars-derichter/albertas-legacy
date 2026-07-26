// test-geluid.mjs — de geluidslaag, headless. Er is hier geen AudioContext, en
// dat is precies de eerste eigenschap die getest hoort te worden: het spel moet
// zonder geluid gewoon draaien. Alles daarna keurt de dáta — de cue- en
// bedtabellen — want die is met de hand geschreven en een noot met een negatieve
// duur of een toonhoogte buiten het gehoor valt in een browser niet op.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const hier = dirname(fileURLToPath(import.meta.url));
const wortel = join(hier, "..");

const sound = require(join(wortel, "js", "sound.js"));

// ---- Zonder AudioContext ---------------------------------------------------

test("zonder AudioContext doet niets iets, en niets crasht", () => {
  // In Node bestaat window niet, dus zorgCtx komt nooit aan een context.
  assert.doesNotThrow(() => sound.unlock());
  assert.doesNotThrow(() => sound.speel("toets"));
  assert.doesNotThrow(() => sound.speel("bestaat-niet"));
  assert.doesNotThrow(() => sound.muziek("ambient-zolder"));
  assert.doesNotThrow(() => sound.muziek("bestaat-niet"));
  assert.doesNotThrow(() => sound.muziek(null));
  assert.doesNotThrow(() => sound.tik());
  assert.doesNotThrow(() => sound.zetAan(false));
  assert.doesNotThrow(() => sound.zetAan(true));
});

test("zonder AudioContext ontgrendelt niets, hoe vaak je het ook probeert", () => {
  // De ontgrendeling hangt aan élke gebruikersactie (toets, klik, tik, D-pad),
  // dus unlock() wordt in een echte sessie honderden keren geroepen. Zonder
  // context hoort dat niets te veranderen en niets te kosten.
  for (let i = 0; i < 5; i++) sound.unlock();
  assert.equal(sound.isOntgrendeld(), false);
  assert.equal(sound.debug().nodes, 0);
  assert.equal(sound.debug().context, false);
  assert.doesNotThrow(() => sound.speel("doos", 0.35));
});

test("zonder document komt er geen stil element en geen primer", () => {
  // De iOS-ketting van WP 43 raakt de DOM (één <audio>-element) en de
  // AudioContext. In Node is er geen van beide, en dat mag geen crash geven —
  // dezelfde zekering als hierboven, nu voor het nieuwe stuk.
  for (let i = 0; i < 5; i++) sound.unlock();
  assert.equal(sound.debug().stil, null);
  assert.equal(sound.debug().primers, 0);
});

test("een bed dat niet gestart kon worden, wordt niet als lopend gemeld", () => {
  // Zonder context kan er geen bed lopen. Zou huidigBed() hier een naam geven,
  // dan zou de engine denken dat de muziek al draait en hem nooit meer starten
  // wanneer er wél geluid is.
  sound.zetAan(true);
  sound.muziek("ambient-zolder");
  assert.equal(sound.huidigBed(), null);
  sound.muziek(null);
});

// ---- geluid uit ------------------------------------------------------------

test("geluid uit vergeet het actieve bed", () => {
  sound.zetAan(true);
  sound.muziek("titel");
  sound.zetAan(false);
  assert.equal(sound.huidigBed(), null,
    "een bed dat blijft staan met het geluid uit, zou bij aanzetten stil blijven");
  assert.equal(sound.isAan(), false);
  sound.zetAan(true);
});

test("met het geluid uit start muziek() geen bed", () => {
  sound.zetAan(false);
  sound.muziek("pc");
  assert.equal(sound.huidigBed(), null);
  sound.zetAan(true);
});

// ---- De cue-tabel ----------------------------------------------------------

function keurNoten(noten, waar) {
  assert.ok(Array.isArray(noten) && noten.length > 0, waar + ": geen noten");
  for (const [i, n] of noten.entries()) {
    const w = waar + " noot " + i;
    assert.ok(Array.isArray(n) && n.length === 3,
      w + ": verwacht [midi, start, duur]");
    const [midi, start, duur] = n;
    // Midi 21 is de laagste toets van een piano, 108 de hoogste. Daarbuiten is
    // het geen muziek meer maar gerommel of gepiep.
    assert.ok(Number.isFinite(midi) && midi >= 21 && midi <= 108,
      w + ": toonhoogte " + midi + " valt buiten midi 21–108");
    assert.ok(Number.isFinite(start) && start >= 0, w + ": start " + start);
    assert.ok(Number.isFinite(duur) && duur > 0, w + ": duur " + duur);
  }
}

test("elke eenmalige cue heeft geldige noten en een bekende stem", () => {
  const stemmen = Object.keys(sound._stemmen);
  for (const naam of Object.keys(sound._cues)) {
    const cue = sound._cues[naam];
    assert.ok(stemmen.includes(cue.stem),
      naam + ": onbekende stem '" + cue.stem + "'");
    keurNoten(cue.noten, naam);
  }
});

test("een eenmalige cue blijft kort", () => {
  // Een cue die langer duurt dan anderhalve seconde is geen cue meer maar
  // muziek, en dan hoort hij een bed te zijn.
  for (const naam of Object.keys(sound._cues)) {
    const cue = sound._cues[naam];
    const eind = Math.max(...cue.noten.map(([, s, d]) => s + d));
    assert.ok(eind <= 1.5, naam + " duurt " + eind.toFixed(2) + " s");
  }
});

// ---- Niveau en register (WP 37) --------------------------------------------

test("de meesterversterking staat binnen het hoorbare bereik", () => {
  // 0,16 was te zacht: een voetstap van honderd milliseconde piekte daarmee
  // rond -20 dBFS en verdween op een laptopspeaker. Boven 0,4 gaat de som van
  // drie bedstemmen plus foley tegen de klipgrens aan (de rekening staat in
  // sound.js bij VOLUME). Dit is dus een venster en geen streefwaarde.
  assert.ok(sound._volume >= 0.25 && sound._volume <= 0.4,
    "meesterversterking " + sound._volume + " valt buiten 0,25–0,4");
});

test("de som van alles wat tegelijk kan klinken, klipt niet", () => {
  // Het ergste geval: de drie tegelijk klinkende noten van het volste bed, plus
  // twee foley-cues erbovenop (lopen terwijl je een doos opent). Coherent
  // opgeteld — dat alle oscillatoren tegelijk op hun top staan, is bij
  // ongerelateerde frequenties hooguit een sample lang waar, dus dit is een
  // pessimistische grens en geen schatting.
  function tegelijk(bed) {
    let max = 0;
    for (const [, start] of bed.noten) {
      let som = 0;
      for (const [midi, s, d] of bed.noten) {
        if (s <= start && start < s + d) {
          som += sound._stemmen[midi < 55 ? "bas" : bed.stem].gain;
        }
      }
      if (som > max) max = som;
    }
    return max;
  }
  const zwaarsteBed = Math.max(...Object.values(sound._bedden).map(tegelijk));
  const foley = sound._stemmen.hout.gain + sound._stemmen.karton.gain;
  const piek = (zwaarsteBed + foley) * sound._volume;
  assert.ok(piek < 1.0,
    "ergste geval " + piek.toFixed(3) + " (bed " + zwaarsteBed.toFixed(2) +
    " + foley " + foley.toFixed(2) + " maal " + sound._volume + ")");
});

test("geen enkele cue ligt in de sub-bas", () => {
  // Foley op 73 Hz (de oude voetstap) is op de speaker van een laptop geen
  // zacht geluid maar géén geluid. Midi 48 is 131 Hz: de bodem van wat zo'n
  // speaker nog teruggeeft. Het karakter van deze cues zit toch niet in de
  // grondtoon maar in de niet-harmonische ratio van hun stem.
  for (const naam of Object.keys(sound._cues)) {
    for (const [midi] of sound._cues[naam].noten) {
      assert.ok(midi >= 48, naam + ": toonhoogte " + midi + " ligt onder midi 48");
    }
  }
});

test("een bed mag dieper, maar alleen als drone en nooit als melodie", () => {
  // De uitzondering op de bodem van midi 48, en de enige: een drone houdt aan
  // en wordt daardoor ook op een kleine speaker gevoeld. Twee voorwaarden, want
  // anders is het gewoon een gat in het bed — hij moet in de bas-stem vallen
  // (onder midi 55) en minstens twee seconden duren.
  for (const naam of Object.keys(sound._bedden)) {
    for (const [midi, , duur] of sound._bedden[naam].noten) {
      assert.ok(midi >= 45, naam + ": toonhoogte " + midi + " ligt onder midi 45");
      if (midi >= 48) continue;
      assert.ok(midi < 55, naam + ": " + midi + " is te diep voor de melodiestem");
      assert.ok(duur >= 2.0,
        naam + ": een noot van " + duur + " s op midi " + midi +
        " is geen drone maar een melodienoot in de kelder");
    }
  }
});

test("cues staat gelijk aan de cue-tabel", () => {
  assert.deepEqual(sound.cues.slice().sort(),
    Object.keys(sound._cues).sort());
});

// ---- De muziekbedden -------------------------------------------------------

test("elk bed heeft een lengte, een stem en geldige noten", () => {
  const stemmen = Object.keys(sound._stemmen);
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    assert.ok(Number.isFinite(bed.lengte) && bed.lengte > 1,
      naam + ": onzinnige lengte " + bed.lengte);
    assert.ok(stemmen.includes(bed.stem),
      naam + ": onbekende stem '" + bed.stem + "'");
    keurNoten(bed.noten, naam);
  }
});

test("geen noot begint na het einde van zijn omloop", () => {
  // Een noot die ná de omloop begint, wordt nooit geplaatst: de scheduler zet de
  // teller terug op nul zodra de omloop om is. Stille dode data dus.
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    for (const [i, n] of bed.noten.entries()) {
      assert.ok(n[1] < bed.lengte,
        naam + " noot " + i + " begint op " + n[1] + " maar de omloop is " +
        bed.lengte + " s");
    }
  }
});

test("een lopend bed heeft stilte aan het eind van zijn omloop", () => {
  // Anders plakt de laatste noot tegen de eerste van de volgende omloop aan en
  // hoor je de naad. Het register vraagt bovendien om stilte tussen de frasen.
  for (const naam of Object.keys(sound._bedden)) {
    const bed = sound._bedden[naam];
    if (bed.eenmalig) continue;
    const eind = Math.max(...bed.noten.map(([, s, d]) => s + d));
    assert.ok(bed.lengte - eind >= 0.2,
      naam + ": laatste noot eindigt op " + eind.toFixed(2) + " van " +
      bed.lengte + " — geen naad-stilte");
  }
});

test("de zolder is trager en leger dan de pc", () => {
  // Het register uit WP C, als test: de zolder hoort niet gezellig te klinken.
  // Notendichtheid als maat — noten per seconde.
  const zolder = sound._bedden["ambient-zolder"];
  const pc = sound._bedden.pc;
  const dichtheid = (b) => b.noten.length / b.lengte;
  assert.ok(dichtheid(zolder) < dichtheid(pc),
    "de zolder (" + dichtheid(zolder).toFixed(3) + "/s) hoort leger te zijn " +
    "dan de pc (" + dichtheid(pc).toFixed(3) + "/s)");
});

test("bedden staat gelijk aan de bedtabel", () => {
  assert.deepEqual(sound.bedden.slice().sort(),
    Object.keys(sound._bedden).sort());
});

// ---- De stemmen ------------------------------------------------------------

test("elke stem heeft een volledige FM-definitie", () => {
  const golven = ["sine", "square", "triangle", "sawtooth"];
  for (const naam of Object.keys(sound._stemmen)) {
    const s = sound._stemmen[naam];
    assert.ok(golven.includes(s.golf), naam + ": onbekende golfvorm " + s.golf);
    assert.ok(s.ratio > 0, naam + ": ratio moet positief zijn");
    assert.ok(s.index >= 0, naam + ": index mag niet negatief zijn");
    assert.ok(s.aanzet > 0, naam + ": aanzet moet positief zijn (exponentiële " +
      "envelopes mogen niet op nul beginnen)");
    assert.ok(s.verval > 0, naam + ": verval moet positief zijn");
    assert.ok(s.gain > 0 && s.gain <= 1, naam + ": gain buiten 0–1");
  }
});

// ---- De iOS-ketting, met een DOM-stub --------------------------------------
//
// Deze sectie staat bewust als laatste in dit bestand: ze zet een window- en
// document-stub in de globale ruimte, en `sound` is een singleton dat zijn
// AudioContext daarna vasthoudt. Alles wat "er is geen context" veronderstelt,
// moet dus hierboven staan.
//
// Wat hier gekeurd wordt is de vórm van de ketting — de volgorde en het aantal
// keer dat elke stap gebeurt. Of iOS er ook geluid van maakt, kan alleen een
// iPhone zeggen; dat is de luistertest bij Lars.

function stubAudioDom() {
  const log = { resumes: 0, gestart: 0, elementen: 0 };
  const ctx = {
    state: "running",
    currentTime: 0,
    destination: {},
    createGain() {
      return {
        gain: {
          value: 0,
          setValueAtTime() {},
          cancelScheduledValues() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {}
      };
    },
    createBufferSource() {
      log.gestart++;
      return { buffer: null, connect() {}, start() {} };
    },
    createBuffer(kanalen, lengte, hz) { return { kanalen, lengte, hz }; },
    resume() { log.resumes++; ctx.state = "running"; }
  };
  globalThis.window = {
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    addEventListener() {},
    AudioContext: function () { return ctx; }
  };
  return { log, ctx };
}

// Eén element voor de hele sectie: `sound` houdt het zijne vast zodra het
// bestaat, dus een tweede stub-element zou een object zijn dat de module nooit
// gebruikt — en dan keurt de test niets.
let stilEl = null;

function stubDocument() {
  if (!stilEl) {
    stilEl = {
      paused: true,
      attrs: {},
      setAttribute(k, v) { this.attrs[k] = v; },
      play() { this.paused = false; return Promise.resolve(); },
      pause() { this.paused = true; }
    };
  }
  globalThis.document = {
    hidden: false,
    addEventListener() {},
    body: { appendChild() {} },
    createElement() { return stilEl; }
  };
  return stilEl;
}

// De stub wordt ín de eerste test gezet en niet hier: alles wat op de globale
// ruimte staat, draait vóór de eerste test, en de keuringen hierboven gaan er
// juist over dat er géén context is.
let dom = null;

test("het eerste gebaar maakt de context en speelt precies één primer", () => {
  // Er is nog geen document: het element kan dus niet bestaan, en dat mag de
  // rest van de ketting niet tegenhouden.
  dom = stubAudioDom();
  sound.unlock();
  assert.equal(sound.isOntgrendeld(), true);
  assert.equal(sound.debug().context, true);
  assert.equal(sound.debug().primers, 1, "de primer hoort één keer te spelen");
  assert.equal(dom.log.gestart, 1, "één bufferbron, niet meer");
  assert.equal(sound.debug().stil, null, "zonder document geen <audio>");
});

test("een volgend gebaar op een lopende context speelt geen tweede primer", () => {
  // unlock() hangt aan élk gebaar; een buffer per toetsaanslag zou honderden
  // bronnen per sessie kosten voor niets.
  for (let i = 0; i < 5; i++) sound.unlock();
  assert.equal(sound.debug().primers, 1);
});

test("een gebaar op een opgeschorte context hervat en primeert opnieuw", () => {
  // Dit is het geval waarvoor de resume vóór de `ontgrendeld`-uitstap staat:
  // iOS schort de context op zodra de app naar de achtergrond gaat, en het
  // eerste gebaar daarna is niet meer het eerste gebaar van de sessie.
  const voor = dom.log.resumes;
  dom.ctx.state = "suspended";
  sound.unlock();
  assert.equal(dom.log.resumes, voor + 1, "de context is niet hervat");
  assert.equal(dom.log.gestart, 2, "de primer hoort ook hier te spelen");
  assert.equal(sound.debug().staat, "running");
});

test("het stille element verschijnt in het gebaar, speelt en loopt rond", () => {
  // Het element tegen de belschakelaar: een lus van stilte op volle sterkte en
  // niet gedempt, want een gedempt element claimt het mediakanaal niet.
  const el = stubDocument();
  sound.unlock();
  assert.equal(sound.debug().stil, "speelt");
  assert.equal(el.loop, true);
  assert.equal(el.muted, false);
  assert.equal(el.volume, 1);
  assert.equal(el.attrs.playsinline, "");
  assert.ok(/^data:audio\/wav;base64,/.test(el.src), "geen WAV-data-URI");
});

test("de stille WAV is een geldige RIFF-kop met alleen stilte erin", () => {
  // De data-URI wordt in de code zelf gezet (geen base64-brok in de bron), dus
  // een fout in de kop is een fout in een rekensom. Een onspeelbaar element
  // haalt de hele ringer-truc onderuit en is aan niets te horen.
  const el = stubDocument();
  sound.unlock();
  const buf = Buffer.from(el.src.split(",")[1], "base64");
  assert.equal(buf.toString("ascii", 0, 4), "RIFF");
  assert.equal(buf.readUInt32LE(4), buf.length - 8);
  assert.equal(buf.toString("ascii", 8, 12), "WAVE");
  assert.equal(buf.readUInt16LE(20), 1, "geen PCM");
  assert.equal(buf.readUInt16LE(22), 1, "geen mono");
  assert.equal(buf.readUInt16LE(34), 8, "geen 8 bits per sample");
  assert.equal(buf.toString("ascii", 36, 40), "data");
  assert.equal(buf.readUInt32LE(40), buf.length - 44);
  const waarden = new Set(buf.subarray(44));
  assert.deepEqual([...waarden], [128], "8-bits stilte is overal 128");
});

test("geluid uit pauzeert het stille element, geluid aan hervat het", () => {
  // "Geluid uit" hoort het mediakanaal terug te geven; "geluid aan" claimt het
  // opnieuw, en dat mag omdat de speler dat commando zelf net gegeven heeft.
  sound.zetAan(false);
  assert.equal(sound.debug().stil, "gepauzeerd");
  sound.zetAan(true);
  assert.equal(sound.debug().stil, "speelt");
});

test("met het geluid uit blijft een gebaar het element stil laten", () => {
  sound.zetAan(false);
  sound.unlock();
  assert.equal(sound.debug().stil, "gepauzeerd");
  sound.zetAan(true);
});

// ---- Doc en code in de pas -------------------------------------------------

test("de cue-woordenlijst in engine-architectuur.md klopt met de code", () => {
  // Dezelfde soort test als die de vier oordeelteksten aan save-en-hints.md
  // houdt: een woordenlijst in een doc die niemand naleest, drijft weg.
  const doc = readFileSync(join(wortel, "docs", "engine-architectuur.md"), "utf8");
  const regel = doc.split("\n").find((l) => l.includes("`geluid:<cue>`"));
  assert.ok(regel, "de geluid-tag staat niet in de effect-tabel");
  const genoemd = [...regel.matchAll(/`([a-z-]+(?:-\d)?)`/g)]
    .map((m) => m[1])
    .filter((n) => n !== "geluid:<cue>" && n !== "aan" && n !== "uit");
  const bekend = new Set([...sound.cues, ...sound.bedden]);
  for (const naam of genoemd) {
    if (naam.startsWith("geluid")) continue;
    assert.ok(bekend.has(naam),
      "de doc noemt cue '" + naam + "' die de code niet kent");
  }
  for (const naam of sound.cues) {
    assert.ok(regel.includes("`" + naam + "`"),
      "de code kent cue '" + naam + "' die de doc niet noemt");
  }
  for (const naam of sound.bedden) {
    assert.ok(regel.includes("`" + naam + "`"),
      "de code kent bed '" + naam + "' dat de doc niet noemt");
  }
});
