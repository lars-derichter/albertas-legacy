# 47 — De poort aan de doos

## Opdracht

WP 47 uit programma 4 (zie `workflow/46-lineariteit-kickoff.md`, §wortels
en §Bijlage). Uit Lars' speeltest van de gemergde build, verbatim:

> Nu kan ik de doos met het tweede blad vinden voor ik de opdrachten van
> het eerste blad heb opgelost. Als ik dan aan de computer ga zitten,
> krijg ik meteen de opdrachten van het tweede blad. Er moet wel gezorgd
> worden dat het oplossen van de code puzzels lineair gebeurt.

De wortel is in WP 46 verkend en hier opnieuw nagelezen:
`volgendFragment` (`js/logic/world.js`) kijkt alleen naar `ontgrendeld`,
nooit naar `afgerond`, en `_openFragmentDoos` had geen voortgangspoort —
het commentaar zei letterlijk "lichte ruimtelijke progressie, geen harde
sloten". Erger dan gemeld: `ontgrendelFragment` zet `levelActief = n` en
er is géén pad terug, want het pc-menu kent geen levelkeuze (`js/pc/pc.js`
bindt aan `levelActief`). Wie doos 2 opende met hoofdstuk 1 nog open,
kon de puzzels van hoofdstuk 1 nooit meer bereiken.

Beslissing van Lars in de kickoff: de poort komt aan de doos. Blad n
komt er pas uit als hoofdstuk n-1 hersteld is — vinden volgt oplossen.

## Aanpak

- **De poort** staat in `_openFragmentDoos` (`js/logic/world.js`), na de
  `allesGevonden`-tak en vóór de kamercheck:

      var n = this.volgendFragment(toestand);
      if (n === null) → dozen.allesGevonden
      if (n > 1 && !toestand.levels[String(n - 1)].afgerond)
        → { tekst: [dozen.nogDicht(n - 1)], effecten: [] }
      → kamercheck (ontgrendelFragment of dozen.nietHier)

  De weigering laat de staat volledig ongemoeid: geen effect, dus ook
  geen `geluid:doos` — er gaat niets open, dus er klinkt niets.
- **`nogDicht(n)`** is nieuw in `AL.strings.dozen` (`js/logic/strings.js`),
  een sjabloonfunctie naar het patroon van `fragmentGevonden(levelId)`.
  Het argument is het hoofdstuk dat nog openstaat (n-1 gezien vanaf het
  blad), niet het blad in de doos. Verbatim:

  > Je legt je hand op de flap en laat hem weer los. Het blad dat hierin
  > zit, hoort bij een later hoofdstuk, en zo werkte Alberta niet: haar
  > schema loopt op volgorde. Eerst hoofdstuk N herstellen — dat werk
  > ligt op de pc — en dan pas het volgende blad.

  Het nummer alleen, niet de hoofdstuktitel: die titels zijn lang genoeg
  om het venster een bladzijde te kosten, en de speler heeft het nummer
  nodig, niet de naam. De belofte sluit aan op `dozen.onderzoek`, dat al
  zei "als je aan dat hoofdstuk toe bent" — dezelfde regel, nu op het
  moment dat de speler ze probeert.
- **Het notitieboek blijft vrij.** `open` stuurt `_isNotitieboek` in
  `zolder-west` rechtstreeks naar `ontgrendelFragment(toestand, 1)`; die
  weg raakt de poort niet, want hoofdstuk 1 heeft geen voorganger.
- **Commentaar herschreven** op de twee plekken die het oude model
  beloofden: het `FRAGMENT_LOCATIE`-blok (de kaart is de ruimtelijke
  kant van de progressie; de volgorde zit sinds nu in de doos) en de kop
  van `_openFragmentDoos` (de poort, de reden, en de volgorde van de
  checks). Beide citeren `workflow/46-lineariteit-kickoff.md` als de
  bron van de ontwerpwijziging. Ook het kopcommentaar boven
  `AL.strings.dozen` noemt de poort nu.
