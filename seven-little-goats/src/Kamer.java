import java.util.ArrayList;

// Een Kamer is één plek op de kaart: het geitenhuisje, de molen, het bospad ...
// Een kamer heeft een naam, een beschrijving en een hint. Ze kent haar buren
// via vier referenties (noord, oost, zuid, west); een referentie die null is,
// betekent dat er in die richting geen uitgang is.
// In een kamer kunnen voorwerpen liggen (een ArrayList) en er kan een
// tegenstander aanwezig zijn (null als er geen is).
class Kamer {

    private String naam;
    private String beschrijving;
    private String hint;

    private ArrayList<Voorwerp> voorwerpen;

    // De vier buren. null = geen uitgang in die richting.
    private Kamer noord;
    private Kamer oost;
    private Kamer zuid;
    private Kamer west;

    // De tegenstander in deze kamer, of null als er geen is.
    private Tegenstander tegenstander;

    Kamer(String naam, String beschrijving, String hint) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.hint = hint;
        this.voorwerpen = new ArrayList<Voorwerp>();
        // De buren en de tegenstander blijven voorlopig null. Het spel verbindt
        // ze achteraf met elkaar.
    }

    String getNaam() {
        return naam;
    }

    String getBeschrijving() {
        return beschrijving;
    }

    String getHint() {
        return hint;
    }

    ArrayList<Voorwerp> getVoorwerpen() {
        return voorwerpen;
    }

    void voegVoorwerpToe(Voorwerp voorwerp) {
        voorwerpen.add(voorwerp);
    }

    // Zoekt een voorwerp in deze kamer op naam. Geeft het voorwerp terug, of
    // null als het hier niet ligt. Dit is de klassieke zoeklus.
    Voorwerp zoekVoorwerp(String gezochteNaam) {
        for (int i = 0; i < voorwerpen.size(); i++) {
            Voorwerp huidig = voorwerpen.get(i);
            if (huidig.getNaam().equals(gezochteNaam)) {
                return huidig;
            }
        }
        return null;
    }

    // Haalt een voorwerp uit de kamer weg (na het oppakken). Zoekt eerst de
    // index in de lus en verwijdert dan op die index. Let op de off-by-one:
    // de lus loopt van 0 tot size() - 1, en na remove stoppen we meteen.
    void verwijderVoorwerp(String teVerwijderenNaam) {
        for (int i = 0; i < voorwerpen.size(); i++) {
            if (voorwerpen.get(i).getNaam().equals(teVerwijderenNaam)) {
                voorwerpen.remove(i);
                return;
            }
        }
    }

    // De vier buur-referenties, elk met een getter en een setter. Het spel zet
    // ze in beide richtingen (zie Spel.verbindKamers): twee pijlen naar één doos.

    Kamer getNoord() {
        return noord;
    }

    void setNoord(Kamer noord) {
        this.noord = noord;
    }

    Kamer getOost() {
        return oost;
    }

    void setOost(Kamer oost) {
        this.oost = oost;
    }

    Kamer getZuid() {
        return zuid;
    }

    void setZuid(Kamer zuid) {
        this.zuid = zuid;
    }

    Kamer getWest() {
        return west;
    }

    void setWest(Kamer west) {
        this.west = west;
    }

    Tegenstander getTegenstander() {
        return tegenstander;
    }

    void setTegenstander(Tegenstander tegenstander) {
        this.tegenstander = tegenstander;
    }
}
