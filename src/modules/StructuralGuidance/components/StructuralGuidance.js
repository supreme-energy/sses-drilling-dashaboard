import React, { Suspense, lazy } from "react";
import Progress from "@material-ui/core/CircularProgress";

import { useWellIdContainer } from "../../App/Containers";
import Interpretation from "../../Interpretation";
import LogDataCharts from "./LogDataCharts";
import classes from "./StructuralGuidance.scss";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "../../ComboDashboard/components/CrossSectionDashboard")
);

export function StructuralGuidance() {
  const { wellId } = useWellIdContainer();
  return (
    <div className={classes.structuralGuidanceContainer}>
      <Suspense fallback={<Progress />}>
        <div className={classes.column}>
          <Interpretation className={classes.interpretationChart} />
        </div>
        <div className={classes.column}>
          <CrossSectionDashboard wellId={wellId} />
          <LogDataCharts wellId={wellId} />
        </div>
      </Suspense>
    </div>
  );
}

export default StructuralGuidance;
