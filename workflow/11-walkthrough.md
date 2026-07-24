# 11 — De walkthrough-gids (WP 10)

## Opdracht

Werkpakket 10: een walkthrough in authentieke 90's-stijl, in twee delen —
deel 1 met stapsgewijze hints zonder antwoorden, deel 2 met de volledige
oplossingen achter een verzegelde pagina — en een Typst/pandoc-pijplijn
die beide als een gefotokopieerd tijdschrift rendert.

## Aanpak

De worker las de volledige speeltekst (`strings.js`), alle zeven
levelbestanden, de sim-broncode en de vier eindescripts, en bouwde beide
delen daar rechtstreeks op: deel 1 herformuleert enkel de spelbrede
hint-stadia 1 en 2 (nooit stadium 3, nooit letterlijke code) in een
opgewekte retro-tijdschriftstem, los van Alberta's eigen droge stem in het
spel zelf. Deel 2 citeert de modeloplossingen letterlijk en herleidt de
sim-walkthrough rechtstreeks uit de vier bestaande testscripts.

## Beslissingen

- **Courier New als lichaamslettertype** (geverifieerd geïnstalleerd),
  een verouderd wit-beige paginatint, een gestempeld VGA-kader op de
  cover, een lopende koptekst met titel en deelnummer.
- **De zegelpagina** tekent een was-zegel en twee gekruiste tapestroken
  met Typst-vormen (geen rasterbeeld nodig) en een erewoord-waarschuwing
  in dezelfde geest als de root-README.
- **Bouwpad**: rechtstreeks `pandoc … --pdf-engine=typst
  --template=zine.typ`, geen tussenliggend `.typ`-bestand — eenvoudiger en
  even betrouwbaar op deze pandoc-versie.

## QC-resultaat

Door de manager zelf uitgevoerd, met bijzondere aandacht voor deel 2 (elk
foutje daar is een spoiler of, erger, een verkeerde spoiler):

- Cover- en zegelpagina bekeken: de toon klopt precies (de zegelpagina's
  "Er is geen echte stippellijn. Dat is het punt." is raak).
- **Level 1's Voorwerp-oplossing rechtstreeks vergeleken met
  `seven-little-goats/src/Voorwerp.java`**: woordelijk identiek,
  inclusief de twee constructors en de commentaarstructuur.
- **Het beste-einde-commandoscript uit deel 2 regel voor regel vergeleken
  met `test-scripts/einde-schaar-en-stenen.txt`**: 18 regels, exact
  identiek.
- `bash walkthrough/tools/bouw-walkthrough.sh` opnieuw gedraaid: beide
  PDF's herbouwen probleemloos (idempotent), 7 en 12 pagina's.
- Bevestigd dat `.gitignore` PDF's niet uitsluit (vereist: dit zijn
  vastgelegde eindproducten, geen build-afval).
- Twee overbodige `.gitkeep`-bestanden in `walkthrough/stijl/` en
  `walkthrough/tools/` opgeruimd (nooit gecommit, dus geen impact op de
  geschiedenis).

Commit: walkthrough-gids, werkpakket 10.
