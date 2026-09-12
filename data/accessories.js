/* =============================================================================
   CUBE Nuroad Bike Builder 3D  –  Zubehoerdaten
   -----------------------------------------------------------------------------
   Felder pro Zubehoerteil:
     id            interner Schluessel (identisch mit dem 3D-Bauteil-Schluessel)
     category      Gruppierung in der Oberflaeche
     name          Produktname
     brand         ACID ist die Zubehoermarke von CUBE
     articleNo     Artikelnummer sofern recherchiert
     price         EUR oder null (null = kein belegbarer Preis -> nicht erfunden)
     priceType     "UVP" | "Haendlerpreis" | null
     weightG       Gewicht in Gramm oder null
     compatible    Liste von Fahrrad-IDs, "*" = alle
     requires      Liste von Zubehoer-IDs die vorher noetig sind
     conflicts     Liste von Zubehoer-IDs die sich ausschliessen
     mount         Montageposition (wird vom 3D-Builder ausgewertet)
     url           Produkt- bzw. Kategorieseite bei CUBE
============================================================================= */

window.CUBE_ACCESSORIES = [
  /* ------------------------------- TASCHEN ------------------------------- */
  {
    id: "framebag",
    category: "Taschen",
    name: "ACID Rahmentasche PACK PRO 3",
    brand: "ACID",
    articleNo: null,
    price: 54.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: ["bottlecage"],
    conflictNote: "Belegt das Rahmendreieck – zusammen mit dem Flaschenhalter im Unterrohr nicht sinnvoll montierbar.",
    color: "#1f6b63",
    mount: "frame-triangle",
    description: "Rahmentasche fuer das Hauptdreieck, 3 Liter, Bikepacking-Linie PACK PRO.",
    url: "https://www.cube.eu/ch-de/gear/taschen-koerbe/taschen"
  },
  {
    id: "toptubebag",
    category: "Taschen",
    name: "ACID Oberrohrtasche (PACK PRO Linie)",
    brand: "ACID",
    articleNo: null,
    price: null,
    priceType: null,
    priceNote: "Kein eindeutig zuordenbarer Preis recherchiert – bewusst leer statt geschaetzt.",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    color: "#1f6b63",
    mount: "top-tube-front",
    description: "Kleine Tasche direkt hinter dem Steuerrohr auf dem Oberrohr.",
    url: "https://www.cube.eu/ch-de/gear/taschen-koerbe/taschen"
  },
  {
    id: "saddlebag",
    category: "Taschen",
    name: "ACID Satteltasche PACK PRO 15 (\"Arschrakete\")",
    brand: "ACID",
    articleNo: "93775",
    price: 99.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    color: "#4e5f26",
    mount: "behind-saddle",
    description: "15 Liter Bikepacking-Satteltasche, wird unter dem Sattel und an der Sattelstuetze fixiert.",
    url: "https://www.cube.eu/ch-de/gear/taschen-koerbe/taschen"
  },
  {
    id: "handlebarbag",
    category: "Taschen",
    name: "ACID Lenkertasche PACK PRO 9",
    brand: "ACID",
    articleNo: "93771",
    price: 79.95,
    priceType: "Haendlerpreis",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: ["frontlight", "lightset"],
    conflictNote: "Belegt den Bereich am Lenker, in dem das Frontlicht sitzt.",
    color: "#b2712f",
    mount: "handlebar-front",
    description: "9 Liter Lenkerrolle mit FILink-Halterung.",
    url: "https://www.cube.eu/ch-de/gear/taschen-koerbe/taschen"
  },
  {
    id: "panniers",
    category: "Taschen",
    name: "ACID Seitentaschen Pure 20/2 SMLink 2.0 (Paar)",
    brand: "ACID",
    articleNo: null,
    price: 99.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: ["rack", "rack21"],
    requiresAny: true,
    requiresNote: "Benoetigt einen Gepaecktraeger.",
    conflicts: [],
    color: "#1f3d6b",
    mount: "rack-sides",
    description: "2x 20 Liter Gepaecktraegertaschen mit SMLink 2.0 Halterung.",
    url: "https://www.cube.eu/ch-de/gear/taschen-koerbe/taschen/gepaecktraegertaschen"
  },

  /* -------------------------------- GEPAECK ------------------------------ */
  {
    id: "rack",
    category: "Gepaeck",
    name: "ACID Gepaecktraeger Nuroad 2021-2026 SIC Rail V2 28\"",
    brand: "ACID",
    articleNo: null,
    price: 49.95,
    priceType: "UVP",
    weightG: null,
    compatible: ["nuroad-pro-2026", "nuroad-race-2026", "nuroad-race-fe-2026"],
    incompatibleNote: "Explizit fuer Nuroad Modelljahre 2021-2026. Fuer MY2027 kuendigt CUBE die neue SIC 2.1 Schnittstelle an – ein passender Traeger ist hier noch nicht hinterlegt.",
    requires: [],
    conflicts: [],
    mount: "rear-rack",
    description: "Modellspezifischer Gepaecktraeger mit SIC-Schnittstelle am Nuroad-Hinterbau.",
    url: "https://www.cube.eu/ch-de/gear/gepaecktraeger"
  },
  {
    id: "rack21",
    category: "Gepaeck",
    name: "ACID Gepaecktraeger SIC 2.0/2.1 27,5\"-29\" RILink CILink",
    brand: "ACID",
    articleNo: null,
    price: null,
    priceType: null,
    priceNote: "Von CUBE als passendes Zubehoer gelistet, ohne belegbaren Preis. Die eng verwandte Variante SIC 2.0 RILink wird im Fachhandel mit 59,95 EUR gefuehrt.",
    weightG: null,
    compatible: ["nuroad-pro-2027", "nuroad-race-2027", "nuroad-one-2027"],
    incompatibleNote: "Von CUBE auf den MY2027-Produktseiten als passendes Rahmenanbauteil gelistet (SIC 2.1 Schnittstelle).",
    requires: [],
    conflicts: ["rack"],
    mount: "rear-rack",
    description: "Semi-integrierter Gepaecktraeger fuer die SIC 2.0/2.1 Schnittstelle des Nuroad MY2027.",
    url: "https://www.cube.eu/ch-de/gear/gepaecktraeger"
  },

  /* -------------------------------- SCHUTZ ------------------------------- */
  {
    id: "mudguards",
    category: "Schutz",
    name: "ACID Schutzblechset Gravel/Nuroad 50 28\" BB Mount",
    brand: "ACID",
    articleNo: null,
    price: 39.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    mount: "both-wheels",
    description: "Schutzblechset speziell fuer Gravel-/Nuroad-Rahmen mit Tretlager-Montage.",
    url: "https://www.cube.eu/ch-de/gear/schutzbleche"
  },

  /* ------------------------------ BELEUCHTUNG ---------------------------- */
  {
    id: "frontlight",
    category: "Beleuchtung",
    name: "ACID Frontlicht PRO 30",
    brand: "ACID",
    articleNo: "93050",
    price: 32.95,
    priceType: "Haendlerpreis",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: ["lightset", "handlebarbag"],
    mount: "handlebar-light",
    description: "30 Lux, StVZO-zugelassen, Befestigung per Silikonband am Lenker.",
    url: "https://www.cube.eu/at-de/acid-frontlicht-pro-30/93050"
  },
  {
    id: "rearlight",
    category: "Beleuchtung",
    name: "ACID Ruecklicht PRO (StVZO)",
    brand: "ACID",
    articleNo: null,
    price: 18.95,
    priceType: "Haendlerpreis",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: ["lightset"],
    mount: "seatpost-light",
    description: "StVZO-zugelassenes Ruecklicht fuer die Sattelstuetze, USB-ladbar.",
    url: "https://www.cube.eu/ch-de/gear/beleuchtung"
  },
  {
    id: "lightset",
    category: "Beleuchtung",
    name: "ACID Beleuchtungsset PRO 30",
    brand: "ACID",
    articleNo: "93052",
    price: 39.95,
    priceType: "UVP",
    weightG: 67,
    compatible: "*",
    requires: [],
    conflicts: ["frontlight", "rearlight", "handlebarbag"],
    conflictNote: "Enthaelt Front- und Ruecklicht – einzeln dann nicht mehr noetig.",
    mount: "light-set",
    description: "ACID Frontlicht PRO 30 + ACID Ruecklicht PRO als Set, StVZO-zugelassen.",
    url: "https://www.cube.eu/de/acid-beleuchtungsset-pro-30/93052"
  },

  /* ------------------------------- SONSTIGES ----------------------------- */
  {
    id: "kickstand",
    category: "Sonstiges",
    name: "ACID Fahrradstaender FM",
    brand: "ACID",
    articleNo: "93470",
    price: 29.95,
    priceType: "Haendlerpreis",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    mount: "chainstay-stand",
    description: "Seitenstaender fuer Rahmen mit Montageschnittstelle zwischen den Kettenstreben.",
    url: "https://www.cube.eu/ch-de/gear/zubehoer"
  },
  {
    id: "bottlecage",
    category: "Sonstiges",
    name: "CUBE Flaschenhalter HPP",
    brand: "CUBE",
    articleNo: null,
    price: 16.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: ["framebag"],
    mount: "downtube-bottle",
    description: "Flaschenhalter fuer die Unterrohr-Aufnahme, inkl. Trinkflasche in der 3D-Ansicht.",
    url: "https://www.cube.eu/ch-de/gear/zubehoer"
  },
  {
    id: "phonemount",
    category: "Sonstiges",
    name: "ACID Handyhalterung",
    brand: "ACID",
    articleNo: null,
    price: 19.95,
    priceType: "UVP",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    mount: "stem-mount",
    description: "Halterung am Vorbau/Lenker. Hinweis: CUBE fuehrt hier eine Smartphone-Halterung, keinen eigenen Fahrradcomputer.",
    url: "https://www.cube.eu/ch-de/gear/zubehoer"
  },
  {
    id: "lock",
    category: "Sonstiges",
    name: "ACID Faltschloss RIGID 80 PURE",
    brand: "ACID",
    articleNo: "93350",
    price: 59.95,
    priceType: "Haendlerpreis",
    weightG: null,
    compatible: "*",
    requires: [],
    conflicts: [],
    mount: "downtube-lock",
    description: "Faltschloss, in der 3D-Ansicht in der Transporthalterung am Unterrohr.",
    url: "https://www.cube.eu/ch-de/gear/schloesser"
  }
];

window.CUBE_ACCESSORIES_META = {
  researchedAt: "2026-09-12",
  note: "Preise stammen aus CUBE-/ACID-Produktlistungen (UVP) bzw. aus CUBE-Fachhandelsshops (Haendlerpreis). Wo kein Preis belegbar war, steht bewusst kein Wert.",
  shopUrl: "https://www.cube.eu/ch-de/gear"
};
