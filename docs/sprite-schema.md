# Sprite-schema

Het formaat van een spritebestand in `js/sprites/`. Dit document beschrijft wat
`AL.gfx.tekenSprite` met elk veld dóét; welke sprites er zijn, hoe groot ze
mogen zijn en hoe ze horen te bewegen, staat in `art-stijlgids.md`,
§"Sprite-specificaties". De keuring zelf leeft in `test/test-sprites.mjs` en
loopt dus bij elke `node --test` mee.

Het formaat is overgenomen uit de remake-90s-engine — één teken per pixel,
`.` transparant — met één uitbreiding: elke sprite draagt zijn eigen sub-palet,
zodat een compacte pixel-string toch uit de volle 64 kleuren kan putten.

## Een sprite in het kort

Een spritebestand hangt één object aan `AL.sprites[<naam>]` en exporteert het
daarnaast via `module.exports` voor de lint.

```js
globalThis.AL = globalThis.AL || {};
AL.sprites = AL.sprites || {};

AL.sprites["doos"] = {
  ankerpunt: "voeten-midden",
  palet: [0, 23, 26, 27, 41, 36],
  anims: {
    "idle": { fps: 0, frames: [
        [
          "......................",
          "..000000000000000000..",
          ".03333333311333333330.",
          "......................"
        ]
    ] }
  }
};

if (typeof module !== "undefined") {
  module.exports = AL.sprites["doos"];
}
```

| Veld | Type | Wat het doet |
|---|---|---|
| `ankerpunt` | string | documentatie én harde regel: altijd `"voeten-midden"` |
| `palet` | `[index, …]` | het sub-palet: lokaal teken → echte paletindex |
| `anims` | `{naam: {fps, frames}}` | de animaties, op naam aangesproken |

## Het ankerpunt

`(x, y)` in `tekenSprite` is de **onderkant-midden** van het frame: de voeten.
De renderer rekent `linksX = x - floor(breedte / 2)` en
`bovenY = y - (hoogte - 1)`. Daar volgt alles uit wat de stijlgids over
animatie zegt:

- Een frame dat één rij hóger is, laat de romp stijgen terwijl de voeten blijven
  staan — dat is de deining van een loopcyclus.
- Een frame dat korter is, zakt in elkaar op dezelfde plek — dat is het gaan
  zitten.
- Frames van één anim die in **breedte** verschillen, schuiven de hele figuur
  een halve pixel op. Dat leest als trillen, en de lint zakt erop.

Bij een even breedte ligt het anker een pixel links van het wiskundige midden.
Dat is de conventie van de predecessor; ze staat vast omdat alle frames er op
uitgelijnd zijn.

`ankerpunt` is dus geen keuze maar een verklaring: er is één waarde,
`"voeten-midden"`, en `test-sprites.mjs` eist ze van elke sprite uit de spec.

## Het sub-palet

`palet: [i0, i1, … i15]` — hoogstens zestien indexen uit het 64-kleuren-palet
van `js/palette.js`. In een frame verwijst het teken `0`–`f` (hexadecimaal) naar
de plaats in díé lijst, `.` is transparant. `AL.palet.subIndex` doet de
vertaling; zonder `palet` telt het teken als een rechtstreekse paletindex.

Zet de kleuren in een vaste volgorde en zet ze in de kop van het bestand in
commentaar, één regel per index:

```
//   0 -> 0  zwart (zolen, contactrand)
//   1 -> 42 trui diepst (mouwnaad, zoom)
//   2 -> 43 trui schaduw (de linkerkant)
//   3 -> 44 trui mid
//   4 -> 45 trui licht (de dakraamkant, rechts)
```

Zet de trappen van een ramp op volgorde van donker naar licht, en houd die
volgorde gelijk voor elk kledingstuk in dezelfde sprite. Dan is een frame te
lezen als een hoogtekaart van het licht in plaats van als een lijst nummers.

Zonder die legenda is een frame niet te lezen en dus niet te onderhouden. De
lint controleert dat elk teken binnen het sub-palet valt en dat elke index in
het palet bestaat.

## De animaties

