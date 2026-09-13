/* =============================================================================
   CUBE Nuroad Bike Builder 3D  –  Fahrraddaten
   -----------------------------------------------------------------------------
   Diese Datei ist die EINZIGE Quelle fuer alle Fahrraddaten.
   Inhalt ist reines JSON, nur in eine globale Variable gelegt, damit die
   Anwendung auch per Doppelklick (file://) ohne Webserver laeuft.

   Felder pro Fahrrad:
     id              interner Schluessel (auch fuer Kompatibilitaetslisten)
     model / year    Modellbezeichnung und Modelljahr
     price           Grundpreis in EUR  ODER  null wenn nicht belegbar
     priceVerified   true  = Preis stammt aus offizieller CUBE-Quelle
                     false = Preis stammt aus Haendler-/Preisvergleichsquelle
     priceNote       Herkunft des Preises im Klartext
     dataStatus      "verified"   = Ausstattung aus offiziellen CUBE-Angaben
                     "partial"    = teilweise belegt
                     "unverified" = Modelljahr angekuendigt, Daten noch offen
     weightKg        Herstellergewicht wenn offiziell angegeben, sonst null
     colors[]        NUR tatsaechlich angebotene Farben.
                     hex/accent sind visuelle ANNAEHERUNGEN fuer die 3D-Lackierung.
     spec{}          fest verbaute Originalausstattung (nicht austauschbar)
     geometry        welches 3D-Rahmenprofil verwendet wird (hpa | superlite)
     url             offizielle CUBE-Seite
============================================================================= */

