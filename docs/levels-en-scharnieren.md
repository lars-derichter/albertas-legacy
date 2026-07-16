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

De metafoor-woordenschat per scharnier (uit de cursus-hub, `hub-data.js`),
die de hints in stap 1 hergebruiken:

| # | Metafoor | Kernbeeld |
|---|----------|-----------|
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

De in-game intro van elk level toont letterlijk: "Dit zou je moeten kunnen na
week X van de cursus", met X uit de kolom "Na cursusweek".

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

Elk level is ontworpen op **± 15 minuten** en **± 3 puzzels**:

- **1 editor-puzzel** in de gesimuleerde editor (herstel of schrijf-van-nul), en
- **2 terminal-puzzels** in de gesimuleerde terminal (trace, vind-de-fout,
  verklaar-in-één-zin, Parsons, welke-patroonkaart).

Zeven levels × ~15 min codewerk ≈ 90 minuten puzzels. Met de zolder-
verbindingsstukjes (spread lezen, lopen, intro/outro) erbij komt een volledige
playthrough op **± 2 uur** — de kalibratie die WP 11 met een getimede dry run
controleert.

De verdeling per level (editor eerst, dan terminal) is een richtlijn, geen wet:
een level mag de volgorde variëren zolang de mix één editor-item en twee
terminal-items blijft, en zolang de editor-puzzel het bestand herstelt dat in de
kolom "herstelt" staat. De precieze puzzeldefinities (beschadigde varianten,
modeloplossingen, hints, traces) leven in `js/levels/levelN.js`; dit document
legt alleen het contract vast waaraan die bestanden moeten voldoen.

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