`anims` is een object van naam naar `{ fps, frames }`.

- **`frames`** is een array van frames; een frame is een array van strings, één
  string per rij, één teken per pixel. Alle rijen van één frame zijn even lang —
  de renderer leest de breedte uit rij nul, dus een te korte rij verschuift
  stilletjes de rest.
- **`fps`** is het tempo waarop de engine door de frames loopt. De frame-index
  is `floor(animTijd * fps)` modulo het aantal frames; bij `fps: 0` staat de
  anim op frame 0 en zet de engine de frames zelf, één voor één.

De namen zijn afspraken tussen de sprite en de engine, geen vrije keuze:

| Naam | Wie speelt hem |
|---|---|
| `idle` | de standaard voor een hotspot zonder `anim` in de scène |
| `sta-noord` / `sta-oost` / `sta-zuid` | de speler die stilstaat |
| `loop-noord` / `loop-oost` / `loop-zuid` | de speler die loopt |
| `draai` | twee tikken lang, bij een wissel van de noord-zuidas naar de oost-westas |
| `zit-oost` | de zit-reeks vóór de pc-overlay opengaat (`fps: 0`, frame per tik) |
| `aan` | de pc met een brandend scherm (scène-hotspot met `anim: "aan"`) |
| `open` | de broncode-doos nadat ze opengemaakt is |

**West bestaat niet.** De engine spiegelt de oost-frames
(`opts.spiegel`); lever dus geen `-west`-anims en vermijd asymmetrie die
gespiegeld fout oogt — belichting van één kant flipt mee.

Dat laatste is geen theorie: `sprite-speler.js` is van rechts belicht omdat het
dakraam rechts staat, en naar het westen lopen zet het licht dus links. De
afweging is bewust en staat in de kop van dat bestand: aparte `-west`-anims
zouden het aantal frames verdubbelen voor een fout die je alleen ziet zolang je
een pijltoets ingedrukt houdt. Teken daarom liever niets wat alleen kán kloppen
in één spiegeling — een gereedschap in de rechterhand, een tas over één
schouder.

## Wat de renderer met een frame doet

`AL.gfx.tekenSprite(def, animNaam, frameIndex, x, y, opts)`:

- `opts.spiegel` keert het frame horizontaal om (west = gespiegeld oost);
- `opts.schaal` zet de sprite kleiner of groter neer met nearest-neighbour,
  doel-gestuurd bemonsterd zodat er geen gaten vallen. Het anker blijft
  onderaan-midden, dus een geschaalde figuur blijft op dezelfde vloer staan. De
  engine gebruikt dit voor de diepteschaal van de speler (1 vooraan tot 0,84
  achteraan, over de diepte van de walkboxes);
- een teken dat buiten het sub-palet wijst, wordt overgeslagen in plaats van
  gekleurd — een fout in een frame maakt een gat, geen verkeerde kleur.

Een sprite tekent altijd óver wat er al staat. De scène-laag sorteert hotspots
en de speler op voet-`y` (painter's order), zodat wie vooraan staat, afdekt wat
erachter staat. Dat is ook waarom een `hotspot` geen collisie heeft: wil je dat
de speler er niet doorheen loopt, dan hoort er een blok in de scène bij
(`scene-schema.md`, §Blokken).

## Wat de lint controleert

`test/test-sprites.mjs`, meegenomen in `node --test test/`:

1. elke sprite uit de spec bestaat, heeft `ankerpunt: "voeten-midden"` en een
   sub-palet van hoogstens zestien geldige indexen;
2. elk frame is rechthoekig (alle rijen even lang);
3. elk teken in elk frame wijst binnen het sub-palet;
4. geen frame komt buiten de maat uit `art-stijlgids.md`;
5. frames binnen één anim schelen hoogstens één rij in hoogte (de deining) —
   `zit-oost` is de uitzondering, want daar is het inzakken het punt;
6. frames binnen één anim zijn even breed;
7. de speler heeft alle anims die de engine opvraagt, de loopcycli hebben vier
   frames met deining, de sta-anims twee frames met een tempo, en een eenmalige
   anim staat op `fps: 0`.
