# Save en hints

Het contract voor persistentie, herbegin, deterministische QA, en het
hint-systeem met Alberta's oordeel. WP 3 (save + variatie + hint-service) en de
level-WP's bouwen hiertegen. De staat-vorm staat in `engine-architectuur.md`
(§"De staat"); dit document legt vast hoe die staat wordt bewaard, teruggezet en
gevarieerd, en hoe de hints en het eindoordeel werken.

## localStorage-save

- **Sleutel:** `albertas-legacy/save`. Eén sleutel, één spelstaat.
- **Waarde:** het staat-object uit `engine-architectuur.md`, door
  `JSON.stringify` geserialiseerd. De staat is plat en cyclusvrij, dus dit
  round-tript zonder verlies.
- **Wanneer geschreven:** na elke echte voortgang — een puzzel opgelost,
  een level af, een editor-concept gewijzigd, geluid getoggeld. Elke schrijf
  zendt de effect-tag `voortgang:opgeslagen` (zie `engine-architectuur.md`).
- **Wanneer gelezen:** bij de start leest `js/engine.js` de sleutel. Bestaat
  ze en is de versie leesbaar, dan wordt ze teruggeladen; anders start een verse
  staat via `AL.world.nieuw(seed)`.
- **Draagt tussen sessies:** de seed, de level- en puzzelvoortgang, de
  hint-tellers en de **concepten** (`puzzels[*].draft`), zodat halfaf werk
  bewaard blijft. De sim-substaat (`modus === "sim"`) wordt niet bewaard: de
  simulatie is een eindstuk, geen doorlopende voortgang.

### Versionering en migratie

De staat draagt een `versie`-veld (nu `1`). Bij het laden vergelijkt de engine
de opgeslagen `versie` met de huidige:

- **Gelijk:** direct laden.
- **Ouder:** een migratiefunctie tilt de oude staat op naar het huidige schema
  (velden toevoegen met verstandige defaults, hernoemingen afhandelen), verhoogt
  de `versie`, en schrijft terug. Migraties zijn additief en verliesvrij waar
  mogelijk.
- **Nieuwer of onleesbaar** (corrupte JSON, onbekende hogere versie): de save
  wordt verworpen en een verse staat gestart. Verwerpen mag nooit crashen — een
  kapotte save kost hooguit voortgang, nooit een onspeelbaar spel.

`versie` verhoogt alleen bij een breking van het staat-schema; kleine
contentwijzigingen (nieuwe prose, nieuwe puzzelvarianten) breken de save niet.

## `herbegin`

Het in-game commando `herbegin` (beschikbaar in de zolder-modus, zie
`spelontwerp-legacy.md`) zet het spel terug naar de begintoestand:

- Het wist de localStorage-sleutel `albertas-legacy/save`.
- Het maakt een verse staat via `AL.world.nieuw(seed)`. De **seed blijft
  behouden** als de speler via `?seed=N` speelde (zodat een QA-run herhaalbaar
  herbegint); zonder expliciete seed wordt een nieuwe gegenereerd.
- Het brengt de speler terug naar de titelkaart of de eerste zolderscène.
- Effect-tag: `herbegin`.

`herbegin` vraagt om een bevestiging (het gooit voortgang weg). Er is geen
gedeeltelijke reset; het is alles of niets. Een enkel level opnieuw doen gebeurt
niet via `herbegin` maar door de puzzel opnieuw te openen (de checker beoordeelt
elke inzending vers).

## `?seed=N` — deterministische QA

De URL-parameter `?seed=N` (geheel getal) forceert de RNG-seed. De seed voedt de
zaadgestuurde variatie zodat een playthrough exact reproduceerbaar is — nodig
voor de Playwright-playthroughs (WP 5, 7–9) en de getimede dry run (WP 11).

Wat de seed determineert:

- **Welke beschadigde variant** een herstel-puzzel toont (twee varianten per
  herstel-puzzel, zie het plan).
- **De Parsons-shuffle** (de beginvolgorde van de stroken).
- **De trace-waarden** die uit een pool gekozen worden (voorspel-de-output).

Zonder `?seed=N` genereert het spel bij een verse start een seed (bv. uit
`Date.now()`) en bewaart die in de staat, zodat een gewone speler ook een
consistente, herhaalbare wereld in zijn save. Met `?seed=N` overschrijft
de parameter altijd de opgeslagen seed en start effectief een deterministische
run (in combinatie met `herbegin` voor een schone lei).

