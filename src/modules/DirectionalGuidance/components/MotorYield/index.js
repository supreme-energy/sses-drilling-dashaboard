import React from "react";
import WidgetCard from "../../../../components/WidgetCard";
import MotorYieldImage from "../../../../assets/motorYield.png";
import classes from "./styles.scss";

export function MotorYield() {
  return (
    <WidgetCard title="Motor Yield" hideMenu>
      <img className={classes.motorYieldImg} src={MotorYieldImage} />
    </WidgetCard>
  );
}

export default MotorYield;
