// checker-corpus/index.mjs — de WP 4-corpus (checker-contract.md §"De test-
// corpus"). Per scharnier-anker een fragment met:
//   - de MODELOPLOSSING (verbatim uit seven-little-goats/src/), plus geldige
//     varianten (opmaak, lokale namen, gelijkwaardige vorm) die MOETEN slagen;
//   - typische studentfouten die MOETEN falen met de bedoelde melding
//     (assertie-meldingKey) of gesimuleerde javac-diagnose (categorie).
//
// De level-WP's (7–8) BREIDEN deze lijst uit: elke nieuw ontdekte vals-negatief
// of gemiste fout wordt hier een testcase. Structuur bewust generiek zodat de
// corpus-runner (test/test-checker-corpus.mjs) elk fragment uniform draait.
//
// Elk fragment:
//   { id, scharnier, bron,
//     checks:  [ { fn, config } ]                 // de assertie-pijplijn (in volgorde)
//     passen:  [ { naam, code } ]                 // MOETEN javac-schoon + alle checks ok
//     falen:   [ { naam, code, verwacht } ]       // verwacht:
//              { laag:"javac",  categorie:"..." } // laag-1: gesimuleerde javac
//            | { laag:"assert", meldingKey:"..." }// laag-2: eerste falende assertie
//   }
//
// De eerste pass-case is telkens de verbatim modeloplossing (naam "model").
// De faal-cases zijn afgeleid van het model met één gerichte wijziging, zodat
// het model de bron van waarheid blijft.

// ===========================================================================
// Scharnier 1a — Voorwerp: velden + constructor (this.x = x)
// ===========================================================================
const voorwerpModel = `class Voorwerp {

    private String naam;
    private String beschrijving;
    private int kracht;

    Voorwerp(String naam, String beschrijving) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = 0;
    }

    Voorwerp(String naam, String beschrijving, int kracht) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = kracht;
    }

    String getNaam() {
        return naam;
    }

    int getKracht() {
        return kracht;
    }
}`;

const voorwerp = {
  id: "s1-voorwerp-constructor",
  scharnier: 1,
  bron: "Voorwerp.java",
  checks: [
    { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true } },
    { fn: "constructorToewijzing", config: { veld: "naam", param: "naam" } },
    { fn: "constructorToewijzing", config: { veld: "beschrijving" } },
    { fn: "constructorToewijzing", config: { veld: "kracht" } }
  ],
  passen: [
    { naam: "model", code: voorwerpModel },
    { naam: "compacte-opmaak",
      code: `class Voorwerp { private String naam; private String beschrijving; private int kracht;
Voorwerp(String naam,String beschrijving){this.naam=naam;this.beschrijving=beschrijving;this.kracht=0;}
Voorwerp(String naam,String beschrijving,int kracht){this.naam=naam;this.beschrijving=beschrijving;this.kracht=kracht;}
String getNaam(){return naam;} int getKracht(){return kracht;} }` },
    { naam: "andere-parameternamen",
      code: `class Voorwerp {
    private String naam;
    private String beschrijving;
    private int kracht;
    Voorwerp(String n, String b) {
        this.naam = n;
        this.beschrijving = b;
        this.kracht = 0;
    }
}` },
    { naam: "commentaar-weg-en-final",
      code: `class Voorwerp {
    private final String naam;
    private String beschrijving;
    private int kracht;
    Voorwerp(String naam, String beschrijving, int kracht) {
        this.naam = naam;
        this.beschrijving = beschrijving;
        this.kracht = kracht;
    }
}` }
  ],
  falen: [
    { naam: "this-vergeten",
      code: voorwerpModel.replaceAll("this.naam = naam;", "naam = naam;"),
      verwacht: { laag: "assert", meldingKey: "constructorToewijzing.ontbreekt" } },
    { naam: "toewijzing-omgekeerd",
      code: voorwerpModel.replaceAll("this.naam = naam;", "naam = this.naam;"),
      verwacht: { laag: "assert", meldingKey: "constructorToewijzing.omgekeerd" } },
    { naam: "beschrijving-niet-toegewezen",
      code: voorwerpModel.replace(/        this\.beschrijving = beschrijving;\n/g, ""),
      verwacht: { laag: "assert", meldingKey: "constructorToewijzing.ontbreekt" } },
    { naam: "puntkomma-vergeten",
      code: voorwerpModel.replace("this.naam = naam;\n        this.beschrijving = beschrijving;",
                                  "this.naam = naam\n        this.beschrijving = beschrijving;"),
      verwacht: { laag: "javac", categorie: "puntkomma" } }
  ]
};

