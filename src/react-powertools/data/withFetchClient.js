import PropTypes from 'prop-types';
import withData from './withData';
import isEqual from 'lodash/isEqual';
import {getFetchClientFromContext} from './FetchClientProvider';

const EMPTY = {};

// We need a custom isEqual function
function argsEqual(a, b) {
  if (a === b) {
    return true;
  }

  // if one fetches and one doesnt return false
  if (a.noFetch !== b.noFetch) {
    return false;
  }

  // if they are not fetching then return true
  if (a.noFetch) {
    return true;
  }

  const aa = a.fetchArgs;
  const bb = b.fetchArgs;

  return (
    a.fetchClient === b.fetchClient &&
    aa.path === bb.path &&
    aa.method === bb.method &&
    aa.cache === bb.cache &&
    isEqual(aa.query, bb.query) && // deep equals
    isEqual(aa.body, bb.body) && // deep equals
    isEqual(aa.headers, bb.headers)
  );
}

/**
 * Injects the following prop into your component:
 *
 * data: PropTypes.shape({
 *   loading: PropTypes.bool, // true when data is being fetched after the props change
 *   polling: PropTypes.bool, // true when data is being re-fetched due to pollInterval expiring
 *   fetchingMore: PropTypes.bool // true when more data is being fetched to append to existing data
 *   error: PropTypes.any, // if the fetch fails, this will be the error from the fetch, otherwise undefined
 *   result: PropTypes.any, // if the fetch succeeds, this will be the result of the fetch, otherwise undefined
 *   refresh: PropTypes.func.isRequired, // can be called with no arguments to force a refresh of the data
 *      (e.g. a forced poll call)
 *   replaceResult: PropTypes.func.isRequired, // can be called to replace the result data with new data
 *      as if it had been returned by the fetch call.  The data.error will be cleared/replaced
 *      with the new value as well.
 *      replaceResult(newResult, newError, newLoadingFlag)
 *   fetchMore: PropTypes.func.isRequired, // can be called to fetch more data and merge it with existing data
 *      called like: fetchMore(options, (existingData, newData) => mergedData)
 *      See return value of propsToQuery for what the options can look like.
 *      e.g. post({ body: { ... }, query: { ... }})
 *   post: PropTypes.func.isRequired // can be called with fetch options to post to the server.
 *      See return value of propsToQuery for what the options can look like.
 *      e.g. post({ body: { ... }, query: { ... }})
 *   put: PropTypes.func.isRequired // same as post, but does a PUT
 *   get: PropTypes.func.isRequired // same as post, but does a GET
 *   delete: PropTypes.func.isRequired // same as post, but does a DELETE
 *   patch: PropTypes.func.isRequired // same as post, but does a PATCH
 *   patch: PropTypes.func.isRequired // same as post, but does a PATCH
 * }).isRequired,
 *
 * @param path : String
 *   The API subpath to call.  Can contain variables denoted with a colon.  Variable values will be pulled
 *   from the query object returned by propsToQuery.
 *
 *   Example: "/foo/bar", "/foo/:companyId/:pageNum"
 *
 * @param propsToQuery :
 *       function(props: Object, context: Object, currentResult: object) : QueryObject | FetchOptionsObject
 *   Called whenever the component props change or whenever it is time to poll for new result.
 *   Should return the query parameters to use for the fetch call.
 *
 *   * props - the current props
 *   * context - the current React context of the component
 *   * currentResult - If polling, then the current results.  Can be used to help configure the new query.
 *        If not being called due to polling (e.g. being called due to props change), then this parameter will be
 *        undefined.
 *
 *   If the path included variables, then their values will come from this query object.
 *   Any remaining properties of the query object will be passed as URL query parameters in the call.
 *   The returned query object will be merged with the options.args.query object supplied to
 *   withFetchClient.
 *
 *   Example: { companyId: props.companyId, pageNum: props.pageNumber }
 *
 *   If propsToQuery returns a falsy value (null, undefined, etc), then this indicates that there should be
 *   no fetch call for these props.  In this case, data.result will be undefined.
 *
 *   Instead of just returning a query object, propsToQuery can instead return a fetch options object.  This
 *   object will be merged with the options.args object passed to withFetchClient.  In addition to normal
 *   fetch options, this object can contain a query object.  It could also contain a path property which will
 *   override the path property supplied to withFetchClient.
 *
 *   Examples:
 *     { method: "POST", body: "the body", query: { companyId: 122343 } }
 *     { path: "/my/special/path" }
 *     { query: { companyId: 11234 }, headers: { "X-FOO": "BAR VALUE } }
 *
 * @param options - same as withData, with the following additional options:
 *     * args: Object
 *        default arguments to pass to fetch().  Merged with result from propsToQuery
 *
 *        example1: args: { method: "POST", headers: { "X-FOO": "Bar" }, cache: "no-store" }
 *        example2: args: { query: { param1: "32" } }
 *
 *     * id: String
 *         Usually not necessary.  But if your app needs multiple different fetch clients,
 *         you will render multiple FetchClientProviders, each with a different id.
 *         Use this option to indicate which client you need to use for this component.
 *
 *     * mapResult: Function(fetchResult: any, query: object, currentResult):any
 *         If supplied, will be run on the result of a successful fetch response
 *         and the return value will be used as data.result.
 *         Second argument will be the query returned by propsToQuery
 *         If polling, the third argument will contain the current result.  This gives you an opportunity
 *         to merge the polling result with the current result if you wish.
 *         If not polling, the third argument will be undefined.
 *
 * @returns {function(Component): WrappedComponent}
 */
