import React, { Suspense } from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Progress from "@material-ui/core/CircularProgress";

import FetchClientProvider from "react-powertools/data/FetchClientProvider";
import FetchCache from "react-powertools/data/FetchCache";
import plusJsonStrict from "react-powertools/data/fetch-plus-strict";
import plusErrorJson from "react-powertools/data/fetch-plus-error-json";
import plusUrlPattern from "react-powertools/data/fetch-plus-url-pattern";

import ComboDashboardModule from "modules/ComboDashboard";
import DirectionalGuidanceModule from "modules/DirectionalGuidance";
import DrillingAnalyticsModule from "modules/DrillingAnalytics";
import StructuralGuidanceModule from "modules/StructuralGuidance";
import WellExplorerModule from "modules/WellExplorer";
import plusBasicAuth from "fetch-plus-basicauth";
import WellUpdate from "./WellUpdate";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

// Import UI State Providers
import { TimeSliderProvider } from "./Containers";

// Lazy load header
const PageLayout = React.lazy(() => import("layouts/PageLayout"));
const fetchClientOptions = { mode: "cors", credentials: "include" };

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  fetchMW = [
    plusJsonStrict(),
    plusErrorJson(),
    plusUrlPattern(),
    plusBasicAuth(__CONFIG__.username, __CONFIG__.password)
  ];

  fetchMWMock = [plusJsonStrict(), plusErrorJson(), plusUrlPattern()];

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { store, history } = this.props;
    const ComboDashboard = ComboDashboardModule(store);
    const DirectionalGuidance = DirectionalGuidanceModule(store);
    const DrillingAnalytics = DrillingAnalyticsModule(store);
    const StructuralGuidance = StructuralGuidanceModule(store);
    const WellExplorer = WellExplorerModule(store);

    return (
      <Suspense fallback={<Progress />}>
        <Provider store={store}>
          <BrowserRouter basename={__CONFIG__.basename}>
            <FetchClientProvider url={`/api`} options={fetchClientOptions} middleware={this.fetchMW}>
              <FetchClientProvider id="mock" url={`/data`} options={fetchClientOptions} middleware={this.fetchMWMock}>
                <FetchCache>
                  <div style={{ height: "100%" }}>
                    <PageLayout history={history}>
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <TimeSliderProvider>
                          <Route path="/:wellId" component={WellUpdate} />
                          <Switch>
                            <Route path="/:wellId/combo" exact component={ComboDashboard} />
                            <Route path="/:wellId/drilling" exact component={DrillingAnalytics} />
                            <Route path="/:wellId/structural" exact component={StructuralGuidance} />
                            <Route path="/:wellId/directional" exact component={DirectionalGuidance} />
                            <Route path="/:wellId?" component={WellExplorer} />
                          </Switch>
                        </TimeSliderProvider>
                      </MuiPickersUtilsProvider>
                    </PageLayout>
                  </div>
                </FetchCache>
              </FetchClientProvider>
            </FetchClientProvider>
          </BrowserRouter>
        </Provider>
      </Suspense>
    );
  }
}

export default App;
