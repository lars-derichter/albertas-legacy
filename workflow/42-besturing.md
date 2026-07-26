# 42 — Besturing: geen spookrichtingen

## Opdracht

WP 42 uit de fixronde (zie `workflow/41-fixronde-kickoff.md`). Uit Lars'
speeltest op iOS, verbatim:

> The walking has become more difficult. If you keep pushing the arrow
> keys (the natural thing to do), the character keeps walking in that
> direction even after you push another arrow key.

De verkenning van WP 41 wees twee onafhankelijke wortels aan: een
verloren keyup laat een richting in de pijl-stack staan die niemand meer
ingedrukt houdt, en op een aanraakscherm zorgt impliciete pointer capture
ervoor dat een vinger die van de ene D-pad-knop naar de andere schuift
nooit een nieuwe knop bereikt. Een Opus 5-worker voerde uit; de manager
controleert en commit.

## Aanpak

- **`AL.input.reset()`** (`js/input.js`): leegt de pijl-stack. Gekoppeld
  aan `blur` op het venster en aan `visibilitychange` zodra
  `document.hidden` waar is — de enige twee momenten waarop nog vast te
  stellen is dat een keyup nooit meer komt.
- **`stopBesturing()`** (`js/engine.js`, naast `syncBlokkeer`): roept
  `reset()` aan en zet `loopt` op false. Aangeroepen in `startTitel`,
  `opADeSpread`, `opADePc`, `startSim`, `toonOordeel` en `toonEpiloog` —
  elke moduswissel weg van de vrije zolder.
- **Her-indruk wint** (`drukPijl`): een richting die al in de stack staat,
  wordt verwijderd en opnieuw bovenop gelegd in plaats van genegeerd.
  Zonder die regel verliest de speler van zijn eigen spook: opnieuw west
  drukken bracht hem niet vooraan zolang de oude west-ingang er nog stond.
- **Het D-pad laat de capture los** (`js/touch.js`):
  `b.releasePointerCapture(e.pointerId)` in een `try`, plus een
  `pointerenter`-luisteraar die alleen aanslaat bij `buttons > 0`. Samen
  maken die twee het schuiven van ◀ naar ▶ tot een gewone
  leave/enter-wissel. `pointerup`, `pointercancel` en `pointerleave`
  blijven zoals ze waren.
- **Loslaat-zekering bij het verbergen van de balk**: de
  zichtbaarheidspoll (200 ms) onthoudt zijn vorige stand en roept
  `AL.input.reset()` aan op de flank waarop de balk verdwijnt. Een knop
  die weg is, levert geen `pointerup` meer.
- **`test/test-input.mjs`** (nieuw, 14 keuringen): arbitrage, loslaten
  middenuit de stack, her-indruk, `reset()`, en — met een window/document-
  stub — de koppeling van `blur`/`visibilitychange`, de keyup boven een
  tekstveld en autorepeat. `js/input.js` kreeg daarvoor de
  `module.exports` die de andere browsermodules al hadden.
- **`test/smoke-walk.mjs` §8 en §9** (13 keuringen erbij): twee pijlen
  tegelijk in de echte browser, het spook na een `blur`-event zónder
  keyup, en een vinger die over het D-pad schuift.
- **`docs/engine-architectuur.md`** kreeg §"De besturing: de pijl-stack en
  de spookrichting" met de drie regels en het capture-detail; de
  overname-tabel en de aanraakschermparagraaf verwijzen ernaar.

## Beslissingen

- **Vergeten, niet onthouden, bij een moduswissel.** De alternatieve
  aanpak — de stack bewaren en na het sluiten van het notitieboek weer
  laten gelden — is bewust niet gekozen. De pijl wordt boven de
  tekstvelden van de pc-overlay losgelaten en dan is elke keyup verdacht;
  wie wil lopen, drukt opnieuw. Dat is één toetsaanslag tegenover een
  speler die uit zichzelf wegloopt.
- **Niet gekoppeld aan `AL.input.blokkeer`.** Dat was de kortste route
  (blokkeer flipt bij élk venster), maar ook de verkeerde: een
  kamerbeschrijving is een venster, en dan zou een speler die met de pijl
  ingedrukt een kamer binnenwandelt na het wegklikken stilstaan. Alleen
  echte moduswissels resetten.
- **De `keyup` houdt géén tekstveld-uitzondering.** De asymmetrie met
  `keydown` is bewust en staat nu in het commentaar én in de doc: een
  geslikte keyup is precies hoe een spook ontstaat.
- **`pointerenter` met `buttons > 0`** in plaats van een eigen
  "is-er-een-vinger-actief"-vlag: `buttons` is wat de browser zelf
  bijhoudt, en scheidt een schuivende vinger van een muis die alleen maar
  over de knop zweeft.
- **De vingerschuif wordt met CDP getikt, niet met synthetische events.**
  Playwright's aanraak-API kent alleen `tap()`. Een `PointerEvent` uit
  `page.evaluate` zou wél door de handlers lopen, maar krijgt geen
  impliciete capture — precies het gedrag dat bewezen moet worden.
  `Input.dispatchTouchEvent` over een CDP-sessie levert echte
  aanraakevents; de reden staat in de test.
- **Negatieve controle vooraf gemeten**, niet aangenomen. Met alleen de
  export erin en de twee gedragswijzigingen teruggedraaid zakken exact de
  vier keuringen die ze bewaken (her-indruk, `blur`-koppeling,
  spook-na-blur, `visibilitychange`); met het oude `js/touch.js` schuift
  de vinger van ◀ naar ▶ en loopt de speler door naar het westen
  (x 67 → 52 in plaats van 67 → 79).
- **Wat dit pakket níét oplost:** of het op een échte iPhone weg is, kan
  alleen Lars vaststellen. `smoke-touch.mjs` (WebKit) draaide opnieuw niet
  — die motor staat niet in deze container; de aanraakproef hierboven
  draait daarom in Chromium met `hasTouch`.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **414/414 groen** (400 + 14 nieuwe
  input-keuringen).
- `tools/lint-scene.mjs` — alle scènes in orde.
- `smoke-walk` — **38/38** (was 25/25; 13 nieuwe keuringen in §8 en §9).
  De richtingwissel is gemeten en niet alleen gelezen: met beide pijlen
  ingedrukt x 94 → 79 → 92, na `blur` x 79 en stil, en op het D-pad
  x 67 → 79 na de schuif.
- `smoke-browser` **41/41**, `smoke-geluid` **17/17**,
  `smoke-full-playthrough` **97/97**, `smoke-pc` **32/32**,
  `smoke-sim` **13/13** — allemaal ongewijzigd.
- Wrap op 80 tekens gecontroleerd voor de nieuwe doc-sectie en deze entry.
