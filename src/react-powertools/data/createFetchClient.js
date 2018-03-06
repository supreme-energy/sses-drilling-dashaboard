import {createClient} from 'fetch-plus';

/**
 * Fetch, but checks path for a trailing ? and removes it
 * @param path
 * @param options
 */
function fetchRemoveEmptyQuery (path, options) {
  // if (path) to work around bug in fetch-plus where it accidentally calls the function with no arguments
  // during initialization
  if (path) {
    const p = /\?$/.test(path) ? path.substr(0, path.length - 1) : path;
    return fetch(p, options);
  }
}

/**
 * Creates a fetch client with the provided options.
 * @param url
 * @param options
 * @param middleware
 * @returns {newClient}
 */
export default function createFetchClient(url, options, middleware = []) {
  // supply a fetch wrapper which will strip the trailing "?" from the path
  // if the query object is empty.
  const fpOptions = {
    ...options,
    fetch: fetchRemoveEmptyQuery,
    normalizeUrl: s => s && s.toString().replace(/(\/+$)/g, "")
  };
  return createClient(url, fpOptions, middleware).get;
}
