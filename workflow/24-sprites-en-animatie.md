# 24 — Sprites en animatie

Werkpakket H van het opwaarderingsprogramma (zie
`workflow/15-opwaardering-kickoff.md`). Doel: de speler leeft.

## Opdracht

Uit het goedgekeurde plan, WP H:

> Ademende idle, een loopcyclus van vier tot zes frames met armzwaai, een
> draaiframe, en een "gaat aan de pc zitten"-animatie. Dieptescaling toegepast.
> De stijlgids staat ≤ 16×32 toe; de huidige sprite is 13×25 en gebruikt die
> ruimte niet.

Plus twee dingen die met adres naar dit pakket zijn doorgeschoven:

- uit WP E deel 1: *"de speler wordt niet kleiner naar achter. De
  sprite-schaling uit WP B ligt klaar, maar de loopstrook is 39 px hoog"*;
- uit WP E deel 2: *"het trapgat in `overloop` (y140–189) overlapt de loopstrook
  (y152–189), dus wie via het zuiden binnenkomt staat ín het gat."*

## Aanpak

### Wat er mis was, precies

De figuur had per richting één sta-frame en twee loopframes, en in die
loopframes bewogen **alleen de voeten**. Daardoor las lopen niet als lopen maar
als schuifelen: een romp die op constante hoogte over de vloer glijdt terwijl er
onderaan iets wisselt.

### Vier dingen erbij

**Ademen.** Elke sta-anim heeft nu twee frames op 1 Hz. Op het tweede zakt het
hoofd één pixel en wordt de mantel één rij korter. Eén pixel op vijfentwintig is
vier procent — en het verschil tussen een sprite en een standbeeld.

**Deining.** De loopcycli hebben vier frames: twee steunfases (voeten uit
elkaar) en twee doorzwaaifases (voeten bij elkaar). De doorzwaaiframes zijn
**zesentwintig** rijen hoog in plaats van vijfentwintig. Omdat het ankerpunt
onderaan-midden ligt, staan de voeten dus stil en gaat de rómp een pixel omhoog
— precies wat er gebeurt als je over je steunbeen heen rolt.

Dat ene pixel doet meer voor "dit is lopen" dan de voetstanden samen, en het
kost geen extra breedte: de hoogte van een frame is vrij, de breedte niet.

**Armzwaai.** Alleen in het zijaanzicht. Een mouw van twee pixels komt vóór de
mantel uit en zwaait in vier fasen: vooruit, half, weg, half. Van voren en van
achteren zitten de armen ín het silhouet; daar zou een arm een rode vlek zijn en
niets meer.

**Draai en zitten.** Eén driekwartframe, en drie frames staan-hurken-zitten.

### Diepteschaling

`tekenSprite` kon al schalen sinds WP B, maar niemand riep het aan. De schaal
loopt nu over de bewandelbare strook van de scène zelf — niet over een vast
getal, want elke kamer heeft haar eigen strook en een vaste bovengrens zou in de
ene kamer te veel en in de andere niets doen. Achteraan 0,84, vooraan 1,0.

## Beslissingen

### De 39-pixelstrook bleek genoeg

WP E deel 1 concludeerde dat er "geen zinnige diepte op te schalen valt zonder
de walkboxes te herzien". Dat is gemeten en het klopt niet. Op de loopstrook van
`zolder-west` staat de speler achteraan op y151 en vooraan op y186 — 35 pixels,
en met 0,84 achteraan scheelt dat vier pixels op een figuur van vijfentwintig.
Naast elkaar gelegd is dat duidelijk te zien, en geen van beide standen ziet
kapot uit.

Vier kamers hertekenen om de loopstrook hoger te maken was dus onnodig, en het
zou risico zijn geweest: een hogere strook laat de speler achter de dozen en de
kist lopen, en die staan in de gecachete achtergrond gebakken. Dan zou de figuur
er dwars dóórheen lopen, en dan had ik ook nog vier voorgrondlagen mogen
tekenen. Dat is werk voor een pakket dat om diepte-in-de-scène gaat, niet om
animatie.

Wat wél waar was aan die noot: op een sprite van 13 px breed gooit een schaal
van 0,84 twee kolommen weg, en dat kost gezichtsdetail. Vandaar 0,84 en niet
0,8: het is de grootste stap waarbij het silhouet niet begint te rafelen.

### De zit-animatie stelt de overlay uit, niet de modus

De pc-overlay dekt het canvas volledig af. Zou ze meteen opengaan, dan is er
geen enkel frame waarin de zit-animatie te zien is — hoe mooi ze ook is. De
overlay wacht dus tot de drie frames gezet zijn.

De **modus** wacht níet. Daar hangen de invoerblokkering en de save aan, en die
horen niet een halve seconde achter te lopen op wat de speler net gedaan heeft.
Tijdens de animatie staat `toestand.modus` dus al op `"pc"` terwijl de overlay
nog dicht is.

Dat legde een latente race in de rooksmaaktesten bloot. Negen plekken deden:

```js
await page.waitForFunction(() => window.AL.debugState.modus === "pc");
check("de pc-overlay opent", st.modus === "pc" && st.overlayOpen === true);
```

