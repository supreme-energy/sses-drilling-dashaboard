import React from "react";
import css from "./styles.scss";
import classNames from "classnames";

export default function CondensedText({ className, ...props }) {
  return <span {...props} className={classNames(className, css.root)} />;
}
