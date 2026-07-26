# Levels en scharnieren

Het gezaghebbende koppelingsdocument: level ↔ scharnier ↔ "speelbaar na week
X" ↔ welke bestanden en methoden van _Seven Little Goats_ het herstelt ↔
puzzelvormen. Elke level-worker (WP 7 en 8) bouwt tegen deze tabel. De
scharnieren komen letterlijk uit de cursus (de zeven scharnieren van
Programming Fundamentals); de kolommen "restores" en "vormen" komen uit het
goedgekeurde plan. Wijkt een level-implementatie hiervan af, dan is dit document
de bron van waarheid, niet de code.

## De zeven scharnieren (cursus)

Verbatim uit de cursusleidraad, _De zeven scharnieren_:

| # | Na les | Scharnier | Waarom kritiek |
|---|--------|-----------|----------------|
| 1 | 2–3 | Klasse vs. instantie, velden, constructor, `this` | Fundament van álles |
| 2 | 4 | Signaturen: return vs. `void`, attribuut / parameter / lokale variabele | Draagt "schrijf de methode" |
| 3 | 5–6 | Voorwaarden: validatie (3 varianten), cascade, `&&`/`\|\|`/`!` | De kern van toets 1 |
| 4 | 8 | Referenties: twee pijlen, één doos; `null` | Draagt de latere lessen |
| 5 | 10–11 | De lus-romp + patroonkeuze (tellen, opbouwen, filteren, uiterste) | De kern van toets 2 |
| 6 | 12–13 | Index en off-by-one; welke lus kies ik | Toets 2 en eindtoets |
| 7 | 17–18 | Zoeken + de dubbele pijl (`artikel.getCategorie().getNaam()`) | De kern van de eindtoets |

## De zeven hoofdstuktitels

