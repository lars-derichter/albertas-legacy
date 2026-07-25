// engine.js — het hart van The Legacy of Alberta. Boot de renderer, berekent de
// schaal, en draait de toestandsmachine (titelkaart, zolder, spread, pc,
// oordeel, epiloog) met een vaste logische tik van 15 Hz en een render elk
// frame. De engine bindt de renderer (AL.gfx), de logica (AL.world / AL.levels /
// AL.parser), de sprites, de input, het geluid en de pc-overlay samen tot een
// speelbaar geheel.
//
// De engine bewaart geen spelregels: alle beslissingen komen uit de logica. Ze
// vertaalt toetsen naar commando's, tekent de wereld, en zet de effecttags om in
// beeld, geluid, save en pc-overlay. Als enige (naast js/pc/) raakt ze de DOM,
// het canvas en localStorage aan.
//
// Aangepast uit remake-90s (js/engine.js): het frame-lus-patroon, de
// scène-cache-en-blit, de actor-beweging over walkboxes, de venster-paginering
// en de schaalberekening zijn overgenomen; herschreven rond de nieuwe modi en
// de volledige effect-taglijst uit engine-architectuur.md. De pc-overlay wordt
// vanuit js/pc/ gevuld; de engine toont en verbergt ze alleen.
//
// Geen ES-module: hangt aan het globale AL-object en werkt vanaf file://.

globalThis.AL = globalThis.AL || {};

