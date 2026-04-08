/* ==========================================================
   SERVICE WORKER – SPA + PWA PROFESSIONAL
   ========================================================== */

const VERSION = "v1.0.0";

const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

/* ----------------------------------
   Arquivos estáticos essenciais
---------------------------------- */
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",

  /* CSS */
  "/assets/css/style.css",
  "/assets/css/reset.css",
  "/assets/css/fonts.css",
  "/assets/css/variables.css",
  "/assets/css/global.css",
  "/assets/css/actions.css",
  "/assets/css/animations.css",
  "/assets/css/layout.css",
  "/assets/css/components.css",
  "/assets/css/app.css",

  /* JS */
  "/assets/js/router.js",
  "/assets/js/app.js",

  /* Páginas SPA */
  "/pages/home.html",
  "/pages/branding.html",
  "/pages/process-builder.html",
  "/pages/offline.html",

  /* Ícones */
  "/assets/img/icon-192.svg",
  "/assets/img/icon-512.svg",
];

/* ==========================================================
   INSTALL – cache inicial
========================================================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  self.skipWaiting();
});

/* ==========================================================
   ACTIVATE – limpeza de caches antigos
========================================================== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );

  self.clients.claim();
});

/* ==========================================================
   FETCH – estratégias inteligentes
========================================================== */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Apenas GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* -----------------------------
     Páginas HTML (SPA)
  ----------------------------- */
  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches
            .match(request)
            .then((cached) => cached || caches.match("/pages/offline.html"));
        }),
    );
    return;
  }

  /* -----------------------------
     CSS, JS, Fonts, Imagens
     Cache First
  ----------------------------- */
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
          })
        );
      }),
    );
    return;
  }

  /* -----------------------------
     Outros requests (fallback)
  ----------------------------- */
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
