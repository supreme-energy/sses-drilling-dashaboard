import React from "react";

import WidgetCard from "../../../../components/WidgetCard";
import classes from "./ToolFace.scss";

function ToolFace() {
  return <WidgetCard className={classes.toolFace} title="Tool Face" hideMenu />;
}

export default ToolFace;
