// Een cursusstijl-test voor Speler: probeert de klemmende setter en de
// inventaris-methodes uit en drukt de resultaten af. Geen test-framework, gewoon
// zelf nakijken.
class TestSpeler {

    public static void main(String[] args) {
        System.out.println("== Test Speler ==");

        Speler speler = new Speler();
        System.out.println("start-LP    (20): " + speler.getLevenspunten());
        System.out.println("aanvalskr.  (2) : " + speler.getAanvalskracht());

        // De setter mag niet boven het maximum van 20 gaan.
        speler.setLevenspunten(25);
        System.out.println("na +25      (20): " + speler.getLevenspunten());

        // En ook niet onder 0.
        speler.setLevenspunten(-5);
        System.out.println("na -5       (0) : " + speler.getLevenspunten());

        System.out.println();

        // Inventaris: pakken, zoeken, hebben, verwijderen.
        Voorwerp koek = new Voorwerp("koek", "versgebakken");
        speler.pak(koek);
        System.out.println("heeft koek  (true) : " + speler.heeft("koek"));
        System.out.println("heeft mes   (false): " + speler.heeft("keukenmes"));
        System.out.println("zoek koek   (niet null): " + (speler.zoek("koek") != null));

        boolean weg = speler.verwijder("koek");
        System.out.println("verwijderd  (true) : " + weg);
        System.out.println("heeft koek  (false): " + speler.heeft("koek"));
    }
}
