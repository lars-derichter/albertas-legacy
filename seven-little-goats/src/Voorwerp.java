// Een Voorwerp is iets dat in een kamer ligt of in de inventaris van de speler
// zit: de rode mantel, het keukenmes, een koek, de zilveren schaar ...
// Elk voorwerp heeft een naam, een korte beschrijving en een kracht.
// De kracht is 0 voor gewone voorwerpen; het keukenmes heeft kracht 3 en telt
// mee bij een aanval.
class Voorwerp {

    private String naam;
    private String beschrijving;
    private int kracht;

    // Voor gewone spullen: het mandje, een koek, het krijt. Kracht 0, want
    // daarmee sla je niemand neer.
    Voorwerp(String naam, String beschrijving) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = 0;
    }

    // En eentje met kracht, voorlopig alleen voor het keukenmes.
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

    // Zoals het in de inventarislijst hoort te staan, beschrijving erbij.
    public String toString() {
        return naam + " (" + beschrijving + ")";
    }
}
