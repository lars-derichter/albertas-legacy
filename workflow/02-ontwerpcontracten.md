# 02 — De ontwerpcontracten (WP 1)

## Opdracht

Werkpakket 1 uit het plan: alle ontwerpcontracten in `docs/` schrijven,
de documenten waar elk later werkpakket tegen bouwt. Negen bestanden:
achtergrond, roberta-williams, levels-en-scharnieren, spelontwerp-legacy,
spelontwerp-seven-little-goats, engine-architectuur, checker-contract,
art-stijlgids en save-en-hints. Eén Opus-worker kreeg de opdracht, met als
verplichte lectuur het goedgekeurde plan, de cursusleidraad (de zeven
scharnieren), de voorganger-broncode en de docs-stijl van de remake-90s.

## Aanpak

De worker las eerst alle bronnen en schreef daarna de negen documenten in
één beweging, met expliciete consistentie-eisen: de leveltabel letterlijk
uit het plan, identieke klassenamen in drie documenten, en een effect-tag-
woordenlijst in engine-architectuur.md die alles dekt wat het spelontwerp
nodig heeft. Open keuzes markeerde hij met een "> Beslissing:"-blok, acht
in totaal, zodat de manager ze kon nalezen.

## Beslissingen

Door de worker gemarkeerd en door de manager aanvaard:

- De verdwijning van Alberta blijft volledig onverklaard.
- De speler krijgt geen naam en geen geslacht.
- Drie verplichte zolderscènes (`zolder-west`, `zolder-oost`, spread-
  template) plus één optionele.
- De gesimuleerde pc is een DOM-overlay bovenop het canvas, geen
  canvas-getekende tekst (tekstinvoer, klembord, toegankelijkheid).
- Sprites krijgen elk een eigen 16-kleuren-subpalet binnen het 64-kleuren-
  palet.
- Roberta Williams wordt één keer bij naam genoemd, in de epiloog.
- Alberta's oordeel hangt aan het totale hint-gebruik, niet aan fouten of
  tijd — vier tiers, speels en niet-bestraffend.
- Extra tegenstander in Seven Little Goats: een **jachthond** aan de molen
  (optioneel gevecht, bewaakt een genezing). Hij spiegelt het zwijn uit
  spel 1 en geeft het Gevecht-systeem een tweede, laagdrempelige toepassing.

## QC-resultaat

Gecontroleerd: bestanden aanwezig, 80 tekens op tekenniveau, leveltabel
tegen het plan, klassenamen kruislings, effect-tags tegen het spelontwerp,
feitelijke juistheid van roberta-williams.md (Mystery House 1980, King's
Quest 1984, Phantasmagoria 1995 — klopt).

Drie correcties door de manager:

1. **"Na week X" was verkeerd geïnterpreteerd** als een spelinterne schaal.
   Het zijn de echte cursusweken (drie lessen per week: les 2–3 = week 1,
   les 4 = week 2, … les 17–18 = week 6). Het Beslissing-blok in
   levels-en-scharnieren.md is herschreven; de tabel heet nu "Na
   cursusweek".
2. Namespace-slip in engine-architectuur.md: `RRH.palet.lengte` →
   `AL.palet.KLEUREN.length`.
3. Tweemaal "de geitenhuisje" → "het geitenhuisje".

Commit: ontwerpcontracten, werkpakket 1.
