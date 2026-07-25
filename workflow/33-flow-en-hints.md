# 33 — Flow en hints op de zolder

## Opdracht

WP 33 uit het kwaliteitsreviewprogramma (zie
`workflow/28-kwaliteitsreview-kickoff.md`, Bijlage A.1 en Bijlage B). Drie
defecten uit de verkenning:

- **G — de zolder-`?` was statisch en misleidend.** Eén vaste tekst per hoek,
  terwijl de helptekst belooft "een hint voor waar je nu vastzit". De hint van
  de doorgang stuurde de speler wég van de dozen met de fragmenten 2, 3 en 4,
  en de hint van de westhoek bleef tot het einde "open het notitieboek" zeggen.
- **H — een zachte doodlopende lus.** `world.gebruikPc` keek alleen naar
  `ontgrendeld`, nooit naar `afgerond`: na een afgerond hoofdstuk kon de speler
  weer plaatsnemen, de pc ging open op een level waar alles al af was, en niets
  wees hem naar het volgende fragment.
- **I (klein)** — de spread-bladerhint "spatie: pc >" beloofde de pc terwijl de
  spatie alleen het boek dichtdoet; de epiloog sloeg wél op maar de terugkeer
  naar de titel niet, zodat een reload na de aftiteling de eindkaart opnieuw
  toonde; en de `open doos`/`kist`-woordenschat klopte per kamer niet.

Een Opus 5-worker voerde uit; de manager controleert en commit.

## Aanpak

- **De `?`-hint volgt de voortgang, niet de kamer.** `world.hint` vertakt op
  `levelActief` + `volgendFragment` + `FRAGMENT_LOCATIE` en zegt wat er nú te
  doen staat. De beslisboom staat hieronder en in `docs/save-en-hints.md`,
  §"De zolder-hint". Alle teksten leven als sleutels in `AL.strings.hints`; er
  staat geen letterlijke prose in de logica en er is geen nieuw staat-veld —
  alles wordt uit de bestaande `toestand` afgeleid.
- **De vaste `scenes.*.hint`-sleutels zijn verdwenen** (alle vier), net als
  `geenPlaatsHint`. Ze waren de drager van het defect; een terugval erop zou
  het defect in stand houden. Een test bewaakt dat ze weg blijven.
- **`gebruikPc` kent nu drie uitkomsten:** geen fragment (ongewijzigd), het
  actieve hoofdstuk al hersteld terwijl er nog een blad op de zolder ligt (de
  pc blijft dicht en zegt in twee regels wat er klaar is en waar dat blad
  ligt), of gewoon open. De where-tekst komt uit dezelfde helper als de hint
  (`_waarLigtFragment`), dus de pc en `?` kunnen elkaar niet tegenspreken.
- **Woordenschat per kamer eerlijk gemaakt.** In `zolder-west` antwoorden
  `open kist` (`AL.strings.kist.open`) en `open doos`/`dozen`/`karton`
  (`AL.strings.dozen.westhoek`) nu zinnig in plaats van "Dat zie je hier niet";
  in `zolder-midden` en op de `overloop` is "kist" géén open-woord meer, want
  daar staat geen kist getekend. De fragment-flow zelf is onveranderd; "karton"
  is als openings-woord toegevoegd omdat `onderzoek` het al aanvaardde.
  `open broncode-doos` kreeg een eigen sleutel (`dozen.broncodeDicht`) — het
  antwoordde met de kamerhint die nu weg is.
- **Bladerhint waar en gecentraliseerd** in `AL.strings.spreadChroom`
  (`bladerVerder` / `bladerLaatste`); de laatste is "spatie: terug".
- **Epiloog → titel slaat op.** De nieuwe functie `naarTitelNaEpiloog` zet
  `modus: "titel"` en bewaart; `hervat()` toont bij die stand de titelkaart.
  De waarde `"titel"` stond al in de staat-documentatie
  (`engine-architectuur.md`) maar werd nooit geschreven — nu wel, en alleen
  hier.

## De beslisboom van `world.hint`

```
1. levels[levelActief] is ontgrendeld én niet afgerond?
     ja → sceneId === "zolder-oost"  → hints.werkPcHier   ("typ 'ga zitten'")
          anders                     → hints.werkPcElders ("de pc staat in de
                                                           werkhoek, oostkant")
2. n = volgendFragment(toestand)
     n === null → hints.allesAf
     loc = FRAGMENT_LOCATIE[n]
     loc === sceneId → hints.fragmentHier[loc]     (west: het notitieboek;
                                                    elders: 'open doos')
     anders          → hints.fragmentGinder[loc]   (welke kamer, en de weg)
```

Effect blijft `hint:1`; de zolder-hint telt nooit in `hintsTotaal`
(save-en-hints.md). `gebruikPc` gebruikt stap 2 van dezelfde boom voor zijn
tweede regel.
De nieuwe sleutels, met de tekst verkort:

- `hints.werkPcHier` — "Het hoofdstuk dat je opensloeg, is nog niet
  hersteld. De pc staat voor je — typ 'ga zitten'."
- `hints.werkPcElders` — "… Dat werk ligt op de pc, in de werkhoek aan
  de oostkant van de zolder."
- `hints.fragmentHier["zolder-west"]` — "Het notitieboek ligt hier, open
  in het licht. Sla het open — daar begint alles."
