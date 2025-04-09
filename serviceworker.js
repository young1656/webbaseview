const CACHE_NAME = "calorie-tracker-cache-v5"; // Increment to force cache refresh
const OFFLINE_URL = "/webbase/OfflinePage.html";

const FILES_TO_CACHE = [
    "/webbase/OfflinePage.html",
    "/webbase/style.css",
    "/webbase/offlineScript.js"
];

// Install: Cache essential files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📌 Caching offline files...");
            return cache.addAll(FILES_TO_CACHE);
        }).catch((error) => {
            console.error("❌ Cache failed:", error);
        })
    );
    self.skipWaiting();
});

// Activate: Clear old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("🗑 Removing old cache:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Serve from cache first, then fallback to network
self.addEventListener("fetch", (event) => {
    console.log("Fetching:", event.request.url);

    event.respondWith(
        fetch(event.request).then((response) => {
            return response;
        }).catch(() => caches.match(event.request)) // Serve from cache if offline
    );
});

self.addEventListener("install", (event) => {
    self.skipWaiting(); // Forces immediate activation
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    console.log("Clearing old cache:", cache);
                    return caches.delete(cache);
                })
            );
        })
    );
    self.clients.claim(); // Take control of all pages immediately
});


