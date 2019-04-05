import React, { Suspense } from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import { Router, Route, Switch } from "react-router-dom";

import FetchClientProvider from "react-powertools/data/FetchClientProvider";
import FetchCache from "react-powertools/data/FetchCache";
import FakeFetch from "react-powertools/data/FakeFetch";
import plusJsonStrict from "react-powertools/data/fetch-plus-strict";
import plusErrorJson from "react-powertools/data/fetch-plus-error-json";
import plusUrlPattern from "react-powertools/data/fetch-plus-url-pattern";

import ComboDashboardModule from "modules/ComboDashboard";
import DirectionalGuidanceModule from "modules/DirectionalGuidance";
import DrillingAnalyticsModule from "modules/DrillingAnalytics";
import StructuralGuidanceModule from "modules/StructuralGuidance";
import WellExplorerModule from "modules/WellExplorer";
import WellImporterModule from "modules/WellImporter";
import crossFilterStore from "../../store/crossFilterStore";

// Lazy load header
const PageLayout = React.lazy(() => import("layouts/PageLayout"));

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    // Construct the Fetch middleware

    this.fetchMW = [plusJsonStrict(), plusErrorJson(), plusUrlPattern()];
  }

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
    const WellImporter = WellImporterModule(store);
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Provider store={store}>
          <Router history={history}>
            <FetchClientProvider url={"/api"} options={{ mode: "cors" }} middleware={this.fetchMW}>
              {/* cache the api methods that do not require authentication */}
              <FetchCache predicate={() => {}}>
                <div style={{ height: "100%" }}>
                  {/* place FakeFetch at any level to intercept calls within its children */}
                  <FakeFetch routes={crossFilterStore}>
                    <PageLayout history={history}>
                      <Switch>
                        <Route path="/" exact component={WellExplorer} />
                        <Route path="/importer" exact component={WellImporter} />
                        <Route path="/combo" exact component={ComboDashboard} />
                        <Route path="/drilling" exact component={DrillingAnalytics} />
                        <Route path="/structural" exact component={StructuralGuidance} />
                        <Route path="/directional" exact component={DirectionalGuidance} />
                      </Switch>
                    </PageLayout>
                  </FakeFetch>
                </div>
              </FetchCache>
            </FetchClientProvider>
          </Router>
        </Provider>
      </Suspense>
    );
  }
}

export default App;
