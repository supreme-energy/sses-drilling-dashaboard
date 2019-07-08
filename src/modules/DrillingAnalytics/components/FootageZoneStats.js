import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import classes from "./DrillingAnalytics.scss";

export function FootageZoneStats({ drillPhase }) {
  return (
    <WidgetCard className={classes.footageZoneStatsCard} hideMenu>
      <Typography variant="subtitle1">{`Footage Zone Stats ${drillPhase}`}</Typography>
    </WidgetCard>
  );
}

FootageZoneStats.propTypes = {
  drillPhase: PropTypes.string
};

export default FootageZoneStats;
