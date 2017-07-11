import UrlPattern from 'url-pattern';

const patternCache = Object.create(null);

function getPattern(path) {
  return patternCache[path] || (patternCache[path] = new UrlPattern(path));
}

/**
 * fetch plus middleware that will perform variable substitution on the "url" and "path" arguments.
 * It will use values supplied in the "query" object to populate the variables.
 * Uses the pattern syntax defined by url-pattern library (https://github.com/snd/url-pattern)
 *
 * e.g. /foo/:bar or /foo(/:bar) etc
 */
export default () => (request) => {
  if (request.path || request.url) {
    const path = request.url + request.path;
    const pattern = getPattern(path);
    if (pattern.names && pattern.names.length) {
      // do the veriable substitution
      request.url = pattern.stringify(request.options.query);
      request.path = "";

      // remove these variables from the query object
      request.options.query = {...request.options.query};
      for (const name of pattern.names) {
        delete request.options.query[name];
      }
    }
  }
};