- **Docs mee:** `spelontwerp-legacy.md` §"De lus per level" stap 1
  ("vinden volgt oplossen") plus een `Beslissing (WP 47)`-blok;
  `save-en-hints.md` §"De zolder-hint" (de drie takken sluiten de dozen
  in: staat er een hoofdstuk open, dan geeft géén doos haar blad).
- **Walkthrough mee:** `deel1-hints.md` stap 1 zegt nu "één blad
  tegelijk", en de "vastgelopen"-alinea kreeg het derde geval — een doos
  die weigert betekent dat er nog een hoofdstuk te herstellen is, en de
  doos zegt zelf welk. Beide PDF's zijn herbouwd met de WP 39-keten
  (pandoc 3.10 + typst 0.15.0 uit een scratch-map, want op deze machine
  staat typst 0.10.0 en dat struikelt over `context`).
- **Tests:** drie bestaande volgorde-tests kregen een `herstelActief(t)`
  tussen de dozen (dat is wat de pc-laag doet als de drie puzzels af
  zijn); zes nieuwe headless tests; een nieuwe smoke-assertie in
  `smoke-browser`; en de sneltoets van `smoke-levels-4-7` werd een
  expliciete testhaak.

## Beslissingen

- **De poort wint van de kamerverwijzing, en dat is een afwijking van de
  kickoff.** Die zei "de poort komt ná de kamercheck, zodat 'verkeerde
  kamer'-verwijzingen blijven kloppen". Nagedacht en anders beslist: wie
  gepoort is, heeft niets aan `dozen.nietHier`. Die tekst stuurt hem naar
  een andere kamer, en de doos daar is even goed dicht — de verwijzing
  klopt dan juist niet meer. De echte volgende zet is "herstel hoofdstuk
  n-1", en dat zegt `nogDicht`. De bedoeling van de kickoff-regel blijft
  overeind waar ze telt: in élk geval waarin de poort openstaat (n = 1,
  of hoofdstuk n-1 afgerond) doet de kamerverwijzing precies wat ze deed.
  Een test bewaakt beide kanten van die keuze
  ("de weigering wint van de kamerverwijzing").
