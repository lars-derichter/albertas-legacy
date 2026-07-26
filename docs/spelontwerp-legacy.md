# Spelontwerp — The Legacy of Alberta (meta-spel)

Het ontwerp van het meta-spel: de zolder-adventure die de zeven code-levels aan
elkaar rijgt. De verhaalinhoud staat in `achtergrond.md`; de engine en de
effect-tags in `engine-architectuur.md`; de code-levels in
`levels-en-scharnieren.md`. Dit document beschrijft de speelervaring: schermen,
scènes, de lus per level, de commando's en de eindes. WP 6 (zolderinhoud) bouwt
hier tegenaan.

## De vorm in één zin

Een grafisch adventure in vroege-jaren-negentig-stijl: je loopt met de
pijltjestoetsen door Alberta's zolder en typt commando's, je leest fragmenten
van haar notitieboek als full-screen spreads, en je werkt aan haar Java-code op
een gesimuleerde pc — zeven keer, één keer per scharnier van de cursus.

## Schermen en modi

De engine kent één modus per scherm (het `modus`-veld uit
`engine-architectuur.md`):

| Modus | Scherm | Besturing |
|---|---|---|
| `titel` | titelkaart | een toets / klik om te starten |
| `zolder` | beloopbare zolder-/huisscène | pijltjestoetsen + getypte parser |
| `spread` | full-screen notitieboek-spread | doorbladeren, dan valt het boek dicht waar je staat |
| `pc` | gesimuleerde editor/terminal (DOM-overlay) | typen, "compileer & test", `?` |
| `sim` | _Seven Little Goats_ als speelbare simulatie | getypte commando's |
| `oordeel` | Alberta's oordeel-eindscherm | lezen, dan epiloog |
| `epiloog` | slottekst die naar de broncode wijst | een toets om af te sluiten |

## Titelscherm en intro

- **Titelkaart** (`titel`): het logo "THE LEGACY OF ALBERTA" in VGA-stijl, een
  stille zolder met avondlicht, één prompt om te beginnen. Effect: `titel`.
- **Opening**: vijf onderschrift-vensters over drie beelden — het huis van
  buiten (`opening-huis`), de trap naar de zolder (`opening-trap`, twee
  alinea's) en de monitor die nagloeit (`opening-pc`, twee alinea's). Elk beeld
  komt op uit het zwart; de tekst staat in `AL.strings.intro` en de reeks zelf
  in `OPENING` (js/engine.js). Ze zet de kernfictie: je erft de zolder, je
  vindt de pc en het beschadigde notitieboek, en — de cruciale zin — "Alberta
  bouwde elk spel eerst als tekstversie in de terminal. Zo begon ze altijd."
  (zie `achtergrond.md`). De laatste alinea leert de besturing aan. Rechtsboven
  staat `Esc: overslaan`; Escape slaat de hele reeks over.

> Beslissing: de opening is **géén** notitieboek-spread. Er is ooit een
> `spread:intro` geweest en die klopte op drie manieren niet: je las wat er in
> het boek stond vóór je het boek had, de verteller sprak jou aan op papier dat
> Alberta's handschrift draagt, en de voet vroeg om het notitieboek te openen
> dat je aan het lezen was. De openingstekst staat nu in de stem van de
> verteller, vóór de zolder. De motivering staat bij de spread-data zelf
> (`js/logic/strings.js`, §"Er staat hier bewust géén intro-spread meer") en in
> `workflow/15-opwaardering-kickoff.md`; `test-world-hub.mjs` bewaakt dat
> `AL.strings.spreads.intro` niet terugkomt.

De opening eindigt in de zolder (`modus: "zolder"`), in `zolder-west`.

## De zolder-hub

Beloopbare scènes in de stijl van de remake-90s-engine: walkboxes, blokken,
uitgangszones, entries en hotspots (zie `scene-schema.md`). De speler gaat te
voet naar de aangrenzende kamer (`betreed:<richting>`), zoals in de
predecessor, en dat kan op twee manieren:

