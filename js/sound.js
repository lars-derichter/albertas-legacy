// sound.js — kleine geluidslaag in PC-speaker-stijl. Alles is gesynthetiseerd
// met WebAudio (blokgolven, geen bestanden). Elke cue is een kort reeksje
// bliepjes, stil (gain ~0.05) en korter dan 1,5 s. De engine roept speel(naam)
// aan vanuit de effecttags (geluid:<cue>).
//
// Robuust: als er geen AudioContext is (oud toestel, headless test) doet niets
// iets, maar crasht nooit. Standaard staat het geluid aan; de effecttags
// geluid:aan / geluid:uit zetten het om via zetAan.
//
// Aangepast uit remake-90s (js/sound.js): de synthese en de aan/uit-toggle zijn
// ongewijzigd; de cue-lijst is vervangen door de vaste cues van The Legacy of
// Alberta (engine-architectuur.md, §Systeem): pagina, deur, toets, compileer,
// ok, fout, boot, ambient-zolder, plus titel voor de titelkaart.
//
// Geen ES-module: hangt aan het globale AL-object.

globalThis.AL = globalThis.AL || {};

(function () {

  var ctx = null;      // de AudioContext, lui aangemaakt bij de eerste toets
  var aan = true;      // staat het geluid aan?
  var VOLUME = 0.05;   // stil, zoals een echte PC-speaker nooit was

  // De cues als reeksen noten. Elke noot is [frequentie, startseconde, duur].
  var CUES = {
    // Titelkaart: een kort, melancholisch opgaand jingle-tje.
    titel: [[392, 0.00, 0.14], [523, 0.15, 0.14], [659, 0.30, 0.24]],
    // Een bladzijde omslaan in het notitieboek: een zacht ritseltje.
    pagina: [[300, 0.00, 0.04], [220, 0.05, 0.05]],
    // Een deur / een scènewissel: een lage klik-bonk.
    deur: [[160, 0.00, 0.10], [120, 0.10, 0.10]],
    // Een toetsaanslag in de editor: een korte hoge tik.
    toets: [[900, 0.00, 0.03]],
    // "Compileer & test": een neutrale dubbele blip (verwerken).
    compileer: [[440, 0.00, 0.06], [440, 0.08, 0.06], [523, 0.16, 0.08]],
    // Een assertie slaagt (CHECK_OK): een korte stijgende bevestiging.
    ok: [[523, 0.00, 0.08], [784, 0.09, 0.14]],
    // Een assertie faalt (CHECK_FAIL / javac-fout): een dalende blip, niet hard.
    fout: [[440, 0.00, 0.07], [330, 0.08, 0.10]],
    // De pc boot Seven Little Goats: een langere opstart-fanfare.
    boot: [[262, 0.00, 0.10], [330, 0.11, 0.10], [392, 0.22, 0.10],
      [523, 0.33, 0.14], [659, 0.48, 0.26]],
    // Achtergrondsfeer van de zolder: één diepe, trage toon (kort, geen loop).
    "ambient-zolder": [[110, 0.00, 0.40]]
  };

  // Zorg voor een AudioContext, of geef null als het niet kan.
  function zorgCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  // Eén blokgolf-noot met een korte aanzet en uitdoving.
  function bliep(frequentie, start, duur) {
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequentie;
    osc.connect(gain);
    gain.connect(ctx.destination);
    var t0 = ctx.currentTime + start;
    // Exponentiële envelope: nooit exact 0 (dat mag exponentieel niet).
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(VOLUME, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duur);
    osc.start(t0);
    osc.stop(t0 + duur + 0.02);
  }

  AL.sound = {

    // De namen van de gekende cues (voor tooling/tests).
    cues: Object.keys(CUES),

    // Ontgrendel het geluid na een gebruikersactie (de eerste toetsaanslag).
    unlock: function () {
      var c = zorgCtx();
      if (c && c.state === "suspended") {
        try { c.resume(); } catch (e) { /* niets */ }
      }
    },

    // Zet het geluid aan of uit (effecttags geluid:aan / geluid:uit).
    zetAan: function (waarde) { aan = !!waarde; },

    isAan: function () { return aan; },

    // Speel een cue op naam. Onbekende naam of geluid uit: doet niets.
    speel: function (naam) {
      if (!aan) return;
      var c = zorgCtx();
      if (!c) return;
      if (c.state === "suspended") {
        try { c.resume(); } catch (e) { /* niets */ }
      }
      var seq = CUES[naam];
      if (!seq) return;
      for (var i = 0; i < seq.length; i++) {
        bliep(seq[i][0], seq[i][1], seq[i][2]);
      }
    }
  };

})();
