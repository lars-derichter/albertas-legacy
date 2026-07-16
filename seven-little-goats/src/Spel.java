import java.util.ArrayList;
import java.util.Scanner;

// Spel houdt de hele wereld bij en verwerkt de commando's van de speler.
// Het bouwt de kamers op en wiret ze aan elkaar, onthoudt in welke kamer de
// speler staat, houdt de zeven geitjes bij, en beslist wat elk commando doet.
// De gevechten en de vier eindes worden hier gestart en afgehandeld.
class Spel {

    private Scanner invoer;
    private Speler speler;
    private Kamer huidigeKamer;

    // Zolang dit false is, blijft de spellus in Main draaien.
    private boolean gestopt;
    // Heeft de speler al met de raaf geruild? De ruil kan maar één keer.
    private boolean kiezelsGeruild;

    // Referenties naar de kamers die een speciale rol spelen. Zo kunnen we
    // makkelijk controleren "sta ik aan de rivier?" met een objectvergelijking.
    private Kamer geitenhuisje;
    private Kamer dorpsplein;
    private Kamer molen;
    private Kamer kruidenier;
    private Kamer bospad;
    private Kamer oudeEik;
    private Kamer grootmoederHuisje;
    private Kamer wolvenspoor;
    private Kamer rivieroever;

    // De zeven geitjes. Het jongste heeft vanaf de start een schuilplaats (de
    // klokkast); de zes broertjes zitten nog in de wolf (schuilplaats null).
    private ArrayList<Geitje> geitjes;

    Spel(Scanner invoer) {
        this.invoer = invoer;
        this.speler = new Speler();
        this.gestopt = false;
        this.kiezelsGeruild = false;
        bouwWereld();
        this.huidigeKamer = geitenhuisje;
    }

    boolean isGestopt() {
        return gestopt;
    }

