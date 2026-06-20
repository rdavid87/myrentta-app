// This is the "Offline page" service worker with Background Sync and Push Notifications
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

const CACHE = "pwabuilder-page";
const offlineFallbackPage = "index.html";

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('myrentta-queue', {
  maxRetentionTime: 24 * 60,
});

workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    plugins: [bgSyncPlugin]
  })
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'MyRentta';
  const options = {
    body: data.body || 'Notificación de MyRentta',
    icon: '/myrentta-app/android/launchericon-192x192.png',
    badge: '/myrentta-app/android/launchericon-48x48.png',
    data: {
      url: data.url || '/myrentta-app/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/myrentta-app/';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});