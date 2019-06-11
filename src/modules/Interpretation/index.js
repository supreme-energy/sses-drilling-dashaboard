import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../WidgetCard";
import classes from "./Interpretation.scss";

function Interpretation() {
  return (
    <WidgetCard className={classes.interpretationGraph}>
      <Typography variant="subtitle1">Interpretation 1</Typography>
    </WidgetCard>
  );
}

export default Interpretation;
