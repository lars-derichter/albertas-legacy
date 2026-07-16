# 03 — Seven Little Goats, het Java-spel (WP 2)

## Opdracht

Werkpakket 2: het volledige Java-spel _Seven Little Goats_ bouwen in
`seven-little-goats/` — de hoofdprijs. Bindend contract:
`docs/spelontwerp-seven-little-goats.md`. Extra eis uit
`docs/levels-en-scharnieren.md`: de scharnier-ankermethoden moeten bestaan
met exact die namen en schoolvoorbeelden van hun scharnier zijn, want de
levels van het meta-spel knippen er later hun puzzelfragmenten uit.

## Aanpak

De worker las beide contracten en de volledige broncode van de voorganger
(_Revenge of Red Riding Hood_), en bouwde het spel als broertje daarvan:
zelfde klassenstructuur, zelfde commentaarstijl, zelfde Gevecht-mechaniek,
zelfde Test-klassen-stijl (gewone `main`, `Scanner` over een string).
Twaalf klassen, een eigen README en vier piped-input-scripts die elk een
einde bereiken.

## Beslissingen

Twee afwijkingen van het ontwerpcontract, beide aanvaard en teruggeschreven
naar het contract (documenten en code mogen niet uiteenlopen):

1. **Geen autogevecht bij het betreden van een kamer**; gevechten starten
   met het expliciete commando `vecht`. Nodig omdat de rivieroever losse
   stenen bevat die de speler vóór het wolfgevecht moet kunnen oprapen —
   met een autogevecht was het beste einde onbereikbaar. Maakt de
   jachthond meteen werkelijk optioneel.
2. **Ook de bloem ligt achter de jachthond** (één tegenstander per kamer);
   bloem en melk zijn beide optioneel, dus de speelbaarheid verandert niet.

Verder: deterministische output (vaste aanvalspatronen, geen `Random`),
zodat WP 9 de browsersimulatie via transcript-diff kan controleren.

## QC-resultaat

Door de manager zelf uitgevoerd:

- `javac -Xlint:all -d out src/*.java` — schoon, nul warnings.
- Cursusgrenzen-grep (`switch`, `enum`, `->`, `Stream`, `var`, `extends`,
  `implements`, `HashMap`) — leeg. Imports: alleen `ArrayList` en
  `Scanner`.
- Alle vier de eindescripts bereiken hun eigen einde; het beste einde
  toont de endgame-keten (`geitje.getSchuilplaats().getKamer().getNaam()`)
  voor alle zeven geitjes.
- `TestSpeler`, `TestGeitje`, `TestGevecht` drukken hun verwachte
  resultaten af (klem op 0..20, null-veilige keten, resultaatcode 1).
- Steekproef op codekwaliteit (Geitje.java): commentaar in cursusstijl,
  didactisch raak ("null: dan is er geen doos om naar te wijzen").
- Regelbudgetten gehaald, behalve Spel (606 vs ~520) — aanvaard, het
  contract noemt de budgetten richtwaarden en de overschrijding zit in
  door het contract zelf gevraagde machinerie.

Commit: Seven Little Goats, werkpakket 2.