    // Bouwt alle kamers, vult ze met voorwerpen en tegenstanders, wiret de
    // uitgangen aan elkaar en maakt de zeven geitjes aan.
    private void bouwWereld() {
        geitenhuisje = new Kamer("Geitenhuisje",
                "Het huisje van de zeven geitjes. Stoelen omver, een omgestoten\n"
                + "kruk, deuren wagenwijd. In de hoek tikt de oude staande klok.\n"
                + "Op een haak hangt een rode mantel; op tafel liggen een\n"
                + "keukenmes en een mandje.",
                "Kijk in de klokkast (praat) en neem iets scherps en iets warms mee.");

        dorpsplein = new Kamer("Dorpsplein",
                "Het plein is de spil van het dorp. Naar het oosten de molen,\n"
                + "naar het westen de kruidenier, naar het zuiden het bospad.\n"
                + "Op een marktkraam koelen twee koeken af.",
                "Neem iets mee om te ruilen. En neem iets om ze in te dragen.");

        molen = new Kamer("Molen",
                "Meelstof hangt in het licht. Tegen de zakken ligt bloem gemorst.\n"
                + "Achteraan, bij een kruik melk, gromt een magere jachthond —\n"
                + "de weggelopen hond van de verdwenen jager.",
                "De hond bewaakt de melk. Vechten hoeft niet; het is een omweg.");

        kruidenier = new Kamer("Kruidenier",
                "Een kleine winkel met lege rekken. Op de toonbank ligt een stuk\n"
                + "krijt, waarvan een hoek is afgebeten.",
                "Het krijt vertelt hoe de stem zo zacht werd.");

        bospad = new Kamer("Bospad",
                "Hoge bomen, weinig licht. Het pad loopt recht naar het zuiden,\n"
                + "dieper het bos in.",
                "Volg het spoor naar het zuiden.");

        oudeEik = new Kamer("Oude eik",
                "Een knoestige oude eik. Op een lage tak zit een raaf je aan te\n"
                + "kijken alsof hij iets weet. (Hij weet iets.)",
                "Wie iets lekkers geeft, krijgt soms iets blinkends terug.");

        grootmoederHuisje = new Kamer("Grootmoeders huisje",
                "Grootmoeders huisje, stil en opgeruimd. In het naaimandje op de\n"
                + "vensterbank ligt een zilveren schaar, nog vlijmscherp.",
                "Neem de schaar mee. Ze opent later meer dan stof.");

        wolvenspoor = new Kamer("Wolvenspoor",
                "Witte pootafdrukken, één voor één, het pad af. Bloem en krijtstof.\n"
                + "Ergens vooruit klinkt water. De spanning stijgt.",
                "Bijna. Ga zuid naar de rivier.");

        rivieroever = new Kamer("Rivieroever",
                "De oever van de rivier. Daar staat hij: de jonge wolf, groot en\n"
                + "grijs en dik van de maaltijd. Aan je voeten liggen losse stenen.\n"
                + "\"Nog een die het verhaal gelezen heeft,\" grijnst hij.",
                "Raap de stenen op voor je vecht. Typ vecht als je klaar bent.");

        // Voorwerpen in de kamers.
        geitenhuisje.voegVoorwerpToe(new Voorwerp("rode mantel",
                "een warme rode mantel; vangt in een gevecht 1 schade op"));
        geitenhuisje.voegVoorwerpToe(new Voorwerp("keukenmes",
                "vlijmscherp; telt mee bij elke aanval", 3));
        geitenhuisje.voegVoorwerpToe(new Voorwerp("mandje",
                "een rieten mandje om iets in te dragen"));

        dorpsplein.voegVoorwerpToe(new Voorwerp("koek", "versgebakken"));
        dorpsplein.voegVoorwerpToe(new Voorwerp("koek", "versgebakken"));

        molen.voegVoorwerpToe(new Voorwerp("bloem",
                "meel van de molen; hiermee wreef de wolf zijn poot wit"));
        molen.voegVoorwerpToe(new Voorwerp("kruik melk",
                "geitenmelk; eenmalig +6 levenspunten"));

        kruidenier.voegVoorwerpToe(new Voorwerp("krijt",
                "een stuk krijt; hiervan at de wolf voor een zachte stem"));

        grootmoederHuisje.voegVoorwerpToe(new Voorwerp("zilveren schaar",
                "grootmoeders schaar, nog vlijmscherp; ontgrendelt het beste einde"));

        rivieroever.voegVoorwerpToe(new Voorwerp("stenen",
                "losse, zware stenen van de oever; voor de buik van de wolf"));

        // Tegenstanders. Hun aanvalspatroon ligt vast: één waarde per ronde.
        Tegenstander jachthond = new Tegenstander("jachthond",
                "Mager, kwaad en uitgehongerd. Hij bewaakt de kruik melk.",
                8, new int[] {2, 3, 2, 3, 2}, 0, "Twee, drie flinke halen volstaan.");
        molen.setTegenstander(jachthond);

        Tegenstander wolf = new Tegenstander("jonge wolf",
                "Groot, grijs, en dit keer geen vermomming meer.",
                18, new int[] {3, 5, 2, 6, 4}, 5, "Vijf rondes. Wie rekent, wint.");
        rivieroever.setTegenstander(wolf);

        // De uitgangen. Elke verbinding wordt in beide richtingen gelegd.
        verbindKamers(geitenhuisje, "zuid", dorpsplein);
        verbindKamers(dorpsplein, "oost", molen);
        verbindKamers(dorpsplein, "west", kruidenier);
        verbindKamers(dorpsplein, "zuid", bospad);
        verbindKamers(bospad, "zuid", oudeEik);
        verbindKamers(oudeEik, "zuid", grootmoederHuisje);
        verbindKamers(grootmoederHuisje, "zuid", wolvenspoor);
        verbindKamers(wolvenspoor, "zuid", rivieroever);

        // De zeven geitjes. Het jongste overleefde in de klokkast: zijn
        // schuilplaats wijst naar het geitenhuisje. De zes broertjes zitten nog
        // in de wolf en hebben dus (nog) geen schuilplaats: null.
        geitjes = new ArrayList<Geitje>();
        Schuilplaats klokkast = new Schuilplaats("de klokkast", geitenhuisje);
        Geitje jongste = new Geitje("jongste geitje", klokkast);
        jongste.setGered(true);
        geitjes.add(jongste);
        geitjes.add(new Geitje("eerste geitje", null));
        geitjes.add(new Geitje("tweede geitje", null));
        geitjes.add(new Geitje("derde geitje", null));
        geitjes.add(new Geitje("vierde geitje", null));
        geitjes.add(new Geitje("vijfde geitje", null));
        geitjes.add(new Geitje("zesde geitje", null));
    }

