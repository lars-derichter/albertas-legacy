// touch.js — het aanraakscherm-D-pad en de mobiele commandobalk. Op een
// toestel zonder fysiek toetsenbord (telefoon, tablet) verschijnt er anders
// nooit een toetsenbord boven het canvas: er is geen focusbaar tekstveld om
// op te tikken, dus geen manier om "ga zitten" of "kijk" te typen, en geen
// pijltjestoetsen om te lopen. Deze module voegt beide toe: vier
// richtingsknoppen die dezelfde pijl-stack sturen als input.js, en een echt
// <input>-veld dat bij een tik het systeemtoetsenbord opent (zoals elk ander
// tekstveld op het web) en de getypte tekst doorstuurt naar dezelfde
// onSubmit/onAdvance-haken als een fysiek toetsenbord.
//
// Enkel aangemaakt op een aanraakscherm (feature-detectie): op een toestel
// met muis en toetsenbord verandert er niets. De balk toont zich bovendien
// alleen in de zoldermodus — de pc heeft al een echte editor/terminal
// (js/pc/editor.js, terminal.js, WP 5), die al gewoon het toetsenbord opent
// bij een tik. De overige schermen (titel, spread, oordeel, epiloog) lees je
// door het canvas zelf aan te tikken (tik-om-door-te-bladeren hieronder).
//
// Raakt de DOM aan, zoals engine.js en js/pc/*.js; blijft daarom buiten
// js/logic/ en is niet Node-testbaar (wel gedekt door een Playwright-
// aanraakschermtest). Laadt als allerlaatste (na engine.js): het leunt op
// AL.input, AL.engine.advance en AL.debugState, die daar gedefinieerd worden.

globalThis.AL = globalThis.AL || {};

