import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import CounterModule from 'modules/Counter';
import HomeModule from 'modules/Home';
import PageLayout from 'layouts/PageLayout';
import RequireAuth0 from 'expero-react-labs/auth0/RequireAuth0';
import Auth0RedirectHandler from 'expero-react-labs/auth0/Auth0RedirectHandler';
import Auth0FetchClientProvider from 'expero-react-labs/auth0/Auth0FetchClientProvider';

const loginStyle = {
  border: "solid 1px black",
  display: "inline-block"
};

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    auth0: PropTypes.shape({
      clientId: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
  }

  shouldComponentUpdate () {
    return false;
  }

  includeAuthToken = ({path}) => path.startsWith("/auth/");

  render () {
    const { store, history, auth0 } = this.props;
    const Home = HomeModule(store);
    const Counter = CounterModule(store);
    return (
      <Provider store={store}>
        <Router history={history}>
          <Auth0RedirectHandler clientId={auth0.clientId} domain={auth0.domain} history={history}>
            <Auth0FetchClientProvider
              store={store}
              includeToken={this.includeAuthToken}
              url="http://localhost:4040/api"
              options={{mode: "cors"}}
            >
              <div style={{ height: '100%' }}>
                <PageLayout history={history}>
                  <RequireAuth0 redirectMode history={history} inline style={loginStyle}>
                    <Switch>
                      <Route path="/" exact component={Home} />
                      <Route path="/counter" component={Counter} />
                    </Switch>
                  </RequireAuth0>
                </PageLayout>
              </div>
            </Auth0FetchClientProvider>
          </Auth0RedirectHandler>
        </Router>
      </Provider>
    );
  }
}

export default App;
