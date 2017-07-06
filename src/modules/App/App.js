import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import CounterModule from 'modules/Counter';
import HomeModule from 'modules/Home';
import PageLayout from 'layouts/PageLayout';
import RequireAuth0 from 'expero-react-labs/auth0/RequireAuth0';

const loginStyle = {
  border: "solid 1px black",
  display: "inline-block"
};

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  shouldComponentUpdate () {
    return false;
  }

  render () {
    const { store, history } = this.props;
    const Home = HomeModule(store);
    const Counter = CounterModule(store);
    return (
      <Provider store={store}>
        <Router history={history}>
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
        </Router>
      </Provider>
    );
  }
}

export default App;
