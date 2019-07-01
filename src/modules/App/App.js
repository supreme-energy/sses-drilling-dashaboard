import React, { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Progress from "@material-ui/core/CircularProgress";
import plusBasicAuth from "fetch-plus-basicauth";
import FetchClientProvider from "react-powertools/data/FetchClientProvider";
import FetchCache from "react-powertools/data/FetchCache";
import plusJsonStrict from "react-powertools/data/fetch-plus-strict";
import plusErrorJson from "react-powertools/data/fetch-plus-error-json";
import plusUrlPattern from "react-powertools/data/fetch-plus-url-pattern";

import PageLayout from "layouts/PageLayout";
import ComboDashboardModule from "modules/ComboDashboard";
import DirectionalGuidanceModule from "modules/DirectionalGuidance";
import DrillingAnalyticsModule from "modules/DrillingAnalytics";
import StructuralGuidanceModule from "modules/StructuralGuidance";
import WellExplorerModule from "modules/WellExplorer";
import WellUpdate from "./WellUpdate";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

// Import UI State Providers
import { TimeSliderProvider, DrillPhaseProvider, LastIndexStateProvider, AppStateProvider } from "./Containers";

// Import Provider initialStates
import {
  INITIAL_DRILL_PHASE_STATE,
  INITIAL_TIME_SLIDER_STATE,
  INITIAL_LAST_INDEX_STATE
} from "../../constants/timeSlider";

// Lazy load toolbars
const HeaderToolbar = lazy(() => import(/* webpackChunkName: 'HeaderToolbar' */ "modules/HeaderToolbar"));
const TimeSliderToolbar = lazy(() => import(/* webpackChunkName: 'TimeSliderToolbar' */ "modules/TimeSliderToolbar"));

// Lazy load header
const fetchClientOptions = { mode: "cors", credentials: "include" };

function filterForceRefreshProps(request) {
  if (request.options.query) {
    delete request.options.query.wellInfoRefreshId;
  }
}

// backend api is checking for content type to be exactly "application/json"
function ensureContentType(request) {
  request.options.headers["Content-Type"] = "application/json";
}

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  fetchMW = [
    plusJsonStrict(),
    plusErrorJson(),
    plusUrlPattern(),
    plusBasicAuth(__CONFIG__.username, __CONFIG__.password),
    filterForceRefreshProps,
    ensureContentType
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
                        <TimeSliderProvider initialState={INITIAL_TIME_SLIDER_STATE}>
                          <AppStateProvider>
                            <LastIndexStateProvider initialState={INITIAL_LAST_INDEX_STATE}>
                              <DrillPhaseProvider initialState={INITIAL_DRILL_PHASE_STATE}>
                                <Route path="/:wellId" component={WellUpdate} />
                                <Switch>
                                  <Route path="/:wellId?" exact component={WellExplorer} />
                                  <HeaderToolbar history={history}>
                                    <TimeSliderToolbar>
                                      <Route path="/:wellId/combo" exact component={ComboDashboard} />
                                      <Route path="/:wellId/drilling" exact component={DrillingAnalytics} />
                                      <Route path="/:wellId/structural" exact component={StructuralGuidance} />
                                      <Route path="/:wellId/directional" exact component={DirectionalGuidance} />
                                    </TimeSliderToolbar>
                                  </HeaderToolbar>
                                </Switch>
                              </DrillPhaseProvider>
                            </LastIndexStateProvider>
                          </AppStateProvider>
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
