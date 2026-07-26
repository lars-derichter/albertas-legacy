# Scène-schema

Het formaat van een scènebestand in `js/scenes/`. Dit document beschrijft wat
de engine met elk veld dóét, niet wat het ooit had moeten doen: het is de
tegenhanger van `tools/lint-scene.mjs`, dat elke scène tegen deze afspraken
keurt. Waar de tekening zelf ter sprake komt — welke op je wanneer gebruikt en
hoe een kamer eruit hoort te zien — is `art-stijlgids.md` de baas; hier staat
alleen de vorm.

Het schema is overgenomen uit de remake-90s-engine en op twee punten
uitgebreid: het palet is groter (0–63 in plaats van EGA-16), en er zijn twee
velden bij gekomen die de vloer eerlijk maken — `blokken` en `exits`
(WP 32, `workflow/28-kwaliteitsreview-kickoff.md`, bevindingen A t/m C).

## Een scène in het kort

Een scènebestand hangt één object aan `AL.scenes[<id>]`. Het is platte data:
getallen, strings en arrays, geen functies, geen klasse-instanties. Het wordt
niet mee opgeslagen in de save — de staat bewaart alleen `sceneId` — en het is
dus veilig om een scène tussen twee versies te hertekenen.

```js
globalThis.AL = globalThis.AL || {};
AL.scenes = AL.scenes || {};

AL.scenes["zolder-west"] = {
  id: "zolder-west",
  picture:   [ /* draw-ops, van achter naar voor */ ],
  walkboxes: [ [6, 150, 314, 39] ],
  blokken:   [ [10, 150, 104, 20], [146, 150, 96, 28] ],
  exits:     [],
  entries:   { start: [80, 175], vanOost: [300, 175] },
  hotspots:  [ { item: "notitieboek", sprite: "notitieboek", x: 196, y: 140 } ],
  sfeer:     [ { soort: "stof", x: 174, y: 82, b: 104, h: 104, aantal: 22,
                 kleur: 34, seed: 3, snelheid: 0.018 } ],
  overlays:  [ { baselineY: 200, ops: [ /* draw-ops */ ] } ]
};
```

| Veld | Type | Gelezen door |
|---|---|---|
| `id` | string | de lint (moet gelijk zijn aan de bestandsnaam) |
| `picture` | draw-ops | `gfx.cacheScene` — één keer getekend en daarna geblit |
| `walkboxes` | `[[x,y,b,h]]` | `loopveld.beloopbaar`, `engine.actorSchaal` |
| `blokken` | `[[x,y,b,h]]` | `loopveld.beloopbaar` |
| `exits` | `[{richting, rect}]` | `loopveld.uitgangBij` in de engine-tik |
| `entries` | `{naam: [x,y]}` | `engine.positioneerActor` |
| `hotspots` | `[{item, sprite, …}]` | `engine.tekenPropsEnActor`, `engine.startZitten` |
| `sfeer` | `[{soort, …}]` | `engine.tekenSfeer` |
| `overlays` | `[{baselineY, ops}]` | `engine.tekenOverlays` |

## Het coördinatenstelsel

Het beeld is 320×200 pixels, palet-geïndexeerd. Drie stroken:

| Rijen | Wat |
|---|---|
| `y 0–7` | de statusbalk (kamernaam), door de engine getekend |
| `y 8–189` | het **speelveld**: alles wat een scène tekent, hoort hier |
| `y 190–199` | de invoerbalk met de prompt en de cursor |

De grenzen heten in de engine `VELD_TOP` (8) en `VELD_BOT` (189). De lint
weigert elke coördinaat erbuiten — ook in een overlay, want die tekent op
hetzelfde veld.

Twee conventies die overal terugkomen:

- **Een rechthoek `[x, y, b, h]` is inclusief.** Ze dekt de kolommen `x` t/m
  `x+b-1` en de rijen `y` t/m `y+h-1`. `[146,150,96,28]` loopt dus tot en met
  x241 en y177, niet tot 242 en 178.
- **Alles staat op zijn voeten.** Het ankerpunt van een sprite is
  onderkant-midden (`sprite-schema.md`), en de speler is voor de vloer één punt:
  zijn voeten. Een `y` in `walkboxes`, `blokken`, `entries`, `hotspots` en
  `exits` is dus altijd een vloerhoogte, nooit een ooghoogte.

## picture: de tekening

Een lijst draw-ops die één keer wordt uitgevoerd en daarna als bitmap in de
scène-cache staat (`gfx.cacheScene` / `gfx.blitScene`). Wat er in de picture
staat, kan dus nooit meer van staat veranderen en nooit vóór de speler komen —
daarvoor zijn `hotspots` (sprites) en `overlays` (voorgrond).

