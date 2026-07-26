// zine.typ — pandoc-Typst-sjabloon voor de walkthrough van The Legacy of
// Alberta, in de stijl van een gefotokopieerde jaren-'90-spelgids: typewriter-
// font, een licht vergeeld papier, een lopende kop met de speltitel,
// paginanummers, en — enkel voor deel 2 — een volledige "VERBREEK HET ZEGEL
// NIET"-pagina vóór de oplossingen.
//
// Dit is een VOLLEDIG pandoc-sjabloon (vervangt de standaard), zodat de opmaak
// hier volledig in eigen hand ligt. Het definieert eerst de pandoc-Typst-
// hulpstukken waar de gegenereerde body op rekent (horizontalrule, terms.item,
// tabel-/figuurregels), zet daarna de zine-stijl, en plaatst de body. Metadata-
// variabelen uit de Markdown-YAML sturen de kop rechts (deel) en de zegel.
// Gebruik: pandoc in.md --pdf-engine=typst --template=zine.typ
// --syntax-highlighting=none -o uit.pdf  (zie tools/bouw-walkthrough.sh).
// LET OP: geen dollar-token in commentaar; pandoc vult die ook daar in.

// ---------------------------------------------------------------------------
// Pandoc-Typst-hulpstukken (nodig door de gegenereerde body).
// ---------------------------------------------------------------------------
#let horizontalrule = align(center)[
  #box(width: 40%)[
    #text(fill: rgb("#8a7f6c"))[#sym.ast.op #h(0.6em) #sym.ast.op #h(0.6em) #sym.ast.op]
  ]
]

#show terms.item: it => block(breakable: false)[
  #text(weight: "bold")[#it.term]
  #block(inset: (left: 1.5em, top: -0.4em))[#it.description]
]

#set table(inset: 6pt, stroke: 0.5pt + rgb("#6b6357"))
#show figure.where(kind: table): set figure.caption(position: top)
#show figure.where(kind: image): set figure.caption(position: bottom)

// ---------------------------------------------------------------------------
// Kleuren en maten van de zine.
// ---------------------------------------------------------------------------
// De typemachine-font, als een fallback-ketting. Courier New staat vooraan —
// dat is de font waarin deze gids ontworpen is (WP 10) — maar hij is een
// Microsoft-font en staat lang niet op elke machine die de PDF's herbouwt. Toen
// WP 39 ze herbouwde, ontbrak hij: typst waarschuwde vijftien keer "unknown
// font family" en viel terug op zijn eigen serif-font, wat de hele
// fotokopie-look wegneemt. Liberation Mono heeft dezelfde metrieken als Courier
// New (het is er de vrije tegenhanger van), dus de bladspiegel blijft gelijk;
// de laatste twee zijn er voor systemen die ook die niet hebben. Typst neemt de
// eerste font uit de lijst die hij vindt.
#let typemachine = ("Courier New", "Liberation Mono", "Nimbus Mono PS",
  "DejaVu Sans Mono")

#let papier = rgb("#f3efe3")   // licht vergeeld fotokopie-papier
#let inkt   = rgb("#1c1a17")   // bijna-zwart, als een verse kopie
#let flets  = rgb("#6b6357")   // vergrijsde inkt voor bijzaken
#let zegelrood = rgb("#7d1f1a")
#let tape   = rgb("#d8cfa8")

// ---------------------------------------------------------------------------
// Pagina, tekst en koppen.
// ---------------------------------------------------------------------------
#set page(
  paper: "a4",
  margin: (x: 2.3cm, top: 2.7cm, bottom: 2.4cm),
  fill: papier,
  header: context {
    // Geen kop op de eerste pagina (titel of zegel).
    if here().page() > 1 [
      #set text(font: typemachine, size: 8pt, fill: flets)
      #grid(
        columns: (1fr, auto),
        align: (left, right),
        smallcaps[The Legacy of Alberta],
        smallcaps[$if(deel)$$deel$$else$Walkthrough$endif$],
      )
      #v(-0.55em)
      #line(length: 100%, stroke: 0.5pt + flets)
    ]
  },
  footer: context {
    set text(font: typemachine, size: 8pt, fill: flets)
    align(center)[
      #sym.dash.en #h(0.4em) #counter(page).display() #h(0.4em) #sym.dash.en
    ]
  },
)

#set text(font: typemachine, size: 10pt, fill: inkt, lang: "nl")
#set par(justify: false, leading: 0.72em, spacing: 1.05em)

// Koppen: typemachine-bold, oplopend kleiner, met een streepje-onderlijn op H1.
#show heading: set text(font: typemachine, weight: "bold", fill: inkt)
#show heading.where(level: 1): it => block(breakable: false)[
  #v(0.4em)
  #set text(size: 15pt)
  #upper[#it.body]
  #v(-0.3em)
  #line(length: 100%, stroke: 1pt + inkt)
  #v(0.2em)
]
#show heading.where(level: 2): it => block(breakable: false)[
  #v(0.5em)
  #set text(size: 12.5pt)
  #box[#sym.gt.double #h(0.3em) #it.body]
  #v(0.05em)
]
#show heading.where(level: 3): it => block(breakable: false)[
  #v(0.35em)
  #set text(size: 11pt)
  #box[#it.body]
]

