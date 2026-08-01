/* Service worker, makes the app installable and usable offline in a wadi
   with no signal. Bump CACHE when you change content, or users keep the old
   version until the cache expires. */
const CACHE = "oman-v54";

const CORE = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/planner.js",
  "./js/unlock.js",
  "./js/analytics.js",
  "./data/content.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:"reload" skips the browser's HTTP cache, so a new worker never
      // seeds its cache with files a previous visit left behind.
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" }))).catch(() => {}))
      /* NO automatic skipWaiting. The page decides when the new build takes
         over: instantly if the reader has not started reading yet, or on a
         tap if they have. Auto-activating here used to mean the reload could
         land mid-scroll. See the registration block in index.html. */
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks the waiting worker to take over when the reader taps "Update".
// Without this a new build sits in the wings until every tab is closed.
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Never cache the Gumroad licence check or analytics, straight to network.
  if (req.url.includes("api.gumroad.com") || req.url.includes(".supabase.co")) return;

  // Network-first for our own data so edits show up; cache as fallback.
  if (req.url.includes("/data/")) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Images and icons never change once published, pure cache-first.
  if (req.destination === "image") {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // Shell, css, js: stale-while-revalidate. Serve the cache instantly (works
  // offline in a wadi), but refresh the copy in the background, so even if a
  // deploy raced the CDN and cached a stale file, the next open heals it
  // instead of pinning it until the next CACHE bump.
  e.respondWith(
    caches.match(req).then(hit => {
      const refresh = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});