- `hints.fragmentHier["zolder-midden"]` — "Het volgende blad zit hier,
  in een van de gemerkte dozen: typ 'open doos'. De doos met BRONCODE
  laat je staan…"
- `hints.fragmentHier["overloop"]` — "Het volgende blad zit hier, in de
  stapels tegen de wand. Typ 'open doos'."
- `hints.fragmentGinder["zolder-west"]` — "Het volgende blad zit in het
  notitieboek zelf, in de westhoek…"
- `hints.fragmentGinder["zolder-midden"]` — "Het volgende blad zit in
  een gemerkte doos in de doorgang, midden op de zolder."
- `hints.fragmentGinder["overloop"]` — "Het volgende blad ligt dieper in
  het archief: boven aan de trap, op de overloop…"
- `hints.allesAf` — "Elk blad is gevonden en elk hoofdstuk hersteld. Op
  de zolder ligt niets meer voor je…"
- `pc.levelAf` — "Dit hoofdstuk is hersteld; de pc heeft niets meer voor
  je tot je het volgende blad… gevonden hebt."
- `dozen.westhoek` — "Je krijgt een klep los. Er zit huisraad in:
  gordijnringen, een rol behangpapier, schroeven in een jampot…"
- `dozen.broncodeDicht` — "De tape zit er nog helemaal op, en dat laat
  je zo. Deze doos is voor het einde…"
- `kist.open` — "Het deksel ligt er los op. In de kist zit opgevouwen
  stof… Het notitieboek lag erbovenop, niet erin."
- `spreadChroom.bladerVerder` / `.bladerLaatste` — "spatie >" /
  "spatie: terug"
- Verwijderd: `scenes.*.hint` (4×) en `geenPlaatsHint`.

## Beslissingen

- **De statische kamerhints zijn verwijderd, niet bewaard als terugval.** Eén
  tekst per hoek kan de spelstand per definitie niet volgen; laten staan zou
  betekenen dat elke nieuwe kamer weer een liegende hint kan krijgen.
  `test-world-hub.mjs` keurt dat ze weg blijven.
- **De hint hangt aan `levelActief`, niet aan "het laagste onafgewerkte
  level".** Dat laatste leek beter maar botst met de bestaande flow: de
  rooksmaaktest `smoke-levels-4-7` ontgrendelt de levels 1-3 zonder ze op te
  lossen en verwacht dat `ga zitten` op level 4 opent. `levelActief` is het
  anker dat `gebruikPc` al gebruikte, dus hint en pc blijven met elkaar in de
  pas.
- **De bladerhint is truthful gemaakt, niet het gedrag.** De alternatieve
  ingreep (na de laatste bladzijde meteen de pc openen) verandert de lus per
  level en zou drie rooksmaaktesten breken die ná de spread in de werkhoek
  verwachten te staan. De regel heet nu "spatie: terug".
- **Dertien tekens is de bovengrens van die regel.** Ze deelt de onderrand van
  het linkerblad met het paginanummer ("1/2", 24 px vanaf x=16) en wordt rechts
  uitgelijnd op x=152. "spatie: werkhoek >" (144 px) zou over het paginanummer
  heen schuiven. `test-spreads.mjs` rekent de grens na, zodat een latere
  herformulering niet stil overloopt.
- **Er is geen spread-tak in de hint.** De spread is een eigen modus met een
  geblokkeerde invoerbalk; `?` is daar niet te typen. Het save-veld
  `spreadGelezen` blijft dood hout voor WP 38.
- **`modus: "titel"` wordt alleen na de epiloog geschreven,** niet bij elke
  start van de titelkaart. Anders zou een verse start meteen een save aanmaken
  voordat de speler één toets heeft aangeraakt.
- **`AL.debugState` kreeg `vensterRegels`** (de regels van de open
  vensterbladzijde), zodat de rooksmaaktest kan nalezen *wat* de verteller
  antwoordt en niet alleen dát hij iets zegt. Zonder die haak is een hint in de
  browser niet te controleren.
- **Bijvangst in de docs:** `spelontwerp-legacy.md` zei dat `?` in de
  spread-modus "Alberta's kernnotitie herhaalt" — dat kan niet, de invoerbalk
  is er geblokkeerd. `save-en-hints.md` zei "`?` werkt overal" terwijl de
  editor sinds WP F op F1 zit. Allebei rechtgezet.

## QC-resultaat

- `node --test test/test-*.mjs` — **368/368 groen** (353 + 15 nieuw: de
  volledige hint-beslisboom, de drie `gebruikPc`-uitkomsten, de
  doos/kist-woordenschat per kamer, en de breedte van de bladerhint).
- `tools/lint-scene.mjs` — alle elf scènes in orde; `tools/check-assets.mjs` —
  geen drift (9 editor-modellen byte-getrouw).
- `smoke-browser` **38/38** (2 nieuw: `?` in de werkhoek wijst naar het nog niet
  gevonden notitieboek, en telt niet in `hintsTotaal`).
- `smoke-full-playthrough` **97/97** (3 nieuw: na de epiloog komt de
  titelkaart, die overleeft een reload, en de zeven hoofdstukken staan nog op
  afgerond).
- `smoke-walk` **25/25** — het loopwerk van WP 32 is ongemoeid.
