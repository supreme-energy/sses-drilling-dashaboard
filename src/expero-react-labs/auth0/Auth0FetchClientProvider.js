import React from 'react';
import PropTypes from 'prop-types';
import plusAuth0 from './fetch-plus-auth0';
import JsonFetchClientProvider from '../data/JsonFetchClientProvider';

export default class Auth0FetchClientProvider extends React.Component {
  static propTypes = {
    /**
     * The underlying provider to use.  Defaults to JsonFetchClientProvider
     */
    Provider: PropTypes.func,
    /**
     * The Redux store
     */
    store: PropTypes.object.isRequired,
    /**
     * If provided, will be invoked on each request to determine
     * if the token should be added to this request.
     * Will be given a request object with:
     *   - url - the root url of the client
     *   - path - the request path (full request path = url + path
     *   - options - additional options to fetch
     *
     * Should return true if the auth token should be sent with the request
     */
    includeToken: PropTypes.func,
    /**
     * Additional fetch-plus middleware to include in the client
     */
    middlewares: PropTypes.array,
  };

  static defaultProps = {
    Provider: JsonFetchClientProvider,
  };

  constructor(props) {
    super(props);
    this.state = {
      middleware: plusAuth0(props.store, props.includeToken),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.store !== this.props.store || nextProps.includeToken !== this.props.includeToken) {
      this.setState({middleware: plusAuth0(nextProps.store, nextProps.includeToken)});
    }
  }

  render() {
    const {Provider, middlewares} = this.props;
    const mw = middlewares ? [...middlewares, this.state.middleware] : [this.state.middleware];
    return <Provider {...this.props} middlewares={mw} />;
  }
}
