import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import classes from "./StructuralGuidance.scss";

export function CrossSectionDataCharts({ drillPhase }) {
  return (
    <WidgetCard className={classes.crossSectionDataCard} hideMenu>
      <Typography variant="subtitle1">Data</Typography>
    </WidgetCard>
  );
}

CrossSectionDataCharts.propTypes = {
  drillPhase: PropTypes.string
};

export default CrossSectionDataCharts;
