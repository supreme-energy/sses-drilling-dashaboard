import PropTypes from 'prop-types';
import withData from './withData';
import isEqual from 'lodash/isEqual';
import {getFetchClientFromContext} from './FetchClientProvider';

// We need a custom isEqual function
function argsEqual(a, b) {
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
 *     * transform: Function(fetchResult: any, queyr: object):any
 *         If supplied, will be run on the result of a successful fetch response
 *         and the return value will be used as data.result.
 *         Second argument will be the query returned by propsToQuery
 *
 * @returns {function(Component): WrappedComponent}
 */
export default function withFetchClient(path, propsToQuery, options = {}) {
  const {
    args : { query: defaultQuery, ...defaultFetchArgs } = {},
    id = "",
    transform,
    ...withDataOptions
  } = options;

  withDataOptions.isEqual = argsEqual;

  function propsToArgs(props, context) {
    const query = propsToQuery && propsToQuery(props, context);
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

    return transform ? promise.then(result => transform(result, query)) : promise;
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
