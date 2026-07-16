import java.util.Scanner;

// Een Gevecht speelt één gevecht af tussen de speler en één tegenstander.
// Het gevecht duurt maximaal vijf rondes. Elke ronde kiest de speler een actie
// (aanvallen, verdedigen, iets eten). Daarna slaat de tegenstander terug, als
// die nog leeft.
//
// De methode voer() geeft een resultaatcode terug die het spel gebruikt om te
// beslissen wat er daarna gebeurt:
//   0 = de speler is verslagen (0 levenspunten)
//   1 = de tegenstander is verslagen (doodgeslagen of afgemaakt)
//   2 = de speler heeft de tegenstander gespaard
//   3 = vijf rondes voorbij zonder beslissing (time-out)
class Gevecht {

    private Speler speler;
    private Tegenstander tegenstander;
    private Scanner invoer;

    Gevecht(Speler speler, Tegenstander tegenstander, Scanner invoer) {
        this.speler = speler;
        this.tegenstander = tegenstander;
        this.invoer = invoer;
    }

    // Speelt het gevecht af en geeft de resultaatcode terug.
    int voer() {
        System.out.println();
        System.out.println("== Gevecht: " + tegenstander.getNaam() + " ==");
        System.out.println(tegenstander.getBeschrijving());

        // De schade die de speler per ronde uitdeelt, in een array van vijf.
        int[] schadelog = new int[5];
        int ronde = 0;
        // Standaard is het resultaat een time-out; dat verandert zodra er iets
        // beslissends gebeurt.
        int resultaat = 3;
        boolean klaar = false;

        while (ronde < 5 && !klaar) {

            // Smeekt de tegenstander om genade? (Alleen de wolf; de jachthond
            // heeft een drempel van 0 en smeekt dus nooit.)
            if (tegenstander.getLevenspunten() <= tegenstander.getSmeekDrempel()) {
                System.out.println();
                System.out.println("De " + tegenstander.getNaam()
                        + " heft zijn poten op. \"Wacht! Genade... we");
                System.out.println("kunnen hier toch over praten?\" Zijn stem klinkt");
                System.out.println("nog vaag naar bloem en krijt.");
                System.out.println("Kies: spaar / maak af");

                String keuze = leesInvoer();
                if (keuze.equals("spaar")) {
                    resultaat = 2;
                    klaar = true;
                } else if (keuze.equals("maak af")) {
                    tegenstander.setLevenspunten(0);
                    resultaat = 1;
                    klaar = true;
                } else if (keuze.equals("?")) {
                    System.out.println("Hint: " + tegenstander.getHint());
                } else if (keuze.equals("opties")) {
                    toonSmeekOpties();
                } else {
                    System.out.println("Dat begrijp je niet.");
                }
                // Een smeekmoment telt niet als een ronde: we verhogen ronde niet
                // en de tegenstander slaat niet terug.

            } else {

                System.out.println();
                System.out.println("-- Ronde " + (ronde + 1) + " --");
                System.out.println("Jij: " + speler.getLevenspunten() + " LP     "
                        + tegenstander.getNaam() + ": "
                        + tegenstander.getLevenspunten() + " LP");
                System.out.println("Kies: val aan / verdedig / eet koek / eet melk");

                String keuze = leesInvoer();

                boolean verdedigt = false;
                boolean geldigeActie = true;

                if (keuze.equals("val aan")) {
                    int schade = berekenSpelerschade();
                    tegenstander.setLevenspunten(
                            tegenstander.getLevenspunten() - schade);
                    schadelog[ronde] = schade;
                    System.out.println("Je haalt uit voor " + schade + " schade.");
                } else if (keuze.equals("verdedig")) {
                    verdedigt = true;
                    schadelog[ronde] = 0;
                    System.out.println("Je gaat in verdediging.");
                } else if (keuze.equals("eet koek")) {
                    if (speler.heeft("koek")) {
                        speler.verwijder("koek");
                        speler.setLevenspunten(speler.getLevenspunten() + 4);
                        schadelog[ronde] = 0;
                        System.out.println("Je eet een koek. +4 LP (nu "
                                + speler.getLevenspunten() + ").");
                    } else {
                        System.out.println("Je hebt geen koek.");
                        geldigeActie = false;
                    }
                } else if (keuze.equals("eet melk")) {
                    if (speler.heeft("kruik melk")) {
                        speler.verwijder("kruik melk");
                        speler.setLevenspunten(speler.getLevenspunten() + 6);
                        schadelog[ronde] = 0;
                        System.out.println("Je drinkt van de kruik melk. +6 LP (nu "
                                + speler.getLevenspunten() + ").");
                    } else {
                        System.out.println("Je hebt geen kruik melk.");
                        geldigeActie = false;
                    }
                } else if (keuze.equals("?")) {
                    System.out.println("Hint: " + tegenstander.getHint());
                    geldigeActie = false;
                } else if (keuze.equals("opties")) {
                    toonGevechtOpties();
                    geldigeActie = false;
                } else {
                    System.out.println("Dat begrijp je niet.");
                    geldigeActie = false;
                }

                // Alleen bij een echte actie loopt de ronde door. Bij ?, opties
                // of onzin blijven we in dezelfde ronde staan.
                if (geldigeActie) {
                    if (tegenstander.getLevenspunten() <= 0) {
                        System.out.println("De " + tegenstander.getNaam()
                                + " is verslagen.");
                        resultaat = 1;
                        klaar = true;
                    } else {
                        // De tegenstander slaat terug volgens zijn vaste patroon.
                        int inkomend = tegenstander.getAanvalspatroon()[ronde];
                        // Verdedigen halveert de klap. Let op: dit is gehele deling,
                        // dus 5 / 2 wordt 2, niet 2,5.
                        if (verdedigt) {
                            inkomend = inkomend / 2;
                        }
                        // De rode mantel vangt telkens 1 schade op.
                        if (speler.heeft("rode mantel")) {
                            inkomend = inkomend - 1;
                        }
                        if (inkomend < 0) {
                            inkomend = 0;
                        }
                        speler.setLevenspunten(speler.getLevenspunten() - inkomend);
                        System.out.println("De " + tegenstander.getNaam()
                                + " haalt uit voor " + inkomend + " schade (jij nu "
                                + speler.getLevenspunten() + " LP).");

                        if (speler.getLevenspunten() <= 0) {
                            resultaat = 0;
                            klaar = true;
                        }
                    }
                    ronde++;
                }
            }
        }

        // Achteraf: een overzichtje van de schade over de rondes die echt
        // gevochten zijn (de teller ronde).
        toonSchadelog(schadelog, ronde);

        return resultaat;
    }

