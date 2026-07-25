// sound.js — de geluidslaag. Alles gesynthetiseerd met WebAudio: geen bestanden,
// geen dependencies, niets dat over het net moet. De engine roept speel(naam)
// aan voor een eenmalige cue en muziek(naam) voor een bed dat blijft draaien.
//
// Robuust: is er geen AudioContext (oud toestel, headless test), dan doet niets
// iets maar crasht nooit. Standaard staat het geluid aan; de effecttags
// geluid:aan / geluid:uit zetten het om via zetAan.
//
// Aangepast uit remake-90s (js/sound.js): daarvan blijft de vorm — een cue-tabel
// als data, een aan/uit-toggle, en lui aanmaken van de AudioContext bij de
// eerste gebruikersactie. De synthese zelf is vervangen.
//
// Geen ES-module: hangt aan het globale AL-object.
//
// ---- Waarom FM en niet blokgolven ------------------------------------------
//
// Er stonden negen cues in, allemaal blokgolf-bliepjes: één oscillator, één
// envelope. Dat is de PC-speaker van 1985, niet de geluidskaart van 1990. Het
// spel dat hier nagedaan wordt klonk uit een AdLib of een Sound Blaster, en die
// deden FM: een OPL2 had twee operatoren per stem — een modulator die de
// frequentie van een carrier verbuigt.
//
// Dat is in WebAudio exact na te maken, en met dezelfde drie knoppen als toen:
//
//   ratio    de verhouding tussen modulator- en carrierfrequentie. Heel getal =
//            harmonisch (orgel, bas); niet-heel = klok, bel, metaal.
//   index    hoe diep de modulator de carrier verbuigt. Laag is hol en zacht,
//            hoog is scherp en metalig.
//   envelope aanzet en verval, apart voor de modulator: een klank die begint als
//            een bel en eindigt als een fluit, is één envelope op de index.
//
// Meer dan twee operatoren is er niet, en dat is opzet. Zes-operator-FM klinkt
// als een DX7 en dus als 1983 of als 1995, niet als de periode die dit spel
// speelt.
//
// ---- Het register ----------------------------------------------------------
//
// De muziek volgt de koudere toon uit WP C: mineur, traag, veel stilte tussen de
// frasen. De zolder hoort niet gezellig te klinken. Het contrast dat overblijft
// is de pc — het enige warme ding in huis, en het enige bed in een majeur-kleur.

globalThis.AL = globalThis.AL || {};

