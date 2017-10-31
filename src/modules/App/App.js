import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import CounterModule from 'modules/Counter';
import HomeModule from 'modules/Home';
import PageLayout from 'layouts/PageLayout';
import RequireAuth0 from 'expero-react-labs/auth0/RequireAuth0';
import FetchClientProvider from 'expero-react-labs/data/FetchClientProvider';
import FetchCache from 'expero-react-labs/data/FetchCache';
import plusJson from 'fetch-plus-json';
import plusUrlPattern from 'expero-react-labs/data/fetch-plus-url-pattern';
import plusAuth0 from 'expero-react-labs/auth0/fetch-plus-auth0';
import Auth0RedirectHandler from 'expero-react-labs/auth0/Auth0RedirectHandler';

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

  constructor(props) {
    super(props);
    // Construct the Fetch middleware
    const {store} = props;
    this.fetchMW = [
      plusJson(),
      plusUrlPattern(),
      plusAuth0(store, ({path}) => this.isAuthRoute(path)),
    ];
  }

  isAuthRoute = url => url.startsWith("/auth/");
  isNotAuthRoute = url => !this.isAuthRoute(url);

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
          <FetchClientProvider url={"http://localhost:4040/api"} options={{mode: "cors"}} middleware={this.fetchMW}>
            {/* cache the api methods that do not require authentication */}
            <FetchCache predicate={this.isNotAuthRoute}>
              <Auth0RedirectHandler clientId={auth0.clientId} domain={auth0.domain} history={history}>
                <div style={{ height: '100%' }}>
                  <PageLayout history={history}>
                    <RequireAuth0 redirectMode history={history} inline style={loginStyle}>
                      {/*
                        * cache the api methods that require authentication.
                        * By placing this cache *inside* the RequireAuth0 element,
                        * we ensure that the cache gets destroyed whenever the user
                        * logs out.  That way, if a different user logs in, they will
                        * not get any cached results from the first user
                        * */}
                      <FetchCache predicate={this.isAuthRoute}>
                        <Switch>
                          <Route path="/" exact component={Home} />
                          <Route path="/counter" component={Counter} />
                        </Switch>
                      </FetchCache>
                    </RequireAuth0>
                  </PageLayout>
                </div>
              </Auth0RedirectHandler>
            </FetchCache>
          </FetchClientProvider>
        </Router>
      </Provider>
    );
  }
}

export default App;