// ===========================================================================
// Scharnier 1b — Geitje: klasse uit de notities schrijven
// ===========================================================================
const geitjeModel = `class Geitje {

    private String naam;
    private Schuilplaats schuilplaats;
    private boolean gered;

    Geitje(String naam, Schuilplaats schuilplaats) {
        this.naam = naam;
        this.schuilplaats = schuilplaats;
        this.gered = false;
    }

    String getNaam() {
        return naam;
    }

    Schuilplaats getSchuilplaats() {
        return schuilplaats;
    }
}`;

const geitje = {
  id: "s1-geitje-klasse",
  scharnier: 1,
  bron: "Geitje.java",
  checks: [
    { fn: "veldDeclaratie", config: { type: "String", naam: "naam", privaat: true } },
    { fn: "veldDeclaratie", config: { type: "Schuilplaats", naam: "schuilplaats", privaat: true } },
    { fn: "constructorToewijzing", config: { veld: "schuilplaats" } },
    { fn: "heeftReturn", config: { methode: "getSchuilplaats", retourVorm: "schuilplaats" } }
  ],
  passen: [
    { naam: "model", code: geitjeModel },
    { naam: "compacte-opmaak",
      code: `class Geitje { private String naam; private Schuilplaats schuilplaats; private boolean gered;
Geitje(String naam,Schuilplaats schuilplaats){this.naam=naam;this.schuilplaats=schuilplaats;this.gered=false;}
String getNaam(){return naam;} Schuilplaats getSchuilplaats(){return schuilplaats;} }` },
    { naam: "andere-parameternaam",
      code: geitjeModel.replace("Geitje(String naam, Schuilplaats schuilplaats)",
                                "Geitje(String naam, Schuilplaats plek)")
                       .replace("this.schuilplaats = schuilplaats;", "this.schuilplaats = plek;") },
    { naam: "velden-onderaan",
      code: `class Geitje {
    Geitje(String naam, Schuilplaats schuilplaats) {
        this.naam = naam;
        this.schuilplaats = schuilplaats;
        this.gered = false;
    }
    Schuilplaats getSchuilplaats() {
        return schuilplaats;
    }
    private String naam;
    private Schuilplaats schuilplaats;
    private boolean gered;
}` }
  ],
  falen: [
    { naam: "veld-niet-private",
      code: geitjeModel.replace("private String naam;", "String naam;"),
      verwacht: { laag: "assert", meldingKey: "veldDeclaratie.nietPrivate" } },
    { naam: "schuilplaats-this-vergeten",
      code: geitjeModel.replace("this.schuilplaats = schuilplaats;", "schuilplaats = schuilplaats;"),
      verwacht: { laag: "assert", meldingKey: "constructorToewijzing.ontbreekt" } },
    { naam: "getter-geeft-verkeerd-veld",
      code: geitjeModel.replace("Schuilplaats getSchuilplaats() {\n        return schuilplaats;",
                                "Schuilplaats getSchuilplaats() {\n        return naam;"),
      verwacht: { laag: "assert", meldingKey: "heeftReturn.verkeerdeVorm" } },
    { naam: "puntkomma-vergeten",
      code: geitjeModel.replace("this.gered = false;", "this.gered = false"),
      verwacht: { laag: "javac", categorie: "puntkomma" } }
  ]
};

// ===========================================================================
// Scharnier 2 — Speler: signaturen (return vs void, parametertypes)
// ===========================================================================
const spelerModel = `import java.util.ArrayList;

class Speler {

    private final int MAX_LEVENSPUNTEN = 20;
    private int levenspunten;
    private ArrayList<Voorwerp> inventaris;

    Speler() {
        this.levenspunten = 20;
        this.inventaris = new ArrayList<Voorwerp>();
    }

    int getLevenspunten() {
        return levenspunten;
    }

    void setLevenspunten(int nieuweWaarde) {
        if (nieuweWaarde < 0) {
            nieuweWaarde = 0;
        }
        if (nieuweWaarde > MAX_LEVENSPUNTEN) {
            nieuweWaarde = MAX_LEVENSPUNTEN;
        }
        this.levenspunten = nieuweWaarde;
    }

    Voorwerp zoek(String gezochteNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            Voorwerp huidig = inventaris.get(i);
            if (huidig.getNaam().equals(gezochteNaam)) {
                return huidig;
            }
        }
        return null;
    }

    boolean verwijder(String teVerwijderenNaam) {
        for (int i = 0; i < inventaris.size(); i++) {
            if (inventaris.get(i).getNaam().equals(teVerwijderenNaam)) {
                inventaris.remove(i);
                return true;
            }
        }
        return false;
    }
}`;

