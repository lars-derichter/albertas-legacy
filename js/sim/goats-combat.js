// goats-combat.js — AL.sim.combat: het gevecht van de Seven Little Goats-sim,
// een één-op-één spiegeling van Gevecht.java. Anders dan de Java-lus (die per
// ronde synchroon een regel van de Scanner leest) is dit een toestandsmachine:
// combat.start() zet het gevecht op en toont de eerste prompt; elke volgende
// getypte regel gaat door combat.verwerk(), die één actie afhandelt, de
// tegenstander laat terugslaan volgens zijn VASTE aanvalspatroon, en de
// volgende prompt of het schade-overzicht + de afhandeling teruggeeft.
//
// Volledig deterministisch: geen toeval, geen RNG. De aanvalspatronen zijn de vaste
// int[]-arrays uit Tegenstander (via AL.sim.world). Resultaatcodes exact als
// Gevecht.voer(): 0 = speler verslagen, 1 = tegenstander verslagen/afgemaakt,
// 2 = gespaard, 3 = time-out na vijf rondes.
//
// Alle tekst komt uit AL.sim.strings; hier staat geen prose. Draait in de
// browser (AL.sim.combat) én in Node (module.exports).

globalThis.AL = globalThis.AL || {};
globalThis.AL.sim = globalThis.AL.sim || {};

