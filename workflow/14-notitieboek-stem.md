# 14 — Alberta's stem: geen kennis van haar eigen schade (nazorg)

## Opdracht

Lars: de notitieboektekst klopt niet. Het is prima dat grootmoeder Alberta
zich tot een toekomstige lezer richt, maar het notitieboek zelf kan niet
weten dat het beschadigd is — die schade ontstond pas nadat ze verdween,
lang na het schrijven. Ook: een beetje meta-humor mag, maar te veel wordt
neerbuigend. Denk na over de teksten en hints en maak ze beter en
speler-echter.

## Diagnose

Een diegetische inconsistentie: op verschillende plaatsen liet Alberta's
**eigen geschreven stem** (haar notities, de puzzelbriefjes) doorschemeren
dat ze wist dat haar notitieboek later waterschade zou oplopen — iets wat
ze onmogelijk kon weten terwijl ze schreef. De verteller (de zolder-intro,
de kijk-beschrijvingen) mag de schade wél observeren — die kijkt met de
ogen van vandaag naar wat er nu, fysiek, in de doos ligt. Dat onderscheid
stond al correct in `docs/achtergrond.md` ("Het notitieboek is Alberta's
verleden... haar onafgemaakte werk", nooit "haar beschadigde werk"), maar
een aantal geschreven regels volgden dat onderscheid niet.

Vier plekken waar Alberta's eigen stem de schade claimde:

- `js/levels/level1.js` (haar notitie bij Voorwerp): "Een waterstreep vrat
  een verwijzing naar de doos zelf op."
- `js/levels/level0.js` (dezelfde notitie, testinhoud): "een waterstreep...
  opgevreten."
- `js/logic/strings.js`, spread level 1: "maar de waterschade vrat de
  constructor half op... schrijf Geitje uit wat er van mijn notities rest."
- `js/logic/strings.js`, spread level 2: "De signaturen van Speler zijn
  doorgelopen tot pap."

Daarnaast: de epiloog legde zichzelf uit. "Dit is het soort spel dat je in
Programming Fundamentals zelf schrijft. Dat is geen toeval. Dat is het
punt." noemt de echte cursus bij naam en herhaalt dezelfde gedachte drie
keer — precies de neerbuigende meta-humor die Lars aanhaalde, en een
rechtstreekse schending van de eigen toonregel in `achtergrond.md`: "Geen
AI-tells... de emotie zit in de terughoudendheid."

## Aanpak

Elke schade-claim in Alberta's eigen stem herschreven naar wat ze wél kon
weten: haar werk is **onafgemaakt**, niet beschadigd. Ze schetste iets
half, verwisselde zelf koppen, liet iets voor wat het was — allemaal dingen
een auteur over haar eigen werk-in-uitvoering kan zeggen. De observeerbare
schade (waterschade, losse bladen) blijft overal elders gewoon bestaan als
verteller-feit: de reden waarom de code fysiek onleesbaar oogt op de
pagina, alleen niet langer als iets wat Alberta zelf beweert te weten.

De epiloog verloor twee van de drie herhalende zinnen en de expliciete
naam van de cursus; wat overblijft is één droge zin die de speler zelf
laat verbinden, in lijn met "af en toe een knipoog", niet met een uitleg.

## QC-resultaat

Alle wijzigingen zijn proza-only (geen structuur, geen code-modellen
geraakt) — gecontroleerd dat er dus geen regressie kon optreden, en dat
alsnog bevestigd:

- `node --test test/test-*.mjs` — 229 tests, alles groen.
- `node test/smoke-levels-1-3.mjs` — 32/32, level 1 en 2 nog steeds
  oplosbaar (de gewijzigde tekst zit enkel in commentaar/notitie, niet in
  de modeloplossingen of de checker-configuratie).
- `node test/smoke-browser.mjs` — 19/19, de intro-spread tekent nog.
- `node tools/check-assets.mjs` — geen drift: de Java-modellen zelf zijn
  ongewijzigd.

Commit: Alberta's stem, nazorg op de notitieboektekst.
