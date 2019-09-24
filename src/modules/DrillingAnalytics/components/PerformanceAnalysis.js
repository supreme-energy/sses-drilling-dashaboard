import React from "react";
import PropTypes from "prop-types";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./DrillingAnalytics.scss";

export function PerformanceAnalysis({ drillPhase }) {
  return (
    <WidgetCard
      className={classes.performanceAnalysisCard}
      title={`Performance Analysis Data ${drillPhase}`}
      hideMenu
    />
  );
}

PerformanceAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default PerformanceAnalysis;
