# 41 — Fixronde na de speeltest: kickoff

Lars speelde de opgewaardeerde build (t/m WP 40) op iOS en meldde vier
problemen plus één ontwerpvraag. Deze entry legt de feedback, de
beslissingen en het goedgekeurde plan vast; de pakketten 42-45 voeren
uit.

## De feedback, verbatim

> I really like the new, improved look.
> Still no audible sound (ios). The walking has become more difficult.
> If you keep pushing the arrow keys (the natural thing to do), the
> character keeps walking in that direction even after you push another
> arrow key.
> It is strange that after reading the notebook you are automatically
> transported to the computer.
> The writing is still too 'meta', the notebook and the comments still
> speak to a reader instead of being Alberta's private notes. For the
> code comments that looks stupid: delete the header: 'Alberta's
> notitie' everywhere.
> For the notebook, either the backstory needs a little more fleshing
> out: Alberta knew something would happen to her and knew she would
> not be able to finish the game, and this should become clear from the
> opening and should color the notes in the notebook, or she did not
> know that she would disappear and then the notes should read as
> private notes to herself. In either case they should read more like
> the notes of a competent programmer and less like the notes of a
> teacher. What do you think?

## Vragen en antwoorden

De manager beval optie (a) aan — Alberta wist het — met drie redenen:
de spelmechaniek (een boek dat taken uitdeelt) is alleen zinvol als ze
vóór een lezer schreef; een voorgevoel verdiept het mysterie zonder de
regel "nooit een oorzaak" te breken; en een bewuste overdracht dwingt
vanzelf het register van een competente programmeur af. Lars koos
(2026-07-26, verbatim de labels): **"She knew"** en voor de
codenotities **"Terse note + '— A.'"** — kop weg, notitie eindigt met
een klein "— A.".

## De wortels (verkenning, geverifieerd)

1. **Lopen plakt.** De pijl-stack in js/input.js arbitreert correct
   (laatst gedrukt wint), maar een richting waarvan de keyup verloren
   gaat blijft als spook staan: er is geen blur- of
   visibilitychange-reset. Op touch is het structureel: het D-pad zet
   de richting op pointerdown, en implicit pointer capture bij touch
   betekent dat een vinger die van de ene knop naar de andere schuift
   nooit een nieuwe pointerdown aflevert — de oude richting loopt
   door (js/touch.js:130-153). Lars test op iOS.
2. **iOS stil.** De unlock hangt aan pointerdown/touchstart/keydown;
   iOS rekent voor audio op touchend/click. Er speelt geen stille
   primer in het gebaar, er is geen re-resume bij terugkeer naar de
   tab, en niets omzeilt de belschakelaar (geen audio-element in
   index.html) — met de ringer op stil is WebAudio op iPhone sowieso
   onhoorbaar.
3. **Teleport.** spreadVerder() (js/engine.js:484-491) verplaatst de
   speler naar zolder-oost terwijl de chrome "spatie: terug" belooft.
   Drie smokes pinnen dat gedrag.
4. **Meta-stem.** De Java-broncode is sinds WP 30 schoon (nul
   lezer-gerichte comments, gegrept), maar de elf stub-notities in
   js/levels/ dragen de kop "// Alberta's notitie —" met
   school-imperatieven, en maakSpread hardcodeert "Voor jou die dit
   later leest:" plus "Dit zou je moeten kunnen na week N van de
   cursus." op alle veertien bladzijden — sjabloon én cursus-meta in
   haar hand van 1993. docs/achtergrond.md kent geen
   voorgevoel-standpunt; dat doc moet de nieuwe beslissing dragen.

## Beslissingen

- **Het voorgevoel verklaart niets.** "Ze wist dat ze het niet zou
  afmaken" is een gegeven zonder oorzaak; de richtlijn "nooit een
  oorzaak noemen" uit achtergrond.md blijft onverkort gelden en wordt
  in WP 45 samen met het nieuwe beslissingsblok herschreven.
- **De overdracht wordt één keer expliciet** (hoofdstuk 1, in haar
  woorden) en daarna impliciet — geen sjabloonzin op elke bladzijde.
- **De weekregel wordt haar eigen schema** — "van de cursus" is
  meta-lekkage uit onze wereld in haar notitieboek.
- Volgorde: 42 (besturing), 43 (iOS-audio), 44 (spread-flow), 45 (de
  stem, met tweede checker-agent). Zelfde werkwijze als het programma.

## QC-resultaat

Docs only. Wrap op 80 tekens gecontroleerd; `node --test test/test-*.mjs`
ongewijzigd 400/400 groen vóór en na.

## Bijlage — het goedgekeurde plan

Het plan zoals goedgekeurd door Lars op 2026-07-26 staat integraal in de
planbestand-tekst van deze sessie en is hieronder samengevat per pakket;
bij tegenspraak wint deze entry.

- **WP 42 — Besturing:** reset() van de pijl-stack op blur en
  visibilitychange en bij moduswissels; drukPijl herplaatst een al
  aanwezige richting naar de top; D-pad laat pointer capture los zodat
  vinger-schuiven werkt; loslaat-zekering bij het verbergen van de
  balk. Tests: twee-pijlen-arbitrage, spook-na-blur, D-pad-schuif.
- **WP 43 — iOS-audio:** unlock ook op touchend/pointerup/click
  (capture); stille 1-sample primer-buffer in het gebaar; re-resume op
  visibilitychange; stil playsinline-audio-element (data-URI) na het
  eerste gebaar tegen de belschakelaar, gekoppeld aan "geluid uit".
  Entry benoemt expliciet dat de echte iPhone-luistertest bij Lars
  ligt.
- **WP 44 — Spread-flow:** spreadVerder() sluit het boek waar de
  speler staat (geen teleport); hint-systeem wijst de weg al; docs en
  walkthrough mee; vier smokes krijgen echte loopstappen naar de
  werkhoek.
- **WP 45 — De stem:** achtergrond.md draagt het voorgevoel; de
  opening krijgt het in het koude register; maakSpread verliest de
  sjabloonzinnen; briefA's worden ontwerpnotities van een programmeur,
  briefB's overdrachtstaken, "— A." waar het past; de elf
  stub-notities verliezen hun kop en imperatief-register; alle
  verwijzingen naar de oude kop bijgewerkt; walkthrough + PDF's mee.
  Bladbudget en citaat-linten bewaken alles.
