import React from 'react';
import PropTypes from 'prop-types';
import createFetchClient from './createFetchClient';
import memoize from '../memoize';

export function getFetchClientFromContext(context, fetchClientId) {
  return context.fetchClients && context.fetchClients["fc" + fetchClientId];
}

export const mergeFetchClients = memoize((fetchClient, fetchClientId, parentFetchClients = {}) => {
  return !fetchClient ? parentFetchClients : {
    ...parentFetchClients,
    ["fc" + fetchClientId]: fetchClient,
  };
});

/**
 * Makes the supplied fetch client available to all child components of this component
 */
export default class FetchClientProvider extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    url: PropTypes.string.isRequired,
    options: PropTypes.object,
    middleware: PropTypes.array,
  };

  static defaultProps = {
    id: "",
    url: "",
    options: {},
    middleware: [],
  };

  static childContextTypes = {
    fetchClients: PropTypes.object,
  };

  static contextTypes = {
    fetchClients: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    const {url, options, middleware} = props;
    this._client = createFetchClient(url, options, middleware);
  }

  render() {
    return this.props.children;
  }

  getChildContext() {
    return {
      fetchClients: mergeFetchClients(this._client, this.props.id, this.context.fetchClients),
    };
  }
}
