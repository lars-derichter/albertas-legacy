// Even nakijken of Geitje en Schuilplaats kloppen: komt
// geitje.getSchuilplaats().getKamer().getNaam() uit waar ik ze wil hebben, en
// wat doet ze bij een geitje dat nog in de wolf zit. Geen framework, ik lees de
// uitvoer zelf.
class TestGeitje {

    public static void main(String[] args) {
        System.out.println("== Test Geitje ==");

        Kamer geitenhuisje = new Kamer("Geitenhuisje", "thuis",
                "kijk in de klokkast");
        Schuilplaats klokkast = new Schuilplaats("de klokkast", geitenhuisje);
        Geitje jongste = new Geitje("jongste geitje", klokkast);

        // Dit is wat het slot straks per geitje moet afdrukken.
        System.out.println("naam         (jongste geitje): " + jongste.getNaam());
        System.out.println("schuilplaats (de klokkast)   : "
                + jongste.getSchuilplaats().getNaam());
        System.out.println("kamer        (Geitenhuisje)  : "
                + jongste.getSchuilplaats().getKamer().getNaam());

        System.out.println();

        // Een nog opgeslokt geitje heeft (nog) geen schuilplaats: null.
        Geitje opgeslokt = new Geitje("eerste geitje", null);
        System.out.println("schuilplaats (null): " + opgeslokt.getSchuilplaats());
        // Eerst controleren, anders klapt het slot hier eruit.
        if (opgeslokt.getSchuilplaats() == null) {
            System.out.println("null-veilig (nog niet gevonden): geen kamer om te tonen");
        }

        // Na de bevrijding krijgt het een plek en klopt de keten wél.
        opgeslokt.setSchuilplaats(new Schuilplaats("onder de tafel", geitenhuisje));
        opgeslokt.setGered(true);
        System.out.println("na bevrijding (onder de tafel): "
                + opgeslokt.getSchuilplaats().getNaam());
        System.out.println("kamer         (Geitenhuisje)  : "
                + opgeslokt.getSchuilplaats().getKamer().getNaam());
        System.out.println("gered         (true)          : " + opgeslokt.isGered());
    }
}
