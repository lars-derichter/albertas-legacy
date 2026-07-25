import java.util.Scanner;

// Main is het startpunt van het spel. Het toont de backstory en de titelbanner,
// bouwt het spel op en houdt de spellus draaiend: telkens een commando lezen en
// laten verwerken, tot de speler stopt of het spel eindigt.
class Main {

    public static void main(String[] args) {
        Scanner invoer = new Scanner(System.in);

        // De titelbanner in 80's-stijl.
        System.out.println("========================================");
        System.out.println("        SEVEN LITTLE GOATS");
        System.out.println("========================================");

        // De backstory, integraal getoond voor het spel begint. Het einde van
        // het vorige verhaal blijft bewust in het midden: elk van de vier eindes
        // van toen mag waar zijn.
        System.out.println();
        System.out.println("Je kent het vorige verhaal. Een rode mantel, een wolf,");
        System.out.println("grootmoeders huisje. Hoe het afliep? Daar zijn de");
        System.out.println("verhalen het niet over eens: de ene zweert bij de schaar");
        System.out.println("en de stenen, de andere bij een kille afrekening, een");
        System.out.println("derde bij genade. Laat het in het midden. De wolf van");
        System.out.println("toen is weg; dat volstaat.");
        System.out.println();
        System.out.println("Maar die wolf had een neef. Een jonge wolf, de honger");
        System.out.println("geërfd, de wijsheid niet. Hij las het oude verhaal als");
        System.out.println("een handleiding.");
        System.out.println();
        System.out.println("Gisteren wreef hij zijn poot wit met bloem uit de molen");
        System.out.println("en at krijt bij de kruidenier, tot zijn stem zo zacht");
        System.out.println("klonk als die van een moeder. De zeven geitjes deden");
        System.out.println("open. De wolf slokte er zes op.");
        System.out.println();
        System.out.println("Het jongste kroop in de klokkast en bleef er zitten. Het");
        System.out.println("riep, dun en hoog, tot iemand het hoorde. De dorpelingen");
        System.out.println("vonden het \"te gevaarlijk\", zoals altijd. Het bericht");
        System.out.println("kwam bij de enige met verstand van wolven: bij jou.");
        System.out.println();
        System.out.println("Je bent Roodkapje, intussen de dorpsexpert die je nooit");
        System.out.println("wilde zijn. Je volgt het spoor van het geitenhuisje tot");
        System.out.println("aan de rivier. Wat je daar met de wolf doet, bepaal jij.");

        Spel spel = new Spel(invoer);

        System.out.println();
        System.out.println("Typ 'kijk' om rond te kijken, '?' voor een hint, "
                + "'help' voor de commando's.");
        spel.beschrijfHuidigeKamer();

        // De spellus: lees een regel, laat het spel ze verwerken, herhaal tot
        // het spel gestopt is.
        while (!spel.isGestopt()) {
            System.out.println();
            System.out.print("> ");
            String regel = invoer.nextLine();
            spel.verwerk(regel);
        }
    }
}
