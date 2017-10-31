import LRUCache from '../lru-cache';

// Options for the various fetch cache values here: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
const cacheSettings = {
  "default": { read: true, write: true, stale: false, fetch: true },
  "no-store": { read: false, write: false, fetch: true },
  "reload": { read: false, write: true, fetch: true },
  "no-cache": { read: false, write: true, fetch: true, stale: false },
  "force-cache": { read: true, write: true, stale: true, fetch: true },
  "only-if-cached": { read: true, fetch: false, stale: true },
};

// any method not in this list will default to "no-store"
const methodCacheDefault = {
  "GET": "default",
};

function getCacheOption(fetchOptions) {
  // might be a string, or might be an object { cache: String, maxAge: Number? }
  const value = fetchOptions.cache || methodCacheDefault[fetchOptions.method || "GET"] || "no-store";
  return (typeof value === "string") ? { cache: value } : value;
}

function getCacheKey(url, {query, method = "GET", body, headers}) {
  return JSON.stringify({url, query, method, body, headers});
}

/**
 * Wraps the provided fetchClient in a new fetchClient that implements an LRU cache
 * The cache honors the "cache" fetch option: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
 * @param fetchClient
 * @param options
 * @returns {newClient}
 */
export function createFetchCache(options = {}) {
  const {
    maxSize : max = 1000,
    maxAge,
    entrySize : length,
    log = false,
    logFunc = console.log.bind(console),
    cachePredicate,
  } = options;

  const lruCache = new LRUCache({max, maxAge, length, stale: true});

  function callFetch(fetchClient, url, options = {}) {
    if (cachePredicate && !cachePredicate(url, options)) {
      // this request is not subject to caching by this cache
      return fetchClient(url, options);
    }

    const {cache, maxAge} = getCacheOption(options);
    const settings = cacheSettings[cache] || cacheSettings["default"];
    let cacheKey;

    if (settings.read) {
      // check the lruCache to see if we have this request
      cacheKey = cacheKey || getCacheKey(url, options);

      const cachedPromise = lruCache.get(cacheKey);
      if (cachedPromise) {
        if (!lruCache.has(cacheKey)) {
          // we retrieved (and removed) a stale value from the cache
          if (settings.stale) {
            // put it back into the cache still marked as stale (by setting maxAge to -1)
            lruCache.set(cacheKey, cachedPromise, -1);
            if (log) {
              logFunc(`${cacheKey} (cache hit)`);
            }
            return cachedPromise;
          }
        }
        else {
          // the value in the cache is not stale.
          if (log) {
            logFunc(`${cacheKey} (cache hit)`);
          }
          return cachedPromise;
        }
      }

      if (log) {
        logFunc(`${cacheKey} (cache miss)`);
      }
    }

    if (!settings.fetch) {
      return Promise.reject(new Error("request not found in cache and cache set to 'only-if-cached'"));
    }

    // Add headers to the request to disable browser caching
    const newOptions = {...options, cache: undefined};
    newOptions.headers = options.headers ? {...options.headers} : {};
    newOptions.headers["pragma"] = "no-store";
    newOptions.headers["cache-control"] = "no-store";

    // Issue the request
    const promise = fetchClient(url, newOptions);

    if (settings.write) {
      // store the promise in the cache
      cacheKey = cacheKey || getCacheKey(url, options);
      lruCache.set(cacheKey, promise, maxAge);

      // Now watch the promise.  If it rejects, then remove it from the cache.  We do not want to cache broken promises
      promise.catch(() => lruCache.del(cacheKey));
    }

    return promise;
  }

  callFetch.clearCache = () => lruCache.reset();
  callFetch.pruneCache = () => lruCache.prune();

  return callFetch;
}

export default function cachedFetchClient(fetchClient, options) {
  const cache = createFetchCache(options);
  return cache.bind(null, fetchClient);
}
