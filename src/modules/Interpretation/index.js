import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import classes from "./Interpretation.scss";
import InterpretationChart from "./InterpretationChart";

function Interpretation() {
  return (
    <WidgetCard className={classes.interpretationContainer}>
      <Typography variant="subtitle1">Interpretation 1</Typography>
      <InterpretationChart className={classes.chart} />
    </WidgetCard>
  );
}

export default Interpretation;
