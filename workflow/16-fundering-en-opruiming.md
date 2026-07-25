# 16 — Fundering en opruiming (opwaardering WP A)

Het eerste werkpakket met code van het opwaarderingsprogramma. Doel: het
beeldkader klopt, de zichtbare fouten zijn weg, de testsuite is groen en het
bouwpuin is opgeruimd. Alles hierna wordt getekend tegen dit kader, dus het
moest eerst.

## Opdracht

Uit het goedgekeurde plan (`workflow/15-opwaardering-kickoff.md`, Bijlage B,
§WP A): beeldkader op 4:3 met twee gehele schaalfactoren plus een
uitschakelbare CRT-laag, de z-orde van titelkaart en oordeelkaart, de
twee-koloms bladspiegel van het notitieboek, de codering van de Java-prijs, en
het verwijderen van verouderd bouwcommentaar, dode string-sleutels en het
hardgecodeerde macOS-pad in de rooksmaaktesten.

## Aanpak

Per punt eerst reproduceren, dan pas repareren. Dat loonde: drie van de acht
punten bleken iets anders te zijn dan het plan dacht (zie Beslissingen).

Het beeldkader is nagemeten in een echte browser op vier venstermaten, niet
beredeneerd. De contrastfouten zijn met screenshots voor en na vergeleken. De
coderingsfout is nagebouwd door bewust met `-encoding windows-1252` te
compileren, om te zien wat een student op een Windows-machine krijgt.

## Beslissingen

### Het beeldkader: twee gehele factoren, niet één

`berekenSchaal()` zette één factor, waardoor 320×200 als vierkante pixels op
16:10 stond. VGA mode 13h werd op 4:3 getoond: de pixels waren 20 % hoger dan
breed. Nu twee factoren, `--schaal-x` en `--schaal-y`.

Exact 4:3 vraagt de verhouding 5:6 en dus 1600×1200 — dat past lang niet
altijd. Het algoritme zoekt daarom onder alle passende gehele paren het paar
met de kleinste afwijking van 4:3; bij gelijke afwijking liever te breed dan te
smal (te smal rekt alles uit en oogt kapot, te breed leest hooguit als
breedbeeld), en dan pas het grootste beeld. Gemeten:

| Venster | Factoren | Beeld | Verhouding |
|---|---|---|---|
| 1920 × 1200 | 5 × 6 | 1600 × 1200 | 1,333 (exact) |
| 1920 × 1080 | 4 × 5 | 1280 × 1000 | 1,280 |
| 1280 × 800 | 3 × 4 | 960 × 800 | 1,200 |
| 800 × 600 | 2 × 2 | 640 × 400 | 1,600 |

De laatste rij is de bewuste terugval: bij zo'n klein venster is geen enkel
geheel paar dicht bij 4:3, en dan wint "te breed" van "te smal".

Twee gehele factoren, geen gebroken verticale rek. Dat laatste zou rijen
ongelijk hoog maken en zichtbaar gaan glinsteren.

### De CRT-laag hangt aan het beeld, niet aan het venster

Scanlines en vignet staan op `#beeld::after`, een nieuwe wrapper om het canvas,
zodat de laag precies het beeld dekt en niet de zwarte rand eromheen. De
spatiëring van de scanlines volgt `--schaal-y`: één donkere lijn per logische
pixelrij. Met een vaste spatiëring zou het patroon bij een andere schaal niet
meer op de pixels vallen.

Uit te zetten met `crt uit`, hetzelfde patroon als `geluid uit`: de logica kent
alleen de voorkeur, de engine zet het beeld om. Er is dus één veld bijgekomen
in de staat (`crt`). De migratie in `world.js` is additief, dus een bestaande
save zonder dat veld krijgt gewoon de default.

### Afwijking van het plan: het was geen z-orde-fout

Het plan noemde de onleesbare titel een z-orde-fout — de lichtstraal die over
de tekst getekend zou worden. **Dat klopte niet.** De tekst stond altijd al
bovenop; `tekenTitelKaart` tekent de straal op regel drie en de titel op regel
zeven.