(function () {

  var ctx = null;         // de AudioContext, lui aangemaakt
  var meester = null;     // één GainNode waar álles op uitkomt
  var aan = true;
  var VOLUME = 0.16;      // de meesterversterking; per stem staat er nog een gain
  var VOORUIT = 0.35;     // hoe ver vooruit de scheduler noten plaatst (seconden)

  // ---- Stemmen -------------------------------------------------------------
  //
  // golf     de golfvorm van de carrier
  // ratio    modulatorfrequentie / carrierfrequentie
  // index    modulatiediepte als factor van de carrierfrequentie
  // aanzet   attack in seconden
  // verval   hoe lang de klank na de nootduur nog uitzingt
  // gain     stemvolume (0–1), vóór de meesterversterking
  var STEMMEN = {
    // Hol en luchtig, als een orgelregister met bijna geen boventonen. Ratio 2
    // is harmonisch, dus het blijft een toon en wordt geen bel.
    "koud": { golf: "sine", ratio: 2, index: 0.6, aanzet: 0.35, verval: 0.9,
      gain: 0.55 },
    // De lage laag. Ratio 0,5 zet de modulator een octaaf lager: dat geeft de
    // grondtoon body zonder hem te laten brommen.
    "bas": { golf: "sine", ratio: 0.5, index: 1.1, aanzet: 0.5, verval: 1.6,
      gain: 0.7 },
    // De pc. Driehoek met ratio 1 en een wat hogere index: iets belachtigs,
    // maar warm — een monitor die staat te zoemen, geen kerkorgel.
    "warm": { golf: "triangle", ratio: 1, index: 1.8, aanzet: 0.06, verval: 0.7,
      gain: 0.5 },
    // Kort en helder, voor de bevestigingen.
    "blip": { golf: "square", ratio: 3, index: 0.4, aanzet: 0.004, verval: 0.04,
      gain: 0.45 },
    // Hout. Ratio 1,41 (ongeveer wortel twee) is niet-harmonisch, dus dit is
    // geen toon meer maar een tik — precies wat een voetstap op een plank is.
    "hout": { golf: "triangle", ratio: 1.41, index: 6, aanzet: 0.002,
      verval: 0.05, gain: 0.6 },
    // Karton: dezelfde niet-harmonische truc, lager en doffer.
    "karton": { golf: "sine", ratio: 1.73, index: 9, aanzet: 0.003,
      verval: 0.09, gain: 0.5 }
  };

  // ---- Eenmalige cues ------------------------------------------------------
  //
  // Elke cue is { stem, noten: [[midi, start, duur], …] }. Midi in plaats van
  // hertz, want een toonhoogte opschrijven als 69 is te lezen en 440 is dat
  // alleen voor wie het uit zijn hoofd kent.
  var CUES = {
    // Een bladzijde omslaan: twee korte doffe tikken.
    pagina: { stem: "karton", noten: [[72, 0.00, 0.03], [67, 0.05, 0.04]] },
    // Een scènewissel: een lage bonk, hout op hout.
    deur: { stem: "hout", noten: [[45, 0.00, 0.05], [40, 0.07, 0.06]] },
    // Een toetsaanslag in de editor.
    toets: { stem: "blip", noten: [[93, 0.00, 0.02]] },
    // Een voetstap op een plank. Twee varianten, zodat opeenvolgende stappen
    // niet identiek klinken — dat is het verschil tussen lopen en een metronoom.
    stap: { stem: "hout", noten: [[38, 0.00, 0.05]] },
    "stap-2": { stem: "hout", noten: [[41, 0.00, 0.045]] },
    // Een doos die opengaat: karton dat meegeeft.
    doos: { stem: "karton", noten: [[50, 0.00, 0.06], [45, 0.08, 0.08],
      [43, 0.18, 0.10]] },
    // "Compileer & test": een neutrale dubbele blip.
    compileer: { stem: "blip", noten: [[69, 0.00, 0.05], [69, 0.09, 0.05],
      [76, 0.18, 0.07]] },
    // Een assertie slaagt.
    ok: { stem: "blip", noten: [[72, 0.00, 0.07], [79, 0.09, 0.13]] },
    // Een assertie faalt. Dalend, en niet hard: een fout is geen straf.
    fout: { stem: "blip", noten: [[69, 0.00, 0.07], [64, 0.09, 0.11]] },
    // De pc boot Seven Little Goats.
    boot: { stem: "warm", noten: [[48, 0.00, 0.10], [55, 0.11, 0.10],
      [60, 0.22, 0.10], [64, 0.33, 0.14], [72, 0.48, 0.30]] }
  };

  // ---- Muziekbedden --------------------------------------------------------
  //
  // Een bed is { lengte, eenmalig?, noten: [[midi, start, duur], …] }. De
  // lengte is de omloop in seconden; na die tijd begint hij opnieuw, tenzij
  // eenmalig. Noten onder midi 55 gaan naar de bas-stem, daarboven naar de
  // melodiestem van het bed — zo blijft de data leesbaar.
  var BEDDEN = {
    // De titelkaart. A mineur, traag. Vier maten waarvan de helft stilte.
    titel: { lengte: 16.0, stem: "koud", noten: [
      [45, 0.0, 3.6], [45, 8.0, 3.6],
      [69, 0.4, 1.3], [72, 2.0, 1.3], [76, 3.6, 2.1],
      [74, 6.0, 1.5], [72, 8.0, 1.3], [71, 9.6, 1.3],
      [69, 11.2, 3.0]
    ] },

    // De zolder. Dit is de cue die in de effect-woordenlijst al sinds WP 6
    // "ambient-zolder" heet en die nooit is afgevuurd. Ze was toen één blokgolf
    // van vier tiende seconde op 110 Hz — een blip, geen sfeer. Nu is het een
    // bed van bijna twintig seconden: een lage drone met een open kwint, en
    // vier losse noten erboven. Veel stilte, en niets dat oplost.
    "ambient-zolder": { lengte: 19.2, stem: "koud", noten: [
      [33, 0.0, 9.2], [33, 9.6, 9.2],
      [40, 4.8, 3.8],
      [69, 2.4, 2.5], [72, 7.2, 2.1], [71, 12.0, 2.9], [69, 16.2, 2.6]
    ] },

    // Aan de pc. Het enige bed in een majeur-kleur, en het enige dat beweegt:
    // een trage arpeggio over C. Het contrast met de zolder is het punt.
    pc: { lengte: 12.8, stem: "warm", noten: [
      [36, 0.0, 6.0], [36, 6.4, 6.0],
      [60, 0.4, 0.9], [64, 1.6, 0.9], [67, 2.8, 0.9], [72, 4.0, 1.9],
      [67, 6.4, 0.9], [64, 7.6, 0.9], [60, 8.8, 3.2]
    ] },

    // De eindkaart. Eenmalig: hij lost op en houdt dan op. A mineur, want ook
    // een goed einde is hier geen triomf.
    einde: { lengte: 7.0, eenmalig: true, stem: "koud", noten: [
      [45, 0.0, 4.2], [57, 0.0, 4.2],
      [69, 0.2, 1.1], [72, 1.4, 1.1], [76, 2.6, 3.4]
    ] }
  };

  function hertz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function zorgCtx() {
    if (ctx) return ctx;
    try {
      var W = (typeof window !== "undefined") ? window : null;
      var AC = W && (W.AudioContext || W.webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
      meester = ctx.createGain();
      meester.gain.value = aan ? VOLUME : 0;
      meester.connect(ctx.destination);
    } catch (e) {
      ctx = null;
      meester = null;
    }
    return ctx;
  }

  // Eén FM-noot: een modulator die de frequentie van een carrier verbuigt.
  // Precies de twee operatoren van een OPL2-stem.
  function noot(stemNaam, midi, start, duur) {
    if (!ctx || !meester) return;
    var s = STEMMEN[stemNaam] || STEMMEN.koud;
    var f = hertz(midi);
    var t0 = start;
    var t1 = t0 + duur;
    var eind = t1 + s.verval;

    var carrier = ctx.createOscillator();
    carrier.type = s.golf;
    carrier.frequency.value = f;

    var mod = ctx.createOscillator();
    mod.type = "sine";
    mod.frequency.value = f * s.ratio;

    // De modulatiediepte in hertz, met een eigen envelope: de klank begint
    // scherper en wordt zachter, zoals een aangeslagen snaar of toets.
    var modDiepte = ctx.createGain();
    var piek = f * s.index;
    modDiepte.gain.setValueAtTime(piek, t0);
    modDiepte.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, piek * 0.15), eind);

    mod.connect(modDiepte);
    modDiepte.connect(carrier.frequency);

    // De amplitude-envelope. Exponentieel mag nooit exact nul raken.
    var amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(s.gain, t0 + s.aanzet);
    amp.gain.setValueAtTime(s.gain, Math.max(t0 + s.aanzet, t1 - 0.001));
    amp.gain.exponentialRampToValueAtTime(0.0001, eind);

    carrier.connect(amp);
    amp.connect(meester);

    mod.start(t0);
    carrier.start(t0);
    mod.stop(eind + 0.02);
    carrier.stop(eind + 0.02);
  }

  // ---- De scheduler --------------------------------------------------------
  //
  // Noten worden vooruit geplaatst op de audioklok, niet afgevuurd op de
  // beeldklok: WebAudio timet exact, een rAF-lus niet. De engine tikt deze
  // functie aan, zij kijkt of de volgende noten binnen het vooruitkijkvenster
  // vallen, en plaatst ze dan.
  //
  // Dat vooruitkijken is ook waarom er een meestergain ís: op het moment dat de
  // speler "geluid uit" typt, staan er al noten in de toekomst gepland. Die kun
  // je niet meer intrekken — je kunt ze alleen naar nul versterken.
  var bed = null;         // het actieve bed
  var bedNaam = null;
  var bedStart = 0;       // audioklok-tijd waarop de huidige omloop begon
  var volgende = 0;       // index van de eerstvolgende ongeplaatste noot

  function planVooruit() {
    if (!bed || !ctx) return;
    var nu = ctx.currentTime;
    var grens = nu + VOORUIT;
    while (volgende < bed.noten.length) {
      var n = bed.noten[volgende];
      var wanneer = bedStart + n[1];
      if (wanneer > grens) return;
      volgende++;
      // Een noot waarvan het moment al voorbij is, wordt overgeslagen en niet
      // ingehaald. Dat is niet theoretisch: schakelt de speler naar een ander
      // tabblad, dan bevriest de beeldklok en dus deze tik, en bij terugkomst
      // staat de audioklok seconden verder. Zonder deze regel worden alle
      // gemiste noten dan in één keer geplaatst — op een tijd in het verleden,
      // wat WebAudio uitlegt als "nu" — en hoor je een cluster.
      if (wanneer < nu) continue;
      var stem = n[0] < 55 ? "bas" : bed.stem;
      noot(stem, n[0], wanneer, n[2]);
    }
    // Alles van deze omloop staat gepland. Begint hij opnieuw?
    if (bed.eenmalig) {
      if (ctx.currentTime > bedStart + bed.lengte) { bed = null; bedNaam = null; }
      return;
    }
    if (ctx.currentTime + VOORUIT >= bedStart + bed.lengte) {
      bedStart += bed.lengte;
      volgende = 0;
    }
  }

  AL.sound = {

    // De namen van de gekende eenmalige cues (voor tooling/tests).
    cues: Object.keys(CUES),

    // De namen van de gekende muziekbedden.
    bedden: Object.keys(BEDDEN),

    // Voor de tests: de ruwe tabellen, zodat een keuring de data kan nalopen
    // zonder een AudioContext nodig te hebben.
    _cues: CUES,
    _bedden: BEDDEN,
    _stemmen: STEMMEN,

    // Ontgrendel het geluid na een gebruikersactie (de eerste toetsaanslag).
    unlock: function () {
      var c = zorgCtx();
      if (c && c.state === "suspended") {
        try { c.resume(); } catch (e) { /* niets */ }
      }
    },

    // Zet het geluid aan of uit (effecttags geluid:aan / geluid:uit).
    //
    // Uit betekent écht uit: de meestergain gaat naar nul, en dat dempt ook de
    // noten die al vooruit gepland staan. Het actieve bed wordt vergeten, zodat
    // er niets blijft doorlopen waar niemand naar luistert.
    zetAan: function (waarde) {
      aan = !!waarde;
      if (meester && ctx) {
        try {
          meester.gain.cancelScheduledValues(ctx.currentTime);
          meester.gain.setValueAtTime(aan ? VOLUME : 0, ctx.currentTime);
        } catch (e) { /* niets */ }
      }
      if (!aan) { bed = null; bedNaam = null; volgende = 0; }
    },

    isAan: function () { return aan; },

    // Welk bed draait er? null als er niets draait. Voor de tests en de debughaak.
    huidigBed: function () { return bedNaam; },

    // Debughaak voor de rooksmaaktest. De meestergain is hier het interessante
    // getal: "geluid uit maakt het volledig stil" is anders niet te controleren
    // zonder naar de speakers te luisteren, en in een headless browser is er
    // geen speaker.
    debug: function () {
      return {
        context: !!ctx,
        staat: ctx ? ctx.state : null,
        bed: bedNaam,
        aan: aan,
        meesterGain: meester ? meester.gain.value : null,
        geplaatst: bed ? volgende : 0
      };
    },

    // Speel een eenmalige cue op naam. Onbekende naam of geluid uit: doet niets.
    speel: function (naam) {
      if (!aan) return;
      var c = zorgCtx();
      if (!c) return;
      if (c.state === "suspended") {
        try { c.resume(); } catch (e) { /* niets */ }
      }
      var cue = CUES[naam];
      if (!cue) return;
      var nu = c.currentTime + 0.005;
      for (var i = 0; i < cue.noten.length; i++) {
        noot(cue.stem, cue.noten[i][0], nu + cue.noten[i][1], cue.noten[i][2]);
      }
    },

    // Start een muziekbed, of stop de muziek met muziek(null). Hetzelfde bed
    // opnieuw starten doet niets — anders zou elke kamerwissel de zolder-loop
    // van voren af aan laten beginnen.
    muziek: function (naam) {
      if (naam === bedNaam) return;
      if (!naam) { bed = null; bedNaam = null; volgende = 0; return; }
      if (!BEDDEN[naam]) return;
      if (!aan) { bedNaam = null; return; }
      var c = zorgCtx();
      if (!c) { bedNaam = null; return; }
      if (c.state === "suspended") {
        try { c.resume(); } catch (e) { /* niets */ }
      }
      bed = BEDDEN[naam];
      bedNaam = naam;
      bedStart = c.currentTime + 0.05;
      volgende = 0;
      planVooruit();
    },

    // De engine tikt dit aan; zie planVooruit voor waarom het niet op de
    // beeldklok loopt.
    tik: function () {
      if (!aan || !bed || !ctx) return;
      planVooruit();
    }
  };

})();

// Node-export voor de headless tests.
if (typeof module !== "undefined") {
  module.exports = AL.sound;
}