(function () {

  function S() { return globalThis.AL.sim.strings; }
  function W() { return globalThis.AL.sim.world; }

  function naamVan(g) { return S().tegenstanders[g.tegenId].naam; }
  function hintVan(g) { return S().tegenstanders[g.tegenId].hint; }

  // Java's Double.toString: gehele waarden krijgen ".0" (5 -> "5.0"); anders de
  // kortste round-trip-representatie, die JS' Number.toString net zo geeft.
  function javaDouble(x) {
    return Number.isInteger(x) ? x.toFixed(1) : String(x);
  }

  // Het schade-overzicht (Gevecht.toonSchadelog): tellen (aantal), totaliseren
  // (som), gemiddelde, en het uiterste (maximum) over de gevochten rondes.
  function schadeOverzicht(schadelog, aantalRondes) {
    var out = ["", S().schadeKop];
    if (aantalRondes === 0) {
      out.push(S().geenKlap);
      return out;
    }
    var som = 0;
    var maximum = schadelog[0];
    for (var i = 0; i < aantalRondes; i++) {
      som = som + schadelog[i];
      if (schadelog[i] > maximum) maximum = schadelog[i];
    }
    var gemiddelde = som / aantalRondes;
    out.push(S().schadeRondes(aantalRondes));
    out.push(S().schadeTotaal(som));
    out.push(S().schadeGemiddeld(javaDouble(gemiddelde)));
    out.push(S().schadeMax(maximum));
    return out;
  }

  function gevechtOpties(t) {
    var out = [S().gevechtOptiesKop];
    if (W().heeft(t, "koek")) out.push(S().gevechtOptiesKoek);
    if (W().heeft(t, "kruik melk")) out.push(S().gevechtOptiesMelk);
    out.push(S().gevechtOptiesHint);
    out.push(S().gevechtOptiesCheat);
    return out;
  }

  function smeekOpties() {
    return [S().smeekOptiesKop, S().gevechtOptiesHint, S().gevechtOptiesCheat];
  }

  // De prompt voor de volgende beurt, of — als de while-lus klaar is — het
  // schade-overzicht plus de na-afhandeling. Spiegelt de kop van de Java-lus:
  //   while (ronde < 5 && !klaar) { if (lp <= drempel) smeek; else ronde; }
  //   toonSchadelog(...); return resultaat;
  function volgendePromptOfFinale(t) {
    var g = t.gevecht;
    if (g.klaar || g.ronde >= 5) {
      return finaliseer(t);
    }
    if (g.tegenLp <= g.drempel) {
      g.fase = "smeek";
      return { tekst: [""].concat(S().smeek(naamVan(g))), effecten: [] };
    }
    g.fase = "ronde";
    return {
      tekst: ["", S().rondeKop(g.ronde + 1),
        S().lpRegel(t.speler.lp, naamVan(g), g.tegenLp), S().kiesActie],
      effecten: []
    };
  }

  // Het gevecht is uit: toon het schade-overzicht en laat de wereld het
  // resultaat afhandelen (jachthond weg / teruggeduwd, of een van de vier eindes).
  function finaliseer(t) {
    var g = t.gevecht;
    var out = schadeOverzicht(g.schadelog, g.ronde);
    var resultaat = g.resultaat;
    t.gevecht = null;
    var na = W().afhandelResultaat(t, resultaat);
    return { tekst: out.concat(na.tekst), effecten: na.effecten };
  }

  // Het smeekmoment: alleen spaar/maak af beslissen; ?, opties en onzin laten de
  // smeekprompt opnieuw verschijnen (geen ronde, geen terugslag).
  function smeekActie(t, cmd) {
    var g = t.gevecht;
    var out = [];
    if (cmd === "spaar") {
      g.resultaat = 2; g.klaar = true;
    } else if (cmd === "maak af") {
      g.tegenLp = 0; g.resultaat = 1; g.klaar = true;
    } else if (cmd === "?") {
      out.push(S().hintVoorvoegsel(hintVan(g)));
    } else if (cmd === "opties") {
      out = out.concat(smeekOpties());
    } else {
      out.push(S().datBegrijpJeNiet);
    }
    var nxt = volgendePromptOfFinale(t);
    return { tekst: out.concat(nxt.tekst), effecten: nxt.effecten };
  }

  // Een gewone ronde: kies een actie; bij een geldige actie slaat de
  // tegenstander terug volgens zijn vaste patroon (verdedigen halveert met gehele
  // deling, de rode mantel vangt 1 op) en loopt de ronde door.
  function rondeActie(t, cmd) {
    var g = t.gevecht;
    var naam = naamVan(g);
    var out = [];
    var verdedigt = false;
    var geldig = true;

    if (cmd === "val aan") {
      var schade = W().spelerSchade(t);
      g.tegenLp = Math.max(0, g.tegenLp - schade);
      g.schadelog[g.ronde] = schade;
      out.push(S().valAan(schade));
    } else if (cmd === "verdedig") {
      verdedigt = true;
      g.schadelog[g.ronde] = 0;
      out.push(S().verdedig);
    } else if (cmd === "eet koek") {
      if (W().heeft(t, "koek")) {
        W().verwijder(t, "koek");
        W().zetLp(t, t.speler.lp + 4);
        g.schadelog[g.ronde] = 0;
        out.push(S().eetKoek(t.speler.lp));
      } else {
        out.push(S().geenKoek); geldig = false;
      }
    } else if (cmd === "eet melk") {
      if (W().heeft(t, "kruik melk")) {
        W().verwijder(t, "kruik melk");
        W().zetLp(t, t.speler.lp + 6);
        g.schadelog[g.ronde] = 0;
        out.push(S().eetMelk(t.speler.lp));
      } else {
        out.push(S().geenMelk); geldig = false;
      }
    } else if (cmd === "?") {
      out.push(S().hintVoorvoegsel(hintVan(g))); geldig = false;
    } else if (cmd === "opties") {
      out = out.concat(gevechtOpties(t)); geldig = false;
    } else {
      out.push(S().datBegrijpJeNiet); geldig = false;
    }

    if (geldig) {
      if (g.tegenLp <= 0) {
        out.push(S().tegenstanderVerslagen(naam));
        g.resultaat = 1; g.klaar = true;
      } else {
        var inkomend = g.patroon[g.ronde];
        if (verdedigt) inkomend = Math.floor(inkomend / 2);
        if (W().heeft(t, "rode mantel")) inkomend = inkomend - 1;
        if (inkomend < 0) inkomend = 0;
        W().zetLp(t, t.speler.lp - inkomend);
        out.push(S().tegenstanderSlaat(naam, inkomend, t.speler.lp));
        if (t.speler.lp <= 0) { g.resultaat = 0; g.klaar = true; }
      }
      g.ronde++;
    }

    var nxt = volgendePromptOfFinale(t);
    return { tekst: out.concat(nxt.tekst), effecten: nxt.effecten };
  }

  var combat = {

    // Start het gevecht met de tegenstander in de huidige kamer. Zet de
    // gevecht-substaat op en geeft de kop + de eerste prompt terug.
    start: function (t) {
      var tegenId = W().tegenstanderVan(t);
      var data = W().enemyData(tegenId);
      t.gevecht = {
        tegenId: tegenId,
        tegenLp: data.lp,
        patroon: data.patroon.slice(),
        drempel: data.drempel,
        ronde: 0,
        schadelog: [0, 0, 0, 0, 0],
        resultaat: 3,
        klaar: false,
        fase: null
      };
      var naam = S().tegenstanders[tegenId].naam;
      var kop = ["", S().gevechtKop(naam), S().tegenstanders[tegenId].beschrijving];
      var nxt = volgendePromptOfFinale(t);
      return { tekst: kop.concat(nxt.tekst), effecten: nxt.effecten };
    },

    // Verwerk één getypte regel tijdens het gevecht (ronde- of smeekfase).
    verwerk: function (t, commando) {
      var g = t.gevecht;
      if (!g) return { tekst: [], effecten: [] };
      if (g.fase === "smeek") return smeekActie(t, commando);
      return rondeActie(t, commando);
    },

    // Blootgesteld voor de tests.
    _javaDouble: javaDouble,
    _schadeOverzicht: schadeOverzicht
  };

  AL.sim.combat = combat;

  if (typeof module !== "undefined") { module.exports = combat; }

})();
