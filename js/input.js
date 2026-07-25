// input.js — de toetsenbordlaag. Vangt alle toetsen af, houdt bij welke
// pijltjes ingedrukt zijn (voor het lopen over de zolder) en bouwt de getypte
// commandoregel op. De engine leest deze toestand uit; input beslist zelf niets
// over het spel.
//
// Twee leesmodi, gestuurd door de engine via input.blokkeer:
//  - blokkeer = false: gewoon typen. Drukbare tekens komen bij de regel,
//    Backspace wist, Enter verstuurt (onSubmit).
//  - blokkeer = true: een venster of kaart staat open. Enter en spatie sturen
//    onAdvance (doorbladeren / wegklikken); al de rest wordt geslikt.
//
// Pijltjes worden altijd bijgehouden, ook tijdens het typen: lopen en typen
// mag tegelijk (King's-Quest-stijl).
//
// Aangepast uit remake-90s (js/input.js): ongewijzigd op de namespace na
// (RRH → AL) en de Escape-toets, die de pc-overlay sluit (onEscape).
//
// Geen ES-module: alles hangt aan het globale AL-object.

globalThis.AL = globalThis.AL || {};

(function () {

  // De vier pijltjes naar een windrichting.
  var PIJL = {
    ArrowUp: "noord",
    ArrowRight: "oost",
    ArrowDown: "zuid",
    ArrowLeft: "west"
  };

  // De volgorde waarin pijltjes ingedrukt zijn; het laatst ingedrukte wint
  // (most-recent-pressed priority). Loslaten haalt het pijltje weg, waarna het
  // vorige weer geldt.
  var pijlStack = [];

  // Hoogstens zo veel tekens op één commandoregel (past in de invoerbalk).
  var MAX_REGEL = 32;

  var input = {

    // De huidige getypte regel (leest de engine voor de invoerbalk).
    regel: "",

    // Staat er een venster of kaart open? De engine zet dit elk frame.
    blokkeer: false,

    // Het laatst verstuurde commando, terug te halen met F3.
    laatsteCommando: "",

    // Haken die de engine invult.
    onSubmit: function () {},
    onAdvance: function () {},
    onEscape: function () {},

    // De richting waarin de speler nu wil lopen, of null.
    pijlRichting: function () {
      return pijlStack.length > 0 ? pijlStack[pijlStack.length - 1] : null;
    },

    // Koppel de luisteraars aan het venster. Eén keer aanroepen bij het starten.
    init: function () {
      window.addEventListener("keydown", opKeydown);
      window.addEventListener("keyup", opKeyup);
      // De audio-ontgrendeling hing vroeger alleen aan het toetsenbord. Wie met
      // een muis op het canvas klikte of het spel op een telefoon speelde, gaf
      // dus nooit de gebruikersactie die de browser eist, en hoorde het hele
      // spel lang niets. `pointerdown` vangt muis, aanraking en pen in één
      // gebeurtenis, in de capture-fase zodat het ook telt als iets anders het
      // event daarna tegenhoudt. touch.js ontgrendelt daarnaast expliciet bij
      // zijn eigen knoppen — zie daar waarom dat geen dubbelop is.
      window.addEventListener("pointerdown", ontgrendelGeluid, true);
      window.addEventListener("touchstart", ontgrendelGeluid, true);
      return this;
    },

    // Publieke haken voor niet-toetsenbord-invoer (het aanraakscherm-D-pad uit
    // touch.js): dezelfde pijl-stack, dezelfde most-recent-pressed-regel.
    pijlAan: function (richting) { drukPijl(richting); },
    pijlUit: function (richting) { laatPijl(richting); }
  };

  // Eén plek die het geluid ontgrendelt; AL.sound.unlock is zelf idempotent.
  function ontgrendelGeluid() {
    if (AL.sound && AL.sound.unlock) AL.sound.unlock();
  }

  function drukPijl(richting) {
    if (pijlStack.indexOf(richting) === -1) pijlStack.push(richting);
  }

  function laatPijl(richting) {
    var i = pijlStack.indexOf(richting);
    if (i !== -1) pijlStack.splice(i, 1);
  }

  function opKeydown(e) {
    // De eerste toets ontgrendelt het geluid (browsers eisen een
    // gebruikersactie). Bewust vóór de tekstveld-uitzondering hieronder: een
    // speler op een telefoon typt zijn eerste teken ín het invoerveld van
    // touch.js, en dat is net zo goed zijn eerste gebruikersactie.
    ontgrendelGeluid();

    // De pc-overlay bezit zijn eigen tekstinvoer (de editor-textarea en de
    // terminal-input). Laat toetsen in een tekstveld volledig met rust, zodat
    // typen, selecteren, plakken en de eigen sneltoetsen (F9, Esc) daar werken
    // (engine-architectuur.md, §"De gesimuleerde pc"). De zolder gebruikt geen
    // echte invoervelden, dus dit raakt het lopen/typen op de zolder niet.
    var doel = e.target;
    if (doel && (doel.tagName === "TEXTAREA" || doel.tagName === "INPUT" ||
        doel.isContentEditable)) {
      return;
    }

    var k = e.key;

    // Escape: de engine sluit een open pc-overlay (of negeert het).
    if (k === "Escape") {
      e.preventDefault();
      input.onEscape();
      return;
    }

    // Pijltjes: altijd bijhouden, ook tijdens het typen.
    if (PIJL[k]) {
      e.preventDefault();
      if (!e.repeat) drukPijl(PIJL[k]);
      return;
    }

    // F3: het vorige commando terughalen in de invoerregel.
    //
    // De pijltjestoetsen zijn hier bezet door het lopen, dus de gewone
    // shell-conventie (pijl omhoog) kan niet. F3 is bovendien precies wat de
    // Sierra-parsers van toen gebruikten om het laatste commando te herhalen,
    // dus dit is niet alleen de vrije toets maar ook de juiste.
    if (k === "F3") {
      e.preventDefault();
      if (!input.blokkeer && input.laatsteCommando) {
        input.regel = input.laatsteCommando.slice(0, MAX_REGEL);
      }
      return;
    }

    // Enter: doorbladeren als er een venster staat, anders het commando versturen.
    if (k === "Enter") {
      e.preventDefault();
      if (e.repeat) return;
      if (input.blokkeer) {
        input.onAdvance();
      } else {
        var regel = input.regel;
        input.regel = "";
        if (regel.trim() !== "") input.laatsteCommando = regel;
        input.onSubmit(regel);
      }
      return;
    }

    // Spatie: in venstermodus wegklikken, anders een spatie in de regel.
    if (k === " " || k === "Spacebar") {
      e.preventDefault();
      if (input.blokkeer) {
        if (!e.repeat) input.onAdvance();
      } else if (input.regel.length < MAX_REGEL) {
        input.regel += " ";
      }
      return;
    }

    // Backspace: wist het laatste teken (niet in venstermodus).
    if (k === "Backspace") {
      e.preventDefault();
      if (!input.blokkeer) input.regel = input.regel.slice(0, -1);
      return;
    }

    // Een gewoon drukbaar teken (één karakter): bij de regel plakken.
    if (k.length === 1) {
      e.preventDefault();
      if (!input.blokkeer && input.regel.length < MAX_REGEL) {
        input.regel += k;
      }
      return;
    }
  }

  function opKeyup(e) {
    var k = e.key;
    if (PIJL[k]) {
      e.preventDefault();
      laatPijl(PIJL[k]);
    }
  }

  AL.input = input;

})();