// Codeblokken: een gefotokopieerd kader met lichte binnenvulling.
#show raw.where(block: true): it => block(
  width: 100%,
  fill: rgb("#e9e3d2"),
  stroke: 0.75pt + flets,
  inset: 8pt,
  radius: 1pt,
  breakable: true,
)[#set text(font: typemachine, size: 9pt); #it]
#show raw.where(block: false): it => box(
  fill: rgb("#e9e3d2"),
  inset: (x: 2pt),
  outset: (y: 1.5pt),
)[#set text(size: 9.5pt); #it]

// Blokcitaten (pandoc: #quote(block: true)): ingesprongen met een kantlijn.
#show quote.where(block: true): it => block(
  inset: (left: 1.1em),
  stroke: (left: 2pt + flets),
)[#set text(style: "italic"); #it.body]

#set list(marker: ([#text(fill: flets)[#sym.triangle.filled.small.r]], [#sym.dot]))
#set enum(numbering: "1.")

// ---------------------------------------------------------------------------
// Kaft/titelblok: eerste pagina met de speltitel in VGA-doosstijl.
// ---------------------------------------------------------------------------
#let kaft(titelregel, ondertitel) = {
  set page(header: none, footer: none)
  v(3.5cm)
  align(center)[
    #box(stroke: 2pt + inkt, inset: 14pt)[
      #set text(font: typemachine, weight: "bold")
      #text(size: 22pt)[THE LEGACY]#linebreak()
      #text(size: 22pt)[OF ALBERTA]
    ]
    #v(1.4em)
    #text(font: typemachine, size: 13pt, weight: "bold")[#upper[#titelregel]]
    #v(0.4em)
    #text(font: typemachine, size: 10pt, fill: flets)[#ondertitel]
    #v(2.6em)
    #line(length: 45%, stroke: 0.5pt + flets)
    #v(0.8em)
    #text(font: typemachine, size: 9pt, fill: flets)[
      een gids in twee delen \
      voor de zolder van grootmoeder Alberta
    ]
  ]
  pagebreak(weak: false)
}

// ---------------------------------------------------------------------------
// De zegelpagina (enkel deel 2): "VERBREEK HET ZEGEL NIET, TENZIJ..."
// ---------------------------------------------------------------------------
#let zegelpagina() = {
  set page(header: none, footer: none)
  // Twee stroken plakband, kruislings.
  place(top + center, dy: 2.1cm, rotate(-8deg,
    box(width: 12cm, height: 1.5cm, fill: tape.transparentize(15%),
        stroke: 0.5pt + flets)[
      #align(center + horizon)[#text(font: typemachine, size: 8pt,
        fill: flets, tracking: 2pt)[· · · · · · · · · · · · · · ·]]
    ]
  ))
  place(bottom + center, dy: -3.0cm, rotate(6deg,
    box(width: 12cm, height: 1.5cm, fill: tape.transparentize(15%),
        stroke: 0.5pt + flets)[
      #align(center + horizon)[#text(font: typemachine, size: 8pt,
        fill: flets, tracking: 2pt)[· · · · · · · · · · · · · · ·]]
    ]
  ))

  v(4.6cm)
  align(center)[
    #text(font: typemachine, weight: "bold", size: 20pt)[
      VERBREEK HET \ ZEGEL NIET,
    ]
    #v(0.1em)
    #text(font: typemachine, weight: "bold", size: 20pt, fill: zegelrood)[
      TENZIJ...
    ]
  ]

  // De wassen zegel: een gekartelde cirkel met tekst.
  v(0.8em)
  align(center)[
    #box(width: 4.6cm, height: 4.6cm)[
      #place(center + horizon, circle(radius: 2.3cm, fill: zegelrood,
        stroke: 3pt + zegelrood.darken(20%)))
      #place(center + horizon, circle(radius: 1.95cm, fill: none,
        stroke: (dash: "dotted", paint: papier, thickness: 1pt)))
      #place(center + horizon, text(font: typemachine, weight: "bold",
        size: 10pt, fill: papier)[
        #align(center)[ERE- \ SYSTEEM]
      ])
    ]
  ]

  v(1.0em)
  block(inset: (x: 1.8cm))[
    #set text(font: typemachine, size: 10.5pt, fill: inkt)
    #set par(justify: false, leading: 0.8em)
    #align(center)[
      Achter deze pagina staan de *volledige oplossingen*: elke
      herstelde regel code, elk trace-antwoord, en de weg naar alle
      vier de eindes van _Seven Little Goats_.

      #v(0.4em)

      Eén repository, één zolder. Wie hier te vroeg gluurt, bedriegt
      alleen zichzelf. Vastgelopen én heeft `?` in het spel geen
      soelaas gebracht, én heeft deel 1 je niet verder geholpen?
      Pas dán knip je langs de stippellijn.

      #v(0.6em)

      #text(fill: flets, size: 9pt)[
        (Er is geen echte stippellijn. Dat is het punt.)
      ]
    ]
  ]
  pagebreak(weak: false)
}

$for(header-includes)$
$header-includes$
$endfor$

$if(title)$
#kaft([$title$], [$if(subtitle)$$subtitle$$else$$endif$])
$endif$

$if(zegel)$
#zegelpagina()
$endif$

$for(include-before)$
$include-before$
$endfor$

$if(toc)$
#outline(title: auto, depth: $toc-depth$)
$endif$

$body$

$for(include-after)$
$include-after$
$endfor$
