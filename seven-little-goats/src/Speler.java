import java.util.ArrayList;

// De Speler is Roodkapje: haar levenspunten, haar aanvalskracht en haar
// inventaris (de voorwerpen die ze bij zich draagt).
// De levenspunten blijven altijd tussen 0 en 20; de setter zorgt daarvoor.
class Speler {

    // Twintig is het plafond. Genoeg om een paar missers te overleven, te weinig
    // om de rivier te halen zonder onderweg iets te eten.
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

    // Nooit onder 0, nooit boven het plafond. Anders eet ze zich boven twintig
    // aan koeken, of staat er na de laatste klap een negatief getal in de
    // statusregel terwijl ze al dood is.
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

    // In haar mand ermee.
    void pak(Voorwerp voorwerp) {
        inventaris.add(voorwerp);
    }

    // Het voorwerp met die naam, of null als ze het niet bij zich draagt. null
    // betekent hier "niet in haar mand", niet "bestaat niet".
    Voorwerp zoek(String gezochteNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            Voorwerp huidig = inventaris.get(i);
            if (huidig.getNaam().equals(gezochteNaam)) {
                return huidig;
            }
        }
        return null;
    }

    // Kortschrift; ik vraag dit overal: mandje, koek, mantel, schaar.
    boolean heeft(String gezochteNaam) {
        return zoek(gezochteNaam) != null;
    }

    // Eén exemplaar weg: na een koek of na de ruil met de raaf. Eén, niet alle —
    // ze draagt er twee van het plein mee en de raaf krijgt er maar één. true
    // als er echt iets verdween.
    boolean verwijder(String teVerwijderenNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            if (inventaris.get(i).getNaam().equals(teVerwijderenNaam)) {
                inventaris.remove(i);
                return true;
            }
        }
        return false;
    }

    // Voor de statusregel: hoeveel wapens draagt ze? Alles met kracht boven 0,
    // dus het keukenmes wel en het mandje niet.
    int telWapens() {
        int aantal = 0;
        for (int i = 0; i < inventaris.size(); i++) {
            if (inventaris.get(i).getKracht() > 0) {
                aantal++;
            }
        }
        return aantal;
    }

    // Waarmee ze het hardst uithaalt, of null als haar mand leeg is. Ook voor de
    // statusregel — ik wil dat ze vóór de rivier ziet wat ze in handen heeft.
    Voorwerp sterksteVoorwerp() {
        Voorwerp sterkste = null;
        for (int i = 0; i < inventaris.size(); i++) {
            Voorwerp huidig = inventaris.get(i);
            if (sterkste == null || huidig.getKracht() > sterkste.getKracht()) {
                sterkste = huidig;
            }
        }
        return sterkste;
    }
}
