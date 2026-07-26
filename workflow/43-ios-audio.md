# 43 — iOS-audio: het gebaar, de primer en de belschakelaar

## Opdracht

WP 43 uit de fixronde (zie `workflow/41-fixronde-kickoff.md`, §wortels
item 2 en §Bijlage WP 43). Uit Lars' speeltest op iOS, verbatim:

> Still no audible sound (ios).

Dat is de tweede keer: WP 37 verbreedde de ontgrendeling al van "alleen
het toetsenbord" naar vier oppervlakken, en op een desktop en in Chromium
werkte dat. Op een iPhone bleef het stil. De verkenning van WP 41 wees
drie onafhankelijke oorzaken aan; ze zijn hier alle drie aangepakt, want
elk van de drie is op zich genoeg om een iPhone stil te houden. Een
Opus 5-worker voerde uit; de manager controleert en commit.

## Aanpak

- **Het gebaar** (`js/input.js`). De unlock-set stond op `pointerdown`,
  `touchstart` en `keydown`. Safari rekent voor audio niet op het begin
  van de aanraking maar op het einde, dus `pointerup`, `touchend` en
  `click` staan er nu bij — alle vijf op het venster in de capture-fase,
  plus de `keydown` in de handler zelf. Zes oppervlakken; `unlock()` is
  idempotent, dus overlap kost niets en één ontbrekend oppervlak kost al
  het geluid.
- **De stille primer** (`js/sound.js`, `primer()`). Eén
  `createBuffer(1, 1, 22050)` door een `BufferSource` naar de uitgang,
  ín het gebaar. Dat is de kanonieke iOS-truc: een kale `resume()` glipt
  op sommige versies door zonder de context op `running` te zetten, één
  buffer die daadwerkelijk speelt niet. Hij gaat rechtstreeks naar
  `destination` en niet door de meestergain: hij hoort bij het
  ontgrendelen, niet bij de muziek, en moet dus ook met "geluid uit"
  werken.
- **De belschakelaar** (`js/sound.js`, `stilleWav`, `zorgStilElement`).
  Met het schuifje op de zijkant op stil is WebAudio op een iPhone
  onhoorbaar, hoe hard je ook versterkt — WebAudio hoort bij het
  belkanaal. Een spelend `<audio playsinline>` verhuist de pagina naar
  het mediakanaal, en dát kanaal luistert niet naar het schuifje. Het
  element (`#al-stil-audio`) speelt een lus van een tiende seconde
  stilte, `loop`, `playsinline`, **niet gedempt en op volume 1**.
- **De volgorde in `unlock()`** is de eigenlijke fix: context → resume →
  primer → stil element → vlag en haak. De `resume` staat vóór de
  `ontgrendeld`-uitstap (zoals ze al stond, en dat is nu ook zo
  opgeschreven), zodat een later gebaar een opnieuw opgeschorte context
  nog kan wekken. De primer speelt bij het eerste gebaar én bij elk
  gebaar dat een opgeschorte context aantreft.
- **Terug uit de achtergrond** (`opZichtbaar`). Op `visibilitychange`
  naar zichtbaar en op `focus`: een opgeschorte context hervatten en het
  stille element opnieuw starten — maar alleen als er al ontgrendeld is.
  Verborgen pauzeert het element. Buiten een gebaar wordt hier nooit een
  context aangemaakt.
- **Aan de geluidsknop gehangen** (`zetAan`). "Geluid uit" pauzeert het
  element; "geluid aan" laat het weer spelen, en dat mag ook op iOS
  omdat de speler dat commando zelf net getypt of getikt heeft. Vóór de
  ontgrendeling maakt `zetAan(true)` géén element: bij het opstarten zet
  de engine de bewaarde voorkeur terug, en dat is geen gebruikersactie.
- **`debug()`** meldt `primers` en `stil` (`null` / `"speelt"` /
  `"gepauzeerd"`). Aan een element dat stilte speelt is niets te horen,
  dus dit is het enige waaraan een test kan zien dat het het mediakanaal
  claimt.
- **Docs**: `docs/engine-architectuur.md` §Geluid — §De ontgrendeling
  noemt de zes oppervlakken en waarom de oude helft voor iOS niet
  meetelde, en de nieuwe §De iOS-ketting beschrijft de vijf stappen, de
  belschakelaar-redenering, de drie niet-cosmetische elementeigenschappen
  en de DOM-afweging.

## Beslissingen

- **De WAV wordt in de code gezet, niet als base64-brok geplakt.** Het is
  een RIFF-kop van 44 bytes en 800 samples van 128 (het nulpunt van
  8-bits PCM); zo staat er te lezen wat het is in plaats van 1128 tekens
  base64. Nul afhankelijkheden, geen bestand, geen net, en dus ook vanaf
  `file://` speelbaar. Een fout in zo'n kop is wel onzichtbaar, en
  daarom keuren twee tests hem: een headless keuring rekent de kop na, en
  de rooksmaaktest kijkt of `currentTime` in de browser echt oploopt.
