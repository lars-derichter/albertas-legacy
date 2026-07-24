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
    if (commando === "kijk") {
      return AL.world.kijk(toestand);
    }
    if (commando === "ga noord") { return AL.world.betreed(toestand, "noord"); }
    if (commando === "ga oost") { return AL.world.betreed(toestand, "oost"); }
    if (commando === "ga zuid") { return AL.world.betreed(toestand, "zuid"); }
    if (commando === "ga west") { return AL.world.betreed(toestand, "west"); }

    // Onderzoeken / bekijken van een ding.
    if (commando.indexOf("onderzoek ") === 0) {
      return AL.world.onderzoek(toestand, commando.substring(10).trim());
    }
    if (commando.indexOf("bekijk ") === 0) {
      return AL.world.onderzoek(toestand, commando.substring(7).trim());
    }

    // Openen (dozen, het notitieboek).
    if (commando.indexOf("open ") === 0) {
      return AL.world.open(toestand, commando.substring(5).trim());
    }

    // Aan de pc gaan zitten.
    if (commando === "ga zitten" || commando === "gebruik pc" ||
        commando === "zit" || commando === "pc") {
      return AL.world.gebruikPc(toestand);
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
  }
};

// Node-export voor de headless tests.
if (typeof module !== "undefined") {
  module.exports = AL.parser;
}