De elf ops, hun signatuur en hun gebruik staan in `art-stijlgids.md`,
§"De draw-ops": `fill`, `rect`, `poly`, `line`, `dither`, `ellipse`, `px`,
`gradient`, `ditherRamp`, `shadow`, `light`, `noise`. De lint controleert per op
de ariteit, de kleurindexen (0 t/m `AL.palet.aantal - 1`) en de grenzen van elk
punt; de betekenis van de ops is de zaak van de stijlgids.

Er is géén apart `licht`-veld. Licht is een op (`light`), geen laag: ze hoort
achteraan in de picture, want licht valt op een kamer en ligt er niet onder.

## walkboxes: waar de voeten mogen komen

`walkboxes: [[x, y, b, h], …]` — de vereniging van de rechthoeken is de vloer.
Een punt telt als beloopbaar als het in minstens één walkbox ligt en in géén
blok.

- **Een walkbox die een schermrand raakt, ís een uitgang.** De engine laat de
  speler over de oost- en westrand lopen: gaat de doelpositie voorbij x0 of
  x319, dan roept ze `AL.world.betreed` aan met die richting. Raakt een strook
  een rand waar de zolderkaart in `js/logic/world.js` geen kamer heeft, dan
  loopt de speler tegen een geschilderde muur het beeld uit. De lint keurt dat
  af; versmal de strook (`zolder-west` begint daarom op x6, `zolder-oost`
  eindigt op x311).
- **Noord en zuid gaan nooit via een rand.** Een kamer die tot y8 beloopbaar is,
  heeft geen achterwand meer, en tot y189 geen voorgrond. Daarvoor bestaat
  `exits`.
- De walkboxes bepalen ook de **diepteschaal** van de speler: de engine neemt de
  bovenste en de onderste rij van alle stroken samen en schaalt de figuur
  daartussen van 1 naar 0,84. Een strook versmallen verandert dus niets aan de
  schaal, een strook dieper of ondieper maken wél.

## blokken: de voetafdruk van wat er staat

`blokken: [[x, y, b, h], …]` — rechthoeken die van de walkboxes worden
afgetrokken. Zonder dit veld liep de speler dwars door de kist, het bureau, de
stoel en elke dozenstapel heen.

Twee regels, allebei uit de manier waarop de kamer getekend wordt:

- **Blokkeer de voet, niet de hoogte.** De speler is zijn voeten. Een kast van
  honderd pixels hoog bezet een strook vloer van tien pixels diep; dát is het
  blok. Neem de contactschaduw mee — die staat er juist om te tonen waar het
  voorwerp de vloer raakt.
- **Geschilderd = tot achteraan blokkeren; sprite = alleen de onderkant.** Wat
  in de `picture` staat, zit in de gecachete achtergrond en kan de speler dus
  nooit afdekken: kan hij erachter lopen, dan loopt hij er zichtbaar
  bovenlangs. Blokkeer daarom tot aan de bovenrand van de loopstrook. Een
  `hotspot`-sprite wordt wél op voet-y gesorteerd en dekt de speler netjes af,
  dus daar is alleen de onderste band nodig — achter een doos lopen mag.

Een blok mag geen enkel `entries`-punt dekken en geen uitgang onbereikbaar
maken; de lint controleert allebei.

## exits: de uitgangen die geen rand zijn

```js
exits: [ { richting: "noord", rect: [150, 118, 42, 8] } ]
```

Loopt de speler met zijn voeten in `rect`, dan doet de engine precies wat een
randkruising doet: `AL.world.betreed(toestand, richting)`, met de entry aan de
overkant (`noord` → `vanZuid`, enzovoort) en een fade over de nieuwe kamer.
Geen venster, geen tweede toets — je loopt de trap op omdat je de trap op loopt.

- `richting` is `noord`, `oost`, `zuid` of `west` en moet op de zolderkaart in
  `js/logic/world.js` bestaan voor deze kamer.
- De looprichting van de speler doet er niet toe: wie de zone binnenkomt, gaat
  door de doorgang, van welke kant hij ook aan komt lopen.
- De zone vuurt op het moment dat de speler hem **binnenkomt**, niet elke tik.
- **Een `entries`-punt mag nooit in een zone liggen.** Anders zet de engine de
  speler bij het betreden meteen weer in de uitgang en stuitert hij terug. Zet
  de entry er een paar pixels onder (`zolder-midden.vanNoord` staat op y132,
  de zone eindigt op y125).
- Oost en west mógen een zone gebruiken als de doorgang smaller is dan de hele
  rand; de vier zolderkamers doen dat niet, daar is de rand zelf de doorgang.

## entries: waar de speler landt

`entries: { start: [x, y], vanNoord: […], vanOost: […], vanZuid: […],
vanWest: […] }`. De engine kiest de entry die tegenover de looprichting ligt
(`TEGENGESTELD` in `engine.js` en `world.js`) en valt terug op `start`. Elke
entry moet beloopbaar zijn: in een walkbox, buiten elk blok, buiten elke zone.

