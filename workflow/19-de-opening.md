# 19 — De opening (opwaardering WP D)

De achtergrond krijgt beeld. WP C zette de stem en de volgorde al recht; dit
pakket vervangt de vensters over de titelkaart door drie getekende
establishing shots.

## Opdracht

Uit het plan (§WP D): een filmische openingsreeks op het canvas — het huis, de
trap, de pc die nog nagloeit — met de overgangen uit WP B ertussen, vóór de
speler controle krijgt, en overslaanbaar.

## Aanpak

De drie beelden zijn het eerste échte gebruik van de ops uit WP B, en dat was
de bedoeling: als de nieuwe primitieven niet volstaan voor drie stilstaande
beelden, dan volstaan ze zeker niet voor zes beloopbare kamers. Ze volstonden,
maar niet op de manier die ik verwachtte — zie hieronder.

Elk beeld is apart gerenderd en bekeken vóór het in de reeks ging: eerst kaal,
zonder onderschrift, want anders beoordeel je de tekstballon en niet de
tekening.

## Beslissingen

### Twee lessen die de stijlgids in zijn geheel misging

**Dither niet over een grote helderheidssprong.** De gloed van het dakraam op
het dak was amber (56) in donkergrijs (49) op 22 % dichtheid. Op papier subtiel;
op het scherm een oranje vlak. Het oog middelt naar helderheid, dus een fel
accent domineert ook als het in de minderheid is. Nu blijft de gloed binnen zijn
eigen ramp (50 → 52) en zit de echte amber alleen ín het raam.

Hetzelfde gold voor de sky-glow (61 → 56): een blauw-amber-mengsel dat als groen
las. Weg.

**Licht is rond.** De halo rond de monitor was eerst opgebouwd uit drie
concentrische trapezia. Dat leest als een tunnel: je ziet de hoeken, en een
vorm met hoeken is geen licht. Twee concentrische `ellipse`-stappen uit de
gloed-ramp, met wat `noise` over de randen, doen het wel. Een lichtstraal uit
een raam mag daarentegen wél een veelhoek zijn — die heeft in het echt ook
rechte randen.

Allebei staan ze nu als vuistregel in `art-stijlgids.md`, §"De draw-ops",
zodat WP E er niet opnieuw in loopt.

### Ook de lucht heeft genoeg ramp-stappen nodig

De avondlucht begon als een verloop over de nacht-ramp (59 → 61). Die telt maar
drie kleuren, en over negentig pixels wordt dat een grof schaakbord in plaats
van een verloop. De avond-ramp (28–34) telt er zeven en is bovendien precies
waar de stijlgids dit licht voor aanwijst. Meteen goed.

Dat is een concrete grens van de `gradient`-op: hij is zo fijn als de ramp waar
hij over loopt.

### Onderschrift, geen luik

De eerste versie zette de verteller in het gewone berichtvenster, gecentreerd.
Dat dekt het beeld af waar het beeld nu net het punt is. `maakVenster` kent
daarom een `plaatsing`-optie: `"onder"` zet de doos onderaan als onderschrift.
Dat is een kleine toevoeging aan de renderlaag die WP F (venster-chrome) verder
uitbouwt.

### Vijf beats op drie beelden, en waarom dat een maat is

Met vier alinea's paginéérde het onderschrift, en dan bladert Enter door de
tékst in plaats van door de reeks. In de test zag je dat meteen: twee keer Enter
en je stond nog op beeld één. Dat voelt als vastlopen.

De langste alinea is daarom in tweeën geknipt, en de reeks telt nu vijf beats op
drie beelden — sommige beelden dragen er twee. Nagemeten: bij 38 tekens per
regel past elke alinea in zes regels, dus er pagineert niets meer. Dat is geen
opmaakdetail maar de maat van de scène: één beat, één beeld, één Enter.

### Geen extra save-veld nodig

Het plan wilde dat de save onthoudt dat de reeks gezien is. Nagekeken: dat is al
zo, zonder nieuw veld. Wie herlaadt met een save komt via `hervat()` binnen en
ziet de titelkaart niet eens; wie `herbegin` doet, kiest expliciet voor opnieuw
beginnen en krijgt dan ook de opening opnieuw — wat juist klopt. Er is dus niets
bijgekomen in het staat-object.

Escape slaat de reeks over, en de rooksmaaktest controleert dat ook.

### De skip-hint kreeg een eigen plaat

"Esc: overslaan" stond eerst rechtsonder, waar het onderschrift nu staat, en
verdween eronder. Nu rechtsboven, met een donkere plaat eronder. De drie beelden
hebben op die plek een heel verschillende achtergrond — schemerlucht, een
verlicht gat, zwart — en zonder plaat valt de hint op minstens één ervan weg.
Dezelfde les als bij de titelkaart in WP A: contrast garandeer je, je hoopt er
niet op.

### Eén scène per bestand

De drie beelden stonden eerst samen in `scene-opening.js`. De lint leidt de
scène-id af uit de bestandsnaam en zakte daarop. Gesplitst in
`scene-opening-huis.js`, `-trap.js` en `-pc.js`, wat ook gewoon de conventie van
de map is.

Daarna zakte de lint nog op de grenzen: puntenlijsten met x = 320 vallen één
pixel buiten het veld (0–319). Dat is precies waar die controle voor bedoeld is;
`rect` mag wél 320 breed zijn, want dat is een breedte en geen coördinaat.

## QC-resultaat

- `node --test test/test-*.mjs` — **259 tests, 259 groen**.
- `npm run lint:scene` — alle negen scènes in orde, inclusief de drie nieuwe.
- `node tools/check-assets.mjs` — geen drift.
- Rooksmaaktesten via `file://`: `smoke-browser` **21/21** (twee checks erbij:
  de reeks start met een onderschrift, en Escape slaat hem over), `smoke-pc`
  21/21, `smoke-sim` 13/13, `smoke-levels-1-3` 32/32, `smoke-levels-4-7` 48/48,
  `smoke-full-playthrough` 94/94.
- Gecontroleerd dat elke Enter precies één beat opschuift (stap 0 t/m 4), zodat
  het onderschrift nergens pagineert.
- Elk beeld apart bekeken, kaal en met onderschrift.

`smoke-touch` kon opnieuw niet draaien: geen WebKit in deze container. Het
bestand is in dit pakket niet aangeraakt.

Wat hierna nog aan de opening kan: de beelden zijn stil. Stof dat door de
lichtkegel van de trap zakt, of een cursor die knippert op de monitor, hoort bij
de sfeer-laag die in WP E aan de scènes wordt toegevoegd — dan kunnen deze drie
meeliften op hetzelfde mechanisme.
