import React from "react";
import PropTypes from "prop-types";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./StructuralGuidance.scss";

export function CrossSectionDataCharts({ drillPhase }) {
  return <WidgetCard className={classes.crossSectionDataCard} title="Data" hideMenu />;
}

CrossSectionDataCharts.propTypes = {
  drillPhase: PropTypes.string
};

export default CrossSectionDataCharts;