const speler = {
  id: "s2-speler-signaturen",
  scharnier: 2,
  bron: "Speler.java",
  checks: [
    { fn: "methodeSignatuur", config: { retour: "int", naam: "getLevenspunten", params: [] } },
    { fn: "methodeSignatuur", config: { retour: "void", naam: "setLevenspunten", params: ["int"] } },
    { fn: "methodeSignatuur", config: { retour: "Voorwerp", naam: "zoek", params: ["String"] } },
    { fn: "methodeSignatuur", config: { retour: "boolean", naam: "verwijder", params: ["String"] } },
    { fn: "heeftReturn", config: { methode: "zoek" } }
  ],
  passen: [
    { naam: "model", code: spelerModel },
    { naam: "andere-lokale-namen",
      code: spelerModel.replace(/gezochteNaam/g, "z").replace(/huidig/g, "v")
                       .replace(/teVerwijderenNaam/g, "w").replace(/nieuweWaarde/g, "n") },
    { naam: "compacte-signaturen",
      code: spelerModel.replace("int getLevenspunten() {\n        return levenspunten;\n    }",
                                "int getLevenspunten(){ return levenspunten; }") },
    { naam: "extra-spaties",
      code: spelerModel.replace("Voorwerp zoek(String gezochteNaam)",
                                "Voorwerp   zoek( String gezochteNaam )") }
  ],
  falen: [
    { naam: "getter-return-void",
      code: spelerModel.replace("int getLevenspunten()", "void getLevenspunten()"),
      verwacht: { laag: "assert", meldingKey: "methodeSignatuur.verkeerdRetour" } },
    { naam: "setter-parameter-weg",
      code: spelerModel.replace("void setLevenspunten(int nieuweWaarde)", "void setLevenspunten()"),
      verwacht: { laag: "assert", meldingKey: "methodeSignatuur.verkeerdeParams" } },
    { naam: "zoek-mist-return",
      code: spelerModel.replace("                return huidig;\n", "").replace("        return null;\n", ""),
      verwacht: { laag: "assert", meldingKey: "heeftReturn.ontbreekt" } },
    { naam: "verwijder-verkeerd-retourtype",
      code: spelerModel.replace("boolean verwijder(String teVerwijderenNaam)", "void verwijder(String teVerwijderenNaam)"),
      verwacht: { laag: "assert", meldingKey: "methodeSignatuur.verkeerdRetour" } }
  ]
};

// ===========================================================================
// Scharnier 3 — Speler.setLevenspunten: de klemmende validatie
// ===========================================================================
const klemModel = `void setLevenspunten(int nieuweWaarde) {
    if (nieuweWaarde < 0) {
        nieuweWaarde = 0;
    }
    if (nieuweWaarde > MAX_LEVENSPUNTEN) {
        nieuweWaarde = MAX_LEVENSPUNTEN;
    }
    this.levenspunten = nieuweWaarde;
}`;

