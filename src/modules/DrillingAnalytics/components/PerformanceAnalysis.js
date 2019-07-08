import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import classes from "./DrillingAnalytics.scss";

export function PerformanceAnalysis({ drillPhase }) {
  return (
    <WidgetCard className={classes.performanceAnalysisCard} hideMenu>
      <Typography variant="subtitle1">{`Performance Analysis Data ${drillPhase}`}</Typography>
    </WidgetCard>
  );
}

PerformanceAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default PerformanceAnalysis;
