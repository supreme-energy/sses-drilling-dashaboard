import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import classes from "./DrillingAnalytics.scss";

export function VerticalCrossSection({ drillPhase }) {
  return (
    <WidgetCard className={classes.verticalCrossSectionCard}>
      <Typography variant="subtitle1">{`${drillPhase} Cross Section`}</Typography>
      <VerticalMenu
        id="vertical-cross-section-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
    </WidgetCard>
  );
}

VerticalCrossSection.propTypes = {
  drillPhase: PropTypes.string
};

export default VerticalCrossSection;
