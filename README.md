# The Legacy of Alberta

Je erft de zolder van je grootmoeder Alberta. Tussen de dozen vind je haar
oude pc en een beschadigd notitieboek: de aanzet tot een spel dat ze nooit
afmaakte, **Seven Little Goats**, het vervolg op _Revenge of Red Riding
Hood_. Jij maakt het af. Elk hoofdstuk dat je herstelt, herstelt een stuk
van haar spel — en scherpt intussen precies die programmeervaardigheid aan
die je op dat moment in **Programming Fundamentals** nodig hebt.

Alberta is een eerbetoon aan Roberta Williams, medeoprichter van Sierra
On-Line en de vrouw achter _King's Quest_. Wie ze was en waarom ze hier
model staat, lees je in [`docs/roberta-williams.md`](docs/roberta-williams.md).

## Prototype-fase

Alberta bouwde elk spel eerst als tekstversie in de terminal — "zo begon ik
altijd", staat er in de kantlijn. Wat je in het spel herstelt is dus geen
grafisch spel maar een **Java-tekstspel** dat in een terminal draait. Dat is
opzet, geen beperking: het houdt de code klein genoeg om te lezen en te
herstellen, en het is exact het soort spel dat je in de cursus zelf schrijft.

De echte, draaibare Java-broncode van dat vervolg is de hoofdprijs. Ze ligt
in [`seven-little-goats/`](seven-little-goats/) — met een eigen README, klaar
om in IntelliJ te openen en te draaien. In het spel zelf zie je een
simulatie ervan; de broncode neem je mee van zolder.

## Hoe speel je het

Er valt niets te installeren en niets te compileren om het spel te spelen.

1. Open `index.html` in een recente browser. Dubbelklikken volstaat.
2. Werkt dat niet — sommige browsers behandelen `file://` streng — start dan
   een mini-webserver in deze map en surf naar het getoonde adres:

```sh
# een van beide, vanuit de projectmap
npx serve
python3 -m http.server
```

Je stapt door Alberta's zolder met de pijltjestoetsen en typt commando's,
zoals in een klassiek adventure. Op haar oude pc open je een gesimuleerde
editor en terminal waar je aan de Java-code werkt. Vast? Typ `?` voor een
hint — die komt in stappen en verklapt nooit meteen het antwoord.

## Voor wie

Voor studenten van **Programming Fundamentals** (graduaat Programmeren,
Thomas More). Het spel telt zeven levels, elk gekoppeld aan één van de zeven
scharnieren van de cursus. Samen goed voor ongeveer twee uur spelen.

Elk level opent met de regel "Dit zou je moeten kunnen na week X van de
cursus", zodat je weet of je er al aan toe bent. De koppeling level ↔
scharnier ↔ week staat volledig in
[`docs/levels-en-scharnieren.md`](docs/levels-en-scharnieren.md).

Alle code in de puzzels blijft binnen de grenzen van de cursus: geen
constructies die je nog niet gezien hebt. Concreet betekent dat onder meer
geen `switch`, geen streams of lambda's, geen `enum`, geen `var` — en
Nederlandstalige klasse- en veldnamen, zoals in de cursus.

## Projectstructuur

```
albertas-legacy/
├── index.html  css/       het spel: openen en spelen, geen server nodig
├── README.md  CLAUDE.md  .gitignore
├── package.json           dev-tooling (Playwright); het spel zelf heeft niets
├── js/                    de engine, de renderer en de spellogica
│   ├── logic/             DOM-vrij en getest: wereld, prose, levels
│   │   └── checker/       Java-tokenizer, asserts, gesimuleerde javac
│   ├── pc/                de gesimuleerde pc: editor, terminal, Parsons, sim
│   ├── levels/            de zeven levels + proefdruk level0: puzzels, hints
│   ├── sim/               Seven Little Goats als browsersimulatie
│   ├── scenes/            zolderkamers, spread-template en eindkaart
│   └── sprites/           de sprites als pixel-strings
├── seven-little-goats/    DE HOOFDPRIJS: het echte Java-spel, eigen README
│   ├── src/               één klasse per bestand, om te lezen en te draaien
│   └── test-scripts/      invoerscripts die de vier eindes aansturen
├── docs/                  de ontwerpcontracten (Nederlands, op 80 tekens)
├── walkthrough/           hints en oplossingen (deel 2 verzegeld) als .md + .pdf
├── test/                  Node --test-suites en Playwright-smoke (~25 bestanden)
├── tools/                 asset-check, scene-lint en screenshotscript (Node)
└── workflow/              verhalend logboek van het genAI-proces
```

## Walkthrough

Vastgelopen en `?` bracht geen soelaas? In [`walkthrough/`](walkthrough/)
staat een gids in twee delen: deel 1 met milde hints
([`deel1-hints.pdf`](walkthrough/deel1-hints.pdf)), deel 2 met de volledige
oplossingen ([`deel2-oplossingen.pdf`](walkthrough/deel2-oplossingen.pdf)).
Beide delen staan er ook als Markdown naast, mocht je liever in de browser
lezen.

> **VERBREEK HET ZEGEL NIET** tenzij je écht niet verder kan. Deel 2 zit
> achter een verzegelde pagina — 90's-stijl, ere-systeem. Eén repository,
> één zolder: wie te vroeg gluurt, bedriegt alleen zichzelf.

## Workflow

Deze repository is van a tot z samen met een AI-assistent (Claude) gebouwd
en dient meteen als showcase van productief werken met genAI. In
[`workflow/`](workflow/) staat een verhalend logboek van dat proces: één
genummerd bestand per grote stap, met de opdracht, de aanpak, de beslissingen
en de kwaliteitscontrole. Lees ze op volgorde om te zien hoe de zolder
gebouwd werd.
