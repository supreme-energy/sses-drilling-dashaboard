import React from "react";
import bottomHoleAssembly from "../../../../assets/BottomHoleAssembly.png";
import WidgetCard from "../../../../components/WidgetCard";
import classes from "./styles.scss";

export function BottomHoleAssembly() {
  return (
    <WidgetCard title="Bottom Hole Assembly Tendency" hideMenu>
      <img className={classes.bhaImg} src={bottomHoleAssembly} />
    </WidgetCard>
  );
}

export default BottomHoleAssembly;
