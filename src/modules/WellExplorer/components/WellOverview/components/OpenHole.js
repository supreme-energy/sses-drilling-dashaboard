import React from "react";
import classes from "./styles.scss";
import classNames from "classnames";

export default function OpenHole({ small, className }) {
  return <span className={classNames(className, classes.openHole, { [classes.small]: small })}>Open Hole</span>;
}
