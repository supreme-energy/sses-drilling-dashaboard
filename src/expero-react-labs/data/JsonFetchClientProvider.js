import React from 'react';
import PropTypes from 'prop-types';
import {createClient} from 'fetch-plus';
import plusJson from 'fetch-plus-json';
import plusUrlPattern from './fetch-plus-url-pattern';
import FetchClientProvider from "expero-react-labs/data/FetchClientProvider";
import shallowequal from 'shallowequal';

function fetchRemoveEmptyQuery(path, ...args) {
  // if (path) to work around bug in fetch-plus where it accidentally calls the function with no arguments
  // during initialization
  if (path) {
    const p = /\?$/.test(path) ? path.substr(0, path.length - 1) : path;
    return fetch(p, ...args);
  }
}

function createFetchClient(url, options, additionalMiddleware = []) {
  const middleware = [plusJson(), plusUrlPattern(), ...additionalMiddleware];

  // supply a fetch wrapper which will strip the trailing "?" from the path
  // if the query object is empty.
  const fpOptions = {...options, fetch: fetchRemoveEmptyQuery};
  const fpClient = createClient(url, fpOptions, middleware);

  // return a single function because that is what withFetchClient wants
  return fpClient.get;
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
    id: PropTypes.string,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);

    this.state = {
      client: createFetchClient(props.url, props.options, props.middlewares),
    };
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.url !== this.props.url) ||
      !shallowequal(nextProps.options, this.props.options) ||
      !shallowequal(nextProps.middlewares, this.props.middlewares)) {
      this.setState({ client: createFetchClient(nextProps.url, nextProps.options, nextProps.middlewares) });
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