- **Over de oost- of westrand.** De loopstrook loopt tot aan het beeld door
  waar een buurkamer ligt; loop je eroverheen, dan sta je in de volgende kamer.
- **Door een uitgangszone.** Noord en zuid zijn met een rand niet te doen — een
  kamer die tot bovenaan het beeld beloopbaar is, heeft geen achterwand meer.
  De trap tussen de doorgang en de overloop is daarom een rechthoek in de
  vloer (`exits` in het scène-schema): wie erin stapt, gaat naar boven of naar
  beneden. Zonder venster, zonder tweede toets.

Waar geen buurkamer ligt, houdt de loopstrook op vóór het beeld en stopt de
speler gewoon: een geschilderde muur hoort te blokkeren, niet te praten. De
weigering "Die kant kan je niet op" blijft bestaan waar ze een antwoord is —
op een getypt `ga <richting>` dat nergens heen gaat.

De voorwerpen in een kamer — de kist, het bureau met de stoel, de
dozenstapels — hebben een voetafdruk (`blokken`) die van de vloer wordt
afgetrokken. De speler loopt er omheen of ervoor langs, niet erdoorheen.

### Scène-inventaris

Klein gehouden (het plan houdt de art-belasting laag). De scène-ids zijn kebab-
case en bindend; `art-stijlgids.md` levert de mood-notities en de tekening.

| Scène-id | Type | Rol |
|---|---|---|
| `titelkaart` | kaart | titelscherm |
| `opening-huis` | beeld | het huis van buiten, bij avond; alinea 1 van de opening |
| `opening-trap` | beeld | de trap naar de zolder, van onderaan; alinea's 2–3 |
| `opening-pc` | beeld | de monitor die nagloeit; alinea's 4–5 |
| `zolder-west` | kamer | starthoek: dozen, dakraam, het notitieboek op een kist |
| `zolder-oost` | kamer | Alberta's werkhoek: de pc op een bureau (de toegang tot `pc`-modus) |
| `zolder-midden` | kamer | doorgang/spil: verbindt west, oost en de overloop; de broncode-doos |
| `overloop` | kamer | het archief boven de trap: de bladen van de hoofdstukken 5–7 |
| `spread-template` | spread | herbruikbaar notitieboek-spread, per level herkleed |
| `eindkaart` | kaart | drager voor Alberta's oordeel + epiloog |

> Beslissing: drie zolderscènes waren verplicht (`zolder-west`, `zolder-oost`,
> `zolder-midden`) en `overloop` was een optionele vierde. WP 6 heeft haar
> gebouwd en ze is sindsdien niet meer optioneel: `FRAGMENT_LOCATIE`
> (js/logic/world.js) legt de bladen van de hoofdstukken 5, 6 en 7 daar neer.
> De hub blijft verder bewust compact: de spreads dragen de meeste "nieuwe"
> beelden, niet nieuwe kamers.

### Sprite-inventaris

| Sprite | Anims | Rol |
|---|---|---|
| `speler` | sta-noord/oost/zuid, loop-noord/oost/zuid, draai, zit-oost | het kleinkind, klein en neutraal, van achter/opzij (west = gespiegeld oost); `zit-oost` is de houding aan de pc |
| `notitieboek` | idle | hotspot op `zolder-west` |
| `pc` | idle, aan | prop op `zolder-oost`; "aan" toont een gloeiend scherm |
| `doos` | idle | herbruikbare doos-prop (labels als overlay-tekst) |
| `broncode-doos` | idle, open | de prijs-doos op `zolder-midden` |
| `stoel` | idle | Alberta's lege bureaustoel, sfeer-prop |

De sprite-codering en maten staan in `art-stijlgids.md`; de speler-sprite volgt
de Sierra-verhouding (klein op het scherm).

## De lus per level

Elk van de zeven levels doorloopt dezelfde vijf stappen. De stappen mappen
één-op-één op effect-tags uit `engine-architectuur.md`.