    // Legt een verbinding tussen twee kamers in de gegeven richting, en meteen
    // ook de terugweg. Twee pijlen naar één doos: gaat de eerste kamer naar het
    // zuiden naar de tweede, dan gaat de tweede naar het noorden terug naar de
    // eerste.
    private void verbindKamers(Kamer eerste, String richting, Kamer tweede) {
        if (richting.equals("noord")) {
            eerste.setNoord(tweede);
            tweede.setZuid(eerste);
        } else if (richting.equals("oost")) {
            eerste.setOost(tweede);
            tweede.setWest(eerste);
        } else if (richting.equals("zuid")) {
            eerste.setZuid(tweede);
            tweede.setNoord(eerste);
        } else if (richting.equals("west")) {
            eerste.setWest(tweede);
            tweede.setOost(eerste);
        }
    }

    // Zoekt een geitje in de lijst op naam. Geeft het geitje terug, of null als
    // er geen geitje met die naam bestaat. Dit is de zoeklus van scharnier 7.
    Geitje zoekGeitje(String gezochteNaam) {
        for (int i = 0; i < geitjes.size(); i++) {
            Geitje huidig = geitjes.get(i);
            if (huidig.getNaam().equals(gezochteNaam)) {
                return huidig;
            }
        }
        return null;
    }

    // Toont de huidige kamer: naam, beschrijving en wat er los te nemen valt.
    void beschrijfHuidigeKamer() {
        System.out.println();
        System.out.println("== " + huidigeKamer.getNaam() + " ==");
        System.out.println(huidigeKamer.getBeschrijving());
        toonVoorwerpenInKamer();
    }

    private void toonVoorwerpenInKamer() {
        ArrayList<Voorwerp> hier = huidigeKamer.getVoorwerpen();
        if (hier.size() > 0) {
            String regel = "Je kan hier meenemen: ";
            for (int i = 0; i < hier.size(); i++) {
                if (i > 0) {
                    regel = regel + ", ";
                }
                regel = regel + hier.get(i).getNaam();
            }
            System.out.println(regel);
        }
    }

    // Verwerkt één commando van de speler.
    void verwerk(String ruweInvoer) {
        String commando = ruweInvoer.trim().toLowerCase();

        if (commando.equals("kijk")) {
            beschrijfHuidigeKamer();
        } else if (commando.equals("ga noord")) {
            beweeg("noord");
        } else if (commando.equals("ga oost")) {
            beweeg("oost");
        } else if (commando.equals("ga zuid")) {
            beweeg("zuid");
        } else if (commando.equals("ga west")) {
            beweeg("west");
        } else if (commando.startsWith("pak ")) {
            pak(commando.substring(4).trim());
        } else if (commando.equals("inventaris")) {
            toonInventaris();
        } else if (commando.equals("stats")) {
            toonStats();
        } else if (commando.equals("eet koek")) {
            eetKoek();
        } else if (commando.equals("eet melk")) {
            eetMelk();
        } else if (commando.equals("geef koek")) {
            geefKoek();
        } else if (commando.equals("praat")) {
            praat();
        } else if (commando.equals("vecht")) {
            vecht();
        } else if (commando.equals("?")) {
            System.out.println("Hint: " + huidigeKamer.getHint());
        } else if (commando.equals("help")) {
            toonHelp();
        } else if (commando.equals("stop")) {
            System.out.println("Je legt het mes neer. Tot de volgende keer.");
            gestopt = true;
        } else if (commando.equals("opties")) {
            toonOpties();
        } else {
            System.out.println("Dat begrijp je niet.");
        }
    }

    // Beweegt de speler in een richting. Anders dan bij de voorganger begint een
    // gevecht hier niet vanzelf: een tegenstander blokkeert de kamer niet, je
    // valt hem pas aan met het commando vecht. Zo kan je aan de rivier eerst de
    // stenen oprapen voor je de wolf te lijf gaat.
    private void beweeg(String richting) {
        Kamer doel = null;
        if (richting.equals("noord")) {
            doel = huidigeKamer.getNoord();
        } else if (richting.equals("oost")) {
            doel = huidigeKamer.getOost();
        } else if (richting.equals("zuid")) {
            doel = huidigeKamer.getZuid();
        } else if (richting.equals("west")) {
            doel = huidigeKamer.getWest();
        }

        if (doel == null) {
            System.out.println("Die kant kan je niet op.");
            return;
        }

        huidigeKamer = doel;
        beschrijfHuidigeKamer();
    }

    // Start het gevecht met de tegenstander in de huidige kamer, als die er is.
    private void vecht() {
        if (huidigeKamer.getTegenstander() == null) {
            System.out.println("Er is hier niemand om tegen te vechten.");
            return;
        }
        startGevecht();
    }

