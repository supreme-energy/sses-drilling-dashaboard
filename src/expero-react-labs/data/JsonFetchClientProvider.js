import React from 'react';
import PropTypes from 'prop-types';
import {createClient} from 'fetch-plus';
import plusJson from 'fetch-plus-json';
import plusUrlPattern from './fetch-plus-url-pattern';
import FetchClientProvider from "expero-react-labs/data/FetchClientProvider";
import shallowequal from 'shallowequal';
import cachedFetchClient from './cachedFetchClient';

function fetchRemoveEmptyQuery(path, options) {
  // if (path) to work around bug in fetch-plus where it accidentally calls the function with no arguments
  // during initialization
  if (path) {
    const p = /\?$/.test(path) ? path.substr(0, path.length - 1) : path;
    return fetch(p, options);
  }
}

function createFetchClient(url, options, additionalMiddleware = [], cacheMaxSize, cacheMaxAge) {
  const middleware = [plusJson(), plusUrlPattern(), ...additionalMiddleware];

  // supply a fetch wrapper which will strip the trailing "?" from the path
  // if the query object is empty.
  const fpOptions = {...options, fetch: fetchRemoveEmptyQuery};
  const fpClient = createClient(url, fpOptions, middleware).get;

  if (cacheMaxSize <= 0) {
    // no local cache
    return fpClient;
  }

  // wrap the fetch plus client in a cached fetch client
  const cacheOptions = {
    maxSize: cacheMaxSize,
    maxAge: cacheMaxAge,
  };

  return cachedFetchClient(fpClient, cacheOptions);
}

/**
 * Provides a fetch client pre-configured to convert the server response to JSON
 * as well as perform variable substitution (via https://github.com/snd/url-pattern) on the request path
 */
export default class JsonFetchClientProvider extends React.Component {
  static propTypes = {
    /**
     * Base URL for this client.
     *
     * e.g. "/api/v1" or "https://some.server.com/restapi"
     */
    url: PropTypes.string.isRequired,
    /**
     * Option options object to pass to fetchPlus.  Basically
     * default values to pass to fetch() if not overridden by a component
     * using this client.
     */
    options: PropTypes.object,
    /**
     * Additional fetchPlus middleware to use
     */
    middlewares: PropTypes.array,
      /**
       * the max number of elements in the local cache.  Set to 0 to disable local cache.
       * Default: 100
       */
    cacheMaxSize: PropTypes.number,
    /**
     * Maximum age (in ms) of cache entries.  Entries will be evicted from the cache if they
     * are older than this.  Set to 0 to disable eviction of stale cache items
     * Defaults to 10 minutes (600000).
     */
    cacheMaxAge: PropTypes.number,
    id: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    cacheMaxSize: 100,
    cacheMaxAge: 10 * 60 * 1000,
  };

  constructor(props) {
    super(props);

    this.state = {
      client: createFetchClient(props.url, props.options, props.middlewares, props.cacheMaxSize, props.cacheMaxAge),
    };
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.url !== this.props.url) ||
      !shallowequal(nextProps.options, this.props.options) ||
      !shallowequal(nextProps.middlewares, this.props.middlewares) ||
      (nextProps.cacheMaxAge !== this.props.cacheMaxAge) ||
      (nextProps.cacheMaxSize !== this.props.cacheMaxSize)) {
      this.setState({
        client: createFetchClient(
          nextProps.url,
          nextProps.options,
          nextProps.middlewares,
          nextProps.cacheMaxSize,
          nextProps.cacheMaxAge)
      });
    }
  }

  render() {
    return (
      <FetchClientProvider client={this.state.client} id={this.props.id}>
        {this.props.children}
      </FetchClientProvider>
    );
  }
}