Het is een contrastfout. De titel wordt in kleur 34 gezet, en 34 is exact de
hooglichtkleur van de lichtstraal zelf (de avond-ramp uit `art-stijlgids.md`).
Gelijke kleur op gelijke kleur: waar de straal passeert, verdwijnt de letter.
Op de oordeelkaart is het precies omgekeerd — inkt (41) op een achtergrond die
aan de randen donker is (28), dus donker op donker.

Twee verschillende oplossingen, allebei ook beter voor het beeld:

- **Titelkaart:** een donkere plaat achter het logokader, zodat de straal
  eráchter door loopt. Dat is bovendien wat de stijlgids vraagt — "het logo
  eroverheen".
- **Eindkaart:** de kop op een papieren band over de volle breedte, met een
  dunne lijn boven en onder. Het contrast is nu gegarandeerd, ongeacht wat
  eronder ligt, en het leest meteen als het titelvlak van een eindkaart.

Was dit als z-orde "opgelost" — de tekenvolgorde omgedraaid — dan was er niets
veranderd, want de volgorde was al goed.

### Afwijking van het plan: de Java-codering wordt niet in de bron opgelost

Het plan zei dat `Main.java` `System.out` naar UTF-8 zou omzetten met een
`PrintStream`. Dat is om twee redenen niet gedaan.

Ten eerste bevat `PrintStream` het woord `Stream`, en de cursusgrens-poort is
letterlijk `grep -nE 'switch|enum|->|Stream|\bvar '`. De prijs die het hele
spel uitreikt zou zijn eigen poort laten struikelen.

Ten tweede, en dat is de echte reden: **het lost maar de helft op.** De
uitvoerkant is één probleem, de compileerkant een tweede en groter. Nagebouwd:

```sh
javac -encoding windows-1252 -d out src/*.java
```

geeft `geÃ«rfd` en `â€"` — de mojibake zit dan al in de `.class`-bestanden en
geen enkele `setOut` haalt die er nog uit. Dat is precies wat een `javac`
zonder `-encoding` op een Belgische Windows doet.

De juiste oplossing is dus het bouw- en draai-recept, niet de bron:

```sh
javac -encoding UTF-8 -d out src/*.java
java -Dstdout.encoding=UTF-8 -cp out Main
```

Dat staat nu in `seven-little-goats/README.md` met uitleg, in
`test/test-sim-cross-check.mjs` (met commentaar waaróm), in `CLAUDE.md` bij de
poort en in `docs/spelontwerp-seven-little-goats.md`. `Main.java` blijft
onaangeroerd en cursus-gebonden.

Hiermee is `test-sim-cross-check` groen: de test vergelijkt weer inhoud in
plaats van coderingsgedrag van de omgeving.

### Afwijking van het plan: het "placeholder-level" is een testfixture

Het plan wilde het placeholder-level 1 uit `js/logic/levels.js` verwijderen als
achtergebleven steigerwerk. Dat is het niet. `test/helpers.mjs` laadt alleen
`js/logic/levels.js` en níét `js/levels/level1.js`, dus zonder die registratie
heeft `AL.world.nieuw()` geen enkel level om een verse staat uit af te leiden
en vallen `test-levels.mjs` en `test-world.mjs` om. In de browser is het
onzichtbaar, want `index.html` laadt `js/levels/level1.js` erna en die
overschrijft de registratie met de echte puzzels.