1. **Vind het fragment.** In de zolder-adventure ontgrendelt de speler het
   volgende notitieboek-fragment (een hotspot onderzoeken, een doos openen).
   Effect: `fragment-gevonden:<levelId>`. Voor level 1 is dat simpelweg het
   notitieboek zelf op `zolder-west`; latere fragmenten zitten verder in de
   zolder (dozen op `zolder-midden`/`overloop`), zodat er lichte progressie is.
   **Vinden volgt oplossen:** blad `n` komt pas uit zijn doos als hoofdstuk
   `n-1` hersteld is. Is dat niet zo, dan weigert de doos in de fictie
   (`AL.strings.dozen.nogDicht`) en verandert er niets aan de staat. Het
   notitieboek van level 1 heeft geen voorganger en blijft vrij.
2. **Lees de spread.** De notitieboek-spread opent: Alberta's schets, haar
   spec voor dat stuk (bladzijde 1 wat het moet zijn, bladzijde 2 wat er stuk
   of onaf is — zie `levels-en-scharnieren.md`, §"Wat een spread draagt"), en
   de regel "Week X in mijn schema." (haar eigen planning; zie
   `achtergrond.md`, §"Het notitieboek"). Effect: `spread:<levelId>`,
   `geluid:pagina`. Na de laatste bladzijde gaat het boek dicht en staat de
   speler **waar hij het blad vond** — bij het notitieboek in de westhoek, bij
   de doos in de doorgang of op de overloop.
3. **Ga aan de pc zitten.** De speler loopt zelf naar de pc op `zolder-oost` en
   gaat zitten. Effect: `pc:open`, `level-start:<n>`. Weet hij de weg niet, dan
   wijst `?` hem die: de eerste tak van de zolder-hint zegt "Het hoofdstuk dat
   je opensloeg, is nog niet hersteld. Dat werk ligt op de pc, in de werkhoek
   aan de oostkant van de zolder." (`save-en-hints.md`, §"De zolder-hint").
4. **Los de puzzels op, op volgorde.** Eén editor-puzzel + twee
   terminal-puzzels (zie het tijdsbudget in `levels-en-scharnieren.md`). Het
   menu geeft ze één voor één vrij (zie §"De gesimuleerde pc" hieronder). Elke
   opgeloste puzzel: `puzzle-af:<puzzleId>`. Alle drie af: `level-af:<n>` —
   "dit hoofdstuk van Alberta's spel is hersteld".
5. **Keer terug.** De pc sluit (`pc:sluit`), de staat wordt opgeslagen
   (`voortgang:opgeslagen`), en de speler staat weer op de zolder, klaar voor
   het volgende fragment. Gaat hij daarna opnieuw zitten terwijl dat hoofdstuk
   al hersteld is, dan blijft de pc dicht: hij zegt dat het klaar is en waar het
   volgende blad ligt. Alleen als er géén fragment meer te vinden is, gaat de pc
   gewoon open — dat is het endgame-pad.

> Beslissing (WP 44): stap 2 brengt de speler **niet** naar de werkhoek. Dat
> deed hij wel — `spreadVerder` zette de scène op `zolder-oost` — en het las als
> een bug: het boek dichtdoen teleporteerde je naar de pc. Het sprak ook het
> chroom van de laatste bladzijde tegen, dat "spatie: terug" belooft. Het boek
> dichtdoen is nu een handeling zonder bijwerking; de wandeling naar de pc is de
> zaak van de speler, en de progressie-hint uit WP 33 draagt de begeleiding die
> de teleport moest goedmaken.

