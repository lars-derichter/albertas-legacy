// test-input.mjs — de pijl-stack van js/input.js, headless (WP 42). Dit is de
// laag waar Lars' iOS-klacht zat: "als je de pijltjes ingedrukt houdt, blijft
// het personage die kant op lopen, ook nadat je een andere pijl indrukt".
//
// De arbitrage zelf (laatst ingedrukt wint) was niet fout. Fout was wat er
// gebeurt als een keyup nooit aankomt — het venster verliest de focus, de app
// gaat op een telefoon naar de achtergrond, of een vinger schuift van de ene
// D-pad-knop naar de andere. Dan blijft er een spookrichting in de stack staan
// die elke andere pijl overleeft. Precies die drie eigenschappen worden hier
// vastgezet: her-indruk wint, loslaten haalt ook middenuit weg, en reset()
// vergeet alles.
//
// `js/input.js` raakt de DOM alleen ín init() aan (addEventListener), dus de
// module laadt gewoon in Node. Voor init() staan hier een window- en
// document-stub, waarmee ook de spookzekering zelf (blur, visibilitychange)
// meetbaar wordt in plaats van alleen met een browser.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");

const input = require(join(wortel, "js", "input.js"));

// Elke test begint met een lege stack; de module is een singleton.
function vers() {
  input.reset();
  return input;
}

// ---- De arbitrage ----------------------------------------------------------

test("zonder ingedrukte pijl is er geen richting", () => {
  vers();
  assert.equal(input.pijlRichting(), null);
});

test("het laatst ingedrukte pijltje wint", () => {
  vers();
  input.pijlAan("west");
  assert.equal(input.pijlRichting(), "west");
  input.pijlAan("oost");
  assert.equal(input.pijlRichting(), "oost");
});

test("loslaten valt terug op het pijltje eronder", () => {
  vers();
  input.pijlAan("west");
  input.pijlAan("oost");
  input.pijlUit("oost");
  assert.equal(input.pijlRichting(), "west");
});

test("loslaten haalt ook een pijltje middenuit de stack weg", () => {
  // Drie vingers of drie toetsen: west, oost, noord. Wie de middelste
  // loslaat, hoort noord te houden — en daarna west, niet oost.
  vers();
  input.pijlAan("west");
  input.pijlAan("oost");
  input.pijlAan("noord");
  input.pijlUit("oost");
  assert.equal(input.pijlRichting(), "noord");
  input.pijlUit("noord");
  assert.equal(input.pijlRichting(), "west");
});

test("een pijltje loslaten dat niet ingedrukt is, verandert niets", () => {
  vers();
  input.pijlAan("zuid");
  input.pijlUit("noord");
  assert.equal(input.pijlRichting(), "zuid");
});

// ---- De her-indruk ---------------------------------------------------------

test("opnieuw indrukken verplaatst een richting naar de top", () => {
  // Dit is de regel die de speler van zijn eigen spook laat winnen: stond
  // "west" nog achterstallig in de stack, dan hoort west opnieuw drukken hem
  // vooraan te zetten in plaats van genegeerd te worden.
  vers();
  input.pijlAan("west");
  input.pijlAan("oost");
  input.pijlAan("west");
  assert.equal(input.pijlRichting(), "west");
  // En de dubbele ingang bestaat niet: één keer loslaten is genoeg.
  input.pijlUit("west");
  assert.equal(input.pijlRichting(), "oost");
});

// ---- De spookzekering ------------------------------------------------------

test("reset() vergeet elke ingedrukte richting", () => {
  vers();
  input.pijlAan("noord");
  input.pijlAan("west");
  input.reset();
  assert.equal(input.pijlRichting(), null);
  // En na de reset werkt de stack gewoon weer.
  input.pijlAan("zuid");
  assert.equal(input.pijlRichting(), "zuid");
});

test("reset() op een lege stack is onschadelijk", () => {
  vers();
  assert.doesNotThrow(() => { input.reset(); input.reset(); });
  assert.equal(input.pijlRichting(), null);
});

// ---- init(): de toetsen en de zekering, met een DOM-stub -------------------

// Een minimale window/document-stub die de luisteraars onthoudt, zodat we ze
// hier kunnen afvuren. init() raakt niets anders aan.
function stubDom() {
  const luisteraars = { window: {}, document: {} };
  const vorigeWindow = globalThis.window;
  const vorigeDocument = globalThis.document;
  globalThis.window = {
    addEventListener: (naam, fn) => { luisteraars.window[naam] = fn; }
  };
  globalThis.document = {
    hidden: false,
    addEventListener: (naam, fn) => { luisteraars.document[naam] = fn; }
  };
  input.init();
  return {
    luisteraars,
    herstel() {
      globalThis.window = vorigeWindow;
      globalThis.document = vorigeDocument;
    }
  };
}

// Een toetsevent zoals de browser het aflevert, met een preventDefault die
// alleen maar geteld hoeft te worden.
function toets(key, extra) {
  return Object.assign({ key, preventDefault() {}, repeat: false }, extra || {});
}

test("init koppelt keydown, keyup, blur en visibilitychange", () => {
  const dom = stubDom();
  try {
    assert.equal(typeof dom.luisteraars.window.keydown, "function");
    assert.equal(typeof dom.luisteraars.window.keyup, "function");
    assert.equal(typeof dom.luisteraars.window.blur, "function",
      "zonder blur-luisteraar overleeft een spookrichting het focusverlies");
    assert.equal(typeof dom.luisteraars.document.visibilitychange, "function");
  } finally {
    dom.herstel();
  }
});