    // Start het gevecht in de huidige kamer en handelt het resultaat af. De
    // afhandeling verschilt voor de jachthond en voor de wolf.
    private void startGevecht() {
        Tegenstander tegenstander = huidigeKamer.getTegenstander();
        Gevecht gevecht = new Gevecht(speler, tegenstander, invoer);
        int resultaat = gevecht.voer();

        if (huidigeKamer == molen) {
            // De jachthond smeekt niet (drempel 0), dus alleen 0, 1 of 3 komen
            // voor.
            if (resultaat == 1) {
                huidigeKamer.setTegenstander(null);
                System.out.println();
                System.out.println("De jachthond zakt in elkaar en sleept zich weg.");
                System.out.println("De kruik melk staat nu vrij.");
            } else if (resultaat == 0) {
                gameOver();
            } else {
                System.out.println();
                System.out.println("De jachthond heeft betere dingen te doen. Hij");
                System.out.println("duwt je terug naar het dorpsplein.");
                huidigeKamer = dorpsplein;
                beschrijfHuidigeKamer();
            }
        } else if (huidigeKamer == rivieroever) {
            if (resultaat == 1) {
                if (speler.heeft("zilveren schaar") && heeftStenen()) {
                    eindeSchaarEnStenen();
                } else {
                    eindeAfrekening();
                }
            } else if (resultaat == 2) {
                eindeLes();
            } else {
                gameOver();
            }
        }
    }

    // Heeft de speler stenen voor de buik van de wolf? De gladde kiezels van de
    // raaf en de losse stenen van de oever tellen allebei.
    private boolean heeftStenen() {
        return speler.heeft("gladde kiezels") || speler.heeft("stenen");
    }

    // Pakt een voorwerp op uit de huidige kamer.
    private void pak(String naam) {
        Voorwerp voorwerp = huidigeKamer.zoekVoorwerp(naam);
        if (voorwerp == null) {
            System.out.println("Dat ligt hier niet.");
            return;
        }
        // Koeken oppakken kan alleen met een mandje om ze in te dragen.
        if (naam.equals("koek") && !speler.heeft("mandje")) {
            System.out.println("Je hebt niets om ze in te dragen.");
            return;
        }
        huidigeKamer.verwijderVoorwerp(naam);
        speler.pak(voorwerp);
        System.out.println("Je neemt " + naam + " mee.");
    }

    private void toonInventaris() {
        ArrayList<Voorwerp> spullen = speler.getInventaris();
        if (spullen.size() == 0) {
            System.out.println("Je draagt niets bij je.");
            return;
        }
        System.out.println("Je draagt bij je:");
        for (Voorwerp voorwerp : spullen) {
            System.out.println("- " + voorwerp);
        }
    }

    private void toonStats() {
        System.out.println("Levenspunten: " + speler.getLevenspunten() + "/"
                + speler.getMaxLevenspunten());
        System.out.println("Aanvalskracht: " + speler.getAanvalskracht());
        Voorwerp mes = speler.zoek("keukenmes");
        if (mes != null) {
            System.out.println("Met het keukenmes deel je "
                    + (speler.getAanvalskracht() + mes.getKracht())
                    + " schade uit per aanval.");
        }
    }

    private void eetKoek() {
        if (!speler.heeft("koek")) {
            System.out.println("Je hebt geen koek.");
            return;
        }
        speler.verwijder("koek");
        speler.setLevenspunten(speler.getLevenspunten() + 4);
        System.out.println("Je eet een koek. +4 LP (nu "
                + speler.getLevenspunten() + ").");
    }

    private void eetMelk() {
        if (!speler.heeft("kruik melk")) {
            System.out.println("Je hebt geen kruik melk.");
            return;
        }
        speler.verwijder("kruik melk");
        speler.setLevenspunten(speler.getLevenspunten() + 6);
        System.out.println("Je drinkt van de kruik melk. +6 LP (nu "
                + speler.getLevenspunten() + ").");
    }

