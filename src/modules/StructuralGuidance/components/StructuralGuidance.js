import React from "react";
import Interpretation from "../../Interpretation";
import CrossSectionDashboard from "../../ComboDashboard/components/CrossSectionDashboard";
import CrossSectionDataCharts from "./CrossSectionDataCharts";
import classes from "./StructuralGuidance.scss";
import { useWellIdContainer } from "../../App/Containers";

export function StructuralGuidance() {
  const { wellId } = useWellIdContainer();
  return (
    <div className={classes.structuralGuidanceContainer}>
      <div className={classes.column}>
        <Interpretation />
      </div>
      <div className={classes.column}>
        <CrossSectionDashboard wellId={wellId} />
        <CrossSectionDataCharts />
      </div>
    </div>
  );
}

export default StructuralGuidance;
