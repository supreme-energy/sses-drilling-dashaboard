import React, { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Progress from "@material-ui/core/CircularProgress";

import DrillPhaseKPI from "../../Kpi/DrillPhaseKPI";
import Interpretation from "../../Interpretation";
import WellOperation from "./WellOperation";
import ToolFace from "./ToolFace";
import ArialCrossSection from "./ArialCrossSection";
import CrossSectionDashboard from "./CrossSectionDashboard";
import classes from "./ComboDashboard.scss";
import { ComboContainerProvider } from "../containers/store";

const Measures = lazy(() => import(/* webpackChunkName: 'Measures' */ "./Measures"));

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <ComboContainerProvider>
      <div className={classes.comboDashboardWrapper}>
        <Suspense fallback={<Progress />}>
          <div className={classes.kpiRows}>
            <div className={classes.row}>
              <DrillPhaseKPI className={classes.drillPhaseKpi} />
              <ToolFace />
              <WellOperation />
              <ArialCrossSection />
            </div>
            <div className={classNames(classes.row, classes.graphRow)}>
              <Interpretation />
              <CrossSectionDashboard wellId={openedWellId} />
            </div>
          </div>
          <div className={classes.kpiColumn}>
            <Measures wellId={openedWellId} />
          </div>
        </Suspense>
      </div>
    </ComboContainerProvider>
  );
}

ComboDashboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default ComboDashboard;
