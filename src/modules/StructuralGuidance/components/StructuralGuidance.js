import React, { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import { SelectedSectionProvider } from "../../App/Containers";
import Interpretation from "../../Interpretation";
import CrossSectionDataCharts from "./CrossSectionDataCharts";
import classes from "./StructuralGuidance.scss";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "../../ComboDashboard/components/CrossSectionDashboard")
);

export function StructuralGuidance({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <SelectedSectionProvider>
      <div className={classes.structuralGuidanceContainer}>
        <Suspense fallback={<Progress />}>
          <div className={classes.column}>
            <Interpretation className={classes.interpretationChart} />
          </div>
          <div className={classes.column}>
            <CrossSectionDashboard wellId={openedWellId} />
            <CrossSectionDataCharts />
          </div>
        </Suspense>
      </div>
    </SelectedSectionProvider>
  );
}

StructuralGuidance.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default StructuralGuidance;
