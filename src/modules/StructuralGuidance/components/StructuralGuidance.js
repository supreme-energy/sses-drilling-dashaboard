import React, { Suspense, lazy } from "react";
import Progress from "@material-ui/core/CircularProgress";
import Interpretation from "../../Interpretation";
import CrossSectionDataCharts from "./CrossSectionDataCharts";
import classes from "./StructuralGuidance.scss";
import { useWellIdContainer } from "../../App/Containers";

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
          <CrossSectionDataCharts />
        </div>
      </Suspense>
    </div>
  );
}

export default StructuralGuidance;
