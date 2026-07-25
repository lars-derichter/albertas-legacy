# 34 — Nieuwe spelersprite

Werkpakket 34 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). Doel: de speler is niet langer
Roodkapje.

## Opdracht

Uit het goedgekeurde programma, WP 34:

> Neutrale erfgenaam-figuur, geen mantel of lang haar, ~31 px hoog (binnen
> 16×32), licht van rechts; alle anims (sta/loop × 3 richtingen, draai,
> zit-oost). `art-stijlgids.md`:140-141 (Roodkapje-callback) herschrijven;
> `sprite-schema.md` aanvullen; `achtergrond.md` blijft de norm.

De bevinding waar het pakket uit voortkomt (bijlage A.2 van de kickoff):

> `js/sprites/sprite-speler.js` is de Roodkapje-sprite uit remake-90s (rode
> mantel palet 4/12, lang donker haar; de header noemt het een "bewuste
> callback"). `docs/achtergrond.md`:141-144 eist echter "een kleine, neutrale
> figuur". De sprite is bovendien van links belicht terwijl alle props van
> rechts belicht zijn (dakraam), en de belichting flipt bij het spiegelen (west
> = gespiegeld oost, `engine.js`:884). Maat 13×25 waar de stijlgids ±33 px
> vraagt.

En de beslissing van Lars, letterlijk uit de kickoff: **"New neutral
figure"** — een hertekening, geen herkleuring. Roodkapje blijft in de
sim-fictie.

## Aanpak

### Wie er nu op zolder staat

Alberta's kleinkind, hedendaags gekleed: een trui, een jeans, kort haar,
schoenen. Geen naam, geen geslacht, geen gezicht — dat laatste is niet
"weggelaten omdat het klein is", het is de speler-beslissing uit
`achtergrond.md`. Het gezicht is een vlak stuk huid met een lichtkant rechts:
drie trappen van de huid-ramp, en verder niets. Geen ogen, geen mond, geen
neuslijn. De oude sprite hád ogen (twee zwarte pixels op de rij
`..233030331..`) en dus een blik; die is weg.

Eén concessie aan leesbaarheid: in het zijaanzicht steekt er op één rij een
huidpixel voorbij het profiel uit. Dat is een silhouetneus, geen gezichtsdetail
— zonder haar kijkt de figuur van opzij nergens naartoe.

### Maat

Vijftien breed, eenendertig hoog, en tweeëndertig voor de doorzwaaiframes. De
stijlgids staat 16×32 toe en vraagt ± 1/6 van de schermhoogte (≈ 33 op 200);
de oude 13×25 gebruikte die ruimte niet, en dat stond sinds WP H als openstaand
punt in `voortgang.md`. Dat punt is hiermee dicht.

Vijftien en niet zestien, omdat een oneven breedte het anker (`voeten-midden`,
`linksX = x - floor(breedte / 2)`) precies op de middenkolom legt. Bij een even
breedte ligt het anker een pixel links van het wiskundige midden — een
conventie die klopt maar die bij het spiegelen van oost naar west een pixel
verschuiving oplevert. Met vijftien is er niets te verschuiven.

De verhouding is opnieuw opgezet in plaats van de oude opgeblazen: hoofd en nek
8 rijen, romp 9, heup 2, benen 9, schoenen 3. Dat is bijna vijf hoofdhoogtes en
45 % been. De oude figuur was 9 rijen hoofd op 25 — kabouterproporties, en dat
viel pas op toen hij groter werd.

### Licht

Het dakraam staat in elke kamer rechts. Alle props hebben hun schaduw links; de
oude speler was van links belicht en stond dus letterlijk verkeerd om in zijn
eigen kamer. De nieuwe frames zetten de donkerste trap van elke ramp links en
de lichtste rechts — bij de trui, bij de jeans, bij de huid en bij het haar.

Dat vroeg om méér trappen dan de mantel nodig had. Een mantel is één massa:
twee kleuren (schaduw 4, licht 12) volstaan. Een trui met mouwen is drie
vlakken naast elkaar, en zonder een naad tussen mouw en romp leest de hele
bovenkant als één rechthoek. Elk kledingstuk heeft nu vier trappen, waarvan
de diepste alleen voor de naad en de zoom is.

### De animaties

De namen en het aantal frames zijn ongewijzigd — de engine (`tekenActor`,
`actorAnim`, `tikZitten`) en `test-sprites.mjs` hangen eraan. Wat er per anim
in zit:

| Anim | Frames | fps | Hoogtes | Wat er beweegt |
|---|---|---|---|---|
| `sta-zuid` | 2 | 1 | 31 / 31 | ademen: hoofd 1 px lager, romp korter |
| `sta-noord` | 2 | 1 | 31 / 31 | idem |
| `sta-oost` | 2 | 1 | 31 / 31 | idem |
| `loop-zuid` | 4 | 8 | 31 / 32 / 31 / 32 | steun–doorzwaai ×2, deining 1 px |
| `loop-noord` | 4 | 8 | 31 / 32 / 31 / 32 | idem |
| `loop-oost` | 4 | 8 | 31 / 32 / 31 / 32 | idem, plus armzwaai |
| `draai` | 1 | 0 | 31 | driekwart: romp bijna van voren, hoofd al opzij |
| `zit-oost` | 3 | 0 | 31 / 27 / 24 | staan → hurken → zitten |

Het sub-palet, veertien trappen uit het volle palet van 64:

```
0 -> 0  zwart (zolen, contactrand)      7 -> 61 jeans licht
1 -> 42 trui diepst (naad, zoom)        8 -> 18 huid schaduw
2 -> 43 trui schaduw                    9 -> 19 huid mid
3 -> 44 trui mid                        a -> 20 huid hooglicht
4 -> 45 trui licht (dakraamkant)        b -> 23 haar schaduw
5 -> 59 jeans diepst (binnenbeen)       c -> 24 haar licht
6 -> 60 jeans schaduw                   d -> 49 schoen
```

## Beslissingen

### Mosgroen en denim, niet grijs en niet paars

De trui komt uit de gebladerte-ramp (42–45), de jeans uit de nacht/water-ramp
(59–61). Drie families zijn overwogen en twee afgevallen:

- **De avond-ramp (28–34)** is gedempt en zou een mooie heidekleurige trui
  geven, maar het is de ramp van het dakraam. Een trui in de kleur van het licht
  ziet eruit alsof ze zelf licht geeft.
- **De steen-ramp (48–53)** is neutraal, maar het is ook de kast van de pc en
  de zitting van de stoel. Een grijze speler vóór een grijze pc is één vlek.
- **De gebladerte-ramp** botst met niets in de kamer. De zolder is bruin (de
  hout-ramp), en groen is de enige koele kleur die op bruin hout niet wegvalt en
  toch niet schreeuwt zoals het `#FF5555` dat hij vervangt.

De jeans houdt de nacht-ramp op 59–61 en gaat níet door naar 62 (`#4AA6C9`):
dat is water-cyaan en leest niet als stof. Schoenen zijn 49 (steen schaduw) met
een zool in 0 — de oude sprite had massief zwarte schoenen, en een schoen die
alleen uit outline bestaat is een gat.

### De spiegel keert het licht om, en dat blijft zo

`engine.js` tekent west als gespiegeld oost (`spiegel: richting === "west"`).
Een sprite die van rechts belicht is, is naar het westen lopend dus van links
belicht. Dat is bekend, gemeten en aanvaard.

Het alternatief is een eigen `loop-west` en `sta-west`, en dat verdubbelt zes
anims naar twaalf voor een fout die je alleen ziet zolang je een pijltoets
ingedrukt houdt. Bovendien verbiedt de stijlgids het expliciet ("lever geen
`-west`-anims") en zakt `test-sprites.mjs` erop. De ruil staat nu in de kop van
`sprite-speler.js`, in `sprite-schema.md` en als eigen stijlregel in
`art-stijlgids.md`, zodat een volgende sessie hem niet opnieuw hoeft te
ontdekken en niet per ongeluk "repareert".

Wat er wél uit volgt als regel: teken niets in het silhouet dat alleen in één
spiegeling kán kloppen. Geen gereedschap in de rechterhand, geen tas over één
schouder. Belichting flipt en dat is te verdedigen; een tas die van schouder
wisselt is dat niet.

### De zit-reeks moest langer worden, niet korter

De drie zit-frames waren 25 / 21 / 19 rijen. Naar 31 opgeschaald werd dat eerst
31 / 25 / 21, en toen bleek er een fout in te zitten die in de oude sprite ook
al zat: de hurkstand was nauwelijks korter dan de zitstand. Hurken hoort tússen
staan en zitten in te liggen, anders leest de reeks als "staan, zitten, nog
dieper zitten".

Ze zijn nu 31 / 27 / 24. Bij 24 rijen ligt de dij op negen pixels boven de
vloer, en dat is ongeveer de hoogte van de zitting van `sprite-stoel.js`
(zitting op rij 12–15 van 26, dus tien tot dertien pixels). `test-results/
wp34-zitpas-stoel.png` legt de drie frames naast en op de stoel om dat te tonen.

Twee dingen zijn hier bewust níet gedaan. De stoel is niet verkleind — de
schaalmismatch tussen meubels en speler is WP 35. En de speler loopt nog altijd
niet naar de stoel toe; hij gaat zitten waar hij staat, zoals WP H besliste en
zoals de prose het zegt ("Je schuift Alberta's stoel bíj"). In `zolder-oost`
komt hij trouwens niet verder westwaarts dan x≈191 (de bureaupoten blokkeren),
dus de zithouding is in de kamer alleen los te beoordelen; vandaar de aparte
passing.

### Geen zwarte omtrek rondom

De stijlgids zegt "1 px donkere rand waar een vorm anders in de achtergrond
wegvalt", niet "altijd". Een gesloten zwarte omtrek kost op vijftien pixels
breedte twee kolommen aan weerszijden, en dat is een zesde van de figuur. De
rand is hier de diepste trap van de ramp zelf (42 onder de trui, 59 binnenbeen,
0 alleen onder de schoenen). Op de bruine zoldervloer is dat genoeg: de
screenshots laten de figuur in alle vier de kamers los van de achtergrond staan.

### De frames zijn gegenereerd en daarna met de hand onderhouden

Dertig frames van elk 31 rijen van elk 15 tekens zijn 14 000 tekens waarvan er
één fout mag zijn voordat de lint zakt. Ze zijn gebouwd uit gedeelde
lichaamsdelen (hoofd, romp, heup, benen, schoenen) met een assert op de
rijbreedte, en pas daarna als gewoon bestand weggeschreven. Het gereedschap is
wegwerp en staat niet in de repo: het bestand in `js/sprites/` is vanaf nu weer
gewoon met de hand te bewerken, precies zoals de andere vijf sprites.

### Bijvangst in de docs

- `art-stijlgids.md`, paletrollen 4 en 12: heetten "mantel-schaduw" en
  "mantel-licht". De mantel bestaat nog, maar alleen als `rode mantel` in de
  sim; de rollen zeggen dat nu.
- `art-stijlgids.md`, vaste toewijzingen: de regel "Roodkapje / de speler" is
  vervangen door de volledige kleurenlijst van de nieuwe figuur, met een
  uitdrukkelijk **niet 4/12**.
- `art-stijlgids.md`, armzwaai: sprak over "een rode vlek" en "vóór de
  mantel".
- `art-stijlgids.md`: de belichtingsregel voor sprites bestond alleen voor
  scènes ("één dominante lichtbron per scène"). Sprites vielen er niet
  onder, en zo kon een van links belichte speler door elke keuring komen.
  Er staat nu een eigen regel bij de sprite-specificaties.
- `sprite-schema.md`: de voorbeeldlegenda citeerde het mantel-sub-palet.
  Vervangen door het trui-sub-palet, met de regel dat trappen van donker naar
  licht gaan.
- `js/palette.js`: twee commentaarregels noemden de rode mantel van de speler.
- `js/engine.js`, `actorSchaal`: rekende voor op "een figuur van vijfentwintig
  pixels".
- `walkthrough/` is nagekeken op "mantel" en "Roodkapje": alle treffers staan in
  het sim-gedeelte (deel 2, de vier eindes; deel 1, "Je bent Roodkapje" bij de
  endgame). Dat is de fictie ín Alberta's spel en hoort daar. De zolderspeler
  wordt nergens beschreven, ook niet als gekleed — de prose spreekt hem met
  "je/jij" aan en beschrijft hem nooit, dus er was niets recht te zetten.

## QC-resultaat

- `node --test test/test-*.mjs` — **368/368 groen**, ongewijzigd aantal. De
  tien lint-regels van `test-sprites.mjs` staan er onaangeroerd:
  rechthoekigheid, sub-palet-grenzen, maatbudget (15 ≤ 16, 32 ≤ 32), gelijke
  breedte per anim,
  hoogteverschil ≤ 1 met `zit-oost` als uitzondering, de acht vereiste anims,
  geen `-west`, vier loopframes met deining, twee sta-frames met tempo, `fps: 0`
  voor de eenmalige anims. **Er is niets aan de testverwachtingen veranderd**
  — de spec pinde alleen de bovengrens 16×32, en daar past de nieuwe maat in.
- `node tools/lint-scene.mjs` — alle elf scènes in orde.
- `node tools/check-assets.mjs` — geen drift, 9 editor-modellen byte-getrouw.
- `smoke-browser` **38/38 PASS**, `smoke-walk` **25/25 PASS**,
  `smoke-full-playthrough` **97/97 PASS** (Chromium via `AL_CHROMIUM`).
- Screenshots in `test-results/`, ter beoordeling door de manager:
  `wp34-spritesheet.png` (alle dertig frames, 8×, met voetlijn per anim),
  `wp34-zitpas-stoel.png` (de drie zit-frames tegen de stoelsprite),
  `wp34-{zolder-west,zolder-midden,zolder-oost,overloop}-{start,achteraan,
  vooraan}.png` (vier kamers, drie diepten), `wp34-loop-oost.png` +
  `wp34-loop-oost-2.png` (twee fasen van de loopcyclus),
  `wp34-loop-west-gespiegeld.png` (de omgekeerde belichting, zoals besloten),
  `wp34-zolder-oost-bijstoel.png` en `wp34-zit-0..3.png`, en voor de
  voorgrondcontrole `wp34-voorgrond-bovenrand.png`,
  `wp34-voorgrond-voor-stapel.png` en `wp34-voorgrond-achter-stapel.png`.
- Nagemeten in de kamers: alleen `zolder-midden` laat de speler tot de bovenrand
  van de loopstrook (y151); daar staat het hoofd op y≈125 door de diepteschaal
  0,84, ruim onder de wandlijn. `zolder-west` stopt op y171, `zolder-oost` op
  y174 en `overloop` op y165 — de blokken van WP 32 houden de speler eerder
  tegen dan de strook. Geen enkele kamer laat de figuur in geschilderde
  geometrie prikken.
- Voorgrondlagen nagelopen: drie van de vier kamers hebben er maar één, de
  gording bovenaan (`baselineY: 200`, y8–24), en die raakt de speler niet —
  zijn hoofd komt niet hoger dan y≈125. `zolder-midden` heeft er een tweede,
  de dozenstapel rechts (`baselineY: 188`, x296–319, y130–189). Dáár is de
  zes pixels extra hoogte wél een risico, want een hoofd dat boven de bovenrand
  van een voorgrondsilhouet uitkomt, zweeft. Gemeten: het blok `[284, 150, 36,
  18]` houdt de speler bij die stapel op y ≥ 168, en op y172 (het dichtst
  haalbare, `wp34-voorgrond-bovenrand.png`) staat het hoofd op y≈143 —
  dertien pixels onder de bovenrand van de stapel. De sprite wordt netjes
  afgesneden; `wp34-voorgrond-voor-stapel.png` toont dezelfde figuur vooraan.
- De diepteschaal leest beter dan vóór dit pakket: op eenendertig pixels
  scheelt 0,84 vijf rijen in plaats van vier.
