// goats-world.js — AL.sim.world: de DOM-vrije wereldlogica van de Seven Little
// Goats-simulatie. Spiegelt Spel.java (wereldopbouw, navigatie, voorwerpen,
// praten/ruilen, de zoeklus zoekGeitje, de endgame-keten geitje→schuilplaats→
// kamer en de vier eindes), Speler.java (inventaris, geklemde levenspunten,
// telWapens/sterksteVoorwerp), Kamer/Voorwerp/Geitje/Schuilplaats.
//
// Eén platte, serialiseerbare toestand; elke handler geeft {tekst, effecten}
// terug, net als js/logic/world.js. Het gevecht zit in goats-combat.js; deze
// module levert de spelerhelpers en de na-gevecht-afhandeling die het aanroept.
// Alle prose komt uit AL.sim.strings.
//
// Draait in de browser (AL.sim.world) én in Node (module.exports).

globalThis.AL = globalThis.AL || {};
globalThis.AL.sim = globalThis.AL.sim || {};

(function () {

  function S() { return globalThis.AL.sim.strings; }

  // De kamergraaf. Elke verbinding staat in beide richtingen (Spel.verbindKamers).
  var GRAAF = {
    geitenhuisje: { zuid: "dorpsplein" },
    dorpsplein: { noord: "geitenhuisje", oost: "molen", west: "kruidenier", zuid: "bospad" },
    molen: { west: "dorpsplein" },
    kruidenier: { oost: "dorpsplein" },
    bospad: { noord: "dorpsplein", zuid: "oudeEik" },
    oudeEik: { noord: "bospad", zuid: "grootmoederHuisje" },
    grootmoederHuisje: { noord: "oudeEik", zuid: "wolvenspoor" },
    wolvenspoor: { noord: "grootmoederHuisje", zuid: "rivieroever" },
    rivieroever: { noord: "wolvenspoor" }
  };

  // De volgorde waarin toonOpties de uitgangen afgaat (Spel.toonOpties).
  var RICHTINGEN = ["noord", "oost", "zuid", "west"];

  // Waar elk voorwerp start, met zijn kracht (0 tenzij anders; keukenmes 3).
  var START_VOORWERPEN = {
    geitenhuisje: [["rode mantel", 0], ["keukenmes", 3], ["mandje", 0]],
    dorpsplein: [["koek", 0], ["koek", 0]],
    molen: [["bloem", 0], ["kruik melk", 0]],
    kruidenier: [["krijt", 0]],
    grootmoederHuisje: [["zilveren schaar", 0]],
    rivieroever: [["stenen", 0]]
  };

  // De tegenstander per kamer, en hun vaste gevechtsdata (Tegenstander).
  var TEGENSTANDER_VAN = { molen: "jachthond", rivieroever: "jonge wolf" };
  var ENEMY = {
    "jachthond": { lp: 8, patroon: [2, 3, 2, 3, 2], drempel: 0 },
    "jonge wolf": { lp: 18, patroon: [3, 5, 2, 6, 4], drempel: 5 }
  };

  // De zeven geitjes: naam en (voor het jongste) zijn startschuilplaats.
  var GEITJE_NAMEN = ["jongste geitje", "eerste geitje", "tweede geitje",
    "derde geitje", "vierde geitje", "vijfde geitje", "zesde geitje"];

  // De zes schuilplaatsen die de broertjes bij het beste einde krijgen
  // (Spel.bevrijdGeitjes), in volgorde: [naam, kamerId].
  var BEVRIJDE_PLEKKEN = [
    ["onder de molensteen", "molen"],
    ["achter de toonbank", "kruidenier"],
    ["in het kreupelhout", "bospad"],
    ["in de holte van de eik", "oudeEik"],
    ["onder grootmoeders bed", "grootmoederHuisje"],
    ["tussen het riet", "rivieroever"]
  ];

  // ---- Voorwerp-/kamerhulp -------------------------------------------------

  function verseVoorwerpen() {
    var uit = {};
    for (var id in START_VOORWERPEN) {
      uit[id] = START_VOORWERPEN[id].map(function (v) {
        return { naam: v[0], kracht: v[1] };
      });
    }
    return uit;
  }

  function kamerNaam(id) { return S().kamers[id].naam; }

  // ---- Spelerhelpers (Speler.java) -----------------------------------------

  function zoek(t, naam) {
    var inv = t.speler.inventaris;
    for (var i = 0; i < inv.length; i++) {
      if (inv[i].naam === naam) return inv[i];
    }
    return null;
  }

  function heeft(t, naam) { return zoek(t, naam) !== null; }

  function verwijder(t, naam) {
    var inv = t.speler.inventaris;
    for (var i = 0; i < inv.length; i++) {
      if (inv[i].naam === naam) { inv.splice(i, 1); return true; }
    }
    return false;
  }

  // De geklemde setter (Speler.setLevenspunten): nooit onder 0 of boven max.
  function zetLp(t, waarde) {
    if (waarde < 0) waarde = 0;
    if (waarde > t.speler.maxLp) waarde = t.speler.maxLp;
    t.speler.lp = waarde;
  }

  // De schade van de speler: basiskracht plus de kracht van het keukenmes.
  function spelerSchade(t) {
    var schade = t.speler.aanval;
    var mes = zoek(t, "keukenmes");
    if (mes) schade = schade + mes.kracht;
    return schade;
  }

  // Telt de wapens (kracht > 0) — het tel-patroon (Speler.telWapens).
  function telWapens(t) {
    var inv = t.speler.inventaris;
    var aantal = 0;
    for (var i = 0; i < inv.length; i++) {
      if (inv[i].kracht > 0) aantal++;
    }
    return aantal;
  }

  // Het sterkste voorwerp — het uiterste-patroon (Speler.sterksteVoorwerp).
  function sterksteVoorwerp(t) {
    var inv = t.speler.inventaris;
    var sterkste = null;
    for (var i = 0; i < inv.length; i++) {
      if (sterkste === null || inv[i].kracht > sterkste.kracht) sterkste = inv[i];
    }
    return sterkste;
  }

  // Spiegelt Spel.zoekGeitje: het geitje met die naam, of null.
  function zoekGeitje(t, naam) {
    for (var i = 0; i < t.geitjes.length; i++) {
      if (t.geitjes[i].naam === naam) return t.geitjes[i];
    }
    return null;
  }

  // De tegenstander in de huidige kamer, of null als er geen is of hij al
  // verslagen/weg is (Java: huidigeKamer.setTegenstander(null) na een overwinning).
  function tegenstanderVan(t) {
    var id = TEGENSTANDER_VAN[t.kamerId];
    if (!id) return null;
    if (t.tegenstanderWeg[t.kamerId]) return null;
    return id;
  }

  // ---- Kamerbeschrijving ----------------------------------------------------

  function beschrijfKamer(t) {
    var k = S().kamers[t.kamerId];
    var out = ["", "== " + k.naam + " =="].concat(k.beschrijving);
    var hier = t.kamerVoorwerpen[t.kamerId] || [];
    if (hier.length > 0) {
      var namen = hier.map(function (v) { return v.naam; }).join(", ");
      out.push(S().voorwerpenInKamerVoorvoegsel + namen);
    }
    return out;
  }

  // ---- Na het gevecht (Spel.startGevecht) ----------------------------------

  function heeftStenen(t) {
    return heeft(t, "gladde kiezels") || heeft(t, "stenen");
  }

  function afhandelResultaat(t, resultaat) {
    if (t.kamerId === "molen") {
      if (resultaat === 1) {
        t.tegenstanderWeg.molen = true;
        return { tekst: [""].concat(S().jachthondVerslagen), effecten: [] };
      } else if (resultaat === 0) {
        return gameOver(t);
      }
      // Time-out: teruggeduwd naar het dorpsplein.
      t.kamerId = "dorpsplein";
      return {
        tekst: [""].concat(S().jachthondDuwtTerug).concat(beschrijfKamer(t)),
        effecten: []
      };
    }
    if (t.kamerId === "rivieroever") {
      if (resultaat === 1) {
        if (heeft(t, "zilveren schaar") && heeftStenen(t)) {
          return eindeSchaarEnStenen(t);
        }
        return eindeAfrekening(t);
      }
      if (resultaat === 2) return eindeLes(t);
      return gameOver(t);
    }
    return { tekst: [], effecten: [] };
  }

  // ---- De vier eindes -------------------------------------------------------

  function eindeSchaarEnStenen(t) {
    t.gestopt = true;
    t.einde = "schaar-en-stenen";
    var out = [""].concat(S().eindeSchaarEnStenen);
    bevrijdGeitjes(t);
    out.push("");
    out = out.concat(toonSchuilplaatsen(t));
    out.push("");
    out.push(S().eindeSchaarEnStenenSlot);
    return { tekst: out, effecten: ["sim:einde:schaar-en-stenen", "gestopt"] };
  }

  function eindeAfrekening(t) {
    t.gestopt = true;
    t.einde = "afrekening";
    return {
      tekst: [""].concat(S().eindeAfrekening).concat(["", S().eindeAfrekeningSlot]),
      effecten: ["sim:einde:afrekening", "gestopt"]
    };
  }

  function eindeLes(t) {
    t.gestopt = true;
    t.einde = "les";
    return {
      tekst: [""].concat(S().eindeLes).concat(["", S().eindeLesSlot]),
      effecten: ["sim:einde:les", "gestopt"]
    };
  }

  function gameOver(t) {
    t.gestopt = true;
    t.einde = "gameover";
    return {
      tekst: [""].concat(S().gameOver).concat(["", S().gameOverSlot]),
      effecten: ["sim:einde:gameover", "gestopt"]
    };
  }

  // Bevrijdt de zes broertjes: elk zonder schuilplaats krijgt er een (Spel.
  // bevrijdGeitjes). Alle geitjes worden gered.
  function bevrijdGeitjes(t) {
    var volgende = 0;
    for (var i = 0; i < t.geitjes.length; i++) {
      var g = t.geitjes[i];
      if (g.schuilplaatsNaam === null) {
        g.schuilplaatsNaam = BEVRIJDE_PLEKKEN[volgende][0];
        g.kamerId = BEVRIJDE_PLEKKEN[volgende][1];
        volgende++;
      }
      g.gered = true;
    }
  }

  // De endgame-keten: geitje → schuilplaats → kamer (Spel.toonSchuilplaatsen),
  // null-veilig voor een geitje zonder schuilplaats.
  function toonSchuilplaatsen(t) {
    var out = [S().schuilplaatsenKop];
    for (var i = 0; i < t.geitjes.length; i++) {
      var g = t.geitjes[i];
      if (g.schuilplaatsNaam === null) {
        out.push(S().schuilplaatsNietGevonden(g.naam));
      } else {
        out.push(S().schuilplaatsRegel(g.naam, g.schuilplaatsNaam, kamerNaam(g.kamerId)));
      }
    }
    return out;
  }

  // ---- Commando's -----------------------------------------------------------

  function beweeg(t, richting) {
    var doel = GRAAF[t.kamerId][richting];
    if (!doel) return { tekst: [S().dieKantKanJeNietOp], effecten: [] };
    t.kamerId = doel;
    return { tekst: beschrijfKamer(t), effecten: [] };
  }

  function pak(t, naam) {
    var lijst = t.kamerVoorwerpen[t.kamerId] || [];
    var idx = -1;
    for (var i = 0; i < lijst.length; i++) {
      if (lijst[i].naam === naam) { idx = i; break; }
    }
    if (idx === -1) return { tekst: [S().datLigtHierNiet], effecten: [] };
    if (naam === "koek" && !heeft(t, "mandje")) {
      return { tekst: [S().nietsOmInTeDragen], effecten: [] };
    }
    var voorwerp = lijst.splice(idx, 1)[0];
    t.speler.inventaris.push(voorwerp);
    return { tekst: [S().neemtMee(naam)], effecten: [] };
  }

  function toonInventaris(t) {
    var inv = t.speler.inventaris;
    if (inv.length === 0) return { tekst: [S().draagtNiets], effecten: [] };
    var out = [S().draagtBijJe];
    for (var i = 0; i < inv.length; i++) {
      out.push(S().inventarisRegel(inv[i].naam, S().voorwerpen[inv[i].naam]));
    }
    return { tekst: out, effecten: [] };
  }

  function toonStats(t) {
    var out = [S().statsLevenspunten(t.speler.lp, t.speler.maxLp),
      S().statsAanvalskracht(t.speler.aanval)];
    var mes = zoek(t, "keukenmes");
    if (mes) out.push(S().statsMes(t.speler.aanval + mes.kracht));
    out.push(S().statsWapens(telWapens(t)));
    var sterkste = sterksteVoorwerp(t);
    if (sterkste) out.push(S().statsSterkste(sterkste.naam, sterkste.kracht));
    return { tekst: out, effecten: [] };
  }

  function eetKoek(t) {
    if (!heeft(t, "koek")) return { tekst: [S().geenKoek], effecten: [] };
    verwijder(t, "koek");
    zetLp(t, t.speler.lp + 4);
    return { tekst: [S().eetKoek(t.speler.lp)], effecten: [] };
  }

  function eetMelk(t) {
    if (!heeft(t, "kruik melk")) return { tekst: [S().geenMelk], effecten: [] };
    verwijder(t, "kruik melk");
    zetLp(t, t.speler.lp + 6);
    return { tekst: [S().eetMelk(t.speler.lp)], effecten: [] };
  }

  function praat(t) {
    if (t.kamerId === "oudeEik") {
      if (t.kiezelsGeruild) return { tekst: [S().raafAlGeruild], effecten: [] };
      return { tekst: S().raafAanbod.slice(), effecten: [] };
    }
    if (t.kamerId === "geitenhuisje") {
      var jongste = zoekGeitje(t, "jongste geitje");
      if (jongste === null) {
        return { tekst: [S().niemandOmMeeTePraten], effecten: [] };
      }
      return { tekst: S().jongsteGeitje(jongste.schuilplaatsNaam), effecten: [] };
    }
    return { tekst: [S().niemandOmMeeTePraten], effecten: [] };
  }

  function geefKoek(t) {
    if (t.kamerId !== "oudeEik") {
      return { tekst: [S().niemandDieDaaropWacht], effecten: [] };
    }
    if (t.kiezelsGeruild) return { tekst: [S().raafEenVolstaat], effecten: [] };
    if (!heeft(t, "koek")) return { tekst: [S().geenKoekOmTeGeven], effecten: [] };
    verwijder(t, "koek");
    t.speler.inventaris.push({ naam: "gladde kiezels", kracht: 0 });
    t.kiezelsGeruild = true;
    return { tekst: S().raafGeeftKiezels.slice(), effecten: [] };
  }

  function vecht(t) {
    if (tegenstanderVan(t) === null) {
      return { tekst: [S().niemandOmTegenTeVechten], effecten: [] };
    }
    return globalThis.AL.sim.combat.start(t);
  }

  function toonOpties(t) {
    var out = [S().optiesKop];
    var buren = GRAAF[t.kamerId];
    for (var r = 0; r < RICHTINGEN.length; r++) {
      var richting = RICHTINGEN[r];
      if (buren[richting]) out.push(S().optiesGa(richting, kamerNaam(buren[richting])));
    }
    var hier = t.kamerVoorwerpen[t.kamerId] || [];
    for (var i = 0; i < hier.length; i++) out.push(S().optiesPak(hier[i].naam));
    if (t.kamerId === "geitenhuisje") out.push(S().optiesPraat);
    if (t.kamerId === "oudeEik") { out.push(S().optiesPraat); out.push(S().optiesGeefKoek); }
    if (tegenstanderVan(t) !== null) out.push(S().optiesVecht);
    if (heeft(t, "koek")) out.push(S().optiesEetKoek);
    if (heeft(t, "kruik melk")) out.push(S().optiesEetMelk);
    out.push(S().optiesAltijd);
    out.push(S().optiesCheat);
    return { tekst: out, effecten: [] };
  }

  // ---- De publieke API ------------------------------------------------------

  var world = {

    GRAAF: GRAAF,
    ENEMY: ENEMY,

    // Een verse simulatie-toestand (plat en serialiseerbaar; niet mee-opgeslagen
    // tussen sessies — de sim is een eindstuk, engine-architectuur.md §"De staat").
    nieuw: function () {
      var geitjes = [{
        naam: "jongste geitje", schuilplaatsNaam: "de klokkast",
        kamerId: "geitenhuisje", gered: true
      }];
      for (var i = 1; i < GEITJE_NAMEN.length; i++) {
        geitjes.push({ naam: GEITJE_NAMEN[i], schuilplaatsNaam: null, kamerId: null, gered: false });
      }
      return {
        kamerId: "geitenhuisje",
        speler: { lp: 20, maxLp: 20, aanval: 2, inventaris: [] },
        kamerVoorwerpen: verseVoorwerpen(),
        tegenstanderWeg: { molen: false, rivieroever: false },
        kiezelsGeruild: false,
        geitjes: geitjes,
        gevecht: null,
        gestopt: false,
        einde: null
      };
    },

    // De boot-uitvoer: de banner, de backstory, de starthint en de openings-
    // kamer, exact in de volgorde van Main.main().
    introRegels: function (t) {
      var uit = S().banner.slice();
      uit.push("");
      uit = uit.concat(S().backstory);
      uit.push("");
      uit.push(S().startHint);
      uit = uit.concat(beschrijfKamer(t));
      return { tekst: uit, effecten: [] };
    },

    // Verwerkt één getypte regel. Tijdens een gevecht gaat ze naar goats-combat;
    // anders naar de gewone dispatch (Spel.verwerk).
    verwerk: function (t, ruweInvoer) {
      var commando = String(ruweInvoer).trim().toLowerCase();
      if (t.gevecht) return globalThis.AL.sim.combat.verwerk(t, commando);

      if (commando === "kijk") return { tekst: beschrijfKamer(t), effecten: [] };
      if (commando === "ga noord") return beweeg(t, "noord");
      if (commando === "ga oost") return beweeg(t, "oost");
      if (commando === "ga zuid") return beweeg(t, "zuid");
      if (commando === "ga west") return beweeg(t, "west");
      if (commando.indexOf("pak ") === 0) return pak(t, commando.substring(4).trim());
      if (commando === "inventaris") return toonInventaris(t);
      if (commando === "stats") return toonStats(t);
      if (commando === "eet koek") return eetKoek(t);
      if (commando === "eet melk") return eetMelk(t);
      if (commando === "geef koek") return geefKoek(t);
      if (commando === "praat") return praat(t);
      if (commando === "vecht") return vecht(t);
      if (commando === "?") return { tekst: [S().hintVoorvoegsel(S().kamers[t.kamerId].hint)], effecten: [] };
      if (commando === "help") return { tekst: S().help.slice(), effecten: [] };
      if (commando === "stop") {
        t.gestopt = true;
        return { tekst: [S().stop], effecten: ["gestopt"] };
      }
      if (commando === "opties") return toonOpties(t);
      return { tekst: [S().datBegrijpJeNiet], effecten: [] };
    },

    // Helpers die goats-combat.js aanroept.
    heeft: heeft,
    zoek: zoek,
    verwijder: verwijder,
    zetLp: zetLp,
    spelerSchade: spelerSchade,
    telWapens: telWapens,
    sterksteVoorwerp: sterksteVoorwerp,
    zoekGeitje: zoekGeitje,
    tegenstanderVan: tegenstanderVan,
    enemyData: function (id) { return ENEMY[id]; },
    afhandelResultaat: afhandelResultaat,
    beschrijfKamer: beschrijfKamer
  };

  AL.sim.world = world;

  if (typeof module !== "undefined") { module.exports = world; }

})();
