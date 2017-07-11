import React from 'react';
import PropTypes from 'prop-types';

export function getFetchClientFromContext(context, fetchClientId) {
  return context.fetchClients && context.fetchClients["fc" + fetchClientId];
}

function mergeFetchClients(fetchClient, fetchClientId, parentFetchClients = {}) {
  return !fetchClient ? parentFetchClients : {
    ...parentFetchClients,
    ["fc" + fetchClientId]: fetchClient,
  };
}

export default class FetchClientProvider extends React.Component {
  static propTypes = {
    client: PropTypes.function.isRequired,
    id: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    id: "",
  };

  static childContextTypes = {
    fetchClients: PropTypes.object,
  };

  static contextTypes = {
    fetchClients: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      fetchClients: mergeFetchClients(props.client, props.id, context.fetchClients),
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ((nextContext.fetchClients !== this.context.fetchClients) ||
      (nextProps.client !== this.props.client) ||
      (nextProps.id !== this.props.id)) {
      this.setState({ fetchClients: mergeFetchClients(nextProps.client, nextProps.id, nextContext.fetchClients) });
    }
  }

  render() {
    return this.props.children;
  }

  getChildContext() { return this.state.fetchClients; }
}
