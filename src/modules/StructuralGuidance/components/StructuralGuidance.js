import React, { Suspense, lazy, useReducer } from "react";
import Progress from "@material-ui/core/CircularProgress";

import { useWellIdContainer } from "../../App/Containers";
import Interpretation from "../../Interpretation";
import classes from "./StructuralGuidance.scss";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "../../ComboDashboard/components/CrossSectionDashboard")
);

const LogDataCharts = lazy(() => import(/* webpackChunkName: 'LogDataCharts' */ "./LogDataCharts"));

export function StructuralGuidance() {
  const { wellId } = useWellIdContainer();

  const [view, updateView] = useReducer(
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    { x: 0, y: 0, xScale: 1, yScale: 1 }
  );

  return (
    <div className={classes.structuralGuidanceContainer}>
      <Suspense fallback={<Progress />}>
        <div className={classes.column}>
          <Interpretation className={classes.interpretationChart} />
        </div>
        <div className={classes.column}>
          <CrossSectionDashboard wellId={wellId} view={view} updateView={updateView} />
          <LogDataCharts wellId={wellId} view={view} />
        </div>
      </Suspense>
    </div>
  );
}

export default StructuralGuidance;
