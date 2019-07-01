import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../../WidgetCard";
import classes from "./ToolFace.scss";

function ToolFace() {
  return (
    <WidgetCard className={classes.toolFace}>
      <Typography variant="subtitle1">Tool Face</Typography>
    </WidgetCard>
  );
}

export default ToolFace;
