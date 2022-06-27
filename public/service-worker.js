const CACHE_NAME = 'deno_cache';
/**
 * These files will be cached on client side on first page load
 *
 */
const filesToCache = [
    // js
    '/',
    '/javascripts/app.js',
    '/javascripts/canvas.js',
    '/javascripts/chat.js',
    '/javascripts/idb/index.js',
    '/javascripts/database.js',
    // '/javascripts/home_page.js',
    '/javascripts/index.js',
    '/javascripts/uploadreport.js',

    // css
    '/stylesheets/style.css',

    // libraries
    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'
];

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(async function () {
        console.log('[ServiceWorker] Removing old cache');
        caches.delete(CACHE_NAME);

        console.log('[ServiceWorker] Caching app shell');
        cache = await caches.open(CACHE_NAME);
        return cache.addAll(filesToCache);
    }());
});


/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Fixes a corner case in which the app wasn't returning the latest data.
    return self.clients.claim();
});

/**
 * Service worker handles all fetch events
 */
self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);

    // do not cache request related to socket.io
    // data is already cached in indexDB
    if (e.request.url.indexOf('socket.io/?') > -1) {
        e.respondWith(fetch(e.request));
        return;
    }

    /**
     * ignore post route to uploading stories
     * do not cache post request
     */
    if (e.request.url.indexOf('/stories/upload') > -1) {
        // upload story(post) not cached
        e.respondWith(fetch(e.request));
        return;
    }

    /**
     * This is case for getting list of stories.
     * Always go and get data from server and save to cache as this data is going to be updated by multiple clients
     * Returning cached version is not good in such case
     * Return cached version of data only in case of failure or client is offline browsing
     */
    if (e.request.url.indexOf('/stories') > -1) {
        e.respondWith(async function () {
            try {
                response = await fetch(e.request);
                // validate the response
                // Do not cache if not 200, return error to calling function
                if (!response || response.status !== 200) {
                    console.log(`Response error: [${response.status}]: ${response.statusText}`);
                    return response
                }
                // else cache and return
                console.log(`[Service Worker] Response story data from server`);
                var responseToCache = response.clone();  // make deep copy of response
                cache = await caches.open(CACHE_NAME);
                cache.put(e.request, responseToCache);  // save updated response to cache
                // return response form server
                return response;
            } catch (error) {
                console.log(`[Service Worker] Response story data from cache`);
                cachedResponse = await caches.match(e.request);
                // return cached response in case failure or offline browser
                return cachedResponse;
            }
        }());
        return;
    }

    /**
     * If request is not for any of the above routes, then more likely return the cached data
     * If cached data is not found, fetch new data from server, if valid response add it to cache
     * and then return new response
     */
    e.respondWith(async function () {
        response = await caches.match(e.request);

        // Cache hit - return response
        if (response) {
            return response;
        }

        response = await fetch(e.request);

        // validate the response
        // Do not cache if not 200, return error to calling function
        if (!response || response.status !== 200) {
            console.log(`Response error: [${response.status}]: ${response.statusText}`);
            return response
        }

        // before returning add new response to cache so that next request gets cache hit
        var responseToCache = response.clone();
        cache = await caches.open(CACHE_NAME)
        cache.put(e.request, responseToCache);

        return response;
    }());
});
