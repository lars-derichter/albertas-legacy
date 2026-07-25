# 36 — Handschriftfont

Werkpakket 36 van de kwaliteitsreview (zie
`workflow/28-kwaliteitsreview-kickoff.md`). Doel: het notitieboek wordt
geschreven in plaats van getypt-en-scheefgetrokken.

## Opdracht

Uit het goedgekeurde programma, WP 36:

> Echte pixel-handschriftglyphset (kleine letters, beperkte hoofdletters,
> cijfers, leestekens; onregelmatige baseline en hoogte in de glyphs), als
> tweede fontdef naast font.js; tekenHandschrift gebruikt de nieuwe glyphs,
> de seed-variatie blijft voor de spatiëring. Spread-typografie: één
> handbehandeling per pagina; het boek-chroom (paginanummer, bladwijzer)
> bewust monospace, gemotiveerd in de stijlgids; stale comment "groepje van
> drie" fixen. De entry documenteert het terugdraaien van de
> WP F-beslissing ("geen glyphset").

De klacht van Lars waar het pakket uit voortkomt, letterlijk: *"the
handwriting font that is just a lazy solution (wobbly letter placement)"*.
Zijn keuze bij de kickoff (§Beslissingen, punt 2): *"échte
pixel-handschriftglyphset voor het notitieboek (onregelmatige baselines in
de glyphs gebakken)"*.

De verkenning (bijlage A.2) mat na wat er stond: dezelfde 8×8-bitmapfont als
de gedrukte tekst, met een shear van 0,25 en een driehoeksgolf van ±1 px met
periode exact vier tekens. Die golf was index-gebaseerd — teken 0 kreeg altijd
dezelfde sprong — dus alle twaalf de regels van een bladzijde deinden identiek.
Van een halve meter leest dat als verticale banding, niet als een hand.

## Aanpak

### Een terugdraaiing, expliciet

WP 22 (`workflow/22-typografie-en-chroom.md`, §"Wat níét is gebeurd") besloot
uitdrukkelijk géén aparte handschriftfont te maken: *"een tweede glyphset is
honderd glyphs werk voor winst die op 8×8 marginaal is"*. **Die beslissing is
hiermee teruggedraaid**, op expliciete keuze van de gebruiker. De redenering
van WP 22 klopte over de kóst (het zijn er 114 geworden) maar niet over de
winst: de winst zit niet in mooiere letters, ze zit in het feit dat de
onregelmatigheid dán aan het téken kan hangen in plaats van aan de positie in
de regel. Zolang de deining een formule over de index was, moest ze wel op elke
regel hetzelfde patroon opleveren. Dat is precies wat een lezer als banding
ziet, en het is niet weg te stemmen met een andere golfvorm.

### De font: `js/font-hand.js`

Een tweede fontdefinitie naast `js/font.js`, met dezelfde vorm (een tabel van
rijstrings, `1` is inkt, `.` is leeg, plus een inktmaat per glyph die één keer
bij het laden berekend wordt). Verschillen:

- **De cel is 8 × 10** in plaats van 8 × 8. De twee extra rijen zijn de
  staartzone. Tien past binnen `BLAD.regelH` (11), dus de regelafstand van het
  notitieboek verandert niet en de liniatuur blijft staan waar ze stond.
- **Zonering.** Rij 0–1 stok en accent, rij 2–7 de x-hoogte (zes pixels), rij 7
  de nominale basislijn, rij 8 de rij waar de liniatuur van het sjabloon loopt,
  rij 9 de staart. De eerste liniatuurlijn staat op y 24 en de tekst begint op
  `topY` 16: rij 8 valt daar exact op. Alberta schrijft dus óp de lijn.
- **Onregelmatige basislijn, per glyph gebakken.** Elk teken heeft zijn eigen
  ligging binnen ±1 px. Een pixel omhoog: `a m r K V 7`. Een pixel omlaag:
  `c i n u z D G S 3`. De rest staat op de lijn. Omdat de afwijking aan het
  teken hangt, deint "een" anders dan "nee" en deint geen enkele regel als de
  vorige — er ís geen periode meer om banding uit te vormen.
- **Variabele inktbreedte**, van 2 px (`i`) tot 7 px (`m`, `w`). Woordwit 3 px
  tegen 4 in de druk.
- **Schuinstand in de glyphs.** De stokken van `b d f h k l t` staan bovenaan
  één kolom rechts van hun voet; de staarten van `g j p q y` buigen naar links.
- **Dekking: 114 glyphs**, exact de verzameling van `js/font.js` — alle
  drukbare ASCII 32–126, de accenten die het Vlaams nodig heeft
  (`à á è é ë ï ó ö ú ü É`), de em-streep, het maalteken, de pijl, het
  beletselteken en de gekrulde aanhalingstekens. De veertien spread-bladzijden
  gebruiken er 65 van; de rest staat er omdat één prosewijziging elders anders
  een `?` op een bladzijde kan zetten.

