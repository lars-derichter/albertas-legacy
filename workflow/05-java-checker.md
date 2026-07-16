# 05 — De Java-checker (WP 4)

## Opdracht

Werkpakket 4: de checker die in de browser beoordeelt of de Java van de
speler klopt — het riskantste onderdeel van het project. Een valse
afwijzing van geldige code is de ergste faalmodus. Drie modules
(`tokenizer.js`, `asserts.js`, `javacsim.js`) plus een testcorpus met
modeloplossingen, geldige varianten en typische studentfouten.

## Aanpak

De worker bouwde een strings/commentaar-bewuste tokenizer die op elk token
regel en kolom bewaart, een bibliotheek van lokale structurele asserties,
en een gesimuleerde javac-laag in authentiek diagnoseformaat
(`Bestand.java:R: fout: …` met caret en een Vlaamse uitleg erbij). Het
corpus bevat 8 fragmenten (65 cases): elk fragment de letterlijke
modeloplossing uit `seven-little-goats/src/`, drie geldige varianten en
vier à vijf klassieke fouten met de bedoelde melding.

## Beslissingen

- Asserties geven een stabiele `meldingKey` terug; de vriendelijke tekst
  blijft in `strings.js` (prose nooit inline in logica).
- De puntkomma- en returntype-heuristieken zijn bewust conservatief:
  liever een gemiste vangst (laag 2 vangt ze dan) dan een vals alarm.
- `aanroepKeten` staat gaten in de keten toe (de modeloplossing splitst de
  keten rond een null-guard); `contigue: true` dwingt aaneensluiting af
  waar een level dat wil.
- De patroonkaart-classifier `lusRomp` is bewust niet gebouwd (hoog risico
  op vals-negatieven); het level-5-werkpakket stelt de controle samen uit
  bestaande lus-asserties. Het checker-contract is bijgewerkt.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `node --test test/test-*.mjs` — 93 tests, alles groen (59 checker-tests,
  geen regressies elders; ook de Playwright-smoke bleef groen na de
  index.html-wijziging).
- Kritieke gate: alle twaalf echte bronbestanden van Seven Little Goats
  (inclusief Spel.java, 26 kB) komen zonder één diagnose door javacsim —
  nul vals-positieven, als test vastgelegd.
- Contract-sync: de assertie-tabel in checker-contract.md verwijst nu naar
  de gezaghebbende namenlijst in asserts.js en documenteert de bewust
  niet-gebouwde `lusRomp`-classifier.

Commit: Java-checker, werkpakket 4.