Het blijft dus staan; wat weg moest was het misleidende commentaar ("WP van
level 1 vervangt dit"), dat nu uitlegt wat het werkelijk is en waarom het niet
zomaar verplaatst mag worden.

Om dezelfde reden zijn de hints onder `puzzelHints["l1-editor"]` blijven staan:
die horen bij dat framework-zaad.

### De bladspiegel is nu twee kolommen — en dat is een budget

Het sjabloon tekent een rugschaduw op x 157–162, maar `tekenInhoud` zette de
tekst als één kolom van 272 px breed, dwars daar doorheen. Nu twee kolommen van
17 tekens: eerst de linkerbladzijde vol, dan de rechter. De weekregel staat
onderaan rechts, de bladwijzer linksonder, en de bladerhint is naar binnen
gehaald zodat hij niet meer op de donkere papierrand valt.

Daarmee is er een hard budget ontstaan: **17 tekens × 12 regels × 2 = 24
gewrapte regels per pagina.** Nagemeten over alle acht de spreads: de langste
pagina is `l4` pagina 1 met 22 regels. Er is dus twee regels speling, en WP C
(dat alle spreads herschrijft) moet daarop letten. Een pagina die eroverheen
gaat wordt afgekapt. Dat staat nu ook als waarschuwing in de kop van
`js/logic/strings.js`.

### Wat het opruimen opleverde

Verouderd bouwcommentaar dat iets beweerde wat al lang niet meer waar was, is
weg uit `index.html`, `js/engine.js`, `js/logic/strings.js`, `js/logic/world.js`
en `js/scenes/scene-spread-template.js` — zinnen als "WP 5 vult de editor in"
en "de volledige level-prose komt in WP 6". Verwijzingen die historisch iets
verklaren (waaróm `telWapens` bestaat, bijvoorbeeld) zijn blijven staan.

Vier string-sleutels bleken echt nergens gebruikt en zijn verwijderd:
`dozen.leeg`, `pc.puzzelAlAf`, `hintPrefix` en `endgame.naarOordeel`.

De vijf rooksmaaktesten droegen een absoluut pad van de machine van de auteur
(`/private/tmp/claude-501/-Users-lars-…`), waardoor ze bij niemand anders
liepen. Nu `process.env.AL_SCRATCH` met `test-results/` als default — die map
staat al in `.gitignore`.

## QC-resultaat

Alle poorten van WP A gehaald.

- `node --test test/test-*.mjs` — **225 tests, 225 groen, 0 rood.** Was
  224/225; `test-sim-cross-check` is groen door de coderingsvlaggen.
- `npm run lint:scene` — alle scènes in orde.
- `node tools/check-assets.mjs` — geen drift, alle 9 editor-modellen
  byte-getrouw uit de broncode.
- `javac -encoding UTF-8 -d out src/*.java` — exit 0, geen waarschuwingen, 12
  klassen. `grep -nE 'switch|enum|->|Stream|\bvar '` leeg.
- Rooksmaaktesten (allemaal via `file://`, dus de dubbelklik-regel is meteen
  mee gecontroleerd): `smoke-browser` 19/19, `smoke-pc` 21/21, `smoke-sim`
  13/13, `smoke-levels-1-3` 32/32, `smoke-levels-4-7` 48/48,
  `smoke-full-playthrough` 94/94.
- Beeldkader nagemeten op vier venstermaten (tabel hierboven).
- Screenshots voor en na van titelkaart, oordeelkaart en de intro-spread: de
  titel is volledig leesbaar, de kop van de oordeelkaart staat op zijn band, en
  de spread-tekst blijft binnen de twee bladzijden.

Niet gehaald, en waarom:

- **`smoke-touch` kon hier niet draaien.** Die test gebruikt WebKit, en in deze
  container staat alleen Chromium onder `/opt/pw-browsers`. Het is dus een
  beperking van de omgeving, geen regressie: het bestand is inhoudelijk alleen
  op het `SCRATCH`-pad aangepast, net als de vier andere.

Twee dingen bewust laten liggen, met een adres:

- **De vlekken van het sjabloon liggen onder de tekst.** De koffievlek
  linksonder en de waterschade rechtsboven staan op vaste plekken in het
  sjabloon en overlappen nu zichtbaar met de kolommen. Dat hoort bij WP G, dat
  per level een eigen papierachtergrond maakt met de beschadiging *waar de
  puzzel zit* — dan lost het zichzelf op. Het eerder oplossen zou dubbel werk
  zijn.
- **De lichtwiggen in `zolder-midden` en `zolder-oost`** blijven voorlopig
  hardgerande, volvlakke veelhoeken. Ze fatsoenlijk maken vraagt de
  gradiënt- en dither-ops uit WP B; ze nu met de huidige middelen bijwerken
  zou in WP E toch weer overgetekend worden.

Omgevingsnotitie voor een volgende sessie: `playwright@1.56.0` is hier lokaal
geïnstalleerd met `npm i --no-save`, omdat de versie uit `package.json` een
Chromium-build verwacht die in deze container niet staat en niet te downloaden
is. `package.json` is bewust niet gewijzigd.
