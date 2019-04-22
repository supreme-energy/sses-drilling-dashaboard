import React from "react";
import classNames from "classnames";
import classes from "./styles.scss";
import { listIcons } from "../WellExplorer/components/IconsByStatus";

export default function WellStatus({ status, className }) {
  return (
    <div className={classNames(className, classes.status)}>
      <img className={classes.statusIcon} src={listIcons[status]} />
      <span>{status}</span>
    </div>
  );
}
