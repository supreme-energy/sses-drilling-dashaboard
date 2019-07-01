import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import { CURVE } from "../../../constants/wellSections";
import classes from "./DrillingAnalytics.scss";

export function SlideAnalysis({ drillPhase }) {
  const isRotation = drillPhase === CURVE ? "/ Rotation" : "";
  return (
    <WidgetCard className={classes.slideAnalysisCard}>
      <Typography variant="subtitle1">{`Slide ${isRotation} Analysis`}</Typography>
      <VerticalMenu
        id="slide-analysis-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
    </WidgetCard>
  );
}

SlideAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default SlideAnalysis;
