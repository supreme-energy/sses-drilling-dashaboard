import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import './styles/main.scss';
import AppModule from 'modules/App';
import createBrowserHistory from 'history/createBrowserHistory';

// Store Initialization
// ------------------------------------
const history = createBrowserHistory();
const store = createStore(window.__INITIAL_STATE__, history);

// TODO: get injected from server
const auth0 = {
  clientId: "4bleMmUdPo1KoNeXNo71hwRBZgfHAej7",
  domain: "experoinc.auth0.com",
};

// Handle Auth0
// ------------------------------------
// Render Setup
// ------------------------------------
const MOUNT_NODE = document.getElementById('root');

let render = (AppModule) => {
  const App = AppModule(store);
  ReactDOM.render(
    <App store={store} history={history} auth0={auth0} />,
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