    // Praten: met de raaf bij de oude eik, of met het jongste geitje thuis.
    private void praat() {
        if (huidigeKamer == oudeEik) {
            if (kiezelsGeruild) {
                System.out.println("\"We hebben al zaken gedaan,\" krast de raaf.");
                return;
            }
            System.out.println("De raaf tikt met zijn snavel. \"Een koek. Geef mij "
                    + "een koek\nen ik geef jou iets gladds voor de buik van een "
                    + "wolf.\nZeg maar: geef koek.\"");
        } else if (huidigeKamer == geitenhuisje) {
            // De zoeklus in actie: we halen het jongste geitje uit de lijst op.
            Geitje jongste = zoekGeitje("jongste geitje");
            if (jongste == null) {
                System.out.println("Er is hier niemand om mee te praten.");
                return;
            }
            System.out.println("Uit " + jongste.getSchuilplaats().getNaam()
                    + " klinkt een dun stemmetje. \"Hij wreef zijn poot");
            System.out.println("wit met bloem en at krijt voor een zachte stem. Mijn");
            System.out.println("zes broertjes zitten in zijn buik. Volg het spoor naar");
            System.out.println("het zuiden, tot aan de rivier.\"");
        } else {
            System.out.println("Er is hier niemand om mee te praten.");
        }
    }

    // De ruil met de raaf: een koek voor gladde kiezels.
    private void geefKoek() {
        if (huidigeKamer != oudeEik) {
            System.out.println("Er is hier niemand die daarop wacht.");
            return;
        }
        if (kiezelsGeruild) {
            System.out.println("\"Eén volstaat. Ik let op mijn lijn.\"");
            return;
        }
        if (!speler.heeft("koek")) {
            System.out.println("Je hebt geen koek om te geven.");
            return;
        }
        speler.verwijder("koek");
        Voorwerp kiezels = new Voorwerp("gladde kiezels",
                "een handvol gladde kiezels; even goed als de stenen aan de oever");
        speler.pak(kiezels);
        kiezelsGeruild = true;
        System.out.println("\"Gevonden bij de beek. Lang verhaal.\" De raaf laat");
        System.out.println("een handvol gladde kiezels in je hand vallen.");
    }

    // Toont alles wat de speler hier kan doen. Officieel een cheatcode, dus
    // overal als laatste vermeld. Wordt opgebouwd uit de echte staat van de
    // kamer, niet hardgecodeerd.
    private void toonOpties() {
        System.out.println("Je kan hier:");

        if (huidigeKamer.getNoord() != null) {
            System.out.println("- ga noord (" + huidigeKamer.getNoord().getNaam() + ")");
        }
        if (huidigeKamer.getOost() != null) {
            System.out.println("- ga oost (" + huidigeKamer.getOost().getNaam() + ")");
        }
        if (huidigeKamer.getZuid() != null) {
            System.out.println("- ga zuid (" + huidigeKamer.getZuid().getNaam() + ")");
        }
        if (huidigeKamer.getWest() != null) {
            System.out.println("- ga west (" + huidigeKamer.getWest().getNaam() + ")");
        }

        for (Voorwerp voorwerp : huidigeKamer.getVoorwerpen()) {
            System.out.println("- pak " + voorwerp.getNaam());
        }

        if (huidigeKamer == geitenhuisje) {
            System.out.println("- praat");
        }
        if (huidigeKamer == oudeEik) {
            System.out.println("- praat");
            System.out.println("- geef koek");
        }
        if (huidigeKamer.getTegenstander() != null) {
            System.out.println("- vecht");
        }
        if (speler.heeft("koek")) {
            System.out.println("- eet koek");
        }
        if (speler.heeft("kruik melk")) {
            System.out.println("- eet melk");
        }

        System.out.println("Altijd: kijk, inventaris, stats, ?, help, stop.");
        System.out.println("(opties is een cheatcode — je gebruikt hem nu.)");
    }

    private void toonHelp() {
        System.out.println("Commando's:");
        System.out.println("  kijk            bekijk de kamer opnieuw");
        System.out.println("  ga <richting>   ga noord / oost / zuid / west");
        System.out.println("  pak <naam>      neem een voorwerp mee");
        System.out.println("  inventaris      toon wat je bij je hebt");
        System.out.println("  stats           toon je levenspunten en aanvalskracht");
        System.out.println("  eet koek        eet een koek (+4 LP)");
        System.out.println("  eet melk        drink van de kruik melk (+6 LP)");
        System.out.println("  praat           praat met wie hier is");
        System.out.println("  geef koek       geef een koek weg");
        System.out.println("  vecht           val de tegenstander hier aan");
        System.out.println("  ?               een hint voor deze plek");
        System.out.println("  help            deze lijst");
        System.out.println("  stop            stop het spel");
        System.out.println("  opties          toon alles wat hier kan (cheatcode)");
    }

