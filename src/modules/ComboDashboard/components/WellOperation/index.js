import React from "react";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../../WidgetCard";
import classes from "./WellOperation.scss";

function WellOperation() {
  return (
    <WidgetCard className={classes.wellOperation} hideMenu>
      <Typography variant="subtitle1">Hours of Well Operation</Typography>
    </WidgetCard>
  );
}

export default WellOperation;
