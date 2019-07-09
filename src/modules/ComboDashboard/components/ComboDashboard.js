import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Progress from "@material-ui/core/CircularProgress";

import DrillPhaseKPI from "../../Kpi/DrillPhaseKPI";
import Interpretation from "../../Interpretation";

import ToolFace from "./ToolFace";
import AerialCrossSection from "./AerialCrossSection";
import WellOperation from "./WellOperation";
import CrossSectionDashboard from "./CrossSectionDashboard";
import classes from "./ComboDashboard.scss";
import { SelectedSectionProvider } from "../../App/Containers";

const Measures = lazy(() => import(/* webpackChunkName: 'Measures' */ "./Measures"));

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  console.log("opened", openedWellId);
  return (
    <SelectedSectionProvider>
      <div className={classes.comboDashboardWrapper}>
        <Suspense fallback={<Progress />}>
          <div className={classes.kpiRows}>
            <div className={classes.row}>
              <DrillPhaseKPI className={classes.drillPhaseKpi} wellId={openedWellId} />
              <ToolFace />
              <WellOperation wellId={openedWellId} />
              <AerialCrossSection wellId={openedWellId} />
            </div>
            <div className={classNames(classes.row, classes.graphRow)}>
              <Interpretation className={"flex"} />
              <CrossSectionDashboard wellId={openedWellId} className={"flex-3"} />
            </div>
          </div>
          <div className={classes.kpiColumn}>
            <Measures wellId={openedWellId} />
          </div>
        </Suspense>
      </div>
    </SelectedSectionProvider>
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
