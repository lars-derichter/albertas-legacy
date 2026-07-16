// Een Schuilplaats is een verstopplek voor een geitje: een naam (bijvoorbeeld
// "de klokkast") en een referentie naar de Kamer waar ze zich bevindt.
// Zo kan je vanaf een geitje twee pijlen volgen naar de naam van zijn kamer:
//     geitje.getSchuilplaats().getKamer().getNaam()
// De eerste pijl gaat van het geitje naar zijn schuilplaats, de tweede van de
// schuilplaats naar haar kamer.
class Schuilplaats {

    private String naam;
    private Kamer kamer;

    Schuilplaats(String naam, Kamer kamer) {
        this.naam = naam;
        this.kamer = kamer;
    }

    String getNaam() {
        return naam;
    }

    // Geeft de kamer waar deze schuilplaats zich bevindt. Dit is de tweede pijl
    // in de keten van geitje via schuilplaats naar kamer.
    Kamer getKamer() {
        return kamer;
    }
}
