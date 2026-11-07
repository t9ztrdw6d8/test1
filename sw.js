/*
 * Service worker van de MR96-webapp: bewaart de app op het toestel zodat hij ook zonder internet start.
 * Pagina's: eerst het netwerk (zo krijg je altijd de nieuwste versie), anders de bewaarde kopie.
 * Overige bestanden (iconen, manifest): eerst de bewaarde kopie.
 * Verhoog VERSIE bij elke nieuwe publicatie, dan worden oude kopieën opgeruimd.
 */
const VERSIE = "mr96-hvac-v1";
const BESTANDEN = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const sleutel of await caches.keys()) if (sleutel !== VERSIE) await caches.delete(sleutel);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const verzoek = e.request;
  if (verzoek.method !== "GET" || new URL(verzoek.url).origin !== self.location.origin) return;

  if (verzoek.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const antwoord = await fetch(verzoek);
        if (antwoord.ok) (await caches.open(VERSIE)).put("./index.html", antwoord.clone());
        return antwoord;
      } catch {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  e.respondWith(caches.match(verzoek).then(r => r || fetch(verzoek)));
});
