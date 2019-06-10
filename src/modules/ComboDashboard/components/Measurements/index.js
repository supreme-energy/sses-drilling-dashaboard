import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../../WidgetCard";
import classes from "./Measurements.scss";

function Measurements() {
  return (
    <WidgetCard className={classes.measurements}>
      <Typography variant="subtitle1">Measurements</Typography>
    </WidgetCard>
  );
}

export default Measurements;
