// loopveld.js — de meetkunde van de beloopbare vloer: walkboxes, blokken en
// uitgangszones. Eén punt in, één antwoord uit; geen DOM, geen canvas, geen
// staat. De engine gebruikt dit bij elke loopstap, de lint gebruikt het om een
// scène te keuren, en de Node-test toetst het los van de browser.
//
// Waarom hier en niet in js/logic/: dit is geen wereldlogica maar de meetkunde
// van een scène, en het geeft geen { tekst, effecten } terug. js/parser.js staat
// om dezelfde reden op dit niveau — DOM-vrij en Node-testbaar, maar dienend aan
// de renderlaag in plaats van aan het wereldmodel.
//
// Het model (docs/scene-schema.md):
//
//   walkboxes  [[x,y,b,h]]                       waar de vóéten mogen komen
//   blokken    [[x,y,b,h]]                       eraf getrokken: voorwerpen
//   exits      [{ richting, rect: [x,y,b,h] }]   loopt de speler hierin, dan
//                                                betreedt hij de buurkamer
//
// Alle rechthoeken zijn inclusief aan beide kanten: [x,y,b,h] dekt de kolommen
// x t/m x+b-1 en de rijen y t/m y+h-1. De speler is één punt op vloerhoogte —
// zijn voeten — dus een blok hoort de vóétafdruk van een voorwerp te zijn en
// niet zijn geschilderde hoogte.
//
// Geen ES-module: hangt aan het globale AL-object (file://) en exporteert
// daarnaast via module.exports voor Node.

globalThis.AL = globalThis.AL || {};

(function () {

  function inRechthoek(r, x, y) {
    if (!r || r.length !== 4) return false;
    return x >= r[0] && x <= r[0] + r[2] - 1 &&
           y >= r[1] && y <= r[1] + r[3] - 1;
  }

  function inLijst(lijst, x, y) {
    if (!lijst) return false;
    for (var i = 0; i < lijst.length; i++) {
      if (inRechthoek(lijst[i], x, y)) return true;
    }
    return false;
  }

  // Hoe klein iets achteraan in de kamer wordt. De stijlgids vraagt de
  // diepteschaal expliciet en zegt ook hoe hard: "houd het subtiel, rond 0,8
  // achteraan".
  var SCHAAL_ACHTERAAN = 0.84;

  var loopveld = {

    SCHAAL_ACHTERAAN: SCHAAL_ACHTERAAN,

    inRechthoek: inRechthoek,

    // Diepteschaal: wie verder naar achter staat, is kleiner. Eén functie voor
    // álles wat op de vloer van deze kamer staat — de speler én de props uit
    // `hotspots`. Tot WP 35 schaalde alleen de speler mee, en dat maakte de
    // schaalfout juist erger: de figuur kromp naar achter toe terwijl het bureau
    // en de dozen even groot bleven.
    //
    // De schaal loopt over de bewandelbare strook van de scène zelf, niet over
    // een vast getal: elke kamer heeft haar eigen loopstrook, en een vaste
    // bovengrens zou in de ene kamer te veel en in de andere niets doen.
    // Achteraan 0,84, vooraan 1. Op een figuur van eenendertig pixels is dat
    // vijf pixels verschil over de diepte van de kamer — genoeg om te zien, te
    // weinig om te betrappen.
    //
    // Een prop die hóger staat dan de strook (de pc op het bureaublad) valt
    // buiten het bereik en klemt op 0,84: hij staat achteraan in de kamer, en
    // dat is precies de schaal die daarbij hoort.
    diepteSchaal: function (scene, y) {
      var boxen = (scene && scene.walkboxes) || [];
      if (boxen.length === 0) return 1;
      var boven = Infinity, onder = -Infinity;
      for (var i = 0; i < boxen.length; i++) {
        if (boxen[i][1] < boven) boven = boxen[i][1];
        var bot = boxen[i][1] + boxen[i][3] - 1;
        if (bot > onder) onder = bot;
      }
      if (onder <= boven) return 1;
      var t = (onder - y) / (onder - boven);          // 0 vooraan, 1 achteraan
      if (t < 0) t = 0; else if (t > 1) t = 1;
      return 1 - (1 - SCHAAL_ACHTERAAN) * t;
    },

    // Ligt het punt in een walkbox? (Zonder de blokken af te trekken.)
    inWalkbox: function (scene, x, y) {
      return inLijst(scene && scene.walkboxes, x, y);
    },

    // Ligt het punt in een geblokkeerd voorwerp?
    inBlok: function (scene, x, y) {
      return inLijst(scene && scene.blokken, x, y);
    },

    // De enige vraag die de engine stelt: mag de speler hier staan?
    beloopbaar: function (scene, x, y) {
      return this.inWalkbox(scene, x, y) && !this.inBlok(scene, x, y);
    },

    // In welke uitgangszone staat dit punt? Geeft de richting terug, of null.
    // De richting van het lopen doet er niet toe: wie de zone binnenkomt, gaat
    // de trap op — van welke kant hij ook aan komt lopen. Dat is wat een
    // doorgang doet, en het is waarom er geen tweede toets bij nodig is.
    uitgangBij: function (scene, x, y) {
      var lijst = (scene && scene.exits) || [];
      for (var i = 0; i < lijst.length; i++) {
        if (inRechthoek(lijst[i].rect, x, y)) return lijst[i].richting;
      }
      return null;
    },

    // Welke richtingen heeft deze scène als uitgangszone? (Voor de lint.)
    uitgangRichtingen: function (scene) {
      var lijst = (scene && scene.exits) || [];
      var uit = [];
      for (var i = 0; i < lijst.length; i++) {
        if (uit.indexOf(lijst[i].richting) === -1) uit.push(lijst[i].richting);
      }
      return uit;
    },

    // Raakt een walkbox de schermrand aan deze kant? Dan is de rand zelf de
    // uitgang: de engine laat de speler eroverheen lopen (oost/west). Het
    // speelveld loopt van y VELD_TOP tot VELD_BOT; x van 0 tot 319.
    raaktRand: function (scene, richting, veldTop, veldBot) {
      var top = (veldTop === undefined) ? 8 : veldTop;
      var bot = (veldBot === undefined) ? 189 : veldBot;
      var boxen = (scene && scene.walkboxes) || [];
      for (var i = 0; i < boxen.length; i++) {
        var b = boxen[i];
        if (richting === "west" && b[0] <= 0) return true;
        if (richting === "oost" && b[0] + b[2] - 1 >= 319) return true;
        if (richting === "noord" && b[1] <= top) return true;
        if (richting === "zuid" && b[1] + b[3] - 1 >= bot) return true;
      }
      return false;
    }
  };

  AL.loopveld = loopveld;

  // Node-export voor de headless tests en tools/lint-scene.mjs.
  if (typeof module !== "undefined") {
    module.exports = loopveld;
  }

})();
