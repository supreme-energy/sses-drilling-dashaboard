import UrlPattern from 'url-pattern';

const patternCache = Object.create(null);

function getPattern(path) {
  return patternCache[ path ] || (patternCache[ path ] = new UrlPattern(path));
}

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * fetch plus middleware that will perform variable substitution on the "path" arguments.
 * It will use values supplied in the "query" object to populate the variables.
 * Uses the pattern syntax defined by url-pattern library (https://github.com/snd/url-pattern)
 *
 * e.g. /foo/:bar or /foo(/:bar) etc
 */
export default () => (request) => {
  if (request.path) {
    const pattern = getPattern(request.path);
    if (pattern.names && pattern.names.length) {
      // do the veriable substitution
      request.path = pattern.stringify(request.options.query);

      // remove these variables from the query object
      request.options.query = {...request.options.query};
      for (const name of pattern.names) {
        delete request.options.query[name];
      }
    }
  }
};
