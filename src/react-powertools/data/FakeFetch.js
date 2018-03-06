import React from 'react';
import PropTypes from 'prop-types';
import {createFakeFetch} from './fakeFetchClient';
import {getFetchClientFromContext, mergeFetchClients} from './FetchClientProvider';

export default class FakeFetch extends React.Component {
  static propTypes = {
    /**
     * FetchClient id to cache
     */
    id: PropTypes.string,
    /**
     * React children to render (these children will have their requests cached)
     */
    children: PropTypes.node,
    routes: PropTypes.object,
  };

  static defaultProps = {
    id: "",
    maxSize: 1000,
    log: false,
    logFunc: console.log.bind(console),
  }

  constructor(props) {
    super(props);
    this._fake = createFakeFetch(props.routes);
  }

  _fetchClient = (url, options) => {
    const fetchClient = getFetchClientFromContext(this.context, this.props.id);
    return this._fake(fetchClient, url, options);
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
