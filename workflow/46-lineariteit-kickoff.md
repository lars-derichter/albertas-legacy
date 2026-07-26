# 46 — Programma 4: lineariteit en spec-notities (kickoff)

Lars speelde de gemergde build en meldde twee problemen. Deze entry legt
de feedback, de beslissingen en het goedgekeurde plan vast; de pakketten
47-49 voeren uit op de nieuwe branch `claude/lineariteit-en-notities`
(vanaf main `fb70ed7`), met een schone PR aan het einde.

## De feedback, verbatim

> Nu kan ik de doos met het tweede blad vinden voor ik de opdrachten
> van het eerste blad heb opgelost. Als ik dan aan de computer ga
> zitten, krijg ik meteen de opdrachten van het tweede blad. Er moet
> wel gezorgd worden dat het oplossen van de code puzzels lineair
> gebeurt.
> Het notitieboek geeft ook nog steeds veel uitleg over de code en
> geeft zo al bijna de oplossing. Studenten moeten dit zelf kunnen.
> Logischer zou bijv zijn om de velden op te sommen die bij geitje
> horen of om een soort klassendiagram te schetsen. Niet om (quasi)
> uit te leggen hoe this werkt. Dat leren studenten in de les en in de
> cursus.
> Maak een nieuw plan om dit nog op te lossen: een zekere vorm van
> lineariteit en minder didactische commentaren in de notities. Je zal
> best op een nieuwe branch beginnen, zodat je een schoon nieuw pull
> request kan maken wanneer je hiermee klaar bent.

## Vragen en antwoorden

Twee keuzes voorgelegd (2026-07-26), beide beantwoord met de
aanbeveling van de manager:

1. **Waar dwingt het spel lineariteit af?** — "Aan de doos": `open
   doos` voor blad N+1 weigert in-fictie zolang hoofdstuk N niet
   hersteld is. Dat past in de fictie (Alberta nummerde haar schema),
   houdt één consistent model aan en vermijdt half-ontgrendelde
   toestanden.
2. **Hoe kaal worden de notities?** — "Pure spec": briefA = haar
   steno-spec (klasse, velden + types, signaturen,
   klassendiagram-achtig), briefB = wat stuk/onaf is; nul
   conceptuitleg. De uitleg blijft alleen in de gefaseerde hints, die
   meetellen voor het oordeel — uitleg krijgt zo een prijs.

## De wortels (verkenning op main fb70ed7, geverifieerd)

- **`volgendFragment` kijkt alleen naar `ontgrendeld`, nooit naar
  `afgerond`** (world.js:310-318); `_openFragmentDoos` (:320-334)
  heeft geen voortgangspoort — het commentaar zegt letterlijk "lichte
  ruimtelijke progressie, geen harde sloten". Dozen zijn generiek per
  kamer (2-4 in de doorgang, 5-7 op de overloop): drie keer `open
  doos` typen ontgrendelt drie bladen.
- **Erger dan gemeld:** `ontgrendelFragment` zet `levelActief = n` en
  er bestaat géén pad terug — het pc-menu kent geen levelkeuze
  (pc.js:113-118 bindt aan `levelActief`), dus wie doos 2 opent kan de
  puzzels van level 1 nooit meer bereiken. De endgame vuurt op
  `level-af:7` alleen, dus het spel was uitspeelbaar zonder levels 1-6
  op te lossen.
- **De notities lekken antwoorden.** Naast de conceptuitleg (this in
  l1, signatuur-anatomie + shadowing-antwoord in l2, aliasing/null met
  de trace- en verklaar-antwoorden in l4, patroontaxonomie in l5, de
  volledige off-by-one-les in l6): l3-briefB verklapte het
  ||/&&-antwoord van de vindfout-puzzel, l6-briefB bevatte de
  modeloplossing in proza én het rondes-antwoord, en de l7-ketennotitie
  gaf de reparatie van variant A weg.
- **De hints dragen de uitleg al** — stage 1 dupliceert de
  briefA-conceptzinnen bijna woordelijk (bv. l6-editor-repair t.o.v.
  de plankenbrug-les). Kaal maken van de brieven verliest dus geen
  leerstof; het verplaatst ze naar de laag die meetelt.

## Beslissingen

- De poort komt ná de kamercheck, zodat "verkeerde kamer"-verwijzingen
  blijven kloppen; het notitieboek (fragment 1) heeft geen voorganger
  en blijft vrij.
- De "geen harde sloten"-passages in code en docs worden herschreven —
  dit is een bewuste ontwerpwijziging op vraag van de docent, gelogd
  hier.
- De sneltoets in smoke-levels-4-7 ("ontgrendel zonder oplossen") kan
  onder de poort niet meer via spelcommando's; hij wordt een expliciete
  testhaak (directe state-manipulatie), geen spelpad.
- Vorm-anker voor alle notities: de geitjeStub (level1.js:128-132) —
  namen + types + wat ontbreekt, geen concept.
- WP 48 krijgt opnieuw een adversariële checker-agent vóór de
  manager-QC (spoilers en puzzel-integriteit zijn onzichtbaar voor de
  automatische poorten).

## QC-resultaat

Docs only. Wrap op 80 tekens gecontroleerd; `node --test
test/test-*.mjs` ongewijzigd 425/425 groen vóór en na.

## Bijlage — het goedgekeurde plan (samenvatting per pakket)

- **WP 47 — De poort aan de doos:** voortgangspoort in
  `_openFragmentDoos` (fragment n alleen als level n-1 afgerond);
  nieuwe weigering-string in Alberta-register ("haar schema is
  duidelijk: eerst hoofdstuk N"); comments en docs mee
  (save-en-hints, spelontwerp-legacy, walkthrough deel 1); tests:
  bestaande volgorde-tests krijgen afronding-tussenstappen, nieuwe
  poort-tests (weigering, doorgang, notitieboek vrij,
  hint↔pc-consistentie), smoke-assert op de weigering.
- **WP 48 — Notities als spec:** alle briefA's naar steno-spec, de
  spoilers uit briefB's en stub-notities, l1-schets richting
  klassendiagram (haalbaarheid eerst meten), checker-dekking per level
  geverifieerd (de spec moet dragen wat checks[] eist:
  MAX_LEVENSPUNTEN in l3, int/Voorwerp in l5, variantneutraliteit);
  walkthrough + PDF's mee; adversariële checker vóór manager-QC.
- **WP 49 — Slot en PR:** alle poorten in één run, screenshots naar
  Lars, eindstand in voortgang.md, draft-PR van
  `claude/lineariteit-en-notities` naar main.
