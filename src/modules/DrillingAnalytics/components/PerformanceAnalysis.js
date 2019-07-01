import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import classes from "./DrillingAnalytics.scss";

export function PerformanceAnalysis({ drillPhase }) {
  return (
    <WidgetCard className={classes.performanceAnalysisCard}>
      <Typography variant="subtitle1">{`Performance Analysis Data ${drillPhase}`}</Typography>
      <VerticalMenu
        id="performance-analysis-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
    </WidgetCard>
  );
}

PerformanceAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default PerformanceAnalysis;