    // De schade van de speler: haar basiskracht plus de kracht van het keukenmes
    // als ze dat bij zich heeft.
    private int berekenSpelerschade() {
        int schade = speler.getAanvalskracht();
        Voorwerp mes = speler.zoek("keukenmes");
        if (mes != null) {
            schade = schade + mes.getKracht();
        }
        return schade;
    }

    // Toont het schade-overzicht: aantal rondes, som, gemiddelde en maximum over
    // de gevochten rondes. Dit zijn de klassieke lijstpatronen op een array:
    // tellen, totaliseren en het uiterste zoeken.
    private void toonSchadelog(int[] schadelog, int aantalRondes) {
        System.out.println();
        System.out.println("-- Schade-overzicht --");
        if (aantalRondes == 0) {
            System.out.println("Je hebt geen enkele klap uitgedeeld.");
            return;
        }

        int som = 0;
        int maximum = schadelog[0];
        for (int i = 0; i < aantalRondes; i++) {
            som = som + schadelog[i];
            if (schadelog[i] > maximum) {
                maximum = schadelog[i];
            }
        }
        // Cast naar double zodat het gemiddelde met decimalen verschijnt.
        double gemiddelde = (double) som / aantalRondes;

        System.out.println("Rondes gevochten: " + aantalRondes);
        System.out.println("Totale schade:    " + som);
        System.out.println("Gemiddeld:        " + gemiddelde);
        System.out.println("Grootste klap:    " + maximum);
    }

    private void toonGevechtOpties() {
        System.out.println("Je kan hier: val aan, verdedig");
        if (speler.heeft("koek")) {
            System.out.println("             eet koek");
        }
        if (speler.heeft("kruik melk")) {
            System.out.println("             eet melk");
        }
        System.out.println("             ? (hint)");
        System.out.println("             opties (cheatcode)");
    }

    private void toonSmeekOpties() {
        System.out.println("Je kan hier: spaar, maak af");
        System.out.println("             ? (hint)");
        System.out.println("             opties (cheatcode)");
    }

    // Leest één regel invoer, in kleine letters en zonder spaties eromheen.
    private String leesInvoer() {
        System.out.print("> ");
        String regel = invoer.nextLine();
        return regel.trim().toLowerCase();
    }
}