Elk level draagt één naam, en die naam staat op drie plaatsen tegelijk: de kop
van bladzijde 1 van het notitieboek-spread ("Hoofdstuk 3 — Voorwaarden: de deur
op slot"), de kop van de gesimuleerde pc ("Alberta's pc — Level 3 —
Voorwaarden: de deur op slot") en de hoofdstukkoppen van de walkthrough. De
vorm ligt vast: **eerst de scharnierterm zoals de cursus die noemt, dan een
dubbelpunt, dan een beeld uit Alberta's eigen verhaal.**

| L | Hoofdstuktitel | Waar het beeld vandaan komt |
|---|----------------|------------------------------|
| 1 | Klasse en instantie: zeven uit één vorm | zeven geitjes uit één `Geitje`-klasse |
| 2 | Signaturen: wat erin gaat, wat eruit komt | de methode als machine met in- en uitgang |
| 3 | Voorwaarden: de deur op slot | de geitjes mogen alleen opendoen als aan álle voorwaarden voldaan is |
| 4 | Referenties: twee pijlen, één doos | staat al in cursustaal; ongewijzigd overgenomen |
| 5 | Luspatronen: geitje voor geitje | de lus die de kudde één voor één afgaat |
| 6 | Index en off-by-one: de laatste plank | de laatste plank van de brug = `size()` min één |
| 7 | Zoeken en de dubbele pijl: waar het jongste zit | `zoekGeitje` zoekt het jongste in de klokkast |

Tot WP 31 droegen de levels de titels van de andere minigames van de cursus
("De knikkerbaan", "De plankenbrug boven het ravijn", "De speurtocht…",
letterlijk uit `games/home/hub-data.js` in de cursusrepo — niet in deze repo).
Die namen zeggen een speler niets over de leerstof: het scharnier stond wél op
bladzijde 2, maar de titel zelf had geen enkele band met de cursusterminologie.
De nieuwe titels zetten de term vooraan, zodat een speler die vastzit weet
waarnaar hij in zijn cursus moet zoeken, en houden het verhaal in de tweede
helft.

De metafoor-woordenschat uit de cursus-hub blíjft in het spel — in de hints van
stap 1, in Alberta's briefteksten en in de schetsen op bladzijde 2 van elk
spread (`js/scenes/spread-schetsen.js`). Alleen de titels dragen ze niet meer:

| # | Metafoor (hints, brieven, schetsen) | Kernbeeld |
|---|-------------------------------------|-----------|
| 1 | De blauwdruk en de doos | klasse = blauwdruk, instantie = doos; `this` = "deze doos" |
| 2 | Trechters erin, goot eruit; drie dozen | parameter in, return uit; attribuut/parameter/lokaal |
| 3 | De knikkerbaan | validatie klemt, de cascade splitst, `&&`/`\|\|`/`!` sturen |
| 4 | Twee pijlen, één doos | twee variabelen wijzen naar hetzelfde object; `null` = geen doos |
| 5 | De patroonkaart | tellen, totaliseren, opbouwen, filteren, het uiterste zoeken |
| 6 | De plankenbrug boven het ravijn | één plank te ver = off-by-one; welke lus past |
| 7 | De speurtocht; de dubbele pijl | zoeklus geeft object of `null`; ketting van getters |

## De autoritatieve leveltabel

Overgenomen uit het goedgekeurde plan. Deze tabel is bindend; de
`Beslissing`-blokken eronder verklaren de open keuzes.

| L | Scharnier (na week) | Herstelt (Java-bestanden) | Puzzelvormen |
|---|---------------------|---------------------------|--------------|
| 1 | klasse/instantie, velden, constructor, this (1) | `Voorwerp`, `Geitje` | herstel constructor; schrijf `Geitje` uit de notities; verklaar blauwdruk/doos |
| 2 | signaturen: return vs void, param/lokaal (2) | `Speler` | herstel signaturen; Parsons-methode; trace shadowing |
| 3 | voorwaarden: validatie ×3, cascade, &&/\|\|/! (2) | `Speler.setLevenspunten`, `Gevecht` | herstel clamp; vind-de-fout && vs \|\|; trace cascade |
| 4 | referenties: twee pijlen één doos, null (3) | `Kamer`, `Spel.verbindKamers` | herstel buur-bedrading; trace aliasing; verklaar null |
| 5 | lus-romp + patroonkeuze (4) | lus-methoden (tel/opbouw/filter/uiterste) | schrijf 2 lussen uit de notities; Parsons string-builder; welke patroonkaart |
| 6 | index & off-by-one, welke lus (5) | `Kamer.verwijderVoorwerp`, `Gevecht`-rondes | herstel off-by-one; trace indices; vind-de-fout luskeuze |
| 7 | zoeken + dubbele pijl (6) | `Spel.zoekGeitje`, endgame-keten | schrijf zoeklus die `Geitje`/null teruggeeft; herstel null-veilige getter-keten; trace keten |

De klassenamen in de kolom "herstelt" zijn identiek aan de klassenlijst in
`spelontwerp-seven-little-goats.md` en aan de checker-doelen in
`checker-contract.md`. Elk puzzelfragment is een stuk van een echt bestand uit
`seven-little-goats/src/`; `tools/check-assets` verifieert dat de door de
modeloplossing herstelde puzzelcode identiek is aan het ongeschonden Java-
fragment.

> Toelichting: "na week X" is de **echte cursusweek**. De cursus geeft drie
> lessen per week; de scharnieren vallen na les 2–3, 4, 5–6, 8, 10–11, 12–13
> en 17–18 (zie de eerste tabel), en dat komt overeen met de weken 1, 2, 2,
> 3, 4, 5 en 6. Scharnier 6 overspant les 12 (week 4) en les 13 (week 5); we
> ronden af naar week 5, de week waarin het scharnier volledig gezien is.

### Volledige koppeltabel (bindend voor de UI)

| L | Scharnier # | Na cursusweek | Cursusles | Toetsblok |
|---|-------------|---------------|-----------|-----------|
| 1 | 1 | 1 | les 2–3 | vóór toets 1 |
| 2 | 2 | 2 | les 4 | vóór toets 1 |
| 3 | 3 | 2 | les 5–6 | vóór toets 1 |
| 4 | 4 | 3 | les 8 | vóór toets 2 |
| 5 | 5 | 4 | les 10–11 | vóór toets 2 |
| 6 | 6 | 5 | les 12–13 | vóór toets 2 |
| 7 | 7 | 6 | les 17–18 | vóór de eindtoets |

De **voet van bladzijde 2** van elk notitieboek-spread toont letterlijk: "Week X
in mijn schema.", met X uit de kolom "Na cursusweek". De week is dus onze
cursusweek, maar op papier van 1993 staat ze als Alberta's eigen planning — het
woord "cursus" hoort niet in haar handschrift (WP 45; `achtergrond.md`, §"Het
notitieboek"). Er is geen aparte level-intro die die regel draagt; het spread is
de plek. Elke andere plek die Alberta's weekregel citeert, citeert diezelfde X:
de onderzoektekst van het notitieboek op zolder-west leest het spread van level 1
en zegt dus week 1 (ze zei week 3 tot WP 31), en de walkthrough herhaalt de week
per level.

## Toetsritme

Het spel volgt het tempo-schema van de cursus (de leidraad koppelt de checks
aan de drie toetsen, om uitstelgedrag te vermijden):

- **Levels 1–3** horen bij scharnieren 1–3 en zijn bedoeld vóór **toets 1**.
- **Levels 4–6** horen bij scharnieren 4–6 en zijn bedoeld vóór **toets 2**.
- **Level 7** hoort bij scharnier 7 en is bedoeld vóór de **eindtoets**.

Het spel dwingt dit niet af (geen sloten op latere levels op basis van datum),
maar de "na week"-regel en Alberta's oordeel op het einde maken zichtbaar
of de speler op schema zat. Dit spiegelt de "groene vinkjes"-aanpak van de
cursus: zichtbaar, niet verplicht.

## Tijdsbudget per level

Elk level is ontworpen op **± 15 minuten** en **precies 3 puzzels**, meestal:

- **1 editor-puzzel** in de gesimuleerde editor (herstel of schrijf-van-nul), en
- **2 terminal-puzzels** in de gesimuleerde terminal (trace, vind-de-fout,
  verklaar-in-één-zin, Parsons, welke-patroonkaart).

Twee levels wijken af, en de leveltabel hierboven zegt dat ook: **level 1** en
**level 7** dragen twee editor-puzzels en één terminal-puzzel. Level 1 laat de
speler een klasse eerst herstellen en dan zelf schrijven — dat is precies het
scharnier; level 7 heeft de zoeklus én de getter-keten nodig voor de endgame.

Zeven levels × ~15 min codewerk ≈ 90 minuten puzzels. Met de zolder-
verbindingsstukjes (spread lezen, lopen, intro/outro) erbij komt een volledige
playthrough op **± 2 uur** — de kalibratie die WP 11 met een getimede dry run
controleert.

De verdeling per level (editor eerst, dan terminal) is een richtlijn, geen wet:
een level mag de volgorde variëren zolang het er drie blijven, zolang er
minstens één editor-puzzel bij zit, en zolang die editor-puzzel het bestand
herstelt dat in de kolom "herstelt" staat. De precieze puzzeldefinities
(beschadigde varianten, modeloplossingen, hints, traces) leven in
`js/levels/levelN.js`; dit document
legt alleen het contract vast waaraan die bestanden moeten voldoen.

### Getimede controle (WP 11)

De doorlopende playthrough-test (`test/smoke-full-playthrough.mjs`) speelt het
hele spel in één run en levert de harde telling voor de kalibratie: **21
puzzels** (3 per level × 7), **7 spreads** om te lezen (één per level, elk ± 2
pagina's — de intro is bewust géén spread, zie `spelontwerp-legacy.md`),
drieëntwintig getypte zolder-commando's om de zeven fragmenten op te diepen en
zeven keer aan de pc te gaan zitten, en de endgame-sim van _Seven Little Goats_
tot aan één van de vier eindes.

Omgerekend naar een échte speler (niet de scriptsnelheid):

- **Codewerk:** de editor-puzzels (herstel of schrijf-van-nul) vragen ± 4–7
  min, de terminal-puzzels (trace, vind-de-fout, verklaar, Parsons,
  patroonkaart) ± 2–4 min. Met de spread erbij landt een level op ± 13–15
  min. Zeven levels samen ≈ **90–105 min**. Dat bevestigt ± 15 min/level.
- **Zolder-tussenwerk:** intro, fragmenten zoeken, lopen, spreads bladeren
  en het slot (oordeel + epiloog) samen ≈ **20–25 min** — binnen budget.
- **Endgame-sim:** het uitspelen van _Seven Little Goats_ kost een eerste speler
  ± **10–15 min**; dit stuk zat nog niet apart in het budget.

Totaal ≈ **120–145 min**, dus de headline **± 2 uur** houdt stand, met de
kanttekening dat de sim de realistische duur richting ± 2 u 10 duwt. De
tijdrovendste post is en blijft het codewerk; hints (die de speler hier nul keer
nodig had) zouden dat alleen verlengen.

## Consistentie-eisen

- De kolom "herstelt" gebruikt exact de klassenamen en methodenamen uit
  `spelontwerp-seven-little-goats.md`.
- Elke editor-puzzel mapt op een echt fragment uit `seven-little-goats/src/`;
  drift wordt bewaakt door `tools/check-assets` (WP 7–9).
- De puzzelvormen komen overeen met de itemvormen van de cursus (voorspel-de-
  output, verklaar-in-één-zin, welke-kaart, vind-de-fout, schrijf-de-body) en
  met de effect-tags voor de gesimuleerde pc in `engine-architectuur.md`.
- De hint-stadia per puzzel volgen `save-en-hints.md`: stap 1 hergebruikt de
  metafoor uit de scharnier-woordenschat hierboven.
