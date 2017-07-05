import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import './styles/main.scss';
import AppModule from 'modules/App';
import createBrowserHistory from 'history/createBrowserHistory';
import {checkForRedirectAuthResult} from 'expero-react-labs/components/Auth0Lock';

// Store Initialization
// ------------------------------------
const history = createBrowserHistory();
const {profile, idToken, state, error: e} = checkForRedirectAuthResult("4bleMmUdPo1KoNeXNo71hwRBZgfHAej7", "experoinc.auth0.com", history);
if (e) {
  console.error(e);
}
if (profile) {
  console.log(`login: ${JSON.stringify(profile)}`);
  console.log(idToken);
  console.log(state);
}

const store = createStore(window.__INITIAL_STATE__, history);

// Render Setup
// ------------------------------------
const MOUNT_NODE = document.getElementById('root');

let render = (AppModule) => {
  const App = AppModule(store);
  ReactDOM.render(
    <App store={store} history={history} />,
    MOUNT_NODE
  );
};

// Development Tools
// ------------------------------------
if (__DEV__) {
  if (module.hot) {
    const renderApp = render;
    const renderError = (error) => {
      const RedBox = require('redbox-react').default;

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
    };

    render = (AppModule) => {
      try {
        renderApp(AppModule);
      }
      catch (e) {
        console.error(e);
        renderError(e);
      }
    };

    // Setup hot module replacement
    module.hot.accept('./modules/App', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE);
        render(require('./modules/App').default);
      })
    );
  }
}

// Let's Go!
// ------------------------------------
if (!__TEST__) render(AppModule);
