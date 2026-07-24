// editor.js — AL.pc.editor: de gesimuleerde period-editor als DOM-overlay
// ("ALBERTA'S EDIT v2.3", zie art-stijlgids.md, pc-chrome). Een <textarea> met
// regelnummers en een blok-cursor, voorgeladen met beschadigde Java of een lege
// stub plus Alberta's notities als commentaar (uit de puzzeldef in
// js/levels/*.js). "compileer & test" (F9 of Ctrl+Enter of de knop) stuurt de
// inhoud door de checker: eerst javacsim (diagnostiek), dan de asserties. De
// meldingKeys worden via AL.strings vertaald; de juiste effect-tags gaan naar de
// engine. Het concept auto-bewaart (debounced) in puzzels[*].draft en wordt bij
// heropenen hersteld (save-en-hints.md, concept-behoud).
//
// Als deel van de pc-renderlaag mag dit bestand de DOM aanraken (engine-
// architectuur.md, §"De gesimuleerde pc"). De PURE evalueer()-functie raakt geen
// DOM en is Node-testbaar (test/test-pc-logic.mjs); de checker zelf blijft
// DOM-vrij.

globalThis.AL = globalThis.AL || {};
globalThis.AL.pc = globalThis.AL.pc || {};

(function () {

  var S = function () { return globalThis.AL.strings; };

  var ctx = null;            // gedeelde context van de coördinator (pc.js)
  var el = {};               // DOM-referenties
  var def = null;            // actieve puzzeldef
  var levelId = null;
  var bewaarTimer = null;

  // ---- PURE: compileer + test (DOM-vrij, Node-testbaar) -------------------

  // evalueer(def, code) -> {
  //   javac:  de javacsim-diagnose (ok/tekst/aantal),
  //   checks: [ { ok, meldingKey, uit, regel } ]  (t/m de eerste falende),
  //   geslaagd: alle checks ok én javac schoon,
  //   eersteFout: { meldingKey, regel } | null
  // }
  // Laag 1 (javac) blokkeert laag 2 (asserties): compileert de code niet, dan
  // draaien de tests niet — precies zoals het checker-contract voorschrijft.
  function evalueer(pd, code) {
    var C = globalThis.AL.checker;
    var diag = C.javacsim.diagnose(code, pd.bron || "Onbekend.java");
    if (!diag.ok) {
      return { javac: diag, checks: [], geslaagd: false, eersteFout: null };
    }
    var tokens = C.tokenizer.tokenize(code).tokens;
    var resultaten = [];
    var eersteFout = null;
    for (var i = 0; i < pd.checks.length; i++) {
      var c = pd.checks[i];
      var fn = C.asserts[c.fn];
      var r = fn(tokens, c.config);
      resultaten.push({ ok: r.ok, meldingKey: r.meldingKey, uit: c.uit, regel: r.regel });
      if (!r.ok) { eersteFout = { meldingKey: r.meldingKey, regel: r.regel }; break; }
    }
    return {
      javac: diag,
      checks: resultaten,
      geslaagd: eersteFout === null,
      eersteFout: eersteFout
    };
  }

  // ---- DOM: opbouw ---------------------------------------------------------

  function bouw(container, gedeeldeCtx) {
    ctx = gedeeldeCtx;
    el.wortel = container;
    container.className = "pc-editor";
    container.innerHTML = "";

    el.kop = document.createElement("div");
    el.kop.className = "pc-editor-kop";
    container.appendChild(el.kop);

    var body = document.createElement("div");
    body.className = "pc-editor-body";
    el.gutter = document.createElement("pre");
    el.gutter.className = "pc-editor-gutter";
    el.gutter.setAttribute("aria-hidden", "true");
    el.invoer = document.createElement("textarea");
    el.invoer.className = "pc-editor-invoer";
    el.invoer.setAttribute("spellcheck", "false");
    el.invoer.setAttribute("autocomplete", "off");
    el.invoer.setAttribute("autocapitalize", "off");
    el.invoer.setAttribute("wrap", "off");
    el.invoer.setAttribute("aria-label", "code-editor");
    body.appendChild(el.gutter);
    body.appendChild(el.invoer);
    container.appendChild(body);

    var knoppen = document.createElement("div");
    knoppen.className = "pc-editor-knoppen";
    el.compileer = knop("pc-knop pc-knop-compileer", S().pc.knopCompileer, compileer);
    el.terug = knop("pc-knop pc-knop-terug", S().pc.knopTerug,
      function () { if (ctx) ctx.terugNaarMenu(); });
    knoppen.appendChild(el.compileer);
    knoppen.appendChild(el.terug);
    container.appendChild(knoppen);

    el.uitvoer = document.createElement("pre");
    el.uitvoer.className = "pc-editor-uitvoer pc-scherm";
    el.uitvoer.setAttribute("aria-live", "polite");
    container.appendChild(el.uitvoer);

    el.invoer.addEventListener("input", opInput);
    el.invoer.addEventListener("scroll", syncGutterScroll);
    el.invoer.addEventListener("keydown", opKeydown);
  }

  function knop(klasse, tekst, aan) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = klasse;
    b.textContent = tekst;
    b.addEventListener("click", aan);
    return b;
  }

  // ---- DOM: een puzzel laden ----------------------------------------------

  function laad(puzzelDef, toestand, lvl) {
    def = puzzelDef;
    levelId = String(lvl);
    var p = toestand.levels[levelId].puzzels[def.id];
    var draft = p && typeof p.draft === "string" ? p.draft : "";
    // Draft heeft voorrang (concept-behoud); anders de seed-gekozen variant.
    var start = draft && draft.length > 0
      ? draft
      : globalThis.AL.levels.kiesVariant(
          toestand.seed, def.varianten, def.shuffleLabel || def.id);
    el.kop.textContent = def.titel || def.bron || "";
    el.invoer.value = start || "";
    el.uitvoer.textContent = (def.titel || def.bron) + " " + S().pc.editorGeladen;
    werkGutterBij();
  }

  function toon() { if (el.wortel) el.wortel.style.display = "flex"; }
  function verberg() { if (el.wortel) el.wortel.style.display = "none"; }
  function focus() { if (el.invoer) el.invoer.focus(); }

  // ---- Concept auto-bewaren (debounced) -----------------------------------

  function opInput() {
    werkGutterBij();
    if (bewaarTimer) clearTimeout(bewaarTimer);
    bewaarTimer = setTimeout(bewaarDraft, 350);
  }

  function bewaarDraft() {
    bewaarTimer = null;
    if (!ctx || !def) return;
    var t = ctx.getToestand();
    var p = t.levels[levelId].puzzels[def.id];
    if (p) { p.draft = el.invoer.value; }
    ctx.emit(["voortgang:opgeslagen"]);   // engine schrijft naar localStorage
  }

  // Direct doorschrijven (bv. vlak vóór compileren), zonder op de debounce te
  // wachten.
  function flushDraft() {
    if (bewaarTimer) { clearTimeout(bewaarTimer); bewaarTimer = null; }
    bewaarDraft();
  }

  // ---- Regelnummers --------------------------------------------------------

  function werkGutterBij() {
    var n = el.invoer.value.split("\n").length;
    var uit = [];
    for (var i = 1; i <= n; i++) uit.push(i);
    el.gutter.textContent = uit.join("\n");
    syncGutterScroll();
  }
  function syncGutterScroll() {
    if (el.gutter && el.invoer) el.gutter.scrollTop = el.invoer.scrollTop;
  }

  // ---- Toetsen -------------------------------------------------------------

  function opKeydown(e) {
    if (e.key === "F9" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      compileer();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (ctx) ctx.emit(["pc:sluit"]);     // Esc verlaat de pc (naar de zolder)
      return;
    }
    // Tab voegt vier spaties in i.p.v. focus te verspringen.
    if (e.key === "Tab") {
      e.preventDefault();
      voegInOpCursor("    ");
    }
  }

  function voegInOpCursor(tekst) {
    var s = el.invoer.selectionStart, eind = el.invoer.selectionEnd;
    var v = el.invoer.value;
    el.invoer.value = v.slice(0, s) + tekst + v.slice(eind);
    el.invoer.selectionStart = el.invoer.selectionEnd = s + tekst.length;
    opInput();
  }

  // ---- Compileer & test ----------------------------------------------------

  function compileer() {
    if (!def || !ctx) return;
    flushDraft();
    var code = el.invoer.value;
    var res = evalueer(def, code);

    var regels = [];
    var eff = ["compileer"];

    if (!res.javac.ok) {
      regels = regels.concat(res.javac.tekst);
      eff.push("javac:fout:" + def.id);
    } else {
      regels.push(S().pc.javacGeenFouten);
      regels.push("");
      for (var i = 0; i < res.checks.length; i++) {
        var c = res.checks[i];
        if (c.ok) {
          regels.push(S().pc.checkOk + ctx.checkLabel(c.uit));
        } else {
          regels.push(S().pc.checkFail + ctx.meldingTekst(c.meldingKey));
        }
      }
      if (res.geslaagd) {
        eff.push("check:ok:" + def.id);
        regels.push("");
        regels.push(S().pc.alleChecksOk);
      } else {
        eff.push("check:fout:" + def.id);
      }
    }

    schrijfUitvoer(regels);
    ctx.emit(eff);

    if (res.geslaagd) {
      ctx.voltooi();
    }
  }

  function schrijfUitvoer(regels) {
    el.uitvoer.textContent = regels.join("\n");
    el.uitvoer.scrollTop = el.uitvoer.scrollHeight;
  }

  // Voegt een losse regel toe aan het uitvoerpaneel (bv. een hint).
  function schrijfRegel(tekst) {
    if (!el.uitvoer) return;
    el.uitvoer.textContent += "\n" + tekst;
    el.uitvoer.scrollTop = el.uitvoer.scrollHeight;
  }

  AL.pc.editor = {
    evalueer: evalueer,       // PURE
    bouw: bouw,
    laad: laad,
    toon: toon,
    verberg: verberg,
    focus: focus,
    compileer: compileer,
    schrijfRegel: schrijfRegel,
    // debug/tests
    _huidigeCode: function () { return el.invoer ? el.invoer.value : ""; },
    _zetCode: function (code) { if (el.invoer) { el.invoer.value = code; werkGutterBij(); flushDraft(); } },
    _uitvoerTekst: function () { return el.uitvoer ? el.uitvoer.textContent : ""; }
  };

  if (typeof module !== "undefined") { module.exports = AL.pc.editor; }

})();