### Twee ontwerpfouten die pas op het blad zichtbaar werden

Beide gevonden door het alfabetblad en de spread-screenshots te bekijken, niet
door erover na te denken:

1. De `w` stond aanvankelijk een pixel omhoog. Zes rijen hoog beginnend op rij
   1 maakt haar even hoog als een hoofdletter, en "blauwdruk" las als
   "blauWdruk". Daaruit volgt een regel die nu in de stijlgids staat: **een
   letter waarvan de kleine en de grote vorm gelijk zijn** (`c o s u v w x z`)
   **mag wel zakken, niet stijgen**. Dezelfde fout dook daarna op bij de `v`
   ("vult de velden" werd "Vult de Velden"); die staat nu ook op 0, en de
   onregelmatigheid omhoog is verplaatst naar `a` en `m`, waarvan de kleine
   vorm ondubbelzinnig is.
2. De `r` was een Griekse gamma en de `d` viel uit elkaar (de kom raakte de
   stok niet). Allebei rechtgezet.

### De renderer

`gfx.tekenHandschrift(tekst, x, y, kleur, versch, opts)` houdt zijn
handtekening en zet nu met `AL.fontHand`. Wat eruit is:

- **De shear staat op 0.** Ze bestaat nog als optie `schuin`, want het méten
  moet haar kennen zolang ze bestaat, maar de helling zit in de glyphs. Een
  shear kantelt het hele raster en zet ook punten, komma's en streepjes scheef;
  een pen doet dat niet.
- **De driehoeksgolf is weg.** `AL.spreads._jitter` is verwijderd, niet
  vervangen; op zijn plaats staat een commentaarblok dat uitlegt waarom er niets
  voor in de plaats komt. Daarmee is ook het verouderde commentaar "Per gróépje
  van drie tekens" verdwenen — het beschreef een mechanisme dat toen al vier
  tekens deed en nu helemaal niet meer bestaat.
- **`versch` blijft in de handtekening** als ontsnappingsluik, maar het spel
  geeft hem nergens nog mee.

Wat blijft: de proportionele spatiëring met één deterministische pixel
variatie per teken, uit de save-seed. Nieuw is de optie `variatie: false`, die
haar uitzet.

`handschriftBreedte` meet met dezelfde font en dezelfde opties. Dat is geen
detail: `test/test-spreads.mjs` en de wrap in het sjabloon rekenen ermee, en
zouden een regel over de kolomrand schrijven als meten en zetten uit elkaar
lopen.

### De kop

De kop blijft dezelfde hand in dezelfde maat en wordt nu onderscheiden door
`variatie: false` — trager, gelijkmatiger geschreven — plus de streep eronder
die er al stond. Overwogen en niet gedaan: een tweede lettergrootte. Dat is een
halve font erbij voor een onderscheid dat de streep al maakt. Het oude
onderscheid (kop `schuin: 0.10`, tekst `schuin: 0.25`) verviel vanzelf met de
shear.

### Waar de hand wél en niet komt

`grep tekenHandschrift` geeft drie aanroepen, alle drie in
`js/scenes/scene-spread-template.js`: de kop, de regels en de weekregel. Er is
niets anders om te bekeren. Het paginanummer en de bladerhint eronder blijven
**bewust monospace**; die regel staat nu met haar motivering in
`art-stijlgids.md` (§Typografie, "Waarom het boek-chroom monospace blijft"):
ze zijn geen deel van wat Alberta opschreef maar apparatuur van het bláderen,
zoals de statusbalk bij het lopen hoort.

### Eén maatwijziging aan het sjabloon

De weekregel stond op drie regels van acht pixels. De handfont is tien rijen
hoog, dus op acht liep de staart van een `g` door de kop van de regel eronder.
Ze staat nu op negen, beginnend op `onderY + 3` in plaats van
`onderY + 5`, zodat ook drie regels binnen het blad blijven. In de praktijk
wrapt de weekregel sinds deze font naar twéé regels op alle zeven de spreads.

## Beslissingen

- **Geen shear meer, ook niet subtiel.** Een gebakken helling is per glyph te
  sturen: een `l` mag hellen, een punt niet. Een shear kan dat onderscheid niet
  maken.
- **De onregelmatigheid blijft binnen één pixel.** Twee is geen dwalende hand
  meer maar een letter die eraf valt. Dat is de enige regel die WP 22 goed had
  en die overleeft.
- **De handfont dekt alles wat de drukfont dekt**, niet alleen de 65 tekens die
  vandaag op een bladzijde staan. Anders is de volgende prosewijziging een
  onzichtbare `?`.
- **De kop krijgt geen tweede maat.** Zie hierboven.
- **De prose is niet aangeraakt.** Het pakket mocht in laatste instantie
  prose-aanpassingen doen als een bladzijde zou overlopen. Dat was niet nodig:
  de hand is smaller, dus elke bladzijde werd korter (zie hieronder).

