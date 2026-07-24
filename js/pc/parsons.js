// parsons.js — AL.pc.parsons: Parsons-puzzels in de terminal-UI. De stroken
// worden genummerd en GESCHUD via de seed-gestuurde variatie-service
// (AL.levels.shuffle → deterministisch per seed, save-en-hints.md). De speler
// typt de volgorde (bv. "3 1 4 2"); de puzzeldef mag afleider-stroken bevatten
// die er NIET bij horen. Bij een foute volgorde wijst de feedback de eerste
// mis-positie aan (gestage feedback, hint-contract).
//
// De PURE ordeverificatie (verifieerVolgorde/correcteVolgorde) is DOM-vrij en
// Node-testbaar; de rendering leent het terminalpaneel (AL.pc.terminal) via de
// gedeelde context.

globalThis.AL = globalThis.AL || {};
globalThis.AL.pc = globalThis.AL.pc || {};

(function () {

  var S = function () { return globalThis.AL.strings; };

  var ctx = null;
  var def = null;
  var seed = 0;

  // ---- PURE (DOM-vrij, Node-testbaar) -------------------------------------

  function geschud(pd, s) {
    var alle = pd.regels.concat(pd.distractors || []);
    return globalThis.AL.levels.shuffle(s, alle, pd.shuffleLabel || pd.id);
  }

  // De juiste volgorde als 1-gebaseerde posities in de geschudde lijst: voor
  // elke correcte strook (op volgorde) de plek waar ze terechtkwam. Duplicaten
  // worden per plek maar één keer verbruikt.
  function correcteVolgorde(pd, s) {
    var g = geschud(pd, s);
    var gebruikt = {};
    var seq = [];
    for (var i = 0; i < pd.regels.length; i++) {
      for (var j = 0; j < g.length; j++) {
        if (!gebruikt[j] && g[j] === pd.regels[i]) {
          seq.push(j + 1);
          gebruikt[j] = true;
          break;
        }
      }
    }
    return seq;
  }

  // verifieerVolgorde(def, seed, invoer) -> { ok, reden?, positie? }
  //   reden "aantal": verkeerd aantal stroken (bv. een afleider meegenomen of
  //   een strook vergeten). reden "volgorde": eerste mis-positie (1-gebaseerd).
  function verifieerVolgorde(pd, s, invoer) {
    var correct = correcteVolgorde(pd, s);
    var ruw = String(invoer).trim().split(/[\s,]+/).filter(function (x) { return x !== ""; });
    var getallen = ruw.map(function (x) { return parseInt(x, 10); })
                      .filter(function (x) { return !isNaN(x); });
    if (getallen.length !== correct.length) {
      return { ok: false, reden: "aantal" };
    }
    for (var i = 0; i < correct.length; i++) {
      if (getallen[i] !== correct[i]) {
        return { ok: false, reden: "volgorde", positie: i + 1 };
      }
    }
    return { ok: true };
  }

  // ---- DOM (leent AL.pc.terminal) -----------------------------------------

  function bouw(gedeeldeCtx) { ctx = gedeeldeCtx; }

  function laad(puzzelDef, toestand, lvl) {
    def = puzzelDef;
    seed = toestand.seed;
    var term = ctx.terminal;
    term.wis();
    term.zetPrompt(S().pc.prompt);
    term.schrijf(def.vraag);
    term.schrijf([""]);
    var g = geschud(def, seed);
    var regels = [];
    for (var i = 0; i < g.length; i++) {
      regels.push("  " + (i + 1) + "  " + g[i]);
    }
    term.schrijf(regels);
    term.schrijf(["", S().pc.typHint]);
    term.zetHandler(verwerk);
  }

  function verwerk(w) {
    var r = verifieerVolgorde(def, seed, w);
    var term = ctx.terminal;
    if (r.ok) {
      term.schrijf([def.ok]);
      ctx.emit(["check:ok:" + def.id]);
      ctx.voltooi();
      term.zetHandler(null);
    } else if (r.reden === "aantal") {
      term.schrijf([def.foutAantal]);
      ctx.emit(["check:fout:" + def.id]);
    } else {
      term.schrijf([def.fout(r.positie)]);
      ctx.emit(["check:fout:" + def.id]);
    }
  }

  AL.pc.parsons = {
    // PURE
    verifieerVolgorde: verifieerVolgorde,
    correcteVolgorde: correcteVolgorde,
    geschud: geschud,
    // DOM
    bouw: bouw,
    laad: laad,
    // debug/tests
    _correcteVolgordeString: function () {
      if (!def) return "";
      return correcteVolgorde(def, seed).join(" ");
    }
  };

  if (typeof module !== "undefined") { module.exports = AL.pc.parsons; }

})();
