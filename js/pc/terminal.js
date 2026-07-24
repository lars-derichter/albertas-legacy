// terminal.js — AL.pc.terminal: het terminalpaneel van de gesimuleerde pc.
// Scrollback + prompt + getypte invoer, in amber-CRT-stijl (art-stijlgids.md).
// Het rendert de javac-/CHECK-regels van de editor (via pc.js) én host de
// niet-editor-puzzels rechtstreeks (checker-contract.md §"Niet-editor-puzzels"):
//   - voorspel-de-output (trace): tolerante waardevergelijking;
//   - vind-de-fout: regelnummer en/of aanvaarde korte antwoorden;
//   - verklaar-in-één-zin: zelf-check (model tonen → juist/anders);
//   - welke-patroonkaart: keuze 1-4.
// Het hint-commando '?' werkt hier (drie stadia via AL.levels, aangestuurd door
// pc.js). Parsons (js/pc/parsons.js) leent dit paneel via de publieke API.
//
// De PURE vergelijkers (checkTrace/checkVindfout/checkPatroonkaart) raken geen
// DOM en zijn Node-testbaar. De DOM-methodes horen bij de pc-renderlaag.

globalThis.AL = globalThis.AL || {};
globalThis.AL.pc = globalThis.AL.pc || {};

(function () {

  var S = function () { return globalThis.AL.strings; };

  var ctx = null;
  var el = {};
  var actieveHandler = null;      // verwerkt de volgende getypte regel
  var rauwModus = false;          // in de sim: alle invoer (ook ?/sluit) naar de handler
  var def = null;                 // actieve terminal-puzzeldef
  var levelId = null;
  var traceWaarde = null;         // de seed-gekozen trace-invoer
  var verwachtAntwoord = null;    // het verwachte antwoord (voor debug/tests)

  // ---- PURE vergelijkers (DOM-vrij, Node-testbaar) ------------------------

  function norm(s) { return String(s == null ? "" : s).trim().replace(/\s+/g, " ").toLowerCase(); }

  // Trace: exacte match na whitespace-normalisatie; getallen numeriek vergeleken
  // zodat "10" en " 10 " gelijk zijn (checker-contract.md).
  function checkTrace(pd, waarde, invoer) {
    var verwacht = pd.verwacht(waarde);
    var a = norm(invoer), b = norm(verwacht);
    if (a === b) return { ok: true, verwacht: verwacht };
    var na = a.replace(/[^0-9-]/g, ""), nb = b.replace(/[^0-9-]/g, "");
    if (nb !== "" && na === nb) return { ok: true, verwacht: verwacht };
    return { ok: false, verwacht: verwacht };
  }

  // Vind-de-fout: het regelnummer, "regel N", of een aanvaard kort antwoord.
  function checkVindfout(pd, invoer) {
    var n = norm(invoer);
    if (n === String(pd.regelnummer)) return { ok: true };
    if (n === "regel " + pd.regelnummer) return { ok: true };
    var lijst = pd.aanvaard || [];
    for (var i = 0; i < lijst.length; i++) {
      if (n.indexOf(norm(lijst[i])) !== -1) return { ok: true };
    }
    return { ok: false };
  }

  // Welke-patroonkaart: exacte keuze 1-4 (eerste getal in de invoer).
  function checkPatroonkaart(pd, invoer) {
    var m = String(invoer).match(/\d+/);
    var keuze = m ? parseInt(m[0], 10) : null;
    return { ok: keuze === pd.antwoord, keuze: keuze };
  }

  // ---- DOM: opbouw ---------------------------------------------------------

  function bouw(container, gedeeldeCtx) {
    ctx = gedeeldeCtx;
    el.wortel = container;
    container.className = "pc-terminal";
    container.innerHTML = "";

    el.kop = document.createElement("div");
    el.kop.className = "pc-terminal-kop";
    container.appendChild(el.kop);

    el.scroll = document.createElement("pre");
    el.scroll.className = "pc-term-scroll pc-scherm";
    el.scroll.setAttribute("aria-live", "polite");
    container.appendChild(el.scroll);

    var rij = document.createElement("div");
    rij.className = "pc-term-rij";
    el.prompt = document.createElement("span");
    el.prompt.className = "pc-term-prompt";
    el.prompt.textContent = S().pc.prompt;
    el.invoer = document.createElement("input");
    el.invoer.type = "text";
    el.invoer.className = "pc-term-invoer";
    el.invoer.setAttribute("spellcheck", "false");
    el.invoer.setAttribute("autocomplete", "off");
    el.invoer.setAttribute("autocapitalize", "off");
    el.invoer.setAttribute("aria-label", "terminal-invoer");
    rij.appendChild(el.prompt);
    rij.appendChild(el.invoer);
    container.appendChild(rij);

    el.invoer.addEventListener("keydown", opKeydown);
  }

  function opKeydown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      opSubmit(el.invoer.value);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      // In de sim-modus is Escape geen uitgang: de sim speelt naar een einde.
      if (!rauwModus && ctx) ctx.emit(["pc:sluit"]);
    }
  }

  function opSubmit(waarde) {
    var w = String(waarde).trim();
    var promptTekst = (rauwModus && el.prompt) ? el.prompt.textContent : S().pc.prompt;
    echo(promptTekst + waarde);
    el.invoer.value = "";
    if (w === "") return;
    // Rauwe modus (de sim): elke regel — ook ?, sluit — gaat integraal naar de
    // actieve handler; de puzzel-interceptie hieronder geldt alleen voor de pc.
    if (rauwModus) { if (actieveHandler) actieveHandler(w); return; }
    var laag = w.toLowerCase();
    if (w === "?") { if (ctx) ctx.hint(); return; }
    if (laag === "menu") { if (ctx) ctx.terugNaarMenu(); return; }
    if (laag === "sluit" || laag === "sluit pc" || laag === "exit") {
      if (ctx) ctx.emit(["pc:sluit"]); return;
    }
    if (actieveHandler) actieveHandler(w);
  }

  // ---- DOM: publieke render-API (ook voor parsons.js) ---------------------

  function wis() { if (el.scroll) el.scroll.textContent = ""; }
  function schrijf(regels) {
    if (!el.scroll) return;
    var lijst = Array.isArray(regels) ? regels : [regels];
    var huidig = el.scroll.textContent;
    el.scroll.textContent = (huidig ? huidig + "\n" : "") + lijst.join("\n");
    el.scroll.scrollTop = el.scroll.scrollHeight;
  }
  function echo(regel) { schrijf([regel]); }
  function zetHandler(fn) { actieveHandler = fn; }
  // Zet de rauwe (sim-)modus aan met een handler die elke regel krijgt, of uit.
  function zetRauw(fn) { rauwModus = true; actieveHandler = fn; }
  function zetNormaal() { rauwModus = false; actieveHandler = null; }
  function zetPrompt(tekst) { if (el.prompt) el.prompt.textContent = tekst; }
  function toon() { if (el.wortel) el.wortel.style.display = "flex"; }
  function verberg() { if (el.wortel) el.wortel.style.display = "none"; }
  function focus() { if (el.invoer) el.invoer.focus(); }

  // ---- Een terminal-puzzel laden ------------------------------------------

  function laadPuzzel(puzzelDef, toestand, lvl) {
    def = puzzelDef;
    levelId = String(lvl);
    traceWaarde = null;
    verwachtAntwoord = null;
    wis();
    zetPrompt(S().pc.prompt);
    el.kop.textContent = S().pc.terminalTitel;

    if (def.type === "trace") {
      traceWaarde = globalThis.AL.levels.poolPick(toestand.seed, def.pool, def.label);
      verwachtAntwoord = def.verwacht(traceWaarde);
      schrijf(def.vraag(traceWaarde));
      zetHandler(verwerkTrace);
    } else if (def.type === "vindfout") {
      verwachtAntwoord = String(def.regelnummer);
      schrijf(def.vraag);
      zetHandler(verwerkVindfout);
    } else if (def.type === "verklaar") {
      schrijf(def.vraag);
      zetHandler(verwerkVerklaarZin);
    } else if (def.type === "patroonkaart") {
      verwachtAntwoord = String(def.antwoord);
      schrijf(def.vraag);
      schrijf(def.opties);
      zetHandler(verwerkPatroonkaart);
    }
    schrijf(["", S().pc.typHint]);
  }

  // ---- Handlers ------------------------------------------------------------

  function slaagUit(okTekst) {
    schrijf([okTekst]);
    ctx.emit(["check:ok:" + def.id]);
    ctx.voltooi();
    zetHandler(null);
  }
  function faalUit(foutTekst) {
    schrijf([foutTekst]);
    ctx.emit(["check:fout:" + def.id]);
  }

  function verwerkTrace(w) {
    var r = checkTrace(def, traceWaarde, w);
    if (r.ok) slaagUit(def.ok); else faalUit(def.fout);
  }
  function verwerkVindfout(w) {
    var r = checkVindfout(def, w);
    if (r.ok) slaagUit(def.ok); else faalUit(def.fout);
  }
  function verwerkPatroonkaart(w) {
    var r = checkPatroonkaart(def, w);
    if (r.ok) slaagUit(def.ok); else faalUit(def.fout);
  }

  // Verklaar: fase 1 legt de zin vast en toont het model; fase 2 is de zelf-
  // check (juist/anders). Beslissing: beide bevestigingen ronden de puzzel af
  // (zelf-beoordeling is niet-bestraffend, cursus-idioom).
  function verwerkVerklaarZin() {
    schrijf(["", def.toon, "  " + def.model, "", def.bevestig]);
    zetHandler(verwerkVerklaarBevestig);
  }
  function verwerkVerklaarBevestig(w) {
    var juist = norm(w).indexOf("juist") === 0;
    schrijf([juist ? def.juist : def.anders]);
    ctx.emit(["check:ok:" + def.id]);
    ctx.voltooi();
    zetHandler(null);
  }

  AL.pc.terminal = {
    // PURE
    checkTrace: checkTrace,
    checkVindfout: checkVindfout,
    checkPatroonkaart: checkPatroonkaart,
    // DOM
    bouw: bouw,
    laadPuzzel: laadPuzzel,
    toon: toon,
    verberg: verberg,
    focus: focus,
    wis: wis,
    schrijf: schrijf,
    echo: echo,
    zetHandler: zetHandler,
    zetRauw: zetRauw,
    zetNormaal: zetNormaal,
    zetPrompt: zetPrompt,
    // debug/tests
    _verwacht: function () { return verwachtAntwoord; },
    _traceWaarde: function () { return traceWaarde; },
    _scrollTekst: function () { return el.scroll ? el.scroll.textContent : ""; },
    _submit: function (w) { opSubmit(w); }
  };

  if (typeof module !== "undefined") { module.exports = AL.pc.terminal; }

})();