De variatie is puur cosmetisch/positioneel: dezelfde scharnier, dezelfde
leerdoelen, dezelfde asserties — alleen de oppervlaktevorm wisselt. Twee spelers
met verschillende seeds leren hetzelfde; ze zien alleen niet exact dezelfde
beschadiging of dezelfde getallen.

## Het hint-contract

`?` werkt overal (de predecessor-conventie). Binnen een puzzel geeft `?`
een hint in **drie stadia**, oplopend, en **nooit het letterlijke antwoord**. De
tellerstand per puzzel staat in `puzzels[*].hints`; de som over alles in
`hintsTotaal` (voedt Alberta's oordeel).

De drie stadia per puzzel:

1. **Metafoor-duw.** Herhaalt de scharnier-metafoor uit de cursus (zie de
   woordenschat in `levels-en-scharnieren.md`): "Denk aan de blauwdruk en de
   doos", "Twee pijlen, één doos", "Welke patroonkaart?", "Eén plank te
   ver en je ligt in het water." Geen verwijzing naar de concrete code — alleen
   het mentale model.
2. **Lokalisatie.** Wijst de plek aan waar het misgaat, zonder de fix te geven:
   "Kijk naar de toewijzing in de constructor", "De lusgrens klopt niet",
   "Er ontbreekt een null-controle vóór de tweede pijl."
3. **Structurele vorm.** Geeft de vorm, met plaatshouders, nooit de ingevulde
   oplossing: `this.<veld> = <parameter>;`, `for (int i = 0; i < lijst.size();
   i++)`, `if (x < ondergrens) { x = ondergrens; }`. De speler moet nog de
   echte namen en waarden invullen.

Een vierde `?` geeft geen nieuwe hint: `hint:geen-meer` (zie de effect-tags),
met een zachte aanmoediging in Alberta's stem, eventueel een verwijzing naar de
walkthrough (`walkthrough/deel1-hints.md`) — nooit het antwoord in het spel.

Regels:

- Elke hint-tekst leeft in `js/logic/strings.js`, niet inline. De hint-service
  (`AL.levels` of een aparte service) kiest het stadium op basis van de teller.
- Hints zijn **gratis en niet-bestraffend** in de speelbaarheid: ze blokkeren
  niets en verlagen geen score. Ze worden alleen geteld, voor de speelse
  terugblik op het einde.
- Stap 1 hergebruikt bewust de exacte metafoor-taal van de cursus, zodat de hint
  het mentale model versterkt dat in de les is opgebouwd — de didactische kern
  van het hele spel.

## Alberta's oordeel — verdict-tiers

Op het einde (na level 7 en de sim) toont het spel **Alberta's oordeel**: een
warme terugblik in Alberta's droge stem, gebaseerd op `hintsTotaal`. Het
is nadrukkelijk **niet-bestraffend**: geen cijfer, geen buis, geen faalstatus —
alleen een grootmoeder die commentaar geeft zoals ze je code becommentarieerd
zou hebben. Effect-tag: `oordeel:<tier>`.

> Beslissing: het oordeel hangt aan het totale hint-gebruik, niet aan fouten of
> tijd. Fouten maken hoort bij leren en mag nooit bestraft worden; hints vragen
> is gezond maar zegt iets over hoe zelfstandig de speler werkte. De drempels
> hieronder zijn richtwaarden voor ~21 puzzels (7 levels × 3); een level-worker
> mag ze bijstellen als het puzzelaantal wijzigt, mits de vier tiers en de
> toon behouden blijven.

| Tier (`<tier>`) | Hints totaal | Toon van Alberta |
|---|---|---|
| `meesterhand` | 0–3 | "Je hebt mijn spel afgemaakt met bijna geen spieken. Ik had het niet beter gekund — en dat zeg ik niet snel." |
| `vakvrouw` | 4–10 | "Nu en dan een blik in de kantlijn, en dan weer dóór. Zo werk ik ook. Proficiat." |
| `doorzetter` | 11–20 | "Je hebt vaak om hulp gevraagd en telkens weer verder gewerkt. Dat is geen zwakte — dat is hoe je het leert." |
| `samen-geraakt` | 21+ | "We hebben dit samen gedaan, jij en ik en een hoop hints. En weet je? Het spel draait. Dat is wat telt." |

Alle vier de tiers zijn positief; het verschil is de knipoog, niet de waarde.
Het oordeel sluit af richting de epiloog (`epiloog`), die naar de echte broncode
in `seven-little-goats/` wijst. De volledige oordeel-teksten leven in
`js/logic/strings.js`, in Alberta's stem (zie `achtergrond.md`, §"Toon en
register").