> Beslissing (WP 47): de lus is lineair, en de poort staat aan de doos. Stap 1
> was tot dan vrij — drie keer `open doos` ontgrendelde drie bladen zonder één
> puzzel op te lossen, en omdat `levelActief` met het nieuwe blad meeging en het
> pc-menu geen levelkeuze kent, waren de overgeslagen hoofdstukken daarna
> onbereikbaar. De poort zit in de doos en niet in de pc: ze past in de fictie
> (Alberta's schema loopt op volgorde), houdt één model aan, en vermijdt
> half-ontgrendelde toestanden. Zie `workflow/46-lineariteit-kickoff.md` voor de
> feedback van de docent die eraan ten grondslag ligt.

Na level 7 volgt de endgame in plaats van "keer terug" (zie onder).

## De gesimuleerde pc

Het hart van het codewerk. Een DOM-overlay in VGA-stijl (zie
`engine-architectuur.md`, §"gesimuleerde pc"). Twee panelen:

- **Editor** (`js/pc/editor.js`): een period-styled code-editor met
  regelnummers en een blok-cursor, voorgeladen met beschadigde Java of een lege
  stub plus Alberta's notities als commentaar. Een actie "compileer & test"
  (`compileer`) stuurt de inhoud naar de checker.
- **Terminal** (`js/pc/terminal.js`): toont de gesimuleerde `javac`-diagnostiek
  en de CHECK_OK/CHECK_FAIL-testregels (Nederlands, stapsgewijs, vriendelijk —
  zie `checker-contract.md`). Draait ook de niet-editor-puzzels: trace, vind-de-
  fout, verklaar-in-één-zin.
- **Parsons** (`js/pc/parsons.js`): sleep- of nummer-de-stroken-UI voor Parsons-
  puzzels, in de terminal getoond.

Ervóór staat het **menu** (`js/pc/pc.js`): de drie taken van het actieve
hoofdstuk, genummerd, met hun status ernaast (`open` / `bezig` / `af`). Het
menu is de enige ingang tot een puzzel — klik of cijfertoets — en het bewaakt
de volgorde.

> Beslissing (WP 48b): **de taken van een hoofdstuk gaan op volgorde.** Taak k
> is speelbaar zodra 0..k-1 op `af` staan (`AL.levels.puzzelSpeelbaar`, de
> logica-laag; het menu consumeert het predicaat). Een wachtende taak blijft
> zichtbaar — de speler hoort te zien wat er nog komt — maar staat gedoofd met
> het plaatje `wacht`, en klik en cijfertoets doen niets behalve de statusregel
> onder het menu uitleggen waarom. Een taak die `af` staat, gaat wél gewoon
> weer open: de poort kijkt alleen vooruit. Reden: sommige puzzels tónen de
> oplossing van een andere puzzel uit hetzelfde hoofdstuk (de trace van level 6
> drukt de herstelde for-kop af, die van level 7 de null-veilige keten), en met
> vrije keuze begon een speler daar. De regel en het bewijs per level staan in
> `levels-en-scharnieren.md`, §"Puzzelvolgorde binnen een level"; de poort
> voegt geen veld aan de save toe (`save-en-hints.md`).

De puzzelvormen per level staan in `levels-en-scharnieren.md`; de checker-
semantiek in `checker-contract.md`.

## Commando's en effecten

De besturing per modus. Elke overgang verwijst naar een tag uit de
effect-taglijst in `engine-architectuur.md`; er is geen actie hier zonder
tag daar.

### Zolder (`modus: "zolder"`)

- **Pijltjestoetsen** — lopen; over een rand → `betreed:<richting>` +
  `scene:<id>`.
- **Getypte parser** in de stijl van de predecessor: `kijk`, `ga <richting>`,
  `onderzoek <ding>` / `bekijk <ding>`, `open <ding>` (dozen, notitieboek, de
  kist in de westhoek), `gebruik pc` / `ga zitten` / `zit` / `pc` / `ga werken`
  (→ `pc:open`), `inventaris`, `neem <ding>` (er valt hier niets mee te nemen,
  maar het commando krijgt een antwoord in plaats van onbegrip).
- `?` — een hint voor waar de speler nu vastzit → `hint:1`. Hij volgt de
  voortgang, niet de kamer: eerst het hoofdstuk dat open ligt, dan het volgende
  fragment, dan "alles is af" (de beslisboom staat in `save-en-hints.md`,
  §"De zolder-hint"). Gratis en ongeteld.
- `herbegin` — zet het spel terug, na een bevestigingsvraag (`herbegin ja`; zie
  `save-en-hints.md`) → `vraag`, dan `herbegin`.
- `help` — de commandolijst. `geluid aan` / `geluid uit` → `geluid:aan|uit`;
  `crt aan` / `crt uit` → `crt:aan|uit` (de beeldbuislijnen over het canvas).
- **F3** — haal het vorige commando terug in de invoerbalk (engine, geen
  parser-commando en dus geen effect-tag).

### Spread (`modus: "spread"`)

- **Spatie / Enter / klik** — doorbladeren; na de laatste pagina gaat het boek
  dicht en staat de speler weer in de kamer waar hij het blad vond, op dezelfde
  plek. De bladerhint onderaan het linkerblad belooft niets anders ("spatie:
  terug"). De pc opent pas als hij naar de werkhoek loopt en `ga zitten` typt.
- Er is hier geen `?`: de invoerbalk is in deze modus geblokkeerd en elke toets
  bladert. De puzzel-hints zitten in de pc.

### Pc (`modus: "pc"`)

- **Typen** in de editor; **"compileer & test"** (knop of `Ctrl+Enter`) →
  `compileer` → checker → `javac:fout` / `check:ok` / `check:fout`.
- In de terminal: puzzel-specifieke invoer (een getal voor een trace, een keuze
  voor welke-patroonkaart, de stroken voor Parsons).
- `?` in de terminal, **F1** in de editor — de gestage puzzel-hint (stap 1→2→3,
  nooit het letterlijke antwoord) → `hint:<stap>`, of `hint:geen-meer`. In de
  editor is `?` gewoon een teken in de code; daar neemt F1 het over.
- **"sluit pc"** / `Esc` — terug naar de zolder → `pc:sluit`.

### Sim (`modus: "sim"`)

De getypte commando's van _Seven Little Goats_ (`kijk`, `ga <richting>`,
`pak <naam>`, gevechtscommando's …). Zie `spelontwerp-seven-little-goats.md`.

## Alberta's oordeel (eindscherm)

Na level 7 en de sim toont het spel **Alberta's oordeel**: een speelse, niet-
bestraffende terugblik in Alberta's stem, gebaseerd op het hint-gebruik en de
voortgang (`hintsTotaal` en de per-puzzel-tellers). De verdict-tiers en de
precieze drempels staan in `save-en-hints.md`; dit scherm is hun drager. Effect:
`oordeel:<tier>`. De toon is warm en droog: Alberta becommentarieert je werk
zoals ze je code becommentarieerd zou hebben, nooit als een cijfer of een straf.

## Endgame

Level 7 afronden "voltooit" Alberta's spel:

1. `level-af:7` → de pc kondigt aan dat het spel compleet is.
2. `sim:boot`, `geluid:boot` → de pc boot **Seven Little Goats** als speelbare
   simulatie in de terminal-UI (dezelfde kamers, voorwerpen, gevechten, vier
   eindes). De speler speelt Alberta's spel eindelijk uit. Zie
   `spelontwerp-seven-little-goats.md`; de sim spiegelt de Java één-op-één.
3. `sim:einde:<naam>` → een van de vier eindes is bereikt.
4. `oordeel:<tier>` → Alberta's oordeel.
5. `epiloog` → de slottekst wijst naar de echte Java-broncode: "De broncode
   ligt op zolder — neem ze mee." De speler wordt naar `seven-little-goats/`
   verwezen om de code in IntelliJ te openen en zelf te draaien. Hier valt ook
   de eenmalige vermelding van Roberta Williams (zie `roberta-williams.md`).

## Speelduur

Richtdoel ± 2 uur: ~90 minuten codewerk (7 levels × ~15 min) plus ~25 minuten
zolder-tussenwerk (fragmenten zoeken, spreads lezen, lopen, intro/outro), en
~10–15 minuten voor de endgame-sim van _Seven Little Goats_. WP 11 bevestigt
dit met de doorlopende playthrough (`test/smoke-full-playthrough.mjs`): de
headline ± 2 uur houdt stand, met de sim erbij realistisch richting ± 2 u 10.
De volledige telling en onderbouwing staat in `levels-en-scharnieren.md`,
§"Getimede controle".
