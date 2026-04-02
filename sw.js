// ─────────────────────────────────────────────────────────────
// IMPORTANT: Bump CACHE_NAME on every deployment.
// This is the only thing that signals to already-installed
// instances that a new version exists. Without changing this
// string, the browser sees sw.js as unchanged and no update
// flow is triggered.
// Convention: 'asana-quiz-YYYYMMDD', increment suffix if
// deploying multiple times in one day.
// ─────────────────────────────────────────────────────────────
const CACHE_NAME = 'asana-quiz-20260402';

const FILES_TO_CACHE = [
  '/asana-quiz/',
  '/asana-quiz/index.html',
  '/asana-quiz/manifest.json',
  '/asana-quiz/icons/icon-192.png',
  '/asana-quiz/icons/icon-512.png',
  '/asana-quiz/css/styles.css',
  '/asana-quiz/js/app.js',
  '/asana-quiz/js/quiz.js',
  '/asana-quiz/js/srs.js',
  '/asana-quiz/js/streak.js',
  '/asana-quiz/js/insights.js',
  '/asana-quiz/js/poses.js',
];

// Install: fetch all app files fresh into the new cache.
// If any request fails the install fails — the old SW keeps running.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  // Do NOT skipWaiting here. The page controls when the update applies
  // so it can defer until the user is not mid-session.
});

// Activate: delete all caches that belong to older versions,
// then claim any open clients so the SW is in control immediately.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fall back to network.
// Only intercept same-origin GET requests.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Message: the page sends 'SKIP_WAITING' when it is safe to take over.
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
