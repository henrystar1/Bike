# CUBE Nuroad Bike Builder 3D

Interaktiver 3D-Konfigurator für CUBE Nuroad Gravelbikes. Das Fahrrad selbst ist
**fest definiert** (Rahmen, Gabel, Schaltung, Bremsen, Laufräder, Cockpit usw. sind
nicht austauschbar) – konfiguriert wird ausschließlich **Farbe und Zubehör**.

---

## Starten

**Variante 1 – Doppelklick (einfachster Weg)**

`index.html` im Browser öffnen. Alle Daten liegen als JavaScript-Dateien vor,
deshalb funktioniert die Anwendung auch über `file://` ohne Webserver.

**Variante 2 – lokaler Webserver** (empfohlen, wenn Screenshots/Downloads
zickig sind oder du die JSON-Dateien statt der JS-Dateien laden willst)

```
start-server.bat        (Windows, benötigt Python)
./start-server.sh       (Linux/macOS)
```
Danach `http://localhost:8000` aufrufen.

Es wird **keine Internetverbindung**, **keine KI**, **keine API** und **keine
Datenbank** benötigt. three.js liegt lokal unter `vendor/`.

---

## Antrieb, Animation und Schalten

* **▶ Animation** in der Werkzeugleiste startet den Antrieb: Kurbel und Pedale
  drehen sich (Pedale bleiben waagerecht), die Kette läuft als Einzelglieder über
  Kettenblatt, Schaltröllchen und Ritzel, treibt die Kassette an und beide
  Laufräder drehen sich mit Reifenprofil und Speichen.
* **Schalten:** mit der Maus auf die Brems-/Schalthebel am Lenker klicken –
  **linke Maustaste = hochschalten**, **rechte Maustaste = runterschalten**.
  Der rechte Hebel schaltet die Kassette, der linke den Umwerfer (nur bei
  2-fach-Antrieben). Schaltwerk und Kette wechseln sichtbar das Ritzel, die
  Radgeschwindigkeit ändert sich entsprechend der Übersetzung.
* Die **Zähnezahlen stammen aus den Modelldaten** (`drivetrain` in
  `data/bikes.js`), Kettenblatt- und Ritzeldurchmesser werden daraus mit der
  1/2"-Kettenteilung berechnet. Ein Nuroad Race mit 48/31T und 11-36 sieht
  deshalb anders aus als ein Nuroad Pro mit 40T und 11-50.
* **Gangnummerierung:** Gang 1 = größtes Ritzel (leicht/langsam), höchster Gang =
  kleinstes Ritzel (schwer/schnell). Beim Nuroad Race 2027 ergibt 48×11 bei
  70 U/min rund 40 km/h, 31×36 rund 8 km/h.
* Bei hoher Raddrehzahl werden die Speichen transparenter dargestellt – sonst
  entsteht durch die Bildwiederholrate ein Stroboskop-Effekt, bei dem das Rad
  scheinbar stillsteht oder rückwärts läuft.
* Die Trittfrequenz lässt sich in der Gang-Anzeige zwischen 40 und 120 U/min
  einstellen; die angezeigte Geschwindigkeit folgt der Übersetzung.

## Bedienung

| Aktion | Steuerung |
|---|---|
| Modell drehen | Linke Maustaste ziehen · 1 Finger |
| Zoom | Mausrad · 2 Finger spreizen |
| Kamera verschieben | Rechte Maustaste ziehen · 2 Finger ziehen |
| Ansichten | Buttons *Seite / Vorne / Hinten / Oben / 3⁄4* |
| Auto-Rotation, Reset, Screenshot | Buttons oben in der 3D-Ansicht |

Weitere Funktionen: Konfiguration speichern/laden (LocalStorage),
Export/Import als JSON-Datei, Preisvergleich der hinterlegten Modelle,
Dark-/Light-Mode, Vollbild.

---

## Dateien

```
index.html                  Oberfläche
css/style.css               Design
js/app.js                   Logik: UI, Preisrechner, Speichern, Screenshot
js/scene.js                 Renderer, Licht, Environment, Kamera/Steuerung
js/bike-builder.js          erzeugt das 3D-Fahrrad prozedural
js/accessory-builder.js     erzeugt die 3D-Zubehörteile prozedural
js/materials.js             Materialien (Lack, Carbon, Alu, Gummi, Glas …)
data/bikes.js               ** Fahrraddaten – hier pflegen **
data/accessories.js         ** Zubehördaten – hier pflegen **
data/bikes.json             Nur-Lese-Export der Fahrraddaten
data/accessories.json       Nur-Lese-Export der Zubehördaten
tools/export-json.js        erzeugt die beiden .json-Dateien neu (Node.js)
vendor/three.min.js         three.js r149 (MIT-Lizenz)
vendor/OrbitControls.js     Kamerasteuerung aus dem three.js-Projekt (MIT)
```

**Wichtig:** Die maßgeblichen Datendateien sind die `.js`-Dateien in `data/`.
Ihr Inhalt ist reines JSON, nur einer globalen Variablen zugewiesen – nur so
lädt die Anwendung ohne Webserver. Die `.json`-Dateien sind ein Export für
andere Werkzeuge; nach Änderungen an den `.js`-Dateien mit
`node tools/export-json.js` neu erzeugen.

---

## Weitere Fahrräder hinzufügen

In `data/bikes.js` einen Eintrag ergänzen:

```js
{
  id: "nuroad-c62-slx-2026",        // eindeutig, wird in Zubehör-Kompatibilität verwendet
  model: "CUBE Nuroad C:62 SLX",
  year: 2026,
  series: "Nuroad C:62",
  price: 2999.00,                    // oder null, wenn kein Preis belegbar ist
  priceVerified: false,
  priceNote: "Quelle des Preises",
  dataStatus: "verified",            // verified | partial | unverified
  weightKg: 9.4,                     // oder null
  geometry: "hpa",                   // hpa | superlite  (Rahmenprofil im 3D-Modell)
  url: "https://www.cube.eu/...",
  colors: [
    { id: "grey-black", name: "grey´n´black", articleNo: "…",
      hex: "#5a5f66", accent: "#101214", forkHex: "#14171a", url: "https://www.cube.eu/..." }
  ],
  spec: { "Rahmen": "…", "Gabel": "…", "Schaltwerk": "…" }
}
```

Das 3D-Modell wird automatisch erzeugt. Aus `spec` liest die Anwendung ab, ob
z. B. eine Carbongabel, ein 2-fach-Kettenblatt oder 180-mm-Bremsscheiben
dargestellt werden (`js/app.js`, Funktion `bikeConfigFor`).

## Weiteres Zubehör hinzufügen

1. Eintrag in `data/accessories.js` anlegen (`id`, `category`, `name`, `price`,
   `compatible`, `requires`, `conflicts`, `mount`, `url` …).
2. In `js/accessory-builder.js` eine Funktion `A.<id> = function (M, mt) { … }`
   ergänzen, die eine `THREE.Group` zurückgibt. `mt` enthält die Montagepunkte
   des Fahrrads (`mt.bar`, `mt.saddle`, `mt.rearHub`, `mt.downTube`,
   `mt.frameTriangle`, `mt.bb`, `mt.seatpost` …).

Ohne passende Builder-Funktion erscheint das Teil in der Liste, aber es wird
bewusst **kein Platzhalter** im 3D-Modell gezeigt.

---

## Herkunft der CUBE-Daten

Alle Fahrrad- und Zubehördaten wurden bei der Erstellung recherchiert und liegen
seitdem lokal im Projekt – zur Laufzeit findet keine Recherche statt.

* Ausstattung, Farbbezeichnungen und Artikelnummern stammen aus CUBE-Produkt-
  und Serienseiten.
* Preise stammen aus CUBE-/ACID-Produktlistungen (als `UVP` gekennzeichnet) oder
  aus CUBE-Fachhandelsshops bzw. Preisvergleichen (als `Händlerpreis` bzw. über
  `priceVerified: false` gekennzeichnet).
* **Wo kein Preis belegbar war, steht `null`** – die Anwendung zeigt dann
  „Preis nicht hinterlegt“ an. Es werden keine Preise geschätzt oder erfunden.
* Für **Nuroad Pro 2027** (1.099 EUR UVP, 11,4 kg, Art. 1135200) und
  **Nuroad Race 2027** (1.499 EUR UVP, 10,4 kg, Art. 1135500) liegen die
  vollständigen offiziellen CUBE-Produktdaten vor: komplette Ausstattungsliste,
  Farben (taiga´n´blue / mysticpurple´n´black bzw. inkgrey´n´grey /
  lindgreen´n´matcha) und UVP.
* Die 2026-Einträge behalten ihre Händler-/Preisvergleichspreise und sind als
  solche gekennzeichnet.
* Farbwerte (Hex) sind **visuelle Annäherungen** an die CUBE-Farbbezeichnung,
  keine offiziellen Farbwerte.

Maßgeblich bleibt immer die offizielle CUBE-Seite bzw. der Fachhandel.

---

## 3D-Modelle und Recht

Es werden **keine CUBE-eigenen oder sonstigen fremden 3D-Dateien** verwendet.
Sämtliche Geometrie (Rahmen, Gabel, Laufräder, Antrieb, Cockpit, Zubehör) wird
zur Laufzeit prozedural aus Grundkörpern erzeugt – siehe `js/bike-builder.js`
und `js/accessory-builder.js`. Die Proportionen orientieren sich an öffentlich
zugänglichen Geometrie- und Ausstattungsangaben eines 28"-Gravelbikes. Das
Ergebnis ist eine eigenständige, stilisiert-realistische Nachbildung, kein
Abbild eines geschützten CAD-Modells. Marken- und Modellnamen werden nur
beschreibend verwendet; das Projekt steht in keiner Verbindung zu CUBE.

Ein Austausch gegen echte `.glb`-Dateien ist vorbereitet: in
`js/app.js` (`rebuildBike`) müsste statt `CubeBikeBuilder.build(...)` ein
`GLTFLoader` verwendet und die Montagepunkte aus dem Modell gelesen werden.

---

## Was Internet benötigt (und was nicht)

| Funktion | Internet |
|---|---|
| 3D-Ansicht, Farben, Zubehör, Preisrechner, Speichern, Screenshot | **nein** |
| „CUBE Produktseite öffnen“ / „Alle Artikel bei CUBE öffnen“ | ja |

**Kein automatischer Warenkorb:** Die öffentliche CUBE-Website bietet keine
dokumentierte Schnittstelle, um einen Warenkorb per Link zu befüllen. Die
Anwendung öffnet deshalb ehrlich die jeweiligen offiziellen Produktseiten und
behauptet nichts anderes.

---

## Bekannte Grenzen

* Die 3D-Modelle sind realistisch proportioniert (Radstand 1040 mm, Tretlager-
  absenkung 70 mm, Gabel mit realistischer Einbauhöhe und 50 mm Vorbiegung),
  aber keine 1:1-Abbildung der echten CUBE-Rahmen. Schriftzüge und Logos werden
  bewusst nicht nachgebildet.
* Rahmengrößen werden nicht abgebildet; dargestellt wird eine mittlere Größe.
* Gewichte werden nur addiert, wenn Hersteller-Gewichtsangaben vorliegen.

## Lizenz

Eigener Code frei verwendbar. three.js und OrbitControls stehen unter der
MIT-Lizenz (siehe `vendor/`).
