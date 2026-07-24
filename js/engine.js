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
  var KANT_COOLDOWN = 1.0;     // rustpauze na "die kant kan je niet op" (s)

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

  var venster = null;          // het open berichtvenster, of null
  var naVenster = null;        // wat te doen als het venster wegvalt

  var spreadLevelId = null;    // welke spread nu open staat (modus "spread")
  var spreadPagina = 0;        // huidige pagina binnen de open spread

  // Tijd en tellers.
  var animTijd = 0;
  var laatsteTijd = 0;
  var accumulator = 0;
  var kantCooldownTot = 0;
  var laatsteKantOp = null;

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
  }

  function wisselNaarScene(id, entryNaam) {
    zorgVoorScene(id);
    if (toestand) toestand.sceneId = id;
    positioneerActor(haalScene(id), entryNaam || "start");
    if (toestand) { toestand.speler.x = actorX; toestand.speler.y = actorY; }
    loopt = false;
  }

  function inWalkbox(scene, x, y) {
    var boxen = scene.walkboxes;
    for (var i = 0; i < boxen.length; i++) {
      var b = boxen[i];
      if (x >= b[0] && x <= b[0] + b[2] - 1 &&
          y >= b[1] && y <= b[1] + b[3] - 1) {
        return true;
      }
    }
    return false;
  }

  // ---- Vensters en de resultaatvorm ---------------------------------------

  function syncBlokkeer() {
    // Typen mag enkel in de zolder-modus zonder open venster.
    var vrij = (!titelActief && toestand && toestand.modus === "zolder" &&
      !venster);
    AL.input.blokkeer = !vrij;
  }

  function toonVenster(alineas, naDismiss) {
    venster = AL.gfx.maakVenster(alineas, {});
    naVenster = naDismiss || null;
    syncBlokkeer();
  }

  function verwerkResultaat(r, entryVoorKamer) {
    verwerkEffecten(r.effecten || [], entryVoorKamer);
    var tekst = r.tekst || [];
    if (tekst.length > 0) {
      toonVenster(tekst, null);
    }
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
        if (arg === "aan") { AL.sound.zetAan(true); if (toestand) toestand.geluid = true; bewaar(); }
        else if (arg === "uit") { AL.sound.zetAan(false); if (toestand) toestand.geluid = false; bewaar(); }
        else { AL.sound.speel(arg); }
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
    AL.sound.speel("titel");
  }

  // Vanaf de titel: de intro-spread (spelontwerp-legacy.md: titel → spread:intro
  // → zolder). De intro-spread draagt de kernfictie en de verplichte prototype-
  // regel; na de laatste pagina komt de speler in de zolder terecht.
  function titelVerder() {
    titelActief = false;
    opADeSpread("intro");
  }

  // Ga (of keer terug) naar de zolder-modus. beschrijf = toon de openings-
  // beschrijving (alleen bij een verse start).
  function betreedZolder(beschrijf) {
    toestand.modus = "zolder";
    verbergOverlay();
    spreadLevelId = null;
    wisselNaarScene(toestand.sceneId, "start");
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

  // Einde van het spread: de intro leidt naar de eerste zolderscène (met
  // beschrijving); een level-spread leidt de speler naar de pc in de werkhoek
  // (spelontwerp-legacy.md, §"De lus per level", stap 3).
  function spreadVerder() {
    if (spreadLevelId === "intro") {
      betreedZolder(true);
      return;
    }
    toestand.sceneId = "zolder-oost";
    betreedZolder(false);
  }

  // Toon of verberg de gesimuleerde-pc-overlay (DOM). De echte editor/terminal/
  // Parsons-inhoud leeft in js/pc/ (AL.pc); de engine schakelt de overlay in bij
  // pc:open en uit bij pc:sluit, en tekent de zolder eronder als achtergrond.
  function opADePc(open) {
    if (open) {
      toestand.modus = "pc";
      toonOverlay();
      bewaar();
    } else {
      verbergOverlay();
      betreedZolder(false);
    }
  }

  function voerHerbeginUit() {
    // Behoud de seed alleen bij een expliciete ?seed=N-run.
    var seed = (seedUitUrl !== null) ? seedUitUrl : undefined;
    toestand = AL.world.herbegin(storage(), seed);
    verbergOverlay();
    titelActief = false;
    betreedZolder(true);
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
    if (titelActief || !toestand || toestand.modus !== "zolder" || venster) return;
    var invoer = ruw.trim();
    if (invoer === "") return;
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
    if (toestand.modus === "epiloog") { startTitel(); return; }
  }

  // Escape sluit de pc-overlay (terug naar de zolder).
  function opEscape() {
    if (!titelActief && toestand && toestand.modus === "pc") {
      opADePc(false);
    }
  }

  // ---- De logische tik (15 Hz) --------------------------------------------

  function tik() {
    animTijd += 1 / 15;
    if (titelActief || !toestand) return;
    if (venster) { loopt = false; return; }
    if (toestand.modus !== "zolder") { loopt = false; return; }
    loopStap();
  }

  function loopStap() {
    var r = AL.input.pijlRichting();
    if (!r) { loopt = false; return; }
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
    if (dx !== 0 && inWalkbox(scene, actorX + dx, actorY)) nx = actorX + dx;
    if (dy !== 0 && inWalkbox(scene, nx, actorY + dy)) ny = actorY + dy;
    loopt = (nx !== actorX || ny !== actorY);
    actorX = nx;
    actorY = ny;
    toestand.speler.x = actorX;
    toestand.speler.y = actorY;
  }

  function probeerOversteek(kruis) {
    if (laatsteKantOp === kruis && animTijd < kantCooldownTot) return;
    var r = AL.world.betreed(toestand, kruis);
    var heeftScene = false;
    for (var i = 0; i < r.effecten.length; i++) {
      if (r.effecten[i].indexOf("scene:") === 0) { heeftScene = true; break; }
    }
    if (heeftScene) {
      verwerkResultaat(r, TEGENGESTELD[kruis]);
      bewaar();
    } else {
      laatsteKantOp = kruis;
      kantCooldownTot = animTijd + KANT_COOLDOWN;
      verwerkResultaat(r, null);
    }
  }

  // ---- Tekenen -------------------------------------------------------------

  function render() {
    syncBlokkeer();

    if (titelActief) {
      tekenTitelKaart();
      if (venster) AL.gfx.tekenVenster(venster);
      AL.gfx.present();
      return;
    }

    var modus = toestand ? toestand.modus : "zolder";

    if (modus === "spread") {
      tekenSpread();
      AL.gfx.present();
      return;
    }
    if (modus === "oordeel") {
      tekenOordeelKaart();
      AL.gfx.present();
      return;
    }
    if (modus === "epiloog") {
      tekenEpiloogKaart();
      AL.gfx.present();
      return;
    }
    if (modus === "pc") {
      // De DOM-overlay dekt het canvas af; teken de zolder eronder als achtergrond.
      tekenZolder();
      AL.gfx.present();
      return;
    }

    // Zolder-modus.
    tekenZolder();
    if (venster) AL.gfx.tekenVenster(venster);
    AL.gfx.present();
  }

  function tekenZolder() {
    var id = toestand.sceneId;
    zorgVoorScene(id);
    AL.gfx.blitScene(id);
    tekenActor();
    tekenStatusbalk();
    tekenInvoerbalk();
  }

  function tekenActor() {
    var def = AL.sprites && AL.sprites["speler"];
    if (!def) return;
    var animNaam = actorAnim();
    var anim = def.anims[animNaam];
    if (!anim) return;
    var fps = anim.fps || 0;
    var frame = fps > 0 ? Math.floor(animTijd * fps) : 0;
    AL.gfx.tekenSprite(def, animNaam, frame, actorX, actorY,
      { spiegel: richting === "west" });
  }

  function actorAnim() {
    var voorvoegsel = loopt ? "loop-" : "sta-";
    if (richting === "west") return voorvoegsel + "oost";   // west = gespiegeld oost
    return voorvoegsel + richting;
  }

  // Statusbalk (rij 0..7): scène-naam op avondblauw.
  function tekenStatusbalk() {
    AL.gfx.rect(28, 0, 0, 320, 8);
    var scene = AL.strings.scenes[toestand.sceneId];
    var naam = scene ? scene.naam : "Zolder";
    AL.gfx.tekenTekst(naam, 2, 0, 34, null);
  }

  // Invoerbalk (rij 190..199): "> " plus de getypte regel en een blokcursor.
  function tekenInvoerbalk() {
    AL.gfx.rect(28, 0, 190, 320, 10);
    var prompt = "> " + AL.input.regel;
    AL.gfx.tekenTekst(prompt, 0, 191, 34, null);
    if (!AL.input.blokkeer && Math.floor(animTijd * 2) % 2 === 0) {
      var cx = prompt.length * 8;
      if (cx <= 312) AL.gfx.rect(34, cx, 191, 7, 8);
    }
  }

  // ---- Titel-, spread-, oordeel- en epiloogkaart --------------------------

  function tekenTitelKaart() {
    // Stille zolder in silhouet, één gouden lichtstraal, het logo eroverheen.
    AL.gfx.rect(28, 0, 0, 320, 200);
    AL.gfx.poly(29, [0, 120, 320, 120, 320, 200, 0, 200]);   // vloer in schaduw
    // Lichtstraal schuin.
    AL.gfx.poly(33, [200, 8, 240, 8, 210, 160, 150, 160]);
    AL.gfx.dither(34, 33, [206, 10, 234, 10, 205, 150, 168, 150]);
    // Een donkere plaat achter het logo, zodat de lichtstraal eráchter door
    // loopt. Zonder die plaat verdwijnt de titel waar de straal passeert: de
    // titelkleur (34) is exact de hooglichtkleur van de straal zelf
    // (art-stijlgids.md, avond-ramp) — gelijke kleur op gelijke kleur. Het is
    // dus geen tekenvolgorde-probleem maar een contrastprobleem; de tekst stond
    // altijd al bovenop.
    AL.gfx.rect(28, 30, 40, 260, 60);
    // Logo-kader in avondgoud.
    AL.gfx.kader(30, 40, 260, 60, 33);
    AL.gfx.kader(32, 42, 256, 56, 41);
    gecentreerdeTekst(AL.strings.titel, 56, 34);
    gecentreerdeTekst(AL.strings.ondertitel, 74, 33);
    if (!venster) gecentreerdeTekst(AL.strings.drukEnter, 168, 32);
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
      AL.spreads.tekenInhoud(AL.gfx, data, spreadPagina, toestand.seed);
    }
    // Bladerhint rechtsonder, rechts uitgelijnd binnen de rechterbladzijde —
    // niet tegen de snit, want daar loopt de donkere papierrand van het sjabloon.
    var laatste = spreadPagina >= spreadAantalPaginas() - 1;
    var hint = laatste ? "spatie: pc >" : "spatie >";
    var rechterrand = AL.spreads ? (AL.spreads.BLAD.rechtsX + AL.spreads.BLAD.kolomB)
      : 302;
    AL.gfx.tekenTekst(hint, rechterrand - hint.length * 8, 178, 40, null);
  }

  // De eindkaart draagt zowel Alberta's oordeel als de epiloog (één scène, twee
  // teksten). De achtergrond komt uit scene-eindkaart.js; de tekst legt de engine
  // erop in een papieren venster.
  function tekenEindkaartAchtergrond() {
    AL.gfx.rect(28, 0, 0, 320, 200);
    var k = AL.scenes && AL.scenes["eindkaart"];
    if (k) AL.gfx.tekenPicture(k.picture);
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

  function gecentreerdeTekst(tekst, y, kleur) {
    var x = Math.floor((320 - tekst.length * 8) / 2);
    AL.gfx.tekenTekst(tekst, x, y, kleur, null);
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
  function hervat() {
    var modus = toestand.modus;
    if (modus === "pc") { wisselNaarScene(toestand.sceneId, "start"); toonOverlay(); }
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
    syncBlokkeer();
  }

  // ---- Debughaken (voor de Playwright-smoketest) --------------------------

  Object.defineProperty(AL, "debugState", {
    get: function () {
      return {
        titelActief: titelActief,
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
        overlayOpen: !!(pcOverlay && pcOverlay.style.display !== "none")
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
