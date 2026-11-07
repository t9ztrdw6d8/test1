# PL2303 Seriële Terminal (WebUSB)

Browser-terminal voor USB-seriële adapters met een **Prolific PL2303**-chip (o.a. **ACT AC6002**), werkt op **Android Chrome/Edge** via WebUSB.

## Bestanden

| Bestand | Functie |
|---|---|
| `index.html` | Testterminal (baudrate kiezen, verbinden, commando's sturen) |
| `pl2303-webusb.js` | PL2303-driver (ES-module, herbruikbaar in eigen dashboard) |
| `.nojekyll` | Zorgt dat GitHub Pages de bestanden ongewijzigd serveert |

## Op GitHub Pages zetten

1. Ga naar <https://github.com/new>, maak een **public** repository, bv. `pl2303-web`.
2. Klik **Add file → Upload files** en sleep alle bestanden uit deze map erin (ook `.nojekyll`). Klik **Commit changes**.
3. Ga naar **Settings → Pages**.
   - *Source*: **Deploy from a branch**
   - *Branch*: **main** / **/ (root)** → **Save**
4. Na ±1 minuut staat de site op: `https://<gebruikersnaam>.github.io/pl2303-web/`

### Alternatief via de command line

```bash
cd pl2303-web
git init -b main
git add .
git commit -m "PL2303 WebUSB terminal"
git remote add origin https://github.com/<gebruikersnaam>/pl2303-web.git
git push -u origin main
```

Daarna stap 3 hierboven.

## Gebruik op Android

1. Open de GitHub Pages-URL in **Chrome** (niet Firefox/Samsung Internet).
2. Sluit de AC6002 aan via USB-C (OTG). Toont Android een app-kiezer → **Annuleren**.
3. Kies baudrate → **Verbinden** → selecteer *USB-Serial Controller*.

## Problemen

- **"Unable to claim interface"**: een andere app claimt de adapter. Sluit die app, trek de adapter uit en steek opnieuw in.
- **Adapter niet in de lijst**: controleer VID/PID via `chrome://usb-internals` (verwacht `067b:2303`).
- **Rommeltekens**: baudrate/pariteit klopt niet.

## Gebruik in eigen code

```js
import { PL2303 } from './pl2303-webusb.js';
const port = (await PL2303.getPaired()) ?? (await PL2303.request()); // vanuit klik
port.onData = (bytes) => console.log(new TextDecoder().decode(bytes));
await port.open({ baudRate: 9600 });
await port.write('\r');
```
