// pc.js — AL.pc: de coördinator van de gesimuleerde pc. Bouwt de VGA-chrome
// (header + menu + editor- en terminalpaneel) in de DOM-overlay, beheert welke
// puzzel actief is en welk paneel getoond wordt, en verzorgt de navigatie
// (menu → puzzel → menu) en het openen/sluiten.
//
// Beslissing (zie het WP-rapport): de bestandskaart in engine-architectuur.md
// noemt onder js/pc/ alleen editor/terminal/parsons. Deliverable 4 sanctioneert
// een aparte coördinator "als dat nuttig is"; coördinatie over drie zusterpanelen
// heeft een neutrale eigenaar nodig, dus dit bestand bestaat als vierde pc-module
// (geladen ná de drie panelen). Het raakt, als deel van de pc-renderlaag, de DOM
// aan (engine-architectuur.md, §"De gesimuleerde pc").
//
// De engine roept init/open/close aan en geeft een kleine context mee
// (emit/bewaar/getToestand). De pc stuurt effect-tags terug via emit; de engine
// vertaalt die naar geluid, save en modus-overgangen.

globalThis.AL = globalThis.AL || {};
globalThis.AL.pc = globalThis.AL.pc || {};

(function () {

  var S = function () { return globalThis.AL.strings; };

  var overlay = null;
  var elHeader = null, elMenu = null, elEditor = null, elTerminal = null;
  var ctx = null;

  var view = "menu";            // "menu" | "editor" | "terminal"
  var levelId = "0";
  var actieveDef = null;
  var actievePuzzelId = null;
  var laatsteHint = null;

  // ---- Opbouw --------------------------------------------------------------

  function init(overlayEl, engineCtx) {
    overlay = overlayEl;
    overlay.innerHTML = "";

    var chrome = document.createElement("div");
    chrome.className = "pc-chrome";

    elHeader = document.createElement("div");
    elHeader.className = "pc-header";
    chrome.appendChild(elHeader);

    var body = document.createElement("div");
    body.className = "pc-body";
    elMenu = document.createElement("div");
    elMenu.className = "pc-menu";
    elMenu.setAttribute("tabindex", "0");
    elEditor = document.createElement("div");
    elTerminal = document.createElement("div");
    body.appendChild(elMenu);
    body.appendChild(elEditor);
    body.appendChild(elTerminal);
    chrome.appendChild(body);
    overlay.appendChild(chrome);

    ctx = {
      emit: engineCtx.emit,
      bewaar: engineCtx.bewaar,
      getToestand: engineCtx.getToestand,
      terugNaarMenu: toonMenu,
      hint: vraagHint,
      voltooi: voltooi,
      meldingTekst: meldingTekst,
      checkLabel: checkLabel,
      terminal: AL.pc.terminal
    };

    AL.pc.editor.bouw(elEditor, ctx);
    AL.pc.terminal.bouw(elTerminal, ctx);
    AL.pc.parsons.bouw(ctx);

    elMenu.addEventListener("keydown", opMenuKeydown);
  }

  function toestand() { return ctx.getToestand(); }

  function levelNaam() {
    if (levelId === "0") return S().l0 ? S().l0.naam : "Level 0";
    return "Level " + levelId;
  }

  // ---- Openen / sluiten ----------------------------------------------------

  function open(t) {
    levelId = String(t.levelActief);
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    toonMenu();
  }

  function close() {
    if (!overlay) return;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
  }

  // ---- Menu ----------------------------------------------------------------

  function defs() { return globalThis.AL.levels.puzzelDefs(levelId); }

  function toonMenu() {
    view = "menu";
    actieveDef = null;
    actievePuzzelId = null;
    elHeader.textContent = S().pc.menuTitel + " — " + levelNaam();
    renderMenu();
    stelViewIn();
    elMenu.focus();
  }

  function renderMenu() {
    var t = toestand();
    var lijst = defs();
    elMenu.innerHTML = "";

    var onder = document.createElement("div");
    onder.className = "pc-menu-onder";
    onder.textContent = S().pc.menuOnder;

    var ol = document.createElement("ol");
    ol.className = "pc-menu-lijst";
    for (var i = 0; i < lijst.length; i++) {
      (function (def, idx) {
        var p = t.levels[levelId].puzzels[def.id];
        var status = p ? p.status : "open";
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pc-menu-item pc-menu-status-" + status;
        btn.setAttribute("data-puzzel-id", def.id);
        var titel = def.titel || def.id;
        btn.innerHTML = "";
        var nr = document.createElement("span");
        nr.className = "pc-menu-nr";
        nr.textContent = (idx + 1) + ".";
        var naam = document.createElement("span");
        naam.className = "pc-menu-naam";
        naam.textContent = titel;
        var badge = document.createElement("span");
        badge.className = "pc-menu-badge";
        badge.textContent = statusTekst(status);
        btn.appendChild(nr);
        btn.appendChild(naam);
        btn.appendChild(badge);
        btn.addEventListener("click", function () { kies(def.id); });
        li.appendChild(btn);
        ol.appendChild(li);
      })(lijst[i], i);
    }
    elMenu.appendChild(onder);
    elMenu.appendChild(ol);
  }

  function statusTekst(status) {
    if (status === "af") return S().pc.statusAf;
    if (status === "bezig") return S().pc.statusBezig;
    return S().pc.statusOpen;
  }

  function opMenuKeydown(e) {
    if (e.key >= "1" && e.key <= "9") {
      var idx = parseInt(e.key, 10) - 1;
      var lijst = defs();
      if (idx >= 0 && idx < lijst.length) { e.preventDefault(); kies(lijst[idx].id); }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      ctx.emit(["pc:sluit"]);
    }
  }

  // ---- Een puzzel kiezen ---------------------------------------------------

  function vindDef(puzzelId) {
    var lijst = defs();
    for (var i = 0; i < lijst.length; i++) if (lijst[i].id === puzzelId) return lijst[i];
    return null;
  }

  function kies(puzzelId) {
    var def = vindDef(puzzelId);
    if (!def) return;
    var t = toestand();
    actieveDef = def;
    actievePuzzelId = puzzelId;
    globalThis.AL.levels.markeerBezig(t, levelId, puzzelId);
    ctx.bewaar();

    if (def.type === "editor") {
      view = "editor";
      elHeader.textContent = S().pc.editTitel;
      AL.pc.editor.laad(def, t, levelId);
      stelViewIn();
      AL.pc.editor.focus();
      ctx.emit(["editor:laad:" + puzzelId]);
    } else if (def.type === "parsons") {
      view = "terminal";
      elHeader.textContent = S().pc.terminalTitel;
      AL.pc.parsons.laad(def, t, levelId);
      stelViewIn();
      AL.pc.terminal.focus();
      ctx.emit(["parsons:laad:" + puzzelId]);
    } else {
      view = "terminal";
      elHeader.textContent = S().pc.terminalTitel;
      AL.pc.terminal.laadPuzzel(def, t, levelId);
      stelViewIn();
      AL.pc.terminal.focus();
      ctx.emit(["terminal:start:" + puzzelId]);
    }
  }

  function stelViewIn() {
    elMenu.style.display = (view === "menu") ? "flex" : "none";
    elEditor.style.display = (view === "editor") ? "flex" : "none";
    elTerminal.style.display = (view === "terminal") ? "flex" : "none";
  }

  // De sim (Seven Little Goats) leent het terminalpaneel: zorg dat de overlay
  // open staat, toon enkel de terminal en zet de kop. De sim-controller
  // (js/pc/sim-terminal.js) vult de inhoud en de invoerlus. Aangeroepen door de
  // engine bij sim:boot.
  function simView(kop) {
    view = "terminal";
    actieveDef = null;
    actievePuzzelId = null;
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    elHeader.textContent = kop || S().pc.terminalTitel;
    stelViewIn();
    AL.pc.terminal.focus();
  }

  // ---- Hint & voltooiing ---------------------------------------------------

  function vraagHint() {
    if (!actievePuzzelId) return;
    var t = toestand();
    var r = globalThis.AL.levels.hint(t, levelId, actievePuzzelId);
    laatsteHint = r.effecten[0] || null;
    var regel = S().pc.hintKop + ": " + r.tekst.join(" ");
    if (view === "editor") AL.pc.editor.schrijfRegel(regel);
    else AL.pc.terminal.schrijf([regel]);
    ctx.emit(r.effecten);
    ctx.bewaar();
  }

  function voltooi() {
    if (!actievePuzzelId) return;
    var t = toestand();
    var r = globalThis.AL.levels.voltooiPuzzel(t, levelId, actievePuzzelId);
    ctx.emit(r.effecten);
    ctx.bewaar();
  }

  // ---- Strings-hulp --------------------------------------------------------

  function meldingTekst(key) {
    var m = S().pcMelding;
    return (m && m[key]) || (m && m.onbekend) || "Er klopt nog iets niet.";
  }
  function checkLabel(uit) {
    var l = S().pcCheckLabels;
    return (l && l[uit]) || (l && l.generiek) || "controle geslaagd";
  }

  // ---- Publieke API + debug ------------------------------------------------

  AL.pc.init = init;
  AL.pc.open = open;
  AL.pc.close = close;
  AL.pc.simView = simView;

  AL.pc.debug = {
    view: function () { return view; },
    open: function () { return overlay && overlay.style.display !== "none"; },
    levelId: function () { return levelId; },
    puzzelId: function () { return actievePuzzelId; },
    puzzelIds: function () { return defs().map(function (d) { return d.id; }); },
    statussen: function () {
      var t = toestand();
      var uit = {};
      var lijst = defs();
      for (var i = 0; i < lijst.length; i++) {
        var p = t.levels[levelId].puzzels[lijst[i].id];
        uit[lijst[i].id] = p ? p.status : "open";
      }
      return uit;
    },
    kies: function (id) { kies(id); },
    editorCode: function () { return AL.pc.editor._huidigeCode(); },
    zetEditorCode: function (code) { AL.pc.editor._zetCode(code); },
    compileer: function () { AL.pc.editor.compileer(); },
    editorUitvoer: function () { return AL.pc.editor._uitvoerTekst(); },
    terminalTekst: function () { return AL.pc.terminal._scrollTekst(); },
    verwacht: function () { return AL.pc.terminal._verwacht(); },
    parsonsVolgorde: function () { return AL.pc.parsons._correcteVolgordeString(); },
    submit: function (w) { AL.pc.terminal._submit(w); },
    hint: function () { vraagHint(); },
    laatsteHint: function () { return laatsteHint; },
    model: function (id) { var d = vindDef(id); return d ? d.model : null; }
  };

  if (typeof module !== "undefined") { module.exports = AL.pc; }

})();