export default function withFetchClient(path, propsToQuery, options = EMPTY) {
  const {
    args: { query: defaultQuery, ...defaultFetchArgs } = EMPTY,
    id = "",
    mapResult,
    mapData,
    ...withDataOptions
  } = options;

  function processResult(prevResult, result, query, isPolling) {
    return mapResult ? mapResult(result, query, isPolling ? prevResult : undefined) : result;
  }

  let currentFetchClient;

  function constructFetchArgs(query, defaultQuery) {
    const fetchArgs = {
      path,
      method: "GET",
      cache: "default",
      ...defaultFetchArgs,
    };

    if (query) {
      if (query.query) {
        // they gave us a full fetch args object, not just a query
        // copy the object over onto our fetchArgs (overriding the defaults)
        Object.assign(fetchArgs, query);
      }
      else {
        fetchArgs.query = query;
      }

      // now merge the defaultQuery with the query returned by propsToQuery
      if (defaultQuery) {
        fetchArgs.query = { ...defaultQuery, ...fetchArgs.query };
      }
    }
    else if (defaultQuery) {
      fetchArgs.query = defaultQuery;
    }

    return fetchArgs;
  }

  function runMethod (method, query = {}) {
    const fetchArgs = constructFetchArgs(query, undefined);
    fetchArgs.method = method;
    fetchArgs.cache = "no-cache";
    return currentFetchClient(fetchArgs.path, fetchArgs);
  }

  function fetchMore (wdFetchMore, options, mergeFunc) {
    const fetchArgs = constructFetchArgs(options, undefined);
    const promise = currentFetchClient(fetchArgs.path, fetchArgs);
    wdFetchMore(promise, mergeFunc);
  }

  withDataOptions.isEqual = argsEqual;
  withDataOptions.mapData = data => {
    const d = {
      ...data,
      fetchMore: fetchMore.bind(this, data.fetchMore),
      get: runMethod.bind(null, "GET"),
      post: runMethod.bind(null, "POST"),
      put: runMethod.bind(null, "PUT"),
      delete: runMethod.bind(null, "DELETE"),
      patch: runMethod.bind(null, "PATCH"),
    };
    return mapData ? mapData(d) : d;
  };

  function propsToArgs(props, context, prevResult) {
    // Get the fetch client from context
    const fetchClient = getFetchClientFromContext(context, id);
    if (!fetchClient) {
      throw new Error(`Could not find FetchClientProvider with id=${id}.`);
    }

    const query = propsToQuery && propsToQuery(props, context, prevResult);
    if (propsToQuery && !query) {
      // propsToQuery returned a falsy value.  This means there is no fetch this time.
      return { fetchClient, noFetch: true };
    }

    const fetchArgs = constructFetchArgs(query, defaultQuery);

    return {fetchClient, query, fetchArgs};
  }

  function argsToPromise(args, isPolling, prevResult, props, context) {
    const args2 = isPolling ? propsToArgs(props, context, prevResult) : args;
    const { fetchClient, noFetch, query, fetchArgs } = args2;
    currentFetchClient = fetchClient;

    if (noFetch) {
      // no fetch this time.
      return Promise.resolve(processResult(prevResult, undefined, undefined, isPolling));
    }

    let fa = fetchArgs;
    if (isPolling) {
      // if isPolling, then adjust the cache option to force a call to the server
      switch (fa.cache) {
        case "default":
        case "force-cache":
        case "only-if-cached":
          // TODO: provide option to use "reload" instead of "no-cache"
          fa = {...fa, cache: "no-cache"};
          break;
        default:
          break;
      }
    }

    const promise = fetchClient(fa.path, fa);
    return promise.then(r => processResult(prevResult, r, query, isPolling));
  }

  const withDataConnector = withData(
    (props, context) => propsToArgs(props, context, undefined),
    argsToPromise,
    withDataOptions
  );

  return Component => {
    const DataComponent = withDataConnector(Component);

    // Add fetchClients to the context type
    DataComponent.contextTypes = {
      ...DataComponent.contextTypes,
      fetchClients: PropTypes.object,
    };

    return DataComponent;
  };
}
