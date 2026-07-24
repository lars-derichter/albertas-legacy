// sim-terminal.js — AL.sim.terminal: de dunne DOM-controller die de Seven Little
// Goats-simulatie in het terminalpaneel van de pc-overlay draait. Hij leent de
// render-API van AL.pc.terminal (schrijf/zetRauw/zetPrompt/focus) en de
// panelen-switch AL.pc.simView; de spellogica zelf blijft DOM-vrij in
// AL.sim.world / AL.sim.combat.
//
// Rol in de endgame-keten (spelontwerp-legacy.md, §"Endgame"): de engine roept
// start() aan bij sim:boot (stap 2). Elke getypte regel gaat naar
// AL.sim.world.verwerk; zodra die een sim:einde:<naam> teruggeeft (stap 3),
// draait de controller de ECHTE vervolgketen: AL.world.simVoltooid op de
// meta-toestand → oordeel:<tier> (stap 4) → epiloog (stap 5). Geen debug-stub.
//
// Als deel van de pc-renderlaag mag dit bestand de DOM aanraken (via AL.pc).

globalThis.AL = globalThis.AL || {};
globalThis.AL.sim = globalThis.AL.sim || {};

(function () {

  var ctx = null;             // engine-context: { emit, getToestand, ... }
  var simToestand = null;     // de platte sim-substaat (niet mee-opgeslagen)
  var afgelopen = false;      // een einde bereikt: verdere invoer negeren

  function term() { return globalThis.AL.pc.terminal; }
  function str() { return globalThis.AL.sim.strings; }

  // Start de sim in het terminalpaneel. Aangeroepen door de engine bij sim:boot.
  // voorwoord: optionele meta-aankondiging (Alberta's stem) boven de sim-boot.
  function start(engineCtx, voorwoord) {
    ctx = engineCtx;
    simToestand = globalThis.AL.sim.world.nieuw();
    afgelopen = false;
    globalThis.AL.pc.simView(str().terminalTitel);
    var t = term();
    t.wis();
    t.zetPrompt(str().prompt);
    if (voorwoord && voorwoord.length) t.schrijf(voorwoord);
    var boot = globalThis.AL.sim.world.introRegels(simToestand);
    t.schrijf(boot.tekst);
    t.zetRauw(opRegel);
    t.focus();
  }

  // Eén getypte regel: laat de sim ze verwerken, toon de uitvoer, en als er een
  // einde valt, ga door naar Alberta's oordeel.
  function opRegel(regel) {
    if (afgelopen || !simToestand) return;
    var r = globalThis.AL.sim.world.verwerk(simToestand, regel);
    term().schrijf(r.tekst);

    var eindeNaam = null;
    for (var i = 0; i < r.effecten.length; i++) {
      if (r.effecten[i].indexOf("sim:einde:") === 0) {
        eindeNaam = r.effecten[i].substring("sim:einde:".length);
        break;
      }
    }
    if (eindeNaam !== null) beeindig(eindeNaam);
  }

  // De sim bereikte een van de vier eindes: sluit de rauwe modus en laat de
  // engine de meta-endgame afspelen (oordeel → epiloog) via de ECHTE
  // AL.world.simVoltooid op de meta-toestand.
  function beeindig(eindeNaam) {
    afgelopen = true;
    term().zetNormaal();
    if (!ctx) return;
    var meta = ctx.getToestand();
    var r = globalThis.AL.world.simVoltooid(meta, eindeNaam);
    ctx.emit(r.effecten);
  }

  AL.sim.terminal = {
    start: start,
    // Test-/debughaken (de Playwright-smoketest en losse controle).
    _toestand: function () { return simToestand; },
    _afgelopen: function () { return afgelopen; },
    _opRegel: opRegel
  };

})();
