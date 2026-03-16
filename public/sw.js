const CACHE_NAME = 'pto-tracker-v4'

self.addEventListener('install', () => {
  // Don't auto-skip — wait for the page to tell us via postMessage
  // so we can show a "new version available" prompt first
})

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Network-first for HTML (always get fresh index.html)
// Cache-first for hashed assets (JS/CSS with content hash in filename)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Hashed assets (/assets/*.js, /assets/*.css) — cache-first, they never change
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // Everything else (HTML, manifest) — network-first so updates land immediately
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
