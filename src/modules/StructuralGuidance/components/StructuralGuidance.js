import React, { Suspense, lazy } from "react";
import Progress from "@material-ui/core/CircularProgress";

import { useWellIdContainer } from "../../App/Containers";
import Interpretation from "../../Interpretation";
import classes from "./StructuralGuidance.scss";

import { useViewportView } from "../../ComboDashboard/hooks";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "../../ComboDashboard/components/CrossSectionDashboard")
);

const LogDataCharts = lazy(() => import(/* webpackChunkName: 'LogDataCharts' */ "./LogDataCharts"));

export function StructuralGuidance() {
  const { wellId } = useWellIdContainer();
  const viewName = "StructuralGuidance";
  const [view, updateView] = useViewportView({ key: viewName, wellId });

  return (
    <div className={classes.structuralGuidanceContainer}>
      <Suspense fallback={<Progress />}>
        <div className={classes.column}>
          <Interpretation className={classes.interpretationChart} />
        </div>
        <div className={classes.column}>
          <CrossSectionDashboard wellId={wellId} view={view} updateView={updateView} viewName={viewName} />
          <LogDataCharts wellId={wellId} view={view} />
        </div>
      </Suspense>
    </div>
  );
}

export default StructuralGuidance;