- **Volume 1 en niet gedempt.** Overwogen en verworpen: `muted = true` of
  `volume = 0.01`. Een gedempt element (en een element op volume 0)
  claimt het mediakanaal niet, en dan doet de hele truc niets. De stilte
  hoort in de samples te zitten, niet in het volume.
- **Eén element, in het gebaar aangemaakt.** Niet in `index.html`, zoals
  de kickoff als mogelijkheid noemde: een `<audio>` in de opmaak bestaat
  al vóór het eerste gebaar, en dan is "het element bestaat pas na een
  gebruikersactie" niet meer te keuren. Nu maakt `zorgStilElement()` het
  bij het eerste gebaar en hangt het aan `document.body`.
- **De primer niet bij elke toetsaanslag.** `unlock()` hangt aan zes
  oppervlakken en wordt in een sessie honderden keren geroepen; een
  bufferbron per aanroep is verspilling. Hij speelt waar hij iets kan
  doen: bij het eerste gebaar en bij elk gebaar dat een opgeschorte
  context aantreft.
- **DOM in `js/sound.js` is toegestaan.** De architectuurregel "DOM-vrij"
  geldt voor `js/logic/`; de geluidslaag hoort bij de renderlaag en raakt
  `window` en `AudioContext` al. Wél met dezelfde zekering als de rest:
  is er geen `document`, dan gebeurt er niets en draaien de headless
  tests door. Dat staat zo in de code, in de doc en hier.
- **Geen platformdetectie.** Het element wordt overal aangemaakt, niet
  alleen op iOS. Een browsersniff op Safari of iPhone is fragiel en
  veroudert, en het enige zichtbare gevolg elders is dat een tab het
  luidsprekertje toont zolang het geluid aanstaat — wat dan ook waar is.
  Met "geluid uit" pauzeert het element en verdwijnt dat teken.
- **`js/touch.js` bleef ongemoeid.** Zijn D-pad ontgrendelt op
  `pointerdown` en zijn formulier op submit; het loslaten van een knop
  valt nu onder de vensterbrede `pointerup`/`touchend`. Een extra
  aanroep in `uit` zou niets toevoegen dat de capture-luisteraars niet al
  vangen.
- **De iOS-luistertest blijft bij Lars.** Alles hierboven is in Chromium
  gemeten; WebKit staat niet in deze container en een belschakelaar heeft
  geen enkele container. Wat nog vastgesteld moet worden op een échte
  iPhone, en met het schuifje in **beide** standen (bel aan én op stil):
  klinkt het bed op de titelkaart, klinken de voetstappen, en is het na
  "geluid uit" / "geluid aan" nog steeds zo.

## QC-resultaat

Gedraaid met `AL_CHROMIUM=/opt/pw-browsers/chromium`:

- `node --test test/test-*.mjs` — **423/423 groen** (was 414; acht nieuwe
  geluidskeuringen, één nieuwe inputkeuring).
- `smoke-geluid` — **30/30** (was 17/17; dertien nieuwe controles in §5).
  Gemeten en niet aangenomen: een `touchend` als enige gebeurtenis
  ontgrendelt, de primer speelt precies één keer, het element bestaat
  niet vóór het gebaar en speelt erna écht (`currentTime` 0,076 s na 400
  ms, geen mediafout), "geluid uit" pauzeert het en "geluid aan" hervat
  het, en een tabblad dat weggaat en terugkomt pauzeert en hervat mee.
- `smoke-browser` **41/41**, `smoke-walk` **38/38**,
  `smoke-full-playthrough` **97/97** — allemaal ongewijzigd. De
  WP 37-garantie staat er nog: geen `AudioContext` en nul oscillatoren
  vóór het eerste gebaar, ook niet na anderhalve seconde doortikken.
- `tools/lint-scene.mjs` schoon; `tools/check-docpaden.mjs` 872 paden, 0
  dood in een contractdocument.
- **Negatieve controle gemeten.** Met de drie nieuwe luisteraars uit
  `js/input.js` en het stille element uit `unlock()`/`zetAan()` zakken
  tien van de dertien nieuwe controles (`touchend` ontgrendelt niet,
  primers 0, geen element, geen pauze bij "geluid uit"). De elfde —
  terugkomen op een zichtbaar tabblad — bleef groen omdat `opZichtbaar()`
  het element in dat geval alsnog aanmaakt; dat is gedrag, geen gat.
- Wrap op 80 tekens gecontroleerd (in tekens) voor de nieuwe doc-sectie en
  deze entry.
