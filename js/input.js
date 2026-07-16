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
      return this;
    }
  };

  function drukPijl(richting) {
    if (pijlStack.indexOf(richting) === -1) pijlStack.push(richting);
  }

  function laatPijl(richting) {
    var i = pijlStack.indexOf(richting);
    if (i !== -1) pijlStack.splice(i, 1);
  }

  function opKeydown(e) {
    // De eerste toets ontgrendelt het geluid (browsers eisen een gebruikersactie).
    if (AL.sound && AL.sound.unlock) AL.sound.unlock();

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

    // Enter: doorbladeren als er een venster staat, anders het commando versturen.
    if (k === "Enter") {
      e.preventDefault();
      if (e.repeat) return;
      if (input.blokkeer) {
        input.onAdvance();
      } else {
        var regel = input.regel;
        input.regel = "";
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
