import React from "react";
import Rop from "../ROP";
import classes from "./styles.scss";
import KPIGraphic from "../KPIGraphic";

export default function() {
  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <KPIGraphic className={classes.KPIGraphic} child={<Rop className={classes.ropChart} />} />
      </div>
      <div className={classes.right} />
    </div>
  );
}
