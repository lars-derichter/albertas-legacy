// Een verstopplek voor een geitje: een naam ("de klokkast", "tussen het riet")
// en de kamer waar ze ligt. Zo weet een geitje zelf waar het zit en moet ik dat
// nergens apart bijhouden:
//     geitje.getSchuilplaats().getKamer().getNaam()
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

    // De kamer waar deze plek ligt. Het slot leest hier de kamernaam uit.
    Kamer getKamer() {
        return kamer;
    }
}
