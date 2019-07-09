import React from "react";
import PropTypes from "prop-types";
import { SelectedSectionProvider } from "../../App/Containers";
import Interpretation from "../../Interpretation";
import CrossSectionDashboard from "../../ComboDashboard/components/CrossSectionDashboard";
import CrossSectionDataCharts from "./CrossSectionDataCharts";
import classes from "./StructuralGuidance.scss";

export function StructuralGuidance({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <SelectedSectionProvider>
      <div className={classes.structuralGuidanceContainer}>
        <div className={classes.column}>
          <Interpretation className={classes.interpretationChart} />
        </div>
        <div className={classes.column}>
          <CrossSectionDashboard wellId={openedWellId} />
          <CrossSectionDataCharts />
        </div>
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