- **De poort staat aan de doos, niet aan de pc.** Ze past in de fictie
  (Alberta's schema loopt op volgorde), houdt één consistent model aan en
  vermijdt half-ontgrendelde toestanden. `gebruikPc` en `hint` zijn dan
  ook niet gewijzigd: hun eerste tak zei al "het hoofdstuk dat je
  opensloeg, is nog niet hersteld", en dat is onder de poort niet minder
  waar maar meer — de speler kán nu niets anders openhebben. De
  bestaande consistentietest (hint ↔ pc) bleef ongewijzigd groen.
- **`nogDicht` krijgt het nummer van het openstaande hoofdstuk, niet dat
  van het blad.** `nogDicht(n - 1)` dus, en niet `nogDicht(n)`. De speler
  moet weten waar hij naartoe moet, en dat is het hoofdstuk dat op de pc
  ligt te wachten.
- **De regressietest is uitputtend, niet steekproefsgewijs.** Een
  toevallige wandeling door de publieke API is hier waardeloos: gemeten
  op 200 runs van 60 stappen raakte ze gemiddeld tot hoofdstuk 0,96 —
  vooruitkomen vergt een keten (herstellen → juiste kamer → `open doos`)
  die je met munten niet gooit. Daarom een breedte-eerst doorloop van
  álle bereikbare staten (kamer × ontgrendeld/afgerond per level ×
  `levelActief`), met na élke actie twee invarianten: geen hoofdstuk
  onder `levelActief` staat nog open, en geen level is ontgrendeld
  terwijl zijn voorganger open staat. De doorloop bewijst zelf dat hij
  het einde haalt (hoofdstuk 7 hersteld) en round-tript elke staat door
  `JSON` — meteen een gratis controle op de serialiseerbaarheid.
- **De sneltoets in `smoke-levels-4-7` is een testhaak geworden, geen
  spelpad.** Die test opende drie dozen zonder één puzzel op te lossen om
  bij level 4 te kunnen beginnen; precies wat de poort nu verbiedt.
  `zetVoortgangKlaar(page, 3)` schrijft de drie hoofdstukken rechtstreeks
  in de levende staat via `window.AL.debugToestand` — de haak die de
  checks daar al lazen. **Geen nieuwe debughaak in `js/engine.js`
  nodig**, en ook geen save-aanroep: `debugToestand` geeft het echte
  object terug, en de engine schrijft vanzelf bij de eerstvolgende echte
  voortgang (`level-start` van level 4). Het commentaar zegt expliciet dat
  dit geen spelpad is en dat een speler dit niet kan.
- **Geen tweede poort-assertie in `smoke-levels-4-7`.** Een eerste versie
  keurde daar "doos 5 blijft dicht" ná de testhaak; dat is fout, want op
  dat moment is het volgende blad 4 (doorgang) en antwoordt de overloop
  terecht met `nietHier`. De poort-assertie hoort waar hoofdstuk 1 open
  staat, en dat is de notitieboek-flow van `smoke-browser`: daar staat ze
  nu, mét de echte weigertekst uit `AL.strings.dozen.nogDicht(1)`.
- **`deel2-oplossingen.pdf` is teruggezet, niet vastgelegd** — dezelfde
  keuze als in WP 44. De bron ervan is niet gewijzigd en de herbouw
  leverde een bestand op dat alleen in `ModDate`, `CreationDate` en de
  document-id verschilt. `deel1-hints.pdf` verandert wél (8 pagina's,
  ongewijzigd aantal); de gewijzigde alinea's zijn op de gerenderde
  bladzijde nagekeken. De font-terugval van WP 39 (Courier New →
  Liberation Mono) staat er nog en is niet door dit pakket veroorzaakt.
- **Het endgame is niet aangeraakt.** `level-af:7` in `js/engine.js` en de
  keten erna zijn ongewijzigd; het bewijs is de volledige playthrough,
  die alle zeven hoofdstukken door de poort speelt en op de epiloog
  eindigt (104/104).

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **431/431 groen** (was 425/425; zes
  nieuwe poort-tests). Vóór de reparatie faalden onder de nieuwe
  volgorde-tests exact drie bestaande tests; die zijn met
  `herstelActief` bijgewerkt en niet verzwakt.
- `tools/lint-scene.mjs` — "Alle scènes in orde."
- `tools/check-assets.mjs` — "Geen drift: alle 9 editor-modellen komen
  byte-getrouw uit de broncode."
- `tools/check-walkthrough.mjs` — "278 citaten en koppen gekeurd; 0
  afwijkingen" (ongewijzigd: de nieuwe walkthrough-zinnen citeren geen
  speltekst).
- `tools/check-docpaden.mjs` — "956 aangehaalde paden gekeurd; 0 dood in
  een contractdocument, 26 in `workflow/` (historisch, geen poort)" (was
  941 paden; de vijftien nieuwe komen uit deze entry).
- Smokes: `smoke-browser` **46/46** (was 44/44; twee nieuwe
  poort-asserties), `smoke-levels-1-3` **36/36** ongewijzigd,
  `smoke-levels-4-7` **53/53** (was 52/52; de setup-check werd er twee),
  `smoke-full-playthrough` **104/104** ongewijzigd, `smoke-walk`
  **38/38** ongewijzigd.
- Gemeten, niet aangenomen: `smoke-browser` drukt de weigering verbatim
  af in zijn PASS-regel ("Je legt je hand op de flap … Eerst hoofdstuk 1
  herstellen — dat werk ligt op de pc — en dan pas het volgende blad")
  en keurt in dezelfde beat dat `modus` `zolder` blijft, `levelActief` 1
  blijft en `levels["2"].ontgrendeld` `false` blijft.
- Regelbreedte van de gewijzigde markdown op 80 tekens gecontroleerd.