const klem = {
  id: "s3-setlevenspunten-clamp",
  scharnier: 3,
  bron: "Speler.java",
  checks: [
    { fn: "geenVerbodenConstructies", config: { methode: "setLevenspunten" } },
    { fn: "methodeSignatuur", config: { retour: "void", naam: "setLevenspunten", params: ["int"] } },
    { fn: "validatieKlem", config: { methode: "setLevenspunten", onder: "0", boven: ["MAX_LEVENSPUNTEN", "20"] } }
  ],
  passen: [
    { naam: "model", code: klemModel },
    { naam: "zonder-accolades",
      code: `void setLevenspunten(int nieuweWaarde) {
    if (nieuweWaarde < 0) nieuweWaarde = 0;
    if (nieuweWaarde > MAX_LEVENSPUNTEN) nieuweWaarde = MAX_LEVENSPUNTEN;
    this.levenspunten = nieuweWaarde;
}` },
    { naam: "literal-bovengrens",
      code: klemModel.replace(/MAX_LEVENSPUNTEN/g, "20") },
    { naam: "andere-parameternaam",
      code: klemModel.replace(/nieuweWaarde/g, "waarde") }
  ],
  falen: [
    { naam: "ondergrens-verkeerde-richting",
      code: klemModel.replace("if (nieuweWaarde < 0)", "if (nieuweWaarde > 0)"),
      verwacht: { laag: "assert", meldingKey: "validatieKlem.verkeerdeRichting" } },
    { naam: "bovengrens-mist",
      code: klemModel.replace(/    if \(nieuweWaarde > MAX_LEVENSPUNTEN\) \{\n        nieuweWaarde = MAX_LEVENSPUNTEN;\n    \}\n/, ""),
      verwacht: { laag: "assert", meldingKey: "validatieKlem.onvolledig" } },
    { naam: "bovengrens-verkeerde-waarde",
      code: klemModel.replace("if (nieuweWaarde > MAX_LEVENSPUNTEN) {\n        nieuweWaarde = MAX_LEVENSPUNTEN;",
                              "if (nieuweWaarde > 100) {\n        nieuweWaarde = 100;"),
      verwacht: { laag: "assert", meldingKey: "validatieKlem.onvolledig" } },
    { naam: "ternary-buiten-cursus",
      code: `void setLevenspunten(int nieuweWaarde) {
    nieuweWaarde = nieuweWaarde < 0 ? 0 : nieuweWaarde;
    this.levenspunten = nieuweWaarde;
}`,
      verwacht: { laag: "assert", meldingKey: "verboden.ternary" } },
    { naam: "puntkomma-vergeten",
      code: klemModel.replace("this.levenspunten = nieuweWaarde;", "this.levenspunten = nieuweWaarde"),
      verwacht: { laag: "javac", categorie: "puntkomma" } }
  ]
};

// ===========================================================================
// Scharnier 4 — Spel.verbindKamers: buur-bedrading (twee pijlen, cascade)
// ===========================================================================
const verbindModel = `private void verbindKamers(Kamer eerste, String richting, Kamer tweede) {
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
}`;

