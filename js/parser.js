// parser.js — vertaalt de ruwe invoer van de speler naar een aanroep van de
// wereldlogica, op basis van de modus. Levert overal dezelfde resultaatvorm
// terug: { tekst: [...], effecten: [...] }.
//
// Aangepast uit remake-90s (js/parser.js): het parse-/dispatchpatroon is
// hetzelfde, maar de modi zijn nieuw (zolder / spread / pc / sim) en de verben
// zijn die van The Legacy of Alberta (spelontwerp-legacy.md, §Commando's). De
// pc- en sim-modi krijgen hun eigen invoerafhandeling in latere WP's; hier
// dispatcht de parser de zolder-commando's en laat hij de andere modi met rust
// (de engine/overlays vangen die af).
//
// Draait zowel in de browser (AL.parser) als in Node (module.exports).

globalThis.AL = globalThis.AL || {};

AL.parser = {

  // Splitst de ruwe invoer in werkwoord en rest. Handig voor de engine; de
  // eigenlijke dispatch in verwerk() werkt op het volledige commando, omdat
  // veel commando's uit twee woorden bestaan ("ga zitten", "onderzoek doos").
  parse: function (ruweInvoer) {
    var commando = ruweInvoer.trim().toLowerCase();
    var spatie = commando.indexOf(" ");
    if (spatie === -1) {
      return { commando: commando, werkwoord: commando, rest: "" };
    }
    return {
      commando: commando,
      werkwoord: commando.substring(0, spatie),
      rest: commando.substring(spatie + 1).trim()
    };
  },

  // Verwerkt één commando in de zolder-modus. Andere modi (spread bladeren,
  // pc, sim) worden door de engine of de overlays afgehandeld; komt er hier
  // toch invoer binnen buiten de zolder, dan geeft de parser "dat begrijp je
  // niet" terug.
  verwerk: function (toestand, ruweInvoer) {
    var commando = ruweInvoer.trim().toLowerCase();

    if (toestand.modus !== "zolder") {
      return { tekst: [AL.strings.datBegrijpJeNiet], effecten: [] };
    }

    // Verkennen en navigeren.
    if (commando === "kijk" || commando === "kijk rond" ||
        commando === "rondkijken") {
      return AL.world.kijk(toestand);
    }

    // Aan de pc gaan zitten. Staat vóór de richtingen, want "ga zitten" begint
    // ook met "ga ".
    if (commando === "ga zitten" || commando === "gebruik pc" ||
        commando === "zit" || commando === "pc" || commando === "ga werken") {
      return AL.world.gebruikPc(toestand);
    }

    // Richtingen. Naast "ga noord" ook het kale "noord", de afkorting "n", en
    // "ga naar het noorden" — wie een tekstadventure gewend is, typt dat, en de
    // intro nodigt uitdrukkelijk uit om te typen.
    var richting = this._richting(commando);
    if (richting) {
      return AL.world.betreed(toestand, richting);
    }

    // Onderzoeken / bekijken van een ding.
    var ding = this._naVerb(commando,
      ["onderzoek ", "bekijk ", "bestudeer ", "inspecteer ", "kijk naar ",
        "bekijk de ", "onderzoek de "]);
    if (ding !== null) {
      return AL.world.onderzoek(toestand, ding);
    }

    // Openen (dozen, het notitieboek).
    var teOpenen = this._naVerb(commando, ["open ", "maak open ", "openen "]);
    if (teOpenen !== null) {
      return AL.world.open(toestand, teOpenen);
    }

    // Nemen. Er is niets om mee te nemen, maar "Dat begrijp je niet" is het
    // verkeerde antwoord op een commando dat de parser prima begrijpt.
    if (this._naVerb(commando, ["neem ", "pak ", "raap ", "steek "]) !== null ||
        commando === "neem" || commando === "pak") {
      return { tekst: [AL.strings.neemNiet], effecten: [] };
    }

    if (commando === "inventaris") {
      return AL.world.inventaris(toestand);
    }
    if (commando === "?") {
      return AL.world.hint(toestand);
    }
    if (commando === "help") {
      return AL.world.help(toestand);
    }

    // Herbegin met bevestiging: "herbegin" vraagt, "herbegin ja" voert uit.
    // (Bewuste conventie: de bevestiging is stateless en dus Node-testbaar; de
    // engine zet op "herbegin" de save-wis en de verse staat.)
    if (commando === "herbegin") {
      return AL.world.herbeginVraag(toestand);
    }
    if (commando === "herbegin ja" || commando === "herbegin bevestig") {
      return AL.world.herbeginBevestig(toestand);
    }

    // Geluid: de engine regelt de audio; de parser geeft het effect door.
    if (commando === "geluid aan") {
      return { tekst: [AL.strings.geluidAan], effecten: ["geluid:aan"] };
    }
    if (commando === "geluid uit") {
      return { tekst: [AL.strings.geluidUit], effecten: ["geluid:uit"] };
    }

    // Beeldbuis: de scanlines en het vignet over het canvas. Zelfde patroon als
    // geluid — de logica kent alleen de voorkeur, de engine zet het beeld om.
    if (commando === "crt aan") {
      return { tekst: [AL.strings.crtAan], effecten: ["crt:aan"] };
    }
    if (commando === "crt uit") {
      return { tekst: [AL.strings.crtUit], effecten: ["crt:uit"] };
    }

    return { tekst: [AL.strings.datBegrijpJeNiet], effecten: [] };
  },

  // Herkent een richting in alles wat een speler er redelijkerwijs voor typt:
  // "ga noord", "loop naar het noorden", "noord", "n". Geeft null als het
  // commando geen richting is.
  _richting: function (commando) {
    var c = commando;
    var voorvoegsels = ["ga naar het ", "loop naar het ", "ga naar de ",
      "ga naar ", "loop naar ", "ga ", "loop ", "naar het ", "naar "];
    for (var i = 0; i < voorvoegsels.length; i++) {
      if (c.indexOf(voorvoegsels[i]) === 0) {
        c = c.substring(voorvoegsels[i].length).trim();
        break;
      }
    }
    var kaart = {
      n: "noord", noord: "noord", noorden: "noord",
      o: "oost", oost: "oost", oosten: "oost",
      z: "zuid", zuid: "zuid", zuiden: "zuid",
      w: "west", west: "west", westen: "west"
    };
    return kaart[c] || null;
  },

  // Als het commando met een van deze werkwoorden begint: geef terug wat erna
  // komt, zonder lidwoord. Anders null. Zo werkt "onderzoek de doos" net zo
  // goed als "onderzoek doos".
  _naVerb: function (commando, werkwoorden) {
    for (var i = 0; i < werkwoorden.length; i++) {
      if (commando.indexOf(werkwoorden[i]) === 0) {
        return this._zonderLidwoord(commando.substring(werkwoorden[i].length));
      }
    }
    return null;
  },

  _zonderLidwoord: function (rest) {
    var d = rest.trim();
    var lidwoorden = ["de ", "het ", "een ", "die ", "dat ", "'t ", "mijn ",
      "haar "];
    for (var i = 0; i < lidwoorden.length; i++) {
      if (d.indexOf(lidwoorden[i]) === 0) {
        return d.substring(lidwoorden[i].length).trim();
      }
    }
    return d;
  }
};

// Node-export voor de headless tests.
if (typeof module !== "undefined") {
  module.exports = AL.parser;
}
