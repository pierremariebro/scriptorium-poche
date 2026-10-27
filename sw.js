// Garde en cache la page, les données, la bibliothèque et le modèle : tout fonctionne ensuite hors connexion.
// Les fichiers du site sont rafraîchis quand le réseau est là ; le modèle et la bibliothèque restent en cache.
const CACHE = "scriptorium-poche-v1";
// Les morceaux des données (donnees.bin.NN, vecteurs.bin.NN) sont gardés à leur premier chargement.
const SITE = ["./", "index.html", "manifest.webmanifest", "version.json", "dimanches.json"];

self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SITE)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("scriptorium-poche-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const local = new URL(e.request.url).origin === location.origin;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const garde = await c.match(e.request);
    if (garde && !local) return garde;                       // bibliothèque et modèle : le cache d'abord
    try {
      const rep = await fetch(e.request);
      if (rep.ok) c.put(e.request, rep.clone());
      return rep;
    } catch {
      return garde || Response.error();                       // hors connexion : la copie gardée
    }
  }));
});