const verbind = {
  id: "s4-verbindkamers-bedrading",
  scharnier: 4,
  bron: "Spel.java",
  checks: [
    { fn: "conditieGebruikt", config: { methode: "verbindKamers", structuur: "cascade" } },
    { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setNoord" } },
    { fn: "methodeAanroep", config: { methode: "verbindKamers", naam: "setZuid" } }
  ],
  passen: [
    { naam: "model", code: verbindModel },
    { naam: "andere-parameternamen",
      code: verbindModel.replace(/eerste/g, "a").replace(/tweede/g, "b").replace(/richting/g, "r") },
    { naam: "compacte-opmaak",
      code: verbindModel.replace(/\n        /g, " ").replace(/\n    /g, " ") },
    { naam: "andere-tak-volgorde",
      code: `private void verbindKamers(Kamer eerste, String richting, Kamer tweede) {
    if (richting.equals("zuid")) {
        eerste.setZuid(tweede);
        tweede.setNoord(eerste);
    } else if (richting.equals("noord")) {
        eerste.setNoord(tweede);
        tweede.setZuid(eerste);
    }
}` }
  ],
  falen: [
    { naam: "geen-cascade",
      code: `private void verbindKamers(Kamer eerste, String richting, Kamer tweede) {
    if (richting.equals("noord")) {
        eerste.setNoord(tweede);
        tweede.setZuid(eerste);
    }
}`,
      verwacht: { laag: "assert", meldingKey: "conditie.operatorOntbreekt" } },
    { naam: "copy-paste-overal-setnoord",
      code: verbindModel.replaceAll("setZuid", "setNoord"),
      verwacht: { laag: "assert", meldingKey: "methodeAanroep.ontbreekt" } },
    { naam: "getter-in-plaats-van-setter",
      code: verbindModel.replace(/setNoord/g, "getNoord"),
      verwacht: { laag: "assert", meldingKey: "methodeAanroep.ontbreekt" } },
    { naam: "haakje-teveel",
      code: verbindModel.replace('richting.equals("noord")', 'richting.equals("noord"))'),
      verwacht: { laag: "javac", categorie: "haakje" } }
  ]
};

// ===========================================================================
// Scharnier 6 — Kamer.verwijderVoorwerp: de lus + off-by-one
// ===========================================================================
const verwijderModel = `void verwijderVoorwerp(String teVerwijderenNaam) {
    for (int i = 0; i < voorwerpen.size(); i++) {
        if (voorwerpen.get(i).getNaam().equals(teVerwijderenNaam)) {
            voorwerpen.remove(i);
            return;
        }
    }
}`;

const verwijder = {
  id: "s6-verwijdervoorwerp-lus",
  scharnier: 6,
  bron: "Kamer.java",
  checks: [
    { fn: "lusVorm", config: { methode: "verwijderVoorwerp", soort: "for" } },
    { fn: "lusGrenzen", config: { methode: "verwijderVoorwerp", vergelijk: "<", grensBevat: "size" } },
    { fn: "methodeAanroep", config: { methode: "verwijderVoorwerp", naam: "remove" } }
  ],
  passen: [
    { naam: "model", code: verwijderModel },
    { naam: "andere-index-naam",
      code: verwijderModel.replace(/\bi\b/g, "teller") },
    { naam: "compacte-opmaak",
      code: verwijderModel.replace(/\n        /g, " ").replace(/\n    /g, " ") },
    { naam: "andere-parameternaam",
      code: verwijderModel.replace(/teVerwijderenNaam/g, "naam") }
  ],
  falen: [
    { naam: "off-by-one",
      code: verwijderModel.replace("i < voorwerpen.size()", "i <= voorwerpen.size()"),
      verwacht: { laag: "assert", meldingKey: "lusGrenzen.offByOne" } },
    { naam: "while-in-plaats-van-for",
      code: `void verwijderVoorwerp(String teVerwijderenNaam) {
    int i = 0;
    while (i < voorwerpen.size()) {
        if (voorwerpen.get(i).getNaam().equals(teVerwijderenNaam)) {
            voorwerpen.remove(i);
            return;
        }
        i++;
    }
}`,
      verwacht: { laag: "assert", meldingKey: "lusVorm.verkeerdeSoort" } },
    { naam: "remove-vergeten",
      code: verwijderModel.replace("            voorwerpen.remove(i);\n", ""),
      verwacht: { laag: "assert", meldingKey: "methodeAanroep.ontbreekt" } },
    { naam: "puntkomma-vergeten",
      code: verwijderModel.replace("voorwerpen.remove(i);", "voorwerpen.remove(i)"),
      verwacht: { laag: "javac", categorie: "puntkomma" } }
  ]
};

// ===========================================================================
// Scharnier 7a — Spel.zoekGeitje: de zoeklus (geeft object of null)
// ===========================================================================
const zoekModel = `Geitje zoekGeitje(String gezochteNaam) {
    for (int i = 0; i < geitjes.size(); i++) {
        Geitje huidig = geitjes.get(i);
        if (huidig.getNaam().equals(gezochteNaam)) {
            return huidig;
        }
    }
    return null;
}`;

const zoek = {
  id: "s7-zoekgeitje-zoeklus",
  scharnier: 7,
  bron: "Spel.java",
  checks: [
    { fn: "lusVorm", config: { methode: "zoekGeitje", soort: "for" } },
    { fn: "lusGrenzen", config: { methode: "zoekGeitje", vergelijk: "<", grensBevat: "size" } },
    { fn: "methodeSignatuur", config: { retour: "Geitje", naam: "zoekGeitje", params: ["String"] } },
    { fn: "heeftReturn", config: { methode: "zoekGeitje", retourVorm: "null" } }
  ],
  passen: [
    { naam: "model", code: zoekModel },
    { naam: "andere-lokale-namen",
      code: zoekModel.replace(/huidig/g, "g").replace(/gezochteNaam/g, "naam") },
    { naam: "compacte-opmaak",
      code: zoekModel.replace(/\n        /g, " ").replace(/\n    /g, " ") },
    { naam: "index-variabele-anders",
      code: zoekModel.replace(/\bi\b/g, "index") }
  ],
  falen: [
    { naam: "off-by-one",
      code: zoekModel.replace("i < geitjes.size()", "i <= geitjes.size()"),
      verwacht: { laag: "assert", meldingKey: "lusGrenzen.offByOne" } },
    { naam: "while-in-plaats-van-for",
      code: `Geitje zoekGeitje(String gezochteNaam) {
    int i = 0;
    while (i < geitjes.size()) {
        Geitje huidig = geitjes.get(i);
        if (huidig.getNaam().equals(gezochteNaam)) {
            return huidig;
        }
        i++;
    }
    return null;
}`,
      verwacht: { laag: "assert", meldingKey: "lusVorm.verkeerdeSoort" } },
    { naam: "return-null-vergeten",
      code: zoekModel.replace("    }\n    return null;\n}", "    }\n}"),
      verwacht: { laag: "assert", meldingKey: "heeftReturn.verkeerdeVorm" } },
    { naam: "verkeerd-retourtype",
      code: zoekModel.replace("Geitje zoekGeitje(String gezochteNaam)", "String zoekGeitje(String gezochteNaam)"),
      verwacht: { laag: "assert", meldingKey: "methodeSignatuur.verkeerdRetour" } }
  ]
};

// ===========================================================================
// Scharnier 7b — Spel.toonSchuilplaatsen: de null-veilige getter-keten
// ===========================================================================
const ketenModel = `private void toonSchuilplaatsen() {
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
}`;

const keten = {
  id: "s7-toonschuilplaatsen-keten",
  scharnier: 7,
  bron: "Spel.java",
  checks: [
    { fn: "aanroepKeten", config: { methode: "toonSchuilplaatsen",
        stappen: ["getSchuilplaats", "getKamer", "getNaam"], nullVeilig: true } },
    { fn: "lusVorm", config: { methode: "toonSchuilplaatsen", soort: "for" } }
  ],
  passen: [
    { naam: "model", code: ketenModel },
    { naam: "andere-lokale-naam",
      code: ketenModel.replace(/schuilplaats/g, "plek").replace(/Schuilplaats plek/g, "Schuilplaats plek") },
    { naam: "guard-met-ongelijk",
      code: `private void toonSchuilplaatsen() {
    for (int i = 0; i < geitjes.size(); i++) {
        Geitje geitje = geitjes.get(i);
        Schuilplaats schuilplaats = geitje.getSchuilplaats();
        if (schuilplaats != null) {
            System.out.println(schuilplaats.getKamer().getNaam());
        }
    }
}` },
    { naam: "compacte-opmaak",
      code: `private void toonSchuilplaatsen() {
    for (int i = 0; i < geitjes.size(); i++) {
        Geitje geitje = geitjes.get(i);
        Schuilplaats schuilplaats = geitje.getSchuilplaats();
        if (schuilplaats == null) { continue; }
        System.out.println(schuilplaats.getKamer().getNaam());
    }
}` }
  ],
  falen: [
    { naam: "null-check-vergeten",
      code: `private void toonSchuilplaatsen() {
    for (int i = 0; i < geitjes.size(); i++) {
        Geitje geitje = geitjes.get(i);
        System.out.println(geitje.getSchuilplaats().getKamer().getNaam());
    }
}`,
      verwacht: { laag: "assert", meldingKey: "aanroepKeten.nullCheckOntbreekt" } },
    { naam: "keten-onvolledig",
      code: `private void toonSchuilplaatsen() {
    for (int i = 0; i < geitjes.size(); i++) {
        Geitje geitje = geitjes.get(i);
        Schuilplaats schuilplaats = geitje.getSchuilplaats();
        if (schuilplaats == null) { continue; }
        System.out.println(schuilplaats.getNaam());
    }
}`,
      verwacht: { laag: "assert", meldingKey: "aanroepKeten.onvolledig" } },
    { naam: "while-in-plaats-van-for",
      code: `private void toonSchuilplaatsen() {
    int i = 0;
    while (i < geitjes.size()) {
        Geitje geitje = geitjes.get(i);
        Schuilplaats schuilplaats = geitje.getSchuilplaats();
        if (schuilplaats == null) { i++; continue; }
        System.out.println(schuilplaats.getKamer().getNaam());
        i++;
    }
}`,
      verwacht: { laag: "assert", meldingKey: "lusVorm.verkeerdeSoort" } },
    { naam: "accolade-niet-gesloten",
      code: ketenModel.replace("    }\n}", "    }"),
      verwacht: { laag: "javac", categorie: "accolade" } }
  ]
};

export const fragmenten = [
  voorwerp, geitje, speler, klem, verbind, verwijder, zoek, keten
];

export default fragmenten;
