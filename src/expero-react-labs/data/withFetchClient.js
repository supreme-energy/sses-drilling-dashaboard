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

  // if one is EMPTY and the other is not, then they are not equal
  if ((a === EMPTY) !== (b === EMPTY)) {
    return false;
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
 * @param path : String
 *   The API subpath to call.  Can contain variables denoted with a colon.  Variable values will be pulled
 *   from the query object returned by propsToQuery.
 *
 *   Example: "/foo/bar", "/foo/:companyId/:pageNum"
 *
 * @param propsToQuery : function(props: Object, context: Object) : QueryObject | FetchOptionsObject
 *   Called whenever the component props change.  Should return the query parameters to use for the fetch call.
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
 *     * mapResult: Function(fetchResult: any, queyr: object):any
 *         If supplied, will be run on the result of a successful fetch response
 *         and the return value will be used as data.result.
 *         Second argument will be the query returned by propsToQuery
 *
 * @returns {function(Component): WrappedComponent}
 */
export default function withFetchClient(path, propsToQuery, options = EMPTY) {
  const {
    args : { query: defaultQuery, ...defaultFetchArgs } = EMPTY,
    id = "",
    mapResult,
    ...withDataOptions
  } = options;

  withDataOptions.isEqual = argsEqual;

  function propsToArgs(props, context) {
    const query = propsToQuery && propsToQuery(props, context);
    if (propsToQuery && !query) {
      // propsToQuery returned a falsy value.  This means there is no fetch this time.
      return EMPTY;
    }

    const fetchArgs = {path, method: "GET", cache: "default", ...defaultFetchArgs};

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

    // Get the fetch client from context
    const fetchClient = getFetchClientFromContext(context, id);
    if (!fetchClient) {
      throw new Error(`Could not find FetchClientProvider with id=${id}.`);
    }

    return {fetchClient, query, fetchArgs};
  }

  function argsToPromise({fetchClient, query, fetchArgs}, isPolling) {
    if (!fetchClient) {
      // no fetch this time.
      return Promise.resolve(mapResult && mapResult());
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
      }
    }

    const promise = fetchClient(fa.path, fa);

    return mapResult ? promise.then(result => mapResult(result, query)) : promise;
  }

  const withDataConnector = withData(propsToArgs, argsToPromise, withDataOptions);

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
