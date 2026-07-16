# Test-scripts — commando-scripts voor de vier eindes

Elk `.txt`-bestand is een reeks commando's, één per regel, die je via
gepijpte invoer in het spel voert. Zo speelt het spel zichzelf tot aan een
van de vier eindes — handig om snel te controleren of alle eindes nog
werken (en straks om de JS-simulatie transcript-voor-transcript tegen de Java
te leggen).

## Gebruik

Compileer eerst, draai dan met de invoer uit een script:

```sh
# vanuit seven-little-goats/
javac -d out src/*.java
java -cp out Main < test-scripts/einde-les.txt
```

## De vier scripts

| Script | Bereikt einde |
|---|---|
| `einde-schaar-en-stenen.txt` | de schaar en de stenen (het beste einde) |
| `einde-afrekening.txt` | de afrekening (wolf verslagen, geen schaar/stenen) |
| `einde-les.txt` | de les (de wolf gespaard) |
| `einde-gameover.txt` | game over (de speler verslagen) |

De invoer is deterministisch: het aanvalspatroon van de wolf ligt vast, dus
dezelfde commando's leiden altijd tot hetzelfde einde.
