import delay from '../delay';

export function createFakeFetch(routes = {}) {
  function callFetch(fetchClient, url, options = {}) {
    const route = routes[url];
    const method = options.method || "GET";
    const handler = route && route[method];
    if (!handler) {
      return fetchClient(url, options);
    }

    return delay(route.delay || 100).then(() => handler(url, options));
  }

  return callFetch;
}

export default function fakeFetchClient(fetchClient, options) {
  const cache = createFakeFetch(options);
  return cache.bind(null, fetchClient);
}
