import java.util.ArrayList;

// De Speler is Roodkapje: haar levenspunten, haar aanvalskracht en haar
// inventaris (de voorwerpen die ze bij zich draagt).
// De levenspunten blijven altijd tussen 0 en 20; de setter zorgt daarvoor.
class Speler {

    // Een final constante: de bovengrens van de levenspunten ligt vast op 20.
    private final int MAX_LEVENSPUNTEN = 20;

    private int levenspunten;
    private int aanvalskracht;
    private ArrayList<Voorwerp> inventaris;

    Speler() {
        this.levenspunten = 20;
        this.aanvalskracht = 2;
        this.inventaris = new ArrayList<Voorwerp>();
    }

    int getLevenspunten() {
        return levenspunten;
    }

    // Zet de levenspunten, maar nooit onder 0 en nooit boven het maximum.
    // Zo kan genezen niet boven 20 gaan en schade niet onder 0. Dit is de
    // klemmende setter: twee losse controles die de waarde binnen de grenzen
    // duwen voor ze wordt opgeslagen.
    void setLevenspunten(int nieuweWaarde) {
        if (nieuweWaarde < 0) {
            nieuweWaarde = 0;
        }
        if (nieuweWaarde > MAX_LEVENSPUNTEN) {
            nieuweWaarde = MAX_LEVENSPUNTEN;
        }
        this.levenspunten = nieuweWaarde;
    }

    int getMaxLevenspunten() {
        return MAX_LEVENSPUNTEN;
    }

    int getAanvalskracht() {
        return aanvalskracht;
    }

    ArrayList<Voorwerp> getInventaris() {
        return inventaris;
    }

    // Voegt een voorwerp toe aan de inventaris.
    void pak(Voorwerp voorwerp) {
        inventaris.add(voorwerp);
    }

    // Zoekt een voorwerp in de inventaris op naam. Geeft het voorwerp terug, of
    // null als de speler het niet bij zich heeft. De klassieke zoeklus.
    Voorwerp zoek(String gezochteNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            Voorwerp huidig = inventaris.get(i);
            if (huidig.getNaam().equals(gezochteNaam)) {
                return huidig;
            }
        }
        return null;
    }

    // Handig kortschrift: heeft de speler dit voorwerp bij zich?
    boolean heeft(String gezochteNaam) {
        return zoek(gezochteNaam) != null;
    }

    // Verwijdert één voorwerp uit de inventaris (na eten of ruilen). Zoekt eerst
    // de index in de lus en verwijdert dan op die index. Geeft true als er iets
    // verwijderd is.
    boolean verwijder(String teVerwijderenNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            if (inventaris.get(i).getNaam().equals(teVerwijderenNaam)) {
                inventaris.remove(i);
                return true;
            }
        }
        return false;
    }
}
