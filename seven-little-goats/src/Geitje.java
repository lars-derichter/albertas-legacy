// Een Geitje is één van de zeven geitjes uit het geitenhuisje.
// Elk geitje heeft een naam, een referentie naar zijn Schuilplaats en een
// gered-vlag. Zolang een geitje nog in de wolf zit, is zijn schuilplaats null:
// er is dan nog geen plek om naar te wijzen. Het jongste overleefde in de
// klokkast en heeft er dus vanaf het begin wel een.
class Geitje {

    private String naam;
    // De schuilplaats van dit geitje, of null zolang het nog opgeslokt is.
    private Schuilplaats schuilplaats;
    // Is dit geitje al bevrijd? Bij de start alleen het jongste (dat zich zelf
    // verstopte); de zes broertjes worden pas aan de rivier gered.
    private boolean gered;

    // null voor de zes die nog in de wolf zitten; het jongste krijgt de klokkast
    // meteen mee.
    Geitje(String naam, Schuilplaats schuilplaats) {
        this.naam = naam;
        this.schuilplaats = schuilplaats;
        this.gered = false;
    }

    String getNaam() {
        return naam;
    }

    // De schuilplaats, of null zolang het geitje nog opgeslokt is. Aan deze ene
    // vraag hangt de hele slotlijst.
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
