import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import CounterModule from 'modules/Counter';
import HomeModule from 'modules/Home';
import PageLayout from 'layouts/PageLayout';

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

  render () {
    const { store, history, auth0 } = this.props;
    const Home = HomeModule(store);
    const Counter = CounterModule(store);
    return (
      <Provider store={store}>
        <Router history={history}>
          <div style={{ height: '100%' }}>
            <PageLayout history={history} auth0={auth0}>
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/counter" component={Counter} />
              </Switch>
            </PageLayout>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
