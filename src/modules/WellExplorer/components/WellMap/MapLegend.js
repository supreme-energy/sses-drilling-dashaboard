import React from "react";
import classes from "./MapLegend.scss";
import Typography from "@material-ui/core/Typography";
import { listIcons } from "../IconsByStatus";
import { DRILLING, TRIPPING, UNKNOWN, COMPLETED } from "../../../../constants/drillingStatus";
import classNames from "classnames";

const Status = ({ status }) => (
  <div className={classes.status}>
    <img src={listIcons[status]} className={classes.statusIcon} />
    <Typography variant="body1">{status}</Typography>
  </div>
);

export default ({ className }) => {
  return (
    <div className={classNames(classes.legend, className)}>
      <Typography variant="subtitle1" gutterBottom>
        Legend
      </Typography>
      <Status status={DRILLING} />
      <Status status={TRIPPING} />
      <Status status={UNKNOWN} />
      <Status status={COMPLETED} />
    </div>
  );
};
