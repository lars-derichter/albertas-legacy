# 13 — iOS: geen toetsenbord, geen pijltjestoetsen (nazorg)

## Opdracht

Na de deploy op GitHub Pages meldde Lars: op iOS is er geen manier om het
systeemtoetsenbord te tonen, dus geen manier om te spelen. Vraag: hoe dit
oplossen?

## Diagnose

De gesimuleerde pc (`js/pc/`) gebruikt al een echte `<textarea>`/`<input>`
(WP 5) — een tik daar opent het toetsenbord vanzelf, gratis DOM-gedrag. Het
probleem zit in de zolder: de getypte parser-commandoregel bestaat volledig
uit fysieke `keydown`-events op `window` (`js/input.js`), zonder één echt
tekstveld. Op een toestel zonder fysiek toetsenbord is er dus niets om op te
tikken — geen toetsenbord, en om dezelfde reden ook geen manier om te lopen
(de pijltjestoetsen zijn evenmin vervangen door iets aanraakbaars). De hele
zolder was op een telefoon of tablet onspeelbaar, niet enkel het typen.

## Aanpak

Een nieuwe, feature-detected module `js/touch.js`, enkel aangemaakt op een
toestel met aanraakscherm:

- **Een echt `<input>`-veld** (de mobiele commandobalk) dat bij een tik het
  systeemtoetsenbord opent en de tekst bij Enter/"ga" doorstuurt naar
  dezelfde `onSubmit`/`onAdvance`-haken als het fysieke toetsenbord.
- **Vier D-pad-knoppen** die via twee nieuwe publieke haken op `input.js`
  (`pijlAan`/`pijlUit`) dezelfde pijl-stack sturen als de pijltjestoetsen.
- **Een tik op het canvas** die de nieuw publiek gemaakte `AL.engine.advance`
  aanroept, zodat berichten, de titelkaart, spreads en het oordeel ook zonder
  toetsenbord doorbladeren.

Zichtbaar enkel in de zoldermodus; op een toestel met muis en toetsenbord
verandert er niets (de balk wordt daar niet eens aangemaakt).

## Beslissingen

- Feature-detectie (`ontouchstart`/`maxTouchPoints`) in plaats van een
  schakelaar: geen extra UI voor spelers die hem niet nodig hebben.
- Een zichtbare "ga"-knop naast het invoerveld, niet enkel vertrouwen op de
  Enter/Go-toets van het virtuele toetsenbord — die is niet op elk mobiel
  platform even betrouwbaar.
- Canvas-tik-om-door-te-bladeren is bewust ook op desktop actief (muisklik):
  onschadelijke extra, geen aparte code-pad nodig.

## QC-resultaat

Getest tegen **WebKit** (de motor achter iOS Safari, niet enkel Chromium se
mobiele emulatie), met `hasTouch: true`, in een nieuwe
`test/smoke-touch.mjs`:

- Titelkaart toont geen aanraakbalk; een tik op het canvas bladert door tot
  de zolder; daar verschijnt de balk.
- Het D-pad (west ingedrukt houden via echte `pointerdown`/`pointerup`)
  verplaatst de actor.
- Een tik op het mobiele invoerveld geeft het `document.activeElement` —
  de correcte, headless-verifieerbare stand-in voor "het systeemtoetsenbord
  zou nu verschijnen" (een browser kan het OS-toetsenbord zelf niet
  screenshotten).
- Typen + "ga" tikken opent een berichtvenster ("kijk"); het veld leegt zich
  nadien.
- Op een gewoon (niet-aanraak-)toestel bestaat `.touch-ui` niet eens in de
  DOM — geen visuele of functionele verandering voor bureaubladspelers.

9/9 PASS. Volledige regressie herhaald: `node --test test/test-*.mjs`
(229/229), `smoke-browser` (19/19), `smoke-pc` (21/21), `smoke-levels-1-3`
(32/32), `smoke-levels-4-7` (48/48), `smoke-sim` (13/13),
`smoke-full-playthrough` (94/94) — geen regressies. `tools/lint-scene.mjs`
en `tools/check-assets.mjs` blijven schoon (ongewijzigde bestanden).

`docs/engine-architectuur.md` bijgewerkt: `js/touch.js` in de laadvolgorde
en de bestandskaart, plus een nieuwe paragraaf die uitlegt waarom de zolder
(in tegenstelling tot de pc) een eigen invoerbalk nodig had.

Commit: aanraakscherm-ondersteuning (iOS-fix).
