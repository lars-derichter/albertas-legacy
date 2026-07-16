// Een Voorwerp is iets dat in een kamer ligt of in de inventaris van de speler
// zit: de rode mantel, het keukenmes, een koek, de zilveren schaar ...
// Elk voorwerp heeft een naam, een korte beschrijving en een kracht.
// De kracht is 0 voor gewone voorwerpen; het keukenmes heeft kracht 3 en telt
// mee bij een aanval.
class Voorwerp {

    private String naam;
    private String beschrijving;
    private int kracht;

    // Constructor voor een gewoon voorwerp zonder kracht (kracht wordt 0).
    // Dit is de enige plaats waar we overloaden: twee constructors op dezelfde
    // klasse. De ene roept de andere niet aan, we houden het bewust eenvoudig.
    Voorwerp(String naam, String beschrijving) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = 0;
    }

    // Constructor voor een voorwerp met kracht (bijvoorbeeld het keukenmes).
    Voorwerp(String naam, String beschrijving, int kracht) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = kracht;
    }

    String getNaam() {
        return naam;
    }

    String getBeschrijving() {
        return beschrijving;
    }

    int getKracht() {
        return kracht;
    }

    // Toont het voorwerp netjes, met zijn beschrijving erbij.
    public String toString() {
        return naam + " (" + beschrijving + ")";
    }
}
