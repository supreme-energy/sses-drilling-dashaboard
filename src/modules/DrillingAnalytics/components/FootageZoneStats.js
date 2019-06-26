import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import classes from "./DrillingAnalytics.scss";

export function FootageZoneStats({ drillPhase }) {
  return (
    <WidgetCard className={classes.footageZoneStatsCard}>
      <Typography variant="subtitle1">{`Footage Zone Stats ${drillPhase}`}</Typography>
      <VerticalMenu
        id="footage-zone-stats-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
    </WidgetCard>
  );
}

FootageZoneStats.propTypes = {
  drillPhase: PropTypes.string
};

export default FootageZoneStats;
