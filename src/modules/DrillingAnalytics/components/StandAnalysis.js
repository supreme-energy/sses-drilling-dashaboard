import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import classes from "./DrillingAnalytics.scss";

export function StandAnalysis({ drillPhase }) {
  return (
    <WidgetCard className={classes.standAnalysisCard}>
      <Typography variant="subtitle1">Stand Analysis</Typography>
      <VerticalMenu
        id="stand-analysis-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
    </WidgetCard>
  );
}

StandAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default StandAnalysis;