Wachten op A en dan B beweren werkte alleen omdat A en B tot nu toe hetzelfde
moment waren. Alle negen wachten nu op de overlay zélf. `debugState` heeft er
een `zitAnimatie`-vlag bij, zodat het verschil zichtbaar is in plaats van
geïmpliceerd.

### Er wordt niet naar de stoel gelopen

De speler gaat zitten waar hij staat. Dat lijkt slordig tot je de prose leest:
*"Je schuift Alberta's stoel bíj en legt je handen op het toetsenbord."* De
stoel komt naar jou. Naar de stoel toe lopen zou padvinding vragen, en het zou
de tekst tegenspreken.

### Het trapgat verhuist naar achter

Het gat liep van y140 tot y188 terwijl de loopstrook op y152 begint. Wie via het
zuiden binnenkwam, stond dus letterlijk in het gat, en zo zag het er ook uit.

Het gat eindigt nu op y152, de voorrand van de strook: je loopt eromheen, niet
erin. De treden zijn navenant korter en staan om en om licht en donker, want in
één verloop lazen ze als een grijze bak in plaats van als treden.

De leuning is meeverhuisd, en dat was de tweede fout: ze stond op y108–142, dus
bóven het gat tegen de wand, waar ze als een plank las. Ze staat nu op de
voorrand van het gat en dus tussen de speler en de diepte in.

### De sprite-lint staat in de testsuite

De QC-poort van dit pakket zegt "sprite-lint", en die bestond niet. Frames zijn
met de hand getypte pixel-strings, en één teken te veel of te weinig is met het
blote oog niet te zien: de renderer leest de breedte uit rij nul, dus een te
korte rij daaronder verschuift stilletjes de rest van dat frame.

`test/test-sprites.mjs` keurt nu: rechthoekigheid, gelijke breedte binnen een
anim, hoogteverschil van hoogstens één rij (behalve bij zitten), maten binnen de
stijlgids, elk teken binnen het sub-palet, het anker, de aanwezigheid van elke
anim die de engine opvraagt, en de afwezigheid van `-west`.

Die keuring bewees zich meteen: `loop-oost` had **geen deining** — ik was in de
twee doorzwaaiframes de extra mantelrij vergeten. Op het scherm zou dat
neerkomen op "het zijaanzicht schuifelt nog steeds", en dat had ik pas gezien
als ik lang genoeg naar de goede richting had gekeken.

### Wat níét is gebeurd

- **De sprite is niet groter gemaakt.** Het plan merkte op dat 13×25 de
  toegestane 16×32 niet gebruikt. Dat is waar, maar breder maken betekent de
  figuur opnieuw tekenen, en de figuur werkt: hij leest als een gehuld kind met
  een rode mantel. De ruimte die de animatie nodig had zat in de hóogte, en die
  was vrij.
- **Geen loopcyclus van zes frames.** Vier is wat er in dertien pixels breedte
  uitdrukbaar is; frames vijf en zes zouden duplicaten met een pixel verschil
  zijn.
- **De walkboxen van de vier kamers zijn niet herzien** — zie de beslissing
  hierboven.

## Wat er is veranderd

| Bestand | Wat |
|---|---|
| `js/sprites/sprite-speler.js` | ademende sta-anims, vier-frame loopcycli met deining, armzwaai opzij, `draai`, `zit-oost` |
| `js/engine.js` | `actorSchaal()` over de loopstrook; draaiframe bij een aswissel; de zit-reeks stelt de overlay uit; `zitAnimatie` in `debugState` |
| `js/scenes/scene-overloop.js` | trapgat naar achter, treden om en om, leuning op de voorrand |
| `test/test-sprites.mjs` | nieuw, tien keuringen |
| negen `test/smoke-*.mjs` | wachten op de overlay in plaats van op de modus |
| `docs/art-stijlgids.md` | animatieregels en de nieuwe anims in de spec-tabel |

## QC-resultaat

Gemeten, niet aangenomen:

- `npm test` — **296 tests, 296 groen** (286 bij aanvang; tien nieuwe).
- `node tools/lint-scene.mjs` — schoon op tien scènes plus de schetsenset.
- `node tools/check-assets.mjs` — geen drift.
- De zes rooksmaaktesten via `file://`: `smoke-browser` 21/21,
  `smoke-full-playthrough` 94/94, `smoke-levels-1-3` 32/32, `smoke-levels-4-7`
  48/48, `smoke-pc` 21/21, `smoke-sim` 13/13. Samen 229 controles, geen
  JavaScript-fouten op de pagina.
- Visueel: de loopcyclus frame voor frame uitgesneden op acht keer vergroting;
  de diepte naast elkaar gelegd op y151 en y186, zowel uitgesneden als op
  spelgrootte; het zit-frame op het canvas vóór de overlay opengaat; de
  overloop met de speler naast in plaats van in het trapgat.
- `smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container.

## Volgende

**WP I — geluid.** Een procedurele muzieklaag in WebAudio in OPL-stijl, foley,
en `ambient-zolder` dat sinds WP 6 als cue bestaat en nooit is afgevuurd.
