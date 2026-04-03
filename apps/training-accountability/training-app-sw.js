importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDwbQON3l5pMfA0QIuRoSkTpn2S-ZomH3A",
  authDomain: "training-accountability-app.firebaseapp.com",
  projectId: "training-accountability-app",
  storageBucket: "training-accountability-app.firebasestorage.app",
  messagingSenderId: "110778483282",
  appId: "1:110778483282:web:6334de85ff392f4b3f958b"
});

const messaging = firebase.messaging();
const CACHE_NAME = "training-accountability-cache-v3";
const APP_ASSETS = [
  "./",
  "./training-accountability-app.html",
  "./training-accountability-app.js",
  "./training-app.webmanifest",
  "./training-app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const requestUrl = new URL(event.request.url);
  const isAppShellRequest = APP_ASSETS.some((asset) => requestUrl.pathname.endsWith(asset.replace("./", "/"))) ||
    requestUrl.pathname === "/" ||
    requestUrl.pathname.endsWith("/training-accountability-app") ||
    requestUrl.pathname.endsWith("/training-accountability-app.html");
  event.respondWith(
    (async () => {
      if (isAppShellRequest) {
        try {
          const fresh = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, fresh.clone());
          return fresh;
        } catch (_error) {
          const cachedShell = await caches.match(event.request);
          return cachedShell || caches.match("./training-accountability-app.html");
        }
      }
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }
      try {
        return await fetch(event.request);
      } catch (_error) {
        return caches.match("./training-accountability-app.html");
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("./training-accountability-app.html"));
});

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "トレーニング習慣化アプリ";
  const options = {
    body: payload?.notification?.body || "新しい通知があります。",
    icon: "./training-app-icon.svg",
    badge: "./training-app-icon.svg"
  };
  self.registration.showNotification(title, options);
});