(function () {

  // ---- Vaste maten en snelheden -------------------------------------------

  var BREEDTE = 320;
  var HOOGTE = 200;
  var VELD_TOP = 8;
  var VELD_BOT = 189;
  var TIK_MS = 1000 / 15;      // vaste logische tik: 15 Hz
  var SNELHEID = 1.5;          // looppixels per tik

  // Van een looprichting naar de entry aan de overkant.
  var TEGENGESTELD = {
    noord: "vanZuid", zuid: "vanNoord", oost: "vanWest", west: "vanOost"
  };

  // ---- Toestand van de engine ---------------------------------------------

  var titelActief = true;      // toont de titelkaart (vóór het spel begint)
  var toestand = null;         // het wereld-toestand-object (AL.world)
  var seedUitUrl = null;       // ?seed=N, of null

  var actorX = 160, actorY = 150;
  var richting = "zuid";
  var loopt = false;

  // Het draaiframe. Wisselt de speler van de noord-zuidas naar de oost-westas of
  // omgekeerd, dan komt er twee tikken lang een driekwartframe tussen. Het
  // blokkeert de beweging niet — dat zou de besturing traag maken — het vervangt
  // alleen wat er getekend wordt. Zonder dat frame klapt de figuur van de ene
  // kant naar de andere.
  var draaiTikken = 0;

  // Tikken sinds de speler begon te lopen, voor het ritme van de voetstappen.
  var stapTeller = 0;

  // Gaat aan de pc zitten: drie frames vóór de overlay het beeld overneemt.
  // Zonder dit zie je nooit dat het kind gaat zitten. zitStap is null als er niet
  // gezeten wordt; zitKlaar is wat er moet gebeuren als de reeks af is.
  var zitStap = null;
  var zitTikTot = 0;
  var zitKlaar = null;
  var ZIT_TIKKEN = 3;           // tikken per frame, op 15 Hz dus vijf per seconde

  var venster = null;          // het open berichtvenster, of null
  var naVenster = null;        // wat te doen als het venster wegvalt

  var spreadLevelId = null;    // welke spread nu open staat (modus "spread")
  var spreadPagina = 0;        // huidige pagina binnen de open spread

  // De openingsreeks: drie getekende beelden met de verteller eroverheen, vóór
  // de speler zelf de zolder op stapt. openingStap is de index in OPENING, of
  // null als de reeks niet loopt.
  //
  // Vijf stappen op drie beelden: sommige beelden dragen twee alinea's. Dat is
  // geen willekeur maar een maat — het onderschrift mag niet pagineren, want
  // dan bladert Enter door de tekst in plaats van door de reeks, en dat voelt
  // als vastlopen. Vijf korte beats passen elk in zes regels.
  var OPENING = [
    { scene: "opening-huis", alinea: 0 },
    { scene: "opening-trap", alinea: 1 },
    { scene: "opening-trap", alinea: 2 },
    { scene: "opening-pc", alinea: 3 },
    { scene: "opening-pc", alinea: 4 }
  ];
  var openingStap = null;

  // Tijd en tellers.
  var animTijd = 0;
  var laatsteTijd = 0;
  var accumulator = 0;

  // Staat de speler nú in een uitgangszone? De zone vuurt alleen op het moment
  // dat hij hem binnenkomt. Zonder die grendel zou een speler die van de
  // overkant precies in een zone wordt neergezet meteen weer terugstappen, en
  // dat is een lus die zichzelf voedt.
  var inUitgang = false;

  // De lopende opkomst van een nieuwe kamer, of null. Vorm: { soort, t: 0..1 },
  // waarbij t van 0 (nog zwart) naar 1 (volledig zichtbaar) loopt.
  var overgang = null;
  var OVERGANG_DUUR = 260;     // ms voor de opkomst van een nieuwe kamer

  var gecachet = {};           // welke scènes al in de gfx-cache staan
  var pcOverlay = null;        // de DOM-overlay van de gesimuleerde pc
  var pcCtx = null;            // engine-context voor de pc- en sim-controllers

  // ---- Storage-hulp (de enige localStorage-toegang) -----------------------

  function storage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function bewaar() {
    if (toestand) AL.world.opslaan(storage(), toestand);
  }

  // ---- Scènes --------------------------------------------------------------

  function haalScene(id) {
    var s = AL.scenes && AL.scenes[id];
    if (s) return s;
    // Terugvalscène, zodat de engine nooit crasht als een scène nog ontbreekt.
    return {
      id: id,
      picture: [["fill", 29]],
      walkboxes: [[20, 150, 280, 38]],
      entries: { start: [160, 175] },
      hotspots: [],
      props: []
    };
  }

  function zorgVoorScene(id) {
    if (gecachet[id]) return;
    AL.gfx.cacheScene(id, haalScene(id).picture);
    gecachet[id] = true;
  }

  function positioneerActor(scene, entryNaam) {
    var e = scene.entries[entryNaam] || scene.entries.start;
    if (!e) {
      var wb = scene.walkboxes[0];
      e = [wb[0] + Math.floor(wb[2] / 2), wb[1] + wb[3] - 1];
    }
    actorX = e[0];
    actorY = e[1];
    // Grendel de uitgangszone op de plek waar de speler landt. De lint verbiedt
    // een entry ín een zone, dus dit staat normaal op false; het is het vangnet
    // voor het geval iemand een entry verschuift.
    inUitgang = AL.loopveld.uitgangBij(scene, actorX, actorY) !== null;
  }

  function wisselNaarScene(id, entryNaam) {
    zorgVoorScene(id);
    if (toestand) toestand.sceneId = id;
    positioneerActor(haalScene(id), entryNaam || "start");
    if (toestand) { toestand.speler.x = actorX; toestand.speler.y = actorY; }
    loopt = false;
  }

  // Mag de speler hier staan? De meetkunde zelf staat in js/loopveld.js: de
  // walkboxes min de blokken (de voetafdrukken van de voorwerpen). Die splitsing
  // is er omdat de engine niet te testen valt zonder browser en de meetkunde
  // wél — en het is precies de meetkunde waar een fout onzichtbaar in wegzakt.
  function beloopbaar(scene, x, y) {
    return AL.loopveld.beloopbaar(scene, x, y);
  }

  // ---- Vensters en de resultaatvorm ---------------------------------------

  function syncBlokkeer() {
    // Typen mag enkel in de zolder-modus zonder open venster.
    //
    // Bewust NIET blokkeren tijdens een overgang: een geblokkeerde invoer slikt
    // aanslagen op, en een speler die tijdens het wegdraaien van het beeld al
    // zijn volgende commando intypt, zou dat commando kwijt zijn. De overgang
    // bevriest wél de beweging (zie tik), zodat de speler niet blind doorloopt.
    //
    // Een vraagvenster is de uitzondering: dat wacht juist op een getypt
    // antwoord. Zou het blokkeren, dan slikt het de letters op, dismisst de
    // spatie in "herbegin ja" het venster, en belandt de rest ("ja") als
    // onbegrepen commando in de invoerbalk.
    var vrij = (!titelActief && toestand && toestand.modus === "zolder" &&
      (!venster || venster.vraag));
    AL.input.blokkeer = !vrij;
  }

  // ---- Scène-overgangen ----------------------------------------------------

  // De overgang is bewust alléén een opkomst: de scène wisselt meteen, en het
  // nieuwe beeld komt daarna op uit het zwart.
  //
  // De voor de hand liggende variant — eerst dichtdraaien, dan wisselen, dan
  // opendraaien — is geprobeerd en weer weggehaald. Ze vraagt om de wissel uit
  // te stellen tot het dieptepunt, en dan loopt het wereldmodel achter op wat de
  // speler al getypt heeft: een tweede commando in dat halve seconde-venster
  // rekent nog met de oude kamer en landt in de verkeerde. Meteen wisselen en
  // alleen de opkomst tonen haalt die hele klasse fouten weg, kost niets aan
  // sfeer, en is precies wat de adventures van toen bij het betreden van een
  // kamer deden.
  function startOpkomst(soort) {
    overgang = { soort: soort || "fade", t: 0 };
  }

  function tikOvergang(delta) {
    if (!overgang) return;
    overgang.t += delta / OVERGANG_DUUR;
    if (overgang.t >= 1) overgang = null;
  }

  // Hoe dicht het scherm nu zit: 1 is helemaal zwart, 0 is open.
  function overgangDekking() {
    if (!overgang) return 0;
    return 1 - Math.max(0, Math.min(1, overgang.t));
  }

  function toonVenster(alineas, naDismiss, opties) {
    venster = AL.gfx.maakVenster(alineas, opties || {});
    naVenster = naDismiss || null;
    syncBlokkeer();
  }

  function verwerkResultaat(r, entryVoorKamer) {
    var effecten = r.effecten || [];
    var tekst = r.tekst || [];

    // Eerst toepassen — het wereldmodel loopt nooit achter op de speler — en
    // daarna de nieuwe kamer laten opkomen. Zonder dat is elke kamerwissel een
    // harde cut, het duidelijkste "webding"-signaal dat het spel afgaf.
    verwerkEffecten(effecten, entryVoorKamer);
    var heeftScene = false;
    var isVraag = false;
    for (var i = 0; i < effecten.length; i++) {
      if (effecten[i].indexOf("scene:") === 0) heeftScene = true;
      if (effecten[i] === "vraag") isVraag = true;
    }
    if (heeftScene && !titelActief) startOpkomst("fade");
    if (tekst.length > 0) toonVenster(tekst, null, { vraag: isVraag });
  }

  // ---- Effecttags (de volledige woordenlijst) -----------------------------

  function verwerkEffecten(effecten, entryVoorKamer) {
    for (var i = 0; i < effecten.length; i++) {
      var eff = effecten[i];
      var dp = eff.indexOf(":");
      var tag = dp === -1 ? eff : eff.substring(0, dp);
      var arg = dp === -1 ? "" : eff.substring(dp + 1);

      // --- Scène en navigatie ---
      if (tag === "scene") {
        wisselNaarScene(arg, entryVoorKamer || "start");
      } else if (tag === "betreed") {
        // Camera-hint; de entry is al door de engine gekozen. Geen extra actie.
      } else if (tag === "spread") {
        opADeSpread(arg);
      } else if (tag === "titel") {
        startTitel();
      } else if (tag === "fragment-gevonden") {
        AL.sound.speel("pagina");
        bewaar();

      // --- Gesimuleerde pc ---
      } else if (tag === "pc") {
        if (arg === "open") { opADePc(true); }
        else if (arg === "sluit") { opADePc(false); }
      } else if (tag === "editor" || tag === "terminal" || tag === "parsons") {
        // De pc-overlay heeft de puzzel al geladen; hier enkel de zachte cue.
        AL.sound.speel("toets");
      } else if (tag === "compileer") {
        AL.sound.speel("compileer");
      } else if (tag === "javac") {
        AL.sound.speel("fout");
      } else if (tag === "check") {
        AL.sound.speel(arg.indexOf("ok") === 0 ? "ok" : "fout");

      // --- Voortgang en level ---
      } else if (tag === "level-start") {
        bewaar();
      } else if (tag === "puzzle-af") {
        AL.sound.speel("ok"); bewaar();
      } else if (tag === "level-af") {
        AL.sound.speel("ok"); bewaar();
        // Level 7 af "voltooit" Alberta's spel en boot de sim (spelontwerp-
        // legacy.md, §"Endgame", stap 1→2). De rest van de keten (oordeel,
        // epiloog) loopt vanuit de sim-controller. We stellen de boot één tik
        // uit zodat de lopende puzzel-afronding (die na ctx.voltooi() nog
        // zetHandler(null) doet) eerst volledig afwikkelt; anders zou dat de
        // rauwe sim-handler meteen weer wissen.
        if (arg === "7") {
          var tBoot = toestand;
          setTimeout(function () {
            verwerkEffecten(AL.world.bootSim(tBoot).effecten, null);
          }, 0);
        }
      } else if (tag === "voortgang") {
        bewaar();
      } else if (tag === "oordeel") {
        toonOordeel(arg);

      // --- Hint ---
      } else if (tag === "hint") {
        AL.sound.speel(arg === "geen-meer" ? "fout" : "toets");

      // --- Endgame en sim ---
      } else if (tag === "sim") {
        if (arg === "boot") { AL.sound.speel("boot"); startSim(); }
        // sim:einde:<naam> wordt door de sim-controller zelf afgehandeld (die
        // roept AL.world.simVoltooid aan); hier is geen extra actie nodig.
      } else if (tag === "epiloog") {
        toonEpiloog();

      // --- Systeem ---
      } else if (tag === "geluid") {
        if (arg === "aan") {
          AL.sound.zetAan(true);
          startBedVoorStand();
          if (toestand) toestand.geluid = true;
          bewaar();
        }
        else if (arg === "uit") { AL.sound.zetAan(false); if (toestand) toestand.geluid = false; bewaar(); }
        else if (AL.sound.bedden.indexOf(arg) !== -1) { AL.sound.muziek(arg); }
        else { AL.sound.speel(arg); }
      } else if (tag === "vraag") {
        // Alleen een venstervorm: verwerkResultaat leest deze tag en houdt de
        // invoerbalk vrij. Hier valt niets te doen.
      } else if (tag === "crt") {
        var crtAan = (arg === "aan");
        if (toestand) toestand.crt = crtAan;
        zetCrt(crtAan);
        bewaar();
      } else if (tag === "herbegin") {
        voerHerbeginUit();
      } else if (tag === "gestopt") {
        if (toestand) toestand.gestopt = true;
      }
    }
  }

  // ---- Modus-overgangen ----------------------------------------------------

  function startTitel() {
    titelActief = true;
    venster = null;
    naVenster = null;
    AL.input.blokkeer = true;
    AL.sound.muziek("titel");
  }

  // Vanaf de titel: de openingsreeks, dan de zolder.
  //
  // Dit liep vroeger via een spread — de openingstekst stond dus op een
  // bladzijde van Alberta's notitieboek, mét haar koffievlek. Dat klopte niet:
  // je las wat er in het boek stond vóór je het boek gevonden had, en de tekst
  // was de verteller die jou aanspreekt op papier dat háár handschrift draagt.
  //
  // Nu: drie getekende beelden met de verteller eroverheen — het huis van
  // buiten, de trap naar boven, de monitor die nog nagloeit — en pas daarna
  // stapt de speler zelf de zolder op.
  function titelVerder() {
    titelActief = false;
    startOpening();
  }

  // De reeks aanzwengelen. Twee wegen komen hier binnen: de titelkaart, en een
  // herbegin — dat is een verse start en hoort de opening dus opnieuw te tonen
  // (workflow/19-de-opening.md). Escape slaat ze allebei over.
  function startOpening() {
    openingStap = 0;
    toonOpeningStap();
  }

  // Toon het beeld en de alinea van de huidige stap; is de reeks op, dan begint
  // het spel. Elk beeld komt op uit het zwart (de opkomst uit WP B).
  function toonOpeningStap() {
    if (openingStap === null || openingStap >= OPENING.length) {
      beeindigOpening();
      return;
    }
    var stap = OPENING[openingStap];
    zorgVoorScene(stap.scene);
    startOpkomst("fade");
    // Als onderschrift, niet als luik: het beeld is hier het punt.
    toonVenster([AL.strings.intro[stap.alinea]], function () {
      if (openingStap === null) return;      // al overgeslagen
      openingStap++;
      toonOpeningStap();
    }, { plaatsing: "onder", maxTekens: 38, maxRegels: 6 });
  }

  // De reeks overslaan of uitspelen komt op hetzelfde neer: de zolder in.
  function beeindigOpening() {
    openingStap = null;
    venster = null;
    naVenster = null;
    betreedZolder(true);
  }

  // Ga (of keer terug) naar de zolder-modus. beschrijf = toon de openings-
  // beschrijving (alleen bij een verse start).
  function betreedZolder(beschrijf) {
    toestand.modus = "zolder";
    verbergOverlay();
    spreadLevelId = null;
    wisselNaarScene(toestand.sceneId, "start");
    // Het zolderbed. Hetzelfde bed opnieuw starten doet niets, dus een
    // kamerwissel laat de loop gewoon doorlopen in plaats van hem te herstarten.
    AL.sound.muziek("ambient-zolder");
    bewaar();
    if (beschrijf) {
      var r = AL.world.kijk(toestand);
      toonVenster(r.tekst, null);
    } else {
      syncBlokkeer();
    }
  }

  // Open een notitieboek-spread (modus "spread"). De volledige spread-tekening en
  // -prose komen uit scene-spread-template.js (AL.spreads) en AL.strings.spreads;
  // de speler bladert met spatie/Enter en komt na de laatste pagina bij de pc.
  function opADeSpread(levelId) {
    toestand.modus = "spread";
    spreadLevelId = levelId;
    spreadPagina = 0;
    venster = null;
    naVenster = null;
    AL.input.blokkeer = true;
    AL.sound.speel("pagina");
    bewaar();
  }

  // Hoeveel pagina's het huidige spread telt.
  function spreadAantalPaginas() {
    var data = AL.strings.spreads && AL.strings.spreads[spreadLevelId];
    if (AL.spreads && data) return AL.spreads.aantalPaginas(data);
    return 1;
  }

  // Blader één pagina verder; op de laatste pagina eindigt het spread.
  function spreadBlader() {
    if (spreadPagina < spreadAantalPaginas() - 1) {
      spreadPagina++;
      AL.sound.speel("pagina");
    } else {
      spreadVerder();
    }
  }

  // Einde van een level-spread: de speler gaat naar de pc in de werkhoek
  // (spelontwerp-legacy.md, §"De lus per level", stap 3). De spread-modus draagt
  // sinds de opwaardering alleen nog de zeven level-spreads; de intro loopt niet
  // meer via een bladzijde van het notitieboek (zie titelVerder).
  function spreadVerder() {
    toestand.sceneId = "zolder-oost";
    betreedZolder(false);
  }

  // Toon of verberg de gesimuleerde-pc-overlay (DOM). De echte editor/terminal/
  // Parsons-inhoud leeft in js/pc/ (AL.pc); de engine schakelt de overlay in bij
  // pc:open en uit bij pc:sluit, en tekent de zolder eronder als achtergrond.
  function opADePc(open) {
    if (open) {
      // Eerst zíen dat het kind gaat zitten, dan pas de overlay. De pc-overlay
      // dekt het canvas volledig af, dus als ze meteen opengaat is er geen frame
      // waarin de animatie te zien is — hoe mooi ze ook is.
      //
      // De modus gaat wél meteen op "pc": daar hangen de invoerblokkering en de
      // save aan, en die horen niet een halve seconde achter te lopen op wat de
      // speler net heeft gedaan.
      toestand.modus = "pc";
      bewaar();
      richting = "oost";
      loopt = false;
      // Het warme bed start pas als de overlay opengaat, niet bij het zitten:
      // de wissel hoort samen te vallen met het moment dat het scherm het beeld
      // overneemt, want dát is waar de kamer van kou naar warmte gaat.
      startZitten(function () {
        AL.sound.muziek("pc");
        toonOverlay();
      });
    } else {
      verbergOverlay();
      betreedZolder(false);
    }
  }

  // Start de zit-reeks. Bestaat de anim niet (of is er geen spelerdefinitie),
  // dan wordt er niets uitgesteld: de klaar-functie loopt meteen. Zo kan het
  // spel nooit vasthangen op een ontbrekende sprite.
  function startZitten(klaar) {
    var def = AL.sprites && AL.sprites["speler"];
    if (!def || !def.anims["zit-oost"]) { klaar(); return; }
    zitStap = 0;
    zitTikTot = ZIT_TIKKEN;
    zitKlaar = klaar;
  }

  function voerHerbeginUit() {
    // Behoud de seed alleen bij een expliciete ?seed=N-run.
    var seed = (seedUitUrl !== null) ? seedUitUrl : undefined;
    toestand = AL.world.herbegin(storage(), seed);
    verbergOverlay();
    titelActief = false;
    venster = null;
    naVenster = null;
    // Niet rechtstreeks de zolder in: een herbegin die je meteen weer in
    // dezelfde hoek zet met één regel tekst, leest als een commando dat niets
    // deed. De openingsreeks is het duidelijkste bewijs dat het spel opnieuw
    // begonnen is — en ze is met Escape in één toets weg.
    startOpening();
  }

  // Boot de Seven Little Goats-simulatie in het terminalpaneel van de pc-overlay
  // (spelontwerp-legacy.md, §"Endgame", stap 2). Vervangt het WP-6-stub-pad: de
  // sim-controller draait de echte sim en roept bij een einde AL.world.simVoltooid
  // aan, wat via oordeel:<tier> en epiloog verder loopt.
  function startSim() {
    if (!(AL.sim && AL.sim.terminal && AL.pc && AL.pc.simView)) return;
    toestand.modus = "sim";
    if (pcOverlay) { pcOverlay.style.display = "flex"; }
    // Alberta's aankondiging staat als voorwoord boven de bootende sim.
    var voorwoord = [AL.strings.endgame.compleet, AL.strings.endgame.bootSim, ""];
    AL.sim.terminal.start(pcCtx, voorwoord);
    bewaar();
  }

  function toonOordeel(tier) {
    toestand.modus = "oordeel";
    toestand.einde = tier;
    venster = null;
    verbergOverlay();          // de sim/pc-overlay wijkt voor de oordeelkaart
    AL.input.blokkeer = true;
    // Het eindbed is eenmalig: het lost op en houdt dan op. Daarna is het stil,
    // en dat is het punt — de epiloog hoort geen muziek onder zich te hebben.
    AL.sound.muziek("einde");
    bewaar();
  }

  function toonEpiloog() {
    toestand.modus = "epiloog";
    venster = null;
    verbergOverlay();
    AL.input.blokkeer = true;
    bewaar();
  }

  // ---- Commando's uit de invoerbalk ---------------------------------------

  function opCommando(ruw) {
    if (titelActief || !toestand || toestand.modus !== "zolder") return;
    // Een gewoon venster slikt de invoer tot het weggeklikt is; een
    // vraagvenster wacht er juist op.
    if (venster && !venster.vraag) return;
    var invoer = ruw.trim();
    if (invoer === "") return;
    // De vraag is beantwoord — wat er ook getypt is. Het antwoord komt in de
    // plaats van de vraag, ook als het antwoord "kijk" is.
    venster = null;
    naVenster = null;
    var laag = invoer.toLowerCase();

    // Bij "ga <richting>" de entry aan de overkant kiezen (zoals de predecessor).
    var entry = null;
    if (laag.indexOf("ga ") === 0) {
      var r = laag.substring(3).trim();
      if (TEGENGESTELD[r]) entry = TEGENGESTELD[r];
    }
    var res = AL.parser.verwerk(toestand, invoer);
    verwerkResultaat(res, entry);
  }

  function opAdvance() {
    if (venster) {
      if (AL.gfx.heeftMeer(venster)) {
        AL.gfx.volgendePagina(venster);
      } else {
        var cb = naVenster;
        venster = null;
        naVenster = null;
        syncBlokkeer();
        if (cb) cb();
      }
      return;
    }
    if (titelActief) { titelVerder(); return; }
    if (!toestand) return;
    if (toestand.modus === "spread") { spreadBlader(); return; }
    if (toestand.modus === "oordeel") {
      verwerkEffecten(AL.world.startEpiloog(toestand).effecten, null);
      return;
    }
    if (toestand.modus === "epiloog") { naarTitelNaEpiloog(); return; }
  }

  // Van de epiloog terug naar de titelkaart. De epiloog sláát op (toonEpiloog),
  // de titel niet — dus wie na de aftiteling herlaadde, kreeg de epiloog
  // opnieuw voor zijn neus. De staat krijgt hier de modus "titel", zodat hervat
  // na een reload de titelkaart toont en niet de eindkaart. Enter op de titel
  // start daarna gewoon de openingsreeks (de save blijft intact: alle zeven
  // hoofdstukken staan er nog op af).
  function naarTitelNaEpiloog() {
    toestand.modus = "titel";
    bewaar();
    startTitel();
  }

  // Escape: een vraag intrekken, de openingsreeks overslaan, of de pc-overlay
  // sluiten.
  function opEscape() {
    // Een vraag hoort een uitweg te hebben die niets doet. Enter en spatie zijn
    // dat niet: die typen mee in het antwoord.
    if (venster && venster.vraag) {
      venster = null;
      naVenster = null;
      AL.input.regel = "";
      syncBlokkeer();
      return;
    }
    if (openingStap !== null) { beeindigOpening(); return; }
    if (!titelActief && toestand && toestand.modus === "pc") {
      opADePc(false);
    }
  }

  // ---- De logische tik (15 Hz) --------------------------------------------

  function tik() {
    animTijd += 1 / 15;
    AL.sound.tik();
    if (draaiTikken > 0) draaiTikken--;
    if (zitStap !== null) { loopt = false; tikZitten(); return; }
    if (titelActief || !toestand) return;
    if (venster) { loopt = false; return; }
    if (overgang) { loopt = false; return; }   // stilstaan terwijl het beeld wisselt
    if (toestand.modus !== "zolder") { loopt = false; return; }
    loopStap();
  }

  // De zit-reeks loopt op de logische tik en niet op een timer, zodat ze
  // meebeweegt met de rest van het spel en in een test deterministisch is.
  function tikZitten() {
    if (--zitTikTot > 0) return;
    zitStap++;
    zitTikTot = ZIT_TIKKEN;
    var def = AL.sprites && AL.sprites["speler"];
    var aantal = def ? def.anims["zit-oost"].frames.length : 3;
    if (zitStap < aantal) return;
    // Klaar: het laatste frame is gezet, nu mag de overlay het beeld overnemen.
    zitStap = null;
    var klaar = zitKlaar;
    zitKlaar = null;
    if (klaar) klaar();
  }

  function loopStap() {
    var r = AL.input.pijlRichting();
    if (!r) { loopt = false; return; }
    // Van de ene as naar de andere is een draai, niet een sprong. Binnen dezelfde
    // as (noord↔zuid, oost↔west) hoeft er niets: dan draait de figuur zich niet
    // om zijn as maar kijkt hij de andere kant op, en dat is één frame verschil.
    if (r !== richting && as(r) !== as(richting)) draaiTikken = 2;
    richting = r;
    toestand.speler.richting = r;

    var dx = 0, dy = 0;
    if (r === "noord") dy = -SNELHEID;
    else if (r === "zuid") dy = SNELHEID;
    else if (r === "west") dx = -SNELHEID;
    else dx = SNELHEID;

    var doelX = actorX + dx;
    var doelY = actorY + dy;

    var kruis = null;
    if (dx > 0 && doelX > 319) kruis = "oost";
    else if (dx < 0 && doelX < 0) kruis = "west";
    else if (dy < 0 && doelY < VELD_TOP) kruis = "noord";
    else if (dy > 0 && doelY > VELD_BOT) kruis = "zuid";

    if (kruis) {
      probeerOversteek(kruis);
      loopt = false;
      return;
    }

    var scene = haalScene(toestand.sceneId);
    var nx = actorX, ny = actorY;
    if (dx !== 0 && beloopbaar(scene, actorX + dx, actorY)) nx = actorX + dx;
    if (dy !== 0 && beloopbaar(scene, nx, actorY + dy)) ny = actorY + dy;
    loopt = (nx !== actorX || ny !== actorY);
    // Voetstappen op de tel van de loopcyclus: die draait op 8 fps met vier
    // frames, dus twee steunfases per halve seconde. Elke vierde tik is één stap,
    // en de twee varianten wisselen af — twee identieke stappen achter elkaar
    // klinken als een metronoom en niet als iemand die loopt.
    if (loopt) {
      if (stapTeller % 4 === 0) {
        AL.sound.speel((stapTeller % 8 === 0) ? "stap" : "stap-2");
      }
      stapTeller++;
    } else {
      stapTeller = 0;
    }
    actorX = nx;
    actorY = ny;
    toestand.speler.x = actorX;
    toestand.speler.y = actorY;

    // De uitgangszones. Noord en zuid zijn niet met een schermrand te doen: geen
    // enkele loopstrook raakt y8 of y189, en dat kán ook niet — een kamer die tot
    // bovenaan het beeld beloopbaar is, heeft geen achterwand meer. De trap is
    // daarom een zone in de vloer: wie erin stapt, gaat naar boven. Zonder
    // venster, zonder tweede toets.
    var uit = AL.loopveld.uitgangBij(scene, actorX, actorY);
    if (!uit) { inUitgang = false; return; }
    if (inUitgang) return;                  // al binnen: niet nog eens vuren
    inUitgang = true;
    probeerOversteek(uit);
    loopt = false;
  }

  function as(r) {
    return (r === "noord" || r === "zuid") ? "nz" : "ow";
  }

  // Een oversteek te voet: over een schermrand (oost/west) of door een
  // uitgangszone (noord/zuid). Lukt hij niet, dan gebeurt er níéts.
  //
  // Dat is een beslissing en geen vergetelheid. Tot nu toe opende een mislukte
  // oversteek "Die kant kan je niet op" in een modaal venster, en omdat élke
  // loopstrook van x0 tot x319 liep, kreeg de speler dat venster ongeveer elke
  // seconde te zien zodra hij tegen een geschilderde muur aan liep. Een muur
  // hoort te stoppen, niet te praten. De weigering blijft bestaan waar ze wél
  // een antwoord is: op het getypte "ga west" (AL.world.betreed via de parser),
  // want daar heeft de speler een vraag gesteld.
  //
  // De randen die op niets uitkomen zijn bovendien uit de walkboxes gehaald
  // (tools/lint-scene.mjs bewaakt dat), dus dit pad is de vangrail en niet de
  // dagelijkse gang van zaken.
  function probeerOversteek(kruis) {
    var r = AL.world.betreed(toestand, kruis);
    var heeftScene = false;
    for (var i = 0; i < r.effecten.length; i++) {
      if (r.effecten[i].indexOf("scene:") === 0) { heeftScene = true; break; }
    }
    if (!heeftScene) return;
    verwerkResultaat(r, TEGENGESTELD[kruis]);
    bewaar();
  }

  // ---- Tekenen -------------------------------------------------------------

  // Zet de lopende overgang over het beeld en toon het. Eén plek, zodat geen
  // enkele modus hem kan vergeten.
  function toonBeeld() {
    var dekking = overgangDekking();
    if (dekking > 0) AL.gfx.overgang(overgang.soort, dekking, 0);
    AL.gfx.present();
  }

  function render() {
    syncBlokkeer();

    if (titelActief) {
      tekenTitelKaart();
      if (venster) AL.gfx.tekenVenster(venster);
      toonBeeld();
      return;
    }

    // De openingsreeks: het beeld van deze stap, met de verteller erop.
    if (openingStap !== null) {
      var stap = OPENING[Math.min(openingStap, OPENING.length - 1)];
      zorgVoorScene(stap.scene);
      AL.gfx.blitScene(stap.scene);
      tekenOverslaanHint();
      if (venster) AL.gfx.tekenVenster(venster);
      toonBeeld();
      return;
    }

    var modus = toestand ? toestand.modus : "zolder";

    if (modus === "spread") {
      tekenSpread();
      toonBeeld();
      return;
    }
    if (modus === "oordeel") {
      tekenOordeelKaart();
      toonBeeld();
      return;
    }
    if (modus === "epiloog") {
      tekenEpiloogKaart();
      toonBeeld();
      return;
    }
    if (modus === "pc") {
      // De DOM-overlay dekt het canvas af; teken de zolder eronder als achtergrond.
      tekenZolder();
      toonBeeld();
      return;
    }

    // Zolder-modus.
    tekenZolder();
    if (venster) AL.gfx.tekenVenster(venster);
    toonBeeld();
  }

  function tekenZolder() {
    var id = toestand.sceneId;
    zorgVoorScene(id);
    AL.gfx.blitScene(id);
    var scene = haalScene(id);
    tekenSfeer(scene);
    tekenOverlays(scene, false);
    tekenPropsEnActor(scene);
    tekenOverlays(scene, true);
    tekenStatusbalk();
    tekenInvoerbalk();
  }

  // De props uit scene.hotspots en de speler, op volgorde van hun voet-y: wie
  // verder naar voren staat, wordt later getekend en dekt dus af wat erachter
  // staat. Dat is de painter's order uit de stijlgids, en het is de reden dat
  // deze sprites nu ook echt geblit worden — ze stonden vroeger in de gecachete
  // achtergrond gebakken, waardoor geen enkel voorwerp ooit van staat kon
  // veranderen.
  function tekenPropsEnActor(scene) {
    var lijst = [];
    var hs = scene.hotspots || [];
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      var def = AL.sprites && AL.sprites[h.sprite];
      if (!def) continue;
      var anim = h.anim || "idle";
      if (!def.anims[anim]) anim = "idle";
      lijst.push({ y: h.y, def: def, anim: anim, x: h.x, spiegel: !!h.spiegel });
    }
    lijst.push({ y: actorY, speler: true });
    lijst.sort(function (a, b) { return a.y - b.y; });

    for (var j = 0; j < lijst.length; j++) {
      var e = lijst[j];
      if (e.speler) { tekenActor(); continue; }
      var fps = e.def.anims[e.anim].fps || 0;
      var frame = fps > 0 ? Math.floor(animTijd * fps) : 0;
      AL.gfx.tekenSprite(e.def, e.anim, frame, e.x, e.y, { spiegel: e.spiegel });
    }
  }

  // De sfeerlaag: het enige dat in een kamer beweegt. Wordt ná de scène-blit
  // getekend, want de scène zelf is gecachet en wordt als geheel gekopieerd.
  //
  // scene.sfeer: [{ soort: "stof", x, y, b, h, aantal, kleur, seed, snelheid }]
  function tekenSfeer(scene) {
    var lijst = scene.sfeer || [];
    for (var i = 0; i < lijst.length; i++) {
      if (lijst[i].soort === "stof") tekenStof(lijst[i]);
    }
  }

  // Stof in de lichtstraal. Elk deeltje heeft een vaste startplek uit de
  // deterministische ruis en zakt traag; de val loopt rond, zodat er geen begin
  // of eind aan zit. De stijlgids vraagt hier al om ("stof in de lichtstraal"),
  // en het was tot nu toe acht stilstaande pixels in de gecachete achtergrond.
  function tekenStof(o) {
    var aantal = o.aantal || 18;
    var kleur = (o.kleur === undefined) ? 34 : o.kleur;
    var seed = o.seed || 1;
    var snelheid = o.snelheid || 0.02;
    for (var i = 0; i < aantal; i++) {
      var fx = AL.gfx.ruis(i, 1, seed);
      var fy = AL.gfx.ruis(i, 2, seed);
      var traag = 0.5 + AL.gfx.ruis(i, 3, seed);      // niet alles even snel
      var t = (fy + animTijd * snelheid * traag) % 1;
      // Een beetje zijwaartse drift, zodat het niet als regen valt.
      var drift = Math.sin((animTijd * 0.4) + i) * 2;
      var px = Math.round(o.x + fx * o.b + drift);
      var py = Math.round(o.y + t * o.h);
      AL.gfx.px(px, py, kleur);
    }
  }

  // De voorgrondlaag (painter's order, art-stijlgids.md). Een overlay is
  // { baselineY, ops }: de voet van het voorwerp staat op baselineY. Staat de
  // speler verder naar achter dan die voet, dan hoort het voorwerp vóór hem —
  // dan pas loopt hij er echt achterlangs in plaats van er bovenop.
  function tekenOverlays(scene, voorSpeler) {
    var ov = scene.overlays || [];
    for (var i = 0; i < ov.length; i++) {
      var o = ov[i];
      if (!o || !o.ops) continue;
      var staatVoor = (o.baselineY > actorY);
      if (staatVoor === voorSpeler) AL.gfx.tekenPicture(o.ops);
    }
  }

  function tekenActor() {
    var def = AL.sprites && AL.sprites["speler"];
    if (!def) return;
    var animNaam = actorAnim();
    var anim = def.anims[animNaam];
    if (!anim) return;
    var frame;
    if (zitStap !== null) {
      frame = Math.min(zitStap, anim.frames.length - 1);
    } else if (animNaam === "draai") {
      frame = 0;
    } else {
      var fps = anim.fps || 0;
      frame = fps > 0 ? Math.floor(animTijd * fps) : 0;
    }
    AL.gfx.tekenSprite(def, animNaam, frame, actorX, actorY, {
      spiegel: richting === "west",
      schaal: actorSchaal()
    });
  }

  function actorAnim() {
    if (zitStap !== null) return "zit-oost";
    if (draaiTikken > 0) return "draai";
    var voorvoegsel = loopt ? "loop-" : "sta-";
    if (richting === "west") return voorvoegsel + "oost";   // west = gespiegeld oost
    return voorvoegsel + richting;
  }

  // Diepteschaal: wie verder naar achter staat, is kleiner. De stijlgids vraagt
  // dit expliciet en zegt ook hoe hard — "houd het subtiel, rond 0,8 achteraan".
  //
  // De schaal loopt over de bewandelbare strook van de scène zelf, niet over een
  // vast getal: elke kamer heeft haar eigen loopstrook, en een vaste bovengrens
  // zou in de ene kamer te veel en in de andere niets doen. Achteraan 0,84,
  // vooraan 1. Op een figuur van vijfentwintig pixels is dat vier pixels verschil
  // over de diepte van de kamer — genoeg om te zien, te weinig om te betrappen.
  function actorSchaal() {
    var scene = toestand ? haalScene(toestand.sceneId) : null;
    var boxen = scene && scene.walkboxes;
    if (!boxen || boxen.length === 0) return 1;
    var boven = Infinity, onder = -Infinity;
    for (var i = 0; i < boxen.length; i++) {
      if (boxen[i][1] < boven) boven = boxen[i][1];
      var bot = boxen[i][1] + boxen[i][3] - 1;
      if (bot > onder) onder = bot;
    }
    if (onder <= boven) return 1;
    var t = (onder - actorY) / (onder - boven);       // 0 vooraan, 1 achteraan
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return 1 - 0.16 * t;
  }

  // Rechtsboven tijdens de openingsreeks: dat Escape hem overslaat. Wie
  // herbegint wil dit niet vijf keer zien.
  //
  // Met een eigen donkere plaat eronder. De drie beelden hebben een heel
  // verschillende achtergrond op die plek — schemerlucht, een verlicht gat,
  // zwart — en zonder plaat valt de hint op minstens één ervan weg. Zelfde les
  // als bij de titelkaart: contrast garandeer je, je hoopt er niet op.
  function tekenOverslaanHint() {
    var hint = AL.strings.openingOverslaan;
    var b = AL.gfx.proseBreedte(hint);
    var x = 320 - b - 6;
    AL.gfx.rect(28, x - 3, 9, b + 6, 12);
    AL.gfx.tekenProse(hint, x, 11, 33);
  }

  // Statusbalk (rij 0..7): scène-naam op avondblauw.
  // Statusbalk (rij 0..7) en invoerbalk (rij 190..199). Ze waren allebei één
  // platte strook in kleur 28 met tekst erop. Nu zijn het de twee lijsten van
  // het beeldkader: gebeitst hout met een verloop, een lichte rand aan de kant
  // waar het licht vandaan komt en een donkere aan de andere. Daardoor lijkt het
  // speelveld erin te liggen in plaats van erboven te zweven.
  //
  // De kamernaam blijft monospace: hij hoort bij de chroom, niet bij de prose.
  function tekenStatusbalk() {
    AL.gfx.gradient(24, 23, 0, 0, 320, 8, "v");
    AL.gfx.noise(22, 0.10, 81, [0, 0, 319, 0, 319, 7, 0, 7]);
    AL.gfx.line(26, [0, 0, 319, 0]);
    AL.gfx.line(22, [0, 7, 319, 7]);
    var scene = AL.strings.scenes[toestand.sceneId];
    var naam = scene ? scene.naam : "Zolder";
    AL.gfx.tekenTekst(naam, 3, 0, 34, null);
  }

  // Invoerbalk: "> " plus de getypte regel en een blokcursor.
  function tekenInvoerbalk() {
    AL.gfx.gradient(23, 24, 0, 190, 320, 10, "v");
    AL.gfx.noise(22, 0.10, 82, [0, 190, 319, 190, 319, 199, 0, 199]);
    AL.gfx.line(26, [0, 190, 319, 190]);
    AL.gfx.line(22, [0, 191, 319, 191]);
    var prompt = "> " + AL.input.regel;
    AL.gfx.tekenTekst(prompt, 3, 192, 34, null);
    if (!AL.input.blokkeer && Math.floor(animTijd * 2) % 2 === 0) {
      var cx = 3 + prompt.length * 8;
      if (cx <= 312) AL.gfx.rect(34, cx, 192, 7, 7);
    }
  }

  // ---- Titel-, spread-, oordeel- en epiloogkaart --------------------------

  // De titelkaart. De tekening zelf is een gewone scène geworden
  // (js/scenes/scene-titelkaart.js), zoals art-stijlgids.md hem al als bindende
  // scène-id noemde; hier komt alleen het letterwerk erop, want dat moet op de
  // donkere plaat vallen die in die scène al klaarligt.
  function tekenTitelKaart() {
    zorgVoorScene("titelkaart");
    AL.gfx.blitScene("titelkaart");
    tekenSfeer(haalScene("titelkaart"));

    // De titel in twee lagen: een kleine bovenregel en de naam groot eronder.
    // Op één regel past "THE LEGACY OF ALBERTA" op geen enkele leesbare schaal
    // binnen 320 px — bij schaal 2 is het al 378 px breed en valt het er links
    // en rechts af.
    gecentreerdeTekst(AL.strings.titelBoven, 72, 33);
    var logoOpts = { schaal: 3, boven: 34, onder: 32, rand: 22 };
    var b = AL.gfx.logoBreedte(AL.strings.titelGroot, logoOpts);
    AL.gfx.tekenLogo(AL.strings.titelGroot, Math.floor((320 - b) / 2), 86,
      logoOpts);

    gecentreerdeTekst(AL.strings.ondertitel, 116, 33);

    // De "druk op Enter"-regel staat níét op de plaat maar op de vloer, dwars
    // door de landing van de straal. Daar helpt geen kleurkeuze: die vloer is
    // op de ene plek donker hout en op de andere belicht hout. Ze krijgt dus
    // dezelfde omtreklijn als het logo — dan leest ze op allebei.
    if (!venster) {
      var enterOpts = { schaal: 1, boven: 33, onder: 32, rand: 22 };
      var eb = AL.gfx.logoBreedte(AL.strings.drukEnter, enterOpts);
      AL.gfx.tekenLogo(AL.strings.drukEnter, Math.floor((320 - eb) / 2), 166,
        enterOpts);
    }
  }

  // De notitieboek-spread, full-screen. De papier-achtergrond komt uit
  // scene-spread-template.js; AL.spreads legt de handschrift-inhoud van de
  // huidige pagina erop, uit het data-object AL.strings.spreads[spreadLevelId].
  function tekenSpread() {
    AL.gfx.rect(35, 0, 0, 320, 200);            // vol-schermse papierschaduwrand
    var tpl = AL.scenes && AL.scenes["spread-template"];
    if (tpl) AL.gfx.tekenPicture(tpl.picture);
    var data = AL.strings.spreads && AL.strings.spreads[spreadLevelId];
    if (AL.spreads && data) {
      AL.spreads.tekenInhoud(AL.gfx, data, spreadPagina, toestand.seed,
        spreadLevelId);
    }
    // Bladerhint onderaan de línkerbladzijde, rechts uitgelijnd tegen de rug.
    // Ze stond rechtsonder, en dat botste met Alberta's weekregel zodra die over
    // twee regels ging — wat sinds het handschrift proportioneel gezet wordt
    // altijd zo is. De onderrand van het rechterblad is nu van haar; het
    // linkerblad draagt de chroom (bladwijzer links, hint rechts ertegenaan).
    // De laatste-pagina-versie zei "spatie: pc >", en dat klopte maar half: de
    // spatie doet het boek dicht en zet je in de werkhoek — de pc gaat pas open
    // als je daar 'ga zitten' typt. De teksten staan nu in AL.strings.spread.
    var laatste = spreadPagina >= spreadAantalPaginas() - 1;
    var hint = laatste ? AL.strings.spreadChroom.bladerLaatste
      : AL.strings.spreadChroom.bladerVerder;
    var rechterrand = AL.spreads ? (AL.spreads.BLAD.linksX + AL.spreads.BLAD.kolomB)
      : 152;
    AL.gfx.tekenTekst(hint, rechterrand - hint.length * 8, 178, 40, null);
  }

  // De eindkaart draagt zowel Alberta's oordeel als de epiloog (één scène, twee
  // teksten). De achtergrond komt uit scene-eindkaart.js; de tekst legt de engine
  // erop in een papieren venster.
  function tekenEindkaartAchtergrond() {
    zorgVoorScene("eindkaart");
    AL.gfx.blitScene("eindkaart");
    tekenSfeer(haalScene("eindkaart"));
  }

  // De kop van een eindkaart, op een papieren band over de volle breedte. De
  // eindkaart is donker aan de randen en licht in de straal; inkt (41) zonder
  // band valt links en rechts dus gewoon weg. De band garandeert het contrast en
  // leest meteen als het titelvlak van een eindkaart.
  function tekenKaartTitel(tekst, y) {
    var h = AL.font.hoogte;
    AL.gfx.rect(36, 0, y - 4, 320, h + 8);
    AL.gfx.line(40, [0, y - 4, 319, y - 4]);
    AL.gfx.line(40, [0, y + h + 3, 319, y + h + 3]);
    gecentreerdeTekst(tekst, y, 41);
  }

  function tekenOordeelKaart() {
    tekenEindkaartAchtergrond();
    var tier = toestand.einde || "vakvrouw";
    var o = AL.strings.oordeel[tier] || AL.strings.oordeel.vakvrouw;
    tekenKaartTitel(o.titel, 20);
    var v = AL.gfx.maakVenster([o.tekst, "(Enter: de epiloog)"],
      { maxTekens: 32 });
    AL.gfx.tekenVenster(v);
  }

  function tekenEpiloogKaart() {
    tekenEindkaartAchtergrond();
    var ep = AL.strings.epiloog;
    tekenKaartTitel(ep.titel, 16);
    var alineas = ep.alineas.slice();
    alineas.push("(Enter: naar de titel)");
    var v = AL.gfx.maakVenster(alineas, { maxTekens: 34, maxRegels: 12 });
    AL.gfx.tekenVenster(v);
  }

  // Gecentreerde prose. Meet in pixels, niet in tekens × 8: sinds de prose
  // proportioneel gezet wordt, is een regel van dertien tekens geen 104 px meer
  // en zou de oude rekensom alles een stuk naar rechts schuiven.
  function gecentreerdeTekst(tekst, y, kleur) {
    var x = Math.floor((320 - AL.gfx.proseBreedte(tekst)) / 2);
    AL.gfx.tekenProse(tekst, x, y, kleur);
  }

  // ---- Pc-overlay (delegatie naar AL.pc) ----------------------------------

  function toonOverlay() {
    if (AL.pc && AL.pc.open && toestand) AL.pc.open(toestand);
  }

  function verbergOverlay() {
    if (AL.pc && AL.pc.close) AL.pc.close();
    else if (pcOverlay) pcOverlay.style.display = "none";
  }

  // Zet de CSS-variabelen van de pc-chrome af uit het palet (AL.palet.HEX), zodat
  // de DOM-overlay dezelfde kleuren draagt als de canvas-renderer (art-stijlgids.md,
  // gloed-/papier-ramp). De brug leeft hier omdat de engine als enige de DOM raakt.
  function injecteerPaletVars() {
    if (!AL.palet || !AL.palet.HEX || !document.documentElement) return;
    var H = AL.palet.HEX;
    var stijl = document.documentElement.style;
    var kaart = {
      "--pc-kast": 54, "--pc-rand": 55, "--pc-amber": 56,
      "--pc-amber-licht": 57, "--pc-schermwit": 58,
      "--pc-papier-schaduw": 35, "--pc-papier": 37, "--pc-papier-hoog": 38,
      "--pc-inkt": 41, "--pc-hout": 24, "--pc-hout-licht": 26,
      "--pc-groen": 45, "--pc-rood": 12, "--pc-steen": 50
    };
    for (var k in kaart) { if (H[kaart[k]]) stijl.setProperty(k, H[kaart[k]]); }
  }

  // ---- Lus en boot ---------------------------------------------------------

  function lus(nu) {
    if (!laatsteTijd) laatsteTijd = nu;
    var delta = nu - laatsteTijd;
    laatsteTijd = nu;
    if (delta > 250) delta = 250;
    accumulator += delta;
    while (accumulator >= TIK_MS) {
      tik();
      accumulator -= TIK_MS;
    }
    // De overgang loopt op echte tijd, niet op de logische tik: hij moet vloeiend
    // zijn, en 15 Hz is daar te grof voor.
    tikOvergang(delta);
    render();
    requestAnimationFrame(lus);
  }

  // Het logische scherm is 320×200, maar een VGA-monitor toonde mode 13h op 4:3:
  // de pixels waren dus niet vierkant, ze waren 20 % hoger dan breed. Vandaar
  // twee gehele schaalfactoren in plaats van één. (320·sx)/(200·sy) = 4/3 vraagt
  // sx/sy = 5/6, dus exact klopt het pas bij 1600×1200 — lang niet elk venster.
  //
  // Twee gehele factoren houden elke pixelrij even hoog; een gebroken factor zou
  // rijen ongelijk maken en zichtbaar gaan glinsteren. Past 5:6 niet, dan kiezen
  // we het best passende paar: eerst de kleinste afwijking van 4:3, bij gelijke
  // afwijking liever te breed dan te smal (te smal rekt alles uit en oogt kapot,
  // te breed leest hooguit als breedbeeld), en dan pas het grootste beeld.
  // De CRT-laag hangt aan een data-attribuut op <html>; de opmaak zelf staat in
  // css/style.css. Standaard aan.
  function zetCrt(aan) {
    if (!document.documentElement) return;
    if (aan) document.documentElement.removeAttribute("data-crt");
    else document.documentElement.setAttribute("data-crt", "uit");
  }

  var DOELVERHOUDING = 4 / 3;

  function berekenSchaal() {
    var maxX = Math.max(1, Math.floor(window.innerWidth / BREEDTE));
    var maxY = Math.max(1, Math.floor(window.innerHeight / HOOGTE));
    var besteX = 1, besteY = 1;
    var besteFout = Infinity, besteOpp = 0, besteBreed = false;
    for (var sy = 1; sy <= maxY; sy++) {
      for (var sx = 1; sx <= maxX; sx++) {
        var verhouding = (BREEDTE * sx) / (HOOGTE * sy);
        var fout = Math.abs(verhouding - DOELVERHOUDING);
        var breed = verhouding >= DOELVERHOUDING;
        var opp = sx * sy;
        var beter;
        if (fout < besteFout - 0.0001) {
          beter = true;
        } else if (fout < besteFout + 0.0001) {
          beter = (breed !== besteBreed) ? breed : (opp > besteOpp);
        } else {
          beter = false;
        }
        if (beter) {
          besteX = sx; besteY = sy;
          besteFout = fout; besteOpp = opp; besteBreed = breed;
        }
      }
    }
    var stijl = document.documentElement.style;
    stijl.setProperty("--schaal-x", besteX);
    stijl.setProperty("--schaal-y", besteY);
  }

  // Lees ?seed=N (geheel getal) uit de URL, of null.
  function leesSeed() {
    try {
      var m = /[?&]seed=(-?\d+)/.exec(window.location.search || "");
      if (m) return parseInt(m[1], 10) | 0;
    } catch (e) { /* niets */ }
    return null;
  }

  function boot() {
    var canvas = document.getElementById("scherm");
    AL.gfx.init(canvas);
    pcOverlay = document.getElementById("pc-overlay");
    injecteerPaletVars();
    pcCtx = {
      emit: function (eff) { verwerkEffecten(eff, null); },
      bewaar: bewaar,
      getToestand: function () { return toestand; }
    };
    if (AL.pc && AL.pc.init) {
      AL.pc.init(pcOverlay, pcCtx);
    }
    verbergOverlay();
    berekenSchaal();
    window.addEventListener("resize", berekenSchaal);

    AL.input.init();
    AL.input.onSubmit = opCommando;
    AL.input.onAdvance = opAdvance;
    AL.input.onEscape = opEscape;

    seedUitUrl = leesSeed();

    // Was er een save? Zo ja, hervat direct; zo niet, start met de titelkaart.
    var st = storage();
    var hadSave = false;
    try { hadSave = !!(st && st.getItem(AL.world.SAVE_SLEUTEL)); }
    catch (e) { hadSave = false; }

    toestand = AL.world.laad(st, seedUitUrl === null ? undefined : seedUitUrl);
    if (seedUitUrl !== null) toestand.seed = seedUitUrl;    // ?seed overschrijft altijd
    AL.sound.zetAan(toestand.geluid !== false);
    zetCrt(toestand.crt !== false);

    if (hadSave) {
      // Hervat in de opgeslagen modus.
      titelActief = false;
      hervat();
    } else {
      startTitel();
    }
    requestAnimationFrame(lus);
  }

  // Herstel de renderstand voor de opgeslagen modus (na een reload).
  // Welk muziekbed hoort bij de stand waarin het spel nu staat? Eén plek die dat
  // beslist, want er zijn drie momenten waarop het antwoord nodig is: bij een
  // moduswissel, na een reload, en als de speler het geluid weer aanzet.
  //
  // Dat laatste was een echte fout: "geluid uit" vergeet het bed (dat moet, want
  // anders blijft er iets doorlopen waar niemand naar luistert), maar "geluid
  // aan" zette alleen de meestergain terug. Op de zolder bleef het daarna stil
  // tot je van kamer wisselde.
  function startBedVoorStand() {
    if (titelActief) { AL.sound.muziek("titel"); return; }
    var modus = toestand ? toestand.modus : null;
    if (modus === "pc" || modus === "sim") AL.sound.muziek("pc");
    else if (modus === "oordeel" || modus === "epiloog") AL.sound.muziek(null);
    else AL.sound.muziek("ambient-zolder");
  }

  function hervat() {
    var modus = toestand.modus;
    // Een save die op de titelkaart staat (na de epiloog) hervat op de
    // titelkaart. startTitel zet titelActief weer aan; startBedVoorStand
    // hieronder kiest daar het titelbed bij.
    if (modus === "titel") { startTitel(); }
    else if (modus === "pc") { wisselNaarScene(toestand.sceneId, "start"); toonOverlay(); }
    else if (modus === "spread") { /* de spread hertekent uit spreadLevelId */
      spreadLevelId = "l" + (toestand.levelActief || 1);
      spreadPagina = 0;
      wisselNaarScene(toestand.sceneId, "start");
    } else if (modus === "oordeel" || modus === "epiloog") {
      wisselNaarScene(toestand.sceneId, "start");
    } else if (modus === "sim") {
      // De sim-substaat wordt niet mee-opgeslagen (engine-architectuur.md); een
      // reload midden in het eindspel herstart de sim gewoon van voren af.
      wisselNaarScene(toestand.sceneId, "start");
      startSim();
    } else {
      betreedZolder(false);
    }
    startBedVoorStand();
    syncBlokkeer();
  }

  // ---- Debughaken (voor de Playwright-smoketest) --------------------------

  Object.defineProperty(AL, "debugState", {
    get: function () {
      return {
        titelActief: titelActief,
        openingActief: openingStap !== null,
        openingStap: openingStap,
        modus: toestand ? toestand.modus : null,
        sceneId: toestand ? toestand.sceneId : null,
        seed: toestand ? toestand.seed : null,
        levelActief: toestand ? toestand.levelActief : null,
        hintsTotaal: toestand ? toestand.hintsTotaal : null,
        spreadLevelId: spreadLevelId,
        spreadPagina: spreadPagina,
        einde: toestand ? toestand.einde : null,
        actorX: Math.round(actorX),
        actorY: Math.round(actorY),
        vensterOpen: !!venster,
        // Wacht het venster op een getypt antwoord? Dan blijft de invoerbalk
        // vrij en klikt een toets het niet weg.
        vensterVraag: !!(venster && venster.vraag),
        // De regels van de huidige bladzijde van het open venster. De
        // rooksmaaktest leest hiermee wát de verteller antwoordt (bv. of de
        // '?'-hint bij de spelstand past) in plaats van alleen dát hij iets zegt.
        vensterRegels: (venster && venster.paginas)
          ? venster.paginas[venster.huidige].slice() : [],
        overlayOpen: !!(pcOverlay && pcOverlay.style.display !== "none"),
        // Loopt de zit-animatie? De modus staat dan al op "pc" terwijl de overlay
        // nog dicht is — een test die op het paneel wacht, hoort op overlayOpen
        // te wachten en niet op de modus.
        zitAnimatie: zitStap !== null
      };
    }
  });

  Object.defineProperty(AL, "debugToestand", {
    get: function () { return toestand; }
  });

  // advance is publiek zodat touch.js een schermtik kan laten doorbladeren
  // (berichtvenster, titelkaart, spread, oordeel) zonder toetsenbord.
  AL.engine = { boot: boot, advance: opAdvance };

  // Testhulp: spring rechtstreeks naar de zolder (slaat titel en intro over).
  AL.debugStartZolder = function () {
    titelActief = false;
    if (!toestand) toestand = AL.world.nieuw(seedUitUrl === null ? undefined : seedUitUrl);
    betreedZolder(true);
  };

  // Testhulp: sla een bepaalde bladzijde van een bepaald notitieboek-spread op.
  // Alle veertien bladzijden nalopen door het spel te spelen kost zeven levels;
  // dit is de haak waarmee de rooksmaaktest ze allemaal in één run kan bekijken.
  AL.debugSpread = function (levelId, pagina) {
    titelActief = false;
    openingStap = null;
    venster = null; naVenster = null;
    if (!toestand) {
      toestand = AL.world.laad(storage(), seedUitUrl === null ? undefined : seedUitUrl);
    }
    toestand.modus = "spread";
    spreadLevelId = levelId;
    spreadPagina = pagina | 0;
    syncBlokkeer();
  };

  // Testhulp (dev): spring rechtstreeks in de pc bij een gegeven level (0 = de
  // proefdruk uit js/levels/level0.js). Ontgrendelt dat level, zet het actief en
  // opent de overlay. Bedoeld voor de Playwright-smoketest met ?dev=1.
  AL.debugStartPc = function (n) {
    titelActief = false;
    venster = null; naVenster = null;
    if (!toestand) {
      toestand = AL.world.laad(storage(), seedUitUrl === null ? undefined : seedUitUrl);
      if (seedUitUrl !== null) toestand.seed = seedUitUrl;
    }
    n = (n === undefined || n === null) ? 0 : (n | 0);
    var lvl = toestand.levels[String(n)];
    if (lvl) lvl.ontgrendeld = true;
    toestand.levelActief = n;
    wisselNaarScene(toestand.sceneId, "start");
    opADePc(true);
  };

  // Testhulp (dev): de endgame-sequence na level 7 zonder de echte sim (WP 9).
  // Simuleert een "sim klaar"-trigger en toont Alberta's oordeel; van daaruit
  // brengt Enter de speler naar de epiloog. Bedoeld voor de rooksmaaktest.
  AL.debugSimVoltooid = function (eindeNaam) {
    if (!toestand) return;
    verwerkEffecten(AL.world.simVoltooid(toestand, eindeNaam || "wraak").effecten,
      null);
  };

  window.addEventListener("load", boot);

})();
