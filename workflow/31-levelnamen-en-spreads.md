# 31 — Levelnamen en spreads

## Opdracht

WP 31 uit het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`, Bijlage B). Uit de prompt van
Lars: *"the crazy names of the levels that are taken from the names of
the other minigames in the course, but that have no relation with the
course terminology"*. Lars koos in de kickoff-Q&A voor "Story +
terminology": titels die vooropgaan met de scharnierterm en het beeld uit
_Seven Little Goats_ meedragen. Daarnaast twee bevindingen uit de
verkenning: de gedefinieerde levelnamen werden nergens getoond (de pc-kop
zei kaal "Level 3"), en het notitieboek sprak zichzelf tegen over het
weeknummer. Een Opus 5-worker voerde uit; de manager controleerde en
committe.

## Aanpak

De zeven titels, zoals de speler ze nu ziet op bladzijde 1 van elk
spread ("Hoofdstuk N — …") en in de pc-kop ("Alberta's pc — Level N —
…"):

1. Klasse en instantie: zeven uit één vorm
2. Signaturen: wat erin gaat, wat eruit komt
3. Voorwaarden: de deur op slot
4. Referenties: twee pijlen, één doos
5. Luspatronen: geitje voor geitje
6. Index en off-by-one: de laatste plank
7. Zoeken en de dubbele pijl: waar het jongste zit

Bladzijde 2 draagt voortaan de losse cursustermen als ondertitel, zonder
de term uit de titel te herhalen (voor level 4 bijvoorbeeld "Twee
variabelen, één object; null"). De metafoor-woordenschat zelf (de
knikker, de plank, het spoor) blijft bestaan wáár ze hoort: in Alberta's
brieven, de hints en de schetsen op bladzijde 2 — het waren de títels
die geleend waren van de cursus-minigames.

Vooraf is de echte bladspiegel nagemeten in plaats van op het
commentaar te vertrouwen: de kop wordt in dezelfde kolom van 136 px
gewrapt als de lopende tekst, en bladzijde 2 verliest regels aan de
schets — 24 regels op bladzijde 1, 19 op bladzijde 2, niet de "24 per
pagina" die het bestandscommentaar beweerde. Elke nieuwe kop is gemeten
met `handschriftBreedte` (breedste regel 136/136 px, geen enkele
erover) en een nieuwe test (`test/test-spreads.mjs`, 9 tests) bewaakt
voortaan bladspiegel, kopbreedte, titelvorm en het weeknummer.

## Beslissingen

- **De pc-kop toont nu de volledige naam** (`S().lN.naam`, met kale
  terugval; het aparte geval voor testlevel 0 kon daardoor weg). Op een
  smal scherm kapt `.pc-header` af met een beletselteken in plaats van
  naar een tweede regel te breken — een kopbalk uit 1990 breekt niet.
- **Bladzijde 2 herhaalt de titelterm niet** — anders las level 4 twee
  keer dezelfde regel. Vastgelegd als testregel, niet alleen als keuze.
- **`maakSpread`-veld `scharnier` heet nu `termen`**: het veld draagt
  niet langer de metafoor maar de losse termen; de oude naam zou liegen.
  Geen lezers buiten de IIFE (gegrept).
- **Week-clash beslecht richting de koppeltabel**: het notitieboek zegt
  nu "na week 1", zoals de voet van het level-1-spread en
  `docs/levels-en-scharnieren.md` al zeiden.
- **Bijvangst gefixt:** `artikel.getCategorie().getNaam()` in de brief
  van level 7 meet 174 px — onbreekbaar voor `_wrap`, en liep dus over
  de rug op het rechterblad. In twee stukken gezet (max 120 px); de
  nieuwe test vangt precies deze klasse van fouten (gecontroleerd door
  de oude regel terug te zetten: test faalt met het juiste bericht).
- **Level 6 behoudt "de laatste plank"** — het is het voorstel van Lars
  zelf en het beeld klopt met de schets die blijft; genoteerd dat dit de
  enige titel is waarvan de verhaalhelft uit de geleende metafoor komt
  in plaats van uit _Seven Little Goats_.
- **walkthrough deel 1 én deel 2 dragen de nieuwe koppen** (deel 1 stond
  niet in de opdracht maar draagt dezelfde zeven koppen); de PDF-herbouw
  blijft WP 39.

## QC-resultaat

Door de worker gedraaid en door de manager onafhankelijk herhaald:

- `node --test test/test-*.mjs` — **337/337 groen** (328 + 9 nieuwe
  spread-tests).
- `tools/lint-scene.mjs` — alle scènes in orde; `tools/check-assets.mjs`
  — geen drift.
- Breedtebewijs per kop gerapporteerd (elke kop ≤ 3 regels, breedste
  regel 136/136 px); bladzijden 10-18 van hun budget gebruikt.
- Playwright ontbreekt in deze container, dus de DOM-kopbalk is
  geverifieerd met de breedterekening (langste naam 72 tekens op een
  balk van ± 78) en de CSS-afkapping; de browser-smokes draaien in
  WP 40.
