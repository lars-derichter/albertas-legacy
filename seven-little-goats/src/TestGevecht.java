import java.util.Scanner;

// Even nakijken of het gevecht aan de rivier uitkomt. Een gevecht leest invoer,
// dus schuif ik de toetsaanslagen op voorhand in een Scanner: zo speelt het
// zichzelf af en hoef ik niet elke keer mee te typen.
class TestGevecht {

    public static void main(String[] args) {
        System.out.println("== Test Gevecht: jonge wolf afmaken ==");

        // Een speler met mantel en mes: 5 schade per aanval, 1 schade minder
        // per klap.
        Speler speler = new Speler();
        speler.pak(new Voorwerp("rode mantel", "warm"));
        speler.pak(new Voorwerp("keukenmes", "scherp", 3));

        Tegenstander wolf = new Tegenstander("jonge wolf", "groot en grijs",
                18, new int[] {3, 5, 2, 6, 4}, 5, "Vijf rondes. Wie rekent, wint.");

        // Drie keer uithalen brengt de wolf van 18 naar 3; dan smeekt hij, en
        // gaat hij toch tegen de vlakte. Resultaat hoort 1 te zijn.
        String script = "val aan\nval aan\nval aan\nmaak af\n";
        Scanner gescript = new Scanner(script);

        Gevecht gevecht = new Gevecht(speler, wolf, gescript);
        int resultaat = gevecht.voer();

        System.out.println();
        System.out.println("resultaat (1 = verslagen): " + resultaat);
        System.out.println("wolf-LP   (0)            : " + wolf.getLevenspunten());
    }
}
