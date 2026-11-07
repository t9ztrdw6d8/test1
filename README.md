# MR96 HVAC

Webapp om de HVAC-regelaar van een MR96-treinstel live uit te lezen via een USB-serieel adapter.
Werkt in **Chrome op Android** (via WebUSB, bv. met de ACT AC6002 / Prolific PL2303) en in
**Chrome of Edge op een computer** (via Web Serial). Installeerbaar als app en ook bruikbaar zonder
internet.

De app draait volledig in de browser: meetwaarden, logs en commando's gaan nergens naartoe.

## Online zetten met GitHub Pages
1. Maak een gratis account op [github.com](https://github.com) als je er nog geen hebt.
2. Klik rechtsboven op **+ → New repository**.
   - Geef een naam, bv. `mr96-hvac`.
   - Kies **Public**: GitHub Pages is gratis voor openbare repositories.
   - Klik op **Create repository**.
3. Klik op **uploading an existing file**.
   - Pak de zip eerst uit op je computer. GitHub pakt zelf geen zip uit.
   - Sleep **alle bestanden en de map `icons`** uit de uitgepakte map naar het venster.
   - Klik op **Commit changes**.
4. Ga naar **Settings → Pages**.
   - Kies bij *Source* **Deploy from a branch**.
   - Kies branch **main** en map **/ (root)**.
   - Klik op **Save**.
5. Wacht 1 à 2 minuten. Het adres verschijnt bovenaan die pagina:
   `https://<jouw-gebruikersnaam>.github.io/mr96-hvac/`

## Op je Android-telefoon
1. Open het adres in **Chrome**.
2. Tik op **Installeren** in de melding bovenaan, of kies in het menu ⋮ **App installeren** of
   **Toevoegen aan startscherm**.
3. Sluit de adapter aan via USB-C, open de app en tik op **Verbinden**. Kies de adapter in de lijst.
   - Vraagt Android eerst met welke app de adapter geopend moet worden, kies dan Chrome of sluit die
     vraag.
   - Gebruikt een andere app (bv. de MR96-APK of een seriële terminal) de adapter al, sluit die dan
     eerst.

Na het eerste bezoek start de app ook zonder internet.

## Een nieuwe versie publiceren
1. Upload de gewijzigde bestanden opnieuw (stap 3), met dezelfde naam. Dat overschrijft de oude.
2. Verhoog in `sw.js` het versienummer (`mr96-hvac-v1` → `mr96-hvac-v2`). Dan halen geïnstalleerde
   apps de nieuwe versie op.

## Wie kan wat zien?
- **De app:** iedereen die het adres kent of vindt, kan hem openen.
- **De broncode:** bij een openbare repository kan iedereen de broncode bekijken, met de
  protocolbeschrijving en de signaalnamen.

Ga na of je die informatie mag publiceren.

## Bestanden
| Bestand | Doel |
|---|---|
| `index.html` | De volledige app |
| `manifest.webmanifest` | Naam, icoon en kleuren voor de installeerbare app |
| `sw.js` | Service worker: offline gebruik |
| `icons/` | App-iconen |
| `.nojekyll` | Laat GitHub Pages de bestanden ongewijzigd serveren |