    // De vier eindes. Elk toont een afsluitende tekst en stopt daarna het spel.

    // Het beste einde: schaar en stenen. De zes broertjes worden bevrijd en het
    // jongste geitje vertelt waar elk voortaan schuilt.
    private void eindeSchaarEnStenen() {
        System.out.println();
        System.out.println("Je zet grootmoeders zilveren schaar in de naad van de");
        System.out.println("buik en knipt de wolf open, netjes en snel. Eén voor één");
        System.out.println("klimmen de zes geitjes eruit, verkreukeld maar heel.");
        System.out.println("Samen vullen jullie de buik met stenen en naaien hem");
        System.out.println("dicht. Log en zwaar zakt de wolf in de rivier.");
        System.out.println("Uit de klokkast komt het jongste geitje. De familie is");
        System.out.println("weer heel.");
        bevrijdGeitjes();
        System.out.println();
        toonSchuilplaatsen();
        System.out.println();
        System.out.println("Einde: de schaar en de stenen.");
        gestopt = true;
    }

    private void eindeAfrekening() {
        System.out.println();
        System.out.println("Je maakt de wolf af. Grondig. Maar zonder iets scherps");
        System.out.println("genoeg om hem netjes open te leggen, blijven de zes");
        System.out.println("geitjes waar ze zijn — vanbinnen, in het donker. Iemand");
        System.out.println("zal ze er later uit moeten halen. Koud en onaf.");
        System.out.println();
        System.out.println("Einde: de afrekening.");
        gestopt = true;
    }

    private void eindeLes() {
        System.out.println();
        System.out.println("Je laat je mes zakken. De wolf hoest, kokhalst, en spuwt");
        System.out.println("de zes geitjes in één keer weer uit op de oever. Zonder");
        System.out.println("één woord glipt hij het bos in, en deze keer voorgoed.");
        System.out.println("Genade, en misschien wel de enige les die aankomt.");
        System.out.println();
        System.out.println("Einde: de les.");
        gestopt = true;
    }

    private void gameOver() {
        System.out.println();
        System.out.println("De wolf grijnst. Alwéér iemand die dacht dat het verhaal");
        System.out.println("een handleiding was.");
        System.out.println();
        System.out.println("Game over.");
        gestopt = true;
    }

    // Bevrijdt de zes broertjes: elk krijgt voortaan een eigen schuilplaats,
    // verspreid over de kaart — nooit meer samen op één plek. We doorlopen de
    // lijst en geven elk geitje zonder schuilplaats er een.
    private void bevrijdGeitjes() {
        Schuilplaats[] plekken = new Schuilplaats[6];
        plekken[0] = new Schuilplaats("onder de molensteen", molen);
        plekken[1] = new Schuilplaats("achter de toonbank", kruidenier);
        plekken[2] = new Schuilplaats("in het kreupelhout", bospad);
        plekken[3] = new Schuilplaats("in de holte van de eik", oudeEik);
        plekken[4] = new Schuilplaats("onder grootmoeders bed", grootmoederHuisje);
        plekken[5] = new Schuilplaats("tussen het riet", rivieroever);

        int volgende = 0;
        for (int i = 0; i < geitjes.size(); i++) {
            Geitje geitje = geitjes.get(i);
            if (geitje.getSchuilplaats() == null) {
                geitje.setSchuilplaats(plekken[volgende]);
                volgende++;
            }
            geitje.setGered(true);
        }
    }

    // De endgame-keten: voor elk geitje volgen we twee pijlen naar de naam van
    // de kamer waar het voortaan schuilt. Null-veilig, want een geitje zonder
    // schuilplaats (nog niet gevonden) heeft geen kamer om naar te wijzen.
    private void toonSchuilplaatsen() {
        System.out.println("Het jongste geitje vertelt waar elk voortaan schuilt:");
        for (int i = 0; i < geitjes.size(); i++) {
            Geitje geitje = geitjes.get(i);
            Schuilplaats schuilplaats = geitje.getSchuilplaats();
            if (schuilplaats == null) {
                System.out.println("- " + geitje.getNaam() + ": nog niet gevonden");
            } else {
                System.out.println("- " + geitje.getNaam() + ": " + schuilplaats.getNaam()
                        + " (" + schuilplaats.getKamer().getNaam() + ")");
            }
        }
    }
}
