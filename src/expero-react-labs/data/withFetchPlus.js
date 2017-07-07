import withData from './withData';

/**
 * Similar to withData, only it will use a fetch-plus client: https://github.com/RickWong/fetch-plus
 * @param mapPropsToFetchPlusArgs : function(props):(String|Object)
 *    called to map from props to arguments to pass to the fetchPlus client.
 *
 *    If it returns a string, then that will be the path supplied to the `get` method:
 *       fetchPlusClient.get(string)
 *
 *    If it returns an object, then the object should have these properties:
 *      * path : String (required) the path string to pass to the fetchPlusClient
 *      * method : String (optional) the HTTP method to use.  Defaults to 'GET'
 *      * query : Object (optional) object of name/value pairs to be serialized as the query string in the request
 *      * body : Object (optional) object to be serialized and sent as body (except for GET method of course)
 *      * ... : any other valid option to fetch-plus client
 *
 * @param fetchPlusClient
 *     a client configured via fetchPlus `createClient` method.
 *     When the fetch is due to a poll, the `isPolling` option will be true
 *     on the call to the fetchPlusClient.  Custom middlewares may use this
 *     to adjust the caching policy of the request
 * @param options - same as withData, with the following additional options:
 *     * middlewares : Array<fetchPlusMiddleWare>
 *         If supplied, these middlewares will be passed to fetchPlusClient during the call
 * @returns {function(Component): WrappedComponent}
 */
export default function withFetchPlus(mapPropsToFetchPlusArgs, fetchPlusClient, options = {}) {
  const {middlewares, ...withDataOptions} = options;

  function propsToArgs (props) {
    const fetchArgs = mapPropsToFetchPlusArgs(props);

    return (typeof fetchArgs === "string") ? { path: fetchArgs } : fetchArgs;
  }

  function argsToPromise({path, ...options}, isPolling) {
    if (!path) {
      throw new Error(`withFetchPlus: propsToArgs failed to return a path value`);
    }

    options.isPolling = isPolling;
    return fetchPlusClient.get(path, options, middlewares);
  }

  return withData(propsToArgs, argsToPromise, withDataOptions);
}
