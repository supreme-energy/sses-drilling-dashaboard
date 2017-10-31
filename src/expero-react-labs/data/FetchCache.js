import React from 'react';
import PropTypes from 'prop-types';
import {createFetchCache} from './cachedFetchClient';
import {getFetchClientFromContext, mergeFetchClients} from './FetchClientProvider';

export default class FetchCache extends React.Component {
  static propTypes = {
    /**
     * FetchClient id to cache
     */
    id: PropTypes.string,
    /**
     * React children to render (these children will have their requests cached)
     */
    children: PropTypes.node,
    /**
     * Maximum number of entries in the cache.  Defaults to 1000
     */
    maxSize: PropTypes.number,
    /**
     * Expire cache entries older than this (ms).  Set to 0 to disable time-based cache expirations
     */
    maxAge: PropTypes.number,
    /**
     * Enable cache logging
     */
    log: PropTypes.bool,
    /**
     * If logging is enabled, function called with message to be logged. defaults to console.log()
     */
    logFunc: PropTypes.func,
    /**
     * Optional function used to filter which requests are subject to caching by this cache.
     * Should return true if this request is controlled by this cache.
     * If not supplied, all requests are subject to being cached
     * (url : string, fetchOptions : object) : bool
     */
    predicate: PropTypes.func,
  };

  static defaultProps = {
    id: "",
    maxSize: 1000,
    log: false,
    logFunc: console.log.bind(console),
  }

  constructor(props) {
    super(props);

    const {maxSize, log, logFunc, predicate: cachePredicate, maxAge} = props;
    this._cache = createFetchCache({maxSize, maxAge, log, logFunc, cachePredicate});
  }

  _fetchClient = (url, options) => {
    const fetchClient = getFetchClientFromContext(this.context, this.props.id);
    return this._cache(fetchClient, url, options);
  }

  static childContextTypes = {
    fetchClients: PropTypes.object,
  };

  static contextTypes = {
    fetchClients: PropTypes.object,
  };

  getChildContext() {
    return {
      fetchClients: mergeFetchClients(this._fetchClient, this.props.id, this.context.fetchClients),
    };
  }

  render() {
    return this.props.children;
  }
}