## QC-resultaat

Gemeten, niet aangenomen.

**Het bladbudget.** Gewrapte regels per bladzijde, met de oude rekensom
(drukfont, shear 0,25 / 0,10) tegen de nieuwe (handfont). De capaciteit is
24 regels op bladzijde 1 en 19 op bladzijde 2 (daar staat Alberta's schets).

- `l1`: 16 → 12 (van 24) en 12 → 11 (van 19)
- `l2`: 16 → 15 en 14 → 13
- `l3`: 14 → 12 en 11 → 11
- `l4`: 16 → 14 en 11 → 11
- `l5`: 16 → 12 en 11 → 10
- `l6`: 15 → 12 en 10 → 9
- `l7`: 18 → 15 en 12 → 11

Geen enkele bladzijde loopt over; twaalf van de veertien werden korter, twee
bleven gelijk. De koppen wrappen naar één tot drie regels (de grens is drie);
elf van de veertien werden korter. De breedste gewrapte regel meet 136 px in
een kolom van 136 — even krap als voorheen, maar niet krapper. De weekregel
ging op alle zeven de spreads van drie naar twee regels. Gemiddelde
tekenbreedte inclusief spatiëring: 4,64 px tegen 5,42 px voor de drukfont, over
alle 3506 tekens die in handschrift op een bladzijde komen.

**De testsuite.** `node --test test/test-*.mjs` — **391 tests, 391 groen**
(382 bij aanvang; negen nieuwe). De negen:

- vijf in `test-typografie.mjs` over de font zelf: haar vorm (8 × 10,
  x-hoogte 6, basislijn 7, liniatuur 8), tien rijen van acht tekens per glyph,
  dekking ⊇ de drukfont, variabele inktbreedtes, en — de kern — dat de
  basislijn drie liggingen kent en dat `n` anders ligt dan `e`;
- één die elk teken van de veertien bladzijden tegen de glyphset houdt (de
  WP G-dekkingstest, nu ook voor de hand);
- één over stokken en staarten die buiten de x-hoogte steken en binnen de cel
  blijven;
- één in `test-spreads.mjs` die de font aan de bladspiegel bindt: cel ≤
  regelafstand, en basislijn = liniatuurrij − 1;
- één over de nieuwe optie `variatie`.

Twee bestaande tests zijn herschreven omdat hun eigenschap niet meer waar is:
"handschrift is breder dan prose" werd "handschrift meet met de handfont, niet
met de drukfont" (de hand is nu smáller, en dat is precies wat het bladbudget
redt), en de schuinstandtest controleert er nu bij dat 0 de standaard is.

**De rest van de poort.**

- `node tools/lint-scene.mjs` — schoon op alle elf de scènebestanden.
- `node tools/check-assets.mjs` — geen drift, negen editor-modellen
  byte-getrouw.
- `smoke-browser` — 38/38 PASS.
- `smoke-full-playthrough` — 97/97 PASS, geen JavaScript-fouten.

**Screenshots** in `test-results/`, alle drie op 3× nearest-neighbour zodat de
letterbeelden te beoordelen zijn:

- `wp36-alfabet.png` — de volledige glyphset op gelinieerd papier, met vijf
  proefzinnen eronder in de echte spatiëring.
- `wp36-spread-l1.png` — bladzijde 1 van het spread van level 1.
- `wp36-spread-l4.png` — bladzijde 1 van het spread van level 4.

## Wat er is veranderd

- `js/font-hand.js` — nieuw: 114 glyphs van 8 × 10, met de maten-berekening en
  de Node-export.
- `js/gfx.js` — `tekenHandschrift` en `handschriftBreedte` zetten en meten met
  `AL.fontHand`; shear standaard 0; nieuwe optie `variatie`.
- `js/scenes/scene-spread-template.js` — `_jitter` verwijderd, beide handen
  herzien, de weekregel op negen pixels regelafstand.
- `index.html` — `js/font-hand.js` geladen tussen font en gfx.
- `test/test-typografie.mjs` — acht tests erbij, twee herschreven.
- `test/test-spreads.mjs` — de twee handen bijgewerkt, één test erbij.
- `docs/art-stijlgids.md` — de handschriftparagraaf van het spread vervangen;
  nieuwe sectie §Typografie met de drie zetwijzen, de ontwerpregels van de
  handfont en de motivering van het monospace chroom.
- `docs/engine-architectuur.md` — "twee zetwijzen" werd drie; de laadvolgorde
  en de overnametabel dragen `font-hand.js`.

`docs/scene-schema.md` en `docs/sprite-schema.md` noemden het oude mechanisme
niet en zijn ongemoeid gebleven. Het `walkthrough/` is niet herbouwd: er is
geen prose en geen scènenaam veranderd.

## Volgende

**WP 37 — Geluid hoorbaar en volledig.**
