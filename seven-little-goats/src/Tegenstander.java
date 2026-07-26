// Waar ze tegen vecht: de jachthond in de molen, de jonge wolf aan de rivier.
// De klappen liggen op voorhand vast, één waarde per ronde. Geen dobbelsteen —
// wie meetelt en rekent haalt het, wie er blind op ramt niet. Zo hoort het te
// voelen.
class Tegenstander {

    private String naam;
    private String beschrijving;
    private int levenspunten;
    // Eén waarde per ronde: de schade die deze tegenstander die ronde uitdeelt.
    private int[] aanvalspatroon;
    // Vanaf hoeveel levenspunten smeekt de tegenstander om genade?
    // De wolf smeekt bij 5 of minder; de jachthond smeekt nooit (drempel 0, want
    // een levende tegenstander heeft altijd meer dan 0 levenspunten).
    private int smeekDrempel;
    // De hint die tijdens dit gevecht verschijnt als de speler ? intikt.
    private String hint;

    Tegenstander(String naam, String beschrijving, int levenspunten,
                 int[] aanvalspatroon, int smeekDrempel, String hint) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.levenspunten = levenspunten;
        this.aanvalspatroon = aanvalspatroon;
        this.smeekDrempel = smeekDrempel;
        this.hint = hint;
    }

    String getNaam() {
        return naam;
    }

    String getBeschrijving() {
        return beschrijving;
    }

    int getLevenspunten() {
        return levenspunten;
    }

    // Nooit onder 0; anders staat de wolf op -3 nog te grommen aan de oever.
    void setLevenspunten(int nieuweWaarde) {
        if (nieuweWaarde < 0) {
            nieuweWaarde = 0;
        }
        this.levenspunten = nieuweWaarde;
    }

    int[] getAanvalspatroon() {
        return aanvalspatroon;
    }

    int getSmeekDrempel() {
        return smeekDrempel;
    }

    String getHint() {
        return hint;
    }

    public String toString() {
        return naam + " (" + levenspunten + " LP)";
    }
}