## hotspots: de voorwerpen die sprites zijn

```js
hotspots: [ { item: "pc", sprite: "pc", anim: "aan", x: 196, y: 118 } ]
```

Een hotspot wordt elk frame geblit, op voet-y gesorteerd met de speler ertussen
(painter's order). `item` is de naam die de lint kent — `notitieboek`, `pc`,
`broncode-doos`, `doos`, `stoel` — en verder niets: de interactie loopt via
getypte zelfstandige naamwoorden in `js/logic/world.js`, niet via een klik of
een botsing. `anim` is optioneel (standaard `idle`), `spiegel` ook.

Twee dingen die de engine sinds WP 35 met een hotspot doet:

- **Ze schaalt mee met de diepte**, met dezelfde
  `AL.loopveld.diepteSchaal(scene, y)` als de speler. Het anker is
  voeten-midden, dus een geschaalde prop blijft op zijn eigen vloerpunt staan.
  Een prop die hóger staat dan de loopstrook — de pc op het bureaublad — klemt
  op de achterste schaal, en dat is precies de schaal van de plek waar hij
  staat. Wat dit betekent voor het tekenen, staat in `art-stijlgids.md`,
  §Diepte en voorgrond.
- **De stoel is de zitplek.** `engine.startZitten` zoekt in de kamer de hotspot
  met `item: "stoel"` en zet de speler daar neer vóór de zit-animatie begint.
  Dat is de enige plek waar zijn handen op de voorrand van het bureaublad
  uitkomen. De zitplek mág in een blok liggen: de speler wordt er neergezet en
  loopt er niet naartoe, en na de pc-overlay zet `betreedZolder` hem terug op de
  entry van de kamer.

Wil je dat de speler niet dwars door zo'n voorwerp loopt, dan hoort er een blok
bij. Een hotspot is tekening, geen collisie.

## sfeer: het enige dat beweegt

`sfeer: [{ soort: "stof", x, y, b, h, aantal, kleur, seed, snelheid }]` —
deeltjes die na de scène-blit over het beeld gaan. `soort` kent één waarde:
`stof`. `aantal` ligt tussen 1 en 80, `seed` maakt de val deterministisch.

## overlays: de voorgrond

`overlays: [{ baselineY, ops }]`. De ops worden élk frame getekend (ze zitten
niet in de cache) en de `baselineY` bepaalt de volgorde: staat de speler verder
naar achter dan die voet (`actorY < baselineY`), dan komt de overlay vóór hem.
Zo verdwijnt hij achter een balk of een stapel in silhouet.

Een overlay is geen muur. De stapel op de oostrand van `zolder-midden` staat
er juist om de speler achterlangs te laten verdwijnen terwijl hij de kamer uit
loopt; er hoort dus géén blok bij.

## Wat er niet (meer) in het schema staat

`props` is er niet. Het veld heeft bestaan, stond leeg in élke scène en werd
door niets gelezen: alles wat een prop had moeten zijn, is een `hotspot`
geworden. WP 38 heeft het uit de tien scènebestanden, uit de terugvalscène van
de engine en uit dit schema gehaald; de lint keurt een scène af die het nog
zet, zodat een oud bestand niet stilletjes iets meebrengt wat niemand blit.

`hotspot.item` was tot WP 35 wél dood — de renderlaag las het niet en de
wereldlogica kent haar voorwerpen bij naam — maar het is dat niet meer:
`engine.startZitten` zoekt er de stoel mee op (zie §hotspots hierboven). Het is
dus een gewoon veld met een gebruiker, en de lint blijft de namen keuren.

## Wat de lint controleert

`node tools/lint-scene.mjs [scène-id …]` — zonder argumenten alle scènes plus
`spread-schetsen.js`. Ze zakt op:

1. een `id` die niet bij de bestandsnaam past;
2. een onbekende op, een verkeerde ariteit, een kleur buiten het palet of een
   punt buiten `y 8–189` / `x 0–319`;
3. een ontbrekende of buiten het veld vallende walkbox, blok of exit-rect;
4. een entry buiten de walkboxes, ín een blok of ín een uitgangszone;
5. een uitgangszone zonder één beloopbare pixel (onbereikbaar);
6. een verbinding op de zolderkaart zonder mechanisme — geen walkbox aan die
   rand en geen zone;
7. een walkbox tegen een rand waar geen kamer achter ligt;
8. een hotspot met een onbekend `item` of een leeg `sprite`-veld;
9. een sfeerlaag met een onbekende soort, een verkeerd aantal of een kleur
   buiten het palet;
10. een overlay zonder `baselineY` of zonder `ops`.

De navigatiecontroles (5 t/m 7) draaien alleen voor de kamers die in
`js/logic/world.js` op de kaart staan; de titelkaart, de openingsbeelden, de
eindkaart en de diskette-kaart hebben een pro-formastrook en geen buren.