test("init koppelt de audio-ontgrendeling aan zes oppervlakken", () => {
  // WP 43: de set stond op pointerdown/touchstart/keydown, en dat is precies
  // de helft die iOS voor audio níét meerekent — Safari kijkt naar het einde
  // van de aanraking (touchend, pointerup, click). Een iPhone-speler tikte dus
  // wel en hoorde niets. Elk van de zes moet bij AL.sound.unlock uitkomen.
  const dom = stubDom();
  const vorigeSound = globalThis.AL.sound;
  let geteld = 0;
  globalThis.AL.sound = { unlock: () => { geteld++; } };
  try {
    const oppervlakken = ["pointerdown", "pointerup", "touchstart", "touchend",
      "click"];
    for (const naam of oppervlakken) {
      assert.equal(typeof dom.luisteraars.window[naam], "function",
        "geen unlock-luisteraar op " + naam);
    }
    for (const naam of oppervlakken) dom.luisteraars.window[naam]({});
    assert.equal(geteld, oppervlakken.length);
    // En de toets, het zesde oppervlak: die zit in de keydown-handler zelf,
    // vóór de tekstveld-uitzondering.
    dom.luisteraars.window.keydown(toets("a", { target: { tagName: "INPUT" } }));
    assert.equal(geteld, oppervlakken.length + 1,
      "het eerste teken in de commandobalk hoort ook te ontgrendelen");
  } finally {
    globalThis.AL.sound = vorigeSound;
    dom.herstel();
  }
});

test("keydown en keyup sturen dezelfde stack als het D-pad", () => {
  const dom = stubDom();
  try {
    vers();
    dom.luisteraars.window.keydown(toets("ArrowLeft"));
    assert.equal(input.pijlRichting(), "west");
    dom.luisteraars.window.keydown(toets("ArrowRight"));
    assert.equal(input.pijlRichting(), "oost");
    dom.luisteraars.window.keyup(toets("ArrowRight"));
    assert.equal(input.pijlRichting(), "west");
    dom.luisteraars.window.keyup(toets("ArrowLeft"));
    assert.equal(input.pijlRichting(), null);
  } finally {
    dom.herstel();
  }
});

test("een verloren keyup laat een spook achter dat blur opruimt", () => {
  // De hele klacht in vier regels: west ingedrukt, de keyup gaat verloren
  // (het venster verliest de focus), en zonder zekering blijft west lopen.
  const dom = stubDom();
  try {
    vers();
    dom.luisteraars.window.keydown(toets("ArrowLeft"));
    dom.luisteraars.window.blur();
    assert.equal(input.pijlRichting(), null);
    // En de late keyup die daarna alsnog binnenkomt, doet niets raars.
    dom.luisteraars.window.keyup(toets("ArrowLeft"));
    assert.equal(input.pijlRichting(), null);
  } finally {
    dom.herstel();
  }
});

test("visibilitychange ruimt alleen op wanneer de pagina verborgen raakt", () => {
  const dom = stubDom();
  try {
    vers();
    input.pijlAan("noord");
    globalThis.document.hidden = false;
    dom.luisteraars.document.visibilitychange();
    assert.equal(input.pijlRichting(), "noord",
      "terugkomen op een zichtbare pagina mag het lopen niet afbreken");
    globalThis.document.hidden = true;
    dom.luisteraars.document.visibilitychange();
    assert.equal(input.pijlRichting(), null);
  } finally {
    dom.herstel();
  }
});

test("een pijltje in een tekstveld loopt niet, maar de keyup telt wel", () => {
  // De pc-overlay heeft echte tekstvelden; daar horen de pijltjes de cursor te
  // verzetten en niet de speler. De keyup kent die uitzondering bewust niet:
  // hij mag nooit een richting laten staan die hij zou moeten opruimen.
  const dom = stubDom();
  try {
    vers();
    const inTextarea = { tagName: "TEXTAREA" };
    dom.luisteraars.window.keydown(toets("ArrowLeft", { target: inTextarea }));
    assert.equal(input.pijlRichting(), null);

    dom.luisteraars.window.keydown(toets("ArrowLeft"));
    assert.equal(input.pijlRichting(), "west");
    dom.luisteraars.window.keyup(toets("ArrowLeft", { target: inTextarea }));
    assert.equal(input.pijlRichting(), null,
      "een keyup boven een tekstveld moet de richting alsnog loslaten");
  } finally {
    dom.herstel();
  }
});

test("een autorepeat-keydown verandert de volgorde niet", () => {
  // Een ingedrukt gehouden toets vuurt tientallen keydowns met repeat=true.
  // Die mogen de arbitrage niet omgooien: wie daarna een ándere pijl indrukt,
  // hoort die te krijgen.
  const dom = stubDom();
  try {
    vers();
    dom.luisteraars.window.keydown(toets("ArrowLeft"));
    dom.luisteraars.window.keydown(toets("ArrowRight"));
    for (let i = 0; i < 5; i++) {
      dom.luisteraars.window.keydown(toets("ArrowLeft", { repeat: true }));
    }
    assert.equal(input.pijlRichting(), "oost");
  } finally {
    dom.herstel();
  }
});