window.CUBE_BIKES = [
  {
    id: "nuroad-pro-2026",
    model: "CUBE Nuroad Pro",
    year: 2026,
    series: "Nuroad HPA",
    price: 1099.00,
    priceVerified: false,
    priceNote: "Haendler-/Preisvergleichspreis des Modelljahres 2026. Offiziell belegt ist die UVP nur fuer das Modelljahr 2027 (1.099 EUR).",
    dataStatus: "verified",
    weightKg: null,
    weightNote: "Von CUBE fuer dieses Modell nicht oeffentlich angegeben.",
    geometry: "superlite",
    url: "https://www.cube.eu/de-de/cube-nuroad-pro-whale-n-reflex/129300",
    colors: [
      { id: "whale-reflex", name: "whale´n´reflex", articleNo: "129300",
        hex: "#6d7a84", accent: "#c3cad0", forkHex: "#5d6870",
        url: "https://www.cube.eu/de-de/cube-nuroad-pro-whale-n-reflex/129300" },
      { id: "pea-grey", name: "pea´n´grey", articleNo: "129310",
        hex: "#93a83f", accent: "#6a6f74", forkHex: "#4a4e52",
        url: "https://www.cube.eu/at-de/cube-nuroad-pro-pea-n-grey/129310" }
    ],
    drivetrain: { chainrings: [40], cassette: [50, 42, 36, 32, 28, 24, 21, 18, 15, 13, 11] },
    drivetrainVerified: false,
    drivetrainNote: "Kassette 11-50 (11-fach) belegt; Kettenblattgroesse nicht offiziell angegeben, 40T angenommen.",
    spec: {
      "Rahmen": "Aluminium 6061 T6 Superlite, Gravel Comfort Geometry, Flat Mount Disc, Fender & Rack Option, 12x142 mm, AXH",
      "Gabel": "CUBE Nuroad Flat Mount Disc, Full Carbon, 1 1/8\" - 1 1/4\" Tapered, Fender & Lowrider Mounts",
      "Schaltwerk": "Shimano CUES RD-U6000-GS, 11-Speed",
      "Schaltung": "Shimano CUES, 1x11",
      "Kassette": "11-50",
      "Kurbel": "Shimano CUES U6030, Pressfit",
      "Bremsen": "Shimano CUES BR-U6030, Hydr. Disc Brake, Flat Mount (180/180)",
      "Reifen": "Schwalbe Gravel-Reifen",
      "Laufraeder": "28\", Steckachsen",
      "Sattelklemmung": "integriert"
    }
  },

  {
    id: "nuroad-race-2026",
    model: "CUBE Nuroad Race",
    year: 2026,
    series: "Nuroad HPA",
    price: 1499.00,
    priceVerified: false,
    priceNote: "Marktpreis laut Preisvergleich fuer MY2026. Offiziell belegt ist die UVP nur fuer das Modelljahr 2027 (1.499 EUR).",
    dataStatus: "verified",
    weightKg: null,
    weightNote: "Fuer die Nicht-FE-Version nicht offiziell angegeben.",
    geometry: "hpa",
    url: "https://www.cube.eu/bikes/gravel/nuroad",
    colors: [
      { id: "royalgreen-black", name: "royalgreen´n´black",
        hex: "#1f4a34", accent: "#101214", forkHex: "#14171a",
        url: "https://www.cube.eu/bikes/gravel/nuroad" },
      { id: "cappuccino-black", name: "cappuccino´n´black",
        hex: "#9d7a5b", accent: "#101214", forkHex: "#14171a",
        url: "https://www.cube.eu/bikes/gravel/nuroad" }
    ],
    drivetrain: { chainrings: [48, 31], cassette: [36, 32, 28, 24, 21, 19, 17, 15, 14, 13, 12, 11] },
    drivetrainVerified: false,
    drivetrainNote: "Kurbel 48x31T belegt; Kassettenabstufung (11-36, 12-fach) angenommen.",
    spec: {
      "Rahmen": "Aluminium 6061 T6, Gravel Comfort Geometry, Smooth Welding, Internal Cable Routing, Integrated Seat Post Clamp, Flat Mount Disc, Fender & Rack Option, 12x142 mm, UDH",
      "Gabel": "CUBE C:62 Technology, 1 1/8\" - 1 1/2\" Tapered, Integrated Cable Routing, Flat Mount Disc, Fender & Lowrider Mounts, Internal Light Cable Option, 12x100 mm",
      "Schaltwerk": "Shimano GRX RD-RX820, Direct Mount, 12-Speed",
      "Schalt-/Bremshebel": "Shimano GRX ST-RX610",
      "Schaltung": "Shimano GRX RX820, 2x12",
      "Kurbel": "Shimano GRX FC-RX820, 48x31T",
      "Bremsen": "Shimano BR-RX410, Hydr. Disc Brake, Flat Mount (160/160)",
      "Reifen": "Schwalbe G-One R, 45 mm",
      "Laufraeder": "28\", Steckachsen"
    }
  },

  {
    id: "nuroad-race-fe-2026",
    model: "CUBE Nuroad Race FE",
    year: 2026,
    series: "Nuroad HPA – Fully Equipped",
    price: null,
    priceVerified: false,
    priceNote: "Kein belastbarer Preis recherchierbar – bewusst leer gelassen statt geschaetzt.",
    dataStatus: "verified",
    weightKg: 12.9,
    weightNote: "Herstellerangabe.",
    geometry: "hpa",
    url: "https://www.cube.eu/bikes/gravel/nuroad",
    fullyEquipped: true,
    includedAccessories: ["mudguards", "rack", "kickstand", "lightset"],
    colors: [
      { id: "royalgreen-black", name: "royalgreen´n´black",
        hex: "#1f4a34", accent: "#101214", forkHex: "#14171a",
        url: "https://www.cube.eu/bikes/gravel/nuroad" }
    ],
    drivetrain: { chainrings: [48, 31], cassette: [36, 32, 28, 24, 21, 19, 17, 15, 14, 13, 12, 11] },
    drivetrainVerified: false,
    drivetrainNote: "Kurbel 48x31T belegt; Kassettenabstufung angenommen.",
    spec: {
      "Rahmen": "Aluminium, Gravel Comfort Geometry, Smooth Welding, Advanced Internal Cable Routing",
      "Gabel": "CUBE C:62 Technology, 1 1/8\" - 1 1/2\" Tapered, Flat Mount Disc, Fender & Lowrider Mounts, Internal Light Cable Option, 12x100 mm",
      "Schaltwerk": "Shimano GRX RD-RX820, Direct Mount, 12-Speed",
      "Schalt-/Bremshebel": "Shimano GRX ST-RX610",
      "Kurbel": "Shimano GRX FC-RX820, 48x31T",
      "Bremsen": "Shimano BR-RX410, Hydr. Disc Brake, Flat Mount (160/160)",
      "Reifen": "Schwalbe G-One Overland, 45 mm",
      "Serienausstattung": "Schutzbleche, Gepaecktraeger, Seitenstaender, komplette Lichtanlage"
    }
  },

  {
    id: "nuroad-one-2027",
    model: "CUBE Nuroad ONE",
    year: 2027,
    series: "Nuroad ONE (neue Alu-Plattform)",
    price: 799.00,
    priceVerified: false,
    priceNote: "Einstiegspreis 799 EUR aus der offiziellen MY2027-Vorstellung (Fachpresse), nicht direkt von cube.eu abgerufen.",
    dataStatus: "partial",
    weightKg: 12.3,
    weightNote: "Herstellergewicht laut MY2027-Vorstellung.",
    geometry: "superlite",
    url: "https://www.cube.eu/bikes/gravel/nuroad",
    colors: [],
    colorNote: "Die offiziellen Farbvarianten des Nuroad ONE 2027 liegen hier noch nicht belegt vor. Es werden bewusst keine Farben erfunden – das Modell wird im 3D-Viewer neutral dargestellt.",
    drivetrain: { chainrings: [40], cassette: [50, 42, 36, 30, 26, 23, 20, 17, 15, 13, 11] },
    drivetrainVerified: false,
    drivetrainNote: "Zaehnezahlen nicht offiziell hinterlegt - generische Cues-Abstufung.",
    spec: {
      "Rahmen": "Aluminium, Smooth Welding, integrierte Sattelstuetzenklemme, neue Leitungsfuehrung",
      "Gabel": "Aluminium",
      "Bremsen": "Shimano CUES, hydraulische Scheibenbremsen",
      "Reifen": "45 mm",
      "Reifenfreiheit": "bis 50 mm (45 mm mit Schutzblechen)",
      "Groessen": "XXS mit 27,5\", ab XS 700C"
    }
  },

  {
    id: "nuroad-pro-2027",
    model: "CUBE Nuroad Pro",
    year: 2027,
    series: "Nuroad HPA",
    price: 1099.00,
    priceVerified: true,
    priceNote: "UVP laut offizieller CUBE-Produktseite.",
    dataStatus: "verified",
    weightKg: 11.4,
    weightNote: "Herstellerangabe CUBE.",
    geometry: "superlite",
    url: "https://www.cube.eu/bikes/gravel/nuroad",
    articleNo: "1135200",
    colors: [
      { id: "taiga-blue", name: "taiga\u00b4n\u00b4blue", articleNo: "1135200",
        hex: "#2f4a3a", accent: "#2b4f7a", forkHex: "#1c2a24",
        url: "https://www.cube.eu/bikes/gravel/nuroad" },
      { id: "mysticpurple-black", name: "mysticpurple\u00b4n\u00b4black",
        hex: "#4b3a63", accent: "#101214", forkHex: "#14171a",
        url: "https://www.cube.eu/bikes/gravel/nuroad" }
    ],
    drivetrain: { chainrings: [40], cassette: [50, 42, 36, 30, 26, 23, 20, 17, 15, 13, 11] },
    drivetrainVerified: true,
    drivetrainNote: "ACID Gravel Pro 40T und Shimano Cues CS-LG400 11-50T laut CUBE.",
    spec: {
      "Rahmen": "Aluminium 6061 T6 Superlite, Internal Cable Routing, Integrated Seat Post Clamp, Flat Mount Disc, Fender & Rack Option, 12x142mm, UDH",
      "Groesse": "Size Split: 27.5\": XXS // 28\": XS, S, M, L, XL, XXL",
      "Starrgabel": "CUBE C:62, 1 1/8\" - 1 1/2\" Tapered, Integrated Cable Routing, Flat Mount Disc, Fender & Lowrider Mounts, Internal Light Cable Option, 12x100mm",
      "Schalt-/Bremsgriff": "Shimano Cues BL/ST-U6030",
      "Bremsanlage": "Shimano Cues BR-U6030, Hydr. Disc Brake, Flat Mount (180/180)",
      "Schaltwerk": "Shimano Cues RD-U6000-GS, 11-Speed",
      "Innenlager": "Samox BB8601, Pressfit",
      "Kurbelgarnitur": "ACID Gravel Pro, 40T",
      "Kassette": "Shimano Cues CS-LG400, 11-50T",
      "Kette": "KMC xGlide",
      "Steuersatz": "Acros, Top Integrated 1 1/2\" w/ Integrated Cable Routing",
      "Vorbau": "CUBE CIS Stem +/- 6\u00b0, FPI-Link",
      "Lenker": "CUBE Gravel Race Bar",
      "Lenkerband": "ACID Bartape CC 3.0",
      "Laufradsatz": "ACID Pro GR 2.5 Disc, 28/28 Spokes, Centerlock, 12x100mm/12x142mm, Tubeless Ready",
      "Reifen": "Schwalbe G-One Comp, ActiveL, 45-622",
      "Sattel": "ACID Nuance Lite",
      "Sattelstuetze": "CUBE Performance Post, 27.2mm",
      "Reifenfreiheit": "50 mm (45 mm mit Schutzblechen)"
    }
  },

  {
    id: "nuroad-race-2027",
    model: "CUBE Nuroad Race",
    year: 2027,
    series: "Nuroad HPA",
    price: 1499.00,
    priceVerified: true,
    priceNote: "UVP laut offizieller CUBE-Produktseite.",
    dataStatus: "verified",
    weightKg: 10.4,
    weightNote: "Herstellerangabe CUBE.",
    geometry: "hpa",
    url: "https://www.cube.eu/bikes/gravel/nuroad",
    articleNo: "1135500",
    colors: [
      { id: "inkgrey-grey", name: "inkgrey\u00b4n\u00b4grey", articleNo: "1135500",
        hex: "#47576b", accent: "#93a0ae", forkHex: "#445366",
        url: "https://www.cube.eu/bikes/gravel/nuroad" },
      { id: "lindgreen-matcha", name: "lindgreen\u00b4n\u00b4matcha",
        hex: "#a2bf3f", accent: "#5d7331", forkHex: "#9db93c",
        url: "https://www.cube.eu/bikes/gravel/nuroad" }
    ],
    drivetrain: { chainrings: [48, 31], cassette: [36, 32, 28, 24, 21, 19, 17, 15, 14, 13, 12, 11] },
    drivetrainVerified: true,
    drivetrainNote: "Shimano GRX FC-RX820 48x31T und 105 CS-HG710 11-36T laut CUBE.",
    spec: {
      "Rahmen": "Aluminium 6061 T6 Superlite, Internal Cable Routing, Integrated Seat Post Clamp, Flat Mount Disc, Fender & Rack Option, 12x142mm, UDH",
      "Groesse": "XS, S, M, L, XL, XXL",
      "Starrgabel": "CUBE C:62, 1 1/8\" - 1 1/2\" Tapered, Integrated Cable Routing, Flat Mount Disc, Fender & Lowrider Mounts, Internal Light Cable Option, 12x100mm",
      "Schalt-/Bremsgriff": "Shimano GRX ST-RX610",
      "Bremsanlage": "Shimano GRX BR-RX410, Hydr. Disc Brake, Flat Mount (160/160)",
      "Schaltwerk": "Shimano GRX RD-RX820, Direct Mount, 12-Speed",
      "Umwerfer": "Shimano GRX FD-RX820-F",
      "Innenlager": "Shimano BB-RS500PB, Pressfit",
      "Kurbelgarnitur": "Shimano GRX FC-RX820, 48x31T (2x12)",
      "Kassette": "Shimano 105 CS-HG710, 11-36T",
      "Kette": "Shimano CN-M6100",
      "Steuersatz": "Acros, Top Integrated 1 1/2\" w/ Integrated Cable Routing",
      "Vorbau": "CUBE CIS Stem +/- 6\u00b0, FPI-Link",
      "Lenker": "CUBE Gravel Race Bar 31.8 5\u00b0 105 NF",
      "Lenkerband": "ACID Bartape CC 3.0",
      "Laufradsatz": "Newmen Performance X.R.25, 28/28 Spokes, Centerlock, Tubeless Ready",
      "Reifen": "Schwalbe G-One R Performance, Kevlar, TLR, 45-622",
      "Sattel": "ACID Nuance Lite",
      "Sattelstuetze": "CUBE Performance Post, 27.2mm",
      "Reifenfreiheit": "50 mm (45 mm mit Schutzblechen)"
    }
  }
];

/* Recherchestand der Fahrraddaten – wird in der Anwendung angezeigt. */
window.CUBE_BIKES_META = {
  researchedAt: "2026-09-12",
  sources: [
    "cube.eu – Nuroad Serienseite und Produktseiten (Ausstattung, Farbnamen, Artikelnummern)",
    "Preisvergleich / CUBE-Fachhandel (Preise, Gewichte)",
    "Offizielle CUBE-Produktseiten MY2027: Nuroad Pro (1.099 EUR, 11,4 kg, Art. 1135200) und Nuroad Race (1.499 EUR, 10,4 kg, Art. 1135500)"
  ],
  disclaimer: "Preise und Verfuegbarkeiten aendern sich. Massgeblich ist immer die offizielle CUBE-Seite bzw. der Fachhandel."
};
