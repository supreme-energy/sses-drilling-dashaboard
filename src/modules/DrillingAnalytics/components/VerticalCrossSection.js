import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import classes from "./DrillingAnalytics.scss";

export function VerticalCrossSection({ drillPhase }) {
  return (
    <WidgetCard className={classes.verticalCrossSectionCard} hideMenu>
      <Typography variant="subtitle1">{`${drillPhase} Cross Section`}</Typography>
    </WidgetCard>
  );
}

VerticalCrossSection.propTypes = {
  drillPhase: PropTypes.string
};

export default VerticalCrossSection;
