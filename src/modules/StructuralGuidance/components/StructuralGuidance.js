import React from "react";
import PropTypes from "prop-types";
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
    <div className={classes.structuralGuidanceContainer}>
      <div className={classes.column}>
        <Interpretation />
      </div>
      <div className={classes.column}>
        <CrossSectionDashboard wellId={openedWellId} />
        <CrossSectionDataCharts />
      </div>
    </div>
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
