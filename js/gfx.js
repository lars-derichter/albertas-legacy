// gfx.js — de grafische kern. Alles wordt getekend in een backing store van
// 320×200 palet-indexen (een Uint8Array); pas bij present() gaat die naar het
// zichtbare canvas via het palet. Geen vector-canvas-oproepen, geen
// anti-aliasing: elke vulling is een eigen scanline-vulling, dus alles is
// scherp en deterministisch.
//
// De publieke API hangt aan AL.gfx. Geen ES-modules: dit bestand hangt aan het
// globale AL-object en werkt vanaf file://.
//
// Aangepast uit remake-90s (js/gfx.js). Behouden: de palet-geïndexeerde
// software-renderer, alle primitieven, de dither, tekenPicture/cacheScene/
// blitScene, de sprite-blitter, tekenTekst en het gepagineerde berichtvenster.
// Gewijzigd: het palet is nu 64 kleuren (AL.palet), de EGA-guard werd de bredere
// debugPalet-guard (elke pixel een geheel getal binnen de paletgrootte), en de
// sprite-blitter vertaalt een sprite-sub-palet naar echte paletindexen.

globalThis.AL = globalThis.AL || {};

(function () {

  // Vaste maten van het logische scherm en het speelveld (statusbalk boven,
  // invoerbalk onder).
  var BREEDTE = 320;
  var HOOGTE = 200;
  var SPEELVELD_TOP = 8;
  var SPEELVELD_BOT = 189;

  // Interne toestand, gezet door init().
  var canvas = null;
  var ctx = null;
  var imageData = null;
  var buffer = null;         // Uint8Array(BREEDTE*HOOGTE) met palet-indexen
  var sceneCache = {};       // id -> Uint8Array met een voorgetekende scène

  // ---- Hulpjes -------------------------------------------------------------

  // Controleer, alleen als debugPalet aanstaat, dat een kleur een geldige
  // paletindex is (een geheel getal binnen 0..AL.palet.aantal-1). Zo betrapt een
  // test meteen een scène die buiten het palet kleurt. Aangepast uit remake-90s:
  // daar was de grens vast op 0–15 (EGA); hier volgt ze de paletgrootte.
  function keurKleur(c) {
    if (!gfx.debugPalet) return;
    var max = (AL.palet ? AL.palet.aantal : 16) - 1;
    if (typeof c !== "number" || (c | 0) !== c || c < 0 || c > max) {
      throw new Error("gfx: kleur buiten palet (0–" + max + "): " + c);
    }
  }

  // Eén pixel in een doelbuffer. Klipt op de volledige schermrand (0..319,
  // 0..199), zodat ook de status- en invoerbalk beschreven kunnen worden.
  function zetPixel(doel, x, y, c) {
    keurKleur(c);
    x = x | 0;
    y = y | 0;
    if (x < 0 || x >= BREEDTE || y < 0 || y >= HOOGTE) return;
    doel[y * BREEDTE + x] = c;
  }

  // Horizontale lijn van x1 tot x2 (inclusief) op rij y, één kleur.
  function hlijn(doel, x1, x2, y, c) {
    if (x1 > x2) { var t = x1; x1 = x2; x2 = t; }
    for (var x = x1; x <= x2; x++) zetPixel(doel, x, y, c);
  }

  // ---- Primitieven (werken op een doelbuffer) ------------------------------

  // Vul het hele speelveld (rijen 8..189) met één kleur.
  function ivFill(doel, c) {
    keurKleur(c);
    for (var y = SPEELVELD_TOP; y <= SPEELVELD_BOT; y++) {
      hlijn(doel, 0, BREEDTE - 1, y, c);
    }
  }

  // Gevulde rechthoek met linkerbovenhoek (x, y), breedte b, hoogte h.
  function ivRect(doel, c, x, y, b, h) {
    keurKleur(c);
    for (var j = 0; j < h; j++) hlijn(doel, x, x + b - 1, y + j, c);
  }

  // Bresenham-lijnsegment tussen twee punten.
  function ivSegment(doel, c, x0, y0, x1, y1) {
    x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
    var dx = Math.abs(x1 - x0);
    var dy = -Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx + dy;
    while (true) {
      zetPixel(doel, x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // Polylijn (1 px dik) door een reeks punten [x1,y1, x2,y2, ...].
  function ivLine(doel, c, punten) {
    keurKleur(c);
    for (var i = 0; i + 3 < punten.length; i += 2) {
      ivSegment(doel, c, punten[i], punten[i + 1],
        punten[i + 2], punten[i + 3]);
    }
  }

  // Scanline-vulling van een veelhoek. kleurVan(x, y) geeft per pixel de index,
  // zodat dezelfde routine zowel een vlakke vulling als een dither aankan.
  function vulPolygoon(doel, punten, kleurVan) {
    var n = punten.length / 2;
    var minY = Infinity, maxY = -Infinity, i;
    for (i = 0; i < n; i++) {
      var py = punten[i * 2 + 1];
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    minY = Math.max(0, Math.ceil(minY));
    maxY = Math.min(HOOGTE - 1, Math.floor(maxY));
    for (var y = minY; y <= maxY; y++) {
      // Verzamel de snijpunten van scanlijn y met alle randen.
      var kruis = [];
      for (i = 0; i < n; i++) {
        var ax = punten[i * 2], ay = punten[i * 2 + 1];
        var b = (i + 1) % n;
        var bx = punten[b * 2], by = punten[b * 2 + 1];
        // Rand snijdt de scanlijn (half-open interval, geen dubbeltelling).
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          var x = ax + (y - ay) / (by - ay) * (bx - ax);
          kruis.push(x);
        }
      }
      kruis.sort(function (p, q) { return p - q; });
      // Vul tussen paren snijpunten (even-oddregel).
      for (i = 0; i + 1 < kruis.length; i += 2) {
        var xa = Math.ceil(kruis[i]);
        var xb = Math.floor(kruis[i + 1]);
        for (var xx = xa; xx <= xb; xx++) zetPixel(doel, xx, y, kleurVan(xx, y));
      }
    }
  }

  // Gevulde veelhoek in één kleur.
  function ivPoly(doel, c, punten) {
    keurKleur(c);
    vulPolygoon(doel, punten, function () { return c; });
  }

  // Gevulde veelhoek met een 2×2-dither van twee kleuren (zachte tussenkleur).
  function ivDither(doel, c1, c2, punten) {
    keurKleur(c1);
    keurKleur(c2);
    vulPolygoon(doel, punten, function (x, y) {
      return ((x + y) & 1) === 0 ? c1 : c2;
    });
  }

  // ---- Geordend rasteren en deterministische ruis --------------------------

  // Een 4×4-Bayer-matrix. Het 2×2-schaakbord van ivDither kan maar één
  // mengverhouding (50 %); met een 4×4-drempel zijn zestien dichtheden mogelijk,
  // en dát is wat een VGA-verloop zacht maakt in plaats van gestreept.
  var BAYER4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  // Drempel voor pixel (x, y), in [0, 1).
  function bayer(x, y) {
    return (BAYER4[(y & 3)][(x & 3)] + 0.5) / 16;
  }

  // Deterministische pseudo-ruis per pixel, in [0, 1). Geen Math.random: een
  // scène moet er bij elke run identiek uitzien, anders is ze niet te linten en
  // niet te vergelijken op een screenshot.
  function ruisWaarde(x, y, seed) {
    var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^
      Math.imul(seed | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }

  // De tussenstappen van c1 naar c2. Zitten beide kleuren in dezelfde ramp, dan
  // loopt het verloop over de échte tussenkleuren van die ramp — zeven stappen
  // van 28 naar 34, bijvoorbeeld. Anders blijft het een menging van twee.
  function rampStappen(c1, c2) {
    var r1 = AL.palet.rampVan(c1);
    var r2 = AL.palet.rampVan(c2);
    if (r1 && r2 && r1.ramp === r2.ramp) {
      var uit = [], i;
      if (r1.pos <= r2.pos) {
        for (i = r1.pos; i <= r2.pos; i++) uit.push(r1.ramp[i]);
      } else {
        for (i = r1.pos; i >= r2.pos; i--) uit.push(r1.ramp[i]);
      }
      return uit;
    }
    return [c1, c2];
  }

  // Verloop over een rechthoek, van c1 naar c2, met geordende dithering op elke
  // overgang. richting "h" = horizontaal, alles anders = verticaal.
  function ivGradient(doel, c1, c2, x, y, b, h, richting) {
    keurKleur(c1);
    keurKleur(c2);
    var stappen = rampStappen(c1, c2);
    var n = stappen.length;
    var horizontaal = (richting === "h");
    var lengte = horizontaal ? b : h;
    if (b < 1 || h < 1) return;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < b; i++) {
        var px = x + i, py = y + j;
        var t = lengte <= 1 ? 0 : (horizontaal ? i : j) / (lengte - 1);
        var f = t * (n - 1);
        var idx = Math.floor(f);
        var frac = f - idx;
        if (idx >= n - 1) { idx = n - 1; frac = 0; }
        zetPixel(doel, px, py,
          frac > bayer(px, py) ? stappen[idx + 1] : stappen[idx]);
      }
    }
  }

  // Veelhoek met een gedoseerde menging: dichtheid 0 is helemaal c1, 1 helemaal
  // c2, 0.25/0.5/0.75 daartussen. Vervangt het vaste 50 %-schaakbord waar een
  // zachtere overgang nodig is.
  function ivDitherRamp(doel, c1, c2, dichtheid, punten) {
    keurKleur(c1);
    keurKleur(c2);
    var d = Math.max(0, Math.min(1, dichtheid));
    vulPolygoon(doel, punten, function (x, y) {
      return bayer(x, y) < d ? c2 : c1;
    });
  }

  // Verduister wat er al staat: elke pixel binnen de veelhoek zakt n stappen in
  // zijn eigen ramp. Zo krijgt een contactschaduw de kleur van de ondergrond
  // mee, in plaats van er een grijze vlek overheen te leggen.
  function ivShadow(doel, stappen, punten) {
    var n = Math.max(1, stappen | 0);
    vulPolygoon(doel, punten, function (x, y) {
      return AL.palet.verduister(doel[y * BREEDTE + x], n);
    });
  }

  // De andere helft van shadow: elke pixel binnen de veelhoek klimt n stappen in
  // zijn eigen ramp, maar alleen waar de Bayer-drempel het toelaat. Dichtheid 1
  // licht alles op, 0.3 alleen een derde van de pixels.
  //
  // Dit is het gereedschap voor een lichtstraal, en het bestond niet: een straal
  // werd tot nu toe met ditherRamp getekend, en die vult élke pixel van de
  // veelhoek met een van twee kleuren. Daardoor las licht als een dichte
  // oranje plaat over de kamer heen — precies de klacht waar dit programma mee
  // begon. Met light blijft de ondergrond staan en wordt hij alleen líchter:
  // hout wordt lichter hout, de wand lichtere wand, een silhouet krijgt een rand
  // mee in plaats van te verdwijnen. Eén lichtbron, en alles wat hij raakt
  // antwoordt in zijn eigen kleurfamilie.
  function ivLight(doel, stappen, dichtheid, punten) {
    var n = Math.max(1, stappen | 0);
    var d = Math.max(0, Math.min(1, dichtheid));
    vulPolygoon(doel, punten, function (x, y) {
      var huidig = doel[y * BREEDTE + x];
      return bayer(x, y) < d ? AL.palet.verhelder(huidig, n) : huidig;
    });
  }

  // Spikkels binnen een veelhoek: houtnerf, stof, korrel op steen. Laat de
  // ondergrond staan waar niet gespikkeld wordt.
  function ivNoise(doel, c, dichtheid, seed, punten) {
    keurKleur(c);
    var d = Math.max(0, Math.min(1, dichtheid));
    vulPolygoon(doel, punten, function (x, y) {
      return ruisWaarde(x, y, seed) < d ? c : doel[y * BREEDTE + x];
    });
  }

  // Gevulde ellips met middelpunt (cx, cy) en halve assen rx, ry.
  function ivEllipse(doel, c, cx, cy, rx, ry) {
    keurKleur(c);
    if (rx <= 0 || ry <= 0) return;
    for (var y = -ry; y <= ry; y++) {
      // Halve breedte op deze rij volgens de ellipsvergelijking.
      var v = 1 - (y * y) / (ry * ry);
      if (v < 0) continue;
      var halfB = Math.floor(rx * Math.sqrt(v) + 0.0001);
      hlijn(doel, cx - halfB, cx + halfB, cy + y, c);
    }
  }

  // Losse pixels uit een lijst [[x,y], [x,y], ...].
  function ivPixels(doel, c, lijst) {
    keurKleur(c);
    for (var i = 0; i < lijst.length; i++) {
      zetPixel(doel, lijst[i][0], lijst[i][1], c);
    }
  }

  // ---- Scène-interpretatie -------------------------------------------------

  // Voer een reeks draw-ops uit op een doelbuffer (zie scene-schema.md).
  function voerOpsUit(doel, ops) {
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      var naam = op[0];
      if (naam === "fill") {
        ivFill(doel, op[1]);
      } else if (naam === "rect") {
        ivRect(doel, op[1], op[2], op[3], op[4], op[5]);
      } else if (naam === "poly") {
        ivPoly(doel, op[1], op[2]);
      } else if (naam === "line") {
        ivLine(doel, op[1], op[2]);
      } else if (naam === "dither") {
        ivDither(doel, op[1], op[2], op[3]);
      } else if (naam === "gradient") {
        ivGradient(doel, op[1], op[2], op[3], op[4], op[5], op[6], op[7]);
      } else if (naam === "ditherRamp") {
        ivDitherRamp(doel, op[1], op[2], op[3], op[4]);
      } else if (naam === "shadow") {
        ivShadow(doel, op[1], op[2]);
      } else if (naam === "light") {
        ivLight(doel, op[1], op[2], op[3]);
      } else if (naam === "noise") {
        ivNoise(doel, op[1], op[2], op[3], op[4]);
      } else if (naam === "ellipse") {
        ivEllipse(doel, op[1], op[2], op[3], op[4], op[5]);
      } else if (naam === "px") {
        ivPixels(doel, op[1], op[2]);
      } else {
        throw new Error("gfx: onbekende op '" + naam + "'");
      }
    }
  }

  // ---- Publieke API --------------------------------------------------------

  var gfx = {

    // De guard die buiten-palet-kleuren betrapt (default uit; tests zetten hem
    // aan). Aangepast uit remake-90s: heette debugEga en controleerde 0–15.
    debugPalet: false,

    // Zet de backing store op. Verwacht een <canvas> van 320×200.
    init: function (doelCanvas) {
      canvas = doelCanvas;
      ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      imageData = ctx.createImageData(BREEDTE, HOOGTE);
      buffer = new Uint8Array(BREEDTE * HOOGTE);
      sceneCache = {};
      return this;
    },

    // De ruwe backing store (Uint8Array met palet-indexen). Handig voor tools.
    getBuffer: function () { return buffer; },

    // Maak het speelveld leeg met één kleur.
    wisSpeelveld: function (kleur) { ivFill(buffer, kleur); },

    // Directe primitieven op de backing store (palet-indexen).
    rect: function (c, x, y, b, h) { ivRect(buffer, c, x, y, b, h); },
    poly: function (c, punten) { ivPoly(buffer, c, punten); },
    line: function (c, punten) { ivLine(buffer, c, punten); },
    dither: function (c1, c2, punten) { ivDither(buffer, c1, c2, punten); },
    gradient: function (c1, c2, x, y, b, h, richting) {
      ivGradient(buffer, c1, c2, x, y, b, h, richting);
    },
    ditherRamp: function (c1, c2, dichtheid, punten) {
      ivDitherRamp(buffer, c1, c2, dichtheid, punten);
    },
    shadow: function (stappen, punten) { ivShadow(buffer, stappen, punten); },
    light: function (stappen, dichtheid, punten) {
      ivLight(buffer, stappen, dichtheid, punten);
    },

    // Dezelfde deterministische ruis die de noise-op gebruikt, publiek gemaakt
    // voor de sfeerlaag in de engine: stof moet elke run op dezelfde plek
    // beginnen, anders is een screenshot niet te vergelijken.
    ruis: function (x, y, seed) { return ruisWaarde(x, y, seed); },
    noise: function (c, dichtheid, seed, punten) {
      ivNoise(buffer, c, dichtheid, seed, punten);
    },
    ellipse: function (c, cx, cy, rx, ry) { ivEllipse(buffer, c, cx, cy, rx, ry); },
    px: function (x, y, c) { zetPixel(buffer, x, y, c); },

    // Teken een scène-picture rechtstreeks op de backing store.
    tekenPicture: function (ops) { voerOpsUit(buffer, ops); },

    // Interpreteer een scène één keer naar een eigen buffer en bewaar die.
    cacheScene: function (id, ops) {
      var doel = new Uint8Array(BREEDTE * HOOGTE);
      voerOpsUit(doel, ops);
      sceneCache[id] = doel;
      return doel;
    },

    // Kopieer een eerder gecachte scène naar de backing store.
    blitScene: function (id) {
      var bron = sceneCache[id];
      if (!bron) throw new Error("gfx: scène niet in cache: " + id);
      buffer.set(bron);
    },

    // Is een scène al gecacht?
    heeftScene: function (id) { return !!sceneCache[id]; },

    // Blit een sprite-frame met transparantie. (x, y) is het ankerpunt
    // (onderkant-midden). opts.spiegel spiegelt horizontaal (west = gespiegeld
    // oost). Aangepast uit remake-90s: de frame-tekens 0–f verwijzen nu naar het
    // sprite-sub-palet (spriteDef.palet) i.p.v. rechtstreeks naar EGA-indexen;
    // AL.palet.subIndex vertaalt ze naar echte paletindexen. Zonder sub-palet
    // valt de blitter terug op het teken als directe index (backward compat).
    tekenSprite: function (spriteDef, animNaam, frameIndex, x, y, opts) {
      opts = opts || {};
      var anim = spriteDef.anims[animNaam];
      if (!anim) throw new Error("gfx: onbekende anim '" + animNaam + "'");
      var subPalet = spriteDef.palet || null;
      var frames = anim.frames;
      var frame = frames[((frameIndex % frames.length) + frames.length) %
        frames.length];
      var h = frame.length;
      var b = frame[0].length;
      // opts.schaal < 1 zet de sprite kleiner neer (dieptewerking: verder weg is
      // kleiner). Nearest-neighbour, doel-gestuurd bemonsterd zodat er geen
      // gaten vallen. Bij schaal 1 is dit pixel voor pixel dezelfde uitkomst als
      // de ongeschaalde blitter die hier stond.
      var schaal = (opts.schaal === undefined || opts.schaal === null)
        ? 1 : opts.schaal;
      var doelB = Math.max(1, Math.round(b * schaal));
      var doelH = Math.max(1, Math.round(h * schaal));
      var linksX = x - Math.floor(doelB / 2);   // ankerpunt onderkant-midden
      var bovenY = y - (doelH - 1);
      for (var dy = 0; dy < doelH; dy++) {
        var sy = Math.min(h - 1, Math.floor(dy * h / doelH));
        var rij = frame[sy];
        for (var dx = 0; dx < doelB; dx++) {
          var sx = Math.min(b - 1, Math.floor(dx * b / doelB));
          var teken = rij.charAt(opts.spiegel ? (b - 1 - sx) : sx);
          if (teken === ".") continue;
          var idx = AL.palet.subIndex(subPalet, teken);
          if (idx < 0) continue;
          zetPixel(buffer, linksX + dx, bovenY + dy, idx);
        }
      }
    },

    // ---- Overgangen ---------------------------------------------------------

    // Leg een overgang over de backing store, met t van 0 (niets) naar 1 (alles
    // kleur). Op een palet-geïndexeerde buffer kan er niet gemengd worden, dus
    // een fade is hier een geordende oplossing in plaats van een vervaging —
    // precies zoals de hardware van toen het deed.
    //
    //   "fade"      geordend raster, gelijkmatig over het beeld
    //   "dissolve"  pseudo-willekeurig per pixel, deterministisch
    //   "iris"      van de randen naar het midden dicht
    overgang: function (soort, t, kleur) {
      var k = (kleur === undefined || kleur === null) ? 0 : kleur;
      keurKleur(k);
      var v = Math.max(0, Math.min(1, t));
      var i;
      if (v <= 0) return;
      if (v >= 1) {
        for (i = 0; i < buffer.length; i++) buffer[i] = k;
        return;
      }
      for (var y = 0; y < HOOGTE; y++) {
        for (var x = 0; x < BREEDTE; x++) {
          var drempel;
          if (soort === "dissolve") {
            drempel = ruisWaarde(x, y, 1);
          } else if (soort === "iris") {
            var dx = (x - BREEDTE / 2) / (BREEDTE / 2);
            var dy = (y - HOOGTE / 2) / (HOOGTE / 2);
            drempel = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2);
          } else {
            drempel = bayer(x, y);
          }
          if (drempel < v) buffer[y * BREEDTE + x] = k;
        }
      }
    },

    // ---- Proportionele prose ------------------------------------------------
    //
    // Dezelfde glyphdata als tekenTekst, maar met de inktmaat uit font.js in
    // plaats van een vaste cel van acht. De monospace-versie blijft bestaan en
    // blijft in gebruik waar een raster hóórt: de statusbalk, de invoerbalk en
    // de terminal van de gesimuleerde pc.
    //
    // Er is bewust geen achtergrondparameter. Een proportionele glyph vult zijn
    // cel niet, dus een achtergrond per teken zou een rafelige band opleveren;
    // wie een vlak achter prose wil, tekent dat eerst zelf.

    // Hoe breed komt deze regel proportioneel uit? Zonder de spatiëring achter
    // het laatste teken, zodat centreren klopt.
    proseBreedte: function (tekst) {
      var font = AL.font;
      var b = 0;
      for (var i = 0; i < tekst.length; i++) b += font.voortgang(tekst.charAt(i));
      return b > 0 ? b - font.spatiering : 0;
    },

    // Prose op (x, y). "\n" begint een nieuwe regel onder de startpositie.
    tekenProse: function (tekst, x, y, kleur) {
      var font = AL.font;
      var cx = x, cy = y;
      for (var i = 0; i < tekst.length; i++) {
        var ch = tekst.charAt(i);
        if (ch === "\n") { cx = x; cy += font.hoogte; continue; }
        var glyph = font.glyphs[ch] || font.glyphs["?"];
        var m = font.maat(ch);
        for (var row = 0; row < font.hoogte; row++) {
          var rij = glyph[row];
          for (var col = 0; col < m.breedte; col++) {
            if (rij.charAt(m.links + col) === "1") {
              zetPixel(buffer, cx + col, cy + row, kleur);
            }
          }
        }
        cx += m.breedte + font.spatiering;
      }
      return cx - x;
    },

    // Bitmaptekst op (x, y) (linkerbovenhoek van de eerste cel). achtergrond
    // null = transparant. "\n" begint een nieuwe regel onder de startpositie.
    tekenTekst: function (tekst, x, y, kleur, achtergrond) {
      var font = AL.font;
      var cx = x, cy = y;
      for (var i = 0; i < tekst.length; i++) {
        var ch = tekst.charAt(i);
        if (ch === "\n") { cx = x; cy += font.hoogte; continue; }
        var glyph = font.glyphs[ch] || font.glyphs["?"];
        for (var row = 0; row < font.hoogte; row++) {
          var rij = glyph[row];
          for (var col = 0; col < font.breedte; col++) {
            if (rij.charAt(col) === "1") {
              zetPixel(buffer, cx + col, cy + row, kleur);
            } else if (achtergrond !== null && achtergrond !== undefined) {
              zetPixel(buffer, cx + col, cy + row, achtergrond);
            }
          }
        }
        cx += font.breedte;
      }
    },

    // Tekst als logo: de 8×8-font op schaal, met een omtreklijn eromheen en een
    // verticaal verloop over de letterhoogte. Daarmee wordt de speelfont
    // letterwerk — groot, omlijnd, en met licht dat van boven komt, precies wat
    // een titelkaart uit 1990 deed.
    //
    // Geeft de gebruikte breedte terug, zodat de aanroeper kan centreren.
    //
    // opts: { schaal, boven, onder, rand, spatie }
    tekenLogo: function (tekst, x, y, opts) {
      opts = opts || {};
      var schaal = opts.schaal || 3;
      var boven = (opts.boven === undefined) ? 34 : opts.boven;
      var onder = (opts.onder === undefined) ? 32 : opts.onder;
      var rand = (opts.rand === undefined) ? 22 : opts.rand;
      var spatie = (opts.spatie === undefined) ? 1 : opts.spatie;
      keurKleur(boven); keurKleur(onder); keurKleur(rand);

      var font = AL.font;
      var celB = font.breedte * schaal + spatie * schaal;
      var breedte = tekst.length * celB;
      var hoogte = font.hoogte * schaal;

      // Eerst een masker van alle gezette pixels opbouwen. Pas daarna tekenen:
      // zo kan de omtreklijn de héle vorm volgen in plaats van per letter, en
      // vreten aangrenzende letters elkaars rand niet op.
      var masker = {};
      var i, row, col, sx, sy;
      for (i = 0; i < tekst.length; i++) {
        var glyph = font.glyphs[tekst.charAt(i)] || font.glyphs["?"];
        for (row = 0; row < font.hoogte; row++) {
          for (col = 0; col < font.breedte; col++) {
            if (glyph[row].charAt(col) !== "1") continue;
            for (sy = 0; sy < schaal; sy++) {
              for (sx = 0; sx < schaal; sx++) {
                var px = x + i * celB + col * schaal + sx;
                var py = y + row * schaal + sy;
                masker[px + "," + py] = true;
              }
            }
          }
        }
      }

      // De omtreklijn: elke buur van een gezette pixel die zelf niet gezet is.
      var buren = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1],
        [-1, 1], [1, 1]];
      var sleutel, deel, mx, my, b;
      for (sleutel in masker) {
        deel = sleutel.split(",");
        mx = +deel[0]; my = +deel[1];
        for (b = 0; b < buren.length; b++) {
          var nx = mx + buren[b][0], ny = my + buren[b][1];
          if (!masker[nx + "," + ny]) zetPixel(buffer, nx, ny, rand);
        }
      }

      // De vulling: een verloop over de letterhoogte, geordend geditherd zodat
      // de overgangen niet als banden lezen.
      var stappen = rampStappen(boven, onder);
      var n = stappen.length;
      for (sleutel in masker) {
        deel = sleutel.split(",");
        mx = +deel[0]; my = +deel[1];
        var t = hoogte <= 1 ? 0 : (my - y) / (hoogte - 1);
        var f = Math.max(0, Math.min(1, t)) * (n - 1);
        var idx = Math.floor(f);
        var frac = f - idx;
        if (idx >= n - 1) { idx = n - 1; frac = 0; }
        zetPixel(buffer, mx, my,
          frac > bayer(mx, my) ? stappen[idx + 1] : stappen[idx]);
      }
      return breedte;
    },

    // Hoe breed tekenLogo zou uitkomen, zonder te tekenen. Voor centreren.
    logoBreedte: function (tekst, opts) {
      opts = opts || {};
      var schaal = opts.schaal || 3;
      var spatie = (opts.spatie === undefined) ? 1 : opts.spatie;
      return tekst.length * (AL.font.breedte * schaal + spatie * schaal);
    },

    // Handschrift: de notitieboek-stem. Ze zet met een éígen glyphset —
    // AL.fontHand uit js/font-hand.js — en niet meer met de gedrukte 8×8-font.
    //
    // Wat hier weg is en waarom (WP 36): tot nu toe was het handschrift de
    // drukfont met een shear van 0,25 en een verticale golf van ±1 px die de
    // aanroeper meegaf. Die golf was index-gebaseerd met periode vier tekens,
    // dus élke regel deinde identiek — op een blad van twaalf regels leest dat
    // als verticale banding, niet als een hand. En een scheefgetrokken
    // bitmapletter blijft een bitmapletter.
    //
    // Nu zit alles wat "hand" moet lezen in de glyphdata: onregelmatige
    // basislijnen per teken (±1 px, gebakken), variabele inktbreedtes, een
    // helling in de stokken en staarten. Wat de renderer nog doet is één ding:
    //
    //   spatiëring   proportioneel (de inktmaat uit font-hand.js) plus een
    //                deterministische variatie van één pixel per teken, zodat
    //                de letters niet op een raster staan. De seed hangt aan de
    //                save, dus een spread ziet er bij elke run hetzelfde uit.
    //
    // versch(i) blijft in de handtekening staan als ontsnappingsluik (een
    // aanroeper die een regel bewust wil laten hellen), maar het spel geeft
    // hem nergens nog mee: de deining zit in de glyphs.
    //
    // opts: { schuin, ruimte, seed, variatie }
    //   schuin    programmatische shear; 0 voor deze font, want de helling is
    //             gebakken. Blijft bestaan omdat het meten hem moet kennen.
    //   variatie  false zet de spatievariatie uit — de hand van de kop, die
    //             trager en gelijkmatiger geschreven is.
    tekenHandschrift: function (tekst, x, y, kleur, versch, opts) {
      opts = opts || {};
      var schuin = (opts.schuin === undefined) ? 0 : opts.schuin;
      var ruimte = (opts.ruimte === undefined) ? 1 : opts.ruimte;
      var variatie = (opts.variatie === undefined) ? true : !!opts.variatie;
      var seed = opts.seed || 1;
      var font = AL.fontHand || AL.font;
      var cx = x;
      for (var i = 0; i < tekst.length; i++) {
        var ch = tekst.charAt(i);
        if (ch === "\n") { cx = x; y += font.hoogte + 1; continue; }
        var dy = versch ? (versch(i) | 0) : 0;
        var glyph = font.glyphs[ch] || font.glyphs["?"];
        var m = font.maat(ch);
        for (var row = 0; row < font.hoogte; row++) {
          // Bovenaan het meest naar rechts: dat is de kant die een pen opgaat.
          var scheef = schuin ? Math.round((font.hoogte - 1 - row) * schuin) : 0;
          var rij = glyph[row];
          for (var col = 0; col < m.breedte; col++) {
            if (rij.charAt(m.links + col) === "1") {
              zetPixel(buffer, cx + col + scheef, y + dy + row, kleur);
            }
          }
        }
        cx += m.breedte + ruimte +
          (variatie && ruisWaarde(i, 7, seed) < 0.35 ? 1 : 0);
      }
      return cx - x;
    },

    // Hoe breed wordt deze regel in handschrift? Zelfde rekensom als hierboven,
    // inclusief de spatievariatie, want anders klopt het wrappen niet. Meet met
    // dezelfde handfont als waarmee getekend wordt — meten en zetten mogen nooit
    // uit elkaar lopen, anders schrijft een regel net over de kolomrand.
    handschriftBreedte: function (tekst, opts) {
      opts = opts || {};
      var ruimte = (opts.ruimte === undefined) ? 1 : opts.ruimte;
      var schuin = (opts.schuin === undefined) ? 0 : opts.schuin;
      var variatie = (opts.variatie === undefined) ? true : !!opts.variatie;
      var seed = opts.seed || 1;
      var font = AL.fontHand || AL.font;
      var b = 0;
      for (var i = 0; i < tekst.length; i++) {
        b += font.maat(tekst.charAt(i)).breedte + ruimte +
          (variatie && ruisWaarde(i, 7, seed) < 0.35 ? 1 : 0);
      }
      // Een schuinstand zou rechtsboven uitsteken; die overhang telt mee.
      return b > 0 ? b - ruimte + Math.round((font.hoogte - 1) * schuin) : 0;
    },

    // ---- Berichtvenster (Sierra-stijl) -------------------------------------

    // Breek een alinea in regels die binnen maxBreedte pixels passen (woordbreuk
    // op spaties). Een "\n" in de tekst is een harde regelafbreking: die delen
    // worden elk apart gewrapt. Retourneert een lijst regels.
    //
    // Meten in pixels in plaats van tekens tellen: met proportionele prose is
    // een regel van 34 tekens niet meer een vaste breedte, en met een raster van
    // 8 px per teken zou een venster dat vol staat met smalle letters een derde
    // van zijn ruimte weggooien.
    //
    // meet(tekst) geeft de breedte in pixels; laat je hem weg, dan wordt er
    // monospace gerekend — zo blijft alles wat op een raster hoort (de terminal)
    // werken zonder aanpassing.
    _wrap: function (alinea, maxBreedte, meet) {
      var font = AL.font;
      var breedteVan = meet || function (t) { return t.length * font.breedte; };
      var harde = String(alinea).split("\n");
      var regels = [];
      for (var h = 0; h < harde.length; h++) {
        var woorden = harde[h].split(" ");
        var huidig = "";
        for (var i = 0; i < woorden.length; i++) {
          var w = woorden[i];
          if (huidig === "") {
            huidig = w;
          } else if (breedteVan(huidig + " " + w) <= maxBreedte) {
            huidig += " " + w;
          } else {
            regels.push(huidig);
            huidig = w;
          }
        }
        regels.push(huidig);
      }
      return regels;
    },

    // Bouw een pagineerbaar venster uit een lijst alinea's. opties.maxTekens
    // (default 36) en opties.maxRegels (default 10) bepalen de vorm; maxTekens
    // is de breedte in monospace-cellen, ook nu de inhoud proportioneel gezet
    // wordt — zo blijft het venster even breed als altijd en past er alleen
    // meer tekst in.
    maakVenster: function (alineas, opties) {
      opties = opties || {};
      var maxTekens = opties.maxTekens || 36;
      var maxRegels = opties.maxRegels || 10;
      var breed = maxTekens * AL.font.breedte;
      var zelf = this;
      var meet = function (t) { return zelf.proseBreedte(t); };
      // Alle alinea's naar regels, met een lege regel tussen alinea's.
      var alleRegels = [];
      for (var a = 0; a < alineas.length; a++) {
        if (a > 0) alleRegels.push("");
        var r = this._wrap(alineas[a], breed, meet);
        for (var k = 0; k < r.length; k++) alleRegels.push(r[k]);
      }
      // In pagina's snijden; een "(meer…)"-regel neemt plaats in, dus een
      // volle pagina houdt één regel over voor de markering.
      var paginas = [];
      if (alleRegels.length <= maxRegels) {
        paginas.push(alleRegels);
      } else {
        var perPagina = maxRegels - 1;
        for (var s = 0; s < alleRegels.length; s += perPagina) {
          paginas.push(alleRegels.slice(s, s + perPagina));
        }
      }
      return {
        paginas: paginas,
        huidige: 0,
        maxTekens: maxTekens,
        maxRegels: maxRegels,
        // "midden" (default) of "onder". Onderaan is voor beelden die zelf
        // iets te vertellen hebben: dan hoort de tekst een onderschrift te zijn
        // en niet een luik over de scène.
        plaatsing: opties.plaatsing || "midden",
        // Het venster krimpt normaal mee met zijn inhoud: een venster van drie
        // regels is drie regels hoog. Zet krimp op false om altijd de volle
        // maxRegels aan te houden — dat is voor een reeks vensters die na
        // elkaar komen en niet mogen zitten springen.
        krimp: opties.krimp !== false,
        // Een vraagvenster wacht op een getypt antwoord in plaats van op een
        // toets. De engine laat de invoerbalk vrij zolang het openstaat; een
        // gewoon venster blokkeert het typen tot het weggeklikt is.
        vraag: opties.vraag === true
      };
    },

    // Is er nog een pagina na de huidige?
    heeftMeer: function (venster) {
      return venster.huidige < venster.paginas.length - 1;
    },

    // Ga naar de volgende pagina (blijft op de laatste staan).
    volgendePagina: function (venster) {
      if (this.heeftMeer(venster)) venster.huidige++;
      return venster;
    },

    // Waar komt dit venster te staan, en hoe groot is het? Apart van het
    // tekenen, zodat de aanroeper kan weten hoeveel van de scène eronder
    // verdwijnt — de eindkaart heeft daar een mening over.
    vensterKader: function (venster) {
      var font = AL.font;
      var regels = venster.paginas[venster.huidige];
      var aantal = regels.length + (this.heeftMeer(venster) ? 1 : 0);
      if (!venster.krimp) aantal = Math.max(aantal, venster.maxRegels);
      var marge = 5, rand = 2;

      // De doos is zo breed als haar breedste régel, niet zo breed als het
      // maximum. Proportionele prose komt smaller uit dan het raster waarop ze
      // gewrapt is, en zonder deze stap staat er rechts een handbreed papier
      // waar niets op staat. Het maximum blijft de bovengrens.
      var tekstB = 0;
      for (var i = 0; i < regels.length; i++) {
        var w = this.proseBreedte(regels[i]);
        if (w > tekstB) tekstB = w;
      }
      if (this.heeftMeer(venster)) {
        var m = this.proseBreedte("(meer…)");
        if (m > tekstB) tekstB = m;
      }
      var max = venster.maxTekens * font.breedte;
      if (!venster.krimp || tekstB > max) tekstB = max;
      // Onder een zekere breedte leest een venster als een tooltip; een kamer
      // beschrijven doe je niet in een doosje van vijftig pixels.
      if (tekstB < 96) tekstB = 96;

      var boxB = tekstB + 2 * marge + 2 * rand;
      var boxH = aantal * (font.hoogte + 1) + 2 * marge + 2 * rand;
      var boxX = Math.floor((BREEDTE - boxB) / 2);
      var boxY = venster.plaatsing === "onder"
        ? (SPEELVELD_BOT - boxH - 4)
        : Math.floor((HOOGTE - boxH) / 2);
      return { x: boxX, y: boxY, b: boxB, h: boxH, marge: marge, rand: rand };
    },

    // Teken de huidige pagina: een blad papier op de zolder, geen dialoogvenster.
    //
    // Wat het venster tot papier maakt zijn vier dingen die er niet in zaten: de
    // slagschaduw (het blad ligt érop, het is er niet in gestanst), de korrel in
    // het papier, de belichting — licht van boven, dus een lichte bovenrand en
    // een donkere onderrand — en de hoekjes die de rand onderbreken. Zonder die
    // vier is het een beige rechthoek met een streepje eromheen.
    tekenVenster: function (venster) {
      var font = AL.font;
      var regels = venster.paginas[venster.huidige];
      var k = this.vensterKader(venster);
      var x = k.x, y = k.y, b = k.b, h = k.h;

      // Slagschaduw: de ondergrond zakt twee stappen in zijn eigen ramp, dus het
      // blad werpt schaduw in de kleur van de kamer eronder in plaats van er een
      // grijze rand naast te leggen.
      ivShadow(buffer, 2, [x + 3, y + h, x + b + 2, y + h,
        x + b + 2, y + h + 2, x + 3, y + h + 2]);
      ivShadow(buffer, 2, [x + b, y + 3, x + b + 2, y + 3,
        x + b + 2, y + h - 1, x + b, y + h - 1]);

      // Het blad zelf, met korrel: papier is geen egale kleur.
      ivRect(buffer, 37, x, y, b, h);
      ivNoise(buffer, 36, 0.16, 71,
        [x, y, x + b - 1, y, x + b - 1, y + h - 1, x, y + h - 1]);
      ivNoise(buffer, 38, 0.08, 72,
        [x, y, x + b - 1, y, x + b - 1, y + h - 1, x, y + h - 1]);

      // Belichting: het licht komt van boven, dus de bovenrand vangt het en de
      // onderrand ligt in zijn eigen schaduw.
      hlijn(buffer, x + 1, x + b - 2, y + 1, 38);
      hlijn(buffer, x + 1, x + b - 2, y + h - 2, 35);
      for (var j = 2; j < h - 2; j++) {
        zetPixel(buffer, x + 1, y + j, 38);
        zetPixel(buffer, x + b - 2, y + j, 35);
      }

      // Het kader: een inktlijn buiten, een goudlijn binnen.
      this._kader(x, y, b, h, 41);
      this._kader(x + 2, y + 2, b - 4, h - 4, 33);
      // Hoekjes die de goudlijn onderbreken — het ornament dat een kader een
      // kader maakt in plaats van een selectiekast.
      var hoeken = [[x + 2, y + 2, 1, 1], [x + b - 3, y + 2, -1, 1],
        [x + 2, y + h - 3, 1, -1], [x + b - 3, y + h - 3, -1, -1]];
      for (var c = 0; c < hoeken.length; c++) {
        var hx = hoeken[c][0], hy = hoeken[c][1];
        var sx = hoeken[c][2], sy = hoeken[c][3];
        zetPixel(buffer, hx + sx * 2, hy, 41);
        zetPixel(buffer, hx, hy + sy * 2, 41);
        zetPixel(buffer, hx + sx, hy + sy, 33);
      }

      // De tekst, proportioneel gezet en met één pixel extra regelafstand: op
      // acht pixels staan de regels van deze font tegen elkaar aan.
      var tx = x + k.rand + k.marge;
      var ty = y + k.rand + k.marge;
      var regelH = font.hoogte + 1;
      for (var i = 0; i < regels.length; i++) {
        this.tekenProse(regels[i], tx, ty + i * regelH, 41);
      }
      if (this.heeftMeer(venster)) {
        this.tekenProse("(meer…)", tx, ty + regels.length * regelH, 40);
      }
      return venster;
    },

    // 1 px dik rechthoekkader (alleen de rand).
    _kader: function (x, y, b, h, c) {
      hlijn(buffer, x, x + b - 1, y, c);
      hlijn(buffer, x, x + b - 1, y + h - 1, c);
      for (var j = 0; j < h; j++) {
        zetPixel(buffer, x, y + j, c);
        zetPixel(buffer, x + b - 1, y + j, c);
      }
    },

    // Publieke kader-helper (voor titel-/eindkaart in de engine).
    kader: function (x, y, b, h, c) { this._kader(x, y, b, h, c); },

    // Zet de backing store op het zichtbare canvas.
    present: function () {
      var pal = AL.palet.KLEUREN;
      var data = imageData.data;
      for (var i = 0; i < buffer.length; i++) {
        var c = pal[buffer[i]] || pal[0];
        var o = i * 4;
        data[o] = c[0];
        data[o + 1] = c[1];
        data[o + 2] = c[2];
        data[o + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  AL.gfx = gfx;

  // Node-export voor headless gebruik (tools, tests).
  if (typeof module !== "undefined") {
    module.exports = gfx;
  }

})();