(function () {

  var AANRAAKSCHERM = ("ontouchstart" in window) ||
    (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0);

  if (!AANRAAKSCHERM) return;

  // Het geluid ontgrendelen bij élke knop van deze balk. input.js doet dat al
  // via een pointerdown op het venster, en dus is dit strikt genomen dubbelop —
  // maar niet overbodig: de handlers hieronder roepen `preventDefault` aan en
  // een toestel dat geen `pointerdown` kent (oudere iOS-webviews) valt anders
  // op niets terug. Een ontgrendeling die twee keer gebeurt kost niets:
  // AL.sound.unlock doet de tweede keer niets meer.
  function ontgrendelGeluid() {
    var s = globalThis.AL.sound;
    if (s && s.unlock) s.unlock();
  }

  function start() {
    var canvas = document.getElementById("scherm");
    if (!canvas) return;

    // Tik-om-door-te-bladeren: berichtvenster, titelkaart, spread, oordeel.
    // In de vrije zoldermodus doet advance() niets (zie engine.js), dus dit
    // is ook voor muisgebruikers een onschadelijke extra.
    canvas.addEventListener("click", function () {
      ontgrendelGeluid();
      if (globalThis.AL.engine && globalThis.AL.engine.advance) {
        globalThis.AL.engine.advance();
      }
    });

    var wrapper = bouwUi();
    document.body.appendChild(wrapper);

    var vorigZichtbaar = false;
    setInterval(function () {
      var d = globalThis.AL.debugState;
      var zichtbaar = !!(d && !d.titelActief && d.modus === "zolder");
      // De balk kan onder de vinger vandaan verdwijnen (de speler gaat aan de
      // pc zitten terwijl hij nog op ◀ drukt). Een knop die er niet meer is
      // krijgt geen pointerup, dus zou die richting blijven staan. Alles
      // loslaten op het moment dat de balk weggaat — de engine doet dit bij een
      // moduswissel ook al, en twee keer loslaten kost niets.
      if (vorigZichtbaar && !zichtbaar && globalThis.AL.input &&
          globalThis.AL.input.reset) {
        globalThis.AL.input.reset();
      }
      vorigZichtbaar = zichtbaar;
      wrapper.style.display = zichtbaar ? "flex" : "none";
    }, 200);
  }

  function bouwUi() {
    var s = globalThis.AL.strings.touch;

    var wrapper = document.createElement("div");
    wrapper.className = "touch-ui";

    var binnen = document.createElement("div");
    binnen.className = "touch-ui-binnen";

    var dpad = document.createElement("div");
    dpad.className = "touch-dpad";
    dpad.appendChild(pijlKnop("noord", "▲", s.pijlNoord, "touch-dpad-n"));
    dpad.appendChild(pijlKnop("west", "◀", s.pijlWest, "touch-dpad-w"));
    dpad.appendChild(pijlKnop("oost", "▶", s.pijlOost, "touch-dpad-o"));
    dpad.appendChild(pijlKnop("zuid", "▼", s.pijlZuid, "touch-dpad-z"));

    var form = document.createElement("form");
    form.className = "touch-commando";

    var invoer = document.createElement("input");
    invoer.type = "text";
    invoer.className = "touch-invoer";
    invoer.setAttribute("autocomplete", "off");
    invoer.setAttribute("autocapitalize", "none");
    invoer.setAttribute("autocorrect", "off");
    invoer.setAttribute("spellcheck", "false");
    invoer.setAttribute("maxlength", "32");
    invoer.setAttribute("placeholder", s.plaatshouder);
    invoer.addEventListener("input", function () {
      var input = globalThis.AL.input;
      if (input && !input.blokkeer) input.regel = invoer.value;
    });

    var knop = document.createElement("button");
    knop.type = "submit";
    knop.className = "touch-knop";
    knop.textContent = s.verstuur;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ontgrendelGeluid();
      verstuur(invoer);
    });

    form.appendChild(invoer);
    form.appendChild(knop);

    binnen.appendChild(dpad);
    binnen.appendChild(form);
    wrapper.appendChild(binnen);
    return wrapper;
  }

  function verstuur(invoer) {
    var waarde = invoer.value;
    invoer.value = "";
    var input = globalThis.AL.input;
    if (!input) return;
    input.regel = "";
    if (input.blokkeer) input.onAdvance();
    else input.onSubmit(waarde);
  }

  function pijlKnop(richting, glyph, label, klasse) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "touch-dpad-knop " + klasse;
    b.textContent = glyph;
    b.setAttribute("aria-label", label);

    var aan = function (e) {
      e.preventDefault();
      // Een aanraking krijgt impliciete pointer capture: vanaf de pointerdown
      // gaat élk verder event van die vinger naar déze knop, ook als de vinger
      // allang boven ▶ hangt. Er komt dan geen pointerleave hier en geen
      // pointerenter daar, en de oude richting blijft lopen — precies wat Lars
      // op iOS zag toen hij van de ene richting naar de andere schoof. De
      // capture loslaten geeft de knoppen hun gewone enter/leave terug. Niet
      // elke motor staat dat toe (en bij een synthetisch event bestaat de
      // pointer niet), vandaar de try.
      if (e.pointerId !== undefined && b.releasePointerCapture) {
        try { b.releasePointerCapture(e.pointerId); } catch (_e) {}
      }
      ontgrendelGeluid();
      if (globalThis.AL.input) globalThis.AL.input.pijlAan(richting);
    };
    var uit = function () {
      if (globalThis.AL.input) globalThis.AL.input.pijlUit(richting);
    };
    // De andere helft van het schuiven: de vinger komt binnen zónder dat er een
    // nieuwe pointerdown volgt, want de druk is nooit opgehouden. `buttons > 0`
    // scheidt dat van een muis die alleen maar over de knop zweeft.
    var binnen = function (e) {
      if (e.buttons > 0) aan(e);
    };

    b.addEventListener("pointerdown", aan);
    b.addEventListener("pointerenter", binnen);
    b.addEventListener("pointerup", uit);
    b.addEventListener("pointercancel", uit);
    b.addEventListener("pointerleave", uit);
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    return b;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();
