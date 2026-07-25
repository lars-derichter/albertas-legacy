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

  var loopveld = {

    inRechthoek: inRechthoek,

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
