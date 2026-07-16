// Een cursusstijl-test voor Geitje en Schuilplaats: probeert de dubbele pijl
// geitje.getSchuilplaats().getKamer().getNaam() uit, én het null-geval van een
// nog opgeslokt geitje. Geen test-framework, gewoon zelf nakijken.
class TestGeitje {

    public static void main(String[] args) {
        System.out.println("== Test Geitje ==");

        Kamer geitenhuisje = new Kamer("Geitenhuisje", "thuis",
                "kijk in de klokkast");
        Schuilplaats klokkast = new Schuilplaats("de klokkast", geitenhuisje);
        Geitje jongste = new Geitje("jongste geitje", klokkast);

        // De dubbele pijl: van geitje via schuilplaats naar de naam van de kamer.
        System.out.println("naam         (jongste geitje): " + jongste.getNaam());
        System.out.println("schuilplaats (de klokkast)   : "
                + jongste.getSchuilplaats().getNaam());
        System.out.println("kamer        (Geitenhuisje)  : "
                + jongste.getSchuilplaats().getKamer().getNaam());

        System.out.println();

        // Een nog opgeslokt geitje heeft (nog) geen schuilplaats: null.
        Geitje opgeslokt = new Geitje("eerste geitje", null);
        System.out.println("schuilplaats (null): " + opgeslokt.getSchuilplaats());
        // Null-veilig: eerst controleren voor we de pijlen volgen.
        if (opgeslokt.getSchuilplaats() == null) {
            System.out.println("null-veilig (nog niet gevonden): geen kamer om te tonen");
        }

        // Na de bevrijding krijgt het een schuilplaats en volgt de keten wél.
        opgeslokt.setSchuilplaats(new Schuilplaats("onder de tafel", geitenhuisje));
        opgeslokt.setGered(true);
        System.out.println("na bevrijding (onder de tafel): "
                + opgeslokt.getSchuilplaats().getNaam());
        System.out.println("kamer         (Geitenhuisje)  : "
                + opgeslokt.getSchuilplaats().getKamer().getNaam());
        System.out.println("gered         (true)          : " + opgeslokt.isGered());
    }
}
