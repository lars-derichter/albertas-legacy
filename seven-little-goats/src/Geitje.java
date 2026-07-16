// Een Geitje is één van de zeven geitjes uit het geitenhuisje.
// Elk geitje heeft een naam, een referentie naar zijn Schuilplaats en een
// gered-vlag. Zolang een geitje nog in de wolf zit, is zijn schuilplaats null:
// dan is er geen doos om naar te wijzen. Het jongste geitje overleefde in de
// klokkast en heeft dus wel een schuilplaats vanaf het begin.
class Geitje {

    private String naam;
    // De schuilplaats van dit geitje, of null zolang het nog opgeslokt is.
    private Schuilplaats schuilplaats;
    // Is dit geitje al bevrijd? Bij de start alleen het jongste (dat zich zelf
    // verstopte); de zes broertjes worden pas aan de rivier gered.
    private boolean gered;

    // Constructor. Geef null mee als het geitje nog geen schuilplaats heeft
    // (nog opgeslokt); geef een Schuilplaats mee voor het jongste geitje.
    Geitje(String naam, Schuilplaats schuilplaats) {
        this.naam = naam;
        this.schuilplaats = schuilplaats;
        this.gered = false;
    }

    String getNaam() {
        return naam;
    }

    // Geeft de schuilplaats van dit geitje, of null als het er geen heeft. Dit
    // is de eerste pijl in de keten van geitje via schuilplaats naar kamer.
    Schuilplaats getSchuilplaats() {
        return schuilplaats;
    }

    void setSchuilplaats(Schuilplaats schuilplaats) {
        this.schuilplaats = schuilplaats;
    }

    boolean isGered() {
        return gered;
    }

    void setGered(boolean gered) {
        this.gered = gered;
    }

    public String toString() {
        return naam;
    }
}
