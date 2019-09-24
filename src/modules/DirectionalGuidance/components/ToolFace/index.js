import React from "react";
import WidgetCard from "../../../../components/WidgetCard";
import toolFaceImg from "../../../../assets/toolFace.png";

import classes from "./styles.scss";

function ToolFace() {
  return (
    <WidgetCard title="Tool Face" hideMenu>
      <img className={classes.toolFaceImg} src={toolFaceImg} />
    </WidgetCard>
  );
}

export default ToolFace;
