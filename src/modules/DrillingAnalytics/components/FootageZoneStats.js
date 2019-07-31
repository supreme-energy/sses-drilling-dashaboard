import React from "react";
import PropTypes from "prop-types";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./DrillingAnalytics.scss";

export function FootageZoneStats({ drillPhase }) {
  return <WidgetCard className={classes.footageZoneStatsCard} title={`Footage Zone Stats ${drillPhase}`} hideMenu />;
}

FootageZoneStats.propTypes = {
  drillPhase: PropTypes.string
};

export default FootageZoneStats;
